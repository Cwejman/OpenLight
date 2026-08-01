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

    // The settings chunk stands beside the session (author ruling, *solution
    // for now*), and its default prewarm list names the menu.
    let settings = booted
        .engine
        .get(
            &engine::Context::host(),
            &seed::settings_id(&booted.session),
            db::ReadOpts {
                include: db::Includes { chunk_body: true, ..db::Includes::default() },
                ..db::ReadOpts::default()
            },
        )
        .unwrap()
        .expect("the settings chunk");
    let prewarm = settings.body.as_ref().and_then(|b| b.get(seed::PREWARM_KEY)).cloned();
    assert_eq!(prewarm, Some(serde_json::json!(["host/context-menu"])));
    let timings = settings.body.as_ref().and_then(|b| b.get(seed::TIMINGS_KEY)).cloned();
    assert_eq!(timings, Some(serde_json::json!(true)));

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

/// The lens's scope is its live argument: retargeting is the surface
/// rewriting its *own* request chunk — an own-frame write, implicitly within
/// the write boundary (ops/commit.rs), no grant needed.
#[tokio::test(flavor = "multi_thread")]
async fn a_lens_retargets_by_rewriting_its_own_request_chunk() {
    let root = fresh_root("retarget");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());
    let pid = booted.tiles[0].process.clone();
    let ctx = engine::Context::host();
    let opts = || db::ScopeOpts { include: db::Includes::content(), ..db::ScopeOpts::default() };

    let frame = booted.engine.scope(&ctx, &[pid.clone()], opts()).unwrap();
    let request = frame
        .chunks
        .iter()
        .find(|c| c.body.as_ref().is_some_and(|b| b.get("target").is_some()))
        .expect("the run's argument chunk");

    // The write the retarget input posts, as the process itself.
    let declaration = serde_json::json!({
        "chunks": [{
            "id": request.id,
            "name": request.name,
            "body": { "target": ["timing-event"] },
        }],
        "placements": [],
        "message": "retarget lens",
    });
    let reply = ipc(
        &api,
        &ctx_of(&pid),
        &format!(r#"{{"id":9,"op":"commit","declaration":{declaration}}}"#),
    )
    .await;
    assert!(reply.get("error").is_none(), "an own-frame write needs no grant: {reply}");

    let frame = booted.engine.scope(&ctx, &[pid.clone()], opts()).unwrap();
    let target = frame
        .chunks
        .iter()
        .find_map(|c| c.body.as_ref().and_then(|b| b.get("target")).cloned())
        .expect("the argument survives");
    assert_eq!(target, serde_json::json!(["timing-event"]));

    booted.engine.clone().shutdown().await.unwrap();
}

