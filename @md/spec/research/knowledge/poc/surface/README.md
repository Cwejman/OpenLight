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

## 2. A level to a pane

Wherever you are reading you are at a path in the holarchy, and no brief is orphaned, since each is a part of the understanding above it. That is what a surface can be built on: there is always somewhere you are, and always a way you came.

So each level of the path takes a pane, and the panes stand side by side, left to right. Going deeper adds one on the right, and nothing a reader has passed through is ever taken off the row.

A pane holds a level and never a single brief. The briefs of that level stand in it in the order they stand in, as prose read straight down, each giving its own prose and leaving what is beneath it for the pane to the right. That order is a reading and not a menu, since [the briefs at a level stand on the ones before them](../../code.md#42-the-order-of-a-holarchy) and never on the ones after.

Pressing a brief opens the level under it. You do not enter the brief, because you have just read it.

*Reasoned, the author's, 2026-09-12.*

[the level beneath](panes.md)

## 3. What the prose cannot say

A brief says what it means. It cannot say what it is, and it can say nothing about the body it sits in, because no brief can see the whole.

Plotted out, that body becomes reachable from anywhere. A holarchy gives one route to each of its parts, down from the root, and one route is not enough for a reader who arrives with a question rather than at the beginning. With the structure laid out in front of them they go straight to what bears on it, and they move by what sits near what rather than along a path they have to walk. That is the half of navigating a body the descent cannot give, and it is what plotting the shape is for.

Seen as shape, the body also says what no brief says: where its mass sits, which regions have been worked and which are thin, and whether the gradient it was written by holds at all. That last turns the code's own promise into something a reader can check, since a short top with heavier levels beneath is visible, and so is its failure.

Closer in, the same drawing quotes the price. Reading is a spend and prose never names it, so a reader weighs a part before entering. That is the job a minimap does beside a long file, and it is the least of what these do.

*Reasoned, the author's, 2026-09-12. Two parts of it are measured: [the study counted its own tree as shape](../../study/measured.md#1-the-study-against-the-gradient-2026-09-12) and found both that the gradient holds and where heaviness does not, and judging a part by its look before reading it is the judgment [the labs failed most often](../../study/findings.md#1-heaviness-is-seen-before-it-is-read). Both carried here unchecked.*

[the level beneath](drawings.md)

## 4. Moving, and asking

A reader does three things besides read. They go deeper, they go sideways, and they ask about a brief without going anywhere at all. The first two change the path and are remembered. The third leaves no trace.

That division is what makes looking free. A reader can see what a descent would give before spending it, and nothing they merely looked at follows them.

A descent is committed from a door in a pane or from a cell in any drawing, and either one adds the level beneath to the panes and to the drawing of the path. From a drawing it may carry more than one level, since a reader can look several levels down before choosing.

*Reasoned, the author's, 2026-09-12.*

[the level beneath](moving.md)

## 5. How it is built

The surface is one page the browser manages, and one TypeScript file run with Bun makes it. Run against a path in a working tree, the file serves the page live and tells it when a file changes. Run once with a flag, it writes the page with the body inside, and that is all the pipeline does on each commit.

Either way the file reads the stamped markdown and hands the page the substrate already typed, so the page draws structure it receives and never parses prose to find it. It is kept to one file because this is the proof of concept.

*In force, the author's decision, 2026-09-12.*

[the level beneath](implementation.md)

## 6. What this does not answer

How a reader sees where they have been. Following a link rebuilds the panes, and the history carries the way back, but nothing draws that history and the drawing it wants is two-dimensional rather than a line. It is owed, and it is not needed to begin.

Whether the harness can be modified after all. Its SDK could assemble a context from the substrate rather than append to a trail, which is the largest gain in reach here, and it is unanswered.

What a session keeps. The panes and the drawing read any substrate, so they read a session's record once it is written down, but nothing here says what a session should write, or how it is made to write it while it works rather than at its close.

*Open, 2026-09-12. What each level leaves open stands at its own foot, the technical ground included.*

## 7. What was tried and refused

A reader and its nine briefs were built in one sitting on 2026-09-11, each change made before the last had been used, and both were retired to git the next day. These briefs are the specification written first instead, and no program has yet been written against them.

What that program reached for is kept beneath, each shape with the reason it is not wanted, so that none of them is put forward again as though it were new. That level is a flat run rather than a gradient, because a refusal is looked up when someone proposes it again and never read through.

*Seen, in that program and in the author's reading of it; each refusal beneath names the rule or the observation that grades it. It is also the reason [the study names running ahead](../../study/findings.md#7-building-runs-ahead-more-easily-than-writing-does) as a finding of its own.*

[the level beneath](refused.md)
