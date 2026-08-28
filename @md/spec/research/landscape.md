# Landscape — where OpenLight stands

*Research register: structured, uncommitted, nothing binding. Rewritten whole 2026-08-26 from a thirteen-agent sweep; supersedes the April 2026 survey, whose headline claim was false when written. Every figure here is one agent's reading of a primary source unless marked otherwise; the method note at the end says what that is worth.*

## Why this file was rewritten

The April survey asked "who else builds agent memory?" and answered it well. Then it concluded — about the **database** layer — that "no system in the landscape combines version control with knowledge structure." That was false in April and had been false since 2019. Looking at one layer and ruling about another is the failure this rewrite exists to correct, and the rule it yields is worth keeping: **a landscape is drawn per layer, and a claim of novelty is only as good as the layer it was tested in.**

What survives of the April record: its six cross-cutting findings are sound *as observations about agent memory* — temporal validity, system time versus event time, query intent routing to structural views, scope isolation, graph decay, context pollution. What it missed is listed under *What April missed* below.

## The corrections

- **"Nobody combines version control with knowledge structure" — false.** TerminusDB has git-style commits, branches, diff/patch and push/pull over a schema-constrained JSON-LD document graph with a Datalog query language. Fluree is a second instance: an immutable ledger of typed facts with time travel. TerminusDB went a year without a release, returned under new maintainers (v12.0.7, 2026-08-10), and its marketing site currently returns HTTP 522 — alive-niche and institutionally fragile. **That is what happened to this exact idea.**

- **"No system uses set-intersection scoping" — true of databases, false of the wider record.** The idea is ancient and has died repeatedly: MIT's Semantic File System (1991), Xerox PARC Placeless Documents (1999), WinFS (cancelled 2006), Flamenco, Camelis, TMSU, Nelson's ZigZag, and OLAP's dimensions-and-cells since the 1990s. Willow's *Areas* — intersections over subspace × path-prefix × time — are the live formal version.

- **Uniform boundary filtering is not novel against SQL.** Postgres row-level security has filtered aggregates by construction for a decade; Fluree's policies are literally queries (`f:query`) evaluated per-datum inside execution, so aggregates follow for free. It *is* decisive against the Zanzibar family.

- **Anthropic shipped much of the agent-memory layer as product inside the April survey's own window** — memory stores public beta 2026-04-23, with paths as addresses, immutable versions attributed to the session, filesystem-enforced read/write access, and a redact endpoint preserving the audit trail. Google's Memory Bank shipped memory revisions plus IAM-conditioned access. Letta, the flagship of the memory-OS thesis, retired its own server and pivoted to a coding-agent harness.

## The map, by layer

**Substrate.** Versioned/immutable: Datomic (Pro 1.0.7705, 2026-07-10, alive under Nubank), XTDB (2.0 GA 2025-06-12), Dolt (turned versioning into a substrate in 2026 — one prolly-tree engine under MySQL, Postgres, SQLite and MongoDB wire protocols), Fluree, TerminusDB, Irmin (maintenance). Dead or absorbed: Noms, Kuzu, CozoDB, Endatabas, Gel/EdgeDB → Vercel, ElectricSQL → Databricks, Triplit → Supabase, Permify → FusionAuth. Git-for-data migrated to the lakehouse catalog (lakeFS, Nessie, Iceberg) and left the knowledge layer behind.

**Permission.** Zanzibar family (SpiceDB, OpenFGA, Cedar, OPA) gates object access and **cannot filter lists, search and counts uniformly** — SpiceDB routes list-filtering to `LookupResources` ("relatively small" sets), fetch-then-check loops, or *Materialize*, a denormalised permission table. Zanzibar's own paper names transitive membership as the hard problem; OpenFGA is now removing depth limits because fan-out, not depth, is the real cost. Elasticsearch document-level security explicitly leaks term counts and index statistics. Cedar shipped Lean-verified SMT decidability (2026-07-28) by making the policy language small.

**Agent memory / harness.** Absorbed from above (Anthropic, Google). Third-party survivors converged within six weeks of each other on the one thing the labs structurally cannot build: memory *across* harnesses. Benchmarks collapsed as evidence — controlling for retrieval budget erases Graphiti's LoCoMo lead; some memory systems never break even against resubmitting the transcript within 400 turns; and a lexical turn-level index with a keyword loop matches graph memory on MemoryAgentBench.

