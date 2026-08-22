# SDK

The SDK is the surface programs import to reach the substrate. It hides protocol mechanics, transport selection, and subscription tracking behind a small set of typed functions. The SDK has no rendering concerns — programs render via whatever DOM library they choose (React, Solid, vanilla); the SDK only mediates substrate operations and capabilities.

Three runtime kinds exist ([`engine.md`](engine.md)); two of them spawn programs that import an SDK. Both use the same surface — only the transport differs.

- **Surface programs** — `runtime: 'webview'`. A JS module the shell seats inside the window's one shell document ([`chassis.md`](chassis.md)). The runtime is that webview's V8: full DOM, full browser APIs, full client-side React, 60fps interactions. The SDK reaches the engine over wry IPC.
- **VM programs** — `runtime: 'vm'`. An executable file with a shebang the host's VM provider spawns inside the Linux VM. The shebang declares the interpreter (`#!/usr/bin/env bun`, `#!/usr/bin/env python`) — the runtime kind doesn't bind to one language. Any interpreter in the VM that speaks the JSON-lines protocol over stdio works.
- **`runtime: 'native'`** programs — the read-native pipe verbs — have no executable and never import an SDK. They *are* the planner; the engine registers itself as their provider.

This SDK is TypeScript-only for the pilot. First-party VM programs (agent, tools) use `#!/usr/bin/env bun` because Bun runs TS directly and lets them import this SDK. Programs in other languages can be added when an SDK exists for them; the protocol is language-agnostic, the SDK is not.

The protocol shape is settled in [`engine.md`](engine.md#the-program-protocol). For why the runtime path is split rather than unified — and what's deferred — see [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md).

This document defines two contracts:

- **Consumer ↔ SDK.** What a program author sees when importing.
- **SDK ↔ engine.** The protocol JSON shape, request/response/event flow, transport mechanics.

Both answer to the engine spec. Where they disagree, engine.md is right.

---

## One package, runtime-agnostic

The SDK ships as one package: **`@openlight/sdk`**. Functions only: `read`, `resolve`, `get`, `readBatch`, `commit`, `run`, `awaitRun`, `cancel`, `exit`, `subscribe`, plus the local predicate `isPure`. No DOM, no React, no rendering. Imports cleanly in any JS/TS runtime — webview, Bun, future runtimes — because transport is a runtime concern, not the SDK's.

The SDK lives in the engine crate (`engine/sdk/`) — it IS the engine's protocol expressed as TypeScript, so it ships where the protocol lives. Future capability surfaces (fs, network) eventually land here the same way: typed functions over the IPC bridge.

React helpers (`useRead`, future `useCommit`, `useRun`, `useSubscribe`) are not part of the SDK — they're a separate UI library, `@openlight/react`, shipped from `host/react/` (because they're coupled to surface programs the shell seats). Surface programs that render React import the SDK *and* the UI library; VM programs only import the SDK. Non-TS clients eventually exist by reimplementing the SDK against the JSON-lines protocol — they don't see the UI library at all.

---

## Boundary translation — three forms of one value

Typed bodies exist in three forms; translation between them is the SDK's job, invisible to program code:

- **In hand — native values.** A `ref` key is a `Ref` object (id plus a convenience `get`), `time` is a `Date`, `set` is a `Set`, `markdown` is a string tagged by its type. Program code works with real values, never tag envelopes.
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

- **`$loc` carries chunk ids, not text.** A `loc` is an intersection of places, so the payload is an array of ids — one id is the place at one chunk. The engine's own wire and its `SelectionTerm::Loc(Vec<ChunkId>)` agree. The one place a *normalized location expression* appears as a string is a link's `target`, where a mention names a place rather than a chunk (substrate.md, *Links*).
- **`$set` carries members and nothing else.** `set<T, n>`'s exact cardinality is a contract fact, checked against the instance contract at commit and against an `accepts` entry at the match — never encoded in the value. `list<T, n>` is a plain JSON array under the same rule.
- **`$type` is the reified `type` value kind** — `{of, opt?, card?}` (substrate.md, *Archetypes and Contracts*). A program's `accepts` is `list<type>`, so on the wire it is an array of `$type` values, and validation, a seated argument, and the tool-schema adapter read the same data.

