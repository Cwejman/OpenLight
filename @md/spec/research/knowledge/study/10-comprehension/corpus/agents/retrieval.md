---
under: the code
kind: brief
---

# Retrieval: what structure buys when a model reads

Three lanes of the sweep covered retrieval — graph-based RAG, chunking, and long context against retrieval. The results converge, and they are deflationary about the expensive options and specific about the cheap one that works.

## 1. Graph retrieval loses on cost and on factoids, and wins on multi-hop

The honest shape of the finding is not that graph retrieval lost. It loses badly on cost and on single-hop factoids, and wins modestly where the question requires joining things — which is the question a linked structure exists to serve. Both halves come out of the same tables, and the second is the half most easily lost when the verdict is stated flatly.

**Its own authors stopped.** A commit on 2026-08-14 put this at the top of the reference implementation's README: "GraphRAG is a research project… Since our first release in July 2024 the capabilities of frontier models have changed dramatically… **This project is largely in maintenance mode, and won't be accepting new PRs or implementing new features.**" The repository is not archived — 35,689 stars, a release five days before the sweep — but the last commits are dependency sweeps and spelling fixes. The same README warns that indexing "can be an expensive operation."

**The strongest independent result.** Zhou et al., *PVLDB* 18(13):5623–5637, 2025, a unified-framework analysis: "**not all graph-based RAG methods consistently outperform the baseline VanillaRAG**"; the local-search variant "even underperforms compared to VanillaRAG" on two of three complex-question datasets. Cost: on one summarisation dataset, global search "requires **57× more time and 210× more tokens per query** compared to VanillaRAG… around 9 minutes and 300K tokens, making it impractical for real-world scenarios." Rich knowledge-graph construction costs up to **40× more tokens than trees**.

And the sting: "**RAPTOR often achieves the best performance among most datasets**" — and RAPTOR has no entity graph at all. Worse for the field, swapping its clustering for plain k-means gives "comparable or even better" results. RAPTOR's repository has not been touched since September 2024.

**Corroborating, independently — and these are the two papers that also show where graph retrieval wins.** GraphRAG-Bench (arXiv:2506.05690): "**GraphRAG frequently underperforms vanilla RAG on many real-world tasks**"; fact retrieval 60.92% for plain RAG, at or above most graph methods; tokens per query ~331,375 against ~900, a factor of 350. **But on complex reasoning in the same benchmark, HippoRAG2 scores 53.38% against plain RAG's 42.93%** — a 10.4-point graph win. Han et al. (KDD 2026): single-hop 64.78 F1 for RAG against 63.01 and 50.27 for graph variants, and **summarisation ROUGE-2 RAG 10.08 against community-global 6.99** — graph losing on its own home turf — **while on the multi-hop set HippoRAG2 takes 63.01 against RAG's 60.04, a narrow graph win.** The engine census in the same report grades HippoRAG "best-scoring graph method in independent benchmarks."

Those within-benchmark wins are the strongest evidence in the sweep that structure buys something for multi-hop reading. Two bottleneck findings from the same paper: **only ~65% of answer entities appear in the constructed knowledge graphs**, and upgrading the extraction model moves results substantially. They also report **position bias in model-as-judge summarisation scoring** — which is exactly the methodology the original graph paper used for its win rates. *The Han et al. table figures in this paragraph came to their agent through a page summariser rather than its own read of the paper, and it graded them medium confidence. Given that the sweep's one integrity lesson is a summariser fabricating numbers ([`../method.md`](../method.md) §3), check them before quoting.*

**The economics.** A practitioner estimate widely quoted: "A plain vector index costs about 0.1% of a full GraphRAG index. Three orders of magnitude, paid up front, on content nobody may ever query." The same source names the unsolved real problem: **entity resolution**. If the thing that populates a typed field is a model, the field inherits the model's distortions and then launders them as structure.

Note what this does and does not kill. These evaluations demolish **model-extracted** graphs. They say nothing about human-**declared** structure — the one much-cited result favouring knowledge graphs used a hand-authored ontology and 43 questions against a deliberately weak baseline, and is retired in [`folklore.md`](../folklore.md).

## 2. Chunking sophistication is debunked; structural signal is not

**The debunking, replicated.** "Is Semantic Chunking Worth the Computational Cost?" (arXiv:2410.13070) found the costs unjustified by consistent gains. Replicated through 2026: arXiv:2601.14123 — "sentence chunking is the most cost-effective method, matching semantic chunking up to ~5k tokens"; arXiv:2607.01852 — cluster-based chunking did not beat simpler strategies. A NAACL 2025 findings result reports fixed 200-word chunks matching or beating semantic chunking on both retrieval and generation.

**The crux answer.** Structure-Aware Semantic Chunking with Title-Chain Prefixes (arXiv:2608.00824, 2026-08-01), a 1,600-query stratified evaluation over a production Markdown knowledge base: prepending the **heading hierarchy** to each chunk lifted **MRR@5 from 0.374 to 0.463 (+23.8%)** overall and 0.828 to 0.925 (+11.7%) on the answerable subset, with **zero additional model calls** — the title chain reuses the document's own headers rather than a generated summary.

