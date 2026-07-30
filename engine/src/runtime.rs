use crate::errors::{EngineError, RegisterError, SpawnError};
use crate::types::{Context, ProcessId, RuntimeKind};
use db::ChunkItem;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::{mpsc, oneshot};

/// The program chunk as the provider needs it — id plus the body fields the
/// engine read at dispatch (executable, runtime, capabilities).
#[derive(Debug, Clone)]
pub struct ProgramRef {
    pub id: db::ChunkId,
    pub executable: String,
    pub runtime: RuntimeKind,
    pub capabilities: Vec<String>,
}

impl ProgramRef {
    pub fn from_chunk(item: &ChunkItem) -> Result<ProgramRef, EngineError> {
        let body = item.body.as_ref().ok_or_else(|| {
            EngineError::ValidationError(format!("program {} has no body", item.id))
        })?;
        let field = |key: &str| {
            body.get(key)
                .and_then(|v| v.as_str())
                .map(str::to_string)
                .ok_or_else(|| {
                    EngineError::ValidationError(format!("program {} missing {key}", item.id))
                })
        };
        Ok(ProgramRef {
            id: item.id.clone(),
            executable: field("executable")?,
            runtime: RuntimeKind(field("runtime")?),
            capabilities: body
                .get("capabilities")
                .and_then(|v| v.as_array())
                .map(|a| {
                    a.iter()
                        .filter_map(|v| v.as_str().map(str::to_string))
                        .collect()
                })
                .unwrap_or_default(),
        })
    }
}

/// Incoming wire requests from the spawned program, routed by the provider.
pub type RequestTx = mpsc::Sender<(Context, serde_json::Value)>;

/// Outgoing responses and events; the provider delivers them on its transport
/// (wry evaluate_script, VM stdin). Dropped on terminal — a closed receiver is
/// the provider's kill signal.
pub type TransportRef = mpsc::Sender<serde_json::Value>;

pub struct SpawnContext {
    pub process_id: ProcessId,
    pub program: ProgramRef,
    pub request_tx: RequestTx,
}

/// The provider's verdict. `Failed` carries the error the engine writes to the
/// process body — 'exit code 3', 'protocol: malformed output' (engine.md,
/// Error Classification); only the provider can know it.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TerminalReason {
    Completed,
    Failed(String),
}

pub struct RuntimeHandle {
    /// Engine pushes outgoing events here.
    pub transport: TransportRef,
    /// Resolves when the runtime is alive (process attached / webview
    /// navigated); engine flips the slot to Running.
    pub ready: oneshot::Receiver<()>,
    /// Resolves on the runtime's own terminal transition (exit code, webview
    /// destroyed).
    pub terminal: oneshot::Receiver<TerminalReason>,
}

/// Containment lives in the provider, not in engine code; the engine knows
/// runtime kinds only as registry keys. The engine crate ships zero provider
/// implementations — VM and webview live in the host crate.
pub trait RuntimeProvider: Send + Sync {
    fn spawn(&self, cx: SpawnContext) -> Result<RuntimeHandle, SpawnError>;
}

/// Providers are registered at boot by Rust code holding the Engine — no
/// discovery, no manifests, just a map of trait objects.
#[derive(Default)]
pub(crate) struct RuntimeRegistry {
    providers: Mutex<HashMap<RuntimeKind, Arc<dyn RuntimeProvider>>>,
}

impl RuntimeRegistry {
    pub fn register(
        &self,
        kind: RuntimeKind,
        provider: Arc<dyn RuntimeProvider>,
    ) -> Result<(), RegisterError> {
        let mut map = self.providers.lock().unwrap();
        if map.contains_key(&kind) {
            return Err(RegisterError::AlreadyRegistered(kind.0));
        }
        map.insert(kind, provider);
        Ok(())
    }

    pub fn lookup(&self, kind: &RuntimeKind) -> Option<Arc<dyn RuntimeProvider>> {
        self.providers.lock().unwrap().get(kind).cloned()
    }
}
