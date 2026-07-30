//! Name-path resolution (board-ruled convention): canonical chunks found by
//! name within scope, federated across mounts. Readable seed ids stay tracked
//! debt — this helper is the seam that makes generated ids a later swap.

mod common;

use common::*;
use db::PlacementType;
use engine::{Context, EngineError};

fn peer_archetypes() -> Vec<db::Declaration> {
    vec![decl(
        vec![
            named("engine", "engine"),
            named("engine/program", "program"),
            named("engine/process", "process"),
        ],
        vec![
            instance("engine/program", "engine"),
            instance("engine/process", "engine"),
        ],
    )]
}

#[tokio::test(flavor = "multi_thread")]
async fn resolves_a_root_and_a_nested_path_in_a_peer_mount() {
    let field = field_with(FakeRuntime::ready(), &[], &[("engine", peer_archetypes())]);
    let root = field.engine.resolve_name(&Context::host(), "engine").unwrap();
    assert_eq!(root.as_str(), "engine");
    let program = field
        .engine
        .resolve_name(&Context::host(), "engine/program")
        .unwrap();
    assert_eq!(program.as_str(), "engine/program");
}

#[tokio::test(flavor = "multi_thread")]
async fn resolves_a_cross_db_member_placed_from_the_active_project() {
    let field = field_with(FakeRuntime::ready(), &[], &[("engine", peer_archetypes())]);
    // The federation pattern: an invocable declared in the active project,
    // placed instance on the mounted engine/program archetype.
    field
        .engine
        .commit(
            &Context::host(),
            decl(
                vec![named("prog-hello", "hello")],
                vec![instance("prog-hello", "engine/program")],
            ),
        )
        .unwrap();
    let found = field
        .engine
        .resolve_name(&Context::host(), "engine/program/hello")
        .unwrap();
    assert_eq!(found.as_str(), "prog-hello");
}

#[tokio::test(flavor = "multi_thread")]
async fn relates_placed_type_definitions_resolve_by_name() {
    // Type definitions are relates-placed (bootstrap.md) and must stay
    // resolvable — the walk matches any placement type, like accepts.
    let mut seeds = peer_archetypes();
    seeds.push(decl(
        vec![named("engine/read-boundary", "read-boundary")],
        vec![
            instance("engine/read-boundary", "engine"),
            place("engine/read-boundary", "engine/process", PlacementType::Relates),
        ],
    ));
    let field = field_with(FakeRuntime::ready(), &[], &[("engine", seeds)]);
    let found = field
        .engine
        .resolve_name(&Context::host(), "engine/process/read-boundary")
        .unwrap();
    assert_eq!(found.as_str(), "engine/read-boundary");
}

#[tokio::test(flavor = "multi_thread")]
async fn missing_segment_is_not_found() {
    let field = field_with(FakeRuntime::ready(), &[], &[("engine", peer_archetypes())]);
    for path in ["ghost", "engine/ghost", "engine/program/ghost"] {
        match field.engine.resolve_name(&Context::host(), path) {
            Err(EngineError::NotFound(message)) => {
                assert!(message.contains("ghost"), "{path}: {message}")
            }
            other => panic!("{path}: expected NotFound, got {other:?}"),
        }
    }
}

#[tokio::test(flavor = "multi_thread")]
async fn same_named_roots_in_two_mounts_are_ambiguous_not_picked() {
    let twin = vec![decl(vec![named("other-engine", "engine")], vec![])];
    let field = field_with(
        FakeRuntime::ready(),
        &[],
        &[("engine", peer_archetypes()), ("twin", twin)],
    );
    match field.engine.resolve_name(&Context::host(), "engine") {
        Err(EngineError::InvalidRequest(message)) => {
            assert!(message.contains("ambiguous"), "{message}")
        }
        other => panic!("expected ambiguity refusal, got {other:?}"),
    }
}

#[tokio::test(flavor = "multi_thread")]
async fn anchor_rows_never_resolve_as_roots() {
    // Committing a cross-db placement materializes an anchor row for the peer
    // id in the active db; the nameless anchor must not shadow or duplicate
    // the genuine chunk.
    let field = field_with(FakeRuntime::ready(), &[], &[("engine", peer_archetypes())]);
    field
        .engine
        .commit(
            &Context::host(),
            decl(
                vec![named("prog-hello", "hello")],
                vec![instance("prog-hello", "engine/program")],
            ),
        )
        .unwrap();
    // Still a single unambiguous hit after the anchor exists.
    let program = field
        .engine
        .resolve_name(&Context::host(), "engine/program")
        .unwrap();
    assert_eq!(program.as_str(), "engine/program");
}

#[tokio::test(flavor = "multi_thread")]
async fn empty_path_is_refused() {
    let field = field_with(FakeRuntime::ready(), &[], &[]);
    assert!(matches!(
        field.engine.resolve_name(&Context::host(), ""),
        Err(EngineError::InvalidRequest(_))
    ));
}
