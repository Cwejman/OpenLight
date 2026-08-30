# Does insight travel?

The code opens on a failure: something is understood, and it does not reach whoever needs it next — and the cost lands later, cut off from its cause. The sweep grounded that claim in the organisational-knowledge literature and then bounded it hard. **The core is real and better than folklore: the barriers to knowledge moving are knowledge-side, not motivational. But the ceiling findings are severe — no causal study of documentation exists anywhere — and they end up being night's best argument, not its refutation.**

## The grounded core

- **The barriers are knowledge-related, not motivational.** The one strong study (122 best-practice transfers across 8 firms; top-three ranking robust, everything below it unreliable — the paper's own caveat): what blocks transfer is the *recipient's* lack of absorptive capacity (canonical weight 0.54), causal ambiguity of the knowledge itself (0.34), and an arduous relationship between source and recipient (0.33). Motivation ranked low. Insight fails to travel because the receiver can't absorb, the sender can't explain, and the channel hurts.

- **Absorption is a property of the receiver's prior knowledge** (replicated construct, heavily moderated). Writing better does not fix a receiver who lacks the ground to stand the new thing on — the code's claim that a grounded environment is what lets a new person or idea arrive has this as its mechanism. The dark corollary: an organisation that outsourced its technical staff has structurally destroyed its own capacity to absorb.

- **Interest boundaries defeat vocabulary.** Where two parties differ in *interests* (client↔vendor, not just different terms or meanings), knowledge requires transformation — both sides giving something up — not translation. A glossary or a better spec addresses the wrong layer, which predicts documentation underperforming at exactly contractual boundaries.

- **Conway's law has teeth.** On Windows Vista (>50M LOC), organisational-structure metrics predicted failure-proneness at 86% precision — beating every code metric: churn, complexity, dependencies, coverage. One system, causally suggestive, unreplicated at that scale — but the strongest hard evidence in this lane, and it says the boundary you draw in the org chart is the boundary you later pay to cross in the artifact.

- **The cost multiplier, honestly.** Late-discovered misunderstanding costs more than early — direction established; magnitude context-dependent, roughly 5:1 for small non-critical systems to 100:1 for large ones, *in Boehm's own 2001 words*, with architecture named as what compresses it. The 1:10:100 family is confirmed folklore ([`folklore.md`](folklore.md) has the trace), and the requirements-percentage family was formally audited as "anecdotal or folkloric." The code's why must not echo the ratios.

## The ceiling

Findings any documentation project must sit with, stated without softening:

- **No causal study of documentation exists.** No RCT, no quasi-experiment anywhere with documentation as the manipulated variable and an organisational outcome measured. DORA — the strongest correlational evidence — reported 2.4× in 2021, a *negative* association in 2022, "no effect" in 2023, and removed the construct in 2025 while explicitly retreating from causal language ([`folklore.md`](folklore.md) carries the year-by-year arc).

- **Mentorship outranks documentation.** In Microsoft's onboarding data (411 developers), lack of documentation was the strongest *listed* factor, but in free response the ranking was mentorship first, documentation second — and unassigned mentors cost measurable time.

- **Descriptive artifacts rot; prescriptive artifacts get maintained.** Across six automotive companies: artifacts that generate something downstream stay current; artifacts that merely describe do not — with the blunt practitioner guideline to produce descriptive documentation "as late as possible and only when actually needed."

- **A document cannot repair.** Grounding theory's medium analysis: a document maximises reviewability and revisability and has zero cotemporality — the cheap repair loop that makes conversation efficient is unavailable, so misunderstandings compound silently, and the least-collaborative-effort solution is usually to go ask someone.

## What this means for night

Read together, the ceiling findings are not a case against night — they are the case *for* its central move. The literature deflates **non-load-bearing** documentation: prose beside the work, consumed by nothing, repaired by nobody. Night's field is the opposite wager — knowledge as data that programs, agents, and interfaces *consume*: prescriptive by construction, walked by traceability, with the repair loop restored because the next reader (person or model) acts on it and the failure surfaces where it was written. That is precisely the one class of artifact the evidence says gets maintained. The defensible restatement of the governance claim, assembled from the grounded core: organisational structure predicts failure better than any property of the artifact; the dominant barriers are the receiver's capacity, the knowledge's ambiguity, and the arduousness of the channel; interest boundaries need transformation, not translation; and the cost of late understanding is real, context-dependent, and compressed by architecture — not by multipliers from a training-unit slide.

## Not established

Any true replication of the stickiness study; the mirroring hypothesis beyond five matched pairs (p = 0.03, underpowered) — and the *inverse* Conway manoeuvre has no empirical support at all, only inference; the IS-outsourcing trust findings; effect sizes of the leading knowledge-transfer meta-analysis (paywalled). One process note that raises confidence in all of the above: this report's agent caught an automated summariser fabricating a sample size mid-research and re-verified its findings against primary PDFs.

---

*Sources: [`abdf5bfa14a7ddd82`](../../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md) (the whole lane: stickiness, absorptive capacity, Carlile, Conway, the ceiling, and the restatement) · [`abeeefde341d33a2d`](../../../../sweep-2026-08/raw/abeeefde341d33a2d.md) (the DORA construct year by year, primary-sourced) · [`a5e1231b95c4c9ac5`](../../../../sweep-2026-08/raw/a5e1231b95c4c9ac5.md) (the documentation-effectiveness through-line).*
