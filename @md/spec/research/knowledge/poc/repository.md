---
under: the code
kind: brief
status: in force
---

# Its own repository

## 1. What moves, and how it is taken in

The whole arc moves, the code, the proof of concept and the study, with its history, since the code stands on the study and a history cut at the move would leave its grounds unreachable. Each project then takes the repository in as a git submodule: pinned at a commit, read in place by people and by sessions, and moved forward when the project chooses. A submodule is chosen over a subtree, which keeps no clear line back to one home, and over a package, which hands a session built files rather than the tree it reads.

OpenLight takes it in at the path it leaves, `@md/spec/research/knowledge`, so every link into it from OpenLight's own knowledge stays true.

*Reasoned, the author's direction, 2026-09-14; not yet lived in any of the three projects. Whether the study moves with the rest is open, beneath.*

## 2. What has to hold before it moves

Two things tie the arc to OpenLight today, and both are cut here first, so the move itself changes nothing but where the files live.

Three of the surface's briefs link to OpenLight's design language, above the arc. The few rules they use are either carried into the surface's own briefs or linked at OpenLight's published address.

The surface's dependency, marked, was resolved from OpenLight's workspace. The arc now carries a package file of its own, naming marked and the renderer sketching looks with, so both run wherever the repository is checked out. That tie is cut.

*Seen, by tracing the links that leave the arc, the study aside, and the dependency the surface imports, 2026-09-14; the package file was added the same day, for sketching.*

## 3. The steps, in order

The order is a claim like any other: each step stands on the ones before it.

1. Cut the two ties above, in OpenLight, and commit.
2. Make the repository from the arc's folder with `git filter-repo --subdirectory-filter @md/spec/research/knowledge`, so its history comes with it.
3. Take it back into OpenLight as a submodule at the same path, and read the arc with the surface from there to see nothing broke.
4. Take it into Hjulverkstan and the closed-source client, where the copy of `code.md` is replaced by the submodule.

*In force, 2026-09-14; images in the surface and sketching are taken up, and the move is next.*

## 4. What is not answered

Whether the study moves. It is the heaviest part and none of the three projects reads it, but the code's grounds are in it, and a repository without them states principles it cannot show the reason for.

How the closed-source client reaches the repository: made public, or given a key to read it. And how a change made while working inside a project travels back, which a submodule leaves to a commit in the arc's own repository.

*Open, 2026-09-14.*
