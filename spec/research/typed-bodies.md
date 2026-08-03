# Typed Bodies

The settled statement of the typed-bodies deliberation (author dialog, 2026-08-03), written whole. The exploration that preceded it is archived in [`typed-json.md`](typed-json.md); this file is what to read. Adopted means adopted in dialog — the spec folds (substrate.md, db.md, protocol) are still owed and gated on this file's confirmation.

---

## The change, in one sentence

Bodies can hold references — a declared key or a prose mention pointing at a chunk — and the system understands them: validates them at write, files them as relation rows, and answers from both sides.

Semantically, this is the author's reading and the right one: **a typed key is a placement stored in the body.** The field then has three sources of placement-shaped truth:

1. **Hand-placed rows** — instance and relates, as ever. Structure, membership, deliberate aboutness — and the only thing permissions ever read.
2. **Typed keys** — a record's own relations, named by the archetype that owns them: `person` declares `work` holds a `workplace`. Directional by nature — a body reads outward, which is what pointer-facts always needed and relates never was.
3. **Prose mentions** — references in text. The open end of the spectrum: where naming the relation would be false precision, prose carries the meaning and the mention carries the reference. A mention may point at a **location** — and a location is a *description*, not a chunk: it may resolve to a hundred chunks today and ninety tomorrow. The link's target column therefore holds two kinds — a chunk id, or a normalized location expression — and "who references this location" answers by expression match, with a mention's full weight: the relation is to the place as described. Materializing a description into a chunk remains the separate sharing-confers-identity gesture, not a side effect of mentioning.

Relates is relieved, not removed: rigid pointers move into keys, and a relates goes back to reliably meaning aboutness. Prose placed on what it discusses (the chunk at the intersection *is* the relationship) stays the substrate's oldest pattern, untouched.

## What is adopted

- **One new spec field: `keys`.** An archetype's spec may declare its body keys — type per key: `string`, `number`, `time`, a format-tagged string (`markdown`), a reference constrained by archetype (`work: ref(workplace)`), **or a list/set of any of these** (`affected: list<ref>`; a set is a list with uniqueness checked) — stored as JSON arrays, validated per element, one link row per element; no intermediate chunk ceremony for collections (author-adopted). One field, three queued opens closed: typed references, the content-type register, the well-known vocabulary (`time`, `name`, `status`).
- **Knowledge modeling is in scope.** Two hundred people with coherent, enforced fields is what archetypes are for. The fence against ontology creep is *ownership*: a key name lives inside one archetype's spec, like a struct field in a struct — never in a global predicate vocabulary. That is the difference between this and RDF.
- **Write-and-index.** When a body is saved, in the same transaction: declared ref keys are validated (target exists and is an instance of the constrained archetype — else `VALIDATION_ERROR`, like any spec failure), and every link the body contains — declared refs and complete `[[id]]` mentions — is filed into a link table. Half-typed mentions match nothing; links to missing chunks file but surface as dead references (the ruled pattern); cross-mount unresolvables surface as unresolved, never reject.
- **Both-sides reading.** `ScopeResult` gains a separate `linked` field beside `items` — who points here, labeled by kind (`key` or `mention`), never mixed with placements. "Who works here" is one indexed lookup; open Turing and every prose that mentions him is there.
- **Three obligations, pinned.** Links derive no reach — the permission walk reads only the hand-placed table — **but permissions engage both ends** (author correction): creating a ref is gated by the writer's reach over the target (else validation becomes an existence-probe outside one's boundary), and the `linked` answer is filtered by the reader's boundary — you never see links from chunks you could not read. Links refresh in the write transaction — they cannot disagree with bodies. Hand-placed relates survives beside the links — authored aboutness is not derivable from any body.

## Storage — what does not change

The body remains **one JSON text column, byte-identical** to today. No typed-body storage kind exists; no placed-body storage kind exists. The truth tables — chunk versions, current chunks, placements, commits — are untouched. Typing lives in the spec and in validation at the door. The link table is derived and rebuildable (wipe it, re-derive from current bodies); it is not part of commits and adds no second source of truth.

Adoption is stageable: the `keys` field plus validation lands with **zero schema change** — forward references work immediately, since the id is in the body. The link table is a second stage, added when both-sides reading is wanted.

