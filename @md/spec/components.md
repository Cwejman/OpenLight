# Components — the pilot's component stores

The `component/*` family: the base package and the pilot's components, each a store shipping its declarations, payload archetypes, and default implementations ([`view.md`](view.md) holds the contract archetypes they are instances of; [`desktop.md`](desktop.md) the environment that mounts them). A second package may implement the same declarations differently — declarations depend on declarations; nothing ever depends on an implementation.

Two rules carry over from the tree unchanged. **Concepts built of several chunks render and behave as one concept** — the anatomy is substrate-level; the person sees one composer, one menu, one tool. And the economy: **a primitive program is warranted only where it holds authority the SDK doesn't confer**; everything else composes, including user-authored components — a declaration, a realization, and it is a full citizen.

## component/base — the family and the design language

The base family: leaf components (text, badge, status, button, the field editors by type, …), the layout primitives (**`list`** — `accepts: [ list/settings?, list<ref(view/mount)> ]`, settings `{ direction, overflow: ref(list/overflow) }` — `wrap`, `scroll` as owned value chunks; **`split`** — `[ split/settings?, list<ref(view/mount), 2> ]`, settings `{ direction, ratio }`; grid or composed lists [O]), the two **faces**, **`FrameBox`** / **`GLBox`**, the `Slot` helper; its shared settings offered at the root (density, tone — what theme used to be); one implementation package (`base/solid`), others may target the same declarations.

**The design language [P — the shipped implementation's judgment; a family's settings, never law; unpacked at comprehension depth in [`design.md`](design.md) — held judgment beside the law, not law — including what it supersedes of the tree's visual language].** Flat; **rhythm through spacing is the system**; the newspaper page is the precedent — dense legibility, no boxes; a border is a pixel copy of a structural fact the field already holds: ink derives, never stored. **The graduated scale**, one mark per live fact: **rest** — rhythm and typography only · **identity at rest** — the blockquote register: one edge rule, faint tint, or small label; *one edge, never four* · **attention** — hover/focus tints the region under the pointer, answering "what would this click act on" exactly when asked · **state** — background tint plus a corner dot or pill (the `Status` vocabulary); summoned dividers when facts become true (the scroll shadow only once content passes under a pinned strip) · **never** — enclosure, nested boxes, standing shadows. **Rhythm is a depth-derived value** — components state relations, context supplies magnitude, stepping down per level; the rhythm floor triggers the collapsed face. **Typography is role registers** on the six fixed sizes — importance, never indentation; absolute under nesting. Gutter and rhythm magnitudes are family settings, never arrangement data; scroll is an overflow fact of rendering, never data — one axis per region, pinned strips component-internal, seams summoned. Hypothesis to prototype, not adopt: the *charged fade* scroll seam. **The acid test**: the reader built flat, two documents side by side. The spacing/highlight law under nesting [O — the full drafting question with the author's reasoning: `design.md`].

## component/reader

