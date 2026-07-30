//! Fixture-adapter harness for `engine/fixtures/` — binds the language-neutral
//! boundary/federation cases to the engine's real ops and wire codes. Same
//! adapter pattern as `db/tests/fixtures.rs`; format deltas documented in
//! `engine/fixtures/README.md`.

mod common;

use common::*;
use db::{ChunkDeclaration, ChunkId, Declaration, Includes, PlacementSpec, PlacementType, ScopeOpts, Spec};
use engine::{Context, EngineError, ProcessId};
use serde::Deserialize;
use serde_json::Value;
use std::collections::BTreeSet;
use std::path::PathBuf;

#[derive(Deserialize)]
struct Case {
    case: String,
    #[allow(dead_code)]
    spec: String,
    #[serde(default)]
    mounts: Option<serde_json::Map<String, Value>>,
    #[serde(default)]
    given: Vec<Value>,
    #[serde(default)]
    process: Option<ProcessSpec>,
    when: Value,
    then: Then,
}

#[derive(Deserialize)]
struct ProcessSpec {
    #[serde(default)]
    read: Vec<String>,
    #[serde(default)]
    write: Vec<String>,
}

#[derive(Deserialize)]
struct Then {
    #[serde(default)]
    rejected: Option<bool>,
    #[serde(default)]
    code: Option<String>,
    #[serde(default)]
    result: Option<Expect>,
    #[serde(default)]
    reads: Option<Vec<ReadSpec>>,
}

#[derive(Deserialize)]
struct ReadSpec {
    scope: Vec<String>,
    expect: Expect,
}

#[derive(Deserialize, Default)]
struct Expect {
    #[serde(default)]
    contains: Option<Vec<String>>,
    #[serde(default)]
    excludes: Option<Vec<String>>,
    #[serde(default)]
    ids: Option<Vec<String>>,
    #[serde(default)]
    counts: Option<Counts>,
    #[serde(default)]
    null: Option<bool>,
    #[serde(default)]
    id: Option<String>,
}

#[derive(Deserialize)]
struct Counts {
    #[serde(default)]
    total: Option<u64>,
}

struct Acting {
    pid: ProcessId,
    read_boundary: ChunkId,
    write_boundary: ChunkId,
}

fn run_file(file: &str) {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("fixtures")
        .join(file);
    let raw = std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("read {path:?}: {e}"));
    let cases: Vec<Case> =
        serde_json::from_str(&raw).unwrap_or_else(|e| panic!("parse {file}: {e}"));
    let mut failures = Vec::new();
    for case in &cases {
        if let Err(e) = run_case(case) {
            failures.push(format!("  {} — {e}", case.case));
        }
    }
    assert!(
        failures.is_empty(),
        "{}/{} cases failed in {file}:\n{}",
        failures.len(),
        cases.len(),
        failures.join("\n")
    );
    eprintln!("{file}: {} cases passed", cases.len());
}

fn run_case(case: &Case) -> Result<(), String> {
    let peers: Vec<(&str, Vec<Declaration>)> = case
        .mounts
        .iter()
        .flat_map(|m| m.iter())
        .map(|(name, steps)| {
            let declarations = steps
                .as_array()
                .ok_or(format!("mount {name} must hold declarations"))?
                .iter()
                .map(|step| to_declaration(step, None))
                .collect::<Result<Vec<_>, String>>()?;
            Ok((name.as_str(), declarations))
        })
        .collect::<Result<Vec<_>, String>>()?;

    let field = field_with(FakeRuntime::ready(), &[], &peers);
    let host = Context::host();

    for (i, step) in case.given.iter().enumerate() {
        let declaration = to_declaration(step, None)?;
        field
            .engine
            .commit(&host, declaration)
            .map_err(|e| format!("given[{i}] failed: {e}"))?;
    }

    let acting = match &case.process {
        Some(spec) => Some(create_process(&field, spec)?),
        None => None,
    };
    let ctx = acting
        .as_ref()
        .map(|a| Context::process(a.pid.clone()))
        .unwrap_or_else(Context::host);

    let outcome = execute_when(&field, &ctx, &case.when, acting.as_ref())?;
    check_then(&field, case, acting.as_ref(), outcome)
}