## Storage — what was refused, and why

"Actual SQL-typed bodies" was deliberated in three forms and refused on merits:

- **A table per archetype** (`CREATE TABLE person(work REFERENCES …)`): archetypes are created and edited at runtime → perpetual DDL migrations, per branch; a chunk can be instance of several archetypes (union-accepts) → no single table can hold it; and a foreign key cannot express our constraint — *instance of `workplace`, on this branch, under composed specs* — while losslessness (targets flag-removed, never deleted) makes FK enforcement vacuous anyway.
- **Field-per-row storage** (one typed row per body key): every body read becomes multi-row reassembly; whole-body versioning — which keeps time travel, merge collision detection, and the wire format trivial — breaks; nested structure and prose need a second storage regime.
- **What typed relations actually deserve — real SQL rows — they get**: the link table *is* SQL-based typed relations, indexed and joinable. Derived rather than authored-as-rows so that one fact keeps one home: the body is where the writer wrote it. Hot keys escalate with SQLite expression indexes on `json_extract` — per key, when a query proves hot (promotion-when-proven) — never with a storage rewrite.

## The db, honestly — what gets harder

- **The write path gains windows.** Validating a ref means reading other chunks' current state, possibly across mounts — a new failure class (your write fails because of a chunk you didn't touch) in a path that was previously self-contained.
- **Integrity is write-time only, permanently.** The db never re-validates old bodies and never repairs. If a target later loses its archetype or is removed, refs to it are stale — a *legal, permanent state*, rendered as dead references, never fixed. Losslessness demands this.
- **The link index depends on specs, not just content** — the first derived index to do so. Editing an archetype's `keys` invalidates the derived rows of every instance. Eager re-derivation (write fan-out on spec edits) versus lazy (rows knowingly stale until each chunk's next write) is the sharpest open engineering decision.
- **Reactivity grows one clause**: subscriptions on a chunk also fire when links *to* it appear or disappear — computed from the link delta in the same transaction; streaming churn rides the already-required coalescing.
- **Backlinks are per-db**: a peer's links to my chunk live in their table; a complete answer is a federated union across mounts, like reads generally.
- **Cross-mount ref validation goes through the engine** — the seam `accepts` validation already uses (federated pre-validation; built). Adopted as the simple thing now, **with the author's reservation recorded**: it may prove the wrong seam down the line; we do it anyway and keep the doubt visible. The db stays id-blind and validates locally-resolvable targets only.
- **Size**: the link table scales with total references and may become the largest table after the version log; per-write cost stays bounded (delete-and-reinsert one chunk's rows).

## Open, marked

- **Eager vs lazy** re-derivation on spec change (above).
- **The `keys` field's exact shape** — and how ref constraints name their archetype (id vs scoped name), which couples to the bootstrap-ID debt and the `accepts` naming convention; these settle together.
- **Temporal link queries** — v0.1 offers none; historical bodies remain in the version log, so they are re-derivable if ever wanted.
- **Mention syntax** (proposal, settles at `prose` v0): no invented syntax — CommonMark plus the `ol:` URI scheme the host already serves. `<ol:id>` bare autolink → badge chrome (name/status fetched live); `[chosen name](ol:id)` → named link, the author's text as face; `![](ol:id)` → widget, placed like an image — embed-grade inherited from markdown's own semantics. Locations ride the same scheme with the expression in the URI. Supersedes the invented `[[id]]`.
- **Field expressions in prose** (the DSL, named — coined in threads.md §3): a fenced expression block is an **anonymous expression living in the text** — fluid, no chunk created, rendered as a widget by the same auto-binding rules (the mermaid pattern); **lifting** it — the moment it needs identity: cited elsewhere, opened in a reader, shipped — makes it a chunk the prose then references (sharing confers identity, the same gesture as locations and conversations). The stored form of the DSL already exists: it is the collation; only the inline mode is new. Lean: the save-time scan reads inside expression blocks too, so an inline expression's referenced chunks and locations file links like any mention.
- **Expression normalization** — when do two location descriptions count as the same location (for "who references this")? Settles at build.
- **The projection of typed keys as first-class graph placements** (beyond the `linked` result field) — nothing needs it yet; revisit against a real consumer.
