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

The pilot uses split containment — tool-programs in a VM, view-programs in host webviews. The uniform alternative — every program in one VM — becomes viable because views produce DOM, not pixels. A thin shim in each host webview applies DOM operations streamed from the VM-side view program and forwards events back. Phoenix LiveView, Hotwire Turbo, and HTMX are production-tested shapes for this same pattern — DOM over a wire.

What it buys: uniform security posture across all programs; peer model clarifies (a peer is a VM image); no per-capability execution split; the protocol stays one-shape across tool programs and view programs.

What it costs: VM lifecycle engineering, a small DOM-diff protocol, and the discipline that views don't rely on browser APIs that don't cross the boundary cleanly (local storage, IndexedDB, some media APIs). Cross-platform VM backends differ (macOS Apple Virtualization.framework, Linux QEMU/Firecracker, Windows Hyper-V/Krun) but the DOM-streaming surface above them is consistent.

What stays pilot-deferred: WebGPU-capable views. These need pixel-level passthrough (virtio-gpu, Venus) and are a separate engineering track. DOM streaming covers ordinary UI, which is what pilot views need.

The pilot chose split for simplicity and speed — capability-bearing programs in a VM, surface-only programs on host webviews — which gives an agentic-safe floor without new mechanism. The direction this horizon entry holds: **uniform containment is architecturally cleaner, DOM streaming makes it tractable, and the migration is reachable when the engineering cost is worth paying.**

---

## Peering — symmetric, remote, packaged

v0.1 ships read-only filesystem-local mounts: an active project plus zero or more peers, each a directory on disk, joined into one substrate field through the engine's federation layer. This is the simplest shape that unblocks the monorepo + test-isolation pressure. The full peering picture is meaningfully larger, and the v0.1 architecture preserves the path to it without forcing the work to land now.

Several distinct dimensions sit here, each with its own engineering character.

**Symmetric peering.** A peer that's read/write rather than read-only. The substrate's existing boundary mechanism already carries this — when the user wants to grant a peer write access into a scope, they author a write boundary chunk that names the peer's identity and the scope they reach. The engine's federation already routes the read side; routing writes follows the same shape (resolve the mount that owns the chunk, dispatch the write there). The work is in the trust and identity layer underneath, not in substrate semantics. The boundary system already being the right place to land symmetric peering is a useful proof that v0.1 didn't paint into a corner — adding write peering is purely additive.

**Remote mounts.** v0.1 mounts are local filesystem paths. The realistic peering scenario reaches across a network — a friend's space, a team's shared substrate, a published cultural seed. The substrate transport here would be zero-trust networking (Tailscale, Iroh, libp2p, etc.) plus a substrate-level sync protocol. The db does not yet have remotes — we have local commits, no replication or push/pull. This is a substantial engineering dimension on its own; the substrate's commit graph is the right primitive to build it on, but the protocols, conflict resolution, and partial-state semantics are not yet sketched.

**Author identity.** v0.1's `[project.author]` block in `.ol/project.toml` is parsed but not enforced. Real peering needs cryptographic identity — keypairs, signed commits, verifiable attribution. The substrate already records `dispatch_id` per commit (which process caused the change); identity layers on as another dimension of commit metadata, signed by the project's author key. Verification at mount time and at sync time is the work.

**Package merging.** v0.1's `[packages]` table in `.ol/project.toml` is parsed but not processed. A project's packages declaration is more than a manifest — it's a declarative system spec describing packages, services, and settings file contents (Nix-flake-flavored). The horizon work: at host launch, resolve all mounted projects' packages tables, compute the merged set, and build the active project's VM image from it. Each peer's invocables run inside a VM that has every peer's declared packages installed. Today the user sets up the VM manually; with package merging the mount cascade fully describes the runtime environment.

**Cross-host reactivity.** Each `Db` instance owns its own in-process `broadcast::Sender<Commit>`. Two host processes opening the same db file each have their own broadcast — not connected. v0.1 supports concurrent reads via SQLite's normal multi-reader semantics, but reactive notifications do not propagate between host processes. The horizon path is some combination of: file-watching the db's WAL via FSEvents/inotify, polling `MAX(commits.id)`, or an out-of-band signal channel. This becomes load-bearing the moment two users (or two devices) share a workspace; trivial-feeling for a solo workflow but real for collaboration.

