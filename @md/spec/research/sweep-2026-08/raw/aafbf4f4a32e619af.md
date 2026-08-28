I have a solid evidence base. Writing the report.

---

# CONTEXT ENGINEERING AS OF 2026-08-26

## 1. HEADLINE

- **MCP deleted its own session concept.** The `2026-07-28` spec revision removed protocol-level sessions, the `Mcp-Session-Id` header, and the `initialize` handshake; it deprecated Roots, Sampling and Logging. Resources *survived* and got stronger — every `resources/read` and `resources/list` result now carries required `ttlMs` and `cacheScope` fields. MCP's read surface became more addressable and cacheable at the exact moment its conversational surface was deleted.
- **`llms.txt` is empirically inert.** A server-log study across ~900 monitored domains (Sept 4 2025 – Apr 13 2026) logged 1,227 total requests and **zero** from GPTBot, ClaudeBot, PerplexityBot or Google-Extended. Google stated flatly on June 15 2026 that it has no effect. The proposal is alive as a publishing habit and dead as a retrieval channel.
- **Compaction is now a documented safety failure, not just a fidelity failure.** The ConstraintRot work (June 2026) measured 0% policy-violation rate with full context rising to ~30% average (59% worst model family) after compaction, and demonstrated an attack that biases summarizers into dropping policies — which "defeats every evaluated model."
- **Branching shipped in both leading coding agents.** Claude Code has `/branch`, `--fork-session`, and `/rewind` checkpoints; Codex CLI has `/fork` (v0.107.0) and ephemeral `/side` (v0.122.0, Apr 20 2026). The "no branch to take, nowhere to step back to" claim is factually false for the two most-used agent harnesses.
- **Progressive disclosure has a measured ceiling.** A controlled study (arXiv 2607.17598, July 20 2026) found *one* routing level beats raw navigation, and a *second* level provides no benefit and sometimes hurts. Progressive disclosure "buys context, not intelligence."
- **Governance consolidated fast.** The Linux Foundation's Agentic AI Foundation (Dec 9 2025) now holds MCP, AGENTS.md and goose; A2A joined Aug 17 2026. Platinum members include AWS, Anthropic, Google, Microsoft, OpenAI, Bloomberg, Block and Cloudflare.
- **Compaction in Claude Code is no longer pure inference-over-text.** A published *typed table* governs what is re-injected from disk (CLAUDE.md, auto memory, plan, path-scoped rules, skill bodies at a 5k/25k token cap, up to five recently-modified files) versus what is summarized away. The typed part is deterministic; only the conversational middle is lossy.

## 2. THE MAP

Context engineering settled on a four-part decomposition — instructions, retrieval, memory, tools — and on one physical premise: context is a finite attention budget, not a container. Anthropic's canonical statement (Sept 29 2025) put it as "LLMs have an 'attention budget'"; the field has since organized around five moves: **curate** (minimal tool sets, tight system prompts), **offload** (write state to files), **compact** (summarize and reinitialize), **isolate** (sub-agents with fresh windows), and **defer** (load instructions/tools/docs only when needed).

What is genuinely methodical: the *diagnosis*. Context rot is measured, reproduced, and now has benchmarks (LOCA-bench, ConstraintRot, OOLONG). What is still vibes: the *prescription*. Almost every published "best practice" is a lab blog post with an anecdote, not an ablation. Anthropic's own long-running-harness post (Nov 26 2025) contains no quantitative evaluation at all — its central recommendation ("use JSON not Markdown for the feature list, because the model is less likely to overwrite JSON") is an observation, not a measurement.

The retrieval layer flipped. Vector-first RAG has been displaced for *code* by agentic grep-and-navigate; the honest 2026 position is hybrid — lexical/symbolic for source, semantic for prose, agent chooses. The knowledge layer flipped too: instead of retrieving chunks into a prompt, the dominant pattern is now a **routing file that the agent reads before it reads content** (SKILL.md, AGENTS.md, `resources/list`). That is a real structural shift toward addressability, arrived at empirically rather than by design.

## 3. LOAD-BEARING FINDINGS

