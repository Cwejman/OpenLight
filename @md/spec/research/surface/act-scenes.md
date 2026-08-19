# Act scenes — who acts, on what, under whose walls

**Resolved (2026-08-19) in [`proposal.md`](proposal.md):** model B — the mount is the walled unit, judged by the engine under a mount context; every start from the interface is a `launch` (session-owned, mount-capped); no person in v0.1 — the machine context narrowed per mount; input records as data; reach facts delivered to components. Kept as the walked grounding.

2026-08-15. Grounding for ratification point 1.6 (interface acts, once surfaces are not processes). **Nothing here is ruled.** The proposal calls what interface code emits an *intent*; the sitting established that on the wire an intent is only an ordinary `commit` or `run`/`launch` — nothing new — and that the open question is *where the walls live and who declares what*. Rather than argue that in the abstract, this page walks the stories we already know and asks each the same four things:

- **who acts** — a component, a surface's own machinery, the glue, the chassis, a process
- **on what** — the target of the commit or run, and how the actor came to hold it
- **under whose walls** — what reach the act is judged against, and what refuses it
- **what is recorded** — the commit(s), and what the record says about origin

Two candidate models are held against every story. Both keep the engine as the sole judge and the glue as a forwarder that never judges.

- **Model A — machine context.** Interface acts run under the tree's existing non-process caller (`Context::process_id = None`: full reach over what is attached, every created chunk must name its owner). No walls inside the shared realm; real walls only at crossings (an iframe realm with its own connection and grant). Simplest; the person's reach is the ceiling of everything on screen.
- **Model B — the mount as the walled unit.** A mount is field data in a tree and already states an argument-grant (`on`). Its reach = (`on` ∪ the surface's declared ceiling ∪ additions) ∩ the parent mount's reach, root cap = the machine context. Every dispatched act carries the mount it came from (the trusted input record already carries `mount: path`; the glue stamps it); the engine derives the walls by reading the mount chain. Rendering also reads under the mount's reach.

Two facts fixed by the sitting, carried into every story: **a component addresses only what it is handed** — its props — so any component-level declaration can only be prop-relative (`task.status`, the way a program's ceiling says `route.from`), or absent; and **the renderer hands the component its read/write facts as props** — enabled or disabled, input or plain text — so editability is delivered, never computed by the component (the tree's *editability is boundary-derived*, relocated).

---

## The stories

### 1 · Kanban drag — the gesture is the domain edit

Drag a card from *todo* to *done*. **Who:** the card component, or the column's drop handler. **On what:** the task in the card's props — `task.status ← done`. **Walls:** A — the machine's; refused only if the task's store is read-only (a peer). B — the kanban mount's: its `on` names the task place, so write over `[tasks]` must be in the mount's reach; a kanban mounted over a peer's tasks refuses and the entity menu offers *fork*. **Recorded:** one commit on the task; origin = the mount (B) or nothing more specific than "the interface" (A). *Demands:* under A the surface must still know read-only-ness to render the drag disabled → the renderer must supply reach facts either way.

### 2 · Reader edits — a viewer that writes *about* a reading

Add a member, hide one, reorder. **Who:** the reader surface's own chrome (component-leaves of its arrangement). **On what:** a new `collation` chunk (owned where? — the reading, or the session), then `reading.current` moves. **Walls:** the reader must never mutate what it *views*, but must write the collation and the reading. A — free. B — the reader mount's `on` is `[reading]`; the surface's declared ceiling says `write: { reading.current }` and *may create collations owned by the reading*. This is the tree's reader contract verbatim (programs.md §3), so B reproduces a contract we already wrote for the process form. **Recorded:** two commits or one; both attributed through the reader mount. *Demands:* the surface-level ceiling (`view/surface` gaining `read/write/run` like a program) is exactly what B needs here; A needs nothing.

### 3 · The command menu / palette — run from a list

Right-click a chunk; the menu assembles from field reads; pick *split*. **Who:** the command surface (seated in overlay). **On what:** a run of `arranger` with payload `arranger/split { … }`, or a `launch` of any listed program with the offer as argument. **Walls:** the pick executes under the menu's grant — under A the machine's, under B the *summoning* mount's (the offer came from a location the person was shown; the menu inherits that mount's reach — the tree's *anchor inheritance*, re-housed). Excess trips run-to-draft either way. **Recorded:** the draft/process chunk (a run is a chunk); the tree also records offer · entry list · pick as chunks — the command surface's own design, not the act mechanism. *Demands:* the payload is a **prop** to the entry component; a component's `run` can only be "the payload I hold" — component-level `run` selections over programs are the wrong grain (author). *This story is the same as ratification 3.4 seen from the act side.*

### 4 · The draft face — Go

A draft process seated; the person narrows the boundary chips, presses Go. **Who:** the draft face (surface-process's pre-start face). **On what:** `launch` of the draft (consumes it), then `arranger/open { content, position }` (the landing). **Walls:** the draft's own boundary keys as narrowed — the person's grant *is* the run's cap; today the tree says "the person's reach" without a referent (review matrix). A — the machine context is the referent. B — the draft-face mount's reach is the referent, which is narrower and inspectable. **Recorded:** the process flips draft → running; the arrangement commit. *Demands:* whichever model, this is where "what is the person's reach" gets a concrete answer.

### 5 · process-view — cancel / re-run on a process it merely shows

**Who:** process-view's action chrome. **On what:** `cancel` (protocol op) on a running process; `run` again with the same argument. **Walls:** cancel — who may kill? tree: kill-by-ownership; the interface holds no ownership over the process. A — the machine may. B — must the mount's `on` (the process) plus write imply cancel rights? cancel is not a commit; it's an engine op — B needs a rule for ops that are neither read nor write nor run (cancel, subscribe). **Recorded:** status flip; a new process on re-run. *Demands:* the op vocabulary beyond read/write/run under whichever model.

### 6 · Sidebar hide — non-destructive relates

**Who:** the sidebar's item menu. **On what:** a `relates` placement of the process onto a session-local `hidden` chunk. **Walls:** write over `[hidden]` (the dimension) + read over the process — placement law. A — free. B — the sidebar mount's `on` = `[session]`; hidden is a session member — one hop, inside. **Recorded:** one placement commit. *Demands:* nothing new; note the sidebar itself is ratification 3.3.

### 7 · Tab-bar and tiling drags — arrangement body edits

Rename a tab; drag a splitter; close a tile. **Who:** chrome components (tab-bar) or the tiling area's direct manipulation. **On what:** body edits on `session`/`tab`/`tile` — or, after the proposal, on the *arrangement's* blocks (mounts, lists). **Walls:** the tree gives the tree two writers with a `[session]` boundary. A — the machine. B — the chrome mounts' `on` = `[session]`, exactly the old contract. **Recorded:** arrangement commits, which is what makes "how was my screen Tuesday" a temporal read. *Demands:* under the proposal the arrangement is blocks under a surface root — the story must be re-walked once blocks are archetypes (ratification 2.6, 4.x): a splitter drag is a body edit on a *list block*.

### 8 · Overlay dismiss — machinery removes a chunk

Escape / click outside. **Who:** the overlay medium's implementation (a capture region), not a component. **On what:** removal of the `overlay/item` — the base-page ruling's "dismissal is a recorded field act". **Walls:** write over the overlay item's owner. A — free. B — the overlay is a mount in the *overlay* skeleton node; its `on` and owner are the summoner's; the machinery acts under that mount. **Recorded:** the removal commit. *Demands:* machinery (not components) also acts — the model must give the glue/medium implementations a mount context to act under.

### 9 · chunk-table over a peer store — edit or fork

The universal editor over a chunk in a read-only attached store. **Who:** field editors chosen by type. **On what:** body fields. **Walls:** write refused by store read-only-ness (attach era: writes route to the owning store, which is read-only) → the entity menu offers *fork* (copy + citation into a writable store). A and B agree; the interesting part is *rendering the refusal before the attempt* — the renderer must hand "not writable" down as a prop (story 1's demand again). **Recorded:** nothing on edit; on fork, the cross-store sequence (copy with citation). *Demands:* reach facts as props, per field.

### 10 · Prose — typing, then committing

Keystrokes are ephemera; a commit lands on pause/blur/explicit save. **Who:** the prose surface. **On what:** the body of the chunk it shows. **Walls:** write over the chunk. **Recorded:** body commits at the surface's cadence; ephemera never. *Demands:* the ephemera → commit seam is the surface's own; the act itself is an ordinary commit. Same under A and B.

### 11 · The approval chord — consent with reach-granting force

A run-to-draft rests beyond the caller's walls; the host modal shows the field-read facts; the reserved chord approves. **Who:** the chassis's reservation handler (native origin — a trusted input record). **On what:** starting the rested draft with the approver's reach as its cap. **Walls:** the *approver's* — which is the whole question: A — the machine's full reach (approving can never escalate beyond it, and never below it — there is no floor). B — the mount the draft face sits in? But the chord is caught natively, outside any mount; the record carries `at.mount` — the mount under the pointer, which may be unrelated. *Demands:* the consent act needs a defined principal; A answers it trivially, B must say which mount (lean: the draft-face's mount, delivered in the record).

### 12 · A quarantined component tries to write beyond what it was shown

Untrusted interface code in an isolated iframe realm with its own connection. **Who:** the quarantined code. **On what:** anything it can name. **Walls:** the crossing's connection carries its own grant — under A this is the *only* wall in the model; under B it is a mount wall like any other, only realized as a separate connection because the realm boundary is where forgery stops. **Recorded:** refused acts leave no commit; allowed ones attribute to the crossing. *Demands:* per-realm connections exist in both; B makes them one case of a general rule rather than the sole case.

### 13 · A surface that needs a daemon (ratification 3.2)

A surface whose content depends on a long-lived program (a watcher, a sync). **Who:** the surface, on first mount, or the person via a start act. **On what:** `run` of the daemon program. **Walls:** the `run` wall — A the machine's; B the mount's declared `run`. **Recorded:** the process; its lifetime is ownership (kill cascades from its owner — who owns a daemon a mount started? the session? the mount?). *Demands:* an owner for interface-started processes; whether starting on mount is legal (a surface answers subscription events by reading only — *no commit on event*; is *mount* an event?).

### 14 · WYSIWYG drag on a derived arrangement (author, this sitting)

The kanban is a *pure projection* over tasks (an expression yields the arrangement: columns by `status`); the newspaper's native drag, available on any unlocked mount, moves the card. **Who:** the newspaper implementation's WYSIWYG machinery — not the kanban surface, which wrote no drag code. **On what:** it *cannot* be an arrangement edit — the arrangement is derived, not stored — so either the projection **inverts** (the column position means `task.status`, and the machinery commits that), or the drop resolves to nothing and a hand-coded action is required. **Walls:** as story 1. **Recorded:** the domain commit if inversion holds. *Demands:* this is a lens question — which derived arrangements are invertible (a `group by` over one key is; a sort is; a fold is not), and whether the medium can know it. Not v0.1-shaped, but the answer decides whether "the gesture is the domain edit" is machinery or per-surface code. Ties to ratification 4.1 (derived arrangements) and 3.6 (locked closures).

---

## What the walk shows so far

- **Reach facts as props are needed under both models** (stories 1, 9): the renderer must deliver "may write / may run" to components. This is not a model choice; it is owed either way.
- **Model A** answers 4, 5, 11 trivially (there is one principal, full reach) and needs no new archetype fields — but it makes every mount's reach the machine's, so *rendering under narrower reach* (a mount over project-x cannot see or touch project-y) is not expressible, and locked/open closures (3.6) have to be a separate mechanism.
- **Model B** reproduces contracts the tree already wrote (2, 6, 7 are the old process contracts verbatim), gives locks and per-mount rendering reach for free, and makes crossings one case of a rule — at the price of: `view/surface` carrying `read/write/run`, ops beyond read/write/run needing a rule (5), machinery needing a mount to act under (8), and the consent act naming its mount (11).
- **Component-level ceilings are the wrong grain** under either (3): a component may only address its props; if it declares anything it is prop-relative or a bare kind ("writes"/"starts").
- **Open regardless:** who owns interface-started processes (13); whether derived arrangements invert (14).

To be walked again once blocks are archetypes (ratification 2.6) and locks are drawn (3.6): stories 7, 8, 14 change shape with them.
