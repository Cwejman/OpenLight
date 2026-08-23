# OpenLight

![header](.img/header.png)

> Image from the first pilot (archived)

Knowledge compounds by interconnection. A result that can be found, questioned, and stood on becomes the floor for the next one; what stays isolated must be re-derived, and that cost surfaces later — wherever insight fails to cross a boundary: between programs, between a person and their tools, between the roles of an organisation.

The systems that let independent parts build on each other did it with a shared medium and a simple join. Unix: text streams, joined by the pipe and the file. The web: the page, joined by the link. Both arrived with their potential whole; much of both was then walled into monoliths — applications that compose only inside their own frame, where you must grow large before anyone can build on you.

The way AI is used today is the newest monolith. Completion itself is a stateless function — it could be asked from any point — yet a session chains it to a context that only grows: a linear transcript, append-only, nowhere to step back to, no branch to take; compression and handover happen only by inference over the text itself. What survives is what gets deliberately written out; the trail that produced it — what was read, in what order, against which state — is not addressable or reproducible. The deficiency is one of kind: what survives is words, not structure.

OpenLight begins with a claim about this: **completion should happen from a point in a field, not from a pasted transcript.** When knowledge lives as typed, versioned structure, a model's context is a place — addressable, reproducible, queryable — and its output lands back as structure the next reader stands on. The monolith becomes a citizen.

**Text is not data.** This is where the Unix lineage ends: text makes every program re-parse what the last one meant, and OpenLight's **substrate** is typed against itself — contracts are chunks in the same field they govern, every change a commit on a branch — so structure is what a program *receives*, never what it recovers. That one fact is the lever, and it moves three things:

- **Programs compound.** A **program** — the only unit of execution, headless — carries its interface in its body: what it takes and what it produces, as types in the field. So composition is structural — a call is matched, never parsed — and one program's output is structure the next can stand on; attach a peer's store and its programs are usable at once. A model is such a program: its context a typed selection of the field, its output typed structure back into it. And that dissolves the harness as a separate technology — the field is a first-class harness to everything, every program a tool, every place a context, every run recorded — and a model simply thrives in it.

- **The interface builds on primitives, as data does.** What draws is a **component**: a declaration of what it takes, as a program declares what it takes. Build the small family — prose, tables, lists, badges, buttons — and you soon hold what composes everything else. Which components can draw a thing is a read of the field, so composition is first-class to everyone — a model reads the same contracts a person composes with directly, in place — and the walls between design tool, framework and running product fall, technically, not just in principle. The interface is not designed ahead of the data; it forms around what you are working with — the whole environment, shell and menus and its own configuration, is field data. Nobody has had this experience yet; it has to be built to be felt.

- **The field keeps everything.** Every write is a commit from a bounded process — boundaries before a run, inspection during, history after. Trust is native rather than bolted on; and the same lossless record is what lets the next reader, person or program or model, stand on exactly what the last one produced.

Human, classical program, and model in one typed, versioned medium — that bridge does not exist today. It is of novel value without models and inherently expansive with them. Further out, said lightly: knowledge is the first tenant, not the last — every domain the computer serves is walled the same way, and composes the same way once its material is field data. Prose leaves markdown for its native form; working with knowledge — or sound, or image, or with each other — stops being a tool you open and becomes a medium you inhabit. How far that reaches we do not fully see ourselves; the pilot is where it starts.

---

## Where it stands

The pilot — v0.1 — is specified: the spec tree was rewritten whole from the ratified surface brief (2026-08-22) and is under the author's ratification read; code follows the spec, the alignment of the built layer first. What is *not* settled is the thing this tree is made of. **How knowledge is best structured — for people and agents alike — is not cracked.** This repository is the experiment, and it shows: the specs are engineering-heavy, written in the order things are defined rather than the order they are understood. What we currently believe is held in [`@md/conventions.md`](@md/conventions.md), *Knowledge structure* — with a caveat that file states itself: it has grown steward-driven and awaits the author's turnover, as this entry received. This entry is written by the one rule we trust most — the why before the how.

## Reading order

Each step stands on the ones before it. Stop where your purpose is served: for the idea, 1–3 suffice; to build, 4 and 5; to continue the work, 6.

1. **This page** — the why, the claim, the three things.

2. [`@md/conventions.md`](@md/conventions.md) — how we work: principles, working agreements, the prose and audit disciplines, and what we hold about knowledge structure. Short, and everything else is written under it.

3. [`@md/spec/pilot.md`](@md/spec/pilot.md) — what v0.1 is, proves, and defers; the monorepo; the build order. The map of the spec tree — read it before descending.

4. **The mechanism**, in dependency order — each file uses only what the ones before it define: [`substrate.md`](@md/spec/substrate.md) (the field's law: chunks, connections, types, boundaries) → [`engine.md`](@md/spec/engine.md) (running programs against it: stores and attach, the call context, expressions, lifecycle, the protocol) → [`chassis.md`](@md/spec/chassis.md) (the platform binding and the home) → [`sdk.md`](@md/spec/sdk.md) (the wire as client libraries). Implementation depth, when work calls for it: [`db.md`](@md/spec/db.md).

5. **The experience**, standing on the mechanism: [`view.md`](@md/spec/view.md) (components, mounts, the three selections, the glue) → [`components.md`](@md/spec/components.md) (the component packages and the design language — its held judgment unpacked in [`design.md`](@md/spec/design.md)) → [`desktop.md`](@md/spec/desktop.md) (the pilot environment) → [`agent.md`](@md/spec/agent.md) (the model programs and agent work) → [`bootstrap.md`](@md/spec/bootstrap.md) (what each store seeds).

6. [`@md/board.md`](@md/board.md) — where the work stands now: the queue, the gates, the debt. [`@md/log.md`](@md/log.md) — the session narratives it stands on, newest first.

7. **Beyond v0.1**: [`@md/horizon.md`](@md/horizon.md) (the vision, by proximity and proof status) · [`@md/sketches.md`](@md/sketches.md) (mini-projects held open with their grounding).

[`@md/spec/research/`](@md/spec/research/) is reference depth, not part of the order — exploration records and blind derivations the tree was built from; descend only when work calls for a decision's grounding.

![footer](.img/footer.png)
