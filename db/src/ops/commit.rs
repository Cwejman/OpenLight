use crate::db::Db;
use crate::errors::WriteError;
use crate::types::{ChunkId, Commit, CommitOpts, CommitId, Declaration, PlacementType};
use crate::validate;
use crate::virtual_chunks::is_virtual;
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use std::collections::BTreeSet;

impl Db {
    pub fn commit(
        &self,
        declaration: &Declaration,
        opts: CommitOpts,
    ) -> Result<Commit, WriteError> {
        self.require_writable()?;
        reject_virtual_targets(declaration)?;

        let branch = opts.branch.as_str().to_string();
        let mut guard = self.conn.lock().unwrap();
        let tx = guard.transaction_with_behavior(TransactionBehavior::Immediate)?;

        let parent: String = tx
            .query_row(
                "SELECT head FROM branches WHERE name = ?1",
                params![branch],
                |r| r.get(0),
            )
            .optional()?
            .ok_or(WriteError::NotFound {
                kind: "branch",
                id: branch.clone(),
            })?;

        let commit_id = crate::id::new_id();
        tx.execute(
            "INSERT INTO commits (id, parent_id, timestamp, message, process_id)
             VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ?3, ?4)",
            params![commit_id, parent, declaration.message, opts.process_id],
        )?;
        let timestamp: String = tx.query_row(
            "SELECT timestamp FROM commits WHERE id = ?1",
            params![commit_id],
            |r| r.get(0),
        )?;

        let mut touched: BTreeSet<String> = BTreeSet::new();
        let mut chunks_modified: Vec<ChunkId> = Vec::new();
        let mut placements_modified: Vec<(ChunkId, ChunkId)> = Vec::new();

        for chunk in &declaration.chunks {
            let id = chunk
                .id
                .as_ref()
                .map(|c| c.as_str().to_string())
                .unwrap_or_else(crate::id::new_id);
            let spec_json = match &chunk.spec {
                Some(s) => serde_json::to_string(s).expect("spec serializes"),
                None => "{}".to_string(),
            };
            let body_json = match &chunk.body {
                Some(b) => b.to_string(),
                None => "{}".to_string(),
            };
            tx.execute(
                "INSERT INTO chunk_versions (chunk_id, commit_id, name, spec, body, removed)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![id, commit_id, chunk.name, spec_json, body_json, chunk.removed as i64],
            )?;
            if chunk.removed {
                apply_removal(&tx, &branch, &id, &mut placements_modified)?;
            } else {
                tx.execute(
                    "INSERT INTO current_chunks (chunk_id, branch, name, spec, body)
                     VALUES (?1, ?2, ?3, ?4, ?5)
                     ON CONFLICT(chunk_id, branch)
                     DO UPDATE SET name = excluded.name, spec = excluded.spec, body = excluded.body",
                    params![id, branch, chunk.name, spec_json, body_json],
                )?;
            }
            touched.insert(id.clone());
            chunks_modified.push(ChunkId(id));
        }

