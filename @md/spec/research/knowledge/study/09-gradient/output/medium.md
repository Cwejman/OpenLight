---
under: the code
kind: brief
---

# What may be typed, and what must stay prose

The code's fifth section reasons that the shape of knowledge, wholes that are also parts joined by links, could hold beyond prose if everything lived in one typed medium. Read this and you will know what the world says back: what happens to a type a model infers, what the semantic web's lineage learned, whether anyone has versioned structure or merged it, how permission behaves when it is transitive, and who else argues the plan's thesis or its opposite. The grades are the agents'; nothing was checked again.

## 1. Type the edges, keep the body prose

The edges of knowledge may be typed, its identity, address, permission, provenance, freshness and a small declared vocabulary, and the body must stay prose. A type a model infers is worse than prose, a type a person declares wins only where the vocabulary is small, and structure earns its cost on five questions that prose cannot answer. The study that would test the plan's own case has not been run. Reasoned, by the adversarial agent, from the paragraphs below.

A type inferred by a model is worse than prose, because it answers with confidence where thin prose looks thin. [Rosetta 2026], 680 database columns with identifiers destroyed, against human documentation: a model used directly scores 0.223 accuracy at 94% coverage; the same model inside a deterministic verification harness scores 0.475 on the 42% it commits to, and restricted to columns both arms answer it "writes no better prose than the model alone; the gain is selection." Their line: "the deterministic layer is a competence detector, not a competence amplifier." A benchmark of 12,867 extracted fields finds frontier models produce 0% valid output on a 369-field financial schema, degradation growing with schema breadth; a study of 21 models finds near-perfect schema compliance and 83%, 67% and 24% value accuracy for text, images and audio. Paper-only, three independent studies. Form is free; content is not, and a wrong type rots silently while wrong prose rots loudly.

Small declared vocabularies win where induced ones lose. A memory system with thirteen predefined categories, no entity extraction and no graph maintenance beat hybrid graph and vector systems on a single retrieval query. A governed semantic layer for enterprise text-to-SQL answered 37 of 38 questions on every run against 21 of 38 for raw table definitions, with zero wrong-but-executed queries against 29; its authors decline the causal claim, since the layer is curated. An ontology built with no unconstrained generation step reached coverage of its competency questions of 0.85 against 0.63 for direct generation. Paper-only, all. And schema.org's own usage data: of 958 types, twelve reach ten million domains, about 47 carry essentially all high-volume use, and 77% sit below a thousand domains; a closed vocabulary of a few dozen types is what the open web converged on anyway. Measured on live deployments.

Structure wins on five questions, and prose wins otherwise. Reasoned, by the adversarial agent, from the domains where structure is uncontested: authorisation, records, provenance, transactions, federation, verification. A yes to any of these is a case for structure; a payload read once by one reader who will exercise judgment on it is prose:

- Must the rule hold even when the model is wrong or attacked, so that it cannot live in the prompt?

- Is the query a count, an intersection, an "all where," rather than a find or a summary?

- Are there multiple writers with no coordinator?

- Must the claim be answerable later by someone who was not there?

- Does cost grow with the size of the catalogue?

Over the five questions sits one gate. If the type would have to be inferred rather than observed or declared, do not type it; and abstention, the system declining to answer where it has no evidence, must be enforced in code, since asked for in the prompt it produced zero abstentions on some models and did not transfer across them. Paper-only, from the first study above.

Scaling dissolves the problems of reading and never touches the problems of writing, committing and being accountable. Format preference, schema compliance, tolerance of messy input and hand-built retrieval all fade with capability, and Microsoft retired its graph-retrieval project citing exactly that. What no capability substitutes for: enforcement before generation; provenance; coordination of many writers, where a data type that merges edits without a coordinator (a CRDT) reconverged in 30 of 30 partition heals against 11 for last-writer-wins; cost proportional to catalogue size; and staleness detection, where re-validating on a content hash beats ranking by drift across 19,099 MCP servers. Paper-only.

