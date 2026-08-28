# The code, against the evidence

*Research register: structured, uncommitted, nothing binding. 2026-08-26, from a thirteen-agent sweep run against [`code.md`](code.md)'s six principles and its named opens. This file scores the code; it does not amend it. Ratification is the author's, and several findings below argue for changes only he can make.*

## Why this file exists

`code.md` was derived from first principles — two blind derivations converging with a steward's pre-draft — and its *Grounds* section is honest that its evidence is thin: one production entry, two native precedents, one measured failure case, one method result. The sister study's chart named eleven territories and verified none of them, saying so in its own status line.

This is the verification pass. It reports three kinds of thing: where the literature **supports** a principle, where it **contradicts** one, and where a citation the code or the ladder leans on **does not say what it is used for**. The third category turned out to be the largest.

## The six principles, scored

**1 — The reader's order governs, why before how.** *Split.*

The **ordering** half is supported. Meyer's levels effect: relations placed in the top third of a structure "dramatically influenced comprehension," while the same relations low down "affected comprehension minimally."

The **abstraction** half is contradicted, twice, independently. Stone (1983, 112 studies) found the advance-organizer effect real while Ausubel's *mechanism* — subsumption under a more abstract frame — is specifically what the high-effect studies failed to match: lower effect sizes for **written-only** and **abstract** organizers, *higher* for **non-subsuming** ones. Citing Ausubel to justify "an abstract opening subsumes the detail below" cites the exact prediction the data refused. The effect is also small — Luiten et al. (135 studies) is **d = .21**, the authors' own framing being 58th percentile against 50th — and one moderator cuts directly against a written-summary-first rule: **aural mode outperformed written**.

Third qualification: prequestions buy **g = 0.54** on material they cover and **g = 0.04** on everything else in the same text. Why-before-how allocates attention; it does not multiply comprehension.

> *Suggested*: keep the ordering rule, drop "the opening is more abstract than the body," and consider its opposite — the evidence favours a concrete, scenario-shaped opening.

**2 — The fold.** *Bounded units supported; the vehicle rule and the split criterion unsupported, and now contradicted in practice.*

Segmenting is meta-analytically supported (56 investigations), but the mechanism is **learner-controlled pacing, not conceptual self-containment** — and design effects are weakest in self-paced reading, which is what document reading is. No evidence supports "two reasons to exist" as a split criterion, and none supports any size; 7±2 and Cowan's 4 are misapplications here (see *Folklore*).

**"A fold is a file" now has a documented failure report.** Google's Pigweed team adopted Diátaxis "as a literal blueprint and it resulted in too much fragmentation… Users and teammates found it annoying to have to jump back-and-forth so much," with the mechanism named: "if you only link to explanations from the tutorial, some (most?) users won't click those links, and therefore may never get exposed to the theoretical foundations." **They retreated to sections within a page.** That is the author's own feedback note, independently arrived at by a named team.

**3 — The reference.** *Supported — the best-evidenced of the six.*

DeStefano & LeFevre: link-driven decision-making impairs reading, fewer links learn better, and low-working-memory and low-prior-knowledge readers pay most. Critically, **hierarchical link structures rescue this and network structures do not** (disorientation f = 0.58; reading-sequence coherence f = 1.35). The removability clause — a fold must read complete with every link deleted — is exactly the remedy this literature implies.

Unevaluated: the outcome-versus-topic phrasing rule, and the settledness marker. Neither is contradicted.

**4 — One home, many paths.** *Sound as maintenance discipline; contradicted as a comprehension claim.*

The redundancy effect concerns the *same* content in two channels *simultaneously*, within one working-memory episode. It says nothing about a fact stated once authoritatively and restated in a document read weeks later. Pushing the other way: McNamara's high-coherence texts were the *more elaborated, partly restating* ones and won for low-knowledge readers, and distributed restatement is the mechanism behind spacing. Only the coarser-abstraction carve-out has backing.

> *Suggested*: keep the rule, change its warrant. It is one-source-of-truth for correctness and maintenance, not a comprehension finding.

**5 — Status is part of the writing.** *No evidence, either way.*

Nothing in the comprehension literature addresses epistemic-status markers. And across the whole decision-record family — ADRs, IETF RFCs, Rust RFCs, PEPs, Oxide RFDs, Google design docs — **no study of any design links any of them to a downstream engineering outcome**. What is measured is decay: about half of GitHub repositories with ADRs contain one to five records, "suggesting that the concept has been tried but not yet definitively adopted." The one quantitative study of RFC governance measures its *cost*.

The principle stands on first principles. It should say so.

**6 — Every stopping point pays.** *Spirit supported; the deletion clause contradicted.*

Meyer's levels effect supports front-loading the load-bearing relations, and professionals read non-linearly — **and less linearly with expertise** (novices ~70% linear on code, professionals of 5–28 years ~60%). Any-prefix-usable fits how they actually read.

