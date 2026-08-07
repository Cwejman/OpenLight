# Engine

The engine is the authority on running programs against the substrate. A program is a chunk with an executable; to run one is to create a process. The engine creates processes, enforces boundaries, spawns executables, and mediates every substrate operation a running program attempts. Nothing runs without going through the engine, and no program touches the database directly.

The engine is a Rust crate compiled into the host binary. The host calls engine functions directly — there is no separate engine process and no JSON-lines hop between host and engine. Programs reach those functions through one protocol over two transports — wry IPC for webview programs, stdio JSON-lines for VM programs — identical in shape regardless of transport; the SDK hides the difference. Mechanics are in *The Program Protocol* below and [`sdk.md`](sdk.md).

The engine federates across multiple substrate dbs — one read-write **active project** plus zero or more read-only **mounts**. Programs see one logical field; the engine routes reads and boundary walks across all mounts transparently. Reactivity flows only from the active project's commits in v0.1 — read-only mounts have no in-process writer to fire events. See [`pilot.md`](pilot.md#multi-project-mounts) for the project/mount model.

---

## What the Engine Owns

- **Process creation.** Starting a program writes a `process` chunk in one atomic `db.commit()` — its body and connections are defined in *Program and Process*. From start on the process chunk is engine-domain: a running program cannot rewrite its own record.
- **Boundary enforcement.** Every read, every write, every nested program run is checked. A run's reach is constructed at start — its own frame, its granted roots, its program's demand — and walked through ownership. Reads outside it return `BOUNDARY_VIOLATION`; writes outside it are rejected.
- **Program lifecycle.** The engine spawns the program's executable, tracks its status through `running → done | failed` (a `draft` precedes the start and is data, not engine-domain), updates the process chunk as state changes, kills on timeout or cancel. The program itself does not set its status — it simply exits.
- **Protocol mediation.** The engine receives every substrate operation a running program attempts, validates it, executes it via the substrate library, returns the result. Programs do not carry database access; the protocol is the boundary.
- **Containment.** The engine asks the registered runtime provider to spawn each program. Containment lives in the provider, not in engine code; engine knows runtime kinds only as registry keys.
- **Mount registry.** The engine holds the active project and all mounted peer projects. Federated reads and boundary walks iterate the registry; reactivity subscribes only to read-write mounts (one in v0.1). Writes referencing read-only mounts are rejected. Cross-mount ref validation (substrate.md, *Links*) runs through this registry — the db validates locally resolvable targets only; the engine resolves the rest at commit entry.

## Program and Process

### The program body — a program's interface is its body

`engine/program` is the archetype every runnable thing is `instance` on. Its instance contract types the program body:

```
{ executable, runtime, capabilities?, timeout_ms?,
  argument: ref → archetype      — one; parameters are keys in its instance contract
  result:   ref → archetype      — one; default named `output`; pure viewers may omit
  demand:   { read: [ref…], write: [ref…] }?   — argument-independent boundary (below)
  uses:     [ref → program, …]?  — the programs it runs, for the launch surface
  presets:  [ref → collation, …]? — shipped views (programs.md)
}
```

**Role is conferred by reference.** An archetype is this program's argument or result because the program's body says so. Interface archetypes are found from the program, never by global name or path — every program having an `output` collides nowhere. The argument archetype's instance contract carries the parameters: types, refs, lists and sets, per-key docs, per-key `?` optionality, and `grants: read|write` markers — a filled ref whose key is grants-marked makes its target a boundary root of the run. Twins are distinguished by name (`{old: ref(A), new: ref(A)}`); nothing anywhere depends on position.

This one convention feeds three consumers with zero duplication: the `form` renders fields and boundary chips from the argument archetype's instance contract, the agent compiles provider tool schemas from the same spec, and expressions type-check plans before running them (see *Expressions*).

Concrete programs — filesystem, shell, claude, echo, reader, sidebar — are chunks `instance` on `engine/program`, owned by their project's root.

### The process

`engine/process` is the archetype every run is `instance` on. Its instance contract types the process body — every key statically typed:

```
{ argument: ref          — the argument chunk; frozen wholesale at start
  at:       commit       — the branch head at start, engine-stamped
  status:   ref(status)  — draft | running | done | failed (value chunks)
  result:   ref?         — filled once at completion
  read:     list<ref>    — the run's granted read roots
  write:    list<ref>    — the run's granted write roots
}
```

`status` is the substrate's own enum pattern: `engine/status` with four value chunks. Boundary chunks and their `relates` topology are retired — the run's reach is two typed keys, read in one hop.

**The argument is its own chunk**, `instance` on its archetype and nowhere else — the process body's `argument` ref *is* the connection (a field, link-indexed both ways; a placement too would be a second home for one fact). It lives where it was composed (the caller's frame, or the session for drafts); start stamps it into the process body, implicitly grants the run read over it, and freezes it — writes to a consumed argument are rejected. **Editable iff unconsumed** is engine-enforced, not convention.

**Results mirror**: `instance` on the result archetype only, owned by the process that produced them. Writing them is declaration-derived reach — the declared result archetype sits implicitly within the run's write boundary. The `result` ref is the connection.

**Validation is one placement check.** At start: is the argument chunk an instance of what the program's `argument` names. At completion: is the result chunk an instance of what the program's `result` names. Nothing else. The former accepts machinery — union composition, per-list ambiguity judgment, the trace-nesting exemption, federated accepts pre-validation — retires with the spec language; a child process placed on its parent is just a placement, nothing rejects it. (The built engine still carries that machinery; retirement is tracked on the board, spec leads.)