**Interface.** Server-driven UI is shipped and adopted (Airbnb Ghost Platform, Plaid, DoorDash, Lyft, Shopify) and every instance dispatches by a **pinned discriminator, not a query**. MCP Apps (SEP-1865) reached Stable 2026-01-26, absorbing OpenAI's Apps SDK and MCP-UI; its unit is an opaque sandboxed HTML iframe with no props schema. Product view layers (Notion, Airtable, Tana, Anytype) all pair an extensible instance schema with **closed view-kind enums**, and none lets you define a new *property type* either.

## Nearest neighbours

| System | Where it matches | Where it diverges | Grade |
|---|---|---|---|
| **Fluree** | Policy *is* a query, transacted as data, evaluated per-datum inside execution; immutable ledger; typed via JSON-LD + SHACL | RDF triples not typed key-maps; linear ledger, no branch DAG; no set algebra; no cross-store attach | ~80% of the permission design, shipped |
| **Willow / Meadowcap** | Capabilities granted over *Areas* — intersections — in the identical formalism as the sync query; non-transitive by construction; independent namespaces | Three fixed dimensions; no types, bodies or contracts; capabilities are reader-held tokens, not server-side expressions | Spec complete, implementations orphaned since early 2025 |
| **TerminusDB** | Commits, branches, diff/patch, push/pull, time-travel over a schema-constrained document graph | Access control is org/database-scoped capability grants — no document-level filtering | The closest existing product; fragile |
| **Ink & Switch Patchwork** | Component-as-declaration with `supportedDatatypes`, mount-as-call, renderer chosen by querying declarations, and the pick *pinned* on the document | Research platform; no confirmed user outside the lab | Convergent validation of `view.md` |
| **WordPress Gutenberg** | A runtime component registry that answers "what can render this?" — `getPossibleBlockTransformations`, `findTransform` with highest-priority match; `parent`/`ancestor`/`allowedBlocks` containment contracts | Welded to one CMS | The pattern, shipped at scale |
| **Uber Screenflow** | A DSL that was a restricted subset of TypeScript, compiled to an IR, with definition files carrying types and defaults; CI recompiled every screen against every shipped runtime version | — | **Abandoned.** ~16 flows in two years; department shut down July 2020 |
| **Palantir Ontology** | Typed object and link types over heterogeneous stores; markings remove resources from search and browse, not merely from read; propagate via lineage; branch-based ontology change | An enterprise platform, not a primitive; permission is markings and roles, not a query expression | The only one at national scale |
| **ATProto** | Typed records with globally resolvable type identifiers; user-owned repos; global ids; full-compatibility evolution discipline | **No commit DAG** (`prev` virtually always null in v3); one type per record; no query or permission language | The federation reference design |
| **Pentad Labs** | A fact as a five-slot atom carrying *context* and *lineage*, "rather than burying context within narrative transcripts" | Essay plus pre-release product | Closest single statement of the provenance claim |

## The distinctiveness claims, scored

1. **Version control + knowledge structure — not distinctive.** Claim the *conjunction*: branch DAG **plus** knowledge structure **plus** permission in one evaluator, applied to a personal or organisational corpus rather than to operational tables.

2. **Intersection over traversal — distinctive among databases, ancient as an idea.** Present it as a revival with a reason. The reason must be that the metadata problem which killed the lineage is newly tractable — see *The metadata question* below.

3. **Uniform filtering including counts — restate as the unification.** Not distinctive against SQL; decisive against Zanzibar. The genuinely rare part is **full-text search under the same filter**.

4. **Permission as the query language's decidable single-request subset — the sharpest remaining edge.** Precedents exist (RLS, Hasura, Fluree, Meadowcap, Zero) but none *names a fragment, guarantees single-request lowering, and defines policy as that fragment*. **Warning: Rocicorp Zero shipped a declarative query-expression permission system and walked it back to developer-written server-side filters.** It has been tried and abandoned once.

5. **Renderer chosen by querying declarations against content type — not shipped at scale anywhere.** Every server-driven-UI system pins a discriminator. Only Gutenberg and Patchwork do the bid, neither at scale.

