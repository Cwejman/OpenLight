# Program Runtimes and Surfaces — April 2026

How a program runs, and how it reaches a surface (DOM, WGPU, terminal, native widgets). The pilot picks a narrow path; this research documents the full territory so future work can reach for what's deferred without re-running the survey.

The driving question: **can a program in a folk-like language be one thing — one source file, one process identity — that has both a UI surface and capabilities (fs, network, shell, substrate) without becoming a framework?** The pilot's answer is "not in the unified-runtime sense; yes in the composition sense." This file shows why each unification path was considered and what the costs were.

---

## Frame

Three concerns sit on different axes:

- **Program runtime** — JS-in-webview-V8, Bun, Node, Python, Rust, WASM, Pyodide.
- **Surface** — DOM (webview), DOM (non-browser), WGPU, terminal, native widgets, none.
- **Capabilities** — fs, network, shell, substrate. Each gated by the engine.

The unification question was: what arrangement lets a program of any language reach any surface, with capabilities, while staying folk-feeling?

---

## Hard constraint discovered

**Bun and wry cannot share a process.** Wry uses the OS-native webview (WebView2 on Windows, WKWebView on macOS, WebKitGTK on Linux). The webview's V8 isolate is owned by Microsoft / Apple / WebKitGTK; Bun's runtime is a separate JavaScriptCore-based process. There is no API in wry or in Bun for embedding one inside the other.