**The frame is the process's ownership subtree.** Children are owned by the process that ran them; results and everything the run composes land owned in its frame. This is what makes reach compose: a grant over the process reaches its whole frame through the ownership walk, so *a program can always read and write its own frame* falls out of the law rather than standing beside it as an invariant. Trace nesting is the owned chain; type membership (`instance` on `engine/process` and on the program) rides separately.

Concrete topology for a run:

```
process P
  owned by: the caller's process (child mode) — or the session (launch, top-level)
  instance on: engine/process, <program>, <caller-supplied places, e.g. the session>
  body: { argument, at, status, result?, read, write }

argument A
  owned by: where it was composed (caller's frame; the session for a draft)
  instance on: <the program's argument archetype> — nowhere else

result R
  owned by: P
  instance on: <the program's result archetype> — nowhere else

children
  owned by: P — the trace; instance on engine/process + their own programs
```

*Open:* nesting the argument record into the process body (one lifecycle chunk) is a held-open future simplification; the residence rules above are the fold's reading of `reach = ownership + grants` — revisit if a real case strains them.

**Frozen safety or rolling head.** The record freezes, but the chunks it references live on. The SDK makes the choice explicit: resolving the argument's refs **at the stamped commit** (`at`) is the default — reproducible, exactly what the run was given; following the **living head** is the deliberate choice for programs that want liveness (the reader following its reading). Same temporal machinery, two honest modes ([`sdk.md`](sdk.md)).

**Terminal cleanup never severs the frame.** A terminal process's argument, results, children, and grants remain readable forever — cleanup writes status, it does not dismantle topology. Re-run clones from dead frames; the process-view autopsies them.

```
engine/mount  (virtual)
  — Both archetype and instances synthesized by the engine at query time
    from its in-memory mount registry; not stored in any db.
  body carries: project_id, branch, mode, commit?
```

`engine/mount` is a virtual place, in the same family as `db/commits` and `db/branches`. Every chunk surfaced from mount X carries a synthesized `relates` placement on X's mount instance — provenance through native substrate plumbing. Programs can read the mount root to list mounts, or intersect any place with a mount instance to narrow to its chunks.

## Lifecycle: draft, run, launch

A process may exist before start — **status `draft`**, its argument under composition. A draft is ordinary field data: written by whoever holds the grant (the `form`, the palette), substrate-resident (there is no in-memory draft state), resting visibly where it was begun until an explicit gesture deletes it — nothing auto-sweeps. A draft whose argument cites a previous turn joins that thread's lineage (session.md). From start on, the process chunk is engine-domain.

A start takes one of two modes:

- **`run` (child).** Composed work. The child is owned by the caller's process — trace lineage — and cancellation cascades: cancel an agent turn, its in-flight tool calls die with it.
- **`launch` (detached).** The process is owned by the session, not the caller; it survives the launcher. Boundaries still intersect with the caller's at spawn — detachment never escalates. Everything a surface or the palette initiates.

Surfaces are viewers, never owners: closing a tile unmounts a viewer, it kills nothing. Terminating is always an explicit act.

---

## The Program Protocol

One JSON-lines protocol serves every program regardless of where it runs.

**Operations a running program can call on the engine:**

| Operation | Description |
|---|---|
| `read` | Read the intersection of places. Filtered by the effective read boundary. Membership across the three stored kinds plus the `linked` answer, per substrate.md (*Read*). FTS via `ReadOpts.match_`; an **empty places list with `match_`** is a whole-field FTS query, boundary-filtered and federated like any read. Negation via `exclude`. Pagination and body-less projection per substrate.md. |
| `get` | Fetch a single chunk by id. Returns `null` if the chunk does not exist; rejected if outside the read boundary. Honors `at` for temporal point reads. |
| `read_batch` | Multiple tagged `read`/`get` sub-queries resolved together at **one commit snapshot**, each authorized under its own identity (see *Multiplexed transports*). One request, coherent results — the resolution primitive behind slot-and-hook views (programs.md). |
| `commit` | Write a Declaration. Rejected if any chunk or placement touches a place outside the write boundary; ref keys validate per substrate.md (federated through the mount registry). `dry_run: true` runs full validation without writing — the live-form affordance. |
| `run` | Start a program. Returns the process id immediately. Takes a program + argument chunk, or a `draft` process id to consume. `mode: 'child' | 'launch'` per *Lifecycle*. |
| `await` | Wait for one or more processes to reach a terminal state. **Returns each process itself** (the chunk — status, result ref, one hop to the result). The call suspends the calling task; it doesn't block the engine. |
| `cancel` | Request a process's terminal transition. Authorized when the target is a descendant of the caller, or within the caller's write boundary. Idempotent. |
| `exit` | The calling program requests its own terminal transition (`done`) — the self-dismissal path for webview programs; trivially safe. |
| `subscribe` | Register on a set of places; returns a subscription id. The engine pushes `place_changed` events when commits touch them. |
| `unsubscribe` | Cancel a subscription by id. |

### Schema

Every request has an `op` and a monotonic `id`. Every response pairs the same `id` with either `result` or `error`.

```jsonl
{"id":1,"op":"read","places":["chunk_abc","chunk_def"],"opts":{"match_":"session today","exclude":["chunk_hidden"],"limit":50}}
{"id":2,"op":"get","chunkId":"chunk_abc","opts":{"at":"...","branch":"...","include":{"body":false}}}
{"id":3,"op":"read_batch","reads":[{"tag":"a","places":["s1"]},{"tag":"b","places":["s2"],"opts":{...}}]}
{"id":4,"op":"commit","declaration":{"chunks":[...]},"dry_run":false}
{"id":5,"op":"run","program":"diff","argument":"chunk_arg","mode":"child","read":["r1"],"write":["w1"]}
{"id":6,"op":"run","draft":"p_draft"}
{"id":7,"op":"await","processes":["p_1","p_2"]}
{"id":8,"op":"cancel","process":"p_1"}
{"id":9,"op":"exit"}
{"id":10,"op":"subscribe","places":["my-session"]}
{"id":11,"op":"unsubscribe","subscriptionId":"sub_1"}
```

