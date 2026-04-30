# Engine

The engine is the authority on running programs against the substrate. A program is a chunk with an executable; to run one is to create a process. The engine creates processes, enforces boundaries, spawns executables, and mediates every substrate operation a running program attempts. Nothing runs without going through the engine, and no program touches the database directly.

The engine is a Rust crate compiled into the host binary. The host calls engine functions directly — there is no separate engine process and no JSON-lines hop between host and engine. Webview programs send their protocol messages over wry IPC to the host; the host's IPC handler dispatches them to engine functions and returns the results back through wry. VM programs (tool programs running in a containment VM) speak the same protocol over stdio JSON-lines — the engine spawns them inside their VM and reads stdout.

The shape of the program-facing protocol is identical regardless of transport. The SDK hides the difference.

---

## What the Engine Owns

- **Process creation.** The act of running a program is `dispatch`; the resulting artifact is a `process` chunk. The engine creates the process chunk in one atomic `db.commit()`, placing it on the program by identity and on its session (or parent process, for tool calls) so it's visible where it belongs. The process chunk is engine-owned — a running program cannot modify its own process chunk or the boundary chunks attached to it.
- **Boundary enforcement.** Every scope read, every write, every nested program run is checked. The engine computes the effective boundary as the intersection of the program's intrinsic boundary and the boundary the user (or parent process) set at run time. Reads outside the read boundary return `BOUNDARY_VIOLATION`. Writes outside the write boundary are rejected.
- **Program lifecycle.** The engine spawns the program's executable, tracks its status through `pending → running → completed | failed`, updates the process chunk as state changes, kills on timeout or cancel. The program itself does not set its status — it simply exits.
- **Protocol mediation.** The engine receives every substrate operation a running program attempts, validates it, executes it via the substrate library, returns the result. Programs do not carry database access; the protocol is the boundary.
- **Containment.** The engine spawns programs into whatever containment context their capabilities demand. How broad that context is, and whether all programs share one, is the containment fork (see below).

## Program and Process

```
engine/program
  spec: { required: ['executable'] }
  body may carry:
    executable: path relative to project
    runtime: 'webview' | 'vm'
    capabilities: { network?, filesystem?, ... }
    boundary: reference to intrinsic boundary, or 'open'
    timeout_ms: default run timeout
```

A program is the template: what to run, how it behaves, what capabilities it declares. Concrete programs — filesystem, shell, claude, echo, read-tile, sidebar — are chunks placed `instance` on `program`.

```
engine/process
  — An instance of program that represents a single run.
  body carries engine-written state:
    status: 'pending' | 'running' | 'completed' | 'failed'
    started: ISO timestamp
    pid: OS process id (nullable)
    timeout_ms: resolved timeout for this run
    error?: reason string when status is 'failed'
```

A process is instance of process AND instance of the program it runs. Dual placement. Reads of the `process` scope list every run in the session; reads of a specific program's scope list its runs.

---

## The Dispatch Verb

The term `dispatch` is the verb — the act of running a program. It appears in commit metadata (`commits.dispatch_id`) as the trace of which run caused a change. It is not an archetype. The noun for the thing that is running is `process`.

In the SDK, the operation is named `run`. It returns the process id synchronously; the program continues asynchronously. `await` blocks on one or more process ids and returns their scopes when they complete.

---

## The Program Protocol

One JSON-lines protocol serves every program regardless of where it runs.

**Operations a running program can call on the engine:**

| Operation | Description |
|---|---|
| `scope` | Read the intersection of scopes. Filtered by the effective read boundary. Connected scopes outside the boundary appear as visible topology (names, counts) but are not readable. FTS filtering via `ScopeOpts.match_`. |
| `commit` | Write a Declaration. Rejected if any chunk or placement touches a scope outside the write boundary. |
| `run` | Start a new program run. Returns the process id immediately. Used internally by the engine for tool calls. |
| `await` | Block until one or more processes reach a terminal state. Returns each process's final scope. |
| `subscribe` | Register on a set of scopes; returns a subscription id. The engine pushes `scope_changed` events when commits touch those scopes. |
| `unsubscribe` | Cancel a subscription by id. |

### Schema

Every request has an `op` and a monotonic `id`. Every response pairs the same `id` with either `result` or `error`.

```jsonl
{"id":1,"op":"scope","scopes":["chunk_abc","chunk_def"],"opts":{"match_":"session today"}}
{"id":2,"op":"commit","declaration":{"chunks":[...]}}
{"id":3,"op":"run","program":"filesystem","args":{...}}
{"id":4,"op":"await","processes":["p_1","p_2"]}
{"id":5,"op":"subscribe","scopes":["my-session"]}
{"id":6,"op":"unsubscribe","subscriptionId":"sub_1"}
```

