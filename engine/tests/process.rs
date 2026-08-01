//! Process lifecycle against engine.md: creation topology, status flow,
//! run/await separation, cancel authority, cascade, launch vs child, timeouts
//! (including the await pause), zombie reconciliation, and the R7 trace
//! exemption at the engine layer.

mod common;

use common::*;
use db::{ChunkId, Includes, PlacementType, ScopeOpts, Spec};
use engine::{archetypes, AwaitOpts, Context, EngineError, TerminalReason};
use serde_json::json;

fn full_include() -> ScopeOpts {
    ScopeOpts {
        include: Includes {
            intersection_chunks: true,
            chunk_name: true,
            chunk_body: true,
            chunk_placements: true,
            ..Includes::default()
        },
        ..ScopeOpts::default()
    }
}

#[tokio::test]
async fn run_creates_the_specced_topology() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(&host, decl(vec![program("prog"), chunk("session"), chunk("root")], vec![]))
        .unwrap();

    let mut args = run_args("prog", &["root"], &["root"]);
    args.placements = vec![ChunkId::from("session")];
    args.chunks = vec![with_body("arg1", json!({ "q": "hello" }))];
    let pid = field.engine.run(&host, args).unwrap();

    // The process chunk: instance on the program, on engine/process, on the
    // caller-supplied scope; body carries pending status at creation.
    let item = field
        .engine
        .get(&host, &pid, db::ReadOpts {
            include: Includes {
                chunk_body: true,
                chunk_placements: true,
                ..Includes::default()
            },
            ..db::ReadOpts::default()
        })
        .unwrap()
        .expect("process chunk exists");
    let placements = item.placements.unwrap();
    let has = |scope: &str, t: PlacementType| {
        placements
            .iter()
            .any(|p| p.scope_id.as_str() == scope && p.type_ == t)
    };
    assert!(has("prog", PlacementType::Instance));
    assert!(has(archetypes::ENGINE_PROCESS, PlacementType::Instance));
    assert!(has("session", PlacementType::Instance));

    // On the process: two boundary chunks relates (typed on their archetypes),
    // the argument chunk instance.
    let on_process = field
        .engine
        .scope(&host, std::slice::from_ref(&pid), full_include())
        .unwrap();
    let boundary_chunks: Vec<_> = on_process
        .chunks
        .iter()
        .filter(|c| {
            c.placements.as_ref().is_some_and(|ps| {
                ps.iter().any(|p| {
                    p.type_ == PlacementType::Instance
                        && (p.scope_id.as_str() == archetypes::READ_BOUNDARY
                            || p.scope_id.as_str() == archetypes::WRITE_BOUNDARY)
                })
            })
        })
        .collect();
    assert_eq!(boundary_chunks.len(), 2, "read and write boundary chunks");
    assert!(on_process.chunks.iter().any(|c| c.id.as_str() == "arg1"));

    // Boundary roots relates on the boundary chunk, by identity.
    let read_boundary = boundary_chunks
        .iter()
        .find(|c| {
            c.placements.as_ref().unwrap().iter().any(|p| {
                p.scope_id.as_str() == archetypes::READ_BOUNDARY && p.type_ == PlacementType::Instance
            })
        })
        .unwrap();
    let on_boundary = field
        .engine
        .scope(&host, std::slice::from_ref(&read_boundary.id), full_include())
        .unwrap();
    assert!(
        on_boundary.chunks.iter().any(|c| c.id.as_str() == "root"),
        "boundary root relates on the boundary chunk"
    );
}

#[tokio::test]
async fn status_flows_pending_running_completed() {
    let field = field(FakeRuntime::manual());
    let host = Context::host();
    field.engine.commit(&host, decl(vec![program("prog")], vec![])).unwrap();

    let pid = field.engine.run(&host, run_args("prog", &[], &[])).unwrap();
    assert_eq!(process_body(&field, &pid).0, "pending");

    field.runtime.fire_ready(&pid);
    assert!(
        wait_until(|| process_body(&field, &pid).0 == "running", 1000).await,
        "ready flips the substrate status to running"
    );

    field.runtime.fire_terminal(&pid, TerminalReason::Completed);
    assert!(
        wait_until(|| process_body(&field, &pid).0 == "completed", 1000).await,
        "terminal reason lands as completed"
    );
}

