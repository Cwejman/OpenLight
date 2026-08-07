# Substrate Specification

The structural foundation for knowledge, computation, and navigation. Any reader — human, agent, browser, shell, website — navigates the same structure.

## One Primitive: Chunk

A chunk is a unit of meaning with identity.

```
chunk
  id        globally unique, system-generated
  name?     human-readable label, unique within its owner
  instance  the contract this chunk's instances must fit — empty unless it is an archetype
  seq?      legal only on an archetype — see *Ordered places*
  body      everything else — one JSON object
```

Two fields carry content, cleanly separated by who reads them.

**Instance** is for the system — the typed key-map this chunk's *instances'* bodies must fit. It says nothing about this chunk itself.

**Body** is for the reader — always a kv object. All content lives here: readable text, structured properties, references. Typing is contract and validation, never storage — the body remains one JSON object however strictly its keys are typed. FTS indexes chunk names and all string values in bodies.

A chunk can serve as content, identity, archetype, or connection. These roles are not declared; they emerge from how the chunk is connected. A chunk with a non-empty `instance` is an archetype by nature.

**Declarations are blocks.** One block form declares field structure — in this spec, in `edit`, anywhere text declares chunks. There is no nesting: owned chunks declare as sibling blocks, by path.

```ol
chunk workplace {
  instance: { name: string unique, city?: string }
}
chunk workplace/site { instance: { address: string } }
```

The engine never receives sugar. Parsing yields ordinary declarations — chunks, placements, bodies — with type terms as reified `type` values; storage is JSON.

### Names and addresses

Names are unique within their owner; root names are unique within their db. The system references by id internally; names are human-readable labels, and paths resolve down the ownership chain — `engine/program` is the chunk named `program` owned by the root `engine`. Renaming is trivial — nothing structural depends on the name — with one caveat: the new name must still be unique within the owner.

**A chunk that has members must have a name** — *steward's reading of D2, open for the author.* Names stay optional in general, but a chunk that functions as a dimension must be addressable; nameless chunks are leaves. Validated at write, beside name-uniqueness. *Open: the trigger fires on process chunks, which are id-addressed and typically nameless, yet own their children and results — either the rule needs an exception or processes need generated names.*

## Five Connection Kinds

Everything in the field is chunks and the connections between them. There are exactly five kinds, each carrying one meaning. Three are stored placements; two derive from bodies.

```
placement
  chunk_id   the chunk being placed
  on         the chunk it is placed on
  kind       'owned' | 'instance' | 'relates'
  seq?       position, where what it is placed on is ordered — see *Ordered places*
```

- **owned** — *where it lives, and what it is called.* Ownership carries **naming and containment, and nothing else**. Every chunk has at most one owner; names are unique within their owner, so `/` paths address chunks. An `owned` placement is ordinary one-hop membership like every other kind — naming into a namespace *is* placing into a room: same act, same governance, visible to the room's holders, one hop, no deeper. Ownership never crosses mounts. A chunk with no owner is a root — bootstrap only; the pilot's convention is one root per project, named after it.
- **instance** — *what it is.* Pure type membership: the chunk is an instance of the archetype it is placed on. Multi-typing is natural — a chunk may be instance of several archetypes. (`#` as instance sugar is an unruled candidate.)
- **relates** — *what it is about.* Authored aboutness, published into the subject's room. Prose placed on its subjects — the chunk at the intersection *is* the relationship — stays the substrate's oldest pattern.
- **field** — *related by key.* A typed ref in a body, declared by the owning archetype's instance contract (`person` declares `work` holds a `workplace`). Directional by nature — a body reads outward, which is what pointer-facts always needed and relates never was. Derived into the link index at write.
- **mention** — *spoken of.* A reference in prose (the `ol:` scheme) or a chunk or place a fenced expression uses. The open end of the spectrum: where naming the relation would be false precision, prose carries the meaning and the mention carries the reference. Derived into the link index at write.