The SDK encodes on every write and decodes on every read, driven by the tags alone — no contract fetch needed to translate. Schema-driven TS types (a program's payload archetypes as real TypeScript types, generated from their instance contracts) are a later layer on the same encoding.

---

## Selections on the wire

A **selection** is `list<loc | ref | expr>` — ordered, duplicates rejected (substrate.md, *Archetypes and Contracts*). It is the type behind a run's boundary, a program's stated ceiling, a process's frozen argument, a collation's members, and a seat's offer. On the wire it is an array of tagged terms — array order *is* the selection's order — and needs no tag of its own:

```ts
type LocTerm       = { $loc: ChunkId[] }   // a place; one id is the place at one chunk
type RefTerm       = { $ref: ChunkId }     // a chunk: content, a payload, or an expression
type SelectionTerm = LocTerm | RefTerm
type Selection     = SelectionTerm[]       // a set — order carries nothing
```

**`$loc` and `$ref` suffice.** An `expr` element is always the chunk form wherever a selection is stored: expressions and payload literals materialize into chunks at composition ([`engine.md`](engine.md), *Plan-form, run-form, and composition*), so the element referencing one is a `$ref`. Inline anonymous expressions live only in prose fences, which are not selections. There is no `$expr` tag, no `$call`, no `$inst`.

**A selection is not a list of roots.** `X` and `[X]` are different offers — the chunk alone, versus the place at X, which carries the chunk *and* what is placed on it. A `ChunkId[]` field can express only the second, and only for one-term places, so every wire field carrying a selection is typed `Selection`: `RunArgs.argument`, `RunArgs.read`, `RunArgs.write`, and the process body's `argument` / `read` / `write` keys.

`read`'s and `subscribe`'s `places` stay `ChunkId[]` — they name **one** place, an intersection, not a set of them. A one-element `places` array and a one-term `$loc` are the same request.

**Selection terms are the one value kind the SDK does not un-tag.** The tag is the discriminant program code actually needs — a `$loc` and a `$ref` are different offers, and the two are never the same element — and terms travel between `run`, `resolve`, and a process body unchanged. Decoding them into two native shapes would only re-invent the tag.

**The set is the call.** `program(e1, e2, …)` — the parentheses ARE the offered set, varargs, positions meaningless ([`engine.md`](engine.md), *The written language*). `run({ program, argument: [t1, t2, …] })` is that call written in TypeScript: the array is a set, and the SDK neither orders nor positions its terms. The engine binds each element to the one `accepts` entry it satisfies — tag membership, then per-tag shape or instance placement ([`engine.md`](engine.md), *The match*).

Order is not semantic anywhere a selection appears. The one ordered thing nearby is not a selection: a collation's `selections: list<selection>` is an ordered list *of* selections.

*Owed engine-side, not taken here.* [`engine.md`](engine.md#engine-api-callable-from-the-host)'s Rust surface still carries two types where the law now has one — `SelectionTerm { Loc, Expr }` beside `ArgElement { Loc, Ref }` — although an argument **is** a selection, precisely and with nothing left over, and `ref` is an admitted element of both. The wire has the single shape above.

---

## Resolution modes — frozen or head

A process's argument is frozen at start, but the chunks it references live on. When a program reads through its argument's refs, the SDK resolves **at the stamped commit by default** (`at:` from the process body) — reproducible. Following the **living head** is the deliberate, explicit choice (`{ at: 'head' }`) for programs that want liveness — the reader following its reading is this, plus a subscription. Same temporal machinery, two honest modes ([`engine.md`](engine.md), *Frozen safety or rolling head*).

**`at` reproduces content, not reach.** Chunks and placements resolve as of the stamped commit; what the boundary *admits* is judged against the structure as it stands now, always, including under `at` (substrate.md, *Boundaries*). So a chunk since placed on a walled dimension drops out of a temporal read too — which is what remediation requires — and one since removed from a walling dimension appears in it. "Exactly what the run was given" is a claim about versions, never about admission.

---

## The Substrate Surface

`@openlight/sdk` exposes typed functions at the package root.

### Reads

```ts
read(places: ChunkId[], opts?: ReadOpts): Promise<ReadResult>
resolve(target: SelectionTerm, opts?: ReadOpts): Promise<ReadResult>
get(chunkId: ChunkId, opts?: GetOpts): Promise<ChunkItem | null>
readBatch(reads: TaggedRead[]): Promise<BatchResult>
```

All wrap engine ops of the same name (`readBatch` → `read_batch`). Errors arrive as rejected Promises typed `EngineError`.

`read` answers at the intersection of the named places. `read([])` with `opts.match_` is a whole-field FTS query; `opts.exclude` subtracts places; `limit` / `offset` / `include: { body: false }` per substrate.md (*Pagination and projection*).

`resolve` evaluates one selection term and returns the same `ReadResult` shape: `{ $loc: […] }` resolves the intersection, `{ $ref: … }` evaluates an **expression chunk** — the engine's `ResolveTarget` is that narrower pair, so a ref to ordinary content is a `get`, not a `resolve`. This is how an argument element that is an expression reaches its content: the program hands the term straight back, because **programs never interpret expressions** ([`engine.md`](engine.md), *Expressions*). A chain inside the single-request class costs one db query; a chain containing compute verbs starts real program runs first, so `resolve` can take as long as the runs it triggers.

**Filtering is uniform.** Bodies, membership answers, adjacency, links, full-text search **and every count** pass the reader's boundary. `total` and the `in_place_*` counts describe what your boundary admits, exactly as `linked` and `dimensions` do — there is no privileged view of a full set (substrate.md, *Boundaries*). A program probing shape before pulling data is probing its own shape.

*The existence oracle — ruled, accepted for v0.1.* A read the boundary does not admit rejects with `BOUNDARY_VIOLATION` rather than returning empty; the disclosure this implies is accepted while dbs are single-author and mounts chosen ([`engine.md`](engine.md), *Boundary-Request Behavior*). Revisit at peering.

`readBatch` resolves tagged sub-queries together at one commit snapshot — per-tag results or per-tag boundary errors — and is the resolution primitive slot-and-hook providers build on ([`view.md`](view.md) §8).

*Per-sub-query identity — ruled.* Each `read_batch` entry carries its identity token on the wire; `TaggedRead` gains the field, and a provider coalescing hooks from several citizens authorizes each entry as its citizen — *embedding never escalates* holds ([`engine.md`](engine.md), *The Program Protocol*).

### Writes

```ts
commit(declaration: Declaration): Promise<Commit>
commit(declaration: Declaration, opts: { dryRun: true }): Promise<{ valid: boolean, errors: EngineError[] }>
```

One-shot atomic write through the engine. The engine validates against the program's write boundary and against substrate's placement and link governance ([`engine.md`](engine.md), *Governance at `commit`*); rejected writes throw `BOUNDARY_VIOLATION` or `VALIDATION_ERROR`. A declared chunk carrying no `owned` placement is created owned by the calling process — the frame default, so the common case declares nothing. `dryRun` runs full validation without writing — the live-form affordance editors build on.

### Process control

```ts
run(args: RunArgs): Promise<{ process: ProcessId }>
awaitRun(processIds: ProcessId[]): Promise<Record<ProcessId, ChunkItem>>
cancel(processId: ProcessId): Promise<void>
exit(): Promise<void>
```

`run` starts a process — a program plus an offered argument **set**, or a draft to consume, exactly one of the two — and returns the process id immediately. `RunArgs.mode` selects `'child'` (default — composed work, owned by the caller, cancellation cascades) or `'launch'` (detached — owned by the session, survives the caller).

**What the mode decides, now that ownership is one hop.** Ownership carries naming and containment and nothing else (substrate.md, *Five Connection Kinds*), so residence confers no reach either way: both modes are capped by the caller's own boundary, and `launch` never escalates. The mode picks **address and lifetime** — which dimension the process is a member of (the caller's frame, or the session, which is what makes launched work sidebar-visible) and whether it dies with its starter. The cascade is the engine's own process tree, engine state rather than a reach claim ([`engine.md`](engine.md), *Cleanup on terminal state*).

`awaitRun` resolves when each named process reaches a terminal state and **returns the process chunk itself** — status and `result` ref in the body, the result one `get` away. `cancel` is authorized for descendants in the engine's process tree or for targets within the caller's write boundary; idempotent. `exit` requests the calling program's own terminal transition — the surface self-dismissal path.

`awaitRun` is named to dodge `await` (a TypeScript reserved word). The engine method is `await_processes`.

### Derived predicates

Purity is derived, never declared ([`engine.md`](engine.md), *Purity*), so a badge computes instead of trusting:

```ts
isPure(program: ChunkItem): boolean
```

A local function over a program chunk — no transport, no engine call. It reads the two legs that hold at **definition**: `write` present and empty (one key covers every channel, since static locs and argument references live in it), and no `capabilities`. The other two legs are start-time engine checks a client cannot pre-judge — no start-time write additions to a pure program, and a pure program may not start an impure one. So `false` is final; `true` means *pure as declared, subject to the engine's start-time refusals*. A `pure:` flag could only agree or lie, which is why none exists.

### Reactivity

```ts
type SubEvent =
  | { kind: 'changed', commit: Commit }
  | { kind: 'lagged' }
  | { kind: 'invalid', reason: string }

subscribe(places: ChunkId[], callback: (event: SubEvent) => void): () => void
```

Imperative subscription. The callback receives:
- `{ kind: 'changed', commit }` for each `place_changed` event — re-fetch via `read`.
- `{ kind: 'lagged' }` when the engine's input channel overflowed and this subscription may have missed events — re-fetch to recover.
- `{ kind: 'invalid', reason }` when the engine has invalidated and unsubscribed this subscription: a subscribed place fell out of what the process's boundary admits — the expression is frozen, membership through it is live. No further events will come; the subscription is dead.

The wire `lagged` event carries `subscriptionIds: string[]` — the SDK matches those against its registered subscriptions and fires `{ kind: 'lagged' }` only on the affected callbacks. Subscribers without an id in the list see nothing.

The returned thunk unsubscribes. Calling it after a `kind: 'invalid'` is a no-op (subscriptions are already gone server-side).

---

## React helpers (in `host/react/`)

The host's UI library exposes React hooks built on `@openlight/sdk`. v0.1 ships one:

```ts
useRead(places: ChunkId[], opts?: ReadOpts): ReadResult | undefined
```

**Contract.** On mount and on every dependency change: register a `subscribe` first, *then* fetch initial state via `read`, re-fetch on every `place_changed` or `lagged` event, unmount → unsubscribe. The hook returns the latest fetched result; `undefined` until the first fetch resolves. On `subscription_invalid`, the hook stops re-fetching and returns `undefined` — the subscription is dead, the data is gone.

**Subscribe-before-fetch ordering.** The order is load-bearing: subscribe first, then fetch. If the order were reversed, a commit landing between the fetch and the subscribe would not be reflected in either — the fetch read state before it, and the subscription registered after the broadcast had already fired. With subscribe first, any commit between subscribe and fetch produces an event the SDK receives (queued during the in-flight fetch); the subsequent re-fetch supersedes the initial fetch and reflects the new state. The cost is at most one extra fetch per mount; there is no lost-event window. Any imperative caller using `subscribe` + `read` together must follow the same ordering.

*Open — no error channel.* `useRead` returns `ReadResult | undefined`, and `undefined` is its only failure form — a refused read (`BOUNDARY_VIOLATION`) is indistinguishable from loading. The reader's inline-error pin ([`components.md`](components.md), table) is unreachable for reads until this closes.

**Why re-fetch every event** rather than apply the event's `commit` payload as a delta. Single source of truth lives in the substrate; the SDK never derives state from events. The `commit` payload is available to the callback for delta optimization in custom uses, but the default discards it.

Future hooks land here as patterns emerge from real programs.

---

## Types

TS mirror of substrate library types — same field names, same semantics. The Rust source is authoritative; the TS file is hand-maintained to match. (Codegen from the Rust source is on the open list.) Field-level detail for the read and declaration shapes has its home in [`db.md`](db.md); this is the wire projection of it.

```ts
type ChunkId   = string
type CommitId  = string
type ProcessId = ChunkId   // a process is a chunk

// — tagged values —

type LocTerm       = { $loc: ChunkId[] }
type RefTerm       = { $ref: ChunkId }
type SelectionTerm = LocTerm | RefTerm
type Selection     = SelectionTerm[]

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
                                        // "set<ref(commit), 2>", "map<T>",
                                        // "selection", "markdown", …; `?` and
                                        // `unique` inline)

type Placement = {
  on: ChunkId
  kind: 'owned' | 'instance' | 'relates'   // the old type/type_ wire asymmetry
  seq?: number                             // died with the rename
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
  exclude?: ChunkId[]   // negation — set difference over any stored kind (owned,
                        // instance, relates); a subtracted place is boundary-checked
                        // like a positive one
  limit?: number        // tail-first where the place is ordered — i.e. its archetype
  offset?: number       // carries `seq: true`: latest entries by default, offset
                        // pages backward, the window itself ascending by seq
  include?: Includes    // { body: false } = survey read, no bodies
}

type GetOpts = {
  branch?: string
  at?: CommitId         // temporal point lookup
  include?: Includes
}

type Includes = { body?: boolean }   // the wire subset of db's Includes; the other
                                     // db-level flags stay behind the engine

type ReadResult = {
  head: CommitId
  unresolved?: ChunkId[]   // roots resolving in no mount (federated intersection,
                           // engine.md) — dead references as metadata, not error;
                           // optional because the engine wire does not carry it
                           // yet (the db does — recorded, ahead of the wire)
  total: number            // every count describes what the boundary admits —
  in_place: number         // bodies, membership, adjacency, links, FTS and counts
  in_place_owned: number   // are filtered alike, and there is no privileged view
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
  count: number            // intersection chunks placed here
  owned: number
  instance: number
  relates: number
  edges?: Edge[]           // places this dim reaches beyond current adjacency;
                           // db-level opt-in, not reachable through the wire
                           // `Includes` subset in v0.1
}

type Edge = {
  id: ChunkId
  name?: string
  count: number
  owned: number
  instance: number
  relates: number
}

type Commit = {
  id: CommitId
  parent_id?: CommitId
  timestamp: string
  message?: string
  process_id?: ProcessId   // which run caused this commit; absent for host-initiated commits
  branch: string           // which branch it landed on — the event's only carrier
  chunks_modified: ChunkId[]
  placements_modified: [ChunkId, ChunkId][]
  links_modified: ChunkId[]  // chunks whose inbound links changed this commit
}

// — process control —

type RunArgs = {
  program?: ChunkId          // with `argument`: a direct start
  argument?: Selection       // the offered set — elements tagged $loc | $ref
  draft?: ProcessId          // the other form: consume an existing draft process
  mode?: 'child' | 'launch'  // child (default): owned by the caller, cascades;
                             // launch: owned by the session, survives the caller
  read?: Selection           // explicit additions — one of five boundary sources
  write?: Selection
  timeout_ms?: number
}

type TaggedRead =
  | { tag: string, places: ChunkId[], opts?: ReadOpts }
  | { tag: string, chunkId: ChunkId, opts?: GetOpts }

type BatchResult = {
  head: CommitId             // the one snapshot every sub-query resolved at
  results: Record<string, ReadResult | ChunkItem | null | EngineError>
}

type EngineError = {
  code: 'BOUNDARY_VIOLATION' | 'READ_ONLY_MOUNT' | 'VALIDATION_ERROR'
      | 'NOT_FOUND' | 'RUN_FAILED' | 'INVALID_REQUEST' | 'TRANSPORT_CLOSED'
  message: string
}
```

`RunArgs` keeps `program + argument` and `draft` as flat optional fields because the wire is flat; exactly one form must be present. The engine's `RunTarget` is the same choice as a sum type ([`engine.md`](engine.md#engine-api-callable-from-the-host)).

**`RunArgs` is the program-facing projection of the engine's `RunArgs`.** One engine field is absent by design: `placements` — the extra places the new process is `instance` on — is supplied by the host (the session), not by a program. And **grants are selections**: `read` / `write` carry `Selection`, are recorded verbatim as the process body's `read` / `write` expressions, and are intersected with the caller's own boundary at start. They are one of the five boundary sources, never the whole boundary ([`engine.md`](engine.md), *Boundaries*).

*Open — one encoding for type terms, or two.* A program's `accepts` is `list<type>` and rides the wire as `$type` values, while an instance contract is typed here — and in [`db.md`](db.md) — as a map of type-expression **strings**. Both carry the same closed vocabulary, and substrate.md's *type terms are themselves data* argues for one form. Which encoding the stored `instance` column holds is unreconciled; the SDK mirrors db's string form until it is.

Ambient globals a runtime installs — `window.__wry_ipc`, `window.__sdk`, `window.__openlight_process`, `globalThis.__openlight_transport` — are typed in one home, the SDK's `globals.d.ts`; no package re-declares them. `window.__openlight_process` is set for **whole-document** programs only (the shell, an iframe citizen); a same-DOM seat takes its process identity from the seat that mounted it ([`chassis.md`](chassis.md), *Authoring Programs*).

---

## Transports

The SDK selects a transport at module-load time. Order:

1. **Pre-set:** if `globalThis.__openlight_transport` is set, use it. Future runtimes that don't fit the auto-detected patterns inject a transport here before the SDK loads.
2. **Webview:** if `window.__wry_ipc` is present, use the wry transport.
3. **VM:** if `process.stdin` is present, use the stdio transport.
4. Otherwise: throw — no transport detected.

Both built-in transports surface the same internal `Transport` shape (`send(req): Promise<Response>` and `onEvent(handler)`), so the op functions in the surface module remain transport-agnostic.

### Webview transport

The SDK posts requests through `window.__wry_ipc.postMessage(<json>)`. The host's IPC handler parses the JSON, maps the request's identity token to a process id, attaches the calling process's `Context`, calls the engine, and resolves by injecting `evaluate_script("__sdk.resolve(<id>, <payload>)")` — `<payload>` is the full response envelope, so shape-based demultiplexing holds on both channels. Events ride the same channel in the other direction via `__sdk.event(<payload>)`. The SDK demultiplexes by message shape: `id + result|error` is a response, an `event` field is unsolicited.

The `__sdk` global on the webview side is the SDK's hook surface — a small object the host calls to deliver responses and events. The host's routing only knows the function names.

**One realm, many identities.** The window holds one webview and one document, and every seated program is its own process ([`engine.md`](engine.md#containment)). Each seat's SDK instance holds the identity token issued at seat creation and stamps it on every request, so boundaries and commit attribution hold at seat granularity — a slot is a seat at the finest altitude ([`view.md`](view.md) §3). **How the token reaches the seat differs by containment tier and is [`chassis.md`](chassis.md)'s** (*Transport*): a same-DOM seat's token rides the parent's channel, which the tier's shared fate makes honest; an iframe citizen's is injected by the host directly, because a parent that handled the token could commit history *as* its citizen.

*The citizen's return path — ruled.* Delivery is **host-direct in both directions**: responses and events are evaluated against the seat's own context — an iframe citizen's origin document directly, the shell document only for same-DOM seats — so a parent may gate a citizen but never read, drop, or forge its traffic ([`engine.md`](engine.md#reactivity-wiring), step 4). The SDK's demultiplexer is identical either way.

*Open — identity under a shared module instance.* Transport selection happens at module load, and a module-global identity token is sound only where one realm holds one process — a VM program, the shell, an iframe citizen. Same-DOM seats share a realm, and chassis.md's *shell-injected shared runtime* would have them share one SDK module instance as well; identity would then have to bind per seat rather than at module load. The shape settles with the slot protocol ([`view.md`](view.md) §9, declared open).

### VM transport

The SDK writes requests as JSON lines to stdout. The engine spawned the program inside its VM and reads its stdout; the engine writes responses and events as JSON lines to the program's stdin. The SDK reads stdin line-by-line, demultiplexing the same way as the webview transport.

VM programs run inside their own VM. Their fs/network/shell access is whatever the interpreter gives them there, gated by the program's declared capabilities — enforced by the runtime provider at spawn — and by the engine's boundary at every substrate op.

### What the SDK does not do

The SDK does not render, and it assumes nothing about the page. Where a program's DOM goes differs by seat ([`chassis.md`](chassis.md), *Serving `ol://`*):

- A **whole-document** program — the shell, an iframe citizen — is served an empty document and mounts `document.body`: `createRoot(document.body).render(<App />)` directly, no SDK wrapper.
- A **same-DOM seat** gets no document. The shell hands the program a root element and imports its entry into the shared realm; the program mounts what it is given.
- **VM programs** have no DOM and don't render at all.

---

## Subscription lifecycle

The SDK keeps an internal registry mapping each `subscriptionId` (returned by the engine's `subscribe` op) to its callback, and demultiplexes incoming events to the right callback by id. The returned thunk removes the entry and calls the engine's `unsubscribe`. Engine-side mechanics — the boundary check at registration, the `subscriptionId`, auto-drop when the calling process terminates, invalidation when membership moves — are owned by [`engine.md`](engine.md#reactivity-wiring); the consumer-facing event shapes are under *Reactivity* above.

---

## Code architecture

```
engine/sdk/                                   — @openlight/sdk package
  src/
    index.ts              — public re-exports of the substrate surface
    globals.d.ts          — ambient runtime globals, typed once for every consumer
    types.ts              — TS mirror of substrate types
    values.ts             — boundary translation: native values ⇄ tagged wire
                            encoding ($ref/$loc/$set/$time/$md/$type); selection
                            terms, which stay tagged; Ref class
    protocol.ts           — Request | Response | Event shapes; id counter
    surface.ts            — read, resolve, get, readBatch, commit, run, awaitRun,
                            cancel, exit
    purity.ts             — isPure over a program chunk: the definition-time legs
    subscriptions.ts      — subscribe, registry, event router
    transport.ts          — Transport interface + selection at module load
                            (globalThis.__openlight_transport > wry > stdio)
    transports/
      wry.ts              — webview transport (window.__wry_ipc + window.__sdk)
      stdio.ts            — VM transport (stdin reader, stdout writer)
  test/
    values.test.ts        — the tagged encoding round-trips, selections included
    surface.test.ts       — surface against a mock transport

host/react/                                   — UI library (@openlight/react)
  src/
    index.ts              — public re-exports of hooks and components
    useRead.ts           — the useRead hook
  test/
    useRead.test.ts      — hook semantics
```

Same coherence pattern as the db crate: each file owns a topic; predictable shape inside (constants on top, public function in the middle, private helpers below). When a function outgrows linear narrative, it decomposes into named helpers in the same file; the public function becomes the orchestrator. What's genuinely non-obvious here and earns a comment (per [`conventions.md`](../conventions.md#code)): the transport's module-load selection (pre-set transport vs `window.__wry_ipc` vs stdio fallback), the event-router's id-vs-event message-shape distinguisher, the per-seat identity token stamped on every request, `useRead`'s treatment of `subscription_invalid` as a dead subscription.

`host/react` depends on `@openlight/sdk` for transport-aware functions; nothing else.

---

## What Is Open

- ~~The citizen's return path~~ — ruled: host-direct in both directions (*Webview transport*).
- **Per-seat identity under a shared module instance** (*Webview transport*), settling with the slot protocol.
- **Per-sub-query identity in `readBatch`** (*Reads*) — the wire carries none, and coalescing across citizens needs one.
- **The existence oracle** — `BOUNDARY_VIOLATION` versus a silently empty read (*Reads*); the engine's call, surfaced here.
- **One encoding for type terms, or two** — reified `$type` values against instance-contract strings (*Types*).
- **`useRead` has no error channel** (*React helpers*).
- **React hooks beyond `useRead`.** `useCommit` for guarded writes, `useRun` binding `run + awaitRun` to component lifetime, `useSubscribe` for non-React imperative needs — candidates that may emerge as first-party programs are written.
- **Type generation.** TS types are a hand-maintained mirror today. A codegen step from the Rust source could keep them in sync mechanically — and the same generator produces the payload-archetype types that catch a mistyped body key before any write (substrate.md, *What's Open*).
- **Non-TS clients.** The protocol is JSON-lines; an SDK can be reimplemented in any language that runs as a VM program. The first non-TS port is a known horizon target. See [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md) for what's deferred.
- **Streaming intra-op results.** Settled engine-side as a convention rather than protocol machinery: streaming is throttled partial commits (`body.partial`), coalesced subscription events, re-fetch on event — see [`engine.md`](engine.md), *Streaming convention*. Intra-op streaming stays out of the protocol.
- **The slot provider.** The coalescing resolver for slot-and-hook views (collect hook declarations per render pass → one `readBatch` → slices to hooks) belongs in the UI layer on top of `readBatch`; its exact shape settles by building the thread tile ([`view.md`](view.md) §8).