/// The acting identity: a trivial program run host-initiated with the given
/// run-level boundaries; boundary chunk ids recovered from the process scope.
fn create_process(field: &TestField, spec: &ProcessSpec) -> Result<Acting, String> {
    field
        .engine
        .commit(&Context::host(), decl(vec![program("fixture-prog")], vec![]))
        .map_err(|e| format!("program seed: {e}"))?;
    let read: Vec<&str> = spec.read.iter().map(String::as_str).collect();
    let write: Vec<&str> = spec.write.iter().map(String::as_str).collect();
    let pid = field
        .engine
        .run(&Context::host(), run_args("fixture-prog", &read, &write))
        .map_err(|e| format!("acting run: {e}"))?;

    let opts = ScopeOpts {
        include: Includes {
            intersection_chunks: true,
            chunk_placements: true,
            ..Includes::default()
        },
        ..ScopeOpts::default()
    };
    let on_process = field
        .engine
        .scope(&Context::host(), std::slice::from_ref(&pid), opts)
        .map_err(|e| format!("process scope: {e}"))?;
    let boundary_of = |archetype: &str| -> Result<ChunkId, String> {
        on_process
            .chunks
            .iter()
            .find(|c| {
                c.placements.as_ref().is_some_and(|ps| {
                    ps.iter().any(|p| {
                        p.type_ == PlacementType::Instance && p.scope_id.as_str() == archetype
                    })
                })
            })
            .map(|c| c.id.clone())
            .ok_or(format!("no {archetype} chunk on process"))
    };
    Ok(Acting {
        pid,
        read_boundary: boundary_of("engine/read-boundary")?,
        write_boundary: boundary_of("engine/write-boundary")?,
    })
}

fn substitute(id: &str, acting: Option<&Acting>) -> String {
    let Some(acting) = acting else {
        return id.to_string();
    };
    match id {
        "$process" => acting.pid.as_str().to_string(),
        "$read_boundary" => acting.read_boundary.as_str().to_string(),
        "$write_boundary" => acting.write_boundary.as_str().to_string(),
        other => other.to_string(),
    }
}

enum Outcome {
    Committed,
    Scope(db::ScopeResult),
    Get(Option<db::ChunkItem>),
    Rejected(EngineError),
}

fn execute_when(
    field: &TestField,
    ctx: &Context,
    when: &Value,
    acting: Option<&Acting>,
) -> Result<Outcome, String> {
    match when.get("op").and_then(Value::as_str) {
        Some("scope") => {
            let scopes: Vec<ChunkId> = ids_of(when.get("scopes"), acting)?;
            let exclude: Vec<ChunkId> = match when.get("exclude") {
                Some(v) => ids_of(Some(v), acting)?,
                None => Vec::new(),
            };
            let opts = ScopeOpts {
                match_: when.get("fts").and_then(Value::as_str).map(str::to_string),
                exclude,
                limit: when.get("limit").and_then(Value::as_u64).map(|v| v as usize),
                offset: when.get("offset").and_then(Value::as_u64).map(|v| v as usize),
                include: Includes {
                    intersection_chunks: true,
                    chunk_name: true,
                    chunk_body: true,
                    chunk_placements: true,
                    ..Includes::default()
                },
                ..ScopeOpts::default()
            };
            Ok(match field.engine.scope(ctx, &scopes, opts) {
                Ok(result) => Outcome::Scope(result),
                Err(e) => Outcome::Rejected(e),
            })
        }
        Some("get") => {
            let id = when
                .get("chunk")
                .and_then(Value::as_str)
                .ok_or("get needs chunk")?;
            let chunk_id = ChunkId::from(substitute(id, acting).as_str());
            let opts = db::ReadOpts {
                include: Includes {
                    chunk_name: true,
                    chunk_body: true,
                    chunk_placements: true,
                    ..Includes::default()
                },
                ..db::ReadOpts::default()
            };
            Ok(match field.engine.get(ctx, &chunk_id, opts) {
                Ok(item) => Outcome::Get(item),
                Err(e) => Outcome::Rejected(e),
            })
        }
        Some(other) => Err(format!("unknown op {other}")),
        None => {
            let declaration = to_declaration(when, acting)?;
            Ok(match field.engine.commit(ctx, declaration) {
                Ok(_) => Outcome::Committed,
                Err(e) => Outcome::Rejected(e),
            })
        }
    }
}

