---
under: the code
kind: brief
status: in force
---

# Moving, and asking

## 1. Sideways is a scrub, never a second scroll

Moving among panes is a scrub: a drag along [the drawing of the path](drawings.md#1-above-the-panes-a-drawing-per-level-and-the-path-whole) that carries the reading with it. Never a second scroll, since two axes in one region are two regions pretending to be one.

A level's drawing is scrubbed too, and there the drag moves the reading beneath it, so a reader reaches a brief at the far end of a level without scrolling the whole way to it.

Neither discards anything. A scrub reaches a pane that has gone off screen rather than dropping it, which is what lets a path run deeper than a viewport is wide.

*Reasoned, the author's, 2026-09-12; the one-axis rule is [the design language's](../../../design.md#scroll-and-seams).*

## 2. The path is the address

A path is where a reader is, so it is also what a reader can be handed. The surface is one page that never reloads, and the path is what its address carries, so any place in the body can be sent to someone and opened directly.

What the browser's back retraces is the commitments. Opening a level enters the history and so does [following a link](panes.md#4-following-a-link-moves-you-and-the-history-is-the-way-back), since both put a reader somewhere new; looking at either never does. So back and forward walk the moves a reader chose rather than everywhere the pointer went.

*Reasoned, the author's, 2026-09-12.*

## 3. The rest of a brief is told on asking

Everything that names a brief carries only part of it. A cell in a drawing carries shape and nothing else. A [door](panes.md#1-a-brief-with-nothing-beneath-it-is-not-a-door) carries the brief's [face](../poc.md#3-the-surface-is-declared-by-position), its heading and the paragraph under it. A pane carries the level but never a brief's relations, since a link may reach anywhere and a pane only ever descends.

So the rest is told on asking, from wherever the brief is named: a cell in any of the drawings, a door, a name in the prose. Pointing at it raises a card beside the pointer, carrying what that naming left out, which is the face, what the brief and its level weigh, the drawing of the level beneath it, and what points at it.

The card leaves when the pointer does, unless a reader keeps it. A card that stands can be pointed at in turn, so every name in it is a way on, and this is where seeing a relation stops depending on following one.

A card needs a ground of its own or it cannot be read, and that is where [the design language](../../../design.md#why-flat--the-newspaper-precedent) stops being a guide. It settles the flat layout, where an area at rest carries no background and no border and spacing does all the work, and it never considers what sits over that.

What it does settle nearby is the hover: the ground under a pointer is altered a little, with rounded edges. A card is that register raised, so for now it takes the same ground rather than a colour of its own, with a slight blur of what lies behind and at most a faint border, since the same colour blurred and with no edge at all would not read.

*Seen in the program retired on 2026-09-12, which held these facts in a card and pinned it on a click. The card's own look is the author's preference for a first implementation, since the design language has not reached overlays and nothing here is settled beyond it. What pays for the ink once a card stands, attention having left, is open.*

## 4. One gesture, one meaning

Every figure is a control as well as a view, so one cell can be looked at, dragged and entered. Three meanings on one target collide unless each gesture carries exactly one: pointing [lights it everywhere](drawings.md#5-one-brief-lit-wherever-it-is-drawn) and tells the rest, dragging scrubs, and pressing commits a descent, which may carry every level a reader looked through before choosing.

So keeping a card is a press inside the card and never on the cell that raised it, since a press on the cell already means descend. That assignment holds while a card comes on pointing, and [the other way of raising one](#5-which-gesture-raises-a-card-and-what-each-way-costs) would redraw it.

*Reasoned, 2026-09-12, from the collision three separate rules made on one gesture.*

## 5. Which gesture raises a card, and what each way costs

A card comes on pointing in the briefs above, and whether it should is the largest thing unsettled here, because the two ways differ in more than their trigger.

Raising it by pointing costs the apparatus a cascading menu needs. The card cannot sit under the pointer, so it stands off at a distance. The gap between them must then be forgiving enough to cross without the card collapsing, leaving that zone must dismiss it, and a card raised from inside another needs its own gap for the same reason.

It probably wants a moment's hold as well, so that a pointer crossing a level's drawing does not raise one for every cell it passes. None of that is hard and all of it is fiddly, and none of it exists on a touch screen.

Raising it by pressing costs a gesture instead. One press raises the card and a second opens the level, or one press raises it and a modified press opens directly. That works the same under a finger as under a pointer, and it takes pressing away from descent, so the assignment above is redrawn.

Neither is chosen. Pointing is what the retired program did and what these briefs assume; pressing is the only one of the two that reaches a touch screen without a second design being invented for it.

*Open, 2026-09-12.*
