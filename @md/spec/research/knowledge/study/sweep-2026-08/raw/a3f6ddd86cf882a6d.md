## 1. HEADLINE

- **The nearest neighbour has already shipped your interface model, and it is Patchwork.** Ink & Switch's Patchwork system defines tools as plugin modules exporting `plugins: [{type: "patchwork:datatype", id, …}, {type: "patchwork:tool", id, supportedDatatypes: ["counter"] | ["*"], load}]`, with a render contract of `(handle, element) => cleanup`, and composition via `<patchwork-view doc-url="…" tool-id="…">`. Documents and embeds can *pin* a `toolId`. That is "a component is a declaration, mounting one is a call, and which component can draw a thing is a query over the field" — running, in the open, as of 2026-08-25 ([patchwork-skills SKILL.md](https://github.com/inkandswitch/patchwork-skills), [patchwork-pkg-base](https://github.com/inkandswitch/patchwork-pkg-base)).
- **Files won in 2026 — for a reason nobody predicted.** Plain Markdown became a moat because coding agents can read it. Logseq's DB rewrite (SQLite canonical, nodes unify pages/blocks, typed properties, tags-as-classes) finally shipped as 2.0.1 on 2026-07-13 after a 13-month release hole — into a market that had just re-valued the thing it gave up. Top HN comment: *"too little, too late."* This is the single most adverse fact for a "structure not files" thesis.
- **Schema evolution is the confessed unsolved problem, and the lab that named it has closed the file.** Ink & Switch lists Cambria as **Completed, 2020**; `cambria-project` last pushed 2024-06-14 with no successor. Every shipping sync engine solves migration by forcing clients to upgrade — Zero's default `onUpdateNeeded` handler *reloads the page*.
- **The CRDT thesis lost commercially to the ones who abandoned it.** ElectricSQL dropped client CRDTs in 2024 for read-path shapes, then was acquired by Databricks (2026-08-11). Jazz v2 (2026-04-18) walked back crypto-enforced permissions to server-as-authority and CRDTs to git-like snapshot DAGs. Neither has any branching story — the exact capability the CRDT camp is still building.
- **The most direct prior art for "interface as data over typed contracts" is paused.** HASH's Block Protocol — an open standard for data-driven blocks over typed entities — has **v0.4 development suspended** despite the repo still being touched (2026-08-12). Read that as a warning about standardising the contract too early.
- **The venture-funded middle evacuated PKM for meetings and agents.** Tana split itself in two (March 2026); Notion killed Notion Mail (sunset 2026-09-22) for "agent-based email workflows"; Mem is now "your AI chief of staff"; Coda is now "Superhuman Docs."
- **The oldest critique is still the sharpest and is 27 years old**: Shipman & Marshall, *Formality Considered Harmful* (CSCW, Dec 1999, [10.1023/A:1008716330212](https://doi.org/10.1023/a:1008716330212), 165 citations). Typed structure imposes a cost at capture time that users route around. Nothing in 2025–26 refutes it.

## 2. THE MAP

**Live and growing.** *Obsidian* — files + properties + Bases (a `.base` database *view* over Markdown, core plugin, shipped 1.9.0 on 2025-05-21); free for commercial use since 2025-02-20; releases through 1.13.8 on 2026-08-20; new Obsidian CLI as its agent surface. *Notion* — blocks + databases, now agent-operated (3.0 Sept 2025; Custom Agents Feb 2026, >1M built by May 2026; Developer Platform May 2026). *Anytype* — local-first typed objects over `any-sync`; 29 releases in 2026, MCP server. *Craft*, *Capacities* (object-typed notes, Release 68 Aug 2026), *Amplenote* — small, bootstrapped, shipping monthly.

**Alive but redefined.** *Tana* — $14M Series A (2025-02-03); forked March 2026 into "Tana Outliner" (maintenance) and a new agentic meeting product. *Mem*, *RemNote* (now an AI study tool), *Fabric* (B2B "context warehouse"), *Heptabase* (AI Tutor), *Reflect* (went open-source 2026-07-14).

**Zombie / dead.** *Roam Research* — no changelog, no funding since 2020; real but minimal first-party shipping (an MCP/CLI) surrounded by community plugins. *Dendron* — last substantive commit Aug 2023; issues filed into 2026 with nobody home; **dead**. *Kosmik* — sunset 2026-05-31, explicitly announced. *Notion Mail* — sunset 2026-09-22.

**Shipped-late.** *Logseq* 2.0.1 DB version, 2026-07-13; file-based app demoted to "Logseq OG," maintenance only.

**Research.** Ink & Switch (10 years old in 2026), plus the local-first infrastructure layer below.

## 3. LOAD-BEARING FINDINGS

| Claim | Evidence | Grade | Consequence |
|---|---|---|---|
| Patchwork's plugin registry is the frame, implemented | github.com/inkandswitch/patchwork-skills, pushed 2026-08-08; patchwork-system 2026-08-25 | shipped-niche (research platform) | Read their SKILL.md before designing yours; it encodes hard-won constraints (lazy `load()`, stable public `id`, light DOM, mandatory cleanup) |
| Cambria is completed research with dead code and no successor | inkandswitch.com/universal-version-control lists Cambria 2020 "Completed"; repo last push 2024-06-14 | research-prototype → stalled | Schema evolution of typed, versioned, linked structure is *unsolved*, not merely unbuilt. Budget for it as a first-class problem |
| Zero handles schema change by reloading the page | zero.rocicorp.dev/docs/schema; Zero 1.0 announced 2026-06-08 | shipped, adoption unproven | The dominant industry answer to migration is "force the client to upgrade" |
| Jazz v2 is the only shipped Cambria descendant | jazz.tools/blog/four-fresh-ideas-behind-jazz, 2026-04-18: schema version as an extra branch dimension; migrations as "purely functional mappings between schema versions" | announced/alpha | Treating schema version as *another branch axis* is the most promising live idea in the field |
| Automerge is technically excellent and commercially tiny | automerge.org/blog/automerge-3/ (July 2025): 700MB→1.3MB, 17h→9s load; ~126k downloads/20 days vs Yjs ~31.6M/month | shipped-niche | Choose it for correctness and branching, not for ecosystem |
| Yjs is uncontested but single-maintainer, with v14 stuck in RC since 2026-07-15 | github.com/yjs/yjs/releases; opencollective.com/y-collective | shipped-and-adopted | Bus-factor risk sits under most collaborative editors |
| Consolidation wiped out three independents in 12 months | Triplit→Supabase 2025-10-08; Electric→Databricks 2026-08-11; InstantDB sunsetting, services until 2027-08-31 | dead / absorbed | Do not build on a sync startup's proprietary cloud |
| Block Protocol v0.4 paused | blockprotocol.org, fetched 2026-08-26 | stalled | The "typed blocks as an open standard" play has been attempted and stalled once already |
| Formalisation is costly at capture time | Shipman & Marshall 1999, 10.1023/A:1008716330212; Marshall & Shipman, *Which semantic web?*, HT'03, 10.1145/900051.900063 | peer-reviewed, 165 + 54 citations | Typing must be deferrable and incremental, or users will not type |
| People prefer navigation to search — hierarchy is not merely a compromise | Bergman, Beyth-Marom & Nachmias, *Improved search engines and navigation preference in PIM*, ACM TOIS 2008, 159 citations | empirical | Hierarchy is a *retrieval affordance* people actively want, not just a filing artefact |
| Obsidian added typed structure without abandoning files | obsidian.md/help/bases — "All the data in Obsidian Bases is stored in your local Markdown files and their properties" | shipped-and-adopted | The market's answer to "typed structure vs files" is *both*, with files as the substrate |

## 4. INK & SWITCH IN DETAIL

Four declared research areas: **Local-first Software, Malleable Software, Programmable Ink, Universal Version Control**. Tenth anniversary marked April 2026 (Dispatch #016). Two things graduated to production software: **Automerge** and **Allume** (formerly Muse; v4.0 mid-2026, adds MCP support; Mac/iPad/iPhone, $9.99/mo — shipped-niche, small).

- **Patchwork** (2024–2026, project 030; Litt, Sonnentag, Schöning, Wiggins, van Hardenberg, Henry, Orion Reed, grjte, chee, Warth). *Active and the lab's centre of gravity.* Started as version control for writers (lightweight branches, diff visualisation, chat-like history); has become a **malleable-software runtime**: a package registry of datatypes/tools/actions over Automerge documents, with tool composition by embedding. Notebook entries run to 2026-05-12. `patchwork-skills` ships an installable agent skill that teaches Claude Code / Cursor / Codex how to write Patchwork tools — AI as the on-ramp to end-user programming, exactly as the malleable-software essay argues. **Grade: research-prototype, unusually mature.**
- **Malleable Software essay** (Litt, Horowitz, van Hardenberg, Matthews; June 2025). Core claims: the "gentle slope" from user to creator; tools-not-apps; communities as the unit of adaptation. On AI: *"AI code generation alone does not address all the barriers to malleability"* — "like bringing a talented sous chef to a food court." HN 294 pts, 2025-06-10.
- **Automerge** — 3.0 shipped July 2025 (Dispatch #012). Now: Hexane storage engine (2–9× faster), commit-level author provenance. **shipped-niche.**
- **Keyhive** (open-sourced March 2025; notebook Oct 2025) — local-first access control; BeeKEM protocol paper preprint July 2026; funded partly via the **ARIA Safeguarded AI Programme** and project **GAIOS** (Dispatch #013/#014). **research → early implementation.**
- **Subduction** (★106, pushed 2026-08-25) — p2p sync protocol for **hash-linked data**, Sedimentree history sharding, encryption-friendly, Iroh/QUIC transport. README carries a hard "DO NOT use for production" caution. This is the closest current thing to Xanadu's fine-grained addressing plus versioning. **early release preview.**
- **Onomancy** (2026-08-25) — "a local-first *edgename* protocol": human-meaningful names over self-certifying ed25519 keys, with optional DNSSEC-rooted global names. The pitch matters: *"an account created offline already has a globally shareable name… No migration, ever."* **early development.**
- **Backstitch** (★237) — real-time version control for Godot; alpha-grade, own sync server, shown at GodotCon April 2026. The lab's first attempt to put universal version control in front of real non-programmer users (game-dev students). **shipped alpha.**
- **pushwork** — Automerge-backed bidirectional directory sync ("It feels a bit like Git, but the merge is a CRDT"). **shipped, small.**
- **Concluded:** Cambria (2020), Upwelling (2023), Embark (2023), Potluck (2022), Inkbase (2022), Jacquard (2024). **Livelymerge** (Dispatch #018, June 2026) — "a new Smalltalk-like exploring of local-first computation"; **Ambsheets**, **Bijou64** (261 pts on HN, 2026-05-29), **Tenfold** (anniversary art piece).

## 5. WHAT THIS LINEAGE LEARNED THE EXPENSIVE WAY

1. **Formalisation cost is paid at capture, benefit arrives at retrieval — and users discount the future.** Shipman & Marshall's finding is the reason spatial hypertext (VIKI/VKB, *Spatial hypertext*, CACM 1995, 10.1145/208344.208350) let structure stay *implicit and emergent*. A typed system must let a thing be untyped, half-typed, and retyped later, without ceremony.
2. **Don't take files away.** Logseq did, four years late, and the community read it as a strategic error precisely because agents read files. If your structure is not files, you must *project* to files as a first-class, two-way surface. (Logseq's Markdown Mirror is one-way; two-way is still on a branch.)
3. **Schema change will be your hardest problem, and no one will help.** Cambria proved lenses work and then stopped. Plan the migration story before the data model.
4. **Don't standardise the contract before you have users of it.** Block Protocol v0.4 is paused; Patchwork instead ships a *house style* and an agent skill, and explicitly permits any framework that "bundles to an ES module and renders into a DOM element."
5. **Backlinks did not deliver what was claimed.** The best-read critique of the era is Joan Westenberg's "I deleted my second brain" (2025-06-28, 598 pts HN — original URL now 404s on Substack, a fact that is itself a link-rot data point). The counter-argument published 2026-07-19 concedes the point structurally: *"The tool doesn't make the contribution. The tool enables people to make contributions."* No empirical study establishes that linked note-taking improves outcomes; I found none.
6. **Composability beats generation.** Matuschak, *Apps and programming: two accidental tyrannies* (2026-03-03): *"Coding agents without a composable architecture give you zero-to-one silo apps."* The two tyrannies are the application silo and programming-as-specialisation; his proposed escape is agents *plus* declarative-facet architectures like CodeMirror's.
7. **Branching, not merging, is the durable win.** Automerge branches, Patchwork, Backstitch, Jazz v2's per-row git-like history, Yjs v14's track-changes — all converge here, while Zero and Electric bought adoption by giving it up.

## 6. WHAT MOVED IN 2025–2026

Malleable Software essay (2025-06); Automerge 3.0 (2025-07); Keyhive open-sourced (2025-03), BeeKEM paper (2026-07); Triplit→Supabase (2025-10-08); Notion 3.0 agents (2025-09) then Notion Mail killed (announced June 2026); Obsidian free for work (2025-02-20) and Bases (2025-05-21); Tana's $14M (2025-02-03) then its March 2026 split; Jazz v2 alpha (2026-04-18); Zero 1.0 (2026-06-08); Logseq 2.0 DB beta (2026-07-13); Allume rename (mid-2026); Kosmik sunset (2026-05-31); Electric→Databricks (2026-08-11); Local-First Conf 2026 (Berlin, 12–14 July, ~350 people, sold out; theme *"user empowerment in an age of fluid software"*; Kleppmann, Steve Ruiz, Paul Frazee, Jeffrey Heer; Day 3 Lab Day hosted by Ink & Switch). Matuschak went on "para-academic leave" in late 2025 to build **Pico**, "a conservatory for human attention" — the field's most prominent tools-for-thought researcher is no longer building note tools. ACM Hypertext: HT'25 Chicago, **HT'26 London** — ~55 papers/year on DBLP, alive but small and largely social-media-facing. Tinderbox 11.8 still ships (spatial maps, agents, prototypes, attributes) — the longest-running commercial spatial-hypertext product, 30+ years.

## 7. WHAT I COULD NOT ESTABLISH

The session's web-search budget was exhausted early; findings rest on direct fetches of primary sources (changelogs, GitHub/DBLP/Crossref APIs, HN Algolia), which biases toward things with public repos and changelogs. Specifically unestablished: **Ted Nelson's current activity** — xanadu.net's front page is dated 2007, and I found no 2024–26 statement, so his status and OpenXanadu's are genuinely unknown; **any empirical study** of whether bidirectional linking improves knowledge outcomes; **scholarly evaluation of Zettelkasten** or of Ahrens' fidelity to Luhmann (the Luhmann-Archiv digitisation exists but I could not verify its current findings); **Notion's current valuation/ARR**; **Roam's user numbers**; **Zero's and Jazz's funding**; whether any Patchwork tool has a user outside the lab. Also unverified: the exact Allume 4.0 date (sources give June and July 2026).

## 8. LEADS

1. https://github.com/inkandswitch/patchwork-skills — the plugin/render/embed contract, written for agents
2. https://github.com/inkandswitch/patchwork-pkg-base — isolation rules between tools; read the Engineering Notes
3. https://www.inkandswitch.com/essay/malleable-software/ — the manifesto, June 2025
4. https://www.inkandswitch.com/universal-version-control — Cambria formally marked Completed
5. https://github.com/inkandswitch/cambria-project — the dead lens implementation, 698 stars
6. https://jazz.tools/blog/four-fresh-ideas-behind-jazz — schema version as a branch dimension, 2026-04-18
7. https://zero.rocicorp.dev/docs/schema — the industry-standard answer: reload the page
8. https://github.com/inkandswitch/subduction — sync for hash-linked data, the Xanadu-adjacent one
9. https://github.com/inkandswitch/onomancy — self-certifying names, "no migration, ever"
10. https://andymatuschak.org/tat — two accidental tyrannies, 2026-03-03
11. https://doi.org/10.1023/a:1008716330212 — Formality Considered Harmful, the cost-of-typing argument
12. https://doi.org/10.1145/900051.900063 — Which semantic web?, HT'03
13. https://obsidian.md/help/bases — typed views over files, the market's compromise
14. https://blockprotocol.org — the paused open standard for typed data-driven blocks
15. https://github.com/logseq/docs/blob/master/db-version.md — what shipping "nodes, typed properties, tags-as-classes" actually cost
