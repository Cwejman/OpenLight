# One compositor — shell authorship, surface technologies, and where rendering lives

Reasoning record of the 2026-08-04 dialog. Conclusion first; the path and the evidence follow. Status: **direction ruled by the author in dialog**; the pilot's specs fold it in where marked, the rest is reference depth.

**The ruling.** There is one compositor: the web tree. Rust's visual duty is one rect — a webview in a window. Everything drawn — shell, tiles, chrome, readers, slots — is program-authored DOM in that tree. Rust remains pure authority: window, OS input, VM and capabilities, keychain, engine, `ol://` serving. Multi-compositor support is **not built**: no host tile-walker, no hole-punching subsystem, no guest-layer protocol. If a real program ever demands a native surface, it arrives then, as a priced and dated exception, not as architecture in advance.

**The exit that makes the commitment safe.** Surface programs live in the substrate with their documentation and knowledge structure. When a materially simpler-and-better rendering technology exists (mature wgpu UI, webview-as-texture, DOM streaming), agents can rewrite the surface layer wholesale — the programs are field-resident, typed, documented; a rewrite is a traversal, not an excavation. At this point in time that technology is deemed not to exist. The commitment is to *today's* one compositor, held by a system built to be rewritten.

**The named Achilles heel: performance.** Not memory, not feel, not capability — input latency and render discipline. Won or lost by budgets, not stack choice (§7).

---

## 1. The path

