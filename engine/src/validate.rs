//! Federated pre-validation — the engine-layer answer to the union-accepts
//! ruling's consequences (spec/research/union-accepts.md §Consequences): the db
//! validates against one connection and silently skips specs resident in peer
//! mounts, so the engine validates the composed contract across all mounts
//! before handing the declaration to the active db. Semantics follow the ruled
//! union reading: `accepts` is a license (instance of at least one type in the
//! union, ambiguity judged per contributing list), `required`/`unique` are
//! obligations (every key binds), `ordered` composes as OR. The R7 trace
//! exemption is mechanical here: placements of `engine/process` instances onto
//! a process are validated against `engine/process` only — exempt from every
//! composed accepts, not just the program's.

use crate::errors::EngineError;
use crate::mounts::MountRegistry;
use crate::types::archetypes;
use db::{BranchName, ChunkId, Declaration, Includes, Placement, PlacementType, Spec};
use std::collections::{BTreeSet, HashMap, HashSet};

/// One contributing spec, kept apart so ambiguity is judged per list.
struct Part {
    ordered: bool,
    required: Vec<String>,
    unique: Vec<String>,
    accepts_declared: bool,
    accepts: BTreeSet<String>,
}

/// The declaration overlaid on the federated current state: chunks and
/// placements in the declaration override what the mounts hold, exactly as the
/// db validates against its post-write view.
pub(crate) struct View<'a> {
    reg: &'a MountRegistry,
    branch: &'a BranchName,
    decl_chunks: HashMap<&'a str, &'a db::ChunkDeclaration>,
    added: Vec<&'a db::PlacementSpec>,
    deactivated: HashSet<(&'a str, &'a str)>,
}

