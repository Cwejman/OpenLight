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
  "ordered":   true,                    // instances must have seq on placement
  "accepts":   ["prompt", "answer"],    // instances must be instance of one of these
                                        // (names resolved within this chunk's scope)
  "required":  ["tool", "exit"],        // instances must have these body keys
  "unique":    ["name"],                // these body keys must be unique across instances
  "propagate": true                     // spec propagates to instances' children (composition)
}
```

**`ordered`** — when true, every instance placement on this scope must have a seq value. Auto-assigned on append if omitted. Explicit seq for specific positioning.

**`accepts`** — instance chunks must themselves be instance of one of the listed types. Names are resolved within the scope — `prompt` means the `prompt` chunk placed on this scope, not a global `prompt`. A chunk must not be an instance of two types that both appear in the same scope's `accepts` list — the system rejects this on write to prevent type ambiguity.

**`required`** — instance chunks must have these keys present in their body.

**`unique`** — these body keys must have values that are unique across all instances of this scope.

**`propagate`** — when true, the spec is not enforced on direct placements on this chunk. Instead, it propagates to instances: anything placed on an instance of this archetype is checked against this spec. Multiple propagating archetypes compose by union — if a chunk is an instance of two archetypes that both have `propagate: true`, the effective contract on that chunk's children is the union of both specs. Each archetype's `accepts` names are resolved within that archetype's own scope.

The distinction: **`required` describes what instances ARE** (self-enforcement, no propagate). **`accepts` describes what instances CONTAIN** (content contract, propagate). `ordered` can be either — ordered direct members (no propagate, e.g. `context`) or ordered content on instances (propagate, e.g. `session`).

### Archetypes

An archetype is a chunk whose spec defines a type contract. There is no "archetype" flag — a chunk with a non-empty spec is an archetype by nature.

Archetypes enable typed interfaces. The shell can require "I need an instance of session" — meaning a chunk placed on the `session` archetype, conforming to its spec.

**Type definitions use `relates`.** Type-defining chunks (like `prompt` on `session`) are placed as `relates`, not `instance`. This keeps them out of ordered content (no seq required) while remaining resolvable for `accepts` name resolution. Content chunks use `instance` with dual placement — on the scope (with seq) and on the archetype (for type membership).

**Dual placement enforcement.** A chunk with dual placement (scope + type) needs its type-membership placement visible before its scope placement is enforced — otherwise the `accepts` check can't find the type membership. The substrate's two-pass write-then-validate (see [Mutations and validation](#mutations-and-validation)) makes this work.

### Mutations and validation

Mutations are atomic. A declaration — one or many chunks, with their placements — succeeds entirely or fails entirely. If any part of a declaration fails validation, none of it is recorded; a commit appears only when every write in the declaration passes. This atomicity is a property of the field itself, not of any storage layer beneath it. Whatever materialization holds the field delivers it.

#### Spec validation

The spec language defines what conformance means; the substrate enforces conformance at write time.

For a chunk being placed `instance` on a scope, the **effective contract** is the union of:

- The scope's own non-propagating spec, if any.
- The propagating spec of every archetype the scope is itself `instance` of (transitively). `accepts` names from each archetype are resolved within that archetype's own scope.

The chunk must satisfy the union:

- **`ordered`** — the placement carries a `seq`. Auto-assigned to `max(existing seq on scope) + 1` when omitted.
- **`accepts`** — the chunk is `instance` of at least one of the listed type chunks. A chunk that is `instance` of two of the listed types in the same union contract is rejected (type ambiguity).
- **`required`** — the chunk's body carries every listed key.
- **`unique`** — for each listed body key, the chunk's value is unique across all chunks placed `instance` on this scope.

Validation runs against the post-write state of the declaration: all placements declared together are recorded before any spec is checked. This lets a chunk and its dual placement (on a scope and on its type) appear in the same declaration without ordering failure.

#### Name uniqueness

Within a scope, the names of all chunks placed `instance` on it — when name is non-null — are unique. The same chunk may carry the same name across multiple scopes; two different chunks may not collide on a name within any single scope. Enforced at placement-write time.

### Example: Session archetype

```
chunk: session
  name: "session"
  spec: { propagate: true, ordered: true, accepts: ["prompt", "answer", "tool-call", "tool-result", "context"] }
  body: { text: "A sequence of agent interaction events" }

chunk: prompt (placed on session, relates)
  name: "prompt"
  body: { text: "A user message to an agent" }

chunk: answer (placed on session, relates)
  name: "answer"
  body: { text: "An agent response" }

