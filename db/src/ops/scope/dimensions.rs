use crate::errors::ReadError;
use crate::types::{ChunkId, Dim, ScopeOpts};
use rusqlite::types::Value;
use rusqlite::Connection;

pub(crate) fn run(
    conn: &Connection,
    scopes: &[ChunkId],
    opts: &ScopeOpts,
) -> Result<Vec<Dim>, ReadError> {
    let branch = opts.branch.as_str().to_string();
    let (in_scope_sql, mut params): (String, Vec<Value>) = if scopes.is_empty() {
        (
            "SELECT chunk_id FROM current_chunks WHERE branch = ?".to_string(),
            vec![Value::from(branch.clone())],
        )
    } else {
        let marks = vec!["?"; scopes.len()].join(", ");
        let mut p: Vec<Value> = vec![Value::from(branch.clone())];
        for s in scopes {
            p.push(Value::from(s.as_str().to_string()));
        }
        p.push(Value::from(scopes.len() as i64));
        (
            format!(
                "SELECT cp.chunk_id FROM current_placements cp
                 WHERE cp.branch = ? AND cp.scope_id IN ({marks})
                 GROUP BY cp.chunk_id
                 HAVING COUNT(DISTINCT cp.scope_id) = ?"
            ),
            p,
        )
    };

    let sql = format!(
        "WITH in_scope AS ({in_scope_sql})
         SELECT
           cp.scope_id,
           dc.name,
           COUNT(*) FILTER (WHERE cp.type = 'instance') AS instance_count,
           COUNT(*) FILTER (WHERE cp.type = 'relates')  AS relates_count,
           COUNT(*) AS total
         FROM current_placements cp
         JOIN in_scope ON in_scope.chunk_id = cp.chunk_id
         LEFT JOIN current_chunks dc ON dc.chunk_id = cp.scope_id AND dc.branch = cp.branch
         WHERE cp.branch = ?
         GROUP BY cp.scope_id
         ORDER BY total DESC"
    );
    params.push(Value::from(branch));

    let mut stmt = conn.prepare(&sql)?;
    let dims = stmt
        .query_map(rusqlite::params_from_iter(params), |r| {
            Ok(Dim {
                id: ChunkId(r.get::<_, String>(0)?),
                name: r.get(1)?,
                instance: r.get(2)?,
                relates: r.get(3)?,
                count: r.get(4)?,
                edges: None,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(dims)
}
