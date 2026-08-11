# The Agent, Re-derived — position paper for sitting E

Steward position, 2026-08-08. **No author ruling in here** — this is the re-derivation the worklist's E demands, written before dialog, skeptical of the standing plan by instruction. It stands on substrate.md, engine.md and programs.md as law; agent.md's own stale-claims list (its header) is the checklist this paper must clear, and §10 clears it item by item. Nothing folds into the specs until the sitting rules; the batch executes from what the sitting settles.

The stance taken throughout: **the agent should need no mechanism of its own.** Every piece of the old model is put to one test — does the law already carry this? Where it does, the agent-specific structure dies. The result is a model that got *smaller* under the rewritten law, not patched to fit it.

---

## 1. The identification that reorganizes everything: the context is the argument

A turn is one run of `agent` — a process. The law already gives a process everything the old context machinery built by hand:

- a body field `argument: selection` — a set of `loc | ref | expr`, **frozen at start** (engine.md, *The process*);
- a **draft** state in which that field is ordinary field data, editable iff unconsumed, written by whoever holds the grant, seated element-by-element (engine.md *Lifecycle*; programs.md §2);
- **implicit read over argument content** — the offer is the grant (boundary source 2);
- `at` — the branch head stamped at start.

The old model ran a second structure beside this: context as "an ordered list of places," composed into a context chunk with per-item chunks, recorded as expression + resolution. **Position: the second structure dies. The turn's context *is* the turn's argument.**

```ol
program agent {
  runtime: vm
  accepts: [ selection ]      — the content mouth; the offered set, whole, is the context
  result:  ref(answer)
}                             — read/write absent: intrinsically open; the run grant
                                is the person's whole decision, shown as chips before Go
```

A selection mouth consumes the entire offered set (the containment rule makes it the contract's only entry), so the argument is literally the context: the prompt is an element (a prose chunk), guidelines a `loc`, the thread a `follow`-shaped `expr`, a staged document a `ref`. Composition *is* context staging — place algebra on the draft's argument, from any tile with the grant, exactly as the seated argument already works. A headless run is a draft started with no one watching. **"Talk about this" is creating a draft whose argument cites the thing** — unchanged, and now mechanism-free.

What this costs, stated plainly: the match validates no structure — `accepts: [selection]` admits any set, so there is no required prompt entry and no typed slot for turn settings (model choice, toolset). The agent classifies elements by archetype, and settings default from the field (chunks `relates` on the named location — the old convention, minus the root cascade it wrongly assumed). A turn with no prompt is legal; that is what a delegated task is.

What dies with the identification:

- **The context chunk and context items** — including the `context item owned by <context chunk> (seq)` shape the checklist flags as illegal (nothing declares `seq: true`). Nothing replaces them; §2 shows the record they carried is already carried elsewhere.
- **"An ordered list of places."** A selection is a set. Order is not context structure; it is **serialization policy** — the assembler renders guidelines before thread before prompt as a *default*, recorded in the request it produces. E5's softening, taken all the way.
- **Boundary chunks walked to roots.** A turn's reach is the two selection-typed keys on its body, read in one hop.
- **The "argument archetype's instance contract"** phrase and everything downstream of it.

## 2. Intent and fact, re-grounded (E6)

The old model recorded context twice — expression (intent) and resolution (fact) — and it was right to. Both records survive; both relocate onto structure the law already owns.

**Intent** is the argument expression, frozen on the process body at start. Its `expr` chunks file mentions from their own grain (`P →argument→ E →mentions→ places`), so "which turns cite this place in their context expression" is a link-index answer already.

**Fact** is each cycle's model request. The request is a payload chunk, composed by the agent into its own frame, offered as the model child's argument, frozen at the child's start:

```ol
chunk model/request {
  instance: {
    kind:     ref(kind)            — complete | embed as value chunks (E7, §4)
    model:    string
    at:       ref(commit)          — the head this cycle's context resolved against
    includes: set<ref>             — every chunk rendered into the window
    body:     map                  — messages, tools, params — provider-shaped (§4)
  }
}
```

`includes` is the load-bearing move, inherited from the context items and made cheaper: **typed field links, one row per element**, filed at commit by ordinary substrate law. Any chunk answers *which model requests have included me* from its `linked` — consumption tagging, retrieval's inverse, both ends boundary-gated, with **no context-item machinery at all**. The old `projection: body | summary | name` metadata dissolves: the request contains what was rendered, so the render *is* the record.

**E6, the plain paragraph.** What is recorded: the argument expression and `at` on the turn's body (intent, and the start snapshot); per cycle, a request chunk carrying the commit its reads resolved against and refs to everything included (fact). What is cached: nothing agent-specific — the planner memoizes pure chains on `(expression, boundary, commit)`, so re-resolving an unchanged context is a cache hit. What the program receives: locs, refs and expr-chunk refs, which it hands to `resolve` — programs never interpret expressions. The agent resolves **at head, each cycle, deliberately** — the SDK's living-head mode, chosen because the turn must see its own tool writes; the reader following its reading and the agent following its own work are the same gesture. Reproducing a completion needs no re-resolution — the request is byte-exact. Auditing the *choice* is diffing intent against fact: expression versus `includes`, both recorded.

**Context deltas are derived, not reported**: diff cycle N's `includes` against cycle N−1's plus the recorded deltas of §7. A claim the renderer computes and the agent cannot fake.

## 3. The cycle under law

1. **Orient.** `get` self: argument, `read`/`write`, `at` — one read, no walks. `subscribe([P])` — the steering channel; controls and decisions arrive as placements onto the turn (§6, §8).
2. **Assemble.** `resolve` the argument's terms; probe with body-less reads, then pull under budget. **Counts describe what the boundary admits — which is exactly what the agent may include**, so probe-then-pull survives with honest numbers; the old text's "full set" guarantee was never the one this step needed. Selection policy is agent code; the record of selection is the request (§2).
3. **Complete.** Commit the request chunk (frame); `run` the model program (child); `await`. Tool schemas compile from the toolset programs' reified `accepts` entries — the same data the seated argument renders.
4. **Act.** Substrate ops execute directly — `VALIDATION_ERROR` and `BOUNDARY_VIOLATION` render back as tool results; **spec enforcement is the model's error signal.** (Named honestly: the standing existence-oracle open reaches the model's surface here — empty versus violation discloses existence beyond the boundary. Same open, one more consumer.) Program tools are child runs — trace nested by ownership, caps intersected, the model can never escalate; parallel calls are parallel runs awaited together. Loop to 2.
5. **Answer.** The result: a chunk `instance` on `answer`, owned by the turn, streamed as throttled partials, finalized `partial: false`. Mentions ride the `ol:` scheme and file at commit — an answer's citations are queryable from both ends.

