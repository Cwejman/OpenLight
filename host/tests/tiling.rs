//! Field-driven tiling, end to end on the real engine (board directive, parts
//! 1–2): boot seeds the workspace and points its leaf at the boot's read-tile
//! run; the tiling verbs are commits through the context menu's granted
//! boundary — open-in-tile splits, close collapses, hide excludes — and every
//! declaration here is byte-for-byte the shape the sidebar composes
//! (`host/programs/sidebar/src/items.ts`, its other reading).

use db::ChunkId;
use host::adapter::EngineAdapter;
use host::boot;
use host::dispatch::{self, Context, EngineApi, Outcome, Parsed};
use host::seed;
use host::tree;
use serde_json::Value;
use std::path::PathBuf;

struct TempRoot(PathBuf);

impl Drop for TempRoot {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}

fn fresh_root(tag: &str) -> TempRoot {
    static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let root = std::env::temp_dir()
        .join("ol-tiling-tests")
        .join(format!("{tag}-{nanos:x}-{n}-{:x}", std::process::id()));
    let write = |project: &str, text: &str| {
        let dir = root.join(project).join(".ol");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("project.toml"), text).unwrap();
    };
    write("engine", "[project]\nname = \"engine\"\n");
    write(
        "host",
        "[project]\nname = \"host\"\n\n[[mounts]]\npath = \"../engine\"\nbranch = \"main\"\n",
    );
    write(
        "agents",
        "[project]\nname = \"agents\"\n\n[[mounts]]\npath = \"../host\"\nbranch = \"main\"\n\n[[mounts]]\npath = \"../engine\"\nbranch = \"main\"\n",
    );
    TempRoot(root)
}

async fn ipc(api: &dyn EngineApi, ctx: &Context, raw: &str) -> Value {
    match dispatch::parse(raw) {
        Parsed::Execute(request) => match dispatch::execute(api, ctx, &request).await {
            Outcome::Reply { response, .. } => serde_json::from_str(&response).unwrap(),
            Outcome::Drop { reason } => panic!("dropped: {reason}"),
        },
        Parsed::Settled(Outcome::Reply { response, .. }) => {
            serde_json::from_str(&response).unwrap()
        }
        Parsed::Settled(Outcome::Drop { reason }) => panic!("dropped at parse: {reason}"),
    }
}

fn ctx_of(pid: &ChunkId) -> Context {
    Context { process_id: Some(pid.as_str().to_string()) }
}

/// Raise the context menu exactly as the strip's click handler does — child of
/// the strip, granted read `[session]` and write `[session, host/tile,
/// hidden]` (boot.rs `spawn_strip`'s widened roots, intersected here).
async fn raise_menu(api: &dyn EngineApi, booted: &boot::Booted) -> ChunkId {
    let session = booted.session.as_str();
    let hidden = seed::hidden_id(&booted.session);
    let raw = format!(
        r#"{{"id":1,"op":"run","program":"host/context-menu","args":{{"chunks":[],"mode":"child","readBoundary":["{session}","{hidden}"],"writeBoundary":["{session}","host/tile","{hidden}"]}}}}"#
    );
    let reply = ipc(api, &ctx_of(&booted.strip.process), &raw).await;
    ChunkId::from(reply["result"]["process"].as_str().expect("the menu's process"))
}

/// The open-in-tile declarations the sidebar composes, two commits: the
/// engine's write-boundary walk runs against pre-commit state, so a bounded
/// identity cannot place onto a tile born in the same declaration — the tiles
/// are created and *typed* first (stage), then wired into the tree (graft).
fn stage_tiles() -> String {
    r#"{"chunks":[
        {"id":"tile-split-1","body":{"direction":"horizontal","ratio":0.5}},
        {"id":"tile-open-1","body":{}}
    ],"placements":[
        {"chunk":"tile-split-1","scope":"host/tile","type":"instance"},
        {"chunk":"tile-open-1","scope":"host/tile","type":"instance"}
    ],"message":"open in tile: stage"}"#
        .to_string()
}

