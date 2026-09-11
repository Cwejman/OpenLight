# What documentation has actually been measured to do

Three agents went looking for studies in which documentation was the manipulated variable and a performance outcome was measured. The honest answer is: almost none. This brief holds the handful that exist, the one organisation that restructured content and measured it, and the public collapse of the only large-N effort to link documentation to outcomes.

## 1. The field measures defects, not benefits

The modern software-documentation literature is large, well-sampled and has **no outcome variable**. Uddin & Robillard's "How API Documentation Fails" surveyed 323 IBM professionals and produced ten problem types; Robillard & DeLine's field study reached over 440 professional developers across three phases and produced a taxonomy of learning obstacles; Aghajani et al. mined 878 documentation artifacts into a taxonomy at ICSE 2019 and surveyed 146 practitioners at ICSE 2020. Every one of them is descriptive. None measures what good documentation buys.

Two of those descriptive findings are decisions, and they are worth lifting out of the taxonomy. Uddin & Robillard's ten problem types split into six **content** faults — incompleteness, ambiguity, unexplained examples, obsoleteness, inconsistency, incorrectness — and four **presentation** faults — bloat, fragmentation, excessive structural information, tangled information. **Content beat presentation on every measure**, with ambiguity rated top priority 51.9% of the time it was raised. And the same validation survey found **no statistically significant evidence that novices experienced documentation problems differently from experienced developers**, which corroborates the professional-reading result from an independent population ([`../reading/professionals.md`](../reading/professionals.md) §1). *Paper-only, self-rated severity across 323 IBM professionals; descriptive, with no task outcome.*

Documentation is also where developers say they get stuck. Robillard (2009) surveyed 83 Microsoft developers; of the 74 who named an obstacle to learning an API, **50 named resources and documentation** — the top category, above the structure of the API itself. *Paper-only, 8% response rate, self-report.*

There is no validated instrument. The nearest is Treude, Middleton & Atapattu's ten-dimension framework, published in a *Visions and Reflections* track — explicitly a vision paper, never validated at scale. And there is **no meta-analysis of documentation experiments** anywhere.

One statistic is solid and worth keeping: the GitHub Open Source Survey 2017, N = 5,500 **randomly sampled** from traffic to licensed repositories across 3,800+ projects — 93% of respondents observed incomplete or outdated documentation as a problem, and 60% of contributors rarely or never contribute to docs. It measures perceived prevalence, not cost.

## 2. The one genuinely causal line

Carroll's minimal manual is the only credible causal evidence that document design changes user outcomes, and it is forty years old.

Carroll, Smith-Kerker, Ford & Mazur-Rimetz, *Human-Computer Interaction* 3(2):123–153, 1987. **Experiment 1: N = 19** temp-agency office workers on an IBM Displaywriter — minimal-manual learners "required 40% less learning time," t(17) = 3.06, p < .01; "accomplished 2.7 times as many performance subtasks," t(16) = 3.63, p < .01; more than twice as efficient, t(16) = 2.90, p < .01. **Experiment 2: N = 32**, 2×2 between subjects, eight per cell — 58% more subtasks, F(1,28) = 5.31, p < .05; 93% more per unit time, F(1,28) = 6.13, p < .05; 29% less time reading; 20% fewer errors, **not significant**. Note that subjects spent 145 minutes — almost half their time — recovering from errors.

It replicated. Lazonder & van der Meij, *IJMMS* 39:729–752, 1993, d = 1.01. There is a meta-analysis — Ginns, Hollender & Reimann, AERA 2006, 13 effects, **total N = 288**, weighted mean **d = 1.12** [0.83, 1.41], homogeneous — but it was never peer-reviewed, it is a self-deposited conference paper, Carroll and van der Meij helped select the included studies, there is no funnel plot or publication-bias test, and two outliers carry much of the effect.

