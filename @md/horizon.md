# Horizon

The vision beyond v0.1, ordered roughly by proximity. Each entry names the direction, what is already real, and what is open. Nothing here blocks the pilot; much of it shaped the pilot's architecture so the path stays reachable.

---

## Integrations — external systems projected into the type system

Not everything will be built on the substrate, and nothing has to be. An integration is written as a declaration of how an external system's schema **projects into archetypes**: given a system that stores, say, decisions under its own schema, the integration maps that schema to substrate types, and the external items surface as live chunks — scopeable, connectable, readable by every program and every model. If the external system has atomic temporal storage, its history projects too: external changes inferred at commit level, so temporal scoping reaches through the integration. Naturally any integration that also provides updates, does so programs whoes changes to the integration store is natively reflected as if not external.

The point is compute, not mirroring: once projected, the AI tooling native to this environment — completion from scope, derivation, reconciliation — runs over data that lives elsewhere. The substrate stores the projection contract and the references; the external system remains the owner.

**Real today:** reference chunks with resolution parameters, the integration-archetype pattern, the git driver, and the `reconcile` program shape (`spec/components.md`). **Open:** the driver contract (a driver is a program — what does it declare?), materialized sync versus virtual projection (chunks written and reconciled, or resolved live at query time), freshness semantics, and how projected history composes with the substrate's own commit graph.

## The field as the model's cache — the substrate embodied

The inference provider is not a stateless function to shovel prompts into; it is infrastructure the field can live on. Take it to its end: host the model yourself and open direct access to its caching layer — then **make the cache the substrate**. Every context window is always a scope of the cache; the model doesn't receive the field, it *embodies* on lower machine level. Scope resolution targets content that is already resident with the model; only the delta travels.

Three substrate properties make this native rather than bolted on: chunk identity is stable (cache keys are substrate-native), scope resolution is deterministic (cache entries compose the way scopes compose).

**Real today:** provider primitives exist — Anthropic's `cache_control`, OpenAI prompt caching, and most structurally Gemini's explicit cached-content handles (see [`spec/research/backend.md`](spec/research/backend.md)). The `model` program (`spec/agent.md`) is the single seam where cache handling would land. **Open:** TTL under chunk mutation, sizing, and the substrate-native representation of residency (probably a chunk attribute — the field tracking where it lives).

## Authoring here, shipping out

The host is a powerful compute environment — and some of what is built in it will leave it. A solution authored here — programs, their scopes, their seed knowledge — is packaged as an app, or shipped to a cloud environment: engine and substrate embedded as libraries, running headless, no chassis, no shell (unless the app is actually composed by them). You write the solution in the environment because that is where writing it is tractable; you deploy it where it needs to run.

**Real today:** the engine is its own artefact and db is its crate; programs are executables with declared runtimes. **Open:** the packaging format (programs + snapshot of their places + attachments, pinned at commits), secret provisioning beyond the OS keychain `read-secret` reaches, and the headless lifecycle (what replaces the session).

## The engine as a daemon — landed in law, remainder here

The direction this entry held **landed at the surface rewrite** (2026-08-22): the engine is its own installed artefact, a binary or OS service; the chassis is a client; several windows on one field with no drift of state is now the architecture, not a vision ([`spec/engine.md`](spec/engine.md)). What remains horizon: **the engine over the network** — a remote field attached like a local one (the transport is the seam; authentication at the socket is the work); the **resident lifecycle for daemon programs** — services that outlive any window (the launch posture is ruled, the lifecycle-as-policy open — engine.md, *Daemons*); and the **reactivity fan-out** across many attached clients (kin to cross-engine reactivity, below).

## Interface inference — the ladder

The substrate is typed, so interface can be inferred from shape — that is a ladder, not a leap:

1. **Inferred browsing (v0.1).** The reader derives its default presentation from what a scope structurally is — ordered → sequence, shared archetype with a schema → table, session-typed → transcript ([`spec/components.md`](spec/components.md)). Forms for running programs are generated from argument archetypes the same way.
2. **Authored overrides.** Where inference falls short, a program or a per-archetype hint supplies the form — hand-built views remain first-class, and a powerful UI stays cheap.
3. **Generated interfaces.** On the far end, AI generates views — more tractable here than in conventional apps, because the substrate separates mechanics from form and the type system constrains what a view must honor.

## Typed JSON — chunk references in bodies

