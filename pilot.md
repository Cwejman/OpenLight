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

A single SQLite-backed library. Chunks, placements, commits. See [`pilot/substrate.md`](pilot/substrate.md). Implementation at [`pilot/db/`](pilot/db/).

### The engine

Sits between the substrate and anything that would run against it. Creates a `process` chunk when a program is run, enforces boundaries, spawns the program's executable, mediates all substrate access the running program attempts. See [`pilot/engine.md`](pilot/engine.md).

Runs as a TypeScript subprocess the host spawns. Speaks JSON-lines over stdio — the same protocol running programs use to reach the field. When the engine is eventually rewritten in Rust (see [`horizon.md`](horizon.md)), the subprocess hop collapses; the protocol stays.

### The host

A native Rust process built on **tao** (windowing) and **wry** (webview) — the primitives Tauri is built on, used directly without the framework. Owns the window, tile geometry, webview lifecycles, IPC routing to the engine. Does not render UI. See [`pilot/host.md`](pilot/host.md).

### Programs

A program is a chunk whose body carries an `executable` path and an optional `surface` capability. Programs with `surface: 'dom'` are rendered in webviews the host mounts into tiles. Programs without a surface run in their own containment context and produce substrate writes.

A program is authored however its runtime allows — TSX + React for the first-party programs of the pilot, any WASM target or native executable later. The substrate doesn't care. The shebang on the program's executable determines how it runs.

### Transport

The program-to-engine protocol is a single JSON-lines shape with operations `scope`, `apply`, `run`, `await`. Programs reach the engine through whichever transport fits their runtime:

- **Programs in webviews** → wry IPC to the host → stdio to the engine subprocess (two hops for the pilot)
- **Programs running as subprocesses** → direct stdio to the engine (one hop)

The SDK hides which transport is active. `scope(ids)` feels local regardless.

---

## The Containment Fork

How programs are isolated from the host and from each other is an open architectural choice the pilot must resolve before shipping. Both paths are coherent and both use the same program/process/boundary primitives. The specs carry both.

**Split containment.** Programs that declare broad capabilities — network, filesystem, shell — run inside a lightweight Linux VM. Programs with only a surface (a read tile, the sidebar) run on the host inside their webviews. The webview sandbox and the engine's boundary enforcement together contain view-kind programs; the VM contains tool-kind programs.

**Uniform containment.** All programs run in one VM. Programs with a surface produce DOM; a thin shim in each host webview receives DOM operations streamed from the VM-side program and forwards user events back. The host composes tiles from these DOM surfaces. Tool programs work exactly as they already do.

The uniform path is architecturally cleaner — one containment model across the system, peer model clarifies to "a peer is a VM image." The split path is faster to build. See [`horizon.md`](horizon.md) for the full tradeoff.

The pilot chooses before the host is built. Neither choice changes the substrate or the program contract.

---

## Stack

TypeScript for engine and programs. Bun as the TypeScript runtime. `bun:sqlite` for the substrate. Rust (tao + wry) for the host. One compile-time seam between host and everything else; one runtime seam between the engine subprocess and programs.

### Directory

```
pilot/
  db/              — substrate library + CLI
  engine/          — dispatch, boundaries, program protocol, process lifecycle
  host/            — Rust shell (tao + wry). To be built.
  programs/        — first-party TSX programs. To be built.
  sdk/             — TS SDK imported by programs. To be built.
  bootstrap.ts     — seed script
  project/         — working project (once initialized)
    .ol/db         — the substrate database
    programs/      — program executables (claude, echo, and so on)
```

## Build Order

Substrate, engine, and bootstrap are aligned to the program/process model. What remains is everything above the engine.

1. **Host** — scaffold the Rust shell. Minimum to start: a window, one webview, an IPC bridge to the engine subprocess.
2. **SDK** — `mount`, `scope`, `apply`, `run`, `await`. Plus a small set of React hooks that read the substrate reactively (initial shape is a single `useScope`; this area is deliberately underexplored and will refine through use).
3. **First program: read tile.** Validates the host ↔ program ↔ SDK ↔ engine loop end-to-end.
4. **Sidebar, command palette, tab bar** — each a program with a surface.
5. **Program runner** — the program that renders input forms for running other programs. Handles type-driven argument construction.
6. **Claude program** — the agent.

---

## Specs

- [`pilot/substrate.md`](pilot/substrate.md) — chunk, placement, spec language, commits, queries. The primitive layer.
- [`pilot/engine.md`](pilot/engine.md) — program protocol, process lifecycle, boundary enforcement, containment.
- [`pilot/host.md`](pilot/host.md) — the native shell, tile geometry, IPC routing, the UI composition types, visual language.
- [`pilot/agent.md`](pilot/agent.md) — the claude agent expressed as a program.
- [`pilot/bootstrap.md`](pilot/bootstrap.md) — the seed data.

## What Is Open

Held in the specs rather than closed prematurely. These do not block the pilot's structure; they need decisions as implementation reaches them.

- **Containment model** — split vs uniform. Described above; fuller treatment in [`horizon.md`](horizon.md).
- **Tabs vs zoomable canvas.** The current design assumes tabs. Zoomable canvas is a substantive alternative direction; deferred.
- **Recipe referencing** — does a recipe bind specific programs, or declare slots the user fills on spawn?
- **Overlay anchor escalation** — how a program anchors an overlay above its own tile boundary. Related to write-boundary semantics.
- **Cross-workspace wrap policy** — when composing tiles into a container, what happens to children visible in other tabs.
- **Service lifecycle UX** — when a program is long-lived and mounted in multiple tiles, identity, termination, and display semantics.
- **Sidebar disambiguation** — visual scheme for multiple processes with the same program + args.
- **React hooks surface** — `useScope` is the current guess for reading. The full hook vocabulary will refine through building real programs.
- **Rust engine migration** — when to collapse the engine subprocess into an in-process library.
