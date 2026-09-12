---
under: the code
kind: brief
status: in force
---

# The reader

A body of knowledge under the code is a holarchy: wholes that are also parts, the biggest understanding first and the detail beneath it. A file tree cannot show that, and a token total cannot either, since a number of words is neither large nor small until you know where the words sit.

This program serves such a body as what it is, so that a reader descends it by understanding rather than by opening files, and can see at a glance what stopping at each level would cost.

These briefs are its specification. They say what it is to be, in the reader's order, and each closes with how strongly its rule holds. What is built, and how far, is in [the order of work](forward.md), which is the only home for the distance between the two.

It was built in one sitting on 2026-09-11 against [the piece lab ten wrote](../10-comprehension/output/README.md), which is the body every measurement in these briefs refers to. The author's verdict at the close was that scrolling and overall usability are critically low, and that verdict outranks everything specified here.

## 1. What it is made of

[What it serves](serves.md) gives the material: a substrate rooted at a path in git, only what declares itself under the code, a record shown as the sequence it is, and the room as the one unit that folders, files and sections all resolve to.

## 2. What it does with it

Three things, and they are one experience rather than three panels.

[How it reads](reads.md) is the descent: spreads laid left to right, up to three sharing the screen, so entering a room does not replace the room you came from.

[How it gauges](gauges.md) is the answer to what stopping costs: one instrument in composing grades, the prose itself the finest of them, with estate following attention rather than fixed per figure.

[How it draws](draws.md) is the geometry: the holarchy as nodes, edges and text in one figure, each part's form taking room in proportion to what its text needs.

[How it marks](marks.md) is what binds them: one room is one identity, lit everywhere at once, carrying its weight, its heaviness, its region's hue, whether it has been read, and whether its ground moved after it did.

## 3. The design language it embodies

One ground and no panels. A widget drops onto the background rather than sitting in a box on it. Spacing, granularity and size step down recursively with depth, so a level's grain says which level it is without a border saying so.

Summoned surfaces are glass: the ground shows through them, blurred, edges dissolved, no shadow and no drawn border, so nothing meets the background with an edge. The viewport is used whole, the way a newspaper uses its page.

*Preferred, the author's, and drawn from [the design language](../../../../design.md); what is built of it is judged in [the order of work](forward.md).*

## 4. Running it

```
python3 reader.py <path> [port]
```

The path is the root and the program will not read above it. It serves on `http://127.0.0.1:8766` by default and re-reads every few seconds, so editing a file changes the page.

Beside it lives a second program of a few lines, [`transcript.py`](transcript.py), which turns a harness session into substrate this one can serve, either a brief per turn or one record of the asks. The record is refreshed rather than rewritten: entries already corrected by hand are kept, so a later pass never undoes an earlier one. It has no brief of its own because it does one thing and this is all of it.

```
python3 transcript.py <session.jsonl> <out dir>             a brief per turn
python3 transcript.py <session.jsonl> <record.md> --asks    the record, refreshed
```

## 5. How it came to be

[The making](making.md) keeps the record of how this and [the surface](../surface/README.md) were built, since they were one evening's work and one effort. [What was asked](../asked-2026-09-11.md) is the ground these briefs were derived from, in the author's own words, in the order they were said.
