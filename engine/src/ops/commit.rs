use crate::boundary::{self, BoundaryCtx};
use crate::engine::{Engine, Inner};
use crate::errors::EngineError;
use crate::types::{Context, DryRunResult, ProcessId};
use crate::validate;
use db::{ChunkId, Commit, CommitOpts, Declaration};
use std::collections::HashSet;

impl Engine {
    /// Write a Declaration through the full gate: protected chunks, read-only
    /// mounts, write boundary, federated spec validation — then the active
    /// db's commit (its local validation is the backstop).
    pub fn commit(&self, ctx: &Context, declaration: Declaration) -> Result<Commit, EngineError> {
        let inner = &self.inner;
        let bctx = inner.resolve_boundaries(ctx)?;
        let active = inner.mounts.active()?;
        check_declaration(inner, &bctx, &declaration)?;
        let mut declaration = declaration;
        inner.mounts.add_anchors(&mut declaration)?;
        let opts = CommitOpts {
            branch: active.branch.clone(),
            process_id: bctx.process.as_ref().map(|p| p.as_str().to_string()),
        };
        Ok(active.db.commit(&declaration, opts)?)
    }

    /// Full validation without writing — the live-form affordance. Collects
    /// every engine-level error; db-level validation runs only on real commits.
    pub fn commit_dry_run(&self, ctx: &Context, declaration: &Declaration) -> DryRunResult {
        let inner = &self.inner;
        let errors: Vec<EngineError> = match inner.resolve_boundaries(ctx) {
            Err(e) => vec![e],
            Ok(bctx) => collect_errors(inner, &bctx, declaration),
        };
        DryRunResult {
            valid: errors.is_empty(),
            errors,
        }
    }
}

fn check_declaration(
    inner: &Inner,
    bctx: &BoundaryCtx,
    decl: &Declaration,
) -> Result<(), EngineError> {
    match collect_errors(inner, bctx, decl).into_iter().next() {
        Some(e) => Err(e),
        None => Ok(()),
    }
}

fn collect_errors(inner: &Inner, bctx: &BoundaryCtx, decl: &Declaration) -> Vec<EngineError> {
    let mut errors = Vec::new();
    if let Some(e) = check_protected(inner, decl) {
        errors.push(e);
    }
    match inner.mounts.read_only_conflict(decl) {
        Ok(Some(conflict)) => errors.push(EngineError::ReadOnlyMount(conflict)),
        Ok(None) => {}
        Err(e) => errors.push(e),
    }
    if let Err(e) = check_write_boundary(inner, bctx, decl) {
        errors.push(e);
    }
    let branch = match inner.mounts.active() {
        Ok(active) => active.branch,
        Err(e) => {
            errors.push(e);
            return errors;
        }
    };
    if let Err(e) = validate::check_declaration(&inner.mounts, decl, &branch) {
        errors.push(e);
    }
    errors
}

/// Protected chunks (engine.md #boundaries): a run's contract — its process
/// chunk and boundary chunks — is fixed at spawn, immutable during execution.
/// Enforced for every active run: writes into a process scope stay legal;
/// rewriting a process chunk or touching a boundary chunk's topology does not.
fn check_protected(inner: &Inner, decl: &Declaration) -> Option<EngineError> {
    let (process_ids, boundary_ids) = protected_sets(inner);
    for chunk in &decl.chunks {
        let Some(id) = &chunk.id else { continue };
        if process_ids.contains(id.as_str()) {
            return Some(protected_error("process chunk", id));
        }
        if boundary_ids.contains(id.as_str()) {
            return Some(protected_error("boundary chunk", id));
        }
    }
    for placement in &decl.placements {
        if boundary_ids.contains(placement.scope.as_str()) {
            return Some(protected_error("boundary chunk", &placement.scope));
        }
        if boundary_ids.contains(placement.chunk.as_str()) {
            return Some(protected_error("boundary chunk", &placement.chunk));
        }
        if process_ids.contains(placement.chunk.as_str()) {
            return Some(protected_error("process chunk", &placement.chunk));
        }
        // placement.scope being a process chunk is the normal path: programs
        // write results into their own process scope.
    }
    None
}

fn protected_sets(inner: &Inner) -> (HashSet<String>, HashSet<String>) {
    let processes = inner.processes.lock().unwrap();
    let mut process_ids = HashSet::new();
    let mut boundary_ids = HashSet::new();
    for (pid, slot) in processes.iter() {
        process_ids.insert(pid.as_str().to_string());
        for id in &slot.config.protected {
            if id != pid {
                boundary_ids.insert(id.as_str().to_string());
            }
        }
    }
    (process_ids, boundary_ids)
}

fn protected_error(kind: &str, id: &ChunkId) -> EngineError {
    EngineError::BoundaryViolation(format!("{kind} {id} is engine domain — fixed for the run"))
}

/// Every placement lands content in its scope; every chunk declaration naming
/// an existing chunk modifies it. Both must fall within the write boundary
/// (the caller's own process scope is implicitly within it).
fn check_write_boundary(
    inner: &Inner,
    bctx: &BoundaryCtx,
    decl: &Declaration,
) -> Result<(), EngineError> {
    if bctx.write.is_universal() {
        return Ok(());
    }
    let branch = inner.mounts.active()?.branch;
    let process: Option<&ProcessId> = bctx.process.as_ref();
    for placement in &decl.placements {
        if !boundary::can_open(&inner.mounts, &bctx.write, process, &placement.scope, &branch)? {
            return Err(EngineError::BoundaryViolation(format!(
                "scope {} is outside the write boundary",
                placement.scope
            )));
        }
    }
    for chunk in &decl.chunks {
        let Some(id) = &chunk.id else { continue };
        if !inner.mounts.chunk_exists(id, &branch)? {
            continue; // a new chunk touches no existing scope by itself
        }
        if !boundary::can_read_chunk(&inner.mounts, &bctx.write, process, id, &branch)? {
            return Err(EngineError::BoundaryViolation(format!(
                "chunk {id} is outside the write boundary"
            )));
        }
    }
    Ok(())
}
