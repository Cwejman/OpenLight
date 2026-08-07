# Selection — type matching, set arguments, and the language

The settled record of the 2026-08-04/06 dialog, second arc (first arc: [`one-compositor.md`](one-compositor.md)). Status: **author-ruled direction**, written from the point of resolution — the reasoning path is not preserved here; §16 carries a compact do-not-rewalk list. Where this contradicts the staged redistribution (notably the one-chunk kv argument model), **this record supersedes**. §15 is the demand list on the specs. Items marked **⚠** are steward direction not fully resolved with the author — they await a grounded sitting with worked examples before hardening.

---

## 1. The center

Type matching is the compute environment's central operation. The substrate is just a field; the environment exists because program surfaces can be **inferred** for field content — one location, several, or virtual locations (expressions). Everything below serves that: the type ladder makes content matchable, `selection` names the unit of matchable content, set arguments make the match 1:1, the planner makes evaluation fast, purity makes re-evaluation safe.

## 2. The value-type ladder

- `ref` — one chunk, by name or id. There is no `name` type: one name *is* a ref.
- `loc` — a place: an intersection of chunks. **One chunk is itself a place** (law: a chunk with connections IS a scope), so `[c]` is the place *at* c — the chunk itself and what is placed on it; the scope read returns both (identity + membership). A **value kind, not an archetype** — elements are *tagged* locations; nothing is `instance` on "loc". `ref` remains the pointer in bodies; *viewing* always goes through places. Reader default (author direction): typing `engine/program` shows that chunk itself with its instances hierarchically below.
- Typed-content matching (a commit in a slot matching commit-surfaces) needs exactly **one** mechanism, undecided (§16): `loc(X)` (a place whose resolved members are instances of X, dispatch-checked) *or* coercion (a location binding to `ref(X)`/`set<ref(X)>` by snapshot-resolution at bind). Not both.
- `expr` — an **expression**: the grouped unit — named nodes, its own scope, last unnamed line as `out`. A one-liner pipe is the minimal anonymous group; a **call** is one node within it.
- Primitives — `string, number, time, markdown`. Never field content; they live inside chunk bodies (payloads). This is what makes matching uniform (§4).
- Containers — `list<T>` (ordered), `set<T>` (unordered), both taking exact cardinality `<T, n>`. Tuples are unnecessary: `list<ref(commit), 2>` is the ordered pair, `set<ref(commit), 2>` the symmetric one.
- `map` — untyped nesting. **`map<T>`** — named entries of typed values. **Struct literals as types**: `{k: type, …}` in a type position types a nested value inline — no archetype involved (added this sitting; `grades` the first user, §13).

**Values and chunks — no exceptions.** Reserved words type **values, only ever**; a chunk is typed by archetypes alone. *Scalar/container words* type values that can never be chunks — a bare number denotes nothing in the field. *Field-shaped words* (`loc`, `expr`, `selection`) type values that denote content and are therefore **liftable**: a chunk of them exists when a sharing gesture makes one, instance of an archetype, reached thereafter as `ref`. Composing an expression into an argument **is** such a gesture (§4). `ref` is the pointer between the worlds.

**Subtyping is multi-typing — and nothing is transitive.** No archetype-extension relation exists, deliberately. "An image is a file" = the chunk carries *both* instance placements. Matching sees placements only: a chunk instance on `image` alone does **not** match `ref(file)`; it matches iff the `file` placement is actually on it. The convention that makes hierarchies work — authoring/ingest place the whole ancestor chain — is owed, not automatic.

## 3. `selection` — the eleventh type word

```
selection = set<loc | expr>     — purity clause: expressions herein must derive pure (§6)
```

A selection is **what you offer to be viewed or consumed**: places, and derivations of places. To offer one chunk, offer the place at it — `[c]`, one term (which carries both the chunk and its members — §2). A bare `ref` never appears in a selection: refs are pointers living in bodies. An `expr` element takes two forms: **inline** (the anonymous graph — prose fences) or **a reference to an expression chunk**; in arguments and collations it is always the chunk form (§4, §12).

