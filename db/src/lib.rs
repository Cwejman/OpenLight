//! The substrate library. Owns the database: chunks, placements, commits,
//! branches, FTS. Implemented from `pilot/db.md`; both contracts answer to
//! `pilot/substrate.md`.

mod bootstrap;
mod db;
mod errors;
mod id;
mod ops;
mod schema;
mod types;
mod validate;
mod virtual_chunks;

pub use db::Db;
pub use errors::{OpenError, ReadError, RuleKind, WriteError};
pub use types::{
    Branch, BranchName, ChunkDeclaration, ChunkId, ChunkItem, Commit, CommitId, CommitOpts,
    Declaration, Dim, Edge, Includes, Placement, PlacementSpec, PlacementType, ReadOpts,
    ScopeOpts, ScopeResult, Spec, SubscribeOpts,
};
