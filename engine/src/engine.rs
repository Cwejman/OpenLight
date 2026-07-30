use crate::errors::{MountError, OpenError, RegisterError, ShutdownError};
use crate::mounts::MountRegistry;
use crate::process::ProcessSlot;
use crate::runtime::{RuntimeProvider, RuntimeRegistry};
use crate::subscription::SubscriptionRegistry;
use crate::types::{Context, HostCmd, MountMode, ProcessId, ProcessStatus, ProjectId, RuntimeKind};
use crate::{bootstrap, protocol, reactivity};
use db::{BranchName, ChunkId, Db};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::{mpsc, watch};
use tokio::task::JoinHandle;

/// The engine: a cheap clonable handle over shared state. The host holds one;
/// internal tasks hold `Weak` references so an unattended engine can drop.
#[derive(Clone)]
pub struct Engine {
    pub(crate) inner: Arc<Inner>,
}

pub(crate) struct Inner {
    pub mounts: MountRegistry,
    pub runtimes: RuntimeRegistry,
    pub processes: Mutex<HashMap<ProcessId, ProcessSlot>>,
    pub subscriptions: SubscriptionRegistry,
    pub host_tx: mpsc::Sender<HostCmd>,
    pub request_tx: mpsc::Sender<(Context, serde_json::Value)>,
    pub handle: tokio::runtime::Handle,
    pub shutdown_tx: watch::Sender<bool>,
    pub tasks: Mutex<Vec<JoinHandle<()>>>,
    /// Terminal transitions that raced `run`'s creation commit (the substrate
    /// chunk did not exist yet); `run` settles them right after the commit
    /// (engine.md, run step 4).
    pub tombstones: Mutex<HashMap<ProcessId, (ProcessStatus, Option<String>)>>,
}

impl Inner {
    pub(crate) fn take_tombstone(&self, pid: &ProcessId) -> Option<(ProcessStatus, Option<String>)> {
        self.tombstones.lock().unwrap().remove(pid)
    }
}

impl Engine {
    /// Open the engine with no db yet; the host registers runtime providers and
    /// mounts projects afterwards (engine.md, Boot lifecycle). Must be called
    /// inside a tokio runtime — background tasks spawn on it.
    pub fn open() -> Result<(Engine, mpsc::Receiver<HostCmd>), OpenError> {
        let handle = tokio::runtime::Handle::try_current()
            .map_err(|e| OpenError::NoRuntime(e.to_string()))?;
        let (host_tx, host_rx) = mpsc::channel(256);
        let (request_tx, request_rx) = mpsc::channel(256);
        let (shutdown_tx, _) = watch::channel(false);
        let engine = Engine {
            inner: Arc::new(Inner {
                mounts: MountRegistry::default(),
                runtimes: RuntimeRegistry::default(),
                processes: Mutex::new(HashMap::new()),
                subscriptions: SubscriptionRegistry::default(),
                host_tx,
                request_tx,
                handle: handle.clone(),
                shutdown_tx,
                tasks: Mutex::new(Vec::new()),
                tombstones: Mutex::new(HashMap::new()),
            }),
        };
        let pump = handle.spawn(protocol::request_pump(
            Arc::downgrade(&engine.inner),
            request_rx,
        ));
        engine.inner.tasks.lock().unwrap().push(pump);
        Ok((engine, host_rx))
    }

    /// Cancels reactivity, runs terminal cleanup on every active process, and
    /// stops background tasks.
    pub async fn shutdown(self) -> Result<(), ShutdownError> {
        let _ = self.inner.shutdown_tx.send(true);
        let active: Vec<ProcessId> = self
            .inner
            .processes
            .lock()
            .unwrap()
            .keys()
            .cloned()
            .collect();
        for pid in active {
            self.inner
                .set_terminal(&pid, ProcessStatus::Failed, Some("engine shutdown"));
        }
        let tasks: Vec<JoinHandle<()>> = std::mem::take(&mut *self.inner.tasks.lock().unwrap());
        for task in tasks {
            task.abort();
            let _ = task.await;
        }
        Ok(())
    }

    /// Mount a project. The active project mounts `ReadWrite` (exactly one);
    /// peers mount `ReadOnly`. On the read-write mount the engine reconciles
    /// zombie processes and starts the reactivity loop — read-only mounts have
    /// no in-process writer and are never subscribed to (engine.md, Reactivity).
    pub fn mount_project(
        &self,
        id: ProjectId,
        db: Arc<Db>,
        mode: MountMode,
        branch: BranchName,
    ) -> Result<(), MountError> {
        self.inner
            .mounts
            .insert(id.clone(), db.clone(), mode, branch.clone())?;
        if mode == MountMode::ReadWrite {
            if let Err(e) = bootstrap::reconcile_zombies(&db, &branch) {
                self.inner.mounts.remove(&id).ok();
                return Err(MountError::Reconcile(e.to_string()));
            }
            // The commit feed subscribes here, synchronously — before this call
            // returns — so no commit can slip between mount and the task's
            // first poll.
            let feed = reactivity::commit_feed(&db, &branch);
            let task = self.inner.handle.spawn(reactivity::loop_task(
                Arc::downgrade(&self.inner),
                feed,
                branch,
                self.inner.shutdown_tx.subscribe(),
            ));
            self.inner.tasks.lock().unwrap().push(task);
        }
        Ok(())
    }

    pub fn unmount_project(&self, id: &ProjectId) -> Result<(), MountError> {
        self.inner.mounts.remove(id)
    }

    pub fn register_runtime(
        &self,
        kind: RuntimeKind,
        provider: Arc<dyn RuntimeProvider>,
    ) -> Result<(), RegisterError> {
        self.inner.runtimes.register(kind, provider)
    }

    /// Boot-time validation (engine.md): unresolved placement references across
    /// all mounts. The host refuses to enter the event loop on a non-empty list.
    pub fn unresolved_references(
        &self,
    ) -> Result<Vec<(ChunkId, ChunkId)>, crate::errors::EngineError> {
        self.inner.mounts.unresolved_references()
    }

    /// The sender side of the host command channel — runtime providers in the
    /// host crate use it to reach the main-thread wry machinery.
    pub fn host_sender(&self) -> mpsc::Sender<HostCmd> {
        self.inner.host_tx.clone()
    }

    /// The sender providers hand to spawned programs for incoming wire requests.
    pub fn request_sender(&self) -> mpsc::Sender<(Context, serde_json::Value)> {
        self.inner.request_tx.clone()
    }
}

impl Drop for Inner {
    /// Best-effort fallback when `shutdown` was never called.
    fn drop(&mut self) {
        for task in self.tasks.lock().unwrap().drain(..) {
            task.abort();
        }
    }
}
