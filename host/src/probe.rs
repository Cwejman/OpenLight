//! The probe lane — DOM truth for agents, over the channel the surfaces
//! already speak. `host --probe` boots normally, mounts every webview, then
//! injects [`script`] through the ordinary `evaluate_script` path
//! (host.md §Transport); each surface answers on its own IPC channel with one
//! `{"probe": {...}}` envelope, the rim prints it as a JSON line and exits.
//!
//! This is the pure half: the script text, the envelope reader, the line
//! written to stdout, and the tally that says when the set is complete. No
//! wry, no window — the rim wires it.
//!
//! It is a development instrument, not a program: a probe report is what the
//! webview's own DOM says about itself, which is the one thing an in-process
//! tree test cannot see (a computed background, a scroll overflow, a rounded
//! corner are the webview's answer, not React's).

use serde_json::{json, Value};

/// The sentinel the rim sends itself once every surface has reported —
/// no process is ever named this, so the normal unmount path stays honest.
pub const DONE: &str = "__probe_done";

/// The nodes worth a computed style: the page's own frame, then the shapes
/// host.md §Visual Language rules on — the naked strip, its items (card vs
/// flat), the tile card and its scrolling content.
pub const SELECTORS: &str =
    "html, body, #root, .strip, .items, .item, .quiet, .tile, .head, .content, .rows, .row, .foot";

/// How much of the serialized DOM a report carries. Scripts and styles are
/// replaced by their length before trimming, so the budget buys structure.
pub const HTML_LIMIT: usize = 6000;

/// How many nodes one report describes — a stale session's sidebar holds
/// dozens of items and only the head of the list carries the ordering truth.
pub const NODE_LIMIT: usize = 48;

/// The script injected into every mounted webview. It reads the live DOM,
/// never React: computed styles are the webview's own answer.
pub fn script(html_limit: usize, node_limit: usize) -> String {
    TEMPLATE
        .replace("__SELECTORS__", &json_string(SELECTORS))
        .replace("__HTML_LIMIT__", &html_limit.to_string())
        .replace("__NODE_LIMIT__", &node_limit.to_string())
}

const TEMPLATE: &str = r#"(() => {
  const style = (el) => {
    const s = getComputedStyle(el);
    return {
      background: s.backgroundColor,
      color: s.color,
      color_scheme: s.colorScheme,
      border_radius: s.borderRadius,
      position: s.position,
      overflow_y: s.overflowY,
    };
  };
  const nodes = [...document.querySelectorAll(__SELECTORS__)]
    .slice(0, __NODE_LIMIT__)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      class: typeof el.className === 'string' && el.className ? el.className : null,
      id: el.id || null,
      data: { ...el.dataset },
      client_height: el.clientHeight,
      scroll_height: el.scrollHeight,
      scrollable: el.scrollHeight > el.clientHeight + 1,
      // A laid-out scrollbar takes width from the content box; an overlay one
      // (macOS at rest) does not — the affordance, as the DOM knows it.
      scrollbar_width: el.offsetWidth ? el.offsetWidth - el.clientWidth : 0,
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 72),
      ...style(el),
    }));
  const clone = document.documentElement.cloneNode(true);
  for (const dense of clone.querySelectorAll('script, style')) {
    dense.textContent = '/* ' + dense.textContent.length + ' chars */';
  }
  let html = clone.outerHTML;
  const full = html.length;
  if (full > __HTML_LIMIT__) html = html.slice(0, __HTML_LIMIT__);
  window.__wry_ipc.postMessage(JSON.stringify({
    probe: { nodes, html, html_length: full },
  }));
})()"#;

/// A probe answer, or `None` for every ordinary IPC message — the rim asks
/// this first and falls through to [`crate::dispatch::parse`] unchanged.
pub fn parse(raw: &str) -> Option<Value> {
    let value: Value = serde_json::from_str(raw).ok()?;
    let report = value.get("probe")?;
    report.is_object().then(|| report.clone())
}

/// One line of stdout: which surface answered, and what it said.
pub fn line(process: &str, program: &str, report: &Value) -> String {
    json!({ "process": process, "program": program, "probe": report }).to_string()
}

/// The set of surfaces still owed a report. The rim exits when it empties.
#[derive(Debug, Clone, PartialEq)]
pub struct Tally {
    expected: usize,
    seen: usize,
}

impl Tally {
    pub fn new(expected: usize) -> Tally {
        Tally { expected, seen: 0 }
    }

    /// Records one report; `true` exactly once — when the set completes.
    pub fn record(&mut self) -> bool {
        self.seen += 1;
        self.seen == self.expected
    }

    pub fn seen(&self) -> usize {
        self.seen
    }
}

fn json_string(value: &str) -> String {
    Value::String(value.to_string()).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_script_answers_on_the_channel_the_surfaces_already_speak() {
        let js = script(HTML_LIMIT, NODE_LIMIT);
        assert!(js.contains("window.__wry_ipc.postMessage"), "{js}");
        assert!(js.contains("probe:"), "the envelope the rim reads back");
        assert!(js.contains("getComputedStyle"), "styles are the webview's answer, not React's");
    }

    #[test]
    fn the_script_carries_its_parameters_as_data() {
        let js = script(120, 7);
        assert!(js.contains(".slice(0, 7)"));
        assert!(js.contains("> 120"));
        assert!(js.contains(r#""html, body, #root"#), "the selector list is a JS string: {js}");
        assert!(!js.contains("__SELECTORS__"), "every placeholder filled");
        assert!(!js.contains("__HTML_LIMIT__"));
        assert!(!js.contains("__NODE_LIMIT__"));
    }

    #[test]
    fn a_bundle_is_never_shipped_whole() {
        let js = script(HTML_LIMIT, NODE_LIMIT);
        assert!(js.contains("querySelectorAll('script, style')"), "dense nodes are summarized");
    }

    #[test]
    fn a_probe_envelope_is_recognized_and_ordinary_traffic_is_not() {
        let report = parse(r#"{"probe":{"nodes":[{"tag":"html"}]}}"#).expect("a probe answer");
        assert_eq!(report["nodes"][0]["tag"], "html");

        assert!(parse(r#"{"id":1,"op":"get","chunkId":"c_1"}"#).is_none());
        assert!(parse("not json").is_none());
        // A `probe` key that is not a report is not one.
        assert!(parse(r#"{"probe":"yes"}"#).is_none());
    }

    #[test]
    fn a_line_names_the_surface_that_answered() {
        let line = line("p_1", "sidebar", &json!({ "nodes": [] }));
        let parsed: Value = serde_json::from_str(&line).expect("one json line");
        assert_eq!(parsed["process"], "p_1");
        assert_eq!(parsed["program"], "sidebar");
        assert_eq!(parsed["probe"]["nodes"], json!([]));
        assert!(!line.contains('\n'), "one report is one line");
    }

    #[test]
    fn the_tally_completes_once_every_surface_has_answered() {
        let mut tally = Tally::new(2);
        assert!(!tally.record());
        assert!(tally.record());
        assert_eq!(tally.seen(), 2);
        // Complete is a moment, not a state a late answer repeats.
        assert!(!tally.record());
    }
}
