use serde::{Deserialize, Serialize};
use std::fmt;

macro_rules! string_id {
    ($name:ident) => {
        #[derive(Debug, Clone, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
        #[serde(transparent)]
        pub struct $name(pub String);

        impl $name {
            pub fn as_str(&self) -> &str {
                &self.0
            }
        }

        impl From<&str> for $name {
            fn from(s: &str) -> Self {
                Self(s.to_string())
            }
        }

        impl From<String> for $name {
            fn from(s: String) -> Self {
                Self(s)
            }
        }

        impl fmt::Display for $name {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                f.write_str(&self.0)
            }
        }
    };
}

string_id!(ChunkId);
string_id!(CommitId);
string_id!(BranchName);

impl Default for BranchName {
    fn default() -> Self {
        BranchName("main".to_string())
    }
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Spec {
    #[serde(default)]
    pub ordered: bool,
    #[serde(default)]
    pub accepts: Vec<String>,
    #[serde(default)]
    pub required: Vec<String>,
    #[serde(default)]
    pub unique: Vec<String>,
    #[serde(default)]
    pub propagate: bool,
}

impl Spec {
    pub fn is_empty(&self) -> bool {
        !self.ordered
            && self.accepts.is_empty()
            && self.required.is_empty()
            && self.unique.is_empty()
            && !self.propagate
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PlacementType {
    Instance,
    Relates,
}

impl PlacementType {
    pub fn as_str(&self) -> &'static str {
        match self {
            PlacementType::Instance => "instance",
            PlacementType::Relates => "relates",
        }
    }

    pub fn parse(s: &str) -> Option<PlacementType> {
        match s {
            "instance" => Some(PlacementType::Instance),
            "relates" => Some(PlacementType::Relates),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct Placement {
    pub scope_id: ChunkId,
    pub type_: PlacementType,
    pub seq: Option<i64>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ChunkItem {
    pub id: ChunkId,
    pub name: Option<String>,
    pub spec: Option<Spec>,
    pub body: Option<serde_json::Value>,
    pub placements: Option<Vec<Placement>>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Dim {
    pub id: ChunkId,
    pub name: Option<String>,
    pub count: u64,
    pub instance: u64,
    pub relates: u64,
    pub edges: Option<Vec<Edge>>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Edge {
    pub id: ChunkId,
    pub name: Option<String>,
    pub count: u64,
    pub instance: u64,
    pub relates: u64,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ScopeResult {
    pub head: CommitId,
    pub total: u64,
    pub in_scope: u64,
    pub in_scope_instance: u64,
    pub in_scope_relates: u64,
    pub chunks: Vec<ChunkItem>,
    pub dimensions: Vec<Dim>,
    /// Named scope roots that resolve to no chunk in the read's state. A dead
    /// reference is metadata, not an error — it tells an empty intersection from
    /// a real-but-empty scope. Empty when every root resolves.
    pub unresolved: Vec<ChunkId>,
}

#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct Includes {
    pub chunk_name: bool,
    pub chunk_spec: bool,
    pub chunk_body: bool,
    pub chunk_placements: bool,
    pub intersection_chunks: bool,
    pub dimensions: bool,
    pub edges: bool,
    pub rank: bool,
    pub snippet: bool,
}

impl Includes {
    pub fn shape() -> Includes {
        Includes {
            dimensions: true,
            ..Includes::default()
        }
    }

    pub fn content() -> Includes {
        Includes {
            intersection_chunks: true,
            chunk_name: true,
            chunk_body: true,
            chunk_placements: true,
            ..Includes::default()
        }
    }

    pub fn all() -> Includes {
        Includes {
            chunk_name: true,
            chunk_spec: true,
            chunk_body: true,
            chunk_placements: true,
            intersection_chunks: true,
            dimensions: true,
            edges: true,
            rank: true,
            snippet: true,
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct ScopeOpts {
    pub branch: BranchName,
    pub at: Option<CommitId>,
    pub match_: Option<String>,
    pub exclude: Vec<ChunkId>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub include: Includes,
}

#[derive(Debug, Clone, Default)]
pub struct ReadOpts {
    pub branch: BranchName,
    pub at: Option<CommitId>,
    pub include: Includes,
}

#[derive(Debug, Clone, Default)]
pub struct ChunkDeclaration {
    pub id: Option<ChunkId>,
    pub name: Option<String>,
    pub spec: Option<Spec>,
    pub body: Option<serde_json::Value>,
    pub removed: bool,
}

#[derive(Debug, Clone)]
pub struct PlacementSpec {
    pub chunk: ChunkId,
    pub scope: ChunkId,
    pub type_: PlacementType,
    pub seq: Option<i64>,
    pub active: bool,
}

#[derive(Debug, Clone, Default)]
pub struct Declaration {
    pub chunks: Vec<ChunkDeclaration>,
    pub placements: Vec<PlacementSpec>,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct CommitOpts {
    pub branch: BranchName,
    pub process_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Commit {
    pub id: CommitId,
    pub parent_id: Option<CommitId>,
    pub timestamp: String,
    pub message: Option<String>,
    pub process_id: Option<String>,
    // Which branch the commit landed on — carried for subscription filtering
    // (db.md's SubscribeOpts.branch has no other carrier on the event).
    pub branch: BranchName,
    pub chunks_modified: Vec<ChunkId>,
    pub placements_modified: Vec<(ChunkId, ChunkId)>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Branch {
    pub name: BranchName,
    pub head: CommitId,
}

#[derive(Debug, Clone, Default)]
pub struct SubscribeOpts {
    pub branch: BranchName,
}
