//! The `ol://` protocol — what a webview program is served, in place of a
//! bundle inlined into a page (host.md §Authoring Programs).
//!
//! One custom protocol per webview, two routes under one origin (same origin,
//! so a module script is never a cross-origin fetch):
//!
//!   `ol://app/<process id>`   the empty shell — the program's own entry as the
//!                             page's one module script, and nothing else.
//!   `ol://app/mod/<path>`     one file, transpiled. The URL *is* the file's
//!                             absolute path, so a relative import resolves to
//!                             the right file with no rewriting at all, and one
//!                             file on disk is always one URL.
//!
//! **Recorded gap.** No spec names how a program's source reaches its webview;
//! host.md §Authoring Programs says only that `body.executable` points at the
//! program. Serving it from the declaring project's root, over a scheme of the
//! host's own, is this build's reading.

use crate::transpile::Transpiler;
use std::path::{Path, PathBuf};

/// The scheme, and the one host under it. Registered per webview.
pub const SCHEME: &str = "ol";
const ORIGIN: &str = "ol://app";
const MODULE_PREFIX: &str = "/mod";

/// The extensions the transpiler owns. Anything else is served as it lies.
const TRANSPILED: [&str; 7] = ["ts", "tsx", "js", "jsx", "mjs", "cjs", "json"];

/// What an extensionless relative import may mean, in order.
const CANDIDATES: [&str; 8] =
    ["ts", "tsx", "js", "jsx", "mjs", "index.ts", "index.tsx", "index.js"];

#[derive(Debug, Clone, PartialEq)]
pub enum Route {
    /// The shell for a process.
    Shell(String),
    /// A file, by absolute path.
    Module(PathBuf),
    Unknown,
}

/// Read a request's path (`Uri::path`, always leading-slashed).
pub fn route(path: &str) -> Route {
    // The path the URL carries is absolute, so its own leading slash is the
    // separator — nothing is prepended, and nothing but a real path matches.
    if let Some(rest) = path.strip_prefix(MODULE_PREFIX).filter(|rest| rest.starts_with('/')) {
        return Route::Module(PathBuf::from(percent_decode(rest)));
    }
    match path.trim_start_matches('/') {
        "" => Route::Unknown,
        process => Route::Shell(percent_decode(process)),
    }
}

/// The URL a process's shell is loaded from.
pub fn shell_url(process: &str) -> String {
    format!("{ORIGIN}/{}", encode_segment(process))
}

/// The canonical URL of a file — the same one `serve.ts` builds, so the two
/// sides always name a file identically.
pub fn module_url(path: &Path) -> String {
    let encoded: Vec<String> =
        path.to_string_lossy().split('/').map(encode_segment).collect();
    format!("{ORIGIN}{MODULE_PREFIX}{}", encoded.join("/"))
}

/// The tree a project's modules may come from. A bare specifier is resolved by
/// walking up to the nearest `node_modules`, so that directory's own parent is
/// the boundary — not the project directory, which in a workspace sits below it.
pub fn source_root(project_root: &Path) -> PathBuf {
    project_root
        .ancestors()
        .find(|dir| dir.join("node_modules").is_dir())
        .unwrap_or(project_root)
        .to_path_buf()
}

/// Where transpiled modules are kept: under the build directory, never in the
/// source tree.
pub fn cache_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../target/ol-modules")
}

/// A request answered: the status, what it is, and the bytes.
#[derive(Debug, Clone, PartialEq)]
pub struct Served {
    pub status: u16,
    pub mime: &'static str,
    pub body: Vec<u8>,
}

impl Served {
    fn ok(mime: &'static str, body: Vec<u8>) -> Served {
        Served { status: 200, mime, body }
    }

    /// A failure a program can see. It is delivered as a module that throws, so
    /// the message lands in the webview's console with the file that caused it
    /// — a 500 would only show as a dead fetch.
    fn broken(what: &str, message: &str) -> Served {
        let script = format!(
            "console.error({});\nthrow new Error({});\n",
            json_string(&format!("ol: {what}\n{message}")),
            json_string(what)
        );
        Served { status: 200, mime: "text/javascript", body: script.into_bytes() }
    }

    fn missing(what: &str) -> Served {
        Served { status: 404, mime: "text/plain", body: format!("ol: no {what}").into_bytes() }
    }
}

/// What a request resolves to before anything is read: either the whole answer
/// (a shell, a refusal) or the one file a module request names. Pure — the
/// transpiler is only reached for the second.
#[derive(Debug, Clone, PartialEq)]
pub enum Answer {
    Ready(Served),
    Module(PathBuf),
}

