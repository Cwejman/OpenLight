use crate::errors::OpenError;
use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

pub(crate) fn migrations() -> Migrations<'static> {
    Migrations::new(vec![M::up(include_str!("schema.sql"))])
}

/// The schema version this build writes, derived by running the migration
/// list on a scratch in-memory db — no constant to keep in sync with it.
pub(crate) fn latest_version() -> Result<i64, OpenError> {
    let mut conn = Connection::open_in_memory()?;
    migrations().to_latest(&mut conn)?;
    Ok(conn.pragma_query_value(None, "user_version", |r| r.get(0))?)
}
