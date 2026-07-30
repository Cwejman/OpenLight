use crate::boundary;
use crate::engine::Engine;
use crate::errors::EngineError;
use crate::types::{Context, ProcessId, ProcessStatus};

impl Engine {
    /// Request a process's terminal transition. Authorized when the target is a
    /// descendant of the caller or its process chunk is within the caller's
    /// write boundary; the host is unrestricted. Idempotent — cancel of an
    /// unknown or already-terminal process is satisfied by definition.
    pub fn cancel(&self, ctx: &Context, process_id: &ProcessId) -> Result<(), EngineError> {
        let inner = &self.inner;
        let bctx = inner.resolve_boundaries(ctx)?;
        if let Some(caller) = &bctx.process {
            let branch = inner.mounts.active()?.branch;
            let authorized = inner.is_descendant(process_id, caller)
                || boundary::can_read_chunk(&inner.mounts, &bctx.write, Some(caller), process_id, &branch)?;
            if !authorized {
                return Err(EngineError::BoundaryViolation(format!(
                    "process {process_id} is neither a descendant nor within the write boundary"
                )));
            }
        }
        inner.set_terminal(process_id, ProcessStatus::Failed, Some("cancelled"));
        Ok(())
    }

    /// The calling program's own terminal transition (`completed`) — the
    /// webview self-dismissal path; trivially safe.
    pub fn exit(&self, ctx: &Context) -> Result<(), EngineError> {
        let pid = ctx
            .process_id
            .as_ref()
            .ok_or_else(|| EngineError::InvalidRequest("exit requires a process context".into()))?;
        self.inner.set_terminal(pid, ProcessStatus::Completed, None);
        Ok(())
    }
}
