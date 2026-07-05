# Programs — The Working Layer

> Clean-room pass A ("the person's working day"). Fresh context given only the author's ground statement and substrate.md / engine.md / host.md / sdk.md. Deliberately blind to inside.md, programs.md, agent.md, horizon.md, board.md, README, research/. See `rework.md` at repo root for provenance and synthesis.

The substrate stores typed, versioned structure. The engine runs programs against it inside boundaries. The host gives programs rectangles. None of the three says what a person's Tuesday looks like. This spec does: it starts from four concrete working scenes, derives the program set those scenes require, and states precisely what each program reads, writes, accepts, and composes with — then lists what the mechanism layer must still supply.

Everything here sits strictly on [`substrate.md`](../../pilot/substrate.md), [`engine.md`](../../pilot/engine.md), [`host.md`](../../pilot/host.md), and [`sdk.md`](../../pilot/sdk.md). Where a scene needs something those specs do not hold, it appears in *Demands* (D1–D13) rather than being silently assumed.

---

## Conventions Every Program Follows

These are program-layer conventions, not new mechanisms. They use only documented substrate and engine behavior.

**A program's spec is its process contract.** A program chunk is `instance` on `engine/program` with `body: { executable, runtime, capabilities?, timeout_ms? }`. Its own `spec` carries `{ propagate: true, accepts: [...], ... }` — since every process is `instance` on its program, the program's propagating spec governs what may be placed on the process: **arguments in, results out, both typed**. Argument and result archetypes are placed `relates` on the program chunk so `accepts` name-resolution finds them (same pattern as `prompt` on `session` in substrate.md). The engine's composed-contract validation (`program.spec ∪ engine/process.spec`) then enforces this on every run.

**References are passed by body, not by placement.** `RunArgs.chunks` creates fresh chunks; there is no protocol path for placing an existing chunk as an argument (`placements` is engine-owned, per sdk.md). Convention: a reference argument is a chunk whose archetype declares `required: ['target']` and whose `body.target` is the chunk id. The callee reads `body.target` and scopes into it — which also means the run's read boundary must cover the target, keeping data access honest.

**Results are typed chunks on the process.** A program's deliverable is one or more chunks placed `instance` on its own process (always inside its write boundary — structural invariant, engine.md), typed by result archetypes listed in its `accepts`. `awaitRun` returns the process's final scope; the caller filters by result type. A failure that is an *answer* (file not found, HTTP 404) is a result chunk with `body.error`; a failure that is a *crash* is engine-level `status: failed`.

**Done signal.** A webview program dismisses itself by committing a chunk named `done`, `instance` on its own process. Whoever owns the webview's lifetime (the host, for tile-mounted programs — see D11) subscribes and unmounts.

**Namespaces.** Two first-party projects ship programs, both mounted read-only like `host` and `engine`:

- `host/*` — the chrome: `sidebar`, `tab-bar`, `palette`, `board`, `group`. Referenced by id at boot (host.md step 10).
- `kit/*` — the working set: `read`, `edit`, `converse`, `inspect`, `launch`, `history`, `term`, `merge` (surfaces) and `claude`, `filesystem`, `shell`, `web`, `ingest`, `derive`, `reconcile` (VM programs), plus the shared work archetypes: `kit/session`, `kit/source`, `kit/fragment`, `kit/note`.

