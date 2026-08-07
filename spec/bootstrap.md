# Bootstrap

Each project has its own bootstrap — the initial commit that seeds its substrate when the project is first initialized. v0.1's first-party projects (`engine`, `host`, `agents`) each ship a bootstrap routine; running `ol init` against an empty directory creates the `.ol/db` and runs the appropriate routine.

In the running system these dbs are mounted together (active project + host + engine) and the engine federates queries across them. Two rules shape every seed:

- **Ownership is local; typing may cross.** Every seeded chunk is owned within its own project (ownership never crosses mounts — substrate.md); `instance` placements may reference archetypes in mounted dbs (the placement record lives in the placing project's db, the archetype in the peer's).
- **Interface archetypes are owned by their program.** A program's argument and result archetypes live in its ownership subtree, referenced from its body's `argument`/`result` keys — found from the program, never by global name, so every program having an `output` collides nowhere (engine.md).

## The engine project's bootstrap

Runtime contracts and primitives. Mounted by every project that runs anything.

1. `engine` — root scope. Everything below is owned by it.
2. `program` — the archetype of runnable things. Instance spec (the program body, engine.md):
   ```
   { executable: string, runtime: string, capabilities?: list<string>,
     timeout_ms?: number, argument?: ref, result?: ref, demand?: map,
     uses?: list<ref>, presets?: list<ref> }
   ```
3. `process` — the archetype of runs. Instance spec (the process record, engine.md):
   ```
   { argument: ref, at: ref, status: ref(status), result?: ref,
     read: list<ref>, write: list<ref> }
   ```
   The engine writes and protects instances from dispatch on; drafts are data.
4. `status` — the archetype whose instances are the lifecycle vocabulary: `draft`, `running`, `done`, `failed` — four value chunks owned by it (enums are the substrate's; substrate.md).

No boundary chunks are seeded — a run's reach is the process body's `read`/`write` keys. `engine/mount` is not bootstrapped — it is a virtual scope, synthesized from the mount registry (engine.md).

## The host project's bootstrap

Composition primitives for the interface layer. Mounted by every project a user opens in the host.

1. `host` — root scope.
2. `session`, `tab`, `tile`, `overlay`, `recipe` — the composition archetypes, with the instance specs drawn in [`host.md`](host.md#the-composition-types). Membership is placements: tabs and processes `instance` on a session instance, tiles `instance` on tabs/parent tiles with `seq`, the displayed process `relates` on its leaf.
3. Host-shipped surface programs, seeded as invocables — owned by `host`, `instance` on the mounted `engine/program`: `read-tile` (grows into `reader`), `sidebar`, `form`, and the chrome as it lands (`tab-bar`, `palette`). Each owns its argument archetype (the sidebar's: `request` with `{ session: ref(session) }`; the reader's: `reading` with `{ current: ref }` — programs.md §3). Declared is not run: boot runs the sidebar strip and read-tile; the rest are declared ahead of their builds.

## The `agents` project's bootstrap

Concrete programs and the agent's steering vocabulary. No session or conversation container is seeded — **threads derive** from citation ([`agent.md`](agent.md)); a conversation materializes as a named location only when named, shared, bound, or peopled.

1. `agents` — root scope.
2. `control` — the steering archetype: instance spec `{ signal: ref(signal), target: ref }`; `signal` beside it with four value chunks — `pause`, `resume`, `abort-completion`, `adjust`. Controls are placed `relates` on the turn they steer.
3. Tool programs — owned by `agents`, `instance` on the mounted `engine/program`: `filesystem`, `shell`, `web`, `echo`. Each declares `runtime: 'vm'`, a frame-only `demand` (`{ read: [], write: [] }`), its capabilities, and owns its interface archetypes:
   - `shell` — argument `{ command: string, cwd?: string }`; result `output` `{ stdout: string, stderr: string, exit: number }`.
   - `web` — argument `{ url: string, method?: string, body?: string }`; result `output` `{ status: number, headers: map, body: string }`; capability `net`.
   - `filesystem` — argument (op-shaped: `{ op: string, path: string, content?: string }`); result `output` (op-shaped by a `kind` key: content, entries, ack); capability `fs`.
   - `echo` — argument `{ text: string }`; result `output` `{ text: string }`. The loop proof.
4. `model` — owned by `agents`, `instance` on `engine/program`. `runtime: 'vm'`, frame-only demand, capabilities `['net:<provider>', 'secret:<KEY>']`. Owns `request` (`{ kind: string, model: string, … }` — provider keys as `?`-optional) and result `output` (`{ kind: string, content?: markdown, vector?: list<number>, usage: map }`). The only program holding provider access; one completion per run ([`agent.md`](agent.md)).
5. `agent` — owned by `agents`, `instance` on `engine/program`. `runtime: 'vm'`, **no demand** — intrinsically open, the run grant is the person's whole decision. Owns its argument archetype `turn` (the draft's record: context expression + prompt — *open: exact keys settle at the draft + form build*), its result `answer` (`{ text: markdown, partial?: number }`), and `gate` (a frame chunk, not a result, declared in the body for the same enforcement reason — `{ action: string, status: ref(status) }`, shape open). Composes `model`; never touches a provider itself.

**After bootstrap.** Each project's db holds its own root and contracts. Running the host against the active project mounts host and engine as peers, federates the substrate, and the system is reachable. Bootstrap doesn't create a session instance or any tabs; the first launch creates an initial session and an empty tab — a program run, not part of any bootstrap commit.

The `ol init` CLI is host implementation; it writes `.ol/db`, runs the appropriate bootstrap commit, and writes a starter `.ol/project.toml` declaring the host and engine mounts.

*Open — no migration path.* Bootstrap is idempotent by marker (db.md): once seeded, the routine never re-runs, so changed declarations never reach an already-seeded project. Reseeding is the current answer; a real migration path is unruled debt.

*Open — ref-constraint naming.* How seeded specs name their ref constraints (`ref(status)` — id vs scoped name) couples to the bootstrap-ID debt (board); these settle together.
