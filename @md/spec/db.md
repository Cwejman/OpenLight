# DB

The program that hosts the field. The substrate is delivered to consumers through this program; SQLite is the substrate's persistent body underneath.

A single Rust crate, compiled into the engine — its own artefact ([`engine.md`](engine.md)). Owns one SQLite database file per project at `.ol/db`. No in-memory cache that can drift from disk — SQLite is the single source of truth.

The substrate spec defines what the field IS. This document defines two contracts:

- **Consumer ↔ db.** What the engine, the host, and any program reaching the substrate sees.
- **db ↔ SQLite.** What the db expresses in SQL and the discipline that holds.

Both answer to [`substrate.md`](substrate.md). Where they disagree, the substrate spec is right.

Two facts from the law shape everything below. **Filtering is uniform** — bodies, membership answers, adjacency, links and full-text search all pass the reader's boundary, and counts describe what the boundary admits (substrate.md, *Boundaries*). And a boundary is a **selection expression** drawn from the single-request class of the language, which means it must evaluate inside the same statement as the read it filters. So the db carries one engine-internal **plan interface** — relational ops plus transitive closure — into which both boundary evaluation and read-native expression chains lower ([`engine.md`](engine.md), *The planner partition*). It is never program-facing: no author writes SQL, and no program sees a plan.

Uniform filtering is not free, and this file is where its three prices are written down rather than discovered: the commit-touched projection has to be reachable from a boundary term (*Branches and commits as virtual chunks*); subscription invalidation needs an index from the dimensions named in boundaries to the boundaries naming them (*The boundary invalidation index*); and the planner's memo key gains the boundary and fragments per reader (*Memoized plans*). They are taken in that order below.

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

`open_read_only` is the read-only-attach open ([`engine.md`](engine.md), *Stores and attach*). It opens with `SQLITE_OPEN_READ_ONLY` and **never creates, migrates, or seeds**: a missing file is `MissingDatabase`, a file whose schema version differs from this build's is `SchemaVersionSkew` (peer migration is a v0.2 concern — see *Settled choices*), and every write op refuses with `ReadOnly` before reaching SQLite — the open flag is the backstop, the explicit refusal is the legible error. The handle carries a change stream that never fires: a read-only attachment contributes reads, not events.

The db's own bootstrap is small: one row in `branches` (the bootstrap branch, `main`) and one initial commit in `commits`. The substrate's archetypes for branches and commits, and the anchors `db/branches` and `db/commits`, are **projected** by the read layer with hardcoded shapes — not stored as chunks. Field content (archetypes, user data, project-specific places — whatever this particular db holds) is not the db's concern; the host's bootstrap routine writes those via `db.commit()` after `Db::open` returns.

### The plan interface

Engine-internal. The engine's planner lowers two things into it — a boundary selection, and a read-native expression chain — and the db compiles the result into **one** SQL statement. A plan denotes a set of chunk ids and nothing else; hydration, counts and adjacency are the read layer's, computed over whatever set the plan yields.

```rust
/// A set of chunk ids, described relationally.
pub enum Plan {
    All,                    // every chunk on the branch
    Chunks(Vec<ChunkId>),   // literal ids — a `ref` term
    // chunks placed on every id, any stored kind — the intersection;
    // one id is the place at that chunk
    Place(Vec<ChunkId>),
    Commits(CommitTerm),    // commit ids, projected (below)
    Touched(Box<Plan>),     // chunks the input's commits modified
    Union(Vec<Plan>),
    Intersect(Vec<Plan>),
    Minus(Box<Plan>, Box<Plan>),   // subtraction
    Filter { input: Box<Plan>, pred: Pred },
    Closure { seeds: Box<Plan>, edges: Edges, depth: Option<u32> },
}

pub enum Pred {
    // json_extract(body, '$.<path>')
    Key { path: String, op: Cmp, value: serde_json::Value },
    // element of a JSON array
    Has { path: String, value: serde_json::Value },
    Fts(String),   // FTS5 over name + body
}

pub enum Cmp { Eq, Ne, Lt, Le, Gt, Ge, Exists }

/// Which edges a closure walks, and which way.
pub struct Edges {
    pub placements: KindSet,   // any subset of owned | instance | relates
    pub links:      LinkSet,   // any subset of field | mention
    pub dir:        Dir,
}

/// `Down` steps along an edge toward its source: from a place to what is placed
/// on it, from a chunk to what points at it. `Up` steps toward its target: from
/// a chunk to the places it sits on and to what its body references.
pub enum Dir { Down, Up }

pub struct CommitTerm {
    pub branch:  Option<BranchName>,   // commits in that branch head's ancestry
    pub process: Option<String>,       // commits from that run
    pub chunk:   Option<ChunkId>,      // commits that modified that chunk
    pub ids:     Vec<CommitId>,        // named commits
}
```

**`Closure` is the primitive; the verb is the engine's — now specced.** `follow` is closure-of-a-step over the hop verbs ([`engine.md`](engine.md), *Hops and `follow`*): the step names its edge kinds and direction, depth is a parameter, termination is visited-set, and the closure reports the edges it walked. All of it lowers here by choosing a kind-set, a direction and a depth bound — which is exactly what this primitive was drawn to receive.

Entry points:

```rust
impl Db {
  fn resolve(&self, plan: &Plan, opts: ReadOpts)
       -> Result<ReadResult, ReadError>;

  fn admits(&self, boundary: &Plan, ids: &[ChunkId], branch: &BranchName)
       -> Result<Vec<bool>, ReadError>;
}
```

`resolve` is `read`'s general form: `read(places, opts)` is exactly `resolve(Place(places), opts)` once `exclude` and `match_` fold in as `Minus` and `Filter`. One query builder serves both doorways; `read` survives as the named case because it is the shape the protocol's `read` op carries.

`admits` is the point membership test — one semijoin, no hydration. The engine uses it to decide `BOUNDARY_VIOLATION` on a named root before a read runs, and on `get`. Whether that error is the right answer at all is engine.md's open (*the existence oracle*); the physical primitive is neutral either way.

**db evaluates what it is handed and adds no terms of its own.** The law's always-on boundary terms — the frame `[self]`, and the free read up from an instance to its archetype (substrate.md, *Propagation by hop*) — are the engine's to assemble into the plan it hands down. Physically the archetype hop is a depth-1 `Up` closure over `instance` edges, unioned onto the boundary; the primitive carries it, but db does not insert it. *Open, and neither substrate.md nor engine.md says whose job it is to materialize that term.* Note what falls out once it is materialized: admitting the archetype **chunk** makes its address, name and instance contract readable while its members stay subject to the same filter — so the physical default answers substrate.md's open ("what that freedom shows of the archetype now that counts are boundary-admitted") in the narrow direction, by construction rather than by ruling.

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

`read` returns the intersection of the named places — chunks placed on every one of them, by any stored placement kind: `owned`, `instance`, and `relates` all put a chunk at the intersection (substrate.md, *Read*). The `in_place_owned` / `in_place_instance` / `in_place_relates` counts report the split; the `linked` field carries the body-derived kinds (fields and mentions pointing at the roots), never mixed with placements. `get` returns a single chunk by id, or `None` if not present in current state — or not admitted by the boundary; the two are indistinguishable in the return, deliberately, and the engine separates them with `admits`.

`ReadOpts`:

