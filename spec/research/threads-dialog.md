# Threads — the ruling stretch (author dialog, third session)

> Distilled onto the board ([`board.md`](../../board.md)) — canonical namings (author: **`lens`**, **`process-view`** not "inspector", **`form`**, **`prose`**), the build queue, the gates. This file is the reasoning record; the board carries the implementable shape.

Continues [`threads.md`](threads.md) and [`threads-lens.md`](threads-lens.md) (2026-08-01, author dialog). This file records what the author **accepted** in dialog and what stands as **proposal** from the same stretch. Nothing folded into specs yet — session.md ratification remains the standing gate; these rulings inform that read.

## Accepted by the author

1. **Thread / conversation named apart.** A *thread* is the derived context-lineage — computed from recorded context provenance (context items on invocation frames), never stored. A *conversation* is the chosen discourse scope. Both are views; neither is the container. Branch = two turns citing one predecessor; merge = one turn citing two lineages. The shape is git one level up: turns as commits, context lists as parent pointers, thread names as refs.

2. **Structural matching against specs.** A program may declare `accepts` nominally (archetype) or structurally (`{time: number}`); the structural form is satisfied by checking **spec documents**, never by sniffing live bodies. Nominal names are conveniences over spec-shape truth. Author: "being able to type by structure and not by chunk ID is valuable."

