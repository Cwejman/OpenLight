# The surface proposal — by module

2026-08-14. The distillation of the surface-fold sittings, restructured on the author's direction: **the module graph is the spine** — each module is presented in dependency order, defining only its own vocabulary and standing on the modules before it, closing with its own opens. **Status: proposal, for ratification. Nothing is folded into the spec tree.** Deliberate contradictions with the tree are listed in *Supersessions*; every open is named in place and indexed at the end. Replaces this file's earlier generations; absorbs `projection-scenes.md`.

**How to read.** A term in **bold** is being defined at that spot; nothing is used before its module defines it, except tree-owned vocabulary (chunk, archetype, contract, placement, selection, expression, compute verb, purity, commit, process, session, frame, ownership, reach, boundary, ceiling, cap, draft, run-to-draft, citation, `reading`, `data-ui`, wry, `unresolved`) and the module names themselves. Tags: **[R]** ruled in dialog · **[P]** proposed · **[O]** open. An **honest face** is the system's pattern of rendering a failure as a small labeled state — never silence, never pretense. Code shapes are illustrative unless tagged otherwise. `x < y` reads "x depends on y"; `x < (a | b)` reads "x depends on both."

The graph, whole — the document simply walks it:

```
db
engine < db
view
solid < view
newspaper < view          overlay < view
impls < (solid | newspaper | overlay)
surfaces < (view | newspaper)
agent — headless facet < engine · surface facet < (view | newspaper)
rust-host — links engine (+db) and platform machinery only
```

**The dependency law [R]:** declarations depend on declarations; implementations depend on declarations plus a renderer; nothing ever depends on an implementation.

---

## Cross-cutting rulings (same sittings, outside the modules) [all R]

- **The boundary formula.** A run's reach = (frame ∪ argument-grant ∪ ceiling ∪ starter additions) ∩ parent's cap. Grants union; the cap intersects; additions beyond the cap trip run-to-draft.
- **Absent ceiling key ≡ `{}`** — sealed by default. Openness is explicit: **`caller`**, a ceiling element resolving to the parent's cap, composable (`caller − [secrets]`). `agent` declares `read: caller`.
- **Selection mouths** consume all otherwise-unbound offered elements.
- **The frame is exempt** from the cap intersection.
- **The capability lattice.** `net` / `fs` / `exec` / OS-keychain access compose parent-to-child by intersection like the field keys; excess is escalation; a minted program's body claims are requests, the lattice is the grant.
- **Instance removal requires write** over the placed chunk; creation stays free.
- **Secrets are an integration.** Field presence is value-less stand-ins; `read-secret` is the sole value path, walled by `run` (native-runtime variant for the macOS keychain; vm + `net` for remote managers). Values never enter the substrate.
- **`resolve` respects the run wall** — compute-verb starts inside expressions pass the caller's `run` boundary like any start.
- **Kill and close.** Death follows ownership, never seating; closing is a layout act; kill cascades the frame tree; unmount ≠ death.
- **Escalation.** Mechanism: the ruled run-to-draft. Consent surface: a host-drawn modal built from field reads, and the **reserved native chord** as the binding act for reach-granting approvals (generalized in *rust-host* below).
- **The gesture split.** Secondary gesture (right-click, long-press) belongs to the mounting machinery; ordinary gestures belong to the surface in use.
- **Root-from-config**, with pinned `at(commit)` expressions as recovery.
- **The command program is named `command`.**
- **The component library**: grown our own, no shadcn; re-grounded onto the chosen renderer (*solid* below) with tokens and `data-ui` semantics carried.

