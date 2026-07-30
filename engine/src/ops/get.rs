use crate::boundary;
use crate::engine::Engine;
use crate::errors::EngineError;
use crate::types::{archetypes, Context};
use db::{ChunkId, ChunkItem, Placement, PlacementType, ReadOpts};

impl Engine {
    /// Fetch a single chunk by id, federated. Returns `None` when the chunk
    /// does not exist anywhere (the documented null); an existing chunk outside
    /// the read boundary rejects — engine.md's sentence order is the contract.
    pub fn get(
        &self,
        ctx: &Context,
        chunk_id: &ChunkId,
        opts: ReadOpts,
    ) -> Result<Option<ChunkItem>, EngineError> {
        let inner = &self.inner;
        let bctx = inner.resolve_boundaries(ctx)?;

        if archetypes::is_mount_instance(chunk_id.as_str()) {
            if !boundary::can_open(&inner.mounts, &bctx.read, bctx.process.as_ref(), chunk_id, &opts.branch)? {
                return Err(boundary_error(chunk_id));
            }
            return Ok(inner
                .mounts
                .by_instance_id(chunk_id.as_str())
                .map(|m| super::scope::mount_instance_item(&m)));
        }
        if chunk_id.as_str() == archetypes::ENGINE_MOUNT {
            if !boundary::can_open(&inner.mounts, &bctx.read, bctx.process.as_ref(), chunk_id, &opts.branch)? {
                return Err(boundary_error(chunk_id));
            }
            return Ok(Some(ChunkItem {
                id: chunk_id.clone(),
                name: Some("mount".into()),
                spec: None,
                body: Some(serde_json::json!({})),
                placements: Some(Vec::new()),
            }));
        }

        let found = inner
            .mounts
            .federated_get(chunk_id, opts.include, &opts.branch, opts.at.as_ref())?;
        let Some((mut item, mount)) = found else {
            return Ok(None);
        };
        if !boundary::can_read_chunk(&inner.mounts, &bctx.read, bctx.process.as_ref(), chunk_id, &opts.branch)? {
            return Err(boundary_error(chunk_id));
        }
        if opts.include.chunk_placements {
            // Placements union across mounts (anchor rows contribute the local
            // side of cross-db placements), plus the provenance relates.
            let mut placements = inner.mounts.placements_of(chunk_id, &opts.branch)?;
            placements.push(Placement {
                scope_id: mount.mount_instance_id(),
                type_: PlacementType::Relates,
                seq: None,
            });
            item.placements = Some(placements);
        }
        Ok(Some(item))
    }
}

fn boundary_error(chunk_id: &ChunkId) -> EngineError {
    EngineError::BoundaryViolation(format!(
        "chunk {chunk_id} is not reachable from the read boundary"
    ))
}
