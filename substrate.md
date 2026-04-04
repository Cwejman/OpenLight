# Substrate Specification

The structural foundation for knowledge, computation, and navigation. Any reader — human, agent, browser, shell, website — navigates the same structure.

## One Primitive: Chunk

A chunk is a unit of meaning with identity.

```
chunk {
  id:   globally unique, system-generated
  name: optional, unique within parent scope
  spec: structural contract (system-enforced)
  body:   everything else — text, properties, data (reader-interpreted)
}
```

Two fields, cleanly separated by who reads them:

**Spec** is for the system. A structural contract enforced on writes. When a chunk is placed on this chunk as instance, the system validates conformance. Non-conforming writes are rejected.

**Body** is for the reader. A JSON object. All content lives here — readable text (`body.text`), structured properties, any data. The system does not distinguish "readable content" from "structured fields." That distinction is a reader concern. FTS indexes all string values in body.

A chunk can serve as:
- **Content** — carrying meaning in body, placed on identity chunks
- **Identity / Entity** — a named chunk that other chunks are placed on
- **Archetype** — a chunk whose spec defines a type contract for instances
- **Connection** — a chunk placed on multiple identity chunks, bridging them

These roles are not declared. They emerge from how the chunk is placed and referenced.

## One Mechanism: Placement

A placement puts a chunk into a scope (another chunk).

```
placement {
  chunk_id: the chunk being placed
  scope_id: the chunk it's placed on
  type:     'instance' or 'relates'
  seq:      optional integer — position in an ordered sequence
}
```

**Instance** means the chunk IS a member of the scope. "This prompt IS an event in this session."

**Relates** means the chunk is ABOUT the scope. "This note is about Alan Turing but isn't a defining part of him."

**Seq** is the ordering mechanism. Position is relative to the scope — the same chunk can be item 1 in one scope and item 43 in another. When a scope's spec says `ordered: true`, all instance placements must have a seq value.

### What placement creates

**Identity.** A chunk with other chunks placed on it IS a scope. No declaration needed — it emerges from the placement graph.

**Hierarchy.** A chunk placed on nothing is root-level. A chunk placed on another is nested within it. The hierarchy is structural (organizational), not protective. Anything can reference anything regardless of nesting. Peers enforce boundaries, hierarchy structures.

**Connections.** A chunk placed on multiple identity chunks bridges them. The chunk at the intersection of `turing` and `cambridge` IS the relationship between Turing and Cambridge. The meaning of the connection is in the chunk's body. No separate link/edge primitive needed.

**Consolidation principle.** If content doesn't create a new intersection of scopes, it belongs on the identity chunk itself (in its body), not as a separate chunk. Separate chunks exist when they bridge multiple identities.

### Name resolution

Names are unique within their parent scope, like files in a directory. The system references by ID internally. Names are human-readable labels resolved contextually:

- Scoped to `{session}`: `prompt` resolves to the session's prompt concept
- Scoped to `{email}`: `prompt` resolves to the email's prompt concept
- When ambiguous, the view disambiguates: `session/prompt` vs `email/prompt`

Since the system uses IDs, renaming is trivial — nothing structural depends on the name.

## Spec Language

A chunk's spec defines the structural contract for its instances. The system enforces this on writes.

```json
{
  "ordered":  true,                    // instances must have seq on placement
  "accepts":  ["prompt", "answer"],    // instances must be instance of one of these
                                       // (names resolved within this chunk's scope)
  "required": ["tool", "exit"],        // instances must have these body keys
  "unique":   ["name"]                 // these body keys must be unique across instances
}
```

**`ordered`** — when true, every instance placement on this scope must have a seq value. The system rejects placements without seq.

**`accepts`** — instance chunks must themselves be instance of one of the listed types. Names are resolved within the scope — `prompt` means the `prompt` chunk placed on this scope, not a global `prompt`.

**`required`** — instance chunks must have these keys present in their body.

**`unique`** — these body keys must have values that are unique across all instances of this scope.

### Archetypes

An archetype is a chunk whose spec defines a type contract. There is no "archetype" flag — a chunk with a non-empty spec is an archetype by nature.

Archetypes enable typed interfaces. The shell can require "I need an instance of session" — meaning a chunk placed on the `session` archetype, conforming to its spec.

### Example: Session archetype

