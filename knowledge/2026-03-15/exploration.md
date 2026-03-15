# Knowledge System Exploration — 2026-03-15

## Hard Requirements (Settled)

1. **General-purpose substrate.** Not for agents specifically. Content goes in; what comes out depends on the reader. An agent bootstraps, a website generates UI, a TUI browses. The system is one thing; the interfaces are many.
2. **Lossless.** Nothing is destroyed. Knowledge evolves through addition and re-weighting, not deletion or overwriting. Any historical state is recoverable.
3. **Transparent relationships.** The system knows and expresses WHY things relate, not just THAT they are related. No opaque similarity scores. The intelligence is in the relationship, visible to the reader.
4. **No imposed hierarchy.** Structure is relative to the reader's focus point. Hierarchy can emerge from reading, but is not baked into storage.
5. **Atomic history.** Every mutation is an event. The full event stream is preserved. Any point in time can be reconstructed.
6. **The system is the identity.** For agents: the knowledge is the agent, the LLM is interchangeable. For other consumers: the system is the source of truth, interfaces are projections.

## Settled — Approach

7. **Deliberate writes initially, no low-level cycle.** The completion-model-level integration is deferred. Claude's existing capability suffices for exploration with deliberate writes to the system.
8. **Knowledge system is the source of truth.** Code is material molded against knowledge. Requirements first, then code. Filesystem is the world's interface; truth resides in the system.
9. **Three software pieces.** CLI (primary interface, Claude uses this), browser (TUI first, then web), Claude plugin (later, when model is proven). All git-based.

## Likely Requirements (Strong But Not Fully Settled)

- **Collaboration.** Multiple writers eventually. A server will be needed.
- **Branching (hard requirement).** Like git — branches for parallel exploration, merge into main. 10 agents on 10 branches, review, merge. Exact mechanics open.
- **Git integration or parallel.** Atomic history has deep parallels with git. Relationship TBD.
- **External content integration.** Meeting transcripts, source code, designs, multimedia — the system needs to handle content from the outer world.
- **Views as projections.** A view is a scope + settings that produces a result. Views can be saved, approved, and serve as dependency tracking when the system connects to external artifacts.
- **Multiple knowledge bases as peers.** Ingest a knowledge base (e.g. culture) while working on something decoupled. Session bubbles later.

## Progressed — The Dimensional Model

Explored in this session and gaining shape (see `browser-user-story.md` for full walkthrough):

- **Primitives:** Chunks (units of meaning) and dimensions (named phenomena). Chunks relate to dimensions with weights — not to other chunks directly.
- **Dimensions connect through shared chunks.** No chunk-to-chunk relations without a dimension.
- **Meta-chunks:** Chunks with weight on exactly one dimension. Stable anchors — not pulled by other relationships.
- **Scope as query:** The reader's scope is a set of dimensions. Add a dimension → narrows. Remove → widens. Scope IS the query — no separate query language.
- **Navigation:** Primarily dimension-to-dimension with generated summaries. Chunks are read when scope is narrow enough. Empty scopes show adjacency — what you'd gain by relaxing a dimension.
- **No ownership/contracts on dimensions.** A dimension has no rigid schema or parameters. This prevents lock-in and allows evolution.
- **TUI approach:** List-based, colored sub-dimensions for cross-connection visibility, outliers for edges to outside space. (Details deferred — many more ideas coming.)

## Validated by Stress Testing (8 agents, 4 domains — see `agent-stress-test-synthesis.md`)

- **Core model works.** Chunks, dimensions, weights, scope-as-query — validated across culture, organization, software, and website domains.
- **Instance/relates quality on weights — settled.** A binary marker on each weight: `instance` (this chunk IS a member) or `relates` (this chunk is ABOUT the dimension). Resolves the primary tension unanimously identified by all agents. Multiple collections handled by multiple dimensions grouped under a "group dimension."
- **Structured key/value pairs on chunks — settled.** Chunks can carry optional key/value metadata alongside text content. Needed for operational domains (names, emails, dates, paths). The hard requirement: a chunk must be broken when separate parts have different weights. Key/value pairs can be nested records within a chunk as long as this splitting rule holds.
- **Dimension properties NOT needed.** Collection vs topic emerges from instance/relates usage patterns.

