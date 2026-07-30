use crate::errors::ReadError;
use crate::types::{
    ChunkId, ChunkItem, Includes, Placement, PlacementType, ScopeOpts, ScopeResult,
};
use rusqlite::{params, Connection, OptionalExtension};
use std::collections::BTreeMap;

pub(crate) struct ChunkRow {
    pub name: Option<String>,
    pub spec: String,
    pub body: String,
}

pub(crate) struct PlacementRow {
    pub chunk_id: String,
    pub scope_id: String,
    pub type_: String,
    pub seq: Option<i64>,
    /// Insertion order of the commit this version came from — the tie-break
    /// between placements holding the same seq.
    pub commit_order: i64,
}

pub(crate) struct StateAt {
    pub chunks: BTreeMap<String, ChunkRow>,
    pub placements: Vec<PlacementRow>,
}

/// Reconstruct field state as of a commit by walking the version tables through
/// the commit's ancestry — nearest ancestor version of each chunk and placement wins.
pub(crate) fn state_at(conn: &Connection, commit_id: &str) -> Result<StateAt, ReadError> {
    let exists: Option<i64> = conn
        .query_row(
            "SELECT 1 FROM commits WHERE id = ?1",
            params![commit_id],
            |r| r.get(0),
        )
        .optional()?;
    if exists.is_none() {
        return Err(ReadError::NotFound {
            kind: "commit",
            id: commit_id.to_string(),
        });
    }

    let mut chunks: BTreeMap<String, ChunkRow> = BTreeMap::new();
    {
        let mut stmt = conn.prepare(
            "WITH RECURSIVE ancestry(id, depth) AS (
               SELECT ?1, 0
               UNION ALL
               SELECT c.parent_id, a.depth + 1
               FROM commits c JOIN ancestry a ON c.id = a.id
               WHERE c.parent_id IS NOT NULL
             )
             SELECT cv.chunk_id, cv.name, cv.spec, cv.body, cv.removed
             FROM chunk_versions cv JOIN ancestry a ON a.id = cv.commit_id
             ORDER BY cv.chunk_id, a.depth ASC",
        )?;
        let rows = stmt
            .query_map(params![commit_id], |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, Option<String>>(1)?,
                    r.get::<_, String>(2)?,
                    r.get::<_, String>(3)?,
                    r.get::<_, i64>(4)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        let mut last: Option<String> = None;
        for (chunk_id, name, spec, body, removed) in rows {
            if last.as_deref() == Some(chunk_id.as_str()) {
                continue; // nearest version already taken
            }
            last = Some(chunk_id.clone());
            if removed == 0 {
                chunks.insert(chunk_id, ChunkRow { name, spec, body });
            }
        }
    }

    let mut placements: Vec<PlacementRow> = Vec::new();
    {
        let mut stmt = conn.prepare(
            "WITH RECURSIVE ancestry(id, depth) AS (
               SELECT ?1, 0
               UNION ALL
               SELECT c.parent_id, a.depth + 1
               FROM commits c JOIN ancestry a ON c.id = a.id
               WHERE c.parent_id IS NOT NULL
             )
             SELECT pv.chunk_id, pv.scope_id, pv.type, pv.seq, pv.active, c.rowid
             FROM placement_versions pv
             JOIN ancestry a ON a.id = pv.commit_id
             JOIN commits c ON c.id = pv.commit_id
             ORDER BY pv.chunk_id, pv.scope_id, a.depth ASC",
        )?;
        let rows = stmt
            .query_map(params![commit_id], |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, String>(2)?,
                    r.get::<_, Option<i64>>(3)?,
                    r.get::<_, i64>(4)?,
                    r.get::<_, i64>(5)?,
                ))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        let mut last: Option<(String, String)> = None;
        for (chunk_id, scope_id, type_, seq, active, commit_order) in rows {
            let key = (chunk_id.clone(), scope_id.clone());
            if last.as_ref() == Some(&key) {
                continue;
            }
            last = Some(key);
            // A placement is live only while both its endpoints are live.
            if active == 1 && chunks.contains_key(&chunk_id) && chunks.contains_key(&scope_id) {
                placements.push(PlacementRow {
                    chunk_id,
                    scope_id,
                    type_,
                    seq,
                    commit_order,
                });
            }
        }
    }

    Ok(StateAt { chunks, placements })
}

