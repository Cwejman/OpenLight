//! The telemetry lane's write half (author rulings, the timings thread):
//! **the process chunk is the trace, and the field stores no aggregate** —
//! a derived view is a program's output, never a stored copy; multiple
//! sources of truth are how a field starts lying.
//!
//! Each stage of a finished open path is one event chunk — nameless, its
//! body the one value (milliseconds from the path's start) — placed twice,
//! because both are facts:
//!
//! - `instance` on its **category chunk**: typed membership. A category
//!   (`first-paint`, `shell-served`) is a chunk, not a string in a body —
//!   add it to a scope and intersection is the filter:
//!   `scope([first-paint, session-x])` is "every first-paint inside that
//!   session's runs".
//! - `relates` on its **process, with seq**: the trace. What a tracing
//!   system calls the trace id is the placement itself.
//!
//! Categories grow lazily, `instance` on one root ([`ROOT`]) — the category
//! *registry*: `scope([timing-event])` lists the kinds of event the field
//! has seen. Scope membership is direct placement (substrate.md — `propagate`
//! carries specs, never membership), so "every first-paint" is
//! `scope([first-paint])`, "this trace's first-paint" is
//! `scope([first-paint, process])`, and a cross-scope join like "first-paints
//! within a session" is a *program over the field*, not a stored expansion —
//! the scope is the DSL, programs are its syntax (author ruling). The event
//! carries no name of its own: the category chunk holds it once (point,
//! don't copy), and the value is the whole body — "a seq of chunks holding
//! one number", the argument shape a waterfall lens will declare.
//!
//! **Recorded gap.** No archetype rules telemetry; ids are derived
//! (`timing-<category>`, `<process>-t<n>`) and the root is a root scope in
//! the active project, like settings. Retention is v0.1's standing deferral.

use crate::timing::Execution;
use db::{ChunkDeclaration, ChunkId, Declaration, PlacementSpec, PlacementType};
use std::collections::BTreeSet;

/// The registry root every category instances on. A plain scope — no spec:
/// a contract would say what categories contain, and their content is open.
pub const ROOT: &str = "timing-event";

/// A category's derived chunk id. Its *name* is the category itself, so
/// `timing-event/first-paint` resolves by the name-lookup convention.
pub fn category_id(category: &str) -> ChunkId {
    ChunkId::from(format!("timing-{category}").as_str())
}

/// One finished open path into the field. One commit carries the missing
/// pieces of the type tree, then the events.
pub fn commit_execution(engine: &engine::Engine, execution: &Execution) -> Result<(), String> {
    let ctx = engine::Context::host();
    let exists = |id: &ChunkId| -> Result<bool, String> {
        engine
            .get(&ctx, id, db::ReadOpts::default())
            .map(|found| found.is_some())
            .map_err(|e| format!("reading {id}: {e}"))
    };

    let mut chunks: Vec<ChunkDeclaration> = Vec::new();
    let mut placements: Vec<PlacementSpec> = Vec::new();

    let root = ChunkId::from(ROOT);
    if !exists(&root)? {
        chunks.push(ChunkDeclaration {
            id: Some(root.clone()),
            name: Some(ROOT.into()),
            spec: None,
            body: Some(serde_json::json!({
                "text": "The telemetry category registry: every kind of event the field has seen.",
            })),
            removed: false,
        });
    }
    let categories: BTreeSet<&str> =
        execution.stages.iter().map(|(stage, _)| stage.as_str()).collect();
    for category in categories {
        let id = category_id(category);
        if !exists(&id)? {
            chunks.push(ChunkDeclaration {
                id: Some(id.clone()),
                name: Some(category.into()),
                spec: None,
                body: Some(serde_json::json!({})),
                removed: false,
            });
            placements.push(PlacementSpec {
                chunk: id,
                scope: root.clone(),
                type_: PlacementType::Instance,
                seq: None,
                active: true,
            });
        }
    }

    let process = ChunkId::from(execution.process.as_str());
    for (index, (stage, at)) in execution.stages.iter().enumerate() {
        let event = ChunkId::from(format!("{}-t{index}", execution.process).as_str());
        chunks.push(ChunkDeclaration {
            id: Some(event.clone()),
            name: None,
            spec: None,
            body: Some(serde_json::json!(at)),
            removed: false,
        });
        placements.push(PlacementSpec {
            chunk: event.clone(),
            scope: category_id(stage),
            type_: PlacementType::Instance,
            seq: None,
            active: true,
        });
        placements.push(PlacementSpec {
            chunk: event,
            scope: process.clone(),
            type_: PlacementType::Relates,
            seq: Some(index as i64 + 1),
            active: true,
        });
    }

    let total = execution.stages.last().map(|(_, at)| *at).unwrap_or(0.0);
    let program = execution.program.as_deref().unwrap_or("surface");
    engine
        .commit(
            &ctx,
            Declaration { chunks, placements, message: Some(format!("timing: {program} {total:.0}ms")) },
        )
        .map(|_| ())
        .map_err(|e| format!("telemetry commit: {e}"))
}
