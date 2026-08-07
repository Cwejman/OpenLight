# Conclusions — rulings from the worklist sittings

What was decided, compact. [`worklist.md`](worklist.md) carries the queue; this file carries the rulings **and the brief the rewrite executes from**. Sections B, F, A, D are closed. E — the agent sitting — is not, and is the only thing standing between this and a finished worklist.

**Protocol (author-corrected, 2026-08-06):**
- **Dialog runs to its end before anything is written here.** A ruling lands once, whole — no incremental drafting mid-sitting, no edit rounds chasing a conversation still in motion.
- **Spec folds are batched mechanical passes**, run later by a cheap session — never live during the sitting. Renaming is not a frontier task ([`conventions.md`](../../conventions.md), *Spend the model where it matters*).

---

## B — vocabulary (ruled 2026-08-06)

- **scope retired wholesale** — word, op, types. Read op = `read`; `ReadResult`/`ReadOpts` (get's opts → `GetOpts`); the vantage word is place/location; identity law reads "IS a place"; event `place_changed`; hook `useRead`; the scoped-name rule → "the closure rule".
- **start** replaces dispatch as the process-creation verb; `run`/`launch` stay as the two ways to start (child/detached); `spawn` stays provider-internal; **no "invocation"** — say turn or process. (Reactivity's event "dispatcher" kept — it dispatches events, not processes.)
- **Placement columns**: `scope_id` → `on` (`on_id` in SQL); `type` → `kind` — the type/type_ wire asymmetry dies.
- **The chunk field flattens**: `spec` + nested `instance:` → one flat **`instance`** ("what an instance is to be"); archetype = a chunk with a non-empty `instance`.
- **the match** = the start-time argument check (bind → count → no orphans); **gate** is the agent's approval chunk only.

## F1 + F2 — the spec tree (ruled 2026-08-06)

- **session.md dissolves into agent.md** — mechanics and experience of the model programs in one file; the file deletes, cross-references retarget, "palette launch" phrasing dies with the fold.
- **pilot.md slims to its unique content** — v0.1 scope (establishes/defers), build order, mounts format, repo layout; everything else points at the owning spec instead of retelling it.

## A — absorption (ruled 2026-08-06/07)

**Three records are absorbed, not two.** [`selection.md`](selection.md) §15 and [`one-compositor.md`](one-compositor.md) as originally scoped, plus **[`dimensions.md`](dimensions.md)** — which arrived mid-worklist and is the heaviest of the three, because it *rewrites* substrate.md's reach law rather than adding to it. Its §9 is its own demand list and is authoritative; the temporal ruling (§4) and the beyond-reach rendering rule (§8) were taken this sitting and are already in the file.

- **`seq` settled.** `seq: true` is a flat top-level chunk field, legal **only on archetypes** (chunks carrying an instance contract). It makes the archetype's instances ordered places: chunks placed there carry `seq`, **auto-assigned `max+1` when omitted**; an explicitly passed seq is honored and validated. No sigil, no wrapper, no propagate. The interim `$ordered` entry in the stored `instance` column deletes. `ordered` retires as a word. substrate.md §141's "instance placements carry seq" is drift from the two-kind world — fix it.
- **host.md slims to Rust authority** — window, OS input, VM and capabilities, keychain, engine, `ol://` serving, transport, boot. Arrangement and the visual layer (*Composition Types*, *View modes*, *Tile Geometry*, *Overlays*, *Visual Language*, *Sidebar*, *Command Palette*) move to programs.md, joining the sidebar and palette already there. Same cut as F2's.
- **All three records land translated.** They are written in the retired vocabulary; absorbing them verbatim re-imports it. Translate as they land: scope→place, dispatch→start, `ScopeResult`→`ReadResult`, and selection.md's four-step **"gate"→"the match"**.
- **A drift not to preserve**: engine.md derives grants from `grants: read|write`-marked ref keys in the argument archetype's instance contract. selection.md §4–5 retired that — arguments are sets; boundary facts live only in the program's flat `read`/`write` keys with argument references. dimensions.md then upgrades those keys to selection-grade. Do not carry the marked-key mechanism forward.
- A3's block notation replaces ad-hoc shape sketches everywhere, with its three riders: the substrate example's fake `instances:` field; "renaming is trivial" gains the uniqueness caveat; consolidation softens from rule to discipline.

## D — substrate shorts (ruled 2026-08-06/07)

- **D1 — no deny.** A chunk cannot restrict access below itself under a grant that covers it. Revisit when a real case demands it.
- **D1b — the boundary model.** Opening D1 surfaced that the permission layer was underspecified, not merely missing a feature. [`boundaries.md`](boundaries.md) is the position paper that located the wound; **[`dimensions.md`](dimensions.md) is the resolution and supersedes it on position**. boundaries.md is retained for its assembly of the prior law and its gap analysis.
- **D2 — a dimension needs a name.** Names stay optional in general; a chunk that functions as a dimension must be addressable. Steward's proposed trigger, to confirm or replace at absorption: **a chunk that has members must have a name**, validated at write beside name-uniqueness. Nameless chunks are leaves. Revisit if a nameless dimension is ever wanted.
- **D5 — the location-mentions paragraph** is incomprehensible as written. Not a ruling — a drafting task riding the batch: rewrite it plainly in the selection vocabulary (a mention targeting a `loc` — a place-description whose resolution shifts over time). Author reads after.
- **D6 — instance contracts stay open.** Undeclared body keys remain legal; a contract may not declare itself closed. Multi-typing is the reason: a chunk instance on a closed A and an open B would need "closed over the union of every archetype's declared keys" — a new composition rule for a small win. The win it wants (catching `citty` for `city`) is paid for instead by the type-mirror sketch generating TS types over the substrate, in the editor, before any write. **Record as a note in substrate.md's opens; do not build.**

---

## The batch — what the rewrite executes

One pass, in this order. Ordering matters only at the head: the tree moves before the folds write, so nothing is written twice.

1. **F1 + F2** — dissolve session.md into agent.md; slim pilot.md to v0.1 scope, build order, mounts format, repo layout.
2. **The B sweep** on what the 2026-08-06 pass did not reach: programs.md, agent.md, host.md, bootstrap.md, pilot.md, and board.md's Namings. (substrate.md, db.md, engine.md, sdk.md were swept in commit `2da76bf`.)
3. **A — the absorption**, per-file:
   - **substrate.md** — the reach law rewritten on dimensions.md §1–5 (reach = boundary selections; ownership = naming and containment, one-hop membership, no transitive walk; the placement governance rules; counts describe what the boundary admits; chunk birth). Plus selection.md §15's substrate demands: `selection` in the key-types list with its purity clause, cardinality on `list`/`set`, `map<T>`, struct literals as types, the reified `type` value kind, the values/chunks classification, subtyping-is-multi-typing. Plus `seq: true`, D2's naming rule, D6 as a note.
   - **engine.md** — Boundaries rebuilt on selection grammar (single-request class exactly); frame as `[self]`; `accepts` as required body key + the four-step match; argument as a set-valued field on the process body; compose-time materialization and the expression archetype; the `resolve` op; implicit read over argument content; flattened `read`/`write` with argument references, upgraded to selection-grade; `runtime: native` and the planner partition; buffer semantics (§14.2, realization open); the collation shape as `list<selection>`.
   - **programs.md** — §1's host-native frame claim dies (one-compositor); the shell arrives as a view program with the arrangement layer from host.md; §2's `form` contract is superseded by the seated-set model (editability boundary-derived, one surface mode-by-reach); reader §3 takes selection.md §12; grades (§13); **the beyond-reach face at every grade of the prose ladder** (dimensions.md §8), beside the dead-root and reference-error faces.
   - **host.md** — slims to Rust authority; ships the default agent buffer driver.
   - **db.md** — the engine-internal plan interface; boundary evaluation rides it; membership filtering joins the read path; `$ordered` deletes; **and the three budgets from dimensions.md §9** (the commit-touched projection admissible in boundary evaluation; memo keys become `(expression, boundary, commit)`; the invalidation index from dimensions-named-in-boundaries to the boundaries naming them).
   - **sdk.md** — the `resolve` op; varargs calls; the purity predicate surfaced for badge derivation; no new tags (`$loc`/`$ref` suffice).
4. **D5's rewrite** and the A3 riders, wherever they land.

**Precedence, where the records disagree**: on boundaries, reach, and the frame, **dimensions.md wins over selection.md, which wins over anything in the specs**. Everywhere else selection.md stands as written. one-compositor.md governs surface technology and arrangement alone and collides with neither. boundaries.md is diagnosis only — never a source. The two conflicting passages are struck in place in selection.md §5; if a third is found, it is a question for the author, not a judgement call.

**Do not resolve open questions while executing.** Both source records carry live ledgers — selection.md §16 and dimensions.md §8 — and those stay open. Anything the brief does not cover is a question for the author, not a decision for the executor.

## Not ruled

- **E — the agent sitting** (E1–E7). The author is sceptical of the agent plan as it stands and instructed that the steward re-derive it whole as a position paper *before* any dialog: what a turn, the cycle, and the answer *are* under current law — context as selection, set arguments, buffers for the token stream, resolve/planner, purity. E2–E8 resolve with it. This is a sitting, not a fold, and it is the last item on the worklist.
- **Subscription invalidation over transitive boundaries** — a `follow`-shaped boundary names one dimension but its membership depends on chunks it never names, so the invalidation index under-covers it. Build-time question; three candidate answers in the review record (index the closure, exclude transitive boundaries from subscription-backed reach, or scan for that class).
- The standing ledgers: [`selection.md`](selection.md) §16, [`dimensions.md`](dimensions.md) §8.
