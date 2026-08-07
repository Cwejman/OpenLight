# Engine

The engine is the authority on running programs against the substrate. A program is a chunk with an executable; to run one is to create a process. The engine creates processes, constructs and enforces boundaries, evaluates expressions, asks runtimes to spawn executables, and mediates every substrate operation a running program attempts. Nothing runs without going through the engine, and no program touches the database directly.

The engine is a Rust crate compiled into the host binary. The host calls engine functions directly — there is no separate engine process and no JSON-lines hop between host and engine. Programs reach those functions through one protocol over two transports — wry IPC for surface programs, stdio JSON-lines for VM programs — identical in shape regardless of transport; the SDK hides the difference. Mechanics are in *The Program Protocol* below and [`sdk.md`](sdk.md).

The engine federates across multiple substrate dbs — one read-write **active project** plus zero or more read-only **mounts**. Programs see one logical field; the engine routes reads and boundary evaluation across all mounts transparently. Reactivity flows only from the active project's commits in v0.1 — read-only mounts have no in-process writer to fire events. See [`pilot.md`](pilot.md#multi-project-mounts) for the project/mount model.

---

## What the Engine Owns

- **Process creation.** Starting a program writes a `process` chunk in one atomic `db.commit()` — its body and connections are defined in *Program and Process*. From start on the process chunk is engine-domain: a running program cannot rewrite its own record.
- **Boundary construction and enforcement.** A run's boundary is a selection expression built at start from the frame, the argument, the program's stated ceiling, explicit additions, and the parent's cap. Every read, write, subscription, and nested start passes it, and filtering is uniform — bodies, membership, adjacency, links, search, counts.
- **Write governance.** Placement and link rules are substrate law; the engine is where they are checked, at `commit`. It also supplies the owner a newborn chunk defaults into.
- **Program lifecycle.** The engine asks the runtime to spawn, tracks status through `running → done | failed` (a `draft` precedes the start and is data, not engine-domain), updates the process chunk as state changes, kills on timeout or cancel. The program itself does not set its status — it simply exits.
- **Expression evaluation.** The engine is the planner. Core verbs are program chunks with `runtime: native`; a chain in the single-request class lowers to one db query; programs never interpret expressions and no author writes SQL.
- **Protocol mediation.** The engine receives every substrate operation a running program attempts, validates it, executes it via the substrate library, returns the result. Programs do not carry database access; the protocol is the boundary.
- **Containment.** The engine asks the registered runtime provider to spawn each program. Containment lives in the provider, not in engine code; engine knows runtime kinds only as registry keys.
- **Mount registry.** The engine holds the active project and all mounted peer projects. Federated reads and boundary evaluation iterate the registry; reactivity subscribes only to read-write mounts (one in v0.1). Writes referencing read-only mounts are rejected. Cross-mount ref validation (substrate.md, *Links*) runs through this registry — the db validates locally resolvable targets only; the engine resolves the rest at commit entry.

## Program and Process

### The program body — a program's interface is its body

`engine/program` is the archetype every runnable thing is `instance` on. Its instance contract types the program body:

```ol
chunk engine/program {
  instance: {
    executable?:   string              — absent for runtime: native
    runtime:       ref(runtime)
    accepts:       list<type>          — required; entries as reified type values
    result?:       ref                 — an archetype; checked at program definition
    read?:         selection           — per key: absent = defers to the run;
    write?:        selection             present = exact ceiling (*Boundaries*)
    capabilities?: set<string>
    timeout_ms?:   number
    grades?:       map<{ wmin?: number, wmax?: number,
                         hmin?: number, hmax?: number }>
    uses?:         set<ref(program)>
    presets?:      set<ref(collation)>
  }
}
```

**Role is conferred by reference.** An archetype is this program's result because the program's body says so. Interface archetypes are found from the program, never by global name or path — every program having an `output` collides nowhere. `uses` names the programs it runs, for the launch surface; `presets` names shipped collations; `grades` declares the size bands a surface offers, read by the seat ([`programs.md`](programs.md)).

Concrete programs — filesystem, shell, model, echo, reader, sidebar — are chunks `instance` on `engine/program`, owned by their project's root.

*Open, owed to the author.* substrate.md's key-type list says **at most one `selection` per contract**; [`selection.md`](research/arc/selection.md) §3 states the same rule of `accepts` **entries**, where two selections would compete for the same elements. `read` and `write` are two selection-typed keys on one contract, so the narrower reading is the one this contract needs. Marked, not decided.

### `accepts` — what a program takes

A program's argument is a **set of typed elements**, matched structurally. `accepts` is a required body key on every program — `[]` is legal and says *takes nothing*, explicitly. Each entry is a type, optionally marked optional, and nothing else:

```ol
program summarize { accepts: [ loc, options? ] }          — one place, required; options allowed
program revert    { accepts: [ set<ref(commit)>, loc? ] } — any number of commits; maybe a place
program sequence  { accepts: [ selection ] }              — the content mouth
program compare   { accepts: [ set<ref(commit), 2> ] }    — symmetric pair
```

Entry types: `ref(X)` · `ref(X & Y)` · `loc` · `expr` · `selection` · a payload archetype · `set<T(,n)?>` · `list<T(,n)?>`.

The rules, plainly:

- **Boundary facts never sit here** — they live in the `read`/`write` keys (*Boundaries*).
- **Entries may not compete for the same elements.** Checked at definition, structurally: the same archetype twice is illegal, and so is value-kind containment (`[loc, selection]` — a selection's elements include locs). What definition *cannot* forecast is multi-typing, since any chunk may carry two instance placements; those ties surface at start and reject (*The match*).
- **Payload discipline.** Same-typed inputs with different roles never appear bare — they ride inside a typed payload chunk whose *keys* are the roles (`diff/pair {old, new}`). Payload archetypes are owned: shared vocabulary by ownership and import, never a global predicate space.
- `set<T>` claims its whole type: an "any number of X" mouth must be the contract's only consumer of X.
- **Primitives never appear as entries.** `string`, `number`, `time`, `markdown` are payload content, living inside chunk bodies. That is what makes matching uniform — "matchable" has exactly one meaning.

One convention feeds three consumers with no duplication: the draft's argument, seated, renders each entry by its matched surface ([`programs.md`](programs.md)); the agent compiles provider tool schemas from the same reified entries ([`agent.md`](agent.md)); expressions type-check plans against them before anything runs.

*Open (steward direction, not author-resolved): `ref(X & Y)` conjunctions — instance on all listed archetypes, the trait case. And, if nested conjunction contracts ever appear, most-specific-wins as a bind tiebreak; incomparable overlaps still reject. Default is strict-reject until real contracts hit the wall.*

### The process

`engine/process` is the archetype every run is `instance` on. Its instance contract types the process body — every key statically typed:

```ol
chunk engine/process {
  instance: {
    argument: selection        — the offered set; frozen at start
    at:       ref(commit)      — the branch head at start, engine-stamped
    status:   ref(status)      — draft | running | done | failed (value chunks)
    result:   ref?             — filled once at completion
    error?:   string           — written by cleanup on a failed transition
    read:     selection        — the run's boundary, frozen as an expression
    write:    selection
  }
}
```

`status` is the substrate's own enum pattern: `engine/status` with four value chunks. Boundary chunks and their `relates` topology are retired — the run's boundary is two typed keys on the body, read in one hop.

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
  owned by: the caller's process (child mode) — or the session (launch, top-level)
  instance on: engine/process, <program>, <caller-supplied places, e.g. the session>
  body: { argument, at, status, result?, read, write }

composition chunks (payloads, expressions cited by the argument)
  owned by: wherever they were composed — the composing process's frame by default
  instance on: their own archetypes

result R
  owned by: P — which is its membership in [self]
  instance on: <the program's result archetype> — nowhere else

children
  owned by: P — the trace; instance on engine/process + their own programs
```

*Open:* re-homing on re-run and cross-project composition settle at the draft build. And substrate.md's naming rule — *a chunk that has members must have a name* — fires on process chunks, which are id-addressed and typically nameless yet own their children and results; either the rule needs an exception or processes need generated names. Carried, not decided.

```
engine/mount  (virtual)
  — Both archetype and instances synthesized by the engine at query time
    from its in-memory mount registry; not stored in any db.
  body carries: project_id, branch, mode, commit?
```

`engine/mount` is a virtual place, in the same family as `db/commits` and `db/branches`. Every chunk surfaced from mount X carries a synthesized `relates` placement on X's mount instance — provenance through native substrate plumbing. Programs can read the mount root to list mounts, or intersect any place with a mount instance to narrow to its chunks.

---

## Expressions — locations, calls, and the planner

The engine owns the expression layer: the data shapes, the written language, their evaluation, and their lowering. Display rules — the spine, pills, the editor — live with the reader ([`programs.md`](programs.md)).

### The shapes

```
location     [my-project, tasks]        — places, intersected; a value kind
call         program(e1, e2, …)         — the parentheses ARE the offered set
expression   one grouped unit — named nodes, its own closure, last unnamed line = out
selection    set<loc | ref | expr>      — substrate.md; purity clause below
```

Two archetypes carry the lifted forms:

```ol
chunk engine/expression {
  instance: { nodes: map, out: string }     — the graph as compressed structure
}

chunk collation {                           — a value; edits branch, nothing deleted
  instance: {
    selections:  list<selection>            — ordered, tab-like
    settings:    map                        — collation-wide only
    predecessor: ref(collation)?            — the collation this was edited from
  }
}
```

**Why a collation holds a list, not a map.** Collation expressions are chunks, and a chunk cannot reference a sibling by a collation-local kv string — its references are refs. So expressions drive each other by direct chunk reference, the kv names lose their one load-bearing function, and members collapse into an ordered `list<selection>`. Display names come from the expression chunks' own optional `name` — field-native and rename-safe. The closure rule no longer reaches across collation siblings — that half retires with the map; names resolve within an expression's own nodes, then outward to its root.

### The written language

Classical calls — no positional-only arguments, no invented sugar:

```ol
summarize([my-project, tasks], options({ max_words: 200 }))
diff(pair({ old: [my-project, tasks] | at(c1), new: [my-project, tasks] }))
sequence([a, b], [c], [d, e])
```

```
bareword              ref — resolves within its own closure outward to its own root;
                      crossing roots always requires the full path (engine/program)
[a, b]                intersection location (value position)
{v1, v2}              set literal
{k: v}                struct literal
archetype({k: v, …})  typed instance literal — a name resolving to an archetype
                      constructs; resolving to a program calls
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

- **Read-native** — verbs with a relational lowering: `at` (time travel as composition), subtraction, `limit`, `where`-over-keys, and `follow` (the citation walk — transitive closure, lowered to a recursive CTE). A chain inside this subset compiles to **one** db query — the boundary filter included, since a boundary is itself a single-request selection and lowers into the same statement.
- **Compute** — `fold`, `group`, anything model-touching: real program runs, fed by lowered sub-chains.

`explode` is unclassified until it lands (*What Is Open*) — a projection of body keys reads as read-native, but nothing has priced its lowering.

Core verbs are ordinary program chunks with **`runtime: native`** and no executable — the engine registers a `native` runtime provider: itself, the planner. Identity and contract are field data; the implementation is plan substitution, so `follow` is discoverable, documentable, and callable like any other program. **Pipe output is substrate-shaped** — chunks-and-placements — so the algebra composes over results, not just stored places.

The cost, named: db.md grows an engine-internal **plan interface** — relational ops plus transitive closure — never program-facing ([`db.md`](db.md)).

**Caching needs no new machinery.** Pipe verbs are pure by law, so a pure chain evaluated at a commit through a boundary is deterministic: memoized on `(normalized expression, boundary, commit)`. The boundary belongs in the key — once membership answers are boundary-filtered, the cache fragments per boundary, and that is a price to budget rather than discover ([`db.md`](db.md)). Invalidation rides the reactivity dispatcher's touched-set computation; materializing a hot expression is the standing `explode` principle. Expression normalization is open (substrate.md, *What's Open*) and load-bearing for these keys.

### Purity — derived, never declared

**Pure means effects confined to the own frame.** A pure program still commits — its result lands in `[self]`, and that is the memoized value.

1. `write: {}` — present and empty: the deliberate purity gesture. One key covers every channel, since static locs and argument references live in the same key.
2. No capabilities. `fs`, `exec` and `net` are world-effects regardless of field writes. This does **not** put the filesystem or network off limits for pure work — external content enters through an integration projecting it into the field; purity is about *this run's* effects, never where the data originated.
3. The engine refuses start-time write additions to a pure program.
4. Transitive: a pure program starting an impure one is rejected at start.

1–2 hold at definition, 3–4 at start. Badges derive from the predicate; a `pure:` flag could only agree or lie. This is the predicate substrate.md's `selection` purity clause names.

**Result production vs placement.** A result is what a run *produced* — frame-only, always. Commits are what it *mutated*. Placing a result onto other places is a second, visible act: declared in the program body, where the targets count into `write` and the program is honestly impure, or performed by the caller within its own reach.

**Automations and the pin.** A selection admits `loc | pure expr` only. Impure chains are **automations** — started processes, viewport-independent; their *results* are field content a selection may include. You seat the output, never the automation. A final call resolving to a *surface* program **pins** the expression: it yields a view rather than data, legal only in seat positions — member, widget, slot — and never referenceable from another expression. Grammar, not purity bookkeeping; purity is asked of the content beneath the pin.

**Dead nodes are legal.** An expression is a composition, not a contract: dormant chains are held alternatives, and an editor must be able to save a broken connection — the editing state *is* the proof. Evaluation is **lazy from `out`**, so dead never computes; **normalization prunes to the live graph**, so cache identity is shared across dead-node variants; **mentions file from the authored whole**, so provenance sees dormant citations correctly. *Strict at contracts, abundant in compositions* — the match rejects orphans; expressions keep their dead.

