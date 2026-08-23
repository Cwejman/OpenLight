# Engine

The engine is the authority on running programs against the substrate. A program is a chunk with an executable; to run one is to create a process. The engine creates processes, constructs and enforces boundaries, evaluates expressions, asks runtimes to spawn executables, and mediates every substrate operation a running program attempts. Nothing runs without going through the engine, and no program touches the database directly.

**The engine is its own installed artefact.** It runs as its own process — `ol engine`, a binary or an OS service — and the wire is its only contract: every client — the chassis, a VM program, a browser page — speaks one JSON-lines protocol over a transport the environment provides; no client links the engine or knows its internals. Runtimes are the engine's own: it loads runtime providers at boot (`runtime-vm` is a provider crate) and registers `native` — the planner — itself. [`engine/sdk`](sdk.md) is the protocol expressed as a client library.

The engine opens a home store and attaches others; programs see one logical field, evaluated as one. Reactivity flows from the commits of writable attached stores.

---

## Stores and attach

**A store is a directory carrying `.ol/`** — db and `project.toml` within; the recognition is the whole of it (substrate.md, db.md). The engine boots by opening the store `--home` names, attaching every `[[attach]]` entry in its toml, then what the field records as dynamically attached (the home's contents: [`pilot.md`](pilot.md)). **Attach brings a store into the running field**, and the attach record is one shape everywhere — the toml, the engine API, the field:

```
{ path, branch = "main", at?: commit, write = false }
```

`at` makes the attachment read-only by construction; `branch` with `write: true` is work on a branch of a shared store — the middle ground; `write` with `at` is refused; a URL is fetch-then-attach, read-only. **Write mode is declared at attach, by the person, enforced by the engine** — nothing infers writability. Writes **route to the owning store** ([`db.md`](db.md)); a commit that would modify a record resident in a store attached without `write` is rejected (`READ_ONLY_ATTACH`). Reference is not modification: placements and refs stored in a writable store whose targets resolve to read-only attachments are legal — the federation pattern depends on exactly this. Checked at commit entry, before validation.

**Attach is dynamic [P]**, and **`attach` and `detach` are engine programs** — `runtime: native`, owned by `engine` — so the `run` wall (*Boundaries*, below) and run-to-draft escalation (*Lifecycle*, below) govern them like any act. **`[engine/attached]`** is a virtual place projecting the attach state — archetype and instances synthesized at query time from the engine's registry, not stored; every chunk surfaced from store *s* carries a synthesized `relates` placement on *s*'s attachment instance, so provenance rides native plumbing and any read can narrow to one store. **Dynamic attachments are persisted in the personal store**: *declared* (the toml) and *opened* (the field) are two different things with two homes, no duplication. Detaching a store whose chunks are on screen yields `unresolved` → the fault face (view). Admitting a store that ships components is a loud act — an attach-time consent chip [O — its shape].

**One connection, all attached stores, one evaluator** [P — supersedes the settled per-store-evaluate-then-union law, which provably leaks]. Reads, boundary evaluation and the planner run over the union of attached stores as a single evaluation; programs see one field. **Commits are per-store** [R]; a cross-store act is a sequence of per-store commits, ordered so that every prefix is safe. An act journal is the escape if a truly atomic cross-store case ever appears — never spanning commits [O]. Remote federation stays sync-then-evaluate.

Mechanics, carried from the mount era and re-worded to it:

- **Cross-store placements work because dbs are dumb.** A placement stored in one store may reference an `on` whose chunk lives in another — placements store ULIDs, globally unique. Listing an archetype's instances queries every attached store and unions; validation that needs an instance contract reads it from whichever store holds the archetype. Ref validation splits by residence — the db validates locally resolvable targets only, the engine resolves the rest at commit entry; whether the one evaluator re-homes this split is the alignment pass's to draw. Brokenness — a placement referencing a chunk no attached store has — surfaces at use time as an unresolved root, never at storage time; the db enforces no placement residency (ruled; substrate.md, *Peers*). *Status, honestly: the anchor-row bridge built while db still required residency (`engine/src/mounts.rs`) outlived its reason; retirement rides the alignment pass.*

- **Unresolved roots federate by intersection** — a root lands in `ReadResult.unresolved` only when no attached store resolves it.

- **Sharing places across stores.** The archetype is the unification point: place `instance` on a shared archetype defined in a store everyone attaches, and instances from every attaching store surface together in queries against it; place on your own archetype to isolate. `engine/program` already works this way — every store's programs are placed there and discoverable across the field.

- **`follow` over `owned` stops at store edges** — ownership never crosses stores (substrate.md); `linked` answers union per-store link tables.

- **Cost.** Under one evaluator, federation cost is the planner's problem, not a per-read loop; negligible at pilot scale (a handful of stores). A lazily populated `chunk_id → store` index is the natural optimization at larger N; not v0.1 work.

- **Single host per db.** Each `Db` owns its own in-process broadcast; two engine processes on one db file are not connected. Cross-engine reactivity is horizon.

- **Boot-time validation.** Before serving, the engine validates the home store: every placement's `on` must resolve in some attached store. Unresolved references are surfaced; the engine refuses to run half-loaded.

## Serving sources

**`ol://` resolves through the engine** [R]: *the file of store s at path p* — served from the store as attached, so no client knows disk paths and the web flavor of a chassis is unchanged by it. Realization `source` strings (view) resolve here. **Pilot-grade plumbing, nothing more**: the pilot serves what components need and no further — file-at-commit serving, locking, and the rest of a real file story belong to the files integration, down the line; a module's files living under the store's version control is what keeps that door open. How the bytes travel — a serving channel beside the JSON-lines ops, or an op of their own — is a build-time shape, unstated here [O].

## What the Engine Owns

- **Process creation.** Starting a program writes a `process` chunk in one atomic `db.commit()` — body and connections in *Program and Process*. From start on the process chunk is engine-domain: a running program cannot rewrite its own record.

- **Boundary construction and enforcement.** A run's boundary is a selection expression built at start from the frame, the argument, the program's ceiling, explicit additions, and the parent's cap — judged under the engine's own **call context** (below), the same law for processes and for view's mounts. Every read, write, subscription, and nested start passes it; filtering is uniform.

- **Write governance.** Placement and link rules are substrate law, checked **at db, inside the write transaction**, against boundaries the engine supplies (ruled; db.md is the enforcement home).

- **Program lifecycle.** The engine asks the runtime to spawn, tracks status through `running → done | failed` (a `draft` precedes the start and is data, not engine-domain), updates the process chunk as state changes, kills on timeout or cancel.

- **Expression evaluation.** The engine is the planner. Core verbs are program chunks with `runtime: native`; a chain in the single-request class lowers to one db query; programs never interpret expressions and no author writes SQL.

- **Protocol mediation.** The engine receives every substrate operation a running program or client attempts, validates it, executes it, returns the result. Programs do not carry database access; the protocol is the boundary.

- **Containment.** The engine asks the registered runtime provider to spawn each program. Containment lives in the provider; the engine knows runtime kinds only as registry keys.

- **The attach registry.** The engine holds what is attached, routes writes to owning stores, enforces declared write modes, and projects `[engine/attached]`.

- **Source serving.** `ol://`, per *Serving sources*.

## Program and Process

### The program body — a program's interface is its body

`engine/program` is the archetype every runnable thing is `instance` on. Its instance contract types the program body:

```ol
chunk engine/program {
  instance: {
    executable?:   string       — absent for runtime: native
    — programs are headless [P]; the surface runtime retired with the
    — seat mechanism
    runtime:       vm | native
    accepts:       list<type>   — required; entries as reified type values
    result?:       ref          — an archetype; checked at program definition
    — the ceiling, per key (*Boundaries*); absent means {};
    — `caller` names the parent's reach, composably
    read?:         selection
    write?:        selection
    run?:          selection
    capabilities?: set<string>  — net[:host] · fs · exec, nothing else
    timeout_ms?:   number
  }
}
```

**Role is conferred by reference.** An archetype is this program's result because the program's body says so. Interface archetypes are found from the program, never by global name or path — every program having an `output` collides nowhere.

*Retired from this body:* `grades` (a component's `serves` carries the size contract now — view) · `uses` and `presets` (both served the retired launch surface; menus derive from declared `actions` and the match, and a program's shipped views are offers — view). `runtime: webview` retires: what draws is a component, and no component is a process.

Concrete programs — filesystem, shell, model, echo, `attach`, `detach` — are chunks `instance` on `engine/program`, owned by their store's root.

*Open, owed to the author.* substrate.md's key-type list says **at most one `selection` per contract**; [`selection.md`](research/arc/selection.md) §3 states the same rule of `accepts` **entries**, where two selections would compete for the same elements. `read`, `write` and `run` are three selection-typed keys on one contract, so the narrower reading is the one this contract needs. Marked, not decided.

### `accepts` — what a program takes

A program's argument is a selection — an **ordered list of typed elements**, matched structurally; order never affects the match. `accepts` is a required body key on every program — `[]` is legal and says *takes nothing*, explicitly. Each entry is a type, optionally marked optional, and nothing else:

```ol
program summarize { accepts: [ loc, options? ] }
    — one place, required; options allowed
program revert { accepts: [ set<ref(commit)>, loc? ] }
    — any number of commits; maybe a place
program sequence { accepts: [ selection ] }
    — the content mouth
program compare { accepts: [ set<ref(commit), 2> ] }
    — symmetric pair
```

Entry types: `ref(X)` · `ref(X | Y)` (union — instance on any listed; ruled) · `ref(X & Y)` · `loc` · `expr` · `selection` · a payload archetype · `set<T(,n)?>` · `list<T(,n)?>`.

The rules, plainly:

- **Boundary facts never sit here** — they live in the `read`/`write` keys (*Boundaries*).

- **Entries may not compete for the same elements.** Checked at definition, structurally: the same archetype twice is illegal, and so is value-kind containment (`[loc, selection]` — a selection's elements include locs). What definition *cannot* forecast is multi-typing, since any chunk may carry two instance placements; those ties surface at start and reject (*The match*).

- **Payload discipline.** Same-typed inputs with different roles never appear bare — they ride inside a typed payload chunk whose *keys* are the roles (`diff/pair {old, new}`). Payload archetypes are owned: shared vocabulary by ownership and import, never a global predicate space.

- `set<T>` claims its whole type: an "any number of X" mouth must be the contract's only consumer of X.

- **Primitives never appear as entries.** `string`, `number`, `time`, `markdown` are payload content, living inside chunk bodies. That is what makes matching uniform — "matchable" has exactly one meaning.

One convention feeds three consumers with no duplication: the draft's argument, seated, renders each entry by its matched surface (view); the agent compiles provider tool schemas from the same reified entries ([`agent.md`](agent.md)); expressions type-check plans against them before anything runs.

*Open (steward direction, not author-resolved): `ref(X & Y)` conjunctions — instance on all listed archetypes, the trait case. And, if nested conjunction contracts ever appear, most-specific-wins as a bind tiebreak; incomparable overlaps still reject. Default is strict-reject until real contracts hit the wall.*

### The process

`engine/process` is the archetype every run is `instance` on. Its instance contract types the process body — every key statically typed:

```ol
chunk engine/process {
  instance: {
    argument: selection        — the offered set; frozen at start
    at:       ref(commit)      — the branch head at start, engine-stamped
    status:   ref(status)      — draft | running | done | failed (value chunks)
    result?:  ref              — filled once at completion
    error?:   string           — written by cleanup on a failed transition
    read:     selection        — the run's boundary, frozen as expressions
    write:    selection
    run:      selection        — which programs the run may start (*Boundaries*)
  }
}
```

`status` is the substrate's own enum pattern: `engine/status` with four value chunks. The run's boundary is three typed keys on the body, read in one hop.

**The argument is a field, not a chunk.** A chunk can never *be* a set — bodies are one JSON object, always — so "arguments are sets" is a claim about the argument **value**. There is no argument chunk. The draft *is* the process chunk; composition edits `P.body.argument` directly; editable-iff-unconsumed is enforced on the field, by the engine, not by convention.

**Elements are `$loc | $ref` only.** A place is offered as a location value. Everything else — a payload, an expression — is offered as a ref to a chunk, and those chunks are *created at composition* (*Expressions*, below). So the graph reads `P →argument→ E →mentions→ its places`: provenance at the expression's own grain, not flattened into the process record.

```
process P — status: draft
  body: {
    status:   draft
    argument: [ {$loc: [my-project, tasks]},
                {$ref: →E},      ← an expression chunk, made at composition
                {$ref: →O} ]     ← a payload chunk (summarize/options), likewise
    write:    …                  ← read over argument content is implicit
  }
```

**A program's argument content is a selection — precisely, with nothing left over.** A selection admits `loc | ref | expr`, so the places, payload chunks and expression chunks an argument carries are all ordinary elements of one. That exactness is why a selection, a slot's offer, and a call are the same text (*The written language*).

**Results** are `instance` on the declared result archetype and **owned by the process that produced them**. Ownership is membership, so a result is a member of the process's own dimension and writing it needs nothing beyond the frame.

**Validation is two checks.** At start: **the match** — the argument set against the program's `accepts` (*Lifecycle*). At completion: is the result chunk `instance` on the archetype the program's `result` names. Nothing else. The archetype-side `accepts` of the old spec language — union composition, per-list ambiguity judgment, the trace-nesting exemption, federated pre-validation — retires; the word now names the program's argument contract and nothing else, and a child process placed on its parent is just a placement (substrate.md, *Archetypes and Contracts*). The built engine still carries the retired machinery; removal is tracked on the board, spec leads.

**The frame is `[self]`.** A process's frame is its own dimension. Children and results are **owned by the process**, and that one relation is both their address and their membership in `[self]`. "A program can always read and write its own frame" is therefore a term in its boundary, not an invariant standing beside the law. Ownership is one hop, so reading the *whole* trace is a `follow`-shaped expression, never a single read.

Concrete topology for a run:

```
process P
  owned by: the caller's process (child mode)
            — or the configured launch owner (top-level)
  instance on: engine/process, <program>, <caller-supplied places>
  body: { argument, at, status, result?, read, write, run }

composition chunks (payloads, expressions cited by the argument)
  owned by: wherever they were composed
            — the composing process's frame by default

result R
  owned by: P — which is its membership in [self]
  instance on: <the program's result archetype> — nowhere else

children
  owned by: P — the trace; instance on engine/process + their own programs
```

*Open:* re-homing on re-run and cross-store composition settle at the draft build. And substrate.md's naming rule — *a chunk that has members must have a name* — fires on process chunks, which are id-addressed and typically nameless yet own their children and results; either the rule needs an exception or processes need generated names. Carried, not decided.

---

## The call context

The engine judges every act under one structural contract of its own — **the call context**. [R — the direction: the engine never names view; the shape and the `anchor` name are steward-drafted, P.]

A **conforming chunk** names a *declaration* carrying ceilings, an *argument* (a selection), its own *grant* (`read` / `write` / `run` additions), and has a derivable *parent* conforming chunk. Effective reach at any link in the chain:

```
( the argument, read-granted as any argument is
  ∪  the declaration's ceiling
  ∪  the grant )
∩  the parent's reach
```

The chain caps at the **machine context** — `Context::process_id = None`: full reach over what is attached, and no frame — so a machine-context declaration must name each new chunk's owner; chunks with no owner at all exist only through the bootstrap carve-out ([`bootstrap.md`](bootstrap.md)).

**A process is the near-conformer, not a conformer by construction**: its **frame** is a fifth reach source, exempt from the parent cap — where the frame sits in the generic contract is the rewrite's named open seam [O]. **`view/mount` conforms from the view side** — the engine never references a view archetype; the dependency law holds at this seam too.

`Context` carries **`{ anchor }`** [P — the name]: a ref to any conforming chunk. Batch reads carry the anchor per entry (*The Program Protocol*). The engine derives the chain from field data — cacheable — and judges `read`, `commit` and starts exactly as for a process; rendering under a mount reads under its anchor's reach. **Intents are dissolved** [R]: what interface code emits is an ordinary `commit` or start, judged here.

*Open:* how the parent link is derived (containment backrefs vs a stored key) [O — encoding] · which ops beyond read/write/run are judged under `{ anchor }` (`cancel`, `subscribe`) [O].

---

## Expressions — locations, calls, and the planner

The engine owns the expression layer: the data shapes, the written language, their evaluation, and their lowering. Display rules live with the components that render them (view).

### The shapes

```
location     [my-project, tasks]
             — places, intersected; a value kind
call         program(e1, e2, …)
             — the parentheses ARE the offered set
expression   one grouped unit
             — named nodes, its own closure, last unnamed line = out
selection    list<loc | ref | expr>
             — ordered (substrate.md); purity clause below
```

One archetype carries the lifted form:

```ol
chunk engine/expression {
  instance: { nodes: map, out: string }     — the graph as compressed structure
}
```

(`collation` — the reader's ordered members — moved to the view family: its members are mounts now, calls rather than bare selections.)

### The written language

Classical calls — no positional-only arguments, no invented sugar:

```ol
summarize([my-project, tasks], options({ max_words: 200 }))
diff(pair({ old: [my-project, tasks] | at(c1), new: [my-project, tasks] }))
sequence([a, b], [c], [d, e])
```

```
bareword              ref — resolves within its own closure outward to its
                      own root; crossing roots always requires the full
                      path (engine/program)
[a, b]                intersection location (value position)
{v1, v2}              set literal
{k: v}                struct literal
archetype({k: v, …})  typed instance literal — a name resolving to an
                      archetype constructs; resolving to a program calls
program(e1, e2, …)    call — the parentheses are the offered set (varargs)
a | verb(…)           pipe; groups, named nodes, last unnamed line = out
```

ol expression grammar is valid TypeScript *expression* grammar — highlightable in any `ts` fence, parseable by existing tooling; with generated TS types over the substrate, plans type-check in an ordinary editor. Call-versus-instantiation legibility lives in presentation (semantic highlighting), not in syntax.

`sequence([a, b], [c], [d, e])` **is** a selection with a pinned surface; drop the program name and a bare selection remains. Selection, slot offer, and call are one text.

**Storage is the flat named graph.** Nesting is an anonymous node used once, auto-named at parse; text ⇄ WYSIWYG round-trips losslessly. Parsing is context-free recursive descent — trivial by construction.

**Names vs refs, by the grain principle.** Interior wiring is names — values: cheap branching, inline prose, no litter. Sharing lifts a node to a chunk, and its wires harden to `ref`.

### Plan-form, run-form, and composition

Nodes hold their args inline as data — the plan. Type-checking a plan is reading the programs' `accepts` entries, before anything runs.

Text plans must be runnable — prose fences, palette one-liners, agent-written `ol` — so **composition into an argument materializes**: every inline expression and payload literal entering an argument becomes a chunk at that moment, and the argument holds a ref to it. Composition into an argument *is* the sharing gesture that lifts a value to a chunk (substrate.md, *Values and chunks*). Two reasons, recorded because they govern future grain decisions:

- **Deletion symmetry.** Drafts already compose real chunks — a document written as an argument. Deliberate draft-deletion cascades to composition chunks related solely to that draft: one gesture, covering documents and expressions identically. The cascade walks placements, not ownership.

- **Graph fidelity.** Inline, an expression's mentions would attribute to the draft, flattening provenance — "which expressions depend on this place" would be unaskable. As a chunk, the graph is traceable and foldable. For a system whose center is retrieval's inverse, provenance grain is the point.

The field is fractally infinite; abundance is not a cost; veiling structure for tidiness is itself the hygiene problem.

Starting validates the chunks that already exist, runs the match, and freezes the record — the same call frame as every run; expressions add no second execution path. The program receives locs and refs and hands them to the **`resolve` op**; the planner evaluates. **Programs never interpret expressions.**

Fenced expression blocks in prose are anonymous expressions — no chunk exists until lifted, since sharing confers identity; every chunk and location an expression uses files a mention (substrate.md, *Links*).

### The planner partition

The expression language is the **only** query surface; no author writes SQL, ever. The planner partitions the verb vocabulary:

- **Read-native** — verbs with a relational lowering: `at` (time travel as composition), subtraction, `limit`, `where`-over-keys, the hop vocabulary and `prop`, and `follow` (transitive closure of a step — below). A chain inside this subset compiles to **one** db query — the boundary filter included, since a boundary is itself a single-request selection and lowers into the same statement.

- **Compute** — `fold`, `group`, anything model-touching: real program runs, fed by lowered sub-chains.

**Single-request is derived, never typed** (ruled). `runtime` says only *who executes* — `native` means the planner, no executable. Whether a verb lowers is the planner's own knowledge: it holds a lowering or it does not, and a stored flag could only agree or lie (the purity argument, again). Boundary validation asks the planner whether the whole expression lowers; a native verb without a lowering is legal — it simply cannot appear in a wall.

### Hops and `follow`

The one-hop reads the system answers at every read, as composable verbs — each pure, each with a relational lowering:

```
members(kind?)    what is placed on the input — down a placement; kind narrows
placed(kind?)     what the input is placed on — up
owner             one hop up the naming chain
refs(key?)        outbound links from the input's bodies; key narrows to a field
backrefs(key?)    inbound links — who points here; the linked answer as a verb
prop(key)         a body key's value projected as field structure — the
                  narrow, single-key form of explode; face-follows-context
                  is its consumer
```

**`follow(step, depth?)` is transitive closure of a step, and the step is itself a pure expression** (`selection → selection`): evaluate on the frontier, union, repeat to fixpoint or `depth`. No lambda — the step's input is the pipe input, like every verb. Composite hops are step composition (`refs(argument) | owner` alternates two edge types); cycles terminate by visited-set, so mutual citations cannot hang a wall. If the step lowers, `follow` lowers to a recursive CTE — single-request, wall-admissible; a compute step makes it compute, legal but never a wall. The yield orders deterministically: closure depth, then commit time.

**Closure output carries its edges.** Nodes alone cannot render a branch or a join, so a closure evaluation reports the edges it walked — `(from, to, kind-or-key)` with depth — beside the chunks, in the result. This is the one extension pipe output needs; its wire shape lands with the SDK at build. The thread face is the consumer: **follow yields the line; dimensions orbit it** as per-element attribute pipes ([`agent.md`](agent.md)).

`explode` is unclassified until it lands (*What Is Open*) — a projection of body keys reads as read-native, but nothing has priced its lowering.

Core verbs are ordinary program chunks with **`runtime: native`** and no executable — the engine registers a `native` runtime provider: itself, the planner. Identity and contract are field data; the implementation is plan substitution, so `follow` is discoverable, documentable, and callable like any other program. **Pipe output is substrate-shaped** — chunks-and-placements — so the algebra composes over results, not just stored places.

The cost, named: db.md grows an engine-internal **plan interface** — relational ops plus transitive closure — never program-facing ([`db.md`](db.md)).

**Caching needs no new machinery.** Pipe verbs are pure by law, so a pure chain evaluated at a commit through a boundary is deterministic: memoized on `(normalized expression, boundary, commit)`. The boundary belongs in the key — once membership answers are boundary-filtered, the cache fragments per boundary, and that is a price to budget rather than discover ([`db.md`](db.md)). Invalidation rides the reactivity dispatcher's touched-set computation; materializing a hot expression is the standing `explode` principle. Expression normalization is open (substrate.md, *What's Open*) and load-bearing for these keys.

### Purity — derived, never declared

**Pure means effects confined to the own frame.** A pure program still commits — its result lands in `[self]`, and that is the memoized value.

1. `write: {}` — the purity condition; with the ceiling law (*Boundaries*) an absent `write` already means `{}`, so purity is the default posture and impurity is declared.

2. No capabilities. `fs`, `exec` and `net` are world-effects regardless of field writes. This does **not** put the filesystem or network off limits for pure work — external content enters through an integration projecting it into the field; purity is about *this run's* effects, never where the data originated.

3. The engine refuses start-time write additions to a pure program.

4. Transitive: a pure program starting an impure one is rejected at start.

1–2 hold at definition, 3–4 at start. Badges derive from the predicate; a `pure:` flag could only agree or lie. This is the predicate substrate.md's `selection` purity clause names.

**Purity is never the launch gate** [R — 2026-08-20]. It decides what the planner may evaluate as an expression — nothing else. Impure programs are as launchable as pure ones; the walls (`run`, capabilities) govern (*Lifecycle*, daemons).

**Result production vs placement.** A result is what a run *produced* — frame-only, always. Commits are what it *mutated*. Placing a result onto other places is a second, visible act: declared in the program body, where the targets count into `write` and the program is honestly impure, or performed by the caller within its own reach.

**Automations and the pin.** A selection admits `loc | pure expr` only. Impure chains are **automations** — started processes, viewport-independent; their *results* are field content a selection may include. You seat the output, never the automation. A final call resolving to a *component* **pins** the expression: it yields a view rather than data, legal only in mount positions — where a slot or a member names content (view) — and never referenceable from another expression. Grammar, not purity bookkeeping; purity is asked of the content beneath the pin.

**Dead nodes are legal.** An expression is a composition, not a contract: dormant chains are held alternatives, and an editor must be able to save a broken connection — the editing state *is* the proof. Evaluation is **lazy from `out`**, so dead never computes; **normalization prunes to the live graph**, so cache identity is shared across dead-node variants; **mentions file from the authored whole**, so provenance sees dormant citations correctly. *Strict at contracts, abundant in compositions* — the match rejects orphans; expressions keep their dead.

---

## Boundaries

A run's boundary is a **selection expression** — places, and pure derivations of places — drawn from the **single-request class** of the language above: dimension algebra, the hop verbs, `at`, `where`, `follow` — what the planner can lower, exactly (*Single-request is derived*). A wall must be evaluable instantly and deterministically at every read, so compute has no place in it (substrate.md, *Boundaries*).

The boundary is **constructed at start** and recorded as the process body's `read`, `write` and `run`. **Three kinds of act, three walls**: reads are governed by `read`, writes by `write`, program starts by `run` — a selection over program chunks, so **the toolset is the run boundary**, one home rather than a convention beside the grant. (Substrate ops — `read`, `get`, `commit`, `resolve`, `subscribe` — are protocol, not programs: every connected program has them, and they are walled by `read` and `write`, never by `run`. But a `resolve` whose chain contains compute verbs starts real runs, and **those pass the `run` wall** — resolve respects it.) `run` is selection-grade like the others — typed `selection`, not `set<ref(program)>` — precisely so a wall may be an expression: `[engine/program] | where(runtime: native)`, a toolset location, a subtraction.

**The formula, plainly** [R]: *a run reaches its frame, plus what was offered in its argument, plus what its program's ceiling names, plus what the starter adds — cut down to what the parent holds.* Five sources:

1. **The frame.** Read: `[self] | follow(owned)` — a process reads its **own trace at depth**: its children, their results, recursively down its own frame and never beyond it (ruled — without this a caller could not read its children's results, which live in the children's frames). Write: `[self]`, one hop — a process writes its own frame, never its children's. Always granted, never declared, and **exempt from the parent cap** — the near-conformer clause of the call context; where the frame sits in the generic contract is the named open. A wall ignores the order a selection carries.

2. **Argument content, read-granted implicitly.** The offer *is* the grant: someone gestured the content into the argument, and that gesture is the consent read needs. **Write is never implicit.**

3. **The program's ceiling** — the `read`, `write` and `run` keys, **a source, not a cap**: what the ceiling names is added to the run's reach. **An absent key means `{}`.** The parent's reach enters only where the ceiling names **`caller`** — composable like any term (`caller − [secrets]`); a ceiling with no `caller` takes nothing from the parent beyond what the other sources carry. No run widens its own walls mid-flight — more reach is always a new consented start (*Run-to-draft*). Members are static locs, `caller`, and **argument references** — an entry's type name, unique by the disjointness rule, or a payload-key path:

   ```ol
   program move {
     runtime: vm
     accepts: [ route ]
     write:   { route.from, route.to }
   }
   chunk move/route { instance: { item: ref, from: loc, to: loc } }
   ```

   At start each reference resolves to the **term chunks** of the bound element — `[a, b]` contributes both; an expression chunk contributes what its mentions name — and is snapshotted into the process record. A body with no ceiling keys at all is the fully contained program — `model`, `web`, `filesystem`: nothing beyond the frame and the argument, starts nothing, enforced rather than promised.
4. **Explicit additions at start** — whatever the starter grants (`RunArgs.read` / `RunArgs.write` / `RunArgs.run`). These render as the boundary chips a person sees before Go, and are narrowable there.

5. **The parent's reach, as a cap.** Sources 2–4 are intersected with the caller's own boundary, `run` included; the frame alone is exempt (source 1). **A cap, never a source** — within a call stack reach only narrows, and detachment (`launch`) does not escape it. Handing a child more than the caller holds is not forbidden — it is an **escalation**: the start lands as a draft, and an approver who holds the reach starts it, their reach becoming the cap (*Run-to-draft*).

**Content never carries reach.** Structural, not stated: all reach lives in the boundary keys or in explicit additions, never inferred from what happened to match.

**Filtering is uniform.** Bodies, membership answers, adjacency, links and full-text search all pass the boundary, and **counts describe what the boundary admits**. There is no privileged view of a full set, and no distinction between which doors open and what is visible once inside: one selection filters every element of every answer. One derived admission rides the filter (ruled): **an admitted instance admits its archetype's address and contract** — never its membership — which is substrate.md's free archetype hop given its mechanism.

**Depth is not implied.** A term admits one hop of membership — `[hallway]` reaches what is placed on the hallway, not what is placed on those. Depth, when wanted, is stated: a `follow`-shaped term in the boundary itself. Reorganizing the ownership tree therefore never reorganizes permission.

**Frozen expression, live membership.** The boundary expression freezes at start; membership through it stays live. A grant over a collection that grows keeps admitting what arrives — a standing licence over a region, not a snapshot. Membership is always current, including under `at`: a temporal read is filtered by the structure as it stands *now* (substrate.md).

**Hygiene, not holes.** Naming a dimension in a boundary — positively or negatively — delegates membership control to that dimension's writers, in both polarities. Permission is a question of hygiene: keep the dimensions you name well-governed.

### Governance at `commit`

Beside the boundary check, the engine applies substrate's write law to every declaration:

- **`owned` and `relates` placements** — creating one requires **write over the dimension and read over the placed chunk**; removing one requires **write over the dimension**, since its stewards curate its member list.

- **`instance` placements are a claim**, not a publication: anyone may claim a type, the archetype untouched — and the symmetry holds on removal: **removing an instance placement requires write over the placed chunk** [R — the claim is the chunk's own fact, never the archetype's], the archetype again untouched. This is why a run may place its own result on the declared result archetype without holding write over it.

- **Links** — a typed ref or a mention requires **read over its target** and nothing more; the fact lands in the author's own body, self-governed.

- **Chunk birth is never placementless.** A declared chunk carrying no `owned` placement is created owned by the running process — the frame default. Owning it elsewhere at birth is an ordinary placement, needing write over that owner. Under the machine context there is no frame, so the declaration must name each new chunk's owner (*The call context*).

*Open, carried from substrate.md and not decided here: creating a placement requires read over the placed chunk, but at birth the chunk does not yet exist to be read — the two rules are stated and never reconciled. And who may remove a whole **chunk**, dropping every placement at once, is unspecified.*

**Protected records.** From start on, the engine rejects any program write that modifies the process chunk itself — status, result, the boundary keys — or the frozen `argument` field.

---

## Lifecycle — draft, the match, start

A process may exist before start — **status `draft`**, its argument under composition. A draft is ordinary field data: written by whoever holds the grant, substrate-resident (there is no in-memory draft state), resting visibly where it was begun until an explicit gesture deletes it — nothing auto-sweeps. Deleting one deliberately cascades to the composition chunks related solely to it. A draft whose argument cites a previous turn joins that thread's lineage ([`agent.md`](agent.md)). From start on, the process chunk is engine-domain.

### The match

Starting checks the offered argument set against the program's `accepts` — four steps, no search:

1. **Bind.** Each element maps to the one entry it satisfies. Two kinds of check, per the law's union rule — tag membership, then per-tag shape: for value-kind entries (`loc`, `expr`, `selection`) the element must *be* that kind of value; for chunk entries (`ref(X)`, payload archetypes) the element must be *instance on* that archetype. An element satisfying two entries — always multi-typing, which definition cannot forecast — **rejects as ambiguous**, never guessed.

2. **Offers bind the rest** [P]. Unbound *optional* entries bind from the caller's **standing offer** — a run's from the caller's offer, a mount's from its ancestors' (view) — by this same binding; explicit binding wins; two offered elements at the same distance matching one entry is ambiguity, and **ambiguity binds nothing and says so**.

3. **Count.** Required entries satisfied exactly once; optional entries at zero or one.

4. **No orphans.** An element the contract does not recognize refuses the *run*. A start is a consented exchange; unconsumed offerings would be silent lies. (**Selection mouths consume the unbound rest** — a `selection`-typed entry is the one legal home for it.)

The draft is free: anything may sit in a draft's argument, unrecognized elements included; it simply cannot start until the match passes. The match guards the door, not the desk — which is why required entries show as must-fill and optional ones fold away while composing. Names gave keyed arguments their optionality; **types plus counting** give it to sets, and entry disjointness keeps counting from becoming search. Failure is `VALIDATION_ERROR`, with nothing written.

### Two modes

- **`run` (child).** Composed work. The child is owned by the caller's process — the trace — and cancellation cascades: cancel an agent turn, its in-flight tool calls die with it.

- **`launch` (detached).** The process is owned by the **configured owner**, not the caller, and survives the launcher. The owner is configuration, not engine law — the pilot's desktop module configures its session as that owner; a session is desktop-module state, not an engine concept [R — 2026-08-20]. The parent cap still applies at start — detachment never escalates. Every start from the interface is a `launch` [P]: a mount has no frame to own a child (view), so the interface starts work the way any caller does, watched by subscription.

Components are viewers, never owners: closing one is a body edit that unmounts a viewer — it kills nothing. Terminating is always an explicit act.

### Daemons

[R — 2026-08-20.] A component that needs a running service names an ordinary program — impure programs are as launchable as pure ones; the walls (`run`, capabilities) govern, and purity is never the gate (*Purity*). **Nothing auto-starts**: in the pilot a daemon is started by a person's act — `launch` from the interface, or outside the field entirely — and a component whose service is absent draws the honest fault face (view); the docker-cli-without-engine posture, accepted for now. Whether a component may ever dispatch a start without a gesture is deferred with it [O]. The resident lifecycle — a terminal transition as *policy* (stop, restart) rather than the end of a job — remains open and must not be foreclosed (*What Is Open*).

### Run-to-draft — escalation

A `run` that exceeds the caller's walls — the target outside the caller's `run` boundary, or requested `read`/`write` additions beyond the caller's reach — is neither rejected nor silently narrowed: the engine writes the child as a **draft** and returns its id; the caller `await`s it like any run. From there:

- **Approve is starting the draft.** A holder of the needed reach starts it, and boundary source 5 takes **the approver's reach** as the cap — approval is lending authority, which is the only way reach ever widens. Chips are narrowable before Go, as at any start.

- **Deny is `cancel` on the draft** — the terminal transition `failed` with `error: 'denied'`; the caller's `await` resolves and the refusal is the caller's to handle.

- **Pending drafts are auto-surfaced** — process chrome badges them, and any process view rendering the caller surfaces them inline: obligations penetrate the fold (view, [`agent.md`](agent.md)).

- A caller that knows it will exceed may relate explanation prose onto the draft before awaiting — ordinary aboutness, rendered by the draft's chrome.

The consent for an escalation is the **consent face** — a component whose content derives from field reads over the consent place (view) — sealed by the **reserved native chord** the input floor captures ([`chassis.md`](chassis.md)): the chassis vouches for the seal, never the drawing [P — steward reconciliation of the brief's two phrasings, "host modal from field reads" and "the chord → the consent face"]. The principal the chord binds is open [O — lean: the mount of the draft face]. Purity is untouched: a pure program handed write additions is still refused outright — purity beats escalation. *Build-time, deliberately unspecced: how the launch grant stages which acts auto-run versus draft first.*

### What the engine writes at start

Starting — `run` with a program and an argument set, or a consumed draft — is one atomic `db.commit()`:

1. **The match.** Fail → `VALIDATION_ERROR`, nothing written.

2. **The boundary is constructed.** The five sources are assembled per the formula, argument references resolve to their term chunks, and the result is the `read` / `write` / `run` expressions. A pure program handed start-time write additions is refused here.

3. **The process chunk** — fresh for a direct start (owned per mode, `instance` on `engine/process`, the program, and each caller-supplied place), or the existing draft flipped. Body written whole: `argument` as offered, `at` stamped to the branch head, `status → running`, the boundary keys as constructed.

4. **The argument freezes.** From this commit, writes to the process's `argument` field are rejected — consumed.

At completion the mirror check runs: the result chunk must be `instance` on the archetype the program's `result` names; the engine fills `body.result` and flips status in the terminal commit.

Pre-generated ids let the engine reference the process from its own declaration.

**Frozen safety or rolling head.** The record freezes, but the chunks it references live on. The SDK makes the choice explicit: resolving the argument's refs **at the stamped commit** (`at`) is the default — reproducible, exactly what the run was given; following the **living head** is the deliberate choice for programs that want liveness ([`sdk.md`](sdk.md)).

**Terminal cleanup never severs the frame.** A terminal process's argument, results, children, and boundary remain readable forever — cleanup writes status, it does not dismantle topology. Re-run clones from dead frames; the process view autopsies them.

---

## The Program Protocol

One JSON-lines protocol serves every client regardless of where it runs. **The transport is one object** [P]: `send(text)` / `receive(handler)`, found in one place, **installed by the environment before the SDK loads** — the chassis's init script, a VM preamble over stdio, a browser page's websocket shim. The SDK embeds no variants; provisioning the transport is the host environment's duty ([`sdk.md`](sdk.md)).

**Operations a connected program can call on the engine:**

| Operation | Description |
|---|---|
| `read` | Read the intersection of places. Filtered by the read boundary — bodies, membership, adjacency, links, counts, alike. Membership across the three stored kinds plus the `linked` answer, per substrate.md (*Read*). FTS via `ReadOpts.match_`; an **empty places list with `match_`** is a whole-field FTS query, boundary-filtered and federated like any read. Negation via `exclude`. Pagination and body-less projection per substrate.md. |
| `resolve` | Evaluate a location or an expression chunk and return its `ReadResult`. The planner does the work — programs never interpret expressions. Boundary-filtered like `read`; compute verbs in the chain become real runs, each passing the `run` wall, and the call returns after those sub-runs complete — which is why the planner keeps compute out of boundary grammar (*Boundaries*). |
| `get` | Fetch a single chunk by id. Returns `null` if the chunk does not exist; rejected if outside the read boundary. Honors `at` for temporal point reads. |
| `read_batch` | Multiple tagged `read`/`get` sub-queries resolved together at **one commit snapshot**, each authorized under its own context — each entry carries its **anchor** on the wire (ruled; *The call context*), so a coalescing client never authorizes at its own. One request, coherent results — the resolution primitive behind composed views. |
| `commit` | Write a Declaration. Rejected if the boundary does not admit every touched dimension, and checked against the placement and link rules of *Governance at `commit`*; ref keys validate per substrate.md, federated across attached stores; the write routes to the owning store. `dry_run: true` runs full validation without writing — the live-form affordance. |
| `run` | Start a program. Returns the process id immediately. Takes a program plus an argument set, or a `draft` process id to consume. `mode: 'child' \| 'launch'` per *Lifecycle*. |
| `await` | Wait for one or more processes to reach a terminal state. **Returns each process itself** (the chunk — status, result ref, one hop to the result). The call suspends the calling task; it doesn't block the engine. |
| `cancel` | Request a process's terminal transition. Authorized when the target descends from the caller in the engine's own process tree — the cascade lineage, engine state rather than a reach claim — or when the caller's write boundary admits it. Idempotent. Cancel of a **draft** is deny: `failed`, `error: 'denied'` — the run-to-draft refusal path (*Lifecycle*). |
| `subscribe` | Register on a set of places; returns a subscription id. The engine pushes `place_changed` events when commits touch them. |
| `unsubscribe` | Cancel a subscription by id. |

(The old `exit` op — surface self-dismissal — retires with surface programs: a VM program exits by exiting; nothing else is a process.)

### Schema

Every request has an `op` and a monotonic `id`. Every response pairs the same `id` with either `result` or `error`.

```jsonl
{"id":1,"op":"read","places":["chunk_abc","chunk_def"],"opts":{"match_":"session today","exclude":["chunk_hidden"],"limit":50}}
{"id":2,"op":"get","chunkId":"chunk_abc","opts":{"at":"...","branch":"...","include":{"body":false}}}
{"id":3,"op":"read_batch","reads":[{"tag":"a","anchor":"m_1","places":["s1"]},{"tag":"b","anchor":"m_2","places":["s2"],"opts":{...}}]}
{"id":4,"op":"commit","declaration":{"chunks":[...]},"dry_run":false}
{"id":5,"op":"run","program":"diff","argument":[{"$ref":"chunk_pair"}],"mode":"child","read":[{"$loc":["their-store"]}],"write":[]}
{"id":6,"op":"run","draft":"p_draft"}
{"id":7,"op":"await","processes":["p_1","p_2"]}
{"id":8,"op":"cancel","process":"p_1"}
{"id":9,"op":"subscribe","places":["my-place"]}
{"id":10,"op":"unsubscribe","subscriptionId":"sub_1"}
{"id":11,"op":"resolve","target":{"$ref":"expr_1"},"opts":{"limit":50}}
```

| Op | Result shape |
|---|---|
| `read` · `resolve` | `ReadResult` |
| `get` | `ChunkItem \| null` |
| `read_batch` | `{ head: CommitId, results: Record<tag, ReadResult \| ChunkItem \| null \| EngineError> }` |
| `commit` | `Commit` (with `dry_run`: `{ valid: boolean, errors: [...] }`) |
| `run` | `{ process: string }` — the process chunk id |
| `await` | `Record<string, ChunkItem>` — process id → the process chunk |
| `cancel` | `{}` |
| `subscribe` | `{ subscriptionId: string }` |
| `unsubscribe` | `{}` |

The wire carries the tagged value encoding for typed bodies (`$ref`, `$loc`, `$set`, `$time`, `$md`) — translation is the SDK's job ([`sdk.md`](sdk.md)); the engine validates tags against instance contracts at commit. Argument sets and boundary selections ride the same encoding: `$loc` terms and `$ref` terms, no new tags.

**Errors:**

| Code | Meaning |
|---|---|
| `BOUNDARY_VIOLATION` | Read or write the boundary does not admit |
| `READ_ONLY_ATTACH` | Commit modifies a record resident in a store attached without `write` (reference alone is legal — *Stores and attach*) |
| `VALIDATION_ERROR` | Declaration fails spec validation — instance-contract key check, ref-target check, the match at start, or the result placement check at completion |
| `NOT_FOUND` | Referenced chunk, program, or subscription does not exist |
| `RUN_FAILED` | A run the program started ended non-zero |
| `INVALID_REQUEST` | Malformed JSON, unknown op, missing fields |
| `TRANSPORT_CLOSED` | The transport closed mid-response; the pending call rejects on the SDK side |

### Events

A connected program receives unsolicited messages from the engine on the same channel it sends requests over. An event has no `id`; it is identified by its `event` field.

| Event | Shape | Meaning |
|---|---|---|
| `place_changed` | `{ event: "place_changed", subscriptionId, commit }` | A commit touched a place this subscription registered on. The SDK re-fetches via `read`. |
| `lagged` | `{ event: "lagged", subscriptionIds: [string] }` | The engine's input channel overflowed; the named subscriptions may have missed events. Re-fetch to recover. |
| `subscription_invalid` | `{ event: "subscription_invalid", subscriptionId, reason }` | A subscribed place fell out of the subscriber's read boundary. The engine has unsubscribed; the SDK treats the subscription as dead. |

Subscriptions fire on membership changes and on link changes — a commit that adds or removes links *to* a subscribed chunk fires like one that changes its placements (computed from the link delta in the same transaction; churn rides the required coalescing). The contract remains: re-fetch on event. Process state changes are not events; programs track them through `await`.

### Run and await are separate

`run` starts the process and returns its id immediately. The started program runs on its own. `await` waits on a set of process ids until they reach terminal state — it suspends the calling task, not the engine. There is no structural difference between starting an agent and calling a tool — a filesystem read returns in milliseconds, a sub-agent might run for minutes; the protocol handles both identically.

```
# Sequential tool call
→ {"id":1,"op":"commit","declaration":{...the payload chunk...}}
← {"id":1,"result":{...}}
→ {"id":2,"op":"run","program":"filesystem","argument":[{"$ref":"chunk_req"}]}
← {"id":2,"result":{"process":"p_1"}}
→ {"id":3,"op":"await","processes":["p_1"]}
← {"id":3,"result":{"p_1":{...process chunk; body.result → output...}}}
```

Parallel calls are several runs awaited together; fire-and-forget is a run awaited later. Every process chunk exists in the substrate immediately — any program whose boundary admits it can read into a running process and watch.

---

## Reactivity Wiring

How a `subscribe` op becomes a `place_changed` event in the subscribing client.

### The chain

```
db          broadcast::Sender
            (post tx.commit)
  │
  ↓
engine      broadcast::Receiver
            (one per writable attached store)
  │
  ↓
transport   the client's connection
            (a stdio line to a VM program; the protocol channel to any client)
  │
  ↓
client      SDK event handler
            (dispatches by message shape)
```

1. **db.** Each successful write op pushes a `Commit` onto the substrate's broadcast channel after `tx.commit()` returns. Settled in db.md.

2. **engine.** On attaching a writable store, the engine subscribes to that store's `db.subscribe(&[db/commits], ..)`. A background task drains each receiver, filters by the attachment's branch, and runs the dispatcher.

3. **dispatcher.** For each incoming `Commit`, the engine computes the *touched place set* — the union of:
   - `commit.chunks_modified` — chunks whose body, instance contract, or name changed.
   - Both sides of `commit.placements_modified` — places that gained or lost a placement, and chunks whose own placements changed.
   - the link delta — chunks that gained or lost links *to* them, computed in the write transaction and carried **on the live event only**: links are outside history by law, so no stored commit column exists and no historical link index is promised (ruled; a fast index, if ever wanted, is derived data — truth and performance indexes are different things).
   - For each chunk in `chunks_modified`, the places it is currently placed on (all three stored kinds) — so a subscriber on a dimension sees a member's body change. One bulk lookup per commit.

   The dispatcher fires `place_changed` on every subscription whose places intersect the touched set, filtered by the subscriber's boundary.
4. **transport.** A JSON line on the subscriber's own connection — stdin for a VM program, the protocol channel for any other client. What a chassis does with an event inside its realms is its own duty as a client (view/sdk); the engine's delivery ends at the connection.

5. **SDK.** Distinguishes by message shape, routes to the subscription's callback; the read hook re-fetches and re-renders.

### Subscription lifecycle

- `subscribe(ctx, places)` — boundary-checked against the subscriber's read selection. On pass: registered, id returned. On fail: `BOUNDARY_VIOLATION`, delivered by the SDK as the dead-subscription path (sdk.md).

- Subscriptions are owned by the subscribing process; terminal state drops them before further dispatch. (Whether `subscribe` under a bare `{ anchor }` context is judged by the same rule is the call context's open.)

- `unsubscribe(id)` — idempotent removal.

- Boundaries are checked **at subscribe time**, and again only when membership through the frozen expression could have moved (below).

### Race-tolerant delivery

Subscription state and event dispatch are concurrent; the spec tolerates the natural races. Unsubscribe-during-dispatch: the event drops silently. Terminal-during-dispatch: same shape. An event arriving after a local unsubscribe is ignored — the SDK's registry was cleared.

### Subscription invalidation

A run's boundary expression is immutable, but **membership through it is live** — a placement change elsewhere can drop a subscribed place out of what the boundary admits. On every commit the engine re-evaluates the boundaries that commit's delta could disturb; severed subscriptions are removed and `subscription_invalid` fires with a short reason. After that, no further events for the subscription.

Finding them cheaply needs an **index from the dimensions named in boundaries to the boundaries naming them**, so a commit's delta reaches only the candidates instead of scanning every live process. The index is db-level machinery ([`db.md`](db.md)); the engine is its only consumer.

*Open: a `follow`-shaped boundary names one dimension but its membership depends on chunks it never names, so the index under-covers that class. Three candidates — index the closure, exclude transitive boundaries from subscription-backed reach, or scan for that class. A build-time question; not decided.*

### Backpressure

The engine's input from db is a bounded `broadcast::Receiver`. On overflow, a `Lagged` marker arrives; the engine forwards a `lagged` event listing every active subscription id, and the SDK re-fetches. Slow subscribers block nothing — the per-subscription send is non-blocking, and a persistently slow transport drops the subscription with a final `lagged`.

**Coalescing is required, not deferred.** The streaming convention makes commit bursts normal, so multiple commits touching a subscription within a short window fire one `place_changed` (carrying the latest commit). Invisible to correct clients — the contract is re-fetch on event.

### Streaming convention

Intra-op streaming is not in the protocol and doesn't need to be: **streaming is commits.** A program with incremental output commits partial updates to its output chunk with `body.partial: true` at a throttled cadence (~4/s max), finalizing with `partial: false`. Subscribers re-render per coalesced event. Partial states enter the lossless history; when branch-bound runs land (below), partials on the turn's branch keep main clean. This convention stands regardless of how buffers are realized.

---

## Buffers — streams beside the field

Some flow must never become history: an agent's token stream, audio and video, a live transcription, the high-cycle batches on the horizon. Buffers carry it — live flow without commits, inspection *during* a run with history staying clean, durable capture across engine stops, media bytes that never enter the db, and digestion into the field at chosen moments.

**The semantics, independent of realization:**

- **Identity.** A buffer is an ordinary chunk, `instance` on `engine/buffer`, its driver/source kind and retention policy in its body.

- **Frames.** Timestamped, append-only, **commit-free**, and not rebuildable — a third storage class beside the field and derived-rebuildable data, living outside the db. **The db needs nothing.**

- **Taps.** A boundary-checked subscription on a lightweight channel beside `place_changed`.

- **Digestion is the commit.** Using frames commits a reference `{ buffer, from, to }`, pinning the range. Retention is a ring plus pins.

- **Results stay substrate-shaped.** A stream-serving program returns the buffer's identity chunk; stream-ness lives in tap machinery, never in a return type. A live source reaches subscribers in exactly two ways: commit digests (`place_changed`) or a tap.

**v0.1 posture:** streaming-is-commits stands — throttled partials, per *Streaming convention*. The buffer is the ship-early precursor, not its replacement.

*Open — the realization, between two.* **(A) An engine-native driver registry** — `register_buffer_driver(kind, provider)`, the runtime-provider shape; integrations choose storage freely, and the engine ships the default agent driver: an append-only file family in `.ol/` beside the db, durable across engine stops, outside the VM. **(B) Dissolution into live integrations** — no engine machinery at all; a buffer is a reference chunk and a live-integration daemon projects it, never committing while flowing, digestion pinning. The tension that keeps (B) honest: projection presumes a re-readable source, and some streams have none — the agent's own tokens, a live microphone. Someone must retain frames, or digestion has nothing to pin and taps nothing to replay; where that retention duty lives is the deciding question. Tap event shape, buffer-feeding purity, and content-hash pinning ride the same call.

---

## Run and Await Mechanics

### Process state and watchers

The engine holds a per-active-process slot:

```rust
struct ProcessSlot {
    status:  watch::Sender<ProcessStatus>,   // running | done | failed
    spawn:   SpawnHandle,                    // the runtime's child handle
    timeout: Option<JoinHandle<()>>,         // pending timeout future
    config:  RunConfig,                      // resolved boundary, timeout_ms
}
```

`ProcessStatus` is one enum used in-memory and at the substrate body field (as the status value-chunk ref). Slots exist only for started processes — drafts are data, never slotted. The map is `HashMap<ProcessId, ProcessSlot>` under a Mutex; slots are created on start and removed on terminal transition.

### `run` (start)

The slot is inserted *before* the substrate write so `cancel` and `timeout` can always land on a known process id.

1. **The match, boundary construction, and the declaration** (see *What the engine writes at start*).

2. **Insert the slot.** Register the timeout JoinHandle.

3. **`db.commit(declaration)`** — atomic, routed to the owning store. On failure, remove the slot and return the error.

4. **Status check.** If `cancel` or timeout fired between 2–3, skip the spawn and run cleanup (writes `status: failed`, removes the slot). Cleanup always has a substrate chunk to write to, since step 3 completed.

5. **Look up the runtime provider** for the program's `runtime` and call `provider.spawn(SpawnContext { process_id, program, request_tx })`. Provider returns a `RuntimeHandle` with `transport`, `ready`, `terminal`.

6. **Wire signals.** One task awaits `ready` (the run is live); another awaits `terminal` and triggers cleanup.

7. **Return `process_id`.**

The start commit writes `status: running`; the commit-to-spawn gap is engine-internal, never a field state. A cancel landing in the gap is caught at step 4 or by the watcher tasks; the substrate always carries a complete record and `await_processes` resolves to the terminal state.

`cancel(process_id)` is idempotent. A cancel for an unknown or already-terminal process returns `Ok` — the desired state ("not running") holds; callers never race terminal cleanup.

### `await_processes`

```rust
pub async fn await_processes(&self, ctx: &Context, ids: &[ProcessId])
    -> Result<HashMap<ProcessId, ChunkItem>, EngineError>
{
    // 1. Boundary-check each id against ctx.
    // 2. For each id: slot present → watch its receiver; slot absent but
    //    present in the substrate → already terminal, short-circuit.
    // 3. Concurrently await terminal on each receiver.
    // 4. db.get(process_id) for each — the process chunk, result one hop away.
}
```

| Runtime | `done` signal | `failed` signal |
|---|---|---|
| VM | stdout closed AND exit code 0 | stdout closed AND exit ≠ 0; OR `cancel`; OR timeout; OR malformed output |
| Native | The planner's evaluation returns | An evaluation error; OR `cancel`; OR timeout |

Multiple programs may await one process; `watch::Receiver` broadcasts terminal state to every awaiter.

### Cleanup on terminal state

1. **Update the process chunk** — `body.status`, `body.result` (if declared and produced; the result placement check runs here), `body.error?`.

2. **Drop the spawn.** Kill the executable if still alive.

3. **Cancel the timeout** if pending.

4. **Unregister all subscriptions** owned by the process.

5. **Cascade to children.** Every active process owned by this one gets the same terminal transition with `error: 'parent ended'`. Recursive over the engine's own process tree — kill cascades ownership.

6. **Resolve awaiting receivers.**

7. **Remove the slot.**

A child never outlives its parent — its results would be orphaned. The slot's existence is ground truth for "active"; once removed, `await` reads terminal state from the substrate.

---

## Tool Calls Are Just Runs

An agent making a tool call uses the same `run` operation:

1. The agent composes the argument set, committing whatever payload or expression chunks it contains, then calls `run` in child mode.

2. The engine runs the match and writes the child process owned by the agent's process — the trace nests by ownership, one hop at a time; reading the whole tree is a `follow`-shaped expression, not one read.

3. The caps hold: child boundary per the formula, `run` included. The model can never escalate — a start beyond the walls lands as a draft awaiting approval (*Run-to-draft*), never as a run.

4. The engine asks the runtime to spawn and returns the process id immediately; the agent awaits when it needs the result — the process chunk, `result` one hop.

Nothing discourse-shaped is written anywhere — the tool trace *is* the frame; providers wanting message history get it reconstructed from frames as serializer policy ([`agent.md`](agent.md)). Substrate operations (`read`, `resolve`, `commit`, `subscribe`) from the agent are not tool calls — they go directly through the protocol and create no processes.

---

## Traceability

Every commit carries a `process_id` — the run that caused it, or none for machine-context commits. Commits stay in their own table, **per store**; the read layer projects them under the virtual place `db/commits`, federated across attached stores like any read:

- `read([db/commits])` — all commits

- `read([db/commits, processId])` — commits from this run

- `read([db/commits, chunkId])` — commits that modified this chunk

Chunk → commit → process → program: any change walks back to the program that caused it and the person who ran it. A cross-store act appears as its per-store commits, each carrying the same `process_id` — the sequence reassembles by trace. Virtual places accept the parameter shapes listed in [`db.md`](db.md#virtual-chunks-branches-and-commits); unrecognized shapes return empty, never error.

**Commits are rows, and that is what makes them safe as dimensions.** A commit carries message and timestamp; its deltas live in the touched-chunks and touched-placements columns, which the read layer projects as queryable intersections. **The edits are not in a body.** So granting the commits archetype lists history — metadata and touched addresses, never contents; contents come through the chunks, gated as always. A diff is two temporal reads compared, each filtered by the reader's boundary over the chunks themselves. And granting a *single* commit as a dimension makes its touched set readable — "see exactly what this run changed", in one gesture. Kept deliberately.

The consequence for the planner, budgeted rather than assumed: **the commit-touched projection must be admissible in boundary evaluation**, since commit-as-dimension is projection-backed and the delta columns have to be reachable by the single-request grammar ([`db.md`](db.md)).

*Ruled: a projection declares its own ordering — `db/commits` synthesizes position from ancestry depth, and the synthesis is the declaration ([`db.md`](db.md)).*

---

## Runtime providers

Runtime kinds are not built into the engine's law; they are provider crates the engine loads and registers at boot. v0.1 ships two — **`vm`** (`runtime-vm`, the provider crate; the floor for `net`/`fs`/`exec`) and **`native`** (the planner, registered by the engine itself). `webview` retires: programs are headless [P], and what draws is a component, not a process (view).

```rust
pub trait RuntimeProvider: Send + Sync {
    fn spawn(&self, cx: SpawnContext) -> Result<RuntimeHandle, SpawnError>;
}

pub struct SpawnContext {
    pub process_id: ProcessId,
    pub program: ProgramRef,
    pub request_tx: mpsc::Sender<(Context, Request)>,
}

pub struct RuntimeHandle {
    // engine pushes outgoing events
    pub transport: TransportRef,
    // runtime alive → slot Running
    pub ready: oneshot::Receiver<()>,
    // resolves on terminal
    pub terminal: oneshot::Receiver<TerminalReason>,
}
```

The provider drives readiness and terminal on its own schedule; the engine awaits them. No runtime-specific entry points exist on the engine's API.

**Capabilities.** A program's `capabilities` is a closed vocabulary — **`net` · `fs` · `exec`, nothing else** [R]; each has *modes* (`net:host`; `exec` bare in v0.1; `fs` limited to the store directories is one mode, a direction), and they compose parent-to-child by **intersection**. The keychain is an OS citizen reached through them — `read-secret` declares `exec`; secrets are a module, never engine vocabulary and **never chunks** (the substrate is lossless; a committed key would be permanent). Enforcement is the runtime provider's, **at spawn**: egress allowlisted, filesystem and exec gated. Staged honestly: **before the VM lands, capabilities are declared, recorded on the process body, and shown at Go — not enforced.** The OS's own consent stacks on ours. Capabilities are one leg of the purity predicate (*Purity*). (Held open: whether capabilities and integrations are one family — both declare reach into the world outside the field.)

## Containment

Containment is the runtime provider's concern. What the engine guarantees regardless of provider: every substrate operation passes the boundary check, so containment and boundary enforcement compose.

`runtime: vm` programs run inside the Linux VM — the substrate's containment for capability-bearing programs; attached stores' files mount read-only at their store paths, so store-defined programs run from their attached paths in the same VM. What *draws* is never a process: realm containment for components — same-DOM trust, `FrameBox` isolation on `ol://` origins, identity into realms — is the surface host's duty, specced with view (view/sdk, chassis). The engine requires only that `Context` arrives correct on every request; commits attribute to the context's identity.

**Not built, deliberately:** no hole-punching subsystem, no guest-layer protocol. If a program ever demands a native surface it arrives then, as a priced and dated exception, not as architecture in advance ([`horizon.md`](../horizon.md) for the uniform alternative).

---

## Operational Behavior

### Timeouts

`run`'s optional timeout is written to the process body; if omitted, the program's own `timeout_ms` applies. Defaults: tool programs 30000 ms; agent programs 300000 ms. On expiry the engine kills the executable and sets `failed` with `error: 'timeout'`. The clock pauses while the process awaits its own children — a turn delegating a ten-minute sub-agent is idle, not hung.

### Error Classification

Not every error kills a program. Informational errors return as protocol responses; the program continues.

| Condition | Engine response |
|---|---|
| Boundary violation (read, resolve, subscribe, commit) | `BOUNDARY_VIOLATION` response; process continues |
| Spec violation (commit) | `VALIDATION_ERROR` response; process continues |
| Write to protected record | `BOUNDARY_VIOLATION` response; process continues |
| Malformed request | `INVALID_REQUEST` response; process continues |
| Unparseable stdout line | Kill; `failed`, `error: 'protocol: malformed output'` |
| Exec exits non-zero | `failed` |
| Timeout | Kill; `failed`, `error: 'timeout'` |
| VM stdout closes, exit unreadable | `failed`, `error: 'killed'` |

Parse failures and crashes are terminal. Everything else is informational.

### Startup Reconciliation

At start the engine marks every `running` process in writable attached stores `failed` with `error: 'engine restart'` — those executables are gone. Drafts are untouched: they are data, resting where composed. Subscriptions are not persisted; they live in memory and vanish with the engine. Children of failed parents fall out of the cascade rule; no special logic. Read-only attachments are not reconciled — a peer store may carry stale `running` processes from when it was live; they surface as-is.

### Boundary-Request Behavior

An explicit `BOUNDARY_VIOLATION` beats a silently empty read. The engine returns the error when a queried place is not admitted, so empty results mean genuinely empty places, not withheld ones.

*Ruled (2026-08-12): the leak is accepted for v0.1* — a legible failure wins while stores are single-author and attachments are chosen. Under uniform boundary-filtering the error discloses existence: ask for anything, and the difference between "empty" and "violation" tells you whether it is there. Revisit at peering, where strangers gain the probe.

---

## engine/sdk

The engine ships no UI and no framework — [`engine/sdk`](sdk.md) is the protocol expressed as a client library: it serializes calls into the protocol JSON and speaks through the one transport object the environment installed. It ships from the engine's own repository because it is the engine's contract in TypeScript; `view/sdk` and every other client build on it ([`sdk.md`](sdk.md)).

---

## Code architecture

*The built engine implements the linked-crate generation; realignment to the artefact shape is the alignment pass's first engine work. This section states the target at the same altitude as before — no deeper.*

### Module layout

```
engine/
  src/
    lib.rs              — public re-exports
    types.rs            — Context (process_id?, anchor?), RunArgs, RunTarget,
                          Selection, SelectionTerm, ResolveTarget, ProcessId,
                          SubscriptionId, StoreId, AttachRecord, RuntimeKind,
                          ProcessStatus, Event
    errors.rs           — EngineError (single enum); AttachError, RegisterError
    engine.rs           — Engine struct; open/shutdown; the serve loop
    server.rs           — the transport server: accepts client connections,
                          frames JSON lines, attaches Context per connection
    stores.rs           — the attach registry: AttachedStore { db, record };
                          write routing; READ_ONLY_ATTACH enforcement;
                          [engine/attached] projection; federated ref resolution
    sources.rs          — ol:// serving from attached stores at their commits
    runtime.rs          — RuntimeProvider trait; provider loading and the
                          registry; the built-in `native` provider
    bootstrap.rs        — reconcile_zombies: writable attachments only;
                          drafts untouched
    process.rs          — ProcessSlot; SpawnHandle; set_terminal, cascade
    subscription.rs     — Subscription, TransportRef, SubscriptionRegistry
    reactivity.rs       — per-writable-store drain tasks; handle_commit composed
                          from compute_touched, gather_fanout,
                          gather_invalidations, apply
    protocol.rs         — Request | Response | Event JSON shapes; dispatch;
                          tagged-value passthrough; wire ErrorCode mapping
    context.rs          — the call context: chain derivation, effective reach,
                          the machine context; caching
    boundary.rs         — construct (the five sources, per the formula),
                          evaluate (one evaluation over attached stores),
                          admits (the per-answer filter)
    validate.rs         — the match (bind, offers, count, no orphans); entry
                          disjointness at definition; the result placement
                          check; placement and link governance at commit
    expressions.rs      — the expression shapes; parse; plan type-check;
                          compose-time materialization; the planner partition
                          and lowering to db's plan interface
    ops/                — public surface; one module per protocol op
      read.rs resolve.rs get.rs commit.rs run.rs cancel.rs subscribe.rs
      await_processes.rs
  sdk/                  — engine/sdk: the protocol client (sdk.md)
  tests/                — integration tests against the spec
```

Each `ops/*.rs` owns its op end-to-end. Internal modules are flat siblings; one structuring axis (the public ops), one folder. The engine ships **one external runtime provider dependency** — `runtime-vm`, loaded at boot; `native` is its own.

### Within-file shape

Each file composes from small named functions; the public method reads as a top-to-bottom narrative calling private helpers. What earns a comment (per [`conventions.md`](../conventions.md#code)): race semantics, ordering invariants, channel-primitive quirks.

### Key mechanics

**State authority follows lifecycle.** A started process has two homes — its slot (live runtime) and its substrate chunk (durable). The slot is authoritative while active; the substrate once the slot is gone. Authority transfers in one ordered step at terminal: cleanup writes the terminal status, then drops the slot. One truth at any moment; the seam is the cleanup commit.

**Reactivity owns event emission.** The reactivity tasks are the engine's only consumers of the db change feeds and the only emitters of `place_changed` / `lagged` / `subscription_invalid`. Cleanup paths trigger reactivity by writing terminal commits; they never emit events directly.

**Errors as one vocabulary.** One wire surface, one `EngineError` enum; the response builder maps to wire codes via a single `match`.

**Single writer where it matters; locks where it doesn't.** Registries are `Mutex<HashMap>` held only for insert/remove, never across an `await`.

**Async runtime.** The serve loop, reactivity, and per-VM stdio pumps run on tokio; the binary owns its runtime.

### Settled choices

- **Attach registry as `Mutex<HashMap<StoreId, AttachedStore>>`**; `StoreId` = canonical absolute path of the store directory.

- **Runtime registry without dynamic loading** — a HashMap of trait objects, registered at boot.

- **One evaluator over attached stores** [P] — supersedes per-store-evaluate-then-union and the "federation in Rust, not SQL" settled choice; each `Db` stays single-file and portable; broadcasts stay per-db.

- **Single `EngineError` enum** — principled divergence from db's per-op enums, justified by the single wire surface.

- **`tokio::sync::watch`** for `ProcessStatus`; **`broadcast::Receiver`** per writable store's feed; **`mpsc`** for per-VM stdin queues; **`std::sync::Mutex`** for registries.

- **`Engine::shutdown(self)`** consumes self: cancels reactivity, awaits the join, terminal-cleans every active process. `Drop` aborts as best-effort fallback.

- **`thiserror`** with `From<DbError>` / `From<ProtocolError>`.

---

## What Is Open

- **Three selection-typed keys on one contract** — whether substrate.md's "at most one `selection` per contract" binds body keys or only `accepts` entries (*The program body*).

- **The call context's encodings** — how the parent link is derived (containment backrefs vs a stored key); the frame's seat in the generic contract (cap-exempt, processes only); which ops beyond read/write/run are judged under `{ anchor }` (*The call context*).

- **Attach-era encodings** — the dynamic-attach record in the personal store; the attach-time consent chip; the act journal, if a truly atomic cross-store case appears; and **whether attach is transitive** — an attached store's own `[[attach]]` entries attaching in turn (the old cascade recursed, deduped by canonical path, rejected cycles; "dependency is attach" leans that way and nothing restates the mechanics) (*Stores and attach*).

- **The consent chord's principal** — lean: the mount of the draft face (*Run-to-draft*; view).

- **Gestureless starts** — whether a component may ever dispatch a start without a person's gesture; deferred with the daemon posture (*Daemons*).

- **Buffer realization** — the engine-native driver registry or dissolution into live integrations (*Buffers*). Streaming-is-commits is unaffected either way; whether v0.1 streams model responses live is gated on this call, not deferred.

- **Subscription invalidation over transitive boundaries** — the index under-covers `follow`-shaped boundaries (*Subscription invalidation*).

- **Typed-content matching, one mechanism, decided at build** — `loc(X)` (a place whose resolved members are instances of X, checked at the match) *or* coercion (a location binding to `ref(X)` / `set<ref(X)>` by snapshot-resolution at bind). The commit-in-a-slot case needs exactly one of these; not both.

- **`ref(X & Y)` conjunctions** and, if nested conjunction contracts ever appear, most-specific-wins as a bind tiebreak (*`accepts`*). Steward direction, unresolved.

- **Placement governance edges carried from substrate.md** — read-over-the-placed-chunk at birth; who may remove a whole chunk (*Governance at `commit`*).

- **Branch operations over the protocol.** The substrate is fully branch-aware, but the protocol cannot yet create a branch, commit to a named branch, write a merge, or bind a run to a branch. The settled shape when taken: a `branch` op, `Declaration.branch?`, a merge form of `commit`, and a run's branch routing the process and its children to a work branch. Unlocks the acceptance workflow — agent works a branch, human reviews, merge is the yes — and branch-parked streaming partials. Merge semantics ruled (substrate.md, *What's Open*): union of additions, hard fail on true collision, an agent resolves refusals as ordinary work.

- **Resident lifecycle for daemons.** A process whose executable stays resident: its terminal transition is a *policy* (stop, restart), not the end of a job. The launch posture is ruled (*Daemons*); the lifecycle must extend **without a new primitive**, is not v0.1, and must not be foreclosed.

- **Pause/resume.** A control signal honored between cycles of cycle-driven programs — program-level convention first ([`agent.md`](agent.md)); promoted to an engine op only if it generalizes.

- **`explode` — virtual chunks from body keys.** A pure transform projecting a body's keys as virtual chunks, same family as `db/commits`. The principle: pipe output is substrate-shaped, so the algebra composes over results. Materializing is committing the same output — promotion when a query proves hot, never upfront. Lands with the pipe vocabulary.

- **Draft and composition residence edges.** Re-homing on re-run and cross-store drafts settle at the draft build; so does whether process chunks take generated names under substrate.md's naming rule.

- **Schema version skew on attach.** v0.1 refuses to attach stores whose db schema differs; migrating an attached db is v0.2. See [`horizon.md`](../horizon.md).

- **Symmetric peering.** v0.1 remote attachment is fetch-then-attach, read-only. Read-write peering, identity/auth, sync live on horizon; the boundary mechanism already carries the model.
