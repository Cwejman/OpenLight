# The Agent Session — Experience Spec

The session experience, specced before implementation. This is where the system's value is felt or lost: watching an agent work, steering it, trusting it. Settled mechanics are stated plainly; what remains open is marked in place. Mechanics ground: [`agent.md`](agent.md) (turn anatomy, context/discourse), [`programs.md`](programs.md) §3.5–3.6 (citizens, slots, matching).

---

## 1. Content model — a session is turns

An agent session is an ordered scope (`conversation` instance) whose entities are **turns**: each turn is the agent invocation itself — the process chunk, dual-placed onto the session with seq at dispatch. **The prompt is an argument on the invocation** (it always was); **the answer is a chunk on the frame**, streamed by partial commits. Nothing else accumulates: no message events, no tool events, no context events — the frame carries all mechanics, the session is the sequence of work.

Also placeable (content stays wildcard): **summary chunks** (placed on the turns they abstract — the group *is* the summary chunk), dropped-in entities (a file reference, an email thread — context material made visible), and `control` chunks (pause / resume / adjust — the steering channel).

*Open:* mixed conversations (humans + agent) still want `message` events — whether agent-session and human-conversation are one archetype with different content, or two container types, settles when the second kind is built. *Open:* whether a pending gate is also placed onto the session mid-turn, or stays frame-only (author leans possible; either way it penetrates folds — §3.4).

## 2. The session view

Derived, per the citizen mechanics: **reader** holds the ground in sequence mode (tail-follow); the **dispatcher** docks (matched on the session type — and only on it: the answer-home rule); the **citizen stack** sits in the corner (narrate, manager; minimized forms are data). The v0.1 census: reader, dispatcher, turn renderer, fallback renderer, trivial stack. Everything else additive.

## 3. The turn renderer

The specialized entity interface for agent processes (matched because a process is `instance` of its program — the generic invocation renderer stays the floor for every other program). It has the standard citizen states:

