# The Settled Model — whole, current, one file

**Status: §8's redistribution LANDED (2026-08-03 session).** The specs are now the law; this file remains the settlement record and the consolidated opens (§7). Three silences resolved by author word at the fold: run boundaries as typed process-body keys, five kinds in scope reads, status `draft | running | done | failed`. One steward reading marked open in engine.md: the frame as the process's ownership subtree.

`threads-dialog.md` is the *path* — it contains superseded layers and must not be read as current. Everything below is the end state of the 2026-08-01→03 arc. Board carries the queue.

---

## 1. The substrate's type system (law; folds into substrate.md)

- **Body is always a kv object.** One JSON text column, byte-identical to today — no typed-body storage kind exists. Typing is contract + validation, never storage. (Refused on merits: bodies-decomposed-into-placements; SQL-typed storage in all three forms.)
- **The instance spec.** A chunk may carry `instance:` — spoken *"instance spec"* — a typed key-map its instances' bodies must fit. **Never for the chunk itself** — only its type's instance spec binds its body. Towers are natural: B fits A's instance spec while carrying its own for C (`program` → `shell` → shell's runs). A chunk with an instance spec is an archetype by nature.
- **Key types**: `string`, `number`, `time`, format-tagged string (`markdown`), `ref` (optionally archetype-constrained), `list<…>`, `set<…>`, `map`, and per-key modifiers: `?` optional (required by default — no `required` array), `unique`. **Unions are tag-sets** (`loc | expr`): values self-describe via the tagged wire encoding (`$ref`, `$loc`, `$set`, `$time`, `$md`), so a union check is tag-membership then per-tag shape.
- **Enums are the substrate's**: a closed vocabulary is `ref(X)` with X's instances as value chunks (`status`: draft, running, done, failed). No enum machinery; the link index answers "all running" derived.
- **Retired from the spec language**: `accepts` (and the engine's union-accepts machinery with it), `required`, `propagate`, `body.schema`, the umbrella archetypes `programs/argument`/`programs/result`. `ordered`'s home is open (see §9).
- **Five connection kinds, each one meaning** — three stored placement types, two body-derived:
  - `owned-by` — where it lives. `/` paths; names unique within owner; one owner (a tree); a module is an ownership subtree; never crosses mounts.
  - `instance` — what it is. Pure type membership; multi-typing natural. (Sugar candidate `#`, unruled.)
  - `relates` — what it is about. Authored aboutness; prose placed on its subjects stays the oldest pattern.
  - `field` — related-by-key: a typed body ref, link-indexed both ways.
  - `mention` — spoken of in prose (or used by a fenced expression), link-indexed.
- **Reach = ownership + explicit grants.** Instance, relates, field, mention never confer reach.
- **Links (fields + mentions) derive at write**: same transaction, delete-and-reinsert per chunk (the FTS pattern); one derived table (`current_refs`), never in commits, rebuildable; `ScopeResult` gains a separate `linked` result field — never mixed with placements. **Permissions engage both ends**: creating a ref is gated by the writer's reach (no existence-probing); `linked` answers are filtered by the reader's reach. Typed refs make link-*finding* spec-free (tags announce refs); only archetype-constraint checking reads specs, at write. Integrity is write-time only — stale refs are a legal permanent state rendered as dead references, never repaired. Cross-mount ref validation goes through the engine (the seam accepts used) — adopted as the simple thing, author reservation on record. Location mentions target *descriptions* (an expression as normalized text), not chunks; materialization stays the sharing-confers-identity gesture.
- **SDK boundary translation**: native values in hand (`Set`, `Date`, `Ref`, markdown-string), tagged JSON on the wire, plain JSON in the file. Schema-driven TS types later.

## 2. How programs work (folds into engine.md)

**Program body** (its interface *is* its body; role by reference; found from the program, never by global name):

```
{ executable, runtime, capabilities?, timeout_ms?,
  argument: ref → archetype     — one; parameters are keys in its instance spec
  result:   ref → archetype     — one; default named `output`; pure viewers may omit
  demand:   { read: [ref…], write: [ref…] }?   — argument-independent boundary residue
  uses:     [ref…]?             — programs it runs
  presets:  [ref…]?             — shipped collations
}
```

**The run**: the argument is its own chunk — `instance` on its archetype and *nowhere else*; the process body's `argument` ref is the connection (a field; a placement too would be a second home). Process body: `{ argument: ref, at: commit, status: ref(status), result: ref }` — every key statically typed; argument frozen wholesale at dispatch; result filled at completion; results `instance` on their archetype only (writing them is declaration-derived reach). **Validation = one placement check** (is the argument chunk an instance of what the program's `argument` names) at dispatch; result likewise at completion. `awaitRun` returns the process. **Frozen-safety vs rolling-head**: SDK resolves argument refs at the stamped `at` by default; following the living head is the deliberate choice (the reader does). *Held open:* nesting the argument record into the process body (future simplification).

**Lifecycle**: `draft` (argument under composition, substrate-resident, editable iff unconsumed, rests visibly, never auto-swept; the `form` appears on any unconsumed argument; a draft citing prior turns joins the thread) → `run` (child, cascades) or `launch` (detached). Surfaces are viewers, never owners.

## 3. Expressions (folds into engine.md)

```
location:   { of: [my-project, tasks] }              — places, intersected

call:       { program: diff, args: { old: a, new: b } }
            — named args always; param names from the argument archetype's instance spec

expression: one grouped unit — its own named nodes + out
collation:  { members: kv<name, location | expression>, settings, predecessor }
```

