# Programs

The program layer at build depth: what a person sees and does, and the contracts underneath. Rebuilt from three blind re-derivations against the mechanism specs ([`research/cleanroom/`](../research/cleanroom/) — scenes, composition, bridge; synthesis and provenance in [`rework.md`](../rework.md)), settled by author rulings. The four mechanism specs are ground truth; where this layer needs what they don't yet hold, the demand is named in [`rework.md`](../rework.md) §5 (R-numbers below), not silently assumed.

This file mixes settled mechanics with open exploration, by nature — and marks the difference **in place**: *Held open*, *Open*, and *direction* mark invitations still being reasoned about together; unmarked mechanics are settled. The interaction design throughout is a starting point with enormous room — treat the marked spots as live, not as decided.

The model-calling programs (`model`, `agent`) have their own spec: [`agent.md`](agent.md).

---

## 1. The call frame

The pattern the whole layer stands on — derived independently by all three clean-room passes.

A process scope is a **typed call frame**. Arguments go in at spawn as chunks placed `instance` on the process, validated by the program's propagating `accepts`. Results come out as typed chunks the program places `instance` on its own process (always within its write boundary — structural invariant). `awaitRun` returns the frame; the caller filters by result type. And because the substrate is lossless, **the frame persists**: every call ever made is a durable, queryable, viewable object. Re-run is a read plus a spawn; audit is `db/commits ∩ process`; the trace is the process tree itself.

### A program's interface is chunks

A program chunk (`instance` on `engine/program`, body: `executable`, `runtime`, `capabilities?`, `timeout_ms?`) describes itself through chunks placed `relates` on it:

- **Argument types** — the type declarations for what a run receives, `instance` on `programs/argument`. Granularity rule: **one argument chunk per role, keys within it.** A program taking a few primitives declares *one* argument type (say `request`) whose body carries them all as keys — `spec.required` lists the mandatory keys, `body.schema` documents all of them (types, enums, descriptions): document everything, require some. A second argument type earns its place only when the argument is a genuinely different kind of thing — a different role (`command` and `stdin`), a different source, or something repeated N times. Never one type per primitive.
- **Result types** — same shape, `instance` on `programs/result`; validated exactly as strictly as arguments.
- **Grants** — which argument fields imply reach. A schema field marked `grants: read` (or `write`) means: the scope this field names becomes a boundary root of the run. That is how a launcher knows what to ask — you picked a target to view, so the run needs read reach over it; most real boundary needs are argument-dependent, so they live on the fields. A static `programs/demand` chunk covers only the residue: roots a program always needs regardless of arguments (the palette always reads `engine/program`). The intrinsic boundary stays the hard ceiling the engine enforces; grants and demand are what the *request* is derived from.
- **Docs** — `body.text` on the program (one paragraph, human- and model-facing); per-field docs in the schemas.

This one convention feeds three consumers with zero duplication: the **launch form** renders fields and boundary chips from the same chunks, the **agent** compiles provider tool schemas from them, and **pipelines** type-check plans before running them. Role marking is placement; shapes live in body.

**Levels of abstraction, held deliberately.** This anatomy is substrate-level. A person never interacts with these chunks separately — the launch form ties program, arguments, grants, and capabilities into one form; the palette shows one entry; the agent sees one tool. **Concepts built of several chunks render and behave as one concept.** Taking things apart in the substrate is precisely what lets the surface be whole; showing the seams to the user would be a failure of the surface, not honesty.

**Reference arguments, plainly.** Most arguments *name* things rather than contain them: `read`'s target is the *id* of the scope to view, carried in the argument's body. The callee then reads that scope through its own granted boundary — holding an id grants nothing. If the run wasn't granted reach over what the id names, the read fails with `BOUNDARY_VIOLATION`: you can hand anyone an address; the engine decides at their door. That is what "references are never capabilities" means. (R12 `attach` is a possible refinement — the engine placing the referenced chunk onto the frame itself, so hand-off is visible in the placement graph instead of opaque in a body field.)

## 2. Lifecycle: the field owns the work

