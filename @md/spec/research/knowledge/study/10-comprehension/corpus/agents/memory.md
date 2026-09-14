---
under: the code
kind: brief
---

# Agent memory, and how the labs took the layer

Between April and August 2026 the memory layer was commoditised from above. One agent measured the delta against a survey run the same month the commoditisation began, and the finding is that the independent vendors' centre of gravity moved from being the memory database to being the memory of the coding agent.

## 1. The flagship retired its own server

Letta / MemGPT, the flagship of the "memory OS" thesis, preserved its Python V1 server on an `archive` branch and turned the main repository into a landing page. The activity figures: **12 commits April–August 2026 against 1,115 in the preceding 21 weeks**. Development moved to a TypeScript **coding-agent harness**, whose notable feature is MemFS — "all context (including memory blocks) is tracked via git" — alongside background consolidation, a memory audit command and a memory viewer.

## 2. The labs shipped the whole layer as product

Dated, from the platform release notes: managed agents public beta **2026-04-08**; agent **memory stores** public beta **2026-04-23**; background memory consolidation research preview **2026-05-06**; memory given its own API version header on **2026-07-02**; memory-store webhooks and per-session overrides 2026-07-22; session spend budgets 2026-08-07; memory stores mountable into self-hosted sandboxes 2026-08-19.

The shape of what shipped matters more than the dates. A memory store is a workspace-scoped collection of text documents mounted into the sandbox, where each memory is addressed by a path, **every change creates an immutable version**, versions belong to the store and survive the memory's deletion, read-only versus read-write access is **enforced at the filesystem level**, and writes produce versions **attributed to the session**. There is a redact endpoint that scrubs content from a historical version while preserving the audit trail. Limits: 100 kB per memory, 2,000 memories per store, 8 stores per session, 30-day version retention. A second lab independently shipped memory revisions plus IAM-conditioned access control.

Two frontier labs now sell scope isolation, versioned facts and audit. That is the free floor anyone building here must beat.

## 3. Where the labs structurally cannot go

The absorption is partial and shaped, and the shape names the remaining room.

**The labs bet on files, not graphs.** Their memory is markdown documents at paths. Neither has bi-temporal edges, invalidation-rather-than-deletion, or fact-level provenance. The strongest independent answer is literally titled "Markdown is not agent memory" (2026-06-23), and its provenance model — edges carrying an episode list of everything that contributed to a fact, with validity intervals accumulating rather than overwriting, so deletion scope is computable — is genuinely more expressive than a file version list.

**The labs' memory is per-vendor.** The one thing no lab will build is memory *across* harnesses — and three independent vendors rushed into that gap within six weeks of each other in mid-2026. That convergence is the market naming the non-commoditised niche.

**The tooling tier is squeezed harder than the memory tier.** One vendor deprecated its agent builder, its evaluations platform and reusable prompt objects on 2026-06-03 with a November shutdown, pushing users to a code-first SDK. Another moved its core development to a private codebase after 71.9k stars. Undifferentiated middleware between the model and the user has roughly eighteen months.

## 4. The independent vendors, measured

Commit counts April–August 2026 against the preceding equivalent period, with stars as of the sweep:

**Mem0** — 64.1k stars; **567 commits against 187**; multi-SDK release train; background consolidation shipped 2026-08-04; content strategy pivoted hard at coding agents. **Cognee** — 30.3k stars; **3,291 commits against 2,181**, the fastest open-source velocity of the six, near-daily releases themed on search relevance and ingestion reliability, i.e. its data-model abstractions are now being tuned as a retrieval product rather than extended. **LightRAG** — 39.2k stars; **2,925 against 1,405**; now carries an EMNLP stamp, having converted into an academic baseline rather than a company. **Zep / Graphiti** — open source decelerating and flat, releases stuck on patches; the company shipping weekly, moving upmarket into provenance tracking, attribute-based access control and enterprise tiers. **MAGMA** — stalled: one paper, no follow-up, no discoverable implementation; the idea survives in the literature, the system did not.

