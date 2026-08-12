# Menu scenes — concrete cases for the context-menu mechanism

Working map, 2026-08-12. **Nothing ruled.** Companion to composition-scenes.md; each scene: what is clicked, what the menu shows, where each entry comes from, what the pick does. The mechanism under test: seats catch the gesture (secondary click = menu, ordinary click = the surface's) · summoning is an intent to the anchor-holder (the shell) · the menu assembles from **field reads only** — the registry match, declared `actions`, derived seat choices · the menu executes the pick under its grant; excess drafts.

---

## M1 — A task chunk in a sequence (the plain case)

Right-click a task row inside a reader. The innermost seat's offer: `{task-7}`.

| Entry | Comes from |
|---|---|
| *Talk about this* | registry match — `agent` accepts a selection; pick = draft citing task-7, seated at point |
| *Summarize* | registry match — `summarize` accepts `[loc, options?]` |
| *Open beside* | built-in (arrangement intent to the shell) |
| *Hide* · *Include in context* · *Read in place* | the **reader's** declared `actions` — each a small program writing the reading or a draft |
| *Render as… / grade…* | derived seat choices (collation settings + grades) |
| *Copy* | built-in (clipboard is an ordered place) |

Pick *Summarize* → the shell runs it with `{task-7}` under the menu's grant. Nothing here was manually authored for this menu; only the reader's three scoped verbs are declarations at all.

## M2 — Empty space

Right-click tile chrome or canvas: resolves to the **nearest enclosing seat**. On a tile: arrangement intents (*split*, *close*, *wrap*, *re-seat this content*). On the canvas: session-level (*new tab*, *spawn recipe*). All intents to the shell/arranger — no registry match needed; the offer is the tile/session chunk itself.

## M3 — A running agent turn (steering)

Right-click the turn's card. Offer: `{P}` — the process chunk.

- *Pause + prompt* · *adjust* · *abort completion* — control-writing verbs. **Question the scene exposes**: are these globally matched (a `pause` program accepting `ref(engine/process)` — appears on *every* process, honored only by cycle-driven ones) or `agent`-declared `actions` (scoped to turns)? *Lean: scoped — a verb that most targets ignore is noise.*
- *Inspect* (process-view via match), *cancel* (engine authority via the shell), *review changes*.

## M4 — A mention badge inside prose (nested seats)

Prose renders `<ol:id>` as a badge — a seat at badge grade, *inside* the prose surface's seat. Right-click the badge: **the innermost seat wins**; the offer is the mentioned chunk, not the prose. The prose surface contributes nothing (it declared no `actions`); the menu is the mentioned thing's menu. Click beside the badge (plain text): that's cursor territory — ordinary input, no menu.

## M5 — Two commits selected (the match's power)

In `history`, select two commits, right-click. Offer: `{c1, c2}`. The match binds set-entries: `compare` (`accepts: [set<ref(commit), 2>]`) appears — **only** because two commits are in hand; one commit or three would not match it. *Revert* (`set<ref(commit)>`) appears for any number. Multi-select menus need no mechanism: the offer is a selection, and the match already counts.

## M6 — A pick that exceeds the grant

*Revert* picked, but the target places lie beyond the menu's granted write. The run lands as a **draft**, resting, badged in the sidebar — run-to-draft, no menu-specific failure path. Approve = start with the approver's reach; deny = cancel.

## M7 — A terminal one-shot (no live surface)

A finished `shell` run rests flat in its tile. Right-click: offer = the terminal process; entries — *re-run* (pre-filled from the frame), *new from this*, *review changes*, *inspect* — all from match + built-ins. **Nothing needed a running program to answer**: the declarations live in the field. This is the scene that justifies actions-as-data over registration-by-hook.

## M8 — The summoning chain, wire-level (one worked walk)

1. Secondary click lands in a seat (SDK machinery, inside whatever surface realm) → the seat packages `(offer, anchor-seat)` and sends the **menu intent** up to the shell. Surfaces never see the gesture.
2. The shell assembles entries — registry match against the offer · the seated surface's declared `actions` · the embedding reader's `actions` · derived seat choices · built-ins — all field reads, plus its own arrangement intents.
3. The shell commits the entry list as a payload chunk, runs the `menu` program with it (`launch`), creates `O: host/overlay { anchor: →seat-chunk, content: →menu-process }` owned by the session.
4. The base page (host code) sees O arrive in `[session]`, mounts the menu's seat at the anchor's measured rect.
5. Pick → the menu executes that entry's act under its grant (M6 if it exceeds), exits; the shell removes O.

Auditable end to end: the offer, the entry list, the pick, and the act are all chunks or process records.

## M9 — Scoping shown by absence

The same task chunk from M1, rendered in a *process-view's* argument region instead of a reader: *Hide / include / read-in-place* are **absent** — no reader in the embedding chain declared them. Same chunk, different context, different menu, zero configuration: scope is just whose declarations are present in the chain.

---

## Found by charting

1. **The steering-verbs scope question (M3)** is the only real design choice the scenes surfaced: global-match-with-noise vs declared-and-scoped. Everything else fell out of existing mechanism.
2. **Multi-select is free (M5)** — the offer is a selection and the match counts; nobody builds multi-select menus.
3. **M7 is the argument for actions-as-data**: resting entities have full menus because nothing needs to be running to answer.
4. **Two kinds of entries exist**: *verbs* (programs, matched or declared — run something) and *intents* (arrangement/seat choices — ask the shell). The menu treats them alike; the record differs (a process vs a shell act). Worth one sentence of spec so the difference doesn't blur.

## Refined in the dialog that followed (2026-08-12) — the map's rulings

- **Entry grain = payload archetype**, not program: one arranger, many verbs; `hide` is a payload of a curate program, labeled by its archetype.
- **`actions` reads from two scopes**: the render chain (view verbs) and the offer's types (thing verbs — resolves M3: steering declared on `agent`, appears wherever a turn is clicked).
- **One command program, two dispatch-chosen grades** (menu / palette forms); shortcuts = stored calls, fired by host-caught (global) or seat-caught (local) keys; name open.
- **Overlay grades are chosen at dispatch** (no prior box exists); base page realizes bounds clamped to viewport; O = `{anchor, content, grade?}`, fields only.
- **Starting and landing are two acts**: `arranger/open {content, position}`; position values are chunks; the run button is those calls pinned as a surface-authored split button — the context-menu / value-select line drawn (§2, §5 of programs.md).
- **Anchor inheritance**: follow-ups open at the summoning overlay's anchor.

## Open, named

- State-dependent enablement (*expand* on the expanded) — pilot: entries static; future: a predicate expression per entry.
- The command program's one name; `curate` / `steer` as working names for the verb homes.
- Append-only across contribution scopes is convention, not enforcement, in v0.1.
