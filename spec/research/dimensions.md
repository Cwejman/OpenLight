# Dimensions — the permission model re-grounded

Record of the 2026-08-06/07 boundary dialog, written from the point of resolution. Status: **author-directed direction**, not law; feeds the absorption pass. Revised 2026-08-07 with the steward review folded in — eight findings, credited inline where they changed the text; finding 1 restructured §2 and dissolved findings 4, 6, and 8 by cascade. [`boundaries.md`](boundaries.md) is the position paper that opened the question — its assembly of the current law (§1) and its gap analysis stand; its proposed position is superseded by this file.

The snag that started it: as specced, a read at a granted chunk returns *members with bodies* — chunks that reach (ownership-walk + grants) never included. Anything `relates`-placed on a granted scope leaked. Fixing that inside the ownership model required choosing between filtered rooms and locked-door hallways. The author widened the frame instead, and the problem dissolved.

---

## 1. The model

**Every chunk is a dimension.** Placement on it is membership. The space is unstructured; you structure it by placing — create the grouping chunk, attach things to it, and the attaching is what makes them "in" it. Grouping was never ownership's job; it is what locations always were.

**To place into a dimension is to publish into it.** A note related onto the inbox is visible to inbox-holders — not a leak, the meaning of the act. Aboutness without publishing exists too, as mentions (§3).

**Three axes, never conflated:**

- **Kinds are symmetric.** No connection type is inherently hidden in one direction. Knowledge flows both ways.
- **Boundaries decide what you may see.** Permission, viewer-side, uniform over everything: bodies, members, edges, links, search.
- **Selections decide what you are looking at.** Reader configuration — instances only, exclude mentions — is attention, not permission.

Selecting `[movie]` shows movies, not your note about one; selecting `[the-movie]` shows the note — if your boundary admits it. Membership, attention, permission: three different facts.

## 2. Ownership demoted to naming

Ownership carries **naming and containment**, and **confers no transitive reach**. An `owned` placement is ordinary one-hop membership like every other kind — naming into a namespace *is* placing into a room: same act-shape, same governance (§3), visible to the room's holders, one hop, no deeper. What died is the transitive subtree-walk, not ownership's presence in the model. *(Steward review, finding 1 — five kinds, all membership, no exception kind: the model gets more uniform, not smaller.)*

Why it stays at all: disambiguation. A `status` archetype for A and another for B are not instances of A and B (they would be molded by their specs — wrong); they need a naming relation. Address = name suffixed by owner (`A/status`, `B/status`). That is ownership's whole job.

Consequences:

- Reorganizing the tree never reorganizes permission.
- **The frame re-homes**: a process's frame is its own dimension. Children and results are **owned by the process** — that one relation is both their address and their membership in `[self]`, since ownership is membership. "A program reads and writes its own frame" = its boundary includes `[self]`. *(Finding 4 — no namespace flood, no second structure to maintain.)*
- **The umbrella is built once.** A few programs owned by one chunk are members of `[umbrella]` through that same placement — no second structure. Additional placements remain what they were for: cross-cutting groups that ownership's single-parent tree cannot express. *(Finding 8.)*
- Cascade (draft-delete with solely-related composition chunks) walks placements, not ownership.

## 3. Acts are arrows; edges are lines

Every connection has two lives. As an **act** it is directional — someone wrote it, and the write landed on one specific side. As **knowledge** it is symmetric — traversable both ways, boundary permitting. *Knowledge flows both ways; authorship never does.* The five kinds split into two governance classes by where the write lands:

**Placements** (`owned`, `instance`, `relates`) — the row lands on the target's side. The act is publishing into the target:

- Create: **write over the dimension, read over the placed chunk.**
- Remove: **write over the dimension** — its stewards curate its member list.
- Why read-over-the-chunk is required: without it, anyone could place a bare *id* they never held, and the dimension's holders would gain a body the placer couldn't read — reach manufactured from an address. (Same rule and reason the law already has for ref-creation.)
- Why not write-over-both: the federation pattern requires placing *read-only* peer chunks onto your own dimensions ("reference is not modification"). Write-on-both kills mounting.

**Links** (`field`, `mention`) — the fact lands in the author's own body. The act is speaking from yourself: self-governed; the target is passive (read over it suffices, existing law).

So aboutness is two mechanisms with different governance and visibility, deliberately: **relates** = aboutness published into the subject's room, subject-governed, visible to the subject's holders; **mention** = aboutness spoken from your own room, self-governed, visible only to those who reach *you*. A private note about a shared project is a mention, and stays private — by the boundary, not by any one-wayness of the kind.

