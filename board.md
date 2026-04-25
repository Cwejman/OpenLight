# Board

Current state and what comes next. Updated as things move.

---

## Recent

**Architecture reset for the UI layer.** Following extended charting, the pilot direction has shifted:

- **Invocables and views unified as `program`.** A program is a chunk with an executable and an optional `surface` capability declaration. Views are programs with a surface. Tools are programs without.
- **Host is Rust** — native shell built on tao + wry (not Tauri the framework). Owns window, tile geometry, webview lifecycle, IPC routing. Does not write UI — UI is programs.
- **Programs in webviews, each isolated.** First-party UI (sidebar, tabs, command palette, read tile, program runner) are TSX + React programs, one webview each.
- **Engine stays TypeScript subprocess.** Rust migration is a later axis.
- **UI composition types settled** — `ui/session`, `ui/tab`, `ui/tile`, `ui/overlay`, `ui/recipe`. See [`pilot/host.md`](pilot/host.md).
- **SvelteKit scaffold removed.** `pilot/ui/` deleted.
- **`ol` renamed to `db`.** Substrate library at [`pilot/db/`](pilot/db/).
- **`interface.md` folded into `pilot.md` + `pilot/host.md`.** Pilot is mature enough to hold the interface spec inline.

## What survives the reset

All engine and substrate work:

- **`db`** — substrate library + CLI. Done.
- **`bootstrap.ts`** — seed script. Functional with existing archetypes; the terminology catch-up (invocable → program, add ui composition archetypes) is in the pending code pass.
- **Engine** — dispatch, boundaries, containment (VM), invocable protocol (stdio JSON-lines), lifecycle, echo invocable. Done. 66 engine tests + the already-removed 4 UI tests passed before the reset.
- **Agent design** — spec-level work in `pilot/agent.md` carries forward; the claude program is still the final pilot step.

What doesn't survive: the SvelteKit tile/scope/dispatch UI. The substrate concept of `ui/split` / `ui/leaf` / `ui/view-root` / `ui/scope-history` is replaced by the new `ui/session` / `ui/tab` / `ui/tile` / `ui/overlay` / `ui/recipe` type system.

## In progress

**Spec purification pass.**

- ~~`pilot.md`~~ — rewritten
- ~~`pilot/host.md`~~ — written (replaces `pilot/ui.md`, absorbs `interface.md`)
- ~~`README.md`~~ — updated
- ~~`board.md`~~ — updated (this file)
- `horizon.md` — additions pending (uniform-VM+DOM-streaming, zoomable canvas, WebGPU views, Rust engine migration)
- `pilot/engine.md` — terminology pass (invocable → program, containment fork, dispatch-vs-process distinction)
- `pilot/substrate.md` — minor pass (primitives unchanged; terminology)
- `pilot/agent.md` — minor pass (agent is a program)
- `pilot/bootstrap.md` — reflect new archetypes to be seeded

**Code catch-up to specs.** Engine source and `bootstrap.ts` still use the `invocable` archetype name and the old `ui/split`/`leaf`/`view-root`/`scope-history` types. No persistence concerns — the existing `.ol/db` is overwritten on next bootstrap.

## Tracked debt

- **Bootstrap IDs are hand-picked.** Substrate.md says chunk IDs are "globally unique, system-generated." Bootstrap and `seedTestDb()` use human-readable strings (`'agent'`, `'program'`, `'session'`, etc.) as a pragmatic shortcut so tests and seed code can reference well-known anchors. This worked until the new `ui/session` archetype collided with the agent's `session` archetype — resolved for now by giving the ui session id `ui-session` (name stays `session`). The aligned fix: switch all bootstrap chunks to generated IDs, have tests look up canonical chunks by name within scope. Tracked as a separate cleanup; not blocking.

## Open architectural forks

Held in specs rather than closed prematurely:

- **Containment model** — split (tool-VM only; views on host) vs uniform (everything in VM with DOM streaming to host). Affects host implementation scope. See `pilot.md`.
- **Tabs vs zoomable canvas** — current design assumes tabs; zoomable nested canvas is a substantive alternative direction. Deferred to `horizon.md`.

## Next

1. Finish the spec purification pass (engine, substrate, agent, bootstrap spec files; horizon additions).
2. Update `pilot/bootstrap.ts` + engine source for `program` archetype and UI composition types; keep tests passing.
3. Pick a containment model (or spike both briefly).
4. Scaffold `pilot/host/` (Rust, tao + wry) — minimum: window + one webview + stdio bridge to engine subprocess.
5. Scaffold `pilot/sdk/` — TS SDK with `mount()` and substrate ops.
6. First program: read tile as a TSX program, to validate the host↔program↔SDK↔engine loop.

---

## Notes

**The strange (`~/git/agi/`).** Referenced in `inside.md` as the intellectual parent. Loose exploration — not a source of truth. Sessions should not reach for the strange to resolve questions; if the answer isn't in `inside.md`, the inside is what needs work.

**Research informing the reset.** [`research/ui-landscape-draft.md`](research/ui-landscape-draft.md) (wide survey of UI paradigms) and [`research/ui-stacks.md`](research/ui-stacks.md) (technically adoptable shortlist) hold the breadth that informed the current shape. Kept as reference; decisions distilled from them live in `pilot.md` and `pilot/host.md`.

**README hook.** The current README is acceptable but the formulation exercise is not fully crystallized. Preserved threads: "projected not generated," "the generative process itself is native to the medium," "the cyclical process of understanding → implementing," "one act of structuring knowledge." Not settled — material waiting for a future session.
