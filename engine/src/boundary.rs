use crate::errors::EngineError;
use crate::mounts::MountRegistry;
use crate::types::{archetypes, Context, EffectiveBoundary, ProcessId};
use db::{BranchName, ChunkId};
use std::collections::HashSet;

/// The resolved identity a request acts as: its boundaries and (for process
/// contexts) the process whose scope tree is implicitly reachable.
#[derive(Debug, Clone)]
pub(crate) struct BoundaryCtx {
    pub process: Option<ProcessId>,
    pub read: EffectiveBoundary,
    pub write: EffectiveBoundary,
}

impl BoundaryCtx {
    pub fn host() -> BoundaryCtx {
        BoundaryCtx {
            process: None,
            read: EffectiveBoundary::universal(),
            write: EffectiveBoundary::universal(),
        }
    }
}

impl crate::engine::Inner {
    /// `None` = host-initiated: full reach (engine.md, Engine API). `Some` reads
    /// the live slot — the slot is authoritative while the process is active
    /// (engine.md, State authority follows lifecycle).
    pub(crate) fn resolve_boundaries(&self, ctx: &Context) -> Result<BoundaryCtx, EngineError> {
        match &ctx.process_id {
            None => Ok(BoundaryCtx::host()),
            Some(pid) => {
                let processes = self.processes.lock().unwrap();
                let slot = processes.get(pid).ok_or_else(|| {
                    EngineError::NotFound(format!("process {pid} is not active"))
                })?;
                Ok(BoundaryCtx {
                    process: Some(pid.clone()),
                    read: slot.config.read.clone(),
                    write: slot.config.write.clone(),
                })
            }
        }
    }
}

/// Can this identity open `target` as a scope? The walk is the instance chain
/// (engine.md #boundaries): target -> instance parents -> ... -> a boundary
/// root. The process's own id is implicitly a root in both boundaries. Virtual
/// scopes have no instance chain into the field; they are openable only when
/// granted literally as roots (chosen reading — engine.md is silent; explicit
/// grant is the fail-closed one), except `engine/mount:X` which chains to
/// `engine/mount`.
pub(crate) fn can_open(
    reg: &MountRegistry,
    boundary: &EffectiveBoundary,
    process: Option<&ProcessId>,
    target: &ChunkId,
    branch: &BranchName,
) -> Result<bool, EngineError> {
    if boundary.is_universal() {
        return Ok(true);
    }
    if let Some(pid) = process {
        let own: Vec<ChunkId> = vec![pid.clone()];
        if instance_reach(reg, target, &own, branch)? {
            return Ok(true);
        }
    }
    for set in &boundary.sets {
        if !instance_reach(reg, target, set, branch)? {
            return Ok(false);
        }
    }
    Ok(true)
}

/// Can this identity read `target` as a chunk? Openable, or placed (instance or
/// relates alike) on an openable scope — "once a scope is opened, everything
/// placed on it is visible" (engine.md #boundaries).
pub(crate) fn can_read_chunk(
    reg: &MountRegistry,
    boundary: &EffectiveBoundary,
    process: Option<&ProcessId>,
    target: &ChunkId,
    branch: &BranchName,
) -> Result<bool, EngineError> {
    if can_open(reg, boundary, process, target, branch)? {
        return Ok(true);
    }
    for placement in reg.placements_of(target, branch)? {
        if can_open(reg, boundary, process, &placement.scope_id, branch)? {
            return Ok(true);
        }
    }
    Ok(false)
}

/// Walk up the instance chain from `target` until a root in `roots` is met.
fn instance_reach(
    reg: &MountRegistry,
    target: &ChunkId,
    roots: &[ChunkId],
    branch: &BranchName,
) -> Result<bool, EngineError> {
    let root_set: HashSet<&str> = roots.iter().map(|r| r.as_str()).collect();
    let mut seen: HashSet<String> = HashSet::new();
    let mut frontier = vec![target.clone()];
    while let Some(current) = frontier.pop() {
        if root_set.contains(current.as_str()) {
            return Ok(true);
        }
        if !seen.insert(current.as_str().to_string()) {
            continue;
        }
        if archetypes::is_mount_instance(current.as_str()) {
            frontier.push(ChunkId::from(archetypes::ENGINE_MOUNT));
            continue;
        }
        if archetypes::is_virtual(current.as_str()) {
            continue; // no chain into the field; must be a literal root
        }
        frontier.extend(reg.instance_parents(&current, branch)?);
    }
    Ok(false)
}