---

## Boundaries

A run's boundary is a **selection expression** — places, and pure derivations of places — drawn from the **single-request class** of the language above: dimension algebra plus `at`, `where`, `follow`, exactly. A wall must be evaluable instantly and deterministically at every read, so compute has no place in it (substrate.md, *Boundaries*).

The boundary is **constructed at start** and recorded as the process body's `read` and `write`. Five sources:

1. **The frame — `[self]`.** Read and write, always, never declared. Children and results are owned by the process, and that one relation is both their address and their membership in the process's own dimension.
2. **Argument content, read-granted implicitly.** The offer *is* the grant: someone gestured the content into the argument, and that gesture is the consent read needs. **Write is never implicit.**
3. **The program's stated ceiling** — the flat `read` and `write` keys. Per key: absent defers reach entirely to the run; present is exact, and a run may narrow it, never widen it. Members are static locs and **argument references** — an entry's type name, unique by the disjointness rule, or a payload-key path:

   ```ol
   program move {
     runtime: vm
     accepts: [ route ]
     write:   { route.from, route.to }
   }
   chunk move/route { instance: { item: ref, from: loc, to: loc } }
   ```

   At start each reference resolves to the **term chunks** of the bound element — `[a, b]` contributes both; an expression chunk contributes what its mentions name — and is snapshotted into the process record. `read: {}` / `write: {}`, present and empty, is the frame-only program — `model`, `web`, `filesystem`: nothing beyond the frame, enforced rather than promised.
4. **Explicit additions at start** — whatever the starter grants (`RunArgs.read` / `RunArgs.write`). These render as the boundary chips a person sees before Go, and are narrowable there.
5. **The parent's reach, as a cap.** Everything above is intersected with the caller's own boundary. **A cap, never a source** — reach narrows through the call stack and never widens, and detachment (`launch`) does not escape it.

**Content never carries reach.** Structural, not stated: all reach lives in the boundary keys or in explicit additions, never inferred from what happened to match.

**Filtering is uniform.** Bodies, membership answers, adjacency, links and full-text search all pass the boundary, and **counts describe what the boundary admits**. There is no privileged view of a full set, and no distinction between which doors open and what is visible once inside: one selection filters every element of every answer.

**Depth is not implied.** A term admits one hop of membership — `[hallway]` reaches what is placed on the hallway, not what is placed on those. Depth, when wanted, is stated: a `follow`-shaped term in the boundary itself. Reorganizing the ownership tree therefore never reorganizes permission.

**Frozen expression, live membership.** The boundary expression freezes at start; membership through it stays live. A grant over a collection that grows keeps admitting what arrives — a standing licence over a region, not a snapshot. Membership is always current, including under `at`: a temporal read is filtered by the structure as it stands *now* (substrate.md).

**Hygiene, not holes.** Naming a dimension in a boundary — positively or negatively — delegates membership control to that dimension's writers, in both polarities. Permission is a question of hygiene: keep the dimensions you name well-governed.

### Governance at `commit`

Beside the boundary check, the engine applies substrate's write law to every declaration:

- **`owned` and `relates` placements** — creating one requires **write over the dimension and read over the placed chunk**; removing one requires **write over the dimension**, since its stewards curate its member list.
- **`instance` placements are a claim**, not a publication: anyone may claim a type, the archetype untouched (substrate.md, *Who May Write What*). This is why a run may place its own result on the declared result archetype without holding write over it.
- **Links** — a typed ref or a mention requires **read over its target** and nothing more; the fact lands in the author's own body, self-governed.
- **Chunk birth is never placementless.** A declared chunk carrying no `owned` placement is created owned by the running process — the frame default. Owning it elsewhere at birth is an ordinary placement, needing write over that owner.
- **Under `Context::process_id = None`** there is no frame to default into, so a host-initiated declaration must name each new chunk's owner. Chunks with no owner at all exist only through the bootstrap carve-out ([`bootstrap.md`](bootstrap.md)).

*Open, carried from substrate.md and not decided here: creating a placement requires read over the placed chunk, but at birth the chunk does not yet exist to be read — the two rules are stated and never reconciled. And who may remove a whole **chunk**, dropping every placement at once, is unspecified.*

**Protected records.** From start on, the engine rejects any program write that modifies the process chunk itself — status, result, the boundary keys — or the frozen `argument` field.

---

## Lifecycle — draft, the match, start

A process may exist before start — **status `draft`**, its argument under composition. A draft is ordinary field data: written by whoever holds the grant (the seated argument, the palette), substrate-resident (there is no in-memory draft state), resting visibly where it was begun until an explicit gesture deletes it — nothing auto-sweeps. Deleting one deliberately cascades to the composition chunks related solely to it. A draft whose argument cites a previous turn joins that thread's lineage ([`agent.md`](agent.md)). From start on, the process chunk is engine-domain.

### The match

Starting checks the offered argument set against the program's `accepts` — four steps, no search:

1. **Bind.** Each element maps to the one entry it satisfies. Two kinds of check, per the law's union rule — tag membership, then per-tag shape: for value-kind entries (`loc`, `expr`, `selection`) the element must *be* that kind of value; for chunk entries (`ref(X)`, payload archetypes) the element must be *instance on* that archetype. An element satisfying two entries — always multi-typing, which definition cannot forecast — **rejects as ambiguous**, never guessed.
2. **Count.** Required entries satisfied exactly once; optional entries at zero or one.
3. **No orphans.** An element the contract does not recognize refuses the *run*. A start is a consented exchange; unconsumed offerings would be silent lies.
4. **The draft is free.** Anything may sit in a draft's argument, unrecognized elements included; it simply cannot start until the match passes. The match guards the door, not the desk — which is why required entries show as must-fill and optional ones fold away while composing.

Names gave keyed arguments their optionality; **types plus counting** give it to sets, and entry disjointness keeps counting from becoming search. Failure is `VALIDATION_ERROR`, with nothing written.

### Two modes

- **`run` (child).** Composed work. The child is owned by the caller's process — the trace — and cancellation cascades: cancel an agent turn, its in-flight tool calls die with it.
- **`launch` (detached).** The process is owned by the session, not the caller; it survives the launcher. The parent cap still applies at start — detachment never escalates. Everything a surface or the palette initiates.

Surfaces are viewers, never owners: closing a tile unmounts a viewer, it kills nothing. Terminating is always an explicit act.

### What the engine writes at start

Starting — `run` with a program and an argument set, or a consumed draft — is one atomic `db.commit()`:

1. **The match.** Fail → `VALIDATION_ERROR`, nothing written.
2. **The boundary is constructed.** The five sources are assembled and intersected, argument references resolve to their term chunks, and the result is the `read` / `write` expressions. A pure program handed start-time write additions is refused here.
3. **The process chunk** — fresh for a direct start (owned per mode, `instance` on `engine/process`, the program, and each caller-supplied place), or the existing draft flipped. Body written whole: `argument` as offered, `at` stamped to the branch head, `status → running`, `read` / `write` as constructed.
4. **The argument freezes.** From this commit, writes to the process's `argument` field are rejected — consumed.

