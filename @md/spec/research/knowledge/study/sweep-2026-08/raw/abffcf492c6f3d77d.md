I have enough evidence. Writing the report.

# Competitive landscape: the typed, versioned, permission-governed data layer

*Evidence gathered 2026-08-26. Repo activity via GitHub API (`pushed_at`, release tags); prose claims from vendor docs/blogs with dates. Web-search quota was exhausted early, so this leans on direct source fetches and API queries rather than search-engine summaries — see §7 for what that cost me.*

---

## 1. HEADLINE

- **The claim that "nobody combines version control with knowledge structure" is false, and has been false since 2019.** TerminusDB is exactly that — git-style commits, branches, diff/patch, push/pull over a *schema-constrained JSON-LD document graph* with a Datalog query language. Fluree is a second instance: an immutable ledger of typed RDF facts with time-travel. A survey that found only agent-memory systems was looking at the AI layer, not the database layer.
- **The nearest structural neighbour is not a database at all — it is Willow/Meadowcap.** Willow's "Area" is an intersection of three dimensions (subspace × path-prefix × time range), and Meadowcap capabilities are *granted over Areas* — i.e. the read-permission language and the sync-query language are literally the same expression type. That is the reviewed system's "permission written in the query language" idea, already specified and published.
- **Zanzibar-family authorization does not filter uniformly, and its vendors now say so in marketing.** SpiceDB's own docs route list-filtering to `LookupResources` ("relatively small" sets), `CheckBulkPermissions` (fetch-then-check loops), or **Materialize** — a denormalized permission table you JOIN against. AuthZed's pitch for Materialize is that "search, analytics, entitlement management, and AI retrieval increasingly need continuous access to large, constantly updated sets of denormalized permissions." That is an admission.
- **But uniform filtering including counts is *not* novel — SQL row-level security has done it for a decade,** and **Fluree already does it for a knowledge graph**: a Fluree policy's required field is `f:query`, an ordinary Fluree where-clause, evaluated per-datum during query execution. Same language, inside the engine, over every read. This is the single closest prior art to the reviewed system's permission design, and it deserves to be confronted directly.
- **Search is where uniformity actually breaks.** Elasticsearch document-level security states outright that it "doesn't affect global index statistics" and that a restricted user "could… count how many inaccessible documents contain a given term." Getting full-text into the *same* filtered evaluator is the genuinely rare part — rarer than the filtering.
- **2025–2026 was a consolidation and retreat year at this layer.** Gel (EdgeDB) → Vercel (Dec 2025, repo silent since); ElectricSQL → Databricks (Aug 2026); Permify → FusionAuth; Kuzu archived (Oct 2025); Oso's open-source engine deprecated. Meanwhile Dolt went the other way and productized versioning as a *substrate* under four wire protocols.
- **What a prior survey most plausibly missed:** Willow/Meadowcap, Fluree's policy-as-query, the faceted/semantic-filesystem lineage (MIT SFS, PARC Placeless Documents, ZigZag, Flamenco, Camelis), Palantir's Ontology, and Dolt's 2026 expansion into document and embedded versioned stores.

---

## 2. THE MAP — organised by what the primitive actually is

