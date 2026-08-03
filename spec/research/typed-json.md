# Typed JSON — the designs charted

> Superseded for the settled statement by [`typed-bodies.md`](typed-bodies.md) — read that; this file remains the archived design exploration behind it.

> **Digest (author-length).** (1) Typing keys ≠ bodies-become-placements; the second is already illegal under the substrate's own rulings (one home per fact, grain). (2) Typing keys costs one new spec field — `keys` — which would also close the markdown-tag and well-known-vocabulary opens: three opens, one ruling. (3) The predecessor citation needs none of it: a connection chunk instance-on-new, relates-on-old works today. (4) `attach` mostly evaporates once typed keys exist. (5) The one deciding question: does anything need target-side discovery ("who points at this?") — if no, typing keys suffices; if yes, keys must project as derived placements (standing `explode`) with reactivity designed up front. Relates is not removed — typed keys take program data; relates keeps aboutness; prose is the open end of the same spectrum.

Research pass on the pressure named in [`horizon.md`](../../horizon.md) *Typed JSON — chunk references in bodies* (2026-08-03, mandated charting; no rulings — everything here is input to author dialog). The mandate: map the genuinely different designs behind "typed JSON bodies," including the author's flag that **typing the JSON and decomposing bodies into placements are not the same thing**, and the containment question ("currently the only way to have program/output is through instance of, or if they come from the same module in peering"). Ground: substrate.md, engine.md (§What Is Open — `attach`, `explode`), programs.md §1/§3.5, agent.md (context items), [`threads-dialog.md`](threads-dialog.md) (grain principle, the correction stretch's two opens), [`threads.md`](threads.md) §4–5 (lean substrate, explode), [`union-accepts.md`](union-accepts.md) (composition + federation gap).

---

## 1. The pressure, assembled

The live cases, with what each actually needs:

| Case | Where | Mutable? | Needs typing? | Needs target-side discovery? | Needs enforcement? |
|---|---|---|---|---|---|
| **Current-collation pointer** | reading → collation (programs.md §3.5) | yes — moves per edit | yes (which relates is "current"?) | unclear — see §7 | mild (must be a collation) |
| **Predecessor citation** | collation → collation (§3.5, open) | no — set at creation, value semantics | yes (relates is untyped) | yes-ish — the lineage walk wants "all citations" as a query | mild |
| **Reference arguments** | argument body → target chunk (programs.md §1; R12 `attach`, engine.md open) | no — arguments immutable | yes — "ids-in-body carry no type and bypass the composed `accepts`" | sometimes (hand-off visible in the graph is `attach`'s stated point) | yes — the load-bearing case |
| **Context items** | `body: { source, at, projection }` + `relates` on source (agent.md) | no | yes | **yes, proven** — consumption tagging is the load-bearing reverse query | recorded, not enforced |
| Lesser instances | `control.target`, `host/session.current-tab`, form's chunk-reference picker fields, `[[chunk-id]]` inside prose strings | mixed | yes | mostly no | picker validation wants it |

Two axes separate the cases: **mutability** (a moving pointer vs an immutable citation vs a frozen argument) and **who must find the reference from the target side**. The context item is the only case where the reverse query is demonstrably load-bearing — and it already solves it with the hybrid (body carries role + commit pin; relates carries the reverse index). Note a spec-internal wobble worth surfacing: programs.md §3.5 justifies the reading's relates by *typing* ("bodies cannot hold typed chunk ids yet"), while horizon.md ties the workaround's dissolution to *projection* ("whether reference-typed keys project as placements, which would dissolve the relates workaround"). The two justifications are different designs' jobs — see §7.

`[[mentions]]` sit below key grain (ids inside a string value); no schema-per-key design reaches them — they belong to the content-type register open (board Next 9), noted and set aside.

## 2. The designs

- **D0 — status quo.** Relates workarounds for pointers; hybrid (body + relates) for context items; opaque id-strings for arguments; `body.schema` as documentation only. A variant worth naming, **D0+**: formalize by convention — the archetype's body documents what its instances' relates mean ("a reading's single relates is its current collation"). Costs nothing, enforces nothing, and collapses the moment a chunk carries two relates.

- **D1 — schema-level reference typing.** The spec language grows one field: per-key type declarations on body keys, including `ref` (optionally archetype-constrained). Bodies stay truth; id-strings stay id-strings; the system validates on write and readers/SDK resolve knowingly. The substrate *already* reaches into bodies — `required` and `unique` are body-key obligations — so this is per-key **value** typing on an existing reach, not a new kind of reach. Two placement types untouched.

- **D1b — ref keys project as placements.** Separable extension of D1: declared ref keys are surfaced as derived relates-grade placements (virtual at the read layer like `db/commits`/`engine/mount`, or a system-maintained index table). Body remains the one truth; the placement is derivation. Structurally this is **`explode` restricted to ref keys and promoted to a standing index** — the exact promotion pattern the lean-substrate ruling sanctions ("materialize when a query proves hot, never upfront," threads.md §4–5).

- **D2 — full decomposition.** Bodies dissolve into placements; values become chunks; chunk-valued fields are placements to existing chunks. The author's flagged "major step." One grain everywhere; `explode`/`implode` become moot because everything is pre-exploded.

- **D3 — intermediary/connection chunks as typed edges.** The substrate's own pattern (turing → chunk-about-princeton → princeton): a chunk placed on both ends, `instance` on an edge archetype for typing, meaning/params in its body. Found variant worth recording: **direction by placement-type asymmetry** — the citation chunk placed `instance` on the citing collation (it is part of the new collation's record) and `relates` on the cited one (it is about the predecessor). Direction carried by existing semantics, no `{from, to}` ids-in-body smuggled back in.

