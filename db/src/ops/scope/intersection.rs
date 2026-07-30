use crate::errors::ReadError;
use crate::types::{ChunkId, ChunkItem, CommitId, Placement, PlacementType, ScopeOpts, ScopeResult};
use crate::validate;
use rusqlite::types::Value;
use rusqlite::{params, Connection, OptionalExtension};

/// Commit order of the placement's current version. Duplicate explicit seqs are
/// legal, so ordered reads need a tie-break: `commits.rowid` is the insertion
/// sequence, which separates commits landing within the same clock millisecond
/// (ULID ids and ISO timestamps do not).
const PLACEMENT_COMMIT: &str = "(SELECT MAX(c.rowid) FROM placement_versions pv
              JOIN commits c ON c.id = pv.commit_id
              WHERE pv.chunk_id = ord.chunk_id AND pv.scope_id = ord.scope_id)";

pub(crate) fn run(
    conn: &Connection,
    scopes: &[ChunkId],
    opts: &ScopeOpts,
) -> Result<ScopeResult, ReadError> {
    let branch = opts.branch.as_str();
    let head: String = conn
        .query_row(
            "SELECT head FROM branches WHERE name = ?1",
            params![branch],
            |r| r.get(0),
        )
        .optional()?
        .ok_or(ReadError::NotFound {
            kind: "branch",
            id: branch.to_string(),
        })?;

    let total: u64 = conn.query_row(
        "SELECT COUNT(*) FROM current_chunks WHERE branch = ?1",
        params![branch],
        |r| r.get(0),
    )?;

    let in_scope = count(conn, scopes, opts, None)?;
    let (in_scope_instance, in_scope_relates) = if scopes.is_empty() {
        // Empty scope: the empty conjunction holds for both placement types.
        (in_scope, in_scope)
    } else {
        (
            count(conn, scopes, opts, Some("instance"))?,
            count(conn, scopes, opts, Some("relates"))?,
        )
    };

    let chunks = if opts.include.intersection_chunks {
        fetch_chunks(conn, scopes, opts)?
    } else {
        Vec::new()
    };

    Ok(ScopeResult {
        head: CommitId(head),
        total,
        in_scope,
        in_scope_instance,
        in_scope_relates,
        chunks,
        dimensions: Vec::new(),
        unresolved: unresolved_roots(conn, scopes, branch)?,
    })
}

/// Roots that resolve to no chunk in current state. Reported, never raised: the
/// read composes over the roots that do resolve, and the dead ones say so.
fn unresolved_roots(
    conn: &Connection,
    scopes: &[ChunkId],
    branch: &str,
) -> Result<Vec<ChunkId>, ReadError> {
    let mut stmt =
        conn.prepare("SELECT 1 FROM current_chunks WHERE chunk_id = ?1 AND branch = ?2")?;
    let dead = scopes
        .iter()
        .map(|scope| {
            let present: Option<i64> = stmt
                .query_row(params![scope.as_str(), branch], |r| r.get(0))
                .optional()?;
            Ok(present.is_none().then(|| scope.clone()))
        })
        .collect::<Result<Vec<_>, ReadError>>()?;
    Ok(dead.into_iter().flatten().collect())
}

/// WHERE clause over current_chunks cc shared by counts and the chunk fetch.
pub(crate) fn build_where(
    scopes: &[ChunkId],
    opts: &ScopeOpts,
    type_filter: Option<&str>,
) -> (String, Vec<Value>) {
    let mut sql = String::from("cc.branch = ?");
    let mut params: Vec<Value> = vec![Value::from(opts.branch.as_str().to_string())];

    if !scopes.is_empty() {
        let marks = vec!["?"; scopes.len()].join(", ");
        let type_clause = match type_filter {
            Some(_) => " AND cp.type = ?",
            None => "",
        };
        sql.push_str(&format!(
            " AND cc.chunk_id IN (
               SELECT cp.chunk_id FROM current_placements cp
               WHERE cp.branch = ? AND cp.scope_id IN ({marks}){type_clause}
               GROUP BY cp.chunk_id
               HAVING COUNT(DISTINCT cp.scope_id) = ?)"
        ));
        params.push(Value::from(opts.branch.as_str().to_string()));
        for s in scopes {
            params.push(Value::from(s.as_str().to_string()));
        }
        if let Some(t) = type_filter {
            params.push(Value::from(t.to_string()));
        }
        params.push(Value::from(scopes.len() as i64));
    }

    if !opts.exclude.is_empty() {
        let marks = vec!["?"; opts.exclude.len()].join(", ");
        sql.push_str(&format!(
            " AND cc.chunk_id NOT IN (
               SELECT chunk_id FROM current_placements
               WHERE branch = ? AND scope_id IN ({marks}))"
        ));
        params.push(Value::from(opts.branch.as_str().to_string()));
        for s in &opts.exclude {
            params.push(Value::from(s.as_str().to_string()));
        }
    }

    if let Some(query) = &opts.match_ {
        sql.push_str(" AND cc.rowid IN (SELECT rowid FROM chunk_fts WHERE chunk_fts MATCH ?)");
        params.push(Value::from(query.clone()));
    }

    (sql, params)
}

