use rusqlite::{params, Connection, OptionalExtension};

/// The db's own bootstrap: one initial commit and the `main` branch pointer.
/// Field content is the host bootstrap routine's concern, written after open.
pub(crate) fn seed(conn: &mut Connection) -> Result<(), rusqlite::Error> {
    // The meta check guards against re-seeding on reopen.
    let seeded: Option<String> = conn
        .query_row("SELECT value FROM meta WHERE key = 'bootstrap'", [], |r| {
            r.get(0)
        })
        .optional()?;
    if seeded.is_some() {
        return Ok(());
    }
    let tx = conn.transaction()?;
    let commit_id = crate::id::new_id();
    tx.execute(
        "INSERT INTO commits (id, parent_id, timestamp, message)
         VALUES (?1, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'bootstrap')",
        params![commit_id],
    )?;
    tx.execute(
        "INSERT INTO branches (name, head) VALUES ('main', ?1)",
        params![commit_id],
    )?;
    tx.execute(
        "INSERT INTO meta (key, value) VALUES ('bootstrap', '1')",
        [],
    )?;
    tx.commit()
}
