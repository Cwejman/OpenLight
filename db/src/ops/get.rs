use crate::db::Db;
use crate::errors::ReadError;
use crate::ops::scope::time_travel;
use crate::types::{ChunkId, ChunkItem, ReadOpts};
use crate::virtual_chunks;
use rusqlite::{params, OptionalExtension};

impl Db {
    pub fn get(&self, chunk_id: ChunkId, opts: ReadOpts) -> Result<Option<ChunkItem>, ReadError> {
        let guard = self.conn.lock().unwrap();
        let conn: &rusqlite::Connection = &guard;

        if virtual_chunks::is_virtual(chunk_id.as_str()) {
            return Ok(Some(virtual_chunks::anchor_item(chunk_id.as_str())));
        }
        if let Some(at) = &opts.at {
            return time_travel::get_at(conn, at.as_str(), chunk_id.as_str(), &opts.include);
        }

        let row: Option<(Option<String>, String, String)> = conn
            .query_row(
                "SELECT name, spec, body FROM current_chunks
                 WHERE chunk_id = ?1 AND branch = ?2",
                params![chunk_id.as_str(), opts.branch.as_str()],
                |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
            )
            .optional()?;
        let Some((name, spec, body)) = row else {
            return Ok(None);
        };

        let placements = if opts.include.chunk_placements {
            Some(super::scope::intersection::load_placements(
                conn,
                opts.branch.as_str(),
                chunk_id.as_str(),
            )?)
        } else {
            None
        };

        Ok(Some(ChunkItem {
            id: chunk_id,
            name: opts.include.chunk_name.then_some(name).flatten(),
            spec: opts
                .include
                .chunk_spec
                .then(|| serde_json::from_str(&spec).unwrap_or_default()),
            body: opts
                .include
                .chunk_body
                .then(|| serde_json::from_str(&body).unwrap_or(serde_json::Value::Null)),
            placements,
        }))
    }
}
