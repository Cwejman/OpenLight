//! Reactivity wiring: subscribe → commit → scope_changed on the process's
//! transport; boundary check at subscribe time; terminal drops subscriptions
//! before further dispatch; invalidation when a placement removal severs
//! reachability.

mod common;

use common::*;
use db::ChunkId;
use engine::{Context, EngineError};
use serde_json::Value;
use std::time::Duration;
use tokio::sync::mpsc;

async fn next_event(events: &mut mpsc::Receiver<Value>, ms: u64) -> Option<Value> {
    tokio::time::timeout(Duration::from_millis(ms), events.recv())
        .await
        .ok()
        .flatten()
}

/// A running process subscribed to `watched`, with its transport receiver.
async fn subscribed(field: &TestField) -> (Context, mpsc::Receiver<Value>, String) {
    let host = Context::host();
    field
        .engine
        .commit(
            &host,
            decl(
                vec![program("prog"), chunk("watched"), chunk("member")],
                vec![instance("member", "watched")],
            ),
        )
        .unwrap();
    let pid = field
        .engine
        .run(&host, run_args("prog", &["watched"], &[]))
        .unwrap();
    let ctx = Context::process(pid.clone());
    let events = field.runtime.take_events(&pid);
    let mut events = events;
    let sub = field
        .engine
        .subscribe(&ctx, &[ChunkId::from("watched")])
        .unwrap();
    // Commits queued before registration (the run's own creation commit touches
    // the boundary root) may still dispatch — benign under the re-fetch
    // contract. Settle the queue before the test asserts.
    while next_event(&mut events, 150).await.is_some() {}
    (ctx, events, sub.as_str().to_string())
}

#[tokio::test]
async fn commits_touching_a_subscribed_scope_fire_scope_changed() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    let (_ctx, mut events, sub_id) = subscribed(&field).await;

    // A member gains a body — the parent-scope subscriber must see it.
    field
        .engine
        .commit(
            &host,
            decl(vec![with_body("member", serde_json::json!({ "v": 2 }))], vec![]),
        )
        .unwrap();

    let event = next_event(&mut events, 2000).await.expect("scope_changed arrives");
    assert_eq!(event["event"], "scope_changed");
    assert_eq!(event["subscriptionId"], sub_id);
    assert!(event["commit"]["id"].is_string(), "the commit payload rides along");
}

#[tokio::test]
async fn unrelated_commits_stay_silent_and_unsubscribe_stops_events() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    let (_ctx, mut events, sub_id) = subscribed(&field).await;

    field
        .engine
        .commit(&host, decl(vec![chunk("elsewhere")], vec![]))
        .unwrap();
    assert!(
        next_event(&mut events, 300).await.is_none(),
        "commits not touching the scopes fire nothing"
    );

    field.engine.unsubscribe(sub_id.as_str().into());
    field.engine.unsubscribe(sub_id.as_str().into()); // idempotent
    field
        .engine
        .commit(
            &host,
            decl(vec![with_body("member", serde_json::json!({ "v": 3 }))], vec![]),
        )
        .unwrap();
    assert!(next_event(&mut events, 300).await.is_none(), "unsubscribed = silent");
}

#[tokio::test]
async fn subscribe_is_boundary_checked_at_registration() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(&host, decl(vec![program("prog"), chunk("mine"), chunk("hidden")], vec![]))
        .unwrap();
    let pid = field.engine.run(&host, run_args("prog", &["mine"], &[])).unwrap();
    let ctx = Context::process(pid);

    assert!(field.engine.subscribe(&ctx, &[ChunkId::from("mine")]).is_ok());
    assert!(matches!(
        field.engine.subscribe(&ctx, &[ChunkId::from("hidden")]),
        Err(EngineError::BoundaryViolation(_))
    ));
    // Host-context subscribe has no delivery channel in v0.1 (recorded gap).
    assert!(matches!(
        field.engine.subscribe(&host, &[ChunkId::from("mine")]),
        Err(EngineError::InvalidRequest(_))
    ));
}

#[tokio::test]
async fn terminal_processes_lose_their_subscriptions() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    let (ctx, mut events, _sub_id) = subscribed(&field).await;

    field
        .engine
        .cancel(&host, ctx.process_id.as_ref().unwrap())
        .unwrap();
    // The cancel writes a terminal commit; the dropped subscription must not
    // receive it or anything after.
    field
        .engine
        .commit(
            &host,
            decl(vec![with_body("member", serde_json::json!({ "v": 4 }))], vec![]),
        )
        .unwrap();
    let leftover = next_event(&mut events, 300).await;
    assert!(
        leftover.is_none(),
        "no events after terminal cleanup: {leftover:?}"
    );
}

#[tokio::test]
async fn severed_reachability_invalidates_the_subscription() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(
            &host,
            decl(
                vec![program("prog"), chunk("root"), chunk("branch"), chunk("leaf")],
                vec![instance("branch", "root"), instance("leaf", "branch")],
            ),
        )
        .unwrap();
    let pid = field.engine.run(&host, run_args("prog", &["root"], &[])).unwrap();
    let ctx = Context::process(pid.clone());
    let mut events = field.runtime.take_events(&pid);
    let sub = field.engine.subscribe(&ctx, &[ChunkId::from("leaf")]).unwrap();

    // Severing branch from root makes leaf unreachable from the boundary.
    field
        .engine
        .commit(
            &host,
            db::Declaration {
                chunks: vec![],
                placements: vec![db::PlacementSpec {
                    chunk: ChunkId::from("branch"),
                    scope: ChunkId::from("root"),
                    type_: db::PlacementType::Instance,
                    seq: None,
                    active: false,
                }],
                message: None,
            },
        )
        .unwrap();

    let mut saw_invalid = false;
    for _ in 0..3 {
        let Some(event) = next_event(&mut events, 2000).await else { break };
        if event["event"] == "subscription_invalid" {
            assert_eq!(event["subscriptionId"], sub.as_str());
            assert_eq!(event["reason"], "scope unreachable");
            saw_invalid = true;
            break;
        }
    }
    assert!(saw_invalid, "subscription_invalid fired");

    // After invalidation, no further scope_changed for that subscription.
    field
        .engine
        .commit(
            &host,
            decl(vec![with_body("leaf", serde_json::json!({ "v": 2 }))], vec![]),
        )
        .unwrap();
    assert!(next_event(&mut events, 300).await.is_none());
}