fn check_then(
    field: &TestField,
    case: &Case,
    acting: Option<&Acting>,
    outcome: Outcome,
) -> Result<(), String> {
    if case.then.rejected == Some(true) {
        let Outcome::Rejected(error) = outcome else {
            return Err("expected rejection, but the op succeeded".to_string());
        };
        if let Some(code) = &case.then.code {
            if error.wire_code() != code {
                return Err(format!("expected {code}, got {} ({error})", error.wire_code()));
            }
        }
        return check_atomic(field, case, acting);
    }
    if let Some(expect) = &case.then.result {
        return match outcome {
            Outcome::Scope(result) => check_expect(expect, &result),
            Outcome::Get(item) => check_get(expect, item),
            Outcome::Committed => Err("expected an op result, got a commit".to_string()),
            Outcome::Rejected(e) => Err(format!("op rejected: {e}")),
        };
    }
    if let Some(reads) = &case.then.reads {
        if let Outcome::Rejected(e) = outcome {
            return Err(format!("when was rejected: {e}"));
        }
        for (i, read) in reads.iter().enumerate() {
            let scopes: Vec<ChunkId> = read
                .scope
                .iter()
                .map(|s| ChunkId::from(substitute(s, acting).as_str()))
                .collect();
            let opts = ScopeOpts {
                include: Includes {
                    intersection_chunks: true,
                    chunk_name: true,
                    chunk_body: true,
                    ..Includes::default()
                },
                ..ScopeOpts::default()
            };
            let result = field
                .engine
                .scope(&Context::host(), &scopes, opts)
                .map_err(|e| format!("reads[{i}]: {e}"))?;
            check_expect(&read.expect, &result).map_err(|e| format!("reads[{i}]: {e}"))?;
        }
        return Ok(());
    }
    Err("case has no expectation".to_string())
}

/// A rejected commit must be atomic: nothing from `when` readable afterward.
fn check_atomic(field: &TestField, case: &Case, acting: Option<&Acting>) -> Result<(), String> {
    if case.when.get("op").is_some() {
        return Ok(()); // reads have no side effects to verify
    }
    // Placeholder ids ($process, $read_boundary, ...) pre-exist by construction.
    let placeholder_ids: BTreeSet<String> = case
        .when
        .get("chunks")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(|c| c.get("id").and_then(Value::as_str))
        .filter(|id| id.starts_with('$'))
        .map(|id| substitute(id, acting))
        .collect();
    let declaration = to_declaration(&case.when, acting)?;
    let given_chunks: BTreeSet<String> = case
        .given
        .iter()
        .chain(case.mounts.iter().flat_map(|m| m.values()).flat_map(|v| v.as_array().into_iter().flatten()))
        .flat_map(|step| {
            step.get("chunks")
                .and_then(Value::as_array)
                .into_iter()
                .flatten()
                .filter_map(|c| c.get("id").and_then(Value::as_str).map(str::to_string))
                .collect::<Vec<_>>()
        })
        .collect();
    for chunk in &declaration.chunks {
        let Some(id) = &chunk.id else { continue };
        if given_chunks.contains(id.as_str()) || placeholder_ids.contains(id.as_str()) {
            continue;
        }
        let present = field
            .engine
            .get(&Context::host(), id, db::ReadOpts::default())
            .map_err(|e| e.to_string())?
            .is_some();
        if present {
            return Err(format!("chunk {id} readable after rejection"));
        }
    }
    Ok(())
}