**Ground of the whole interface model [R]:** the interface's units are **not processes** — processes stay what the tree says (bounded, walled work; agents, tools, vm programs), and the "surface program" kind ceases to exist. The interface's principal is **the person**: everything renders under the person's reach; every act it dispatches is the person's act; interface-originated commits attribute to the person, process commits to their process, unchanged. And the interface holds **no durable in-memory state**: persistent view state is commits; what must never become history (scroll, active tab, half-typed text) lives as **ephemera** — lifetimed values in a scratch space the rendering machinery owns, soft-persistent across restart, no commit noise (storage home and encoding [O]; the engine's `buffer` streams are a different concept, untouched).

---

## 1 · db — the attach era

**A store** is one `.ol`: a single-file db carrying the full schema and *its own commit history*. **Attach** brings a store into the running field. ("Attach" is the store word; "mount," defined under *view*, is the interface word — the homonym is dissolved deliberately.)

- **One connection, every attached store, one evaluator [P — supersedes settled engine law].** Queries compile over the union of attached stores; one transaction is one consistent snapshot. Because every placement is locally visible at query time, the non-monotone operators — intersection, subtraction — evaluate *correctly*, which per-store-evaluate-then-union provably cannot (the review matrix's federated-leak finding). This reverses the tree's "federation in Rust, not SQL" choice on those grounds. Rejected alternatives: a merged cache (a second home for every fact) and a peer-style store now (content addressing solves *remote* problems; local attach has none).
- **Generated ids become blocking [R].** substrate.md's law — globally unique, system-generated ids — gets enforced; the hand-picked bootstrap ids were tracked debt and two independently-created stores must never collide. Paid before the attach era.
- **Commits are per-store [R]** — a definition, not a restriction: a commit is an entry in one store's history chain, and independent histories are what make stores attachable, detachable, syncable. Writes **route** to the chunk's owning store [P — supersedes the one-writable-active-project law].

Opens: none of its own beyond the id-debt schedule.

## 2 · engine — coordination over attached stores

- **Attach is dynamic [P]** — stores attach and detach while running (supersedes the boot-time-only mount registry). Detaching a store on screen yields the existing `unresolved`, rendered as an honest face; refs resolve across the union.
- **Cross-store gestures decompose [R].** A gesture touching two stores becomes an engine-coordinated *sequence of per-store commits ordered so every prefix is safe*. Worked once: "move this chunk from project A to my field" = (1) create the copy in the target store with a citation to the original — safe alone, it is a fork; (2) retire the original — independently meaningful. A crash between leaves a fork with a citation: legible, not corrupt. Unity lives in citations, which survive decomposition. If a genuinely atomic cross-store case ever appears, the escape is an engine act journal [O] — never spanning commits.
- **Remote federation keeps its ruled law** — sync-then-evaluate; remotes later are *fetch a store, then attach it*: the same evaluation story with a download in front.
- **Intents are enforced here [R].** An **intent** is a typed request for a field act — commit this value, start that program, edit this arrangement — emitted by interface code, forwarded by rendering machinery (*solid* below) with the person's context attached. All validation and walls are the engine's, where they already live; forwarding machinery never judges.
- **Programs are headless [P].** `runtime: webview` for *programs* retires; programs are `vm | native`, and everything visual belongs to the modules below. (The webview name survives as a renderer-runtime, *solid*.) The tree's per-seat machinery — slot-and-hook, coalesced `read_batch`, per-sub-query identity — simplifies under one realm and one person context; per-realm identity survives exactly at crossings (*solid*).

Opens: the act journal (only if a real case demands) · dynamic-attach encoding.

## 3 · view — the contracts (pure declarations, tech-neutral)

Everything in this module is field data. No code, no technology.

**component** — a code leaf's *declaration*: name, typed props, the intents it may emit, the box ranges it serves. Implementations live elsewhere (*impls*); the contract is the portable thing.

```ol
component task-card {
  props:   { task: ref(task) }
  intents: { set-status: { task: ref(task), to: enum(todo, doing, done) } }
  serves:  { min: [220, 64] }        -- intent + range encodings [O]
}
```

**medium** — a family of **block** archetypes grouped by ownership under a medium chunk. A block is an ordinary archetype with a typed contract; blocks reference blocks with the union-typed ref constraints the substrate admits. Making a medium is writing archetypes and placing them — data, ownership, contracts, nothing invented.

Blocks compose into an **arrangement** — the typed body under a surface's root. Because blocks are archetypes, **validation is the db's ordinary write-time contract enforcement**: a malformed arrangement cannot be committed. Arrangements are *stored* (deliberate, hand-made) or *derived* (an expression — possibly a code-backed pure compute verb — yields them from data): the substrate's stored-versus-derived law at arrangement grain (which block fields may hold expressions [O]).

An arrangement bottoms out in two leaf kinds. A **component-leaf** names a component contract directly, with prop and intent bindings — the arrangement's own chrome, always an author's deliberate choice, never any machinery's. The second leaf kind:

**mount** — an ordinary archetype, a hole in an arrangement:

```ol
mount = { of: selection, surface: ref(surface), prefs… }    -- prefs encoding [O]
```

*Show this* (`of` — renamed from `at`, which collides with the temporal verb), *this way* (`surface`) — **both stated, always [R]**. No silent inference exists; what renders is always traceable to a stated choice. Mounts are plain data: storable, referenceable, editable, versioned.

**box** — the size and flow context a position offers, *derived from placement* (a region's span, a marker's spot in flow), never stated twice. Sizes are the only contract; names carry nothing (the old grade words are folk labels). Within its served ranges a component or surface adapts fluidly (container queries); decisions re-open only across range edges, with hysteresis [O: constants]. (The name "box" is a placeholder.)

**surface** — the declared mountable unit:

```ol
surface reader {
  argument: [ ref(reading) ]     -- same word and shape as a process's argument
  root:     <block>              -- the arrangement hangs here
}
```

The surface's medium is never stated — walk the root block's archetype to its owner. Thin library surfaces wrap common blocks (`list` = argument → a stack); raw blocks are not mountable.

**defaults** — since every mount states its surface, dynamic content has one answer: **the mounting parent owns a defaults table** — its own data mapping content archetype (and box band) to a surface. Composing a mount consults the parent's defaults — or asks the person, offering the declared surfaces that fit — and **records the result on the mount**. Rendering is a lookup of a stated choice, never a guess; the last resort when no default speaks is the universal chunk surface (`chunk-table`, *surfaces*) — an honest face, never magic. (A surface that takes anything, consults its own table, and mounts the result is perfectly legal — inference demoted to ordinary, owned code and data.)

**collation** — **ordered mounts**, plus settings, plus a predecessor citation. No member layer [R — the board's retirement of `member` stands]. Viewing one selection several ways is itself a mount — of a `list` or compare surface whose argument is that selection, carrying its own mounts. Per-mount preferences ride the mounts; settings hold orientation and arrangement (the reader-owned-preferences law, absorbed). Side-by-side of kindred content is the shape's native meaning — textual criticism's own word (differencing mechanism [O]).

**valve** — every surface has a *compact face*: its rendering when the box falls below every served range. The floor is machinery: a generic compact face (the derived label + an open affordance) is owed by every medium implementation, uniformly; a surface overrides by serving smaller ranges itself. The valve rule: below range → compact face; engaging it opens the content at an outer position [O: who owns the outer position] — depth becomes navigation. Also the honest fallback when a mount's surface cannot load, and the degradation when technologies cannot embed (*solid*, crossings).

**Mount labels** — what a mounted thing *is* (name, place) derives from the field and is drawn by the mounting machinery, never written by components; display policy belongs to medium implementations.

One worked resolution, the model's crux end-to-end: a newspaper region's mount reads `{of: task/42, surface: ref(task-card)}`. Who wrote `task-card` there? The collation's defaults did, at composition — the reader-owned table mapped `task` at this box band to `task-card`, recorded on the mount. Render time looks it up, loads the implementation for the configured renderer and theme (*impls*), and its component-leaves draw with props read under the person's reach. Nothing inferred at render; everything inspectable after.

Opens: the view family's home naming · "block" as a name · prefs, intent-binding, served-range encodings · expressions-in-fields scope · differencing · valve owner.

## 4 · solid — the renderer (and the runtime it runs on)

**renderer-runtime** — the hosting contract between a chassis and renderers; the pilot's is **webview**. Two faces: a *substrate face* (a chunk renderers relate to — chassis↔renderer compatibility is a queryable field fact) and a *wire face* (the SDK plus the hospitality spec: document and skeleton nodes, identity delivery, the `__sdk` global, the event channel, serving; transport is a runtime concern, per sdk.md — wry IPC on desktop, fetch/websocket on web, same SDK). No chassis code ships in the runtime package; a chassis hosts a runtime by implementing hospitality. This rhymes deliberately with program runtimes, one level up.

**The renderer** — a module holding a boot bundle for a runtime; the chassis loads the one its config names, so swapping renderers is a config edit. The pilot's is **Solid**: JSX authoring over fine-grained signals — chosen because substrate subscriptions are already fine-grained, which is exactly what signals consume and diffing renderers re-derive (React was weighed and not chosen). **One renderer per realm subtree [R]**: a running renderer loads only its own implementations; other technologies enter at crossings, each starting a new subtree.

**The realm.** All in-realm interface code runs in one realm of the renderer's technology. The realm holds **no network capability** — its CSP admits only the engine transport (identically enforceable in a browser). Network, like every effect, is a *capability under the ruled lattice*: the shared realm holds none; a crossing may hold what it is granted (a future browser surface is a crossing with `net`, consented like any capability) [R — replaces the earlier absolute "network-dead" phrasing]. In-realm code can see what is rendered and can only emit intents — bounding a rogue component to reading your screen and writing inspectable commits inside your own walls.

**The glue** — the renderer module ships three fixed files; plumbing, not an extension point:

- ***boot*** — mounts each skeleton node's root as the chassis's mount table names it.
- ***input*** — capture-phase delegation at the document root, before any component and unsuppressable by them: routes the secondary gesture per the gesture split, leader-key sequences, focus; consumes the chassis's trusted input records (*rust-host*); manages **capture regions** — while a handler holds one, clicks outside it are excluded from content and routed as dismiss.
- ***resolve*** — mount lookup (reading each mount's stated surface), the mounting itself, and intent forwarding with the person's context. The engine judges; the glue never does. Where a genuine choice exists (a crossing with several candidates), it prefers fewest crossings.

**Crossings.** A **crossing** is a component owning one element of another technology — outside, an ordinary component; inside, another world (`GLBox`: one canvas, GL inside; `FrameBox`: one iframe). **Transparent** components render in the ambient realm and host mounts directly; **opaque** ones own their pixels — mounts inside are their own affair or the valve. Embeddings exist per technology pair or not (DOM hosts GL cheaply; GL hosts DOM only by adapter). Two uses beyond technology: **quarantine** — deliberately-untrusted interface code in an isolated iframe realm, no admission to the shared realm needed (the realm boundary is the wall) — and **sovereign** — first-party confidential interaction shielded from the shared realm's visibility (the tree's privacy tier, carried).

**SDK connections are per-realm [P, shape only — spec owed].** The shared realm's connection carries the person's context. A crossing that starts a new realm gets its own connection with its own walls, decided at its mount: quarantine defaults to nearly nothing; sovereign gets a scoped grant; a GL box inside trusted code is not a new trust domain (its owning component is realm code; the GL world has no SDK of its own). The per-realm identity tokens survive here and only here.

Opens: the per-realm connection spec · web-flavor input floor limits (with *rust-host*).

## 5 · newspaper · overlay — the first two mediums

**newspaper** — the content medium: regions of content composed on a page, hierarchy by span and type scale, the flat-arrangement instinct (stored arrangements do not nest; depth is rendering, or navigation via the valve). **Its concrete block grammar is the module's one big open [O]**: stack/flex direction and wrap versus grid tracks, responsiveness of stored arrangements, scrolling containers. Settled constraints the grammar must honor [R]: gutter/rhythm magnitudes are theme variables, never arrangement data; scroll is an overflow fact of rendering, never arrangement data (one axis per region; pinned strips are component-internal; seams are summoned).

**overlay** — the anchored-presentation medium, and *just a module*: one block shape and a handler registration, no chassis knowledge required (the decoupling is completed in *rust-host*).

```ol
chunk overlay/item { instance: { anchor: <location record>, content: mount } }   -- encoding [O]
```

The overlay's machinery aggregates on delivered input records (a context menu at the delivered location), holds a capture region while open, and removes the overlay chunk on dismissal — a recorded field act (the base-page ruling's duties, re-housed).

Opens: the newspaper grammar exploration · overlay encodings.

## 6 · impls & themes — where code meets contracts

**A medium implementation** realizes a medium on a renderer, declared as a field chunk (`of: newspaper, renderer: solid, source: ol://…`) and **coverage-checked when its module is attached**: enumerate the medium's blocks by membership, confirm each is handled. Missing at render (a block the configured implementations don't cover): fall back, then the valve's compact face with the gap named. **Component implementations** are per-renderer code files in their modules, same pattern.

**A theme** is implementations shipped coherently — medium implementations plus component implementations sharing the token language — plus **variables**: the ink and rhythm tokens, substrate-defined and field-editable (swapped alone: a reskin). **Selection is config-level [R — author correction]**: the chassis's config names the renderer and selects among implementations; a theme is a coherent *selection set*, not a property inside any implementation. A surface's settings may pin a specific implementation. **Contracts are never part of a theme.** Three altitudes: contracts guarantee facts are derivable · implementations decide display policy · variables decide appearance.

**Resolution, restated without machinery-talk:** *what shows* is field data — mounts and defaults tables, identical on every platform. *What runs* is the loaded implementations — this config's renderer and theme. Same field, same surfaces everywhere; different files may draw them per platform.

### The design language (the shipped implementations' judgment — themeable, never law) [P as a whole]

Flat; **rhythm through spacing is the system**; the newspaper page is the precedent — five hundred years of dense legibility with no boxes. A border is a pixel copy of a structural fact the field already holds: ink derives, it is not stored. The **graduated scale**, one mark per live fact (these five are the *fact classes* the theme's semantic layer names): **rest** — rhythm and typography only · **identity at rest** — the blockquote register: one edge rule, faint tint, or small label; *one edge, never four* · **attention** — hover and focus tint the region under the pointer, answering "what would this click act on" exactly when asked · **state** — background tint plus a corner dot or pill (the existing `Status` vocabulary); summoned dividers when facts become true (the scroll shadow only once content passes under a pinned strip) · **never** — enclosure, nested boxes, standing shadows. **Rhythm is a depth-derived token** (components state relations; context supplies magnitude, stepping down per level; the rhythm floor triggers the valve). **Typography is role registers** on the six fixed sizes — importance, never indentation; absolute under nesting. Hypothesis to prototype, not adopt: the *charged fade* scroll seam. **The acid test**: the reader surface built flat, two documents side by side.

Opens: charged-fade prototype · the fallback chain's exact order.

## 7 · surfaces — the shipped vocabulary of viewing

Each is a declared surface (*view*), library-shipped, carrying forward tree machinery by name:

- **`reader`** — argument: a `reading` (the ruled restart-safe indirection, unchanged — its `current` names the live collation). Its defaults table *is* the reader-owned preferences of the ruled law. The collation's mounts render side by side; settings arrange them.
- **`chunk-table`** — the universal chunk surface and last resort: walks any typed body's contract, choosing field editors by type (a toggle for a bool, a select for an enum) — deliberate choices in its own code, no machinery. First thin cut beside **`list`**.
- **`sequence` / `table` / `document`** [P] — the tree's ground surfaces re-land here; the old default-surface table survives as parents' defaults tables.
- **`process-view`** [P] — the surface over process chunks: argument · frame · result, stale display carried.
- **the draft-composition surface** [P] — the "seated argument" carried: entries from a program's mouth, boundary chips, the Go act; run-to-draft's consent renders here, sealed by the chord.
- **`prose`** [P] — markdown-with-mounts; its reference ladder (badge / link / widget) is its own defaults table banded by box.
- **`command`** [P] — menu assembly from field reads carried unchanged: one entry per payload archetype plus program-declared `actions` at its two ruled scopes; two forms (session palette, at-point menu — the *entity menu*), rendered as overlay-medium content. Editing follows reach: *edit* where the person holds write, *fork* (copy + citation) where only read; implementation, theme, and renderer choices are view settings — always the person's.

The dynamics all these share [R]: gesture → intent → engine → commit → subscription → re-derivation → re-render. Collations are values (first edit branches; the citation DAG records). The gesture can *be* the domain edit — dragging a kanban card commits `task.status`; history records the fact, not the rectangle.

Opens: each surface's full contract (drafting units) · the kanban/compare evidence prototypes.

## 8 · agent — one module, two facets

Unchanged in substance; placed for the graph. Dependents pick facets: **headless** (`< engine`) for applications with no interface; **surface** (`< view | newspaper`) adds the agent's viewing surfaces. Where an agent *runs* is ownership, not configuration: a session sits in the store it was opened for — a **project agent** (default) leaves trace and edits together in the project, provenance traveling when shared; a **personal agent** runs under the personal field, its trace private, its content commits landing in the projects it touches (peers see `unresolved` provenance — the honest truth).

## 9 · rust-host — the chassis

**A chassis** is a platform binding, and its irreducible core is now small [R]: window and OS input · engine + db · the **capability providers** (the enforcement floor for `fs` / `net` / `exec` / OS-keychain access — *providers*, not owners of any integration: the keychain integration is a module consuming the capability, per the secrets ruling) · `ol://` serving · the **skeleton** — a served static document of *config-defined* empty nodes plus a boot script; renders nothing, decides nothing · and two tables read from config chunks:

- **The mount table** — which surface fills which skeleton node. The pilot configures two nodes, *content* and *overlay*; a kiosk configures one; nothing about the count is chassis law [R — replaces "two nodes as fixed"].
- **The reservation table** — the input floor, generalized [R, this sitting's crack]: config entries name what the native layer captures *before the realm ever sees it* — `{gesture: secondary}`, `{chord: cmd+y}`, a reserved modifier for a third click-action. Each captured input is delivered as a **trusted input record** — what happened, plus *where*: the glue resolves pointer → mount path → the field location shown, plus rect and coordinates — consumed by whatever handler config names. The pilot registers the overlay module on the secondary gesture; a kiosk registers a help handler; the consent machinery registers its approval chord. Trusted because the origin is native and realm code cannot synthesize it. The chassis thereby *stops knowing overlays exist*.

**Flavors.** The chassis concept is open [O]; one flavor ships. Rust desktop (wry, the pilot); web-SPA (browser transport; its input floor limited by what browsers allow reserved [O]); static-export (server-rendered, read-only — the substrate-based website); kiosk; packaged app. Each flavor declares its renderer-runtime hospitality and its input floor.

**Boot and projects [R].** The host starts bare: it opens the **personal field** — the person's own store at `~/.config/<host>/`, bootstrapped at first run (`.ol` + a minimal toml holding only what precedes the field: paths, flags). First run seeds it from the chassis **seed** — bundled default modules, theme, guide (contents finalized with the project sitting [O]); packaging, not dependency. Everything else is field config — the two tables, the theme selection — editable in-environment, recoverable via pinned `--content` flags; flags override config; the toml never grows a second home. **A project** is a directory with an `.ol` (git-shaped discovery: run inside it, pass a path, or configured search paths like `~/git`); loading one is an attach act; several attach simultaneously; project management is the attach list plus attach/detach over the engine API. Attaching a store that ships interface code is the realm's consent act (a loud attach-time chip [O]).

Opens: the project sitting (store shape, workspace semantics, seed contents, the host's real name) · flavor breadth · reservation/handler encodings.

---

## Supersessions

**Within the sittings** (positions the dialog itself moved through): seat → mount · `at` on mounts → `of` · accepts/derive/medium fields on surface → argument + root · named grades → box ranges · worlds / module kind / interpreter / primitives / "view-engine" → renderer + implementations + crossings · the row/column/tabs tree with per-entry flags → the newspaper grammar exploration · same-DOM seats → one realm + crossings · React → Solid strict · "components receive resolved surfaces as props" → arrangements and mounts only · render-time surface inference (steward extension) → stated surfaces + parent-owned defaults · the install ceremony → attach + config as the consent acts · theme-inside-implementations → theme as config-level selection · "catalog" as vocabulary → a query over declared surfaces · absolute network-death → network as a capability, none in the shared realm · member re-adoption → collations are ordered mounts (the board's supersession stands) · settings-beside-argument → settings inside the collation · gap in medium data → theme variable · "buffer" for UI state → ephemera · "mount" for stores → attach · "build" → arrangement.

**Against the tree** (each deliberate): surface programs as processes → not processes (retiring per-surface boundaries, citizen∩embedder narrowing, unmount-as-terminal, per-seat commit attribution) · the base page → skeleton + the overlay module (its duties re-housed) · reader-as-program → reader-as-surface (`reading` carried) · the pinned chrome-seats ruling → the mount table · "federation in Rust, not SQL" → attach-era union evaluation (it repairs the proven leak) · one writable active project → write routing per owning store · boot-time-only mounts → dynamic attach · the boot cascade → personal-field boot · `runtime: webview` for programs → programs are headless.

## Open — the index

Per module above, gathered: id-debt schedule (db) · act journal, dynamic-attach encoding (engine) · home naming, block naming, prefs/intent/range encodings, expressions-in-fields, differencing, valve owner, hysteresis (view) · per-realm connection spec, web input floor (solid) · the newspaper grammar exploration, overlay encodings (mediums) · fallback order, charged fade (impls) · surface drafting units, evidence prototypes (surfaces) · the project sitting, flavor breadth, reservation encodings, attach-time consent chip, ephemera home (rust-host) · templates-as-data, the marked horizon (structure-as-chunks would free rendering from a JS runtime; behavior can never be structure; climbed only if a real surface demands it).
