# Horizon

The vision beyond v0.1, ordered roughly by proximity. Each entry names the direction, what is already real, and what is open. Nothing here blocks the pilot; much of it shaped the pilot's architecture so the path stays reachable.

---

## Integrations — external systems projected into the type system

Not everything will be built on the substrate, and nothing has to be. An integration is written as a declaration of how an external system's schema **projects into archetypes**: given a system that stores, say, decisions under its own schema, the integration maps that schema to substrate types, and the external items surface as live chunks — scopeable, connectable, readable by every program and every model. If the external system has atomic temporal storage, its history projects too: external changes inferred at commit level, so temporal scoping reaches through the integration. Naturally any integration that also provides updates, does so programs whoes changes to the integration store is natively reflected as if not external.

The point is compute, not mirroring: once projected, the AI tooling native to this environment — completion from scope, derivation, reconciliation — runs over data that lives elsewhere. The substrate stores the projection contract and the references; the external system remains the owner.

**Real today:** reference chunks with resolution parameters, the integration-archetype pattern, the git driver, and the `reconcile` program shape (`pilot/programs.md`). **Open:** the driver contract (a driver is a program — what does it declare?), materialized sync versus virtual projection (chunks written and reconciled, or resolved live at query time), freshness semantics, and how projected history composes with the substrate's own commit graph.

## The field as the model's cache — the substrate embodied

The inference provider is not a stateless function to shovel prompts into; it is infrastructure the field can live on. Take it to its end: host the model yourself and open direct access to its caching layer — then **make the cache the substrate**. Every context window is always a scope of the cache; the model doesn't receive the field, it *embodies* on lower machine level. Scope resolution targets content that is already resident with the model; only the delta travels.

Three substrate properties make this native rather than bolted on: chunk identity is stable (cache keys are substrate-native), scope resolution is deterministic (cache entries compose the way scopes compose).

**Real today:** provider primitives exist — Anthropic's `cache_control`, OpenAI prompt caching, and most structurally Gemini's explicit cached-content handles (see [`research/backend.md`](research/backend.md)). The `model` program (`pilot/agent.md`) is the single seam where cache handling would land. **Open:** TTL under chunk mutation, sizing, and the substrate-native representation of residency (probably a chunk attribute — the field tracking where it lives).

## Authoring here, shipping out

The host is a powerful compute environment — and some of what is built in it will leave it. A solution authored here — programs, their scopes, their seed knowledge — is packaged as an app, or shipped to a cloud environment: engine and substrate embedded as libraries, running headless, no host, no tiles (unless the app is actually composed by them). You write the solution in the environment because that is where writing it is tractable; you deploy it where it needs to run.

**Real today:** db and engine are libraries by design; one binary already embeds both; programs are executables with declared runtimes. **Open:** the packaging format (programs + snapshot of their scopes + mounts, pinned at commits), secret provisioning outside the host keychain, and the headless lifecycle (what replaces the session).

## The engine as a daemon

v0.1 links the engine into the host binary. The direction: the engine runs as a daemon owning the field, and a host is a **window that attaches** — start a host in your OS, select a session, and you are purely in that session; several windows stand open on one field with no drift of state, because there is only one state. The same move takes the engine over the network — a remote field attached like a local one — and gives daemon *programs* a home: services that outlive any window, which a truly functional compute environment needs (`pilot/programs.md` §2).

**Real today:** the engine sits behind a JSON-lines protocol already — the seam is transport-shaped, so daemonizing is moving the library behind a socket, not a redesign. **Open:** the daemon's own lifecycle, session attach/detach semantics, authentication at the socket, daemon-program start policy, and the reactivity fan-out across attached windows (kin to cross-host reactivity, below).

## Interface inference — the ladder

The substrate is typed, so interface can be inferred from shape — that is a ladder, not a leap:

1. **Inferred browsing (v0.1).** The read-tile derives its default presentation from what a scope structurally is — ordered → sequence, shared archetype with a schema → table, session-typed → transcript ([`pilot/programs.md`](pilot/programs.md), *Viewing the substrate*). Forms for running programs are generated from argument archetypes the same way.
2. **Authored overrides.** Where inference falls short, a program or a per-archetype hint supplies the form — hand-built views remain first-class, and a powerful UI stays cheap.
3. **Generated interfaces.** On the far end, AI generates views — more tractable here than in conventional apps, because the substrate separates mechanics from form and the type system constrains what a view must honor.

