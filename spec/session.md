# Threads — The Session Dissolved (Experience Spec)

The lived experience of agent work: watching it, steering it, trusting it. This file's previous model (an agent session as a `conversation`-typed container of turns) is **superseded by the dissolution** (adopted; reasoning record: `research/threads-dialog.md`): there is no container. Mechanics ground: [`agent.md`](agent.md) (context/thread, the cycle), [`engine.md`](engine.md) (drafts, the lifecycle), [`programs.md`](programs.md) §2 (`form`), §3 (`reader`, readings, collation), §6 (`process-view`). The file keeps its name until the rename ruling (*thread* over *session*, tentative) is taken; the content is thread-model throughout.

---

## 1. Content model — a thread is derived

**Turns are agent processes; the thread is the lineage of citation.** Turn B follows turn A iff B's argument cited A (context provenance, recorded on frames). The thread is computed by the `follow` walk — never stored, never a container. Branching is two turns citing one predecessor; merging is one turn citing two lineages; the shape is git one level up (turns as commits, citations as parents, names as refs). Context is not transitive: each turn sees exactly its recorded list; the chain works by per-turn compression — each answer distills what its turn saw, and that is all the next inherits.

**The draft is in the thread.** The next turn exists as a draft process ([`engine.md`](engine.md), *Lifecycle*) whose argument cites the last answer — so the walk finds it and it renders at the thread's end. Its prompt and context are composed in the field (no in-memory state); dispatch consumes.

**A conversation is a named location.** Naming, sharing, binding readers to, or inviting participants into a lineage materializes a location chunk; participants attach there as relations. Until then, the thread exists only as the walk.

**What else exists**: summary chunks (placed on the turns they abstract — the shared chunk *is* the group; a fold routes the lineage through the summary) and controls (`relates` on the turn they steer).

*Open:* mixed human–human threads (message-shaped discourse between people) — settles when the second kind is built. *Open:* whether a pending gate is also surfaced into the thread mid-turn, or stays frame-only (either way it penetrates folds — §3).

## 2. The view — a composition, not a program

The thread view is: **a `reader`** whose collation holds the thread (`follow` from the draft) and the draft's context — **`sequence` holding the ground**, slotting each element through `process-view` — with the **`form`** filling the draft's argument region at the bottom. No conversation tile exists as a thing to build — it is the reader chrome plus surfaces (`sequence`, `process-view`, `form`, `prose`) composed.

**Face follows context** (ruled — the resting default). The thread renders as what the next turn will see: the draft's context is a location in the collation, so the face is the assembler's proposal, honest by construction. **Reading is free; including is a gesture** — expanding folds, drilling frames, wandering into referenced threads feeds the agent nothing; staging writes into the draft's context (scope algebra: union a location in), from any tile with the grant. Every element wears its inclusion state (per-location slot chrome): in-whole, in-as-summary, merely-open. Deviation between face and context is marked, never silent. The discourse register — everything that ever happened here — is a location switch away.

## 3. The turn, rendered — process-view's derived faces

One program over the lifecycle (`programs.md` §6): **draft → the form · running → the live frame · done → prompt + answer**. The agent-matched depth (a process is `instance` of its program — the renderer ladder carries the specialization):

