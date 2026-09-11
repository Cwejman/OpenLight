---
under: the code
kind: brief
---

# Does typed structure pay for a model?

One agent was sent to argue against the project's own thesis at full strength, and it produced the most decision-shaped brief in the sweep. This holds its verdict, the evidence on both sides, and the rule it distilled.

## 1. The pendulum, tested

The counter-hypothesis is that the field is moving *away* from up-front typed structure toward markdown and natural language, and the counter-hypothesis is correct about distribution and wrong about substrate.

**MCP is the cleanest proof.** Its 2026-07-28 revision shed the stateful, model-facing, conversational layer and simultaneously *hardened* the typed layer underneath — a protocol moving *down* a layer and getting *more* typed on the way. The list of what it shed and what it added is in [`../agents/context-engineering.md`](../agents/context-engineering.md) §6.

**Agent Skills replaced distribution, not structure.** The efficacy evidence is worse than the adoption evidence — skill injection lowering Pass@2 by 1.3–4.2% at 72–394% more tokens, and every one of 105 release transitions invalidating part of a skill set. Meanwhile structure re-accretes *around* skills: package managers with compiler-style conformance scoring, packaging of provenance and persistent identifiers, typed memory-bound postconditions enforced at dispatch.

**Text won the payload slot. It did not win the substrate.**

## 2. The metadata question, answered differently than in 2006

WinFS failed because clean typed metadata could not be produced. In 2026 metadata can be produced cheaply — at roughly 20–50% precision unless gated. That is not a solution; it is a new failure mode.

**Rosetta** (arXiv:2608.07946) is decisive: 680 paired columns across eleven databases with identifiers destroyed, against human documentation. A model used directly scores **0.223 accuracy on 94% coverage**. The same model inside a deterministic verification harness scores **0.475 on the 42% it commits to** — and restricted to columns where both arms speak, the harness "writes no better prose than the model alone; the gain is selection." The authors' line: "**The deterministic layer is a competence detector, not a competence amplifier.**" Downstream, under full schema opacity a naive translator falls from 0.92 to 0.42 execution accuracy; the gated system answers at 86% accuracy over 59% coverage.

Corroborating: **SOB** (arXiv:2604.25359), 21 models — near-perfect schema compliance, but best value accuracy **83.0% on text, 67.2% on images, 23.7% on audio**. Form is free; content is not. **ExtractBench** (arXiv:2602.12247), 12,867 evaluatable fields — frontier models "remain unreliable," with **0% valid output on a 369-field financial schema across all tested models**, degradation scaling with schema *breadth*. **Annotation variance** (arXiv:2601.02370) — prompt and model choices shift outcomes **12–85 percentage points**, and errors correlated with covariates bias estimates regardless of average accuracy. And a reality check from health records: only **16.44%** of note-derived medication rows exactly overlap the structured medication history for the same visit, 55.17% semantically, 90.34% within thirty days; treatment-action attribution agreement 0.5326. Neither representation is a superset of the other.

## 3. But declared structure wins

The distinction between *inferred* and *declared* is the sharpest available, and three results establish it. Read them holding what §8 says: all three beat a model-*extracted* or an *unstructured* baseline, and **none of them was raced against a well-written prose document**, which is the comparison the claim actually turns on.

**GrOIL** (arXiv:2608.22135) builds ontologies with **no unconstrained generation step**, restricting model use to narrow graph-grounded mediation with a full provenance chain on every term: competency-question coverage **0.85 against 0.63 and 0.62** for direct and multi-agent baselines. **Memanto** (arXiv:2604.22085) uses **thirteen predefined memory categories**, no entity extraction, no graph-schema maintenance: **89.8% on LongMemEval and 87.1% on LoCoMo**, beating hybrid graph and vector systems on a single retrieval query with no ingestion cost. **A governed semantic layer** for enterprise text-to-SQL (arXiv:2608.16663): **97.4% against 55.3%**, McNemar p = 3.05×10⁻⁵. Its authors decline the causal claim themselves: the governed system receives curated semantic artifacts the baseline does not, so the win belongs to the curated layer rather than to the compiler. *Measured and adjudicated; the comparison is not like-for-like and its own authors say so.*

**The middle case — a model extracting under a declared schema — has been measured once, and the payoff is mostly cheaper rather than better.** HCG-RAG (arXiv:2607.22592, June 2026) constrains causal-graph extraction to a schema and reports **3–20× fewer nodes and 8–135× fewer model calls** than the unconstrained baseline while matching entity-relation systems on quality, with graph structure itself worth about **+6 percentage points over embedding-only**. So schema constraint buys cost, and modestly buys quality. A separate agent names the same gap from the other side: whether constraining extraction to a schema improves *quality* rather than just cost is, on the sweep's evidence, unestablished.

**Induced vocabularies lose; small declared vocabularies win.** Rosetta adds the operational rule: its **code-enforced** commit gate produced 0.000 no-evidence coverage on every backbone, while **prompt-requested abstention did not transfer across backbones**. Abstention has to be enforced in code, not asked for in prose.

## 4. What scaling dissolves, and what it never touches

