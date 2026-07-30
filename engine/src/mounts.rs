use crate::errors::{EngineError, MountError};
use crate::types::{archetypes, MountMode, ProjectId};
use db::{
    BranchName, ChunkDeclaration, ChunkId, ChunkItem, Db, Declaration, Includes, Placement,
    PlacementType, ReadOpts,
};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Sentinel body key of an anchor row. The db (as built) requires both sides of
/// a placement to exist in its own `current_chunks` (db/src/ops/commit.rs,
/// `require_current`), while engine.md's federation pattern stores placements
/// whose other side lives in a peer mount. The engine bridges the two by
/// materializing a local *anchor* — a chunk row carrying only this sentinel —
/// for every federation-referenced id, and treating anchors as non-resident on
/// every federated read. Recorded as spec drift (engine.md "dbs are dumb" vs
/// db.md storage-time integrity) in the build report.
pub const ANCHOR_KEY: &str = "engine/anchor";

pub(crate) fn is_anchor(item: &ChunkItem) -> bool {
    item.body
        .as_ref()
        .and_then(|b| b.get(ANCHOR_KEY))
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
}

/// One mounted project: the db handle, its mode, and the branch its reads pin.
#[derive(Clone)]
pub(crate) struct MountedProject {
    pub id: ProjectId,
    pub db: Arc<Db>,
    pub mode: MountMode,
    pub branch: BranchName,
}

impl MountedProject {
    pub fn mount_instance_id(&self) -> ChunkId {
        ChunkId(format!("engine/mount:{}", self.id))
    }

    /// The branch a read against this mount runs on. Caller-requested branches
    /// apply to the active project only (branched reads); read-only mounts are
    /// pinned to their registered branch.
    pub fn read_branch(&self, requested: &BranchName) -> BranchName {
        match self.mode {
            MountMode::ReadWrite => requested.clone(),
            MountMode::ReadOnly => self.branch.clone(),
        }
    }
}

/// Mounts are mutated rarely (boot + dynamic add/remove); the lock is held only
/// for insert/remove/snapshot, never across an await (engine.md, Settled choices).
#[derive(Default)]
pub(crate) struct MountRegistry {
    map: Mutex<HashMap<ProjectId, MountedProject>>,
}

impl MountRegistry {
    pub fn insert(
        &self,
        id: ProjectId,
        db: Arc<Db>,
        mode: MountMode,
        branch: BranchName,
    ) -> Result<(), MountError> {
        let mut map = self.map.lock().unwrap();
        if map.contains_key(&id) {
            return Err(MountError::AlreadyMounted(id.0));
        }
        if mode == MountMode::ReadWrite {
            if let Some(existing) = map.values().find(|m| m.mode == MountMode::ReadWrite) {
                return Err(MountError::ActiveAlreadyMounted(existing.id.0.clone()));
            }
        }
        map.insert(
            id.clone(),
            MountedProject {
                id,
                db,
                mode,
                branch,
            },
        );
        Ok(())
    }

    pub fn remove(&self, id: &ProjectId) -> Result<(), MountError> {
        self.map
            .lock()
            .unwrap()
            .remove(id)
            .map(|_| ())
            .ok_or_else(|| MountError::NotMounted(id.0.clone()))
    }

    /// Deterministic iteration order: active project first, then peers by id.
    pub fn snapshot(&self) -> Vec<MountedProject> {
        let map = self.map.lock().unwrap();
        let mut mounts: Vec<MountedProject> = map.values().cloned().collect();
        mounts.sort_by(|a, b| {
            let rank = |m: &MountedProject| (m.mode == MountMode::ReadOnly, m.id.0.clone());
            rank(a).cmp(&rank(b))
        });
        mounts
    }

    pub fn active(&self) -> Result<MountedProject, EngineError> {
        self.snapshot()
            .into_iter()
            .find(|m| m.mode == MountMode::ReadWrite)
            .ok_or_else(|| EngineError::InvalidRequest("no active (read-write) project mounted".into()))
    }