## The band

Several model programs sharing a field, each with its own face, running in oscillation — one's output enabling what another could not make alone. Kept deliberately, and marked honestly: this is the least proven idea in the project. It depends on completion-model performance over many cycles running together, which no one has demonstrated at this shape.

What makes it worth holding: the mechanical floor already exists and required no new mechanism — delegation as nested runs, siblings coordinating through subscriptions on shared scopes, blackboard scopes with enforced specs, attribution on every commit (`pilot/programs.md`). The band is what may emerge *above* that floor. It is not a mechanism to build first; it is what the working environment makes it possible to attempt.

## Uniform VM containment via DOM streaming

The pilot uses split containment — capability-bearing programs in a VM, view-programs in host webviews. The uniform alternative — every program in one VM — becomes viable because views produce DOM, not pixels: a thin shim in each host webview applies DOM operations streamed from the VM-side view program and forwards events back. Phoenix LiveView, Hotwire Turbo, and HTMX are production-tested shapes for the same pattern.

What it buys: uniform security posture, a cleaner peer model (a peer is a VM image), one protocol shape across all programs. What it costs: VM lifecycle engineering, a DOM-diff protocol, and discipline about browser APIs that don't cross cleanly. Cross-platform VM backends differ (Apple Virtualization.framework, QEMU/Firecracker, Hyper-V) but the DOM-streaming surface above them is consistent. The split/uniform choice is a containment detail; the program/process/boundary primitives serve both, so the migration stays reachable.

## Peering — symmetric, remote, packaged

v0.1 ships read-only filesystem-local mounts. The full picture is larger; the architecture preserves the path without forcing the work now.

- **Symmetric peering.** Read/write peers. The boundary mechanism already carries the model — a write boundary naming a peer's identity and reach; the engine's federation already routes reads, and routing writes follows the same shape. The work is the trust and identity layer, not substrate semantics.
- **Remote mounts.** Across a network: zero-trust transport (Tailscale, Iroh, libp2p) plus a substrate-level sync protocol over the commit graph. Replication, conflict resolution, and partial-state semantics are unsketched — a substantial dimension of its own.
- **Author identity.** Keypairs, signed commits, verifiable attribution; layers onto commit metadata (`process_id` already exists); verification at mount and sync time.
- **Package merging.** `[packages]` in `.ol/project.toml` as a declarative system spec (Nix-flavored): at launch, resolve all mounted projects' packages, build the active project's VM image from the merged set.
- **Cross-host reactivity.** Two host processes on one db each have their own broadcast today. WAL watching, `MAX(commits.id)` polling, or an out-of-band channel — load-bearing the moment two devices share a workspace.
- **Snapshot pinning, scope-filtered mounts, schema migration on mount, dynamic mount/unmount** — each tractable, each deferred; db's `at:` parameter, the federation layer, and `mount_project` already carry the shapes.

## View modes beyond tabs

Tabs are one lens. A zoomable canvas — workspaces as nested regions, navigation spatial, containers abstracting with zoom — is the most charted alternative (Figma, tldraw, Muse). The composition types hold for either geometry; what changes is the layout a view program imposes and one new host geometry interpreter (rect walk + viewport transform beside the split-tree walk). The clean-room audit confirmed the delta is that small ([`research/cleanroom/composition.md`](research/cleanroom/composition.md) §3.4). Because view modes are programs, lenses — canvas, outline, timeline, graph — are additive, not forks.

## WebGPU-capable views

Pilot views render DOM. Some views will want GPU surfaces — WebGL/WebGPU canvases for visualization and simulation. DOM streaming doesn't help (you can't stream pixels as DOM ops); the shape is pixel-level passthrough, which under uniform containment needs virtio-gpu (2D today on Apple Virtualization.framework; 3D via libkrun/Venus). The type system already accommodates it (`surface: 'wgpu'` on a program body). Deferred until a view demands it.
