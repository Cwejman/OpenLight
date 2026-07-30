//! The mounts cascade walk (host.md §Boot sequence, step 3; pilot.md
//! §Multi-project mounts): read the active project's `.ol/project.toml`,
//! recurse into each mount's own config, deduplicate by canonical path,
//! reject cycles. File access is injected so the walk itself stays pure.

use serde::Deserialize;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq)]
pub struct ProjectConfig {
    pub name: String,
    pub mounts: Vec<MountDecl>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct MountDecl {
    /// As declared — relative paths resolve against the declaring project.
    pub path: String,
    pub branch: String,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ResolvedProject {
    pub path: PathBuf,
    pub name: String,
    /// The branch this project's reads pin. The active project's own entry
    /// carries the default branch — nobody mounts it.
    pub branch: String,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Cascade {
    pub active: ResolvedProject,
    /// Peers in first-encountered order, deduplicated by canonical path.
    pub peers: Vec<ResolvedProject>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CascadeError {
    Load { path: PathBuf, message: String },
    Parse { path: PathBuf, message: String },
    /// A project reachable from itself through mounts.
    Cycle { path: PathBuf },
    /// host.md step 3: the host and engine projects must appear.
    MissingRequired { name: String },
}

impl std::fmt::Display for CascadeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CascadeError::Load { path, message } => {
                write!(f, "cannot load {}: {message}", path.display())
            }
            CascadeError::Parse { path, message } => {
                write!(f, "cannot parse {}: {message}", path.display())
            }
            CascadeError::Cycle { path } => {
                write!(f, "mount cycle through {}", path.display())
            }
            CascadeError::MissingRequired { name } => write!(
                f,
                "the {name} project is missing from the mounts cascade — declare it in .ol/project.toml"
            ),
        }
    }
}

/// A loader canonicalizes a project path and yields its `.ol/project.toml`
/// text. The filesystem one is [`fs_loader`]; tests inject maps.
pub type LoadResult = Result<(PathBuf, String), String>;

pub fn parse_project_toml(text: &str) -> Result<ProjectConfig, String> {
    #[derive(Deserialize)]
    struct File {
        project: Project,
        #[serde(default)]
        mounts: Vec<Mount>,
    }
    #[derive(Deserialize)]
    struct Project {
        name: String,
    }
    #[derive(Deserialize)]
    struct Mount {
        path: String,
        #[serde(default = "default_branch")]
        branch: String,
    }
    fn default_branch() -> String {
        "main".to_string()
    }

    let file: File = toml::from_str(text).map_err(|e| e.to_string())?;
    Ok(ProjectConfig {
        name: file.project.name,
        mounts: file
            .mounts
            .into_iter()
            .map(|m| MountDecl { path: m.path, branch: m.branch })
            .collect(),
    })
}

/// Walk the cascade from the active project. Dedup is by canonical path; the
/// first declaration encountered pre-order pins a mount's branch, so the
/// declarer nearest the active project wins. A path still on the recursion
/// stack is a cycle and rejects.
pub fn walk(
    active: &Path,
    load: &mut dyn FnMut(&Path) -> LoadResult,
) -> Result<Cascade, CascadeError> {
    let mut walker = Walker {
        load,
        names: HashMap::new(),
        pins: HashMap::new(),
        order: Vec::new(),
        stack: Vec::new(),
    };
    let (active_canonical, text) = walker.load(active)?;
    walker.visit(active_canonical.clone(), text)?;

    let resolve = |walker: &Walker, path: &PathBuf| ResolvedProject {
        path: path.clone(),
        name: walker.names.get(path).expect("visited projects are named").clone(),
        branch: walker.pins.get(path).cloned().unwrap_or_else(|| "main".to_string()),
    };
    let peers: Vec<ResolvedProject> = walker
        .order
        .iter()
        .filter(|p| **p != active_canonical)
        .map(|p| resolve(&walker, p))
        .collect();
    let active_project = resolve(&walker, &active_canonical);
    Ok(Cascade { active: active_project, peers })
}

/// Refuse a cascade missing the named required projects (host.md step 3).
pub fn require(cascade: &Cascade, names: &[&str]) -> Result<(), CascadeError> {
    for name in names {
        let present = cascade.active.name == *name || cascade.peers.iter().any(|p| p.name == *name);
        if !present {
            return Err(CascadeError::MissingRequired { name: name.to_string() });
        }
    }
    Ok(())
}

struct Walker<'a> {
    load: &'a mut dyn FnMut(&Path) -> LoadResult,
    names: HashMap<PathBuf, String>,
    /// Branch per canonical path — set at declaration, before descent.
    pins: HashMap<PathBuf, String>,
    order: Vec<PathBuf>,
    stack: Vec<PathBuf>,
}

