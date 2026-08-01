//! Overlay webview recycling — the park/claim policy behind the rim's warm
//! panes (board directive, menu latency).
//!
//! A webview is the open path's whole cost: allocation, a WebContent process,
//! a navigation, a runtime evaluated, a compositor's first frames — measured
//! together at an order of magnitude over everything the host serves. A
//! surface program's *process* is per-invocation and stays so; the webview it
//! rendered in is the rim's own artifact, and the rim may keep it. On unmount
//! an overlay's webview is parked hidden instead of dropped; the next mount of
//! the same executable claims it, rebinds its identity, and navigates — paying
//! a document, never a webview.
//!
//! **Recorded gap.** No spec rules on webview lifetime across processes;
//! host.md §Overlays speaks per mount. This pool is the rim's own economy —
//! processes, boundaries, and commits are untouched by it — held to overlays
//! until a ruling generalizes it.
//!
//! The policy, pinned by the tests: keyed by executable (same program text →
//! same pane), at most one parked view per executable — the freshest parks,
//! the displaced one is returned to the caller to drop, since dropping a
//! webview is the rim's act, not the pool's.

use std::collections::HashMap;

pub struct Pool<V> {
    parked: HashMap<String, V>,
}

impl<V> Pool<V> {
    pub fn new() -> Pool<V> {
        Pool { parked: HashMap::new() }
    }

    /// Park a view under its executable. Returns the view it displaced, if the
    /// slot was taken — the caller owns that one's death.
    pub fn park(&mut self, executable: &str, view: V) -> Option<V> {
        self.parked.insert(executable.to_string(), view)
    }

    /// Claim the parked view for an executable; claiming empties the slot.
    pub fn claim(&mut self, executable: &str) -> Option<V> {
        self.parked.remove(executable)
    }

    /// Whether a view already waits under this executable — the prewarm
    /// lane's guard against building a pane nobody will claim.
    pub fn occupied(&self, executable: &str) -> bool {
        self.parked.contains_key(executable)
    }

    /// Drop everything parked — shutdown's sweep, before the window goes.
    pub fn clear(&mut self) {
        self.parked.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_parked_view_is_claimed_once_and_by_its_own_executable() {
        let mut pool: Pool<&str> = Pool::new();
        assert_eq!(pool.claim("programs/context-menu/src/index.tsx"), None);
        assert!(!pool.occupied("programs/context-menu/src/index.tsx"));
        assert_eq!(pool.park("programs/context-menu/src/index.tsx", "pane-1"), None);
        assert!(pool.occupied("programs/context-menu/src/index.tsx"));
        assert_eq!(pool.claim("programs/sidebar/src/index.tsx"), None, "another program's slot is empty");
        assert_eq!(pool.claim("programs/context-menu/src/index.tsx"), Some("pane-1"));
        assert_eq!(pool.claim("programs/context-menu/src/index.tsx"), None, "claiming empties the slot");
    }

    #[test]
    fn one_slot_per_executable_and_the_displaced_view_returns_to_die() {
        let mut pool: Pool<&str> = Pool::new();
        assert_eq!(pool.park("menu", "older"), None);
        assert_eq!(pool.park("menu", "fresher"), Some("older"), "the freshest parks; the caller drops the rest");
        assert_eq!(pool.claim("menu"), Some("fresher"));
        pool.park("menu", "pane");
        pool.clear();
        assert_eq!(pool.claim("menu"), None, "shutdown sweeps the pool");
    }
}