/// Telemetry in the ruled shape: the process is the trace, categories are
/// chunks, and scope intersection is the filter — no aggregate stored.
#[tokio::test(flavor = "multi_thread")]
async fn telemetry_events_land_typed_on_categories_and_traced_on_their_process() {
    let root = fresh_root("telemetry");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");
    let ctx = engine::Context::host();
    let process = booted.tiles[0].process.clone();

    let execution = host::timing::Execution {
        process: process.as_str().to_string(),
        program: Some("read-tile".into()),
        stages: vec![("mount-command".into(), 0.0), ("first-paint".into(), 48.2)],
    };
    host::telemetry::commit_execution(&booted.engine, &execution).expect("first commit");

    let opts = || db::ScopeOpts {
        include: db::Includes::content(),
        ..db::ScopeOpts::default()
    };
    // Scope by category: adding the type chunk to a scope is the filter.
    let paints = booted
        .engine
        .scope(&ctx, &[host::telemetry::category_id("first-paint")], opts())
        .expect("category scope");
    assert!(
        paints.chunks.iter().any(|c| c.body == Some(serde_json::json!(48.2))),
        "the event's whole body is its one value: {paints:?}"
    );
    // The root is the category *registry* — membership is direct placement
    // (substrate.md: propagate carries specs, never membership), so the root
    // lists kinds, not events.
    let registry =
        booted.engine.scope(&ctx, &[db::ChunkId::from(host::telemetry::ROOT)], opts()).unwrap();
    assert_eq!(registry.in_scope, 2, "two categories seen so far: {registry:?}");
    // The trace is the process scope itself — no invented trace id.
    let trace = booted.engine.scope(&ctx, &[process.clone()], opts()).unwrap();
    for value in [0.0, 48.2] {
        assert!(
            trace.chunks.iter().any(|c| c.body == Some(serde_json::json!(value))),
            "{value} rides the process trace: {trace:?}"
        );
    }
    // Intersection is the filter: category ∩ trace → that trace's one paint.
    let mine = booted
        .engine
        .scope(&ctx, &[host::telemetry::category_id("first-paint"), process.clone()], opts())
        .unwrap();
    assert_eq!(mine.in_scope, 1, "{mine:?}");
    assert_eq!(mine.chunks[0].body, Some(serde_json::json!(48.2)));

    // A second execution reuses the type tree: only its events are new.
    let second = host::timing::Execution {
        process: booted.strip.process.as_str().to_string(),
        program: Some("sidebar".into()),
        stages: vec![("mount-command".into(), 0.0), ("first-paint".into(), 51.0)],
    };
    host::telemetry::commit_execution(&booted.engine, &second).expect("second commit");
    let registry_after =
        booted.engine.scope(&ctx, &[db::ChunkId::from(host::telemetry::ROOT)], opts()).unwrap();
    assert_eq!(registry_after.in_scope, 2, "no duplicate categories");
    let paints_after = booted
        .engine
        .scope(&ctx, &[host::telemetry::category_id("first-paint")], opts())
        .unwrap();
    assert_eq!(paints_after.in_scope, paints.in_scope + 1, "the new paint joined its kind");

    booted.engine.clone().shutdown().await.unwrap();
}

/// The tree outlives the seeded ids: after open-in-tile and a close of the
/// *seeded* leaf, the surviving root is `tile-open-1` — the next boot must
/// land its run on the tree's actual first leaf, not on the remembered
/// `tile-first`, or the mount parks forever and the window shows nothing.
#[tokio::test(flavor = "multi_thread")]
async fn a_boot_after_the_seeded_leaf_closed_lands_on_the_surviving_leaf() {
    let root = fresh_root("evolved");
    let agents = root.0.join("agents");
    let first = boot::boot(&agents).expect("first boot");
    let api = EngineAdapter::new(first.engine.clone());

    // Evolve: split, then close the seeded first leaf — tile-open-1 is root.
    let target = launch_target(&first);
    let menu = raise_menu(&api, &first).await;
    for (id, declaration) in [
        (2, stage_tiles()),
        (3, graft_split(first.tab.as_str(), seed::LEAF_ID, 1, target.as_str())),
    ] {
        let reply = ipc(
            &api,
            &ctx_of(&menu),
            &format!(r#"{{"id":{id},"op":"commit","declaration":{declaration}}}"#),
        )
        .await;
        assert!(reply.get("error").is_none(), "{reply}");
    }
    let menu = raise_menu(&api, &first).await;
    let declaration =
        close_tile(seed::LEAF_ID, "tile-split-1", "tile-open-1", first.tab.as_str(), 1);
    let reply = ipc(
        &api,
        &ctx_of(&menu),
        &format!(r#"{{"id":4,"op":"commit","declaration":{declaration}}}"#),
    )
    .await;
    assert!(reply.get("error").is_none(), "{reply}");
    first.engine.clone().shutdown().await.unwrap();
    drop(first);

    let second = boot::boot(&agents).expect("second boot");
    let view = tree::read(&second.engine, &second.tab).expect("the tree");
    assert_eq!(leaf_count(&view), 1);
    let leaf = view.leaf_of(&second.tiles[0].process).expect("the fresh run is on a live leaf");
    assert_eq!(leaf.tile, "tile-open-1", "the surviving leaf, not the seeded id");
    second.engine.clone().shutdown().await.unwrap();
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