At completion the mirror check runs: the result chunk must be `instance` on the archetype the program's `result` names; the engine fills `body.result` and flips status in the terminal commit.

Pre-generated ids let the engine reference the process from its own declaration.

**Frozen safety or rolling head.** The record freezes, but the chunks it references live on. The SDK makes the choice explicit: resolving the argument's refs **at the stamped commit** (`at`) is the default — reproducible, exactly what the run was given; following the **living head** is the deliberate choice for programs that want liveness (the reader following its reading). Same temporal machinery, two honest modes ([`sdk.md`](sdk.md)).

**Terminal cleanup never severs the frame.** A terminal process's argument, results, children, and boundary remain readable forever — cleanup writes status, it does not dismantle topology. Re-run clones from dead frames; the process-view autopsies them.

---

## The Program Protocol

One JSON-lines protocol serves every program regardless of where it runs.

**Operations a running program can call on the engine:**

| Operation | Description |
|---|---|
| `read` | Read the intersection of places. Filtered by the read boundary — bodies, membership, adjacency, links, counts, alike. Membership across the three stored kinds plus the `linked` answer, per substrate.md (*Read*). FTS via `ReadOpts.match_`; an **empty places list with `match_`** is a whole-field FTS query, boundary-filtered and federated like any read. Negation via `exclude`. Pagination and body-less projection per substrate.md. |
| `resolve` | Evaluate a location or an expression chunk and return its `ReadResult`. The planner does the work — programs never interpret expressions. Boundary-filtered like `read`; compute verbs in the chain become real runs. |
| `get` | Fetch a single chunk by id. Returns `null` if the chunk does not exist; rejected if outside the read boundary. Honors `at` for temporal point reads. |
| `read_batch` | Multiple tagged `read`/`get` sub-queries resolved together at **one commit snapshot**, each authorized under its own identity (see *Containment*). One request, coherent results — the resolution primitive behind slot-and-hook views (programs.md). |
| `commit` | Write a Declaration. Rejected if the boundary does not admit every touched dimension, and checked against the placement and link rules of *Governance at `commit`*; ref keys validate per substrate.md (federated through the mount registry). `dry_run: true` runs full validation without writing — the live-form affordance. |
| `run` | Start a program. Returns the process id immediately. Takes a program plus an argument set, or a `draft` process id to consume. `mode: 'child' \| 'launch'` per *Lifecycle*. |
| `await` | Wait for one or more processes to reach a terminal state. **Returns each process itself** (the chunk — status, result ref, one hop to the result). The call suspends the calling task; it doesn't block the engine. |
| `cancel` | Request a process's terminal transition. Authorized when the target descends from the caller in the engine's own process tree — the cascade lineage, engine state rather than a reach claim — or when the caller's write boundary admits it. Idempotent. |
| `exit` | The calling program requests its own terminal transition (`done`) — the self-dismissal path for surface programs; trivially safe. |
| `subscribe` | Register on a set of places; returns a subscription id. The engine pushes `place_changed` events when commits touch them. |
| `unsubscribe` | Cancel a subscription by id. |

### Schema

Every request has an `op` and a monotonic `id`. Every response pairs the same `id` with either `result` or `error`.

```jsonl
{"id":1,"op":"read","places":["chunk_abc","chunk_def"],"opts":{"match_":"session today","exclude":["chunk_hidden"],"limit":50}}
{"id":2,"op":"get","chunkId":"chunk_abc","opts":{"at":"...","branch":"...","include":{"body":false}}}
{"id":3,"op":"read_batch","reads":[{"tag":"a","places":["s1"]},{"tag":"b","places":["s2"],"opts":{...}}]}
{"id":4,"op":"commit","declaration":{"chunks":[...]},"dry_run":false}
{"id":5,"op":"run","program":"diff","argument":[{"$ref":"chunk_pair"}],"mode":"child","read":[{"$loc":["their-project"]}],"write":[]}
{"id":6,"op":"run","draft":"p_draft"}
{"id":7,"op":"await","processes":["p_1","p_2"]}
{"id":8,"op":"cancel","process":"p_1"}
{"id":9,"op":"exit"}
{"id":10,"op":"subscribe","places":["my-session"]}
{"id":11,"op":"unsubscribe","subscriptionId":"sub_1"}
{"id":12,"op":"resolve","target":{"$ref":"expr_1"},"opts":{"limit":50}}
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
| `exit` | `{}` — terminal transition follows |
| `subscribe` | `{ subscriptionId: string }` |
| `unsubscribe` | `{}` |

The wire carries the tagged value encoding for typed bodies (`$ref`, `$loc`, `$set`, `$time`, `$md`) — translation is the SDK's job ([`sdk.md`](sdk.md)); the engine validates tags against instance contracts at commit. Argument sets and boundary selections ride the same encoding: `$loc` terms and `$ref` terms, no new tags.

**Errors:**

| Code | Meaning |
|---|---|
| `BOUNDARY_VIOLATION` | Read or write the boundary does not admit |
| `READ_ONLY_MOUNT` | Commit modifies a record resident in a read-only mount (reference alone is legal — see *Read-only enforcement*) |
| `VALIDATION_ERROR` | Declaration fails spec validation — instance-contract key check, ref-target check, the match at start, or the result placement check at completion |
| `NOT_FOUND` | Referenced chunk, program, or subscription does not exist |
| `RUN_FAILED` | A run the program started ended non-zero |
| `INVALID_REQUEST` | Malformed JSON, unknown op, missing fields |
| `TRANSPORT_CLOSED` | The program's transport closed mid-response; the pending call rejects on the SDK side |

### Events

A program receives unsolicited messages from the engine on the same channel it sends requests over. An event has no `id`; it is identified by its `event` field.

| Event | Shape | Meaning |
|---|---|---|
| `place_changed` | `{ event: "place_changed", subscriptionId, commit }` | A commit touched a place this subscription registered on. The SDK re-fetches via `read`. |
| `lagged` | `{ event: "lagged", subscriptionIds: [string] }` | The engine's input channel overflowed; the named subscriptions may have missed events. Re-fetch to recover. |
| `subscription_invalid` | `{ event: "subscription_invalid", subscriptionId, reason }` | A subscribed place fell out of the process's read boundary. The engine has unsubscribed; the SDK treats the subscription as dead. |

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

### Engine API (callable from the host)

The host calls the engine library directly to drive top-level runs from user action and to handle surface protocol messages. VM-program protocol messages reach the same functions through the engine's stdio reader.

```rust
pub struct Engine { /* mounts, processes, subscriptions, runtime registry, ... */ }

pub struct Context {
    pub process_id: Option<ProcessId>,  // None = host-initiated; Some = caller's process
}

/// A selection value: the set unions its terms.
pub struct Selection(pub Vec<SelectionTerm>);

