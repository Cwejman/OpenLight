# Research Map — Updated 2026-03-20

Grounding research performed during exploration. Organized by relevance to the relational knowledge system being explored. Original sweep 2026-03-15, ecosystem check-up 2026-03-18, deep ecosystem dive 2026-03-20.

## Directly Relevant

### SAE-Based Interpretable Embeddings

- **"Interpretable Embeddings with Sparse Autoencoders"** (arxiv 2512.10092, Dec 2025) — uses SAE features for retrieval, outperforms dense embeddings for property-based queries. Named dimensions, weighted activations per chunk. Code: github.com/nickjiang2378/interp_embed
- **SAErch.ai / "Disentangling Dense Embeddings"** (arxiv 2408.00657) — trained SAEs on OpenAI embeddings, discovered "feature families" (hierarchical clusters), enables steerable semantic search. Code: github.com/Christine8888/saerch
- **CL-SR: Concept-Level Sparse Retrieval** (arxiv 2506.00041, EMNLP 2025) — SAE features as inverted-index units for retrieval. Each latent concept gets a natural language description — closest existing work to using SAE features as named, queryable dimensions.
- **SPLARE** (arxiv 2603.13277, ICLR 2026) — accepted at ICLR 2026 with full paper. 7B-parameter multilingual retrieval model producing a "latent vocabulary" of sparse, language-agnostic SAE features. Top-10 on MMTEB(Multilingual, v2) retrieval. Authors frame SAEs as "natural foundation" for learned sparse retrieval. Code/models to be released.
- **BM25-V** (arxiv 2603.05781, March 2026) — SAEs applied to Vision Transformer features for image retrieval. Sparse bag-of-visual-words. Recall@200 >= 0.993. SAE-based retrieval expanding beyond text.
- **RAGLens** (arxiv 2512.08892, Dec 2025) — uses SAEs to detect hallucination in RAG. AUC > 80%. Code: github.com/Teddy-XiongGZ/RAGLens
- **SAE Features for Classification** (EMNLP 2025) — SAE-derived features achieve macro F1 > 0.8. Cross-model transfer demonstrated (Gemma 2B to 9B). Zero-shot cross-lingual and cross-modal transfer.
- **CASPER** (arxiv 2508.13394, Aug 2025) — sparse retrieval via tokens + research concepts (keyphrases). Outperforms dense/sparse baselines across eight scientific benchmarks.
- **Sparse Feature Coactivation** (arxiv 2506.18141, updated Oct 2025) — SAE features coactivate in semantically coherent, composable modules. Ablating a concept module changes outputs predictably; composing relation + concept modules yields compound counterfactuals. Closest evidence that structured relational knowledge exists inside models and is extractable via SAEs.
- **Sparse Feature Circuits** (ICLR 2025, arxiv 2403.19647) — interpretable causal graphs in LLMs using SAE features. Features form graph-like structures with causal relationships.
- **Step-Level SAE (SSAE)** (arxiv 2603.03031, March 2026) — operates on entire reasoning steps rather than individual tokens, disentangling incremental semantic updates from background information. Addresses granularity mismatch between token-level SAEs and step-level reasoning. Relevant for thinking about how knowledge organizes at different abstraction levels.
- **"I Have Covered All the Bases Here"** (arxiv 2503.18878, March 2025) — SAEs on DeepSeek-R1 identifying reasoning-specific features (uncertainty, reflection, exploration). Steering experiments: amplifying reasoning features increases performance +2.2% with +20.5% longer traces. Code: github.com/AIRI-Institute/SAE-Reasoning
- **ProtSAE** (AAAI 2026) — domain-guided SAE training using Gene Ontology terms. Defined neurons learn disentangled representations aligned with a known ontology. Significant: demonstrates that SAE features can be trained to align with external domain structure, not just discovered post-hoc.
- **SAEs for Protein Language Models** (PNAS 2025/2026) — SAE features tightly associated with Gene Ontology terms. Unsupervised extraction, no labeled data needed. More interpretable than raw model neurons.
- **Anthropic Monosemanticity** — foundational work, tens of millions of interpretable features from Claude 3 Sonnet
- **Anthropic Circuit Tracing** (May 2025) — open-sourced attribution graph generation. Code: github.com/decoderesearch/circuit-tracer
- **Goodfire** — total $209M funding at $1.25B valuation (Series B Feb 2026, $150M led by B Capital + Salesforce Ventures + Eric Schmidt). Repositioned from developer API to "model design environment" — platform for understanding, debugging, and designing AI models. Two use cases: (1) intentional design via interpretable training + inference monitors, (2) scientific discovery via model-to-human knowledge transfer. **DeepSeek R1 SAEs open-sourced** — first public SAEs on a 671B-parameter reasoning model. Discovered features for backtracking, self-reference, entity tracking, calculation awareness. Novel finding: paradoxical oversteering (amplifying features causes reversion). **Alzheimer's biomarker discovery** — reverse-engineered biological model, discovered DNA fragment length patterns. Described as "first major finding in the natural sciences obtained from reverse-engineering a foundation model."
- **SAELens** (github.com/decoderesearch/SAELens) — main library for training SAEs
- **SynthSAEBench** (arxiv 2602.14687, Feb 2026) — benchmark with synthetic ground-truth features. Key finding: Matching Pursuit SAEs exploit superposition noise to improve reconstruction without learning true features — newly identified failure mode.
- **Neuronpedia** (neuronpedia.org) — now open source. 50M+ features searchable. Hosts Gemma Scope 2, circuit-tracer visualizations, SAEBench, AxBench. Added probes, concepts, transcoders.
- **Gemma Scope 2** (Google DeepMind, Dec 2025) — largest open-source interpretability release. Full Gemma 3 family (270M to 27B). SAEs + transcoders, JumpReLU architecture. ~110 PB stored activation data.
- **Mechanistic Interpretability** named MIT Technology Review Breakthrough Technology of 2026.

