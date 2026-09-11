# Records of decisions, and the processes that make them

Architecture decision records, RFCs, PEPs, KEPs, design docs and the older design-rationale research form one body. Four agents worked it independently and returned the same shape: the practice spreads on an experience report, nobody measures it, roughly half of what gets written is written once and abandoned, and heavyweight processes accumulate a backlog with no exit path.

## 1. ADRs, measured twice

**The origin is an experience report.** Michael Nygard, 2011-11-15. Its entire evidence base is one sentence: the format had been used "on a few of our projects since early August" with "quite positive" early feedback. ThoughtWorks' Technology Radar took it to Trial in November 2016 and to **Adopt in November 2017** — fourteen months, on zero data — and has not revisited it since May 2018, five years before anyone counted whether ADRs are maintained.

**The adoption study.** Buchgeher, Schöberl, Geist, Dorninger, Haindl & Weinreich, *IEEE Access* 11:63725–63740, 2023. From 26.4 million GitHub users, 282,789 candidates, manually verified down to **921 repositories holding 6,362 ADR files**. The numbers that matter:

- **554 repositories (>50%) hold one to five ADRs.** Maximum ever observed: 73. Only 47 repositories (5%) exceed twenty.

- **3,255 of 6,362 ADR files (~51%) were committed exactly once and never modified again.** 278 repositories had every ADR file edited on a single day and never touched again.

- 453 repositories (~49%) had a single ADR author. Restricted to repositories with ten or more ADRs, only 16% are single-author.

- Templates: Nygard 723 repositories (~75%), MADR 129 (14%).

- **Only 42 repositories (4.6%) meet all three sustained-use criteria** — twenty or more ADRs, two or more authors, six or more months of editing.

- Adoption lag: the first ADRs appear in 2013, about five years after Nygard's post.

**The impact study, and it is the money finding.** De Santana et al., ICSA 2026 — reuses Buchgeher's 921 repositories and ~5,800 ADRs, adds PyDriller and SonarQube. Verbatim: "ADR-related variables exhibit **predominantly small correlations** with code quality and productivity metrics, suggesting that ADR adoption is associated with, **at most, modest observable effects at scale**." And: "**about 63% of ADRs are opened directly with a status of 'accepted' or equivalent, bypassing the deliberative context that ADRs are intended to capture**."

Fifteen years after Nygard, that is the first study to look for an effect, and it found essentially none.