        // Neither side of a placement has to be resident here: chunk ids are
        // globally unique, so a placement may reference a chunk another db owns
        // (substrate.md, Peers). Validation binds where the referenced chunk IS
        // resident; a dangling reference surfaces at use time, as an unresolved
        // root on a scope read.
        for placement in &declaration.placements {
            let chunk_id = placement.chunk.as_str();
            let scope_id = placement.scope.as_str();

            let mut seq = placement.seq;
            if placement.active && placement.type_ == PlacementType::Instance && seq.is_none() {
                let contract = validate::effective_contract(&tx, &branch, scope_id)?;
                if contract.ordered {
                    // Evaluated as each placement is applied, so multiple appends in one
                    // declaration see each other's just-applied rows.
                    let next: i64 = tx.query_row(
                        "SELECT COALESCE(MAX(seq), 0) + 1 FROM current_placements
                         WHERE scope_id = ?1 AND branch = ?2",
                        params![scope_id, branch],
                        |r| r.get(0),
                    )?;
                    seq = Some(next);
                }
            }

            tx.execute(
                "INSERT INTO placement_versions (chunk_id, scope_id, commit_id, type, seq, active)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    chunk_id,
                    scope_id,
                    commit_id,
                    placement.type_.as_str(),
                    seq,
                    placement.active as i64
                ],
            )?;
            if placement.active {
                tx.execute(
                    "INSERT INTO current_placements (chunk_id, scope_id, branch, type, seq)
                     VALUES (?1, ?2, ?3, ?4, ?5)
                     ON CONFLICT(chunk_id, scope_id, branch)
                     DO UPDATE SET type = excluded.type, seq = excluded.seq",
                    params![chunk_id, scope_id, branch, placement.type_.as_str(), seq],
                )?;
            } else {
                tx.execute(
                    "DELETE FROM current_placements
                     WHERE chunk_id = ?1 AND scope_id = ?2 AND branch = ?3",
                    params![chunk_id, scope_id, branch],
                )?;
            }
            touched.insert(chunk_id.to_string());
            placements_modified.push((placement.chunk.clone(), placement.scope.clone()));
        }

        validate::check_commit(&tx, &branch, &touched)?;

        tx.execute(
            "UPDATE branches SET head = ?1 WHERE name = ?2",
            params![commit_id, branch],
        )?;
        tx.commit()?;
        drop(guard);

        let commit = Commit {
            id: CommitId(commit_id),
            parent_id: Some(CommitId(parent)),
            timestamp,
            message: declaration.message.clone(),
            process_id: opts.process_id,
            branch: opts.branch,
            chunks_modified,
            placements_modified,
        };
        // The SQL commit is durable before subscribers can see the change.
        let _ = self.sender.send(commit.clone());
        Ok(commit)
    }
}

fn reject_virtual_targets(declaration: &Declaration) -> Result<(), WriteError> {
    for chunk in &declaration.chunks {
        if let Some(id) = &chunk.id {
            if is_virtual(id.as_str()) {
                return Err(WriteError::WriteToVirtualChunk { id: id.clone() });
            }
        }
    }
    for placement in &declaration.placements {
        for id in [&placement.chunk, &placement.scope] {
            if is_virtual(id.as_str()) {
                return Err(WriteError::WriteToVirtualChunk { id: id.clone() });
            }
        }
    }
    Ok(())
}

/// Removal names a chunk that must be here to remove — unlike a placement side,
/// which may reference a chunk this db does not hold.
fn require_current(conn: &Connection, branch: &str, chunk_id: &str) -> Result<(), WriteError> {
    let present: Option<i64> = conn
        .query_row(
            "SELECT 1 FROM current_chunks WHERE chunk_id = ?1 AND branch = ?2",
            params![chunk_id, branch],
            |r| r.get(0),
        )
        .optional()?;
    match present {
        Some(_) => Ok(()),
        None => Err(WriteError::NotFound {
            kind: "chunk",
            id: chunk_id.to_string(),
        }),
    }
}

/// Logical removal: the chunk leaves current state, and so does every placement
/// involving it — as the placed chunk or as the scope. Version rows stay intact.
fn apply_removal(
    conn: &Connection,
    branch: &str,
    chunk_id: &str,
    placements_modified: &mut Vec<(ChunkId, ChunkId)>,
) -> Result<(), WriteError> {
    require_current(conn, branch, chunk_id)?;
    let severed: Vec<(String, String)> = {
        let mut stmt = conn.prepare(
            "SELECT chunk_id, scope_id FROM current_placements
             WHERE (chunk_id = ?1 OR scope_id = ?1) AND branch = ?2",
        )?;
        let rows = stmt
            .query_map(params![chunk_id, branch], |r| {
                Ok((r.get(0)?, r.get(1)?))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };
    for (c, s) in &severed {
        placements_modified.push((ChunkId::from(c.as_str()), ChunkId::from(s.as_str())));
    }
    conn.execute(
        "DELETE FROM current_placements
         WHERE (chunk_id = ?1 OR scope_id = ?1) AND branch = ?2",
        params![chunk_id, branch],
    )?;
    conn.execute(
        "DELETE FROM current_chunks WHERE chunk_id = ?1 AND branch = ?2",
        params![chunk_id, branch],
    )?;
    Ok(())
}
