use crate::engine::{Engine, Inner};
use crate::errors::EngineError;
use crate::mounts::MountRegistry;
use crate::process::{ProcessSlot, RunConfig, TimeoutState};
use crate::runtime::{ProgramRef, RuntimeHandle, SpawnContext, TerminalReason};
use crate::types::{
    archetypes, BoundarySpec, Context, ProcessId, ProcessStatus, RunArgs, RunMode,
};
use crate::validate;
use db::{
    BranchName, ChunkDeclaration, ChunkId, CommitOpts, Declaration, Includes, PlacementSpec,
    PlacementType,
};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::watch;

const DEFAULT_TIMEOUT_MS: u64 = 30_000;

impl Engine {
    /// Start a program run: slot before substrate write (so cancel and timeout
    /// always land on a known id), one atomic creation commit, provider spawn,
    /// readiness wired to status (engine.md, Run and Await Mechanics).
    pub fn run(&self, ctx: &Context, args: RunArgs) -> Result<ProcessId, EngineError> {
        let inner = &self.inner;
        let bctx = inner.resolve_boundaries(ctx)?;
        let active = inner.mounts.active()?;
        let branch = active.branch.clone();

        // Program lookup. Running is not a substrate read: engine.md's
        // tool-call flow puts no read-boundary requirement on the program
        // chunk — the child's effective boundary (intersected with the
        // caller's) is what contains the run.
        let include = Includes {
            chunk_name: true,
            chunk_body: true,
            ..Includes::default()
        };
        let (program_item, _) = inner
            .mounts
            .federated_get(&args.program_id, include, &branch, None)?
            .ok_or_else(|| EngineError::NotFound(format!("program {}", args.program_id)))?;
        let program = ProgramRef::from_chunk(&program_item)?;
        let provider = inner.runtimes.lookup(&program.runtime).ok_or_else(|| {
            EngineError::InvalidRequest(format!("no runtime provider for '{}'", program.runtime.0))
        })?;

        // Boundaries: effective = run-level ∩ program intrinsic ∩ caller chain.
        let read_roots = resolve_roots(&inner.mounts, &args.read_boundary, &branch)?;
        let write_roots = resolve_roots(&inner.mounts, &args.write_boundary, &branch)?;
        let mut read = bctx.read.narrowed(read_roots.clone());
        let mut write = bctx.write.narrowed(write_roots.clone());
        if let Some(intrinsic) = intrinsic_roots(&inner.mounts, &args.program_id, archetypes::READ_BOUNDARY, &branch)? {
            read = read.narrowed(intrinsic);
        }
        if let Some(intrinsic) = intrinsic_roots(&inner.mounts, &args.program_id, archetypes::WRITE_BOUNDARY, &branch)? {
            write = write.narrowed(intrinsic);
        }

        let placements = process_placements(inner, &bctx.process, &args, &branch)?;
        let timeout_ms = args
            .timeout_ms
            .or_else(|| program_item.body.as_ref()?.get("timeout_ms")?.as_u64())
            .unwrap_or(DEFAULT_TIMEOUT_MS);

        let pid: ProcessId = ChunkId(ulid::Ulid::new().to_string());
        let read_chunk = boundary_chunk_id(&args.read_boundary);
        let write_chunk = boundary_chunk_id(&args.write_boundary);

        // Slot before the substrate write.
        let (status_tx, _) = watch::channel(ProcessStatus::Pending);
        let slot = ProcessSlot {
            status: status_tx,
            transport: None,
            watchers: Vec::new(),
            timeout: TimeoutState {
                remaining_ms: timeout_ms,
                running_since: None,
                await_depth: 0,
                task: None,
            },
            config: RunConfig {
                program_id: args.program_id.clone(),
                parent: match args.mode {
                    RunMode::Child => bctx.process.clone(),
                    RunMode::Launch => None,
                },
                read,
                write,
                protected: vec![pid.clone(), read_chunk.clone(), write_chunk.clone()],
            },
        };
        inner.processes.lock().unwrap().insert(pid.clone(), slot);
        inner.start_timeout(&pid);

        // One atomic creation commit; failure unwinds the slot.
        let mut declaration = assemble_declaration(
            &pid, &read_chunk, &write_chunk, &args, &program, &placements, &read_roots,
            &write_roots, timeout_ms,
        );
        let created = validate::check_declaration(&inner.mounts, &declaration, &branch)
            .and_then(|()| match inner.mounts.read_only_conflict(&declaration)? {
                Some(conflict) => Err(EngineError::ReadOnlyMount(conflict)),
                None => Ok(()),
            })
            .and_then(|()| inner.mounts.add_anchors(&mut declaration))
            .and_then(|()| {
                let opts = CommitOpts {
                    branch: branch.clone(),
                    process_id: bctx.process.as_ref().map(|p| p.as_str().to_string()),
                };
                Ok(active.db.commit(&declaration, opts)?)
            });
        if let Err(e) = created {
            remove_slot(inner, &pid);
            return Err(e);
        }

        // A cancel or timeout that raced the commit flipped the watch already;
        // the substrate chunk now exists, so settle its terminal record and skip spawn.
        if let Some((status, error)) = inner.take_tombstone(&pid) {
            inner.write_process_status(&pid, status, error.as_deref());
            return Ok(pid);
        }

        match provider.spawn(SpawnContext {
            process_id: pid.clone(),
            program,
            request_tx: inner.request_tx.clone(),
        }) {
            Ok(handle) => wire_runtime(inner, &pid, handle),
            Err(e) => {
                inner.set_terminal(&pid, ProcessStatus::Failed, Some(&format!("spawn failed: {e}")));
            }
        }
        Ok(pid)
    }
}