| Op | Result shape |
|---|---|
| `read` | `ReadResult` |
| `get` | `ChunkItem \| null` |
| `read_batch` | `{ head: CommitId, results: Record<tag, ReadResult \| ChunkItem \| null \| EngineError> }` |
| `commit` | `Commit` (with `dry_run`: `{ valid: boolean, errors: [...] }`) |
| `run` | `{ process: string }` — the process chunk id |
| `await` | `Record<string, ChunkItem>` — process id → the process chunk |
| `cancel` | `{}` |
| `exit` | `{}` — terminal transition follows |
| `subscribe` | `{ subscriptionId: string }` |
| `unsubscribe` | `{}` |

The wire carries the tagged value encoding for typed bodies (`$ref`, `$loc`, `$set`, `$time`, `$md`) — translation is the SDK's job ([`sdk.md`](sdk.md)); the engine validates tags against instance contracts at commit.

**Errors:**

| Code | Meaning |
|---|---|
| `BOUNDARY_VIOLATION` | Read or write outside the effective boundary |
| `READ_ONLY_MOUNT` | Commit modifies a record resident in a read-only mount (reference alone is legal — see *Read-only enforcement*) |
| `VALIDATION_ERROR` | Declaration fails spec validation — instance-spec key check, ref-target check, or the start/completion placement check |
| `NOT_FOUND` | Referenced chunk, program, or subscription does not exist |
| `RUN_FAILED` | A run the program started ended non-zero |
| `INVALID_REQUEST` | Malformed JSON, unknown op, missing fields |
| `TRANSPORT_CLOSED` | The program's transport closed mid-response; the pending call rejects on the SDK side |

### Events

A program receives unsolicited messages from the engine on the same channel it sends requests over. An event has no `id`; it is identified by its `event` field.

| Event | Shape | Meaning |
|---|---|---|
| `place_changed` | `{ event: "place_changed", subscriptionId, commit }` | A commit touched a scope this subscription registered on. The SDK re-fetches via `scope`. |
| `lagged` | `{ event: "lagged", subscriptionIds: [string] }` | The engine's input channel overflowed; the named subscriptions may have missed events. Re-fetch to recover. |
| `subscription_invalid` | `{ event: "subscription_invalid", subscriptionId, reason }` | A subscribed place became unreachable from the process's read boundary. The engine has unsubscribed; the SDK treats the subscription as dead. |

Subscriptions fire on membership changes and on link changes — a commit that adds or removes links *to* a subscribed chunk fires like one that changes its placements (computed from the link delta in the same transaction; churn rides the required coalescing). The contract remains: re-fetch on event. Process state changes are not events; programs track them through `await`.

### Run and await are separate

`run` starts the process and returns its id immediately. The spawned program runs on its own. `await` waits on a set of process ids until they reach terminal state — it suspends the calling task, not the engine. There is no structural difference between spawning an agent and calling a tool — a filesystem read returns in milliseconds, a sub-agent might run for minutes; the protocol handles both identically.

```
# Sequential tool call
→ {"id":1,"op":"commit","declaration":{...the argument chunk...}}
← {"id":1,"result":{...}}
→ {"id":2,"op":"run","program":"filesystem","argument":"arg_1"}
← {"id":2,"result":{"process":"p_1"}}
→ {"id":3,"op":"await","processes":["p_1"]}
← {"id":3,"result":{"p_1":{...process chunk; body.result → output...}}}
```

Parallel calls are several runs awaited together; fire-and-forget is a run awaited later. Every process chunk exists in the substrate immediately — any program within its boundary can read into a running process and watch.

### Engine API (callable from the host)

The host calls the engine library directly to drive top-level runs from user action and to handle webview protocol messages. VM-program protocol messages reach the same functions through the engine's stdio reader.

```rust
pub struct Engine { /* mounts, processes, subscriptions, runtime registry, ... */ }

pub struct Context {
    pub process_id: Option<ProcessId>,  // None = host-initiated; Some = caller's process
}

pub struct RunArgs {
    pub target:     RunTarget,          // program + argument, or a draft to consume
    pub placements: Vec<ChunkId>,       // additional instance places for the new
                                        // process (host passes the session id)
    pub mode:       RunMode,            // child (default) or launch
    pub read:       Vec<ChunkId>,       // granted read roots
    pub write:      Vec<ChunkId>,       // granted write roots
    pub timeout_ms: Option<u64>,        // overrides program body
}

pub enum RunTarget {
    Start { program: ChunkId, argument: ChunkId },
    Draft(ProcessId),                   // consume an existing draft process
}

pub enum RunMode { Child, Launch }

pub struct ProjectId(String);           // canonical absolute filesystem path
pub enum MountMode { ReadWrite, ReadOnly }

impl Engine {
    pub fn open() -> Result<(Engine, mpsc::Receiver<HostCmd>), OpenError>;
    pub async fn shutdown(self) -> Result<(), ShutdownError>;

    // mount registry — host calls these at boot, before the first run
    pub fn mount_project(&self, id: ProjectId, db: Arc<Db>, mode: MountMode, branch: BranchName)
        -> Result<(), MountError>;
    pub fn unmount_project(&self, id: &ProjectId) -> Result<(), MountError>;

    // runtime registry — host registers providers at boot
    pub fn register_runtime(&self, kind: RuntimeKind, provider: Arc<dyn RuntimeProvider>)
        -> Result<(), RegisterError>;

    // sync — return immediately
    pub fn read(&self, ctx: &Context, places: &[ChunkId], opts: ReadOpts)
        -> Result<ReadResult, EngineError>;
    pub fn get(&self, ctx: &Context, chunk_id: &ChunkId, opts: GetOpts)
        -> Result<Option<ChunkItem>, EngineError>;
    pub fn commit(&self, ctx: &Context, decl: Declaration) -> Result<Commit, EngineError>;
    pub fn run(&self, ctx: &Context, args: RunArgs) -> Result<ProcessId, EngineError>;
    pub fn cancel(&self, ctx: &Context, process_id: &ProcessId) -> Result<(), EngineError>;
    pub fn subscribe(&self, ctx: &Context, places: &[ChunkId])
        -> Result<SubscriptionId, EngineError>;
    pub fn unsubscribe(&self, sub_id: SubscriptionId);

    // async — Future resolves on terminal-state transition
    pub async fn await_processes(&self, ctx: &Context, ids: &[ProcessId])
        -> Result<HashMap<ProcessId, ChunkItem>, EngineError>;
}
```