**Chunk birth — creation is never placementless.** Every chunk is created **owned**, defaulting into the creating process's frame; **owning it elsewhere at birth requires write over that owner** — §3's placement rule applied, nothing new. "A chunk with no owner is a root" becomes bootstrap-only. *(Finding 6.)*

**Instance governance — claim, with a known and deferred cost.** Instancing is a **claim**: anyone may claim a type, the archetype untouched. Publish-governance would strangle typing and enums. The cost, stated precisely rather than left as a lean *(finding 2, reframed by the author)*:

- The injected party **gains no reach** — reach flows to the boundary's holder; an injector only exposes their own chunk. This is an **integrity** question, not a confidentiality one: pollution and spoofing of trust-bearing membership.
- The real mechanism is **federation**: placement rows union across mounted dbs, so a mounted peer can write members into any dimension you name — palette, matching, agent context included.
- **v0.1 is unaffected** — single author per db, mounts chosen and read-only.
- Direction recorded, **unworked**: **provenance-scoped membership**. Every federated chunk already carries a synthesized mount marker (existing law); selections default to same-db members, with peer members opted in per term. Rides with shared-db identity (§8) — **author-ruled open, explicitly not an implementation blocker**. Not to be designed now.

## 4. Boundaries are selections

Expressions have two natives: **single-request** (the planner lowers the whole thing to one query — dimension algebra plus `at`, `where`, `follow`) and **multi-request** (compute verbs, program runs). **Boundary grammar is the single-request class, exactly.** A wall must be evaluable instantly and deterministically at every read; compute has no place in it.

- **First-class sets**: union, intersection, **subtraction** — in boundaries and reads alike. `[project, controller, admin]`-style intersections narrow; `engine − process` subtracts.
- **One grammar, three jobs**: attention (the reader's members), context (the agent's), permission (boundaries). The same selection language throughout is the design's proof of fit.
- **Filtering is uniform.** The law already reach-filters links and full-text search; membership answers join them. One standing sentence changes: "counts always describe the full set" becomes **"counts describe what your boundary admits."** This closes the original snag.
- **Freezing**: a run's boundary *expression* is frozen at start; membership through it is live — a grant is a standing licence over a region, not a snapshot.
- **Membership is always current, including under `at`** (author-ruled). A temporal read is filtered by the structure as it stands *now*, never as it stood at the read's commit. Placing a chunk on `secrets` today therefore hides it throughout all history — which is what remediation requires — and removing it exposes history, accepted. Boundaries govern the current structure; the past is read through it, not beside it. *(Settles the temporal question raised in review.)*

**Hygiene, not holes.** Naming a dimension in a boundary — positively or negatively — delegates membership control to that dimension's writers: writers of `engine` shape what `[engine]` shows; writers of `process` shape what `engine − process` shows (removal moves chunks in). Both polarities, same delegation. *Permission is a question of hygiene* (author): keep the dimensions you name well-governed. Subtraction stays.

## 5. Propagation by hop

The mechanism's conditions, per kind and direction. Firm rows ruled; the rest by grant shape:

| hop | read propagates? | write propagates? |
|---|---|---|
| owner → what it owns | **one hop, by boundary** — never transitive | **no** |
| instance → its archetype | **yes** — reading your type is normal | **no** — holding an instance never edits the type |
| archetype → its instances | by the grant's shape (`[X]` vs terms) | by the grant's shape |
| relates → the related | by boundary | by boundary; never implicit |
| mention → the mentioned | the edge, boundary permitting; content by boundary | **no** |
| field → the target | address; content by boundary | **no** |

Two rows are law-grade already: **write never propagates through links, either direction**, and **instance-read up to the archetype is free**.

Depth is **non-transitive by default**: `[hallway]` reaches what is placed on the hallway, not what is placed on those. Depth, when wanted, is an expression (`follow`-shaped), stated.

## 6. Commits are special — and safe

Commits stay **SQL rows**, not chunks with placements — a commit carries message and timestamp, and its deltas live in the `chunks_modified` / `placements_modified` / `links_modified` columns. What makes a commit a dimension is **projection, not new rows**: the engine already projects those delta columns as queryable intersections (`read([db/commits, chunk_id])` is law). **The edits are not in the body**; diffs are derived — two temporal reads, compared, each boundary-filtered by reach over the chunks. *(Finding 3 — the earlier wording asserted a `relates` topology that is not built and was never budgeted.)* So:

- Granting the commits archetype lists history — metadata and touched-addresses — never contents.
- Contents come through the chunks, gated as always.
- **A single commit granted as a dimension = its touched set becomes readable** — a review grant in one gesture ("see exactly what this run changed"). Kept deliberately.

## 7. Roles, presets, and the agent's walls

**A role is a dimension.** Create `admin-role`, place people or programs on it, write boundaries in its terms. Two things follow for free, from §3: the role gives **boundary vocabulary**, and *who may assign the role = who has write over the role chunk* — **assignment governance** as ordinary placement governance, no new machinery.

