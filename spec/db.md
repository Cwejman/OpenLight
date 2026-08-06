# DB

The program that hosts the field. The substrate is delivered to consumers through this program; SQLite is the substrate's persistent body underneath.

A single Rust crate, compiled into the host binary. Owns one SQLite database file per project at `.ol/db`. No in-memory cache that can drift from disk — SQLite is the single source of truth.

The substrate spec defines what the field IS. This document defines two contracts:

- **Consumer ↔ db.** What the engine, the host, and any program reaching the substrate sees.
- **db ↔ SQLite.** What the db expresses in SQL and the discipline that holds.

Both answer to [`substrate.md`](substrate.md). Where they disagree, the substrate spec is right.

---

## Consumer contract

Methods on the `Db` handle. Synchronous in surface (SQLite calls block); change stream is async.

### Lifecycle

```rust
Db::open(project_path: &Path)           -> Result<Db, OpenError>
Db::open_read_only(project_path: &Path) -> Result<Db, OpenError>
```

Both take the *project* path; the database file is `<project>/.ol/db`. Closes via `Drop`.

`open` initializes the SQLite connection (creates the file with migrations if fresh, opens with `journal_mode = WAL` if existing), seeds the minimum the db needs, returns the handle.

`open_read_only` is the peer-mount open ([`host.md`](host.md#boot-sequence) boot step 4). It opens with `SQLITE_OPEN_READ_ONLY` and **never creates, migrates, or seeds**: a missing file is `MissingDatabase`, a file whose schema version differs from this build's is `SchemaVersionSkew` (peer migration is a v0.2 concern — see *Settled choices*), and every write op refuses with `ReadOnly` before reaching SQLite — the open flag is the backstop, the explicit refusal is the legible error. The handle carries a change stream that never fires: a read-only mount contributes reads, not events.

The db's own bootstrap is small: one row in `branches` (the bootstrap branch, `main`) and one initial commit in `commits`. The substrate's archetypes for branches and commits, and the anchors `db/branches` and `db/commits`, are **projected** by the read layer with hardcoded shapes — not stored as chunks. Field content (archetypes, user data, project-specific places — whatever this particular db holds) is not the db's concern; the host's bootstrap routine writes those via `db.commit()` after `Db::open` returns.

### Reads

Two operations. Everything readable from the field goes through them.

```rust
impl Db {
  fn read(&self, places: &[ChunkId], opts: ReadOpts)
       -> Result<ReadResult, ReadError>;

  fn get(&self, chunk_id: ChunkId, opts: GetOpts)
       -> Result<Option<ChunkItem>, ReadError>;
}
```

`read` returns the intersection of the named places — chunks placed on every one of them, by any stored placement kind: `owned`, `instance`, and `relates` all put a chunk at the intersection (substrate.md, *Read*). The `in_place_owned` / `in_place_instance` / `in_place_relates` counts report the split; the `linked` field carries the body-derived kinds (fields and mentions pointing at the roots), never mixed with placements. `get` returns a single chunk by id, or `None` if not present in current state.

`ReadOpts`:

```
ReadOpts
  branch: BranchName            default "main"
  at: Option<CommitId>          time travel
  match_: Option<String>        FTS5 filter applied within the intersection
  exclude: Vec<ChunkId>         negation — places subtracted
  limit: Option<usize>          pagination
  offset: Option<usize>
  include: Includes             what to populate
```

`exclude` subtracts: a chunk placed on any excluded root — any stored kind — is out of the intersection and out of its counts (substrate.md, *Negation*). `exclude` shapes results, not dimensions: `dimensions` and `edges` are computed from the unexcluded intersection — pinned as-built for v0.1, honored in dimensions when a surface demands it.

`GetOpts` is the single-chunk subset — `get` resolves one chunk, so the read-shaping knobs don't apply:

```
GetOpts
  branch: BranchName            default "main"
  at: Option<CommitId>          time travel
  include: Includes             only the chunk-self flags (name/spec/body/
                                placements) apply; read-level flags are ignored
```

`places` may be empty. An empty read means the whole field — every chunk qualifies for the intersection (vacuous truth), composed with `match_`, `Includes`, and `limit` like any other read. Pagination is the guardrail against unbounded fetches, not a runtime restriction.

Under an empty read the counts collapse: `in_place = total` and the per-kind splits are degenerate — reported for consistency with the non-empty case, not as useful attribution. `linked` is empty under an empty read (links answer per named root).

**Order and pagination.** When the read names exactly one place and that place is ordered, the window is **tail-first**: the default is the latest entries and `offset` pages backward from the end (`limit: 10, offset: 10` returns the ten entries before the last ten). Within the window the chunks always read ascending by `seq` — the query sorts descending and the window is reversed before it returns. Every other read (empty, several places, or an unordered one) pages forward in `chunk_id` order. Positions are set positions, not seq values: sparse seqs leave no gaps in a window. Duplicate explicit seq values are legal; ties break by commit order — the earlier-committed placement reads first.

### Result

```
ReadResult
  head                  commit sampled
  unresolved            input roots with no current chunk — a dead reference
                        reported as metadata, not an error; the read still runs
  total                 chunks in branch
  in_place              chunks at intersection
  in_place_owned        ...via owned on every named place
  in_place_instance     ...via instance on every named place
  in_place_relates      ...via relates on every named place
  chunks: [ChunkItem]   intersection chunks (opt-in)
  linked: [Link]        who points at the roots — fields and mentions,
                        derived, never mixed with placements
  dimensions: [Dim]     places you can add (opt-in)
```

```
ChunkItem
  id                                      always
  name?  instance?  body?  placements?       chunk self-data (opt-in)

Link
  source_id                               the chunk whose body holds the reference
  target                                  a root chunk id — or a normalized
                                          location expression (mentions only)
  kind                                    'field' | 'mention'
  key?                                    the declaring key, when kind = field

Dim
  id, name
  count                                   chunks at intersection placed here
  owned, instance, relates                per-kind split
  edges?: [Edge]                          places you can reach from this dim,
                                          beyond current adjacency (opt-in)

Edge
  id, name
  count                                   chunks on this dim also placed on the edge dim
  owned, instance, relates

Placement
  on, kind, seq?                          kind ∈ owned | instance | relates
                                          (the old type/type_ asymmetry dies
                                          with the rename)

Instance (the chunk's `instance` field)
  KeyMap                                  flat typed key-map (string | number |
                                          time | markdown | ref(X)? | list<…> |
                                          set<…> | map; per-key `?` and `unique`)
                                          + the reserved interim `$ordered`
                                          entry (substrate.md, What's Open)
```

**Why dimensions and edges differ:** dimensions are places intersection chunks already touch — adding any keeps the intersection non-empty (narrowing). Edges are places a dim's chunks (including chunks NOT at the current intersection) touch beyond the current adjacency — reachable only by stepping out of the current read.

Sort: `dimensions` and `Dim.edges` both descending by `count`.

### Includes

```
Includes                                  default: every flag false

  chunk_name  chunk_instance  chunk_body  chunk_placements    per ChunkItem

  intersection_chunks                     populate `chunks`
  dimensions                              populate `dimensions`
  edges                                   also populate `Dim.edges`

  rank  snippet                           with match_ — declared, deferred: unbuilt in v0.1
```

Minimum return when nothing is opted in: `head`, four counts, empty `chunks`, empty `dimensions`.

Convenience constructors:

```
Includes::shape()      = { dimensions }
Includes::content()    = { intersection_chunks, chunk_name, chunk_body, chunk_placements }
Includes::all()        = every flag
```

### Branches and commits as virtual chunks

The substrate's discipline is that everything is chunks and placements. Branches and commits are projected by the read layer as virtual chunks — they appear in `read` and `get` like any other content:

- `db.read(&[db/branches], opts)` — every branch as a chunk; body carries `{ head: commit_id }`.
- `db.read(&[db/branches, branch_id], opts)` — a single branch.
- `db.read(&[db/commits, branch_id], opts)` — commits in the branch's ancestry, ordered.

`db/branches` and `db/commits` are well-known ids recognized by the read layer. They are not stored — they are projection anchors with hardcoded specs (the `branch` and `commit` archetypes).

Virtual chunks are read-only via `read`/`get`. Writes targeting them are rejected (`WriteToVirtualChunk`). Their state is owned by db-level operations: `commit` (advances a branch's head), `create_branch` / `delete_branch` (manipulate the branch graph).

There is no `list_branches`, `current_head`, or `history` operation — they are just reads against the virtual anchors.

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
  process_id: Option<String>      engine metadata, propagated to the commit chunk
```

The whole declaration is one transaction. All writes succeed and a commit is recorded, or all fail and nothing is written.

Placement residency is not checked: neither side of a placement need be resident in this db — chunk ids are globally unique, so a placement may reference a chunk another db owns (substrate.md, *Peers*). A dangling reference surfaces at use, as an unresolved root on a read. Removal is the exception: it names a chunk that must be present here to remove.

The result is the `Commit` itself — a chunk-shaped artifact:

```
Commit
  id, parent_id?, timestamp, message?, process_id?
  branch: BranchName                           which branch the commit landed on
  chunks_modified:     [ChunkId]
  placements_modified: [(ChunkId, ChunkId)]    (chunk_id, on_id) entered or left
  links_modified:      [ChunkId]               chunks whose inbound links changed —
                                               the link delta, computed from the
                                               current_refs refile in this transaction
```

`chunks_modified`, `placements_modified`, and `links_modified` are the deltas — for caller convenience and for filtering on the change stream (a subscription on a chunk fires when links *to* it appear or disappear, engine.md). `branch` is the event's only carrier of where the commit landed, so `SubscribeOpts.branch` has something to filter on.

### Branch operations

```rust
impl Db {
  fn create_branch(&self, name: &str, from: CommitId) -> Result<Branch, WriteError>;
  fn delete_branch(&self, name: &str) -> Result<(), WriteError>;
}
```

`create_branch` makes a new branch pointer at an existing commit and **materializes the branch's current state**: the version walk at the fork commit (the same ancestry replay `at:` reads use) is written into `current_chunks` and `current_placements` under the new name, in the same transaction as the pointer — reads on the fresh branch work immediately, without a first commit. `delete_branch` removes the pointer and drops that branch's current-state rows; commits remain (lossless). Both emit on the change stream — branch graph mutations surface alongside commits.

### The change stream

```rust
impl Db {
  fn subscribe(&self, places: &[ChunkId], opts: SubscribeOpts)
       -> impl Stream<Item = Commit>;
}
```

```
SubscribeOpts
  branch: BranchName            default "main"   — which branch's commits to watch
```

A single subscription primitive. Yields commits that touch the named places (any of them). Backed by an internal broadcast channel pushed from Rust right after `tx.commit()` returns Ok (see *Reactivity wiring*); state and event are tightly coupled — by the time the event arrives, the SQL commit is durable and visible to any reader.

Subscribe at any place to listen there:

- `subscribe(&[db/commits])` — every new commit.
- `subscribe(&[db/branches])` — branch graph mutations.
- `subscribe(&[my_session])` — changes touching the session's content.

Backpressure: each subscriber has a bounded receiver. On overflow, oldest events drop and a `Lagged` marker is emitted. Subscriptions are tied to the handle's `Db` lifetime; dropping the stream unsubscribes.

### Errors

```
ValidationError { chunk_id, kind }     spec violation; kind = MissingKey | KeyType |
                                       RefTarget | RefArchetype | Unique | Ordered |
                                       AmbiguousKey (two instance specs claim one
                                       key with different types) | MultiOwner
                                       (a second owned placement)
NameCollision { owner_id, name }       name uniqueness within the owner
NotFound { kind, id }                  removal target, branch, or commit not
                                       present — never a placement side, which
                                       may dangle by design
MalformedDeclaration(reason)           declaration self-inconsistent
WriteToVirtualChunk { id }             declaration targets a projected chunk
ReadOnly                               write op on a handle from open_read_only
MissingDatabase { path }               read-only open found no file (never creates)
SchemaVersionSkew { found, expected }  read-only open found another version
IoError(SqliteError)                   underlying SQLite error
```

### Atomicity

A declaration is one transaction. Inside:

1. Insert version rows for everything in the declaration.
2. Apply current-state transitions (FTS triggers fire).
3. Run validation against the post-write current state: instance-contract obligations for every touched chunk (the union of the contracts of every archetype it is `instance` on), ref-target checks for declared ref keys (locally resolvable targets — cross-mount targets are the engine's, substrate.md *Links*), name uniqueness within the owner, single-owner, seq on ordered places.
4. Refile `current_refs` for every touched chunk (delete-and-reinsert); collect the link delta.
5. If validation passes: insert the commit row, advance the branch HEAD, COMMIT, push to the change stream.
6. If validation fails: ROLLBACK. Nothing recorded; nothing emitted.

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
  process_id  TEXT
);

CREATE TABLE branches (
  name TEXT PRIMARY KEY,
  head TEXT NOT NULL REFERENCES commits(id)
);

CREATE TABLE chunk_versions (
  chunk_id   TEXT NOT NULL,
  commit_id  TEXT NOT NULL REFERENCES commits(id),
  name       TEXT,
  instance   TEXT NOT NULL DEFAULT '{}',         -- JSON key-map
  body       TEXT NOT NULL DEFAULT '{}',         -- JSON
  removed    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chunk_id, commit_id)
);

CREATE TABLE placement_versions (
  chunk_id   TEXT NOT NULL,
  on_id   TEXT NOT NULL,
  commit_id  TEXT NOT NULL REFERENCES commits(id),
  kind       TEXT NOT NULL CHECK (kind IN ('owned', 'instance', 'relates')),
  seq        INTEGER,
  active     INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (chunk_id, on_id, commit_id)
);

CREATE TABLE current_chunks (
  chunk_id  TEXT NOT NULL,
  branch    TEXT NOT NULL REFERENCES branches(name),
  name      TEXT,
  instance  TEXT NOT NULL DEFAULT '{}',
  body      TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (chunk_id, branch)
);

CREATE TABLE current_placements (
  chunk_id  TEXT NOT NULL,
  on_id  TEXT NOT NULL,
  branch    TEXT NOT NULL REFERENCES branches(name),
  kind      TEXT NOT NULL,
  seq       INTEGER,
  PRIMARY KEY (chunk_id, on_id, branch)
);

CREATE VIRTUAL TABLE chunk_fts USING fts5(
  name,
  body,
  content='current_chunks',
  content_rowid='rowid',
  tokenize='unicode61'
);

-- Derived, rebuildable, never part of commits: the link index
-- (fields and mentions — substrate.md, *Links*).
CREATE TABLE current_refs (
  source_id  TEXT NOT NULL,               -- chunk whose body holds the reference
  branch     TEXT NOT NULL REFERENCES branches(name),
  target     TEXT NOT NULL,               -- chunk id, or normalized location
                                          -- expression (mentions only)
  kind       TEXT NOT NULL CHECK (kind IN ('field', 'mention')),
  key        TEXT,                        -- declaring key when kind = 'field';
                                          -- element links share the key
  PRIMARY KEY (source_id, branch, target, kind, key)
);
```

`current_refs` is maintained like FTS: in the write transaction, delete-and-reinsert per touched chunk — declared ref keys (per element for `list`/`set`) and mentions scanned from prose and fenced expression blocks. Wipe it and it re-derives from current bodies. It is per-branch current state only; historical bodies remain in the version log, re-derivable if temporal link queries are ever wanted.

### Indexes

```sql
CREATE INDEX idx_current_placements_on ON current_placements(on_id, branch, kind);
CREATE INDEX idx_current_placements_chunk ON current_placements(chunk_id, branch);
CREATE INDEX idx_current_refs_target      ON current_refs(target, branch);      -- who points here
CREATE INDEX idx_current_refs_source      ON current_refs(source_id, branch);   -- delete-and-reinsert
CREATE INDEX idx_chunk_versions_chunk     ON chunk_versions(chunk_id, commit_id);
CREATE INDEX idx_placement_versions_chunk ON placement_versions(chunk_id, on_id, commit_id);
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

**Tokenization.** `body` is stored and indexed as JSON text. The `unicode61` tokenizer splits on word boundaries — punctuation including `{`, `}`, `"`, `:`, `,` is treated as separators — so a query like `match_: "world"` matches `body = {"greeting": "hello world"}`. The flip side: tokens from JSON keys are not distinguished from values, so `match_: "greeting"` would also match. The pilot accepts this as a "search over chunk text content" semantic, not a structured query — programs that need keyed search compose reads from places and dimensions, not FTS.

### The commit algorithm

```
commit(declaration, opts):

  reject if any chunk in the declaration targets a virtual chunk
    (db/branches, db/commits, branch archetype, commit archetype) → WriteToVirtualChunk

  BEGIN IMMEDIATE TRANSACTION

  let commit_id = generate_commit_id()
  let parent    = head_of(opts.branch)
  let timestamp = now_utc()

  INSERT INTO commits (id, parent_id, timestamp, message, process_id)
  VALUES (commit_id, parent, timestamp, declaration.message, opts.process_id)

  for each chunk in declaration.chunks:
    resolve id (declared or generated)
    INSERT INTO chunk_versions (chunk_id, commit_id, name, instance, body, removed)
    apply current-state transition for opts.branch

  for each placement (chunk-bound and bare):
    INSERT INTO placement_versions (chunk_id, on_id, commit_id, type, seq, active)
    apply current-state transition for opts.branch

  validate in Rust against post-write current state on this branch:
    for each chunk touched, union the instance specs of its archetypes
    and check the body against every obligation; validate ref targets;
    check name-within-owner, single-owner, seq rules

  refile current_refs for each touched chunk (delete-and-reinsert);
  collect links_modified

  any failure => ROLLBACK and return

  UPDATE branches SET head = commit_id WHERE name = opts.branch
  COMMIT
  (after tx.commit() returns Ok, push Commit to broadcast channel)

  return Commit
```

Validation is in Rust. SQL stores; Rust enforces. Validating in SQL would lock the key-map rules into SQL; Rust gives clearer code and easier evolution. Rules read against the open transaction's post-write state (see *Atomicity*), not a pre-fetched snapshot.

### Current-state transitions

For each `chunk_versions` row at branch B:

| chunk_versions row | current_chunks rule (branch B) |
|---|---|
| `removed = 0` | UPSERT row with new (name, instance, body) |
| `removed = 1` | DELETE current_chunks row; DELETE all current_placements rows where chunk is the chunk OR the place (branch B only) |

For each `placement_versions` row at branch B:

| placement_versions row | current_placements rule (branch B) |
|---|---|
| `active = 1` | UPSERT row with (kind, seq); auto-assign seq when the place is ordered and seq omitted (see below) |
| `active = 0` | DELETE row for (chunk_id, on_id, branch B) |

Removal is per-branch.

**Seq auto-assignment.** When `ordered: true` and `seq` is omitted, the assignment is `max(seq) + 1` over `current_placements` for that `(on_id, branch)`, evaluated as each placement is applied (not in batch). Within a single declaration that places multiple chunks on the same ordered place without seq, the assignments run sequentially: the second sees the first's just-applied row, gets `max + 2`, etc. Across concurrent commits, `BEGIN IMMEDIATE` serializes writes, so one commit's auto-assigned seqs are visible to the next before its `max` lookup runs.

### Query patterns

#### Intersection (the chunks)

Membership is a subquery over `current_placements` with no kind filter — all three stored kinds place a chunk at the intersection:

```sql
SELECT cc.*
FROM current_chunks cc
WHERE cc.branch = :branch
  AND cc.chunk_id IN (
    SELECT cp.chunk_id FROM current_placements cp
    WHERE cp.branch = :branch AND cp.on_id IN (:place_ids)
    GROUP BY cp.chunk_id
    HAVING COUNT(DISTINCT cp.on_id) = :n_places);
```

The same shape with `AND cp.kind = :kind` inside the subquery gives the per-kind counts. The `linked` answer is a separate indexed lookup, one per named root, unioned:

```sql
SELECT source_id, target, kind, key
FROM current_refs
WHERE branch = :branch AND target IN (:place_ids);
```

(Location-expression targets answer by expression match — normalization open, substrate.md.)

`exclude` and `match_` append conditions to the same WHERE — one filter chain, shared by the counts and the chunk fetch:

```sql
  AND cc.chunk_id NOT IN (
    SELECT chunk_id FROM current_placements
    WHERE branch = :branch AND on_id IN (:exclude_ids))     -- exclude
  AND cc.rowid IN (
    SELECT rowid FROM chunk_fts WHERE chunk_fts MATCH :query)   -- match_
```

**Empty read.** When `places` is empty, `in_place` is "every chunk on this branch" — the placement join is dropped:

```sql
SELECT cc.*
FROM current_chunks cc
WHERE cc.branch = :branch
LIMIT :limit OFFSET :offset;
```

With `match_` added, intersect against FTS as above but again without the membership subquery.

**Ordered window.** For a single ordered place, the chunk fetch joins that place's placement and pages from the tail — `ORDER BY ord.seq DESC` with `LIMIT/OFFSET`, the returned rows reversed in Rust so the window reads ascending. Every other fetch orders by `cc.chunk_id`. Pagination is position-based on the ordered result set, not seq-value-based: `LIMIT 10 OFFSET 20` returns the chunks at positions 21–30 counted back from the latest, regardless of how sparse seq values are.

#### Dimensions

For each place the intersection chunks are placed on, with counts split by kind:

```sql
WITH in_place AS (
  SELECT cp.chunk_id
  FROM current_placements cp
  WHERE cp.branch = :branch
    AND cp.on_id IN (:place_ids)
  GROUP BY cp.chunk_id
  HAVING COUNT(DISTINCT cp.on_id) = :n_places
)
SELECT
  cp.on_id,
  COUNT(*) FILTER (WHERE cp.kind = 'owned')    AS owned_count,
  COUNT(*) FILTER (WHERE cp.kind = 'instance') AS instance_count,
  COUNT(*) FILTER (WHERE cp.kind = 'relates')  AS relates_count,
  COUNT(*) AS total
FROM current_placements cp
JOIN in_place ON in_place.chunk_id = cp.chunk_id
WHERE cp.branch = :branch
GROUP BY cp.on_id
ORDER BY total DESC;
```

(Dimensions include the places in the input — they qualify trivially. The consumer filters them out only if they want the "what to add" view excluding the input.)

When `places` is empty, the `in_place` CTE collapses to "every chunk on this branch" — every dim in the field appears in `dimensions`, sorted by count. Edges become empty in this case: with empty input, every dim is already adjacent, so there is nothing "beyond."

#### Edges (for each dim, what it reaches beyond)

```sql
-- for each adjacent dim X, find dims Y that any chunk on X also touches,
-- where Y is not in the current read and not already adjacent
SELECT
  cm1.on_id AS from_dim,
  cm2.on_id AS to_dim,
  COUNT(*) FILTER (WHERE cm2.kind = 'owned')    AS owned_count,
  COUNT(*) FILTER (WHERE cm2.kind = 'instance') AS instance_count,
  COUNT(*) FILTER (WHERE cm2.kind = 'relates')  AS relates_count,
  COUNT(*) AS total
FROM current_placements cm1
JOIN current_placements cm2 ON cm1.chunk_id = cm2.chunk_id AND cm2.branch = cm1.branch
WHERE cm1.branch = :branch
  AND cm1.on_id IN (:dimension_ids)        -- adjacent dims from previous query
  AND cm2.on_id NOT IN (:place_ids)
  AND cm2.on_id NOT IN (:dimension_ids)
  AND cm1.on_id != cm2.on_id
GROUP BY cm1.on_id, cm2.on_id
ORDER BY total DESC;
```

#### Virtual chunks (branches and commits)

When `read` is called with `db/branches` or `db/commits`, the read layer projects from the underlying tables instead of joining current_chunks:

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
         'process_id', c.process_id
       ) AS body,
       a.depth AS seq
FROM commits c JOIN ancestry a ON c.id = a.id
ORDER BY seq;
```

The virtual-place projections accept these parameter shapes:

- `[db/commits]` — every commit
- `[db/commits, branch_id]` — commits in that branch's ancestry
- `[db/commits, process_id]` — commits from that process
- `[db/commits, chunk_id]` — commits that modified that chunk
- `[db/branches]` — every branch
- `[db/branches, branch_id]` — that single branch

Shapes the projections don't recognize (additional parameters, places not in the table above) just return what falls out of the join — typically nothing matches. An unrecognized shape is an empty result, not an error.

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

The `Db` handle holds a `tokio::sync::broadcast::Sender<Commit>`. Each successful write op (`commit`, `create_branch`, `delete_branch`) pushes the resulting `Commit` onto the channel immediately after `tx.commit()` returns Ok. Subscribers (`subscribe`) hold receivers and filter on `placements_modified`/`chunks_modified`.

By the time the push runs, the SQL commit is durable and visible to any subsequent reader — atomic from any observer's perspective. Rolled-back transactions never reach the push, so subscribers see only durable commits.

The channel is bounded; on overflow the oldest event drops and a `Lagged` marker reaches the subscriber so they can re-read from a known commit if needed. The push itself is non-blocking — slow consumers do not block the writer.

### Transaction discipline

All writes use `BEGIN IMMEDIATE` to acquire the SQLite write lock up front — no deadlock-by-upgrade. Reads use the default deferred mode and benefit from WAL's reader-doesn't-block-writer behavior. Open settings: `journal_mode = WAL`, `synchronous = NORMAL`.

---

## Concurrency

SQLite in WAL mode gives single-writer, many-reader. The db inherits this; nothing is invented on top.

**One writer at a time.** Concurrent `commit` calls serialize at the SQLite level. Default busy timeout is 5 seconds; on timeout the call fails and the caller decides whether to retry.

**Readers do not block writers; writers do not block readers.** A read started during a write reads from a snapshot taken at the read's start; the in-progress write is invisible until it commits.

**Per-call read consistency.** Each read runs in its own implicit transaction — consistent within one call, may shift between consecutive calls.

**Cross-call read consistency.** Open. The engine's most demanding read pattern fits in a single multi-place `read` call; explicit snapshot handles may not be needed for the pilot.

**Reactivity does not block writes.** The change-stream channel is bounded and non-blocking on push; slow consumers drop the oldest with a `Lagged` marker.

---

## Code architecture

### Module layout

```
db/
  src/
    lib.rs                 — public re-exports
    types.rs               — ChunkId, CommitId, ChunkItem, Spec, Commit, Includes,
                             ReadOpts, ReadResult, Dim, Edge, Placement,
                             Declaration, ChunkDeclaration, PlacementSpec,
                             GetOpts, CommitOpts, BranchName, Branch, SubscribeOpts
    errors.rs              — per-op error enums (OpenError, ReadError, WriteError, ...) via thiserror
    schema.rs              — embedded DDL via include_str! + rusqlite_migration list;
                             latest_version() derives this build's user_version
    schema.sql             — DDL: tables, indexes, FTS triggers
    id.rs                  — ULID-shaped id generation (`ulid` crate)
    db.rs                  — Db { conn: Mutex<Connection>, sender: broadcast::Sender<Commit>,
                                  read_only: bool }
                             Db::open, Db::open_read_only, require_writable, Drop
    validate.rs            — Rule enum + check_commit; instance-spec obligations,
                             ref-target checks, owner/name rules
    refs.rs                — current_refs refile (delete-and-reinsert per chunk);
                             body scan for tagged refs + mentions; link delta
    virtual_chunks.rs      — db/branches / db/commits projection (used by ops::read, ops::get)
    bootstrap.rs           — initial seed on fresh open (main branch + initial commit)
    ops/                   — public surface; one module per Db method
      mod.rs               — re-exports
      get.rs               — Db::get
      commit.rs            — Db::commit; transitions inline
      branches.rs          — Db::create_branch, Db::delete_branch
      subscribe.rs         — Db::subscribe (BroadcastStream + place filter)
      read/                — folded because of size: four distinct query paths
        mod.rs             — Db::read orchestrator; opts/result plumbing
        intersection.rs    — chunks query (with/without FTS, with/without empty read, hydration)
        dimensions.rs      — dimensions CTE
        edges.rs           — edges-beyond-adjacency
        time_travel.rs     — `at: Some(commit)` ancestry walk
  tests/                   — integration tests against the spec
  Cargo.toml
```

Each `ops/*.rs` owns its method end-to-end via `impl Db { pub fn ... }`. Rust spreads `impl Db` across files — that keeps `ops/` flat where it can be flat. `read/` is folded because the public method fans into four distinct query paths.

### Pattern repeated in every feature file

```rust
// 1. SQL as `const`s at the top — declarative, scannable.
const INTERSECTION: &str = "...";

// 2. The public method on Db. Reads top-to-bottom; narrates the flow.
impl Db {
    pub fn read(&self, places: &[ChunkId], opts: ReadOpts)
        -> Result<ReadResult, ReadError> { ... }
}

// 3. Private free functions for shape: param prep, row mapping.
fn row_to_chunk_item(row: &Row) -> Result<ChunkItem> { ... }
```

`git diff` between any two feature files reads as the same shape with different verbs. Coherence through pattern, not folder.

### Within-file shape

The pattern scales by decomposition. When a method outgrows top-to-bottom narrative, it splits into named private helpers in the same file; the public method becomes the orchestrator that reads the helpers in order. `ops/read/` is the folded form when one method fans into four distinct query paths; inside any single file, no function reads as a wall.

What's genuinely non-obvious here and earns a comment (per [`conventions.md`](../conventions.md#code)): the post-`tx.commit()` broadcast send is a deliberate ordering (the SQL commit must be durable before subscribers can see the change); `check_commit` reads through the open transaction's view, not a pre-fetched snapshot; the `meta` table check guards against re-seeding on bootstrap.

### Key mechanics

**Connection ownership.** `Db { conn: Mutex<Connection>, sender: broadcast::Sender<Commit> }`. Every op locks before touching the connection. SQLite is single-writer anyway; the mutex is uncontested in practice and gives `Db: Send + Sync` for free. Subscribers hold their own `broadcast::Receiver`; they do not retain `&Db`.

**Transactions.** No custom RAII helper. `conn.transaction_with_behavior(TransactionBehavior::Immediate)?` returns rusqlite's `Transaction` — Drop = ROLLBACK; explicit `tx.commit()` advances. Used directly inside `ops::commit` and `ops::branches`.

**Reactivity push.** Three call sites push the resulting `Commit` onto `db.sender` — `ops::commit`, `ops::branches::create_branch`, `ops::branches::delete_branch` — two lines each, repetition over a wrapper. The post-`tx.commit()` ordering and its durability guarantee are spec'd above under *Reactivity wiring*.

**Validation.** `Rule` enum with one variant per rule (`Keys`, `RefTargets`, `Unique`, `Ordered`, `NameUnique`, `SingleOwner`); `match` dispatches inside `check_commit(conn, branch, touched)`. Adding a rule = adding a variant. Reads run through the open transaction (see *Atomicity*).

**Errors.** `thiserror`. Per-op enums (`OpenError`, `ReadError`, `WriteError`) with shared variants (e.g. `IoError(rusqlite::Error)`) duplicated across them — dumb-but-clear over a single mega-enum.

**IDs as newtypes.** `ChunkId(String)`, `CommitId(String)`, `BranchName(String)` with `From<&str>` and `Display`.

**Sync surface, async reactivity.** `read`, `get`, `commit`, `create_branch`, `delete_branch` are sync (SQLite is sync). `subscribe` returns a `Stream` — async, the natural shape for change feeds (via `tokio_stream::wrappers::BroadcastStream`).

### Settled choices

- **`rusqlite_migration`** with the full schema as the v1 migration.
- **Schema version = `user_version`.** The migration list owns SQLite's `user_version` pragma; that number is the db's schema version. The version this build writes is derived by running the list against an in-memory db (`schema::latest_version()`) — no constant duplicating the DDL. `open_read_only` compares a peer's file against it and refuses skew; the host refuses the same mismatch a step earlier, at cascade-walk time ([`host.md`](host.md#boot-sequence) steps 3–4).
- **JSON for body and instance.** Body is `serde_json::Value`, carrying the tagged value encoding for typed keys (`$ref`, `$loc`, `$set`, `$time`, `$md` — sdk.md owns translation; the db validates tags against instance contracts). The `instance` column holds the flat key-map, plus the reserved interim `$ordered` entry (substrate.md, *What's Open*).
- **Hot keys escalate with expression indexes.** A typed key a query proves hot gets a SQLite expression index on `json_extract(body, '$.key')` — per key, promotion-when-proven, never a storage rewrite.
- **Bootstrap idempotence.** A `meta` table with a single bootstrap-version row; `open()` checks before seeding.

---

## What is open

- **Cross-call read snapshots** — explicit handles for multi-read consistency.
- **Branch-meta commits** — whether `create_branch`/`delete_branch` should write commits on a meta-branch for uniform traceability.
- **FTS branch-scoping** — currently FTS holds all branches; branch filter at query time.
- **Bootstrap IDs** — resolved at the substrate level (lookup-by-name); carries through. Ownership paths (`engine/program`) make path-lookup the natural convention: resolve each segment as a name among the previous chunk's owned children.
- **Eager vs lazy link re-derivation on spec edits** — editing an archetype's instance spec invalidates the derived rows of every instance; eager fan-out vs knowingly-stale-until-next-write is the sharpest open engineering decision (substrate.md, *What's Open*).
- **Time-travel query optimization** — recursive ancestry walk is correct but unmeasured.
- **Divergence from built code, tracked**: the implemented crate still validates the retired spec language (`accepts`/`required`/`propagate`), has a two-kind placement CHECK, and no `current_refs`. Spec leads; the alignment pass follows (board).