- **D4 — `attach` (engine-level).** `RunArgs.attach: ChunkId[]` — the engine places existing chunks `instance` on the new process; composed `accepts` types them; boundary-checked at spawn. Not a substrate change; resolves reference *arguments* only.

- **D5 — labeled placement (found design).** A placement gains an optional role key (`relates` with `key: "current"`, or a third placement type), possibly spec-validated (`refs: { current: { target: collation } }`). Typed edges without intermediary chunks.

## 3. The chart

### D1 — schema-level typing

- *Simplicity:* four spec fields → five. Sanctioned by substrate.md §What's Open ("the vocabulary may grow through use"). Strong consolidation available: the queued **content-type register** (markdown tag on scalars) and **well-known key vocabulary** (`time`, `name`, `status`) are the same shape — per-key declarations — so one `keys` field with type entries (`ref`, `markdown`, `number`, …) closes three queued opens with one ruling (threads-dialog.md already notes "one future ruling covers both").
- *Validation / write path:* shape check (ULID) is local and cheap. Archetype constraint requires resolving the target's `instance` placements — exactly the federated read the engine's `accepts` pre-validation already does; it inherits the same federation gap (union-accepts.md §Consequences). **Dangling must be legal**: placements may dangle by design (substrate.md §Peers), and a db must stay portable — a write-time existence requirement would make commits environment-dependent. So: shape enforced always; archetype constraint enforced when the target resolves, surfaced as unresolved-style metadata when it doesn't. *Open:* whether that when-resolvable enforcement is honest enough, or constrained refs should forbid dangling.
- *Composition:* the new field needs a composition rule like the others — union of key maps is the natural fold; per-key conflict between contributing specs (two archetypes declare the same key differently) is *open* (reject on write vs per-spec judgment, mirroring the accepts ambiguity rule).
- *Queries / FTS / grain:* no change to scope algebra — refs stay invisible to intersection until projected (D1b) or exploded. FTS already tokenizes ids in bodies (unicode61; a ULID is one token), so `match_` on an id is an accidental reverse lookup today; D1 neither helps nor harms it. Grain: **restores the grain rule's integrity** — current-collation returns to a body key (state → body key, no more author-flagged exception), and `explode` gains the schema it needs to project ref keys as real edges rather than string-valued virtual chunks.
- *Reactivity:* a body rewrite fires on the referencing chunk and its scopes — same as today. What is *lost* relative to the relates workaround: the target side no longer hears (a placement change touches both sides; a body change touches one). Only matters where someone subscribes on the target to learn about referencers — see §7.
- *Boundaries:* untouched. A typed ref is still data; resolution at read is boundary-checked at the reader's door. References-are-never-capabilities holds by construction.
- *Federation / containment:* the declaration lives in the owning type chunk's spec — same ownership, same mount path, same federated resolution as `accepts`. See §6.
- *Migration:* **additive and incremental.** Existing id-strings already conform; adoption is per-archetype spec edits (`dry_run` sweeps find violations). Each relates workaround migrates by one ordinary commit when its case is ready, or not at all. Nothing is forced.
- *Resolves:* current-pointer (typing + validation), predecessor (as a typed immutable key), reference args (the honest typed channel — see D4 note), context items (the body half becomes principled). *Dodges:* target-side discovery, graph visibility — deliberately, deferring them to D1b.