6. **Property types as data rather than protocol enums — nobody does this.** Anytype's `RelationFormat` (15), `ObjectType.Layout` (28) and `Dataview.View.Type` (6) are closed protobuf enums; Airtable's `FieldType` is a 33-member TS enum; Notion's view config is discriminated across ten types. A closed vocabulary as `ref(X)` over owned value chunks is genuinely unoccupied ground.

7. **Provenance over the changed data itself — the one thing left standing.** Anthropic and Zep now answer "which run wrote this" *within the memory store*. Nothing answers it for the world: which run edited this file, this row, this ticket, under what permissions, from what context. Agent observability (LangSmith, Braintrust, Weave, Arize, OTel GenAI) is **tracing** — an append-only record beside the change, joined by convention, not carried by the changed artifact.

## The verdict on the thesis

From an adversarial pass instructed to refute:

> The claim survives in half, and the half it loses is the half stated most confidently. **"Typed structure is the right substrate" holds** — for identity, permission, provenance, freshness, address and action space, and only when types are **declared or deterministically observed, never inferred at breadth**. **"Text-as-medium must be superseded" is refuted.** Every 2026 system that won typed the *edges* around a prose or code body, not the body.
>
> **Type the edges, keep the vocabulary tiny and declared, and leave the content as text.**

The substrate already does this — bodies hold prose, instance contracts stay open, typing goes as deep as archetypes are named, the five connection kinds are edges. It is the README's rhetoric, not the design, that the evidence corrects.

### The decision rule

Structure wins if **any** holds: (1) the rule must be enforced *before* generation; (2) the query is a set operation — intersect, count, aggregate, "all items where"; (3) multiple writers with no coordinator; (4) it must be answerable later by someone who was not there; (5) cost is proportional to catalog size. **The hard gate overriding all five: if the type must be *inferred* rather than observed or declared, do not type it.**

