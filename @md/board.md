# Board

The working state, and only that: where we are, what is next, what gates, what debt. Written for a human first — the history lives in [`log.md`](log.md) (session narratives, newest first), the law in [`spec/`](spec/), and everything this file once restated of either is retired to git (turnover 2026-08-23; the retired sections — the landed-event stack, the ruled-list, the naming record — are in history, and their content stands in the log and the specs).

## Where we are

- **The spec tree stands rewritten** — whole, from the ratified surface brief (2026-08-22) — and is under the author's **ratification read**: sdk.md read (it yielded the read-ops unification, 2026-08-23); view.md read down to its component sections, paused there; components.md, desktop.md and the rest ahead. The brief (`spec/research/surface/proposal.md`) retires into git when the read completes.

- **The session of 2026-08-23 pivoted to the knowledge angle** — the README rewritten why-first through author rounds, the blind-variant method tried, the turnover family queued below. The engineering spec angle and the knowledge angle are both live; neither blocks the other.

- **No code moves yet.** Implementation starts with the alignment pass (Debt, below) once ratification closes.

## Next

Numbered for reference, not strict order.

1. **Finish the ratification read** — view.md's component sections, components.md, desktop.md, then the rest of the tree.

2. **The knowledge-angle turnovers** — siblings, no order among them: **the code's ratification read** — the arc's candidate result stands written at [`spec/research/knowledge/code.md`](spec/research/knowledge/code.md) (2026-08-24; proposed, awaiting the author's word) · **conventions.md** (grown steward-driven; its knowledge section is what the code supersedes on ratification; the rest still owed the README treatment) · **this board** (keep it pure state) · **the register pass** over the spec tree (author direction, 2026-08-22: each file re-shaped why-first; the code, once ratified, is its instrument — not this cycle's work). The arc's record lives in [`spec/research/knowledge/opening.md`](spec/research/knowledge/opening.md).

3. **The reconcile remainder** — cheap, for a subagent: the fixture files rewritten from the new law (`db/fixtures/*.json`, `engine/fixtures/boundary.json` — the latter encodes the dead boundary model verbatim); the `conclusions.md` audit-and-close; the agent.md deep-claims sweep.

4. **The alignment pass** — the first build phase: db, engine and SDK realigned spec-first with fixtures from the new law (the debt list below is its worklist; the anchor-row bridge retires with it).

5. **The build order thereafter** is [`spec/pilot.md`](spec/pilot.md)'s: chassis-desktop + view/sdk + component/base → desktop → the pilot components → secrets + agents.

6. **Standing**: review the telemetry/warming code (the author distrusts it).

## Gates — open, the author's word wanted

- **Buffer realization** — engine-native driver registry vs dissolution into live integrations ([`spec/engine.md`](spec/engine.md), *Buffers*). The v0.1 posture (throttled partial commits) holds either way; whether v0.1 streams model responses live rides this call.

- **VM containment** — gates `runtime-vm`'s landing, not the pilot (capabilities are declared and shown, not enforced, until the VM lands). The steward's visual-inspection duty is blocked on the macOS Screen Recording grant.

- The design-level opens live **in place in the specs** — each file's *What Is Open* section. None block the pilot's structure; they need decisions as implementation reaches them.

## Tracked debt

- **Code lags the specs by a full generation** — the built layer (db crate, engine ~6k lines, TS SDK) implements the pre-rewrite law: db still validates `accepts`/`required`/`propagate` with a two-kind placement CHECK and no ownership rules; the engine still carries union-accepts composition, the trace exemption, boundary chunks, `pending/completed` status names, `RunArgs.chunks`, scope-shaped `await`; the SDK mirrors all of it. Each is wrong by spec, green by tests — realigned spec-first in the alignment pass.

- **Bootstrap IDs are hand-picked** — the spec says system-generated; bootstrap and tests use readable strings. Fix: generated IDs everywhere, path-lookup for canonical chunks.

- **Per-program React bundling (~0.6MB)** — superseded in shape by the component/base direction; dissolves in the alignment-era rebuild, kept here until it does.

- Small, carried: SDK `ChunkItem.body` typed as plain object (telemetry bodies are bare numbers) · engine wire does not emit `unresolved` yet · `exclude` does not reach dimensions/edges · `Includes.rank`/`snippet` declared, unbuilt · the old sidebar's and read-tile's flagged gaps fold into the alignment pass.

## Notes

- **`~/git/agi/`** is the intellectual parent — loose exploration, never a source of truth. If an answer is not in the specs, the specs need work; do not reach for it.

- **Research behind the pilot shape**: [`spec/research/ui-stacks.md`](spec/research/ui-stacks.md), [`spec/research/runtimes-and-surfaces.md`](spec/research/runtimes-and-surfaces.md), [`spec/research/cleanroom/`](spec/research/cleanroom/). Decisions live in the specs; research files are reference depth.