**Everything else is small.** The only in-situ trial is one Swedish consultancy, two teams, **7 interviews over 3 months** — positive on culture, and the paper never reports how many ADRs were written. Its one finding about the artifact is about placement rather than content: Ahmeti, Linder, Groner & Wohlrab (ECSA 2024) report that **where the records are stored dominates their perceived usefulness**. *Paper-only, single site; perceptions, not measures.* The template comparison is **33 undergraduates** finding Nygard beat MADR on comprehension (p = 0.002, Cliff's δ = 0.64), which measures template usability, not whether rationale helps a later reader. A larger corpus exists — 164,372 ADR files from 25,051 repositories, median 427 words, **median 3 ADRs per repository** — but it is a bachelor's thesis and purely descriptive.

## 2. The premise was never measured either

"Architectural knowledge vaporization," the thing ADRs exist to prevent, comes from Jansen & Bosch, WICSA 2005 — **a conceptual paper with no measurement**. The premise is asserted, never tested.

## 3. Design rationale: fifty years, one controlled experiment

The older tradition — gIBIS (1988), QOC (1991), DRL, SEURAT — produced representations and no outcome evidence. The canonical account of why capture fails is Shipman & Marshall's *Formality Considered Harmful* (CSCW 1999, 165+ citations), and it is an **experience-reflection essay, not a measurement study**: its own abstract says it "reflects on experiences designing, developing, and working with users of a variety of interactive computer systems."

Its four mechanisms are nonetheless the best account available. **Cognitive overhead** — "formalisms are often difficult for people to use because they need to take many extra steps (and make additional decisions) to specify anything… chunking, naming, linking, and labeling." **Tacit knowledge** — "experts cannot reliably give an account of their expertise," and introspection "necessarily interrupts the task; the introspection structures and changes it"; the sharpest example is design students who cannot produce IBIS-style argumentation even though videotapes show their natural discussions already follow it. **Premature structure.** **Situational structure** — different people, different tasks.

**Capture cost is richly evidenced as a phenomenon and never quantified.** The closest data point is descriptive: Karsenty's capture required two dedicated scribes processing four audiotaped two-hour meetings over a nine-month project phase, producing 31 questions, 46 options, 25 criteria and 12 justifications — done by scribes precisely because the design office chief did not believe designers would document rationale themselves.

**Does recording *why* pay?** Two studies examine it against an outcome and only one is controlled. Bratthall, Johansson & Regnell (PROFES 2000): **N = 17** from industry and academia, realistic change tasks on two complex embedded real-time systems with a retrospective rationale document as treatment. "For **one of the systems**, there is a significant improvement in correctness and speed… **For the other system the results were inconclusive**." No effect size stated; never replicated. Karsenty (CHI 1996): **N = 6** experienced professional designers, no control condition — 138 questions coded, rationale questions the most frequent category (63% for engineers), and **only 41% of designers' rationale questions (31 of 76) were answered by the rationale document**. His own conclusion: "it is not because such documents… are available that they will be consulted, even if they contain information needed by designers!"

That is the entire quantitative case for recording why.

## 4. Design docs rest on one blog post

Malte Ubl's "Design Docs at Google," 2020-07-06 — zero citations, zero data, no sequel. *Software Engineering at Google* chapter 10 describes design docs as "a form of code review before any code is written"; **the only number in the chapter is a footnote**: when GooWiki was deprecated, "around 90% of the documents had no views or updates in the previous few months." Google's own engineering-productivity research measures code review, not design docs.

Amazon's six-pager traces solely to Bezos's 2017 shareholder letter, which contains no data. Gergely Orosz's catalogue of RFC and design-doc practice across 100+ companies is entirely descriptive — **no company writeup reporting measured results was found**.

The one controlled result, Ernst & Robillard's N = 65 finding that format does not matter, sits in [`evidence.md`](evidence.md).

## 5. The heavyweight process has no exit path

Four open-source processes, measured by an agent during the sweep rather than by their projects.

**IETF.** RFC 9280 (2022) was already replaced by **RFC 9920 (February 2026)**, which is the genuine retrospective: it admits no appeal pathway existed and that "RFCs are not changed" was unworkable, and §9 names why the previous two models failed — "lack of transparency, lack of avenues for community input into policy definition, and unclear lines of authority." Editorial-stream output: **three RFCs in four years**. Overall volume roughly halved since 2012–16: 338 RFCs in 2012, 310 in 2016, 209 in 2020, 173 in 2023, 208 in 2025. Where that time goes was instrumented once: RFC 8963 (Huitema, 2021) took 20 RFCs from a 2018 sample and found a mean of 1,200 days from draft to publication, of which about **999 days — 83% — were spent inside working groups**, against ~110 days in review and ~104 in production, with a 35-day mean for author sign-off. The delay is in deliberation, not in editing. *Paper-only, n = 20 and a single year; that small sample is why the "three to four times slower than 1998" claim built on the same document is retired in [`../folklore.md`](../folklore.md) §8.*

**Rust.** Never reformed — routed around. As of 2026-08-26: 4,003 pull requests ever, **639 accepted RFCs** (~16% acceptance), **215 open with a median age of 905 days**, 89 over three years, 35 over five, the oldest since 2017. Accepted RFCs merge in a median of 70 days; the backlog simply never closes. Sixteen RFCs sit in pending final-comment period, the oldest open since 2022-06-08. Against that, **major change proposals: 585 filed, 425 accepted, only 17 open.** The lightweight process clears; the heavyweight one silts.

**Kubernetes.** All 662 `kep.yaml` files: implemented 295, implementable 277, provisional 66, withdrawn 10, replaced 6, rejected 3, deferred 1, superseded 1. So **343 KEPs are in a non-terminal state and only 14 were ever explicitly killed**; 184 of those have no milestone since late 2024, and 82 have no milestone at all. The front of the funnel keeps growing — 94 KEPs targeting v1.37 against 47 at v1.36 — while the back never closes. The KEP-fatigue issue, filed 2022-06-16 by a SIG-CLI maintainer, was **closed as `not_planned` on 2024-12-30**: it rotted out under the stale bot.

**Python is the outlier.** 738 PEPs; median created-to-resolution ~164 days for 2024 onward. It did not fix the PEP process — it **shrank what a PEP must decide**, standing up four domain councils: Typing (PEP 729), C API (731), Documentation (732) and Packaging (772).

**There is one quantitative study of consensus governance, and it measures the cost rather than the benefit.** Simcoe, "Standard Setting Committees: Consensus Governance for Shared Technology Platforms," *American Economic Review* 102(1):305–336, 2012, using IETF data: "an observed slowdown in standards production between 1993 and 2003 can be linked to distributional conflicts created by the rapid commercialization of the Internet." A top-five economics journal, well cited — and note the direction. It is evidence about what consensus costs when interests diverge, not about what it buys. Outside it, no outcome study of any of these processes exists.

**Two critiques supply the mechanism the backlogs only show as a symptom.** Jacob Kaplan-Moss (2023-12-01): **RFC processes lack an explicit *decide* step, so they default to "no."** His second observation is about how the artifact defeats the process — an engineer who "would write RFCs so incredibly long that nobody would want to read the whole thing, thus making sure nobody objected." Nick Cameron (2022-02-19), named by the agent as the only critique with numbers, lists four faults: one template for all domains; chronological comment threads; **no follow-up tracking of whether an accepted proposal ever shipped**; and an incentive never to close a stalled discussion. Both are opinion. Both are also the only account of *why* the numbers above look as they do.

**The one intervention with a visible before-and-after in any of the data is scope reduction, not process reform.** Python's councils and Rust's major change proposals are the same move. Nobody has published a controlled comparison.

**Oxide's RFDs** have tooling open-sourced and actively pushed, and **zero published metrics of any kind**; the public index redirects to a login. The claim that they demonstrably work rests on employee assertion.

## 6. People record why; they just do not record it here

One large-corpus finding cuts against the deflation above, and it changes the conclusion's shape rather than its direction.

Dhaouadi, Oakes & Famelis (arXiv:2403.18832, 2024) labelled Linux kernel commit messages on the out-of-memory killer: **98.9% of commits contain sentences carrying rationale information**, and experienced developers report rationale in roughly 60% of sentences. Alongside it, Tian, Zhang, Stol, Jiang & Liu (ICSE 2022) sampled ~1,600 messages from five highly active projects against a why-and-what framework and found about **44% "could be improved"** — which means 56% were not found wanting.

Both are observational and neither ties recording *why* to a measured maintenance outcome. But together they say that the conclusion is not "people don't record why." It is that people record why in the commit, and the decision record — the artifact the practice names — is the thing that goes unmaintained.

## 7. The 2026 turn, and the only positive effect size

The activity has moved to treating decision records as *model* context, and that is where a measured improvement appears for the first time.

Kitayama (TechRxiv, 2026-03-05): a controlled TypeScript build with ADRs served to a model over MCP — **−10.1% development time (496 against 552 minutes), −10.8% tool calls**. The headline is sharper than the time saving: identical test-driven-development instruction placed in a `CLAUDE.md` produced **zero** end-to-end tests, while conditions carrying the *rationale* in ADRs spontaneously produced 16–25. It is n = 1 workflow, single author, unreplicated preprint — cite it as a hypothesis.

Alongside it: a 4,500-ADR corpus across 750 repositories finds a **3–5 record recency window matches full history** for generation, so complete architectural history is unnecessary. A 4,911-ADR corpus puts the **median ADR at 56 tokens** — about 42 words. Models detect decision violations at 91.1% accuracy across a corpus of 980 records spanning 109 repositories — and the same study reports the split: they do well on explicit, code-inferable violations and fail on implicit or deployment-oriented ones. And model-extracted design rationale scores F1 0.351–0.389 — recall 0.63–0.72, precision 0.27.

The competing artifact tells the adoption story: `AGENTS.md` self-reports 60,000+ open-source projects, roughly sixty-five times Buchgeher's ADR-adopting repository count, in a fraction of the time — and its own evidence is a null. See [`agents/context-files.md`](../agents/context-files.md).

Reports: [`a63bf2eb6c5d05ba8`](../../../../../sweep-2026-08/raw/a63bf2eb6c5d05ba8.md), [`aae121db667d39f2d`](../../../../../sweep-2026-08/raw/aae121db667d39f2d.md), [`a7ea3bc0963c0e185`](../../../../../sweep-2026-08/raw/a7ea3bc0963c0e185.md), [`ab6fb706729be0f77`](../../../../../sweep-2026-08/raw/ab6fb706729be0f77.md), [`a7b21ac3d71f8c8f6`](../../../../../sweep-2026-08/raw/a7b21ac3d71f8c8f6.md).
