# SDK

The SDK is the surface programs import to reach the substrate. It hides protocol mechanics, transport selection, and subscription tracking behind a small set of typed functions. The SDK has no rendering concerns — programs render via whatever DOM library they choose (React, Solid, vanilla); the SDK only mediates substrate operations and capabilities.

Programs come in two runtime kinds for the pilot. Both use the same SDK surface; only the transport differs.

- **Webview programs** — `runtime: 'webview'`. The program is a JS bundle loaded into a wry-hosted webview. The runtime is the webview's V8. The SDK reaches the engine over wry IPC. Full client-side React, full browser APIs, 60fps interactions.
- **VM programs** — `runtime: 'vm'`. The program is an executable file with a shebang the engine spawns inside its Linux VM. The shebang declares the interpreter (e.g. `#!/usr/bin/env bun`, `#!/usr/bin/env python`) — the runtime kind doesn't bind to one language. Any interpreter installed in the VM that speaks the JSON-lines protocol over stdio works.

This SDK is TypeScript-only for the pilot. First-party VM programs (agent, tools) use `#!/usr/bin/env bun` because Bun runs TS directly and lets them import this SDK. Programs in other languages can be added when an SDK exists for them; the protocol is language-agnostic, the SDK is not.

The protocol shape is settled in [`engine.md`](engine.md#the-program-protocol). For why the runtime path is split rather than unified — and what's deferred — see [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md).

This document defines two contracts:

- **Consumer ↔ SDK.** What a program author sees when importing.
- **SDK ↔ engine.** The protocol JSON shape, request/response/event flow, transport mechanics.

Both answer to the engine spec. Where they disagree, engine.md is right.

---

## One package, runtime-agnostic

The SDK ships as one package: **`@openlight/sdk`**. Functions only: `scope`, `get`, `readBatch`, `commit`, `run`, `awaitRun`, `cancel`, `exit`, `subscribe`. No DOM, no React, no rendering. Imports cleanly in any JS/TS runtime — webview, Bun, future runtimes — because transport is a runtime concern, not the SDK's.

The SDK lives in the engine crate (`engine/sdk/`) — it IS the engine's protocol expressed as TypeScript, so it ships where the protocol lives. Future capability surfaces (fs, network) eventually land here the same way: typed functions over the IPC bridge.

React helpers (`useScope`, future `useCommit`, `useRun`, `useSubscribe`) are not part of the SDK — they're a separate UI library, `@openlight/react`, shipped from `host/react/` (because they're coupled to webview programs that the host renders). Webview programs that render React import the SDK *and* the UI library; VM programs only import the SDK. Non-TS clients eventually exist by reimplementing the SDK against the JSON-lines protocol — they don't see the UI library at all.

---

## Boundary translation — three forms of one value

Typed bodies exist in three forms; translation between them is the SDK's job, invisible to program code:

- **In hand — native values.** A `ref` key is a `Ref` object (id + convenience resolve), `time` is a `Date`, `set` is a `Set`, `markdown` is a string tagged by its type. Program code works with real values, never tag envelopes.
- **On the wire — tagged JSON.** Values self-describe: `{"$ref": "chunk_id"}` · `{"$loc": "<normalized expression>"}` · `{"$set": [...]}` · `{"$time": "2026-08-03T…"}` · `{"$md": "…"}`. Tags are what make union checks tag-membership and link-finding spec-free (substrate.md); the engine validates them against instance specs at commit.
- **In the file — plain JSON.** The db stores one JSON text column, byte-identical semantics; the tagged encoding is the stored form.

The SDK encodes on every write and decodes on every read, driven by the tags alone — no spec fetch needed to translate. Schema-driven TS types (a program's argument as a real TypeScript type, generated from the archetype's instance spec) are a later layer on the same encoding.

> I hope this will look good in code, that the mappings between db types and implementation in ts is done in a functional and coherent manner.

