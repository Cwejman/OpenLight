---
under: the code
kind: brief
status: in force
---

# The widgets

## 1. What every widget keeps

Every shape is computed from the substrate and none is invented, because a picture a reader cannot trust is worse than no picture at all.

Nothing is drawn too small to read. Every figure has a floor, the smallest cell a pointer can hit and an eye can place, and rather than shrink through it a figure shows less: it merges what it cannot draw into one cell and marks that the cell holds more. That is the gradient turned on a picture, and it is [the design language's rhythm floor](../../../../design.md#rhythm--depth-derived-never-stated-twice) met in a figure instead of in a layout.

No figure mixes its two sizes. A brief's own prose is what stopping to read it costs; that prose with everything beneath it is what the branch holds. A row shows at most the first, and a figure of branches shows the second.

One brief is lit wherever it is drawn, since every widget draws the same material from the same counts. Where a figure has merged past the brief being pointed at, the cell holding it is lit instead.

No widget repeats what is in view, and ink limits it: a mark is spent in proportion to how live the fact behind it is, which is [the design language's measure](../../../../design.md#the-graduated-scale--one-mark-per-live-fact). Colour says only where in the body a thing sits, by the branch it stands under.

*Reasoned, 2026-09-13, carried whole from the first model's figures.*

## 2. The tree

The tree is a wing widget: the body as a file tree, one row per brief, each nested under its parent, opened along the path on arrival and further as the reader opens it. Opening in the tree is the tree's own state and never the lane's grade, so a reader looks down a branch without laying anything in the lane. The name goes; the mark beside it opens or closes the node.

A line lies across the row of the focus and glides as the focus moves, and the row of the focus is always revealed. The wing scrolls only to keep that line in view, driven by the lane and never free.

*Reasoned, the author's, 2026-09-13. Built first as columns of siblings stacked one level under the next, which the author found strange, since a brief's children stood at the bottom rather than beneath it; the nesting replaced it the same day.*

## 3. The ahead

The ahead is the right wing's first widget: what lies beneath and is not in the lane. It answers for the brief under the pointer when that brief's level is out of view, and otherwise for the focus, and it draws nothing at all when the level beneath is already in the lane, since then the reader can simply read on. So it is empty while a whole brief is read, and appears when the reader rests on something folded.

It draws that brief's subtree as columns left to right, one per depth, each brief a cell as tall as its branch is heavy, its name inside when there is room, and only as large as the subtree needs, centred in the wing. Pressing a cell goes there, which opens it.

It is the rectangle [the refused level](refused.md#6-a-rectangle-dividing-into-rectangles) turned down, told apart: a treemap divides in two dimensions and slivers, where here one dimension is fixed and only the height divides. Where a level's cells would fall below the floor they merge into one cell marked that it holds more.

*Reasoned, the author's, 2026-09-13. Built first as the whole subtree of the focus at the wing's full size, which showed what the reader was already in; the author's correction narrowed it to what is not in view.*

## 4. Links

Links is the right gutter's first widget. Beside each link in a brief, on the link's own line, it tells the target: its title and the opening words of its face, or that it leads out of the body, or that the brief is not yet written. At the brief's foot it tells what points at the brief. Pointing at any of them lights the target wherever it is drawn, and pressing goes.

This is what lets looking be free without an overlay. Everything an overlay told about a link now stands beside the link, and everything it told about a brief stands in the lane or in the wings.

*Reasoned, the author's, 2026-09-13.*

## 5. Settings

Settings is a wing widget: a row of meters, each a 270 degree arc with its icon in the middle, the name and value told on pointing. Dragging a meter up or down turns it and the wheel steps it, and the page redraws as it turns, so the zoom, the heading ratio, the measure, the gap and the fade are set by eye against real prose. The flick is a switch in the same row.

*Reasoned, the author's, 2026-09-13; the meter replaced a dial the author found ugly the same day.*

## 6. The shape

The shape is the left wing's first widget: the lane as laid, drawn small. Each brief in the lane stands as its blocks, a heading a short bar and a paragraph a block as tall as it is drawn, shifted right by the brief's depth, so the reader sees the shape of the prose and the nesting it stands in at once, and fold state shows as length. The viewport is drawn over it; dragging it scrubs the lane, and pressing a brief goes.

*Reasoned, the author's, 2026-09-13, from the wish for a minimap that moves the briefs and their paragraphs right and left by where they stand in the nesting.*

## 7. The plate

The plate is a wing widget: the body whole, drawn as droplets on a round plate. The root sits at the centre, its briefs are droplets around it, and each carries its own smaller droplets further out, level by level to the rim. Droplets meet without merging and are cut where they meet, sharing the plate by what each holds, and a droplet stays compact however small it gets, where a rectangle's cells degenerate. The figure lives or dies on how far out it can go before a droplet is too small to hit, and that has not been measured.

*Reasoned, the author's, 2026-09-12, carried; the measurement is owed.*