**Ruling.** Surfaces are *viewers* of work, never owners. The death of a launcher — a palette dismissed, a tile closed, the host itself — must not destroy anything about what's going on.

Two run modes (this resolves R4):

- **`run` (child).** Composed work. The child nests `instance` on the caller's process — trace lineage — and cancellation cascades: cancel an agent turn, its in-flight tool calls die with it. For work that *is part of* the caller's work.
- **`launch` (detached).** The process is placed `instance` on the session, not on the caller; it survives the launcher. Boundaries are still intersected with the launcher's at spawn — detachment never escalates. For work the caller *starts* but does not own: everything a surface or the palette initiates.

Closing a tile therefore never kills a process — it unmounts a viewer. Terminating is always an explicit act (sidebar context menu, `cancel` with the R3 authority rule or an alternative close shortcut or combination press).

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

**Item anatomy.** Program name; an args digest (the first argument chunk's name or leading text, truncated); a status form — *running* renders as a raised card (with elapsed time), *completed* falls flat into plain text, *failed* flat with an error mark; containers (groups/recipes) expand to their children, indented.

**Click rules.**
- Running process with a surface → focus its tile (switch tab if needed; brief flash on the tile).
- Running VM process (no surface) → open or focus an **inspector** tile on it (§3.7).
- Terminal process → open the inspector in autopsy form: args, results, boundary, commits — plus *re-run* and *review changes*.

**Context menu** (any item): *jump to tile* (if surfaced), *inspect*, *terminate* (running; explicit, cascades to its children), *review changes* (terminal), *re-run* / *new from this* (launch form pre-filled from the frame), *hide* (a `relates` placement onto a session-local `hidden` chunk — non-destructive; the sidebar reads session minus hidden, R10 negation) and naturally more to come.

### 3.3 The palette — the front door

Leader key opens the palette as a session-anchored overlay. One input; four modes falling out of what it reads, switched by prefix or arrow:

- **Run** (default): fuzzy over `engine/program` instances, federated across mounts (peer programs grouped under their mount name). Enter → §3.4.
- **Find** (`/` prefix): whole-field FTS (R10), results grouped by archetype, each row showing its scopes; Enter opens a read-tile on the chunk, modifier-Enter opens it beside the focused tile.
- **Recent** (`@`): the session's processes; Enter re-runs with the same args (one keystroke from "again").
- **Do** (`>`): arrangement intents — split, close, move tile, wrap selection, save recipe, spawn recipe, new tab, branch ops (R1) — all dispatched to the arranger (§3.9).

The palette owns nothing: every consequence is a `launch` or an arranger intent, so dismissing it kills only the palette.

### 3.4 Running a program

Selecting a program in the palette expands the **launch form** inline in the overlay — **generated by default, authored when wanted**. What follows is what every program gets for free from its argument chunks; a program may equally ship its own launch surface, and nothing prevents a custom one:

1. **Fields** from the program's argument chunks: `body.schema` drives the input type — string → text field, enum → select, number → number field, chunk-reference → a search-backed picker (same FTS as Find mode). Required keys (from `spec.required`) are marked; optional documented keys fold away or stay open, by preference — the UI is to be as efficient and intuitive as possible, not dogmatic.
2. **Boundary chips**: read and write roots derived live from the `grants:` fields as you fill them, plus the program's static demand; editable via the same picker. The intrinsic boundary shows as the ceiling — you can narrow a run, never widen it.
3. **Capability line**: what world access the program declares (`net`, `fs`, `exec`, `secret:*`) — displayed for consent, enforced by the runtime provider (R8). Held open (§6): whether capabilities-and-secrets is an isolated host feature or one family with integrations — both are declarations about reaching the world outside the field.
4. **Uses line**: the *programs* this program runs — the agent lists its toolset (web, filesystem, shell, sub-agents), an orchestrator its stages — read from declared dependencies, shown beside capabilities. A program's effective reach is the pair: what it touches in the world, and what it calls in the field; both belong in front of the person before Go.
5. **Go**: `launch` (detached, §2). A program with no required arguments and a satisfied demand runs on plain Enter — no form.

Where the output lands: a webview program mounts into a tile (split of the focused tile, or new tab with a modifier) and appears in the sidebar; a VM program appears in the sidebar only — click it to inspect. Completion is visible as the card falling flat; failure marks the card and the inspector carries the error.

The launch form is also a standalone program (`launch`): the sidebar's *new from this* and the inspector's *re-run* open it pre-filled from an existing frame.

### 3.5 Viewing the substrate — the read-tile

One viewer program, `read`, is the default lens on anything. Its **presentation is inferred from what the scope structurally is** — the typed substrate choosing the surface, with the user able to override:

| Shape of the scope | Default view |
|---|---|
| ordered (`ordered: true`) | **Sequence** — rows by seq, newest visible; session-typed scopes get transcript styling |
| instances share an archetype with a `body.schema` | **Table** — columns from schema keys, sortable |
| mixed / unordered | **Cards** — grouped by archetype, name + leading text |
| a single chunk | **Document** — `body.text` as prose; other body fields as key-values; placements as chips (*instance of X*, *placed on Y*); `relates` neighbors (notes, drift marks, summaries) in the margin |
| `db/commits ∩ anything` | **History** — commit list: message, time, process link (§3.8) |
| a process | hands off to the **inspector** layout (§3.7) |
| empty scope | **Invitation** — what the scope's spec `accepts`, one keystroke to create a conforming chunk |

A mode switcher overrides the inference (sequence / table / cards / document); the choice persists in the tile's view-state chunk on the process frame, so re-runs and recipes restore the exact view. Authored overrides beyond that — a per-archetype renderer registered by another program, or a dedicated view program — are the second rung of the interface-inference ladder (`horizon.md`).

**Navigation is scoping.** The tile header holds the scope as **chips**: add a chip to intersect (narrow), remove to widen — the set updates live. Click any rendered chunk to drill (re-scope in place, breadcrumb grows; back walks it); modifier-click opens beside. A search box scopes by FTS within the current intersection. A time control pins the tile `at:` any commit (header shows the pinned commit; a *now* button returns). Freshness: the header shows the HEAD short-id and updates via subscription — every commit that touches the scope re-renders it, whether a keystroke, a tool, or a model wrote it. That is the bridge, visible.

**Verbs from the field.** Every rendered entity — a chunk, a scope chip, a selection — carries a context menu that is itself generated. Alongside the built-ins (*open beside*, *copy* — the clipboard is an ordered chunk with native host integration, so anything carried can be dropped anywhere an argument is expected), the menu lists **programs whose argument types accept what is at hand**. Declare an argument type, and your program appears as a verb wherever such an entity is on screen: a conversation program taking a scope-range argument shows up as *talk about this* on any entity — pick it, a popup opens at point (an overlay), expandable into a full tile, the relation already filled. This is the same modularity as everything else: the entity at hand is a scope (or an id), the verb is a program, the binding is an argument.

**Folding.** Any region — a chunk, a section, a stretch of sequence — folds into its summary and expands back. Where a summary exists (from `summarize`, or live narration §3.7) the fold uses it; where none exists, folding can request one. "Structure this heap into reasonably nested levels of abstraction, and let me navigate at the depth I choose" is a program call away — abstraction as a navigation control, not a report.

**Citizens — every viewed scope invites them** (ruling: a core mechanic, not a conversation feature). What §3.6 discovered for conversations generalizes to any view: every viewed scope has a **compatible set** of citizens — programs that can join because their argument types accept what is on screen. Verbs from the field and citizens are the same registry match in two presences: a verb is *momentary* (run once from the menu), a citizen is *resident* (attached to the view, alive alongside it). A read-tile on a plan can host `narrate`, a drift badge, a discussion; a conversation hosts its composer; an inspector hosts turn controls. Each citizen is in one of three states — **dormant** (a compatible affordance, not running), **minimized** (running, in its minimal living form — a widget that carries its essential controls and live output: pause/play on a turn, the one-line current summary of a narration), **expanded** (its full form, in place). Which citizens are open, and how, persists in the tile's view-state chunk — recipes and re-runs restore the citizen arrangement with everything else.

**Control, with respect.** Citizens are *invited* — by participants, by scope type, by the person — and **governed by the person, always**: see what is compatible, open, minimize, dismiss. Respect is the rule: a citizen never seizes space or attention on its own — expansion is the person's gesture (or an explicitly granted escalation, kin to overlay anchoring); dismissal is always available; a citizen's reach is its boundary — it sees the viewed scope, not the field. *Open — the visual form:* one sketch under consideration, deliberately not settled: citizens as small icon widgets overlaid in the view's bottom-right corner, the bottom-most being the manager of available citizens. The mechanics above are the ruling; the form is to be found in the building.

*Direction under discussion — the peer inversion.* The thread renderer and the composer are registered for the same scope type; treating one as "the view" and the other as a joiner is a dissonance. The shape being considered: **the tile is scoped, not programmed** — a tile's subject is a scope, and *all* programs in it are citizens, peers ontologically, distinguished only by **role**: one holds the *ground* (the background layer), others dock, minimize to widgets, or lie dormant. The thread is just the citizen currently holding the ground — minimize it and the composer alone remains (a quick-dispatch tile); let `narrate` hold the ground and narration-as-default-view falls out with no mechanism at all. `read` demotes gracefully to the default ground citizen for arbitrary scopes. Per-citizen boundaries sharpen trust (the thread citizen cannot write; the composer can), and "what opening X looks like" becomes a **view recipe** per archetype — defaults, customization, and sharing of view arrangements unify with recipe mechanics. *Open within the direction:* whether the ground must be occupied; a named host demand — a tile leaf currently relates one process, an ensemble needs the leaf to relate a group (container mechanics) or subtiles. Settles by building the conversation tile as the first ensemble, not by more spec.

**Surfaces embed surfaces — the slot-and-hook architecture** (settled to the depth this exploration could carry; the technical residue is declared open below, deliberately). Composition of what's on screen does not belong solely to the host's split: a surface must render other programs within its own layout, or the citizen model never reaches the conversation. What settled, worked out across rounds six through nine:

1. **A slot is a scope, offered as invitation.** A surface marks a position with the scope it is about — *in-flow* (the reply slot at a message), *pinned* (the composer at scroll-bottom, position infinity-plus), *widget* (the corner stack). That is all the surface does: it never selects, fetches for, or manages citizens. **The embedder governs geometry, never content.** (This deliberately revises the clean-room constraint "surfaces never nest in the DOM" — right for tiles, wrong as a universal.)
2. **Matching is infrastructure.** The SDK's slot layer — a provider at the surface's React root — consults the registry (programs whose argument types accept the slot's scope); the view recipe supplies defaults; the person governs. The parent program never handles matching.
3. **The invitation is not the diet.** A placed citizen declares its own needs via hooks, at any component depth, beyond the inviting scope if needed — fragment-style: children take ids, their own hooks pull more. The React-native pattern developers already hold.
4. **Resolution is coalesced.** Per render pass the provider collects every hook declaration across the tree, builds one normalized, deduplicated query, resolves it at **one commit snapshot**, and projects each hook its slice. One request per pass; frame coherence (all citizens render the same field state); one subscription, with the commit's touched-set re-rendering only whose slices changed. Hooks are free to use; there is no per-citizen fetch storm. Parents pass **addresses, never content** — arrangement authority and data authority stay separate.
5. **Embedding never escalates.** An in-realm citizen's reads are capped at *citizen ∩ embedder* — data landing in a realm is visible to that realm, so reach can never exceed it. Which makes the two grades a **privacy decision**: *projected* (in-realm React components; content shared with the parent's realm — near-tautological, since it is displayed inside the parent's view) versus *sovereign* (own realm — sandboxed iframe now, DOM-stream under uniform containment — for confidential interaction like the composer's keystrokes, live/effectful execution, untrusted code; per-slot transport identity, §6; the embedder cannot observe its content, and no citizen escapes its slot). Minimized forms stay data — projections of citizen frames — so realms stay few. In-realm library composition (one author importing components) remains a third thing that is not embedding at all.

*Declared open — honestly, to avoid settling by context exhaustion rather than understanding:*
- **The rendering deep-dive.** Many citizens means advanced rendering: per-level batching (a child's hooks appear only after its parent's data), multiple renders, and the question of whether sovereign realms running React *inside* the iframe with the same SDK provider replicate the full hook/resolver behavior per realm. Static need declarations on the interface chunks are the known waterfall cure. All of this settles by **building the conversation tile**, not by more spec.
- **Where the normalized cache lives** — per view, or one per host beside the engine that all views share. Lean: per-host, keyed by chunk id + commit (rhymes with cache-embodiment, `horizon.md`).
- **Carried from earlier rounds:** the UI-as-data shape for host-projected output; purity enforcement (read-only handles, intents as the only effect channel); whether `projection` becomes a third runtime kind — resonant with projection-as-one-primitive (context assembly, tool schemas, surfaces).

*Open — who arranges the peers.* The ground citizen owning all slots sits uneasily: this is a compute environment, and many views will hold multiple peers over the same scope — worth shipping one nice, uniform answer rather than each medium reinventing arrangement. Candidate split, unsettled: **medium-independent** placement (which citizen holds ground, what docks, what minimizes) belongs to a *shared arrangement layer*, the same across all views, governed by the person; **medium-dependent** anchors (the reply slot at message N — only the thread knows where message N is) are *offered* by the ground into that layer, never owned as placement authority. Whether the composer is ever pinned inside the thread at all is itself undecided — more examples than the conversation are needed. Nothing is harmed by `converse` arranging itself first (the system's openness permits it); it may just not be the optimum. Also open: the slot protocol (declare / occupy / resize / vacate), performance ceilings, and the minimal v0.1 cut (possibly just pinned + in-flow, in `converse`).

**Contract, plainly.** What `read` is given: one required argument — the scope ids to view (`target`) — plus optional documented ones (`add`, `exclude`, `at`, `match`). What it reads: the target intersection; commits, for the freshness line; file contents via `filesystem` when a reference chunk is on screen. What it writes: nothing anywhere except one view-state chunk on its own frame (mode, breadcrumb, folds) — so re-runs and recipes restore the exact view, and the viewer can never mutate what it views.

This section is a deliberate starting point — rudimentary on purpose. The mechanics are settled (inference from shape, scoping as navigation, verbs from the field, folding); the interaction design above them has enormous room, and it is meant to be explored in the building, not exhausted here.

### 3.6 The conversation — `converse`

**Ruling: conversation is the broader primitive, not an agent feature.** A conversation is an ordered scope of typed events — and it is central to being human in this environment: talking with an agent, with another person, around an email thread, about the entity at hand. An "agent session" is simply a conversation an agent participates in; there is no separate agent-session kind. The agent does not build its own session UI — it joins conversations.

**Modular rendering — the conversation invites citizens.** Everything addressable renders inline at its natural representation: a scope, a chunk, even a single field on an entity (an agent reasoning *about a point* shows that point in place). Small enough → in line; larger → a fold that **expands in place, within the conversation** — taking it out to a tile is an option, never the only path. Agent-specific citizens — tool calls, gates, context markers — are just event types with first-class renderings; **third-party event types join the same way**: declare the type, provide (or inherit) its representation, and it renders in any conversation without touching agent or converse code.

**The composer is a citizen** (ruling). Rendering the thread is half; *composing into it* is the other half, and it carries kind-specific chrome — an email reply has its form, an agent dispatch has chips and controls, a plain message has almost none. That chrome is supplied the same way rendered citizens are: a pluggable **composer** joins the conversation surface — one tile stays one intuitive thing, and the modularity is exactly what the system requires. Nor is the composer the only joiner: opening a thread may bring further citizens with it (gate rendering, narration affordances, kind-specific controls). Citizen mechanics and the person's control over them are general, not conversation-specific — see §3.5 (*Citizens*, *Control with respect*): participants and scope type *invite*; the person governs. *Open:* whether **participants** (as relations on the conversation) are indeed the selection mechanism, and how far third-party citizens carry on the interaction side — to be proven by building the first two conversation kinds.

**Starting and relating.** A conversation starts empty, or pre-related from a shortcut — *talk about this* (§3.5) opens one already carrying the entity as a relation, the way you'd open a file and start talking about it. Relations are placements, so a conversation about a plan section sits *on* that section for anyone who later reads the section.

**Surface.** The transcript rendered from the conversation scope — messages, streaming answers (partial commits, R6), tool calls as one-liners expanding into the real process (the inspector inline), pending **gates** approve/deny in place. Input row: text plus the chip sets, visible before anything runs — **context** (read roots), **grants** (write roots), **toolset**. Interaction is absolutely not limited to typing: pausing a running turn, gate decisions, dropping entities in as relations (see [`agent.md`](agent.md) for pause/resume and context purity).

**Contract.** Args: a conversation reference (or none — creates one, placed on chosen scopes). Writes: message chunks (dual-placed: conversation + type), gate decisions, pause/resume signals. Launches: `agent`, one process per turn, detached (§2) — closing the tile leaves the turn running; the sidebar still shows it. A branch selector (R1) flips the next turn onto a work branch; `merge` (§3.8) brings it home.

### 3.7 The inspector — one lens for every run

Renders any process — shell command, agent turn, model call — no AI-specific chrome anywhere. Three regions, all plain scope reads:

1. **Run** — program, status, error if any, elapsed/timeout; the arguments (frame chunks of argument type; for a `model` process this is the verbatim context window).
2. **Authority** — the boundary chunks walked to their roots, rendered as two chip rows (read / write); declared capabilities beside them.
3. **Activity** — children (processes `instance` on this one, recursive — the whole call tree) interleaved with `db/commits ∩ process`: everything this run wrote, anywhere, with nothing it could hide.

Live via subscription while running; an autopsy afterward — same code path. Actions: *cancel* (R3), *pause*/*resume* for cycle-driven programs (see [`agent.md`](agent.md)), *re-run*, *review changes*.

**Live abstraction — `narrate`.** The inspector (and any viewer) can run `narrate` over what it shows: a model-driven summary maintained in real time — *what is going on here, in words*, updating as an agent reasons and calls tools. Words in the narration are chrome: mentions of entities, tool calls, or moments are deliberate links — press one to jump to the thing itself; the narration can splice in the visuals themselves where that serves. Narration chunks are ordinary derived data (`relates` on what they abstract, pinned to source commits), so the folds of §3.5 can use them, and the same mechanism scales from a single tool call to a long chain of reasoning — abstraction at whatever altitude you're navigating.

*Direction, held plainly:* v0.1 starts rudimentary. The reach is narration as a **calibrated, first-class default view mode** — reading the field through its live abstraction rather than its raw structure — magical against today's tooling, and needing real tuning to earn "default." A direction to grow into, not v0.1 polish.

### 3.8 History, review, merge

- **`history`** — commits over any scope, chunk, process, or branch: message, timestamp, responsible process (one click to inspect). Select two commits → structural diff (two `at:` reads, diffed chunk-by-chunk). *Open at commit* mounts a pinned read-tile.
- **`review`** — judgment over a body of changes: everything a process or session wrote, grouped by chunk, before/after from temporal reads. Per group: *keep*, *revert* (runs `revert` — an inverse declaration; undo-by-addition, itself attributable history).
- **`merge`** — branch review: what changed on each side since the fork point, chunk-level conflicts, the two-parent merge commit. The acceptance workflow — agent works a branch, human reviews, merge is the yes — blocked on R1 and worth it.

### 3.9 Arrangement — tabs, tiles, recipes

Tabs are working sets; tiles are where processes face the person; both are chunks, so **arrangements have history too** ("how was my screen set up Tuesday" is a temporal read). Command-shaped mutation of tabs/tiles/recipes goes through one small trusted program — the **arranger** (`board`) — so the tile tree has exactly two writers: the arranger (intents from any program: mount, split, close, move, wrap, save-recipe, spawn-recipe) and the host's own direct-manipulation commits (drag-resize, drag-reorder). Narrow programs get arrangement effects by asking the arranger — trust concentrating by composition.

**Recipes** (settling host.md's open item — identity-based for v0.1): a saved subtree where each leaf records `{ program, argument declarations, boundary roots, view state }` cloned from the live processes. Spawning re-declares args and rebuilds boundaries fresh; a `group` container gives the spawned set one sidebar identity and one lifecycle. Recipes list across mounts — a teammate's bench spawns locally with programs resolved from their peer mount. Slot-based recipes (holes the user fills at spawn) are a later layer on the same shape.

## 4. The program set

| Program | Runtime | Role |
|---|---|---|
| `read` | webview | the universal lens (§3.5) |
| `edit` | webview | hand-authoring: chunks, placements, specs; `VALIDATION_ERROR` inline as form validation; `dry_run` preflight when R12 lands |
| `converse` | webview | the conversation (§3.6) — the general primitive, agents as participants |
| `inspect` | webview | the universal process lens (§3.7) |
| `launch` | webview | the generated run form (§3.4) |
| `history`, `review`, `merge` | webview | time, judgment, acceptance (§3.8) |
| `term` | webview | terminal surface; each command one `shell` run — sidebar-visible, re-runnable |
| `sidebar`, `tab-bar`, `palette` | webview | chrome as programs, naked on the background (§3.1–3.3) |
| `board` (arranger), `group` | vm | arrangement writer; container lifecycle (§3.9) |
| `narrate` | vm | live model-driven abstraction of any scope or process; summaries as linked chrome (§3.7) |
| `model` | vm | one model call per run — see [`agent.md`](agent.md) |
| `agent` | vm | the harness — see [`agent.md`](agent.md) |
| `filesystem` | vm | file ops + file-reference resolution; frame-only substrate boundary; authority = `fs` capability |
| `shell` | vm | one command, one process; `{stdout, stderr, exit}` result |
| `web` | vm | fetch; `net` capability; frame-only boundary — it can exfiltrate nothing it wasn't handed |
| `echo` | vm | the loop proof; the narrowest possible program |
| `select` | vm | a query reified as a frame — stable anchor for "this result set" (feeds views, context, pipelines) |
| `ingest` | vm | content → typed structure on target scopes (model-calling); how external matter enters the medium |
| `summarize`, `embed`, `recall` | vm | derived data as ordinary chunks on derivation scopes; semantic entry beside FTS |
| `reconcile` | vm | integration drift: walks reference chunks, compares pinned commits, badges stale ones via `relates` |
| `revert` | vm | undo-by-addition from `db/commits ∩ target` + temporal reads |

The frame machinery — window, tiling, background — is host-native (§3.1); whether sidebar and tabs eventually join it is held open there.

Full contract derivations: [`cleanroom/scenes.md`](../research/cleanroom/scenes.md) §2, [`cleanroom/composition.md`](../research/cleanroom/composition.md) §2, [`cleanroom/bridge.md`](../research/cleanroom/bridge.md). The minimality rule (composition pass): a primitive program is warranted only where it holds authority the SDK doesn't confer — an external effect, model access, a surface, or a lifetime. Everything else composes, including user-authored programs: forty lines against `@openlight/sdk`, a chunk on `engine/program`, and it is a full citizen — palette-listed, sidebar-visible, trace-recorded.

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

This spec carries the experience layer to build depth for the surfaces a person touches first: sidebar, palette, launch, read-tile, inspector. The next pass takes each remaining program to the same depth, in the order they'll be built: `converse` message-level behavior, `edit`'s placement picker, `history`/`review` diff presentation, the arranger's intent grammar, `term`. Each deepening is also a probe — where a program can't reach its contract with the mechanisms as specced, that lands in the demand list, not in silence.