## Open Design Questions

- **Integrations — resolved using existing primitives.** No new primitive needed. A reference is a chunk with key/value fields (`ref_service`, `ref_path`, etc.). Multiple chunks per reference: the reference becomes a dimension, reference chunk is `instance`, describing chunks `relate`. Integration contracts are themselves chunks — `instance` of an "integration-contract" dimension. Peer connection decouples the integration module. See `integrations-and-history.md`.
- **How does knowledge get IN?** When content is written, how does it become chunks with dimensional weights? Author-assigned? System-suggested? Auto-decomposed?
- **How do dimensions come into existence?** Explicitly created? Emergent from chunk clustering? System-proposed?
- **How do weights change over time?** What triggers a weight shift? Who/what has authority?
- **What role do embeddings play?** Internal use for suggesting weights/discovery while the transparent model is the interface? Or avoided entirely?
- **The cycle:** How does a consumer write back? At what granularity? Who decides? (See `agentic-integration.md`.)
- **Storage:** What backs this? Existing tech or custom?
- **Views and dependency tracking:** How does an approved view detect drift? See `views-and-external-world.md`.
- **Weight assignment:** Subjective. Auto-suggestion from embeddings? Qualitative levels? Calibration?
- **Dimension lifecycle:** When does a chunk earn its own dimension? Threshold felt but unprincipled.
- **Temporal ordering:** Content-level dates (meeting minutes, blog posts) aren't dimensional weights. Atomic history provides mutation time, not content time.
- **Causality:** "This decision caused this bug" is directed. The model has undirected co-occurrence only.
- **Prescriptive authority:** Some chunks are rules that override. No authority hierarchy in the model.
- **Scope union and negation:** Scope-as-AND works for narrowing. Union (A OR B) and negation (A NOT B) not supported.

---

## The Core Insight

The knowledge system should not be purpose-specific. It is not "for agents" or "for websites" or "for projects." It is a general knowledge substrate — content goes in, and what comes out depends on who's reading and why. An agent bootstraps from it. A website generates UI from it. A TUI/GUI lets a human browse relations. The system is one thing; the interfaces are many.

## What L1/L2 Gets Wrong

The two-layer model imposes hierarchy: summary over detail. But in a relational space, hierarchy doesn't exist — it is relative to the reader's focus point. A chunk that is "summary-level" for one query is "detail-level" for another. The layer distinction is an artifact of file-based storage, not a property of knowledge.

## The Relational Model Being Explored

### Chunks, Not Files

A chunk is a unit of meaning — could be a sentence, a paragraph, a decision. Size determined by semantic coherence.

### Relationships Are Weighted and Named

Not opaque vector proximity (a single similarity number). Not flat labels ("supersedes", "related-to"). Each chunk has explicit, weighted connections to other chunks along named dimensions. The dimensions themselves are phenomena — described by their own chunks, self-explaining.

Example: a chunk about the breathing metaphor has weight 0.9 on "culture," 0.4 on "architecture," 0.2 on "implementation." Query along "culture" and it surfaces strongly. Query along "implementation" and it barely appears. The same chunk, different perspective.

### Intelligence in the Relationship

Current systems have dumb relationships. Vector DBs: cosine similarity (one number, no meaning). Knowledge graphs: typed labels (structured but rigid, pre-defined). What's being explored here: relationships that carry their own knowledge — the system understands WHY two chunks relate, along WHAT dimension, and that understanding can evolve.

### Tags as Phenomena, Not Categories

A tag is not a folder label. It is a cluster of meaning with its own self-description. Chunks tagged "culture" don't just share a label — there are meta-chunks describing what "culture" means, its boundaries, why it exists. The tag is self-explaining. A new reader querying "culture" gets both the content AND the meaning of the phenomenon.

### The "Main" Entry Point Pattern

Not hierarchical but can become so by the reader. A dimension (tag/phenomenon) can have a designated "main" chunk that orients reading. The system doesn't know "main" is special — it's just a chunk that says "start here." Follow it and you get a hierarchical reading experience. Ignore it and you get the full relational space. Hierarchy emerges from intent, not storage.