The three strongest arguments against the plan are the ones its own agent named. The bottleneck of producing types did not clear, it changed shape: types can now be produced cheaply and wrongly. Structure decays silently while text rots loudly. And the reader for whom structure was an affordance, a weak model, is being replaced by one that does not need it. Reasoned, by the adversarial agent.

The study that would settle it does not exist. No one has compared human-declared structure made with a model's help against a well-written prose document, on the same corpus, with the same frontier reader; every positive result above beats an extracted or unstructured baseline, never a good prose one. This is the crux the plan turns on.

## 2. What the lineage learned

The semantic web's lineage teaches four things the plan can stand on. A hierarchy rots when it is transitive and holds when it is not; validation beat reasoning; a graph built by extraction does not beat plain retrieval and costs orders more; and a new formalism at the surface loses to the old one. Under all four sits the oldest critique, that formal structure costs at capture time and people route around it. Measured and paper-only, in the sections below.

### 2.1 The vision failed and the vocabularies succeeded

The vision failed and the vocabularies succeeded, and the field has not written its own post-mortem. The 25-year retrospective lists standards and does not engage the critiques; RDF 1.2 and SPARQL 1.2 are unfinished in 2026, a year behind charter. Announced. What works is narrow: about 47 of schema.org's types, Wikidata, thesauri in libraries and governments, the biomedical ontology registry, and the EU's live validators for open-data metadata. Shipped.

The reasoning layer is dead and the validation layer won. Reasoners for the web ontology language (OWL, which infers new facts from declared ones) decay in public, the last commit to one in 2017 and another in 2022; the Python validator for the shapes language (SHACL, which checks data against declared shapes and infers nothing) pulls 1.24 million downloads a month against 92,000 for the OWL library, two and a half times more than five months earlier; and the W3C is standardising RDF's new inference language as datalog-style rules under the shapes working group, not description logic under an OWL one. Measured, direction not headcount. "Nobody runs OWL reasoners" is plausible and unmeasured.

### 2.2 The transitive hierarchy rots

The transitive class hierarchy is the thing that rots. [Patel-Schneider and Doğan 2024] found about 2.39 million Wikidata classes simultaneously first- and second-order and 1.9 million problematic pairs, root cause editors confusing instance-of with subclass-of. Paper-only, measuring shipped data at global scale. The W3C's vocabulary for thesauri (SKOS), its most successful, made its hierarchy non-transitive on purpose in 2009, with the closure a separate opt-in property. Shipped. The plan, with nothing transitive and membership-only typing, removes the single most reported failure of collaborative knowledge bases, and SKOS is the precedent that it works.

Contexts proliferate rather than consolidate. Cyc, the forty-year project to hand-build common sense, spent about 200 million dollars and 2,000 person-years for 30 million assertions, and invented microtheories, contexts that need only be consistent within themselves, because the whole could not be kept consistent. Stated, well sourced. Owner-scoped contracts are microtheories rediscovered, and they inherit the alignment problem in full, since RDF's failure was never a global vocabulary; it was that per-owner vocabularies never aligned and alignment was never automated.

### 2.3 Graph retrieval does not beat plain retrieval

Graph retrieval does not beat tuned vector retrieval and costs two to three orders more. Retrieval here means fetching pieces of a corpus to feed a model (RAG); the graph variants first extract entities and relations into a graph and retrieve through it. [Zhou et al. 2025], in a unified framework: not all graph methods beat vanilla RAG; global graph search needs 57 times the time and 210 times the tokens per query, about nine minutes and 300,000 tokens; and the method that most often wins builds a tree of summaries and no entity graph at all. A dedicated benchmark: "GraphRAG frequently underperforms vanilla RAG on many real-world tasks." [Han et al. 2026]: on summarisation, graph loses on its own home turf, and only about 65% of answer entities appear in the constructed graphs. Paper-only, multiple, independent. The evaluations kill model-extracted graphs, not human-declared ones, but they also show vanilla vector retrieval beating both on factoid recall, so a plan with no vector similarity is the one choice with active evidence against it.

### 2.4 A new formalism loses at the surface

