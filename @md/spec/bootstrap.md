# Bootstrap

Each store has its own bootstrap — the initial commit that seeds its substrate when the store is first initialized. The first-party stores (`engine`, `view`, the `component/*` family, `desktop`, `agents`) each ship a bootstrap routine; `ol init` against an empty directory creates the `.ol/db`, runs the appropriate routine, and writes a starter `.ol/project.toml` with the `[[attach]]` entries the store depends on. In the running field these stores are attached together and evaluated as one ([`engine.md`](engine.md), *Stores and attach*).

Three rules shape every seed.

**Roots are the bootstrap carve-out.** A chunk with no owner is a root, and a root may be created **only by a bootstrap commit** ([`substrate.md`](substrate.md)). This file is where that carve-out is stated, because bootstrap is the only place it is exercised: one root per store, named after it. Every other writer is bound by *chunk birth is never placementless*; a machine-context declaration carries no frame and must name each chunk's owner ([`engine.md`](engine.md), *The call context*).

**Ownership is local; typing may cross.** Every seeded chunk is owned within its own store (ownership never crosses stores); `instance` placements may reference archetypes in attached stores — the placement record lives in the placing store, the archetype in the peer's.

**A program or component owns its payload and result archetypes — as naming, not as reach.** The archetypes are found **from the body** — what `accepts` entries and `result` name — never by global name or path, so every program having an `output` collides nowhere. There is no argument archetype: an argument is a selection, and its chunk-shaped elements are instances of payload archetypes.

## The engine store

Runtime contracts and primitives. Attached by every store that runs anything.

1. `engine` — the root.

2. `program` — the archetype of runnable things; instance contract = the program body ([`engine.md`](engine.md)): `{ executable?, runtime: vm | native, accepts, result?, read?/write?/run?, capabilities?, timeout_ms? }`. `accepts` required; ceilings per the boundary law — an absent key means `{}`, `caller` composes the parent's reach in.

3. `process` — the archetype of runs; instance contract = the process body: `{ argument, at, status, result?, error?, read, write, run }`. The engine writes and protects instances from the start on; drafts are data.

4. `status` — the lifecycle vocabulary: `draft`, `running`, `done`, `failed` as value chunks owned by it (enums are the substrate's).

5. `expression` — the archetype of lifted expressions: `{ nodes: map, out: string }`. Composition into an argument materializes an instance of it.

6. `attach` and `detach` — the engine's own native programs ([`engine.md`](engine.md), *Stores and attach*), owned by the root; their payload archetypes carry the attach record's shape.

`[engine/attached]` is not bootstrapped — a virtual place, synthesized from the engine's attach state, as `db/commits` and `db/branches` are projected by the read layer ([`db.md`](db.md)). No boundary chunks, no collation — the reader owns `collation` now ([`components.md`](components.md)).

## The view store

The contract archetypes ([`view.md`](view.md)): `view` — the root — owning `surface` (with the `web-dom` kind chunk), `surface-config`, `component`, `mount`, `implementation`, `template`, `input-record`, `locked`, `isolated`, and `scheme` (seeded for the desktop root's offer — the brief's illustrative mechanism, not yet law [P]). Identity and contract chunks only; no person edits the kinds, and nothing here is a realization.

## The component stores

Each `component/*` store seeds its root, its component declarations, their payload archetypes (settings included), and references its default implementations (`view/implementation` chunks whose `source` paths live in the store's own files). The pattern is the program convention applied to components; the declarations themselves are [`view.md`](view.md)'s. `component/reader` additionally owns `reading` (`{ current: ref(collation) }`) and `collation` (`{ mounts, settings, predecessor? }`).

## The desktop store

The pilot's environment ([`desktop.md`](desktop.md)): `desktop` — the root — owning the **entry** instance (two layers, two reservations, the surface config), the **shell** component with its template realization, the **session** archetype (`{ root?: ref(view/mount) }`), `sidebar`, and `projects`. Bootstrap creates no session instance: the first launch creates one — a run, not part of any bootstrap commit — owned in the store it was opened for [R — 2026-08-20].

## The agents store

Concrete programs and the agent's steering vocabulary. No session container, no conversation container, no gate, no context archetype — **threads derive** from citation ([`agent.md`](agent.md)).

1. `agents` — the root.

2. `control` — the steering archetype: `{ signal: ref(signal), target: ref }`; `signal` beside it with `pause`, `resume`, `abort-completion`, `adjust`. Controls are placed `relates` on the turn they steer.

3. Tool programs — `filesystem`, `shell`, `web`, `echo`: `runtime: vm`, no ceiling keys (absent = `{}` — the fully contained program: nothing beyond frame and argument, starts nothing, enforced rather than promised), their capabilities, and each owning its payload and result archetypes:

   - `shell` — payload `{ command: string, cwd?: string }`; result `output` `{ stdout, stderr, exit }`; capability `exec`.
   - `web` — payload `{ url, method?, body? }`; result `output` `{ status, headers, body }`; capability `net`.
   - `filesystem` — payload (op-shaped: `{ op, path, content? }`); result `output` (op-shaped by a `kind` key); capability `fs`.
   - `echo` — payload `{ text }`; result `output` `{ text }`. The loop proof.

4. **The `model` dimension and its family.** `model` — the family's unification point: every provider program is placed `instance` on it, so `read([model])` lists the family. It owns the shared vocabulary: `output` (`{ content?, thinking?, residue?, calls: list<ref>, stop_reason?, usage }`), `params` (`{ model, kind?, extra? }`), `kind` (`complete`, `embed`). Provider programs (v0.1: `claude`): `runtime: vm`, `accepts: [ selection ]`, `result: ref(model/output)`, capability `net:<provider>`, and `run: { read-secret }` — the key enters through the secrets module, never as a capability of its own ([`engine.md`](engine.md), *Runtime providers*; the brief's secrets ruling). No request archetype exists — a model run's argument is the window.

5. **`agent`** — `runtime: vm`, `accepts: [ selection ]`, `result: ref(answer)`, no ceiling keys — absent means `{}`, so the agent's reach is entirely what the starter lends. Owns `answer` and `settings`; `prompt` is the store root's vocabulary, cited by any draft.

## The secrets store

`secrets` — the root — owning `secret` (`{ name }` — hand-picked stand-ins; values never chunks) and `read-secret` (`runtime: vm`, capability `exec` — the keychain is an OS citizen; the sole value path, walled by `run`).

**After bootstrap.** Each store's db holds its own root and contracts. The engine attaches them per the home's toml, the field federates, and the system is reachable.

*Open — archetypes the law names and nothing seeds.* `runtime: vm | native` reads as a closed value union, but the type vocabulary has no such word — whether `runtime` is `ref(runtime)` with seeded value chunks (the `status` parallel) or a new tag union is unresolved; engine.md writes the informal form. `engine/buffer` stays unseeded while the realization is open. `chassis/entry`'s archetype is declared by the chassis ([`chassis.md`](chassis.md)) and shipped in the desktop store — whether the archetype chunk itself seeds under `desktop` or a `chassis` root is unpicked.

*Open — no migration path.* Bootstrap is idempotent by marker (db.md): once seeded, the routine never re-runs, so changed declarations never reach an already-seeded store. Reseeding is the current answer; a real migration path is unruled debt.

*Open — ref-constraint naming.* How seeded contracts name their ref constraints (`ref(status)` — id vs closure name) couples to the bootstrap-ID debt (board); these settle together.
