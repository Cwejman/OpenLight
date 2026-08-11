# Composition scenes — charting how agent work is navigated and composed

Working map for sitting E, 2026-08-10. **Nothing here is ruled.** The purpose is comprehension: each scene is a concrete situation a person is in, what they see, what the agent's context is, and the question the scene holds. Built in dialog; scenes get attacked one at a time and rewritten as understanding lands.

Two dials ground every scene (established earlier in the dialog, carried here as the frame):

- **Offer shape** — what an inclusion points at: `X` (the chunk alone) · `[X]` (the chunk and its one-hop room) · an expression (exactly its yield). Nothing ships implicitly.
- **Render grade** — how deep an included thing serializes: name · summary · body.

And one distinction every scene turns on: **two edit targets.** Editing the *reading's collation* changes what you see. Editing the *draft's argument* changes what the agent gets. Same gesture family, different targets; face-follows-context means they usually coincide, and every scene where they don't must mark it.

---

## S1 — The plain dialogue

One line of turns, draft at the end. The reading's collation holds the same follow expression the draft's argument holds: **what you see is what the agent comprehends.** Scroll up = walk the lineage. The resting default; everything else is a deviation from this.

*Holds no open question — the base case the others are measured against.*

## S2 — Walking up past structure

Backward from the draft, the walk is deterministic — each turn cites its predecessors. Two different things can be met:

**S2a — a fork someone else made.** At T2, another child T3′ exists (a sibling line departed here). The backward walk never sees it — forks are *inbound* structure. If the face shows it at all, it is chrome: a badge on T2 ("another line departs here"), press to peek or switch.
*Question: is fork chrome default-on, or a location setting? The inbound read has a cost and a curiosity value; both are real.*

**S2b — a merge in your own lineage.** Your T6 cites two parents. The walk itself forks going up. Two cases, and they render differently (author correction, 2026-08-11):

- **A diamond** — the lines share a fork a few turns up (parallel run, merged back). Stopping the scroll at the merge is *false*: the line genuinely continues above the fork. Render the diamond **inline as sequence elements**: the merge element, the branches as small TLDR slots between it and the fork element, the common line continuing above. Selecting a branch TLDR expands it — or the focused branch renders full-view embedded in the fork element.
- **A true merge** of unrelated lines (no common ancestor in the walk): here stop-and-choose stands — press the merge to choose which line to continue up. A side-by-side split view stays a possibility, left open; fork/merge elements come first.

*Question: how far up the walk searches for a join before treating it as a true merge (a depth/cost knob); whether branch choice persists as a collation setting.*

## S3 — The cap

The session was born from two long prior sessions; you do not want to scroll into them, and the agent's context should not walk into them either. The follow expression carries a stop — depth-n, or *until a selected process* (follow-until-X). Draft and reading share the capped expression: face = context still holds.

The cap renders as an **edge**: "continues beyond — press to extend."
*Question: what extending does — edit the reading only (S4 deviation), or offer to restage the draft too? And: is `until` a follow parameter or a subtraction composed around it? (Spec-level; parked to the follow drafting note.)*

## S4 — Looking further than the agent

You extend your view beyond the cap, or open a side place the context doesn't hold. Now **face ≠ context, and the law requires the deviation marked**: every element wears its inclusion state — in-whole · in-as-summary · merely-open. The turns beyond the cap render *merely-open*; one press unions them into the draft's argument if wanted.

Reading is free; including is a gesture. This scene is why.
*Question: none structural — the chrome vocabulary (how the three states look) is design space.*

## S5 — Branching deliberately, and steering as the same gesture

*Talk about this* is one verb of the **inference context menu** — the registry match every rendered entity carries — and the menu also chooses where the action renders: this tile, another tile. From any past turn T3: a new draft citing T3; two children exist, the old tip's draft still rests, both futures visible in the sidebar.

The same gesture has a **steering form** against a *running* turn (author, 2026-08-11): pause + prompt, or a prompt inserted at the next cycle — the adjust-shaped act, aimed by pointing at the work rather than by addressing the agent. This begins answering the parked controls module (M5): the control's UX is the context menu on the running process, wherever it renders.
*Question: where the new line opens — in place or a new reading (lean: new reading; a branch is a departure). And the discuss/steer split: same verb with two targets, or two verbs? Unruled.*

## S6 — Merging lines

