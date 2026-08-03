# The Model Programs

The programs that carry completion, rebuilt on the clean-room derivation ([`research/cleanroom/bridge.md`](research/cleanroom/bridge.md)): **`model`** — one completion call per run, the only kind of program that touches a provider — and **`agent`** — the harness that composes context from the field, dispatches tools, and answers onto its frame. Neither is architecturally special; the split is the system's own modularity applied to itself, and the harness is expected to decompose further (context assembler, tool dispatcher, renderer as separate programs) as the shape proves out.

The center this serves: **completion from a point in the field.** Context is a scope — addressable, pinned, reproducible — not a pasted transcript.

The lived experience of all of this — the session view, the turn renderer, the thinking layers — is specced in [`session.md`](session.md).

---

## The `model` programs — a family, not a single shape

Providers differ, and will differ more. So `model` is not one rigid program with one request shape — it is a **family**: each provider model is its own program, declaring its own request and output types through the same self-describing interface every program uses (argument chunks: `spec.required` for the mandatory core, `body.schema` for everything the provider supports). A caller reads the model program's interface the same way it reads any tool's. What the family shares is a minimal common core and a set of invariants:

**Common core.** Every model program accepts a request carrying at least `{ kind: "complete" | "embed", model }` plus provider-shaped content (`messages`, `input`, `tools`, `params` — as its own schema declares), and produces an output chunk carrying at least `{ kind, content | vector, usage }`. Provider-specific mechanics (system-prompt conventions, tool-call formats, caching controls) live in that program's declared schema — visible, not hardcoded in callers.

**Invariants (what makes it a model program).**

- **One call per run; frame-only boundary.** It reads nothing but its own frame — the run-level boundary cannot widen an intrinsic floor. A completion sees exactly what was rendered into its request chunk; there is no path to exfiltrate substrate content beyond the caller's explicit rendering. Purity enforced, not promised.
- **The verbatim request is the artifact.** The byte-exact context window is the process's argument chunk: every prompt ever sent is inspectable, diffable, reproducible.
- **Output lands on the model's scope.** `instance` on its process and on `model/<name>` — every completion in the system enumerable per model; usage is a scope query, not a metering subsystem.
- **Egress and secrets concentrate here.** Only model programs (and `web`) hold network capability; only model programs hold provider secrets — injected as env vars from the host keychain at spawn, **never chunks**: a committed key in a lossless substrate is permanent (R8).

**Open — where provider adaptation lives.** The agent must stay provider-generic; *how* is unsettled, with two candidate shapes:

- **(a) The agent reads each provider's schema** and renders context into that shape. Maximally flexible — but constructing rich, provider-shaped structure (message roles, tool-call formats, system conventions) from a declared schema alone is doubtful; schemas describe fields, not mapping semantics. Taken literally this drifts toward per-provider code inside the agent — the rigidity to avoid.
- **(b) The model program is the adapter.** The family shares one **canonical request archetype** — context items, messages, tool declarations, params — and each provider program maps canonical → provider inside itself. Provider-unique features (cache controls, thinking budgets) surface as documented optional keys the agent passes through opaquely. Adding a provider = writing one program; the agent never changes. The risk: the canonical shape flattening providers toward a lowest common denominator.

Leaning (b) — the adapter belongs with the thing it adapts, and passthrough keys relieve the flattening risk — but this is settled against the *second* provider actually built, not before. The cache-embodiment direction (`horizon.md`) lands inside this family's seam either way.

## Context and thread — two roles, named apart

The knot that dissolved the agent session for good: **context is per-invocation; the thread is derived.** They were fused in the old session shape; they are different things.

**Context** is the agent's actual argument: an **ordered list of scopes** — guidelines first, then the thread, then the prompt, then whatever this turn adds. It is composed as a draft (`programs.md` §2 — substrate-resident, edited by the `form`, editable iff unconsumed) and recorded twice, deliberately — **intent and fact**:

- **The expression (intent).** The context argument is a field expression — locations unioned in, exclusions, folds routing through summaries (`follow(previous) − turns[5..9] + summary-S`). Staging is scope algebra: *include* is a union term; any tile with the grant can write into the draft's context, since the draft is field data.
- **The resolution (fact).** Dispatch consumes the draft: the assembler resolves the expression at **one commit snapshot** and records the resolved items on the invocation's frame:

```
context chunk   instance on <invocation process> (seq); instance on context type
  body: { expression }
context item    instance on <context chunk> (seq); relates on <source chunk>
  body: { source: ChunkId, at: CommitId, projection: "body" | "summary" | "name" }
```

The `relates` on the source is the load-bearing move: any chunk can answer *which model contexts have included me*. `at` records the commit the read resolved against; with the verbatim request on the `model` frame, any past completion is exactly reproducible — and because both expression and resolution are recorded, the *choice* is as auditable as the content.

**Discourse is derived — there is no conversation container** (ruled; `programs.md` §3.6). A **thread** is the lineage of citation: turn B follows turn A iff B's argument cited A — computed by the `follow` walk over recorded context provenance, never stored. The prompt is the invocation's argument; the answer is a chunk on its frame; mechanics (tool runs, context items, verbatim requests) stay solely on frames, one source, reached by drilling. What else exists: **summary chunks** (placed on the turns they abstract — the shared chunk *is* the group) and **controls** (`relates` on the turn they steer):

```
control  spec: { required: ["signal", "target"] } — pause | resume | abort-completion | adjust
```

