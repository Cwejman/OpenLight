# Grounded Alternatives Comparison — 2026-03-20

> **Authorship note:** This comparison was compiled by Claude agents during ecosystem research (session 2026-03-20). The factual details about each system are sourced from papers, repos, and documentation. The tradeoff analysis and "what OpenLight can learn" framing reflect the agents' reasoning — the author may see these tradeoffs differently.

Concrete comparison of OpenLight's model against alternative approaches identified during ecosystem research. Not advocacy — honest mapping of what each approach offers and what it costs. The purpose is to inform testing, not to declare a winner.

## OpenLight's Bet

Chunks on named dimensions with binary membership (instance/relates). Scope-as-query. Git-like commits. The bet: two membership types on named dimensions plus scope composition is sufficient and more transparent than typed edges or multi-graph approaches. The reader discovers the nature of relationships by reading, not by trusting stored labels.

## Alternative A: Typed-Edge Graph (MemoryGraph)

### What It Is

Nodes connected by labeled, directed edges. MemoryGraph defines 35 relationship types across 7 categories:

**Causal:** CAUSES, TRIGGERS, LEADS_TO, PREVENTS, BREAKS
**Solution:** SOLVES, ADDRESSES, ALTERNATIVE_TO, IMPROVES, REPLACES
**Context:** OCCURS_IN, APPLIES_TO, WORKS_WITH, REQUIRES, USED_IN
**Learning:** BUILDS_ON, CONTRADICTS, CONFIRMS, GENERALIZES, SPECIALIZES
**Similarity:** SIMILAR_TO, VARIANT_OF, RELATED_TO, ANALOGY_TO, OPPOSITE_OF
**Workflow:** FOLLOWS, DEPENDS_ON, ENABLES, BLOCKS, PARALLEL_TO
**Quality:** EFFECTIVE_FOR, INEFFECTIVE_FOR, PREFERRED_OVER, DEPRECATED_BY, VALIDATED_BY

Every edge carries: strength (0.0-1.0), confidence (0.0-1.0), evidence count, success rate, timestamps. Relationships evolve — successful use reinforces, unsuccessful weakens, unused decays. Built-in contradiction detection for 5 pairs (SOLVES/INEFFECTIVE_FOR, CONFIRMS/CONTRADICTS, EFFECTIVE_FOR/INEFFECTIVE_FOR, ENABLES/BLOCKS, PREVENTS/CAUSES).

### What It Does Well

- **Direct queryability.** "What contradicts this?" is a one-hop query. In OpenLight, the same question requires reading chunks and reasoning about their content.
- **Causal chains.** "A CAUSED B which CAUSED C" is a typed path traversal. In OpenLight, causality must be inferred from chunk text and shared dimensions.
- **Evolving strength.** Edge weights decay and strengthen based on use. In OpenLight, membership is binary — no mechanism for "this connection is weakening."
- **Contradiction detection.** The system can flag when an edge pair is contradictory. OpenLight has no built-in contradiction awareness.

### What It Costs

- **Decision burden on writes.** Every relationship requires choosing from 35 types. Is this CAUSES or TRIGGERS or LEADS_TO? The distinction matters for querying but may not be clear at write time.
- **Designer's ontology.** The 7 categories and 35 types are one designer's theory of what relationships matter. A different designer would choose differently. OpenLight's dimensions emerge from the knowledge; MemoryGraph's types are imposed.
- **Navigation paradigm.** Graph traversal follows edges — you must already know what you're connected to. OpenLight's scope composition lets you intersect dimensions you haven't followed edges between.
- **No versioning.** MemoryGraph has no commit model. History is in edge metadata, not in structural snapshots.

### The Core Tradeoff

Typed edges let you query the *nature* of relationships directly. Dimensional membership lets you discover *what's related* through structural intersection. The question is: does an agent benefit more from knowing "A CAUSED B" or from discovering that A and B share dimensions it hadn't considered?

## Alternative B: Multi-Graph (MAGMA)

### What It Is