### D1b — projection

- *Simplicity:* no new stored primitive if virtual; if materialized, a system-maintained index table (or synthesized placements) the dispatcher must keep in step.
- *Queries:* refs enter scope algebra — intersect on "chunks referencing X," dimensions show ref edges. This is the full dissolution horizon.md sketches.
- *Reactivity:* materialized projection puts ref changes into `placements_modified` → target-side fan-out works natively. Virtual projection does not, unless the dispatcher additionally diffs declared ref keys per commit — a real cost on the hot path.
- *Boundaries — the one hard rule:* projected placements must be **relates-grade and excluded from instance-chain boundary walks**. Projected as `instance`, an id in a body would extend reachability — a capability minted by writing a string. That would break references-are-never-capabilities at the root.
- *Visibility:* projection makes the reference visible from the target ("once a scope is opened, everything placed on it is visible"). No worse than the relates workaround it replaces — but it means declaring a key `ref` is also opting its references into target-side visibility. A fair dial (undeclared strings stay opaque), worth stating out loud.
- *Separability:* cleanly staged after D1, per-key, on proven need — the explode-promotion pattern. Adopting D1 without D1b costs nothing later.

### D2 — full decomposition

Charted to be retired, on the substrate's own rulings:

- Violates the **consolidation principle** (substrate.md: content that creates no new intersection belongs in the body) and the **grain ruling**'s explicit argument (state as placement churns placements and lets the type lie about identity) and the **lean-substrate ruling** (enumerator chunks rejected as index-thinking; threads.md §4).
- *Write path:* every state change becomes N placement/chunk writes; declarations balloon; commit deltas balloon; reactivity fan-out storms; the two-pass validation walks enormously more.
- *Spec language:* the four fields would have to grow into a full schema language over field-placements — the opposite of two-placement simplicity.
- *FTS:* attribution shatters — hits land on atom chunks, not entities.
- *Reads:* every consumer needs `implode` to see a document — read amplification everywhere, for program data that is written and read whole.
- *Migration:* total, not incremental.
- What it gets right is already available virtually: `explode` **is** decomposition as a pure read-side transform, and the grain principle already stores identity-grade properties at chunk grain (telemetry categories). D2 is the limit case of the grain rule applied while ignoring the rule's own question. The author's instinct that "typing the JSON is not the same thing" is confirmed: D1 and D2 differ in **where truth lives** (body with a contract vs placements), with D1b the middle point (body truth, derived graph). Three points on one axis, not one design.

### D3 — connection chunks

- *Fit:* right where the link is **a fact — identity-grade, immutable, and itself worth talking about** (carrying its own body: role, weight, provenance). The predecessor citation is exactly this: set once at collation creation, never moved, and the citation graph is a scope query away (`scope([cites-archetype])`); the instance/relates asymmetry (§2) carries direction with zero new mechanism. Available *today*, before any typed-JSON ruling.
- *Misfit:* mutable pointers — current-collation via connection chunk means a new chunk plus two placements per navigation, strictly worse than the plain relates. And **program data generally** (see §5).
- *Costs:* one chunk per edge; edge archetypes accumulate per relationship kind; asymmetric multi-role edges (three ends, named roles) exceed what placement-type asymmetry can carry and push ids back into the edge's body.
- *Simplicity:* zero new mechanism — the substrate's own pattern. *Validation:* ordinary (`required` on the edge type). *Reactivity/boundaries/federation:* ordinary chunks, ordinary rules.