pub enum SelectionTerm {
    Loc(Vec<ChunkId>),                  // an intersection of places — `$loc`
    Ref(ChunkId),                       // one chunk: content, payload, or an
                                        // expression chunk — `$ref`. A stored
                                        // expression is always the chunk form,
                                        // so it needs no variant of its own;
                                        // in a boundary it must lower to the
                                        // single-request class
}

pub struct RunArgs {
    pub target:     RunTarget,          // program + argument set, or a draft to consume
    pub placements: Vec<ChunkId>,       // additional instance places for the new
                                        // process (host passes the session id)
    pub mode:       RunMode,            // child (default) or launch
    pub read:       Selection,          // explicit additions — source 4 of the boundary
    pub write:      Selection,
    pub timeout_ms: Option<u64>,        // overrides program body
}

pub enum RunTarget {
    Start { program: ChunkId, argument: Selection },
    Draft(ProcessId),                   // consume an existing draft process
}

pub enum ResolveTarget { Loc(Vec<ChunkId>), Expr(ChunkId) }

pub enum RunMode { Child, Launch }

pub struct ProjectId(String);           // canonical absolute filesystem path
pub enum MountMode { ReadWrite, ReadOnly }

impl Engine {
    pub fn open() -> Result<(Engine, mpsc::Receiver<HostCmd>), OpenError>;
    pub async fn shutdown(self) -> Result<(), ShutdownError>;

    // mount registry — host calls these at boot, before the first run
    pub fn mount_project(&self, id: ProjectId, db: Arc<Db>, mode: MountMode, branch: BranchName)
        -> Result<(), MountError>;
    pub fn unmount_project(&self, id: &ProjectId) -> Result<(), MountError>;

    // runtime registry — host registers providers at boot
    pub fn register_runtime(&self, kind: RuntimeKind, provider: Arc<dyn RuntimeProvider>)
        -> Result<(), RegisterError>;

    // sync — return immediately
    pub fn read(&self, ctx: &Context, places: &[ChunkId], opts: ReadOpts)
        -> Result<ReadResult, EngineError>;
    pub fn resolve(&self, ctx: &Context, target: &ResolveTarget, opts: ReadOpts)
        -> Result<ReadResult, EngineError>;
    pub fn get(&self, ctx: &Context, chunk_id: &ChunkId, opts: GetOpts)
        -> Result<Option<ChunkItem>, EngineError>;
    pub fn commit(&self, ctx: &Context, decl: Declaration) -> Result<Commit, EngineError>;
    pub fn run(&self, ctx: &Context, args: RunArgs) -> Result<ProcessId, EngineError>;
    pub fn cancel(&self, ctx: &Context, process_id: &ProcessId) -> Result<(), EngineError>;
    pub fn subscribe(&self, ctx: &Context, places: &[ChunkId])
        -> Result<SubscriptionId, EngineError>;
    pub fn unsubscribe(&self, sub_id: SubscriptionId);

    // async — Future resolves on terminal-state transition
    pub async fn await_processes(&self, ctx: &Context, ids: &[ProcessId])
        -> Result<HashMap<ProcessId, ChunkItem>, EngineError>;
}
```

**Boot lifecycle.** Host opens engine (no db yet), registers runtime providers, then mounts projects. The active project is `ReadWrite`; peers `ReadOnly`. Reconciliation of zombie processes (`running` from a previous run) happens on `ReadWrite` mounts only; drafts are data and survive restarts by design.

**The engine is program-agnostic and runtime-agnostic.** It resolves the program's `runtime` ref to a registry key and asks the registered `RuntimeProvider` to spawn — no built-in knowledge of `vm`, `webview`, or `native` beyond the registration.

**`Context::process_id = None`** marks a host-initiated call (the user opening a tile, the host's bootstrap). The engine treats it as admitting everything in the active project for read and write — full reach across mounts is read-only by default. It carries **no frame**, so a host-initiated declaration must name each new chunk's owner. `Some(process_id)` evaluates the run's boundary from the process body's `read` / `write` expressions.

**Federated reads and boundary evaluation.** `read`, `resolve`, and boundary evaluation iterate the mount registry. Reads union and dedupe across mounts; membership answers are filtered by the boundary evaluated across the same set; `follow` over `owned` stops at mount edges, since ownership never crosses mounts (substrate.md); `linked` answers union per-db link tables. Programs see one field. Unresolved roots federate by **intersection**: a root lands in `ReadResult.unresolved` only when no mount resolves it.

**Reactivity is single-source in v0.1.** Only read-write mounts fire commits in-process, and v0.1 has exactly one: the active project. The dispatcher holds one `broadcast::Receiver`, filtered by the active project's branch. When cross-host reactivity or dynamic mount writes land (horizon), the dispatcher extends to more receivers — it's just `select!`.

**Cross-db placements work because dbs are dumb.** A placement stored in db_active can reference an `on` whose chunk lives in db_engine — placements store ULIDs, globally unique. To list `engine/program`'s instances, the engine queries every mount's placements for that place and unions. Validation that needs an archetype's instance contract (ref constraints, the result placement check) reads it from whichever mount holds the archetype. Brokenness — a placement referencing a chunk no mounted db has — surfaces at use time as an unresolved root, not at storage time; the db enforces no placement residency (ruled by spec precedence; substrate.md, *Peers*). Status, honestly: the anchor-row bridge built while db still required residency (`engine/src/mounts.rs`) is still in the code although its stated reason is gone; retirement queued.

**Sharing places across projects.** The archetype is the unification point. Place `instance` on a shared archetype defined in a peer everyone mounts — instances from every mounting project surface together in queries against it. Place on your own archetype to isolate. This is the mechanism `engine/program` already uses: every project's programs are placed there and discoverable across the field.

**Federation cost is O(N) per resolution**, N = mount count. For v0.1's 3–5 mounts, negligible. A lazily populated `chunk_id → mount_id` index is the natural optimization at larger N; not v0.1 work.

**Single-host-per-db.** Each `Db` owns its own in-process broadcast. Two host processes on one db file are not connected; cross-host reactivity is horizon.

**Boot-time validation.** Before entering the event loop the host asks the engine to validate the active project: every placement's `on` must resolve in some mount. The engine returns unresolved references; the host surfaces them and refuses to run half-loaded.

**Read-only enforcement.** A commit is rejected with `READ_ONLY_MOUNT` only when it **modifies a record resident in** a read-only mount. Placements and refs stored in the active db whose targets resolve to mounted chunks are legal — the federation pattern depends on exactly this. Reference is not modification. Checked at commit entry, before validation.

**Sync vs async.** The substrate is sync (SQLite is sync), so `read`, `resolve`, `get`, `commit`, `run`, `subscribe`, `unsubscribe`, `cancel` and the mount ops return without awaiting — a `resolve` whose chain contains compute verbs returns after those sub-runs complete, which is why the planner keeps compute out of boundary grammar. `await_processes` and `shutdown` are async. Outgoing event delivery to surfaces rides the `HostCmd` channel returned at `Engine::open`.

---

## Reactivity Wiring

How a `subscribe` op becomes a `place_changed` event in the calling program.

### The chain

```
db                    engine                    transport               program
──                    ──────                    ─────────               ───────
broadcast::Sender ─→  broadcast::Receiver  ─→   wry IPC channel    ─→   SDK event handler
(post tx.commit)      (one, from               (per window)             (dispatches by
                       db.subscribe                                      message shape)
                       at engine startup)
                                                stdio JSON lines
                                                (per VM program)
