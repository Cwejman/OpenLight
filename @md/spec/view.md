# View — the contract archetypes and the glue

The `view/` store: the contract archetypes the interface is built of, and `view/sdk` — the glue, one per surface kind. The component packages are [`components.md`](components.md); the pilot's environment is [`desktop.md`](desktop.md); the chassis is [`chassis.md`](chassis.md). *(The old `programs.md` dissolved into these three files at the surface rewrite — git keeps it.)*

This file mixes settled contracts with open exploration and marks the difference **in place** — *Held open*, *Open*, *direction*. Unmarked mechanics are settled.

**The spine, restated in one paragraph.** The interface is components mounted on surfaces, by the tree's own pair: a **component** is a declaration (as a program is), a **mount** is a call (as a process is) — `component` + `argument`, matched by the match. No component is a process; the interface starts work and evaluates expressions the way any caller does, and every start from it is a `launch` ([`engine.md`](engine.md), *Two modes*). Three selections flow down any mount tree — reach, `draw`, `offer` — each by its own law. Acts are ordinary commits and starts; input is data; steering is always a chunk.

---

## 1. view/surface — the drawing target

```ol
chunk view/surface { instance: {} }            -- a kind: identity only, shipped by view/ — web-dom (the pilot's), gl, …

chunk view/surface-config { instance: { surface: ref(view/surface),
                                        faces: { collapsed: ref(view/component), fault: ref(view/component) },
                                        hosts: map<ref(view/component)> } }   -- keyed by surface-kind name: the hosting component for each nested kind
```

