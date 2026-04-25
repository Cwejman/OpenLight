# Board

Current state and what comes next. Updated as things move.

---

## Recent

**Architecture reset for the UI layer, fully landed in specs and code.**

- **Invocables and views unified as `program`.** A program is a chunk with an executable and an optional `surface` capability declaration. Views are programs with a surface. Tools are programs without.
- **Host is Rust** — native shell built on tao + wry (not Tauri the framework). Owns window, tile geometry, webview lifecycle, IPC routing. Does not write UI — UI is programs.
- **Programs in webviews, each isolated.** First-party UI (sidebar, tabs, command palette, read tile, program runner) are TSX + React programs, one webview each.
- **Engine stays TypeScript subprocess.** Rust migration is a tracked horizon item.
- **UI composition types seeded** — `ui/session` (id `ui-session`), `ui/tab`, `ui/tile`, `ui/overlay`, `ui/recipe`. See [`pilot/host.md`](pilot/host.md).
- **SvelteKit scaffold removed.** `pilot/ui/` deleted.
- **`ol` renamed to `db`.** Substrate library at [`pilot/db/`](pilot/db/).
- **`pilot/project/invocables/` renamed to `pilot/project/programs/`.**
- **`interface.md` folded into `pilot.md` + `pilot/host.md`.** Pilot is mature enough to hold the interface spec inline.
- **Code catch-up done:** archetypes (`program`, `process`), protocol op (`run` over `dispatch`), error code (`RUN_FAILED`), `boundary: 'process'` body convention, `DispatchContext.programId`. All 129 tests pass (63 db + 66 engine).

## Tracked debt

- **Bootstrap IDs are hand-picked.** `substrate.md` says chunk IDs are "globally unique, system-generated." Bootstrap and `seedTestDb()` use human-readable strings (`'agent'`, `'program'`, `'session'`, etc.) as a pragmatic shortcut so tests and seed code can reference well-known anchors. This worked until the new `ui/session` archetype collided with the agent's `session` archetype — resolved for now by giving the ui session id `ui-session` (name stays `session`). The aligned fix: switch all bootstrap chunks to generated IDs, have tests look up canonical chunks by name within scope. Tracked separately; not blocking.
- **Internal type names still use legacy nouns.** `DispatchArgs`, `DispatchResult`, `DispatchContext`, `createDispatch` — these are internal type and function names. Their behavior matches the new spec (process artifact, run verb), but the names predate the rename. Cosmetic; rename when convenient.
- **`inside.md` carries one or two "invocable" references** in its values prose. Left alone — the inside text is held with care; touch only if the user asks.

## Open architectural forks

Held in specs rather than closed prematurely:

- **Containment model** — split (tool-VM only; views on host) vs uniform (everything in VM with DOM streaming to host). Affects host implementation scope. See `pilot.md` and `horizon.md`.
- **Tabs vs zoomable canvas** — current design assumes tabs; zoomable nested canvas is a substantive alternative direction. See `horizon.md`.

## Next

1. Pick a containment model (or spike both briefly). Required before host scaffold.
2. Scaffold `pilot/host/` (Rust, tao + wry) — minimum: window + one webview + stdio bridge to the engine subprocess.
3. Scaffold `pilot/sdk/` — TS SDK with `mount()` and substrate ops.
4. First program: read tile as a TSX program, to validate the host ↔ program ↔ SDK ↔ engine loop.
5. Sidebar, command palette, tab bar, program runner — each a program with a surface.
6. Claude program — the agent.

---

## Notes

**The strange (`~/git/agi/`).** Referenced in `inside.md` as the intellectual parent. Loose exploration — not a source of truth. Sessions should not reach for the strange to resolve questions; if the answer isn't in `inside.md`, the inside is what needs work.

**Research informing the reset.** [`research/ui-landscape-draft.md`](research/ui-landscape-draft.md) (wide survey of UI paradigms) and [`research/ui-stacks.md`](research/ui-stacks.md) (technically adoptable shortlist) hold the breadth that informed the current shape. Kept as reference; decisions distilled from them live in `pilot.md` and `pilot/host.md`.

**README hook.** The current README is acceptable but the formulation exercise is not fully crystallized. Preserved threads: "projected not generated," "the generative process itself is native to the medium," "the cyclical process of understanding → implementing," "one act of structuring knowledge." Not settled — material waiting for a future session.
