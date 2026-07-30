//! Shared harness: real dbs in temp dirs, a controllable fake runtime
//! provider, declaration builders. No engine internals — everything goes
//! through the public surface, as a host would.

#![allow(dead_code)]

use db::{
    BranchName, ChunkDeclaration, ChunkId, CommitOpts, Db, Declaration, Includes, PlacementSpec,
    PlacementType, ReadOpts, Spec,
};
use engine::{
    Context, Engine, HostCmd, MountMode, ProcessId, ProjectId, RuntimeHandle, RuntimeProvider,
    SpawnContext, SpawnError, TerminalReason,
};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::sync::{mpsc, oneshot};

pub struct Spawn {
    pub process_id: ProcessId,
    pub ready: Option<oneshot::Sender<()>>,
    pub terminal: Option<oneshot::Sender<TerminalReason>>,
    pub events: Option<mpsc::Receiver<serde_json::Value>>,
}

/// A runtime provider the test drives by hand. `auto_ready` fires readiness at
/// spawn; terminal transitions stay with the test unless `auto_complete`.
pub struct FakeRuntime {
    pub auto_ready: bool,
    pub auto_complete: bool,
    pub spawns: Mutex<Vec<Spawn>>,
}

impl FakeRuntime {
    pub fn manual() -> Arc<FakeRuntime> {
        Arc::new(FakeRuntime {
            auto_ready: false,
            auto_complete: false,
            spawns: Mutex::new(Vec::new()),
        })
    }

    pub fn ready() -> Arc<FakeRuntime> {
        Arc::new(FakeRuntime {
            auto_ready: true,
            auto_complete: false,
            spawns: Mutex::new(Vec::new()),
        })
    }

    pub fn completing() -> Arc<FakeRuntime> {
        Arc::new(FakeRuntime {
            auto_ready: true,
            auto_complete: true,
            spawns: Mutex::new(Vec::new()),
        })
    }

    pub fn spawn_count(&self) -> usize {
        self.spawns.lock().unwrap().len()
    }

    pub fn take_last(&self) -> Spawn {
        self.spawns.lock().unwrap().pop().expect("a spawn recorded")
    }

    pub fn fire_ready(&self, pid: &ProcessId) {
        let mut spawns = self.spawns.lock().unwrap();
        let spawn = spawns
            .iter_mut()
            .find(|s| s.process_id == *pid)
            .expect("spawn for pid");
        if let Some(tx) = spawn.ready.take() {
            let _ = tx.send(());
        }
    }

    pub fn fire_terminal(&self, pid: &ProcessId, reason: TerminalReason) {
        let mut spawns = self.spawns.lock().unwrap();
        let spawn = spawns
            .iter_mut()
            .find(|s| s.process_id == *pid)
            .expect("spawn for pid");
        if let Some(tx) = spawn.terminal.take() {
            let _ = tx.send(reason);
        }
    }

    pub fn take_events(&self, pid: &ProcessId) -> mpsc::Receiver<serde_json::Value> {
        let mut spawns = self.spawns.lock().unwrap();
        spawns
            .iter_mut()
            .find(|s| s.process_id == *pid)
            .expect("spawn for pid")
            .events
            .take()
            .expect("events not yet taken")
    }
}

impl RuntimeProvider for FakeRuntime {
    fn spawn(&self, cx: SpawnContext) -> Result<RuntimeHandle, SpawnError> {
        let (transport, events) = mpsc::channel(64);
        let (ready_tx, ready) = oneshot::channel();
        let (terminal_tx, terminal) = oneshot::channel();
        let mut spawn = Spawn {
            process_id: cx.process_id,
            ready: Some(ready_tx),
            terminal: Some(terminal_tx),
            events: Some(events),
        };
        if self.auto_ready {
            let _ = spawn.ready.take().unwrap().send(());
        }
        if self.auto_complete {
            let _ = spawn.terminal.take().unwrap().send(TerminalReason::Completed);
        }
        self.spawns.lock().unwrap().push(spawn);
        Ok(RuntimeHandle {
            transport,
            ready,
            terminal,
        })
    }
}

pub struct TestField {
    pub engine: Engine,
    pub host_rx: mpsc::Receiver<HostCmd>,
    pub runtime: Arc<FakeRuntime>,
    pub active: Arc<Db>,
    pub active_id: ProjectId,
    pub peers: Vec<(ProjectId, Arc<Db>)>,
    dirs: Vec<PathBuf>,
}

impl Drop for TestField {
    fn drop(&mut self) {
        for dir in &self.dirs {
            let _ = std::fs::remove_dir_all(dir);
        }
    }
}

fn fresh_dir(tag: &str) -> PathBuf {
    static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir()
        .join("ol-engine-tests")
        .join(format!("{tag}-{nanos:x}-{n}-{:x}", std::process::id()))
}