Corollaries: type the edges, not the content · keep the vocabulary tiny and declared (Memanto's 13 categories, ReAct-SQL's 15 operations, schema.org's 12 real types out of 958) · structure is only worth it if the system can abstain, and **abstention must be code-enforced, not prompt-requested**.

### The metadata question

The faceted lineage died because clean typed metadata could not be produced. 2026 can produce metadata cheaply at roughly 20–50% precision unless gated: a model reconstructing column semantics scores 0.223 at 94% coverage, and 0.475 on the 42% it commits to inside a deterministic harness — "a competence detector, not a competence amplifier." Extraction against a 369-field schema yields **0% valid output across every frontier model**; schema *breadth* is the degradation axis.

But the distinction is sharp: **induced vocabularies lose; small declared vocabularies win.** Constrained mediation with no unconstrained generation beats direct LLM ontology building 0.85 to 0.63 on competency coverage; thirteen predefined memory categories with no entity extraction beat graph and vector systems; a governed semantic layer takes enterprise text-to-SQL from 55.3% to 97.4%.

So the revival is justified **only for declared structure**, and the "why now" is that models can *assist* declaration and *populate* a small declared vocabulary — not that they can induce one.

## The graveyard, and what killed each

- **Noms** — a versioned, forkable store with no familiar query interface. *Paradigm sold without an interface.* Dolt survived by reimplementing the same prolly tree behind a MySQL wire protocol.
- **Uber Screenflow** — the closest anyone came to this project's interface model. *~16 flows in two years; the department was shut down.*
- **Cambria** — bidirectional lenses for schema migration. Marked "Completed, 2020"; no successor. Its own essay concedes its flagship `convert` operator "can't guarantee a useful consistency relation" — i.e. is not a lens.
- **WinFS and the faceted lineage** — *the metadata problem*, repeated five times.
- **Spotify HubFramework** archived; **Nubank/Zup Beagle and Nimbus deleted outright**; **HASH's Block Protocol v0.4** suspended.
- **Acquisition pattern** — Gel, Electric, Triplit, Permify. *At this layer, distribution beats design; acquirers wanted teams and DX, not the data model.*

## Constraints to design against

- **Schema evolution is the confessed unsolved problem.** Every production survivor bought safety by *forbidding*, not translating: Protobuf never reuses field numbers and killed `required`; Datomic "can never alter `:db/valueType`"; ATProto "types can not change, fields can not be renamed" and escapes via a new name. Rocicorp Zero's default handler for schema change **reloads the page**. The bidirectional-transformation literature proves the composition law you would need (PutPut) fails "for reasons that seem pragmatically unavoidable."
- **Recursive component trees fight field-selection query languages.** DoorDash's recursive model made GraphQL "close to impossible or at the best case scenario inefficient"; Airbnb kept sections flat and listed nesting as future work.
- **The escape hatch becomes a named architectural tier** (Lyft's Semantic Components, DoorDash's untyped `custom`) — and shrinks only when the design system becomes a typed vocabulary.
- **When a component is genuinely new, omission beats degradation.** DoorDash: "fallback components were unnecessary." Shopify shipped the opposite. Fallbacks help for *variations*, not for new kinds.
- **A closed-world serializer plus an open-world vocabulary is a crash** — DoorDash had to migrate off SwiftProtobuf.
- **Files won in 2026 because agents read them.** Logseq's DB rewrite shipped thirteen months late into a market that had re-valued files; Obsidian's Bases keep data "in your local Markdown files and their properties" and are growing. Projection to files must be first-class and two-way, not an export.
- **Formality costs at capture and pays at retrieval, and users discount the future** (Shipman & Marshall, CSCW 1999, unrefuted at 27 years). Typing must be deferrable, partial, and revisable.
- **Hierarchy is a retrieval affordance people actively want** (Bergman et al., ACM TOIS 2008), not merely a filing compromise. Both `code.md` and `substrate.md` currently assert the opposite as settled.

## The strongest opposition

1. **A typed store with wrong types is worse than prose** — a wrong type answers confidently; incomplete prose fails visibly. Prose degrades gracefully; a type does not.
2. **Structure rots silently.** 105 of 105 release transitions invalidated part of a skill set; frontier agents manage 29.9–69.7% F1 at repair. Text rots loudly.
3. **The reader structure was an affordance for is being replaced** — format effects shrink with capability, and at frontier scale the measured content margin of self-correction is zero.

Also standing: **Dynamicland's "to maximize agency, minimize what the computer knows"**, and Litt's "understanding is the new bottleneck." The counter-evidence is that structure costs agency when imposed as an *authoring* tax and buys it when offered as an *inspection surface at decision time* — decomposing agent execution into auditable typed actions improved users' comprehension and error detection, and legibility gains *increase* with monitor strength.

## Timing

Heating commercially, flat foundationally, and the two are not connected. "Context layer" did not exist as a company category before spring 2025 and now names several YC companies; Microsoft entered with Fabric IQ (2025-11-18); Palantir's ontology became a category label competitors position against. Meanwhile Ink & Switch, Dynamicland and the Future of Coding community are working on what they worked on in 2023, largely without AI. The extension-mechanism pendulum has swung away from hand-authored schemas twice — and *toward* typed packaging, addressing, caching and authorization, which is what MCP's 2026-07-28 revision did while shedding sessions, the handshake, roots, sampling and logging.

## What is not established

- **The crux experiment does not exist**: nobody has run LLM-assisted, human-*declared* structure against a well-written prose document, same corpus, same frontier reader. Every cited win beats an *extracted* or *unstructured* baseline, never a good prose one.
- Whether Airbnb's Ghost Platform still exists in its 2021 form; whether its Figma/WYSIWYG roadmap shipped.
- Whether Palantir's row-level permissions filter aggregates uniformly (docs 404'd).
- Whether any Patchwork tool has a user outside the lab.
- Ted Nelson's and Dynamicland's current status.
- Funding and adoption figures throughout — stars and commits are activity, not usage.

## Method note

Thirteen parallel agents, deliberately not bootstrapped on this repo — they were briefed in writing and told to report the world in its own words, so their findings are not our vocabulary reflected back. Several exhausted web-search quotas and fell back to direct fetches of primary sources (arXiv, GitHub, npm, SEC, W3C), which over-samples things with public repos and changelogs and under-samples blogs, conference talks and non-English material.

**Two agents independently caught automated summarisers fabricating verbatim quotations and sample sizes** — one invented "N=22, 10 companies" for a paper whose real figures are 271 observations / 122 transfers / 8 companies. Every load-bearing number above was re-verified from primary text by the agent that reported it; anything that could not be is marked. Treat unmarked figures as single-source until a second head checks them.
