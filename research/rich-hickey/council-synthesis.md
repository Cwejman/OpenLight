# Rich Hickey — Council Synthesis

Provenance for the **Principles** in [`../../inside.md`](../../inside.md) (the design-discipline distillation; these first landed in `conventions.md` and were later merged into the seed beside the values they serve). The ten talks in this directory were distilled not by flat summary but by a deliberation: each talk was read closely (Round 1), then ten agents — one embodying each talk — read every other talk plus `inside.md` and `conventions.md` and responded (Round 2: resonances, tensions, proposed conventions), then read each other's responses and converged (Round 3), and a scribe consolidated the result. The author wrote the final `conventions.md`. This file records what landed, what was deliberately left out, and — most importantly — the tensions the council refused to flatten.

This is reference depth. The working principles live in `conventions.md`; the durable byproduct worth keeping is the honest-weight reading below.

## What landed

Five working principles, distilled to the project's voice and now living in `inside.md` under **Principles** (purified further there into the evidence-based, hammock-aware spine):

1. **Easy is not simple — check it, don't feel it.** (every talk; keystone — *Simple Made Easy*, *Simplicity Matters*) Includes the relocation test as the falsifiable form.
2. **Accrete, never overwrite.** (*The Value of Values*, *Spec-ulation*, *Are We There Yet?*) Folds in machine-vs-record: a session is process and may dissolve; what it learned is information and must persist.
3. **Shape in the field; requiredness at the point of use.** (*Maybe Not*, *Effective Programs*, *Spec-ulation*)
4. **Decompose first; name what is complected.** (*Design, Composition and Performance*, *Simple Made Easy*, *Hammock*)
5. **Name what you don't know before you commit.** (*Hammock Driven Development*) The antidote to untested conviction — the failure mode a values-first project is most prone to.

## What was deliberately left out

- **Values restated as conventions.** "Keep facts as transparent, comparable values," "effective over correct," "build instruments not everything-machines" — these are values; they belong in `inside.md` (mostly already there as *transparency of relationships*, *honest weight*, *folk-level*) or strengthen the value rather than duplicate it.
- **Substrate architecture.** The flow taxonomy (transform / move / route / record), queue-vs-direct coupling, the perception/action concurrency invariant, the open-data type *mechanism* — these belong in the `db`/`engine`/`sdk` specs, not in a file about how a person or agent works. Their *spirit* is carried by decomposition and the relocation test.
- **Personal-workflow ergonomics.** "Think away from the keyboard, sleep one night, type sparingly" — too author-habit-specific for a file that also governs agents; its load-bearing core (incubation is real work; smallness signals quality) is folded into the two cognitive entries.
- **Clojure/toolchain specifics.** refs/protocols, Datomic Pull, EDN/spec, Maven Central, homoiconicity, SemVer mechanics — illustrations, never the principle.
- **The commitment boundary** (private churn free; published = accrete-only). Genuinely useful, but it pre-decides a session/publish seam `inside.md` deliberately leaves open. Parked in tensions until the substrate settles that mechanism.

## Tensions the council refused to flatten

These are disagreements between Hickey's outside-in stance and `inside.md`'s values-first orientation. Per `inside.md`'s own invitation ("flag what feels off"), they are kept visible rather than resolved. The friction is the asset.

1. **Values-first vs. outside-in** (the deepest split). `inside.md`: "values first, mechanism derived." Nearly every Hickey position — simple/easy, immutability, accretion, requiredness-at-the-boundary — was *derived from* production pain, not intuited as inevitable. The honest landing isn't to pick a side: these conventions are values that have already paid for themselves in implementation elsewhere — the hard-won character `conventions.md` is meant to hold — while `inside.md` keeps its orientation. `inside.md` already half-admits this in *Mirrors in the makers*.

2. **Felt inevitability: signal vs. deceiver.** `inside.md`: "when it feels inevitable, it is close." Five-plus voices: the feeling of inevitability *is* the ease axis, precisely where the costliest complexity hides. The landed convention keeps the feeling as a hypothesis and adds a structural check — but the underlying disagreement about how far to trust the feeling stays open. Don't soften into pure trust or pure suspicion.

3. **Lossless/accrete vs. the dissolving session/shadow rhythm.** `inside.md` celebrates sessions that dissolve, shadow that falls out of scope, culture that re-derives rather than re-reads. Several voices: dissolution is removal, removal is breakage for whatever depended on it, and re-derivation discards exact prior state. The seam — a session is *process* (may dissolve), what it *learned* is *information* (must accrete) — is named, but *where* the commitment line sits, and whether re-derivation counts as loss, the substrate must still decide.

4. **Running-is-learning / opening vs. the perception/action split.** `inside.md`'s *running is learning* and *opening* visions fuse observing and updating into one continuous act; *Are We There Yet?* insists reading and writing stay categorically separate and observation never deforms the work. A deliberate research frontier the biological target may genuinely require — not a wording gap. No "reading never blocks the work" convention should pre-resolve it.

5. **Friction: wrongness vs. generative constraint.** `inside.md`: "when something feels forced, it is wrong." *Design, Composition and Performance* (and *Spec-ulation*'s "reluctant to remove? good"): chosen, self-imposed constraint is the engine of simple design, and accretion itself often *feels* forced (keeping a name you'd rather delete) yet that is correct discipline. The line — forced-by-circumstance friction is a bad smell; chosen-constraint friction is generative — is real but `inside.md` doesn't draw it.

6. **Folk-level vs. instruments-for-capable-operators.** `inside.md` prizes primitives an ordinary person can wield; *Design, Composition and Performance* and *The Language of the System* want instruments built for capable operators, programmatic contract before human ergonomics. A piano reconciles them (graspable *and* rewards mastery), but the surface pull is genuinely opposite — optimizing a primitive for first-contact ease can ruin it for the master.

7. **Meaning-in-structure vs. meaning-in-weights.** *The Value of Values*: if a fact's meaning is locked in a model it is not a value and loses comparability. `inside.md`'s *transparency of relationships* agrees — but its multidimensional / vector-space vision pulls toward learned representation. Real pull; kept visible, not declared settled.

8. **Proportional vs. pervasive enforcement.** `inside.md`'s "structure specified in the field and enforced by the field" reads as pervasive; *Effective Programs*, *Maybe Not*, *Spec-ulation* argue verification should be proportional to failure severity and at the edge. *Are We There Yet?* carves out one structural invariant (never fuse read and write over a place) that is absolute, not proportional. Most checking is proportional; a few invariants are absolute — keep both.

## One flag for `inside.md` — resolved

The scribe noted that `inside.md`'s *self-describing field* vision — "the field knows what must be present" — read, taken literally, as baking requiredness into the type, the exact mistake principle *Shape in the field; requiredness at the point of use* guards against. Resolved in the merge: that vision now reads "what shapes things take ... and, at each point of use, what that use requires," pointing at the principle.
