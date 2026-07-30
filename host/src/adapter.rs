//! The swap: `EngineApi` implemented by the real `engine::Engine`. The rim
//! hands dispatch this adapter instead of the `FixtureStub` and the surfaces
//! read the real field — the seam's proof (board.md, build track step 5).
//! Wire result shapes come from the engine's own serializers
//! (`engine::scope_result_json` and friends), so the wire has one home.

use serde_json::{json, Value};

use crate::dispatch::{BoxFuture, Context, EngineApi};
use crate::protocol::{
    AwaitOpts, EngineError, ErrorCode, Includes, ReadOpts, RunArgs, RunMode, ScopeOpts, TaggedRead,
};

pub struct EngineAdapter {
    engine: engine::Engine,
}

impl EngineAdapter {
    pub fn new(engine: engine::Engine) -> EngineAdapter {
        EngineAdapter { engine }
    }
}

impl EngineApi for EngineAdapter {
    fn scope(&self, ctx: &Context, scopes: &[String], opts: &ScopeOpts) -> Result<Value, EngineError> {
        let scopes: Vec<db::ChunkId> = scopes.iter().map(|s| db::ChunkId::from(s.as_str())).collect();
        self.engine
            .scope(&context(ctx), &scopes, scope_opts(opts))
            .map(|r| engine::scope_result_json(&r))
            .map_err(error)
    }

    fn get(&self, ctx: &Context, chunk_id: &str, opts: &ReadOpts) -> Result<Value, EngineError> {
        self.engine
            .get(&context(ctx), &db::ChunkId::from(chunk_id), read_opts(opts))
            .map(|item| item.map(|i| engine::chunk_item_json(&i)).unwrap_or(Value::Null))
            .map_err(error)
    }

    fn read_batch(&self, ctx: &Context, reads: &[TaggedRead]) -> Result<Value, EngineError> {
        let reads: Vec<engine::TaggedRead> = reads.iter().map(tagged_read).collect();
        self.engine
            .read_batch(&context(ctx), &reads)
            .map(|b| engine::batch_json(&b))
            .map_err(error)
    }

    fn commit(&self, ctx: &Context, declaration: &Value, dry_run: bool) -> Result<Value, EngineError> {
        let declaration = engine::parse_declaration(Some(declaration)).map_err(error)?;
        if dry_run {
            let result = self.engine.commit_dry_run(&context(ctx), &declaration);
            return Ok(engine::dry_run_json(&result));
        }
        self.engine
            .commit(&context(ctx), declaration)
            .map(|c| engine::commit_json(&c))
            .map_err(error)
    }

    fn run(&self, ctx: &Context, program: &str, args: &RunArgs) -> Result<Value, EngineError> {
        let args = run_args(program, args).map_err(error)?;
        self.engine
            .run(&context(ctx), args)
            .map(|pid| json!({ "process": pid.as_str() }))
            .map_err(error)
    }

    fn await_processes<'a>(
        &'a self,
        ctx: &'a Context,
        processes: &'a [String],
        opts: &'a AwaitOpts,
    ) -> BoxFuture<'a, Result<Value, EngineError>> {
        Box::pin(async move {
            let ids: Vec<engine::ProcessId> =
                processes.iter().map(|p| db::ChunkId::from(p.as_str())).collect();
            let opts = engine::AwaitOpts { results_only: opts.results_only };
            let results = self
                .engine
                .await_processes(&context(ctx), &ids, opts)
                .await
                .map_err(error)?;
            let mut map = serde_json::Map::new();
            for (pid, scope) in results {
                map.insert(pid.as_str().to_string(), engine::scope_result_json(&scope));
            }
            Ok(Value::Object(map))
        })
    }

    fn cancel(&self, ctx: &Context, process: &str) -> Result<Value, EngineError> {
        self.engine
            .cancel(&context(ctx), &db::ChunkId::from(process))
            .map(|()| json!({}))
            .map_err(error)
    }

    fn exit(&self, ctx: &Context) -> Result<Value, EngineError> {
        self.engine.exit(&context(ctx)).map(|()| json!({})).map_err(error)
    }

    fn subscribe(&self, ctx: &Context, scopes: &[String]) -> Result<Value, EngineError> {
        let scopes: Vec<db::ChunkId> = scopes.iter().map(|s| db::ChunkId::from(s.as_str())).collect();
        self.engine
            .subscribe(&context(ctx), &scopes)
            .map(|id| json!({ "subscriptionId": id.as_str() }))
            .map_err(error)
    }

    fn unsubscribe(&self, _ctx: &Context, subscription_id: &str) -> Result<Value, EngineError> {
        self.engine.unsubscribe(engine::SubscriptionId::from(subscription_id));
        Ok(json!({}))
    }
}

// ---- conversions ------------------------------------------------------------

fn context(ctx: &Context) -> engine::Context {
    engine::Context {
        process_id: ctx.process_id.as_deref().map(db::ChunkId::from),
    }
}

fn error(e: engine::EngineError) -> EngineError {
    let code = match e.wire_code() {
        "BOUNDARY_VIOLATION" => ErrorCode::BoundaryViolation,
        "READ_ONLY_MOUNT" => ErrorCode::ReadOnlyMount,
        "VALIDATION_ERROR" => ErrorCode::ValidationError,
        "NOT_FOUND" => ErrorCode::NotFound,
        "RUN_FAILED" => ErrorCode::RunFailed,
        "TRANSPORT_CLOSED" => ErrorCode::TransportClosed,
        _ => ErrorCode::InvalidRequest,
    };
    EngineError::new(code, e.to_string())
}