But the deletion clause — "a fold that exists only to set up other folds is not a fold; merge or delete it" — would delete **Mayer's pre-training principle**, which is exactly a segment existing only to prepare later segments and is meta-analytically supported. Advance organizers are the same shape.

## What the evidence adds that the code misses

- **Signal words and connectives** — the cheapest supported intervention in the literature (r = .17; d+ ≈ 0.32–0.39), larger for low-prior-knowledge readers. No principle mentions them.
- **Genre.** Narrative is better understood *and* better recalled than exposition across >75 samples and >33,000 participants, "not moderated by various study characteristics" — the largest, most robust effect in the lane. `code.md` says keep laws expository. The operative variable is *relevance*, not concreteness: seductive (irrelevant) details reliably harm.
- **Self-explanation prompts** — g = 0.55. A document can ask something of its reader; no principle contemplates that.
- **Durability** — every delayed effect in the text-structure meta-analysis was non-significant. Structural interventions that look strong at immediate test may buy nothing a week later.
- **Carrying hierarchy into the text.** Title-chain prefixing — reusing a document's own header hierarchy, zero extra model calls — improved retrieval MRR@5 from 0.374 to 0.463 (+23.8%) over 1,600 queries on a production Markdown knowledge base. This is the first direct evidence on the one-artifact question, and it favours **one document with its hierarchy carried inline**, not partition.

## Two corrections that support the code

**Expertise reversal is asymmetric, and it vindicates the no-forked-prose rule better than the code's own argument does.** The interaction is strong (d = 0.971, 60 studies, 5,924 participants, no publication bias) — but novices *gain* reliably (d = 0.505) while experts are harmed only d = −0.428 overall and **non-significantly within every education stratum**. Scaffolding for the newcomer costs the resident expert far less than folklore claims.

From the professional side, the same conclusion by a different route: comprehension time falls monotonically with experience (66.37% / 55.97% / 44.43% of working time; 78 professionals, 3,148 instrumented hours, F = 79.4) — **not** expertise reversal — while three professional studies find experience does *not* moderate documentation difficulty. **Experts read faster and are blocked by the same content defects as everyone else.**

**The coherence gap, stated correctly.** The low-cohesion benefit is restricted to **less-skilled but high-knowledge** readers; skilled comprehenders with high knowledge did *better* with high-cohesion text. Deliberately under-explaining does not help your best readers.

## Folklore — do not cite

Chased to primary sources this sweep. Each is currently load-bearing somewhere in the code, the ladder, or the chart.

