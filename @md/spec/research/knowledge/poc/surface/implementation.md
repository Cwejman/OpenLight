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

A program should receive structure, never recover it. So the part that reads files traces the body once and hands the page each brief already parsed and already placed. The page carries no markdown parser, resolves no paths, and guesses at nothing. What it computes, it computes from what it was given: a level from the addresses, a size from the tokens, what points at a brief from every brief's links.

The types are declared once, and the reading side and the drawing side stand on that one declaration, so the contract between them has a single home.

*In force, the author's decision, 2026-09-12; that a program receives structure rather than recovering it is the project's own claim, carried here.*

## 3. The body, traced and flat

The body is traced from a root and handed over as a flat list of briefs in reading order, each carrying its address, its title, the file it came from, and its markdown already parsed. Nothing else is stored, since everything else follows from those.

*In force, the author's decision, 2026-09-12.*

### 3.1 It is traced from a root, by its mounts

The process is pointed at a `README.md` that carries [the stamp](../practice.md#9-a-file-says-it-is-under-the-code), and it does not run on anything else. From there it follows the mounts: every brief that ends with a lone link names a file or a folder's entry, and a stamped file named that way is parsed and traced in turn, until nothing new is reached.

So the body is whatever the root connects, and nothing is scanned. A file no mount reaches is simply not in it. A mount that names a missing or unstamped file is skipped, and the process says so rather than failing silently. So is a brief that mounts a part and holds subsections of its own, which [the practice forbids](../practice.md#1-the-medium), so every brief the page receives has exactly one level.

*In force, the author's decision, 2026-09-12.*

### 3.2 The address is the path of titles

A brief's address is the titles on its way down from the root, each written as an anchor is and joined by slashes, and the root's address is empty:

```
the-proof-of-concept/the-surface/a-level-to-a-pane/following-a-link-moves-you-and-the-history-is-the-way-back
```

The address alone gives a brief's parent and depth, and the list's order gives its place in its level, so the number a heading shows is derived when it is drawn and never stored. A written number that disagrees with a brief's place is warned of.

Titles rather than positions, because a reader's history and a sent link hold addresses, and a position changes whenever a brief is inserted before it. A title path survives inserting, removing and reordering. It breaks on a rename or a move, as a file's anchor already does, and an address that no longer resolves falls back to its nearest ancestor that does, with the reader told. Two briefs with one title in one level are warned of.

*In force, the author's decision, 2026-09-12.*

### 3.3 Links are rewritten to addresses

A markdown link names a file, and sometimes a heading's anchor in it. As the trace walks, it keeps a table from each to the address it holds: a file and an anchor to that section, and a file alone to the brief that mounts it, since the file is that brief's level. When the trace is done, every link in every brief's tokens is rewritten through that table.

A web address is left as it is. A link to a file the trace never reached is marked as leaving the body.

*In force, the author's decision, 2026-09-12.*

### 3.4 Markdown is parsed by a library and drawn by the page

`marked` parses every file, one dependency in the workspace, so none of markdown's grammar is written here. Its tokens are what each brief carries, not HTML, because the drawings need the prose as it is: each paragraph with its own size.

The page renders those tokens with its own small functions, the same ones that give the prose its style. The arc uses few kinds: paragraphs, lists, code, tables, and text with emphasis, code and links inside them.

*In force, the author's decision, 2026-09-12. That marked carries no dependencies of its own was checked on 2026-09-13, at version 18.*

### 3.5 A size is the visible text

Every size the page counts or draws is characters of the text a reader sees: no markdown syntax, no link targets, only what reads on the screen. It answers both questions a size is asked, what a brief costs to read and how long a paragraph looks, since a drawing lays text out in length.

The page counts it by walking a brief's tokens and adding up the text they hold, a few lines of its own, so it needs nothing from marked in the browser. A brief's own size is its prose; its branch is that with everything beneath it. Where a session's cost matters, a count of model tokens is shown as the characters divided by four and marked as an estimate.

*In force, the author's decision, 2026-09-12. That marked offers no plain-text rendering of its own is from memory and not checked.*

## 4. The address sits after a hash

The page's URL holds the address of the last brief a reader opened, and that is enough to rebuild every pane, since each pane is the level of one brief along it:

```
surface.html#/the-proof-of-concept/the-surface/a-level-to-a-pane
```

It sits after a `#` because that works on any static host and inside one file, where a path of its own would need the host to serve the page for every URL. A reader who arrives without an address is shown the root's level with nothing opened.

*In force, the author's decision, 2026-09-12.*

## 5. Live and published differ only in where the body comes from

Live, a process runs against a path in a working tree and answers three requests. The page itself, the body as JSON, and a stream that says when a file under the path has changed, so the client asks for the body again and draws it. The body is assembled again whole on any change, which a body this size allows.

Published, the same process runs once and writes the page with the body inside it, in a script tag that holds data rather than code:

```html
<script type="application/json" id="substrate">…</script>
```

The browser never runs that tag, so nothing in a brief can become code. Every `<` in the JSON is written as `\u003c`, since a brief containing the closing tag would otherwise end it early. On start the client reads the tag if it is there, and asks the process for the body if it is not.

So the pipeline's whole job is to run the build on each commit and put the one page where it is served.

*In force, the author's decision, 2026-09-12. That parsing a JSON string is faster than an equally large object literal is carried from V8's guidance and not checked here.*

## 6. How it is drawn

The page draws from a small shared state and nothing else: the address in focus, which the page's own address follows; the address the pointer rests on, which lives nowhere and leaves no trace; the grade of every brief in the lane; and the settings. Every change to one of them draws what depends on it again.

*In force, the author's decision, 2026-09-13.*

### 6.1 The lane is HTML in one scroll box, with its gutters inside

The lane, the gutter on either side of it and the prose between are one scroll box, so the gutters scroll with the text for free. The prose is a column of articles in reading order, each drawn at its grade, and the gutters are columns beside it in which each adjunct is placed at the height of the line it belongs to, pushed down where two would overlap. Folding draws the lane again whole and then scrolls so that the heading of the brief in focus stands where it stood.

The focus is found on every scroll: the article under the reading line, or the nearest above it. The line stands at the middle of the viewport, or, easing to the ends, on the opening at the top and on the last brief at the foot, each end eased to the middle over a third of a screen of scrolling. A move to a brief finds the scroll that brings the brief to the line by halving, since the line moves with the scroll. When the line eases to the ends, the room above and below the lane is set each time the lane is laid, so the opening's heading and the last block stand level with the shape's first and last cells; the shape's scale depends on that room, so it is settled in a few steps. When it changes, the page's address is replaced without entering the history, and the widgets that depend on the focus draw again.

*In force, the author's decision, 2026-09-13.*

### 6.2 Wings are drawn whole, as HTML or SVG

A wing lays its figures in slots: a figure of fixed size is drawn first and measured, a growing figure is drawn into what is left, and a figure that answers the focus or the pointer is drawn again in its own slot alone. Each figure is drawn whole from the state whenever the state it reads changes: the tree and the settings as HTML, the ahead, the shape and the plate as SVG. The lane's ends align with the shape's slot wherever in its wing the shape stands, so once the wings are laid the ends are settled again, and the wings drawn again if they moved. The strips are laid over the foot of the row from the areas' own geometry, so a closed area's rail stands where the area stood. Every cell that names a brief is an element of its own carrying the brief's address, so pointing and pressing need nothing more. Should the plate ever hold more cells than that bears, it alone moves to a canvas.

*In force, the author's decision, 2026-09-13.*

### 6.3 One brief lit, wherever it is drawn

Everything drawn carries its brief's address. When the pointer rests on one, the page marks that address, and everything carrying it lights at once, in the lane, in the gutters and in the wings.

*In force, the author's decision, 2026-09-12.*

### 6.4 One palette, two sides

A dark theme made by inverting the light one reads wrong, because the eye does not treat dark and light alike. So there is one palette, and every colour in it names its role once, with a light value and a dark value side by side. The theme only chooses the side. Left to the system, the browser chooses, so nothing flashes before the script runs.

The light side stands on white. The dark side matches each role's contrast against its own ground rather than its lightness, and bends in three places where perception does. The ground is a warm near-black and the ink a soft white, since pure white on pure black glares and a neutral grey reads cold. Fills close to the ground step further from it, since small differences are harder to see in the dark. And light type on dark reads heavier, so the weights thin a step.

Colour stays even across branches by chroma. How much chroma a hue can hold depends on its lightness: the most in the middle, less towards white and towards black, and least for cyan and blue. A role asking more than a hue can hold is clipped on that hue alone, so that branch reads duller than its neighbours. So every role's chroma sits under what the weakest hue holds at the role's lightness, and it falls as the role nears the ground or the ink. On dark the accents lose a little more, since a saturated colour on dark looks brighter than it is.

*Measured, 2026-09-13: the gamut by hue and APCA contrast were computed for every role. The highlight had asked 0.17 chroma where cyan holds 0.10, and now asks 0.12. The dark values were then set by eye against the numbers, since APCA overstates what a large fill needs near a dark ground. The perceptual claims are established colour science, carried and not tested here.*

## 7. One file, laid by the gradient

The server, the build, the client and the talk between them are one TypeScript file, run with Bun. A flag chooses between serving live and writing the page. This is the proof of concept, and nothing in it should grow larger than reading a body needs.

The file is composed the way a brief is. What it is and how it is run come first, then how the body is assembled, then how it is drawn, and the details beneath. The drawing holds the lane, then the areas and their strip, then one section per widget, then what wires the gestures. Every widget is one entry in one table, so the day the file outgrows reading by depth, each entry becomes a file of its own and nothing else moves. Its sections carry numbered headings in comments, so it is read by depth like anything else under the code.

For taste in the code itself, the author's guidelines from the sister project stand as general guidance: [Hjulverkstan's principles](https://github.com/Hjulverkstan/hjulverkstan/blob/main/GUIDELINES.md#principles-). They hold simplicity and coherence, data over logic, pure functions with their side effects kept apart, and flat data with a single source of truth. They are not brought in here, and the link is to the source.

It stands beside its specification, as `surface.ts` in this holon.

*In force, the author's decision, 2026-09-12; the widget table 2026-09-13.*

## 8. Plain functions before a framework

The drawings and the panes start as plain functions that return SVG and HTML, written to one style so they read as a family. A framework such as Solid would render in the browser like anything else, but it needs its own compile step for its markup, and that step is exactly what one file run with Bun avoids.

Whether the functions grow into components is decided once the figures exist and have been used.

*Preferred, the author's, 2026-09-12.*

## 9. Git waits for history

Git could carry the files, and it is not used for that. A JavaScript client such as isomorphic-git speaks git's smart HTTP protocol, and three things make it the harder road here. It carries commits and not the working tree, so a live reading would lag behind a session's writing until the next commit. A static host serves no smart HTTP, and the client cannot read a `.git` folder served as plain files. And it brings a library, a filesystem in the browser, and a clone of the whole repository where the surface wants only the stamped files under one path.

Git belongs where the surface needs history rather than files: resolving a link against the state it was written in, and drawing where a reader has been. When those are taken up, the live process asking the git CLI is the likely road.

*Reasoned, 2026-09-12. The protocol and the client's limits are from [git's documentation](https://git-scm.com/docs/http-protocol) and [isomorphic-git's](https://isomorphic-git.org/docs/en/next/faq), read that day.*

## 10. What is not settled yet

Whether a file's status travels with its briefs, which waits until a widget needs it; its kind already does, since a record's level says so. Where the published page stands beside the wiki the repository already publishes. And the trials the lane and the widgets name: the fade, the flick, the floor of the ahead, and knobs against sliders.

*Open, 2026-09-13, and taken up in that order.*