pub(crate) fn scope_at(
    conn: &Connection,
    scopes: &[ChunkId],
    opts: &ScopeOpts,
) -> Result<ScopeResult, ReadError> {
    let at = opts.at.as_ref().expect("scope_at requires at");
    let state = state_at(conn, at.as_str())?;
    let scope_ids: Vec<&str> = scopes.iter().map(|s| s.as_str()).collect();
    let exclude_ids: Vec<&str> = opts.exclude.iter().map(|s| s.as_str()).collect();

    let placed = |chunk: &str, scope: &str, type_: Option<&str>| {
        state.placements.iter().any(|p| {
            p.chunk_id == chunk
                && p.scope_id == scope
                && type_.map(|t| p.type_ == t).unwrap_or(true)
        })
    };

    let mut members: Vec<&String> = state
        .chunks
        .keys()
        .filter(|c| scope_ids.iter().all(|s| placed(c, s, None)))
        .filter(|c| !exclude_ids.iter().any(|s| placed(c, s, None)))
        .collect();

    let in_scope = members.len() as u64;
    let count_by_type = |t: &str| {
        state
            .chunks
            .keys()
            .filter(|c| scope_ids.iter().all(|s| placed(c, s, Some(t))))
            .filter(|c| !exclude_ids.iter().any(|s| placed(c, s, None)))
            .count() as u64
    };
    let (in_scope_instance, in_scope_relates) = if scope_ids.is_empty() {
        (in_scope, in_scope)
    } else {
        (count_by_type("instance"), count_by_type("relates"))
    };

    // Single-scope reads sort by that scope's seq; tail-first window when limited.
    // Equal seqs are legal — commit order breaks the tie.
    if scope_ids.len() == 1 {
        let scope = scope_ids[0];
        let position_of = |c: &str| {
            state
                .placements
                .iter()
                .find(|p| p.chunk_id == c && p.scope_id == scope)
                .map(|p| (p.seq, p.commit_order))
                .unwrap_or((None, 0))
        };
        members.sort_by(|a, b| (position_of(a), a).cmp(&(position_of(b), b)));
    } else {
        members.sort();
    }
    if let Some(limit) = opts.limit {
        let offset = opts.offset.unwrap_or(0);
        let end = members.len().saturating_sub(offset);
        let start = end.saturating_sub(limit);
        members = members[start..end].to_vec();
    }

    let chunks = if opts.include.intersection_chunks {
        members
            .iter()
            .map(|id| hydrate(&state, id, &opts.include))
            .collect()
    } else {
        Vec::new()
    };

    Ok(ScopeResult {
        head: at.clone(),
        total: state.chunks.len() as u64,
        in_scope,
        in_scope_instance,
        in_scope_relates,
        chunks,
        dimensions: Vec::new(),
        // Same rule as the current-state path, read against the state at `at`.
        unresolved: scopes
            .iter()
            .filter(|s| !state.chunks.contains_key(s.as_str()))
            .cloned()
            .collect(),
    })
}

pub(crate) fn get_at(
    conn: &Connection,
    at: &str,
    chunk_id: &str,
    include: &Includes,
) -> Result<Option<ChunkItem>, ReadError> {
    let state = state_at(conn, at)?;
    if !state.chunks.contains_key(chunk_id) {
        return Ok(None);
    }
    Ok(Some(hydrate(&state, chunk_id, include)))
}

fn hydrate(state: &StateAt, chunk_id: &str, include: &Includes) -> ChunkItem {
    let row = &state.chunks[chunk_id];
    ChunkItem {
        id: ChunkId::from(chunk_id),
        name: include.chunk_name.then(|| row.name.clone()).flatten(),
        spec: include
            .chunk_spec
            .then(|| serde_json::from_str(&row.spec).unwrap_or_default()),
        body: include
            .chunk_body
            .then(|| serde_json::from_str(&row.body).unwrap_or(serde_json::Value::Null)),
        placements: include.chunk_placements.then(|| {
            state
                .placements
                .iter()
                .filter(|p| p.chunk_id == chunk_id)
                .map(|p| Placement {
                    scope_id: ChunkId::from(p.scope_id.as_str()),
                    type_: PlacementType::parse(&p.type_).unwrap_or(PlacementType::Relates),
                    seq: p.seq,
                })
                .collect()
        }),
    }
}
