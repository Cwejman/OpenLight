//! Fixture-adapter harness: loads the language-neutral cases in `db/fixtures/`
//! and runs them against the Db API. The fixtures carry semantics; this file
//! binds them to this crate's real ops and error types.

use db::{
    BranchName, ChunkDeclaration, ChunkId, Commit, CommitId, CommitOpts, Db, Declaration,
    Includes, PlacementSpec, PlacementType, ReadOpts, ScopeOpts, Spec,
};
use serde::Deserialize;
use serde_json::Value;
use std::collections::{BTreeMap, BTreeSet};
use std::path::PathBuf;

#[derive(Deserialize)]
struct Case {
    case: String,
    #[allow(dead_code)]
    spec: String,
    #[serde(default)]
    given: Vec<Step>,
    when: Step,
    then: Then,
}

#[derive(Deserialize, Default)]
#[serde(deny_unknown_fields)]
struct Step {
    #[serde(default)]
    chunks: Vec<FixtureChunk>,
    #[serde(default)]
    placements: Vec<FixturePlacement>,
    #[serde(default)]
    remove: Option<Remove>,
    #[serde(default)]
    branch: Option<String>,
    #[serde(default, rename = "as")]
    label: Option<String>,
    #[serde(default)]
    fork: Option<Fork>,
}

#[derive(Deserialize)]
struct Remove {
    #[serde(default)]
    chunks: Vec<String>,
}

#[derive(Deserialize)]
struct Fork {
    branch: String,
    at: String,
}

#[derive(Deserialize)]
struct FixtureChunk {
    id: String,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    spec: Option<Value>,
    #[serde(default)]
    body: Option<Value>,
}

#[derive(Deserialize)]
struct FixturePlacement {
    chunk: String,
    scope: String,
    #[serde(rename = "type")]
    type_: String,
    #[serde(default)]
    seq: Option<i64>,
}

#[derive(Deserialize)]
struct Then {
    #[serde(default)]
    rejected: Option<bool>,
    #[serde(default)]
    #[allow(dead_code)]
    reason: Option<String>,
    #[serde(default)]
    reads: Option<Vec<ReadSpec>>,
}

#[derive(Deserialize)]
struct ReadSpec {
    #[serde(default)]
    scope: Option<Vec<String>>,
    #[serde(default)]
    fts: Option<String>,
    #[serde(default)]
    exclude: Option<Vec<String>>,
    #[serde(default)]
    limit: Option<usize>,
    #[serde(default)]
    offset: Option<usize>,
    #[serde(default)]
    at: Option<String>,
    #[serde(default)]
    branch: Option<String>,
    #[serde(default)]
    include: Option<IncludeSpec>,
    expect: Expect,
}

#[derive(Deserialize)]
struct IncludeSpec {
    #[serde(default = "default_true")]
    body: bool,
}

fn default_true() -> bool {
    true
}

#[derive(Deserialize)]
struct Expect {
    #[serde(default)]
    contains: Option<Vec<String>>,
    #[serde(default)]
    excludes: Option<Vec<String>>,
    #[serde(default)]
    ids: Option<Vec<String>>,
    #[serde(default)]
    ordered_ids: Option<Vec<String>>,
    #[serde(default)]
    counts: Option<Counts>,
    #[serde(default)]
    has_body: Option<bool>,
    #[serde(default)]
    unresolved: Option<Vec<String>>,
}

#[derive(Deserialize)]
struct Counts {
    #[serde(default)]
    total: Option<u64>,
}

fn run_file(file: &str) {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("fixtures")
        .join(file);
    let raw = std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("read {path:?}: {e}"));
    let cases: Vec<Case> = serde_json::from_str(&raw).unwrap_or_else(|e| panic!("parse {file}: {e}"));
    let failures: Vec<String> = cases
        .iter()
        .filter_map(|case| run_case(case).err().map(|e| format!("  {} — {e}", case.case)))
        .collect();
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
    let dir = std::env::temp_dir()
        .join("ol-db-fixtures")
        .join(ulid_like());
    let db = Db::open(&dir).map_err(|e| format!("open: {e}"))?;
    let mut labels: BTreeMap<String, CommitId> = BTreeMap::new();

    for (i, step) in case.given.iter().enumerate() {
        apply_step(&db, step, &mut labels).map_err(|e| format!("given[{i}] failed: {e}"))?;
    }

    let outcome = apply_step(&db, &case.when, &mut labels);
    let result = match (case.then.rejected, &case.then.reads) {
        (Some(true), _) => check_rejected(&db, case, outcome),
        (_, Some(reads)) => match outcome {
            Err(e) => Err(format!("when was rejected: {e}")),
            Ok(_) => reads
                .iter()
                .enumerate()
                .try_for_each(|(i, read)| check_read(&db, read, &labels).map_err(|e| format!("reads[{i}]: {e}"))),
        },
        _ => Err("case has neither rejected nor reads expectation".to_string()),
    };

    drop(db);
    let _ = std::fs::remove_dir_all(&dir);
    result
}