This rules out the runtime-fusion approach (Electron's `nodeIntegration`) without a custom webview build. Every "unified single program" topology has to confront this.

---

## Topology survey

### A. Embedded runtime in webview process — Electron with `nodeIntegration`

A custom Chromium build that embeds Node.js into the renderer process's V8 isolate. The renderer's JavaScript context has both browser globals (`window`, `document`) and Node globals (`require`, `process`, `Buffer`, `fs`) visible simultaneously. Synchronous fs from React works; everything is one process, one isolate, one heap.

- **Maturity.** Production for 10 years (Electron 1.x–4.x). VS Code, Slack, Discord, Atom all built on this default. Not novel.
- **Deprecation reason.** Untrusted content (remote URLs, iframes) inheriting the full Node API. XSS becomes "read every file the user can read." Industry moved to context isolation + preload + `contextBridge`.
- **Why it doesn't transfer to us as deprecated.** We plan VM containment per program (horizon). The "untrusted content" attack surface is closed at the OS level by the VM. The reasons Electron walked away don't apply if the unit of trust is the program/VM.
- **What it would cost us.** Building our own Electron-style shell — custom Chromium build, embedded Bun (replacing Node), custom event loop integration. Multi-month engineering. ~150MB binary baseline.

### B. Process-separated, IPC-bridged — Tauri

OS-native webview in process A; Rust (or Bun, in our case) in process B. Capabilities exposed as commands; frontend calls `invoke('cmd', args)` over IPC. Webview is sandboxed; host has system access.

- **Maturity.** Tauri ~5 years, mature, ~10MB binaries. Modern norm for "small desktop app with web tech."
- **Async-only.** Every capability call is an IPC roundtrip. Cheap (~µs) but not zero.
- **Mechanism.** Webview's `postMessage` to host; host registers handlers; host injects responses via `webview.evaluate_script`.
- **Variations.**
  - **B1 — Tauri proper.** Rust host, JS frontend.
  - **B2 — Bun-driven webview.** Bun process spawns/owns wry; Bun is the host. Bun has fs, network, substrate; webview talks to Bun via wry IPC. Same separation as Tauri, host language differs. Mechanically possible; not productized as a turnkey thing.
  - **B3 — Tauri + thicker SDK.** Generous library wraps `invoke` calls into idiomatic-looking JS — `import fs from '@x/fs'; await fs.readFile(p)`. Developer experience approaches "unified"; runtime stays split.

### C. Custom React reconciler — render in Bun, emit to surface

`react-reconciler` is the public package React publishes for building custom renderers. It provides:
- The diffing algorithm.
- Component lifecycle (mount, update, unmount, error boundaries).
- Hooks (`useState`, `useEffect`, `useRef`, `useContext`, `useMemo`).
- Concurrent features (Suspense, transitions).
- The machinery for refs (when to attach, when to detach).

It does *not* provide:
- DOM-specific behavior. Every JSX intrinsic (`<div>`, `<button>`) is just a string to the reconciler. You decide what they mean.
- Synthetic event system. react-dom has ~5k LOC of normalization, capture-and-bubble, controlled-input glue. Custom build.
- Attribute mapping (`className → class`, style object → CSS string, boolean attrs, `dangerouslySetInnerHTML`).
- Controlled-component logic (input/textarea/select kept in lockstep with React's value).
- Refs that point to "the real DOM element" — `createInstance` returns whatever you decide; refs hold that.

**Charted precedents.** React Native (production, 10 years), react-three-fiber (mature), Ink (~1500 LOC for terminal renderer), React PDF. Custom reconcilers are a real pattern.

**What it costs for our case.** A reconciler in Bun that emits a stream of typed ops (create, append, set-attr, attach-listener); a host applier that consumes them on a target surface (Blitz, webview, WGPU canvas). The reconciler ~1500 LOC; event/attr/controlled-input plumbing ~3–5k LOC. Real engineering, not days.

**Why it was set aside for the pilot.** Replicating react-dom's behavior is the load-bearing piece — the hard part isn't the reconciler, it's reproducing the things react-dom already does. We become load-bearing on something we'd have to keep aligned with react-dom forever.

### D. DOM shim in Bun — linkedom + unmodified react-dom

Run a real DOM (linkedom or jsdom) in Bun. react-dom renders against it normally — it thinks it's in a browser. Watch mutations via MutationObserver; serialize them; ship to webview which mirrors on the real DOM. Events flow back: serialize, deserialize against the linkedom element, react-dom dispatches.

- **Maturity.** linkedom is ~30k LOC, fast, used by Vite and Astro for SSR. jsdom is ~70k LOC, used widely for testing.
- **Pro.** Inherits all of react-dom for free. No replication.
- **Con.** We become load-bearing on linkedom matching the webview's real DOM closely enough. Mutation serialization is finicky. Refs that point to imperative DOM methods (`scrollIntoView`, `focus`) don't work without proxy magic — the linkedom element is real but not the *same* element as the webview's.
- **Why it was set aside.** Same fundamental issue as C: we replicate the DOM either ourselves (custom reconciler) or via a shim (linkedom). Either way, load-bearing on something complex that we don't own.

### E. SSR + HTML diff — LiveView pattern with React

The third class. Don't run React continuously on the server; render once per state change to HTML, ship to client, apply via a small DOM-diff library.

- **Mechanics.** Each state change → `renderToString(<App />)` → ship HTML → webview applies via morphdom (~5KB). Events captured in webview, sent back to Bun, dispatch to React handlers; handler updates state; render.
- **Uses react-dom unchanged.** No reconciler to build. No DOM to shim. We're consumers of stable libraries.
- **What it gives up.** `useState` doesn't hold across renders (SSR mode resets each call). `useEffect` doesn't fire. Refs are declarative-only (no `ref.current.scrollIntoView()`). Concurrent features mostly absent in `renderToString`.
- **What it gives.** JSX, components, props, conditionals, lists — the structural parts of React work unchanged.
- **State implication.** State has to live elsewhere — substrate, plain variables, your own store. **This actually aligns with the substrate-as-truth value better than `useState`'s in-memory mutable state would have.**
- **Charted at scale.** Phoenix LiveView powers Discord, Fly.io. Hotwire powers Basecamp/HEY. Same shape; the diff applier is what makes it work. Sub-50ms perceived latency over WebSocket; sub-millisecond over local IPC.
- **Event protocol is rich, not form-data.** LiveView's `phx-click`, `phx-change`, `phx-keyup`, `phx-debounce`, etc. carry JSON payloads, not URL-encoded form data. We're not constrained to "submit a form" or "follow a link."
- **Active-input value sync.** A real concern — re-rendering an input while user is mid-typing would reset the value. LiveView solves with a "don't morph focused inputs" rule in the diff applier (~50 LOC).
- **Limit.** 60fps interactions that need tight per-frame coupling (drag with live preview, pan/zoom gestures, sliders with live value display, custom-drawn visualizations driven by pointer position) struggle. Each frame is an IPC roundtrip; while sub-ms locally, 60+ events/sec gets heavy and feels mediated.
- **What needs 60fps in our likely scope.** Tile geometry (host's job, not the program's). Within-program: drag-to-reorder lists, custom sliders, charts highlighting on hover. Hover effects, transitions, animated state changes — CSS handles natively. Scrolling — browser-native. The hard 60fps cases inside programs do exist.

### F. Native UI from folk languages

- **Tcl/Tk** — built into Python (Tkinter), 30 years mature, looks dated, multi-platform with OS-specific look.
- **Python + Toga / PyQt / Kivy** — folk language, native widgets, OS-divergent look.
- **Slint** — markup-based components (`.slint` files); language bindings for Rust, C++, Python, JS. Designed-looking, multi-language by construction. Less folk than Tk; more than React.
- **Lazarus / Free Pascal, REBOL/Red, LÖVE/Lua** — actual folk-feeling, niche audiences.
- **Dioxus + Blitz** — Rust component tree rendered via Blitz (Stylo + Vello on WGPU). Designed-looking, declarative; Rust-flavored.
- **Iced, egui, libcosmic, gpui** — all Rust, all good in Rust, all not folk in TS or Python.
- **Compose Multiplatform** — Kotlin + Skia. Multi-platform, designed-looking. Kotlin is reasonably folk.
- **Flutter / Dart** — one renderer everywhere, consistent visual; Dart adoption stays narrow.

**Honest read.** There is no Tk-grade folk-language combination that *also* produces a designed-feeling modern UI without significant framework adoption. The combinations that look modern (Slint, Dioxus, Compose) lean on a primary language ecosystem the way React leans on JS. "Go native, stay folk, look modern" doesn't have an off-the-shelf answer.

### G. Embedded JS runtime in host — deno_core, QuickJS

Embed a JS runtime inside the Rust host. Programs run in-process. No extra process hop, no IPC. Host owns the renderer (Blitz / WGPU / etc.).

- **Maturity.** deno_core is mature; QuickJS is small and fast. Both embeddable.
- **Cost.** Embedded JS engines have less of the Node ecosystem than Bun. fs etc. are host-implemented (cheap). No Bun-specific APIs unless we shim them.
- **Why deferred.** Doesn't honor VMs as the security boundary — programs run in-host, no isolation. Can't reach the long-term goal of language-agnostic programs in their own VMs.

### H. WASM as the program runtime

Every program is a WASM module. Source: any language that compiles to WASM (Rust, TS via Bun, Python via Pyodide, AssemblyScript, Go, C). The host runs a WASM runtime (Wasmtime); exposes host functions for substrate, capabilities, surface ops as Component Model interfaces (WIT).

- **What it gives.** One sandbox model. One engine surface. Language-agnostic from day one. Capability-by-interface maps cleanly onto WIT imports.
- **Maturity.** WASI Preview 2 / Component Model are recent (2024). Tooling improving but not stable. Many languages still target Preview 1 only.
- **Live compilation.** Bun: `bun build --target=wasm` works. Rust: `cargo build --target wasm32-wasip2`, fine. Python via Pyodide: heavy, ~10MB.
- **Why it was set aside for the pilot.** WASM is segregated from the JS ecosystem; React-DOM doesn't run in WASM cleanly (you'd run JS-in-WASM via QuickJS-on-WASM, getting nested and slow). Library compatibility is poor. Component Model is too young for surface interfaces. Reconsider for the language-agnostic horizon.

### I. Server-rendered HTML + client hydration (Astro / Next-style islands)

Server renders HTML; client hydrates specific "islands" with real React. Static parts stay static. The 60fps-needing components become islands; the rest is server-rendered.

- **Mechanics.** `'use client'` directive marks components for hydration. Build splits the code; the runtime delivers the right artifacts to each side.
- **What it gives.** Most of the UI is server-rendered (cheap, simple); islands handle the interactivity (full React). One source file with the boundary marked.
- **What it costs.** Two runtimes per program — a "server" (Bun) for the SSR shell, a "client" (webview-V8) for islands. Build-time split. Hydration boundaries to debug. Framework-shaped.
- **Why it was set aside.** Reintroduces the runtime split inside a single program, with a build pipeline mediating. Framework-shaped instead of folk-Unix-shaped.

---

## Component agnosticism — the honest finding

There's no clean way to define UI components language-and-technology-agnostic at the source level. Three partial paths exist:

- **Web Components / Custom Elements.** Standard browser feature. Defined in JS, consumed from any framework that produces HTML. Works inside DOM only. The component is JS code; consumer can be any language that produces HTML.
- **Slint, QML, Qt Quick.** Component declarations in markup files (`.slint`, `.qml`). Multi-language bindings. Closest to true language-agnostic for non-web contexts. Not React; not DOM-shaped at the source level.
- **Protocol-level (WIT or similar).** Define a component as a typed interface — props, events, slots — in an IDL. Multiple languages implement bindings. Theoretically agnostic; practically Component-Model-tier maturity.

So whatever tech the component library is written in is slightly first-class. Other languages consume it either by being in the same runtime or by talking to it over a stable protocol. For TS+React, "the protocol" is the React element tree shape. There is no universal answer.

---

## The composition realization

The first-party UI primitives already include compositions of programs (see `pilot/host.md` — `ui/recipe`, the spawned-composition concept, the tile tree). A composition of programs **is** an island system, just at a coarser primitive: the program.

- Astro's islands are subtrees of one app. Ours are programs of one composition.
- Conceptually the same shape; achieved with substrate primitives we already have.
- The visual split between programs is a presentation choice, not a structural limit. The host controls tile geometry; rendering a composition as a seamless surface (no padding, shared background, continuous treatment) is CSS in the host.
- Programs that belong to a composition can read as one designed surface even though they're independent webview processes.

This dissolves a substantial part of the unification anxiety. We don't need to fuse runtimes inside a program because we have a primitive *above* the program — the composition — that already does what islands do.

---

## What modern webviews actually offer

Worth grounding plainly:

- WebView2 (Windows, Edge/Chromium-based), WKWebView (macOS/iOS, WebKit), WebKitGTK (Linux). All sandboxed browser engines.
- All do 60fps. Drag-and-drop, animations, gestures — all routine. Linear, Notion, Figma, Slack — all webview-stack-equivalent.
- The cultural read on webviews shifted; the 5-years-ago "looks down on" reaction is dated.
- The 60fps concern is *only* about cross-process coupling — when rendering is in the webview but state-updates-on-frame-N must round-trip to a server. If the program's logic lives in the webview, no roundtrip per frame, full 60fps.

---

## The pilot path — chosen

Programs come in kinds. The kind is declared on the program archetype.

- `runtime: 'webview'` → runs in a webview. The runtime is the webview's V8. Full client-side React + react-dom. Browser APIs available. Capabilities (fs, network, etc.) reach the host through the SDK over wry IPC. 60fps interactions are normal. This is the Tauri shape.
- `runtime: 'vm'` → runs inside a Linux VM with shebang-declared interpreter. The pilot's first-party VM programs use `#!/usr/bin/env bun` because the SDK is TypeScript-only; the runtime kind itself doesn't bind to Bun. fs, network, shell available through whatever the interpreter provides inside the VM. Substrate via SDK over stdio JSON-lines. Folk Unix shape.

Both kinds:
- Are folk-natural in their respective lanes.
- Use the same SDK surface (`scope`, `commit`, `run`, `awaitRun`, `subscribe`); transport differs.
- Render compositions seamlessly when the host wants them to.
- Communicate program-to-program through the substrate.

A complex UI that needs both DOM and fs is a **composition** of two or more programs — a UI program (webview) and a tool program (Bun), bound by their shared scope, talking through substrate. The composition reads as one thing to the user.

This isn't a last-resort compromise. It's the substrate's natural shape — small folk programs composed, joined by the field, each clear about what it is. Closer to the values than runtime fusion would have been.

---

## What's deferred (not abandoned)

These remain reachable from the pilot's foundations. Each was set aside because the engineering investment was disproportionate to the pilot's scope, not because it was wrong.

### Unified single-runtime programs

A program with both DOM and capabilities in one source file, one process, one identity — Electron-with-`nodeIntegration` semantics. Reachable via:

- **Custom Chromium with embedded Bun.** Multi-month engineering. ~150MB binary. The horizon-VM containment closes Electron's deprecation argument.
- **Custom React reconciler that emits to webview.** Real engineering (~weeks); we own the renderer and replicate react-dom behavior. Not deferred for impossibility but for "we'd be load-bearing on something we'd need to keep aligned with react-dom forever."
- **DOM shim in Bun (linkedom + react-dom).** Same load-bearing concern with a different shim.
- **SSR + HTML diff (LiveView pattern).** Closest to "uses unmodified libraries"; gives up `useState` (which the substrate replaces anyway). Limit: 60fps interactions inside one program. Worth revisiting if the substrate-state-as-source pattern proves out and 60fps gaps stay narrow.

### Other surfaces

- **WGPU.** Programs that render via WGPU — either as a webview-runtime canvas, or as a new runtime value (e.g. `runtime: 'wgpu'` or `'vm-wgpu'`) where the host owns a WGPU surface and the program drives it. Implementations exist (Iced + WGPU, raw WGPU); needs a renderer in the host and a surface protocol from programs.
- **Terminal.** Programs rendering ANSI to a terminal-shaped surface. ratatui, Ink, Textual exist; the host would need to host a terminal-buffer surface.
- **Native widgets.** Per-platform (libcosmic, GTK, AppKit). Cross-platform ones (Slint, Dioxus-Blitz). Useful if "feels OS-native" becomes important.

### Language-agnostic programs

The shebang model already permits it: `#!/usr/bin/env python`, `#!/usr/bin/env ruby`, `#!/usr/bin/env <whatever>`. The runtime lives in the VM. The SDK becomes available in those languages — either as a reimplementation of the protocol per language, or as a thin client over the stdio JSON-lines transport.

For non-TS programs to drive a webview surface, they'd need either:
- The composition path: their UI is rendered by a sibling TS+webview program; the non-TS program writes to substrate, the webview program subscribes.
- A separate "host-rendered surface" path (Path 2 from the exploration): non-TS program emits surface ops; host applies via Blitz or similar. Future work.

### Host-rendered surfaces (Path 2)

Programs in any language emit a stream of surface operations (DOM mutations, WGPU draw calls, terminal cells); the host owns the renderer (Blitz for DOM, WGPU surface for native, terminal buffer for terminal); the host applies. Surface-agnostic at the program side, language-agnostic at the surface side. Substantial engineering: a surface op protocol, a host renderer per surface kind, the engine's routing logic.

The closest existing model is React Native's bridge pattern, which proves it works at scale. Reaching for it in our context would be the right move when (a) language-agnosticism becomes important, and (b) Blitz or similar Rust DOM renderers are mature enough to lean on.

### WASM as program runtime

Re-reachable when WASI Preview 2 / Component Model tooling stabilizes and WASM-DOM bindings become practical. The substrate's `program` archetype could declare `runtime: 'wasm'` and the engine would route accordingly. The capability declaration model (already in the spec) maps cleanly onto WIT imports.

### Going entirely native

Skipping webviews altogether. Slint or Dioxus-Blitz or Compose-Multiplatform for the UI. Trades web-stack maturity for designed-feeling, smaller-binary, no-Chromium UIs. Real engineering investment per platform. Worth revisiting if the Web platform's cost (binary size, cross-platform inconsistency in WebView2 vs WKWebView vs WebKitGTK, evolving sandbox quirks) becomes binding.

---

## Things to remember

- **Wry's webview is the OS-native one.** WebView2 / WKWebView / WebKitGTK. Sandboxed browser. Cannot embed Bun. Can inject JS at init via `set_initialization_script`. Can call into the page via `evaluate_script`.
- **Bun and wry can't share a process.** Load-bearing constraint.
- **react-reconciler is renderer-agnostic.** Provides diffing, lifecycle, hooks, refs (machinery only). Does not provide DOM behavior — that's all in react-dom.
- **react-dom's behavior is the heavy part.** ~5–8k LOC of event normalization, attribute mapping, controlled-component glue. Replicating it (or shimming around it) is the load-bearing cost in C and D.
- **LiveView's pattern is industrial-strength.** The HTML-emit-and-diff path is proven at Discord/Fly.io scale; it's not exotic.
- **Phoenix-style event protocols are rich.** `phx-click`, `phx-change`, `phx-keyup`, `phx-debounce` carry JSON payloads. Not constrained to form-encoded data.
- **Modern webviews do 60fps.** The 60fps concern is specifically about cross-process coupling, not about webviews themselves.
- **Compositions are our island system.** Already a substrate primitive; doesn't need additional invention.
- **`useState` and substrate-as-truth are in tension.** The pilot keeps `useState` because client-side React lives in the webview; substrate-as-truth still applies for cross-program state. Future paths (E, the LiveView shape) lean even harder into substrate.

---

## Sources and pointers

- Electron architecture history: [Electron context isolation docs](https://www.electronjs.org/docs/latest/tutorial/context-isolation), [security tutorial](https://www.electronjs.org/docs/latest/tutorial/security).
- Tauri's IPC bridge: [Tauri commands](https://tauri.app/v1/guides/features/command/), [IPC architecture](https://tauri.app/v1/references/architecture/inter-process-communication/).
- React custom renderers: `react-reconciler` package; React Native architecture; [react-three-fiber](https://github.com/pmndrs/react-three-fiber); [Ink](https://github.com/vadimdemedes/ink).
- Phoenix LiveView: [the pattern](https://hexdocs.pm/phoenix_live_view/), [event bindings](https://hexdocs.pm/phoenix_live_view/bindings.html), [morphdom](https://github.com/patrick-steele-idem/morphdom).
- linkedom: [project](https://github.com/WebReflection/linkedom).
- Blitz (Dioxus team): [project](https://github.com/DioxusLabs/blitz), Stylo (Servo CSS), Vello (WGPU painter).
- WASM Component Model and WIT: [WASI Preview 2](https://github.com/WebAssembly/WASI/blob/main/Proposals.md), [Component Model overview](https://component-model.bytecodealliance.org/).
- Slint: [project](https://slint.dev/).
- Wry: [tao + wry primitives](https://github.com/tauri-apps/wry).

---

## What this session settled

- **Pilot.** Programs come in kinds, declared via a single `runtime` field: `runtime: 'webview'` → webview-V8 with client-side React; `runtime: 'vm'` → shebang-spawned process inside a Linux VM (Bun for first-party programs because the SDK is TS, not as a property of the kind). Same SDK; different transport. Compositions handle the "complex UI" case.
- **Future.** Each deferred topology has a known reach point. The substrate's program archetype is general enough to admit them when the engineering becomes proportionate.
- **What was abandoned.** Nothing. The exploration walked the territory; it did not close any direction off.
