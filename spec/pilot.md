# Pilot

The first working instance of the substrate. A person opens a window, sees a space, runs a program, and what happened is preserved in the field. The pilot exists to prove that the substrate's self-description is sufficient — that an interface, a program, and a history can all be generated from what the field knows about itself, with no external configuration carrying the weight.

Though called "the pilot," this is **v0.1** — the seed that grows. Architecture is evergreen; feature scope is intentionally narrow. What's deferred is deferred *for shipping*, not for design — decisions made here shape what comes after, so the architecture is built to accommodate horizon work without redesign even when that work itself stays out of v0.1.

This file carries only what is v0.1's own: what it establishes and defers, how a project declares its mounts, the repo layout, and the order it gets built in. Every mechanism it once restated lives once, in the spec that owns it — the index is under *Specs* below.

---

## What v0.1 Establishes

- **The self-describing field works.** A program's contract is its chunks. The host reads those chunks and produces the surface the user interacts with. Nothing is configured out-of-band.
- **Read is the mechanism.** Programs read the field by intersecting places. No snapshots, no manual tool calls for retrieval.
- **Boundaries are architectural.** A program running against the field sees only what its read boundary reaches, writes only where its write boundary allows. The engine enforces this uniformly.
- **Everything is traceable.** Chunk → commit → process → program. Any change the field underwent can be walked back to the program that caused it and the user who ran it.
- **Program and view are one.** The same mechanism creates a filesystem tool and a read-tile. Views declare `runtime: 'webview'`; tools declare `runtime: 'vm'`. Both pass through the same lifecycle.
- **The loop closes.** A user opens a program. The program produces an answer. The answer is in the field. The next program reads from the field the previous one wrote.

## What v0.1 Defers

- **Peering beyond local read-only.** Symmetric (read/write) mounts, remote (network) mounts, identity/auth, sync, package merging into the VM image, schema migration on peer mount, cross-host reactivity, place-filtered mounts. v0.1 ships read-only filesystem-local mounts; the boundary mechanism already carries the model for symmetric peering. Detail and direction in [`horizon.md`](../horizon.md).
- **Services as first-class.** A long-lived program is a code pattern, not a substrate distinction.
- **Derived chunks** — summaries, embeddings. The pattern works; generation is not in the loop.
- **Temporal queries.** `--at <commit>` for time travel is possible against the current schema, not wired into the interface.
- **Shell language.** Programs are executables; the file's shebang determines its runtime.
- **Streaming** model responses. The agent loop buffers.
- **Retention.** Nothing is pruned.
- **WebGPU-capable views.** Views render DOM. Pixel/GPU surfaces are a direction in [`horizon.md`](../horizon.md), not v0.1 scope.

---

## Multi-project mounts

A host launches with one **active project** (read-write) and one or more **mounts** (read-only — other projects on the local filesystem). The mounts file declares them deliberately; there is no implicit mounting. Declarations live in `.ol/project.toml`:

```toml
[project]
name = "agents"

[[mounts]]
path = "../host"
branch = "main"

[[mounts]]
path = "../engine"
branch = "main"
```

Branches pin versions — track `main` to follow upstream, name a stable branch (`v1.2.3`) for predictability. A future `commit` field would route queries through db's existing `at` parameter for frozen snapshots.

