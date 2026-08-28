# Context: the monolith claim, fact-checked

The README claims a session chains completion to a context that only grows — no branch, nowhere to step back to, compression only by inference over text. The sweep tested that claim against shipped products and the 2026 literature. **Half has been overtaken by product; the other half — addressable, queryable, reproducible — is intact everywhere, and it is night's ground.** This fold carries the split, the science of context degradation, and what happened to retrieval and agent memory.

## Overtaken

- **Branching shipped in both leading coding agents.** Claude Code has `/branch`, `--fork-session`, `/rewind` with checkpoints; Codex has `/fork` and ephemeral `/side` — and a fork shares its parent's prompt-cache prefix, so branching is *cheaper* than re-running. "No branch to take" is factually false for the harnesses people use most.

- **Compression is no longer pure inference over text.** Claude Code publishes a typed table of what survives compaction — memory files, plan, path-scoped rules, skill bodies under caps, recent files — re-injected *from disk* deterministically; only the conversational middle is summarized lossily.

## Intact

- **The typed layer is a re-injection ruleset, not a query surface.** Nothing lets you ask what is in context or address a past state by identity.

- **Branches are transcript copies, not shared structure** — duplicated JSONL in a format the vendor documents as internal and unstable, not two paths over one addressable store.

- **Reproducibility is unsolved in every shipped product, and is being traded away deliberately**: server-side compaction and background memory consolidation make the recorded context non-reconstructible from the transcript. The systems that do replay deterministically (event-log-as-source-of-truth designs) exist only as papers, and their own authors note replay works because responses are *recorded*, not reproducible.

- The pointed irony: **MCP resources — read-only, URI-addressable, now cacheable with TTL and scope — are exactly the primitive night describes, and the ecosystem converged on tools-only servers instead.** No census measures resource adoption; every claim that they are underused is conceptual.

## What context science actually says

- **Composition, not length, is the variable.** Across 18 models: a single distractor hurts; degradation begins far below the context limit; a ~300-token focused prompt beat the same content inside ~113k tokens for every model tested. Removing lexical overlap drops 11 of 13 models below half their short-context baseline at just 32k.

- **The under-cited result: shuffled haystacks outperform logically coherent ones** across all 18 models. "Give the model a well-organised document" is not what the evidence supports; *selective assembly* is. This is the strongest available argument for typed, selective context over transcript pasting — and a caution against assuming a beautifully structured corpus reads better to a model.

- **Compaction is a safety failure, not just a fidelity failure.** With full policy context, 0% violations; after compaction, ~30% average (59% worst family), and an attack can bias summarizers into dropping policies. The measured fix — "constraint pinning," isolating rules from lossy compression — restored 0%. That is the empirical case that inference-over-text compression is structurally unsafe, and that the remedy is *typing content as non-compressible*.

- **Progressive disclosure pays exactly once.** The only controlled ablation found one routing level beats raw navigation; a second level adds nothing and sometimes hurts. Deep pointer hierarchies are not free — relevant to how many levels of entry a knowledge structure should carry.

- The field's honest state: the *diagnosis* is methodical (measured, replicated, benchmarked); the *prescription* is vibes — nearly every published best practice is a lab blog anecdote without ablation. The biggest claimed win (150k → 2k tokens by making tools navigable rather than present) is a vendor illustration, though the mechanism is independently supported at one to two orders smaller magnitude.

## Retrieval: the graph deflation

Independent 2025–26 benchmarks agree: **graph-RAG frequently underperforms tuned vanilla RAG**, global summarisation loses on its own home turf, query costs run 210–350× tokens, and the method that wins the largest independent benchmark contains no knowledge graph at all (and its clustering is matched by plain k-means). Only ~65% of answer entities even appear in extracted graphs; upgrading the extractor moves results more than the graph does. Microsoft put its reference implementation in maintenance mode.

The boundary matters for night: **these evaluations kill LLM-*extracted* graphs, not human-*declared* layers.** The famous "3× more accurate" number is a vendor's 43 questions over a hand-authored ontology against a deliberately weak baseline — evidence for curated semantic layers, folklore as stated ([`folklore.md`](folklore.md)). But the same benchmarks show vanilla vector retrieval beating both graphs and full-text on factoid recall — which is the standing evidence *against* night's no-vector-similarity posture ([`substrate.md`](substrate.md) weighs it).

Also: competent lexical search over raw logs matches or beats graph/summary memory on the standard benchmark — a null that any structured-memory claim has to clear.

## Agent memory: commoditised from above

The labs shipped the memory layer as product: path-addressed stores of markdown documents with **immutable versions attributed to sessions**, filesystem-enforced access, redaction that preserves the audit trail. Files-plus-versions is now the free floor any memory design must beat. What no lab builds — and where vendors rushed within six weeks of each other — is **cross-harness memory**, fact-level temporality, and provenance over *the changed data itself*. All shipped provenance is over the memory store, not the world: "which run edited this file, this row, under what permissions, from what context" is answered nowhere. That question is night's traceability claim, verbatim.

Two more standing results: memory poisoning is unsolved (1.2% poisoning drops accuracy 0.85 → 0.30; a screening pipeline caught 0 of 360 poisoned writes; provenance-*weighted retrieval* is statistically indistinguishable from no defense) — persistent writable memory is a durable injection surface, which is an argument for boundaries at write time, not filters at read time. And the memory-benchmark leaderboards collapsed as evidence under retrieval-budget confounds; treat any "beats X on LoCoMo" as marketing.

## Not established

Whether typed context beats prose for frontier readers (see [`structure.md`](structure.md) — the case rests on selection and enforcement); any independent replication of vendor context-management numbers; MCP resource adoption; whether background consolidation ("dreams") improves any downstream metric — no vendor publishes a number.

---

*Sources: [`aafbf4f4a32e619af`](../raw/aafbf4f4a32e619af.md) (the monolith fact-check, context science, the typed-compaction table) · [`a187277ed3a006fbc`](../raw/a187277ed3a006fbc.md) (memory commoditisation, the four capability tests, poisoning) · [`a7bfd40b8a7c7a61c`](../raw/a7bfd40b8a7c7a61c.md) (the GraphRAG evaluations and their folklore).*