Two things in it cut against the way it is cited. The meta-analysts' own inference is that the "slash the verbiage" sub-effect (d = 0.89) approaches the whole effect (d = 1.12), so **the active ingredient may be plain redundancy reduction rather than the task-orientation theory**. And Carroll and van der Meij's "Ten Misconceptions about Minimalism" puts *"Minimalism means brevity"* at number one: "Wantonly slashing text and leaving other design characteristics unchanged will not lead to a minimalist design… if it really did produce better instruction, it would be the mother of all panaceas."

The line then stops. A 2021 search of six technical-communication journals for 2014–2019 on minimalism "came out empty-handed"; the named obstacles are no textbook, no disseminated best practices, very little cost-benefit information, and a finding that minimalist manuals take **30% longer to produce**. Its principal empirical successor has published nothing substantive on minimalism since 2003–04 and now works on instructional video.

The dispute is narrower than that hazard suggests. Williams & Farkas (*SIGCHI Bulletin*, 1992) report that three of minimalism's four tenets "are largely non-controversial" and that **guided exploration is "the most questionable precept"** — inherited from discovery learning, and the reason the critique below lands where it does. *Paper-only critique; the dispute is about induced discovery, not about brevity.*

One live hazard for anyone invoking it: Kirschner, Sweller & Clark's "Why Minimal Guidance During Instruction Does Not Work" (2006) has 6,813 citations — vastly more than anything Carroll wrote. It targets discovery learning rather than Carroll's minimalism specifically, but anyone citing "minimal instruction" as settled walks into it.

## 3. The one organisation that restructured and measured

Intercom/Fin, "A Causal Inference Approach to Measuring the Impact of Improved RAG Content," 2025-07-07. Matching-based average treatment effect on the treated, not an A/B test: improving knowledge-base content raised resolution rate by a **weighted average of +1.23 percentage points** in month one across roughly 1,000 customers, with top customers up to +10pp — and **only 0.22 correlation between the number of content approvals and impact**. Targeting beats volume: eight approvals could touch 76% of conversations.

This is the rare case of an organisation restructuring content and measuring the result, and the shape of its finding is the useful part. The gain is concentrated, not diffuse.

## 4. DORA, read from the primary documents

DORA is the only large-N link between documentation and outcomes, and it does not hold. An agent read all five reports at source.

**2021**, N = 1,200: documentation quality measured by **seven agree/disagree Likert items**, all perception-based. About 25% of respondents have good-quality documentation; those teams are "2.4 times more likely to see better software delivery and operational performance," 3.8× for security practices, 2.4× for reliability targets, 3.5× for site-reliability practices, 2.5× for cloud. **No confidence intervals, no p-values, no effect sizes are published for any of them.** Method: cross-sectional, snowball sampling plus a purchased panel, correlation-based partial-least-squares structural equation modelling.

**2022**, under "Surprises": "**Documentation practices negatively impacted software delivery performance. This is at odds with previous reports.**"

**2023**, N ≈ 3,000: software delivery performance shows "**No effect**," footnoted "We continue to be surprised to find no effect of quality documentation on software delivery performance. This is the second year we see this behavior." Also in that year: as documentation quality rises, some respondents report *higher* burnout. And the same report carries the one real-but-uninterpretable number in the series, which is the figure someone will quote at you — an amplifier table giving continuous integration 2.4×, continuous delivery 2.7×, **trunk-based development 12.8×**, loosely coupled architecture 1.2× and reliability practices 1.4×, each computed as a capability's impact at high documentation quality divided by its impact at low, with neither coefficient published and no interval on the ratio. Quote it only with that construction attached. *Cross-sectional and self-reported, from the report that also shows no effect of documentation on delivery performance.*

**2024**: "A 25% increase in AI adoption is associated with a 7.5% increase in documentation quality," with the methodology chapter conceding "we didn't do longitudinal studies or a proper experiment."

**2025**, N = 4,867 plus 78 interviews: "documentation quality" is **no longer a named capability**, replaced by "healthy data ecosystems" and "AI-accessible internal data" — and the relevant figures are published as **ordinal bands with no numbers at all**. Endnote 20: "Last year, we spoke in terms of 'effects'. This year, however, we will speak in terms of comparisons… we don't want to give false assurances that we understand the underlying causal structure."