fn graft_split(tab: &str, root: &str, root_seq: i64, process: &str) -> String {
    format!(
        r#"{{"chunks":[],"placements":[
            {{"chunk":"tile-split-1","scope":"{tab}","type":"instance","seq":{root_seq}}},
            {{"chunk":"{root}","scope":"{tab}","type":"instance","active":false}},
            {{"chunk":"{root}","scope":"tile-split-1","type":"instance","seq":1}},
            {{"chunk":"tile-open-1","scope":"tile-split-1","type":"instance","seq":2}},
            {{"chunk":"tile-open-1","scope":"{process}","type":"relates"}}
        ],"message":"open in tile: graft"}}"#
    )
}

/// The close-tile declaration: remove the leaf, and the split with one child
/// collapses — the sibling takes the split's place at the split's seq.
fn close_tile(leaf: &str, split: &str, sibling: &str, parent: &str, split_seq: i64) -> String {
    format!(
        r#"{{"chunks":[],"placements":[
            {{"chunk":"{leaf}","scope":"{split}","type":"instance","active":false}},
            {{"chunk":"{sibling}","scope":"{split}","type":"instance","active":false}},
            {{"chunk":"{split}","scope":"{parent}","type":"instance","active":false}},
            {{"chunk":"{sibling}","scope":"{parent}","type":"instance","seq":{split_seq}}}
        ],"message":"close tile"}}"#
    )
}

/// The hide declaration: the session-local hidden marker, and the process
/// placed relates onto it (programs.md §3.2).
fn hide(session: &str, hidden: &str, process: &str) -> String {
    format!(
        r#"{{"chunks":[
            {{"id":"{hidden}","name":"hidden","body":{{"text":"Un-shown sidebar entries."}}}}
        ],"placements":[
            {{"chunk":"{hidden}","scope":"{session}","type":"relates"}},
            {{"chunk":"{process}","scope":"{hidden}","type":"relates"}}
        ],"message":"hide from sidebar"}}"#
    )
}

fn leaf_count(view: &tree::TreeView) -> usize {
    view.leaves.len()
}

#[tokio::test(flavor = "multi_thread")]
async fn boot_seeds_the_workspace_and_points_the_leaf_at_the_read_tile_run() {
    let root = fresh_root("workspace");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");

    // The session names its current tab; the tab is the session's member.
    let session = booted
        .engine
        .get(
            &engine::Context::host(),
            &booted.session,
            db::ReadOpts {
                include: db::Includes { chunk_body: true, ..db::Includes::default() },
                ..db::ReadOpts::default()
            },
        )
        .unwrap()
        .expect("the session");
    assert_eq!(
        session.body.as_ref().and_then(|b| b.get("current-tab")).and_then(|t| t.as_str()),
        Some(booted.tab.as_str()),
    );

    // One leaf, relating the boot's read-tile process, executable resolved.
    let view = tree::read(&booted.engine, &booted.tab).expect("the tree");
    assert_eq!(leaf_count(&view), 1);
    let leaf = view.leaves.values().next().unwrap();
    assert_eq!(leaf.process.as_ref(), Some(&booted.tiles[0].process));
    assert_eq!(leaf.program_name.as_deref(), Some("read-tile"));
    assert_eq!(leaf.executable.as_deref(), Some("programs/read-tile/src/index.tsx"));

    booted.engine.clone().shutdown().await.unwrap();
}

#[tokio::test(flavor = "multi_thread")]
async fn a_second_boot_repoints_the_leaf_at_the_new_run() {
    let root = fresh_root("repoint");
    let agents = root.0.join("agents");
    let first = boot::boot(&agents).expect("first boot");
    let first_pid = first.tiles[0].process.clone();
    first.engine.clone().shutdown().await.unwrap();
    drop(first);

    let second = boot::boot(&agents).expect("second boot");
    let view = tree::read(&second.engine, &second.tab).expect("the tree");
    assert_eq!(leaf_count(&view), 1, "the workspace is found, not re-made");
    let leaf = view.leaves.values().next().unwrap();
    assert_eq!(leaf.process.as_ref(), Some(&second.tiles[0].process));
    assert_ne!(leaf.process.as_ref(), Some(&first_pid), "the stale edge deactivated");

    second.engine.clone().shutdown().await.unwrap();
}

