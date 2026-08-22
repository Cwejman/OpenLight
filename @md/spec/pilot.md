# Pilot

The first working instance of the substrate. A person opens a window, sees a space, mounts a component, runs a program, and what happened is preserved in the field. The pilot exists to prove that the substrate's self-description is sufficient — that an interface, a program, and a history can all be generated from what the field knows about itself, with no external configuration carrying the weight.

Though called "the pilot," this is **v0.1** — the seed that grows. Architecture is evergreen; feature scope is intentionally narrow. What's deferred is deferred *for shipping*, not for design — decisions made here shape what comes after, so the architecture accommodates horizon work without redesign even when that work stays out of v0.1.

This file carries only what is v0.1's own: what it establishes and defers, the pilot cut, the repo layout, and the build order. Every mechanism it once restated lives once, in the spec that owns it — the index is under *Specs* below. **What you run, and the home**, are [`chassis.md`](chassis.md)'s.

---

## What v0.1 Establishes

- **The self-describing field works.** A component's contract is its chunks; a program's contract is its body. The glue reads the field and produces the surface the person interacts with. Nothing is configured out-of-band — the chassis entry itself is field data.

- **Read is the mechanism.** Programs and components read the field by intersecting places. No snapshots, no manual tool calls for retrieval.

- **Boundaries are architectural.** Every act — a program's, a mount's, the interface's — is judged by the engine under one call context; reads reach what the boundary admits, writes land where it allows, uniformly.

- **Everything is traceable.** Chunk → commit → process → program. Any change walks back to the program that caused it and the person who ran it.

- **Drawing and running are decoupled, and both are field citizens.** What draws is a component — a declaration realized by code or by data; what runs is a headless program. A mount is a call as a process is a run; neither is configured outside the field.

- **The loop closes.** A person mounts a component, starts a program; the answer lands in the field; the next read stands on it.

## What v0.1 Defers

- **Peering beyond local read-only.** Write-mode attach of shared stores ships (branch + write); symmetric remote peering, identity/auth, sync, schema migration on attach, cross-engine reactivity are horizon ([`horizon.md`](../horizon.md)).

- **The VM.** `runtime-vm` is not in the first pilot: capabilities are declared, recorded, shown at Go — **not enforced** until the VM lands ([`engine.md`](engine.md), *Runtime providers*).

