# Programs

The program layer at build depth: what a person sees and does, and the contracts underneath. Rebuilt from three blind re-derivations against the mechanism specs ([`research/cleanroom/`](research/cleanroom/) — scenes, composition, bridge; synthesis and provenance in [`rework.md`](../rework.md)), settled by author rulings. The four mechanism specs are ground truth; where this layer needs what they don't yet hold, the demand is named in [`rework.md`](../rework.md) §5 (R-numbers below), not silently assumed.

This file mixes settled mechanics with open exploration, by nature — and marks the difference **in place**: *Held open*, *Open*, and *direction* mark invitations still being reasoned about together; unmarked mechanics are settled. The interaction design throughout is a starting point with enormous room — treat the marked spots as live, not as decided.

The model-calling programs (`model`, `agent`) have their own spec: [`agent.md`](agent.md).

---

## 1. The call frame

The pattern the whole layer stands on — derived independently by all three clean-room passes.

A process is a **typed call frame**. Its body is the run's lifecycle record:

```
process body: {
  argument: ref     — the argument chunk, named at dispatch
  at:       commit  — the branch head at dispatch, engine-stamped
  status:   ref     — a `status` value chunk (draft | running | done | failed); mutates throughout
  result:   ref     — filled once at completion
}
```

The **argument is its own chunk**, placed `instance` on its archetype and nowhere else — the process body's `argument` ref *is* the connection (a typed key, link-indexed both ways; a placement too would be a second home for one fact). **Validation at dispatch is one placement check**: is this chunk an instance of what the program's `argument` ref names. Its body is the filled record, **frozen wholesale at dispatch** — two refs bracketing the run, every key on `engine/process` statically typed. Results mirror: `instance` on the result archetype only (type membership — every answer enumerable); the `result` ref is the connection, and the program's right to write it is declaration-derived — the declared result archetype sits implicitly within the run's write boundary. **`accepts` retires from the spec language**: content composition is typed ref-lists in bodies, argument validation is this placement check, chunk typing is `instance` on archetypes — the engine's union-accepts machinery retires at the cross-spec fold. *Open:* any residual scope-content contract case that resurfaces with evidence. Two chunks, one regime each: the argument freezes at one transition, the process mutates through the rest — `status` moving, `result` filled at completion. *Held open:* nesting the argument record into the process body (fewer chunks, one lifecycle chunk) is a future simplification — separate chunk chosen for v0.1 because whole-chunk freeze and the existing machinery are simpler. `awaitRun` returns the process; the result is one hop. Because the substrate is lossless, **the frame persists**: every call ever made is durable, queryable, viewable. Re-run is a read plus a spawn; audit is `db/commits ∩ process`; the trace is the process tree itself.

**Frozen safety or rolling head.** The record freezes, but the chunks it references live on and may change during the run. The SDK makes the choice explicit: resolving the argument **at the dispatch commit** (`at`) is the default — reproducible, exactly what the run was given; following the **living head** is the deliberate choice for programs that want liveness — the reader following its reading is this, plus a subscription. Same temporal machinery, one stamped commit, two honest modes.

### A program's interface is its body

