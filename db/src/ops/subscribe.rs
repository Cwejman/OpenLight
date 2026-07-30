use crate::db::Db;
use crate::types::{ChunkId, Commit, SubscribeOpts};
use crate::virtual_chunks;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::{Stream, StreamExt};

impl Db {
    /// Yields commits on the watched branch that touch any of the named scopes.
    /// Pushed after `tx.commit()` returns Ok — by the time an event arrives, the
    /// SQL commit is durable and visible to any reader.
    pub fn subscribe_scope(
        &self,
        scopes: &[ChunkId],
        opts: SubscribeOpts,
    ) -> impl Stream<Item = Commit> {
        let scope_ids: Vec<String> = scopes.iter().map(|s| s.as_str().to_string()).collect();
        let receiver = self.sender.subscribe();
        BroadcastStream::new(receiver).filter_map(move |event| {
            let commit = event.ok()?;
            (commit.branch == opts.branch && touches(&commit, &scope_ids)).then_some(commit)
        })
    }
}

fn touches(commit: &Commit, scope_ids: &[String]) -> bool {
    if scope_ids.is_empty() {
        return true;
    }
    let is_branch_event = commit
        .message
        .as_deref()
        .map(|m| m.starts_with("branch: "))
        .unwrap_or(false);
    scope_ids.iter().any(|scope| {
        if scope == virtual_chunks::COMMITS {
            return !is_branch_event;
        }
        if scope == virtual_chunks::BRANCHES {
            return is_branch_event;
        }
        commit
            .placements_modified
            .iter()
            .any(|(chunk, s)| s.as_str() == scope || chunk.as_str() == scope)
            || commit.chunks_modified.iter().any(|c| c.as_str() == scope)
    })
}
