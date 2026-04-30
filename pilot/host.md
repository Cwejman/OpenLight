# Host

The host is the native shell. It opens the window. It places tiles inside that window, gives each tile a webview, hands running programs their surfaces, and dispatches their substrate operations to the engine. It does not write interface — everything a user sees is produced by a program.

The host is written in Rust against **tao** (cross-platform windowing) and **wry** (cross-platform webview). These are the libraries that underlie Tauri; the host uses them directly, without adopting the Tauri framework's app-level conventions. Our shape — one window with many tiled webviews, each its own program — fits these primitives more naturally than Tauri's one-webview-per-window default.

The engine and substrate are Rust crates linked into the host binary. The host calls them directly — there is no separate engine process and no inter-process hop between host and engine. VM programs (tool programs running inside their VM) are spawned by the engine and reach it over stdio JSON-lines.

---

## What the Host Does

- Opens and manages a single native window
- Decides where tiles go within that window — split-tree geometry, padding, spacing, card treatment
- Creates a webview for each tile that holds a running program with a DOM surface
- Receives wry IPC messages from webview programs and dispatches them to the engine library
- Bootstraps the substrate (open the database) and the engine on startup; closes both on exit
- Handles visual chrome that's properly the window's concern: padding, background color, shadows under cards, overlay darkening behind modal programs

## What the Host Does Not Do

- Render any part of the interface. Sidebar, tabs, command palette, tile contents — all programs.
- Interpret substrate operations. Those are dispatched to the engine.
- Hold session state. Session state lives in the substrate.
- Own program lifecycle. The engine does that.

The host stays small. Rust, a few hundred lines at the core, oriented around window + webviews + the wry IPC dispatch surface. This is not an aesthetic preference — it's the line that keeps interface authorship in the language the substrate's self-description already describes, rather than in a second language that has to keep up.

---

## Program as Interface

Interface and tool are one kind of thing. A program is a chunk with an executable and a runtime declaration — nothing distinguishes a program that renders a read tile from a program that touches the filesystem beyond what their bodies declare.

The pilot supports two runtimes:

- `runtime: 'vm'` — the program is an executable spawned as a process inside its own Linux VM (the pilot's containment). A shebang on the file declares its interpreter; the engine doesn't impose a language. Whatever the interpreter gives the program (fs, network, shell, etc.) is what's available, gated by declared capabilities. No rendering. The agent and tool programs are this kind. A default inspector program can render a VM program's activity in a tile when the user wants to look in.
- `runtime: 'webview'` — the program is a JS bundle loaded into a wry-hosted webview. The runtime is the webview's V8 — a sandboxed browser engine with full DOM, full client-side React, and 60fps interactions. The SDK reaches the engine over wry IPC.

Programs of both runtimes use the same SDK surface (`scope`, `commit`, `run`, `awaitRun`, `subscribe`); only the transport differs. A complex UI that needs both DOM rendering *and* direct system access is built as a **composition** of two programs — a `webview` program and a `vm` program — bound by their shared scope, communicating through the substrate. Compositions are the substrate's native shape for what other systems call "islands": independent interactive regions, each with its own runtime, glued by shared state.

The pilot ships a TypeScript SDK only. First-party VM programs use `#!/usr/bin/env bun` so they can import the TS SDK directly; programs in other languages would need their own SDK speaking the same JSON-lines protocol. That is out of scope for the pilot, in scope for the horizon.

Every interface element is a program: sidebar, tabs, command palette, read tile, program runner. The host composes their outputs. When the user opens a read tile, a webview program is running. When the user brings up the command palette, a webview program is running as an overlay. The claude agent is a VM program; its output appears as session chunks the UI programs read.

When future runtimes land (host-rendered DOM from a VM program, GPU-canvas, terminal, native widgets), they become new runtime values. See [`research/runtimes-and-surfaces.md`](../research/runtimes-and-surfaces.md) for the topologies considered and what's deferred.

---

## The Composition Types

All in the `ui` namespace. Seeded by bootstrap. The host reads these chunks to render.

```
ui/session
  spec: { propagate: true, accepts: ['tab', 'process'] }
  body: { name?, current-tab? }
  — The outer container. Restorable, shareable. Any process placed on the
    session as instance becomes sidebar-visible. No separate pin archetype —
    session membership is sidebar presence.

ui/tab
  spec: { propagate: true, accepts: ['tile'] }
  body: { name? }
  placements: on session (instance)
  — The root of a tile tree. Workspaces are tabs; one term, one archetype.

ui/tile
  spec: { ordered: true }
  body:
    split node:  { direction: 'horizontal'|'vertical', ratio }
    leaf node:   (empty; mount expressed through placement)
  placements:
    on tab or parent-tile (instance, seq chooses split side)
    on engine/process (relates — "this leaf displays this running process")

ui/overlay
  body: { anchor: 'session'|'tab'|'tile' }
  placements:
    on engine/program (relates — overlay content)
    on anchor target (relates)

ui/recipe
  spec: { propagate: true, accepts: ['tile'] }
  body: { name?, description? }
  — A tile subtree preserved as a template. Spawning clones the structure
    under a chosen root — a whole tab, or a single tile within an existing
    tab. The recipe itself persists separately from any spawned instance.
```

A recipe, when spawned, produces a **composition**: a container process visible as one unit in the sidebar, a nested tile structure visible as one rounded card on the board (with inner tiles separated by borders rather than padding). Collapsing the container stops its children. Composition is the live form; recipe is the saved template. Spawning instantiates fresh processes from the template; the recipe itself is unchanged.

Compositions are how complex UIs that mix DOM and capabilities get built. A program that needs both a designed UI and direct system access is a composition of a webview program and a VM program, bound by their shared scope. Visually they can read as one designed surface — the host renders inner tiles with no padding when the composition wants seamlessness — even though they're independent runtimes.

---

## View Modes as Lenses

The pilot ships tabs — the geometry described below. That is one lens on what the substrate holds, not the only one. A zoomable canvas is another lens on the same chunks; further geometries are reachable too. Because the host is built by programs themselves, a view mode is just another program working over the composition types — not a different host. Tabs go first; new lenses are additive, not forks.

## Tile Geometry

Binary split tree. Same primitive the earlier pilot used; the model survived the redesign because it is the right one.

- A **split** tile holds two children — ordered by `seq`. Direction and ratio live in its body.
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

Future visual refinements — glow around cards derived from their content pixels, native backdrop blur, compositor-level effects — live on the direction list. For the pilot, CSS `backdrop-filter` covers the aesthetic; native pixel effects come later.

---

## Transport

One hop. One protocol shape.

A webview program calls the SDK; the SDK serializes the call and posts it through wry's IPC channel via `window.__wry_ipc.postMessage(<json>)`. The host registers `WebView::set_ipc_handler` per webview at mount time; each invocation parses the JSON, attaches a `Context { process_id }` from the host's webview→process registry, calls the matching engine function, and resolves the call by injecting `webview.evaluate_script("__sdk.resolve(<id>, <payload>)")`.

Unsolicited events from the engine ride the same channel in the other direction: `webview.evaluate_script("__sdk.event(<payload>)")`. The SDK distinguishes responses (`id` + `result|error`) from events (`event` field) by message shape on the JS side. See [`pilot/engine.md`](engine.md#reactivity-wiring) for the end-to-end push chain.

The host does not interpret substrate operations — it dispatches them. VM programs (tool programs running inside their VMs) speak the same protocol shape over stdio JSON-lines; the engine reads their stdout directly without going through the host.

### SDK surface

A program imports the SDK and calls the substrate operations it needs directly. Webview programs render with their DOM library of choice — `react-dom/client` for React, anything else otherwise; the SDK has no rendering concerns.

```tsx
import { scope, commit, run, awaitRun } from '@night/sdk'
import { useScope } from '@night/sdk-react'
import { createRoot } from 'react-dom/client'

function ReadTile() {
  const scopeId = /* from host-provided mount context */
  const data = useScope([scopeId])
  return <div>{/* render data */}</div>
}

createRoot(document.getElementById('root')!).render(<ReadTile />)
```

Operations the SDK exposes (in `@night/sdk`):

- `scope(ids, opts?)` — read the intersection of scopes.
- `commit(declaration)` — write.
- `run(programId, args)` — start a new process; returns the process id.
- `awaitRun(processIds)` — block until processes complete; returns their scopes.
- `subscribe(ids, callback)` — imperative subscription. Returns an `unsubscribe` thunk. Typically consumed through `useScope`.

React hooks live in a separate package, `@night/sdk-react`. The starting hook is `useScope(ids)` — calls `scope` for initial data, registers a `subscribe`, re-fetches on `scope_changed`, unsubscribes on unmount. A richer hook vocabulary may emerge through use. Full surface in [`pilot/sdk.md`](sdk.md).

---

## Authoring Programs

Two shapes for the two kinds.

**Webview program** (`runtime: 'webview'`). A TSX entry that renders its component tree directly. The host loads the program's bundled JS into a webview that already has `<div id="root"></div>` in the page. No shebang — the file is bundled to JS by the build pipeline, not run directly.

```tsx
import { useScope } from '@night/sdk-react'
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
import { scope, commit, awaitRun } from '@night/sdk'

const args = await scope([process.env.PROCESS_ID!])
// ... do work, call APIs, write to substrate ...
process.exit(0)
```

The program is a substrate chunk with `body.executable` pointing at the script and `body.runtime: 'vm'`. When the host runs the program, the engine spawns the script inside its VM with stdio attached. Other interpreters (Python, Ruby, anything installed in the VM that can speak the JSON-lines protocol) become viable when an SDK for that language exists.

**Lifecycle differs by kind.**

- *VM programs* end when their process exits (`process.exit()` or stdout closing). Stateless tools naturally exit when work is done; long-running services stay alive in their own loop.
- *Webview programs* don't end via "JS reaches its last statement" — the webview's runtime keeps the page alive (React is still reconciling, event listeners are still registered). The program ends when the host destroys its webview, which the host does on tile-close, on `cancel`, or on timeout. To dismiss itself, a webview program writes a "done" signal to the substrate; the launcher subscribed to that scope sees it and asks the engine to cancel.

**State lives in the substrate.** Programs use the substrate directly via `scope` and `commit` (and `useScope` for reactive reads in webview programs) for anything that needs to persist. There is no separate state-persistence API. Per-run state that must separate from shared-program state is passed as a typed argument to `run`.

**Process identity.** Each run of a program is a distinct process chunk with a distinct id. Two processes of the same program with the same arguments can coexist — they are different chunks. The sidebar disambiguates them with program name + args + some visual suffix (timestamp, index, or user-assigned name — the scheme is open UX).

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

A program with `runtime: 'webview'` and an `ui/overlay` placed on the current session. Opened by a leader key the host catches and forwards. Sources: available commands, programs in the system, recent processes, substrate search.

Not a host feature. Just another program, living as an overlay.

---

## What Is Open

- **React hooks surface.** Starting hook is `useScope(ids)`. Richer vocabulary (for mutations, for subscriptions to typed events, for React Suspense integration) may appear through use. The full surface is specified in [`pilot/sdk.md`](sdk.md).
- **Overlay anchor escalation.** How a program anchors an overlay above its own tile's scope. Requires write-boundary reach into a parent scope; the mechanics are not specified.
- **Recipe referencing.** Identity-based (binds specific programs) or slot-based (declares placeholders the user fills). Leaning identity for the pilot.
- **Multi-mount of services.** One long-running program mounted in two tiles — shared single surface, or two surfaces over one backing state?
- **Sidebar disambiguation.** The exact visual scheme for distinguishing multiple processes of the same program with identical arguments.
- **Color coding.** Whether scopes or programs carry a color attribute, and how it surfaces in the visual language.
- **Cross-workspace wrap policy.** When wrapping tiles into a composition, if a child is visible in another tab, what happens to the other tab's view.
- **Selection on padding.** Gesture for selecting a subtree of tiles to wrap, save as recipe, or delete as a group.
- **Native visual effects.** The pilot uses CSS for blur and glow; native compositor effects (pixel-readback, GPU blur) are later.

---

## Directory

To be built (Rust):

- `pilot/host/` — tao + wry. The window + geometry + webview lifecycle + IPC routing.

To be built (TypeScript):

- `pilot/sdk/` — the SDK programs import. Spec: [`pilot/sdk.md`](sdk.md).
- `pilot/programs/` — first-party programs (TSX + React).

Existing:

- `pilot/engine/` — the engine in TypeScript; the porting oracle for the Rust port. Retires once parity holds.
- `pilot/db/` — the substrate library in TypeScript; same role as engine.

The Rust port lands db, engine, and host as one binary (three crates in a workspace). See [`pilot.md`](../pilot.md#stack).