A program chunk (`instance` on `engine/program`) declares itself in its own body, with typed keys (the substrate's `keys` — adopted; fold pending, [`research/typed-bodies.md`](research/typed-bodies.md)):

```
{ executable, runtime, capabilities?, timeout_ms?,
  argument: ref → archetype        — one; its instance spec carries the parameters, per-key `?` optional
  result:   ref → archetype        — one; default named `output`; a pure viewer may declare none
  demand:   { read: [ref…], write: [ref…] }?   — the argument-independent residue
  uses:     [ref → program, …]?    — the programs it runs, for the launch surface
  presets:  [ref → collation, …]?  — shipped views (§3.5)
}
```

The argument archetype carries the parameters in its instance spec — types, refs, lists and sets, per-key docs, `grants: read|write` markers (a filled ref makes its target a boundary root of the run; the intrinsic boundary stays the ceiling) — with per-key optionality: required by default, `?` marks optional; no `required` array. **Enums are the substrate's**: a key needing a closed vocabulary is typed `ref(X)` where X's instances are the values (`status: ref(status)` — `draft`, `running`, `done`, `failed` as chunks); no enum machinery in the keys language, and the link index answers "all running" as one lookup, derived, no placement churn — the rejected enumerator-index pattern stays rejected. **Parameters are keys, period**: twins are distinguished by name — `{old: ref(A), new: ref(A)}`, `{left: list<ref(A)>, right: list<ref(A)>}` — and nothing anywhere depends on position. The multi-role escape hatch is closed; it reopens only on evidence.

**Typing goes as deep as archetypes are named.** Bodies have always stored arbitrary JSON nesting, reader-interpreted; typing enters where a named archetype declares shape in its instance spec. Anonymous nested maps remain untyped, as bodies always were: the ownership fence holds at depth.

**Role is conferred by reference**: an archetype is this program's argument or result because the program's keys say so. The former umbrella archetypes (`programs/argument`, `programs/result`), the standalone demand chunk, and the `body.schema` documentation convention all retire — placement and convention pressed into reference service, cured by typed bodies. Names carry no hierarchy: an interface archetype is found from its program, never by global name or path, so every program having an `output` collides nowhere. The line that holds the anatomy: **placement for membership, reference for description** — the frame keeps genuine membership (children, result chunks, everything written), the interface lives in bodies.

This one convention feeds three consumers with zero duplication: the **`form`** renders fields and boundary chips from the argument archetype's instance spec, the **agent** compiles provider tool schemas from the same spec (one record per call — the exact shape provider tool-calls already are), and **pipelines** type-check plans before running them. Docs: `body.text` on the program (one paragraph, human- and model-facing); per-key docs in the specs.

**Levels of abstraction, held deliberately.** This anatomy is substrate-level. A person never interacts with these chunks separately — the launch form ties program, arguments, grants, and capabilities into one form; the palette shows one entry; the agent sees one tool. **Concepts built of several chunks render and behave as one concept.** Taking things apart in the substrate is precisely what lets the surface be whole; showing the seams to the user would be a failure of the surface, not honesty.

**Reference arguments, plainly.** Most arguments *reference* things rather than contain them: the reader's argument declares it wants a reading — `reading: ref(reading)` in its argument archetype's instance spec; ids are wire mechanics beneath the contract. The program retrieves everything itself — it reads its own process record and follows the ref through its granted boundary; the `grants` marker on the same key is what put the target into the boundary request. Holding a reference grants nothing: if the run wasn't granted reach over the target, the read fails with `BOUNDARY_VIOLATION` — you can hand anyone an address; the engine decides at their door. That is what "references are never capabilities" means. (Typed refs largely retire R12 `attach` — the honest typed channel it existed to provide now exists; re-examine what narrow case remains.)

**Arguments are immutable; living state is referenced.** A process's arguments are what it got at start — the record never mutates. Where a long-lived program needs state that changes (a reader navigating, a draft being composed), the argument is an immutable *reference* to a data chunk that lives; edits are commits on that chunk; the subscription delivers them; the process re-reads without restarting — and because the reference is stable, the process can equally be killed and respawned at any time without losing anything. One rule across the layer: **processes never mutate; data chunks live; records pin commits** (a dispatch records the commit its reads resolved at, so later edits rewrite nothing).

## 2. Lifecycle: the field owns the work

**Ruling.** Surfaces are *viewers* of work, never owners. The death of a launcher — a palette dismissed, a tile closed, the host itself — must not destroy anything about what's going on.

Two run modes (this resolves R4):

- **`run` (child).** Composed work. The child nests `instance` on the caller's process — trace lineage — and cancellation cascades: cancel an agent turn, its in-flight tool calls die with it. For work that *is part of* the caller's work.
- **`launch` (detached).** The process is placed `instance` on the session, not on the caller; it survives the launcher. Boundaries are still intersected with the launcher's at spawn — detachment never escalates. For work the caller *starts* but does not own: everything a surface or the palette initiates.

Closing a tile therefore never kills a process — it unmounts a viewer. Terminating is always an explicit act (sidebar context menu, `cancel` with the R3 authority rule or an alternative close shortcut or combination press).

**Before either mode: the draft.** A process chunk may exist before dispatch — state `draft` — with its argument under composition. The argument is **editable iff unconsumed**: a draft's argument chunk is being written (prose, context selection, filled fields — all substrate-resident; there is no in-memory draft state); dispatch consumes it, stamping the resolution commit on the process, and it freezes wholesale. The `form` (§3.4) is the citizen that appears wherever an unconsumed argument is. Drafts are field entities: an abandoned draft rests visibly where it was begun — unsent thought — and only an explicit gesture deletes it; nothing auto-sweeps. A draft whose argument cites the previous turn joins that thread's lineage like any turn (session.md), which is why a composer sits at a thread's end: the draft *is* there.

The same decoupling is the direction for the engine itself: **the engine as a daemon** (`horizon.md`). Hosts become windows that *attach* — start a host, select a session, and you are purely in that session; several windows stand open on one field with no state drift; the engine eventually reachable over the network. v0.1 links the engine into the host binary, but the seam is already a protocol, so nothing forecloses the daemon. Until it lands, a host crash kills running executables — with every step committed, nothing recorded is lost, and re-run re-arms interrupted runs from their frames. Logical ownership lives in the field; the host is a viewer of it.

Programs also come in two temporal shapes: **one-shots** (a run that ends — all of v0.1) and **daemons** (programs that stay resident — services, watchers, live integrations). A truly functional compute environment needs both. v0.1 ships only one-shots, but the lifecycle must extend to daemons without a new primitive — a daemon is a process whose terminal transition is a policy (stop, restart), not the end of a job. Deferred, named (§6).

## 3. The interface, concretely

What follows is the experience layer at the depth of "an agent could build it": what is on screen, what every click does, where every piece of state lives.

### 3.1 The frame

At boot (host.md's sequence): one window per host instance. The **frame machinery** — the window, tile geometry and its direct manipulation, the background — is host-level, rendered natively in Rust: tiling is where performance and feel are won (the bar is an operating system, not an app), and native rendering keeps the door open for surfaces beyond webviews — native compute-graphics tiles. (The far extension — down to the Linux distro, every executable a program — is on the horizon, far away.)

The **sidebar** and **tab bar** are surface programs — webviews the host positions nakedly on the background, outside tile geometry, not in split panes (boot-suite boundaries: sidebar reads `[session, engine/process, engine/program]`, writes `[session]`; tab-bar read/writes `[session]`). *Held open:* letting them go host-native later — the pull would be visual coherence (their cards carrying exactly the tile cards' shadow and styling) and performance; for now their visual demand doesn't justify the exception, so they stay programs.

The visuals are truly minimalistic: sidebar and tabs naked on the background; running work rises as cards; rest falls flat. The active session chunk is resolved or created; its tabs render. Tiles of terminal one-shots render flat with a one-key *respawn* — a run is a run, it doesn't resurrect; daemons, when they land (§2), have their own start policy instead.

### 3.2 The sidebar — the session rendered as itself

The sidebar draws the session's processes from the field — `session ∩ engine/process`, joined with the further dimensions a usable rendering needs (program names, statuses, tile placements) — which is why it never lies. A surface program (§3.1), driven by the same scope queries any program could make.

**Item anatomy.** Program name; an args digest (the argument chunk's leading text, truncated); a status form — *running* renders as a raised card (with elapsed time), *completed* falls flat into plain text, *failed* flat with an error mark; containers (groups/recipes) expand to their children, indented.

**Click rules.**
- Running process with a surface → focus its tile (switch tab if needed; brief flash on the tile).
- Running VM process (no surface) → open or focus a **process-view** tile on it (§3.7).
- Terminal process → open the process-view in autopsy form: args, results, boundary, commits — plus *re-run* and *review changes*.

**Context menu** (any item): *jump to tile* (if surfaced), *inspect*, *terminate* (running; explicit, cascades to its children), *review changes* (terminal), *re-run* / *new from this* (launch form pre-filled from the frame), *hide* (a `relates` placement onto a session-local `hidden` chunk — non-destructive; the sidebar reads session minus hidden, R10 negation) and naturally more to come.

### 3.3 The palette — the front door

Leader key opens the palette as a session-anchored overlay. One input; four modes falling out of what it reads, switched by prefix or arrow:

- **Run** (default): fuzzy over `engine/program` instances, federated across mounts (peer programs grouped under their mount name). Enter → §3.4.
- **Find** (`/` prefix): whole-field FTS (R10), results grouped by archetype, each row showing its scopes; Enter opens a reader on the chunk, modifier-Enter opens it beside the focused tile.
- **Recent** (`@`): the session's processes; Enter re-runs with the same args (one keystroke from "again").
- **Do** (`>`): arrangement intents — split, close, move tile, wrap selection, save recipe, spawn recipe, new tab, branch ops (R1) — all dispatched to the arranger (§3.9).

The palette owns nothing: every consequence is a `launch` or an arranger intent, so dismissing it kills only the palette.

### 3.4 Running a program — the `form`

Selecting a program in the palette expands the **`form`** inline in the overlay — the generated argument editor, **generated by default, authored when wanted**. One program serves every unconsumed argument in the system: the palette launch, the draft turn's composer (session.md), the *re-run* and *new from this* pre-fills — `form` is the citizen matched wherever an argument exists that has not yet been consumed (§2, the draft). What follows is what every program gets for free from its argument archetype; a program may equally ship its own launch surface, and nothing prevents a custom one:

1. **Fields** from the argument archetype's instance spec: each key's type drives the input — string → text field, enum → select, number → number field, chunk-reference → a search-backed picker (same FTS as Find mode). Required keys (from `spec.required`) are marked; optional documented keys fold away or stay open, by preference — the UI is to be as efficient and intuitive as possible, not dogmatic.
2. **Boundary chips**: read and write roots derived live from the `grants:` fields as you fill them, plus the program's static demand; editable via the same picker. The intrinsic boundary shows as the ceiling — you can narrow a run, never widen it.
3. **Capability line**: what world access the program declares (`net`, `fs`, `exec`, `secret:*`) — displayed for consent, enforced by the runtime provider (R8). Held open (§6): whether capabilities-and-secrets is an isolated host feature or one family with integrations — both are declarations about reaching the world outside the field.
4. **Uses line**: the *programs* this program runs — the agent lists its toolset (web, filesystem, shell, sub-agents), an orchestrator its stages — read from declared dependencies, shown beside capabilities. A program's effective reach is the pair: what it touches in the world, and what it calls in the field; both belong in front of the person before Go.
5. **Go**: `launch` (detached, §2). A program with no required arguments and a satisfied demand runs on plain Enter — no form.

Where the output lands: a webview program mounts into a tile (split of the focused tile, or new tab with a modifier) and appears in the sidebar; a VM program appears in the sidebar only — click it for its process-view. Completion is visible as the card falling flat; failure marks the card and the process-view carries the error.

Composing before running is the draft (§2): `form` writing into a draft's argument chunk is the same program in its other seat — field-resident composition, dispatch as the consuming gesture. A prompt field is a schema key like any other, so a markdown-capable prompt entry (or voice transcription landing in it) is argument-section care, not a separate composer program.

### 3.5 Viewing the substrate — the `reader`

The reader is thin chrome: it renders nothing and merges nothing. It serves a persistent **reading**, keeps its **collation** of members rendered side by side, and pairs each shown member with a surface. The surfaces — `sequence`, `table`, `document` — are separate programs, syncing through the field, never through shared process state. (Built today as `read-tile` v0; renamed with this growth.)

Its interface declares the types (reference keys below are typed body keys — adopted; the substrate fold is pending, model in [`research/typed-bodies.md`](research/typed-bodies.md)):

- **`reading`** — the persistent store the program serves (its argument: an immutable reference, §1). The chunk remains itself; its body's **`current`** ref moves to the collation in view — state as a body key, per the grain rule. Display name derives from the current collation; explicit naming is optional.
- **`collation`** — one immutable value: **a set of named members, plus reader settings**. Its body's **`predecessor`** ref cites the collation it was edited from — editing from anywhere branches, nothing is ever deleted; identity captures version, so a reference to a collation never goes stale. *Open:* what is navigation-grade (a retarget yes; a visibility toggle?).
- **Members** come in two kinds, as siblings:
  - **`location`** — one selected place: an intersection of scopes (chips: type to add, × removes, at least one remains — built). Added by the cheapest gesture — click a thing, select a context. Locations are the raw ingredients, heterogeneous and open: scope selections, a settings chunk, a preferred language.
  - **`expression`** — a **field expression** (the DSL: locations as nouns, the pipe verbs — `follow`, `at`, `where`, `fold`, `explode` — as verbs). An expression may *inline* its own places, or *reference sibling locations by name* — several expressions drawing on one sibling; names resolve within the collation, the substrate's own scoped-name rule. Expressions are pure: no surface is baked into them.
- **Surface pairing.** Every member shown gets a surface — auto-picked by shape (table below), overridable per member — recorded in the reader settings. **There is always a surface** is a rendering rule, not data: the same expression shows as a table today and a graph tomorrow without being edited. *Open, author-flagged (needs understanding, settles at the reader build):* whether pairing stays settings or earns objecthood ("binding").

**Editing.** Add, hide, drop members; chips edit a location in place; an expression is edited form-grade (an argument assignment — the `form`'s job), the flow visible: locations → pipes. Any edit commits a new collation citing the last, and the reading's `current` moves. Drilling is a navigation; search is FTS within what is rendered; the header tracks HEAD by subscription — every commit touching what the members resolve to re-renders, whoever wrote it.

**Default surfaces**, first match wins:

| A member resolves to | Default surface |
|---|---|
| ordered scope | `sequence` — rows by seq, each element slotted through the ladder; several ordered arguments interleave (seq/time, commit-time ties) |
| instances sharing an instance spec | `table` — columns from the instance spec's keys, sortable |
| a single chunk | `document` — body text via `prose`; placements as chips; `relates` in the margin |
| a process | `process-view` (§3.7) |
| mixed / unordered | `sequence`, ordered by commit time — cards dissolved: narrow wrapping slots are sequence config, archetype grouping is a pipe (`group`) |
| empty scope | invitation — what belongs here, derived from the archetype's keys; one keystroke to a conforming chunk |

Dead roots render explicitly — empty invites, dead does not. Unnamed chunks show truncated ids; reference errors render inline, quietly. Only `document` distinguishes `instance` from `relates` (*open for revisit*; `document`'s own dissolution into `prose` + placement chrome is flagged, awaiting the author's word).

**Slot chrome.** Every slot carries default chrome, surface-independent and derived: per-location markings — each location has an identity (location A is red → a red dot on slots whose element it contains, from the *whole* collation regardless of which member is rendering) — and connection counts (how many relates reach this element). Scope-to opens the connections as a location; **scope-in-place** expands them into a nested sequence inside the slot. Hideable per location; the surface computes none of it — add a location and it is instantly a cue source. `db/commits` needs no special surface for the same reason: an ordered scope, served by `sequence`, each commit showing its body (the message), its connections as chrome. (Surface-declared chrome roles held open as the custom escape.)

**Opening a collation.** Collations are values, so sharing needs no template mechanism: opening any collation — yours, a colleague's, one a program `relates` as its shipped view — is a fresh reading pointing at it; the first edit branches. Agents ship shaped: one relates, nothing copied.

**Folding is a pipe; attributes are per-element pipes.** `fold(summaries)` is a pure stage in an expression: any summary relating several elements of the piped sequence replaces them (a summary chunk placed on its members *is* the group); unfolding is removing the stage — or scope-in-place. Where no summary exists, folding requests one (`summarize`, narration §3.7). An attribute is an adjunct slot beside each element, filled per element — `el → intersect(commits)` puts each turn's commits beside it; a member's setting, `sequence`-only in v0.1. Surfaces own arrangement — order, adjunct geometry; content always slots through the ladder — so grid, timeline, graph join as siblings over the same contract.

**`prose`.** Markdown, standard order — CommonMark plus the `ol:` scheme the host already serves; no invented syntax. Three reference forms, three renderings: `<ol:id>` bare → a **badge** (live chrome: name, status); `[chosen name](ol:id)` → a named link, the author's text as face; `![](ol:id)` → a **widget**, placed like an image. A reference may name a location — a *description*, resolving to many chunks. Every location a fenced expression uses becomes a mention too — link-indexed, and like all mentions governed by boundaries: write-gated by the writer's reach, read-filtered by the reader's. And prose carries the DSL: a fenced **field-expression block** is an anonymous expression living in the text, rendered as a widget by the same pairing rules — the mermaid pattern; **lifting** it (the moment it needs identity: cited elsewhere, opened in a reader, shipped) makes it a chunk the prose then references. An answer may be a sequence of prose and typed chunks; citable pieces become chunks, connective prose stays body. (Supersedes `[[id]]`.)

**Contract.** One argument: its reading — a typed ref, immutable (§1). Reads: what the current collation's members consume; commits, for freshness; files via `filesystem` when referenced. Writes: nothing but new collations and the reading's `current`. A viewer can never mutate what it views; any collation restores its exact view; the process is disposable — kill, recycle, respawn; the view lives in the field.

*Postponed deliberately:* the expression editor's visual design (structure pinned above; the look settles at build); custom chrome roles; attributes beyond `sequence`; adjacency layout beyond `sequence`'s interleave; expression normalization (when two location descriptions count as the same). *Open, flagged by the author:* agent contexts as selections — a turn's context may cite several turns or a piped expression (`follow | fold(…)`, including summaries the agent itself writes to purify its context); what the thread face does with N-source contexts is unexplored.

#### Composition within a view — verbs, citizens, slots

Shared machinery, not lens-specific: any surface composes this way.

**Verbs from the field.** Every rendered entity carries a generated context menu: built-ins (*open beside*, *copy* — the clipboard is an ordered chunk with native host integration) plus **programs whose argument types accept what is at hand**. Declare an argument type and your program appears as a verb wherever such an entity is on screen — *talk about this* creates a draft citing the entity (§3.6) and opens the `form` at point. The menu itself is one first-party point-anchored overlay program; menus built inside individual programs are interim only.

**Citizens.** The same registry match in resident form: a verb runs once, a citizen stays attached to the view. Every view has a compatible set; each citizen is dormant, minimized (a living widget — pause/play on a turn, a narration's current line), or expanded. **The tile is scoped, not programmed**: all programs in a view are citizens; the chosen surface holds the *ground*, others dock or minimize — let `narrate` hold the ground and narration-as-default-view falls out with no mechanism. Citizens are invited, **governed by the person, always** — expansion is the person's gesture, dismissal always available, and a citizen's reach is its boundary: it sees what is viewed, not the field. Which citizens are open is reader settings. *Open:* the visual form (corner widget stack is one sketch); whether the ground must be occupied; the ensemble host demand (a tile leaf relates one process; an ensemble needs a group or subtiles) — settles by building the thread tile.

**Surfaces embed surfaces — the slot-and-hook architecture.** A surface must render other programs within its own layout. Settled across rounds six through nine:

1. **A slot is a scope, offered as invitation.** A surface marks a position with the scope it is about — *in-flow* (the reply slot at a message), *pinned* (the composer at scroll-bottom, position infinity-plus), *widget* (the corner stack). That is all the surface does: it never selects, fetches for, or manages citizens. **The embedder governs geometry, never content.** (This deliberately revises the clean-room constraint "surfaces never nest in the DOM" — right for tiles, wrong as a universal.)
2. **Matching is infrastructure.** The SDK's slot layer — a provider at the surface's React root — consults the registry (programs whose argument types accept the slot's scope); the view recipe supplies defaults; the person governs. The parent program never handles matching.
3. **The invitation is not the diet.** A placed citizen declares its own needs via hooks, at any component depth, beyond the inviting scope if needed — fragment-style: children take ids, their own hooks pull more. The React-native pattern developers already hold.
4. **Resolution is coalesced.** Per render pass the provider collects every hook declaration across the tree, builds one normalized, deduplicated query, resolves it at **one commit snapshot**, and projects each hook its slice. One request per pass; frame coherence (all citizens render the same field state); one subscription, with the commit's touched-set re-rendering only whose slices changed. Hooks are free to use; there is no per-citizen fetch storm. Parents pass **addresses, never content** — arrangement authority and data authority stay separate.
5. **Embedding never escalates.** An in-realm citizen's reads are capped at *citizen ∩ embedder* — data landing in a realm is visible to that realm, so reach can never exceed it. Which makes the two grades a **privacy decision**: *projected* (in-realm React components; content shared with the parent's realm — near-tautological, since it is displayed inside the parent's view) versus *sovereign* (own realm — sandboxed iframe now, DOM-stream under uniform containment — for confidential interaction like the composer's keystrokes, live/effectful execution, untrusted code; per-slot transport identity, §6; the embedder cannot observe its content, and no citizen escapes its slot). Minimized forms stay data — projections of citizen frames — so realms stay few. In-realm library composition (one author importing components) remains a third thing that is not embedding at all.

*Declared open — honestly, to avoid settling by context exhaustion rather than understanding:*
- **The rendering deep-dive.** Many citizens means advanced rendering: per-level batching (a child's hooks appear only after its parent's data), multiple renders, and the question of whether sovereign realms running React *inside* the iframe with the same SDK provider replicate the full hook/resolver behavior per realm. Static need declarations on the interface chunks are the known waterfall cure. All of this settles by **building the thread tile**, not by more spec.
- **Where the normalized cache lives** — per view, or one per host beside the engine that all views share. Lean: per-host, keyed by chunk id + commit (rhymes with cache-embodiment, `horizon.md`).
- **Carried from earlier rounds:** the UI-as-data shape for host-projected output; purity enforcement (read-only handles, intents as the only effect channel); whether `projection` becomes a third runtime kind — resonant with projection-as-one-primitive (context assembly, tool schemas, surfaces).

*Open — who arranges the peers.* The ground citizen owning all slots sits uneasily: this is a compute environment, and many views will hold multiple peers over the same subject — worth shipping one nice, uniform answer rather than each medium reinventing arrangement. Candidate split, unsettled: **medium-independent** placement (which citizen holds ground, what docks, what minimizes) belongs to a *shared arrangement layer*, the same across all views, governed by the person; **medium-dependent** anchors (the reply slot at message N — only the thread knows where message N is) are *offered* by the ground into that layer, never owned as placement authority. Whether the composer is ever pinned inside the thread at all is itself undecided — more examples than the conversation are needed. Nothing is harmed by the thread view arranging itself first (the system's openness permits it); it may just not be the optimum. Also open: the slot protocol (declare / occupy / resize / vacate), performance ceilings, and the minimal v0.1 cut (possibly just pinned + in-flow, in the thread view).

The interaction design throughout this section is a starting point with enormous room — explored in the building, not exhausted here.

### 3.6 The thread — conversations dissolved into the field

There is no conversation program, and no conversation container. **A thread is derived, never stored**: turn B follows turn A iff B's argument cites A (context provenance, recorded on frames — [`agent.md`](agent.md)); the rendered sequence is the **`follow`** walk over those citations, a pure program, usable as a pipe stage or as library code inside a surface. Two turns citing one predecessor are a branch; one turn citing two lineages is a merge — git one level up: turns as commits, citations as parents, names as refs. Context is not transitive: each turn sees exactly its recorded list; the chain works by per-turn compression; the view's cascade lives in the walk.

**A conversation is a named location.** Naming, sharing, binding readers to, or inviting participants into a lineage materializes a location chunk; participants attach there as relations. Until then, the thread exists only as the walk.

**The composer is the `form` on a draft.** No type gates dispatch: the form appears wherever a draft is (§2), and creating a draft is the gesture — *talk about this* creates one citing the entity at hand. An email thread grows no composer because nothing creates a draft there unbidden. A draft citing the last answer joins the lineage — the composer sits at the thread's end because it *is* there.

**Face follows context.** The thread renders as what the next turn will see: the draft's context is a location in the reader's collation, so the face is the assembler's proposal. **Reading is free; including is a gesture** — expanding folds, drilling frames, wandering into referenced threads feeds the agent nothing; staging writes into the draft's context (union a location in), from any tile with the grant. Elements wear their inclusion state via slot chrome (§3.5); deviation between face and context is marked, never silent. The discourse register — everything that ever happened here — is a location switch away.

**What accumulates**: summary chunks placed on the turns they abstract — the chunk *is* the group; a fold routes the lineage through it — and controls, `relates` on the turn they steer ([`agent.md`](agent.md)). Verbs everywhere per §3.5; a folded turn's live obligations penetrate the fold; streaming is partial commits (R6); third-party types join by declaring type and renderer.

*Open:* gate placement — frame-only vs surfaced into the thread mid-run (either way it penetrates folds); the cross-tile staging grant shape; mixed human–human threads (settles when built). *Held open, author not ready to trust:* version-bound references as record data — stale-display (§3.7) and collations as values (§3.5) remove most of its purpose; revisit only against a real case.

### 3.7 The `process-view` — one thin surface for every process

Renders any process — a draft, a shell command, an agent turn, a model call — across the whole lifecycle, no AI-specific chrome anywhere: there is no separate dispatcher, inspector, or turn face. A thin layout of regions over process anatomy; **what fills each region is derived from what's there**:

1. **Argument** — the argument chunk's record, boundary chips (roots walked from grants), capabilities. **Editable iff unconsumed** (§2): on a draft this region *is* the `form`; from dispatch on, the frozen record, resolvable at the stamped commit or at head (§1).
2. **Frame** — children (the whole call tree, recursive) interleaved with `db/commits ∩ process`: everything the run wrote, anywhere, with nothing it could hide. Streams by subscription while running; the same read is the autopsy. Empty on a draft.
3. **Result** — the process body's `result` ref (§1), validated against the declaration: explicit, not a query. The agent's seventeen file edits are frame history; its declared answer is the face.

A thread holding a done turn, a running turn, and a draft is one program rendering three derived fillings; the agent-specialized reading ([`session.md`](session.md) — derived status, streamed thinking, cycle segments) arrives via the renderer ladder, not a second program. **Stale-display**: an argument whose referenced chunk has since changed or died still shows *as it was*, marked — derived from then-commit vs head (generalizes unresolved-roots from *gone* to *changed*). Actions: *cancel* (R3), *pause*/*resume* ([`agent.md`](agent.md)), *re-run*, *review changes*; on a draft, *run*.

**Live abstraction — `narrate`.** The process-view (and any viewer) can run `narrate` over what it shows: a model-driven summary maintained in real time — *what is going on here, in words*, updating as an agent reasons and calls tools. Words in the narration are chrome: mentions of entities, tool calls, or moments are deliberate links — press one to jump to the thing itself; the narration can splice in the visuals themselves where that serves. Narration chunks are ordinary derived data (`relates` on what they abstract, pinned to source commits), so the folds of §3.5 can use them, and the same mechanism scales from a single tool call to a long chain of reasoning — abstraction at whatever altitude you're navigating.

*Direction, held plainly:* v0.1 starts rudimentary. The reach is narration as a **calibrated, first-class default view mode** — reading the field through its live abstraction rather than its raw structure — magical against today's tooling, and needing real tuning to earn "default." A direction to grow into, not v0.1 polish.

### 3.8 History, review, merge

- **`history`** — commits over any scope, chunk, process, or branch: message, timestamp, responsible process (one click to inspect). Select two commits → structural diff (two `at:` reads, diffed chunk-by-chunk). *Open at commit* mounts a reader whose location is pinned `at(commit)`.
- **`review`** — judgment over a body of changes: everything a process or session wrote, grouped by chunk, before/after from temporal reads. Per group: *keep*, *revert* (runs `revert` — an inverse declaration; undo-by-addition, itself attributable history).
- **`merge`** — branch review: what changed on each side since the fork point, chunk-level conflicts, the two-parent merge commit. The acceptance workflow — agent works a branch, human reviews, merge is the yes — blocked on R1 and worth it.

### 3.9 Arrangement — tabs, tiles, recipes

Tabs are working sets; tiles are where processes face the person; both are chunks, so **arrangements have history too** ("how was my screen set up Tuesday" is a temporal read). Command-shaped mutation of tabs/tiles/recipes goes through one small trusted program — the **arranger** (`board`) — so the tile tree has exactly two writers: the arranger (intents from any program: mount, split, close, move, wrap, save-recipe, spawn-recipe) and the host's own direct-manipulation commits (drag-resize, drag-reorder). Narrow programs get arrangement effects by asking the arranger — trust concentrating by composition.

**Recipes** (settling host.md's open item — identity-based for v0.1): a saved subtree where each leaf records `{ program, argument declarations, boundary roots, view state }` cloned from the live processes. Spawning re-declares args and rebuilds boundaries fresh; a `group` container gives the spawned set one sidebar identity and one lifecycle. Recipes list across mounts — a teammate's bench spawns locally with programs resolved from their peer mount. Slot-based recipes (holes the user fills at spawn) are a later layer on the same shape.

## 4. The program set

| Program | Runtime | Role |
|---|---|---|
| `reader` | webview | thin chrome serving a reading: collations of members, surfaces side by side (§3.5) — built today as `read-tile` v0 |
| `sequence`, `table`, `document` | webview | the ground surfaces, paired by shape, composing through slots (§3.5) — cards and history dissolved into `sequence` |
| `process-view` | webview | the universal process surface, whole lifecycle: argument · frame · result (§3.7) — absorbs dispatcher, inspector, turn face |
| `form` | webview | the generated argument editor: palette launch, draft composer, re-run pre-fill — every unconsumed argument (§3.4) |
| `prose` | webview | markdown with slots; `[[mention]]`s through the ladder at link/inline/block grades (§3.5) |
| `edit` | webview | hand-authoring: chunks, placements, specs; `VALIDATION_ERROR` inline as form validation; `dry_run` preflight when R12 lands |
| `history`, `review`, `merge` | webview | time, judgment, acceptance (§3.8) |
| `term` | webview | terminal surface; each command one `shell` run — sidebar-visible, re-runnable |
| `sidebar`, `tab-bar`, `palette` | webview | chrome as programs, naked on the background (§3.1–3.3) |
| `board` (arranger), `group` | vm | arrangement writer; container lifecycle (§3.9) |
| `follow` | vm | pure: the citation walk — point in, lineage out, branch/join points included (§3.6); pipe verb beside `at`, `where`, `explode` |
| `narrate` | vm | live model-driven abstraction of any scope or process; summaries as linked chrome (§3.7) |
| `model` | vm | one model call per run — see [`agent.md`](agent.md) |
| `agent` | vm | the harness — see [`agent.md`](agent.md) |
| `filesystem` | vm | file ops + file-reference resolution; frame-only substrate boundary; authority = `fs` capability |
| `shell` | vm | one command, one process |
| `web` | vm | fetch; `net` capability; frame-only boundary — it can exfiltrate nothing it wasn't handed |
| `echo` | vm | the loop proof; the narrowest possible program |
| `select` | vm | a query reified as a frame — stable anchor for "this result set" (feeds views, context, pipelines) |
| `ingest` | vm | content → typed structure on target scopes (model-calling); how external matter enters the medium |
| `summarize`, `embed`, `recall` | vm | derived data as ordinary chunks on derivation scopes; semantic entry beside FTS |
| `reconcile` | vm | integration drift: walks reference chunks, compares source commits, badges stale ones via `relates` |
| `revert` | vm | undo-by-addition from `db/commits ∩ target` + temporal reads |

**Result archetypes, named** (the §1 rule applied — the pass that unblocks `process-view` and federated enforcement). Each is an archetype named as listed, referenced from its program's `results` key — found from the program, never by global name or path (§1). Default name `output` unless a better noun is earned: `shell` → `output` `{stdout, stderr, exit}` · `web` → `output` `{status, headers, body}` · `filesystem` → `output` (op-shaped by a `kind` key: content, entries, ack) · `echo`, `select`, `embed`, `recall`, `revert`, `reconcile`, `ingest` → `output` each (the reified set, the vector, the receipt, the drift report, the ingestion report; typed structure `ingest` commits lands on target scopes, not as result) · `model` → `output` (already ruled) · `agent` → `answer` (already ruled) · `summarize` → a `summary` chunk (the group mechanism *is* its result). The agent's **`gate`** is a frame chunk, not a result, but declared in `agent`'s interface the same way for the same enforcement reason. Pure viewers (`reader`, `process-view`, `form`, `prose`, chrome) declare no result — their work is the view itself. Pure pipe programs (`follow`, later `at`/`where`/`explode`) return substrate-shaped output: chunks-and-placements, so the algebra composes over results (engine.md §What Is Open, `explode`).

The frame machinery — window, tiling, background — is host-native (§3.1); whether sidebar and tabs eventually join it is held open there.

Full contract derivations: [`cleanroom/scenes.md`](research/cleanroom/scenes.md) §2, [`cleanroom/composition.md`](research/cleanroom/composition.md) §2, [`cleanroom/bridge.md`](research/cleanroom/bridge.md). The minimality rule (composition pass): a primitive program is warranted only where it holds authority the SDK doesn't confer — an external effect, model access, a surface, or a lifetime. Everything else composes, including user-authored programs: forty lines against `@openlight/sdk`, a chunk on `engine/program`, and it is a full citizen — palette-listed, sidebar-visible, trace-recorded.

## 5. Consumption tagging and reproducibility

Every model call's context is addressable structure (see [`agent.md`](agent.md)): context items `relates` on the chunks they included, pinned at the commit each read resolved against. So the field can answer, natively: **which models have consumed this chunk — in which harnesses, which sessions, at which state.** Retrieval's inverse, as a query. And because the verbatim request is the model process's argument chunk, any past completion is exactly reproducible. This was the plan all along; the mechanism is now concrete.

## 6. What this layer demands of the foundation

The consolidated list with evidence grades lives in [`rework.md`](../rework.md) §5. **Status: folded into the mechanism specs.**

- **Fixed (spec bugs):** R5 read-only-mount rule now "modifies," not "references" (engine.md); R7 trace-nesting exempt from typed `accepts` (engine.md), plus the terminal-cleanup-never-severs-the-frame invariant.
- **Landed in the protocol:** R2 pagination + body-less probes (substrate.md, sdk.md); R3 `cancel` with the authority rule; R4 → `mode: child | launch`; R6 → the streaming convention + required coalescing; R9 `results_only` on await; R10 whole-field FTS + `exclude`; R11 `exit`; R12 `dry_run`, timeout-pause-during-await; per-slot identity (engine.md, host.md, sdk.md); `read_batch` — the coalesced multi-identity read (engine.md, sdk.md).
- **Landed as enforcement:** R8 capabilities vocabulary + secrets-as-env-vars-never-chunks (engine.md, host.md).
- **Shaped, held open in engine.md:** R1 branch ops (the settled shape is written; merge semantics stay above the primitives); daemons (terminal-transition-as-policy); pause/resume as convention-first; `attach`.
- **New this round:** *pause/resume* for cycle-driven programs — a control signal honored between cycles; program-level convention first, engine op if it generalizes (see [`agent.md`](agent.md)). *Daemon processes* — the lifecycle extension for resident programs (§2); post-v0.1, but v0.1 decisions must not foreclose it. *Engine as daemon* — hosts as attaching windows (`horizon.md`); the protocol seam already preserves it. *Capabilities/secrets held open* — possibly one family with integrations (declarations about reaching the world outside the field) rather than an isolated host feature; consider together before implementing either.
- **Per-slot transport identity** (surfaces-embed-surfaces, §3.5): the host's IPC bridge must multiplex identities per embedded citizen — each slot's occupant speaks to the engine as *its own* process, not the embedder's; boundaries and commit attribution hold at slot granularity. Lands in host.md + sdk.md. Companion: the ensemble tile (a leaf relating a group of citizen processes rather than one process) lands in host.md.
- **Coalesced multi-identity read** (slot-and-hook resolution, §3.5): one protocol read carrying tagged sub-queries, each authorized under its own citizen identity, resolved together at one commit snapshot. Extends R2/R9. Lands in engine protocol + sdk.md.

## 7. Where this deepens next

This spec carries the experience layer to build depth for the surfaces a person touches first: sidebar, palette, `form`, `reader`, `process-view`. The next pass takes each remaining program to the same depth, in the order they'll be built: `prose`'s inline/block mention grades, `edit`'s placement picker, `history`/`review` diff presentation, the arranger's intent grammar, `term`. Each deepening is also a probe — where a program can't reach its contract with the mechanisms as specced, that lands in the demand list, not in silence.