/// Build a field: an active project (optionally pre-seeded before mounting)
/// and read-only peers seeded by the given declarations.
pub fn field_with(
    runtime: Arc<FakeRuntime>,
    active_seed: &[Declaration],
    peers: &[(&str, Vec<Declaration>)],
) -> TestField {
    let (engine, host_rx) = Engine::open().expect("engine opens in tokio ctx");
    engine
        .register_runtime("fake".into(), runtime.clone())
        .unwrap();

    let mut dirs = Vec::new();
    let mut mounted_peers = Vec::new();
    for (name, seeds) in peers {
        let dir = fresh_dir(name);
        {
            let seed_db = Db::open(&dir).expect("peer db opens");
            for declaration in seeds {
                seed_db
                    .commit(declaration, CommitOpts::default())
                    .expect("peer seed commits");
            }
        }
        let peer_db = Arc::new(Db::open_read_only(&dir).expect("peer reopens read-only"));
        let peer_id = ProjectId::from(dir.to_str().unwrap());
        engine
            .mount_project(
                peer_id.clone(),
                peer_db.clone(),
                MountMode::ReadOnly,
                BranchName::default(),
            )
            .expect("peer mounts");
        mounted_peers.push((peer_id, peer_db));
        dirs.push(dir);
    }

    let active_dir = fresh_dir("active");
    let active = Arc::new(Db::open(&active_dir).expect("active db opens"));
    for declaration in active_seed {
        active
            .commit(declaration, CommitOpts::default())
            .expect("active seed commits");
    }
    let active_id = ProjectId::from(active_dir.to_str().unwrap());
    engine
        .mount_project(
            active_id.clone(),
            active.clone(),
            MountMode::ReadWrite,
            BranchName::default(),
        )
        .expect("active mounts");
    dirs.push(active_dir);

    TestField {
        engine,
        host_rx,
        runtime,
        active,
        active_id,
        peers: mounted_peers,
    dirs,
    }
}

pub fn field(runtime: Arc<FakeRuntime>) -> TestField {
    field_with(runtime, &[], &[])
}

// ---- declaration builders ---------------------------------------------------

pub fn chunk(id: &str) -> ChunkDeclaration {
    ChunkDeclaration {
        id: Some(ChunkId::from(id)),
        ..ChunkDeclaration::default()
    }
}

pub fn named(id: &str, name: &str) -> ChunkDeclaration {
    ChunkDeclaration {
        name: Some(name.to_string()),
        ..chunk(id)
    }
}

pub fn with_body(id: &str, body: serde_json::Value) -> ChunkDeclaration {
    ChunkDeclaration {
        body: Some(body),
        ..chunk(id)
    }
}

pub fn with_spec(id: &str, spec: Spec) -> ChunkDeclaration {
    ChunkDeclaration {
        spec: Some(spec),
        ..chunk(id)
    }
}

pub fn program(id: &str) -> ChunkDeclaration {
    with_body(id, serde_json::json!({ "executable": "test.ts", "runtime": "fake" }))
}

pub fn place(chunk: &str, scope: &str, type_: PlacementType) -> PlacementSpec {
    PlacementSpec {
        chunk: ChunkId::from(chunk),
        scope: ChunkId::from(scope),
        type_,
        seq: None,
        active: true,
    }
}

pub fn instance(chunk: &str, scope: &str) -> PlacementSpec {
    place(chunk, scope, PlacementType::Instance)
}

pub fn relates(chunk: &str, scope: &str) -> PlacementSpec {
    place(chunk, scope, PlacementType::Relates)
}

pub fn decl(chunks: Vec<ChunkDeclaration>, placements: Vec<PlacementSpec>) -> Declaration {
    Declaration {
        chunks,
        placements,
        message: None,
    }
}

// ---- engine-side helpers ----------------------------------------------------

pub fn run_args(program: &str, read: &[&str], write: &[&str]) -> engine::RunArgs {
    engine::RunArgs {
        program_id: ChunkId::from(program),
        chunks: vec![],
        placements: vec![],
        mode: engine::RunMode::Child,
        read_boundary: engine::BoundarySpec::Roots(read.iter().map(|r| ChunkId::from(*r)).collect()),
        write_boundary: engine::BoundarySpec::Roots(write.iter().map(|r| ChunkId::from(*r)).collect()),
        timeout_ms: None,
    }
}

/// The process chunk's substrate body — status and error, host view.
pub fn process_body(field: &TestField, pid: &ProcessId) -> (String, Option<String>) {
    let opts = ReadOpts {
        include: Includes {
            chunk_body: true,
            ..Includes::default()
        },
        ..ReadOpts::default()
    };
    let item = field
        .engine
        .get(&Context::host(), pid, opts)
        .expect("get process")
        .expect("process chunk exists");
    let body = item.body.expect("process body");
    (
        body.get("status").and_then(|s| s.as_str()).unwrap_or("").to_string(),
        body.get("error").and_then(|e| e.as_str()).map(str::to_string),
    )
}

/// Poll until the condition holds or the timeout elapses.
pub async fn wait_until<F: FnMut() -> bool>(mut cond: F, timeout_ms: u64) -> bool {
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
