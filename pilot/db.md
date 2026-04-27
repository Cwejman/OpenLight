# DB

The program that hosts the field. The substrate is delivered to consumers through this program; SQLite is the substrate's persistent body underneath.

A single Rust crate, compiled into the host binary. Owns one SQLite database file per project at `.ol/db`. No in-memory cache that can drift from disk — SQLite is the single source of truth.

The substrate spec defines what the field IS. This document defines two contracts:

- **Consumer ↔ db.** What the engine, the host, and any program reaching the substrate sees.
- **db ↔ SQLite.** What the db expresses in SQL and the discipline that holds.

Both answer to [`pilot/substrate.md`](substrate.md). Where they disagree, the substrate spec is right.

---

## Consumer contract

Methods on the `Db` handle. Synchronous in surface (SQLite calls block); change stream is async.

### Lifecycle

```rust
Db::open(project_path: &Path) -> Result<Db, OpenError>
```

Initializes the SQLite connection (creates the file with migrations if fresh, opens with `journal_mode = WAL` if existing), seeds the minimum the db needs, returns the handle. Closes via `Drop`.

The db's own bootstrap is small: one row in `branches` (the bootstrap branch, `main`) and one initial commit in `commits`. The substrate's archetypes for branches and commits, and the scope-anchors `branches_root` and `commits_root`, are **projected** by the read layer with hardcoded shapes — not stored as chunks. Field content (engine root scope, ui root scope, agent root scope, archetype seeds, etc.) is not the db's concern; the host's bootstrap routine writes those via `db.commit()` after `Db::open` returns.

### Reads

Two operations. Everything readable from the field goes through them.

```rust
impl Db {
  fn scope(&self, scopes: &[ChunkId], opts: ScopeOpts)
       -> Result<ScopeResult, ReadError>;

  fn get(&self, chunk_id: ChunkId, opts: ReadOpts)
       -> Result<Option<ChunkItem>, ReadError>;
}
```

`scope` returns the intersection of the named scopes — chunks placed on every one of them. `get` returns a single chunk by id, or `None` if not present in current state.

`ScopeOpts`:

```
ScopeOpts
  branch: BranchName            default "main"
  at: Option<CommitId>          time travel
  match_: Option<String>        FTS5 filter applied within the intersection
  limit: Option<usize>          pagination
  offset: Option<usize>
  include: Includes             what to populate
```

`scopes` may be empty. Empty scope means the whole field — every chunk qualifies for the intersection (vacuous truth). Combined with `match_`, it is field-wide search; combined with `Includes::shape()`, it is the browser's starting view (all dims sorted by count); combined with `intersection_chunks` plus `limit`, it enumerates the field. Pagination is the guardrail against unbounded fetches, not a runtime restriction.

When `scopes` is empty: `in_scope = total` (every chunk qualifies), and the `in_scope_instance` / `in_scope_relates` split has no "intersection" semantic to apply — both are `0` since no chunk is "instance on every queried scope" or "relates on every queried scope" when no scopes are queried.

### Result

```
ScopeResult
  head                  commit sampled
  total                 chunks in branch
  in_scope              chunks at intersection
  in_scope_instance     ...via instance on every dim in scope
  in_scope_relates      ...via relates on every dim in scope
  chunks: [ChunkItem]   intersection chunks (opt-in)
  dimensions: [Dim]     scopes you can add (opt-in)
```

```
ChunkItem
  id                                      always
  name?  spec?  body?  placements?       chunk self-data (opt-in)

Dim
  id, name
  count                                   chunks at intersection placed here
  instance
  relates
  edges?: [Edge]                          scopes you can reach from this dim,
                                          beyond current adjacency (opt-in)

Edge
  id, name
  count                                   chunks on this dim also placed on the edge dim
  instance
  relates

Placement
  scope_id, type_, seq?

Spec
  ordered, accepts, required, unique, propagate
```

**Folk reading:**
- "What's at my intersection?" → `chunks`
- "What can I add to narrow further?" → `dimensions`
- "What can I reach from this dim, beyond current adjacency?" → `dim.edges`

