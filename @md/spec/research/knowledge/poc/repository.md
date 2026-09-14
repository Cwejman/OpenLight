---
under: the code
kind: brief
status: in force
---

# Its own repository

## 1. What moves, and how it is taken in

The arc moves with its history, since the code stands on the study and a history cut at the move would leave its grounds unreachable. The code and the proof of concept go; whether the study goes with them is [not answered](#4-what-is-not-answered).

Each project then takes the repository in as a git submodule: pinned at a commit, read in place by people and by sessions, and moved forward when the project chooses. A submodule is chosen over a subtree, which keeps no clear line back to one home, and over a package, which hands a session built files rather than the tree it reads.

OpenLight takes it in at the path it leaves, `@md/spec/research/knowledge`, so every link into it from OpenLight's own knowledge stays true.

*Reasoned, the author's direction, 2026-09-14; not yet lived in any of the three projects.*

## 2. What has to hold before it moves

Two things tie the arc to OpenLight today, and both have to be cut before the move, so the move itself changes nothing but where the files live.

Three of the surface's briefs link to OpenLight's design language, above the arc. That tie is not yet cut: the few rules they use are to be either carried into the surface's own briefs or linked at OpenLight's published address, and which is not decided.

The surface's dependency, the markdown parser [marked](https://github.com/markedjs/marked), was resolved from OpenLight's workspace. That tie is cut: the arc now carries a package file of its own, naming marked and [resvg](https://github.com/thx/resvg-js), the renderer [sketching](sketching/implementation.md#5-the-look-is-for-the-sessions-eye) looks with, so both run wherever the repository is checked out.

*Seen, by tracing the links that leave the arc, the study aside, and the dependency the surface imports, 2026-09-14; the package file was added the same day.*

## 3. The steps, in order

The order is a claim like any other: each step stands on the ones before it.

1. Cut the tie to the design language, in OpenLight, and commit.

2. Make the repository from the arc's folder with `git filter-repo --subdirectory-filter @md/spec/research/knowledge`, so its history comes with it.

3. Take it back into OpenLight as a submodule at the same path, and read the arc with the surface from there to see nothing broke.

4. Take it into Hjulverkstan and the closed-source client, where the copy of `code.md` is replaced by the submodule.

*In force, 2026-09-14; the move comes after [the polish](polish.md).*

## 4. What is not answered

Three questions wait, and none of them stops the first two steps: the second takes the study along as it stands, and the question is whether it stays.

Whether the study moves. It is the heaviest part and none of the three projects reads it, but the code's grounds are in it, and a repository without them states principles it cannot show the reason for.

How the closed-source client reaches the repository: made public, or given a key to read it.

How a change made while working inside a project travels back, which a submodule leaves to a commit in the arc's own repository.

*Open, 2026-09-14.*
