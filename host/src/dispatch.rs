//! IPC dispatch — pure. host.md §Transport: each webview invocation parses
//! the JSON, attaches a `Context { process_id }` from the webview→process
//! registry, calls the matching engine function, and resolves the call. The
//! engine sits behind `EngineApi` so the fixture stub swaps for the real
//! engine crate without touching this routing.
//!
//! The seam is split in two because wry's IPC callback must never block:
//! [`parse`] runs on the IPC thread and is pure; [`execute`] runs on the tokio
//! runtime, because the engine's `await` op suspends. The rim ferries the
//! resulting `Outcome` back to the event loop for `__sdk.resolve`.

use std::future::Future;
use std::pin::Pin;

use serde_json::Value;

use crate::protocol::{
    parse_request, response_err, response_ok, AwaitOpts, EngineError, ErrorCode, Op, ParseFailure,
    ReadOpts, Request, RunArgs, ScopeOpts, TaggedRead,
};

/// engine.md §Engine API: `None` = host-initiated; `Some` = caller's process.
#[derive(Debug, Clone, PartialEq)]
pub struct Context {
    pub process_id: Option<String>,
}

/// Boxed so the trait stays object-safe and the future stays `Send` — both
/// are needed to hand work from the IPC callback to the runtime, and neither
/// is expressible with `async fn` in a trait.
pub type BoxFuture<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;

/// The protocol's op surface as one trait — engine.md §The Program Protocol,
/// one method per op. Results are wire-shaped values; the implementor owns
/// the typed layer beneath. The sync/async split mirrors the engine's exactly:
/// `await` is the one suspending op — everything else answers from the
/// substrate without yielding.
pub trait EngineApi: Send + Sync {
    fn scope(&self, ctx: &Context, scopes: &[String], opts: &ScopeOpts) -> Result<Value, EngineError>;
    fn get(&self, ctx: &Context, chunk_id: &str, opts: &ReadOpts) -> Result<Value, EngineError>;
    fn read_batch(&self, ctx: &Context, reads: &[TaggedRead]) -> Result<Value, EngineError>;
    fn commit(&self, ctx: &Context, declaration: &Value, dry_run: bool) -> Result<Value, EngineError>;
    fn run(&self, ctx: &Context, program: &str, args: &RunArgs) -> Result<Value, EngineError>;
    fn await_processes<'a>(
        &'a self,
        ctx: &'a Context,
        processes: &'a [String],
        opts: &'a AwaitOpts,
    ) -> BoxFuture<'a, Result<Value, EngineError>>;
    fn cancel(&self, ctx: &Context, process: &str) -> Result<Value, EngineError>;
    fn exit(&self, ctx: &Context) -> Result<Value, EngineError>;
    fn subscribe(&self, ctx: &Context, scopes: &[String]) -> Result<Value, EngineError>;
    fn unsubscribe(&self, ctx: &Context, subscription_id: &str) -> Result<Value, EngineError>;
}

/// What one incoming IPC message produces. `Reply` carries the serialized
/// response envelope for `__sdk.resolve`. `Drop` is a message with no
/// extractable id — nothing to resolve, the rim logs it.
#[derive(Debug, Clone, PartialEq)]
pub enum Outcome {
    Reply { id: u64, response: String },
    Drop { reason: String },
}

/// What parsing one IPC message yields. `Execute` needs the engine and goes
/// to the runtime; `Settled` is already answered — a malformed request never
/// reaches the engine at all.
#[derive(Debug, Clone, PartialEq)]
pub enum Parsed {
    Execute(Request),
    Settled(Outcome),
}

/// Step one, on the IPC thread: parse only. No engine, no blocking.
pub fn parse(raw: &str) -> Parsed {
    match parse_request(raw) {
        Ok(request) => Parsed::Execute(request),
        Err(ParseFailure { id: Some(id), message }) => {
            let error = EngineError::new(ErrorCode::InvalidRequest, message);
            Parsed::Settled(Outcome::Reply { id, response: response_err(id, &error) })
        }
        Err(ParseFailure { id: None, message }) => {
            Parsed::Settled(Outcome::Drop { reason: message })
        }
    }
}

/// Step two, on the runtime: route the parsed request to the engine.
pub async fn execute(engine: &dyn EngineApi, ctx: &Context, request: &Request) -> Outcome {
    let response = match route(engine, ctx, &request.op).await {
        Ok(result) => response_ok(request.id, &result),
        Err(error) => response_err(request.id, &error),
    };
    Outcome::Reply { id: request.id, response }
}

