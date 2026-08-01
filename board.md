# Board

The working board — current state, the queue, the gates, the debt. Session narratives live in [`log.md`](log.md); exploration records in [`spec/research/`](spec/research/). Updated as things move.

---

## Now

- **Mechanism layer built and green.** db crate, engine (~6k lines, 10/10 protocol ops, federated pre-validation), TS SDK (three transports, shared fixture cases), host swapped from stub onto the real engine, geometry walk, async seam. Specs and code agree as of spec-truth pass two; honest residue marked open in place.
- **Build track paused at the dispatch frontier** (author ruling): a program launch is arguments/grants/forms/landing, and programs.md holds those as round-two bullets, not a drawn contract. Planning runs in author dialog until the contract exists.
- **Thread dialog (third session) landed** — rulings, namings, and the queue below. [`spec/research/threads-dialog.md`](spec/research/threads-dialog.md) is the reasoning record; [`spec/research/threads.md`](spec/research/threads.md) + [`spec/research/threads-lens.md`](spec/research/threads-lens.md) the two convergent precursors.
- **Surfaces standing**: read-tile v0 (viewer only, deliberately not spec-complete), sidebar v0, context-menu overlay program, tiling with real verbs + hide, telemetry + warm-open recycling (~50ms). The telemetry/warming stretch is **unreviewed and distrusted by the author** — review queued (Next 7).

## Namings — pinned for code

