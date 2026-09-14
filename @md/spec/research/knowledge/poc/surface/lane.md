---
under: the code
kind: brief
status: in force
---

# Reading and orientation come apart

## 1. The body in the order a document reads

The lane holds the body depth first: a brief, then the level beneath it, then the next brief of its level. It is the order a document with headings already reads, and it is the order the code lays, since [a level's briefs stand on the ones before them](../../code.md#42-the-order-of-a-holarchy) and what a brief did not need stands beneath it. The opening, the root's title and its first paragraph, stands first.

The space between briefs steps down with depth, as [the design language's rhythm](https://github.com/Cwejman/OpenLight/blob/main/@md/spec/design.md#rhythm--depth-derived-never-stated-twice) asks: what lies beneath a brief sits together, and the briefs of a level stand further apart the higher the level, so the gap before a brief says which level it begins.

*Reasoned, the author's, 2026-09-13.*

## 2. Two grades

Every brief in the lane stands at one of two grades: its face, the heading and the first paragraph, which is what [the practice](../practice.md#5-the-face-is-declared-by-position) says tells a reader whether to enter; or whole, with every paragraph shown and the level beneath it laid at faces, unless the reader has already folded or opened there.

A brief never folds past its face, so nothing in the lane is ever a bare name, and folding is one act with one inverse.

Org-mode has cycled a heading between folded, children and whole for twenty years, so folding at a heading is a gesture readers already hold. The face is what it lacks, and it is the code's own unit; the bare heading is what this model leaves out.

*Reasoned, the author's, 2026-09-13; the org-mode ground is from memory and not checked. [A third grade, the heading alone](refused.md#17-folding-to-the-heading-alone), was built and refused the same day.*

## 3. One step ahead

A brief at its face shows nothing of its level in the lane; what lies beneath it is drawn in [the wings](framework.md#2-the-areas) instead. So the lane always reveals one step ahead of what is being read and no more: nothing beneath is out of reach, and nothing is forced on the reader.

*Reasoned, the author's, 2026-09-13.*

## 4. Where you are is the brief in focus

The focus is the brief under the reading line, a line across the viewport where the reading is taken to be, and it moves as the lane scrolls. So a reader who only scrolls never needs the pointer: the brief on the reading line is the one highlighted, in the lane and in [every widget](widgets.md), and it is what every act on the lane acts on.

Its address is the page's address, so the place a reader stands can be handed to someone.

*Reasoned, the author's, 2026-09-13.*

### 4.1 Where the reading line stands

Where the line stands is a setting with two values, the middle or easing to the ends, since a reader who opens a body wants its first prose at the top of the screen, and a reader deep in one wants the line in the middle. At the middle, it stays at the middle of the viewport, with half a screen of room above the first brief and below the last so both can reach it.

Easing to the ends, which is where a reader starts, it stands on the opening at the top of the lane, the opening's heading level with the first row of [the shape](widgets.md#3-the-shape), so the first prose starts at the top of the screen and not halfway down. A third of a screen of scrolling eases it to the middle. The same holds at the foot, where it eases down onto the last brief and the last block stands level with the shape's last row, so the shape stands balanced at both ends.

*Reasoned, the author's asks of 2026-09-14: the line starting on the opening, the foot made to match, and the middle kept as a setting.*

### 4.2 The wheel scrolls the lane from anywhere

The wheel scrolls the lane wherever the pointer rests, over a wing or a gutter as over the text, so the reader never has to aim at the prose to read on. Only [a meter](widgets.md#61-the-meters) takes the wheel for itself.

*Reasoned, the author's, 2026-09-13.*

### 4.3 Pointing overrides the focus

While the pointer rests on a brief, in the lane or in a widget, that brief takes the highlight instead of the focus, and every widget answers for it.

In the lane a brief reaches down to the next, so the highlight moves from brief to brief and never drops into a gap between them. Pointing at a link inside the brief being read lights the link's target wherever it is drawn and never dims the brief the link sits in.

The moment the lane scrolls, the highlight swings back to the reading line and what the pointer rested on is let go. After a scroll a pointer takes nothing back until it has travelled a little, since the browser reports a move of its own when the scroll comes to rest; at any other time every move counts, so the highlight never lags behind the pointer.

*Reasoned, the author's, 2026-09-13; the still pointer after a scroll, 2026-09-14.*

### 4.4 One step dimmer

The brief highlighted stands at full ink and every other brief stands one step dimmer, so the reader sees what a fold will act on. The step is the dim setting.

*Reasoned, the author's, 2026-09-13; [a fade by distance from the focus](refused.md#16-a-fade-by-distance-from-the-focus) was built first and refused.*

### 4.5 A fade at the edges

The prose fades out a little in from the top and the bottom of the viewport, over a short run, so [the strip](framework.md#3-the-strip) at the foot never reads as an edge of the text. The fade at the top comes in with the reading line, since nothing stands above the opening to fade. The run is the fade setting, kept apart from the dim since the author turned one expecting the other.

*Reasoned, the author's, 2026-09-13; the edge fade was shortened and moved in on the author's second reading.*

## 5. Arriving lays the lane

Going to an address, by a press, by a link or by the browser's history, lays the lane afresh: the ancestors of the address whole, their siblings at faces, the address and its siblings whole, and the level beneath the address at faces. Then the lane scrolls to the address. Above the focus, then, lies what was taken whole and what was passed at its face, so the way up is short.

Scrolling afterwards moves the focus and changes no grade, so nothing reflows under a reader who is only reading. The page's address follows the focus without entering the history, and the history holds only the moves a reader chose: arrivals, goings from the tree or a figure, and changes of [scope](#7-scoping-the-lane). The browser's back and forward walk them.

*Reasoned, the author's, 2026-09-13.*

### 5.1 Going from a figure is not an arrival

Going to a brief from [the tree](widgets.md#2-the-tree) or another [figure](framework.md#1-two-kinds-of-widget) keeps every fold the reader has made, opens only what stands between, so the target stands in the lane, and scrolls there. A link, a sent address and the browser's history lay afresh, since they come from outside what the reader has laid.

A reload of the place the reader stood is not an arrival either. The lane as laid, its scope and every fold, is kept in the browser's storage as it changes, and a reload at the same address lays it again as it was left.

*Reasoned, the author's, 2026-09-13; the reload, 2026-09-14.*

### 5.2 Escape is an undo

Every change a reader makes to the lane, a fold or an opening, a change of scope, a going or an arrival, is recorded as the lane stood before it: its scope, every fold, the focus and the scroll. Escape lays the lane back as it was, exactly where the reader stood, and shift with escape makes the change again.

Scrolling alone is not a change, and a new change clears what was undone.

*Reasoned, the author's ask of 2026-09-14, after a step back through the history had not returned a reader from holding the space bar.*

## 6. Folding and opening

Folding takes a brief to its face and opening takes it whole, [the two grades](#2-two-grades), and a line the brief carries is what a reader presses to do either: beneath the face of a folded brief, where the reader is already looking, or at the foot of a whole one, where the reading ends.

*Reasoned, the author's, 2026-09-13; pressing the face is the author's lean, and the best gesture is not yet known.*

### 6.1 The action line is the press

A folded brief carries a line beneath its face that says open, with a small bar for every paragraph it hides, a small frame for every image, and a count of the briefs beneath it. A whole brief carries a line at its foot that says fold. What a press would give is known before it is pressed.

The line is the press, and nothing else in the brief is: the text stays text, no mark stands beside the heading, and nothing tints under the pointer. A brief that hides nothing, one paragraph after its heading and no level, carries no line, and no key acts on it either, so nothing about it can ever change under the reader.

*Reasoned, the author's, 2026-09-13; [a mark beside the heading](refused.md#18-a-fold-mark-beside-the-heading) and [a tinted face](refused.md#20-a-tinted-surface-as-the-fold) were built first and refused.*

### 6.2 The same act wherever the brief is drawn

The tree is the lane's own outline, so folding a row there is folding the brief in the lane, one state and never two, and there the folder's triangle does it, since that is what a tree reader expects.

In [the plate](widgets.md#7-the-plate), a press goes to the brief and a press with the modifier key held folds or opens it in place. In the shape, the room to the right of a brief's blocks folds or opens it, [as the shape says](widgets.md#34-two-presses-read-from-where-they-land), and no modifier is needed.

*Reasoned, the author's, 2026-09-13.*

### 6.3 The keys

The space bar folds or opens the brief in focus, and with shift held it folds the brief above, the parent of the focus, which takes the reader up to it. It acts when it is let go, so it can also be held: held a moment, it opens every brief in the scope, and with shift folds every brief in the scope to its face, and letting it go then does nothing more.

The arrow keys move the focus and fold nothing: up and down to the brief before and after in the lane, left to the parent, right into the first brief beneath when it stands in the lane. Enter and shift with enter [scope the lane](#7-scoping-the-lane).

*Reasoned, the author's, 2026-09-13; the space bar acting on release and opening the scope when held, 2026-09-14.*

### 6.4 The heading acted on keeps its place

Whatever changes, the heading of the brief acted on keeps its place on the screen, so a press never moves what was pressed and the reader's place never scrolls away. Opening never scrolls, and folding a brief the reader is not inside never scrolls either.

The one exception is a fold that takes away what stood under the reader: a long brief folded from inside it takes the reader up with it, its heading returning to the reading line. And when the brief in focus leaves the lane, because the brief above it was folded, the focus moves to that brief.

*Reasoned, the author's, 2026-09-13.*

### 6.5 The flick, a trial

A small reversal of the scroll, down then up then down within a moment, folds or opens the brief in focus. The fold it makes is a change like any other, though the scrolling is not. It costs nothing to a reader who never does it, and whether it fires by accident is what the trial measures. It is on by a setting.

*A trial, 2026-09-13.*

## 7. Scoping the lane

A reader can make any brief the root of the lane: its heading becomes the opening, its holon becomes the whole, and everything above it leaves the lane. Enter does it to the brief in focus, when that brief has a level beneath it, and the address carries the scope after the focus, so a scoped place can be handed to someone like any other.

*Reasoned, the author's, 2026-09-13; the address form is the builder's call.*

### 7.1 Scoping does what heading sizes can only do so far

The registers, the heading sizes that step down by depth as [the design language's rhythm](https://github.com/Cwejman/OpenLight/blob/main/@md/spec/design.md#rhythm--depth-derived-never-stated-twice) asks, count from the scope root, so the level a reader has scoped into reads at the top register again, and nesting beneath it has the full range to step down through. Without scoping, a deep level reads in the smallest registers whatever it holds.

*Reasoned, the author's, 2026-09-13.*

### 7.2 Widening the scope

Shift with enter widens the scope by one level, to the parent of the scope root. Going to a brief outside the scope, by a link or a row above, widens the scope to the whole body first. Every change of scope is a change [escape undoes](#52-escape-is-an-undo), so a reader who scoped in three times can leave the way they came.

*Reasoned, 2026-09-13; what going outside the scope does is the builder's call.*

### 7.3 The levels above stay in sight

The levels above the scope stay visible in the figures, as the levels beneath a fold are: the shape draws them as [grey ticks](widgets.md#32-the-levels-above-the-scope) to the left of the opening's row, and the tree as dim rows above the root, each a press that scopes out to it. Over the lane itself they stand as the way down, beneath.

*Reasoned, the author's, 2026-09-13.*

### 7.4 The way down stands over the lane

The way down, the run of levels from the root to the scope, stands over the lane, level with the prose's left edge.

The levels above stand as faint names, each a press that scopes out to it, the scope root a step darker, and a small chevron between, each name lit in its branch's colour when pointed at. The prose is always clear beneath it, whatever the fade at the top is doing, and a wing's figures begin below it too.

*Reasoned, the author's, 2026-09-14.*

## 8. A record is ordered by time

The lane lays a level as a reading: the brief that gives the most understanding comes first, and each after it stands on those before. A record is not laid that way. Its order is when each entry happened, run either way, and an entry's place says nothing more than when.

[The practice's stamp](../practice.md#21-the-stamp-says-the-kind) says which of the two a file is. A level from a record says so above its entries and never implies that the order ranks anything.

*Reasoned, carried from the practice and not checked here.*

## 9. Following a link moves you

A link's target lies at a path of its own, so following it [lays the lane afresh](#5-arriving-lays-the-lane) at that address, and the way back is the browser's history or escape. That is a way back and not a good one, and it asks a reader to press before knowing where they will land.

What answers that is the gutter: a link's target is told beside the link, [in the links](widgets.md#5-links), so it is read about before it is taken.

*Reasoned, carried from the first model, 2026-09-13.*

## 10. Where only the lane fits

On a narrow screen the sides give way, [the gutters first, then the right wing, then the left](framework.md#25-giving-way), and the lane stands alone, which it can, since orientation is help and never the reading. A reader may also close any area by hand, and a closed area [takes no room](framework.md#24-closing-by-hand), so the lane stands centred in what is left.

*Reasoned, the author's, 2026-09-13; nothing about a touch reading is taken up, and that is open.*