**Boot lifecycle.** Host opens engine (no db yet), registers runtime providers, then mounts projects. The active project is `ReadWrite`; peers `ReadOnly`. Reconciliation of zombie processes (`running` from a previous run) happens on `ReadWrite` mounts only; drafts are data and survive restarts by design.

**The engine is program-agnostic and runtime-agnostic.** It looks up the program's `runtime` field as a registry key and asks the registered `RuntimeProvider` to spawn — no built-in knowledge of `vm` or `webview`.

**`Context::process_id = None`** marks a host-initiated call (the user opening a tile, the host's bootstrap). The engine treats it as having full read and write reach over the active project — full reach across mounts is read-only by default. `Some(process_id)` resolves the run's reach from the process body's `read`/`write` keys.

**Federated reads and boundary.** `read` and boundary walks iterate the mount registry. Reads union and dedupe across mounts; ownership walks stop at mount edges (ownership never crosses mounts — substrate.md); `linked` answers union per-db link tables. Programs see one field. Unresolved roots federate by **intersection**: a root lands in `ReadResult.unresolved` only when no mount resolves it.

**Reactivity is single-source in v0.1.** Only read-write mounts fire commits in-process, and v0.1 has exactly one: the active project. The dispatcher holds one `broadcast::Receiver`, filtered by the active project's branch. When cross-host reactivity or dynamic mount writes land (horizon), the dispatcher extends to more receivers — it's just `select!`.

**Cross-db placements work because dbs are dumb.** A placement stored in db_active can reference an `on` whose chunk lives in db_engine — placements store ULIDs, globally unique. To list `engine/program`'s instances, the engine queries every mount's placements for that place and unions. Validation that needs an archetype's instance contract (ref constraints, the start placement check) reads it from whichever mount holds the archetype. Brokenness — a placement referencing a chunk no mounted db has — surfaces at use time as an unresolved root, not at storage time; the db enforces no placement residency (ruled by spec precedence; substrate.md §Peers). Status, honestly: the anchor-row bridge built while db still required residency (`engine/src/mounts.rs`) is still in the code although its stated reason is gone; retirement queued.

**Federation cost is O(N) per resolution**, N = mount count. For v0.1's 3–5 mounts, negligible. A lazily populated `chunk_id → mount_id` index is the natural optimization at larger N; not v0.1 work.

**Single-host-per-db.** Each `Db` owns its own in-process broadcast. Two host processes on one db file are not connected; cross-host reactivity is horizon.

**Boot-time validation.** Before entering the event loop the host asks the engine to validate the active project: every placement's `on` must resolve in some mount. The engine returns unresolved references; the host surfaces them and refuses to run half-loaded.

**Read-only enforcement.** A commit is rejected with `READ_ONLY_MOUNT` only when it **modifies a record resident in** a read-only mount. Placements and refs stored in the active db whose targets resolve to mounted chunks are legal — the federation pattern depends on exactly this. Reference is not modification. Checked at commit entry, before validation.

**Sync vs async.** The substrate is sync (SQLite is sync), so `read`, `commit`, `run`, `subscribe`, `unsubscribe`, `cancel`, mount ops return without awaiting. `await_processes` and `shutdown` are async. Outgoing event delivery to webviews rides the `HostCmd` channel returned at `Engine::open`.

---

## Start — what the engine writes

Starting (`run` with program + argument, or a consumed draft) is one atomic `db.commit()`:

1. **The placement check.** The argument chunk must be `instance` on the archetype the program's `argument` ref names. Fail → `VALIDATION_ERROR`, nothing written.
2. **The process chunk** — fresh for a direct start (owned per mode, `instance` on `engine/process`, the program, and each caller-supplied place), or the existing draft flipped. Body written whole: `argument` ref, `at` stamped to the branch head, `status → running`, `read`/`write` as granted (grants-derived roots + demand + the caller's edits, intersected with the caller's own reach for nested runs).
3. **The argument freezes.** From this commit, writes to the argument chunk are rejected — consumed.

At completion the mirror check runs: the result chunk must be `instance` on the archetype the program's `result` ref names; the engine fills `body.result` and flips status in the terminal commit.

Pre-generated ids let the engine reference the process from its own declaration. Cleanup writes status; it never dismantles topology (*Terminal cleanup never severs the frame*, above).

---

## Boundaries

A run's reach is **constructed, not filtered** — assembled at start from three sources, recorded as the process body's `read` and `write` keys, immutable for the run:

1. **The frame.** Every process reaches its own ownership subtree, both ways, always. Implicit; never listed. The argument chunk rides along (implicitly granted at start).
2. **Grants.** Roots derived from the argument's `grants: read|write`-marked ref keys as filled, plus whatever the starting person or program adds. For nested runs, the child's grants are intersected with the parent's effective reach at spawn — reach narrows through the call stack, never widens.
3. **Demand.** The program body's argument-independent residue. **Absent means open** — the program defers reach entirely to the run (the agent). **Present means exact** — the program's argument-independent reach is precisely this, and a run may narrow it, never widen it; `demand: { read: [], write: [] }` is the frame-only program (`model` — nothing beyond its frame, enforced, not promised). *Open: `demand`'s final shape .*

**The walk is ownership.** A root grants reach over its ownership subtree — `reach = ownership + explicit grants`; instance, relates, field, and mention never confer reach (substrate.md). Once a chunk is within reach, reading it returns all its connections — the boundary gates which doors you can open, it does not filter inside an opened room. `linked` answers are filtered to what the reader could reach (substrate.md, *Links*).

**Protected records.** From start on, the engine rejects any program write that modifies the process chunk itself (status, result, grants — engine domain) or a consumed argument.

---

## Expressions — locations, calls, collations

The engine owns the expression layer: the data shapes, the written language, and their execution. Display rules (the spine, pills, the editor) live with the reader ([`programs.md`](programs.md)).

### The shapes

```
location:    { of: [my-project, tasks] }          — places, intersected

call:        { program: diff, args: { old: a, new: b } }
             — named args always; param names from the argument archetype's
               instance contract; values are literal | ref | name

expression:  one grouped unit — its own named nodes + an `out`

collation:   { members: kv<name, location | expression>, settings, predecessor }
             — the reader's stored value (programs.md); predecessor cites the
               collation it was edited from
```

Names resolve internal nodes first, then collation siblings — the closure rule, applied twice. Expressions may reference sibling expressions. Pipe verbs are pure programs: `follow` (the citation walk), `at` (time travel as composition), `where`, `fold`, `explode`, `group`. **Pipe output is substrate-shaped** — chunks-and-placements — so the algebra composes over results, not just stored places.

**Names vs refs, by the grain principle.** Interior wiring is names — values: cheap branching, inline prose, no litter. Sharing lifts a node to a chunk, and its wires harden to `ref`.

### The written language

Classical calls — no pipes, no positional arguments:

```ol
diff(
  old: follow(from: [my-project, tasks]),
  new: where(in: [their-project, tasks], status: pending)
)
```

Bareword = reference · `program(…)` = call · `{k: v}` = record literal · `[a, b]` = list literal (a location where a location is expected) · literals. Nest freely; name only what's reused or wanted visible — prose blocks inline everything; collations name standing members. A group's last unnamed line is its `out`.

**Storage is the flat named graph.** Nesting is an anonymous node used once, auto-named at parse; text ⇄ WYSIWYG round-trips losslessly. Parsing is context-free recursive descent — trivial by construction.

**Plan-form vs run-form.** Nodes hold their args inline as data — the plan. Running a node materializes the argument chunk (`instance` on the program's argument archetype) and starts — the same call frame as every run; expressions add no second execution path. Type-checking a plan is reading the argument archetypes' instance contracts, before anything runs.

Fenced expression blocks in prose are anonymous expressions — no chunk exists until lifted (sharing confers identity); every chunk and location an expression uses files a mention (substrate.md, *Links*).

---

## Reactivity Wiring

How a `subscribe` op becomes a `place_changed` event in the calling program.

### The chain

```
db                    engine                    transport               program
──                    ──────                    ─────────               ───────
broadcast::Sender ─→  broadcast::Receiver  ─→   wry IPC channel    ─→   SDK event handler
(post tx.commit)      (one, from               (per webview)            (dispatches by
                       db.subscribe                                      message shape)
                       at engine startup)
                                                stdio JSON lines
                                                (per VM program)
```

1. **db.** Each successful write op pushes a `Commit` onto the substrate's broadcast channel after `tx.commit()` returns. Settled in db.md.

2. **engine.** On `mount_project` for a `ReadWrite` mount, the engine subscribes to that mount's `db.subscribe(&[db/commits], ..)`. A background task drains the receiver, filters by the mount's branch, and runs the dispatcher.

3. **dispatcher.** For each incoming `Commit`, the engine computes the *touched scope set* — the union of:
   - `commit.chunks_modified` — chunks whose body, spec, or name changed.
   - Both sides of `commit.placements_modified` — places that gained or lost a placement, and chunks whose own placements changed.
   - `commit.links_modified` — chunks that gained or lost links *to* them (the link delta, computed in the write transaction).
   - For each chunk in `chunks_modified`, the places it is currently placed on (all three stored kinds) — so a subscriber on a parent sees a member's body change. One bulk lookup per commit.

   The dispatcher fires `place_changed` on every subscription whose places intersect the touched set.

4. **transport.** Webview: the engine asks the host (main thread, as wry requires) to `evaluate_script("__sdk.event(<json>)")`. VM: a JSON line to the child's stdin.

5. **SDK.** Distinguishes by message shape, routes to the subscription's callback; `useRead` re-fetches and re-renders.

### Subscription lifecycle

- `subscribe(ctx, places)` — boundary-checked against the process's read reach. On pass: registered, id returned. On fail: `BOUNDARY_VIOLATION`, delivered by the SDK as the dead-subscription path (sdk.md).
- Subscriptions are owned by the calling process; terminal state drops them before further dispatch.
- `unsubscribe(id)` — idempotent removal.
- Boundaries are checked **only at subscribe time** — a run's grants are immutable, so a once-allowed subscription stays allowed unless reachability itself changes (below).

### Race-tolerant delivery

Subscription state and event dispatch are concurrent; the spec tolerates the natural races. Unsubscribe-during-dispatch: the event drops silently. Terminal-during-dispatch: same shape. An event arriving after a local unsubscribe is ignored — the SDK's registry was cleared.

### Subscription invalidation

Grants are immutable, but reachability through them is dynamic — an ownership change or removal elsewhere can sever the path from a run's roots to a subscribed place. On every commit whose placement delta could affect it, the engine recomputes reachability for possibly-affected subscriptions; severed ones are removed and `subscription_invalid` fires with a short reason. After that, no further events for the subscription. The dumb recompute-per-affected-process is v0.1; dependency tracking is a deferred optimization.

### Backpressure

The engine's input from db is a bounded `broadcast::Receiver`. On overflow, a `Lagged` marker arrives; the engine forwards a `lagged` event listing every active subscription id, and the SDK re-fetches. Slow subscribers block nothing — the per-subscription send is non-blocking, and a persistently slow transport drops the subscription with a final `lagged`.

**Coalescing is required, not deferred.** The streaming convention makes commit bursts normal, so multiple commits touching a subscription within a short window fire one `place_changed` (carrying the latest commit). Invisible to correct clients — the contract is re-fetch on event.

### Streaming convention

Intra-op streaming is not in the protocol and doesn't need to be: **streaming is commits.** A program with incremental output commits partial updates to its output chunk with `body.partial: true` at a throttled cadence (~4/s max), finalizing with `partial: false`. Subscribers re-render per coalesced event. Partial states enter the lossless history; when branch-bound runs land (below), partials on the turn's branch keep main clean. One convention, settled here.

---

## Run and Await Mechanics

### Process state and watchers

The engine holds a per-active-process slot:

```rust
struct ProcessSlot {
    status:  watch::Sender<ProcessStatus>,   // running | done | failed
    spawn:   SpawnHandle,                    // child process, or webview ref
    timeout: Option<JoinHandle<()>>,         // pending timeout future
    config:  RunConfig,                      // resolved grants, timeout_ms
}
```

`ProcessStatus` is one enum used in-memory and at the substrate body field (as the status value-chunk ref). Slots exist only for started processes — drafts are data, never slotted. The map is `HashMap<ProcessId, ProcessSlot>` under a Mutex; slots are created on start and removed on terminal transition.

### `run` (start)

The slot is inserted *before* the substrate write so `cancel` and `timeout` can always land on a known process id.

1. **Placement check + compose the declaration** (see *Start*).
2. **Insert the slot.** Register the timeout JoinHandle.
3. **`db.commit(declaration)`** — atomic. On failure, remove the slot and return the error.
4. **Status check.** If `cancel` or timeout fired between 2–3, skip spawn and run cleanup (writes `status: failed`, removes the slot). Cleanup always has a substrate chunk to write to, since step 3 completed.
5. **Look up the runtime provider** for the program's `runtime` and call `provider.spawn(SpawnContext { process_id, program, request_tx })`. Provider returns a `RuntimeHandle` with `transport`, `ready`, `terminal`.
6. **Wire signals.** One task awaits `ready` (the run is live); another awaits `terminal` and triggers cleanup.
7. **Return `process_id`.**

The start commit writes `status: running`; the commit-to-spawn gap is engine-internal, never a field state. A cancel landing in the gap is caught at step 4 or by the watcher tasks; the substrate always carries a complete record and `await_processes` resolves to the terminal state.

`cancel(process_id)` is idempotent. A cancel for an unknown or already-terminal process returns `Ok` — the desired state ("not running") holds; callers never race terminal cleanup.

### `await_processes`

```rust
pub async fn await_processes(&self, ctx: &Context, ids: &[ProcessId])
    -> Result<HashMap<ProcessId, ChunkItem>, EngineError>
{
    // 1. Boundary-check each id against ctx.
    // 2. For each id: slot present → watch its receiver; slot absent but
    //    present in the substrate → already terminal, short-circuit.
    // 3. Concurrently await terminal on each receiver.
    // 4. db.get(process_id) for each — the process chunk, result one hop away.
}
```

| Runtime | `done` signal | `failed` signal |
|---|---|---|
| VM | stdout closed AND exit code 0 | stdout closed AND exit ≠ 0; OR `cancel`; OR timeout; OR malformed output |
| Webview | The `exit` op; OR the user closes the tile (host unmounts) | `cancel`; OR timeout |

Multiple programs may await one process; `watch::Receiver` broadcasts terminal state to every awaiter.

### Cleanup on terminal state

1. **Update the process chunk** — `body.status`, `body.result` (if declared and produced; the completion placement check runs here), `body.error?`.
2. **Drop the spawn.** Kill the executable / unmount the webview if still alive.
3. **Cancel the timeout** if pending.
4. **Unregister all subscriptions** owned by the process.
5. **Cascade to children.** Every active process owned by this one gets the same terminal transition with `error: 'parent ended'`. Recursive.
6. **Resolve awaiting receivers.**
7. **Remove the slot.**

A child never outlives its parent — its results would be orphaned. The slot's existence is ground truth for "active"; once removed, `await` reads terminal state from the substrate.

---

## Tool Calls Are Just Runs

An agent making a tool call uses the same `run` operation:

1. The agent commits the argument chunk (typed, `instance` on the tool's argument archetype), then calls `run` in child mode.
2. The engine runs the placement check, writes the child process owned by the agent's process — the trace nests by ownership.
3. Grants intersect: child reach ⊆ agent reach ∩ the tool's demand. The model can never escalate.
4. The engine spawns the tool and returns the process id immediately; the agent awaits when it needs the result — the process chunk, `result` one hop.

Nothing discourse-shaped is written anywhere — the tool trace *is* the frame; providers wanting message history get it reconstructed from frames as serializer policy ([`agent.md`](agent.md)). Substrate operations (`read`, `commit`, `subscribe`) from the agent are not tool calls — they go directly through the protocol and create no processes.

---

## Traceability

Every commit carries a `process_id` — the run that caused it, or null for host-level commits. Commits stay in their own table; the read layer projects them under the virtual place `db/commits`:

- `read([db/commits])` — all commits
- `read([db/commits, processId])` — commits from this run
- `read([db/commits, chunkId])` — commits that modified this chunk

Chunk → commit → process → program: any change walks back to the program that caused it and the person who ran it. Virtual places accept the parameter shapes listed in [`db.md`](db.md#virtual-chunks-branches-and-commits); unrecognized shapes return empty, never error.

---

## Runtime providers

Runtime kinds are not built into the engine; they are plugged in at boot via `register_runtime(kind, provider)`. v0.1 ships two — VM and webview — both implemented in the host crate.

```rust
pub trait RuntimeProvider: Send + Sync {
    fn spawn(&self, cx: SpawnContext) -> Result<RuntimeHandle, SpawnError>;
}

pub struct SpawnContext {
    pub process_id: ProcessId,
    pub program: ProgramRef,
    pub request_tx: mpsc::Sender<(Context, Request)>,
}

pub struct RuntimeHandle {
    pub transport: TransportRef,                       // engine pushes outgoing events
    pub ready: oneshot::Receiver<()>,                  // runtime alive → slot Running
    pub terminal: oneshot::Receiver<TerminalReason>,   // resolves on terminal
}
```

The provider drives readiness and terminal on its own schedule; the engine awaits them. No runtime-specific entry points exist on the Engine API.

**Capabilities and secrets.** A program's `capabilities` is a small vocabulary — `net[:host]`, `fs`, `exec`, `secret:<NAME>` — **enforced by the runtime provider at spawn**: egress allowlisted, filesystem and exec gated, secrets injected as env vars from a host-held keychain. Secrets are **never chunks** — the substrate is lossless; a committed key would be permanent. The effective capability set is recorded on the process body for inspection. (Held open: whether capabilities/secrets and integrations are one family — both declare reach into the world outside the field.)

**Multiplexed transports.** One physical transport may carry several protocol identities: a webview hosting embedded citizens tags each request with its slot's identity token; the host maps token → process id before attaching `Context`. Each citizen is its own process — boundaries and commit attribution hold at slot granularity. Mechanics in host.md and sdk.md; the engine only requires that `Context` arrives correct.

## Containment

Containment is the runtime provider's concern. What the engine guarantees regardless of provider: every substrate operation passes the boundary check, so containment and boundary enforcement compose. v0.1's split-containment model and the uniform-VM alternative are in [`pilot.md`](pilot.md#containment) and [`horizon.md`](../horizon.md).

---

## Operational Behavior

### Timeouts

`run`'s optional timeout is written to the process body; if omitted, the program's own `timeout_ms` applies. Defaults: tool programs 30000 ms; agent programs 300000 ms. On expiry the engine kills the executable and sets `failed` with `error: 'timeout'`. The clock pauses while the process awaits its own children — a turn delegating a ten-minute sub-agent is idle, not hung.

### Error Classification

Not every error kills a program. Informational errors return as protocol responses; the program continues.

| Condition | Engine response |
|---|---|
| Boundary violation (read, subscribe, commit) | `BOUNDARY_VIOLATION` response; process continues |
| Spec violation (commit) | `VALIDATION_ERROR` response; process continues |
| Write to protected record | `BOUNDARY_VIOLATION` response; process continues |
| Malformed request | `INVALID_REQUEST` response; process continues |
| Unparseable stdout line | Kill; `failed`, `error: 'protocol: malformed output'` |
| Exec exits non-zero | `failed` |
| Timeout | Kill; `failed`, `error: 'timeout'` |
| VM stdout closes, exit unreadable | `failed`, `error: 'killed'` |
| Webview destroyed mid-response | Pending request rejects `TRANSPORT_CLOSED` SDK-side; engine cancels the process if not already terminal |

Parse failures and crashes are terminal. Everything else is informational.

### Startup Reconciliation

At start the engine marks every `running` process `failed` with `error: 'engine restart'` — those executables are gone. Drafts are untouched: they are data, resting where composed. Subscriptions are not persisted; they live in memory and vanish with the engine. Children of failed parents fall out of the cascade rule; no special logic.

### Boundary-Request Behavior

An explicit `BOUNDARY_VIOLATION` beats a silently empty read. The engine returns the error when a queried place isn't reachable, so empty results mean genuinely empty places, not withheld ones.

---

## Client Library

The engine exposes only Rust functions; it ships no TS client. Programs reach those functions through the SDK, which serializes calls into the protocol JSON and selects the transport. The SDK ships from the engine crate ([`engine/sdk/`](../engine/sdk/)) because it is the engine's protocol expressed as TypeScript; surface and transports in [`sdk.md`](sdk.md).

---

## Code architecture

### Module layout

```
engine/
  src/
    lib.rs              — public re-exports
    types.rs            — Context, RunArgs, RunTarget, ProcessId, SubscriptionId,
                          ProjectId, MountMode, RuntimeKind, ProcessStatus, Event,
                          HostCmd, plus Display/From impls
    errors.rs           — EngineError (single enum); MountError, RegisterError
    engine.rs           — Engine struct; open returns (Engine, mpsc::Receiver<HostCmd>);
                          shutdown(self); impl Drop
    mounts.rs           — MountedProject { db, mode, branch }; the registry;
                          read-only enforcement; federated ref resolution
    runtime.rs          — RuntimeProvider trait; SpawnContext, RuntimeHandle;
                          the runtime registry
    bootstrap.rs        — reconcile_zombies(&Db): one read, one commit.
                          Read-write mounts only; drafts untouched.
    process.rs          — ProcessSlot; SpawnHandle enum; set_terminal, cascade
    subscription.rs     — Subscription, TransportRef, SubscriptionRegistry
    reactivity.rs       — loop_task; handle_commit composed from compute_touched,
                          gather_fanout, gather_invalidations, apply
    protocol.rs         — Request | Response | Event JSON shapes; dispatch_request;
                          tagged-value passthrough; wire ErrorCode mapping
    boundary.rs         — reachable (ownership walk from granted roots, federated),
                          intersect (stateless reads via &Engine)
    expressions.rs      — the expression shapes; parse (recursive descent);
                          plan type-check against instance contracts; run-form
                          materialization
    ops/                — public surface; one module per Engine method
      read.rs get.rs commit.rs run.rs cancel.rs subscribe.rs await_processes.rs
  tests/                — integration tests against the spec
```

Each `ops/*.rs` owns its method end-to-end via `impl Engine`. Internal modules are flat siblings; one structuring axis (the public ops), one folder. The engine crate ships **zero runtime implementations** — providers live in the host crate and register at boot.

### Within-file shape

Each file composes from small named functions; the public method reads as a top-to-bottom narrative calling private helpers. What earns a comment (per [`conventions.md`](../conventions.md#code)): race semantics, ordering invariants, channel-primitive quirks.

### Key mechanics

**State authority follows lifecycle.** A started process has two homes — its slot (live runtime) and its substrate chunk (durable). The slot is authoritative while active; the substrate once the slot is gone. Authority transfers in one ordered step at terminal: cleanup writes the terminal status, then drops the slot. One truth at any moment; the seam is the cleanup commit.

**Reactivity owns event emission.** The reactivity task is the engine's only consumer of the db change feed and the only emitter of `place_changed` / `lagged` / `subscription_invalid`. Cleanup paths trigger reactivity by writing terminal commits; they never emit events directly.

**Webview transport as commands.** wry/tao machinery is main-thread and `!Send`; the engine never holds a `WebView`. `Engine::open` returns `(Engine, mpsc::Receiver<HostCmd>)`; the host drains the receiver on its event loop and translates each `HostCmd` (`MountWebview`, `UnmountWebview`, `EvaluateScript`) into a wry call. The engine's only seam to non-`Send` code, expressed as data.

**Errors as one vocabulary.** One wire surface, one `EngineError` enum; the response builder maps to wire codes via a single `match`.

**Single writer where it matters; locks where it doesn't.** Registries are `Mutex<HashMap>` held only for insert/remove, never across an `await`.

**Async runtime.** Reactivity and per-VM stdio pumps run on tokio via a `Handle` stored at `open`; the host calls `Engine::open` inside its tokio context.

### Settled choices

- **Mount registry as `Mutex<HashMap<ProjectId, MountedProject>>`.**
- **Runtime registry without dynamic loading** — a HashMap of trait objects, registered at boot.
- **`ProjectId` = canonical absolute filesystem path.**
- **Federation in Rust, not SQL.** Each `Db` stays single-file and portable; broadcasts stay per-db.
- **Single `EngineError` enum** — principled divergence from db's per-op enums, justified by the single wire surface.
- **`HostCmd` channel** as the host seam; commands as data.
- **`tokio::sync::watch`** for `ProcessStatus`; **`broadcast::Receiver`** for the db feed; **`mpsc`** for `HostCmd` and per-VM stdin queues; **`std::sync::Mutex`** for registries.
- **`Engine::shutdown(self)`** consumes self: cancels reactivity, awaits the join, terminal-cleans every active process. `Drop` aborts as best-effort fallback.
- **`thiserror`** with `From<DbError>` / `From<ProtocolError>`.

---

## What Is Open

- **Branch operations over the protocol.** The substrate is fully branch-aware, but the protocol cannot yet create a branch, commit to a named branch, write a merge, or bind a run to a branch. The settled shape when taken: a `branch` op, `Declaration.branch?`, a merge form of `commit`, and a run's branch routing the process and its children to a work branch. Unlocks the acceptance workflow — agent works a branch, human reviews, merge is the yes — and branch-parked streaming partials. Merge semantics ruled (substrate.md §What's Open): union of additions, hard fail on true collision, an agent resolves refusals as ordinary work.
- **Daemons (services).** A process whose executable stays resident. The lifecycle must extend without a new primitive: a daemon's terminal transition is a *policy* (stop, restart), not the end of a job. Not v0.1; must not be foreclosed. The engine-as-daemon direction (`horizon.md`) is where resident programs get a home outliving any window.
- **Pause/resume.** A control signal honored between cycles of cycle-driven programs — program-level convention first ([`agent.md`](agent.md)); promoted to an engine op only if it generalizes.
- **`attach` — demoted.** Typed refs are the honest channel `attach` existed to provide: an argument that references an existing chunk is a `ref` key, validated, link-indexed, boundary-gated. Re-examine what narrow case remains before building anything.
- **`explode` — virtual chunks from body keys.** A pure transform projecting a body's keys as virtual chunks, same family as `db/commits`. The principle: pipe output is substrate-shaped, so the algebra composes over results. Materializing is committing the same output — promotion when a query proves hot, never upfront. Lands with the pipe vocabulary.
- **Draft/argument residence edges.** The residence rules (frame = ownership subtree; drafts owned by the session) are the fold's reading; edge cases — re-homing on re-run, cross-project drafts — settle at the draft + form build.
- **Schema version skew on peer mount.** v0.1 refuses to mount peers whose db schema differs; migrating a mounted db is v0.2. See [`horizon.md`](../horizon.md).
- **Stale process chunks in peer dbs.** A peer may carry `running` processes from when it was active. v0.1 does not reconcile them (peers are read-only); they surface as-is.
- **Symmetric peering.** v0.1 mounts are read-only, local-filesystem. Read-write peering, remote mounts, identity/auth, sync live on horizon; the boundary mechanism already carries the model.