**[P — as far as the spec goes. The reader is a later build stage (pilot.md, step 4); like the base family under §6's gate, it is decided in code, not in further speccing cycles — what follows is the ground to build from, and the opens below are answered by building (author, 2026-08-23).]** `reader` — `[ ref(reading) ]`; places `reading.current.mounts` via `ctx.mount`; a drop → a new collation (its own act); its defaults table is the ruled reader-owned preferences.

```ol
chunk reading { instance: { current: ref(collation) } }

chunk collation {
  instance: {
    mounts:       list<ref(view/mount)>
    -- rows, columns: value chunks owned by collation (substrate's enum)
    settings:     { orientation: ref(collation/orientation), … }
    predecessor?: ref(collation)
  }
}
```

Carried: the reader's indirection and its immutable value — a collation is one value, an ordered list of mounts plus settings and a predecessor citation; editing from anywhere branches, nothing is deleted, identity captures version. A viewer never mutates what it views — but a new collation is a chunk, and chunk birth is never placementless: the reader's commit names its owner (the reading is the natural home — a mount has no frame to default into), and `current` moves within the component's stated write reach. Any collation restores its exact view; opening anyone's collation is a fresh reading pointing at it — nothing copied, the first edit branches.

**Folding is a pipe.** `fold(summaries)` is a pure stage: any summary relating several elements of the piped sequence replaces them (a summary placed on its members *is* the group); unfolding is removing the stage — or read-in-place. Where no summary exists, folding requests one (`summarize`, below). **Expression display** (the small-UI rule, settled): never draw the graph in a pill — resting = out-verb plus derived yield; expanded = the **spine**, the longest path on one line, other inflows as ⊕ marks, clicking an inflow swaps the spine; the full canvas only in the editor. **Citizens carry as mounts**: programs and views a person attaches beside a view's ground are ordinary mounts in the arrangement, and the law survives the mechanism — **invited, governed by the person, always**: expansion is the person's gesture, dismissal always available.

Opens [O]: members shown together, as tabs when they cannot fit, or as a limited foldable overview · attributes — per-element adjunct seats, dropped from an earlier generation; carry or not · the marking/chrome taxonomy, made perfectly clear · differencing · the interaction drafting unit — click a chunk → a selection in the collation that another member takes as argument, with worked mixed-selection examples · whether a ground must be occupied, and the ensemble shape.

## component/table

`chunk-table`: the universal chunk component and last resort; field editors by type, reach facts deciding editor or text; over a read-only store editors render as text (no write). Kv over the body only, or the full chunk face with an embedded body table [O].

**sequence · document** — the ground components beside `chunk-table` (the list/table family). `sequence` — rows by seq; several ordered members interleave (seq/time, commit-time ties); it serves `db/commits` with message and touched addresses as chrome — history dissolved, no special surface. `document` — body text via `prose`, placements as chips, relates in the margin (its dissolution into `prose` + placement chrome is flagged, awaiting the author [O]). An **empty place draws an invitation** — what belongs here, derived from the archetype's keys, one keystroke to a conforming chunk; a dead root does not.

## component/process

`process-view`: three regions over process anatomy, filling derived from what's there. **Argument** — the argument set, boundary chips (the process body's `read`/`write`/`run`), the capability line; **editable iff unconsumed**: on a draft this region *is* the **draft face** — the seated argument, which is also the **mount composer**. Each element seats by its matched component; required entries must-fill, optional fold away; chips are the five boundary sources as the engine will construct them, narrowable before **Go**; consent sealed by the chord ([`chassis.md`](chassis.md)); exceeding any wall is run-to-draft. Starting and landing are two acts — Go consumes the draft (`launch`); where it lands is the caller's arrangement edit. **Frame** — `[self]`: children interleaved with `[db/commits, P]` — everything the run wrote, with nothing it could hide; streams by subscription while running; the same read is the autopsy. **Result** — the body's `result` ref: explicit, not a query. **Stale display** [R]: an argument whose referenced chunk has since changed or died still shows *as it was*, marked — derived from then-commit versus head; applies to viewed content, never to collations (values never go stale). Actions: cancel · pause/resume ([`agent.md`](agent.md)) · re-run · review changes; on a draft, run. The agent-specialized reading arrives via realization, not a second component.

## component/prose

Markdown with mounts in flow; the reference ladder as its defaults table (bare ref → badge · named link · widget); a reference beyond the boundary renders unresolved at every grade — the prose still reads, its embedded surfaces stop at the wall; dead references render dead, never repaired. Fenced expression blocks are anonymous expressions rendered as widgets; lifting makes them chunks. Keystrokes are ephemera.

## component/command

