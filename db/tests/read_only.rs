//! `Db::open_read_only` — host.md boot steps 3–4: peer dbs open read-only,
//! never create/migrate/seed; schema-version skew refuses (v0.1 has no
//! migration story for peers); writes through the handle refuse unmistakably.

use db::{
    ChunkDeclaration, ChunkId, CommitId, CommitOpts, Db, Declaration, Includes, OpenError,
    PlacementSpec, PlacementType, ReadOpts, ScopeOpts, WriteError,
};
use std::path::{Path, PathBuf};

fn open_err(dir: &Path, why: &str) -> OpenError {
    match Db::open_read_only(dir) {
        Ok(_) => panic!("{why}"),
        Err(e) => e,
    }
}

/// A directory no other test can collide with. The clock alone is not enough:
/// these tests run in parallel threads and the platform clock is coarser than
/// the gap between two opens.
fn fresh_dir() -> PathBuf {
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};
    static NEXT: AtomicU64 = AtomicU64::new(0);
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir().join("ol-db-read-only").join(format!(
        "{nanos:x}-{:x}-{:x}",
        std::process::id(),
        NEXT.fetch_add(1, Ordering::Relaxed)
    ))
}

/// A project db as the normal open leaves it: seeded, one scope with one note.
fn seed_project(dir: &Path) {
    let db = Db::open(dir).expect("rw open");
    db.commit(&note_declaration(), CommitOpts::default())
        .expect("seed commit");
}

fn note_declaration() -> Declaration {
    Declaration {
        chunks: vec![
            ChunkDeclaration {
                id: Some(ChunkId::from("notes")),
                name: Some("notes".to_string()),
                ..ChunkDeclaration::default()
            },
            ChunkDeclaration {
                id: Some(ChunkId::from("note-1")),
                name: Some("first note".to_string()),
                body: Some(serde_json::json!({ "text": "peer-visible" })),
                ..ChunkDeclaration::default()
            },
        ],
        placements: vec![PlacementSpec {
            chunk: ChunkId::from("note-1"),
            scope: ChunkId::from("notes"),
            type_: PlacementType::Instance,
            seq: None,
            active: true,
        }],
        message: None,
    }
}

#[test]
fn reads_a_db_seeded_by_normal_open() {
    let dir = fresh_dir();
    seed_project(&dir);

    let db = Db::open_read_only(&dir).expect("read-only open");
    let opts = ReadOpts {
        include: Includes::all(),
        ..ReadOpts::default()
    };
    let item = db
        .get(ChunkId::from("note-1"), opts)
        .expect("get")
        .expect("note-1 present");
    assert_eq!(item.name.as_deref(), Some("first note"));

    let result = db
        .scope(
            &[ChunkId::from("notes")],
            ScopeOpts {
                include: Includes::content(),
                ..ScopeOpts::default()
            },
        )
        .expect("scope");
    let ids: Vec<&str> = result.chunks.iter().map(|c| c.id.as_str()).collect();
    assert_eq!(ids, vec!["note-1"]);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn missing_file_errors_clearly_and_creates_nothing() {
    let dir = fresh_dir();
    let err = open_err(&dir, "must refuse a missing db");
    assert!(
        matches!(err, OpenError::MissingDatabase { .. }),
        "expected MissingDatabase, got {err:?}"
    );
    assert!(
        err.to_string().contains(".ol"),
        "message should name the path: {err}"
    );
    assert!(
        !dir.join(".ol").exists(),
        "read-only open must not create directories"
    );
}

#[test]
fn schema_version_skew_errors_clearly() {
    let dir = fresh_dir();
    seed_project(&dir);
    let conn = rusqlite::Connection::open(dir.join(".ol").join("db")).expect("raw open");
    conn.pragma_update(None, "user_version", 999).expect("skew");
    drop(conn);

    let err = open_err(&dir, "must refuse version skew");
    assert!(
        matches!(err, OpenError::SchemaVersionSkew { found: 999, .. }),
        "expected SchemaVersionSkew, got {err:?}"
    );
    let msg = err.to_string();
    assert!(
        msg.contains("999") && msg.contains("schema version"),
        "message should name both versions: {msg}"
    );

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn writes_through_read_only_handle_refuse() {
    let dir = fresh_dir();
    seed_project(&dir);
    let db = Db::open_read_only(&dir).expect("read-only open");

    let err = db
        .commit(&note_declaration(), CommitOpts::default())
        .expect_err("commit must refuse");
    assert!(
        matches!(err, WriteError::ReadOnly),
        "expected ReadOnly, got {err:?}"
    );
    assert!(
        err.to_string().contains("read-only"),
        "message must be unmistakable: {err}"
    );

    let head = db.scope(&[], ScopeOpts::default()).expect("scope").head;
    let branch_err = db
        .create_branch("fork", CommitId::from(head.as_str()))
        .expect_err("create_branch must refuse");
    assert!(matches!(branch_err, WriteError::ReadOnly));
    let delete_err = db
        .delete_branch("main")
        .expect_err("delete_branch must refuse");
    assert!(matches!(delete_err, WriteError::ReadOnly));

    let _ = std::fs::remove_dir_all(&dir);
}
