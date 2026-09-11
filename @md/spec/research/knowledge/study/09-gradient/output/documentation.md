---
under: the code
kind: brief
---

# What a document changes

The code promises that knowledge written its way changes how a team works. Read this and you will know what evidence exists that a document of any kind changes an outcome, why knowledge fails to travel inside an organisation and where a document's ceiling therefore sits, what became of decision records and design docs, and why every documentation system the sweep found is unmeasured or in retreat. The grades are the agents'; nothing was checked again.

## 1. Almost no causal evidence exists

In forty years of research, documentation has been the manipulated variable with a performance outcome measured in a handful of experiments, and all of them are small. Everything else, the whole "documentation quality" literature included, is survey, interview, artifact mining or expert rating: the field measures what is wrong with documents, never what a good one buys. Reasoned, by two agents independently, from the census below. No meta-analysis of documentation experiments exists.

The one experimental programme is minimalism, and it is thirty years old. Minimalism is Carroll's theory of the manual built around the reader's real tasks, with error recovery designed in and the text cut to what those tasks need. [Carroll, Smith-Kerker, Ford and Mazur-Rimetz 1987]: nineteen temp-agency office workers on a word processor, the minimal manual cutting learning time 40% and more than doubling subtasks completed; a second experiment of 32, 58% more subtasks, errors 20% fewer and not significant, with subjects spending almost half their time recovering from errors. Measured, randomised. [Ginns, Hollender and Reimann 2006] pooled thirteen effects, 288 participants in total, and found d of 1.12, but as a self-deposited conference paper never peer-reviewed, with studies selected with the theory's authors' help, two outliers carrying it and no test for publication bias; their sub-analysis finds "slash the verbiage" alone gives d of 0.89, so most of the benefit may be plain redundancy reduction rather than the theory. Paper-only. The theory's own authors list "minimalism means brevity" as the first of ten misconceptions, and its main critic replicated it favourably in 1993, found minimalist manuals take 30% longer to produce, and left the field, which has published nothing on it since the early 2000s.

The modern trials are few and narrow, and every outcome-linked study is an N of one. Paper-only, all:

- [Mindermann and Wagner 2018]: 58 students adding encryption to a Java program were 73% more effective and produced 66% fewer possible vulnerabilities with a curated example platform.

- [Prechelt et al. 2002]: design-pattern comments added to already well-commented programs made pattern-relevant maintenance faster or less error-prone.

- [Endrikat et al. 2014]: documentation strengthened the benefit of static typing, on a single task chosen because both were expected to matter.

- [Ernst and Robillard 2023]: 65 subjects randomised to narrative or structured architecture documents, no significant effect of format on understanding, prior exposure to the code dominant.

- [Bratthall et al. 2000]: seventeen subjects, a design-rationale document improved correctness and speed on one of two systems and was inconclusive on the other.

- [Karsenty 1996]: six professional designers with a rationale document scribed by two people found only 41% of their why-questions answerable from it.

The descriptive literature is large and has no outcome variable. [Uddin and Robillard 2015], 323 IBM professionals, ranked incompleteness, ambiguity, unexplained examples and obsoleteness above every presentation problem, with no evidence novices experienced problems differently. [Robillard 2009]: 50 of 74 Microsoft developers naming an obstacle named the documentation. [Aghajani et al. 2019] mined 878 artifacts into a taxonomy and [Aghajani et al. 2020] surveyed 146 practitioners. [Treude, Middleton and Atapattu 2020] proposed ten quality dimensions in an explicitly visionary paper. The 2017 GitHub survey, a genuine random sample of 5,500, found 93% had seen incomplete or outdated documentation as a problem and 60% rarely or never contributed to it. Measured for prevalence, not cost.

## 2. The multiplier that was retracted

