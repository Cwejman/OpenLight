use crate::errors::{OpenError, WriteError};
use crate::types::Commit;
use crate::{bootstrap, schema};
use rusqlite::{Connection, OpenFlags};
use std::path::Path;
use std::sync::Mutex;
use std::time::Duration;
use tokio::sync::broadcast;

pub struct Db {
    pub(crate) conn: Mutex<Connection>,
    pub(crate) sender: broadcast::Sender<Commit>,
    read_only: bool,
}

impl Db {
    pub fn open(project_path: &Path) -> Result<Db, OpenError> {
        let dir = project_path.join(".ol");
        std::fs::create_dir_all(&dir)?;
        let mut conn = Connection::open(dir.join("db"))?;
        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "synchronous", "NORMAL")?;
        conn.busy_timeout(Duration::from_secs(5))?;
        schema::migrations().to_latest(&mut conn)?;
        bootstrap::seed(&mut conn)?;
        let (sender, _) = broadcast::channel(256);
        Ok(Db {
            conn: Mutex::new(conn),
            sender,
            read_only: false,
        })
    }

    /// Peer-project open (host.md boot step 4): SQLITE_OPEN_READ_ONLY, never
    /// creates, migrates, or seeds. Schema-version skew refuses (boot step 3:
    /// migration of peers is a v0.2 concern).
    pub fn open_read_only(project_path: &Path) -> Result<Db, OpenError> {
        let path = project_path.join(".ol").join("db");
        if !path.is_file() {
            return Err(OpenError::MissingDatabase { path });
        }
        let conn = Connection::open_with_flags(
            &path,
            OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
        )?;
        conn.busy_timeout(Duration::from_secs(5))?;
        let found: i64 = conn.pragma_query_value(None, "user_version", |r| r.get(0))?;
        let expected = schema::latest_version()?;
        if found != expected {
            return Err(OpenError::SchemaVersionSkew { found, expected });
        }
        // The sender exists but never fires: a read-only mount contributes
        // reads, not events (host.md boot step 8).
        let (sender, _) = broadcast::channel(256);
        Ok(Db {
            conn: Mutex::new(conn),
            sender,
            read_only: true,
        })
    }

    /// Every write op checks this first — the SQLITE_OPEN_READ_ONLY flag is
    /// the backstop; the explicit refusal is the legible error.
    pub(crate) fn require_writable(&self) -> Result<(), WriteError> {
        if self.read_only {
            return Err(WriteError::ReadOnly);
        }
        Ok(())
    }
}
