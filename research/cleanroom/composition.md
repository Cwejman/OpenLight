# Programs — Composition

> Clean-room pass B ("composition"). Fresh context given only the author's ground statement and substrate.md / engine.md / host.md / sdk.md. Deliberately blind to inside.md, programs.md, agent.md, horizon.md, board.md, README, research/. See `rework.md` at repo root for provenance and synthesis.

The program layer of OpenLight, derived from one claim: **programs are composable into new programs**. The substrate ([substrate.md](../../pilot/substrate.md)), engine ([engine.md](../../pilot/engine.md)), host ([host.md](../../pilot/host.md)), and SDK ([sdk.md](../../pilot/sdk.md)) are taken as given; this document specifies what composition means against those mechanisms, the program set built on that meaning, the interface as an instance of it, and the demands composition places back on the mechanism layer.

---

## 1. The Composition Model

### 1.1 The call frame

A program is a chunk placed `instance` on `engine/program`, with `body.executable` and `body.runtime` (engine.md, *Program and Process*). To run it is to create a process chunk. Everything in this document follows from what that process chunk structurally is:

- It is placed `instance` on the program — so the program's `propagate: true` spec governs everything placed `instance` on the process (`program.spec ∪ engine/process.spec`, engine.md *Process Creation*).
- The caller's argument chunks are placed `instance` on it at spawn, validated by the composed spec's `accepts`.
- The process id is implicitly a root of both its own boundaries (engine.md, *Boundaries*) — the program can always read its arguments and write its output there.
- `await` returns the process's final scope (engine.md, *Run and Await Mechanics*).

So the process scope is a **call frame**: typed arguments in at spawn, work written during the run, the whole frame handed back at `await` — and, because the substrate is lossless, the frame persists after the call returns. Every call in the system is a durable, queryable, viewable object. This one fact carries most of the composition model: *a result is a scope*, and scopes are exactly what every other mechanism in the system operates on — queries intersect them, subscriptions watch them, boundaries grant them, tiles display them.

The argument-declaration flow, made explicit: the caller's `run(programId, { chunks, ... })` carries each argument as a `ChunkDeclaration` that includes the dual placement on its argument archetype; the engine adds the `instance`-on-process placement; the substrate's two-pass write-then-validate (substrate.md, *Mutations and validation*) lets the argument chunk and its type placement land in one atomic declaration, so the `accepts` check finds the type membership. Arguments are typed the same way session events are typed — the mechanism is the session-archetype pattern of substrate.md applied to execution.

### 1.2 The four channels

Two programs compose through exactly four channels. Each is a placement pattern; there is no composition mechanism that is not a placement.

**C1 — Call (vertical).** A runs B: `run` creates B's frame nested `instance` on A's frame (engine.md, *Tool Calls Are Just Runs*), A `await`s it, reads the frame. Typed on the way in by B's `accepts`; typed on the way out by B's declared result archetypes (§1.3). The nesting placement makes the trace structural: an orchestration is readable as a tree of frames, no logging layer needed. `run` and `await` being separate ops gives sequential, parallel, and fire-and-forget shapes for free (engine.md, *Run and await are separate*).

**C2 — Scope (horizontal).** A writes chunks into scope S; B reads S. No process relationship at all — the coupling is the archetype spec on S, which the substrate enforces on A's writes and B can rely on when reading. With `subscribe`, C2 becomes live dataflow: B re-fetches on every commit touching S (engine.md, *Reactivity Wiring*). Two important special cases:

- *Streaming.* B subscribes to A's **live frame**. A commits partial results as it works; B sees each commit. The protocol has no intra-op streaming (sdk.md, *What Is Open*) and doesn't need one for program-to-program flow — incremental hand-off is just incremental commits to the frame. What the caller must arrange: A's frame id inside B's read boundary at B's spawn, which is legal because A's frame is implicitly within A's own boundary and boundaries pass to children by intersection.
- *Post-mortem reads.* Frames persist, so C2 works on completed processes identically. A view over a finished tool run and a view over a running one are the same program.

**C3 — Surface (spatial).** A leaf tile is placed `relates` on a process (host.md, *The Composition Types*); a split tile composes two subtrees; a recipe preserves a subtree as a template; a spawned recipe is a container process with nested tiles. Surfaces never nest in the DOM — the host owns every rectangle — so *surface composition is tile-tree composition*, and the only joint between geometry and execution is the single `relates` placement from leaf to process. Everything in §3 leans on the narrowness of that joint.

**C4 — Boundary (the algebra of what composition cannot do).** Effective boundary = intrinsic ∩ run-level, and children intersect with parents — monotone narrowing down the call tree, never widening (engine.md, *Boundaries*). Two derived laws that every pattern below obeys:

- *An orchestrator's grant must contain the union of its children's needs.* Since a child can only be granted what the parent holds, composing programs composes their boundary demands upward. A pipeline whose stages need `[src]` and `[docs]` needs `[src, docs]` itself.
- *References are not capabilities.* A result chunk carrying chunk ids in its body grants the reader nothing; the reader's own boundary gates every dereference. Hand-off can therefore flow freely through the substrate without leaking authority — and a program can be shown a result it cannot expand, which surfaces as an explicit `BOUNDARY_VIOLATION`, not silence (engine.md, *Boundary-Request Behavior*).

Note that boundary gates *substrate* reach only. World reach — disk, network, exec — is the VM capability system (host.md, *Program as Interface*). A program's full authority is the pair (boundary, capabilities); composition narrows the first mechanically and must state the second declaratively.

### 1.3 The interface of a program

For composition to be more than convention, a program's contract must be readable from the substrate by machines — a runner rendering a form, a pipeline validating a plan, an agent choosing a tool. The contract is four things, all expressible with existing mechanisms:

1. **Argument types.** Type-defining chunks placed `relates` on the program chunk (so `accepts` name resolution finds them — substrate.md, *Archetypes*), each also placed `instance` on `programs/argument`. Their specs (`required`, `unique`) define argument shape.
2. **Result types.** Same pattern, marked `instance` on `programs/result`. The program commits result chunks into its frame dual-placed on these types.
3. **`spec.accepts`** on the program chunk lists the union of both — the substrate's validation is symmetric over frame content; the *direction* of each type is the role marking in (1)/(2). This is deliberate: results are validated exactly as strictly as arguments.
4. **Boundary demands.** The intrinsic boundary (a `relates` boundary chunk on the program) states the program's *limit*; a `programs/demand` chunk — same shape as a boundary chunk, `relates` on the program — states the roots a run must be *granted* to be useful. Limits are enforced by the engine; demands are documentation a launcher reads to prompt the user. Capability needs live in `body.capabilities` as engine.md already allows.

`programs/argument`, `programs/result`, and `programs/demand` are ordinary archetypes shipped by the programs project. No mechanism change — role marking is placement, like everything else.

One derived rule about result shape: **results that reference existing chunks carry ids in their bodies, not `relates` placements onto the found chunks.** Writing a placement touches the scope chunk's placement set, which requires write-boundary reach over it; a query program (`select`, below) correctly runs with a frame-only write boundary and therefore *cannot* relate onto what it finds. The mechanism forces the right design: reference by id, authority stays with the reader.

### 1.4 Composition patterns

Each pattern named, reduced to its channels, with its precondition stated.

**P1 — Tool call.** C1, one child. Precondition: argument types satisfiable from what the caller holds; child's demand ⊆ caller's grant.

**P2 — Sequential pipeline.** C1 repeated: run stage N, await, read result chunks from its frame, feed stage N+1. Hand-off today is *by copy* — `RunArgs.chunks` accepts only new declarations, so the orchestrator re-declares stage N's output as stage N+1's argument. This works but forks identity: the copy is a new chunk, unlinked from the original, in a substrate whose whole point is identity and provenance. Demand D1.

**P3 — Fan-out / join.** C1 parallel: several `run`s, one `await` over all ids. `await_processes` resolves multi-id natively, and any program whose read boundary covers a process may await it — including processes it didn't start — so joins over siblings are expressible when a common ancestor arranged visibility.

**P4 — Stream pipe.** C2 on a live frame, as in §1.2. Producer and consumer are peers under one parent; parent grants the consumer the producer's frame id as a read root.

**P5 — View over a tool's output.** C3 + C2: a webview program whose `target` argument is a frame id (or any scope), subscribed via `useScope` (subscribe-before-fetch, sdk.md). Identical mechanics live or post-mortem. This is the pattern that dissolves "output panes" as a host feature.

**P6 — Blackboard.** C2 with N writers: a shared scope whose archetype spec is the coordination contract (`accepts` gates event types, `ordered` gives a log, `unique` gives registry semantics). Commits are atomic and every writer's commits carry `process_id`, so attribution is native (engine.md, *Traceability*). The agent session of substrate.md's example *is* a blackboard between user, agent, and tools.

**P7 — Orchestrator / agent.** C1 in a loop, driven by a model: build context (C2 reads), call `complete`, execute chosen tool runs (C1, boundary-narrowed per call), record events into a session scope (P6), repeat. The engine already guarantees the crucial property: nothing the agent runs can exceed the agent's own grant.

