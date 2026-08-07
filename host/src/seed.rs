//! Per-project bootstrap seeding (`@md/spec/bootstrap.md`): the initial commit
//! each first-party project's substrate starts with. The routines live here
//! because the host runs them (`ol init` is host implementation — bootstrap.md,
//! closing note). Ids are readable strings per the fixture convention
//! (@md/board.md tracked debt); the engine's `resolve_name` is the seam that makes
//! generated ids a later swap.
//!
//! Idempotence follows db.md's meta-table pattern lifted to the substrate:
//! each routine is one atomic commit whose root chunk is the marker — root
//! present means the commit landed; seeding is skipped.

use db::{
    ChunkDeclaration, ChunkId, CommitOpts, Db, Declaration, PlacementSpec, PlacementType, ReadOpts,
    Spec,
};
use engine::{Context, Engine};
use serde_json::json;
use std::path::Path;

/// Surface programs are long-lived; engine.md §Timeouts names defaults only
/// for tool (30 s) and agent (300 s) programs — a surface default is a
/// recorded spec gap. One day keeps the demo honest without pretending
/// "no timeout" exists.
const SURFACE_TIMEOUT_MS: u64 = 86_400_000;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum SeedOutcome {
    Seeded,
    AlreadySeeded,
    /// The project is not first-party; its bootstrap is not ours to run.
    NoRoutine,
}

/// The routine for a first-party project, keyed by its project.toml name.
pub fn routine_for(project_name: &str) -> Option<(&'static str, Declaration)> {
    match project_name {
        "engine" => Some(("engine", engine_declaration())),
        "host" => Some(("host", host_declaration())),
        "agents" => Some(("agents", agents_declaration())),
        _ => None,
    }
}

/// Open (creating if absent) the project's `.ol/db` and run its bootstrap
/// commit unless the root chunk already exists. The db handle drops before
/// return, so a read-only reopen follows cleanly.
pub fn ensure_seeded(project_path: &Path, project_name: &str) -> Result<SeedOutcome, String> {
    let Some((root, declaration)) = routine_for(project_name) else {
        return Ok(SeedOutcome::NoRoutine);
    };
    let db = Db::open(project_path).map_err(|e| format!("open {}: {e}", project_path.display()))?;
    let present = db
        .get(ChunkId::from(root), ReadOpts::default())
        .map_err(|e| format!("probe {root}: {e}"))?;
    if present.is_some() {
        return Ok(SeedOutcome::AlreadySeeded);
    }
    db.commit(&declaration, CommitOpts::default())
        .map_err(|e| format!("bootstrap commit for {project_name}: {e}"))?;
    Ok(SeedOutcome::Seeded)
}

/// The engine project's bootstrap (bootstrap.md §The engine project's
/// bootstrap): runtime contracts and primitives. `engine/mount` is virtual —
/// never seeded.
pub fn engine_declaration() -> Declaration {
    Declaration {
        chunks: vec![
            chunk("engine", "engine", None, json!({ "text": "Root scope of the engine project." })),
            chunk(
                "engine/program",
                "program",
                Some(Spec { required: strings(&["executable", "runtime"]), ..Spec::default() }),
                json!({ "text": "A chunk with an executable and a runtime declaration. Optional body fields: capabilities, boundary, timeout_ms." }),
            ),
            chunk(
                "engine/process",
                "process",
                Some(Spec { propagate: true, ..Spec::default() }),
                json!({ "text": "The artifact of a run. Engine-written body: status, started, pid, timeout_ms, error?." }),
            ),
            chunk("engine/read-boundary", "read-boundary", None, json!({ "text": "Scopes a process may read; roots are relates members." })),
            chunk("engine/write-boundary", "write-boundary", None, json!({ "text": "Scopes a process may write; roots are relates members." })),
        ],
        placements: vec![
            instance("engine/program", "engine"),
            instance("engine/process", "engine"),
            instance("engine/read-boundary", "engine"),
            instance("engine/write-boundary", "engine"),
            // Boundaries are execution configuration on the process, not
            // structural content (bootstrap.md item 4–5).
            relates("engine/read-boundary", "engine/process"),
            relates("engine/write-boundary", "engine/process"),
        ],
        message: Some("bootstrap".into()),
    }
}