async fn route(engine: &dyn EngineApi, ctx: &Context, op: &Op) -> Result<Value, EngineError> {
    match op {
        Op::Scope { scopes, opts } => engine.scope(ctx, scopes, opts),
        Op::Get { chunk_id, opts } => engine.get(ctx, chunk_id, opts),
        Op::ReadBatch { reads } => engine.read_batch(ctx, reads),
        Op::Commit { declaration, dry_run } => engine.commit(ctx, declaration, *dry_run),
        Op::Run { program, args } => engine.run(ctx, program, args),
        Op::Await { processes, opts } => engine.await_processes(ctx, processes, opts).await,
        Op::Cancel { process } => engine.cancel(ctx, process),
        Op::Exit => engine.exit(ctx),
        Op::Subscribe { scopes } => engine.subscribe(ctx, scopes),
        Op::Unsubscribe { subscription_id } => engine.unsubscribe(ctx, subscription_id),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::sync::Mutex;

    /// Records the last routed call and answers with a canned value.
    struct Mock {
        last: Mutex<String>,
    }

    impl Mock {
        fn new() -> Self {
            Mock { last: Mutex::new(String::new()) }
        }
        fn record(&self, call: String) -> Result<Value, EngineError> {
            *self.last.lock().unwrap() = call;
            Ok(json!({"ok": true}))
        }
        fn seen(&self) -> String {
            self.last.lock().unwrap().clone()
        }
    }

    impl EngineApi for Mock {
        fn scope(&self, ctx: &Context, scopes: &[String], opts: &ScopeOpts) -> Result<Value, EngineError> {
            self.record(format!(
                "scope ctx={:?} scopes={scopes:?} match={:?}",
                ctx.process_id, opts.match_
            ))
        }
        fn get(&self, _ctx: &Context, chunk_id: &str, opts: &ReadOpts) -> Result<Value, EngineError> {
            self.record(format!("get {chunk_id} at={:?}", opts.at))
        }
        fn read_batch(&self, _ctx: &Context, reads: &[TaggedRead]) -> Result<Value, EngineError> {
            self.record(format!("read_batch n={}", reads.len()))
        }
        fn commit(&self, _ctx: &Context, _declaration: &Value, dry_run: bool) -> Result<Value, EngineError> {
            self.record(format!("commit dry_run={dry_run}"))
        }
        fn run(&self, _ctx: &Context, program: &str, args: &RunArgs) -> Result<Value, EngineError> {
            self.record(format!("run {program} {:?} write={:?}", args.mode, args.write_boundary))
        }
        fn await_processes<'a>(
            &'a self,
            _ctx: &'a Context,
            processes: &'a [String],
            opts: &'a AwaitOpts,
        ) -> BoxFuture<'a, Result<Value, EngineError>> {
            Box::pin(async move {
                // A real await suspends until the processes end; yielding here
                // proves the caller polls a future rather than blocking.
                tokio::task::yield_now().await;
                self.record(format!("await {processes:?} results_only={}", opts.results_only))
            })
        }
        fn cancel(&self, _ctx: &Context, process: &str) -> Result<Value, EngineError> {
            self.record(format!("cancel {process}"))
        }
        fn exit(&self, _ctx: &Context) -> Result<Value, EngineError> {
            self.record("exit".into())
        }
        fn subscribe(&self, _ctx: &Context, scopes: &[String]) -> Result<Value, EngineError> {
            self.record(format!("subscribe {scopes:?}"))
        }
        fn unsubscribe(&self, _ctx: &Context, subscription_id: &str) -> Result<Value, EngineError> {
            self.record(format!("unsubscribe {subscription_id}"))
        }
    }

    fn ctx() -> Context {
        Context { process_id: Some("proc-1".into()) }
    }

    /// The rim's two steps, in one call, for tests that only care about the
    /// answer. Production splits them across the thread boundary.
    async fn dispatch(engine: &dyn EngineApi, ctx: &Context, raw: &str) -> Outcome {
        match parse(raw) {
            Parsed::Execute(request) => execute(engine, ctx, &request).await,
            Parsed::Settled(outcome) => outcome,
        }
    }

    fn reply_of(outcome: Outcome) -> (u64, Value) {
        match outcome {
            Outcome::Reply { id, response } => (id, serde_json::from_str(&response).unwrap()),
            Outcome::Drop { reason } => panic!("expected reply, dropped: {reason}"),
        }
    }

    // --- Step one: parsing, engine untouched ---------------------------------

    #[test]
    fn a_valid_message_parses_to_work_for_the_runtime() {
        match parse(r#"{"id":1,"op":"exit"}"#) {
            Parsed::Execute(request) => {
                assert_eq!(request.id, 1);
                assert_eq!(request.op, Op::Exit);
            }
            other => panic!("expected execute, got {other:?}"),
        }
    }

    #[test]
    fn unknown_op_settles_at_parse_without_the_engine() {
        match parse(r#"{"id":11,"op":"snapshot"}"#) {
            Parsed::Settled(outcome) => {
                let (id, value) = reply_of(outcome);
                assert_eq!(id, 11);
                assert_eq!(value["error"]["code"], "INVALID_REQUEST");
            }
            other => panic!("expected settled, got {other:?}"),
        }
    }

    #[test]
    fn unparseable_message_settles_as_a_drop() {
        match parse("garbage") {
            Parsed::Settled(Outcome::Drop { .. }) => {}
            other => panic!("expected drop, got {other:?}"),
        }
    }

    // --- Step two: routing on the runtime ------------------------------------

    #[tokio::test]
    async fn routes_scope_with_context_attached() {
        let mock = Mock::new();
        let raw = r#"{"id":1,"op":"scope","scopes":["s1"],"opts":{"match_":"x"}}"#;
        let (id, value) = reply_of(dispatch(&mock, &ctx(), raw).await);
        assert_eq!(id, 1);
        assert_eq!(value["result"], json!({"ok": true}));
        assert_eq!(mock.seen(), r#"scope ctx=Some("proc-1") scopes=["s1"] match=Some("x")"#);
    }

    #[tokio::test]
    async fn routes_every_remaining_op() {
        let mock = Mock::new();
        let cases = [
            (r#"{"id":2,"op":"get","chunkId":"c","opts":{"at":"commit_2"}}"#, r#"get c at=Some("commit_2")"#),
            (r#"{"id":3,"op":"read_batch","reads":[{"tag":"a","scopes":[]}]}"#, "read_batch n=1"),
            (r#"{"id":4,"op":"commit","declaration":{},"dry_run":true}"#, "commit dry_run=true"),
            (r#"{"id":5,"op":"run","program":"echo","args":{"writeBoundary":["w1"]}}"#, r#"run echo Child write=["w1"]"#),
            (r#"{"id":6,"op":"await","processes":["p_1"]}"#, r#"await ["p_1"] results_only=false"#),
            (r#"{"id":7,"op":"cancel","process":"p_1"}"#, "cancel p_1"),
            (r#"{"id":8,"op":"exit"}"#, "exit"),
            (r#"{"id":9,"op":"subscribe","scopes":["s"]}"#, r#"subscribe ["s"]"#),
            (r#"{"id":10,"op":"unsubscribe","subscriptionId":"sub_1"}"#, "unsubscribe sub_1"),
        ];
        for (raw, expected) in cases {
            reply_of(dispatch(&mock, &ctx(), raw).await);
            assert_eq!(mock.seen(), expected, "for {raw}");
        }
    }

    #[tokio::test]
    async fn engine_error_becomes_error_response() {
        struct Failing;
        impl EngineApi for Failing {
            fn scope(&self, _: &Context, _: &[String], _: &ScopeOpts) -> Result<Value, EngineError> {
                Err(EngineError::new(ErrorCode::BoundaryViolation, "no"))
            }
            fn get(&self, _: &Context, _: &str, _: &ReadOpts) -> Result<Value, EngineError> { unreachable!() }
            fn read_batch(&self, _: &Context, _: &[TaggedRead]) -> Result<Value, EngineError> { unreachable!() }
            fn commit(&self, _: &Context, _: &Value, _: bool) -> Result<Value, EngineError> { unreachable!() }
            fn run(&self, _: &Context, _: &str, _: &RunArgs) -> Result<Value, EngineError> { unreachable!() }
            fn await_processes<'a>(&'a self, _: &'a Context, _: &'a [String], _: &'a AwaitOpts) -> BoxFuture<'a, Result<Value, EngineError>> { unreachable!() }
            fn cancel(&self, _: &Context, _: &str) -> Result<Value, EngineError> { unreachable!() }
            fn exit(&self, _: &Context) -> Result<Value, EngineError> { unreachable!() }
            fn subscribe(&self, _: &Context, _: &[String]) -> Result<Value, EngineError> { unreachable!() }
            fn unsubscribe(&self, _: &Context, _: &str) -> Result<Value, EngineError> { unreachable!() }
        }
        let (id, value) = reply_of(dispatch(&Failing, &ctx(), r#"{"id":9,"op":"scope","scopes":[]}"#).await);
        assert_eq!(id, 9);
        assert_eq!(value["error"]["code"], "BOUNDARY_VIOLATION");
    }

    /// The point of the split: parsed work moves onto the runtime, so the IPC
    /// callback returns immediately even for an op that suspends.
    #[tokio::test]
    async fn execution_moves_onto_the_runtime() {
        let engine = std::sync::Arc::new(Mock::new());
        let Parsed::Execute(request) = parse(r#"{"id":6,"op":"await","processes":["p_1"]}"#) else {
            panic!("expected execute");
        };
        let spawned = engine.clone();
        let outcome = tokio::spawn(async move { execute(spawned.as_ref(), &ctx(), &request).await })
            .await
            .unwrap();
        let (id, value) = reply_of(outcome);
        assert_eq!(id, 6);
        assert_eq!(value["result"], json!({"ok": true}));
        assert_eq!(engine.seen(), r#"await ["p_1"] results_only=false"#);
    }
}
