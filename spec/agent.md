# The Model Programs

The programs that carry completion, rebuilt on the clean-room derivation ([`research/cleanroom/bridge.md`](research/cleanroom/bridge.md)): **`model`** — one completion call per run, the only kind of program that touches a provider — and **`agent`** — the harness that composes context from the field, dispatches tools, and answers onto its frame. Neither is architecturally special; the split is the system's own modularity applied to itself, and the harness is expected to decompose further (context assembler, tool dispatcher, renderer as separate programs) as the shape proves out.

The center this serves: **completion from a point in the field.** Context is a scope — addressable, pinned, reproducible — not a pasted transcript.

This file carries both halves: the mechanics of the two programs, and the lived experience of agent work — watching it, steering it, trusting it. There is no session to spec, so there is no second file: the experience belongs to the thread, and the thread is derived from what these programs record. Ground for the mechanisms the experience composes: [`engine.md`](engine.md) (drafts, the lifecycle), [`programs.md`](programs.md) §2 (`form`), §3 (`reader`, readings, collation), §6 (`process-view`).

---

## The `model` programs — a family, not a single shape

Providers differ, and will differ more. So `model` is not one rigid program with one request shape — it is a **family**: each provider model is its own program, declaring its own request and output types through the same self-describing interface every program uses (its argument archetype's instance spec: required keys the mandatory core, `?`-optional keys everything the provider supports). A caller reads the model program's interface the same way it reads any tool's. What the family shares is a minimal common core and a set of invariants:

**Common core.** Every model program accepts a request carrying at least `{ kind: "complete" | "embed", model }` plus provider-shaped content (`messages`, `input`, `tools`, `params` — as its own schema declares), and produces an output chunk carrying at least `{ kind, content | vector, usage }`. Provider-specific mechanics (system-prompt conventions, tool-call formats, caching controls) live in that program's declared schema — visible, not hardcoded in callers.

**Invariants (what makes it a model program).**

- **One call per run; frame-only.** `demand: { read: [], write: [] }` — nothing beyond its own frame, and a run can only narrow (engine.md, *Boundaries*). A completion sees exactly what was rendered into its request chunk; there is no path to exfiltrate substrate content beyond the caller's explicit rendering. Purity enforced, not promised.
- **The verbatim request is the artifact.** The byte-exact context window is the process's argument chunk: every prompt ever sent is inspectable, diffable, reproducible.
- **Output lands enumerable.** Owned by its process (the frame), `instance` on its result archetype and on `model/<name>` — every completion in the system enumerable per model; usage is a scope query, not a metering subsystem.
- **Egress and secrets concentrate here.** Only model programs (and `web`) hold network capability; only model programs hold provider secrets — injected as env vars from the host keychain at spawn, **never chunks**: a committed key in a lossless substrate is permanent.

**Open — where provider adaptation lives.** The agent must stay provider-generic; *how* is unsettled, with two candidate shapes:

- **(a) The agent reads each provider's schema** and renders context into that shape. Maximally flexible — but constructing rich, provider-shaped structure (message roles, tool-call formats, system conventions) from a declared schema alone is doubtful; schemas describe fields, not mapping semantics. Taken literally this drifts toward per-provider code inside the agent — the rigidity to avoid.
- **(b) The model program is the adapter.** The family shares one **canonical request archetype** — context items, messages, tool declarations, params — and each provider program maps canonical → provider inside itself. Provider-unique features (cache controls, thinking budgets) surface as documented optional keys the agent passes through opaquely. Adding a provider = writing one program; the agent never changes. The risk: the canonical shape flattening providers toward a lowest common denominator.

Leaning (b) — the adapter belongs with the thing it adapts, and passthrough keys relieve the flattening risk — but this is settled against the *second* provider actually built, not before. The cache-embodiment direction (`horizon.md`) lands inside this family's seam either way.

## Context and thread — two roles, named apart

The knot that dissolved the agent session for good: **context is per-invocation; the thread is derived.** They were fused in the old session shape; they are different things.

**Context** is the agent's actual argument: an **ordered list of scopes** — guidelines first, then the thread, then the prompt, then whatever this turn adds. It is composed as a draft ([`engine.md`](engine.md), *Lifecycle* — substrate-resident, edited by the `form`, editable iff unconsumed) and recorded twice, deliberately — **intent and fact**:

- **The expression (intent).** The context argument is a field expression — locations unioned in, exclusions, folds routing through summaries (`follow(previous) − turns[5..9] + summary-S`). Staging is scope algebra: *include* is a union term; any tile with the grant can write into the draft's context, since the draft is field data.
- **The resolution (fact).** Dispatch consumes the draft: the assembler resolves the expression at **one commit snapshot** and records the resolved items on the invocation's frame:

```
context chunk   owned by <invocation process>; instance on context type
  body: { expression }
context item    owned by <context chunk> (seq); relates on <source chunk>
  body: { source: ref, at: commit, projection: "body" | "summary" | "name" }
```

The `relates` on the source is the load-bearing move: any chunk can answer *which model contexts have included me*. `at` records the commit the read resolved against; with the verbatim request on the `model` frame, any past completion is exactly reproducible — and because both expression and resolution are recorded, the *choice* is as auditable as the content.

**Discourse is derived — there is no conversation container** (ruled). Turns are agent processes, and a **thread** is the lineage of citation: turn B follows turn A iff B's argument cited A — computed by the `follow` walk over recorded context provenance, never stored. Branching is two turns citing one predecessor; merging is one turn citing two lineages; the shape is git one level up (turns as commits, citations as parents, names as refs). Context is not transitive: each turn sees exactly its recorded list, and the chain works by per-turn compression — each answer distills what its turn saw, and that is all the next inherits. The prompt is the invocation's argument; the answer is a chunk on its frame; mechanics (tool runs, context items, verbatim requests) stay solely on frames, one source, reached by drilling. What else exists: **summary chunks** (placed on the turns they abstract — the shared chunk *is* the group; a fold routes the lineage through the summary) and **controls** (`relates` on the turn they steer):

```
control  spec: { instance: { signal: ref(signal), target: ref } }
         — signal values as chunks: pause | resume | abort-completion | adjust
```

**The draft is in the thread.** The next turn exists as a draft process ([`engine.md`](engine.md), *Lifecycle*) whose argument cites the last answer — so the walk finds it and it renders at the thread's end. Its prompt and context are composed in the field (no in-memory state); dispatch consumes.

A **conversation is a named location** — a lineage materializes a location chunk only when named, shared, bound, or peopled (participants attach there as relations); until then the thread exists only as the walk. No tool-call or tool-result event types exist; no agent-session type exists; no container type exists. History stays linear while context varies per turn — both recorded: read the thread for what happened, drill any invocation for what it read, and the draft's context (a location in the reader's collation) shows what the next turn will include — face follows context.

