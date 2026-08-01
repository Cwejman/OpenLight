//! Wire protocol — pure. The program protocol's request/response envelope,
//! exactly as `spec/engine.md` §The Program Protocol specifies it: every
//! request has an `op` and a monotonic `id`; every response pairs the same
//! `id` with either `result` or `error`; events carry an `event` field and
//! no `id`. The wry delivery scripts (`__sdk.resolve(<id>, <payload>)`,
//! `__sdk.event(<payload>)`) are `spec/host.md` §Transport.

use serde::Deserialize;
use serde_json::Value;

// --- Errors (engine.md §Schema, Errors table) -------------------------------

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ErrorCode {
    BoundaryViolation,
    ReadOnlyMount,
    ValidationError,
    NotFound,
    RunFailed,
    InvalidRequest,
    TransportClosed,
}

impl ErrorCode {
    pub fn wire(self) -> &'static str {
        match self {
            ErrorCode::BoundaryViolation => "BOUNDARY_VIOLATION",
            ErrorCode::ReadOnlyMount => "READ_ONLY_MOUNT",
            ErrorCode::ValidationError => "VALIDATION_ERROR",
            ErrorCode::NotFound => "NOT_FOUND",
            ErrorCode::RunFailed => "RUN_FAILED",
            ErrorCode::InvalidRequest => "INVALID_REQUEST",
            ErrorCode::TransportClosed => "TRANSPORT_CLOSED",
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct EngineError {
    pub code: ErrorCode,
    pub message: String,
}

impl EngineError {
    pub fn new(code: ErrorCode, message: impl Into<String>) -> Self {
        EngineError { code, message: message.into() }
    }
}

// --- Requests (engine.md §Schema) --------------------------------------------

/// `ScopeOpts` wire mirror — field names are the wire names (`match_` is
/// literal on the wire, per engine.md's schema example and sdk.md's TS types).
#[derive(Debug, Clone, PartialEq, Default, Deserialize)]
pub struct ScopeOpts {
    pub branch: Option<String>,
    pub at: Option<String>,
    pub match_: Option<String>,
    pub exclude: Option<Vec<String>>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub include: Option<Includes>,
}

/// `ReadOpts` wire mirror — the single-chunk read's options (sdk.md
/// `get(chunkId, opts?)`): which branch, which commit, what to project.
#[derive(Debug, Clone, PartialEq, Default, Deserialize)]
pub struct ReadOpts {
    pub branch: Option<String>,
    pub at: Option<String>,
    pub include: Option<Includes>,
}

#[derive(Debug, Clone, PartialEq, Deserialize)]
pub struct Includes {
    pub body: Option<bool>,
}

#[derive(Debug, Clone, Copy, PartialEq, Default, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RunMode {
    #[default]
    Child,
    Launch,
}

/// `RunArgs` wire mirror (sdk.md §Types) — the engine's `RunArgs` minus the
/// two fields the protocol does not carry: `program_id` is the sibling
/// `program` field of the request, and `placements` is engine-owned. The
/// boundaries are roots only; naming an existing boundary chunk is a Rust-API
/// affordance, not a protocol one.
#[derive(Debug, Clone, PartialEq, Default, Deserialize)]
pub struct RunArgs {
    /// Typed arguments, left uninterpreted — the host does not read
    /// declarations (host.md §What the Host Does Not Do).
    #[serde(default)]
    pub chunks: Vec<Value>,
    #[serde(default)]
    pub mode: RunMode,
    #[serde(default, rename = "readBoundary")]
    pub read_boundary: Vec<String>,
    #[serde(default, rename = "writeBoundary")]
    pub write_boundary: Vec<String>,
    pub timeout_ms: Option<u64>,
}

/// One sub-query of `read_batch` — tagged `scope` or `get` shape (engine.md,
/// sdk.md `TaggedRead`).
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(untagged)]
pub enum TaggedRead {
    Scope {
        tag: String,
        scopes: Vec<String>,
        #[serde(default)]
        opts: ScopeOpts,
    },
    Get {
        tag: String,
        #[serde(rename = "chunkId")]
        chunk_id: String,
        #[serde(default)]
        opts: ReadOpts,
    },
}