**P8 — Request/dispatch.** C2 as indirection for *launching*: program X commits a typed request chunk into a request scope; a long-lived privileged program subscribed to that scope performs the actual `run`. This pattern exists because of a hard mechanism fact: program-initiated runs nest under the caller (`placements` is engine-owned for protocol runs — sdk.md, *Types*) and children never outlive parents (engine.md, *Cleanup on terminal state*). A short-lived launcher like the command palette therefore cannot directly start anything that should survive its dismissal — the cascade would kill it. Dispatch through a session-lifetime program breaks the lifetime coupling. See §3.1; the residual fragility is demand D4.

**P9 — Saved arrangement.** C3 reified: a `host/recipe` subtree, spawned into a container process with fresh child frames and fresh tiles (host.md). The cascade rule gives "collapsing the container stops its children" for free — the container completing cascades exactly as host.md describes. Recipe spawning is itself performed by a program (`programs/compose`, §2.2), which makes arrangements runnable — closing the loop on "a composed program is a program."

### 1.5 Where composition breaks

Stated here, resolved or ranked in §4:

1. **Hand-off is copy-only** — pipelines fork identity (→ D1).
2. **Results are conventional at the mechanism level** — `await` returns the whole frame (arguments, boundary chunks `relates`'d on the process, scratch, results, undifferentiated), and frames can be large with no `limit` yet (→ D2).
3. **No protocol `cancel`** — sdk.md exposes `cancel`, engine.md's op table doesn't carry it and `Engine::cancel` takes no `Context`; no program can terminate another program with defined authority (→ D3).
4. **Lifetime is strictly tree-shaped** — no detach, no re-parent; every long composition must root in a process that lives long enough, and the dispatcher pattern concentrates that risk (→ D4).
5. **Surfaces can't be awaited** — a webview program's `completed` is the user closing its tile (engine.md, terminal-state table), so views are sinks, never pipeline stages, and self-dismissal is by unstandardized convention (→ D6).
6. **Execution is single-branch** — the substrate versions everything, but a run cannot target a fork and merge on success; no speculative composition (→ D7, deferred).
7. **Read-only-mount semantics as literally written forbid the layer's own typing** (→ D5 — the sharpest wording-level conflict found).
8. **Live composition stops at the active project** — read-only mounts fire no events (engine.md, settled for v0.1). Cross-mount composition is read-and-poll. Not a demand; a documented edge.

---

## 2. The Program Set

### 2.0 Minimality criterion and shared archetypes

The SDK gives every program `scope`/`get`/`commit`/`run`/`awaitRun`/`subscribe` within its boundary. Therefore **a primitive program is warranted only where it holds an authority the SDK does not confer**: an external effect (disk, network, exec), model access, a surface, or a lifetime. Pure chunk-to-chunk transforms need *an* executable but no first-party primitive — `shell` subsumes arbitrary computation in the VM, and typed transforms accrete as user programs (any committed chunk `instance` on `engine/program` with an executable on disk is a program; the agent can author one with nothing but `filesystem` and `commit` — the program set is self-extending through the same two channels everything else composes through).

The programs project ships the shared archetypes of §1.3 (`programs/argument`, `programs/result`, `programs/demand`) and the tool/orchestrator programs below. The surface and interface programs ship from the host project (matching host.md's `host/programs/` directory). Contract notation below: **Args** and **Results** are the `relates`-placed type chunks; **Spec** is the program chunk's own spec; **Boundary** is intrinsic limit / typical demand; **Feeds/Fed by** is the composition position.

### 2.1 Primitives

**`programs/echo`** — the identity program; the test fixture for channel C1.
- Runtime: `vm`. Surface: none.
- Spec: `{ propagate: true, accepts: ['input', 'output'] }`. Args: `input` `{ required: ['value'] }`. Results: `output` (`body.value` copied from input).
- Boundary: intrinsic boundary chunk with **zero roots** — frame-only, since the frame is implicitly reachable. The narrowest possible program; also the reference example that "no roots" and "no boundary placement" (open) are opposite ends.
- Fed by: anything; feeds: anything. Exists to make the call frame's round trip testable in isolation.

**`programs/filesystem`** — the substrate's hands on the disk; the materialization half of substrate.md's *Integration* section.
- Runtime: `vm`, capabilities `['fs']`. Surface: none.
- Spec: `{ propagate: true, accepts: ['op', 'content', 'entry', 'error'] }`.
- Args: `op` `{ required: ['action', 'path'] }` — `action ∈ read | write | list | stat`; `write` carries `body.content` or `body.source` (a chunk id whose `body.text` to write out).
- Results: `content` `{ required: ['path'] }` (`body.text`, `body.git_commit?` when the file is git-tracked — feeding substrate.md's reference-pinning); `entry` per listed file; `error`.
- Boundary: intrinsic frame-only — the filesystem program has no business reading substrate scopes beyond its frame; its authority is entirely the `fs` capability. This is the clean illustration of the two-authority split in §1.2/C4.
- Fed by: agent (P7), pipelines (P2), edit flows. Feeds: `complete` (file content as context), `select`-then-view flows, program authorship.

**`programs/shell`** — arbitrary execution; the escape hatch that keeps the primitive set small.
- Runtime: `vm`, capabilities `['fs', 'exec']`. Surface: none.
- Spec: `{ propagate: true, accepts: ['command', 'stdin', 'exec'] }`.
- Args: `command` `{ required: ['line'] }`; optional `stdin` (`body.text` or `body.source` id).
- Results: `exec` `{ required: ['exit'] }`, `body.stdout`, `body.stderr`. Long runs may commit partial `exec` chunks with `body.partial: true` into the frame — the P4 stream pattern, consumed by an inspector subscribed to the live frame.
- Fed by: agent, pipeline, palette. Feeds: everything; explicitly subsumes "generic transform."

**`programs/web`** — the network read primitive.
- Runtime: `vm`, capabilities `['net']`. Surface: none.
- Args: `request` `{ required: ['url'] }` (`body.method?`, `body.headers?`, `body.payload?`). Results: `resource` `{ required: ['url', 'status'] }`, `body.text`/`body.data`.
- Timeout: 30 000 ms class per engine.md defaults, like filesystem and shell.

**`programs/complete`** — one model call, and nothing else. The ground statement's citizenship claim, made mechanical: this program is distinguishable from `echo` only by its body and capability declaration.
- Runtime: `vm`, capabilities `['net']`. Surface: none.
- Spec: `{ propagate: true, accepts: ['instruction', 'context', 'params', 'completion'] }`.
- Args: `instruction` (`body.text`); `context` (`body.ids: ChunkId[]` — chunk references the program dereferences through its **granted** read boundary; the C4 law applies: the model reads only what the run was granted); optional `params` (`body.model`, sampling fields).
- Results: `completion` `{ required: ['model'] }` — `body.text`, `body.source_ids`, and the frame's commits carry `process_id`, so provenance from model output back to exact inputs is a substrate query (`db/commits ∩ process`), not a log.
- Boundary demand: the context roots. Frame-only write — `complete` never writes outside its frame; *placing* its output somewhere is the caller's composition, which is what keeps it pure enough to reuse everywhere.
- Fed by: agent (its inner loop), summarize flows, palette one-shots. Feeds: session scopes, derivation scopes (a caller placing a completion `relates` on source + `summaries/<model>` reproduces substrate.md's *Derived data* pattern exactly).

**`programs/select`** — a query reified as a frame, so that C2 consumers get a stable, re-runnable, ownable anchor for "this result set."
- Runtime: `vm`, no extra capabilities. Surface: none.
- Args: `query` `{ required: ['roots'] }` — `body.roots`, `body.match?` (FTS), `body.exclude?` (negation roots), `body.at?` (temporal read), `body.limit?`.
- Results: `selection` — `body.ids`, `body.counts`, `body.head` (the commit the query resolved against, so staleness is checkable per substrate.md's derived-data discipline).
- Boundary demand: the query roots (read). Frame-only write — per §1.3's derived rule, it cannot and should not relate onto found chunks.
- Fed by: palette search, agent context assembly, pipelines. Feeds: `read-tile` (a view over a selection), `complete` (selection as context), dashboards.

Six primitives. The claim to check: every program in the rest of this document is either a surface, an orchestrator, or a composition of these six plus the SDK.

### 2.2 Orchestrators

**`programs/pipeline`** — P2/P3 as a program.
- Runtime: `vm`. Surface: none (inspect via `host/inspector`).
- Args: `plan` — ordered stages, each `{ program: ChunkId, bind: { <argType>: literal | { stage: n, result: <resultType>, field?: string } } }`; `body.parallel?: number[][]` groups stages for fan-out.
- Execution: per stage, resolve bindings (read the bound stage's frame, filter to chunks `instance` on the named result type), declare argument chunks, `run` nested, `await`. Under current mechanisms binding is by copy (§1.4/P2) — the pipeline records `body.copied_from` on every copied argument so provenance survives until D1 lands, at which point binding becomes attachment and the copies disappear.
- Results: `outcome` — `body.stage_frames: ProcessId[]`, `body.final: ProcessId`, `body.failed?: n`. Stage failure surfaces as `RUN_FAILED` on await; the pipeline halts, commits `outcome` with `failed`, exits non-zero; the parent's cascade cleans any parallel siblings still running.
- Boundary: the §1.2/C4 law verbatim — grant must cover the union of stage demands. A launcher computes that union from the stages' `programs/demand` chunks before prompting.
- Static checkability: because argument and result types are substrate chunks, a plan is type-checkable *before running* — for each binding, does stage n declare that result type, and does the target program accept the bound argument type? A `check`-mode run of pipeline does exactly this and writes a report chunk without running any stage.

**`programs/compose`** — P9 as a program: recipe instantiator and container.
- Runtime: `vm`. Surface: none of its own; its *children* have surfaces.
- Args: `recipe` (id of a `host/recipe`), `root` (the tab or tile to spawn under), optional `bindings` (argument chunks for the template's leaves).
- Execution: read the recipe subtree; for each leaf — which, per identity-based recipe referencing (host.md, open, "leaning identity"), `relates` a *program* plus an argument-template chunk — commit a fresh `host/tile` under the cloned structure, `run` the program nested (child of compose's frame), commit the leaf→process `relates` placement. Then stay alive: `awaitRun` on all children. Compose's own frame **is** the container process of host.md — one sidebar entry, expandable to children; cancelling it cascades to every child, which is host.md's "collapsing the container stops its children," derived rather than special-cased.
- Boundary demand: write over the target tab/tile scope plus the union of leaf-program demands.

**`programs/agent`** — P7; the composed program the ground statement is about, and deliberately *not* a primitive: it is `complete` + the SDK + the session archetype.
- Runtime: `vm`, capabilities `['net']`. Surface: none — its visible form is session chunks rendered by `host/read-tile`, and its live trace is its frame rendered by `host/inspector`.
- Args: `instruction` (`body.text`); optional `session` (`body.id` — continue an existing session).
- Execution loop: (1) ensure/extend a session chunk per substrate.md's session archetype — the session, not the frame, is the model-facing record (engine.md, *Tool Calls Are Just Runs*, draws exactly this line: frame = authoritative trace, session = reconstruction); (2) assemble context (`select` runs or direct `scope` reads); (3) run `complete` with instruction + context; (4) parse intended tool invocations from the completion; (5) `run` each tool nested with a boundary narrowed to what that call needs — narrowing is free, widening is impossible; (6) record `tool-call`/`tool-result` session events dual-placed per the archetype; (7) loop or write the `answer` event and exit.
- Results: `answer` (`body.text`, `body.session`).
- Boundary: **open intrinsic** (no boundary placement — engine.md names the agent as the open case); the run grant is the user's whole decision surface for what this agent may touch. Demand chunk lists nothing fixed; the launcher must always prompt.
- Timeout: 300 000 ms class per engine.md.
- Fed by: palette, sidebar re-run, other agents (an agent running an agent is P7 nested — same op, narrower boundary, deeper frame tree; nothing new needed).

### 2.3 Surface programs

All `runtime: 'webview'`, all built on `useScope`'s subscribe-before-fetch contract, all sinks in the C1 sense (§1.5, point 5): they complete when their tile closes, so nothing awaits them as a stage.

**`host/read-tile`** — the universal scope viewer; P5's second half.
- Args: `target` — `body.ids: ChunkId[]` (scope roots to intersect), `body.at?` (temporal view), `body.match?`. Optional `display` (`body.mode: list | text | table`, per-archetype renderer hints).
- Contract: reads target intersection, subscribes, renders; writes nothing outside its frame. Read boundary demand: the target roots.
- Fed by: anything that produces a scope — which is everything, since frames are scopes. `read-tile` over a `selection`'s ids is a search-results pane; over a session, a chat transcript; over `db/commits ∩ chunk`, a history view. One program, many "panes."

**`host/edit-tile`** — the write counterpart.
- Args: `target` (`body.id`, single chunk). Renders the chunk's body for editing; commits declarations on save; surfaces `VALIDATION_ERROR` inline when an edit violates the target scope's spec — the substrate's contract enforcement *is* the form validation.
- Boundary demand: read+write over the target's scope. The prompt this forces at launch is the design working correctly: editing reach is always an explicit grant.

**`host/inspector`** — the universal frame viewer; renders any process, which is what makes VM programs visible at all (host.md's "default inspector").
- Args: `target` (`body.id`, a process chunk).
- Renders, from pure substrate reads: status/error from the process body; arguments (frame chunks `instance` on argument-typed archetypes); results (instance on result-typed); the boundary chunks `relates`'d on the process and their roots — the run's authority, inspectable; nested frames (processes `instance` on this one), recursively — the whole call tree; commits (`db/commits ∩ process`) — everything this run wrote, anywhere. Subscribes to the frame, so a live run streams (P4) and a dead one is an autopsy, same code path.
- Boundary demand: read over the target frame. Fed by: sidebar context menu ("look in"), pipeline debugging, agent supervision.

**`host/runner`** — the human end of channel C1; the program that turns §1.3's machine-readable contract into a form.
- Args: `target` (`body.id`, a program chunk).
- Reads the program chunk's `relates` children, intersects with `programs/argument` instances → renders one field group per argument type, `required` keys as form constraints; reads `programs/demand` → renders the boundary-grant prompt (roots, with names resolved contextually); reads `body.capabilities` → displays world-authority for consent. On submit: emits a run request (P8, via the dispatcher — §3.1) carrying the declared argument chunks, chosen boundary roots, and a tile intent; then opens `host/inspector` on the resulting frame.
- This program is the proof obligation on every other program's contract: if `runner` can't render it, the contract isn't machine-readable, and the program is composable by humans only.

### 2.4 Composed programs (worked examples)

**Grep-and-view.** `shell` (`rg -n 'active' src/`) run via runner; `read-tile` with `target.ids = [shell-frame]`, live-subscribed. Two primitives, channels C1 + C2 + C3, zero glue code. The "output pane" is a program that didn't know it was one.

**Summarize-scope.** `select` over `[turing, cambridge]` → `complete` with `context.ids = selection.ids`, instruction "summarize the relationship" → caller (agent or a three-stage `pipeline`) places the completion `relates` on the source scope and on `summaries/<model>`. The result is substrate.md's derived-data pattern produced by composition, indistinguishable from one produced by hand — the citizenship claim, checkable.

**Session dashboard (recipe).** A `host/recipe` holding a vertical split: left leaf → `read-tile` templated on a session scope; right leaf → `inspector` templated on the agent program's latest frame. Spawned by `compose` into a tab: one container in the sidebar, two live tiles, collapse kills both. P9 end to end.

**Agent-with-tools.** `agent` granted `[project-root]` read, `[project-root/notes]` write; its filesystem/shell/web calls each narrowed further at step (5). The user's single grant decision bounds everything transitively — the C4 algebra doing the safety work.

---

## 3. The Interface as Composition

The host renders geometry and chrome; every visible behavior is a program (host.md, *What the Host Does Not Do*). This section specifies the interface suite as compositions of §2, and flags where the mechanisms strain.

### 3.1 The boot suite and the dispatcher

At boot the host runs the always-mounted suite with `Context { process_id: None }` (host.md, boot step 10) — full active-project reach, no parent frame, and crucially the ability to pass `RunArgs.placements`, which protocol callers lack. This asymmetry defines the suite's job: **the boot suite is the bridge between host authority and program-initiated intent.**

**`host/dispatcher`** — the P8 pattern's privileged end; boot-run, session-lifetime, no surface.
- Subscribes to `host/run-requests`, a session-scoped blackboard with spec `{ propagate: true, ordered: true, accepts: ['run-request', 'cancel-request'] }`; `run-request` `{ required: ['program'] }` carries argument declarations, requested boundary roots, and a tile intent (`split-of: <tileId> | new-tab | overlay`).
- On each request: validate the requested roots against the *requesting process's* boundary (read from its frame's boundary chunks — a substrate read; the dispatcher must never launder authority its requester lacks), commit the tile leaf, `run` the program, commit the leaf→process `relates`, and — because host/session accepts processes as instances — place the new frame on the session for sidebar visibility.
- Two mechanism strains, held as demands: the dispatcher's runs nest under the dispatcher's frame, making it a single point whose failure cascades to every user-launched process in the session (D4); and whether a program may commit placements *of process chunks* at all (sidebar placement, re-parenting) is unspecified by engine.md's protected-set wording, which covers modification of the process chunk, not placements referencing it (D4 again, second half).

**`host/sidebar`** — the session's view of itself (host.md, *Sidebar*): a specialized `read-tile` over `host/session ∩ engine/process`, rendered on the canvas rather than in a card.
- Reads: session instances; per-process status from body (card when running, flat when done — the state distinction is one body field away). Subscribes to the session scope; every process the dispatcher places appears reactively.
- Writes: session body (`current-tab`), un-show markers (non-destructive, per host.md). Actions — jump-to-tile (read the tile tree for the leaf relating this process), terminate (needs D3's protocol `cancel`; until then a `cancel-request` through the dispatcher, whose authority to cancel its own children the engine's parent-chain already justifies), re-run (a `run-request` cloning a dead frame's arguments — frames persist, so "run it again" is a substrate read plus P8).
- Container processes (compose frames) expand to their `instance` children — the frame tree read directly.

**`host/tab-bar`** — a `read-tile`/`edit-tile` hybrid over `host/tab` instances on the session; switching writes `current-tab` on the session body; creating a tab commits a `host/tab` chunk. Boundary: read+write over the session scope — granted at boot, unremarkable thereafter.

**`host/palette`** — spawned on the leader key as a `host/overlay` anchored to the session (host.md, *Command Palette*); short-lived by design, which is exactly why it owns nothing: every consequence it produces is a `run-request`. Sources, all substrate reads: invocables (`engine/program` instances, federated across mounts — `engine/program ∩ engine/mount[X]` scopes peer programs); FTS (`match_` over the session's reach); recent frames (`engine/process ∩ session`); recipes (`host/recipe` instances). Selecting a program flows into `host/runner`'s form; selecting a chunk opens `read-tile` on it; selecting a recipe emits a `compose` request. When the palette's tile closes, the cascade kills only the palette — everything it launched lives under the dispatcher. P8 is not an optimization here; it is the only reason the palette can exist as a program.

### 3.2 Tiles and self-subdivision

Tile geometry is host-walked, but tile *chunks* are substrate — so layout manipulation is commits, by whichever program's write boundary reaches the tile scope. Splitting, closing, wrapping a subtree into a recipe (`host/recipe` + cloned tile chunks) are palette/runner commands, not host features. One composition affordance follows if launchers adopt a single convention: **include the program's own leaf-tile id in its run write boundary.** A dashboard-like program can then subdivide itself — commit child tiles under its leaf, emit run-requests for the sub-programs, relate their frames to the child tiles. The host must tolerate tiles that reference processes not yet spawned and webviews not yet placed; ordering is D5's second half.

### 3.3 Overlays

An overlay is C3 with an anchor instead of a leaf (host.md, *Overlays*). Self-anchoring (`tile`) is free — the write boundary already covers the tile. Anchoring at `tab`/`session` requires reach that only boot-suite programs and explicit grants hold, which is the correct default: an overlay is attention-taking, and attention-taking above your own tile should cost an explicit grant. Escalation semantics stay open in host.md; this layer adds only the request-shaped path — an `overlay-request` through the dispatcher — so that unprivileged programs have a mediated route rather than none.

### 3.4 What a canvas view would change

Replace the split tree with `host/canvas-item` bodies (`{ x, y, w, h, z }`) — or keep `host/tile` and swap its body vocabulary — and change *nothing else*. The audit that proves the composition model is geometry-independent:

- The execution joint is one placement (leaf `relates` process). Unchanged.
- Every program contract in §2 mentions scopes and frames, never geometry. Unchanged.
- Recipes become spatial snapshots — same clone-and-instantiate, different body fields in the clone.
- Overlay anchors (`session | tab | tile`) survive; `tab` generalizes to "region."
- The programs that *do* change: whatever writes split-node bodies (palette layout commands, `compose`'s tile cloning) — body-vocabulary edits, localized exactly where host.md's *View Modes as Lenses* predicted.
- One genuinely new behavior: tabs time-multiplex frames, a canvas co-locates them — many more simultaneously-mounted webviews (a host resource question, not a composition one), and the sidebar's role shifts from registry toward minimap — a display change in one program.

That the delta is this small is the checkable form of the lens claim.

---

## 4. Demands

What composition needs that the four mechanism specs do not yet hold. Each names the mechanism change and the spec it lands in. Ordered by how much of §1–3 is gated on it.

**D1 — Reference arguments (attachment).** `RunArgs` accepts only `ChunkDeclaration`s; existing chunks cannot be passed, so all hand-off copies (§1.4/P2), forking identity in a substrate built on identity. **Change (engine.md, *Process Creation* step 4; sdk.md `RunArgs`):** add `attach: ChunkId[]`; for each id the engine adds a `{ scope_id: processId, type: 'instance' }` placement to the existing chunk — placement-only, no copy. Rules: each attached id must be within the caller's *read* boundary (you can hand off what you can see; the callee still dereferences through its own boundary, preserving C4); the `accepts` check applies unchanged, so an attached chunk must already be `instance` of an accepted argument type — typed hand-off validated by the same mechanism as declared arguments. Pipeline's `bind` then becomes attachment and `copied_from` retires.

**D2 — Result discipline on `await`.** `await` returns the entire final frame: arguments, boundary chunks, scratch, partials, results, undifferentiated — and substrate.md's `limit`/`offset` is still open, so a large frame floods the protocol. **Change:** (a) land scope `limit`/`offset` (substrate.md, already flagged — composition makes it blocking); (b) extend the `await` op with `opts` — at minimum `results_only: boolean`, filtering the returned scope to chunks `instance` on types marked `programs/result` (engine reads the role marking exactly as `runner` does), plus counts so callers can probe before pulling. Lands in engine.md's protocol table and sdk.md's `awaitRun`.

**D3 — Protocol `cancel` with defined authority.** sdk.md exposes `cancel`; engine.md's op table omits it and `Engine::cancel` takes no `Context`. Sidebar terminate, dispatcher-mediated stop, and orchestrator abort-of-one-branch all need it. **Change (engine.md):** add `cancel` to the protocol; `Engine::cancel(&self, ctx: &Context, id)` — permitted when the target is a descendant of the caller's process (you may stop what you started, transitively) or when the target's process chunk is within the caller's *write* boundary (explicit grant, the boot suite's route). Idempotency semantics as already specified.

**D4 — Launch parenting and process-chunk placement authority.** Two coupled gaps. (a) Program-initiated runs always nest under the caller and children never outlive parents, so no program can start a process that survives it; the dispatcher (§3.1) mitigates but concentrates every user-launched process under one frame whose failure cascades session-wide. (b) Whether a program may commit *placements of* process chunks (sidebar placement, re-parenting) is unspecified: the protected set covers "modifies the process chunk," and placements reference it without modifying it. **Change (engine.md):** expose `RunArgs.placements` over the protocol, gated per-scope by the caller's write boundary — a program whose grant includes the session may parent a run there, making the nesting placement a default rather than an invariant; and state explicitly whether placement writes referencing process chunks are legal for programs (recommended: legal under the same write-boundary gate, with the cascade rule keyed to `instance` placements so re-parenting has defined termination semantics — a process cascades from *every* scope it is `instance`-placed on, or from a designated parent; pick and write it down).

**D5 — Two enforcement-wording fixes composition trips over.** (a) *Read-only mounts:* "any commit referencing a chunk or scope id resolved from a read-only mount returns `READ_ONLY_MOUNT`" (engine.md), read literally, forbids placing an argument chunk `instance` on a peer-shipped argument archetype, placing a process on a peer-defined program — and contradicts the same spec's "cross-db placements work because dbs are dumb." **Change:** pin the rule to *modification of records resident in* a read-only mount (chunk body/spec/name edits, placement rows stored there); placements stored in the active db whose `scope_id` resolves to a peer chunk are legal. Without this, typed composition against first-party programs is impossible whenever the programs project is a peer mount. (b) *Mount ordering for surfaces:* the webview provider mounts at spawn, but the tile leaf that gives it geometry is a separate commit that can only follow `run` (the process id isn't known earlier). **Change (host.md):** the host parks spawned webviews hidden and positions them when a leaf tile's `relates` placement lands; the host subscribes to the active tab's tile scopes rather than walking once. Tiles referencing not-yet-terminal processes with no webview (VM programs) simply render their inspector affordance.

**D6 — Webview self-termination.** "Write a done signal; the launcher cancels" (host.md) is per-program convention, so composed launchers can't rely on it. **Change:** either a first-party `host/done` archetype the dispatcher universally honors (spec-level, no mechanism change), or — cleaner — an `exit` protocol op by which a program requests its own terminal transition (engine.md op table; trivially safe: a program may always end itself). Views remain non-awaitable stages either way; this demand is about dismissal, not about making surfaces pipeline stages.

**D7 — Branch-scoped runs (deferred, recorded).** The substrate forks and merges; execution cannot — `run` has no branch, commits land on the mount's branch, so speculative composition (run an agent on a fork, inspect the frame, merge or discard) is inexpressible even though every ingredient (fork from commit, temporal reads, explicit merge above the primitives) exists. **Change, when taken:** `RunArgs.branch`; per-process branch context defaulting `scope`/`commit`; reactivity dispatcher subscribing per-branch (engine.md already filters by branch — the architecture note "just `select!` over more receivers" covers it). Not v0.1; named here because it is the composition-shaped payoff of the substrate's version model, and the demand should be on the record before merge semantics (substrate.md, open) are designed without it.

---

*Checkable summary.* Composition in OpenLight is placement: a frame on a program (call), chunks on a shared scope (dataflow), a leaf on a frame (surface), roots on a boundary (authority) — four channels, one mechanism. Six primitives (`echo`, `filesystem`, `shell`, `web`, `complete`, `select`) plus three orchestrators and four surface programs generate the interface and the worked compositions; every gap found reduces to seven precise demands, five of them v0.1-sized. The load-bearing claim holds against the mechanism specs — where it strains, the strain is now specified.