**Dispatch is summoned by drafts, not gated by types** (transmutes the former answer-home rule). The `form` appears wherever a draft process exists, and creating a draft is the gesture — *talk about this* on any entity creates a draft citing it. An email thread grows no composer because nothing creates a draft there unbidden; its reply composer matches its own types and answers in its own medium — actually sending an email is a tool call, not a discourse answer. The context list accepts any scopes at all: a list of people, an email thread projected through an integration, a codebase. A headless run is just a draft dispatched with no one watching.

**Provider-API coherence, reconstructed not stored.** Providers want prior tool exchanges as message history. The current turn's pairs the agent holds while running; previous turns' pairs are recoverable losslessly by walking invocation frames (child processes in order, argument chunks as tool_use, result chunks as tool_result). Replay, summarize, or omit is the serializer's *policy*, not the thread's shape.

*Open:* mixed human–human threads (message-shaped discourse between people) — settles when the second kind is built.

*Open:* whether a pending **gate** is also surfaced into the thread while its invocation runs, or stays frame-only surfaced by the invocation renderer — with the rule either way that a folded invocation's live obligations penetrate the fold.

## The `agent` program

**Not a service.** One run = one turn (or one delegated task); the next turn is a fresh run citing the last; the *field* is the persistent thing — the thread derives from it; the visual surface is separate (the reader); the agent process is disposable. Cheap, because everything lives in the field, not in process memory.

The cycle:

1. **Orient.** Read own frame: the resolved context list, boundary chunks walked to roots — the agent can tell the model, truthfully, what it can see and touch. Subscribe to its own turn for controls: the steering channel.
2. **Assemble.** Resolve the context list in order (probe counts, then pull); select under budget. Commit the turn's context chunk + items into its own frame (pinned, `relates` on sources). Selection policy — recency, FTS, summaries in place of large bodies — is agent code; the *record* of selection is substrate.
3. **Complete.** Render the context into the selected model program's request shape, each block prefixed with its chunk id so the model addresses the field by id. Compile tool schemas from the toolset's programs — from their argument chunks, the same structure the `form` renders. Run the model program; await.
4. **Dispatch.** Substrate ops (`scope`, `get`, `commit`) execute directly — a `VALIDATION_ERROR` or `BOUNDARY_VIOLATION` renders back as the tool result; **spec enforcement is the model's error signal.** Program tools are `run` (child mode): nested trace, boundaries intersected — the model can never escalate. Parallel calls are parallel runs awaited together. Nothing is written anywhere discourse-shaped — the tool trace *is* the frame; loop to 2.
5. **Answer.** Commit the answer chunk into its own frame, `partial: true`, updated on a throttle (streaming is commits — engine.md), finalized with `partial: false`. Inline mentions ride the `ol:` scheme — the request preamble teaches the model the convention; every mention files into the link index at commit, so an answer's citations are queryable from both ends. Exit 0.

