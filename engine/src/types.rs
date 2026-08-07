use db::{ChunkDeclaration, ChunkId};
use serde::{Deserialize, Serialize};
use std::fmt;

/// A process is a chunk; its id is a chunk id (engine.md, Program and Process).
pub type ProcessId = ChunkId;

/// Well-known chunk ids for the engine project's archetypes. Bootstrap ids are
/// hand-picked human-readable strings for v0.1 (@md/board.md, tracked debt); the
/// engine binds to them as constants until generated-id lookup lands.
pub mod archetypes {
    pub const ENGINE_PROGRAM: &str = "engine/program";
    pub const ENGINE_PROCESS: &str = "engine/process";
    pub const READ_BOUNDARY: &str = "engine/read-boundary";
    pub const WRITE_BOUNDARY: &str = "engine/write-boundary";
    /// Virtual — synthesized from the mount registry, never stored.
    pub const ENGINE_MOUNT: &str = "engine/mount";
    /// Result-role archetype (programs.md §1); `await results_only` filters on it.
    pub const PROGRAMS_RESULT: &str = "programs/result";
    pub const DB_COMMITS: &str = "db/commits";
    pub const DB_BRANCHES: &str = "db/branches";

    /// Scopes the substrate machinery synthesizes at query time.
    pub fn is_virtual(id: &str) -> bool {
        id == DB_COMMITS || id == DB_BRANCHES || id == ENGINE_MOUNT || is_mount_instance(id)
    }

    pub fn is_mount_instance(id: &str) -> bool {
        id.starts_with("engine/mount:")
    }
}

/// Canonical absolute filesystem path of a project (engine.md, Settled choices).
#[derive(Debug, Clone, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct ProjectId(pub String);

impl ProjectId {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl From<&str> for ProjectId {
    fn from(s: &str) -> Self {
        ProjectId(s.to_string())
    }
}

impl fmt::Display for ProjectId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MountMode {
    ReadWrite,
    ReadOnly,
}

/// Registry key for a runtime provider ('vm', 'webview', future kinds).
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct RuntimeKind(pub String);

impl From<&str> for RuntimeKind {
    fn from(s: &str) -> Self {
        RuntimeKind(s.to_string())
    }
}

/// One enum used both in-memory (slot watcher) and at the substrate body field.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProcessStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

impl ProcessStatus {
    pub fn is_terminal(&self) -> bool {
        matches!(self, ProcessStatus::Completed | ProcessStatus::Failed)
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            ProcessStatus::Pending => "pending",
            ProcessStatus::Running => "running",
            ProcessStatus::Completed => "completed",
            ProcessStatus::Failed => "failed",
        }
    }

    pub fn parse(s: &str) -> Option<ProcessStatus> {
        match s {
            "pending" => Some(ProcessStatus::Pending),
            "running" => Some(ProcessStatus::Running),
            "completed" => Some(ProcessStatus::Completed),
            "failed" => Some(ProcessStatus::Failed),
            _ => None,
        }
    }
}

/// `None` marks a host-initiated call — full write reach over the active
/// project, full read reach across mounts. `Some` resolves boundaries from the
/// named process chunk's attached boundary chunks (engine.md, Engine API).
#[derive(Debug, Clone, Default)]
pub struct Context {
    pub process_id: Option<ProcessId>,
}

impl Context {
    pub fn host() -> Context {
        Context { process_id: None }
    }

