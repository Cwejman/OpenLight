I ran the investigation against primary sources (arXiv API, GitHub API, vendor docs). Web search budget was exhausted before I started, so everything below is direct-fetch verified or explicitly marked unverified.

---

# VERDICT

**The claim survives in half, and the half it loses is the half that was stated most confidently.** "Typed, self-describing structure is the right substrate" holds — but only for a specific and narrow set of properties (identity, permission, provenance, freshness, address, action space), and only when the types are *declared or deterministically observed*, never *inferred at breadth*; the 2026 evidence on LLM-produced types is bad enough that a typed store built from model-assigned types is worse than prose, because it answers confidently instead of visibly failing. **"Text-as-medium must be superseded" is refuted outright** and must be conceded: prose is the winning medium for the payload, and every 2026 system that won did so by typing the *edges* around a prose or code body, not by typing the body. The defensible restatement is: *type the edges, keep the vocabulary tiny and declared, and leave the content as text.*

---

# 1. THE PENDULUM, TESTED

The counter-hypothesis is correct, and MCP is the cleanest proof.

**MCP's 2026-07-28 revision** (verified against the published changelog) did two things simultaneously. It *shed* the stateful, model-facing, conversational layer: protocol-level sessions and `Mcp-Session-Id` removed (SEP-2567); the `initialize`/`initialized` handshake removed — MCP is now stateless (SEP-2575); `ping`, `logging/setLevel`, SSE resumability and `Last-Event-ID` removed; server-initiated requests (`roots/list`, `sampling/createMessage`, `elicitation/create`) replaced by the Multi Round-Trip Request pattern; **Roots, Sampling and Logging all deprecated** (SEP-2577).

And it *hardened* the typed layer underneath: `server/discover` is now a **MUST**-implement RPC advertising versions, capabilities and identity; every result carries a required `resultType`; a new `CacheableResult` interface **requires** `ttlMs` and `cacheScope` on all list/read results; servers **SHOULD** return `tools/list` in deterministic order specifically to improve prompt-cache hit rates; `inputSchema`/`outputSchema` were **loosened to the full JSON Schema 2020-12 keyword set** with `$ref` resolution requirements (SEP-2106); OpenTelemetry `traceparent`/`tracestate`/`baggage` conventions documented in `_meta`; DCR deprecated in favour of Client ID Metadata Documents; RFC 9207 `iss` validation required. Plus a formal feature lifecycle with a twelve-month deprecation window and a deprecated-features registry.

That is not a protocol losing. That is a protocol that stopped trying to be the model's conversation and became a **typed, cacheable, discoverable, authorization-bearing capability description layer**. It moved down a layer and got *more* typed on the way.

**What Agent Skills actually replaced** is distribution, not structure — and the efficacy evidence is worse than the adoption evidence:

- **WebDev-Skills-Bench** (2608.23067, Aug 2026): 31 public skills × 50 Web-Bench projects × 1,000 tasks × 4 models, with length-matched irrelevant controls. Target skill injection **reduces mean Pass@2 by 1.3%–4.2%**, raises token cost **72%–394%**, and helps in only **17%–36%** of skill-project pairs. Two failure modes: length-distracted, and content-misled (prompt length neutral, content still costs 1.1–1.4pp). Skill rankings transfer weakly across models.
- **Repo2Skill-Evo** (2608.21964): 57 repos, 105 release transitions. **Every** transition invalidated part of the V1 skill set; six frontier agents reach only **29.9%–69.7% avg@3 macro F1** at maintaining them. Title is the finding: skills go stale in silence.
- Meanwhile structure re-accretes *around* skills: Skilldex (2604.16911) is a package manager with compiler-style format-conformance scoring; SciDSK (2608.19625) packages provenance, quality checks and persistent identifiers; SkillEffect (2608.17007) enforces typed memory-bound postconditions at tool dispatch.

Adoption is real — ~53,000 skill specifications on the Manus marketplace alone (2608.20425). Efficacy is not established. **The pendulum swung away from hand-authored up-front schemas and toward typed packaging, addressing, caching and authorization.** Text won the payload slot. It did not win the substrate.

---

# 2. THE METADATA QUESTION

**2026's answer differs from 2006's, but not in the direction the claim needs.** WinFS failed because clean typed metadata could not be produced. In 2026 metadata can be produced cheaply — at roughly 20–50% precision unless gated. That is not a solution; it is a new failure mode.

