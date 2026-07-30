# Host

The host is the native shell. It opens the window. It places tiles inside that window, gives each tile a webview, hands running programs their surfaces, and dispatches their substrate operations to the engine. It does not write interface — everything a user sees is produced by a program.

The host is written in Rust against **tao** (cross-platform windowing) and **wry** (cross-platform webview). These are the libraries that underlie Tauri; the host uses them directly, without adopting the Tauri framework's app-level conventions. Our shape — one window with many tiled webviews, each its own program — fits these primitives more naturally than Tauri's one-webview-per-window default.

The engine and substrate are Rust crates linked into the host binary. The host calls them directly — there is no separate engine process and no inter-process hop between host and engine. The host also implements and registers the runtime providers (VM and webview) that the engine asks to spawn programs — engine ships no runtime implementations of its own; that machinery lives here. VM programs (tool programs running inside the VM) reach the engine over stdio JSON-lines.

---

## What the Host Does

- Opens and manages a single native window
- Decides where tiles go within that window — split-tree geometry, padding, spacing, card treatment
- Creates a webview for each tile that holds a running program with a DOM surface
- Receives wry IPC messages from webview programs and dispatches them to the engine library
- Bootstraps the substrate (open the active project's database, walk and open mounts cascade) and the engine on startup; closes both on exit
- Implements and registers the VM and webview runtime providers with the engine; owns the VM lifecycle, including peer FS mounts at `/peers/<project-id>/`
- Enforces capabilities at spawn through its providers — `net[:host]` egress allowlists, `fs`/`exec` gating, and `secret:<NAME>` injection as env vars from a host-held keychain (secrets are never chunks; see engine.md, *Capabilities and secrets*)
- Handles visual chrome that's properly the window's concern: padding, background color, shadows under cards, overlay darkening behind modal programs

## What the Host Does Not Do

- Render any part of the interface. Sidebar, tabs, command palette, tile contents — all programs.
- Interpret substrate operations. Those are dispatched to the engine.
- Hold session state. Session state lives in the substrate.
- Own program lifecycle. The engine does that.

The host stays small. Rust, oriented around window + webviews + the wry IPC dispatch surface. This is not an aesthetic preference — it's the line that keeps interface authorship in the language the substrate's self-description already describes, rather than in a second language that has to keep up.

---

## Program as Interface

Interface and tool are one kind of thing. A program is a chunk with an executable and a runtime declaration — nothing distinguishes a program that renders a read tile from a program that touches the filesystem beyond what their bodies declare.

The pilot supports two runtimes:

- `runtime: 'vm'` — the program is an executable spawned as a process inside the active project's Linux VM (v0.1's containment). A shebang on the file declares its interpreter; the engine doesn't impose a language. Whatever the interpreter gives the program (fs, network, shell, etc.) is what's available, gated by declared capabilities. No rendering. The agent and tool programs are this kind; a program declared in a mounted project runs its executable from its peer FS mount inside the same VM (boot wires the mount table). A default inspector program can render a VM program's activity in a tile when the user wants to look in.
- `runtime: 'webview'` — the program is a JS bundle loaded into a wry-hosted webview. The runtime is the webview's V8 — a sandboxed browser engine with full DOM, full client-side React, and 60fps interactions. The SDK reaches the engine over wry IPC.

Programs of both runtimes use the same SDK surface; only the transport differs. A complex UI that needs both DOM rendering *and* direct system access is built as a **composition** of two programs — a `webview` program and a `vm` program — bound by their shared scope, communicating through the substrate. Compositions are the substrate's native shape for what other systems call "islands": independent interactive regions, each with its own runtime, glued by shared state.

The pilot ships a TypeScript SDK only. First-party VM programs use `#!/usr/bin/env bun` so they can import the TS SDK directly; programs in other languages would need their own SDK speaking the same JSON-lines protocol. That is out of scope for the pilot, in scope for the horizon.

Every interface element is a program: sidebar, tabs, command palette, read tile, program runner. The host composes their outputs. When the user opens a read tile, a webview program is running. When the user brings up the command palette, a webview program is running as an overlay. The claude agent is a VM program; its output appears as session chunks the UI programs read.

When future runtimes land (host-rendered DOM from a VM program, GPU-canvas, terminal, native widgets), they become new runtime values. See [`research/runtimes-and-surfaces.md`](../research/runtimes-and-surfaces.md) for the topologies considered and what's deferred.