    pub fn process(id: impl Into<ProcessId>) -> Context {
        Context {
            process_id: Some(id.into()),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum RunMode {
    /// Composed work: nest instance on the caller's process; cascade on the
    /// caller's terminal transition. The default.
    #[default]
    Child,
    /// Detached: place instance on the caller's session scopes instead;
    /// survives the caller. Boundaries still intersect with the caller's at
    /// spawn — detachment never escalates.
    Launch,
}

#[derive(Debug, Clone)]
pub enum BoundarySpec {
    /// Build a fresh boundary chunk from these scope roots.
    Roots(Vec<ChunkId>),
    /// Reuse an existing boundary chunk (named, shared across runs).
    Existing(ChunkId),
}

#[derive(Debug, Clone)]
pub struct RunArgs {
    pub program_id: ChunkId,
    /// Typed arguments; each receives an `instance` placement on the process.
    pub chunks: Vec<ChunkDeclaration>,
    /// Additional scopes to place the new process on (host passes the
    /// host/session id; tool calls pass the parent process).
    pub placements: Vec<ChunkId>,
    pub mode: RunMode,
    pub read_boundary: BoundarySpec,
    pub write_boundary: BoundarySpec,
    /// Overrides the program's own `body.timeout_ms`.
    pub timeout_ms: Option<u64>,
}

/// A tagged sub-query of `read_batch`. `ctx` overrides the request identity —
/// the multiplexed-transport path where the host maps slot tokens to process
/// ids (engine.md, Multiplexed transports). `None` inherits the request ctx.
#[derive(Debug, Clone)]
pub struct TaggedRead {
    pub tag: String,
    pub target: ReadTarget,
    pub ctx: Option<Context>,
}

#[derive(Debug, Clone)]
pub enum ReadTarget {
    Scope {
        scopes: Vec<ChunkId>,
        opts: db::ScopeOpts,
    },
    Get {
        chunk_id: ChunkId,
        opts: db::ReadOpts,
    },
}

#[derive(Debug)]
pub enum BatchEntry {
    Scope(db::ScopeResult),
    Get(Option<db::ChunkItem>),
    Err(crate::errors::EngineError),
}

#[derive(Debug)]
pub struct BatchResult {
    /// The one snapshot every sub-query resolved at.
    pub head: db::CommitId,
    pub results: std::collections::HashMap<String, BatchEntry>,
}

/// Structured result of `commit` with `dry_run: true`.
#[derive(Debug)]
pub struct DryRunResult {
    pub valid: bool,
    pub errors: Vec<crate::errors::EngineError>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct SubscriptionId(pub String);

impl SubscriptionId {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl From<&str> for SubscriptionId {
    fn from(s: &str) -> Self {
        SubscriptionId(s.to_string())
    }
}

/// The effective boundary as a conjunction of root sets: a scope is within the
/// boundary only when every set reaches it. This is the exact intersection of
/// the contributing boundaries (program intrinsic ∩ run-level ∩ parent chain) —
/// engine.md #boundaries: boundaries only narrow through the call stack. An
/// empty conjunction is the universal set (host context, open program).
#[derive(Debug, Clone, Default)]
pub struct EffectiveBoundary {
    pub sets: Vec<Vec<ChunkId>>,
}

impl EffectiveBoundary {
    pub fn universal() -> EffectiveBoundary {
        EffectiveBoundary { sets: Vec::new() }
    }

    pub fn is_universal(&self) -> bool {
        self.sets.is_empty()
    }

    /// Intersect: conjoin another root set. Boundaries can only narrow.
    pub fn narrowed(&self, roots: Vec<ChunkId>) -> EffectiveBoundary {
        let mut sets = self.sets.clone();
        sets.push(roots);
        EffectiveBoundary { sets }
    }
}

/// The engine's only seam to the host's non-`Send` wry/tao machinery,
/// expressed as data. The host drains the receiver on its event loop.
#[derive(Debug)]
pub enum HostCmd {
    MountWebview { process_id: ProcessId, executable: String },
    UnmountWebview { process_id: ProcessId },
    EvaluateScript { process_id: ProcessId, script: String },
}

/// Options for `await_processes`.
#[derive(Debug, Clone, Copy, Default)]
pub struct AwaitOpts {
    /// Filter each returned scope to chunks `instance` on result-role
    /// archetypes (plus counts).
    pub results_only: bool,
}
