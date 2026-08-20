# The surface proposal

2026-08-19. The brief the spec rewrite executes from — the surface arc's result, ratified in dialog over 08-15…19 (record: [`ratification.md`](ratification.md); walked grounding for acts and walls: [`act-scenes.md`](act-scenes.md)). **Status: ratified brief; nothing is folded into the spec tree yet — the next sitting rewrites the tree from this file.** The two prior generations (`research/arc/surface-proposal.md`, the first `research/surface/proposal.md`) are deleted; git history keeps them.

**How to read.** The **spine** first — one page, the sentences that carry the model; a partial read should land the whole shape there (the spine uses terms the modules define — it is the one place allowed to). Then the modules in dependency order, each defining only its own vocabulary and chunks, standing on the modules before it. A term in **bold** is defined at that spot; nothing is used before its module defines it, except tree-owned vocabulary (chunk, archetype, instance, contract, placement, `relates`, selection, expression, **the match** — the engine's structural binding of offered elements to `accepts` entries — program verb, purity, commit, process, draft, `accepts`, `run`/`launch`, session, frame, ownership, reach, boundary, ceiling, cap, run-to-draft, citation, payload archetype, `ol://`, wry, `unresolved`) and module names. Tags: **[R]** ruled in dialog (the sittings, or settled in ratification) · **[P]** proposed — converged in dialog, not ruled · **[O]** open (indexed at the end). Chunk shapes are the specification unless marked illustrative; where an encoding is tagged [O], the semantic grain is settled and the encoding is not.

---

## The spine

1. **The interface is made of components mounted on surfaces — by the tree's own pair.** A **component** is a declaration — an instance of `view/component`, as a program is of `engine/program`: `accepts`, `serves`, ceilings; it owns its payload archetypes. A **mount** is an instance of `view/mount`, as a run is of `engine/process`: `component` + `argument` (a selection, matched against `accepts` by the match) + its own grant, `draw`, `offer`. **Mount ↔ process, component ↔ program.** No component is a process; the interface starts work and evaluates expressions the way any caller does.
2. **A surface is where components are placed and drawn** — `web-dom` is the pilot's kind. A surface is **hosted** (the chassis at the root, a hosting component when nested) and **glued** (the **glue** — realm-side code that boots, resolves, instantiates, subscribes, diffs the arrangement, dispatches acts — ships in `view/sdk`). The glue draws nothing and decides nothing; when it must show something it mounts a component the surface's config names. The engine's **runtime** (`vm`, `native`) executes programs; a different thing, it keeps its word.
3. **A component is realized by code or by data.** Its realizations are separate chunks referencing it: an **implementation** (code, per surface kind) or a **template** (a tree of mounts with expressions over the mount's own argument). What draws pixels is code; composition is code or data at any level, nesting freely. Lookup: implementation on this surface → template → abstract (a fault face).
4. **Slots are argument elements typed `ref(view/mount)`** (closing a slot to named components needs a ref *refinement* — new grammar, open). The glue instantiates them and hands the component their handles; the component places the handles in its DOM. Everything else in the argument is data the component draws. Slot content is stored (mounts in the field) or derived (an expression yielding mounts).
5. **Two kinds of composition.** *By code*: an implementation imports other components — one declaration, reusable because it is one. *By data*: a tree of mounts — a specific **arrangement**. A data composite becomes reusable by **lifting** it into a template component (concrete values → `$` expressions over the argument).
6. **Three selections flow down any mount tree, each by its own law:** `read / write / run` — **reach**, intersecting downward, judged by the engine under a *mount context* exactly as for processes; **`draw`** — which implementations and templates a subtree admits, ordered, intersecting downward (permission and preference in one list); **`offer`** — elements a subtree makes available to descendants, ordered, accumulating downward with nearer shadowing farther, from which unbound optional `accepts` entries bind by the match. Each is a body key on any mount, readable at every node, a body edit at any closure. Reach and offer hold for process trees too; `draw` is mount-only.
7. **Acts are ordinary.** A component dispatches a `commit` or a start through its `ctx`; the glue forwards it stamped with the mount; the engine judges. Every start from the interface is a **`launch`** — session-owned, mount-capped (a mount has no frame to own a child). No intent type; no person in v0.1 — the **machine context** (`Context::process_id = None`: full reach over what is attached, every created chunk naming its owner), narrowed per mount. Same-DOM is the trusted tier; protection is a new surface.
8. **Input is data.** Privileged input is captured natively and delivered as a trusted record *landed in a place*; overlays, menus and consent are components whose content **derives by expression over those records**. No handlers.
9. **Steering is always a chunk.** Which component shows content (the parent's defaults table, recorded as the mount's `component`) · which code draws it (`draw`, a pin) · what it is offered (`offer`) · what it may touch (reach) — all field data, all history; the chassis owns nothing of it — its configuration is an **entry** chunk in an attached store (the pilot's desktop module ships one). Nothing in the glue or the chassis is policy.
10. **The substrate holds:** `view/surface` · `view/component` (+ payload archetypes) · `view/mount` · `view/implementation` · `view/template` · `reading` / `collation` · the trusted input record · the surface config · the chassis's entry (layers, reservations, surface config) · the attach record. Theme, renderer, medium, realization-sets, props-as-kv: none exist.

---

## The monorepo after this proposal

```
db/                       the store
engine/                   coordination — its own installed artefact; engine/sdk = the protocol client   < db
view/                     the contract archetypes; view/sdk = the web-dom glue + adapters               < engine/sdk
runtime-vm/               the VM runtime provider (rust)                                                < engine
secrets/                  stand-ins + read-secret (a module, not an integration)                      < engine
agent/                    facets: headless < engine · viewing < component/process, component/reader

component/base/           the base family: leaf components, layout primitives, faces, FrameBox
component/reader/         reader + reading, collation                      < base
component/table/          chunk-table, the list/table family              < base
component/process/        process-view + the draft face                   < base
component/prose/                                                           < base
component/command/        the command menu and palette                    < (base | overlay)
component/overlay/        the anchored-presentation layer                 < base

desktop/                  the pilot's desktop module: the chassis entry, the shell template, sidebar, projects   < (base | …)
chassis-desktop/          rust binary: platform machinery; hosts web-dom; a client of engine; declares the entry contract
```

Each `component/*` package ships its component declarations, their payload archetypes, and their default implementations (as a program ships body and executable); a second package may implement the same declarations differently. **The dependency law [R, re-worded for surface kinds]: declarations depend on declarations; implementations depend on declarations plus a surface kind; nothing ever depends on an implementation.** **A module is a store** — each line above is an `.ol` with its chunks and the files beside it; dependency is attach (*engine*). Migration: `host/react` → `component/base` · `host/programs/*` → `component/*`, `desktop/`, or retired · `host/` → `chassis-desktop` + `runtime-vm` · `engine/sdk` stays, `view/sdk` is new.

## Cross-cutting rulings (carried; corrected in ratification) [all R]

Boundary formula, plainly: *a run reaches its frame, plus what was offered in its argument, plus what its program's ceiling names, plus what the starter adds — cut down to what the parent holds; an absent ceiling key means `{}`; the parent's reach enters only where the ceiling names `caller`* (composable: `caller − [secrets]`) · selection mouths consume the unbound rest · the frame is exempt from the cap · **capabilities are `net` · `fs` · `exec`, nothing else** (the keychain is an OS citizen reached through them; `read-secret` declares `exec`); each has *modes* (`net:host`; `exec` bare in v0.1; `fs` limited to the `.ol` mounts is one mode, a direction); they compose parent-to-child by intersection; **enforced by the runtime at spawn — before the VM lands: declared, recorded, shown at Go, not enforced** · the OS's own consent stacks on ours · instance removal requires write over the placed chunk · `resolve` respects the run wall · kill cascades ownership · escalation's consent: a host modal from field reads plus the reserved native chord · the gesture split (secondary → mounting machinery; ordinary → the component in use — *view*) · root-from-config with pinned `at(commit)` recovery · the command program is `command` · **the engine is its own installed artefact; the wire is its only contract; the chassis is a client** · **secrets are a module, not an integration**; they enter through the dependency line that needs them.

**The interface holds no durable in-memory state**: persistent view state is commits; never-history state is **ephemera** (lifetimed, soft-persistent; home and encoding [O]).

---

## db

Carried unchanged. **A store** is one `.ol`; **attach** brings it into the running field. **One connection, all attached stores, one evaluator [P — supersedes settled engine law]** (per-store-evaluate-then-union provably leaks). **Generated ids become blocking [R].** **Commits are per-store [R]**; writes **route** to the owning store [P]. Opens: the id-debt schedule.

## engine

Changes and additions only.

- **Its own artefact [R].** Runtimes are the engine's (`runtime-vm` a provider crate it loads); every client speaks the protocol over a transport.
- **Attach is dynamic [P]**, and **the attach record is one shape everywhere** — the home's toml, the engine API, the field:

  ```
  { path, branch = "main", at?: commit, write = false }
  ```

  `at` → read-only by construction; `branch` + `write: true` → work on a branch of a shared store (the middle ground); `write` is refused with `at`; a URL is fetch-then-attach, read-only. **Write mode is declared at attach, by the person, enforced by the engine** — nothing infers writability; writes route to the owning store (*db*). **`attach` / `detach` are engine programs** (native, owned by `engine`), so the `run` wall and run-to-draft govern them like any act; **`[engine/attached]`** projects what is attached (as `engine/mount` does today — virtual, from the engine's attach state); dynamic attachments are persisted in the personal store (*the home*). Admitting a store that ships components is a loud act: an attach-time consent chip [O]. Detaching on screen yields `unresolved` → a fault face (*view*, faces). **Cross-store acts [R]**: sequences of per-store commits, every prefix safe. Remote federation stays sync-then-evaluate.
- **The engine serves sources [P — lean].** `ol://` resolves through the engine — *file of store s at path p, at the attached commit* — so no client knows disk paths and the web flavor is unchanged. Constraint it imposes: a module's files live under the store's version control, so pinning a commit pins chunks and code together. (Alternative: the engine reports paths, clients read disk — thicker clients.)
- **Programs are headless [P]**: `runtime: vm | native`; `webview` retires.
- **The mount context [P].** ("mount" here and below is view's — *view/mount* — never the attached store.) `Context` gains `{ mount }`. Reach under it = (the mount's argument, read-granted as any argument is ∪ the component's ceiling ∪ the mount's own grant — *view/mount*) ∩ the parent mount's reach, root cap = the **machine context** — the tree's `Context::process_id = None`: full reach over what is attached, every created chunk naming its owner. The engine derives it from the mount chain — field data, cacheable — and judges `read` / `commit` / starts as for a process; batch reads carry the mount per entry; rendering under a mount reads under its reach. **Intents are dissolved [R]**: what interface code emits is an ordinary `commit` or start.
- **Starts from a mount are `launch` [P].** A mount has no frame; a process it starts is owned by the session, capped by the mount's reach (the `run` wall says *which* programs; `launch` is the mode), watched by subscription. Other ownership mechanics when users and permissions arrive — out of scope.
- **Offers bind by the match [P].** A parent's `offer` binds a child's unbound optional `accepts` entries — a run's from the caller's standing offer, a mount's from its ancestors' — by the match's existing binding; explicit binding wins; ambiguity binds nothing and says so.

Opens: an act journal as the escape if a truly atomic cross-store case appears (never spanning commits) · dynamic-attach encoding · ops beyond read/write/run under `{ mount }` (`cancel`, `subscribe`) · the consent chord's principal (lean: the mount of the draft face — *component/process*).

## engine/sdk

The protocol client, language-based. **One transport mechanic [P]:** the SDK uses a single object — `send(text)` / `receive(handler)` — found in one place; **the environment installs it before the SDK loads** (the chassis's wry init script; a VM preamble over stdio; a browser page's websocket shim). The SDK embeds no variants; provisioning the transport is the surface host's duty (*view/surface*). `view/sdk` uses only this API.

## agent

Unchanged in substance; placed for the graph. Facets picked by dependents: **headless** for applications without interface; **viewing** adds its components (*view*, below; the turn face and the context overview live in `component/process` and `component/reader`). Where an agent runs is ownership, not configuration: a session sits in the store it was opened for — a **project agent** (default) leaves trace and edits together in the project, provenance traveling when shared; a **personal agent** runs under the personal field (*the home*, below), trace private, content commits landing in the projects touched — peers see `unresolved` provenance, the honest truth.

## view — the contract archetypes

### view/surface

```ol
chunk view/surface { instance: {} }            -- a kind: identity only, shipped by view/ — web-dom (the pilot's), gl, …
chunk view/surface-config { instance: { surface: ref(view/surface),
                                        faces: { collapsed: ref(view/component), fault: ref(view/component) },
                                        hosts: map<ref(view/component)> } }   -- keyed by surface-kind name: the hosting component for each nested kind
```

A **surface** is a *kind* of place components are drawn on (the graphics word — wgpu, Wayland, Cairo). The kind is an identity chunk `view/` ships — the enumerator implementations reference and contracts are written against; no person edits it. It is met by two halves: a **host** — the native half: a realm, the transport object, `ol://` serving, identity, an **input floor** (privileged input captured before the realm sees it); the chassis at the root, a **hosting component** when nested — and the **glue** — the realm half, in `view/sdk`, one per kind. (The engine's *runtime provider* is a different thing and keeps its word.) What is *yours* is the **surface config** — per installation, referenced from the chassis entry (*chassis-desktop*, below): which components serve as its **faces**, which hosting components give it nested kinds; the root `draw` / `offer` need no home of their own — they are keys on the **root mounts** the entry's layers name. The glue decides nothing the config doesn't state.

### view/component — the declaration

```ol
chunk view/component { instance: { accepts: list<type>,                    -- typed entries, optional marked; like a program's
                                   serves?: { wmin?, wmax?, hmin?, hmax? },
                                   read?: selection, write?: selection, run?: selection } }   -- ceilings over entry names / payload paths
-- a component is an instance of it and owns its payload archetypes, as a program does:
chunk task-card : view/component { accepts: [ ref(task), task-card/settings? ], write: { task.status }, serves: { wmin: 240 } }
chunk task-card/settings { instance: { density?: enum(tight, loose) } }
```

A **component** is a declaration: what it takes (**`accepts`**, the same shape and rules as a program's — entries are types, optional marked, distinct by the disjointness rule; two elements of one type ride in a payload archetype), what box it draws in (**`serves`**: absent = any; below it the collapsed face — *faces*, below; within it internal adaptation, undeclared), and its **ceiling** — `read`/`write`/`run` phrased over entry names and payload paths (`read: { reading.current }`, `write: { task.status }`, `run: caller`); absent: the argument is read-granted and nothing else, write and run `{}`. A component addresses only what it is handed. Optional entries whose elements carry defaults are its **settings** — and since settings are ordinary optional entries, **families** of components share them by *offering* them (below): no defaults mechanism of its own.

### view/mount — the call

```ol
chunk view/mount { instance: { component: ref(view/component), argument: selection,
                               read?/write?/run?: selection,          -- the mount's own grant: additions, as a run's `RunArgs` keys are (beyond the parent's → consent)
                               draw?: selection, offer?: selection } }
chunk m1 : view/mount { component: task-card, argument: [ task/42 ] }
```

A **mount** is a call: a component and an argument, validated by the match against the component's `accepts` exactly as a run's is; plus its **grant** — explicit additions, as a run's — and its `draw` / `offer` (*the three selections*). Effective reach = (argument ∪ ceiling ∪ grant) ∩ the parent's (*engine*); narrowing is simply not adding. A mount is a chunk (identity, history, a place in a field) or an inline value conforming to the contract — two grains, as everywhere. **Closing is a body edit** — removing a mount from the field it sits in; nothing dies, because no component is a process (the tree's "close is layout, unmount ≠ death", which was phrased for processes, dissolves into this). **Reach facts are delivered**, never computed: may-write / may-start per element, in `ctx` (*the code contract*, below); the component renders an input or text, a button or a disabled one. Per-mount marks that are not argument ride as placements: `relates` onto **`view/locked`** (no drops), **`view/isolated`** (mount in a new surface).

**Slots.** An `accepts` entry typed `ref(view/mount)` / `list<ref(view/mount)>` is a **slot**. *Closing* a slot to particular components — "only `list` or `split` here" — cannot be said with `ref(X | Y)`, which unions archetypes while every mount's archetype is `view/mount`; it needs a **ref refinement**, a `where` clause over the referenced body — `ref(view/mount | where(component: list | split))` — lawful in principle because `where` is single-request already, but **new type grammar [O]**; until it lands a container checks at runtime and shows a fault face. With a slot, the glue instantiates the mounts bound there and hands the component their handles; the component places them. Slot content is **stored** (mounts in the field) or **derived** (an expression yielding mounts — a live list over a place, no code creating anything; expressions-in-fields is load-bearing [O encoding]). Everything else in the argument is data the component draws.

### view/implementation · view/template — realization

```ol
chunk view/implementation { instance: { component: ref(view/component), surface: ref(view/surface), source: string } }   -- a path in the store, served via ol://
chunk view/template       { instance: { component: ref(view/component), template: ref(view/mount) } }   -- inline or stored
```

A component is drawable through a separate chunk referencing it — **realization** is only the word for "an implementation or a template". An **implementation** is code for one surface kind. A **template** is surface-agnostic data: a mount tree whose argument values may be **expressions over the mounting mount's own argument** (`$task`, `$task.name` — the same expressions-in-fields; `$` is the argument). Mounting a template-realized component: the glue evaluates the template with `$` bound → a derived mount tree → mounts it in place (derived, not stored; editing the template updates every mount). No realization → **abstract**: a contract others realize. **Lookup [P]: implementation on this surface → template → abstract → fault face (*faces*).** Both kinds may coexist (a portable template and a native implementation on one surface; the order decides); **two of one kind on one surface is refused at the db** (a governance rule) [P].

**Two kinds of composition [P]:** *by code* — an implementation imports other components (they are its code; no field identity; only what it places via `ctx.mount` — *the code contract* — are mounts); *by data* — a tree of mounts, an **arrangement**. **Lift** turns an arrangement into a template component (concrete values → `$`, `accepts` declared); **fork** (copy + citation, the ruled gesture) copies a template's expansion into a stored arrangement — recipes are that, not a mechanism.

### The three selections down the tree [P]

- **Reach** — `read / write / run`: (the argument, read-granted ∪ the component's ceiling ∪ the mount's grant) ∩ the parent's; judged by the engine. (Processes: the same, as specced.)
- **`draw`** — a selection over `[view/implementation | view/template]`, **ordered, intersecting downward**; a library's "set" is a place it placed its realizations on (`[base/impls]`, illustrative); the root entry is on the root mounts the entry's layers name; a pin is a one-element selection. What the effective `draw` contains is the subtree's **admission** — permission and preference in one list; a pin outside it → fault face *"not admitted here"* (*faces*); an isolated subtree is the degenerate cap. The effective realization of mount *m* on surface *s* is one expression the glue reads: `first(draw(m) ∩ realizations-of(component(m)) ∩ on(s))`, then the lookup. (Nearest ordering wins [O — vs root ordering].)
- **`offer`** — a selection of elements, **ordered, accumulating downward, nearer shadowing farther**; a mount's unbound optional `accepts` entries bind from the effective offer by the match (the nearest match; a list-typed entry binds all); explicit binding wins; **ambiguity** — two offered elements at the same distance matching one entry — binds nothing. Illustrative: the desktop's root mount offers `scheme` — an instance of `view/scheme` the chassis keeps current from the OS (one chunk it writes, under the machine context) — and any component accepting `ref(view/scheme)?` gets it; a family offers its settings defaults at the root; the reader's "favorites" are offered on its chain. The mount composer (the draft face — *component/process*) shows where each element came from.

### The code contract, adapters, ergonomics [P]

**`ctx`** is what a component is handed beside its argument:

```
mount(el, arg, ctx) → { update(arg), unmount() }
  arg:  the mount's argument (the declaration says `accepts`, the mount says `argument` — as program and process do),
        bound elements keyed by entry type name (owner-qualified where short names collide: arg.settings · arg['list/settings']);
        slot entries arrive as mount handles
  ctx:  reach facts per element · commit(…) · launch(…) · mount(el, mount) · faces
```

Never hand-written: **adapters** in `view/sdk` — `solid()` (first-party) and `customElement()` (every framework that emits a custom element). A mounted component keeps its DOM and store; *pure* means output is a function of argument and field. Updates at argument grain at the seam; inside, the component patches as it likes (Solid binds, doesn't diff). `unmount` = the framework's dispose. **Offers in code**: in a template every child mount binds its optional entries from the offer through the glue; in code, `<Text>` is an import, not a mount, so nothing would bind — the adapter closes that: `solid()` provides the effective offer as a Solid context, and base components read unbound optional entries (`scheme`, `density`) from it — offer-binding in code for free, nothing threaded through every component [P]. **Placing**: the glue instantiates slot entries; anything a component reads beyond its argument (the reader's collation) it places itself via `ctx.mount` — **code-placing** stored mounts, in scope; **code-creating** mounts (deriving one itself and mounting it) later, same glue [O — when].

```tsx
// task-card — accepts: [ ref(task), task-card/settings? ]
export default solid((arg, ctx) => (
  <Row density={arg.settings?.density ?? 'loose'}>
    <Text role="title">{arg.task.name}</Text>
    <Badge status={arg.task.status} />
    <Button disabled={!ctx.may.write(arg.task, 'status')}
            onClick={() => ctx.commit(arg.task, { status: 'done' })}>Done</Button>
  </Row>))

// list — accepts: [ list/settings?, list<ref(view/mount)> ]
export default solid((arg, ctx) => (
  <Stack direction={arg.settings?.direction ?? 'column'}>
    <Slot of={arg.mounts} />
  </Stack>))
```
```ol
-- the same task-card as a template (illustrative)
chunk task-card/tpl : view/template { component: task-card,
  template: list { argument: [ list/settings { direction: row, density: $settings.density },
                               [ text { argument: [ text/settings { role: title }, $task.name ] },
                                 badge { argument: [ $task.status ] },
                                 button { argument: [ button/settings { label: "Done" }, button/act { commit: { $task: { status: done } } } ] } ] ] } }
-- acts in templates are data: a payload the component dispatches through ctx (button/act); its encoding joins the expressions-in-fields open [O]
```

**Typed ergonomics — direction.** An integration renders TypeScript declarations from the field's contracts into a git-ignored location at build, so `arg.task.name` is typed from `task`'s contract. The pilot-era bridge; the horizon is first-class editing of code interconnected with the substrate, where type inference is an aspect of the field and the LSP shape is superseded.

### Faces, hosting, defaults, labels

**Honest faces are components** the glue mounts in place, named in the surface's config: the **collapsed face** (below `serves` · a kind the parent cannot host · a nesting limit — a derived label and an **open-out**, an affordance opening the content at an outer position; depth becomes navigation) and the **fault face** (unresolvable · error · not admitted · no realization — explains, no open-out) [R: the split and names]. **Hosting components** are components by role (`hosts` in the surface config): `FrameBox` hosts another `web-dom` in a new realm; `GLBox` a `gl` kind. **Defaults [R]:** the mounting parent owns a **defaults table** — (content archetype, offered box) → a component whose `serves` admits the box — consulted at composition, the result recorded as the mount's `component`; the table names its own last resort. **Labels** derive from the field, drawn by container chrome.

### reading · collation

```ol
chunk reading   { instance: { current: ref(collation) } }
chunk collation { instance: { mounts: list<ref(view/mount)>, settings: { orientation: enum(rows, columns), … }, predecessor?: ref(collation) } }
```

Carried: the reader's indirection and its immutable value — an ordered list of mounts.

## view/sdk — the web-dom glue

Plumbing, not extension points: **boot** (connection; the entry's layers — *surface web-dom*; mount each layer's root) · **resolve** (component → realization via `draw` and the lookup → `import(source)` or expand the template → element → read the argument under the mount's reach → instantiate slot entries → `mount`; live table `mount → { module, el, subscription }`) · **subscribe** (a commit touches what an argument reads → re-read → `update`; a commit edits slot content → diff the arrangement — chunks, never DOM — `mount` / `unmount` / `update` children; the glue's only diff) · **dispatch** (forward stamped with the mount; the engine judges) · **input** (capture-phase delegation at the root, unsuppressable; the gesture split; lands trusted records (*surface web-dom*); **capture regions** — while a component holds one, outside clicks are excluded from content and routed as dismiss) · **ephemera**. **Isolation**: no global SDK, `ctx` by closure — inconvenient, never impossible; protection = `view/isolated` → `FrameBox` on `ol://<id>` with a chassis-injected identity.

**Drag — owed, after the first pilot [P].** The third layer over content and overlay. A container reports *drop at (field, index)* through one interface — `component/base`'s `Slot` helper does it for free; a custom container implements `dropAt(point) → (field, index)`. The glue commits the field half: a body edit on the field that held the thing (a ref or a mount); for a **derived** field, the **inversion** — the domain commit the expression implies (a drop into `where(status: todo)` sets `task.status`), or nothing where it does not invert; where a field's value has its own semantics (the reader's collation), the component owns the act; `view/locked` refused before the container is asked.

## surface web-dom — hospitality and input

**Hospitality (the host's half):** a served document — one empty node per **layer**, rendering nothing — plus the glue's boot script; a realm; the transport object installed before the SDK; `ol://` serving (through the engine); identity into every realm it creates; the input floor. What the host is told is its **entry** (*chassis-desktop*): the **layers** — an ordered list of root mounts, each filling one node (content, overlay, drag; a kiosk has one) — the **reservations** — which inputs the floor captures, and the place each record lands — and optionally the surface config.

**Input is data [P].**

```ol
chunk view/input-record { instance: { input: chord | gesture,
                                      at: { mount: ref(view/mount), location: selection, rect: [x, y, w, h], point: [x, y] } } }   -- [O encoding]
```

Native capture delivers a **trusted record** — what happened plus a well-decided location (pointer → mount → the field location shown; realm code cannot synthesize one) — and the **host lands it in the configured place** — native code, through its engine connection; the glue never writes one, which is what keeps the record trusted. The record is a commit, session-owned, removed on dismiss (never ephemera: it is the act's record). Overlays, menus, consent are components whose content **derives by expression over that place** (`component/overlay`'s items; `command`'s entries — menu assembly is a pure verb over record + field); dismiss = the record leaving. No handlers.

Opens: record and connection encodings · ephemera home · web input-floor limits · the slot-drop interface's shape.

## component/base

The base family: leaf components (text, badge, status, button, the field editors by type, …), the layout primitives (**`list`** — `accepts: [ list/settings?, list<ref(view/mount)> ]`, settings `{ direction, overflow: enum(wrap, scroll) }`; **`split`** — `[ split/settings?, list<ref(view/mount), 2> ]`, settings `{ direction, ratio }`; grid or composed lists [O]), the two **faces**, **`FrameBox`** / **`GLBox`**, the `Slot` helper; its shared settings offered at the root (density, tone — what theme used to be); one implementation package (`base/solid`), others may target the same declarations. **The design language [P — the shipped implementation's judgment; a family's settings, never law; unpacked at comprehension depth in [`design-language.md`](design-language.md), including what it supersedes of the tree's visual language].** Flat; **rhythm through spacing is the system**; the newspaper page is the precedent — dense legibility, no boxes; a border is a pixel copy of a structural fact the field already holds: ink derives, never stored. **The graduated scale**, one mark per live fact: **rest** — rhythm and typography only · **identity at rest** — the blockquote register: one edge rule, faint tint, or small label; *one edge, never four* · **attention** — hover/focus tints the region under the pointer, answering "what would this click act on" exactly when asked · **state** — background tint plus a corner dot or pill (the `Status` vocabulary); summoned dividers when facts become true (the scroll shadow only once content passes under a pinned strip) · **never** — enclosure, nested boxes, standing shadows. **Rhythm is a depth-derived value** — components state relations, context supplies magnitude, stepping down per level; the rhythm floor triggers the collapsed face. **Typography is role registers** on the six fixed sizes — importance, never indentation; absolute under nesting. Gutter and rhythm magnitudes are family settings, never arrangement data; scroll is an overflow fact of rendering, never data — one axis per region, pinned strips component-internal, seams summoned. Hypothesis to prototype, not adopt: the *charged fade* scroll seam. **The acid test**: the reader built flat, two documents side by side. The spacing/highlight law under nesting [O — the full drafting question with the author's reasoning: `design-language.md`].

## component/reader · table · process · prose · command · overlay

- **reader** — `[ ref(reading) ]`; places `reading.current.mounts` via `ctx.mount`; a drop → a new collation (its own act); its defaults table is the ruled reader-owned preferences. Members together / tabs / overview [O 5.3]; attributes [O 5.4]; marking taxonomy [O 5.5]; differencing [O].
- **table** — `chunk-table`: the universal chunk component and last resort; field editors by type, reach facts deciding editor or text; over a read-only store editors render as text (no write). Kv or full face [O 5.6].
- **process** — `process-view` (argument · frame · result, stale display) + the **draft face** (the seated argument — which is also the mount composer; chips; Go; consent sealed by the chord).
- **prose** — markdown with mounts in flow; the reference ladder as its defaults table; keystrokes ephemera.
- **command** — entries derived from records + field (one per payload archetype, declared `actions` at two scopes); palette and entity menu, seated into overlay; the pick executes under the summoning mount's reach. Scope beyond commands [O 3.4]; mount history is a temporal read over mounts (they are chunks), locks are `view/locked` — a browse over them is the desktop's to add.
- **overlay** — `overlay-layer` as the entry's overlay layer; its `items` slot **derives by expression over the input-record place** the desktop's reservations name — each record yields an `overlay/item { anchor, content: ref(view/mount) }` *value* (the secondary gesture → `command` over the record; the chord → the consent face); nothing is stored but the record. Positioning, backdrop, capture region; dismissal = the record leaving.

## secrets · runtime-vm · chassis-desktop

**Secrets**: hand-picked stand-ins (`secret { name }`), `read-secret` (declares `exec`) the sole value path, walled by `run`; a remote manager's variant is `vm` + `net`. **runtime-vm**: the provider crate the engine loads; the floor for `net`/`fs`/`exec`; not in the first pilot. **Chassis** — a platform binding and a client of the engine; hosts `web-dom` (the layer nodes, the transport object, serving through the engine, identity, the input floor); knows neither overlays nor components. **Its contract is the archetypes of its configuration, which it declares** — as a program declares its payloads — and a configuration is instances of them, shipped in a module:

```ol
chunk chassis/entry { instance: { layers: list<ref(view/mount)>,                         -- required: root mounts, in order
                                  reservations?: list<{ input: chord | gesture, place: ref }>,   -- [O encoding]
                                  surface?: ref(view/surface-config) } }               -- absent → inherit the home's default entry
```

`layers` is the only required key; the rest inherits from the home's default entry — which is what makes the **shorthand** lawful: `ol desktop --mount "reader [reading/x]"` synthesizes an entry with that one layer. Repairing a broken configuration is the same shorthand over the entry chunk itself (`--mount "chunk-table [my-entry]"`); no safe mode exists. Flags: `--home`, `--engine`, `--entry`, `--at <commit>` (pinned recovery), `--mount`.

## The home, the desktop module, and what you run

**What you run is the engine, and a chassis.** Two commands, one directory:

```
~/.config/ol/              the home — what precedes the field, and the field
  ol.toml                  [[attach]] entries (path, branch, at?, write) · [chassis] entry = <chunk>
  field.ol                 the personal store: sessions, dynamically attached stores, your own edits
```

`ol engine --home …` (binary or OS service — home is its only argument) opens `field.ol`, attaches every `[[attach]]` entry, then what the field records as dynamically attached. `ol desktop --home …` connects, reads the toml's `entry` (or `--entry` / `--mount`), and hosts the surface. **The toml is the declared, version-pinned set — your package space, editable in any editor**; dynamic attachments (opening a project) are recorded in the field, not the toml: *declared* and *opened* are two different things with two homes, no duplication. First run seeds the home from the engine distribution's bundled stores (`component/base`, `desktop/`, the guide) — packaging, not dependency; flags override config; **the toml never grows a second home**.

**The desktop module** (`desktop/`) — the pilot's environment, a store like any other, depended on from the toml:
- **the entry** — two layers (content, overlay), two reservations (the secondary gesture → the overlay place; the approval chord → the consent place), the surface config (faces, `FrameBox`);
- **the shell** — a component `desktop/shell : view/component { accepts: [ ref(session) ] }` realized **as a template** over base primitives — `split { sidebar, split { tab-strip, $session.current-tab.root } }` where the tab strip is a `list` of labels and the content slot is an expression; a tiler and a tab bar are too rudimentary to be components (vanilla over abstraction) — and this template is what proves templates load-bearing. A session's arrangement chunks: `session { tabs, current-tab }`, `tab { name?, root?: ref(view/mount) }` — a tab's root is a tree of `split` and content; `host/tile` and `host/overlay` are gone;
- **`sidebar`** — a component: the session rendered as itself, work only (processes mean work; mounts too? [O 3.3]);
- **`projects`** — a component over `[engine/attached]` (its shape [O]): discovery as an expression over configured search paths (`~/git/*/.ol`) through `filesystem`; its verbs (`attach` with a mode, `detach`) come from the match, as any menu's do. **Project management is attach management, in the desktop, never in a binary.** "Current project" is the session's store — a session sits in the store it was opened for.

**Editing what you only read** — your desktop entry, a shipped template — is the git-shaped act, deliberate: clone the repo, attach the clone writable (or attach it writable on a branch), point your entry at it. No in-field fork of modules; when the object model and remotes arrive, this is the seam they replace.

**Flavors [O breadth; one ships].** Desktop (wry, the pilot) · web-SPA (a browser tab is another host of `web-dom`, another client of the same engine; reserved-input limits [O]) · static export (server-rendered, read-only — the substrate-based website) · kiosk (one layer, one entry) · packaged app. Each flavor declares its hospitality and its input floor; under latency a chassis may run a local engine — horizon.

---

## Supersessions

**Against the prior generations (deleted; git keeps them):** medium + component → component · renderer → surface kind (host + glue) · `view/mount` `{of, surface, prefs}` → `view/mount` `{component, argument, …}` — the view's process · props-as-kv (an earlier cut) → **argument as selection, matched by `accepts`** · a mount as an instance of the component (same) → a mount as an instance of `view/mount` · blocks / a `mount` type → slots as `ref(view/mount)` entries · surface (the unit) → component; **surface (the word) → the drawing target** · `view/theme` / family defaults → settings offered · intents → dispatch · valve → collapsed / fault face · person → the machine context per mount · "chassis = capability providers" → runtimes are the engine's · engine linked → its own artefact · keychain → `net`/`fs`/`exec` · secrets integration → module · grades → `serves` · realization-sets / a `realize` verb → `draw` as a selection · implementation-with-template → separate `view/template` · handlers → input records as data, overlays derived · `run` from the interface → `launch` only · mount table / skeleton nodes / a config module → **the chassis entry (layers, reservations, surface config), shipped by the desktop module** · tiler and tab-bar components → the shell as a template over base · safe mode → the `--mount` shorthand · fork-to-edit a module → attach a clone writable · depends/attach list in the chassis → `[[attach]]` in the home's toml, one record shape everywhere.

**Against the tree:** surface programs as processes → components mounted from the field (the seat mechanism retired whole) · the base page → the entry's layers + `component/overlay` · reader-as-program → reader component · pinned chrome seats → the entry's layers and the shell template · `host/tile` → `split`; `host/overlay` → `overlay/item` · "federation in Rust, not SQL" → union evaluation · one writable project → write routing · boot-time mounts → dynamic attach · the boot cascade → personal-field boot · `runtime: webview` → programs headless · React → Solid inside components via adapter · the SDK auto-detecting transports → the environment installs one object · the mounts cascade (`project.toml` `[[mounts]]`, host-walked) → `[[attach]]` in the home, engine-attached, plus dynamic attach.

## The pilot cut

Engine as artefact + attach-era db (attach record, `attach`/`detach`, `[engine/attached]`, engine-served sources) · chassis-desktop hosting `web-dom` (entry, layers, reservations, the shorthand) · `engine/sdk`, `view/sdk` with `solid()` · `component/base` (leaves, `list`, `split`, faces, `FrameBox`) · `desktop/` (entry, the shell template, sidebar, projects) · reader · table · process · command · overlay · secrets · agents. After: `runtime-vm`, prose, drag/WYSIWYG, lift, `GLBox`, code-creating mounts, generated types.

## Open — the index

db: id-debt schedule · engine: act journal, dynamic-attach encoding, ops beyond read/write/run under `{ mount }`, the consent chord's principal · view: the ref refinement for closed slots (new type grammar), expressions-in-fields encoding (slots, templates, offers), nearest-vs-root ordering for `draw`, the duplicate-realization governance rule's exact statement, when code-creating mounts arrive · web-dom: record and connection encodings, ephemera home, web input floor, the slot-drop interface · base: grid or lists, the spacing/highlight law · desktop: sidebar and mounts (3.3), the projects component's shape · reader: 5.3 / 5.4 / 5.5, differencing · table: 5.6 · command: scope beyond commands, a mount-history browse (3.4) · chassis and home: flavors, reservation encodings, the attach-time consent chip, engine-served sources vs reported paths (lean: served), the seed's contents · **to prototype before folding: `ctx`, the adapters and the typed-argument ergonomics — the authoring experience.**
