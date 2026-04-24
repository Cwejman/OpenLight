# UI Stacks — Technically Adoptable Shortlist

Filtered from `ui-landscape-draft.md` down to stacks you can actually install and build on. Enough per entry to decide whether to dig further without a separate search. Historical/research-only references live in the draft file.

Grouped by ecosystem. Platform cells: ✅ supported · ⚠️ possible/limited · – not supported.

---

## Rust ecosystem

### iced
- **What.** Elm-architecture widget toolkit for Rust, rendered via wgpu.
- **Language / paradigm.** Rust / Elm (model + update + view + messages).
- **Renders to.** wgpu (Vulkan / Metal / DX12 / OpenGL / WebGPU).
- **Platforms.** Desktop ✅ · Web ✅ (wgpu → WebGPU; WebGL/WebGPU is build-time choice) · Mobile ⚠️
- **Maturity.** 0.x, but production-used (System76 Cosmic DE, several tools).
- **Distinct.** Clean, small API; pure functions for view; Cosmic proves a path to Smithay-based Wayland compositor. Theme + per-widget style functions (not CSS).
- **Watch.** Elm ceremony for stateful interactions. Web support is secondary focus; `iced_web` DOM runtime is stagnant — use wgpu/WebGPU path.
- **Link.** https://iced.rs · https://github.com/iced-rs/iced

### Dioxus (with WebView)
- **What.** React-like component library for Rust. Hooks, `rsx!` macro (JSX-shape).
- **Language / paradigm.** Rust / component + hooks.
- **Renders to.** System webview (wry/tao) by default; also real DOM on web; native Blitz when ready.
- **Platforms.** Desktop ✅ · Web ✅ · Mobile ✅ · TUI ✅
- **Maturity.** Production (0.6.x series, SDK shipped).
- **Distinct.** Familiar React mental model in Rust. One component source across many targets. CSS via inline/classes.
- **Watch.** WebView target means you still ship a browser engine. Native Blitz path is pre-alpha.
- **Link.** https://dioxuslabs.com

### Dioxus + Blitz
- **What.** Native HTML/CSS renderer for Dioxus components using Servo's stylo + Taffy + wgpu.
- **Language / paradigm.** Rust / component + hooks + real HTML/CSS.
- **Renders to.** wgpu directly, bypassing webview.
- **Platforms.** Desktop ✅ · Web ✅ (via Dioxus web target, not Blitz) · Mobile ⚠️
- **Maturity.** **Pre-alpha.** Maintainers discourage production use.
- **Distinct.** Real CSS layout engine (stylo), native GPU rendering, no browser engine carried. Architecturally the most aligned with "JSX-shape + CSS + native wgpu."
- **Watch.** Breakage and missing features expected. Not a current production bet; worth watching quarterly.
- **Link.** https://github.com/DioxusLabs/blitz

### Makepad
- **What.** Live-coded DSL-driven UI framework; hot-reload while the app runs.
- **Language / paradigm.** Rust + live DSL / reactive live.
- **Renders to.** wgpu.
- **Platforms.** Desktop ✅ · Web ✅ · Mobile ✅
- **Maturity.** 1.0 track (stable-ish, shipped apps like Robius).
- **Distinct.** Hot-reload designed in from the start — you see changes as you type. The DSL aims to be genuinely pleasant (not hostile like most custom languages).
- **Watch.** Smaller ecosystem; DSL is another thing to learn alongside Rust.
- **Link.** https://makepad.nl · https://github.com/makepad/makepad

### egui
- **What.** Immediate-mode GUI in Rust. Minimal, fast, portable.
- **Language / paradigm.** Rust / immediate mode (redraw every frame from state).
- **Renders to.** wgpu / OpenGL / WebGL.
- **Platforms.** Desktop ✅ · Web ✅ · Mobile ⚠️
- **Maturity.** Production. Widely used.
- **Distinct.** Trivial to embed (one crate). Near-zero state management — you just describe what you want each frame. Excellent for tools, debug panels, embedded UIs.
- **Watch.** Immediate-mode isn't the right shape for rich app UIs (custom animations, text layout, accessibility). Great for inspectors, weak for product surfaces.
- **Link.** https://github.com/emilk/egui

