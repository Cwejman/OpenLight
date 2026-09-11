# The semantic web lineage, and what it settled

Two agents read the formal-knowledge-representation tradition at source. The lineage splits into three things with three different fates: the vision failed, the vocabularies succeeded narrowly, and the reasoning layer lost to the validation layer. Several of its hard-won design decisions are directly usable.

## 1. The vocabulary outgrows its use by two orders of magnitude

Schema.org published a usage-statistics dataset on 2026-06-04, covering May 2026: **958 types, 4,587 properties**, of which **12 types (1.3%) reach 10 million or more domains** and roughly **77% of the vocabulary sits below 1,000 domains**. About 47 types account for essentially all high-volume deployment.

Corroborating from a governed, principle-enforcing registry: the OBO Foundry holds **266 entries — 190 active, 71 inactive, 5 orphaned**. **Twenty-nine percent of a curated biomedical ontology registry is dead.**

The consequence cuts both ways. A closed vocabulary of a dozen types is defensible on evidence, not just taste. But the long tail did not vanish — it moved into someone else's namespace, which relocates the modelling cost to integration time, where it becomes the ontology-alignment problem.

**One correction belongs here, because it retires a difference people claim to have from RDF.** RDF has **no global predicate vocabulary** — everyone mints namespaces already. Scoping contracts to owners is therefore not a departure from RDF; it is what RDF does. What RDF failed at was that the resulting per-owner vocabularies never aligned, and alignment was never automated. Anyone whose design note says "unlike RDF, our contracts are owner-scoped" is naming a non-difference and inheriting the alignment problem in full.

## 2. Transitive subtyping is the thing that rots

Patel-Schneider & Doğan (arXiv:2411.15550) measured a live collaborative knowledge base: roughly **2.39 million classes simultaneously marked first- and second-order**, and 1,919,685 problematic split-order pairs, plus 120 instance loops. Root cause: "editor misunderstandings of instance-of and subclass-of."

This is the strongest available argument for a design with no subtype relation and nothing transitive — it removes the single most-reported failure mode of collaborative knowledge bases.

**One standards-body answer went deliberately the other way, and it belongs beside this.** PG-Schema (PACMMOD 2023, arXiv:2211.10962), the property-graph world's schema proposal, chose **explicit multi-inheritance** — a recent, peer-reviewed, deliberate decision in the opposite direction from the one the Wikidata evidence argues for. The case below is strong; it is not unopposed.

**And non-transitive hierarchy is proven design, not a novelty.** SKOS, a W3C Recommendation since 2009-08-18, says `skos:broader` is "**only** used to assert a **direct** (i.e., immediate) hierarchical link," with transitivity split into a separate `skos:broaderTransitive`. It survived, is widely deployed in library and government thesauri, and is still the sanest hierarchy design in the stack. Expect to need the opt-in closure eventually for query expansion — which is SKOS's own stated reason for keeping both.

## 3. The standards are unfinished, and this is worse than assumed

**RDF 1.2.** Concepts and Semantics reached Candidate Recommendation on 2026-04-07, with a status note saying advancement was not expected before 2026-05-05. That date passed with no transition. **Every concrete syntax is still a Working Draft** — Turtle, N-Triples, N-Quads, TriG, RDF/XML, RDF Schema — and Concepts cannot exit Candidate Recommendation until at least one concrete syntax does, so it is structurally blocked. The charter targeted Recommendation in Q3 2025.

The design also shifted. RDF-star's quoted triples were usable in subject *or* object position and treated as referentially **opaque**. RDF 1.2 defines triple terms to appear **only as the object** and declares them **transparent**, introducing a separate reification relation — because the community-group design conflated statement-*types* with statement-*tokens* and so could not attach two conflicting provenances to one proposition. Two conformance profiles now exist, Full and Basic, the latter a hedge letting implementers skip the feature entirely.

**SPARQL 1.2.** All twelve documents are Working Drafts. Two have not been touched since December 2024.

**SHACL 1.2.** Six documents, all Working Drafts or First Public Working Drafts, no Candidate Recommendation anywhere, and a charter expiring at the end of 2026.

**GQL**, the property-graph query standard, was published as ISO/IEC 39075:2024 on 2024-04-12 and promptly failed to converge — the leading vendor's own manual lists unsupported mandatory features including session and transaction statements, graph expressions, schema references and reserved-word alignment.

**The lesson: a standard reaching Recommendation means nothing; the syntax layer is where it dies. Do not model on paper standards.**

## 4. Validation is where the tooling went; reasoning is converging back