Rigid pointers that once leaned on `relates` move into fields; relates is relieved, not removed — it goes back to reliably meaning aboutness.

So aboutness is two mechanisms, deliberately: **relates** is aboutness published into the subject's room, curated by the subject's stewards, visible to the subject's holders; **mention** is aboutness spoken from your own room, self-governed, visible only to those who reach you. A private note about a shared project is a mention, and stays private — by the boundary, not by any one-wayness of the kind.

Ownership is organizational, never a cage for reference: anything can reference anything regardless of where it lives. A chunk placed `relates` on several identity chunks bridges them — the chunk at the intersection of `turing` and `cambridge` IS the relationship between them, its meaning in its body. There is no separate link or edge primitive.

## Every Chunk Is a Dimension

Placement on a chunk is membership in it. The space is unstructured; you structure it by placing — create the grouping chunk, attach things to it, and the attaching is what makes them *in* it. Grouping was never ownership's job; it is what locations always were.

**To place into a dimension is to publish into it.** A note related onto the inbox is visible to inbox-holders — not a leak, the meaning of the act. Aboutness without publishing is the other mechanism above: a mention, spoken from your own room.

Dimension and place are one thing from two sides: a chunk is a **dimension** when things are placed on it, and a **place** is what a read names — one chunk, or an intersection of several. A chunk with other chunks connected to it IS a place; no declaration is needed.

**Three axes, never conflated:**

- **Kinds are symmetric.** No connection kind is inherently hidden in one direction. Knowledge flows both ways; authorship never does.
- **Boundaries decide what you may see.** Permission, viewer-side, uniform over everything: bodies, members, adjacency, links, search.
- **Selections decide what you are looking at.** Reader configuration — instances only, exclude mentions — is attention, not permission.

Selecting `[movie]` shows movies, not your note about one; selecting `[the-movie]` shows the note — if your boundary admits it. Membership, attention, permission: three different facts. The last two are law, and both need the type vocabulary first.

## Archetypes and Contracts

A chunk's `instance` field is a typed key-map that its instances' bodies must fit — *what an instance is to be*. It binds instances only, **never the chunk itself**: only what a chunk is an instance of constrains its body. One flat field, no wrapper.

```ol
chunk person {
  instance: {
    name:   string unique
    work:   ref(workplace)
    joined: time
    bio?:   markdown
    tags:   set<string>
  }
}
```

Towers are natural: `shell` fits `program`'s instance contract while carrying its own for its runs. Each level is judged one step up — the type's `instance` binds the instance's body; nothing propagates further.

**Key types** are a closed vocabulary of eleven words:

- `string` · `number` · `time` · format-tagged string (`markdown`) — primitives. Never field content; they live inside bodies as payloads.
- `ref` — one chunk, by name or id, optionally archetype-constrained (`ref(workplace)`). There is no `name` type: one name *is* a ref.
- `loc` — a place: an intersection of chunks. One chunk is itself a place, so `[c]` is the place *at* c — the chunk and what is placed on it.
- `expr` — an expression: named nodes, its own closure, last unnamed line as `out` ([`engine.md`](engine.md)).
- `list<T>` (ordered) · `set<T>` (unordered, uniqueness checked). Both take an exact cardinality: `list<ref(commit), 2>` is the ordered pair, `set<ref(commit), 2>` the symmetric one. Tuples are unnecessary.
- `map` — untyped nesting. `map<T>` — named entries of typed values.
- `selection` — `set<loc | expr>`, with a purity clause: expressions within one must derive pure ([`engine.md`](engine.md)). A selection is what you offer to be viewed or consumed: places, and derivations of places. **At most one `selection` per contract** — two would compete for the same elements.

**Struct literals are types.** `{k: type, …}` in a type position types a nested value inline, no archetype involved: `grades?: map<{ wmin?: number, wmax?: number }>`. Typing goes as deep as you write it; anonymous nested maps stay untyped, as bodies always were. `instance:` means exactly one thing — the contract on chunk *instances* — and archetype names appear in key positions only inside `ref(X)`.

