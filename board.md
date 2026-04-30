# Board

Current state and what comes next. Updated as things move.

---

## Recent

**Spec phase complete.** db, engine, host, sdk all drawn whole; cross-referenced and stress-tested. Ready for implementation.

- **db.md (substrate, Rust port).** Spec settled and code architecture drawn. `Db { conn: Mutex<Connection>, sender: broadcast::Sender<Commit> }`. rusqlite's `Transaction` used directly (no custom Tx helper). Validation runs SELECTs through the open transaction. Reactivity push happens from Rust right after `tx.commit()` returns Ok (no SQLite commit_hook). `ops/` folder for the public surface (one file per Db method); `scope/` folded sub-folder for its four query paths. Per-op error enums via thiserror. `rusqlite_migration` with full schema as v1. Estimated ~2,300 Rust lines. (Commits `7a858a5`, `2cec794`.)

- **engine.md / host.md / sdk.md drawn together.** Settled: op vocabulary (`scope`, `commit`, `run`, `await`, `subscribe`, `unsubscribe`); reactivity end-to-end (db broadcast → engine dispatcher → wry IPC or stdio JSON-lines → SDK event router → `useScope` re-fetch); run/await mechanics (`ProcessSlot` per active process, `watch::Sender` for terminal transitions, async `await_processes`); engine API as concrete Rust signatures; host IPC dispatch via wry's `set_ipc_handler` + `evaluate_script`. Programs use the same SDK surface across both runtimes; only the transport differs. (Commit `b183256`.)

- **Programs come in runtime kinds:** `runtime: 'webview' | 'vm'` declared on the program archetype. Single enum, no invalid combinations. `webview` = wry-hosted V8 with full client-side React, browser APIs, 60fps interactions. `vm` = shebang-spawned process inside a Linux VM (Bun for first-party programs because the SDK is TS, not as a property of the kind). Future runtimes (host-rendered DOM from a VM program, GPU canvas, terminal, native widgets) become new enum values. The pilot ships TS-only SDK; non-TS programs reachable when an SDK exists for that language.

- **SDK splits into two packages:** `@night/sdk` (universal substrate access — `scope`, `commit`, `run`, `awaitRun`, `cancel`, `subscribe`) and `@night/sdk-react` (hooks; pilot ships `useScope`). SDK has zero rendering concerns — webview programs call `createRoot(...).render(...)` directly.

- **Compositions are first-class as the substrate's island system.** A complex UI mixing DOM and capabilities is a composition of two programs (webview + vm) bound by shared scope, communicating through the substrate. The host renders inner tiles seamlessly when the composition wants seamlessness, even though the programs are independent runtimes.

- **Research file** [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md) captures the runtime/surface exploration: nine topologies surveyed (Electron+nodeIntegration, Tauri, custom React reconciler, DOM-shim in Bun, SSR+HTML diff / LiveView, native UI, embedded JS, WASM, hydration islands), load-bearing constraints (Bun ≠ wry process, react-dom's behavior is the heavy piece, modern webviews do 60fps, compositions are our islands), and deferred paths with reach points so future work can pick up without re-running the survey.

- **Stress-test + DX pass** — six review subagents (impl-engineer × adversary × cross-doc × bootstrap, against substrate side and engine/host/sdk side). Closed gaps: empty-scope counts contradiction, subscription touched-set algorithm, cancel/timeout race window, FTS tokenization, seq under concurrency. Plus deliberate DX fixes: `subscription_invalid` event when a subscribed scope becomes unreachable (engine auto-unsubscribes; SDK treats subscription as dead); cascade-on-parent-end so child processes never outlive their parents; idempotent `cancel`. (Commit `7d1e688` + this commit.)

## Tracked debt

- **Bootstrap IDs are hand-picked.** [`substrate.md`](pilot/substrate.md) says chunk IDs are "globally unique, system-generated." Bootstrap and `seedTestDb()` use human-readable strings (`'agent'`, `'program'`, `'session'`) as a pragmatic shortcut so tests and seed code can reference well-known anchors. The aligned fix: switch all bootstrap chunks to generated IDs, have tests look up canonical chunks by name within scope. Carries through to the Rust port; not blocking implementation.
- **`inside.md` carries one or two "invocable" references** in its values prose. Left alone — the inside text is held with care; touch only if the user asks.

## Next

Spec phase complete. Implementation phase begins.

1. **Code the db** from [`pilot/db.md`](pilot/db.md). Existing TS suite (63 db tests) as correctness oracle.
2. **Code the engine** from [`pilot/engine.md`](pilot/engine.md). Existing TS suite (66 engine tests) as correctness oracle.
3. **Scaffold host** — tao + wry, window, wry IPC handler dispatching to the engine library.
4. **Draft SDK** — `@night/sdk` + `@night/sdk-react`, two transports (wry IPC for webview, stdio JSON-lines for VM).
5. **First program: read tile** — validates the webview ↔ host ↔ engine ↔ db loop end-to-end.
6. **Remaining first-party programs** — sidebar, tabs, command palette, program runner, claude (the agent).

---

## Notes

**The strange (`~/git/agi/`).** Referenced in [`inside.md`](inside.md) as the intellectual parent. Loose exploration — not a source of truth. Sessions should not reach for the strange to resolve questions; if the answer isn't in `inside.md`, the inside is what needs work.

**Research informing the pilot shape.** [`research/ui-landscape-draft.md`](research/ui-landscape-draft.md) (wide survey of UI paradigms), [`research/ui-stacks.md`](research/ui-stacks.md) (technically adoptable shortlist), and [`research/runtimes-and-surfaces.md`](research/runtimes-and-surfaces.md) (the runtime/surface exploration behind the `runtime: 'webview' | 'vm'` decision and the deferred topologies). Decisions distilled from these live in the pilot specs; the research files stay as reference depth.

**README hook.** The current README is acceptable but the formulation exercise is not fully crystallized. Preserved threads: "projected not generated," "the generative process itself is native to the medium," "the cyclical process of understanding → implementing," "one act of structuring knowledge." Not settled — material waiting for a future session.
