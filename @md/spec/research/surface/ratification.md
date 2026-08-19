# Ratification — working page (closed 2026-08-19)

**Closed.** The surface arc's ratification ran 2026-08-15…19 over the author's read of the first proposal (their chronological notes — `feedback.md`, removed from the tree; git history keeps it at 0a5c292) and a deliberate check-in fold that re-derived the interface model one level simpler. **The result is the brief: [`proposal.md`](proposal.md)** — the single file the spec rewrite executes from; [`act-scenes.md`](act-scenes.md) is its walked grounding for acts and walls. This page is the record: the same points grouped by what they touch, each with where it landed. Rulings marked **settled** here are ratified; everything the fold converged on is **[P]** in the brief — proposed in dialog, to be confirmed as the rewrite meets it. Nothing is folded into the spec tree yet.

**Where each topic landed** — the short form; rows below carry the detail:
- **1** closed: capabilities `net`/`fs`/`exec` with modes, recorded-not-enforced before the VM; secrets a module; boundary prose; the engine as its own artefact; **1.6 resolved by the fold** — acts are ordinary `commit`/`launch` through `ctx`, the mount is the walled unit (act-scenes model B), no person in v0.1.
- **2** closed: `serves`; settings as optional `accepts` entries; no hidden state; `over` moot (arguments are selections); collapsed/fault faces; blocks → components; realization as implementation | template; verbs named native / program; medium `page` → the base family; 2.5 answered in the brief (`mount(el, arg, ctx)`, adapters, offers in code via Solid context; **prototype before folding**); 2.10/2.11 answered (implementation per component per surface; theme → settings offered).
- **3** answered in the brief as [P], not ruled in dialog: "close is layout" restated (mounts are chunks; nothing dies); interface-started processes are `launch`, session-owned; the sidebar stays (work only; mounts too? open); the command surface carried (scope open); surface history = mounts are chunks with history, locks as `view/locked`; chrome = the desktop module's shell template; reader = a component. 3.9 moot (a move is a mount edit).
- **4** narrowed: no block grammar — `list` and `split` as base components; grid and the spacing/highlight law open; derived arrangements and the WYSIWYG inversion specced (drag deferred after the first pilot).
- **5** carried as opens in the brief (5.3–5.6); the reader is a component over a collation of mounts, placing via `ctx.mount`.
- **6** answered: engine as artefact (6.0); the chassis declares its entry contract, the desktop module ships the configuration (6.1/6.5); modules are stores, dependency is attach, the engine serves sources (6.2); input as data landing in a place (6.3); chassis to chunk grain: entry = layers + reservations (6.4); local engine under latency noted (6.6).
- **7** applied: the brief opens with a one-page spine.

**After this page:** the record into `conclusions.md` (done, same day) · board and log · the next sitting rewrites the spec tree from the brief — host.md → chassis and the home, programs.md and bootstrap.md → the view family and the desktop module, engine.md (mount context, attach record, `launch`), sdk.md (`engine/sdk` / `view/sdk`, one transport object), pilot.md (the pilot cut) · prototype `ctx` and the adapters before the view family folds.

Tags: *files* — answerable from the tree/proposal, a wording or clarity fix · *name* — a vocabulary choice · *ruling* — needs dialog · *draft* — needs spec work (a drafting unit or scenes page).

---

## 1. Capabilities, secrets, the boundary wording, intents

Small; gates the rest.