Body schemas document key types today, but a chunk id in a body is an opaque string — untyped, unvalidated, invisible to the placement graph. The direction: schema keys can be **reference-typed** — a key declared as holding a chunk id (optionally constrained by archetype), validated on write, resolvable by readers, surfaced to queries. Until then, anything that must point at a chunk *and be seen doing so* uses a `relates` placement even where the grain rule would prefer a body key (the reader's current-reading relates is the standing example — author-flagged, the reason this entry exists).

**Real today:** instance contracts type keys; references-are-never-capabilities is settled; typed refs are the honest channel the old argument-`attach` dissolved into. **Open:** enforcement shape, whether reference-typed keys project as placements (which would dissolve the relates workaround), migration of existing id-strings.

## The band

Several model programs sharing a field, each with its own face, running in oscillation — one's output enabling what another could not make alone. Kept deliberately, and marked honestly: this is the least proven idea in the project. It depends on completion-model performance over many cycles running together, which no one has demonstrated at this shape.

What makes it worth holding: the mechanical floor already exists and required no new mechanism — delegation as nested runs, siblings coordinating through subscriptions on shared scopes, blackboard scopes with enforced specs, attribution on every commit (`spec/engine.md`). The band is what may emerge *above* that floor. It is not a mechanism to build first; it is what the working environment makes it possible to attempt.

## Knowledge as resolutions

When the environment is usable enough that the spec itself moves into the substrate, knowledge stops being prose files and becomes structure — and the unit to build it from is the **resolution**: a settled decision as a chunk, its premises as connections. What makes a resolution steadfast — explicit claim, explicit premises, a commit with author and time — is exactly what makes it the opposite when it must be: dissolvable. Retire a premise and the resolutions standing on it surface as a query, not as stale prose a reader must remember to catch. The standing example is live in this file: *host-native sidebar/tabs* was held open on the premise of host-cast chrome; the one-compositor ruling ([`spec/research/arc/one-compositor.md`](spec/research/arc/one-compositor.md)) retired the premise, and only a reader's memory connected the two.

**Real today:** the conventions mandate legible openness (settled vs held-open, marked in place); specs are already substrate-enforced contracts; every commit carries author and time. **Open:** the resolution archetype's shape (claim, premises, status), whether premise links are placements or reference-typed body keys (kin to *Typed JSON* above), and what dissolution does downstream — mark, notify, or block.

## Turns as substrate — ingestion stops being sunk cost

A worked example, from this project's own rewrite (2026-08-07). Asked whether a corrective pass should regenerate from the old file or recompose from the new, the steward chose the new — reasoning that going back would mean re-running the absorption of two dialog records, which was **expensive and risky to repeat**. The author's observation: that constraint is an artifact of today's tooling, not a real one. In the compute environment, the series of turns that performed the absorption is **itself substrate** — typed, addressable, reusable. Nothing to re-run.

The claim generalizes past caching ([*The field as the model's cache*](#the-field-as-the-models-cache--the-substrate-embodied) is about the model embodying the field at inference; this is about the *work of a pass* persisting). Today a reasoning pass is a transcript that evaporates: its conclusions might be written down, but its derivation, its rejected branches, and its checks are gone, so "start again from an earlier point" prices in redoing all of it. When turns are field content, restarting from any point is a read — and the decision "which version do I generate from?" stops being an economic one and becomes purely a question of which is *right*.

What that changes about authoring is the interesting part: **an expensive ingestion becomes a fixed asset**. Passes can be cheap and numerous because none of them re-pays for understanding. It also makes the audit cycle in [`sketches.md`](sketches.md) *Rewrite versus edit* affordable by construction rather than by hoping the auditor is a smaller model.

Noted 2026-08-07 (author). **Open:** what grain a turn files at, whether rejected branches are kept or pruned, and how a later pass addresses "the understanding reached at turn N" without replaying it.

## Prose as substrate — markdown retired

Today the spec is markdown files and the substrate is what they describe. At some point that inverts: **prose stops being a format the substrate stores and becomes structure the substrate *is*.* Words, sentences, formatting, links and slots, paragraphs — each an instance contract, so a document is not a blob with syntax in it but a composition the field understands natively.

What that buys is the whole point: dimensions and relations can point at a **paragraph, a sentence, or the meaning itself**, not at a file plus an offset. Aboutness lands where the thought is. Editing, reading, and the act of finding meaning all become surfaces over typed structure — transforming prose *around* meaning-as-data, and presenting that visually, rather than editing characters and hoping the structure survives.

The abstraction shape this wants is wider than ownership, and TouchDesigner is the reference: a component holds a world — its own node canvas — and that nesting repeats for as many depths as the work needs. Ownership is *partially* related but too narrow; the general phenomenon is a chunk containing a whole authored space, recursively.

Noted 2026-08-07 (author). Enormous and deliberately compressed here; near-future, at a moment of priority. Related: [`spec/research/arc/selection.md`](spec/research/arc/selection.md) §13's grades and the prose ladder, the fenced-expression-as-anonymous-chunk pattern, and *Interface inference* above — all of them are this idea seen through a keyhole.

## Lifetimes in the substrate

Placements and chunks that carry a lifespan — a role membership that expires on its own, a grant valid until Friday, a dimension whose members age out. Today every standing permission or grouping outlives its intent until someone remembers to remove it; a lifespan makes the field forget on schedule. Touches the retention/ring idea in buffers and the locked-relationships exploration (its inverse: a relation that may *never* lapse). Noted 2026-08-07 from the boundary dialog ([`spec/research/arc/dimensions.md`](spec/research/arc/dimensions.md)); no design taken.

## Uniform VM containment via DOM streaming

The pilot uses split containment — capability-bearing programs in a VM; what draws is components in the chassis's realms. The uniform alternative — every program in one VM — becomes viable because views produce DOM, not pixels: a thin shim in each realm applies DOM operations streamed from a VM-side implementation and forwards events back. Phoenix LiveView, Hotwire Turbo, and HTMX are production-tested shapes for the same pattern.

What it buys: uniform security posture, a cleaner peer model (a peer is a VM image), one protocol shape across all programs. What it costs: VM lifecycle engineering, a DOM-diff protocol, and discipline about browser APIs that don't cross cleanly. Cross-platform VM backends differ (Apple Virtualization.framework, QEMU/Firecracker, Hyper-V) but the DOM-streaming surface above them is consistent. The split/uniform choice is a containment detail; the program/process/boundary primitives serve both, so the migration stays reachable.

## Peering — symmetric, remote, packaged

v0.1 ships filesystem-local attachments — read-only by default, branch + write for shared stores. The full picture is larger; the architecture preserves the path without forcing the work now.

- **Symmetric peering.** Read/write peers. The boundary mechanism already carries the model — a write boundary naming a peer's identity and reach; the engine's federation already routes reads, and routing writes follows the same shape. The work is the trust and identity layer, not substrate semantics.
- **Remote attach.** Across a network: zero-trust transport (Tailscale, Iroh, libp2p) plus a substrate-level sync protocol over the commit graph. Replication, conflict resolution, and partial-state semantics are unsketched — a substantial dimension of its own.
- **Author identity.** Keypairs, signed commits, verifiable attribution; layers onto commit metadata (`process_id` already exists); verification at attach and sync time.
- **Package merging.** `[packages]` in `.ol/project.toml` as a declarative system spec (Nix-flavored): at launch, resolve all attached stores' packages, build the home's VM image from the merged set.
- **Cross-host reactivity.** Two engine processes on one db each have their own broadcast today. WAL watching, `MAX(commits.id)` polling, or an out-of-band channel — load-bearing the moment two devices share a workspace.
- **Snapshot pinning and dynamic attach landed** (the attach record's `at`; `attach`/`detach` as engine programs). **Selection-filtered attachments and schema migration on attach** remain — tractable, deferred; db's `at:` and the one evaluator carry the shapes.

## View modes beyond tabs

Tabs are one lens. A zoomable canvas — workspaces as nested regions, navigation spatial, containers abstracting with zoom — is the most charted alternative (Figma, tldraw, Muse). The composition types hold for either geometry; what changes is the layout a view program imposes and one new geometry interpreter — itself a component (rect walk + viewport transform beside the split-tree walk). The clean-room audit confirmed the delta is that small ([`spec/research/cleanroom/composition.md`](spec/research/cleanroom/composition.md) §3.4). Because view modes are programs, lenses — canvas, outline, timeline, graph — are additive, not forks.

In the canvas lens the drawable outruns the window: the canvas extends beyond the viewport and the viewport becomes a **camera** over it. Fixed strips lose their claim to edges — a sidebar becomes a floating, minimizable overlay widget among a launcher of overlays (Figma's pattern), spawned rather than always-mounted. The overlay archetype already carries the shape; what changes is that anchoring goes spatial.

## WebGPU-capable views

Pilot components render DOM. Some will want GPU surfaces — WebGL/WebGPU canvases for visualization and simulation. DOM streaming doesn't help (you can't stream pixels as DOM ops); the shape is pixel-level passthrough, which under uniform containment needs virtio-gpu (2D today on Apple Virtualization.framework; 3D via libkrun/Venus). The type system already accommodates it (a `wgpu` surface kind — view.md). Deferred until a view demands it.
