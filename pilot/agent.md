# The Model Programs

The programs that carry completion, rebuilt on the clean-room derivation ([`research/cleanroom/bridge.md`](../research/cleanroom/bridge.md)): **`model`** — one completion call per run, the only kind of program that touches a provider — and **`agent`** — the harness that composes context from the field, dispatches tools, and writes the conversation. Neither is architecturally special; the split is the system's own modularity applied to itself, and the harness is expected to decompose further (context assembler, tool dispatcher, renderer as separate programs) as the shape proves out.

The center this serves: **completion from a point in the field.** Context is a scope — addressable, pinned, reproducible — not a pasted transcript.

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

## Conversation types

**A session is a conversation** — the general primitive (`programs.md` §3.6), not an agent-owned kind. The agent is a participant; its specific event types are citizens of the conversation with first-class renderings, and third-party event types join the same way.

> **Open — the conversation may slim further.** The archetype below still carries `tool-call`/`tool-result`/`context` as conversation events — a shape inherited from how provider APIs work (strict chronological message history), not from what a conversation is. Under discussion: **mechanics live on frames, the conversation references them** — the discourse (messages, gates, controls) stays in the conversation; the turn's answer message references its process frame, where tool runs, context items, and verbatim requests already authoritatively live; drilling and folding follow the reference. If that holds, the event types below shrink to `message`, `gate`, `control`, and the "agent session" is fully gone. The archetype as written is the conservative shape until this settles.

The archetype:

```
conversation  spec: { propagate: true, ordered: true,
                      accepts: ["message", "tool-call", "tool-result", "context", "gate", "control"] }
message      (relates on conversation)  spec: { required: ["text"] }   body also: from, partial?, refs?
tool-call    (relates on conversation)  spec: { required: ["program"] }  body also: args?, process?
tool-result  (relates on conversation)  spec: { required: ["program"] }  body also: process?, output?
context      (relates on conversation)  spec: { ordered: true }
gate         (relates on conversation)  spec: { required: ["action", "status"] }
control      (relates on conversation)  spec: { required: ["signal"] }   — pause | resume | adjust
```

Content chunks dual-place: `instance` on the conversation (with seq) and `instance` on their type. A conversation is also placed on whatever it is about — aboutness is placement, filled by navigation shortcuts (*talk about this*) or by hand. `message.body.from` carries the participant (human, agent face, another person); prompts and answers are both messages. Conventions: `tool-call.body.process` present ⇔ a program run (absent ⇔ a direct substrate op); `tool-result.body.output` carries the result chunk's id, so the transcript links into the process trace by id, not copied text.

### Context items — completion from the field, recorded

A turn's context is addressable structure, not rendered text:

```
context chunk   instance on <conversation> (seq); instance on context type
context item    instance on <context chunk> (seq); relates on <source chunk>
  body: { source: ChunkId, at: CommitId, projection: "body" | "summary" | "name" }
```

The `relates` on the source is the load-bearing move: any chunk can answer *which model contexts have included me* — in which conversations, under which harnesses. `at` pins the source at the commit the read resolved against; temporal reads reconstruct exactly what the model saw. Together with the verbatim request on the `model` frame: the reference layer for navigation and staleness, the request chunk for the byte-exact record.

## The `agent` program

**Not a service.** One run = one turn (or one delegated task); the next message is a fresh run over the same conversation. The *conversation* is the persistent thing; the visual surface is separate (`converse`, a viewer like any other); the agent process is disposable. Cheap, because everything lives in the field, not in process memory.

The cycle:

1. **Orient.** Read own frame: conversation reference, boundary chunks walked to roots — the agent can tell the model, truthfully, what it can see and touch. Subscribe to the conversation: the steering channel.
2. **Assemble.** Read the conversation (probe counts, then pull — R2); scope the context roots; select. Commit the turn's context chunk + items (pinned, `relates` on sources). Selection policy — recency, FTS, summaries in place of large bodies, budget — is agent code; the *record* of selection is substrate.
3. **Complete.** Render context items + conversation into the selected model program's request shape (read from its schema), each block prefixed with its chunk id so the model addresses the field by id. Compile tool schemas from the toolset's programs — from their argument chunks, the same structure the launch form renders. Run the model program; await.
4. **Dispatch.** Substrate ops (`scope`, `get`, `search`, `commit`) execute directly — a `VALIDATION_ERROR` or `BOUNDARY_VIOLATION` renders back as the tool result; **spec enforcement is the model's error signal.** Program tools are `run` (child mode): nested trace, boundaries intersected — the model can never escalate. Parallel calls are parallel runs awaited together. Write `tool-call` / `tool-result` onto the conversation; loop to 2.
5. **Answer.** Commit the answer message `partial: true`, update on a throttle (R6 — streaming is commits), finalize with `partial: false` and `refs`. Exit 0.

### Pause, resume, and context purity

Between every cycle the agent checks its steering channel. A `control { signal: "pause" }` chunk on the conversation halts the loop **before the next cycle** — no process killed, nothing lost, the turn simply holds. While paused you inspect the trace, read what it read, even *discuss the work in the conversation itself*. Then `resume`.

The discipline that makes this more than a stop button: **the context stays pure.** Meta-discussion during the pause does not enter the agent's context by default — what enters is only what you choose to hand it: an `adjust` control carrying the distilled correction, or specific chunks added to the context roots. Conventional harnesses swallow the whole intervening transcript; here, because context is assembled from scope each cycle rather than accumulated, steering the next cycle and polluting it are finally separate things. (`cancel` still exists for actually killing a turn; pause is the primary gesture of skepticism.)

**Gates** are the agent-initiated mirror: policy makes the agent commit a `gate` chunk and hold on its subscription; the surface renders approve/deny; the decision is permanent history. No engine feature needed for either — both are conversation citizens.

**Sub-agents.** A run of `agent` from within `agent` — child mode, boundaries narrowed, trace nested. An orchestrator is not a framework; it is a program that calls `run` several times.

**Boundary.** Intrinsically open — the run grant is the user's whole decision about reach, made visible as chips before the turn starts (`programs.md` §3.6).

**Audit.** `scope([db/commits, P])` — every write. `scope([P])` — args, boundary, nested tool frames, each model call's verbatim request. `scope([conversation], {at})` — the conversation at any moment. No bespoke logging anywhere.

## Open

- **Harness decomposition.** Context assembler, tool dispatcher, renderer as separate programs the agent composes — likely, not yet forced.
- **How far conversation-as-primitive carries.** The agent brings many specific citizens (tool calls, gates, controls) to a conversation; whether reading *and interaction* (far beyond typing) stay fully modular as third parties add citizens is to be proven in the building.
- **Serialization form.** How context items render into each provider's request shape needs empirical testing per provider; the recorded structure is format-independent, so formats can change without losing the record.
- **Selection policy.** What the assembler chooses under budget is the live research frontier of completion-from-scope.