**A program's argument content is 1:1 with a selection — precisely.** A "collation member" is nothing but a selection held by the reader (§12); the word *member* is the reader's, not the type's.

**Reserved word** in the closed type vocabulary (`string, number, time, markdown, ref, loc, expr, list, set, map, selection`) — type position only; a selection *value* is just the set, no constructor. Not the first of a general alias mechanism (aliases deferred). It earns reservation because the purity clause is law a shorthand couldn't carry. **At most one selection entry per contract** (corollary of §4 disjointness — two would share element domains).

**One type, four seats**: a program's content mouth, a slot's invitation, a collation's selections, an agent context.

## 4. Arguments are sets

A program's argument is a **set of typed elements**, matched structurally — not one kv chunk with named keys.

**Why:** less complecting. One match predicate everywhere; no assignment step anywhere in the system (kv always has one: offer → keys); offer = argument = a selection, 1:1. And the **primitives factor, pivotal**: kv splits keys into two species — ref-keys matchable from an offer, primitive keys fillable only by typing — so kv matching is inherently partial. Under sets, primitives always ride inside payloads: "matchable" has exactly one meaning.

### The contract

A program states what it takes as `accepts` — a required body key on every program (`[]` legal: takes nothing, said explicitly). Each entry is **a type, optionally marked optional** — nothing else:

```ol
program summarize { accepts: [ loc, options? ] }          — one place, required; options allowed
program revert    { accepts: [ set<ref(commit)>, loc? ] } — any number of commits; maybe a place
program sequence  { accepts: [ selection ] }              — the content mouth
```

Entry types: `ref(X)` · `ref(X & Y)` ⚠ · `loc` · `expr` · `selection` · a payload archetype · `set<T(,n)?>` · `list<T(,n)?>`.

The rules, plainly:

- **Boundary facts never sit here** — they live in the `read`/`write` keys (§5).
- **How an element matches an entry** — two kinds of check, per the law's own union rule ("tag membership, then per-tag shape"): for value-kind entries (`loc`, `expr`, `selection`) the element must *be that kind of value*; for chunk entries (`ref(X)`, payloads) the element must be *instance on that archetype*.
- `ref(X & Y)` **⚠** — instance on *all* listed archetypes; the trait case (`Auditable`, `PeerReview`): carrying both placements guarantees both spec shapes in the body. Plain `ref(X)` is satisfied by the placement alone, indifferent to whatever else the chunk is.
- **Entries may not compete for the same elements.** Checked at definition, structurally: the same archetype twice is illegal; so is value-kind containment (`[loc, selection]` — a selection's elements include locs). What definition *cannot* forecast is multi-typing (any chunk may carry two placements) — those ties surface at dispatch and reject (the gate).
- **Payload discipline**: same-typed inputs with different roles never appear bare — they ride inside a typed payload chunk whose *keys* are the roles (`diff/pair {old, new}`). Payload archetypes are owned — shared vocabulary by ownership and import, never a global predicate space.
- `set<T>` claims its whole type: an "any number of X" mouth must be the contract's only consumer of X.

### The gate — four steps, no search

1. **Bind** — each element maps to the one entry it satisfies (the two-kind check above). An element satisfying two entries (multi-typing) **rejects as ambiguous** — never guessed. *⚠ candidate if nested conjunction contracts ever appear: most-specific-wins (objective specificity order); incomparable overlaps still reject. Parked until real examples.*
2. **Count** — required entries satisfied exactly; optional at zero-or-one.
3. **No orphans — at dispatch only**: an element the contract doesn't recognize refuses the *run*. A dispatch is a consented exchange; unconsumed offerings would be silent lies.
4. **The draft is free** — anything may sit in a draft's argument, unrecognized elements included; it just cannot dispatch until the gate passes. The gate guards the door, not the desk. The form shows required entries as must-fill, optional folded away.

Names gave kv its optionality; **types-plus-counting** give it to sets, and disjointness keeps counting from becoming search.

### Where `accepts` lives

A **required body key** of `engine/program` — instance specs bind bodies, so only a body key is *requirable* (a program's own spec cannot be demanded by its archetype). Continuous with the old law's placement (`argument: ref` was a body key). The gate is an engine check at dispatch, as the placement check always was.

```ol
chunk engine/program {
  instance: {
    executable?:   string              — absent for runtime: native (§8)
    runtime:       ref(runtime)
    accepts:       list<type>          — required; entries as reified type values:
                                         {$type: {of, opt?, card?}}
    capabilities?: set<string>
    timeout_ms?:   number
    result?:       ref                 — target must carry spec.instance (an archetype
                                         by nature) — engine-checked at program definition
    read?:         set<loc | @accepts> — per key: absent = defers to the run; present =
    write?:        set<loc | @accepts>   exact ceiling; write: {} = the purity gesture.
                                         Members: static locs, or argument references (§5)
    grades?:       map<{ wmin?: number, wmax?: number,      — named size grades (§13);
                         hmin?: number, hmax?: number }>      absent = one implicit,
                                                              unbounded grade
    uses?:         set<ref(program)>
    presets?:      set<ref(collation)>
  }
}
```

The one notation the keys vocabulary grows: the reified **`type` value kind** — accepts entries as data, read identically by the gate, the form, and the tool-schema adapter.

### The record — argument as a field on the process

A chunk can never *be* a set (bodies are one JSON object, always), so "arguments are sets" is a claim about the argument **value**. No argument chunk exists — the argument is a set-valued field on the process body. The draft *is* the process chunk; the form edits `P.body.argument` directly; editable-iff-unconsumed is enforced on the field.

```
process P — engine/process instance, status: draft
  body: {
    status:   draft
    argument: [ {$loc: [my-project, tasks]},
                {$ref: →E},               ← expression chunk, created at composition
                {$ref: →O} ]              ← payload chunk (summarize/options), likewise
    write: […]                            ← read is implicit over argument content (§5)
  }

E — instance on the expression archetype; its body holds the graph as compressed
    structure (identity at the EXPRESSION grain; below E, compression). E's mentions
    file from E, so the graph reads: P →argument→ E →mentions→ its places.
O — instance on summarize/options.
```

**Elements are `$loc | $ref` only.** Expressions and payloads composed into an argument are **chunks, created at composition** — composition into an argument is itself the sharing gesture, so lifting happens there. Two author arguments settled this, recorded because they govern future grain decisions:

- **Deletion symmetry**: drafts already compose real chunks (a document written as an argument); deliberate draft-deletion cascades to solely-related composition chunks — one gesture, covering documents and expressions identically.
- **Graph fidelity**: inline, an expression's mentions would attribute to the *draft*, flattening provenance — "which expressions depend on this place" would be unaskable. As a chunk, the graph is traceable and foldable. For a system whose center is retrieval's inverse, provenance grain is the point.
- **The principle, recorded as ruling**: *the field is fractally infinite; abundance is not a cost; veiling structure for tidiness is itself the hygiene problem.*

DSL-written inline calls entering an argument materialize their chunks at entry — not a convenience feature but **run-form continuity** (law: running a plan materializes and dispatches): text plans — prose fences, palette one-liners, agent-written ol — must be runnable, and materialization-at-entry is how text becomes field. Dispatch validates existing chunks, freezes the record, runs the gate. The program receives refs and locs and hands them to the **`resolve` op** — the planner evaluates (§8); **programs never interpret expressions**. Plan-form (args inline as data) lives where text lives — prose fences and DSL blocks; entering an argument is where it materializes.

## 5. Boundaries

> **Superseded in part by [`dimensions.md`](dimensions.md) (2026-08-07).** Item 1 and the closing granularity sentence are **dead**: ownership confers no transitive reach, the frame is `[self]`, and a root grants one hop of membership, not a subtree. Items 2–5 stand and upgrade — the `read`/`write` keys become selection-grade, set algebra joining locs and argument references. Do not implement the ownership walk described below.

A run's reach is constructed at dispatch, immutable after:

1. ~~**The frame** — implicit, always: the process's own ownership subtree; results ride here~~ **(superseded — the frame is the process's own dimension, `[self]`; children and results are owned by the process, which *is* their membership in it.)** A program always writes its own result; never declared.
2. **Argument content is implicitly read-granted, always** — the offer *is* the grant: someone gestured the content into the argument, and that gesture is the consent read needs.
3. **Program `read`/`write`** — flat keys on the body; per key, absent = defers to the run, present = exact ceiling. Members are static locs and **argument references** — an entry's type name (unique by disjointness) or a payload-key path (`write: {route.from, route.to}`). **Write is never implicit.** At dispatch a reference resolves to the **term chunks** of the bound element (`[a, b]` contributes both; an expression chunk contributes what its mentions name); snapshot into the process record; rendered as the form's chips before Go, narrowable there.
4. **Explicit dispatch additions** — anything else the dispatcher grants.
5. Everything intersected with the **parent's reach** (a cap, not a source).

**Content never carries reach** — structural, not stated: all reach lives in the boundary keys or explicit grants; never an inference from what happened to match. ~~Known granularity: a term-chunk root grants its ownership subtree — the boundary model's standing grain.~~ **(Superseded — a root grants one hop of membership; depth, when wanted, is stated as an expression. [`dimensions.md`](dimensions.md) §5.)**

## 6. Purity — derived, never declared

**Pure = effects confined to the own frame.** A pure program still commits — its result lands in its frame; that is the memoized value.

1. `write: {}` — present and empty: the deliberate purity gesture. One leg covers every channel — static locs and argument references live in the same key.
2. No capabilities (`fs`/`exec`/`net` are world-effects regardless of field writes). This does **not** put the filesystem or network off limits for pure work — external content enters through an integration projecting it into the field; purity is about *this run's* effects, never where data originated.
3. The engine refuses dispatch-time write-root additions to a pure program.
4. Transitive: a pure program's `run` of an impure program is rejected at dispatch.

1–2 at definition; 3–4 at dispatch. Badges derive; a `pure:` flag could only agree or lie.

**Result production vs placement.** Result is what a run *produced* (frame-only, always); commits are what it *mutated*. Placing a result onto locations is a second, visible act — declared in the program body (targets counting into `write`; the program honestly impure — placement-writing derivers are automations, never selection members) or performed by the caller within its own reach.

## 7. Automations, seats, and dead nodes

- A **selection** admits `loc | pure expr` only. Impure chains are **automations**: dispatched processes, viewport-independent; their *results* are field content a selection can include. You seat the output, never the automation.
- **The pin makes an expression terminal.** A final call resolving to a *surface* program seats that surface over the content beneath. A pinned expression yields a view, not data — legal only in seat positions (member, widget, slot), never referenceable from another expression; grammar, not purity bookkeeping. Purity is asked of the content beneath the pin.
- **Dead nodes are legal** (author-ruled): an expression is a composition, not a contract — dormant chains are held alternatives, and an editor must be able to save a broken connection; the editing state *is* the proof. Evaluation is **lazy from `out`** (dead never computes); **normalization prunes to the live graph** (cache identity shared across dead-node variants); **mentions file from the authored whole** (provenance sees dormant citations, correctly). One sentence: *strict at contracts, abundant in compositions* — the gate rejects orphans; expressions keep their dead.
- **Results are substrate-shaped, always** (position, pending the streams sitting): a stream-serving program returns a buffer's identity chunk; stream-ness lives in tap machinery (§14), never in a return type.

**The form dissolves** (ruled — the old form-as-a-special-program is superseded). The form was "a program that knows things" — reading status, deciding modes. It is now nothing but **the draft's argument, seated**: each element rendered by its matched surface at its grade, exactly like any slot. **Editability is boundary-derived**: a surface offers editing iff its seat holds write reach over the target *and* the target is unconsumed — the surface reads its own boundary; the engine enforces regardless, so a lying surface cannot write. One surface, mode by reach: prose *is* the markdown editor when writable and the viewer when not. Composition seats grant write; autopsy seats don't. Deliberate editor surfaces survive only as natural re-pairings — never as the mechanism through which editing happens. What survives of the old form is behavior, relocated into seats: required entries as must-fill, optional folded (§4, gate step 4), boundary chips before Go (§5).

## 8. Expressions — the planner owns the lowering

The expression language is the **only** query surface; no author writes SQL, ever. The engine's planner partitions the verb vocabulary:

- **Read-native** — verbs with a relational lowering: `at`, minus/exclude, limit, `where`-over-keys, and `follow` (transitive closure → recursive CTE). A chain inside this subset compiles to **one** db query — reach filter included, since the boundary walk is itself a recursive closure and lowers into the same statement.
- **Compute** — `fold`, `group`, anything model-touching: real program runs, fed by lowered sub-chains.

Core verbs are ordinary program chunks with **`runtime: native`** and no executable — the engine registers a `native` runtime provider: itself, the planner. Identity + contract; implementation is plan substitution. The **`resolve` op** exposes evaluation to programs (loc or expression-chunk ref in, `ScopeResult` out).

**Caching needs no new machinery**: pipe verbs are pure by law; a pure chain evaluated `at` a commit is deterministic — memoized keyed by `(normalized expression, commit)`; invalidation rides the reactivity dispatcher's touched-set computation; materializing a hot expression is the standing `explode` principle. Cost, named: db.md grows an engine-internal **plan interface** (relational ops + transitive closure) — never program-facing.

## 9. The ol language — the TypeScript-grammar pole

**No custom sugar.** ol expression grammar is valid TypeScript *expression* grammar — highlightable in any `ts` fence, parseable by existing tooling; with generated TS types over the substrate, plans type-check in any editor. Call-vs-instantiation legibility lives in **presentation** (semantic highlighting — the environment renders expressions through its own surfaces), not syntax.

```
bareword                      ref — resolves within its own closure outward to its own
                              root; crossing roots always requires the full path
                              (engine/program). Bare names never silently cross roots.
[a, b]                        intersection location (value position)
{v1, v2}                      set literal (TS shorthand-object grammar; our semantics)
{k: v}                        struct literal — reserved for the parked structural-
                              inference sugar
archetype({k: v, …})          typed instance literal — a name resolving to an archetype
                              constructs; resolving to a program calls
program(e1, e2, …)            call — the parentheses ARE the offered set (varargs)
a | verb(…)                   pipe; groups, named nodes, last unnamed line = out
```

## 10. The chunk definition language

The block form is the **authoring text** for declaring field structure — in specs, in `edit`, anywhere text declares chunks. **The engine never receives sugar**: parsing yields ordinary declarations — chunks, placements, bodies — with type terms as reified values (`{$type: …}`); storage is JSON. This section is the text form of what `commit` takes, not spec decoration.

**No nesting** (ruled — nested sub-chunk declaration is ambiguous): owned chunks declare as sibling blocks **by path**; inside a program's block, bare names resolve within its closure (`options?` in `summarize`'s accepts resolves to `summarize/options` — the standing name-resolution rule, §9).