| Op | Result shape |
|---|---|
| `scope` | `ScopeResult` |
| `commit` | `Commit` (id, parent_id, timestamp, chunks_modified, placements_modified) |
| `run` | `{ process: string }` — the process chunk id |
| `await` | `Record<string, ScopeResult>` — process id → final scope |
| `subscribe` | `{ subscriptionId: string }` |
| `unsubscribe` | `{}` |

**Errors:**

| Code | Meaning |
|---|---|
| `BOUNDARY_VIOLATION` | Read or write outside the effective boundary |
| `VALIDATION_ERROR` | Declaration fails spec validation |
| `NOT_FOUND` | Referenced chunk, program, or subscription does not exist |
| `RUN_FAILED` | A run the program started ended non-zero |
| `INVALID_REQUEST` | Malformed JSON, unknown op, missing fields |

The types (`ScopeResult`, `ChunkItem`, `Declaration`, `Commit`) are the substrate library's types.

### Events

A program receives unsolicited messages from the engine on the same channel it sends requests over. An event has no `id`; it is identified by its `event` field. Programs distinguish responses (`id` + `result|error`) from events (`event`) by message shape.

| Event | Shape | Meaning |
|---|---|---|
| `scope_changed` | `{ event: "scope_changed", subscriptionId, commit }` | A commit touched a scope this subscription registered on. The SDK re-fetches via `scope` to read the new state. |
| `lagged` | `{ event: "lagged", subscriptionIds: [string] }` | The engine's input channel overflowed; the named subscriptions may have missed events. The SDK re-fetches to recover. |
| `subscription_invalid` | `{ event: "subscription_invalid", subscriptionId, reason }` | A subscribed scope became unreachable from the process's read boundary (placement removed, ancestor deleted, etc.). The engine has unsubscribed; the SDK should treat the subscription as dead. `reason` is a short string ("scope unreachable", "scope removed"). |

The `commit` payload on `scope_changed` is the same shape as the `commit` op result — the metadata is carried for debugging and optional delta optimization. The contract remains: re-fetch on event. Process state changes (`pending → running → completed | failed`) are not surfaced as events; the program tracks them through `await`.

### Run and await are separate

`run` creates the process chunk and spawns the program's executable. It returns the process id immediately. The spawned program runs on its own. `await` blocks on a set of process ids until they reach a terminal state.

This separation is deliberate. There is no structural difference between spawning an agent and calling a tool — both are programs. A filesystem read returns in milliseconds; a sub-agent might run for minutes. The protocol handles both identically.

```
# Sequential tool call
→ {"id":1,"op":"run","program":"filesystem","args":{...}}
← {"id":1,"result":{"process":"p_1"}}
→ {"id":2,"op":"await","processes":["p_1"]}
← {"id":2,"result":{"p_1":{...scope...}}}

# Parallel
→ {"id":1,"op":"run","program":"filesystem","args":{...}}
← {"id":1,"result":{"process":"p_1"}}
→ {"id":2,"op":"run","program":"shell","args":{...}}
← {"id":2,"result":{"process":"p_2"}}
→ {"id":3,"op":"await","processes":["p_1","p_2"]}
← {"id":3,"result":{"p_1":{...},"p_2":{...}}}

# Fire-and-forget
→ {"id":1,"op":"run","program":"claude","args":{...}}
← {"id":1,"result":{"process":"p_sub"}}
... parent continues its own work ...
→ {"id":5,"op":"await","processes":["p_sub"]}   (later, when the result is needed)
```

Every process chunk exists in the substrate immediately. Any other program (within its boundary) can scope into a running process to watch its state.

### Engine API (callable from the host)

The host calls the engine library directly to drive top-level program runs from user action and to handle webview protocol messages. VM-program protocol messages reach the same functions through the engine's stdio reader.

