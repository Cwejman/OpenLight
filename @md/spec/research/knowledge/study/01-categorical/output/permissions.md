# Permissions: the evidence is one-directional

Night makes boundaries architectural: one-hop, non-transitive, judged by the engine under one call context, uniformly across reads, writes, counts, and search. The sweep found this the best-supported design decision in the whole tree — **transitive permission is a documented performance and safety failure, the industry is being dragged toward exactly night's shape, and yet nobody has published the argument for it** — with one careful restatement needed on what "uniform filtering" can claim.

## Transitivity is the documented failure

Google's Zanzibar paper says it in its own words: recursive pointer chasing "has difficulty maintaining low latency with groups that are deeply nested **or have a large number of child groups**" — depth *and* breadth break the walk. Google's fix, Leopard, denormalises the transitive closure at the price the paper states: a single tuple write can yield "tens of thousands of discrete Leopard tuple events," and it is applied only to selected namespaces — even Google did not materialise everything. Check latency runs 3ms median to 93ms at p99.9; the 30× tail is where the deep walks live.

The clone ecosystem confirms it behaviourally: SpiceDB's depth-50 wall doubles as its only cycle detector; OpenFGA is *removing* its depth-25 limit because depth was the wrong metric — "a shallow recursive graph can be more resource-intensive than a deep linear one." **Fan-out, not depth, is the cost** — so "keep hierarchies under N levels" is folklore, and the durable lesson is: any closure you allow, you eventually materialise, and materialising is a fan-out bomb. The commercial answer (AuthZed's Materialize — denormalized permission tables you join against, marketed for "search, analytics… and AI retrieval") is Leopard reinvented, write-amplification included; that marketing is an admission that walk-based systems cannot answer list-time questions.

## The AI didn't create the leak — it enumerated it

Latent transitive permissions were harmless while discovery was manual. An LLM retrieval layer performs the closure exhaustively. The vendors concede this on the record: Microsoft documents that Restricted SharePoint Search "isn't a security boundary," is "not intended or scalable for long-term use," and its own worked example is Copilot surfacing a badly-permissioned budgeting site. Google Drive *removed* the ability to grant less access than a parent folder; Notion "respects the broadest level of access." The industry is being forced, product by product, toward simple inheritance and one-hop semantics — night's model, arrived at by attrition rather than argument.

Related, from the vector side: post-filtering ACLs wrecks recall by construction, and a permission filter is the worst-case predicate for filtered ANN (high-cardinality, per-user, churning) — which is why vendors precompute permission sets. Set-intersection over membership *pre*-filters, which is the right side of that trade.

## What "uniform filtering" can defensibly claim

Precision matters here, because the naive claim is refutable:

- Against Zanzibar-family systems, uniform filtering including counts is decisively distinctive — their own docs route list-filtering to small-set lookups or denormalized views.

- Against SQL row-level security it is **not** distinctive at all: RLS policies are predicates in the query language, applied by rewriting, so `count(*)` sees the filtered set by construction. Fluree already does per-datum policy filtering inside query execution for a knowledge graph.

- The genuinely rare part is **full-text search under the same filter**: Elasticsearch's document-level security states outright that it doesn't affect index statistics and that a restricted user can count inaccessible documents containing a term — and it is the search tier behind most such systems.

So the defensible sentence is the *unification*: **one evaluator in which bodies, membership answers, adjacency, links, full-text, and counts are all filtered by the same expression** — not the filtering itself.

One further edge remains unclaimed anywhere: **permission written as a named, decidable fragment of the query language with a single-request guarantee.** Postgres, Hasura, Fluree, and Meadowcap each have pieces; Cedar has the discipline (deliberately restricted expressiveness, now with formally verified SMT-backed analysis) but as a standalone policy language, not a query-language subset. The composite was found nowhere. A caution rides it: Rocicorp Zero shipped declarative query-language permissions in 0.x and walked back to developer-written server-side filters — expressive-permission-in-the-query-language has been tried and retreated from at least once, for reasons no one has written up.

## Enforcement lives before generation

From the structure stress-test ([`structure.md`](structure.md)): a staged architecture with a checker before execution authority eliminated authorization violations that no prompt discipline touches — a model that reads a row has read it. Memory poisoning results say the same from the other side: screening at read time caught 0 of 360 poisoned writes. Night's placement of boundaries at the engine, before the model, is the placement the 2026 evidence supports.

## Not established

No published argument *for* shallow/non-transitive permission exists — the evidence is behavioural (vendors' retreats), and night would be the first to state the position in print. Also unestablished: any named public breach attributable to Copilot/Glean oversharing (only Microsoft's own hypothetical — treat circulating stories as folklore); independent benchmarks of any Zanzibar clone (all depth-cost numbers are vendor-authored); Foundry's row-level uniformity.

---

*Sources: [`aea19b144c46bfc26`](../../../../sweep-2026-08/raw/aea19b144c46bfc26.md) (Zanzibar verbatim, the clone landscape, the oversharing record — the deepest permission report) · [`abffcf492c6f3d77d`](../../../../sweep-2026-08/raw/abffcf492c6f3d77d.md) (Fluree, Willow/Meadowcap, RLS, Cedar, and the four-claim test) · [`adc9dab44aefdde97`](../../../../sweep-2026-08/raw/adc9dab44aefdde97.md) (the transitivity-rots evidence across knowledge bases).*
