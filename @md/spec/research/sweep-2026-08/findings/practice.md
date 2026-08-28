# The documentation field's own methods, graded

The code will be compared to the documentation frameworks that already exist — Diátaxis above all — and night's docs will live in a world whose serving layer just flipped to agents. This fold grades the field's methods by their actual evidence, so the code borrows what is real and declines the rest with grounds.

## Diátaxis: the strongest outside challenge, weaker than advertised

Diátaxis is the code's natural rival — it says documentation divides by mode (tutorial, how-to, reference, explanation), where the code says knowledge divides by dive. The sweep's finding: **its site cites no research, no empirical study, and no other theory — grade: opinion** — and, critically, **its author disclaims the file-per-type reading**: "this does not mean that there must be simply four divisions of documentation in the hierarchy"; the typed-file split is the adopters' invention. The one documented literal-blueprint adoption (Google's Pigweed) produced "too much fragmentation" — users wouldn't follow links from tutorial to explanation and so never met the theory — and retreated to *sections within a page*. Its unanswered structural criticism is exactly the code's territory: Diátaxis does not model the entry point. Adoption is real and unmeasured everywhere (Canonical, five years, no metrics; the author deleted his only page on complex hierarchies in 2026 and has replaced it with nothing). What survives as genuinely useful is the *voice* observation — knowing which mode you are writing in makes prose coherent — which is compatible with folds, not a rival to them.

## The retrieval crux: carry hierarchy into the chunk

The best structure-for-retrieval result of 2026 points *against* splitting documents and *for* self-contextualising units: prepending the heading hierarchy to each chunk lifted retrieval +23.8% MRR on a production knowledge base — with a methodological sting (removing the title-chain collapsed human annotator agreement from κ=0.45 to 0.04: the context that helps machines is the context *people* need to even agree what is relevant). Corroborating: re-presenting the same data as human-readable structured cards nearly doubled answer quality versus schema querying — **presentation, not partition**; cross-links are retrieval signal; and semantic-boundary chunking has been repeatedly debunked against plain structural splits. For the code this is direct support for the fold: a unit that carries its own context beats a corpus optimally shredded.

## Minimalism: the only causal evidence, and its real lesson

Carroll's minimal manual is the *only* credible experimental programme showing document design changes user outcomes (meta-analytic d ≈ 1.12 — from 288 total participants, on 1980s word processors, in a never-peer-reviewed meta-analysis co-curated by the theory's authors; grade accordingly). Two things transfer: the field's own suspicion that the active ingredient is **redundancy reduction**, and the canonical misreading to avoid — "minimalism means brevity" is #1 on its authors' misconception list; slashing words while leaving design unchanged is not the method. Minimalist production also measured ~30% *slower* than conventional — quality costs at authoring time. The research line went dormant twenty years ago; citations to it today are ceremonial (Diátaxis cites nothing at all).

## Structured authoring: calcifying, and its AI revival is rhetorical

DITA 2.0 is a decade past its predecessor with, measured on its own repo, **one committer**; the professional body that carried the practice in North America went bankrupt in 2025 (membership 25k → 4.5k); reuse ROI has **no peer-reviewed evidence at all** — the 30–40% figures trace to vendor calculators citing each other; and "structured content is better for AI" has no study behind it — the one widely-echoed percentage traces to a page that does not contain it. What the evidence actually supports is heading hierarchy and metadata enrichment — **which markdown provides as well as XML does, for free**. Docs-as-code, meanwhile, is overwhelmingly the live side. Linting has zero outcome evidence — process hygiene, nothing more.

## The agent turn: serving flipped, authoring didn't

Agents are now the majority of documentation traffic (66% on one vendor's fleet, self-reported, a floor since one major agent sends no identifiable user-agent). The platforms pivoted wholesale to *serving* agents — MCP endpoints, agent/human content splits, machine routes — while human authoring practice barely moved. Two empirical anchors: llms.txt is dead as a crawler channel (zero requests from frontier crawlers across ~900 monitored domains; no provider confirms consuming it) but alive as an on-demand *navigation map* — its measured win is ~90% fewer invented URLs, i.e. **finding the file, not the prose**, consistent with the localisation mechanism in [`structure.md`](structure.md). And the one organisation that restructured content and *measured causally* (matching-based, ~1,000 customers) found +1.23pp resolution rate with near-zero correlation between volume of edits and impact — **targeting beats volume**: a few well-chosen improvements touched most conversations.

## Not established

Any study varying human-facing information architecture (page kinds, heading depth, cross-link density) with content held constant and measuring answer quality — for humans or machines; this is the code's exact question and it is open. Any docs-linting outcome. The Mintlify structured-docs benchmark's data (unreleased; its numbers are the most-cited and currently unfalsifiable).

---

*Sources: [`a26ae7e524c53262a`](../raw/a26ae7e524c53262a.md) (Diátaxis at full strength, the Pigweed failure, the title-chain verification) · [`a5e68a671a08e519a`](../raw/a5e68a671a08e519a.md) (DITA's bus factor, minimalism's replication line) · [`a86776519f614dd3a`](../raw/a86776519f614dd3a.md) (the institutional state: STC, iiRDS, the folklore ROI family) · [`a1c816c1f7cbcfdf9`](../raw/a1c816c1f7cbcfdf9.md) (the AI turn: llms.txt, traffic, retrieval results, Intercom).*