`lens` — the arrangement viewer (read-tile's deepening target; rename pending author word) · `process-view` — the process surface: argument · frame · result (author: not "inspector") · `form` — the generated argument editor; one program serving draft and palette · `prose` — markdown-with-slots; `[[mention]]`s render through the ladder · `position` — one union term of a lens scope (an intersection of terms) · `preset` — a committed lens argument; a recipe whose program is a surface · `draft` — pre-dispatch process state; argument editable iff unconsumed · `attribute` — per-element adjunct query + slot · `lineage` — the citation walk (process in, thread out) · `merge` — peer-position interleave (seq/time, commit-time ties) · `fold` — arrangement grain state (element vs its summary; lens-owned) · `contribution` — derived per-position membership · `focus` — the chunk a lens's immutable argument references: the whole view definition (scope expressions + settings); presets are committed focus chunks.

## Next

1. **Author rulings** — see Gates; items below note what they block.
2. **Spec folds** (project law: no test writable from spec → no code): programs.md gains the four contracts — `lens` (positions as union-of-intersections, config keys in schema, attributes, fold, contributions), `process-view` (three regions; result slot = frame ∩ declared result archetype; editability = unconsumed-fact), `form` (generated from schema), `prose` (mention grades link → inline → block) · the **result-type naming pass** (queued since the absorption pass, now load-bearing — `process-view` selects by declared archetype) · agent.md: `draft` state + context argument as expression (intent) and resolution (fact), both recorded at the dispatch snapshot · session.md: the dissolution decision (Gates) · substrate.md/engine.md: grain-principle note, `explode` onto the virtual-scope open.
3. **`lens` v0** — read-tile grown one level: peer positions (union) over the built intersection grammar, merge, contribution indicators, hide/show. Nominal matching suffices. Rename lands here (Gates).
4. **`draft` + `form`** — the dispatch frontier's first unit; `form` appears on any unconsumed argument; the palette generates the same form.
5. **`process-view` v0** (regions composed internally as library use per round seven's distinction — citizen-grade slots when §3.5 lands) · **`prose` v0** (mentions as links first, slot-grade when the ladder can inline).
6. **`lineage` + the thread face** (dissolution adopted — unblocked) · **attribute slots** (commits-beside-elements — the mutation strip arrived at generally) · **presets** (agents relate theirs; "raw browse" ships as one).
7. **Review the telemetry/warming code** (standing; author distrusts it; kept out of the thread dialog deliberately).
8. **Owed jewels**: fiber connector; probe error channel; layout-as-data.
9. **Later**: agent.md research pass (provider APIs, context assembly) · integrations sketch (driver contract) · structural matching mechanics (spec-shape `accepts`) · content-type register (markdown tag on scalars) · well-known key vocabulary (`time`, `name`, `status`) · cross-tile staging grant shape · fold/summary UX · contribution visual grammar.

## Ruled — closing stretch of the thread dialog (author's word given)

- **Indirection adopted** (the lens-state dilemma): a process argument is an immutable *reference* to a chunk holding the whole view definition — scope expressions (the "DSL") *and* view settings. Edits are commits on that chunk; the subscription re-reads; and because the reference is stable, **the program can be restarted whenever** (recycling-friendly) without losing its view. Processes never mutate; data chunks live; records pin commits.
- **The dissolution transmutations adopted** — author: "that is the whole point." Answer-home → draft-summons-form; the conversation container dies; a conversation is a named position, materialized as a chunk only when named/shared/bound/peopled. The session.md ratification read is now a confirmation pass over threads-dialog.md.
- **Drafts are substrate-resident** — author: "there is no in-memory markdown; substrate it is." The draft process holds its draft prose in the field by the laws of the system; persistence is not a policy but a consequence. Nothing auto-sweeps.
- **read-tile → lens rename confirmed** at Next 3.
- **`focus` named** (author): the lens's referenced argument chunk — scope expressions + view settings; a lens points at its focus; a preset is a committed focus chunk.

- **Preset semantics ruled: template** (author) — copy-on-open into a fresh focus chunk; save-back explicit; the preset's own history is just its commits (no logging mechanism — versioning is native).

## Gates — author's word wanted

- **The citation shape** (steward-proposed answer to the author's commit-locking question, wants a nod): *the graph binds identities; records cite versions* — relates/placements stay live, never version-locked; where reproducibility demands a version the pin is data on the referencing record, a **citation** `{chunk, at-commit}` (precedents: dispatch pinning the focus commit; branch-pinned mounts). The copy's link to its source preset is a citation; `[[chunk@commit]]` mentions follow; leans on the deferred `at:` read, no new mechanism.
- Standing from before: session.md confirmation pass (was ratification; dissolution adopted); **VM containment ruling** before the agents project; steward's visual-inspection duty blocked on the macOS Screen Recording grant (restart terminal between sessions).

## Tracked debt

- **Bootstrap IDs are hand-picked.** [`substrate.md`](spec/substrate.md) says chunk IDs are "globally unique, system-generated." Bootstrap and tests use human-readable strings as a pragmatic shortcut. Aligned fix: generated IDs everywhere, name-lookup for canonical chunks — load-bearing since the swap.
- **`rework.md` at root** — moves to `spec/research/cleanroom/synthesis.md` once R1–R12 and the per-program deepening land.
- **Per-program React bundling (~0.6MB)** — exits are shell-injected shared runtime (ruled direction) or projected-grade render-as-data; decide in the citizens/slots era.
- **Engine's anchor-row bridge** still in code; retirement queued by the residency ruling.
- **SDK `ChunkItem.body` typed as object**; telemetry bodies are bare numbers — widen when a lens consumes events.
- Engine wire doesn't emit `unresolved` yet; `useScope` error channel; probe error channel.
- `exclude` doesn't reach dimensions/edges (unruled divergence); `Includes.rank`/`snippet` declared but unbuilt; db.md layout-root path stale.
- Sidebar's eight flagged gaps + read-tile's pinned holes → the next spec-truth pass.
- substrate.md's session example still shows deleted event types (edit at next touch).

---

## Notes

**The strange (`~/git/agi/`).** The intellectual parent — loose exploration, not a source of truth. Don't reach for it to resolve questions; if the answer isn't in the specs, the specs are what need work.

**Research informing the pilot shape.** [`spec/research/ui-landscape-draft.md`](spec/research/ui-landscape-draft.md), [`spec/research/ui-stacks.md`](spec/research/ui-stacks.md), [`spec/research/runtimes-and-surfaces.md`](spec/research/runtimes-and-surfaces.md) (behind the `runtime: 'webview' | 'vm'` decision), and [`spec/research/cleanroom/`](spec/research/cleanroom/) (the blind derivations behind the program layer). Decisions live in the specs; research files are reference depth.
