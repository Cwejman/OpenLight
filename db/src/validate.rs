use crate::errors::{RuleKind, WriteError};
use crate::types::{ChunkId, Spec};
use rusqlite::{params, Connection, OptionalExtension};
use std::collections::BTreeSet;

/// The effective contract for chunks placed `instance` on a scope: the union of
/// the scope's own non-propagating spec and the propagating spec of every
/// archetype the scope is transitively instance of (substrate.md, Spec validation).
pub(crate) struct Contract {
    pub ordered: bool,
    pub required: BTreeSet<String>,
    pub unique: BTreeSet<String>,
    /// Whether any composed spec declared `accepts` at all.
    pub accepts_declared: bool,
    /// Resolved type chunk ids — each part's names resolved within its own scope.
    pub accepts: BTreeSet<String>,
}

pub(crate) fn effective_contract(
    conn: &Connection,
    branch: &str,
    scope_id: &str,
) -> Result<Contract, rusqlite::Error> {
    let mut contract = Contract {
        ordered: false,
        required: BTreeSet::new(),
        unique: BTreeSet::new(),
        accepts_declared: false,
        accepts: BTreeSet::new(),
    };
    if let Some(own) = load_spec(conn, branch, scope_id)? {
        if !own.propagate && !own.is_empty() {
            fold(conn, branch, scope_id, &own, &mut contract)?;
        }
    }
    for ancestor in instance_ancestors(conn, branch, scope_id)? {
        if let Some(spec) = load_spec(conn, branch, &ancestor)? {
            if spec.propagate {
                fold(conn, branch, &ancestor, &spec, &mut contract)?;
            }
        }
    }
    Ok(contract)
}

fn fold(
    conn: &Connection,
    branch: &str,
    resolution_scope: &str,
    spec: &Spec,
    contract: &mut Contract,
) -> Result<(), rusqlite::Error> {
    contract.ordered |= spec.ordered;
    contract.required.extend(spec.required.iter().cloned());
    contract.unique.extend(spec.unique.iter().cloned());
    if !spec.accepts.is_empty() {
        contract.accepts_declared = true;
        for name in &spec.accepts {
            for id in resolve_name(conn, branch, resolution_scope, name)? {
                contract.accepts.insert(id);
            }
        }
    }
    Ok(())
}

fn load_spec(
    conn: &Connection,
    branch: &str,
    chunk_id: &str,
) -> Result<Option<Spec>, rusqlite::Error> {
    let raw: Option<String> = conn
        .query_row(
            "SELECT spec FROM current_chunks WHERE chunk_id = ?1 AND branch = ?2",
            params![chunk_id, branch],
            |r| r.get(0),
        )
        .optional()?;
    Ok(raw.map(|s| serde_json::from_str(&s).unwrap_or_default()))
}

/// Scopes the chunk is transitively `instance` of.
fn instance_ancestors(
    conn: &Connection,
    branch: &str,
    chunk_id: &str,
) -> Result<Vec<String>, rusqlite::Error> {
    let mut seen: BTreeSet<String> = BTreeSet::new();
    let mut frontier = vec![chunk_id.to_string()];
    let mut out = Vec::new();
    let mut stmt = conn.prepare(
        "SELECT scope_id FROM current_placements
         WHERE chunk_id = ?1 AND branch = ?2 AND type = 'instance'",
    )?;
    while let Some(current) = frontier.pop() {
        let parents = stmt
            .query_map(params![current, branch], |r| r.get::<_, String>(0))?
            .collect::<Result<Vec<_>, _>>()?;
        for parent in parents {
            if seen.insert(parent.clone()) {
                out.push(parent.clone());
                frontier.push(parent);
            }
        }
    }
    Ok(out)
}

/// Chunks named `name` placed on `scope_id` — any placement type: type
/// definitions are relates-placed and must stay resolvable (substrate.md, Archetypes).
fn resolve_name(
    conn: &Connection,
    branch: &str,
    scope_id: &str,
    name: &str,
) -> Result<Vec<String>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT cp.chunk_id FROM current_placements cp
         JOIN current_chunks cc ON cc.chunk_id = cp.chunk_id AND cc.branch = cp.branch
         WHERE cp.scope_id = ?1 AND cp.branch = ?2 AND cc.name = ?3",
    )?;
    let ids = stmt
        .query_map(params![scope_id, branch, name], |r| r.get::<_, String>(0))?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(ids)
}

