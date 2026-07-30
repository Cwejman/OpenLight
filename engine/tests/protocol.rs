//! The wire protocol: one JSON-lines shape over every transport. Requests
//! dispatch to the ten ops; responses pair the request id; errors carry wire
//! codes; the pump delivers responses on the process's transport with `exit`
//! ordered response-before-terminal.

mod common;

use common::*;
use engine::{dispatch_request, Context};
use serde_json::{json, Value};

async fn call(field: &TestField, ctx: &Context, request: Value) -> Value {
    dispatch_request(&field.engine, ctx, request).await.to_json()
}

fn result_of(response: &Value) -> &Value {
    response.get("result").unwrap_or(&Value::Null)
}

fn error_code(response: &Value) -> Option<&str> {
    response.pointer("/error/code").and_then(Value::as_str)
}

#[tokio::test]
async fn the_ten_ops_round_trip() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();

    // commit
    let commit = call(
        &field,
        &host,
        json!({ "id": 1, "op": "commit", "declaration": {
            "chunks": [
                { "id": "prog", "body": { "executable": "x", "runtime": "fake" } },
                { "id": "root" },
                { "id": "leaf", "body": { "text": "twinkle" } }
            ],
            "placements": [ { "chunk": "leaf", "scope": "root", "type": "instance" } ]
        }}),
    )
    .await;
    assert_eq!(commit["id"], 1);
    assert!(commit["result"]["id"].is_string(), "commit returns Commit metadata");

    // dry_run
    let dry = call(
        &field,
        &host,
        json!({ "id": 2, "op": "commit", "dry_run": true, "declaration": {
            "chunks": [{ "id": "probe" }], "placements": [] } }),
    )
    .await;
    assert_eq!(dry["result"]["valid"], true);

    // scope
    let scope = call(&field, &host, json!({ "id": 3, "op": "scope", "scopes": ["root"] })).await;
    let ids: Vec<&str> = scope["result"]["chunks"]
        .as_array()
        .unwrap()
        .iter()
        .filter_map(|c| c["id"].as_str())
        .collect();
    assert_eq!(ids, vec!["leaf"]);

    // scope with body-less projection
    let survey = call(
        &field,
        &host,
        json!({ "id": 4, "op": "scope", "scopes": ["root"], "opts": { "include": { "body": false } } }),
    )
    .await;
    assert!(survey["result"]["chunks"][0].get("body").is_none());

    // get
    let get = call(&field, &host, json!({ "id": 5, "op": "get", "chunkId": "leaf" })).await;
    assert_eq!(get["result"]["body"]["text"], "twinkle");
    let null = call(&field, &host, json!({ "id": 6, "op": "get", "chunkId": "ghost" })).await;
    assert!(result_of(&null).is_null());

    // read_batch — one head, per-tag results
    let batch = call(
        &field,
        &host,
        json!({ "id": 7, "op": "read_batch", "reads": [
            { "tag": "a", "scopes": ["root"] },
            { "tag": "b", "chunkId": "leaf" }
        ]}),
    )
    .await;
    assert!(batch["result"]["head"].is_string());
    assert_eq!(batch["result"]["results"]["b"]["id"], "leaf");

    // run → await → cancel → exit
    let run = call(&field, &host, json!({ "id": 8, "op": "run", "program": "prog", "args": {
        "readBoundary": ["root"], "writeBoundary": ["root"] } })).await;
    let pid = run["result"]["process"].as_str().unwrap().to_string();
    let ctx = Context::process(pid.as_str());

    // subscribe / unsubscribe under the process identity
    let sub = call(&field, &ctx, json!({ "id": 9, "op": "subscribe", "scopes": ["root"] })).await;
    let sub_id = sub["result"]["subscriptionId"].as_str().unwrap().to_string();
    let unsub = call(&field, &ctx, json!({ "id": 10, "op": "unsubscribe", "subscriptionId": sub_id })).await;
    assert_eq!(unsub["result"], json!({}));

    let cancel = call(&field, &host, json!({ "id": 11, "op": "cancel", "process": pid })).await;
    assert_eq!(cancel["result"], json!({}));

    let awaited = call(&field, &host, json!({ "id": 12, "op": "await", "processes": [pid] })).await;
    assert!(awaited["result"][&pid]["chunks"].is_array());
}

