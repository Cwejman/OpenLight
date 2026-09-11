# Arranging knowledge so it can be found

Information architecture is the practice of arranging a body of knowledge so a reader reaches the part they need. Two agents were sent to find its evidence base. It is thinner than the comprehension literature's, largely vendor-authored, and the single most direct validity test returned a null.

## 1. The citation chain, end to end

The chain is short enough to state in one paragraph, and stating it is the finding. A non-peer-reviewed 2004 conference paper with one dataset, whose own text contains no correlation coefficients. A 2004 blog post that read numbers off that paper's graph and published them as data. A 2003 practitioner blog post and a 2009 vendor blog post whose entire empirical content is one anecdote. A 2016 peer-reviewed study that **failed to validate** card sorting against browsing performance. And one 2022 conference extended abstract, with eight citations, that validates card sorting only against a legacy structure selected for having known usability problems.

## 2. What Tullis & Wood actually did

UPA 2004, Minneapolis: an open sort of **46 cards** from Fidelity's usability department intranet, run online, 172 employees with 4 dropped, **n = 168**. Random subsamples of size 2 through 70, ten each, correlated against the full 168-participant similarity matrix. The paper contains **no table of correlation coefficients**; Figure 1 is a graph with error bars and no printed values. The only stated recommendation is verbatim: "it may not be cost effective to spend resources to gather information from more than 20-30 participants."

The paper's other table is more damning and is almost never cited — the mean percentage of the 17 base clusters' pairs **separated** relative to the full-sample tree: N=5 69%, N=10 50%, N=15 45%, N=20 48%, N=40 35%. Even at forty participants, a third of the clusters break.

Tullis & Wood also assert that small-sample trees beat "speculation by a designer who is not a potential user." That claim is untested in their own paper and, as far as the sweep could find, anywhere.

## 3. The negative result

Schmettow & Sommer, *Behaviour & Information Technology* 35(6):452–470, 2016 — a card sort with n = 27 on municipal websites, then n = 50 measuring task performance across structures of varying congruence with the elicited mental model. The linear mixed-effects verdict, verbatim: **"the match between mental model and website structure has no effect on browsing performance."** The authors themselves discuss "the failure to validate card sorting."

This is the most important paper in the territory and it is peer-reviewed. Against it stands one positive: Ntouvaleti & Katsanos, CHI EA 2022 — card-sort structure beat the incumbent on first-click success, time and satisfaction, where the incumbent was a legacy architecture chosen for its known problems.

## 4. The method is unstable in ways its users do not report

**Cross-study reliability.** Katsanos et al., CHI EA 2019, 6 sorts and 140 participants. The abstract says "highly similar"; the actual Spearman correlations between distance matrices run **0.419 to 0.930**, and navigation-scheme agreement 63.2%–92.7%. Use the numbers, not the abstract.

**Algorithm artefacts.** Paea, Katsanos & Bulivou (2022), in *IJHCI* and *Interacting with Computers*: k-means on card-sort data is "too sensitive to initial category centers" — the architecture you get is partly an artefact of the clustering algorithm chosen. Dendrogram cut-points are, in Sauro's words, "notoriously subjective, especially when there isn't high agreement between users."

**Card-subset instability.** Kuric et al., accepted *IJHCI* January 2026, 160 participants: 60% random card subsets give comparable similarity matrices but **different thematic categories**, and need 25–35 participants.

**Closed sorts are cheap.** Dougalis & Katsanos, 2025, 191 participants, 45 cards, 7 categories, resampled: **8–12 participants suffice.**

## 5. Tree testing rests on one anecdote

Origin: Dave O'Brien, "Tree Testing," *Boxes and Arrows*, 5 December 2009, disclosing that he worked with the tool vendor. Metrics success, speed, directness; recommendation ≥30 participants and ~10 tasks. **The entire empirical content is one vendor anecdote — a New Zealand government site going from 31% to 67% success.** No control, no replication. Its predecessor, Donna Spencer's "Card-Based Classification Evaluation" (2003), is "10 minutes from 20 users," no controls.

The academic literature is essentially nonexistent: an OpenAlex title search for "tree testing" returns forestry and neuropsychology. The one real validity study is Kuric, Demcak & Krajcovic, *Information and Software Technology* 183:107740, July 2025 — 180 participants, testing whether the tree-testing instrument itself changes navigation behaviour relative to prototype testing. It is authored by a tool vendor, and **its full text could not be retrieved**: the publisher blocked access, so the sweep records that it exists and is the only published attempt to link tree-test scores to prototype task performance, and does not know what it found. The field's one validity test for tree testing has not been read.

## 6. What information architecture does have evidence for

Two things, both narrower than the practice claims.

**Information scent.** Pirolli & Card (1999), *Psychological Review*, 1,277 citations, with genuine predictive models following (Chi et al., CHI 2001 and TOCHI 2003). This is the strongest empirical thread in the field — and the tool built on it never shipped, the standard practitioner article about it cites one source and no numbers, and the field's canonical textbook mentions scent once, in a footnote.

**Faceted browsing.** Yee, Swearingen, Li & Hearst, CHI 2003: 32 students over 35,000 images. **90% preferred faceted browsing; complete-recall rose from 21% to 77% on one collection and 57% to 81% on another; empty result sets fell from 82 to 26.** But it was ten times slower per step (0.3s against 3.7s), the condition got three extra minutes, and the baseline was keyword search rather than a hierarchy. A 2010 review found transfer to real catalogues "inconclusive."

**Navigation is wanted, not merely tolerated.** Bergman, Beyth-Marom & Nachmias, "Improved search engines and navigation preference in personal information management," *ACM TOIS* 2008, 159 citations: people prefer navigation to search. Hierarchy is a retrieval affordance people actively want, not just a filing artefact. *(From [`a3f6ddd86cf882a6d`](../../../../../sweep-2026-08/raw/a3f6ddd86cf882a6d.md), the tools-for-thought lane, not from the two information-architecture reports below.)*

## 7. Polyhierarchy is blessed and unmeasured

Putting one item in several places is normatively endorsed — ANSI/NISO Z39.19-2005 §8.3.4 with its all-and-some test, and SKOS §8.6.9 noting that polyhierarchy "arises naturally." **No user study exists on whether it helps or hurts findability.** The measured costs are machine-side only. The widely-repeated warning that too much cross-listing destroys a hierarchy's value has no threshold and no study behind it.

## 8. When a model does the sorting

Two studies, both vendor-adjacent, both paper-only. MeasuringU (2024) put ChatGPT against 200 humans on 40 products: both produced five categories, item match averaged 68% across three runs, kappa .60 across runs against a chance level of 21%. Kuric et al.'s Card Sorting Simulator (arXiv 2505.09478) ran 28 real practitioner studies and 1,399 participants against four models: best agreement NMI 0.73 / ARI 0.48, similarity-matrix correlation only **0.42–0.50**, degrading with card count and label difficulty. One result worth carrying: **prompting for an aggregate clustering beat simulating individual synthetic participants**, and the authors observe that simulated sorting is "more analogous to card sorting by experts" than by users — precisely the comparison nobody has ever validated.

Reports: [`a5437aa6a38bae10c`](../../../../../sweep-2026-08/raw/a5437aa6a38bae10c.md), [`ae8fc467393dd0407`](../../../../../sweep-2026-08/raw/ae8fc467393dd0407.md).