### D4 — `attach`

- Resolves reference *arguments* with real enforcement (composed `accepts`) and graph-visible hand-off, boundary-checked at spawn. Engine-level; substrate untouched.
- Its semantics differ from a typed ref in body: attach makes the target **a member of the frame** — `scope([process])` returns it, `awaitRun`/process-view see it, and the frame now contains a *live* chunk (the reading keeps changing after dispatch) with no commit pin, which rubs against arguments-are-immutable and leans on stale-display.
- *Role ambiguity:* two reference arguments of the same type have no slot discrimination — accepts types membership, not roles; the one-argument-chunk-per-role rule (programs.md §1) is bypassed when the referenced chunk itself is the frame member.
- *Containment friction:* the callee's composed `accepts` must name types owned by other modules — workable only via the D6 relates-placement pattern per foreign type, and it is exactly the "same module" clause of the author's containment sentence made concrete.
- **Demotion finding:** engine.md marks `attach` load-bearing *because* "ids-in-body carry no type." D1 provides the honest typed channel for arguments-that-name, which demotes `attach` from load-bearing to case-narrow: retained only where frame *membership* (not reference) is the actual want. Worth re-ruling if D1 is adopted.

### D5 — labeled placement

- Direct: the pointer is a placement with a role, no extra chunk, native reactivity and graph visibility; spec could validate target archetype and cardinality.
- *Costs:* breaks the two-type placement cleanly (or complicates `relates` with an optional key); every read path, count (`in_scope_instance`/`in_scope_relates`), scope semantics, and the db schema learn a new field; boundary walks must explicitly exclude it.
- *Grain:* it **codifies** the grain exception permanently — state lives as placement — where D1 dissolves it. It answers the same cases as D1+D1b at a higher primitive cost and against the grain ruling. Charted as inferior to the D1 line unless the author wants the graph, not the body, to be truth for pointers; kept on the map for that reason.

## 4. Resolution matrix

| Case | D0 | D1 | D1b | D2 | D3 | D4 | D5 |
|---|---|---|---|---|---|---|---|
| Current-pointer | workaround (relates, grain exception) | **resolves** (typed key) | + target-side visibility | resolves, absurd cost | misfit (churn) | — | resolves, codifies exception |
| Predecessor citation | open | resolves (typed immutable key) | + queryable graph | resolves | **resolves today** (asymmetric connection) | — | resolves |
| Reference args | opaque | **resolves typing** | + visible hand-off | resolves | heavy | resolves w/ membership semantics | resolves |
| `attach` open | load-bearing | demotes it | mostly absorbs it | absorbs | — | is it | partially absorbs |
| Context-item hybrid | proven pattern | principles the body half | could derive the relates half | — | overkill | — | could replace relates |

## 5. Facts vs program data — why the intermediary pattern doesn't generalize here

The author's distinction holds up under the specs. Facts (turing-went-to-princeton) are **accreted, many-writer, queried by intersection, each link worth its own body** — connection chunks are their native shape. Program data — arguments, results, configs, view definitions — is **written and read whole, atomically, usually one writer, shape fixed by a contract the program's module owns**. The program layer already chose its grain deliberately: one argument chunk per role, keys within it (programs.md §1) — chunk grain at the role, body grain below. Decomposing below that grain (D2) or interposing edge chunks (D3) makes every program compose and parse structure instead of reading one body, multiplies validation surfaces, and turns the call frame into machinery. Typed JSON (D1) strengthens exactly the level the granularity rule already picked: the contract deepens, the grain doesn't move. Where program data does need links that are facts — the citation, the consumption tag — the fact-shaped tools (connection chunk, relates) remain right, and the hybrid stops being a workaround and becomes the pattern: **body for role and pin, placement for the reverse index the case has proven it needs.**