### Pause, resume, and context purity

Between every cycle the agent checks its steering channel. A `control { signal: "pause" }` chunk related on the turn halts the loop **before the next cycle** — no process killed, nothing lost, the turn simply holds. While paused you inspect the trace, read what it read, even *talk about it* — a draft citing the paused turn, the ordinary gesture. Then `resume`.

The discipline that makes this more than a stop button: **the context stays pure.** Meta-discussion during the pause does not enter the agent's context by default — what enters is only what you choose to hand it: an `adjust` control carrying the distilled correction, or specific chunks added to the context roots. Conventional harnesses swallow the whole intervening transcript; here, because context is assembled from scope each cycle rather than accumulated, steering the next cycle and polluting it are finally separate things. (`cancel` still exists for actually killing a turn; pause is the primary gesture of skepticism.)

**Gates** are the agent-initiated mirror: policy makes the agent commit a `gate` chunk on its frame and hold on its subscription; the invocation renderer surfaces approve/deny; the decision is permanent history. No engine feature needed for either. (Placement — frame-only vs surfaced into the thread while running — is the open noted above.)

**Sub-agents.** A run of `agent` from within `agent` — child mode, boundaries narrowed, trace nested. An orchestrator is not a framework; it is a program that calls `run` several times.

**Boundary.** No `demand` — intrinsically open; the run grant is the user's whole decision about reach, made visible as chips before the turn starts (`programs.md` §2).

**Audit.** `scope([db/commits, P])` — every write. `scope([P])` — args, boundary, nested tool frames, each model call's verbatim request. `follow(turn) | at(commit)` — the thread at any moment. No bespoke logging anywhere.

## The thread view — a composition, not a program

The thread view is: **a `reader`** whose collation holds the thread (`follow` from the draft) and the draft's context — **`sequence` holding the ground**, slotting each element through `process-view` — with the **`form`** filling the draft's argument region at the bottom. No conversation tile exists as a thing to build — it is the reader chrome plus surfaces (`sequence`, `process-view`, `form`, `prose`) composed.

**Face follows context** (ruled — the resting default). The thread renders as what the next turn will see: the draft's context is a location in the collation, so the face is the assembler's proposal, honest by construction. **Reading is free; including is a gesture** — expanding folds, drilling frames, wandering into referenced threads feeds the agent nothing; staging writes into the draft's context (scope algebra: union a location in), from any tile with the grant. Every element wears its inclusion state (per-location slot chrome): in-whole, in-as-summary, merely-open. Deviation between face and context is marked, never silent. The discourse register — everything that ever happened here — is a location switch away.

## The turn, rendered — process-view's derived faces

One program over the lifecycle (`programs.md` §6): **draft → the form · running → the live frame · done → prompt + answer**. The agent-matched depth (a process is `instance` of its program — the renderer ladder carries the specialization):

