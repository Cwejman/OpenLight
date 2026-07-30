# Engine

The engine is the authority on running programs against the substrate. A program is a chunk with an executable; to run one is to create a process. The engine creates processes, enforces boundaries, spawns executables, and mediates every substrate operation a running program attempts. Nothing runs without going through the engine, and no program touches the database directly.

The engine is a Rust crate compiled into the host binary. The host calls engine functions directly — there is no separate engine process and no JSON-lines hop between host and engine. Programs reach those functions through one protocol over two transports — wry IPC for webview programs, stdio JSON-lines for VM programs — identical in shape regardless of transport; the SDK hides the difference. Mechanics are in *The Program Protocol* below and [`sdk.md`](sdk.md).

The engine federates across multiple substrate dbs — one read-write **active project** plus zero or more read-only **mounts**. Programs see one logical field; the engine routes reads and boundary walks across all mounts transparently. Reactivity flows only from the active project's commits in v0.1 — read-only mounts have no in-process writer to fire events. See [`pilot.md`](../pilot.md#multi-project-mounts) for the project/mount model.

---

## What the Engine Owns

- **Process creation.** Running a program creates a `process` chunk in one atomic `db.commit()` — its placements are defined in *Program and Process*. The process chunk is engine-owned: a running program cannot modify its own process chunk or the boundary chunks attached to it.
- **Boundary enforcement.** Every scope read, every write, every nested program run is checked. The engine computes the effective boundary as the intersection of the program's intrinsic boundary and the boundary the user (or parent process) set at run time. Reads outside the read boundary return `BOUNDARY_VIOLATION`. Writes outside the write boundary are rejected.
- **Program lifecycle.** The engine spawns the program's executable, tracks its status through `pending → running → completed | failed`, updates the process chunk as state changes, kills on timeout or cancel. The program itself does not set its status — it simply exits.
- **Protocol mediation.** The engine receives every substrate operation a running program attempts, validates it, executes it via the substrate library, returns the result. Programs do not carry database access; the protocol is the boundary.
- **Containment.** The engine asks the registered runtime provider to spawn each program. Containment lives in the provider, not in engine code; engine knows runtime kinds only as registry keys.
- **Mount registry.** The engine holds the active project and all mounted peer projects. Federated reads and boundary walks iterate the registry; reactivity subscribes only to read-write mounts (one in v0.1). Writes referencing read-only mounts are rejected.

## Program and Process

```
engine/program
  spec: { required: ['executable', 'runtime'] }
```

`engine/program` enforces `executable` and `runtime` via spec — the engine needs both to dispatch. Other body fields a program may carry — `capabilities`, `timeout_ms` — are optional and documented in the archetype's own body content, not in the spec mechanism. The substrate is self-describing: what an instance of `engine/program` "should" carry lives where any reader of the substrate can find it. A program's intrinsic boundary is expressed as a `relates` placement on a boundary chunk, not as a body field — absence of placement means the program defers all boundary concerns to the run.

Concrete programs — filesystem, shell, claude, echo, read-tile, sidebar — are chunks placed `instance` on `engine/program`.

```
engine/process
  spec: { propagate: true }
```

A process chunk's body carries engine-written state — `status`, `started`, `pid`, `timeout_ms`, `error?`. These are engine domain (the process chunk itself is in the protected set; programs cannot rewrite their own status). Documentation of the body shape lives in the archetype's body, same as `engine/program`.

