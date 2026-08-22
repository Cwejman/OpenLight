# OpenLight

![header](.img/header.png)

> Image from the first pilot (archived)

The way AI is used today is monolithic. A completion model is a closed function: assemble a prompt, pipe in whatever the session has become, hope. The context is crude — a linear transcript — and the results evaporate when the window closes. The model, the person, and ordinary programs live in three disjoint worlds, bridged by paste.

OpenLight is built on one claim: **completion should happen from a point in a field, not from a pasted transcript.** When knowledge lives as typed, versioned structure, a model's context is a place — addressable, reproducible, queryable — and its output lands back as structure the next reader stands on. This blows the completion model's interface to its surroundings open. The monolith becomes a citizen.

OpenLight is three things:

- **A substrate** — typed, version-controlled structure. Units of meaning with identity (chunks), placed into places; contracts the substrate enforces on write; every change a commit on a branch.
- **Programs** — the only unit of execution, and headless. A program reads places and writes commits inside an enforced boundary; whether it touches a disk or calls a model is what its body declares, not a different kind. Programs compose into new programs.
- **An interface that is itself field data** — what draws is a **component**: a declaration, realized by code or by data, mounted on a surface and judged like any call. The whole environment — the shell, the menus, even its own configuration — is components and chunks; a small platform binary (the **chassis**) hosts the surface, and the **engine**, its own installed artefact, coordinates everything against the substrate.

A model-calling program reads the same typed structure a grep does, writes the same commits a human does; its output composes into the same surfaces. Human, classical program, and model in one typed, versioned medium — that bridge does not exist today. And because every write is a commit from a bounded process, trust is native rather than bolted on: boundaries before a run, inspection during, history after. Valuable — and secondary. The center is what completion from the field unlocks — of novel value even without models, inherently expansive with them.

---

## Reading order

Each step stands on the ones before it; stop when you have what you came for.

1. **This page** — the claim and the three things.

2. [`@md/conventions.md`](@md/conventions.md) — how we work: principles, working agreements, the prose and audit disciplines. Short, and everything else is written under it.

3. [`@md/spec/pilot.md`](@md/spec/pilot.md) — what v0.1 is, proves, and defers; the monorepo; the build order. The map of the spec tree — read it before descending.

4. **The mechanism**, in dependency order — each file uses only what the ones before it define: [`substrate.md`](@md/spec/substrate.md) (the field's law: chunks, connections, types, boundaries) → [`engine.md`](@md/spec/engine.md) (running programs against it: stores and attach, the call context, expressions, lifecycle, the protocol) → [`chassis.md`](@md/spec/chassis.md) (the platform binding and the home) → [`sdk.md`](@md/spec/sdk.md) (the wire as client libraries). Implementation depth, when work calls for it: [`db.md`](@md/spec/db.md).

5. **The experience**, standing on the mechanism: [`view.md`](@md/spec/view.md) (components, mounts, the three selections, the glue) → [`components.md`](@md/spec/components.md) (the component packages and the design language) → [`desktop.md`](@md/spec/desktop.md) (the pilot environment) → [`agent.md`](@md/spec/agent.md) (the model programs and agent work) → [`bootstrap.md`](@md/spec/bootstrap.md) (what each store seeds).

6. [`@md/board.md`](@md/board.md) — where the work stands now: the queue, the gates, the debt. [`@md/log.md`](@md/log.md) — the session narratives it stands on, newest first.

7. **Beyond v0.1**: [`@md/horizon.md`](@md/horizon.md) (the vision, by proximity and proof status) · [`@md/sketches.md`](@md/sketches.md) (mini-projects held open with their grounding).

[`@md/spec/research/`](@md/spec/research/) is reference depth, not part of the order — exploration records and blind derivations the tree was built from; descend only when work calls for a decision's grounding.

![footer](.img/footer.png)