/// A second read-tile run, session-placed — the sidebar item the verb acts on.
/// Host context, exactly the way boot spawns onto the session (a webview's own
/// `launch` still lands on no session — the gap swap.rs pins).
fn launch_target(booted: &boot::Booted) -> ChunkId {
    booted
        .engine
        .run(
            &engine::Context::host(),
            engine::RunArgs {
                program_id: booted
                    .engine
                    .resolve_name(&engine::Context::host(), "host/read-tile")
                    .unwrap(),
                chunks: vec![],
                placements: vec![booted.session.clone()],
                mode: engine::RunMode::Launch,
                read_boundary: engine::BoundarySpec::Roots(vec![booted.session.clone()]),
                write_boundary: engine::BoundarySpec::Roots(vec![booted.session.clone()]),
                timeout_ms: None,
            },
        )
        .expect("the target run")
}

/// The migration pain, exercised (seed.rs, *Migration pain, said honestly*):
/// a db from a build before the workspace — session present, tab and leaf
/// absent — gains exactly the missing pieces, and the session keeps its name
/// (a chunk declaration replaces name/spec/body wholesale, so the patch must
/// carry the existing record).
#[tokio::test(flavor = "multi_thread")]
async fn an_older_session_gains_the_workspace_without_losing_its_name() {
    let root = fresh_root("migrate");
    let agents = root.0.join("agents");
    let first = boot::boot(&agents).expect("first boot");
    first.engine.clone().shutdown().await.unwrap();
    drop(first);

    // Rewind to the pre-workspace shape: tab and leaf removed, session body
    // without a current-tab — the state an older build's db is in.
    {
        let db = db::Db::open(&agents).unwrap();
        db.commit(
            &db::Declaration {
                chunks: vec![
                    db::ChunkDeclaration {
                        id: Some(ChunkId::from(seed::TAB_ID)),
                        removed: true,
                        ..db::ChunkDeclaration::default()
                    },
                    db::ChunkDeclaration {
                        id: Some(ChunkId::from(seed::LEAF_ID)),
                        removed: true,
                        ..db::ChunkDeclaration::default()
                    },
                    db::ChunkDeclaration {
                        id: Some(ChunkId::from(seed::SESSION_ID)),
                        name: Some(seed::SESSION_NAME.into()),
                        spec: None,
                        body: Some(serde_json::json!({ "text": "Initial session, created on first launch." })),
                        removed: false,
                    },
                ],
                placements: vec![],
                message: Some("rewind to the pre-workspace shape".into()),
            },
            db::CommitOpts::default(),
        )
        .unwrap();
    }

    let second = boot::boot(&agents).expect("second boot migrates");
    let session = second
        .engine
        .get(
            &engine::Context::host(),
            &second.session,
            db::ReadOpts {
                include: db::Includes {
                    chunk_name: true,
                    chunk_body: true,
                    ..db::Includes::default()
                },
                ..db::ReadOpts::default()
            },
        )
        .unwrap()
        .expect("the session");
    assert_eq!(session.name.as_deref(), Some(seed::SESSION_NAME), "the name survives the patch");
    assert_eq!(
        session.body.as_ref().and_then(|b| b.get("current-tab")).and_then(|t| t.as_str()),
        Some(seed::TAB_ID),
    );
    let view = tree::read(&second.engine, &second.tab).expect("the tree");
    assert_eq!(leaf_count(&view), 1, "tab and leaf re-seeded");

    second.engine.clone().shutdown().await.unwrap();
}

