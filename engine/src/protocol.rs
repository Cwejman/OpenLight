//! The wire shapes of the program protocol (engine.md, The Program Protocol):
//! requests in, responses and events out, one JSON shape over every transport.
//! `dispatch_request` is the single entry all transports feed.

use crate::engine::{Engine, Inner};
use crate::errors::EngineError;
use crate::types::{
    AwaitOpts, BatchEntry, BoundarySpec, Context, DryRunResult, ProcessId, ReadTarget, RunArgs,
    RunMode, SubscriptionId, TaggedRead,
};
use db::{
    BranchName, ChunkDeclaration, ChunkId, ChunkItem, Commit, CommitId, Declaration, Includes,
    Placement, PlacementSpec, PlacementType, ReadOpts, ScopeOpts, ScopeResult, Spec,
};
use serde_json::{json, Value};
use std::sync::Weak;
use tokio::sync::mpsc;

pub struct Response {
    pub id: Option<Value>,
    pub body: Result<Value, EngineError>,
}

impl Response {
    pub fn to_json(&self) -> Value {
        match &self.body {
            Ok(result) => json!({ "id": self.id, "result": result }),
            Err(e) => json!({ "id": self.id, "error": { "code": e.wire_code(), "message": e.to_string() } }),
        }
    }
}

/// Dispatch one wire request under the given identity. Responses pair the
/// request's `id`; malformed requests answer `INVALID_REQUEST` rather than kill
/// — the terminal classification of unparseable transport lines is the
/// provider pump's concern (engine.md, Error Classification).
pub async fn dispatch_request(engine: &Engine, ctx: &Context, request: Value) -> Response {
    let id = request.get("id").cloned();
    let body = handle(engine, ctx, &request).await;
    Response { id, body }
}

async fn handle(engine: &Engine, ctx: &Context, request: &Value) -> Result<Value, EngineError> {
    let op = request
        .get("op")
        .and_then(Value::as_str)
        .ok_or_else(|| EngineError::InvalidRequest("missing op".into()))?;
    match op {
        "scope" => {
            let scopes = chunk_ids(request.get("scopes"))?;
            let opts = parse_scope_opts(request.get("opts"))?;
            engine.scope(ctx, &scopes, opts).map(|r| scope_result_json(&r))
        }
        "get" => {
            let chunk = chunk_id_field(request, "chunkId")?;
            let opts = parse_read_opts(request.get("opts"))?;
            engine
                .get(ctx, &chunk, opts)
                .map(|item| item.map(|i| chunk_item_json(&i)).unwrap_or(Value::Null))
        }
        "read_batch" => {
            let reads = parse_tagged_reads(request.get("reads"))?;
            engine.read_batch(ctx, &reads).map(|b| batch_json(&b))
        }
        "commit" => {
            let declaration = parse_declaration(request.get("declaration"))?;
            if request.get("dry_run").and_then(Value::as_bool).unwrap_or(false) {
                Ok(dry_run_json(&engine.commit_dry_run(ctx, &declaration)))
            } else {
                engine.commit(ctx, declaration).map(|c| commit_json(&c))
            }
        }
        "run" => {
            let args = parse_run_args(request)?;
            engine
                .run(ctx, args)
                .map(|pid| json!({ "process": pid.as_str() }))
        }
        "await" => {
            let processes = chunk_ids(request.get("processes"))?;
            let opts = AwaitOpts {
                results_only: request
                    .pointer("/opts/results_only")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
            };
            let results = engine.await_processes(ctx, &processes, opts).await?;
            let mut map = serde_json::Map::new();
            for (pid, scope) in results {
                map.insert(pid.as_str().to_string(), scope_result_json(&scope));
            }
            Ok(Value::Object(map))
        }
        "cancel" => {
            let process = chunk_id_field(request, "process")?;
            engine.cancel(ctx, &process).map(|_| json!({}))
        }
        "exit" => engine.exit(ctx).map(|_| json!({})),
        "subscribe" => {
            let scopes = chunk_ids(request.get("scopes"))?;
            engine
                .subscribe(ctx, &scopes)
                .map(|id| json!({ "subscriptionId": id.as_str() }))
        }
        "unsubscribe" => {
            let id = request
                .get("subscriptionId")
                .and_then(Value::as_str)
                .ok_or_else(|| EngineError::InvalidRequest("missing subscriptionId".into()))?;
            engine.unsubscribe(SubscriptionId::from(id));
            Ok(json!({}))
        }
        other => Err(EngineError::InvalidRequest(format!("unknown op '{other}'"))),
    }
}

