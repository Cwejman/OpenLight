---
under: the code
kind: brief
status: in force
---

# The surface

## 1. One interface, and what refusing more buys

One interface serves two moments of the same repository. Locally it reads a working tree, again as the files change, which is the live view a session needs while it works. Published, it reads what a build emits from that same tree, so a repository's site is the repository rather than a site kept in step by hand.

It also shows what the harness hides. A harness gives very little sight of what a session is doing, and keeps what it does give in a transcript outside the repository the work produced. A session that records its work where the knowledge lives is read here like everything else.

Both of those are bought by refusing more. This builds no new substrate and no new harness, so the substrate stays [markdown and git](../practice.md#1-files-folders-and-commits), and the harness stays the one that exists, its context a transcript it appends to. The medium [the code's sixth section](../../code.md#6-how-far-this-goes) reaches for is not this and is not built from this.

*Reasoned, the author's, 2026-09-12.*

## 2. What it is handed

The surface is given a path in a working tree and never reads above it, so a repository, a folder inside one, or a single file are all valid roots. What the root connects is the body, the whole the surface reads and draws.

It digests only what [the stamp](../practice.md#2-a-file-says-it-is-under-the-code) declares to be knowledge, which is what lets a directory be onboarded a file at a time, and it needs no knowledge of harnesses at all: whatever wants to be read writes itself into the substrate first. An image is not stamped, and needs no stamp: it is drawn because a stamped brief shows it, and a file no brief shows is never read.

What it finds there it does not interpret. What counts as a brief, and what nests beneath it, is [the practice's answer](../practice.md#1-files-folders-and-commits): a brief is a file or a section in one, a folder is a holon whose brief is its entry; and a level, then, is what stands beneath one brief.

*Reasoned, 2026-09-12.*

## 3. Reading and orientation come apart

A reader reads one thing at a time, and the eye that moves to a second column of prose has stopped reading the first. So the lane is one, and what stands at its sides is headings and shape, never prose, since a sense of place is what a reader wants from around the text and prose is the costliest way to give it.

*Reasoned, the author's, 2026-09-13, from a day's use of [the first reading model](refused.md#11-a-level-to-a-pane-three-abreast), which gave a level to a pane.*

[the level beneath](lane.md)

## 4. Five areas, and what stands in them

The lane is one of five areas in a row: a wing, a gutter, the lane, a gutter, a wing. The gutters hold what stands beside a brief, aligned with it and scrolling with it. The wings hold figures, the widgets that draw [the body](#2-what-it-is-handed) and stand on their own. A reader chooses what each area shows from a light row of icons at its foot, and settings are a figure like any other.

That is a small framework, kept small on purpose. It is what lets a new drawing be tried by adding one function, and what keeps every drawing in step, since all of them read one shared state and act through the same few verbs.

*Reasoned, the author's, 2026-09-13.*

[the level beneath](framework.md)

## 5. The widgets

The widgets are what can stand in a wing or a gutter: the tree, the shape, the ahead, the links, the settings and the plate, each described once it exists. They keep one set of rules between them, so a reader learns a family rather than a stranger per figure.

*Reasoned, 2026-09-13; each widget carries its own grade beneath.*

[the level beneath](widgets.md)

## 6. How it is built

The surface is one page the browser manages, and one TypeScript file run with Bun makes it, standing beside this entry as [`surface.ts`](surface.ts). Run against a path in a working tree, the file serves the page live and tells it when a file changes. Run once with a flag, it writes the page with the body inside, and that is all the pipeline does on each commit.

Run with `--check`, it only traces, and prints its warnings and every face past [the practice's flag](../practice.md#53-the-check-flags-a-face-past-four-hundred-characters).

Either way the file reads [the stamped](#2-what-it-is-handed) markdown and hands the page the substrate already typed, as data with its structure declared, so the page draws structure it receives and never parses prose to find it. It is kept to one file because this is the proof of concept.

*In force, the author's decision, 2026-09-12.*

[the level beneath](implementation.md)

## 7. What this does not answer

Four things the surface does not answer cross the levels beneath, so they stand here rather than at one level's foot.

How a reader sees where they have been. The lane keeps what a reader opened, so part of the trail shows as what stands unfolded, but [following a link lays the lane afresh](lane.md#9-following-a-link-moves-you), and though the browser's history and [escape](lane.md#52-escape-is-an-undo) both step back, nothing draws the way. The drawing that would is a map of the visits rather than a line back through them. It is owed, and it is not needed to begin.

Whether the harness can be modified after all. Its SDK could assemble a context from the substrate rather than append to a trail, which is the largest gain in reach here, and it is unanswered.

What a session keeps. The lane and the widgets read any substrate, so they read a session's record once it is written down, but nothing here says what a session should write, or how it is made to write it while it works rather than at its close.

What stands beside a brief in the left gutter. Commits and people belong there, and both wait for git, which [the implementation](implementation.md#9-git-waits-for-history) leaves for history.

*Open, 2026-09-13.*

## 8. What was tried and refused

What the programs before this model reached for is kept beneath, each shape with the reason it is not wanted, so that none of them is put forward again as though it were new. That level is a flat run rather than a gradient, since a refusal is looked up when someone proposes it again and never read through, so no refusal stands on another.

Two programs were built before this model. A reader and its nine briefs of specification were built in one sitting on 2026-09-11, before anything was specified first, each change made before the last had been used, and both were retired to git the next day. The first reading model was written on 2026-09-13 against a specification written first, a level to a pane, three abreast, and the author used it that day. Its trace of the body, the reading of the files that hands the page its briefs, and its figures carry into this model; its reading model does not.

*Seen, in both programs and in the author's reading of them; each refusal beneath names the rule or the observation that grades it. [The study names running ahead](../../study/findings.md#7-building-runs-ahead-more-easily-than-writing-does) as a finding of its own for the same reason.*

[the level beneath](refused.md)