/// The core of part 2: the open-in-tile commits, executed under the menu's
/// granted boundary, produce a second mounted leaf — the engine validates
/// the typed tree (accepts, seq, boundary) and the rim's `MountWebview`
/// command for the fresh run is already queued.
#[tokio::test(flavor = "multi_thread")]
async fn open_in_tile_commits_a_split_whose_new_leaf_relates_the_process() {
    let root = fresh_root("open");
    let mut booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());
    let target = launch_target(&booted);

    let before = tree::read(&booted.engine, &booted.tab).expect("the tree");
    assert_eq!(leaf_count(&before), 1);
    let old_root = booted.tiles[0].process.clone();

    let menu = raise_menu(&api, &booted).await;
    for (id, declaration) in [
        (2, stage_tiles()),
        (3, graft_split(booted.tab.as_str(), seed::LEAF_ID, 1, target.as_str())),
    ] {
        let reply = ipc(
            &api,
            &ctx_of(&menu),
            &format!(r#"{{"id":{id},"op":"commit","declaration":{declaration}}}"#),
        )
        .await;
        assert!(reply.get("error").is_none(), "the grant covers the tree write: {reply}");
    }

    let after = tree::read(&booted.engine, &booted.tab).expect("the tree");
    assert_eq!(leaf_count(&after), 2, "root split into two leaves");
    let opened = after.leaf_of(&target).expect("the new leaf relates the target");
    assert_eq!(opened.tile, "tile-open-1");
    assert_eq!(opened.executable.as_deref(), Some("programs/read-tile/src/index.tsx"));
    assert!(after.leaf_of(&old_root).is_some(), "the first leaf survives the split");

    // The rim's mount command for the fresh run was queued at launch — the
    // second leaf has a webview to complete (main.rs parks it until the tree
    // commit lands; both sides exist here).
    let mut mounted = Vec::new();
    while let Ok(cmd) = booted.host_rx.try_recv() {
        if let engine::HostCmd::MountWebview { process_id, .. } = cmd {
            mounted.push(process_id);
        }
    }
    assert!(mounted.contains(&target), "{mounted:?}");

    booted.engine.clone().shutdown().await.unwrap();
}