impl<'a> View<'a> {
    pub fn new(reg: &'a MountRegistry, decl: &'a Declaration, branch: &'a BranchName) -> View<'a> {
        View {
            reg,
            branch,
            decl_chunks: decl
                .chunks
                .iter()
                .filter_map(|c| c.id.as_ref().map(|id| (id.as_str(), c)))
                .collect(),
            added: decl.placements.iter().filter(|p| p.active).collect(),
            deactivated: decl
                .placements
                .iter()
                .filter(|p| !p.active)
                .map(|p| (p.chunk.as_str(), p.scope.as_str()))
                .collect(),
        }
    }

    fn removed(&self, id: &str) -> bool {
        self.decl_chunks.get(id).map(|c| c.removed).unwrap_or(false)
    }

    fn spec_of(&self, id: &ChunkId) -> Result<Option<Spec>, EngineError> {
        if let Some(c) = self.decl_chunks.get(id.as_str()) {
            if c.removed {
                return Ok(None);
            }
            if c.spec.is_some() {
                return Ok(c.spec.clone());
            }
        }
        let include = Includes {
            chunk_spec: true,
            ..Includes::default()
        };
        Ok(self
            .reg
            .federated_get(id, include, self.branch, None)?
            .and_then(|(item, _)| item.spec))
    }

    fn body_of(&self, id: &ChunkId) -> Result<Option<serde_json::Value>, EngineError> {
        if let Some(c) = self.decl_chunks.get(id.as_str()) {
            if c.removed {
                return Ok(None);
            }
            if c.body.is_some() {
                return Ok(c.body.clone());
            }
        }
        let include = Includes {
            chunk_body: true,
            ..Includes::default()
        };
        Ok(self
            .reg
            .federated_get(id, include, self.branch, None)?
            .and_then(|(item, _)| item.body))
    }

    fn name_of(&self, id: &ChunkId) -> Result<Option<String>, EngineError> {
        if let Some(c) = self.decl_chunks.get(id.as_str()) {
            if c.removed {
                return Ok(None);
            }
            if c.name.is_some() {
                return Ok(c.name.clone());
            }
        }
        let include = Includes {
            chunk_name: true,
            ..Includes::default()
        };
        Ok(self
            .reg
            .federated_get(id, include, self.branch, None)?
            .and_then(|(item, _)| item.name))
    }

    fn placements_of(&self, id: &ChunkId) -> Result<Vec<Placement>, EngineError> {
        let mut out: Vec<Placement> = self
            .reg
            .placements_of(id, self.branch)?
            .into_iter()
            .filter(|p| !self.deactivated.contains(&(id.as_str(), p.scope_id.as_str())))
            .collect();
        for p in self.added.iter().filter(|p| p.chunk == *id) {
            if !out.iter().any(|e| e.scope_id == p.scope && e.type_ == p.type_) {
                out.push(Placement {
                    scope_id: p.scope.clone(),
                    type_: p.type_,
                    seq: p.seq,
                });
            }
        }
        Ok(out)
    }

    fn instance_parents(&self, id: &ChunkId) -> Result<Vec<ChunkId>, EngineError> {
        Ok(self
            .placements_of(id)?
            .into_iter()
            .filter(|p| p.type_ == PlacementType::Instance)
            .map(|p| p.scope_id)
            .collect())
    }

    fn transitive_instance_ancestors(&self, id: &ChunkId) -> Result<Vec<ChunkId>, EngineError> {
        let mut seen: HashSet<String> = HashSet::new();
        let mut frontier = vec![id.clone()];
        let mut out = Vec::new();
        while let Some(current) = frontier.pop() {
            for parent in self.instance_parents(&current)? {
                if seen.insert(parent.as_str().to_string()) {
                    out.push(parent.clone());
                    frontier.push(parent);
                }
            }
        }
        Ok(out)
    }

    fn is_instance_of(&self, id: &ChunkId, archetype: &str) -> Result<bool, EngineError> {
        Ok(self
            .transitive_instance_ancestors(id)?
            .iter()
            .any(|a| a.as_str() == archetype))
    }

    /// Members of a scope (chunks placed on it), federated plus in-declaration.
    /// Used for name-uniqueness, unique keys, and accepts-name resolution.
    fn members_of(&self, scope: &ChunkId) -> Result<Vec<(ChunkId, PlacementType)>, EngineError> {
        let mut out: Vec<(ChunkId, PlacementType)> = Vec::new();
        for mount in self.reg.snapshot() {
            let opts = db::ScopeOpts {
                branch: mount.read_branch(self.branch),
                include: Includes {
                    intersection_chunks: true,
                    chunk_placements: true,
                    ..Includes::default()
                },
                ..db::ScopeOpts::default()
            };
            let result = mount.db.scope(std::slice::from_ref(scope), opts)?;
            for chunk in result.chunks {
                if self.removed(chunk.id.as_str()) {
                    continue;
                }
                for p in chunk.placements.unwrap_or_default() {
                    if p.scope_id == *scope
                        && !self
                            .deactivated
                            .contains(&(chunk.id.as_str(), scope.as_str()))
                        && !out.iter().any(|(id, t)| *id == chunk.id && *t == p.type_)
                    {
                        out.push((chunk.id.clone(), p.type_));
                    }
                }
            }
        }
        for p in self.added.iter().filter(|p| p.scope == *scope) {
            if !out.iter().any(|(id, t)| *id == p.chunk && *t == p.type_) {
                out.push((p.chunk.clone(), p.type_));
            }
        }
        Ok(out)
    }

    /// Chunks named `name` placed on `scope` — any placement type (type
    /// definitions are relates-placed and must stay resolvable).
    fn resolve_name(&self, scope: &ChunkId, name: &str) -> Result<Vec<ChunkId>, EngineError> {
        let mut out = Vec::new();
        for (id, _) in self.members_of(scope)? {
            if self.name_of(&id)?.as_deref() == Some(name) && !out.contains(&id) {
                out.push(id);
            }
        }
        Ok(out)
    }

    /// The composed contract for chunks placed instance on `scope`: the scope's
    /// own non-propagating spec plus the propagating spec of every archetype the
    /// scope is transitively instance of — parts kept separate.
    fn contract_parts(&self, scope: &ChunkId) -> Result<Vec<Part>, EngineError> {
        let mut parts = Vec::new();
        if let Some(own) = self.spec_of(scope)? {
            if !own.propagate && !own.is_empty() {
                parts.push(self.to_part(scope, &own)?);
            }
        }
        for ancestor in self.transitive_instance_ancestors(scope)? {
            if let Some(spec) = self.spec_of(&ancestor)? {
                if spec.propagate {
                    parts.push(self.to_part(&ancestor, &spec)?);
                }
            }
        }
        Ok(parts)
    }

    fn to_part(&self, resolution_scope: &ChunkId, spec: &Spec) -> Result<Part, EngineError> {
        let mut accepts = BTreeSet::new();
        for name in &spec.accepts {
            for id in self.resolve_name(resolution_scope, name)? {
                accepts.insert(id.as_str().to_string());
            }
        }
        Ok(Part {
            ordered: spec.ordered,
            required: spec.required.clone(),
            unique: spec.unique.clone(),
            accepts_declared: !spec.accepts.is_empty(),
            accepts,
        })
    }
}

/// Whether the effective contract of a single-root scope orders its members —
/// used by federated scope reads for windowing.
pub(crate) fn is_ordered_scope(
    reg: &MountRegistry,
    scope: &ChunkId,
    branch: &BranchName,
) -> Result<bool, EngineError> {
    let empty = Declaration::default();
    let view = View::new(reg, &empty, branch);
    Ok(view.contract_parts(scope)?.iter().any(|p| p.ordered))
}

/// Validate a declaration against the federated composed contracts. Runs before
/// the active db's own (local-only) validation; a declaration that passes here
/// may still fail there — the db is the backstop for what it can see.
pub(crate) fn check_declaration(
    reg: &MountRegistry,
    decl: &Declaration,
    branch: &BranchName,
) -> Result<(), EngineError> {
    let view = View::new(reg, decl, branch);

    // Check targets: every instance placement declared, plus every instance
    // placement of a chunk whose record changes (a body edit can violate a
    // peer-required key even with no new placement).
    let mut targets: Vec<(ChunkId, ChunkId, Option<i64>)> = decl
        .placements
        .iter()
        .filter(|p| p.active && p.type_ == PlacementType::Instance)
        .map(|p| (p.chunk.clone(), p.scope.clone(), p.seq))
        .collect();
    for chunk in decl.chunks.iter().filter(|c| !c.removed) {
        let Some(id) = &chunk.id else { continue };
        for p in view.placements_of(id)? {
            if p.type_ == PlacementType::Instance
                && !targets.iter().any(|(c, s, _)| c == id && *s == p.scope_id)
            {
                targets.push((id.clone(), p.scope_id, p.seq));
            }
        }
    }

    for (chunk, scope, seq) in &targets {
        check_placement(&view, chunk, scope, *seq)?;
    }
    Ok(())
}

fn check_placement(
    view: &View,
    chunk: &ChunkId,
    scope: &ChunkId,
    seq: Option<i64>,
) -> Result<(), EngineError> {
    if archetypes::is_virtual(scope.as_str()) {
        return Ok(()); // db rejects virtual writes itself
    }

    // R7 — trace nesting is exempt from typed accepts: a process placed onto a
    // process is trace, not content; it validates against engine/process only
    // (whose spec carries no obligations), never against any composed accepts.
    if view.is_instance_of(chunk, archetypes::ENGINE_PROCESS)?
        && view.is_instance_of(scope, archetypes::ENGINE_PROCESS)?
    {
        return Ok(());
    }

    let parts = view.contract_parts(scope)?;
    if parts.is_empty() {
        return check_name_unique(view, chunk, scope);
    }

    if parts.iter().any(|p| p.ordered) && seq.is_none() {
        return Err(violation(scope, "ordered scope requires seq"));
    }

    let declared: Vec<&Part> = parts.iter().filter(|p| p.accepts_declared).collect();
    if !declared.is_empty() {
        let memberships: BTreeSet<String> = view
            .instance_parents(chunk)?
            .into_iter()
            .map(|p| p.as_str().to_string())
            .collect();
        // Ambiguity per contributing list (union-accepts delta 1).
        for part in &declared {
            if memberships.intersection(&part.accepts).count() >= 2 {
                return Err(violation(scope, "ambiguous type within one accepts list"));
            }
        }
        // License: instance of at least one type in the union.
        let union: BTreeSet<&String> = declared.iter().flat_map(|p| p.accepts.iter()).collect();
        if !memberships.iter().any(|m| union.contains(m)) {
            return Err(violation(scope, "chunk is no instance of an accepted type"));
        }
    }

    let body = view.body_of(chunk)?.unwrap_or(serde_json::Value::Null);
    for part in &parts {
        for key in &part.required {
            if body.get(key).is_none() {
                return Err(violation(scope, &format!("required key '{key}' missing")));
            }
        }
    }

    let unique_keys: BTreeSet<&String> = parts.iter().flat_map(|p| p.unique.iter()).collect();
    if !unique_keys.is_empty() {
        let siblings = instance_siblings(view, chunk, scope)?;
        for key in unique_keys {
            let Some(value) = body.get(key) else { continue };
            for sibling in &siblings {
                let other = view.body_of(sibling)?.unwrap_or(serde_json::Value::Null);
                if other.get(key) == Some(value) {
                    return Err(violation(scope, &format!("unique key '{key}' collides")));
                }
            }
        }
    }

    check_name_unique(view, chunk, scope)
}

fn check_name_unique(view: &View, chunk: &ChunkId, scope: &ChunkId) -> Result<(), EngineError> {
    let Some(name) = view.name_of(chunk)? else {
        return Ok(());
    };
    for sibling in instance_siblings(view, chunk, scope)? {
        if view.name_of(&sibling)?.as_deref() == Some(name.as_str()) {
            return Err(violation(scope, &format!("name '{name}' collides")));
        }
    }
    Ok(())
}

fn instance_siblings(
    view: &View,
    chunk: &ChunkId,
    scope: &ChunkId,
) -> Result<Vec<ChunkId>, EngineError> {
    Ok(view
        .members_of(scope)?
        .into_iter()
        .filter(|(id, t)| *t == PlacementType::Instance && id != chunk)
        .map(|(id, _)| id)
        .collect())
}

fn violation(scope: &ChunkId, message: &str) -> EngineError {
    EngineError::ValidationError(format!("spec violation on scope {scope}: {message}"))
}