```
ReadOpts
  branch: BranchName            default "main"
  boundary: Option<Plan>        the reader's boundary, lowered. None admits
                                everything on the branch — host-initiated calls
                                (Context::process_id = None, engine.md)
  at: Option<CommitId>          time travel
  match_: Option<String>        FTS5 filter applied within the intersection
  exclude: Vec<ChunkId>         places subtracted
  limit: Option<usize>          pagination
  offset: Option<usize>
  include: Includes             what to populate
```

**Every part of the answer passes `boundary` first** — the intersection chunks, all four counts, `linked`, `dimensions`, `edges`, and the FTS filter alike. There is no privileged view of a full set: `total` is the chunks the boundary admits on this branch, not the chunks on this branch, and a dimension's count is the admitted members placed there. This is one predicate applied in one place — the compiled statement carries the boundary as a CTE every other clause semijoins against (*Query patterns*).

**The boundary is always current, even under `at`.** When `at` is set the read resolves chunks and placements from the version tables, but the boundary CTE still reads current state. Placing a chunk on `secrets` today hides it throughout all history; removing it exposes history (substrate.md, *Boundaries*). Physically this is one substitution that deliberately does not apply to one CTE.

`exclude` subtracts: a chunk placed on any excluded root — any stored kind — is out of the intersection and out of its counts (substrate.md, *Read* and *Boundaries*). `exclude` shapes results, not dimensions: `dimensions` and `edges` are computed from the unexcluded intersection — pinned as-built for v0.1, honored in dimensions when a surface demands it. The asymmetry is the read op's, not the algebra's: `resolve` composes `Minus` wherever the plan puts it.

`GetOpts` is the single-chunk subset — `get` resolves one chunk, so the read-shaping knobs don't apply:

```
GetOpts
  branch: BranchName            default "main"
  boundary: Option<Plan>        as ReadOpts
  at: Option<CommitId>          time travel
  include: Includes             only the chunk-self flags (name/instance/body/
                                placements) apply; read-level flags are ignored
```

`places` may be empty. An empty read means the whole field — every chunk the boundary admits qualifies for the intersection (vacuous truth), composed with `match_`, `Includes`, and `limit` like any other read. Pagination is the guardrail against unbounded fetches, not a runtime restriction.

Under an empty read the counts collapse: `in_place = total` and the per-kind splits are degenerate — reported for consistency with the non-empty case, not as useful attribution. `linked` is empty under an empty read (links answer per named root).

**Order and pagination.** When the read names exactly one place and that place is ordered — an instance of an archetype carrying `seq: true` (substrate.md, *Ordered places*) — the window is **tail-first**: the default is the latest entries and `offset` pages backward from the end (`limit: 10, offset: 10` returns the ten entries before the last ten). Within the window the chunks always read ascending by `seq` — the query sorts descending and the window is reversed before it returns. Every other read (empty, several places, or an unordered one) pages forward in `chunk_id` order. Positions are set positions, not seq values: sparse seqs leave no gaps in a window. Duplicate explicit seq values are legal; ties break by commit order — the earlier-committed placement reads first. Ordering runs over the **admitted** window: a member the boundary excludes leaves no hole and no position.

### Result

```
ReadResult
  head                  commit sampled
  unresolved            input roots with no current chunk — a dead reference
                        reported as metadata, not an error; the read still runs.
                        A root that exists but the boundary does not admit is
                        *not* reported here — silence, not a signal
  total                 chunks the boundary admits on this branch
  in_place              admitted chunks at intersection
  in_place_owned        ...via owned on every named place
  in_place_instance     ...via instance on every named place
  in_place_relates      ...via relates on every named place
  chunks: [ChunkItem]   intersection chunks (opt-in)
  linked: [Link]        who points at the roots — fields and mentions,
                        derived, never mixed with placements; sources filtered
                        by the boundary like every other answer
  dimensions: [Dim]     places you can add (opt-in)
```

```
ChunkItem
  id                          always
  name?  instance?  seq?  body?  placements?
                              chunk self-data (opt-in)

Link
  source_id                   the chunk whose body holds the reference
  target                      a root chunk id — or a normalized location
                              expression (mentions only)
  kind                        'field' | 'mention'
  key?                        the declaring key, when kind = field

Dim
  id, name
  count                       admitted chunks at intersection placed here
  owned, instance, relates    per-kind split
  edges?: [Edge]              places you can reach from this dim, beyond
                              current adjacency (opt-in)

Edge
  id, name
  count                       admitted chunks on this dim also placed on
                              the edge dim
  owned, instance, relates

Placement
  on, kind, seq?              kind ∈ owned | instance | relates; seq is a
                              position, present when the place is ordered

Instance (the chunk's `instance` field)
  KeyMap                      flat typed key-map (string | number | time |
                              markdown | ref(X)? | loc | expr | selection |
                              list<…> | set<…> | map; per-key `?` and `unique`)
```

`ChunkItem.seq` is the **archetype flag**, a boolean — `seq: true` declares this archetype's instances ordered places (substrate.md, *Ordered places*). `Placement.seq` is a **position**, an integer. Same word, two grains; they never meet in one struct. The law overloads it and this spec follows rather than renaming.

**Why dimensions and edges differ:** dimensions are places intersection chunks already touch — adding any keeps the intersection non-empty (narrowing). Edges are places a dim's chunks (including chunks NOT at the current intersection) touch beyond the current adjacency — reachable only by stepping out of the current read.

A dimension whose own chunk the boundary does not admit **does not appear** — the semijoin drops it, name and count together. *Open, carried from substrate.md: whether an unreadable dimension should vanish entirely or surface as an opaque count.* Vanishing is what the uniform filter gives for free; the opaque-count variant costs a second unfiltered aggregate beside the filtered one, per dim, and is not built.

Sort: `dimensions` and `Dim.edges` both descending by `count`.

### Includes

```
Includes                  default: every flag false

  chunk_name  chunk_instance  chunk_body  chunk_placements
                          per ChunkItem

  intersection_chunks     populate `chunks`
  dimensions              populate `dimensions`
  edges                   also populate `Dim.edges`

  rank  snippet           with match_ — declared, deferred: unbuilt in v0.1
```

`ChunkItem.seq` rides `chunk_instance`: the flag is legal only on a chunk carrying an instance contract, so it travels with the contract rather than earning a flag of its own.

Minimum return when nothing is opted in: `head`, four counts, empty `chunks`, empty `dimensions`.

Convenience constructors:

```
Includes::shape()   = { dimensions }
Includes::content() = { intersection_chunks, chunk_name, chunk_body,
                        chunk_placements }
Includes::all()     = every flag
```

### Branches and commits as virtual chunks

The substrate's discipline is that everything is chunks and placements. Branches and commits are projected by the read layer as virtual chunks — they appear in `read` and `get` like any other content:

- `db.read(&[db/branches], opts)` — every branch as a chunk; body carries `{ head: commit_id }`.
- `db.read(&[db/branches, branch_id], opts)` — a single branch.
- `db.read(&[db/commits, branch_id], opts)` — commits in the branch's ancestry, ordered.

`db/branches` and `db/commits` are well-known ids recognized by the read layer. They are not stored — they are projection anchors with hardcoded contracts (the `branch` and `commit` archetypes). Two of them appear per db, and the `db/` prefix is reserved for substrate-machinery virtual places.

