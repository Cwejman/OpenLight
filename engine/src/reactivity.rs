use crate::boundary;
use crate::engine::Inner;
use crate::protocol;
use db::{BranchName, ChunkId, Commit, Db, SubscribeOpts};
use std::collections::BTreeSet;
use std::sync::{Arc, Weak};
use std::time::Duration;
use tokio_stream::{Stream, StreamExt};

/// Subscribe to the active project's commit feed. Called synchronously at
/// mount time — the broadcast receiver must exist before the mount call
/// returns, or commits landing before the task's first poll would be lost.
pub(crate) fn commit_feed(db: &Db, branch: &BranchName) -> impl Stream<Item = Commit> {
    db.subscribe_scope(
        &[],
        SubscribeOpts {
            branch: branch.clone(),
        },
    )
}

/// The reactivity task: the engine's only consumer of the active project's
/// commit feed and the only emitter of `scope_changed` / `subscription_invalid`
/// events (engine.md, Key mechanics). Cleanup paths trigger it by writing
/// terminal commits; they never emit events directly.
pub(crate) async fn loop_task(
    inner: Weak<Inner>,
    stream: impl Stream<Item = Commit>,
    branch: BranchName,
    mut shutdown: tokio::sync::watch::Receiver<bool>,
) {
    tokio::pin!(stream);
    loop {
        let commit = tokio::select! {
            _ = shutdown.changed() => return,
            next = stream.next() => match next {
                Some(commit) => commit,
                None => return, // db dropped
            },
        };
        // Coalescing is required, not deferred (engine.md, Backpressure): the
        // streaming convention makes commit bursts normal. Drain the burst,
        // fire once with the latest commit.
        let mut batch = vec![commit];
        while let Ok(Some(next)) =
            tokio::time::timeout(Duration::from_millis(10), stream.next()).await
        {
            batch.push(next);
            if batch.len() >= 64 {
                break;
            }
        }
        let Some(inner) = inner.upgrade() else { return };
        handle_commits(&inner, &branch, &batch);
    }
}

fn handle_commits(inner: &Arc<Inner>, branch: &BranchName, batch: &[Commit]) {
    let touched = compute_touched(inner, branch, batch);
    let latest = batch.last().expect("batch is non-empty");
    fanout(inner, &touched, latest);
    if batch.iter().any(|c| !c.placements_modified.is_empty()) {
        invalidate_unreachable(inner, branch);
    }
}

/// The touched scope set (engine.md, Reactivity Wiring): modified chunks (each
/// itself a scope), both sides of modified placements, and — so a subscriber on
/// a parent scope sees a member's body change — the scopes each modified chunk
/// is currently placed on.
fn compute_touched(inner: &Arc<Inner>, branch: &BranchName, batch: &[Commit]) -> BTreeSet<String> {
    let mut touched = BTreeSet::new();
    for commit in batch {
        for chunk in &commit.chunks_modified {
            touched.insert(chunk.as_str().to_string());
            if let Ok(placements) = inner.mounts.placements_of(chunk, branch) {
                for p in placements {
                    touched.insert(p.scope_id.as_str().to_string());
                }
            }
        }
        for (chunk, scope) in &commit.placements_modified {
            touched.insert(chunk.as_str().to_string());
            touched.insert(scope.as_str().to_string());
        }
    }
    touched
}

/// Fire `scope_changed` on every subscription whose scopes intersect the
/// touched set. Sends are non-blocking; a slow transport gets a final `lagged`
/// best-effort and its subscription dropped (engine.md, Backpressure).
fn fanout(inner: &Arc<Inner>, touched: &BTreeSet<String>, latest: &Commit) {
    for sub in inner.subscriptions.snapshot() {
        if !sub.scopes.iter().any(|s| touched.contains(s.as_str())) {
            continue;
        }
        let event = protocol::scope_changed_event(&sub.id, latest);
        match sub.transport.try_send(event) {
            Ok(()) => {}
            Err(tokio::sync::mpsc::error::TrySendError::Full(_)) => {
                let _ = sub
                    .transport
                    .try_send(protocol::lagged_event(std::slice::from_ref(&sub.id)));
                inner.subscriptions.remove(&sub.id);
            }
            Err(tokio::sync::mpsc::error::TrySendError::Closed(_)) => {
                inner.subscriptions.remove(&sub.id);
            }
        }
    }
}

/// Reachability is dynamic even though boundaries are immutable: a placement
/// removal elsewhere can sever the path from a process's boundary to a
/// subscribed scope. The dumb recompute-all is engine.md's sanctioned v0.1 shape.
fn invalidate_unreachable(inner: &Arc<Inner>, branch: &BranchName) {
    for sub in inner.subscriptions.snapshot() {
        let Ok(bctx) = inner.resolve_boundaries(&crate::types::Context {
            process_id: Some(sub.process.clone()),
        }) else {
            continue; // process already terminal; cleanup owns the removal
        };
        let dead_scope = sub.scopes.iter().find(|scope| {
            !boundary::can_open(&inner.mounts, &bctx.read, bctx.process.as_ref(), scope, branch)
                .unwrap_or(false)
        });
        if let Some(scope) = dead_scope {
            let reason = reason_for(inner, scope, branch);
            inner.subscriptions.remove(&sub.id);
            let _ = sub
                .transport
                .try_send(protocol::subscription_invalid_event(&sub.id, reason));
        }
    }
}

fn reason_for(inner: &Arc<Inner>, scope: &ChunkId, branch: &BranchName) -> &'static str {
    match inner.mounts.chunk_exists(scope, branch) {
        Ok(false) => "scope removed",
        _ => "scope unreachable",
    }
}
