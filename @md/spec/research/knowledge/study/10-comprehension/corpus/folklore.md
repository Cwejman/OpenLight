---
under: the code
kind: brief
---

# The numbers that did not survive

Roughly forty figures in wide circulation were traced by the sweep to nothing, or to a source that says the opposite of what it is cited for. They have one home here so that no brief has to carry a warning about a number it does not use. Each entry names the claim, what the primary source actually says, and the report that chased it. A last section holds the handful of *practices* the sweep retired by name, which are verdicts rather than figures.

The pattern across them is worth more than any single entry. Three mechanisms produce almost all of it: a figure read off a graph and then quoted as published data; a claim whose citation chain is long enough that nobody in it opened the original; and an author's honest hedge stripped by the first person to repeat it.

## 1. The cost-of-late-discovery family

**"Finding a defect late costs 10× / 100× more."** The 1:10:100 ratio is attributed to an "IBM Systems Sciences Institute" study. There is no such study. The Systems Science Institute was an IBM customer-education unit at 3550 Wilshire Blvd, Los Angeles, operating roughly 1967–1982 — a training programme, not a research body. The granular chart (1× design / 6.5× coding / 15× testing / 100× maintenance) traces to a textbook footnote. Menzies, Nichols, Shull & Layman tested the effect across 171 projects, 2006–2014: "We found no evidence for the delayed issue effect… a long-held truth in software engineering should not be considered a global truism."

**Boehm and Basili said so themselves.** Their 2001 list adds the word "often" and states that the escalation factor "for small, noncritical software systems" is "more like 5:1 than 100:1," and that good architecture compresses it even for large critical ones. Their companion figure — 40–50% of project effort on avoidable rework — derives from a behavioural analysis of COCOMO II cost drivers, which is a model, not a measurement.

**"70–85% of rework cost comes from requirements defects"** and its sibling **"50–60% of all defects originate in requirements"** have no reachable primary measurement; they propagate through requirements-management marketing. The audit that voids the whole family is Frattini et al.'s review of 57 requirements-quality publications: 47.5% of claimed impacts are merely *hypothesized*, 92% of impacted activities are chosen ad hoc "usually justified by anecdotal or folkloric circumstances," and 29.8% of papers claim a quality factor with no stated impact at all.

**Standish CHAOS success and failure rates** are methodologically invalid — one-sided definitions (overruns counted, underruns ignored), sampling that solicited failure stories, undisclosed design. Eveleens & Verhoef, *IEEE Software* 2010.

Reports: [`abdf5bfa14a7ddd82`](../../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md), [`a63bf2eb6c5d05ba8`](../../../../sweep-2026-08/raw/a63bf2eb6c5d05ba8.md).

## 2. The bounded-head numbers

**"7±2."** Miller (1956) reported a span of about seven items and then wrote that he suspected it was "only a pernicious, Pythagorean coincidence." He distinguished two different limitations — the span of absolute judgment, limited by information, and the span of immediate memory, limited by items — and named recoding into chunks as the escape. Nothing in it supports seven items on a page.

**Cowan's "four" as a design ceiling.** Cowan (2001) argues for "a single, central capacity limit averaging about four chunks," observable only under four boundary conditions that *block* recoding; he restated it in 2010 as 3–5 items in young adults. A browsable, re-readable hierarchy meets none of those conditions. Citing four as a limit on what a person can organise inverts the paper.

**Chase & Simon (1973) as evidence for a chunk limit.** They *assumed* Miller's span and tested a hypothesis inside it — verbatim, "the number of chunks should be a small constant within the memory span (7 + 2) for all subjects." N = 3, one domain, five-second exposure.

**Dunbar's confidence interval "16 to 109."** That span is the two point-estimate ranges. The actual 95% CIs in Lindenfors, Wartel & Lind (2021) run 4–520 and 2–336, and the paper's conclusion is that "specifying any one number is futile."

**"Two levels, three at most."** Every underlying result is a fixed-item-count optimum, and the winning breadths all exceed the working-memory numbers the rule is derived from. One further correction belongs here: the 1981 depth study is by **D. P. Miller, not George Miller** — a confusion the citation chain repeats. What the three depth-and-breadth experiments do support, and why their optima cannot generalise, is in [`reading/bounded-head.md`](reading/bounded-head.md) §1–2; it is not restated here.

**Luhmann's Zettelkasten as an existence proof for shallow structure.** The Luhmann-Archiv documents ZK I with 108 divisions ranging from one to over 4,000 slips, ZK II with 11 blocks of 1,000–9,000 slips and "bis zu vier Unterebenen" — up to four sub-levels — plus a division of 120 list-like subdivisions, and states it is not a strictly hierarchical ordering at all. Also: ~90,000 slips over ~45 years (1952 to early 1997), not forty.