#[derive(Debug, Clone, PartialEq, Default, Deserialize)]
pub struct AwaitOpts {
    #[serde(default)]
    pub results_only: bool,
}

/// The ten operations — engine.md §The Program Protocol, nothing beyond.
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(tag = "op", rename_all = "snake_case")]
pub enum Op {
    Scope {
        scopes: Vec<String>,
        #[serde(default)]
        opts: ScopeOpts,
    },
    Get {
        #[serde(rename = "chunkId")]
        chunk_id: String,
        #[serde(default)]
        opts: ReadOpts,
    },
    ReadBatch {
        reads: Vec<TaggedRead>,
    },
    Commit {
        declaration: Value,
        #[serde(default)]
        dry_run: bool,
    },
    Run {
        program: String,
        #[serde(default)]
        args: RunArgs,
    },
    Await {
        processes: Vec<String>,
        #[serde(default)]
        opts: AwaitOpts,
    },
    Cancel {
        process: String,
    },
    Exit,
    Subscribe {
        scopes: Vec<String>,
    },
    Unsubscribe {
        #[serde(rename = "subscriptionId")]
        subscription_id: String,
    },
}

#[derive(Debug, Clone, PartialEq)]
pub struct Request {
    pub id: u64,
    pub op: Op,
}

/// A message that failed to parse. `id` is carried when extractable so the
/// caller can still reply `INVALID_REQUEST` on the right call.
#[derive(Debug, Clone, PartialEq)]
pub struct ParseFailure {
    pub id: Option<u64>,
    pub message: String,
}

pub fn parse_request(raw: &str) -> Result<Request, ParseFailure> {
    let value: Value = serde_json::from_str(raw)
        .map_err(|e| ParseFailure { id: None, message: format!("malformed JSON: {e}") })?;
    let Some(id) = value.get("id").and_then(Value::as_u64) else {
        return Err(ParseFailure { id: None, message: "missing or non-numeric id".into() });
    };
    let op = Op::deserialize(&value)
        .map_err(|e| ParseFailure { id: Some(id), message: e.to_string() })?;
    Ok(Request { id, op })
}

// --- Responses and delivery scripts ------------------------------------------

pub fn response_ok(id: u64, result: &Value) -> String {
    serde_json::json!({ "id": id, "result": result }).to_string()
}

pub fn response_err(id: u64, error: &EngineError) -> String {
    serde_json::json!({
        "id": id,
        "error": { "code": error.code.wire(), "message": error.message }
    })
    .to_string()
}

/// host.md §Transport: the host resolves a webview call by injecting
/// `__sdk.resolve(<id>, <payload>)`. The payload is the full response
/// envelope (`id` + `result|error`) so the SDK demultiplexes both transports
/// by one message shape (sdk.md §Webview transport).
pub fn resolve_script(id: u64, response_json: &str) -> String {
    format!("__sdk.resolve({id}, {});", escape_for_js(response_json))
}

/// host.md §Transport: unsolicited events ride `__sdk.event(<payload>)`.
pub fn event_script(event_json: &str) -> String {
    format!("__sdk.event({});", escape_for_js(event_json))
}

/// Route an engine transport payload to its delivery script by message shape
/// (sdk.md: responses carry `id`, events carry `event` and no `id`).
pub fn delivery_script(payload: &Value) -> String {
    let json = payload.to_string();
    match payload.get("id").and_then(Value::as_u64) {
        Some(id) => resolve_script(id, &json),
        None => event_script(&json),
    }
}