### Xilem / Vello
- **What.** Reactive UI framework (Xilem) built on a GPU-compute 2D renderer (Vello). Raph Levien's project (ex-Druid, author of Inventing-on-Principle-era font tech).
- **Language / paradigm.** Rust / signals + view functions.
- **Renders to.** Vello → wgpu.
- **Platforms.** Desktop ✅ · Web ⚠️ (Vello on web is work-in-progress) · Mobile ⚠️
- **Maturity.** Pre-1.0, active research + implementation.
- **Distinct.** Vello is state-of-the-art GPU 2D (compute-shader rasterization) — could become the reference vector renderer for the decade. Xilem's reactive model is novel, not borrowed.
- **Watch.** Young, shifting design. Long-term ambitious.
- **Link.** https://github.com/linebender/xilem · https://github.com/linebender/vello

### GPUI
- **What.** GPU-accelerated component framework by Zed Industries, powering the Zed editor.
- **Language / paradigm.** Rust / component.
- **Renders to.** Metal (native), wgpu path in progress.
- **Platforms.** Desktop ✅ (macOS primary, Linux in progress) · Web – · Mobile –
- **Maturity.** Production (Zed ships on it).
- **Distinct.** Engineered for a real product; fast, tasteful defaults; component model feels modern.
- **Watch.** Zed-shaped — priorities follow Zed's needs. Cross-platform support lagging. No WM trajectory.
- **Link.** https://github.com/zed-industries/zed/tree/main/crates/gpui

### Bevy UI
- **What.** UI module inside the Bevy game engine. ECS-native.
- **Language / paradigm.** Rust / ECS (entities + components + systems).
- **Renders to.** wgpu (via Bevy renderer).
- **Platforms.** Desktop ✅ · Web ✅ · Mobile ✅
- **Maturity.** 0.x, moving fast, widely adopted in games.
- **Distinct.** Comes with a whole game engine — great if you want rich 2D/3D elsewhere in the app. ECS is an unusual but powerful primitive.
- **Watch.** UI module is actively redesigned; game-engine context is heavy overhead for a typical app.
- **Link.** https://bevyengine.org

---

## TypeScript / JavaScript ecosystem