Reports: [`a3f4c332843acf946`](../../../../sweep-2026-08/raw/a3f4c332843acf946.md), [`a583337921a4f7975`](../../../../sweep-2026-08/raw/a583337921a4f7975.md).

## 3. The reading-and-writing numbers

**"Developers spend 10× more time reading than writing."** Robert C. Martin, *Clean Code* (2008), chapter 1: "the ratio of time spent reading vs. writing is well over 10:1." The preceding paragraphs give its honest provenance — playing back Emacs edit sessions in the 80s and 90s and observing that "the vast majority of the playback was scrolling and navigating to other modules." No instrumentation, no N. Chapter 1's bibliography has two entries, neither about the ratio, and no earlier numerical source exists. The observation is about scrolling, not comprehension.

**"~5% of time writing new code."** Peter Hallam, blogs.msdn.com, 4 January 2006, reproducing a 2002 internal email: his own figures were 2% new code / 20% modifying / 78% understanding; the circulating 5% is his *hypothetical junior persona*. He writes "No, I am not making this up" and follows with argument, not data.

**"Programmers spend 50% of their time on comprehension," via Fjeldstad & Hamlen (1983).** Effectively unretrievable: no DOI, absent from Crossref, OpenAlex and DBLP, containing volume unscanned. Its two citing papers give mutually incompatible bibliographic records for the same item — the signature of a reference copied rather than read. Xia et al. say so outright: Zelkowitz et al., Fjeldstad & Hamlen and Corbi all report the figure "based on anecdotal evidences."

**Ko et al. (2006) cited for "35% of time understanding."** The primary text says developers spend 35% of their time on "the mechanics of navigation within and between source files." Navigation overhead, not comprehension — and this mis-citation sits inside the peer-reviewed literature, in both Minelli et al. and Xia et al.

**Lientz & Swanson's "maintenance is 40–80% of cost"** is partially traceable — 69 respondents from 120 organisations in CACM 1978, 487 organisations in CACM 1981 — but the 1978 abstract already launders rumour: "Rough estimates… range as high as 75–80 percent." The famous 21/25/50/4 effort split lives in the 1980 book, unverified at source.

Reports: [`aec803bcd71ce9745`](../../../../sweep-2026-08/raw/aec803bcd71ce9745.md), [`af3e6b7e48703f0a0`](../../../../sweep-2026-08/raw/af3e6b7e48703f0a0.md).

## 4. The documentation-pays numbers

**DORA's "2.4×" and everything downstream of it.** The 2021 figure is real and primary; the series then reverses on itself across four further reports and ends with the construct removed. The full five-year sequence, read from the primary documents, is in [`writing/evidence.md`](writing/evidence.md) §4 and is not restated here. Two items belong on a retirement list: the widely-cited 2022 percentage-lift table (continuous delivery 63%→656%, trunk-based development 36%→1525%) **appears nowhere in the 2022 report** — only on a capabilities page and a 2023 vendor blog post — and any "N×" figure for 2025 internal-data quality is invented, because those figures were published as ordinal bands with no numbers.

**"Team Topologies delivers 25% less context switching and 20% more productivity."** No study. It circulates on marketing pages with no primary source, and the underlying cognitive-load construct's transfer to team boundary design is untested. *(From [`abdf5bfa14a7ddd82`](../../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md).)*

**"DITA reuse saves 30–40%," "up to 79% reduction in translation costs," "31% content-creation time reduction and $111m saved over five years."** No traceable primary study for any of them; the last is attributed to a Forrester-style TEI that does not appear to exist. Three OpenAlex full-text searches returned no peer-reviewed empirical study of DITA reuse ROI at all.

**"Structured knowledge bases outperform unstructured by 29–46 percentage points."** Attributed to Heretto; fetching the cited page shows it contains no such figure. Its only statistic — "80% of business information begins as unstructured" — is sourced to a ScienceDirect topic index page, not a study.

**"6-pagers produce better decisions."** Traces solely to Bezos's 2017 shareholder letter, which contains no data; the 2018 letter does not mention memos. Likewise "design docs reduce defects."

Reports: [`abeeefde341d33a2d`](../../../../sweep-2026-08/raw/abeeefde341d33a2d.md), [`a5e68a671a08e519a`](../../../../sweep-2026-08/raw/a5e68a671a08e519a.md), [`a86776519f614dd3a`](../../../../sweep-2026-08/raw/a86776519f614dd3a.md), [`a63bf2eb6c5d05ba8`](../../../../sweep-2026-08/raw/a63bf2eb6c5d05ba8.md).

## 5. The teaching and text-design numbers

