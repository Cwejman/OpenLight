//! The swap, proven wry-free: boot seeds real `.ol/db` files, mounts the
//! cascade, validates it, and the demo surfaces' IPC traffic — the exact JSON
//! the webview pages post — reads REAL seeded chunks through the real engine.
//! Everything here goes through the same seam the rim wires: `dispatch::parse`
//! → `EngineApi` (the `EngineAdapter`), `HostCmd` out the engine's receiver.

use db::ChunkId;
use host::adapter::EngineAdapter;
use host::boot::{self, BootError};
use host::dispatch::{self, Context, EngineApi, Outcome, Parsed};
use serde_json::Value;
use std::path::PathBuf;
use std::time::Duration;

struct TempRoot(PathBuf);

impl Drop for TempRoot {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}

/// A fresh first-party layout: agents (active) mounting host and engine, the
/// committed `.ol/project.toml` shapes. Dbs do not exist yet — boot seeds them.
fn fresh_root(tag: &str) -> TempRoot {
    static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let root = std::env::temp_dir()
        .join("ol-swap-tests")
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

/// One IPC message, exactly as a webview posts it, through the rim's seam.
async fn ipc(api: &dyn EngineApi, ctx: &Context, raw: &str) -> (u64, Value) {
    match dispatch::parse(raw) {
        Parsed::Execute(request) => match dispatch::execute(api, ctx, &request).await {
            Outcome::Reply { id, response } => (id, serde_json::from_str(&response).unwrap()),
            Outcome::Drop { reason } => panic!("dropped: {reason}"),
        },
        Parsed::Settled(Outcome::Reply { id, response }) => {
            (id, serde_json::from_str(&response).unwrap())
        }
        Parsed::Settled(Outcome::Drop { reason }) => panic!("dropped at parse: {reason}"),
    }
}

async fn wait_until<F: FnMut() -> bool>(mut cond: F, timeout_ms: u64) -> bool {
    let deadline = std::time::Instant::now() + Duration::from_millis(timeout_ms);
    loop {
        if cond() {
            return true;
        }
        if std::time::Instant::now() > deadline {
            return false;
        }
        tokio::time::sleep(Duration::from_millis(5)).await;
    }
}

fn process_status(engine: &engine::Engine, pid: &ChunkId) -> Option<String> {
    let opts = db::ReadOpts {
        include: db::Includes { chunk_body: true, ..db::Includes::default() },
        ..db::ReadOpts::default()
    };
    engine
        .get(&engine::Context::host(), pid, opts)
        .ok()
        .flatten()
        .and_then(|item| item.body)
        .and_then(|b| b.get("status").and_then(|s| s.as_str()).map(str::to_string))
}

#[tokio::test(flavor = "multi_thread")]
async fn the_loop_closes_webview_traffic_reads_real_substrate_through_the_real_engine() {
    let root = fresh_root("loop");
    let mut booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());

    // Step 10 ran: the tile programs plus the sidebar strip, one MountWebview
    // command per process. The strip is not a tile — it is beside the tree.
    let programs: Vec<&str> = booted.tiles.iter().map(|t| t.program.as_str()).collect();
    assert_eq!(programs, ["read-tile"]);
    assert_eq!(booted.strip.program, "sidebar");
    let surfaces: Vec<&host::boot::TileProcess> =
        booted.tiles.iter().chain(std::iter::once(&booted.strip)).collect();
    let mut mounted = Vec::new();
    for _ in 0..surfaces.len() {
        match booted.host_rx.try_recv().expect("a queued MountWebview") {
            engine::HostCmd::MountWebview { process_id, executable } => {
                assert!(executable.starts_with("programs/"), "{executable}");
                mounted.push(process_id);
            }
            other => panic!("expected MountWebview, got {other:?}"),
        }
    }
    for surface in &surfaces {
        assert!(mounted.contains(&surface.process), "{} not mounted", surface.process);
    }

    // The demo page's exact traffic, under the first tile's identity.
    let pid = booted.tiles[0].process.clone();
    let ctx = Context { process_id: Some(pid.as_str().to_string()) };
    let session = booted.session.as_str();

    // get(own process) → the real engine-written process body.
    let (_, reply) = ipc(&api, &ctx, &format!(r#"{{"id":1,"op":"get","chunkId":"{pid}"}}"#)).await;
    assert_eq!(reply["result"]["body"]["status"], "pending");
    assert_eq!(reply["result"]["body"]["timeout_ms"], 86_400_000u64, "surface timeout from the program body");

    // scope(session) → every surface process, at a real commit head.
    let (_, reply) =
        ipc(&api, &ctx, &format!(r#"{{"id":2,"op":"scope","scopes":["{session}"]}}"#)).await;
    let result = &reply["result"];
    assert_eq!(result["in_scope"], surfaces.len());
    let head = result["head"].as_str().unwrap();
    assert!(!head.is_empty() && head != "fixture-head", "a real commit id, not the stub's: {head}");
    let ids: Vec<&str> = result["chunks"]
        .as_array()
        .unwrap()
        .iter()
        .map(|c| c["id"].as_str().unwrap())
        .collect();
    for surface in &surfaces {
        assert!(ids.contains(&surface.process.as_str()), "{} in scope", surface.process);
    }

    // subscribe(session), then let the webview report ready: the engine flips
    // the process to running with a commit, and the subscription fires — the
    // reshape's push chain, end to end.
    let (_, reply) =
        ipc(&api, &ctx, &format!(r#"{{"id":3,"op":"subscribe","scopes":["{session}"]}}"#)).await;
    assert!(reply["result"]["subscriptionId"].as_str().is_some());

    let mut pending = booted.provider.take_pending(&pid).expect("pending webview handles");
    pending.ready.send(()).unwrap();
    let running = wait_until(
        || process_status(&booted.engine, &pid).as_deref() == Some("running"),
        2_000,
    )
    .await;
    assert!(running, "readiness flips the slot and the substrate to running");

    // A subscription can be handed a commit that landed just before it was
    // registered — the engine's broadcast is at-least-once, and the SDK's
    // contract is re-fetch-on-event, never trust the payload as a delta. So the
    // pin is that the readiness commit *arrives*, not that it arrives first.
    let mut readiness = None;
    while readiness.is_none() {
        let event = tokio::time::timeout(Duration::from_secs(2), pending.events.recv())
            .await
            .expect("subscription event within 2s")
            .expect("transport open");
        assert_eq!(event["event"], "scope_changed");
        if event["commit"]["chunks_modified"]
            .as_array()
            .unwrap()
            .iter()
            .any(|c| c == pid.as_str())
        {
            readiness = Some(event);
        }
    }

    // Boundary honesty: the tile cannot read outside its granted roots.
    let (_, reply) = ipc(&api, &ctx, r#"{"id":9,"op":"scope","scopes":["host"]}"#).await;
    assert_eq!(reply["error"]["code"], "BOUNDARY_VIOLATION");

    booted.engine.clone().shutdown().await.unwrap();
}

/// The adapter answers byte-identical to the engine's own wire dispatch — the
/// anti-drift pin for the rim's parsed path.
#[tokio::test(flavor = "multi_thread")]
async fn adapter_matches_the_engines_own_wire_dispatch() {
    let root = fresh_root("drift");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());
    let session = booted.session.as_str();
    let pid = booted.tiles[0].process.as_str();

    let cases = [
        format!(r#"{{"id":1,"op":"get","chunkId":"{pid}"}}"#),
        format!(r#"{{"id":2,"op":"scope","scopes":["{session}"]}}"#),
        format!(r#"{{"id":3,"op":"get","chunkId":"{session}","opts":{{"include":{{"body":false}}}}}}"#),
        r#"{"id":4,"op":"get","chunkId":"ghost"}"#.to_string(),
    ];
    for raw in cases {
        let (_, through_adapter) = ipc(&api, &Context { process_id: None }, &raw).await;
        let direct = engine::dispatch_request(
            &booted.engine,
            &engine::Context::host(),
            serde_json::from_str(&raw).unwrap(),
        )
        .await
        .to_json();
        assert_eq!(through_adapter, direct, "wire drift on {raw}");
    }

    booted.engine.clone().shutdown().await.unwrap();
}

#[tokio::test(flavor = "multi_thread")]
async fn a_second_launch_finds_the_field_it_left() {
    let root = fresh_root("relaunch");
    let agents = root.0.join("agents");

    let first = boot::boot(&agents).expect("first boot");
    let first_pids: Vec<ChunkId> = first
        .tiles
        .iter()
        .chain(std::iter::once(&first.strip))
        .map(|t| t.process.clone())
        .collect();
    let session = first.session.clone();
    first.engine.clone().shutdown().await.unwrap();
    drop(first);

    let second = boot::boot(&agents).expect("second boot");
    // Seeding and the session are idempotent; processes are not — each run is
    // a distinct process chunk, and the previous launch's were reconciled.
    assert_eq!(second.session, session);
    for pid in &first_pids {
        assert_eq!(
            process_status(&second.engine, pid).as_deref(),
            Some("failed"),
            "previous launch's processes reconciled"
        );
    }
    let result = second
        .engine
        .scope(
            &engine::Context::host(),
            std::slice::from_ref(&session),
            db::ScopeOpts { include: db::Includes::content(), ..db::ScopeOpts::default() },
        )
        .unwrap();
    assert_eq!(result.in_scope, 4, "two surfaces per launch, history preserved");

    second.engine.clone().shutdown().await.unwrap();
}

#[tokio::test(flavor = "multi_thread")]
async fn boot_refuses_a_cascade_missing_the_required_projects() {
    let root = fresh_root("missing");
    let agents = root.0.join("agents");
    std::fs::write(
        agents.join(".ol").join("project.toml"),
        "[project]\nname = \"agents\"\n\n[[mounts]]\npath = \"../engine\"\nbranch = \"main\"\n",
    )
    .unwrap();
    match boot::boot(&agents) {
        Err(BootError::Cascade(e)) => assert!(e.to_string().contains("host"), "{e}"),
        Err(other) => panic!("expected cascade refusal, got {other}"),
        Ok(_) => panic!("expected cascade refusal, boot succeeded"),
    }
}

#[tokio::test(flavor = "multi_thread")]
async fn boot_refuses_unresolved_placements() {
    let root = fresh_root("unresolved");
    let agents = root.0.join("agents");
    // Pre-seed the active project, then plant a placement onto a scope no
    // mount resolves — step 9 must refuse, listing it.
    host::seed::ensure_seeded(&agents, "agents").unwrap();
    {
        let db = db::Db::open(&agents).unwrap();
        db.commit(
            &db::Declaration {
                chunks: vec![db::ChunkDeclaration {
                    id: Some(ChunkId::from("stray")),
                    ..db::ChunkDeclaration::default()
                }],
                placements: vec![db::PlacementSpec {
                    chunk: ChunkId::from("stray"),
                    scope: ChunkId::from("ghost/scope"),
                    type_: db::PlacementType::Instance,
                    seq: None,
                    active: true,
                }],
                message: None,
            },
            db::CommitOpts::default(),
        )
        .unwrap();
    }
    match boot::boot(&agents) {
        Err(BootError::Unresolved(list)) => {
            assert!(list
                .iter()
                .any(|(c, s)| c.as_str() == "stray" && s.as_str() == "ghost/scope"));
        }
        Err(other) => panic!("expected unresolved refusal, got {other}"),
        Ok(_) => panic!("expected unresolved refusal, boot succeeded"),
    }
}

/// `read` is given one required argument — the scope ids to view (programs.md
/// §3.5) — as a chunk on its own call frame. The program opens its frame to
/// find it, so the wiring has to hold through the real engine.
#[tokio::test(flavor = "multi_thread")]
async fn the_read_tiles_frame_carries_the_scope_it_was_given() {
    let root = fresh_root("frame");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());

    let tile = &booted.tiles[0];
    assert_eq!(tile.program, "read-tile");
    let ctx = Context { process_id: Some(tile.process.as_str().to_string()) };
    let (_, reply) = ipc(
        &api,
        &ctx,
        &format!(r#"{{"id":1,"op":"scope","scopes":["{}"]}}"#, tile.process),
    )
    .await;

    let members = reply["result"]["chunks"].as_array().expect("frame members");
    let argument = members
        .iter()
        .find(|chunk| chunk["name"] == "request")
        .expect("the request argument on the frame");
    assert_eq!(
        argument["body"]["target"],
        serde_json::json!([booted.session.as_str()]),
        "the tile is pointed at the session"
    );

    // The sidebar's own frame names the session it renders (its argument is a
    // recorded gap in programs.md §3.2 — the key is this build's reading).
    let strip = Context { process_id: Some(booted.strip.process.as_str().to_string()) };
    let (_, reply) = ipc(
        &api,
        &strip,
        &format!(r#"{{"id":2,"op":"scope","scopes":["{}"]}}"#, booted.strip.process),
    )
    .await;
    let argument = reply["result"]["chunks"]
        .as_array()
        .unwrap()
        .iter()
        .find(|chunk| chunk["name"] == "request")
        .expect("the request argument on the sidebar's frame")
        .clone();
    assert_eq!(argument["body"]["session"], serde_json::json!(booted.session.as_str()));

    booted.engine.clone().shutdown().await.unwrap();
}

/// host.md boot step 10 gives the sidebar read roots `[session,
/// engine/process, engine/program]` and write root `[session]` — the strip
/// must actually be able to read the two archetypes (they live in the
/// read-only engine mount), and must not reach past them.
#[tokio::test(flavor = "multi_thread")]
async fn the_sidebar_strip_reads_exactly_what_step_ten_grants_it() {
    let root = fresh_root("strip");
    let booted = boot::boot(&root.0.join("agents")).expect("boot");
    let api = EngineAdapter::new(booted.engine.clone());
    let ctx = Context { process_id: Some(booted.strip.process.as_str().to_string()) };

    // The programs it names its items by, read across the read-only mount.
    let (_, reply) = ipc(&api, &ctx, r#"{"id":1,"op":"scope","scopes":["engine/program"]}"#).await;
    let names: Vec<String> = reply["result"]["chunks"]
        .as_array()
        .expect("engine/program members")
        .iter()
        .filter_map(|chunk| chunk["name"].as_str().map(str::to_string))
        .collect();
    assert!(names.contains(&"sidebar".to_string()), "{names:?}");
    assert!(names.contains(&"read-tile".to_string()), "{names:?}");

    // The process archetype resolves too — the third root.
    let (_, reply) = ipc(&api, &ctx, r#"{"id":2,"op":"scope","scopes":["engine/process"]}"#).await;
    assert!(reply["result"]["in_scope"].as_u64().unwrap() >= 2, "every run of this launch");

    // The derivation the strip's items stand on: a session member is a process
    // by its `instance` placement on the archetype, and names its program by
    // another (engine.md, *Program and Process*).
    let (_, reply) = ipc(
        &api,
        &ctx,
        &format!(r#"{{"id":4,"op":"scope","scopes":["{}"]}}"#, booted.session),
    )
    .await;
    for chunk in reply["result"]["chunks"].as_array().expect("session members") {
        let scopes: Vec<&str> = chunk["placements"]
            .as_array()
            .expect("placements come with a content read")
            .iter()
            .filter(|p| p["type_"] == "instance")
            .filter_map(|p| p["scope_id"].as_str())
            .collect();
        assert!(scopes.contains(&"engine/process"), "{scopes:?}");
        assert!(
            scopes.iter().any(|s| s.starts_with("host/")),
            "the program it runs: {scopes:?}"
        );
    }

    // And nothing beyond the three roots.
    let (_, reply) = ipc(&api, &ctx, r#"{"id":3,"op":"scope","scopes":["host"]}"#).await;
    assert_eq!(reply["error"]["code"], "BOUNDARY_VIOLATION");

    booted.engine.clone().shutdown().await.unwrap();
}
