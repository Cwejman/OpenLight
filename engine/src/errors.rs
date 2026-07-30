use db::{ReadError, WriteError};

/// The engine has one wire surface, so it has one error enum (engine.md,
/// Settled choices). The protocol response builder maps each variant to a wire
/// code via a single `match`.
#[derive(Debug, thiserror::Error)]
pub enum EngineError {
    #[error("boundary violation: {0}")]
    BoundaryViolation(String),
    #[error("read-only mount: {0}")]
    ReadOnlyMount(String),
    #[error("validation error: {0}")]
    ValidationError(String),
    #[error("not found: {0}")]
    NotFound(String),
    #[error("run failed: {0}")]
    RunFailed(String),
    #[error("invalid request: {0}")]
    InvalidRequest(String),
    #[error("transport closed")]
    TransportClosed,
    /// Substrate-internal failure (sqlite io). No dedicated wire code exists
    /// in engine.md's table — serialized as INVALID_REQUEST with an
    /// "internal:" message (recorded spec gap).
    #[error("db error: {0}")]
    Db(String),
}

impl EngineError {
    pub fn wire_code(&self) -> &'static str {
        match self {
            EngineError::BoundaryViolation(_) => "BOUNDARY_VIOLATION",
            EngineError::ReadOnlyMount(_) => "READ_ONLY_MOUNT",
            EngineError::ValidationError(_) => "VALIDATION_ERROR",
            EngineError::NotFound(_) => "NOT_FOUND",
            EngineError::RunFailed(_) => "RUN_FAILED",
            EngineError::InvalidRequest(_) => "INVALID_REQUEST",
            EngineError::TransportClosed => "TRANSPORT_CLOSED",
            EngineError::Db(_) => "INVALID_REQUEST",
        }
    }
}

impl From<ReadError> for EngineError {
    fn from(e: ReadError) -> Self {
        match e {
            ReadError::NotFound { kind, id } => EngineError::NotFound(format!("{kind} {id}")),
            ReadError::Io(e) => EngineError::Db(e.to_string()),
        }
    }
}

impl From<WriteError> for EngineError {
    fn from(e: WriteError) -> Self {
        match e {
            WriteError::Validation { .. } | WriteError::NameCollision { .. } => {
                EngineError::ValidationError(e.to_string())
            }
            WriteError::NotFound { kind, id } => EngineError::NotFound(format!("{kind} {id}")),
            WriteError::MalformedDeclaration(m) => EngineError::InvalidRequest(m),
            WriteError::WriteToVirtualChunk { id } => {
                EngineError::ValidationError(format!("write targets virtual chunk {id}"))
            }
            // The engine's own read-only enforcement runs first; a db-level
            // refusal reaching here means a write slipped past it.
            WriteError::ReadOnly => EngineError::ReadOnlyMount("db handle is read-only".into()),
            WriteError::Io(e) => EngineError::Db(e.to_string()),
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum MountError {
    #[error("project already mounted: {0}")]
    AlreadyMounted(String),
    #[error("a read-write mount is already registered: {0}")]
    ActiveAlreadyMounted(String),
    #[error("project not mounted: {0}")]
    NotMounted(String),
    #[error("zombie reconciliation failed: {0}")]
    Reconcile(String),
}

#[derive(Debug, thiserror::Error)]
pub enum RegisterError {
    #[error("runtime kind already registered: {0}")]
    AlreadyRegistered(String),
}

#[derive(Debug, thiserror::Error)]
pub enum OpenError {
    #[error("engine must be opened inside a tokio runtime: {0}")]
    NoRuntime(String),
}

#[derive(Debug, thiserror::Error)]
pub enum ShutdownError {
    #[error("shutdown failed: {0}")]
    Failed(String),
}

#[derive(Debug, thiserror::Error)]
pub enum SpawnError {
    #[error("spawn failed: {0}")]
    Failed(String),
}