/// The host project's bootstrap (bootstrap.md §The host project's bootstrap):
/// composition primitives, plus the first-party webview surface programs
/// (host-shipped programs are unlisted in bootstrap.md — recorded gap). Being
/// declared is not being run: boot runs the tile programs and the sidebar
/// strip; `inspector` is declared and bundle-less until it is written.
pub fn host_declaration() -> Declaration {
    let mut chunks = vec![
        chunk("host", "host", None, json!({ "text": "Root scope of the host project." })),
        chunk(
            "host/session",
            "session",
            Some(Spec { propagate: true, accepts: strings(&["tab", "process"]), ..Spec::default() }),
            json!({ "text": "The outer container of the interface state: tabs and processes." }),
        ),
        chunk(
            "host/tab",
            "tab",
            Some(Spec { propagate: true, accepts: strings(&["tile"]), ..Spec::default() }),
            json!({ "text": "The root of a tile tree. Workspaces are tabs." }),
        ),
        chunk(
            "host/tile",
            "tile",
            Some(Spec { propagate: true, ordered: true, ..Spec::default() }),
            json!({ "text": "A node in the split tree. Splits carry { direction, ratio }; leaves are empty and relate a process." }),
        ),
        chunk("host/overlay", "overlay", None, json!({ "text": "A program rendered above its anchor rather than inside the tile composition." })),
        chunk(
            "host/recipe",
            "recipe",
            Some(Spec { propagate: true, accepts: strings(&["tile"]), ..Spec::default() }),
            json!({ "text": "A preserved tile subtree that can be spawned into a new root." }),
        ),
        // Anchor row: `engine/process` is relates-placed on host/session below
        // so the accepts name 'process' resolves (bootstrap.md item 2 — the
        // resolve-empty trap). The member must be visible to this db's scope
        // reads; the sentinel keeps federated reads finding the genuine
        // record in the engine project's db.
        ChunkDeclaration {
            id: Some(ChunkId::from("engine/process")),
            body: Some(json!({ engine::ANCHOR_KEY: true })),
            ..ChunkDeclaration::default()
        },
    ];
    let mut placements = vec![
        instance("host/session", "host"),
        instance("host/tab", "host"),
        instance("host/tile", "host"),
        instance("host/overlay", "host"),
        instance("host/recipe", "host"),
        // Type definitions relates-placed so accepts names resolve within the
        // archetype's own scope (bootstrap.md items 2–3, 6).
        relates("host/tab", "host/session"),
        relates("engine/process", "host/session"),
        relates("host/tile", "host/tab"),
        relates("host/tile", "host/recipe"),
    ];
    // The first-party surfaces, each with what its body says it *is* on screen:
    // a program declaring `surface: 'overlay'` mounts as a full-window layer
    // above the tiles instead of into tile geometry (host.md §Overlays,
    // §Command Palette — "just another program, living as an overlay").
    for (name, surface) in [
        ("read-tile", None),
        ("sidebar", None),
        ("inspector", None),
        ("context-menu", Some(crate::boot::OVERLAY_SURFACE)),
    ] {
        let id = format!("host/{name}");
        let mut body = json!({
            "executable": format!("programs/{name}/src/index.tsx"),
            "runtime": "webview",
            "timeout_ms": SURFACE_TIMEOUT_MS,
            "text": "First-party demo surface program.",
        });
        if let Some(surface) = surface {
            body[crate::boot::SURFACE_KEY] = json!(surface);
        }
        chunks.push(chunk(&id, name, None, body));
        placements.push(instance(&id, "host"));
        // Invocables placed instance on the mounted engine/program archetype —
        // the cross-db federation pattern (bootstrap.md, opening note).
        placements.push(instance(&id, "engine/program"));
    }
    Declaration { chunks, placements, message: Some("bootstrap".into()) }
}

/// The agents project's bootstrap — the part that stands today (bootstrap.md
/// §The `agents` project's bootstrap, items 1–3). Items 4–7 (filesystem,
/// shell, web, model, agent, echo) are deferred: their executables cannot
/// exist yet and no VM provider is registered in v0.1-now.
pub fn agents_declaration() -> Declaration {
    Declaration {
        chunks: vec![
            chunk("agents", "agents", None, json!({ "text": "Root scope of the agents project." })),
            chunk(
                "agents/session",
                "session",
                Some(Spec { propagate: true, ordered: true, ..Spec::default() }),
                json!({ "text": "An agent session is turns: each entity the invocation's process chunk, dual-placed with seq. Content deliberately wildcard." }),
            ),
            chunk(
                "agents/control",
                "control",
                Some(Spec { required: strings(&["signal"]), ..Spec::default() }),
                json!({ "text": "pause | resume | abort-completion | adjust; body.target names the turn (defaults to the active one)." }),
            ),
        ],
        placements: vec![
            instance("agents/session", "agents"),
            instance("agents/control", "agents"),
            relates("agents/control", "agents/session"),
        ],
        message: Some("bootstrap".into()),
    }
}