/// The engine-side pump for incoming wire requests routed by runtime providers.
/// `exit` is ordered deliberately: the response is delivered before the
/// terminal transition drops the transport.
pub(crate) async fn request_pump(
    inner: Weak<Inner>,
    mut rx: mpsc::Receiver<(Context, Value)>,
) {
    while let Some((ctx, request)) = rx.recv().await {
        let Some(strong) = inner.upgrade() else { return };
        let engine = Engine { inner: strong };
        let is_exit = request.get("op").and_then(Value::as_str) == Some("exit");
        let response = if is_exit {
            Response {
                id: request.get("id").cloned(),
                body: Ok(json!({})),
            }
        } else {
            dispatch_request(&engine, &ctx, request).await
        };
        if let Some(pid) = &ctx.process_id {
            if let Some(transport) = engine.inner.slot_transport(pid) {
                let _ = transport.send(response.to_json()).await;
            }
        }
        if is_exit {
            let _ = engine.exit(&ctx);
        }
    }
}

// ---- events ----------------------------------------------------------------

pub(crate) fn scope_changed_event(id: &SubscriptionId, commit: &Commit) -> Value {
    json!({ "event": "scope_changed", "subscriptionId": id.as_str(), "commit": commit_json(commit) })
}

pub(crate) fn lagged_event(ids: &[SubscriptionId]) -> Value {
    json!({ "event": "lagged", "subscriptionIds": ids.iter().map(|i| i.as_str()).collect::<Vec<_>>() })
}

pub(crate) fn subscription_invalid_event(id: &SubscriptionId, reason: &str) -> Value {
    json!({ "event": "subscription_invalid", "subscriptionId": id.as_str(), "reason": reason })
}

// ---- request parsing -------------------------------------------------------

fn chunk_ids(value: Option<&Value>) -> Result<Vec<ChunkId>, EngineError> {
    let array = value
        .and_then(Value::as_array)
        .ok_or_else(|| EngineError::InvalidRequest("expected an id array".into()))?;
    array
        .iter()
        .map(|v| {
            v.as_str()
                .map(ChunkId::from)
                .ok_or_else(|| EngineError::InvalidRequest("ids must be strings".into()))
        })
        .collect()
}

fn chunk_id_field(request: &Value, field: &str) -> Result<ChunkId, EngineError> {
    request
        .get(field)
        .and_then(Value::as_str)
        .map(ChunkId::from)
        .ok_or_else(|| EngineError::InvalidRequest(format!("missing {field}")))
}

/// Protocol reads default to content depth: names, specs, bodies, placements,
/// dimensions. `include: { body: false }` is the survey read.
fn protocol_includes(include: Option<&Value>) -> Includes {
    let body = include
        .and_then(|i| i.get("body"))
        .and_then(Value::as_bool)
        .unwrap_or(true);
    Includes {
        chunk_name: true,
        chunk_spec: true,
        chunk_body: body,
        chunk_placements: true,
        intersection_chunks: true,
        dimensions: true,
        ..Includes::default()
    }
}

fn parse_scope_opts(value: Option<&Value>) -> Result<ScopeOpts, EngineError> {
    let opts = value.unwrap_or(&Value::Null);
    Ok(ScopeOpts {
        branch: opts
            .get("branch")
            .and_then(Value::as_str)
            .map(BranchName::from)
            .unwrap_or_default(),
        at: opts.get("at").and_then(Value::as_str).map(CommitId::from),
        match_: opts
            .get("match_")
            .and_then(Value::as_str)
            .map(str::to_string),
        exclude: match opts.get("exclude") {
            Some(v) => chunk_ids(Some(v))?,
            None => Vec::new(),
        },
        limit: opts.get("limit").and_then(Value::as_u64).map(|v| v as usize),
        offset: opts.get("offset").and_then(Value::as_u64).map(|v| v as usize),
        include: protocol_includes(opts.get("include")),
    })
}