Instances live in the active project, placed on these mounted archetypes via cross-db placements (engine.md's federation pattern; see D5 for the enforcement wording this depends on).

**Privilege by composition.** Interface programs carry narrow intrinsic boundaries. When a narrow program needs a wide effect — mutating the tile tree, spawning at session scope — it does not hold the boundary itself; it `run`s a trusted program (`board`) whose job that is. Boundaries only narrow down the call stack, so trust concentrates in a few small, auditable programs.

---

## 1. The Scenes

Each scene is written to be falsifiable: every beat names the program, the scope, or the mechanism that makes it happen. The derivation after each scene lists what must exist.

### Scene A — Tuesday morning on a long project

Mara is three weeks into **ledger**, a sync engine whose living plan is substrate structure: a `ledger/plan` scope with ordered section chunks, each section connecting to design notes and file references. She opens the host in `~/w/ledger`.

The sidebar shows yesterday flat — fourteen completed `claude` turns, a `term`, two `reconcile` runs, all resting text on the background. Two tab pills: **plan**, **code**. She clicks **plan**: left tile is `converse` mounted on her long-running session `sync-rework`; right tile is `read` on `ledger/plan`, section *retry* expanded.

She types: *"Fold the retry backoff decision into plan/retry and delete the queue section — it's dead."* Enter. `converse` commits a `prompt` chunk (`instance` on `sync-rework` with the next seq, `instance` on `kit/session/prompt`), then runs `claude` with the session reference. A card appears in the sidebar: **claude — sync-rework** — a rounded, shadowed, running thing.

She clicks the card, picks *inspect* from the context menu. A third tile opens: the turn's process — status `running`, read boundary rooted at `ledger`, write boundary rooted at `sync-rework` and `ledger/plan`, and a nested child already terminal: a `filesystem` run that read `design/backoff.md` through its file-reference chunk. The trace is the process tree itself; nothing was logged, everything was run.

In the right tile, the *retry* section's text grows in visible increments — `claude` commits partial updates to the answer and section chunks; each commit fires `scope_changed`; `read` re-fetches (D7 governs the cadence). The *queue* section vanishes from current state. It is not gone — `history` on `ledger/plan` shows the removal commit, carrying the turn's `process_id`, one click from a time-travel `read` at the commit before.

The queue deletion she trusts. The backoff rewrite she doesn't. For the next piece — *"restructure plan/sync around the new invariants"* — she flips `converse` to a work branch `sync-restructure` (D4) and lets the agent run there while she reads mail. Twenty minutes later she opens `merge`: source `sync-restructure` into `main`, three chunks changed on the branch, none changed on main since the fork — clean. She commits the merge (D4). The plan tile, subscribed on main, updates once.

She closes the inspect tile; the host unmounts its webview; the process completes and its sidebar entry falls flat. The morning's work is nine commits on `main`, each attributable to a process, each reachable forever.

**Requires:** `converse`, `claude`, `read`, `inspect`, `sidebar`, `tab-bar`, `board`, `history`, `merge`, `filesystem`. **Demands:** D1 (a session with hundreds of events must paginate), D4 (branch/merge over the protocol), D6 (nested tool processes on a typed agent process), D7 (streaming cadence), D9 (the model key), D13 (cancel from the sidebar).

### Scene B — Researching and structuring sources

Emil is building the source base for an essay on zoning reform, active project `~/w/zoning`. He has a `zoning/sources` scope and a handful of topical scopes: `parking-minimums`, `floor-area`, `politics`.

Leader key. The palette opens as a session overlay. He types a URL and picks **ingest → sources**. The palette runs `ingest` with `{ url, target: zoning/sources }`; a card appears; forty seconds later it flattens. What happened, verifiable in the inspector: `ingest` ran `web` (fetch), then called the completion model itself — a model-calling program is just a program whose body declares it — and committed one `source` chunk (`instance` on `kit/source` and on `zoning/sources`, body carrying url, title, retrieved-at) plus eleven `fragment` chunks, each placed on the source *and* on the topical scopes the model proposed. Fragments that bridge nothing extra stayed in the source's body — the consolidation principle, applied by a program.

He opens `read` on `parking-minimums`: fragments from three different sources interleaved — the intersection is the payoff. He adds the scope `politics` to the same tile; the set narrows to two fragments; he removes it; the set widens. Scoping is the navigation.

One fragment contradicts another source's table. He opens `edit`, creates a `note` chunk placed `relates` on *both* fragment chunks — the note IS the connection, no edge primitive — body: *"P-2024 §4 contradicts H-2023 table 3; H uses pre-reform data."* From now on, either fragment's scope shows the dispute.

He can't remember where he saw "setback variance." Palette, search mode: whole-field FTS (D2) finds the fragment; *open* mounts a `read` on it via `board`. Before lunch he runs `derive { target: zoning/sources, kind: embedding }` — embedding chunks land `relates` on each fragment and on `embeddings/<model>`, ordinary derived data. His review queue is one query: `sources` minus `reviewed` — negation (D3) rendered as a `read` tile he keeps in the tab.

**Requires:** `ingest`, `web`, `derive`, `read`, `edit`, `palette`, `board`. **Demands:** D2 (unanchored FTS), D3 (negation over the protocol), D5 (instances placed on read-only-mounted archetypes), D8/D9 (network and model key for `web`/`ingest`/`derive`).

### Scene C — Building software against a spec in the substrate

Priya is building `olq`, a query CLI, in `~/w/olq`. The tool's spec is not a document — it is an ordered `olq/spec` scope of section chunks, each carrying acceptance rules in its body, each connected by file-reference chunks (integration chunks, per substrate.md) to the source files that implement it.

Her tab: `read` on `olq/spec § cursor-rules` left, `term` right. In the terminal she types `bun test cursor`. `term` runs `shell`; a process flashes into the sidebar and completes; the result chunk carries `exit: 1` and the stderr. She fixes the code in her editor — the files are files; OpenLight references them, it doesn't swallow them — and commits to git.

Then she runs `reconcile` on `olq/spec` from the palette. It walks the file-reference chunks under the spec, and for each one shells `git log <path>` since the reference's pinned commit pair (substrate commit + git commit — the integration contract). Two references have moved. `reconcile` commits a drift chunk `relates` on each stale reference and on `reconcile/reports`. Her `read` tile — which renders `relates` neighbors of what it shows — now badges both sections. Staleness detection is a reader's concern, and the reader here is a program.

Why is the test failing? `history` on the section chunk shows the rule was tightened *after* the implementing code was written — she opens `read` at the older commit side by side with now (temporal scoping, `at:`), sees exactly which clause changed, fixes the code, reruns `term`: `exit: 0`. She re-anchors the file reference in `edit` and reruns `reconcile` — clean.

Then the agent, narrowly: she opens a session whose write boundary is `[olq/spec]` and nothing else, and asks `claude` to *draft acceptance rules for the LIMIT clause from tests/limit.test.ts*. The agent reads the test file via `filesystem`, commits a proposed section chunk. She audits it the honest way: `history` filtered to `db/commits ∩ <turn process id>` — every commit the turn made, nothing it could hide. She trims the draft in `edit`. If the agent had tried to touch source-file references outside the boundary, the commit would have been rejected with `BOUNDARY_VIOLATION`, and the inspector would show it.

**Requires:** `read`, `edit`, `term`, `shell`, `reconcile`, `history`, `launch` (boundary choice at session creation), `claude`, `filesystem`. **Demands:** none new — this scene runs on documented mechanics plus D1.

### Scene D — Composing the triage bench

Deniz does support triage every morning in `~/w/support`. His inbox scope is filled by `imap-pull` — forty lines of Bun against `@openlight/sdk` that he wrote himself: fetch mail, commit message chunks onto `support/inbox`, exit. It is a full citizen: it shows in the palette, runs in the sidebar, leaves a trace.

He assembles the bench once: a fresh tab; `read` on `support/inbox` left (sorted by seq, `exclude: handled` — D3); `converse` on a triage session in the middle, its agent boundary write-limited to `support/replies`; `term` on the right. He selects the three tiles with the padding gesture (host-caught), palette → **wrap**. `board` creates a `group` process and places the three live processes `instance` on it; the board now draws one outer card; the sidebar shows one expandable entry. Collapsing the container cancels the group, and the engine's terminal cascade stops all three children — one lifecycle.

Palette → **save recipe "triage"**. `board` commits a `host/recipe` chunk with a cloned tile subtree; the recipe references each leaf's *program, argument chunks, and boundary roots* (read off the live processes' arg chunks and boundary chunks), not the processes themselves.

