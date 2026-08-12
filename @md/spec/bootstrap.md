# Bootstrap

Each project has its own bootstrap — the initial commit that seeds its substrate when the project is first initialized. v0.1's first-party projects (`engine`, `host`, `agents`) each ship a bootstrap routine; running `ol init` against an empty directory creates the `.ol/db` and runs the appropriate routine.

In the running system these dbs are mounted together (active project + host + engine) and the engine federates queries across them. Three rules shape every seed.

**Roots are the bootstrap carve-out.** A chunk with no owner is a root, and a root may be created **only by a bootstrap commit** ([`substrate.md`](substrate.md), *Five Connection Kinds*). This file is where that carve-out is stated, because bootstrap is the only place it is exercised: the three root chunks below — `engine`, `host`, `agents` — are legal precisely and only because of it, one root per project, named after it. Every other writer is bound by *chunk birth is never placementless*: a declared chunk carrying no `owned` placement is created owned by the running process, its frame default, and a host-initiated declaration under `Context::process_id = None` carries no frame at all and must name an owner for each chunk it creates ([`engine.md`](engine.md), *Governance at `commit`*). Bootstrap is the one writer that may name none.

**Ownership is local; typing may cross.** Every seeded chunk is owned within its own project (ownership never crosses mounts — substrate.md); `instance` placements may reference archetypes in mounted dbs — the placement record lives in the placing project's db, the archetype in the peer's.

**A program owns its payload and result archetypes — as naming, not as reach.** Ownership carries naming and containment and nothing else, so owning an archetype gives a program a path under its own name and confers no reach over it, into it, or through it. The archetypes are found **from the program's body** — the ones its `accepts` entries name, and the one its `result` names — never by global name or path, so every program having an `output` collides nowhere ([`engine.md`](engine.md), *The program body*). There is no *argument* archetype: an argument is a selection — an ordered list of typed elements — and its chunk-shaped elements are instances of **payload archetypes**, which is what an `accepts` entry names.

## The engine project's bootstrap

Runtime contracts and primitives. Mounted by every project that runs anything.

1. `engine` — the root chunk (no owner; the carve-out above). Everything below is owned by it.
2. `program` — the archetype of runnable things. Instance contract (the program body, [`engine.md`](engine.md)):
   ```ol
   { executable?: string, runtime: ref(runtime), accepts: list<type>,
     result?: ref, read?: selection, write?: selection, run?: selection,
     capabilities?: set<string>, timeout_ms?: number,
     grades?: map<{ wmin?: number, wmax?: number, hmin?: number, hmax?: number }>,
     uses?: set<ref(program)>, presets?: set<ref(collation)> }
   ```
   `accepts` is **required**; `[]` is legal and says *takes nothing*, explicitly. `read`, `write` and `run` are selection-grade, and absent-versus-present is the whole meaning: absent defers reach to the run, present is an exact ceiling a run may narrow and never widen, present-and-empty (`{}`) is none — all three empty is the fully contained program ([`engine.md`](engine.md), *Boundaries*).
3. `process` — the archetype of runs. Instance contract (the process record, [`engine.md`](engine.md)):
   ```ol
   { argument: selection, at: ref(commit), status: ref(status), result: ref?,
     error?: string, read: selection, write: selection, run: selection }
   ```
   `argument` is the offered set — a field on the process body, never a chunk of its own — frozen at start; `read`, `write` and `run` are the run's boundary, frozen as expressions. The engine writes and protects instances from the start on; drafts are data.