- **"Two levels, three at most."** No support. Every study is a fixed-item-count optimum, and the winning breadths were **8, 16 and 32** — all wider than the working-memory numbers the rule derives from. D. P. Miller 1981 (**not** George Miller) found two-levels-of-eight optimal *at 64 items*; Kiger's fastest condition was **4×16**, with differences among the top three not reliable; Larson & Czerwinski's winner was **16×32** at 512 items, with no significant difference from 32×16.
- **Cowan's "4" as a design ceiling.** Visible only under four boundary conditions that experimentally *block* recoding. A browsable, re-readable hierarchy meets none. His own restatement is 3–5 items in young adults.
- **Chase & Simon as evidence for a chunk limit.** They *assumed* Miller's span — "the number of chunks should be a small constant **within the memory span (7 + 2)**" — and tested inside it. N = 3.
- **"7±2".** Miller called it "a pernicious, Pythagorean coincidence" and distinguished two different spans.
- **Dunbar's number.** The reanalysis gives 95% CIs of **4–520 and 2–336** — not 16–109, which is the span of the point estimates. Conclusion: "specifying any one number is futile."
- **Luhmann as a shallow-structure existence proof.** The archive documents **up to four sub-levels**, 108 divisions in ZK I ranging from one to over 4,000 slips, and one division with 120 subdivisions — "without one being able to say that this is a strictly hierarchical or systematic relationship."
- **Romer as a compounding proof.** Knowledge is "nonrival, **partially excludable**" — the excludability is load-bearing. And: "unbounded growth is more like an assumption than a result of the model"; "**having a large population is not sufficient to generate growth**."
- **"Developers spend 10x more time reading than writing."** Traces to *Clean Code* (2008), whose stated provenance is an anecdote about replaying Emacs edit sessions — no instrumentation, no N — and which describes *scrolling and navigation*, not comprehension.
- **"50% of time on comprehension."** The load-bearing citation (Fjeldstad & Hamlen 1983) is unretrievable and demonstrably cited-unread: two papers cite the same item with incompatible bibliographic records.
- **"Understanding a program occupies ~35% of total time"** — a mis-citation *inside* the peer-reviewed literature. The primary says 35% on "the mechanics of navigation within and between source files."
- **The 1:10:100 defect-cost ratio** and the "IBM Systems Sciences Institute" behind it — a corporate training unit in Los Angeles, c. 1967–82, not a research body. Siblings in the same condition: "70–85% of rework from requirements," "50–60% of defects originate in requirements," the Standish CHAOS rates, Team Topologies' productivity numbers, and DORA's "656% lift" (cross-sectional self-report, with DORA's own "we can speculate" hedge).
- **Boehm's curve.** Boehm & Basili themselves wrote in 2001 that the factor is "more like 5:1 than 100:1" for small non-critical systems, and that good architecture compresses it.
- **"Graphic organizers ES 1.24 vs expository 0.80"** — absent from both cited meta-analyses' abstracts and ERIC records. Two agents failed to trace it independently.
- **"Minimal Manual: ~40% less learning time"** — untraceable to any primary source. The *effect* is real and replicated; the number is not.
- **GitLab's "~605,000 words"** — absent from every GitLab page, live and archived. "Over 2,000 pages" is confirmed.
- **Nielsen's card-sort correlation table** (r = 0.75@5 … 0.98@60) — read off a graph; those values appear nowhere in the paper it is attributed to, whose own buried table shows **35% of base-cluster pairs still separated at N = 40**.

## The organisational claim, restated defensibly

`code.md`'s aim opens on governance failing where insight cannot travel. The claim is groundable, and needs restating to be so. The defensible core:

- **Organisational structure predicts software failure better than any property of the code** — 86.2% precision / 84.0% recall on 3,404 Windows Vista binaries, beating churn, complexity, dependencies, coverage and pre-release bugs.
- **The barriers to knowledge moving are knowledge-related, not motivational** — recipient's absorptive capacity, causal ambiguity, and an *arduous relationship* between source and recipient (122 transfers, 8 firms). Motivation ranked low.
- **Absorption is a property of the receiver's prior knowledge.** A client that outsourced its technical staff has, by construction, destroyed its capacity to absorb — a structural claim, not a documentation one.
- **A client↔vendor boundary is a *pragmatic* (interest) boundary**, requiring transformation of both parties' knowledge, not translation. Shared vocabulary is insufficient by construction.

And the ceiling, stated honestly: **prescriptive artifacts get maintained and descriptive ones do not** (53 practitioners, six companies) — with the guideline "produce locally relevant artifacts, especially those for documentation, as late as possible and only when they are actually needed." Mentorship outranked documentation in free-response onboarding data at Microsoft. A document has full reviewability but **zero cotemporality**, so grounding failures cannot be repaired in the moment.

There is a reading of this that is *for* the project rather than against it: the literature's ceiling on documentation is a ceiling on **descriptive** documentation. A spec that is a contract the system enforces is prescriptive by construction. That is an argument for the substrate, and it is currently made nowhere.

## The generalisation gap

The comprehension literature is junior-high and undergraduate readers, passages of a few hundred to a couple of thousand words, single 15–30 minute sessions, outcomes measured minutes later. Professionals reading specifications are high-prior-knowledge, self-paced, goal-directed readers — exactly the corner where signalling shrinks, organizer effects shrink, coherence effects reverse or vanish, and the meta-meta-analysis (1,189 studies, 78,177 participants) finds design matters **least**.

The professional literature is thinner than hoped and partly deflationary: checklist-based reading is no better than ad hoc reading in two studies across both populations; inspection meetings produce no net defect-detection gain, twice; and the perspective-based-reading meta-analysis reports "strong indicators of researcher bias" in the literature supplying its own headline figure. The field's eye-tracking base rate is roughly 28 student studies to 6 professional.

**And the study that would settle the actual question does not exist**: no longitudinal study of professionals re-reading a long technical document over months, and no head-to-head of declared structure against a well-written prose document with the same reader.

## What this suggests, if the author wants it

Not folded, not decided — for the ratification read:

1. Drop "the opening is more abstract than the body"; keep the ordering rule.
2. Change principle 4's warrant from comprehension to maintenance.
3. Soften principle 6's deletion clause to spare pre-training material.
4. Reopen "a fold is a file" — the vehicle rule now has a named team's retreat against it and a retrieval result favouring hierarchy carried inline.
5. Restate V1's compounding clause to what Romer supports, and say plainly that compounding across heads is currently unearned in a one-author project.
6. Add signal words, and take a position on genre.
7. Mark principle 5 as first-principles, since no evidence exists either way.
8. Replace every folklore citation above with the source's own words.

## Method note

Thirteen parallel agents, deliberately not bootstrapped on this repo. Several exhausted web-search budgets and fell back to direct fetches from publisher PDFs, ERIC, OpenAlex, Crossref, Unpaywall and arXiv, which over-samples open-access work.

**Two agents independently caught automated summarisers fabricating verbatim quotations and sample sizes.** Everything above was re-verified from primary text by the agent reporting it, or is marked unverified. That failure mode is the strongest argument in this file for principle 5: a claim that does not carry its status is a claim that will be laundered.