Four parallel graphs over the same set of event-nodes, differing only in edges:

**Temporal graph:** Immutable chronological chain. Each event linked to its successor in time. Built automatically on ingestion.

**Semantic graph:** Undirected edges where vector similarity exceeds a threshold. Traditional RAG-style retrieval surface. Built automatically via embedding.

**Causal graph:** Directed edges inferred by an LLM during async consolidation. The LLM examines a 2-hop neighborhood and outputs causal links. Built asynchronously in background.

**Entity graph:** Edges connecting events to abstract entity nodes. Solves object permanence — tracking the same entity across disjoint timeline segments. Built asynchronously via LLM entity extraction.

Queries are classified by intent (Why/When/Entity), then a beam search preferentially follows edges of the matching graph type. Results are linearized into a narrative with provenance.

### What It Does Well

- **Intent-aware retrieval.** "Why did X happen?" traverses causal edges. "When did X happen?" traverses temporal edges. The system matches the query type to the right graph structure.
- **Best benchmark results.** 0.700 on LoCoMo (beating full context, A-MEM, Nemori, MemoryOS). 61.2% on LongMemEval with 0.7-4.2K tokens per query.
- **Automatic construction.** Temporal and semantic graphs build automatically. Causal and entity graphs build asynchronously via LLM — no manual labeling needed.
- **Separation of concerns.** Each graph is independently queryable. Ablation shows each contributes: removing adaptive policy drops score by 0.063, causal by 0.056, temporal by 0.053, entity by 0.034.

### What It Costs

- **Fixed dimensionality.** The four graph types are chosen a priori. No mechanism to discover new relational dimensions from data. Adding a fifth graph type requires engineering changes.
- **Intent classifier.** Queries map to a fixed set {Why, When, Entity}. Novel query types need taxonomy extension.
- **LLM dependency.** Graph quality depends on LLM inference during consolidation. Susceptible to extraction errors and hallucination.
- **No general-purpose substrate.** Designed for agent memory, not for browsers, websites, or other consumers.
- **Manual tuning.** Structural alignment weights are manually tuned per intent type.

### The Core Tradeoff

MAGMA pre-computes specific relational views (temporal, causal, entity, semantic) that agents commonly need. OpenLight asks the agent to navigate a single general structure. MAGMA is better for known query patterns; OpenLight may be better for unknown or cross-cutting queries that don't map to one of the four graph types.

## Alternative C: Belief-Revision-Grounded Memory (Kumiho)

### What It Is

Graph-native memory grounded in AGM belief revision theory (Alchourron, Gardenfors, Makinson, 1985). Four core primitives:

**Immutable revisions.** Every memory item accumulates a sequence of revisions. Once created, content is frozen. Changes create new revisions. History is the revision chain.

**Mutable tag pointers.** Tags are named pointers to revisions: `tau: TagName → Revision`. Moving a tag changes what the agent "believes" without altering history. Multiple tags per item ("current", "approved", "draft"). Tag assignment history is persistent and queryable — "what did 'current' point to on January 15?"

**Typed dependency edges.** Six types connecting revisions:
- SUPERSEDES — this replaces that (implements belief revision)
- DERIVED_FROM — this was built using that as evidence
- DEPENDS_ON — if that changes, this may be suspect (enables impact analysis)
- REFERENCED — mentioned without dependency
- CONTAINS — bundle membership
- CREATED_FROM — output provenance

**URI-based addressing.** `kref://project/space/item.kind?r=N` pins to specific revisions. Enables deterministic cross-system references and temporal navigation.

Concrete example — a belief evolves:
```
Item: color-preference
  Rev 1: "Client prefers warm colors"     (no tags)
  Rev 2: "Client prefers cool colors"
    edge: SUPERSEDES → Rev 1
  Tags: current → Rev 2, initial → Rev 1
```
The agent querying "current" gets Rev 2. A historical query resolves what "current" pointed to at any past time. Rev 1 still exists for audit.

