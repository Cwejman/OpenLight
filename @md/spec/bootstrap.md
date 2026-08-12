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

No boundary chunks are seeded — a run's reach is the process body's `read`/`write` keys. `engine/mount` is not bootstrapped — it is a virtual place, synthesized from the mount registry (engine.md), as `db/commits` and `db/branches` are projected by the read layer ([`db.md`](db.md)).

## The host project's bootstrap

Composition primitives for the interface layer. Mounted by every project a user opens in the host.

1. `host` — the root chunk.
2. `session`, `tab`, `tile`, `overlay`, `recipe` — the composition archetypes. Their instance contracts are declared in [`programs.md`](programs.md) §1 (*The arrangement layer*), which is where the arrangement layer lives; they are not restated here. Membership is placements, so an arrangement is ordinary field structure with ordinary history: processes are `instance` on a session instance (session membership *is* sidebar presence), an overlay is placed on its span target, and the displayed process is `relates` on its leaf tile.

   *Open — the containment kind, and the seed waits on it.* [`programs.md`](programs.md) §1 marks the kind of the **tab-on-session and tile-on-tile** edges undecided — `instance`, as drawn there, versus `owned`, which is the kind that means *where it lives* but fires substrate.md's naming rule on nameless tiles. The `seq: true` declarations on `host/tab` and `host/tile` ride the same choice. Writing the placements into a seed now is the guess itself, so the seed's edge kind is left unwritten until programs.md §1 settles it.

3. **The host surface-program seeds — owed, deliberately unwritten.** The host ships its surfaces as programs owned by `host` and `instance` on the mounted `engine/program`; the set is [`programs.md`](programs.md) §8 — `shell`, `sidebar`, `tab-bar`, `palette`, and `reader` (built today as `read-tile`). The seed this replaces listed `read-tile`, `sidebar`, `form`, `tab-bar` and `palette`, with `read-tile`'s `reading` (`{ current: ref }`) and the sidebar's `request` (`{ session: ref(session) }`) as their argument archetypes. It is not carried forward: **`form` is dissolved** — an unconsumed argument is *seated*, not rendered by a program that knows about drafts ([`programs.md`](programs.md) §2) — and `host/shell` is what belongs in its place, since under one compositor the window itself is a view program. Two things must settle before the replacement can be written, and guessing either bakes it in:

   - **The containment kind** (above). `shell` and `tab-bar` are the tile tree's two writers beside the arranger, and their stated `read`/`write` ceilings are expressed over that tree — programs.md §1 already has to say `[session] | follow` because a root grants one hop, not a subtree. Which kind carries the edges changes what those ceilings name.
   - **The shell/sidebar/palette seat model under one compositor.** These surfaces are seated inside one shell document rather than owning webviews ([`engine.md`](engine.md), *Containment*; [`host.md`](host.md), *One window, one shell document*). Which of them are seeded as programs, with which `accepts` entries and payload archetypes, and which are seats the shell creates at runtime, is settled nowhere.

   What the written seed will carry, once both settle: per program, its `accepts` entries and the payload archetypes they name, its `read`/`write` ceiling, and its `grades`. **Declared is not run** — boot starts the shell, sidebar and tab-bar ([`host.md`](host.md), *Boot sequence*, step 10) and the palette on demand; the rest are declared ahead of their builds.

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

*Open — what owns the first session.* A session must outlive the process that created it, so the frame default cannot own it; boot runs under `Context::process_id = None`, which carries no frame and must name an owner for every chunk it creates ([`engine.md`](engine.md), *Governance at `commit`*); and a root is not available, because roots are bootstrap-only and the first session is not seeded. No file answers which chunk owns it. Carried with [`host.md`](host.md)'s same question (*What Is Open*).

*Open — archetypes the law names and nothing seeds.* engine.md types the program body's `runtime` as `ref(runtime)`, but no `runtime` archetype and no value chunks for the registered kinds (`vm`, `webview`, `native` — engine.md, *Runtime providers*) are seeded anywhere; `status` has exactly the parallel seed and `runtime` does not. `collation` is named by the program body's `presets` and declared in engine.md (*The shapes*), and `reading` in [`programs.md`](programs.md) §3 — neither states an owner, so neither has a project to be seeded into. `engine/buffer` is named by engine.md's *Buffers* and stays unseeded while the realization is open. Named, not decided.

*Open — no migration path.* Bootstrap is idempotent by marker (db.md): once seeded, the routine never re-runs, so changed declarations never reach an already-seeded project. Reseeding is the current answer; a real migration path is unruled debt.

*Open — ref-constraint naming.* How seeded contracts name their ref constraints (`ref(status)` — id vs closure name) couples to the bootstrap-ID debt (board); these settle together.