// ---- the initial workspace ---------------------------------------------------
//
// bootstrap.md's closing note: bootstrap creates no `host/session` instance —
// the first session is a runtime commit on first launch. The tab and the first
// leaf follow the same rule, and for a harder reason than convention: the leaf
// displays whichever process the current launch spawned, and a process is new
// every boot, so the tree's relates edge is per-boot runtime state that no
// once-ever bootstrap commit could carry.
//
// **Migration pain, said honestly.** Bootstrap is idempotent by marker, so a
// changed routine never reaches an already-seeded db — which is why none of
// this lives in `host_declaration()`. The workspace commit instead re-checks
// piece by piece (session, then tab, then leaf) on every boot: a db seeded by
// an earlier build that has the session but no tab gains exactly the missing
// pieces. That is a hand-rolled migration in miniature; the real path stays
// unruled debt (bootstrap.md, *Open — no migration path*).

/// Deterministic readable ids, per the fixture convention (@md/board.md tracked
/// debt: real ids are generated; `resolve_name` is the seam).
pub const SESSION_ID: &str = "session-main";
pub const SESSION_NAME: &str = "main";
pub const TAB_ID: &str = "tab-main";
pub const LEAF_ID: &str = "tile-first";

/// The session-local hidden marker (programs.md §3.2): chunks placed `relates`
/// on it are un-shown — the sidebar reads session minus hidden through the
/// exclude root. The id is derived from the session so the sidebar can exclude
/// it before it exists (excluding an unresolved root is an empty exclusion),
/// and it is granted as a literal boundary root — it has no instance chain.
pub fn hidden_id(session: &ChunkId) -> ChunkId {
    ChunkId::from(format!("{session}-hidden").as_str())
}

/// The session's settings chunk (author ruling, *solution for now*): host
/// configuration lives in the field as one chunk on a derived id, beside the
/// session it configures — readable at boot, writable later by whatever
/// surface edits settings. `prewarm` names the programs whose surfaces get a
/// warm pane before their first launch (`main`'s prewarm lane).
///
/// **Recorded gap.** No spec gives settings an archetype or a home; like the
/// hidden marker, this chunk stands on a derived id with no instance chain
/// until a ruling places it.
pub fn settings_id(session: &ChunkId) -> ChunkId {
    ChunkId::from(format!("{session}-settings").as_str())
}

pub const PREWARM_KEY: &str = "prewarm";
pub const PREWARM_DEFAULT: [&str; 1] = ["host/context-menu"];
/// Commit each surface open's stage timings to the field (`main`'s telemetry
/// lane) — a card per execution in any read of the session.
pub const TIMINGS_KEY: &str = "timings";

/// What a fresh settings chunk holds.
fn settings_defaults() -> serde_json::Value {
    let mut body = json!({
        "text": "Host settings, read at boot. prewarm: programs whose surfaces get a warm pane before their first launch. timings: commit each surface open's stage timings to the field.",
    });
    body[PREWARM_KEY] = json!(PREWARM_DEFAULT);
    body[TIMINGS_KEY] = json!(true);
    body
}

/// The settings body brought up to the defaults: a key this build grew is
/// added with its default value, and a key the field already carries is never
/// touched — the person's word outranks the build's (the session
/// `current-tab` patch is the precedent). `None` when nothing is missing.
pub fn merged_settings(existing: Option<serde_json::Value>) -> Option<serde_json::Value> {
    let defaults = settings_defaults();
    let mut body = existing.unwrap_or_else(|| json!({}));
    let mut grew = false;
    for (key, value) in defaults.as_object().expect("defaults are an object") {
        if body.get(key).is_none() {
            body[key.as_str()] = value.clone();
            grew = true;
        }
    }
    grew.then_some(body)
}

pub struct Workspace {
    pub session: ChunkId,
    pub tab: ChunkId,
    pub leaf: ChunkId,
}