#[tokio::test]
async fn await_returns_final_scope_and_results_only_filters() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(
            &host,
            decl(
                vec![program("prog"), chunk(archetypes::PROGRAMS_RESULT), chunk("answer-type")],
                vec![instance("answer-type", archetypes::PROGRAMS_RESULT)],
            ),
        )
        .unwrap();
    // The type placement needs write reach over the type's scope.
    let pid = field
        .engine
        .run(&host, run_args("prog", &[], &["answer-type"]))
        .unwrap();

    // The program writes an answer (typed result) and a scratch chunk.
    let ctx = Context::process(pid.clone());
    field
        .engine
        .commit(
            &ctx,
            decl(
                vec![with_body("answer", json!({ "text": "42" })), chunk("scratch")],
                vec![
                    instance("answer", pid.as_str()),
                    instance("answer", "answer-type"),
                    instance("scratch", pid.as_str()),
                ],
            ),
        )
        .unwrap();
    field.runtime.fire_terminal(&pid, TerminalReason::Completed);

    let all = field
        .engine
        .await_processes(&host, std::slice::from_ref(&pid), AwaitOpts::default())
        .await
        .unwrap();
    let scope = &all[&pid];
    let ids: Vec<&str> = scope.chunks.iter().map(|c| c.id.as_str()).collect();
    assert!(ids.contains(&"answer") && ids.contains(&"scratch"));

    let filtered = field
        .engine
        .await_processes(&host, std::slice::from_ref(&pid), AwaitOpts { results_only: true })
        .await
        .unwrap();
    let ids: Vec<&str> = filtered[&pid].chunks.iter().map(|c| c.id.as_str()).collect();
    assert_eq!(ids, vec!["answer"], "results_only keeps typed results");
    assert!(filtered[&pid].in_scope >= 2, "counts stay whole");
}

#[tokio::test]
async fn child_runs_nest_and_cascade_with_the_parent() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(&host, decl(vec![program("parent-prog"), program("child-prog")], vec![]))
        .unwrap();

    let parent = field.engine.run(&host, run_args("parent-prog", &[], &[])).unwrap();
    let parent_ctx = Context::process(parent.clone());
    let child = field
        .engine
        .run(&parent_ctx, run_args("child-prog", &[], &[]))
        .unwrap();

    // Trace nesting: child instance on the parent process.
    let item = field
        .engine
        .get(&host, &child, db::ReadOpts {
            include: Includes {
                chunk_placements: true,
                ..Includes::default()
            },
            ..db::ReadOpts::default()
        })
        .unwrap()
        .unwrap();
    assert!(item
        .placements
        .unwrap()
        .iter()
        .any(|p| p.scope_id == parent && p.type_ == PlacementType::Instance));

    // Parent's terminal cascades: a child never outlives its parent.
    field.engine.cancel(&host, &parent).unwrap();
    assert!(
        wait_until(|| process_body(&field, &child) == ("failed".into(), Some("parent ended".into())), 1000).await,
        "child failed with 'parent ended'"
    );
}

#[tokio::test]
async fn launch_detaches_onto_session_scopes_and_survives() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(&host, decl(vec![program("prog"), chunk("session")], vec![]))
        .unwrap();
    let mut args = run_args("prog", &["session"], &["session"]);
    args.placements = vec![ChunkId::from("session")];
    let caller = field.engine.run(&host, args).unwrap();

    let mut launch = run_args("prog", &[], &[]);
    launch.mode = engine::RunMode::Launch;
    let launched = field
        .engine
        .run(&Context::process(caller.clone()), launch)
        .unwrap();

    let item = field
        .engine
        .get(&host, &launched, db::ReadOpts {
            include: Includes {
                chunk_placements: true,
                ..Includes::default()
            },
            ..db::ReadOpts::default()
        })
        .unwrap()
        .unwrap();
    let placements = item.placements.unwrap();
    assert!(
        placements.iter().any(|p| p.scope_id.as_str() == "session" && p.type_ == PlacementType::Instance),
        "launched process placed on the caller's session scope"
    );
    assert!(
        !placements.iter().any(|p| p.scope_id == caller),
        "launched process not nested on the caller"
    );

    field.engine.cancel(&host, &caller).unwrap();
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;
    assert_eq!(process_body(&field, &launched).0, "running", "launch survives the caller");
}

