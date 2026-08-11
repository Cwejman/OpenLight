# The Model Programs

The programs that carry completion: **`model`** — one completion call per run, the only kind of program that touches a provider — and **`agent`** — the harness, one run per turn. Neither is architecturally special; the split is the system's modularity applied to itself. The center served: **completion from a point in the field** — context is addressable structure, never a pasted transcript.

Settled in sitting E (2026-08-08/11; [`research/arc/agent-position.md`](research/arc/agent-position.md), UX grounding in [`research/arc/composition-scenes.md`](research/arc/composition-scenes.md)). This file is the single home for the agent model. The mechanics it stands on live where they belong: process, lifecycle, boundaries, the `run` key and run-to-draft escalation in [`engine.md`](engine.md); the seated argument, slots, citizens, `process-view` in [`programs.md`](programs.md); the type law in [`substrate.md`](substrate.md).

---

## `model` — the provider seam

A family: each provider model is its own program. What makes a program a model program:

- **One call per run; contained absolutely.** `read: {}` · `write: {}` · `run: {}` — nothing beyond its own frame, starts nothing, enforced. A completion sees exactly what was rendered into its request; there is no path to exfiltrate field content beyond the caller's explicit rendering.
- **The verbatim request is the artifact.** `accepts: [ request ]` — one payload chunk, the byte-exact window, frozen at start. Every prompt ever sent is inspectable, diffable, reproducible.
- **Output lands in the frame**, `instance` on the program's result archetype. A process is `instance` on its program, so every completion is already enumerable — `read([<model-program>, engine/process])` is the usage ledger; cost is a read of `usage` keys, not a metering subsystem.
- **Egress and secrets concentrate here.** Only model programs (and `web`) hold network capability; secrets are env vars injected from the host keychain at spawn — never chunks: a committed key in a lossless substrate is permanent.

```ol
program claude {
  runtime: vm
  accepts: [ request ]
  result:  ref(output)
  read: {}  write: {}  run: {}
  capabilities: { net:api.anthropic.com, secret:ANTHROPIC_API_KEY }
}
chunk claude/request {
  instance: {
    kind:     ref(kind)        — complete | embed; value chunks under this archetype
    model:    string
    at:       ref(commit)      — the head this window's content resolved against
    includes: set<ref>         — every chunk rendered into the window
    body:     map              — messages, tools, params — provider-shaped
  }
}
chunk claude/output {
  instance: { kind: ref(kind), content?: markdown, vector?: list<number>,
              stop_reason?: string, usage: map }
}
```

The request `body` is provider-shaped, deliberately: v0.1 has one provider, and the canonical request archetype — mapped to each provider inside its own program, provider-unique features as documented passthrough keys — is settled against the *second* provider actually built, not before.

**Streaming.** The model program commits throttled partials to its output chunk (`partial: true`, ~4/s, finalized `partial: false`) — the streaming convention ([`engine.md`](engine.md)). When buffers are realized, partials become frames and the digest stays the commit; the agent depends only on a final output chunk and a live partial channel, so nothing here changes with that call.

## `agent` — the context is the argument

```ol
program agent {
  runtime: vm
  accepts: [ selection ]
  result:  ref(answer)
}
```

`read`, `write`, `run` absent: intrinsically open — reach is entirely the run grant, the person's whole decision, shown as chips before Go. One run = one turn (or one delegated task); the agent process is disposable; the field is the persistent thing.

**There is no context structure.** The turn's context *is* its argument: a selection, composed as a draft (place algebra, writable from any tile with the grant, the seated argument — [`programs.md`](programs.md) §2), frozen at start, implicitly read-granted. The prompt is an element; guidelines are a `loc`; the thread is a `follow` expression; a staged document a `ref`. *Talk about this* on any entity is a draft citing it. A headless run is a draft started with no one watching.

**Elements classify by archetype, and the convention has one home — here.** The match validates nothing (`[selection]` admits any set; a turn with no prompt is a delegated task), so consumers read placements, never guess:

- `prompt` — the asking prose.
- `agent/settings` — per-turn overrides: model choice, toolset additions within the grant.
- Everything else is content. Doctrine — the compute-environment guidelines every agent needs — is ordinary field content, included like any content.

**Defaults live in the field**: standing model choice, toolset, guidelines reference — chunks `relates` on the named location; the seated argument reads them, the person edits them. Nothing cascades from any root.

## The record — intent and fact

Recorded twice, deliberately, both on structure that already exists:

- **Intent** — the argument expression, frozen on the turn's body with `at`. Expression chunks file their own mentions, so "which turns cite this place" is a link-index answer.
- **Fact** — each cycle's request chunk: `at` is the commit its content resolved against; `includes` files one link row per element, so any chunk answers *which windows included me* from its `linked`. Consumption tagging — retrieval's inverse — with no machinery. The request `body` is the ground truth; `includes` is its index, auditable against a re-render (hash direction: [`research/arc/object-model.md`](research/arc/object-model.md)).

Order is serialization, not structure: guidelines-then-thread-then-prompt is the assembler's default policy, readable in the request it produced. Context deltas derive by diffing successive `includes` — never reported, never trusted.

## The cycle

1. **Orient.** `get` self — argument, the three boundary keys, `at`; one read, no walks. `subscribe([P])` — the steering channel.
2. **Assemble.** `resolve` the argument's terms **at head** — deliberate: the turn must see its own writes; the living-head mode is the same gesture as the reader following its reading. Probe with body-less reads, then render:
   - **Everything included renders whole, deduplicated.** Successive turns share most of their context, so the normalized union is the shared context once plus each turn's prompt and answer — the maximal include costs nearly the minimal one. **No silent reduction**: grades (name · summary · body) apply only where the person specified, the expression says so, or the agent's own guidelines direct it — with or without consultation, as they say.
   - Filtering, when chosen, is expressible: spine `draft | follow(refs(argument))`; per element `prop(argument) | where(instance: prompt)` and `prop(result)` — prompts and answers only. Same filter as assembler policy: body grade for `prompt` instances and answers, name grade for the rest.