/// Find-or-create the initial workspace: one session holding one tab holding
/// one leaf tile. Idempotent per piece; one commit carries whatever is missing.
pub fn ensure_workspace(engine: &Engine) -> Result<Workspace, String> {
    let ctx = Context::host();
    let session_archetype = resolve(engine, "host/session")?;
    let tab_archetype = resolve(engine, "host/tab")?;
    let tile_archetype = resolve(engine, "host/tile")?;

    let mut chunks: Vec<ChunkDeclaration> = Vec::new();
    let mut placements: Vec<PlacementSpec> = Vec::new();

    let session = ChunkId::from(SESSION_ID);
    let session_exists = exists(engine, &session)?;
    if !session_exists {
        chunks.push(chunk(
            SESSION_ID,
            SESSION_NAME,
            None,
            json!({ "text": "Initial session, created on first launch.", "current-tab": TAB_ID }),
        ));
        placements.push(place(SESSION_ID, session_archetype.as_str(), PlacementType::Instance));
    }

    let tab = ChunkId::from(TAB_ID);
    if !exists(engine, &tab)? {
        chunks.push(chunk(TAB_ID, "main", None, json!({ "name": "main" })));
        placements.push(place(TAB_ID, tab_archetype.as_str(), PlacementType::Instance));
        placements.push(place(TAB_ID, SESSION_ID, PlacementType::Instance));
        if session_exists {
            // An earlier build's session predates the tab: point it now. A
            // chunk declaration replaces name/spec/body wholesale (db.md), so
            // the existing record is read and carried — a body-only patch
            // would silently clear the name.
            let opts = db::ReadOpts {
                include: db::Includes {
                    chunk_name: true,
                    chunk_spec: true,
                    chunk_body: true,
                    ..db::Includes::default()
                },
                ..db::ReadOpts::default()
            };
            let existing = engine
                .get(&ctx, &session, opts)
                .map_err(|e| format!("reading {session}: {e}"))?
                .ok_or_else(|| format!("session {session} vanished mid-boot"))?;
            let mut body = existing.body.unwrap_or_else(|| json!({}));
            body["current-tab"] = json!(TAB_ID);
            chunks.push(ChunkDeclaration {
                id: Some(session.clone()),
                name: existing.name,
                spec: existing.spec,
                body: Some(body),
                removed: false,
            });
        }
    }

    let leaf = ChunkId::from(LEAF_ID);
    if !exists(engine, &leaf)? {
        chunks.push(chunk(LEAF_ID, "first", None, json!({})));
        placements.push(place(LEAF_ID, tile_archetype.as_str(), PlacementType::Instance));
        placements.push(PlacementSpec {
            chunk: leaf.clone(),
            scope: tab.clone(),
            type_: PlacementType::Instance,
            seq: Some(1),
            active: true,
        });
    }

    let settings = settings_id(&session);
    let opts = db::ReadOpts {
        include: db::Includes {
            chunk_name: true,
            chunk_spec: true,
            chunk_body: true,
            ..db::Includes::default()
        },
        ..db::ReadOpts::default()
    };
    let existing =
        engine.get(&ctx, &settings, opts).map_err(|e| format!("reading {settings}: {e}"))?;
    match existing {
        None => {
            if let Some(body) = merged_settings(None) {
                chunks.push(chunk(settings.as_str(), "settings", None, body));
            }
        }
        // An earlier build's settings may predate a key: grow the missing
        // defaults, carry everything else (name, spec, the person's values).
        Some(item) => {
            if let Some(body) = merged_settings(item.body) {
                chunks.push(ChunkDeclaration {
                    id: Some(settings.clone()),
                    name: item.name,
                    spec: item.spec,
                    body: Some(body),
                    removed: false,
                });
            }
        }
    }

    if !chunks.is_empty() || !placements.is_empty() {
        engine
            .commit(&ctx, Declaration { chunks, placements, message: Some("initial workspace".into()) })
            .map_err(|e| format!("creating the initial workspace: {e}"))?;
    }
    Ok(Workspace { session, tab, leaf })
}