fn check_expect(expect: &Expect, result: &db::ScopeResult) -> Result<(), String> {
    let got: Vec<&str> = result.chunks.iter().map(|c| c.id.as_str()).collect();
    for id in expect.contains.iter().flatten() {
        if !got.contains(&id.as_str()) {
            return Err(format!("missing {id}; got {got:?}"));
        }
    }
    for id in expect.excludes.iter().flatten() {
        if got.contains(&id.as_str()) {
            return Err(format!("must not contain {id}; got {got:?}"));
        }
    }
    if let Some(ids) = &expect.ids {
        let want: BTreeSet<&str> = ids.iter().map(String::as_str).collect();
        let have: BTreeSet<&str> = got.iter().copied().collect();
        if want != have {
            return Err(format!("expected exactly {want:?}; got {have:?}"));
        }
    }
    if let Some(counts) = &expect.counts {
        if let Some(total) = counts.total {
            if result.in_scope != total {
                return Err(format!("expected count {total}; got {}", result.in_scope));
            }
        }
    }
    Ok(())
}

fn check_get(expect: &Expect, item: Option<db::ChunkItem>) -> Result<(), String> {
    if expect.null == Some(true) {
        return match item {
            None => Ok(()),
            Some(item) => Err(format!("expected null, got {}", item.id)),
        };
    }
    let item = item.ok_or("expected a chunk, got null")?;
    if let Some(id) = &expect.id {
        if item.id.as_str() != id {
            return Err(format!("expected {id}, got {}", item.id));
        }
    }
    Ok(())
}

fn ids_of(value: Option<&Value>, acting: Option<&Acting>) -> Result<Vec<ChunkId>, String> {
    value
        .and_then(Value::as_array)
        .ok_or("expected id array".to_string())?
        .iter()
        .map(|v| {
            v.as_str()
                .map(|s| ChunkId::from(substitute(s, acting).as_str()))
                .ok_or("ids must be strings".to_string())
        })
        .collect()
}

fn to_declaration(step: &Value, acting: Option<&Acting>) -> Result<Declaration, String> {
    let mut chunks: Vec<ChunkDeclaration> = step
        .get("chunks")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .map(|c| {
            let id = c
                .get("id")
                .and_then(Value::as_str)
                .ok_or("chunk needs id")?;
            let spec: Option<Spec> = match c.get("spec") {
                Some(s) => {
                    Some(serde_json::from_value(s.clone()).map_err(|e| format!("spec: {e}"))?)
                }
                None => None,
            };
            Ok(ChunkDeclaration {
                id: Some(ChunkId::from(substitute(id, acting).as_str())),
                name: c.get("name").and_then(Value::as_str).map(str::to_string),
                spec,
                body: c.get("body").cloned(),
                removed: false,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;
    if let Some(remove) = step.pointer("/remove/chunks").and_then(Value::as_array) {
        for id in remove {
            let id = id.as_str().ok_or("remove ids must be strings")?;
            chunks.push(ChunkDeclaration {
                id: Some(ChunkId::from(substitute(id, acting).as_str())),
                removed: true,
                ..ChunkDeclaration::default()
            });
        }
    }
    let placements: Vec<PlacementSpec> = step
        .get("placements")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .map(|p| {
            let field = |key: &str| {
                p.get(key)
                    .and_then(Value::as_str)
                    .ok_or(format!("placement needs {key}"))
            };
            let type_ = PlacementType::parse(field("type")?).ok_or("bad placement type")?;
            Ok(PlacementSpec {
                chunk: ChunkId::from(substitute(field("chunk")?, acting).as_str()),
                scope: ChunkId::from(substitute(field("scope")?, acting).as_str()),
                type_,
                seq: p.get("seq").and_then(Value::as_i64),
                active: p.get("active").and_then(Value::as_bool).unwrap_or(true),
            })
        })
        .collect::<Result<Vec<_>, String>>()?;
    Ok(Declaration {
        chunks,
        placements,
        message: None,
    })
}

#[tokio::test]
async fn boundary() {
    run_file("boundary.json");
}

#[tokio::test]
async fn federation() {
    run_file("federation.json");
}
