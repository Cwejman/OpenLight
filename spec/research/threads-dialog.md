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

**The citation shape (steward proposal — HELD OPEN, author not ready to trust).** Can a chunk relate to another chunk commit-locked? Proposed: *the graph binds identities; records cite versions* — relates/placements stay live, never version-locked; where reproducibility demands a version the pin is data on the referencing record, a citation `{chunk, at-commit}` (precedents: dispatch pinning the resolution commit; branch-pinned mounts; downstream: `[[chunk@commit]]` mentions). Author's response: *"the at-commit reference I'm not ready to trust yet... all feels fresh and unsettled."* Held open per conventions; nothing folds; do not lean on it.

**What the author offered instead (recorded as direction):**

- **Stale-display as the general default.** If a process's argument chunk is later changed or removed, the process-view still shows it *as it was* — marked stale. The record keeps only what dispatch already keeps (the resolution commit); staleness is *derived presentation* (then-commit vs head — cannot lie), not data structure. Generalizes the unresolved-roots ruling (dead references render explicitly) from *gone* to *changed*. Folds into the process-view contract at spec time. This absorbs much of what the citation shape was for.
- **`at` is a pure pipe verb.** `scope | at(commit)` joins the DSL vocabulary beside `where` and `average` — time travel as composition, not lens feature. The lens grammar's deferred `at:` becomes this verb appearing in a focus expression.

**Lens history is a sequence of focuses (author direction, superseding commit-walking) — focuses become values.** Not commits on one focus chunk: **navigation appends a new focus chunk to an ordered sequence** (browser-history shape; same substrate form as the clipboard ruling), with a current pointer as a body key (grain principle: pointer is state; moving it is not navigation). The cascade: references to a focus **never go stale without any pinning** — each visited view is its own chunk, so identity captures version; dispatch records, preset lineage, share-my-trail all bind plain identities; the citation shape's need largely evaporates (it stays held open, now doubly unneeded). History is field data — pipeable ("where was I last night" is an expression over the trail). Preset-opening restates uniformly: the preset's content appends as the first focus of a fresh sequence. Stale-display narrows to where it stays true: the *content* a focus views can still move; the focus itself cannot. `at` remains vocabulary but stops being load-bearing for lens history and process records. Opens, settle at lens v0: what counts as navigation-grade (retarget yes; visibility toggle?) and the forward-branch rule (truncate like browsers vs keep both — the trail as a tree).

## The focus-DAG stretch (author, continuing read-pass — supersedes the trail)

1. **Trails dissolve — focuses cite their predecessors.** The stored sequence + pointer had the delete-the-future problem (go back, edit → future truncated). Instead: a focus cites the focus it came from; editing from anywhere creates a new focus citing it — a branch, nothing deleted, nothing linear ever stored. Same dissolution as turns, a third time. The trail archetype is struck.
2. **The eye** (author-named): the one stable thing the lens serves — a chunk that remains the same throughout the process, whose **`relates` to the current focus is what changes**. A tab is an eye; back/forward re-place the relates. Author's reason for relates over a body id: bodies cannot hold typed chunk ids yet — a deliberate grain-rule exception (current-focus is state, would be a body key), marked to revisit when **typed JSON** lands (now on horizon.md, author-requested).
3. **A location/position is a place, not an expression** (author correction): it *becomes* an expression when piped. Name undecided: location vs position.
4. **The walk program's name held open** (author): "a thread is just one, but here we are branching" — the walk yields a branching structure; `thread` misleads. Circularity, answered: creation-time citations cannot cycle (nothing can cite the future — DAG by construction, as git); walks parameterized over *mutable* relates edges can meet cycles and need a visited-guard, rendering a cycle as a join-back marker — output always finite.
5. **Partial binding + visibility** (author): a surface matching two of three selected locations is selectable; the third is toggleable — visible adjacent (truncated, foldable when long), hidden-but-marking, or opened in another tile; when locations cannot render together you select which you see. And visibility has a third channel besides merge/adjacent: **unfold-reveals** — expanding a slot can show related material beside it in place (intuitive, author-flagged as not-scientific; folding possibly lens-level to keep nesting flat).
6. **Naming reopened wholesale** (author): with the model changed, reconsider all names — including `lens` — and pick the most natural to what things now are.