Names resolve internal nodes first, then collation siblings (the scoped-name rule, twice). Expressions may reference sibling expressions. **Names vs refs by the grain principle**: interior wiring = names (values: cheap branching, inline prose, no litter); sharing lifts a node to a chunk, wires harden to `ref`. Call values: `literal | ref | name`.

**The written language** — classical calls, rock-solid, no pipes, no positional args:

```ol
diff(
  old: follow(from: [my-project, tasks]),
  new: where(in: [their-project, tasks], status: pending)
)
```

Bareword = reference · `program(…)` = call · `{k: v}` = record literal · `[a, b]` = list literal (a location where expected) · literals. Nest freely; name only what's reused or wanted visible (prose blocks inline everything; collations name standing members). A group's last unnamed line is its `out`. Storage is the flat named graph — nesting is an anonymous node used once, auto-named at parse; text ⇄ WYSIWYG round-trips. Parsing: context-free, recursive descent, trivial. **Plan-form vs run-form**: nodes hold args inline as data; running a node materializes the argument chunk. **Small-UI rule**: never draw the graph in a pill — resting = out-verb + derived yield (`overview · diff · 14`); expanded = the **spine** (longest path, one line, other inflows as ⊕ marks; clicking swaps the spine); the canvas only in the editor.

## 4. The reader (programs.md territory)

- **`reader`** — thin chrome; renders nothing, merges nothing; serves a **`reading`**: the persistent store whose body's `current` (a field) points at the current **`collation`**. Collations are values in a citation DAG (`predecessor` field): editing anywhere branches; nothing deleted; references never go stale; opening anyone's collation is a fresh reading pointing at it — first edit branches; nothing copied (templates/presets dissolved). Agents ship shaped by relating collations.
- **Members** render side by side, selectable; each shown member pairs with a surface — auto by shape, overridable, recorded in settings. **There is always a surface.** *Open:* whether pairing stays settings or earns objecthood ("binding") — settles at the reader build.
- **Default surfaces** (first match): ordered → `sequence` (several ordered args interleave; seq/time, commit-time ties) · shared instance spec → `table` · single chunk → `document` · process → `process-view` · mixed → `sequence` by commit time (**cards dissolved**: narrow wrap = config, grouping = a pipe) · empty → invitation. **History dissolved** (db/commits is a sequence + ladder + chrome). `document`'s dissolution flagged, awaiting the author.
- **Slot chrome**, derived, surface-independent: per-location marks (a location's color-dot on slots containing its elements, from the whole collation) + connection counts; scope-in-place expands connections into a nested sequence in the slot.
- **Folding is a pipe** (`fold(summaries)` — a summary placed on its members *is* the group); **attributes are per-element pipes** (`el → intersect(commits)`: the mutation strip), sequence-only v0.1.
- **`prose`**: CommonMark + `ol:` scheme (supersedes `[[id]]`): `<ol:id>` badge · `[name](ol:id)` link · `![](ol:id)` widget; fenced ```ol blocks are anonymous expressions rendered as widgets; every location/chunk an expression uses files a mention, boundary-governed both ways.

## 5. The thread (session.md territory)

Threads derive — turn B follows A iff B's argument cites A (`follow`, the walk; branching = shared predecessor; merging = multi-citation; git one level up). **No containers**; a conversation is a named location, materialized when named/shared/bound/peopled. The composer is the `form` on a draft; creating a draft is the gesture (*talk about this*). **Face follows context**; reading is free, including is a gesture; deviation marked. `process-view` covers the whole lifecycle (draft → form · running → live frame · done → prompt + answer; result = the process's `result` ref); L0 derived status / L1 streamed thinking / L2 narration survive.

## 6. Namings, current

`reader` · `reading` · `collation` · `location` · `expression` · `member` · `follow` (pipe verbs: `at`, `where`, `fold`, `explode`, `group`) · `form` · `process-view` · `prose` · `sequence`/`table`/`document` · `draft` · `attribute` · slot chrome · instance spec · field · mention · `owned-by`. **Superseded** (never use): lens, focus, trail, eye, position, preset, template, marks, contribution, binding-as-tab, signature, `piped`, accepts, body.schema, programs/argument, programs/result.

## 7. Opens, consolidated

Binding objecthood (pairing vs object) · `ordered`/`seq` home · single-owner until evidence · `#` instance sugar · `demand` final shape · expression normalization (same-location equality) · N-source agent contexts (piped contexts, self-written purifying summaries) · navigation-grade · residual scope-content contract case · `document` dissolution · keys/ref-constraint naming ↔ bootstrap-ID debt · fence tag + syntax edges · pill visuals · argument-nesting (held open) · `attach` residual case.

## 8. The mandate — spec redistribution, then build

**substrate.md** ← §1 as law · **db.md** ← physical only (`owned` in the enum, link table, ownership paths, expression indexes) · **engine.md** ← §2 + §3 whole (accepts machinery retires) · **programs.md** ← **rewritten from scratch**: actual programs only (catalog, contracts, experience — §4 + chrome + citizens/slots + tool programs + result names), mechanics referenced never restated · **sdk.md** ← translation + resolution modes · session/agent/host swept to vocabulary.

Then the build queue as boarded: reader v0 → draft + form → process-view v0 → prose v0 → follow + thread face → attributes → shipped collations. A fresh session starts here: this file, then board.md, then the target spec.

**Known-stale list — SWEPT by the redistribution**: `attach` demoted in engine.md; `[[id]]` replaced by `ol:` throughout; substrate.md rewritten around owned-by/reach; the dispatch-frontier pause lifted on the board.
