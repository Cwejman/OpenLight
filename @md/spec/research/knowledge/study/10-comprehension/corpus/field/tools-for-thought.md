# The tools-for-thought products, August 2026

Two agents censused the personal-knowledge and tools-for-thought category. Three structural facts came back, and the first of them is the most consequential single finding in the commercial half of the sweep.

## 1. Plain files won, because agents can read them

Obsidian's format — local Markdown files with properties — became a moat. It went free for commercial use in February 2025, shipped a database *view layer over files* in May 2025 whose documentation states that "All the data in Obsidian Bases is stored in your local Markdown files and their properties," and ships relentlessly: twenty changelog entries in the last two and a half months of the sweep window. Its AI play is a **command-line interface** — "Anything you can do in Obsidian you can do from the command line" — giving agents access to the vault without putting a model in the app. It has no native assistant.

**Logseq is the counter-case, and it is painful.** Its database rewrite finally shipped as 2.0.1 on 2026-07-13 after a thirteen-month release hole, making SQLite canonical rather than files, unifying pages and blocks as nodes, with typed properties and tags-as-classes. The file-based application is demoted to maintenance. The top community comment: "too little, too late… Logseq remained a buggy mess… several years of complete stagnation." Long-time users describe leaving because plain text is non-negotiable and because agents can no longer read the files. A Markdown mirror exists and is one-way; two-way sync is still on a branch.

**The market's answer to typed structure against files is *both*, with files as the substrate.** If your structure is not files, you must *project* to files as a first-class, two-way surface.

## 2. MCP or a command line is the universal 2026 feature

Obsidian, Logseq, Roam, Craft, Capacities, Amplenote, Reflect, Heptabase, Allume, Coda and Notion all shipped one. **The AI layer is being externalised rather than built in.**

## 3. The venture-funded middle evacuated for meetings and agents

**Tana** raised $14M in February 2025 and then **forked itself in two in March 2026**: the supertag outliner renamed and put into maintenance, with a new product built for "collaboration and agentic work" — in practice a meeting platform with transcripts, proposals and chat integration. Supertags survive as substrate; the product is now an agentic meeting tool. **Notion** shipped agents in September 2025, custom agents in February 2026 with over a million built by May, and a developer platform — and **killed Notion Mail**, announced June 2026 for a September sunset, pivoting to "agent-based email workflows." **Mem** is now "your AI chief of staff." **Fabric** sells a "context warehouse" to companies. **Coda** became "Superhuman Docs" inside an AI productivity suite. **RemNote** is now an AI study tool. **Heptabase** leads with an AI tutor.

## 4. The rest of the census

**Alive and growing:** Anytype — local-first typed objects over its own sync protocol, 29 releases in 2026, an MCP server. **Capacities** — object-typed notes, monthly numbered releases, candid public writing about its own growth problems. **Craft** — fortnightly-to-monthly updates, an open-source agent interface shipped February 2026. **Amplenote**, **Supernotes** (slowing — no release in four months and a blog silent for a year), **Allume** (formerly Muse, renamed in June 2026, ownership moved off the original company).

**Zombie:** **Roam Research** — homepage content-free, no public changelog or blog, no funding since 2020, real but minimal first-party shipping surrounded by community extensions. Low-headcount maintenance mode with an MCP bolt-on.

**Dead:** **Dendron** — last substantive commit August 2023, issues filed into 2026 with nobody home, not formally archived. **Kosmik** — sunset 2026-05-31 after eight years, explicitly announced; the first application to store data locally via on-device content addressing with multiplayer.

**Reflect** went open-source in July 2026 — "open-source, markdown first, and AI native" — which reads as a small team choosing a different path rather than scaling.

## 5. The new entrants say the thesis out loud

The clearest expression of where the category is going: **"Open-source notetaking app for you and your agents"** (July 2026, 151 forum points) and **"a shared brain for knowledge between agents and your team"** (August 2026, 92 points). Alongside them, local-first open-source alternatives to the assistant desktop apps are where the "personal context" energy is going.

## 6. What remains

What is left as pure tools for thought is bootstrapped and small — Capacities, Craft, Anytype, Supernotes, Allume — or dead. And the field's most prominent tools-for-thought researcher went on leave in late 2025 to build "a conservatory for human attention," and is no longer building note tools.

Reports: [`add822cc12cefe954`](../../../../../sweep-2026-08/raw/add822cc12cefe954.md), [`a3f6ddd86cf882a6d`](../../../../../sweep-2026-08/raw/a3f6ddd86cf882a6d.md).
