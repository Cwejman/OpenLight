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

/// The programs the rim gives tiles to, in tile order. Genuine tile content
/// only: the sidebar is not among them — it is a naked surface (below), and the
/// inspector waits for a program of its own. Content is read from the field;
/// only the tree layout is still rim-composed (the swap unit's remainder).
pub const TILE_PROGRAMS: [&str; 1] = ["read-tile"];

/// The naked surface of host.md boot step 10: a webview strip positioned
/// directly on the background, outside tile geometry. The tab-bar is its
/// sibling in the spec's suite and unbuilt — recorded deferral.
pub const STRIP_PROGRAM: &str = "sidebar";

/// The body field a program declares its on-screen kind through, and the one
/// value that is not the default (host.md §Overlays). A program is tile content
/// unless it says otherwise; an overlay renders *above* the tile composition,
/// so the rim gives it the whole window rather than a rectangle in the tree.
///
/// **Recorded gap.** host.md models an overlay as a `host/overlay` chunk placed
/// on the program and on its anchor. That machinery — anchors narrower than the
/// window, the placement itself — is unbuilt; the body field is the first rung,
/// and it carries only the session-wide anchor the palette and the context menu
/// both want.
pub const SURFACE_KEY: &str = "surface";
pub const OVERLAY_SURFACE: &str = "overlay";

/// Where a running program's webview goes.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Surface {
    /// Into the geometry the rim walks — a tile leaf, or the naked strip.
    Tile,
    /// Over all of it, spanning the window.
    Overlay,
}

/// Read `surface` off a program body. Absent, unreadable, or anything else is
/// tile content — the rim never guesses a program into the overlay layer.
pub fn surface_of(body: Option<&serde_json::Value>) -> Surface {
    match body.and_then(|b| b.get(SURFACE_KEY)).and_then(|s| s.as_str()) {
        Some(OVERLAY_SURFACE) => Surface::Overlay,
        _ => Surface::Tile,
    }
}

/// What the rim needs about the program behind a mount it did not schedule: the
/// name to label it by, and where it goes. Read under host identity — the rim
/// is not a process and has no boundary.
pub fn program_kind(engine: &Engine, program: &ChunkId) -> (Option<String>, Surface) {
    let opts = db::ReadOpts {
        include: db::Includes { chunk_name: true, chunk_body: true, ..db::Includes::default() },
        ..db::ReadOpts::default()
    };
    match engine.get(&Context::host(), program, opts) {
        Ok(Some(item)) => (item.name.clone(), surface_of(item.body.as_ref())),
        _ => (None, Surface::Tile),
    }
}

pub struct Booted {
    pub engine: Engine,
    pub host_rx: mpsc::Receiver<HostCmd>,
    pub provider: Arc<WebviewProvider>,
    pub session: ChunkId,
    /// The session's current tab — the root the rim reads the tile tree from.
    pub tab: ChunkId,
    /// The active project's db, kept beside the engine's mount: the rim
    /// subscribes to its commit broadcast for relayout (the engine's own
    /// `subscribe` requires a process context — a recorded gap; the db feed is
    /// the same stream the engine's reactivity task drinks from).
    pub active_db: Arc<db::Db>,
    /// One entry per program in `TILE_PROGRAMS` order — the boot-spawned tile
    /// processes (the field's leaves point at them; see `seed::point_leaf`).
    pub tiles: Vec<TileProcess>,
    /// The sidebar: a strip on the background, in no tile.
    pub strip: TileProcess,
    /// Where `body.executable` resolves from. Nothing specs the base a
    /// program's executable path is relative to (host.md §Authoring Programs
    /// says only "pointing at the bundle") — the declaring project's root is
    /// the reading taken here, and every program the host runs today is
    /// declared by the host project. Recorded gap.
    pub programs_root: PathBuf,
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
            active_db.clone(),
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

    // Step 10 — the always-mounted suite: the initial workspace (session, tab,
    // first leaf — a runtime commit, never bootstrap; seed.rs), the tile
    // programs with the field's leaves pointed at them, and the sidebar as a
    // naked strip with the read roots step 10 names.
    let workspace = seed::ensure_workspace(&engine).map_err(BootError::Seed)?;
    let session = workspace.session;
    let mut tiles = Vec::new();
    for name in TILE_PROGRAMS {
        let surface = spawn_surface(&engine, name, &session, vec![session.clone()])?;
        seed::point_leaf(&engine, &workspace.leaf, &surface.process).map_err(BootError::Seed)?;
        tiles.push(surface);
    }
    let strip = spawn_strip(&engine, &session)?;

    let programs_root = project_path(&cascade, "host").expect("the cascade requires host");
    Ok(Booted {
        engine,
        host_rx,
        provider,
        session,
        tab: workspace.tab,
        active_db,
        tiles,
        strip,
        programs_root,
    })
}

/// One boot-suite run. The process is placed `instance` on the session, which
/// *is* sidebar presence (host.md §The Composition Types).
fn spawn_surface(
    engine: &Engine,
    name: &str,
    session: &ChunkId,
    read_roots: Vec<ChunkId>,
) -> Result<TileProcess, BootError> {
    spawn_with_boundaries(engine, name, session, read_roots, vec![session.clone()])
}