/// Point a leaf at the process it displays (host.md §Tile Geometry: rendering
/// derives from the process placed `relates` on the leaf). Every boot spawns
/// fresh processes, so the previous boot's relates edges deactivate — lossless,
/// but no longer current. One commit.
pub fn point_leaf(engine: &Engine, leaf: &ChunkId, process: &ChunkId) -> Result<(), String> {
    let ctx = Context::host();
    let opts = db::ReadOpts {
        include: db::Includes { chunk_placements: true, ..db::Includes::default() },
        ..db::ReadOpts::default()
    };
    let item = engine
        .get(&ctx, leaf, opts)
        .map_err(|e| format!("reading leaf {leaf}: {e}"))?
        .ok_or_else(|| format!("leaf {leaf} does not exist"))?;
    let mut placements: Vec<PlacementSpec> = item
        .placements
        .unwrap_or_default()
        .into_iter()
        .filter(|p| p.type_ == PlacementType::Relates && p.scope_id != *process)
        // Provenance rows (`engine/mount:*`) are synthesized, never stored.
        .filter(|p| !p.scope_id.as_str().starts_with("engine/mount"))
        .map(|p| PlacementSpec {
            chunk: leaf.clone(),
            scope: p.scope_id,
            type_: PlacementType::Relates,
            seq: None,
            active: false,
        })
        .collect();
    placements.push(PlacementSpec {
        chunk: leaf.clone(),
        scope: process.clone(),
        type_: PlacementType::Relates,
        seq: None,
        active: true,
    });
    engine
        .commit(
            &ctx,
            Declaration {
                chunks: vec![],
                placements,
                message: Some(format!("leaf {leaf} displays {process}")),
            },
        )
        .map_err(|e| format!("pointing leaf {leaf} at {process}: {e}"))?;
    Ok(())
}

fn resolve(engine: &Engine, path: &str) -> Result<ChunkId, String> {
    engine
        .resolve_name(&Context::host(), path)
        .map_err(|e| format!("resolving {path}: {e}"))
}

fn exists(engine: &Engine, id: &ChunkId) -> Result<bool, String> {
    engine
        .get(&Context::host(), id, db::ReadOpts::default())
        .map(|item| item.is_some())
        .map_err(|e| format!("probing {id}: {e}"))
}

fn chunk(id: &str, name: &str, spec: Option<Spec>, body: serde_json::Value) -> ChunkDeclaration {
    ChunkDeclaration {
        id: Some(ChunkId::from(id)),
        name: Some(name.to_string()),
        spec,
        body: Some(body),
        removed: false,
    }
}

fn strings(items: &[&str]) -> Vec<String> {
    items.iter().map(|s| s.to_string()).collect()
}

fn instance(chunk: &str, scope: &str) -> PlacementSpec {
    place(chunk, scope, PlacementType::Instance)
}

fn relates(chunk: &str, scope: &str) -> PlacementSpec {
    place(chunk, scope, PlacementType::Relates)
}