```

1. **db.** Each successful write op pushes a `Commit` onto the substrate's broadcast channel after `tx.commit()` returns. Settled in db.md.

2. **engine.** On `mount_project` for a `ReadWrite` mount, the engine subscribes to that mount's `db.subscribe(&[db/commits], ..)`. A background task drains the receiver, filters by the mount's branch, and runs the dispatcher.

3. **dispatcher.** For each incoming `Commit`, the engine computes the *touched place set* — the union of:
   - `commit.chunks_modified` — chunks whose body, instance contract, or name changed.
   - Both sides of `commit.placements_modified` — places that gained or lost a placement, and chunks whose own placements changed.
   - `commit.links_modified` — chunks that gained or lost links *to* them (the link delta, computed in the write transaction).
   - For each chunk in `chunks_modified`, the places it is currently placed on (all three stored kinds) — so a subscriber on a dimension sees a member's body change. One bulk lookup per commit.

   The dispatcher fires `place_changed` on every subscription whose places intersect the touched set, filtered by the subscribing process's boundary.

4. **transport.** Surface: the engine asks the host (main thread, as wry requires) to `evaluate_script("__sdk.event(<json>)")` against the window's shell document, which routes to the addressed slot. VM: a JSON line to the child's stdin.

5. **SDK.** Distinguishes by message shape, routes to the subscription's callback; `useRead` re-fetches and re-renders.

### Subscription lifecycle

- `subscribe(ctx, places)` — boundary-checked against the process's read selection. On pass: registered, id returned. On fail: `BOUNDARY_VIOLATION`, delivered by the SDK as the dead-subscription path (sdk.md).
- Subscriptions are owned by the calling process; terminal state drops them before further dispatch.
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

*Open — the realization, between two.* **(A) An engine-native driver registry** — `register_buffer_driver(kind, provider)`, the runtime-provider shape; integrations choose storage freely (files, object stores, compression, no lock-in), and the host ships the default agent driver: an append-only file family in `.ol/` beside the db, durable across engine stops, outside the VM. **(B) Dissolution into live integrations** — no engine machinery at all; a buffer is a reference chunk and a live-integration daemon projects it, never committing while flowing, digestion pinning. The tension that keeps (B) honest: projection presumes a re-readable source, and some streams have none — the agent's own tokens, a live microphone. Someone must retain frames, or digestion has nothing to pin and taps nothing to replay; where that retention duty lives is the deciding question. Tap event shape, buffer-feeding purity, and content-hash pinning ride the same call.

---

## Run and Await Mechanics

### Process state and watchers

The engine holds a per-active-process slot:

```rust
struct ProcessSlot {
    status:  watch::Sender<ProcessStatus>,   // running | done | failed
    spawn:   SpawnHandle,                    // child process, or surface handle
    timeout: Option<JoinHandle<()>>,         // pending timeout future
    config:  RunConfig,                      // resolved boundary, timeout_ms
}
```

`ProcessStatus` is one enum used in-memory and at the substrate body field (as the status value-chunk ref). Slots exist only for started processes — drafts are data, never slotted. The map is `HashMap<ProcessId, ProcessSlot>` under a Mutex; slots are created on start and removed on terminal transition.

### `run` (start)

The slot is inserted *before* the substrate write so `cancel` and `timeout` can always land on a known process id.

1. **The match, boundary construction, and the declaration** (see *What the engine writes at start*).
2. **Insert the slot.** Register the timeout JoinHandle.
3. **`db.commit(declaration)`** — atomic. On failure, remove the slot and return the error.
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
| Surface | The `exit` op; OR the seat unmounts (the person closes the tile) | `cancel`; OR timeout |
| Native | The planner's evaluation returns | An evaluation error; OR `cancel`; OR timeout |

Multiple programs may await one process; `watch::Receiver` broadcasts terminal state to every awaiter.

### Cleanup on terminal state

1. **Update the process chunk** — `body.status`, `body.result` (if declared and produced; the result placement check runs here), `body.error?`.
2. **Drop the spawn.** Kill the executable / unmount the surface if still alive.
3. **Cancel the timeout** if pending.
4. **Unregister all subscriptions** owned by the process.
5. **Cascade to children.** Every active process owned by this one gets the same terminal transition with `error: 'parent ended'`. Recursive over the engine's own process tree.
6. **Resolve awaiting receivers.**
7. **Remove the slot.**

A child never outlives its parent — its results would be orphaned. The slot's existence is ground truth for "active"; once removed, `await` reads terminal state from the substrate.

---

## Tool Calls Are Just Runs

An agent making a tool call uses the same `run` operation:

1. The agent composes the argument set, committing whatever payload or expression chunks it contains, then calls `run` in child mode.
2. The engine runs the match and writes the child process owned by the agent's process — the trace nests by ownership, one hop at a time; reading the whole tree is a `follow`-shaped expression, not one read.
3. The caps hold: child boundary ⊆ agent boundary ∩ the tool's stated ceiling. The model can never escalate.
4. The engine asks the runtime to spawn and returns the process id immediately; the agent awaits when it needs the result — the process chunk, `result` one hop.

Nothing discourse-shaped is written anywhere — the tool trace *is* the frame; providers wanting message history get it reconstructed from frames as serializer policy ([`agent.md`](agent.md)). Substrate operations (`read`, `resolve`, `commit`, `subscribe`) from the agent are not tool calls — they go directly through the protocol and create no processes.

---

## Traceability

Every commit carries a `process_id` — the run that caused it, or null for host-level commits. Commits stay in their own table; the read layer projects them under the virtual place `db/commits`:

- `read([db/commits])` — all commits
- `read([db/commits, processId])` — commits from this run
- `read([db/commits, chunkId])` — commits that modified this chunk

Chunk → commit → process → program: any change walks back to the program that caused it and the person who ran it. Virtual places accept the parameter shapes listed in [`db.md`](db.md#virtual-chunks-branches-and-commits); unrecognized shapes return empty, never error.

**Commits are rows, and that is what makes them safe as dimensions.** A commit carries message and timestamp; its deltas live in the touched-chunks and touched-placements columns, which the read layer projects as queryable intersections. **The edits are not in a body.** So granting the commits archetype lists history — metadata and touched addresses, never contents; contents come through the chunks, gated as always. A diff is two temporal reads compared, each filtered by the reader's boundary over the chunks themselves. And granting a *single* commit as a dimension makes its touched set readable — "see exactly what this run changed", in one gesture. Kept deliberately.

The consequence for the planner, budgeted rather than assumed: **the commit-touched projection must be admissible in boundary evaluation**, since commit-as-dimension is projection-backed and the delta columns have to be reachable by the single-request grammar ([`db.md`](db.md)).

*Open: `db/commits` is read as an ordered place, but `seq: true` is a stored flag on an archetype and `db/commits` is projection-backed — a projected archetype cannot carry one. Unreconciled.*

---

## Runtime providers

Runtime kinds are not built into the engine; they are plugged in at boot via `register_runtime(kind, provider)`. v0.1 ships three — VM, surface, and `native` (the planner, registered by the engine itself); VM and surface are implemented in the host crate.

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
    pub transport: TransportRef,                       // engine pushes outgoing events
    pub ready: oneshot::Receiver<()>,                  // runtime alive → slot Running
    pub terminal: oneshot::Receiver<TerminalReason>,   // resolves on terminal
}
```