The decisive study is **Rosetta** (2608.07946, Aug 2026): 680 paired columns across eleven BIRD databases with identifiers destroyed, against human documentation. A model used directly scores **0.223 accuracy on 94% coverage**. The same model inside a deterministic verification harness scores **0.475 on the 42% it commits to**. Restricted to columns where both arms speak, the harness "writes no better prose than the model alone; the gain is selection." The authors' own line: **"The deterministic layer is a competence detector, not a competence amplifier."** Downstream, under full schema opacity a naive translator falls from 0.92 to 0.42 execution accuracy; the gated system answers at 86% accuracy over 59% coverage.

Corroborating:
- **SOB** (2604.25359), 21 models: **near-perfect schema compliance**, but best value accuracy **83.0% text / 67.2% images / 23.7% audio**. Form is free; content is not.
- **ExtractBench** (2602.12247), 12,867 evaluatable fields: frontier models (GPT-5/5.2, Gemini-3, Claude 4.5) "remain unreliable"; **0% valid output on a 369-field financial schema across all tested models**. Degradation is a function of schema *breadth*.
- **Annotation variance** (2601.02370): prompt/model choices shift outcomes **12–85 percentage points**, and errors correlated with covariates bias estimates "regardless of average accuracy."
- **2606.12426**: aggregate calibration can be accidental cancellation of large opposing class-conditional errors — a model that looks calibrated flips the substantive conclusion.
- **EHR reality check** (2608.01570): only **16.44%** of note-derived medication rows exactly overlap structured medication history same-visit; 55.17% semantically; 90.34% within ±30 days. Treatment-action attribution agreement: **0.5326**. Neither representation is a superset of the other.

**Does the anti-extraction verdict extend to LLM-*assisted human-declared* structure? No — and this is the sharpest distinction available.**

- **GrOIL** (2608.22135) builds OWL TBoxes with **no unconstrained generation step**, LLM use restricted to narrow graph-grounded mediation, every term carrying a full provenance chain: competency-question coverage **0.85 vs 0.63 / 0.62** for direct and multi-agent LLM baselines.
- **Memanto** (2604.22085) uses **thirteen predefined memory categories**, no LLM entity extraction, no graph schema maintenance: **89.8% LongMemEval / 87.1% LoCoMo**, beating hybrid graph and vector systems on a single retrieval query with no ingestion cost.
- **SPC** (2608.16663), enterprise text-to-SQL over a governed semantic layer: **37/38 questions correct on every run (97.4%) vs 21/38 (55.3%)** for direct DDL-to-SQL, McNemar **p=3.05×10⁻⁵**, zero wrong-but-executed runs against 29 for the baseline.

The pattern is unambiguous: **induced vocabularies lose; small declared vocabularies win.** Rosetta adds the operational rule — its **code-enforced** commit gate produced 0.000 no-evidence coverage on every backbone, while **prompt-requested abstention did not transfer across backbones**. Abstention has to be enforced in code, not asked for in prose.

---

# 3. DOES STRUCTURE PAY FOR MODELS? (graded)

**A — tool/schema representation, inversely with capability.** TSCG (2605.04107), ~19,000 calls, 12 models: restores **Phi-4 14B from 0% to 84.4% accuracy at 20 tools** (90.3% at 50), 52–57% token savings. The format-vs-compression decomposition (**R²=0.88 → 0.03**) establishes representation change, not compression, as the mechanism. But the scaling arm is the honest part: gains **saturate on light synthetic catalogs**, persisting only as **+5.0pp at ~10,500 input tokens** on heavy production MCP schemas. Payoff ≈ (catalog size) × (capability)⁻¹.

**A — authorization.** 2608.19235: a staged agent architecture **eliminates the authorization violations** of a direct translate-and-execute baseline. No prompt discipline achieves this, because a model that reads a row has read it.

**A — governed semantic layers for querying typed data.** SPC above. Note the authors explicitly refuse the causal claim: SPC receives governed semantic artifacts the DDL baseline does not. The win is the *curated layer*, not the compiler.

**B — typed action spaces.** ReAct-SQL (2608.22651): a **typed DSL of 15 relational operations** instead of free-form SQL, zero-shot, no schema-linking module — **84.5% on corrected BIRD mini-dev, 73.9% EHR-SQL, up to 8× faster** than elaborate pipelines. Ablations: iteration improves grounding, **the DSL improves compositional reliability.** Narrow typed action space beats both free-form generation *and* heavy structural machinery.

**C — constrained decoding for quality.** Let Me Speak Freely (2408.02442) finds significant reasoning decline under format restriction, worsening with strictness. The Parser Already Knows (2608.10137) explains it: masking distorts the model's distribution toward "valid but suboptimal" outputs — repairable via logit correction from parser state, but a real cost by default. JSONSchemaBench (2501.10868, 10K real schemas, 6 frameworks) shows compliance is essentially solved while efficiency and coverage vary widely by framework.

