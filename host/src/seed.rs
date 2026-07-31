//! Per-project bootstrap seeding (`pilot/bootstrap.md`): the initial commit
//! each first-party project's substrate starts with. The routines live here
//! because the host runs them (`ol init` is host implementation — bootstrap.md,
//! closing note). Ids are readable strings per the fixture convention
//! (board.md tracked debt); the engine's `resolve_name` is the seam that makes
//! generated ids a later swap.
//!
//! Idempotence follows db.md's meta-table pattern lifted to the substrate:
//! each routine is one atomic commit whose root chunk is the marker — root
//! present means the commit landed; seeding is skipped.

use db::{
    ChunkDeclaration, ChunkId, CommitOpts, Db, Declaration, PlacementSpec, PlacementType, ReadOpts,
    Spec,
};
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
