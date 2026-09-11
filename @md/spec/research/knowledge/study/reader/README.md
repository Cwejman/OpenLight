---
under: the code
kind: brief
---

# The reader

A body of knowledge under the code is a holarchy: wholes that are also parts, the biggest understanding first and the detail beneath it. A file tree cannot show that, and a total cannot either, since a number of tokens is neither large nor small until you know where the words sit. This program serves such a body as what it is, so that a reader descends it by understanding rather than by opening files, and can see at a glance what stopping at each level would cost. *Reasoned; that is what it is for, and [the path forward](forward.md#1-use-before-anything-more) says it is not yet good at it.*

Built 2026-09-11 in one sitting, against [the piece lab ten wrote](../10-comprehension/output/README.md), which is the body every figure and every measurement in this room refers to.

## 1. What a room is

A **room** is a holon: a folder, a file, or a section inside one, each a whole that can be read alone and a part of the whole above it. A folder's own prose is its entry file; a file's own prose is its title and preface; a section's is whatever stands before its first subheading.

What a room **owns** is that prose. What it **totals** is that plus everything in the rooms beneath it. Every weight in this program is one of those two numbers.

So the filesystem's divisions and a document's own nesting are one structure, and a descent can pass from a folder to a file to a section without changing kind. The program says which boundary it crossed rather than flattening them.

## 2. The words its figures use

A weight is counted in **tokens**, which here means bytes over four. *Reasoned; it is an approximation, stated here because every figure in the program rests on it, and it is the one the labs' own records use.*

A room's **texture** is the lengths of its own paragraphs, drawn as bars. It is how heavy a room looks before a word of it is read.

A **region** is one of the branches directly beneath the root, and each is given a **hue**. Hue says which region a room belongs to; depth is shown by shade. Six hues are assigned in fixed order and never cycled; a seventh region takes no hue rather than repeating one. *Measured by a palette validator, which passed them on lightness, chroma, contrast and colour-blind separation in both themes, with one pair in the band that is legal only where something else also distinguishes them, which here is the name and weight written into every arc and region. Not seen by any colour-blind reader.*

## 3. What it does with a room

It lays a descent from left to right, a column for each level, so entering a room does not replace the room you came from. It draws the whole from several distances at once, weighted. And it gives one room one identity, so that pointing at it anywhere lights it everywhere. Those are a brief each: [how it reads](reads.md), [how it maps](maps.md), [how it marks](marks.md).

## 4. Where it is going

It is far from what was asked of it, and the distance is written down rather than remembered. [The path forward](forward.md) sets every direction against what stands, in the order the work should take, and opens with the verdict that matters most, that the thing is hard to use. It stands on [what was asked](../asked-2026-09-11.md), the record of the day this was built, and its last step is publishing a repository as itself, which is gated and not begun.

[The making](making.md) keeps the record of how this and [the surface](../surface/README.md) were built, since they were one evening's work and one effort.

## 5. Running it

```
python3 reader.py <path> [port]
```

The path is the root and the program will not read above it: a repository, a folder inside one, a single file. It serves on `http://127.0.0.1:8766` by default and re-reads every few seconds, so editing a file changes the page.

Beside it lives a second program of a few lines, [`transcript.py`](transcript.py), which turns a harness session into substrate this one can serve, either a brief per turn or one record of the asks. It has no brief of its own because it does one thing and this is all of it. *The record of the asks is refreshed rather than rewritten: entries already corrected by hand are kept, so a later pass never undoes an earlier one.*

```
python3 transcript.py <session.jsonl> <out dir>             a brief per turn
python3 transcript.py <session.jsonl> <record.md> --asks    the record, refreshed
```