**Folded — the line form** (the thread's default reading):
```
▸ [prompt digest]                    [live status]        [⚠ gate?] [⏸] [time]
```
The live status is **derived, never reported**: from the frame subscription — a running `model` child → *thinking… (Ns)*, or the streamed thinking's current line; a running `filesystem` child → *reading design/backoff.md* (from its argument); `shell` → the command; recent `db/commits ∩ P` → *writing to plan/retry*; a pending gate → *waiting on you*. Obligations penetrate the fold, always.

**Expanded — the thread of reasoning**, top to bottom:

1. **The prompt** (the invocation's argument), with the context as chips — each drillable to what was included, at which commit, at which projection; the recorded *expression* beside the resolved items (intent and fact, [`agent.md`](agent.md)).
2. **Cycle segments**, one per model call, in order: the reasoning (thinking folded by default; live pane while streaming); the tool cluster (parallel runs grouped, each through its own renderer, each drillable); the **mutation strip** — an attribute slot (`el → intersect(commits)`, `programs.md` §3): what P committed since the last segment, one press from `review`; **context deltas** — every mid-turn expansion a visible, boundary-checked event.
3. **Gates**, inline, approve/deny where they occurred — permanent history once decided.
4. **The answer**, streaming in place (partial commits), finalized — rendered by `prose`: `ol:` references through the ladder, so an answer carries live structure (a cited finding as itself, an edit as its diff); an answer may be a sequence of prose and typed chunks (the fractal, `programs.md` §4).
5. **Controls** throughout: pause (halts before the next cycle; the primary gesture of skepticism), resume, abort-completion, adjust (the distilled correction — context purity: meta-discussion never enters, only what you hand it), cancel. Verbs: *review changes*, *re-run*, *inspect raw*.

**Minimized — the widget**: the derived status line as data (a projection of the frame), pause/play carried on it.

## 4. Seeing the thinking — three layers, degrading gracefully

- **L0 — derived status** (works even fully buffered): computed from frame children and commits. It cannot lie and costs two subscriptions.
- **L1 — streamed thinking** (pulled forward, ruled): extended thinking streams — the `model` program commits throttled deltas into its output chunk; the partial-commit convention (engine.md, *Streaming convention*) is the entire pipe. Raw thinking is long and exploratory — right as a depth pane, wrong as primary display; frontier providers already summarize server-side. The newest fragment feeds L0's status line free.
- **L2 — narration**: `narrate` over the turn or thread — calibrated abstraction at the person's altitude, compressing across cycles, entities as pressable chrome, feeding the folds. The calm default reading; depth always one press beneath. Live narration is itself model calls — a knob, not a blocker. Direction: a first-class default view mode, grown into.

## 5. Order and parallelism

Cycles are strictly sequential; tools within a cycle run parallel when the model emits several calls; sub-agents are long tool runs, rendered recursively. One active turn per thread is a *policy* of the draft's dispatch, not a mechanism — nothing structural forbids parallel turns (they are just two drafts citing the same predecessor: a branch).

## 6. What v0.1 implements, in order

Aligned with the board's build queue:

1. **`reader` v0** — the collation over the built intersection grammar; members side by side; slot chrome; hide/show.
2. **`draft` + `form`** — the draft state; the form on any unconsumed argument; dispatch as consumption.
3. **`process-view` v0** — the three regions, result by declared archetype; folded line with derived status (L0).
4. **`prose` v0** — mentions as links; answer streaming in place.
5. **`follow` + the thread face** — the walk as a member; the draft at the bottom; face-follows-context, inclusion via slot chrome.
6. **Streamed thinking (L1)** via the model program — early, not deferred. Then gates, context deltas, attribute slots (the mutation strip), shipped collations.
7. **`narrate` + summary folds (L2).**

Each step is demonstrable alone; where one can't reach this spec with the mechanisms as specced, that lands in the demand ledger, not in silence.

## 7. Conventions and edges

- **A completed turn's resting form is prompt + answer visible, mechanics folded** — a thread of resting turns reads as a conversation, not a list of digests.
- **Defaults live in the field**: standing boundary defaults, toolset, model choice, guidelines reference — chunks `relates` on the named location (project-level defaults on the project root); the form reads them, the person edits them.
- **Controls carry a `target`** (the turn's process id). Signals: `pause`, `resume`, `abort-completion` (stop the current model call, keep the turn alive), `adjust` — rendered as an instruction block in the next request; recorded on the frame as a context delta.
- **Entity mentions**: the `ol:` scheme (`<ol:id>` badge, `[name](ol:id)` link — `programs.md` §4); the request preamble teaches the model the convention, and every mention files into the link index at commit.
- **"Include the thread" default**: the default assembler walks the lineage — recent turns at full projection, older through their summary groups; an assembler-policy knob, not a mechanism. Swapping or parameterizing the assembler *is* the thread's defining act, not a violation of it.
- **Failure is a first-class resting form**: a failed turn shows its error, its mutation strip, *retry* (re-run, pre-filled), *review changes*. Nothing hides. An abandoned draft rests visibly — unsent thought; nothing auto-sweeps.
- **Cost is visible**: usage sits on every model output chunk; the resting turn shows its tokens; a thread's total is a walk. A read, not a metering system.
- **Stale-display**: an argument whose referenced chunk has since moved renders as-it-was, marked (`programs.md` §6).
- *Open:* removing a past turn from a lineage's default face (exclusion is a location edit — lossless, recoverable) and what it means for later reconstruction — deferred until real use demands it.