**Primitive = an immutable fact (datom/triple), time is intrinsic.**
Datomic (Pro 1.0.7705, 2026-07-10; Nubank reported ~2.5bn transactions/day at Clojure/Conj 2025 — *alive, vendor-driven, closed-source-but-free*); Datascript 1.8.1 (2026-08-15) and Datahike (pushed 2026-08-26, *alive-niche*, has branches); Datalevin (2026-08-25); Fluree v4.1.6 (2026-08-20); XTDB v2.2.0-rc1 (2026-08-06, GA'd v2.0 on **2025-06-12**). Proves: retraction-free history and as-of reads are production-viable. Learned: bitemporality sells to compliance buyers, not to knowledge-work buyers.

**Primitive = a content-addressed tree of rows, versioned like a repo.**
Dolt (v2.3.1, 2026-08-19; 24.3k stars) — prolly trees, real merge, and in 2026 **Doltgres 1.0** (2026-08-06), **DoltLite** (versioned SQLite) and **DumboDB** (MongoDB 8.0 wire protocol, pre-1.0). Noms (archived, last push 2021-08-27) is the dead ancestor whose prolly-tree design Dolt inherited. Irmin (3.11.0, 2025-06-19; push 2026-04-15) is the OCaml/MirageOS analogue, *alive but maintenance-mode*. Proves: git semantics over structured data is engineerable and commercially durable. Learned: sell it as a familiar interface, not a new paradigm.

**Primitive = a typed document/object in a schema'd graph, with commits.**
TerminusDB — v12.0.0 (2025-12-02), v12.0.7 (2026-08-10), README now reads *"Now with new maintainers and an enterprise version"* after a 12-month release gap (v11.1.12 Mar 2024 → 11.1.13 Mar 2025); commit history in 2026 is essentially one person. `terminusdb.com` returns HTTP 522. Grade: **alive-niche and fragile**. This is the closest existing product to "versioned typed knowledge store".

**Primitive = a strongly-typed object with declared links.**
Gel/EdgeDB (v7.0 2025-11-05; **last commit on the main repo 2025-12-24**, three weeks after "Gel joins Vercel" on 2025-12-02) — *stalled as an independent OSS server*. TypeDB (3.12 as of mid-2026, active blog through 2026-08-25) — full subtyping, roles, rules. Palantir Foundry Ontology — the commercial incumbent of "typed object layer over everything".

**Primitive = a namespace/path/time coordinate, replicated peer-to-peer.**
Willow + Meadowcap (spec complete; **reference implementations stalled** — willow-js last push 2025-03-26, n0-computer/willow-rs 2025-01-17). iroh-docs — "multi-dimensional key-value documents", namespace keypair *is* the write capability; split out of iroh core, which shipped 1.0 (2026-06-15) as a pure networking library. ATProto — Lexicon typed records, DNS-rooted NSIDs, AT-URIs, MST repos with signed commits (**but `prev` is "virtually always null" in v3 — a moving head, not a commit DAG**). Solid — protocol still v0.11.0 draft (2024-05-12). Nostr, Matrix: event logs, no type contracts worth the name.

**Primitive = a relationship tuple, consulted per check.**
SpiceDB (v1.56.0, 2026-07-24), OpenFGA (v1.19.0, 2026-08-25), Permify (absorbed into FusionAuth), Oso (`osohq/oso` description now literally "Deprecated: See README", last push 2025-02-26), Cedar (v4.12.0 + **cedar-policy-symcc v0.6.0**, both 2026-07-28), OPA (v1.19.1, 2026-08-17).

**Primitive = a row plus a predicate, in one query plan.**
Postgres RLS; Hasura row permissions ("generally these are the same operators that you use to filter query results"); Rocicorp Zero, whose current docs say read permissions "are filter-based" and are applied by the server adding "extra filters to enforce permissions that the client query does not."

**Primitive = a table/branch in a catalog.** lakeFS (2026-08-19), Nessie (2026-08-26), Iceberg branches, plus 2026 newcomers Penca ("version-controlled lakebase for AI applications", 2026-08) and T4. Git-for-data has migrated to the lakehouse, away from the knowledge layer.

---

## 3. NEAREST NEIGHBOURS

**1. Fluree — 80% of the permission design, already shipped.**
*Matches:* immutable ledger with time-travel; typed data via JSON-LD + SHACL; and critically, **policy is a query**. The docs: "policy logic is transacted *as data* into the ledger itself"; the one required policy field is `f:query`, a where-clause; policies are targeted at subjects/properties (themselves optionally where-clauses) and evaluated per-datum against "any flakes that are pulled out of an index during query execution." Special bindings `?$this` and `?$identity` make it viewer-relative. Because filtering happens at datum level *inside* execution, aggregates over a filtered set follow for free.
*Diverges:* RDF triples, not typed key-maps with a contract chunk; no branch DAG (linear ledger); no set-algebraic navigation surface; no cross-store attach; policy is a list of rules with target/required semantics rather than a single expression in a named decidable fragment; full-text is not the retrieval story.

**2. Willow + Meadowcap — the intersection-as-permission idea, formalised.**
*Matches:* an "Area" is precisely an intersection over three dimensions (subspace-or-any × path prefix × time range); capabilities carry a "granted area" **expressed in the identical formalism used throughout the sync protocol**; delegation restricts by narrowing the Area; non-transitive by construction; namespaces are independent stores with globally unique ids.
*Diverges:* three fixed dimensions, not arbitrary membership; no types, no bodies, no contracts; no query language beyond range/prefix selection; no full-text; capabilities are cryptographic tokens held by the *reader*, not a server-side expression. And it is **research infrastructure without a maintained implementation**.

**3. TerminusDB — the version-control-plus-knowledge-structure claim, refuted.**
*Matches:* commits, branches, diff/patch, push/pull/clone, time-travel to any commit; schema constraints over JSON/JSON-LD documents; Datalog (WOQL) plus GraphQL.
*Diverges:* access control is **resource-scoped capability grants** (organisation/database level, actions like `instance_read_access`) with no document-level filtering — the exact opposite of viewer-side uniform filtering. Navigation is graph traversal and path queries. No federation-by-attach. Institutionally fragile.

**4. Dolt — the versioning substrate, done as infrastructure.**
*Matches:* every write is a commit with a parent; branches are movable pointers; nothing is destroyed; and in 2026 the same storage engine now sits under MySQL, Postgres, SQLite and MongoDB interfaces — versioning as a property of the substrate, not the product.
*Diverges:* no knowledge structure at all; permissions are ordinary SQL grants; retrieval is SQL.

**5. Palantir Foundry Ontology — the commercial incumbent nobody in this discourse names.**
*Matches:* typed object types with declared link types over heterogeneous stores; markings as conjunctive mandatory controls that **remove resources from search and browse**, not merely from read; markings propagate automatically through lineage; discretionary roles layered on top; branch-based ontology change management.
*Diverges:* an enterprise platform, not a primitive; permission is a marking/role system, not a query expression; whether row-level granular policies filter aggregates uniformly I could not verify (see §7).

**6. ATProto — typed records, user-owned stores, global ids.**
*Matches:* Lexicon gives records a globally-resolvable type identifier rooted in DNS; records carry `$type`; each account owns a repository; AT-URIs address records globally across independent servers; content-addressed MST.
*Diverges:* **no commit DAG** (`prev` null in v3 — self-certifying current state, not history); one type per record and no multi-typing; no unions of fields; no query language, no permission language (everything in a repo is public; private data is out of band); no cross-repo containment semantics.

**7. Postgres RLS / Hasura — the boring, correct answer to "uniform filtering".**
*Matches:* policies are boolean expressions in the query language itself, applied by rewriting, so `count(*)` sees the filtered set automatically; Hasura's permission expressions reuse the query operators and can traverse relationships.
*Diverges:* per-table, not per-object; the Postgres docs themselves warn about leaks via `leakproof` functions and covert channels through referential-integrity checks; Hasura gates aggregation with a separate `allow_aggregations` switch rather than deriving it; no versioning, no typed knowledge layer, no full-text unification.

**8. Jazz / Ink & Switch Keyhive — permission as a data-model property, local-first.**
*Matches:* permission is attached to values via groups with roles, groups extend other groups, enforcement is cryptographic, and CoValues retain edit history; both active (2026-08).
*Diverges:* no query language, no typed contracts on membership, no full-text, no server-side filter expression — access is key possession.

---

## 4. THE FOUR CLAIMS, TESTED

**(a) Version control combined with knowledge structure — NOT distinctive.** TerminusDB (branches + merge over a schema'd document graph) and Fluree (ledger + SHACL + time travel) both do it and both are alive in 2026. Dolt does version control without knowledge structure; Datomic/XTDB do history without branches. What *is* rare: a branch DAG plus knowledge structure plus permission in one evaluator, and versioning applied to a personal/organisational knowledge corpus rather than to operational or analytical tables. Claim the conjunction, not the pair.

**(b) Membership intersection rather than edge traversal as the primary navigation — distinctive among databases, ancient as an idea.** Direct precedent: Willow Areas; iroh-docs' "multi-dimensional key-value documents"; the semantic-filesystem lineage (MIT Semantic File System's query-as-virtual-directory, 1991; Xerox PARC Placeless Documents, 1999; BeFS attribute queries; WinFS, cancelled 2006); faceted browsing research (Flamenco; Camelis / Logical Information Systems, built on formal concept analysis); tag filesystems (TMSU, 2.2k stars, last push 2025-11-12); Ted Nelson's ZigZag, where a cell lies on many independent dimensions. And OLAP has called this "dimensions" and "cells" since the 1990s. No *general-purpose transactional store* currently ships intersection-of-membership as the default read primitive with traversal demoted to an explicit verb — that framing is genuinely unoccupied. But present it as a revival with a reason, not an invention; every prior attempt died (§5).

**(c) Uniform filtering including counts and search — the strongest claim, but needs restating.** Against Zanzibar-family systems it is decisively distinctive: SpiceDB and OpenFGA both document list-filtering as viable only for "small object collections", and the escape hatches are check-then-filter loops or a denormalized materialized view. Against SQL it is not distinctive at all — RLS filters aggregates by construction. Against knowledge stores, Fluree already does per-datum policy filtering inside query execution. The part almost nobody achieves is **full-text search under the same filter**: Elasticsearch DLS explicitly leaks term counts and index statistics, and it is the standard search tier behind most such systems. So the defensible sentence is: *one evaluator in which bodies, membership answers, adjacency, links, full-text and counts are all filtered by the same expression* — the unification, not the filtering.

**(d) Permission written in the query language's decidable single-request subset — partially distinctive, and the sharpest remaining edge.** Precedents: Postgres RLS (SQL predicate), Hasura (query operators), Fluree (`f:query`), Meadowcap (capability = Area = sync-query region), Zero (filter-based, applied by the server). What none of them do is *name a fragment of the query language, prove it compiles to exactly one request, and define policies as that fragment*. The closest thing to that discipline is Cedar, which deliberately restricts expressiveness so policies are SMT-decidable — and in July 2026 shipped `cedar-policy-symcc` (Lean-verified symbolic compilation to SMT-LIB, deciding equivalence, subsumption, disjointness). But Cedar is a standalone policy language, not a query-language subset. The composite — *query fragment, single-request guarantee, policy identity* — I found nowhere. Note the cautionary data point: Rocicorp Zero shipped a declarative ZQL-expression permission system in its 0.x releases and by 2026 had moved to developer-written server-side query filters. Expressive-permission-in-query-language has been tried and walked back at least once.

---

## 5. THE GRAVEYARD, AND WHY

- **Noms** (archived; last push 2021-08-27, 7.4k stars). A general-purpose versioned, forkable, syncable store with no familiar query interface and no wedge; the team was acquired and the ideas survived only because Dolt reimplemented the prolly tree behind a MySQL wire protocol. *Cause: paradigm sold without an interface.*
- **Kuzu** (archived 2025-10-10). Well-engineered embedded property graph DB with a company behind it; the company stopped. *Cause: embedded graph databases have users but not buyers.*
- **CozoDB** (last release 2023-12-11, last push 2024-12-04, README still claims active development). *Cause: single-maintainer research project; also proof that landing-page text is worthless as evidence.*
- **Endatabas** (last push 2024-06-17) — "SQL document database with full history". *Cause: same idea as XTDB, without XTDB's consultancy backing.*
- **Oso open source** (deprecated; last push 2025-02-26). *Cause: an authorization library that isn't in the data path cannot filter data; the value moved to a hosted service that generates SQL filters.*
- **Permify** — absorbed into FusionAuth. **Gel/EdgeDB** — a superb type system on a non-SQL query language, acquired by Vercel (2025-12-02), server repo silent for eight months. **ElectricSQL** — joined Databricks (2026-08-11); its earlier declarative permission layer did not survive the rewrite, and current Electric is sync/streams/agents with no permission system. *Cause pattern: at this layer, distribution beats design; the acquirers wanted teams and DX, not the data model.*
- **Ceramic/ComposeDB** (js-composedb last push 2024-07-26) — typed decentralized graph with schemas and global ids. *Cause: crypto-cycle funding, no non-crypto user.*
- **Solid** — protocol frozen at v0.11.0 draft since 2024-05-12. *Cause: governance-by-committee plus no application that needed it.*
- **Willow reference implementations** (willow-js 2025-03, willow-rs 2025-01) — grant-funded spec work with no commercial owner; the spec is excellent and orphaned.
- **The faceted lineage**: WinFS (cancelled 2006), Haystack (MIT, ended), Flamenco, Presto/Placeless Documents, ZigZag/Fenfire. *Cause, repeated: intersection navigation requires clean typed metadata on every item, and nobody ever had it. Hierarchy plus full-text search was good enough, and cheaper.* Anything reviving this model must answer where the metadata comes from — which, in 2026, is the one thing that genuinely changed.

---

## 6. WHAT MOVED IN 2025–2026

1. **Dolt turned versioning into a substrate**: Doltgres 1.0 (2026-08-06), DoltLite (versioned SQLite), DumboDB (MongoDB wire protocol, pre-1.0) — one prolly-tree engine, four interfaces. The strongest commercial evidence yet that "versioned" is a property of storage, not a product category.
2. **XTDB 2.0 GA'd 2025-06-12**, then 2.1 (2025-12-01) and 2.2 RCs (2026-08); bitemporal SQL is now ordinary.
3. **Datomic remains alive under Nubank** — Pro 1.0.7705 shipped 2026-07-10, though the blog has posted twice in two years.
4. **TerminusDB was resurrected** — a year-long release gap, then v12.0.0 (2025-12-02) under new maintainers, v12.0.7 (2026-08-10); the marketing site is down.
5. **Fluree repositioned** from verifiable-graph-database to "Enterprise AI Data Platform" with MCP integration, keeping policy-as-query.
6. **Authorization vendors conceded list/search**: AuthZed shipped and marketed **Materialize** (denormalized permission views for "search, analytics, entitlement management, and AI retrieval").
7. **Cedar shipped verified decidable analysis** (`cedar-policy-symcc` v0.6.0, 2026-07-28) — the policy world's answer to "make the language small enough to reason about".
8. **Consolidation**: Gel→Vercel, Electric→Databricks, Permify→FusionAuth, Kuzu archived, Oso OSS deprecated.
9. **Git-for-data migrated to the lakehouse catalog** (lakeFS, Nessie, Iceberg), plus 2026 entrants Penca and T4 — none of them touching knowledge structure.
10. **Agent memory went graph-shaped but stayed embedding-first** (Graphiti ~30k stars, Cognee ~30k, both pushed 2026-08). Structural, typed, permissioned substrates for agents remain conspicuously thin — which is where this project's opening is.

---

## 7. WHAT I COULD NOT ESTABLISH

- Whether Foundry's **granular row-level** permissions filter aggregations and counts uniformly. Palantir's ontology-security doc URLs 404'd; I could only confirm that *markings* are conjunctive, propagate via lineage, and remove resources from search and browse.
- Sanity's Content Lake access-control semantics (docs pages 404'd) — whether there is a GROQ-filter-based permission layer and whether it covers counts.
- The exact release and rationale for **Rocicorp Zero dropping its declarative ZQL permission DSL**; current docs describe filter-based permissions applied in query endpoints, and 0.x release notes reference permissions features, but I found no deprecation statement.
- Whether **ElectricSQL** formally announced removal of its DDLX permission language; no blog post covers it.
- **Gel's** post-acquisition open-source roadmap — the eight-month commit gap is inference, not a statement.
- Fluree's documented behaviour for **count/aggregate** queries under policy (I inferred it from per-datum filtering during index scan).
- Unlaunched or stealth 2026 startups in this niche: the YC directory API was unavailable and web search quota was exhausted, so §6's startup coverage is thinner than it should be.