#[tokio::test(flavor = "multi_thread")]
async fn close_tile_collapses_the_one_child_split() {
    let root = fresh_root("close");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());

    // Reach the two-leaf state through the same ops.
    let target = launch_target(&booted);
    let menu = raise_menu(&api, &booted).await;
    for (id, declaration) in [
        (2, stage_tiles()),
        (3, graft_split(booted.tab.as_str(), seed::LEAF_ID, 1, target.as_str())),
    ] {
        let reply = ipc(
            &api,
            &ctx_of(&menu),
            &format!(r#"{{"id":{id},"op":"commit","declaration":{declaration}}}"#),
        )
        .await;
        assert!(reply.get("error").is_none(), "{reply}");
    }

    // Close the opened tile: the split holds one child and collapses — the
    // first leaf returns to the tab root.
    let menu = raise_menu(&api, &booted).await;
    let declaration =
        close_tile("tile-open-1", "tile-split-1", seed::LEAF_ID, booted.tab.as_str(), 1);
    let reply = ipc(
        &api,
        &ctx_of(&menu),
        &format!(r#"{{"id":4,"op":"commit","declaration":{declaration}}}"#),
    )
    .await;
    assert!(reply.get("error").is_none(), "{reply}");

    let view = tree::read(&booted.engine, &booted.tab).expect("the tree");
    assert_eq!(leaf_count(&view), 1, "the split collapsed");
    let leaf = view.leaves.values().next().unwrap();
    assert_eq!(leaf.tile, seed::LEAF_ID);
    assert_eq!(leaf.process.as_ref(), Some(&booted.tiles[0].process));

    booted.engine.clone().shutdown().await.unwrap();
}

/// Hide, per programs.md §3.2: a relates placement onto the session-local
/// hidden chunk; the sidebar reads session minus hidden through the exclude
/// root. Terminal processes only — the engine pins a live process's placements
/// as engine domain (ops/commit.rs, protected chunks), which the sidebar
/// surfaces as a greyed entry.
#[tokio::test(flavor = "multi_thread")]
async fn hide_excludes_a_terminal_process_from_the_sidebar_read() {
    let root = fresh_root("hide");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());
    let session = booted.session.as_str().to_string();
    let hidden = seed::hidden_id(&booted.session);
    let strip_ctx = ctx_of(&booted.strip.process);

    // A terminal session member: cancel the boot's read-tile run.
    let tile = booted.tiles[0].process.clone();
    booted.engine.cancel(&engine::Context::host(), &tile).unwrap();

    // Hiding a *live* process is refused — the engine's protected rule.
    let menu = raise_menu(&api, &booted).await;
    let live = booted.strip.process.clone();
    let refused = ipc(
        &api,
        &ctx_of(&menu),
        &format!(
            r#"{{"id":2,"op":"commit","declaration":{}}}"#,
            hide(&session, hidden.as_str(), live.as_str())
        ),
    )
    .await;
    assert_eq!(refused["error"]["code"], "BOUNDARY_VIOLATION", "{refused}");

    // The terminal one hides.
    let reply = ipc(
        &api,
        &ctx_of(&menu),
        &format!(
            r#"{{"id":3,"op":"commit","declaration":{}}}"#,
            hide(&session, hidden.as_str(), tile.as_str())
        ),
    )
    .await;
    assert!(reply.get("error").is_none(), "{reply}");

    // The sidebar's exact read: session minus hidden. The process is gone from
    // it, present in the unexcluded read — non-destructive un-show.
    let excluded = ipc(
        &api,
        &strip_ctx,
        &format!(r#"{{"id":4,"op":"scope","scopes":["{session}"],"opts":{{"exclude":["{hidden}"]}}}}"#),
    )
    .await;
    let ids: Vec<&str> = excluded["result"]["chunks"]
        .as_array()
        .unwrap()
        .iter()
        .map(|c| c["id"].as_str().unwrap())
        .collect();
    assert!(!ids.contains(&tile.as_str()), "{ids:?}");
    assert!(ids.contains(&booted.strip.process.as_str()), "{ids:?}");

    let plain = ipc(&api, &strip_ctx, &format!(r#"{{"id":5,"op":"scope","scopes":["{session}"]}}"#)).await;
    let ids: Vec<&str> = plain["result"]["chunks"]
        .as_array()
        .unwrap()
        .iter()
        .map(|c| c["id"].as_str().unwrap())
        .collect();
    assert!(ids.contains(&tile.as_str()), "the chunk persists: {ids:?}");

    booted.engine.clone().shutdown().await.unwrap();
}

/// The engine validates, the menu stays dumb: a menu granted only the session
/// cannot type a new tile — the archetype lies outside its write boundary.
#[tokio::test(flavor = "multi_thread")]
async fn a_menu_granted_only_the_session_cannot_commit_tiles() {
    let root = fresh_root("denied");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());
    let session = booted.session.as_str().to_string();

    let raw = format!(
        r#"{{"id":1,"op":"run","program":"host/context-menu","args":{{"chunks":[],"mode":"child","readBoundary":["{session}"],"writeBoundary":["{session}"]}}}}"#
    );
    let reply = ipc(&api, &ctx_of(&booted.strip.process), &raw).await;
    let menu = ChunkId::from(reply["result"]["process"].as_str().unwrap());

    let reply = ipc(
        &api,
        &ctx_of(&menu),
        &format!(r#"{{"id":2,"op":"commit","declaration":{}}}"#, stage_tiles()),
    )
    .await;
    assert_eq!(reply["error"]["code"], "BOUNDARY_VIOLATION", "{reply}");

    booted.engine.clone().shutdown().await.unwrap();
}
