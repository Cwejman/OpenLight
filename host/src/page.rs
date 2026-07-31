//! What the host installs on a page before the program's own code runs
//! (host.md §Transport): `window.__wry_ipc`, the specced alias over wry's own
//! `window.ipc`, and the running process's id. The page itself is served, not
//! inlined — see `serve`.
//!
//! **Recorded gap.** No spec names how a webview program learns its own process
//! id. A VM program reads `process.env.PROCESS_ID` (host.md §Authoring
//! Programs); its webview counterpart has no channel — neither an op in
//! engine.md's protocol nor an injected global in host.md/sdk.md. `read` needs
//! it to open its own call frame, so the host stamps it here.

pub const PROCESS_GLOBAL: &str = "__openlight_process";

/// Where this webview's own top-left sits in the window, in logical pixels.
///
/// A page's client coordinates start at its own webview's origin, and nothing
/// inside the page can learn what that origin is. A surface raising an overlay
/// must name its anchor in *window* space (the overlay spans the window), so the
/// host says where the surface is and `@openlight/react`'s `windowPoint` does
/// the addition.
///
/// **Recorded gap.** host.md §Overlays rules on an overlay's anchor *scope*, not
/// on the coordinate space an anchored overlay is positioned in. This global is
/// this build's reading.
pub const ORIGIN_GLOBAL: &str = "__openlight_origin";

/// Runs before any page script (`WebViewBuilder::with_initialization_script`).
pub fn init_script(process: &str, x: f64, y: f64) -> String {
    format!(
        "window.__wry_ipc = {{ postMessage: (message) => window.ipc.postMessage(message) }};\n\
         window.{PROCESS_GLOBAL} = {};\n{}",
        json_string(process),
        origin_script(x, y)
    )
}

/// Re-stamped whenever the webview moves: the window's geometry changes under
/// the user's hand, and a stale origin anchors an overlay in the wrong place.
pub fn origin_script(x: f64, y: f64) -> String {
    format!("window.{ORIGIN_GLOBAL} = {{ x: {x}, y: {y} }};")
}

fn json_string(value: &str) -> String {
    serde_json::Value::String(value.to_string()).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_init_script_installs_the_specced_ipc_name() {
        let script = init_script("p_1", 0.0, 0.0);
        assert!(script.contains("window.__wry_ipc"));
        assert!(script.contains("window.ipc.postMessage"));
    }

    #[test]
    fn the_init_script_stamps_the_process_id_as_a_json_string() {
        assert!(init_script("p_1", 0.0, 0.0).contains(r#"window.__openlight_process = "p_1";"#));
        // An id is opaque: whatever it holds must survive as data, not source.
        assert!(init_script(r#"a"b\c"#, 0.0, 0.0).contains(r#""a\"b\\c""#));
    }

    #[test]
    fn a_surface_is_told_where_in_the_window_it_sits() {
        assert!(init_script("p_1", 14.0, 10.0).contains("window.__openlight_origin = { x: 14, y: 10 };"));
        // The same sentence stands alone, for a surface that has moved.
        assert_eq!(origin_script(0.0, 0.5), "window.__openlight_origin = { x: 0, y: 0.5 };");
    }
}
