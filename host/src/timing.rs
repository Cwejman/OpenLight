//! The open path, instrumented (board directive, menu latency): click → run →
//! MountWebview → first paint, logged as milliseconds between stages. Enabled
//! by `OL_TIMING=1` so the numbers exist when wanted and the loop stays silent
//! otherwise. Pure bookkeeping — the rim calls [`mark`] at each stage.

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Instant;

pub struct Timing {
    enabled: bool,
    starts: Mutex<HashMap<String, (Instant, Instant)>>,
}

impl Timing {
    pub fn from_env() -> Timing {
        Timing {
            enabled: std::env::var("OL_TIMING").map(|v| v == "1").unwrap_or(false),
            starts: Mutex::new(HashMap::new()),
        }
    }

    pub fn enabled(&self) -> bool {
        self.enabled
    }

    /// Record one stage of one process's open path. The first mark for a key
    /// starts its clock; every mark prints the delta since the previous mark
    /// and since the start.
    pub fn mark(&self, key: &str, stage: &str) {
        if !self.enabled {
            return;
        }
        let now = Instant::now();
        let mut starts = self.starts.lock().expect("timing lock");
        let (t0, last) = starts.entry(key.to_string()).or_insert((now, now));
        eprintln!(
            "timing[{key}] {stage}: +{:.1}ms (total {:.1}ms)",
            now.duration_since(*last).as_secs_f64() * 1000.0,
            now.duration_since(*t0).as_secs_f64() * 1000.0,
        );
        *last = now;
    }

    /// Forget a finished path so a re-run of the same key starts fresh.
    pub fn done(&self, key: &str) {
        if self.enabled {
            self.starts.lock().expect("timing lock").remove(key);
        }
    }
}
