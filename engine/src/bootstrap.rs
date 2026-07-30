use crate::types::{archetypes, ProcessStatus};
use db::{BranchName, ChunkDeclaration, ChunkId, CommitOpts, Db, Declaration, Includes, ScopeOpts};

/// Startup reconciliation (engine.md): every `pending|running` process from a
/// previous run is marked `failed` with `error: "engine restart"`. One scope
/// query, one declarative commit. Run on read-write mounts only.
pub(crate) fn reconcile_zombies(db: &Db, branch: &BranchName) -> Result<(), crate::EngineError> {
    let opts = ScopeOpts {
        branch: branch.clone(),
        include: Includes {
            intersection_chunks: true,
            chunk_body: true,
            ..Includes::default()
        },
        ..ScopeOpts::default()
    };
    let processes = db.scope(&[ChunkId::from(archetypes::ENGINE_PROCESS)], opts)?;

    let zombies: Vec<ChunkDeclaration> = processes
        .chunks
        .into_iter()
        .filter_map(|chunk| {
            let mut body = chunk.body?;
            let status = body.get("status")?.as_str().and_then(ProcessStatus::parse)?;
            if status.is_terminal() {
                return None;
            }
            let map = body.as_object_mut()?;
            map.insert(
                "status".into(),
                serde_json::json!(ProcessStatus::Failed.as_str()),
            );
            map.insert("error".into(), serde_json::json!("engine restart"));
            Some(ChunkDeclaration {
                id: Some(chunk.id),
                body: Some(body),
                ..ChunkDeclaration::default()
            })
        })
        .collect();

    if zombies.is_empty() {
        return Ok(());
    }
    let declaration = Declaration {
        chunks: zombies,
        placements: vec![],
        message: Some("engine restart reconciliation".into()),
    };
    let commit_opts = CommitOpts {
        branch: branch.clone(),
        process_id: None,
    };
    db.commit(&declaration, commit_opts)?;
    Ok(())
}