| point | from feedback | tag | stands |
|---|---|---|---|
| 1.1 | OS-keychain as a capability feels strange | ruling | **settled** — not a capability. The set stays `net` · `fs` · `exec` (the coarse OS reaches); the keychain is one of many OS citizens reached through them; `read-secret` declares `exec` |
| 1.2 | `net`/`fs`/`exec` enforceable only in the VM, which is not built — are they dummies until then? | files | **settled** — yes: enforcement is the runtime's at spawn; before the VM lands, capabilities are declared, recorded on the process, shown at Go, not enforced. One plain sentence owed in the spec |
| 1.3 | is `exec` all-or-nothing? | ruling | **settled** — bare for v0.1; parameterized later like `net:host`. Every capability has *modes*; `fs` limited to the `.ol` mounts is one mode (the birth idea, carried as direction), not the definition. Discussion at VM time |
| 1.4 | macOS keychain access needs the OS's own consent box | files | **settled** — the OS asks, not us, when the binary touches an item it did not create; our consent is the engine's (`run` wall, run-to-draft); the two stack. State in one sentence |
| 1.5 | the boundary formula is hard to read; parent reach enters only through `caller`, not by default | files | **settled** — reading confirmed by the text; rewrite as plain prose: frame + offered + ceiling + additions, cut down to the parent's; absent key = `{}`; the parent enters only where the ceiling names `caller` |
| 1.6 | intents are vague — expressions? does the engine API already carry them? what does the engine gain? | ruling | **open — needs the walked stories.** Established: on the wire an intent is only an ordinary `commit` or `run`/`launch` — nothing new; a component addresses only its props, so component-level write/run selections over locations are the wrong grain (author); the renderer hands the component its read/write facts as props (enabled/disabled, input/text). Not established: whether the mount is the walled unit (surfaces process-like in read/write/run) or the machine context is; no person invented for v0.1 (author). Fourteen stories in [`act-scenes.md`](act-scenes.md); rule with topic 3 |
| 1.7 | are secrets really an *integration* — does it project all secrets, or are stand-ins hand-set? | ruling | **settled** — hand-picked stand-ins, a plain `secrets` module, not an integration; ships `read-secret`; enters through the dependency line that needs it (agents today), never the chassis |
| 1.8 | who provides capabilities — the engine or the chassis? | files | **settled** — engine law + runtime enforcement; the chassis judges and enforces nothing. The proposal's "chassis = capability providers" is wrong-shaped: the VM runtime is its own module (`runtime-vm`, missing from the proposal's tree), linked as config names it, like a renderer |

## 2. Sizing, faces, and the view section's spine

Closed 2026-08-15 except 2.5 (after 1.6) and 2.10/2.11 (moved to topic 6).

| point | from feedback | tag | stands |
|---|---|---|---|
| 2.1 | `serves` as four flat independent bounds (min/max w/h), like grades were | ruling | **settled** — `serves?: { wmin?, wmax?, hmin?, hmax? }`, one per surface, absent = any box; below it the collapsed face; within it internal adaptation, undeclared |
| 2.2 | does the surface *know* which size it serves — is that state? wish to override via the command menu; author leans no state at the mount | ruling | **settled** — no hidden state. **Settings ride the surface's argument** (optional entries, surface defaults when absent — the tree's `accepts` shape); the surface may draw its own editor and the command menu edits the same payload (chunk-table); every change is a commit on the mount. **`prefs` dissolves — a mount is a call: `{ surface, argument }`**, the way a draft is `{ program, argument }`; override = edit the mount's `surface` or argument |
| 2.3 | start with `serves`, not grades; grades only if demanded | ruling | **settled** — grades retire; different forms are settings in the argument, not separate surfaces |
| 2.4 | `contract` in `view/component` — ambiguous; must not be a new keyword | files | **settled** — `props: map<type>`; `type` is already a value kind (`accepts: list<type>`); the same grammar an `instance` contract uses |
| 2.5 | how props/intents map onto Solid — values in, functions out? can you "run" an intent? a more lawful name | ruling | open — the renderer delivers reach facts as props (settled in the 1.6 dialog); the dispatch shape is designed here, after 1.6 |
| 2.6 | blocks are never defined yet a surface's root is one — define blocks (an archetype) before medium; medium's prose shrinks | draft | **settled (the spine)** — order: component → block → the two view-level leaf blocks (**mount**, **component-leaf** `{ component, bindings }`) → medium → arrangement (a tree of block instances) → surface `{ argument, root }` → serves/faces/labels → renderer/implementation/theme. **`view/block`** is the archetype block *archetypes* are instances of; **block → medium by field**, not ownership: `view/block { instance: { medium: ref(view/medium) } }`, `view/medium { instance: {} }`; a medium's blocks enumerate by backref; a surface's medium = its root's archetype `.medium`. Type-grammar note: "ref to an instance of an archetype instance on `view/block`" is one level deeper than `ref(X)` — semantic grain settled, encoding joins the contract-encoding open. **The blocks themselves are topic 4** |
| 2.7 | mount: `of` → `on`, or something better | name | **settled — `over`** (the tree's idiom: "a surface over…") |
| 2.8 | defaults prose names `table` as if mechanism — be precise and lawful; "box band" vs `serves` — one term | files | **settled** — wording: a parent's defaults table maps (content archetype, offered box) → a surface whose `serves` admits the box, consulted at composition and recorded on the mount; where nothing fits the table names its own last resort; nothing is universal by law (chunk-table is what the pilot's tables name). "Box band" retires with grades |
| 2.9 | more than one valve: below range · error boundary · unresolvable refs · technology mismatch · medium nesting limit | ruling | **settled — "valve" retired.** The family is the **honest face**; two kinds: the **collapsed face** (content reachable elsewhere — below served size · technology cannot embed here · nesting limit; a derived label + open-out, depth becomes navigation) and the **fault face** (not reachable — unresolvable reference (dead / beyond reach) · implementation error; explains, no open-out). Owed uniformly by every medium implementation |
| 2.10 | `ol-url` for renderer/impl; `implementation` covering both mediums and component sets — needs reflection | ruling | **→ topic 6** (unsolved until runtime seating and module management). Lean carried: `covers: list<ref>` (block archetypes and/or components) replacing `of: medium | component-set` |
| 2.11 | theming: implementations bring their own configurable values, possibly shared between component and medium sets | ruling | **→ topic 6**, with a worked example (author not ready to rule abstractly). Lean carried: each implementation declares the variables it reads with defaults; a theme supplies values for the union; sharing is by name |
| 2.12 | vocabulary: compute-verb (a real formulation instead; trickle-down note for existing spec use), realm (keep — explained), "newspaper" as our implementation's style vs the family's neutral name | name | **settled** — the medium is **`page`**, the implementation **`impl-page-solid`** ("newspaper" only describes its design language); **realm** kept. Verb names: **native verb / program verb** for the proposal's "compute-verb" — lean, unobjected twice, folds unless the author says otherwise; trickle-down: engine.md (planner partition, purity), programs.md §8 |