Wednesday, 8:55. Palette → **spawn triage**. `board` runs `group` with the recipe's three run-specs; `group` runs each child (so they nest under it in the trace), commits a `mounted` result chunk per child; `board`, subscribed to the group's process scope, commits the tile placements as the ids arrive. One container card, three fresh processes, same bench.

His teammate keeps a better bench in `~/team/benches`, mounted read-only. The palette lists `host/recipe ∩ engine/mount[benches]`; spawning it clones tile chunks into the active project and resolves the referenced program ids across mounts — programs declared in a mounted project run from their peer FS mount (host.md).

**Requires:** `board` (wrap/save/spawn), `group`, `sidebar` containers, user-authored VM programs, cross-mount recipe listing. **Demands:** D3, D5, D6 (adopting live processes onto a group), D10 (recipe re-arm needs boundary roots readable from dead processes — works today; noted as an invariant recipes depend on).

---

## 2. The Program Set

| Program | Runtime | Surface | One line |
|---|---|---|---|
| `host/sidebar` | webview | left strip | the session rendered as itself |
| `host/tab-bar` | webview | top strip | tabs as pills; switching, naming |
| `host/palette` | webview | session overlay | run anything, find anything |
| `host/board` | vm | none | the only writer of tile/tab/recipe structure |
| `host/group` | vm | none | container process; runs and awaits children |
| `kit/read` | webview | tile | render any scope; the default lens |
| `kit/edit` | webview | tile | create/modify chunks, placements, specs |
| `kit/converse` | webview | tile | a session surface; launches agent turns |
| `kit/inspect` | webview | tile | render any process: status, boundary, trace, commits |
| `kit/launch` | webview | overlay/tile | configure a run: program, typed args, boundaries |
| `kit/history` | webview | tile | commits over any scope/process/branch; time-travel entry |
| `kit/term` | webview | tile | terminal surface; each command a `shell` run |
| `kit/merge` | webview | tile | branch review and merge commit |
| `kit/claude` | vm | none | the agent: one turn per run |
| `kit/filesystem` | vm | none | read/write/list files; resolves file references |
| `kit/shell` | vm | none | one command, one process |
| `kit/web` | vm | none | fetch a URL |
| `kit/ingest` | vm | none | content → typed source/fragment structure (model-calling) |
| `kit/derive` | vm | none | summaries/embeddings onto derivation scopes (model-calling) |
| `kit/reconcile` | vm | none | integration drift detection (git first) |

