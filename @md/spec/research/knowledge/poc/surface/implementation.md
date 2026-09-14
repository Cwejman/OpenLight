---
under: the code
kind: brief
status: in force
---

# How it is built

## 1. Nothing is rendered on a server for a request

Everything a reader does happens in the browser: the lane and its folds, the widgets, and every move between them. So one client serves both moments of a repository, live and published, and the two differ only in where the body comes from, [beneath](#5-live-and-published-differ-only-in-where-the-body-comes-from).

*In force, the author's decision, 2026-09-12.*

## 2. The process assembles the substrate, and the page only draws

A program should receive structure, never recover it. So the process that reads the files, the trace, reads the body once and hands the page each brief already parsed and already placed, and the page carries no markdown parser, resolves no paths, and guesses at nothing.

What the page computes, it computes from what it was given: a brief's place from [its address](#32-the-address-is-the-path-of-titles), a size from [its parsed markdown](#34-markdown-is-parsed-by-a-library-and-drawn-by-the-page), what points at a brief from every brief's links. The types are declared once, and the reading side and the drawing side stand on that one declaration, so the contract between them has a single home.

*In force, the author's decision, 2026-09-12; that a program receives structure rather than recovering it is the project's own claim, carried here.*

## 3. The body, traced and flat

The body is traced from a root and handed over as a flat list of briefs in reading order, each carrying its address, its title, the file it came from, and its markdown already parsed, with an image's size and source and a sketch's markup [where a brief shows one](#36-an-image-is-measured). Nothing else is stored, since everything else follows from those.

*In force, the author's decision, 2026-09-12.*

### 3.1 It is traced from a root, by its mounts

The process is pointed at a file that carries [the stamp](../practice.md#2-a-file-says-it-is-under-the-code), named directly or as a folder's `README.md`, and it does not run on anything unstamped. From there it follows [the mounts](../practice.md#3-every-part-is-mounted-by-one-brief-of-its-entry): every brief that ends with a lone link names a file or a folder's entry, and a stamped file named that way is parsed and traced in turn, until nothing new is reached.

So the body is whatever the root connects, and nothing is scanned. A file no mount reaches is simply not in it. A mount that names a missing or unstamped file is skipped, and the process says so rather than failing silently. So is a brief that mounts a part and holds subsections of its own, which [the practice forbids](../practice.md#32-a-mounting-brief-has-no-subsections), so no brief the page receives has more than one level.

*In force, the author's decision, 2026-09-12.*

### 3.2 The address is the path of titles

A brief's address is the titles on its way down from the root, each written as a heading's anchor is, in lower case with hyphens for spaces and the number dropped, and joined by slashes; the root itself, the entry the trace began at, has the empty address:

```
the-proof-of-concept/the-surface/reading-and-orientation-come-apart/following-a-link-moves-you
```

The address alone gives a brief's parent and depth, and the list's order gives its place in its level, so the number a heading shows is derived when it is drawn and never stored.

Titles rather than positions, because a reader's history and a sent link hold addresses, and a position changes whenever a brief is inserted before it. A title path survives inserting, removing and reordering. It breaks on a rename or a move, as a file's anchor already does, and an address that no longer resolves falls back to its nearest ancestor that does, with the reader told.

*In force, the author's decision, 2026-09-12.*

### 3.3 Links are rewritten to addresses

A markdown link names a file, and sometimes a heading's anchor in it. As the trace walks, it keeps a table from each to the address it holds: a file and an anchor to that section, and a file alone to the brief that mounts it, since the file is that brief's level. When the trace is done, every link in every brief's tokens is rewritten through that table.

A web address is left as it is. A link to a file the trace never reached is marked as leaving the body. A link with no target is a brief not yet written, which [the code allows](../../code.md#43-work-in-progress), and is marked as owed.

*In force, the author's decision, 2026-09-12.*

### 3.4 Markdown is parsed by a library and drawn by the page

`marked` parses every file, one dependency, so none of markdown's grammar is written here. Its tokens are what each brief carries, not HTML, because the drawings need the prose as it is: each paragraph with its own size.

The page renders those tokens with its own small functions, the same ones that give the prose its style. The body uses few kinds: paragraphs, lists, code, tables, images, and text with emphasis, code and links inside them. A paragraph that opens with an image is handed over as an image block, with the text written beneath the image in that paragraph as its caption, so the page meets a kind of its own and never looks inside a paragraph to find one.

*In force, the author's decision, 2026-09-12. That marked carries no dependencies of its own was checked on 2026-09-13, at version 18.*

### 3.5 A size is the visible text

Every size the page counts or draws is characters of the text a reader sees: no markdown syntax, no link targets, only what reads on the screen. One count then answers both questions a size is asked, what a brief costs to read and how long a paragraph looks when a figure draws it as a block.

The page counts it by walking a brief's tokens and adding up the text they hold, a few lines of its own, so it needs nothing from marked in the browser. A brief's own size is its prose; its branch is that with everything beneath it. Where a session's cost matters, a count of model tokens is shown as the characters divided by four and marked as an estimate.

An image is not text, so it adds nothing to that count, and the caption beneath it counts as the prose it is. A figure that weighs a brief weighs its images [by the weight setting](widgets.md#62-the-switches), which counts either the cost of the text alone or the room the images take as well.

*In force, the author's decision, 2026-09-12. That marked offers no plain-text rendering of its own is from memory and not checked. Images and the weight setting, the author's, 2026-09-14.*

### 3.6 An image is measured

The trace hands every image block over with where the page loads it from and, where it can be read, its own width and height. So the page lays an image at its size before it has loaded, and nothing beneath it moves when it arrives.

*In force, 2026-09-14, as built.*

#### 3.6.1 The size is read from the first bytes

A file in the body is read for its size from its first bytes: PNG, GIF, WebP and JPEG from their headers, and SVG from its width and height or its view box. A JPEG whose EXIF orientation turns it a quarter is measured turned, since a browser draws it turned; the other orientations are not read. That is a few lines per format, and no library is brought in.

A remote image is asked for its first bytes the same way, and its size is kept a few minutes in a live process, since a trace runs on every save. A size that cannot be had is left to the page, which takes the image's shape once it has loaded, and so does a remote image whose proportions have changed since the trace. Only the proportions are compared, since a vector sized by its view box loads at whatever size the browser picks.

*In force, 2026-09-14; the formats and the EXIF turn were checked against files made for the purpose, and the remote read against one live address.*

#### 3.6.2 An image the page cannot draw

An image that is missing, lies above the root, or is not a format the page draws leaves its alt text and a warning.

It also warns where [the practice's rules for images](../practice.md#8-visuals) are broken: a brief that opens with an image, an image inside running text, which is drawn as its alt text alone, text beneath an image after a plain line break rather than a backslash, which is still drawn as the caption, and a file that does not stand in a `.img` folder beside the file showing it or above it. It cannot tell whether a shared image stands in the nearest folder covering every file that shows it, and does not try.

*In force, 2026-09-14, as built.*

#### 3.6.3 A sketch is set into the page

A local SVG whose root is marked as a sketch, which [the sketching skill](../sketching/README.md) writes, is not shown as an image. The trace reads the whole file and hands the page its markup, so [the page's own palette, theme, branch hue and type](#64-one-palette-two-sides) reach the drawing.

The markup is cleaned by Bun's HTML rewriter, since it is set into the page: only the elements a drawing needs, no event attributes, no reference that leaves the file, and no style that fetches. The page sets it into the figure with the alt text as its label, and draws it on the page's own ground, rounded and rimmed as an image is. A published page carries it the same way rather than as a data address.

*In force, 2026-09-14; the cleaning was tried against a sketch holding scripts, event attributes, self-closing foreign elements, external references and imports, and kept none of them.*

### 3.7 The trace warns of every fault it can see

The trace warns rather than failing silently, so a session hears of a broken rule before a reader does.

It warns of a written heading number that disagrees with a brief's place, two briefs with one title in one level, a link of a scheme it does not follow, a mount it skipped, and every image fault above. Run with `--check`, it prints the warnings and the faces past [the practice's flag](../practice.md#53-the-check-flags-a-face-past-four-hundred-characters), and serves nothing.

*In force, 2026-09-14, as built.*

## 4. The address sits after a hash

The page's URL holds the address of the brief in focus, and after `?in=` [the scope](lane.md#7-scoping-the-lane), when the lane is scoped:

```
surface.html#the-proof-of-concept/the-surface/reading-and-orientation-come-apart?in=the-proof-of-concept/the-surface
```

It sits after a `#` because that works on any static host and inside one file, where a path of its own would need the host to serve the page for every URL. A reader who arrives without an address stands at the root, its level at faces.

The address says where a reader stands and not how the lane is laid. Arriving at one lays the lane afresh, as [the lane says](lane.md#5-arriving-lays-the-lane), and the folds a reader made are kept apart from it, [in the browser](#65-what-the-browser-keeps).

*In force, the author's decision, 2026-09-12; the scope and the focus in the address as built on 2026-09-13.*

## 5. Live and published differ only in where the body comes from

Whether the body is served to the page or written into it is the only difference between the two moments, so the page never knows which it is in, and nothing is built twice.

*In force, the author's decision, 2026-09-12.*

### 5.1 Live, the process serves and watches

The process answers four requests: the page itself, the body as JSON, a stream that says when a file under the path has changed, so the client asks for the body again and draws it, and the images the body holds. The body is assembled again whole on any change to its markdown or to an image, which a body this size allows.

An image is served only when the last trace reached it, so the process hands out nothing else under the path, and its address carries the file's modification time, so a changed image is fetched again rather than kept from before.

*In force, as built 2026-09-13 and 2026-09-14.*

#### 5.1.1 A restart reaches the page

The process reads its own file once, when it starts, so a change to `surface.ts` reaches the page only when the process is started again. The stream's first word names the page the process serves, a hash of its own file, so a page left open across a restart that brings a different page reloads itself, and the lane is laid again as it was left.

*In force, as built 2026-09-14.*

### 5.2 Published, the body is data in the page

The page is written with the body inside it, in a script tag that holds data rather than code:

```html
<script type="application/json" id="substrate">…</script>
```

The browser never runs that tag, so nothing in a brief can become code. Every `<` in the JSON is written as `\u003c`, since a brief containing the closing tag would otherwise end it early. On start the client reads the tag if it is there, and asks the process for the body if it is not.

Every image the body holds as a file is carried inside the published page as a data address, so the page stays one file. A remote image stays remote, since it may change after the build, and the page takes its new shape if it has.

*In force, the author's decision, 2026-09-12. That parsing a JSON string is faster than an equally large object literal is carried from V8's guidance and not checked here.*

## 6. How it is drawn

The page draws from [the shared state](framework.md#4-one-shared-state-and-four-verbs) and nothing else, and every change to one part of it draws again only what depends on that part. So nothing is drawn twice for one change, and nothing drawn can disagree with the state.

*In force, the author's decision, 2026-09-13.*

### 6.1 The lane is HTML in one scroll box, with its gutters inside

The lane, the gutter on either side of it and the prose between are one scroll box, so the gutters scroll with the text for free. The prose is a column of articles in reading order, each drawn at its grade, and the gutters are columns beside it in which each [adjunct](framework.md#1-two-kinds-of-widget) is placed at the height of the line it belongs to, pushed down where two would overlap.

Folding draws the lane again whole and then scrolls so that [the heading of the brief acted on stands where it stood](lane.md#64-the-heading-acted-on-keeps-its-place). [The way down to the scope](lane.md#74-the-way-down-stands-over-the-lane) stands over the scroll box rather than in it, and the prose's fade clears beneath it.

*In force, the author's decision, 2026-09-13.*

#### 6.1.1 An image in the lane

An image stands at its own width, never wider than the measure, a little further from the prose above and below it than paragraphs stand from each other, with its caption beneath in the quieter type the chrome uses, rounded as the code blocks are.

A faint rim is drawn just inside its edge so a light image keeps an edge on a light ground. The rim is an outline pulled inward, since it is painted over the image's pixels, where an inset shadow would lie beneath them and never show.

*In force, 2026-09-14, as built.*

#### 6.1.2 The focus is found on every scroll

The focus is the article under [the reading line](lane.md#41-where-the-reading-line-stands), or the nearest above it. A move to a brief finds the scroll that brings the brief to the line by halving the interval, since the line moves with the scroll.

When the line eases to the ends, the room above and below the lane is set each time the lane is laid, so the opening's heading and the last block stand level with the shape's first and last rows. The shape's scale depends on that room, so the two are settled together, [beneath](#62-wings-are-drawn-whole-as-html-or-svg). When the focus changes, the page's address is replaced without entering the history, and the widgets that depend on the focus draw again.

*In force, the author's decision, 2026-09-13; the easing, 2026-09-14.*

### 6.2 Wings are drawn whole, as HTML or SVG

A wing lays its figures in slots: a figure of fixed size is drawn first and measured, a growing figure is drawn into what is left, and a figure that answers the focus or the pointer is drawn again in its own slot alone. Each figure is drawn whole from the state whenever the state it reads changes: [the tree](widgets.md#2-the-tree) and [the settings](widgets.md#6-settings) as HTML, [the ahead](widgets.md#4-the-ahead), [the shape](widgets.md#3-the-shape) and [the plate](widgets.md#7-the-plate) as SVG.

The lane's ends and the shape's slot depend on each other, so they are settled in a few steps: the wings are laid, the lane's ends are set to the shape's slot, and the wings are drawn again if that moved them. [The strips](framework.md#3-the-strip) are laid over the foot of the row from the areas' own geometry, so a closed area's rail stands where the area stood.

Should the plate ever hold more cells than an element per cell bears, it alone moves to a canvas.

*In force, the author's decision, 2026-09-13.*

### 6.3 The address on every element

Everything drawn that names a brief is an element of its own carrying the brief's address, so pointing and pressing need nothing more, and [lighting one brief wherever it is drawn](widgets.md#14-one-brief-is-lit-wherever-it-is-drawn) is marking one address.

*In force, the author's decision, 2026-09-12.*

### 6.4 One palette, two sides

A dark theme made by inverting the light one reads wrong, because the eye does not treat dark and light alike. So there is one palette, and every colour in it names its role once, with a light value and a dark value side by side. The theme only chooses the side, and left to the system, the browser chooses, so nothing flashes before the script runs.

The palette is data exported from the file, the page's style is written from it, and a sketch's style is written from it too, so the roles have one home.

*Reasoned, 2026-09-13; the perceptual claims beneath are established colour science, carried and not tested here.*

#### 6.4.1 The dark side bends where perception does

The light side stands on white. The dark side matches each role's contrast against its own ground rather than its lightness, and it bends in three places where perception does.

The ground is a warm near-black and the ink a soft white, since pure white on pure black glares and a neutral grey reads cold. Fills close to the ground step further from it, since small differences are harder to see in the dark. And light type on dark reads heavier, so the weights thin a step.

*Reasoned, 2026-09-13; the dark values were set by eye against the numbers, since the contrast measure (APCA) overstates what a large fill needs near a dark ground.*

#### 6.4.2 Colour stays even across branches by chroma

How much chroma a hue can hold depends on its lightness: the most in the middle, less towards white and towards black, and least for cyan and blue. A role asking more than a hue can hold is clipped on that hue alone, so that branch reads duller than its neighbours.

So every role's chroma sits under what the weakest hue holds at the role's lightness, and it falls as the role nears the ground or the ink. On dark the accents lose a little more, since a saturated colour on dark looks brighter than it is.

*Measured, 2026-09-13: the gamut by hue and the contrast (APCA) were computed for every role. The highlight had asked 0.17 chroma where cyan holds 0.10, and now asks 0.12.*

### 6.5 What the browser keeps

Three things outlive a draw, and none of them is in the address, so that the address says only where a reader stands. The settings are kept in the browser's storage, once for every body.

The lane as laid, its scope and every grade, is kept there too, keyed by the page and the body, with the address it was laid at, and a reload at that same address lays it again; at any other address it is set aside.

And every change a reader makes is recorded as the lane stood before it, the scope, the grades, the focus and the scroll, for [escape to undo](lane.md#52-escape-is-an-undo) and shift with escape to redo. That record lives only in memory, holds the last two hundred changes, and is gone with a reload.

*In force, 2026-09-14, as built.*

## 7. One file, laid by the gradient

The file is composed the way a brief is, so it is read by depth like anything else under the code. What it is and how it is run come first, then how the body is assembled, then how it is drawn, and the details beneath, with numbered headings in comments.

The drawing holds the lane, then the areas and their strip, then one section per widget, then what wires the gestures. Every widget is one entry in one table, so the day the file outgrows reading by depth, each entry becomes a file of its own and nothing else moves.

*In force, the author's decision, 2026-09-12; the widget table 2026-09-13.*

### 7.1 Taste in the code itself

The author's guidelines from the sister project are guidance for taste, not rules the check reads, and are not brought in here: [Hjulverkstan's principles](https://github.com/Hjulverkstan/hjulverkstan/blob/main/GUIDELINES.md#principles-). They hold simplicity and coherence, data over logic, pure functions with their side effects kept apart, and flat data with a single source of truth.

*In force, the author's.*

## 8. Plain functions before a framework

The lane and the widgets are plain functions that return HTML and SVG, written to one style so they read as a family. A framework such as Solid would render in the browser like anything else, but it needs its own compile step for its markup, and that step is exactly what one file run with Bun avoids.

Whether the functions grow into components is left until their use asks for it.

*In force, the author's decision, 2026-09-12; the components open.*

## 9. Git waits for history

Git could carry the files, and it is not used for that, because the surface wants files now and git offers commits. Git belongs where the surface needs history rather than files: [resolving a link against the state it was written in](../practice.md#64-how-a-link-holds-its-state-is-open), and drawing where a reader has been. When those are taken up, the live process asking the git CLI is the likely road.

A JavaScript client such as isomorphic-git speaks git's smart HTTP protocol, and three things make it the harder road here. It carries commits and not the working tree, so a live reading would lag behind a session's writing until the next commit. A static host serves no smart HTTP, and the client cannot read a `.git` folder served as plain files. And it brings a library, a filesystem in the browser, and a clone of the whole repository where the surface wants only the stamped files under one path.

*Reasoned, 2026-09-12. The protocol and the client's limits are from [git's documentation](https://git-scm.com/docs/http-protocol) and [isomorphic-git's](https://isomorphic-git.org/docs/en/next/faq), read that day.*

## 10. What is not settled yet

Whether a file's status travels with its briefs, which waits until a widget needs it; its kind already does, since a record's level says so. Where the published page stands beside the wiki that OpenLight already publishes from the same markdown. How large the published page may grow with its images carried inside, since nothing yet warns of it.

*Open, 2026-09-13; what the lane and the practice leave open stands at their own feet.*