#[tokio::test]
async fn cancel_authority_descendant_or_write_boundary() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(&host, decl(vec![program("prog"), chunk("session"), chunk("other")], vec![]))
        .unwrap();

    let a = field.engine.run(&host, run_args("prog", &[], &[])).unwrap();
    let b = field.engine.run(&host, run_args("prog", &[], &[])).unwrap();
    let a_ctx = Context::process(a.clone());

    // Unrelated sibling: neither descendant nor within A's write boundary.
    let denied = field.engine.cancel(&a_ctx, &b);
    assert!(matches!(denied, Err(EngineError::BoundaryViolation(_))));

    // Own child: descendant authority.
    let child = field.engine.run(&a_ctx, run_args("prog", &[], &[])).unwrap();
    field.engine.cancel(&a_ctx, &child).unwrap();
    assert_eq!(process_body(&field, &child), ("failed".into(), Some("cancelled".into())));

    // Session-covered target: write-boundary authority.
    let mut placed = run_args("prog", &[], &[]);
    placed.placements = vec![ChunkId::from("session")];
    let covered = field.engine.run(&host, placed).unwrap();
    let mut supervisor_args = run_args("prog", &["session"], &["session"]);
    supervisor_args.placements = vec![];
    let supervisor = field.engine.run(&host, supervisor_args).unwrap();
    field
        .engine
        .cancel(&Context::process(supervisor), &covered)
        .unwrap();
    assert_eq!(process_body(&field, &covered).0, "failed");

    // Idempotent: cancelling a terminal or unknown process is Ok.
    field.engine.cancel(&host, &covered).unwrap();
    field.engine.cancel(&host, &ChunkId::from("no-such-process")).unwrap();
}

#[tokio::test]
async fn exit_is_the_self_completion_path() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field.engine.commit(&host, decl(vec![program("prog")], vec![])).unwrap();
    let pid = field.engine.run(&host, run_args("prog", &[], &[])).unwrap();

    field.engine.exit(&Context::process(pid.clone())).unwrap();
    assert_eq!(process_body(&field, &pid).0, "completed");

    // The slot is gone; the substrate is authoritative for a later await.
    let result = field
        .engine
        .await_processes(&host, std::slice::from_ref(&pid), AwaitOpts::default())
        .await
        .unwrap();
    assert!(result.contains_key(&pid));
}

#[tokio::test]
async fn timeout_kills_and_pauses_during_child_await() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field.engine.commit(&host, decl(vec![program("prog")], vec![])).unwrap();

    // Plain expiry.
    let mut short = run_args("prog", &[], &[]);
    short.timeout_ms = Some(80);
    let doomed = field.engine.run(&host, short).unwrap();
    assert!(
        wait_until(|| process_body(&field, &doomed) == ("failed".into(), Some("timeout".into())), 2000).await,
        "timeout marks the process failed"
    );

    // The clock pauses while awaiting a child: parent timeout 400ms, child
    // resolves after 1200ms — the parent must survive the await, then expire.
    let mut parent_args = run_args("prog", &[], &[]);
    parent_args.timeout_ms = Some(400);
    let parent = field.engine.run(&host, parent_args).unwrap();
    let parent_ctx = Context::process(parent.clone());
    let mut child_args = run_args("prog", &[], &[]);
    child_args.timeout_ms = Some(30_000);
    let child = field.engine.run(&parent_ctx, child_args).unwrap();

    let engine = field.engine.clone();
    let runtime = field.runtime.clone();
    let child_for_task = child.clone();
    let finisher = tokio::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_millis(1200)).await;
        runtime.fire_terminal(&child_for_task, TerminalReason::Completed);
    });
    field
        .engine
        .await_processes(&parent_ctx, std::slice::from_ref(&child), AwaitOpts::default())
        .await
        .unwrap();
    finisher.await.unwrap();
    assert_eq!(
        process_body(&field, &parent).0,
        "running",
        "parent survived a 300ms await on a 150ms clock — the clock paused"
    );
    assert!(
        wait_until(|| process_body(&field, &parent).0 == "failed", 2000).await,
        "the resumed clock still expires"
    );
    let _ = engine;
}

#[tokio::test]
async fn zombie_processes_reconcile_at_mount() {
    // Seed a stale running process before the engine mounts the project.
    let field = {
        let stale = decl(
            vec![
                chunk(archetypes::ENGINE_PROCESS),
                with_body("stale-proc", json!({ "status": "running" })),
            ],
            vec![instance("stale-proc", archetypes::ENGINE_PROCESS)],
        );
        field_with(FakeRuntime::ready(), &[stale], &[])
    };
    assert_eq!(
        process_body(&field, &ChunkId::from("stale-proc")),
        ("failed".into(), Some("engine restart".into()))
    );
}