/// Read one request for one webview. `process` and `entry` are that webview's
/// own — a shell is served only to the process it belongs to; `root` is the
/// tree modules may come from.
pub fn respond(root: &Path, process: &str, entry: &Path, uri_path: &str) -> Answer {
    match route(uri_path) {
        Route::Shell(who) if who == process => {
            Answer::Ready(Served::ok("text/html", shell(&module_url(entry)).into_bytes()))
        }
        Route::Shell(who) => Answer::Ready(Served::missing(&format!("shell for {who}"))),
        Route::Module(path) if !path.starts_with(root) => Answer::Ready(Served::missing(&format!(
            "module outside {}: {}",
            root.display(),
            path.display()
        ))),
        Route::Module(path) => match resolve_file(&path) {
            Some(file) => Answer::Module(file),
            None => Answer::Ready(Served::missing(&format!("module {}", path.display()))),
        },
        Route::Unknown => Answer::Ready(Served::missing("route")),
    }
}

/// Answer one request, transpiling when the request is for a module.
pub fn serve(
    transpiler: &Transpiler,
    root: &Path,
    process: &str,
    entry: &Path,
    uri_path: &str,
) -> Served {
    match respond(root, process, entry, uri_path) {
        Answer::Ready(served) => served,
        Answer::Module(file) => module(transpiler, &file),
    }
}

fn module(transpiler: &Transpiler, file: &Path) -> Served {
    let file = file.to_path_buf();
    if !transpiled(&file) {
        return match std::fs::read(&file) {
            Ok(bytes) => Served::ok(mime(&file), bytes),
            Err(e) => Served::broken(&format!("reading {}", file.display()), &e.to_string()),
        };
    }
    match transpiler.module(&file) {
        Ok(code) => Served::ok("text/javascript", code.into_bytes()),
        Err(message) => {
            eprintln!("ol: transpiling {}\n{message}", file.display());
            Served::broken(&format!("transpiling {}", file.display()), &message)
        }
    }
}

/// The empty shell (host.md §Authoring Programs): a charset, the program's
/// entry as a module, nothing else. There is no root element — the program
/// mounts the body, and every rule the page needs comes from the styles it
/// injects itself (`@openlight/react`).
pub fn shell(entry_url: &str) -> String {
    format!(
        "<!doctype html>\n\
         <html><head><meta charset=\"utf-8\">\n\
         <script type=\"module\" src=\"{}\"></script>\n\
         </head><body></body></html>",
        escape_attribute(entry_url)
    )
}

/// An import may name a file without its extension, or a directory. The
/// candidates are tried in order and the first that exists wins.
pub fn resolve_file(path: &Path) -> Option<PathBuf> {
    if path.is_file() {
        return Some(path.to_path_buf());
    }
    let name = path.file_name()?.to_string_lossy().to_string();
    let parent = path.parent()?;
    CANDIDATES
        .iter()
        .map(|candidate| match candidate.strip_prefix("index.") {
            Some(extension) => path.join(format!("index.{extension}")),
            None => parent.join(format!("{name}.{candidate}")),
        })
        .find(|candidate| candidate.is_file())
}

fn transpiled(path: &Path) -> bool {
    extension(path).is_some_and(|e| TRANSPILED.contains(&e.as_str()))
}

fn mime(path: &Path) -> &'static str {
    match extension(path).as_deref() {
        Some("css") => "text/css",
        Some("html") => "text/html",
        Some("json") => "application/json",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("woff2") => "font/woff2",
        _ => "application/octet-stream",
    }
}

fn extension(path: &Path) -> Option<String> {
    path.extension().map(|e| e.to_string_lossy().to_lowercase())
}

/// `encodeURIComponent`'s alphabet, so both sides encode a path identically.
fn encode_segment(segment: &str) -> String {
    let mut out = String::with_capacity(segment.len());
    for byte in segment.as_bytes() {
        let c = *byte as char;
        if c.is_ascii_alphanumeric() || "-_.!~*'()".contains(c) {
            out.push(c);
        } else {
            out.push_str(&format!("%{byte:02X}"));
        }
    }
    out
}

