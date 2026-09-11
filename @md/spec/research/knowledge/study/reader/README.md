# The reader

A page that serves a substrate as what it is: a holarchy of prose, navigable by its shape and weighed by its text. It knows nothing of harnesses, sessions or logs; give it a path and it reads markdown files in folders as [the practice](../10-comprehension/poc.md) defines them. Built 2026-09-11, a first cut.

## 1. What it answers

A total tells a reader nothing. Thirty-five thousand tokens is neither large nor small until you know where the words sit, so the reader weighs every holon by its own prose and by everything beneath it, and gauges what stopping at each level costs. That gauge is the code's promise made checkable: if the biggest understanding really does come first, the top level is short and each level below it is heavier.

The map is the navigation, as a minimap is in an editor. Each arc is a holon and its angle is the text beneath it, so the shape shows where the substance is before a word is read; the darker inner band of each arc is that holon's own prose against what it holds. Clicking descends, the trail back sits above the title, and the prose of wherever you stand is the page itself.

## 2. Running it

```
python3 reader.py <path> [port]
```

The path is the root, capped there: a repository, a folder inside one, a single file. It serves on `http://127.0.0.1:8766` by default and re-reads every few seconds, so editing a file changes the page. Sizes are tokens counted as bytes over four, the same method the labs' records use.

## 3. How it reads a holarchy

A folder is a holon whose brief is its entry file, and whose parts are the entry's own sections followed by the files and folders beside it. A file is a holon whose own prose is its title and preface, and whose parts are its sections. A section is a holon the same way, down to the last heading. What a holon owns is the prose before its first part; what it totals is that plus everything beneath.

## 4. Open

It runs a small server because a page cannot read a folder on its own. What it should do instead is read the substrate from the browser: the file system through the client's own access where that is granted, or the git repository directly, so the same page serves a live local substrate and a published read-only one with no service in the middle. That is what would make it web-native and substrate-native at once, and it is the direction, not the state.

Also open: how a link between holons is drawn rather than only followed; whether the map should show change as [the surface](../surface/README.md) does; and whether a reader may write here, not only read.
