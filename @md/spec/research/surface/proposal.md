# The surface proposal

2026-08-14. The distillation of the surface-fold sittings, in its third and intended form: **structured by the module graph** — one section per module, in dependency order, each defining only its own vocabulary and its own chunks, standing on the modules before it. **Status: proposal, for ratification; nothing is folded into the spec tree.** Supersedes `research/arc/surface-proposal.md` (left standing as the prior generation) and opens a new research home, since this proposal remakes parts of the arc rather than extending it.

**How to read.** A term in **bold** is defined at that spot; nothing is used before its module defines it, except tree-owned vocabulary (chunk, archetype, contract, placement, selection, expression, compute verb, purity, commit, process, session, frame, ownership, reach, boundary, ceiling, cap, draft, run-to-draft, citation, `data-ui`, wry, `unresolved`) and module names. Tags: **[R]** ruled in dialog · **[P]** proposed · **[O]** open (indexed at the end). An **honest face** is the system's pattern of rendering failure as a small labeled state — never silence, never pretense. Chunk shapes are the specification unless marked illustrative; field encodings tagged [O] are open at encoding grain, settled at semantic grain.

## The monorepo after this proposal

Flat — kind-prefixed names carry what grouping directories would have (and the eventual home of these modules is the field itself, where placement is ownership, so repo flatness is scaffolding):

```
db/                       the store
engine/                   coordination                          < db
sdk/                      the TS wire client (language-based)   < engine (protocol)
view/                     the contract archetypes
agent/                    facets: headless < engine · surface < (view | medium-newspaper)

runtime-webview/          renderer-runtime: hosting contract    < sdk
renderer-solid/           the renderer: glue + boot bundle      < (view | runtime-webview)

medium-newspaper/         block archetypes                      < view
medium-overlay/           block archetypes                      < view

impl-components-solid/    the component library (+ default tokens)   < (view | renderer-solid)
impl-newspaper-solid/                                           < (medium-newspaper | renderer-solid)
impl-overlay-solid/                                             < (medium-overlay | renderer-solid)

surface-reader/           + reading, collation archetypes       < (view | medium-newspaper)
surface-table/            the table/list family + chunk-table   < (view | medium-newspaper)
surface-process/          process-view (+ draft face)           < (view | medium-newspaper)
surface-prose/                                                  < (view | medium-newspaper)
surface-command/          seated via overlay when summoned      < (view | medium-newspaper)

integration-secrets/      read-secret + stand-in archetype      < engine
chassis-desktop/          rust binary — links engine (+db) and platform machinery only
```

Migration from today's tree: `host/react` → `impl-components-solid` (tokens ride along) · `host/programs/*` → `surface-*` or retired · `host/` (rust) → `chassis-desktop` · `engine/sdk` → `sdk`. **The dependency law [R]: declarations depend on declarations; implementations depend on declarations plus a renderer; nothing ever depends on an implementation.** There is no theme module: a theme is field data (see *view/theme*), and the default token values ship inside the default implementations.

## Cross-cutting rulings (same sittings; carried regardless) [all R]

Boundary formula: (frame ∪ argument-grant ∪ ceiling ∪ additions) ∩ parent's cap; excess trips run-to-draft · absent ceiling key ≡ `{}`; openness is the explicit `caller` element, composable (`caller − [secrets]`) · selection mouths consume the unbound rest · the frame is exempt from the cap · the capability lattice: `net`/`fs`/`exec`/OS-keychain compose parent-to-child by intersection; body claims are requests, the lattice is the grant · instance removal requires write over the placed chunk · `resolve` respects the run wall (compute-verb starts pass the caller's `run` boundary) · kill cascades ownership, close is layout, unmount ≠ death · escalation: run-to-draft unchanged; its consent surface is a host modal from field reads plus the reserved native chord as the binding act · the gesture split: secondary (right-click, long-press) belongs to the mounting machinery, ordinary to the surface in use · root-from-config with pinned `at(commit)` recovery · the command program is named `command` · the component library: grown our own, no shadcn, re-grounded onto the chosen renderer with tokens and `data-ui` carried.