**Folded — the line form** (the session's default reading):
```
▸ [prompt digest]                    [live status]        [⚠ gate?] [⏸] [time]
```
The live status is **derived, never reported**: from the frame subscription — a running `model` child → *thinking… (Ns)*, or the streamed thinking's current line; a running `filesystem` child → *reading design/backoff.md* (from its argument); `shell` → the command; recent `db/commits ∩ P` → *writing to plan/retry*; a pending gate → *waiting on you*. Obligations (gates) penetrate the fold, always.

**Expanded — the thread of reasoning**, top to bottom:

1. **The prompt** (the invocation's argument), with the pinned context collection as chips — each chip drillable to what was included, at which commit, at which projection (full / summary / name).
2. **Cycle segments**, one per model call, in order:
   - the reasoning: thinking (folded by default — expandable to the blocks; live pane while streaming) and the between-tools text;
   - the tool cluster: this cycle's runs, parallel ones grouped side by side, each rendered by its own renderer (result renderers when they exist; the invocation floor otherwise), each drillable to its own frame;
   - the **mutation strip**: what P committed since the last segment — *wrote 3 chunks to plan/retry* — one press from `review`;
   - **context deltas**: *+ added `design/backoff` to context* — every mid-turn expansion a visible, boundary-checked event. The pinned set is immutable; growth is audited, never silent.
3. **Gates**, inline, approve/deny where they occurred — permanent history once decided.
4. **The answer**, streaming in place (partial commits), finalized with refs rendered as inline entity mentions.
5. **Controls** throughout: pause (halts before the next cycle; the primary gesture of skepticism), resume, adjust (the distilled correction — context purity: the meta-discussion never enters, only what you hand it), cancel. Verbs: *review changes*, *re-run*, *inspect raw*.

**Minimized — the widget**: the derived status line as data (a projection of the frame), pause/play carried on it.

## 4. Seeing the thinking — three layers, degrading gracefully

The experience this system should win on: knowing what is going on, at the altitude you choose.

- **L0 — derived status** (works even fully buffered): the status line computed from frame children and commits. It cannot lie and costs two subscriptions.
- **L1 — streamed thinking** (pull-forward recommendation): extended thinking happens server-side but **streams** — tokens arrive as generated. The `model` program streams from the provider and commits throttled deltas into its output chunk; the R6 partial-commit convention is already the entire pipe — no new mechanism, one program's behavior. The pilot's "agent loop buffers" stance should yield here: this layer is the felt difference. Facts that shape it: **raw thinking is very long** — routinely several times the final answer, exploratory and self-correcting — right as a depth pane (folded by default, opened in skepticism), wrong as a primary display; and current frontier providers already summarize server-side (Claude 4: summarized thinking, billed raw; OpenAI reasoning models: summaries only) — so L1's stream is often already a generic summary. Signed/redacted blocks passed back during tool loops are the model program's job, per the adapter shape. Free upgrade: the newest thinking fragment feeds L0's status line ("thinking about the retry invariants…") at no narration cost.
- **L2 — narration**: `narrate` over the turn or session — what no provider gives: **calibrated** abstraction. One evolving picture at the person's altitude, compressing across cycles and tool calls (not merely within one completion), with entities and moments as pressable chrome, feeding the folds. The calm default reading; depth always one press beneath. Honest cost: live narration is itself model calls — a small cheap model on a throttle; on-demand vs always-on is a knob, not a blocker. Direction (`programs.md` §3.7): narration grows into a calibrated first-class default view mode.

## 5. Order and parallelism

Cycles are strictly sequential — each completion needs the previous results. Tools *within* a cycle run in parallel when the model emits several calls; the renderer clusters them. Sub-agents are long tool runs, rendered recursively. One active turn per session is the default *policy* (the dispatcher's), not a mechanism — nothing structural forbids parallel turns; the UX decides when to allow them.

## 6. What v0.1 implements, in order

1. Reader in sequence mode over a session of turn entities; fallback renderer.
2. The dispatcher: input row + pinned context composer + boundary chips; detached launch placing the process onto the session.
3. The turn renderer: folded line with derived status (L0); expanded thread (prompt, cycles, mutation strips, answer); pause/cancel.
4. Streamed thinking (L1) via the model program — early, not deferred.
5. Gates; context deltas; selection highlight (the dispatcher's standing selection as a field entity the reader badges from).
6. `narrate` + summary folds (L2).

Each step is demonstrable on its own; the experience compounds. Where a step can't reach this spec with the mechanisms as specced, that lands in the demand ledger, not in silence.

## 7. Conventions and edges

Small answers an implementer needs; none of them architectural.

- **A completed turn's resting form is prompt + answer visible, mechanics folded** — a session of resting turns reads as a conversation, not a list of prompt digests.
- **Session defaults live in the field**: the standing boundary template, toolset, model choice, and guidelines reference are chunks `relates` on the session (project-level defaults on the project root); the dispatcher reads them, the person edits them.
- **Controls carry a `target`** (the turn's process id), defaulting to the active turn. Signals: `pause`, `resume`, `abort-completion` (stop the current model call, keep the turn alive — the middle gesture between pause and cancel), `adjust`.
- **`adjust` mechanics**: rendered as an instruction block in the next request; recorded on the frame as a context delta — audited like any context growth.
- **Entity mentions**: answers reference entities as `[[chunk-id]]`; the renderer resolves them to inline representations; the request preamble teaches the model the convention.
- **"Include the session" default**: last N turns at full projection, older turns through their summaries — a dispatcher policy knob, not a mechanism.
- **Failure is a first-class resting form**: a failed turn shows its error, its mutation strip (commits persist — lossless), and *retry* (re-run, pre-filled) and *review changes* affordances. Nothing hides.
- **Cost is visible**: usage sits on every model output chunk; the resting turn shows its tokens, the session its total. A read, not a metering system.
- *Open:* removing a past turn from the session (placement removal — lossless, recoverable) and what it means for later context reconstruction — deferred until real use demands it.
