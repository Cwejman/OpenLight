---
under: the code
kind: brief
---

# Local-first, and what the field learned expensively

The local-first field consolidated hard in the twelve months to August 2026. Three of the best-known independents exited, the two loudest retrospectives the field has produced are systems abandoning conflict-free replicated data types, and the substrate layer grew enormously — pulled by AI tooling rather than by demand for collaborative applications.

## 1. The consolidation

**ElectricSQL** dropped client-side conflict-free types in 2024 for read-path shapes over Postgres, which worked commercially, and was **acquired by a data platform, announced 2026-08-11**. **Triplit** was acquired by a backend platform on 2025-10-08 and explicitly *not* integrated; its repository has three commits in the following twelve months. **InstantDB** is sunsetting with services continuing until 2027-08-31, the team having joined a model lab. **Kosmik** sunset on 2026-05-31 after eight years. **Kuzu** archived. **Permify** and **Warrant** absorbed.

Against that, several are healthy. **PowerSync** ships monthly and publishes migration guides *from* the acquired competitors — it is absorbing refugees. **Ditto** is the quiet commercial winner, with real edge deployments in aviation, defence and retail point-of-sale. **RxDB**, **Dexie**, **TinyBase**, **Evolu** and **LiveStore** are all alive at various sizes. **Convex**, adjacent rather than local-first, raised a $57M Series B in August 2026 with about 10,000 paying teams.

## 2. The substrate grew for a reason nobody predicted

**Yjs** is dominant and uncontested at roughly 31.6 million monthly npm downloads — about 5.5× year on year — but v14 has been stuck in release-candidate since 2026-07-15, its theme is versioning and track-changes, its funding comes from European public-sector bodies rather than venture capital, and it has a **single maintainer** with billing capped at $100 an hour "as long as there is funding." Bus-factor risk sits under most collaborative editors.

**Automerge** is technically excellent and commercially tiny: version 3.0 cut a Moby-Dick-sized document from 700 MB to 1.3 MB and a load from 17 hours to 9 seconds, and it runs at roughly **250× fewer downloads than Yjs**. Named users are all small or lab-adjacent.

**PGlite** — WebAssembly Postgres — reached about **15 million npm downloads a week**, and it is the real prize of that acquisition. It is used for agent sandboxes, not for collaborative applications.

The pattern: the substrate exploded because AI tooling needed it, not because collaborative-app demand arrived.

## 3. The loudest retrospectives are the abandonments

Two systems walked back the founding thesis in public. ElectricSQL dropped client-side conflict-free types in 2024. **Jazz v2** (2026-04-18) is a near-total rewrite walking back crypto-enforced permissions to server-as-authority and conflict-free types to **git-like snapshot directed acyclic graphs**. Neither has any branching story — the exact capability the conflict-free camp is still building.

Critique is now coming from inside the community. The 2026 conference programme included a talk asking outright whether conflict-free types are useful for collaborative spreadsheets, and the field's leading researcher's keynote was "Local-first in an unstable world," with his 2026 output being narrower systems work rather than a retrospective.

**Branching, not merging, is the durable win.** Automerge branches, Patchwork, a Godot version-control plugin, Jazz v2's per-row git-like history, Yjs v14's track-changes — all converge there, while the engines that bought adoption did so by giving it up.

## 4. Ink & Switch, in detail

Ten years old in April 2026, with four declared research areas: local-first software, malleable software, programmable ink, universal version control. Two things graduated to production software: **Automerge** and a small commercial notes application.

**Patchwork** (project 030, 2024–2026) is the lab's centre of gravity, and it has already shipped an interface model worth reading — the one framework-neutral instance of the renderer-bid question that [`../interface/schema-driven-ui.md`](../interface/schema-driven-ui.md) otherwise finds unoccupied. It started as version control for writers and became a **malleable-software runtime**: a package registry of datatypes, tools and actions over Automerge documents, with composition by embedding. Plugin modules export typed declarations — a datatype plugin and a tool plugin declaring which datatypes it supports, with a wildcard permitted — against a render contract of handle-and-element returning a cleanup function, composed through a custom element that names a document URL and a tool identifier, where documents and embeds may *pin* a tool. That is a component as a declaration, mounting as a call, and which component can draw a thing as a query over the field — running, in the open. It also ships an installable agent skill teaching coding agents how to write Patchwork tools: AI as the on-ramp to end-user programming, exactly as the malleable-software essay argues. Its hard-won constraints are worth copying — lazy loading, a stable public identifier, light DOM, mandatory cleanup.

**Other active work.** Keyhive, local-first access control, with a protocol preprint in July 2026, funded partly by a UK safeguarded-AI programme. **Subduction**, a peer-to-peer sync protocol for hash-linked data with history sharding — the closest current thing to Xanadu's fine-grained addressing plus versioning, carrying a hard do-not-use-in-production caution. **Onomancy**, a local-first *edgename* protocol putting human-meaningful names over self-certifying keys, whose pitch matters: "an account created offline already has a globally shareable name… No migration, ever." **Backstitch**, real-time version control for a game engine — the lab's first attempt to put universal version control in front of non-programmers.

**Concluded:** Cambria (2020), Upwelling, Embark, Potluck, Inkbase, Jacquard.

## 5. What this lineage learned the expensive way

Seven lessons, stated as the agent stated them.

**Formalisation cost is paid at capture, benefit arrives at retrieval — and users discount the future.** Shipman & Marshall's 1999 *Formality Considered Harmful* is why spatial hypertext let structure stay *implicit and emergent*. Note its grade, which two reports in this sweep disagreed about and which the agent that read the full PDF settled: it is an **experience-reflection essay, not a measurement study** — see [`../writing/records.md`](../writing/records.md) §3. A typed system must let a thing be untyped, half-typed, and retyped later, without ceremony. It is 27 years old and nothing in 2025–26 refutes it.

**Do not take files away.** Logseq did, four years late, shipping its database rewrite on 2026-07-13 into a market that had just re-valued the thing it gave up — because coding agents can read files. The community read it as a strategic error. If your structure is not files, you must *project* to files as a first-class, two-way surface.

**Schema change will be your hardest problem, and no one will help.** Cambria proved lenses work and then stopped. Plan the migration story before the data model.

**Do not standardise the contract before you have users of it.** HASH's Block Protocol — an open standard for data-driven blocks over typed entities — has **v0.4 development suspended**. Patchwork instead ships a house style and an agent skill, explicitly permitting any framework that bundles to an ES module and renders into a DOM element.

**Backlinks did not deliver what was claimed.** No empirical study establishes that linked note-taking improves outcomes; none was found. The best-read critique of the era is an essay titled "I deleted my second brain," whose original URL now 404s — itself a link-rot data point.

**Composability beats generation.** Matuschak, March 2026: "Coding agents without a composable architecture give you zero-to-one silo apps."

**People prefer navigation to search.** Hierarchy is a retrieval affordance people actively want, not merely a filing artefact; the study is in [`../reading/finding.md`](../reading/finding.md) §6.

## 6. The market's own answer to typed structure versus files

The market's answer to typed structure against files is *both*, with files as the substrate. The product that proves it, and the documentation sentence that states it, are in [`../field/tools-for-thought.md`](../field/tools-for-thought.md) §1.

Reports: [`a498dd38f2322a083`](../../../sweep-2026-08/raw/a498dd38f2322a083.md), [`a3f6ddd86cf882a6d`](../../../sweep-2026-08/raw/a3f6ddd86cf882a6d.md).