---

## 8. LEADS

1. https://docs.datomic.com/releases-pro.html — Datomic Pro 1.0.7705, 2026-07-10: still shipping.
2. https://github.com/xtdb/xtdb/releases — v2.0.0 GA 2025-06-12, v2.2.0-rc1 2026-08-06.
3. https://www.dolthub.com/blog/ — Doltgres 1.0 (2026-08-06), DoltLite, DumboDB.
4. https://github.com/dolthub/dumbodb — versioned MongoDB-wire document DB on Dolt's engine.
5. https://github.com/terminusdb/terminusdb — v12.0.7 (2026-08-10), "new maintainers", release gap Mar 2024→Mar 2025.
6. https://terminusdb.org/docs/access-control/ — capabilities are org/database-scoped; no document filtering.
7. https://github.com/fluree/developers-site/blob/main/docs/reference/policy-syntax.mdx — `f:query`, `?$identity`, per-datum policy evaluation.
8. https://willowprotocol.org/specs/grouping-entries/index.html — Areas as three-dimensional prefix intersections.
9. https://willowprotocol.org/specs/meadowcap/index.html — capabilities granted over Areas, "the identical formalism" as sync.
10. https://github.com/n0-computer/iroh-docs — multi-dimensional key-value documents; namespace key as write capability.
11. https://atproto.com/specs/repository — MST + signed commits, `prev` "virtually always null" in v3.
12. https://authzed.com/docs/spicedb/getting-started/faq — LookupResources for "relatively small" sets; Materialize for search/analytics.
13. https://www.elastic.co/guide/en/elasticsearch/reference/current/document-level-security.html — DLS leaks term counts and index statistics.
14. https://www.postgresql.org/docs/current/ddl-rowsecurity.html — policies as SQL predicates; leakproof and covert-channel warnings.
15. https://github.com/cedar-policy/cedar/tree/main/cedar-policy-symcc — Lean-verified SMT compilation; decidable equivalence/subsumption (v0.6.0, 2026-07-28).