`Plan::Place` recognizes the same anchors and lowers them to the same projections, so the recognition has one home and a boundary term may name a commit or a branch exactly as a read may. **That is the first price of uniform filtering, paid here: the commit-touched projection is admissible in boundary evaluation.** Granting a single commit as a dimension makes its touched set readable in one gesture (substrate.md, *Commits*), which means `[commit_c]` must lower to a boundary term — `Touched(Commits { ids: [c] })`, one join against the version tables, inside the single statement.

*Ruled (2026-08-12): a projection declares its own ordering.* The projection synthesizes a per-row position from ancestry depth (*Query patterns*), and that synthesis **is** the declaration — a projected archetype needs no stored flag; `seq: true` is the stored-archetype form of the same fact.

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
  placements: [PlacementSpec]   bare placements (no chunk content change)
  message: Option<String>

CommitOpts
  branch: BranchName            which branch this commit lands on
  process_id: Option<String>    engine metadata, propagated to the commit chunk
  read: Option<Plan>            the writer's boundaries, lowered. None admits
  write: Option<Plan>           everything — host-initiated commits
```

The whole declaration is one transaction. All writes succeed and a commit is recorded, or all fail and nothing is written.

The boundaries ride into `commit` because substrate's write law is checked against **post-write state** — a chunk created and placed in one declaration must be judged after both land — and the checks are semijoins against the same admitted sets the read path builds. The engine constructs the boundary; the db evaluates it and enforces (*Atomicity*, *Governance checks*).

Placement residency is not checked: neither side of a placement need be resident in this db — chunk ids are globally unique, so a placement may reference a chunk another db owns (substrate.md, *Peers*). A dangling reference surfaces at use, as an unresolved root on a read. Removal is the exception: it names a chunk that must be present here to remove.

The result is the `Commit` itself — a chunk-shaped artifact:

```
Commit
  id, parent_id?, timestamp, message?, process_id?
  branch: BranchName                which branch the commit landed on
  chunks_modified:     [ChunkId]
  placements_modified: [(ChunkId, ChunkId)]
      (chunk_id, on_id) entered or left
  links_modified:      [ChunkId]
      chunks whose inbound links changed — the link delta, computed
      from the current_refs refile in this transaction
