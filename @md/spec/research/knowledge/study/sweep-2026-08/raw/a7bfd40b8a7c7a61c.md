## GraphRAG in 2026: the evaluations

**Method note:** the session's web-search budget was already exhausted, so everything below comes from direct fetches of arXiv, GitHub's API, vendor sites, and HN's Algolia API. That biased me toward primary sources, which is fine, but it means I could not do open-ended sweeps for grey literature. Grades: **[A]** shipped-and-adopted, **[B]** shipped-niche, **[C]** announced, **[D]** paper-only, **[O]** opinion.

### 1. Microsoft GraphRAG — alive, but formally frozen

Original paper: [arXiv:2404.16130](https://arxiv.org/pdf/2404.16130) (Apr 2024), repo open-sourced July 2024. Repo state pulled from the GitHub API on **2026-08-26**: 35,689 stars, 3,747 forks, last push 2026-08-24, latest release **v3.1.2 (2026-08-21)**. So it is not dead — but the last ten commits are dependency sweeps, docs spelling fixes, and "Cleanup". The decisive item is commit "Add notice." (#2486, **2026-08-14**), which put this at the top of the README:

> "GraphRAG is a research project… Since our first release in July 2024 the capabilities of frontier models have changed dramatically, and our portfolio of research projects has diversified to match. **This project is largely in maintenance mode, and won't be accepting new PRs or implementing new features.**" — [README](https://github.com/microsoft/graphrag)

The cost problem is admitted in the same README: "*Warning: GraphRAG indexing can be an expensive operation… start small.*" Grade **[A]→[B]**: widely used as a reference implementation, now feature-frozen.

**LazyGraphRAG never shipped as code.** The [MSR blog (2024-11-25)](https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/) by Edge/Trinh/Larson claims indexing "identical to vector RAG and 0.1% of the costs of full GraphRAG" and ">700 times lower query cost" than global search. In [discussion #1490](https://github.com/microsoft/graphrag/discussions/1490), maintainer Alonso Guevara said on **2024-12-09** it "will be the next top priority item to release." There has been **no maintainer update since**, with users still asking through **July 2026**. A June 2025 editor's note on the blog redirects to Microsoft Discovery and an Azure Local preview. Grade: **[C] announced** as OSS; **[B] shipped-niche** as proprietary Azure surface. With the repo now refusing new features, it will not land. The "0.1% cost" figure is **folklore**: a blog number about unreleased code, now recycled as established fact.

### 2. Successors (GitHub API, 2026-08-26)

| Repo | Stars | Last push | Grade |
|---|---|---|---|
| HKUDS/LightRAG (EMNLP'25) | 39,184 | 2026-08-26 | **[A]** — now bigger than microsoft/graphrag |
| OpenSPG/KAG (Ant) | 9,015 | 2026-01-28 | **[B]** stalled 7mo |
| OSU-NLP/HippoRAG | 3,966 | 2026-08-23 | **[D→B]** best-scoring graph method in independent benchmarks |
| gusye1234/nano-graphrag | 3,973 | 2026-01-27 | **[B]** stalled |
| circlemind/fast-graphrag | 3,849 | 2025-11-01 | **[B]** stalled |
| HKUDS/MiniRAG (ACL'26) | 2,007 | 2025-10-16 | **[D]** |
| parthsarthi03/raptor | 1,750 | **2024-09-03** | **[D]** repo abandoned |
| neo4j/neo4j-graphrag-python | 1,263 | 2026-08-24 | **[B]** vendor SDK |
| Tencent/youtu-graphrag (ICLR'26) | 1,252 | 2026-02-26 | **[D]** |
| BUPT-GAMMA/PathRAG | 377 | 2025-12-17 | **[D]** |

Could not establish a GraphReader implementation or any adoption — treat as **[D]**.

### 3. The critical evidence — graph RAG does not beat tuned baselines

**(a) The strongest independent result.** Zhou et al., CUHK-Shenzhen + Huawei Cloud, *In-depth Analysis of Graph-based RAG in a Unified Framework*, **PVLDB 18(13):5623–5637, 2025**; [arXiv:2503.04338v2](https://arxiv.org/pdf/2503.04338) (27 Apr 2026). Verbatim findings from the PDF:

- "*not all graph-based RAG methods consistently outperform the baseline VanillaRAG*"; Microsoft's local search "*LGraphRAG even underperforms compared to VanillaRAG*" on two of three complex-QA datasets.
- "*RAPTOR often achieves the best performance among most datasets*" — and RAPTOR has **no entity graph at all**; worse for the field, swapping its clustering for plain k-means gives "*comparable or even better*" results.
- Cost: on MultihopSum, global GraphRAG "*requires 57× more time and 210× more tokens per query compared to VanillaRAG… around 9 minutes and 300K tokens, making it impractical for real-world scenarios.*" Rich-KG construction costs up to **40× more tokens than trees**.

**(b)** Han et al. (MSU/Meta), *RAG vs. GraphRAG*, [arXiv:2502.11371](https://arxiv.org/abs/2502.11371) v1 2025-02-17, **v3 2026-03-04**, published at KDD 2026 ([DOI 10.1145/3770855.3817575](https://dl.acm.org/doi/10.1145/3770855.3817575)). From v3: NQ single-hop RAG **64.78 F1** vs community-local 63.01 vs KG-GraphRAG 50.27; HotpotQA HippoRAG2 63.01 vs RAG 60.04 (narrow graph win); **summarisation ROUGE-2 RAG 10.08 vs community-global 6.99** — global search loses on its own home turf. Construction 135s (RAG) vs 5,560s / 7,702s. Two bottleneck findings matter most: **only ~65% of answer entities appear in the constructed KGs**, and upgrading the extractor GPT-4o-mini→GPT-4o moves MultiHop-RAG 71.17→75.08 (+32.76 on temporal). They also report **position bias in LLM-as-judge summarisation scoring** — which is exactly the methodology the original GraphRAG paper used for its win rates. *(These table numbers came via a page summariser, not my own read of the PDF — medium confidence.)*

**(c)** Xiang et al., *When to use Graphs in RAG* / GraphRAG-Bench, [arXiv:2506.05690](https://arxiv.org/abs/2506.05690) (2025-06-06, v3 2026-02-22). Abstract, verbatim: "**GraphRAG frequently underperforms vanilla RAG on many real-world tasks.**" Fact retrieval: RAG 60.92% ≈ or beats most graph methods; complex reasoning: HippoRAG2 53.38% vs RAG 42.93%. Tokens/query: MS-GraphRAG global **~331,375** vs vanilla RAG **~879–954** (~350×).

**(d) Practitioner [O].** Jai Juneja (QX Labs), [minimumviablefounder.com, 2026-07-20](https://www.minimumviablefounder.com/p/why-ai-company-brains-fail): "*A plain vector index costs about 0.1% of a full GraphRAG index. Three orders of magnitude, paid up front, on content nobody may ever query.*" He names **entity resolution** as the hardest real problem. HN commenter `hackfather`, same day: graph DBs are "*really hard to get right with unstructured data and introduce more baggage than they're worth for RAG… The fancy solution often isn't worth it.*"

### 4. Ontology-grounded extraction

The famous number: Sequeda, Allemang, Jacob (data.world), [arXiv:2311.07509](https://arxiv.org/abs/2311.07509), **2023-11-13**. GPT-4 zero-shot over SQL **16.7%**; over the KG **54.2%**. Quadrants: LowQ/LowSchema 71.1 vs 25.5; HighQ/LowSchema 66.9 vs 37.4; LowQ/HighSchema **35.7 vs 0**; HighQ/HighSchema **38.7 vs 0**. **Caveats the "3x more accurate" headline drops:** n=43 questions, a 13-table subset of the OMG P&C model, vendor-authored, a *zero-shot* text-to-SQL baseline with no schema linking or few-shot, and — decisively — the "knowledge graph" is a **hand-authored ontology plus mappings**. It is evidence for human-built semantic layers, not for LLM-extracted KGs. I could not establish any 2025–26 replication against a modern text-to-SQL baseline.

Does *constraining* LLM extraction help? Best evidence is **[D]**: HCG-RAG (Saouda et al., BCG), [arXiv:2607.22592](https://arxiv.org/abs/2607.22592) (2026-06-10) — schema-constrained causal graphs give **3–20× fewer nodes, 8–135× fewer LLM calls** than MS-GraphRAG while matching entity-relation systems; graph structure worth **+6 pp over embedding-only**. So schema constraint's demonstrated benefit is mostly *cost*, modestly quality. [arXiv:2511.05991](https://arxiv.org/abs/2511.05991) (2025-11-08) claims ontology-guided KGs "substantially outperform vector retrieval baselines" but I found no numbers.

### 5. Long context

[arXiv:2409.01666](https://arxiv.org/abs/2409.01666) (2024-09-03, NVIDIA) defends *RAG*, not GraphRAG. The sharper 2026 datum: *The Token Tax of Epistemic Accuracy*, [arXiv:2606.20898](https://arxiv.org/abs/2606.20898) (2026-06-18), 972 expert-validated answers — long-context **73.1%** correct vs semantic RAG **65.4%**, at **26× the tokens**. Read against (a): global GraphRAG costs 210× vanilla per query, i.e. **an order of magnitude more than just stuffing the context window**, for no summarisation win.

### 6. Commercial

- **Neo4j:** last disclosed ARR is **$200M, 2024-11-19** — nothing newer in 21 months, which is itself a signal. [2025-10-02](https://neo4j.com/press-releases/neo4j-100m-genai-investment/): $100M "GenAI investment", Aura Agent + MCP server; claims 6× GenAI customer growth, 58% cloud consumption growth, 84/Fortune 100 — **all vendor-stated, unaudited [O]**. **2026-06-03: [acquired GraphAware](https://neo4j.com/press-releases/neo4j-acquires-graphaware/)** (Hume) to attack **Palantir Gotham**, terms undisclosed. That is a pivot from "KG for RAG" to intelligence-analysis applications.
- **TigerGraph:** newsroom's most recent item is **2025-07-15**, a "strategic investment from **Cuadrilla Capital**" — a PE buyout firm. **Thirteen months of press silence since.** Consolidation signal.
- **Graphwise** (Ontotext + Semantic Web Company): active, GraphRAG-branded platform, blog through 2026-08-18, AI Summit naming Accenture/Roche/AstraZeneca. **Stardog:** active, all thought-leadership, no independent adoption evidence.

### Could not establish

LazyGraphRAG source code anywhere; any production GraphRAG deployment with published, independently verified before/after metrics; Neo4j 2025–26 ARR, headcount, or layoffs; TigerGraph deal terms, control, or headcount; Graphwise merger date and financials; Palantir's 2026 KG+LLM positioning; a modern replication of the Sequeda benchmark; GraphReader code or adoption.

### Folklore to name

"GraphRAG wins on global/summarisation queries" traces to Microsoft's own LLM-as-judge win rates — the same judging method later shown position-biased, and independently contradicted on ROUGE. "0.1% of the cost" is a blog claim about code that never shipped. "KGs make LLMs 3× more accurate" is one vendor's 43 questions against a deliberately weak baseline, with a hand-built ontology. And the method that wins the independent VLDB benchmark, RAPTOR, contains no knowledge graph and its repo hasn't been touched since September 2024.
