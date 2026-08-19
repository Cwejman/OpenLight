# The Model Programs

The programs that carry completion: **`model`** — one completion call per run, the only kind of program that touches a provider — and **`agent`** — the harness, one run per turn. Neither is architecturally special; the split is the system's modularity applied to itself. The center served: **completion from a point in the field** — context is addressable structure, never a pasted transcript.

Settled in sitting E (2026-08-08/12; [`research/arc/agent-position.md`](research/arc/agent-position.md), UX grounding in [`research/arc/composition-scenes.md`](research/arc/composition-scenes.md), the model-seam rework in [`research/arc/conclusions.md`](research/arc/conclusions.md) §E addendum). This file is the single home for the agent model. The mechanics it stands on live where they belong: process, lifecycle, boundaries, the `run` key and run-to-draft escalation in [`engine.md`](engine.md); the seated argument, slots, citizens, `process-view` in [`programs.md`](programs.md); the type law in [`substrate.md`](substrate.md).

---

## `model` — the provider seam

A family: each provider model is its own program, placed `instance` on the **`model` dimension** — `read([model])` lists the family. The dimension owns the shared vocabulary ([`bootstrap.md`](bootstrap.md)): `model/params`, `model/kind` (`complete` | `embed`), and one canonical **`model/output`** that every provider program declares as its result — the family shares one output shape, or the agent is not decoupled.

```ol
program claude {
  runtime: vm
  accepts: [ selection ]                  — the offered window; the offer is the grant
  result:  ref(model/output)
  read: {}  write: {}  run: {}            — sealed: reads its offer, starts nothing
  capabilities: { net:api.anthropic.com, secret:ANTHROPIC_API_KEY }
}

chunk model/output {
  instance: {
    content?:     markdown                — the reply
    thinking?:    markdown                — the reasoning stream (L1 reads here)
    residue?:     map                     — replay material the provider requires
                                            (e.g. thinking signatures); opaque
    calls:        list<ref>               — ordered refs to the draft processes
                                            composed during the run; [] = none
    stop_reason?: string
    usage:        map
  }
}
```

What makes a program a model program:

- **One call per run; sealed.** Its reach is exactly the offered selection — argument content, implicitly read-granted — and it starts nothing. A completion sees what was offered; there is no path to exfiltrate beyond the offer.
- **In: a selection, rendered inside the program.** No request is assembled anywhere — serialization is deterministic provider code: doctrine → system, places → id-prefixed blocks, offered `[program]` places → tool schemas (the program body plus its payload contracts one hop down, which is why the toolset is offered as *places*), prior outputs and tool exchanges → the provider's replay. **The offer's order is the window's order** (a selection is ordered). Strategy variants are further programs in the family (`claude-compact`), never modes buried in a caller.
- **Out: canonical output plus drafts.** The response is adapted to `model/output` — never raw provider JSON — and each tool call is composed as a **draft process** in the run's own frame, its argument citing its payload chunk, `calls` ordering them. A draft is inert data, so the seal holds: the act is the start, which is never the model's. **Wire identity is field identity** — replays emit tool_use ids as the draft chunk ids; providers need only internal consistency, and a provider strict about original ids keeps them privately as `residue`.
- **Trust is derivation.** The wire request is a deterministic function of (argument, `at`, the versioned provider program) — re-render and compare; a first-class substrate property, stronger than stored bytes. The response is stored canonically because it cannot be re-derived.
- **Egress and secrets concentrate here.** Only model programs (and `web`) hold network capability; secrets are env vars injected from the host keychain at spawn — never chunks: a committed key in a lossless substrate is permanent.

Every completion is enumerable — `read([model, engine/process])` across the family, per-program by intersecting the program — and cost is a read of `usage` keys, not a metering subsystem.

**Streaming.** The program commits `thinking`/`content` to its output as throttled partials (`partial: true`, ~4/s — [`engine.md`](engine.md)), finalized with `calls` complete. When buffers are realized, partials become frames and the digest stays the commit; the agent depends only on a final output chunk and a live partial channel, so nothing here changes with that call.

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
- **Fact** — each model run itself. Its **argument is the exact offered window** — selection-typed, so one link row files per element, and any chunk answers *which windows included me* from its `linked`; its `at` stamps what the offer resolved against. Consumption tagging — retrieval's inverse — is the law working, not a mechanism. The wire request re-renders from (argument, `at`, the versioned provider program); derivation over stored bytes ([`research/arc/object-model.md`](research/arc/object-model.md)).

**Order is structural**: a selection is ordered, and the offer's order is the window's order — composed in the seated argument, visible, rearrangeable. Guidelines-then-thread-then-prompt is the assembler's default of *composition*, not hidden serializer policy; a stable head with the volatile tail last is the composer's cache lever. Context deltas derive by diffing successive runs' arguments — never reported, never trusted.

## The cycle

