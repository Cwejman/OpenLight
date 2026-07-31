//! The webview runtime provider (engine.md §Runtime providers) — minimal for
//! v0.1-now: it does not build webviews itself (only the main loop holds wry
//! machinery); it crosses to the rim as data via `HostCmd::MountWebview` and
//! parks the runtime handles until the rim claims them at mount. The VM
//! provider is absent in v0.1-now — `runtime: 'vm'` programs refuse at run
//! with "no runtime provider" (recorded deferral).

use engine::{
    HostCmd, ProcessId, RuntimeHandle, RuntimeProvider, SpawnContext, SpawnError, TerminalReason,
};
use std::collections::HashMap;
use std::sync::Mutex;
use tokio::sync::{mpsc, oneshot};

/// What the rim needs when `MountWebview` arrives: the readiness signal to
/// fire once the webview stands, the terminal verdict for when it dies, and
/// the engine's outgoing events to forward as `__sdk.event`/`__sdk.resolve`
/// scripts. A closed events channel is the engine's kill signal.
pub struct PendingWebview {
    /// The program chunk this run runs. The rim reads its body to learn where
    /// the webview goes (`boot::program_kind`) — a mount the rim did not
    /// schedule itself, an overlay above all, is otherwise nameless to it.
    pub program: db::ChunkId,
    pub executable: String,
    pub ready: oneshot::Sender<()>,
    pub terminal: oneshot::Sender<TerminalReason>,
    pub events: mpsc::Receiver<serde_json::Value>,
}

pub struct WebviewProvider {
    host_tx: mpsc::Sender<HostCmd>,
    pending: Mutex<HashMap<ProcessId, PendingWebview>>,
}

impl WebviewProvider {
    pub fn new(host_tx: mpsc::Sender<HostCmd>) -> WebviewProvider {
        WebviewProvider {
            host_tx,
            pending: Mutex::new(HashMap::new()),
        }
    }

    /// Claim the spawn's handles; the rim calls this on `MountWebview`.
    pub fn take_pending(&self, pid: &ProcessId) -> Option<PendingWebview> {
        self.pending.lock().expect("pending lock").remove(pid)
    }
}

impl RuntimeProvider for WebviewProvider {
    fn spawn(&self, cx: SpawnContext) -> Result<RuntimeHandle, SpawnError> {
        let (transport, events) = mpsc::channel(64);
        let (ready_tx, ready) = oneshot::channel();
        let (terminal_tx, terminal) = oneshot::channel();
        self.pending.lock().expect("pending lock").insert(
            cx.process_id.clone(),
            PendingWebview {
                program: cx.program.id.clone(),
                executable: cx.program.executable.clone(),
                ready: ready_tx,
                terminal: terminal_tx,
                events,
            },
        );
        // try_send: spawn runs on the engine's calling thread; the channel is
        // deep enough that a full buffer means the event loop is gone.
        if let Err(e) = self.host_tx.try_send(HostCmd::MountWebview {
            process_id: cx.process_id.clone(),
            executable: cx.program.executable,
        }) {
            self.pending.lock().expect("pending lock").remove(&cx.process_id);
            return Err(SpawnError::Failed(format!("host command channel: {e}")));
        }
        Ok(RuntimeHandle { transport, ready, terminal })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use engine::{ProgramRef, RuntimeKind};

    fn spawn_ctx(pid: &str, request_tx: engine::RequestTx) -> SpawnContext {
        SpawnContext {
            process_id: db::ChunkId::from(pid),
            program: ProgramRef {
                id: db::ChunkId::from("host/read-tile"),
                executable: "programs/read-tile/src/index.tsx".into(),
                runtime: RuntimeKind::from("webview"),
                capabilities: vec![],
            },
            request_tx,
        }
    }

    #[tokio::test]
    async fn spawn_crosses_to_the_rim_as_a_mount_command() {
        let (host_tx, mut host_rx) = mpsc::channel(8);
        let (request_tx, _request_rx) = mpsc::channel(8);
        let provider = WebviewProvider::new(host_tx);

        let handle = provider.spawn(spawn_ctx("p_1", request_tx)).unwrap();
        match host_rx.recv().await.unwrap() {
            HostCmd::MountWebview { process_id, executable } => {
                assert_eq!(process_id.as_str(), "p_1");
                assert_eq!(executable, "programs/read-tile/src/index.tsx");
            }
            other => panic!("expected MountWebview, got {other:?}"),
        }

        // The rim claims the pending handles and fires readiness.
        let pending = provider.take_pending(&db::ChunkId::from("p_1")).unwrap();
        assert_eq!(pending.executable, "programs/read-tile/src/index.tsx");
        // The program is carried through: the rim reads its body for the layer.
        assert_eq!(pending.program.as_str(), "host/read-tile");
        pending.ready.send(()).unwrap();
        handle.ready.await.expect("readiness reaches the engine side");

        // Claiming is once — a second take finds nothing.
        assert!(provider.take_pending(&db::ChunkId::from("p_1")).is_none());
    }

    #[tokio::test]
    async fn engine_events_reach_the_claimed_receiver() {
        let (host_tx, _host_rx) = mpsc::channel(8);
        let (request_tx, _request_rx) = mpsc::channel(8);
        let provider = WebviewProvider::new(host_tx);
        let handle = provider.spawn(spawn_ctx("p_2", request_tx)).unwrap();
        let mut pending = provider.take_pending(&db::ChunkId::from("p_2")).unwrap();

        handle
            .transport
            .send(serde_json::json!({ "event": "scope_changed" }))
            .await
            .unwrap();
        let event = pending.events.recv().await.unwrap();
        assert_eq!(event["event"], "scope_changed");

        // Engine dropping the transport is the kill signal: channel closes.
        drop(handle.transport);
        assert!(pending.events.recv().await.is_none());
    }

    #[tokio::test]
    async fn dead_host_channel_fails_the_spawn() {
        let (host_tx, host_rx) = mpsc::channel(1);
        drop(host_rx);
        let (request_tx, _request_rx) = mpsc::channel(8);
        let provider = WebviewProvider::new(host_tx);
        assert!(provider.spawn(spawn_ctx("p_3", request_tx)).is_err());
        assert!(provider.take_pending(&db::ChunkId::from("p_3")).is_none(), "no orphaned pending entry");
    }
}