**D — typed instructions.** 2608.08254: placing label definitions in schema descriptions **underperformed system prompts by 11–13pp** for GPT-4.1 and GPT-5.4; when prompt and schema conflicted, accuracy dropped **5–45 points** (Claude Haiku 4.5: 52.5% → 7%; GPT-5.5: 100% → 73%). Typing your instructions creates a second channel that silently overrides the first.

**The cross-cutting result** is 2607.09678: message-format effects across six relay hops are **tier-dependent**. A strong relay is nearly lossless in every format; a 1.5B relay's cross-format spread grows **8.7×** (2.3 → 20.5 points). And in the paired-fork injection, an injected wrong value persists to the final hop in **83–100% of chains in every format**. Their conclusion is the best one-line summary in the literature: **"Structure buys a faithful, error-localizing channel — not an error-correcting code."**

---

# 4. THE SCALING ARGUMENT AND ITS LIMITS

**Steelman.** Format sensitivity is a capability-deficit tax, and the tax is falling. SOB: schema compliance already near-perfect. TSCG: gains saturate at frontier and small catalogs. 2607.09678: format spread collapses for strong relays. 2608.04355 goes further — decomposing self-revision into content and format margins across Qwen3.5 (0.8B–9B), Gemma-4-12B and two frontier models, it finds format effects exceed content effects (Wilcoxon p=1.7e-3), grammar-constrained decoding closes a **median 71%** of the naive-vs-content gap, and at frontier scale the **content margin is exactly zero in all five cells despite total effects up to +0.275**. Microsoft's own README puts graphrag in maintenance mode because "since our first release in July 2024 the capabilities of frontier models have changed dramatically." ReAct-SQL retires schema-linking pipelines with iteration alone.

**What scaling actually dissolves:** format preference for *reading*, schema compliance, tolerance for messy prose input, hand-built retrieval/linking machinery, and the need to pre-chunk knowledge for a small context.

**What it never touches:**
- *Enforcement before generation.* Authorization, budgets, memory caps. 2608.19235 and SkillEffect both work by placing a checker before execution authority is granted. A smarter model does not become a policy engine.
- *Provenance and attribution.* Where a claim came from is a fact about the world, not a property of the reader.
- *Multi-writer coordination.* MELD (2608.16357): a status CRDT reconverges in **30/30** real partition-heal trials where last-writer-wins manages **11/30**; merge classifier AUC 0.968 at a 0.013 false-merge rate. Contradictions are preserved, never silently resolved.
- *Cost and latency proportional to catalog size.* A2X (2605.29270): **+6.2 points Hit Rate at one-ninth the prompt-token cost** versus full-context dumping, +20 points over an embedding baseline.
- *Staleness detection.* 2608.00997: across 19,099 MCP servers over 88.6 days, drift-ranked re-auditing at a top-5% budget catches only **~10% of all description changers**, because ~half of changes land on new arrivals. The control that works is **content-binding — revalidate the moment a hash moves**. That is a typed field, and no model capability substitutes for it.

The asymmetry is exact: **scaling dissolves the problems of reading; it does not touch the problems of writing, committing, and being accountable.**

---

# 5. THE COMPREHENSION OBJECTION

The objection ("richer machine-readable structure reduces human agency" — Dynamicland, Shipman & Marshall) is real but mislocated. It applies to structure as *up-front authoring burden*, where the person paying the formalization cost is not the person receiving the benefit. It does not apply to structure as *decomposition of an opaque process into inspectable units*.

Counter-evidence:
- **Pista** (2604.20070), formative N=8 plus within-subjects N=16: decomposing spreadsheet-agent execution into auditable, controllable typed actions improved not just outcomes but **users' comprehension of the task**, error detection, and sense of co-ownership. Their conclusion: meaningful oversight "requires not improved post-hoc review mechanisms, but active participation in decisions as they are made."
- **Basic Legibility Protocols** (2602.10153): commenting protocols improve safety without sacrificing task performance, and **gains increase with monitor strength** — legibility scales *with* capability rather than being obsoleted by it.
- **2601.02200**: CodeHealth, a metric calibrated for *human* comprehension, predicts semantic preservation under AI refactoring across 5,000 files. Human-friendly is AI-friendly; the two are not in tension.

Verdict: structure costs agency when imposed as a tax at authoring time and buys agency when offered as an inspection surface at decision time. Rosetta's abstention gate is the same mechanic — a typed confidence bound that tells the human where the machine should not be trusted.