## Resolution modes — frozen or head

A process's argument is frozen at dispatch, but the chunks it references live on. When a program reads through its argument's refs, the SDK resolves **at the stamped commit by default** (`at:` from the process body) — reproducible, exactly what the run was given. Following the **living head** is the deliberate, explicit choice (`{ at: 'head' }`) for programs that want liveness — the reader following its reading is this, plus a subscription. Same temporal machinery, two honest modes (engine.md, *Frozen safety or rolling head*).

## The Substrate Surface

`@openlight/sdk` exposes typed functions at the package root.

### Reads

```ts
scope(scopes: ChunkId[], opts?: ScopeOpts): Promise<ScopeResult>
get(chunkId: ChunkId, opts?: ReadOpts): Promise<ChunkItem | null>
readBatch(reads: TaggedRead[]): Promise<BatchResult>
```

All wrap engine ops of the same name. Errors arrive as rejected Promises typed `EngineError`. `scope([])` with `opts.match_` is a whole-field FTS query (boundary-filtered); `opts.exclude` subtracts scopes; `limit`/`offset`/`include: { body: false }` per substrate.md (*Pagination and projection*). `readBatch` resolves tagged sub-queries together at one commit snapshot — per-tag results or per-tag boundary errors — and is the resolution primitive slot-and-hook providers build on (`programs.md` §5).

### Writes

```ts
commit(declaration: Declaration): Promise<Commit>
commit(declaration: Declaration, opts: { dryRun: true }): Promise<{ valid: boolean, errors: EngineError[] }>
```

One-shot atomic write through the engine. The engine validates against the program's write boundary; rejected writes throw `BOUNDARY_VIOLATION` or `VALIDATION_ERROR`. `dryRun` runs full validation without writing — the live-form affordance editors build on.

### Process control

```ts
run(args: RunArgs): Promise<{ process: ProcessId }>
awaitRun(processIds: ProcessId[]): Promise<Record<ProcessId, ChunkItem>>
cancel(processId: ProcessId): Promise<void>
exit(): Promise<void>
```

`run` dispatches — a program plus an already-committed argument chunk, or a draft process to consume — and returns the process id immediately. `RunArgs.mode` selects `'child'` (default — composed work, owned by the caller, cascades with it) or `'launch'` (detached — owned by the session, survives the caller; grants still intersect at spawn). `awaitRun` resolves when each named process reaches a terminal state and **returns the process chunk itself** — status and `result` ref in the body, the result one `get` away. `cancel` is authorized for descendants or targets within the caller's write boundary; idempotent. `exit` requests the calling program's own terminal transition — the webview self-dismissal path.

`awaitRun` is named to dodge `await` (a TypeScript reserved word). The engine method is `await_processes`.

### Reactivity

```ts
type SubEvent =
  | { kind: 'changed', commit: Commit }
  | { kind: 'lagged' }
  | { kind: 'invalid', reason: string }

subscribe(scopes: ChunkId[], callback: (event: SubEvent) => void): () => void
```

Imperative subscription. The callback receives:
- `{ kind: 'changed', commit }` for each `scope_changed` event — re-fetch via `scope`.
- `{ kind: 'lagged' }` when the engine's input channel overflowed and this subscription may have missed events — re-fetch to recover.
- `{ kind: 'invalid', reason }` when the engine has invalidated and unsubscribed this subscription (a subscribed scope became unreachable). No further events will come; the subscription is dead.

The wire `lagged` event carries `subscriptionIds: string[]` — the SDK matches those against its registered subscriptions and fires `{ kind: 'lagged' }` only on the affected callbacks. Subscribers without an id in the list see nothing.

The returned thunk unsubscribes. Calling it after a `kind: 'invalid'` is a no-op (subscriptions are already gone server-side).

---

## React helpers (in `host/react/`)

The host's UI library exposes React hooks built on `@openlight/sdk`. v0.1 ships one:

