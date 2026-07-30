use crate::boundary::{self, BoundaryCtx};
use crate::engine::Engine;
use crate::errors::EngineError;
use crate::mounts::{MountRegistry, MountedProject};
use crate::types::{archetypes, Context, MountMode};
use crate::validate;
use db::{ChunkId, ChunkItem, CommitId, Dim, Placement, PlacementType, ScopeOpts, ScopeResult};
use serde_json::json;
use std::collections::HashMap;

impl Engine {
    /// Read the intersection of scopes, federated across all mounts, filtered
    /// by the effective read boundary. Mount-instance roots narrow the
    /// federation; `engine/mount` lists the registry; `db/*` virtual roots
    /// project per mount and union.
    pub fn scope(
        &self,
        ctx: &Context,
        scopes: &[ChunkId],
        opts: ScopeOpts,
    ) -> Result<ScopeResult, EngineError> {
        let inner = &self.inner;
        let bctx = inner.resolve_boundaries(ctx)?;

        for root in scopes.iter().chain(opts.exclude.iter()) {
            if !boundary::can_open(&inner.mounts, &bctx.read, bctx.process.as_ref(), root, &opts.branch)? {
                return Err(EngineError::BoundaryViolation(format!(
                    "scope {root} is not reachable from the read boundary"
                )));
            }
        }

        let (mount_filter, roots): (Vec<&ChunkId>, Vec<ChunkId>) = {
            let (filters, rest): (Vec<&ChunkId>, Vec<&ChunkId>) = scopes
                .iter()
                .partition(|s| archetypes::is_mount_instance(s.as_str()));
            (filters, rest.into_iter().cloned().collect())
        };
        let mounts = select_mounts(&inner.mounts, &mount_filter)?;

        if roots.first().map(|r| r.as_str()) == Some(archetypes::ENGINE_MOUNT) {
            return Ok(mount_listing(&mounts, &opts));
        }
        federated_scope(&inner.mounts, &mounts, &bctx, &roots, &opts)
    }
}

fn select_mounts(
    reg: &MountRegistry,
    filter: &[&ChunkId],
) -> Result<Vec<MountedProject>, EngineError> {
    if filter.is_empty() {
        return Ok(reg.snapshot());
    }
    filter
        .iter()
        .map(|id| {
            reg.by_instance_id(id.as_str())
                .ok_or_else(|| EngineError::NotFound(format!("mount {id} is not mounted")))
        })
        .collect()
}

/// `engine/mount` — both archetype and instances synthesized from the live
/// registry, never stored (engine.md, Program and Process).
fn mount_listing(mounts: &[MountedProject], opts: &ScopeOpts) -> ScopeResult {
    let chunks: Vec<ChunkItem> = mounts.iter().map(mount_instance_item).collect();
    let n = chunks.len() as u64;
    ScopeResult {
        head: CommitId::from(""),
        total: n,
        in_scope: n,
        in_scope_instance: n,
        in_scope_relates: 0,
        chunks: if opts.include.intersection_chunks {
            chunks
        } else {
            Vec::new()
        },
        dimensions: Vec::new(),
        // Virtual scope: roots are synthetic, never dead.
        unresolved: Vec::new(),
    }
}

pub(crate) fn mount_instance_item(mount: &MountedProject) -> ChunkItem {
    ChunkItem {
        id: mount.mount_instance_id(),
        name: Some(mount.id.0.clone()),
        spec: None,
        body: Some(json!({
            "project_id": mount.id.0,
            "branch": mount.branch.as_str(),
            "mode": match mount.mode { MountMode::ReadWrite => "read-write", MountMode::ReadOnly => "read-only" },
        })),
        placements: Some(vec![Placement {
            scope_id: ChunkId::from(archetypes::ENGINE_MOUNT),
            type_: PlacementType::Instance,
            seq: None,
        }]),
    }
}