---

## The Composition Types

All in the `host` namespace (the host project ships these archetypes; project name = scope namespace). Seeded by bootstrap. The host reads these chunks to render.

```
host/session
  spec: { propagate: true, accepts: ['tab', 'process'] }
  body: { name?, current-tab? }
  — The outer container. Restorable, shareable. Any process placed on the
    session as instance becomes sidebar-visible. No separate pin archetype —
    session membership is sidebar presence.

host/tab
  spec: { propagate: true, accepts: ['tile'] }
  body: { name? }
  placements: on session (instance)
  — The root of a tile tree. Workspaces are tabs; one term, one archetype.

host/tile
  spec: { propagate: true, ordered: true }   — propagate so seq orders children
                                               within each tile, per substrate.md
  body:
    split node:  { direction: 'horizontal'|'vertical', ratio }
    leaf node:   (empty; mount expressed through placement)
  placements:
    on tab or parent-tile (instance, seq chooses split side)
    on engine/process (relates — "this leaf displays this running process")

host/overlay
  body: { anchor: 'session'|'tab'|'tile' }
  placements:
    on engine/program (relates — overlay content)
    on anchor target (relates)

host/recipe
  spec: { propagate: true, accepts: ['tile'] }
  body: { name?, description? }
  — A tile subtree preserved as a template. Spawning clones the structure
    under a chosen root — a whole tab, or a single tile within an existing
    tab. The recipe itself persists separately from any spawned instance.
```

A recipe, when spawned, produces a **composition**: a container process visible as one unit in the sidebar, with a nested tile structure on the board. Collapsing the container stops its children. Composition is the live form; recipe is the saved template — spawning instantiates fresh processes, the recipe itself unchanged.

---

## View Modes as Lenses