fn apply_step(
    db: &Db,
    step: &Step,
    labels: &mut BTreeMap<String, CommitId>,
) -> Result<Option<Commit>, String> {
    if let Some(fork) = &step.fork {
        let at = labels
            .get(&fork.at)
            .ok_or(format!("unknown commit label {}", fork.at))?;
        db.create_branch(&fork.branch, at.clone())
            .map_err(|e| format!("fork: {e}"))?;
        return Ok(None);
    }
    let declaration = to_declaration(step)?;
    let opts = CommitOpts {
        branch: branch_of(&step.branch),
        process_id: None,
    };
    let commit = db.commit(&declaration, opts).map_err(|e| e.to_string())?;
    if let Some(label) = &step.label {
        labels.insert(label.clone(), commit.id.clone());
    }
    Ok(Some(commit))
}

fn to_declaration(step: &Step) -> Result<Declaration, String> {
    let mut chunks: Vec<ChunkDeclaration> = step
        .chunks
        .iter()
        .map(|c| {
            let spec: Option<Spec> = match &c.spec {
                Some(v) => Some(
                    serde_json::from_value(v.clone()).map_err(|e| format!("spec of {}: {e}", c.id))?,
                ),
                None => None,
            };
            Ok(ChunkDeclaration {
                id: Some(ChunkId::from(c.id.as_str())),
                name: c.name.clone(),
                spec,
                body: c.body.clone(),
                removed: false,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;
    if let Some(remove) = &step.remove {
        chunks.extend(remove.chunks.iter().map(|id| ChunkDeclaration {
            id: Some(ChunkId::from(id.as_str())),
            removed: true,
            ..ChunkDeclaration::default()
        }));
    }
    let placements = step
        .placements
        .iter()
        .map(|p| {
            let type_ = PlacementType::parse(&p.type_).ok_or(format!("bad type {}", p.type_))?;
            Ok(PlacementSpec {
                chunk: ChunkId::from(p.chunk.as_str()),
                scope: ChunkId::from(p.scope.as_str()),
                type_,
                seq: p.seq,
                active: true,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;
    Ok(Declaration {
        chunks,
        placements,
        message: None,
    })
}

/// The declaration must fail atomically: nothing from it readable afterward.
fn check_rejected(
    db: &Db,
    case: &Case,
    outcome: Result<Option<Commit>, String>,
) -> Result<(), String> {
    if outcome.is_ok() {
        return Err("expected rejection, but the commit succeeded".to_string());
    }
    let branch = branch_of(&case.when.branch);
    let given_chunks: BTreeSet<&str> = case
        .given
        .iter()
        .flat_map(|s| s.chunks.iter().map(|c| c.id.as_str()))
        .collect();
    let given_placements: BTreeSet<(&str, &str)> = case
        .given
        .iter()
        .flat_map(|s| s.placements.iter().map(|p| (p.chunk.as_str(), p.scope.as_str())))
        .collect();

    for chunk in &case.when.chunks {
        if given_chunks.contains(chunk.id.as_str()) {
            continue;
        }
        let opts = ReadOpts {
            branch: branch.clone(),
            ..ReadOpts::default()
        };
        if db
            .get(ChunkId::from(chunk.id.as_str()), opts)
            .map_err(|e| e.to_string())?
            .is_some()
        {
            return Err(format!("chunk {} readable after rejection", chunk.id));
        }
    }
    for placement in &case.when.placements {
        if given_placements.contains(&(placement.chunk.as_str(), placement.scope.as_str())) {
            continue;
        }
        let opts = ReadOpts {
            branch: branch.clone(),
            include: Includes::all(),
            ..ReadOpts::default()
        };
        let item = db
            .get(ChunkId::from(placement.chunk.as_str()), opts)
            .map_err(|e| e.to_string())?;
        let present = item
            .and_then(|i| i.placements)
            .map(|ps| ps.iter().any(|p| p.scope_id.as_str() == placement.scope))
            .unwrap_or(false);
        if present {
            return Err(format!(
                "placement {} -> {} readable after rejection",
                placement.chunk, placement.scope
            ));
        }
    }
    Ok(())
}

fn check_read(
    db: &Db,
    read: &ReadSpec,
    labels: &BTreeMap<String, CommitId>,
) -> Result<(), String> {
    let at = match &read.at {
        Some(label) => Some(
            labels
                .get(label)
                .ok_or(format!("unknown commit label {label}"))?
                .clone(),
        ),
        None => None,
    };
    let include_body = read.include.as_ref().map(|i| i.body).unwrap_or(true);
    let opts = ScopeOpts {
        branch: branch_of(&read.branch),
        at,
        match_: read.fts.clone(),
        exclude: read
            .exclude
            .iter()
            .flatten()
            .map(|s| ChunkId::from(s.as_str()))
            .collect(),
        limit: read.limit,
        offset: read.offset,
        include: Includes {
            intersection_chunks: true,
            chunk_name: true,
            chunk_spec: true,
            chunk_placements: true,
            chunk_body: include_body,
            ..Includes::default()
        },
    };
    let scopes: Vec<ChunkId> = read
        .scope
        .iter()
        .flatten()
        .map(|s| ChunkId::from(s.as_str()))
        .collect();
    let result = db.scope(&scopes, opts).map_err(|e| e.to_string())?;
    let got: Vec<&str> = result.chunks.iter().map(|c| c.id.as_str()).collect();

    let expect = &read.expect;
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
        let want: BTreeSet<&str> = ids.iter().map(|s| s.as_str()).collect();
        let have: BTreeSet<&str> = got.iter().copied().collect();
        if want != have {
            return Err(format!("expected exactly {want:?}; got {have:?}"));
        }
    }
    if let Some(ordered) = &expect.ordered_ids {
        let want: Vec<&str> = ordered.iter().map(|s| s.as_str()).collect();
        if got != want {
            return Err(format!("expected sequence {want:?}; got {got:?}"));
        }
    }
    if let Some(counts) = &expect.counts {
        if let Some(total) = counts.total {
            if result.in_scope != total {
                return Err(format!(
                    "expected full-set count {total}; got in_scope {}",
                    result.in_scope
                ));
            }
        }
    }
    if let Some(has_body) = expect.has_body {
        let any_body = result.chunks.iter().any(|c| c.body.is_some());
        if any_body != has_body {
            return Err(format!("expected has_body {has_body}; any_body {any_body}"));
        }
    }
    if let Some(unresolved) = &expect.unresolved {
        let want: BTreeSet<&str> = unresolved.iter().map(|s| s.as_str()).collect();
        let have: BTreeSet<&str> = result.unresolved.iter().map(|c| c.as_str()).collect();
        if want != have {
            return Err(format!("expected unresolved {want:?}; got {have:?}"));
        }
    }
    Ok(())
}

fn branch_of(branch: &Option<String>) -> BranchName {
    branch
        .as_ref()
        .map(|b| BranchName::from(b.as_str()))
        .unwrap_or_default()
}

/// A directory name no other case can collide with. The clock alone is not
/// enough: cases in different suites run in parallel threads and the platform
/// clock is coarser than the gap between two opens.
fn ulid_like() -> String {
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};
    static NEXT: AtomicU64 = AtomicU64::new(0);
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!(
        "{nanos:x}-{:x}-{:x}",
        std::process::id(),
        NEXT.fetch_add(1, Ordering::Relaxed)
    )
}

#[test]
fn validation() {
    run_file("validation.json");
}

#[test]
fn ordering() {
    run_file("ordering.json");
}

#[test]
fn naming() {
    run_file("naming.json");
}

#[test]
fn history() {
    run_file("history.json");
}

#[test]
fn queries() {
    run_file("queries.json");
}