Argument/result archetypes below are chunks placed `relates` on the program chunk and listed in its `accepts` (see *Conventions*). `body.target` fields are chunk ids.

### kit/read — the lens

- **Purpose.** Look at any scope: members ordered by seq, `relates` neighbors (connections, drift badges, notes), dimensions, counts. Narrow by adding scopes, widen by removing, filter by `match_`, exclude by negation (D3), or pin to a past commit (`at:`).
- **Surface.** A tile. Header: scope names + freshness (HEAD short-id). Body: chunk list/detail. Every rendered chunk offers *open here* (re-scope in place) and *open beside* (via `board`).
- **Contract.** Args: `read/target` `{ required: ['target'] }`, body `{ target, add?: [], exclude?: [], at?, match? }`. Reads: the target scopes; `db/commits ∩ target` for the freshness line; integration chunks resolved by running `filesystem`. Writes: own process scope only — a `read/view` chunk (instance on the process) holding display state, updated in place, so re-runs and recipe spawns restore the exact view.
- **Composition.** Mounted by `board`; runs `filesystem`; feeds `edit`, `history`, `inspect` via *open* actions; is what most recipes are made of.

### kit/edit — the writer

- **Purpose.** Author structure by hand: create chunks, set names/bodies/specs, place onto scopes (`instance` with seq, or `relates`), remove placements, remove chunks.
- **Surface.** A tile: the target scope with editable chunk forms and a placement picker (search-backed, D2).
- **Contract.** Args: `edit/target` (`target`). Reads: the target scope, plus archetypes reachable from it (to show what `accepts` will demand). Writes: the target scope — arbitrary declarations, atomically; a rejected commit surfaces the engine's `VALIDATION_ERROR`/`BOUNDARY_VIOLATION` inline (preflight would improve this — D12).
- **Composition.** Opened from `read`; the pair is the read/write cycle of the whole environment.

### kit/converse — the session surface