**Why dimensions and edges differ:** dimensions are scopes intersection chunks already touch — adding any keeps the intersection non-empty (narrowing). Edges are scopes a dim's chunks (including chunks NOT at the current intersection) touch beyond the current adjacency — reachable only by stepping out of the current scope.

Sort: `dimensions` and `Dim.edges` both descending by `count`.

### Includes

```
Includes                                  default: every flag false

  chunk_name  chunk_spec  chunk_body  chunk_placements    per ChunkItem

  intersection_chunks                     populate `chunks`
  dimensions                              populate `dimensions`
  edges                                   also populate `Dim.edges`

  rank  snippet                           with match_
```

Minimum return when nothing is opted in: `head`, four counts, empty `chunks`, empty `dimensions`.

Convenience constructors:

```
Includes::shape()      = { dimensions }
Includes::content()    = { intersection_chunks, chunk_name, chunk_body, chunk_placements }
Includes::all()        = every flag
```

### Branches and commits as virtual chunks

The substrate's discipline is that everything is chunks and placements. Branches and commits are projected by the read layer as virtual chunks — they appear in `scope` and `get` like any other content:

- `db.scope(&[branches_root], opts)` — every branch as a chunk; body carries `{ head: commit_id }`.
- `db.scope(&[branches_root, branch_id], opts)` — a single branch.
- `db.scope(&[commits_root, branch_id], opts)` — commits in the branch's ancestry, ordered.

`branches_root` and `commits_root` are well-known ids recognized by the read layer. They are not stored — they are projection anchors with hardcoded specs (the `branch` and `commit` archetypes).