A draft cites two answers from different lines. Composing it is just staging both refs. The face: walking up from the draft immediately forks (S2b at step one), so the draft case is the merge-element rendering — **the branches as small TLDR slots above the seated draft; select a slot to expand, or the draft full-view embedded in the merge element**. The side-by-side split (two selections, one per lineage — the collation's native shape) stays open as a possibility; fork/merge elements are the first build.
*Question: does the element rendering suffice, or does real use demand the split? Settles by building.*

## S7 — The work tree is not the thread — and citizenship is flat

A turn delegated three sub-agents. Those are **children by ownership** — the call tree — not turns in the discourse line. Two different dimensions:

- the **discourse line** — citation links, walked by follow over `argument` refs;
- the **work tree** — `owned` placements, one hop per level, the frame.

**What ownership means for a sub-agent, exactly and no more** (author, 2026-08-11): lifecycle (the cascade — a child never outlives its parent) and the reach ceiling (the parent cap). It does **not** mean boxed. Interaction citizenship is flat: a sub-agent is visible (the walk finds it as a reference), pauseable, forkable-from, talk-about-able — every act governed by the *interactor's* boundary over the process chunk, never by the tree. You may steer a sub-agent mid-run, branch from its work because it got interesting, then expand back up. The tree governs lifecycle and reach; citizenship it never touches.

Navigation between line and tree is a **dimension switch**, and conflating them is the comprehension trap this map exists to avoid.
*Question: what the drill gesture is (expand in place vs push a new ground) — reader UX, unruled.*

## S8 — Context beside the thread

The draft's argument also holds `[project, tasks]` and a staged document. The reader is N selections side by side: the thread is *one member*, the task place another, the document a third, the seated argument at the bottom. "The session view" is just this collation.

Two additions (author, 2026-08-11):

- **Chrome is identity across appearances, by hop-relation.** A chunk that appears in several places down the line — in this turn's argument, in a previous session's argument list, inside a drilled frame — is highlighted as *the same thing* wherever it renders. The marking is built into the slot component itself, so every surface gets it for free; the per-location dots of the reader chrome are this mechanism's first face.
- **The spine need not be turns.** The line the reader follows on a thread is a choice: the citation walk is the default, but `[db/commits, project] ∩ agent processes` — *what agent work did to the project, in order* — is an equally legal spine, with turns as the orbit instead. Same machinery, inverted emphasis.

*Question: the chrome's cost — identity highlighting needs cross-slot lookup per render; where that index lives rides the slot-provider design.*

## S9 — Parallel turns

Two drafts cite the same tip; both start. Two lines grow live. One-active-turn is a policy of the draft's start, not a mechanism — nothing structural forbids this. The face at the tip: fork chrome, live (S2a while it happens).
*Question: does the default policy hold one-active-turn per thread, and where does that policy live? (Field defaults on the named location, presumably. Unruled.)*

## S10 — Finding the work again

Threads live nowhere; entry points do: a **named conversation location** (materialized when named/shared/bound/peopled), a kept **reading**, the sidebar's processes, FTS on any remembered phrase, any chunk's `linked` ("which turns cited this").

**The sidebar may itself be a reader** (author direction, 2026-08-11) — possibly *just* a reader with a session-shaped collation: group-by-association (processes sharing a reference bundle cluster together), a process wearing a count badge ("5" — five running sub-processes) instead of an indented tree. Hierarchy becomes one grouping policy among several rather than the sidebar's structure. Underexplored, deliberately.
*Question: what the default grouping is, and whether sidebar-as-reader survives the performance budget of an always-on surface.*

## S11 — How a followed turn renders: the sibling-arguments problem

The gap the first draft of this map did not cover (author, 2026-08-11). Follow yields *turn processes*; a turn's argument is a **set of siblings** — prompt, thread expression, guideline places, staged docs — with no structural way to pluck "the prompt" out without a filter. So rendering a followed line must choose:

- **Sub-filter**: render only chosen argument elements — `where(instance: prompt)` plus the answer. Possible only because the classification archetypes exist (the M1 rider: the convention specced once). The light, conversational face.
- **Include everything, normalized** (author's lean for the default): render each turn's full argument set and let **normalization collapse the repeats**. Successive turns share most of their context — the same guidelines, nested thread yields — so the deduped union is roughly *the shared context once, plus each turn's prompt and answer*. The maximal include is nearly as cheap as the minimal one, and honest: the model sees what the turns actually saw.

The same choice is the orchestration dial in one sentence: **sometimes you force-feed, sometimes you restrict and leave expansion to the agent** (self-serve reads pulling depth on demand). Both ends are recorded either way — `includes` carries the deduped truth.
*Question: is dedup the assembler's (render-time, policy) or the planner's (resolve-time, mechanism)? Lean: render-time — resolution stays pure, the window is where economy lives. Unruled.*

---

## Directions parked from this map

- **A graph viewer** — all reference paths at once, running processes rightmost, rendering grain adapting as slots shrink (the grade mechanism doing graph LOD). A view mode over the same chunks; additive, later.

---

## Found by charting (not by design)

1. **Fork/merge asymmetry.** Walking backward, *merges* fork the walk (S2b) but *forks* are invisible without inbound chrome (S2a). Any face that wants "you are on one of several lines" must pay for an inbound read at every step — or not show it. This asymmetry is structural (citations point backward), not a design choice.
2. **The merge face may be free.** S6's side-by-side lineages need no new mechanism — `list<selection>` already is that shape. Partially falsified 2026-08-11: stop-and-choose is *wrong for diamonds* — a merge that rejoins a shared fork must render inline (fork/merge elements, branch TLDR slots) with the common line continuing, because the line truly continues. The collation-edit reduction survives only for true merges of unrelated lines.
3. **The cap and the deviation are the same machinery seen twice.** S3's "press to extend" and S4's "merely-open" are one mechanism: the reading's expression differing from the draft's. If that identity holds, the UX vocabulary shrinks to: *shared expression* (face = context) and *diverged expression* (marked, one press to re-converge).