**Folded — the line form** (the thread's default reading):
```
▸ [prompt digest]                    [live status]        [⚠ gate?] [⏸] [time]
```
The live status is **derived, never reported**: from the frame subscription — a running `model` child → *thinking… (Ns)*, or the streamed thinking's current line; a running `filesystem` child → *reading design/backoff.md* (from its argument); `shell` → the command; recent `db/commits ∩ P` → *writing to plan/retry*; a pending gate → *waiting on you*. Obligations penetrate the fold, always.

**Expanded — the thread of reasoning**, top to bottom:

1. **The prompt** (the invocation's argument), with the context as chips — each drillable to what was included, at which commit, at which projection; the recorded *expression* beside the resolved items (intent and fact — *Context and thread*, above).
2. **Cycle segments**, one per model call, in order: the reasoning (thinking folded by default; live pane while streaming); the tool cluster (parallel runs grouped, each through its own renderer, each drillable); the **mutation strip** — an attribute slot (`el → intersect(commits)`, `programs.md` §3): what P committed since the last segment, one press from `review`; **context deltas** — every mid-turn expansion a visible, boundary-checked event.
3. **Gates**, inline, approve/deny where they occurred — permanent history once decided.
4. **The answer**, streaming in place (partial commits), finalized — rendered by `prose`: `ol:` references through the ladder, so an answer carries live structure (a cited finding as itself, an edit as its diff); an answer may be a sequence of prose and typed chunks (the fractal, `programs.md` §4).
5. **Controls** throughout: pause (halts before the next cycle; the primary gesture of skepticism), resume, abort-completion, adjust (the distilled correction — context purity: meta-discussion never enters, only what you hand it), cancel. Verbs: *review changes*, *re-run*, *inspect raw*.

**Minimized — the widget**: the derived status line as data (a projection of the frame), pause/play carried on it.

## Seeing the thinking — three layers, degrading gracefully

- **L0 — derived status** (works even fully buffered): computed from frame children and commits. It cannot lie and costs two subscriptions.
- **L1 — streamed thinking** (pulled forward, ruled): extended thinking streams — the `model` program commits throttled deltas into its output chunk; the partial-commit convention (engine.md, *Streaming convention*) is the entire pipe. Raw thinking is long and exploratory — right as a depth pane, wrong as primary display; frontier providers already summarize server-side. The newest fragment feeds L0's status line free.
- **L2 — narration**: `narrate` over the turn or thread — calibrated abstraction at the person's altitude, compressing across cycles, entities as pressable chrome, feeding the folds. The calm default reading; depth always one press beneath. Live narration is itself model calls — a knob, not a blocker. Direction: a first-class default view mode, grown into.

## Order and parallelism

Cycles are strictly sequential; tools within a cycle run parallel when the model emits several calls; sub-agents are long tool runs, rendered recursively. One active turn per thread is a *policy* of the draft's dispatch, not a mechanism — nothing structural forbids parallel turns (they are just two drafts citing the same predecessor: a branch).

## What v0.1 implements, in order

Aligned with the board's build queue:

1. **`reader` v0** — the collation over the built intersection grammar; members side by side; slot chrome; hide/show.
2. **`draft` + `form`** — the draft state; the form on any unconsumed argument; dispatch as consumption.
3. **`process-view` v0** — the three regions, result by declared archetype; folded line with derived status (L0).
4. **`prose` v0** — mentions as links; answer streaming in place.
5. **`follow` + the thread face** — the walk as a member; the draft at the bottom; face-follows-context, inclusion via slot chrome.
6. **Streamed thinking (L1)** via the model program — early, not deferred. Then gates, context deltas, attribute slots (the mutation strip), shipped collations.
7. **`narrate` + summary folds (L2).**

Each step is demonstrable alone; where one can't reach this spec with the mechanisms as specced, that lands in the demand ledger, not in silence.

## Conventions and edges

- **A completed turn's resting form is prompt + answer visible, mechanics folded** — a thread of resting turns reads as a conversation, not a list of digests.
- **Defaults live in the field**: standing boundary defaults, toolset, model choice, guidelines reference — chunks `relates` on the named location (project-level defaults on the project root); the form reads them, the person edits them.
- **Controls carry a `target`** (the turn's process id). Signals: `pause`, `resume`, `abort-completion` (stop the current model call, keep the turn alive), `adjust` — rendered as an instruction block in the next request; recorded on the frame as a context delta.
- **Entity mentions**: the `ol:` scheme (`<ol:id>` badge, `[name](ol:id)` link — `programs.md` §4); the request preamble teaches the model the convention, and every mention files into the link index at commit.
- **"Include the thread" default**: the default assembler walks the lineage — recent turns at full projection, older through their summary groups; an assembler-policy knob, not a mechanism. Swapping or parameterizing the assembler *is* the thread's defining act, not a violation of it.
- **Failure is a first-class resting form**: a failed turn shows its error, its mutation strip, *retry* (re-run, pre-filled), *review changes*. Nothing hides. An abandoned draft rests visibly — unsent thought; nothing auto-sweeps.
- **Cost is visible**: usage sits on every model output chunk; the resting turn shows its tokens; a thread's total is a walk. A read, not a metering system.
- **Stale-display**: an argument whose referenced chunk has since moved renders as-it-was, marked (`programs.md` §6).
- *Open:* removing a past turn from a lineage's default face (exclusion is a location edit — lossless, recoverable) and what it means for later reconstruction — deferred until real use demands it.

## Open

- **Harness decomposition.** Context assembler, tool dispatcher, renderer as separate programs the agent composes — likely, not yet forced.
- **How far thread-as-derived carries.** The agent brings many specific citizens (tool calls, gates, controls) to a thread; whether reading *and interaction* (far beyond typing) stay fully modular as third parties add citizens is to be proven in the building.
- **Serialization form.** How context items render into each provider's request shape needs empirical testing per provider; the recorded structure is format-independent, so formats can change without losing the record.
- **Selection policy.** What the assembler chooses under budget is the live research frontier of completion-from-scope.
