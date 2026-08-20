# The design language — unpacked

2026-08-20. The comprehension depth behind the brief's condensed design-language paragraph ([`proposal.md`](proposal.md), *component/base*). The brief stays authoritative on *what* is proposed; this page carries the *why* — the reasoning a future session needs to hold the rules rather than recite them. Status matches the brief: **[P] as a whole** — the shipped implementation's judgment, a family's settings, never law; another implementation of the same component declarations may use borders and boxes throughout and be equally lawful.

## Why flat — the newspaper precedent

The reference is the broadsheet page: five hundred years of the densest legibility ever mass-produced, achieved with **no boxes at all** — hierarchy from type scale, grouping from proximity, separation from white space and the occasional single rule. The page proves that enclosure is not what makes structure readable; *rhythm* is. UI toolkits reach for boxes because boxes are easy to implement, not because they read well — every border is ink spent on repeating something the layout already said.

The substrate sharpens this from taste into a principle: **a border is a pixel copy of a structural fact the field already holds.** The group *is* a placement; the membership *is* a dimension; drawing a box around it stores the same fact twice, in ink. So: **ink derives, never stored** — any mark on screen must be computable from the field, and the flat default is what you get when you refuse to spend ink on redundancy. (This is *one source, one direction* applied to pixels.)

## The graduated scale — one mark per live fact

The organizing idea: every visible mark answers to exactly one *fact class*, and marks are spent in strict proportion to how alive the fact is. Five classes, in escalating order; these five names are also the semantic vocabulary a family's settings speak:

- **rest** — the default state of everything. Rhythm and typography only: position, size, weight, space. No ink. If a composition at rest has any borders, tints, or shadows, something below is misclassified.
- **identity at rest** — a thing that must read as *a different kind of thing* even when idle: quoted material, an embedded foreign chunk, a peer's content. The register is the blockquote's: **one edge rule, a faint tint, or a small label — one edge, never four.** One edge marks identity; four edges make a box, and a box claims containment the layout already shows. The rule's job is "this is other", not "this is inside".
- **attention** — the interactive answer to "what would this click act on", delivered exactly when asked and never before: hover/focus tints the region under the pointer. Attention marks are transient by definition — a persistent hover tint is a state mark wearing the wrong class.
- **state** — a live fact about work: running, failed, pending, stale. Background tint plus a corner dot or pill (the `Status` vocabulary the tree already has). This class also owns **summoned dividers**: separation ink that appears only when its fact becomes true — the canonical case is the scroll shadow under a pinned strip, drawn only once content actually passes beneath it. A divider present at rest is a lie about state.
- **never** — enclosure, nested boxes, standing shadows. Not "rarely": the classes above exhaust the legitimate reasons for ink, so anything left is redundancy.

The scale is falsifiable in review: point at any mark and ask which fact class pays for it. A mark with no class is deleted; a mark in the wrong class is moved.

## Rhythm — depth-derived, never stated twice

Spacing does the work borders would have done, and it must *nest* correctly or dense compositions collapse into mush. The mechanism: **components state relations, context supplies magnitude.** A component never writes `16px`; it says "these are siblings", "this is a child group". The family's settings supply the magnitude at depth 0, and the value **steps down per nesting level** — a list inside a list inside a reader breathes at three descending scales, so outer grouping always reads looser than inner grouping without anyone coordinating.

Two consequences carried into the contracts: gutter and rhythm magnitudes are **family settings, never arrangement data** (an arrangement that stored spacing would freeze one theme's magnitudes into structure); and there is a **rhythm floor** — a depth below which the step-down cannot shrink further and still read. Hitting the floor is not a rendering problem, it is the signal that depth must become navigation: the **collapsed face** triggers (see the brief's *faces*).

## Typography — role registers on six fixed sizes

