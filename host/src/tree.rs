//! The tile tree, read from the field (host.md §The Composition Types, §Tile
//! Geometry): tiles are `host/tile` instances, tree edges are their instance
//! placements onto the tab or a parent tile, and a leaf displays whichever
//! process is placed `relates` on it. The rim reads under host identity — it
//! is not a process and has no boundary — and hands the parsed tree to
//! `geometry` unchanged. `compose` remains the fixture rim's equivalent.

use crate::compose;
use crate::geometry;
use db::ChunkId;
use engine::{Context, Engine};
use std::collections::HashMap;

/// What one leaf displays, resolved as far as the field allows. A leaf whose
/// process or program cannot be read still renders as a rectangle — the tree
/// is the host's truth; the content degrades, never the geometry.
#[derive(Debug, Clone, PartialEq)]
pub struct LeafView {
    pub tile: String,
    pub process: Option<ChunkId>,
    pub program: Option<ChunkId>,
    pub program_name: Option<String>,
    /// `body.executable`, resolved against the declaring project's root.
    pub executable: Option<String>,
    pub status: Option<String>,
}

/// The current tab's tree as the rim renders it. `tree` is `None` for an
/// empty tab — a legal state (bootstrap.md: the first launch creates "an empty
/// tab"); closing the last tile returns to it.
#[derive(Debug, Clone, PartialEq)]
pub struct TreeView {
    pub tree: Option<geometry::Tile>,
    /// One entry per leaf of `tree`, keyed by tile id.
    pub leaves: HashMap<String, LeafView>,
}

impl TreeView {
    pub fn empty() -> TreeView {
        TreeView { tree: None, leaves: HashMap::new() }
    }

    /// The leaf displaying `process`, if any — the rim's mount lookup.
    pub fn leaf_of(&self, process: &ChunkId) -> Option<&LeafView> {
        self.leaves.values().find(|leaf| leaf.process.as_ref() == Some(process))
    }
}

#[derive(Debug)]
pub enum TreeError {
    Engine(String),
    /// The tab's placements do not parse into a tree — a malformed field is
    /// surfaced, not guessed around. (`NoRoot` is not an error: empty tab.)
    Parse(geometry::ParseError),
    Compose(compose::ComposeError),
}

impl std::fmt::Display for TreeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TreeError::Engine(e) => write!(f, "reading the tree: {e}"),
            TreeError::Parse(e) => write!(f, "the tab's tree does not parse: {e:?}"),
            TreeError::Compose(e) => write!(f, "a tile body does not parse: {e:?}"),
        }
    }
}

/// Read the tab's current tree. One scope read over the tile archetype gives
/// every tile with its placements (tiles no longer in any tree are simply not
/// reachable from the tab and fall away in the parse); the leaves' processes
/// and programs resolve through `get`.
pub fn read(engine: &Engine, tab: &ChunkId) -> Result<TreeView, TreeError> {
    let ctx = Context::host();
    let tile_archetype = engine
        .resolve_name(&ctx, "host/tile")
        .map_err(|e| TreeError::Engine(format!("resolving host/tile: {e}")))?;

    let opts = db::ScopeOpts {
        include: db::Includes {
            chunk_name: true,
            chunk_body: true,
            chunk_placements: true,
            intersection_chunks: true,
            ..db::Includes::default()
        },
        ..db::ScopeOpts::default()
    };
    let tiles = engine
        .scope(&ctx, std::slice::from_ref(&tile_archetype), opts)
        .map_err(|e| TreeError::Engine(e.to_string()))?;

    let tile_ids: Vec<&str> = tiles.chunks.iter().map(|c| c.id.as_str()).collect();
    let mut chunks: Vec<geometry::TileChunk> = Vec::new();
    let mut placements: Vec<geometry::Placement> = Vec::new();
    let mut relates: HashMap<String, ChunkId> = HashMap::new();
    for tile in &tiles.chunks {
        chunks.push(geometry::TileChunk {
            id: tile.id.as_str().to_string(),
            body: compose::body_shape(tile.id.as_str(), tile.body.as_ref())
                .map_err(TreeError::Compose)?,
        });
        for p in tile.placements.iter().flatten() {
            match p.type_ {
                // Tree edges: onto the tab or a parent tile. The typing
                // placement (onto the archetype) is not an edge.
                db::PlacementType::Instance
                    if p.scope_id == *tab || tile_ids.contains(&p.scope_id.as_str()) =>
                {
                    placements.push(geometry::Placement {
                        tile: tile.id.as_str().to_string(),
                        scope: p.scope_id.as_str().to_string(),
                        seq: p.seq.unwrap_or(0),
                    });
                }
                // The displayed process — filtered of mount provenance rows,
                // which are synthesized relates the engine adds to every read.
                db::PlacementType::Relates
                    if !p.scope_id.as_str().starts_with("engine/mount") =>
                {
                    relates.insert(tile.id.as_str().to_string(), p.scope_id.clone());
                }
                _ => {}
            }
        }
    }

    let tree = match geometry::parse(tab.as_str(), &chunks, &placements) {
        Ok(tree) => Some(tree),
        Err(geometry::ParseError::NoRoot) => None,
        Err(e) => return Err(TreeError::Parse(e)),
    };

    let mut leaves = HashMap::new();
    if let Some(tree) = &tree {
        for id in leaf_ids(tree) {
            let process = relates.get(&id).cloned();
            leaves.insert(id.clone(), resolve_leaf(engine, id, process));
        }
    }
    Ok(TreeView { tree, leaves })
}

fn leaf_ids(tree: &geometry::Tile) -> Vec<String> {
    match tree {
        geometry::Tile::Leaf { id } => vec![id.clone()],
        geometry::Tile::Split { first, second, .. } => {
            let mut ids = leaf_ids(first);
            ids.extend(leaf_ids(second));
            ids
        }
    }
}

/// Follow one leaf's relates edge to its process and through it to the
/// program: the process is `instance` on its program (engine.md, *Program and
/// Process*), and the program is the instance parent whose body declares an
/// executable. Failures leave fields `None` — the rectangle still renders.
fn resolve_leaf(engine: &Engine, tile: String, process: Option<ChunkId>) -> LeafView {
    let ctx = Context::host();
    let mut view = LeafView {
        tile,
        process: process.clone(),
        program: None,
        program_name: None,
        executable: None,
        status: None,
    };
    let Some(process) = process else { return view };
    let opts = db::ReadOpts {
        include: db::Includes {
            chunk_name: true,
            chunk_body: true,
            chunk_placements: true,
            ..db::Includes::default()
        },
        ..db::ReadOpts::default()
    };
    let Ok(Some(item)) = engine.get(&ctx, &process, opts.clone()) else { return view };
    view.status = item
        .body
        .as_ref()
        .and_then(|b| b.get("status"))
        .and_then(|s| s.as_str())
        .map(String::from);
    for p in item.placements.into_iter().flatten() {
        if p.type_ != db::PlacementType::Instance {
            continue;
        }
        let Ok(Some(parent)) = engine.get(&ctx, &p.scope_id, opts.clone()) else { continue };
        let is_program = parent
            .body
            .as_ref()
            .map(|b| b.get("executable").is_some() && b.get("runtime").is_some())
            .unwrap_or(false);
        if is_program {
            view.executable = parent
                .body
                .as_ref()
                .and_then(|b| b.get("executable"))
                .and_then(|e| e.as_str())
                .map(String::from);
            view.program_name = parent.name.clone();
            view.program = Some(parent.id);
            break;
        }
    }
    view
}
