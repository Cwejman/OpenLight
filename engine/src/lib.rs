//! The engine: authority on running programs against the substrate. Creates
//! processes, enforces boundaries, spawns executables via registered runtime
//! providers, and mediates every substrate operation a running program
//! attempts. Implemented from `pilot/engine.md`; federation semantics answer to
//! `research/union-accepts.md` §Consequences.

mod boundary;
mod bootstrap;
mod engine;
mod errors;
mod mounts;
mod ops;
mod process;
mod protocol;
mod reactivity;
mod runtime;
mod subscription;
mod types;
mod validate;

pub use engine::Engine;
pub use errors::{EngineError, MountError, OpenError, RegisterError, ShutdownError, SpawnError};
pub use protocol::{dispatch_request, Response};
pub use runtime::{
    ProgramRef, RequestTx, RuntimeHandle, RuntimeProvider, SpawnContext, TerminalReason,
    TransportRef,
};
pub use types::{
    archetypes, AwaitOpts, BatchEntry, BatchResult, BoundarySpec, Context, DryRunResult,
    EffectiveBoundary, HostCmd, MountMode, ProcessId, ProcessStatus, ProjectId, ReadTarget,
    RunArgs, RunMode, RuntimeKind, SubscriptionId, TaggedRead,
};
