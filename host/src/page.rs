//! The page a webview program is loaded into (host.md §Authoring Programs,
//! sdk.md §What the SDK does not do): `<div id="root">` and the program's
//! bundle — nothing the program did not put there itself. The host installs two
//! names before the bundle runs: `window.__wry_ipc` (host.md §Transport's
//! specced alias over wry's own `window.ipc`) and the running process's id.
//!
//! **Recorded gap.** No spec names how a webview program learns its own process
//! id. A VM program reads `process.env.PROCESS_ID` (host.md §Authoring
//! Programs); its webview counterpart has no channel — neither an op in
//! engine.md's protocol nor an injected global in host.md/sdk.md. `read` needs
//! it to open its own call frame, so the host stamps it here.

use std::path::Path;

pub const PROCESS_GLOBAL: &str = "__openlight_process";

/// Runs before any page script (`WebViewBuilder::with_initialization_script`).
pub fn init_script(process: &str) -> String {
    format!(
        "window.__wry_ipc = {{ postMessage: (message) => window.ipc.postMessage(message) }};\n\
         window.{PROCESS_GLOBAL} = {};",
        json_string(process)
    )
}

/// The standard shell: transparent background (the window owns the canvas), a
/// full-height root, the bundle inline. The page is the webview's viewport and
/// nothing more — it never scrolls, so a surface can never be dragged out of
/// its own frame; a program scrolls the region that owns the scrolling.
/// @openlight/ui's base restates this for programs mounted outside the shell.
pub fn shell(bundle: &str) -> String {
    format!(
        "<!doctype html>\n\
         <html><head><meta charset=\"utf-8\">\n\
         <style>html, body {{ margin: 0; height: 100%; overflow: hidden;\n\
         overscroll-behavior: none; background: transparent }}\n\
         #root {{ position: relative; height: 100% }}</style>\n\
         </head><body><div id=\"root\"></div>\n\
         <script>{}</script></body></html>",
        escape_script(bundle)
    )
}

/// The program's bundle on disk, or `None` when it is not built — the caller
/// keeps whatever it renders for programs without one.
pub fn load_bundle(project_root: &Path, executable: &str) -> Option<String> {
    std::fs::read_to_string(project_root.join(executable)).ok()
}

/// A closing tag inside the bundle would end the element early. Bundlers emit
/// the sequence only inside string literals, where the backslash is inert.
fn escape_script(bundle: &str) -> String {
    bundle.replace("</script", "<\\/script")
}

fn json_string(value: &str) -> String {
    serde_json::Value::String(value.to_string()).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_shell_gives_the_program_the_root_the_sdk_assumes() {
        let page = shell("console.log(1)");
        assert!(page.contains(r#"<div id="root"></div>"#), "{page}");
        assert!(page.contains("console.log(1)"));
        // The viewport is pinned: only a program's own region may scroll.
        assert!(page.contains("overflow: hidden"), "the page itself never scrolls: {page}");
    }

    #[test]
    fn a_closing_tag_in_the_bundle_cannot_end_the_element() {
        let page = shell(r#"const a = "<script></script>";"#);
        assert_eq!(page.matches("</script>").count(), 1, "one real close: {page}");
        assert!(page.contains(r#"<\/script"#));
    }

    #[test]
    fn the_init_script_installs_the_specced_ipc_name() {
        let script = init_script("p_1");
        assert!(script.contains("window.__wry_ipc"));
        assert!(script.contains("window.ipc.postMessage"));
    }

    #[test]
    fn the_init_script_stamps_the_process_id_as_a_json_string() {
        assert!(init_script("p_1").contains(r#"window.__openlight_process = "p_1";"#));
        // An id is opaque: whatever it holds must survive as data, not source.
        assert!(init_script(r#"a"b\c"#).contains(r#""a\"b\\c""#));
    }

    #[test]
    fn a_missing_bundle_is_none_not_an_error() {
        let dir = std::env::temp_dir().join("ol-page-tests-missing");
        assert!(load_bundle(&dir, "programs/nothing.js").is_none());
    }

    #[test]
    fn a_built_bundle_loads_relative_to_its_project() {
        let dir = std::env::temp_dir().join(format!("ol-page-tests-{:x}", std::process::id()));
        std::fs::create_dir_all(dir.join("programs")).unwrap();
        std::fs::write(dir.join("programs").join("x.js"), "BUNDLE").unwrap();
        assert_eq!(load_bundle(&dir, "programs/x.js").as_deref(), Some("BUNDLE"));
        let _ = std::fs::remove_dir_all(&dir);
    }
}