None died. All four of the healthiest now market primarily to coding-agent users.

## 5. The benchmark layer collapsed as evidence

Three 2026 papers make the leaderboards uninterpretable. Retrieval-budget confounds: one system "wins convincingly but uses 2.6M characters of retrieved context per query… after controlling for retrieval budget the lead disappears" (arXiv:2607.16848). Recall without precision (arXiv:2605.11325). Serving cost never measured, with some memory systems never breaking even against resubmitting the full transcript within 400 turns (arXiv:2608.11879). Meanwhile launches claiming to beat the incumbent on the same leaderboard continue — the benchmark is now a marketing token.

Two further results cut at the premise. A lexical turn-level index with an iterative keyword loop matches or beats graph and summary memory on MemoryAgentBench (arXiv:2608.12888) — nobody had shown that competent lexical search over the raw log does *not* match graph structure. And new benchmarks now test supersession-aware state tracking, cascading invalidation with downstream conclusion repair, and serving cost.

## 6. Memory poisoning is the unsolved hole

arXiv:2608.21230, August 2026: **1.2% poisoning of a LongMemEval corpus drops accuracy from 0.850 to 0.300**; a write-time screening pipeline "rejects 0 of 360 poisoned memories"; and shipped provenance-weighted retrieval is "statistically indistinguishable from no defense (p = 0.80)."

Alongside it, single-interaction memory injection with no store access, and query-only attacks on audited agents. Persistent writable memory is a durable injection surface, and the whole permission apparatus is defeated at the semantic layer: a read-write store plus prompt injection writes a poisoned memory that later sessions read as trusted.

## 7. The four capability tests

**Branch an agent's context and resume from an arbitrary point — partial, at the harness tier only.** Graph-orchestration checkpointers persist thread state for time travel and fault tolerance; the coding CLIs do it. The managed session APIs do not: pinning, per-session overrides, interrupt and redirect, initial events and budgets exist, and there is no fork, rewind, checkpoint or replay endpoint. And a formal paper (arXiv:2608.22928) states the unsolved problem — existing systems fork without deriving what the edit must preserve, so "an unsafe edit can… authorize the same tool action twice, discard a result the task still requires, or conflict with a call that began before the edit." **Nobody has safe branching in production.**

**Reproduce a completion exactly from a recorded, addressable context — no.** The closest is cross-harness transcript normalisation into deterministic structured records, and raw-event session viewers. Nothing addresses the exact request payload as a first-class, re-submittable, content-addressed object across a version boundary — and server-side compaction and background consolidation actively make the recorded context non-reconstructible.

**Enforce per-run permission boundaries uniformly — closest to solved, per platform.** Filesystem-level memory-store access, credential vaults with injection locations, per-tool permission policies, domain allow- and block-lists, session budgets; IAM conditions on sessions and memory on the other platform. "Uniformly" is what fails: each is a per-vendor mechanism, and the apparatus is defeated at the semantic layer, as §6 measures.

**Answer "which agent run caused this change" from the changed data itself — partial, new, and the biggest movement since April.** Memory versions are attributed to the session and survive the memory's deletion; the other platform has revisions; the graph vendor's facts carry the episode list that produced them, so deletion scope is computable. Research is attacking it from several sides: transaction boundaries with snapshot journals, evidence-before-belief with immutable source evidence, auditable memory planes, signed hash-chained mutations, and content-addressed signed state deltas replacing human prose in telemetry.

**But all of it is provenance over the memory store, not over the world.** Nothing answers "which run edited this file, this row, this ticket, under what permissions, from what context." The observability tier remains **tracing**: an append-only record beside the change, joined by convention rather than carried by the changed artifact. The one shipping system where the changed data *is* the versioned artifact is a coding agent tracking its own context in git — and that is the agent's context, not the user's data.

Report: [`a187277ed3a006fbc`](../../../sweep-2026-08/raw/a187277ed3a006fbc.md).