Download counts are the only evidence in this section, and they include continuous-integration runs and transitive dependencies, so take one figure before any other: **`owlrl`, a reasoning library, pulls about 1.24 million downloads a month, largely transitively** — the same order as the validation library below. That is enough to make any ratio between the two doubtful rather than merely imprecise, and the claim that nobody runs reasoners in production remains **unmeasured folklore**; no deployment census exists.

With that held, the tooling direction is unambiguous. On the validation side: pySHACL at **1,244,632 PyPI downloads in thirty days**, roughly 2.5× in five months (423,194 in March 2026 to 1,056,564 in July); a JavaScript validator at 123,083 monthly; active implementations in the major Java frameworks. On the reasoning side: owlready2 at 91,892 monthly, with Pellet last pushed 2017-01-05, Konclude 2022-05-14, Openllet 2025-08-04.

The structurally telling fact is where W3C put the new inference language. **SPARQL 1.2 RL**, a Working Draft of 2026-08-25, is "a datalog-style rules language for RDF… inferencing with the generation of new RDF data" — and it is being standardised **under the shapes working group, not an OWL working group**. The practical answer to validation-versus-reasoning is turning out to be *rules*, not description logic.

**The canonical argument for it is an interested party's.** Holger Knublauch's *SHACL and OWL Compared* is the clearest statement — OWL's open-world semantics mean a missing required property yields no error; without a unique-name assumption, a maximum-cardinality constraint with two values makes a reasoner *infer* the two identifiers are co-referent; "OWL does not constrain anything but rather describes inferences," so a reasoner adds to the data in an attempt to conform. He is the chief technology officer of a company selling SHACL tooling, and the page has not been updated since 2017. The non-vendor support is thinner: one 2019 study showing practitioners systematically mis-reason about description-logic semantics, which measures comprehension rather than deployment.

And the agent that read this lane declines the verdict its own figures invite. **Convergence rather than victory is the current research posture** — OWL-aware SHACL constraint generation (arXiv:2608.14104, 2026-08-14), validation with reasoning (PVLDB 2024), and a review tracing SHACL from data validation to schema reasoning (2022) all work the join rather than the split. *Paper-only; the tooling ratio is one-sided, the research direction is not.*

## 5. Named production deployments

Verified live during the sweep, and they are all government data catalogues. The European Commission's Interoperability Test Bed runs a hosted validation service covering the EU data-catalogue profile in several variants, plus high-value-dataset, machine-learning, public-service, business-registry and eProcurement profiles, offered over SOAP, REST and command line. The EU open-data portal runs a metadata quality assessment on the same basis. Norway's digitalisation agency runs shape repositories for its national profiles, active mid-2026. An industrial semantic model originating at Bosch and used in an automotive data ecosystem carries 147 SHACL code matches across its organisation. And a schema language widely used in biomedical informatics generates SHACL as an output target.

Shape validation shipped where a regulator needed a conformance check. It did not ship as a general knowledge substrate.

## 6. Scale broke the flagship

Wikidata split its query service in two on 2025-05-09 because 16 billion triples growing by a billion a year made reloads take one to two months and crash unpredictably. The legacy full graph was retired in December 2025, and cross-domain queries now require federation. In October 2025 it added an embedding project.

## 7. Cyc is the precedent for owner-scoped contexts

Cyc consumed roughly **$200 million and 2,000 person-years** for about 30 million assertions. Its *microtheories* exist because each must be free from monotonic contradictions while the whole knowledge base need not be — which is owner-scoped contexts, rediscovered. The lesson is the part usually dropped: **contexts proliferate rather than consolidate**, and Cyc spent 2,000 person-years without resolving it.

## 8. ShEx: alive as a community, dead as a shipping standard

Last formal specification: ShEx 2.1, a Final Community Group Report of 2019-08-09. Never a W3C Recommendation, never had a working group. Its npm package's latest release is an alpha from 2023-11-11 with **379 downloads in a month**, against 123,083 for the SHACL validator — a ratio of about 325 to 1. The repositories are alive and unreleased. Its one genuine deployment, Wikidata entity schemas, holds 461 pages with edits through the week of the sweep.

A folklore warning attaches: a Python ShEx package shows 315,273 monthly downloads, which looks like healthy adoption. It is transitive, riding on an unrelated schema framework.

Reports: [`a8712480bac2a248a`](../../../../../sweep-2026-08/raw/a8712480bac2a248a.md), [`adc9dab44aefdde97`](../../../../../sweep-2026-08/raw/adc9dab44aefdde97.md).
