//! The boot sequence (host.md §Boot sequence), wry-free: everything up to the
//! event loop, so it runs whole under test. The rim calls [`boot`] inside a
//! tokio runtime context (step 1 is the caller's — `Engine::open` reads
//! `Handle::try_current`), then drains the returned `HostCmd` receiver on its
//! event loop.

use crate::mounts::{self, Cascade, CascadeError};
use crate::seed;
use crate::webview_runtime::WebviewProvider;
use db::{ChunkId, Db};
use engine::{Context, Engine, HostCmd, MountMode, ProcessId, ProjectId};
use serde_json::json;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::mpsc;

/// The demo surface suite the rim composes host-side, in tile order:
/// reader | (sidebar / inspector). Content is read from the field; only the
/// tree layout is still rim-composed (the swap unit's sanctioned remainder).
pub const DEMO_PROGRAMS: [&str; 3] = ["read-tile", "sidebar", "inspector"];

/// The session instance the host creates on first launch (bootstrap.md,
/// closing note: the first session is a runtime action, never a bootstrap
/// commit). Readable id per the fixture convention (board.md tracked debt).
const SESSION_ID: &str = "session-main";
const SESSION_NAME: &str = "main";

pub struct Booted {
    pub engine: Engine,
    pub host_rx: mpsc::Receiver<HostCmd>,
    pub provider: Arc<WebviewProvider>,
    pub session: ChunkId,
    /// One entry per demo program, in `DEMO_PROGRAMS` order.
    pub tiles: Vec<TileProcess>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct TileProcess {
    pub program: String,
    pub process: ProcessId,
}

#[derive(Debug)]
pub enum BootError {
    Cascade(CascadeError),
    Seed(String),
    OpenDb { path: PathBuf, message: String },
    Engine(String),
    /// Boot-time validation (step 9): (chunk, unresolved scope) pairs. The
    /// host refuses to enter the event loop — no half-loaded state.
    Unresolved(Vec<(ChunkId, ChunkId)>),
}

impl std::fmt::Display for BootError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BootError::Cascade(e) => write!(f, "mounts cascade: {e}"),
            BootError::Seed(e) => write!(f, "bootstrap seeding: {e}"),
            BootError::OpenDb { path, message } => {
                write!(f, "opening {}: {message}", path.display())
            }
            BootError::Engine(e) => write!(f, "engine: {e}"),
            BootError::Unresolved(list) => {
                writeln!(f, "unresolved placement references — refusing to boot half-loaded:")?;
                for (chunk, scope) in list {
                    writeln!(f, "  {chunk} placed on unresolved {scope}")?;
                }
                Ok(())
            }
        }
    }
}

/// The active project: first CLI argument, else the working directory when it
/// is a project, else the repo's `agents` project (the demo default).
pub fn resolve_active_path(args: &[String], cwd: &Path) -> PathBuf {
    if let Some(path) = args.iter().find(|a| !a.starts_with('-')) {
        return PathBuf::from(path);
    }
    if cwd.join(".ol").join("project.toml").is_file() {
        return cwd.to_path_buf();
    }
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../agents")
}