Collections store as JSON arrays, validated per element, one link row per element — no intermediate chunk ceremony. Per-key modifiers: `?` optional (required by default; there is no `required` array) and `unique` (value unique across the type's instances).

**Values and chunks — no exceptions.** Reserved words type **values, only ever**; a chunk is typed by archetypes alone. The scalar and container words type values that can never be chunks — a bare number denotes nothing in the field. The field-shaped words (`loc`, `expr`, `selection`) type values that denote content and are therefore **liftable**: a chunk of one exists when a sharing gesture makes it, instance of an archetype, reached thereafter as `ref`. `ref` is the pointer between the two worlds. A named boundary preset, a saved query, a reusable expression — each is a lifted value, needing no machinery beyond this.

Type terms are themselves data: the reified **`type` value kind** (`{$type: {of, opt?, card?}}`) lets one contract be read identically by validation, by a form, and by a tool-schema adapter.

**Unions are tag-sets** (`loc | expr`). Values self-describe via the tagged wire encoding (`$ref`, `$loc`, `$set`, `$time`, `$md` — [`sdk.md`](sdk.md)), so a union check is tag membership, then per-tag shape.

**Enums are the substrate's own.** A closed vocabulary is `ref(X)` where X's instances are the value chunks — `status: ref(status)` with `draft`, `running`, `done`, `failed` as chunks. No enum machinery; the link index answers "all running" derived, with no placement churn.

**Typing goes as deep as archetypes are named.** The fence against ontology creep is *ownership*: a key name lives inside one archetype's `instance`, like a struct field in a struct — never in a global predicate vocabulary. That is the difference between this and RDF.

**Multi-typing composes as obligations.** A chunk instance of several archetypes must fit every contract; keys no contract claims are unconstrained. Two contracts claiming the same key with different types cannot both be satisfied — the write is rejected.

**Subtyping is multi-typing, and nothing is transitive.** No archetype-extension relation exists, deliberately. "An image is a file" means the chunk carries *both* instance placements. Matching sees placements only: a chunk instance on `image` alone does not match `ref(file)`; it matches iff the `file` placement is actually on it. The convention that makes hierarchies work — authoring and ingest placing the whole ancestor chain — is owed, not automatic.

Retired from the old spec language: `required` (per-key `?` replaced it), `propagate`, `unique`-as-array (now per-key), `body.schema`, the `spec` wrapper field (flattened into `instance`), and `accepts` as an archetype key listing the types a place admits. *The word `accepts` survives with a different meaning:* on a program body it is the argument contract, checked by the match at start ([`engine.md`](engine.md)). Chunk typing is instance placements; content contracts are typed ref-lists in bodies.

### Ordered places

An archetype may declare that its instances are ordered. `seq: true` is a flat top-level chunk field, legal **only on archetypes** — a chunk carrying an instance contract. It makes **each instance of that archetype an ordered place**: chunks placed on an instance carry `seq`, auto-assigned `max + 1` when omitted, an explicit seq honored and validated. No sigil, no wrapper, no propagation.

```ol
chunk session {
  seq:      true
  instance: { title?: string }
}
```

The turns inside each session are ordered; the sessions themselves are not — placements onto the archetype are ordinary placements. `ordered` retires as a word, and the interim `$ordered` entry reserved in the stored `instance` column goes with it ([`db.md`](db.md)).

### Grain — type or body key

One question decides where a property lives (ruled): **does the property change while the chunk remains itself?** State — a task's status, a document's draft flag — is a body key (typed `ref` when the vocabulary is closed); making it a placement would churn placements on every change and let the "type" lie about identity. Identity — what the chunk *is*, without which it is nothing — is a type, carried by `instance`. The same question decides value-versus-chunk for nested data: identity or graph presence needed → a chunk; configuration nobody points at → an inline struct literal.

A JSON body is **compressed field structure**: the grain choice is never fatal, because a pure transform can project body keys as virtual chunks on demand (`explode`, [`engine.md`](engine.md)) and a writer who knows the shape may commit at chunk grain — pre-explosion, not indexing.

**Consolidation is a discipline, not a rule.** The same body-or-chunk question asked of prose: content that creates no new intersection of identities generally belongs in the identity chunk's body rather than as a separate chunk — but prose may legitimately span several locations, and the field is fractally infinite: veiling structure for tidiness is itself the hygiene problem.

### Example

```ol
chunk workplace { instance: { name: string unique, city?: string } }

chunk status { instance: {} }        — the vocabulary archetype; draft, running,
                                       done and failed exist as chunks placed
                                       instance on it, found by reading

chunk person {
  instance: {
    name:   string
    work:   ref(workplace)
    status: ref(status)
    notes?: markdown
  }
}

ada — instance on person
  body: { name: "Ada", work: <ref acme>, status: <ref running> }
```

Writing `ada` validates `work` (exists, instance of `workplace`) and `status` (instance of `status`), then files one link row per ref. Open `acme` and the `linked` answer lists `ada` under `field: work`.

## Boundaries — What You May See

A boundary is a **selection** — the type just defined: places, and pure derivations of places. The derivations a boundary admits are the *single-request class* of the expression language: dimension algebra plus `at`, `where`, `follow`, exactly. That grammar belongs to [`engine.md`](engine.md) and is not restated here; what the law fixes is its ceiling — a wall must be evaluable instantly and deterministically at every read, so compute has no place in it. How a run comes by its boundary — the frame, grants, the program's stated ceiling, the parent cap — is engine.md's as well; this section is the law it enforces.

- **Sets are first class**: union, intersection, and **subtraction**, in boundaries and reads alike. `[project, controller, admin]` narrows; `engine − process` subtracts.
- **One grammar, three jobs**: attention (the reader's members), context (the agent's), permission (boundaries). That one selection language serves all three is the design's proof of fit.
- **Filtering is uniform.** Bodies, membership answers, adjacency, links, and full-text search are all filtered by the reader's boundary. **Counts describe what your boundary admits** — there is no privileged view of a full set.
- **Membership is always current, including under `at`.** A temporal read is filtered by the structure as it stands *now*, never as it stood at the read's commit. Placing a chunk on `secrets` today hides it throughout all history — which is what remediation requires — and removing it exposes history. Accepted: boundaries govern the current structure, and the past is read through it, not beside it. *Open: whether `at` is meaningful, ignored, or illegal inside a boundary expression itself.*
- **A boundary is a standing licence, not a snapshot.** A run's boundary *expression* freezes at start; membership through it stays live, so a grant over a collection that grows keeps admitting what arrives.

**Hygiene, not holes.** Naming a dimension in a boundary — positively or negatively — delegates membership control to that dimension's writers: writers of `engine` shape what `[engine]` shows; writers of `process` shape what `engine − process` shows, since removal there moves chunks *in*. Both polarities, the same delegation. Permission is a question of hygiene: keep the dimensions you name well-governed. Subtraction stays.

*Held open — the third player.* Everything here is viewer-side. Prose can say anything about what it mentions, and no viewer-side selection closes that. **Author-ruled open: openness is cheaper than restriction until experience says otherwise** — you may read prose that mentions chunks and dimensions beyond your reach, and the prose does not inherit their walls. The reader-side consequence belongs to the surface layer: a program cannot run over a chunk beyond reach, so citations pointing outside the boundary render as unresolved references rather than live surfaces ([`programs.md`](programs.md)).

*Open: the default kind-set of a bare `[X]` grant.* Dimensionality spans all kinds, and a bare grant that included *inbound mentions* would sweep in the field's chatter. Lean, unruled: outbound field refs plus placements on X; inbound mentions excluded unless asked.

*Open: what an unreadable dimension looks like from outside* — whether it vanishes from adjacency answers entirely, or shows as an opaque count.

### Propagation by hop

Reach is one hop. What a hop carries, per kind and direction:

| hop | read propagates? | write propagates? |
|---|---|---|
| owner → what it owns | **one hop, by boundary** — never transitive | **no** |
| instance → its archetype | **yes** — reading your type is normal | **no** — holding an instance never edits the type |
| archetype → its instances | by the grant's shape (`[X]` vs terms) | by the grant's shape |
| relates → the related | by boundary | by boundary; never implicit |
| mention → the mentioned | the edge, boundary permitting; content by boundary | **no** |
| field → the target | the address; content by boundary | **no** |

Two rows are law-grade: **write never propagates through links, in either direction**, and **instance-read up to the archetype is free**. *Open: what that freedom shows of the archetype now that counts are boundary-admitted — its address and contract alone, or its membership too.*

**Depth is non-transitive by default.** `[hallway]` reaches what is placed on the hallway, not what is placed on those. Depth, when wanted, is stated as an expression (`follow`-shaped). Reorganizing the ownership tree therefore never reorganizes permission — the two jobs finally come apart.

## Who May Write What

Reading is settled; writing splits the kinds differently. Every connection has two lives. As an **act** it is directional: someone wrote it, and the write landed on one specific side. As **knowledge** it is symmetric, traversable both ways, boundary permitting. The five kinds split into two governance classes by where the write lands.

**Placements** (`owned`, `instance`, `relates`) land on the target's side. The act is publishing into the target:

- **Create** requires **write over the dimension and read over the placed chunk.**
- **Remove** requires **write over the dimension** — its stewards curate its member list.
- *Why read over the chunk:* without it, anyone could place a bare *id* they never held, and the dimension's holders would gain a body the placer could not read — reach manufactured from an address. Same rule and reason as ref creation, below.
- *Why not write over both:* the federation pattern requires placing *read-only* peer chunks onto your own dimensions. Reference is not modification; write-on-both kills mounting.

**Links** (`field`, `mention`) land in the author's own body. The act is speaking from yourself: self-governed. The target is passive — read over it suffices.

**Instancing is a claim**, not a publication: anyone may claim a type, the archetype untouched. Publish-governance here would strangle typing and enums, so the cost is carried instead, and stated plainly. The injected party **gains no reach** — reach flows to the boundary's holder, and an injector only exposes their own chunk; this is an **integrity** question (pollution and spoofing of trust-bearing membership), not a confidentiality one. The real mechanism is **federation**: placement rows union across mounted dbs, so a mounted peer can write members into any dimension you name. v0.1 is unaffected — one author per db, mounts chosen and read-only. *Direction recorded, unworked, author-ruled open and explicitly not an implementation blocker: provenance-scoped membership — every federated chunk already carries a synthesized mount marker, so selections could default to same-db members with peer members opted in per term. Rides with shared-db identity; not to be designed now.*

This is why the kinds differ, and it is worth saying once plainly: placements are written by whoever writes the chunk, and multi-typing is free. A boundary phrased over an archetype therefore admits whatever anyone claims. **You grant places, not types** — grant dimensions you govern.

Assignment governance falls out of the same rule with no new machinery: a role is a dimension, and who may assign it is who holds write over the role chunk.

**Chunk birth — creation is never placementless.** Every chunk is created **owned**, defaulting into the creating process's frame; owning it elsewhere at birth requires write over that owner, which is the placement rule applied, nothing new. A process's frame is its own dimension: children and results are owned by the process, and that one relation is both their address and their membership in it.

## Links — fields and mentions, derived

When a body is saved, in the same transaction:

- **Declared ref keys are validated** — target exists and is an instance of the constrained archetype — else the write fails like any contract violation.
- **Every link the body contains** — typed refs, and mentions in prose or fenced expressions — is filed into one derived link table: delete-and-reinsert per chunk, the FTS pattern. The table is never part of commits and is rebuildable from current bodies. Typed refs make link-*finding* contract-free (tags announce refs); only archetype-constraint checking reads contracts, at write.

**Both-sides reading.** `ReadResult` carries a separate `linked` field beside membership — who points here, labeled `field` (with its key) or `mention`, never mixed with placements. "Who works here" is one indexed lookup; open Turing and every prose that mentions him is there.

**Both ends are gated.** Creating a ref requires read over the target — otherwise validation becomes an existence probe outside one's boundary. `linked` answers are filtered by the reader's boundary, like every other answer.

**Integrity is write-time only, permanently.** The field never re-validates old bodies and never repairs. A target that later loses its archetype or is removed leaves refs to it stale — a *legal, permanent state*, rendered as dead references. Losslessness demands this.

**A mention may name a place rather than a chunk.** Prose speaks of `loc` as readily as of chunks — and a place is a description, resolving to a hundred chunks today and ninety tomorrow. The link's target therefore holds one of two things: a chunk id, or a normalized location expression. "Who references this place" answers by matching the expression. Naming a place in prose never creates a chunk for it; lifting a description into a chunk stays the separate sharing gesture.

**Cross-mount refs validate through the engine** — the federation seam ([`engine.md`](engine.md)). The db stays id-blind and validates locally resolvable targets only. Adopted as the simple thing; author reservation on record that it may prove the wrong seam.

## Mutations and validation

Mutations are atomic. A declaration — one or many chunks, with their placements — succeeds entirely or fails entirely; a commit appears only when every write passes. This atomicity is a property of the field itself, not of any storage layer beneath it.

Validation runs against the post-write state of the declaration: everything declared together is recorded before any contract is checked, so a chunk and the instance placement its body is judged by may arrive in one declaration without ordering failure. For each chunk touched:

- the body must fit the union of the instance contracts of every archetype it is `instance` on;
- declared ref keys must resolve, and must hit the constrained archetype where one is named;
- the name must be unique within its owner, and present if the chunk has members;
- a second `owned` placement for a chunk that already has an owner is rejected;
- a placement landing on an instance of a `seq: true` archetype takes the seq given, or `max + 1` over that place when omitted.

Governance rides alongside: every placement in the declaration is checked for write over its dimension and read over its chunk, every link for read over its target.

## History

### Commits

Every successful declaration produces a commit.

```
commit
  id         unique identifier
  parent_id  previous commit (NULL for root, forms a DAG)
  timestamp  when committed
  message?   optional description
```

Commits record changes to chunks and placements. Current state on a branch is resolved by walking from that branch's HEAD to root, taking the latest version of each chunk and placement in the ancestry. The derived link table is not part of commits — it is a projection of current bodies, rebuilt as they change.

**Commits are rows, and that is what makes them safe as dimensions.** A commit is not a chunk with placements: it carries message and timestamp, and its deltas live in its touched-chunks and touched-placements columns, which the read layer projects as queryable intersections (`read([db/commits, chunk_id])`). The edits are not in the body — a diff is two temporal reads compared, each filtered by the reader's boundary over the chunks themselves. So granting the commits archetype lists history: metadata and touched addresses, never contents. Contents come through the chunks, gated as always. And granting a *single* commit as a dimension makes its touched set readable — "see exactly what this run changed", in one gesture. Kept deliberately.

### Branches

A branch is a movable pointer to a commit.

```
branch
  name  unique identifier
  head  commit id
```

The substrate is branch-aware: every read and every write specifies a branch. Which branch is "active" for a consumer at a given moment is consumer-level state, not field state. Branches fork (a new pointer from any commit) and merge (a commit with two parents; conflict resolution is explicit, above the primitives).

### Lossless

Nothing is destroyed. Removal is logical: a removed chunk drops out of current-state reads, as do placements involving it and link rows derived from it — refs *to* it become dead references, rendered, never repaired. Version history retains everything; time-travel reads see the past state intact. Removal is itself a mutation, recorded in a commit like any other write.

## Reads

### Read

The primary operation. Declarative, pure, deterministic — the same read against the same field state, through the same boundary, returns the same result.

A read at a place answers across the five connection kinds, each kept distinct. **Membership** is the three stored kinds — what lives here (`owned`), what is a member (`instance`), what is about it (`relates`) — reported with per-kind counts. **Links** — who points here by key (`field`), who speaks of it (`mention`) — arrive in the separate `linked` result. A place is an intersection: reading several chunks returns those placed (any stored kind) on every one; add a chunk to narrow, remove one to widen. Adjacent places are computed from shared placements. Subtraction is the operator boundaries use, in reads too — everything in place A except what is also in place B, exposed as `exclude` roots; a subtracted place is boundary-checked like a positive one.

Every part of the answer — chunks, counts, adjacency, `linked` — passes the reader's boundary first.

### Traversal

Follow connections. From an identity chunk: its members and residents by placement, its subjects by relates, its outward refs by reading the body, its inward refs from `linked`. Traversal and reading work together — read a place to narrow the space, then follow connections within it.

### Full-text search

A native substrate feature. Entry point into the structure when the place vocabulary isn't known yet. The index covers chunk names and string values in bodies; find chunks by keyword, discover their places, then navigate structurally. Maintained by the substrate, consistent with current state on each commit, and filtered by the reader's boundary like every other answer.

### Temporal reads

Reconstruct state at any commit: a read at `at: <commit>` resolves all chunks and placements as of that point, filtered by the boundary as it stands *now*. Time travel is read-only; to work from a past state, fork a branch from that commit and mutate forward. In the expression language, `at` is a pure pipe verb (`[project, tasks] | at(commit)`).

### Pagination and projection

Ordered places grow large; reads are bounded by default. A read takes `limit` and `offset`: for an ordered place the default window is tail-first (the latest entries), `offset` pages backward. **Counts describe what your boundary admits**, so a reader probes the shape of what it may see before pulling data. Reads also project: `include: { body: false }` returns names, instance contracts, placements, and counts without bodies — the cheap survey read that context assembly and pickers depend on. Single-chunk reads (`get`) honor `at` for temporal point lookups.

### Derived data — summaries, embeddings, and beyond

Summaries, vector embeddings, and other derived data are chunks placed with the same primitives. A summary `relates` on the place it summarizes and on a derivation place like `summaries/opus-4.6`; an embedding carries its vector in body, placed on its source chunk and on its model's place. Derivation places are ordinary dimensions — queryable, navigable, no special tables. A derived chunk records what it was derived from in its body (`source_commit`, `model`), so a reader can tell whether the source has moved. Detecting and regenerating staleness is a reader concern.

## Content from outside

The substrate accepts any content. A chunk's body is a JSON object of any size — a full document, a dataset, an API response. The structural tools (connections, places, archetypes, FTS) make it possible for an agent to break content down and integrate it. The substrate stores the result; the agent provides the intelligence.

External content is **referenced, not stored**. A chunk whose body carries resolution parameters points outside the system; an integration contract chunk — itself an archetype, its instance contract naming the required keys — defines how to resolve references of that type. A file reference is a chunk placed on the places where it is relevant, its body carrying a path plus anchoring information. File references don't mirror filesystem hierarchy: placement reflects knowledge relationships, not disk layout.

**Git is the first integration driver.** If the referenced file is git-tracked, the substrate commit and the git commit together pin the reference in time; an agent can later reconcile what git commits touched the file since. The substrate stores the fact; the intelligence evaluates it. The pattern generalizes — any integration type is an archetype whose instance contract carries resolution parameters. Staleness detection is a reader concern: the field knows when the reference was established, not whether the world has changed.

## Peers

Peers are separate databases, not partitions of one — each owns its data. They compose into one field by mounting: chunk ids are globally unique, so a placement in one db can reference a chunk in another, and reads union across the mounted set. Ownership never crosses mounts — a chunk is named within its own db. Other placements do cross, and that is the federation pattern working as designed, with the integrity cost stated under *Who may write what*. Backlinks are per-db: a peer's links to my chunk live in their table; a complete `linked` answer is a federated union across mounts, like reads generally. How projects declare and resolve mounts, and the read-write/read-only model, are the engine's — see [`pilot.md`](pilot.md#multi-project-mounts) and [`engine.md`](engine.md).

## Logical schema

The field's data shape is six things, each defined above: **chunks**, **placements** (three stored kinds), **links** (one derived table — fields and mentions, rebuildable, never in commits), **commits** (a DAG of declarations), **branches** (named pointers), and a **full-text index** over names and body strings. How they persist — versioned tables for history, materialized current-state tables, the SQL DDL, indexes, FTS hookup, transaction discipline, and boundary evaluation on the read path — is db-level. See [`db.md`](db.md).

## What This System Is

A substrate. Not a database for a specific application. Not a retrieval layer for AI. The structural foundation that knowledge, computation, file systems, and agent coordination sit on.

**The query is the portal.** The quality of the query determines the quality of the context determines the quality of the output. Queries are declarative, composable, pure.

**Meaning is reader-determined.** The structure tells the reader where to look; the reader discovers what it means. The system does not bake meaning in at write time.

**Shape is system-enforced.** Archetypes define structural contracts; the system rejects non-conforming instances. Meaning is for the reader; shape is for the system.

**One meaning per connection.** Five kinds, each carrying exactly one: residence, membership, aboutness, keyed relation, spoken reference. No kind is overloaded to fake another.

**Permission is viewer-side, and one hop.** Every chunk is a dimension; a boundary is a selection over dimensions; where a chunk lives grants nothing about what is inside it.

**Derived data is just data.** Summaries, embeddings, links — chunks and rows the field can rebuild. The structure is transparent.

**Lossless.** Nothing is destroyed. Knowledge evolves through addition.

## What's Open

- **Instance contracts stay open — a note, not a build.** Undeclared body keys remain legal, and a contract may not declare itself closed. Multi-typing is the reason: a chunk instance on a closed A and an open B would need "closed over the union of every archetype's declared keys" — a new composition rule for a small win. The win it wants (catching `citty` for `city`) is paid for instead by generating TS types over the substrate, in the editor, before any write. **Do not build the closed form.**
- **Ref-constraint naming.** How `ref(workplace)` names its archetype — id vs closure name — couples to the bootstrap-ID debt; these settle together.
- **Eager vs lazy re-derivation.** Editing an archetype's instance contract invalidates the derived link rows of every instance. Eager (write fan-out on contract edits) vs lazy (rows knowingly stale until each chunk's next write) is the sharpest open engineering decision.
- **Expression normalization.** When two location descriptions count as the same place — for "who references this", and for cache keys. Settles at build.
- **Temporal link queries.** v0.1 offers none; historical bodies remain in the version log, re-derivable if wanted.
- **Mention/fence syntax edges.** The `ol:` scheme's location URIs and the fenced-expression tag settle at `prose` v0.
- **Single owner, until evidence.** One owner per chunk is the law; a real case for shared residence would reopen it.
- **`#` instance sugar** — unruled.
- **Projection of fields as first-class placements** (a standing `explode` beyond the `linked` field) — nothing needs it yet; revisit against a real consumer.
- **Merge semantics — ruled.** Branches diverge freely; merge auto-takes the union of additions and fails hard only on true collision (the same chunk's body or contract changed on both sides). No conflict-resolution machinery in the primitives: an agent resolves a refused merge with existing tooling, committing the reconciliation as ordinary work. Substrate refuses, intelligence resolves. Protocol shape lands with branch ops ([`engine.md`](engine.md), *What Is Open*).
- **Temporal validity.** Event time vs system time is expressible through body keys; whether `valid_from`/`valid_to` deserve first-class status depends on use.