```ol
chunk workplace {
  instance: { name: string unique, city?: string }
}

program summarize {
  runtime: vm
  accepts: [ loc, options? ]                 — read over argument content: implicit (§5)
  result:  ref(output)
}
chunk summarize/options { instance: { max_words?: number } }
chunk summarize/output  { instance: { text: markdown } }

program diff {
  runtime: webview
  accepts: [ pair ]
}
chunk diff/pair { instance: { old: loc | expr, new: loc | expr } }

program move {
  runtime: vm
  accepts: [ route ]
  write:   { route.from, route.to }          — payload-key paths (§5)
}
chunk move/route { instance: { item: ref, from: loc, to: loc } }

program sequence {
  runtime: webview
  accepts: [ selection ]
}

program compare {
  runtime: webview
  accepts: [ set<ref(commit), 2> ]           — symmetric pair; ordered would be list<…, 2>
}
```

## 11. Calls

```ol
echo(msg({text: "hi"}))
shell(cmd({command: "cargo test", cwd: "engine/"}))
summarize([my-project, tasks])
summarize([my-project, tasks], options({max_words: 200}))
diff(pair({old: turns | at(c1), new: turns}))
compare(c1, c2)
move(route({item: task-7, from: [inbox], to: [done]}))
sequence([a, b], [c], [d, e])
model(prompt({text: "what changed?"}), [session], [db/commits])
ingest(spec-pdf, [my-project, specs])
revert(c4, c9, [my-project])
```