**Ground of the interface model [R]:** the interface's units are **not processes** — processes stay bounded walled work (agents, tools, vm programs); the "surface program" kind ceases to exist. The interface's principal is **the person**: rendering reads under the person's reach; dispatched acts are the person's; interface commits attribute to the person, process commits to their process. The interface holds **no durable in-memory state**: persistent view state is commits; never-history state (scroll, active tab, half-typed text) is **ephemera** — lifetimed values in a scratch space the rendering machinery owns, soft-persistent across restart (home and encoding [O]; the engine's `buffer` streams are unrelated and untouched).

---

## db

**A store** is one `.ol`: a single-file db with the full schema and its own commit history. **Attach** brings a store into the running field ("attach" is the store word; "mount" is view's word — the homonym dissolved deliberately).

- **One connection, all attached stores, one evaluator [P — supersedes settled engine law].** Queries compile over the union; one transaction is one snapshot. Non-monotone operators (intersection, subtraction) evaluate correctly because every placement is locally visible — which per-store-evaluate-then-union provably leaks (the review matrix's finding; this reverses "federation in Rust, not SQL" on those grounds). Rejected: merged caches (second home for truth), peer-stores now (content addressing solves remote problems only).
- **Generated ids become blocking [R].** substrate.md's globally-unique-system-generated law gets enforced; hand-picked bootstrap ids collide across independently-created stores. Paid before the attach era.
- **Commits are per-store [R]** — a definition: a commit is an entry in one store's history chain; independent histories are what make stores attachable. Writes **route** to the chunk's owning store [P — supersedes one-writable-active-project].

Opens: the id-debt schedule.

## engine

Changes and additions only; existing chunks stand as specced in the tree.

- **Attach is dynamic [P]** (supersedes the boot-time-only mount registry). Detaching a store on screen yields `unresolved`, rendered as an honest face; refs resolve across the union.
- **Cross-store acts [R].** A gesture touching two stores becomes an engine-coordinated *sequence of per-store commits, every prefix safe*. Move a chunk between stores: (1) create the copy in the target with a citation — safe alone, a fork; (2) retire the original — independently meaningful. A crash between leaves a legible fork, not corruption; unity lives in citations. Escape if a truly atomic case appears: an act journal [O]; never spanning commits.
- **Remote federation** keeps its law: sync-then-evaluate — remotes are *fetch a store, then attach it*.
- **Intents [R].** An **intent** is a typed request for a field act — commit this value, start that program, edit this arrangement — emitted by interface code, forwarded by rendering machinery with the person's context. **All validation and walls are the engine's**; forwarding machinery never judges.
- **Programs are headless [P].** `runtime: webview` for programs retires; programs are `vm | native`. Per-seat machinery (slot-and-hook, coalesced `read_batch`, per-sub-query identity) simplifies under one realm and one person context; per-realm identity survives exactly at crossings (*renderer-solid*).

Opens: act journal · dynamic-attach encoding.

## sdk

The wire client, **language-based, not runtime-based**: one TS package speaking the program protocol, importable in any JS runtime — transport is the runtime's concern (already law). Additions: it must support **per-realm connections** (a connection carries an identity context; the shared realm's carries the person; crossing realms get their own — contract under *runtime-webview*).

## view — the contract archetypes

Pure declarations; no code, no technology. Each archetype under its own heading, chunk shape as the specification.

### view/component

```ol
chunk view/component {
  instance: {
    props:   contract,            -- the typed props shape           [O encoding]
    intents: contract,            -- the intents it may emit         [O encoding]
    serves:  { min: [w, h], … }   -- box ranges served               [O encoding]
  }
}
-- declared:  chunk task-card : view/component { props: { task: ref(task) }, … }
```

A **component** is a code leaf: pure, props in, intents out; draws, never composes. Its implementations live in impl modules; the contract is the portable identity.

### view/medium — and blocks, arrangements

```ol
chunk view/medium { instance: {} }        -- the family owner; blocks are
                                          -- archetypes placed under its instance
```

A **medium** is a family of **block** archetypes grouped by ownership under a `view/medium` instance. A block is an ordinary archetype with a typed contract; blocks reference blocks with the substrate's union-typed ref constraints. Blocks compose into an **arrangement** — the typed body under a surface's root. **Validation is the db's ordinary write-time contract enforcement**: a malformed arrangement cannot be committed. Arrangements are *stored* (deliberate) or *derived* (an expression — possibly a code-backed pure verb — yields them; allowed positions [O]). An arrangement bottoms out in two leaf kinds: a **component-leaf** — a component named directly with prop and intent bindings, the arrangement's own chrome, always an author's choice — and the mount.

### view/mount

```ol
chunk view/mount {
  instance: { of: selection, surface: ref(view/surface), prefs: … }   -- prefs [O]
}
-- mounts appear as instances or as conforming inline values in bodies
```

A **mount** is a hole in an arrangement: *show this* (`of` — renamed from `at`, which collides with the temporal verb), *this way* (`surface`) — **both stated, always [R]**. No silent inference exists; what renders is always traceable to a stated choice. Plain data: storable, referenceable, versioned.

**Defaults** — dynamic content's answer: **the mounting parent owns a defaults table**, its own data mapping content archetype (and box band) to a surface; composing a mount consults it — or asks the person, offering the declared surfaces that fit — and **records the result on the mount**. Rendering is a lookup, never a guess; the last resort is the universal chunk surface (*surface-table*). A surface that takes anything, consults its own table, and mounts the result is legal — inference demoted to owned code and data. Each parent declares its own defaults archetype (the reader's is the ruled reader-owned preferences).

### view/surface

```ol
chunk view/surface {
  instance: { argument: contract, root: block }    -- root: ref or inline   [O encoding]
}
-- declared:  chunk reader : view/surface { argument: [ ref(reading) ], root: … }
```

A **surface** is the declared mountable unit. `argument`: the same word and shape as a process's. Its medium is never stated — walk the root block's archetype to its owner. Thin library surfaces wrap common blocks; raw blocks are not mountable. A module may declare several surfaces.

### Box, valve, labels

**box** — the size and flow context a position offers, *derived from placement* (a region's span, a marker's spot in flow), never stated twice. **Sizes are the only contract; names carry nothing** (grade words are folk labels; "box" itself is a placeholder name). Within served ranges rendering adapts fluidly (container queries); decisions re-open only across range edges, with hysteresis [O: constants].

**valve** — every surface has a *compact face*: its rendering below every served range. The floor is machinery — a generic compact face (derived label + open affordance) is owed uniformly by every medium implementation; a surface overrides by serving smaller ranges itself. Below range → compact face; engaging it opens the content at an outer position [O: owner] — depth becomes navigation. Also the fallback when a mount's surface cannot load, and the degradation when technologies cannot embed.

**Mount labels** — what a mounted thing *is* (name, place) derives from the field, drawn by the mounting machinery, never written by components; display policy belongs to implementations.

### view/renderer · view/implementation · view/theme

```ol
chunk view/renderer       { instance: { runtime: ref, source: ol-url } }
chunk view/implementation { instance: { of: ref(view/medium) | component-set,
                                        renderer: ref(view/renderer), source: ol-url } }
chunk view/theme          { instance: { variables: …,                       -- token values
                                        selection: list<ref(view/implementation)> } }
```

A **renderer** declares itself against a runtime and ships code (*renderer-solid*). An **implementation** realizes a medium (or a component set) on a renderer; **coverage-checked when its module is attached** — enumerate the medium's blocks by membership, confirm each handled. A **theme is data, not code [R — author correction]**: token *values* plus a *selection* of implementations; selection is config-level; ink-only variation is new value chunks, zero code; policy variation is a new implementation. Default token values ship inside the default implementations. **Contracts are never part of a theme.** Three altitudes: contracts guarantee facts derivable · implementations decide display policy · variables decide appearance.

**The worked resolution** (the model's crux, end to end): a newspaper region's mount reads `{of: task/42, surface: ref(task-card)}`. Who wrote `task-card`? The collation's defaults did, at composition — the reader-owned table mapped `task` at this box band, and the choice was recorded on the mount. Render time looks it up, loads the implementation for the configured renderer and theme, and its component-leaves draw with props read under the person's reach. Nothing inferred at render; everything inspectable after.

Opens: home naming for the family · "block" as a name · props/intents/serves/prefs encodings · expressions-in-fields · valve owner · hysteresis.

## agent

Unchanged in substance; placed for the graph. Facets picked by dependents: **headless** for applications without interface; **surface** adds its viewing surfaces. Where an agent runs is ownership, not configuration: a session sits in the store it was opened for — a **project agent** (default) leaves trace and edits together in the project, provenance traveling when shared; a **personal agent** runs under the personal field (*chassis-desktop*), trace private, content commits landing in the projects touched — peers see `unresolved` provenance, the honest truth.

## runtime-webview

A **renderer-runtime** is the hosting contract between a chassis and renderers. Two faces:

- **Substrate face** — a chunk renderers relate to (`view/renderer.runtime`), making chassis↔renderer compatibility a queryable field fact.
- **Wire face** — the hospitality spec: what a host must provide for the SDK to live — the document and skeleton nodes, identity delivery, the `__sdk` global, the event channel, serving. Transport per host: wry IPC on desktop, fetch/websocket on web, same SDK.

This module also owns the two contracts both its neighbors depend on:

```ol
chunk webview/input {                       -- the trusted input record   [O encoding]
  instance: { input: chord | gesture,
              at: { mount: path, location: selection, rect: box, point: [x, y] } }
}
```

**Trusted input records** are how privileged input (captured natively by the chassis, below the realm) is delivered to handlers: what happened, plus a well-decided location — the glue resolves pointer → mount path → the field location shown. Trusted because the origin is native; realm code cannot synthesize one.

**Per-realm connections [P — spec owed].** The shared realm's SDK connection carries the person's context. A crossing that starts a new realm gets its own connection with its own walls, decided at its mount: quarantine defaults to nearly nothing; sovereign gets a scoped grant; an owned GL element inside trusted code is no new trust domain (its owning component is realm code). Per-realm identity tokens survive here and only here.

Opens: input-record and connection encodings.

## renderer-solid

**The renderer**: a module shipping a boot bundle for a runtime; the chassis loads the one its config names — swapping renderers is a config edit. The pilot's is **Solid**: JSX over fine-grained signals — substrate subscriptions are already fine-grained, which is what signals consume and diffing renderers re-derive (React weighed, not chosen). **One renderer per realm subtree [R]**: a running renderer loads only its own implementations; other technologies enter at crossings, each starting a new subtree.

**The realm.** One realm of the renderer's technology for all in-realm interface code. The realm holds **no network capability** — CSP admits only the engine transport (identically enforceable in a browser). Network, like every effect, is a capability under the ruled lattice: the shared realm holds none; a crossing may hold what it is granted — a future browser surface is a crossing with `net`, consented like any capability [R — replaces absolute "network-dead"]. In-realm code sees what is rendered and can only emit intents: a rogue component is bounded to reading your screen and writing inspectable commits inside your own walls. Admission into the realm is by **attach + config** — attaching a store that ships interface code, and config selecting what loads — both the person's acts (a loud attach-time consent chip [O]).

**The glue** — three fixed files, plumbing not extension points:

- ***boot*** — mounts each skeleton node's root as the chassis mount table names it.
- ***input*** — capture-phase delegation at the document root, before any component and unsuppressable by them: routes the secondary gesture per the gesture split; consumes trusted input records; manages **capture regions** — while a handler holds one, clicks outside are excluded from content and routed as dismiss.
- ***resolve*** — mount lookup (reading each mount's stated surface), the mounting, and intent forwarding with the person's context. The engine judges; the glue never does. Where genuine choice exists (a crossing with candidates), fewest crossings wins.

**Ephemera machinery** lives here (the scratch space, lifetimes, soft persistence — encoding [O]).

**Crossings.** A **crossing** is a component owning one element of another technology — outside, an ordinary component; inside, another world (`GLBox`: one canvas, GL inside; `FrameBox`: one iframe). **Transparent** components render in the ambient realm and host mounts directly; **opaque** ones own their pixels — mounts inside are their own affair or the valve. Embeddings exist per technology pair or not (DOM hosts GL cheaply; GL hosts DOM only by adapter). Beyond technology: **quarantine** — deliberately-untrusted interface code in an isolated iframe realm, no admission to the shared realm needed (the realm boundary is the wall) — and **sovereign** — first-party confidential interaction shielded from the shared realm's visibility (the tree's privacy tier, carried).

Opens: web-flavor input floor limits (with *chassis-desktop*).

## medium-newspaper

The content medium: regions of content composed on a page, hierarchy by span and type scale; **stored arrangements do not nest** — depth is rendering, or navigation via the valve. **The block grammar is this module's one big open [O]**: stack/flex direction and wrap versus grid tracks, responsiveness of stored arrangements, scrolling containers. Constraints the grammar must honor [R]: gutter and rhythm magnitudes are theme variables, never arrangement data; scroll is an overflow fact of rendering, never arrangement data — one axis per region, pinned strips component-internal, seams summoned.

## medium-overlay

The anchored-presentation medium — placement, never construction: no surface is "built with overlay"; surfaces are seated *into* it, and its implementation contributes the anchored chrome (positioning at a delivered location, the backdrop, the capture region, dismissal as a recorded field act — the base-page ruling's duties, re-housed).

```ol
chunk overlay/item { instance: { anchor: <location record>, content: mount } }   -- [O encoding]
```

Handlers (registered in the chassis reservation table) aggregate overlay items on trusted input records — the pilot's context menu; a kiosk's help. Opens: encodings.

## The implementations — impl-components-solid · impl-newspaper-solid · impl-overlay-solid

Each is `view/implementation` instances plus source. `impl-components-solid` is the component library (grown our own; tokens and the `data-ui` semantic layer ship here and double as the default theme's values). Coverage-checked at attach; at render, a block no configured implementation covers falls back (chain order [O]), ending at the valve's compact face with the gap named.

### The design language (the shipped implementations' judgment — themeable, never law) [P]

Flat; **rhythm through spacing is the system**; the newspaper page is the precedent — dense legibility, no boxes; a border is a pixel copy of a structural fact the field already holds: ink derives, never stored. **The graduated scale**, one mark per live fact (its five fact classes are what `view/theme`'s semantic layer names): **rest** — rhythm and typography only · **identity at rest** — the blockquote register: one edge rule, faint tint, or small label; *one edge, never four* · **attention** — hover/focus tints the region under the pointer, answering "what would this click act on" exactly when asked · **state** — background tint plus a corner dot or pill (the `Status` vocabulary); summoned dividers when facts become true (the scroll shadow only once content passes under a pinned strip) · **never** — enclosure, nested boxes, standing shadows. **Rhythm is a depth-derived token** — components state relations, context supplies magnitude, stepping down per level; the rhythm floor triggers the valve. **Typography is role registers** on the six fixed sizes — importance, never indentation; absolute under nesting. Hypothesis to prototype, not adopt: the *charged fade* scroll seam. **The acid test**: the reader surface built flat, two documents side by side.

## The surfaces

Shared dynamics first [R]: gesture → intent → engine → commit → subscription → re-derivation → re-render. Collations are values (first edit branches; the citation DAG records). The gesture can *be* the domain edit — dragging a kanban card commits `task.status`; history records the fact, not the rectangle. Editing follows reach: the entity menu offers *edit* where the person holds write, *fork* (copy + citation) where only read; implementation, theme, and renderer choices are view settings — always the person's.

### surface-reader

```ol
chunk reading   { instance: { current: ref(collation) } }          -- the ruled indirection, carried
chunk collation {
  instance: { mounts: list<mount>,                                  -- ordered; no member layer [R]
              settings: { orientation: enum(rows, columns), … },    -- [O encoding]
              predecessor: ref(collation)? }
}
chunk reader : view/surface { argument: [ ref(reading) ], root: … }
```

The reader's defaults table *is* the ruled reader-owned preferences. Viewing one selection several ways is a mount of a `list`/compare surface carrying its own mounts. Side-by-side of kindred content is collation's native (textual-criticism) meaning; the differencing mechanism [O].

### surface-table

The table/list family — the tree's ground surfaces (`sequence` / `table` / `document`) re-land here [P]; the old default-surface table survives as parents' defaults tables. First thin cuts: `list` (argument → a stack) and **`chunk-table`** — the universal chunk surface and last resort: walks any typed body's contract, choosing field editors by type (a toggle for a bool, a select for an enum) — deliberate choices in its own code.

### surface-process

`process-view` [P]: the surface over process chunks — argument · frame · result, stale display carried — and, beside it in the same module, a dedicated **draft face** for the pre-start state (the "seated argument" carried: mouth entries, boundary chips, the Go act; run-to-draft's consent renders here, sealed by the chord). Whether draft is a second declared surface or a state branch of `process-view` is the module's own call — both lawful; defaults may map draft-state to the draft face.

### surface-prose

Markdown with mounts in flow [P]; its reference ladder (badge / link / widget) is its own defaults table banded by box. The hardest editor machinery rides framework-free cores.

### surface-command

Menu assembly from field reads, carried unchanged [P]: one entry per payload archetype plus program-declared `actions` at its two ruled scopes; two forms — the session palette and the at-point *entity menu* — **built of newspaper structure and components like any surface, seated into overlay when summoned**.

Opens: each surface's full contract (drafting units) · evidence prototypes (kanban board, compare).

## integration-secrets

Per the secrets ruling: the field holds value-less stand-ins; `read-secret` (a native-runtime program holding the OS-keychain capability) is the sole value path, walled by `run`; a remote manager's variant is vm + `net`. An ordinary module — unplug it, plug another manager.

```ol
chunk secret { instance: { name: string } }     -- the stand-in; never a value
```

## chassis-desktop

**A chassis** is a platform binding; its irreducible core [R]: window and OS input · engine + db · the **capability providers** (the enforcement floor for `fs`/`net`/`exec`/OS-keychain — providers, not owners: the keychain *integration* is a module consuming the capability) · `ol://` serving · the **skeleton** — a served static document of *config-defined* empty nodes plus a boot script, rendering nothing, deciding nothing · and two config tables:

```ol
chunk desktop/mount-table  { instance: { nodes: list<{ node: name, mount: mount }> } }
chunk desktop/reservations { instance: { entries: list<{ input: chord | gesture,
                                                          handler: ref }> } }      -- [O]
```

- **The mount table** — which surface fills which skeleton node. The pilot configures *content* and *overlay*; a kiosk configures one node; the count is config, not chassis law [R]. The chassis does not know overlays exist.
- **The reservation table** — the generalized input floor [R]: what the native layer captures *before the realm sees it* — `{gesture: secondary}`, `{chord: cmd+y}`, a reserved modifier for a third click-action — each delivered as a trusted input record (*runtime-webview*) to the configured handler. The pilot registers the overlay machinery on the secondary gesture and the consent machinery on the approval chord; a kiosk registers help. Trusted because origin is native.

**Flavors [O breadth; one ships].** Desktop (wry, the pilot) · web-SPA (browser transport; reserved-input limits [O]) · static-export (server-rendered, read-only — the substrate-based website) · kiosk · packaged app. Each flavor declares its runtime hospitality and its input floor.

**Boot and projects [R].** The host starts bare: it opens the **personal field** — the person's own store at `~/.config/<host>/`, bootstrapped at first run (`.ol` + minimal toml holding only what precedes the field: paths, flags). First run seeds it from the **seed** — bundled default modules, theme values, the guide (contents with the project sitting [O]); packaging, not dependency. Everything else is field config, editable in-environment, recoverable via pinned `--content` flags; flags override config; the toml never grows a second home. **A project** is a directory with an `.ol` (git-shaped discovery; configured search paths like `~/git`); loading one is an attach act; several attach simultaneously; project management is the attach list plus attach/detach over the engine API.

Opens: the project sitting (store shape, workspace semantics, seed contents, the host's real name) · flavor breadth · reservation/handler encodings · attach-time consent chip · ephemera home (with *renderer-solid*).

---

## Supersessions

**Within the sittings:** seat → mount · `at` on mounts → `of` · accepts/derive/medium fields on surface → argument + root · named grades → box ranges · worlds / module kind / interpreter / primitives / "view-engine" → renderer + implementations + crossings · the row/column/tabs tree with per-entry flags → the newspaper grammar exploration · same-DOM seats → one realm + crossings · React → Solid strict · "components receive resolved surfaces as props" → arrangements and mounts only · render-time surface inference (steward extension) → stated surfaces + parent-owned defaults · the install ceremony → attach + config · theme-inside-implementations → theme as data (values + selection) · "catalog" → a query over declared surfaces · absolute network-death → network as a capability, none in the shared realm · member re-adoption → collations are ordered mounts (the board's supersession stands) · "buffer" for UI state → ephemera · "mount" for stores → attach · "build" → arrangement · a separate draft module → the draft face inside surface-process · command-built-with-overlay → command built of newspaper, seated via overlay.

**Against the tree (each deliberate):** surface programs as processes → not processes (retiring per-surface boundaries, citizen∩embedder narrowing, unmount-as-terminal, per-seat commit attribution) · the base page → skeleton + the overlay module · reader-as-program → reader-as-surface (reading carried) · the pinned chrome-seats ruling → the mount table · "federation in Rust, not SQL" → attach-era union evaluation (repairs the proven leak) · one writable active project → write routing per owning store · boot-time-only mounts → dynamic attach · the boot cascade → personal-field boot · `runtime: webview` for programs → programs are headless.

## Open — the index

db: id-debt schedule · engine: act journal, dynamic-attach encoding · view: family home naming, "block" naming, props/intents/serves/prefs encodings, expressions-in-fields, valve owner, hysteresis · runtime-webview: input-record and per-realm connection encodings · renderer-solid: ephemera encoding, web input floor · medium-newspaper: **the grammar exploration** · medium-overlay: encodings · impls: fallback order, charged-fade prototype · surfaces: drafting units per surface, collation settings encoding, differencing, evidence prototypes · chassis-desktop: **the project sitting**, flavor breadth, reservation encodings, attach-time consent chip · horizon: templates-as-data (structure-as-chunks would free rendering from a JS runtime; behavior can never be structure; climbed only on real demand).