---

# 6. THE DECISION RULE

The uncontested structure domains — authorization, financial and medical records, provenance/audit, transactional integrity, federation, formal verification — share one property: **a claim must be evaluated by a party who was not present when it was written, under an asynchronous or adversarial relationship, with a defined consequence for being wrong.**

**Structure wins if you answer yes to any of these five:**

1. **Enforcement-before-generation.** Must the rule hold even when the model is wrong or attacked? Then it cannot live in the prompt. (authz, budgets, resource caps, non-compressible constraints)
2. **Set operations.** Is the query intersect / count / aggregate / "all items where", rather than find / explain / summarise? Prose retrieval answers "find me one"; it cannot answer "how many" without reading everything. The faceted-navigation lineage died for want of the *field*, not the *idea*.
3. **Multiple writers, no coordinator.** Merge, conflict and freshness require claim identity.
4. **Answerable later by someone who wasn't there.** Provenance, attribution, audit.
5. **Cost proportional to catalog size.** Progressive disclosure requires an index.

**Prose wins** when the payload is read once, by one reader, who will exercise their own judgment on it, and whose judgment improves with model capability.

**And the hard gate that overrides all five:** if the type would have to be **inferred** rather than **observed or declared**, do not type it. SOB, ExtractBench and Rosetta bound inferred types at roughly 20–85% wrong, degrading with schema breadth to total failure at 369 fields.

Three corollaries, each independently supported:

- **Type the edges, not the content.** Every winning 2026 system types identity, permission, provenance, freshness and address, and leaves the body as prose or code. Every loser typed the body.
- **Keep the vocabulary tiny and declared.** Memanto's 13 categories, ReAct-SQL's 15 operations, MCP's handful of result types, schema.org's 12 real types out of 958. Induced vocabularies at corpus scale underperform.
- **Structure is only worth it if the system can abstain, and abstention must be code-enforced.** Rosetta's gate: 0.000 no-evidence coverage on every backbone; the prompt-requested version did not transfer.

---

# 7. FOLKLORE AUDIT

**Pro-structure claims that don't hold:**
- **"98.7% / 150,000 → 2,000 tokens."** I read the Anthropic post. Exact wording: *"This reduces the token usage from 150,000 tokens to 2,000 tokens—a time and cost saving of 98.7%."* It is an **illustrative hypothetical** (a Google Drive → Salesforce example), with no methodology, conditions or validation. Stop citing it as a measurement. The *mechanism* is independently supported — A2X's 6.2pp gain at 1/9 the tokens, TSCG's 52–57% savings — at one to two orders of magnitude smaller effect.
- **SPC's 97.4% vs 55.3%** is real and adjudicated, but the authors themselves decline the causal claim: SPC receives governed semantic artifacts the baseline does not.

**Anti-structure claims that don't hold either:**
- **"microsoft/graphrag went maintenance-mode."** Confirmed in the README, but the repo is **not archived**: 35,693 stars, 36 open issues, pushed 2026-08-24, **v3.1.2 released 2026-08-21**. The stated policy is "won't be accepting new PRs or implementing new features… bug fixes and dependency updates, particularly CVEs." That is retirement of a research artifact, not repudiation.
- **LazyGraphRAG "0.1% of GraphRAG cost."** Exact quote: *"LazyGraphRAG data indexing costs are identical to vector RAG and 0.1% of the costs of full GraphRAG."* **Indexing only** — not query cost. And LazyGraphRAG still builds a graph; it defers LLM involvement to query time. This is evidence for *cheap deterministic* structure, not against structure.
- **The TOON "grep tax."** I could not verify the 9,649-experiment / 11-model study (search budget exhausted) — **flagged as unverified**. What I did verify is TOON's own benchmark: 244 questions, 4 models, **72.2% ±2.8 accuracy vs JSON's 71.4% ±2.8 at 42.6% fewer tokens**. The accuracy edge is 0.8pp inside a ±2.8 interval — **null**. And the README itself concedes that for nested or non-uniform data "compact JSON often wins outright," deep nesting has ~0% eligibility, and local/quantized deployments can process compact JSON *faster* despite more tokens. Both the grep-tax claim and the TOON claim are data-shape-dependent; neither generalizes.
- **"Agent Skills won."** Adoption yes (~53,000 specs). Efficacy: the only controlled benchmark found reports skills *lowering* Pass@2 at 72–394% more tokens.

**A warning that hits both sides:** 2608.04355 shows that at frontier scale the content margin of measured "self-correction" is exactly zero while total effects reach +0.275 — much of what the field reports as reasoning change is format repair at the answer-extraction boundary. Stacked on the already-established ~9% temperature-0 outcome flip rate, most single-digit SWE-bench-shaped effects on either side of this debate are noise.