Cycles are sequential; the trace is the frame; nothing discourse-shaped is written anywhere. Reading the whole trace is a `follow`-shaped expression — the one-hop law, honored where the old text promised `read([P])` returned nested tool frames.

## 4. The model family under law

The split survives re-derivation untouched: **`model` is the only kind of program that touches a provider; one completion call per run.** The invariants, restated against the law:

- **Frame-only, enforced.** `read: {}` / `write: {}` — the verbatim request is all a completion sees; no path to exfiltrate beyond what the caller rendered. This is *containment*, not purity — `net` and `secret:*` capabilities make every model program impure by the second leg of the purity predicate, correctly: a completion is a world-effect.
- **The verbatim request is the artifact** — the request chunk, frozen as the model process's argument. Unchanged.
- **Output lands in the frame**, `instance` on the program's result archetype. **Position: the per-model derivation place (`model/<name>`) is dropped.** A process is already `instance` on its program, so every completion is enumerable as `read([<model-program>, engine/process])` — and per-model within a multi-model provider program is a `where` over the request's `model` key. The old placement was the enumeration built by hand; the law builds it. (It was also `instance` only because a frame-only program *cannot* place `relates` anywhere — worth recording: instance-as-claim is the one placement a frame-only program has beyond its frame, which is exactly why results work at all.)
- **Egress and secrets concentrate here.** Unchanged; provider-enforced at spawn; never chunks.
- **E7: `kind` is the substrate's own enum** — `complete` and `embed` as value chunks under the request archetype's `kind`, no string vocabulary in a contract.

**Adapter leaning unchanged**: the family shares a canonical request archetype; each provider program maps canonical → provider inside itself, provider-unique features as documented passthrough keys. Settled against the second provider actually built, not before.

## 5. The stream and the buffer

The agent model must not depend on the buffer realization (open between the driver registry and dissolution into integrations). Its dependency surface is two things, both realization-independent:

- **the final output chunk** — substrate, always, the digest-commit; and
- **a live channel for partials** — today the streaming convention (throttled partial commits on the model's output chunk, ≤4/s, coalesced); taps on a buffer when buffers land, with partials becoming frames and the digest staying the commit.

Streamed thinking (L1) rides whichever channel exists — the model program forwards throttled deltas; the turn renderer subscribes or taps. L0's derived status needs neither: it is computed from frame children and commits and cannot lie. Nothing in the agent's code changes when the realization is chosen; that is the posture selection.md §14 already fixed, applied.

## 6. Steering — controls as chunks (E3)

Why a `control` chunk rather than the process owning start/stop — the steward's take, the author's idea invited on top:

- **Only the program knows its seams.** Pause is meaningful *between cycles*; an engine-level stop would freeze mid-completion, mid-commit, mid-await. A signal honored at the seam is a program-level fact, so it belongs in the program's medium — the field.
- **The write is the audit.** A control is a commit: who steered, when, with what — permanent history, no side channel. Process-owned stop would be an engine verb with engine-grade logging invented beside it.
- **Governance falls out of placement law.** A control lands `relates` on the turn — write over the turn-as-dimension *is* the steering permission. Who may pause = who may write there. No new authority model.
- **It generalizes.** Any cycle-driven program honors the same archetype the same way; engine.md already holds the promotion rule — an engine op only if the convention proves general.

Signals: `pause` · `resume` · `abort-completion` (the agent cancels its own in-flight model child — `cancel` is already authorized over descendants; the control carries the *intent* that the turn survives the abort) · `adjust` (a distilled correction, rendered as an instruction block in the next request, recorded — a §7 delta). `cancel` on the turn itself stays the engine's, for killing.

## 7. Pause and context purity, made precise (E4)

The claim, stated checkably: **cycle N+1's request is a function of the argument expression resolved at head, plus an exhaustively enumerable delta set.** The deltas:

1. `adjust` controls related on the turn since cycle N — each rendered as an instruction block, each a commit;
2. membership changes *within the frozen expression* — the law's own frozen-expression-live-membership: a chunk placed onto a dimension the argument names (the turn itself included — placing onto `[P]` is handing the turn something) arrives without any boundary event;
3. nothing else.

Purity is then **auditable, not promised**: diff the requests, subtract the recorded deltas; a residue is a violation. Meta-discussion during a pause lives in *other* turns — drafts citing the paused one — which the paused turn's expression does not reach. What crosses is only what someone deliberately hands over: an `adjust`, or a placement into the argument's region. Conventional harnesses swallow the intervening transcript because context accumulates in memory; here context is re-assembled from the field each cycle, so steering and polluting are structurally separate acts. That sentence is the whole discipline; the delta list above is what makes it precise enough to test.

## 8. Gates (E2)

**Honesty first: a gate is cooperative, not a wall.** The gate is the agent's own policy halting itself; a turn's *walls* are its boundary and its capabilities, enforced regardless. The gate chunk sits in the agent's frame, where the agent holds write — it could forge its own approval, and no rule here prevents that, because none needs to: an agent that would forge approvals would not gate. The gate's enforced value is the **record** — the question, the decision, and who made it are commits, attributed to process identity, unforgeable in history. Say this in the spec rather than implying enforcement that isn't there.

Two forms, by what is being asked:

- **Action gates are held drafts.** "May I run this?" is a pending tool run — so compose it as one: a **draft child process**, argument seated, boundary chips and capability line visible, rendered by `process-view` with zero gate-specific chrome. **Approve is starting the draft; deny is deleting it** (or an `adjust` explaining why). E2's constraint — no agent-authored custom surface — is satisfied by construction: the approval surface is the seated argument, which already exists for every draft in the system.
- **Question gates** — "is this plan right?" — have no process to hold. A `gate` chunk on the frame: body carries the question and a ref to what it concerns; the first-party renderer (the agent-matched depth of `process-view`) offers approve/deny; the decision is a body update or a related decision chunk, distinguished by commit attribution. Policy for when to fire lives in the field — chunks `relates` on the toolset or the named location, read by the agent, edited by the person.

**Mid-turn reach expansion is not a gate — it is a placement.** A running turn's boundary is frozen and protected; nothing may widen it, the person included. The legal channel is the one §7 names: live membership through the frozen expression. Handing the turn a chunk mid-run is placing it into a dimension the argument already names — onto the turn itself, at minimum — visible as a context delta at the next cycle. Reach expansion in the strong sense (a new region of the field) genuinely requires a new turn, and should: the run grant is the person's decision, made once, before Go.

**One cap question the held-draft form surfaces, for the sitting**: when a *person* starts an agent-composed draft, boundary source 5 is the starter's reach — the person's, wider than the composing agent's. The tool's stated ceiling and the staged grants still bound the run, but the parent cap that would have applied had the agent started it does not. Should a consumed draft carry its composer's reach as the cap rather than its starter's? Undecided here; named.

## 9. The thread, derived — and the face

The thread survives re-derivation and gets cheaper. A citation is a `ref` element in a draft's argument; selection-typed body keys file **one link row per ref element**, so "which turns cite me" is a `linked` answer on any answer chunk, and **the thread is `follow` over argument links** — computed, never stored. Branching is two drafts citing one answer; merging is one draft citing two; a conversation is a named location, materialized only when named, shared, bound or peopled. All ruled, all standing.

The face: a `reader` whose collation holds the thread walk and the draft's argument. **The board's open — agent contexts as selections, what the face does with N-source contexts — is answered by the identification of §1**: a context *is* a selection, a collation is `list<selection>`, so the thread face holds the draft's context natively and renders it the way it renders any selection — per-location slot chrome carrying inclusion state, face follows context, deviation marked. Piped contexts (`follow | fold(…)` routing through self-written summaries) are just expression elements; the reader already renders expressions. No new face machinery.

Turn rendering is unchanged in shape — `process-view`'s derived faces, the agent-matched depth via the renderer ladder, L0 status derived from frame and commits — and its claims now sit on legal reads (children one hop; the call tree an explicit `follow`).

## 10. The stale-claims checklist, cleared

agent.md's header names eight claims the law contradicts. Each, answered:

| Stale claim | Resolution here |
|---|---|
| `read([P])` returns nested tool frames | One hop; the call tree is a `follow` expression (§3.5, §9) |
| Boundary chunks walked to roots | Two selection keys on the body, one `get` (§3.1) |
| Frame language predating `[self]` | Frame = the process's own dimension throughout (§1, §3) |
| `context item owned … (seq)` illegal | Context items dissolved entirely (§1, §2) |
| "Probe counts, then pull" on the dead guarantee | Survives on boundary-admitted counts — the guarantee it actually needed (§3.2) |
| "An ordered list of places" | The `selection` type; order is serialization policy (§1) |
| "Argument archetype's instance contract" | `accepts: [selection]`; the phrase dies (§1) |
| Project-root defaults cascade | Defaults `relates` on the named location; nothing cascades (§1) |

Riding folds (E7): **summaries are de-specialized** — a summary is a chunk `relates` on what it abstracts (substrate's derived-data law, already stated there); a fold routing a lineage through it is a pipe; the assembler's include-the-thread default routes old turns through summary groups as *policy*. No agent-owned summary mechanism remains to spec. **`kind` as enum** — §4.

## 11. What this asks of the rest of the tree

Almost nothing, which is the position's strongest evidence:

- **No engine change.** Drafts, the match, child runs, `await` on processes one didn't start, `RunTarget::Draft`, subscriptions firing on placements onto a place — all standing law. The one open it *sharpens* is the consumed-draft cap (§8).
- **No db or SDK change.** Selection-typed keys already file per-element links; `resolve` and living-head resolution already exist.
- **Bootstrap unblocks.** The agent seeds are: the `agent` and `model` program chunks, `answer`, `model/request` (+ `kind` values) and `model/output`, `control` (+ signal values), `gate`. No session archetype, no context archetype, no conversation container — the marker in bootstrap.md fills with six small declarations.
- **agent.md rewrites smaller than it stands** — the mechanics compress into what §§1–8 carry; the experience half (thread view, rendered turn, L0/L1/L2, conventions) survives with its reads corrected.

The naming-rule collision (a chunk with members must have a name; processes are nameless and own children) is not created here but is aggravated: every turn owns chunks. Carried as the standing open it already is.

## 12. Questions for the sitting

1. **The identification itself** (§1): context = argument, `accepts: [selection]`, no context structure. The paper's spine; everything else adjusts if this is refused.
2. **Request-as-fact** (§2): `includes: set<ref>` + `at` on the request, context items dissolved. Anything the item shape recorded that this loses?
3. **Ordering as serialization policy** (§1, §2) — is order ever *meaning* the record must keep?
4. **Gates as held drafts + the cooperative-not-wall statement** (§8) — and the consumed-draft cap.
5. **Controls as chunks** (§6) — the steward's take is written; the author's idea is owed on top of it.
6. **The purity delta list** (§7) — is the enumeration complete?
7. **Dropping the per-model derivation place** (§4).
8. **Mid-turn hand-over as placement onto `[P]`** (§7, §8) — comfortable with the turn itself as the staging dimension?
