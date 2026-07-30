use crate::runtime::TransportRef;
use crate::types::{ProcessId, SubscriptionId};
use db::ChunkId;
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Clone)]
pub(crate) struct Subscription {
    pub id: SubscriptionId,
    pub process: ProcessId,
    pub scopes: Vec<ChunkId>,
    pub transport: TransportRef,
}

/// `Mutex<HashMap>` per engine.md's settled choices — held only for
/// insert/remove/snapshot, never across an await. Reactivity is the only event
/// emitter; ops insert, terminal cleanup and invalidation remove.
#[derive(Default)]
pub(crate) struct SubscriptionRegistry {
    map: Mutex<HashMap<SubscriptionId, Subscription>>,
}

impl SubscriptionRegistry {
    pub fn insert(&self, sub: Subscription) {
        self.map.lock().unwrap().insert(sub.id.clone(), sub);
    }

    /// Idempotent — unsubscribing an unknown id is a no-op.
    pub fn remove(&self, id: &SubscriptionId) {
        self.map.lock().unwrap().remove(id);
    }

    pub fn remove_for_process(&self, process: &ProcessId) {
        self.map
            .lock()
            .unwrap()
            .retain(|_, sub| sub.process != *process);
    }

    pub fn snapshot(&self) -> Vec<Subscription> {
        self.map.lock().unwrap().values().cloned().collect()
    }
}