## 3. Managing surfaces once surfaces are not processes

Needs a scenes page before ruling.

| point | from feedback | tag | stands |
|---|---|---|---|
| 3.1 | "close is layout, unmount ≠ death" is a saying *for* processes — restate or drop in surface terms | files | open |
| 3.2 | surfaces that need a daemon/service — who starts it; must the surface carry its own start act? | ruling | open |
| 3.3 | the sidebar was holistic when surfaces were processes — dissolved, or re-grounded? | ruling | open |
| 3.4 | palette scope: commands only, or processes/recent as quick actions; palette → reader → process as a task manager; shortcuts on surfaces; does the palette default to overlay; is a shortcut bound to a landing mode | ruling | open |
| 3.5 | with surfaces as processes there was a history of surfaces — is that lost? | ruling | open |
| 3.6 | mount history and recall: at any closure (a grid, a stack, the tiling area, the whole tabs+tiles closure) see all mounts made there, chronological, filterable; from the palette across all surfaces; **locked vs open closures** (sidebar locked most of the time, tiling area open, unlockable — WYSIWYG newspaper) | draft | open |
| 3.7 | chrome as packages you depend on · shipped with the chassis · content mounting a default shell — which | ruling | open |
| 3.8 | is there a difference between the reader surface's definition and surfaces nested in a content closure | ruling | open |
| 3.9 | how quick is a move from overlay to content under Solid | files | open |

## 4. The block grammar

medium-newspaper's one big open — spec it.

| point | from feedback | tag | stands |
|---|---|---|---|
| 4.1 | "stored arrangements do not nest" — what does it mean; explain, then re-rule or strike; nesting limit as a valve; **derived arrangements and the WYSIWYG drag** — does a pure projection invert (act-scenes story 14) | ruling | open |
| 4.2 | the blocks: horizontal and vertical lists, overflow or wrap; grid, or always composed lists; flex-like without space-between — a list filled fully, wrapping or scrolling. **Widened (topic 2):** the blocks' full definition — `page`'s block archetypes with their fields; what every block declares beyond `medium` (its own `serves`? lockability?); the behaviours a medium implementation owes on each (WYSIWYG drag, selection); how they nest | draft | open |
| 4.3 | spacing and highlight law: hover highlight edge-to-edge? padding vs gap under nesting (doubling); labels inside or outside the highlighted area; chrome markers (colour, notification) at a corner; components-vs-blocks in lists — the command menu's result lists with no inter-element spacing, sections as blocks with optional labels; homogeneous vs heterogeneous lists | draft | open |

## 5. Reader and table — get specific

Depends on 2–4.

| point | from feedback | tag | stands |
|---|---|---|---|
| 5.1 | click a chunk → a selection in the collation; another member takes it as argument | draft | open |
| 5.2 | worked examples: a mixed selection {one a, one b, a list of c}; a list of chunks → a list block with block settings and a per-element surface (a list of agent processes each as process + context overview); the reader works dynamically with blocks | draft | open |
| 5.3 | members shown together, as tabs when they can't, or all as a limited foldable overview | ruling | open |
| 5.4 | attributes (per-element adjunct seats) dropped from the proposal — carry | files | open |
| 5.5 | the kinds of marking/chrome — made perfectly clear | draft | open |
| 5.6 | table: kv over the body only, or the full chunk surface with an embedded body table | ruling | open |