The provider drives readiness and terminal on its own schedule; the engine awaits them. No runtime-specific entry points exist on the Engine API.

**Capabilities and secrets.** A program's `capabilities` is a small vocabulary — `net[:host]`, `fs`, `exec`, `secret:<NAME>` — **enforced by the runtime provider at spawn**: egress allowlisted, filesystem and exec gated, secrets injected as env vars from a host-held keychain. Secrets are **never chunks** — the substrate is lossless; a committed key would be permanent. The effective capability set is recorded on the process body for inspection. Capabilities are also one leg of the purity predicate (*Purity*). (Held open: whether capabilities/secrets and integrations are one family — both declare reach into the world outside the field.)

## Containment

Containment is the runtime provider's concern. What the engine guarantees regardless of provider: every substrate operation passes the boundary check, so containment and boundary enforcement compose.

**One compositor.** There is one compositor — the web tree. The host's visual duty is a single rect: one webview per window, holding one shell document, with every surface program authored as DOM inside it. Rust keeps window, OS input, the VM and capabilities, the keychain, the engine, and `ol://` serving. Per-tile webviews, transparent-webview tricks and host-cast chrome dissolve with that ruling, and arrangement becomes one language floor to ceiling — a tile tree, a collation, and a slot are the same kind of thing at three altitudes ([`programs.md`](programs.md)).

Three containment tiers, by the wall each gives a program:

| Tier | Wall | Transport |
|---|---|---|
| Same-DOM slot | none — shared realm, shared fate | the parent's channel, with a per-slot identity token |
| Iframe slot | real — separate global on an `ol://<program-id>` origin; out-of-process on Chromium | host-direct token injection: a parent may *gate* a citizen but never read, drop, or forge its traffic |
| VM program | the Linux VM | stdio JSON lines |

**Identity is per process, not per transport.** One physical transport carries several protocol identities: each citizen's SDK instance holds a slot identity token issued at slot creation and stamped on every request; the host maps token → process id before attaching `Context`. Each citizen is its own process — boundaries and commit attribution hold at slot granularity. The forge risk is the load-bearing one: commits attribute to process identity engine-side, so parent-mediated tokens would let a parent write history *as* its citizen. Host-direct injection closes it; mechanics are host.md's and sdk.md's, and the engine requires only that `Context` arrives correct.

`runtime: vm` programs run inside the active project's Linux VM — the substrate's containment for capability-bearing programs; peer projects' filesystems mount read-only at `/peers/<project-id>/`, so peer-defined programs run from their mounted paths in the same VM. `runtime: webview` programs — surface programs — are contained by the realm their seat gives them, same-DOM or iframe, together with the engine's boundary enforcement.

**Not built, deliberately:** no host tile-walker, no hole-punching subsystem, no guest-layer protocol. If a program ever demands a native surface it arrives then, as a priced and dated exception, not as architecture in advance. The uniform alternative — every program in one VM with DOM streamed to the host — is architecturally cleaner and heavier engineering; it belongs on the horizon ([`horizon.md`](../horizon.md)). The same program/process/boundary primitives serve both paths, so the migration stays reachable.

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
| Surface destroyed mid-response | Pending request rejects `TRANSPORT_CLOSED` SDK-side; engine cancels the process if not already terminal |

Parse failures and crashes are terminal. Everything else is informational.

### Startup Reconciliation

At start the engine marks every `running` process `failed` with `error: 'engine restart'` — those executables are gone. Drafts are untouched: they are data, resting where composed. Subscriptions are not persisted; they live in memory and vanish with the engine. Children of failed parents fall out of the cascade rule; no special logic.

### Boundary-Request Behavior

An explicit `BOUNDARY_VIOLATION` beats a silently empty read. The engine returns the error when a queried place is not admitted, so empty results mean genuinely empty places, not withheld ones.

*Open — the existence oracle.* Under uniform boundary-filtering that error discloses existence: ask for anything, and the difference between "empty" and "violation" tells you whether it is there. The two exits are to narrow the error into something non-disclosing, or to accept the leak as the price of a legible failure. The behavior above stands as written until the author rules; it is recorded here as a known leak, not a settled design.

---

## Client Library

The engine exposes only Rust functions; it ships no TS client. Programs reach those functions through the SDK, which serializes calls into the protocol JSON and selects the transport. The SDK ships from the engine crate ([`engine/sdk/`](../engine/sdk/)) because it is the engine's protocol expressed as TypeScript; surface and transports in [`sdk.md`](sdk.md).

---

## Code architecture

### Module layout

```
engine/
  src/
    lib.rs              — public re-exports
    types.rs            — Context, RunArgs, RunTarget, Selection,
                          SelectionTerm, ResolveTarget, ProcessId, SubscriptionId,
                          ProjectId, MountMode, RuntimeKind, ProcessStatus, Event,
                          HostCmd, plus Display/From impls
    errors.rs           — EngineError (single enum); MountError, RegisterError
    engine.rs           — Engine struct; open returns (Engine, mpsc::Receiver<HostCmd>);
                          shutdown(self); impl Drop
    mounts.rs           — MountedProject { db, mode, branch }; the registry;
                          read-only enforcement; federated ref resolution
    runtime.rs          — RuntimeProvider trait; SpawnContext, RuntimeHandle;
                          the runtime registry; the built-in `native` provider
    bootstrap.rs        — reconcile_zombies(&Db): one read, one commit.
                          Read-write mounts only; drafts untouched.
    process.rs          — ProcessSlot; SpawnHandle enum; set_terminal, cascade
    subscription.rs     — Subscription, TransportRef, SubscriptionRegistry
    reactivity.rs       — loop_task; handle_commit composed from compute_touched,
                          gather_fanout, gather_invalidations, apply
    protocol.rs         — Request | Response | Event JSON shapes; dispatch_request;
                          tagged-value passthrough; wire ErrorCode mapping
    boundary.rs         — construct (the five sources, intersected at start),
                          evaluate (a selection against the mounts, federated),
                          admits (the per-answer filter)
    validate.rs         — the match (bind, count, no orphans); entry disjointness
                          at program definition; the result placement check;
                          placement and link governance at commit
    expressions.rs      — the expression shapes; parse (recursive descent);
                          plan type-check against accepts; compose-time
                          materialization; the planner partition and lowering
                          to db's plan interface
    ops/                — public surface; one module per Engine method
      read.rs resolve.rs get.rs commit.rs run.rs cancel.rs subscribe.rs
      await_processes.rs
  tests/                — integration tests against the spec
```