A **surface** is a *kind* of place components are drawn on (the graphics word — wgpu, Wayland, Cairo). The kind is an identity chunk `view/` ships — what implementations reference and contracts are written against; no person edits it. It is met by two halves: a **host** — the native half: a realm, the transport object, `ol://` serving, identity, an input floor; the chassis at the root ([`chassis.md`](chassis.md)), a **hosting component** when nested — and the **glue** — the realm half, in `view/sdk` (§8), one per kind. (The engine's *runtime provider* is a different thing and keeps its word.) What is *yours* is the **surface config** — per installation, referenced from the chassis entry: which components serve as its **faces** (§7), which hosting components give it nested kinds. The root `draw` / `offer` need no home of their own — they are keys on the **root mounts** the entry's layers name. The glue decides nothing the config doesn't state.

## 2. view/component — the declaration

```ol
chunk view/component { instance: { accepts: list<type>,                    -- typed entries, optional marked; like a program's
                                   serves?: { wmin?, wmax?, hmin?, hmax? },
                                   read?: selection, write?: selection, run?: selection } }   -- ceilings over entry names / payload paths

-- a component is an instance of it and owns its payload archetypes, as a program does:
chunk task-card : view/component { accepts: [ ref(task), task-card/settings? ], write: { task.status }, serves: { wmin: 240 } }
chunk task-card/settings { instance: { density?: enum(tight, loose) } }
```

A **component** is a declaration: what it takes (**`accepts`**, the same shape and rules as a program's — entries are types, optional marked, distinct by the disjointness rule; two elements of one type ride in a payload archetype), what box it draws in (**`serves`**: absent = any; below it the collapsed face — §7; within it, internal adaptation, undeclared — container queries, never data), and its **ceiling** — `read`/`write`/`run` phrased over entry names and payload paths (`read: { reading.current }`, `write: { task.status }`, `run: caller`); absent means the argument is read-granted and nothing else ([`engine.md`](engine.md), *Boundaries*). A component addresses only what it is handed.

**Settings need no mechanism.** Optional entries whose elements carry defaults are a component's **settings** — and since settings are ordinary optional entries, **families** share them by *offering* them (§5): no defaults machinery of its own. A chosen setting persists as field data wherever the choice was made — a mount's argument, a collation, a family's root offer.

## 3. view/mount — the call

```ol
chunk view/mount { instance: { component: ref(view/component), argument: selection,
                               read?/write?/run?: selection,          -- the mount's own grant: additions, as a run's are (beyond the parent's → consent)
                               draw?: selection, offer?: selection } }

chunk m1 : view/mount { component: task-card, argument: [ task/42 ] }
```

A **mount** is a call: a component and an argument, validated by the match against the component's `accepts` exactly as a run's is; plus its **grant** — explicit additions, as a run's — and its `draw` / `offer` (§5). Effective reach = (argument ∪ ceiling ∪ grant) ∩ the parent's, judged by the engine under the call context — `view/mount` conforms from the view side ([`engine.md`](engine.md), *The call context*); narrowing is simply not adding. A mount is a chunk (identity, history, a place in a field) or an inline value conforming to the contract — two grains, as everywhere.

**Closing is a body edit** — removing a mount from the field it sits in; nothing dies, because no component is a process. The tree's old "close is layout, unmount ≠ death", phrased for processes, dissolves into this.

**Reach facts are delivered, never computed**: may-write / may-start per element, in `ctx` (§6); the component renders an input or text, a button or a disabled one. **Editability is boundary-derived** — a component offers editing iff its mount holds write reach over the target and the target is unconsumed; the engine enforces regardless, so a lying component cannot write. One component, mode by reach: `prose` *is* the editor when writable and the viewer when not.

**No commit on event.** A component answers a subscription event by reading only; anything that writes on events is a launched program — an automation ([`engine.md`](engine.md), *Purity*). Without this, unmounting would change behaviour rather than only cost.

Per-mount marks that are not argument ride as placements: `relates` onto **`view/locked`** (no drops) or **`view/isolated`** (mount in a new realm — §8, isolation).

**Slots.** An `accepts` entry typed `ref(view/mount)` / `list<ref(view/mount)>` is a **slot**. *Closing* a slot to particular components — "only `list` or `split` here" — needs a **ref refinement**, `ref(view/mount | where(component: list | split))` — open type grammar ([`substrate.md`](substrate.md), *What's Open*); until it lands a container checks at runtime and shows the fault face. With a slot, the glue instantiates the mounts bound there and hands the component their handles; the component places them. Slot content is **stored** (mounts in the field) or **derived** (an expression yielding mounts — a live list over a place, no code creating anything; expressions-in-fields is load-bearing [O — encoding]). Everything else in the argument is data the component draws.

## 4. Realization — implementation and template

```ol
chunk view/implementation { instance: { component: ref(view/component), surface: ref(view/surface), source: string } }   -- a path in the store, served via ol://

chunk view/template       { instance: { component: ref(view/component), template: ref(view/mount) } }   -- inline or stored
```

A component is drawable through a separate chunk referencing it — **realization** is only the word for "an implementation or a template". An **implementation** is code for one surface kind. A **template** is surface-agnostic data: a mount tree whose argument values may be **expressions over the mounting mount's own argument** (`$task`, `$task.name` — the same expressions-in-fields; `$` is the argument). Mounting a template-realized component: the glue evaluates the template with `$` bound → a derived mount tree → mounts it in place (derived, not stored; editing the template updates every mount). No realization → **abstract**: a contract others realize.

**Lookup [P]: implementation on this surface → template → abstract → fault face.** Both kinds may coexist (a portable template and a native implementation on one surface; the order decides); **two of one kind on one surface is refused at the db** — a governance rule [P; exact statement O].

**Two kinds of composition [P]:** *by code* — an implementation imports other components (they are its code; no field identity; only what it places via `ctx.mount` are mounts); *by data* — a tree of mounts, an **arrangement**. **Lift** turns an arrangement into a template component (concrete values → `$`, `accepts` declared); **fork** (copy + citation, the ruled gesture) copies a template's expansion into a stored arrangement — recipes are that, not a mechanism.

## 5. The three selections down the tree [P]

- **Reach** — `read / write / run`: (the argument, read-granted ∪ the component's ceiling ∪ the mount's grant) ∩ the parent's; judged by the engine under the call context. (Processes: the same law, as specced.)

- **`draw`** — a selection over `[view/implementation | view/template]`, **ordered, intersecting downward**; a library's "set" is a place it placed its realizations on (`[base/impls]`, illustrative); the root entry rides the root mounts the entry's layers name; a pin is a one-element selection. What the effective `draw` contains is the subtree's **admission** — permission and preference in one list; a pin outside it → the fault face, *"not admitted here"*; an isolated subtree is the degenerate cap. The effective realization of mount *m* on surface *s* is one expression the glue reads: `first(draw(m) ∩ realizations-of(component(m)) ∩ on(s))`, then the lookup. (Nearest ordering wins [O — vs root ordering].)

- **`offer`** — a selection of elements, **ordered, accumulating downward, nearer shadowing farther**; a mount's unbound optional `accepts` entries bind from the effective offer by the match ([`engine.md`](engine.md), *The match*, step 2); explicit binding wins; **ambiguity** — two offered elements at the same distance matching one entry — binds nothing and says so. Illustrative: the desktop's root mount offers `scheme` — an instance of `view/scheme` the chassis keeps current from the OS (one chunk it writes, under the machine context) — and any component accepting `ref(view/scheme)?` gets it; a family offers its settings defaults at the root; the reader's "favorites" are offered on its chain. The mount composer — the draft face ([`components.md`](components.md), process) — shows where each element came from.

Each is a body key on any mount, readable at every node, a body edit at any closure. Reach and offer hold for process trees too; `draw` is mount-only.

## 6. The code contract, adapters, ergonomics [P]

*The prototype gate is relaxed [R — 2026-08-21]: no standalone spike; the first few components are the evaluation, built aware, and the family does not scale before it. Everything in this section is [P] until then.*

**`ctx`** is what a component is handed beside its argument:

```
mount(el, arg, ctx) → { update(arg), unmount() }
  arg:  the mount's argument (the declaration says `accepts`, the mount says `argument` — as program and process do),
        bound elements keyed by entry type name (owner-qualified where short names collide: arg.settings · arg['list/settings']);
        slot entries arrive as mount handles
  ctx:  reach facts per element · commit(…) · launch(…) · mount(el, mount) · faces
```

Never hand-written: **adapters** in `view/sdk` — `solid()` (first-party) and `customElement()` (every framework that emits a custom element). A mounted component keeps its DOM and store; *pure* means output is a function of argument and field. Updates arrive at argument grain at the seam; inside, the component patches as it likes (Solid binds, doesn't diff). `unmount` = the framework's dispose.

**Offers in code**: in a template every child mount binds its optional entries from the offer through the glue; in code, `<Text>` is an import, not a mount, so nothing would bind — the adapter closes that: `solid()` provides the effective offer as a Solid context, and base components read unbound optional entries (`scheme`, `density`) from it — offer-binding in code for free, nothing threaded through every component.

**Placing**: the glue instantiates slot entries; anything a component reads beyond its argument (the reader's collation) it places itself via `ctx.mount` — **code-placing** stored mounts, in scope; **code-creating** mounts (deriving one itself and mounting it) later, same glue [O — when].

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

## 7. Faces, hosting, defaults, labels

**Honest faces are components** the glue mounts in place, named in the surface's config [R — the split and names]:

- the **collapsed face** — below `serves` · a kind the parent cannot host · a nesting limit. A derived label and an **open-out**: an affordance opening the content at an outer position; depth becomes navigation.

- the **fault face** — unresolvable · error · not admitted · no realization · an absent service (the daemon posture — [`engine.md`](engine.md), *Daemons*). Explains, no open-out.

**Hosting components** are components by role (`hosts` in the surface config): `FrameBox` hosts another `web-dom` in a new realm; `GLBox` a `gl` kind.

**Defaults [R]:** the mounting parent owns a **defaults table** — (content archetype, offered box) → a component whose `serves` admits the box — consulted at composition, the result recorded as the mount's `component`; the table names its own last resort (`chunk-table` — [`components.md`](components.md)). The reader's defaults table is the ruled reader-owned preferences.

**Labels** derive from the field, drawn by container chrome. Three failure states draw explicitly, never silently: a **dead root** (an empty place invites; a dead one does not), a **reference error** (inline, quietly), and a **beyond-reach reference** — prose reads openly, but nothing runnable resolves past the boundary, and the face says so.

## 8. view/sdk — the web-dom glue

Plumbing, not extension points:

- **boot** — connection; the entry's layers ([`chassis.md`](chassis.md)); mount each layer's root.

- **resolve** — component → realization via `draw` and the lookup → `import(source)` or expand the template → element → read the argument under the mount's reach → instantiate slot entries → `mount`; live table `mount → { module, el, subscription }`.

- **subscribe** — a commit touches what an argument reads → re-read → `update`; a commit edits slot content → diff the arrangement — chunks, never DOM — `mount` / `unmount` / `update` children; the glue's only diff. Batch reads carry each mount's anchor ([`engine.md`](engine.md), `read_batch`) — coalesced resolution at one commit snapshot, each entry authorized under its own context.

- **dispatch** — forward stamped with the mount; the engine judges. Intents are dissolved: what interface code emits is an ordinary `commit` or `launch`.

- **input** — capture-phase delegation at the root, unsuppressable; the gesture split (secondary = mounting machinery; ordinary = the component in use [R]); lands nothing itself — trusted records are the floor's ([`chassis.md`](chassis.md)); **capture regions** — while a component holds one, outside clicks are excluded from content and routed as dismiss.

- **ephemera** — the never-history state channel (home and encoding [O]).

**Isolation**: no global SDK, `ctx` by closure — inconvenient, never impossible; protection = `view/isolated` → `FrameBox` on `ol://<id>` with a chassis-injected identity ([`chassis.md`](chassis.md)). Same-DOM is the trusted tier.

**Input is data [P].**

```ol
chunk view/input-record { instance: { input: chord | gesture,
                                      at: { mount: ref(view/mount), location: selection, rect: [x, y, w, h], point: [x, y] } } }   -- [O encoding]
```

The chassis's floor composes and lands the record ([`chassis.md`](chassis.md), *The input floor*); overlays, menus and consent are components whose content **derives by expression over that place** ([`components.md`](components.md) — overlay, command); dismiss = the record leaving. No handlers.

**Drag — owed, after the first pilot [P].** The third layer over content and overlay. A container reports *drop at (field, index)* through one interface — `component/base`'s `Slot` helper does it for free; a custom container implements `dropAt(point) → (field, index)`. The glue commits the field half: a body edit on the field that held the thing; for a **derived** field, the **inversion** — the domain commit the expression implies (a drop into `where(status: todo)` sets `task.status`), or nothing where it does not invert; where a field's value has its own semantics (the reader's collation), the component owns the act; `view/locked` refused before the container is asked.

## 9. Open — gathered

Beyond the opens marked in place above: expressions-in-fields encoding (slots, templates, offers, acts-as-data) · nearest-vs-root ordering for `draw` · the duplicate-realization rule's exact statement · when code-creating mounts arrive · the ephemera home · the connection encoding and the slot-drop interface's exact shape (ride sdk.md's rewrite; §8 states `dropAt` directionally) · multi-mount of one component (one mount in two places: shared or two?).