How the cascade is walked, which mounts are mandatory, and what boot refuses: [`host.md`](host.md#boot-sequence). What a mount contributes to the field, and how reads, boundary walks and read-only enforcement federate across mounts: [`engine.md`](engine.md#engine-api-callable-from-the-host).

**Open: peering fragility.** Cross-mount references across evolving peers carry a fragility — when a peer advances, the active project's reads and validations can shift underneath it in ways that aren't yet fully reasoned about. The shape of this needs to mature with use; v0.1's read-only filesystem-local mounts are the narrow surface from which to learn.

---

## Stack

Rust for the host, the engine, and the substrate — one binary, three crates in a workspace, `rusqlite` for the database. TypeScript for the SDK and programs. The only runtime seam is between the host binary and VM-program processes (spawned inside the VM); webview programs cross no process boundary to reach the substrate via wry IPC.

### Directory

The repo's first-party projects each live as a top-level directory. Rust crates that ship substrate content also have their own `.ol/` (their bootstrap commits live there). Code-only crates have no `.ol/` in v0.1.

```
db/                  — Rust crate. Substrate library (chunks, placements, commits,
                       FTS, spec language). Code-only; no .ol/ in v0.1.

engine/              — Rust crate. Engine library (process lifecycle, boundary
                       enforcement, program protocol, runtime registry).
  src/               — Rust source.
  sdk/               — TypeScript SDK package (@openlight/sdk). Runtime-agnostic
                       substrate access — programs in any TS-capable runtime
                       import the same surface; transport is auto-detected at
                       module load (window.__wry_ipc → wry; process.stdin → stdio).
  .ol/
    db               — the engine project's substrate database
    project.toml     — engine project config

host/                — Rust binary. tao + wry. Window, tile geometry, webview
                       lifecycle, wry IPC surface, the VM and webview runtime
                       providers. Depends on db and engine crates.
  src/               — Rust source.
  react/             — TypeScript UI library (React components, hooks like
                       useRead). Used by webview programs that the host renders.
                       Lives here for v0.1; may extract later.
  programs/          — first-party programs the host ships (sidebar, tab-bar,
                       palette, form, read-tile → reader, process-view, …).
                       The frame machinery itself — window, tiling,
                       background — is host-native.
  .ol/
    db               — the host project's substrate database
    project.toml     — host project config

agents/              — first user-facing project for v0.1. The agent program
                       and tool programs live here; this is what the host opens
                       as its active project for the demo.
  programs/          — claude, echo, filesystem, shell, web.
  .ol/
    db               — the agents project's substrate database
    project.toml     — declares mounts on host and engine projects
```

`bootstrap.rs` (seed routines) lives inside whichever crate runs them; each project's bootstrap is its own concern (see [`bootstrap.md`](bootstrap.md)).

The first pilot's TypeScript implementations were deleted outright (git history keeps them); they were never a source of truth. The spec is. Rust impl flows from the spec; tests verify against the spec.

---

## Build Order

The implemented foundation is drawn whole in `.md` before any of it is coded. The substrate's outward face is already settled, so its conceptual spec can be audited in isolation — but its *implementation drawing* (how the Rust db actually works, both contracts) is its own document. Engine, host, and SDK are mutually-defining and grow as one holistic drawing.

The rule across the spec phase: implementation drawings are derived from the inside — the conceptual spec, plus Rust and SQLite and tao and wry as materials — outward. Inside-out: the spec defines, the implementation flows.

**Spec phase — draw the foundation holistically.**

1. **Substrate component.**
   - **1a.** Audit [`substrate.md`](substrate.md) for gaps in the two contracts: consumer ↔ db (the program-facing operations and types), db ↔ sqlite (the schema, indexes, FTS, transaction discipline). Mostly there; small audit.
   - **1b.** Write a new [`db.md`](db.md) — top-to-bottom drawing of how the Rust db actually works. Derived holistically from the substrate spec, Rust idiom, and SQLite idiom.
2. **Foundation spec — engine, host, SDK as one drawing.** Grow [`engine.md`](engine.md), [`host.md`](host.md), and a new [`sdk.md`](sdk.md) together, cross-referencing. Settle: the program protocol shape, the host's IPC dispatch surface, the engine API the host calls, the reactivity mechanism end-to-end, the real run/await mechanics. Each contract appears in two specs at once and must read consistent across them. Done when no question remains about what any side does or what it exposes to the others.

**Implementation phase — code from the settled drawings.**

3. **Code the db crate** from [`db.md`](db.md).
4. **Code the engine crate** from [`engine.md`](engine.md), including `engine/sdk/` (the runtime-agnostic TypeScript package).
5. **Scaffold host** — tao + wry, window, one webview, the wry IPC handler dispatching to the engine library; the mounts cascade walk; VM and webview runtime providers; `host/ui/` React library scaffold.
6. **First program: read tile.** Validates the webview ↔ host ↔ engine ↔ db loop end-to-end.
7. **Remaining first-party host programs** — sidebar, tab-bar, command-palette, launch, inspector.
8. **Agents project** — claude, echo, and tool programs (filesystem, shell, web). Active-project demo working end-to-end.

The implementation order in 3–6 is sequential because each layer compiles on the one below, but they were drawn as one piece — no design decisions are made in implementation that weren't already made in the spec phase.

---

## Specs

Each spec is the single home for its subject; this file points, it does not restate.

- [`substrate.md`](substrate.md) — chunk, placement, spec language, commits, queries, the five connection kinds, names and roots, peers. The primitive layer (concept, two contracts).
- [`db.md`](db.md) — implementation drawing of the Rust db, including the virtual places `db/commits` and `db/branches`. Top-to-bottom, derived holistically from the substrate spec.
- [`engine.md`](engine.md) — program protocol, process lifecycle, boundary enforcement, federation across mounts, containment.
- [`host.md`](host.md) — the native shell, boot sequence and the mounts cascade walk, tile geometry, IPC dispatch, the UI composition types, visual language.
- [`sdk.md`](sdk.md) — the program-facing surface. Two transports (wry IPC, stdio), one API.
- [`programs.md`](programs.md) — the actual programs: the catalog, per-program contracts, the interface concretely (sidebar, palette, `form`, `reader`, `process-view`).
- [`agent.md`](agent.md) — the model programs: `model` (one completion call per run, the only provider seam) and `agent` (the harness), split deliberately; and the lived experience of agent work.
- [`bootstrap.md`](bootstrap.md) — the seed data: the archetypes each first-party project ships.

## What Is Open

The design-level opens live in place in each spec, beside the mechanism each one qualifies — [`host.md`](host.md#what-is-open), [`engine.md`](engine.md#what-is-open), [`substrate.md`](substrate.md), [`sdk.md`](sdk.md#what-is-open), [`programs.md`](programs.md) and [`agent.md`](agent.md) marked in place. None of them block the pilot's structure; they need decisions as implementation reaches them. The current arc's ledgers are [`research/arc/selection.md`](research/arc/selection.md) §16 and [`research/arc/dimensions.md`](research/arc/dimensions.md) §8.