```rust
pub struct Engine { /* db: Arc<Db>, processes, subscriptions, ... */ }

pub struct Context {
    pub process_id: Option<ProcessId>,  // None = host-initiated; Some = caller's process
}

pub struct RunArgs {
    pub program_id:     ChunkId,
    pub chunks:         Vec<ChunkDeclaration>,    // typed arguments
    pub read_boundary:  Vec<ChunkId>,
    pub write_boundary: Vec<ChunkId>,
    pub timeout_ms:     Option<u64>,              // overrides program body
}

impl Engine {
    pub fn open(db: Arc<Db>) -> Result<Engine, OpenError>;
    pub fn shutdown(&self);                       // cancels active processes; closes subscriptions

    // sync — return immediately
    pub fn scope(&self, ctx: &Context, scopes: &[ChunkId], opts: ScopeOpts)
        -> Result<ScopeResult, EngineError>;
    pub fn commit(&self, ctx: &Context, decl: Declaration)
        -> Result<Commit, EngineError>;
    pub fn run(&self, ctx: &Context, args: RunArgs)
        -> Result<ProcessId, EngineError>;
    pub fn cancel(&self, process_id: &ProcessId)
        -> Result<(), EngineError>;
    pub fn subscribe(&self, ctx: &Context, scopes: &[ChunkId])
        -> Result<SubscriptionId, EngineError>;
    pub fn unsubscribe(&self, sub_id: SubscriptionId);

    // async — Future resolves on terminal-state transition
    pub async fn await_processes(&self, ctx: &Context, ids: &[ProcessId])
        -> Result<HashMap<ProcessId, ScopeResult>, EngineError>;

    // event channel — host/SDK pulls events bound to a subscription
    pub fn events(&self, sub_id: SubscriptionId) -> impl Stream<Item = Event>;
}
```

**The engine is program-agnostic.** `RunArgs.chunks` are whatever the program's composed spec accepts — the engine places them on the process chunk and the substrate's spec enforcement validates the contract. Boundary arrays are the scope roots the caller permits this run to reach; the engine builds boundary chunks from them and computes the effective boundary.