`sequence([a, b], [c], [d, e])` **is** a selection with a pinned surface; dropping the program name leaves a bare selection for matching. Selection, slot offer, and call are the same text — and the reader holds exactly such selections (§12).

## 12. Collation and the reader

The expression archetype, owed and now present (all specs present — author's rule):

```ol
chunk engine/expression {
  instance: { nodes: map, out: string }       — the graph as compressed structure;
}                                               nodes: map<node> when node is specced

chunk reading {
  instance: { current: ref(collation) }
}

chunk collation {                             — a value; edits branch; nothing deleted
  instance: {
    selections:  list<selection>              — ordered, tab-like. THE MAP DISSOLVED
                                                (author-ruled this sitting, below)
    settings:    map                          — collation-wide only
    predecessor: ref(collation)?
  }
}
```

**Why the map dissolved.** Collation expressions are chunks (the composition-materialization ruling reaches them: graph fidelity is the reader's whole point). A chunk cannot reference a sibling by a collation-local kv string — its references are refs. So **expressions drive each other by direct chunk reference**, the kv names lose their one load-bearing function, and members collapse into an ordered `list<selection>`. Display names come from the expression chunks' own optional `name` — field-native, rename-safe. A bare selection → surface matched by shape; an outer surface call in an expression → pinned (the pin is annotation — §7).

A slot seats one selection — one surface over it; the reader is N selections side by side; co-rendered selections differentiate by color in the derived slot chrome.

## 13. Grades — the size dimension of matching

The prose ladder (badge → link → widget) generalized to every surface. Term: **grade** (already the law's own word for the prose ladder).

```ol
program prose {
  grades: {                              — declared in ascending order
    badge:  { wmax: 240, hmax: 32 }      — heading only; larger views via the menu
    editor: { wmin: 320, hmin: 160 }
    split:  { wmin: 640, hmin: 240 }
  }
}
```

- The grade shape is a **struct literal in the type position** — no named chunk, no archetype: `grades?: map<{ wmin?: number, wmax?: number, hmin?: number, hmax?: number }>`. Flat, individually optional bounds (a link may cap height but not width); width and height first; form factors a future note only.
- **Stored data, exactly** (no sugar in transport): `{ "grades": { "badge": {"wmax": 240, "hmax": 32}, … } }` — plain nested JSON on the program chunk; validation checks each value against the literal. **Struct literals as types** (ruled): the key-type vocabulary admits inline `{k: type, …}` shapes for typed nested values — "typing goes as deep as you write it"; anonymous nested maps stay untyped as before. `instance:` means exactly one thing — the contract on chunk *instances*; archetype names appear in key positions only inside `ref(X)`. Which world a value belongs to is the grain rule's call: identity/graph presence needed → chunk (argument expressions, §4); config nobody points at → inline literal (grades).
- `grades` absent → one implicit, unbounded grade.
- **Overlap allowed** — grades are modes of one surface, not partitions.
- **Matching**: the seat affords a box; a surface matches iff at least one grade admits it. **Largest admitting grade wins by default**; the person opts down via the slot's context menu; the choice persists as the selection's setting.
- **The chooseability rule**: *if only the box size decides it, it is internal (container queries, undeclared); if a person can choose it, it is declared* — menus are field chrome by law, chosen grades persist as settings. Expand-into-overlay is the same member re-seated at a larger grade.

## 14. Buffers — streams beside the field

By dependency order: what buffers enable, the semantics any realization must honor, then the realization question — which is open.

### 14.1 What buffers enable

Live flow without commits (a flowing stream must not write history); **inspection-during** — watch an agent think, live, with history staying clean; durable capture across engine stops; digestion of flow into the field at chosen moments; media bytes never entering the db. Motivating cases: the agent's own token stream today; audio/video/transcription and the band's high-cycle batches on the horizon.

### 14.2 The semantics — realization-independent

- **Identity**: a buffer is an ordinary chunk (driver/source kind and retention policy in body), instance on `engine/buffer`.
- **Frames**: timestamped, append-only, **commit-free**; not rebuildable — a third storage class beside the field and derived-rebuildable, living outside the db. **The db needs nothing.**
- **Taps**: boundary-checked subscription on a lightweight channel beside `scope_changed`.
- **Digestion is the commit**: using frames commits a reference `{buffer, from, to}`, pinning the range. Retention is a ring plus pins.
- **Results stay substrate-shaped**: a stream-serving program returns the buffer's identity chunk (§7) — stream-ness is never a return type. A live source surfaces to subscribers in exactly two ways: commit digests (`scope_changed`) or feed a buffer (taps).
- **v0.1 posture**: streaming-is-commits stands (throttled partials) regardless of realization; the buffer is the ship-early precursor.

### 14.3 The realization — open between two

- **(A) Engine-native registry**: `register_buffer_driver(kind, provider)` — the runtime-provider shape; integrations choose storage freely (files, object stores, compression — no lock-in); the host ships the default agent driver — an append-only file family in `.ol/` beside the db, durable across engine stops, outside the VM.
- **(B) Dissolution into live integrations**: no engine machinery — a buffer is a reference chunk; a live-integration daemon projects (never commits while flowing); digestion pins. **The tension that keeps (B) honest**: projection presumes a re-readable source, and some streams have none (the agent's own tokens, a live microphone) — someone must retain frames, or digestion has nothing to pin and taps nothing to replay. Where that retention duty lives is the deciding question.

## 15. Demands on the specs (at ratification)

- **engine.md** — `accepts` as required body key + the four-step gate; the argument as a set-valued field on the process body (argument-chunk residence retired); compose-time materialization (expressions/payloads become chunks at composition) + the expression archetype; the `resolve` op; implicit read over argument content; flattened `read`/`write` with argument references; the deliberate draft-cascade delete; `runtime: native`; the planner partition; buffer semantics per §14.2 (realization open); `engine/program`'s spec per §4; the collation shape moves to `list<selection>` and the scoped-name-to-collation-siblings rule retires with it (§12); the expression archetype (§12).
- **substrate.md** — `selection` in the key-types list with its purity clause; cardinality on `list`/`set`; **`map<T>`** typed maps; **struct literals as types** (`{k: type}` inline in type positions; `instance:` stays instances-only — §13); the reified `type` value kind; the values/chunks classification (§2); subtyping-is-multi-typing convention (nothing transitive; chain-placement owed).
- **db.md** — the engine-internal plan interface (§8). Nothing for buffers.
- **host.md** — ships the default agent buffer driver (§14).
- **programs.md** — **the form contract (§2 there) is superseded** by the seated-set model (§7 here): editability boundary-derived, one surface mode-by-reach; reader §3 takes §12; verbs-at-hand matching restated over selections; grades (§13) — declaration, menu, per-selection setting, prose ladder restated; program docs = a prose chunk `relates` on the program (settled), surfaced by any slot at its grade; tool-schema adapter noted at the agent.
- **sdk.md** — no new tags (`$loc`/`$ref` suffice); the `resolve` op; varargs calls; the purity predicate surfaced for badge derivation.

## 16. Open ledger

**⚠ Steward direction, not author-resolved** (need a grounded sitting with worked examples):
- `ref(X & Y)` conjunctions (§4) and, if nested contracts ever exist, most-specific-wins as tiebreak; incomparable overlaps reject. Greedy-vs-strict parked until real contracts hit the wall — default is strict-reject.

**Open, rides to builds:**
- Collations at large (the author's universal-list riff): possibly one list surface handling any scope (settings for staggered/horizontal/vertical; single chunk → document-like) — with the consequences that the reader can't be pinned as a selection's surface, and pinning inside a selection's expression forces one slot. Aspiring, explicitly not confident; settles at the reader build. With it: per-selection view state (hidden, order), member-of-members, prose data-vs-pin standard. (Collation expressions as chunks and the list-of-selections shape: settled — §12.)
- Expression normalization (owed; load-bearing for cache keys). Dead-node pruning is part of it (§7).
- The parked sugars: structural struct-literal (`{old: …}` bare), primitive promotion (`echo("hi")`), one-field shorthand. Exact-N final form (`set<T,n>` vs tuple types). Bare-name resolution rule in practice. Per-entry docs/annotations home in `accepts`. Tool-schema adapter design. Grade units (logical px?). Buffer-feeding purity; tap event shape; content-hash pinning. `set<selection>` (conceivable, nothing demands it). The `node` struct for `engine/expression` (nodes: map<node>).
- **One typed-content-matching mechanism, decide at build** (§2): `loc(X)` (constrained place, dispatch-checked) *vs* coercion (a location binding to `ref(X)`/`set<ref(X)>` by snapshot-resolution at bind — contents; plain `loc` binds the place — liveness). The commit-in-a-slot case needs exactly one of these; not both.
- **Explorations** (author, beyond-gut, do not build): locked relationships (a lock = never removed from current state; a standing obligation, new constraint kind; buffer pins its special case); buffers dissolving into live integrations (§14).
- Prose fences stay anonymous-until-lifted (arguments are provenance-bearing structure; prose is speech); whether the fractal principle eventually lifts fences too — later.

**Rejected with reasons — do not rewalk:**
- **kv arguments** (a four-lens subagent matrix initially favored kv; flipped by two author rulings — boundaries decoupled from marks, and the payload discipline; the strongest kv arguments were: naming relocates rather than disappears, evolution ambiguity, tool-schema fidelity — each answered in §4).
- The tower placement of `accepts` (instance specs bind bodies only — the archetype could never require it).
- `$expr`/`$inst` as tags; `$call` (payloads are construction, not invocation) — argument elements are `$loc | $ref`.
- `ref` as a selection element (one-term locations cover the single-chunk case).
- `r`/`w` marks in the type grammar (boundary facts have one home: the boundary keys).
- A `name` type; a `pure:` flag; general type aliases; per-grade accepts; an archetype-extension relation; author-facing SQL; nested sub-chunk declaration (ambiguous — declaration by path instead, §10); kv-named collation members (chunk expressions can't use collation-local names — direct refs; §12); instance specs as inline shape vocabulary (`instance:` is for instances; struct literals type inline values — §13); the form as a status-reading program and edit-overlay-on-event as the editability mechanism (editability is boundary-derived — §7).
