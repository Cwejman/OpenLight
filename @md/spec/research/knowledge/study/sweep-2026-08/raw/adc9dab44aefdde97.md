# FORMAL KNOWLEDGE REPRESENTATION: THE SEMANTIC WEB LINEAGE AND ITS CURRENT STANDING
*State of the world, 2026-08-26. Grades: shipped-and-adopted / shipped-niche / announced / paper-only / opinion.*

---

## 1. HEADLINE

- **The vocabulary always outgrows its use by two orders of magnitude.** Schema.org's own May-2026 usage data: 958 Types, 4,587 Properties; **12 Types (1.3%) reach 10M+ domains; ~77% of the vocabulary sits below 1,000 domains** ([blog.schema.org, 2026-06-04](https://blog.schema.org/2026/06/04/announcing-the-schema-org-usage-statistics-dataset/); figures via [ppc.land, June 2026](https://ppc.land/google-and-schema-org-finally-show-how-the-web-uses-structured-data/)). A closed vocabulary of eleven key types is not a limitation — it is roughly what the open web actually converged on anyway.
- **The transitive subclass hierarchy is the thing that rots.** Patel-Schneider & Doğan found **~2.39M Wikidata classes simultaneously marked first- and second-order and 1,919,685 problematic split-order pairs** ([arXiv:2411.15550](https://arxiv.org/html/2411.15550v1), 2024-11-23). Grade: paper-only, but measuring shipped data at global scale.
- **The most successful W3C vocabulary already made hierarchy non-transitive on purpose.** SKOS (Rec, 2009-08-18) says `skos:broader` "are **only** used to assert a **direct** (i.e., immediate) hierarchical link," with transitivity split into a separate `skos:broaderTransitive` ([w3.org/TR/skos-reference](https://www.w3.org/TR/skos-reference/)).
- **RDF 1.2 / SPARQL 1.2 / SHACL 1.2 are all unfinished in 2026.** RDF 1.2 Concepts and Semantics are Candidate Recommendations of 2026-04-07; **every concrete syntax is still a Working Draft**, so Concepts is structurally blocked. The WG charter targeted Rec in Q3 2025. Grade: announced.
- **GraphRAG's own authors have stopped.** microsoft/graphrag README, commit "Add notice." **2026-08-14**: "*This project is largely in maintenance mode, and won't be accepting new PRs or implementing new features.*"
- **Zanzibar's paper names transitive membership as the hard problem, and the clone ecosystem is now abandoning depth limits as the wrong metric** — fan-out, not depth, is the cost ([OpenFGA, 2026-07-21](https://openfga.dev/blog/weighted-graph-upcoming-changes)).
- **Nobody merges structure. They serialize it.** Dolt blocks the merge on schema conflict and resolves by taking an entire side; Iceberg has no branch merge at all, only fast-forward; TerminusDB's `ChangeParents` — migrating the inheritance hierarchy — is explicitly **unimplemented**.

---

## 2. THE MAP

The lineage splits cleanly into three things with three different fates.

**The vision failed; the vocabularies succeeded.** Twenty-five years on, the insider retrospective is defensive rather than diagnostic: Juan Sequeda's anniversary piece ([2026-05-02](https://juansequeda.substack.com/p/25-year-anniversary-of-the-semantic)) lists standards and communities, links to the "it failed" critiques, and does not engage them. Grade: opinion — and worth noting as evidence that the field has *not* produced a credible self-post-mortem. The measurable successes are narrow and specific: schema.org (but only ~47 Types of it), Wikidata, SKOS-based library and government thesauri, the OBO biomedical registry, and the EU's DCAT-AP validator infrastructure.

**The reasoning layer is effectively dead; the validation layer won.** OWL reasoner tooling is decaying in public (Pellet last pushed 2017-01-05; Konclude 2022-05-14; Openllet 2025-08-04). SHACL tooling is growing: **pySHACL 1,244,632 PyPI downloads/30d against owlready2's 91,892** (pypistats, 2026-08-26), and pySHACL roughly 2.5× in five months (2026-03: 423,194 → 2026-07: 1,056,564). Caveat: `owlrl` also pulls 1.24M/month, largely transitively, so "nobody runs OWL reasoners" remains **folklore — plausible, unmeasured**. The telling structural fact is that W3C is standardising RDF's new inference language, **SPARQL 1.2 RL (WD, 2026-08-25), as datalog-style rules under the Data Shapes WG** — not description logic, not under an OWL WG.

**Scale broke the flagship.** Wikidata split its query service in two on **2025-05-09** because 16B+ triples growing 1B/year made Blazegraph reloads take 1–2 months and crash unpredictably ([WDQS graph split](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/WDQS_graph_split)); the legacy full graph was retired December 2025, and cross-domain queries now require SPARQL federation. In October 2025 Wikidata added a vector **Embedding Project**. TypeDB previewed **native vector search on 2026-08-18**. The pattern: every structured store is bolting on similarity.

Meanwhile the property-graph side got its ISO standard — **ISO/IEC 39075:2024, published 2024-04-12** — and promptly failed to converge: Neo4j's own Cypher Manual v25 lists **unsupported mandatory GQL features** (session and transaction statements, graph expressions, schema references, reserved-word alignment). Grade: shipped-standard, unconverged-implementations. PG-Schema (PACMMOD 2023, [arXiv:2211.10962](https://arxiv.org/abs/2211.10962)) is the property-graph world's schema answer, and it went the opposite way from the described model: **explicit multi-inheritance**.

---

## 3. LOAD-BEARING FINDINGS

**Claim: global predicate vocabularies grow a dead long tail; usage concentrates hard.**
Evidence: [schema.org usage dataset, 2026-06-04](https://blog.schema.org/2026/06/04/announcing-the-schema-org-usage-statistics-dataset/) — 47 Types (~5%) account for essentially all high-volume deployment. Corroborating: **OBO Foundry registry, fetched 2026-08-26 — 266 entries, 190 active, 71 inactive, 5 orphaned**, i.e. **29% of a curated, governed, principle-enforcing ontology registry is dead**. Grade: shipped-and-adopted (measured on live deployments).
Consequence: an eleven-type closed vocabulary is defensible on evidence, not just taste. But note the corollary — the long tail didn't vanish, it moved into *someone else's* namespace. Scoping contracts to owners doesn't remove the modelling cost; it relocates it to integration time, where it becomes the ontology-alignment problem.

**Claim: transitive subtyping degrades under many-owner editing.**
Evidence: [arXiv:2411.15550](https://arxiv.org/html/2411.15550v1), 2024-11-23 — 2,447,483 second-order classes of which 2,386,595 are also first-order; 120 instance loops; root cause "editor misunderstandings of instance-of and subclass-of." Grade: paper-only, data shipped.
Consequence: the "no subtype relation, nothing transitive" choice removes the single most-reported failure mode of collaborative knowledge bases. This is the model's strongest defensible decision.

**Claim: non-transitive hierarchy is proven design, not a novelty.**
Evidence: SKOS Rec 2009-08-18, S22 and Example 34 — `A broader B`, `B broader C` does **not** entail `A broader C`; transitive closure is a separate, opt-in property.
Consequence: precedent exists and it worked. Expect to need the opt-in closure *eventually* for query expansion — SKOS's stated rationale for keeping both.

**Claim: hand-built global consistency is unaffordable, and even Cyc conceded it.**
Evidence: Cyc consumed ~**$200M and ~2,000 person-years** for ~30M assertions; microtheories exist because each "must be free from monotonic contradictions" while the whole KB need not be ([Yuxi Liu, 2025-04-01/2025-05-30](https://yuxi.ml/essays/posts/cyc/); [Wikipedia: Cyc](https://en.wikipedia.org/wiki/Cyc)). Grade: opinion (well-sourced) + primary description.
Consequence: owner-scoped contracts are Cyc's microtheories rediscovered. That is a real precedent — and Cyc's lesson is that contexts **proliferate rather than consolidate**.

**Claim: transitive permission is the documented performance and safety failure.**
Evidence: Zanzibar (USENIX ATC '19, [PDF](https://www.usenix.org/system/files/atc19-pang.pdf)) §3.2.4: "*Recursive pointer chasing during check evaluation has difficulty maintaining low latency with groups that are deeply nested or have a large number of child groups.*" Leopard denormalises the closure at a cost of "*potentially tens of thousands of discrete Leopard tuple events*" per single tuple write, and is applied only to *selected* namespaces. Check latency p50/p95/p99/p99.9 = **3/11/20/93 ms**. Grade: paper-only publicly, shipped-and-adopted inside Google.
Consequence: one-hop, non-transitive permission is the design that has no Leopard. This is the model's second-strongest decision, and the evidence is the vendors': SpiceDB caps at **depth 50 and has no cycle detector**; OpenFGA capped at **25** and is now **removing** that limit because "*a shallow recursive graph can be more resource-intensive than a deep linear one*" ([2026-07-21](https://openfga.dev/blog/weighted-graph-upcoming-changes)).

**Claim: LLM retrieval converts latent transitive permission into actual leakage — vendor-admitted.**
Evidence: Microsoft's own docs for Restricted SharePoint Search: "*a short-term solution… not intended or scalable for long-term use*," capped at 100 sites, "*isn't a security boundary*," new enablement blocked from **2026-07-31** ([learn.microsoft.com](https://learn.microsoft.com/en-us/sharepoint/restricted-sharepoint-search)). Successor Restricted Content Discovery: for sites >500,000 items an update "*could take more than a week to fully process.*" Google Drive removed the ability to grant *less* access than the parent folder; Notion "*respects the broadest level of access.*" Grade: shipped-and-adopted vendor admission.
Consequence: viewer-side, one-hop permission is aligned with where the industry is being dragged. Also: ACL post-filtering wrecks recall by construction ([Pinecone, 2023-06-30](https://www.pinecone.io/learn/vector-search-filtering/)) — set-intersection over membership *pre*-filters, which is the right side of that trade.

**Claim: graph retrieval does not beat tuned vector RAG, and costs 2–3 orders more.**
Evidence: Zhou et al., **PVLDB 18(13):5623–5637, 2025** ([arXiv:2503.04338](https://arxiv.org/pdf/2503.04338)) — "*not all graph-based RAG methods consistently outperform the baseline VanillaRAG*"; global GraphRAG needs "*57× more time and 210× more tokens per query*," ~9 minutes and 300K tokens; **RAPTOR, which has no entity graph, often wins**. GraphRAG-Bench ([arXiv:2506.05690](https://arxiv.org/abs/2506.05690)): "*GraphRAG frequently underperforms vanilla RAG on many real-world tasks*"; 331,375 vs ~900 tokens/query. Han et al., KDD 2026 ([arXiv:2502.11371](https://arxiv.org/abs/2502.11371)): summarisation ROUGE-2 **RAG 10.08 vs community-global 6.99** — graph loses on its home turf; only ~**65% of answer entities** appear in constructed KGs. Grade: paper-only, independent, multiple.
Consequence: the decision to ship set-intersection + full-text with **no vector similarity** is defensible only if retrieval is over *authored* structure, not extracted structure. The evaluations kill LLM-*extracted* graphs, not human-*declared* ones. But they also show vanilla vector RAG beating both on factoid recall — so "no vector similarity" is the one choice here with active evidence against it.

**Claim: versioning structure is unsolved; everyone degrades to whole-side selection.**
Evidence: Dolt — schema conflicts "*prevent the merge from completing*," and `dolt_conflicts_resolve()` `--ours/--theirs` takes "*the entire table from the chosen side*" ([docs](https://www.dolthub.com/docs/sql-reference/version-control/merges)); plus `dolt_constraint_violations` for merges where both sides are individually valid and the union is not. Apache Iceberg: branches and tags exist, but the documented WAP flow closes with `fastForward` — **no branch merge**. TerminusDB (v12.0.7, 2026-08-10, maintained by dfrnt.com since 2025) is the only system modelling schema change as first-class, via "weakening," and its `ChangeParents` operation is unimplemented. Confluent Schema Registry's default BACKWARD mode is **non-transitive** — a chain of pairwise-compatible changes can be globally incompatible. Grade: shipped-and-adopted (all four).
Consequence: a "typed contract on an archetype, versioned as commits on branches" will hit this exact wall. The shipped answer everywhere is: define a weakening lattice where merge is automatic, and require an explicit, replayable migration outside it.

---

## 4. THE HARD LESSONS

**Modelling cost is the whole cost, and governance doesn't fix it — it just makes the corpses visible.** OBO Foundry has principles, review, and a scope requirement, and 29% of its registry is inactive or orphaned. Assume every contract an owner writes has a maintenance half-life and design for abandonment from day one.

**A standard reaching Rec means nothing; the syntax layer is where it dies.** RDF 1.2's Concepts CR cannot advance until a concrete syntax exits CR, and none has entered. GQL is an ISO standard whose own architect's product isn't conformant. Do not model on paper standards.

**Transitivity is a write-time cost disguised as a read-time convenience.** Zanzibar's Leopard turns one tuple write into tens of thousands of index events. The lesson isn't "avoid deep hierarchies" (that's folklore — OpenFGA just disproved depth as the metric); it's that **any closure you allow, you eventually materialise, and materialising is a fan-out bomb**.

**Opacity and referential subtlety will be relitigated.** RDF-star's quoted triples were *opaque* and usable in subject position; RDF 1.2 made triple terms **transparent, object-position-only**, because the CG design conflated statement-types with statement-tokens and couldn't attach two conflicting provenances to one proposition. If a chunk body can reference another chunk, this question arrives.

**The named "difference from RDF" is not the difference that mattered.** RDF's failure was not a global predicate vocabulary — RDF has *no* global vocabulary; everyone mints namespaces already. Its failure was that the resulting per-owner vocabularies never aligned, and alignment was never automated. (Wikipedia's ontology-alignment page still claims systems achieve "very high precision and recall" **with no figures and no dates** — textbook folklore.) Owner-scoped contracts inherit this problem in full.

**Query languages that ask users to learn a new formalism lose to SQL.** XTDB — a Datalog-first bitemporal database — shipped v2.0.0 on **2025-06-12** built on SQL:2011, and its homepage no longer mentions Datalog at all. Cozo abandoned (last push 2024-12-04). DDlog archived. rustc's Polonius shipped on nightly **2026-08-06** with a **non-Datalog** reformulation, because the Datalog one was "*a non-starter*" on performance. Datalog wins as an internal IR and loses as a surface.

**Accretion has a documented tax.** Datomic's own docs: "*expect every datom to be stored at least 3 times*"; excision "*proportional to the size of the entire database*"; and "*a common modeling mistake is to assume that everything temporal belongs in Datomic*" — i.e. the immutable database tells you to turn immutability off for most attributes. It is nonetheless the strongest-validated system here: Jepsen (2024-05-15) found no safety bugs at Nubank's 94M users / 2.3B transactions per day, while flagging that intra-transaction operations run with **concurrent, not serial, semantics**.

---

## 5. NOVEL vs. WELL-TRODDEN

**Repeats a known path, and the path worked:**
- *Non-transitive membership* → SKOS, 2009. Survived, widely deployed, still the sanest hierarchy design in the stack.
- *Shape/contract validation instead of inference* → SHACL. Won decisively over OWL reasoning on tooling vitality and deployment (EC Interoperability Test Bed DCAT-AP validators, data.europa.eu MQA, Norway's Digdir, Eclipse ESMF/Catena-X, LinkML `gen-shacl`). *Note: the widely-repeated "FIBO uses SHACL" claim did not survive checking — zero SHACL code matches across `org:edmcouncil`. Folklore.*
- *Closed, small vocabulary* → what schema.org empirically became.
- *One-hop, non-transitive permission* → the direction Google Drive, Notion, and OpenFGA have been forced toward.

**Repeats a known path, and the path ended badly:**
- *Owner-scoped contexts as the fence against a global ontology* → Cyc microtheories. They did not consolidate; they multiplied, and Cyc spent 2,000 person-years without resolving it. Expect contract drift between owners and no automatic alignment.
- *Commits and branches over a typed graph* → TerminusDB, the closest prior art in existence. Result: 3,394 stars, seed-funded, and **handed off to a third-party maintainer (dfrnt.com) in 2025**. That is what happened to this exact idea.
- *Retrieval without vector similarity in an LLM era* → the independent benchmarks have vanilla vector RAG beating graph retrieval on factoid recall. Full-text plus set-intersection is a strictly weaker recall surface than either.

**Genuinely uncommon:** the *combination* of (a) one primitive with membership-only typing, (b) contracts owned rather than published, (c) one-hop permission, and (d) branch/commit versioning of the type system itself. Each part has precedent; I found no system holding all four. The interaction between (b) and (d) — branching an owner-scoped contract — is where the literature is thinnest and the shipped systems all capitulate.

---

## 6. WHAT I COULD NOT ESTABLISH

- Any rigorous deployment census of OWL reasoner use in production. "Nobody runs reasoners" is consistent with the tooling decay but **unmeasured**.
- Any published argument *advocating* shallow/non-transitive permission on performance grounds. The evidence is behavioural (Google, OpenFGA), not argued. "Flatten your permissions" has no citable advocate I could find.
- Neo4j's revenue since **$200M ARR (2024-11-19)** — 21 months of silence, alongside its **GraphAware acquisition (2026-06-03)** to attack Palantir Gotham, and TigerGraph's PE investment (2025-07-15) followed by 13 months of press silence. Read as consolidation; not proven.
- Whether constraining LLM extraction to a schema improves *quality* rather than just cost. Best evidence (HCG-RAG, [arXiv:2607.22592](https://arxiv.org/abs/2607.22592)) shows 8–135× fewer LLM calls and only ~+6pp quality.
- Any replication of the much-cited "KGs make LLMs 3× more accurate" result ([arXiv:2311.07509](https://arxiv.org/abs/2311.07509), n=**43 questions**, vendor-authored, zero-shot SQL baseline, hand-built ontology). Treat the headline as folklore.
- Method caveat: the shared web-search budget was exhausted mid-research; roughly half this work was done by direct HTTP/API retrieval, which over-samples W3C, GitHub, PyPI and arXiv and under-samples blogs and conference talks.

---

## 7. LEADS

1. https://blog.schema.org/2026/06/04/announcing-the-schema-org-usage-statistics-dataset/ — the vocabulary long-tail, measured.
2. https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/WDQS_graph_split — the flagship RDF graph hitting its ceiling.
3. https://arxiv.org/html/2411.15550v1 — millions of subclass errors in a live collaborative KG.
4. https://www.w3.org/TR/skos-reference/ — deliberate non-transitive hierarchy, with rationale.
5. https://www.usenix.org/system/files/atc19-pang.pdf — Zanzibar §3.2.4 on transitive check cost; Leopard's write amplification.
6. https://openfga.dev/blog/weighted-graph-upcoming-changes — depth limits abandoned as the wrong cost proxy (2026-07-21).
7. https://learn.microsoft.com/en-us/sharepoint/restricted-sharepoint-search — Microsoft documenting AI oversharing in its own docs.
8. https://arxiv.org/pdf/2503.04338 — PVLDB 2025, graph RAG vs vanilla RAG, cost-normalised.
9. https://arxiv.org/abs/2506.05690 — "GraphRAG frequently underperforms vanilla RAG."
10. https://github.com/microsoft/graphrag — the maintenance-mode notice, 2026-08-14.
11. https://terminusdb.org/docs/schema-migration-reference-guide/ — schema "weakening"; the closest thing to branched-schema merge that ships.
12. https://www.dolthub.com/docs/sql-reference/version-control/merges — schema conflicts block the merge; whole-side resolution.
13. https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html — versioned contracts guarantee decode, not meaning; BACKWARD is non-transitive.
14. https://yuxi.ml/essays/posts/cyc/ — $200M, 2,000 person-years, and why contexts proliferate.
15. https://blog.rust-lang.org/2026/08/04/enabling-polonius-alpha-on-nightly/ — Datalog prototyped, then replaced, on performance.
