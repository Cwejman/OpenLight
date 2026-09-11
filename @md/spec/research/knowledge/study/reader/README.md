# The reader

A page that serves a substrate as what it is: prose in a holarchy, read by moving through it rather than by scrolling a file. Give it a path and it reads markdown files in folders as [the practice](../10-comprehension/poc.md) defines them, weighs every room by the text in it, and lets a reader descend without losing where they came from. Built 2026-09-11 in one sitting.

It answers a question a file tree cannot. A total tells a reader nothing: thirty-three thousand tokens is neither large nor small until you know where the words sit and what stopping at each level would cost. So everything here is weighed, and every view of the whole is the same whole seen at a different distance.

- [How it reads](reads.md) — the spreads, the doors, the room ahead, and the one scroll that moves them.

- [How it maps](maps.md) — the descent, the figure, the division, the files, the gauge, and the strip along the page.

- [How it marks](marks.md) — one brief as one object across every view, what has been read, and the hue of a region.

- [Publishing a repository as itself](publication.md) — the end this is built toward, and what has to be true first.

- [The path forward](forward.md) — what was asked set against what stands, in the order the work should take it, standing on [the asks](asked.md) as they were made.

- [The making](making.md) — how it came to be, move by move, and what that taught.

## 1. Running it

```
python3 reader.py <path> [port]
```

The path is the root, capped there: a repository, a folder inside one, a single file. It serves on `http://127.0.0.1:8766` by default and re-reads every few seconds, so editing a file changes the page. Sizes are tokens counted as bytes over four, the same method the labs' records use.

A sitting is knowledge too. [`transcript.py`](transcript.py) turns a harness session into a folder this reader opens, every turn a brief in the words it was asked in, so an ask made hours ago stays addressable instead of surviving in scrollback.

```
python3 transcript.py <session.jsonl> <out dir>
```

## 2. How it reads a holarchy

A folder is a holon whose brief is its entry file, and whose parts are that entry's own sections followed by the files and folders beside it. A file is a holon whose own prose is its title and preface, and whose parts are its sections. A section is a holon the same way, down to the last heading. What a holon owns is the prose before its first part; what it totals is that plus everything beneath. So the filesystem's divisions and a document's own nesting are one structure, and the reader says which is which rather than flattening them.
