//! FixtureStub — an in-process stand-in for the engine, pure over its
//! fixture data. Implements the specced read ops (`scope`, `get`,
//! `subscribe`/`unsubscribe`) per `spec/substrate.md` §Queries/Scoping and
//! `spec/engine.md` §The Program Protocol; result shapes mirror
//! `spec/sdk.md` §Types. Ops that need the real engine (writes, runs)
//! answer with an explicit error rather than pretending. Boundary
//! enforcement is engine work — the stub treats every read as in-boundary.

use std::collections::HashSet;
use std::sync::Mutex;

use serde::Serialize;
use serde_json::Value;

use crate::dispatch::{BoxFuture, Context, EngineApi};
use crate::field::{Chunk, Placement, PlacementType};
use crate::protocol::{AwaitOpts, EngineError, ErrorCode, ReadOpts, RunArgs, ScopeOpts, TaggedRead};

/// The one branch the fixture field stands on — db's default branch name.
pub const FIXTURE_BRANCH: &str = "main";

// --- Wire result mirrors (sdk.md §Types) -------------------------------------

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct ScopeResult {
    pub head: String,
    pub total: usize,
    pub in_scope: usize,
    pub in_scope_instance: usize,
    pub in_scope_relates: usize,
    pub chunks: Vec<ChunkItem>,
    pub dimensions: Vec<Value>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct ChunkItem {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spec: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<Value>,
    pub placements: Vec<WirePlacement>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct WirePlacement {
    pub scope_id: String,
    pub type_: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seq: Option<i64>,
}

// --- The stub -----------------------------------------------------------------

pub struct FixtureStub {
    chunks: Vec<Chunk>,
    placements: Vec<Placement>,
    head: String,
    subscriptions: Mutex<Subscriptions>,
}

struct Subscriptions {
    next: u64,
    active: HashSet<String>,
}

impl FixtureStub {
    pub fn new(chunks: Vec<Chunk>, placements: Vec<Placement>) -> Self {
        FixtureStub {
            chunks,
            placements,
            head: "fixture-head".into(),
            subscriptions: Mutex::new(Subscriptions { next: 0, active: HashSet::new() }),
        }
    }

    fn placed_on(&self, scope: &str) -> HashSet<&str> {
        self.placements
            .iter()
            .filter(|p| p.scope == scope)
            .map(|p| p.chunk.as_str())
            .collect()
    }

    fn placement_of(&self, chunk: &str, scope: &str) -> Option<&Placement> {
        self.placements.iter().find(|p| p.chunk == chunk && p.scope == scope)
    }

    fn item(&self, chunk: &Chunk, with_body: bool) -> ChunkItem {
        ChunkItem {
            id: chunk.id.clone(),
            name: chunk.name.clone(),
            spec: chunk.spec.clone(),
            body: if with_body { chunk.body.clone() } else { None },
            placements: self
                .placements
                .iter()
                .filter(|p| p.chunk == chunk.id)
                .map(|p| WirePlacement {
                    scope_id: p.scope.clone(),
                    type_: match p.type_ {
                        PlacementType::Instance => "instance",
                        PlacementType::Relates => "relates",
                    },
                    seq: p.seq,
                })
                .collect(),
        }
    }

    /// substrate.md §Scope: everything placed on every one of the given
    /// scopes; empty scope list with `match_` is whole-field FTS (engine.md).
    pub fn scope_result(&self, scopes: &[String], opts: &ScopeOpts) -> ScopeResult {
        let mut ids: Vec<&str> = match scopes.split_first() {
            None if opts.match_.is_some() => self.chunks.iter().map(|c| c.id.as_str()).collect(),
            None => vec![],
            Some((first, rest)) => {
                let mut set = self.placed_on(first);
                for scope in rest {
                    set = set.intersection(&self.placed_on(scope)).copied().collect();
                }
                set.into_iter().collect()
            }
        };

        // Negation: set difference (substrate.md §Negation).
        if let Some(exclude) = &opts.exclude {
            let excluded: HashSet<&str> =
                exclude.iter().flat_map(|scope| self.placed_on(scope)).collect();
            ids.retain(|id| !excluded.contains(id));
        }

        // match_: naive substring over names and body strings — the stub's
        // stand-in for FTS (substrate.md: index covers names + body strings).
        if let Some(term) = &opts.match_ {
            let term = term.to_lowercase();
            ids.retain(|id| self.chunk_matches(id, &term));
        }

        // Order by seq on the first scope root, then id — deterministic.
        let first_scope = scopes.first().map(String::as_str);
        ids.sort_by_key(|id| {
            let seq = first_scope
                .and_then(|scope| self.placement_of(id, scope))
                .and_then(|p| p.seq)
                .unwrap_or(i64::MAX);
            (seq, id.to_string())
        });

        // Counts describe the full set regardless of pagination (substrate.md).
        let in_scope = ids.len();
        let by_type = |wanted: PlacementType| {
            first_scope.map_or(0, |scope| {
                ids.iter()
                    .filter(|id| {
                        self.placement_of(id, scope).is_some_and(|p| p.type_ == wanted)
                    })
                    .count()
            })
        };
        let in_scope_instance = by_type(PlacementType::Instance);
        let in_scope_relates = by_type(PlacementType::Relates);

        // Pagination: tail-first window, offset pages backward (substrate.md).
        if let Some(limit) = opts.limit {
            let end = ids.len().saturating_sub(opts.offset.unwrap_or(0));
            let start = end.saturating_sub(limit);
            ids = ids[start..end].to_vec();
        }

        let with_body = opts.include.as_ref().and_then(|i| i.body) != Some(false);
        let chunks = ids
            .iter()
            .filter_map(|id| self.chunks.iter().find(|c| c.id == *id))
            .map(|c| self.item(c, with_body))
            .collect();

        ScopeResult {
            head: self.head.clone(),
            // No boundary filtering in the stub, so total == in_scope.
            total: in_scope,
            in_scope,
            in_scope_instance,
            in_scope_relates,
            chunks,
            dimensions: vec![],
        }
    }

    fn chunk_matches(&self, id: &str, term: &str) -> bool {
        let Some(chunk) = self.chunks.iter().find(|c| c.id == id) else { return false };
        let name_hit = chunk.name.as_deref().is_some_and(|n| n.to_lowercase().contains(term));
        name_hit || chunk.body.as_ref().is_some_and(|body| body_strings_match(body, term))
    }

    fn unavailable(op: &str) -> EngineError {
        EngineError::new(
            ErrorCode::InvalidRequest,
            format!("fixture stub: '{op}' needs the real engine — not available in the hollow host"),
        )
    }

    /// The fixture field is a single snapshot on a single branch; history and
    /// branch selection need the real substrate. Refuse rather than answer
    /// the wrong snapshot silently.
    fn snapshot(branch: Option<&str>, at: Option<&str>) -> Result<(), EngineError> {
        if let Some(at) = at {
            return Err(EngineError::new(
                ErrorCode::InvalidRequest,
                format!("fixture stub: reading at commit '{at}' needs the real engine"),
            ));
        }
        match branch {
            None => Ok(()),
            Some(FIXTURE_BRANCH) => Ok(()),
            Some(other) => Err(EngineError::new(
                ErrorCode::InvalidRequest,
                format!("fixture stub: branch '{other}' needs the real engine — the fixture field is on '{FIXTURE_BRANCH}'"),
            )),
        }
    }
}

fn body_strings_match(value: &Value, term: &str) -> bool {
    match value {
        Value::String(s) => s.to_lowercase().contains(term),
        Value::Array(items) => items.iter().any(|v| body_strings_match(v, term)),
        Value::Object(map) => map.values().any(|v| body_strings_match(v, term)),
        _ => false,
    }
}

impl EngineApi for FixtureStub {
    fn scope(&self, _ctx: &Context, scopes: &[String], opts: &ScopeOpts) -> Result<Value, EngineError> {
        Self::snapshot(opts.branch.as_deref(), opts.at.as_deref())?;
        Ok(serde_json::to_value(self.scope_result(scopes, opts)).expect("scope result serializes"))
    }

    /// engine.md: returns `null` if the chunk does not exist.
    fn get(&self, _ctx: &Context, chunk_id: &str, opts: &ReadOpts) -> Result<Value, EngineError> {
        Self::snapshot(opts.branch.as_deref(), opts.at.as_deref())?;
        let with_body = opts.include.as_ref().and_then(|i| i.body) != Some(false);
        match self.chunks.iter().find(|c| c.id == chunk_id) {
            Some(chunk) => Ok(serde_json::to_value(self.item(chunk, with_body))
                .expect("chunk item serializes")),
            None => Ok(Value::Null),
        }
    }

    fn read_batch(&self, _ctx: &Context, _reads: &[TaggedRead]) -> Result<Value, EngineError> {
        Err(Self::unavailable("read_batch"))
    }

    fn commit(&self, _ctx: &Context, _declaration: &Value, _dry_run: bool) -> Result<Value, EngineError> {
        Err(Self::unavailable("commit"))
    }

    fn run(&self, _ctx: &Context, _program: &str, _args: &RunArgs) -> Result<Value, EngineError> {
        Err(Self::unavailable("run"))
    }

    /// The one suspending op on the seam — the stub has no processes to wait
    /// on, so its future is ready immediately.
    fn await_processes<'a>(
        &'a self,
        _ctx: &'a Context,
        _processes: &'a [String],
        _opts: &'a AwaitOpts,
    ) -> BoxFuture<'a, Result<Value, EngineError>> {
        Box::pin(std::future::ready(Err(Self::unavailable("await"))))
    }

    fn cancel(&self, _ctx: &Context, _process: &str) -> Result<Value, EngineError> {
        Err(Self::unavailable("cancel"))
    }

    fn exit(&self, _ctx: &Context) -> Result<Value, EngineError> {
        Err(Self::unavailable("exit"))
    }

    fn subscribe(&self, _ctx: &Context, scopes: &[String]) -> Result<Value, EngineError> {
        for scope in scopes {
            if !self.chunks.iter().any(|c| c.id == *scope) {
                return Err(EngineError::new(
                    ErrorCode::NotFound,
                    format!("scope '{scope}' does not exist"),
                ));
            }
        }
        let mut subs = self.subscriptions.lock().expect("subscriptions lock");
        subs.next += 1;
        let id = format!("sub_{}", subs.next);
        subs.active.insert(id.clone());
        Ok(serde_json::json!({ "subscriptionId": id }))
    }

    /// engine.md: unsubscribing an unknown id is a no-op (idempotent).
    fn unsubscribe(&self, _ctx: &Context, subscription_id: &str) -> Result<Value, EngineError> {
        self.subscriptions.lock().expect("subscriptions lock").active.remove(subscription_id);
        Ok(serde_json::json!({}))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::field;
    use crate::protocol::RunMode;

    fn stub() -> FixtureStub {
        let (chunks, placements) = field::demo();
        FixtureStub::new(chunks, placements)
    }

    fn ctx() -> Context {
        Context { process_id: Some("proc-read-tile-1".into()) }
    }

    fn ids(result: &ScopeResult) -> Vec<&str> {
        result.chunks.iter().map(|c| c.id.as_str()).collect()
    }

    #[test]
    fn scope_returns_everything_placed_on_the_root() {
        // demo-session holds the tab and the three processes.
        let result = stub().scope_result(&[field::DEMO_SESSION.into()], &ScopeOpts::default());
        let got = ids(&result);
        for expected in ["tab-main", "proc-read-tile-1", "proc-sidebar-1", "proc-inspector-1"] {
            assert!(got.contains(&expected), "missing {expected} in {got:?}");
        }
        assert_eq!(result.in_scope, 4);
        assert_eq!(result.total, 4);
        assert_eq!(result.head, "fixture-head");
    }

    #[test]
    fn scope_intersection_narrows() {
        // "Add a scope to narrow" — session ∩ program = that program's runs.
        let result = stub().scope_result(
            &[field::DEMO_SESSION.into(), "prog-read-tile".into()],
            &ScopeOpts::default(),
        );
        assert_eq!(ids(&result), ["proc-read-tile-1"]);
    }

    #[test]
    fn scope_exclude_subtracts() {
        // Everything on the session except read-tile's runs.
        let opts = ScopeOpts { exclude: Some(vec!["prog-read-tile".into()]), ..Default::default() };
        let result = stub().scope_result(&[field::DEMO_SESSION.into()], &opts);
        assert!(!ids(&result).contains(&"proc-read-tile-1"));
        assert_eq!(result.in_scope, 3);
    }

    #[test]
    fn empty_scopes_with_match_is_whole_field_fts() {
        let opts = ScopeOpts { match_: Some("inspector".into()), ..Default::default() };
        let result = stub().scope_result(&[], &opts);
        assert_eq!(ids(&result), ["prog-inspector"]);
    }

    #[test]
    fn empty_scopes_without_match_is_empty() {
        let result = stub().scope_result(&[], &ScopeOpts::default());
        assert_eq!(result.in_scope, 0);
        assert!(result.chunks.is_empty());
    }

    #[test]
    fn ordered_children_come_back_in_seq_order() {
        let result = stub().scope_result(&["tile-root".into()], &ScopeOpts::default());
        assert_eq!(ids(&result), ["tile-reader", "tile-right"]);
    }

    #[test]
    fn limit_windows_tail_first() {
        // substrate.md §Pagination: default window is tail-first; counts
        // still describe the full set.
        let opts = ScopeOpts { limit: Some(1), ..Default::default() };
        let result = stub().scope_result(&["tile-root".into()], &opts);
        assert_eq!(ids(&result), ["tile-right"]);
        assert_eq!(result.in_scope, 2);
        assert_eq!(result.total, 2);

        let opts = ScopeOpts { limit: Some(1), offset: Some(1), ..Default::default() };
        let result = stub().scope_result(&["tile-root".into()], &opts);
        assert_eq!(ids(&result), ["tile-reader"], "offset pages backward from the tail");
    }

    #[test]
    fn include_body_false_is_a_survey_read() {
        // substrate.md §Pagination and projection: names, specs, placements,
        // counts — no bodies.
        let opts = ScopeOpts {
            include: Some(crate::protocol::Includes { body: Some(false) }),
            ..Default::default()
        };
        let result = stub().scope_result(&[field::DEMO_SESSION.into()], &opts);
        assert!(result.chunks.iter().all(|c| c.body.is_none()));
        assert!(!result.chunks.is_empty());
    }

    #[test]
    fn chunk_items_carry_their_placements() {
        let result = stub().scope_result(
            &[field::DEMO_SESSION.into(), "prog-read-tile".into()],
            &ScopeOpts::default(),
        );
        let placements = &result.chunks[0].placements;
        assert!(placements
            .iter()
            .any(|p| p.scope_id == field::ENGINE_PROCESS && p.type_ == "instance"));
    }

    #[test]
    fn instance_and_relates_counted_apart() {
        // proc-read-tile-1 holds tile-reader (relates) and nothing instance.
        let result = stub().scope_result(&["proc-read-tile-1".into()], &ScopeOpts::default());
        assert_eq!(result.in_scope_instance, 0);
        assert_eq!(result.in_scope_relates, 1);
        assert_eq!(ids(&result), ["tile-reader"]);
    }

    #[test]
    fn get_returns_the_chunk_or_null() {
        let stub = stub();
        let found = stub.get(&ctx(), "prog-sidebar", &ReadOpts::default()).unwrap();
        assert_eq!(found["name"], "sidebar");
        assert_eq!(found["body"]["runtime"], "webview");
        assert_eq!(stub.get(&ctx(), "ghost", &ReadOpts::default()).unwrap(), Value::Null);
    }

    #[test]
    fn get_honors_include_body_false() {
        let opts = ReadOpts {
            include: Some(crate::protocol::Includes { body: Some(false) }),
            ..Default::default()
        };
        let found = stub().get(&ctx(), "prog-sidebar", &opts).unwrap();
        assert_eq!(found["name"], "sidebar");
        assert!(found.get("body").is_none(), "survey read carries no body");
    }

    #[test]
    fn get_honors_the_fixture_branch_by_name() {
        let opts = ReadOpts { branch: Some(FIXTURE_BRANCH.into()), ..Default::default() };
        assert_eq!(stub().get(&ctx(), "prog-sidebar", &opts).unwrap()["name"], "sidebar");
    }

    /// The fixture field is one snapshot on one branch. Asking for another
    /// commit or another branch is refused, not silently answered from it.
    #[test]
    fn reads_refuse_history_and_other_branches() {
        let stub = stub();
        let at = ReadOpts { at: Some("commit_2".into()), ..Default::default() };
        let other = ReadOpts { branch: Some("work".into()), ..Default::default() };
        for (case, opts) in [("at", at), ("branch", other)] {
            let err = stub.get(&ctx(), "prog-sidebar", &opts).unwrap_err();
            assert_eq!(err.code, ErrorCode::InvalidRequest, "get {case}");
            assert!(err.message.contains("fixture stub"), "get {case}: {}", err.message);
        }
        let scope_at = ScopeOpts { at: Some("commit_2".into()), ..Default::default() };
        let scope_branch = ScopeOpts { branch: Some("work".into()), ..Default::default() };
        for (case, opts) in [("at", scope_at), ("branch", scope_branch)] {
            let err = stub.scope(&ctx(), &[field::DEMO_SESSION.into()], &opts).unwrap_err();
            assert_eq!(err.code, ErrorCode::InvalidRequest, "scope {case}");
        }
    }

    #[test]
    fn subscribe_returns_monotonic_ids_and_unsubscribe_is_idempotent() {
        let stub = stub();
        let first = stub.subscribe(&ctx(), &[field::DEMO_SESSION.into()]).unwrap();
        let second = stub.subscribe(&ctx(), &["tile-root".into()]).unwrap();
        assert_eq!(first["subscriptionId"], "sub_1");
        assert_eq!(second["subscriptionId"], "sub_2");
        assert!(stub.unsubscribe(&ctx(), "sub_1").is_ok());
        assert!(stub.unsubscribe(&ctx(), "sub_1").is_ok(), "unknown id is a no-op");
    }

    #[test]
    fn subscribe_to_missing_scope_is_not_found() {
        let err = stub().subscribe(&ctx(), &["ghost".into()]).unwrap_err();
        assert_eq!(err.code, ErrorCode::NotFound);
    }

    #[tokio::test]
    async fn engine_only_ops_answer_with_an_explicit_error() {
        let stub = stub();
        let run_args = RunArgs {
            mode: RunMode::Launch,
            write_boundary: vec!["w1".into()],
            ..Default::default()
        };
        let cases: Vec<(&str, Result<Value, EngineError>)> = vec![
            ("commit", stub.commit(&ctx(), &Value::Null, false)),
            ("run", stub.run(&ctx(), "echo", &run_args)),
            ("await", stub.await_processes(&ctx(), &[], &AwaitOpts::default()).await),
            ("cancel", stub.cancel(&ctx(), "p_1")),
            ("exit", stub.exit(&ctx())),
            ("read_batch", stub.read_batch(&ctx(), &[])),
        ];
        for (op, result) in cases {
            let err = result.unwrap_err();
            assert_eq!(err.code, ErrorCode::InvalidRequest, "{op}");
            assert!(err.message.contains("fixture stub"), "{op}: {}", err.message);
        }
    }
}