## The naming settlement + the binding model (author dialog, continuing)

**Names settled** (three subagent explorations → textual-criticism family → folk-simplified by author): **`reader`** — the viewer program AND the persistent chunk it serves (a tab is a reader; the chunk stays, its relates moves); **`reading`** — the immutable state, citing its predecessor, branching as variant readings; **`collation`** — the reading's set of locations; **`location`** — one selected place (folk over loci/position); **`template`** — a kept reading, copied never edited (folk exemplar); **`marks`** — per-location membership cues (folk sigla). Walk program: author narrowed to **lineage or follow**; steward leans `follow` (verb, joins the pipe family where/at/explode), "lineage" as the prose noun. Rejected en route: lens (one-point), trail (linear), thread (one strand), braid (author: complecting — over itself again and again, not the phenomenon), film register take/keeper (spoken-language, not professional), stemma/loci/exemplar/sigla (right meaning, not folk).

**The binding model** (author's tabs description, made precise — pending author confirmation):
1. A **collation** is an ordered set of locations — heterogeneous, open: scope expressions, settings chunks, a preferred language — things multiple surfaces consume.
2. A **binding** = one surface program + an assignment of collation locations (optionally through pipe stages) to its argument roles. **Every tab is a binding**; bindings sit side by side, selectable one by one. A location may appear in many bindings (it repeats inside each).
3. **There is always a surface**: an unbound location gets an auto-binding — the shape-matched default (sequence for ordered, document for one chunk). Overriding is choosing another binding.
4. **The reader has no magic**: it renders nothing, merges nothing — every rendering fact lives in a binding (choosing draft + answer "with chrome" is purely one `sequence` binding taking two arguments). The reader only synthesizes default bindings and hosts the tabs.
5. **Pipes are visible and editable**: a binding's assignment shows locations → pipe stages → argument roles; editing it is `form`-grade work (a binding is an argument assignment — the form edits it, the reading commits it).
6. **Marks derive from the whole collation**: element-membership per location, computed regardless of which binding renders, hideable per location. (Surface-declared mark-roles held as the escape hatch for custom cues.)
7. **Attributes are binding config**; v0.1: only `sequence` carries them.

**Explicitly postponed by author invitation**: the pipe-flow editor's visual design (structure pinned, design at build); mark-roles on surfaces; attributes beyond sequence; separable/shared collations (start contained); adjacency layout detail beyond sequence's interleave.

## The correction stretch (author read-pass, final — five fixes, two dissolutions, two opens)

1. **Tab double-use fixed**: "tab" had named both the reading and a binding — and the host owns tabs anyway. The word left §3.5; bindings sit side by side, selectable.
2. **Reading/collation swapped to the author's mapping**: **collation** = the immutable composed whole (locations + bindings + config), citing the collation it was edited from — the lineage is of collations; **reading** = the persistent store whose relates points at the current collation, served by the reader program.
3. **`history` dropped as a default binding**: `db/commits` is an ordered scope — `sequence` serves it; a commit renders by the ladder (body = message), connections as slot chrome, expandable by **scope-in-place** into a nested sequence inside the slot.
4. **Marks dissolved into slot chrome** (author: "why name something that isn't something") — default, derived, surface-independent chrome: per-location markings (a location's color → a dot on slots it contains) + connection counts. Custom chrome roles held open.
5. **Folding became a pipe**: `fold(summaries)` as a pure stage — any summary relating several piped elements replaces them; fold state lives in the binding's expression in the collation. Attributes confirmed as written (`el → intersect(commits)`).
6. **Templates/presets dissolved entirely**: collations are values, so opening anyone's collation is a fresh reading pointing at it; the first edit branches; nothing copied, no mechanism. Agents ship shaped by relating collations.
7. **Open — the predecessor carrier**: "cites its predecessor" has no honest channel yet — relates is untyped; candidates: a connection chunk placed on both collations (the substrate's own intersection pattern) or the typed-JSON body ref (horizon). Author-flagged.
8. **Open — agent contexts as selections**: a turn's context may cite several turns, or a piped expression (`follow | fold(…)` — including summaries the agent itself writes to purify its own context). What the thread face does with N-source contexts: unexplored, author's words.

## Cards, relates, and the typed-JSON digest (author dialog, continuing)

1. **Cards dissolves into `sequence` config** (author: "is it really a separate program?" — no): narrower slots that wrap; mixed unordered sets sequence by commit time; archetype-grouping is a pipe (`group`), not a program. Surface family shrinks to `sequence`, `table`, `document` — with `document` flagged as possibly next (body via `prose` + placement chrome), awaiting the author's word.
2. **Relates relieved, not removed** (the division of labor the typed-JSON work settles): **typed body keys carry program data** — rigid, machine-consumed, writer-named ("affected", "predecessor", "current"); **relates keeps aboutness** — the open connection where naming would be false precision; **prose is the open end** — a prose chunk placed relates on what it discusses *is* the relationship (the intersection pattern), its body the meaning, `[[mentions]]` its open references. The split rule survives: prose about genuinely different things splits; one prose about one thing touching many is prose doing its nature. Whether mentions project backlink placements is the same target-side-discovery question as typed-key projection — one projection question, both ends of the spectrum.
3. **Typed-JSON research distilled for the author** — digest added atop [`typed-json.md`](typed-json.md); the five points: decomposition already illegal; one `keys` spec field closes three opens; predecessor citation solvable today (connection chunk, instance-on-new/relates-on-old); `attach` mostly evaporates; the deciding question is target-side discovery.

## Typed bodies settled in dialog (author corrections → the write-and-shadow model)

Author corrected the steward twice and answered the research's deciding question:

1. **Knowledge modeling is IN.** The fence against ontology creep is *ownership* (a field name lives inside one archetype's spec — `person` owns `work: ref(workplace)`), not domain. Coherent fields across 200 people is what archetypes are for; RDF died of unowned predicates, not of named fields.
2. **Directionality is the point.** A body always reads outward (`predecessor: X`); placements never carried semantic direction — which is exactly why relates-as-pointer was ambiguous. Typed keys give directional facts their directional home; relates returns to mutual aboutness.
3. **Target-side discovery is load-bearing from the start** — the author named the consumer: prose. "In the end all the mentions in there are placements. That would be beautiful." The model: **write in the body — typed key or prose mention — and the graph grows the placement as a shadow, automatically.** Forward face: the record (named, directional, validated). Backward face: the field (who mentions me; who works here: `scope(workplace) ∩ person`; which readings point at this collation). One mechanism: projection of references into derived placements — `explode`, standing.

Three obligations pinned with it: projected placements are **marked derived and never grant reach** (boundary walks skip them); projection is **commit-time** (a body edit re-derives its shadows in the same write); **hand-placed relates survives** beside the shadow — deliberate aboutness is authored structure, not derivable. Substrate keeps two placement types; bodies' references stop being invisible to the graph. This supersedes the research file's "if no consumer, defer projection" ordering — the consumer exists.

## The db behind the db (steward take on the three placement sources, pending author word)

The author named three placement sources — hand-placed, typed-key links, prose-mention links — with prose as the nut. Steward's take, plainly: **when a body is saved, the system reads through it and files every link it finds — the same moment, the same way, search already files every word.** The link list is FTS's sibling. The physical design that falls out:

1. **One link table beside FTS**: `refs(src, key-or-span, dst, kind: key | mention)`, refreshed per-chunk whenever its body is saved, **never part of commits** — derived, recomputable from bodies; a temporal read re-derives from the body at that commit rather than versioning the table. Typed-key links and prose-mention links both live here.
2. **The hand-placed placements table stays pure; permissions read only it** — links never grant reach, by physical separation rather than filtering discipline.
3. **Both-sides answers come from the read layer**: a scope read joins the link table in, each linked-from row labeled derived so it is always distinguishable from a hand placement — the same query-time move `db/commits` and `engine/mount` already use. Nothing is ever inserted into the placement graph.
4. **Reactivity**: subscriptions also fire for a chunk when links *to* it appear or disappear; streaming churn is absorbed by the already-required coalescing; only complete `[[id]]` syntax counts; a link to a missing chunk shows as a dead reference (the ruled pattern).
5. **Only chunks can be linked to**: a mention of an expression renders (a live view in the flow) but files no link until the expression is materialized as a collation with an id. Ref-typed keys file links; primitive-typed keys (string, number, time, markdown-tagged) just validate. Ref constraints are archetypes (`work: ref(workplace)`); cross-mount unresolvables surface as unresolved, never reject.

**The SQLite sketch (steward, concrete — against db.md's real schema).** One new table: `current_refs(src_id, branch, key, dst_id, kind: key|mention)` + index on `(dst_id, branch)`; current-state only, no versions table (chunk_versions' bodies are the historical truth; re-derive for `at:` if ever wanted). Write path: inside apply's existing commit transaction, per written chunk — `DELETE` its refs rows, re-`INSERT` from declared ref keys (`json_extract`; spec already in hand from validation) and from one `[[...]]` scan of body strings — the identical delete-reinsert pattern the FTS triggers use, so links can never disagree with bodies (transaction atomicity). Ref-key validation = one `current_placements` lookup (is dst instance of the constrained archetype) → `VALIDATION_ERROR` on failure. Read path: backward lookup is one indexed SELECT on dst; the `scope` op gains a second select and `ScopeResult` gains a **separate `linked` field** beside `items` — placement vs link distinguishable on the wire, not by convention. The boundary walk's recursive SQL over `current_placements` changes by zero characters — `current_refs` is not in the query; that is the no-reach guarantee, physically. **Storage unchanged, and stageable** (author probe answered): the body stays one JSON text column, byte-identical — no typed/placed body kinds exist in storage; typing is spec-field + write validation only, adoptable with zero schema change (forward refs work from the body directly); the refs side-table is a later, optional stage for backlinks. **SQL-typed storage deliberated and refused** (author challenge): per-archetype tables die on runtime DDL, union-accepts multi-archetype chunks, per-branch current state, and FKs that cannot express instance-of-on-branch under losslessness; field-per-row dies on body reassembly, whole-body versioning/merge, and nested-structure/prose needing a second regime. What typed relations deserve — real SQL rows — they get, in the refs table, derived so one fact keeps one home; hot keys escalate via SQLite expression indexes on json_extract (promotion-when-proven), never via storage rewrite. Author correction folded: untyped ids-in-bodies today are dead weight (a no-op); typing is what animates them.

## The collation refined — members (author, continuing; binding question open)

A collation is NOT one expression (author correction — the inline fenced block is an anonymous *expression*): it is **a set of named members plus reader settings**, members of two kinds as siblings: **locations** (raw ingredients — the "mass dependencies," added by click/select) and **expressions** (built over them; an expression may *inline* its places or *reference a sibling location by name* — several expressions can draw on one sibling). The shape is SQL WITH / spreadsheet cells / let-bindings; sibling reference reuses the substrate's own rule (names unique within parent scope). **Open, author-flagged "needs to be understood": what binding becomes.** Steward lean: binding dissolves from an object into *settings* — every member shown gets a surface pairing (auto by shape, overridable) recorded per member in reader settings; expressions stay pure (no surface baked in — same expression, table today, graph tomorrow); "there is always a surface" becomes a rendering rule, not data. Alternative (expression whose final stage is a surface) rejected-lean: bakes presentation into data. Settles at reader build. **Also adopted: list/set types in `keys`** — `affected: list<ref>` in the body; no intermediate chunks for collections (see typed-bodies.md).

## The closing stretch — connection taxonomy, the instance spec, the call frame's floor (author rulings, end of arc)

1. **A third placement type: `owned-by`.** Hierarchy split out of `instance` at last — the original two-type minimalism had conflated *contained-in*, *member-of*, and *typed-by* into one edge (the author's earlier rejection of separate hierarchy lived under that doctrine, which typed bodies ended). **The five connection kinds, each one meaning:** `owned-by` — where it lives (placement; `/` paths; names unique within owner; one owner, a tree; a module is an ownership subtree; never crosses mounts) · `instance` — what it is (placement; pure type membership; multi-typing natural; sugar candidate `#`, unruled) · `relates` — what it is about (placement) · `field` — related-by-key (typed body ref, link-indexed) · `mention` — spoken of in prose (body reference, link-indexed). Three stored placement types, two body-derived kinds, one mechanism. **Boundary semantics collapse to one sentence: reach = ownership + explicit grants** — instance, relates, field, and mention never confer reach.
2. **`accepts` retired from the spec language.** Content composition is typed ref-lists in bodies; argument validation is one placement check; chunk typing is `instance` on archetypes. The engine's union-accepts machinery retires at the cross-spec fold; the union-accepts research gains a superseded pointer. *Open:* any residual scope-content contract, readmitted only on evidence.
3. **The spec collapses to the instance spec.** Field named **`instance`**, spoken "instance spec": a typed key-map that instances' bodies must fit — `instance: { name: string unique?, work: ref(workplace), tags: set<string>? }`. Per-key `?` marks optional (no `required` array); `unique` is a per-key modifier; `propagate` dies with accepts; `ordered`'s home (lone flag vs native list-ordering) settles at the substrate fold with `seq`. **The tower invariant:** an instance spec is never for the chunk itself — only its type's instance spec binds its body; B placed instance on A fits A's instance spec while carrying its own for C. The living tower: `program` → `shell` → shell's runs.
4. **Enums are the substrate's.** A closed vocabulary is `ref(X)` with X's instances as the value chunks (`status`: draft, running, done, failed). No enum machinery; the link index answers "all running" as one derived lookup — no placement churn, the rejected enumerator-index pattern stays rejected.
5. **The call frame's floor.** Program body: `argument: ref → archetype`, `result: ref → archetype`, `demand` (the argument-independent boundary residue — grants-on-keys cover the rest), `uses`, `presets`. The argument chunk: `instance` on its archetype and *nowhere else* — the process body's `argument` ref **is** the connection (a field; a placement too would be a second home). Process body: `argument: ref · at: commit · status: ref(status) · result: ref` — every key statically typed; the argument frozen wholesale at dispatch; validation = one placement check; results mirror (instance on their archetype only; writing them is declaration-derived reach). Frozen-safety vs rolling-head is the SDK's explicit choice via the stamped `at`. Nesting the argument into the process body: held open as future simplification.
6. **Prose expressions mention their locations** (author ruling, completing the earlier lean): every location a fenced DSL block uses becomes a mention — link-indexed like any other, and like all mentions governed by the both-ends boundary rule (write-gated by the writer's reach, read-filtered by the reader's).
7. *Opens carried:* single-owner until evidence; `#` sugar; `ordered`/`seq` home; residual scope-content case; `demand`'s final shape.

## Expressions — the final settlement (author-accepted, readable form)

Body is always kv (substrate law; the bare-body idea was withdrawn). No pipes, no markers, no positional args — anywhere.

**A location** — places, intersected:

```
location:
  of: [my-project, tasks]
```

**A call** — one program, named args always:

```
call:
  program: diff
  args: { old: a, new: b }     — param names from the program's argument archetype's instance spec
```

**A collation** — members (each a location or an expression), settings, predecessor:

```
collation:
  members:
    mine:     location …
    theirs:   location …
    overview: expression …      — one grouped unit
  settings:     which members show; surface pairing per shown member
  predecessor:  the collation this was edited from
```

**An expression** — a grouped unit: its own named nodes + `out`; names resolve internal nodes first, then collation siblings (the substrate's scoped-name rule, twice). Expressions may reference sibling expressions.

**Names vs refs, by the grain principle**: interior wiring uses names (values — cheap branching, inline prose, no litter); sharing lifts a node to a chunk and wires harden to refs. The call grammar holds both: `literal | ref | name`.

**The written language** (classical, rock-solid; trivially parseable — context-free, recursive descent):

```ol
diff(
  old: follow(from: [my-project, tasks]),
  new: where(in: [their-project, tasks], status: pending)
)
```

- Calls with named args, always. Nest freely for flow.
- Name a member only when reused or wanted visible (collation habit; prose blocks inline everything).
- Value grammar: bareword = reference · `program(…)` = call · `{k: v}` = record literal (structure explicitly braced) · `[a, b]` = list literal (a location where one is expected) · strings/numbers/times.
- A group's last unnamed line is its `out`.
- Storage is the flat named graph — nesting is an anonymous node used once, auto-named at parse; the WYSIWYG editor and the text round-trip.

**Plan-form vs run-form**: expression nodes hold args inline (plans); when a node runs, the engine materializes the record into the argument chunk and the process refs it. One instance spec validates both.

**The pill (small-UI) rule**: never draw the graph in a pill. Resting = out-verb + derived yield (`overview · diff · 14`). Expanded = **the spine**: longest path left-to-right, other inflows as ⊕ join marks; clicking a mark swaps the spine. Full canvas only in the editor. Height is always one line, by construction.

## The spec redistribution (author + steward, mandate for the rewrite)

- **substrate.md** — the type system as law: instance spec + tower invariant (a spec is never for the chunk itself), value primitives and tags, unions-as-tags, body-always-kv, five connection kinds (owned-by · instance · relates · field · mention), enums as value-chunks, links derived at write (permissions both ends), reach = ownership + explicit grants.
- **db.md** — physical only: `owned` in the placement enum, the link table, paths/name-uniqueness on ownership, expression indexes.
- **engine.md** — how programs work: call frame (argument chunk; process body argument/at/status/result), interface declaration, validation at the transitions, draft/run/launch, **expressions whole** (model, evaluation, written language, parse).
- **programs.md** — the actual programs only: catalog, per-program contracts and experience (reader, surfaces, process-view, form, prose, thread face, chrome, citizens/slots). **Rewritten from scratch, next session's single unit, standing on this record.**
- **sdk.md** — boundary translation (native values ⇄ tagged wire), frozen-vs-head argument resolution.

### Guardrails this stretch touches

- **Matching stays spec-level.** Dispatcher-vs-inspector must NOT be registry matching on body state (would break matching-never-sniffs-bodies). The renderer family matches the process *type*; face selection by lifecycle state happens inside the matched program.
- **Drafts are field entities — RULED** (author): they rest visibly by the laws of the system; the draft process holds its draft prose in the substrate — *"there is no in-memory markdown; substrate it is."* Persistence is a consequence, not a policy; nothing auto-sweeps.
- Linearizing the DAG for the scroll: existing seq-tie ruling (commit-time order) covers ties; branch points get their own spawned chrome per §1.
- A view position that is itself a union (several lineages at once) is mission-control rendered by the same lens — interleave is the timeline surface's job, not new mechanism.