```
chunk: session
  name: "session"
  spec: { ordered: true, accepts: ["prompt", "answer", "tool-call", "knowledge-update"] }
  body: { text: "A sequence of agent interaction events" }

chunk: prompt (placed on session, instance)
  name: "prompt"
  body: { text: "A user message to an agent" }

chunk: answer (placed on session, instance)
  name: "answer"
  body: { text: "An agent response" }

chunk: tool-call (placed on session, instance)
  name: "tool-call"
  spec: { required: ["tool"] }
  body: { text: "An agent invoking a tool" }

chunk: knowledge-update (placed on session, instance)
  name: "knowledge-update"
  spec: { required: ["commit"] }
  body: { text: "A mutation produced by a session" }
```

An actual session instance:

```
chunk: my-session (placed on session, instance)
  name: "my-session"
  body: { text: "Debugging the scope algorithm", started: "2026-04-04T10:00Z", agent: "claude" }

chunk: (placed on my-session, instance, seq: 1; placed on prompt, instance)
  body: { text: "Why is the scope query returning duplicates?" }

chunk: (placed on my-session, instance, seq: 2; placed on tool-call, instance)
  body: { text: "grep -n 'active' src/commands/scope.zig", tool: "grep", exit: 0 }

chunk: (placed on my-session, instance, seq: 3; placed on knowledge-update, instance)
  body: { text: "Fixed scope query to filter by active=1", commit: "c_abc123" }
```

## History

Unchanged from the current design. Proven and solid.

### Commits

Every mutation is a commit. A commit is atomic — all changes succeed or all fail.

```
commit {
  id:        unique identifier
  parent_id: previous commit (NULL for root, forms a DAG)
  timestamp: when committed
  message:   optional description
}
```

Commits record changes to chunks and placements. The current state is resolved by walking from branch HEAD to root, taking the latest version of each chunk and placement in that ancestry.

### Branches

A branch is a movable pointer to a commit.

```
branch {
  name: unique identifier
  head: commit id
}
```

Branches fork (new pointer from any commit) and merge (commit with two parents, conflict resolution is explicit). The active branch is client state — stored in `.openlight/config.json`, not in the database.

### Lossless

Nothing is destroyed. Chunk removal sets `removed: true`. Placement removal sets `active: false`. Both are preserved in history. Any past state is reconstructable.

## Queries / Scoping

### Scope

The primary read operation. Declarative, pure, deterministic. Same query + same data = same result.

Select scopes. Get everything at the intersection. Add a scope to narrow. Remove to widen.

With the current `ol scope` model adapted: scoping a set of chunks (identity chunks / scopes) returns all chunks placed on ALL of them. Connected scopes are computed from shared placements.

### Traversal

Follow connections. From an identity chunk, find chunks placed on it. Those chunks may also be placed on other identity chunks — those are the connections. Navigate by reading the connecting chunks.

Traversal and scoping work together: scope to narrow the space, then explore connections within it.

### Full-text search

A native substrate feature, not external. Entry point into the structure when you don't know the scope vocabulary. SQLite FTS5 over chunk name and body string values. Find chunks by keyword, discover their scopes, then navigate structurally.

The FTS index is maintained by the substrate and updated on each commit.

### Cached summaries

A native substrate feature. AI-generated summaries for scopes, stored in the database, keyed to `(scope, commit_id, model)`. The commit model gives perfect invalidation — if HEAD has moved past the cached commit, the summary is stale and must be regenerated.

Every reader needs summaries — agents for context, the browser for navigation, the shell for `sum`. This is too universal to be a reader concern. The substrate stores them; the reader requests them; the commit model guarantees correctness.

### Semantic query (open)

Vector similarity over chunk body content — find things by meaning, not just keywords. This would be a cache layer alongside FTS: embeddings computed and stored, queryable as an alternative entry point. Requires a model, is non-deterministic. Whether this belongs in the substrate or remains a reader concern is not yet decided. The substrate should not prevent it.

### Temporal scoping

Reconstruct state at any commit. `--at <commit-id>` resolves all chunks and placements as of that point in history.

### Negation

Everything in scope A except what's also in scope B. Set difference over placements.

## Ingestion

The substrate accepts any content. A chunk's body is a JSON object of any size — a full document, a dataset, an API response. The structural tools (placement, scopes, archetypes, FTS) make it possible for an agent to break content down into the substrate's structure and integrate it. The substrate stores the result; the agent provides the intelligence.

## Integration

External content is referenced, not stored. A chunk with body fields containing resolution parameters (repo, path, endpoint, etc.) points outside the system. An integration contract chunk (itself an archetype) defines how to resolve references of that type.

The database stores the reference. The agent or shell resolves it. Staleness detection is a reader concern — the database knows when the reference was established (commit), not whether the external world has changed.

## Schema