The one large survey series with an outcome variable, DORA, published a multiplier for documentation quality, found a negative association the next year, no effect the year after, and then dropped the construct and stopped speaking of effects at all. Measured, from the reports themselves; the year-by-year is in [the numbers brief](numbers.md#2-late-is-costly-by-no-known-factor). Its sampling was snowball plus a purchased panel throughout, its modelling correlation-based, and of 93 papers citing its metrics, an independent review found none added information. What is left of it for the code is the direction of a correlation between good documentation and other good practices, with reverse causation, that well-run teams have the slack to write, untested and plausible.

## 3. Why knowledge does not travel

The barriers to knowledge moving inside an organisation are knowledge-related, not motivational: the receiver's capacity to absorb, the ambiguity of the knowledge, and the arduousness of the relationship. Where the boundary is one of interest, vocabulary cannot bridge it, and a document cannot repair a misunderstanding in the moment. Measured once and never replicated for the first; framework and theory with support for the rest.

The barriers are knowledge-related, not motivational. [Szulanski 1996], 271 questionnaires across 122 transfers of best practice in eight firms: the recipient's lack of absorptive capacity weighed 0.54, causal ambiguity 0.34, and an arduous relationship between source and recipient 0.33, with motivation ranked low. The headline analysis used 87 of the 271 observations, the top three held on a robustness re-run, and the author warns everything below rank three is unstable. Measured, single study, never independently replicated. Insight fails to travel not because people will not share but because the receiver cannot absorb, the sender cannot explain, and the channel between them hurts.

Absorption is a property of the receiver's prior knowledge, not of the sender's writing. [Cohen and Levinthal 1990] established it; [Stettler et al. 2025] find the effect roughly twice as large in low-tech industries and in the smartphone era; a 2023 meta-analysis challenges its universality. Meta-analysed, heavily moderated. The sweep's commission named the case of a client and the vendor that delivers for it; a client that has outsourced its technical staff has, by construction, destroyed its own capacity to absorb, and no document written by the vendor repairs that.

A boundary of interest cannot be bridged by vocabulary. [Carlile 2004] distinguishes boundaries that differ in terms, in meanings, and in interests, and the last requires a transformation in which both sides give something up. Framework with qualitative support. Client and vendor differ in interest, the vendor paid for scope, the client wanting an outcome, so a glossary or a better specification addresses only the cheapest layer.

A document cannot repair a misunderstanding in the moment. [Clark and Brennan 1991]: participants minimise joint effort, not sender effort, so producing a perfect utterance often costs more than collaboratively repairing an imperfect one; a document is maximal in reviewability and revisability and zero in being present at the same time, so grounding failures compound silently. Theory with laboratory support. The least-effort solution is usually to go and ask someone, which is what [Roehm et al. 2012] observed in 28 professional developers: they "try to avoid program comprehension" and prefer face-to-face communication to documentation.

## 4. The ceiling

A document's ceiling is set by the receiver's capacity and by whether something downstream consumes the document. Documentation is a real but second-order lever in onboarding, organisational structure predicts failure better than the code does, and descriptive artifacts decay while prescriptive ones are kept. Measured, observational and qualitative, in the paragraphs below.

Documentation is a real but second-order lever in onboarding. [Rastogi et al. 2015], 411 Microsoft developers with version-control data: lack of documentation strongly increased time to first check-in in five of seven product groups and moderately in the other two, the strongest of twelve listed factors. But when developers named factors freely, the order was mentorship, documentation, process, access, setup, and those without a mentor "experienced that absence of mentor resulted in significant loss of time." Measured, with time units withheld for confidentiality and the rankings opinion data. Google's only quantified documentation datum is a footnote: when its internal wiki was deprecated, "around 90% of the documents had no views or updates in the previous few months." Stated.

Organisational structure predicts failure better than any property of the code. [Nagappan, Murphy and Basili 2008], Windows Vista, 3,404 binaries: organisational metrics predicted failure-proneness at 86.2% precision and 84.0% recall, ahead of churn, complexity, dependencies, coverage and pre-release bugs. Measured, one system, never replicated at that scale. [MacCormack, Baldwin and Rusnak 2012]: in all five matched product pairs the loosely coupled organisation produced the more modular product, p of 0.03, and the inverse manoeuvre, restructuring teams to get an architecture, has no empirical support. Paper-only, underpowered. Boehm and Basili's own escape from their cost curve is architecture, confining fixes to well-encapsulated modules, not documents.

Prescriptive artifacts survive; descriptive ones decay. [Wohlrab et al. 2019], 53 practitioners in six automotive companies, found they robustly distinguish artifacts shared across a boundary from ones locally relevant, and that "stakeholders' motivation to manage prescriptive models is higher than dealing with descriptive artifacts": what generates code or tests gets maintained, what only describes does not. Their guideline is blunt: produce locally relevant documentation "as late as possible and only when they are actually needed." Design science, qualitative. This is the single most actionable finding for a project whose product is documents: a brief's ceiling is set by whether something downstream consumes it.

Three concessions follow, from the organisational-knowledge agent: drop every statistic in the one-to-ten-to-a-hundred family, state that the documentation-to-outcome link is correlational and name DORA's own hedge, and frame the artifact as one mechanism beside mentorship and relationship design, not the mechanism. Reasoned, by the agent, from the studies above.

## 5. Records of decisions are written once and left

Every record of a decision the sweep looked at, the architecture decision record, the design doc, the captured rationale, the proposal process, has adoption and no outcome evidence. What measurements exist show the records written once and left, the deliberation they exist to capture skipped, and the processes with no way to close. The one positive effect anywhere is a record served to a model. Measured for the counts, opinion for everything else, in the sections below.

### 5.1 Decision records

Architecture decision records (ADRs, a short file per decision with its context and consequences, proposed by Nygard in a 2011 blog post) are tried and abandoned. [Buchgeher et al. 2023], from 26.4 million GitHub users to 921 repositories with 6,362 ADR files: over half the repositories hold one to five records; 51% of files were committed once and never touched again; 278 repositories wrote all their records on one day; 4.6% meet all of at least twenty records, two authors and six months of editing. Measured. [Santana et al. 2026], the first study to look for an effect, over the same 921 repositories with code-quality and productivity metrics: "predominantly small correlations… at most, modest observable effects at scale," and 63% of records opened directly as accepted, "bypassing the deliberative context that ADRs are intended to capture." Measured, correlational.

Everything else on decision records is thin. Nygard's post is an experience report; ThoughtWorks' Technology Radar, the consultancy's periodic verdict on techniques, put the practice at its highest rating in fourteen months on no data and never revisited it; the only in-situ trial is seven interviews at one company over three months; the template comparison is 33 undergraduates. Opinion and paper-only. The one positive result is a preprint in which records served to a model through the protocol that offers tools to models (MCP) cut a build's time by 10% and produced end-to-end tests that the same instruction in a plain context file did not, N of one workflow, unreplicated.

### 5.2 Design docs

Design docs rest on a blog post, and the one controlled study says format does not matter. [Ubl 2020], "Design Docs at Google," has no data and no sequel; *Software Engineering at Google* calls them code review before code; Google's research measures code review and technical debt, never design docs; Amazon's six-page memo traces solely to a 2017 shareholder letter; Orosz's catalogue of a hundred companies is templates and adoption with no outcome. Opinion, all. Ernst and Robillard's 65-subject null is in [the first section](#1-almost-no-causal-evidence-exists). And the justification usually offered, that late defects cost ten to a hundred times more, failed its largest test, [in the numbers brief](numbers.md#2-late-is-costly-by-no-known-factor).

### 5.3 Capturing rationale fails for reasons never costed

Capturing the reasons behind a design fails for reasons that are richly described and never costed. [Shipman and Marshall 1999], "Formality Considered Harmful," is a reflection on a decade of building systems, not a measurement, and it names four: the extra steps of chunking, naming, linking and labelling; the tacit knowledge that introspection interrupts and changes; the structure imposed before the author knows it; and the different structure different people need for different tasks. Its sharpest example is McCall's: design students could not produce argumentation in the issue-based form even though videotapes showed their natural discussions already followed it, because "post hoc analysis is very different from generation." Opinion, grounded in system-building, and the consequence they drew is that structure must be allowed to stay implicit and to be added later without ceremony. Karsenty's capture needed two dedicated scribes over four two-hour meetings because the design office chief did not believe designers would document it themselves. Observational.

### 5.4 Proposal processes have no exit

Heavyweight proposal processes have no exit path, and teams route around them. Rust: 215 open proposals with a median age of 905 days, 35 older than five years, against a lighter major-change process that has cleared 425 of 585 with 17 open. Kubernetes: 343 enhancement proposals in a non-terminal state, 14 ever explicitly killed, 184 with no milestone since late 2024. The IETF's stream for documents about its own process produced three in four years, and the latest of them admits the previous model lacked an appeal path and that "RFCs are not changed" was unworkable. Python is the outlier, and it did not fix the process; it shrank what a proposal must decide by standing up four domain councils. Measured, by the agent, from the repositories on the day; no organisation has published a retrospective with data. [Kaplan-Moss 2023], that such processes lack a decide step and so default to no, is opinion with two anecdotes.

## 6. Every system is unmeasured or in retreat

Every system for organising documentation that the sweep found is either unmeasured or in retreat. The one whose adopters split documents into typed files disclaims the splitting; the XML lineage is calcifying with its professional body bankrupt; the live side, plain files in version control, is measured only by its repositories' activity; and the single organisation that restructured content and measured an outcome is a support-chat vendor. Opinion, measured, shipped and measured, in the sections below.

### 6.1 Diátaxis disclaims the file per type

Diátaxis (a scheme of four documentation modes: tutorial, how-to, reference, explanation) does not argue for what its adopters did with it. Its author's own text: "Diátaxis is not a scheme into which documentation must be placed - four boxes… this does not mean that there must be simply four divisions of documentation in the hierarchy," and the division into four categories "is a typical outcome of the good practice, not its end." Opinion, self-contained, citing no research.

The failure report is exactly the code's question. Pigweed, a Google embedded-software project, adopted it "as a literal blueprint and it resulted in too much fragmentation," explanations on one page and tutorials on another, users annoyed at jumping back and forth, and "if you only link to explanations from the tutorial, some (most?) users won't click those links"; they retreated to sections within a page. Shipped, named organisation, no metrics. The only page addressing more than one organising axis was deleted in August 2026 with nothing yet in its place; adoption is "several hundred projects" with the list removed in 2023; Canonical, five years in, reports no metrics. The entry point, homepages and READMEs, is what its own critic says it does not model.

### 6.2 Structured authoring is calcifying

Structured authoring is calcifying, not dying. DITA (the XML standard for topic-based technical writing) 1.3 was approved in 2015; 2.0's third beta in July 2026 closed a gap of nearly five years since the second, and every commit on the 2.0 branch for a year is one person's; the toolkit ships, 82% of it also one person's commits; no peer-reviewed study of its reuse or profiling return exists in any index the agent could reach. The Society for Technical Communication ceased operations in January 2025 and filed for liquidation, down from 25,000 members to 4,500. Measured, from the repositories and filings. The revival is at conferences, half the sessions on AI, and it has no supporting measurement; what evidence exists for structure in retrieval rewards heading hierarchy and metadata, which markdown provides as well as XML.

### 6.3 Docs as code is alive and unmeasured

Docs as code, documentation as plain files beside the source, is the live side, and it is unmeasured too. Hugo, Docusaurus, mdBook, Starlight, Sphinx and MyST are all active; the practitioners' salary survey dropped its tooling section for lack of insight; docs linting, the automated checking of prose against a style guide, has no study linking it to any outcome. Shipped for the tools; opinion for the practice.

### 6.4 The one measured restructuring

The one organisation that restructured content and measured is Intercom, for its support chatbot. A matched causal design over about a thousand customers found improving knowledge-base content raised the rate of resolved conversations by 1.23 points on average, with targeting mattering far more than volume: eight approved changes could touch 76% of conversations. Vendor-run, but a causal design, and the rare exception.

## 7. Where this stands

The experiment census is [the documentation-effectiveness report](../../../../sweep-2026-08/raw/a7b21ac3d71f8c8f6.md) with [the minimalism and quality-measurement report](../../../../sweep-2026-08/raw/a5e1231b95c4c9ac5.md) and [the structured-authoring and van der Meij report](../../../../sweep-2026-08/raw/a5e68a671a08e519a.md). The organisational findings are [organisational knowledge](../../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md). DORA is [its own report](../../../../sweep-2026-08/raw/abeeefde341d33a2d.md). Decision records, design docs and processes are [the ADR and design-doc report](../../../../sweep-2026-08/raw/a63bf2eb6c5d05ba8.md), [the design-rationale report](../../../../sweep-2026-08/raw/a7ea3bc0963c0e185.md), [the consolidated ADR verdict](../../../../sweep-2026-08/raw/aae121db667d39f2d.md) and [the RFC-process report](../../../../sweep-2026-08/raw/ab6fb706729be0f77.md). The systems are [Diátaxis and its critics](../../../../sweep-2026-08/raw/a26ae7e524c53262a.md), [DITA, STC and tekom](../../../../sweep-2026-08/raw/a86776519f614dd3a.md) and [the AI turn in documentation](../../../../sweep-2026-08/raw/a1c816c1f7cbcfdf9.md).

## 8. What could not be established

The agents could not establish any causal study of documentation beyond those named; a true replication of Szulanski; the effect sizes of Bratthall or the Carroll experiments at source; [Abbattista et al. 1994], the most likely second controlled experiment on design recording; any study linking decision records or proposal processes to an engineering outcome; DITA's reuse figures from any primary source; or a named primary source for "30 to 40%" reuse savings.
