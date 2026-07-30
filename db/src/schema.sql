-- Version tables: append-only history, the source of truth for time travel.
-- Current-state tables: materialized on each commit, the read path.

CREATE TABLE commits (
  id           TEXT PRIMARY KEY,                 -- sortable ULID-shaped id
  parent_id    TEXT REFERENCES commits(id),
  timestamp    TEXT NOT NULL,                    -- ISO-8601 UTC
  message      TEXT,
  process_id   TEXT
);

CREATE TABLE branches (
  name TEXT PRIMARY KEY,
  head TEXT NOT NULL REFERENCES commits(id)
);

CREATE TABLE chunk_versions (
  chunk_id   TEXT NOT NULL,
  commit_id  TEXT NOT NULL REFERENCES commits(id),
  name       TEXT,
  spec       TEXT NOT NULL DEFAULT '{}',
  body       TEXT NOT NULL DEFAULT '{}',
  removed    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chunk_id, commit_id)
);

CREATE TABLE placement_versions (
  chunk_id   TEXT NOT NULL,
  scope_id   TEXT NOT NULL,
  commit_id  TEXT NOT NULL REFERENCES commits(id),
  type       TEXT NOT NULL CHECK (type IN ('instance', 'relates')),
  seq        INTEGER,
  active     INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (chunk_id, scope_id, commit_id)
);

CREATE TABLE current_chunks (
  chunk_id  TEXT NOT NULL,
  branch    TEXT NOT NULL REFERENCES branches(name),
  name      TEXT,
  spec      TEXT NOT NULL DEFAULT '{}',
  body      TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (chunk_id, branch)
);

CREATE TABLE current_placements (
  chunk_id  TEXT NOT NULL,
  scope_id  TEXT NOT NULL,
  branch    TEXT NOT NULL REFERENCES branches(name),
  type      TEXT NOT NULL,
  seq       INTEGER,
  PRIMARY KEY (chunk_id, scope_id, branch)
);

CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE VIRTUAL TABLE chunk_fts USING fts5(
  name,
  body,
  content='current_chunks',
  content_rowid='rowid',
  tokenize='unicode61'
);

CREATE INDEX idx_current_placements_scope ON current_placements(scope_id, branch, type);
CREATE INDEX idx_current_placements_chunk ON current_placements(chunk_id, branch);
CREATE INDEX idx_chunk_versions_chunk     ON chunk_versions(chunk_id, commit_id);
CREATE INDEX idx_placement_versions_chunk ON placement_versions(chunk_id, scope_id, commit_id);
CREATE INDEX idx_commits_parent           ON commits(parent_id);

CREATE TRIGGER current_chunks_ai AFTER INSERT ON current_chunks BEGIN
  INSERT INTO chunk_fts(rowid, name, body) VALUES (new.rowid, new.name, new.body);
END;

CREATE TRIGGER current_chunks_ad AFTER DELETE ON current_chunks BEGIN
  INSERT INTO chunk_fts(chunk_fts, rowid, name, body)
    VALUES ('delete', old.rowid, old.name, old.body);
END;

CREATE TRIGGER current_chunks_au AFTER UPDATE ON current_chunks BEGIN
  INSERT INTO chunk_fts(chunk_fts, rowid, name, body)
    VALUES ('delete', old.rowid, old.name, old.body);
  INSERT INTO chunk_fts(rowid, name, body) VALUES (new.rowid, new.name, new.body);
END;