fn parse_read_opts(value: Option<&Value>) -> Result<ReadOpts, EngineError> {
    let opts = value.unwrap_or(&Value::Null);
    Ok(ReadOpts {
        branch: opts
            .get("branch")
            .and_then(Value::as_str)
            .map(BranchName::from)
            .unwrap_or_default(),
        at: opts.get("at").and_then(Value::as_str).map(CommitId::from),
        include: protocol_includes(opts.get("include")),
    })
}

fn parse_tagged_reads(value: Option<&Value>) -> Result<Vec<TaggedRead>, EngineError> {
    let array = value
        .and_then(Value::as_array)
        .ok_or_else(|| EngineError::InvalidRequest("read_batch requires reads".into()))?;
    array
        .iter()
        .map(|read| {
            let tag = read
                .get("tag")
                .and_then(Value::as_str)
                .ok_or_else(|| EngineError::InvalidRequest("read missing tag".into()))?
                .to_string();
            let target = if read.get("chunkId").is_some() {
                ReadTarget::Get {
                    chunk_id: chunk_id_field(read, "chunkId")?,
                    opts: parse_read_opts(read.get("opts"))?,
                }
            } else {
                ReadTarget::Scope {
                    scopes: chunk_ids(read.get("scopes"))?,
                    opts: parse_scope_opts(read.get("opts"))?,
                }
            };
            Ok(TaggedRead {
                tag,
                target,
                ctx: None, // slot-identity override is the transport handler's concern
            })
        })
        .collect()
}

pub(crate) fn parse_declaration(value: Option<&Value>) -> Result<Declaration, EngineError> {
    let decl = value.ok_or_else(|| EngineError::InvalidRequest("missing declaration".into()))?;
    let chunks = decl
        .get("chunks")
        .and_then(Value::as_array)
        .map(|chunks| {
            chunks
                .iter()
                .map(|c| {
                    let spec: Option<Spec> = match c.get("spec") {
                        Some(s) => Some(serde_json::from_value(s.clone()).map_err(|e| {
                            EngineError::InvalidRequest(format!("malformed spec: {e}"))
                        })?),
                        None => None,
                    };
                    Ok(ChunkDeclaration {
                        id: c.get("id").and_then(Value::as_str).map(ChunkId::from),
                        name: c.get("name").and_then(Value::as_str).map(str::to_string),
                        spec,
                        body: c.get("body").cloned(),
                        removed: c.get("removed").and_then(Value::as_bool).unwrap_or(false),
                    })
                })
                .collect::<Result<Vec<_>, EngineError>>()
        })
        .transpose()?
        .unwrap_or_default();
    let placements = decl
        .get("placements")
        .and_then(Value::as_array)
        .map(|placements| {
            placements
                .iter()
                .map(|p| {
                    let type_ = p
                        .get("type")
                        .and_then(Value::as_str)
                        .and_then(PlacementType::parse)
                        .ok_or_else(|| {
                            EngineError::InvalidRequest("placement type must be instance|relates".into())
                        })?;
                    Ok(PlacementSpec {
                        chunk: chunk_id_field(p, "chunk")?,
                        scope: chunk_id_field(p, "scope")?,
                        type_,
                        seq: p.get("seq").and_then(Value::as_i64),
                        active: p.get("active").and_then(Value::as_bool).unwrap_or(true),
                    })
                })
                .collect::<Result<Vec<_>, EngineError>>()
        })
        .transpose()?
        .unwrap_or_default();
    Ok(Declaration {
        chunks,
        placements,
        message: decl
            .get("message")
            .and_then(Value::as_str)
            .map(str::to_string),
    })
}