// JSON is a valid JS expression except U+2028/U+2029, which are literal
// line terminators in JS source — escape them before script injection.
fn escape_for_js(json: &str) -> String {
    json.replace('\u{2028}', "\\u2028").replace('\u{2029}', "\\u2029")
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    // The ten schema lines from engine.md §Schema, opts filled concretely.

    #[test]
    fn parses_scope_with_opts() {
        let raw = r#"{"id":1,"op":"scope","scopes":["chunk_abc","chunk_def"],"opts":{"match_":"session today","exclude":["chunk_hidden"],"limit":50}}"#;
        let req = parse_request(raw).unwrap();
        assert_eq!(req.id, 1);
        match req.op {
            Op::Scope { scopes, opts } => {
                assert_eq!(scopes, ["chunk_abc", "chunk_def"]);
                assert_eq!(opts.match_.as_deref(), Some("session today"));
                assert_eq!(opts.exclude, Some(vec!["chunk_hidden".to_string()]));
                assert_eq!(opts.limit, Some(50));
                assert_eq!(opts.offset, None);
            }
            other => panic!("expected scope, got {other:?}"),
        }
    }

    #[test]
    fn parses_scope_without_opts_as_default() {
        let req = parse_request(r#"{"id":1,"op":"scope","scopes":[]}"#).unwrap();
        assert_eq!(req.op, Op::Scope { scopes: vec![], opts: ScopeOpts::default() });
    }

    #[test]
    fn parses_get_without_opts_as_default() {
        let req = parse_request(r#"{"id":2,"op":"get","chunkId":"chunk_abc"}"#).unwrap();
        assert_eq!(
            req.op,
            Op::Get { chunk_id: "chunk_abc".into(), opts: ReadOpts::default() }
        );
    }

    #[test]
    fn parses_get_with_read_opts() {
        let raw = r#"{"id":2,"op":"get","chunkId":"chunk_abc","opts":{"branch":"work","at":"commit_9","include":{"body":false}}}"#;
        match parse_request(raw).unwrap().op {
            Op::Get { chunk_id, opts } => {
                assert_eq!(chunk_id, "chunk_abc");
                assert_eq!(opts.branch.as_deref(), Some("work"));
                assert_eq!(opts.at.as_deref(), Some("commit_9"));
                assert_eq!(opts.include, Some(Includes { body: Some(false) }));
            }
            other => panic!("expected get, got {other:?}"),
        }
    }

    #[test]
    fn parses_read_batch() {
        let raw = r#"{"id":3,"op":"read_batch","reads":[{"tag":"a","scopes":["s1"]},{"tag":"b","chunkId":"c1"}]}"#;
        let req = parse_request(raw).unwrap();
        match req.op {
            Op::ReadBatch { reads } => {
                assert_eq!(reads.len(), 2);
                assert_eq!(
                    reads[0],
                    TaggedRead::Scope {
                        tag: "a".into(),
                        scopes: vec!["s1".into()],
                        opts: ScopeOpts::default()
                    }
                );
                assert_eq!(
                    reads[1],
                    TaggedRead::Get {
                        tag: "b".into(),
                        chunk_id: "c1".into(),
                        opts: ReadOpts::default()
                    }
                );
            }
            other => panic!("expected read_batch, got {other:?}"),
        }
    }

    /// A tagged `get` carries `ReadOpts`, a tagged `scope` carries `ScopeOpts`
    /// — the same split as the standalone ops (engine.md `read_batch`).
    #[test]
    fn parses_read_batch_get_with_read_opts() {
        let raw = r#"{"id":3,"op":"read_batch","reads":[{"tag":"b","chunkId":"c1","opts":{"at":"commit_2"}}]}"#;
        match parse_request(raw).unwrap().op {
            Op::ReadBatch { reads } => assert_eq!(
                reads[0],
                TaggedRead::Get {
                    tag: "b".into(),
                    chunk_id: "c1".into(),
                    opts: ReadOpts { at: Some("commit_2".into()), ..ReadOpts::default() }
                }
            ),
            other => panic!("expected read_batch, got {other:?}"),
        }
    }

    #[test]
    fn parses_commit() {
        let raw = r#"{"id":4,"op":"commit","declaration":{"chunks":[]},"dry_run":false}"#;
        let req = parse_request(raw).unwrap();
        assert_eq!(
            req.op,
            Op::Commit { declaration: json!({"chunks": []}), dry_run: false }
        );
    }

    /// sdk.md §Types: `run(programId, args)` — every run field except the
    /// program id lives inside `args` (`RunArgs`).
    #[test]
    fn parses_run_with_typed_args() {
        let raw = r#"{"id":5,"op":"run","program":"filesystem","args":{"chunks":[{"name":"target","body":{"path":"/x"}}],"mode":"launch","readBoundary":["r1","r2"],"writeBoundary":["w1"],"timeout_ms":5000}}"#;
        match parse_request(raw).unwrap().op {
            Op::Run { program, args } => {
                assert_eq!(program, "filesystem");
                assert_eq!(args.mode, RunMode::Launch);
                assert_eq!(args.chunks, vec![json!({"name": "target", "body": {"path": "/x"}})]);
                assert_eq!(args.read_boundary, ["r1", "r2"]);
                assert_eq!(args.write_boundary, ["w1"]);
                assert_eq!(args.timeout_ms, Some(5000));
            }
            other => panic!("expected run, got {other:?}"),
        }
    }

    #[test]
    fn run_without_args_is_child_with_empty_roots() {
        // mode omitted → child (engine.md: "mode: 'child' (default)"); the
        // boundary roots default empty, as the engine's parse does.
        match parse_request(r#"{"id":5,"op":"run","program":"filesystem"}"#).unwrap().op {
            Op::Run { args, .. } => {
                assert_eq!(args, RunArgs::default());
                assert_eq!(args.mode, RunMode::Child);
                assert!(args.read_boundary.is_empty() && args.write_boundary.is_empty());
                assert_eq!(args.timeout_ms, None);
            }
            other => panic!("expected run, got {other:?}"),
        }
    }

    /// The engine ignores unrecognized keys inside `args`; the rim does too,
    /// so a program's own argument shape never fails at the host.
    #[test]
    fn run_ignores_unknown_arg_fields() {
        let raw = r#"{"id":5,"op":"run","program":"filesystem","args":{"path":"/x"}}"#;
        match parse_request(raw).unwrap().op {
            Op::Run { args, .. } => assert_eq!(args, RunArgs::default()),
            other => panic!("expected run, got {other:?}"),
        }
    }

    #[test]
    fn rejects_unknown_run_mode() {
        let raw = r#"{"id":5,"op":"run","program":"filesystem","args":{"mode":"detach"}}"#;
        let failure = parse_request(raw).unwrap_err();
        assert_eq!(failure.id, Some(5));
    }

    #[test]
    fn parses_await() {
        let raw = r#"{"id":6,"op":"await","processes":["p_1","p_2"],"opts":{"results_only":true}}"#;
        let req = parse_request(raw).unwrap();
        assert_eq!(
            req.op,
            Op::Await {
                processes: vec!["p_1".into(), "p_2".into()],
                opts: AwaitOpts { results_only: true }
            }
        );
    }

    #[test]
    fn parses_cancel_exit_subscribe_unsubscribe() {
        assert_eq!(
            parse_request(r#"{"id":7,"op":"cancel","process":"p_1"}"#).unwrap().op,
            Op::Cancel { process: "p_1".into() }
        );
        assert_eq!(parse_request(r#"{"id":8,"op":"exit"}"#).unwrap().op, Op::Exit);
        assert_eq!(
            parse_request(r#"{"id":9,"op":"subscribe","scopes":["my-session"]}"#).unwrap().op,
            Op::Subscribe { scopes: vec!["my-session".into()] }
        );
        assert_eq!(
            parse_request(r#"{"id":10,"op":"unsubscribe","subscriptionId":"sub_1"}"#).unwrap().op,
            Op::Unsubscribe { subscription_id: "sub_1".into() }
        );
    }

    #[test]
    fn unknown_op_fails_but_keeps_id() {
        let failure = parse_request(r#"{"id":11,"op":"snapshot"}"#).unwrap_err();
        assert_eq!(failure.id, Some(11));
        assert!(failure.message.contains("snapshot"), "message names the op: {}", failure.message);
    }

    #[test]
    fn missing_fields_fail_but_keep_id() {
        let failure = parse_request(r#"{"id":12,"op":"get"}"#).unwrap_err();
        assert_eq!(failure.id, Some(12));
    }

    #[test]
    fn malformed_json_fails_without_id() {
        let failure = parse_request("not json").unwrap_err();
        assert_eq!(failure.id, None);
    }

    #[test]
    fn missing_id_fails_without_id() {
        let failure = parse_request(r#"{"op":"exit"}"#).unwrap_err();
        assert_eq!(failure.id, None);
    }

    // Responses: same id, result|error (engine.md §Schema).

    #[test]
    fn response_ok_pairs_id_with_result() {
        let response = response_ok(3, &json!({"process": "p_1"}));
        let value: Value = serde_json::from_str(&response).unwrap();
        assert_eq!(value, json!({"id": 3, "result": {"process": "p_1"}}));
    }

    #[test]
    fn response_err_pairs_id_with_wire_code() {
        let err = EngineError::new(ErrorCode::BoundaryViolation, "outside read boundary");
        let value: Value = serde_json::from_str(&response_err(4, &err)).unwrap();
        assert_eq!(
            value,
            json!({"id": 4, "error": {"code": "BOUNDARY_VIOLATION", "message": "outside read boundary"}})
        );
    }

    #[test]
    fn all_error_codes_use_specced_wire_names() {
        let codes = [
            (ErrorCode::BoundaryViolation, "BOUNDARY_VIOLATION"),
            (ErrorCode::ReadOnlyMount, "READ_ONLY_MOUNT"),
            (ErrorCode::ValidationError, "VALIDATION_ERROR"),
            (ErrorCode::NotFound, "NOT_FOUND"),
            (ErrorCode::RunFailed, "RUN_FAILED"),
            (ErrorCode::InvalidRequest, "INVALID_REQUEST"),
            (ErrorCode::TransportClosed, "TRANSPORT_CLOSED"),
        ];
        for (code, wire) in codes {
            assert_eq!(code.wire(), wire);
        }
    }

    // Delivery scripts: host.md §Transport shapes.

    #[test]
    fn resolve_script_injects_sdk_resolve() {
        assert_eq!(
            resolve_script(7, r#"{"id":7,"result":{}}"#),
            r#"__sdk.resolve(7, {"id":7,"result":{}});"#
        );
    }

    #[test]
    fn event_script_injects_sdk_event() {
        assert_eq!(
            event_script(r#"{"event":"scope_changed","subscriptionId":"sub_1"}"#),
            r#"__sdk.event({"event":"scope_changed","subscriptionId":"sub_1"});"#
        );
    }

    #[test]
    fn delivery_routes_by_message_shape() {
        let response = json!({"id": 3, "result": {}});
        assert!(delivery_script(&response).starts_with("__sdk.resolve(3, "));
        let event = json!({"event": "scope_changed", "subscriptionId": "sub_1"});
        assert!(delivery_script(&event).starts_with("__sdk.event("));
    }

    #[test]
    fn scripts_escape_js_line_terminators() {
        let json = "{\"id\":1,\"result\":\"a\u{2028}b\u{2029}c\"}";
        let script = resolve_script(1, json);
        assert!(!script.contains('\u{2028}') && !script.contains('\u{2029}'));
        assert!(script.contains("\\u2028") && script.contains("\\u2029"));
    }
}
