use crate::engine::Inner;
use crate::runtime::TransportRef;
use crate::types::{EffectiveBoundary, ProcessId, ProcessStatus};
use db::{ChunkDeclaration, ChunkId, CommitOpts, Declaration, Includes, ReadOpts};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::watch;
use tokio::task::JoinHandle;

/// Live runtime state for one active process. The slot is authoritative while
/// the process is active; the substrate becomes authoritative once the slot is
/// gone — authority transfers in the cleanup commit (engine.md, Key mechanics).
pub(crate) struct ProcessSlot {
    pub status: watch::Sender<ProcessStatus>,
    pub transport: Option<TransportRef>,
    pub watchers: Vec<JoinHandle<()>>,
    pub timeout: TimeoutState,
    pub config: RunConfig,
}

#[derive(Debug, Clone)]
pub(crate) struct RunConfig {
    pub program_id: ChunkId,
    pub parent: Option<ProcessId>,
    pub read: EffectiveBoundary,
    pub write: EffectiveBoundary,
    /// The run's contract chunks — process + boundary chunks — protected from
    /// program writes for the run's lifetime.
    pub protected: Vec<ChunkId>,
}

/// The timeout clock pauses while the process has a pending await on its
/// children (engine.md, Timeouts) — `await_depth` counts overlapping awaits.
pub(crate) struct TimeoutState {
    pub remaining_ms: u64,
    pub running_since: Option<Instant>,
    pub await_depth: u32,
    pub task: Option<JoinHandle<()>>,
}

impl Inner {
    pub(crate) fn slot_status(&self, pid: &ProcessId) -> Option<watch::Receiver<ProcessStatus>> {
        self.processes
            .lock()
            .unwrap()
            .get(pid)
            .map(|slot| slot.status.subscribe())
    }

    pub(crate) fn slot_transport(&self, pid: &ProcessId) -> Option<TransportRef> {
        self.processes
            .lock()
            .unwrap()
            .get(pid)
            .and_then(|slot| slot.transport.clone())
    }

    /// Is `target` a descendant of `ancestor` in the live trace (child-mode
    /// parent chain)? Used by cancel authority and await authorization.
    pub(crate) fn is_descendant(&self, target: &ProcessId, ancestor: &ProcessId) -> bool {
        let processes = self.processes.lock().unwrap();
        let mut current = target.clone();
        loop {
            let Some(slot) = processes.get(&current) else {
                return false;
            };
            match &slot.config.parent {
                Some(parent) if parent == ancestor => return true,
                Some(parent) => current = parent.clone(),
                None => return false,
            }
        }
    }

    pub(crate) fn start_timeout(self: &Arc<Self>, pid: &ProcessId) {
        let remaining = {
            let mut processes = self.processes.lock().unwrap();
            let Some(slot) = processes.get_mut(pid) else { return };
            slot.timeout.running_since = Some(Instant::now());
            slot.timeout.remaining_ms
        };
        let task = spawn_timeout(self, pid.clone(), remaining);
        if let Some(slot) = self.processes.lock().unwrap().get_mut(pid) {
            slot.timeout.task = Some(task);
        }
    }

    pub(crate) fn pause_timeout(self: &Arc<Self>, pid: &ProcessId) {
        let mut processes = self.processes.lock().unwrap();
        let Some(slot) = processes.get_mut(pid) else { return };
        slot.timeout.await_depth += 1;
        if let Some(task) = slot.timeout.task.take() {
            task.abort();
        }
        if let Some(since) = slot.timeout.running_since.take() {
            let elapsed = since.elapsed().as_millis() as u64;
            slot.timeout.remaining_ms = slot.timeout.remaining_ms.saturating_sub(elapsed);
        }
    }

    pub(crate) fn resume_timeout(self: &Arc<Self>, pid: &ProcessId) {
        let remaining = {
            let mut processes = self.processes.lock().unwrap();
            let Some(slot) = processes.get_mut(pid) else { return };
            slot.timeout.await_depth = slot.timeout.await_depth.saturating_sub(1);
            if slot.timeout.await_depth > 0 {
                return;
            }
            slot.timeout.running_since = Some(Instant::now());
            slot.timeout.remaining_ms
        };
        let task = spawn_timeout(self, pid.clone(), remaining);
        if let Some(slot) = self.processes.lock().unwrap().get_mut(pid) {
            slot.timeout.task = Some(task);
        }
    }

