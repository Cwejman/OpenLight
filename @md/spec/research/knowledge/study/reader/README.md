---
under: the code
kind: brief
---

# The reader

A body of knowledge under the code is a holarchy: wholes that are also parts, the biggest understanding first and the detail beneath it. A file tree cannot show that, and a total cannot either, since thirty-three thousand tokens is neither large nor small until you know where the words sit. This program serves such a body as what it is, so that a reader descends it by understanding rather than by scrolling, and can see at a glance what stopping at each level would cost.

Built 2026-09-11 in one sitting, and not yet good to use.

## 1. What a room is

A **room** is a holon: a folder, a file, or a section inside one, each a whole that can be read alone and a part of the whole above it. A folder's own prose is its entry file; a file's own prose is its title and preface; a section's is whatever stands before its first subheading. What a room **owns** is that prose. What it **totals** is that plus everything in the rooms beneath it. Every weight in this program is one of those two numbers, counted as tokens, which here means bytes over four, the same approximation the labs' records use. *Reasoned; the approximation is stated because every figure in the program rests on it.*

So the filesystem's divisions and a document's own nesting are one structure, and a descent can pass from a folder to a file to a section without changing kind. The program says which boundary it crossed rather than flattening them.

## 2. What it does with a room

It lays the descent from left to right, a **spread** for each level, so entering a room does not replace the room you came from. It draws the whole from several distances at once, weighted by the text in each part. And it gives one room one identity, so that pointing at it anywhere lights it everywhere.

Those three are a brief each, and they are the program as it stands: [how it reads](reads.md), [how it maps](maps.md), [how it marks](marks.md).

## 3. Where it is going

It is far from what was asked of it, and the distance is written down rather than remembered. [The path forward](forward.md) sets every direction against what stands, in the order the work should take, and opens with the verdict that matters most, that the thing is hard to use. It stands on [what was asked](../asked-2026-09-11.md), the record of the day this was built. Its last step is [publishing a repository as itself](publication.md), which is gated and not begun.

[The making](making.md) keeps the record of how this and [the surface](../surface/README.md) were built, since they were one evening's work and one effort.

## 4. Running it

```
python3 reader.py <path> [port]
```

The path is the root and the program will not read above it: a repository, a folder inside one, a single file. It serves on `http://127.0.0.1:8766` by default and re-reads every few seconds, so editing a file changes the page.

A sitting is knowledge too. [`transcript.py`](transcript.py) turns a harness session into substrate, either a brief per turn or one record of the asks, so what was said hours ago stays addressable instead of surviving in scrollback.

```
python3 transcript.py <session.jsonl> <out dir>                      a brief per turn
python3 transcript.py <session.jsonl> <record.md> --asks             the record, refreshed
```

The record is refreshed rather than rewritten: entries already corrected by hand are kept as they are, so a later pass never undoes an earlier one.
