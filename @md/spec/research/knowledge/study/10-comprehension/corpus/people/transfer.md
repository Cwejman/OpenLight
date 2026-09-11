# Why insight does not travel

The organisational-knowledge literature is older and better-designed than anything in the documentation lane, and it names the mechanisms that make knowledge stick where it is. This brief holds what is established, what is framework, and what is folklore — because the folklore in this territory is unusually dense.

## 1. Stickiness, measured once and well

Szulanski (1996), *Strategic Management Journal* 17: **271 returned questionnaires spanning 122 transfers of best practice in 8 companies**, analysed by canonical correlation. The ranked barriers: recipient's lack of **absorptive capacity** (0.54), **causal ambiguity** (0.34), **arduous relationship** between source and recipient (0.33). Motivation ranked low.

Three caveats are visible in the paper itself and should travel with it. The headline analysis used **only 87 of the 271 observations**, raised to 142 in a robustness re-run which preserved the rank order of the top three. Canonical correlation "does not provide indications of statistical significance" for individual weights, by the author's own footnote. And he states the sample "may be too small to ensure the stability of any but the three largest canonical weights."

So: the top-three ranking is robust; everything below rank three is not. And there has been **no true replication** — the author's own later work extends rather than independently tests it.

Note what "arduous relationship" means in his gloss: the relationship serves "as a conduit for knowledge" and affects "the recipient's ability to acquire knowledge *when needed*." A contract, a procurement gate or a ticket queue is an arduousness generator.

## 2. Absorption is a property of the receiver

Cohen & Levinthal (1990) established that a firm's ability to use external knowledge depends on **prior related knowledge** — absorption is a function of what the receiver already knows, not of how well the sender writes. The construct replicated and is heavily moderated: a 2025 meta-analysis in the *Journal of Product Innovation Management* finds effects roughly **twice as large in low-tech manufacturing and services as in high-tech industries**, and about twice as large in the smartphone era as before the internet; a 2023 meta-analysis explicitly challenges the assumption that absorptive capacity unconditionally improves firm performance.

The consequence is structural, not editorial. An organisation that has outsourced away its technical staff has, by construction, destroyed its own absorptive capacity, and no amount of writing recovers it.

## 3. Three kinds of boundary, and only two are writable

Carlile's distinction is the sharpest tool available. A **syntactic** boundary is a difference of vocabulary — a glossary fixes it. A **semantic** boundary is a difference of meaning — translation fixes it. A **pragmatic** boundary is a difference of **interests**, and it requires *transformation*: both sides give something up.

A client and a delivery vendor differ not merely in terms or in meanings but in interests — the vendor is paid for delivered scope, the client wants an outcome. This predicts that documentation improvements will systematically underperform expectations at contractual boundaries, and it is the most defensible mechanism in the sweep for that case.

The framework layer around it: Star & Griesemer's boundary objects (1989) is a historical case study, N = 1. The best modern empirical work is Wohlrab et al. (2019); its design and its load-bearing finding are in [`structure.md`](structure.md) §3.

## 4. Why a document cannot repair a misunderstanding

Clark & Brennan (1991) established the **principle of least collaborative effort**: participants minimise *joint* effort, not sender effort — so the cost of producing a perfect utterance often exceeds the cost of collaboratively repairing an imperfect one.

Their medium analysis predicts the handover problem directly. A document is maximal in reviewability and revisability, and **zero in cotemporality and simultaneity**. The cheap repair loop that makes conversation efficient is unavailable, so grounding failures cannot be repaired in the moment and compound silently — and the least-collaborative-effort solution is usually to go and ask someone.

This is theory with laboratory support, not a field test of organisational handover. It is nonetheless the clearest account of why a document has a ceiling that better writing does not raise.

## 5. Transactive memory, and how much of it is measurement

Fausett et al. (2026), *Small Group Research*: 44 studies, 103 effect sizes, transactive memory to team outcomes **r = .44** [.36, .50]. But the moderator is the finding: self-report **r = .77** against observer ratings **r = .38** and embedded metrics **r = .39**. Roughly half the headline effect is common-method variance. A prior meta-analysis finds the construct binds more strongly to *affective* than to performance outcomes.

The adjacent result often cited alongside it: DeChurch & Mesmer-Magnus (2010) meta-analysed **231 correlations from 65 studies** (3,738 groups, ~18,240 members), finding corrected correlations of .38 between team cognition and team performance and .35 with team process. It is correlational, about teams, and does not establish that writing things down causes shared cognition.

## 6. What Romer will bear

The compounding claim is often grounded in Romer (1990), and the sweep verified both what it supports and the half that is usually dropped.

The sentence it will bear: Romer models technology as "**a nonrival, partially excludable good**" whose instructions, once created, "can be used over and over again at no additional cost."

**The excludability is load-bearing, and dropping it misstates the model** — partial excludability is what makes private research profitable, and "non-rival" alone is not Romer's claim. What the paper will *not* bear is compounding as a result: the linearity that makes unbounded growth possible is, in his own words, "more like an assumption than a result of the model," and the abstract states that "having a large population is not sufficient to generate growth." Those two corrections are in [`folklore.md`](../folklore.md) §5.

## 7. Organisational learning failure is theorised, not measured

The most-cited framework in this group, Nonaka's SECI spiral, is retired by name in [`../folklore.md`](../folklore.md) §9. The rest stand as follows. Vaughan's *normalization of deviance* is a single deep historical case, enormously influential and formally untested. Morrison & Milliken's *organizational silence* is a conceptual model, and reviews note there has been little direct empirical research on the effects of silence. Tucker & Edmondson's barriers — first-order problem solving, lack of integration, lack of institutionalisation — are the most operational finding in this group.

## 8. The restated claim

One agent offered a defensible restatement of the project's motivating claim, and it is worth carrying whole because it keeps the evidence and drops the folklore:

> Organisational structure is a stronger predictor of software failure than any property of the code itself (Nagappan et al., Vista, 86% precision). The dominant barriers to knowledge moving inside an organisation are not motivational but knowledge-related: the receiver's capacity to absorb, the irreducible ambiguity of the knowledge, and the arduousness of the relationship between the parties (Szulanski, 122 transfers). Where an organisational boundary is also a boundary of interest — as between a client and a delivery vendor — shared vocabulary is insufficient by construction; such boundaries require transformation of both parties' knowledge, not translation (Carlile). Late-discovered misunderstanding is more expensive than early-discovered misunderstanding; the multiplier is context-dependent, spanning roughly 5:1 for small non-critical systems to 100:1 for large ones, and good architecture compresses it (Boehm & Basili, 2001, in their own words).

Three concessions go with it: drop every figure in the 1:10:100 family, state that the documentation-to-outcome link is correlational only, and frame the artifact as one mechanism alongside mentorship and relationship design rather than as the mechanism. The retired figures are in [`folklore.md`](../folklore.md).

Report: [`abdf5bfa14a7ddd82`](../../../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md).