Independent critique is thin because nobody replicated: Sallin et al. (XP 2021) reviewed 93 papers citing the underlying work and found that "none of them contained more information about the FKM than already presented." No peer-reviewed paper critiques or replicates the documentation-quality construct specifically.

## 5. Format does not appear to matter

Ernst & Robillard, *Empirical Software Engineering* 28(5), September 2023 — a controlled study, **N = 65**, randomised between narrative-essay and structured architecture documents. Result: **no significant association between documentation format and architecture-understanding performance**; the dominant factor was prior exposure to the source code. This is the best-controlled result in the decision-document area and it directly contradicts template-centric advocacy.

The professional-reader evidence agrees from a different direction: 181 practising physicians overwhelmingly *preferred* a multilayered guideline format (72% to 16%) while correct understanding moved only 58% to 72%, p = 0.06. See [`reading/professionals.md`](../reading/professionals.md).

## 6. Document review has been measured, and it returns nulls

One practice adjacent to writing *is* well-measured, and the results are negative. An agent verified four items directly.

**Review finds defects.** The base rate, from Boehm & Basili's 2001 list: peer reviews catch **31–93% of defects, median about 60%**. Hold that first, because the four findings below are about *how* you review, not whether review works.

**Checklists are no better than ad hoc reading — twice, in both populations.** **Inspection meetings produce no net defect-detection gain — twice.** The belief that **"developers skip the prose"** traces to a hedge rather than to a measurement. And Ciolkowski's meta-analysis of perspective-based reading — the literature supplying the widely-quoted 21%-to-38% improvement — reports "**strong indicators of researcher bias**" in that very literature.

A provenance note, because it changes how firmly these can be quoted. The four items above are carried in the raw as a summary of work the agent says it verified itself in *an earlier delivered report* — and that earlier report is not among the 45. So the verdicts are in the sweep and the study names, sample sizes and populations behind them are not. Treat them as directionally reported and unreconstructible from this material.

Alongside those, the one measurement in the sweep that touches having a second, context-free reader review a draft is weak and positive: a fresh session with no production history raises error-detection F1 on technical documents from 24.6% to 28.6% — see [`../agents/context-files.md`](../agents/context-files.md) §4.

## 7. The few real experiments that exist

Four studies manipulated documentation and measured performance, and they are worth naming because the list is short.

Mindermann & Wagner (arXiv:1807.01095): 58 students adding symmetric encryption to a Java program; participants using a curated code-example platform were "significantly more effective (+73%)" with "significantly less possible security vulnerabilities (−66%)." The cleanest modern documentation-as-treatment result; one task, one API domain, students.

Endrikat, Hanenberg, Robbes & Stefik (ICSE 2014): documentation and static typing interact — "the benefits of static typing are strengthened with explicit documentation." Internally limited by the authors' own framing; the task was chosen because both were expected to matter.

Prechelt, Unger-Lamprecht, Philippsen & Tichy (*IEEE TSE* 2002): pattern comments added to *already well-commented* 360–560-line programs; maintenance tasks touching the patterns completed faster or with fewer errors. Notable for isolating *marginal* documentation value.

Dekel & Herbsleb (ICSE 2009): surfacing buried API directives improved outcomes in a lab study.

Reports: [`af3e6b7e48703f0a0`](../../../../../sweep-2026-08/raw/af3e6b7e48703f0a0.md) for §6, [`abdf5bfa14a7ddd82`](../../../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md) for the review base rate, and [`a5e1231b95c4c9ac5`](../../../../../sweep-2026-08/raw/a5e1231b95c4c9ac5.md), [`a7b21ac3d71f8c8f6`](../../../../../sweep-2026-08/raw/a7b21ac3d71f8c8f6.md), [`abeeefde341d33a2d`](../../../../../sweep-2026-08/raw/abeeefde341d33a2d.md), [`a5e68a671a08e519a`](../../../../../sweep-2026-08/raw/a5e68a671a08e519a.md), [`a1c816c1f7cbcfdf9`](../../../../../sweep-2026-08/raw/a1c816c1f7cbcfdf9.md).
