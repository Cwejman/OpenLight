# Substrate Specification

The structural foundation for knowledge, computation, and navigation. Any reader — human, agent, browser, shell, website — navigates the same structure.

## One Primitive: Chunk

A chunk is a unit of meaning with identity.

```
chunk {
  id:   globally unique, system-generated
  name: optional; unique within its owner
  spec: structural contract (system-enforced)
  body: everything else — one JSON object (reader-interpreted)
}
```

> i tohught spec was named instance by the rpevious session, perhaps instance is not the eprfect name either, as a name such in thtis case point to its primary purpose ( good practice), which for the instance spec is to serve validation for its instances, it is like a view into what an instance is to be.

Two fields, cleanly separated by who reads them:

**Spec** is for the system — a contract enforced on writes. Its center is the **instance spec** (below): the typed key-map that instances of this chunk must fit.

**Body** is for the reader — always a kv object. All content lives here: readable text, structured properties, references. Typing is contract and validation, never storage — the body remains one JSON object however strictly its keys are typed. FTS indexes all string values in body.

A chunk can serve as content, identity, archetype, or connection. These roles are not declared; they emerge from how the chunk is connected. A chunk with an instance spec is an archetype by nature.

## Five Connection Kinds

Everything in the field is chunks and the connections between them. There are exactly five kinds, each carrying one meaning. Three are stored placements; two derive from bodies.

```
placement {
  chunk_id: the chunk being placed
  scope_id: the chunk it is placed on
  type:     'owned' | 'instance' | 'relates'
  seq:      optional integer — position within the scope
}
```

> i wonder if scope id is an unclear name. Clear names are important, the less unclear, the more natural it is to read. Meaning is to be as coeherent with the commonality of agreed upon and known words.

- **owned-by** — *where it lives.* Every chunk has at most one owner; ownership forms a tree. Names are unique within their owner, so `/` paths address chunks: `engine/program` is the chunk named `program` owned by the root `engine`. A module is an ownership subtree. Ownership never crosses mounts. A chunk with no owner is a root; the pilot's convention is one root per project, named after it.
- **instance** — *what it is.* Pure type membership: the chunk is an instance of the scope's type. Multi-typing is natural — a chunk may be instance of several archetypes. (`#` as instance sugar is an unruled candidate.)
- **relates** — *what it is about.* Authored aboutness. Prose placed on its subjects — the chunk at the intersection *is* the relationship — stays the substrate's oldest pattern.
- **field** — *related by key.* A typed ref in a body, declared by the owning archetype's instance spec (`person` declares `work` holds a `workplace`). Directional by nature — a body reads outward, which is what pointer-facts always needed and relates never was. Derived into the link index at write.
- **mention** — *spoken of.* A reference in prose (the `ol:` scheme) or a chunk/location a fenced expression uses. The open end of the spectrum: where naming the relation would be false precision, prose carries the meaning and the mention carries the reference. Derived into the link index at write.

Rigid pointers that once leaned on `relates` move into fields; relates is relieved, not removed — it goes back to reliably meaning aboutness.

**Reach = ownership + explicit grants.** Permission walks read ownership and granted roots only — a grant over a root reaches its ownership subtree. Instance, relates, field, and mention never confer reach: you can hand anyone an address; the field decides at the door.

> Oh, so a chunk can claim restricted access downstream? Private bubble on th ebranch of a root? A protected sub-root. Good or bad?

### What connection creates

**Identity.** A chunk with other chunks connected to it IS a scope. No declaration needed — it emerges from the graph.

> A scope is merely a vantage point, saying it is a vantage point by a special word is not needed. It is impled it is a vantage point for the substrate is space. The term for a vantage point on the higher levels of the spec, is location.

> Also i think a name must be nessesary for an identity, and therefore a connection.

**Hierarchy** is ownership — organizational and permission-bearing (reach walks it), never a cage for reference: anything can reference anything regardless of where it lives.

**Connections.** A chunk placed `relates` on multiple identity chunks bridges them. The chunk at the intersection of `turing` and `cambridge` IS the relationship between Turing and Cambridge; its meaning is in its body. No separate link/edge primitive.