**Claim: Degradation begins far below the context limit, and is driven by structure, not just length.**
Evidence: Chroma, *Context Rot*, 18 models, [trychroma.com/research/context-rot](https://www.trychroma.com/research/context-rot), July 14 2025. Findings: even a *single* distractor reduces performance vs. baseline; lower needle–question similarity degrades faster; and — counterintuitively — **shuffled haystacks outperform coherent ones across all 18 models**. On LongMemEval, a ~300-token focused prompt beat the same content inside a ~113k-token prompt for every model.
Grade: **paper-only, but independently replicated in spirit** (NoLiMa, ICML 2025: 11 models drop below 50% of short-context baseline at 32K; GPT-4o 99.3% → 69.7%).
Limits: authors explicitly disclaim mechanistic explanation and note tasks are simpler than real workloads. The "coherent haystacks are worse" result is the single most under-cited finding and cuts *against* naive "give it a well-written document" advice.
Consequence: length is a weak predictor; *composition* is the variable. This is the strongest available argument for typed, selective context assembly over transcript pasting.

**Claim: Compaction silently deletes governance constraints.**
Evidence: Chen, *Governance Decay*, [arxiv.org/abs/2606.22528](https://arxiv.org/abs/2606.22528), June 21 2026 (rev. June 27). 1,323 episodes, seven model families: 0% violations with full policy context → ~30% average after compaction, 59% worst family, 38% when constraints survived summarization but were dropped downstream. Also: recency-truncate 38%, hierarchical 36%, LLM-summarize 26% failure rates. "Constraint pinning" (isolating rules from lossy compression) restored 0%.
Grade: **paper-only**, single author, but with a deterministic benchmark and a named mitigation.
Consequence: this is the sharpest empirical case that "compression by inference over the text" is structurally unsafe — and that the fix is *typing* certain content as non-compressible.

**Claim: Progressive disclosure works, once.**
Evidence: He et al., [arxiv.org/abs/2607.17598](https://arxiv.org/abs/2607.17598), July 20 2026. Three harnesses, InfiniteBench, vs. a classical hybrid retriever. One-level disclosure degrades gracefully and eventually beats raw navigation; a second routing level gives no benefit and sometimes reduces accuracy. Results vary by harness quality.
Grade: **paper-only**, but it is the only controlled ablation of the pattern I found.
Consequence: deep hierarchies of pointers are not free. Addressability pays at depth 1; depth 2 is speculative.

**Claim: Structural framing of tools beats flat tool lists by ~2 orders of magnitude in tokens.**
Evidence: Anthropic, *Code execution with MCP*, [anthropic.com/engineering/code-execution-with-mcp](https://www.anthropic.com/engineering/code-execution-with-mcp), Nov 4 2025: presenting MCP servers as a filesystem of code modules the agent explores on demand took a Google Drive→Salesforce workflow from **150,000 tokens to 2,000 (98.7%)**.
Grade: **shipped-and-widely-adopted as a pattern** (Claude Code now defers MCP tool schemas by default and loads them via tool search); **vendor-reported** as a number.
Consequence: the biggest measured win in context engineering to date came from making context *navigable* rather than *present*.

**Claim: Explicit context-management tooling produces measurable gains.**
Evidence: Anthropic, Sept 29 2025, [claude.com/blog/context-management](https://claude.com/blog/context-management): context editing + memory tool = 39% improvement on agentic search; editing alone 29%; a 100-turn web-search eval saw **84% token reduction**.
Grade: **shipped, vendor-reported, not independently replicated.** Internal eval, undisclosed composition — treat the direction as credible, the magnitude as marketing-adjacent.

**Claim: Instruction files measurably change agent behaviour, but the effect is small and noisy.**
Evidence: AAIF, [aaif.io/blog/measuring-agents-md-what-five-runs-show-that-one-doesn-t](https://aaif.io/blog/measuring-agents-md-what-five-runs-show-that-one-doesn-t): one repo, GitHub Copilot CLI, five runs per condition, twelve-line AGENTS.md. Ambiguous task: −27% wall time, −24% credits, −26% diff size. Multi-file task: 9–10%. Two of five no-AGENTS.md runs wasted effort re-orienting or ran an unrequested build.
Grade: **shipped-and-widely-adopted (the file); paper-only-quality (the evidence)** — the author says outright it is "one data point, gathered on one repo with one agent."
Consequence: the most-adopted convention in the field (60,000+ repos) rests on almost no public measurement. That gap is the single biggest hole in the discipline.

**Claim: Prompt format matters, but the effect shrinks with model capability.**
Evidence: He et al., *Does Prompt Formatting Have Any Impact on LLM Performance?*, [arxiv.org/abs/2411.10541](https://arxiv.org/abs/2411.10541), Nov 15 2024: GPT-3.5-turbo varied by up to **40%** on code translation by template alone (plain/Markdown/JSON/YAML); GPT-4 was markedly more robust. Matveev, [arxiv.org/abs/2603.03306](https://arxiv.org/abs/2603.03306), Feb 8 2026 (TOON vs JSON): plain JSON generation achieved *superior* one-shot accuracy over constrained decoding; token-oriented formats only amortize their instructional overhead beyond a size threshold.
Grade: **paper-only, and weaker than the folklore.**
Consequence: **I could not find evidence that typed/structured input beats prose on frontier models.** The honest finding is that structure beats *no* structure on weak models, that consistency matters more than choice, and that the frontier has largely absorbed format sensitivity. The case for typed context rests on *selection and provenance*, not on the model parsing types better.

**Claim: `llms.txt` publishes to nobody.**
Evidence: Seekio server-log study, Sept 4 2025 – Apr 13 2026, ~900 domains: 1,227 requests total, top requester Dataprovider.com at 64.7%, **zero** from frontier AI crawlers. SE Ranking, ~300,000 domains, Nov 20 2025: 10.13% adoption, "no measurable link between publishing llms.txt and AI-citation frequency." Google's AI-optimization guidance, June 15 2026: no effect on Search or AI Overviews; John Mueller's structural argument — a self-reported manifest cannot differentiate, because every site claims to be best. Adoption is bimodal: 51.8% among a 219-host developer-tool panel (Aug 3 2026) vs 8.7% of Tranco top 1,000 (June 2026).
Grade: **shipped-niche, and empirically refuted as a retrieval mechanism** (secondary aggregation — I could not open the primary studies).
Consequence: a convention with no consumer is not a standard. Contrast with AGENTS.md, which has consumers.

## 4. WHAT MOVED IN 2025–2026

- **June 19 / 25 2025** — Tobi Lütke, then Karpathy, name "context engineering." Cognition's Walden Yan had used it earlier; June 2025 is when it went mainstream.
- **June 12–13 2025** — Cognition's *Don't Build Multi-Agents* and Anthropic's *multi-agent research system* land within 24 hours, staking opposite positions. Anthropic reported +90.2% over single-agent Opus 4 on an internal research eval at ~15× token cost. The 2026 settlement: one orchestrator with continuous context, ephemeral read-only sub-agents returning ~1–2k-token summaries; parallel *writer* swarms remain fragile.
- **July 14 2025** — Chroma's Context Rot.
- **Aug 2025** — OpenAI ships AGENTS.md.
- **Sept 29 2025** — Anthropic ships context editing + memory tool, and publishes *Effective context engineering for AI agents*.
- **Nov 4 2025** — Anthropic's code-execution-with-MCP post: the 98.7% number.
- **Nov 26 2025** — Anthropic's long-running-harness post: file-based offloading (`claude-progress.txt`, JSON feature lists, git log) as the mechanism for spanning context windows. Explicitly: compaction alone is insufficient.
- **Dec 9 2025** — Agentic AI Foundation forms under the Linux Foundation, anchored by MCP (Anthropic), AGENTS.md (OpenAI), goose (Block).
- **Dec 2025** — Agent Skills released as an open standard; `agentskills.io` now lists ~45 adopting clients including Cursor, Gemini CLI, GitHub Copilot, VS Code, Codex, OpenHands, goose, Amp, Factory, Kiro, Snowflake Cortex Code, Databricks, Spring AI, Mistral Vibe.
- **Feb 2026** — LOCA-bench (Feb 8) brings controllable context growth to *agentic* rather than retrieval settings; LCM/Volt (Feb 14) claims a hierarchical summary DAG with "lossless pointers to every original," reporting 74.8 vs Claude Code's 70.3 average on OOLONG across 8K–1M; CMV (Feb 25) proposes a DAG with snapshot/branch/trim primitives, up to 86% token reduction (20% average) over 76 real coding sessions.
- **Apr 20–25 2026** — Codex CLI `/side`; OpenAI's GPT-5.5 prompting guide advises starting from "the smallest prompt that preserves the product contract."
- **June 2026** — Google declares llms.txt inert (June 15); StateFork/Waypoint (June 4, Columbia DAPLab) gives agents branchable *execution environments*, reporting Pass@20-level TerminalBench accuracy in <10 min vs 2+ hours; ConstraintRot (June 21); the Miasma worm plants adversarial MCP configs across 73 GitHub repos including `azure/durabletask`.
- **July 28 2026** — MCP `2026-07-28`: stateless core, `server/discover`, MRTR replacing server-initiated requests, cacheable list/read results, Tasks moved to an extension, Roots/Sampling/Logging deprecated under a new 12-month lifecycle policy. Tier-1 SDKs at "close to half-a-billion downloads a month."
- **Aug 17 2026** — A2A joins AAIF alongside MCP.

## 5. THE MONOLITH CLAIM, TESTED

**"A stateless completion function" — still true, and now *more* true.** MCP moved deliberately *toward* statelessness in July 2026, for load-balancer reasons. The industry's answer to state is not protocol memory; it is files and handles.

**"Context that only grows" — false as a description of the harness, true as a description of the wire.** Claude Code auto-compacts, supports `/compact <focus>`, `/autocompact 500k`, `/clear`, mid-conversation `Summarize from here` / `Summarize up to here`, tool-schema deferral, and sub-agent isolation. Context routinely *shrinks*. But each request still ships one flat token sequence.

**"Nowhere to step back to" — false.** Claude Code checkpoints every user prompt, retains 100 file snapshots per session, persists them with the conversation across resume, and offers restore-code / restore-conversation / restore-both. Documented limits are sharp and worth naming: bash-mediated file changes are not tracked, background sub-agent edits are not restored, symlinked/hard-linked paths are skipped.

**"No branch to take" — false.** `/branch` and `claude --continue --fork-session` copy the transcript into a new session ID that appears as its own row in the picker, with the original unchanged on disk. Codex `/fork` clones to a new on-disk thread and *benefits from prompt caching on the shared prefix with its parent* — branching is not merely possible, it is cheaper than re-running.

**"Compression and handover happen only by inference over the text" — substantially false in the strongest harness.** Claude Code publishes a typed table of what survives compaction: system prompt untouched; project-root CLAUDE.md, auto memory and the plan re-injected *from disk*; path-scoped rules and nested CLAUDE.md reloaded when their trigger file is read; skill bodies re-injected under a 5,000-token-per-skill / 25,000-total cap, oldest dropped first, truncated from the *start* of the file; up to five recently-modified files re-read, with files over 5,000 tokens returning as a *path reference* rather than content; `SessionStart` hooks with source `compact` re-run. Only the conversational middle is summarized. That is a hybrid: deterministic re-derivation for typed sources, lossy inference for the transcript.

**Where the claim still lands.** Three things remain absent:

1. **The typed layer is a re-injection ruleset, not a query surface.** Nothing lets you *ask* what is in context, or address a past state by identity. `/context` reports category totals; it is not queryable structure.
2. **Branches are transcript copies, not shared structure.** `/branch` duplicates JSONL; it does not give two branches a common addressable store. And Claude Code's own docs warn the on-disk entry format "is internal and changes between versions."
3. **Reproducibility is essentially unsolved in shipped products.** Nobody in the mainstream can say "this completion came from exactly this context, re-derivable." The work exists only as papers: ActiveGraph (*The Log is the Agent*, May 21 2026) makes the append-only event log the source of truth with deterministic replay, cheap forking, and end-to-end lineage — and its author is candid that replay is deterministic only because model and tool *responses are recorded*, not because they are reproducible. CMV and LCM propose DAGs with lossless pointers. All are niche implementations.

The honest verdict: **the "no branch, no step-back" half of the monolith claim has been overtaken by shipped product; the "not addressable, not queryable, not reproducible" half is intact and is where the remaining ground is.** Notably, MCP *resources* — read-only, URI-addressable, now cacheable with TTL and scope — are exactly the primitive the counter-claim describes, and the ecosystem has converged on tools-only servers instead. The one at-scale deployment of MCP resources I could confirm is ChatGPT's Apps SDK, which uses `ui://` resource URIs to ship *interface bundles*, not knowledge.

## 6. WHAT I COULD NOT ESTABLISH

- **Any quantitative measure of MCP resource adoption.** Every source asserting resources are underused is conceptual. No server census breaks out `resources/list` implementation rates. Server counts themselves are contested (~9,400–17,500 depending on registry; official registry 9,652 latest records as of May 24 2026).
- **The claim that agentic keyword search reaches "94.5% of RAG faithfulness"** (attributed to an Amazon Science AAAI 2026 paper) — I could not reach a primary source. Likewise the widely repeated "Anthropic removed vector search from Claude Code in May 2025" has no primary citation I could verify.
- **Whether typed/structured context beats prose on frontier models.** The only controlled studies are on GPT-3.5/GPT-4-era models and show the effect *shrinking* with capability. This is a real gap and should not be papered over.
- **Independent replication of any vendor context-management number** (39%/29%/84%, 98.7%, 90.2%).
- **Whether the 60,000-repo AGENTS.md figure is current** — it comes from the Dec 9 2025 Linux Foundation press release and is repeated unchanged eight months later.
- **Google's and OpenAI's context-engineering doctrine in primary form.** Google's "Sessions and Memory" whitepaper is cited secondhand; OpenAI's guidance is distributed across model-specific prompting guides rather than a single doctrinal post.
- **MCP security prevalence figures** (5.5% tool poisoning of 1,899 servers; 36.7% SSRF of ~7,000; 43% command-injection) come from vendor scans with undisclosed methodology.
- I exhausted the session's web-search budget mid-investigation; the last third relies on direct fetches of URLs already surfaced.

## 7. LEADS

1. https://www.trychroma.com/research/context-rot — the coherent-haystack result nobody cites.
2. https://arxiv.org/abs/2606.22528 — compaction erases safety constraints; has an attack and a fix.
3. https://arxiv.org/abs/2607.17598 — the only ablation of progressive disclosure; depth 2 hurts.
4. https://modelcontextprotocol.io/specification/2026-07-28/changelog — MCP goes stateless; resources gain `ttlMs`/`cacheScope`.
5. https://code.claude.com/docs/en/context-window — the typed "what survives compaction" table.
6. https://code.claude.com/docs/en/sessions — `/branch`, `--fork-session`, JSONL transcript storage and its instability warning.
7. https://code.claude.com/docs/en/checkpointing — checkpoint mechanics and their four documented blind spots.
8. https://www.anthropic.com/engineering/code-execution-with-mcp — 150k → 2k tokens by making tools navigable.
9. https://arxiv.org/abs/2605.21997 — ActiveGraph: event log as source of truth, deterministic replay, cheap forking.
10. https://arxiv.org/abs/2602.22402 — Contextual Memory Virtualisation: DAG snapshot/branch/trim over 76 real sessions.
11. https://arxiv.org/abs/2605.04050 — LCM/Volt: hierarchical summary DAG with lossless pointers, OOLONG 8K–1M.
12. https://arxiv.org/abs/2602.07962 — LOCA-bench: context rot moved from retrieval to agentic settings.
13. https://daplab.cs.columbia.edu/general/2026/06/04/statefork-give-agents-a-rewind-button.html — branchable execution *environments*, not just transcripts.
14. https://aaif.io/blog/measuring-agents-md-what-five-runs-show-that-one-doesn-t — the field's most honest small measurement.
15. https://arxiv.org/abs/2411.10541 — prompt format swings 40% on weak models, much less on strong ones.
