---
under: the code
kind: brief
status: in force
---

# This repository

## 1. The name is the rule

The repository is named the rule, since what it holds is more than a way to lay knowledge out. It is how knowledge is built, and with it how one moves into what is not yet known.

The code says it structures knowledge into brief wins, and that is where it was found. But the same step is taken wherever work goes into the unknown: what to research, what to build, what to put into the substrate, whom to meet. Each step takes the biggest win that can be reached from what is already held, and leaves it whole before the next. The code calls the balance of those two forces the gradient, a word that on its own says less than the code asks of it.

*Preferred, the author's, 2026-09-14.*

### 1.1 Why not the code

"The code" collides with where it lives. In a software repository the code means the source, and every project that takes this repository in is a software repository; the arc had already renamed its sketching tool's file to keep the two apart.

The name also cannot be found from outside, and it says only law, where [the code's making](code.md#5-the-making) says it is embodied rather than obeyed.

*Seen, in the arc and in OpenLight, 2026-09-14.*

### 1.2 Why the rule

A rule, in the sense a monastery keeps one, governs a whole life: the work, the study, and how a guest is met. It is lived rather than followed, and it holds everything the step reaches.

*Preferred, the author's, 2026-09-14.*

### 1.3 The code keeps its name until it is written again

`code.md` is ratified, so it is not renamed now: it is edited only [in review with the author](poc/practice.md#24-a-ratified-file-is-edited-only-in-review). The stamps keep `under: the code` with it, and the surface reads them as they are. The name moves into the text when the code is written again.

*In force, 2026-09-14.*

## 2. A first step, taken by the rule

The repository is a pragmatic first step. The arc was needed as a submodule before the code could be written again as its entry, so it moved whole, as it stands, with the code left as ratified.

*In force, the author's decision, 2026-09-14.*

### 2.1 The plan it steps toward

The plan is for the code to become this repository's root entry, leading out to the proof of concept, the study and the ideas. That asks changes to how the code reads, and the author's full ratification of them, and neither is ready.

*In force as the author's direction, 2026-09-14; not begun.*

### 2.2 Why it could not wait

Hjulverkstan is taking the proof of concept up, and a closed-source client began with it the week of 2026-09-07 from a copy of the code. That is [the drift the code warns of](code.md#33-the-ground): a copy quietly becomes a second code. The biggest win within reach was the move itself, so it was taken first.

*Seen, in the three projects, 2026-09-14.*

## 3. What moved

Everything the arc held moved, with its history: the code, the proof of concept, the study and the ideas. The study came because the code stands on it, and a repository without its grounds would state principles it cannot show the reason for.

*In force, the author's decision, 2026-09-14.*

### 3.1 The sweep moved into the study

The sweep's reports are the study's corpus, so they stand inside it, at [`study/sweep-2026-08/`](study/sweep-2026-08/). In OpenLight they stood beside the arc, and every link written to them, the frozen labs' included, was rewritten by path and nothing else. The paths quoted inside the labs' prompts were left as they were sent.

*Seen, 2026-09-14: every link in the arc was checked to resolve after the rewrite.*

### 3.2 The history came with it

The repository was cut from a clone of OpenLight with `git filter-repo`, keeping every commit that touched the arc or the sweep, 290 of them, from 2026-08-23 to the commit that readied the move. Of those, 58 also changed OpenLight's own files, mostly its log and its board. Here they keep only their part in the arc, so a message may mention a change that is not in it.

Files git ignores did not come, lab 10's snapshots among them, since they were never committed.

*Measured, 2026-09-14.*

### 3.3 The past stands twice, and that is not drift

OpenLight's history is untouched, so the past stands twice: the original commits there, and their copies here under new hashes. History does not change, so the two cannot drift apart. From the move on the living files have one home, and it is here.

*Reasoned, 2026-09-14.*

## 4. What stays in OpenLight

What the arc points at in OpenLight is linked at OpenLight's address rather than carried, and the study holds [a level on OpenLight](study/openlight.md) for a reader who arrives without it.

*In force, the author's decision, 2026-09-14.*

### 4.1 The design language is linked, as something to resolve

The surface draws in [OpenLight's design language](https://github.com/Cwejman/OpenLight/blob/main/@md/spec/design.md), and that is the one tie the arc builds on. The design language is a family's held judgment, not yet a whole of its own, so it is linked where it stands rather than taken in.

What it becomes is open: made the surface's own, or given a whole of its own somewhere, perhaps as a submodule of its own.

*In force, the author's decision, 2026-09-14; pragmatic, and open.*

## 5. How a project takes it in

A project takes the repository in as a git submodule: pinned at a commit, read in place by people and by sessions, and moved forward when the project chooses. It is public, so a project takes it in with no key.

*Reasoned, the author's direction, 2026-09-14; public, the author's decision the same day.*

### 5.1 Why a submodule

A submodule is chosen over a subtree, which keeps no clear line back to one home, and over a package, which hands a session built files rather than the tree it reads.

*Reasoned, the author's, 2026-09-14.*

### 5.2 OpenLight takes it in at the path it left

OpenLight replaces the arc's folder with the submodule at the same path, `@md/spec/research/knowledge`, so every link into it from OpenLight's own knowledge stays true. Mounting it from OpenLight's root, once that entry is substrate, comes [later](#7-what-comes-next).

*In force, the author's decision, 2026-09-14.*

### 5.3 A folder becoming a submodule trips git once

Checking out an OpenLight commit from before the folder became a submodule, from a commit after it, is refused until the submodule's files are moved aside. Moving the submodule later with `git mv` does not trip in the same way: it leaves only an untracked folder where the submodule stood.

*Seen, 2026-09-14, in two repositories made to test it.*

## 6. The steps, in order

Each step stands on the ones before it.

1. In OpenLight: move the sweep into the study, rewrite the links, write the level on OpenLight and this file, and commit.

2. Cut this repository from a clone of OpenLight with `git filter-repo`, keeping the arc and the sweep with their history, and publish it as `Cwejman/the-rule`.

3. In OpenLight: replace the arc's folder with this repository as a submodule at the same path, in one commit.

4. In Hjulverkstan and the closed-source client: replace the copy of `code.md` with the submodule.

*In force, 2026-09-14.*

## 7. What comes next

The code is written again as this repository's root entry and takes the name, once the author has changed how it reads and ratified the change.

OpenLight's root README becomes substrate. It mounts the rule, and declares the existing spec tree a legacy artefact, to be written again under the rule.

*In force as the author's direction, 2026-09-14; not begun.*

## 8. What is not answered

How a change made while working inside a project travels back here, which a submodule leaves to a commit in this repository.

Whether the labs keep the stamp, which [the practice leaves open](poc/practice.md#12-the-labs-files-are-frozen).

*Open, 2026-09-14.*
