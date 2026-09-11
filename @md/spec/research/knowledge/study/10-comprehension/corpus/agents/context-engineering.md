---
under: the code
kind: brief
---

# Context engineering: measured diagnosis, unmeasured prescription

Context engineering settled in 2025–26 on a four-part decomposition — instructions, retrieval, memory, tools — and one physical premise: context is a finite attention budget, not a container. What is genuinely methodical is the **diagnosis**; the **prescription** is almost entirely vendor blog posts with anecdotes rather than ablations.

## 1. Degradation is about composition, not length

Chroma's *Context Rot* (2025-07-14), 18 models, is the load-bearing study. Even a **single distractor** reduces performance against baseline; lower needle-to-question similarity degrades fastest; and on LongMemEval a ~300-token focused prompt beat the same content inside a ~113,000-token prompt for every model tested.

The least-cited and most useful result in it: **models scored better on shuffled haystacks than on logically coherent ones**, across all 18 models, which Chroma attributes to structural patterns influencing attention. That is a direct caution against assuming a well-organised long document recalls better than a disorganised one.

Independently replicated in spirit: NoLiMa (ICML 2025) removes literal lexical matching and finds **11 of 13 models fall below 50% of their short-context baseline at 32K**, with GPT-4o going 99.3% to 69.7%.

Two results about *position* belong beside those, because they are the direct empirical bearing on any claim that reading order governs what a model takes in. Liu et al., *Lost in the Middle* (TACL 2024), reports a U-shaped curve: material placed at the beginning or the end of a long context is used, and material in the middle is not. RULER (Hsieh et al., COLM 2024) finds that only about half of the models claiming a 32k context hold up at 32k. *Both paper-only, and named in the sweep's coverage chart rather than fetched by an agent — leads, not ground, until read.*

So length is a weak predictor and composition is the variable. This is the strongest available argument for selective context assembly over pasting a transcript — and it is an argument about *selection*, not about the model parsing types better.

## 2. Compaction silently deletes governance constraints

*Governance Decay* (arXiv:2606.22528, June 2026): 1,323 episodes across seven model families. Policy violations go from **0% with full policy context to ~30% after compaction**, 59% for the worst family, 38% where constraints survived summarisation but were dropped downstream. By strategy: recency-truncate 38%, hierarchical 36%, model-summarise 26%. The paper also demonstrates an attack that biases summarisers into dropping policies, which "defeats every evaluated model." The named mitigation — **constraint pinning**, isolating rules from lossy compression — restored 0%.

This is the sharpest empirical case that compression by inference over text is structurally unsafe, and that the fix is *typing* certain content as non-compressible.

## 3. Progressive disclosure works once

He et al., arXiv:2607.17598, July 2026 — three harnesses on InfiniteBench against a classical hybrid retriever, and the only controlled ablation of the pattern the sweep found. **One level of routing degrades gracefully and eventually beats raw navigation; a second routing level gives no benefit and sometimes reduces accuracy.** Results vary by harness quality. Deep hierarchies of pointers are not free: addressability pays at depth one, and depth two is speculative.

## 4. Making context navigable is the biggest reported win, and the report is a hypothetical

The most-quoted number in context engineering is an illustrative hypothetical, and the mechanism under it is real at one to two orders of magnitude less. Anthropic's *Code execution with MCP* (2025-11-04) presents servers as a filesystem of code modules the agent explores on demand and illustrates a workflow going from 150,000 tokens to 2,000 — a figure with no methodology, conditions or validation, retired in [`folklore.md`](../folklore.md). What is shipped and widely adopted is the pattern: tool schemas are now deferred by default and loaded via search.

Vendor-reported and unreplicated: context editing plus a memory tool giving 39% improvement on agentic search, editing alone 29%, and 84% token reduction on a 100-turn evaluation. Treat direction as credible and magnitude as marketing-adjacent.

## 5. Format sensitivity shrinks with capability

He et al., arXiv:2411.10541 (November 2024): GPT-3.5-turbo varied by up to **40%** on code translation by prompt template alone — plain, Markdown, JSON, YAML — while GPT-4 was markedly more robust. A February 2026 study finds plain JSON generation achieving *superior* one-shot accuracy over constrained decoding, with token-oriented formats only amortising their instructional overhead beyond a size threshold.

The honest finding, and one agent states it plainly: **no evidence was found that typed or structured input beats prose on frontier models.** Structure beats *no* structure on weak models; consistency matters more than choice; the frontier has largely absorbed format sensitivity. The case for typed context rests on selection and provenance, not on the model parsing types better.