Host-cast chrome (host.md's aura) was premise-retired by the shell-as-composed-program direction (horizon). The dialog then walked: can webviews carry their own chrome (§2) → the gutter/input problem and its dissolution (§3) → what slots require of surface technology (§4) → containment and transport tiers (§5) → whether tiling must stay Rust (§6, the wavering and its resolution) → performance (§7) → the webview-app critique reviewed honestly (§8).

Two positions were held and abandoned en route, recorded so they aren't rewalked: *"rects stay Rust for future compositors"* — protected the wrong invariant; pre-paid a permanent two-system tax for a speculative tier. *"top-level surfaces don't scroll"* — false; the camera lens is on the horizon. The law that replaced both: **layers move together atomically only inside one compositor.** Every consequence follows from it.

## 2. Transparency and program-drawn depth

All three wry backends support transparent webviews (`with_transparent`): WKWebView cleanly; WebView2 with `DefaultBackgroundColor` alpha restricted to 0|255 — page pixels still composite with full alpha, so CSS shadows render correctly; WebKitGTK behind a compositing WM. Host-cast shadow is native-cheap only on macOS (CALayer); Windows/Linux degrade to hand-painted emulation. Program-drawn depth — CSS `box-shadow` into a transparent margin — renders identically everywhere. **The portable path is program-drawn; the host-cast aura was the platform-coupled one.**

## 3. The shell document

The `ol://` shell grows host-authored chrome with the program in an iframe. Margin pixels then run in-webview code: gutter gestures are caught by shell script and forwarded as intents — never swallowed by transparent edges, no per-pixel hit-testing needed, no dead strips. Layout of children lives inside the webview (DOM), where it belongs — host-positioned child views under a DOM scroller smear a frame behind (the classic hybrid failure).

With the §6 ruling this generalizes: the *whole window* is one shell document; tiles are iframes inside it. One webview per window; per-tile webview management, transparent-webview tricks, and the native aura all dissolve.

## 4. Slot-grade means DOM

The compatibility line between surface technologies is **compositing space, not framework**. Inside the web tree (React DOM, streamed DOM, canvas 2D/WebGL/WebGPU, xterm-style terminals): slot-compatible with each other. Host-composited (native wgpu, native widgets, separate webviews): rectangle-compatible only.

- WebGPU-in-canvas is a first-class GPU layer — composited on-GPU, no readback. Available: WebView2 (Chromium, 2023), WKWebView (Safari 26 / macOS 26), WebKitGTK lagging (the weak link). WebGL is the universal floor.
- The honest residual for native wgpu: API ceiling (portable subset, no vendor extensions), zero-copy interop (buffers crossing the JS boundary are copied; native shares textures with decoders/ML runtimes), WebKitGTK's lag. Performance alone is ~10–20% — not decisive.
- Native widgets: platform-bound; never a real tier.

Framework choice is non-viral by construction: slots share **scopes, not props** — the seam is DOM + the SDK protocol, so a React parent seats a Svelte child. One hard line — *slot-grade means DOM, composing through the field* — below it hosts may change (webview today, streamed VM later); above it languages and frameworks are free; TS + React are first-party convention, not law (conventions.md already marks TS "pragmatic, not a limit").

## 5. Containment and transport tiers

| Tier | Wall | Budget | Transport |
|---|---|---|---|
| Same-DOM slot | none — shared realm, shared fate | hundreds | parent's channel; per-slot identity tokens for authorization |
| Iframe slot (cross-origin, `ol://<program-id>` origins) | real — separate global; OOPIF process on Chromium | dozens | **leaning: host-direct token injection** — parent can *gate* but never read, drop, or forge; gating is an auditable intent to the host |
| Webview tile | native surface | (dissolved into the one-shell model; survives only as a future guest exception) | wry IPC |

The forge risk is the load-bearing one: commits attribute to process identity engine-side, so parent-mediated tokens would let a parent write history *as* its citizen. Host-direct injection closes it. Browsers throttle offscreen iframes independently — the gating tier gets platform help for free.

## 6. The compositor decision

Tiling is process and window management made visible; it must be one system. The dialog first concluded "therefore Rust owns rects" — inverted on inspection: the one system is the **web tree**, and the shell is a view program in the same technology as any reader. Arrangement is one language floor to ceiling; a tile tree, a collation, and a slot are the same kind of thing at three altitudes. The geometry interpreter moving into a program is what host.md's *View modes* paragraph always claimed view modes were.

What was **not** built matters as much: no hole-punching, no guest protocol, no snapshot-degradation policy. Those are the shapes native guests would need (atomic motion law: a cross-compositor layer smears during pan; at-rest static seats work; motion demands degrade-to-placeholder). All of it is *documented as the future exception's price* and none of it is *pre-built*. Multi-compositor is a horizon paragraph, not a host subsystem.

## 7. Performance — the Achilles heel, itemized

- **Engine: not the bottleneck.** Coalescing is required (engine.md); N updates arrive as one `scope_changed` → one `read_batch` (N tagged sub-queries, one commit snapshot, one IPC round trip; indexed SQLite reads at tens of µs). Engine-side care: subscription matching must be indexed (scope→subscription), and the slot provider holds one aggregated subscription per document, not N.
- **SDK: deliberately dumb.** No queues, no policy — importable anywhere because transport is a runtime concern.
- **The seat holds the machinery.** The slot provider (`@openlight/react`): collect hooks per render pass → one `readBatch` → slices; visibility gating at the provider for same-DOM slots, at the channel for iframes. *The seat confers chrome, and the seat confers priority.*
- **N roots, one runtime.** 400 same-DOM slots = 400 React roots sharing one V8, one React copy (shell-injected shared runtime — the bundling-debt exit), one scheduler. Root count is cheap; **DOM node total, the initial mount burst, and keypress-path work** are the real costs.
- **Two virtualization modes, one dial.** Heavy members: unmount-virtualize with **parent-drawn previews** (the parent holds the member's field data — placeholders are previews, not holes). Light members: keep-mounted + `content-visibility: auto` + gated updates — no blank flash, no churn; default here because the update valve already sits in the provider. Recycling makes surfaces disposable by construction (immutable-ref argument ruling): unmount/remount is lossless.
- **The semantic rule that makes gating safe: no commit on event.** A surface answers subscription events by reading only; anything that writes on events lives viewport-independent (VM/daemon). Otherwise gating changes behavior, not just cost.
- **Budgets to write down:** typing latency on prose surfaces (the `form`, prose editing — uncontrolled inputs, near-zero keypress work); frame budget for shell drags (transform during drag, true resize on release); staggered initial mounts; idle-means-idle (timers, GC pressure); **WebKitGTK decision for the pilot** (test early or demote Linux explicitly).

## 8. The webview-app critique, reviewed

Six charges against web-tech desktop apps, sorted: **memory bloat** — mostly dodged (system webview, one shell document; budgets on iframes). **Input latency** — applies fully; ours to win by discipline (§7), the charge that killed Atom and that VS Code out-engineered. **Non-native feel** — dodged deliberately: own visual language (the Figma/Linear escape), but IME, a11y tree, drag-and-drop, focus order must be built, not assumed. **Startup/energy** — partially applies; staggering and gating answer it. **Engine fragmentation** — applies; the price of using system webviews; WebKitGTK is the weak platform. **DOM-is-a-document-model** — true and accepted with eyes open: the counterfactual (native-quality Rust UI, gpui-class) costs years and forecloses the thesis — that a person or a model writes forty lines of TypeScript and gets a full-citizen surface. We trade peak fidelity for **authorship**. The classic seventh charge — the frontend/backend split — the substrate deleted outright.

## Open

- Slot provider shape (sdk.md holds it open; settles building the thread tile).
- Unmounted member: does its process stop or idle? Surface lifecycle vs process lifecycle.
- Iframe transport: confirm host-direct token injection lands per-frame on all three backends.
- WebKitGTK: WebGPU and site-isolation lag — pilot policy needed.
- Prose-surface latency budget: number and measurement harness.
- Crash blast radius of the one-shell model on WebKit (weaker site isolation): reload-recovery is cheap by design; measure it.

## Sources

wry transparency ([docs.rs/wry](https://docs.rs/wry); [WebView2 DefaultBackgroundColor](https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/win32/icorewebview2controller2)) · WebGPU availability ([Safari 26](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/); [critical-mass roundup](https://www.webgpu.com/news/webgpu-hits-critical-mass-all-major-browsers/)) · Latency lineage: Atom's death, VS Code's virtualization discipline (general record).
