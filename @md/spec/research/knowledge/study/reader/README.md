# The reader

A page that serves a substrate as what it is: a holarchy of prose, navigable by its shape and weighed by its text. It knows nothing of harnesses, sessions or logs; give it a path and it reads markdown files in folders as [the practice](../10-comprehension/poc.md) defines them. Built 2026-09-11, a first cut; how it came to be is in [the making](making.md).

## 1. What it answers

A total tells a reader nothing. Thirty-five thousand tokens is neither large nor small until you know where the words sit, so the reader weighs every holon by its own prose and by everything beneath it, and gauges what stopping at each level costs. That gauge is the code's promise made checkable: if the biggest understanding really does come first, the top level is short and each level below it is heavier.

The map is the navigation, as a minimap is in an editor. Each arc is a holon and its angle is the text beneath it, so the shape shows where the substance is before a word is read; the darker inner band of each arc is that holon's own prose against what it holds. Clicking descends, the trail back sits above the title, and the prose of wherever you stand is the page itself.

The third view is the whole as the text it is. Every brief in the tree is drawn as the lines it actually occupies, indented by its depth and marked where a paragraph runs past five hundred characters, so the shape of the writing is visible before any of it is read: where it is light, where it thickens, and which briefs a reader will struggle through. This is the judgment the studies have failed most often, and it is a feel rather than a number, so it wants a picture and not a rule.

## 2. Running it

```
python3 reader.py <path> [port]
```

The path is the root, capped there: a repository, a folder inside one, a single file. It serves on `http://127.0.0.1:8766` by default and re-reads every few seconds, so editing a file changes the page. Sizes are tokens counted as bytes over four, the same method the labs' records use.

## 3. How it reads a holarchy

A folder is a holon whose brief is its entry file, and whose parts are the entry's own sections followed by the files and folders beside it. A file is a holon whose own prose is its title and preface, and whose parts are its sections. A section is a holon the same way, down to the last heading. What a holon owns is the prose before its first part; what it totals is that plus everything beneath.

## 4. Where the server goes

The reader runs a small server, and it should not. The server does two things, walk a directory and read markdown into a holarchy, and both belong in the page: then one parser serves every source, and the page is the whole program.

The direction, held 2026-09-11 and not yet built. The page takes its tree from whichever source it is given. Locally, a directory the reader grants it, read live through the browser's own file access, with no service at all. Published, a single manifest beside the page, or the repository read over its host's interface. The parsing is the same in each case, so the two are one program and not two.

What survives of the server is at most a few lines that emit the manifest at publish time, and that is the whole of the gain being weighed: taking on a build step is worth it only because it removes a service, not because it adds a pipeline. Anything more would be running ahead of what is known.

## 5. What is owed next

The raw, in the page. A brief should be openable as the markdown it actually is, expanding in place and staying in step with the reading, so a reader can see the text as written without leaving where they stand. It is divided from the prose around it by rhythm alone, like everything else here, and takes a surface of its own only where the pointer asks for one.

## 6. Open

It runs a small server because a page cannot read a folder on its own. What it should do instead is read the substrate from the browser: the file system through the client's own access where that is granted, or the git repository directly, so the same page serves a live local substrate and a published read-only one with no service in the middle. That is what would make it web-native and substrate-native at once, and it is the direction, not the state.

Also open: how a link between holons is drawn rather than only followed; whether the map should show change as [the surface](../surface/README.md) does; and whether a reader may write here, not only read.
