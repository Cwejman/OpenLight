---
under: the code
kind: brief
---

# Typed, versioned, permission-governed stores

One agent was sent to find the competitive landscape for a typed, versioned, permission-governed data layer, and opened with a correction: the claim that nobody combines version control with knowledge structure is false, and has been false since 2019. This brief holds the map organised by what the primitive actually is, the nearest neighbours, and the graveyard.

## 1. The map, by primitive

**An immutable fact, time intrinsic.** Datomic (Pro 1.0.7705, 2026-07-10; independently verified at ~94 million users and 2.3 billion transactions a day at one bank, with no safety bugs found), Datascript, Datahike, Datalevin, Fluree, XTDB. Proves that retraction-free history and as-of reads are production-viable. Learned: bitemporality sells to compliance buyers, not to knowledge-work buyers.

**And accretion has a documented bill, which the vendor states more candidly than its advocates.** "Expect every datom to be stored **at least 3 times**." Excision "puts a substantial burden on background indexing. Large excisions can trigger indexing jobs whose execution time is **proportional to the size of the entire database**" — so erasure on request is an operation proportional to the whole store, and the documentation says excision "should never be used to correct erroneous data." Most pointedly: "a common modeling mistake is to assume that **everything** temporal belongs in Datomic," with the recommendation to disable history on most attributes. The immutable database tells you to turn immutability off for most of your data.

The independent verification carries one finding too, and it is the under-advertised one: intra-transaction operations execute with **concurrent, not serial, semantics**, so composing two individually-correct transaction functions can violate an invariant.

**A content-addressed tree of rows, versioned like a repository.** Dolt (24.3k stars, daily releases) with prolly trees and real merge, and in 2026 a Postgres-wire sibling at 1.0, a versioned SQLite, and a MongoDB-wire document store — one engine, four interfaces. Its dead ancestor, Noms, is archived. Proves git semantics over structured data is engineerable and durable; learned to sell it as a familiar interface rather than a new paradigm.

**A typed document in a schema'd graph, with commits.** TerminusDB — commits, branches, diff and patch, push and pull and clone, time travel to any commit, schema constraints over JSON-LD documents, Datalog plus GraphQL. The closest existing product to "versioned typed knowledge store." Its state is the cautionary part: a twelve-month release gap, then v12.0.0 in December 2025 "now with new maintainers and an enterprise version," 2026 commit history essentially one person, and the marketing site returning HTTP 522 during the sweep.

**A strongly-typed object with declared links.** Gel (formerly EdgeDB) — v7.0 in November 2025, acquired in December 2025, **last commit on the main server repository 2025-12-24**. TypeDB, with full subtyping, roles and rules, active. Palantir's Foundry Ontology, the commercial incumbent nobody in this discourse names.

**A namespace, path and time coordinate, replicated peer to peer.** Willow with Meadowcap — spec complete, **reference implementations stalled** since early 2025. iroh-docs, where the namespace keypair *is* the write capability. ATProto, with typed records under DNS-rooted identifiers. Solid, still a v0.11.0 draft from 2024.

**A relationship tuple, consulted per check.** SpiceDB, OpenFGA, Cedar, OPA — see [`permission.md`](permission.md).

**A row plus a predicate, in one query plan.** Postgres row-level security; Hasura, whose permission expressions are "generally the same operators that you use to filter query results"; Zero, whose read permissions are filter-based and applied by the server adding extra filters.

**A table or branch in a catalog.** lakeFS, Nessie, Iceberg branches, and 2026 entrants. Git-for-data migrated to the lakehouse and away from the knowledge layer.

## 2. The nearest neighbours

**Fluree holds most of the permission design already.** Policy is transacted *as data* into the ledger, and the one required field of a policy is `f:query` — an ordinary where-clause, evaluated per-datum against any facts pulled from an index **during query execution**, with special bindings making it viewer-relative. Because filtering happens at datum level inside execution, aggregates over a filtered set follow for free. What it does not have: a branch graph (the ledger is linear), a set-algebraic navigation surface, cross-store attachment, or full-text as the retrieval story.

**Willow and Meadowcap formalise the intersection-as-permission idea.** An "Area" is precisely an intersection over three dimensions — subspace, path prefix, time range — and capabilities are granted over Areas, expressed in **the identical formalism used throughout the sync protocol**. Delegation restricts by narrowing the Area; the scheme is non-transitive by construction. What it does not have: types, bodies, contracts, any query language beyond range and prefix selection, full-text — and a maintained implementation.

**TerminusDB refutes the version-control-plus-knowledge-structure claim and inverts on permission.** Its access control is **resource-scoped capability grants** at organisation and database level, with no document-level filtering — the exact opposite of viewer-side uniform filtering.

**Palantir's Ontology is the commercial incumbent.** Typed object types with declared link types over heterogeneous stores; markings as conjunctive mandatory controls that **remove resources from search and browse**, not merely from read; markings propagating automatically through lineage; branch-based ontology change management. Whether its row-level policies filter aggregates uniformly could not be verified — the security documentation URLs 404'd.

**ATProto has typed records and no history.** Lexicon gives records a globally-resolvable type identifier rooted in DNS; each account owns a repository; AT-URIs address records across independent servers; the store is a content-addressed Merkle tree. But **there is no commit graph** — the predecessor pointer is "virtually always null" in the current version, so it is self-certifying current state, not history — and there is no query language, no permission language, and no multi-typing.

**Postgres row-level security is the boring, correct answer to uniform filtering.** Policies are boolean expressions in the query language itself, applied by rewriting, so a count sees the filtered set automatically. Its own documentation warns about leaks via non-leakproof functions and covert channels through referential-integrity checks.