A **conversation is a named location** — a lineage materializes a location chunk only when named, shared, bound, or peopled (participants attach there as relations). No tool-call or tool-result event types exist; no agent-session type exists; no container type exists. History stays linear while context varies per turn — both recorded: read the thread for what happened, drill any invocation for what it read, and the draft's context (a location in the reader's collation) shows what the next turn will include — face follows context. Authority for the experience: [`session.md`](session.md).

**Dispatch is summoned by drafts, not gated by types** (transmutes the former answer-home rule). The `form` appears wherever a draft process exists, and creating a draft is the gesture — *talk about this* on any entity creates a draft citing it. An email thread grows no composer because nothing creates a draft there unbidden; its reply composer matches its own types and answers in its own medium — actually sending an email is a tool call, not a discourse answer. The context list accepts any scopes at all: a list of people, an email thread projected through an integration, a codebase. A headless run is just a draft dispatched with no one watching.

**Provider-API coherence, reconstructed not stored.** Providers want prior tool exchanges as message history. The current turn's pairs the agent holds while running; previous turns' pairs are recoverable losslessly by walking invocation frames (child processes in order, argument chunks as tool_use, result chunks as tool_result). Replay, summarize, or omit is the serializer's *policy*, not the thread's shape.

*Open:* whether a pending **gate** is also surfaced into the thread while its invocation runs, or stays frame-only surfaced by the invocation renderer — with the rule either way that a folded invocation's live obligations penetrate the fold.

## The `agent` program

**Not a service.** One run = one turn (or one delegated task); the next turn is a fresh run citing the last; the *field* is the persistent thing — the thread derives from it; the visual surface is separate (the lens); the agent process is disposable. Cheap, because everything lives in the field, not in process memory.

The cycle:

1. **Orient.** Read own frame: the resolved context list, boundary chunks walked to roots — the agent can tell the model, truthfully, what it can see and touch. Subscribe to its own turn for controls: the steering channel.
2. **Assemble.** Resolve the context list in order (probe counts, then pull — R2); select under budget. Commit the turn's context chunk + items onto its own frame (pinned, `relates` on sources). Selection policy — recency, FTS, summaries in place of large bodies — is agent code; the *record* of selection is substrate.
3. **Complete.** Render the context into the selected model program's request shape, each block prefixed with its chunk id so the model addresses the field by id. Compile tool schemas from the toolset's programs — from their argument chunks, the same structure the launch form renders. Run the model program; await.
4. **Dispatch.** Substrate ops (`scope`, `get`, `search`, `commit`) execute directly — a `VALIDATION_ERROR` or `BOUNDARY_VIOLATION` renders back as the tool result; **spec enforcement is the model's error signal.** Program tools are `run` (child mode): nested trace, boundaries intersected — the model can never escalate. Parallel calls are parallel runs awaited together. Nothing is written anywhere discourse-shaped — the tool trace *is* the frame; loop to 2.
5. **Answer.** Commit the answer chunk onto its own frame, `partial: true`, updated on a throttle (R6 — streaming is commits), finalized with `partial: false` and `refs` (inline mentions as `[[chunk-id]]` — the renderer resolves them; the request preamble teaches the model the convention). Exit 0.

### Pause, resume, and context purity

Between every cycle the agent checks its steering channel. A `control { signal: "pause" }` chunk related on the turn halts the loop **before the next cycle** — no process killed, nothing lost, the turn simply holds. While paused you inspect the trace, read what it read, even *talk about it* — a draft citing the paused turn, the ordinary gesture. Then `resume`.

The discipline that makes this more than a stop button: **the context stays pure.** Meta-discussion during the pause does not enter the agent's context by default — what enters is only what you choose to hand it: an `adjust` control carrying the distilled correction, or specific chunks added to the context roots. Conventional harnesses swallow the whole intervening transcript; here, because context is assembled from scope each cycle rather than accumulated, steering the next cycle and polluting it are finally separate things. (`cancel` still exists for actually killing a turn; pause is the primary gesture of skepticism.)

**Gates** are the agent-initiated mirror: policy makes the agent commit a `gate` chunk on its frame and hold on its subscription; the invocation renderer surfaces approve/deny; the decision is permanent history. No engine feature needed for either. (Placement — frame-only vs surfaced into the thread while running — is the open noted above.)

**Sub-agents.** A run of `agent` from within `agent` — child mode, boundaries narrowed, trace nested. An orchestrator is not a framework; it is a program that calls `run` several times.

**Boundary.** Intrinsically open — the run grant is the user's whole decision about reach, made visible as chips before the turn starts (`programs.md` §3.6).

**Audit.** `scope([db/commits, P])` — every write. `scope([P])` — args, boundary, nested tool frames, each model call's verbatim request. `follow(turn) | at(commit)` — the thread at any moment. No bespoke logging anywhere.

## Open

- **Harness decomposition.** Context assembler, tool dispatcher, renderer as separate programs the agent composes — likely, not yet forced.
- **How far thread-as-derived carries.** The agent brings many specific citizens (tool calls, gates, controls) to a thread; whether reading *and interaction* (far beyond typing) stay fully modular as third parties add citizens is to be proven in the building.
- **Serialization form.** How context items render into each provider's request shape needs empirical testing per provider; the recorded structure is format-independent, so formats can change without losing the record.
- **Selection policy.** What the assembler chooses under budget is the live research frontier of completion-from-scope.
