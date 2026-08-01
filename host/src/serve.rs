//! The `ol://` protocol — what a webview program is served, in place of a
//! bundle inlined into a page (host.md §Authoring Programs).
//!
//! One custom protocol per webview, three routes under one origin (same origin,
//! so a module script is never a cross-origin fetch):
//!
//!   `ol://app/<process id>`   the shell — the program's own entry as the
//!                             page's one module script, and the one stylesheet
//!                             link, and nothing else.
//!   `ol://app/<pid>/styles.css`
//!                             that surface's whole stylesheet: Tailwind
//!                             compiled against the program's own sources, over
//!                             the shared `@openlight/react/ol.css` (tokens,
//!                             `@theme` mapping, semantic layer). Compiled on
//!                             demand and cached under `target/`, exactly like a
//!                             module — nothing is generated into the tree.
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
/// What a process's own path ends with when the stylesheet is what is wanted.
const STYLES: &str = "/styles.css";

/// The extensions the transpiler owns. Anything else is served as it lies.
const TRANSPILED: [&str; 7] = ["ts", "tsx", "js", "jsx", "mjs", "cjs", "json"];

/// What an extensionless relative import may mean, in order.
const CANDIDATES: [&str; 8] =
    ["ts", "tsx", "js", "jsx", "mjs", "index.ts", "index.tsx", "index.js"];

/// The warm page's own path. Reserved the way `db/` is for virtual scopes: a
/// process id can never be the bare word `warm` (ids are generated), so the
/// route costs no real shell.
const WARM: &str = "warm";

#[derive(Debug, Clone, PartialEq)]
pub enum Route {
    /// The shell for a process.
    Shell(String),
    /// The stylesheet for a process's surface.
    Styles(String),
    /// A file, by absolute path.
    Module(PathBuf),
    /// The prewarm page: this webview's program made hot, run nothing.
    Warm,
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
        WARM => Route::Warm,
        rest => match rest.strip_suffix(STYLES).filter(|process| !process.is_empty()) {
            Some(process) => Route::Styles(percent_decode(process)),
            None => Route::Shell(percent_decode(rest)),
        },
    }
}

/// The URL a prewarm pane is pointed at.
pub fn warm_url() -> String {
    format!("{ORIGIN}/{WARM}")
}

/// The URL a process's shell is loaded from.
pub fn shell_url(process: &str) -> String {
    format!("{ORIGIN}/{}", encode_segment(process))
}

/// The URL a process's shell links its stylesheet from.
pub fn styles_url(process: &str) -> String {
    format!("{ORIGIN}/{}{STYLES}", encode_segment(process))
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

    /// A stylesheet that did not compile. It is still served as CSS — a page
    /// with no rules is legible enough to read the failure on, and a dead
    /// stylesheet fetch would say nothing at all.
    fn unstyled(what: &str, message: &str) -> Served {
        let sheet = format!("/* ol: {what}\n{message} */\n");
        Served { status: 200, mime: "text/css", body: sheet.into_bytes() }
    }
}

/// What a request resolves to before anything is read: either the whole answer
/// (a shell, a refusal) or the one file a module request names. Pure — the
/// transpiler is only reached for the second.
#[derive(Debug, Clone, PartialEq)]
pub enum Answer {
    Ready(Served),
    Module(PathBuf),
    /// The stylesheet for the program whose sources live in this directory.
    Styles(PathBuf),
    /// The warm page for the program whose entry this is.
    Warm(PathBuf),
}

