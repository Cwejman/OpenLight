# Chassis

*(This file was `chassis.md` — the host. The host dissolved with the surface arc: the engine became its own artefact, seats became view's mounts, and what remains platform-true is the chassis. The filename rename rides the mechanical sweeps.)*

A **chassis** is a platform binding and a client of the engine. It hosts a surface kind — the pilot's is `web-dom` — and knows neither overlays nor components: it provides the realm, the transport, identity, and the input floor, and everything it is told is field data. **Nothing in the chassis is policy.** The pilot's chassis is **`chassis-desktop`** — a Rust binary on **tao** and **wry**, one window, one webview.

**What you run is the engine, and a chassis.** Two commands, one directory:

```
ol engine  --home <store>     the engine: opens the store, attaches, serves (engine.md)
ol desktop --home <store>     the chassis: connects, reads the entry, hosts the surface
```

Flags: `--home` · `--engine` · `--entry` · `--at <commit>` (pinned recovery) · `--mount` (the shorthand, below).

---

## The home

**The home is a standard store directory** [R — the feedback fold; `field.ol` was the deviation]: recognized as every store is, `.ol/` inside, db and `project.toml` within (established naming kept [R — 2026-08-20]; the *contents* are superseded — `[[attach]]` replaces `[[mounts]]`, `[chassis]` is new):

```
~/.config/ol/              the home — a standard store directory; the personal
  .ol/                     store by default, not by kind
    db                     the personal store: dynamically attached stores, your own edits
    project.toml           [[attach]] entries (path, branch, at?, write) · [chassis] entry = <chunk>
```

Because the home is nothing special, **`--home` may point at any store directory — a project included**: the field you boot into is that store, and a session sits in the store it was opened for — the project-agent line ([`agent.md`](agent.md)) cashed with zero mechanism.

**The toml is the declared, version-pinned set — your package space, editable in any editor.** Dynamic attachments (opening a project) are recorded in the field, not the toml: *declared* and *opened* are two different things with two homes, no duplication ([`engine.md`](engine.md), *Stores and attach*). First run seeds the home from the engine distribution's bundled stores (`component/base`, `desktop/`, the guide) — packaging, not dependency; the seed's contents are open [O]. Flags override config; **the toml never grows a second home.**

**Editing what you only read** — your desktop entry, a shipped template — is the git-shaped act, deliberate: clone the repo, attach the clone writable (or writable on a branch), point your entry at it. No in-field fork of modules; when the object model and remotes arrive, this is the seam they replace.

---

## The entry — the chassis declares its contract

**The chassis's contract is the archetypes of its configuration, which it declares** — as a program declares its payloads — and a configuration is *instances* of them, shipped in a module (the pilot's desktop module ships one — [`desktop.md`](desktop.md)):

```ol
chunk chassis/entry { instance: { layers: list<ref(view/mount)>,                        -- required: root mounts, in order
                                  reservations?: list<{ input: chord | gesture, place: ref }>,  -- [O encoding]
                                  surface?: ref(view/surface-config) } }              -- absent → inherit the home's default entry
```

`layers` is the only required key; the rest inherits from the home's default entry — which is what makes the **shorthand** lawful: `ol desktop --mount "reader [reading/x]"` synthesizes an entry with that one layer. **Repairing a broken configuration is the same shorthand over the entry chunk itself** (`--mount "chunk-table [my-entry]"`); no safe mode exists. Root-from-config recovery pins with `--at <commit>` [R].

The chassis reads the entry and mechanically hosts it; which components fill the layers, what the surface config names as faces and hosts, what the reservations capture — all field data, all history. The glue (view/sdk) decides nothing the config doesn't state; the chassis decides nothing at all.

---

## Hospitality — hosting `web-dom`

The host's half of the surface kind ([`sdk.md`](sdk.md) holds the glue's half):

- **A served document** — one empty node per **layer**, rendering nothing — plus the glue's boot script. The layers are the entry's: an ordered list of root mounts, each filling one node (the pilot's desktop entry: content, overlay; a kiosk has one).

- **A realm** per document, and realms for isolation: a `FrameBox` citizen gets its own realm on an `ol://<id>` origin.

- **The transport object, installed before the SDK loads** [P] — the chassis's init script provides the one `send`/`receive` object; the SDK embeds no variants ([`engine.md`](engine.md), *The Program Protocol*).

- **Source serving through the engine.** The chassis serves nothing from disk: it registers the `ol://` scheme with the webview and **relays** each request over its engine connection — a dumb pipe, forwarding the URL and returning the bytes. Resolution — which store, which path, at which commit — is entirely the engine's ([`engine.md`](engine.md), *Serving sources*); the chassis knows no paths, which is why the web flavor differs only in transport (a browser's requests reach the engine with no relay at all).

