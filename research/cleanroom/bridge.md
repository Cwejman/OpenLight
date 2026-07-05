# Programs — The Bridge Layer

> Clean-room pass C ("the AI bridge"). Fresh context given only the author's ground statement and substrate.md / engine.md / host.md / sdk.md. Deliberately blind to inside.md, programs.md, agent.md, horizon.md, board.md, README, research/. See `rework.md` at repo root for provenance and synthesis.

The program layer of OpenLight. The four mechanism specs ([`substrate.md`](../../pilot/substrate.md), [`engine.md`](../../pilot/engine.md), [`host.md`](../../pilot/host.md), [`sdk.md`](../../pilot/sdk.md)) are taken as given; this document derives the program set that makes their central claim real: **a model-calling program is a citizen like any other.** Human, classical program, and model share one typed, versioned medium — same reads, same commits, same surfaces, same audit trail.

Everything here is either directly implementable against the four specs or explicitly listed under *Demands*.

---

## Why the substrate is a better medium for a model

Six properties, each mechanically checkable, that a filesystem or chat log does not offer:

1. **Probe before pull.** `ScopeResult` carries `total`, `in_scope`, `in_scope_instance`, `in_scope_relates`, and `dimensions` before a single body is read. A model can survey the shape of a knowledge region and decide what to load — context assembly by measurement, not by paste-and-pray.
2. **Address, don't paste.** Every chunk has a stable id. Context is a set of references pinned at a commit (`ScopeResult.head`), not copied text. `scope(..., { at })` reproduces exactly what the model saw, forever.
3. **Enforced shape as feedback.** Spec validation runs on every write. A malformed model output is not silently absorbed into a transcript — it is rejected with `VALIDATION_ERROR`, and the rejection is a signal the loop feeds back to the model. The system, not the reader, catches structural garbage.
4. **Provenance on every write.** Every commit carries `process_id`. `scope([db/commits, processId])` is the complete, unforgeable record of what a run changed. No other AI system can answer "what exactly did the model do" with a query.
5. **Results persist as structure.** A model's output lands as typed chunks placed into scopes — the same chunks a human edits, a grep scans, a tile renders. Nothing evaporates when the chat window closes.
6. **A uniform, discoverable tool space.** Every tool is a program chunk: `scope([engine/program])` lists them, their bodies describe them, their specs type their arguments. Tool integration is not N brittle adapters; it is one protocol (`run`/`await`) plus one contract mechanism (composed `accepts`).

---

## Namespace, archetypes, conventions

First-party programs ship as a project (`programs/`, mounted like `host/` and `engine/`), contributing archetypes under the `agent/` name and per-program output archetypes. All are ordinary chunks seeded by the project's db.

### The session archetypes

The substrate spec's session example is adopted verbatim as the real contract, namespaced:

```
agent/session
  spec: { propagate: true, ordered: true,
          accepts: ["prompt", "answer", "tool-call", "tool-result", "context", "gate"] }

agent/prompt        (relates on agent/session)   body: user message text
agent/answer        (relates on agent/session)   spec: { required: [] }
                                                 body: { text, partial?, refs?: ChunkId[] }
agent/tool-call     (relates on agent/session)   spec: { required: ["program"] }
                                                 body: { text, program, args?, process? }
agent/tool-result   (relates on agent/session)   spec: { required: ["program"] }
                                                 body: { text, program, process?, output? }
agent/context       (relates on agent/session)   spec: { ordered: true }
agent/gate          (relates on agent/session)   spec: { required: ["action", "status"] }
```

Conventions on top of the substrate example:

- `tool-call.body.process` present ⇔ the call was a program run (a process chunk exists); absent ⇔ it was a direct substrate op (`program: "substrate"`). This distinction mirrors engine.md exactly: substrate ops do not create processes; runs do.
- `tool-result.body.output` holds the chunk id of the tool's output chunk (see *Result convention* below), so the session transcript links into the process trace by id, not by copied text.
- A session chunk is `instance` on `agent/session` (the archetype scope is the registry of all sessions) and `instance` on whatever topic scopes the work is about — placement expresses aboutness, chosen by whoever creates the session.
- Each agent run places its session chunk `relates` on its own process chunk ("this run works this session"). Legal: the process scope is always in the run's write boundary, and adding a placement is not a modification of the protected process body.