    pub fn by_instance_id(&self, id: &str) -> Option<MountedProject> {
        let project = id.strip_prefix("engine/mount:")?;
        self.map.lock().unwrap().get(&ProjectId::from(project)).cloned()
    }

    /// Federated point read: every mount asked, first hit wins (engine.md,
    /// Federation cost). Anchor rows are skipped — they are placement
    /// scaffolding, not residency. Returns the resident mount alongside the chunk.
    pub fn federated_get(
        &self,
        chunk_id: &ChunkId,
        include: Includes,
        branch: &BranchName,
        at: Option<&db::CommitId>,
    ) -> Result<Option<(ChunkItem, MountedProject)>, EngineError> {
        for mount in self.snapshot() {
            let opts = ReadOpts {
                branch: mount.read_branch(branch),
                // Temporal reads address the active project's history; peers read current.
                at: match mount.mode {
                    MountMode::ReadWrite => at.cloned(),
                    MountMode::ReadOnly => None,
                },
                // Body forced on so the anchor sentinel is visible; stripped
                // below when the caller didn't ask for it.
                include: Includes {
                    chunk_body: true,
                    ..include
                },
            };
            if let Some(mut item) = mount.db.get(chunk_id.clone(), opts)? {
                if is_anchor(&item) {
                    continue;
                }
                if !include.chunk_body {
                    item.body = None;
                }
                return Ok(Some((item, mount)));
            }
        }
        Ok(None)
    }

    /// Extend a declaration with anchor rows for every placement side that is
    /// neither declared, nor active-resident, but resolves in a peer mount (or
    /// is engine machinery the run topology always references). Ids resolving
    /// nowhere are left for the db's own NotFound.
    pub fn add_anchors(&self, decl: &mut Declaration) -> Result<(), EngineError> {
        let active = self.active()?;
        let machinery = [
            archetypes::ENGINE_PROCESS,
            archetypes::READ_BOUNDARY,
            archetypes::WRITE_BOUNDARY,
        ];
        let declared: Vec<String> = decl
            .chunks
            .iter()
            .filter_map(|c| c.id.as_ref().map(|id| id.as_str().to_string()))
            .collect();
        let mut referenced: Vec<ChunkId> = Vec::new();
        for placement in &decl.placements {
            for id in [&placement.chunk, &placement.scope] {
                if !referenced.contains(id) {
                    referenced.push(id.clone());
                }
            }
        }
        for id in referenced {
            if declared.contains(&id.as_str().to_string())
                || archetypes::is_virtual(id.as_str())
            {
                continue;
            }
            let opts = ReadOpts {
                branch: active.branch.clone(),
                at: None,
                include: Includes::default(),
            };
            if active.db.get(id.clone(), opts)?.is_some() {
                continue; // resident (anchor rows included — one anchor suffices)
            }
            let anchorable = machinery.contains(&id.as_str())
                || self
                    .federated_get(&id, Includes::default(), &active.branch, None)?
                    .is_some();
            if anchorable {
                decl.chunks.push(ChunkDeclaration {
                    id: Some(id),
                    body: Some(serde_json::json!({ ANCHOR_KEY: true })),
                    ..ChunkDeclaration::default()
                });
            }
        }
        Ok(())
    }

    pub fn chunk_exists(&self, chunk_id: &ChunkId, branch: &BranchName) -> Result<bool, EngineError> {
        Ok(self
            .federated_get(chunk_id, Includes::default(), branch, None)?
            .is_some())
    }

