use crate::errors::ReadError;
use crate::types::{ChunkId, CommitId, Placement, PlacementType, ChunkItem, ScopeOpts, ScopeResult};
use rusqlite::{params, Connection, OptionalExtension};

pub(crate) const BRANCHES: &str = "db/branches";
pub(crate) const COMMITS: &str = "db/commits";

pub(crate) fn is_virtual(id: &str) -> bool {
    id == BRANCHES || id == COMMITS
}

/// Projection of `db/branches` / `db/commits` from the underlying tables.
/// Unrecognized parameter shapes fall out as empty results, not errors.
pub(crate) fn project(
    conn: &Connection,
    scopes: &[ChunkId],
    opts: &ScopeOpts,
) -> Result<ScopeResult, ReadError> {
    let anchor = scopes[0].as_str();
    let args: Vec<&str> = scopes[1..].iter().map(|s| s.as_str()).collect();
    let head: String = conn
        .query_row(
            "SELECT head FROM branches WHERE name = ?1",
            params![opts.branch.as_str()],
            |r| r.get(0),
        )
        .optional()?
        .unwrap_or_default();

    let items = match anchor {
        BRANCHES => project_branches(conn, &args)?,
        COMMITS => project_commits(conn, &args)?,
        _ => Vec::new(),
    };

    let n = items.len() as u64;
    Ok(ScopeResult {
        head: CommitId(head),
        total: n,
        in_scope: n,
        in_scope_instance: n,
        in_scope_relates: 0,
        chunks: if opts.include.intersection_chunks {
            items
        } else {
            Vec::new()
        },
        dimensions: Vec::new(),
        // Projection anchors always resolve, and db.md rules an unrecognized
        // parameter shape an empty result rather than a dead root.
        unresolved: Vec::new(),
    })
}

pub(crate) fn anchor_item(id: &str) -> ChunkItem {
    ChunkItem {
        id: ChunkId::from(id),
        name: Some(id.trim_start_matches("db/").to_string()),
        spec: Some(Default::default()),
        body: Some(serde_json::json!({})),
        placements: Some(Vec::new()),
    }
}

fn project_branches(conn: &Connection, args: &[&str]) -> Result<Vec<ChunkItem>, ReadError> {
    let mut stmt = conn.prepare("SELECT name, head FROM branches ORDER BY name")?;
    let rows = stmt
        .query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows
        .into_iter()
        .filter(|(name, _)| args.iter().all(|a| a == name))
        .map(|(name, head)| ChunkItem {
            id: ChunkId(name.clone()),
            name: Some(name),
            spec: Some(Default::default()),
            body: Some(serde_json::json!({ "head": head })),
            placements: Some(Vec::new()),
        })
        .collect())
}

fn project_commits(conn: &Connection, args: &[&str]) -> Result<Vec<ChunkItem>, ReadError> {
    let rows: Vec<(String, String, Option<String>, Option<String>, Option<i64>)> =
        if args.is_empty() {
            let mut stmt = conn.prepare(
                "SELECT id, timestamp, message, process_id, NULL FROM commits ORDER BY id",
            )?;
            let rows = stmt
                .query_map([], row_to_commit)?
                .collect::<Result<Vec<_>, _>>()?;
            rows
        } else {
            let arg = args[0];
            let is_branch: Option<i64> = conn
                .query_row(
                    "SELECT 1 FROM branches WHERE name = ?1",
                    params![arg],
                    |r| r.get(0),
                )
                .optional()?;
            if is_branch.is_some() {
                let mut stmt = conn.prepare(
                    "WITH RECURSIVE ancestry(id, depth) AS (
                       SELECT head, 0 FROM branches WHERE name = ?1
                       UNION ALL
                       SELECT c.parent_id, a.depth + 1
                       FROM commits c JOIN ancestry a ON c.id = a.id
                       WHERE c.parent_id IS NOT NULL
                     )
                     SELECT c.id, c.timestamp, c.message, c.process_id, a.depth
                     FROM commits c JOIN ancestry a ON c.id = a.id
                     ORDER BY a.depth",
                )?;
                let rows = stmt
                    .query_map(params![arg], row_to_commit)?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            } else {
                // process id, then chunk id; unrecognized shapes fall out empty
                let mut stmt = conn.prepare(
                    "SELECT id, timestamp, message, process_id, NULL FROM commits
                     WHERE process_id = ?1
                        OR id IN (SELECT commit_id FROM chunk_versions WHERE chunk_id = ?1)
                        OR id IN (SELECT commit_id FROM placement_versions WHERE chunk_id = ?1)
                     ORDER BY id",
                )?;
                let rows = stmt
                    .query_map(params![arg], row_to_commit)?
                    .collect::<Result<Vec<_>, _>>()?;
                rows
            }
        };

    Ok(rows
        .into_iter()
        .map(|(id, timestamp, message, process_id, depth)| ChunkItem {
            id: ChunkId(id),
            name: None,
            spec: Some(Default::default()),
            body: Some(serde_json::json!({
                "timestamp": timestamp,
                "message": message,
                "process_id": process_id,
            })),
            placements: Some(
                depth
                    .map(|d| {
                        vec![Placement {
                            scope_id: ChunkId::from(COMMITS),
                            type_: PlacementType::Instance,
                            seq: Some(d),
                        }]
                    })
                    .unwrap_or_default(),
            ),
        })
        .collect())
}

type CommitRow = (String, String, Option<String>, Option<String>, Option<i64>);

fn row_to_commit(r: &rusqlite::Row) -> Result<CommitRow, rusqlite::Error> {
    Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?))
}
