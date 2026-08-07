# OpenLight

![header](.img/header.png)

> Image from the first pilot (archived)

The way AI is used today is monolithic. A completion model is a closed function: assemble a prompt, pipe in whatever the session has become, hope. The context is crude — a linear transcript — and the results evaporate when the window closes. The model, the person, and ordinary programs live in three disjoint worlds, bridged by paste.

OpenLight is built on one claim: **completion should happen from a point in a field, not from a pasted transcript.** When knowledge lives as typed, versioned structure, a model's context is a place — addressable, reproducible, queryable — and its output lands back as structure the next reader stands on. This blows the completion model's interface to its surroundings open. The monolith becomes a citizen.

OpenLight is three things:

- **A substrate** — typed, version-controlled structure. Units of meaning with identity (chunks), placed into places; contracts the substrate enforces on write; every change a commit on a branch.
- **Programs** — the only unit of execution. A program reads places and writes commits inside an enforced boundary. Whether it renders a surface, touches a disk, or calls a model is what its body declares, not a different kind. Programs compose into new programs.
- **A host** — makes substrate plus programs an operating environment initially built of windows, tiles and tabs with a process/program sidebar, command palette and built in bundle of programs. The interface is purely built on programs itself.

A model-calling program reads the same typed structure a grep does (or any program of in the substrate), writes the same commits a human does, composes into the same surfaces. Human, classical program, and model in one typed, versioned medium — that bridge does not exist today. And because every write is a commit from a bounded process, trust is native rather than bolted on: boundaries before a run, inspection during, history after. Valuable — and secondary. The center is what completion from the field unlocks but it is of novel value even without models, just inherently expansive with them.

---

> Read in order. `@md/spec/` sub-specs and `@md/spec/research/` are reference depths — descend when work calls for them.

[`@md/spec/pilot.md`](@md/spec/pilot.md) and [`@md/spec/`](@md/spec/) — the substrate contract and the first end-to-end proof (v0.1). Mechanism: [`substrate.md`](@md/spec/substrate.md), [`db.md`](@md/spec/db.md), [`engine.md`](@md/spec/engine.md), [`host.md`](@md/spec/host.md), [`sdk.md`](@md/spec/sdk.md). Experience: [`programs.md`](@md/spec/programs.md), [`agent.md`](@md/spec/agent.md).

[`@md/conventions.md`](@md/conventions.md) — principles and working agreements. Short.

[`@md/board.md`](@md/board.md) — the working board: current state, the queue, gates awaiting rulings, tracked debt.

[`@md/log.md`](@md/log.md) — session narratives, newest first; the history the board stands on.

[`@md/horizon.md`](@md/horizon.md) — the vision beyond v0.1, by proximity and proof status.

[`@md/sketches.md`](@md/sketches.md) — mini-projects: small app ideas inside the environment, held open with their grounding.

[`@md/rework.md`](@md/rework.md) — the synthesis behind the current program layer: clean-room provenance, the demand list on the mechanism specs, decisions taken.

[`@md/spec/research/`](@md/spec/research/) — reference depth. [`@md/spec/research/cleanroom/`](@md/spec/research/cleanroom/) holds the three blind re-derivations the program layer was rebuilt from.

![footer](.img/footer.png)
