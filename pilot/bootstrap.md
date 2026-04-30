# Bootstrap

Three `commit()` calls — one per root scope (`engine`, `ui`, `agent`; see [`pilot.md`](../pilot.md#three-root-scopes-stand-for-three-peers)). The pilot uses a single database with these three scopes standing in for what a peered system would mount from separate sources. Engine and UI chunks come first, as if mounted from external databases. Agent chunks come last, referencing engine contracts by placing instances on them.

## Commit 1: Engine

Runtime contracts and primitives. In a peered system these come from the engine's own database.

1. `engine` — root scope
2. `program` archetype on `engine`: `{ required: ['executable', 'runtime'] }`. Any chunk with an executable and a runtime declaration is a program; instances of program are the runnable things in the system. The `runtime` field is `'webview' | 'subprocess'` (see [`engine.md`](engine.md#program-and-process)); other body fields (`capabilities`, `boundary`, `timeout_ms`) are optional.
3. `process` archetype on `engine`: `{ propagate: true }`. A process chunk is the artifact of a run — created by the engine each time a program is invoked. `propagate: true` so any typed arguments placed on a process are validated against the program's `accepts`. The engine writes process state into the body (`status`, `started`, `pid`, `timeout_ms`, `error?` — see [`engine.md`](engine.md#program-and-process)); these are engine-managed, not enforced by the substrate's spec rules.
4. `read-boundary` on `engine` (instance) and `process` (relates). A boundary chunk is `relates` on the process it belongs to — boundaries are execution configuration, not structural content.
5. `write-boundary` on `engine` (instance) and `process` (relates).

## Commit 2: UI

Composition primitives for the host's interface layer. In a peered system these come from the host module's own database.

1. `ui` — root scope
2. `session` on `ui`: `{ propagate: true, accepts: ['tab', 'process'] }`. The outer container of the host's interface state — a session holds tabs (current arrangements) and processes (running and completed programs, visible in the sidebar).
3. `tab` on `ui`: `{ propagate: true, accepts: ['tile'] }`. The root of a tile tree. Workspaces are tabs.
4. `tile` on `ui`: `{ ordered: true }`. A node in the split tree. Split nodes carry `{ direction, ratio }`; leaf nodes are empty and point at a process through a `relates` placement.
5. `overlay` on `ui`. A program rendered above its anchor (session, tab, or tile) rather than inside the tile composition.
6. `recipe` on `ui`: `{ propagate: true, accepts: ['tile'] }`. A preserved tile subtree that can be spawned into a new root.

## Commit 3: Agent

Project tools and concrete programs. References engine contracts across the peer boundary.

1. `agent` — root scope
2. `session` archetype on `agent`: `{ propagate: true, ordered: true, accepts: ['prompt', 'answer', 'tool-call', 'tool-result', 'context'] }`. Distinct from `ui/session` — this is the agent's interaction trace.
3. Session event types on `agent` (instance) and `session` (relates): `prompt` with `{ required: ['text'] }`, `answer`, `tool-call` with `{ required: ['program'] }`, `tool-result` with `{ required: ['program'] }`, `context` with `{ ordered: true }`.
4. Tool programs on `agent` (instance) and `program` (instance): `filesystem`, `shell`, `web`. Each declares `{ propagate: true, accepts: [argument-type], runtime: 'subprocess' }`, an intrinsic boundary limited to its own process scope, and the executable path. Each argument type is `relates` on its program with `{ required: [...] }` and a schema in body for API tool generation.
5. `claude` on `agent` (instance) and `program` (instance): `{ propagate: true, accepts: ['session', 'context', 'prompt'], runtime: 'subprocess' }`. `session`, `context`, `prompt` placed `relates` on `claude`. Intrinsic boundary: `open` — defers all restriction to the run.
6. `echo` on `agent` (instance) and `program` (instance): `{ propagate: true, accepts: ['message'], runtime: 'subprocess' }` — a minimal test program that echoes its input back as an answer. `message` type on `echo` (relates) with `{ required: ['text'] }`.

---

**After bootstrap.** The substrate holds the three root scopes with their contracts. Bootstrap doesn't create a `ui/session` or any tabs; the first time the host launches, it creates an initial session and an empty tab for the user to work from. That first action is a program run, not part of the bootstrap commit.