/// The protocol projection of RunArgs (sdk.md): `program` beside `args`;
/// `placements` engine-owned; boundaries are always fresh roots.
fn parse_run_args(request: &Value) -> Result<RunArgs, EngineError> {
    let program_id = chunk_id_field(request, "program")?;
    let args = request.get("args").unwrap_or(&Value::Null);
    let chunks = parse_declaration(Some(&json!({ "chunks": args.get("chunks").cloned().unwrap_or(json!([])) })))?.chunks;
    let mode = match args.get("mode").and_then(Value::as_str) {
        None | Some("child") => RunMode::Child,
        Some("launch") => RunMode::Launch,
        Some(other) => {
            return Err(EngineError::InvalidRequest(format!("unknown mode '{other}'")))
        }
    };
    let roots = |field: &str| -> Result<Vec<ChunkId>, EngineError> {
        match args.get(field) {
            Some(v) => chunk_ids(Some(v)),
            None => Ok(Vec::new()),
        }
    };
    Ok(RunArgs {
        program_id,
        chunks,
        placements: Vec::new(),
        mode,
        read_boundary: BoundarySpec::Roots(roots("readBoundary")?),
        write_boundary: BoundarySpec::Roots(roots("writeBoundary")?),
        timeout_ms: args.get("timeout_ms").and_then(Value::as_u64),
    })
}

// ---- result serialization --------------------------------------------------

pub(crate) fn placement_json(p: &Placement) -> Value {
    let mut map = serde_json::Map::new();
    map.insert("scope_id".into(), json!(p.scope_id.as_str()));
    map.insert("type_".into(), json!(p.type_.as_str()));
    if let Some(seq) = p.seq {
        map.insert("seq".into(), json!(seq));
    }
    Value::Object(map)
}

pub(crate) fn chunk_item_json(item: &ChunkItem) -> Value {
    let mut map = serde_json::Map::new();
    map.insert("id".into(), json!(item.id.as_str()));
    if let Some(name) = &item.name {
        map.insert("name".into(), json!(name));
    }
    if let Some(spec) = &item.spec {
        map.insert("spec".into(), serde_json::to_value(spec).expect("spec serializes"));
    }
    if let Some(body) = &item.body {
        map.insert("body".into(), body.clone());
    }
    if let Some(placements) = &item.placements {
        map.insert(
            "placements".into(),
            Value::Array(placements.iter().map(placement_json).collect()),
        );
    }
    Value::Object(map)
}

pub(crate) fn scope_result_json(result: &ScopeResult) -> Value {
    json!({
        "head": result.head.as_str(),
        "total": result.total,
        "in_scope": result.in_scope,
        "in_scope_instance": result.in_scope_instance,
        "in_scope_relates": result.in_scope_relates,
        "chunks": result.chunks.iter().map(chunk_item_json).collect::<Vec<_>>(),
        "dimensions": result.dimensions.iter().map(|d| json!({
            "id": d.id.as_str(),
            "name": d.name,
            "count": d.count,
            "instance": d.instance,
            "relates": d.relates,
        })).collect::<Vec<_>>(),
    })
}

pub(crate) fn commit_json(commit: &Commit) -> Value {
    json!({
        "id": commit.id.as_str(),
        "parent_id": commit.parent_id.as_ref().map(|p| p.as_str()),
        "timestamp": commit.timestamp,
        "message": commit.message,
        "process_id": commit.process_id,
        "branch": commit.branch.as_str(),
        "chunks_modified": commit.chunks_modified.iter().map(|c| c.as_str()).collect::<Vec<_>>(),
        "placements_modified": commit.placements_modified.iter()
            .map(|(c, s)| json!([c.as_str(), s.as_str()])).collect::<Vec<_>>(),
    })
}

pub(crate) fn dry_run_json(result: &DryRunResult) -> Value {
    json!({
        "valid": result.valid,
        "errors": result.errors.iter()
            .map(|e| json!({ "code": e.wire_code(), "message": e.to_string() }))
            .collect::<Vec<_>>(),
    })
}

pub(crate) fn batch_json(batch: &crate::types::BatchResult) -> Value {
    let mut results = serde_json::Map::new();
    for (tag, entry) in &batch.results {
        let value = match entry {
            BatchEntry::Scope(r) => scope_result_json(r),
            BatchEntry::Get(Some(item)) => chunk_item_json(item),
            BatchEntry::Get(None) => Value::Null,
            BatchEntry::Err(e) => json!({ "error": { "code": e.wire_code(), "message": e.to_string() } }),
        };
        results.insert(tag.clone(), value);
    }
    json!({ "head": batch.head.as_str(), "results": Value::Object(results) })
}