fn resolve_roots(
    reg: &MountRegistry,
    spec: &BoundarySpec,
    branch: &BranchName,
) -> Result<Vec<ChunkId>, EngineError> {
    match spec {
        BoundarySpec::Roots(roots) => Ok(roots.clone()),
        BoundarySpec::Existing(chunk) => {
            if !reg.chunk_exists(chunk, branch)? {
                return Err(EngineError::NotFound(format!("boundary chunk {chunk}")));
            }
            relates_members(reg, chunk, branch)
        }
    }
}

/// Chunks placed relates on `scope` — the roots a boundary chunk grants.
fn relates_members(
    reg: &MountRegistry,
    scope: &ChunkId,
    branch: &BranchName,
) -> Result<Vec<ChunkId>, EngineError> {
    let mut out = Vec::new();
    for mount in reg.snapshot() {
        let opts = db::ScopeOpts {
            branch: mount.read_branch(branch),
            include: Includes {
                intersection_chunks: true,
                chunk_placements: true,
                ..Includes::default()
            },
            ..db::ScopeOpts::default()
        };
        let result = mount.db.scope(std::slice::from_ref(scope), opts)?;
        for chunk in result.chunks {
            let is_relates = chunk
                .placements
                .unwrap_or_default()
                .iter()
                .any(|p| p.scope_id == *scope && p.type_ == PlacementType::Relates);
            if is_relates && !out.contains(&chunk.id) {
                out.push(chunk.id);
            }
        }
    }
    Ok(out)
}

/// A program's intrinsic boundary: a chunk instance on the boundary archetype,
/// placed relates on the program; its relates members are the roots. Absence
/// means the program is open (engine.md #boundaries).
fn intrinsic_roots(
    reg: &MountRegistry,
    program: &ChunkId,
    archetype: &str,
    branch: &BranchName,
) -> Result<Option<Vec<ChunkId>>, EngineError> {
    for candidate in relates_members(reg, program, branch)? {
        let is_boundary = reg
            .instance_parents(&candidate, branch)?
            .iter()
            .any(|p| p.as_str() == archetype);
        if is_boundary {
            return Ok(Some(relates_members(reg, &candidate, branch)?));
        }
    }
    Ok(None)
}

/// Where the new process is placed beyond program + engine/process: the
/// caller's explicit scopes, plus the trace parent in child mode, or — for
/// launch — the caller's own session scopes (its non-structural instance
/// placements), so the detached process survives the caller (engine.md, run modes).
fn process_placements(
    inner: &Inner,
    caller: &Option<ProcessId>,
    args: &RunArgs,
    branch: &BranchName,
) -> Result<Vec<ChunkId>, EngineError> {
    let mut placements = args.placements.clone();
    let Some(caller_pid) = caller else {
        return Ok(placements);
    };
    match args.mode {
        RunMode::Child => {
            if !placements.contains(caller_pid) {
                placements.push(caller_pid.clone());
            }
        }
        RunMode::Launch => {
            let structural: Vec<ChunkId> = {
                let processes = inner.processes.lock().unwrap();
                let config = &processes
                    .get(caller_pid)
                    .expect("caller slot verified by resolve_boundaries")
                    .config;
                let mut s = vec![config.program_id.clone(), ChunkId::from(archetypes::ENGINE_PROCESS)];
                s.extend(config.parent.clone());
                s
            };
            for scope in inner.mounts.instance_parents(caller_pid, branch)? {
                if !structural.contains(&scope) && !placements.contains(&scope) {
                    placements.push(scope);
                }
            }
        }
    }
    Ok(placements)
}

fn boundary_chunk_id(spec: &BoundarySpec) -> ChunkId {
    match spec {
        BoundarySpec::Roots(_) => ChunkId(ulid::Ulid::new().to_string()),
        BoundarySpec::Existing(id) => id.clone(),
    }
}

