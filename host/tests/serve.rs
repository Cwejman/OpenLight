//! The served program, end to end on disk: the shell a webview loads, and the
//! module chain it pulls behind it. This is the test the built-bundle test was
//! — the artifact the host hands a webview is no longer a file in the tree, so
//! it is asked for the way the webview asks for it.
//!
//! Nothing is mocked: real sources, real `node_modules`, the real transpiler.

use host::serve::{self, Answer, Served};
use host::transpile::Transpiler;
use std::path::{Path, PathBuf};

const READ_TILE: &str = "programs/read-tile/src/index.tsx";
const SIDEBAR: &str = "programs/sidebar/src/index.tsx";

struct Host {
    transpiler: Transpiler,
    root: PathBuf,
    project: PathBuf,
    cache: PathBuf,
}

impl Drop for Host {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.cache);
    }
}

impl Host {
    fn start() -> Host {
        let project = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let cache = std::env::temp_dir().join(format!("ol-serve-test-{nanos:x}"));
        Host {
            transpiler: Transpiler::start(&cache).expect("bun on PATH"),
            root: serve::source_root(&project),
            project,
            cache,
        }
    }

    fn entry(&self, executable: &str) -> PathBuf {
        self.project.join(executable)
    }

    /// One request, as the webview makes it: a URL in, a response out.
    fn get(&self, process: &str, entry: &Path, url: &str) -> Served {
        let path = url.strip_prefix("ol://app").unwrap_or(url);
        serve::serve(&self.transpiler, &self.root, process, entry, path)
    }

    fn source(&self, process: &str, entry: &Path, url: &str) -> String {
        let served = self.get(process, entry, url);
        assert_eq!(served.status, 200, "{url} was not served");
        assert_eq!(served.mime, "text/javascript", "{url} is not a module");
        String::from_utf8(served.body).expect("modules are text")
    }
}

/// The `ol://` URLs a module imports, in the order they appear.
fn imports(code: &str) -> Vec<String> {
    let mut found = Vec::new();
    let mut rest = code;
    while let Some(start) = rest.find("\"ol://app/mod") {
        let tail = &rest[start + 1..];
        let end = tail.find('"').expect("a closed string literal");
        found.push(tail[..end].to_string());
        rest = &tail[end..];
    }
    found
}

fn one_import(code: &str, ending: &str) -> String {
    imports(code)
        .into_iter()
        .find(|url| url.ends_with(ending))
        .unwrap_or_else(|| panic!("no import ending {ending} among {:?}", imports(code)))
}

