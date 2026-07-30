use crate::types::ChunkId;
use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuleKind {
    Ordered,
    Accepts,
    Required,
    Unique,
    AmbiguousType,
}

impl fmt::Display for RuleKind {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            RuleKind::Ordered => "ordered",
            RuleKind::Accepts => "accepts",
            RuleKind::Required => "required",
            RuleKind::Unique => "unique",
            RuleKind::AmbiguousType => "ambiguous-type",
        };
        f.write_str(s)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum OpenError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("sqlite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("migration error: {0}")]
    Migration(#[from] rusqlite_migration::Error),
    #[error("no database file at {path} (read-only open never creates)")]
    MissingDatabase { path: std::path::PathBuf },
    #[error("schema version skew: db is at {found}, this build expects {expected} (read-only open never migrates)")]
    SchemaVersionSkew { found: i64, expected: i64 },
}

#[derive(Debug, thiserror::Error)]
pub enum ReadError {
    #[error("not found: {kind} {id}")]
    NotFound { kind: &'static str, id: String },
    #[error("sqlite error: {0}")]
    Io(#[from] rusqlite::Error),
}

#[derive(Debug, thiserror::Error)]
pub enum WriteError {
    #[error("spec violation ({kind}) on scope {scope_id}")]
    Validation { scope_id: ChunkId, kind: RuleKind },
    #[error("name collision on scope {scope_id}: {name}")]
    NameCollision { scope_id: ChunkId, name: String },
    #[error("not found: {kind} {id}")]
    NotFound { kind: &'static str, id: String },
    #[error("malformed declaration: {0}")]
    MalformedDeclaration(String),
    #[error("write targets virtual chunk {id}")]
    WriteToVirtualChunk { id: ChunkId },
    #[error("db handle is read-only: writes refused (opened via open_read_only)")]
    ReadOnly,
    #[error("sqlite error: {0}")]
    Io(#[from] rusqlite::Error),
}
