//! The transpile lane behind `ol://`: one long-lived `bun` process running
//! [`serve.ts`](serve.ts), plus a cache on disk. The host asks it for one file
//! at a time and gets back an ES module whose bare imports are already `ol://`
//! URLs.
//!
//! A persistent process rather than a `bun` invocation per file: resolution and
//! the TSX transform are both bun's, and one start-up (~40 ms) amortized over a
//! program's whole module graph is the difference between a visible stall on
//! every boot and none.
//!
//! The cache mirrors the source tree under `target/ol-modules/` (gitignored,
//! never in the source tree) and is keyed by path and mtime: a cached module is
//! used only while it is newer than the file it came from. **Known edge:** a
//! CJS dep's module is a bundle of that package's files, and only the entry's
//! mtime is checked — packages under `node_modules` do not change in place.

use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;

/// The helper travels inside the binary and is written out beside the cache —
/// the host never reads its own source tree at runtime.
const HELPER: &str = include_str!("serve.ts");

pub struct Transpiler {
    /// The handler runs on the event loop's thread; the lock is the honest
    /// statement that the pipe carries one request at a time.
    pipe: Mutex<Pipe>,
    cache: PathBuf,
    next_id: AtomicU64,
    /// Kept so the child is killed when the host drops it.
    child: Mutex<Child>,
}

struct Pipe {
    stdin: ChildStdin,
    stdout: BufReader<ChildStdout>,
}

impl Transpiler {
    /// Start the helper. `cache` is created if absent; the helper script is
    /// written beside it.
    pub fn start(cache: &Path) -> Result<Transpiler, String> {
        std::fs::create_dir_all(cache).map_err(|e| format!("cache dir: {e}"))?;
        let script = cache.join("serve.ts");
        std::fs::write(&script, HELPER).map_err(|e| format!("writing the helper: {e}"))?;

        let mut child = Command::new("bun")
            .arg("run")
            .arg(&script)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("spawning bun: {e}"))?;
        let stdin = child.stdin.take().ok_or("bun stdin")?;
        let stdout = BufReader::new(child.stdout.take().ok_or("bun stdout")?);

        Ok(Transpiler {
            pipe: Mutex::new(Pipe { stdin, stdout }),
            cache: cache.to_path_buf(),
            next_id: AtomicU64::new(1),
            child: Mutex::new(child),
        })
    }

    /// The module for one file: from cache when it is newer than the source,
    /// from bun otherwise.
    pub fn module(&self, path: &Path) -> Result<String, String> {
        let cached = self.cache_path(path);
        if is_fresh(&cached, path) {
            if let Ok(code) = std::fs::read_to_string(&cached) {
                return Ok(code);
            }
        }
        let code = self.ask(path)?;
        if let Some(parent) = cached.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let _ = std::fs::write(&cached, &code);
        Ok(code)
    }

    fn cache_path(&self, path: &Path) -> PathBuf {
        let relative = path.strip_prefix("/").unwrap_or(path);
        let mut cached = self.cache.join(relative);
        let name = format!(
            "{}.js",
            cached.file_name().unwrap_or_default().to_string_lossy()
        );
        cached.set_file_name(name);
        cached
    }

    fn ask(&self, path: &Path) -> Result<String, String> {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        let request = serde_json::json!({ "id": id, "path": path.to_string_lossy() }).to_string();

        let mut pipe = self.pipe.lock().map_err(|_| "transpiler poisoned".to_string())?;
        writeln!(pipe.stdin, "{request}").map_err(|e| format!("bun stdin: {e}"))?;
        pipe.stdin.flush().map_err(|e| format!("bun stdin: {e}"))?;

        let mut line = String::new();
        let read = pipe.stdout.read_line(&mut line).map_err(|e| format!("bun stdout: {e}"))?;
        if read == 0 {
            return Err("the transpiler exited".into());
        }
        let answer: serde_json::Value =
            serde_json::from_str(&line).map_err(|e| format!("transpiler answer: {e}"))?;
        if answer["id"].as_u64() != Some(id) {
            return Err("transpiler answered out of order".into());
        }
        if answer["ok"] == serde_json::Value::Bool(true) {
            return answer["code"]
                .as_str()
                .map(str::to_string)
                .ok_or_else(|| "transpiler answered without code".to_string());
        }
        Err(answer["error"].as_str().unwrap_or("unknown transpile failure").to_string())
    }
}

impl Drop for Transpiler {
    fn drop(&mut self) {
        if let Ok(mut child) = self.child.lock() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}

fn is_fresh(cached: &Path, source: &Path) -> bool {
    let (Ok(a), Ok(b)) = (std::fs::metadata(cached), std::fs::metadata(source)) else {
        return false;
    };
    match (a.modified(), b.modified()) {
        (Ok(cached_at), Ok(source_at)) => cached_at >= source_at,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp(tag: &str) -> PathBuf {
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!("ol-transpile-{tag}-{nanos:x}"))
    }

    #[test]
    fn the_cache_mirrors_the_source_tree_under_one_root() {
        let dir = temp("cache");
        let transpiler = Transpiler::start(&dir).expect("bun on PATH");
        let cached = transpiler.cache_path(Path::new("/a/b/index.tsx"));
        assert_eq!(cached, dir.join("a/b/index.tsx.js"));
        // Two files that differ only in extension never share a cache entry.
        assert_ne!(cached, transpiler.cache_path(Path::new("/a/b/index.ts")));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn a_cached_module_older_than_its_source_is_not_used() {
        let dir = temp("fresh");
        std::fs::create_dir_all(&dir).unwrap();
        let source = dir.join("x.ts");
        let cached = dir.join("x.ts.js");
        std::fs::write(&cached, "old").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(20));
        std::fs::write(&source, "new").unwrap();
        assert!(!is_fresh(&cached, &source));
        std::fs::write(&cached, "newer").unwrap();
        assert!(is_fresh(&cached, &source));
        assert!(!is_fresh(&dir.join("absent.js"), &source));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn a_source_file_becomes_a_module_whose_bare_imports_are_urls() {
        let dir = temp("module");
        std::fs::create_dir_all(&dir).unwrap();
        let source = dir.join("greet.tsx");
        std::fs::write(
            &source,
            "import { relative } from './other.ts'\nexport const n: number = relative ? 1 : 2\n",
        )
        .unwrap();

        let transpiler = Transpiler::start(&dir.join("cache")).expect("bun on PATH");
        let code = transpiler.module(&source).expect("a module");
        assert!(code.contains("export"), "{code}");
        // A relative import is left as written: the browser resolves it against
        // this module's own URL, which is this file's path.
        assert!(code.contains("./other.ts"), "{code}");
        // Types are gone — this is JavaScript now.
        assert!(!code.contains(": number"), "{code}");

        // The second read comes from the cache, not from bun.
        assert!(transpiler.cache_path(&source).exists());
        assert_eq!(transpiler.module(&source).unwrap(), code);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn a_broken_file_fails_with_the_transpiler_s_own_words() {
        let dir = temp("broken");
        std::fs::create_dir_all(&dir).unwrap();
        let source = dir.join("bad.ts");
        std::fs::write(&source, "export const = = =\n").unwrap();
        let transpiler = Transpiler::start(&dir.join("cache")).expect("bun on PATH");
        let error = transpiler.module(&source).expect_err("a syntax error is an error");
        assert!(!error.is_empty(), "the failure carries a message");
        assert!(!transpiler.cache_path(&source).exists(), "a failure is never cached");
        let _ = std::fs::remove_dir_all(&dir);
    }
}
