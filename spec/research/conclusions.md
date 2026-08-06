# Conclusions — rulings from the worklist sittings

Grows one section per worklist item, compact. The worklist carries the queue; this file carries what was decided.

**Protocol (author-corrected, 2026-08-06):**
- **Dialog runs to its end before anything is written here.** A ruling lands once, whole — no incremental drafting mid-sitting, no edit rounds chasing a conversation still in motion.
- **Spec folds are batched mechanical passes**, run later by a cheap session — never live during the sitting.

## B — vocabulary (ruled 2026-08-06)

- **scope retired wholesale** — word, op, types. Read op = `read`; `ReadResult`/`ReadOpts` (get's opts → `GetOpts`); the vantage word is place/location; identity law reads "IS a place"; event `place_changed`; hook `useRead`; the scoped-name rule → "the closure rule".
- **start** replaces dispatch as the process-creation verb; `run`/`launch` stay as the two ways to start (child/detached); `spawn` stays provider-internal; **no "invocation"** — say turn or process. (Reactivity's event "dispatcher" kept — it dispatches events, not processes; flag if unwanted.)
- **Placement columns**: `scope_id` → `on` (`on_id` in SQL); `type` → `kind` — the type/type_ wire asymmetry dies.
- **The chunk field flattens**: `spec` + nested `instance:` → one flat **`instance`** ("what an instance is to be"); archetype = a chunk with a non-empty `instance`. `ordered` is homeless — steward proposal, unruled: dissolve it, `seq` auto-assigns on every placement; interim carrier a reserved `$ordered` entry.
- **the match** = the start-time argument check (bind → count → no orphans); **gate** is the agent's approval chunk only.

## F1 + F2 — the spec tree (ruled 2026-08-06)

- **session.md dissolves into agent.md** — mechanics and experience of the model programs in one file; the file deletes, cross-references retarget, "palette launch" phrasing dies with the fold.
- **pilot.md slims to its unique content** — v0.1 scope (establishes/defers), build order, mounts format, repo layout; everything else points at the owning spec instead of retelling it.

Both are batch-fold work.

**Fold status**: substrate.md, db.md, engine.md, sdk.md already swept (this sitting, before the batching correction — kept, not reverted). Remaining mechanical sweep, batch later: programs.md, agent.md, session.md, host.md, bootstrap.md, pilot.md, board Namings. Same targets throughout: scope→place/`read`, dispatch→start, invocation→turn/process, `useScope`→`useRead`, "instance spec"→instance contract.
