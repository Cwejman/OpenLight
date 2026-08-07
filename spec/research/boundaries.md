# Boundaries — a position paper on reach, and where it is underspecified

> **Superseded on position by [`dimensions.md`](dimensions.md) (2026-08-07).** The author widened the frame instead of choosing inside the ownership model, and the problem dissolved. §1's assembly of the prior law and §2–4's gap analysis stand — they located the wound. **§5's proposal is dead**: reach is not ownership-plus-spread but boundary selections over dimensions. Read this file for the diagnosis, never for the cure.

Steward position, written 2026-08-06 at the author's request for independent review. **Not law.** The specs are law; this file assembles what they say about permission into one place, names three gaps, and argues a direction. It exists to be attacked.

The question that produced it: *if I grant a chunk to a program, what exactly did I give away?* The author's suspicion — that the permission model is incomplete in a way successive sessions have not noticed — is, on inspection, correct.

---

## 1. The law today, assembled

Scattered across two specs; nowhere stated whole.

**The core rule** ([`substrate.md`](../substrate.md) §47): *"Reach = ownership + explicit grants. Permission walks read ownership and granted roots only — a grant over a root reaches its ownership subtree. Instance, relates, field, and mention never confer reach: you can hand anyone an address; the field decides at the door."*

**Construction, not filtering** ([`engine.md`](../engine.md), *Boundaries*): a run's reach is assembled at start from three sources and frozen for the run —

1. **The frame** — the process's own ownership subtree, both ways, always, implicit. The argument chunk rides along.
2. **Grants** — roots derived from `grants: read|write`-marked ref keys in the argument, plus whatever the starter adds. Nested runs intersect with the parent: *reach narrows through the call stack, never widens.*
3. **Demand** — the program's argument-independent residue. Absent = open (defers to the run); present = exact ceiling; `{read: [], write: []}` = the frame-only program.

**The walk is ownership** (engine.md §314): a root grants its ownership subtree. And then the sentence this paper is mostly about:

> *"Once a chunk is within reach, reading it returns all its connections — the boundary gates which doors you can open, it does not filter inside an opened room."*

**Links are filtered** (substrate.md §127): *"`linked` answers are filtered by the reader's reach — you never see links from chunks you could not read."* Creating a ref is likewise gated by the writer's reach over the target, so validation can't be used as an existence probe.

**Dynamics**: grants are immutable for the run, but *reachability* through them is not — an ownership change elsewhere can sever the path, and subscriptions die with `subscription_invalid` (engine.md §411).

## 2. Gap one — the room, and what "inside" means

A read at X answers across all five kinds: `owned`, `instance`, `relates` as membership with per-kind counts, plus `field`/`mention` in the separate `linked` result ([`substrate.md`](../substrate.md), *Read*). Reach, meanwhile, walks ownership alone.

So a read at a granted X returns chunks that are **not in reach** — everything merely placed `instance` or `relates` on it. Engine.md's "does not filter inside an opened room" appears to bless this. But the sentence is ambiguous between two very different systems:

- **(a) The connection list is visible** — you learn that N chunks are placed here, with ids and kinds. Bodies require reach.
- **(b) The room's contents are yours** — opening X hands you the placed chunks whole, bodies included.

Under (b), **`relates` becomes a leak**, and the author's consequence follows: people stop relating things, or start interposing junk chunks to break the association. Aboutness is the substrate's oldest pattern; a permission model that punishes it is broken.

Under (a), the model is coherent but two more things need saying: whether **counts** are reach-filtered (if yes, they differ per caller, and memoization keys become reach-dependent), and whether **names** count as structure or content (a name is often the sensitive part).

Nothing in the specs picks. This is the concrete missing mechanic.

## 3. Gap two — ownership carries three jobs

Ownership is simultaneously:

1. **Naming** — unique-within-owner, so the ownership path *is* the address (`engine/program`).
2. **Containment** — where a chunk lives; the tree; a module is an ownership subtree.
3. **The reach region** — because a subtree is a convenient shape to walk.

(3) borrowed the shape of (1) and (2). The cost is that **ownership can no longer be a free organizational choice**: the moment reach rides it, the tree encodes who may see what, and reorganizing for meaning silently reorganizes permission. Rooms-for-tidiness and rooms-for-safety get one mechanism.

The author's worked examples land on both sides, which is the tell:

- *"I define a few programs under an umbrella and it is easier to allow all of them"* — wants ownership to carry reach.
- *"if I grant `engine/program` I shouldn't get every program"* — wants it not to.
- *An enum owned by the program that uses it* — wants it to.

Both readings are right, because two different intentions are being expressed through one structure.

## 4. Gap three — unbounded and growing grants

`db/commits` collects commits forever. Whether commits are *owned* by it or merely `instance` on it, a grant over that root is a standing licence over a set that grows without limit and without the grantor's further involvement.

This is not necessarily wrong — a filesystem grant covers files added later, and nobody finds that shocking. But it means **a grant is a standing licence over a region, not a snapshot of a set**, and that has never been written down. It also means the "grant the place that owns them" answer to gap two relocates the growth rather than resolving it.

Related: **placements are made by whoever writes the chunk, and multi-typing is free.** If `instance` ever conferred reach, a third party could add an `instance` placement onto your archetype and walk into a boundary someone else granted — reach would become writable remotely. Ownership cannot do this: a chunk has exactly one owner, so entering your subtree *is* a write into your subtree, already governed. **This is the real reason the kinds differ, and it deserves to be stated as the reason rather than left as a rule.**

## 5. Position

Three moves, in dependency order.

**(i) Pick (a) for the room: structure visible, bodies gated.** Reading a reachable chunk returns its full connection structure — ids, kinds, counts — because the field's value *is* navigable structure and per-caller counts would make reads non-memoizable. Bodies of non-reachable chunks are withheld. A neighbour's existence is visible; its content is not. `relates` then costs nothing to use, which is the property that must be protected.

Names are the hard sub-case. I lean **names are structure** (they are how addresses read, and hiding them makes the visible structure useless), with the discipline that a sensitive name is itself a modelling error — say it in a body, not a name.

**(ii) Give grants a spread.** `self` or `subtree`, stated, instead of subtree being implied by ownership's shape. The frame stays `subtree` by default; dispatch additions declare theirs. This unbraids gap two: ownership returns to naming and containment, permission becomes stated, and both author examples work — the umbrella is `subtree` because you said so, `engine/program` is `self` because you didn't.

**(iii) Then, and only then, ask about deny** (worklist D1). Deny is a patch on the layer above; with spread available, most cases that wanted deny instead want a narrower grant. If a real case survives, it can be priced then. **My recommendation is to keep the current answer — no deny — and revisit on demand**, which is where the author left it in dialog.

What this deliberately does **not** do: make reach transitive through any connection kind. That direction was raised and killed in dialog, correctly — it makes relating a leak and would end aboutness as a practice.

## 6. What I want attacked

For anyone reviewing this cold:

- **Is (a) actually leak-free?** Structure is metadata, and metadata is often the secret (that these two chunks are related may be the whole story). Is there a case where visible structure alone is a real disclosure — and if so, does that force reach-filtered counts, with the memoization cost that implies?
- **Does spread pay for itself?** It adds a field to every grant. Is there a cheaper unbraiding — e.g. reach walks ownership only to a declared depth, or a `module` marker that terminates the walk?
- **Is the frame really subtree-shaped?** Engine.md §64 rules the frame *is* the process's ownership subtree, which is what makes "a program can always read its own frame" fall out of the law rather than stand beside it. Spread must not break that.
- **The growth question.** Is "a grant is a standing licence over a region" acceptable, or does something need to bound it — expiry, a cap, an at-grant snapshot?
- **Multi-mount.** Ownership never crosses mounts and walks stop at mount edges; full reach across mounts is read-only by default (engine.md §272, §274). Does spread interact badly with federation?

## 7. Drift noticed while assembling this

Not part of the argument; flagged so it isn't lost.

- Engine.md derives grants from **`grants: read|write`-marked ref keys in the argument archetype's instance contract**. [`selection.md`](selection.md) §4–5 retired that: arguments are sets, and boundary facts live only in the program's flat `read`/`write` keys with argument references. The absorption pass (worklist A) must not preserve the `grants:`-marked-key mechanism.
- Substrate.md §141's *"instance placements carry seq"* predates the five-kind split, when membership *was* instance placement. Settled separately in [`conclusions.md`](conclusions.md) §A.
- Engine.md §86 already marks the residence rules as "the fold's reading of `reach = ownership + grants` — revisit if a real case strains them." This paper is that strain arriving.
