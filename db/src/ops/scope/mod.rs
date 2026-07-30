mod dimensions;
mod edges;
pub(crate) mod intersection;
pub(crate) mod time_travel;

use crate::db::Db;
use crate::errors::ReadError;
use crate::types::{ChunkId, ScopeOpts, ScopeResult};
use crate::virtual_chunks;

impl Db {
    pub fn scope(&self, scopes: &[ChunkId], opts: ScopeOpts) -> Result<ScopeResult, ReadError> {
        let guard = self.conn.lock().unwrap();
        let conn: &rusqlite::Connection = &guard;

        if scopes
            .first()
            .map(|s| virtual_chunks::is_virtual(s.as_str()))
            .unwrap_or(false)
        {
            return virtual_chunks::project(conn, scopes, &opts);
        }
        if opts.at.is_some() {
            return time_travel::scope_at(conn, scopes, &opts);
        }

        let mut result = intersection::run(conn, scopes, &opts)?;
        if opts.include.dimensions {
            let mut dims = dimensions::run(conn, scopes, &opts)?;
            if opts.include.edges {
                edges::attach(conn, scopes, &opts, &mut dims)?;
            }
            result.dimensions = dims;
        }
        Ok(result)
    }
}
