# OpenLight

![header](.img/header.png)

> Image from the first pilot (archived)

The way AI is used today is monolithic. A completion model is a closed function: assemble a prompt, pipe in whatever the session has become, hope. The context is crude — a linear transcript — and the results evaporate when the window closes. The model, the person, and ordinary programs live in three disjoint worlds, bridged by paste.

OpenLight is built on one claim: **completion should happen from a point in a field, not from a pasted transcript.** When knowledge lives as typed, versioned structure, a model's context is a scope — addressable, reproducible, queryable — and its output lands back as structure the next reader stands on. This blows the completion model's interface to its surroundings open. The monolith becomes a citizen.

OpenLight is three things:

- **A substrate** — typed, version-controlled structure. Units of meaning with identity (chunks), placed into scopes; contracts (specs) the substrate enforces on write; every change a commit on a branch.
- **Programs** — the only unit of execution. A program reads scopes and writes commits inside an enforced boundary. Whether it renders a surface, touches a disk, or calls a model is what its body declares, not a different kind. Programs compose into new programs.
- **A host** — makes substrate plus programs an operating environment initially built of windows, tiles and tabs with a process/program sidebar, command palette and built in bundle of programs. The interface is purely built on programs itself.

A model-calling program reads the same typed structure a grep does (or any program of in the substrate), writes the same commits a human does, composes into the same surfaces. Human, classical program, and model in one typed, versioned medium — that bridge does not exist today. And because every write is a commit from a bounded process, trust is native rather than bolted on: boundaries before a run, inspection during, history after. Valuable — and secondary. The center is what completion from the field unlocks but it is of novel value even without models, just inherently expansive with them.

---

> Read in order. `spec/` sub-specs and `spec/research/` are reference depths — descend when work calls for them.

[`spec/pilot.md`](spec/pilot.md) and [`spec/`](spec/) — the substrate contract and the first end-to-end proof (v0.1). Mechanism: [`substrate.md`](spec/substrate.md), [`db.md`](spec/db.md), [`engine.md`](spec/engine.md), [`host.md`](spec/host.md), [`sdk.md`](spec/sdk.md). Experience: [`programs.md`](spec/programs.md), [`agent.md`](spec/agent.md).

[`conventions.md`](conventions.md) — principles and working agreements. Short.

[`board.md`](board.md) — the working board: current state, the queue, gates awaiting rulings, tracked debt.

[`log.md`](log.md) — session narratives, newest first; the history the board stands on.

[`horizon.md`](horizon.md) — the vision beyond v0.1, by proximity and proof status.

[`sketches.md`](sketches.md) — mini-projects: small app ideas inside the environment, held open with their grounding.

[`rework.md`](rework.md) — the synthesis behind the current program layer: clean-room provenance, the demand list on the mechanism specs, decisions taken.

[`spec/research/`](spec/research/) — reference depth. [`spec/research/cleanroom/`](spec/research/cleanroom/) holds the three blind re-derivations the program layer was rebuilt from.

![footer](.img/footer.png)