**`Context::process_id = None`** marks a host-initiated call (the user opening a tile, the host's own bootstrap). The engine treats it as having full read and write reach over the project. `Some(process_id)` resolves boundaries from the named process chunk's attached boundary chunks.

**Sync vs async.** The substrate is sync (SQLite is sync), so `scope`, `commit`, `run`, `subscribe`, `unsubscribe`, `cancel` return without awaiting. `await_processes` is genuinely async — it holds open until processes reach terminal state. `events()` returns a Stream that the transport layer (host wry IPC pump, or engine's stdio writer) pumps to the program.

---

## Process Creation — What the Declaration Looks Like

A single atomic `db.commit()` creates:

1. **The process chunk.** Empty body except `status: 'pending'`. Placements: `instance` on the program (so the process is listed under the program), `instance` on `engine/process` (so every run is in the process scope), `instance` on the session (so it shows in the sidebar).
2. **A read-boundary chunk.** Placements: `instance` on `read-boundary` (type), `relates` on the process (execution configuration, not structural content). Each boundary scope root is placed `relates` on this chunk by identity.
3. **A write-boundary chunk.** Same shape for `write-boundary`.
4. **The argument chunks passed by the caller.** Each receives a `{ scope_id: processId, type: 'instance' }` placement added by the engine. The substrate's `accepts` check validates the composed contract.

Pre-generated ids let the engine reference the process from the boundary placements in the same declaration.

**Why boundaries are `relates` on the process, not `instance`:** the process's composed spec (`program.spec ∪ engine/process.spec`) defines what counts as structural content — typed arguments. Boundaries are not content; they are execution configuration the engine needs to read. Placing them `instance` would force them through the `accepts` check and couple the program's typed-argument spec to boundary presence. `relates` keeps the two orthogonal and honors the substrate semantics: boundaries are about the process, they are not a member of it.

---

## Boundaries

Two levels:

**Program-level boundary.** What the program can do by its nature. Expressed on the program chunk's body — either a reference to a named boundary or the keyword `open` meaning "defers all restriction to the run." A shell program has a narrow intrinsic boundary (its own process scope only). An agent program has `open`.

**Run-level boundary.** What this specific run is permitted. Set by the caller at `run` time. For a top-level run from the host, this is the user's choice; for a tool call from an agent, this is derived from the agent's current boundary intersected with the target program's intrinsic limit.

The **effective boundary** is the intersection. A run can never widen what the program's nature allows. For nested runs (tool calls from an agent), the child's boundaries are intersected with the parent's — boundaries can only narrow through the call stack, never widen. `open` is treated as the universal set — intersecting anything with it yields the other set.

**Transitive via instance chains.** A boundary root `[agent]` grants access to everything reachable from `agent` through instance placements. When a program calls `scope(['my-session'])`, the engine walks: `my-session → session (instance) → agent (instance) → boundary root`. Reachable: grant. Not reachable: `BOUNDARY_VIOLATION`. Once a scope is opened, everything placed on it is visible — instances and relates alike. The boundary gates which doors you can open; it does not filter inside an opened scope.

**The process scope is always accessible.** Structural invariant: every program can read and write within its own process's scope tree. The process id is implicitly a boundary root in both read and write boundaries. Without this, a program cannot read its own arguments.

**Protected chunks.** The engine rejects any write that modifies:
- The process chunk itself (status, pid — engine domain)
- Either boundary chunk attached to the process

These are the run's contract — fixed at spawn, immutable during execution.

---

## Reactivity Wiring

How a `subscribe` op on the protocol becomes a `scope_changed` event in the calling program.

### The chain

```
db                    engine                    transport               program
──                    ──────                    ─────────               ───────
broadcast::Sender ─→  broadcast::Receiver  ─→   wry IPC channel    ─→   SDK event handler
(post tx.commit)      (one, from               (per webview)            (dispatches by
                       db.subscribe_scope                                 message shape)
                       at engine startup)
                                                stdio JSON lines
                                                (per VM program)
```

1. **db.** Each successful write op pushes a `Commit` onto the substrate's broadcast channel after `tx.commit()` returns. Settled in db.md.

2. **engine.** On `Engine::open`, the engine subscribes once to `db.subscribe_scope(&[commits_root], ..)` — the universal change stream. A background task drains the receiver and runs the dispatcher.

3. **dispatcher.** For each incoming `Commit`, the engine computes the *touched scope set* — the union of:
   - `commit.chunks_modified` — chunks whose body, spec, or name changed (each is itself a scope a subscriber may have registered on).
   - Scope side of `commit.placements_modified` — scopes that gained or lost a placement.
   - Chunk side of `commit.placements_modified` — chunks whose own placements changed (each is itself a scope).
   - For each chunk in `chunks_modified`, the scopes it is currently placed on (both `instance` and `relates`) — so a subscriber on a parent scope sees an event when a member's body changes. Computed via one bulk `current_placements` lookup per commit.

   The dispatcher iterates the subscription registry and fires `scope_changed` on every subscription whose `scopes` intersect the touched set. The lookup-per-commit is the dispatcher's main cost; coalescing under high write rates is a deferred optimization (see *Backpressure*).

4. **transport.** Each subscription holds a transport reference:
   - **Webview.** The host's `WebView` handle plus a JS-side dispatcher name. The engine asks the host (on its main thread, as wry requires) to call `webview.evaluate_script("__sdk.event(<json>)")`.
   - **VM program.** The child's stdin handle. The engine writes a JSON line.

5. **SDK.** Distinguishes by message shape (`event` field present → event; `id` + `result|error` → response), routes to the registered subscription's callback. `useScope(ids)` re-fetches via `scope(ids)` and re-renders.

### Subscription lifecycle

- `subscribe(ctx, scopes)` — engine boundary-checks the scopes against `ctx.process_id`'s read boundary. On pass: register `(SubscriptionId, ProcessId, scopes, transport)` and return the id. On fail: `BOUNDARY_VIOLATION`.
- Subscriptions are owned by the calling process. When a process reaches terminal state, the engine drops all its subscriptions before any further event dispatch can reach them.
- `unsubscribe(id)` — removes from the registry; transport reference dropped. Idempotent — unsubscribing an unknown id is a no-op.
- Boundaries are checked **only at subscribe time.** Process boundaries are immutable for the run, so a once-allowed subscription stays allowed for its lifetime.

### Race-tolerant delivery

Subscription state and event dispatch are concurrent; the spec is tolerant of natural races.

- **Unsubscribe during dispatch.** If a subscription is unsubscribed between the dispatcher computing the touched-set and firing the event, the event is silently dropped for that subscription (the registry no longer holds it). On the SDK side, an event arriving after a local `unsubscribe` is ignored — the SDK's callback registry was cleared on unsubscribe.
- **Terminal during dispatch.** Same shape: the engine drops the process's subscriptions before terminal-state cleanup completes; in-flight events for those subscriptions are dropped.

### Subscription invalidation

Process boundaries are immutable, but reachability through them is dynamic — a placement removal elsewhere in the substrate can sever the path from a process's boundary to a subscribed scope. The engine takes responsibility for cleanup rather than letting subscriptions go zombie:

- On every commit whose `placements_modified` includes a removal (`active = 0`) of an `instance` placement, the engine recomputes reachability for any subscription whose scopes might now be unreachable from their process's read boundary.
- Subscriptions whose scopes have become unreachable: removed from the registry, `subscription_invalid` event fired with a short reason.
- After `subscription_invalid`, the engine fires no further `scope_changed` events for that subscription.
- The SDK's `useScope` hook treats this as "subscription is dead" — stops re-fetching, returns `undefined`. Imperative `subscribe` callers receive an explicit signal. Programs that want continued visibility re-subscribe under a reachable scope.

Cost: one boundary walk per affected subscription per relevant commit (same shape as the original subscribe-time check). The dumb implementation recomputes reachability for every subscription on the affected process; an optimization that tracks which placements each subscription's reachability depends on is deferred.

### Backpressure

The engine's input from db is a bounded `broadcast::Receiver`. On overflow, a `Lagged` marker arrives in the receiver. The engine forwards a `lagged` event listing every currently-active subscription id; the SDK re-fetches the affected scopes. Slow subscribers do not block the writer and do not block the engine's dispatcher — the dispatcher's per-subscription send is non-blocking, and a slow transport drops the subscription with a final `lagged` event.

Lagged events for already-unsubscribed subscriptions are dropped the same way as `scope_changed` events (race-tolerant).

Coalescing multiple commits in a tight burst into a single `scope_changed` per subscription is deferred. The pilot fires one event per touching commit; acceptable for expected volumes.

---

## Run and Await Mechanics

How `run` returns immediately and `await` blocks until processes reach terminal state.

### Process state and watchers

The engine holds a per-active-process slot:

```rust
struct ProcessSlot {
    status:  watch::Sender<ProcessStatus>,   // pending | running | completed | failed
    spawn:   SpawnHandle,                    // child process, or webview ref
    timeout: Option<JoinHandle<()>>,         // pending timeout future
    config:  RunConfig,                      // resolved boundaries, timeout_ms
}
```

The process map is `HashMap<ProcessId, ProcessSlot>` guarded by a Mutex. Slots are created on `run` and removed on terminal-state transition.

### `run`

The slot is inserted *before* the substrate write so that `cancel` and `timeout` can always land on a known process_id. The process chunk's body starts at `status: 'pending'`; cleanup writes the final status via a follow-up commit on terminal transition.

1. **Generate `process_id`** and compose the declaration. Process chunk + read-boundary chunk + write-boundary chunk + the caller's argument chunks (see *Process Creation*).
2. **Insert the slot.** Status `pending`. Register the timeout JoinHandle (fires after `timeout_ms`).
3. **`db.commit(declaration)`** — atomic. If commit fails, remove the slot and return error.
4. **Spawn.** VM runtime: spawn the executable via `tokio::process::Command` inside the program's VM, attach stdin/stdout. Webview runtime: ask the host to mount a webview; the host returns a `WebViewRef`.
5. **Flip status to `running`** once the spawn is alive (VM: child PID reported; webview: navigated).
6. **Return `process_id`.**

If `cancel(process_id)` or the timeout fires between any of steps 2–5, the slot's status flips to `failed`. The next step in the run path checks status before proceeding: the spawn step is skipped, the running flip is skipped, and cleanup (below) takes over. The process chunk in the substrate, born `pending`, gets a follow-up commit to status `failed` during cleanup.

`cancel(process_id)` is idempotent. A cancel for a `process_id` whose slot does not exist — either because the slot hasn't been inserted yet, has already been removed, or never existed — returns `Ok`. The desired state ("process is not running") is satisfied; callers don't need to race against terminal cleanup. The same applies to cancel for an already-terminal process.

### `await_processes`

```rust
pub async fn await_processes(&self, ctx: &Context, ids: &[ProcessId])
    -> Result<HashMap<ProcessId, ScopeResult>, EngineError>
{
    // 1. Boundary-check each id against ctx.
    // 2. For each id, get the watch::Receiver. If the process is already
    //    terminal (or unknown to the slot map but present in the substrate),
    //    short-circuit to terminal.
    // 3. Concurrently await each receiver until it observes terminal.
    // 4. db.scope(process_id) for each, collect into the map.
    // 5. Return.
}
```

VM and webview programs reach terminal state differently:

| Runtime | `completed` signal | `failed` signal |
|---|---|---|
| VM | stdout closed AND exit code 0 | stdout closed AND exit code ≠ 0; OR `cancel`; OR timeout; OR malformed output |
| Webview | The user closes the tile (host unmounts the webview) | `cancel`; OR timeout |

`cancel(processId)` and timeout both flip the watcher to `failed` and tear down the spawn. Multiple programs may await the same process; `watch::Receiver` broadcasts the terminal state to every awaiter.

### Cleanup on terminal state

When a process transitions to a terminal status:

1. **Update the process chunk** via `db.commit()` — `body.status`, `body.error?`.
2. **Drop the spawn.** Kill the program's process if still running; unmount webview if still mounted.
3. **Cancel the timeout JoinHandle** if pending.
4. **Unregister all subscriptions** owned by the process.
5. **Cascade to children.** For every active process placed `instance` on this one (its tool calls and nested runs), trigger the same terminal transition with `body.error: 'parent ended'`. Recursive — children-of-children cascade the same way.
6. **Resolve any awaiting `watch::Receiver`s** (handled by the `watch::Sender`'s final state plus its Drop).
7. **Remove the slot** from the process map.

A child process never outlives its parent. If the parent's intent ended (completed, failed, cancelled), the child's work has nowhere to be claimed — its results would be orphaned.

The slot's existence is the ground truth for "process is active." Once removed, a future `await` for that id reads terminal state from the substrate directly.

---

## Tool Calls Are Just Runs

An agent making a tool call uses the same `run` operation. The engine treats it identically to a top-level run from the host:

1. Program calls `run(target-program, args)` via the protocol.
2. Engine creates the process chunk for the target program, placed on the agent's current process (not the session directly) so the tool-call trace is nested.
3. Engine computes the effective boundary: intersection of the parent run's effective boundary and the target program's intrinsic boundary.
4. Engine spawns the target program.
5. Engine returns the process id to the calling program immediately.
6. Calling program `await`s the process id when it needs the result, or continues its own work.
7. On `await`, engine returns the completed process's scope.

The agent separately records its own session-level `tool-call` and `tool-result` chunks for message reconstruction (see [`agent.md`](agent.md)). The process chunk itself is the authoritative trace of what happened; session chunks are the model-facing reconstruction.

Substrate operations (`scope`, `commit`, `subscribe`) from the agent are not tool calls — they go directly through the protocol and do not create process chunks. Only program-to-program runs create processes.

---

## Traceability

Every commit the substrate records carries a `dispatch_id` column — the process id whose run caused it, or null for host-level commits the engine does on its own behalf. Commits stay in their own table; the read layer projects them as chunks under the virtual scope `commits_root`:

- `scope(db, [commits_root])` — all commits
- `scope(db, [commits_root, processId])` — commits from this specific run
- `scope(db, [commits_root, chunkId])` — commits that modified this chunk

No new tables, no circular placements. Commits look like chunks to readers; they are structurally separate.

The substrate rejects mixing real and virtual scopes in one query (see [`db.md`](db.md)) — `scope(db, [my_scope, commits_root])` returns `INVALID_REQUEST` from the engine. The engine surfaces this as `INVALID_REQUEST` in the protocol; programs that need both must issue two scope calls.

---

## Containment

The pilot uses split containment. Programs that declare broad capabilities — network, filesystem, shell — run inside a lightweight Linux VM. Programs with only a DOM surface run on the host inside the webview the host gave them. The webview sandbox contains view programs at the OS level; the engine's boundary enforcement contains them at the substrate level. The VM contains tool programs at both levels.

The uniform-VM alternative — every program in one VM with DOM streamed to host webviews — is on the horizon. See [`horizon.md`](../horizon.md). The same protocol, process lifecycle, and boundary enforcement serve either model; only where programs run differs.

---

## Operational Behavior

### Timeouts

`run`'s optional `timeout` is written to the process body as `timeout_ms`. If omitted, the engine uses the program's own `body.timeout_ms`. Defaults: tool programs (filesystem, shell, web) 30000 ms; agent programs (claude) 300000 ms. On expiry the engine kills the spawned executable and sets `status: 'failed'` with `body.error: 'timeout'`.

### Error Classification

Not every error kills a program. Informational errors return as protocol responses; the program continues and can recover.

| Condition | Engine response |
|---|---|
| Boundary violation (scope, subscribe) | `BOUNDARY_VIOLATION` response; process continues |
| Boundary violation (commit) | `BOUNDARY_VIOLATION` response; process continues |
| Spec violation (commit) | `VALIDATION_ERROR` response; process continues |
| Write to protected chunk | `BOUNDARY_VIOLATION` response; process continues |
| Malformed request | `INVALID_REQUEST` response; process continues |
| Unparseable stdout line | Kill; `status: 'failed'`, `body.error: 'protocol: malformed output'` |
| Exec exits non-zero | `status: 'failed'` |
| Timeout | Kill; `status: 'failed'`, `body.error: 'timeout'` |
| VM program stdout closes, exit code unreadable | `status: 'failed'`, `body.error: 'killed'` |
| Webview destroyed mid-response | The pending request's Promise rejects with `EngineError { code: 'TRANSPORT_CLOSED' }` on the SDK side; the engine cancels the process if not already terminal |

Parse failures and crashes are terminal. Everything else is informational.

### Startup Reconciliation

When the engine starts, it queries every process with status `pending` or `running` and marks them `failed` with `body.error: 'engine restart'`. Those processes are gone; the engine does not attempt to resume them. Subscriptions are not persisted across restarts; they live only in the engine's in-memory registry and disappear on shutdown. Children of failed parents fall out of the cascade rule above (parent ending cascades to children) — at restart, every parent is failed, so children are too; no special logic. Future work may introduce resumable services — deferred.

### Boundary-Request Behavior

An explicit `BOUNDARY_VIOLATION` is better than a silently empty read. The engine returns the error when a queried scope isn't reachable from the read boundary, so the program knows it asked for something it cannot see. Empty results mean genuinely empty scopes, not withheld ones.

---

## Client Library

Programs do not write raw protocol messages. They import the SDK and call typed functions — `scope`, `commit`, `run`, `await`, `subscribe`. The SDK serializes each call into the protocol's JSON shape and dispatches it through whichever transport the program runs under. Same API surface, two transports:

- **Webview programs** — the SDK calls `window.__wry_ipc.postMessage(...)`. The host's IPC handler deserializes, calls the corresponding engine function, and returns the result through wry's response channel.
- **VM programs** — the SDK writes a JSON line to stdout. The engine, which spawned the program inside its VM, reads each line and calls the corresponding engine function.

Implementation lives under [`pilot/sdk/`](sdk/) and is specified in [`pilot/sdk.md`](sdk.md) — one TypeScript package with two transport modules behind the same surface. The engine itself only exposes Rust functions; it does not ship a TS client.

---

## Code architecture

### Module layout

```
pilot/engine/
  src/
    lib.rs              — public re-exports
    types.rs            — Context, RunArgs, ProcessId, SubscriptionId,
                          ProcessStatus, SlotPhase, Event, HostCmd,
                          EffectiveBoundary, plus Display/From impls
    errors.rs           — EngineError (single enum); From<DbError>, From<ProtocolError>
    engine.rs           — Engine struct; open returns (Engine, mpsc::Receiver<HostCmd>);
                          shutdown(self) -> impl Future; impl Drop;
                          on_webview_ready callback
    bootstrap.rs        — reconcile_zombies(&Db): one scope query, one declarative commit
    process.rs          — ProcessSlot { phase: watch::Sender<SlotPhase>,
                                        spawn: SpawnHandle, timeout, config };
                          SpawnHandle enum; set_terminal, flip, cascade_children
    subscription.rs     — Subscription, TransportRef, SubscriptionRegistry;
                          insert / remove / iter_for_process
    reactivity.rs       — loop_task; handle_commit composed from compute_touched,
                          gather_fanout, gather_invalidations, apply
    protocol.rs         — Request | Response | Event JSON shapes;
                          dispatch_request(&Engine, &Context, Request) -> Response;
                          From<EngineError> for wire ErrorCode
    boundary.rs         — reachable, effective, intersect (stateless reads via &Db)
    vm.rs               — tokio::process::Command spawn; stdout JSON-line pump;
                          stdin event writer; cleanup
    ops/                — public surface; one module per Engine method
      mod.rs            — re-exports
      scope.rs          — Engine::scope    (reachable check → db.scope)
      commit.rs         — Engine::commit   (reachable + protected → db.commit)
      run.rs            — Engine::run      (insert slot → declaration → db.commit →
                                            spawn → flip phase → return)
      cancel.rs         — Engine::cancel   (set_terminal → cleanup)
      subscribe.rs      — Engine::subscribe / unsubscribe
      await_processes.rs — Engine::await_processes (async; phase watcher with
                                                    substrate fallback)
  tests/                — integration; oracle-checked against the TS engine
  Cargo.toml
```

Each `ops/*.rs` owns its method end-to-end via `impl Engine`. Internal modules (`engine`, `bootstrap`, `process`, `subscription`, `reactivity`, `protocol`, `boundary`, `vm`) are flat siblings — same posture as db's `validate.rs`, `virtual_chunks.rs`. No further folding: the engine has one structuring axis (the public ops) and serves it with one folder.

Webview "spawn" is a single `HostCmd::MountWebview` send and lives inline in `ops/run.rs`. Only the VM runtime warrants its own file; the asymmetry is real, not a coherence break.

### Within-file shape

Each file composes from small named functions. The public method (or task body) reads as a top-to-bottom narrative that calls private helpers, each doing one thing. `reactivity.rs` decomposes into six functions (`loop_task`, `handle_commit`, `compute_touched`, `gather_fanout`, `gather_invalidations`, `apply`) where the orchestrator is ~30 lines and each helper ~30–60. `vm.rs` decomposes into `spawn`, `stdout_pump_task`, `parse_line`, `write_event`, `cleanup`. `ops/run.rs` decomposes into the public `run` method plus `assemble_declaration`, `spawn_for_runtime`, `cleanup_on_failure`.

Comments are reserved for the genuinely non-obvious — race semantics, ordering invariants, channel-primitive quirks. Expected count across the whole crate: a handful, not a paragraph per file. Names carry the rest.

### Key mechanics

**State authority follows lifecycle.** A process has two natural homes — its slot (live runtime: spawn handle, phase watcher, timeout) and its substrate chunk (durable: status, error). The slot is authoritative while the process is active; the substrate is authoritative once the slot is gone. Authority transfers in one ordered step at terminal: cleanup writes the terminal status, then drops the slot. `await_processes` resolves either side — slot present, watch the phase; slot absent, read the substrate (always terminal there). One truth at any moment; the seam is the cleanup commit.

**Reactivity owns event emission.** The reactivity task is the engine's only consumer of `db.subscribe_scope(&[commits_root])` and the only emitter of `scope_changed` / `lagged` / `subscription_invalid`. Cleanup paths (cancel, timeout, child exit, parent cascade) trigger reactivity by writing terminal commits; they never emit events directly. This collapses what would otherwise be two writers to the subscription registry: subscription invalidation on terminal is reactivity's job, not cleanup's.

**Webview transport as commands.** The host's wry/tao machinery is main-thread and `!Send`. The engine never holds a `WebView`. `Engine::open` returns `(Engine, mpsc::Receiver<HostCmd>)`; the host drains the receiver on its event loop and translates each `HostCmd` (`MountWebview`, `UnmountWebview`, `EvaluateScript`) into a wry call. `ops::run` for a webview program sends `MountWebview` and returns; the host calls `Engine::on_webview_ready(process_id)` to flip the slot to `Running`. Outgoing events to webview subscriptions are `EvaluateScript` commands emitted by reactivity. This is the engine's only seam to non-`Send` code, expressed as data.

**Errors as one vocabulary.** The engine has one wire surface, so it has one error enum. `EngineError` carries every condition the protocol needs to express (`BoundaryViolation`, `ValidationError`, `InvalidRequest`, `NotFound`, `TransportClosed`, `Db`, `Protocol`). The protocol response builder maps `&EngineError` to a wire code via a single `match`; the VM stdout pump consults the same enum to decide whether parse failures are terminal. Two consumers, one enum — no scattered tables.

**Single writer where it matters; locks where it doesn't.** Reactivity is the sole emitter of events and the sole path that drops subscriptions on invalidation. The registry itself is `Mutex<HashMap>` because `ops::subscribe` inserts new entries — the lock is held only for insert/remove, never across an `await`. The processes map follows the same discipline: `ops::run` inserts, terminal triggers remove, `await_processes` clones a watch receiver. Mutex is the dumb-clear choice for shared state with brief critical sections.

**Async surface mirrors db's.** `scope`, `commit`, `run`, `cancel`, `subscribe`, `unsubscribe` are sync (the substrate is sync). `await_processes` and `shutdown` are async. The reactivity task and per-VM stdio pumps run on tokio, spawned via a `tokio::runtime::Handle` stored on `Engine` at `open`. The host calls `Engine::open` from within its tokio runtime context.

### Settled choices

- **Single `EngineError` enum** (not per-op like db). Engine has one wire surface; one vocabulary serves it. Principled divergence from db, justified by surface shape.
- **`HostCmd` channel** as the host integration seam. Commands as data; engine = producer, host = consumer on its main loop. Honors `!Send` host machinery without leaking it into engine state.
- **`tokio::sync::watch`** for `SlotPhase`. Multi-awaiter; late readers see the final value via `borrow()` after the sender drops.
- **`tokio::sync::broadcast::Receiver`** for the db change feed; one receiver, owned by the reactivity task.
- **`tokio::sync::mpsc`** for `HostCmd` and per-VM stdin event queues. Bounded; drop-on-full surfaces a `lagged` event.
- **`std::sync::Mutex`** for registries. Never held across `await`.
- **`tokio::runtime::Handle`** stored on `Engine` at `open`, used to spawn tasks from sync entry points.
- **`Engine::shutdown(self)`** consumes self: cancels reactivity via `CancellationToken`, awaits the join, runs terminal cleanup on every active process. `impl Drop` aborts reactivity as best-effort fallback.
- **Bootstrap as one declarative commit.** `reconcile_zombies` does one `db.scope` for `pending|running` processes, then one commit setting each to `failed` with `error: "engine restart"`.
- **No builders.** Direct `RunArgs` / `Declaration` construction; free-function helpers where useful.
- **`thiserror`** for `EngineError`; `From<DbError>` and `From<ProtocolError>` for ergonomic `?`.

---

## What Is Open

- **Named, reusable boundaries.** The pilot creates a fresh boundary chunk per run. A user wanting to reuse a boundary ("my agent-wide boundary") would do so by saving a named chunk and referencing it from multiple runs. The substrate supports this; the engine and UX do not yet.
- **Services.** A process whose executable lives beyond the completion of a single render or request. Requires lifecycle beyond `pending → running → completed`. Held as a direction; not in the pilot.
- **Subscription coalescing.** Multiple commits in a tight burst could fire one combined `scope_changed` per subscription instead of one per commit. Deferred until the per-event volume warrants it.
