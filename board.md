# Board

The working board — current state, the queue, the gates, the debt. Session narratives live in [`log.md`](log.md); exploration records in [`spec/research/`](spec/research/). Updated as things move.

---

## Now

- **THE BATCH LANDED (2026-08-07/08).** The worklist's absorption pass executed across the tree: the law is now the specs again, with nothing standing superseded-on-paper. `session.md` dissolved into `agent.md`; `pilot.md` slimmed to what is v0.1's own; the vocabulary ruling swept every file; **substrate.md rewritten on the dimension law** (reach = boundary selections, ownership demoted to naming and one-hop membership, uniform filtering, counts describe what your boundary admits); **engine.md rebuilt** on it (boundary as a selection expression, the frame as `[self]`, `accepts` and the match, the argument a set-valued field, `resolve`, the planner partition, buffers, containment); **host.md slimmed to Rust authority** with the arrangement layer moved into **programs.md**, which took the seated argument, the reader's `list<selection>`, grades and the beyond-reach face; **db.md** made it physical (boundary evaluation in the read path, `seq`'s schema and its auto-assign join, the plan interface, the three budgets); **sdk.md** put it on the wire (selections, the `$type` tag, uniform counts). Session narrative in [`log.md`](log.md).
- **Two files deliberately left partial** — `bootstrap.md` (settled seeds updated; the surface and agent seeds stripped to markers, because the tile-tree containment kind is open and the agent model awaits E) and `agent.md` (mechanical fixes only, marked as awaiting E). Their stale claims are named in place, not left to be discovered.
- **The rewrite is unread by the author.** It was executed on trust, in one sitting, by subagents working from [`spec/research/arc/conclusions.md`](spec/research/arc/conclusions.md). Every pass ran a claim audit; four losses were caught and restored, and several defects in the law were found by the passes forced to *use* it. A ratification read is owed.
- **E is the only worklist item left** — the agent sitting, steward position paper first. [`spec/research/arc/worklist.md`](spec/research/arc/worklist.md).
- **Specs lead; code follows.** The mechanism layer (db crate, engine ~6k lines, TS SDK, host on the real engine) is green against a spec generation that is now two rewrites old. The alignment pass is the next build phase; divergence pinned under Tracked debt.
- **Surfaces standing**: read-tile v0 (viewer only), sidebar v0, context-menu overlay program, tiling with real verbs + hide, telemetry + warm-open recycling (~50ms). The telemetry/warming stretch is **unreviewed and distrusted by the author** — review still queued.

## Namings — pinned for code

`reader` — the viewer program: renders nothing, merges nothing; serves a reading, hosts its collation's selections side by side · `reading` — the persistent store the program serves; its body's `current` ref moves to the collation in view · `collation` — one immutable value: an ordered `list<selection>` plus settings and a predecessor (branching free; a value) · `selection` — the type word: `set<loc | ref | expr>`; a collation member is a chunk, a place, or a pure derivation · `location` — one place: an intersection of place terms · `follow` — the closure walk, pipe verb beside `at`/`where`/`explode`/`fold`; "lineage" the prose noun; **its parameterization is open** · `sequence`/`table`/`document` — the ground surfaces · `process-view` — the process surface: argument · frame · result · `prose` — markdown-with-slots; mentions render through the ladder · `seat` — what mounts and what confers chrome and priority; a tile tree, a collation and a slot are the same kind at three altitudes · `grade` — the size dimension of matching · `lift` — giving a value identity (renamed from `select`, which collided) · `draft` — pre-start process state; argument editable iff unconsumed · `the match` — the start-time argument check · `gate` — the agent's approval chunk, and nothing else. Superseded en route: lens, focus, trail, eye, position, preset, template, marks, contribution, tab-language, binding-as-tab, signature, piped, scope, dispatch, invocation, demand, ordered, `form` (dissolved into the seated argument), `member` and `binding` (collations hold selections), `select`.

## Next

1. **The author's ratification read** of the rewritten tree — substrate.md and engine.md first, since everything else was written against them.
2. **Author rulings owed** — see Gates. Several came out of the batch and are listed there.
3. **E — the agent sitting** ([`spec/research/arc/worklist.md`](spec/research/arc/worklist.md)): steward position paper re-deriving the agent model before dialog. It unblocks `agent.md` and bootstrap's agent seeds.
4. **The reconcile remainder** — cheap and queued: `pilot.md`'s two stale lines (host.md's description, `form` in the program list), the vocabulary rider on `horizon.md` and `sketches.md`, and the fixture files (`db/fixtures/*.json`, `engine/fixtures/boundary.json` — the last encodes the dead boundary model verbatim).
5. **`reader` v0** — the collation over the built intersection grammar, selections side by side, slot chrome, hide/show. Rename lands here.
6. **The seated argument** — the draft frontier's first unit; editability boundary-derived.
7. **`process-view` v0** · **`prose` v0** (mentions as links first, slot-grade when the ladder can inline).
8. **Review the telemetry/warming code** (standing; author distrusts it).
9. **Later**: integrations sketch (driver contract) · content-type register · well-known key vocabulary · fold/summary UX.