A process is `instance` on `engine/process` (so every run shows up in the process scope) AND `instance` on the program it runs (so the program's scope lists its runs). The caller of `run` may also request additional `instance` placements — the host passes the host/session id at top-level runs so the process appears in the sidebar; tool calls pass the parent process id so the trace nests. Engine itself doesn't know about `host/session`; the placement is the caller's choice.

The two boundary chunks for a run (read-boundary and write-boundary) are `relates` on the process; their content (the scope roots they grant reach over) is `relates` placements on each boundary chunk respectively.

Concrete topology for a run with read roots `[R1, R2]` and write roots `[W1]`:

```
process chunk P
  placements:
    instance on engine/process
    instance on <program>
    instance on <each caller-supplied scope, e.g. host/session>

read-boundary chunk B_r
  placements:
    instance on engine/read-boundary       — typing
    relates on P                           — execution config of this run

R1, R2 (existing chunks the boundary grants reach over)
  added placement (per root):
    relates on B_r

write-boundary chunk B_w  — same shape as B_r
W1 — same shape as R1, R2 with relates on B_w
```

Reading the boundary at use time: walk `relates` from the process to find boundary chunks (filtered to those `instance` on the appropriate boundary archetype); walk `relates` from each boundary chunk to find its scope roots.

```
engine/mount  (virtual)
  — Both archetype and instances synthesized by the engine at query time
    from its in-memory mount registry; not stored in any db.
  body carries: project_id, branch, mode, commit?
```

`engine/mount` is a virtual scope, in the same family as `db/commits` and `db/branches` — neither archetype nor instances live in any db. The engine synthesizes both at query time from its mount registry. Every chunk surfaced from mount X carries a synthesized `relates` placement on X's `engine/mount` instance — provenance through native substrate plumbing. Programs can `scope([engine_mount_root])` to list current mounts; intersect any scope with a specific mount instance to narrow to chunks from that mount (e.g., `db/commits ∩ engine/mount[X]` for commits from mount X, or `engine/program ∩ engine/mount[X]` for invocables defined there).

---

## The Program Protocol

One JSON-lines protocol serves every program regardless of where it runs.

**Operations a running program can call on the engine:**

| Operation | Description |
|---|---|
| `scope` | Read the intersection of scopes. Filtered by the effective read boundary. Connected scopes outside the boundary appear as visible topology (names, counts) but are not readable. FTS filtering via `ScopeOpts.match_`; an **empty scope list with `match_`** is a whole-field FTS query, boundary-filtered and federated like any read. Negation via `ScopeOpts.exclude` (set difference; excluded roots boundary-checked like positive ones). Pagination and body-less projection per substrate.md (*Pagination and projection*). |
| `get` | Fetch a single chunk by id. Returns `null` if the chunk does not exist; rejected if the chunk is outside the read boundary. Honors `at` for temporal point reads. Convenience over `scope([id])` when only the chunk itself is wanted (no placements, no dimensions). |
| `read_batch` | Multiple tagged `scope`/`get` sub-queries resolved together at **one commit snapshot**, each authorized under its own identity (see *Multiplexed transports* below). One request, coherent results — the resolution primitive behind slot-and-hook views (`programs.md` §3.5). |
| `commit` | Write a Declaration. Rejected if any chunk or placement touches a scope outside the write boundary. `dry_run: true` runs full validation without writing, returning structured errors — the live-form affordance. |
| `run` | Start a new program run. Returns the process id immediately. `mode: 'child'` (default) nests the process on the caller and enrolls it in the caller's cascade — composed work. `mode: 'launch'` detaches: the process is placed on the caller's session scopes instead and survives the caller — boundaries still intersect with the caller's at spawn, so detachment never escalates. Surfaces and the palette launch; orchestrators and agents run children. |
| `await` | Wait for one or more processes to reach a terminal state. Returns each process's final scope. `opts.results_only` filters each returned scope to chunks `instance` on result-role archetypes (plus counts). The call suspends the calling task; it doesn't block the engine. |
| `cancel` | Request a process's terminal transition. Authorized when the target is a descendant of the caller, or the target's process chunk is within the caller's write boundary. Idempotent. |
| `exit` | The calling program requests its own terminal transition (`completed`) — the self-dismissal path for webview programs; trivially safe. |
| `subscribe` | Register on a set of scopes; returns a subscription id. The engine pushes `scope_changed` events when commits touch those scopes. |
| `unsubscribe` | Cancel a subscription by id. |

### Schema

Every request has an `op` and a monotonic `id`. Every response pairs the same `id` with either `result` or `error`.

```jsonl
{"id":1,"op":"scope","scopes":["chunk_abc","chunk_def"],"opts":{"match_":"session today","exclude":["chunk_hidden"],"limit":50}}
{"id":2,"op":"get","chunkId":"chunk_abc","opts":{"at":"...","branch":"...","include":{"body":false}}}   // opts optional
{"id":3,"op":"read_batch","reads":[{"tag":"a","scopes":["s1"]},{"tag":"b","scopes":["s2"],"opts":{...}}]}
{"id":4,"op":"commit","declaration":{"chunks":[...]},"dry_run":false}
{"id":5,"op":"run","program":"filesystem","args":{...,"mode":"child"}}
{"id":6,"op":"await","processes":["p_1","p_2"],"opts":{"results_only":true}}
{"id":7,"op":"cancel","process":"p_1"}
{"id":8,"op":"exit"}
{"id":9,"op":"subscribe","scopes":["my-session"]}
{"id":10,"op":"unsubscribe","subscriptionId":"sub_1"}
```

| Op | Result shape |
|---|---|
| `scope` | `ScopeResult` |
| `get` | `ChunkItem \| null` |
| `read_batch` | `{ head: CommitId, results: Record<tag, ScopeResult \| ChunkItem \| null \| EngineError> }` — one snapshot, per-tag results or per-tag boundary errors |
| `commit` | `Commit` (with `dry_run`: `{ valid: boolean, errors: [...] }`) |
| `run` | `{ process: string }` — the process chunk id |
| `await` | `Record<string, ScopeResult>` — process id → final scope |
| `cancel` | `{}` |
| `exit` | `{}` — terminal transition follows |
| `subscribe` | `{ subscriptionId: string }` |
| `unsubscribe` | `{}` |

**Errors:**

| Code | Meaning |
|---|---|
| `BOUNDARY_VIOLATION` | Read or write outside the effective boundary |
| `READ_ONLY_MOUNT` | Commit modifies a record resident in a read-only mount (reference alone is legal — see *Read-only enforcement*) |
| `VALIDATION_ERROR` | Declaration fails spec validation |
| `NOT_FOUND` | Referenced chunk, program, or subscription does not exist |
| `RUN_FAILED` | A run the program started ended non-zero |
| `INVALID_REQUEST` | Malformed JSON, unknown op, missing fields |
| `TRANSPORT_CLOSED` | The program's transport closed mid-response (webview destroyed, VM stdio gone); the pending call rejects on the SDK side |

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

`run` creates the process chunk and spawns the program's executable. It returns the process id immediately. The spawned program runs on its own. `await` waits on a set of process ids until they reach a terminal state — it suspends the calling task (in an async runtime), it doesn't block the engine.

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
pub struct Engine { /* mounts, processes, subscriptions, runtime registry, ... */ }

pub struct Context {
    pub process_id: Option<ProcessId>,  // None = host-initiated; Some = caller's process
}

pub struct RunArgs {
    pub program_id:      ChunkId,
    pub chunks:          Vec<ChunkDeclaration>,   // typed arguments
    pub placements:      Vec<ChunkId>,            // additional scopes to place
                                                  // the new process on (e.g. host
                                                  // passes the host/session id;
                                                  // tool calls pass parent process)
    pub mode:            RunMode,                 // child (default) or launch
    pub read_boundary:   BoundarySpec,            // build fresh OR reuse a chunk
    pub write_boundary:  BoundarySpec,
    pub timeout_ms:      Option<u64>,             // overrides program body
}

pub enum RunMode {
    /// Composed work: nest instance on the caller's process; cascade on
    /// the caller's terminal transition. The default.
    Child,
    /// Detached: place instance on the caller's session scopes instead;
    /// survives the caller. Boundaries still intersect with the caller's
    /// at spawn — detachment never escalates.
    Launch,
}

pub enum BoundarySpec {
    /// Build a fresh boundary chunk from these scope roots.
    Roots(Vec<ChunkId>),
    /// Reuse an existing boundary chunk (named, shared across runs).
    Existing(ChunkId),
}

pub struct ProjectId(String);              // canonical absolute filesystem path
pub enum MountMode { ReadWrite, ReadOnly }

impl Engine {
    pub fn open() -> Result<(Engine, mpsc::Receiver<HostCmd>), OpenError>;
    pub async fn shutdown(self) -> Result<(), ShutdownError>;

    // mount registry — host calls these at boot, before the first run
    pub fn mount_project(
        &self, id: ProjectId, db: Arc<Db>, mode: MountMode, branch: BranchName,
    ) -> Result<(), MountError>;
    pub fn unmount_project(&self, id: &ProjectId) -> Result<(), MountError>;

    // runtime registry — host registers providers at boot
    pub fn register_runtime(
        &self, kind: RuntimeKind, provider: Arc<dyn RuntimeProvider>,
    ) -> Result<(), RegisterError>;

    // sync — return immediately
    pub fn scope(&self, ctx: &Context, scopes: &[ChunkId], opts: ScopeOpts)
        -> Result<ScopeResult, EngineError>;
    pub fn get(&self, ctx: &Context, chunk_id: &ChunkId, opts: ReadOpts)
        -> Result<Option<ChunkItem>, EngineError>;
    pub fn commit(&self, ctx: &Context, decl: Declaration)
        -> Result<Commit, EngineError>;
    pub fn run(&self, ctx: &Context, args: RunArgs)
        -> Result<ProcessId, EngineError>;
    pub fn cancel(&self, ctx: &Context, process_id: &ProcessId)
        -> Result<(), EngineError>;   // authorized: descendant of ctx, or target
                                      // within ctx's write boundary; host (None) unrestricted
    pub fn subscribe(&self, ctx: &Context, scopes: &[ChunkId])
        -> Result<SubscriptionId, EngineError>;
    pub fn unsubscribe(&self, sub_id: SubscriptionId);

    // async — Future resolves on terminal-state transition
    pub async fn await_processes(&self, ctx: &Context, ids: &[ProcessId])
        -> Result<HashMap<ProcessId, ScopeResult>, EngineError>;
}
```

The engine has no runtime-specific entry points. Readiness signaling (e.g., a webview has been mounted and navigated, a VM child has attached its stdio) is owned by the runtime provider — `spawn` returns a `RuntimeHandle` that includes a `ready` signal the engine awaits to flip the slot status to `Running`. See *Runtime providers* below.

**Boot lifecycle.** Host opens engine (no db yet), registers runtime providers (`register_runtime`), then mounts projects in any order. The active project is mounted with `ReadWrite`; peers with `ReadOnly`. Reconciliation of zombie processes (`pending|running` from a previous run) happens on `ReadWrite` mounts only; peer dbs may carry stale process chunks but the engine cannot rewrite them.

**The engine is program-agnostic and runtime-agnostic.** `RunArgs.chunks` are whatever the program's composed spec accepts. The engine looks up the program's `runtime` field as a registry key and asks the registered `RuntimeProvider` to spawn — it does not have built-in knowledge of `vm` or `webview`.

**`Context::process_id = None`** marks a host-initiated call (the user opening a tile, the host's own bootstrap). The engine treats it as having full read and write reach over the active project — full reach across mounts is read-only by default. `Some(process_id)` resolves boundaries from the named process chunk's attached boundary chunks.

**Federated reads and boundary.** `scope` and boundary walks iterate the mount registry. Reads union and dedupe across mounts; boundary walks traverse instance chains across mounts. Programs see one field; the federation is invisible to them. Unresolved roots federate by **intersection**: a root lands in `ScopeResult.unresolved` only when no mount resolves it — dead everywhere, or not dead at all.

**Reactivity is single-source in v0.1.** Only read-write mounts can fire commits in this process, and v0.1 has exactly one read-write mount: the active project. The reactivity dispatcher holds one `broadcast::Receiver` (from the active project's `Db`), filtered by the active project's branch. Read-only mounts have no in-process writer — they never fire commits — so subscribing to them would be dead code. When cross-host reactivity or dynamic mount writes land (horizon), the dispatcher extends to subscribe to additional sources; the architecture is ready (it's just `select!` over more receivers).

**Cross-db placements work because dbs are dumb.** A placement record stored in db_active can reference a `scope_id` whose chunk lives in db_engine — the placement just stores ULIDs, which are globally unique. To list `engine/program`'s instances, the engine queries every mount's `placements` table for `scope_id = engine/program` and unions; most peers return empty, the active project returns its own invocables. Validation that needs an archetype's `accepts` rule reads it from whichever mount holds the archetype. Brokenness — a placement referencing a chunk no mounted db has — surfaces at use time (`NOT_FOUND`, `VALIDATION_ERROR`, or an unresolved root on a scope read), not at storage time: the db enforces no placement residency (ruled by spec precedence; substrate.md §Peers — either side of a placement may live in another db). The db itself doesn't know it's part of a federation; the engine does. This separation is what keeps each `.ol/db` file portable on disk. Status, honestly: the anchor-row bridge built while db still required residency (`engine/src/mounts.rs` — `ANCHOR_KEY` sentinel rows added at commit, stripped from federated reads) is still in the code although its stated reason is gone; its retirement is queued, not done.

**Federation cost is O(N) per resolution**, where N = mount count. For v0.1's expected N (3–5 mounts on a typical setup), this is negligible — every `db.get(chunk_id)` asks each mount; first hit wins. A `chunk_id → mount_id` index, populated lazily on first resolve and invalidated on mount/unmount, is the natural optimization at larger N. Not v0.1 work.

**Single-host-per-db.** Each `Db` instance owns its own in-process `broadcast::Sender<Commit>`. Two host processes opening the same db file each have their own broadcast — not connected. v0.1 supports concurrent reads via SQLite's normal multi-reader semantics, but cross-host reactive notification is not implemented. Cross-host reactivity is a horizon item; see [`horizon.md`](../horizon.md).

**Boot-time validation.** Before entering the event loop the host asks the engine to validate the active project's substrate: every placement's `scope_id` must resolve in some mounted db. Common failures — host or engine project not mounted, so placements on `host/session` or `engine/program` go unresolved; a peer mount missing a chunk that's been referenced. The engine returns the list of unresolved references; the host surfaces them and refuses to enter the event loop. v0.1 doesn't run in a half-loaded state.

**Read-only enforcement.** A commit is rejected with `READ_ONLY_MOUNT` only when it **modifies a record resident in** a read-only mount — a chunk's body, spec, or name stored there, or a placement row stored there. Placements stored in the active db whose `scope_id` resolves to a mounted chunk are legal — the federation pattern depends on exactly this (invocables placed `instance` on the mounted `engine/program`, instances on mounted session archetypes). Reference is not modification. The check happens at commit entry, before validation.

**Sync vs async.** The substrate is sync (SQLite is sync), so `scope`, `commit`, `run`, `subscribe`, `unsubscribe`, `cancel`, `mount_project`, `unmount_project` return without awaiting. `await_processes` and `shutdown` are async. Outgoing event delivery to webview subscriptions happens through the `HostCmd` channel returned at `Engine::open`.

---

## Process Creation — What the Declaration Looks Like

A single atomic `db.commit()` creates:

1. **The process chunk.** Empty body except `status: 'pending'`. Placements as defined in *Program and Process*: `instance` on the program, on `engine/process`, and on each scope id in `RunArgs.placements`.
2. **A read-boundary chunk** (when `RunArgs.read_boundary` is `BoundarySpec::Roots(_)`). Placements: `instance` on `engine/read-boundary` (type), `relates` on the process (execution configuration, not structural content). Each boundary scope root is placed `relates` on this chunk by identity. When `BoundarySpec::Existing(chunk_id)` is given, the named boundary chunk is `relates` on the process directly — no fresh chunk created.
3. **A write-boundary chunk.** Same shape for `engine/write-boundary`.
4. **The argument chunks passed by the caller.** Each receives a `{ scope_id: processId, type: 'instance' }` placement added by the engine. The substrate's `accepts` check validates the composed contract.

Pre-generated ids let the engine reference the process from the boundary placements in the same declaration.

**Why boundaries are `relates` on the process, not `instance`:** the process's composed spec (`program.spec ∪ engine/process.spec`) defines what counts as structural content — typed arguments. Boundaries are not content; they are execution configuration the engine needs to read. Placing them `instance` would force them through the `accepts` check and couple the program's typed-argument spec to boundary presence. `relates` keeps the two orthogonal and honors the substrate semantics: boundaries are about the process, they are not a member of it.

**Trace nesting is exempt from every composed `accepts`.** A child process is placed `instance` on its parent process (the nested trace), but the composed contract at the parent — the program's propagating spec folded with every archetype the process is transitively `instance` of — read literally would reject it. The rule: placements of `engine/process` instances onto a process are trace, not content — validated against `engine/process` only, exempt from **every** contributing `accepts`, not just the program's own. The mechanism is the D6 bootstrap pattern: bootstrap relates-places `engine/process` on programs, so the trace placement is admitted through ordinary composition rather than a validator special case. Without the exemption, typed argument contracts and nested traces would be mutually exclusive; both are load-bearing.

**Terminal cleanup never severs the frame.** A terminal process's argument chunks, boundary chunks, and their root `relates` placements remain readable forever — cleanup writes status, it does not dismantle topology. Recipes re-arm from dead frames, `inspect` autopsies them, and re-run clones them; all three depend on this invariant.

---

## Boundaries

Two levels:

**Program-level boundary.** What the program can do by its nature. Expressed natively as a `relates` placement on the program chunk: a boundary chunk lists the scope roots the program may reach. Absence of a boundary placement means the program is *open* — defers all restriction to the run. A shell program is `relates`'d on a narrow boundary (its own process scope only). An agent program has no intrinsic boundary placement, so it's open.

**Run-level boundary.** What this specific run is permitted. Set by the caller at `run` time via `RunArgs.read_boundary` and `RunArgs.write_boundary` — either fresh roots to build a boundary chunk from, or a reference to an existing named boundary chunk for reuse. For a top-level run from the host, the run boundary is the user's choice; for a tool call from an agent, it's derived from the agent's current boundary intersected with the target program's intrinsic limit.

The **effective boundary** is the intersection of program-level and run-level. A run can never widen what the program's nature allows. For nested runs (tool calls from an agent), the child's boundaries are intersected with the parent's — boundaries can only narrow through the call stack, never widen. An open program-level (no intrinsic placement) is treated as the universal set — intersecting anything with it yields the other set.

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

1. **db.** Each successful write op pushes a `Commit` onto the substrate's broadcast channel after `tx.commit()` returns. Settled in db.md. Each `Db` has its own in-process broadcast.

2. **engine.** On `mount_project` for a `ReadWrite` mount, the engine subscribes to that mount's `db.subscribe_scope(&[db/commits], ..)`. v0.1 has one such mount (the active project); the dispatcher's input is therefore one receiver. Read-only mounts are not subscribed to — they have no in-process writer and never fire commits during a session. A background task drains the receiver, filters incoming commits by the mount's branch (commits on other branches are ignored, in case the mount tracks a non-default branch), and runs the dispatcher.

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

- `subscribe(ctx, scopes)` — engine boundary-checks the scopes against `ctx.process_id`'s read boundary. On pass: register `(SubscriptionId, ProcessId, scopes, transport)` and return the id. On fail: `BOUNDARY_VIOLATION` — which the SDK delivers to the subscription callback as `{ kind: 'invalid' }`, the same dead-subscription path as invalidation (decided; sdk.md *Reactivity*).
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

**Coalescing is required, not deferred.** The sanctioned streaming convention (below) makes commit bursts normal, so the dispatcher coalesces: multiple commits touching a subscription within a short window fire one `scope_changed` (carrying the latest commit). The contract is unchanged — re-fetch on event — so coalescing is invisible to correct clients.

### Streaming convention

Intra-op streaming is not in the protocol and doesn't need to be: **streaming is commits.** A program with incremental output (a model turn's answer) commits partial updates to its output chunk with `body.partial: true` at a throttled cadence (~4/s max), finalizing with `partial: false`. Subscribers re-render per event (coalesced, above). Partial states enter the lossless history; when branch-bound runs land (below), partials on the turn's branch keep main clean. One convention, settled here — not improvised per program.

---

## Run and Await Mechanics

How `run` returns immediately and `await` resolves when processes reach terminal state.

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

`ProcessStatus` is one enum used both in-memory (slot watcher) and at the substrate body field. Same four variants throughout; one shape, one source of truth.

The process map is `HashMap<ProcessId, ProcessSlot>` guarded by a Mutex. Slots are created on `run` and removed on terminal-state transition.

### `run`

The slot is inserted *before* the substrate write so that `cancel` and `timeout` can always land on a known process_id. The process chunk's body starts at `status: 'pending'`; cleanup writes the final status via a follow-up commit on terminal transition.

1. **Generate `process_id`** and compose the declaration. Process chunk + read-boundary chunk + write-boundary chunk + the caller's argument chunks (see *Process Creation*).
2. **Insert the slot.** Status `pending`. Register the timeout JoinHandle (fires after `timeout_ms`).
3. **`db.commit(declaration)`** — atomic. If commit fails, remove the slot and return error. The commit is not interruptible mid-flight; once entered, it runs to completion or rolls back as a unit.
4. **Status check.** If `cancel` or `timeout` fired between steps 2–3 and flipped the status to `failed`, skip steps 5–6 and run cleanup (which writes the follow-up `status: failed` commit and removes the slot). Cleanup always has a substrate chunk to write to, since step 3 always completes.
5. **Look up the runtime provider** for the program's `runtime` field and call `provider.spawn(SpawnContext { process_id, program, request_tx })`. Provider returns a `RuntimeHandle` with `transport`, `ready`, and `terminal` channels. Engine stores them on the slot.
6. **Wire readiness to status.** Engine spawns a small task that awaits `handle.ready` and flips slot status to `running` when it resolves; another awaits `handle.terminal` and triggers cleanup. The provider drives both signals on its own schedule.
7. **Return `process_id`.**

If `cancel(process_id)` or the timeout fires between steps 2–3, the check at step 4 catches it: substrate has the chunk (born pending), cleanup writes the terminal commit, slot is removed. If a cancel fires between steps 5–6 (after spawn), the running-flip / terminal-watcher tasks see the failed status and trigger cleanup directly — cleanup additionally drops the spawn handle (killing the runtime process if still alive). In all cases the substrate carries a complete record (`pending → failed`) and `await_processes` resolves to that terminal state.

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
| Webview | The `exit` op; OR the user closes the tile (host unmounts the webview) | `cancel`; OR timeout |

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

Every commit the substrate records carries a `process_id` column — the process whose run caused it, or null for host-level commits the engine does on its own behalf. Commits stay in their own table; the read layer projects them as chunks under the virtual scope `db/commits`:

- `scope(db, [db/commits])` — all commits
- `scope(db, [db/commits, processId])` — commits from this specific run
- `scope(db, [db/commits, chunkId])` — commits that modified this chunk

No new tables, no circular placements. Commits look like chunks to readers; they are structurally separate.

A virtual scope can be intersected with the parameters its projection recognizes — see [`db.md`](db.md#virtual-chunks-branches-and-commits) for the full list. Unrecognized shapes return what falls out of the join, typically empty.

---

## Runtime providers

Runtime kinds are not built into the engine. They are plugged in at boot via `register_runtime(kind, provider)`. v0.1 ships two providers — VM and webview — both implemented in the host crate (host owns the wry/tao machinery and the VM lifecycle).

```rust
pub trait RuntimeProvider: Send + Sync {
    fn spawn(&self, cx: SpawnContext) -> Result<RuntimeHandle, SpawnError>;
}

pub struct SpawnContext {
    pub process_id: ProcessId,
    pub program: ProgramRef,
    pub request_tx: mpsc::Sender<(Context, Request)>, // provider routes
                                                      // incoming wire requests here
}

pub struct RuntimeHandle {
    pub transport: TransportRef,                       // engine pushes outgoing
                                                       // events here
    pub ready: oneshot::Receiver<()>,                  // resolves when the runtime
                                                       // is alive (process attached
                                                       // / webview navigated);
                                                       // engine flips slot to Running
    pub terminal: oneshot::Receiver<TerminalReason>,   // resolves on terminal
}
```

The provider drives its own readiness and terminal signals; engine just awaits them. There are no runtime-specific entry points on the Engine API.

**Capabilities and secrets.** A program's `body.capabilities` is a small vocabulary — `net[:host]`, `fs`, `exec`, `secret:<NAME>` — **enforced by the runtime provider at spawn**: network egress allowlisted per process, filesystem and exec gated, and each `secret:<NAME>` injected as an environment variable from a host-held keychain. Secrets are **never chunks** — the substrate is lossless, so a committed key would be permanent. The effective capability set is recorded on the process body so inspection surfaces it. The engine stays runtime-agnostic; only providers enforce. (Held open in `programs.md` §6: whether capabilities/secrets and integrations are one family — both declare reach into the world outside the field.)

**Multiplexed transports.** One physical transport may carry several protocol identities: a webview hosting embedded citizens (slot-and-hook, `programs.md` §3.5) tags each request with the originating slot's identity token, and the host's handler maps token → process id before attaching `Context`. Each citizen is its own process to the engine — boundaries and commit attribution hold at slot granularity. Mechanics live in host.md and sdk.md; the engine only requires that `Context` arrives correct.

## Containment

Containment is the runtime provider's concern, not the engine's — the engine asks the registered provider to spawn and knows runtime kinds only as registry keys (see *What the Engine Owns* and *Runtime providers*). What the engine guarantees regardless of provider: every substrate operation passes the boundary check, so containment and boundary enforcement compose. v0.1's split-containment model and the uniform-VM alternative on the horizon are in [`pilot.md`](../pilot.md#containment) and [`horizon.md`](../horizon.md).

---

## Operational Behavior

### Timeouts

`run`'s optional `timeout` is written to the process body as `timeout_ms`. If omitted, the engine uses the program's own `body.timeout_ms`. Defaults: tool programs (filesystem, shell, web) 30000 ms; agent programs 300000 ms. On expiry the engine kills the spawned executable and sets `status: 'failed'` with `body.error: 'timeout'`. The clock pauses while the process has a pending `await` on its own children — a turn delegating a ten-minute sub-agent is idle, not hung — and resumes on resolution.

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

The engine exposes only Rust functions; it ships no TS client. Programs reach those functions through the SDK, which serializes each call into the protocol JSON and selects the transport. The SDK ships from the engine crate ([`engine/sdk/`](../engine/sdk/)) because it is the engine's protocol expressed as TypeScript; its surface and the two transports are specified in [`pilot/sdk.md`](sdk.md).

---

## Code architecture

### Module layout

```
engine/
  src/
    lib.rs              — public re-exports
    types.rs            — Context, RunArgs, ProcessId, SubscriptionId, ProjectId,
                          MountMode, RuntimeKind, ProcessStatus, Event,
                          HostCmd, EffectiveBoundary, plus Display/From impls
    errors.rs           — EngineError (single enum); MountError, RegisterError;
                          From<DbError>, From<ProtocolError>
    engine.rs           — Engine struct; open returns (Engine, mpsc::Receiver<HostCmd>);
                          shutdown(self) -> impl Future; impl Drop
    mounts.rs           — MountedProject { db, mode, branch }; the mount registry;
                          mount_project / unmount_project / list_mounts;
                          read-only enforcement helper
    runtime.rs          — RuntimeProvider trait; SpawnContext, RuntimeHandle types;
                          the runtime registry; register_runtime / lookup
    bootstrap.rs        — reconcile_zombies(&Db): one scope query, one declarative
                          commit. Run on read-write mounts only.
    process.rs          — ProcessSlot { status: watch::Sender<ProcessStatus>,
                                        spawn: SpawnHandle, timeout, config };
                          SpawnHandle enum; set_terminal, flip, cascade_children
    subscription.rs     — Subscription, TransportRef, SubscriptionRegistry;
                          insert / remove / iter_for_process
    reactivity.rs       — loop_task subscribing to read-write mounts (one in v0.1);
                          handle_commit composed from compute_touched, gather_fanout,
                          gather_invalidations, apply; branch filter on incoming commits
    protocol.rs         — Request | Response | Event JSON shapes;
                          dispatch_request(&Engine, &Context, Request) -> Response;
                          From<EngineError> for wire ErrorCode
    boundary.rs         — reachable, effective, intersect (stateless reads via
                          &Engine — federation across all mounts)
    ops/                — public surface; one module per Engine method
      mod.rs            — re-exports
      scope.rs          — Engine::scope    (reachable check → federated db.scope)
      get.rs            — Engine::get      (reachable check → federated db.get)
      commit.rs         — Engine::commit   (reachable + protected + read-only-mount
                                            → active db.commit)
      run.rs            — Engine::run      (insert slot → declaration → db.commit →
                                            runtime provider spawn → flip → return)
      cancel.rs         — Engine::cancel   (set_terminal → cleanup)
      subscribe.rs      — Engine::subscribe / unsubscribe
      await_processes.rs — Engine::await_processes (async; status watcher with
                                                    substrate fallback)
  tests/                — integration tests against the spec
  Cargo.toml
```

Each `ops/*.rs` owns its method end-to-end via `impl Engine`. Internal modules (`engine`, `mounts`, `runtime`, `bootstrap`, `process`, `subscription`, `reactivity`, `protocol`, `boundary`) are flat siblings. No further folding: engine has one structuring axis (the public ops) and serves it with one folder.

The engine crate ships **zero runtime implementations** — `runtime.rs` carries only the trait, the registry, and the spawn-context types. VM and webview providers live in the host crate (or, in the future, in their own crates) and are registered at boot via `register_runtime`. This keeps engine purely a substrate-mediation kernel.

### Within-file shape

Each file composes from small named functions. The public method (or task body) reads as a top-to-bottom narrative that calls private helpers, each doing one thing. `reactivity.rs` decomposes into six functions (`loop_task`, `handle_commit`, `compute_touched`, `gather_fanout`, `gather_invalidations`, `apply`) where the orchestrator is ~30 lines and each helper ~30–60. `mounts.rs` decomposes into the registry struct + `mount_project`, `unmount_project`, `is_read_only_chunk`, `iter_mounts`. `ops/run.rs` decomposes into the public `run` method plus `assemble_declaration`, `lookup_runtime`, `cleanup_on_failure`.

What's genuinely non-obvious here and earns a comment (per [`conventions.md`](../conventions.md#code)): race semantics, ordering invariants, channel-primitive quirks.

### Key mechanics

**State authority follows lifecycle.** A process has two natural homes — its slot (live runtime: spawn handle, status watcher, timeout) and its substrate chunk (durable: status, error). The slot is authoritative while the process is active; the substrate is authoritative once the slot is gone. Authority transfers in one ordered step at terminal: cleanup writes the terminal status, then drops the slot. `await_processes` resolves either side — slot present, watch the status; slot absent, read the substrate (always terminal there). One truth at any moment; the seam is the cleanup commit.

**Reactivity owns event emission.** The reactivity task is the engine's only consumer of `db.subscribe_scope(&[db/commits])` and the only emitter of `scope_changed` / `lagged` / `subscription_invalid`. Cleanup paths (cancel, timeout, child exit, parent cascade) trigger reactivity by writing terminal commits; they never emit events directly. This collapses what would otherwise be two writers to the subscription registry: subscription invalidation on terminal is reactivity's job, not cleanup's.

**Webview transport as commands.** The host's wry/tao machinery is main-thread and `!Send`. The engine never holds a `WebView`. `Engine::open` returns `(Engine, mpsc::Receiver<HostCmd>)`; the host drains the receiver on its event loop and translates each `HostCmd` (`MountWebview`, `UnmountWebview`, `EvaluateScript`) into a wry call. The webview runtime provider (in the host crate) sends `MountWebview` from its `spawn` method and includes `ready` and `terminal` oneshot senders that the host fires when the webview has navigated and when it's destroyed. Outgoing events to webview subscriptions are `EvaluateScript` commands emitted by reactivity. This is the engine's only seam to non-`Send` code, expressed as data.

**Errors as one vocabulary.** The engine has one wire surface, so it has one error enum. `EngineError` carries every condition the protocol needs to express (`BoundaryViolation`, `ReadOnlyMount`, `ValidationError`, `NotFound`, `RunFailed`, `InvalidRequest`, `TransportClosed`, `Db`, `Protocol`). The protocol response builder maps `&EngineError` to a wire code via a single `match`; the VM stdout pump consults the same enum to decide whether parse failures are terminal. Two consumers, one enum — no scattered tables.

**Single writer where it matters; locks where it doesn't.** Reactivity is the sole emitter of events and the sole path that drops subscriptions on invalidation. The registry itself is `Mutex<HashMap>` because `ops::subscribe` inserts new entries — the lock is held only for insert/remove, never across an `await`. The processes map follows the same discipline: `ops::run` inserts, terminal triggers remove, `await_processes` clones a watch receiver. Mutex is the dumb-clear choice for shared state with brief critical sections.

**Async runtime.** The sync/async split mirrors db's (see *Sync vs async*). The reactivity task and per-VM stdio pumps run on tokio, spawned via a `tokio::runtime::Handle` stored on `Engine` at `open`; the host calls `Engine::open` from within its tokio runtime context.

### Settled choices

- **Mount registry as `Mutex<HashMap<ProjectId, MountedProject>>`.** Mounts are mutated rarely (boot + dynamic add/remove); reads are frequent. Mutex held only for insert/remove/lookup, never across an `await`.
- **Runtime registry without dynamic loading.** Providers are registered at boot by Rust code holding the `Arc<Engine>`. No discovery, no manifests, no plugin framework — just a HashMap of trait objects.
- **`ProjectId` is the canonical absolute filesystem path.** Stable, unique, no naming server. Comparison by string equality after normalization.
- **Engine ships no runtime implementations.** Engine crate has the trait + registry; impls live in host crate (VM and webview providers for v0.1). Future runtimes plug in by registering, never by editing engine.
- **Federation in Rust, not SQL.** `engine.scope` iterates mounts and unions results in Rust. Each `Db` stays single-file and portable on disk; broadcast channels stay per-db.
- **Single `EngineError` enum** (not per-op like db). Engine has one wire surface; one vocabulary serves it. Principled divergence from db, justified by surface shape.
- **`HostCmd` channel** as the host integration seam. Commands as data; engine = producer, host = consumer on its main loop. Honors `!Send` host machinery without leaking it into engine state.
- **`tokio::sync::watch`** for `ProcessStatus`. Multi-awaiter; late readers see the final value via `borrow()` after the sender drops.
- **`tokio::sync::broadcast::Receiver`** for the db change feed; one receiver, owned by the reactivity task.
- **`tokio::sync::mpsc`** for `HostCmd` and per-VM stdin event queues. Bounded; drop-on-full surfaces a `lagged` event.
- **`std::sync::Mutex`** for registries. Never held across `await`.
- **`tokio::runtime::Handle`** stored on `Engine` at `open`, used to spawn tasks from sync entry points.
- **`Engine::shutdown(self)`** consumes self: cancels reactivity via `CancellationToken`, awaits the join, runs terminal cleanup on every active process. `impl Drop` aborts reactivity as best-effort fallback.
- **Bootstrap as one declarative commit.** `reconcile_zombies` does one `db.scope` for `pending|running` processes, then one commit setting each to `failed` with `error: "engine restart"`.
- **`thiserror`** for `EngineError`; `From<DbError>` and `From<ProtocolError>` for ergonomic `?`.

---

## What Is Open

- **Branch operations over the protocol.** The substrate is fully branch-aware (fork, per-branch HEADs, two-parent merge commits) and `ScopeOpts.branch` exposes branched reads — but the protocol cannot yet create a branch, commit to a named branch, write a merge, or bind a run to a branch. The settled shape when taken: a `branch` op (`{ create, name, from }`), `Declaration.branch?`, a merge form of `commit` with two parents, and `RunArgs.branch` routing a process (and its children) to a work branch. Unlocks the acceptance workflow — agent works a branch, human reviews, merge is the yes — and branch-parked streaming partials. Boundary model unchanged: branches are field state, not reach. Merge semantics, ruled: branches diverge freely; merge auto-takes the union of additions and fails hard only on true collision — the same chunk's body or spec changed on both sides. No conflict-resolution machinery anywhere in the primitives: a refused merge is resolved by an agent reading both branches with existing tooling and committing the reconciliation as ordinary work. Substrate refuses, intelligence resolves (substrate.md §What's Open).
- **Daemons (services).** A process whose executable stays resident — services, watchers, live integrations. The lifecycle must extend without a new primitive: a daemon is a process whose terminal transition is a *policy* (stop, restart), not the end of a job. Not v0.1 — but v0.1 decisions must not foreclose it, and the engine-as-daemon direction (`horizon.md`) is where resident programs get a home that outlives any window.
- **Pause/resume.** A control signal honored between cycles of cycle-driven programs (the agent) — program-level convention first (control chunks on the conversation, `agent.md`); promoted to an engine op only if it generalizes.
- **Reference arguments (`attach`).** `RunArgs.attach: ChunkId[]` — the engine placing existing chunks `instance` on the new process instead of ids-in-body, making hand-off visible in the placement graph. Each attached id must sit within the caller's read boundary; the `accepts` check applies unchanged. This open is **load-bearing**, not a refinement: inline `RunArgs.chunks` are fresh declarations, so a typed argument that *references* an existing chunk has no honest channel — ids-in-body carry no type and bypass the composed `accepts` — until `attach` lands.
- **Schema version skew on peer mount.** v0.1 refuses to mount peers whose db schema is older or newer than the active project's, with a clear error. Migrating a mounted-but-not-active db is a v0.2 concern. See [`horizon.md`](../horizon.md).
- **Stale process chunks in peer dbs.** A peer project may carry `pending|running` process chunks from a previous time it was the active project. v0.1 does not reconcile them (peers are read-only). Programs reading peer scopes may see these as artifacts; the engine surfaces them as-is.
- **Symmetric peering.** v0.1 mounts are read-only and local-filesystem only. Read-write peering, remote mounts, identity/auth, and sync mechanics live on horizon. The boundary mechanism already carries the model for symmetric peering — when it lands, it's a write boundary that names the peer's identity.