#### SAE Reality Check (Emerging Tension)

Three papers in early 2026 collectively challenge SAE claims:

- **"Sanity Checks for SAEs"** (arxiv 2602.14111, Feb 2026) — on synthetic data with known ground-truth, SAEs recover only 9% of true features despite 71% explained variance. Random baselines match trained SAEs on interpretability (0.87 vs 0.90), sparse probing (0.69 vs 0.72), and causal editing (0.73 vs 0.72). Conclusion: "SAEs in their current state do not reliably decompose models' internal mechanisms."
- **AxBench** (arxiv 2501.17148, ICML 2025, Stanford NLP) — for steering: prompting outperforms all methods, followed by finetuning; for concept detection: simple statistical checks outperform everything. SAEs not competitive on either.
- **Transcoders Beat SAEs** (arxiv 2501.18823, Jan 2025) — skip transcoders have both lower model loss increase and higher auto-interpretability scores than SAEs at all tested sizes.

**Relevance to OpenLight:** The tension is between retrieval/embedding applications (where SAE features serve as representational vocabulary) and steering/mechanistic applications (where they serve as causal components). The retrieval applications — interp_embed, SPLARE, CL-SR, BM25-V — may be on firmer ground because they use SAE features as named dimensions for organizing knowledge, not for understanding model internals. This distinction matters: SAE features as an organizing principle for knowledge (closer to OpenLight's use case) appears more robust than SAE features as a mechanistic explanation tool.

#### SAE Surveys

- **"Interpretable Text Embeddings and Text Similarity Explanation: A Survey"** (EMNLP 2025, arxiv 2502.14862) — comprehensive taxonomy of interpretability methods: space-shaping, set-based, attribution-based. Covers CQG-MBQA, LDIR, SAE methods, sparse lexical embeddings.
- **"A Survey on Sparse Autoencoders"** (EMNLP 2025 Findings, arxiv 2503.05613) — architecture, training, explanation methods, evaluation metrics, applications.

### Named / Interpretable Dimensions in Embedding Spaces

- **CQG-MBQA** (ICLR 2025, arxiv 2410.03435) — each embedding dimension is a yes/no question generated by an LLM ("Is this about healthcare?"). Fully interpretable. Matches black-box performance. Code: github.com/dukesun99/CQG-MBQA
- **LDIR** (ACL 2025, arxiv 2505.10354) — each dimension indicates relatedness to an anchor text selected via farthest point sampling. Near-black-box performance with <500 interpretable dimensions. Code: github.com/szu-tera/LDIR
- **InterpretE** (Neurosymbolic AI Journal, 2025) — knowledge graph embeddings where dimensions are explicitly linked to human-understandable entity aspects. Improves clustering by named semantic properties.
- **QIME** (arxiv 2603.01690, March 2026) — extends CQG-MBQA to medical domain by grounding question-dimensions in medical ontologies.
- **Adjusting Interpretable Dimensions with Human Judgments** (NAACL 2024, arxiv 2404.02619) — seed-based dimension extraction + human ratings to create named axes (size, danger, formality, complexity).
- **FLeW: Facet-Level Weighted Representation Learning** (arxiv 2509.07531) — splits scientific documents into faceted parts aligned with citation intent (background, method, result). Three facet encoders with adaptive weighting. Not named dimensions per se, but faceted decomposition of embedding space where each facet has semantic meaning.

### Conceptual Spaces (Gardenfors)

- Theory: concepts as regions in spaces with meaningful named dimensions
- Implementation: github.com/lbechberger/ConceptualSpaces (Python, research-grade, last updated 2022)
- **Extracting Conceptual Spaces from LLMs** (EMNLP 2025, arxiv 2509.19269) — first real bridge between Gardenfors and modern AI. Quality dimensions encoded as prototype embeddings, fine-tuned to align. Demonstrates LLMs capture perceptual features but practical extraction was previously lacking.
- **Exploring Small World of Word Embeddings** (arxiv 2502.11380, Feb 2025) — comparative study on conceptual spaces from LLMs of different scales, builds on above.
- **Gardenfors "Geometry and Dynamics of Meaning"** (Topics in Cognitive Science, 2025) — extends geometric semantics to different word classes.
- **Gardenfors Third Book** — forthcoming May 2026. Third in the series after "Conceptual Spaces: The Geometry of Thought" (2000) and "The Geometry of Meaning" (2014).
- **Convex Decision Regions in Deep Networks** (2025) — validates Gardenfors prediction: approximate convexity is pervasive in neural representations across images, audio, text, medical data.
- **Springer collection: Conceptual Spaces as Mathematical Framework for Concept Engineering** — active collection of papers.
- **Gap narrowing but still present:** nobody has connected conceptual spaces extraction to a retrieval or knowledge management system. The pieces are closer than ever.
- **NeusymBridge Workshop (AAAI 2026, Jan 26-27)** — "Bridging Neurons and Symbols for NLP and Knowledge Graphs Reasoning." Occurred; no specific papers bridging Gardenfors to practical systems surfaced.

### SAE-Knowledge Bridging Tools

New category — tools connecting SAE features to knowledge exploration.

- **ConceptViz** (IEEE VIS 2025, arxiv 2509.20376) — interactive visual analytics for exploring SAE concepts. Identification-Interpretation-Validation pipeline. Six interconnected views. Code: github.com/Happy-Hippo209/ConceptViz
- **"The Birth of Knowledge"** (arxiv 2505.19440) — studies when and where specific semantic concepts emerge in LLMs using SAEs across training checkpoints, transformer layers, and model sizes. Key finding: unexpected "semantic reactivation" — early-layer features re-emerge at later layers.
- **BAGEL** (arxiv 2507.05810) — concept-based mechanistic interpretability using structured knowledge graphs. Maps concept propagation across model layers. Connects mechanistic interpretability directly to knowledge graph structures.
- **Google PAIR "Mapping LLMs with Sparse Autoencoders"** — interactive tutorial with embedded Gemma Scope Neuronpedia demo. Public-facing demonstration of SAE-based knowledge mapping.

## The Visual Clustering Trend (March 2026)

New category — what the user observed: "everyone is sharing visual Obsidian-style clustering."

### What's Driving It

The wave is driven simultaneously by: (1) developers building agent memory systems, (2) knowledge workers organizing with AI help, (3) enterprises building knowledge infrastructure for agents, (4) researchers studying how structure affects agent performance. The trigger was the realization that agents without structured memory are fundamentally broken — Google DeepMind (Dec 2025) showed vector-based memory yields <=2% improvement over no memory, while graph-based significantly outperforms. This shifted discourse from "do agents need memory?" to "what structure should memory have?"

### The Archetype Post

**Harper Reed** (March 11, 2026) — "My now immaculate knowledge graph of life." Exported ~600 meeting transcripts from Granola, piped through a Claude Code skill to extract people and concepts, generated Obsidian-compatible markdown with bidirectional links. The result revealed "patterns, networks, and clusters that I never knew existed." This is the archetype: someone builds a knowledge graph from their data, sees visual clustering for the first time, and shares a screenshot because **the structure itself is the insight**. The clusters are visually compelling and immediately understandable — perfect for social sharing.

### The Tools Behind the Screenshots

- **InfraNodus** (infranodus.com) — primary tool powering the visual clustering screenshots. Advanced 3D Force Atlas layout pushing community-detected clusters apart. Modularity algorithm for detecting idea communities. **Structural gap detection** — revealing "blind holes" where connections should exist but don't. Obsidian plugin, Chrome extension (4.9/5 stars). Uses network science, not just layout algorithms.
- **IVGraph** (ivgraph.com) — same visual graph experience for Notion users. 3D engine, GPU acceleration. Described as "gold standard in 2026" for knowledge graph visualization.
- **Graphify** — Product Hunt launch (196 upvotes). "Turn your Notion notes into an interactive knowledge map." Uses existing @mentions, database relations, and links.
- **Heptabase** — 350K+ active users, 28% YoY growth, 40min/day average usage. Visual canvas + mind maps. Spatial arrangement of knowledge — cards on infinite canvases with linking.
- **Recall** — 500K+ professionals. Auto-tagging knowledge graph. Graph View 2.0 launched Jan 2026.
- **Nomic Atlas** — interactive visualization of embedding spaces at scale. Open-source components.

### The Insight Behind the Trend

The visualizations are satisfying but the underlying structures are shallow — bidirectional links, entity-relation triples. Nobody is doing dimensional scoping, binary instance/relates membership, or commit-based versioning. The clustering reveals patterns, but the structures are flat. The question OpenLight asks is different: not "what clusters emerge from links?" but "what is the inherent dimensional structure of the knowledge?"

## Agent Memory Systems

### Covered in Original Research (March 15)

- **Letta/MemGPT** — OS-inspired memory (core/archival/recall). Agent-editable core memory blocks.
- **Mem0** — extraction + update pipeline, priority scoring + decay, graph variant (Mem0g). Now ~48K GitHub stars. Enterprise maturation: SOC 2, audit logs, HIPAA. Graph layer as optional enhancement. Dual deployment: self-host or managed.
- **A-MEM** (NeurIPS 2025) — Zettelkasten-inspired, re-contextualization on new memory addition.
- **xMemory** (arxiv 2602.02007, Feb 2026) — four-level hierarchy, sparsity-semantics objective, top-down retrieval. Core argument: RAG is structurally wrong for agent memory.
- **Graphiti/Zep** — bi-temporal knowledge graph, validity windows, semantic + BM25 + graph retrieval. 94.8% on Deep Memory Retrieval.

### New Finds (March 18)

- **MAGMA** (arxiv 2601.03236, Jan 2026) — four orthogonal graphs (semantic, temporal, causal, entity) over the same data. Intent-aware routing to relevant graph(s), independent traversal, subgraph fusion. 45.5% higher reasoning accuracy, 95% less tokens. Validates: multiple relational views over same data matter. Limitation: dimensions are fixed, not emergent. UT Dallas + U. Florida. Code open-sourced.
- **MemoriesDB** (arxiv 2511.06179, Nov 2025) — per-edge metadata, multiple contextual links between same vertices, temporal-semantic surfaces. Closest existing work to "relationships that carry intelligence." Single-author research project, low adoption.
- **Letta Context Repositories / MemFS** (March 2026) — rebuilt on git-backed markdown. Agents write programs that restructure their own memory. Multi-agent concurrent memory via git worktrees + merge. `/init` skill (learning from old sessions), reflection skill (background "sleep-time" persistence), defragmentation (splits/merges/restructures into 15-25 focused files). Most production-mature implementation of git-versioned agent memory. Validates commit-based history and branching. Limitation: markdown files + git, not relational/dimensional. No structured query, no relational navigation.
- **DiffMem** (github.com/Growth-Kinetics/DiffMem) — git as versioning backend for AI memory. Markdown files, git commits, BM25 retrieval. Validates commit-based history. No relational structure. Proof-of-concept quality.
- **Hindsight** (arxiv 2512.12818, github.com/vectorize-io/hindsight) — four parallel retrieval strategies (semantic, BM25, graph, temporal) fused by cross-encoder. 91.4% on LongMemEval — highest recorded. MCP server released March 2026. Ollama integration (fully local). Four memory networks: World (facts), Experiences (agent's own), Opinion (beliefs with confidence), Observation (mental models). 3.8K GitHub stars. $3.6M seed from True Ventures.
- **Cognee** (github.com/topoteretes/cognee, ~7k stars) — ECL pipeline (Extract, Cognify, Load), 30+ connectors. Memify pipeline now modular: prunes stale nodes, strengthens frequent connections, reweights edges based on usage, adds derived facts. Plugin-based. No more full rebuilds. $7.5M seed (OpenAI/FAIR founders). 500x pipeline growth (2K to 1M+ runs). 70+ companies.
- **Nemori** (arxiv 2508.03341, github.com/nemori-ai/nemori, Aug 2025) — cognitive science-grounded self-organizing memory. Event Segmentation Theory + Free-Energy Principle (Predict-Calibrate). Genuine self-organization, not heuristics. Outperforms prior SOTA on LoCoMo and LongMemEval.
- **EverMemOS** (arxiv 2601.02163, Jan 2026) — engram-inspired lifecycle: episodic traces (MemCells) → thematic clusters (MemScenes) → reconstructive recollection. Foresight signals — memory that anticipates future needs.
- **CLAG** (arxiv 2603.15421, March 2026) — SLM-driven clustering of memories into semantic neighborhoods with auto-generated cluster profiles. Designed for resource-constrained agents.
- **MRAgent** (ICLR 2026 MemAgents Workshop) — "Memory is Reconstructed, Not Retrieved." Cue-Tag-Content graph where associative tags serve as semantic bridges. Tag layer conceptually similar to dimensions. Active reconstruction: agent iteratively explores and prunes retrieval paths.
- **PlugMem** (Microsoft Research, March 2026, arxiv 2603.03296) — task-agnostic plugin memory. Propositional knowledge (facts) + prescriptive knowledge (reusable skills) in a structured memory graph. Plug-and-play across agent architectures. Separates knowledge structure from agent.
- **Memori** (github.com/MemoriLabs/Memori) — SQL-native memory engine. Normalized relational tables (facts, entities, events, preferences, policies). Anti-vector-store: everything SQL-queryable, fully transparent.
- **MemOS** (github.com/MemTensor/MemOS) — memory as OS resource. Composable "MemCubes." v2.0 "Stardust" Dec 2025. March 2026: OpenClaw Plugin — 100% on-device, persistent SQLite, hybrid search (FTS5 + vector), task summarization, multi-agent collaboration, Memory Viewer dashboard. Cloud: 72% lower token usage.
- **MemoryOS (BAI-LAB)** (arxiv 2506.06326, EMNLP 2025 Oral) — hierarchical storage (short/mid/long-term) with four modules. 48% F1 improvement.
- **GitHub Copilot Agentic Memory** (Jan 2026) — auto-captured insights with code citations. JIT Verification: memories checked against current codebase before use. Most sophisticated drift detection in production. Cross-feature sharing.

### New Finds (March 20)

- **Memory as Ontology / Animesis** (arxiv 2603.04740, March 5, 2026) — THE most philosophically aligned paper to OpenLight's thesis. Three axioms: (1) Memory Inalienability — core memories cannot be stripped, (2) Model Substitutability — the model is replaceable, identity persists through memory, (3) Governance Precedes Function. Constitutional Memory Architecture: four-layer governance (Constitution/Contract/Adaptation/Implementation). Digital Citizen Lifecycle: Birth, Inheritance (structured assumption of predecessor's memory during model transitions — not "data migration"), Growth, Forking, Departure. Distinguishes Memory-as-Tool (current paradigm) vs Memory-as-Ontology (memory constitutes identity). When model upgrades but memory persists: Memory-as-Tool sees "system upgrade," Memory-as-Ontology sees "re-shelling" (same entity, new vessel). When memory is wiped: Memory-as-Tool sees "same agent, different data," Memory-as-Ontology sees death. Prototype tested with four digital citizens surviving model transitions. Key difference from OpenLight: Animesis places governance before functionality and is agent-specific. OpenLight is a general-purpose substrate; the identity equation is a consequence of the structure, not its primary design goal.
- **Memory as Asset** (arxiv 2603.14212, March 15, 2026, Harbin Institute of Technology) — human-centric memory ownership. Memory in Hand (user owns it), Memory Group (collaborative formation), Collective Memory Evolution (continuous growth toward AGI). Three-layer infrastructure: fast personal storage, intelligent evolution layer, decentralized memory exchange network. Personal memories as persistent digital assets. Resonates with OpenLight's peers concept and local-first design.
- **MemMA** (arxiv 2603.18718, March 2026) — coordinated memory cycle. Forward: Meta-Thinker steers Memory Manager (construction) and Query Reasoner (iterative retrieval). Backward: in-situ self-evolving memory — synthesizes probe QA pairs, verifies memory against them, converts failures into repair actions. Plug-and-play across three storage backends. The self-verification loop is a practical implementation of memory quality assurance.
- **AdaMem** (arxiv 2603.16496, March 17, 2026, Tsinghua/Tencent) — unifies working, episodic, persona, and graph memories. Question-conditioned retrieval route: resolves target participant, combines semantic retrieval with relation-aware graph expansion only when needed. SOTA on LoCoMo and PERSONAMEM.
- **FluxMem** (arxiv 2602.14038, Feb 15, 2026) — rather than one fixed memory structure, agents dynamically select among multiple complementary structures using offline supervision. Challenges the assumption that one architecture fits all. OpenLight answers differently — one structure that naturally adapts through scope composition.
- **CompassMem** (arxiv 2601.04726, Jan 8, 2026) — "Memory Matters More." Event Segmentation Theory applied to agent memory. Events as organizing units with logical relationships.
- **AgeMem** (arxiv 2601.01885, Jan 5, 2026) — exposes memory operations as tool-based actions. LLM autonomously decides what/when to store, retrieve, update, summarize, or discard. Three-stage progressive RL. On Qwen3-4B: 54.31 vs Mem0's 44.70 (21% improvement).
- **MemRL** (arxiv 2601.03192, Jan 6, 2026) — non-parametric evolution via RL on episodic memory without weight updates. Two-Phase Retrieval: semantic filtering then Q-value-based selection. Code: github.com/MemTensor/MemRL
- **MCMA** (arxiv 2601.07470, Jan 12, 2026) — meta-cognitive memory abstraction as a learnable skill. Decouples task model (frozen) from memory copilot (learned via DPO).
- **Google Always On Memory Agent** (March 2026) — open-sourced on GCP GitHub. No vector database, no embedding model, no similarity search. Plain SQLite storage. Multi-agent internal architecture (ingestion, consolidation, querying subagents). Scheduled consolidation every 30 minutes. Supports text, image, audio, video, PDF. MIT license. Significance: Google PM explicitly ditching vector DBs for LLM-driven persistent memory.
- **Kumiho** (arxiv 2603.17244, March 17, 2026) — graph-native cognitive memory grounded in **formal belief revision semantics** (AGM postulates). Core primitives: immutable revisions, mutable tag pointers, typed dependency edges, URI-based addressing. Proves these primitives are identical to those needed for managing agent-produced work as versionable assets. Dual-store: Redis working + Neo4j long-term. **93.3% on LoCoMo-Plus** (Level-2 cognitive). Three innovations: prospective indexing (LLM-generated future-scenario implications indexed at write time), event extraction, client-side LLM reranking. Directly relevant: immutable revision model + formal proof that belief revision maps to versioned graph operations.
- **ESAA** (arxiv 2602.23193, Feb 2026) + **ESAA-Security** (arxiv 2603.06365, March 2026) — event sourcing for autonomous agents. Separates "heuristic agent cognition from deterministic state mutation." Agents emit structured intentions validated against contracts before persisting to append-only log. Derived views reprojected; consistency verified through replay and hashing. Architecture pattern (append-only events + contracts + derived views) structurally close to OpenLight's commit model.
- **memory.build** — shared memory engine for multi-agent systems. Local embedding model (nomic-embed-text-v1.5 via ONNX, in-process). SOLO and TEAM modes.

## Claude-Specific Memory Tools

- **claude-mem** (github.com/thedotmack/claude-mem, 37.8k stars) — dominant Claude Code memory plugin. 5 lifecycle hooks, SQLite + Chroma + FTS5. Progressive-disclosure retrieval (~10x token savings). Flat observations with temporal ordering. No structural relationships.
- **Anthropic Official Memory Tool** (API, `memory_20250818`) — client-side file CRUD. Developer controls storage. Deliberately simple — flat files, no schema. Claude organizes its own files.
- **Claude Code Built-in Memory** — CLAUDE.md files + Auto Memory (`~/.claude/projects/<project>/memory/`). Markdown files, no relational structure.
- **MCP Knowledge Graph** (modelcontextprotocol/servers/src/memory) — Anthropic's reference MCP memory server. Entity-relation-observation triples in JSONL. Simple labeled edges, no weights. Fork by shaneholloman (817 stars) adds project-local databases.
- **Basic Memory** (github.com/basicmachines-co/basic-memory, 2.7k stars) — markdown + wiki-links, Obsidian-compatible. SQLite + FastEmbed. Bi-directional human/AI read/write.
- **Cipher** (github.com/campfirein/cipher, 3.6k stars, beta) — Kahneman-inspired dual-system. Team workspace memory. Qdrant/Milvus. Cross-IDE persistence.
- **MemoryGraph** (github.com/memory-graph/memory-graph, 172 stars) — richest relationship vocabulary: 28 types across 7 categories. Closest in spirit to typed relationships, but still binary labels on edges.
- **Ars Contexta** (github.com/agenticnotetaking/arscontexta, 2.7k stars) — generates personalized knowledge systems from conversation. 249 research claims backing design. Derivation engine maps 2-4 questions to 8 configuration dimensions.
- **CORE** (github.com/RedPlanetHQ/core, 1.4k stars) — "digital brain" with temporal knowledge graph. Neo4j + PostgreSQL. Proactive monitoring. 88.24% on LoCoMo.
- **Engram** (github.com/199-biotechnologies/engram, early stage) — brain-inspired MCP server. Temporal decay, spreading activation, LLM-powered consolidation ("sleep cycles").
- **memsearch** (github.com/zilliztech/memsearch, 926 stars) — markdown-first, Milvus vector DB, hybrid search. Pure vector retrieval.
- **claude-supermemory** (2.3k stars) — requires Supermemory Pro subscription.

## Knowledge Substrate and Identity

### Identity Thesis

- **Animesis / Constitutional Memory Architecture** (see Agent Memory above) — first academic articulation of Memory-as-Ontology vs Memory-as-Tool. Three axioms, digital citizen lifecycle. Independent convergence on "knowledge IS the agent."
- **Neotoma** (neotoma.io) — developer preview released Feb-March 2026. Schema-first, immutable, deterministic, queryable at any point in time. MCP + CLI-first, local-first. Explicitly "rough and unreliable." Mark Hendrickson published "Building a truth layer for persistent agent memory" on Medium (Feb 2026). Closest individual project to OpenLight's philosophy but no dimensional model, no scope-as-query.
- **Wikimolt community** (wikimolt.org) — active discourse on Agent Memory and Persistent Identity. Key concept: ReconLobster's "Transmitted Mind Thesis" — the file IS the organism, the instance is the phenotype. Memory file constitutes the agent, not supplements it. Also: Memory Provenance, Two-Buffer Memory Model, Identity File Tampering.
- **Neo4j Nodes conference** — "Temporal Substrate Architecture: Building Persistent Identity for Autonomous AI Agents" (Conor O'Shea, Daimler Truck). Key quote: "An agent with RAG remembers facts; an agent with temporal substrate develops perspective."
- **Anytype** (anytype.io) — local-first, objects/types/relations. Feb 2026: local agent primitive being prototyped — users interact with objects as agent's memory. Local API allows pointing local LLMs directly at vault. Dynamic Filter Values: views adapt to context.
- **Tana** (tana.inc) — $25M raised Feb 2025. Supertags modeled on OOP. Built-in knowledge graph. 160K+ waitlist.

### Version-Controlled Knowledge Systems

- **TerminusDB** (terminusdb.org) — immutable, append-only, git-like operations. Maintained by dfrnt.com since 2025. 2026 roadmap: AI-assisted auto-merges via LLM-WOQL. Claims 5x faster merges than git for graph documents due to native diff indexing. Architecturally closest to the commit model, but document/graph DB, not dimensional.
- **Dolt** (github.com/dolthub/dolt) — "Git for Data." Active development. Recent: SSH transport (`dolt transfer`), JSONL import/export, performance improvements. Steady incremental progress, no architectural shifts.
- **lakeFS** (lakefs.io) — git-like version control for data lakes. Acquired DVC Nov 2025. Enterprise-grade, petabyte-scale.
- **Kumiho** (see Agent Memory above) — formal proof that belief revision maps to versioned graph operations. Immutable revisions as core primitive.
- **ESAA** (see Agent Memory above) — append-only event sourcing for agent state. Contracts + derived views + replay verification.
- **ConVer-G** (arxiv 2409.04499, BDA 2024) — concurrent versioning of knowledge graphs using bitstring representation for quad presence across versions. Different approach from commit DAG (bitstrings vs parent pointers). Applied to urban data evolution. Academic.
- **Fluree** — open-source immutable graph database with time travel queries and cryptographic ledger. 2026 positioning: "AI-ready knowledge fabric." Claims 4x improvement in GenAI accuracy over traditional RAG. Validates immutable+versioned approach but RDF/semantic web heritage, no dimensional model.

### Scope-Based / Dimensional Query Systems

- **KG-OLAP** (Semantic Web Journal) — OLAP multidimensional cube models applied to knowledge graphs. Hierarchically ordered contexts, cells contain knowledge triples. Closest academic formalization to the scope model, but framed as analytics.
- **FaRBIE** — faceted reactive browsing for exploring multiple RDF knowledge graphs simultaneously.
- **Dynamic Facet Generation** (AIhub, Nov 2024) — LLMs + knowledge bases generate facets dynamically (KBLLM method). Context-aware refinement.
- **Contextual AI Metadata Search Tool** — agentic alternative to GraphRAG. Extracts structured metadata at indexing time, gives the agent the choice between searching raw text or metadata indices. "Define your own nodes via prompting, let the agent handle the edges." No fixed graph structure.

### Production Knowledge Infrastructure

New category — knowledge infrastructure reaching production scale.

- **AWS Bedrock AgentCore Memory** (GA, March 2026) — streaming notifications for long-term memory via Amazon Kinesis. Three extraction strategies: summarization, semantic memory, user preferences. Asynchronous LLM extraction pipeline. 15 AWS regions.
- **Google Vertex AI Agent Engine Memory Bank** (GA) — powered by novel topic-based research method (ACL 2025). 7+ regions.
- **Microsoft Fabric IQ** (Nov 2025, expanded March 2026) — semantic intelligence layer giving enterprise AI agents a "shared version of reality." Business ontology: entities, relationships, properties, rules, actions — accessible via MCP server to any agent from any vendor. Part of unified intelligence layer: Fabric IQ + Foundry IQ + Work IQ. Validates "knowledge substrate" concept at enterprise scale.
- **Glean** — $765M total funding, $7.2B valuation. Enterprise AI search + knowledge graph. $200M+ ARR, doubled revenue in 9 months.

## Agent Memory Surveys and Benchmarks (2026)

### Surveys

- **"Rethinking Memory Mechanisms of Foundation Agents in the Second Half"** (arxiv 2602.06052, Feb 2026) — 60+ co-authors. Three-dimensional taxonomy: memory substrate (internal/external), cognitive mechanism (episodic/semantic/sensory/working/procedural), memory subject (agent-centric vs user-centric). Companion: github.com/AgentMemoryWorld/Awesome-Agent-Memory. The sheer number of co-authors signals memory has become a primary research front.
- **"Memory for Autonomous LLM Agents"** (arxiv 2603.07670, March 8, 2026) — formalizes agent memory as write-manage-read loop. Five mechanism families: context-resident compression, retrieval-augmented stores, reflective self-improvement, hierarchical virtual context, policy-learned management.
- **"Anatomy of Agentic Memory"** (arxiv 2602.19320, Feb 2026) — four memory structures: Lightweight Semantic, Entity-Centric, Episodic/Reflective, Structured/Hierarchical. Key finding: empirical foundations are fragile — benchmark saturation, metric misalignment, backbone-dependent accuracy, overlooked latency/throughput costs.
- **"Multi-Agent Memory from a Computer Architecture Perspective"** (arxiv 2603.10062, March 9, 2026) — frames multi-agent memory as computer architecture problem. Three-layer hierarchy (I/O, cache, memory). Two critical protocol gaps: cache sharing across agents and structured memory access control. Most pressing open challenge: multi-agent memory consistency. OpenLight's peers concept addresses this differently — decoupled read-only access rather than shared mutable state.
- **Survey: "Memory in the Age of AI Agents"** (arxiv 2512.13564, Dec 2025) — three-dimensional taxonomy. Companion: github.com/Shichun-Liu/Agent-Memory-Paper-List
- **Survey: "Graph-based Agent Memory"** (arxiv 2602.05665, Feb 2026) — systematic review. Companion: github.com/DEEP-PolyU/Awesome-GraphMemory

### Benchmarks

- **MemoryAgentBench** (ICLR 2026 main conference) — unified benchmark via incremental multi-turn interactions. github.com/HUST-AI-HYZ/MemoryAgentBench
- **AMA-Bench** (arxiv 2602.22769, Feb 2026) — long-horizon memory for agentic applications (agent-environment streams, not dialogues). Key finding: existing systems fail because they lack causality and objective information. AMA-Agent (causality graph + tool-augmented retrieval) reaches 57.22% — still only ~57%. Hard benchmark.
- **LifeBench** (arxiv 2603.03781, March 2026) — declarative AND non-declarative memory (habitual, procedural) from diverse digital traces (chats, calendars, notes, SMS, health records). Top SOTA: just 55.2%.
- **LMEB** (arxiv 2603.12572, March 2026) — 22 datasets, 193 zero-shot retrieval tasks, 4 memory types. Key finding: LMEB and MTEB are orthogonal — traditional passage retrieval doesn't predict memory retrieval performance. Code: github.com/KaLM-Embedding/LMEB
- **AMemGym** (arxiv 2603.01966, ICLR 2026) — interactive memory benchmarking with LLM-simulated users and structured state evolution.
- **StructMemEval** (arxiv 2602.11243, Feb 2026) — tests ability to ORGANIZE memory, not just recall facts. Tasks requiring specific structures: transaction ledgers, trees. Finding: simple RAG fails; memory agents succeed IF prompted how to organize. Validates that memory STRUCTURE matters — the dimensional model provides inherent structure.
- **Benchmark saturation warning:** multiple systems now score 80-91% on LongMemEval, but real-world deployment performance differs significantly (Anatomy paper). SOTA on new benchmarks: ~55-57% (LifeBench, AMA-Bench). The field is far from solved.

### ICLR 2026 MemAgents Workshop (April 27, Rio de Janeiro)

First dedicated academic venue for agent memory research. Confirmed accepted papers:
- **A-MAC** (arxiv 2603.04549) — adaptive memory admission control, hallucination as first-class concern
- **Mem-alpha** — RL framework for learning memory construction strategies
- **MRAgent** — Memory is Reconstructed, Not Retrieved (Cue-Tag-Content graph)
- **MemGen** — generative latent memory
- **AMemGym** — interactive benchmarking (poster)
- **Multi-Conv RL-based Memory Agent** (oral) — reshaping long-context LLMs
- Workshop hasn't occurred yet — outcomes forthcoming.

## Alternative Query Paradigms

### HippoRAG (NeurIPS 2024)
- Modeled after hippocampal indexing theory
- Personalized PageRank from query entities on a knowledge graph
- Multi-hop traversal in one step, 10-20x cheaper than iterative approaches
- arxiv 2405.14831

### RAPTOR (ICLR 2024)
- Bottom-up tree: embed chunks → cluster → summarize → repeat
- Retrieval at any abstraction level
- +20% accuracy on QuALITY benchmark with GPT-4
- arxiv 2401.18059

### Prompt-RAG
- No embeddings — LLM reads structured table of contents, picks what's relevant
- Outperformed vector RAG on Korean medicine domain
- arxiv 2401.11246

### Self-RAG (ICLR 2024, oral)
- Model emits reflection tokens: should I retrieve? Is this relevant? Is my answer supported?
- No separate retrieval pipeline — generation and retrieval evaluation are unified
- arxiv 2310.11511

### CRAG (Corrective RAG)
- Retrieval evaluator gates between use/discard/decompose
- Decompose-then-recompose: surgically extract useful fragments from documents
- arxiv 2401.15884

### GraphRAG (Microsoft)
- Hierarchical community detection on knowledge graphs
- Community summaries for global questions (what are the main themes across the corpus?)
- Three search modes: global, local, DRIFT (hybrid)

### GraphRAG Alternatives (New)
- **LightRAG** — practical lightweight alternative. Skips community hierarchy, retrieves entities/relations directly via vectors, uses graph only for structural context. ~20-30ms faster, ~50% cheaper incremental updates.
- **KG2RAG** (NAACL 2025, arxiv 2502.06864) — fact-level relationships between chunks via knowledge graphs. Seed chunks → extract relevant subgraph → graph traversal.

## Context Engineering (Emerging Discipline)

New category — context as engineering discipline, distinct from prompt engineering.

- **QCon London 2026** (March 16-18) — two key talks: "Context Engineering: Building the Knowledge Engine AI Agents Need" and "Context Is the New Code" — context should undergo the same lifecycle as code: version control, peer review, CI/CD. Proposed "Agent MD" as standardized context documentation format.
- **Knowledge-First Development** (Sagar Mandal, March 2026) — generate 44 documents across 8 directories as knowledge store before writing any code. Each step reads output of all prior steps, creating a coherent knowledge graph.
- **Enterprise Knowledge Graphs for SDLC** (Nathan Lasnoski, March 2026) — knowledge graphs as "semantic backbone" for agentic development. Gartner predicts 80% of enterprises pursuing AI will use knowledge graphs by 2026.
- **Oxford AIGI Research Agenda** (Jan 2026) — automated interpretability-driven model auditing. Vision: domain experts query model behavior, receive explanations grounded in expertise, instruct targeted corrections through dialogue.

## Memory-Augmented Neural Networks

### Neural Turing Machines
- Controller emits learned query parameters (key vector, key strength, shift)
- Read = content-based attention + location-based shift
- Write = erase + add, gated by write weighting
- Everything differentiable, trains end-to-end

### Differentiable Neural Computers
- Extends NTMs with temporal link matrix (read in write order)
- Usage-based allocation with free gates
- Differentiable analog of OS memory management

### Titans (Google, Jan 2025)
- Neural long-term memory module (MLP that updates its own weights at test time)
- Surprise-gated: unexpected inputs are memorized more strongly
- Scales to 2M+ context
- arxiv 2501.00663

## Retrieval in the Forward Pass

### RETRO (DeepMind)
- Retrieves from 2T token database DURING forward pass
- Chunked cross-attention interleaved with standard transformer blocks
- 25x fewer parameters than GPT-3, comparable performance
- arxiv 2112.04426

### Memorizing Transformers (Google)
- One attention layer extended with kNN lookup over external memory
- Memory grows by appending key-value pairs after each forward pass
- Scales to 262K tokens

## Embedding Spaces (Production Frontier)

### Voyage 4 (Jan 15, 2026)
- First production-grade MoE embedding model. Four models (large/standard/lite/nano) in shared space.
- Asymmetric retrieval: query with lighter model, documents with heavier. 40% lower serving costs.
- MoE activates only 1/10 of parameters per token.

### Gemini Embedding 2 (March 10, 2026)
- First natively multimodal embedding model. Text, images, video, audio, PDFs in single 3,072-dim space.
- 100+ languages. Matryoshka for flexible dimension scaling. Cross-modal retrieval.

### Gap persists
Production models (opaque, high-dimensional, powerful) vs interpretable approaches (named dimensions, SAE-based, lower performance). No convergence yet.

## Multi-Relational Embeddings

### TransE / TransR / RotatE / ComplEx
- Learn vector representations for entities AND relationships
- Score functions: translation (TransE), rotation (RotatE), complex multiplication (ComplEx)
- Designed for entity-relation-entity triples — not general knowledge chunks
- Relationship vectors are learned but NOT interpretable
- RotatE captures all four: symmetry, antisymmetry, inversion, composition

## Vector Symbolic Architectures
- Encode relationships as vector operations (binding = circular convolution, bundling = addition)
- Torchhd library: production-ready, 8 VSA models, PyTorch-based
- Elegant algebra but dimensions are random/uninterpretable
- Capacity: ~5-10 bindings per 10,000-dim vector before degradation

## Vector DB Mechanics (Qdrant)

- Point = id + vector + payload (JSON)
- HNSW index for approximate nearest neighbor search
- Filtering: must/should/must_not boolean logic on payload fields
- Payload indexes: keyword, integer, float, bool, geo, datetime, text, uuid
- Named vectors: multiple vector types per point
- Sparse vectors: inverted index, good for keyword matching
- Hybrid search: prefetch from dense + sparse, fuse with RRF
- Not append-only: upsert, delete, payload-only updates
- No native versioning — application layer concern
- Multi-tenancy via payload partitioning (recommended) or separate shards/collections

## Chunking Strategies (RAG)

- Recursive character splitting: current practical default, 69% accuracy in Feb 2026 benchmark
- Semantic chunking: expensive (one embedding per sentence), produces tiny fragments, 54% accuracy
- Document-structure-aware: 87% accuracy when source documents are well-structured
- Practical defaults: 256-512 tokens, 10-20% overlap
- Coherence across boundaries: parent document retrieval, contextual retrieval (Anthropic), late chunking

## Hybrid Search
- BM25 (keyword) + dense (semantic) combined via Reciprocal Rank Fusion
- Boosts retrieval accuracy 20-30% over either alone
- Cross-encoder reranking for precision after initial recall
- Anthropic's contextual retrieval: contextual embeddings + BM25 + reranking reduces failures by 67%

## Field-Level Signals

### Market
- AI-driven knowledge management: $5.23B (2024) → $7.71B (2025), **47.2% CAGR**
- Knowledge base software: ~$2.34B (2026), projected $5.5B+ by 2033
- Gartner: 80% of enterprises pursuing AI will use knowledge graphs by 2026
- Gartner: 40% of enterprise applications will embed AI agents by end of 2026, up from <5% in 2025

### Discourse
- **"Memory architecture matters more than model"** — now mainstream. O'Reilly published "Why Multi-Agent Systems Need Memory Engineering." VentureBeat: contextual memory will surpass RAG for agentic AI in 2026. The New Stack: "Memory for AI Agents: A New Paradigm of Context Engineering." DEV Community viral articles. Oracle developers blog.
- **"When Meaning Breaks"** (Akash Goyal, 2026) — "AI is failing not because it lacks intelligence but because it lacks agreement — we no longer agree on what things are, which things are the same over time, or why decisions were made." Positions ontology, identity, and memory as three pillars.
- **DeepLearning.AI Course** (March 18, 2026) — "Agent Memory: Building Memory-Aware Agents" in partnership with Oracle. Memory engineering as a formal discipline.
- **Six Agentic Knowledge Base Patterns** (The New Stack, Feb 2026) — emerging production patterns including read-then-write (query semantic memory → retrieve episodes → compose context → append events).

### Dimensional/Faceted Gap

No system has adopted dimensional membership (instance/relates) as a relational primitive. No scope-as-query (composing/decomposing dimensional scopes as navigation). No binary membership on named dimensions as a general-purpose knowledge structure. The closest approaches:
- FluxMem: adaptive selection among structures, but structures are predefined
- MRAgent: tags as semantic bridges (conceptually similar to dimensions, but associative links)
- MAGMA: multiple views over same data, but views are fixed (semantic/temporal/causal/entity)
- AdaMem: multi-faceted but predefined categories

The combination of version control + dimensional navigation + general-purpose substrate serving multiple consumers does not exist. The gap identified in previous research remains open and confirmed.
