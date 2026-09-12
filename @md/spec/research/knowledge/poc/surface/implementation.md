---
under: the code
kind: brief
status: in force
---

# How it is built

## 1. A page the browser manages

The surface is a single page, and everything a reader does happens in the browser: the path, the panes, the drawings, the overlay. Nothing is rendered on a server for a request.

That is what lets one page serve both moments of a repository. Live or published, the same client receives a body and draws it, and only where the body comes from differs.

*In force, the author's decision, 2026-09-12.*

## 2. The server assembles the substrate, and the client only draws

A program should receive structure, never recover it. So the part that reads files builds the body once, typed: which files carry the stamp and of what kind, the briefs and the level beneath each, the mounts, the links and what points back along them, and the two sizes of every brief. Each brief's prose goes with it already rendered.

The client carries no markdown parser and guesses at nothing. The types are declared once, and the reading side and the drawing side both stand on that one declaration, so the contract between them has a single home.

What exactly a brief carries is the model's to settle, and it is settled next.

*In force, the author's decision, 2026-09-12; that a program receives structure rather than recovering it is the project's own claim, carried here.*

## 3. Live and published differ only in where the body comes from

Live, a process runs against a path in a working tree and answers three requests. The page itself, the body as JSON, and a stream that says when a file under the path has changed, so the client asks for the body again and draws it.

Published, the same process runs once and writes the page with the body inside it, in a script tag that holds data rather than code:

```html
<script type="application/json" id="substrate">…</script>
```

The browser never runs that tag, so nothing in a brief can become code. Every `<` in the JSON is written as `\u003c`, since a brief containing the closing tag would otherwise end it early. On start the client reads the tag if it is there, and asks the process for the body if it is not.

So the pipeline's whole job is to run the build on each commit and put the one page where it is served.

*In force, the author's decision, 2026-09-12. That parsing a JSON string is faster than an equally large object literal is carried from V8's guidance and not checked here.*

## 4. One file, laid by the gradient

The server, the build, the client and the talk between them are one TypeScript file, run with Bun. A flag chooses between serving live and writing the page. This is the proof of concept, and nothing in it should grow larger than reading a body needs.

The file is composed the way a brief is. What it is and how it is run come first, then how the body is assembled, then how it is drawn, and the details beneath. Its sections carry numbered headings in comments, so it is read by depth like anything else under the code.

It stands beside its specification, as `surface.ts` in this holon.

*In force, the author's decision, 2026-09-12.*

## 5. Plain functions before a framework

The drawings and the panes start as plain functions that return SVG and HTML, written to one style so they read as a family. A framework such as Solid would render in the browser like anything else, but it needs its own compile step for its markup, and that step is exactly what one file run with Bun avoids.

Whether the functions grow into components is decided once the figures exist and have been used.

*Preferred, the author's, 2026-09-12.*

## 6. Git waits for history

Git could carry the files, and it is not used for that. A JavaScript client such as isomorphic-git speaks git's smart HTTP protocol, and three things make it the harder road here. It carries commits and not the working tree, so a live reading would lag behind a session's writing until the next commit. A static host serves no smart HTTP, and the client cannot read a `.git` folder served as plain files. And it brings a library, a filesystem in the browser, and a clone of the whole repository where the surface wants only the stamped files under one path.

Git belongs where the surface needs history rather than files: resolving a link against the state it was written in, and drawing where a reader has been. When those are taken up, the live process asking the git CLI is the likely road.

*Reasoned, 2026-09-12. The protocol and the client's limits are from [git's documentation](https://git-scm.com/docs/http-protocol) and [isomorphic-git's](https://isomorphic-git.org/docs/en/next/faq), read that day.*

## 7. What is not settled yet

The model: what a brief carries exactly, how the stamp and a file's kind are read, and how a section, a file and a folder become one kind of brief. In what unit a size is counted. How the address holds a path, and what a reader who arrives without one is shown. How the panes, the figures and the overlay are drawn. And where the published page stands beside the wiki the repository already publishes.

*Open, 2026-09-12, and taken up in that order.*
