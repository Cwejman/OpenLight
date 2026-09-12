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

Everything that names a brief carries only part of it. A cell in a drawing carries shape and nothing else. A [door](panes.md#1-a-brief-with-nothing-beneath-it-is-not-a-door) carries the brief's [face](../poc.md#3-the-surface-is-declared-by-position), its heading and the paragraph under it. A link carries only the words the sentence gave it.

So the rest is told on pointing. An overlay appears beside whatever the pointer rests on, outside the bounds of the figure that raised it so its structure stays visible, and it carries the face, what the brief and its level weigh, the drawing of the level beneath, and what points at the brief.

It tells, and it is never acted in. A reader reads it and then presses the thing that raised it, and never moves the pointer into the overlay at all. That is what makes pointing safe on a crowded figure: there is no journey from a cell to an overlay, so there is nothing for the cells in between to interrupt.

For that to hold, everything an overlay shows has a home a reader can reach. The face is in the brief and in its door, the weights are in the drawings, the level beneath is reached by pressing the cell, and [what points at a brief stands at its foot](panes.md#5-what-points-at-a-brief-stands-at-its-foot) in its own pane.

An overlay needs a ground of its own or it cannot be read, and that is where [the design language](../../../design.md#why-flat--the-newspaper-precedent) stops being a guide. It settles the flat layout, where an area at rest carries no background and no border and spacing does all the work, and it never considers what sits over that.

What it does settle nearby is the hover: the ground under a pointer is altered a little, with rounded edges. An overlay is that register raised, so for now it takes the same ground rather than a colour of its own, with a slight blur of what lies behind and at most a faint border, since the same colour blurred and with no edge at all would not read.

*Seen in the program retired on 2026-09-12, which held these facts in a card beside the pointer. Its ink is paid for by [attention](../../../design.md#the-graduated-scale--one-mark-per-live-fact), the design language's own class for a mark delivered exactly when asked and gone when it is not, which is what an overlay that only tells can be. Its look is the author's preference for a first implementation, since the language has not reached overlays.*

## 4. One gesture, one meaning

Every figure is a control as well as a view, so one cell can be looked at, dragged and entered. Three meanings on one target collide unless each gesture carries exactly one.

Pointing tells. A brief lights [wherever it is drawn](drawings.md#5-one-brief-lit-wherever-it-is-drawn), the cursor follows, and an overlay says what the brief is. Dragging scrubs. Pressing goes: to the level under a door, to the brief a cell names, to the target of a link.

One scheme serves a cell, a door and a link alike, and nothing in it depends on reaching anything. A reader who knows where they are going presses. A reader who does not points first, and then presses.

Where there is no pointer it reads as the platform's own convention, a hold to tell and a tap to go. Nothing further about a touch reading is taken up here.

*Reasoned, the author's, 2026-09-12.*

## 5. What is proposed next, and not built

Holding a modifier while pointing would freeze the overlay, so a reader could move into it, point at the names inside, and look several levels down without descending at all.

It interferes with nothing, since a reader who never holds the modifier never meets it. That is why it can wait: the reading above is whole without it, and this keeps a first implementation narrow.

*Proposed, the author's, 2026-09-12, and not in force. It is the step after the first reading works.*