/// Read one request for one webview. `process` and `entry` are that webview's
/// own — a shell is served only to the process it belongs to; `root` is the
/// tree modules may come from.
pub fn respond(root: &Path, process: &str, entry: &Path, uri_path: &str) -> Answer {
    match route(uri_path) {
        Route::Shell(who) if who == process => Answer::Ready(Served::ok(
            "text/html",
            shell(&styles_url(process), &module_url(entry)).into_bytes(),
        )),
        Route::Shell(who) => Answer::Ready(Served::missing(&format!("shell for {who}"))),
        // A surface's stylesheet is compiled from the tree its entry lies in.
        Route::Styles(who) if who == process => match entry.parent() {
            Some(source) => Answer::Styles(source.to_path_buf()),
            None => Answer::Ready(Served::missing("source tree for the stylesheet")),
        },
        Route::Styles(who) => Answer::Ready(Served::missing(&format!("stylesheet for {who}"))),
        Route::Module(path) if !path.starts_with(root) => Answer::Ready(Served::missing(&format!(
            "module outside {}: {}",
            root.display(),
            path.display()
        ))),
        Route::Module(path) => match resolve_file(&path) {
            Some(file) => Answer::Module(file),
            None => Answer::Ready(Served::missing(&format!("module {}", path.display()))),
        },
        Route::Warm => Answer::Warm(entry.to_path_buf()),
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
        Answer::Styles(source) => match transpiler.styles(&source) {
            Ok(sheet) => Served::ok("text/css", sheet.into_bytes()),
            Err(message) => {
                eprintln!("ol: compiling styles for {}\n{message}", source.display());
                Served::unstyled(&format!("styles for {}", source.display()), &message)
            }
        },
        Answer::Warm(entry) => {
            Served::ok("text/html", warm_page(&graph(transpiler, &entry)).into_bytes())
        }
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

/// The shell (host.md §Authoring Programs): a charset, one stylesheet, the
/// program's entry as a module, and the page's own identity — nothing else.
/// There is no root element — the program mounts the body — and no inline
/// style: every rule the page needs arrives through the one link, so a surface
/// never carries CSS in its markup.
///
/// Identity is read off the page's own URL, which *is* the process id
/// (`ol://app/<process>`), rather than baked into the markup: the same shell
/// text serves every process, and a recycled webview navigating to a new
/// process's shell stamps itself — its initialization script still carries the
/// id of the mount that built it (`page`, recorded gap), and this line, running
/// on every document, is what keeps the global true.
pub fn shell(styles_url: &str, entry_url: &str) -> String {
    format!(
        "<!doctype html>\n\
         <html><head><meta charset=\"utf-8\">\n\
         <link rel=\"stylesheet\" href=\"{}\">\n\
         <script>window.{} = decodeURIComponent(location.pathname.slice(1));</script>\n\
         <script type=\"module\" src=\"{}\"></script>\n\
         </head><body></body></html>",
        escape_attribute(styles_url),
        crate::page::PROCESS_GLOBAL,
        escape_attribute(entry_url)
    )
}

/// Warm the compile lane for every program shipped under `programs/` (board
/// directive, menu latency): each program's stylesheet, then its whole module
/// graph, crawled the way the webview would pull it — a transpiled module's
/// imports are already `ol://` URLs, so the graph is read off the output.
/// Runs off the critical path at boot; everything lands in the mtime cache the
/// live handlers read, so the first overlay open pays file reads, not compiles.
///
/// The transpiler pipe carries one request at a time (its lock), so a surface
/// asking mid-warm waits at most one module — never the whole warm.
pub fn warm(transpiler: &Transpiler, programs_root: &Path) {
    let started = std::time::Instant::now();
    let programs = programs_root.join("programs");
    let Ok(entries) = std::fs::read_dir(&programs) else { return };
    // Shared graphs overlap (every program pulls its React), so the honest
    // count is unique files, not the sum of walks.
    let mut compiled: Vec<PathBuf> = Vec::new();
    let mut programs_found = 0usize;
    for program in entries.flatten() {
        let src = program.path().join("src");
        let entry = src.join("index.tsx");
        if !entry.is_file() {
            continue;
        }
        let _ = transpiler.styles(&src);
        for file in graph(transpiler, &entry) {
            if !compiled.contains(&file) {
                compiled.push(file);
            }
        }
        programs_found += 1;
    }
    eprintln!(
        "host: warmed {} modules for {programs_found} programs in {:.1}s",
        compiled.len(),
        started.elapsed().as_secs_f64()
    );
}

/// One program's whole module graph, crawled from its entry through the
/// transpiler — every file compiled (or read from the cache) along the way.
/// Shared graphs overlap: two programs both count their `react`.
pub fn graph(transpiler: &Transpiler, entry: &Path) -> Vec<PathBuf> {
    let mut queue: Vec<PathBuf> = vec![entry.to_path_buf()];
    let mut seen: Vec<PathBuf> = Vec::new();
    while let Some(file) = queue.pop() {
        if seen.contains(&file) {
            continue;
        }
        let Ok(code) = transpiler.module(&file) else { continue };
        for import in module_imports(&code, &file) {
            if let Some(resolved) = resolve_file(&import) {
                queue.push(resolved);
            }
        }
        seen.push(file);
    }
    seen
}

/// The prewarm page (author ruling, board directive *menu latency*): make a
/// program's open cheap **without ever invoking it** — a program runs only as
/// a process, and this page has none. Package modules (`node_modules` in
/// their path) are imported, so the heavy runtime is parsed, evaluated, and
/// bytecode-cached: a library at module scope is inert. The program's own
/// files are `modulepreload`ed — fetched and compiled, never executed; only
/// its entry has effects at module scope, and it never runs here. No identity
/// is stamped and no stylesheet is linked: the page is a cache, not a surface.
pub fn warm_page(files: &[PathBuf]) -> String {
    let mut urls: Vec<(bool, String)> = files
        .iter()
        .map(|file| (file.components().any(|c| c.as_os_str() == "node_modules"), module_url(file)))
        .collect();
    urls.sort();
    let preloads: String = urls
        .iter()
        .filter(|(package, _)| !package)
        .map(|(_, url)| format!("<link rel=\"modulepreload\" href=\"{}\">\n", escape_attribute(url)))
        .collect();
    let imports: String = urls
        .iter()
        .filter(|(package, _)| *package)
        .map(|(_, url)| format!("import {};\n", json_string(url)))
        .collect();
    format!(
        "<!doctype html>\n\
         <html><head><meta charset=\"utf-8\">\n\
         {preloads}<script type=\"module\">\n{imports}</script>\n\
         </head><body></body></html>"
    )
}

/// The files a transpiled module pulls next, as the webview would: `ol://`
/// URLs decode to their absolute paths; relative imports (left as written —
/// the browser resolves them against the module's own URL, which is its path)
/// join the module's parent.
fn module_imports(code: &str, module: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    let marker = format!("{ORIGIN}{MODULE_PREFIX}");
    for specifier in quoted_specifiers(code) {
        if let Some(path) = specifier.strip_prefix(&marker) {
            out.push(PathBuf::from(percent_decode(path)));
        } else if specifier.starts_with("./") || specifier.starts_with("../") {
            if let Some(parent) = module.parent() {
                out.push(parent.join(&specifier));
            }
        }
    }
    out
}

/// Every double-quoted string that follows an import keyword — the transpiler
/// emits imports double-quoted, one per statement.
fn quoted_specifiers(code: &str) -> Vec<String> {
    let mut out = Vec::new();
    for anchor in ["from \"", "import \"", "import(\""] {
        let mut rest = code;
        while let Some(at) = rest.find(anchor) {
            rest = &rest[at + anchor.len()..];
            let end = rest.find('"').unwrap_or(rest.len());
            out.push(rest[..end].to_string());
            rest = &rest[end..];
        }
    }
    out
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
        assert_eq!(route("/p_1/styles.css"), Route::Styles("p_1".into()));
        assert_eq!(route("/mod/Users/a/index.tsx"), Route::Module(PathBuf::from("/Users/a/index.tsx")));
        assert_eq!(route("/"), Route::Unknown);
        // A module path is always absolute; anything else is not a module.
        assert_eq!(route("/modest"), Route::Shell("modest".into()));
        // A file called `styles.css` inside the tree is still a module.
        assert_eq!(
            route("/mod/Users/a/styles.css"),
            Route::Module(PathBuf::from("/Users/a/styles.css"))
        );
        // The shell's own URL round-trips through the stylesheet it links.
        let uri = styles_url("p_1");
        assert_eq!(route(uri.strip_prefix(ORIGIN).expect("one origin")), Route::Styles("p_1".into()));
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
    fn the_shell_is_one_stylesheet_the_entry_and_the_page_s_own_identity() {
        let page = shell("ol://app/p_1/styles.css", "ol://app/mod/x/index.tsx");
        assert!(page.contains(r#"<script type="module" src="ol://app/mod/x/index.tsx"></script>"#), "{page}");
        assert!(page.contains(r#"<link rel="stylesheet" href="ol://app/p_1/styles.css">"#), "{page}");
        assert!(page.contains("<body></body>"), "nothing is mounted for the program: {page}");
        assert!(!page.contains("id=\"root\""), "the program mounts the body itself: {page}");
        assert!(!page.contains("<style"), "every rule arrives through the link: {page}");
        // Identity comes off the URL, not the markup: the same shell text is
        // true for every process, so a recycled webview self-stamps.
        assert!(
            page.contains("window.__openlight_process = decodeURIComponent(location.pathname.slice(1));"),
            "the page derives its process from its own URL: {page}"
        );
        assert!(!page.contains("p_1</script>"), "no process id is baked into the markup: {page}");
    }

    #[test]
    fn a_shell_and_its_stylesheet_are_served_only_to_the_process_they_belong_to() {
        let dir = std::env::temp_dir().join("ol-serve-shell");
        let entry = dir.join("src").join("index.tsx");
        let Answer::Ready(mine) = respond(&dir, "p_1", &entry, "/p_1") else {
            panic!("a shell is answered whole");
        };
        assert_eq!((mine.status, mine.mime), (200, "text/html"));
        let page = String::from_utf8(mine.body).unwrap();
        assert!(page.contains(&module_url(&entry)));
        assert!(page.contains(&styles_url("p_1")), "the shell links its own stylesheet: {page}");

        // The stylesheet is compiled from the tree the entry lies in.
        let Answer::Styles(source) = respond(&dir, "p_1", &entry, "/p_1/styles.css") else {
            panic!("a stylesheet is compiled, not read off disk");
        };
        assert_eq!(source, dir.join("src"));

        for other in ["/p_2", "/p_2/styles.css"] {
            let Answer::Ready(refused) = respond(&dir, "p_1", &entry, other) else {
                panic!("another process's page is refused, not looked up");
            };
            assert_eq!(refused.status, 404, "{other}");
        }
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
    fn the_warm_route_is_reserved_and_its_page_never_runs_the_program() {
        assert_eq!(route("/warm"), Route::Warm);
        // A name that merely starts the same is still a shell.
        assert_eq!(route("/warmer"), Route::Shell("warmer".into()));
        let url = warm_url();
        assert_eq!(route(url.strip_prefix(ORIGIN).expect("one origin")), Route::Warm);

        let files = [
            PathBuf::from("/proj/programs/menu/src/index.tsx"),
            PathBuf::from("/proj/programs/menu/src/menu.tsx"),
            PathBuf::from("/proj/node_modules/react/index.js"),
            PathBuf::from("/proj/node_modules/react-dom/client.js"),
        ];
        let page = warm_page(&files);
        // Package modules are imported — parsed, evaluated, bytecode-cached;
        // a library at module scope is inert.
        assert!(page.contains(r#"import "ol://app/mod/proj/node_modules/react/index.js";"#), "{page}");
        assert!(page.contains(r#"import "ol://app/mod/proj/node_modules/react-dom/client.js";"#), "{page}");
        // The program's own files are fetched and compiled, never executed —
        // running a program without a process is what the ruling forbids.
        for own in ["index.tsx", "menu.tsx"] {
            assert!(
                page.contains(&format!("<link rel=\"modulepreload\" href=\"ol://app/mod/proj/programs/menu/src/{own}\">")),
                "{own} is preloaded: {page}"
            );
            assert!(!page.contains(&format!("import \"ol://app/mod/proj/programs/menu/src/{own}\"")), "{own} is never imported: {page}");
        }
        // A cache, not a surface: no identity, no stylesheet, nothing mounted.
        assert!(!page.contains("__openlight_process"), "{page}");
        assert!(!page.contains("stylesheet"), "{page}");
        assert!(page.contains("<body></body>"), "{page}");

        // The warm answer resolves before any file is read.
        let entry = PathBuf::from("/proj/programs/menu/src/index.tsx");
        assert_eq!(
            respond(Path::new("/proj"), "p_1", &entry, "/warm"),
            Answer::Warm(entry)
        );
    }

    #[test]
    fn the_warmer_follows_both_url_and_relative_imports() {
        let code = r#"import { a } from "ol://app/mod/Users/x/node_modules/react/index.js";
import { b } from "./sidebar.tsx";
import "../shared/base.css";
const later = import("./lazy.ts");
export const nothing = "from \" a string, not an import";"#;
        let found = module_imports(code, Path::new("/proj/src/index.tsx"));
        assert!(found.contains(&PathBuf::from("/Users/x/node_modules/react/index.js")), "{found:?}");
        assert!(found.contains(&PathBuf::from("/proj/src/./sidebar.tsx")), "{found:?}");
        assert!(found.contains(&PathBuf::from("/proj/src/../shared/base.css")), "{found:?}");
        assert!(found.contains(&PathBuf::from("/proj/src/./lazy.ts")), "{found:?}");
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
