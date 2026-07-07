# Bootstrap

Each project has its own bootstrap — the initial commit that seeds its substrate when the project is first initialized. v0.1's first-party projects (`engine`, `host`, `agents`) each ship a bootstrap routine; running `ol init` against an empty directory creates the `.ol/db` and runs the appropriate routine.

The three first-party projects' bootstraps below show what each db starts with. In the running system, these three dbs are mounted together (active project + host + engine) and the engine federates queries across them — so an invocable in the active project is `instance` on `engine/program`, with the placement record in the active project's db and the archetype chunk in the engine project's db. Cross-db placements work by virtue of globally-unique ULIDs; see [`engine.md`](engine.md#engine-api-callable-from-the-host).

## The engine project's bootstrap

Runtime contracts and primitives. Lives in the engine project's db; mounted by every project that runs anything.

1. `engine` — root scope
2. `program` archetype on `engine`: `{ required: ['executable', 'runtime'] }`. Any chunk with an executable and a runtime declaration is a program; instances of `engine/program` are the runnable things in the system. The `runtime` field is a string identifying the registered runtime kind (`'webview'`, `'vm'`, future kinds); other body fields (`capabilities`, `boundary`, `timeout_ms`) are optional.
3. `process` archetype on `engine`: `{ propagate: true }`. A process chunk is the artifact of a run — created by the engine each time a program is invoked. `propagate: true` so any typed arguments placed on a process are validated against the program's `accepts`. The engine writes process state into the body (`status`, `started`, `pid`, `timeout_ms`, `error?` — see [`engine.md`](engine.md#program-and-process)); these are engine-managed, not enforced by the substrate's spec rules.
4. `read-boundary` on `engine` (instance) and `process` (relates). A boundary chunk is `relates` on the process it belongs to — boundaries are execution configuration, not structural content.
5. `write-boundary` on `engine` (instance) and `process` (relates).

`engine/mount` is not bootstrapped — it is a virtual scope (like `db/commits`, `db/branches`), with both archetype and instances synthesized by the engine from its in-memory mount registry. See [`engine.md`](engine.md).

## The host project's bootstrap

Composition primitives for the host's interface layer. Lives in the host project's db; mounted by every project a user opens in the host.

1. `host` — root scope
2. `session` on `host`: `{ propagate: true, accepts: ['tab', 'process'] }`. The outer container of the interface state — a session holds tabs (current arrangements) and processes (running and completed programs, visible in the sidebar).
3. `tab` on `host`: `{ propagate: true, accepts: ['tile'] }`. The root of a tile tree. Workspaces are tabs.
4. `tile` on `host`: `{ ordered: true }`. A node in the split tree. Split nodes carry `{ direction, ratio }`; leaf nodes are empty and point at a process through a `relates` placement.
5. `overlay` on `host`. A program rendered above its anchor (session, tab, or tile) rather than inside the tile composition.
6. `recipe` on `host`: `{ propagate: true, accepts: ['tile'] }`. A preserved tile subtree that can be spawned into a new root.

## The `agents` project's bootstrap

Concrete programs and the agent's working scopes. Lives in the agents project's db. References engine and host archetypes via cross-db placements (the placement records live in agents' db; the archetype chunks live in the mounted engine and host project dbs).

1. `agents` — root scope.
2. `session` archetype on `agents`: `{ ordered: true }` — content deliberately wildcard; a session is **turns** (see [`session.md`](session.md)): each entity is the agent invocation's process chunk, dual-placed with seq at dispatch. The prompt is the invocation's argument; the answer is a chunk on its frame. No event types are seeded.
3. `control` type on `agents` (instance) and `session` (relates): `{ required: ['signal'] }`, body also `target` (the turn's process id; defaults to the active turn) — pause | resume | abort-completion | adjust. `gate` with `{ required: ['action', 'status'] }` lives on frames (see [`agent.md`](agent.md)).
4. Tool programs on `agents` (instance) and `engine/program` (instance): `filesystem`, `shell`, `web`. Each declares `{ propagate: true, accepts: [argument-type], runtime: 'vm' }`, an intrinsic boundary limited to its own process scope, and the executable path. Each argument type is `relates` on its program with `{ required: [...] }` and a schema in body for API tool generation.
5. `model` on `agents` (instance) and `engine/program` (instance): `{ propagate: true, accepts: ['request'], runtime: 'vm' }`, intrinsic boundary limited to its own process scope, capabilities `['net:<provider>', 'secret:<KEY>']`. The only program holding provider access; one completion call per run (see [`agent.md`](agent.md)). `request` type `relates` on `model` with `{ required: ['kind', 'model'] }`.
6. `agent` on `agents` (instance) and `engine/program` (instance): `{ propagate: true, accepts: ['session', 'context', 'prompt'], runtime: 'vm' }`. `session`, `context`, `prompt` placed `relates` on `agent`. No intrinsic boundary placement — the agent is *open*, deferring all restriction to the run. Composes `model`; never touches a provider itself.
7. `echo` on `agents` (instance) and `engine/program` (instance): `{ propagate: true, accepts: ['message'], runtime: 'vm' }` — a minimal test program that echoes its input back as an answer. `message` type on `echo` (relates) with `{ required: ['text'] }`.

The `engine/program` archetype these programs are placed `instance` on lives in the engine project's db (mounted as a peer). The placement record itself is stored in the agents project's db. Cross-db placements work via globally-unique ULIDs; the engine federates resolution at query time.

---

**After bootstrap.** Each project's db holds its own root scope and contracts. Running the host against the active project mounts host and engine as peers, federates the substrate, and the system is reachable. Bootstrap doesn't create a `host/session` instance or any tabs; the first time the host launches, it creates an initial session and an empty tab for the user to work from. That first action is a program run, not part of any project's bootstrap commit.

The `ol init` CLI for fresh projects is part of host implementation; it writes `.ol/db`, runs the appropriate bootstrap commit, and writes a starter `.ol/project.toml` declaring the host and engine projects as required mounts.