Six sizes, fixed, family-wide; each carries a **role** (title, body, annotation, chrome…), and role expresses **importance, never indentation**. The trap this forbids: encoding tree depth as diminishing type, so that nesting level 4 becomes unreadable fine print. Sizes are **absolute under nesting** — a title inside a card inside a split is the same register as a title at top level; depth is already expressed by rhythm and position, and expressing it twice (space *and* size) compounds into illegibility. Six because a newspaper needs about that many; more sizes than roles means sizes are being used as decoration.

## Scroll and seams

Scroll is an **overflow fact of rendering, never data** — no arrangement stores "this region scrolls"; a region scrolls when its content exceeds its box, full stop. One axis per region (two-axis scroll is two regions pretending to be one). Pinned strips (a toolbar that holds while content moves) are **component-internal** — the strip belongs to the component that owns the scroll, never to the arrangement. Seams — the marks where scrolling content meets fixed chrome — are **summoned** (state class): present only while the overlap fact is true. The **charged fade** — a scroll seam whose fade intensity carries how much is hidden — is a hypothesis to prototype, not to adopt.

## What survives of the tree's visual language, and what this supersedes

The tree's `programs.md` §1 (*Visual language*) predates the surface fold and partly contradicts this language. Stated plainly for the rewrite, since nowhere else says it:

- **Survives, re-grounded**: the quiet canvas (light padding, chrome as text on the background, no panels) · **life reads as life** — running work visually *rises*, terminal work falls flat — but re-expressed through the **state** class (tint + status mark), not through card elevation · platform scrollbars never styled · visual token values parametrized, settled by eye.
- **Superseded by this language**: tiles as rounded cards with CSS shadows, the raised-card running state, in-flow cards with surface fills and glows — all **enclosure and standing shadow**, the *never* class. The host-cast aura was already dead; this retires its CSS replacement too. What separates tiles in a split is rhythm (the gap) and, at most, summoned seams while dragging.
- The old open on **colour** (whether a colour attribute lives on places or programs, surfacing in reader markings) rides along unresolved — it will land in the marking taxonomy (ratification 5.5).

## The open spacing/highlight law — the drafting question, with the author's reasoning

The one part deliberately not settled (`[O]` in the brief), recorded here at full depth because the reasoning is the ground a drafting session needs. The author's walk (ratification, thread 4.3):

Nesting spends space: a vertical list in the reader naturally uses more space between elements than those elements use internally (the rhythm step-down, above). But the **command menu and palette** want result lists with essentially *no* spacing between rows — and the hypothesis that fell out: **their rows are leaf compositions, not containers** — dense rows under one container, where the container's rhythm applies *around* the list and barely within it. Sections in such a menu are then sibling lists under a wrapping container, with or without a preceding label. From there the open questions, each with the author's lean where one was voiced:

- **Is the hover highlight always edge-to-edge?** If every row highlights to the container's full width, inter-row space reads as part of the rows, and "spacing" dissolves into *padding within highlightable areas*. But the newspaper page is *not* everything-edge-to-edge, so this cannot be a global rule — the law must say where edge-to-edge holds (dense menus) and where it doesn't (the reader's page).
- **Padding vs gap under nesting.** If a list's elements are edge-to-edge highlight areas, an element's internal padding and the list's inter-element gap stack — adjacent elements can read as *double-spaced*. The law must say who owns the seam (lean: the container owns the gap; elements own only their padding; the step-down operates on gaps).
- **Labels inside or outside the highlighted area?** Lean: inside — outside floats the label ambiguously between rows — though inside can look heavy; it looks right when the area also carries corner chrome (below).
- **Corner chrome**: a marker (a collation's colour, a notification dot) sits top-right while the label sits top-left — the two chrome positions of a highlightable area, coexisting without collision.
- **Homogeneous vs heterogeneous lists**: dense edge-to-edge rows may only be legitimate for *homogeneous* lists (all rows one kind, as in a menu); a heterogeneous list (a reader's mixed members) may always need real rhythm. Unsettled either way.

The **acid tests**, in order: the reader built flat — two documents side by side, readable with zero boxes; then the command menu built dense from the same family — the two extremes of the spacing law under one set of rules; then the kanban drag (the state and attention classes under motion).
