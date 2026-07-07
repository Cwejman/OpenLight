# The Model Programs

The programs that carry completion, rebuilt on the clean-room derivation ([`research/cleanroom/bridge.md`](../research/cleanroom/bridge.md)): **`model`** — one completion call per run, the only kind of program that touches a provider — and **`agent`** — the harness that composes context from the field, dispatches tools, and writes the conversation. Neither is architecturally special; the split is the system's own modularity applied to itself, and the harness is expected to decompose further (context assembler, tool dispatcher, renderer as separate programs) as the shape proves out.

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

## Context and discourse — two roles, named apart

The knot that dissolved the agent session for good: **context is per-invocation; discourse is the conversation.** They were fused in the old session shape; they are different things.

**Context** is the agent's actual argument: an **ordered list of scopes** — guidelines first, then the discourse scope, then the prompt, then whatever this turn adds. It varies per invocation, and it lives on the invocation's *frame* as context items:

```
context chunk   instance on <invocation process> (seq); instance on context type
context item    instance on <context chunk> (seq); relates on <source chunk>
  body: { source: ChunkId, at: CommitId, projection: "body" | "summary" | "name" }
```

The `relates` on the source is the load-bearing move: any chunk can answer *which model contexts have included me*. `at` pins the source at the commit the read resolved against; with the verbatim request on the `model` frame, any past completion is exactly reproducible.

**Discourse** is the conversation: a named ordered scope where messages and invocation entities land, in order. Its archetype types the **container, not the content**:

```
conversation  spec: { ordered: true }        — content deliberately wildcard
message       spec: { required: ["text"] }   body: from, partial?, refs?
control       spec: { required: ["signal"] } — pause | resume | adjust
```

What accumulates on an **agent session**: **turns only** — the invocation's process chunk, dual-placed with seq at dispatch; the prompt is the invocation's argument, the answer a chunk on its frame; mechanics (tool runs, context items, verbatim requests) stay solely on frames, one source, reached by drilling. Plus **summary chunks** (placed on the turns they abstract — the shared chunk *is* the group) and **controls**. `message` chunks belong to human conversations; no tool-call or tool-result event types exist; no separate agent-session type exists. Authority for the experience: [`session.md`](session.md).

So history stays linear while context varies per turn — both recorded: scroll the conversation for what happened, drill any invocation for what it was reading, and the dispatcher's standing selection (a field entity `relates` on the conversation) highlights in the reader what the next turn will include.

**The answer-home is typed; the context list is not.** "Wildcard" applies only to a conversation's *content* — what may be placed into it. What *counts as* a conversation is typed membership, and the agent's discourse target must be a `conversation` instance — the type is the agent session's descendant, the home where agents answer. The context list, by contrast, accepts any scopes at all: a list of people, an email thread projected through an integration, a codebase — all valid context, none a valid answer-home. The dispatcher's argument is placed on `conversation` and nothing else, so it never appears on an email thread (`email/thread` is the integration's type; its reply composer matches there, answering in *that* medium); *talk about this* on the thread bridges — a conversation opens carrying the thread as relation and context, the agent answers there, and actually sending an email is a tool call, not a discourse answer. A headless run has a context list and no discourse home at all.

**Provider-API coherence, reconstructed not stored.** Providers want prior tool exchanges as message history. The current turn's pairs the agent holds while running; previous turns' pairs are recoverable losslessly by walking invocation frames (child processes in order, argument chunks as tool_use, result chunks as tool_result). Replay, summarize, or omit is the serializer's *policy*, not the conversation's shape.

*Open:* whether a pending **gate** is also placed onto the conversation while its invocation runs (so it surfaces in the timeline), or stays frame-only surfaced by the invocation renderer — with the rule either way that a folded invocation's live obligations penetrate the fold.

## The `agent` program

**Not a service.** One run = one turn (or one delegated task); the next message is a fresh run over the same conversation. The *conversation* is the persistent thing; the visual surface is separate (`converse`, a viewer like any other); the agent process is disposable. Cheap, because everything lives in the field, not in process memory.

The cycle:

1. **Orient.** Read own frame: the ordered context list, the discourse target if any, boundary chunks walked to roots — the agent can tell the model, truthfully, what it can see and touch. Subscribe to the discourse scope: the steering channel.
2. **Assemble.** Resolve the context list in order (probe counts, then pull — R2); select under budget. Commit the turn's context chunk + items onto its own frame (pinned, `relates` on sources). Selection policy — recency, FTS, summaries in place of large bodies — is agent code; the *record* of selection is substrate.
3. **Complete.** Render the context into the selected model program's request shape, each block prefixed with its chunk id so the model addresses the field by id. Compile tool schemas from the toolset's programs — from their argument chunks, the same structure the launch form renders. Run the model program; await.
4. **Dispatch.** Substrate ops (`scope`, `get`, `search`, `commit`) execute directly — a `VALIDATION_ERROR` or `BOUNDARY_VIOLATION` renders back as the tool result; **spec enforcement is the model's error signal.** Program tools are `run` (child mode): nested trace, boundaries intersected — the model can never escalate. Parallel calls are parallel runs awaited together. Nothing is written to the discourse scope — the tool trace *is* the frame; loop to 2.
5. **Answer.** Commit the answer chunk onto its own frame, `partial: true`, updated on a throttle (R6 — streaming is commits), finalized with `partial: false` and `refs` (inline mentions as `[[chunk-id]]` — the renderer resolves them; the request preamble teaches the model the convention). Exit 0.

### Pause, resume, and context purity

Between every cycle the agent checks its steering channel. A `control { signal: "pause" }` chunk on the conversation halts the loop **before the next cycle** — no process killed, nothing lost, the turn simply holds. While paused you inspect the trace, read what it read, even *discuss the work in the conversation itself*. Then `resume`.

The discipline that makes this more than a stop button: **the context stays pure.** Meta-discussion during the pause does not enter the agent's context by default — what enters is only what you choose to hand it: an `adjust` control carrying the distilled correction, or specific chunks added to the context roots. Conventional harnesses swallow the whole intervening transcript; here, because context is assembled from scope each cycle rather than accumulated, steering the next cycle and polluting it are finally separate things. (`cancel` still exists for actually killing a turn; pause is the primary gesture of skepticism.)

**Gates** are the agent-initiated mirror: policy makes the agent commit a `gate` chunk on its frame and hold on its subscription; the invocation renderer surfaces approve/deny; the decision is permanent history. No engine feature needed for either. (Placement — frame-only vs also onto the conversation while running — is the open noted above.)

**Sub-agents.** A run of `agent` from within `agent` — child mode, boundaries narrowed, trace nested. An orchestrator is not a framework; it is a program that calls `run` several times.

**Boundary.** Intrinsically open — the run grant is the user's whole decision about reach, made visible as chips before the turn starts (`programs.md` §3.6).

**Audit.** `scope([db/commits, P])` — every write. `scope([P])` — args, boundary, nested tool frames, each model call's verbatim request. `scope([conversation], {at})` — the conversation at any moment. No bespoke logging anywhere.

## Open

- **Harness decomposition.** Context assembler, tool dispatcher, renderer as separate programs the agent composes — likely, not yet forced.
- **How far conversation-as-primitive carries.** The agent brings many specific citizens (tool calls, gates, controls) to a conversation; whether reading *and interaction* (far beyond typing) stay fully modular as third parties add citizens is to be proven in the building.
- **Serialization form.** How context items render into each provider's request shape needs empirical testing per provider; the recorded structure is format-independent, so formats can change without losing the record.
- **Selection policy.** What the assembler chooses under budget is the live research frontier of completion-from-scope.
