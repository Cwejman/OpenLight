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

/// Runs before any page script (`WebViewBuilder::with_initialization_script`).
pub fn init_script(process: &str) -> String {
    format!(
        "window.__wry_ipc = {{ postMessage: (message) => window.ipc.postMessage(message) }};\n\
         window.{PROCESS_GLOBAL} = {};",
        json_string(process)
    )
}

fn json_string(value: &str) -> String {
    serde_json::Value::String(value.to_string()).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