chunk: tool-call (placed on session, relates)
  name: "tool-call"
  spec: { required: ["program"] }
  body: { text: "An agent invoking a tool" }

chunk: tool-result (placed on session, relates)
  name: "tool-result"
  spec: { required: ["program"] }
  body: { text: "The result of a tool invocation" }

chunk: context (placed on session, relates)
  name: "context"
  spec: { ordered: true }
  body: { text: "The knowledge context for a turn" }
```

An actual session instance:

```
chunk: my-session (placed on session, instance)
  name: "my-session"
  body: { text: "Debugging the scope algorithm", started: "2026-04-04T10:00Z", agent: "claude" }

chunk: (placed on my-session, instance, seq: 1; placed on prompt, instance)
  body: { text: "Why is the scope query returning duplicates?" }

chunk: (placed on my-session, instance, seq: 2; placed on tool-call, instance)
  body: { text: "grep -n 'active' src/commands/scope.zig", program: "filesystem" }

chunk: (placed on my-session, instance, seq: 3; placed on tool-result, instance)
  body: { text: "src/commands/scope.zig:42: if (active) ...", program: "filesystem" }

chunk: (placed on my-session, instance, seq: 4; placed on answer, instance)
  body: { text: "The scope query wasn't filtering by active=1. Fixed." }