**Advance organizers as a strong effect.** Luiten, Ames & Ackerson (1980) meta-analysed 135 studies and reported a mean effect size of **.21** — the authors' own framing is that the average treated subject performed better than 58% of controls. The venue is commonly misattributed: it is *American Educational Research Journal* 17(2), not *Review of Educational Research*. Two moderators cut against the usual reading: effects were larger for *high*-ability subjects, and **aural mode beat written**.

**Ausubel's mechanism specifically failed.** Stone (1983) analysed 112 studies and found "levels of some variables in the high-effect-size studies were not as predicted by Ausubel's model" — lower effect sizes for written-only and *abstract* organizers, higher for *non-subsuming* ones. Anyone citing Ausubel to justify an abstract summary that subsumes the detail beneath is citing the exact prediction the data did not support.

**"Graphic organizers ES 1.24 vs expository 0.80."** Not in Stone's abstract, not in Stone's ERIC record, not in Luiten's. No primary source carries the pair. Assume fabricated or blog-laundered.

**Wikipedia's "50 kB split trigger."** Still in WP:Summary style verbatim as a "starting point at which articles may be considered too long" — a burden of proof, not a trigger — and WP:SIZERULE itself has moved to word counts (>8,000 words "may need," >9,000 "probably," >15,000 "almost certainly"), applying to readable prose, not file size. A second correction attaches to the same source, and is stated with its figures in [`reading/bounded-head.md`](reading/bounded-head.md) §4: the article-class distribution measures assessment coverage, not a designed pyramid.

**GitLab's "605,000 words."** Absent from every GitLab page the agent fetched, live and archived. What is verified is "over 2,000 pages of text" and the handbook-first practice — and GitLab's own style guide argues *against* depth. Both corrections are stated in [`reading/bounded-head.md`](reading/bounded-head.md) §4.

**Pimentel et al.'s Jupyter percentages on the wrong denominator.** 24.11% ran without error and 4.03% reproduced outputs — both denominated on **863,878 attempted executions of valid notebooks with unambiguous execution order**, not on the 1,159,166 notebooks or the abstract's rounded 1.4 million.

**Romer (1990) as a proof that knowledge compounds.** Verbatim: "Linearity in A is what makes unbounded growth possible, and in this sense, unbounded growth is more like an assumption than a result of the model." The abstract adds that "having a large population is not sufficient to generate growth." What the paper *will* bear — and the second correction that goes with it, that the excludability half is load-bearing and "non-rival" alone misstates the model — is in [`people/transfer.md`](people/transfer.md) §6.

Reports: [`a3f4c332843acf946`](../../../../sweep-2026-08/raw/a3f4c332843acf946.md), [`adc8fe8e64ae23f70`](../../../../sweep-2026-08/raw/adc8fe8e64ae23f70.md).

## 6. The information-architecture numbers

**Nielsen's card-sorting correlations — r = 0.75 at 5 users, 0.90 at 15, 0.95 at 30, 0.98 at 60.** These numbers appear nowhere in Tullis & Wood's text. The paper contains no table of correlation coefficients; Figure 1 is a graph with error bars and no printed values. Nielsen read them off the graph in a 2004 blog post that remains unrevised, and every downstream repetition treats them as published data. The supposed Nielsen–Tullis disagreement is also not real: same dataset, different cost threshold.

**"80% success is a good tree-test score."** Optimal Workshop publishes no benchmark thresholds. The only published heuristic is Dave O'Brien's 2009 "8/10 earns a beer."

**"Three clicks."** Tested and falsified — Porter, UIE, 16 April 2003: 44 users, 620 tasks, 8,000+ clicks, "no more likelihood of quitting after three clicks than after 12."

**"If too many items are cross-listed, the hierarchy loses its value."** The polar bear book's position, with no threshold and no study behind it.

Reports: [`a5437aa6a38bae10c`](../../../../sweep-2026-08/raw/a5437aa6a38bae10c.md), [`ae8fc467393dd0407`](../../../../sweep-2026-08/raw/ae8fc467393dd0407.md).

## 7. The agent-era numbers

**"150,000 tokens to 2,000 — a 98.7% saving."** The Anthropic post's exact wording is a Google Drive to Salesforce example, and it is an **illustrative hypothetical** with no methodology, conditions or validation. The mechanism has independent support at one to two orders of magnitude smaller effect.

**LazyGraphRAG's "0.1% of the cost of full GraphRAG."** Indexing cost only, not query cost, in a blog post about code that never shipped — and LazyGraphRAG still builds a graph. The maintainer said in December 2024 it would be the next priority; there has been no maintainer update since, and the repository now refuses new features.

**"Knowledge graphs make LLMs 3× more accurate."** Sequeda, Allemang & Jacob: n = **43 questions**, a 13-table subset, vendor-authored, against a *zero-shot* text-to-SQL baseline with no schema linking or few-shot — and the "knowledge graph" is a hand-authored ontology plus mappings. It is evidence for human-built semantic layers, not for extracted ones. No replication found against a modern baseline.

