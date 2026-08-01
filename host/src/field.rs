//! Fixture field data — pure. Chunks and placements shaped per
//! `spec/substrate.md` (chunk = id/name/spec/body; placement =
//! chunk/scope/type/seq) holding the archetypes `spec/host.md`
//! (§The Composition Types) and `spec/engine.md` (§Program and Process)
//! define, plus a demo session. Readable-string ids follow the fixture
//! convention (board.md tracked debt: real ids are generated).

use serde_json::{json, Value};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum PlacementType {
    Instance,
    Relates,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Chunk {
    pub id: String,
    pub name: Option<String>,
    pub spec: Option<Value>,
    pub body: Option<Value>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Placement {
    pub chunk: String,
    pub scope: String,
    pub type_: PlacementType,
    pub seq: Option<i64>,
}

pub fn chunk(id: &str, name: Option<&str>, spec: Option<Value>, body: Option<Value>) -> Chunk {
    Chunk { id: id.into(), name: name.map(Into::into), spec, body }
}

pub fn instance(chunk: &str, scope: &str) -> Placement {
    Placement { chunk: chunk.into(), scope: scope.into(), type_: PlacementType::Instance, seq: None }
}

pub fn instance_seq(chunk: &str, scope: &str, seq: i64) -> Placement {
    Placement { chunk: chunk.into(), scope: scope.into(), type_: PlacementType::Instance, seq: Some(seq) }
}

pub fn relates(chunk: &str, scope: &str) -> Placement {
    Placement { chunk: chunk.into(), scope: scope.into(), type_: PlacementType::Relates, seq: None }
}

// Archetype ids (host.md §The Composition Types, engine.md §Program and Process).
pub const HOST_SESSION: &str = "host/session";
pub const HOST_TAB: &str = "host/tab";
pub const HOST_TILE: &str = "host/tile";
pub const ENGINE_PROGRAM: &str = "engine/program";
pub const ENGINE_PROCESS: &str = "engine/process";

// The demo field's entities.
pub const DEMO_SESSION: &str = "demo-session";
pub const DEMO_TAB: &str = "tab-main";

/// The hollow host's hardcoded field: archetypes, three webview programs,
/// three running processes, and a tab whose tile tree splits twice —
/// reader | (sidebar / inspector).
pub fn demo() -> (Vec<Chunk>, Vec<Placement>) {
    let chunks = vec![
        // Archetypes.
        chunk(
            HOST_SESSION,
            Some("session"),
            Some(json!({"propagate": true, "accepts": ["tab", "process"]})),
            Some(json!({"text": "The outer container. Restorable, shareable."})),
        ),
        chunk(
            HOST_TAB,
            Some("tab"),
            Some(json!({"propagate": true, "accepts": ["tile"]})),
            Some(json!({"text": "The root of a tile tree."})),
        ),
        chunk(
            HOST_TILE,
            Some("tile"),
            Some(json!({"ordered": true})),
            Some(json!({"text": "A split or leaf in the tile tree."})),
        ),
        chunk(
            ENGINE_PROGRAM,
            Some("program"),
            Some(json!({"required": ["executable", "runtime"]})),
            Some(json!({"text": "A chunk with an executable and a runtime declaration."})),
        ),
        chunk(
            ENGINE_PROCESS,
            Some("process"),
            Some(json!({"propagate": true})),
            Some(json!({"text": "One run of a program."})),
        ),
        // Session and tab.
        chunk(DEMO_SESSION, Some("demo"), None, Some(json!({"text": "Hollow-host demo session"}))),
        chunk(DEMO_TAB, Some("main"), None, Some(json!({"name": "main"}))),
        // Programs (webview demo programs).
        chunk(
            "prog-read-tile",
            Some("read-tile"),
            None,
            Some(json!({"executable": "programs/read-tile/src/index.tsx", "runtime": "webview"})),
        ),
        chunk(
            "prog-sidebar",
            Some("sidebar"),
            None,
            Some(json!({"executable": "programs/sidebar/src/index.tsx", "runtime": "webview"})),
        ),
        chunk(
            "prog-inspector",
            Some("inspector"),
            None,
            Some(json!({"executable": "programs/inspector/src/index.tsx", "runtime": "webview"})),
        ),
        // Processes — engine-written body state (engine.md §Program and Process).
        chunk("proc-read-tile-1", None, None, Some(json!({"status": "running", "started": "2026-07-30T09:00:00Z"}))),
        chunk("proc-sidebar-1", None, None, Some(json!({"status": "running", "started": "2026-07-30T09:00:01Z"}))),
        chunk("proc-inspector-1", None, None, Some(json!({"status": "running", "started": "2026-07-30T09:00:02Z"}))),
        // Tiles — split bodies carry direction/ratio; leaves are empty (host.md).
        chunk("tile-root", None, None, Some(json!({"direction": "horizontal", "ratio": 0.55}))),
        chunk("tile-reader", None, None, None),
        chunk("tile-right", None, None, Some(json!({"direction": "vertical", "ratio": 0.5}))),
        chunk("tile-side", None, None, None),
        chunk("tile-inspect", None, None, None),
    ];

    let placements = vec![
        // Session and tab membership.
        instance(DEMO_SESSION, HOST_SESSION),
        instance(DEMO_TAB, HOST_TAB),
        instance(DEMO_TAB, DEMO_SESSION),
        // Programs on the program archetype.
        instance("prog-read-tile", ENGINE_PROGRAM),
        instance("prog-sidebar", ENGINE_PROGRAM),
        instance("prog-inspector", ENGINE_PROGRAM),
        // Processes: instance on engine/process, on their program, and on the
        // session (caller-supplied placement; engine.md §Program and Process).
        instance("proc-read-tile-1", ENGINE_PROCESS),
        instance("proc-read-tile-1", "prog-read-tile"),
        instance("proc-read-tile-1", DEMO_SESSION),
        instance("proc-sidebar-1", ENGINE_PROCESS),
        instance("proc-sidebar-1", "prog-sidebar"),
        instance("proc-sidebar-1", DEMO_SESSION),
        instance("proc-inspector-1", ENGINE_PROCESS),
        instance("proc-inspector-1", "prog-inspector"),
        instance("proc-inspector-1", DEMO_SESSION),
        // Tile typing.
        instance("tile-root", HOST_TILE),
        instance("tile-reader", HOST_TILE),
        instance("tile-right", HOST_TILE),
        instance("tile-side", HOST_TILE),
        instance("tile-inspect", HOST_TILE),
        // Tile tree: on tab or parent tile, seq chooses split side (host.md).
        instance_seq("tile-root", DEMO_TAB, 1),
        instance_seq("tile-reader", "tile-root", 1),
        instance_seq("tile-right", "tile-root", 2),
        instance_seq("tile-side", "tile-right", 1),
        instance_seq("tile-inspect", "tile-right", 2),
        // Leaf → displayed process (relates; host.md §Tile Geometry).
        relates("tile-reader", "proc-read-tile-1"),
        relates("tile-side", "proc-sidebar-1"),
        relates("tile-inspect", "proc-inspector-1"),
    ];

    (chunks, placements)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_placement_references_a_declared_chunk() {
        let (chunks, placements) = demo();
        let exists = |id: &str| chunks.iter().any(|c| c.id == id);
        for p in &placements {
            assert!(exists(&p.chunk), "placed chunk {} not declared", p.chunk);
            assert!(exists(&p.scope), "scope {} not declared", p.scope);
        }
    }

    #[test]
    fn programs_carry_executable_and_runtime() {
        // engine/program spec: required ['executable', 'runtime'].
        let (chunks, placements) = demo();
        let program_ids: Vec<&str> = placements
            .iter()
            .filter(|p| p.scope == ENGINE_PROGRAM && p.type_ == PlacementType::Instance)
            .map(|p| p.chunk.as_str())
            .collect();
        assert_eq!(program_ids.len(), 3);
        for id in program_ids {
            let body = chunks.iter().find(|c| c.id == id).unwrap().body.as_ref().unwrap();
            assert!(body.get("executable").is_some(), "{id} missing executable");
            assert!(body.get("runtime").is_some(), "{id} missing runtime");
        }
    }

    #[test]
    fn each_leaf_tile_relates_one_process() {
        let (_, placements) = demo();
        for leaf in ["tile-reader", "tile-side", "tile-inspect"] {
            let displayed: Vec<&Placement> = placements
                .iter()
                .filter(|p| p.chunk == leaf && p.type_ == PlacementType::Relates)
                .collect();
            assert_eq!(displayed.len(), 1, "{leaf} must display exactly one process");
        }
    }
}