### Context items

A turn's context is addressable structure, not rendered text:

```
context chunk        instance on <session> (seq); instance on agent/context
context item         instance on <context chunk> (seq); relates on <source chunk>
  body: { source: ChunkId, at: CommitId, projection: "body" | "summary" | "name" }
```

The `relates` placement on the source chunk is the load-bearing move: from any chunk in the substrate you can ask *which model contexts have included me* — the inverse of retrieval, natively queryable. `at` pins the source at the `ScopeResult.head` the assembler read; temporal reads reconstruct the exact material.

### Result convention (all tool programs)

A program's output is **chunks placed `instance` on its own process**, always writable per engine.md's structural invariant. Each program defines an output archetype (`shell/output`, `web/output`, …) with a spec typing the result; the program's dual-placed output chunk is validated on write like anything else. `awaitRun` returns the process's final scope, so the caller receives the typed output with zero extra machinery. `stdout` is protocol transport, never results.

### Typed arguments

Per engine.md, `RunArgs.chunks` are validated against the program's composed spec (`program.spec ∪ engine/process.spec`) because argument chunks are placed `instance` on the process. Every program below therefore declares `spec: { propagate: true, accepts: [...] }` naming its argument archetypes, plus `required` on those archetypes. Argument typing is spec enforcement, not documentation.

### Self-description (`body.interface`)

Every first-party program chunk carries, by convention:

```json
body.interface: {
  "description": "one paragraph, model- and human-facing",
  "args": [ { "type": "shell/command", "doc": "...", "shape": { "cmd": "string", "cwd?": "string" } } ],
  "output": { "type": "shell/output", "shape": { "stdout": "string", "exit": "number" } }
}
```

This is what lets the agent compile a provider tool schema mechanically from `scope([engine/program])` — the tool list is read from the substrate, in-band, per boundary. (Demand 6 makes seeding this mandatory.)

---

## The Loop, Made Mechanical

The exact lifecycle of one agent turn, checkable line-by-line against the protocol.

**Actors.** `session-tile` (webview surface), `agent` (vm program, the loop), `model` (vm program, the only network-touching completion primitive), tool programs (`shell`, `filesystem`, `web`, `summarize`, …).

**0 — Session exists.** `session-tile` (or the palette) has committed a session chunk `S`: `instance` on `agent/session`, `instance` on the topic scopes the user chose.

**1 — The human sends.** `session-tile` commits the user's message as a prompt chunk — `instance` on `S` (seq auto-appended) and `instance` on `agent/prompt` — then runs the agent:

```jsonl
{"id":1,"op":"commit","declaration":{"chunks":[{...prompt, placements:[S(instance), agent/prompt(instance)]}]}}
{"id":2,"op":"run","program":"<agent chunk id>","args":{
  "chunks":[{...session-ref, body:{session:"<S>"}}],
  "readBoundary":["<S>", "<context roots the user picked>", "<programs/ root>"],
  "writeBoundary":["<S>", "<target scopes the user granted>"]}}
```