- **Purpose.** Hold a conversation with an agent inside a visible, versioned session.
- **Surface.** Transcript (rendered from session chunks via `useScope`), prompt box, per-turn status, cancel, branch selector (D4), boundary badge (the session's agreed agent boundary, always visible).
- **Contract.** Args: `converse/session` (`target` = a `kit/session` instance) and `converse/agent-boundary` `{ required: ['read_roots', 'write_roots'] }` — the boundary template every turn runs under, fixed at launch. Reads: the session scope (paginated, D1). Writes: `prompt` chunks into the session (dual-placed: session + `kit/session/prompt`). Runs: `kit/claude`, one process per turn, `readBoundary`/`writeBoundary` from the template — necessarily within `converse`'s own effective boundary (engine intersection), so the user's launch-time choice is the real ceiling.
- **Composition.** The webview half of the canonical composition; `kit/claude` is the VM half; the session scope is the glue. The transcript updates identically whether a chunk came from her keystroke, the agent, or a tool — one medium.

### kit/claude — the agent

- **Purpose.** One turn: read the session, assemble context, call the completion model, use tools, write the answer and any artifacts, exit 0.
- **Contract.** Args: `claude/session` (`target`). Reads: the session scope; any scope its read boundary grants, chosen by its own scope queries — the query is the portal, and context quality is the agent's own responsibility. Writes: `answer`, `tool-call`, `tool-result`, `context` chunks into the session (the model-facing reconstruction, per engine.md); domain artifacts (plan sections, drafts) into whatever the write boundary grants. Streams by committing partial answer updates at the sanctioned cadence (D7). Runs: any program — `filesystem`, `shell`, `web`, nested `claude` — via `run`/`awaitRun`; the engine nests each as a child process, boundaries intersected downward. Capabilities: `net`, `secret:anthropic` (D8, D9). No intrinsic boundary placement — open by nature, always narrowed per run.
- **Composition.** Fed by `converse` (interactive) or any program (`ingest`-style batch use); feeds every surface, because its output is ordinary commits on ordinary scopes.

### kit/inspect — the process lens

- **Purpose.** See exactly what a run is and did: status, args, effective boundary (both boundary chunks and their roots, via the documented `relates` walk), children (the nested trace), results, and `db/commits ∩ process` — the complete audited footprint.
- **Surface.** A tile; live for running processes (subscription on the process scope), a record for terminal ones. Actions: cancel (D13), *re-run* (clones arg chunks and boundary roots into a fresh `launch`).
- **Contract.** Args: `inspect/target` (`target` = process chunk id). Reads: the process scope tree, boundary chunks, `db/commits ∩ process`. Writes: own process scope only.
- **Composition.** The default rendering for VM programs mounted in a tile (host.md's "default inspector"); opened from the sidebar's context menu and from `converse` turn headers.

### kit/launch — the run form

- **Purpose.** Configure a run deliberately: pick a program, fill its typed arguments, set boundaries, then run and mount.
- **Surface.** Program picker (federated: `scope([engine/program])`, incl. `∩ engine/mount[X]` grouping), an argument form generated from the program's arg archetypes (their `spec.required` and body docs — the substrate is self-describing), boundary root pickers with the program's intrinsic boundary shown as the ceiling.
- **Contract.** Args: optional `launch/prefill` (`target` = a prior process to clone). Reads: `engine/program`, the chosen program's `relates` archetypes, prior process args for prefill. Writes: nothing durable of its own. Runs: the chosen program; then `board` (mount its surface or an `inspect` on it); then commits `done` on itself.
- **Composition.** Spawned from the palette ("run…"), the sidebar ("new from this"), `inspect` ("re-run").

### kit/history — the time surface

- **Purpose.** Answer "what happened here": commits touching a scope, a chunk, a process, or a branch; diff two points; jump into the past.
- **Surface.** A commit list (message, timestamp, `process_id` → the responsible run, one click to `inspect`); select two commits → chunk-level diff (two `scope` reads with `at:`, diffed client-side); *open at commit* mounts a pinned `read`.
- **Contract.** Args: `history/target` `{ target, branch? }`. Reads: `db/commits` intersected per engine.md's projections; `db/branches`; scope states at commits. Writes: own process scope.
- **Composition.** Feeds `read` (pinned views) and `merge` (fork-point discovery); the lossless substrate is only real to a person if this program exists.

### kit/merge — branch review

- **Purpose.** Bring a work branch home: see what changed on each side since the fork point, resolve chunk-level conflicts, write the merge commit. Conflict resolution is explicitly above the substrate's primitives — which makes it exactly a program's job.
- **Contract.** Args: `merge/request` `{ required: ['source', 'into'] }` (branch names). Reads: both branches (`ScopeOpts.branch`), the commit DAG for the fork point. Writes: a merge commit with two parents on the target branch — **blocked on D4**; v0.1 without D4 can only do fast-forward-shaped "re-declare on main" merges, which lose the DAG.
- **Composition.** Fed by `history` and `converse`'s branch selector.

### kit/term + kit/shell — the terminal pair

- **`shell` contract.** Args: `shell/command` `{ required: ['command'] }`, body `{ command, cwd? }` (cwd within the VM's `/active/`, `/peers/*` mounts). Result: `shell/result` `{ exit, stdout, stderr }`. Intrinsic boundary: its own process scope only — a shell run can read its args and write its result, nothing else in the substrate. Its power is filesystem power inside the VM, gated by capabilities (D8), not substrate reach.
- **`term` contract.** Webview surface; args: `term/config` `{ cwd? }`. Each entered command is one `shell` run — a real process, sidebar-visible, trace-recorded, re-runnable. Renders results from awaited process scopes. Writes: own process scope (command history as chunks — which makes a bench's terminal history part of its recipe if desired).
- **Composition.** `term` is the human face; `shell` is also called headlessly by `claude`, `reconcile`, and any batch program.

### kit/filesystem — files as citizens

- **Contract.** Args: `fs/request` `{ required: ['op', 'path'] }`, body `{ op: read|write|list|stat, path, content? }`; or `{ required: ['target'] }` variant where `target` is a file-reference chunk — the program reads the reference's resolution parameters (path, anchor) from its body, per the integration contract. Results: `fs/entry` chunks `{ path, content | entries | error }`. Intrinsic boundary: own process scope.
- **Composition.** Run by `read` (to render referenced file content inline), `claude`, `reconcile`, `term`-adjacent workflows. It is the reason external files never need to be imported to participate.

### kit/web — the fetch

- **Contract.** Args: `web/request` `{ required: ['url'] }`. Result: `web/result` `{ url, status, content_type, text }`. Capabilities: `net` (D8). Intrinsic boundary: own process scope — a fetch can exfiltrate nothing from the substrate because it can read nothing but its own arguments.
- **Composition.** Run by `ingest`, `claude`, and users directly from `launch`.

### kit/ingest — structure from content

- **Contract.** Args: `ingest/request` `{ required: ['target'] }`, body `{ target, url? , source_chunk? , text? }`. Runs `web` when given a url. Calls the completion model itself (capabilities `net`, `secret:anthropic`) to propose decomposition: what deserves to be a fragment (bridges scopes) vs body content (consolidation principle), and which existing scopes each fragment belongs on — discovered via `scope` and FTS within its read boundary. Writes: one `kit/source` instance + `kit/fragment` instances placed on the source and on target/topical scopes, each fragment body recording provenance (`source_commit`, model).
- **Composition.** Palette-run interactively; composable into pipelines (a watch program that runs `ingest` per new inbox item is a user-authored twenty-liner).

### kit/derive — derived data as data

- **Contract.** Args: `derive/request` `{ required: ['target', 'kind'] }`, `kind: summary | embedding`. Writes: derived chunks `relates` on each source chunk and on the derivation scope (`summaries/<model>`, `embeddings/<model>`), bodies carrying `source_commit` and `model` — exactly substrate.md's derived-data shape. Skips chunks whose current derivation is not stale (reader-side staleness policy, implemented here).
- **Composition.** Run manually or by any orchestrating program; its outputs are ordinary chunks every other program can scope.

### kit/reconcile — integration drift

- **Contract.** Args: `reconcile/target` (`target` = a scope holding integration chunks). Reads: integration chunks under the target (typed by their integration archetype). For git-typed references: runs `shell`/`filesystem` to compare the pinned git commit against the working tree's history for that path. Writes: `reconcile/drift` chunks `relates` on each stale reference and on `reconcile/reports`, body `{ reference, pinned_commit, current_commit, paths }`.
- **Composition.** The pattern-setter for integration caretakers generally — the substrate stores the fact; this program is the intelligence that evaluates it.

### host/sidebar — the session's self-view

- **Purpose.** Render `scope([session])`: every process placed `instance` on the current session, running as cards, terminal flat, containers expandable; plus session-held items. Context menu per item: jump to tile (via `board`), inspect, terminate (D13), new-from-this (spawns `launch`, D11), hide.
- **Contract.** Boot-spawned by the host (boundaries: D10). Reads: the session scope minus the `hidden` scope (D3), `engine/process` typing, program names. Writes: `relates` placements onto a session-local `hidden` chunk (non-destructive clearing — the lossless answer), session body (name). Runs: `board`, `launch`.
- **Surface.** Not a tile — a host-positioned strip directly on the background.

### host/tab-bar — working sets

- **Contract.** Boot-spawned strip. Reads: `host/tab` instances on the session, `session.body.current-tab`. Writes: new/renamed/removed tab chunks; `current-tab`. Runs: `board` for anything touching tile trees (moving a tile between tabs).

### host/palette — the command surface

- **Purpose.** The keyboard-first front door. Modes fall out of what it reads: **run** (programs, federated across mounts), **recent** (session processes, re-run in one keystroke), **find** (whole-field FTS → jump, D2), **do** (board intents: split, wrap, save recipe, spawn recipe, new tab, branch — D4).
- **Contract.** Spawned host-initiated on the leader key (`overlay` anchored on the session; host-spawned, so no escalation issue), full read reach, write via composition: it runs `board`, `launch`, and target programs rather than committing structure itself. Commits `done` to dismiss.

### host/board — the single writer of arrangement

- **Purpose.** All command-shaped mutation of `host/tab`, `host/tile`, `host/recipe` goes through this one small VM program, so the tile tree has exactly two writers: `board` (commands, from any program) and the host itself (direct manipulation — drag-resize, drag-reorder — committed with `Context::None`).
- **Contract.** Args: `board/intent` `{ required: ['op'] }`, ops: `mount { process, tab?, at?, direction?, ratio? }`, `split`, `close { tile }`, `move`, `wrap { processes: [] }`, `save-recipe { root, name }`, `spawn-recipe { recipe, tab? }`. Reads: the session's tab/tile trees, recipes (incl. from read-only mounts), and — for `save-recipe`/`spawn-recipe` — the referenced processes' program ids, arg chunks, and boundary roots. Writes: tile/tab/recipe chunks; tile-to-process `relates` placements. Runs: `group` for wrap and spawn. Intrinsic boundary: read + write rooted at the session — the concentrated trust the *privilege by composition* rule pays for.
- **Recipe semantics (settling host.md's open item):** identity-based for v0.1 — a recipe leaf records `{ program_id, arg_declarations, read_roots, write_roots, view_state }` cloned from the live process at save time. Spawning re-declares args fresh and builds fresh boundaries from the recorded roots. Slot-based recipes (placeholders the user fills at spawn) are a later layer on the same shape.

### host/group — the container

- **Purpose.** Give a set of processes one lifecycle and one sidebar identity.
- **Contract.** Args: `group/child` run-spec chunks `{ program, args, read_roots, write_roots }` (spawn path) — group runs each child itself so the engine nests them under it, commits a `group/mounted` result per child (`{ process, leaf }`) that `board` consumes to place tiles, then `awaitRun`s all children and exits when they end. Wrap path: `board` instead places already-running processes `instance` on the group (adoption; needs D6), which enrolls them in the engine's terminal cascade — cancel the group, the bench stops.

---

## 3. The Interface as a Whole

**Boot.** After the host's fixed sequence (host.md), step 10 spawns `sidebar` and `tab-bar` host-initiated, positioned as chrome strips outside the tile area, with the boundaries in D10. The active session chunk is resolved or created; its tabs render; leaf tiles' related processes are *not* auto-resurrected (processes are runs, not documents) — a tile whose process is terminal renders flat with a one-key *respawn* that re-runs from the recorded args, same mechanics as recipe spawn.

**The loop of a working hour.** Leader key → palette → run or find → `board` mounts the surface → a card in the sidebar → work happens as commits → the process ends → the card falls flat → the trace, the commits, and the artifacts remain scopeable forever. There is no distinction between "opening a document," "running a tool," and "asking the agent" — each is `run`, each is a process, each is placed on the session, each is a card. The sidebar is not a UI metaphor; it is literally `scope([session])` rendered, which is why it never lies.

**Tabs** are working sets (`host/tab`), cheap to create from the palette, named or not. **Tiles** are where processes face the person; the binary split tree is mutated only by `board` and by the host's direct-manipulation commits, so every arrangement change is a commit — arrangements have history too, and "how was my screen set up last Tuesday" is a temporal scope read. **Recipes** make arrangements durable and shareable across mounts; **compositions** (`group`) make them one thing with one lifecycle. **Overlays** carry the palette and `launch`; program-initiated overlays above their own tile resolve through `board` (D11) rather than through boundary escalation.

**What the palette knows, everything knows.** Because programs, processes, recipes, and commits are all substrate structure, every list the interface shows is a scope query any other program (including the agent) can make. The agent can inspect the user's bench; a user program can enumerate what the agent ran. Symmetry is not a feature; it is the absence of privileged channels.

**A canvas view.** v0.1's tab lens walks the split tree. A zoomable canvas changes the *geometry data*, not the model: leaf tiles place flat on the tab and carry `body.rect { x, y, w, h, z }`; split nodes disappear; `board` gains `place { process, rect }`; recipes clone rects verbatim; the sidebar, palette, overlays, and every program contract above are untouched. What it cannot be is purely a program: webviews are native rectangles the host positions, so the host must grow a second geometry interpreter (rect walk + viewport transform + zoom factor per webview) alongside the tree walk — a host demand, not a program one. Semantic zoom (a tile rendering summary vs detail by its allotted pixels) *is* a program concern: the tile's rect lives in a chunk the program can read, so `read` can choose its level of detail from its own geometry. The composition types were designed as chunks precisely so this lens is additive.

---

## 4. Demands on the Mechanism Layer

Each names the mechanism, the spec it lands in, and the scene that forces it.

**D1 — Land `limit`/`offset` for ordered scopes.** substrate.md defers it; sdk.md already types it in `ScopeOpts`. Scene A's session #14 and Scene D's inbox make unbounded scope reads a day-one failure, not a scale problem. Required: tail-first default for ordered scopes (latest events first), counts already present in `ScopeResult` for probing. Lands in substrate + db.

**D2 — Whole-field FTS over the protocol.** substrate.md calls FTS "the entry point when the scope vocabulary isn't known" — but the protocol only exposes `match_` *within* named scopes. The palette's find mode needs search without an anchor. Mechanism: allow `scope([], { match_ })` as a pure-FTS query, results filtered by the caller's read boundary, federated across mounts like any read. Lands in engine protocol + substrate query layer.

**D3 — Negation over the protocol.** Substrate has set difference; `ScopeOpts` has no way to say it. Sidebar hiding (session minus `hidden`), Emil's review queue (sources minus reviewed), Deniz's inbox (minus handled) all need `exclude: ChunkId[]` on `ScopeOpts`, boundary-checked like positive scopes. Lands in sdk types + engine + db.

**D4 — Branch operations over the protocol.** The substrate is fully branch-aware (fork, merge commits with two parents, per-branch HEADs) and `ScopeOpts.branch` exposes branched *reads* — but there is no protocol path to create a branch, commit to a named branch, or write a two-parent merge commit. Scene A's branch-and-review and the entire `merge` program are blocked. Mechanism: a `branch` op (`{ create, name, from }`), `Declaration.branch?`, and a merge form of `commit` carrying two parents. Boundary model unchanged — branches are field state, not reach. Lands in engine protocol + sdk.

**D5 — Read-only mount enforcement must mean "modifies," not "references."** engine.md states commits are rejected if they *reference* a chunk resolved from a read-only mount — but its own federation section depends on the active db storing placements whose `scope_id` is a mounted chunk (`engine/program`'s invocables). Every scene places instances on mounted archetypes (`kit/session`, `kit/source`, `host/tile`). Required wording: a commit is rejected only if it modifies a chunk or placement *owned by* a read-only mount; placements stored in the active db may reference mounted chunks as scope or type. Lands in engine.md (clarification + test).

**D6 — Trace nesting vs the program's `accepts`.** The engine places child processes `instance` on the parent process, and adopted processes onto `group` — but the parent program's propagating spec (`accepts: [arg/result types]`) would reject those placements, since a child process is no listed type. Mechanism: the engine exempts placements of `engine/process` instances from the program-spec side of the composed contract (they are trace, not content), or implicitly unions `engine/process` into every program's effective `accepts`. Without this, either typed argument contracts or nested traces must be abandoned — both are load-bearing. Lands in engine + substrate validation seam.

**D7 — A settled streaming convention.** sdk.md defers intra-op streaming; the session surface cannot. The workable v0.1 path uses only existing mechanics: the agent commits partial updates to the answer chunk at a coarse cadence (per paragraph or ~1s), each firing `scope_changed`, `converse` re-fetching. Cost: partial states enter the lossless history permanently. Decision required — sanction the coarse-commit convention (and accept the history), or add a non-persisted `progress` event a process may emit over its transport, relayed to subscribers on its process scope. One of the two must be chosen in engine.md, not improvised per program.

**D8 — Capability vocabulary and enforcement.** engine.md treats `capabilities` as documented-but-optional body data; host.md says VM access is "gated by declared capabilities" without a mechanism. `web`, `claude`, `ingest`, `derive` need `net`; nothing else should have it. Mechanism: a small vocabulary (`net`, `fs:active`, `fs:peers`, `exec`) enforced by the runtime provider at spawn (network namespace / mount table per process), with the effective set recorded on the process chunk so `inspect` can show it. Lands in host (providers) + engine.md (process body shape).

**D9 — Secrets provisioning.** Model-calling programs need API keys; the substrate is lossless, so a key committed once is a key kept forever — secrets must never be chunks. Mechanism: the runtime provider injects environment variables at spawn from a host-side keychain, keyed by declared capability (`secret:anthropic`); the capability appears on the process chunk, the value never touches the substrate. Lands in host providers + engine.md.

**D10 — Boot-suite contracts.** host.md defers the always-mounted suite's contracts to "a future programs spec pass" — this pass. Required of the host: spawn `sidebar` with read roots `[session, engine/process, engine/program]` and write root `[session]`; `tab-bar` with read/write `[session]`; position both as chrome strips outside tile geometry; catch the leader key and spawn `palette` host-initiated. Also an invariant recipes depend on and the engine must preserve: a terminal process's argument chunks and boundary chunks (and their root `relates`) remain readable — cleanup writes status, it must not sever the boundary topology. Lands in host.md (+ engine.md invariant note).

**D11 — Overlay and lifecycle authority through `board`.** Two open host.md items resolve with one rule: a program that wants an overlay above its own tile, or wants a tile-mounted webview dismissed, asks `board` (overlay intents; the host subscribes for `done` chunks on tile-mounted processes and unmounts). Programs never need write reach above their tile; the host needs a documented subscription on tile processes' scopes for `done`. Lands in host.md.

**D12 — Commit preflight (minor).** `edit` currently authors against try-and-catch `VALIDATION_ERROR`. A `dry_run: true` flag on the `commit` op — full validation, no write, structured errors — turns the editor from "submit and read the rejection" into a live form. Ergonomics, not correctness; schedule accordingly. Lands in engine protocol + substrate.

**D13 — `cancel` over the wire, with an authority rule.** sdk.md exposes `cancel(processId)`; engine.md's protocol op table omits it, and the Rust `cancel` takes no `Context`. The sidebar (terminate) and `converse` (stop this turn) cancel processes that are not their children. Mechanism: add `cancel` to the protocol; authorize when the target process chunk is reachable from the caller's *write* boundary; keep idempotent semantics as specified. Lands in engine protocol + sdk.

---

*The test of this layer is Scene A run end-to-end: if Mara can watch an agent restructure a plan she can audit commit-by-commit, stop it mid-turn, take the risky half on a branch, and merge it back — with every actor, human and model and tool, leaving the same kind of trace in the same typed medium — the bridge the ground statement names exists. Each demand above is a place where, today, she can't.*
