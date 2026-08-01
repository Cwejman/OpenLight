//! The engine: authority on running programs against the substrate. Creates
//! processes, enforces boundaries, spawns executables via registered runtime
//! providers, and mediates every substrate operation a running program
//! attempts. Implemented from `spec/engine.md`; federation semantics answer to
//! `spec/research/union-accepts.md` §Consequences.

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
pub use mounts::ANCHOR_KEY;
pub use protocol::{
    batch_json, chunk_item_json, commit_json, dispatch_request, dry_run_json, parse_declaration,
    scope_result_json, Response,
};
pub use runtime::{
    ProgramRef, RequestTx, RuntimeHandle, RuntimeProvider, SpawnContext, TerminalReason,
    TransportRef,
};
pub use types::{
    archetypes, AwaitOpts, BatchEntry, BatchResult, BoundarySpec, Context, DryRunResult,
    EffectiveBoundary, HostCmd, MountMode, ProcessId, ProcessStatus, ProjectId, ReadTarget,
    RunArgs, RunMode, RuntimeKind, SubscriptionId, TaggedRead,
};