/// The federated read core. Each mount is queried unpaged with the caller's
/// filters; results union. A chunk's placements are only visible in its
/// resident db (public read surface), so per-mount queries partition the field
/// — no dedupe needed, and intersection/exclude/FTS compose per mount.
/// Ordering and pagination happen after the merge, on the whole set.
pub(crate) fn federated_scope(
    reg: &MountRegistry,
    mounts: &[MountedProject],
    bctx: &BoundaryCtx,
    roots: &[ChunkId],
    opts: &ScopeOpts,
) -> Result<ScopeResult, EngineError> {
    let mut merged: Vec<(ChunkItem, MountedProject)> = Vec::new();
    let mut total = 0u64;
    let mut head = CommitId::from("");
    let mut counts = (0u64, 0u64, 0u64);
    let mut dims: Vec<Dim> = Vec::new();

    // A root is genuinely unresolved only when no mount resolves it —
    // each db reports its own residency; the field-level truth is the
    // intersection (db's peers fixture pins the per-db half).
    let mut unresolved_acc: Option<Vec<ChunkId>> = None;
    for mount in mounts {
        let mount_opts = ScopeOpts {
            branch: mount.read_branch(&opts.branch),
            at: match mount.mode {
                MountMode::ReadWrite => opts.at.clone(),
                MountMode::ReadOnly => None,
            },
            match_: opts.match_.clone(),
            exclude: opts.exclude.clone(),
            limit: None,
            offset: None,
            include: db::Includes {
                intersection_chunks: true,
                chunk_placements: true,
                // Body forced on so anchor sentinels are visible; stripped
                // after the merge when the caller didn't ask for bodies.
                chunk_body: true,
                dimensions: opts.include.dimensions,
                edges: opts.include.edges,
                ..opts.include
            },
        };
        let result = mount.db.scope(roots, mount_opts)?;
        total += result.total;
        counts.0 += result.in_scope;
        counts.1 += result.in_scope_instance;
        counts.2 += result.in_scope_relates;
        unresolved_acc = Some(match unresolved_acc {
            None => result.unresolved.clone(),
            Some(prev) => prev
                .into_iter()
                .filter(|id| result.unresolved.contains(id))
                .collect(),
        });
        if mount.mode == MountMode::ReadWrite || head.as_str().is_empty() {
            head = result.head.clone();
        }
        merge_dims(&mut dims, result.dimensions);
        merged.extend(result.chunks.into_iter().map(|c| (c, mount.clone())));
    }

    // Whole-field reads are not scoped by an opened door; filter per chunk.
    if roots.is_empty() && !bctx.read.is_universal() {
        let branch = &opts.branch;
        let mut kept = Vec::new();
        for (chunk, mount) in merged {
            if boundary::can_read_chunk(reg, &bctx.read, bctx.process.as_ref(), &chunk.id, branch)? {
                kept.push((chunk, mount));
            }
        }
        counts.0 = kept.len() as u64;
        counts.1 = counts.0;
        counts.2 = counts.0;
        merged = kept;
    }

    let ordered = roots.len() == 1 && validate::is_ordered_scope(reg, &roots[0], &opts.branch)?;
    if ordered {
        let seq_of = |item: &ChunkItem| {
            item.placements
                .as_ref()
                .and_then(|ps| {
                    ps.iter()
                        .find(|p| p.scope_id == roots[0] && p.seq.is_some())
                        .and_then(|p| p.seq)
                })
                .unwrap_or(i64::MAX)
        };
        merged.sort_by_key(|(item, _)| seq_of(item));
    } else {
        merged.sort_by(|(a, _), (b, _)| a.id.cmp(&b.id));
    }

    // Anchor rows surface as members when a peer-resident chunk is placed
    // locally; substitute the genuine federated record (placements merged from
    // both sides), drop anchors resolving nowhere.
    let mut resolved: Vec<(ChunkItem, MountedProject)> = Vec::new();
    for (item, mount) in merged {
        if !crate::mounts::is_anchor(&item) {
            resolved.push((item, mount));
            continue;
        }
        match reg.federated_get(&item.id, opts.include, &opts.branch, None)? {
            Some((mut genuine, resident)) => {
                if opts.include.chunk_placements {
                    let mut placements = genuine.placements.take().unwrap_or_default();
                    for p in item.placements.into_iter().flatten() {
                        if !placements
                            .iter()
                            .any(|e| e.scope_id == p.scope_id && e.type_ == p.type_)
                        {
                            placements.push(p);
                        }
                    }
                    genuine.placements = Some(placements);
                }
                resolved.push((genuine, resident));
            }
            None => {
                counts.0 = counts.0.saturating_sub(1);
                counts.1 = counts.1.saturating_sub(1);
                counts.2 = counts.2.saturating_sub(1);
                total = total.saturating_sub(1);
            }
        }
    }

    let windowed = window(resolved, ordered, opts.limit, opts.offset);

    let chunks: Vec<ChunkItem> = windowed
        .into_iter()
        .map(|(mut item, mount)| {
            match &mut item.placements {
                Some(placements) if opts.include.chunk_placements => {
                    // Provenance through native plumbing: every surfaced chunk
                    // relates on its mount's engine/mount instance.
                    placements.push(Placement {
                        scope_id: mount.mount_instance_id(),
                        type_: PlacementType::Relates,
                        seq: None,
                    });
                }
                _ => item.placements = None,
            }
            if !opts.include.chunk_body {
                item.body = None;
            }
            item
        })
        .collect();

    Ok(ScopeResult {
        head,
        total,
        unresolved: unresolved_acc.unwrap_or_default(),
        in_scope: counts.0,
        in_scope_instance: counts.1,
        in_scope_relates: counts.2,
        chunks: if opts.include.intersection_chunks {
            chunks
        } else {
            Vec::new()
        },
        dimensions: dims,
    })
}

/// Ordered scopes page tail-first (substrate.md): offset walks backward from
/// the latest entries; the returned window stays in ascending seq order.
fn window<T>(items: Vec<T>, ordered: bool, limit: Option<usize>, offset: Option<usize>) -> Vec<T> {
    let offset = offset.unwrap_or(0);
    match (ordered, limit) {
        (false, None) => items.into_iter().skip(offset).collect(),
        (false, Some(limit)) => items.into_iter().skip(offset).take(limit).collect(),
        (true, None) => {
            let end = items.len().saturating_sub(offset);
            items.into_iter().take(end).collect()
        }
        (true, Some(limit)) => {
            let end = items.len().saturating_sub(offset);
            let start = end.saturating_sub(limit);
            items
                .into_iter()
                .take(end)
                .skip(start)
                .collect()
        }
    }
}

fn merge_dims(into: &mut Vec<Dim>, from: Vec<Dim>) {
    let mut index: HashMap<String, usize> = into
        .iter()
        .enumerate()
        .map(|(i, d)| (d.id.as_str().to_string(), i))
        .collect();
    for dim in from {
        match index.get(dim.id.as_str()) {
            Some(&i) => {
                into[i].count += dim.count;
                into[i].instance += dim.instance;
                into[i].relates += dim.relates;
            }
            None => {
                index.insert(dim.id.as_str().to_string(), into.len());
                into.push(dim);
            }
        }
    }
}
