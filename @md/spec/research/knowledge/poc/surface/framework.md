---
under: the code
kind: brief
status: in force
---

# Five areas, and what stands in them

## 1. The areas

Five areas stand in a row: a wing, a gutter, the lane, a gutter, a wing. The lane keeps its measure, which is a setting. The gutters are as wide as an adjunct needs, wider than an editor's gutter, since what stands there is read. A wing is as wide as the widest figure it holds, its strip free to reach a little past it into the space beside, and every figure declares a width that never changes with what it draws, so nothing beside it moves as it redraws.

![A row of five areas across the page: a narrow wing on the left holding small bars and blocks with a shaded viewport over them, an empty gutter, a wide lane of grey prose lines with one coloured link in its third line, a gutter holding a short note level with that link, and a narrow wing on the right holding bars and a framed block; a thin rule beneath each area and its name under the rule, lane in bold](.img/areas.svg)\
The five areas as they stand by default: the shape in the left wing, the left gutter empty, the lane, the links beside the lane's link in the right gutter, and the ahead in the right wing.

No area carries room it does not use, so the spacing is the spaces between them, and those are one: the space at either edge of the viewport is the space between a wing and the lane. The gap setting is the least a space is given, and what the width leaves over is shared among the spaces evenly. The gutters are the exception, standing a gap from the lane, since what stands in them is aligned to its lines. Vertically a wing's figures reach no further up or down than the prose does: they stand between the middles of the lane's fades at its top and its foot, so they follow the fade setting, keeping at least a gap at the top and the strip's room at the foot, with one gap between two figures. And no ink: no boxes, no borders, the flat page [the design language](../../../../design.md#why-flat--the-newspaper-precedent) asks for.

Any area closes by hand, from its own strip, and a closed area collapses to a thin rail of the same icons, so it opens again from where it stands. A closed area takes no room at all; only its strip stays. As the screen narrows the areas give way in one order: the gutters first, as a pair, then the right wing, then the left, until the lane stands alone. An area gives way when its width and one space no longer fit, and an area given no room is gone from the row.

A wing holds up to two figures, one at its top and one at its foot. A figure of fixed size, the plate or the settings, takes only the height it needs; a figure that grows, the shape, the tree or the ahead, takes what is left, shared evenly when both grow. A gutter holds one adjunct. Nothing nests further, splits, or is dragged.

*Reasoned, the author's, 2026-09-13; the widths, the even spaces and the second figure the author's asks of 2026-09-14, when a lone wing was seen standing further from the edge than the lane stood from the other.*

## 2. Two kinds of widget

A gutter and a wing want different contracts, and naming the difference is what keeps every widget small.

An adjunct stands in a gutter. Given a brief in the lane, it returns what should stand beside that brief, aligned with it and scrolling with it: a link's target beside the link's own line, what points at the brief at its foot, and later a commit or a person. It never draws the body.

A figure stands in a wing. Given the body and the shared state, it returns a drawing that stands on its own: the tree, the shape beneath the focus, the lane as laid, the body whole. It never touches the prose.

*Reasoned, the author's, 2026-09-13.*

## 3. One shared state, and four verbs

Every widget reads one state and nothing else: the body with its index, the address in focus, the address the pointer rests on, the scope, the grade of every brief in the lane, and the settings. Every widget acts through the same four verbs: go to an address, point at one, fold one, scope to one. A widget is a plain function in a table keyed by its name, and adding one is adding a function and a name.

Everything drawn that names a brief carries that brief's address. That one convention is what keeps the widgets in step: pointing at a brief in any of them lights it in all of them, and pressing it anywhere goes.

*Reasoned, carried from the first program, where the address on every element was what kept its figures in step.*

## 4. The strip

At the foot of each area stands a low row of icons, one per widget the area can hold and one to close it, and a row always lies flat. They are light, not buttons: no ground, no border, the ones in use a little darker than the rest. Pointing at one names it. On a wing, pressing adds the figure, at the foot when one is already there, or takes it away when it is already in use, and a third press takes the place at the foot; on a gutter, pressing makes it the gutter's adjunct.

A row offers only what can stand. An icon whose press would leave its area without room is not shown, and a closed area with nothing it could open shows no row, so a press never makes the row it was made on vanish. An open area's row is centred under it. A closed gutter's row stands at the foot of the lane, at the edge the gutter would open on, where the lane's text has already faded; a closed wing's row stands in the space beside the lane where the wing would open. Each side of the lane has a wing's row and a gutter's row, and they stand apart when both fit where they belong without touching. Where they would touch, the gutter's icons join the wing's row, nearest the lane and past a thin divider, so a tight side offers one row with the choice of either.

*Reasoned, the author's, 2026-09-13; the flat rows and the offer of only what fits the author's asks of 2026-09-14, when opening a gutter the width could not hold made its row disappear; a side's rows joining where they would touch the same day.*

## 5. Settings are data, and a figure edits them

The settings are one object of values: the zoom on the prose, the ratio by which each heading register grows over the body, the height of the prose's lines, the lane's measure, the gap between areas, the dim on every brief but the highlighted one, the fade at the edges, the flick, the theme, the face of the headings and the face of the prose, where the reading line stands, the weight, and the widget of each area. They apply as style variables and layout facts, and they live in the browser's own storage, never in the address.

The settings figure is meters in two rows with switches beneath: each meter a 270 degree arc with rounded ends, the value drawn in a warm red over a faint track, its icon in the middle, and its name and value told on pointing. Dragging up or down turns one, and the wheel steps it. It is a wing widget like any other.

*Reasoned, the author's, 2026-09-13; that headings scale by depth departs from the design language's register rule, at the author's ask.*

## 6. What this is a small copy of

The pilot's view layer has components, mounts, one context handed to each, and an offer flowing down the tree. This framework is that in miniature, and it stays dumb on purpose, so that it never grows into a second one. What it finds is recorded as findings for that layer rather than built here: so far, the address on every drawn element, and the adjunct aligned to the text it belongs to.

*Reasoned, 2026-09-13.*