4. `status` — the archetype whose instances are the lifecycle vocabulary: `draft`, `running`, `done`, `failed` — four value chunks owned by it (enums are the substrate's; substrate.md).
5. `expression` — the archetype of lifted expressions; instance contract `{ nodes: map, out: string }` ([`engine.md`](engine.md), *The shapes*). Composition into an argument materializes an instance of it, which is what keeps provenance at the expression's own grain.
6. `collation` — the value archetype declared beside it ([`engine.md`](engine.md), *The shapes*): `{ selections: list<selection>, settings: map, predecessor?: ref(collation) }`. Seeded here because engine.md declares it and the reader's `reading` contract references it.

No boundary chunks are seeded — a run's reach is the process body's `read`/`write` keys. `engine/mount` is not bootstrapped — it is a virtual place, synthesized from the mount registry (engine.md), as `db/commits` and `db/branches` are projected by the read layer ([`db.md`](db.md)).

## The host project's bootstrap

Composition primitives for the interface layer. Mounted by every project a user opens in the host.

1. `host` — the root chunk.
2. `session`, `tab`, `tile`, `overlay`, `recipe` — the composition archetypes. Their instance contracts are declared in [`programs.md`](programs.md) §1 (*The arrangement layer*), which is where the arrangement layer lives; they are not restated here. **The tree is typed fields** (ruled 2026-08-12): `session.tabs`, `tab.root`, `tile.children` — no `seq: true` anywhere in the arrangement, no tree placements, tiles owned flat under their session. What remains placements is *membership*: processes `instance` on a session instance (session membership *is* sidebar presence), and an overlay placed on its span target.

3. **The host surface-program seeds** (seat model ruled 2026-08-12) — programs owned by `host`, `instance` on the mounted `engine/program`, all `runtime: webview`, all with implicit unbounded grades:

   - **`shell`** — the root program: window arrangement, tile placement, overlays, the canvas, and **pinned chrome seats** for sidebar and tab-bar (deliberate seats, no match, no swap — [`programs.md`](programs.md) §1). `accepts: [ ref(session) ]`; reads `{[session], [engine/program]}`; writes `{[session]}`.
   - **`sidebar`** — `accepts: [ ref(session) ]`; reads `{[session], [engine/program]}`; writes `{[session]}`. Started by the shell's pinned seat, as its child.
   - **`tab-bar`** — `accepts: [ ref(session) ]`; reads/writes `{[session]}`. Likewise.
   - **The command program** (working name `palette` — one name owed, author's pick): serves the point-anchored **menu grade** and the session-anchored **palette grade**, dispatch-chosen ([`programs.md`](programs.md) §5). `accepts: [ selection ]` — the offer it shows verbs for; **no boundary keys** — its reach is the person's, granted at start; every consequence is a `launch` or an arranger intent. Summoned by the leader key (host) at palette grade, by the seat gesture (via the root program) at menu grade.
   - **`arranger`** — `runtime: vm`; the tree's command writer. Owns its verb payloads (`open { content, position }`, `split`, `close`, `wrap`, `move`, …) and `position` with its value chunks (`here`, `beside`, `tab`, `overlay`, `none`). Reads/writes `{[session]}`.
   - **`reader`** — `accepts: [ ref(reading) ]` ([`programs.md`](programs.md) §3); owns `reading` (`{ current: ref(collation) }`) per the payload convention.

   The old `request` payload archetypes are not carried forward — a payload wrapping a single ref is the anti-pattern the set-argument model removed; the offer is the session itself. **`form` is dissolved** ([`programs.md`](programs.md) §2). **Declared is not run** — boot starts the shell alone ([`host.md`](host.md), *Boot sequence*, step 10); the shell's pinned seats start sidebar and tab-bar; the palette on demand; the rest are declared ahead of their builds.

## The `agents` project's bootstrap

Concrete programs and the agent's steering vocabulary. No session container, no conversation container, no gate, no context archetype — **threads derive** from citation ([`agent.md`](agent.md)); a conversation materializes as a named location only when named, shared, bound, or peopled.

1. `agents` — the root chunk.
2. `control` — the steering archetype: instance contract `{ signal: ref(signal), target: ref }`; `signal` beside it with four value chunks — `pause`, `resume`, `abort-completion`, `adjust`. Controls are placed `relates` on the turn they steer.
3. Tool programs — owned by `agents`, `instance` on the mounted `engine/program`: `filesystem`, `shell`, `web`, `echo`. Each declares `runtime: vm`, `read: {}` / `write: {}` / `run: {}` — present and empty, the fully contained program: nothing beyond its own frame, starts nothing, enforced rather than promised ([`engine.md`](engine.md), *Boundaries*) — its capabilities, and owns the payload archetype its `accepts` names together with its result archetype:
   - `shell` — payload `{ command: string, cwd?: string }`; result `output` `{ stdout: string, stderr: string, exit: number }`.
   - `web` — payload `{ url: string, method?: string, body?: string }`; result `output` `{ status: number, headers: map, body: string }`; capability `net`.
   - `filesystem` — payload (op-shaped: `{ op: string, path: string, content?: string }`); result `output` (op-shaped by a `kind` key: content, entries, ack); capability `fs`.
   - `echo` — payload `{ text: string }`; result `output` `{ text: string }`. The loop proof.

   *Open: the result archetypes are named ([`programs.md`](programs.md) §8); the payload archetypes on the `accepts` side are not named anywhere.*
4. **The `model` dimension and its family.** `model` — a chunk owned by `agents`, the family's unification point: every provider program is placed `instance` on it, so `read([model])` lists the family. It owns the shared vocabulary: `output` (`{ content?: markdown, thinking?: markdown, residue?: map, calls: list<ref>, stop_reason?: string, usage: map }`), `params` (`{ model: string, kind?: ref(model/kind), extra?: map }`), and `kind` with value chunks `complete`, `embed`. Provider programs (v0.1: `claude`) are owned by `agents`, `instance` on the mounted `engine/program` **and** on `model`, `runtime: vm`, `accepts: [ selection ]`, `result: ref(model/output)`, `read: {}` / `write: {}` / `run: {}` — sealed — with provider capabilities (`net:<provider>`, `secret:<KEY>`). **No request archetype exists** — a model run's argument is the window ([`agent.md`](agent.md), *`model`*).
5. **`agent`** — owned by `agents`, `instance` on the mounted `engine/program`, `runtime: vm`, `accepts: [ selection ]`, `result: ref(answer)`, **no boundary keys** — intrinsically open; reach is entirely the run grant. Owns `answer` (`{ text: markdown }`) and `settings` (per-turn overrides: `{ model?: ref, … }`). The classification archetype `prompt` (`{ text: markdown }`) is owned by the `agents` root — project vocabulary, cited by any draft, not agent-internal. No gate archetype exists — action approval is run-to-draft ([`engine.md`](engine.md), *Lifecycle*); no context archetype exists — the context is the argument ([`agent.md`](agent.md)).

**After bootstrap.** Each project's db holds its own root and contracts. Running the host against the active project mounts host and engine as peers, federates the substrate, and the system is reachable. Bootstrap creates no session instance and no tabs; the first launch creates an initial session and an empty tab — a program run, not part of any bootstrap commit.

The `ol init` CLI is host implementation; it writes `.ol/db`, runs the appropriate bootstrap commit, and writes a starter `.ol/project.toml` declaring the host and engine mounts.

*What owns the first session — ruled (2026-08-12): the active project's root.* Boot runs under `Context::process_id = None` and names the root as owner — an ordinary placement by the writer that holds the reach. Strictly project-based is the current model; a more unbounded compute environment may reopen this (author note).

*Open — archetypes the law names and nothing seeds.* engine.md types the program body's `runtime` as `ref(runtime)`, but no `runtime` archetype and no value chunks for the registered kinds (`vm`, `webview`, `native` — engine.md, *Runtime providers*) are seeded anywhere; `status` has exactly the parallel seed and `runtime` does not. `engine/buffer` is named by engine.md's *Buffers* and stays unseeded while the realization is open. (`collation` and `reading` are no longer here — seeded under engine and under the reader, above.) Named, not decided.

*Open — no migration path.* Bootstrap is idempotent by marker (db.md): once seeded, the routine never re-runs, so changed declarations never reach an already-seeded project. Reseeding is the current answer; a real migration path is unruled debt.

*Open — ref-constraint naming.* How seeded contracts name their ref constraints (`ref(status)` — id vs closure name) couples to the bootstrap-ID debt (board); these settle together.