### Tauri + web framework (React / Svelte / Solid / Vue)
- **What.** Native app shell (Rust) hosting a system webview where the UI runs.
- **Language / paradigm.** TS/JS / whatever web framework.
- **Renders to.** OS webview (WKWebView on macOS, WebView2 on Windows, WebKitGTK on Linux).
- **Platforms.** Desktop ✅ · Web ✅ (same code) · Mobile ⚠️ (experimental)
- **Maturity.** Tauri 2.x is production (Tauri 1.x widely deployed).
- **Distinct.** The folk-like path for TS devs going native. Small binaries (~5-15 MB vs Electron's ~100+ MB). Direct JS ↔ Rust IPC. WebGPU available inside the webview.
- **Watch.** Still a browser engine (just the OS's). Not "pure wgpu native." IPC boundary to Rust backend is a real split.
- **Link.** https://tauri.app

### Electron + web framework
- **What.** Chromium + Node in one process; the battle-tested webview desktop path.
- **Language / paradigm.** TS/JS / whatever web framework.
- **Renders to.** Bundled Chromium.
- **Platforms.** Desktop ✅ · Web (same bundle works in browsers) · Mobile –
- **Maturity.** Production at massive scale (VS Code, Slack, Discord).
- **Distinct.** Universal — bundled Chromium works identically everywhere. Tooling, extensions, auto-update all mature.
- **Watch.** Heavy (~100+ MB per app), memory-hungry, security surface wide. Carries a second Node runtime.
- **Link.** https://electronjs.org

### react-three-fiber
- **What.** JSX bindings for Three.js — write React components that render to a WebGL/WebGPU scene graph.
- **Language / paradigm.** TS/JS / component-based 3D scene.
- **Renders to.** WebGL or WebGPU (via Three.js).
- **Platforms.** Desktop ✅ (Tauri/Electron shell) · Web ✅ · Mobile ✅ (via react-native-webgpu)
- **Maturity.** Production in the creative-coding/data-viz space.
- **Distinct.** JSX all the way to the GPU. Natural for visualization tiles, custom renderers.
- **Watch.** Not a general-purpose UI — it's a 3D scene library. Use for specific visualization views, not chrome.
- **Link.** https://github.com/pmndrs/react-three-fiber

---

## Zig ecosystem

### Mach
- **What.** Modular game/graphics engine in Zig with native wgpu surface, audio, text, sysjs.
- **Language / paradigm.** Zig / ECS-ish modules.
- **Renders to.** wgpu (via mach-gpu, their fork).
- **Platforms.** Desktop ✅ · Web ✅ (WebGPU) · Mobile ⚠️
- **Maturity.** Pre-1.0, pinned to specific Zig versions; actively shipped by Hexops.
- **Distinct.** Coherent native creative-computing stack in a modern systems language. `mach-sysjs` integrates with JS cleanly on web targets. Aligns with pilot.md's post-pilot Zig-substrate direction.
- **Watch.** Zig itself is pre-1.0 and breaking; ecosystem thin; `mach-ui` is sketched, not mature.
- **Link.** https://machengine.org

---

## Kotlin ecosystem

### Compose Multiplatform
- **What.** JetBrains port of Jetpack Compose to desktop, iOS, web, Android. Same `@Composable` functions everywhere.
- **Language / paradigm.** Kotlin / declarative composable functions.
- **Renders to.** Skia (desktop, iOS, web via Skiko), Android native on Android.
- **Platforms.** Desktop ✅ · Web ✅ (Wasm, beta) · Mobile ✅
- **Maturity.** Desktop 1.x stable; iOS stable as of 2024; Web beta.
- **Distinct.** The most-polished single-source cross-platform native UI after Flutter. Kotlin is approachable. Skia all the way down means the rendering is consistent.
- **Watch.** Not wgpu. JVM on desktop (bigger binaries than native-Rust). Web via Wasm-Skia is new.
- **Link.** https://www.jetbrains.com/lp/compose-multiplatform

---

## Dart ecosystem

### Flutter
- **What.** Google's cross-platform UI framework with its own rendering engine (Impeller, was Skia).
- **Language / paradigm.** Dart / widget tree + setState / signals.
- **Renders to.** Impeller/Skia (GPU-backed).
- **Platforms.** Desktop ✅ · Web ✅ · Mobile ✅
- **Maturity.** Production at massive scale.
- **Distinct.** Most polished "one source → everywhere native" story. Hot reload is gold. Tooling mature. Developer experience widely beloved.
- **Watch.** Not wgpu. Google-controlled. Ecosystem lock-in to Dart, which has no life outside Flutter.
- **Link.** https://flutter.dev

---

## .NET / C# / F# ecosystem

### Avalonia
- **What.** Cross-platform XAML UI framework on .NET. Mature alternative to WPF.
- **Language / paradigm.** C# (or F#, VB) / XAML markup + MVVM.
- **Renders to.** Skia.
- **Platforms.** Desktop ✅ · Web ✅ (Blazor/Wasm) · Mobile ⚠️
- **Maturity.** 11.x stable, production.
- **Distinct.** XAML is a known quantity; mature tooling (Rider, Visual Studio). Skia rendering across all platforms. Works anywhere .NET runs.
- **Watch.** XAML verbosity. C# runtime overhead. Not wgpu.
- **Link.** https://avaloniaui.net

### Avalonia.FuncUI
- **What.** F# Elmish bindings for Avalonia. Immutable state + messages + views.
- **Language / paradigm.** F# / Elmish (Elm-on-.NET).
- **Renders to.** Skia (via Avalonia).
- **Platforms.** Desktop ✅ · Web ⚠️ · Mobile ⚠️
- **Maturity.** Production.
- **Distinct.** F# is a friendly typed-functional language. Elmish on top of Avalonia gives you Elm discipline with full .NET access.
- **Watch.** Smaller community than imperative C# Avalonia.
- **Link.** https://github.com/fsprojects/Avalonia.FuncUI

### Fabulous
- **What.** Elmish architecture for .NET MAUI / Avalonia / Xamarin.
- **Language / paradigm.** F# / Elmish.
- **Renders to.** MAUI native / Avalonia Skia.
- **Platforms.** Desktop ✅ · Web – · Mobile ✅
- **Maturity.** Production.
- **Distinct.** Target-agnostic F# Elmish — same view code for desktop and mobile native.
- **Watch.** MAUI itself is a moving target.
- **Link.** https://fabulous.dev

### Bolero
- **What.** F# for Blazor — write WASM web apps in F# with Elmish.
- **Language / paradigm.** F# / Elmish.
- **Renders to.** DOM via Blazor WebAssembly.
- **Platforms.** Desktop – · Web ✅ · Mobile –
- **Maturity.** Stable, production.
- **Distinct.** F# all the way down in the browser, no JS interop layer.
- **Watch.** Blazor WASM bundle sizes; F# is niche.
- **Link.** https://fsbolero.io

---

## Elixir / BEAM ecosystem

### Phoenix LiveView
- **What.** Server-rendered stateful HTML over WebSocket. The server is the source of truth; client receives diffs.
- **Language / paradigm.** Elixir / server-authoritative reactive HTML.
- **Renders to.** DOM (via server-emitted diffs).
- **Platforms.** Desktop – (via wrapper) · Web ✅ · Mobile – (unless paired with LiveView Native)
- **Maturity.** Production at scale.
- **Distinct.** Per-user isolated process on BEAM — natural fit for multi-agent substrates. Server-side state means no client-side sync. Latency-tolerant.
- **Watch.** Requires a persistent server connection. Web-only without LiveView Native.
- **Link.** https://hexdocs.pm/phoenix_live_view

### LiveView Native
- **What.** Same LiveView model rendering to SwiftUI / Jetpack Compose / others.
- **Language / paradigm.** Elixir / server-authoritative reactive native.
- **Renders to.** SwiftUI, Jetpack Compose.
- **Platforms.** Desktop ⚠️ · Web (via regular LiveView) · Mobile ✅
- **Maturity.** 0.4+, shipping but newer than LiveView.
- **Distinct.** One server-side model drives web AND native mobile surfaces.
- **Watch.** Native render mapping is a moving target; per-platform client support varies.
- **Link.** https://native.live

### Scenic
- **What.** Native OpenGL UI framework for Elixir. Runs on Nerves (embedded).
- **Language / paradigm.** Elixir / scene graph + primitives.
- **Renders to.** OpenGL.
- **Platforms.** Desktop ✅ · Web – · Mobile –
- **Maturity.** Mature in its niche.
- **Distinct.** For kiosks, dashboards, embedded. BEAM concurrency for UI supervision.
- **Watch.** OpenGL (legacy). Small ecosystem for general apps.
- **Link.** https://github.com/boydm/scenic

---

## Gleam ecosystem

### Lustre
- **What.** Elm architecture for Gleam. Compiles to both JS (for browser) and BEAM (for server-rendered).
- **Language / paradigm.** Gleam / Elm.
- **Renders to.** DOM (client VDOM) or streamed HTML (server).
- **Platforms.** Desktop – · Web ✅ · Mobile –
- **Maturity.** Pre-1.0 but shipping.
- **Distinct.** Gleam itself is exceptional — tiny, friendly compiler errors (modeled on Elm). Same component source runs client-side or server-side.
- **Watch.** Small ecosystem; Lustre pre-1.0.
- **Link.** https://lustre.build

---

## Clojure ecosystem

### Re-frame + Reagent
- **What.** React wrapper for ClojureScript (Reagent) with a canonical event/effect pattern on top (Re-frame).
- **Language / paradigm.** ClojureScript / Hiccup (UI-as-data) + CQRS-ish event flow.
- **Renders to.** DOM via React.
- **Platforms.** Desktop – · Web ✅ · Mobile – (via React Native bindings possible)
- **Maturity.** Production, battle-tested.
- **Distinct.** Hiccup (`[:div {} "text"]`) makes UI literally data you can manipulate. Aligns with "views are chunks in a typed field."
- **Watch.** Clojure is Lisp — bracket culture is real. React overhead.
- **Link.** https://github.com/day8/re-frame

### Humble UI
- **What.** Desktop-native UI for Clojure, by Nikita Prokopov (Tonsky).
- **Language / paradigm.** Clojure / declarative component.
- **Renders to.** Skia (via Skija).
- **Platforms.** Desktop ✅ · Web – · Mobile –
- **Maturity.** Pre-1.0, Tonsky ships with it.
- **Distinct.** JVM-based but Skia-backed; tasteful defaults; made by someone with strong typography + visual sensibilities.
- **Watch.** Small project, one main author. Desktop only.
- **Link.** https://github.com/HumbleUI/HumbleUI

### Electric Clojure
- **What.** Single program that spans client and server; the compiler places code on the right side.
- **Language / paradigm.** Clojure / reactive DSL crossing network boundary.
- **Renders to.** DOM.
- **Platforms.** Desktop – · Web ✅ · Mobile –
- **Maturity.** V3 stable.
- **Distinct.** Collapses client/server split in source. If server/client blending is a felt pain, this is the sharpest answer in any ecosystem.
- **Watch.** Clojure + unusual reactive model = learning curve. Requires persistent WebSocket.
- **Link.** https://github.com/hyperfiddle/electric

### ClojureDart
- **What.** Clojure compiled to Dart; use Flutter directly.
- **Language / paradigm.** Clojure / Flutter widgets.
- **Renders to.** Impeller/Skia via Flutter.
- **Platforms.** Desktop ✅ · Web ✅ · Mobile ✅
- **Maturity.** Experimental but functional.
- **Distinct.** Flutter's polish without Dart's syntax. Clojure's interactive REPL with Flutter's hot reload.
- **Watch.** Small ecosystem; less mature than CLJS+React.
- **Link.** https://github.com/tensegritics/ClojureDart

---

## OCaml / ReScript ecosystem

### ReScript + React
- **What.** Typed, JS-flavored ML syntax compiled to clean JS; React bindings are first-class.
- **Language / paradigm.** ReScript / React components + hooks.
- **Renders to.** DOM.
- **Platforms.** Desktop – · Web ✅ · Mobile – (React Native bindings possible)
- **Maturity.** Production (origins at Facebook Messenger, now community-led).
- **Distinct.** Arguably the friendliest typed-functional web surface. Familiar JS semantics + strong inference + helpful errors.
- **Watch.** Smaller ecosystem than TypeScript. Community smaller since the ReScript/ReasonML split.
- **Link.** https://rescript-lang.org

### Bonsai
- **What.** Jane Street's incremental-computation-first web framework. Components are `Value.t` and `Computation.t`.
- **Language / paradigm.** OCaml / incremental reactive.
- **Renders to.** DOM.
- **Platforms.** Desktop – · Web ✅ · Mobile –
- **Maturity.** Production at Jane Street; open-source.
- **Distinct.** Algebraically clean — the framework only recomputes what changed, derived from dependency structure.
- **Watch.** Jane-Street-shaped priorities. OCaml + functors = real learning investment.
- **Link.** https://github.com/janestreet/bonsai

---

## Haskell ecosystem

### Reflex-DOM
- **What.** Canonical functional reactive programming for web. `Event t a` and `Behavior t a` as first-class values.
- **Language / paradigm.** Haskell / FRP.
- **Renders to.** DOM (via GHCJS or JSaddle).
- **Platforms.** Desktop – · Web ✅ · Mobile –
- **Maturity.** Production (Obsidian Systems ships with it).
- **Distinct.** The reference FRP implementation. Denotational clarity about state-over-time — signals/hooks are approximations of this.
- **Watch.** Haskell + GHCJS toolchain is heavy. Monad transformer stacks are real. Small community.
- **Link.** https://github.com/reflex-frp/reflex-dom

### Monomer
- **What.** Elm-ish desktop-native UI for Haskell, SDL-backed.
- **Language / paradigm.** Haskell / Elm.
- **Renders to.** SDL.
- **Platforms.** Desktop ✅ · Web – · Mobile –
- **Maturity.** Usable, 1.x.
- **Distinct.** The most approachable Haskell UI on-ramp. Desktop-native without GTK's C dependency surface.
- **Watch.** SDL ceiling on polish. Smaller than Reflex.
- **Link.** https://github.com/fjvallarino/monomer

---

## Pharo / Smalltalk ecosystem

### Glamorous Toolkit / Bloc
- **What.** Moldable development environment on Pharo Smalltalk. Every object declares its own inspector views.
- **Language / paradigm.** Pharo / live image + moldable objects.
- **Renders to.** Skia (via Bloc).
- **Platforms.** Desktop ✅ · Web – · Mobile –
- **Maturity.** Alive and shipping, used as a daily driver by its authors.
- **Distinct.** The deepest architectural alignment with OpenLight of any existing system. "Views per object per use case" is already real. Image-based live development.
- **Watch.** Smalltalk learning curve. Single-image distribution is culturally alien to UNIX world. Web story absent.
- **Link.** https://gtoolkit.com

---

## Nim ecosystem

### Fidget
- **What.** GPU-accelerated vector UI toolkit by Andre von Houck (Treeform). Inspired Figma's internals.
- **Language / paradigm.** Nim / retained-mode.
- **Renders to.** OpenGL.
- **Platforms.** Desktop ✅ · Web – (experimental) · Mobile –
- **Maturity.** Usable but small ecosystem.
- **Distinct.** Coherent one-person-designed stack (Pixie, Fidget, Boxy, Vmath). Vector-first rendering — the aesthetic Figma uses.
- **Watch.** Small community; Nim itself niche; no WebGPU yet.
- **Link.** https://github.com/treeform/fidget

### Owlkettle
- **What.** Declarative GTK4 bindings for Nim.
- **Language / paradigm.** Nim / declarative widget tree.
- **Renders to.** GTK4 native widgets.
- **Platforms.** Desktop ✅ · Web – · Mobile –
- **Maturity.** Actively developed.
- **Distinct.** Native Linux-first look; Nim's Python-ish syntax on GTK.
- **Watch.** GTK4 on macOS/Windows is rough; primarily a Linux story.
- **Link.** https://github.com/can-lehmann/owlkettle

---

## Python ecosystem

### pyimgui + wgpu-py
- **What.** Python bindings for Dear ImGui, rendered via wgpu-py.
- **Language / paradigm.** Python / immediate-mode.
- **Renders to.** wgpu (native WebGPU via `wgpu-py`).
- **Platforms.** Desktop ✅ · Web ⚠️ (wgpu-py web support is limited) · Mobile –
- **Maturity.** Usable for tools.
- **Distinct.** Python is folk-accessible. Immediate-mode fits scientific/engineering tooling. wgpu-py gives modern GPU.
- **Watch.** Immediate-mode isn't right for product UIs. Python deployment story is heavy.
- **Link.** https://github.com/pyimgui/pyimgui · https://github.com/pygfx/wgpu-py

---

## Lua ecosystem

### Love2D (+ Fennel)
- **What.** 2D game framework in Lua; Fennel is a Lisp that compiles 1:1 to Lua.
- **Language / paradigm.** Lua / immediate-mode + callbacks. Fennel / Lisp on the same runtime.
- **Renders to.** OpenGL.
- **Platforms.** Desktop ✅ · Web ⚠️ (via love.js) · Mobile ⚠️
- **Maturity.** Mature in games.
- **Distinct.** Lua is tiny, fast, folk-learnable in an afternoon. Love2D is the folk-friendly GPU canvas.
- **Watch.** Game-shaped — not a general UI framework. OpenGL only.
- **Link.** https://love2d.org · https://fennel-lang.org

---

## Swift ecosystem

### SwiftUI
- **What.** Apple's declarative UI framework.
- **Language / paradigm.** Swift / declarative + property wrappers.
- **Renders to.** Apple native.
- **Platforms.** Desktop ✅ (Apple only) · Web – · Mobile ✅ (Apple only)
- **Maturity.** Production.
- **Distinct.** Native integration with Apple platforms is unmatched. Tooling (Xcode, previews) is excellent.
- **Watch.** Apple-only. No cross-platform option exists for SwiftUI proper.
- **Link.** https://developer.apple.com/xcode/swiftui

---

## Racket ecosystem

### racket/gui
- **What.** Built-in cross-platform GUI library in Racket.
- **Language / paradigm.** Racket / object-oriented widgets + event-driven.
- **Renders to.** GTK / Cocoa / Win32 native widgets.
- **Platforms.** Desktop ✅ · Web – · Mobile –
- **Maturity.** Mature (DrRacket itself is built on it).
- **Distinct.** Ships in the Racket distribution — zero-setup. Racket's teaching heritage is folk-adjacent. "Language-oriented programming" invites DSL-shaped UI code.
- **Watch.** Traditional widget toolkit feel; not GPU-accelerated; no web target.
- **Link.** https://docs.racket-lang.org/gui

---

## Common Lisp ecosystem

### McCLIM
- **What.** Common Lisp Interface Manager — a 1980s presentation-based UI toolkit kept alive in Common Lisp.
- **Language / paradigm.** Common Lisp / presentation types.
- **Renders to.** X11.
- **Platforms.** Desktop ✅ (Linux primary) · Web – · Mobile –
- **Maturity.** Runs; niche.
- **Distinct.** **Presentation types** — every rendered object carries its type and can be clicked to invoke operations valid for that type. Architecturally "typed field + interface" forty years early.
- **Watch.** X11 only; small community; Common Lisp barrier.
- **Link.** https://mcclim.common-lisp.dev

---

## HyperCard-lineage / "whole-app platforms"

### Decker
- **What.** Modern HyperCard homage by Internet Janitor. Pixelated aesthetic, deliberately constrained, web-native, with a small scripting language (Lil).
- **Language / paradigm.** Lil scripts / card-based.
- **Renders to.** HTML5 Canvas.
- **Platforms.** Desktop ⚠️ (via Electron wrapper) · Web ✅ · Mobile –
- **Maturity.** Alive, stable, small shipped games and tools.
- **Distinct.** The folk-authoring shape, real and available. Deliberate limits are a teaching feature, not a flaw. Single-file distribution.
- **Watch.** Not a framework you embed — it's a platform you build inside. Wrong fit unless OpenLight becomes a whole-app-style system.
- **Link.** https://beyondloom.com/decker

### TiddlyWiki
- **What.** Single HTML file that is a personal wiki, self-modifying, with "tiddlers" (transcludable chunks).
- **Language / paradigm.** JS + WikiText macros / transclusion-heavy.
- **Renders to.** DOM.
- **Platforms.** Desktop ⚠️ (via browser) · Web ✅ · Mobile ⚠️
- **Maturity.** Mature, 20+ years active.
- **Distinct.** Zero-install distribution. Chunk-addressing at fine granularity already works. Worth studying regardless of adoption.
- **Watch.** Not a framework — it's a whole environment. WikiText markup is esoteric.
- **Link.** https://tiddlywiki.com

---

## Notes on gaps

- **No mature "TS+JSX directly to wgpu on desktop"** exists today. Tauri + web framework is the closest — but it rides a webview, not wgpu. Dioxus+Blitz is the future-looking candidate. Verso (Servo as a library) is the research path.
- **No single stack satisfies folk-like + native + pure-wgpu.** The trio is a real ecosystem gap. Each row above picks a trade: lose one to keep the others.
- **Web + native from one source** is solved by Flutter, Compose Multiplatform, LiveView Native, Lustre, ClojureDart — but the rendering backend differs (Skia / WebSocket / VDOM).

Take inventory from here. I'll hold for direction on what to weigh next.
