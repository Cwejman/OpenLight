//! The open path, instrumented (board directive, menu latency): click → run →
//! MountWebview → first paint, as milliseconds between stages. Two lanes out
//! of the same marks:
//!
//!   `OL_TIMING=1`      stderr, stage by stage as they happen — the
//!                      measurement lane, for a person watching a terminal.
//!   settings `timings` each *finished* path becomes an [`Execution`] handed
//!                      to the sink the rim installed (`to_field`), which
//!                      commits it to the substrate — the telemetry lane, for
//!                      surfaces reading the field.
//!
//! Either lane alone turns collection on; both may run at once. Pure
//! bookkeeping — the rim calls [`mark`] at each stage.

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Instant;

/// One finished open path — what the telemetry lane commits.
pub struct Execution {
    /// The process whose open this was; the path's key.
    pub process: String,
    /// The program's declared name, when the rim said it ([`Timing::label`]).
    pub program: Option<String>,
    /// Every stage in arrival order, as milliseconds since the path started.
    pub stages: Vec<(String, f64)>,
}

type Sink = Box<dyn Fn(Execution) + Send + Sync>;

pub struct Timing {
    print: bool,
    collect: AtomicBool,
    sink: Mutex<Option<Sink>>,
    starts: Mutex<HashMap<String, Path>>,
}

struct Path {
    t0: Instant,
    last: Instant,
    label: Option<String>,
    stages: Vec<(String, f64)>,
}

impl Timing {
    pub fn from_env() -> Timing {
        Timing {
            print: std::env::var("OL_TIMING").map(|v| v == "1").unwrap_or(false),
            collect: AtomicBool::new(false),
            sink: Mutex::new(None),
            starts: Mutex::new(HashMap::new()),
        }
    }

    /// Turn the telemetry lane on: every path finished from here on reaches
    /// `sink`. Installed once at boot, when the settings chunk says `timings`
    /// — the sink is the rim's, and committing is its business.
    pub fn to_field(&self, sink: Sink) {
        *self.sink.lock().expect("timing lock") = Some(sink);
        self.collect.store(true, Ordering::Relaxed);
    }

    pub fn enabled(&self) -> bool {
        self.print || self.collect.load(Ordering::Relaxed)
    }

    /// Name the program behind a live path — the card the telemetry lane
    /// commits carries it. Silent on a path that never started.
    pub fn label(&self, key: &str, program: &str) {
        if !self.enabled() {
            return;
        }
        if let Some(path) = self.starts.lock().expect("timing lock").get_mut(key) {
            path.label = Some(program.to_string());
        }
    }

    /// Record one stage of one process's open path. The first mark for a key
    /// starts its clock; every mark lands on the path, and prints when the
    /// stderr lane is on.
    pub fn mark(&self, key: &str, stage: &str) {
        if !self.enabled() {
            return;
        }
        let now = Instant::now();
        let mut starts = self.starts.lock().expect("timing lock");
        let path = starts
            .entry(key.to_string())
            .or_insert(Path { t0: now, last: now, label: None, stages: Vec::new() });
        let at = now.duration_since(path.t0).as_secs_f64() * 1000.0;
        if self.print {
            eprintln!(
                "timing[{key}] {stage}: +{:.1}ms (total {at:.1}ms)",
                now.duration_since(path.last).as_secs_f64() * 1000.0,
            );
        }
        path.stages.push((stage.to_string(), at));
        path.last = now;
    }

    /// [`mark`], once per *live* path: repeats are silent, and so is a stage
    /// arriving after [`done`] — a surface keeps talking long after it first
    /// painted, and those late ops are not the open path. The per-key state
    /// replaces per-callsite flags — a recycled webview's handlers survive
    /// their first process, and a flag baked into a closure would never fire
    /// again. (Every open path starts with an unconditional [`mark`]:
    /// `mount-command` or `run-returned`.)
    pub fn mark_once(&self, key: &str, stage: &str) {
        if !self.enabled() {
            return;
        }
        let live_and_unseen = {
            let starts = self.starts.lock().expect("timing lock");
            starts.get(key).is_some_and(|path| !path.stages.iter().any(|(name, _)| name == stage))
        };
        if live_and_unseen {
            self.mark(key, stage);
        }
    }

    /// Finish a path: forget it — a re-run of the same key starts fresh — and
    /// hand it to the telemetry sink when that lane is on.
    pub fn done(&self, key: &str) {
        if !self.enabled() {
            return;
        }
        let Some(path) = self.starts.lock().expect("timing lock").remove(key) else { return };
        if !self.collect.load(Ordering::Relaxed) || path.stages.is_empty() {
            return;
        }
        if let Some(sink) = self.sink.lock().expect("timing lock").as_ref() {
            sink(Execution { process: key.to_string(), program: path.label, stages: path.stages });
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    fn timing(print: bool) -> Timing {
        Timing {
            print,
            collect: AtomicBool::new(false),
            sink: Mutex::new(None),
            starts: Mutex::new(HashMap::new()),
        }
    }

    #[test]
    fn a_stage_marks_once_on_a_live_path_and_never_off_one() {
        let timing = timing(true);
        // No path yet: a conditional stage on nothing is late traffic, dropped.
        timing.mark_once("p_1", "first-ipc");
        assert!(timing.starts.lock().unwrap().is_empty());
        // The open path starts with an unconditional mark.
        timing.mark("p_1", "mount-command");
        timing.mark_once("p_1", "first-ipc");
        let stages =
            |t: &Timing| t.starts.lock().unwrap().get("p_1").map(|p| p.stages.len()).unwrap_or(0);
        assert_eq!(stages(&timing), 2);
        timing.mark_once("p_1", "first-ipc");
        assert_eq!(stages(&timing), 2, "a repeat is silent, not a second stage");
        // done() ends the path; the surface's later traffic stays silent.
        timing.done("p_1");
        timing.mark_once("p_1", "first-reply");
        assert!(timing.starts.lock().unwrap().is_empty());
    }

    #[test]
    fn a_finished_path_reaches_the_field_sink_whole_and_labeled() {
        let timing = timing(false);
        // Both lanes off: nothing is even recorded.
        timing.mark("p_0", "mount-command");
        assert!(timing.starts.lock().unwrap().is_empty());

        let seen: Arc<Mutex<Vec<Execution>>> = Arc::new(Mutex::new(Vec::new()));
        let sink = seen.clone();
        timing.to_field(Box::new(move |execution| sink.lock().unwrap().push(execution)));
        assert!(timing.enabled(), "the telemetry lane alone turns collection on");

        timing.mark("p_1", "mount-command");
        timing.label("p_1", "context-menu");
        timing.mark("p_1", "first-paint");
        timing.done("p_1");

        let executions = seen.lock().unwrap();
        assert_eq!(executions.len(), 1);
        let execution = &executions[0];
        assert_eq!(execution.process, "p_1");
        assert_eq!(execution.program.as_deref(), Some("context-menu"));
        let names: Vec<&str> = execution.stages.iter().map(|(name, _)| name.as_str()).collect();
        assert_eq!(names, ["mount-command", "first-paint"]);
        assert!(execution.stages[0].1 <= execution.stages[1].1, "milliseconds since the start, in order");
        // done() consumed the path: a second done hands the sink nothing.
        drop(executions);
        timing.done("p_1");
        assert_eq!(seen.lock().unwrap().len(), 1);
    }
}
