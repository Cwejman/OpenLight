# Board

Current state and what comes next. Updated as things move.

---

## Recent

**Spec phase settled as v0.1.** Reframed from "the pilot" to v0.1 — the seed that grows. Architecture is evergreen; feature scope is intentionally narrow. db, engine, host, sdk drawn whole; cross-referenced, stress-tested, and pressure-tested through a long peering/architectural review. Ready for implementation.

- **Peering / federation / runtime registry / shape pass** (commit `8959f7c`). Multi-project mounts are first-class in v0.1: read-only filesystem-local mounts, cascading from `.ol/project.toml`, branches as version pins. Engine became runtime-agnostic — trait + registry only; VM and webview providers live in the host crate. Engine federates reads + boundary across mounts; reactivity is single-source (active project's commits only) in v0.1. Boundaries are native placements (not body field references); RunArgs takes `BoundarySpec` (Roots vs Existing) and caller-supplied `placements`. Cross-db placements work via globally-unique ULIDs; brokenness manifests at use time; boot validation refuses half-loaded states. `engine/mount` archetype with synthesized instances. `commits_root → db/commits`, `branches_root → db/branches`, `dispatch_id → process_id`, `ui/* → host/*`. Symmetric peering / remote / sync / package merging / cross-host reactivity → horizon.

- **Directory restructure.** First-party projects as top-level dirs (`host/`, `engine/`, `db/`, `agents/`); each ships substrate has `.ol/db` + `.ol/project.toml` (db is code-only for v0.1). SDK consolidated to one runtime-agnostic package `@openlight/sdk` in `engine/sdk/`. React UI library `@openlight/ui` in `host/ui/`. Project name = root scope name (by convention; substrate permits any structure).

- **`agents` as first-party for v0.1.** No longer "e.g.". The agent program and tool programs live there; this is what the host opens as its active project for the demo. `agents/session` and `host/session` are the same conceptual primitive (per `inside.md`) in different domains.

- **db.md (substrate, Rust port).** Spec settled and code architecture drawn. `Db { conn: Mutex<Connection>, sender: broadcast::Sender<Commit> }`. rusqlite's `Transaction` used directly. Validation runs SELECTs through the open transaction. Reactivity push happens from Rust right after `tx.commit()` returns Ok. `ops/` folder for the public surface; `scope/` folded sub-folder for its four query paths. Per-op error enums via thiserror. `rusqlite_migration` with full schema as v1. Estimated ~2,300 Rust lines. (Commits `7a858a5`, `2cec794`.)

- **engine.md / host.md / sdk.md drawn together.** Settled: op vocabulary (`scope`, `commit`, `run`, `await`, `subscribe`, `unsubscribe`); reactivity end-to-end (db broadcast → engine dispatcher → wry IPC or stdio JSON-lines → SDK event router → `useScope` re-fetch); run/await mechanics (`ProcessSlot` per active process, `watch::Sender` for terminal transitions, async `await_processes`); engine API as concrete Rust signatures (further refined by the peering pass to be runtime-agnostic — `RuntimeProvider` trait, `RuntimeHandle { transport, ready, terminal }`, no `on_webview_ready`); host IPC dispatch via wry's `set_ipc_handler` + `evaluate_script`. Programs use the same SDK surface across runtimes; only the transport differs. (Commit `b183256`, refined in `8959f7c`.)

- **Programs come in runtime kinds:** `runtime: '<kind>'` declared on the program archetype, dispatched through the engine's runtime registry. v0.1 ships `webview` and `vm`. Future runtimes (host-rendered DOM from a VM program, GPU canvas, terminal, native widgets) plug in by registering a new provider — engine code never changes.

- **Compositions are first-class as the substrate's island system.** A complex UI mixing DOM and capabilities is a composition of two programs (webview + vm) bound by shared scope, communicating through the substrate. The host renders inner tiles seamlessly when the composition wants seamlessness, even though the programs are independent runtimes.

- **Research file** [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md) captures the runtime/surface exploration: nine topologies surveyed, load-bearing constraints (Bun ≠ wry process, react-dom's behavior is the heavy piece, modern webviews do 60fps, compositions are our islands), and deferred paths with reach points so future work can pick up without re-running the survey.

- **Stress-test + DX pass** — six review subagents (impl-engineer × adversary × cross-doc × bootstrap, against substrate side and engine/host/sdk side). Closed gaps: empty-scope counts contradiction, subscription touched-set algorithm, cancel/timeout race window, FTS tokenization, seq under concurrency. Plus DX fixes: `subscription_invalid` event when a subscribed scope becomes unreachable; cascade-on-parent-end so child processes never outlive their parents; idempotent `cancel`. (Commit `7d1e688`.)

## Tracked debt

- **Bootstrap IDs are hand-picked.** [`substrate.md`](pilot/substrate.md) says chunk IDs are "globally unique, system-generated." Bootstrap and `seedTestDb()` use human-readable strings (`'agent'`, `'program'`, `'session'`) as a pragmatic shortcut so tests and seed code can reference well-known anchors. The aligned fix: switch all bootstrap chunks to generated IDs, have tests look up canonical chunks by name within scope. Carries through to the Rust port; not blocking implementation.
- **`inside.md` carries one or two "invocable" references** in its values prose. Left alone — the inside text is held with care; touch only if the user asks.

## Next

Spec phase settled. Implementation phase begins.

1. **Code the db crate** from [`pilot/db.md`](pilot/db.md). Existing TS suite (63 db tests) as correctness oracle.
2. **Code the engine crate** from [`pilot/engine.md`](pilot/engine.md), including `engine/sdk/` (`@openlight/sdk`, runtime-agnostic, transport via auto-detect or pre-set). Existing TS suite (66 engine tests) as correctness oracle.
3. **Scaffold host** — tao + wry, window, wry IPC handler dispatching to the engine library; mounts cascade walker; VM and webview runtime providers; `host/ui/` (`@openlight/ui`) React library scaffold.
4. **First program: read tile** — validates the webview ↔ host ↔ engine ↔ db loop end-to-end.
5. **Remaining first-party host programs** — sidebar, tab-bar, command-palette, dispatcher.
6. **Agents project** — claude, echo, tool programs (filesystem, shell, web). Active-project demo working end-to-end.

---

## Notes

**The strange (`~/git/agi/`).** Referenced in [`inside.md`](inside.md) as the intellectual parent. Loose exploration — not a source of truth. Sessions should not reach for the strange to resolve questions; if the answer isn't in `inside.md`, the inside is what needs work.

**Research informing the pilot shape.** [`research/ui-landscape-draft.md`](research/ui-landscape-draft.md) (wide survey of UI paradigms), [`research/ui-stacks.md`](research/ui-stacks.md) (technically adoptable shortlist), and [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md) (the runtime/surface exploration behind the `runtime: 'webview' | 'vm'` decision and the deferred topologies). Decisions distilled from these live in the pilot specs; the research files stay as reference depth.

**README hook.** The current README is acceptable but the formulation exercise is not fully crystallized. Preserved threads: "projected not generated," "the generative process itself is native to the medium," "the cyclical process of understanding → implementing," "one act of structuring knowledge." Not settled — material waiting for a future session.