## 6. The chassis, input, and loading

Depends on 1–3.

| point | from feedback | tag | stands |
|---|---|---|---|
| 6.0 | is the engine baked into the chassis, or its own artefact to install? | ruling | **ruled in principle — its own installed artefact**, the wire its only contract; the chassis a client (runtimes belong with the engine, not the chassis). Spec'd whole here |
| 6.1 | chassis-desktop depends on neither newspaper nor Solid — so a pilot config module beside it? | ruling | open |
| 6.2 | consuming a renderer / component library is undefined — how does the chassis learn to load it (`.toml`, `.ol`)? surface processes never had this problem | draft | open |
| 6.3 | input handling underspecified; "per runtime" — does the runtime own substrate, or is it standardized in the SDK as a global view archetype; does a runtime implement its own integration | draft | open |
| 6.4 | the chassis heavily underspecced — every chunk and mechanic to spec grain | draft | open |
| 6.5 | chassis vs shell as modules — where project management lives | ruling | open |
| 6.6 | note for later: under latency the chassis will need its own engine/db (optimistic updates) — horizon | files | open |

## The check-in fold (2026-08-15) — is there something simpler than the whole proposal?

Opened deliberately by the author mid-ratification; its summary face. **Converged to a leaned direction (below), not ruled.** Resume from this section.