#[tokio::test]
async fn nested_boundaries_only_narrow() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(
            &host,
            decl(
                vec![program("prog"), chunk("wide"), chunk("narrow"), chunk("leaf")],
                vec![instance("narrow", "wide"), instance("leaf", "narrow")],
            ),
        )
        .unwrap();

    let parent = field.engine.run(&host, run_args("prog", &["narrow"], &[])).unwrap();
    // The child asks for the wider root; the effective boundary is the
    // intersection — reads inside `narrow` pass, `wide` itself stays out.
    let child = field
        .engine
        .run(&Context::process(parent), run_args("prog", &["wide"], &[]))
        .unwrap();
    let child_ctx = Context::process(child);

    assert!(field
        .engine
        .scope(&child_ctx, &[ChunkId::from("leaf")], full_include())
        .is_ok());
    assert!(matches!(
        field.engine.scope(&child_ctx, &[ChunkId::from("wide")], full_include()),
        Err(EngineError::BoundaryViolation(_))
    ));
}

#[tokio::test]
async fn r7_trace_placement_is_exempt_when_bootstrap_carries_the_process_type() {
    // The D6 pattern (union-accepts §Consequences): the program's accepts
    // names a "process" type whose definition — the engine/process chunk — is
    // relates-placed on the program. Trace placements then pass both the
    // engine's exemption and the db's local accepts check.
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(
            &host,
            decl(
                vec![
                    named(archetypes::ENGINE_PROCESS, "process"),
                    db::ChunkDeclaration {
                        spec: Some(Spec {
                            propagate: true,
                            accepts: vec!["prompt".into(), "process".into()],
                            ..Spec::default()
                        }),
                        ..program("typed-prog")
                    },
                    named("prompt-def", "prompt"),
                ],
                vec![
                    relates("prompt-def", "typed-prog"),
                    relates(archetypes::ENGINE_PROCESS, "typed-prog"),
                ],
            ),
        )
        .unwrap();

    let parent = field.engine.run(&host, run_args("typed-prog", &[], &[])).unwrap();
    let child = field
        .engine
        .run(&Context::process(parent.clone()), run_args("typed-prog", &[], &[]))
        .expect("trace placement passes: child is instance of the accepted process type");
    let item = field
        .engine
        .get(&host, &child, db::ReadOpts {
            include: Includes {
                chunk_placements: true,
                ..Includes::default()
            },
            ..db::ReadOpts::default()
        })
        .unwrap()
        .unwrap();
    assert!(item
        .placements
        .unwrap()
        .iter()
        .any(|p| p.scope_id == parent && p.type_ == PlacementType::Instance));
}

#[tokio::test]
async fn r7_gap_db_rejects_trace_under_accepts_without_process_type() {
    // KNOWN SEAM GAP (spec/research/union-accepts.md §Consequences 3): the engine
    // exempts trace placements from every composed accepts, but the db (as
    // built) has no such seam — when the parent program's accepts is visible
    // locally and lacks a process type, the db rejects the child's trace
    // placement. This test pins the current behavior; a db-side seam (or the
    // D6 bootstrap pattern above) is the resolution path.
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(
            &host,
            decl(
                vec![
                    db::ChunkDeclaration {
                        spec: Some(Spec {
                            propagate: true,
                            accepts: vec!["prompt".into()],
                            ..Spec::default()
                        }),
                        ..program("strict-prog")
                    },
                    named("prompt-def", "prompt"),
                ],
                vec![relates("prompt-def", "strict-prog")],
            ),
        )
        .unwrap();

    let parent = field.engine.run(&host, run_args("strict-prog", &[], &[])).unwrap();
    let child = field
        .engine
        .run(&Context::process(parent), run_args("strict-prog", &[], &[]));
    assert!(
        matches!(child, Err(EngineError::ValidationError(_))),
        "db-level accepts rejects the exempted trace placement — the recorded gap"
    );
}

#[tokio::test]
async fn boot_validation_reports_unresolved_references() {
    // A placement onto a mounted peer's chunk dangles when that peer is not
    // mounted — the half-loaded state boot validation exists to refuse.
    let peer_seed = decl(vec![chunk("peer-arch")], vec![]);
    let field = field_with(FakeRuntime::ready(), &[], &[("peer", vec![peer_seed])]);
    let host = Context::host();
    field
        .engine
        .commit(
            &host,
            decl(vec![chunk("orphan")], vec![instance("orphan", "peer-arch")]),
        )
        .unwrap();
    assert!(
        field.engine.unresolved_references().unwrap().is_empty(),
        "fully mounted field validates clean"
    );

    let peer_id = field.peers[0].0.clone();
    field.engine.unmount_project(&peer_id).unwrap();
    let unresolved = field.engine.unresolved_references().unwrap();
    assert!(
        unresolved
            .iter()
            .any(|(c, s)| c.as_str() == "orphan" && s.as_str() == "peer-arch"),
        "dangling reference surfaces: {unresolved:?}"
    );
}