```

`chunks_modified`, `placements_modified`, and `links_modified` are the deltas — for caller convenience, for filtering on the change stream (a subscription on a chunk fires when links *to* it appear or disappear, engine.md), and for the boundary invalidation index below. `branch` is the event's only carrier of where the commit landed, so `SubscribeOpts.branch` has something to filter on.

The first two deltas are **recoverable after the fact** — they are the version rows this commit wrote, which is what makes `read([db/commits, chunk_id])` answerable at all. `links_modified` is not: links are never part of commits and the table is rebuilt from current bodies (substrate.md, *Links*), so a commit's link delta exists only on the event that carried it. `[db/commits, chunk_id]` therefore answers "commits that changed this chunk or its placements", never "commits that changed who points at it". **Ruled (2026-08-12): this stays so** — the historical question remains derivable from body versions, and if a real consumer ever wants it cheap, the index is built as derived data; truth and performance indexes are different things (revisit with the object-model research).

### Branch operations

```rust
impl Db {
  fn create_branch(&self, name: &str, from: CommitId)
       -> Result<Branch, WriteError>;

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
  branch: BranchName    default "main" — which branch's commits to watch
```

A single subscription primitive. Yields commits that touch the named places (any of them). Backed by an internal broadcast channel pushed from Rust right after `tx.commit()` returns Ok (see *Reactivity wiring*); state and event are tightly coupled — by the time the event arrives, the SQL commit is durable and visible to any reader.

Subscribe at any place to listen there:

- `subscribe(&[db/commits])` — every new commit.
- `subscribe(&[db/branches])` — branch graph mutations.
- `subscribe(&[my_session])` — changes touching the session's content.

The stream itself is not boundary-filtered: it carries commits, and the engine's dispatcher filters each fan-out by the subscribing process's boundary before an event reaches a program (engine.md, *Reactivity Wiring*).

Backpressure: each subscriber has a bounded receiver. On overflow, oldest events drop and a `Lagged` marker is emitted. Subscriptions are tied to the handle's `Db` lifetime; dropping the stream unsubscribes.

### The boundary invalidation index

A run's boundary expression is frozen, but membership through it is live, so a commit elsewhere can drop a subscribed place out of what a boundary admits. Finding which boundaries a commit could disturb, without re-evaluating every live one, needs an index **from the dimensions named in boundaries to the boundaries naming them**. That is the second price of uniform filtering; engine.md names this file as its home and is its only consumer.

```rust
pub struct BoundaryId(u64);

impl Db {
  fn register_boundary(&self, plan: &Plan) -> BoundaryId;
  fn unregister_boundary(&self, id: BoundaryId);
  fn boundaries_touching(&self, commit: &Commit) -> Vec<BoundaryId>;
}
```

`register_boundary` walks the plan for its **named leaves** — every id appearing in a `Chunks`, `Place`, `Commits` or closure-seed node — and files one inverted-index entry per id. `boundaries_touching` looks up the union of the commit's `chunks_modified`, both sides of each `placements_modified` pair, and `links_modified`, and returns every boundary any of them reaches.

The index is **in memory, beside the broadcast sender, not a table**: boundaries belong to live processes and die with the engine, exactly as subscriptions do. `Mutex<HashMap<ChunkId, HashSet<BoundaryId>>>` plus the reverse map for unregistration. Nothing about it is durable and nothing rebuilds it at open.

Its known hole is why this is a budget and not a mechanism: **a `Closure` boundary names its seeds only.** Its membership depends on chunks it never names, so a commit touching a chunk three hops down reaches no index entry and the boundary is not re-checked. Registering the seeds is the honest under-approximation, named here at the physical grain. *Not ruled — three candidates carried from engine.md: index the closure (and re-index it on every commit that moves the walked edges), exclude transitive boundaries from subscription-backed reach, or scan for that class.*

### Errors

```
ValidationError { chunk_id, kind }
    spec violation; kind = MissingKey | KeyType | RefTarget |
    RefArchetype | Unique | AmbiguousKey (two instance contracts claim
    one key with different types) | MultiOwner (a second owned
    placement) | NameRequired (the chunk has members and no name) |
    SeqNotArchetype (`seq: true` on a chunk with an empty instance
    contract) | SeqOnUnordered (a placement carries an explicit seq
    onto a place that is not an instance of a `seq: true` archetype)

BoundaryViolation { kind, chunk_id, on_id? }
    kind = WriteDimension (no write over the place a placement lands
    on) | ReadPlacedChunk (no read over the chunk being placed) |
    ReadLinkTarget (no read over a ref or mention target)

NameCollision { owner_id, name }
    name uniqueness within the owner

NotFound { kind, id }
    removal target, branch, or commit not present — never a placement
    side, which may dangle by design

MalformedDeclaration(reason)
    declaration self-inconsistent

WriteToVirtualChunk { id }
    declaration targets a projected chunk

ReadOnly
    write op on a handle from open_read_only

MissingDatabase { path }
    read-only open found no file (never creates)

SchemaVersionSkew { found, expected }
    read-only open found another version

IoError(SqliteError)
    underlying SQLite error
```

### Atomicity

A declaration is one transaction. Inside:

1. Insert version rows for everything in the declaration.
2. Apply current-state transitions (FTS triggers fire; seq auto-assignment runs).
3. Run validation against the post-write current state: instance-contract obligations for every touched chunk (the union of the contracts of every archetype it is `instance` on), ref-target checks for declared ref keys (locally resolvable targets — cross-store targets are the engine's, substrate.md *Links*), name uniqueness within the owner, **a name present on every chunk that has members**, single-owner, and the two seq rules (`seq: true` only on a chunk with a non-empty instance contract; an explicit placement seq only onto an ordered place).
4. Run the governance checks against `opts.read` / `opts.write` (below).
5. Refile `current_refs` for every touched chunk (delete-and-reinsert); collect the link delta.
6. If everything passes: insert the commit row, advance the branch HEAD, COMMIT, push to the change stream.
7. If anything fails: ROLLBACK. Nothing recorded; nothing emitted.

Writes within a declaration are visible to validation through ordinary SELECTs (the post-write state lives in current-state tables inside the transaction), but invisible to other transactions until COMMIT. The substrate's two-pass write-then-validate is delivered by SQLite transaction semantics directly.

A commit row appears only when every check passes. The change stream emits only successful commits.

#### Governance checks

Substrate's write law, applied per record in the declaration (substrate.md, *Who May Write What*):

| record | check |
|---|---|
| `owned` or `relates` placement created | `on_id` ∈ write-admitted **and** `chunk_id` ∈ read-admitted |
| `owned` or `relates` placement removed | `on_id` ∈ write-admitted |
| `instance` placement, created or removed | none — instancing is a claim, not a publication |
| link filed into `current_refs` | `target` ∈ read-admitted |

Each is one semijoin against the boundary CTEs, run inside the same transaction as validation and against the same post-write state. When `read`/`write` are `None` the checks are skipped wholesale — a host-initiated commit admits everything.

Two edges are physical and unresolved:

- *Open, carried from substrate.md:* creating a placement requires read over the placed chunk, but at birth the chunk does not yet exist to be read. Physically the check runs against post-write state, where the newborn chunk **is** present — so it passes iff the boundary admits it by some term other than existence. That is a coherent behavior; nobody has ruled it the intended one.
- A mention whose target is a normalized location expression rather than a chunk id has no single target to semijoin. v0.1 checks chunk-id targets only; the place-description case is carried open with expression normalization (substrate.md, *What's Open*).

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
  instance   TEXT NOT NULL DEFAULT '{}',         -- JSON key-map
  -- the archetype flag: 1 = this archetype's instances are ordered places
  seq        INTEGER NOT NULL DEFAULT 0,
  body       TEXT NOT NULL DEFAULT '{}',         -- JSON
  removed    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chunk_id, commit_id)
);

CREATE TABLE placement_versions (
  chunk_id   TEXT NOT NULL,
  on_id      TEXT NOT NULL,
  commit_id  TEXT NOT NULL REFERENCES commits(id),
  kind       TEXT NOT NULL CHECK (kind IN ('owned', 'instance', 'relates')),
  seq        INTEGER,     -- the position, where the place is ordered
  active     INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (chunk_id, on_id, commit_id)
);

CREATE TABLE current_chunks (
  chunk_id  TEXT NOT NULL,
  branch    TEXT NOT NULL REFERENCES branches(name),
  name      TEXT,
  instance  TEXT NOT NULL DEFAULT '{}',
  seq       INTEGER NOT NULL DEFAULT 0,
  body      TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (chunk_id, branch)
);

CREATE TABLE current_placements (
  chunk_id  TEXT NOT NULL,
  on_id     TEXT NOT NULL,
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
  source_id  TEXT NOT NULL,   -- chunk whose body holds the reference
  branch     TEXT NOT NULL REFERENCES branches(name),
  -- chunk id, or normalized location expression (mentions only)
  target     TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('field', 'mention')),
  -- declaring key when kind = 'field'; element links share the key
  key        TEXT,
  PRIMARY KEY (source_id, branch, target, kind, key)
);
```

**Two `seq` columns, two meanings.** `chunk_versions.seq` / `current_chunks.seq` is the boolean archetype flag — `seq: true`, legal only on a chunk with a non-empty `instance` (validated, `SeqNotArchetype`). `placement_versions.seq` / `current_placements.seq` is the integer position of a chunk within an ordered place. A flat `INTEGER NOT NULL DEFAULT 0` carries the flag rather than a nullable boolean: absent and false are the same fact, and the join below tests `= 1`.

`current_refs` is maintained like FTS: in the write transaction, delete-and-reinsert per touched chunk — declared ref keys (per element for `list`/`set`) and mentions scanned from prose and fenced expression blocks. Wipe it and it re-derives from current bodies. It is per-branch current state only; historical bodies remain in the version log, re-derivable if temporal link queries are ever wanted.

### Indexes

```sql
CREATE INDEX idx_current_placements_on
  ON current_placements(on_id, branch, kind);
CREATE INDEX idx_current_placements_chunk
  ON current_placements(chunk_id, branch, kind);

-- who points here
CREATE INDEX idx_current_refs_target
  ON current_refs(target, branch);
-- delete-and-reinsert
CREATE INDEX idx_current_refs_source
  ON current_refs(source_id, branch);

CREATE INDEX idx_chunk_versions_chunk
  ON chunk_versions(chunk_id, commit_id);
CREATE INDEX idx_chunk_versions_commit
  ON chunk_versions(commit_id);
CREATE INDEX idx_placement_versions_chunk
  ON placement_versions(chunk_id, on_id, commit_id);
CREATE INDEX idx_placement_versions_commit
  ON placement_versions(commit_id);
CREATE INDEX idx_commits_parent
  ON commits(parent_id);
```

Three of these carry new weight:

- `idx_current_placements_chunk` gains `kind`. The ordered-place probe and every `Up` closure step filter by kind from the chunk side; without it both degrade to a scan of that chunk's placements.
- `idx_chunk_versions_commit` and `idx_placement_versions_commit` are what make a **commit a dimension**. `read([db/commits, chunk_id])` is served by the `chunk_id`-leading index; the reverse — `[commit_c]` as a place, yielding what that commit touched — reads by `commit_id`, which nothing indexed before. Commit-as-dimension is a one-gesture review grant (substrate.md, *Commits*), so the reverse direction is a first-class path, not an occasional query.

### FTS hookup

Triggers on `current_chunks` keep the FTS index synchronized within the commit transaction:

```sql
CREATE TRIGGER current_chunks_ai AFTER INSERT ON current_chunks BEGIN
  INSERT INTO chunk_fts(rowid, name, body)
    VALUES (new.rowid, new.name, new.body);
END;

CREATE TRIGGER current_chunks_ad AFTER DELETE ON current_chunks BEGIN
  INSERT INTO chunk_fts(chunk_fts, rowid, name, body)
    VALUES ('delete', old.rowid, old.name, old.body);
END;

CREATE TRIGGER current_chunks_au AFTER UPDATE ON current_chunks BEGIN
  INSERT INTO chunk_fts(chunk_fts, rowid, name, body)
    VALUES ('delete', old.rowid, old.name, old.body);
  INSERT INTO chunk_fts(rowid, name, body)
    VALUES (new.rowid, new.name, new.body);
END;
```

The FTS index covers all branches' current state; branch filtering is a JOIN at query time. **It is not boundary-scoped and cannot be** — one index serves every reader, so the boundary applies to the FTS result, not inside it: the match subquery is intersected with the admitted set in the same statement (*Query patterns*). A whole-field search therefore costs one FTS scan plus one semijoin, and returns only what the reader may see — counts included, since the same predicate feeds them.

**Tokenization.** `body` is stored and indexed as JSON text. The `unicode61` tokenizer splits on word boundaries — punctuation including `{`, `}`, `"`, `:`, `,` is treated as separators — so a query like `match_: "world"` matches `body = {"greeting": "hello world"}`. The flip side: tokens from JSON keys are not distinguished from values, so `match_: "greeting"` would also match. The pilot accepts this as a "search over chunk text content" semantic, not a structured query — programs that need keyed search compose reads from places and dimensions, not FTS.

### The commit algorithm

```
commit(declaration, opts):

  reject if any chunk in the declaration targets a virtual chunk
    (db/branches, db/commits, branch archetype, commit archetype)
    → WriteToVirtualChunk

  BEGIN IMMEDIATE TRANSACTION

  let commit_id = generate_commit_id()
  let parent    = head_of(opts.branch)
  let timestamp = now_utc()

  INSERT INTO commits (id, parent_id, timestamp, message, process_id)
  VALUES (commit_id, parent, timestamp, declaration.message, opts.process_id)

  for each chunk in declaration.chunks:
    resolve id (declared or generated)
    INSERT INTO chunk_versions
      (chunk_id, commit_id, name, instance, seq, body, removed)
    apply current-state transition for opts.branch

  for each placement (chunk-bound and bare):
    INSERT INTO placement_versions
      (chunk_id, on_id, commit_id, kind, seq, active)
    apply current-state transition for opts.branch (seq auto-assign here)

  validate in Rust against post-write current state on this branch:
    for each chunk touched, union the instance contracts of its archetypes
    and check the body against every obligation; validate ref targets;
    check name-within-owner, name-required-if-it-has-members, single-owner,
    and the two seq rules

  govern against opts.read / opts.write:
    every created owned/relates placement — write over on_id,
      read over chunk_id
    every removed owned/relates placement — write over on_id
    every filed link — read over target

  refile current_refs for each touched chunk (delete-and-reinsert);
  collect links_modified

  any failure => ROLLBACK and return

  UPDATE branches SET head = commit_id WHERE name = opts.branch
  COMMIT
  (after tx.commit() returns Ok, push Commit to broadcast channel)

  return Commit
```

Validation and governance are in Rust. SQL stores; Rust enforces. Validating in SQL would lock the key-map rules into SQL; Rust gives clearer code and easier evolution. Both read against the open transaction's post-write state (see *Atomicity*), not a pre-fetched snapshot — and the governance semijoins compile through the same plan builder the read path uses, so there is one boundary evaluator in the crate, not two.

### Current-state transitions

For each `chunk_versions` row at branch B:

| chunk_versions row | current_chunks rule (branch B) |
|---|---|
| `removed = 0` | UPSERT row with new (name, instance, seq, body) |
| `removed = 1` | DELETE current_chunks row; DELETE all current_placements rows where chunk is the chunk OR the place (branch B only) |

For each `placement_versions` row at branch B:

| placement_versions row | current_placements rule (branch B) |
|---|---|
| `active = 1` | UPSERT row with (kind, seq); auto-assign seq when the place is ordered and seq omitted (see below) |
| `active = 0` | DELETE row for (chunk_id, on_id, branch B) |

Removal is per-branch.

**Is this place ordered? — a join, not a flag.** Nothing on a place says it is ordered. What says so is the archetype it is an instance of: the place is ordered iff it carries an `instance` placement onto some chunk whose `seq = 1` (substrate.md, *Ordered places*). Multi-typing means several archetypes may apply; any one of them carrying the flag is enough.

```sql
-- one statement: the seq to write, or NULL when the place is not ordered
SELECT CASE WHEN EXISTS (
         SELECT 1
         FROM current_placements ip
         JOIN current_chunks arch
           ON arch.chunk_id = ip.on_id AND arch.branch = ip.branch
         WHERE ip.chunk_id = :on_id
           AND ip.branch   = :branch
           AND ip.kind     = 'instance'
           AND arch.seq    = 1)
       THEN (SELECT COALESCE(MAX(cp.seq), 0) + 1
             FROM current_placements cp
             WHERE cp.on_id = :on_id AND cp.branch = :branch)
       END;
```

The probe reads `idx_current_placements_chunk` (chunk_id, branch, kind) then the `current_chunks` primary key; the max reads `idx_current_placements_on`. Both are point lookups, and the probe's answer is memoized per `(on_id, branch)` for the length of one declaration.

**Seq auto-assignment.** When the place is ordered and `seq` is omitted, the assignment is `max(seq) + 1` over `current_placements` for that `(on_id, branch)`, evaluated as each placement is applied (not in batch). Within a single declaration that places multiple chunks on the same ordered place without seq, the assignments run sequentially: the second sees the first's just-applied row, gets `max + 2`, etc. Across concurrent commits, `BEGIN IMMEDIATE` serializes writes, so one commit's auto-assigned seqs are visible to the next before its `max` lookup runs. An explicit seq is written as given and validated: onto an unordered place it is `SeqOnUnordered`.

*Open — the flag is late-bindable and nothing says what that means.* An archetype may gain `seq: true` after its instances already hold placements; those rows keep `seq = NULL` and only new placements are assigned. Backfill, refusal, and living-with-nulls are all defensible; the law rules none of them. Physically the tail-first window sorts NULL seq before every assigned position.

### Query patterns

Every read compiles to one statement. The boundary is the first CTE; everything else semijoins against it.

#### The admitted set

```sql
WITH RECURSIVE
admitted(id) AS ( <the lowered boundary plan> ),
...
```

Omitted entirely when `opts.boundary` is `None`, in which case every `IN (SELECT id FROM admitted)` below drops out of the compiled SQL — an unfiltered read is the same statement minus one predicate, not a second code path. `WITH RECURSIVE` is present whenever the plan contains a `Closure`.

Plan nodes lower as:

| node | SQL |
|---|---|
| `All` | `SELECT chunk_id FROM current_chunks WHERE branch = :branch` |
| `Chunks(ids)` | `SELECT value FROM json_each(:ids)` |
| `Place(ids)` | the intersection subquery below |
| `Union` · `Intersect` · `Minus` | `UNION` · `INTERSECT` · `EXCEPT` |
| `Filter{Key/Has}` | `… WHERE json_extract(body, '$.k') <op> :v` / `json_each` membership |
| `Filter{Fts}` | `… AND rowid IN (SELECT rowid FROM chunk_fts WHERE chunk_fts MATCH :q)` |
| `Closure` | the recursive CTE below |
| `Commits` · `Touched` | the projections below |

#### Intersection (the chunks)

Membership is a subquery over `current_placements` with no kind filter — all three stored kinds place a chunk at the intersection:

```sql
SELECT cc.*
FROM current_chunks cc
WHERE cc.branch = :branch
  AND cc.chunk_id IN (SELECT id FROM admitted)
  AND cc.chunk_id IN (
    SELECT cp.chunk_id FROM current_placements cp
    WHERE cp.branch = :branch AND cp.on_id IN (:place_ids)
      AND cp.chunk_id IN (SELECT id FROM admitted)
    GROUP BY cp.chunk_id
    HAVING COUNT(DISTINCT cp.on_id) = :n_places);
```

The same shape with `AND cp.kind = :kind` inside the subquery gives the per-kind counts, and the same admitted predicate rides them — which is what makes **counts describe what the boundary admits**. `total` is `SELECT COUNT(*) FROM current_chunks WHERE branch = :branch AND chunk_id IN (SELECT id FROM admitted)`.

The `linked` answer is a separate indexed lookup, one per named root, unioned — filtered on the **source** side, since a link you may see is one whose author you may read:

```sql
SELECT source_id, target, kind, key
FROM current_refs
WHERE branch = :branch AND target IN (:place_ids)
  AND source_id IN (SELECT id FROM admitted);
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

**Empty read.** When `places` is empty, `in_place` is "every admitted chunk on this branch" — the placement join is dropped, the boundary predicate is not:

```sql
SELECT cc.*
FROM current_chunks cc
WHERE cc.branch = :branch
  AND cc.chunk_id IN (SELECT id FROM admitted)
LIMIT :limit OFFSET :offset;
```

With `match_` added, intersect against FTS as above but again without the membership subquery. This is the whole-field search path (engine.md, `read` with `match_` and no places), boundary-filtered by the same predicate as everything else.

**Ordered window.** For a single ordered place, the chunk fetch joins that place's placement and pages from the tail — `ORDER BY ord.seq DESC` with `LIMIT/OFFSET`, the returned rows reversed in Rust so the window reads ascending. Every other fetch orders by `cc.chunk_id`. Pagination is position-based on the ordered result set, not seq-value-based: `LIMIT 10 OFFSET 20` returns the chunks at positions 21–30 counted back from the latest, regardless of how sparse seq values are. Positions count admitted rows only.

#### Dimensions

For each place the intersection chunks are placed on, with counts split by kind:

```sql
WITH in_place AS (
  SELECT cp.chunk_id
  FROM current_placements cp
  WHERE cp.branch = :branch
    AND cp.on_id IN (:place_ids)
    AND cp.chunk_id IN (SELECT id FROM admitted)
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
  AND cp.on_id IN (SELECT id FROM admitted)
GROUP BY cp.on_id
ORDER BY total DESC;
```

Two admitted predicates, two jobs: the one in `in_place` makes the counts describe admitted members; the one in the outer WHERE makes an unreadable dimension vanish from adjacency rather than appear with a count. The second is the v0.1 pin on substrate's open (*Result*, above).

(Dimensions include the places in the input — they qualify trivially. The consumer filters them out only if they want the "what to add" view excluding the input.)

When `places` is empty, the `in_place` CTE collapses to "every admitted chunk on this branch" — every dim the boundary admits appears in `dimensions`, sorted by count. Edges become empty in this case: with empty input, every dim is already adjacent, so there is nothing "beyond."

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
JOIN current_placements cm2
  ON cm1.chunk_id = cm2.chunk_id AND cm2.branch = cm1.branch
WHERE cm1.branch = :branch
  AND cm1.on_id IN (:dimension_ids)        -- adjacent dims from previous query
  AND cm2.on_id NOT IN (:place_ids)
  AND cm2.on_id NOT IN (:dimension_ids)
  AND cm1.on_id != cm2.on_id
  AND cm1.chunk_id IN (SELECT id FROM admitted)   -- the bridging chunk
  AND cm2.on_id    IN (SELECT id FROM admitted)   -- the edge dim itself
GROUP BY cm1.on_id, cm2.on_id
ORDER BY total DESC;
```

Edges are the sharpest case for uniform filtering: without the first predicate a chunk the reader cannot see would still testify that two dimensions are connected — adjacency leaking through a body nobody may read.

#### Transitive closure

`Plan::Closure` lowers to one recursive CTE. `Down` walks from a place to what is placed on it (and from a chunk to what points at it); `Up` walks the other way.

```sql
WITH RECURSIVE reach(id, depth) AS (
  SELECT id, 0 FROM ( <seeds> )
  UNION                                   -- set semantics, not UNION ALL
  SELECT cp.chunk_id, reach.depth + 1
  FROM current_placements cp
  JOIN reach ON cp.on_id = reach.id
  WHERE cp.branch = :branch
    AND cp.kind IN (:kinds)
    AND (:max_depth IS NULL OR reach.depth < :max_depth)
)
SELECT id FROM reach;
```

`Up` swaps the join and the projection (`JOIN reach ON cp.chunk_id = reach.id`, selecting `cp.on_id`). When `Edges.links` is non-empty a second recursive term over `current_refs` unions in beside the placement term — same shape, `target` / `source_id` in place of `on_id` / `chunk_id`.

**`UNION`, not `UNION ALL`, is load-bearing.** The placement graph has cycles by construction — nothing forbids a chunk related onto something related back — and only SQLite's dedupe on the recursive term guarantees termination. `depth` is carried for the bound and is the *first* depth at which a node was reached, not a unique one.

`follow` over `owned` stops at store edges because ownership never crosses stores, and the federated union is the engine's (engine.md); one db's closure never leaves its own tables.

#### Virtual chunks (branches and commits)

When `read` is called with `db/branches` or `db/commits` — or a `Plan::Place` names them — the read layer projects from the underlying tables instead of joining current_chunks:

```sql
-- branches projection
SELECT name AS chunk_id, name, '{}' AS instance, 0 AS seq,
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
SELECT c.id AS chunk_id, NULL AS name, '{}' AS instance, 0 AS seq,
       json_object(
         'timestamp',   c.timestamp,
         'message',     c.message,
         'process_id',  c.process_id
       ) AS body,
       a.depth AS seq_pos
FROM commits c JOIN ancestry a ON c.id = a.id
ORDER BY seq_pos;
```

The projected `seq` column is the archetype flag and is `0`: a projected archetype has nowhere to carry `seq: true` (the open above). `seq_pos` is the placement-grade position the read layer reports, synthesized from ancestry depth — which is how a projection-backed place reads as ordered with nothing declaring it.

The virtual-place projections accept these parameter shapes:

- `[db/commits]` — every commit
- `[db/commits, branch_id]` — commits in that branch's ancestry
- `[db/commits, process_id]` — commits from that process
- `[db/commits, chunk_id]` — commits that modified that chunk
- `[db/branches]` — every branch
- `[db/branches, branch_id]` — that single branch
- `[commit_id]` — **a single commit as a dimension**: the chunks that commit touched

Shapes the projections don't recognize (additional parameters, places not in the table above) just return what falls out of the join — typically nothing matches. An unrecognized shape is an empty result, not an error.

The last shape is `Plan::Touched`, and it is what makes a commit grantable as a place:

```sql
SELECT chunk_id FROM chunk_versions      WHERE commit_id IN (:commit_ids)
UNION
SELECT chunk_id FROM placement_versions  WHERE commit_id IN (:commit_ids)
UNION
SELECT on_id    FROM placement_versions  WHERE commit_id IN (:commit_ids);
```

Both scans are by `commit_id` — the two indexes added for exactly this. Note what is absent: `links_modified` has no version table, so a commit's touched set is chunks and placements, never the link delta.

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
),
placement_state AS (
  SELECT pv.*,
         ROW_NUMBER() OVER (
           PARTITION BY pv.chunk_id, pv.on_id
           ORDER BY (SELECT depth FROM ancestry WHERE id = pv.commit_id) ASC
         ) AS rn
  FROM placement_versions pv
  WHERE pv.commit_id IN (SELECT id FROM ancestry)
)
SELECT * FROM chunk_state WHERE rn = 1 AND removed = 0;
```

Under `at`, every `current_chunks` / `current_placements` reference in the compiled statement is substituted for `chunk_state` / `placement_state` — **except the `admitted` CTE, which always reads current state.** That single exception is the physical form of the law: membership is always current, including under `at` (substrate.md, *Boundaries*). It also means a temporal read costs one current-state boundary evaluation plus one ancestry replay, never two replays.

(Sketch — exact query refines under benchmark.)

### Memoized plans, and what the boundary costs

The planner memoizes pure chains on `(normalized expression, boundary, commit)` (engine.md, *The planner partition*). The db's obligations toward that key are two, and the second is the third price of uniform filtering.

**Canonical rendering.** A lowered `Plan` serializes deterministically — children of `Union` and `Intersect` sorted, singleton set-ops collapsed, `Chunks` id lists sorted and deduped. That gives the key's boundary component without re-parsing the surface expression. Expression normalization proper is open (substrate.md, *What's Open*) and sits upstream of this: db canonicalizes what it is handed; it does not decide when two descriptions are the same place.

**The fragmentation, priced.** Before uniform filtering the key was `(expression, commit)` and one entry served every reader. Now the memo is sized by *distinct live boundaries × hot expressions*: two processes with different boundaries share no entry even for an identical read, and since a boundary is constructed per run, the common case is a cache line per process rather than per query. The mitigations are structural, not clever — identical lowered plans render identically, so runs that end up with the same boundary do share; and boundary-independent sub-plans (the closure of a `Place` term, before any filter) may memoize on their own. Neither is built. What matters is that the cost is budgeted here rather than discovered under load.

### Reactivity wiring

The `Db` handle holds a `tokio::sync::broadcast::Sender<Commit>`. Each successful write op (`commit`, `create_branch`, `delete_branch`) pushes the resulting `Commit` onto the channel immediately after `tx.commit()` returns Ok. Subscribers (`subscribe`) hold receivers and filter on `placements_modified`/`chunks_modified`.

By the time the push runs, the SQL commit is durable and visible to any subsequent reader — atomic from any observer's perspective. Rolled-back transactions never reach the push, so subscribers see only durable commits.

The channel is bounded; on overflow the oldest event drops and a `Lagged` marker reaches the subscriber so they can re-read from a known commit if needed. The push itself is non-blocking — slow consumers do not block the writer.

The same `Commit` drives `boundaries_touching` (*The boundary invalidation index*): the engine's dispatcher takes one event and asks two questions of it — which subscriptions fan out, and which boundaries may have moved.

### Transaction discipline

All writes use `BEGIN IMMEDIATE` to acquire the SQLite write lock up front — no deadlock-by-upgrade. Reads use the default deferred mode and benefit from WAL's reader-doesn't-block-writer behavior. Open settings: `journal_mode = WAL`, `synchronous = NORMAL`.

---

## Concurrency

SQLite in WAL mode gives single-writer, many-reader. The db inherits this; nothing is invented on top.

**One writer at a time.** Concurrent `commit` calls serialize at the SQLite level. Default busy timeout is 5 seconds; on timeout the call fails and the caller decides whether to retry.

**Readers do not block writers; writers do not block readers.** A read started during a write reads from a snapshot taken at the read's start; the in-progress write is invisible until it commits.

**Per-call read consistency.** Each read runs in its own implicit transaction — consistent within one call, may shift between consecutive calls. The boundary CTE evaluates inside that same transaction, so a read is never filtered by a membership state its own results did not see.

**Cross-call read consistency.** Open. The engine's most demanding read pattern fits in a single multi-place `read` call; explicit snapshot handles may not be needed for the pilot.

**Reactivity does not block writes.** The change-stream channel is bounded and non-blocking on push; slow consumers drop the oldest with a `Lagged` marker.

---

## Code architecture

### Module layout

```
db/
  src/
    lib.rs             — public re-exports
    types.rs           — ChunkId, CommitId, ChunkItem, Instance, Commit,
                         Includes, ReadOpts, ReadResult, Dim, Edge,
                         Placement, Declaration, ChunkDeclaration,
                         PlacementSpec, GetOpts, CommitOpts, BranchName,
                         Branch, SubscribeOpts, Plan, Pred, Cmp, Edges,
                         KindSet, LinkSet, Dir, CommitTerm, BoundaryId
    errors.rs          — per-op error enums (OpenError, ReadError,
                         WriteError, ...) via thiserror
    schema.rs          — embedded DDL via include_str! +
                         rusqlite_migration list; latest_version()
                         derives this build's user_version
    schema.sql         — DDL: tables, indexes, FTS triggers
    id.rs              — ULID-shaped id generation (`ulid` crate)
    db.rs              — Db { conn: Mutex<Connection>,
                              sender: broadcast::Sender<Commit>,
                              boundaries: Mutex<BoundaryIndex>,
                              read_only: bool }
                         Db::open, Db::open_read_only, require_writable,
                         Drop
    plan.rs            — the Plan tree and its compilation: one builder
                         emitting the `admitted` CTE, the closure CTE and
                         the node lowerings; canonical rendering for memo
                         keys. Used by ops::read, ops::resolve, ops::commit
    boundaries.rs      — BoundaryIndex: register/unregister, named-leaf
                         walk, boundaries_touching(&Commit). In memory,
                         never a table
    validate.rs        — Rule enum + check_commit; instance-contract
                         obligations, ref-target checks, owner/name rules,
                         the seq rules; govern_commit: placement and link
                         governance semijoins
    refs.rs            — current_refs refile (delete-and-reinsert per
                         chunk); body scan for tagged refs + mentions;
                         link delta
    virtual_chunks.rs  — db/branches / db/commits projection +
                         commit-as-dimension (used by ops::read, ops::get,
                         plan.rs)
    bootstrap.rs       — initial seed on fresh open (main branch +
                         initial commit)
    ops/               — public surface; one module per Db method
      mod.rs           — re-exports
      get.rs           — Db::get
      commit.rs        — Db::commit; transitions inline
      resolve.rs       — Db::resolve, Db::admits — the plan doorway
      branches.rs      — Db::create_branch, Db::delete_branch
      subscribe.rs     — Db::subscribe (BroadcastStream + place filter)
      read/            — folded because of size: four distinct query paths
        mod.rs           — Db::read orchestrator; opts/result plumbing
        intersection.rs  — chunks query (with/without FTS, with/without
                           empty read, hydration)
        dimensions.rs    — dimensions CTE
        edges.rs         — edges-beyond-adjacency
        time_travel.rs   — `at: Some(commit)` ancestry walk
  tests/               — integration tests against the spec
  Cargo.toml
```

Each `ops/*.rs` owns its method end-to-end via `impl Db { pub fn ... }`. Rust spreads `impl Db` across files — that keeps `ops/` flat where it can be flat. `read/` is folded because the public method fans into four distinct query paths.

`plan.rs` is the one new structural piece, and it is deliberately not under `ops/`: it is a compiler, not a method, and three callers share it — `read`, `resolve`, and `commit`'s governance. One boundary evaluator in the crate is the invariant that makes uniform filtering checkable at all.

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

`git diff` between any two feature files reads as the same shape with different verbs. Coherence through pattern, not folder. `plan.rs` bends it in one direction only: its SQL is assembled rather than constant, because a plan is a tree — the fragments it assembles from are still `const`s at the top.

### Within-file shape

The pattern scales by decomposition. When a method outgrows top-to-bottom narrative, it splits into named private helpers in the same file; the public method becomes the orchestrator that reads the helpers in order. `ops/read/` is the folded form when one method fans into four distinct query paths; inside any single file, no function reads as a wall.

What's genuinely non-obvious here and earns a comment (per [`conventions.md`](../conventions.md#code)): the post-`tx.commit()` broadcast send is a deliberate ordering (the SQL commit must be durable before subscribers can see the change); `check_commit` reads through the open transaction's view, not a pre-fetched snapshot; the `admitted` CTE is *not* substituted under `at` while every other table reference is; the closure CTE's `UNION` is what terminates on cycles; the `meta` table check guards against re-seeding on bootstrap.

### Key mechanics

**Connection ownership.** `Db { conn: Mutex<Connection>, sender: broadcast::Sender<Commit>, boundaries: Mutex<BoundaryIndex> }`. Every op locks before touching the connection. SQLite is single-writer anyway; the mutex is uncontested in practice and gives `Db: Send + Sync` for free. Subscribers hold their own `broadcast::Receiver`; they do not retain `&Db`. The boundary index takes its own mutex, held only for insert/remove/lookup.

**Transactions.** No custom RAII helper. `conn.transaction_with_behavior(TransactionBehavior::Immediate)?` returns rusqlite's `Transaction` — Drop = ROLLBACK; explicit `tx.commit()` advances. Used directly inside `ops::commit` and `ops::branches`.

**Reactivity push.** Three call sites push the resulting `Commit` onto `db.sender` — `ops::commit`, `ops::branches::create_branch`, `ops::branches::delete_branch` — two lines each, repetition over a wrapper. The post-`tx.commit()` ordering and its durability guarantee are spec'd above under *Reactivity wiring*.

**Validation.** `Rule` enum with one variant per rule (`Keys`, `RefTargets`, `Unique`, `Seq`, `NameUnique`, `NameRequired`, `SingleOwner`); `match` dispatches inside `check_commit(conn, branch, touched)`. Governance is a separate pass — `govern_commit(conn, branch, touched, read, write)` — because it takes the boundaries and the others do not. Adding a rule = adding a variant. Reads run through the open transaction (see *Atomicity*).

**Errors.** `thiserror`. Per-op enums (`OpenError`, `ReadError`, `WriteError`) with shared variants (e.g. `IoError(rusqlite::Error)`) duplicated across them — dumb-but-clear over a single mega-enum.

**IDs as newtypes.** `ChunkId(String)`, `CommitId(String)`, `BranchName(String)` with `From<&str>` and `Display`.

**Sync surface, async reactivity.** `read`, `get`, `resolve`, `admits`, `commit`, `create_branch`, `delete_branch` are sync (SQLite is sync). `subscribe` returns a `Stream` — async, the natural shape for change feeds (via `tokio_stream::wrappers::BroadcastStream`).

### Settled choices

- **`rusqlite_migration`** with the full schema as the v1 migration.
- **Schema version = `user_version`.** The migration list owns SQLite's `user_version` pragma; that number is the db's schema version. The version this build writes is derived by running the list against an in-memory db (`schema::latest_version()`) — no constant duplicating the DDL. `open_read_only` compares a peer's file against it and refuses skew; the host refuses the same mismatch a step earlier, at cascade-walk time ([`chassis.md`](chassis.md#boot-sequence) steps 3–4).
- **JSON for body and instance.** Body is `serde_json::Value`, carrying the tagged value encoding for typed keys (`$ref`, `$loc`, `$set`, `$time`, `$md` — sdk.md owns translation; the db validates tags against instance contracts). The `instance` column holds the flat key-map and nothing else.
- **The plan interface is engine-internal.** `Plan` is public on the crate so the engine can build one; it never crosses the program protocol, and no expression text reaches the db. Programs get `read` and `resolve` through the engine, which is the only party that lowers.
- **Hot keys escalate with expression indexes.** A typed key a query proves hot gets a SQLite expression index on `json_extract(body, '$.key')` — per key, promotion-when-proven, never a storage rewrite. `Pred::Key` is what makes this reachable from a plan.
- **Bootstrap idempotence.** A `meta` table with a single bootstrap-version row; `open()` checks before seeding.

---

## What is open

- ~~`follow`'s parameterization~~ — landed in [`engine.md`](engine.md) (*Hops and `follow`*); `Plan::Closure` receives it as drawn. The closure's edge-reporting joins the plan interface at the SDK build.
- **The invalidation index under-covers transitive boundaries** — a `Closure` boundary registers its seeds only (*The boundary invalidation index*). Three candidates carried from engine.md; a build-time question.
- **What an unreadable dimension looks like from outside** — vanish or opaque count (substrate.md). v0.1 vanishes, by the same semijoin as everything else.
- **Who materializes the law's always-on boundary terms** — the frame and the free instance→archetype hop (*The plan interface*). db evaluates what it is handed; nothing says who assembles them.
- **Late-bound `seq: true`** — an archetype gaining the flag does not backfill positions onto placements that already exist (*Current-state transitions*).
- **`seq: true` on projected archetypes** — `db/commits` reads as ordered and has nowhere to store the flag; the projection synthesizes a position instead.
- **Read over a mention's target when the target is a place-description**, not a chunk id — no single row to semijoin; rides with expression normalization.
- **Read over the placed chunk at birth** — the check runs against post-write state, where the newborn exists; substrate.md states both rules and reconciles neither.
- **Cross-call read snapshots** — explicit handles for multi-read consistency.
- **Branch-meta commits** — whether `create_branch`/`delete_branch` should write commits on a meta-branch for uniform traceability.
- **FTS branch-scoping** — currently FTS holds all branches; branch filter at query time.
- **Bootstrap IDs** — resolved at the substrate level (lookup-by-name); carries through. Ownership paths (`engine/program`) make path-lookup the natural convention: resolve each segment as a name among the previous chunk's owned children.
- **Eager vs lazy link re-derivation on spec edits** — editing an archetype's instance contract invalidates the derived rows of every instance; eager fan-out vs knowingly-stale-until-next-write is the sharpest open engineering decision (substrate.md, *What's Open*).
- **Time-travel query optimization** — recursive ancestry walk is correct but unmeasured. The boundary CTE's exemption from temporal substitution makes a temporal read cheaper than it looks; unmeasured all the same.
- **Divergence from built code, tracked**: the implemented crate still validates the retired spec language (`accepts`/`required`/`propagate`), has a two-kind placement CHECK, `spec`/`scope_id`/`type` column names, no `current_refs`, no chunk-level `seq` column (so the ordered-place test is still a flag read, not the join), no plan interface and no boundary evaluation at all. Spec leads; the alignment pass follows (board).
