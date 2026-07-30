use crate::boundary;
use crate::engine::Engine;
use crate::errors::EngineError;
use crate::types::{archetypes, AwaitOpts, Context, ProcessId};
use db::{ChunkId, Includes, PlacementType, ScopeOpts, ScopeResult};
use std::collections::{HashMap, HashSet};

impl Engine {
    /// Wait for processes to reach a terminal state; returns each process's
    /// final scope. Suspends the calling task, never the engine. The caller's
    /// timeout clock pauses for the duration (engine.md, Timeouts). Resolution
    /// reads the slot's watch while active, the substrate once the slot is gone.
    pub async fn await_processes(
        &self,
        ctx: &Context,
        ids: &[ProcessId],
        opts: AwaitOpts,
    ) -> Result<HashMap<ProcessId, ScopeResult>, EngineError> {
        let inner = self.inner.clone();
        let bctx = inner.resolve_boundaries(ctx)?;
        let branch = inner.mounts.active()?.branch;

        let mut waiters = Vec::new();
        for id in ids {
            if let Some(caller) = &bctx.process {
                let authorized = inner.is_descendant(id, caller)
                    || boundary::can_read_chunk(&inner.mounts, &bctx.read, Some(caller), id, &branch)?;
                if !authorized {
                    return Err(EngineError::BoundaryViolation(format!(
                        "process {id} is not reachable from the read boundary"
                    )));
                }
            }
            match inner.slot_status(id) {
                Some(rx) => waiters.push(rx),
                None => {
                    // Slot gone: the substrate is authoritative — the chunk must
                    // exist. A non-terminal status without a slot is a stale peer
                    // record; it has no watcher to resolve and reads as-is.
                    let include = Includes {
                        chunk_body: true,
                        ..Includes::default()
                    };
                    inner
                        .mounts
                        .federated_get(id, include, &branch, None)?
                        .ok_or_else(|| EngineError::NotFound(format!("process {id}")))?;
                }
            }
        }

        if let Some(caller) = &bctx.process {
            inner.pause_timeout(caller);
        }
        for mut rx in waiters {
            // An Err means the sender dropped — the slot was removed, which only
            // happens after the terminal transition; the substrate has the state.
            let _ = rx.wait_for(|status| status.is_terminal()).await;
        }
        if let Some(caller) = &bctx.process {
            inner.resume_timeout(caller);
        }

        let read_opts = ScopeOpts {
            branch: branch.clone(),
            include: Includes {
                chunk_name: true,
                chunk_spec: true,
                chunk_body: true,
                chunk_placements: true,
                intersection_chunks: true,
                dimensions: true,
                ..Includes::default()
            },
            ..ScopeOpts::default()
        };
        let mut results = HashMap::new();
        for id in ids {
            let mut scope = self.scope(ctx, std::slice::from_ref(id), read_opts.clone())?;
            if opts.results_only {
                filter_results_only(&self.inner, &mut scope, &branch)?;
            }
            results.insert(id.clone(), scope);
        }
        Ok(results)
    }
}

/// Keep chunks `instance` on result-role archetypes — a scope that is (or is
/// transitively instance of) `programs/result`. Counts stay whole (engine.md:
/// "plus counts").
fn filter_results_only(
    inner: &crate::engine::Inner,
    scope: &mut ScopeResult,
    branch: &db::BranchName,
) -> Result<(), EngineError> {
    let mut result_scopes: HashSet<String> = HashSet::new();
    let mut checked: HashMap<String, bool> = HashMap::new();
    let mut kept = Vec::new();
    for chunk in scope.chunks.drain(..) {
        let placements = chunk.placements.clone().unwrap_or_default();
        let mut is_result = false;
        for p in placements
            .iter()
            .filter(|p| p.type_ == PlacementType::Instance)
        {
            let scope_id = p.scope_id.as_str().to_string();
            let hit = match checked.get(&scope_id) {
                Some(hit) => *hit,
                None => {
                    let hit = scope_id == archetypes::PROGRAMS_RESULT
                        || is_result_archetype(inner, &p.scope_id, branch)?;
                    checked.insert(scope_id.clone(), hit);
                    hit
                }
            };
            if hit {
                result_scopes.insert(scope_id);
                is_result = true;
            }
        }
        if is_result {
            kept.push(chunk);
        }
    }
    scope.chunks = kept;
    Ok(())
}

fn is_result_archetype(
    inner: &crate::engine::Inner,
    scope: &ChunkId,
    branch: &db::BranchName,
) -> Result<bool, EngineError> {
    let mut seen: HashSet<String> = HashSet::new();
    let mut frontier = vec![scope.clone()];
    while let Some(current) = frontier.pop() {
        if current.as_str() == archetypes::PROGRAMS_RESULT {
            return Ok(true);
        }
        if !seen.insert(current.as_str().to_string()) {
            continue;
        }
        frontier.extend(inner.mounts.instance_parents(&current, branch)?);
    }
    Ok(false)
}