```sql
CREATE TABLE commits (
    id        TEXT PRIMARY KEY,
    parent_id TEXT,
    timestamp TEXT NOT NULL,
    message   TEXT
);

CREATE TABLE branches (
    name TEXT PRIMARY KEY,
    head TEXT NOT NULL
);

CREATE TABLE chunk_versions (
    chunk_id  TEXT NOT NULL,
    commit_id TEXT NOT NULL REFERENCES commits(id),
    name      TEXT,
    spec      TEXT DEFAULT '{}',
    body      TEXT DEFAULT '{}',
    removed   INTEGER DEFAULT 0,
    PRIMARY KEY (chunk_id, commit_id)
);

CREATE TABLE placement_versions (
    chunk_id  TEXT NOT NULL,
    scope_id  TEXT NOT NULL,
    type      TEXT NOT NULL CHECK (type IN ('instance', 'relates')),
    seq       INTEGER,
    active    INTEGER DEFAULT 1,
    commit_id TEXT NOT NULL REFERENCES commits(id),
    PRIMARY KEY (chunk_id, scope_id, commit_id)
);

CREATE INDEX idx_pv_scope ON placement_versions(scope_id, type);
CREATE INDEX idx_pv_chunk ON placement_versions(chunk_id);
CREATE INDEX idx_cv_chunk ON chunk_versions(chunk_id, commit_id);

-- Full-text search (native)
CREATE VIRTUAL TABLE chunk_fts USING fts5(name, body, content='chunk_versions', content_rowid='rowid');

-- Cached summaries (native)
CREATE TABLE summary_cache (
    scope_id  TEXT NOT NULL,
    commit_id TEXT NOT NULL,
    model     TEXT NOT NULL,
    summary   TEXT NOT NULL,
    PRIMARY KEY (scope_id, commit_id, model)
);
```

### Current-state tables (performance)

Reading current state must not degrade with commit count. Materialized current-state tables are updated on each commit and used for all reads. The version tables remain the source of truth for history and time travel.

```sql
CREATE TABLE current_chunks (
    chunk_id  TEXT NOT NULL,
    branch    TEXT NOT NULL,
    name      TEXT,
    spec      TEXT DEFAULT '{}',
    body      TEXT DEFAULT '{}',
    PRIMARY KEY (chunk_id, branch)
);

CREATE TABLE current_placements (
    chunk_id  TEXT NOT NULL,
    scope_id  TEXT NOT NULL,
    branch    TEXT NOT NULL,
    type      TEXT NOT NULL,
    seq       INTEGER,
    PRIMARY KEY (chunk_id, scope_id, branch)
);
```

On each commit: apply the commit's mutations to the current-state tables within the same transaction. Reads query current-state tables (O(1) per entity). Time travel (`--at <commit-id>`) falls back to ancestry walk over the version tables.

### State resolution (history / time travel)

For historical queries only:

1. Walk from the target commit to root, collecting the ancestry.
2. For each chunk: latest `chunk_versions` row in ancestry = state at that point.
3. For each placement: latest `placement_versions` row in ancestry = state at that point.
4. Filter: `removed=0` for chunks, `active=1` for placements.

## What This System Is

A substrate. Not a database for a specific application. Not a retrieval layer for AI. The structural foundation that knowledge, computation, file systems, and agent coordination sit on.

**The query is the portal.** The quality of the query determines the quality of the context determines the quality of the output. Queries are declarative, composable, pure.

**Meaning is reader-determined.** The structure tells the reader where to look. The reader discovers what it means. The system does not bake meaning in at write time.

**Shape is system-enforced.** Archetypes define structural contracts. The system rejects non-conforming instances. Meaning is for the reader. Shape is for the system.

**No imposed hierarchy.** Placement creates nesting, but nesting is organizational, not protective. Peers enforce boundaries.

**No embeddings in the structure.** Semantic search is a reader concern, implementable as a cache layer. The structure is transparent.

**Lossless.** Nothing is destroyed. Knowledge evolves through addition.

## What's Open

- **Spec language evolution.** The four fields (ordered, accepts, required, unique) cover the known cases. The vocabulary may grow through use.
- **Merge semantics.** The structure supports merge commits. Conflict resolution strategy is above the primitives.
- **Peer protocol.** Separate databases mounted read-only. The mounting mechanism is runtime, not structural.
- **Temporal validity.** Event time vs system time is expressible through body properties. Whether `valid_from`/`valid_to` deserve first-class status depends on use.
- **Views.** Saved scopes with display settings. Drift detection when knowledge changes under an approved view. Concept is clear; mechanics are unbuilt.
