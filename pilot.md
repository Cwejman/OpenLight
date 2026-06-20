# Pilot

The first working instance of the substrate. A person opens a window, sees a space, runs a program, and what happened is preserved in the field. The pilot exists to prove that the substrate's self-description is sufficient — that an interface, a program, and a history can all be generated from what the field knows about itself, with no external configuration carrying the weight.

Four things make the pilot:

- **`db`** — the substrate library. Owns the database. Pure reads and writes.
- **`engine`** — mediates between the substrate and the programs that run against it. Creates processes, enforces boundaries, manages program lifecycle.
- **`host`** — the native shell. A window, tile geometry, webviews per program, IPC routing. Does not write UI.
- **`programs`** — everything else. A tile that reads a scope is a program. A tool that touches the filesystem is a program. A sidebar that lists what's in the session is a program. The claude agent is a program.

The unification of view and tool into one concept — the program — is what lets the interface be generated rather than designed. There is no separate category for UI elements.

Though called "the pilot," this is **v0.1** — the seed that grows. Architecture is evergreen; feature scope is intentionally narrow. What's deferred is deferred *for shipping*, not for design — decisions made here shape what comes after, so the architecture is built to accommodate horizon work without redesign even when that work itself stays out of v0.1.

---

## What v0.1 Establishes

- **The self-describing field works.** A program's contract is its chunks. The host reads those chunks and produces the surface the user interacts with. Nothing is configured out-of-band.
- **Scope is the read mechanism.** Programs read the field by intersecting scopes. No snapshots, no manual tool calls for retrieval.
- **Boundaries are architectural.** A program running against the field sees only what its read boundary reaches, writes only where its write boundary allows. The engine enforces this uniformly.
- **Everything is traceable.** Chunk → commit → process → program. Any change the field underwent can be walked back to the program that caused it and the user who ran it.
- **Program and view are one.** The same mechanism creates a filesystem tool and a read-tile. Views declare `runtime: 'webview'`; tools declare `runtime: 'vm'`. Both pass through the same lifecycle.
- **The loop closes.** A user opens a program. The program produces an answer. The answer is in the field. The next program reads from the field the previous one wrote.

## What v0.1 Defers

- **Peering beyond local read-only.** Symmetric (read/write) mounts, remote (network) mounts, identity/auth, sync, package merging into the VM image, schema migration on peer mount, cross-host reactivity, scope-filtered mounts. v0.1 ships read-only filesystem-local mounts; the boundary mechanism already carries the model for symmetric peering. Detail and direction in [`horizon.md`](horizon.md).
- **Services as first-class.** A long-lived program is a code pattern, not a substrate distinction.
- **Derived chunks** — summaries, embeddings. The pattern works; generation is not in the loop.
- **Temporal queries.** `--at <commit>` for time travel is possible against the current schema, not wired into the interface.
- **Shell language.** Programs are executables; the file's shebang determines its runtime.
- **Streaming** model responses. The agent loop buffers.
- **Retention.** Nothing is pruned.
- **WebGPU-capable views.** Views render DOM. Pixel/GPU surfaces are a direction in [`horizon.md`](horizon.md), not v0.1 scope.

---

## Architecture

### Names and roots

A **root scope** is a chunk with no `instance` parent. By convention, a project intended as a mountable peer has one root named after itself, so absolute names like `engine/program` read cleanly. The substrate permits any structure; a db can hold any number of roots.

Absolute names walk the instance chain: `engine/program` is shorthand for the chunk `program` placed `instance` on the chunk `engine`. Mounting doesn't add a layer — a root in a mounted db stays a root.

A scope query returns everything placed on the scope — `instance` (typed membership) and `relates` (association). Same-named chunks in separate placement trees are separate chunks; the host disambiguates visually when names collide across mounts.

Two virtual scopes appear per db: `db/commits` (the commit graph) and `db/branches` (the branch list). The `db/` prefix is reserved for substrate-machinery virtual scopes.

The pilot's first-party projects ship the system's archetypes:

- **`engine`** — `engine/program`, `engine/process`, read/write-boundary, and `engine/mount` (instances synthesized at query time from the live registry).
- **`host`** — `host/session`, `host/tab`, `host/tile`, `host/overlay`, `host/recipe`.
- **`agents`** — first-party active project for v0.1. Its own scopes (the agent program, tool programs, the agent's working sessions). Invocables placed `instance` on `engine/program`; sessions placed `instance` on `host/session`. Placements live in the agents project's db; archetypes live in the mounted engine and host dbs. Other active projects, by users or for other purposes, follow the same pattern.

### Multi-project mounts

A host launches with one **active project** (read-write) and one or more **mounts** (read-only — other projects on the local filesystem). At minimum the host and engine projects must be mounted; the mounts file declares them deliberately, no implicit mounting. Boot-time validation refuses a half-loaded state — every placement in the active project's db must have its `scope_id` resolve in some mount, or the host errors clearly with the list of unresolved references.

Mount declarations live in `.ol/project.toml`:

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

Mounts cascade transitively, deduplicated by canonical path; cycles rejected. Branches pin versions — track `main` to follow upstream, name a stable branch (`v1.2.3`) for predictability. A future `commit` field would route queries through db's existing `at` parameter for frozen snapshots.

**Open: peering fragility.** Cross-mount references across evolving peers carry a fragility — when a peer advances, the active project's reads and validations can shift underneath it in ways that aren't yet fully reasoned about. The shape of this needs to mature with use; v0.1's read-only filesystem-local mounts are the narrow surface from which to learn.

A mount contributes its substrate (federated read-only into the field), its invocables (peer filesystem mounted at `/peers/<id>/` inside the active project's VM), and its archetypes. Federation lives at the engine layer: reads and boundary walks across all mounts, reactivity from the active project only — read-only mounts have no in-process writer in v0.1. Writes referencing a chunk in a read-only mount return `READ_ONLY_MOUNT`. See [`engine.md`](engine.md) for federation mechanics.

**Sharing scopes across projects.** The archetype is the unification point. Place `instance` on a shared archetype defined in a peer everyone mounts — instances from every mounting project surface together in queries against it. Place on your own archetype to isolate. This is the mechanism `engine/program` already uses: every project's invocables are placed there and discoverable across the field.

What v0.1's mounts don't yet support: read-write across mounts, remote (network) mounts, identity verification, sync, package merging into the VM image, schema migration on peer mount, cross-host reactivity, scope-filtered mounts. See [`horizon.md`](horizon.md).

### The substrate (`db`)

A SQLite-backed Rust library. Chunks, placements, commits. See [`pilot/substrate.md`](pilot/substrate.md). Compiled into the host binary; not a separate process.

### The engine

Sits between the substrate and anything that would run against it. Creates a `process` chunk when a program is run, enforces boundaries, spawns the program's executable, mediates all substrate access the running program attempts. See [`pilot/engine.md`](pilot/engine.md).

A Rust library linked into the host. The host's wry IPC handlers and engine APIs call engine functions directly; VM programs reach the engine over stdio JSON-lines spawned and read by the engine. There is no separate engine process, no inter-process hop between host and engine.

### The host

A native Rust process built on **tao** (windowing) and **wry** (webview) — the primitives Tauri is built on, used directly without the framework. Owns the window, tile geometry, webview lifecycles, and the wry IPC surface that webview programs reach. Links the engine and substrate as Rust libraries. Does not render UI. See [`pilot/host.md`](pilot/host.md).

### Programs

A program is a chunk whose body carries an `executable` path and a `runtime` declaration. Programs with `runtime: 'webview'` are rendered in webviews the host mounts into tiles. Programs with `runtime: 'vm'` run inside the active project's Linux VM (with shebang-declared interpreter) — programs declared in mounted projects spawn from their peer FS mount inside the same VM.

A program is authored however its runtime allows — TSX + React for the first-party programs of the pilot, any WASM target or native executable later. The substrate doesn't care. The shebang on the program's executable determines how it runs.

### Transport

The program-to-engine protocol is a single JSON-lines shape — see [`engine.md`](pilot/engine.md) for the full operation set. The shape is the same regardless of where a program runs; the transport differs:

- **Webview programs** — the SDK serializes to JSON, the host's wry IPC handler receives the message and calls the engine library directly. One hop, no extra process between.
- **VM programs** — the SDK writes JSON lines to stdout. The engine spawns the program inside its VM and reads its stdout, processing each line through the same op handlers.

The SDK hides which transport is active. `scope(ids)` feels local regardless.

---

## Containment

v0.1 uses **split containment**. `runtime: 'vm'` programs run inside the active project's Linux VM (the substrate's containment for capability-bearing programs); peer projects' filesystems are mounted read-only at `/peers/<project-id>/` so peer-defined invocables run from their mounted paths within the same VM. `runtime: 'webview'` programs (a read tile, the sidebar) run on the host inside their webviews. The webview sandbox and the engine's boundary enforcement contain webview programs together; the VM contains VM programs. This is the simpler path, and putting capability-bearing programs in a VM gives v0.1 the safety floor it needs to host agentic programs without inventing new mechanism.

The uniform alternative — every program in one VM with DOM streamed to host webviews — is architecturally cleaner but heavier engineering. It belongs on the horizon. See [`horizon.md`](horizon.md). The same program/process/boundary primitives serve both paths, so the migration stays reachable.

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
  ui/                — TypeScript UI library (React components, hooks like
                       useScope). Used by webview programs that the host renders.
                       Lives here for v0.1; may extract later.
  programs/          — first-party programs the host runs at boot
                       (sidebar, tab-bar, command-palette, dispatcher, read-tile).
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

`bootstrap.rs` (seed routines) lives inside whichever crate runs them; each project's bootstrap is its own concern (see [`pilot/bootstrap.md`](pilot/bootstrap.md)).

The TypeScript implementations under `pilot/db/` and `pilot/engine/` are legacy archive from earlier evolutions, not a source of truth. The spec is. Rust impl flows from the spec; tests verify against the spec.

## Build Order

The implemented foundation is drawn whole in `.md` before any of it is coded. The substrate's outward face is already settled, so its conceptual spec can be audited in isolation — but its *implementation drawing* (how the Rust db actually works, both contracts) is its own document. Engine, host, and SDK are mutually-defining and grow as one holistic drawing.

The rule across the spec phase: implementation drawings are derived from the inside — the conceptual spec, plus Rust and SQLite and tao and wry as materials — outward. Inside-out: the spec defines, the implementation flows.

**Spec phase — draw the foundation holistically.**

1. **Substrate component.**
   - **1a.** Audit [`pilot/substrate.md`](pilot/substrate.md) for gaps in the two contracts: consumer ↔ db (the program-facing operations and types), db ↔ sqlite (the schema, indexes, FTS, transaction discipline). Mostly there; small audit.
   - **1b.** Write a new [`pilot/db.md`](pilot/db.md) — top-to-bottom drawing of how the Rust db actually works. Derived holistically from the substrate spec, Rust idiom, and SQLite idiom.
2. **Foundation spec — engine, host, SDK as one drawing.** Grow [`pilot/engine.md`](pilot/engine.md), [`pilot/host.md`](pilot/host.md), and a new [`pilot/sdk.md`](pilot/sdk.md) together, cross-referencing. Settle: the program protocol shape, the host's IPC dispatch surface, the engine API the host calls, the reactivity mechanism end-to-end, the real run/await mechanics. Each contract appears in two specs at once and must read consistent across them. Done when no question remains about what any side does or what it exposes to the others.

**Implementation phase — code from the settled drawings.**

3. **Code the db crate** from [`pilot/db.md`](pilot/db.md).
4. **Code the engine crate** from [`pilot/engine.md`](pilot/engine.md), including `engine/sdk/` (the runtime-agnostic TypeScript package).
5. **Scaffold host** — tao + wry, window, one webview, the wry IPC handler dispatching to the engine library; the mounts cascade walk; VM and webview runtime providers; `host/ui/` React library scaffold.
6. **First program: read tile.** Validates the webview ↔ host ↔ engine ↔ db loop end-to-end.
7. **Remaining first-party host programs** — sidebar, tab-bar, command-palette, dispatcher.
8. **Agents project** — claude, echo, and tool programs (filesystem, shell, web). Active-project demo working end-to-end.

The implementation order in 3–6 is sequential because each layer compiles on the one below, but they were drawn as one piece — no design decisions are made in implementation that weren't already made in the spec phase.

---

## Specs

- [`pilot/substrate.md`](pilot/substrate.md) — chunk, placement, spec language, commits, queries. The primitive layer (concept, two contracts).
- [`pilot/db.md`](pilot/db.md) — implementation drawing of the Rust db. Top-to-bottom, derived holistically from the substrate spec.
- [`pilot/engine.md`](pilot/engine.md) — program protocol, process lifecycle, boundary enforcement, containment.
- [`pilot/host.md`](pilot/host.md) — the native shell, tile geometry, IPC dispatch, the UI composition types, visual language.
- [`pilot/sdk.md`](pilot/sdk.md) — the program-facing surface. Two transports (wry IPC, stdio), one API.
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