## Ruled — closing stretch of the thread dialog (author's word given)

- **Indirection adopted** (the viewer-state dilemma): a process argument is an immutable *reference* to a chunk holding the whole view definition — scope expressions (the "DSL") *and* view settings. Edits are commits on that chunk; the subscription re-reads; and because the reference is stable, **the program can be restarted whenever** (recycling-friendly) without losing its view. Processes never mutate; data chunks live; records pin commits.
- **The dissolution transmutations adopted** — author: "that is the whole point." Answer-home → draft-summons-form; the conversation container dies; a conversation is a named location, materialized as a chunk only when named/shared/bound/peopled. The session.md ratification read is now a confirmation pass over threads-dialog.md.
- **Drafts are substrate-resident** — author: "there is no in-memory markdown; substrate it is." The draft process holds its draft prose in the field by the laws of the system; persistence is not a policy but a consequence. Nothing auto-sweeps.
- **read-tile → reader rename confirmed** at Next 3.
- **The naming family settled** (three-subagent exploration → textual-criticism register → author folk-simplification): reader · reading · collation · location · binding · follow (template and marks later dissolved — collations-as-values and slot chrome). Rejections that shaped it: braid (complecting — not the phenomenon), film register (spoken, not professional), loci/stemma/exemplar/sigla (right meaning, not folk).
- **Template/preset dissolved** (author): collations are values, so opening any collation — including one a program relates as its shipped view — is a fresh reading pointing at it; the first edit branches. Nothing is copied; no mechanism exists.

- **Stale-display default** (author direction): a changed-or-removed argument chunk still renders as-it-was in the process-view, marked stale — derived from then-commit vs head, cannot lie; generalizes unresolved-roots from *gone* to *changed*. Folds into the process-view contract. Narrowed: applies to the *content* a collation views, never the collation itself.
- **Collations form a citation DAG** (author, superseding the earlier sequence-of-focuses direction): each collation cites the one it was edited from; editing from anywhere branches; no pointer, no stored sequence, no deleted futures. **Collations are values** — identity captures version; references never go stale; nothing needs commit-pinning. The reading's `current` is a typed body field — the relates workaround retired with typed bodies (superseded note; settled.md §4). Open: how the predecessor citation is carried (relates is untyped — connection-chunk candidate vs typed-JSON ref); what is navigation-grade.
- **`at` is a pure pipe verb** (author): `scope | at(commit)` — time travel as DSL composition; vocabulary, no longer load-bearing for reader history or process records.

## Gates — author's word wanted

