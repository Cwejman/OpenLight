# Rework — the program layer, from clean room

> **Status:** the author ruled on this synthesis and the rebuild landed — see `board.md` (*Rebirth epoch*). §5's demand list has since been **folded into the mechanism specs** (see `spec/programs.md` §6 for the landing map); this file remains the record of the synthesis and evidence grades. §6's decisions are settled (detach + child modes, streaming sanctioned, both marking conventions, identity recipes); §7–8 are superseded where they differ: `inside.md` was ditched outright rather than held for a later values pass, `horizon.md` was rebuilt as the vision file, and `spec/programs.md` + `spec/agent.md` were rewritten. §5's demand list (R1–R12) remains the live work queue. This file stays as the record of the synthesis and the evidence grades.

**Provenance.** Three independent passes, each a fresh context (untainted by this repo's value documents) given only (a) the author's ground statement of what OpenLight is and (b) the four mechanism specs — `spec/substrate.md`, `spec/engine.md`, `spec/host.md`, `spec/sdk.md`. Each pass was forbidden from reading `inside.md`, `spec/programs.md`, `spec/agent.md`, `horizon.md`, `board.md`, `README.md`, `spec/research/`. Angles: **A** — the person's working day ([`spec/research/cleanroom/scenes.md`](spec/research/cleanroom/scenes.md)); **B** — composition ([`spec/research/cleanroom/composition.md`](spec/research/cleanroom/composition.md)); **C** — the AI bridge ([`spec/research/cleanroom/bridge.md`](spec/research/cleanroom/bridge.md)).

The evidence grade throughout is convergence: what three blind contexts derived independently is treated as load-bearing; what one derived is treated as a proposal. Claims about spec text I verified directly against files I read are marked; claims resting on two agents' independent readings of the same spec are marked as such.

**The ground statement** (the center this derives from — not `inside.md`):

> OpenLight is three things. A **substrate**: typed, version-controlled structure — units of meaning with identity, placed into scopes, contracts enforced on write, every change a commit on a branch. **Programs**: the only unit of execution — a program reads scopes and writes commits inside an enforced boundary; whether it renders a surface, touches a disk, or calls a model is what its body declares, not a different kind; programs compose into new programs. A **host**: makes substrate plus programs an operating environment — window, tiles and tabs (or a canvas), sidebar, palette; the interface is itself programs. Why it matters: AI today is monolithic — a chat that swallows context and evaporates results, bolted beside real tools. Here a model-calling program is a citizen like any other: it reads the same typed structure a grep does, writes the same commits a human does, composes into the same surfaces. Human, classical program, and model in one typed, versioned medium.

---

## 1. Verdict on the foundation

**The four mechanism specs held up under blind adversarial use.** Three fresh readers each built a complete program layer on them and found no architectural fault — every gap that came back is a protocol addition, a wording fix, or a convention that needs sanctioning. The db/engine/host/sdk drawings are good. The rework is not a redraw of the foundation; it is the program layer plus the demand list in §5.

Two of the three passes also converged on the same product thesis without being asked for one: **the strongest thing this environment offers over today's AI is not the agent — it is the trust mechanics around any actor.** Boundaries ex-ante, live inspection in-flight, `db/commits ∩ process` ex-post, gates for approval, branch → review → merge as acceptance. All of it falls out of existing structure; only the branch workflow is blocked (R1).

## 2. Consensus mechanisms (3/3 unless noted)

What all three passes derived independently. This is the strongest material in the rework.

1. **The call frame.** A process scope is a typed call frame: arguments in at spawn (validated by the program's propagating `accepts`), results out as typed chunks placed `instance` on the process, the whole frame returned by `await` — and persisted forever. Every call in the system is a durable, queryable, viewable object. Argument and result archetypes are chunks placed `relates` on the program chunk. *This one pattern is most of the program layer.*
2. **The universal lens.** One scope-viewer program (read-tile) subsumes panes, transcripts, search results, dashboards, history views — because frames are scopes and everything is a scope. Narrow by adding scopes, widen by removing; `at:` pins the past.
3. **The universal inspector.** One process-viewer renders any run — shell command, agent turn, model call — status, args, boundary roots, nested children, `db/commits ∩ process`. C's test: *no AI chrome* — every steering surface would exist unchanged if the model were deleted.
4. **Streaming is commits.** Partial updates committed at a throttled cadence; subscription re-fetch renders them. No streaming machinery — but the convention must be sanctioned in engine.md, not improvised (R6).
5. **Form from the field, at the form level.** A launcher/runner renders a run form mechanically from the program's argument archetypes (`required` keys, body schemas); the agent compiles provider tool schemas from the same structure. The self-describing claim is real at this level today; nobody needed more mechanism to reach it.
6. **Multi-agent needs no new mechanism** (B, C explicit; A compatible). Delegation is nested runs with narrowing boundaries; siblings coordinate through subscriptions on shared scopes; a blackboard is a scope with an enforced spec; attribution is `process_id` on every commit. Deliberately absent: agent-to-agent messages. *Programs don't talk to each other; they read and write the field, and the field notifies.*
7. **Trust concentrates by composition** (A "board", B "dispatcher"). Narrow programs get wide effects by running a small trusted program that holds the wide boundary — since boundaries only narrow down the call stack, trust pools in a few auditable places.

## 3. The consensus program set

Names differ across passes; roles converge. (A/B/C variants in parentheses.)

| Role | Runtime | Consensus |
|---|---|---|
| **model / complete** | vm | one program owns provider access; everything composes it (B, C — see §4.1) |
| **agent** | vm | one turn per run; context from scopes; tools via `run`/`await`; session chunks as the record |
| **read-tile** (read) | webview | the universal lens |
| **edit** | webview | hand-authoring: chunks, placements, specs; `VALIDATION_ERROR` as form validation |
| **session surface** (converse / session-tile) | webview | transcript from session scope; prompt box; boundary chips visible before anything runs |
| **inspector** (inspect) | webview | the universal process view |
| **runner** (launch) | webview | run form generated from argument archetypes; boundary grant prompt |
| **history / review / merge / revert** | webview + vm | commits over anything; structural diff via temporal reads; undo-by-addition; branch review (blocked on R1) |
| **term + shell** | webview + vm | each command one process; sidebar-visible, re-runnable |
| **filesystem, web** | vm | frame-only substrate boundary; authority is the capability, not reach |
| **ingest** | vm | content → typed source/fragment structure; the paste-killer (A, C) |
| **derive / summarize / embed / recall / reconcile** | vm | derived data as ordinary chunks on derivation scopes; integration drift as `relates` badges |
| **arranger** (board / dispatcher / compose+group) | vm | the concentrated writer of tabs/tiles/recipes; container lifecycle; recipe save/spawn |
| **sidebar, tab-bar, palette** | webview | chrome as programs; the sidebar is literally `scope([session])` rendered |
| **echo, select** | vm | loop proof; a query reified as a frame (B) |

## 4. Upgrades over the pre-rework drafts

Where the clean room contradicts or exceeds `spec/agent.md` and `spec/programs.md`.

### 4.1 The model is a program, not an API call inside the agent

`agent.md` has claude calling the Anthropic API directly ("no framework between the engine protocol and the API"). B and C independently derived the opposite factoring: a **`model` program** — one model call per run, frame-only boundary, `net` + secret capabilities — with the agent as an ordinary composition of it. The arguments are strong and cumulative:

- **Purity enforced, not promised.** A model call can only see what was rendered into its request chunk; exfiltration of substrate content beyond the grant is architecturally impossible.
- **One egress chokepoint.** Only `model` (and `web`) holds network capability; only `model` holds the API secret. Agent, ingest, summarize carry no credentials.
- **The context window becomes an addressable artifact.** The verbatim request is the model process's argument chunk — every prompt ever sent is inspectable, reproducible, diffable.
- **Usage ledger for free.** Completions placed on `model/<name>` scopes; token spend is a scope query, not a metering subsystem.
- **Provider plurality is placement.** A second provider is a second program chunk.

**Adopt.** This also makes the ground statement literally true: the model-calling program is distinguishable from `echo` only by its body.

### 4.2 Context as addressable structure, not rendered markdown

`agent.md`'s knowledge layer is a hand-authored markdown serialization. C derived richer mechanics: context items as chunks that `relates` on their sources, pinned `at` the commit each read resolved against — so *"which model contexts have included this chunk"* is a native query (retrieval's inverse), and any past context is reproducible exactly. The rendered text still exists — as the model process's request chunk (§4.1), the byte-exact record. Both truths are cheap in a lossless substrate. **Adopt;** `agent.md`'s serialization format survives only as the rendering step's starting point.

### 4.3 The band and culture, tested

The old drafts carry heavy language here (archetypes as roles the weights take on, culture re-derived each cycle, the band). The clean-room evidence:

- **The band's mechanical content survived fully** — derived twice without the word: delegation, parallel siblings through reactivity, blackboard scopes, equal human standing on the same surfaces (§2.6). Nothing about it needed mythology; it fell out of the mechanisms.
- **Culture was not demanded by anything.** No pass reinvented it. Its minimal form — a chunk placed first in a run's context ordering, a convention — costs nothing and survives. The heavier claims (identity re-derived each cycle, archetypes as cell differentiation) attracted no concrete demand from any scene, composition, or bridge requirement.

This is evidence for the author's slop diagnosis of `inside.md`, not yet a verdict — the final call belongs to step 3 of the path (values re-derived from what the programs prove). But the burden has shifted: those passages must earn their way back in by a concrete demand, or go.

### 4.4 Care concretized, projection answered modestly

- **Care** stops being a deferred mystery: `derive`, `summarize`, `embed`, `reconcile`, `revert` are ordinary v0.1-sized programs using only documented substrate patterns (derivation scopes, `source_commit` staleness, temporal reads, undo-by-addition).
- **Projection** ("form from the field") gets its honest v0.1 answer: generated *forms* (runner), generated *tool schemas* (agent), renderer hints per archetype (read-tile). No pass reached for "the field projects its own interface" — the far end stays horizon, and the near end is already mechanism-complete.
- **Services** may not need to exist as a primitive: A and B handle long-lived needs with session-lifetime boot programs plus an arranger; C keeps the agent strictly run-per-turn. The real gap underneath is launch lifetime (R4), not a service concept.
- **Lenses** confirmed additive: B's canvas audit found the delta is body-vocabulary plus one new host geometry interpreter — no program contract changes.

## 5. The demand list

Merged and deduplicated from the three passes (each pass's own numbering appears in its file). These are the rethink items to settle in the mechanism specs **before implementation**. Found-by column is the evidence grade.

| # | Demand | Lands in | Found by |
|---|---|---|---|
| **R1** | **Branch ops over the protocol** — create/fork, commit-to-branch, two-parent merge; optionally branch-bound runs (`RunArgs.branch`). Unlocks the trust workflow: agent works a branch, human reviews, merge is acceptance. | engine protocol, sdk, db | A, B, C |
| **R2** | **Scope `limit`/`offset` + body-less probe reads** (`include: {body:false}`); tail-first default for ordered scopes; `get` honoring `at`. | substrate, db, sdk | A, B, C |
| **R3** | **`cancel` over the protocol with an authority rule** (descendant-of-caller, or target within caller's write boundary; idempotent). Two passes report sdk.md exposes `cancel` while engine.md's op table omits it and `Engine::cancel` takes no `Context` — verify and fix. | engine, sdk | A, B, C |
| **R4** | **Launch lifetime** — a transient program (palette) cannot start anything that outlives it; runs nest and cascade-die. Options: `detach: true` on `run` (C), or a session-lifetime dispatcher/board program (A, B). Decision §6.1. | engine | A, B, C |
| **R5** | **Read-only mount rule: "modifies," not "references."** The literal write rule (`READ_ONLY_MOUNT` on any commit referencing a mounted chunk) contradicts the federation pattern the specs themselves rely on — placing instances on mounted archetypes (`engine/program`, session types). *Verified directly: spec/pilot.md:81 vs spec/pilot.md:83 and spec/pilot.md:56 state both sides.* Fix: reject only modification of records resident in a read-only mount. | engine, spec/pilot.md | A, B |
| **R6** | **Streaming sanctioned** — bless throttled partial commits (+ required subscription coalescing), or add an ephemeral progress event. One decision, in engine.md, not per-program improvisation. If R1 lands, partials on the turn's branch keep main clean. | engine, sdk | A, B, C |
| **R7** | **Trace nesting vs typed `accepts`** — child processes are placed `instance` on the parent process, but the parent program's propagating `accepts` (listing only arg/result types) would reject that placement. Exempt `engine/process` instances from the program-spec side of the composed contract (or union it in implicitly). | engine | A (B's §1.1 implies both premises) |
| **R8** | **Capabilities enforced + secrets injected** — small vocabulary (`net[:host]`, `fs:*`, `exec`, `secret:<NAME>`) enforced by the runtime provider at spawn; secrets as env vars from a host keychain, **never chunks** (lossless substrate ⇒ a committed key is permanent). | host providers, engine.md | A, C |
| **R9** | **Result discipline on `await`** — `results_only` filtering via result-role archetypes, plus counts. | engine, sdk | B |
| **R10** | **Whole-field FTS over the protocol** — `scope([], {match_})`, boundary-filtered; the palette's find mode. Plus **negation** (`exclude:`) in `ScopeOpts` — substrate has set difference, protocol can't say it. | engine, substrate, sdk | A |
| **R11** | **Webview self-termination** — a first-party `done` archetype the host/arranger honors, or an `exit` op. | host, engine | A, B |
| **R12** | Minor: `dry_run` commit preflight (A); reference arguments / `attach: ChunkId[]` on `RunArgs` so hand-off doesn't fork identity (B — arguably belongs higher); timeout clock pauses during child `await` (C); boot-suite boundary contracts written into host.md (A). | various | single-pass |

R5 and R7 are **spec bugs** (the text contradicts itself or its own load-bearing pattern); the rest are additions. Note the pattern in R1/R2/R10: the substrate layer already has branches, negation, FTS, temporal reads — the protocol just can't express them. The substrate outran its own protocol; the fix is exposure, not construction.

## 6. Decisions to make

Where the passes diverge — genuine choices, with my recommendation.

1. **Launch lifetime (R4): `detach` flag vs dispatcher program.** The dispatcher (B) needs no mechanism change but concentrates every user-launched process under one frame — a single point whose failure cascades session-wide, and a laundering risk it must police itself. `detach` (C) is a small, clean engine change: re-parent to the session, boundaries still intersected at spawn so no escalation. **Lean `detach`,** keep the arranger for tile/recipe writes only.
2. **Streaming (R6).** **Lean:** sanction throttled partial commits now (with coalescing required), move partials onto turn branches when R1 lands.
3. **Contract marking convention.** B's role archetypes (`programs/argument` / `programs/result` / `programs/demand` — placement-native, machine-checkable) and C's `body.interface` (carries the property schemas the tool-schema compiler needs) are complementary, and A's launch-form needs both. **Adopt both as one convention:** roles by placement, shapes in body.
4. **Recipe referencing** — A settles host.md's open item: identity-based for v0.1 (`program_id + arg declarations + boundary roots + view state` cloned at save); slot-based later on the same shape.

## 7. What happens to the existing files

- **`spec/agent.md`** — superseded in its core mechanics (§4.1, §4.2). Rewrite from `cleanroom/bridge.md`, keeping the session-archetype table (which the clean room re-derived almost verbatim — that part was earned).
- **`spec/programs.md`** — replace the dimension essay with contract-level program specs synthesized from the three passes; its five-dimension map survives at most as a one-paragraph orientation. Its "demands" section is superseded by §5, which is mechanism-precise.
- **`spec/engine.md`, `spec/host.md`, `spec/sdk.md`, `spec/substrate.md`** — take the R-list as the refinement pass `board.md` already planned. R5 and R7 first.
- **`inside.md`** — untouched for now, per the settled path: values are re-derived *last*, from what the programs proved. §4.3 is the first evidence entry for that pass.
- **`horizon.md`** — unaffected; R1's branch-runs and B's D7 note that merge semantics should be designed with speculative execution in view.

## 8. The path from here

1. Author reads the three clean-room files and this synthesis; recognition marks what's his and what isn't.
2. Settle §6's four decisions.
3. Fold: R-list into the mechanism specs; program contracts into a rewritten `spec/programs.md` (+ `agent.md`); update `board.md`.
4. Then the values pass: rebuild `inside.md` from what the program layer demonstrably demanded — a value stays only if something concrete demanded it.
