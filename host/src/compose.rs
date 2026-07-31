//! Composition reads — pure. Projects field data (chunks + placements) into
//! `geometry`'s inputs and resolves what each leaf displays. host.md §Tile
//! Geometry: a leaf's rendering is derived from whichever process is placed
//! `relates` on it; the process is `instance` on its program. Archetype ids
//! are parameters — fixture ids today, bootstrap-generated ids later.

use crate::field::{Chunk, Placement, PlacementType};
use crate::geometry;

#[derive(Debug, Clone, PartialEq)]
pub enum ComposeError {
    /// A tile body that is neither a `{ direction, ratio }` split nor empty.
    BadTileBody { id: String },
}

/// All tiles typed `instance` on the tile archetype, as geometry inputs:
/// their bodies parsed to split/leaf, their tree placements (onto the tab or
/// a parent tile) carried through with seq.
pub fn tile_inputs(
    chunks: &[Chunk],
    placements: &[Placement],
    tile_archetype: &str,
) -> Result<(Vec<geometry::TileChunk>, Vec<geometry::Placement>), ComposeError> {
    let tile_ids: Vec<&str> = placements
        .iter()
        .filter(|p| p.scope == tile_archetype && p.type_ == PlacementType::Instance)
        .map(|p| p.chunk.as_str())
        .collect();

    let tiles = chunks
        .iter()
        .filter(|c| tile_ids.contains(&c.id.as_str()))
        .map(|c| Ok(geometry::TileChunk { id: c.id.clone(), body: tile_body(c)? }))
        .collect::<Result<Vec<_>, _>>()?;

    let tree_placements = placements
        .iter()
        .filter(|p| {
            p.type_ == PlacementType::Instance
                && tile_ids.contains(&p.chunk.as_str())
                && p.scope != tile_archetype
        })
        .map(|p| geometry::Placement {
            tile: p.chunk.clone(),
            scope: p.scope.clone(),
            seq: p.seq.unwrap_or(0),
        })
        .collect();

    Ok((tiles, tree_placements))
}

/// host.md: split node body `{ direction, ratio }`; leaf node empty.
fn tile_body(chunk: &Chunk) -> Result<geometry::TileBody, ComposeError> {
    body_shape(&chunk.id, chunk.body.as_ref())
}

/// The same reading over a bare body value — shared with `tree`, which reads
/// tile chunks through the engine rather than from fixture data.
pub fn body_shape(
    id: &str,
    body: Option<&serde_json::Value>,
) -> Result<geometry::TileBody, ComposeError> {
    let bad = || ComposeError::BadTileBody { id: id.to_string() };
    let Some(body) = body else { return Ok(geometry::TileBody::Leaf) };
    let (direction, ratio) = (body.get("direction"), body.get("ratio"));
    if direction.is_none() && ratio.is_none() {
        return Ok(geometry::TileBody::Leaf);
    }
    let direction = match direction.and_then(|d| d.as_str()) {
        Some("horizontal") => geometry::Direction::Horizontal,
        Some("vertical") => geometry::Direction::Vertical,
        _ => return Err(bad()),
    };
    let ratio = ratio.and_then(|r| r.as_f64()).ok_or_else(bad)?;
    Ok(geometry::TileBody::Split { direction, ratio })
}

#[derive(Debug, Clone, PartialEq)]
pub struct ProcessInfo {
    pub process: String,
    pub program: String,
    pub status: Option<String>,
}

/// The process a leaf displays: the leaf's `relates` placement onto an
/// `engine/process` instance, and through it the program's display name.
pub fn leaf_process(
    chunks: &[Chunk],
    placements: &[Placement],
    leaf: &str,
    process_archetype: &str,
    program_archetype: &str,
) -> Option<ProcessInfo> {
    let is_instance_of = |id: &str, archetype: &str| {
        placements
            .iter()
            .any(|p| p.chunk == id && p.scope == archetype && p.type_ == PlacementType::Instance)
    };
    let process = placements
        .iter()
        .find(|p| {
            p.chunk == leaf
                && p.type_ == PlacementType::Relates
                && is_instance_of(&p.scope, process_archetype)
        })?
        .scope
        .clone();
    let program_id = placements
        .iter()
        .find(|p| {
            p.chunk == process
                && p.type_ == PlacementType::Instance
                && is_instance_of(&p.scope, program_archetype)
        })?
        .scope
        .clone();
    let program = chunks
        .iter()
        .find(|c| c.id == program_id)
        .and_then(|c| c.name.clone())
        .unwrap_or(program_id);
    let status = chunks
        .iter()
        .find(|c| c.id == process)
        .and_then(|c| c.body.as_ref())
        .and_then(|b| b.get("status"))
        .and_then(|s| s.as_str())
        .map(String::from);
    Some(ProcessInfo { process, program, status })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::field::{self, chunk, instance};
    use serde_json::json;

    #[test]
    fn demo_field_parses_into_the_demo_tree() {
        let (chunks, placements) = field::demo();
        let (tiles, tree_placements) =
            tile_inputs(&chunks, &placements, field::HOST_TILE).unwrap();
        assert_eq!(tiles.len(), 5);

        let tree = geometry::parse(field::DEMO_TAB, &tiles, &tree_placements).unwrap();
        let viewport = geometry::Rect { x: 0.0, y: 0.0, width: 1000.0, height: 800.0 };
        let spacing = geometry::Spacing { padding: 10.0, gap: 6.0 };
        let leaves = geometry::walk(&tree, viewport, spacing);
        let ids: Vec<&str> = leaves.iter().map(|l| l.id.as_str()).collect();
        assert_eq!(ids, ["tile-reader", "tile-side", "tile-inspect"]);
    }

    #[test]
    fn typing_placements_stay_out_of_the_tree() {
        let (chunks, placements) = field::demo();
        let (_, tree_placements) = tile_inputs(&chunks, &placements, field::HOST_TILE).unwrap();
        assert!(tree_placements.iter().all(|p| p.scope != field::HOST_TILE));
        // relates placements (leaf → process) are not tree edges either
        assert!(tree_placements.iter().all(|p| !p.scope.starts_with("proc-")));
    }

    #[test]
    fn bad_tile_body_is_an_error() {
        let chunks = [chunk("t", None, None, Some(json!({"direction": "diagonal", "ratio": 0.5})))];
        let placements = [instance("t", field::HOST_TILE)];
        assert_eq!(
            tile_inputs(&chunks, &placements, field::HOST_TILE),
            Err(ComposeError::BadTileBody { id: "t".into() })
        );
    }

    #[test]
    fn leaves_resolve_to_their_processes() {
        let (chunks, placements) = field::demo();
        let resolve = |leaf| {
            leaf_process(&chunks, &placements, leaf, field::ENGINE_PROCESS, field::ENGINE_PROGRAM)
                .unwrap()
        };
        assert_eq!(
            resolve("tile-reader"),
            ProcessInfo {
                process: "proc-read-tile-1".into(),
                program: "read-tile".into(),
                status: Some("running".into())
            }
        );
        assert_eq!(resolve("tile-side").program, "sidebar");
        assert_eq!(resolve("tile-inspect").program, "inspector");
    }

    #[test]
    fn leaf_without_process_resolves_to_none() {
        let (chunks, placements) = field::demo();
        let info = leaf_process(
            &chunks,
            &placements,
            "tile-root", // a split — relates nothing
            field::ENGINE_PROCESS,
            field::ENGINE_PROGRAM,
        );
        assert_eq!(info, None);
    }
}