/// Steps 2–10 of host.md §Boot sequence (step 1, the runtime, is the
/// caller's; step 11, the event loop, is the rim's; the VM of step 7 is
/// absent in v0.1-now — recorded deferral).
pub fn boot(active_path: &Path) -> Result<Booted, BootError> {
    // Step 3 — the cascade walk, host and engine projects required.
    let cascade = mounts::walk(active_path, &mut mounts::fs_loader).map_err(BootError::Cascade)?;
    mounts::require(&cascade, &["host", "engine"]).map_err(BootError::Cascade)?;

    // Per-project bootstrap seeding — the explicit pre-open step (board.md
    // gate "before swap"). Idempotent; peers without a routine must already
    // carry a db, enforced by the read-only open below.
    seed_first_party(&cascade)?;

    // Step 4 — open all dbs: active read-write, peers read-only.
    let active_db = Arc::new(
        Db::open(&cascade.active.path).map_err(|e| BootError::OpenDb {
            path: cascade.active.path.clone(),
            message: e.to_string(),
        })?,
    );
    let mut peer_dbs = Vec::new();
    for peer in &cascade.peers {
        let db = Db::open_read_only(&peer.path).map_err(|e| BootError::OpenDb {
            path: peer.path.clone(),
            message: e.to_string(),
        })?;
        peer_dbs.push((peer, Arc::new(db)));
    }

    // Step 5 — open the engine (requires the caller's runtime context).
    let (engine, host_rx) = Engine::open().map_err(|e| BootError::Engine(e.to_string()))?;

    // Step 6 — register runtime providers. Webview only: the VM provider is
    // v0.1-now absent; `runtime: 'vm'` programs refuse at run.
    let provider = Arc::new(WebviewProvider::new(engine.host_sender()));
    engine
        .register_runtime("webview".into(), provider.clone())
        .map_err(|e| BootError::Engine(e.to_string()))?;

    // Step 8 — mount projects; the active mount starts reactivity and
    // reconciles zombie processes from the previous run.
    for (peer, db) in &peer_dbs {
        engine
            .mount_project(
                project_id(&peer.path),
                db.clone(),
                MountMode::ReadOnly,
                db::BranchName::from(peer.branch.as_str()),
            )
            .map_err(|e| BootError::Engine(e.to_string()))?;
    }
    engine
        .mount_project(
            project_id(&cascade.active.path),
            active_db,
            MountMode::ReadWrite,
            db::BranchName::default(),
        )
        .map_err(|e| BootError::Engine(e.to_string()))?;

    // Step 9 — boot-time validation; refuse a half-loaded state.
    let unresolved = engine
        .unresolved_references()
        .map_err(|e| BootError::Engine(e.to_string()))?;
    if !unresolved.is_empty() {
        return Err(BootError::Unresolved(unresolved));
    }

    // Step 10 — the demo suite: an initial session (found by name, created on
    // first launch) and the three surface processes, reading real chunks.
    let session = ensure_session(&engine)?;
    let mut tiles = Vec::new();
    for name in DEMO_PROGRAMS {
        let program = engine
            .resolve_name(&Context::host(), &format!("host/{name}"))
            .map_err(|e| BootError::Engine(format!("resolving host/{name}: {e}")))?;
        let process = engine
            .run(
                &Context::host(),
                engine::RunArgs {
                    program_id: program,
                    chunks: vec![],
                    placements: vec![session.clone()],
                    mode: engine::RunMode::Child,
                    read_boundary: engine::BoundarySpec::Roots(vec![session.clone()]),
                    write_boundary: engine::BoundarySpec::Roots(vec![session.clone()]),
                    timeout_ms: None,
                },
            )
            .map_err(|e| BootError::Engine(format!("running host/{name}: {e}")))?;
        tiles.push(TileProcess { program: name.to_string(), process });
    }

    Ok(Booted { engine, host_rx, provider, session, tiles })
}

fn seed_first_party(cascade: &Cascade) -> Result<(), BootError> {
    let all = std::iter::once(&cascade.active).chain(cascade.peers.iter());
    for project in all {
        seed::ensure_seeded(&project.path, &project.name).map_err(BootError::Seed)?;
    }
    Ok(())
}

/// engine.md, Settled choices: a project's id is its canonical absolute path.
fn project_id(path: &Path) -> ProjectId {
    ProjectId::from(path.to_string_lossy().as_ref())
}

/// Find the initial session by name path, create it on first launch. The
/// creation is an ordinary host-context commit, not a bootstrap commit.
fn ensure_session(engine: &Engine) -> Result<ChunkId, BootError> {
    let path = format!("host/session/{SESSION_NAME}");
    match engine.resolve_name(&Context::host(), &path) {
        Ok(id) => Ok(id),
        Err(engine::EngineError::NotFound(_)) => {
            let archetype = engine
                .resolve_name(&Context::host(), "host/session")
                .map_err(|e| BootError::Engine(format!("resolving host/session: {e}")))?;
            engine
                .commit(
                    &Context::host(),
                    db::Declaration {
                        chunks: vec![db::ChunkDeclaration {
                            id: Some(ChunkId::from(SESSION_ID)),
                            name: Some(SESSION_NAME.into()),
                            spec: None,
                            body: Some(json!({ "text": "Initial session, created on first launch." })),
                            removed: false,
                        }],
                        placements: vec![db::PlacementSpec {
                            chunk: ChunkId::from(SESSION_ID),
                            scope: archetype,
                            type_: db::PlacementType::Instance,
                            seq: None,
                            active: true,
                        }],
                        message: Some("initial session".into()),
                    },
                )
                .map_err(|e| BootError::Engine(format!("creating the initial session: {e}")))?;
            Ok(ChunkId::from(SESSION_ID))
        }
        Err(e) => Err(BootError::Engine(format!("resolving {path}: {e}"))),
    }
}