Virtual chunks are read-only via `scope`/`get`. Writes targeting them are rejected (`WriteToVirtualChunk`). Their state is owned by db-level operations: `commit` (advances a branch's head), `create_branch` / `delete_branch` (manipulate the branch graph).

There is no `list_branches`, `current_head`, or `history` operation — they are just scope reads against the virtual anchors.

### Write

One operation produces commits.

```rust
impl Db {
  fn commit(&self, declaration: &Declaration, opts: CommitOpts)
       -> Result<Commit, WriteError>;
}
```

```
Declaration
  chunks: [ChunkDeclaration]
  placements: [PlacementSpec]      bare placements (no chunk content change)
  message: Option<String>

CommitOpts
  branch: BranchName               which branch this commit lands on
  dispatch_id: Option<String>      engine metadata, propagated to the commit chunk
```

The whole declaration is one transaction. All writes succeed and a commit is recorded, or all fail and nothing is written.

The result is the `Commit` itself — a chunk-shaped artifact:

```
Commit
  id, parent_id?, timestamp, message?, dispatch_id?
  chunks_modified:     [ChunkId]
  placements_modified: [(ChunkId, ChunkId)]    (chunk_id, scope_id) entered or left
```

`chunks_modified` and `placements_modified` are the deltas — for caller convenience and for filtering on the change stream.

### Branch operations

```rust
impl Db {
  fn create_branch(&self, name: &str, from: CommitId) -> Result<Branch, WriteError>;
  fn delete_branch(&self, name: &str) -> Result<(), WriteError>;
}
```

`create_branch` makes a new branch pointer at an existing commit. `delete_branch` removes the pointer; commits remain (lossless). Both emit on the change stream — branch graph mutations surface alongside commits.

### The change stream

```rust
impl Db {
  fn subscribe_scope(&self, scopes: &[ChunkId], opts: SubscribeOpts)
       -> impl Stream<Item = Commit>;
}
```

A single subscription primitive. Yields commits that touch the named scopes (any of them). Backed by an internal broadcast channel pushed from inside SQLite's `commit_hook`, so state and event are tightly coupled — no observable window where the field has changed but the event has not arrived.

Subscribe at any scope to listen there:

- `subscribe_scope(&[commits_root])` — every new commit.
- `subscribe_scope(&[branches_root])` — branch graph mutations.
- `subscribe_scope(&[my_session])` — changes touching the session's content.

Backpressure: each subscriber has a bounded receiver. On overflow, oldest events drop and a `Lagged` marker is emitted. Subscriptions are tied to the handle's `Db` lifetime; dropping the stream unsubscribes.

### Errors

```
ValidationError { scope_id, kind }     spec violation; kind = Ordered | Accepts | Required | Unique | AmbiguousType
NameCollision { scope_id, name }       name uniqueness rule
NotFound { kind, id }                  chunk, branch, or commit not present
MalformedDeclaration(reason)           declaration self-inconsistent
WriteToVirtualChunk { id }             declaration targets a projected chunk
IoError(SqliteError)                   underlying SQLite error
```

### Atomicity

A declaration is one transaction. Inside:

1. Insert version rows for everything in the declaration.
2. Apply current-state transitions (FTS triggers fire).
3. Run validation against the post-write current state.
4. If validation passes: insert the commit row, advance the branch HEAD, COMMIT, push to the change stream.
5. If validation fails: ROLLBACK. Nothing recorded; nothing emitted.

Writes within a declaration are visible to validation through ordinary SELECTs (the post-write state lives in current-state tables inside the transaction), but invisible to other transactions until COMMIT. The substrate's two-pass write-then-validate is delivered by SQLite transaction semantics directly.

A commit row appears only when validation passes. The change stream emits only successful commits.

---

## SQLite contract

### Physical schema

Two layers. Version tables are append-only history (the source of truth for time travel). Current-state tables are materialized views maintained on each commit (the read path).

```sql
CREATE TABLE commits (
  id           TEXT PRIMARY KEY,                 -- sortable ULID-shaped id
  parent_id    TEXT REFERENCES commits(id),
  timestamp    TEXT NOT NULL,                    -- ISO-8601 UTC
  message      TEXT,
  dispatch_id  TEXT
);

CREATE TABLE branches (
  name TEXT PRIMARY KEY,
  head TEXT NOT NULL REFERENCES commits(id)
);

CREATE TABLE chunk_versions (
  chunk_id   TEXT NOT NULL,
  commit_id  TEXT NOT NULL REFERENCES commits(id),
  name       TEXT,
  spec       TEXT NOT NULL DEFAULT '{}',         -- JSON
  body       TEXT NOT NULL DEFAULT '{}',         -- JSON
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

CREATE VIRTUAL TABLE chunk_fts USING fts5(
  name,
  body,
  content='current_chunks',
  content_rowid='rowid',
  tokenize='unicode61'
);
```

### Indexes

```sql
CREATE INDEX idx_current_placements_scope ON current_placements(scope_id, branch, type);
CREATE INDEX idx_current_placements_chunk ON current_placements(chunk_id, branch);
CREATE INDEX idx_chunk_versions_chunk     ON chunk_versions(chunk_id, commit_id);
CREATE INDEX idx_placement_versions_chunk ON placement_versions(chunk_id, scope_id, commit_id);
CREATE INDEX idx_commits_parent           ON commits(parent_id);
```

### FTS hookup

Triggers on `current_chunks` keep the FTS index synchronized within the commit transaction:

```sql
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
```

The FTS index covers all branches' current state; branch filtering is a JOIN at query time.

### The commit algorithm

```
commit(declaration, opts):

  reject if any chunk in the declaration targets a virtual chunk
    (branches_root, commits_root, branch archetype, commit archetype) → WriteToVirtualChunk

  BEGIN IMMEDIATE TRANSACTION

  let commit_id = generate_commit_id()
  let parent    = head_of(opts.branch)
  let timestamp = now_utc()

  INSERT INTO commits (id, parent_id, timestamp, message, dispatch_id)
  VALUES (commit_id, parent, timestamp, declaration.message, opts.dispatch_id)

  for each chunk in declaration.chunks:
    resolve id (declared or generated)
    INSERT INTO chunk_versions (chunk_id, commit_id, name, spec, body, removed)
    apply current-state transition for opts.branch

  for each placement (chunk-bound and bare):
    INSERT INTO placement_versions (chunk_id, scope_id, commit_id, type, seq, active)
    apply current-state transition for opts.branch

  validate in Rust against post-write current state on this branch:
    for each chunk touched, compose effective contract and check rules

  any failure => ROLLBACK and return

  UPDATE branches SET head = commit_id WHERE name = opts.branch
  COMMIT
  (commit_hook fires → push Commit to broadcast channel)

  return Commit
```

Validation is in Rust. SQL stores; Rust enforces. Validating in SQL would require recursive CTEs over the propagating-archetype graph and lock the rule into SQL; Rust gives clearer code and easier evolution.

### Current-state transitions

For each `chunk_versions` row at branch B:

| chunk_versions row | current_chunks rule (branch B) |
|---|---|
| `removed = 0` | UPSERT row with new (name, spec, body) |
| `removed = 1` | DELETE current_chunks row; DELETE all current_placements rows where chunk is the chunk OR the scope (branch B only) |

For each `placement_versions` row at branch B:

| placement_versions row | current_placements rule (branch B) |
|---|---|
| `active = 1` | UPSERT row with (type, seq); auto-assign seq when scope is `ordered: true` and seq omitted |
| `active = 0` | DELETE row for (chunk_id, scope_id, branch B) |

Removal is per-branch.

### Query patterns

#### Intersection (the chunks)

```sql
SELECT cc.*
FROM current_chunks cc
JOIN current_placements cp
  ON cp.chunk_id = cc.chunk_id AND cp.branch = cc.branch
WHERE cc.branch = :branch
  AND cp.scope_id IN (:scope_ids)
  AND cp.type = 'instance'
GROUP BY cc.chunk_id
HAVING COUNT(DISTINCT cp.scope_id) = :n_scopes;
```

With `match_`, intersect against FTS:

```sql
SELECT cc.*, fts.rank
FROM chunk_fts fts
JOIN current_chunks cc ON cc.rowid = fts.rowid
JOIN current_placements cp
  ON cp.chunk_id = cc.chunk_id AND cp.branch = cc.branch
WHERE chunk_fts MATCH :query
  AND cc.branch = :branch
  AND cp.scope_id IN (:scope_ids)
  AND cp.type = 'instance'
GROUP BY cc.chunk_id
HAVING COUNT(DISTINCT cp.scope_id) = :n_scopes
ORDER BY fts.rank;
```

**Empty scope.** When `scopes` is empty, `in_scope` is "every chunk on this branch" — the placement join is dropped:

```sql
SELECT cc.*
FROM current_chunks cc
WHERE cc.branch = :branch
LIMIT :limit OFFSET :offset;
```

With `match_` added, intersect against FTS as above but again without the placement join.

For ordered scopes (non-empty case), `ORDER BY cp.seq` with `LIMIT/OFFSET`.

#### Dimensions

For each scope the intersection chunks are placed on, with counts split by placement type:

```sql
WITH in_scope AS (
  SELECT cp.chunk_id
  FROM current_placements cp
  WHERE cp.branch = :branch
    AND cp.scope_id IN (:scope_ids)
    AND cp.type = 'instance'
  GROUP BY cp.chunk_id
  HAVING COUNT(DISTINCT cp.scope_id) = :n_scopes
)
SELECT
  cp.scope_id,
  COUNT(*) FILTER (WHERE cp.type = 'instance') AS instance_count,
  COUNT(*) FILTER (WHERE cp.type = 'relates')  AS relates_count,
  COUNT(*) AS total
FROM current_placements cp
JOIN in_scope ON in_scope.chunk_id = cp.chunk_id
WHERE cp.branch = :branch
GROUP BY cp.scope_id
ORDER BY total DESC;
```

(Dimensions include the scopes in the input — they qualify trivially. The consumer filters them out only if they want the "what to add" view excluding the input.)

When `scopes` is empty, the `in_scope` CTE collapses to "every chunk on this branch" — every dim in the field appears in `dimensions`, sorted by count. Edges become empty in this case: with empty input, every dim is already adjacent, so there is nothing "beyond."

#### Edges (for each dim, what it reaches beyond)

```sql
-- for each adjacent dim X, find dims Y that any chunk on X also touches,
-- where Y is not in the current scope and not already adjacent
SELECT
  cm1.scope_id AS from_dim,
  cm2.scope_id AS to_dim,
  COUNT(*) FILTER (WHERE cm2.type = 'instance') AS instance_count,
  COUNT(*) FILTER (WHERE cm2.type = 'relates')  AS relates_count,
  COUNT(*) AS total
FROM current_placements cm1
JOIN current_placements cm2 ON cm1.chunk_id = cm2.chunk_id AND cm2.branch = cm1.branch
WHERE cm1.branch = :branch
  AND cm1.scope_id IN (:dimension_ids)        -- adjacent dims from previous query
  AND cm2.scope_id NOT IN (:scope_ids)
  AND cm2.scope_id NOT IN (:dimension_ids)
  AND cm1.scope_id != cm2.scope_id
GROUP BY cm1.scope_id, cm2.scope_id
ORDER BY total DESC;
```

#### Virtual chunks (branches and commits)

When `scope` is called with `branches_root` or `commits_root`, the read layer projects from the underlying tables instead of joining current_chunks:

```sql
-- branches projection
SELECT name AS chunk_id, name, '{}' AS spec,
       json_object('head', head) AS body
FROM branches;

-- commits in a branch's ancestry, ordered by depth
WITH RECURSIVE ancestry(id, depth) AS (
  SELECT head, 0 FROM branches WHERE name = :branch
  UNION ALL
  SELECT c.parent_id, a.depth + 1
  FROM commits c JOIN ancestry a ON c.id = a.id
  WHERE c.parent_id IS NOT NULL
)
SELECT c.id AS chunk_id, NULL AS name, '{}' AS spec,
       json_object(
         'timestamp',   c.timestamp,
         'message',     c.message,
         'dispatch_id', c.dispatch_id
       ) AS body,
       a.depth AS seq
FROM commits c JOIN ancestry a ON c.id = a.id
ORDER BY seq;
```

Mixing virtual and real scopes in one `scope` call is rejected in the pilot — keeps the projection clean.

#### Time travel

When `at: Some(commit_id)` is set, the current-state path is bypassed; the read walks version tables:

```sql
WITH RECURSIVE ancestry(id, depth) AS (
  SELECT :target, 0
  UNION ALL
  SELECT c.parent_id, a.depth + 1
  FROM commits c JOIN ancestry a ON c.id = a.id
  WHERE c.parent_id IS NOT NULL
),
chunk_state AS (
  SELECT cv.*,
         ROW_NUMBER() OVER (
           PARTITION BY cv.chunk_id
           ORDER BY (SELECT depth FROM ancestry WHERE id = cv.commit_id) ASC
         ) AS rn
  FROM chunk_versions cv
  WHERE cv.commit_id IN (SELECT id FROM ancestry)
)
SELECT * FROM chunk_state WHERE rn = 1 AND removed = 0;
```

(Sketch — exact query refines under benchmark.)

### Reactivity wiring

The `Db` handle holds a `tokio::sync::broadcast::Sender<Commit>`. SQLite's `commit_hook` fires after a successful commit; the hook pushes the Commit to the channel. Subscribers (`subscribe_scope`) hold receivers and filter on `placements_modified`/`chunks_modified`.

Push happens inside the commit_hook — atomic-from-observer-perspective with the SQL commit. Subscribers see only durable commits; rolled-back transactions do not surface.

The channel is bounded; on overflow the oldest event drops and a `Lagged` marker reaches the subscriber so they can re-read from a known commit if needed. The push itself is non-blocking — slow consumers do not block the writer.

### Transaction discipline

All writes use `BEGIN IMMEDIATE` to acquire the SQLite write lock up front — no deadlock-by-upgrade. Reads use the default deferred mode and benefit from WAL's reader-doesn't-block-writer behavior. Open settings: `journal_mode = WAL`, `synchronous = NORMAL`.

---

## Concurrency

SQLite in WAL mode gives single-writer, many-reader. The db inherits this; nothing is invented on top.

**One writer at a time.** Concurrent `commit` calls serialize at the SQLite level. Default busy timeout is 5 seconds; on timeout the call fails and the caller decides whether to retry.

**Readers do not block writers; writers do not block readers.** A read started during a write reads from a snapshot taken at the read's start; the in-progress write is invisible until it commits.

**Per-call read consistency.** Each read runs in its own implicit transaction — consistent within one call, may shift between consecutive calls.

**Cross-call read consistency.** Open. The engine's most demanding read pattern fits in a single multi-scope `scope` call; explicit snapshot handles may not be needed for the pilot.

**Reactivity does not block writes.** The change-stream channel is bounded and non-blocking on push; slow consumers drop the oldest with a `Lagged` marker.

---

## Code architecture — a starting position

### Module layout

```
pilot/db/
  src/
    lib.rs           — re-exports the public API
    db.rs            — Db handle: open(), Drop, internal connection management
    types.rs         — public types: ChunkId, CommitId, ChunkItem, Spec, Commit, ...
    errors.rs        — discriminated error types
    schema.rs        — embedded SQL DDL constants and the migration list
    commit/
      mod.rs         — Db::commit() entrypoint, transaction wrapper
      transitions.rs — current-state transition rules
      seq.rs         — seq auto-assignment
    read/
      mod.rs         — Db::scope() and Db::get() entrypoints
      query.rs       — SQL query construction (intersection, dimensions, edges, FTS, time travel)
      virtual_.rs    — branches and commits virtual-chunk projection
    validation/
      mod.rs         — validate() entrypoint
      contract.rs    — compose effective contract for a chunk on a scope
      rules.rs       — ordered, accepts, required, unique, name uniqueness
    branches.rs      — Db::create_branch(), Db::delete_branch()
    reactivity.rs    — broadcast channel; Db::subscribe_scope()
    bootstrap.rs     — minimum seed on first open (main branch, initial commit)
    id.rs            — id generation (ULID-shaped)
  tests/             — integration tests; oracle-checked vs the TS suite
  Cargo.toml
```

### Key internal abstractions

**`Db` holds a `rusqlite::Connection` plus a `broadcast::Sender<Commit>`.** Construction is `Db::open(path)`. The host owns one `Db` for the project's lifetime.

**Commit uses an RAII `Tx<'db>` helper.** `Tx::begin(&db)` issues `BEGIN IMMEDIATE`; `tx.commit()` issues `COMMIT`; `Drop` issues `ROLLBACK` if neither was called. The commit algorithm body uses `?` freely; rollback is correct on any error path.

**Validation reads through normal SELECTs.** No separate scratch space — current-state tables hold the post-write state inside the transaction.

**Errors via `thiserror`.** Each module's variants compose into a top-level enum.

**IDs as newtypes.** `ChunkId(String)`, `CommitId(String)`, `BranchName(String)` with `From<&str>`, `Display`.

**Reactivity built on `tokio::sync::broadcast`.** Push is non-blocking; subscribers each have a receiver bounded to a small buffer.

**Sync surface, async reactivity.** `scope`, `get`, `commit`, `create_branch`, `delete_branch` are sync (SQLite is sync). `subscribe_scope` returns a Stream — async, the natural shape for change feeds.

### Patterns and schools — what is open

- **Builder vs direct struct construction for `Declaration`.** *Lean: direct construction with helper free-functions.*
- **`thiserror` vs alternatives.** *Lean: `thiserror`.*
- **Connection ownership.** `&Db` everywhere with internal `Mutex` if `Connection: !Sync` matters. *Lean: `&Db`; the engine is the only writer caller and is single-threaded against a given Db.*
- **Migration strategy.** *Lean: `rusqlite_migration`.*
- **JSON for body and spec.** Body is `serde_json::Value`. Spec is a typed struct with `#[serde(default)]`.
- **Bootstrap idempotence.** A `meta` table with a single bootstrap-version row; `open()` checks before seeding.

---

## What is open

- **Cross-call read snapshots** — explicit handles for multi-read consistency.
- **Branch-meta commits** — whether `create_branch`/`delete_branch` should write commits on a meta-branch for uniform traceability.
- **Mixing virtual and real scopes** in one `scope` call. Currently rejected.
- **FTS branch-scoping** — currently FTS holds all branches; branch filter at query time.
- **Bootstrap IDs** — resolved at the substrate level (lookup-by-name); carries through.
- **Time-travel query optimization** — recursive ancestry walk is correct but unmeasured.