**Snapshot pinning via `commit`.** v0.1 pins a peer at a branch (path + branch); when the peer's branch advances, the active project sees the new state. For full reproducibility, a `commit` field in the mount declaration would pin a frozen snapshot — the engine routes queries against that mount through db's existing `at: Some(commit_id)` time-travel parameter. Trivial to add (db already supports it); deferred to v0.2 for ergonomic reasons (CLI tooling for "ol pin"-style workflows).

**Scope-filtered mounts.** v0.1 mounts surface every root scope a peer has. A peer with multiple roots — internal versus public, distinct exports — benefits from filtering: the mounter declares which roots to bring in via a `scopes = ["tools", "archetypes"]` field on the `[[mounts]]` entry. The engine federation doesn't change; queries against that mount narrow to chunks reachable from the listed scopes. Architectural cost: trivial. Useful when peers grow beyond the convention of one root per project. A complementary peer-side declaration (the peer marks which roots it considers public) is a separate, related direction; the field name on the peer side is not yet settled.

**Schema migration on peer mount.** v0.1 refuses to mount peers whose db schema version differs from the active project's, with a clear error. Migrating a mounted-but-not-active db is a v0.2 concern — the live path is either an in-memory migration that produces a working copy without touching the on-disk file, or a per-mount transparent translation layer that adapts queries across schema versions. Both are tractable; neither belongs in v0.1.

**Dynamic mount/unmount.** v0.1 resolves mounts at boot and keeps them fixed for the launch. Adding or removing mounts at runtime would require: a substrate signal to subscribed programs (so UI can react), host-side cascade re-walk and dedup, and a VM-internal FS-mount hook on the runtime provider. The engine's `mount_project` API already supports being called post-boot — this is mostly host and UX work.

**Peers as nodes in a coherence-radiating ecology.** Inside-out propagation extends naturally to peers — culture of one peer informs another's agents; archetypes form in the field that no single peer authored. Concrete implications follow from `inside.md`: peers are not federations of services but radiators of coherence, each contributing what it has uncovered to the joint field. This direction wants more grounding before it becomes concrete; it sits underneath all the engineering dimensions above as the question of *what peering is for*.

What is real today: ULIDs are globally unique by construction (no collision across peers); the boundary mechanism is rich enough for symmetric peering once identity lands; the engine's federation already routes reads and boundary walks across multiple dbs (reactivity follows when there's a writer to listen to). What is open: the protocols, the trust layer, the package-merge build, the schema-migration story, cross-host reactive notification, and most of the eventual peering UX.

---

## View modes beyond tabs

The pilot ships tabs — each tab a root of a tile tree, workspaces are tabs. Tabs are one lens on what the substrate holds. Other lenses are reachable on the same chunks.

The most charted alternative: a zoomable canvas where workspaces are nested regions, not discrete containers. Containers expand or abstract based on zoom level; navigation is spatial rather than discrete. Precedents: Figma, tldraw, Muse, Miro, Prezi. Spatial memory becomes a navigation axis. Nested compositions show naturally — zoomed out, they're cards; zoomed in, you're inside them. Looking inside a container = zoom in, not open a new tab.

The substrate type system doesn't forbid this direction — the composition types hold for either geometry. What changes is the layout the view program imposes, and what "current tab" becomes (maybe "current viewport region").

The framing matters: because the host is built by programs themselves, a view mode is a program. Tabs and canvas are two lenses; others — outline, timeline, graph — are reachable in the same way. Tabs ship first; lenses are additive, not forks.

---

## WebGPU-capable views

Pilot views render DOM. Some views will eventually want direct GPU surfaces — WebGL/WebGPU canvases for visualizations, data renderings, simulations. DOM streaming doesn't help here: you can't stream pixels as DOM ops.

The container shape for these: pixel-level passthrough from the program's rendering context to the host's composited window. Under split containment, the view runs on host and has direct WebGPU access. Under uniform containment, this needs virtio-gpu (2D today on Apple Virtualization.framework; 3D via libkrun / Venus for full acceleration).

What makes this a genuine horizon and not just pilot scope: the substrate type system can already accommodate it (`surface: 'wgpu'` on a program body). Implementation is the work. Deferred until a view demands it.