**What it does not yet do** *(finding 5)*: a subject's membership in a role does not confer reach on runs that subject starts. Boundaries are held by processes, constructed at start; the mapping from subject to run is **identity**, deferred with §8. The v0.1 half-step is **policy, not machinery**: the dispatcher may consult a program's role placements when constructing default grants.

**Reusable expression-boundaries** (formulas, not member lists — `[project] − [secrets]`): selections are values; lifting a value to a chunk is the standing gesture. A named boundary preset is a lifted selection.

**The agent needs no second mechanism.** Working set = its boundary. Never-see = subtraction of a tagged dimension (`[workspace] − [secrets]`). Hard maximum = the caps that already exist (child reach ⊆ parent reach; the program's stated ceiling). Three walls, one grammar.

## 8. Held open, deliberately

- **Prose / chunk-side requirements — the third player.** Everything above is viewer-side. Prose can say anything about what it mentions; no viewer-side selection closes that. The candidate mechanism — content inheriting the requirements of what it speaks about (a chunk-side lock, possibly derived from mentions) — is a *different player* from grants. **Author-ruled open: openness is cheaper than restriction until experience says otherwise** — a ruling scoped to *prose readability*: you may read prose that mentions chunks and dimensions beyond your reach. The prose does not inherit their walls.

**The reader-side consequence** (author, clarifying 2026-08-07): openness governs the text, not what renders inside it. **A surface program cannot run over a chunk beyond reach** — so slots and links pointing outside the boundary do not resolve into live surfaces. The prose reads; its embedded citations degrade. The prose ladder therefore needs a beyond-reach face at every grade (badge, link, widget), and that face is the honest one: the reference is visible as a reference, unresolved. Owed at absorption to programs.md (§4 prose, §5 slots) alongside the dead-root and reference-error faces already specced. Related standing notes: the protected-bubble margin question; locked relationships (selection.md §16).
- **Shared-db identity and the bootstrap of authority.** The model's completeness claim is scoped to single-author dbs; walls between parties are mounts. Two people in one db need identity (signed commits — horizon, Peering) and a first steward. People and remotes underexplored; this dialog is the precursor.
- **Lifetimes in the substrate** → horizon entry (this sitting): placements and chunks with lifespans — a role membership that expires on its own.
- **Default kind-set of a bare `[X]` grant.** Dimensionality spans all kinds; a bare grant including *inbound mentions* would sweep in the field's chatter. Lean, unruled: outbound field refs + placements on X; inbound mentions excluded unless asked.
- **Provenance-scoped membership** — the federated half of instance-as-claim (§3): peer dbs union placement rows into dimensions you name. Selections default to same-db members; peer members opt in per term, on the mount marker federated chunks already carry. **Author-ruled open, non-blocking**; rides with shared-db identity above, where peering belongs.

## 9. Consequences for the specs, at absorption

- **substrate.md** — the reach law rewritten: reach = boundary selections; ownership = naming and containment, never reach; the placement rules of §3 (create: write-dimension + read-chunk; remove: write-dimension); the counts sentence; uniform boundary-filtering of membership answers.
- **engine.md** — the Boundaries section rebuilt on selections (single-request grammar); frame as `[self]`; caps unchanged; the instance claim-vs-publish decision taken here.
- **selection.md alignment** — its §5 `read`/`write` keys upgrade naturally: members become selection-grade (they were already locs and argument references; set algebra joins them). But **§5 is not contradiction-free**, as first written here: its item 1 (the frame as the process's *ownership subtree*) and its closing granularity sentence (*a term-chunk root grants its ownership subtree*) are dead, not upgraded. Both are struck in place there, pointing here. Items 2–5 stand.
- **boundaries.md** — stands as the opening position paper; superseded on position, retained for its assembly and for the gap analysis that located the wound.
- **db.md** — boundary evaluation rides the plan interface (single-request lowering); membership filtering joins the read path.

**Three budgets to write down, not assume** *(findings 3 and 7)*:

1. **The commit-touched projection must be admissible in boundary evaluation** — commit-as-dimension is projection-backed, so the delta columns have to be reachable by the single-request grammar.
2. **The memo key becomes `(expression, boundary, commit)`.** selection.md §8 keys on `(normalized expression, commit)`; once membership answers are boundary-filtered, the cache fragments per boundary. Price it rather than discover it.
3. **The invalidation index.** Subscription invalidation now evaluates boundary expressions **per affected commit** — engine.md §411 previously walked ownership. That needs an index **from dimensions-named-in-boundaries to the boundaries naming them**, so a commit's delta finds the boundaries it could disturb without scanning them all.
