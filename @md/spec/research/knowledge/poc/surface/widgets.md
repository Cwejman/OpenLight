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

The tree is a wing widget: the lane as an outline, one row per brief in the lane, each nested under its parent, open where the brief is whole. It is not a second state: folding a row folds the brief in the lane and opening one opens it, so what the tree shows is exactly what the lane holds, and a reader folds a whole region from the tree without scrolling to it. The name goes.

When the lane is scoped, the levels above stand as dim rows over the root, each a way out. A line lies across the highlighted row, the focus or the brief under the pointer, and glides as it moves. The wing scrolls only to keep the focus in view, driven by the lane and never free.

*Reasoned, the author's, 2026-09-13. Built first as columns of siblings stacked one level under the next, which the author found strange, since a brief's children stood at the bottom rather than beneath it; then as a tree with an opening of its own, which the author found strange again, since opening there and opening in the text should be one thing.*

## 3. The ahead

The ahead is the right wing's first widget: what the highlighted brief hides. It answers for the focus, or for the brief under the pointer, whenever that brief is folded and hides something, paragraphs beyond its face or a level beneath, and it draws nothing at all when the brief is whole, since then the reader can simply read on. So it is empty while a whole brief is read, and appears when the reader rests on something folded, without the pointer, by scrolling alone.

It draws in the shape's own form, so a reader learns one figure and not two: first the brief itself with the paragraphs its face hides, then everything beneath it, each brief a heading bar and its paragraphs as blocks sized from their text, shifted right by nesting. So opening a brief that is only more paragraphs is understood as exactly that, before it is pressed. No names in the cells; the cell under the pointer is named beneath the figure. It is only as large as what it draws needs, it keeps clear of the strip, and it keeps its root while the pointer moves within it. Pressing a cell goes there, which opens it.

Where what it draws is too large for its paragraphs to stay legible it steps down a ladder that never loses the structure: one block per brief, its own size, with every brief still in place; and where that still does not fit, the deepest level is dropped and the brief that held it carries a grey tail as long as the dropped level is heavy, as the shape marks a fold, until what is left fits. The caption says which step it stands on.

*Reasoned, the author's, 2026-09-13. Built first as columns of cells by depth, an icicle, with names in the cells and at the wing's full size; the author narrowed it to what is not in view, took the names out, then asked for the shape's form; a step that merged a whole level into one block was found incomprehensible and replaced by dropping depth with a tail.*

## 4. Links

Links is the right gutter's first widget. Beside each link in a brief, on the link's own line, it tells the target: its title and the opening words of its face, or that it leads out of the body, or that the brief is not yet written. At the brief's foot it tells what points at the brief. Pointing at any of them lights the target wherever it is drawn, and pressing goes.

This is what lets looking be free without an overlay. Everything an overlay told about a link now stands beside the link, and everything it told about a brief stands in the lane or in the wings.

*Reasoned, the author's, 2026-09-13.*

## 5. Settings

Settings is a wing widget: a row of meters, each a 270 degree arc with its icon in the middle, the name and value told on pointing. Dragging a meter up or down turns it and the wheel steps it, and the page redraws as it turns, so the zoom, the heading ratio, the measure, the gap, the dim and the edge fade are set by eye against real prose. A drag turns a meter in place and never redraws the wing under the pointer. The flick is a switch in the same row.

*Reasoned, the author's, 2026-09-13; the meter replaced a dial the author found ugly the same day.*

## 6. The shape

The shape is the left wing's first widget: the lane as laid, drawn small. Each brief in the lane stands as its blocks, a heading a short bar and a paragraph a block as tall as it is drawn, shifted right by the brief's depth, so the reader sees the shape of the prose and the nesting it stands in at once, and fold state shows as length. Every block a brief has is drawn, a list or a table as readily as a paragraph. A folded brief tells beside its face what it hides: a grey tick for every paragraph, then, where a level lies beneath, a grey tail as long as that level is heavy, so a reader sees at a glance where the lane is folded, whether paragraphs or levels wait there, and how much. When the lane is scoped, the levels above the scope stand to the left of the opening's row, a grey tick per ancestor, outermost leftmost, and each is a press that scopes out to that level, as the ticks to the right are what a fold hides. The viewport is drawn over it, and dragging it scrubs the lane. A brief has two presses: its blocks go to it, and the room to their right, where its ticks and tail stand when it is folded and nothing stands when it is open, folds or opens it, so what a press does is read from where it lands and no modifier is needed. The room to the right is forgiving, since a brief may be a sliver here, and it answers the pointer: over a folded brief its ticks and tail light, and over an open one they show as a grey ghost of what a fold would hide.

*Reasoned, the author's, 2026-09-13, from the wish for a minimap that moves the briefs and their paragraphs right and left by where they stand in the nesting.*

## 7. The plate

The plate is a wing widget: the body whole in one square, drawn as droplets on a round plate. The root sits at the centre, its briefs are droplets around it, and each carries its own smaller droplets further out, level by level to the rim. Droplets meet without merging and are cut where they meet, sharing the plate by what each holds, and a droplet stays compact however small it gets, where a rectangle's cells degenerate. Pressing a droplet goes there, and pressing with the modifier held folds or opens it in place. Every level draws to the rim, however small its droplets, since the plate is for the whole topology and a level left undrawn defeats it: the floor that the other figures keep does not apply here, and a crowded level goes to slivers rather than away. The path and the focus are marked on it as everywhere, and what is folded out of the lane is grey at every depth.

*Reasoned, the author's, 2026-09-12, carried; the floor was dropped at the author's ask 2026-09-13, after a plate that stopped two rings out.*
