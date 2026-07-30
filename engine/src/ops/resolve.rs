//! Name-path lookup — the board-ruled convention behind readable ids:
//! canonical chunks are found by name within scope, so surfaces and boot
//! address seeded archetypes as `host/tile`, never by hardcoded id. The first
//! segment names a root scope (a chunk with no `instance` parent, pilot.md
//! §Names and roots); each further segment is found by name among the chunks
//! placed on the previous one — any placement type, so relates-placed type
//! definitions stay resolvable (the same reading as `accepts` resolution).

use crate::boundary;
use crate::engine::Engine;
use crate::errors::EngineError;
use crate::mounts::{self, MountRegistry};
use crate::types::Context;
use db::{BranchName, ChunkId, Includes, ScopeOpts};

impl Engine {
    /// Resolve a name path (`host/tile`) to the chunk id it names, federated
    /// across all mounts on the active project's branch. Zero matches at any
    /// segment is `NOT_FOUND`; more than one is refused as ambiguous rather
    /// than silently picked — same-named chunks in separate placement trees
    /// are separate chunks (pilot.md §Names and roots).
    pub fn resolve_name(&self, ctx: &Context, path: &str) -> Result<ChunkId, EngineError> {
        let inner = &self.inner;
        let branch = inner.mounts.active()?.branch;
        let segments: Vec<&str> = path.split('/').filter(|s| !s.is_empty()).collect();
        let Some((first, rest)) = segments.split_first() else {
            return Err(EngineError::InvalidRequest("empty name path".into()));
        };

        let mut current = single(path, first, roots_named(&inner.mounts, first, &branch)?)?;
        for seg in rest {
            let found = members_named(&inner.mounts, &current, seg, &branch)?;
            current = single(path, seg, found)?;
        }

        let bctx = inner.resolve_boundaries(ctx)?;
        if !boundary::can_read_chunk(&inner.mounts, &bctx.read, bctx.process.as_ref(), &current, &branch)? {
            return Err(EngineError::BoundaryViolation(format!(
                "chunk {current} (name path '{path}') is not reachable from the read boundary"
            )));
        }
        Ok(current)
    }
}

fn single(path: &str, segment: &str, found: Vec<ChunkId>) -> Result<ChunkId, EngineError> {
    match found.as_slice() {
        [] => Err(EngineError::NotFound(format!(
            "name path '{path}': no chunk named '{segment}'"
        ))),
        [_] => Ok(found.into_iter().next().expect("one element")),
        _ => Err(EngineError::InvalidRequest(format!(
            "name path '{path}' is ambiguous at '{segment}': {} chunks match",
            found.len()
        ))),
    }
}

/// Root scopes named `name`: federated whole-field sweep, keeping chunks with
/// no `instance` parent anywhere in the field. Anchor rows are placement
/// scaffolding, never a root.
fn roots_named(
    reg: &MountRegistry,
    name: &str,
    branch: &BranchName,
) -> Result<Vec<ChunkId>, EngineError> {
    let mut out: Vec<ChunkId> = Vec::new();
    for mount in reg.snapshot() {
        let opts = ScopeOpts {
            branch: mount.read_branch(branch),
            include: Includes {
                intersection_chunks: true,
                chunk_name: true,
                chunk_body: true,
                ..Includes::default()
            },
            ..ScopeOpts::default()
        };
        let all = mount.db.scope(&[], opts)?;
        for chunk in all.chunks {
            if chunk.name.as_deref() != Some(name) || mounts::is_anchor(&chunk) {
                continue;
            }
            if out.contains(&chunk.id) {
                continue;
            }
            if reg.instance_parents(&chunk.id, branch)?.is_empty() {
                out.push(chunk.id);
            }
        }
    }
    out.sort();
    Ok(out)
}

/// Chunks named `name` placed on `scope` (any placement type). Membership rows
/// may be anchor rows carrying no name — the genuine name comes from the
/// resident record, federated.
fn members_named(
    reg: &MountRegistry,
    scope: &ChunkId,
    name: &str,
    branch: &BranchName,
) -> Result<Vec<ChunkId>, EngineError> {
    let mut candidates: Vec<ChunkId> = Vec::new();
    for mount in reg.snapshot() {
        let opts = ScopeOpts {
            branch: mount.read_branch(branch),
            include: Includes {
                intersection_chunks: true,
                ..Includes::default()
            },
            ..ScopeOpts::default()
        };
        let result = mount.db.scope(std::slice::from_ref(scope), opts)?;
        for chunk in result.chunks {
            if !candidates.contains(&chunk.id) {
                candidates.push(chunk.id);
            }
        }
    }
    let include = Includes {
        chunk_name: true,
        ..Includes::default()
    };
    let mut out = Vec::new();
    for id in candidates {
        let genuine = reg.federated_get(&id, include, branch, None)?;
        if genuine.and_then(|(item, _)| item.name).as_deref() == Some(name) {
            out.push(id);
        }
    }
    out.sort();
    Ok(out)
}