1. **Orient.** `get` self — argument, the three boundary keys, `at`; one read, no walks. `subscribe([P])` — the steering channel.
2. **Compose the offer.** Flatten what needs flattening — expressions resolve to refs and locs before offering; the model never resolves. **No silent reduction**: everything included renders whole, deduplicated (normalization is lossless — successive cycles share most of their elements, so the union is the shared context once plus each cycle's delta); grades (name · summary · body) apply only where the person specified, the expression says so, or the agent's own guidelines direct it. The offer, in order: doctrine, the window elements, `params`, the toolset as places — and from the second cycle, the prior outputs and each started draft with its result. Filtering, when chosen, is expressible: spine `draft | follow(refs(argument))`; per element `prop(argument) | where(instance: prompt)` and `prop(result)` — prompts and answers only.
3. **Run the model child; `await`.** The child's argument is the offer; its `at` stamps the head it resolves against — the turn sees its own writes, cycle by cycle. **The toolset is the `run` boundary** — one home, capped by the parent's, so a sub-agent can never be handed programs its parent couldn't run.
4. **Act on the drafts.** Read the output's `calls` and start each draft within the walls — child runs: caps intersect, the trace nests, the model can never escalate; parallel calls are parallel starts awaited together. A draft beyond the walls simply rests, awaiting approval (*Escalation*). Substrate ops the model called as tools execute directly through the protocol — no processes; `VALIDATION_ERROR` and `BOUNDARY_VIOLATION` render back as results: **spec enforcement is the model's error signal.** The default toolset exposes `read`/`get` — the model pulls more mid-turn, within the walls, every pull entering the next offer; a pre-fed turn (no read tools) is the deliberate restriction. Loop to 2.
5. **Answer.** A chunk `instance` on `answer`, owned by the turn; streamed as throttled partials, finalized. Mentions ride the `ol:` scheme and file at commit — an answer's citations are queryable from both ends.

One turn, whole, in the field:

```
P  (the turn)              argument: { doctrine, [project,tasks], prompt, params }
 ├─ M1 (claude run)        argument: the offer + [shell], [filesystem]
 │   ├─ O1: model/output   content · thinking · calls: [→D1] · usage
 │   ├─ D1: shell draft    argument: {→p1} — started by the agent; runs; owns result Ra
 │   └─ p1: payload        { command: "cargo test" }
 ├─ M2 (claude run)        argument: the offer + O1 + D1 + Ra
 │   └─ O2: model/output   content · calls: []
 └─ answer                 P's result; streamed, finalized
```

Nothing is copied — every cycle's argument is refs and locs into chunks that exist once; the provider's replay is manufactured at the wire, inside `claude`, from these. A turn with no tool calls is one model run whose argument is exactly the window.

Cycles are sequential; tools within a cycle run parallel; sub-agents are long child runs. Ownership is one hop, so reading the whole trace is a `follow` walk, never one read.

## Escalation — beyond the walls, uniformly

A turn's walls are its three boundary keys. Every tool call already *is* a draft (*`model`*, above): the agent starts the ones within its walls, and one beyond them simply **rests** — auto-surfaced for approval (run-to-draft, [`engine.md`](engine.md)). Escalation is not a path; it is the resting state of a call that could not start. No gate archetype exists; the approval surface is the seated argument every draft already has.

- For acts the agent itself originates, the same shape: compose the draft, relate explanation prose onto it, rest on `await`.
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

*Direction (author, 2026-08-15) — the deliberate fold.* A person may **start a fold** on purpose: a branch opened with the stated intent of being wrapped. Nothing new is needed to open one — it is a draft citing the current turn, like any branch — but the intent makes the wrap a single gesture later: `summarize` over the branch's turns (the span is known — everything since the fork), the summary `relates` on its members, and the main line continues with a draft citing the summary (a merge: one draft citing two). The thread walk then shows the fold as its **summary face** through the ordinary `fold(summaries)` stage ([`programs.md`](programs.md) §3) — context embedded, mechanics one drill away. Wrapping stays optional; an unwrapped fold is just a branch. Not v0.1 scope; recorded because the mechanism already carries it.

## The face

A `reader` whose collation holds the thread walk and the draft's argument — **face follows context**: what you see is what the next turn gets; deviation is marked, never silent (in-whole · in-as-summary · merely-open); reading is free, including is a gesture. Fork and merge render as inline sequence elements with branch TLDR slots; a diamond continues past its join — the line truly continues. UX charted scene-by-scene in [`composition-scenes.md`](research/arc/composition-scenes.md).

The process slot holds ground plus citizens ([`programs.md`](programs.md) §5): the turn face, and the agent's shipped **context overview** — how the argument maps to the actual window: which elements, deduped how, rendered at what grade. It matches the process itself (`accepts: [ref(agent)]` — the renderer ladder), reading the turn's argument and its model runs' offers; manual control of context is real only because this surface exists.

Turn rendering across the lifecycle is `process-view`'s: draft → the seated argument · running → the live frame with **derived status** (computed from children and commits; it cannot lie) · done → prompt + answer, mechanics folded, one drill away. Thinking in three layers: L0 derived status · L1 streamed thinking (the partial channel) · L2 `narrate`.

## Seeds

What bootstrap ships for the agents project: the `agent` program; the **`model` dimension** with its shared vocabulary — `model/output`, `model/params`, `model/kind` (`complete`, `embed`) — and one program chunk per provider (`claude`), placed `instance` on `model`; archetypes `prompt`, `agent/settings`, `agent/answer`, `control` with its signal value chunks. Nothing else — no session archetype, no conversation container, no gate, no context archetype, no request archetype.

## Open — deliberate

- **Mixed human–human threads** — message-shaped discourse between people; settles when the second discourse kind is built.
- **The second provider** — tests `model/output` and the serialization conventions rather than creates them; provider-unique needs land as `params` passthrough and output `residue` until they earn shared keys.
- **Harness decomposition** — assembler, tool runner as separate programs the agent composes; likely, not yet forced.
- **Selection policy under budget** — what the assembler chooses is agent code and the live research frontier of completion-from-place; the record makes every policy auditable.