```ts
useScope(scopes: ChunkId[], opts?: ScopeOpts): ScopeResult | undefined
```

**Contract.** On mount and on every dependency change: register a `subscribe` first, *then* fetch initial state via `scope`, re-fetch on every `scope_changed` or `lagged` event, unmount → unsubscribe. The hook returns the latest fetched result; `undefined` until the first fetch resolves. On `subscription_invalid` (engine-emitted when a subscribed scope becomes unreachable), the hook stops re-fetching and returns `undefined` — the subscription is dead, the data is gone.

**Subscribe-before-fetch ordering.** The order is load-bearing: subscribe first, then fetch. If the order were reversed, a commit landing between the fetch and the subscribe would not be reflected in either — the fetch read state before it, and the subscription registered after the broadcast had already fired. With subscribe first, any commit between subscribe and fetch produces an event the SDK receives (queued during the in-flight fetch); the subsequent re-fetch supersedes the initial fetch and reflects the new state. The cost is at most one extra fetch per mount; there is no lost-event window. Any imperative caller using `subscribe` + `scope` together must follow the same ordering.

*Open — no error channel.* `useScope` returns `ScopeResult | undefined`, and `undefined` is its only failure form — a refused scope read (`BOUNDARY_VIOLATION`) is indistinguishable from loading. The reader's inline-error pin (programs.md §3) is unreachable for scope reads until this closes.

**Why re-fetch every event** rather than apply the event's `commit` payload as a delta. Single source of truth lives in the substrate; the SDK never derives state from events. The `commit` payload is available to the callback for delta optimization in custom uses, but the default discards it.

Future hooks land here as patterns emerge from real programs.

---

## Types

TS mirror of substrate library types — same field names, same semantics. The Rust source is authoritative; the TS file is hand-maintained to match. (Codegen from the Rust source is on the open list.)

```ts
type ChunkId   = string
type CommitId  = string
type ProcessId = ChunkId   // a process is a chunk

type ChunkItem = {
  id: ChunkId
  name?: string
  spec?: Spec
  body?: Record<string, unknown>
  placements?: Placement[]
}

type Spec = {
  instance?: Record<string, string>  // the instance spec — key → type expression
                                     // ("string", "ref(workplace)", "list<ref>",
                                     // "markdown", …; `?` and `unique` inline)
  ordered?: boolean                  // interim home; open (substrate.md)
}

type Placement = {
  scope_id: ChunkId
  type_: 'owned' | 'instance' | 'relates'   // key asymmetry, pinned: a placement
                                  // is declared with `type` (writes,
                                  // PlacementSpec) and read back with `type_`
  seq?: number
}

type Link = {
  source_id: ChunkId
  target: ChunkId | string        // chunk id, or normalized location expression
  kind: 'field' | 'mention'
  key?: string                    // declaring key when kind = 'field'
}

type Declaration = {
  chunks: ChunkDeclaration[]
  placements: PlacementSpec[]
  message?: string
}

type ScopeOpts = {
  branch?: string
  at?: CommitId
  match_?: string
  exclude?: ChunkId[]   // negation — set difference, either placement type;
                        // roots boundary-checked
  limit?: number        // a single ordered scope reads tail-first: latest
  offset?: number       // entries by default, offset pages backward, the
                        // window itself ascending by seq (db.md)
  include?: Includes    // { body: false } = survey read, no bodies
}

type ScopeResult = {
  head: CommitId
  unresolved?: ChunkId[]   // roots resolving in no mount (federated intersection,
                           // engine.md) — dead references as metadata, not error;
                           // optional because the engine wire does not carry it
                           // yet (the db does — recorded, ahead of the wire)
  total: number
  in_scope: number
  in_scope_owned: number
  in_scope_instance: number
  in_scope_relates: number
  chunks: ChunkItem[]
  linked: Link[]           // fields and mentions pointing at the roots — derived,
                           // reader-reach-filtered, never mixed with placements
  dimensions: Dim[]
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

type RunArgs = {
  program?: ChunkId          // with `argument`: direct dispatch
  argument?: ChunkId         // an already-committed chunk, instance on the
                             // program's argument archetype
  draft?: ProcessId          // alternative: consume an existing draft process
  mode?: 'child' | 'launch'  // child (default): owned by caller, cascades;
                             // launch: owned by session, survives caller
  read?: ChunkId[]           // granted read roots (beside grants-derived ones)
  write?: ChunkId[]          // granted write roots
  timeout_ms?: number
}

type TaggedRead =
  | { tag: string, scopes: ChunkId[], opts?: ScopeOpts }
  | { tag: string, chunkId: ChunkId, opts?: ReadOpts }

type BatchResult = {
  head: CommitId             // the one snapshot every sub-query resolved at
  results: Record<string, ScopeResult | ChunkItem | null | EngineError>
}

type EngineError = {
  code: 'BOUNDARY_VIOLATION' | 'READ_ONLY_MOUNT' | 'VALIDATION_ERROR'
      | 'NOT_FOUND' | 'RUN_FAILED' | 'INVALID_REQUEST' | 'TRANSPORT_CLOSED'
  message: string
}
```