v0.1 walks one geometry — tabs (below). It is one lens on the chunks, not the only one: because the host is built by programs, a view mode is itself a program over the composition types, so other lenses (zoomable canvas, outline, graph) are additive, not forks. Directions in [`horizon.md`](../horizon.md#view-modes-beyond-tabs).

## Tile Geometry

Binary split tree. Same primitive the earlier pilot used; the model survived the redesign because it is the right one.

- A **split** tile holds two children — ordered by `seq`. Direction and ratio live in its body; `direction: 'horizontal'` divides the width (children side by side), `'vertical'` divides the height (children stacked); `ratio` is the seq-first child's share of the split axis, clamped inside (0, 1).
- A **leaf** tile holds no children. Its rendering is derived from whichever process is placed `relates` on it.

The host walks the tree of the active tab, positions webviews as rectangles inside the window, draws rounded-corner cards around each leaf. A composition (a container process with nested tiles) renders as an outer rounded card; its inner tiles render with borders only. Tiling never happens inside a webview. The host owns every rectangle.

## Overlays

An overlay is a program that renders above the normal tile composition. Its anchor scope determines how far it spans:

- `anchor: 'session'` — the whole window. The command palette is a session overlay.
- `anchor: 'tab'` — the current tab.
- `anchor: 'tile'` — a single tile.

A program can freely anchor an overlay to its own tile because the write boundary already includes the tile. Anchoring higher (tab, session) requires a program whose write boundary reaches that far — unusual and underexplored. The specifics of overlay-escalation semantics remain open.

---

## Visual Language

The window is a quiet canvas:

- Light padding around the tiling area
- The sidebar lives directly on the background — text on the canvas, no panel, no border
- Tabs appear at the top as pills
- Tiles appear as rounded cards with a small gap between them
- White-first; dark mode is a later refinement, not a day-one requirement
- iOS-flavored rounding — subtle, not dramatic

In the sidebar, the same chunk is shown two ways based on its process state. A running process is a card, with the same rounding and shadow as a tile. A completed or failed process is flat — just its content directly on the background. The visual language distinguishes life from rest without a label.

For the pilot, CSS covers the aesthetic (`backdrop-filter` for blur); content-derived glow and native compositor effects come later — see *What Is Open*.

---

## Transport

One hop. One protocol shape.

A webview program calls the SDK; the SDK serializes the call and posts it through wry's IPC channel via `window.__wry_ipc.postMessage(<json>)`. The host registers `WebView::set_ipc_handler` per webview at mount time; each invocation parses the JSON, attaches a `Context { process_id }` from the host's webview→process registry, calls the matching engine function, and resolves the call by injecting `webview.evaluate_script("__sdk.resolve(<id>, <payload>)")`. The host installs the `window.__wry_ipc` name itself — an initialization-script alias over the `window.ipc.postMessage` wry injects. `<payload>` is the full response envelope (`{id, result|error}`), so the SDK's shape-based demultiplexing holds on both channels.

Unsolicited events from the engine ride the same channel in the other direction: `webview.evaluate_script("__sdk.event(<payload>)")`. The SDK distinguishes responses (`id` + `result|error`) from events (`event` field) by message shape on the JS side. See [`pilot/engine.md`](engine.md#reactivity-wiring) for the end-to-end push chain.

**Per-slot identity.** One webview may host embedded citizens (slot-and-hook, [`programs.md`](programs.md) §3.5), each its own process. At slot creation the host issues the citizen a slot identity token; every request from that citizen's SDK instance carries it, and the IPC handler maps token → process id before attaching `Context`. The webview→process registry becomes webview→{process, slots}; everything downstream of `Context` is unchanged.

The host does not interpret substrate operations — it dispatches them. VM programs (tool programs running inside their VMs) speak the same protocol shape over stdio JSON-lines; the engine reads their stdout directly without going through the host.

### SDK surface

A program imports the SDK and calls the substrate operations it needs directly; webview programs render with their DOM library of choice (`react-dom/client` for React) — the SDK has no rendering concerns. The op surface is owned by [`sdk.md`](sdk.md); a worked example is under *Authoring Programs* below.

React hooks live in the host's UI library (`host/ui/`), shipped as `@openlight/ui`. The starting hook is `useScope(ids)` — registers a `subscribe` first, then fetches via `scope`, re-fetches on `scope_changed`, unsubscribes on unmount. The order is load-bearing; see [`sdk.md`](sdk.md). A richer hook vocabulary may emerge through use.

---

## Authoring Programs

Two shapes for the two kinds.

**Webview program** (`runtime: 'webview'`). A TSX entry that renders its component tree directly. The host loads the program's bundled JS into a webview that already has `<div id="root"></div>` in the page. No shebang — the file is bundled to JS by the build pipeline, not run directly.

```tsx
import { useScope } from '@openlight/ui'
import { createRoot } from 'react-dom/client'

function MyProgram() {
  const data = useScope([/* ... */])
  return <div>{/* ... */}</div>
}

createRoot(document.getElementById('root')!).render(<MyProgram />)
```

The program is a substrate chunk with `body.executable` pointing at the bundle and `body.runtime: 'webview'`. When the host runs the program, it creates a webview, loads the bundle, the JS runs `createRoot(...).render(...)` against the host-provided root.

**VM program** (`runtime: 'vm'`). An executable file with a shebang. Runs as a standalone process inside its own VM. The shebang determines the interpreter and what APIs the program has access to. The pilot's first-party VM programs use `#!/usr/bin/env bun` because the SDK is TypeScript:

```ts
#!/usr/bin/env bun
import { scope, commit, awaitRun } from '@openlight/sdk'

const args = await scope([process.env.PROCESS_ID!])
// ... do work, call APIs, write to substrate ...
process.exit(0)
```

The program is a substrate chunk with `body.executable` pointing at the script and `body.runtime: 'vm'`. When the host runs the program, the engine spawns the script inside its VM with stdio attached. Other interpreters (Python, Ruby, anything installed in the VM that can speak the JSON-lines protocol) become viable when an SDK for that language exists.

**Lifecycle differs by kind.**

- *VM programs* end when their process exits (`process.exit()` or stdout closing). Stateless tools naturally exit when work is done; long-running services stay alive in their own loop.
- *Webview programs* don't end via "JS reaches its last statement" — the webview's runtime keeps the page alive (React is still reconciling, event listeners are still registered). The program ends when the host destroys its webview — on tile-close, on `cancel`, on timeout — or when the program itself calls the `exit` op (engine.md), the standard self-dismissal path: terminal transition `completed`, host unmounts on the terminal signal.

**State lives in the substrate.** Programs use the substrate directly via `scope` and `commit` (and `useScope` for reactive reads in webview programs) for anything that needs to persist. There is no separate state-persistence API. Per-run state that must separate from shared-program state is passed as a typed argument to `run`.

**Process identity.** Each run is a distinct process chunk (see [`engine.md`](engine.md)) — two runs of the same program with identical args coexist as different chunks. The sidebar disambiguates them with program name + args + a visual suffix (timestamp, index, or user-assigned name — scheme is open UX).

---

## Sidebar

The sidebar is the session's view of itself. Its items are processes placed `instance` on the current session, plus whatever the session explicitly holds.

- Running processes render as cards.
- Completed or failed processes render flat on the background.
- Every item responds to click with a **context menu** — the primary interaction for both running and stopped processes. The menu surfaces the actions that fit the item's state: jump to the tile if mounted, terminate a running process, spawn a new process from a stopped one, edit boundaries, remove from sidebar.
- Shift-click (or equivalent modifier) offers a quick-action shortcut for common operations — for example, immediately launching a new process without opening the menu. This is a power-user convenience layered on top of the foolproof context-menu path; ordinary users find every capability through the menu without needing to know the shortcut exists.
- Clearing a process from the sidebar is non-destructive. The substrate is lossless; the entry is un-shown, the process chunk persists.
- Container processes (from spawned recipes) appear as one expandable entry; expanding reveals the child processes underneath.

History of what has been run is reachable without a dedicated scope-history chunk. Processes themselves are the history — the process-history of a program is the set of all its past runs, available via substrate scope.

---

## Command Palette

A program with `runtime: 'webview'` and an `host/overlay` placed on the current session. Opened by a leader key the host catches and forwards. Sources: available commands, programs in the system, recent processes, substrate search.

Not a host feature. Just another program, living as an overlay.

---

## Boot sequence

Host startup has a fixed order:

1. **Initialize tokio runtime.** The engine and runtime providers need it; tao's event loop runs on the main thread.
2. **Resolve active project path.** From CLI args or working directory.
3. **Walk the mounts cascade.** Read the active project's `.ol/project.toml`; for each `[[mounts]]` entry, read that project's `.ol/project.toml` in turn; recurse. Deduplicate by canonical absolute path. Detect cycles; reject with an error. The host project and engine project must appear in the resolved cascade (most projects' data references their archetypes); if either is missing, refuse with a clear error pointing to the missing entry. v0.1 also refuses any peer whose db schema version differs from the active project's (migration is a v0.2 concern).
4. **Open all dbs.** `Db::open(<active>)` read-write; `Db::open_read_only(<peer>)` for each peer in the resolved cascade. Both take the *project* path — the db resolves `.ol/db` beneath it. The read-only open never creates, migrates, or seeds, and refuses a schema version other than this build's — step 3's rule, enforced again at the file ([`db.md`](db.md#lifecycle)).
5. **Open the engine.** `Engine::open()` returns `(Engine, mpsc::Receiver<HostCmd>)`. Host keeps the receiver to drain on its event loop.
6. **Register runtime providers.** `engine.register_runtime("vm", Arc::new(VmProvider::new(...)))` and `engine.register_runtime("webview", Arc::new(WebviewProvider::new(host_cmd_tx, ...)))`. Both providers are host-crate types; engine ships no runtime implementations.
7. **Configure the VM.** Hand the VM provider the FS-mount table: active project at `/active/` read-write, each peer at `/peers/<project-id>/` read-only. The VM starts; programs spawned later run inside it.
8. **Mount projects.** `engine.mount_project(id, db, ReadOnly, branch)` for each peer; `engine.mount_project(active-id, active-db, ReadWrite, "main")` for the active project. The engine subscribes to the active project's commit broadcast for reactivity; read-only mounts contribute reads but not events (no in-process writer ever fires).
9. **Boot-time validation.** Ask the engine to validate that every placement in the active project's db has its `scope_id` resolve in some mount. Missing references — most often a missing host or engine mount — return as a list; surface them and refuse to enter the event loop. No half-loaded state.
10. **Spawn the always-mounted suite.** Sidebar and tab-bar are first-party programs the host references by id and runs at boot via `engine.run(..., Context { process_id: None })` — sidebar with read roots `[session, engine/process, engine/program]` and write root `[session]`; tab-bar with read/write `[session]`; both positioned as naked strips on the background, outside tile geometry. The command palette is spawned on-demand when the leader key fires, as a session-anchored overlay with full read reach, writing only through composition (it launches; it doesn't commit structure). Contracts at experience depth: [`programs.md`](programs.md) §3.1–3.3.
11. **Enter the event loop.** `event_loop.run(...)` on the main thread, draining `HostCmd` events from the engine, wry IPC messages from webviews, and tao's window events.

Shutdown reverses the order: cancel running processes, await `engine.shutdown()`, drop the VM (which unmounts FSes), drop dbs, exit.

**Single-host-per-db.** v0.1 assumes one host process per project; concurrent cross-host access and reactive notification across hosts are not implemented. Mechanism and rationale: [`engine.md`](engine.md#engine-api-callable-from-the-host); horizon path: [`horizon.md`](../horizon.md).

The cascade walk and FS-mount-table assembly are host code (file-aware). The mount registry and federation are engine concerns. The split is documented in [`engine.md`](engine.md#engine-api-callable-from-the-host).

---

## What Is Open

- **React hooks surface.** Starting hook is `useScope(ids)`. Richer vocabulary (for mutations, for subscriptions to typed events, for React Suspense integration) may appear through use. The full surface is specified in [`pilot/sdk.md`](sdk.md).
- **Overlay anchor escalation.** How a program anchors an overlay above its own tile's scope. Leaning: mediated through the arranger (`programs.md` §3.9) — a request-shaped route rather than boundary escalation; unprivileged programs never need write reach above their tile.
- **Recipe referencing.** Settled identity-based for v0.1 (`programs.md` §3.9): a leaf records `{ program, argument declarations, boundary roots, view state }`; spawning re-declares fresh. Slot-based recipes (placeholders filled at spawn) are a later layer on the same shape.
- **The ensemble tile.** A leaf tile relates one process today; citizen ensembles (`programs.md` §3.5, the peer inversion) need a leaf relating a group container of citizen processes — or subtiling within tiles. Settles by building the conversation tile.
- **Host-native sidebar/tabs.** Held open (`programs.md` §3.1): they stay webview programs for now; going native later would buy visual coherence with the frame's card treatment and performance, when the demand justifies the exception.
- **Multi-mount of services.** One long-running program mounted in two tiles — shared single surface, or two surfaces over one backing state?
- **Sidebar disambiguation.** The exact visual scheme for distinguishing multiple processes of the same program with identical arguments.
- **Color coding.** Whether scopes or programs carry a color attribute, and how it surfaces in the visual language.
- **Cross-workspace wrap policy.** When wrapping tiles into a composition, if a child is visible in another tab, what happens to the other tab's view.
- **Selection on padding.** Gesture for selecting a subtree of tiles to wrap, save as recipe, or delete as a group.
- **Native visual effects.** The pilot uses CSS for blur and glow; native compositor effects (pixel-readback, GPU blur) are later.
- **Direct-manipulation grammar.** Drag-to-resize, split creation and removal gestures, minimum tile sizes. pilot.md names the host as owner of tile geometry *and its direct manipulation*, but the gestures are unspecced — no test can be written for them yet. The geometry walk below stands testable without this layer; spec it before coding it.
- **Visual tokens.** "Light padding," "small gap," and the rounding carry no values. The walk takes them as parameters — a pure function of (tree, viewport, spacing) — so tests parametrize over them; the values themselves settle by eye when the window exists.

---

## Directory

The host project ships:

```
host/
  src/               — Rust source: window/tao/wry, IPC routing, mounts cascade
                       walker, VM and webview runtime provider implementations.
  ui/                — TypeScript UI library: React components and hooks
                       (useScope, future useCommit/useRun) used by webview
                       programs the host renders. Lives here for v0.1; may
                       extract to its own project later.
  programs/          — first-party host-shipped programs:
                       sidebar, tab-bar, command-palette, dispatcher, read-tile.
                       (Webview programs in TSX; the host runs them at boot or
                       on demand depending on each one's lifecycle.)
  .ol/db, .ol/project.toml
```

The host depends on the `db` and `engine` crates. The runtime-agnostic SDK package (`@openlight/sdk`) lives in the engine crate; the React UI library is host-shipped because it's coupled to webview programs. See [`pilot.md`](../pilot.md#stack) for the full repo layout and [`engine.md`](engine.md) for the SDK and runtime provider contracts.
