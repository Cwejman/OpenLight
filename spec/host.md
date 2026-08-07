# Host

The host is the Rust authority under the environment: the window, OS input, the VM and its capabilities, the keychain, the engine and substrate crates, `ol://` serving, the transport, and boot. It draws no interface at all. There is one compositor — the web tree ([`engine.md`](engine.md#containment)) — so everything a person sees is program-authored DOM, and how that DOM is arranged is a program's concern ([`programs.md`](programs.md) §1).

Written in Rust against **tao** (cross-platform windowing) and **wry** (cross-platform webview) — the libraries under Tauri, used directly without adopting Tauri's app-level conventions. One window, one webview, one document: wry's own default shape, which is exactly what one compositor asks for.

The engine and substrate are Rust crates linked into the host binary. The host calls them directly — there is no separate engine process and no inter-process hop between host and engine. The host also implements and registers the runtime providers the engine asks to spawn programs; the engine ships none of its own.

---

## What the Host Does

- Opens and manages a single native window, and takes OS input — keyboard, pointer, the palette's leader key, window-level shortcuts.
- Holds that window's one webview and navigates it to the shell document, served over `ol://`.
- Serves program source over the `ol://` protocol, transpiled per file and cached by mtime.
- Mounts and unmounts a program's **seat** inside the shell document, on the engine's command.
- Receives wry IPC from surface programs, attaches the calling process's `Context`, and calls the engine function.
- Issues per-seat identity tokens, injecting them **directly** into iframe citizens so no parent can forge them.
- Implements and registers the VM and surface runtime providers; owns the VM lifecycle, including peer FS mounts at `/peers/<project-id>/`.
- Enforces capabilities at spawn through those providers — `net[:host]` egress allowlists, `fs`/`exec` gating, and `secret:<NAME>` injection as env vars from a host-held keychain (secrets are never chunks; [`engine.md`](engine.md), *Capabilities and secrets*).
- Opens the active project's database, walks and opens the mounts cascade, opens the engine, and closes all of it on exit.

## What the Host Does Not Do

- **Render, or arrange.** The shell, tiles, chrome, overlays, sidebar and palette are programs; tile geometry, its direct manipulation and the visual language belong to the shell ([`programs.md`](programs.md) §1). The host owns no rectangle but the window's.
- **Cast chrome.** Shadows, auras, padding and card treatment are CSS in the document. Per-tile webviews, transparent-webview tricks and native compositor chrome all dissolved with the one-compositor ruling.
- **Interpret substrate operations.** They go to the engine.
- **Hold session state.** Session state lives in the substrate.
- **Own program lifecycle.** The engine does.

The host stays small: window, webview, `ol://`, the VM, the keychain, the IPC surface. This is not an aesthetic preference — it is the line that keeps interface authorship in the language the substrate's self-description already describes, rather than in a second language that has to keep up.

---

## One window, one shell document

The window holds one webview, navigated to one document. That document is a program — the **shell** — and every other surface program is *seated* inside it, either as a same-DOM slot in the shell's own realm or as an iframe on its own `ol://<program-id>` origin. The wall each tier gives, and the transport that follows from it, are [`engine.md`](engine.md#containment)'s *Containment*; what the host owes is the mechanics.

A **seat** is where a program's DOM lives. The host does not decide seats — the shell does — but the host mounts and unmounts them, because the engine's runtime providers are host-crate types and wry is main-thread.

**Seat commands.** `Engine::open` hands the host an `mpsc::Receiver<HostCmd>`, drained on the event loop. The mount/unmount commands no longer create a native webview per program; they mount and unmount a seat inside the window's single document. **Decided here: `HostCmd::MountSeat` / `HostCmd::UnmountSeat`**, beside `EvaluateScript`. "Webview" named the mechanism that dissolved; "seat" names what actually mounts, and it is already the surface layer's own word (engine.md's `grades` are "read by the seat"). [`engine.md`](engine.md)'s *Code architecture* still lists the pair under the old names — that rename is owed there, not taken here.

The shell itself is started like any other surface program (*Boot sequence*, step 10); the host navigates the webview to its entry and stamps its process id before any page code runs.

---

## Program as interface

Interface and tool are one kind of thing. A program is a chunk with an executable and a runtime declaration; nothing distinguishes a program that renders a reader from one that touches the filesystem beyond what their bodies declare ([`engine.md`](engine.md), *The program body*).

The pilot supports two spawnable runtimes (the third, `native`, is the engine's own planner):

- **`runtime: 'vm'`** — an executable spawned as a process inside the active project's Linux VM, v0.1's containment for capability-bearing work. A shebang declares the interpreter; the engine imposes no language. Whatever the interpreter gives the program is available, gated by its declared capabilities. A program declared in a mounted project runs its executable from its peer FS mount inside the same VM. No rendering; `process-view` renders a VM program's activity when someone wants to look in.
- **`runtime: 'webview'`** — a surface program: a JS module the shell seats inside the shared document. The runtime is the window webview's V8 — full DOM, full client-side React, 60fps interactions. The SDK reaches the engine over wry IPC. The value keeps its name; what changed is that a seat is a region of one document rather than a webview of its own.

Both kinds use the same SDK surface; only the transport differs. A UI that needs both DOM rendering *and* direct system access is built as a **composition** of two programs — one surface, one VM — bound by a shared place and communicating through the substrate. Compositions are the substrate's native shape for what other systems call islands: independent interactive regions, each with its own runtime, glued by shared state.

The pilot ships a TypeScript SDK only. First-party VM programs use `#!/usr/bin/env bun` so they can import it directly; programs in other languages need their own SDK speaking the same JSON-lines protocol — not for the pilot, on the horizon. When future runtimes land (GPU canvas, terminal, DOM streamed from a VM program), they become new runtime values; see [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md) for the topologies considered.

---

## Serving `ol://`

The host serves the shell document and all program source over its own **`ol://` custom protocol**. There is no build pipeline: each requested file is transpiled per file by a persistent bun helper and cached by mtime; every bare specifier resolves bun-style to a canonical URL — no import map, nothing special-cased — and CJS dependencies are ESM-ified once, as the general rule.

Two document shapes are served:

- **The shell document**, at the window's root: doctype, charset, one module script (the shell program's entry), nothing else. The shell mounts `document.body`.
- **A citizen document**, at `ol://<program-id>`, for an iframe seat: the same empty shape, per origin, with that seat's identity token injected by the host (*Transport*). Its program mounts its own `document.body`.

A same-DOM seat gets no document. The shell hands the program a root element and imports its entry module into the shared realm; the program mounts what it is given. *Held open:* an `.html` entry as the escape for a program that owns its whole document — now specifically the iframe-citizen case.

---

## Transport

One hop. One protocol shape.

A surface program calls the SDK; the SDK serializes the call and posts it through wry's IPC channel via `window.__wry_ipc.postMessage(<json>)`. The host installs the `window.__wry_ipc` name itself — an initialization-script alias over the `window.ipc.postMessage` wry injects — and registers `WebView::set_ipc_handler` once, on the window's webview. Each call parses the JSON, resolves the sender to a process id, attaches a `Context { process_id }`, calls the matching engine function, and resolves the call by injecting `evaluate_script("__sdk.resolve(<id>, <payload>)")`. `<payload>` is the full response envelope (`{id, result|error}`), so the SDK's shape-based demultiplexing holds on both channels.

Unsolicited events from the engine ride the same channel in the other direction: `__sdk.event(<payload>)`. The SDK distinguishes responses (`id` + `result|error`) from events (`event` field) by message shape. See [`engine.md`](engine.md#reactivity-wiring) for the end-to-end push chain.

**Per-seat identity.** One webview now carries many protocol identities: every seated program is its own process ([`engine.md`](engine.md#containment)). At seat creation the host issues an identity token; every request from that program's SDK instance carries it, and the IPC handler maps token → process id before attaching `Context`. Everything downstream of `Context` is unchanged, so boundaries and commit attribution hold at seat granularity.

**How the token gets there is the load-bearing part.** Commits attribute to process identity engine-side, so a parent that handled its citizen's token could write history *as* that citizen. Two tiers, two deliveries:

- **Same-DOM seat** — the token rides the parent's channel, issued through the shell's seat provider. Shared realm, shared fate: the tier confers no wall, and the token claims none.
- **Iframe seat** — the host injects the token into the frame directly, in the initialization script it serves with that origin's document. The parent may *gate* a citizen (a visible, auditable intent to the host) but never read, drop, or forge its traffic.

The host does not interpret substrate operations — it hands them to the engine. VM programs speak the same protocol shape over stdio JSON-lines; the engine reads their stdout directly, without going through the host.

### SDK surface

A program imports the SDK and calls the substrate operations it needs; surface programs render with their DOM library of choice. The op surface is owned by [`sdk.md`](sdk.md); a worked example is under *Authoring Programs* below.

React hooks live in the host's UI library (`host/react/`), shipped as `@openlight/react`. The starting hook is `useRead(places)` — registers a `subscribe` first, then fetches via `read`, re-fetches on `place_changed`, unsubscribes on unmount. The order is load-bearing; see [`sdk.md`](sdk.md). A richer hook vocabulary may emerge through use.

---

## Authoring Programs

Two shapes for the two kinds.

**Surface program** (`runtime: 'webview'`). A TSX entry that renders its component tree. `body.executable` is the entry's path, resolved against the declaring project's root. No shebang, no bundle step — the host serves the source (*Serving `ol://`*).

```tsx
import { useRead } from '@openlight/react'
import { createRoot } from 'react-dom/client'

function MyProgram() {
  const data = useRead([/* ... */])
  return <div>{/* ... */}</div>
}

createRoot(document.body).render(<MyProgram />)
```

The program is a substrate chunk with `body.executable` pointing at its entry source and `body.runtime: 'webview'`. When the engine starts it, the surface provider asks the host to mount a seat; the entry module then runs and mounts the root its seat gives it — `document.body` for a whole-document program, and for a same-DOM seat whatever element the shell hands in (the slot provider's shape is open — [`programs.md`](programs.md) §5).

**VM program** (`runtime: 'vm'`). An executable file with a shebang, run as a standalone process inside the VM. The shebang determines the interpreter and what APIs the program has. The pilot's first-party VM programs use Bun because the SDK is TypeScript:

```ts
#!/usr/bin/env bun
import { read, commit, awaitRun } from '@openlight/sdk'

const self = await read([process.env.PROCESS_ID!])
// ... do work, call APIs, write to substrate ...
process.exit(0)
```

**Lifecycle differs by kind.**

- *VM programs* end when their process exits (`process.exit()` or stdout closing). Stateless tools exit when the work is done; resident programs stay alive in their own loop.
- *Surface programs* don't end by reaching a last statement — the runtime keeps the page alive. A surface program ends when its seat unmounts (the person closes the tile), on `cancel`, on timeout, or when it calls the `exit` op ([`engine.md`](engine.md)) — the standard self-dismissal path.

**State lives in the substrate.** Programs use `read` and `commit` (and `useRead` for reactive reads) for anything that persists. There is no separate state-persistence API. Per-run state that must stay separate from shared program state rides in the run's argument.

**Process identity.** A program learns its own process id through its runtime's channel: a VM program reads `process.env.PROCESS_ID`; a surface program reads `window.__openlight_process` for a whole-document program (the shell, an iframe citizen), or takes it from the seat that mounted it. Each run is a distinct process chunk ([`engine.md`](engine.md)) — two runs of the same program with identical arguments coexist as different chunks.

---

## Buffers — the default agent driver

Buffer *semantics* are settled and their *realization* is not ([`engine.md`](engine.md), *Buffers*; the call is open between an engine-native driver registry and dissolution into live integrations — [`research/arc/selection.md`](research/arc/selection.md) §14.3). The host's duty is contingent on it, and stated that way rather than assumed:

- **If the driver registry is taken**, the host ships the **default agent buffer driver**: an append-only file family in `.ol/` beside the db, registered at boot in the shape of a runtime provider, durable across engine stops, and living outside the VM so a killed program cannot take its own trace with it.
- **If buffers dissolve into live integrations**, the host ships nothing here and the retention duty moves to the integration daemon.

Nothing else in this file depends on the call. v0.1's streaming is throttled partial commits either way ([`engine.md`](engine.md), *Streaming convention*).

---

## Boot sequence

Host startup has a fixed order. Steps 2–4 and 7–9 are the multi-mount duties: the cascade is file-aware and therefore host code, while the mount registry and federation are the engine's ([`engine.md`](engine.md#engine-api-callable-from-the-host)).

1. **Initialize tokio runtime.** The engine and runtime providers need it; tao's event loop runs on the main thread.
2. **Resolve active project path.** From CLI args or working directory.
3. **Walk the mounts cascade.** Read the active project's `.ol/project.toml`; for each `[[mounts]]` entry, read that project's `.ol/project.toml` in turn; recurse. Deduplicate by canonical absolute path. Detect cycles; reject with an error. The host project and engine project must appear in the resolved cascade (most projects' data references their archetypes); if either is missing, refuse with a clear error naming the missing entry. v0.1 also refuses any peer whose db schema version differs from the active project's (migration is a v0.2 concern).
4. **Open all dbs.** `Db::open(<active>)` read-write; `Db::open_read_only(<peer>)` for each peer. Both take the *project* path — the db resolves `.ol/db` beneath it. The read-only open never creates, migrates, or seeds, and refuses a schema version other than this build's — step 3's rule, enforced again at the file ([`db.md`](db.md#lifecycle)).
5. **Open the engine.** `Engine::open()` returns `(Engine, mpsc::Receiver<HostCmd>)`. The host keeps the receiver to drain on its event loop.
6. **Register runtime providers.** `engine.register_runtime("vm", …)` and `engine.register_runtime("webview", …)`. Both are host-crate types; the engine ships only `native`.
7. **Configure the VM.** Hand the VM provider the FS-mount table: active project at `/active/` read-write, each peer at `/peers/<project-id>/` read-only. The VM starts; programs spawned later run inside it.
8. **Mount projects.** `engine.mount_project(id, db, ReadOnly, branch)` for each peer; `engine.mount_project(active-id, active-db, ReadWrite, "main")` for the active project. The engine subscribes to the active project's commit broadcast for reactivity; read-only mounts contribute reads but not events.
9. **Boot-time validation.** Ask the engine to validate that every placement in the active project's db has its `on` resolve in some mount. Missing references — most often a missing host or engine mount — return as a list; surface them and refuse to enter the event loop. No half-loaded state.
10. **Open the window and start the shell suite.** The host creates the window and its one webview, resolves the active session, then starts the shell, sidebar and tab-bar through `engine.run(…, Context { process_id: None })` in `launch` mode, passing the session as the process's place. Two consequences of `process_id: None`, both law: the call carries **no frame**, so every chunk the declaration creates must name its owner — `launch` mode supplies it, the session — and the boundary is the host's own, full reach over the active project ([`engine.md`](engine.md), *Governance at `commit`*). The boot suite's own boundaries are narrow and stated at [`programs.md`](programs.md) §1. The host then navigates the webview to the shell's entry with the shell's process id stamped in; the shell seats the rest. The palette is started on demand when the leader key fires, with the host placing its session overlay.
11. **Enter the event loop.** `event_loop.run(...)` on the main thread, draining `HostCmd`s from the engine, wry IPC messages, and tao's window events.

Shutdown reverses: cancel running processes, await `engine.shutdown()`, drop the VM (which unmounts FSes), drop dbs, exit.

**Single-host-per-db.** v0.1 assumes one host process per project; concurrent cross-host access and cross-host reactive notification are not implemented. Mechanism and rationale: [`engine.md`](engine.md#engine-api-callable-from-the-host); horizon path: [`horizon.md`](../horizon.md).

---

## What Is Open

- **The sovereign citizen's return path.** Requests from an iframe citizen are closed by host-direct token injection, but responses and events are not: [`engine.md`](engine.md#reactivity-wiring) step 4 evaluates script *against the shell document, which routes to the addressed slot* — and a parent that routes can read and drop. The two claims cannot both stand for a sovereign seat. Either the host addresses frames directly, or the sovereign tier is honest about what it does not protect. Owed to the author; nothing else in the transport depends on which way it goes.
- **Per-frame token injection.** That host-direct injection lands per-frame on all three wry backends is confirmed for none of them yet. If a backend cannot, iframe seats degrade to the same-DOM guarantee on that platform, explicitly.
- **The shell-injected shared runtime.** Hundreds of same-DOM seats should share one V8, one React copy, one scheduler — the shell injects the shared runtime and seats import it rather than each bundle carrying its own. This is also the exit from bundling debt. Shape unspecified.
- **WebKitGTK.** WebGPU and site-isolation both lag there. A pilot policy is needed: test early, or demote Linux explicitly.
- **Crash blast radius** of the one-document model on the weaker site isolation of WebKit. Reload-recovery is cheap by design — surfaces are disposable and the view lives in the field — but it is unmeasured.
- **React hooks surface.** `useRead(places)` is the starting hook; richer vocabulary (mutations, typed-event subscriptions, Suspense) may appear through use. The full surface is [`sdk.md`](sdk.md)'s.
- **`.html` entries.** Whether a program may own its whole document, as the iframe-citizen escape (*Serving `ol://`*).
- **The buffer driver**, contingent on engine.md's realization call (*Buffers*).
- **What owns the first session.** Boot step 10 resolves an active session, and creates one when none exists — but a session must outlive the process that created it, so the frame default cannot own it. Carried with [`bootstrap.md`](bootstrap.md)'s same question.

---

## Directory

The host project ships:

```
host/
  src/               — Rust source: window/tao/wry, ol:// protocol handler, IPC
                       routing and seat commands, mounts cascade walker, VM and
                       surface runtime provider implementations, keychain.
  react/             — TypeScript UI library (@openlight/react): React
                       components, tokens, and hooks (useRead, future
                       useCommit/useRun) used by surface programs. Lives here
                       for v0.1; may extract later.
  programs/          — first-party host-shipped programs, one package each:
                       shell, sidebar, tab-bar, palette, read-tile (grows into
                       `reader`; programs.md §3, §8). Surface programs in TSX,
                       served from source over ol://.
  .ol/db, .ol/project.toml
```

The host depends on the `db` and `engine` crates. The runtime-agnostic SDK package (`@openlight/sdk`) lives in the engine crate; the React UI library is host-shipped because it is coupled to surface programs. The root bun workspace mirrors the cargo workspace — one package per program. See [`pilot.md`](pilot.md#stack) for the full repo layout and [`engine.md`](engine.md) for the SDK and runtime provider contracts.