## 6. Containment — program-owned types across boundaries

The author's sentence unpacked against the specs: a program's argument/result types are *reached* by `relates` from the program (never path-addressed — programs.md §1), *owned* by whichever module's db holds the type chunk, and *enforced* solely through `instance` placement + composed `accepts`, names resolved within the owner's scope — which crosses modules only via the mounted-archetype pattern (placement records in the writer's db, archetype in the owner's; bootstrap.md, engine.md §Cross-db). The entire type system's reach is placement. **Bodies are exactly where the containment has a hole**: an id in a body escapes typing, and nothing a module declares can bind it.

Per design:

- **D1** extends containment into bodies without moving ownership: the key declarations live in the owning type chunk's spec, mounted and federated like `accepts`, self-describing to any peer that mounts the db. New capability: a schema can constrain a key to *another* module's archetype — a cross-module contract with **no placement in either db** (invisible inbound coupling; `accepts` already permits the outbound direction, so this is symmetric, but worth naming). *Open, sharp:* **how a ref constraint names its archetype** — raw chunk id (globally unique, peer-safe, but collides with the bootstrap-IDs-are-hand-picked debt once ids are generated) vs name-resolved-in-owner-scope (the `accepts` rule, inheriting its resolve-empty trap and the D6 relates-placement requirement). This is the same naming question `accepts` already carries, now appearing in a second place — one resolution should cover both.
- **D2** forces every field to be an owned archetype — the cross-module type surface explodes; containment survives but drowns.
- **D3** edges are ordinary owned chunks; cross-module edges work like any dangling-tolerant placement. Fine.
- **D4** concentrates the friction: callee `accepts` naming foreign types is the one place today where "same module" is a real constraint, needing per-type relates-placements to resolve names.

## 7. Lean and the sharpest opens

**Lean (steward's, not a ruling):**

1. **Retire D2** by the substrate's own standing rulings (consolidation, grain, lean-substrate). Its virtues are already delivered virtually by `explode` + the grain principle. Typing and decomposition are confirmed different; take the first, refuse the second.
2. **Adopt the D1 line as the direction**, shaped as one `keys` spec-field ruling that also swallows the content-type register and well-known-key vocabulary (three queued opens, one vocabulary). Refs dangle legally like placements; archetype constraints enforce when resolvable, inheriting — not worsening — the accepts federation gap.
3. **Stage D1b behind proven reverse queries**, per key, as the explode-promotion pattern — it is where all the expensive semantics live (reactivity fan-out, target-side visibility, boundary exclusion, index maintenance), and nothing in D1 forecloses it.
4. **Predecessor citation need not wait**: the asymmetric connection chunk (instance-on-citing, relates-on-cited) is available today with zero new mechanism, and remains right even after D1 if the citation is a fact worth its own body; if not, it migrates to a typed key by one commit. Either candidate in programs.md §3.5's open is honest; the connection chunk is buildable now.
5. **Re-examine `attach` after D1**: likely demoted from load-bearing to a narrow frame-membership affordance.

**Sharpest unresolved question:** *does any live consumer actually need to find these references from the target side?* The current-pointer's relates gives "which readings view this collation" for free; a typed body key loses it unless D1b lands. The specs themselves split on what the workaround is for — programs.md says typing, horizon.md says projection would dissolve it. If no target-side consumer exists, D1 alone dissolves the workarounds and D1b stays a deferred optimization; if one does (drift detection? shared-collation awareness?), projection is load-bearing from the start and its reactivity/visibility semantics must be designed, not deferred. This single fact orders the whole adoption.

**Also open, recorded:** ref-constraint naming (id vs scoped name — couples to bootstrap-ID debt; §6) · per-key conflict rule under spec composition (§3-D1) · whether constrained refs may dangle (§3-D1) · sub-key references (`[[mentions]]`) deferred to the content-type register · whether FTS should skip or keep declared ref keys (minor; ids-as-tokens is today's accidental reverse lookup either way).
