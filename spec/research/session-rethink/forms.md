# Forms — generative pass on the citizenship UX space

> **Provenance.** Clean-room pass on "what is a session" (2026-07-07). A fully-bootstrapped context asked to invent 5–7 genuinely different session experiences, all assemblable from the settled citizen mechanics — different centers of gravity, not skins — and to pick a v0.1 default. Verbatim output; synthesis in [`synthesis.md`](synthesis.md).

---

Every form is assembled from the named census plus the settled mechanics: tile-is-scoped, ground/dock/widget/dormant roles, slots as scope-invitations, matching by argument-type acceptance, summary-chunk-is-the-group, selection-as-field-entity, minimized-forms-are-data, view recipes, `at:` pinning, relates-placements, R10 exclusion, branches (R1, shaped-open). Demands beyond these are flagged in place.

## 1. The Workbench — the thing being made is the room; the dialogue is a tool on the bench

**Arrangement.** `read` in document mode over the *artifact scope* (a plan, a spec, a dataset) holds ground. The session — a conversation pre-related on the artifact via *talk about this* — docks as a narrow rail: turns folded to line forms. The dispatcher rides inside that rail (the answer-home rule holds: it matches the conversation, not the artifact). Inspector and narrate dormant.

**Resting form.** You open the artifact, not a transcript. Current state of the work, whole. In the document margin — §3.5 already renders `relates` neighbors there — sit turn chips: which invocations touched which sections, drawn from `db/commits ∩ artifact` joined to processes. The rail shows the last few turns as prompt+answer folds.

**Live form.** Select a section, dispatch "tighten this." The turn's line form runs in the rail; the *document itself* is the progress display — partial commits re-render the section under your eyes via the ordinary scope subscription. The mutation strip is redundant chrome here; the mutation is the view.

**Mechanisms.** Document ground; relates-placement from *talk about this*; dispatcher docked; turn renderer folded; subscription re-render; margin = relates-neighbors; verbs (*review changes*) on margin chips. One flagged demand: a slot whose scope is a *related* scope (the conversation, one placement off the viewed artifact) rather than the viewed scope itself — within the slot-is-a-scope letter, but the recipe must be able to say it.

