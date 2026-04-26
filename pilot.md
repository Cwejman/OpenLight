# Pilot

The first working instance of the substrate. A person opens a window, sees a space, runs a program, and what happened is preserved in the field. The pilot exists to prove that the substrate's self-description is sufficient — that an interface, a program, and a history can all be generated from what the field knows about itself, with no external configuration carrying the weight.

Four things make the pilot:

- **`db`** — the substrate library. Owns the database. Pure reads and writes.
- **`engine`** — mediates between the substrate and the programs that run against it. Creates processes, enforces boundaries, manages program lifecycle.
- **`host`** — the native shell. A window, tile geometry, webviews per program, IPC routing. Does not write UI.
- **`programs`** — everything else. A tile that reads a scope is a program. A tool that touches the filesystem is a program. A sidebar that lists what's in the session is a program. The claude agent is a program.

The unification of view and tool into one concept — the program — is what lets the interface be generated rather than designed. There is no separate category for UI elements.

---

## What the Pilot Is Proving

- **The self-describing field works.** A program's contract is its chunks. The host reads those chunks and produces the surface the user interacts with. Nothing is configured out-of-band.
- **Scope is the read mechanism.** Programs read the field by intersecting scopes. No snapshots, no manual tool calls for retrieval.
- **Boundaries are architectural.** A program running against the field sees only what its read boundary reaches, writes only where its write boundary allows. The engine enforces this uniformly.
- **Everything is traceable.** Chunk → commit → process → program. Any change the field underwent can be walked back to the program that caused it and the user who ran it.
- **Program and view are one.** The same mechanism creates a filesystem tool and a read-tile. Views declare a surface; tools don't. Both pass through the same lifecycle.
- **The loop closes.** A user opens a program. The program produces an answer. The answer is in the field. The next program reads from the field the previous one wrote.

## What the Pilot Sets Aside

- **Peering.** One database. Two root scopes (`engine` and `agent`) stand in for what a peered system would mount from multiple sources.
- **Services as first-class.** A long-lived program is a code pattern, not a substrate distinction.
- **Derived chunks** — summaries, embeddings. The pattern works; generation is not in the loop.
- **Temporal queries.** `--at <commit>` for time travel is possible against the current schema, not wired into the interface.
- **Shell language.** Programs are executables; the file's shebang determines its runtime.
- **Package management.**
- **Streaming** model responses. The agent loop buffers.
- **Retention.** Nothing is pruned.
- **WebGPU-capable views.** Views render DOM. Pixel/GPU surfaces are a direction in [`horizon.md`](horizon.md), not pilot scope.

---

## Architecture

### Three root scopes stand for three peers

- `engine` — runtime contracts. The `program` archetype, the `process` archetype, read-boundary, write-boundary. In a peered system, these would be mounted from the engine's own database.
- `ui` — interface contracts. `session`, `tab`, `tile`, `overlay`, `recipe`. In a peered system, these would come from the host module's database.
- `agent` — project work. Session types, concrete programs (tools, the agent), the user's own data. This is the project.

### The substrate (`db`)

A SQLite-backed Rust library. Chunks, placements, commits. See [`pilot/substrate.md`](pilot/substrate.md). Compiled into the host binary; not a separate process.

### The engine

Sits between the substrate and anything that would run against it. Creates a `process` chunk when a program is run, enforces boundaries, spawns the program's executable, mediates all substrate access the running program attempts. See [`pilot/engine.md`](pilot/engine.md).

A Rust library linked into the host. The host's wry IPC handlers and engine APIs call engine functions directly; subprocess programs reach the engine over stdio JSON-lines spawned and read by the engine. There is no engine subprocess, no inter-process hop between host and engine.

### The host

A native Rust process built on **tao** (windowing) and **wry** (webview) — the primitives Tauri is built on, used directly without the framework. Owns the window, tile geometry, webview lifecycles, and the wry IPC surface that webview programs reach. Links the engine and substrate as Rust libraries. Does not render UI. See [`pilot/host.md`](pilot/host.md).

### Programs

A program is a chunk whose body carries an `executable` path and an optional `surface` capability. Programs with `surface: 'dom'` are rendered in webviews the host mounts into tiles. Programs without a surface run in their own containment context and produce substrate writes.

A program is authored however its runtime allows — TSX + React for the first-party programs of the pilot, any WASM target or native executable later. The substrate doesn't care. The shebang on the program's executable determines how it runs.

### Transport

The program-to-engine protocol is a single JSON-lines shape with operations `scope`, `apply`, `run`, `await`. The shape is the same regardless of where a program runs; the transport differs:

- **Programs in webviews** — the SDK serializes to JSON, the host's wry IPC handler receives the message and calls the engine library directly. One hop, no subprocess between.
- **Programs as subprocesses** — the SDK writes JSON lines to stdout. The engine spawns the subprocess and reads its stdout, processing each line through the same op handlers.

The SDK hides which transport is active. `scope(ids)` feels local regardless.

---

## Containment

The pilot uses **split containment**. Programs that declare broad capabilities — network, filesystem, shell — run inside a lightweight Linux VM. Programs with only a surface (a read tile, the sidebar) run on the host inside their webviews. The webview sandbox and the engine's boundary enforcement contain view-kind programs together; the VM contains tool-kind programs. This is the simpler path, and putting capability-bearing programs in a VM gives the pilot the safety floor it needs to host agentic programs without inventing new mechanism.