3. **Complete.** Commit the request chunk into the frame; `run` the model child; `await`. Tool schemas compile from the toolset programs' reified `accepts` entries — the same data the seated argument renders. **The toolset is the `run` boundary** — one home, capped by the parent's, so a sub-agent can never be handed programs its parent couldn't run.
4. **Act.** Substrate ops execute directly through the protocol — no processes; `VALIDATION_ERROR` and `BOUNDARY_VIOLATION` render back as tool results: **spec enforcement is the model's error signal.** The default toolset exposes `read`/`get`, so the model pulls more mid-turn — within the walls, every pull recorded in the next request's `includes`; a pre-fed turn (no read tools) is the deliberate restriction for fully pre-planned work. Program tools are child runs: caps intersect, the trace nests by ownership, the model can never escalate; parallel calls are parallel runs awaited together. Loop to 2.
5. **Answer.** A chunk `instance` on `answer`, owned by the turn; streamed as throttled partials, finalized. Mentions ride the `ol:` scheme and file at commit — an answer's citations are queryable from both ends.

Cycles are sequential; tools within a cycle run parallel; sub-agents are long child runs. Ownership is one hop, so reading the whole trace is a `follow` walk, never one read.

## Escalation — beyond the walls, uniformly

A turn's walls are its three boundary keys. Any act beyond them — a read, a write, a start outside `run` — becomes a **draft child**, auto-surfaced for approval (run-to-draft, [`engine.md`](engine.md)). No gate archetype exists; the approval surface is the seated argument every draft already has.

- The agent knows when it will exceed: it composes the draft and relates explanation prose onto it before resting on `await`.
- **Approve is starting the draft** — with the approver's reach as the cap. Approval is lending authority; the process chrome marks lent-authority subtrees against the original grant ([`programs.md`](programs.md)).
- **Deny is `cancel` on the draft** → `failed`, error `denied`. The caller's `await` resolves; the agent renders the refusal as a tool result and reasons on.
- **Surfacing**: a pending draft badges the sidebar and surfaces in any process slot — obligations penetrate the fold, always.
- A question with no action attached is discourse, not mechanism: the agent asks in its answer; the person replies or adjusts.

## Steering

Aimed at the work, not the agent: the context menu on any running process — pause + prompt, or insert-at-next-cycle. Mechanics: `control` chunks `relates` on the turn — who may steer is who may write there; the write is the audit.

Signals: `pause` (halts before the next cycle; nothing killed, nothing lost) · `resume` · `abort-completion` (the agent cancels its in-flight model child; the turn survives) · `adjust` (a distilled instruction block in the next request). `cancel` on the turn itself remains the engine's kill.

**Context purity, checkable.** Cycle N+1's request is a function of the argument resolved at head plus exactly two delta sources: `adjust` controls since cycle N, and membership changes within the frozen expression — placing a chunk onto a dimension the argument names (the turn itself included) is handing it in. Nothing else may enter; a residue in the request diff is a violation. Meta-discussion during a pause lives in other drafts citing the paused turn — which the expression never reaches.

**Sub-agents.** Ownership means lifecycle (the cascade) and the reach cap — nothing else. Citizenship is flat: any process may be paused, steered, forked-from, discussed, within the *interactor's* boundary over its chunk, never by position in the tree.

## The thread — derived

A citation is a `ref` element in a draft's argument; selection-typed keys file one link row per element, so **the thread is `follow` over argument links** — computed, never stored. Branch: two drafts citing one turn. Merge: one draft citing two. A conversation is a named location, materialized only when named, shared, bound, or peopled; until then the thread exists only as the walk. Provider message history is reconstructed from frames as serializer policy, not stored.

## The face

A `reader` whose collation holds the thread walk and the draft's argument — **face follows context**: what you see is what the next turn gets; deviation is marked, never silent (in-whole · in-as-summary · merely-open); reading is free, including is a gesture. Fork and merge render as inline sequence elements with branch TLDR slots; a diamond continues past its join — the line truly continues. UX charted scene-by-scene in [`composition-scenes.md`](research/arc/composition-scenes.md).

The process slot holds ground plus citizens ([`programs.md`](programs.md) §5): the turn face, and the agent's shipped **context overview** — how the argument maps to the actual window: which elements, deduped how, rendered at what grade. It matches the process itself (`accepts: [ref(agent)]` — the renderer ladder), reading argument and request chunks; manual control of context is real only because this surface exists.

Turn rendering across the lifecycle is `process-view`'s: draft → the seated argument · running → the live frame with **derived status** (computed from children and commits; it cannot lie) · done → prompt + answer, mechanics folded, one drill away. Thinking in three layers: L0 derived status · L1 streamed thinking (the partial channel) · L2 `narrate`.

## Seeds

What bootstrap ships for the agents project: the `agent` program; one program chunk per provider model; archetypes `prompt`, `agent/settings`, `agent/answer`, `<model>/request` with its `kind` value chunks, `<model>/output`, `control` with its signal value chunks. Nothing else — no session archetype, no conversation container, no gate, no context archetype.

## Open — deliberate

- **Mixed human–human threads** — message-shaped discourse between people; settles when the second discourse kind is built.
- **The canonical request archetype** — settles against the second provider.
- **Harness decomposition** — assembler, tool runner as separate programs the agent composes; likely, not yet forced.
- **Selection policy under budget** — what the assembler chooses is agent code and the live research frontier of completion-from-place; the record makes every policy auditable.
