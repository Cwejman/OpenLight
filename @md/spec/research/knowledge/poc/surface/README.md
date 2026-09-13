---
under: the code
kind: brief
status: in force
---

# The surface

## 1. One interface, and what refusing more buys

One interface serves two moments of the same repository. Locally it reads a working tree, again as the files change, which is the live view a session needs while it works. Published, it reads what a build emits from that same tree, so a repository's site is the repository rather than a site kept in step by hand.

It also shows what the harness hides. A harness gives very little sight of what a session is doing, and keeps what it does give in a transcript outside the repository the work produced. A session that records its work where the knowledge lives is read here like everything else.

Both of those are bought by refusing more. This builds no new substrate and no new harness, so the substrate stays prose in markdown and git, and the harness stays the one that exists with its context appended rather than composed. The medium [the code's sixth section](../../code.md#6-how-far-this-goes) reaches for is not this and is not built from this.

*Reasoned, the author's, 2026-09-12.*

### 1.1 What it is handed

The surface is given a path in a working tree and never reads above it, so a repository, a folder inside one, or a single file are all valid roots and the root is the body.

It digests only what [the stamp](../practice.md#9-a-file-says-it-is-under-the-code) declares to be knowledge, which is what lets a directory be onboarded a file at a time. So the surface needs no knowledge of harnesses at all: whatever wants to be read writes itself into the substrate first.

What it finds there it does not interpret. What counts as a brief, and what nests beneath it, is [the practice's answer](../practice.md#1-the-medium): a brief is a file or a section in one, a folder is a holon whose brief is its entry, and a level is what stands beneath one brief.

*Reasoned, 2026-09-12.*

## 2. Reading and orientation come apart

A reader reads one thing at a time, and the eye that moves to a second column of prose has stopped reading the first. What a reader wants from around the text is not more text but a sense of place: where they came from, what lies beneath, what this brief points at. Headings and shape give that, and prose does not.

So the surface is one lane of prose, centred, with room on either side, and the sides orient. The lane carries the body in the order a document reads, each brief at a grade the reader sets: folded to its heading, opened to its face, or read whole. The sides carry the tree, the shape beneath, the links, and whatever else a reader spawns there, and never prose.

The first reading model gave a level to a pane and stood three panes side by side. The author's verdict, after a day of use, was that only one pane is ever read, and that the others earned their room for orientation alone, which they gave in prose, the costliest way there is. The depth a reader most wanted, the level beneath the brief in front of them, stood behind a pointer and a press. Both are what this model answers.

*Reasoned, the author's, 2026-09-13, from using the program built the same day; the first model stands beneath, refused.*

[the level beneath](lane.md)

## 3. Five areas, and what stands in them

The lane is one of five areas in a row: a wing, a gutter, the lane, a gutter, a wing. The gutters hold what stands beside a brief, aligned with it and scrolling with it. The wings hold figures of the body that stand on their own. A reader chooses what each area shows from a light row of icons at its foot, and settings are a figure like any other.

That is a small framework, kept small on purpose. It is what lets a new drawing be tried by adding one function, and what keeps every drawing in step, since all of them read one shared state and act through the same few verbs.

*Reasoned, the author's, 2026-09-13.*

[the level beneath](framework.md)

## 4. The widgets

What can stand in a wing or a gutter, each described once it exists, and the rules every one of them keeps: nothing drawn that the substrate does not hold, nothing drawn too small to read, one brief lit wherever it is drawn, and ink spent only where a reader has asked.

*Reasoned, 2026-09-13; each widget carries its own grade beneath.*

[the level beneath](widgets.md)

## 5. How it is built

The surface is one page the browser manages, and one TypeScript file run with Bun makes it. Run against a path in a working tree, the file serves the page live and tells it when a file changes. Run once with a flag, it writes the page with the body inside, and that is all the pipeline does on each commit.

Either way the file reads the stamped markdown and hands the page the substrate already typed, so the page draws structure it receives and never parses prose to find it. It is kept to one file because this is the proof of concept.

*In force, the author's decision, 2026-09-12.*

[the level beneath](implementation.md)

## 6. What this does not answer

How a reader sees where they have been. The lane keeps what a reader opened, so part of the trail shows as what stands unfolded, but following a link lays the lane afresh and nothing draws the way back beyond the browser's own history. The drawing it wants is two-dimensional rather than a line. It is owed, and it is not needed to begin.

Whether the harness can be modified after all. Its SDK could assemble a context from the substrate rather than append to a trail, which is the largest gain in reach here, and it is unanswered.

What a session keeps. The lane and the widgets read any substrate, so they read a session's record once it is written down, but nothing here says what a session should write, or how it is made to write it while it works rather than at its close.

What stands beside a brief in the left gutter. Commits and people belong there, and both wait for git, which [the implementation](implementation.md#9-git-waits-for-history) leaves for history.

*Open, 2026-09-13. What each level leaves open stands at its own foot, the technical ground included.*

## 7. What was tried and refused

Two programs were built before this model. A reader and its nine briefs were built in one sitting on 2026-09-11, each change made before the last had been used, and both were retired to git the next day. A second program was written on 2026-09-13 against the specification written first, a level to a pane, three abreast, and the author used it that day. Its trace of the body and its figures carry into this model; its reading model does not.

What both reached for is kept beneath, each shape with the reason it is not wanted, so that none of them is put forward again as though it were new. That level is a flat run rather than a gradient, because a refusal is looked up when someone proposes it again and never read through.

*Seen, in both programs and in the author's reading of them; each refusal beneath names the rule or the observation that grades it. It is also the reason [the study names running ahead](../../study/findings.md#7-building-runs-ahead-more-easily-than-writing-does) as a finding of its own.*

[the level beneath](refused.md)
