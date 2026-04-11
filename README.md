# OpenLight

![header](.img/header.png)

A substrate for knowledge, computation, and navigation. One primitive — the chunk — with placement, atomic history, and spec enforcement. Any reader (human, agent, browser, shell, website) navigates the same structure.

The *why*, the values, and the visions this work is listening for live in **[`inside.md`](inside.md)**. Read that first — it orients everything else in this repo, and every mechanism is checked against it.

The working build — substrate library, UI, invocables, the agent loop — lives in **[`pilot.md`](pilot.md)** and the `pilot/` directory. Pilot-level mechanism (the substrate contract, the interface exploration) sits alongside the code it shapes.

Everything else is research, scaffolding, or preserved prior work.

## Files `📄`

- [`inside.md`](inside.md) — values and visions, inside-out. Load-bearing orientation; mechanism is checked against this.
- [`pilot.md`](pilot.md) — pilot spec: substrate + UI + invocables, end-to-end proof.
- `pilot/` — pilot implementation (TypeScript + Bun).
  - [`substrate.md`](pilot/substrate.md) — substrate contract as the pilot implements it: chunk, placement, schema, archetypes, peers.
  - [`interface.md`](pilot/interface.md) — interface layer exploration: scope-based window management, UI from type contracts. Forming.
  - `ol/` — substrate library and CLI.
- `research/` — ecosystem research and reference material.
  - `agent-research.md` — agent architecture, API formats, tools, containment.
  - `shell-research.md` — declarative model, atomic filesystems, stress tests, biology mapping.
  - `landscape.md` — what other systems do, what's unique here.
  - `icm-clief-notes.md` — Jake Van Clief's Interpretable Context Methodology.
  - `inventors/` — portraits of software inventors whose work mirrors (and, in places, refuses) the values in `inside.md`.
  - `inside-findings.md` — audit trail for `inside.md`: git history mining, lineage to the-strange-of-agi. Scaffolding, not primary reading.
- `archive/` — previous work: Zig CLI, Go TUI browser, shell exploration. Preserved for reference.

![footer](.img/footer.png)
