# The documentation frameworks, at full strength

Three frameworks dominate how technical knowledge is organised: Diátaxis, DITA and topic-based authoring, and docs-as-code. The sweep read each at its own best, found its critics, and checked whether anything moved between 2024 and 2026. This brief holds what each actually claims and what its adopters added.

## 1. Diátaxis claims less than its adopters believe

Its own argument is two axes that it says *define* the territory: action against cognition — knowing how against knowing that — crossed with acquisition against application, at study against at work. Four modes follow, each with its own *voice*: reference states, explanation discusses, how-to guides, tutorial teaches. The site cites **no research, no empirical study, and no other theory**. Grade: opinion.

The crucial point for anyone weighing it as an argument for splitting a document: **Diátaxis does not argue for splitting into typed files.** Verbatim, from the site: "Diátaxis is not a scheme into which documentation must be placed - four boxes… this does not mean that there must be simply four divisions of documentation in the hierarchy." And: "This will tend towards a clear, explicit, structural division into the four categories - but that is a typical outcome of the good practice, not its end." The file-per-type reading is the adopters' invention, and the author disclaims the mandate.

Its fairest self-description of value is diagnostic — it "certainly helps reveal the problem… It brings it into focus and demands that it be addressed" — and its best practitioner testimony is about voice, not filing.

## 2. The best-documented adoption failure is exactly the split question

Kayce Basques, a technical writer on Google's Chrome and Pigweed teams, on Hacker News, 2024-12-06: "We tried adopting Diataxis on pigweed.dev as a literal blueprint and it resulted in too much fragmentation. E.g. the explanations for a Pigweed module were on one page, but the tutorial was on another. Users and teammates found it annoying to have to jump back-and-forth so much." The mechanism matters more than the verdict: "If you only link to explanations from the tutorial, some (most?) users won't click those links, and therefore may never get exposed to the theoretical foundations."

They retreated to **sections within a page** rather than page-per-type. The original mandate is on record as Pigweed SEED-0102, 2023-02-10. No metrics were reported either way.

Basques's second criticism is unanswered: "How do homepages and READMEs fit into the map?… I'm not convinced that you can boil down index pages to just a mix of explanations, tutorials, references, and guides." For a body of knowledge that must land a reader who arrives cold, the entry point is load-bearing, and Diátaxis does not model it.

Two smaller documented failure modes: a navigation tax — "it tends to turn 1-click docs into 2-click docs" — and enforcement drift, with documents rejected at review for "mixing modalities."

## 3. Diátaxis has moved only by subtraction

In August 2026 its author deleted `diataxis.fr/complex-hierarchies/`, the only page addressing documentation with more than one organising axis. It 404s; it is archived. His stated reason: "Ugh, I don't like that page and I have actually deleted it… There is a real problem there, and that page doesn't do a good enough job of dealing with it. I have something cooking that is much, much better." **Nothing has replaced it.** The deleted page's own answer to the type-versus-audience collision had been "Let documentation be complex if necessary" — a permission, not a method. Otherwise the 2026 commits are typos, translations and an Atom feed.

Adoption is real and unverifiable. The author's figure is "several hundred projects"; the adoption page was removed in 2023 because he could not keep up. The largest genuine sustained adoption is Canonical, from 2021 — and five years on, Canonical's documentation site reports **no metrics of any kind**. OpenAlex returns Byzantine liturgical manuscripts for "Diataxis"; there is no scholarly footprint. The site's own quality page explicitly rejects measuring its central claim: deep quality "can only be enquired into, interrogated."

Worth knowing: the taxonomy predates both Diátaxis and its Divio predecessor. Django's documentation got Tutorials / Topic guides / Reference / How-to in a commit titled "Massive reorganization of the docs," 2008-08-23.

## 4. DITA is calcifying, not dying

The specification is the evidence. DITA 1.3 became an OASIS Standard on 2015-12-17; the last stable artifact is 1.3 Plus Errata 02 from 2024-04-02. DITA 2.0 Beta 03 landed **2026-07-02**, still with no Committee Specification. **Two agents read the same releases page and returned different dates for the earlier betas** — one gives Beta 01 on 2021-06-14 and Beta 02 on 2021-10-04, a 4.7-year gap; the other gives 2025-06-14 and 2025-10-04, a nine-month one. The 2021 dates are the better-supported reading: the agent giving them flags them as a correction it made after checking, and a third report's evidence — an OASIS milestone last touched 2026-05-08, and the April 2026 committee minutes quoted below — fits a 4.7-year gap and not a nine-month one. *Two agents disagree on the raw dates; the corroborating evidence favours the longer gap.* What is not in dispute is that 2.0 has been in beta with no Committee Specification, that it was promised for 2020, and the bus factor below. The OASIS milestone stands at 85% complete with no due date. The committee's own April 2026 minutes record a member noting that 2.0 was promised for 2020, and the committee characterising this as "a communications issue, not a progress issue."