Entries derived from records + field: **the entry grain is the payload archetype**, not the program — one verb program, many entries, one per payload the offer can fill, labeled by the archetype; multi-select is free (the offer is a selection and the match counts). **Assembly is field reads only** — the registry match over components and programs against the offer; **declared `actions`** — an optional body key on programs *and* components, at two scopes: the render chain (view verbs: a reader declares hide/read-in-place) and the offer's own types (thing verbs: `agent` declares its steering payloads); derived choices (component, settings); built-ins. Palette and entity menu are **one program at two grades**, seated into overlay; the pick executes under the summoning mount's reach — excess is run-to-draft; the offer, the entry list, the pick and the act are all recorded. Context menus (field-assembled verbs) are infrastructure, never component-drawn; value selects — input to an act a component is composing — are always the component's own UI. The palette grade's starting vocabulary carries from the tree: fuzzy run over programs and components, whole-field FTS as find, the session's recents; its summoning input (the old leader key) is unplaced among the entry's two reservations [O].

Opens [O]: scope beyond commands — processes and recents as quick actions, the palette → reader → process chain as a task manager, shortcuts and their landing modes, whether the palette defaults to overlay; mount history is a temporal read over mounts (they are chunks); locks are `view/locked` — a browse over them is the desktop's to add. The program's name is ruled: **`command`** [R].

## component/overlay

`overlay-layer` as the entry's overlay layer; its `items` slot **derives by expression over the input-record place** the desktop's reservations name — each record yields an `overlay/item { anchor, content: ref(view/mount) }` *value* (the secondary gesture → `command` over the record; the chord → the consent face); nothing is stored but the record. Positioning, backdrop, capture region; dismissal = the record leaving. Follow-up surfaces inherit the summoning overlay's anchor, never the click point.

## Judgment components — declared, beyond the pilot cut

`history` (commits over any place or process; two commits → structural diff, both sides filtered by the boundary as it stands now; *open at commit* mounts a reader pinned `at(commit)`) · `review` (a body of changes grouped by chunk, before/after from temporal reads; keep / revert — undo-by-addition) · `merge` (branch review; blocked on branch ops — [`engine.md`](engine.md), *What Is Open*) · `edit` (hand-authoring chunks and contracts; `VALIDATION_ERROR` inline; `dry_run` preflight) · `term` (each command one `shell` run). Carried as declarations; their depth waits behind the pilot cut.

## The headless catalog

Components superseded programs only where they draw; the VM programs stand, each owning its payload and result archetypes per the convention:

- **`narrate`** — live model-driven abstraction of any place or process, its narration chunks ordinary derived data (`relates` on what they abstract, pinned to source commits); words in a narration are chrome — mentions are links. *Direction:* narration as a calibrated default view mode is the reach; v0.1 starts rudimentary.

- **`lift`** — reify a selection or an expression's result as a chunk with identity, the sharing gesture (one word now names two gestures — this and view.md §4's arrangement-lift [O — naming]).

- **`ingest`** — content → typed structure on target places (model-calling); how external matter enters the medium.

- **`summarize`** / **`embed`** / **`recall`** — derived data as ordinary chunks on derivation places; semantic entry beside FTS.

- **`reconcile`** — integration drift: walks reference chunks, compares source commits, badges stale ones via `relates`.

- **`revert`** — undo-by-addition from `[db/commits, target]` + temporal reads.

**Consumption tagging carries.** A model run's argument *is* the offered window — selection-typed, one link row per element, `at`-stamped — so the field answers natively, from any chunk's `linked`: which windows consumed this chunk, in which harnesses, at which state. And the wire request is a deterministic function of argument, stamped commit, and versioned provider program — any past completion re-renders exactly ([`agent.md`](agent.md)).

## Open — gathered

Beyond the opens marked in place above: grid or composed lists · the spacing/highlight law ([`design.md`](design.md)) · two runs of one program with identical arguments told apart (the sidebar — [`desktop.md`](desktop.md)) · state-dependent menu enablement (entries static in v0.1) · the accepts-side payload archetypes' names (bootstrap) · N-source contexts in the thread face (author-flagged).