/// The page a webview is given holds one stylesheet and the program's entry:
/// no root element, no inline style, no inlined code.
#[test]
fn the_shell_names_the_program_s_own_entry_and_one_stylesheet() {
    let host = Host::start();
    let entry = host.entry(READ_TILE);
    let Answer::Ready(served) = serve::respond(&host.root, "p_1", &entry, "/p_1") else {
        panic!("a shell is answered whole");
    };
    let page = String::from_utf8(served.body).unwrap();

    assert_eq!(served.mime, "text/html");
    assert!(page.contains(&format!(r#"<script type="module" src="{}""#, serve::module_url(&entry))), "{page}");
    assert!(page.contains(&format!(r#"<link rel="stylesheet" href="{}">"#, serve::styles_url("p_1"))), "{page}");
    assert!(page.contains("<body></body>"), "{page}");
    assert!(!page.contains("id=\"root\""), "the program mounts the body: {page}");
    assert!(!page.contains("<style"), "no page carries CSS in its markup: {page}");
}

/// The stylesheet the shell links, asked for the way the webview asks: one
/// sheet, compiled for this program — Tailwind's build of the classes it
/// actually writes, over the shared semantic layer and its tokens.
#[test]
fn a_surface_s_stylesheet_is_compiled_from_its_own_sources() {
    let host = Host::start();
    let entry = host.entry(SIDEBAR);

    let served = host.get("p_2", &entry, &serve::styles_url("p_2"));
    assert_eq!((served.status, served.mime), (200, "text/css"));
    let sheet = String::from_utf8(served.body).expect("a stylesheet is text");

    // The semantic layer and the tokens it stands on.
    assert!(sheet.contains(r#"[data-ui="item"][data-live="true"]"#), "the depth registers");
    assert!(sheet.contains("--ol-radius: 12px"), "the tokens");
    // A utility this program writes, and one it does not.
    assert!(sheet.contains(".w-\\[216px\\]"), "the strip's own column width: {sheet}");
    assert!(!sheet.contains("grid-cols-"), "nothing the sidebar never writes");
    // Nothing is left for the webview to chase, and no scrollbar is styled.
    assert!(!sheet.contains("@import"), "every import is resolved");
    assert!(!sheet.contains("::-webkit-scrollbar"));

    // Another process's sheet is refused, exactly as its shell would be.
    assert_eq!(host.get("p_2", &entry, &serve::styles_url("p_9")).status, 404);
}

/// The chain the brief walks: the entry, the React layer it imports by name,
/// and React itself — every hop a URL that is the file's own path.
#[test]
fn a_program_s_module_chain_resolves_from_source_to_react() {
    let host = Host::start();
    let entry = host.entry(READ_TILE);

    let index = host.source("p_1", &entry, &serve::module_url(&entry));
    // Body-mounted, transpiled from TSX: JSX is gone, the DOM call is not.
    assert!(index.contains("createRoot(document.body)"), "{index}");
    assert!(!index.contains("<ReadTile"), "TSX is transpiled: {index}");
    // A relative import is left as written — the browser resolves it against
    // this module's URL, which is this file's path.
    assert!(index.contains("\"./tile.tsx\""), "{index}");
    // Bare specifiers are URLs, resolved from this file's own package.
    let jsx_runtime = one_import(&index, "/react/jsx-runtime.js");
    let client = one_import(&index, "/react-dom/client.js");

    let tile = host.source("p_1", &entry, &serve::module_url(&entry.with_file_name("tile.tsx")));
    let react_layer = one_import(&tile, "/host/react/src/index.ts");
    assert!(react_layer.contains("/host/react/src/index.ts"), "{react_layer}");

    let layer = host.source("p_1", &entry, &react_layer);
    assert!(layer.contains("./useScope.ts"), "the layer's own files stay relative: {layer}");
    // Which the browser asks for against the layer's own URL — the hook is
    // where the layer reaches React.
    let hook = host.source("p_1", &entry, &react_layer.replace("index.ts", "useScope.ts"));
    let react = one_import(&hook, "/react/index.js");

    // React is CommonJS: what is served is a module, with no `require` left to
    // call and its own package bundled in.
    let react_module = host.source("p_1", &entry, &react);
    assert!(react_module.contains("export default"), "an ES module");
    // Its CommonJS names are real ES exports — `import { useState }` in the
    // layer above only resolves because of this.
    assert!(react_module.contains("as useState"), "named exports, not a default alone");
    assert!(react_module.contains("as useEffect"));
    assert!(react_module.len() > 10_000, "the package is bundled in: {} bytes", react_module.len());

    // React-DOM imports it rather than carrying a second copy — one instance,
    // which is the whole reason a dep's own bare imports stay external.
    let client_module = host.source("p_1", &entry, &client);
    assert!(
        imports(&client_module).contains(&react),
        "react-dom/client shares one react: {:?}",
        imports(&client_module)
    );

    // The JSX runtime the transpiler injected is served the same way (React 19
    // needs nothing from React itself to build an element).
    let runtime_module = host.source("p_1", &entry, &jsx_runtime);
    assert!(runtime_module.contains("jsx"), "the runtime the entry imports");
}

/// One file on disk is one URL, whoever asks — the two programs are separate
/// packages and still land on the same React.
#[test]
fn two_programs_reach_the_same_react_by_the_same_url() {
    let host = Host::start();
    let (tile, strip) = (host.entry(READ_TILE), host.entry(SIDEBAR));

    let from = |entry: &Path, process: &str| -> String {
        let index = host.source(process, entry, &serve::module_url(entry));
        one_import(&index, "/react-dom/client.js")
    };

    assert_eq!(from(&tile, "p_1"), from(&strip, "p_2"));
}

/// A request is bounded by the tree the project resolves from, and a file that
/// is not there is a 404 — never a silent empty module.
#[test]
fn only_the_project_s_own_tree_is_served() {
    let host = Host::start();
    let entry = host.entry(READ_TILE);

    assert_eq!(host.get("p_1", &entry, "ol://app/mod/etc/passwd").status, 404);
    let absent = serve::module_url(&entry.with_file_name("nothing.tsx"));
    assert_eq!(host.get("p_1", &entry, &absent).status, 404);
    // An import that named the file without its extension still finds it.
    let extensionless = serve::module_url(&entry.with_file_name("view"));
    assert_eq!(host.get("p_1", &entry, &extensionless).status, 200);
}