A query language that asks users to learn a new formalism loses to SQL. XTDB, a database that kept every past state and was queried first in a logic language (datalog), shipped its 2.0 on SQL:2011 and its homepage no longer mentions datalog; two other datalog engines are abandoned or archived; Rust's new borrow checker shipped in August 2026 with a non-datalog formulation because the datalog one was "a non-starter" on performance. Measured, from the repositories. Datalog wins as an internal representation and loses as a surface.

### 2.5 The oldest critique still stands

The oldest critique is still the sharpest, and nothing in 2025 or 2026 refutes it. [Shipman and Marshall 1999], "Formality Considered Harmful": formal structure imposes a cost at capture time that users route around, for four reasons that [the documentation brief](documentation.md#53-capturing-rationale-fails-for-reasons-never-costed) gives. Opinion, 165 citations. The consequence they drew, and spatial hypertext embodied, is that structure must be allowed to stay implicit and emergent; a typed system must let a thing be untyped, half-typed and retyped later without ceremony.

## 3. Nobody merges structure

Nobody merges structure; they serialise it. Structure merges only inside a lattice where the change is a widening, and outside it every shipped answer is stop, take one side, fast-forward, or make a new table. The one serious attempt at translating between schemas ended in 2020, and every production system that survived schema change did so by forbidding rather than translating. Shipped and research-prototype, in the sections below.

### 3.1 The shipped systems take one side

Dolt, the most successful versioned store, separates data conflicts, resolvable row by row, from schema conflicts, which "prevent the merge from completing" and resolve only by taking "the entire table from the chosen side." Iceberg, the table format that absorbed git-for-data, has branches and tags and no branch merge; its audit workflow closes by fast-forward. TerminusDB, the only system that models schema change as a first-class branchable operation, distinguishes weakenings, which cannot invalidate existing data and need no migration, from everything else, which needs an explicit replayable script, and leaves the operation that changes a class's parents unimplemented. Confluent's schema registry defaults to a compatibility mode that is non-transitive, so a chain of pairwise-compatible changes can be globally incompatible. Shipped, all four.

### 3.2 Cambria's result is a pivot

Cambria's real result is a pivot, not the lens algebra. Cambria was the research lab Ink & Switch's attempt, in 2020, to let two versions of a schema coexist by writing a lens, a small bidirectional script that translates a document each way. They began by translating on write and abandoned it, because "too much translation work was happening eagerly on write" and a write could race a newly registered schema; they switched to tagging each write with the schema it was written under and translating at read, which is the resolution rule the Avro serialisation format has used for eighteen years. The essay's own headline operator is not a lens and "can't guarantee a useful consistency relation"; performance was never measured; the team found it too unstable to be their system of record; and a lens cannot express intent. Research prototype, marked completed in 2020, last commit 2024, no successor. The lens literature itself proves the composition law needed for chained migration is incompatible with the operators anyone wants: map, flatten, merge and conditionals fail it "for reasons that seem pragmatically unavoidable." Paper-only, TOPLAS 2007. The one shipped descendant treats schema version as another branch dimension, in alpha.

### 3.3 The survivors forbid rather than translate

Every production system that survived schema change bought safety by forbidding, not translating. Protobuf forbids reusing field numbers and removed required fields entirely; Datomic says "you can never alter :db/valueType" and admits that travelling back in time does not take the schema back with it; ATProto says "types can not change, fields can not be renamed" and that a breaking change gets a new name, with all old data valid under the new definition and new data under the old, which is full compatibility in prose for a federation nobody can force to upgrade. Shipped.

The schema-evolution agent's recommendations for the plan follow from those systems, and the first is the one everything else is secondary to. Reasoned, by the agent:

- Stamp every write with the contract version it validated against, because write-time-only validation is safe only when the writer's schema travels with the datum.

- Split contract edits into widenings, applied in place, and narrowings, which mint a new contract.

- Support alias as the one rename.

- Do not build lenses.

- Invalidate indexes eagerly at constant cost and re-derive lazily on read, which is the measured result from Noria, a database that populates new views on demand.

- Reconcile seeded records by content hash, touching only ones a person has not since edited.

### 3.4 Accretion has a tax, and the conjunction is unbuilt

Accretion has a documented tax. Datomic's own docs: expect every datom stored at least three times; excision runs in time proportional to the whole database; and "a common modeling mistake is to assume that everything temporal belongs in Datomic," so turn history off for most attributes. Stated by the vendor, unusually candid. It is nonetheless the strongest-validated store here, with no safety bugs found at 94 million users and 2.3 billion transactions a day.

The claim that nobody combines version control with knowledge structure has been false since 2019. TerminusDB and Fluree both do it and are alive; Dolt now sits under MySQL, Postgres, SQLite and MongoDB interfaces as one engine, so versioning is a property of storage rather than a product. Shipped. What is rare is the conjunction the plan wants: a branch DAG plus knowledge structure plus permission in one evaluator, over a personal or organisational corpus rather than operational tables. Shipped-absent. TerminusDB, the nearest, had a year without releases and one committer in 2026, and the year's story at this layer was consolidation into larger companies.

## 4. Permission that filters everything

Permission that is transitive, where membership of a group inside a group inside a group is followed at check time, is the documented failure: in latency, in the writes it takes to avoid the latency, and, once a model does the retrieval, in leakage. Filtering uniformly, so that counts and search obey the same rule as bodies, is rarer than filtering, and it is the part of the plan with the fewest precedents. Paper-only and shipped, in the paragraphs below.

Transitive permission is the documented performance and safety failure. The paper on Google's authorisation system (Zanzibar) says it itself: "recursive pointer chasing during check evaluation has difficulty maintaining low latency with groups that are deeply nested or have a large number of child groups," so Google precomputes the closure into an index it calls Leopard, at the cost that "a single tuple addition or deletion may yield potentially tens of thousands of discrete Leopard tuple events," applied only to selected namespaces. Paper-only publicly, shipped inside Google. The open-source clones capped depth, one at 50 with no cycle detector, another at 25, and the second is removing its limit because "a shallow recursive graph can be more resource-intensive than a deep linear one": fan-out, not depth, is the cost, and "keep your hierarchy under N levels" is the wrong metric. Shipped. Any closure you allow you eventually materialise, and materialising is a fan-out bomb.

A retrieval model converts latent transitive permission into actual leakage, and the vendors say so. Microsoft's documentation for restricted search calls it "a short-term solution… not intended or scalable for long-term use," "isn't a security boundary," capped at a hundred sites, with new enablement blocked from July 2026; its successor takes over a week to process a large site; its worked example is a budgeting site whose owner "hasn't set up proper permissions" so the assistant surfaces it. Google Drive removed the ability to grant less access than a parent folder; Notion "respects the broadest level of access." Shipped, vendor admissions. Latent permissions were harmless while discovery was manual; the model performs the closure exhaustively, so it did not create the leak, it enumerated it. Filtering after retrieval wrecks recall by construction, so the vendors precompute permission sets, which is Leopard reinvented for search.

Uniform filtering including counts and search is the rare part, not the filtering. Row-level security in SQL filters aggregates by construction; Fluree, a ledger of typed facts, evaluates its policies as ordinary query clauses per datum inside execution; Hasura reuses its query operators; the Willow protocol grants read capabilities over the same three-dimensional regions its sync uses, "the identical formalism." Shipped or specified. What almost nobody achieves is full-text search under the same filter: Elasticsearch's document-level security states that it does not affect index statistics and a restricted user can count how many inaccessible documents contain a term. The defensible claim for the plan is the unification, one evaluator in which bodies, membership, adjacency, links, full-text and counts are filtered by the same expression; and the sharpest remaining edge is naming a decidable fragment of the query language as the policy language, which Cedar, a standalone policy language, does for itself and nothing does for a query subset. One sync engine shipped such a permission language and walked it back to server-side filters.

## 5. Nobody argues the whole, and the best objection

Nobody argues the whole of the plan's thesis; every neighbour holds two or three of its claims and rejects the rest. "Text is not data" is losing an argument in public, though narrowly. The strongest opposition is philosophical, that what the computer knows is what the person no longer needs to understand, and the plan should take it seriously. Shipped, prototype and opinion, in the paragraphs below.

Nobody argues the whole thesis. Palantir's ontology types objects, actions and lineage inside its own monolith; Ink & Switch makes the case that applications enclose data and versions the collaborator without needing the medium for the model; Pentad Labs defines a fact with context and lineage slots, "rather than burying context within narrative transcripts," as an essay and a pre-release product; Letta holds that memory cannot be bolted on and locates it in the harness, exactly where the plan says it must not live; a dozen "context layer" startups say sessions do not compound and solve it by summarising transcripts into a store. Shipped, prototype, or funded with demo. The historical arc the plan's commission drew, Unix then the web then AI, each arriving as an open medium and enclosed by applications, the agent could not find anyone making; it is the most confident absence in the sweep, with the caveat that its index was weak on long-form media theory.

"Text is not data," the plan's claim that prose cannot be the substrate, is losing an argument in public, and the loss is narrower than it looks. The most-read writing on extending models argues the opposite: markdown, shell and natural language beat typed tool schemas, plugins gave way to custom instructions to MCP to skills, each less structured, and "we will go back to extending our agents with the most accessible programming language: natural language." Opinion, widely read. But MCP got more typed underneath while shedding its conversation, [as the models brief says](models.md#5-how-the-harness-moved), and the pendulum swung away from hand-authored up-front schemas toward typed packaging, addressing, caching and authorisation. Text won the payload; it did not win the substrate.

The strongest opposition is philosophical, and the plan should take it seriously. Dynamicland, Bret Victor's research group, states the inverse principle outright: "to maximize agency, minimize what the computer knows," because "the 'smarter' the product, the less the user needs to understand," and its goal is a system "fully visible and understandable top-to-bottom." Litt's 2026 title says it from the other side: "Understanding is the new bottleneck." Opinion. The strongest form: a typed substrate that programs consume and people mostly do not read is another opacity, and every layer of contract added to make composition automatic makes comprehension harder. The answer the adversarial agent found, in [the models brief](models.md#4-where-person-and-model-agree), is that this holds for structure as an authoring tax and not for structure as an inspection surface.

The empirical cost of structure is entity resolution and the launder. A plain vector index costs about a thousandth of a full graph index, paid up front on content nobody may query; deciding that "Acme" and "ACME Holdings" are one entity remains unsolved, so a typed medium built by extraction degrades into confidently wrong types; and if the thing populating a typed field is a model, the field inherits the model's distortions and launders them as structure. Opinion, with the extraction numbers in [the first section](#1-type-the-edges-keep-the-body-prose) behind it.

## 6. Where this stands

The verdict and the decision rule are [the adversarial stress test](../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md). The lineage is [formal knowledge representation](../../sweep-2026-08/raw/adc9dab44aefdde97.md), [RDF, SPARQL and SHACL](../../sweep-2026-08/raw/a8712480bac2a248a.md), [the GraphRAG evaluations](../../sweep-2026-08/raw/a7bfd40b8a7c7a61c.md) and [datalog and versioning structure](../../sweep-2026-08/raw/a96d8d0c3161e997c.md). The substrates are [typed, versioned, permission-governed](../../sweep-2026-08/raw/abffcf492c6f3d77d.md); schema change is [the phase-two deep read](../../sweep-2026-08/raw/ad341d6da8eaac361.md) with [local-first and sync engines](../../sweep-2026-08/raw/a498dd38f2322a083.md). Permission is [Zanzibar and its clones](../../sweep-2026-08/raw/aea19b144c46bfc26.md). The neighbours are [who else is saying this](../../sweep-2026-08/raw/a09867b88abcb610b.md).

## 7. What could not be established

The agents could not establish any census of OWL reasoners in production; any published argument for shallow permission on performance grounds, the evidence being behavioural; funding for most of the vendors named; the text of the Cambria conference paper or any Ink & Switch post-mortem on why it stopped; whether constraining extraction to a schema improves quality rather than cost, the best evidence being 8 to 135 times fewer calls for about six points; and any replication of the "three times more accurate" knowledge-graph result against a modern baseline.
