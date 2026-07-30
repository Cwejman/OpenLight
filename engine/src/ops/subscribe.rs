use crate::boundary;
use crate::engine::Engine;
use crate::errors::EngineError;
use crate::subscription::Subscription;
use crate::types::{Context, SubscriptionId};
use db::ChunkId;

impl Engine {
    /// Register on a set of scopes. Boundaries are checked only at subscribe
    /// time — process boundaries are immutable for the run (engine.md,
    /// Subscription lifecycle). Requires a process context: event delivery
    /// rides the process's transport; engine.md defines no host-side delivery
    /// channel in v0.1 (recorded gap).
    pub fn subscribe(
        &self,
        ctx: &Context,
        scopes: &[ChunkId],
    ) -> Result<SubscriptionId, EngineError> {
        let inner = &self.inner;
        let bctx = inner.resolve_boundaries(ctx)?;
        let pid = bctx.process.clone().ok_or_else(|| {
            EngineError::InvalidRequest("subscribe requires a process context".into())
        })?;
        let branch = inner.mounts.active()?.branch;
        for scope in scopes {
            if !boundary::can_open(&inner.mounts, &bctx.read, Some(&pid), scope, &branch)? {
                return Err(EngineError::BoundaryViolation(format!(
                    "scope {scope} is not reachable from the read boundary"
                )));
            }
        }
        let transport = inner
            .slot_transport(&pid)
            .ok_or_else(|| EngineError::NotFound(format!("process {pid} has no transport")))?;
        let id = SubscriptionId(ulid::Ulid::new().to_string());
        inner.subscriptions.insert(Subscription {
            id: id.clone(),
            process: pid,
            scopes: scopes.to_vec(),
            transport,
        });
        Ok(id)
    }

    /// Idempotent — unsubscribing an unknown id is a no-op.
    pub fn unsubscribe(&self, sub_id: SubscriptionId) {
        self.inner.subscriptions.remove(&sub_id);
    }
}