**"GraphRAG wins on global and summarisation queries."** Traces to Microsoft's own LLM-as-judge win rates — the judging method later shown position-biased — and is independently contradicted on ROUGE-2, where plain RAG scores 10.08 against community-global's 6.99.

**The TOON "grep tax," 9,649 experiments across 11 models.** Could not be verified by the agent that looked for it. What is verified is TOON's own benchmark: 244 questions, 4 models, 72.2% ±2.8 against JSON's 71.4% ±2.8 — a null — and a README conceding that compact JSON often wins outright for nested or non-uniform data.

**"Good MCP tool descriptions get selected 260% more often."** A real experimental result — 20% baseline to 72% selection probability — restated as relative lift, and it measures *tool selection among competitors*, not task success.

**Mintlify's structured-docs benchmark — "64% more precise, 39% more discoverable, ~50% fewer tokens, 1.5× faster."** From roughly 15 deterministic tasks per repository × 5 runs × 3 conditions, verified by exit codes and string matches — and it publishes **no baselines, no per-task data and no significance tests**, promising a benchmark suite "soon" which was unreleased as of the sweep. The agent that read it calls it "the most-cited number in this space and it is currently unfalsifiable."

**Mintlify's llms.txt error-rate figure** is contested rather than retired: two agents in this sweep graded the same twenty-site benchmark differently. Its one home is [`agents/context-files.md`](agents/context-files.md) §9, which states both readings.

**"Keep your permission hierarchy under N levels."** Widely repeated and the wrong metric: depth is not what drives cost, fan-out is, and the vendor that imposed a depth limit is removing it for exactly that reason. The quotation and the measured figures are in [`substrate/permission.md`](substrate/permission.md) §2.

Reports: [`aa5f5baaa66cc8bf1`](../../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md), [`a7bfd40b8a7c7a61c`](../../../../sweep-2026-08/raw/a7bfd40b8a7c7a61c.md), [`ab601f5a0087e7fc8`](../../../../sweep-2026-08/raw/ab601f5a0087e7fc8.md), [`aea19b144c46bfc26`](../../../../sweep-2026-08/raw/aea19b144c46bfc26.md).

## 8. Claims unsourced in both directions

Some widely-believed things could not be established either way, and saying "unmeasured" is stronger than picking a side.

**"Nobody runs OWL reasoners in production."** Consistent with the tooling decay — Pellet last pushed 2017, Konclude 2022, Openllet 2025 — but no deployment census exists.

**"FIBO uses SHACL."** Zero SHACL code matches across the EDM Council's entire GitHub organisation. FIBO remains OWL.

**"RFDs demonstrably work at Oxide."** Zero published metrics of any kind; the claim rests on employee assertion, and the public RFD index redirects to a login.

**"KEP fatigue."** Circulates as a term with no primary measurement; the staleness figures that exist were computed by an agent during the sweep, not published by the project.

**"The IETF is 3–4× slower than in 1998."** Traces to RFC 8963 and nowhere else: n = 20 RFCs from a 2018 sample.

**"Datomic has broad adoption."** True that Netflix and Nubank run it at scale; both are Clojure shops and Nubank owns Cognitect. No evidence of non-JVM uptake either way.

**Ontology alignment achieving "very high precision and recall."** Wikipedia's claim, with no figures and no dates.

**Airtable "Omni" as a product name.** No primary source. Verified alternatives are Cobuilder and Superagent.

**Vendor ARR figures sourced to GetLatka** — Appsmith $10.1M, ToolJet $8.5M, Glide $3.7M, Zapier $310M — are unverified by any company or press confirmation.

## 9. Practices retired by name, not by number

Five practices were marked do-not-adopt by the sweep's commissioning survey, and they belong here for the reason the numbers do: so that no brief has to carry a warning about a practice it does not use. These are verdicts rather than measurements. *From the coverage chart's own reading; opinion, one head in one pass.*

- **Literate programming proper** — "died of parallel maintenance and dead output."

- **The SECI spiral as a process** — "weakly supported"; Gourlay (2006) found **none of its four modes survive scrutiny**. It is the most-cited of the organisational-learning frameworks in [`people/transfer.md`](people/transfer.md) §7.

- **Graph views** — they stop being useful past a few hundred notes.

- **Contributor tiers.**

- **Audience-forked prose** — writing two versions of the same material for different readers. The nearest thing to evidence either way is that nobody has tested whether letting a reader skip a level substitutes for it; see [`reading/bounded-head.md`](reading/bounded-head.md) §5.

Report: [`a583337921a4f7975`](../../../../sweep-2026-08/raw/a583337921a4f7975.md).