> Or the other way around is different congitively, naturally a piece of knowledge about turings time in cambridge can be a separate chunk. But the previous notion that a chunk should always be broken down into its consituents it not nessesarly absolutely true, rather it is a displice with a certain nature and function. Prose can definetly be a larger part of meaning complecting various locations in the field.

**Consolidation principle.** If content doesn't create a new intersection of identities, it belongs in the identity chunk's body, not as a separate chunk. Separate chunks exist when they bridge identities. (The grain rule below decides body key vs type.)

### Names

Names are unique within their owner; root names are unique within their db. The system references by id internally; names are human-readable labels, and paths resolve down the ownership tree. Renaming is trivial — nothing structural depends on the name.

> Except uniqueness at at each closure for them to be adressable by name.

## The Instance Spec

A chunk's spec may carry `instance:` — spoken *"instance spec"* — a typed key-map that its instances' bodies must fit. It binds instances only, **never the chunk itself**: only what a chunk is an instance of constrains its body.

```
spec: {
  instance: {
    name:    string unique
    work:    ref(workplace)
    joined:  time
    bio?:    markdown
      tags:    set<string>
  }
  ordered?: true      — instance placements on this scope carry seq
                        (the field's home is open; see What's Open)
}
```

Towers are natural: `shell` fits `program`'s instance spec while carrying its own instance spec for its runs. Each level is judged one step up — the type's spec binds the instance's body; nothing propagates further.