This is not in tension with the measured gains from typed tool descriptions and typed action spaces in [`descriptions.md`](descriptions.md), and the distinction is worth stating because the two read as contradictory. Those gains are about **what a model is offered to act on** — a catalogue it must choose from, an operation set it must compose within — where typing changes the choice. This finding is about **prose the model reads**, where typing the container changes nothing a frontier model could not already parse. The reconciliation, and the rule it yields, is in [`../substrate/does-structure-pay.md`](../substrate/does-structure-pay.md) §6.

## 6. What the harnesses actually shipped

Several claims about the monolithic completion function were overtaken by product between 2025 and 2026, and it is worth being precise about which.

**Statelessness got stronger, deliberately.** MCP's 2026-07-28 revision removed protocol-level sessions, the session-id header and the initialize handshake, and deprecated Roots, Sampling and Logging. It simultaneously *hardened* the typed layer: a must-implement discovery RPC advertising versions, capabilities and identity; a required result type on every result; a cacheable-result interface **requiring** time-to-live and cache scope on all list and read results; deterministic tool ordering to improve prompt-cache hits; input and output schemas loosened to the full JSON Schema 2020-12 keyword set; OpenTelemetry trace conventions in metadata; a formal feature lifecycle with a twelve-month deprecation window. That is a protocol that stopped trying to be the model's conversation and became a typed, cacheable, discoverable capability layer.

**Context routinely shrinks.** Auto-compaction, focused compaction, clearing, mid-conversation summarisation, tool-schema deferral and sub-agent isolation all ship. Each request still goes over the wire as one flat token sequence.

**Branching and step-back shipped.** Claude Code has `/branch`, `--fork-session` and `/rewind` checkpoints — every user prompt checkpointed, 100 file snapshots per session, persisted across resume. Codex CLI has `/fork` and an ephemeral `/side`; a forked thread **benefits from prompt caching on the shared prefix with its parent**, so branching is cheaper than re-running. The documented blind spots are sharp: bash-mediated file changes are not tracked, background sub-agent edits are not restored, symlinked paths are skipped.

**Compaction is already hybrid, not pure inference.** One harness publishes a typed table of what survives: the system prompt untouched; project-root instructions, auto memory and the plan **re-injected from disk**; path-scoped rules reloaded when their trigger file is read; skill bodies re-injected under a 5,000-token-per-skill and 25,000-total cap, oldest dropped first, truncated from the start of the file; up to five recently-modified files re-read, with files over 5,000 tokens returning as a *path reference* rather than content. Only the conversational middle is summarised — deterministic re-derivation for typed sources, lossy inference for the transcript.

## 7. Where the claim still lands

Three things remain absent, and they are where the ground is.

**The typed layer is a re-injection ruleset, not a query surface.** Nothing lets you ask what is in context, or address a past state by identity. A context report gives category totals; it is not queryable structure.

**Branches are transcript copies, not shared structure.** Forking duplicates a JSONL file; it does not give two branches a common addressable store. And the on-disk format is documented as internal and changing between versions.

**Reproducibility is unsolved in shipped products.** Nobody in the mainstream can say "this completion came from exactly this context, re-derivable." Server-side compaction and background memory consolidation actively make the recorded context non-reconstructible from the transcript — reproducibility is being traded away for context economy, deliberately. The work exists only as papers: an append-only event log as source of truth with deterministic replay and cheap forking (and its author is candid that replay is deterministic only because model and tool *responses are recorded*, not because they are reproducible); a snapshot/branch/trim directed acyclic graph over 76 real coding sessions reporting up to 86% token reduction; a hierarchical summary graph with lossless pointers to every original. All niche.

Notably, MCP **resources** — read-only, URI-addressable, now cacheable with time-to-live and scope — are exactly the primitive that is wanted, and the ecosystem converged on tools-only servers instead. The one at-scale deployment of MCP resources ships *interface bundles*, not knowledge.

## 8. The dates that matter

June 2025: "context engineering" named in public. June 2025: two opposed position papers land within 24 hours — one arguing against multi-agent designs, one reporting +90.2% over a single agent at ~15× token cost. The 2026 settlement is one orchestrator with continuous context and ephemeral read-only sub-agents returning 1–2k-token summaries; parallel *writer* swarms remain fragile. December 2025: the Agentic AI Foundation forms under the Linux Foundation, holding MCP, `AGENTS.md` and goose; Agent Skills released as an open standard. June 2026: Google declares llms.txt inert; branchable *execution environments* appear in research. July 2026: MCP goes stateless. August 2026: A2A joins the foundation.

Reports: [`aafbf4f4a32e619af`](../../../../../sweep-2026-08/raw/aafbf4f4a32e619af.md), [`aa5f5baaa66cc8bf1`](../../../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md). The position results in §1 are from [`a583337921a4f7975`](../../../../../sweep-2026-08/raw/a583337921a4f7975.md), the coverage chart, and are leads rather than ground.