fn count(
    conn: &Connection,
    scopes: &[ChunkId],
    opts: &ScopeOpts,
    type_filter: Option<&str>,
) -> Result<u64, ReadError> {
    let (where_sql, params) = build_where(scopes, opts, type_filter);
    let sql = format!("SELECT COUNT(*) FROM current_chunks cc WHERE {where_sql}");
    let n: u64 = conn.query_row(&sql, rusqlite::params_from_iter(params), |r| r.get(0))?;
    Ok(n)
}

fn fetch_chunks(
    conn: &Connection,
    scopes: &[ChunkId],
    opts: &ScopeOpts,
) -> Result<Vec<ChunkItem>, ReadError> {
    let ordered = scopes.len() == 1
        && validate::effective_contract(conn, opts.branch.as_str(), scopes[0].as_str())?.ordered;

    let (where_sql, mut params) = build_where(scopes, opts, None);
    let limit = opts.limit.map(|l| l as i64).unwrap_or(-1);
    let offset = opts.offset.unwrap_or(0) as i64;

    let sql = if ordered {
        // Tail-first: latest entries by default, offset pages backward.
        // DESC + reverse keeps the returned window in ascending seq order.
        params.insert(
            0,
            Value::from(scopes[0].as_str().to_string()),
        );
        format!(
            "SELECT cc.chunk_id, cc.name, cc.spec, cc.body
             FROM current_chunks cc
             JOIN current_placements ord
               ON ord.chunk_id = cc.chunk_id AND ord.branch = cc.branch AND ord.scope_id = ?
             WHERE {where_sql}
             ORDER BY ord.seq DESC, {PLACEMENT_COMMIT} DESC
             LIMIT {limit} OFFSET {offset}"
        )
    } else {
        format!(
            "SELECT cc.chunk_id, cc.name, cc.spec, cc.body
             FROM current_chunks cc
             WHERE {where_sql}
             ORDER BY cc.chunk_id
             LIMIT {limit} OFFSET {offset}"
        )
    };

    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt
        .query_map(rusqlite::params_from_iter(params), |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, Option<String>>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, String>(3)?,
            ))
        })?
        .collect::<Result<Vec<_>, _>>()?;

    let mut items = rows
        .into_iter()
        .map(|(id, name, spec, body)| {
            let placements = if opts.include.chunk_placements {
                Some(load_placements(conn, opts.branch.as_str(), &id)?)
            } else {
                None
            };
            Ok(ChunkItem {
                id: ChunkId(id),
                name: opts.include.chunk_name.then_some(name).flatten(),
                spec: opts
                    .include
                    .chunk_spec
                    .then(|| serde_json::from_str(&spec).unwrap_or_default()),
                body: opts
                    .include
                    .chunk_body
                    .then(|| serde_json::from_str(&body).unwrap_or(serde_json::Value::Null)),
                placements,
            })
        })
        .collect::<Result<Vec<_>, ReadError>>()?;

    if ordered {
        items.reverse();
    }
    Ok(items)
}

pub(crate) fn load_placements(
    conn: &Connection,
    branch: &str,
    chunk_id: &str,
) -> Result<Vec<Placement>, ReadError> {
    let mut stmt = conn.prepare(
        "SELECT scope_id, type, seq FROM current_placements
         WHERE chunk_id = ?1 AND branch = ?2
         ORDER BY scope_id",
    )?;
    let rows = stmt
        .query_map(params![chunk_id, branch], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, Option<i64>>(2)?,
            ))
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows
        .into_iter()
        .map(|(scope_id, type_, seq)| Placement {
            scope_id: ChunkId(scope_id),
            type_: PlacementType::parse(&type_).unwrap_or(PlacementType::Relates),
            seq,
        })
        .collect())
}