---

# 8. THE THREE STRONGEST ARGUMENTS AGAINST

**1. The type-production bottleneck did not clear — it changed shape into something worse.** WinFS failed because clean typed metadata was unproducible. 2026 can produce *dirty* typed metadata cheaply: Rosetta 0.475 on 42% coverage, ExtractBench 0% valid at 369 fields, SOB 83/67/24% value accuracy behind near-perfect compliance, annotation variance of 12–85pp with covariate-correlated error. **A typed store with wrong types is worse than prose**, because a wrong type returns a confident answer while incomplete prose returns a visibly incomplete one. Prose degrades gracefully; a type does not.

**2. Structure is a maintenance liability that decays silently.** Repo2Skill-Evo: 105/105 release transitions invalidated part of the skill set, frontier agents 29.9–69.7% at repair. MCP registry: 8.6% of servers ever rewrite a description across 89 days; drift-ranked re-auditing catches ~10% of changers. EvoSchema: table-level schema perturbations significantly degrade text-to-SQL. Text rots loudly — you read it and see it is stale. A type rots silently and keeps answering.

**3. The reader for whom structure was an affordance is being replaced.** TSCG's own scaling shows format gains saturating at frontier; 2607.09678 shows format spread 8.7× larger for a 1.5B relay; 2608.04355 shows zero content margin at frontier; Microsoft retired graphrag citing frontier capability. If the structure premium is a capability-deficit tax, betting the substrate on it is betting against the trend line.

---

# 9. WHAT I COULD NOT ESTABLISH

- The TOON "grep tax" study (9,649 experiments, 11 models) — no primary source reached; web search quota exhausted.
- ConstraintRot (2606.22528) and Chroma Context Rot figures — carried forward from the session, **not re-verified by me**.
- **The crux experiment does not exist in what I found**: no head-to-head of LLM-assisted, human-*declared* structure versus a well-written prose document, on the same corpus, with the same frontier reader. GrOIL, Memanto and SPC each beat LLM-*extracted* or *unstructured* baselines — never a good prose baseline. That is the missing study and it is exactly the one the claim turns on.
- Cost per item for metadata extraction at scale — only MiNER reports inference cost and carbon; no dollar-per-million-items figure found.
- MCP *usage* trajectory. The 3,510 → 18,966 growth in 2608.00997 is registry population, not adoption.
- Anthropic/Google 2026 memory-store internals — not re-verified.

---

# 10. LEADS

1. https://arxiv.org/abs/2608.07946 — Rosetta: LLM metadata reconstruction from values, 0.475@42% vs 0.223@94%
2. https://arxiv.org/abs/2602.12247 — ExtractBench: 0% valid output on a 369-field schema, all frontier models
3. https://arxiv.org/abs/2604.25359 — SOB: near-perfect compliance, 83/67/24% value accuracy, 21 models
4. https://arxiv.org/abs/2608.23067 — WebDev-Skills-Bench: skills lower Pass@2 by 1.3–4.2%, cost +72–394%
5. https://arxiv.org/abs/2608.21964 — Repo2Skill-Evo: skills go stale in silence, 29.9–69.7% F1 at repair
6. https://arxiv.org/abs/2607.09678 — "faithful, error-localizing channel — not an error-correcting code"
7. https://arxiv.org/abs/2605.04107 — TSCG: Phi-4 14B 0% → 84.4%; R²=0.88→0.03 representation decomposition
8. https://arxiv.org/abs/2608.16663 — SPC enterprise text-to-SQL: 97.4% vs 55.3%, McNemar p=3.05e-5
9. https://arxiv.org/abs/2608.22651 — ReAct-SQL: 15-op typed DSL, 84.5% BIRD mini-dev, 8× faster
10. https://arxiv.org/abs/2604.22085 — Memanto: 13 declared memory types beat graph memory, 89.8% LongMemEval
11. https://arxiv.org/abs/2608.22135 — GrOIL: constrained LLM mediation, CQ coverage 0.85 vs 0.63
12. https://arxiv.org/abs/2608.16357 — MELD: federated memory merge, CRDT 30/30 vs LWW 11/30
13. https://arxiv.org/abs/2608.00997 — 89-day MCP registry drift; content-binding beats drift ranking
14. https://arxiv.org/abs/2608.04355 — The Calibration Floor: content margin zero at frontier scale
15. https://modelcontextprotocol.io/specification/2026-07-28/changelog — MCP goes stateless, gets more typed