- **Identity into every realm it creates.** Injected host-direct — into an iframe realm's own document, never routed through a parent — so a parent may *gate* a citizen but never read, drop, or forge its traffic [R — carried ruling]. Commits attribute to the context's identity engine-side, which is what makes the injection path load-bearing.

- **The input floor** — below.

## The input floor

**Privileged input is captured natively, before any realm sees it.** What the floor captures is the entry's **reservations**: each names an input (a chord, a gesture) and the place its record lands. On a reserved input the chassis composes the **trusted record** — what happened plus a well-decided location (pointer → mount → the field location shown; realm code cannot synthesize one) — and **lands it in the configured place through its own engine connection**: native code, which is what keeps the record trusted; the glue never writes one ([`view.md`](view.md) carries `view/input-record` with the view family).

The record is a commit, session-owned, removed on dismiss — never ephemera: it is the act's record. Overlays, menus and consent are components whose content derives by expression over that place; dismiss is the record leaving. **No handlers.**

The pilot's desktop entry reserves two inputs: the secondary gesture (→ the overlay place) and the **approval chord** (→ the consent place) — the reserved native chord that seals an escalation's consent ([`engine.md`](engine.md), *Run-to-draft*); its principal is open [O — lean: the mount of the draft face]. The OS's own consent stacks on ours.

---

## What the chassis does not do

- **Render, arrange, or decide.** Components draw; the glue mounts; the entry and the field state everything else. The chassis owns no rectangle but the window's.

- **Interpret substrate operations.** It is a client; ops go to the engine over the wire like everyone's.

- **Own program lifecycle or runtimes.** The engine's ([`engine.md`](engine.md), *Runtime providers*). The chassis spawns nothing.

- **Serve sources from disk.** The engine serves; the chassis relays.

- **Hold durable state.** Persistent view state is commits; never-history state is **ephemera** (lifetimed, soft-persistent; home and encoding [O]). The interface holds no durable in-memory state [R].

---

## Boot

1. Connect to the engine `--engine` names, or the home's default; the engine's own boot — opening the store, attaching — is engine.md's.

2. Resolve the entry: `--mount` (synthesized) or `--entry`, else the toml's `entry` chunk, read through the engine; `--at` pins the read for recovery.

3. Open the window; serve the document with one node per layer and the glue's boot script; install the transport object; inject identity.

4. The glue boots and mounts each layer's root mount ([`sdk.md`](sdk.md)); the input floor arms the entry's reservations.

Shutdown reverses; nothing the chassis holds is durable, so there is nothing to save.

---

## Flavors

[O — breadth; one ships.] **Desktop** (wry — the pilot) · **web-SPA** (a browser tab is another host of `web-dom`, another client of the same engine; reserved-input limits [O]) · **static export** (server-rendered, read-only — the substrate-based website) · **kiosk** (one layer, one entry) · **packaged app**. Each flavor declares its hospitality and its input floor; under latency a chassis may run a local engine — horizon.

---

## What Is Open

- **Reservation and record encodings** — `chassis/entry.reservations`, `view/input-record` (with the view family).

- **The ephemera home and encoding.**

- **Per-frame identity injection on all three wry backends** — confirmed for none yet; where a backend cannot, iframe isolation degrades to the same-DOM guarantee on that platform, explicitly (carried).

- **WebKitGTK** — WebGPU and site isolation both lag; test early or demote Linux explicitly (carried).

- **Crash blast radius** of the one-document model on weaker site isolation — reload-recovery is cheap by design, unmeasured (carried).

- **The web flavor's input-floor limits** — what a browser tab can and cannot reserve.

- **The transpile step's home** — the old host transpiled TS per file at serve, resolved bare specifiers bun-style with no import map, and ESM-ified CJS dependencies once as the general rule; whether that duty lands in the engine's serving or a build step is unplaced (with `ol://` now engine-served), and those resolution rules ride the answer.

- **The attach-time consent chip** — engine-owned open; drawn like any consent face, never by the chassis.

- **The seed's contents** — what first run copies into the home.

- **`.html` entries** — whether a component may own its whole document, as the FrameBox-citizen escape (carried).

---

## Directory

```
chassis-desktop/
  src/               — Rust: window/tao/wry, the served document and layer nodes,
                       transport-object install, identity injection, the input
                       floor, entry reading, ol:// relay to the engine
  .ol/db, .ol/project.toml
```

`chassis-desktop` speaks the engine's wire protocol only — it is a client. The old host's other cargo: the runtime providers live with the engine (`runtime-vm`); the React library and first-party programs became `component/*` and the desktop module ([`components.md`](components.md), [`desktop.md`](desktop.md), [`pilot.md`](pilot.md)).
