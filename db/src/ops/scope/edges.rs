use crate::errors::ReadError;
use crate::types::{ChunkId, Dim, Edge, ScopeOpts};
use rusqlite::types::Value;
use rusqlite::Connection;
use std::collections::BTreeMap;

/// Scopes reachable from each dim beyond current adjacency. Empty input scope
/// means every dim is already adjacent — edges are empty in that case.
pub(crate) fn attach(
    conn: &Connection,
    scopes: &[ChunkId],
    opts: &ScopeOpts,
    dims: &mut [Dim],
) -> Result<(), ReadError> {
    for dim in dims.iter_mut() {
        dim.edges = Some(Vec::new());
    }
    if scopes.is_empty() || dims.is_empty() {
        return Ok(());
    }

    let dim_marks = vec!["?"; dims.len()].join(", ");
    let scope_marks = vec!["?"; scopes.len()].join(", ");
    let sql = format!(
        "SELECT
           cm1.scope_id AS from_dim,
           cm2.scope_id AS to_dim,
           ec.name,
           COUNT(*) FILTER (WHERE cm2.type = 'instance') AS instance_count,
           COUNT(*) FILTER (WHERE cm2.type = 'relates')  AS relates_count,
           COUNT(*) AS total
         FROM current_placements cm1
         JOIN current_placements cm2
           ON cm1.chunk_id = cm2.chunk_id AND cm2.branch = cm1.branch
         LEFT JOIN current_chunks ec ON ec.chunk_id = cm2.scope_id AND ec.branch = cm1.branch
         WHERE cm1.branch = ?
           AND cm1.scope_id IN ({dim_marks})
           AND cm2.scope_id NOT IN ({scope_marks})
           AND cm2.scope_id NOT IN ({dim_marks})
           AND cm1.scope_id != cm2.scope_id
         GROUP BY cm1.scope_id, cm2.scope_id
         ORDER BY total DESC"
    );

    let mut params: Vec<Value> = vec![Value::from(opts.branch.as_str().to_string())];
    for d in dims.iter() {
        params.push(Value::from(d.id.as_str().to_string()));
    }
    for s in scopes {
        params.push(Value::from(s.as_str().to_string()));
    }
    for d in dims.iter() {
        params.push(Value::from(d.id.as_str().to_string()));
    }

    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt
        .query_map(rusqlite::params_from_iter(params), |r| {
            Ok((
                r.get::<_, String>(0)?,
                Edge {
                    id: ChunkId(r.get::<_, String>(1)?),
                    name: r.get(2)?,
                    instance: r.get(3)?,
                    relates: r.get(4)?,
                    count: r.get(5)?,
                },
            ))
        })?
        .collect::<Result<Vec<_>, _>>()?;

    let mut by_dim: BTreeMap<String, Vec<Edge>> = BTreeMap::new();
    for (from_dim, edge) in rows {
        by_dim.entry(from_dim).or_default().push(edge);
    }
    for dim in dims.iter_mut() {
        if let Some(edges) = by_dim.remove(dim.id.as_str()) {
            dim.edges = Some(edges);
        }
    }
    Ok(())
}