fn place(chunk: &str, scope: &str, type_: PlacementType) -> PlacementSpec {
    PlacementSpec {
        chunk: ChunkId::from(chunk),
        scope: ChunkId::from(scope),
        type_,
        seq: None,
        active: true,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::{Includes, ScopeOpts};

    fn fresh_dir(tag: &str) -> std::path::PathBuf {
        static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
        let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir()
            .join("ol-host-tests")
            .join(format!("{tag}-{nanos:x}-{n}-{:x}", std::process::id()))
    }

    struct TempProject(std::path::PathBuf);
    impl Drop for TempProject {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }

    /// Every placement in a routine references a chunk it declares or a
    /// deliberate cross-db id — nothing dangles by accident.
    #[test]
    fn placements_reference_declared_or_cross_db_chunks() {
        let cross_db: &[&str] = &["engine/program", "engine/process"];
        for (name, declaration) in [
            ("engine", engine_declaration()),
            ("host", host_declaration()),
            ("agents", agents_declaration()),
        ] {
            let declared: Vec<&str> = declaration
                .chunks
                .iter()
                .filter_map(|c| c.id.as_ref().map(|i| i.as_str()))
                .collect();
            for p in &declaration.placements {
                for id in [p.chunk.as_str(), p.scope.as_str()] {
                    assert!(
                        declared.contains(&id) || cross_db.contains(&id),
                        "{name}: placement references undeclared {id}"
                    );
                }
            }
        }
    }

    #[test]
    fn every_seeded_chunk_is_named() {
        // The name-lookup convention depends on it — except anchor rows,
        // which are placement scaffolding, deliberately nameless.
        for declaration in [engine_declaration(), host_declaration(), agents_declaration()] {
            for c in &declaration.chunks {
                let is_anchor = c
                    .body
                    .as_ref()
                    .and_then(|b| b.get(engine::ANCHOR_KEY))
                    .is_some();
                assert_eq!(c.name.is_none(), is_anchor, "{:?} name/anchor mismatch", c.id);
            }
        }
    }

    #[test]
    fn settings_grow_missing_defaults_and_never_overwrite() {
        let fresh = merged_settings(None).expect("everything is missing");
        assert_eq!(fresh[PREWARM_KEY], json!(["host/context-menu"]));
        assert_eq!(fresh[TIMINGS_KEY], json!(true));

        // Nothing missing → no patch, no commit.
        assert_eq!(merged_settings(Some(fresh.clone())), None);

        // A key the person set keeps their value — even a falsy one — and a
        // key this build grew arrives with its default beside it.
        let mut theirs = json!({ "text": "kept" });
        theirs[PREWARM_KEY] = json!([]);
        theirs[TIMINGS_KEY] = json!(false);
        assert_eq!(merged_settings(Some(theirs.clone())), None, "false is a value, not a gap");
        let mut partial = json!({ "text": "kept" });
        partial[PREWARM_KEY] = json!(["theirs"]);
        let grown = merged_settings(Some(partial)).expect("timings was missing");
        assert_eq!(grown["text"], "kept");
        assert_eq!(grown[PREWARM_KEY], json!(["theirs"]));
        assert_eq!(grown[TIMINGS_KEY], json!(true));
    }

    #[test]
    fn seeding_is_idempotent() {
        let dir = TempProject(fresh_dir("seed-idem"));
        assert_eq!(ensure_seeded(&dir.0, "engine").unwrap(), SeedOutcome::Seeded);
        assert_eq!(ensure_seeded(&dir.0, "engine").unwrap(), SeedOutcome::AlreadySeeded);
        // The second call added nothing: still exactly one non-bootstrap commit.
        let db = Db::open(&dir.0).unwrap();
        let result = db
            .scope(
                &[ChunkId::from("engine")],
                ScopeOpts { include: Includes::content(), ..ScopeOpts::default() },
            )
            .unwrap();
        assert_eq!(result.in_scope, 4, "program, process, read/write-boundary");
    }

    #[test]
    fn unknown_projects_have_no_routine() {
        let dir = TempProject(fresh_dir("seed-none"));
        assert_eq!(ensure_seeded(&dir.0, "somebody-else").unwrap(), SeedOutcome::NoRoutine);
        assert!(!dir.0.join(".ol").join("db").exists(), "no db created without a routine");
    }

    /// The resolve-empty trap stays closed at the db level: the host db's own
    /// scope read of host/session surfaces both type definitions, so accepts
    /// names 'tab' and 'process' resolve to members.
    #[test]
    fn host_session_type_definitions_are_visible_members()  {
        let dir = TempProject(fresh_dir("seed-trap"));
        ensure_seeded(&dir.0, "host").unwrap();
        let db = Db::open(&dir.0).unwrap();
        let result = db
            .scope(
                &[ChunkId::from("host/session")],
                ScopeOpts { include: Includes::content(), ..ScopeOpts::default() },
            )
            .unwrap();
        let ids: Vec<&str> = result.chunks.iter().map(|c| c.id.as_str()).collect();
        assert!(ids.contains(&"host/tab"), "{ids:?}");
        assert!(ids.contains(&"engine/process"), "anchor member visible: {ids:?}");
    }

    #[test]
    fn demo_programs_declare_executable_and_runtime() {
        let declaration = host_declaration();
        let programs: Vec<&ChunkDeclaration> = declaration
            .chunks
            .iter()
            .filter(|c| {
                declaration.placements.iter().any(|p| {
                    Some(&p.chunk) == c.id.as_ref() && p.scope.as_str() == "engine/program"
                })
            })
            .collect();
        assert_eq!(programs.len(), 4);
        for p in &programs {
            let body = p.body.as_ref().unwrap();
            assert!(body.get("executable").is_some());
            assert_eq!(body["runtime"], "webview");
        }

        // Only one of them mounts above the tiles rather than into one, and it
        // says so in its own body — the rim reads the field, not a list of names.
        let overlays: Vec<&str> = programs
            .iter()
            .filter(|p| p.body.as_ref().unwrap().get(crate::boot::SURFACE_KEY).is_some())
            .map(|p| p.name.as_deref().unwrap())
            .collect();
        assert_eq!(overlays, ["context-menu"]);
        let menu = programs.iter().find(|p| p.name.as_deref() == Some("context-menu")).unwrap();
        assert_eq!(menu.body.as_ref().unwrap()[crate::boot::SURFACE_KEY], "overlay");
    }
}