The engine creates the process chunk `P` (instance on `agent`, on `engine/process`, on the caller's process for trace nesting), the two boundary chunks `relates` on `P`, places the `session-ref` argument `instance` on `P`, spawns the executable — one atomic commit, per engine.md *Process Creation*.

**2 — Orientation.** The agent reads its own contract, all within the always-granted process scope:

```jsonl
{"id":1,"op":"scope","scopes":["<P>"]}
```

Arguments arrive as instance chunks; boundary chunks arrive as `relates` on `P` — the agent walks `relates` from each boundary chunk to enumerate its own read/write roots. It can therefore tell the model, truthfully and from live data, what it can see and touch. It places `S` `relates` on `P` and subscribes to the session:

```jsonl
{"id":2,"op":"subscribe","scopes":["<S>"]}
```

This subscription is the steering channel (step 8).

**3 — Context assembly.** The agent reads `S` (full turn history: prompts, answers, tool calls — the transcript IS substrate) and probes the user's context roots:

```jsonl
{"id":3,"op":"scope","scopes":["<root>"],"opts":{}}          // counts + dimensions first
{"id":4,"op":"scope","scopes":["<root>","<narrower>"],"opts":{"match_":"..."}}   // then pull
```

It selects chunks, then commits the turn's context structure: one context chunk (`instance` on `S` with seq, `instance` on `agent/context`) and one context item per selection (pinned at the `head` each read returned, `relates` on its source). Selection policy — recency, FTS relevance, summaries from `summaries/*` in place of large bodies, budget fitting — lives in the agent's body of code; the *record* of the selection lives in the substrate.

**4 — Render and complete.** The agent deterministically renders the context items and session history to provider messages. Every rendered block is prefixed with its chunk id, so the model addresses the substrate by the same ids in its tool calls. The tool schema is compiled from `scope([engine/program])` ∩ the run's toolset (default: the `programs/toolset` scope) via `body.interface`, plus four built-ins (`scope`, `get`, `search`, `commit`).

Then the model call — **itself a run of a sibling program**:

```jsonl
{"id":5,"op":"run","program":"<model chunk id>","args":{
  "chunks":[{...model/request, body:{kind:"complete", model:"...", messages:[...], tools:[...]}}],
  "readBoundary":[], "writeBoundary":[]}}
{"id":6,"op":"await","processes":["p_m1"]}
```

The request — the *literal, byte-exact context window* — is an argument chunk placed on the model process. The completion comes back as a `model/output` chunk in the awaited scope. The context window is now an addressable, versioned artifact. (See *The `model` program* below for why this indirection is the design's keystone.)

**5 — Tool dispatch.** For each tool call the model emitted, the agent commits a `tool-call` chunk onto `S` (seq, `body.program`, `body.args`), then dispatches by class:

- **Substrate built-ins** → direct protocol ops. `scope`/`get`/`search` execute immediately; `commit` submits the model's declaration against the write boundary. `BOUNDARY_VIOLATION` and `VALIDATION_ERROR` responses are informational per engine.md — the agent renders them into the `tool-result` and the model retries with corrected structure. **Spec enforcement is the model's error signal.** No process chunks; `body.program: "substrate"`.
- **Program tools** → `run` + `await`. The engine nests the child process under `P`, intersects boundaries (they only narrow down the call stack — the model can never escalate), spawns. Parallel tool calls are parallel `run`s awaited together, exactly the protocol's worked example. The returned process id is written into the `tool-call.body.process`.

On resolution the agent commits a `tool-result` chunk (seq on `S`, `body.process`, `body.output` = the output chunk's id, `body.text` = a rendered digest for the model). Loop to step 4 with the new events appended.

**6 — Answer, streaming.** At turn start of a text response the agent commits an answer chunk with `body.partial: true` and empty text, then updates its body on a throttle (≤4 commits/sec) as tokens arrive; the final update sets `partial: false` and `refs` (ids of chunks the turn produced). `session-tile`'s `useScope([S])` re-fetches on each `scope_changed` — streaming without any streaming machinery, using nothing but commits and reactivity. (Cost and coalescing: Demand 4.)

**7 — Exit.** The agent exits 0. Engine cleanup writes terminal status, cascades any still-running children, drops subscriptions. **A run is one turn** (or one delegated task): the next user message is a fresh run over the same session — cheap, because the session and all context live in the substrate, not in process memory. This keeps agents inside the engine's `pending → running → completed` lifecycle with no demand for services.

**8 — Steering, mid-run.** Because the agent subscribed to `S`, any chunk the human commits into the session mid-run — a follow-up prompt from `session-tile`, a gate decision — arrives as `scope_changed`. The agent races its `awaitRun` against its subscription queue (both are just promises in the SDK) and folds new instructions into the next model call. Interruption is `cancel` from the sidebar: the engine kills `P`, cascades to in-flight tool runs, and everything committed so far — partial answer included — persists losslessly in `S`.

**Audit, after the fact.** `scope([db/commits, P])` — every write the turn made. `scope([P])` — arguments, boundaries, nested tool processes (each with *their* arguments and outputs, including every model request verbatim). `scope([S], { at })` — the session as it stood at any moment. Three queries, no bespoke logging anywhere in the loop.

---

## The `model` program

The keystone. One program owns provider access; everything else composes it.

```
model  (vm)
  spec: { propagate: true, accepts: ["model/request"] }
  intrinsic boundary: relates on a boundary chunk granting ONLY its own process scope
  body: { executable, runtime: "vm", capabilities: ["net:api.anthropic.com", "secret:ANTHROPIC_API_KEY"],
          timeout_ms: 120000, interface: {...} }

model/request   spec: { required: ["kind", "model", "messages" | "input"] }
                body: { kind: "complete" | "embed", model, messages?, tools?, input?, params? }
model/output    body: { kind, content | vector, stop_reason?, usage: { input_tokens, output_tokens } }
```

**Contract.** Reads: nothing but its own process (its intrinsic boundary is the narrowest possible; the run-level boundary cannot widen it — intersection semantics per engine.md). Writes: one `model/output` chunk, `instance` on its process, `instance` on the derivation scope `model/<model-name>` (an ordinary chunk scope — every completion in the system is enumerable per model). Argument: exactly one `model/request`.

**Why this shape:**

- **A model call is a pure-function process.** It can see only what was passed. There is no path — enforced by the engine, not by prompt discipline — for a completion call to exfiltrate substrate content that its caller didn't explicitly render into the request.
- **One egress chokepoint.** Only `model` needs network capability and a secret. `agent`, `summarize`, `ingest`, `recall` all have zero credentials and zero egress; compromise of any of them cannot reach a provider. (Capability + secret mechanics: Demand 3.)
- **Total observability for free.** Request and response are argument and output chunks on the process. `scope([model/claude-opus-x])` is the usage ledger — sum `usage` over its instances with a read-tile; token spend per session, per program, per day falls out of scope intersections (`model/<m> ∩ db/commits ∩ <processId>`), no metering subsystem.
- **Provider plurality is placement.** A second provider is a second program instance on `engine/program` with the same request/output archetypes. Callers pick by chunk id; nothing else changes.

The duplication — context items reference sources, the request chunk carries rendered text — is deliberate: the reference layer is for navigation and staleness reasoning; the request chunk is the byte-exact record of what the model saw. Lossless substrate; both are cheap truths.

---

## The Program Set

| Program | Runtime | Surface | Calls model? |
|---|---|---|---|
| `model` | vm | — | is the model |
| `agent` | vm | — | via `model` |
| `summarize` | vm | — | via `model` |
| `embed` | vm | — | via `model` (kind: embed) |
| `ingest` | vm | — | via `model` |
| `recall` | vm | — | via `embed` |
| `shell` | vm | — | no |
| `filesystem` | vm | — | no |
| `web` | vm | — | no |
| `revert` | vm | — | no |
| `session-tile` | webview | tile | no (runs `agent`) |
| `inspector` | webview | tile | no |
| `review` | webview | tile | no |

Existing host programs (`read-tile`, `sidebar`, `tab-bar`, `command-palette`) are used as-is — nothing below duplicates them.

### `agent` (vm)

- **Purpose.** The loop of the previous section: context assembly, model calls, tool dispatch, session writes. One run = one turn/task.
- **Args** (`accepts`): `agent/session-ref` `{ session }` (required); optional `agent/toolset-ref` `{ toolset }` (a chunk whose `relates` placements list allowed program chunks; default `programs/toolset`); optional `agent/task` `{ text }` for headless delegation without a surface-committed prompt.
- **Reads.** The session; the run's read-boundary roots; `engine/program ∩ toolset` for tool compilation; `summaries/*` opportunistically.
- **Writes.** Session chunks only (context, context items, tool-call, tool-result, answer, gate) plus whatever declarations the model's `commit` tool lands inside the write boundary. Session `relates` on own process.
- **Composition.** Fed by `session-tile`, the palette, other agents (sub-agents are just `run(agent, …)` — engine.md's fire-and-forget example, boundaries auto-narrowed, trace auto-nested). Feeds every surface that reads sessions or commits.
- Intrinsic boundary: none (open) — reach is entirely the caller's grant, per engine.md's agent example.

### `summarize` (vm)

- **Purpose.** Scope → summary chunk, the substrate spec's derived-data pattern made executable.
- **Args.** `summarize/target` `{ scope, style? }`.
- **Reads.** The target scope. **Writes.** One summary chunk: `relates` on the target scope, `instance` on `summaries/<model>`, body `{ text, source_commit, model }` — exactly the shape substrate.md prescribes, so staleness checking is a body-field comparison any reader can do.
- **Composition.** Run by `agent` to compress context; by the human from a scope's context menu; feeds `agent` (context items with `projection: "summary"` resolve through `summaries/*`).

### `embed` (vm)

- **Args.** `embed/target` `{ chunks: ChunkId[] }`. **Writes.** Per source: an embedding chunk `relates` on the source, `instance` on `embeddings/<model>`, body `{ vector, source_commit, model }` (substrate.md's exact pattern). Composes `model` with `kind: "embed"`.

### `recall` (vm)

- **Purpose.** Semantic entry point beside FTS. **Args.** `recall/query` `{ text, k? }`. **Reads.** `embeddings/<model>`. Embeds the query (runs `embed`'s path via `model`), scores in-process, **writes** a `recall/output` chunk on its process: ranked `[{ chunk, score }]`. Feeds `agent` as a tool; feeds the palette's search. Linear scan is fine at pilot scale; pagination (Demand 5) governs beyond.

### `ingest` (vm)

- **Purpose.** The paste-killer: turns opaque content into placed, typed structure — substrate.md's Ingestion section given a body. **Args.** `ingest/blob` `{ text?, url? }`, `ingest/target` `{ scope }`. Runs `web` if given a url, runs `model` with a placement-planning request (existing archetypes of the target scope are rendered into the request so the plan conforms), commits the declaration — spec validation is the safety net; a bad plan bounces with `VALIDATION_ERROR` and retries. **Writes.** Chunks under target; `ingest/output` report listing created ids. Feeds: everything — this is how external matter enters the medium.

### `shell`, `filesystem`, `web` (vm)

Classical tools, uniform shape. Intrinsic boundary: own process scope only (engine.md's shell example) — they compute, they don't roam the substrate. 30s default timeouts per engine.md.

- `shell` — args `shell/command` `{ cmd, cwd? }`; output `shell/output` `{ stdout, stderr, exit }` (spec `required: ["exit"]`).
- `filesystem` — args `filesystem/request` `{ op: read|list|write|stat, path | ref }`; accepts either a raw path (within VM mounts: `/active/`, `/peers/<id>/`) or a file-reference chunk id per substrate.md Integration, resolved via its body's resolution parameters; output `filesystem/output`. On reads of git-tracked files it records the git revision in the output body, feeding the substrate's git-integration reconciliation story.
- `web` — args `web/request` `{ url }`; output `web/output` `{ status, content_type, text }`. Capability `net:*` (Demand 3); the only other egress program besides `model`.

### `revert` (vm)

- **Purpose.** Undo-by-addition. **Args.** `revert/target` `{ process? , commit? }`. **Reads.** `db/commits ∩ target` for the touched set (`chunks_modified`, `placements_modified` on each Commit), then temporal reads at each commit's parent to reconstruct prior state. **Writes.** One inverse declaration restoring pre-state — a new commit, per the substrate's lossless rule; nothing is destroyed, the revert is itself attributable history. Write boundary must cover the affected scopes; run it from `review`. Purely classical: the audit trail is rich enough that undoing an AI's work requires no AI.

### `session-tile` (webview)

- **Purpose.** The conversation surface — and the launcher. Renders one session; owns the input row.
- **Surface.** A leaf tile (`host/tile` `relates` its process, per host.md). `useScope([S])` renders the ordered turn sequence: prompts, streaming answers (`partial: true` renders live), tool-calls as one-line entries that expand — expansion runs `scope([tool-call.body.process])` and shows the real process: arguments, output chunk, nested runs. Pending `gate` chunks render approve/deny inline (below). The input row carries three affordances beside text: **context chips** (read roots — scopes picked via palette-style search), **grant chips** (write roots), **toolset**. These compile directly to `RunArgs` boundaries — the boundary UI is the trust UI, shown before anything runs.
- **Contract.** Args: `agent/session-ref` (open existing) or none (creates a fresh session, placing it on user-chosen topic scopes). Reads: the session + whatever the user browses while picking chips. Writes: session chunk creation, prompt chunks, gate-decision updates. Runs: `agent`, one per send, as its child (closing the tile mid-turn cascades the turn dead — coherent: the surface *is* the interactive run's anchor; headless runs go through detach, Demand 1).
- **Composition.** Fed by palette ("new session", "resume session" — sessions enumerate via `scope([agent/session])`); feeds `agent`; its process is sidebar-visible like any other.

### `inspector` (webview)

- **Purpose.** The trace surface for **any** process — a shell run, a webview tile, an agent, a model call. No AI-specific inspector exists because none is needed; host.md already anticipates a default inspector for VM programs.
- **Surface.** Leaf tile over a process id. Three regions, all plain scope reads: **(1) Run** — program, status, args (the process scope's instance chunks; for a `model` process this is the verbatim context window); **(2) Boundaries** — walk `relates` from the process to the boundary chunks, `relates` again to the roots; rendered as two chip rows; **(3) Activity** — children (processes `instance` on this one, recursively — the nested tool trace) interleaved with `db/commits ∩ processId`. Live for running processes via `useScope`.
- **Contract.** Args: `inspector/target` `{ process }`. Reads: the process tree, db/commits. Writes: nothing. Runs: nothing (a "cancel" affordance defers to the sidebar's context menu, which is host/engine mediated).
- **Composition.** Opened from the sidebar context menu, from `session-tile` tool-call expansion, from `review` rows.

### `review` (webview)

- **Purpose.** Judgment over a body of changes: everything a process (or a whole session's processes) wrote, chunk by chunk, before/after.
- **Surface.** Leaf tile. Left: commits from `db/commits ∩ target`, grouped by chunk. Right: per chunk, prior state (temporal read `at` the commit's parent) against current — a structural diff of body and placements. Actions per group or whole set: **keep** (no-op), **revert** (runs `revert`), and — once Demand 2 lands — **merge** (branch-bound runs).
- **Contract.** Args: `review/target` `{ process? , session? , branch? }`. Reads: db/commits, temporal scopes. Writes: nothing directly. Runs: `revert`.
- **Composition.** Fed from the sidebar menu on any completed process ("review changes") — again, not an AI feature; reviewing a migration script's writes is the identical surface.

---

## Several Model Programs, One Substrate

No coordination subsystem exists, and none is added. Coordination is what the existing mechanisms already do when multiple model-calling processes work the same field:

- **Delegation (vertical).** An agent runs `agent` — engine.md's fire-and-forget example verbatim. The child nests under the parent's process (trace), its boundaries intersect down (a sub-agent can never see or touch more than its parent), parent cancel cascades. An orchestrator is not a framework; it is a program whose body calls `run` several times and `await`s the set.
- **Parallel siblings (horizontal).** Two sessions on overlapping scopes: commits serialize through the single active-project writer; each agent's session subscription (and any subscriptions on shared work scopes) delivers the other's commits as `scope_changed`, so the next context assembly reads fresh state — the substrate is the shared memory, reactivity is the invalidation. Attribution never blurs: every commit carries its process_id.
- **Blackboard (asynchronous).** A scope with a spec — e.g. `tasks` with `accepts: ["task"]`, `task` requiring `["status"]` — is a coordination medium with enforced shape. One agent commits task chunks; another scopes for `status: open`, claims by body update (a visible, versioned write, races detectable in history), works, resolves. Humans participate through a read-tile over the same scope with exactly equal standing.
- **Contention.** When two writers should not interleave on one scope, the answer is the substrate's own: branches. This requires Demand 2; until then, the serialized-commits + review/revert path is the pilot's answer.

What is deliberately absent: agent-to-agent messages. Programs do not talk to each other; they read and write the field, and the field notifies. One medium, not a message bus beside it.

---

## The Interface: No AI Chrome

Every human touchpoint below is an existing host surface doing its ordinary job. The test applied throughout: *would this surface exist, unchanged, if `model` were deleted from the system?* Yes, in every case.

**Sidebar.** An agent turn is a process placed on `host/session` — a card while running, flat when done, exactly like a shell run (host.md's life/rest distinction). The standard context menu covers the whole steering vocabulary: jump to its tile, **terminate** (engine `cancel` → cascade), **review changes** (opens `review`), **inspect** (opens `inspector`), spawn again, edit boundaries for the next run. Container processes group a composition's agents expandably — a research recipe with three sub-agents reads like any other composition.

**Command palette.** "Run agent on X" is the palette's generic run-program flow: pick program (`scope([engine/program])`), fill typed args, set boundary chips, go. Sessions surface in palette search because session chunks are FTS-indexed like everything else.

**Tiles and tabs.** A session is a leaf tile; a recipe like *session-tile | review | read-tile-over-target* is a saved `host/recipe` — the "AI workbench" is a tile arrangement the user composes and shares, not a product mode. The model's output needs no dedicated renderer: it landed as typed chunks in real scopes, so the read-tile the user already had open over that scope updates via its own subscription the moment the agent commits. **That moment — model output materializing inside an ordinary surface through the ordinary reactive path — is the bridge, visible.**

**Steering.** Before the run: boundary and context chips in `session-tile` (what it may read, what it may write — shown as first-class UI, because boundaries are first-class chunks). During: commit into the session (the subscription channel), or cancel. After: `review` + `revert`.

**Gates.** Human-in-the-loop approval needs no engine feature. Agent policy (e.g. "gate any `commit` touching scope T", carried in the toolset or task body) makes the agent commit a `gate` chunk `{ action, declaration|program+args, status: "pending" }` onto the session and wait on its existing subscription. `session-tile` renders pending gates as approve/deny; the human's click updates `gate.body.status`; `scope_changed` wakes the agent; it proceeds or abandons. The gate, the decision, and the timing are all permanent session history.

**Trust ladder.** (1) *Ex-ante*: boundaries — enforced by the engine, not requested politely. (2) *In-flight*: inspector + live session tile; every model request inspectable verbatim as process arguments. (3) *Ex-post*: `db/commits ∩ process`, review, revert. (4) *Gated*: approval chunks. Each rung is a query over existing structure.

---

## Demands

What the bridge needs that the four mechanism specs do not yet hold. Ordered by severity.

**D1 — Detached runs.** Program-initiated runs always nest under the caller and die with it (engine.md cascade). But launchers must start work that outlives them: the palette (itself a transient overlay program) launching `session-tile`; `session-tile` launching a long headless job. Today only `Context { process_id: None }` (host-initiated) yields top-level runs. *Mechanism:* a `detach: true` flag on the `run` op and `RunArgs`. Engine behavior: place the new process `instance` on the same `host/session` chunk(s) the calling process is placed on (instead of on the caller); exclude it from the caller's cascade set. Boundary rule unchanged — still intersected with the caller's effective boundary at spawn, so detachment never escalates. Without D1, the interface layer cannot actually start sessions; this is latent in host.md's palette already.

**D2 — Branch-bound runs, and branch ops on the protocol.** The substrate is branch-aware and `ScopeOpts.branch` exists, but: `Declaration` carries no branch; `run` cannot bind a run's commits to a branch; the protocol has no fork/merge; reactivity filters to the mount's single branch. The bridge's strongest trust mode — *the agent works on a branch, the human reviews, the merge is the acceptance* — is therefore unbuildable. *Mechanism:* (a) `RunArgs.branch?: { fork_from?: CommitId | "head", name }` — the engine forks at spawn and routes every read/write of that process (and, by inheritance, its children) to the branch as default context; (b) protocol ops `fork` and `merge` (merge minimal for v0.1: fast-forward or explicit conflict list, honoring substrate.md's "resolution above the primitives"); (c) commits tagged with the branch whose head moved, and subscriptions carrying an optional branch filter, so `review` can watch a work branch and agents on branches still receive their own reactivity. Failure cleanup also collapses to "abandon the branch."

**D3 — Capabilities enforced, secrets injected.** `model` and `web` need network egress and `model` needs an API key. engine.md names `capabilities` as an optional body field but no mechanism enforces it, and the substrate must never hold a secret (lossless: a committed secret is permanent). *Mechanism:* the VM runtime provider (host crate — containment is the provider's concern per engine.md) enforces `body.capabilities`: `net:<host>` allowlists egress per spawned process; `secret:<NAME>` injects an env var at spawn from a host-held keychain (config outside any `.ol/db`). Programs without the capability get no route and no variable. The engine stays runtime-agnostic; only the provider changes.

**D4 — Streaming, sanctioned.** sdk.md excludes intra-op streaming; the loop above streams via throttled partial commits on the answer chunk. Two consequences need blessing: (a) engine.md's deferred **subscription coalescing** is promoted to required — a streaming turn emits commits at ~4/s fanned to every session subscriber; (b) draft states accumulate in history (lossless — replayable streams; arguably a feature) and in `db/commits`. v0.1 accepts (b) with the throttle as the only mitigation; a squash-on-final or an ephemeral progress channel is explicitly open. If D2 lands, partial commits on the turn's branch keep main's history clean for free.

**D5 — Scope pagination and body projection.** substrate.md defers `limit`/`offset`; the bridge is why it cannot stay deferred: context assembly and `recall` must pull bounded slices of large ordered scopes, and probe-then-pull needs a mode that returns names, specs, and counts **without bodies** (an `Includes` variant, e.g. `include: { body: false }`) — the token economy of context assembly depends on cheap surveys. `get`/`ReadOpts` must also honor `at` (temporal single-chunk reads) for `revert` and `review`; currently only `ScopeOpts` specifies it.

**D6 — Self-description seeded everywhere.** The `body.interface` convention (description, args with shapes, output shape) must be present on every first-party program chunk, and its shape itself published as an archetype (`programs/interface`) so conformance is checkable. Not an engine change — a seeding obligation. Without it, tool-schema compilation has nothing to compile and the tool space stops being discoverable in-band, which is the bridge's discovery story.

**D7 — Timeout excludes awaited children (minor).** Engine timeouts are fixed wall-clock (`agent` default 300s), but a turn that delegates a ten-minute sub-agent is idle, not hung. *Mechanism:* pause a process's timeout clock while it has at least one pending `await` on its own children; resume on resolution. Callers can already pass `timeout_ms` per run, so this is quality-of-life, not a blocker.

---

## Summary of the bridge

A prompt is a chunk. A context window is a chunk, assembled from pinned references and preserved verbatim as a model process's argument. A tool call is a `run` with intersected boundaries and a nested process chunk. A model's answer is a commit stream into a typed session; its structured work is declarations validated by the same specs that validate a human's. Steering is a commit; interruption is `cancel`; trust is a boundary walk; audit is `db/commits ∩ process`; undo is an inverse declaration. Nothing in this document introduced a second medium — that is the specification.