- **Typed bodies — CLOSED in dialog; folds LANDED** (the author read, corrected, and settled it live; settled.md §1 now redistributed into the specs) (`spec/research/typed-bodies.md`, written whole from the dialog; the agent exploration archived in typed-json.md): six designs D0–D5; author's "typing ≠ decomposition" confirmed (the axis is where truth lives); full decomposition (D2) charted as retired by the substrate's own rulings; **the predecessor citation resolvable today** as an asymmetric connection chunk (instance-on-citing, relates-on-cited — zero new mechanism); `attach` demoted if schema-level ref typing (D1) lands; **one `keys` spec-field ruling could close three queued opens at once** (typed refs + content-type register + well-known keys); containment preserved under D1 (declarations live in the owning type's spec) but ref-constraint naming couples to the bootstrap-ID debt. Deciding question ANSWERED in dialog (author): target-side discovery is load-bearing from the start — prose mentions are the consumer ("all the mentions are placements"); knowledge modeling is in (ownership fences ontology creep, not domain); the model is write-in-body, graph-grows-the-shadow (projection = standing `explode`), with three pinned obligations: derived-marked/no-reach, commit-time, hand-placed relates survives. See threads-dialog.md.

- **The citation shape — held open, author not ready to trust** ("all feels fresh and unsettled"): commit-pinned references as data on records (`{chunk, at-commit}`). Do not lean on it; stale-display absorbs its display purpose and collations-as-values removes its reference purpose. Revisit only if a real case demands a version-bound reference to a *mutable* chunk.
- **Agent contexts as selections — unexplored** (author flag): a turn's context may cite several turns or a piped expression (`follow | fold(…)`, incl. summaries the agent writes to purify its own context); what the thread face does with N-source contexts is open.
**Raised by the batch (2026-08-07/08), all marked in place; full statements in [`conclusions.md`](spec/research/arc/conclusions.md) under *Not ruled*:**

- **The existence oracle** — `BOUNDARY_VIOLATION` rather than a silent empty read discloses whether something exists outside your boundary. Physically unavoidable as db.md draws it: the extra `admits` call *is* the oracle. Either the error narrows, or the leak is the price of legible failure.
- **`follow`'s parameterization** — unspecified, and four things now depend on it (boundary depth, the frame's call-tree walk, thread lineage, the shell's write reach over the tile tree). db.md drew the closure primitive general enough to receive any answer.
- **The citizen return path** — engine.md routes script responses through the shell document "to the addressed slot", while Containment says a parent may gate but never read, drop or forge. Requests are closed; the return path is not. It matters because commits attribute to process identity.
- **`links_modified` is not projectable** — links are outside history by law, so no commit can answer "which commits changed who points at me." Either the delta list drops it, or links gain a history they were denied.
- **The free archetype hop has no mechanism** — law-grade in substrate.md, absent from engine.md's five boundary sources, so it never enters a plan.
- **Governance at `commit` — engine or db?** engine.md claims it; physically it runs inside the write transaction where the boundary evaluator lives. One word needs changing in one of the two.
- **The tile-tree containment kind** (`instance` vs `owned`) — blocks bootstrap's surface seeds. And **what owns the first session**, which must outlive its creating process.
- **Temporal queries** — pilot.md defers them; programs.md's `history` carries *open at commit*. One is stale.
- **Streaming is not deferred but undecided**, gated on the buffer realization (selection.md §14.3).
- Smaller: `read_batch` has no wire for per-sub-query identity; type terms have two encodings.

- Standing from before: **VM containment ruling** before the agents project; steward's visual-inspection duty blocked on the macOS Screen Recording grant (restart terminal between sessions).

## Tracked debt

- **Code lags the redistributed specs (the alignment pass, next build phase).** The built layer implements the previous spec generation: db validates `accepts`/`required`/`propagate` and has a two-kind placement CHECK, no `current_refs`, no ownership rules; engine carries union-accepts composition, the R7 trace exemption, boundary chunks + relates walks, instance-chain reachability, `pending/completed` status names, `RunArgs.chunks`, `results_only`, scope-shaped `await`; SDK types mirror all of it. Each is now wrong by spec, correct by tests — realign spec-first with fixtures rewritten from the new law. The anchor-row bridge retirement folds into the same pass.
- **Bootstrap IDs are hand-picked.** [`substrate.md`](spec/substrate.md) says chunk IDs are "globally unique, system-generated." Bootstrap and tests use human-readable strings as a pragmatic shortcut. Aligned fix: generated IDs everywhere, path-lookup for canonical chunks (ownership makes this natural — db.md) — load-bearing since the swap.
- **`rework.md` at root** — moves to `spec/research/cleanroom/synthesis.md` once R1–R12 and the per-program deepening land.
- **Per-program React bundling (~0.6MB)** — exits are shell-injected shared runtime (ruled direction) or projected-grade render-as-data; decide in the citizens/slots era.
- **SDK `ChunkItem.body` typed as object**; telemetry bodies are bare numbers — widen when a surface consumes events.
- Engine wire doesn't emit `unresolved` yet; `useScope` error channel; probe error channel.
- `exclude` doesn't reach dimensions/edges (unruled divergence); `Includes.rank`/`snippet` declared but unbuilt.
- Sidebar's eight flagged gaps + read-tile's pinned holes → the alignment pass.

---

## Notes

**The strange (`~/git/agi/`).** The intellectual parent — loose exploration, not a source of truth. Don't reach for it to resolve questions; if the answer isn't in the specs, the specs are what need work.

**Research informing the pilot shape.** `spec/research/ui-landscape-draft.md`, [`spec/research/ui-stacks.md`](spec/research/ui-stacks.md), [`spec/research/runtimes-and-surfaces.md`](spec/research/runtimes-and-surfaces.md) (behind the `runtime: 'webview' | 'vm'` decision), and [`spec/research/cleanroom/`](spec/research/cleanroom/) (the blind derivations behind the program layer). Decisions live in the specs; research files are reference depth.
