# SDK — the protocol clients

Two packages, layered along the module structure: **`engine/sdk`** — the engine's protocol expressed as a client library, shipped from the engine's own repository because it *is* the wire contract in TypeScript — and **`view/sdk`** — the web-dom glue and the component adapters, building on it ([`view.md`](view.md) §8 owns the glue's duties; this file owns the wire and the client shapes).

Who imports what: a **VM program** imports `engine/sdk` and speaks the protocol over its stdio transport. A **component** imports nothing global — the glue hands it `ctx` by closure ([`view.md`](view.md) §6, §8); the glue itself is `view/sdk`, a consumer of `engine/sdk`. **`runtime: native`** programs have no executable and never import an SDK — they are the planner. Any other client — the chassis, a browser page, a test — is one more consumer of the same wire.

`engine/sdk` is TypeScript-only for the pilot. First-party VM programs use `#!/usr/bin/env bun` because Bun runs TS directly; the protocol is language-agnostic, the SDK is not — a non-TS SDK is a reimplementation against the JSON lines ([`engine.md`](engine.md), *The Program Protocol*).

This document defines two contracts: **consumer ↔ SDK** (what an author sees when importing) and **SDK ↔ engine** (the wire shapes and flow). Both answer to the engine spec; where they disagree, engine.md is right.

---

## The transport — one object, installed by the environment

**The SDK embeds no transports and detects nothing** [P]. It uses a single object — `send(text)` / `receive(handler)` — found in one place, and **the environment installs it before the SDK loads**: the chassis's init script for a realm, a VM preamble over stdio, a browser page's websocket shim. Provisioning the transport is the surface host's duty ([`chassis.md`](chassis.md), *Hospitality*); a runtime that fits no existing pattern installs its own object, and the SDK never knows the difference.

Requests and responses pair by monotonic `id`; unsolicited events carry an `event` field instead — the SDK demultiplexes by message shape, identically on every transport.

*(Superseded: the module-load transport-selection ladder — pre-set global, wry IPC detection, stdio fallback — and the wry transport's mechanics. The environment installs one object; nothing is detected.)*

## One package, runtime-agnostic

`engine/sdk` exposes typed functions at the package root: `read`, `resolve`, `get`, `readBatch`, `commit`, `run`, `awaitRun`, `cancel`, `subscribe`, plus the local predicate `isPure`. No DOM, no rendering, no framework. (`exit` is retired with surface programs — a VM program exits by exiting.)

The component adapters — `solid()`, `customElement()` — and the glue live in `view/sdk` and are specced with the view family ([`view.md`](view.md) §6, §8). The old React hook library (`host/react`, `useRead`) retires with surface programs; its one load-bearing lesson is kept below (*Subscribe before fetch*).

---

## Boundary translation — three forms of one value

Typed bodies exist in three forms; translation between them is the SDK's job, invisible to consumer code:

- **In hand — native values.** A `ref` key is a `Ref` object (id plus a convenience `get`), `time` is a `Date`, `set` is a `Set`, `markdown` is a string tagged by its type. Consumer code works with real values, never tag envelopes.
- **On the wire — tagged JSON.** Values self-describe. Six tags, and no others:

  ```
  {"$ref":  "chunk_id"}                          a chunk
  {"$loc":  ["chunk_id", …]}                     a place — an intersection of chunks
  {"$set":  [...]}                               an unordered collection
  {"$time": "2026-08-03T…"}                      an instant
  {"$md":   "…"}                                 format-tagged string
  {"$type": {"of": "…", "opt": …, "card": …}}    a reified type term
  ```

- **In the file — plain JSON.** The db stores one JSON text column, byte-identical semantics; the tagged encoding is the stored form.

Tags are what make union checks tag-membership and link-finding contract-free (substrate.md); the engine validates them against instance contracts at commit. Three of the six need saying precisely:

- **`$loc` carries chunk ids, not text.** A `loc` is an intersection of places, so the payload is an array of ids — one id is the place at one chunk. The one place a *normalized location expression* appears as a string is a link's `target`, where a mention names a place rather than a chunk (substrate.md, *Links*).
- **`$set` carries members and nothing else.** `set<T, n>`'s exact cardinality is a contract fact, checked against the instance contract at commit and against an `accepts` entry at the match — never encoded in the value. `list<T, n>` is a plain JSON array under the same rule.
- **`$type` is the reified `type` value kind** — `{of, opt?, card?}` (substrate.md). A program's `accepts` is `list<type>`, so on the wire it is an array of `$type` values, and validation, a draft face, and the tool-schema adapter read the same data.

The SDK encodes on every write and decodes on every read, driven by the tags alone — no contract fetch needed to translate. Schema-driven TS types (payload archetypes as real TypeScript types, generated from their instance contracts) are a later layer on the same encoding ([`view.md`](view.md) §6, *Typed ergonomics*).

---

## Selections on the wire

A **selection** is `list<loc | ref | expr>` — **ordered**, duplicates rejected (substrate.md). It is the type behind a run's boundary, a program's or component's ceiling, a process's frozen argument, a mount's argument, and an offer. On the wire it is an array of tagged terms — **array order is the selection's order** — and needs no tag of its own:

```ts
type LocTerm       = { $loc: ChunkId[] }   // a place; one id is the place at one chunk
type RefTerm       = { $ref: ChunkId }     // a chunk: content, a payload, or an expression
type SelectionTerm = LocTerm | RefTerm
type Selection     = SelectionTerm[]       // ordered; whether order means anything is the consumer's choice
```

**Order is carried by the value; meaning is the consumer's** (substrate.md): the match and a boundary ignore it; the model family reads it as window order. The SDK preserves it and never sorts.

**`$loc` and `$ref` suffice.** An `expr` element is always the chunk form wherever a selection is stored: expressions and payload literals materialize into chunks at composition ([`engine.md`](engine.md), *Plan-form, run-form, and composition*), so the element referencing one is a `$ref`. Inline anonymous expressions live only in prose fences, which are not selections. There is no `$expr` tag, no `$call`, no `$inst`.

**A selection is not a list of roots.** `X` and `[X]` are different offers — the chunk alone, versus the place at X, which carries the chunk *and* what is placed on it. A `ChunkId[]` field can express only the second, and only for one-term places, so every wire field carrying a selection is typed `Selection`. `read`'s and `subscribe`'s `places` stay `ChunkId[]` — they name **one** place, an intersection, not a set of them.

**Selection terms are the one value kind the SDK does not un-tag.** The tag is the discriminant consumer code actually needs — a `$loc` and a `$ref` are different offers — and terms travel between `run`, `resolve`, and a process body unchanged.

**The set is the call.** `program(e1, e2, …)` — the parentheses are the offered set ([`engine.md`](engine.md), *The written language*). `run({ program, argument: [t1, t2, …] })` is that call written in TypeScript. The engine binds each element to the one `accepts` entry it satisfies; unbound optional entries bind from the standing offer ([`engine.md`](engine.md), *The match*).

---

## Resolution modes — frozen or head

A process's argument is frozen at start, but the chunks it references live on. When a program reads through its argument's refs, the SDK resolves **at the stamped commit by default** (`at:` from the process body) — reproducible. Following the **living head** is the deliberate, explicit choice (`{ at: 'head' }`) for programs that want liveness. Same temporal machinery, two honest modes ([`engine.md`](engine.md), *Frozen safety or rolling head*).

**`at` reproduces content, not reach.** Chunks and placements resolve as of the stamped commit; what the boundary *admits* is judged against the structure as it stands now, always, including under `at` (substrate.md, *Boundaries*). "Exactly what the run was given" is a claim about versions, never about admission.

---

## The Substrate Surface

### Reads

```ts
read(places: ChunkId[], opts?: ReadOpts): Promise<ReadResult>
resolve(target: SelectionTerm, opts?: ReadOpts): Promise<ReadResult>
get(chunkId: ChunkId, opts?: GetOpts): Promise<ChunkItem | null>
readBatch(reads: TaggedRead[]): Promise<BatchResult>
```

All wrap engine ops of the same name (`readBatch` → `read_batch`). Errors arrive as rejected Promises typed `EngineError`.

`read` answers at the intersection of the named places. `read([])` with `opts.match_` is a whole-field FTS query; `opts.exclude` subtracts places; `limit` / `offset` / `include: { body: false }` per substrate.md.

`resolve` evaluates one selection term and returns the same `ReadResult` shape: `{ $loc: […] }` resolves the intersection, `{ $ref: … }` evaluates an **expression chunk** — a ref to ordinary content is a `get`, not a `resolve`. This is how an argument element that is an expression reaches its content: the program hands the term straight back, because **programs never interpret expressions**. A chain inside the single-request class costs one db query; a chain containing compute verbs starts real runs first — each passing the `run` wall — so `resolve` returns after those runs complete.

**Filtering is uniform.** Bodies, membership answers, adjacency, links, full-text search **and every count** pass the reader's boundary; there is no privileged view of a full set. *The existence oracle — ruled, accepted for v0.1:* a read the boundary does not admit rejects with `BOUNDARY_VIOLATION` rather than returning empty ([`engine.md`](engine.md), *Boundary-Request Behavior*). Revisit at peering.

`readBatch` resolves tagged sub-queries together at one commit snapshot — per-tag results or per-tag boundary errors — the resolution primitive composed views build on. **Each entry carries its anchor** (ruled; [`engine.md`](engine.md), *The call context*): the glue coalescing reads for many mounts authorizes each entry as its mount, so embedding never escalates.

### Writes

```ts
commit(declaration: Declaration): Promise<Commit>
commit(declaration: Declaration, opts: { dryRun: true }): Promise<{ valid: boolean, errors: EngineError[] }>
```

One-shot atomic write through the engine, routed to the owning store. The engine validates against the caller's boundary and substrate's placement and link governance; rejected writes throw `BOUNDARY_VIOLATION` or `VALIDATION_ERROR`. A declared chunk carrying no `owned` placement is created owned by the calling process — the frame default; under a bare anchor there is no frame, and the declaration names each owner ([`engine.md`](engine.md), *The call context*). `dryRun` runs full validation without writing — the live-form affordance editors build on.

### Process control

```ts
run(args: RunArgs): Promise<{ process: ProcessId }>
awaitRun(processIds: ProcessId[]): Promise<Record<ProcessId, ChunkItem>>
cancel(processId: ProcessId): Promise<void>
```

`run` starts a process — a program plus an offered argument, or a draft to consume, exactly one of the two — and returns the process id immediately. `RunArgs.mode` selects `'child'` (default — composed work, owned by the caller, cancellation cascades) or `'launch'` (detached — owned by the **configured owner**, survives the caller; the pilot desktop configures its session — [`engine.md`](engine.md), *Two modes*).

**What the mode decides.** Ownership carries naming and containment and nothing else, so residence confers no reach either way: both modes are capped by the caller's own boundary, and `launch` never escalates. The mode picks **address and lifetime**. The cascade is the engine's own process tree, engine state rather than a reach claim.

`awaitRun` resolves when each named process reaches a terminal state and **returns the process chunk itself** — status and `result` ref in the body, the result one `get` away. `cancel` is authorized for descendants in the engine's process tree or targets within the caller's write boundary; idempotent; cancel of a draft is deny. (`awaitRun` is named to dodge `await`, a reserved word; the engine op is `await`.)

### Derived predicates

Purity is derived, never declared ([`engine.md`](engine.md), *Purity*), so a badge computes instead of trusting:

```ts
isPure(program: ChunkItem): boolean
```

A local function over a program chunk — no transport, no engine call. It reads the two legs that hold at **definition**: an effective write of `{}` (the `write` key absent — which now *means* `{}` — or present and empty, with no `caller` term), and no `capabilities`. The other two legs are start-time engine checks a client cannot pre-judge. So `false` is final; `true` means *pure as declared, subject to the engine's start-time refusals*. A `pure:` flag could only agree or lie, which is why none exists.

### Reactivity

```ts
type SubEvent =
  | { kind: 'changed', commit: Commit }
  | { kind: 'lagged' }
  | { kind: 'invalid', reason: string }

subscribe(places: ChunkId[], callback: (event: SubEvent) => void): () => void
```

Imperative subscription. The callback receives `{ kind: 'changed', commit }` per `place_changed` (re-fetch via `read`); `{ kind: 'lagged' }` when the engine's channel overflowed (re-fetch to recover — the wire event lists affected subscription ids; the SDK fires only those callbacks); `{ kind: 'invalid', reason }` when the engine invalidated the subscription — a subscribed place fell out of what the boundary admits; the subscription is dead. The returned thunk unsubscribes; calling it after `invalid` is a no-op.

**Subscribe before fetch — load-bearing ordering.** Any consumer pairing `subscribe` with `read` — the glue included ([`view.md`](view.md) §8) — must register the subscription *first*, then fetch. Reversed, a commit landing between fetch and subscribe is reflected in neither. With subscribe first, a commit in the gap produces an event (queued during the in-flight fetch) and the re-fetch supersedes the initial state. The cost is at most one extra fetch per mount; there is no lost-event window.

**Why re-fetch on every event** rather than apply the commit as a delta: single source of truth lives in the substrate; the SDK never derives state from events. The `commit` payload is available for delta optimization in custom uses; the default discards it.

---

## Types

TS mirror of the wire — same field names, same semantics; the Rust source is authoritative (codegen is on the open list). Field-level detail for read and declaration shapes lives in [`db.md`](db.md); this is the wire projection.

```ts
type ChunkId   = string
type CommitId  = string
type ProcessId = ChunkId   // a process is a chunk

// — tagged values —

type LocTerm       = { $loc: ChunkId[] }
type RefTerm       = { $ref: ChunkId }
type SelectionTerm = LocTerm | RefTerm
type Selection     = SelectionTerm[]       // ordered

type TypeTerm = { $type: { of: string, opt?: boolean, card?: number } }

// — field shapes —

type ChunkItem = {
  id: ChunkId
  name?: string
  instance?: Instance
  seq?: boolean          // legal only on an archetype: its instances are ordered
                         // places (substrate.md, *Ordered places*). Owed db-side —
                         // db.md carries no physical home for it yet.
  body?: Record<string, unknown>
  placements?: Placement[]
}

type Instance = Record<string, string>  // the flat instance contract — key → type
                                        // expression ("string", "ref(workplace)",
                                        // "set<ref(commit), 2>", "selection", …)

type Placement = {
  on: ChunkId
  kind: 'owned' | 'instance' | 'relates'
  seq?: number
}

type Link = {
  source_id: ChunkId
  target: ChunkId | string        // chunk id, or normalized location expression
  kind: 'field' | 'mention'
  key?: string                    // declaring key when kind = 'field'
}

// — writes —

type Declaration = {
  chunks: ChunkDeclaration[]
  placements: PlacementSpec[]   // bare placements — no chunk content change
  message?: string
}

type ChunkDeclaration = {
  id?: ChunkId                   // omitted = generated
  name?: string
  instance?: Instance
  seq?: boolean
  body?: Record<string, unknown>
  placements?: PlacementSpec[]   // chunk-bound; `chunk_id` implied
  removed?: boolean              // logical removal — history retains everything
}

type PlacementSpec = {
  chunk_id?: ChunkId             // implied inside a ChunkDeclaration
  on: ChunkId
  kind: 'owned' | 'instance' | 'relates'
  seq?: number                   // honored where the place is ordered; omitted = max + 1
  active?: boolean               // false removes the placement (default true)
}

// — reads —

type ReadOpts = {
  branch?: string
  at?: CommitId
  match_?: string
  exclude?: ChunkId[]   // negation — set difference over any stored kind;
                        // a subtracted place is boundary-checked like a positive one
  limit?: number        // tail-first where the place is ordered; offset pages backward
  offset?: number
  include?: Includes    // { body: false } = survey read, no bodies
}

type GetOpts = {
  branch?: string
  at?: CommitId         // temporal point lookup
  include?: Includes
}

type Includes = { body?: boolean }   // the wire subset of db's Includes

type ReadResult = {
  head: CommitId
  unresolved?: ChunkId[]   // roots resolving in no attached store (federated
                           // intersection, engine.md) — dead references as
                           // metadata, not error; optional because the engine
                           // wire does not carry it yet (the db does)
  total: number            // every count describes what the boundary admits
  in_place: number
  in_place_owned: number
  in_place_instance: number
  in_place_relates: number
  chunks: ChunkItem[]
  linked: Link[]           // fields and mentions pointing at the roots — derived,
                           // never mixed with placements
  dimensions: Dim[]        // places you can add to narrow
}

type Dim = {
  id: ChunkId
  name?: string
  count: number
  owned: number
  instance: number
  relates: number
  edges?: Edge[]           // db-level opt-in, not wire-reachable in v0.1
}

type Edge = { id: ChunkId, name?: string, count: number, owned: number, instance: number, relates: number }

type Commit = {
  id: CommitId
  parent_id?: CommitId
  timestamp: string
  message?: string
  process_id?: ProcessId   // which run caused this commit; absent for machine-context commits
  branch: string
  chunks_modified: ChunkId[]
  placements_modified: [ChunkId, ChunkId][]
  links_modified: ChunkId[]  // chunks whose inbound links changed this commit
}

// — process control —

type RunArgs = {
  program?: ChunkId          // with `argument`: a direct start
  argument?: Selection       // the offered set — elements tagged $loc | $ref
  draft?: ProcessId          // the other form: consume an existing draft process
  mode?: 'child' | 'launch'
  read?: Selection           // explicit additions — one of the five boundary sources
  write?: Selection
  run?: Selection            // additions to the run wall — the toolset
  timeout_ms?: number
}

type TaggedRead =
  | { tag: string, anchor?: ChunkId, places: ChunkId[], opts?: ReadOpts }
  | { tag: string, anchor?: ChunkId, chunkId: ChunkId, opts?: GetOpts }
  // anchor: the conforming chunk this entry is authorized under (the call
  // context); absent = the connection's own context

type BatchResult = {
  head: CommitId             // the one snapshot every sub-query resolved at
  results: Record<string, ReadResult | ChunkItem | null | EngineError>
}

type EngineError = {
  code: 'BOUNDARY_VIOLATION' | 'READ_ONLY_ATTACH' | 'VALIDATION_ERROR'
      | 'NOT_FOUND' | 'RUN_FAILED' | 'INVALID_REQUEST' | 'TRANSPORT_CLOSED'
  message: string
}
```

`RunArgs` keeps `program + argument` and `draft` as flat optional fields because the wire is flat; exactly one form must be present. **`RunArgs` is the program-facing projection of the engine's**: one engine field is absent by design — `placements`, the extra places the new process is `instance` on, is supplied by the launching environment (the configured owner), never by a program. **Grants are selections**: `read` / `write` / `run` carry `Selection`, recorded verbatim as boundary expressions and intersected with the caller's own at start — one of the five sources, never the whole boundary.

*Open — one encoding for type terms, or two.* A program's `accepts` rides the wire as `$type` values, while an instance contract is typed here — and in db.md — as a map of type-expression **strings**. Both carry the same closed vocabulary; which encoding the stored `instance` column holds is unreconciled. The SDK mirrors db's string form until it is.

---

## view/sdk — the glue and the adapters

Specced with the view family ([`view.md`](view.md) §6, §8); stated here only as a package: `view/sdk` ships the `web-dom` glue (boot, resolve, subscribe, dispatch, input, ephemera) and the adapters (`solid()`, `customElement()`), depends on `engine/sdk`, and holds **no global**: `ctx` reaches components by closure, which is the isolation ruling — a mount's identity binds per mount, not per module instance, dissolving the old per-seat-token question. Identity into isolated realms (`FrameBox`) is the chassis's injection ([`chassis.md`](chassis.md), *Hospitality*); commits attribute to the context the engine receives, and a parent can never speak as its child.

---

## Code architecture

```
engine/sdk/                                   — the protocol client
  src/
    index.ts              — public re-exports of the substrate surface
    globals.d.ts          — the one ambient global: the installed transport object
    types.ts              — TS mirror of the wire types
    values.ts             — boundary translation: native values ⇄ tagged encoding;
                            selection terms, which stay tagged; Ref class
    protocol.ts           — Request | Response | Event shapes; id counter;
                            shape-based demultiplexing
    surface.ts            — read, resolve, get, readBatch, commit, run, awaitRun,
                            cancel
    purity.ts             — isPure over a program chunk: the definition-time legs
    subscriptions.ts      — subscribe, registry, event router
    transport.ts          — the one transport object's interface; fails loudly
                            when the environment installed none
  test/
    values.test.ts        — the tagged encoding round-trips, selections included
    surface.test.ts       — surface against a mock transport

view/sdk/                                     — the glue + adapters (view.md §8)
  src/  glue/ (boot, resolve, subscribe, dispatch, input, ephemera) · adapters/
        (solid.ts, custom-element.ts) · faces wiring
```

Each file owns a topic; predictable shape inside. What earns a comment (per [`conventions.md`](../conventions.md#code)): the shape-based response/event distinguisher, the per-entry anchor on `readBatch`, subscribe-before-fetch, the invalid-subscription dead-end.

---

## What Is Open

- **The connection encoding** — how a client's connection is established and identified on each transport flavor (chassis realm, VM stdio, browser socket); carried from the brief's web-dom opens.

- **The slot-drop interface's exact shape** — the drag layer's `dropAt(point) → (field, index)` contract ([`view.md`](view.md) §8, directional); post-pilot with the drag layer, its wire shape lands here.

*Not carried:* the future React hooks (`useCommit`, `useRun`, `useSubscribe`) — retired with `host/react`; whatever helpers components need arrive as adapter conveniences in `view/sdk`, by use.

- **The existence oracle** — `BOUNDARY_VIOLATION` versus a silently empty read; the engine's call, surfaced here.

- **One encoding for type terms, or two** (*Types*).

- **The error channel for glue-driven reads** — the old `useRead` open, re-homed: a refused read must be distinguishable from loading where a component's fault face depends on it ([`view.md`](view.md) §7).

- **Type generation.** TS types are a hand-maintained mirror today; a codegen step from the Rust source would keep them in sync — and the same generator produces payload-archetype types that catch a mistyped body key before any write.

- **Non-TS clients.** The protocol is JSON lines; an SDK is a reimplementation in any language. The first non-TS port is a known horizon target.

- **Streaming intra-op results** — settled engine-side as a convention (throttled partial commits, coalesced events, re-fetch); intra-op streaming stays out of the protocol. Recorded here so no client invents one.