Its methodological warning matters as much as its headline. In the prefix on/off ablation, **dual-annotator agreement collapsed from κ = 0.45 to κ = 0.04** — stripping the title chain removes the disambiguating context *annotators* need to agree on relevance. Conventional chunking ablations are partly measuring their own labelling protocol.

Grade it paper-only, single author, one knowledge base, not peer-reviewed. It favours **carrying the hierarchy into the chunk, not splitting the document**.

**And it is not the experiment the question actually wants.** The agent that surveyed this territory names the gap in its own words: no independent, non-vendor study exists that varies human-readable document *organisation* — typed page kinds, one topic per page, heading depth, cross-link density — **holding content constant**, and measures answer quality. Title-chain prefixes and the workflow-cards result below are the closest proxies, and **neither manipulates a document set's information architecture**. So the results here say that carrying structure into a chunk helps retrieval; they do not say how to organise a corpus, and should not be read as if they did. A second, different missing experiment is named in [`../substrate/does-structure-pay.md`](../substrate/does-structure-pay.md) §8.

**Corroborating.** LARAG (arXiv:2605.07517) exploits HTML hyperlink structure in technical manuals for better answers with *fewer* chunks — cross-links are retrieval signal. A telecom study reports 87% recall with section-aware chunking, +16% over baselines. GraphSkill finds top-down traversal of hierarchical document structure beats flat-text retrieval for code generation.

**The cleanest "restructuring changes what a model can answer" result** is Workflow Cards (arXiv:2608.11022, eScience 2026): the *same* provenance data re-presented as human-readable structured cards instead of queried via a database schema **nearly doubled answer quality**, consistent across model-as-judge and human assessment. Content held constant, presentation varied. Presentation, not partition.

## 3. Bigger windows did not dissolve the problem

Two results bound the "just use a bigger window" option, and both are stated with their numbers in [`context-engineering.md`](context-engineering.md) §1: removing literal lexical matching drops most models below half their short-context baseline at 32K, and degradation is driven by composition rather than length — including the counter-intuitive finding that models do better on shuffled material than on logically coherent material. Two further results here: standard retrieval "collapses entirely" at ten-million-token corpus scale, and a head-to-head finds no universal winner between retrieval and long context.

The sharpest 2026 datum on the trade: *The Token Tax of Epistemic Accuracy* (arXiv:2606.20898), 972 expert-validated answers — long context **73.1%** correct against semantic RAG **65.4%**, at **26× the tokens**. Read against §1: global graph search costs 210× a vanilla baseline per query, i.e. an order of magnitude more than simply stuffing the context window, for no summarisation win.

## 4. Baselines worth keeping

Anthropic's contextual retrieval (2024-09-19): top-20 retrieval failure 5.7% → 3.7% with contextual embeddings, → 2.9% adding contextual BM25, → 1.9% with reranking; $1.02 per million document tokens; 800-token chunks; and the recommendation to **skip retrieval entirely under ~200k tokens**. Jina's late chunking: nDCG@10 gains small and inconsistent, scaling with document length. RAPTOR: +20% absolute on one long-document QA benchmark.

## 5. The layer moved from retrieving chunks to reading a route

One synthesis claim runs underneath the results above and is not itself a benchmark. Vector-first retrieval has been displaced for *code* by agentic grep-and-navigate, and the honest 2026 position is hybrid — lexical and symbolic for source, semantic for prose, with the agent choosing. The knowledge layer flipped the same way: instead of retrieving chunks into a prompt, the dominant pattern is now a **routing file the agent reads before it reads content**. That is a real structural shift toward addressability, arrived at empirically rather than by design, and it is the same mechanism as the localisation result in [`context-files.md`](context-files.md) §5. *Reasoned by one agent from shipped behaviour; the specific claims it rested on about one vendor removing vector search could not be verified.*

## 6. Commercial signals

Neo4j's last disclosed annual recurring revenue is **$200M from 2024-11-19** — nothing newer in 21 months — and in June 2026 it acquired an intelligence-analysis vendor, a pivot away from knowledge-graphs-for-retrieval. TigerGraph's newsroom stops at a July 2025 private-equity investment, thirteen months of silence. Both read as consolidation.

Meanwhile every structured store is bolting on similarity: Wikidata added an embedding project in October 2025 after splitting its query service in two over scale; TypeDB previewed native vector search on 2026-08-18.

Reports: [`a7bfd40b8a7c7a61c`](../../../../../sweep-2026-08/raw/a7bfd40b8a7c7a61c.md), [`a1c816c1f7cbcfdf9`](../../../../../sweep-2026-08/raw/a1c816c1f7cbcfdf9.md), [`a26ae7e524c53262a`](../../../../../sweep-2026-08/raw/a26ae7e524c53262a.md), [`adc9dab44aefdde97`](../../../../../sweep-2026-08/raw/adc9dab44aefdde97.md), [`aafbf4f4a32e619af`](../../../../../sweep-2026-08/raw/aafbf4f4a32e619af.md) for §5.
