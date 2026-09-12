---
under: the code
kind: brief
---

# The reader

A body of knowledge under the code is a holarchy: wholes that are also parts, the biggest understanding first and the detail beneath it. A file tree cannot show that, and a total cannot either, since a number of tokens is neither large nor small until you know where the words sit.

This program serves such a body as what it is, so that a reader descends it by understanding rather than by opening files, and can see at a glance what stopping at each level would cost.

It does that, and it is not yet usable. The author's verdict at the close of the evening that built it was that scrolling and overall usability are critically low, and the next work goes there before anything is added to it. *Reasoned, the author's, unmeasured; the whole of it is in [the path forward](forward.md#1-use-before-anything-more).*

It was built 2026-09-11 in one sitting, against [the piece lab ten wrote](../10-comprehension/output/README.md), which is the body every figure and every measurement here refers to.

## 1. What a room is

A **room** is a holon: a folder, a file, or a section inside one, each a whole that can be read alone and a part of the whole above it. A folder's own prose is its entry file; a file's own prose is its title and preface; a section's is whatever stands before its first subheading.

What a room **owns** is that prose. What it **totals** is that plus everything in the rooms beneath it. Every weight in this program is one of those two numbers, counted in **tokens**, which here means bytes over four. *Reasoned; it is an approximation, stated because every figure rests on it, and it is the one the labs' own records use.*

So the filesystem's divisions and a document's own nesting are one structure, and a descent can pass from a folder to a file to a section without changing kind. The program says which boundary it crossed rather than flattening them. *Seen.*

## 2. What is not a room

A repository holds much that is not knowledge. A file declares itself at its head: whether it is under the code, and of what kind. This program obeys that. A record's parts are shown as the entries it declares, in the order it declares them, rather than as rooms to descend by importance, because reading a sequence by the gradient reads it wrongly. What the stamp is finally for is in [the path forward](forward.md#7-the-medium-beyond-the-page), and its form belongs to [the practice](../../poc.md) and is open. *Seen.*

## 3. What it does with a room

It lays a descent from left to right, a column for each level, so entering a room does not replace the room you came from. It draws the whole from several distances at once, weighted. And it gives one room one identity, so that pointing at it anywhere lights it everywhere. Those are a brief each: [how it reads](reads.md), [how it maps](maps.md), [how it marks](marks.md).

A room's **texture**, used by all three, is the lengths of its own paragraphs drawn as bars: how heavy it looks before a word of it is read. *Seen.*

## 4. Where it is going

The distance between what was asked of this and what stands is written down rather than remembered. [The path forward](forward.md) sets every direction against the program, in the order the work should take, and it is the only home for what is owed: a standing brief says what a thing does, and the plan says what it should do instead. It stands on [what was asked](../asked-2026-09-11.md), the record of the day this was built, and its last step is publishing a repository as itself, which is gated and not begun.

[The making](making.md) keeps the record of how this and [the surface](../surface/README.md) were built, since they were one evening's work and one effort. *Seen.*

## 5. Running it

```
python3 reader.py <path> [port]
```

The path is the root and the program will not read above it: a repository, a folder inside one, a single file. It serves on `http://127.0.0.1:8766` by default and re-reads every few seconds, so editing a file changes the page.

Beside it lives a second program of a few lines, [`transcript.py`](transcript.py), which turns a harness session into substrate this one can serve, either a brief per turn or one record of the asks. The record is refreshed rather than rewritten: entries already corrected by hand are kept, so a later pass never undoes an earlier one. It has no brief of its own because it does one thing and this is all of it.

```
python3 transcript.py <session.jsonl> <out dir>             a brief per turn
python3 transcript.py <session.jsonl> <record.md> --asks    the record, refreshed
```
