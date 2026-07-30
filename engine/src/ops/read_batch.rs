use crate::engine::Engine;
use crate::errors::EngineError;
use crate::types::{BatchEntry, BatchResult, Context, ReadTarget, TaggedRead};
use db::{ChunkId, Includes, ScopeOpts};
use std::collections::HashMap;

/// Retries before conceding the snapshot is unstable under sustained writes.
const SNAPSHOT_ATTEMPTS: usize = 5;

impl Engine {
    /// Multiple tagged sub-queries resolved together at one commit snapshot,
    /// each authorized under its own identity (engine.md, read_batch; the
    /// per-tag ctx override is the multiplexed-transport seam). Snapshot
    /// coherence is achieved by verifying the active head is unchanged across
    /// the batch and retrying otherwise — mounts are static within a session,
    /// so only the active project can move.
    pub fn read_batch(
        &self,
        ctx: &Context,
        reads: &[TaggedRead],
    ) -> Result<BatchResult, EngineError> {
        for _ in 0..SNAPSHOT_ATTEMPTS {
            let before = self.active_head()?;
            let results = self.resolve_reads(ctx, reads);
            let after = self.active_head()?;
            if before == after {
                return Ok(BatchResult {
                    head: after,
                    results,
                });
            }
        }
        Err(EngineError::Db(
            "read_batch could not observe a stable snapshot".into(),
        ))
    }

    fn resolve_reads(&self, ctx: &Context, reads: &[TaggedRead]) -> HashMap<String, BatchEntry> {
        let mut results = HashMap::new();
        for read in reads {
            let identity = read.ctx.as_ref().unwrap_or(ctx);
            let entry = match &read.target {
                ReadTarget::Scope { scopes, opts } => self
                    .scope(identity, scopes, opts.clone())
                    .map(BatchEntry::Scope),
                ReadTarget::Get { chunk_id, opts } => self
                    .get(identity, chunk_id, opts.clone())
                    .map(BatchEntry::Get),
            };
            results.insert(
                read.tag.clone(),
                entry.unwrap_or_else(BatchEntry::Err),
            );
        }
        results
    }

    fn active_head(&self) -> Result<db::CommitId, EngineError> {
        let active = self.inner.mounts.active()?;
        let opts = ScopeOpts {
            branch: active.branch.clone(),
            include: Includes::default(),
            ..ScopeOpts::default()
        };
        Ok(active.db.scope(&[] as &[ChunkId], opts)?.head)
    }
}
