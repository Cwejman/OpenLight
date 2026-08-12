# Programs

The actual programs: what each one is, its contract, and what a person sees and does. Mechanics are referenced, never restated — the call frame, lifecycle, boundaries, containment and expressions are [`engine.md`](engine.md); the type system and the reach law are [`substrate.md`](substrate.md); the model programs and the thread experience are [`agent.md`](agent.md). Provenance: rebuilt from three blind re-derivations ([`research/cleanroom/`](research/cleanroom/)), settled through the 2026-08 author dialogs.

This file mixes settled contracts with open exploration and marks the difference **in place** — *Held open*, *Open*, *direction*. Unmarked mechanics are settled; the interaction design throughout is a starting point with enormous room.

One rule governs the whole layer: **concepts built of several chunks render and behave as one concept.** The anatomy — program body, payload chunks, process record — is substrate-level; the person sees one composer, one palette entry, one tool. Showing the seams would be a failure of the surface, not honesty.

And one economy governs the catalog: a primitive program is warranted only where it holds authority the SDK doesn't confer — an external effect, model access, a surface, or a lifetime. Everything else composes, including user-authored programs: forty lines against `@openlight/sdk`, a chunk `instance` on `engine/program`, and it is a full citizen — palette-listed, sidebar-visible, trace-recorded.

---

## 1. The screen — the shell, seats, and grades

