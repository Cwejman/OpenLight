# Horizon

Ideas on the horizon. Recognitions that shape current thinking without yet being committed. Not settled enough for `inside.md`, not concrete enough for `pilot.md`, not edge knowledge for `research/`. This is where live ideas sit — worked on, referenced, allowed to mature or dissolve.

Each entry names a direction, develops what it would mean, and cites what is already real versus what is open. Research files are referenced where the technical ground is worth tracing.

---

## The field as cache substrate

A novel affordance the substrate opens that conventional agents cannot reach: **the field itself as the cache substrate.** The inference provider is not a stateless function we shovel prompts into each turn — it is infrastructure the field can live on. Part of the substrate resides with the model. Scope resolution targets content that is already there.

The conventional shape is: assemble context into a prompt, send it, hope the provider deduplicates. The shape this opens is: name what lives remote, reference it, send only the delta. For scopes that resolve entirely from cache, the content does not need to travel at all.

Three substrate properties make this fit natively, not as an optimization bolted on:

- **Chunk identity is stable.** A chunk's canonical serialization is a function of its content. Hashed today is hashed tomorrow. Cache keys are substrate-native — not artifacts of prompt assembly.
- **Scope resolution is deterministic.** A scope at a given head produces an ordered, stable list of chunks. Cache entries compose the way scopes compose.
- **Cross-session reuse is natural.** Sessions come and go; the substrate persists. A cache primed in one session is warm for the next, because the field it indexes is the same field.

This is a concrete instance of "running is learning" and of "the field is where intelligence lives, not any single node." The substrate already treats programs as functions native to the field. The cache turns part of the provider into field residency — not metaphorically, literally. A chunk exists at a scope address, and it also exists at a provider cache handle, and both point to the same thing.

**Multi-peer implication.** When peers exist, each peer's cache is an addressable surface on the provider. Cross-peer collaboration could target another peer's cache handle directly, without re-shipping content. The field lives in distributed cache handles. The inference provider becomes shared substrate infrastructure between peers — another sense in which the boundary between model and environment is architectural, not categorical.

**What is real and what is open.** The provider primitives exist today — Anthropic's `cache_control`, OpenAI's prompt caching, and most structurally, Gemini's explicit cached content API where content is uploaded once and referenced by handle on subsequent requests without re-transmission. These are ours to build on. What is open: TTL management under chunk mutation, cache sizing against provider limits, the substrate-native representation of a cache handle (probably a chunk attribute — the field tracking its own residency). The mechanism is a direction, not a validated design.

For the current state of provider cache primitives, see [`research/backend.md`](research/backend.md).

**Implication for backend choice.** Gemini's cache shape is the one most aligned with the substrate's own shape. A first-class cache-handle concept on the program contract is worth reaching for early rather than bolting on later.

---

## Uniform VM containment via DOM streaming

The pilot currently holds a fork open on how programs are contained: split (tool-programs in VM, view-programs in host webviews) vs uniform (every program in one VM). The uniform direction becomes viable because views produce DOM, not pixels. A thin shim in each host webview applies DOM operations streamed from the VM-side view program and forwards events back. Phoenix LiveView, Hotwire Turbo, and HTMX are production-tested shapes for this same pattern — DOM over a wire.

What it buys: uniform security posture across all programs; peer model clarifies (a peer is a VM image); no per-capability execution split; the protocol stays one-shape across tool programs and view programs.

What it costs: VM lifecycle engineering, a small DOM-diff protocol, and the discipline that views don't rely on browser APIs that don't cross the boundary cleanly (local storage, IndexedDB, some media APIs). Cross-platform VM backends differ (macOS Apple Virtualization.framework, Linux QEMU/Firecracker, Windows Hyper-V/Krun) but the DOM-streaming surface above them is consistent.

What stays pilot-deferred: WebGPU-capable views. These need pixel-level passthrough (virtio-gpu, Venus) and are a separate engineering track. DOM streaming covers ordinary UI, which is what pilot views need.

The decision between split and uniform containment belongs in the pilot. The direction this horizon entry holds is: **uniform containment is architecturally cleanest, DOM streaming makes it tractable, and the pilot should choose with eyes open.**

---

## Multidimensional / zoomable tiling

The pilot commits to tabs — each tab a root of a tile tree, workspaces are tabs. A substantial alternative has been charted: replace tabs with a single zoomable canvas where workspaces are nested regions, not discrete containers. Containers expand or abstract based on zoom level; navigation is spatial rather than discrete.

Precedents: Figma, tldraw, Muse, Miro, Prezi. Spatial memory becomes a navigation axis. Nested compositions show naturally — zoomed out, they're cards; zoomed in, you're inside them. Looking inside a container = zoom in, not open a new tab.

The substrate type system doesn't forbid this direction — the composition types hold for either geometry. What changes is the host's layout engine and what "current tab" becomes (maybe "current viewport region").

Holding as a direction. Tabs ship first. Canvas is the next geometry if the tab model turns out to fight the values (spatial memory, multidimensional navigation).

---

## WebGPU-capable views

Pilot views render DOM. Some views will eventually want direct GPU surfaces — WebGL/WebGPU canvases for visualizations, data renderings, simulations. DOM streaming doesn't help here: you can't stream pixels as DOM ops.

The container shape for these: pixel-level passthrough from the program's rendering context to the host's composited window. Under split containment, the view runs on host and has direct WebGPU access. Under uniform containment, this needs virtio-gpu (2D today on Apple Virtualization.framework; 3D via libkrun / Venus for full acceleration).

What makes this a genuine horizon and not just pilot scope: the substrate type system can already accommodate it (`surface: 'wgpu'` on a program body). Implementation is the work. Deferred until a view demands it.

---

## Rust engine migration

The engine is TypeScript for the pilot. Runs as a subprocess spawned by the Rust host. The protocol between the host and the engine is the same stdio/JSON-lines shape every running program uses to reach the engine. When the engine is eventually rewritten in Rust, the subprocess collapses into a function call — no protocol change, no API break for programs.

When is this migration worth it? When one of: subprocess latency matters for UX responsiveness, deployment wants one binary, or the db moves to Rust and the engine is the last TypeScript piece on that path. None of these are true at pilot scale. The migration is a tracked move, not a pending task.