Also notable: **prospective indexing** — at write time, the LLM generates hypothetical future queries where the memory would be relevant, and indexes those alongside the content. Eliminated a ">6-month accuracy cliff" where old memories became unretrievable due to language drift.

### What It Does Well

- **Formal guarantees.** Satisfies AGM postulates K*2–K*6 and Hansson's Relevance and Core-Retainment. Agents cannot silently introduce contradictions. Minimal change principle — only beliefs relevant to the revision are affected.
- **Graceful evolution.** Tag pointer movement evolves beliefs without destroying history. Multiple tags allow "draft" vs "approved" states for the same item.
- **Impact analysis.** DEPENDS_ON edges let the system flag downstream beliefs that may be stale when upstream beliefs change.
- **Strong benchmarks.** 93.3% on LoCoMo-Plus (47.6pp above Gemini 2.5 Pro). 97.5% adversarial refusal accuracy.
- **Item-level versioning.** Each memory item has its own revision chain. Fine-grained, not system-wide.

### What It Costs

- **Item-centric, not system-centric.** No atomic commit across multiple items. A change touching five related beliefs is five separate operations, not one atomic commit.
- **No dimensional structure.** Knowledge is organized by items and edges, not by named dimensions. No scope-as-query. Discovery requires traversing edges from known nodes, not intersecting dimensions.
- **Agent-specific.** Designed for agent memory with governance layers. Not a general-purpose substrate for browsers, websites, or other consumers.
- **LLM-dependent consolidation.** Prospective indexing and edge discovery depend on LLM quality at write time.

### What OpenLight Can Learn From Kumiho

The tag pointer mechanism is a more graceful answer to knowledge evolution than binary remove-and-re-add. The DEPENDS_ON edge enables impact analysis that OpenLight currently has no mechanism for. Prospective indexing is a practical innovation for long-term retrieval.

The formal belief revision grounding is also notable — it provides theoretical guarantees about consistency that OpenLight's model relies on the agent to maintain.

### Similarity to OpenLight

Both systems share: immutability of written content, full history preservation, the ability to resolve state at any historical point. The key structural differences are: commit-centric (OpenLight) vs item-centric (Kumiho), dimensional membership (OpenLight) vs typed edges (Kumiho), binary membership (OpenLight) vs weighted/graduated (Kumiho via tag semantics).

## Alternative D: Flat Files + Links (Letta MemFS)

### What It Is

Git-backed markdown files. Agents write programs that restructure their own memory. Multi-agent concurrent memory via git worktrees + merge.

### What It Does Well

- **Most production-mature.** Well-funded, production-grade. Real multi-agent coordination via git.
- **Human-readable.** Markdown files are inspectable by humans without tools.
- **LLM-native.** LLMs are deeply trained on reading and writing prose. No new interaction pattern to learn.
- **Flexible.** No schema constraints. The agent organizes however it wants.

### What It Costs

- **No structured query.** Finding cross-cutting connections requires reading files and reasoning. No scope-as-query, no dimensional intersection.
- **No relational navigation.** Links are bidirectional but untyped. No instance/relates distinction. No connection strength computation.
- **Organization depends on agent.** Two agents may organize the same knowledge completely differently. No structural consistency.

### The Core Tradeoff

If LLMs are already excellent readers of prose, structured navigation may add overhead without proportional benefit. The bet against OpenLight: the intelligence is in the reader, not the structure. MemFS bets on this. OpenLight bets the opposite — that structure in the system amplifies the reader's intelligence.

## What Testing Must Resolve

1. Does scope-as-query enable **discovery** (finding what you didn't know to look for) or only **retrieval** (finding what you know exists)?
2. Does binary instance/relates carry enough information, or do practical scenarios require richer relationship types?
3. Does commit-centric versioning (OpenLight) or item-centric versioning (Kumiho) handle knowledge evolution more gracefully?
4. Does the dimensional model produce consistent structure across different agents writing the same content?
5. At what scale does structural navigation outperform prose reading?
6. Does the binary membership constraint force dimension proliferation in evolving knowledge systems?