3. **The grain principle** (resolves threads-lens.md §3's tension). One question decides dimension placement: *does the property change while the chunk remains itself?* State → body key. Identity (what the chunk is, without which it is nothing) → type/placement. A JSON body is **compressed field structure**; explode/implode is the isomorphism between grains, so the grain choice is never fatal — body-grain data reaches chunk-level algebra via explode, chunk-grain dimensions (telemetry categories) are pre-explosion by a writer who knows the shape. Explode stays an **explicit pipe stage** first, implicit insertion later if earned. When an interface demands chunk grain, explode before the interface.

4. **Face-follows-context as the resting default.** The conversation renders as the assembler's proposal — you read what the next turn will see. The discourse scope (everything that ever happened here) is a register you switch to, not the default. Inverts the old tools' default (face = everything, context = hidden).

5. **The four legibility principles** (accepted with the elaborations below): honest baseline (face = staged context); reading is free, including is a gesture — looking never mutates context; every visible element wears its inclusion state inline (no bottom-diff to scroll to); deviation between face and context is marked, never silent.

6. **The cascade lives in the lens, not the context** (author correction, accepted back). Context is not transitive — each turn sees exactly its recorded list; the chain works by per-turn compression. But the *surface* needs the transitive walk: the thread face is a lineage-walk supplying a sequence to the sequence lens, which slots each element by its own matched surface. The walk is a pure program — usable as a composed pipe stage (recorded, recipe-able) *or* as library use inside a custom surface (round seven's distinction already covers both grades). Something aggregating relationships into the "GitHub-issues experience" is this walk plus dual-placed cross-references (threads.md §1), not new machinery.

## Standing proposals (this stretch, not yet confirmed)

- **Lens, defined.** A lens = *position* (scope + pure transforms — the path/URL/location, held as the argument on its own request chunk, per the built retarget) + *selection* (which type-matched surface renders it) + view state. **Master/slave binding**: lenses bound to one position hold their targets as references to a shared position chunk — materialized by the binding gesture, not upfront (the grain principle applied: sharing confers identity). No standpoint entity by default; binding creates one on demand.

- **One tile, not two.** The dispatcher is the **generated launch form of the agent program**, appearing as a citizen in the lens's slot — composer-as-citizen (round four) + generated launch forms (round two) meeting. The **answer-home rule decides which positions get composers**: a conversation instance in scope → the dispatch citizen matches and is offered (invited, never seizing); a telemetry scope → none.

- **The staged context is the pending turn's argument** — a draft invocation in the field, edited by frame writes (the retarget precedent generalized: argument editing is frame writes). Typing-while-running (P7) and the sidebar's flagged "pending-has-no-form" gap both land here.

- **Chips and diff by field coordination.** Lens and dispatcher never speak; both read the draft argument (citizens coordinate through the field, never props — round eleven). Per-element inclusion chips are derived membership (element ∈ staged list); click-to-include is a commit on the draft; reactivity updates every observer. The "context diff" is distributed as the chips, with a lens filter-mode (show staged / highlight delta) instead of a separate pane. Staging works **from anywhere** — any tile with the grant can place into the draft, so the open-in-third-tile-and-bring-back round trip needs nothing.

- **Three registers per rendered element**: in-position, in-staged, merely-opened. Expanding is a view-state change when in-scope-collapsed, an ephemeral out-of-scope read otherwise; neither stages.

## Opens recorded, deferred by author's word

- **Content-type as a third register of typing** (the markdown question): chunk-id / spec-shape / *format of a scalar value*. Candidate: spec fragments annotate value format (a string carrying `markdown`), matching can demand it; the editor citizen matches on the tag. Same move as the well-known key vocabulary (`time`, `name`, `status`) — one future ruling covers both.
- Where field expressions enter (palette Find mode), the thread rename, backlink convention — all still open from threads.md.

## Convergence note

The one-tile assembly *is* the paused build track's dispatch agenda (palette → generated form → boundary chips → run/launch → landing) instantiated: the conversation composer is the first full launch flow, not a special case beside it. The dispatch-planning session and this dialog meet here.

---

## The dissolution (author breakthroughs, same dialog, later stretch)

Supersedes parts of the proposals above where noted. **This stretch is the material for the session.md ratification read** — it proposes the entity dissolves rather than gets ratified.

1. **No container entities — sequences derive from arguments.** Sessions, threads, conversation instances may not exist as entities at all. The lens builds the sequence by reading process arguments: a process citing another process in its argument *is* the link; branching is respected; the walk spawns whatever components the sequence needs. The discourse scope as container goes the way of the agent session (round eleven) and the standpoint entity (threads.md §2) — one more piece of machinery dissolved into a query.

2. **The draft joins the sequence by citation.** A draft process whose argument cites the last answer appears in the lineage like any turn. The composer sits at the thread's end *because the draft is in the thread* — not because a slot pinned it there. Supersedes the slot-pinned-composer framing above.

3. **The lens carries N positions: one view, many signals** (author's oscilloscope image). The view position is what you see. Marking positions render as per-element derived membership; an element outside the view but inside a signal is pulled into the render, marked signal-only. The draft's context is one signal; a manual selection is another — **converging with round eleven's selection-is-a-field-entity: a selection is a marking position on a lens.** The two-signal case is the previous stretch's chips; N is the general shape. Visual treatment open (author floated and retracted color borders; the mechanism — derived membership per signal — stands regardless).

4. **A position is an aggregation, never just a point.** Unions of locations, minus exclusions. So *staging is scope algebra*: include = union a location into the draft's context expression; the fold = lineage minus turns 5–9 plus summary-S. At dispatch the assembler resolves the expression at one snapshot; both the expression (intent) and the resolution (fact) are recorded on the frame — reproducible and audited.

5. **Dispatcher and inspector are one ladder.** The inspector faces a started process; the dispatcher faces a draft process. The dispatcher appears as the citizen of a slot wherever a draft process is visible. Joined with round twelve's turn renderer: **draft → dispatcher · running → inspector · done → turn face** — one renderer family over the process lifecycle. The scrolling conversation is nothing but: sequence lens + process renderer ladder + signals. *(Amended by the next stretch: the three faces may collapse into one thin inspector — see below.)*

### Transmutations — ADOPTED (author, closing stretch: "that is the whole point")

- **Answer-home rule → draft-summons-dispatcher.** Dispatch availability is no longer gated by a `conversation` instance; the dispatcher matches draft processes, and *creating a draft is the gesture* (talk-about-this creates a draft citing the thing at hand). An email thread grows no dispatcher because nothing creates a draft there unbidden — the rule's work preserved with less machinery.
- **Conversation entity → a position that earned identity.** Naming, sharing, binding, or inviting participants materializes the position chunk (the grain principle closing its own loop: sharing confers identity); participants-as-relations (round four) attach to it. Conversation-as-container is gone; conversation-as-name remains.

## The thinning (author, same dialog, final stretch)

1. **Try one inspector — no turn face, maybe no separate dispatcher** (author's direction: *"let's see if we can make an inspector; that is enough"* — test by building, not settled). The inspector is a **thin layout of slots over process anatomy** (argument · frame · result); everything face-like is what fills the slots, and filling is derived: the argument slot takes an argument-*editor* citizen while unconsumed, a frozen argument view once consumed; the frame slot streams while running; the result slot renders the answer when settled. Dispatcher-ness and turn-face-ness stop being programs and become derived slot-fillings. **Editability is not a mode but a fact**: an argument is editable iff not yet consumed — which also explains why a lens's argument stays live forever (the retarget) while an agent's freezes at dispatch. Round twelve's folded/expanded distinctions survive as view states of this one program.

2. **Answers are sequences of chunks; markdown grows slots.** An answer need not be one markdown blob: it is an ordered sequence — prose chunks interleaved with typed chunks (expressions, file references, tables) — each element slotting its own matched surface. Within prose, **markdown-with-slots**: round thirteen's `[[chunk-id]]` mention syntax is the seed — a mention renders through the renderer ladder at inline/block grade instead of as a link. The agent's beautiful answer = committing typed chunks and citing them from prose; summaries get the same power. **Fractal**: thread = sequence of processes, answer = sequence of chunks — the same sequence-lens shape at two grains. Grain principle applied: pieces needing identity (findings, artifacts — citable by later turns) become chunks; connective prose stays body; mentions bridge.

3. **Peer positions, merged sequence** (author correction, replacing the view/signal hierarchy of §3 above). No master view scope with marking overlays: a lens holds **N peer positions**; the render is their merged, interleaved sequence; per-element indicators show which position(s) contributed; each position can be hidden and brought back (view state, not deletion). The draft's context, a manual selection, another lineage — all peers that "join in nicely." Marking-beyond-scope resolves uniformly: contributing a position adds its elements to the merge, indicated. What survives from the signal framing: derived membership per position (cannot lie). What dies: the hierarchy.

4. **The scope editor is a DNF editor.** A lens's effective scope = **union of positions, each an intersection of terms**. The built retarget grammar (add dimension, chip ×, at least one remains) is intersection editing *within* one position — the walking precursor; peer positions add the union level; hide/show = suspending a union term without deleting it. Chips exist at both levels. Merge order: interleave by seq/time, ties by commit time (existing ruling); cross-lineage indicators are the GitHub-issues experience and mission control in one shape.

## The viewer stretch (author, same dialog, continuing)

1. **Answer selection is the result-archetype rule.** The author's turning point — an agent process commits many mutations; what selects only the answer for the result slot? — is resolved by an existing ruling (board, mine-sweep closure): *every program's interface declares its result archetype.* The inspector's result slot fills with frame ∩ declared-result-archetype; mutations remain frame history, reachable but not the face. Selection by contract, not heuristics — the one-inspector direction survives its first crisis on a ruling that predates it.

2. **Preset lenses are recipes.** A preset = a saved lens argument (positions + view config) as a chunk; recipes are ruled identity-based, and a preset lens is a recipe whose program is a surface. View config is part of the argument, not ephemeral view state (author's word): surfaces declare their config keys in their interface schema like any argument keys. **Agents ship shaped with preset lenses** — the agent program relates its preset chunks; opening its processes offers those configured views, not bare matched surfaces.

3. **Narrated answer is the calm default; raw browse is a preset.** The streamed answer narrates its own mutations as it works — "if it edits the file, it says so in its streamed answer" — and the mention renders the edit via the ladder (diff view inline). Manual mode — browsing the raw structure of all turns — is just another preset lens. Matches session.md's three-layer ruling exactly. Whether an answer is one prose chunk or a sequence of chunks: both possible, grain principle decides per case, mentions make even a single chunk rich.

4. **Attribute slots — per-element joins.** Beside each element in the sequence, adjunct slots filled by per-element scope algebra (commits: `element → relates(commit)`), rendered through the ladder. The sequence viewer becomes an outliner/data-grid hybrid — the author's "org mode of the future." **Convergence: session.md's mutation strip is an instance of an attribute slot**, reinvented from the other direction. Fold/expand of summaries belongs to the *viewer* (fold is sequence structure — which elements at what grain), not to the summary's own surface (author lean, recorded).

5. **Thin by discipline — a family, not a monolith.** The viewer owns arrangement only: merge, order, fold state, adjunct geometry. All content slots through the ladder; all selection is derived scope algebra. "Maybe it handles more than sequences" resolves as sibling arrangements (grid, timeline, graph) over the same contract — positions + adjunct queries + ladder — a family sharing one skeleton rather than one advanced program. Advanced mechanics accrue as pipe vocabulary and config keys, never as content knowledge inside the viewer. Author flag, standing: much more coming in this space; settle-by-building.

## The argument dilemma (author, closing stretch) — RESOLVED, indirection adopted

The author caught a contradiction in the emerging state ruling: *a process has the arguments it got when it started* — a lens rewriting "its own argument" mutates a process record, and the alternative (start a new process in its place) would destroy the running React application. Real dilemma.

**Resolution — indirection (author-accepted, with an addendum):** the author's own extension makes it stronger — *"with a reference you can just restart the program whenever."* The stable reference makes the lens process disposable: kill it, recycle it, respawn it; the view definition survives in the field. The referenced chunk holds the **whole view definition** — the scope expressions (the "DSL") *and* all view settings. Its name is **ruled: `focus`** (author) — a lens points at its focus; presets are committed focus chunks.

**The mechanism as accepted:** The process argument is an **immutable reference to a position chunk**. The position chunk is ordinary field data (positions + config — the whole preset shape); editing the scope is a commit *on that chunk*; the lens's subscription delivers it; the tile re-reads. The process never restarts and its record never lies: it was started pointing at position P, and it still points at P — P's commit history *is* the retarget trail. For agent processes the same shape holds by snapshot: dispatch records the position chunk id + the commit it resolved at + the resolution, so editing the position afterward rewrites nothing. Uniform rule: **processes never mutate; data chunks live; records pin commits.**

What falls out for free: **master/slave binding** is just two arguments referencing one position chunk — the materialized-position proposal stops being a special case and becomes the only shape (every lens position is a chunk); **time travel** (`at:`) is viewing the position at an earlier commit — the frozen photograph available as history without freezing the lens. The built retarget's "request chunk" is arguably already this indirection; the refinement is declaring it so in the contract.

Preset semantics — **RULED: template** (author). Opening from a preset copies into a fresh focus chunk; save-back is an explicit gesture; the preset's history needs no mechanism because its edits are commits — "any change to the focus is a loggable change" holds by the laws of the system.

**The citation shape (steward proposal, answering the author's commit-locking question).** Can a chunk relate to another chunk commit-locked? Proposed: *the graph binds identities; records cite versions.* Relates and placements stay live — they bind identity, never a version; no lock flag enters the placement layer. Where reproducibility demands a version, the pin is **data on the referencing record**: a citation `{chunk, at-commit}` — exactly what dispatch already does (turn records the focus chunk + the commit it resolved at) and what branch-pinned mounts do at coarse grain. The copy's link to its source preset is a citation (*instantiated from P at C*), giving diff-against-preset, upstream-moved detection, and honest save-back as derived facts. Downstream: `[[chunk@commit]]` mentions — prose citing a thing as it was. Leans on the deliberately-deferred `at:` (read-at-commit) capability; adds one data shape, zero mechanisms.

### Guardrails this stretch touches

- **Matching stays spec-level.** Dispatcher-vs-inspector must NOT be registry matching on body state (would break matching-never-sniffs-bodies). The renderer family matches the process *type*; face selection by lifecycle state happens inside the matched program.
- **Drafts are field entities — RULED** (author): they rest visibly by the laws of the system; the draft process holds its draft prose in the substrate — *"there is no in-memory markdown; substrate it is."* Persistence is a consequence, not a policy; nothing auto-sweeps.
- Linearizing the DAG for the scroll: existing seq-tie ruling (commit-time order) covers ties; branch points get their own spawned chrome per §1.
- A view position that is itself a union (several lineages at once) is mission-control rendered by the same lens — interleave is the timeline surface's job, not new mechanism.
