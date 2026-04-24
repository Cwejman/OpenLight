# Engine

The engine is the authority on running programs against the substrate. A program is a chunk with an executable; to run one is to create a process. The engine creates processes, enforces boundaries, spawns executables, and mediates every substrate operation a running program attempts. Nothing runs without going through the engine, and no program touches the database directly.

The engine is a TypeScript module. The pilot runs it as a subprocess the host spawns on start. It speaks one protocol — JSON lines over stdio — to the host that routes it to webview-hosted programs, and to programs running directly as subprocesses (such as tools in a containment VM). The shape is identical either way; the SDK hides the transport.

When the engine is eventually rewritten in Rust, the subprocess hop collapses into a function call. The protocol doesn't change and programs don't know the difference.

---

## What the Engine Owns

- **Process creation.** The act of running a program is `dispatch`; the resulting artifact is a `process` chunk. The engine creates the process chunk in one atomic `apply()`, placing it on the program by identity and on its session (or parent process, for tool calls) so it's visible where it belongs. The process chunk is engine-owned — a running program cannot modify its own process chunk or the boundary chunks attached to it.
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
    surface: 'none' | 'dom' | 'wgpu'
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
| `scope` | Read the intersection of scopes. Filtered by the effective read boundary. Connected scopes outside the boundary appear as visible topology (names, counts) but are not readable. |
| `search` | Full-text search across readable scopes. |
| `apply` | Write a Declaration. Rejected if any chunk or placement touches a scope outside the write boundary. |
| `run` | Start a new program run. Returns the process id immediately. Used internally by the engine for tool calls. |
| `await` | Block until one or more processes reach a terminal state. Returns each process's final scope. |

### Schema

Every request has an `op` and a monotonic `id`. Every response pairs the same `id` with either `result` or `error`.

```jsonl
{"id":1,"op":"scope","scopes":["chunk_abc","chunk_def"]}
{"id":2,"op":"search","query":"session today"}
{"id":3,"op":"apply","declaration":{"chunks":[...]}}
{"id":4,"op":"run","program":"filesystem","args":{...}}
{"id":5,"op":"await","processes":["p_1","p_2"]}
```

| Op | Result shape |
|---|---|
| `scope` | `ScopeResult` (scope chunks, items, connected scopes) |
| `search` | `ChunkItem[]` |
| `apply` | `ApplyResult` (commit id + created chunk ids) |
| `run` | `{ process: string }` — the process chunk id |
| `await` | `Record<string, ScopeResult>` — process id → final scope |

**Errors:**

| Code | Meaning |
|---|---|
| `BOUNDARY_VIOLATION` | Read or write outside the effective boundary |
| `VALIDATION_ERROR` | Declaration fails spec validation |
| `NOT_FOUND` | Referenced chunk or program does not exist |
| `RUN_FAILED` | A run the program started ended non-zero |
| `INVALID_REQUEST` | Malformed JSON, unknown op, missing fields |

The types (`ScopeResult`, `ChunkItem`, `Declaration`, `ApplyResult`) are the substrate library's types.

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

The host also calls the engine directly to drive top-level program runs from user action. Three functions plus lifecycle:

```typescript
type RunArgs = {
  chunks: ChunkDeclaration[]       // typed arguments assembled by the caller
  readBoundary: string[]           // scope ids
  writeBoundary: string[]          // scope ids
  timeout?: number                 // defaults to the program's body.timeout_ms
}

type RunResult = {
  processId: string                // the process chunk id
}

function bootstrap(dbPath: string, projectPath: string): Engine
function run(engine: Engine, programId: string, args: RunArgs): RunResult
function cancel(engine: Engine, processId: string): void
function shutdown(engine: Engine): void
```

The engine is program-agnostic. `RunArgs.chunks` are whatever the program's composed spec accepts — the engine places them on the process chunk and the substrate's spec enforcement validates the contract. Boundary arrays are the scope roots the caller permits this run to reach; the engine builds boundary chunks from them and computes the effective boundary.

---

## Process Creation — What the Declaration Looks Like

A single atomic `apply()` creates:

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

Substrate operations (`scope`, `apply`, `search`) from the agent are not tool calls — they go directly through the protocol and do not create process chunks. Only program-to-program runs create processes.

---

## Traceability

Every commit the substrate records carries a `dispatch_id` column — the process id whose run caused it, or null for host-level applies the engine does on its own behalf. Commits stay in their own table; the read layer projects them as chunks under the virtual scope `COMMITS_SCOPE`:

- `scope(db, [COMMITS_SCOPE])` — all commits
- `scope(db, [COMMITS_SCOPE, processId])` — commits from this specific run
- `scope(db, [COMMITS_SCOPE, chunkId])` — commits that modified this chunk

No new tables, no circular placements. Commits look like chunks to readers; they are structurally separate.

---

## Containment — The Fork

The pilot holds two coherent paths for how programs are isolated. Both use the same protocol, the same process lifecycle, the same boundary enforcement. They differ only in where programs run.

**Split containment.** Programs that declare broad capabilities — network, filesystem, shell — run inside a lightweight Linux VM. Programs with only a DOM surface run on the host inside the webview the host gave them. The webview sandbox contains view programs at the OS level; the engine's boundary enforcement contains them at the substrate level.

**Uniform containment.** All programs run inside one VM. View programs produce DOM; the engine streams DOM operations from the VM-side program to a thin shim in the host's webview, which applies them. User events flow back through the same channel. Pixel-level rendering stays on the host; view code stays in the VM.

Both paths are architecturally clean. Split is faster to build and shorter for the pilot. Uniform is more consistent and sets up peering more naturally. The full treatment — what the tech actually does, what it costs, what it buys — lives in [`horizon.md`](../horizon.md).

Decision point: before the host is built, the pilot commits to one. The specs here remain true either way.

---

## Operational Behavior

### Timeouts

`run`'s optional `timeout` is written to the process body as `timeout_ms`. If omitted, the engine uses the program's own `body.timeout_ms`. Defaults: tool programs (filesystem, shell, web) 30000 ms; agent programs (claude) 300000 ms. On expiry the engine kills the spawned executable and sets `status: 'failed'` with `body.error: 'timeout'`.

### Error Classification

Not every error kills a program. Informational errors return as protocol responses; the program continues and can recover.

| Condition | Engine response |
|---|---|
| Boundary violation (scope, search) | `BOUNDARY_VIOLATION` response; process continues |
| Boundary violation (apply) | `BOUNDARY_VIOLATION` response; process continues |
| Spec violation (apply) | `VALIDATION_ERROR` response; process continues |
| Write to protected chunk | `BOUNDARY_VIOLATION` response; process continues |
| Malformed request | `INVALID_REQUEST` response; process continues |
| Unparseable stdout line | Kill; `status: 'failed'`, `body.error: 'protocol: malformed output'` |
| Exec exits non-zero | `status: 'failed'` |
| Timeout | Kill; `status: 'failed'`, `body.error: 'timeout'` |

Parse failures and crashes are terminal. Everything else is informational.

### Startup Reconciliation

When the engine starts, it queries every process with status `pending` or `running` and marks them `failed` with `body.error: 'engine restart'`. Those processes are gone; the engine does not attempt to resume them. Future work may introduce resumable services — deferred.

### Boundary-Request Behavior

An explicit `BOUNDARY_VIOLATION` is better than a silently empty read. The engine returns the error when a queried scope isn't reachable from the read boundary, so the program knows it asked for something it cannot see. Empty results mean genuinely empty scopes, not withheld ones.

---

## Client Library

Programs do not write raw protocol messages. They import the SDK and call typed functions — `scope`, `apply`, `run`, `await`. The SDK serializes to JSON lines and wraps correlations. Programs that run in webviews use an SDK that routes through the host's wry IPC channel; programs that run as subprocesses (tools in a VM) use an SDK that writes to stdout directly. Same API surface, different transport.

The engine's client module (`engine/client.ts`) provides the subprocess-side SDK. The webview-side SDK lives under `pilot/sdk/` and wraps the same operations over the wry IPC bridge.

---

## What Is Open

- **Containment model.** See the fork above. Decision precedes host construction.
- **Named, reusable boundaries.** The pilot creates a fresh boundary chunk per run. A user wanting to reuse a boundary ("my agent-wide boundary") would do so by saving a named chunk and referencing it from multiple runs. The substrate supports this; the engine and UX do not yet.
- **Services.** A process whose executable lives beyond the completion of a single render or request. Requires lifecycle beyond `pending → running → completed`. Held as a direction; not in the pilot.
- **Engine-as-library.** The engine is a subprocess for the pilot. Migration to a Rust in-process library is a tracked move in [`horizon.md`](../horizon.md).