fn spawn_with_boundaries(
    engine: &Engine,
    name: &str,
    session: &ChunkId,
    read_roots: Vec<ChunkId>,
    write_roots: Vec<ChunkId>,
) -> Result<TileProcess, BootError> {
    let program = engine
        .resolve_name(&Context::host(), &format!("host/{name}"))
        .map_err(|e| BootError::Engine(format!("resolving host/{name}: {e}")))?;
    let process = engine
        .run(
            &Context::host(),
            engine::RunArgs {
                program_id: program,
                chunks: arguments_for(name, session),
                placements: vec![session.clone()],
                mode: engine::RunMode::Child,
                read_boundary: engine::BoundarySpec::Roots(read_roots),
                write_boundary: engine::BoundarySpec::Roots(write_roots),
                timeout_ms: None,
            },
        )
        .map_err(|e| BootError::Engine(format!("running host/{name}: {e}")))?;
    Ok(TileProcess { program: name.to_string(), process })
}

/// The strip, with its boundaries. host.md boot step 10 names read roots
/// `[session, engine/process, engine/program]` and write root `[session]`;
/// two roots join each side beyond the spec's letter, both recorded:
///
/// - `host/tile` (write): the tiling verbs commit new tiles, and a new tile
///   must be *typed* — placed instance on the archetype — to satisfy the tab's
///   `accepts` (substrate.md); a placement's scope must lie within the write
///   boundary, and the archetype is not reachable from the session. Step 10
///   predates the tiling verbs; the widening is the smallest that lets them
///   exist. **Recorded gap** against host.md step 10.
/// - the session's `hidden` marker (both sides): a literal root, because the
///   marker has no instance chain (seed.rs, `hidden_id`) — reads exclude it,
///   the hide verb writes into it.
///
/// The archetype reads live in the read-only engine mount — a boundary root is
/// a reference, never a modification (engine.md, R5).
fn spawn_strip(engine: &Engine, session: &ChunkId) -> Result<TileProcess, BootError> {
    let hidden = seed::hidden_id(session);
    let mut read_roots = vec![session.clone()];
    for path in ["engine/process", "engine/program"] {
        let id = engine
            .resolve_name(&Context::host(), path)
            .map_err(|e| BootError::Engine(format!("resolving {path}: {e}")))?;
        read_roots.push(id);
    }
    read_roots.push(hidden.clone());
    let tile_archetype = engine
        .resolve_name(&Context::host(), "host/tile")
        .map_err(|e| BootError::Engine(format!("resolving host/tile: {e}")))?;
    let write_roots = vec![session.clone(), tile_archetype, hidden];
    spawn_with_boundaries(engine, STRIP_PROGRAM, session, read_roots, write_roots)
}

/// The typed arguments a boot-suite run receives, one argument chunk per role
/// with keys within it (programs.md §1). Id-less, so the engine mints a fresh
/// chunk per run.
///
/// `read`'s one required argument is the scope ids to view (§3.5). The
/// sidebar's is the session it renders — **recorded gap**: programs.md §3.2
/// declares no argument type for it, and host.md step 10 gives it boundaries
/// but no arguments, so the key name `session` is this build's reading.
///
/// **Recorded gap.** The argument *type* chunk these should validate against
/// (`programs/argument` instance, `relates` on the program, with a
/// `body.schema` and `spec.required`) has no seeding home: bootstrap.md does
/// not list the host's own programs at all.
fn arguments_for(program: &str, session: &ChunkId) -> Vec<db::ChunkDeclaration> {
    let body = match program {
        "read-tile" => json!({ "target": [session.as_str()] }),
        STRIP_PROGRAM => json!({ "session": session.as_str() }),
        _ => return vec![],
    };
    vec![db::ChunkDeclaration {
        id: None,
        name: Some("request".into()),
        spec: None,
        body: Some(body),
        removed: false,
    }]
}

fn project_path(cascade: &Cascade, name: &str) -> Option<PathBuf> {
    std::iter::once(&cascade.active)
        .chain(cascade.peers.iter())
        .find(|project| project.name == name)
        .map(|project| project.path.clone())
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

#[cfg(test)]
mod tests {
    use super::*;

    /// Only the declared word puts a program in the overlay layer — an absent
    /// field, a null body, or a value the rim does not know is tile content.
    #[test]
    fn a_program_reaches_the_overlay_layer_only_by_saying_so() {
        assert_eq!(surface_of(Some(&json!({ "surface": "overlay" }))), Surface::Overlay);
        assert_eq!(surface_of(Some(&json!({ "runtime": "webview" }))), Surface::Tile);
        assert_eq!(surface_of(Some(&json!({ "surface": "tile" }))), Surface::Tile);
        assert_eq!(surface_of(Some(&json!({ "surface": 1 }))), Surface::Tile);
        assert_eq!(surface_of(None), Surface::Tile);
    }

    /// The rim's declaration and the seeded field say the same word.
    #[test]
    fn the_seeded_context_menu_is_an_overlay() {
        let declaration = crate::seed::host_declaration();
        let menu = declaration
            .chunks
            .iter()
            .find(|c| c.name.as_deref() == Some("context-menu"))
            .expect("the host project ships a context menu");
        assert_eq!(surface_of(menu.body.as_ref()), Surface::Overlay);
    }
}