## 3. Where search breaks the uniformity

This is the part that is genuinely rare. Elasticsearch's document-level security states outright that it "doesn't affect global index statistics" and that a restricted user "could… count how many inaccessible documents contain a given term." Getting full-text into the *same* filtered evaluator is rarer than the filtering itself — and the search tier behind most such systems is exactly where it leaks.

So the defensible claim is not "uniform filtering" but **one evaluator in which bodies, membership answers, adjacency, links, full-text and counts are all filtered by the same expression**. The unification, not the filtering.

## 4. Permission written in the query language

Precedents exist: Postgres row-level security, Hasura, Fluree's policy-as-query, Meadowcap's capability-as-area, Zero's server-side filters. What none of them does is *name a fragment of the query language, prove it compiles to exactly one request, and define policies as that fragment*.

The closest discipline is Cedar, which deliberately restricts expressiveness so policies are decidable by satisfiability solving — and in July 2026 shipped a Lean-verified symbolic compiler deciding equivalence, subsumption and disjointness. But Cedar is a standalone policy language, not a query-language subset.

One cautionary data point: Zero shipped a declarative query-expression permission system in its 0.x releases and by 2026 had moved to developer-written server-side query filters. Expressive-permission-in-query-language has been tried and walked back at least once.

## 5. Membership intersection as the primary navigation

Distinctive among databases, ancient as an idea. Direct precedents: Willow's Areas; iroh-docs' "multi-dimensional key-value documents"; the semantic-filesystem lineage — MIT's Semantic File System (1991) with query-as-virtual-directory, Xerox PARC's Placeless Documents (1999), BeFS attribute queries, WinFS cancelled in 2006; faceted browsing research; tag filesystems; Ted Nelson's ZigZag, where a cell lies on many independent dimensions. And OLAP has called this dimensions and cells since the 1990s.

No general-purpose transactional store currently ships intersection-of-membership as the default read primitive with traversal demoted to an explicit verb. That framing is genuinely unoccupied — and it should be presented as a revival with a reason rather than an invention, because every prior attempt died for the same cause.

## 6. The graveyard, and why

**Noms** — archived 2021, 7.4k stars. A general-purpose versioned, forkable, syncable store with no familiar query interface and no wedge. The ideas survived only because Dolt reimplemented the prolly tree behind a MySQL wire protocol. *Cause: paradigm sold without an interface.*

**Kuzu** — archived 2025-10-10. Well-engineered embedded property graph database with a company behind it; the company stopped. *Cause: embedded graph databases have users, not buyers.*

**CozoDB** — last release 2023-12-11, last push 2024-12-04, README still claiming active development. *Cause: single-maintainer research project — and proof that landing-page text is worthless as evidence.*

**Endatabas** — last push 2024-06-17. Same idea as a surviving competitor, without the consultancy backing.

**Oso's open-source engine** — deprecated. *Cause: an authorization library that is not in the data path cannot filter data.*

**Permify** absorbed into an identity vendor. **Gel** acquired, server repository silent for eight months. **ElectricSQL** joined a data platform in August 2026, and its earlier declarative permission layer did not survive the rewrite. *Cause pattern: at this layer, distribution beats design; the acquirers wanted teams and developer experience, not the data model.*

**Ceramic/ComposeDB** — typed decentralised graph with schemas and global identifiers; last push 2024-07-26. *Cause: crypto-cycle funding, no non-crypto user.*

**Solid** — protocol frozen at a draft since 2024-05-12. *Cause: governance by committee plus no application that needed it.*

**Willow's reference implementations** — grant-funded spec work with no commercial owner. The specification is excellent and orphaned.

**The faceted lineage** — WinFS cancelled 2006, Haystack ended, Presto and Placeless Documents, ZigZag and Fenfire. *Cause, repeated: intersection navigation requires clean typed metadata on every item, and nobody ever had it. Hierarchy plus full-text search was good enough, and cheaper.* Anything reviving this model must answer where the metadata comes from — which, in 2026, is the one thing that genuinely changed, and where the inferred-versus-declared gate in [`does-structure-pay.md`](does-structure-pay.md) bites hardest.

## 7. Datalog wins as an internal language and loses as a surface

The clearest single data point: **XTDB, a Datalog-first bitemporal database, shipped v2.0.0 on 2025-06-12 built on SQL:2011, and its homepage no longer mentions Datalog at all.** The v2 launch post never explains why. Cozo abandoned; differential-datalog archived; Soufflé alive but slow; Logica compiles to SQL; Materialize's commercial success came precisely from *hiding* differential dataflow behind SQL.

And the most damning non-vendor post-mortem: Rust's borrow-checker rewrite shipped on nightly on 2026-08-06 — **not the Datalog version**. The 2018 Datalog formulation accepted sound code the old checker rejected but was "considerably slower… to the extent that using that implementation… was a non-starter." A test in the repository is titled "add a test showing polonius alpha is not a subset of datalog polonius": the shipped checker has *different semantics*.

Where Datalog genuinely won: static program analysis, and incremental view maintenance. Where it lost: every attempt to make it the language users type.

## 8. What is genuinely uncommon

Each part has precedent; no system was found holding all four of membership-only typing on one primitive, contracts owned rather than published, one-hop permission, and branch-and-commit versioning of the type system itself. The interaction between owner-scoped contracts and branched versioning is where the literature is thinnest and the shipped systems all capitulate — see [`schema-evolution.md`](schema-evolution.md).

Reports: [`abffcf492c6f3d77d`](../../../sweep-2026-08/raw/abffcf492c6f3d77d.md), [`a96d8d0c3161e997c`](../../../sweep-2026-08/raw/a96d8d0c3161e997c.md).