/// The single atomic creation commit (engine.md, Process Creation): process
/// chunk, boundary chunks with their roots relates by identity, argument
/// chunks instanced on the process.
#[allow(clippy::too_many_arguments)]
fn assemble_declaration(
    pid: &ProcessId,
    read_chunk: &ChunkId,
    write_chunk: &ChunkId,
    args: &RunArgs,
    program: &ProgramRef,
    placements: &[ChunkId],
    read_roots: &[ChunkId],
    write_roots: &[ChunkId],
    timeout_ms: u64,
) -> Declaration {
    let started = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);
    let mut chunks = vec![ChunkDeclaration {
        id: Some(pid.clone()),
        body: Some(serde_json::json!({
            "status": ProcessStatus::Pending.as_str(),
            "started": started,
            "timeout_ms": timeout_ms,
            "capabilities": program.capabilities,
        })),
        ..ChunkDeclaration::default()
    }];
    let mut placement_specs: Vec<PlacementSpec> = Vec::new();
    let instance = |chunk: &ChunkId, scope: &ChunkId| PlacementSpec {
        chunk: chunk.clone(),
        scope: scope.clone(),
        type_: PlacementType::Instance,
        seq: None,
        active: true,
    };
    let relates = |chunk: &ChunkId, scope: &ChunkId| PlacementSpec {
        chunk: chunk.clone(),
        scope: scope.clone(),
        type_: PlacementType::Relates,
        seq: None,
        active: true,
    };

    placement_specs.push(instance(pid, &args.program_id));
    placement_specs.push(instance(pid, &ChunkId::from(archetypes::ENGINE_PROCESS)));
    for scope in placements {
        placement_specs.push(instance(pid, scope));
    }

    let mut boundary = |chunk_id: &ChunkId, spec: &BoundarySpec, archetype: &str, roots: &[ChunkId]| {
        match spec {
            BoundarySpec::Roots(_) => {
                chunks.push(ChunkDeclaration {
                    id: Some(chunk_id.clone()),
                    body: Some(serde_json::json!({})),
                    ..ChunkDeclaration::default()
                });
                placement_specs.push(instance(chunk_id, &ChunkId::from(archetype)));
                placement_specs.push(relates(chunk_id, pid));
                for root in roots {
                    placement_specs.push(relates(root, chunk_id));
                }
            }
            BoundarySpec::Existing(_) => {
                // The named boundary chunk relates on the process directly —
                // no fresh chunk, no root rewrites.
                placement_specs.push(relates(chunk_id, pid));
            }
        }
    };
    boundary(read_chunk, &args.read_boundary, archetypes::READ_BOUNDARY, read_roots);
    boundary(write_chunk, &args.write_boundary, archetypes::WRITE_BOUNDARY, write_roots);

    for arg in &args.chunks {
        let id = arg
            .id
            .clone()
            .unwrap_or_else(|| ChunkId(ulid::Ulid::new().to_string()));
        let mut declared = arg.clone();
        declared.id = Some(id.clone());
        chunks.push(declared);
        placement_specs.push(instance(&id, pid));
    }

    Declaration {
        chunks,
        placements: placement_specs,
        message: Some(format!("run {}", args.program_id)),
    }
}

fn wire_runtime(inner: &Arc<Inner>, pid: &ProcessId, handle: RuntimeHandle) {
    let RuntimeHandle {
        transport,
        ready,
        terminal,
    } = handle;
    let ready_task = {
        let weak = Arc::downgrade(inner);
        let pid = pid.clone();
        inner.handle.spawn(async move {
            if ready.await.is_err() {
                return; // provider dropped readiness; terminal watcher decides
            }
            let Some(inner) = weak.upgrade() else { return };
            let flipped = {
                let processes = inner.processes.lock().unwrap();
                processes
                    .get(&pid)
                    .map(|slot| {
                        let pending = *slot.status.borrow() == ProcessStatus::Pending;
                        if pending {
                            let _ = slot.status.send(ProcessStatus::Running);
                        }
                        pending
                    })
                    .unwrap_or(false)
            };
            if flipped {
                inner.write_process_status(&pid, ProcessStatus::Running, None);
            }
        })
    };
    let terminal_task = {
        let weak = Arc::downgrade(inner);
        let pid = pid.clone();
        inner.handle.spawn(async move {
            let reason = terminal.await;
            let Some(inner) = weak.upgrade() else { return };
            match reason {
                Ok(TerminalReason::Completed) => {
                    inner.set_terminal(&pid, ProcessStatus::Completed, None)
                }
                Ok(TerminalReason::Failed(error)) => {
                    inner.set_terminal(&pid, ProcessStatus::Failed, Some(&error))
                }
                // Provider dropped the sender without a verdict: the runtime is
                // gone and its exit is unreadable (engine.md, error table).
                Err(_) => inner.set_terminal(&pid, ProcessStatus::Failed, Some("killed")),
            }
        })
    };
    let mut processes = inner.processes.lock().unwrap();
    if let Some(slot) = processes.get_mut(pid) {
        slot.transport = Some(transport);
        slot.watchers.push(ready_task);
        slot.watchers.push(terminal_task);
    } else {
        // Terminal raced the spawn; the transport drop below kills the runtime.
        ready_task.abort();
        terminal_task.abort();
    }
}

fn remove_slot(inner: &Inner, pid: &ProcessId) {
    let mut processes = inner.processes.lock().unwrap();
    if let Some(slot) = processes.remove(pid) {
        if let Some(task) = slot.timeout.task {
            task.abort();
        }
    }
}