#[tokio::test]
async fn errors_carry_wire_codes() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();

    let unknown = call(&field, &host, json!({ "id": 1, "op": "nonsense" })).await;
    assert_eq!(error_code(&unknown), Some("INVALID_REQUEST"));

    let missing = call(&field, &host, json!({ "id": 2 })).await;
    assert_eq!(error_code(&missing), Some("INVALID_REQUEST"));

    let no_program = call(
        &field,
        &host,
        json!({ "id": 3, "op": "run", "program": "ghost", "args": {} }),
    )
    .await;
    assert_eq!(error_code(&no_program), Some("NOT_FOUND"));

    // Boundary violation through the wire: a process with no read roots.
    field
        .engine
        .commit(&host, decl(vec![program("prog"), chunk("hidden")], vec![]))
        .unwrap();
    let pid = field.engine.run(&host, run_args("prog", &[], &[])).unwrap();
    let denied = call(
        &field,
        &Context::process(pid),
        json!({ "id": 4, "op": "scope", "scopes": ["hidden"] }),
    )
    .await;
    assert_eq!(error_code(&denied), Some("BOUNDARY_VIOLATION"));
    assert_eq!(denied["id"], 4, "errors pair the request id");
}

#[tokio::test]
async fn per_tag_boundary_errors_in_read_batch() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field
        .engine
        .commit(
            &host,
            decl(
                vec![program("prog"), chunk("mine"), chunk("hidden")],
                vec![],
            ),
        )
        .unwrap();
    let pid = field.engine.run(&host, run_args("prog", &["mine"], &[])).unwrap();
    let batch = call(
        &field,
        &Context::process(pid),
        json!({ "id": 1, "op": "read_batch", "reads": [
            { "tag": "ok", "scopes": ["mine"] },
            { "tag": "blocked", "scopes": ["hidden"] }
        ]}),
    )
    .await;
    assert!(batch["result"]["results"]["ok"]["chunks"].is_array());
    assert_eq!(
        batch["result"]["results"]["blocked"]["error"]["code"],
        "BOUNDARY_VIOLATION",
        "one snapshot, per-tag boundary errors"
    );
}

#[tokio::test]
async fn the_pump_delivers_responses_and_orders_exit() {
    let field = field(FakeRuntime::ready());
    let host = Context::host();
    field.engine.commit(&host, decl(vec![program("prog")], vec![])).unwrap();
    let pid = field.engine.run(&host, run_args("prog", &[], &[])).unwrap();
    let mut events = field.runtime.take_events(&pid);
    let ctx = Context::process(pid.clone());

    // A request through the provider's channel comes back on the transport.
    field
        .engine
        .request_sender()
        .send((ctx.clone(), json!({ "id": 1, "op": "get", "chunkId": pid.as_str() })))
        .await
        .unwrap();
    let response = tokio::time::timeout(std::time::Duration::from_secs(2), events.recv())
        .await
        .expect("response within deadline")
        .expect("transport open");
    assert_eq!(response["id"], 1);
    assert_eq!(response["result"]["id"], pid.as_str());

    // exit: the response is delivered before the terminal transition drops the transport.
    field
        .engine
        .request_sender()
        .send((ctx, json!({ "id": 2, "op": "exit" })))
        .await
        .unwrap();
    let response = tokio::time::timeout(std::time::Duration::from_secs(2), events.recv())
        .await
        .expect("exit response within deadline")
        .expect("transport still open for the exit response");
    assert_eq!(response["id"], 2);
    assert_eq!(response["result"], json!({}));
    assert!(
        wait_until(|| process_body(&field, &pid).0 == "completed", 2000).await,
        "terminal follows the response"
    );
}

#[tokio::test]
async fn mount_scope_and_provenance_over_the_wire() {
    let peer_seed = decl(vec![with_body("peer-doc", serde_json::json!({ "v": 1 }))], vec![]);
    let field = field_with(FakeRuntime::ready(), &[], &[("peer", vec![peer_seed])]);
    let host = Context::host();

    let mounts = call(&field, &host, json!({ "id": 1, "op": "scope", "scopes": ["engine/mount"] })).await;
    assert_eq!(mounts["result"]["in_scope"], 2, "active + peer in the registry");

    let doc = call(&field, &host, json!({ "id": 2, "op": "get", "chunkId": "peer-doc" })).await;
    let placements = doc["result"]["placements"].as_array().unwrap();
    assert!(
        placements
            .iter()
            .any(|p| p["scope_id"].as_str().unwrap_or("").starts_with("engine/mount:")),
        "surfaced chunks carry mount provenance: {placements:?}"
    );

    let denied = call(
        &field,
        &host,
        json!({ "id": 3, "op": "commit", "declaration": {
            "chunks": [{ "id": "peer-doc", "body": { "v": 2 } }], "placements": [] } }),
    )
    .await;
    assert_eq!(error_code(&denied), Some("READ_ONLY_MOUNT"));
}