**Bus factor, measured.** Of 100+ commits to the DITA 2.0 branch in twelve months, **100% are authored by one person**. On the toolkit, 82% of 97 commits are one other person. The toolkit is genuinely alive — DITA-OT 4.4 shipped 2026-01-31 with a *preview* of 2.0 features, 4.4.1 on 2026-08-21 — but Oxygen 28.0 and 28.1 list no DITA 2.0 features at all. Nobody is shipping DITA 2.0.

**The empirical case for reuse does not exist.** Three OpenAlex full-text searches returned no peer-reviewed empirical study of DITA reuse return on investment. What exists is IBM-lineage advocacy from 2005 with no measurements, two master's theses with zero citations, and vendor calculators. The entire scholarly footprint of DITA is smaller than that of a mid-tier workshop paper. The circulating savings figures are retired in [`folklore.md`](../folklore.md).

**And the AI argument for it has no measurement.** The trade press pitch is that DITA plus iiRDS plus microcontent is the backbone of a trustworthy AI pipeline. The 2026 retrieval evidence rewards Markdown heading hierarchy, which is free, over XML semantics, which is not — see [`agents/retrieval.md`](../agents/retrieval.md).

## 5. Docs-as-code won the tooling

Every major static-site generator is active: Hugo 89.5k stars, Docusaurus 66.1k, mdBook 22.1k, Starlight 9.1k, Sphinx 8.0k, MyST-Parser — all pushed within days of the sweep, none archived. Against that, Vale's only 2025–26 release is v3.18.0 from 2025-08-20 with no LLM features, and its style-package explorer lists 13 packages. Spectral's last release was 2024-08-03 — effectively dormant.

**Evidence that linting improves any outcome: none found.** No study, in 2025–26 or earlier, links style-guide conformance to task success, retrieval accuracy or support deflection. It remains process hygiene.

Survey data is weaker than hoped: the Write the Docs 2025 salary survey has 755 respondents across 48 countries, and **removed its tooling and team-composition sections** for lack of actionable insight — so there is no current adoption number for any of this.

## 6. The twenty-year working instance nobody in this territory cites

The most-adopted set of rules for arranging a body of written knowledge is not one the documentation field cites. Wikipedia's *summary style* is a working instance of readable-alone-and-nested at seven million articles and two decades, and its own rule states the condition: a child article must be "a complete encyclopedic article in its own right."

Three further rules are worth knowing, because each is a decision the practice literature never makes explicitly. The no-original-research policy bans deriving a third claim from two sourced ones — A plus B implies C. The lead-section guideline asks a summary to "hint at startling facts without describing them." And a 2012 request for comment removed the phrase "verifiability, not truth" from the verifiability policy.

*Shipped and adopted as practice, opinion as evidence.* The rules were named in the sweep's coverage chart with links and were followed by no agent. The two Wikipedia figures in wide circulation do not support what they are used for, and are corrected in [`../folklore.md`](../folklore.md) §5 and [`../reading/bounded-head.md`](../reading/bounded-head.md) §4.

## 7. What changed in 2025–26

The conversation moved past content types. Write the Docs Portland 2026 had **no Diátaxis talk**; its information-architecture sessions were about user progress stages and decision support under time pressure. A needs-based rival, the Seven-Action Model, went agent-native — every page as HTML plus `index.md` plus `model.json` plus `llms.txt`, with an `AGENTS.md` — while Diátaxis added an RSS feed. That rival's author is honest about his own footing: "this one isn't backed by extensive research or factorial analysis."

Meanwhile the docs *platforms* rebuilt around serving agents rather than authoring for humans, which is a different territory: see [`agents/context-files.md`](../agents/context-files.md).

## 8. Spec-driven development is the nearest practice, and its cost is measured once

The practice nearest to writing structured knowledge up front for an agent to work from has a name, three tools and a small literature of practitioner reports. Kiro writes a per-feature triad of `requirements.md`, `design.md` and `tasks.md` over a steering layer of `product.md`, `tech.md` and `structure.md` with front-matter inclusion modes; GitHub's Spec Kit runs nine commands from constitution through implement; EARS supplies a requirement grammar.

Its measured cost is bad, and it is the only cost figure the sweep holds for the activity. Eberhardt reports one feature producing **2,577 lines of markdown and 689 lines of code in 33 minutes, followed by 3.5 hours of review**, against 8 minutes of work and 24 minutes of review for the same feature by iterative prompting. And the practice has **no size dial**: Böckeler reports a bug fix expanding into four user stories and sixteen acceptance criteria.

*Practitioner reports with figures, named in the coverage chart and not independently verified; treat them as leads rather than ground.*

Reports: [`a26ae7e524c53262a`](../../../../../sweep-2026-08/raw/a26ae7e524c53262a.md), [`a5e68a671a08e519a`](../../../../../sweep-2026-08/raw/a5e68a671a08e519a.md), [`a1c816c1f7cbcfdf9`](../../../../../sweep-2026-08/raw/a1c816c1f7cbcfdf9.md), [`a86776519f614dd3a`](../../../../../sweep-2026-08/raw/a86776519f614dd3a.md) for the DITA dating. Sections 6 and 8 rest on [`a583337921a4f7975`](../../../../../sweep-2026-08/raw/a583337921a4f7975.md), the coverage chart, and are leads rather than ground.