The steelman for waiting is real. Schema compliance is already near-perfect; format gains saturate at the frontier; cross-format spread collapses for strong models; at frontier scale the *content* margin of measured self-revision is exactly zero in all five tested cells despite total effects up to +0.275, meaning much of what the field reports as reasoning change is format repair at the answer-extraction boundary. Microsoft's own README retired its graph-retrieval project citing changed frontier capability.

**What scaling dissolves:** format preference for *reading*, schema compliance, tolerance for messy prose input, hand-built retrieval and linking machinery, and the need to pre-chunk for a small context.

**What it never touches:**

- **Enforcement before generation.** Authorization, budgets, resource caps. A staged architecture eliminates the authorization violations of a direct translate-and-execute baseline; no prompt discipline achieves this, because a model that reads a row has read it. A smarter model does not become a policy engine.

- **Provenance and attribution.** Where a claim came from is a fact about the world, not a property of the reader.

- **Multi-writer coordination.** A status conflict-free type reconverges in **30 of 30** real partition-heal trials where last-writer-wins manages **11 of 30**, with a merge classifier at 0.968 area under the curve and a 0.013 false-merge rate, preserving contradictions rather than silently resolving them.

- **Cost and latency proportional to catalogue size.** Progressive disclosure requires an index: +6.2 points hit rate at one-ninth the prompt-token cost against full-context dumping.

- **Staleness detection.** Across 19,099 servers over 88.6 days, drift-ranked re-auditing at a top-5% budget catches only **~10%** of description changers, because about half the changes land on new arrivals. The control that works is **content-binding** — revalidate the moment a hash moves. That is a typed field, and no model capability substitutes for it.

**The asymmetry is exact: scaling dissolves the problems of reading; it does not touch the problems of writing, committing, and being accountable.**

## 5. The comprehension objection, relocated

The objection — that richer machine-readable structure reduces human agency — is real but mislocated. It applies to structure as *up-front authoring burden*, where the person paying the formalisation cost is not the person receiving the benefit. It does not apply to structure as *decomposition of an opaque process into inspectable units*.

Counter-evidence: decomposing spreadsheet-agent execution into auditable typed actions (formative N = 8, within-subjects N = 16) improved outcomes, users' **comprehension of the task**, error detection and sense of co-ownership — the authors concluding that meaningful oversight "requires not improved post-hoc review mechanisms, but active participation in decisions as they are made." Commenting protocols improve safety without sacrificing task performance, and the **gains increase with monitor strength** — legibility scales *with* capability rather than being obsoleted by it. And a metric calibrated for *human* comprehension predicts semantic preservation under AI refactoring across 5,000 files: human-friendly is AI-friendly, and the two are not in tension.

Structure costs agency when imposed as a tax at authoring time and buys agency when offered as an inspection surface at decision time.

## 6. The decision rule

The uncontested structure domains — authorization, financial and medical records, provenance and audit, transactional integrity, federation, formal verification — share one property: **a claim must be evaluated by a party who was not present when it was written, under an asynchronous or adversarial relationship, with a defined consequence for being wrong.**

Structure wins if the answer is yes to any of five questions.

1. **Enforcement before generation.** Must the rule hold even when the model is wrong or attacked? Then it cannot live in the prompt.

2. **Set operations.** Is the query intersect, count, aggregate, or "all items where" — rather than find, explain, summarise? Prose retrieval answers "find me one"; it cannot answer "how many" without reading everything.

3. **Multiple writers, no coordinator.** Merge, conflict and freshness require claim identity.

4. **Answerable later by someone who was not there.** Provenance, attribution, audit.

5. **Cost proportional to catalogue size.** Progressive disclosure requires an index.

**Prose wins** when the payload is read once, by one reader, who will exercise their own judgment on it, and whose judgment improves with model capability.

**And the hard gate overrides all five: if the type would have to be *inferred* rather than observed or declared, do not type it.**

## 7. The three strongest arguments against

Worth carrying whole, because they are the ones to answer.

**The type-production bottleneck changed shape into something worse.** 2026 can produce *dirty* typed metadata cheaply. A typed store with wrong types is worse than prose, because a wrong type returns a confident answer while incomplete prose returns a visibly incomplete one. Prose degrades gracefully; a type does not.

**Structure is a maintenance liability that decays silently.** Every one of 105 release transitions invalidated part of a skill set, with frontier agents at 29.9–69.7% at repair. Registry drift-ranked re-auditing catches ~10% of changers. Text rots loudly — you read it and see it is stale. A type rots silently and keeps answering.

**The reader for whom structure was an affordance is being replaced.** If the structure premium is a capability-deficit tax, betting the substrate on it is betting against the trend line.

## 8. The crux experiment does not exist

The agent's own most important negative: there is **no head-to-head of model-assisted, human-declared structure against a well-written prose document, on the same corpus, with the same frontier reader.** GrOIL, Memanto and the semantic-layer study each beat model-*extracted* or *unstructured* baselines — never a good prose baseline. That is the missing study, and it is exactly the one the claim turns on.

Report: [`aa5f5baaa66cc8bf1`](../../../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md).