```

## History

### Commits

Every successful declaration produces a commit.

```
commit {
  id:        unique identifier
  parent_id: previous commit (NULL for root, forms a DAG)
  timestamp: when committed
  message:   optional description
}
```

Commits record changes to chunks and placements. The current state on a branch is resolved by walking from that branch's HEAD to root, taking the latest version of each chunk and placement in the ancestry.

### Branches

A branch is a movable pointer to a commit.

```
branch {
  name: unique identifier
  head: commit id
}
```

The substrate is branch-aware: every read and every write specifies a branch. The substrate stores all branches and their HEADs. Which branch is "active" for a given consumer at a given moment is consumer-level state, not field state — the consumer chooses which branch to read or commit to.

Branches fork (a new pointer from any commit) and merge (a commit with two parents; conflict resolution is explicit, above the primitives).

### Lossless

Nothing is destroyed. Removal is logical: a removed chunk drops out of current-state reads, as do placements involving it (whether the chunk is the scope or the chunk being placed). The version history retains everything as it was — time-travel reads see the past state intact.

Removal is itself a mutation, recorded in a commit like any other write.

## Queries / Scoping

### Scope

The primary read operation. Declarative, pure, deterministic — same query against the same field state returns the same result.

Select scopes. Get everything at the intersection. Add a scope to narrow. Remove to widen. Scoping a set of chunks (identity chunks / scopes) returns all chunks placed on every one of them. Connected scopes are computed from shared placements.

### Traversal

Follow connections. From an identity chunk, find chunks placed on it. Those chunks may also be placed on other identity chunks — those are the connections. Navigate by reading the connecting chunks.

Traversal and scoping work together: scope to narrow the space, then explore connections within it.

### Full-text search

A native substrate feature, not an external add-on. Entry point into the structure when the scope vocabulary isn't known yet. The index covers chunk names and string values in chunk bodies. Find chunks by keyword, discover their scopes, then navigate structurally.

The FTS index is maintained by the substrate and stays consistent with current state on each commit.

### Derived data — summaries, embeddings, and beyond

Summaries, vector embeddings, and other derived data are not special-cased in the substrate. They are chunks, placed using the same primitives as everything else.

A summary is a chunk placed on the scope it summarizes (`relates`) and on a derivation scope like `summaries/opus-4.6`. An embedding is a chunk with the vector in its body, placed on its source chunk and on `embeddings/text-embedding-3-large`. Any derived data follows the same pattern.

**Staleness convention.** Derived chunks record what they were derived from in their body:

```json
{
  "text": "Summary of the scope...",
  "source_commit": "c_abc123",
  "model": "opus-4.6"
}
```

`source_commit` is the commit the source scope was at when the derivation was generated. Staleness check: has the source scope been mutated after `source_commit`? If yes, the derived chunk is stale. This is a reader concern — the substrate stores the data, the reader decides when to regenerate.

No `summary_cache` table. No vector table. One primitive handles it all. The derivation scopes (`summaries/...`, `embeddings/...`) are just scopes — queryable, scopeable, navigable like anything else.

### Temporal scoping

Reconstruct state at any commit. A scope read at `--at <commit-id>` resolves all chunks and placements as of that point in history.

Time travel is read-only. Mutations apply to the chosen branch's HEAD; reading the field at a past commit does not enable mutation from that point. To work from a past state, fork a new branch from that commit and mutate forward.

### Negation

Everything in scope A except what's also in scope B. Set difference over placements.

## Ingestion

The substrate accepts any content. A chunk's body is a JSON object of any size — a full document, a dataset, an API response. The structural tools (placement, scopes, archetypes, FTS) make it possible for an agent to break content down into the substrate's structure and integrate it. The substrate stores the result; the agent provides the intelligence.

## Integration

External content is referenced, not stored. A chunk with body fields containing resolution parameters points outside the system. An integration contract chunk (itself an archetype) defines how to resolve references of that type.

A file reference is a chunk placed on the scopes where it's relevant. Its body contains resolution parameters — at minimum a path, plus anchoring information. File references don't mirror filesystem hierarchy — the placement structure reflects knowledge relationships, not disk layout.

**Git as first integration driver.** If the referenced file is git-tracked, the substrate commit and the git commit together pin the reference in time. An agent or caretaker can later reconcile: what git commits have touched this file since the reference was made? If the file changed, is the surrounding knowledge still aligned? The substrate stores the fact; the intelligence evaluates it.

Multiple integration types exist — files, API endpoints, audio, video. Each has its own archetype defining required fields (path + commit for git, endpoint + method for REST, etc.). Each has its own resolution logic. The pattern is uniform: a chunk whose body contains resolution parameters, whose archetype defines the contract.

Staleness detection is a reader concern — the database knows when the reference was established (commit), not whether the external world has changed.

## Peers

A peer is any directory with a substrate database. Multiple peers compose by mounting — declared dependencies or ad-hoc mounts. The entry point is the containment boundary: the directory you start from is read-write, everything peered in is read-only. Nesting can only reduce access.

Peers are separate databases, not partitions of one. Each peer owns its data. The mounting mechanism is runtime — the peer protocol, conflict resolution, and exact mounting mechanics are open.

## Logical schema

The field is composed of:

- **Chunks** — id (system-generated, globally unique), optional name, spec (JSON), body (JSON). Identity is the id; name is unique within scope.
- **Placements** — a chunk placed on a scope (another chunk), typed `instance` or `relates`, optionally carrying `seq` for ordered scopes.
- **Commits** — forming a DAG via parent links. Each commit groups one declaration of mutations and carries a timestamp and optional message.
- **Branches** — named pointers to commits.
- **A full-text index** over chunk names and string values in chunk bodies, native to the substrate.

These are the field's data shape. How they persist — versioned tables for history, materialized current-state tables for read performance, the SQL DDL, indexes, FTS hookup, transaction discipline — is db-level. See [`pilot/db.md`](db.md) for the physical schema and access patterns.

## What This System Is

A substrate. Not a database for a specific application. Not a retrieval layer for AI. The structural foundation that knowledge, computation, file systems, and agent coordination sit on.

**The query is the portal.** The quality of the query determines the quality of the context determines the quality of the output. Queries are declarative, composable, pure.

**Meaning is reader-determined.** The structure tells the reader where to look. The reader discovers what it means. The system does not bake meaning in at write time.

**Shape is system-enforced.** Archetypes define structural contracts. The system rejects non-conforming instances. Meaning is for the reader. Shape is for the system.

**No imposed hierarchy.** Placement creates nesting, but nesting is organizational, not protective. Peers enforce boundaries.

**Derived data is just data.** Summaries, embeddings, and other derivations are chunks placed on derivation scopes. No special tables, no special treatment. The structure is transparent.

**Lossless.** Nothing is destroyed. Knowledge evolves through addition.

## What's Open

- **Scope limit and offset.** Ordered scopes can grow large. A `limit` parameter (from seq tail) and `offset` for pagination prevent overload. Default limit prevents accidental flooding. The scope result already includes counts — agents probe shape before pulling data. Deferred for the pilot but needed soon.
- **Spec language evolution.** The four fields (ordered, accepts, required, unique) cover the known cases. The vocabulary may grow through use.
- **Merge semantics.** The structure supports merge commits. Conflict resolution strategy is above the primitives.
- **Peer protocol.** Separate databases mounted read-only. The mounting mechanism is runtime, not structural.
- **Temporal validity.** Event time vs system time is expressible through body properties. Whether `valid_from`/`valid_to` deserve first-class status depends on use.
- **Views.** Saved scopes with display settings. Drift detection when knowledge changes under an approved view. Concept is clear; mechanics are unbuilt.