/// Validate every touched chunk against the post-write current state.
/// Reads run through the open transaction's view, not a pre-fetched snapshot.
pub(crate) fn check_commit(
    conn: &Connection,
    branch: &str,
    touched: &BTreeSet<String>,
) -> Result<(), WriteError> {
    for chunk_id in touched {
        let row: Option<(Option<String>, String)> = conn
            .query_row(
                "SELECT name, body FROM current_chunks WHERE chunk_id = ?1 AND branch = ?2",
                params![chunk_id, branch],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .optional()?;
        let Some((name, body_raw)) = row else {
            continue; // removed in this declaration — nothing to hold to a contract
        };
        let body: serde_json::Value =
            serde_json::from_str(&body_raw).unwrap_or(serde_json::Value::Null);

        let placements: Vec<(String, String, Option<i64>)> = {
            let mut stmt = conn.prepare(
                "SELECT scope_id, type, seq FROM current_placements
                 WHERE chunk_id = ?1 AND branch = ?2",
            )?;
            let rows = stmt
                .query_map(params![chunk_id, branch], |r| {
                    Ok((r.get(0)?, r.get(1)?, r.get(2)?))
                })?
                .collect::<Result<Vec<_>, _>>()?;
            rows
        };
        let instance_scopes: BTreeSet<String> = placements
            .iter()
            .filter(|(_, t, _)| t == "instance")
            .map(|(s, _, _)| s.clone())
            .collect();

        for (scope_id, type_, seq) in &placements {
            if type_ != "instance" {
                continue;
            }
            check_name_unique(conn, branch, scope_id, chunk_id, name.as_deref())?;
            let contract = effective_contract(conn, branch, scope_id)?;
            if contract.ordered && seq.is_none() {
                return Err(violation(scope_id, RuleKind::Ordered));
            }
            if contract.accepts_declared {
                let memberships = instance_scopes.intersection(&contract.accepts).count();
                if memberships == 0 {
                    return Err(violation(scope_id, RuleKind::Accepts));
                }
                if memberships >= 2 {
                    return Err(violation(scope_id, RuleKind::AmbiguousType));
                }
            }
            for key in &contract.required {
                if body.get(key).is_none() {
                    return Err(violation(scope_id, RuleKind::Required));
                }
            }
            for key in &contract.unique {
                if let Some(value) = body.get(key) {
                    check_unique_value(conn, branch, scope_id, chunk_id, key, value)?;
                }
            }
        }
    }
    Ok(())
}

fn violation(scope_id: &str, kind: RuleKind) -> WriteError {
    WriteError::Validation {
        scope_id: ChunkId::from(scope_id),
        kind,
    }
}

fn check_name_unique(
    conn: &Connection,
    branch: &str,
    scope_id: &str,
    chunk_id: &str,
    name: Option<&str>,
) -> Result<(), WriteError> {
    let Some(name) = name else { return Ok(()) };
    let collision: Option<String> = conn
        .query_row(
            "SELECT cp.chunk_id FROM current_placements cp
             JOIN current_chunks cc ON cc.chunk_id = cp.chunk_id AND cc.branch = cp.branch
             WHERE cp.scope_id = ?1 AND cp.branch = ?2 AND cp.type = 'instance'
               AND cc.name = ?3 AND cp.chunk_id != ?4
             LIMIT 1",
            params![scope_id, branch, name, chunk_id],
            |r| r.get(0),
        )
        .optional()?;
    match collision {
        Some(_) => Err(WriteError::NameCollision {
            scope_id: ChunkId::from(scope_id),
            name: name.to_string(),
        }),
        None => Ok(()),
    }
}

fn check_unique_value(
    conn: &Connection,
    branch: &str,
    scope_id: &str,
    chunk_id: &str,
    key: &str,
    value: &serde_json::Value,
) -> Result<(), WriteError> {
    let mut stmt = conn.prepare(
        "SELECT cc.body FROM current_placements cp
         JOIN current_chunks cc ON cc.chunk_id = cp.chunk_id AND cc.branch = cp.branch
         WHERE cp.scope_id = ?1 AND cp.branch = ?2 AND cp.type = 'instance'
           AND cp.chunk_id != ?3",
    )?;
    let bodies = stmt
        .query_map(params![scope_id, branch, chunk_id], |r| {
            r.get::<_, String>(0)
        })?
        .collect::<Result<Vec<_>, _>>()?;
    for raw in bodies {
        let other: serde_json::Value = serde_json::from_str(&raw).unwrap_or(serde_json::Value::Null);
        if other.get(key) == Some(value) {
            return Err(violation(scope_id, RuleKind::Unique));
        }
    }
    Ok(())
}