### Lossless Through Structure, Not Convention

Knowledge doesn't change by overwriting or deleting. It changes by weight shifts. A chunk about an old decision doesn't get removed — its weight on "current" decreases, its weight on "historical" increases. The chunk persists. Its position in the multi-dimensional space shifts. The lossless property is a structural guarantee of the model, not a rule the agent has to remember.

### Atomic History

Every mutation is an event: chunk added, weight shifted, tag applied. The full event stream is preserved. Any point in time can be reconstructed. This is git for semantic content — but the "diff" is a weight shift, not a text change.

## The Transparency Requirement

Nothing should be lost in the embedding. The reason something is embedded in a particular way should be inherently transparent to the reader. This is the hard requirement from the philosophy of pureness. Opaque 1024-float vectors violate this — they work but have no self-understanding. The system must know and express WHY two things are related, not just THAT they are.

## What Existing Tech Offers

### Sparse Autoencoders (SAEs) — The Closest Match

SAEs decompose opaque embeddings into ~65,000 named, meaningful features. Each feature has a human-readable label. A chunk's representation becomes: which named features are active, and how strongly.

The paper "Interpretable Embeddings with Sparse Autoencoders" (Dec 2025) used this for retrieval and outperformed dense embedding search for property-based queries.

Gap: SAE features are static, per-chunk, extracted once. They don't evolve. They don't describe relationships BETWEEN chunks. They describe each chunk independently.

### Gardenfors Conceptual Spaces — The Theory

Concepts live in spaces with meaningful, named dimensions (quality dimensions). A concept's position along each dimension is interpretable. This is the theoretical framework for what's being explored — but nobody has implemented it as a knowledge system.

### Vector DBs (Qdrant) — The Mechanics

A point = id + vector (list of floats) + payload (JSON metadata). Search = find nearest vectors, optionally filtered by payload. Tags would be payload fields with keyword indexes.

Not append-only. Supports upsert, delete, payload-only updates. No native versioning — you'd build that in application layer.

Filtering is powerful: must/should/must_not boolean logic, ranges, exact matches, full-text search. Can combine with vector similarity or use without it (scroll API).

### Knowledge Graphs (Graphiti/Zep) — Temporal Relations

Bi-temporal model: every fact has "when it happened" and "when the system learned it." Old facts never deleted — marked with validity windows. This aligns with the lossless requirement. But relationships are typed labels, not weighted multi-dimensional connections.

### RAG Limitations — Why Skepticism Is Warranted

RAG was designed for heterogeneous document corpora. Agent memory (and knowledge systems generally) are bounded, correlated streams. Top-k vector search wastes context on near-duplicates and destroys temporal/relational structure. xMemory (Feb 2026) makes this case explicitly.

### Alternative Query Paradigms

- HippoRAG: PageRank traversal on a knowledge graph
- RAPTOR: Multi-level tree, retrieve at different abstraction levels
- Prompt-RAG: No embeddings — LLM reads an index and picks what's relevant
- Self-RAG: Model decides when/whether to retrieve
- xMemory: Top-down hierarchy over disentangled semantic components
- NTMs/DNCs: The query itself is learned, not explicitly written

## The Open Space

Nobody has built a system where:
- Relationships between knowledge chunks are first-class intelligent objects
- Dimensions are named, meaningful, and self-describing
- Weights are explicit, evolvable, and queryable
- The system is inherently transparent about WHY things relate
- History is atomic and fully traversable
- The same substrate serves agents, UIs, browsers, and generators

The pieces exist in separate research communities. The synthesis does not.

## What This Means for the PoC

The markdown PoC (culture + claude plugin) was designed before this exploration. The question now: does the L1/L2 markdown system even approximate the relational model well enough to be useful? Or does it train wrong patterns — hierarchical thinking when the real system is relational?

Options:
1. Go straight to a minimal implementation of the relational model (SAE features + weighted relations + atomic history)
2. Build the markdown PoC knowing its limitations, use it to accumulate requirements
3. Explore further before building anything

Not settled.