impl Walker<'_> {
    fn load(&mut self, path: &Path) -> Result<(PathBuf, String), CascadeError> {
        (self.load)(path).map_err(|message| CascadeError::Load {
            path: path.to_path_buf(),
            message,
        })
    }

    fn visit(&mut self, canonical: PathBuf, text: String) -> Result<(), CascadeError> {
        if self.stack.contains(&canonical) {
            return Err(CascadeError::Cycle { path: canonical });
        }
        if self.names.contains_key(&canonical) {
            return Ok(()); // dedupe by canonical path
        }
        let config = parse_project_toml(&text).map_err(|message| CascadeError::Parse {
            path: canonical.clone(),
            message,
        })?;
        self.names.insert(canonical.clone(), config.name);
        self.order.push(canonical.clone());
        self.stack.push(canonical.clone());
        // Pin every declared branch before descending into any mount, so this
        // declarer's pins beat its mounts' transitive ones.
        let mut children = Vec::new();
        for mount in &config.mounts {
            let target = canonical.join(&mount.path);
            let (child, child_text) = self.load(&target)?;
            self.pins.entry(child.clone()).or_insert_with(|| mount.branch.clone());
            children.push((child, child_text));
        }
        for (child, child_text) in children {
            self.visit(child, child_text)?;
        }
        self.stack.pop();
        Ok(())
    }
}

/// The filesystem loader: canonicalize the project directory, read
/// `.ol/project.toml` beneath it.
pub fn fs_loader(path: &Path) -> LoadResult {
    let canonical = path
        .canonicalize()
        .map_err(|e| format!("no such project directory: {e}"))?;
    let config = canonical.join(".ol").join("project.toml");
    let text = std::fs::read_to_string(&config)
        .map_err(|e| format!("no .ol/project.toml: {e}"))?;
    Ok((canonical, text))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Map-backed loader; canonicalization is lexical normalization so tests
    /// exercise relative mount paths without touching the filesystem.
    fn loader(
        projects: Vec<(&'static str, &'static str)>,
    ) -> impl FnMut(&Path) -> LoadResult {
        let map: HashMap<PathBuf, String> = projects
            .into_iter()
            .map(|(p, text)| (PathBuf::from(p), text.to_string()))
            .collect();
        move |path: &Path| {
            let canonical = normalize(path);
            match map.get(&canonical) {
                Some(text) => Ok((canonical, text.clone())),
                None => Err("no such project".into()),
            }
        }
    }

    fn normalize(path: &Path) -> PathBuf {
        let mut out = PathBuf::new();
        for component in path.components() {
            match component {
                std::path::Component::ParentDir => {
                    out.pop();
                }
                std::path::Component::CurDir => {}
                other => out.push(other),
            }
        }
        out
    }

    const AGENTS: &str = r#"
[project]
name = "agents"

[[mounts]]
path = "../host"
branch = "main"

[[mounts]]
path = "../engine"
"#;
    const HOST: &str = r#"
[project]
name = "host"

[[mounts]]
path = "../engine"
branch = "v1"
"#;
    const ENGINE: &str = "[project]\nname = \"engine\"\n";

    #[test]
    fn parses_name_mounts_and_default_branch() {
        let config = parse_project_toml(AGENTS).unwrap();
        assert_eq!(config.name, "agents");
        assert_eq!(config.mounts.len(), 2);
        assert_eq!(config.mounts[0].branch, "main");
        assert_eq!(config.mounts[1].path, "../engine");
        assert_eq!(config.mounts[1].branch, "main", "branch defaults to main");
    }

    #[test]
    fn walks_transitively_and_dedupes_by_canonical_path() {
        // Diamond: agents -> host -> engine and agents -> engine directly.
        let mut load = loader(vec![
            ("/r/agents", AGENTS),
            ("/r/host", HOST),
            ("/r/engine", ENGINE),
        ]);
        let cascade = walk(Path::new("/r/agents"), &mut load).unwrap();
        assert_eq!(cascade.active.name, "agents");
        let names: Vec<&str> = cascade.peers.iter().map(|p| p.name.as_str()).collect();
        assert_eq!(names, ["host", "engine"], "each project once, first-encountered order");
    }

    #[test]
    fn first_encountered_branch_pins_the_mount() {
        // agents declares engine on main before host's v1 declaration is seen.
        let mut load = loader(vec![
            ("/r/agents", AGENTS),
            ("/r/host", HOST),
            ("/r/engine", ENGINE),
        ]);
        let cascade = walk(Path::new("/r/agents"), &mut load).unwrap();
        let engine = cascade.peers.iter().find(|p| p.name == "engine").unwrap();
        assert_eq!(engine.branch, "main");
    }

    #[test]
    fn cycles_reject() {
        let a = "[project]\nname = \"a\"\n[[mounts]]\npath = \"../b\"\n";
        let b = "[project]\nname = \"b\"\n[[mounts]]\npath = \"../a\"\n";
        let mut load = loader(vec![("/r/a", a), ("/r/b", b)]);
        assert_eq!(
            walk(Path::new("/r/a"), &mut load),
            Err(CascadeError::Cycle { path: PathBuf::from("/r/a") })
        );
    }

    #[test]
    fn missing_mount_is_a_load_error() {
        let mut load = loader(vec![("/r/agents", AGENTS)]);
        match walk(Path::new("/r/agents"), &mut load) {
            Err(CascadeError::Load { path, .. }) => assert_eq!(path, PathBuf::from("/r/agents/../host")),
            other => panic!("expected load error, got {other:?}"),
        }
    }

    #[test]
    fn require_names_the_missing_project() {
        let mut load = loader(vec![("/r/engine", ENGINE)]);
        let cascade = walk(Path::new("/r/engine"), &mut load).unwrap();
        assert!(require(&cascade, &["engine"]).is_ok());
        assert_eq!(
            require(&cascade, &["host", "engine"]),
            Err(CascadeError::MissingRequired { name: "host".into() })
        );
    }
}
