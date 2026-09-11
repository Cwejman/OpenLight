# The substrate question

The widest of the claims is that the shape should be taken past prose, so that data and programs live in one medium and meet by matching contracts rather than by hand-written glue. What the field has actually tried to build, and what this folder therefore weighs, is the operational reading of that: a typed, versioned, permission-governed store. The substitution is argued in [what is being weighed](../claims.md) §5. Several lanes of the sweep tested whether that is buildable and whether anyone has built it. This brief holds five answers: the combination does not exist, the market went the other way, three things break when such a system runs, two arguments against it stand, and nobody holds the whole position.

## 1. Everything is built; the combination is not

Version control combined with knowledge structure is not novel: two products have shipped it since 2019. Permission expressed in the query language is not novel either; a mainstream database has done it for years. Immutable facts with time built in, content-addressed trees of rows merged like a repository, typed documents in a schema'd graph with commits — each ships, and several ship healthily.

What no system holds is the combination, and the interaction between contracts owned by whoever mints them and types that are themselves branched and versioned is where the literature is thinnest and the shipped systems all capitulate. The graveyard is the more useful half, because its causes repeat. [What is built, and what happened to the rest](built.md).

## 2. Plain files won, for a reason nobody predicted

The single most consequential commercial finding in the sweep is that local Markdown files became a competitive moat in 2026, because coding agents can read them. Obsidian shipped a database view layer whose own documentation says all the data still lives in the Markdown files, and made its AI play a command-line interface rather than an assistant in the app. Logseq shipped the opposite — a database rewrite making a database canonical rather than files — thirteen months late, into a market that had just re-valued what it gave up, and long-time users describe leaving because agents can no longer read their vault.

The field's own lesson is the most direct practical consequence in this folder: if your structure is not files, you must project to files as a first-class, two-way surface. *Observational, from a product census; the lesson is the agents' reading.*

## 3. Three things break when it runs

Schema change is the confessed unsolved problem: the one serious attempt abandoned its own approach mid-project, the theory proves the composition law you would need is unaffordable, and every system that survived schema change did it by forbidding things rather than by translating them.

Transitive permission has its cost stated in its own source paper, and a retrieval layer turned a latent problem into an actual one — the model did not create the oversharing, it enumerated what was already reachable. And deriving the interface from the data was tried at scale by six large engineering organisations, who converged independently on the same fix and hit the same wall. [What breaks](breaks.md).

## 4. Two arguments against it stand

The case against runs in three layers, and the serious one is not that structure is hard but that a typed substrate optimises for what programs receive while the binding constraint is what people can hold in their heads. That layer has an answer the evidence supports, and the answer concedes half of it: structure costs agency as an authoring tax and buys it as an inspection surface.

Two arguments have no answer in this material. A type rots silently while text rots loudly, so a structure decays and keeps answering. And if the structure premium is a tax on weak models, betting the substrate on it is betting against the trend line. [The case against](against.md).

## 5. Nobody holds the whole position, and its loneliest claim is losing in public

Every neighbour found holds two or three of these claims and rejects or ignores the rest; the combination appears nowhere as a single position. The loneliest claim is that text is not the right substrate, and it is actively losing an argument in public: the most-read recent writing on extending models argues that Markdown, shell and natural language beat typed tool schemas.

The trend line is the reason it matters. The mechanism by which people extend a model has moved twice in the direction of less structure — from plugins to written instructions, and from typed tool registries to folders of Markdown — and the commercial edge is heating at the same time, with a category of "context layer" companies that did not exist before spring 2025, while the custodians of the underlying claims move at research pace. If it moves a third time, the argument for a typed medium gets harder to make each year rather than easier. *Reasoned by one agent from a census whose search budget was exhausted before it began; absences in venture writing, academic venues and non-English material are unproven.*

What every figure above inherits — the sweep's conditions, whose marks these are, and what was never checked — is in [what this rests on](../ground.md).
