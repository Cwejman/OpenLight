---
under: the code
kind: brief
status: in force
---

# Five areas, and what stands in them

## 1. The areas

Five areas stand in a row: a wing, a gutter, the lane, a gutter, a wing. The lane keeps its measure, which is a setting. The gutters are as wide as an adjunct needs, wider than an editor's gutter, since what stands there is read. The wings share what is left, evenly, so the lane stands centred, and a wing takes more than its share only when it needs its least.

Each area pulls its content to its centre, and a figure takes only the room it needs, never reaching the strip at the area's foot. Between areas there is one gap, a setting, and no ink: no boxes, no borders, the flat page [the design language](../../../../design.md#why-flat--the-newspaper-precedent) asks for.

Any area closes by hand, from its own strip, and a closed area collapses to a thin rail of the same icons, so it opens again from where it stands. A closed side keeps its share of the room with its rail at the outer edge, so closing one wing never hands the other more than it had. As the screen narrows the areas give way in one order: the gutters first, as a pair, then the right wing, then the left, until the lane stands alone. An open wing gives way when it would have less than two hundred pixels, and a closed area costs only its rail. An area given no room is gone from the row, and its side keeps its share as empty room.

Nothing here nests, splits, or is dragged. An area holds one widget at a time, and whether it should ever hold two waits until use asks.

*Reasoned, the author's, 2026-09-13.*

## 2. Two kinds of widget

A gutter and a wing want different contracts, and naming the difference is what keeps every widget small.

An adjunct stands in a gutter. Given a brief in the lane, it returns what should stand beside that brief, aligned with it and scrolling with it: a link's target beside the link's own line, what points at the brief at its foot, and later a commit or a person. It never draws the body.

A figure stands in a wing. Given the body and the shared state, it returns a drawing that stands on its own: the tree, the shape beneath the focus, the lane as laid, the body whole. It never touches the prose.

*Reasoned, the author's, 2026-09-13.*

## 3. One shared state, and three verbs

Every widget reads one state and nothing else: the body with its index, the address in focus, the address the pointer rests on, the grade of every brief in the lane, and the settings. Every widget acts through the same three verbs: go to an address, point at one, fold one. A widget is a plain function in a table keyed by its name, and adding one is adding a function and a name.

Everything drawn that names a brief carries that brief's address. That one convention is what keeps the widgets in step: pointing at a brief in any of them lights it in all of them, and pressing it anywhere goes.

*Reasoned, carried from the first program, where the address on every element was what kept its figures in step.*

## 4. The strip

At the foot of each area stands a low row of icons, one per widget the area can hold and one to close it, centred under the area. They are light, not buttons: no ground, no border, the one in use a little darker than the rest. Pointing at one names it, and pressing makes it the area's widget. A closed gutter keeps its row, centred on the thin column it left; a closed wing turns its row and stands as a rail at the edge, since a row would run off the screen there.

*Reasoned, the author's, 2026-09-13.*

## 5. Settings are data, and a figure edits them

The settings are one object of values: the zoom on the prose, the ratio by which each heading register grows over the body, the height of the prose's lines, the lane's measure, the gap between areas, the dim on every brief but the highlighted one, the fade at the edges, the flick, the theme, the face of the headings and the face of the prose, and the widget of each area. They apply as style variables and layout facts, and they live in the browser's own storage, never in the address.

The settings figure is meters in two rows with switches beneath: each meter a 270 degree arc with rounded ends, the value drawn in a warm red over a faint track, its icon in the middle, and its name and value told on pointing. Dragging up or down turns one, and the wheel steps it. It is a wing widget like any other.

*Reasoned, the author's, 2026-09-13; that headings scale by depth departs from the design language's register rule, at the author's ask.*

## 6. What this is a small copy of

The pilot's view layer has components, mounts, one context handed to each, and an offer flowing down the tree. This framework is that in miniature, and it stays dumb on purpose, so that it never grows into a second one. What it finds is recorded as findings for that layer rather than built here: so far, the address on every drawn element, and the adjunct aligned to the text it belongs to.

*Reasoned, 2026-09-13.*
