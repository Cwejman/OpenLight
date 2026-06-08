# SDK

The SDK is the surface programs import to reach the substrate. It hides protocol mechanics, transport selection, and subscription tracking behind a small set of typed functions. The SDK has no rendering concerns — programs render via whatever DOM library they choose (React, Solid, vanilla); the SDK only mediates substrate operations and capabilities.

Programs come in two runtime kinds for the pilot. Both use the same SDK surface; only the transport differs.

- **Webview programs** — `runtime: 'webview'`. The program is a JS bundle loaded into a wry-hosted webview. The runtime is the webview's V8. The SDK reaches the engine over wry IPC. Full client-side React, full browser APIs, 60fps interactions.
- **VM programs** — `runtime: 'vm'`. The program is an executable file with a shebang the engine spawns inside its Linux VM. The shebang declares the interpreter (e.g. `#!/usr/bin/env bun`, `#!/usr/bin/env python`) — the runtime kind doesn't bind to one language. Any interpreter installed in the VM that speaks the JSON-lines protocol over stdio works.

This SDK is TypeScript-only for the pilot. First-party VM programs (agent, tools) use `#!/usr/bin/env bun` because Bun runs TS directly and lets them import this SDK. Programs in other languages can be added when an SDK exists for them; the protocol is language-agnostic, the SDK is not.

The protocol shape is settled in [`pilot/engine.md`](engine.md#the-program-protocol). For why the runtime path is split rather than unified — and what's deferred — see [`research/runtimes-and-surfaces.md`](../research/runtimes-and-surfaces.md).

This document defines two contracts:

- **Consumer ↔ SDK.** What a program author sees when importing.
- **SDK ↔ engine.** The protocol JSON shape, request/response/event flow, transport mechanics.

Both answer to the engine spec. Where they disagree, engine.md is right.

---

## One package, runtime-agnostic

The SDK ships as one package: **`@openlight/sdk`**. Functions only: `scope`, `commit`, `run`, `awaitRun`, `cancel`, `subscribe`. No DOM, no React, no rendering. Imports cleanly in any JS/TS runtime — webview, Bun, future runtimes — because transport is a runtime concern, not the SDK's.

The SDK lives in the engine crate (`engine/sdk/`) — it IS the engine's protocol expressed as TypeScript, so it ships where the protocol lives. Future capability surfaces (fs, network) eventually land here the same way: typed functions over the IPC bridge.

React helpers (`useScope`, future `useCommit`, `useRun`, `useSubscribe`) are not part of the SDK — they're a separate UI library shipped from `host/ui/` (because they're coupled to webview programs that the host renders). Webview programs that render React import the SDK *and* the UI library; VM programs only import the SDK. Non-TS clients eventually exist by reimplementing the SDK against the JSON-lines protocol — they don't see the UI library at all.

---

## The Substrate Surface

`@openlight/sdk` exposes typed functions at the package root.

### Reads

```ts
scope(scopes: ChunkId[], opts?: ScopeOpts): Promise<ScopeResult>
get(chunkId: ChunkId, opts?: ReadOpts): Promise<ChunkItem | null>
```

Both wrap engine ops of the same name. Errors arrive as rejected Promises typed `EngineError`.

### Writes

```ts
commit(declaration: Declaration): Promise<Commit>
```

One-shot atomic write through the engine. The engine validates against the program's write boundary; rejected writes throw `BOUNDARY_VIOLATION` or `VALIDATION_ERROR`.

### Process control

```ts
run(programId: ChunkId, args: RunArgs): Promise<{ process: ProcessId }>
awaitRun(processIds: ProcessId[]): Promise<Record<ProcessId, ScopeResult>>
cancel(processId: ProcessId): Promise<void>
```

`run` returns the process id immediately. `awaitRun` resolves when each named process reaches a terminal state and returns each one's final scope — the call suspends the caller's async task, doesn't block other work.

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

## React helpers (in `host/ui/`)

The host's UI library exposes React hooks built on `@openlight/sdk`. v0.1 ships one:

```ts
useScope(scopes: ChunkId[], opts?: ScopeOpts): ScopeResult | undefined
```

**Contract.** On mount and on every dependency change: register a `subscribe` first, *then* fetch initial state via `scope`, re-fetch on every `scope_changed` or `lagged` event, unmount → unsubscribe. The hook returns the latest fetched result; `undefined` until the first fetch resolves. On `subscription_invalid` (engine-emitted when a subscribed scope becomes unreachable), the hook stops re-fetching and returns `undefined` — the subscription is dead, the data is gone.

**Subscribe-before-fetch ordering.** The order is load-bearing: subscribe first, then fetch. If the order were reversed, a commit landing between the fetch and the subscribe would not be reflected in either — the fetch read state before it, and the subscription registered after the broadcast had already fired. With subscribe first, any commit between subscribe and fetch produces an event the SDK receives (queued during the in-flight fetch); the subsequent re-fetch supersedes the initial fetch and reflects the new state. The cost is at most one extra fetch per mount; there is no lost-event window. Any imperative caller using `subscribe` + `scope` together must follow the same ordering.

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
  ordered?: boolean
  accepts?: ChunkId[]
  required?: ChunkId[]
  unique?: ChunkId[]
  propagate?: boolean
}

type Placement = {
  scope_id: ChunkId
  type_: 'instance' | 'relates'
  seq?: number
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
  limit?: number
  offset?: number
  include?: Includes
}

type ScopeResult = {
  head: CommitId
  total: number
  in_scope: number
  in_scope_instance: number
  in_scope_relates: number
  chunks: ChunkItem[]
  dimensions: Dim[]
}

