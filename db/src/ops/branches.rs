use crate::db::Db;
use crate::errors::{ReadError, WriteError};
use crate::ops::scope::time_travel;
use crate::types::{Branch, BranchName, Commit, CommitId};
use rusqlite::{params, OptionalExtension, TransactionBehavior};

impl Db {
    /// A new branch pointer at an existing commit. Current-state tables are
    /// materialized for the new branch from the version walk at `from` —
    /// reads on the branch work immediately (db.md leaves this implicit).
    pub fn create_branch(&self, name: &str, from: CommitId) -> Result<Branch, WriteError> {
        self.require_writable()?;
        let mut guard = self.conn.lock().unwrap();
        let tx = guard.transaction_with_behavior(TransactionBehavior::Immediate)?;

        let exists: Option<i64> = tx
            .query_row(
                "SELECT 1 FROM commits WHERE id = ?1",
                params![from.as_str()],
                |r| r.get(0),
            )
            .optional()?;
        if exists.is_none() {
            return Err(WriteError::NotFound {
                kind: "commit",
                id: from.as_str().to_string(),
            });
        }
        let taken: Option<i64> = tx
            .query_row(
                "SELECT 1 FROM branches WHERE name = ?1",
                params![name],
                |r| r.get(0),
            )
            .optional()?;
        if taken.is_some() {
            return Err(WriteError::MalformedDeclaration(format!(
                "branch already exists: {name}"
            )));
        }

        tx.execute(
            "INSERT INTO branches (name, head) VALUES (?1, ?2)",
            params![name, from.as_str()],
        )?;

        let state = time_travel::state_at(&tx, from.as_str()).map_err(read_to_write)?;
        for (chunk_id, row) in &state.chunks {
            tx.execute(
                "INSERT INTO current_chunks (chunk_id, branch, name, spec, body)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![chunk_id, name, row.name, row.spec, row.body],
            )?;
        }
        for p in &state.placements {
            tx.execute(
                "INSERT INTO current_placements (chunk_id, scope_id, branch, type, seq)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![p.chunk_id, p.scope_id, name, p.type_, p.seq],
            )?;
        }
        tx.commit()?;
        drop(guard);

        let branch = Branch {
            name: BranchName::from(name),
            head: from.clone(),
        };
        let _ = self.sender.send(branch_event(name, Some(from), "create"));
        Ok(branch)
    }

    /// Removes the pointer; commits remain (lossless). Current-state rows for
    /// the branch are dropped with it.
    pub fn delete_branch(&self, name: &str) -> Result<(), WriteError> {
        self.require_writable()?;
        let mut guard = self.conn.lock().unwrap();
        let tx = guard.transaction_with_behavior(TransactionBehavior::Immediate)?;

        let head: Option<String> = tx
            .query_row(
                "SELECT head FROM branches WHERE name = ?1",
                params![name],
                |r| r.get(0),
            )
            .optional()?;
        if head.is_none() {
            return Err(WriteError::NotFound {
                kind: "branch",
                id: name.to_string(),
            });
        }
        tx.execute(
            "DELETE FROM current_placements WHERE branch = ?1",
            params![name],
        )?;
        tx.execute(
            "DELETE FROM current_chunks WHERE branch = ?1",
            params![name],
        )?;
        tx.execute("DELETE FROM branches WHERE name = ?1", params![name])?;
        tx.commit()?;
        drop(guard);

        let _ = self
            .sender
            .send(branch_event(name, head.map(CommitId), "delete"));
        Ok(())
    }
}

fn read_to_write(e: ReadError) -> WriteError {
    match e {
        ReadError::NotFound { kind, id } => WriteError::NotFound { kind, id },
        ReadError::Io(e) => WriteError::Io(e),
    }
}

/// Branch-graph mutations surface on the change stream alongside commits.
/// No commit row is written (branch-meta commits are an open in db.md).
fn branch_event(name: &str, at: Option<CommitId>, verb: &str) -> Commit {
    Commit {
        id: CommitId(crate::id::new_id()),
        parent_id: at,
        timestamp: String::new(),
        message: Some(format!("branch: {verb} {name}")),
        process_id: None,
        branch: BranchName::from(name),
        chunks_modified: Vec::new(),
        placements_modified: Vec::new(),
    }
}