**Established in the fold:**
- **Security and performance do not separate the models.** The wall is the realm in both — an iframe on its own origin with its own connection is exactly what a crossing is; inside a shared realm, per-process boundaries are attribution and inspection, not security (the tree already says so). Iframes are for where trust changes — a handful, never per seat; a thousand iframes is not viable in either model, a thousand same-DOM seats is fine. Old-model performance is solvable with the same three moves the proposal makes: same-DOM by default, a shell-injected shared runtime (Solid), coalesced reads, no re-match on resize.
- **WYSIWYG is not a moat.** Content-drag between regions works in the old model once drag is slot machinery over declared selections (a third layer: content + overlay + drag; the drop resolves when the slot's selection inverts — act-scenes story 14). Arrangement-drag needs the arrangement to be data — which the tiler's own tree is, in either model; below a surface it is code in both (the proposal stops at component leaves too).
- **What genuinely differs** is not possibility but weight: the guarantee that structure is data everywhere (an investment, and a "must build it this way"), versus continuity and less to learn now.
- **The process → surface move stands on its own**, independent of arrangement-as-data: a surface as pure code (argument + reach in; DOM + dispatched acts out) mounted, not spawned, deletes the seat mechanism (seat birth, intent channel, unmount/death, per-seat tokens, re-match churn) and keeps *processes = work*; its cost is drawing the acts/walls model (act-scenes model B: the mount as the walled unit) — a swap for the seat drawings, and a more uniform one.

**Three honest options, named:** **A** — old model + Solid + the seat fixes now, the view family drafted as direction (least now; keeps the process/view blur). **C** — the proposal (most native; block grammar and acts model to draw; nothing else). **B-full** — both at once (the most; not for a pilot).

**The mix, sketched (the author's direction of thought):** surfaces not processes; **mounts** `{ surface, argument }` as chunks *or* as render-time values — the same shape, storing is what earns history/locks/WYSIWYG; surfaces are custom code (Solid, a component library in code — `view/component` and `view/medium` leave the substrate); any surface seats liberally without declaring what it seats; the arrangement chunks become the tiler's own payload archetypes; `page` a library the ground surfaces use, not a public medium; theme as tokens by convention. Substrate keeps: surface (argument, `serves`, ceiling, source), mount, reading/collation. The renderer contract shrinks to: load a surface's code, hand it argument + reach facts + a dispatch + a way to mount children (the props/SDK shape, 2.5 — the one piece to design with care). An agent seating a form for you = committing a stored mount over a payload draft. **This is the proposal with one relaxation — a surface's root may be code, so blocks/media are opt-in.**

**Open where the fold paused:**
- Nested mounts as data only mean something for a surface that *takes mounts as argument* (the reader: reading → collation of mounts; the tiler: its tree); a surface seating in code declares and stores nothing. Whether that two-grain rule is enough, or a problem — the author left it here.
- One archetype or two: a surface as *a program whose runtime is a renderer* (a run makes a mount, not a process — keeps "program and view are one") vs a second archetype beside program (keeps "processes mean work" sharp). Decides how much of programs.md/engine.md moves.
- What every option shares from topics 1–2: capabilities, secrets, `serves`, faces, `over`, mount-as-call, engine as artefact, attach era, Solid.

**The fold continued (same day) and converged — leaned, not ruled:**
- **Components are the one first-class thing** — medium and component unified; **layout stays data** (arrangements name components by contract). Mounting from the substrate's composition first; code-mounting later on the *same* glue (a component calling `mount()` into its own element with a derived `{component, argument}` — no new infrastructure).
- **A component is a self-contained executable**: `mount(el, props, slots, ctx) → { update, unmount }` — never hand-written; the SDK ships adapters (`solid()` first-party, `customElement()` admitting every framework that emits a custom element). Solid lives *inside* components (binds, doesn't diff — prop-grain at the seam, leaf-grain inside via `reconcile`); an instance keeps its DOM and store while mounted; `unmount` = the framework's dispose (needed in a shared realm; an iframe realm just drops).
- **Component vs implementation split kept** — precisely for layout-as-data: `component` = contract (props, slots, `serves`); `implementation` = `{ component, runtime, source }`, several per runtime (tech or look); which loads = config.
- **The runtime, three parts**: the *hospitality* (native half — DOM + realm, transport, `ol://`, identity, input floor; per platform, provided by the chassis at root or by a **hosting component** when nested — `FrameBox` = another `web-dom` in a new realm, the contained space; `GLBox` = a `gl` kind), the *glue* (realm half — boot, resolve, import, instantiate, subscribe, diff the arrangement, forward acts; identical everywhere given DOM + connection; **ships in the SDK**, one per runtime kind), and the *runtime chunk* (the kind, e.g. `web-dom` — the contract both halves meet). No renderer, no runtime implementations as modules; crossings are components; nested kind unsupported → collapsed face.
- **Acts**: `ctx.dispatch({commit|run})` forwarded by the glue on the SDK connection **stamped with the mount**; the engine judges under the mount's reach — act-scenes **model B by construction**; no person in v0.1.
- **Theme**: values chunk applied by the glue as CSS variables at the runtime root (ambient); per-mount look = optional arguments; implementation selection = config.
- **Surface == component**; the name is `component` ("surface" retires or survives informally). **Theme is data through `ctx`** — a values chunk delivered ambient, overridable per subtree by argument; how a component consumes it (CSS variables in its own root) is its own business — no CSS in the law.
- **Children, two doors**: **props** — data the component renders itself (not arrangement-visible); **slots** — children the *arrangement* places, **typed fields over `mount` in the ordinary contract grammar** (`slots: { items: list<mount>, left: mount?, … }` — any number of slot areas, each with cardinality); slot content is stored *or derived* (an expression yielding mounts — a list over a live place without code-mounting). Rule: *rearrangeable and remembered → slot; just the data → prop.*
- **WYSIWYG in two halves**: the geometric half is the container's (hit-test, insertion mark, report `(slot, index)` through one standard slot interface); the field half is the glue's (stored slot → arrangement edit; derived slot → inversion, story 14); locks = a stored subtree the glue refuses drops on.
- **Isolation**: same-DOM = trusted tier (the glue makes spoofing inconvenient — no global SDK, `ctx` by closure — never impossible); protection = mount a new runtime: `FrameBox` on its own origin with a chassis-injected identity; one *isolate* flag on a mount.
- **Substrate holds**: `runtime` (kind) · `component` · `implementation` · `mount {component, argument}` · arrangements · theme values · the chassis tables. Everything settled in topics 1–2 survives.

**Left after the fold** (topics reshaped, not new): the arrangement's data shape and first-party container components (topic 4, smaller) · the context handed to a component — props/slots/reach facts/dispatch/mount-children (2.5; **prototype before folding**) · acts ruled over the stories with sidebar/palette/history/locks (1.6 + topic 3) · runtime hospitality and chassis tables to chunk grain, engine as artefact (topic 6) · reader/table as components over collations of mounts (topic 5) · whether "surface" survives as a word.

Side result of the fold: the **deliberate fold** gesture recorded as a marked direction in `spec/agent.md` (*The thread — derived*).

## 7. Presentation — after the topics close

| point | from feedback | tag | stands |
|---|---|---|---|
| 7.1 | bottom-up for learning dependent knowledge, but a first read needs goals and principles first, then refinement — two forces; explore; apply to the rewrite (candidate for `conventions.md`, decided then) | draft | open |

## After

- Proposal rewritten whole (the argument changed — wholesale, not patched), goals-first, blocks before medium.
- Second ratification read.
- Ruling into `conclusions.md`, whole; board Next reworked; fold and sweep list (with the vocabulary trickle-downs); pilot-cut page.