type Commit = {
  id: CommitId
  parent_id?: CommitId
  timestamp: string
  message?: string
  process_id?: ProcessId   // which run caused this commit; absent for host-initiated commits
  chunks_modified: ChunkId[]
  placements_modified: [ChunkId, ChunkId][]
}

type RunArgs = {
  chunks: ChunkDeclaration[]
  readBoundary: ChunkId[]    // scope roots — the SDK builds a fresh boundary chunk per run
  writeBoundary: ChunkId[]   // same — programs always supply roots
  timeout_ms?: number
}

type EngineError = {
  code: 'BOUNDARY_VIOLATION' | 'READ_ONLY_MOUNT' | 'VALIDATION_ERROR'
      | 'NOT_FOUND' | 'RUN_FAILED' | 'INVALID_REQUEST' | 'TRANSPORT_CLOSED'
  message: string
}
```

(`Dim`, `Edge`, `Includes`, `ChunkDeclaration`, `PlacementSpec` follow the same direct-mirror pattern.)

---

## Transports

The SDK selects a transport at module-load time. Order:

1. **Pre-set:** if `globalThis.__openlight_transport` is set, use it. Future runtimes that don't fit the auto-detected patterns inject a transport here before the SDK loads.
2. **Webview:** if `window.__wry_ipc` is present, use the wry transport.
3. **VM:** if `process.stdin` is present, use the stdio transport.
4. Otherwise: throw — no transport detected.

Both built-in transports surface the same internal `Transport` shape (`send(req): Promise<Response>` and `onEvent(handler)`), so the op functions in the surface module remain transport-agnostic.

### Webview transport

The SDK posts requests through `window.__wry_ipc.postMessage(<json>)`. The host's wry IPC handler receives the JSON, attaches the calling process's `Context`, calls the engine, and resolves by injecting `webview.evaluate_script("__sdk.resolve(<id>, <payload>)")`. Events ride the same channel in the other direction via `__sdk.event(<payload>)`. The SDK demultiplexes by message shape: `id + result|error` is a response, `event` field is unsolicited.

The `__sdk` global on the webview side is the SDK's hook surface — a small object the host calls to deliver responses and events. The host's dispatch logic only knows the function names.

### VM transport

The SDK writes requests as JSON lines to stdout. The engine spawned the program inside its VM and reads its stdout; the engine writes responses and events as JSON lines to the program's stdin. The SDK reads stdin line-by-line, demultiplexing the same way as the webview transport.

VM programs run inside their own VM. Their fs/network/shell access is whatever the interpreter gives them inside the VM, gated by the program's declared capabilities and enforced at engine boundaries.

### What the SDK does not do

The SDK does not render. Webview programs that want React render with `createRoot(document.getElementById('root')!).render(<App />)` directly — `react-dom/client` handles it; no SDK wrapper. VM programs have no DOM and don't render at all. The host injects a `<div id="root">` into every webview before the program loads; that's the only setup the SDK assumes about the page.

---

## Subscription lifecycle

A subscription registers `(scopes, callback)` with the engine via the `subscribe` op. The engine does a boundary check at registration; out-of-boundary scopes return `BOUNDARY_VIOLATION` and the SDK rejects the call. On success the engine returns a `subscriptionId`, which the SDK keeps in an internal registry mapping ids to callbacks.

When the engine fires a `scope_changed` event, the SDK looks up the subscription and invokes its callback with `{ kind: 'changed', commit }`. When the engine fires a `lagged` event (carrying `subscriptionIds`), the SDK invokes only the affected callbacks with `{ kind: 'lagged' }` — subscriptions whose ids are not in the list see nothing.

`unsubscribe` is the returned thunk. It removes the entry from the registry and calls the engine's `unsubscribe` op. Unsubscribing is also automatic when the calling process reaches terminal state — the engine drops all of a process's subscriptions on cleanup.

---

## Code architecture

```
engine/sdk/                                   — @openlight/sdk package
  src/
    index.ts              — public re-exports of the substrate surface
    types.ts              — TS mirror of substrate types
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

host/ui/                                      — UI library (React)
  src/
    index.ts              — public re-exports of hooks and components
    useScope.ts           — the useScope hook
  test/
    useScope.test.ts      — hook semantics
```

Same coherence pattern as the db crate: each file owns a topic; predictable shape inside (constants on top, public function in the middle, private helpers below). When a function outgrows linear narrative, it decomposes into named helpers in the same file; the public function becomes the orchestrator. Comments are reserved for the genuinely non-obvious — the transport's module-load selection (pre-set transport vs `window.__wry_ipc` vs stdio fallback), the event-router's id-vs-event message-shape distinguisher, `useScope`'s treatment of `subscription_invalid` as a dead subscription. Names carry the rest.

`host/ui` depends on `@openlight/sdk` for transport-aware functions; nothing else.

---

## What Is Open

- **React hooks beyond `useScope`.** `useCommit` for guarded writes, `useRun` binding `run + awaitRun` to component lifetime, `useSubscribe` for non-React imperative needs — candidates that may emerge as first-party programs are written.
- **Type generation.** TS types are a hand-maintained mirror today. A codegen step from the Rust source could keep them in sync mechanically.
- **Non-TS clients.** The substrate protocol is JSON-lines; an SDK can be reimplemented in any language that runs as a VM program. The first non-TS port is a known horizon target. See [`research/runtimes-and-surfaces.md`](../research/runtimes-and-surfaces.md) for what's deferred.
- **Streaming intra-op results.** Long-running operations that emit incremental output (model token streams) are not in the protocol. Programs handle their own streaming inside their executable; the substrate sees only completed states.
- **Cross-program SDK use.** Each runtime instance hosts one program. Embedding another program's SDK inside one is unspecified.