**Beats chat** whenever a work product exists: writing, planning, refactoring — the transcript is exhaust, the artifact is truth. **Worse** for open exploration with no artifact yet, and for auditing *how* something happened (that's one drill away, but not the face).

## 2. The Brief — the session's face is a maintained page, not a history

**Arrangement.** Ground is `read` in document mode over the session's **standing summary chunk** — a summary placed on the turns it abstracts, so it *is* the group, maintained by `narrate`/`summarize` after each turn. Dispatcher pinned beneath it. The transcript is the group's expansion: one press unfolds the brief back into the turns it covers. Turn renderer docks only while a turn runs.

**Resting form.** One page: where this stands, what was decided, what is open — entity mentions (`[[chunk-id]]`) as pressable links into the field. Below it, a short tail: "2 turns since brief," rendered as folds, because new turns sit outside the summary's coverage until narration re-covers them. That tail is honest staleness, visible structurally.

**Live form.** You dispatch from the brief. The running turn appears as its line form between brief and composer; when it finishes, the brief visibly rewrites itself (the summary chunk's own commit — attributable, diffable via `history`).

**Mechanisms.** Summary-is-group folding (§3.5/§3.6), `narrate` as the maintainer, document ground, dispatcher pinned, turn renderer, `[[refs]]`. No new primitives; the cost is model calls per turn (the L2 knob, session.md §4).

**Beats chat** for any session you return to after a day — the "include the session" context default and the human's re-entry finally read the *same page*. **Worse** live (the brief lags the work) and for verbatim recall; and it spends tokens to exist.

## 3. The Tower — mission control; sessions are the entities, not turns

**Arrangement.** Ground is `read` in cards mode over a scope of *conversations* (all sessions related on a project root). Each card is a session rendered small: its brief's first line if one exists, plus the active turn's **minimized widget — which is data**, a projection of the frame, so thirty live sessions cost thirty subscriptions, not thirty realms. Dispatcher dormant at board level; each card offers an in-flow slot where the dispatcher can open *on that conversation*. A pinned strip across the top: everything **waiting on you** — gates, failures — because obligations penetrate folds.

**Resting form.** A flat board; nothing raised. Cards read as one-line briefs. The waiting-strip is empty or it is the first thing you see.

**Live form.** Working sessions rise as cards (the sidebar's raised/flat grammar, reused); derived status lines tick ("reading design/backoff.md…"). You never watch one agent think — you watch the *frontier*: a gate surfaces, you approve in place, the card falls back to work. Drill = re-scope in place to that session's full view recipe; back walks out.

**Mechanisms.** Cards ground, minimized-turn-as-data, derived status L0, gates-penetrate, in-flow dispatcher slots, drill/breadcrumb, raised/flat. **Flagged:** the waiting-strip wants pending gates *placed onto the session*, not frame-only — this form is concrete evidence for the open in agent.md/session.md, on the "placed" side.

**Beats chat** at 3+ concurrent delegations — the regime chat transcripts structurally cannot serve. **Worse** as a place to think; it is a cockpit, not a desk.

## 4. The Worklog — turns as commits; the session is a ledger you accept

**Arrangement.** Ground is the session in sequence mode with a log-leaning fold: each resting turn's line leads with its **mutation digest** (*wrote 3 chunks → plan/retry*) beside the prompt digest — the specialized-ground escape hatch §3.6 names, a styling of the same turn renderer. Dispatcher pinned at bottom, framed as *propose next change*. `history` and `review` dock as citizens; with R1, a branch selector rides the dispatcher and each turn line carries its branch and merge state.

**Resting form.** A log, newest last: what was asked, what it changed, what it cost, merged or pending. The session total (tokens, commits) in the header. Reads like `git log` for your field.

**Live form.** A dispatched turn is an in-flight commit: the line's live status runs, the mutation strip grows entry by entry. The closing gesture is not "read the answer" but **review → keep/revert** (or merge, on a branch) — acceptance as the unit of progress. The answer text is one fold in, subordinate.

**Mechanisms.** Sequence ground, turn renderer with digest-first fold, mutation strips, `review`, `history`, branches (R1 — the full form waits on it; the branchless form does not), per-turn cost (§7).

**Beats chat** wherever trust is the center: an agent touching real data, a team auditing later, agent-on-branch → human merge. **Worse** for ideation and Q&A — sessions that change little feel like an empty ledger.

## 5. The Desk — the standpoint is the object; turns are the history of standing there

**Arrangement.** The **dispatcher's expanded form holds ground** — the peer inversion applied literally. Its standing selection (already a field entity, `relates` on the session) renders as a spread: cards for everything on the desk, each showing its projection (full / summary / name), its pinned commit, and a staleness badge from `reconcile`. The composer is pinned within it. Turns dock as a side rail; reader dormant until you drill.

**Resting form.** Not what was said — what you are *standing on*. The guidelines chunk, the two design files, the email thread, the last session's brief: the context the next turn will consume, editable before anything runs. This is "completion from a point in the field" with the point itself as the face.

**Live form.** Dispatch, and watch the desk get *used*: the turn's context chips are the desk's snapshot; context deltas render as things pulled onto the desk mid-turn, boundary-checked and badged. Consumption tagging runs live in front of you.

**Mechanisms.** Dispatcher-as-ground (explicitly licensed by tile-is-scoped), selection entity, per-item projection, context items pinned `at:`, `reconcile` badges, context deltas, turn rail. No new primitives.

**Beats chat** for research and synthesis, where curating what the model reads *is* the work, and for anyone burned by silent context pollution. **Worse** for casual use — it front-loads a decision chat lets you skip.

## 6. The Takes — one prompt, several worlds; the session as an experiment bench *(not in the seed list)*

**Arrangement.** Ground is `read` in **table mode** over a `select` frame reifying "the answer chunks of this trial group." Rows are takes — the same prompt dispatched N ways (different models, different desk selections, different guideline sets), each a detached launch **on its own branch**, wrapped in a `group` for one sidebar identity. Dispatcher docked, in a variant posture: compose once, fan out. Turn renderers minimize to per-row status cells. `review` docks for pairwise diffing; `merge` is the exit.

**Resting form.** A comparison table: take × (model, context digest, cost, mutation count, answer lead). Sortable, because instances share an archetype — the table inference already specced.

**Live form.** N status lines racing. Two clicks select two takes; `review` diffs what each *wrote* (two `at:` reads across branches), not just what each said. The winner merges home; the losers remain — permanent, re-runnable frames, the record of the road not taken.

**Mechanisms.** `select`, `group`, branches (R1 — this form is the second strong pull on it, after acceptance-merge), re-run/new-from-this pre-fill, table ground, `review`/`merge`. The fan-out itself is a forty-line orchestrator program calling `run` N times — composition, not a primitive.

**Beats chat** absolutely for prompt/model/context evaluation and any decision worth three drafts — chat forces serial takes with polluted context between them. **Worse** as a daily driver; it is a bench, entered deliberately.

## 7. The Correspondence — delegation shaped like mail, silence as the default *(not in the seed list)*

**Arrangement.** Ground is `read` over `session ∩ needs-you`: pending gates, failed turns, and completed turns not yet marked seen — the complement excluded via R10, with "seen" as a session-local chunk collecting `relates` placements, the exact `hidden` pattern from the sidebar §3.2. Running turns appear only as a one-line count in the header. The dispatcher docks as *reply in place* — an in-flow slot at each item — plus a pinned *new request* at bottom. The full transcript exists one chip away (drop the exclusion).

**Resting form.** Three items or none. A finished answer to read and file (mark seen — one keystroke, a placement). A gate to decide. A failure with *retry* pre-filled. Emptiness is the success state.

**Live form.** There barely is one — that is the point. You write a request the way you write a letter: desk composed, boundary chips read, send, close the tile. The work proceeds detached (launch semantics guarantee the closed tile kills nothing). Hours later the answer is an item, its mutation strip attached, review one press away.

**Mechanisms.** Scoped-exclusion ground, seen-as-placement, gates-penetrate, detached launch, in-flow dispatcher slots, turn renderer resting forms, retry-from-frame. No new primitives — this form is almost free.

**Beats chat** for long-horizon autonomous work and for people who refuse to babysit a stream; it converts agent latency from a cost into a non-event. **Worse** for tight iterative loops — the round-trip framing adds ceremony exactly where immediacy is wanted.

---

## The default for v0.1

**The Worklog — in its branchless form.** Three reasons.

First, it is nearly what session.md already builds. The census (reader, dispatcher, turn renderer, fallback, trivial stack) carries it at implementation steps 1–3 with one honest delta: the resting fold leads with the mutation digest beside the prompt digest, and the session header sums cost and commits. That is a fold-line styling inside the turn renderer — no new citizen, no R1 dependency, no narrate. Every other form either waits on a late step (the Brief on narrate, step 6; the Desk on selection-highlight, step 5), on an open (the Tower on gate placement), or on R1 (the Takes).

Second, it makes the thesis legible on first contact. A transcript-shaped default silently teaches "this is another chat app," and the system's actual differentiators — every turn a durable frame, every write attributed, review one press away — read as decoration on a chat. The Worklog inverts the emphasis at zero mechanical cost: the session presents as *work that landed in the field*, answers subordinate to changes. When a session happens to be pure Q&A, turns rest as prompt+answer anyway (§7's resting rule) and it gracefully *is* a conversation — the Worklog degrades to chat; chat does not upgrade to the Worklog.

Third, it leaves the right doors open in the right order. The Workbench is the first recipe to add — *talk about this* already pre-relates a conversation on an artifact, so it is a view recipe away once slots land, and it should become the default *whenever a session has a related artifact*. The Correspondence is the cheapest second (exclusion + one `hidden`-pattern chunk). The Brief becomes the resting face the moment narrate ships and can simply be folded onto the Worklog — the two compose, since the brief is a summary chunk over the same turns the log renders. The Worklog is not the ceiling; it is the floor that points at the ceiling.

One consolidated demand list from the whole pass, for the ledger rather than silence: slot-scoped-to-related-scope (Workbench); gate-placed-onto-session (Tower — evidence for the existing open); digest-first fold variant as turn-renderer view-state (Worklog); fan-out orchestrator as a composed program (Takes — no primitive); seen-marker via the `hidden` pattern (Correspondence — no primitive). Nothing here needs a new mechanism the specs don't already hold or hold open.