/// Protocol reads default to content depth (engine.md); `include.body: false`
/// is the survey read — the same defaulting the engine's own wire parser
/// applies, mirrored here because the rim parsed the request already.
pub(crate) fn protocol_includes(include: Option<&Includes>) -> db::Includes {
    db::Includes {
        chunk_name: true,
        chunk_spec: true,
        chunk_body: include.and_then(|i| i.body).unwrap_or(true),
        chunk_placements: true,
        intersection_chunks: true,
        dimensions: true,
        ..db::Includes::default()
    }
}

pub(crate) fn scope_opts(opts: &ScopeOpts) -> db::ScopeOpts {
    db::ScopeOpts {
        branch: opts.branch.as_deref().map(db::BranchName::from).unwrap_or_default(),
        at: opts.at.as_deref().map(db::CommitId::from),
        match_: opts.match_.clone(),
        exclude: opts
            .exclude
            .as_deref()
            .unwrap_or(&[])
            .iter()
            .map(|s| db::ChunkId::from(s.as_str()))
            .collect(),
        limit: opts.limit,
        offset: opts.offset,
        include: protocol_includes(opts.include.as_ref()),
    }
}

pub(crate) fn read_opts(opts: &ReadOpts) -> db::ReadOpts {
    db::ReadOpts {
        branch: opts.branch.as_deref().map(db::BranchName::from).unwrap_or_default(),
        at: opts.at.as_deref().map(db::CommitId::from),
        include: protocol_includes(opts.include.as_ref()),
    }
}

fn tagged_read(read: &TaggedRead) -> engine::TaggedRead {
    match read {
        TaggedRead::Scope { tag, scopes, opts } => engine::TaggedRead {
            tag: tag.clone(),
            target: engine::ReadTarget::Scope {
                scopes: scopes.iter().map(|s| db::ChunkId::from(s.as_str())).collect(),
                opts: scope_opts(opts),
            },
            ctx: None, // slot-identity override is the transport handler's concern
        },
        TaggedRead::Get { tag, chunk_id, opts } => engine::TaggedRead {
            tag: tag.clone(),
            target: engine::ReadTarget::Get {
                chunk_id: db::ChunkId::from(chunk_id.as_str()),
                opts: read_opts(opts),
            },
            ctx: None,
        },
    }
}

fn run_args(program: &str, args: &RunArgs) -> Result<engine::RunArgs, engine::EngineError> {
    let chunks =
        engine::parse_declaration(Some(&json!({ "chunks": args.chunks })))?.chunks;
    Ok(engine::RunArgs {
        program_id: db::ChunkId::from(program),
        chunks,
        placements: Vec::new(), // engine-owned (protocol carries none)
        mode: match args.mode {
            RunMode::Child => engine::RunMode::Child,
            RunMode::Launch => engine::RunMode::Launch,
        },
        read_boundary: engine::BoundarySpec::Roots(
            args.read_boundary.iter().map(|r| db::ChunkId::from(r.as_str())).collect(),
        ),
        write_boundary: engine::BoundarySpec::Roots(
            args.write_boundary.iter().map(|r| db::ChunkId::from(r.as_str())).collect(),
        ),
        timeout_ms: args.timeout_ms,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn includes_default_to_content_depth_with_body_toggle() {
        let default = protocol_includes(None);
        assert!(default.chunk_name && default.chunk_spec && default.chunk_body);
        assert!(default.chunk_placements && default.intersection_chunks && default.dimensions);
        assert!(!default.edges && !default.rank && !default.snippet);

        let survey = protocol_includes(Some(&Includes { body: Some(false) }));
        assert!(!survey.chunk_body);
        assert!(survey.chunk_name, "survey keeps names");
    }

    #[test]
    fn scope_opts_map_field_for_field() {
        let opts = ScopeOpts {
            branch: Some("work".into()),
            at: Some("commit_9".into()),
            match_: Some("session".into()),
            exclude: Some(vec!["hidden".into()]),
            limit: Some(5),
            offset: Some(2),
            include: None,
        };
        let mapped = scope_opts(&opts);
        assert_eq!(mapped.branch.as_str(), "work");
        assert_eq!(mapped.at.as_ref().map(|c| c.as_str()), Some("commit_9"));
        assert_eq!(mapped.match_.as_deref(), Some("session"));
        assert_eq!(mapped.exclude, vec![db::ChunkId::from("hidden")]);
        assert_eq!((mapped.limit, mapped.offset), (Some(5), Some(2)));
    }

    #[test]
    fn absent_branch_defaults_to_main() {
        assert_eq!(scope_opts(&ScopeOpts::default()).branch.as_str(), "main");
        assert_eq!(read_opts(&ReadOpts::default()).branch.as_str(), "main");
    }

    #[test]
    fn every_engine_wire_code_maps_to_a_protocol_code() {
        let cases = [
            (engine::EngineError::BoundaryViolation("x".into()), ErrorCode::BoundaryViolation),
            (engine::EngineError::ReadOnlyMount("x".into()), ErrorCode::ReadOnlyMount),
            (engine::EngineError::ValidationError("x".into()), ErrorCode::ValidationError),
            (engine::EngineError::NotFound("x".into()), ErrorCode::NotFound),
            (engine::EngineError::RunFailed("x".into()), ErrorCode::RunFailed),
            (engine::EngineError::InvalidRequest("x".into()), ErrorCode::InvalidRequest),
            (engine::EngineError::TransportClosed, ErrorCode::TransportClosed),
            (engine::EngineError::Db("io".into()), ErrorCode::InvalidRequest),
        ];
        for (engine_error, expected) in cases {
            assert_eq!(error(engine_error).code, expected);
        }
    }
}