The uniform alternative — every program in one VM with DOM streamed to host webviews — is architecturally cleaner but heavier engineering. It belongs on the horizon. See [`horizon.md`](horizon.md). The same program/process/boundary primitives serve both paths, so the migration stays reachable.

---

## Stack

Rust for the host, the engine, and the substrate — one binary, three crates in a workspace, `rusqlite` for the database. Bun + TypeScript for programs (the program runtime, not the engine runtime). The only runtime seam is between the host binary and program subprocesses; webview programs cross no process boundary to reach the substrate.

### Directory

```
pilot/
  db/              — Rust crate. Substrate library: chunks, placements, commits, FTS, spec language.
  engine/          — Rust crate. Process lifecycle, boundary enforcement, program protocol, run/await.
  host/            — Rust binary. tao + wry. Window, tile geometry, webview lifecycle, wry IPC surface.
                     Depends on db and engine; everything compiles to one executable.
  sdk/             — TS SDK imported by programs. Webview transport via wry IPC; subprocess transport via stdio.
  programs/        — first-party TSX programs.
  bootstrap.rs     — seed routine the host runs on a fresh project.
  project/         — working project (once initialized)
    .ol/db         — the substrate database
    programs/      — program executables (claude, echo, and so on)
```

The TS db and engine implementations under their current paths remain as the porting oracle: the Rust ports are validated by running both side by side and diffing outputs against the existing 129-test suite. Once parity holds, the TS sources retire.

## Build Order

The implemented foundation is drawn whole in `.md` before any of it is coded. The substrate's outward face is already settled, so its conceptual spec can be audited in isolation — but its *implementation drawing* (how the Rust db actually works, both contracts) is its own document. Engine, host, and SDK are mutually-defining and grow as one holistic drawing.

The rule across the spec phase: implementation drawings are derived from the inside — the conceptual spec, plus Rust and SQLite and tao and wry as materials — outward. The existing TypeScript implementation is a **correctness oracle** for the port (it verifies behavior, diff outputs against it). It is not a **design oracle** the Rust copies from. Reading TS to translate it would be outside-to-outside; reading the spec and writing Rust-natural code is inside-out.

**Spec phase — draw the foundation holistically.**

1. **Substrate component.**
   - **1a.** Audit [`pilot/substrate.md`](pilot/substrate.md) for gaps in the two contracts: consumer ↔ db (the program-facing operations and types), db ↔ sqlite (the schema, indexes, FTS, transaction discipline). Mostly there; small audit.
   - **1b.** Write a new [`pilot/db.md`](pilot/db.md) — top-to-bottom drawing of how the Rust db actually works. Derived from the substrate spec, Rust idiom, and SQLite idiom. Holistic, not transliterated from the TS source.
2. **Foundation spec — engine, host, SDK as one drawing.** Grow [`pilot/engine.md`](pilot/engine.md), [`pilot/host.md`](pilot/host.md), and a new [`pilot/sdk.md`](pilot/sdk.md) together, cross-referencing. Settle: the program protocol shape, the host's IPC dispatch surface, the engine API the host calls, the reactivity mechanism end-to-end, the real run/await mechanics. Each contract appears in two specs at once and must read consistent across them. Done when no question remains about what any side does or what it exposes to the others.

**Implementation phase — code from the settled drawings.**

3. **Code the db** from [`pilot/db.md`](pilot/db.md). TS suite as correctness oracle.
4. **Code the engine** from [`pilot/engine.md`](pilot/engine.md). TS suite as correctness oracle.
5. **Scaffold host** — tao + wry, window, one webview, the wry IPC handler dispatching to the engine library.
6. **Draft SDK** — TypeScript, two transports behind one surface.
7. **First program: read tile.** Validates the webview ↔ host ↔ engine ↔ db loop end-to-end.
8. **Remaining first-party programs** — sidebar, command palette, tab bar, program runner, claude.

The implementation order in 3–6 is sequential because each layer compiles on the one below, but they were drawn as one piece — no design decisions are made in implementation that weren't already made in the spec phase.

---

## Specs

- [`pilot/substrate.md`](pilot/substrate.md) — chunk, placement, spec language, commits, queries. The primitive layer (concept, two contracts).
- [`pilot/db.md`](pilot/db.md) — implementation drawing of the Rust db. Top-to-bottom, derived holistically from the substrate spec. To be written.
- [`pilot/engine.md`](pilot/engine.md) — program protocol, process lifecycle, boundary enforcement, containment.
- [`pilot/host.md`](pilot/host.md) — the native shell, tile geometry, IPC dispatch, the UI composition types, visual language.
- [`pilot/sdk.md`](pilot/sdk.md) — the program-facing surface. Two transports (wry IPC, stdio), one API. To be written.
- [`pilot/agent.md`](pilot/agent.md) — the claude agent expressed as a program.
- [`pilot/bootstrap.md`](pilot/bootstrap.md) — the seed data.

## What Is Open

Held in the specs rather than closed prematurely. These do not block the pilot's structure; they need decisions as implementation reaches them.

- **Recipe referencing** — does a recipe bind specific programs, or declare slots the user fills on spawn?
- **Overlay anchor escalation** — how a program anchors an overlay above its own tile boundary. Related to write-boundary semantics.
- **Cross-workspace wrap policy** — when composing tiles into a container, what happens to children visible in other tabs.
- **Service lifecycle UX** — when a program is long-lived and mounted in multiple tiles, identity, termination, and display semantics.
- **Sidebar disambiguation** — visual scheme for multiple processes with the same program + args.
- **React hooks surface** — `useScope` is the current guess for reading. The full hook vocabulary will refine through building real programs.
