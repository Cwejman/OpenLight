# Host

The host is the native shell. It opens the window. It places tiles inside that window, gives each tile a webview, hands running programs their surfaces, and routes messages between those programs and the engine. It does not write interface — everything a user sees is produced by a program.

The host is written in Rust against **tao** (cross-platform windowing) and **wry** (cross-platform webview). These are the libraries that underlie Tauri; the host uses them directly, without adopting the Tauri framework's app-level conventions. Our shape — one window with many tiled webviews, each its own program — fits these primitives more naturally than Tauri's one-webview-per-window default.

---

## What the Host Does

- Opens and manages a single native window
- Decides where tiles go within that window — split-tree geometry, padding, spacing, card treatment
- Creates a webview for each tile that holds a running program with a DOM surface
- Routes messages between those webviews and the engine
- Manages the engine subprocess — spawn on start, graceful shutdown on exit
- Handles visual chrome that's properly the window's concern: padding, background color, shadows under cards, overlay darkening behind modal programs

## What the Host Does Not Do

- Render any part of the interface. Sidebar, tabs, command palette, tile contents — all programs.
- Interpret substrate operations. Those go through to the engine.
- Hold session state. Session state lives in the substrate.
- Own program lifecycle. The engine does that.

The host stays small. Rust, a few hundred lines at the core, oriented around window + webviews + IPC. This is not an aesthetic preference — it's the line that keeps interface authorship in the language the substrate's self-description already describes, rather than in a second language that has to keep up.

---

## Program as Interface

Interface and tool are one kind of thing. A program is a chunk with an executable and an optional surface capability — nothing distinguishes a program that renders a read tile from a program that touches the filesystem beyond what their bodies declare.

- `surface: 'none'` — the program has no rendering. A default inspector program can render its process chunk's activity in a tile when the user wants to look in.
- `surface: 'dom'` — the program renders via a webview. The host gives it one.
- `surface: 'wgpu'` — reserved for future direct-GPU rendering. Not in the pilot.

Every interface element is a program: sidebar, tabs, command palette, read tile, program runner, the claude agent. The host composes their outputs. When the user opens a read tile, a program is running in its webview. When the user brings up the command palette, a program is running as an overlay.

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

A recipe, when spawned, produces a **composition**: a container process visible as one unit in the sidebar, a nested tile structure visible as one rounded card on the board (with inner tiles separated by borders rather than padding). Collapsing the container stops its children. Composition is the live form; recipe is the saved template.

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

Two hops for the pilot, one protocol shape end-to-end.

1. **Webview → host** via wry's IPC channel. JSON messages with an `op` and a correlating `id`. The host receives these as Rust handlers.
2. **Host → engine** via stdio JSON-lines to the engine subprocess. The same protocol a program uses once it is running to reach the engine.

Responses flow back the same way. The host does not interpret substrate operations — it is a router. When the engine is later rewritten in Rust (see [`horizon.md`](horizon.md)), the second hop becomes a function call and one seam collapses. The program-facing SDK doesn't change.

### SDK surface

A program imports the SDK and calls the substrate operations it needs directly.

```ts
import { mount, scope, apply, run, await as awaitRun } from '@night/sdk'

function ReadTile() {
  const scopeId = /* from host-provided mount context */
  const data = useScope([scopeId])
  return <div>{/* render data */}</div>
}

mount(ReadTile)
```

Operations the SDK exposes directly (not wrapped in an object):

- `mount(Component)` — render the program's React tree into the host-provided root. Pure local DOM; no transport involved.
- `scope(ids)` — read the intersection of scopes.
- `apply(declaration)` — write.
- `run(programId, args)` — start a new process; returns the process ID.
- `await(processIds)` — block until processes complete; returns their scopes.

The SDK also exposes React hooks that read the substrate reactively. The hooks surface is underexplored; the initial expectation is a single `useScope(ids)` that re-renders its caller when chunks in that scope change. A richer hook vocabulary may emerge as programs are written, or it may stay minimal. This is held open.

---

## Authoring Programs

First-party programs for the pilot are TSX + React. The program is a file with a shebang declaring its runtime, an import of the SDK, a component, and a `mount(Component)` call:

```ts
#!/usr/bin/env bun
import { mount, scope } from '@night/sdk'

function MyProgram() {
  // ...
}

mount(MyProgram)
```

The program is a substrate chunk with `body.executable` pointing at this file and `body.surface: 'dom'`. When the host runs the program, it creates a webview, loads the program's bundle, lets it mount.

**Sync versus service lifecycle is a code pattern, not a declaration.** If the program calls `mount(Component)` and then its process exits (the natural completion of a stateless program), it's a sync view — unmounting ends the process. If the program calls `mount(Component)` and continues running its own async work, it's a service — unmount detaches the surface but the process persists. The SDK is the same either way; the program chooses.

**State lives in the substrate.** Programs use the substrate directly via `scope` and `apply` (and `useScope` for reactive reads) for anything that needs to persist. There is no separate state-persistence API. Per-run state that must separate from shared-program state is passed as a typed argument to `run`, the way the substrate's existing argument mechanism already handles it.

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

A program with `surface: 'dom'` and an `ui/overlay` placed on the current session. Opened by a leader key the host catches and forwards. Sources: available commands, programs in the system, recent processes, substrate search.

Not a host feature. Just another program, living as an overlay.

---

## What Is Open

- **React hooks surface.** Starting guess: a single `useScope(ids)`. Richer vocabulary (for mutations, for subscriptions to typed events, for React Suspense integration) may appear through use. This is deliberately underexplored; the shape will emerge.
- **Reactivity protocol.** How `useScope` is notified of changes — server-sent events, in-process subscription, native IPC callback. Implementation choice deferred.
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

To be built:

- `pilot/host/` — Rust, tao + wry, the window + geometry + webview lifecycle + IPC routing.
- `pilot/sdk/` — TypeScript, the SDK programs import.
- `pilot/programs/` — TypeScript + React, the first-party programs.

Existing:

- `pilot/engine/` — the engine in TypeScript; runs as a subprocess spawned by the host.
- `pilot/db/` — the substrate library; the engine owns the database it provides.
