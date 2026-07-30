//! The shadow underlay, rim side — the surface a tile's aura is cast on.
//!
//! A webview is clipped to its own rect, so a floating surface cannot draw the
//! shadow that proves it floats. The rim therefore creates one more webview
//! before any other: full-window, transparent, click-through, at the bottom of
//! the z-order. Its page is `react/src/underlay.ts`, served over `ol://` like
//! any module, and it draws a rounded aura at each tile leaf's geometry.
//!
//! Everything visual belongs to that page. The rim's whole vocabulary here is
//! *rectangles* — [`script`] is the only thing it ever says.

use crate::geometry::Rect;
use serde_json::{json, Value};

/// The id the underlay's webview is registered under. It is not a process: no
/// engine run ever produces this, so it can never collide with one.
pub const PROCESS: &str = "__underlay";

/// What the probe lane calls it — the underlay answers like any surface.
pub const PROGRAM: &str = "underlay";

/// The page, relative to the host project root (the base `body.executable`
/// resolves from, `boot::Booted::programs_root`).
pub const ENTRY: &str = "react/src/underlay.ts";

/// Installed before the page's own code (`with_initialization_script`), once
/// per document.
///
/// The layout is known before the page exists, and an `evaluate_script` sent
/// into a document that has not loaded is simply lost — so the first rects ride
/// in here, where the page is guaranteed to find them, and the global that will
/// carry every later one is defined buffering until the module claims it.
pub fn init_script(rects: &[Rect]) -> String {
    format!(
        "window.__openlight_rects = {};\n\
         window.__openlight_underlay = (rects) => {{ window.__openlight_rects = rects; }};",
        payload(rects)
    )
}

/// The one message the rim sends a loaded underlay: where the tiles are.
pub fn script(rects: &[Rect]) -> String {
    format!("window.__openlight_underlay({});", payload(rects))
}

fn payload(rects: &[Rect]) -> Value {
    Value::Array(
        rects
            .iter()
            .map(|r| json!({ "x": r.x, "y": r.y, "width": r.width, "height": r.height }))
            .collect(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_rim_says_rectangles_and_nothing_else() {
        let js = script(&[
            Rect { x: 240.0, y: 14.0, width: 1000.0, height: 800.0 },
            Rect { x: 10.5, y: 0.0, width: 1.0, height: 2.0 },
        ]);
        let payload = js
            .strip_prefix("window.__openlight_underlay(")
            .and_then(|rest| rest.strip_suffix(");"))
            .expect("one call, one argument");
        let sent: Value = serde_json::from_str(payload).expect("the argument is data");
        assert_eq!(
            sent,
            json!([
                { "x": 240.0, "y": 14.0, "width": 1000.0, "height": 800.0 },
                { "x": 10.5, "y": 0.0, "width": 1.0, "height": 2.0 },
            ])
        );
        // Styling never enters Rust (author ruling, depth language).
        for word in ["shadow", "radius", "rgba", "px", "style"] {
            assert!(!js.contains(word), "the rim leaked {word} into the underlay: {js}");
        }
    }

    #[test]
    fn an_empty_layout_clears_the_auras() {
        assert_eq!(script(&[]), "window.__openlight_underlay([]);");
    }

    #[test]
    fn the_first_layout_rides_in_before_the_page_exists() {
        let js = init_script(&[Rect { x: 1.0, y: 2.0, width: 3.0, height: 4.0 }]);
        assert!(js.contains("window.__openlight_underlay ="), "the global is defined: {js}");
        assert!(js.contains(r#""width":3.0"#), "the buffer the module drains: {js}");
        // Buffering, until the module replaces it with the renderer.
        assert!(js.contains("window.__openlight_rects = rects"), "{js}");
    }
}