fn percent_decode(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match (bytes[i], bytes.get(i + 1), bytes.get(i + 2)) {
            (b'%', Some(a), Some(b)) => match u8::from_str_radix(&format!("{}{}", *a as char, *b as char), 16) {
                Ok(byte) => {
                    out.push(byte);
                    i += 3;
                }
                Err(_) => {
                    out.push(bytes[i]);
                    i += 1;
                }
            },
            _ => {
                out.push(bytes[i]);
                i += 1;
            }
        }
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn escape_attribute(value: &str) -> String {
    value.replace('&', "&amp;").replace('"', "&quot;").replace('<', "&lt;")
}

fn json_string(value: &str) -> String {
    serde_json::Value::String(value.to_string()).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_process_id_routes_to_its_shell_and_a_path_to_its_file() {
        assert_eq!(route("/p_1"), Route::Shell("p_1".into()));
        assert_eq!(route("/mod/Users/a/index.tsx"), Route::Module(PathBuf::from("/Users/a/index.tsx")));
        assert_eq!(route("/"), Route::Unknown);
        // A module path is always absolute; anything else is not a module.
        assert_eq!(route("/modest"), Route::Shell("modest".into()));
    }

    #[test]
    fn a_url_survives_the_round_trip_through_the_path_it_names() {
        for path in ["/Users/a/@x/night/host/programs/read-tile/src/index.tsx", "/a b/c%d/e.ts"] {
            let url = module_url(Path::new(path));
            let uri_path = url.strip_prefix(ORIGIN).expect("one origin");
            assert_eq!(route(uri_path), Route::Module(PathBuf::from(path)), "{url}");
        }
        // The characters a URL would otherwise read as structure are encoded.
        assert!(module_url(Path::new("/a b/@x")).contains("%20"));
        assert!(module_url(Path::new("/a b/@x")).contains("%40"));
    }

    #[test]
    fn the_shell_is_empty_but_for_the_program_s_entry() {
        let page = shell("ol://app/mod/x/index.tsx");
        assert!(page.contains(r#"<script type="module" src="ol://app/mod/x/index.tsx"></script>"#), "{page}");
        assert!(page.contains("<body></body>"), "nothing is mounted for the program: {page}");
        assert!(!page.contains("root"), "the program mounts the body itself: {page}");
        assert!(!page.contains("<style"), "styling is the program's, from @openlight/react: {page}");
    }

    #[test]
    fn a_shell_is_served_only_to_the_process_it_belongs_to() {
        let dir = std::env::temp_dir().join("ol-serve-shell");
        let entry = dir.join("index.tsx");
        let Answer::Ready(mine) = respond(&dir, "p_1", &entry, "/p_1") else {
            panic!("a shell is answered whole");
        };
        assert_eq!((mine.status, mine.mime), (200, "text/html"));
        assert!(String::from_utf8(mine.body).unwrap().contains(&module_url(&entry)));

        let Answer::Ready(other) = respond(&dir, "p_1", &entry, "/p_2") else {
            panic!("another process's shell is refused, not looked up");
        };
        assert_eq!(other.status, 404);
    }

    #[test]
    fn an_extensionless_import_finds_the_file_it_meant() {
        let dir = std::env::temp_dir().join(format!("ol-serve-{:x}", std::process::id()));
        std::fs::create_dir_all(dir.join("view")).unwrap();
        std::fs::write(dir.join("tile.tsx"), "").unwrap();
        std::fs::write(dir.join("view").join("index.ts"), "").unwrap();

        assert_eq!(resolve_file(&dir.join("tile.tsx")), Some(dir.join("tile.tsx")));
        assert_eq!(resolve_file(&dir.join("tile")), Some(dir.join("tile.tsx")));
        assert_eq!(resolve_file(&dir.join("view")), Some(dir.join("view/index.ts")));
        assert_eq!(resolve_file(&dir.join("nothing")), None);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn what_the_transpiler_owns_and_what_is_served_as_it_lies() {
        assert!(transpiled(Path::new("/a/b.tsx")) && transpiled(Path::new("/a/b.CJS")));
        assert!(!transpiled(Path::new("/a/b.css")) && !transpiled(Path::new("/a/b")));
        assert_eq!(mime(Path::new("/a/b.css")), "text/css");
        assert_eq!(mime(Path::new("/a/b.png")), "image/png");
    }

    #[test]
    fn a_module_outside_the_project_is_never_opened() {
        let dir = std::env::temp_dir().join("ol-serve-outside");
        let answer = respond(&dir, "p_1", &dir.join("index.tsx"), "/mod/etc/passwd");
        let Answer::Ready(served) = answer else { panic!("refused before the file is reached") };
        assert_eq!(served.status, 404, "{served:?}");
    }

    #[test]
    fn a_failure_reaches_the_console_as_a_module_that_throws() {
        let served = Served::broken("transpiling /a/b.tsx", "Unexpected }");
        assert_eq!(served.mime, "text/javascript");
        let body = String::from_utf8(served.body).unwrap();
        assert!(body.contains("console.error"), "{body}");
        assert!(body.contains("Unexpected }"), "{body}");
        assert!(body.contains("throw new Error"), "{body}");
    }
}
