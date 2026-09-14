---
under: the code
kind: brief
status: in force
---

# Five areas, and what stands in them

## 1. Two kinds of widget

A gutter and a wing want different contracts, and naming the difference is what keeps every widget small.

An adjunct stands in a gutter. Given a brief in the lane, read from the shared state, it returns what should stand beside that brief, aligned with it and scrolling with it: a link's target beside the link's own line, what points at the brief at its foot, and later a commit or a person. It never draws the body.

A figure stands in a wing. Given the body and the shared state, it returns a drawing that stands on its own: the tree, the shape beneath the focus, the lane as laid, the body whole. It never touches the prose.

*Reasoned, the author's, 2026-09-13.*

## 2. The areas

Each area is as wide as what it holds and no wider, and no ink stands around any of them, no boxes, no borders, the flat page [the design language](https://github.com/Cwejman/OpenLight/blob/main/@md/spec/design.md#why-flat--the-newspaper-precedent) asks for. So the page is the prose and what orients it, and nothing else asks for the eye.

![A row of five areas across the page: a narrow wing on the left holding small bars and blocks with a shaded viewport over them, an empty gutter, a wide lane of grey prose lines with one coloured link in its third line, a gutter holding a short note level with that link, and a narrow wing on the right holding bars and a framed block; a thin rule beneath each area and its name under the rule, lane in bold](.img/areas.svg)\
The five areas as they stand by default: [the shape](widgets.md#3-the-shape) in the left wing, the left gutter empty, the lane, [the links](widgets.md#5-links) beside the lane's link in the right gutter, and [the ahead](widgets.md#4-the-ahead) in the right wing.

*Reasoned, the author's, 2026-09-13.*

### 2.1 Widths

The lane keeps its measure, the width of its line of text, which is a setting. The gutters are as wide as an adjunct needs, wider than an editor's gutter, since what stands there is read.

A wing is as wide as the widest figure it holds, and every figure declares a width that never changes with what it draws, so nothing beside it moves as it redraws. A wing's [strip](#3-the-strip) is free to reach a little past it into the space beside.

*Reasoned, the author's asks of 2026-09-14.*

### 2.2 The spaces between are one

No area carries room it does not use, so the spacing is the spaces between them, and those are one: the space at either edge of the viewport is the space between a wing and the lane.

The gap setting is the least a space is given, and what the width leaves over is shared among the spaces evenly. The gutters are the exception to the sharing, standing exactly a gap from the lane, since what stands in them is aligned to its lines.

*Reasoned, the author's ask of 2026-09-14, when a lone wing was seen standing further from the edge than the lane stood from the other.*

### 2.3 A wing's figures reach as far as the prose

Vertically a wing's figures reach no further up or down than the prose does. They stand between the middles of the lane's fades at its top and its foot, so they follow [the fade setting](#5-settings-are-data-and-a-figure-edits-them), keeping at least a gap at the top and the strip's room at the foot, with one gap between two figures.

*Reasoned, the author's, 2026-09-14.*

### 2.4 Closing by hand

Any area closes by hand, from its own [strip](#3-the-strip). A closed area takes no room at all: only its strip stays, the same icons standing where [the strip's rule](#31-a-row-offers-only-what-can-stand) puts them, so the area opens again from there.

*Reasoned, the author's, 2026-09-13.*

### 2.5 Giving way

As the screen narrows the areas give way in one order: the gutters first, as a pair, then the right wing, then the left, until the lane stands alone. An area gives way when its width and one space no longer fit, and an area given no room is gone from the row, strip and all, until the screen widens.

*Reasoned, the author's, 2026-09-13.*

### 2.6 What an area holds

A wing holds up to two figures, one at its top and one at its foot. A figure of fixed size, [the plate](widgets.md#7-the-plate) or [the settings](widgets.md#6-settings), takes only the height it needs; a figure that grows, the shape, [the tree](widgets.md#2-the-tree) or the ahead, takes what is left, shared evenly when both grow. A gutter holds one adjunct. Nothing nests further, splits, or is dragged.

*Reasoned, the author's, 2026-09-13; the second figure the author's ask of 2026-09-14.*

## 3. The strip

At the foot of each area stands a low row of icons, one per widget the area can hold and one to close it, and a row always lies in one line, never stacked. They are light, not buttons: no ground, no border, the ones in use a little darker than the rest. Pointing at one names it.

On a gutter, pressing an icon makes its adjunct the gutter's. On a wing, pressing an icon not in use adds its figure, at the foot when one already stands at the top; pressing one in use takes its figure away; and when both places are taken, pressing a third takes the place at the foot.

*Reasoned, the author's, 2026-09-13; the rows in one line the author's ask of 2026-09-14.*

### 3.1 A row offers only what can stand

An icon whose press would leave its area without room is not shown, and a closed area with nothing it could open shows no row, so a press never makes the row it was made on vanish.

An open area's row is centred under it. A closed gutter's row stands at the foot of the lane, at the edge the gutter would open on, where the lane's text has already faded; a closed wing's row stands in the space beside the lane where the wing would open. Each side of the lane has a wing's row and a gutter's row, and they stand apart when both fit where they belong without touching. Where they would touch, the gutter's icons join the wing's row, nearest the lane and past a thin divider, so a tight side offers one row with the choice of either.

*Reasoned, the author's asks of 2026-09-14, when opening a gutter the width could not hold made its row disappear.*

## 4. One shared state, and four verbs

Every widget reads one state and nothing else, and acts through the same four verbs. A widget is a plain function in a table keyed by its name, and adding one is adding a function and a name.

The state is the body and its index of [addresses](implementation.md#32-the-address-is-the-path-of-titles), the address in focus, the address the pointer rests on, the scope, the grade of every brief in the lane, and the settings. The verbs are to go to an address, to point at one, to fold one, and to scope to one, [making it the root of the lane](lane.md#7-scoping-the-lane).

Everything drawn that names a brief carries that brief's address. That one convention is what keeps the widgets in step: pointing at a brief in any of them lights it in all of them, and pressing it anywhere goes.

*Reasoned, carried from [the first program](README.md#8-what-was-tried-and-refused), 2026-09-12.*

## 5. Settings are data, and a figure edits them

The settings are one object of values. They apply as style variables and layout facts, and they live in the browser's own storage, never in the address. A figure edits them, [the settings widget](widgets.md#6-settings), which is a wing widget like any other.

The type: the zoom on the prose, the ratio by which each heading register grows over the body, the height of the prose's lines, and the lane's measure. The page: the gap between areas, the dim on every brief but [the highlighted one](lane.md#4-where-you-are-is-the-brief-in-focus), and the fade at the edges. The reading: where the reading line stands, the flick, and the weight, each [as the lane gives it](lane.md#4-where-you-are-is-the-brief-in-focus). The look: the theme, the face of the headings and the face of the prose. And the widget of each area, which by default is the shape in the left wing, nothing in the left gutter, the links in the right gutter and the ahead in the right wing.

*Reasoned, the author's, 2026-09-13; that headings scale by depth departs from [the design language's register rule](https://github.com/Cwejman/OpenLight/blob/main/@md/spec/design.md#rhythm--depth-derived-never-stated-twice), at the author's ask.*

## 6. What this is a small copy of

[The pilot's view layer](https://github.com/Cwejman/OpenLight/blob/main/@md/spec/view.md) has components, mounts, one context handed to each, and an offer flowing down the tree. This framework is that in miniature, and it stays dumb on purpose, so that it never grows into a second one. What it finds is recorded as findings for that layer rather than built here.

*Reasoned, 2026-09-13.*