At boot ([`host.md`](host.md)): one window per host, one webview, one document. There is **one compositor** — the web tree ([`engine.md`](engine.md#containment)) — so the shell (`host/shell`) is a **view program**, not host chrome. Window-level arrangement, tile geometry and its direct manipulation are program-authored DOM. Rust keeps the window, OS input, the VM and keychain, the engine and `ol://` serving, and nothing visual beyond the one rect.

Arrangement is therefore one language floor to ceiling: **a tile tree, a collation and a slot are the same kind of thing at three altitudes**, and that kind is a *seat*.

### Seats

A seat is a box plus an offer — geometry the embedder governs, and a **selection** the seat is about (substrate.md, *Archetypes and Contracts*). What fills it is decided by matching the offer against programs' `accepts` entries: the same structural match the engine runs at start ([`engine.md`](engine.md), *The match*), asked of content rather than of a composed argument. The embedder says *here, about this*; infrastructure picks the surface (§5).

Four rules, each law rather than convention:

- **A seat never escalates.** A seated program is its own process with its own boundary; what it may read is its own reach intersected with its embedder's (§5). Which realm it gets — same-DOM or iframe — is a containment tier, specced once in [`engine.md`](engine.md#containment).
- **Editability is boundary-derived.** A surface offers editing iff its seat holds **write reach over the target** *and* the target is **unconsumed**. The surface reads its own boundary to decide what to show; the engine enforces regardless, so a lying surface cannot write. One surface, mode by reach: `prose` *is* the editor when writable and the viewer when not. Composition seats grant write; autopsy seats do not. Deliberate editor surfaces survive only as natural re-pairings, never as the mechanism through which editing happens.
- **A seat cannot reach past the boundary.** Prose reads openly — you may read text that mentions chunks and dimensions beyond your reach (substrate.md, *Boundaries*) — but a surface program cannot *run* over a chunk beyond reach. So a citation pointing outside the boundary never resolves into a live surface: it renders as an **unresolved reference**, visible as a reference, at the grade it would have taken, and honest about why. A third face beside the dead root and the reference error (§3). *Open ([`research/arc/dimensions.md`](research/arc/dimensions.md) §8): the chunk-side counterpart — whether content ever inherits the requirements of what it speaks about — is a different player and stays open.*
- **No commit on event.** A surface answers a subscription event by reading only. Anything that writes on events lives viewport-independent — a VM program, an automation ([`engine.md`](engine.md), *Purity*). Without this, gating an offscreen seat would change behaviour rather than only cost.

### Grades — the size dimension of matching

A grade is a declared size band a surface offers. The program body carries them (`grades`, [`engine.md`](engine.md), *The program body*); the seat reads them.

```ol
program prose {
  grades: {                              — declared in ascending order
    badge:  { wmax: 240, hmax: 32 }      — heading only; larger views via the menu
    editor: { wmin: 320, hmin: 160 }
    split:  { wmin: 640, hmin: 240 }
  }
}
```

- Bounds are flat and individually optional — a link may cap height and not width. `grades` absent → one implicit, unbounded grade.
- **Overlap is allowed.** Grades are modes of one surface, not partitions.
- **Matching:** the seat affords a box; a surface matches iff at least one grade admits it. **Largest admitting grade wins by default.** A person opts down through the seat's context menu, and the choice persists as that selection's setting (§3).
- **The chooseability rule:** *if only the box size decides it, it is internal — container queries, undeclared; if a person can choose it, it is declared.* Menus are field chrome by law; chosen grades persist as settings. Expanding into an overlay is the same element re-seated at a larger grade.

### The arrangement layer

The composition archetypes the shell reads and writes. They are the `host` project's, seeded by bootstrap ([`bootstrap.md`](bootstrap.md)); membership is placements, so an arrangement is ordinary field structure with ordinary history.

```ol
chunk host/session { instance: { name?: string, tabs: list<ref(tab)>, current-tab?: ref(tab) } }
chunk host/tab     { instance: { name?: string, root?: ref(tile | engine/process) } }
chunk host/tile    { instance: { direction: string, ratio: number,
                                 children: list<ref(tile | engine/process), 2> } }
chunk host/overlay { instance: { anchor: ref } }
chunk host/recipe  { instance: { name?: string, description?: markdown } }
```

**The tree is typed fields, not placements** (ruled 2026-08-12). The grain rule decides it: a tile's children change while the arrangement remains itself — that is state, and state is a body key. Consequences, each a simplification: order lives in `list<ref>`, so `seq: true` retires from tab and tile; field targets are not *members*, so the naming rule never fires on nameless tiles; and all tiles are **owned flat under the session** — ownership doing only lifetime and address — so the tree's two writers state a one-hop boundary, `[session]`, and the `follow`-shaped correction this section used to need is gone. Union ref-constraints (`ref(tile | engine/process)`) are part of the ruling: a child is a further split or a **process** — the leaf *is* the process.

- **`session`** — the outer container, restorable and shareable. Processes are placed `instance` on a session instance — that is *membership*, correctly a placement, and session membership *is* sidebar presence.
- **`tab`** — a workspace: a name and a root, which is a split tree or a single process filling the tab.
- **`tile`** — a split node, nothing else: `direction` (`horizontal` divides the width, `vertical` the height), `ratio` (the first child's share, clamped inside 0–1), exactly two children. No leaf-tile chunks exist — a leaf position holds a process ref directly.
- **Leaves and re-seating.** The slot is never stateful: view state — surface pairing, grade, settings — lives in the **reading** the process serves, and the process is disposable. Wrong surface? The context menu re-seats: start a different program over the *same* reading or argument; the choice persists in the reading, which survives the swap.
- **`overlay`** — a program rendered above the composition. The overlay chunk is **placed on its span target** — a session, tab, or tile instance — and names the same chunk in `anchor`; the content program is `relates` on the overlay.
- **`recipe`** — a subtree preserved for spawning: each leaf records `{ program, argument elements, boundary selections, view state }`, re-declared fresh at spawn (§7). The live form is a **composition** — a container process visible as one unit in the sidebar. Collapsing the container stops its children.

**Geometry.** A binary split tree — the same primitive the earlier pilot used, kept because it is the right one. The shell walks the active tab's tree and lays it out in DOM: rounded-corner cards around each leaf, a small gap between them, a composition as an outer card with its inner tiles bordered only. There are no rectangles outside the document; tiling happens *inside* the webview, which is the whole point of one compositor — host-positioned children under a DOM scroller smear a frame behind.

**View modes.** v0.1 walks one geometry, tabs. It is one view on the composition chunks, not the only one: a view mode is a program over the same archetypes, so other modes (zoomable canvas, outline, graph) are additive rather than forks. That claim now costs nothing — the geometry interpreter *is* a program, which is what *view modes* always meant. Directions in [`horizon.md`](../horizon.md#view-modes-beyond-tabs).

**Overlays.** The anchor decides the span: a session overlay covers the window (the palette), a tab overlay the current tab, a tile overlay one tile. Placing an overlay on its anchor needs **write over the anchor chunk** — nothing is inherited, since ownership confers no subtree (substrate.md, *Propagation by hop*), so a program reaches even its own tile only if its boundary says so. Anchoring higher is not an escalation to negotiate but an intent handed to the arranger (§7). *Open:* the escalation semantics, and whether the arranger route covers every case.

**Writers.** The tile tree has exactly two: the **arranger** (`board`, §7), which takes intents from any program, and the **shell**, which commits its own direct manipulation. With tiles owned flat under the session, both state the one-hop boundary `[session]` — tree edits are body edits on session, tab and tile chunks, all one hop from the root they hold write over.

### Visual language

The window is a quiet canvas: light padding around the tiling area; the sidebar directly on the background — text on the canvas, no panel, no border; tabs as pills at the top; tiles as rounded cards with a small gap; `hsl(0 0% 98%)` as the canvas gray, dark mode a later refinement. iOS-flavoured rounding, subtle rather than dramatic.

**Depth is program-drawn, in both registers.** In-flow cards — strip items — carry a surface fill and a centred soft glow; floating surfaces — tiles — carry a CSS shadow into a transparent margin. The host-cast aura is retired with per-tile webviews: it was the platform-coupled path (native only on macOS, hand-painted elsewhere), and CSS renders identically everywhere. One rounding convention, one home: `@openlight/react`'s `--ol-radius`.

Life reads as life: a running process is a card with the same rounding as a tile; a completed or failed one is flat, its content directly on the background. The visual language distinguishes life from rest without a label. Programs never style scrollbars — the platform's overlay scrollbars own every surface. Strip edge fades are dynamic per edge: present only where content hides, absent at rest, so the first card sits exactly on the padding line. Where names collide across mounts — same-named chunks under separate owners are different chunks — the shell disambiguates visually.

The visuals are truly minimalistic: running work rises, rest falls flat. Tiles of terminal one-shots render flat with a one-key *respawn* — a run is a run, it doesn't resurrect.

*Open — colour.* Whether a colour attribute belongs on places or on programs, and how it surfaces here and in the reader's per-location markings (§3), is unsettled.

### The sidebar — the session rendered as itself

Draws the session's processes from the field — `[session, engine/process]`, joined with what a usable rendering needs (program names, statuses, tile references) — plus whatever else the session explicitly holds, which is why it never lies. What it lists is what its boundary admits, like every other answer (substrate.md, *Boundaries*); there is no privileged view of a full set. `accepts: [ request ]`, the payload naming the session it renders; reads `{[session], [engine/process], [engine/program]}`, writes `{[session]}`.

**Ordering is life before rest, then recency**: running and pending first, terminal newest-first by start time.

**Item anatomy.** Program name; an args digest (the leading text of the argument's elements, truncated); a status form — *running* renders as a raised card with elapsed time, *done* falls flat, *failed* flat with an error mark; a *draft* rests as unsent thought; containers (groups, spawned recipes) expand to their children, indented.

**Click rules.** Running process with a surface → focus its tile. Running VM process → open or focus a `process-view` tile on it. Terminal process → `process-view` in autopsy form. Draft → its seated argument (§2).

**Context menu** — the primary interaction for every item, running or stopped, surfacing the actions that fit its state: *jump to tile*, *inspect*, *terminate* (running; explicit, cascades), *review changes* (terminal), *re-run* / *new from this* (pre-filled from the frame), *edit boundaries*, *hide* (a `relates` onto a session-local `hidden` chunk — non-destructive; the sidebar reads `[session] − [hidden]`). A shift-click quick action shortcuts the common case; every capability stays reachable through the menu without knowing the shortcut exists.

Clearing an item is non-destructive — the substrate is lossless, the entry is un-shown, the process chunk persists. History of what has been run needs no history place: processes *are* the history, and a program's past runs are a read. *Open:* the visual scheme for telling two runs of one program with identical arguments apart — name plus argument digest plus some suffix (timestamp, index, given name) is the shape, the choice is not made.

### The palette — the front door

Leader key opens a session-anchored overlay — started by the host, which places the overlay, since the palette itself holds no write reach over the session. One input; four modes, switched by prefix or arrow:

- **Run** (default): fuzzy over `engine/program` instances, federated across mounts (peer programs grouped under their mount). Enter → the program's draft, seated (§2).
- **Find** (`/`): whole-field FTS, results grouped by archetype, each row showing its places; Enter opens a `reader` on the chunk, modifier-Enter beside the focused tile.
- **Recent** (`@`): the session's processes; Enter re-runs with the same argument.
- **Do** (`>`): arrangement intents — split, close, move, wrap, save recipe, spawn recipe, new tab, branch ops — handed to the arranger (§7).

The palette owns nothing: every consequence is a `launch` or an arranger intent, so dismissing it kills only the palette.

*Open — multi-mount of one program.* One long-running program seated in two tiles: shared single surface, or two surfaces over one backing state? Identity, termination and display semantics settle together, and the seat/process split (§5) is where the answer will be phrased.

*Open — the performance budgets.* Input latency is this stack's named Achilles heel ([`research/arc/one-compositor.md`](research/arc/one-compositor.md) §7): typing latency on prose surfaces, frame budget for shell drags (transform while dragging, true resize on release), staggered initial mounts, idle-means-idle. Numbers and a measurement harness are owed before the shell is coded, and the direct-manipulation grammar itself — drag-to-resize, split creation and removal, minimum tile sizes — is unspecced; the geometry walk stands testable without it. The visual tokens carry no values either — light padding, the small gap, the radius, the strip's bleed margins: the walk takes them as parameters, so tests parametrize over them and the values settle by eye.

## 2. The seated argument — where a run is composed

There is no `form` program. It dissolved, deliberately: it was "a program that knows things" — reading status, deciding modes — and everything it knew is now derived. **An unconsumed argument is simply seated**: each element of the draft's argument rendered by its matched surface at its grade, exactly like any other seat (§1). Editability is boundary-derived, so composition seats offer editing and autopsy seats do not, with the engine enforcing either way.

The draft *is* the process chunk; composing edits `P.body.argument` directly, and editable-iff-unconsumed is enforced on the field ([`engine.md`](engine.md), *The process*). So the same seating serves the palette's launch, the draft turn's composer ([`agent.md`](agent.md)), and *re-run* / *new from this* pre-fills — not because one program covers three cases, but because there is one case.

What survives of the old form is **behaviour relocated into seats**:

1. **Entries, from `accepts`.** A program's contract is a list of reified type entries ([`engine.md`](engine.md), *`accepts`*). Required entries show as must-fill; optional ones fold away until wanted. An element already offered is seated by its own type — a place by a reader surface, an expression by its editor. Primitives never appear as entries, so text and numbers always ride *inside* a payload chunk, and that chunk's own instance contract drives its fields: `string` → text, `number` → number field, `ref(X)` over a closed vocabulary → select, an open `ref` → a search-backed picker (the same FTS as Find).
2. **Boundary chips.** The run's `read`, `write` and `run` keys, as the engine will construct them from the five sources: the frame, argument content (read-granted implicitly by the offer), the program's stated ceiling, explicit additions, and the parent cap ([`engine.md`](engine.md), *Boundaries*). A stated ceiling shows as the ceiling — a run narrows it; exceeding any wall is a draft awaiting approval (run-to-draft, [`engine.md`](engine.md)). The `run` chips are the toolset. `read: {}` / `write: {}` / `run: {}` shows as *fully contained*: `model`, `web` and `filesystem` reach nothing beyond their own frame and start nothing, enforced rather than promised.
3. **Capability line.** Declared world access (`net`, `fs`, `exec`, `secret:*`) — displayed for consent, enforced by the runtime provider.
4. **Uses line.** The programs this one runs — the agent lists its toolset, an orchestrator its stages. A program's effective reach is the pair: what it touches in the world, and what it calls in the field. Both belong in front of a person before Go.
5. **Go** — `launch`, detached. A program whose `accepts` has no required entries and whose ceiling is already exact runs on plain Enter, with nothing to compose.

A program that wants a bespoke composer ships a surface matched to its own payload archetype. That is a natural re-pairing, not a special case and not a second mechanism: the seat still decides, by match and by reach.

Where output lands: a surface program takes a seat (a split of the focused tile, or a new tab with a modifier) and appears in the sidebar; a VM program appears in the sidebar only — click it for its `process-view` (§6). Completion is the card falling flat.

A prompt is a payload key like any other, so markdown-capable prompt entry — or voice transcription landing in it — is care given to one seated element, not a separate composer program.

## 3. `reader` — thin chrome over a reading

The reader renders nothing and merges nothing. It serves a persistent **reading**, keeps that reading's **collation** of selections rendered side by side, and pairs each with a surface. The surfaces are separate programs, syncing through the field, never through shared process state. (Built today as `read-tile` v0; renamed with this growth.)

- **`reading`** — the persistent store the program serves. The chunk remains itself; its body's `current` ref moves to the collation in view — state as a body key, per the grain rule (substrate.md, *Grain*). Display name derives from the current collation; explicit naming optional.

  ```ol
  chunk reading { instance: { current: ref(collation) } }
  ```
- **`collation`** — one immutable value: an ordered `list<selection>` plus collation-wide settings and a `predecessor` ([`engine.md`](engine.md), *The shapes*). Editing from anywhere branches; nothing is deleted; identity captures version, so a reference to a collation never goes stale. *Open:* what is navigation-grade (a retarget yes; a visibility toggle?).
- **Selections, not named members.** A collation holds selections — chunks, places, and pure derivations of places (substrate.md, *Archetypes and Contracts*) — in order, tab-like. There are no collation-local names: an expression in a collation is a **chunk**, and a chunk references its siblings by ref, not by a local key. Display names come from the expression chunks' own `name` — field-native and rename-safe — and the closure rule no longer reaches across collation siblings; names resolve within an expression's own nodes, then outward to its root.
- **Three shapes, as siblings.** A **chunk** — one thing, offered by itself. A **location** — one place, an intersection (chips: type to add, × removes, at least one remains) — added by the cheapest gesture: click a thing, select a context. And an **expression** — locations as nouns, pipe verbs as verbs ([`engine.md`](engine.md), *Expressions*). The first two are a real choice rather than a formality: `X` renders the document, `[X]` renders the document *and what is placed on it* (substrate.md, *Every Chunk Is a Dimension*), so a reader can hold a thing without its room arriving with it — and dropping a chunk into a collation needs no expression to strip its members away. Expressions in a selection are pure by law; impure chains are automations, and you seat their output rather than the automation.
- **Surface pairing.** Every shown selection gets a surface — auto-picked by shape (table below), overridable, recorded in settings along with the chosen grade (§1). **There is always a surface** — a rendering rule, not data: the same expression shows as a table today and a graph tomorrow without being edited. **Choices persist at two grains, both reader-owned** (ruled 2026-08-12): a *per-occurrence* choice is recorded by **making the seat explicit — the pinned surface call** in the collation (the pin already exists; implicit matching is only what happens where nothing explicit is written); an *all-such-occurrences* rule (shape-keyed: "instances of X render with P at grade G") is a collation setting, applying at any slot depth. Either edit commits a new collation, so reload reproduces exactly — the law of surfaces holds. Standing defaults at named locations sit beneath; the registry's shape match is last. *Open:* the same chunk twice in one reading with different wishes (a position qualifier, if ever needed); whether a shared rule lifts to a chunk ("binding") — objecthood by the ordinary lift gesture, settling at the reader build.

**Editing.** Add, hide, drop selections; chips edit a location in place; an expression is edited as a seated argument (§2) with the flow visible: locations → pipes. Any edit commits a new collation citing the last; the reading's `current` moves. Drilling is navigation; search is FTS within what is rendered; the header tracks HEAD by subscription — every commit touching what the selections resolve to re-renders, whoever wrote it.

**Expression display** (the small-UI rule, settled): never draw the graph in a pill. Resting = out-verb plus derived yield (`overview · diff · 14`); expanded = the **spine** — the longest path, one line, other inflows as ⊕ marks, clicking an inflow swaps the spine; the full canvas only in the editor.

**Default surfaces**, first match wins:

| A selection resolves to | Default surface |
|---|---|
| an ordered place (`seq: true` on its archetype) | `sequence` — rows by seq; several ordered selections interleave (seq/time, commit-time ties) |
| instances sharing an instance contract | `table` — columns from the contract's keys, sortable |
| a single chunk | `document` — body text via `prose`; placements as chips; relates in the margin |
| a process | `process-view` (§6) |
| mixed / unordered | `sequence` by commit time — cards dissolved: narrow wrapping is sequence config, grouping is a pipe (`group`) |
| empty place | invitation — what belongs here, derived from the archetype's keys; one keystroke to a conforming chunk |

Three faces are drawn explicitly, never silently: a **dead root** (an empty place invites; a dead one does not), a **reference error** (inline, quietly), and a **beyond-reach reference** (§1 — nothing runnable resolves there because the boundary does not admit it, and the surface says so). Unnamed chunks show truncated ids. Only `document` distinguishes membership kinds visually (*open for revisit*; `document`'s own dissolution into `prose` + placement chrome is flagged, awaiting the author's word). `db/commits` needs no special surface — an ordered place served by `sequence`, each commit showing its message and its touched addresses as chrome, history dissolved. (A projection declares its own ordering — ruled; [`db.md`](db.md).)

**Slot chrome** — derived, surface-independent: per-location markings (each location has an identity — location A is red → a red dot on seats whose element it contains, judged from the *whole* collation regardless of which selection renders it) and connection counts, which describe what the reader's boundary admits, like every count in the system (substrate.md, *Boundaries*). Read-to opens the connections as a location; **read-in-place** expands them into a nested sequence inside the seat. Hideable per location; the surface computes none of it. (Surface-declared chrome roles held open as the custom escape.)

**Opening a collation.** Collations are values, so sharing needs no template mechanism: opening any collation — yours, a colleague's, one a program ships in its `presets` — is a fresh reading pointing at it; the first edit branches. Agents ship shaped: one reference, nothing copied.

**Folding is a pipe; attributes are per-element pipes.** `fold(summaries)` is a pure stage: any summary relating several elements of the piped sequence replaces them (a summary placed on its members *is* the group); unfolding is removing the stage — or read-in-place. Where no summary exists, folding requests one (`summarize`, §6 narration). An **attribute** is an adjunct seat beside each element, filled per element — `el → intersect(commits)` puts each turn's commits beside it: the mutation strip. A per-selection setting, `sequence`-only in v0.1. Surfaces own arrangement — order, adjunct geometry; content always seats through the ladder — so grid, timeline and graph join as siblings over the same contract.

**Contract.** `accepts: [ reading ]` — one typed ref, frozen at start. Reads what the current collation's selections consume, plus commits for freshness. Writes new collations and the reading's `current`, and nothing else. **A viewer never mutates what it views** — but it does write: a new collation is a chunk, and chunk birth is never placementless, so the reader creates it owned by its own frame and moves `current` within its stated write reach (substrate.md, *Who May Write What*). Reading, and writing *about* a reading, are different acts. Any collation restores its exact view; the process is disposable — kill, recycle, respawn; the view lives in the field.

*Postponed deliberately:* the expression editor's visual design; custom chrome roles; attributes and adjacency beyond `sequence`; expression normalization. *Open, author-flagged:* agent contexts as selections — a turn's context may cite several turns or a piped expression (`follow | fold(…)`, including summaries the agent writes to purify its own context); what the thread face does with N-source contexts is unexplored.

## 4. `prose` — markdown with live structure

CommonMark plus the `ol:` scheme the host already serves; no invented syntax. Three reference forms, three grades of the referenced thing's own surface: `<ol:id>` bare → a **badge** (live chrome: name, status); `[chosen name](ol:id)` → a named **link**, the author's text as the face; `![](ol:id)` → a **widget**, placed like an image. A reference may name a location — a *description*, resolving to many chunks. Every reference files a mention, boundary-governed both ways (substrate.md, *Links*).

The ladder degrades honestly. At every one of the three grades a reference beyond the reader's boundary renders unresolved rather than live (§1): the prose still reads — openness is the ruling — but its embedded surfaces stop at the wall. Dead references render as dead; the field never repairs them (substrate.md, *Links*).

Prose carries the expression language: a fenced expression block is an anonymous expression living in the text, rendered as a widget by the same pairing rules — the mermaid pattern. **Lifting** it — the moment it needs identity: cited elsewhere, opened in a reader, shipped — makes it a chunk the prose then references. An answer may be a sequence of prose and typed chunks; citable pieces become chunks, connective prose stays body.

## 5. Composition within a view — verbs, citizens, slots

Shared machinery, not reader-specific: any surface composes this way.

**Verbs from the field.** Every rendered entity carries a generated context menu: built-ins (*open beside*, *copy* — the clipboard is an ordered place with native host integration) plus **programs whose `accepts` entries match what is at hand**. Matching is the engine's own match ([`engine.md`](engine.md), *The match*) run against a selection of the entities in hand — structural, against contracts, never body-sniffing. Declare an `accepts` entry and your program appears as a verb wherever such an entity is on screen — *talk about this* creates a draft citing the entity and seats it at point. **The menu composes by layer** (ruled): at any slot it unions the surface program's own actions, the seat's choices (surface, grade — §1, §3), the embedding reader's actions at that slot (include, hide, read-in-place), and the registry's matched verbs — each contribution labeled by where it came from. The menu itself is one first-party point-anchored overlay program — the same family as the palette, anchored to a point instead of the session; its own drafting unit is queued (board). Menus built inside individual programs are interim only.

**Citizens.** The same registry match in resident form: a verb runs once, a citizen stays attached to the view. Every view has a compatible set; each citizen is dormant, minimized (a living widget — pause/play on a turn, a narration's current line), or expanded. **The tile is a location, not a program**: all programs in a view are citizens; the chosen surface holds the *ground*, others dock or minimize — let `narrate` hold the ground and narration-as-default-view falls out with no mechanism. Citizens are invited, **governed by the person, always** — expansion is the person's gesture, dismissal always available, and a citizen's reach is its boundary: it sees what is viewed, not the field. Which citizens are open is reader settings. *Open:* the visual form (a corner widget stack is one sketch); whether the ground must be occupied; the ensemble question — a leaf position holds one process, and an ensemble needs a group container or subtiling — settles by building the thread tile.

**Surfaces embed surfaces — slot-and-hook.** Settled across the rebirth rounds:

1. **A slot offers a selection.** A surface marks a position with what it is about — *in-flow* (the reply slot at a message), *pinned* (the composer at scroll-bottom), *widget* (the corner stack). That is all it does: **the embedder governs geometry, never content** (§1).
2. **Matching is infrastructure.** The SDK's slot layer consults the registry; recipe defaults and the person govern. The parent program never handles matching.
3. **The invitation is not the diet.** A placed citizen declares its own needs via hooks, at any depth, beyond the inviting place if needed — children take ids, their own hooks pull more.
4. **Resolution is coalesced.** Per render pass the provider collects every hook declaration, builds one normalized deduplicated query, resolves it at one commit snapshot (`read_batch` — [`engine.md`](engine.md), *The Program Protocol*), and projects each hook its slice. Frame coherence; one subscription; touched-set-targeted re-renders. Parents pass **addresses, never content**.
5. **Embedding never escalates.** An in-realm citizen's reads cap at *citizen ∩ embedder*, so choosing the realm is a **privacy decision**: *projected* (rendered in the parent's realm; content visible there — near-tautological, it is displayed there) versus *sovereign* (its own realm, for confidential interaction like composer keystrokes, live execution, untrusted code). The two realms, the wall each gives, and the per-seat identity that makes commit attribution hold are [`engine.md`](engine.md#containment)'s and [`host.md`](host.md)'s; nothing about them is restated here. Minimized forms stay data — projections of frames — so realms stay few.

*Declared open:* the rendering deep-dive (per-level batching, React-inside-iframe replicating the resolver, static need declarations as waterfall cure) — settles by building the thread tile, not by more spec; where the normalized cache lives (lean: per-host, keyed chunk id + commit); the UI-as-data shape, purity enforcement, `projection` as a third runtime kind; who arranges the peers (a shared medium-independent arrangement layer with grounds *offering* medium-dependent anchors is the candidate split — more examples than the conversation needed); the slot protocol and the minimal v0.1 cut.

## 6. `process-view` — one thin surface for every process

Renders any process — a draft, a shell command, an agent turn, a model call — across the whole lifecycle, with no AI-specific chrome anywhere: no separate launcher, inspector, or turn face exists. Three regions over process anatomy; **what fills each region is derived from what's there**:

1. **Argument** — the argument set, boundary chips (the process body's `read` / `write` selections), capabilities. **Editable iff unconsumed**: on a draft this region *is* the seated argument (§2); from the start on, the frozen record, resolvable at the stamped commit or at head ([`sdk.md`](sdk.md), *Resolution modes*).
2. **Frame** — the process's own dimension, `[self]`: its children interleaved with `[db/commits, P]` — everything the run wrote, anywhere, with nothing it could hide. Ownership is one hop, so the children are one read and the *whole* call tree is a `follow`-shaped walk ([`engine.md`](engine.md), *The frame is `[self]`*), expanded on request rather than assumed. Streams by subscription while running; the same read is the autopsy. Empty on a draft.
3. **Result** — the process body's `result` ref, validated against the declaration: explicit, not a query. The agent's seventeen file edits are frame history; its declared answer is the face.

A thread holding a done turn, a running turn and a draft is one program rendering three derived fillings; the agent-specialized reading ([`agent.md`](agent.md) — derived status, streamed thinking, cycle segments) arrives via the renderer ladder, not a second program. **Stale-display**: an argument whose referenced chunk has since changed or died still shows *as it was*, marked — derived from then-commit versus head; it generalizes unresolved roots from *gone* to *changed*, and applies to viewed content, never to collations (values never go stale). Actions: *cancel*, *pause* / *resume* ([`agent.md`](agent.md)), *re-run*, *review changes*; on a draft, *run*.

**Live abstraction — `narrate`.** Any viewer can run `narrate` over what it shows: a model-driven summary maintained in real time — *what is going on here, in words*. Words in the narration are chrome: mentions of entities, tool calls, or moments are deliberate links — press one to jump to the thing. Narration chunks are ordinary derived data (`relates` on what they abstract, pinned to source commits), so folds can route through them, and the mechanism scales from a single tool call to a long chain of reasoning. *Direction, held plainly:* narration as a calibrated first-class default view mode — reading the field through its live abstraction — is the reach; v0.1 starts rudimentary.

## 7. History, review, merge, arrangement

- **`history`** — commits over any place, chunk, process, or branch: message, timestamp, responsible process. Select two commits → structural diff: two `at:` reads compared chunk by chunk, **both filtered by the boundary as it stands now** (substrate.md, *Boundaries* — membership is always current, including under `at`), so a diff shows what you may currently see of the past, never a privileged view of it. (The default rendering of `db/commits` itself is just `sequence`; this program is the judgment surface — diffing, selecting, walking.) *Open at commit* mounts a reader pinned `at(commit)` — in v0.1 scope (ruled 2026-08-12: the machinery beneath it all ships anyway; pilot.md's defer is deleted).
- **`review`** — judgment over a body of changes: everything a process or session wrote, grouped by chunk, before/after from temporal reads. Per group: *keep*, *revert* (runs `revert` — an inverse declaration; undo-by-addition, itself attributable history).
- **`merge`** — branch review: what changed on each side since the fork, chunk-level collisions, the two-parent merge commit. The acceptance workflow — agent works a branch, human reviews, merge is the yes — blocked on branch ops ([`engine.md`](engine.md), *What Is Open*) and worth it.
- **Arrangement.** Tabs are working sets; tiles are where processes face the person; both are chunks, so arrangements have history too ("how was my screen set up Tuesday" is a temporal read). Command-shaped mutation goes through one small trusted program — the **arranger** (`board`) — which, with the shell's own direct manipulation, makes exactly two writers of the tile tree (§1). **Recipes** (identity-based for v0.1): a saved subtree where each leaf records `{ program, argument elements, boundary selections, view state }` cloned from live processes; spawning re-declares fresh, and a `group` container gives the spawned set one sidebar identity and one lifecycle. Recipes list across mounts. Slot-based recipes — holes filled at spawn — are a later layer on the same shape. *Open:* cross-tab wrap policy (wrapping a tile that is visible in another tab), and the marquee gesture on the padding for selecting a subtree to wrap, save, or delete.

## 8. The program set

| Program | Runtime | Role |
|---|---|---|
| `host/shell` | webview | the window: tab bar, tile tree, direct manipulation, overlays, the canvas (§1) |
| `reader` | webview | thin chrome serving a reading: a collation's selections side by side (§3) — built today as `read-tile` v0 |
| `sequence`, `table`, `document` | webview | the ground surfaces, paired by shape, composing through slots (§3, §5) |
| `process-view` | webview | the universal process surface: argument · frame · result (§6) |
| `prose` | webview | markdown with live structure; `ol:` references at badge / link / widget grades (§4) |
| `edit` | webview | hand-authoring: chunks, placements, contracts; `VALIDATION_ERROR` inline as form validation; `dry_run` preflight |
| `history`, `review`, `merge` | webview | time, judgment, acceptance (§7) |
| `term` | webview | terminal surface; each command one `shell` run — sidebar-visible, re-runnable |
| `sidebar`, `tab-bar`, `palette` | webview | chrome as programs, seated outside the tile tree (§1) |
| `board` (arranger), `group` | vm | arrangement writer; container lifecycle (§7) |
| `follow`, `at`, `where`, `prop`, `members`, `placed`, `owner`, `refs`, `backrefs` | native | read-native pipe verbs — program chunks with no executable, the planner as their runtime ([`engine.md`](engine.md), *Hops and `follow`*); `follow` is closure-of-a-step — the thread walk is `follow(refs(argument))`, edges reported for branch/join rendering |
| `fold`, `group` | vm | compute pipe verbs — real runs fed by lowered sub-chains; `explode` is unclassified until it lands ([`engine.md`](engine.md), *What Is Open*) |
| `narrate` | vm | live model-driven abstraction of any place or process (§6) |
| `model` | vm | one model call per run — [`agent.md`](agent.md) |
| `agent` | vm | the harness — [`agent.md`](agent.md) |
| `filesystem` | vm | file ops + file-reference resolution; `read: {}` / `write: {}`; authority = the `fs` capability |
| `shell` | vm | one command, one process (the `agents` project's; `host/shell` above is the window surface) |
| `web` | vm | fetch; `net` capability; `read: {}` / `write: {}` — it can exfiltrate nothing it wasn't handed |
| `echo` | vm | the loop proof; the narrowest possible program |
| `lift` | vm | the sharing gesture as a program: reifies a selection or an expression's result as a chunk with identity — a stable anchor for "this result set" |
| `ingest` | vm | content → typed structure on target places (model-calling); how external matter enters the medium |
| `summarize`, `embed`, `recall` | vm | derived data as ordinary chunks on derivation places; semantic entry beside FTS |
| `reconcile` | vm | integration drift: walks reference chunks, compares source commits, badges stale ones via `relates` |
| `revert` | vm | undo-by-addition from `[db/commits, target]` + temporal reads |

Two entries moved. **`form` is gone** — an unconsumed argument is seated, not rendered by a program that knows about drafts (§2). **`select` became `lift`** — `select` collided with `selection`, a type word, and *lifting* is already the field's own name for giving a value identity (substrate.md, *Values and chunks*). The two `shell`s are different chunks under different owners, which is exactly what names are for; prose says `host/shell` where ambiguity would bite.

**Result archetypes, named.** Each is an archetype referenced from its program's `result` key — found from the program, never by global name, so every program having an `output` collides nowhere ([`engine.md`](engine.md)). Default name `output` unless a better noun is earned: `shell` → `output` `{stdout, stderr, exit}` · `web` → `output` `{status, headers, body}` · `filesystem` → `output` (op-shaped by a `kind` key: content, entries, ack) · `echo`, `lift`, `embed`, `recall`, `revert`, `reconcile`, `ingest` → `output` each (the reified set, the vector, the receipt, the drift report, the ingestion report; the typed structure `ingest` commits lands on target places, not as result) · model programs → the shared `model/output`, family-wide ([`agent.md`](agent.md)) · `agent` → `answer` · `summarize` → a `summary` chunk (the group mechanism *is* its result). (No `gate` exists — action approval is a pending draft child, run-to-draft; [`engine.md`](engine.md), *Lifecycle*.) Pure viewers (`host/shell`, `reader`, `process-view`, `prose`, chrome) declare no result — their work is the view itself. Pure pipe programs return substrate-shaped output — chunks-and-placements — so the algebra composes over results.

## 9. Consumption tagging and reproducibility

Every model call's context is addressable structure ([`agent.md`](agent.md)): a model run's argument *is* the offered window — selection-typed, one link row per element, `at` stamped at start. So the field answers natively, from any chunk's `linked`: **which windows have consumed this chunk — in which harnesses, which threads, at which state.** Retrieval's inverse, as a query. And the wire request is a deterministic function of the argument, the stamped commit, and the versioned provider program — any past completion re-renders exactly; derivation over stored bytes, a first-class substrate property.

## 10. Where this deepens next

Sidebar, palette, the seated argument, `reader` and `process-view` are at build depth. The next pass takes each remaining program there, in build order: the shell's geometry walk, `prose`'s widget grade, `edit`'s placement picker, `history` / `review` diff presentation, the arranger's intent grammar, `term`. Each deepening is also a probe — where a program can't reach its contract with the mechanisms as specced, that lands on the board's demand list, not in silence.