**Key types**: `string` · `number` · `time` · format-tagged string (`markdown`) · `ref` (optionally archetype-constrained: `ref(workplace)`) · `list<…>` · `set<…>` (a list with uniqueness checked) · `map` (untyped nesting). Collections are stored as JSON arrays, validated per element, one link row per element — no intermediate chunk ceremony. Per-key modifiers: `?` optional — required by default; there is no `required` array — and `unique` (value unique across the type's instances).

**Unions are tag-sets** (`loc | expr`). Values self-describe via the tagged wire encoding (`$ref`, `$loc`, `$set`, `$time`, `$md` — sdk.md), so a union check is tag membership, then per-tag shape.

**Enums are the substrate's own.** A closed vocabulary is `ref(X)` where X's instances are the value chunks — `status: ref(status)` with `draft`, `running`, `done`, `failed` as chunks. No enum machinery; the link index answers "all running" derived, with no placement churn.

> Is it a good or a bad idea, to create an integration, in this cxse the other way around, isntead of syncing the external world it syncs the external world to the field. One such sketch is to have a typescript module, when the integration is running it is subscribed to the field and generates typescript types over the whole substrate, with type inference etc, enabling oneself to use them together with the sdk...

> Another sketch to be taken to sketch.md (a separate branch to be incorporated once the other related feedback is handled and processed.) is to for an integration, being able to scan a website and project its pages / url-structure into the field, the unique nameable nature means the location by ownership to one chunk is the actual web url

**Typing goes as deep as archetypes are named.** Anonymous nested maps stay untyped, as bodies always were. The fence against ontology creep is *ownership*: a key name lives inside one archetype's spec, like a struct field in a struct — never in a global predicate vocabulary. That is the difference between this and RDF.

**Multi-typing composes as obligations.** A chunk instance of several archetypes must fit every spec; keys no spec claims are unconstrained. Two specs claiming the same key with different types cannot both be satisfied — the write is rejected. (The natural reading, written plainly; revisit on evidence.)

Retired from the spec language: `accepts`, `required` (per-key `?` replaced it), `propagate`, `unique`-as-array (now per-key), `body.schema`. Content contracts are typed ref-lists in bodies; argument validation is a placement check (engine.md); chunk typing is instance placements.

### Example

> Oh, i didnt think instance was inside spec? Spec is renamed to instance?

> Nother practical DX consern is that one may want to define if this instance spec is to allow untyped fields, changes the meaning of it quite a lot.

> Is this an over json response? Because strcturally instances is not a field on a chunk. they are only findeable over the field...

```
chunk: workplace            — archetype
  spec: { instance: { name: string unique, city?: string } }

chunk: status               — archetype whose instances are the vocabulary
  spec: { instance: {} }
  instances: draft, running, done, failed

chunk: person               — archetype
  spec: { instance: {
    name:   string
    work:   ref(workplace)
    status: ref(status)
    notes?: markdown
  } }

chunk: ada  (instance on person)
  body: { name: "Ada", work: "<id of acme>", status: "<id of running>" }
```

Writing `ada` validates `work` (exists, instance of `workplace`) and `status` (instance of `status`), then files one link row per ref. Open `acme` and the `linked` answer lists `ada` under `field: work`.

## Links — fields and mentions, derived

When a body is saved, in the same transaction:

- **Declared ref keys are validated** — target exists and is an instance of the constrained archetype — else the write fails like any spec violation.
- **Every link the body contains** — typed refs, and mentions in prose or fenced expressions — is filed into one derived link table: delete-and-reinsert per chunk, the FTS pattern. The table is never part of commits and is rebuildable from current bodies. Typed refs make link-*finding* spec-free (tags announce refs); only archetype-constraint checking reads specs, at write.

> Now i remember that the command for reading was prevously scope. O suggest read is a better verb, or is your opinions perhaps different?

**Both-sides reading.** `ScopeResult` carries a separate `linked` field beside membership — who points here, labeled `field` (with its key) or `mention`, never mixed with placements. "Who works here" is one indexed lookup; open Turing and every prose that mentions him is there.

**Permissions engage both ends.** Creating a ref is gated by the writer's reach over the target — otherwise validation becomes an existence probe outside one's boundary. `linked` answers are filtered by the reader's reach — you never see links from chunks you could not read.

> Interesting, the point of the permission boundaries is what is reacheable and not, so in a way boundaries can determine what type of relations are possible, the onces that cause commitment of marriage, then the dependcy forbids deletion... Good or bad idea? - Some ideas complect wihtout justifiable reason implement rather than postpone.

**Integrity is write-time only, permanently.** The field never re-validates old bodies and never repairs. A target that later loses its archetype or is removed leaves refs to it stale — a *legal, permanent state*, rendered as dead references. Losslessness demands this.

**Location mentions target descriptions, not chunks.** A mention may point at a location — an expression, normalized as text, that may resolve to a hundred chunks today and ninety tomorrow. The link's target column therefore holds two kinds — a chunk id, or a normalized location expression — and "who references this location" answers by expression match. Materializing a description into a chunk stays the separate sharing-confers-identity gesture, never a side effect of mentioning.A

> I dont understand this above paragrpah. also expression is a reserved term. And the talk about descriptino is completely incomprehendeable to me.

**Cross-mount refs validate through the engine** — the federation seam (engine.md). The db stays id-blind and validates locally resolvable targets only. Adopted as the simple thing; author reservation on record that it may prove the wrong seam.

## Mutations and validation

Mutations are atomic. A declaration — one or many chunks, with their placements — succeeds entirely or fails entirely; a commit appears only when every write passes. This atomicity is a property of the field itself, not of any storage layer beneath it.

Validation runs against the post-write state of the declaration: all chunks and placements declared together are recorded before any spec is checked, so a chunk and its instance placement (the type membership its body is judged by) may arrive in one declaration without ordering failure. For each chunk touched, the effective obligation is the union of the instance specs of every archetype it is `instance` on; the body must fit each. Ref keys validate their targets; name uniqueness within the owner is enforced at placement time; a second `owned` placement for a chunk that already has an owner is rejected.

`ordered` scopes: instance placements carry `seq`, auto-assigned on append when omitted.

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

Commits record changes to chunks and placements. Current state on a branch is resolved by walking from that branch's HEAD to root, taking the latest version of each chunk and placement in the ancestry. The derived link table is not part of commits — it is a projection of current bodies, rebuilt as they change.

### Branches

A branch is a movable pointer to a commit.

```
branch {
  name: unique identifier
  head: commit id
}
```

The substrate is branch-aware: every read and every write specifies a branch. Which branch is "active" for a consumer at a given moment is consumer-level state, not field state. Branches fork (a new pointer from any commit) and merge (a commit with two parents; conflict resolution is explicit, above the primitives).

### Lossless

Nothing is destroyed. Removal is logical: a removed chunk drops out of current-state reads, as do placements involving it and link rows derived from it — refs *to* it become dead references, rendered, never repaired. Version history retains everything; time-travel reads see the past state intact. Removal is itself a mutation, recorded in a commit like any other write.

## Queries / Scoping

### Scope

The primary read operation. Declarative, pure, deterministic — the same query against the same field state returns the same result.

A scope read on X answers across the five connection kinds, each kept distinct. **Membership** is the three stored kinds — what lives here (`owned`), what is a member (`instance`), what is about it (`relates`) — reported with per-kind counts. **Links** — who points here by key (`field`), who speaks of it (`mention`) — arrive in the separate `linked` result. Intersection: naming several scopes returns the chunks placed (any stored kind) on every one; add a scope to narrow, remove to widen. Connected scopes are computed from shared placements.

### Traversal

Follow connections. From an identity chunk: its members and residents by placement, its subjects by relates, its outward refs by reading the body, its inward refs from `linked`. Traversal and scoping work together — scope to narrow the space, then follow connections within it.

### Full-text search

A native substrate feature. Entry point into the structure when the scope vocabulary isn't known yet. The index covers chunk names and string values in bodies; find chunks by keyword, discover their scopes, then navigate structurally. Maintained by the substrate, consistent with current state on each commit.

### Derived data — summaries, embeddings, and beyond

Summaries, vector embeddings, and other derived data are chunks placed with the same primitives. A summary `relates` on the scope it summarizes and on a derivation scope like `summaries/opus-4.6`; an embedding carries its vector in body, placed on its source chunk and on its model's scope. Derivation scopes are ordinary scopes — queryable, navigable, no special tables. A derived chunk records what it was derived from in its body (`source_commit`, `model`), so a reader can tell whether the source has moved. Detecting and regenerating staleness is a reader concern.

### Grain — type or body key

One question decides where a property lives (ruled): **does the property change while the chunk remains itself?** State — a task's status, a document's draft flag — is a body key (typed `ref` when the vocabulary is closed); making it a placement would churn placements on every change and let the "type" lie about identity. Identity — what the chunk *is*, without which it is nothing — is a type, carried by `instance`. A JSON body is **compressed field structure**: the grain choice is never fatal, because a pure transform can project body keys as virtual chunks on demand (`explode`, engine.md) and a writer who knows the shape may commit at chunk grain — pre-explosion, not indexing.

### Temporal scoping

Reconstruct state at any commit: a read at `at: <commit>` resolves all chunks and placements as of that point. Time travel is read-only; to work from a past state, fork a branch from that commit and mutate forward. In the expression language, `at` is a pure pipe verb (`scope | at(commit)`).

> Should you? Now that the egnine enables expressions, such things are writeable anyway.

> Also brings the question, what about speed for expressions, will there be a time when it is better to add some primitive function as part of the db nin some way opr how does one allow the egnine to do more proper sql queries? Critical ipossible failure point to analyse.

### Negation

Everything in scope A except what's also in scope B. Set difference over placements, exposed as `exclude` roots on a scope read; excluded scopes are boundary-checked like positive ones.

### Pagination and projection

Ordered scopes grow large; reads are bounded by default. A scope read takes `limit` and `offset`: for ordered scopes the default window is tail-first (the latest entries), `offset` pages backward. Counts always describe the full set, so a reader probes shape before pulling data. Reads also project: `include: { body: false }` returns names, specs, placements, and counts without bodies — the cheap survey read context assembly and pickers depend on. Single-chunk reads (`get`) honor `at` for temporal point lookups.

## Ingestion

The substrate accepts any content. A chunk's body is a JSON object of any size — a full document, a dataset, an API response. The structural tools (connections, scopes, archetypes, FTS) make it possible for an agent to break content down and integrate it. The substrate stores the result; the agent provides the intelligence.

## Integration

External content is referenced, not stored. A chunk with body fields containing resolution parameters points outside the system; an integration contract chunk (itself an archetype, its instance spec naming the required keys) defines how to resolve references of that type.

A file reference is a chunk placed on the scopes where it's relevant; its body carries a path plus anchoring information. File references don't mirror filesystem hierarchy — placement reflects knowledge relationships, not disk layout.

**Git as first integration driver.** If the referenced file is git-tracked, the substrate commit and the git commit together pin the reference in time. An agent can later reconcile: what git commits touched this file since the reference was made? The substrate stores the fact; the intelligence evaluates it. The pattern generalizes: any integration type is an archetype whose instance spec carries resolution parameters.

Staleness detection is a reader concern — the field knows when the reference was established, not whether the world has changed.

## Peers

Peers are separate databases, not partitions of one — each owns its data. They compose into one field by mounting: chunk ids are globally unique, so a placement in one db can reference a scope chunk in another, and reads union across the mounted set. Ownership never crosses mounts — a chunk's owner lives in its own db. Backlinks are per-db: a peer's links to my chunk live in their table; a complete `linked` answer is a federated union across mounts, like reads generally. How projects declare and resolve mounts, and the read-write/read-only model, are the engine's — see [`pilot.md`](pilot.md#multi-project-mounts) and [`engine.md`](engine.md).

## Logical schema

The field's data shape is six things, each defined above: **chunks**, **placements** (three stored kinds), **links** (one derived table — fields and mentions, rebuildable, never in commits), **commits** (a DAG of declarations), **branches** (named pointers), and a **full-text index** over names and body strings. How they persist — versioned tables for history, materialized current-state tables, the SQL DDL, indexes, FTS hookup, transaction discipline — is db-level. See [`db.md`](db.md).

## What This System Is

A substrate. Not a database for a specific application. Not a retrieval layer for AI. The structural foundation that knowledge, computation, file systems, and agent coordination sit on.

**The query is the portal.** The quality of the query determines the quality of the context determines the quality of the output. Queries are declarative, composable, pure.

**Meaning is reader-determined.** The structure tells the reader where to look; the reader discovers what it means. The system does not bake meaning in at write time.

**Shape is system-enforced.** Archetypes define structural contracts; the system rejects non-conforming instances. Meaning is for the reader; shape is for the system.

**One meaning per connection.** Five kinds, each carrying exactly one: residence, membership, aboutness, keyed relation, spoken reference. No kind is overloaded to fake another.

**Derived data is just data.** Summaries, embeddings, links — chunks and rows the field can rebuild. The structure is transparent.

**Lossless.** Nothing is destroyed. Knowledge evolves through addition.

## What's Open

- **`ordered`/`seq` home.** Order survives as placement `seq`; where a scope *declares* orderedness now that `propagate` is gone — a spec field beside `instance` (the interim form above), a body key, or something else — is unruled.
- **Ref-constraint naming.** How `ref(workplace)` names its archetype — id vs scoped name — couples to the bootstrap-ID debt; these settle together.
- **Eager vs lazy re-derivation.** Editing an archetype's instance spec invalidates the derived link rows of every instance. Eager (write fan-out on spec edits) vs lazy (rows knowingly stale until each chunk's next write) is the sharpest open engineering decision.
- **Expression normalization.** When two location descriptions count as the same location (for "who references this"). Settles at build.
- **Temporal link queries.** v0.1 offers none; historical bodies remain in the version log, re-derivable if wanted.
- **Mention/fence syntax edges.** The `ol:` scheme's location URIs and the fenced-expression tag settle at `prose` v0.
- **Single owner, until evidence.** One owner per chunk is the law; a real case for shared residence would reopen it.
- **`#` instance sugar** — unruled.
- **Projection of fields as first-class placements** (a standing `explode` beyond the `linked` field) — nothing needs it yet; revisit against a real consumer.
- **Merge semantics — ruled.** Branches diverge freely; merge auto-takes the union of additions and fails hard only on true collision (the same chunk's body or spec changed on both sides). No conflict-resolution machinery in the primitives: an agent resolves a refused merge with existing tooling, committing the reconciliation as ordinary work. Substrate refuses, intelligence resolves. Protocol shape lands with branch ops (engine.md, *What Is Open*).
- **Temporal validity.** Event time vs system time is expressible through body keys; whether `valid_from`/`valid_to` deserve first-class status depends on use.
