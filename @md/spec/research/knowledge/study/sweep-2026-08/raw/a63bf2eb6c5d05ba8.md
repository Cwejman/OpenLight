## A) Google design docs / design-doc culture

**Malte Ubl, "Design Docs at Google"** — https://www.industrialempathy.com/posts/design-docs-at-google/, `datePublished` 2020-07-06, `dateModified` 2022-05-27 (from the page's JSON-LD). Confirmed: pure experience report. Zero citations, zero data. Claims: docs surface issues early, force cross-cutting review (security/privacy/i18n), preserve rationale, 10–20 pages for large projects. Grade: **opinion**. No update or sequel exists — his blog index runs through 2026-02-18 with no revisit (https://www.industrialempathy.com/).

**"Software Engineering at Google"** (Winters/Manshreck/Wright, O'Reilly 2020), Ch.10 Documentation, by Tom Manshreck: https://abseil.io/resources/swe-book/html/ch10.html. Design docs described as "a form of code review before any code is written." The **only** number in the chapter is a footnote: "When we deprecated GooWiki, we found that around 90% of the documents had no views or updates in the previous few months." That's the single quantified documentation-decay datapoint Google has published. Grade: **opinion** (with one internal anecdotal statistic).

**Google research (research.google / Jaspan / Sadowski)**: no publication measuring design docs or design review. Their measured work is on *code* review (Sadowski et al., "Modern Code Review: A Case Study at Google," ICSE-SEIP 2018) and productivity/tech debt (Jaspan & Green, "Defining, Measuring, and Managing Technical Debt," IEEE Software 40, 2023, pp. 15–19, https://research.google/pubs/defining-measuring-and-managing-technical-debt/). Design docs are unmeasured at Google, publicly. Grade: **paper-only for adjacent topics; nothing on design docs.**

**The strongest measured evidence is DORA, and it's about documentation quality generally, not design docs.** 2021 Accelerate State of DevOps (https://dora.dev/research/2021/dora-report/2021-dora-accelerate-state-of-devops-report.pdf, Sept 2021): ~25% of respondents have good-quality internal documentation; those teams are **2.4x** more likely to see better software delivery & operational performance, **3.8x** to implement security practices, **3.5x** SRE practices, **2.5x** to fully leverage cloud. 2022 model (https://dora.dev/capabilities/documentation-quality/) shows lift to organizational performance splits by doc quality — e.g. trunk-based development 36% (below-average docs) vs **1525%** (above-average); CI 34% vs 750%. Self-reported survey constructs, not observed artifacts. Grade: **shipped-and-widely-adopted (survey research)**.

**Peer-reviewed on design documents specifically** — the key one: **Neil A. Ernst & Martin P. Robillard, "A study of documentation for software architecture," Empirical Software Engineering 28(5), Sept 2023**, https://doi.org/10.1007/s10664-023-10347-2. Controlled study, **N=65**, randomized to narrative-essay vs structured-document architecture docs. Result: **no significant association between documentation format and architecture-understanding performance.** The dominant factor was prior exposure to the source code. This directly contradicts template-centric design-doc advocacy. Grade: **paper-only**, but it's the best-controlled result in the area.

**FOLKLORE flag:** the standard justification for up-front design docs — the Boehm 1:10:100 "cost of change" curve — was tested and failed. **Menzies, Nichols, Shull & Layman, "Are delayed issues harder to resolve?", EMSE 22:1903–1935 (online 2016-11-14)**, https://doi.org/10.1007/s10664-016-9469-x / https://arxiv.org/abs/1609.04886: 171 projects, 2006–2014, largest study of the effect. "We found no evidence for the delayed issue effect… a long-held truth in software engineering should not be considered a global truism." Also see Bossavit, *The Leprechauns of Software Engineering* (2013), which traces the curve's citation chain to nothing.

**Amazon 6-pager**: primary source is Bezos's **2017 shareholder letter** (https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders) — "we write narratively structured six-page memos," great ones "written and re-written… should take a week or more." No data, no measurement, and the 2018 letter doesn't mention memos at all. Every "6-pagers make better decisions" claim traces to this. Grade: **opinion / FOLKLORE for any efficacy claim**.

**Stripe/Squarespace/etc.**: Gergely Orosz's catalogue (https://blog.pragmaticengineer.com/rfcs-and-design-docs/, 2022-06-21, updated 2024-02-07) covers 100+ companies and is entirely descriptive — templates and adoption, no outcomes. I found **no** company writeup reporting measured results. Grade: **opinion**.

## B) ADR decay / MSR studies

**The one real MSR study**: Buchgeher, Schöberl, Geist, Dorninger, Haindl, Weinreich, **"Using Architecture Decision Records in Open Source Projects—An MSR Study on GitHub," IEEE Access 11:63725–63740, published 2023-06-19**, DOI 10.1109/ACCESS.2023.3287654 (CC-BY, open access). Dataset: https://github.com/software-competence-center-hagenberg/ADR-Study-Dataset. Actual numbers, all verified from the full text:

- Search base: **26,372,973** GitHub users; 282,789 had a Markdown file containing "decision" → after manual verification, **921 repositories** with ≥1 ADR, containing **6,362 ADR files** (accessed May 2023).
- Per repo: **554 repos (>50%) have 1–5 ADRs**; 198 have 6–10; 122 have 11–20; 27 have 21–30; 20 have >30. Max ever = **73**. Only **47 repos (5%) exceed 20 ADRs**.
- **Decay, the headline number: 3,255 of 6,362 ADR files (~51%) were committed exactly once and never modified again.** 1,497 committed twice, 688 three times; max 58 commits on one file.
- **278 repositories** had *all* ADR files edited on a single day and never touched again.
- Authorship: **453 repos (~49%) had a single ADR author**. Restricted to repos with ≥10 ADRs, only 16% (33/198) are single-author.
- Templates: **Nygard 723 repos (~75%)**, MADR 129, custom 61, all others 8 combined.
- Adoption timeline: first ADRs 2013 (2 files, 2 repos); 8 repos by end-2015; 22 new repos 2016, 88 in 2017, 165 in 2018, 211 in 2019, >350 in 2020. Nygard proposed ADRs Nov 2011 — **~5-year lag to any uptake**.
- Only **42 repositories** meet all three "successful adoption" criteria (≥20 ADRs, ≥2 authors, ≥6 months of editing). That is **4.6% of 921**, out of tens of millions of repos.

Grade: **paper-only study of a shipped-niche practice.** Caveat: it counts only Markdown ADRs findable via GitHub's search API, and excludes single-file decision logs — so it undercounts, and the authors say so.

**Follow-on corpus (2026)**: Gupta, Dhar, Feitosa, Vaidhyanathan, "Context Matters: Evaluating Context Strategies for Automated ADR Generation Using LLMs," arXiv:2604.03826v2 (2026-04-15), built on Buchgeher's set: **4,500+ validated ADRs across 750 repositories** — "one of the largest curated sequential ADR corpora to date." Grade: **paper-only**.

**Foundational concepts**: Jansen & Bosch, "Software Architecture as a Set of Architectural Design Decisions," WICSA 2005 (DOI 10.1109/WICSA.2005.61) — origin of *architectural knowledge vaporization*. Verified; it is a position/conceptual paper, **paper-only**, no measurement. MADR: Kopp, Armbruster, Zimmermann, "Markdown Architectural Decision Records: Format and Tool Support," ZEUS 2018, CEUR-WS Vol-2072 paper 9 (https://ceur-ws.org/Vol-2072/paper9.pdf) — tool paper, no adoption data; Buchgeher later measured its share at 129/921 repos (14%). **shipped-niche**.

**Only in-situ ADR trial**: Ahmeti, Linder, Groner, Wohlrab, "Architecture Decision Records in Practice: An Action Research Study," ECSA 2024 (https://rebekkaa.github.io/files/2024_ECSA.pdf). One company, **7 interviews, 6 survey respondents, 3 months**. Positive but tiny; note their finding that *where* ADRs are stored dominates perceived usefulness. Grade: **paper-only**.

**Documentation decay generally**: Aghajani et al., "Software Documentation Issues Unveiled," ICSE 2019 (DOI 10.1109/ICSE.2019.00122) — mined and categorized **878 documentation-related artifacts** into a taxonomy in which outdatedness/inaccuracy is a top-level information issue. Zhi et al., "Cost, benefits and quality of software development documentation: A systematic mapping," JSS 99:175–198 (2015). Neither covers decision records specifically — **there is no study measuring ADR supersession rates as such**; Buchgeher's ~51%-never-modified is the closest proxy and the authors explicitly decline to analyze *what* the modifications were.

## ThoughtWorks Radar: Lightweight Architecture Decision Records

Verified from the blip page's own history (https://www.thoughtworks.com/en-us/radar/techniques/lightweight-architecture-decision-records, "Last updated: May 15, 2018"):

- **Nov 2016 (Vol 15): Trial**
- **Mar 2017 (Vol 16): Trial**
- **Nov 2017 (Vol 17): Adopt**
- **May 2018 (Vol 18): Adopt** — final appearance

The page carries the banner "NOT ON THE CURRENT EDITION." It reached Adopt in 14 months and has not been revisited in **eight years**. Grade: **shipped-niche**. Worth noting the sequencing: ADRs hit Radar "Adopt" in Nov 2017 — before the 2016–2020 adoption ramp Buchgeher measured, and long before anyone counted whether they were maintained.

## Summary judgment

Nothing in either topic has traceable outcome evidence. Design docs: one 2020 opinion post as the canonical text, one Google footnote (90% of GooWiki unread), one controlled experiment (N=65) finding format doesn't matter, and DORA's survey correlations for documentation *quality* generically. ADRs: exactly one real measurement, and it says half of all ADRs are written once and abandoned, 5% of adopting repos exceed 20 records, and ~4.6% show sustained team use. The most-repeated justification for both — late defects cost 10–100x more — is refuted by a 171-project study. Flag as **FOLKLORE**: "design docs reduce defects/save rework," "6-pagers produce better decisions," and any specific multiplier attached to either.