- **After the first pilot** (the brief's cut): prose · the drag layer (move/swap and WYSIWYG rearrangement ride it) · tabs and sidebar in the shell · lift · `GLBox` · code-creating mounts · generated types.

- **Services as first-class.** Daemons launch like any program (ruled); the resident lifecycle is deferred ([`engine.md`](engine.md), *Daemons*).

- **Derived chunks** — summaries, embeddings. The pattern works; generation is not in the loop.

- **Streaming** model responses — the posture is set: v0.1 is throttled partials on main; the buffer realization stays open ([`engine.md`](engine.md), *Buffers*).

- **Retention.** Nothing is pruned.

## The pilot cut

Engine as its own artefact + attach-era db (the attach record, `attach`/`detach`, `[engine/attached]`, engine-served sources) · `chassis-desktop` hosting `web-dom` (the entry, layers, reservations, the `--mount` shorthand) · `engine/sdk` and `view/sdk` with `solid()` · `component/base` (leaves, `list`, `split`, the faces, `FrameBox`) · `desktop/` (the entry, the shell template — the simple tiler — and `projects`) · reader · table · process · command · overlay · secrets · agents.

---

## The monorepo

```
db/                       the store
engine/                   coordination — its own installed artefact; engine/sdk = the protocol client   < db
view/                     the contract archetypes; view/sdk = the web-dom glue + adapters               < engine/sdk
runtime-vm/               the VM runtime provider (rust; not in the first pilot)                        < engine
secrets/                  stand-ins + read-secret (a module, not an integration)                        < engine
agent/                    facets: headless < engine · viewing < component/process, component/reader

component/base/           the base family: leaf components, layout primitives, faces, FrameBox
component/reader/         reader + reading, collation                      < base
component/table/          chunk-table, the list/table family              < base
component/process/        process-view + the draft face                   < base
component/prose/          (after the first pilot)                         < base
component/command/        the command menu and palette                    < (base | overlay)
component/overlay/        the anchored-presentation layer                 < base

desktop/                  the pilot's desktop module: the chassis entry, the shell template, sidebar, projects   < (base | …)
chassis-desktop/          rust binary: platform machinery; hosts web-dom; a client of engine; declares the entry contract
```

Each `component/*` package ships its component declarations, their payload archetypes, and their default implementations; a second package may implement the same declarations differently. **The dependency law [R]: declarations depend on declarations; implementations depend on declarations plus a surface kind; nothing ever depends on an implementation.** **A module is a store** — each line above is a store directory by the settled recognition (`.ol/` inside, db and toml within), the module's files beside it; dependency is attach ([`engine.md`](engine.md)).

Migration from the built tree: `host/react` → `component/base` · `host/programs/*` → `component/*`, `desktop/`, or retired · `host/` → `chassis-desktop` + `runtime-vm` · `engine/sdk` stays, `view/sdk` is new. The first pilot's TypeScript implementations were deleted outright (git history keeps them); they were never a source of truth. The spec is.

*Open — peering fragility (carried).* Cross-store references across evolving peers carry a fragility — when a peer advances, reads and validations can shift underneath in ways not yet fully reasoned about. The shape matures with use; read-only attachments are the narrow surface to learn from.

---

## Build Order

The spec phase is done — the tree was rewritten from the ratified brief (2026-08-22; the surface rewrite). What follows is implementation, spec-first at every step: code never advances past what the spec carries.

1. **The alignment pass, db + engine.** The built layer (db crate, engine ~6k lines, TS SDK) implements two spec generations ago; realign spec-first with fixtures rewritten from the new law (the board's tracked debt). The attach era and the artefact split land here — the engine becomes its own binary, the wire its only contract.

2. **`chassis-desktop` + `view/sdk` + `component/base`.** The chassis's hospitality, the glue's boot/resolve/subscribe, the `solid()` adapter, the base family. The first few components are also the ctx-ergonomics evaluation [R — resolve by making; the family does not scale before it].

3. **`desktop/`** — the entry, the shell template (the simple tiler), `projects`. The first end-to-end: boot into the home, mount a reader.

4. **The pilot components** — reader, table, process (the draft face), command, overlay.

5. **`secrets` + `agents`** — the model family, the agent, tools; run-to-draft live end-to-end.

Each step compiles on the one below; no design decisions are made in implementation that weren't already made in the spec — where a step can't reach its contract with the mechanisms as specced, that lands on the board's demand list, not in silence.

---

## Specs

Each spec is the single home for its subject; this file points, it does not restate.

- [`substrate.md`](substrate.md) — chunk, placement, the type vocabulary, commits, boundaries, the five connection kinds, names and roots, peers.

- [`db.md`](db.md) — implementation drawing of the Rust db, including the virtual places `db/commits` and `db/branches`.

- [`engine.md`](engine.md) — the artefact, stores and attach, the call context, expressions and the planner, boundaries, lifecycle, the protocol, reactivity, runtime providers.

- [`chassis.md`](chassis.md) — the platform binding: hospitality, the entry, the input floor, the home, flavors.

- [`sdk.md`](sdk.md) — `engine/sdk` (the protocol client, one transport object) and `view/sdk` as packages.

- [`view.md`](view.md), [`components.md`](components.md), [`desktop.md`](desktop.md) — the view contracts and glue, the component packages, the pilot environment.

- [`agent.md`](agent.md) — the model programs: `model` (one completion call per run, the only provider seam) and `agent` (the harness), split deliberately; and the lived experience of agent work.

- [`bootstrap.md`](bootstrap.md) — the seed data: the archetypes each first-party store ships.

## What Is Open

The design-level opens live in place in each spec, beside the mechanism each one qualifies — [`chassis.md`](chassis.md#what-is-open), [`engine.md`](engine.md#what-is-open), [`substrate.md`](substrate.md), [`sdk.md`](sdk.md#what-is-open), [`view.md`](view.md), [`components.md`](components.md), [`desktop.md`](desktop.md) and [`agent.md`](agent.md) marked in place. None of them block the pilot's structure; they need decisions as implementation reaches them. The current arc's ledgers are [`research/arc/selection.md`](research/arc/selection.md) §16 and [`research/arc/dimensions.md`](research/arc/dimensions.md) §8.