(`Dim`, `Edge`, `ChunkDeclaration`, `PlacementSpec` follow the same direct-mirror pattern. `Includes` does not: the wire carries only the `{ body?: boolean }` subset of db's `Includes` — `include: { body: false }` is the survey read; the other db-level flags stay behind the engine.)

Ambient globals a runtime installs — `window.__wry_ipc`, `window.__sdk`, `window.__openlight_process`, `globalThis.__openlight_transport` — are typed in one home, the SDK's `globals.d.ts`; no package re-declares them.

**`RunArgs` is the program-facing projection of the engine's `RunArgs`** (see [`engine.md`](engine.md#engine-api-callable-from-the-host)). One engine field is absent by design: `placements` is engine-owned — trace residence (child owned by caller, launch owned by session) is not a program's concern. Grants are roots only; the engine records them as the process body's `read`/`write` keys, intersected with the caller's reach for nested runs.

---

## Transports

The SDK selects a transport at module-load time. Order:

1. **Pre-set:** if `globalThis.__openlight_transport` is set, use it. Future runtimes that don't fit the auto-detected patterns inject a transport here before the SDK loads.
2. **Webview:** if `window.__wry_ipc` is present, use the wry transport.
3. **VM:** if `process.stdin` is present, use the stdio transport.
4. Otherwise: throw — no transport detected.

Both built-in transports surface the same internal `Transport` shape (`send(req): Promise<Response>` and `onEvent(handler)`), so the op functions in the surface module remain transport-agnostic.

### Webview transport

The SDK posts requests through `window.__wry_ipc.postMessage(<json>)`. The host's wry IPC handler receives the JSON, attaches the calling process's `Context`, calls the engine, and resolves by injecting `webview.evaluate_script("__sdk.resolve(<id>, <payload>)")`.

One webview may carry several protocol identities: when a surface hosts embedded citizens (slot-and-hook, `programs.md` §5), each sovereign citizen's SDK instance holds a slot identity token issued at slot creation, stamped on every request; the host's handler maps token → process id before attaching `Context`. Each citizen speaks as its own process — boundaries and commit attribution hold at slot granularity. Events ride the same channel in the other direction via `__sdk.event(<payload>)`. The SDK demultiplexes by message shape: `id + result|error` is a response, `event` field is unsolicited.

The `__sdk` global on the webview side is the SDK's hook surface — a small object the host calls to deliver responses and events. The host's dispatch logic only knows the function names.

### VM transport

The SDK writes requests as JSON lines to stdout. The engine spawned the program inside its VM and reads its stdout; the engine writes responses and events as JSON lines to the program's stdin. The SDK reads stdin line-by-line, demultiplexing the same way as the webview transport.

VM programs run inside their own VM. Their fs/network/shell access is whatever the interpreter gives them inside the VM, gated by the program's declared capabilities and enforced at engine boundaries.

### What the SDK does not do

The SDK does not render. Webview programs that want React render with `createRoot(document.body).render(<App />)` directly — `react-dom/client` handles it; no SDK wrapper. VM programs have no DOM and don't render at all. The served shell is empty and programs mount `document.body` (host.md, *Authoring Programs*); the SDK assumes nothing about the page.

---

## Subscription lifecycle

The SDK keeps an internal registry mapping each `subscriptionId` (returned by the engine's `subscribe` op) to its callback, and demultiplexes incoming events to the right callback by id. The returned thunk removes the entry and calls the engine's `unsubscribe`. Engine-side mechanics — boundary check at registration, the `subscriptionId`, auto-drop when the calling process terminates, invalidation — are owned by [`engine.md`](engine.md#reactivity-wiring); the consumer-facing event shapes are under *Reactivity* above.

---

## Code architecture

```
engine/sdk/                                   — @openlight/sdk package
  src/
    index.ts              — public re-exports of the substrate surface
    globals.d.ts          — ambient runtime globals, typed once for every consumer
    types.ts              — TS mirror of substrate types
    values.ts             — boundary translation: native values ⇄ tagged wire
                            encoding ($ref/$loc/$set/$time/$md); Ref class
    protocol.ts           — Request | Response | Event shapes; id counter
    surface.ts            — scope, get, commit, run, awaitRun, cancel
    subscriptions.ts      — subscribe, registry, event router
    transport.ts          — Transport interface + selection at module load
                            (globalThis.__openlight_transport > wry > stdio)
    transports/
      wry.ts              — webview transport (window.__wry_ipc + window.__sdk)
      stdio.ts            — VM transport (stdin reader, stdout writer)
  test/
    surface.test.ts       — surface against a mock transport

host/react/                                   — UI library (@openlight/react)
  src/
    index.ts              — public re-exports of hooks and components
    useScope.ts           — the useScope hook
  test/
    useScope.test.ts      — hook semantics
```

Same coherence pattern as the db crate: each file owns a topic; predictable shape inside (constants on top, public function in the middle, private helpers below). When a function outgrows linear narrative, it decomposes into named helpers in the same file; the public function becomes the orchestrator. What's genuinely non-obvious here and earns a comment (per [`conventions.md`](../conventions.md#code)): the transport's module-load selection (pre-set transport vs `window.__wry_ipc` vs stdio fallback), the event-router's id-vs-event message-shape distinguisher, `useScope`'s treatment of `subscription_invalid` as a dead subscription.

`host/react` depends on `@openlight/sdk` for transport-aware functions; nothing else.

---

## What Is Open

- **React hooks beyond `useScope`.** `useCommit` for guarded writes, `useRun` binding `run + awaitRun` to component lifetime, `useSubscribe` for non-React imperative needs — candidates that may emerge as first-party programs are written.
- **Type generation.** TS types are a hand-maintained mirror today. A codegen step from the Rust source could keep them in sync mechanically.
- **Non-TS clients.** The substrate protocol is JSON-lines; an SDK can be reimplemented in any language that runs as a VM program. The first non-TS port is a known horizon target. See [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md) for what's deferred.
- **Streaming intra-op results.** Settled engine-side as a convention rather than protocol machinery: streaming is throttled partial commits (`body.partial`), coalesced subscription events, re-fetch on event — see engine.md, *Streaming convention*. Intra-op streaming stays out of the protocol.
- **The slot provider.** The coalescing resolver for slot-and-hook views (collect hook declarations per render pass → one `readBatch` → slices to hooks) belongs in the UI layer on top of `readBatch`; its exact shape settles by building the thread tile (`programs.md` §5).