    /// A chunk's placements as the federation sees them: union across mounts,
    /// deduplicated by (scope, type). Known gap (documented in the build report):
    /// placement rows for a chunk not resident in the db that stores them are
    /// invisible to the db's public read surface — the walk is fail-closed.
    pub fn placements_of(
        &self,
        chunk_id: &ChunkId,
        branch: &BranchName,
    ) -> Result<Vec<Placement>, EngineError> {
        let include = Includes {
            chunk_placements: true,
            ..Includes::default()
        };
        let mut seen: HashMap<(String, &'static str), Placement> = HashMap::new();
        for mount in self.snapshot() {
            let opts = ReadOpts {
                branch: mount.read_branch(branch),
                at: None,
                include,
            };
            if let Some(item) = mount.db.get(chunk_id.clone(), opts)? {
                for p in item.placements.unwrap_or_default() {
                    seen.entry((p.scope_id.as_str().to_string(), p.type_.as_str()))
                        .or_insert(p);
                }
            }
        }
        let mut out: Vec<Placement> = seen.into_values().collect();
        out.sort_by(|a, b| (a.scope_id.as_str(), a.type_.as_str()).cmp(&(b.scope_id.as_str(), b.type_.as_str())));
        Ok(out)
    }

    pub fn instance_parents(
        &self,
        chunk_id: &ChunkId,
        branch: &BranchName,
    ) -> Result<Vec<ChunkId>, EngineError> {
        Ok(self
            .placements_of(chunk_id, branch)?
            .into_iter()
            .filter(|p| p.type_ == PlacementType::Instance)
            .map(|p| p.scope_id)
            .collect())
    }

    /// READ_ONLY_MOUNT check, at commit entry before validation (engine.md,
    /// Read-only enforcement): a declaration is rejected only when it modifies a
    /// record *resident in* a read-only mount — a chunk stored there, or a
    /// placement row stored there. Reference is not modification.
    pub fn read_only_conflict(&self, decl: &Declaration) -> Result<Option<String>, EngineError> {
        let ro_mounts: Vec<MountedProject> = self
            .snapshot()
            .into_iter()
            .filter(|m| m.mode == MountMode::ReadOnly)
            .collect();
        for mount in &ro_mounts {
            let include = Includes {
                chunk_placements: true,
                ..Includes::default()
            };
            for chunk in &decl.chunks {
                let Some(id) = &chunk.id else { continue };
                let opts = ReadOpts {
                    branch: mount.branch.clone(),
                    at: None,
                    include: Includes {
                        chunk_body: true,
                        ..Includes::default()
                    },
                };
                // An anchor row in the peer (from its own active era) is
                // scaffolding, not residency.
                let resident = mount
                    .db
                    .get(id.clone(), opts)?
                    .map(|item| !is_anchor(&item))
                    .unwrap_or(false);
                if resident {
                    return Ok(Some(format!(
                        "chunk {id} is resident in read-only mount {}",
                        mount.id
                    )));
                }
            }
            for placement in &decl.placements {
                let opts = ReadOpts {
                    branch: mount.branch.clone(),
                    at: None,
                    include,
                };
                let resident = mount
                    .db
                    .get(placement.chunk.clone(), opts)?
                    .and_then(|item| item.placements)
                    .map(|ps| ps.iter().any(|p| p.scope_id == placement.scope))
                    .unwrap_or(false);
                if resident {
                    return Ok(Some(format!(
                        "placement {} -> {} is resident in read-only mount {}",
                        placement.chunk, placement.scope, mount.id
                    )));
                }
            }
        }
        Ok(None)
    }

    /// Boot-time validation (engine.md): every placement's scope_id must resolve
    /// in some mount (or be substrate machinery). Returns unresolved (chunk, scope) pairs.
    pub fn unresolved_references(&self) -> Result<Vec<(ChunkId, ChunkId)>, EngineError> {
        let mut unresolved = Vec::new();
        for mount in self.snapshot() {
            let opts = db::ScopeOpts {
                branch: mount.branch.clone(),
                include: Includes {
                    intersection_chunks: true,
                    chunk_placements: true,
                    ..Includes::default()
                },
                ..db::ScopeOpts::default()
            };
            let all = mount.db.scope(&[], opts)?;
            for chunk in all.chunks {
                for p in chunk.placements.unwrap_or_default() {
                    let resolved = archetypes::is_virtual(p.scope_id.as_str())
                        || self.chunk_exists(&p.scope_id, &mount.branch)?;
                    if !resolved {
                        unresolved.push((chunk.id.clone(), p.scope_id));
                    }
                }
            }
        }
        unresolved.sort();
        unresolved.dedup();
        Ok(unresolved)
    }
}