Each `ops/*.rs` owns its method end-to-end via `impl Engine`. Internal modules are flat siblings; one structuring axis (the public ops), one folder. The engine crate ships **zero external runtime implementations** — VM and surface providers live in the host crate and register at boot; only `native` is the engine's own.

### Within-file shape

Each file composes from small named functions; the public method reads as a top-to-bottom narrative calling private helpers. What earns a comment (per [`conventions.md`](../conventions.md#code)): race semantics, ordering invariants, channel-primitive quirks.

### Key mechanics

**State authority follows lifecycle.** A started process has two homes — its slot (live runtime) and its substrate chunk (durable). The slot is authoritative while active; the substrate once the slot is gone. Authority transfers in one ordered step at terminal: cleanup writes the terminal status, then drops the slot. One truth at any moment; the seam is the cleanup commit.

**Reactivity owns event emission.** The reactivity task is the engine's only consumer of the db change feed and the only emitter of `place_changed` / `lagged` / `subscription_invalid`. Cleanup paths trigger reactivity by writing terminal commits; they never emit events directly.

**Surface transport as commands.** wry/tao machinery is main-thread and `!Send`; the engine never holds a `WebView`. `Engine::open` returns `(Engine, mpsc::Receiver<HostCmd>)`; the host drains the receiver on its event loop and translates each `HostCmd` (`MountWebview`, `UnmountWebview`, `EvaluateScript`) into a wry call. Under one compositor these mount and unmount a program's seat *inside* the window's single shell document rather than creating a native webview per program — the command names are due a sweep with host.md. The engine's only seam to non-`Send` code, expressed as data.

**Errors as one vocabulary.** One wire surface, one `EngineError` enum; the response builder maps to wire codes via a single `match`.

**Single writer where it matters; locks where it doesn't.** Registries are `Mutex<HashMap>` held only for insert/remove, never across an `await`.

**Async runtime.** Reactivity and per-VM stdio pumps run on tokio via a `Handle` stored at `open`; the host calls `Engine::open` inside its tokio context.

### Settled choices

- **Mount registry as `Mutex<HashMap<ProjectId, MountedProject>>`.**
- **Runtime registry without dynamic loading** — a HashMap of trait objects, registered at boot.
- **`ProjectId` = canonical absolute filesystem path.**
- **Federation in Rust, not SQL.** Each `Db` stays single-file and portable; broadcasts stay per-db.
- **Single `EngineError` enum** — principled divergence from db's per-op enums, justified by the single wire surface.
- **`HostCmd` channel** as the host seam; commands as data.
- **`tokio::sync::watch`** for `ProcessStatus`; **`broadcast::Receiver`** for the db feed; **`mpsc`** for `HostCmd` and per-VM stdin queues; **`std::sync::Mutex`** for registries.
- **`Engine::shutdown(self)`** consumes self: cancels reactivity, awaits the join, terminal-cleans every active process. `Drop` aborts as best-effort fallback.
- **`thiserror`** with `From<DbError>` / `From<ProtocolError>`.

---

## What Is Open

- **The existence oracle** — `BOUNDARY_VIOLATION` versus a silently empty read, under uniform filtering (*Boundary-Request Behavior*). Owed to the author.
- **Two selection-typed keys on one contract** — whether substrate.md's "at most one `selection` per contract" binds body keys or only `accepts` entries (*The program body*).
- **Buffer realization** — the engine-native driver registry or dissolution into live integrations (*Buffers*). Streaming-is-commits is unaffected either way; whether v0.1 streams model responses live is gated on this call, not deferred.
- **Subscription invalidation over transitive boundaries** — the index under-covers `follow`-shaped boundaries (*Subscription invalidation*).
- **Typed-content matching, one mechanism, decided at build** — `loc(X)` (a place whose resolved members are instances of X, checked at the match) *or* coercion (a location binding to `ref(X)` / `set<ref(X)>` by snapshot-resolution at bind). The commit-in-a-slot case needs exactly one of these; not both.
- **`ref(X & Y)` conjunctions** and, if nested conjunction contracts ever appear, most-specific-wins as a bind tiebreak (*`accepts`*). Steward direction, unresolved.
- **`seq: true` on projected archetypes** — `db/commits` is read as ordered and cannot carry a stored flag (*Traceability*).
- **Placement governance edges carried from substrate.md** — read-over-the-placed-chunk at birth; who may remove a whole chunk (*Governance at `commit`*).
- **Branch operations over the protocol.** The substrate is fully branch-aware, but the protocol cannot yet create a branch, commit to a named branch, write a merge, or bind a run to a branch. The settled shape when taken: a `branch` op, `Declaration.branch?`, a merge form of `commit`, and a run's branch routing the process and its children to a work branch. Unlocks the acceptance workflow — agent works a branch, human reviews, merge is the yes — and branch-parked streaming partials. Merge semantics ruled (substrate.md, *What's Open*): union of additions, hard fail on true collision, an agent resolves refusals as ordinary work.
- **Daemons (services).** A process whose executable stays resident. The lifecycle must extend without a new primitive: a daemon's terminal transition is a *policy* (stop, restart), not the end of a job. Not v0.1; must not be foreclosed. The engine-as-daemon direction ([`horizon.md`](../horizon.md)) is where resident programs get a home outliving any window.
- **Pause/resume.** A control signal honored between cycles of cycle-driven programs — program-level convention first ([`agent.md`](agent.md)); promoted to an engine op only if it generalizes.
- **`attach` — demoted.** Typed refs are the honest channel `attach` existed to provide: an argument element that references an existing chunk is a ref, validated, link-indexed, boundary-gated. Re-examine what narrow case remains before building anything.
- **`explode` — virtual chunks from body keys.** A pure transform projecting a body's keys as virtual chunks, same family as `db/commits`. The principle: pipe output is substrate-shaped, so the algebra composes over results. Materializing is committing the same output — promotion when a query proves hot, never upfront. Lands with the pipe vocabulary.
- **Draft and composition residence edges.** Re-homing on re-run and cross-project drafts settle at the draft build; so does whether process chunks take generated names under substrate.md's naming rule.
- **Schema version skew on peer mount.** v0.1 refuses to mount peers whose db schema differs; migrating a mounted db is v0.2. See [`horizon.md`](../horizon.md).
- **Stale process chunks in peer dbs.** A peer may carry `running` processes from when it was active. v0.1 does not reconcile them (peers are read-only); they surface as-is.
- **Symmetric peering.** v0.1 mounts are read-only, local-filesystem. Read-write peering, remote mounts, identity/auth, sync live on horizon; the boundary mechanism already carries the model.