    /// The terminal transition. Ordered per engine.md (Cleanup on terminal
    /// state): flip the watch, write the terminal commit, drop the spawn,
    /// cancel the timeout, unregister subscriptions, cascade to children,
    /// remove the slot. Idempotent — a second call finds the watch already
    /// terminal and returns.
    pub(crate) fn set_terminal(
        self: &Arc<Self>,
        pid: &ProcessId,
        status: ProcessStatus,
        error: Option<&str>,
    ) {
        debug_assert!(status.is_terminal());
        let (transport, watchers, timeout_task, children) = {
            let mut processes = self.processes.lock().unwrap();
            let Some(slot) = processes.get_mut(pid) else {
                return; // slot gone — already terminal (idempotent)
            };
            if slot.status.borrow().is_terminal() {
                return;
            }
            let _ = slot.status.send(status);
            let transport = slot.transport.take();
            let watchers = std::mem::take(&mut slot.watchers);
            let timeout_task = slot.timeout.task.take();
            let children: Vec<ProcessId> = processes
                .iter()
                .filter(|(_, s)| s.config.parent.as_deref_id() == Some(pid))
                .map(|(id, _)| id.clone())
                .collect();
            (transport, watchers, timeout_task, children)
        };

        // 1. Terminal status into the substrate — authority transfers here. If
        // the creation commit hasn't landed yet (cancel raced run steps 2–3),
        // leave a tombstone; run settles it right after its commit.
        if !self.write_process_status(pid, status, error) {
            self.tombstones
                .lock()
                .unwrap()
                .insert(pid.clone(), (status, error.map(str::to_string)));
        }
        // 2. Drop the spawn: a closed transport receiver is the provider's kill signal.
        drop(transport);
        // 3. Cancel pending watchers and timeout.
        for task in watchers {
            task.abort();
        }
        if let Some(task) = timeout_task {
            task.abort();
        }
        // 4. Drop the process's subscriptions before any further dispatch.
        self.subscriptions.remove_for_process(pid);
        // 5. Cascade: a child process never outlives its parent.
        for child in children {
            self.set_terminal(&child, ProcessStatus::Failed, Some("parent ended"));
        }
        // 6. Remove the slot — the substrate is now the one truth.
        self.processes.lock().unwrap().remove(pid);
    }

    /// Merge-write the process chunk's status/error. The process chunk is
    /// engine domain; this is the engine's own commit, attributed to the run
    /// that caused it (engine.md, Traceability). Returns false when the chunk
    /// is not in the substrate yet — never creates it.
    pub(crate) fn write_process_status(
        &self,
        pid: &ProcessId,
        status: ProcessStatus,
        error: Option<&str>,
    ) -> bool {
        let result = (|| -> Result<bool, crate::errors::EngineError> {
            let active = self.mounts.active()?;
            let opts = ReadOpts {
                branch: active.branch.clone(),
                at: None,
                include: Includes {
                    chunk_body: true,
                    ..Includes::default()
                },
            };
            let Some(item) = active.db.get(pid.clone(), opts)? else {
                return Ok(false);
            };
            let mut body = item.body.unwrap_or_else(|| serde_json::json!({}));
            if !body.is_object() {
                body = serde_json::json!({});
            }
            let map = body.as_object_mut().expect("object ensured");
            map.insert("status".into(), serde_json::json!(status.as_str()));
            match error {
                Some(e) => map.insert("error".into(), serde_json::json!(e)),
                None => map.remove("error"),
            };
            let declaration = Declaration {
                chunks: vec![ChunkDeclaration {
                    id: Some(pid.clone()),
                    body: Some(body),
                    ..ChunkDeclaration::default()
                }],
                placements: vec![],
                message: None,
            };
            let commit_opts = CommitOpts {
                branch: active.branch.clone(),
                process_id: Some(pid.as_str().to_string()),
            };
            active.db.commit(&declaration, commit_opts)?;
            Ok(true)
        })();
        match result {
            Ok(wrote) => wrote,
            Err(e) => {
                // The runtime state has already transitioned; a failed status
                // write leaves a stale substrate record, surfaced at reconciliation.
                eprintln!("engine: failed to write terminal status for {pid}: {e}");
                true
            }
        }
    }
}

fn spawn_timeout(inner: &Arc<Inner>, pid: ProcessId, remaining_ms: u64) -> JoinHandle<()> {
    let weak = Arc::downgrade(inner);
    inner.handle.spawn(async move {
        tokio::time::sleep(Duration::from_millis(remaining_ms)).await;
        if let Some(inner) = weak.upgrade() {
            inner.set_terminal(&pid, ProcessStatus::Failed, Some("timeout"));
        }
    })
}

/// Small helper: Option<ProcessId> as Option<&ProcessId> for comparisons.
trait AsDerefId {
    fn as_deref_id(&self) -> Option<&ProcessId>;
}

impl AsDerefId for Option<ProcessId> {
    fn as_deref_id(&self) -> Option<&ProcessId> {
        self.as_ref()
    }
}
