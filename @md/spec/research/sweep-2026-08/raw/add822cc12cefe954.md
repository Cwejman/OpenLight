# State of PKM / Tools-for-Thought Products — August 2026

*Note: my WebSearch budget was exhausted early; most evidence below is from direct fetches of primary sources (changelogs, GitHub API, company blogs, HN). Where I could not verify, I say so.*

---

## Tier 1 — the ones that matter

### Obsidian — **shipped-and-adopted**
- **Structure:** local Markdown files + YAML properties; bidirectional links; canvas. Bases adds a database *view layer over files* (no new store).
- **Commercial license went optional (free for work) 20 Feb 2025** — https://obsidian.md/blog/free-for-work/
- **Bases shipped 21 May 2025** in 1.9.0 (Catalyst early access): "turn any set of notes into a powerful database," new `.base` file format, filters, formulas. https://obsidian.md/changelog/2025-05-21-desktop-v1.9.0/ Card view followed in 1.9.3; a **Maps** core plugin in 1.10.0.
- **Cadence is relentless:** 20 distinct changelog entries in the last ~2.5 months; v1.13.0 (Jul 30 2026, redesigned searchable settings, iOS Share Sheet), 1.13.2–1.13.8 through **20 Aug 2026**. https://obsidian.md/changelog/
- **New product surface: Obsidian CLI** — "Anything you can do in Obsidian you can do from the command line" (`obsidian daily`, `obsidian search`). https://obsidian.md/cli — this is the AI-adjacent play: agent access to the vault without an LLM in the app.
- **No native AI assistant.** The AI story is delegated to plugins/CLI/Claude Code. Blog cadence gap Oct 2025→May 2026 is a *marketing* gap, not a shipping gap. Sync security audits by Cure53 + Trail of Bits published 13 May 2026; new plugin community site + developer dashboard 12 May 2026. https://obsidian.md/blog/
- **Verdict:** the default winner. HN thread on Logseq 2.0 is full of people saying they moved to Obsidian + Claude Code.

### Logseq — **shipped-niche, after a near-fatal stall**
- **The DB rewrite DID finally ship: "Logseq 2.0 Beta (DB version)", tag `2.0.1`, published 13 Jul 2026** (GitHub Releases API). HN: 101 pts / 85 comments, 2026-07-13.
- **The gap is documented:** prior release `0.10.15` was 2025-12-01; before that 0.10.14 (2025-09-18), 0.10.13 (2025-08-07), 0.10.12 (2025-05-26), and **0.10.9 → 0.10.11 spans 2024-04-23 to 2025-05-21** — a 13-month release hole on the mainline product.
- **Structure changed fundamentally:** SQLite is now canonical, not files. "Nodes" unify pages and blocks; typed properties; tags-as-classes; views/tables; Library; MCP server; CLI; publish; RTC sync; iOS/Android apps. Doc dated **28 Apr 2026**: https://github.com/logseq/docs/blob/master/db-version.md
- **Product split:** file-based app becomes "Logseq OG" — maintenance only, no new features (announced in the DB updates thread, https://discuss.logseq.com/t/whats-new-with-logseq-db-may-16th-2026/35020, 16 May 2026). A one-way "Markdown Mirror" exports DB→disk; two-way sync still on a branch.
- **Repo is genuinely active:** last commit 2026-08-25 (`rcmerci`), pushed 2026-08-26. 44.6k stars.
- **Sentiment is bad.** Top HN comment (2026-07-13): *"too little, too late… Logseq remained a buggy mess, is now on an unmaintained (thus insecure) version of electron… several years of complete stagnation."* Multiple long-time users describe leaving for Obsidian or org-roam because plain-text is non-negotiable and because agents can no longer read the files. One nightly user is positive about typed tags.
- **Verdict:** it shipped, four years late, into a market where its differentiator (plain text + outliner) was traded away exactly when plain text became valuable for AI agents. Grade shipped-niche, trending down.

### Roam Research — **stalled but not dead (functional zombie)**
- Homepage is content-free; no public changelog or blog I could reach. Company communications are effectively absent.
- Third-party community newsletter (Roam 'n' Around, Feb 2026, https://williamnjau.substack.com/p/roam-n-around-february-2026) documents *real first-party shipping*: native callouts (`> [!type]`), cross-graph export/import, multi-user bullet colors, and **Roam MCP/CLI with API + auth so "Claude can now gain read/write access to your graph."**
- But the bulk of that newsletter is **community extension developers** (Fabrice Gallet, Mark Lavercombe, Ryan Sonnek's roamOS, CAPTURR), not Roam Inc.
- Pricing reportedly still $15/mo. Could not verify user numbers from any credible source — the "1 million monthly visitors" figure circulating comes from an AI-generated SEO blog and should not be trusted.
- **Verdict:** low-headcount maintenance mode with an MCP bolt-on. Zombie-adjacent: alive, not growing, no marketing, no funding news since 2020's $9M/$200M-valuation round.

### Tana — **shipped-and-adopted, then split itself in two**
- **$14M Series A led by Tola Capital, 3 Feb 2025**, with Lightspeed, Northzone, Alliance VC, firstminute; **$25M total**. https://tana.inc/articles/tana-raises-usd14m-series-a
- **March 2026: Tana forked into two products.** The existing supertag outliner is renamed **Tana Outliner** (outliner.tana.inc); a **new Tana** is built for "collaboration and agentic work." One-click migration promised "hopefully before summer"; existing subs unaffected; new pricing TBA. https://outliner.tana.inc/articles/tana-current-march-2026
- **The new Tana is a meeting/agent platform, not a PKM app.** Changelog (https://tana.inc/changelog): AI chat token optimization + "ask the AI for a link" (4 Aug 2026); external-meeting auto-detection, `meet.tana.inc` links, **Slack integration ("mention @tana in any Slack thread")** (19 Aug 2026); proposal editing, speaker-grouped transcripts, fixes to stop wrap-ups fabricating details (21 Aug 2026); Zoom/Meet/Teams capture from Today page (20 Jul 2026).
- Outliner's Q2 2026 theme is explicitly "core reliability, long-standing paper cuts" — i.e. maintenance while the money follows the agent product.
- **Verdict:** the clearest AI pivot in the category. Supertags survive as substrate; the *product* is now an agentic meeting tool. Historic waitlist 160k+, 30k+ beta users (PR, Feb 2025) — no current MAU figure.

### Notion — **shipped-and-adopted; aggressively agentic; first retreat visible**
- **Notion 3.0 with AI agents launched Sept 2025**; **Custom Agents Feb 2026 — over 1 million built** by May 2026; **Notion Developer Platform (Workers sandbox, database sync from Salesforce/Zendesk, external agents: Claude Code, Cursor, Codex, Decagon) May 2026.** Wikipedia w/ primary cites: https://en.wikipedia.org/wiki/Notion_(productivity_software)
- **Notion Mail (launched Apr 2025, built on the Skiff acquisition) is being SHUT DOWN 22 Sep 2026** — announced June 2026; pivoting to "agent-based email workflows." This is the notable failure.
- Current stable 3.4 (14 Apr 2026). Releases page shows near-weekly agent-centric shipping through **19 Aug 2026**: external agents, agents-on-calendar, shared Workers, Notion Agents iOS app (8 Jul 2026), AI model picker with speed/intelligence/cost scorecards (14 Aug 2026). https://www.notion.com/releases
- **Acquired ZeroEntropy** (task-specific retrieval models for knowledge work) — blog, 2026. Engineering blog describes "Lore," shared memory for AI agents stored as Notion pages.
- Last confirmed valuation remains **$10B (Oct 2021, $275M, Coatue/Sequoia), 20M users**. I could not verify a 2025/2026 round, ARR, or IPO news — treat any such figure as unverified.
- **Structure unchanged:** blocks + databases. The novelty is agents as first-class actors on that data.

### Coda → **Superhuman Docs** (Grammarly) — **absorbed, still shipping**
- `coda.io/updates` now **307-redirects to `docs.superhuman.com/updates`**. Grammarly's post-acquisition entity has rebranded the whole suite to **Superhuman**: product nav lists Go, Agents, Mail, Calendar, **Docs**, **Databases**, Store. https://superhuman.com/blog
- Coda is now marketed as **"Superhuman Docs."** Shipping through Jul 2026: natural-language doc/table/workflow building, native OpenAI + Claude connectors, AI views (closed beta), table pages, native macOS app with offline, **"Superhuman Databases" closed beta**; Coda MCP public beta Apr 2026; MCP chart/view creation Jun 2026. (docs.superhuman.com/updates, fetched 26 Aug 2026)
- **Verdict:** not sunset, but no longer an independent tool-for-thought — it's the document substrate of an AI productivity suite.

---

## Tier 2

| Product | Structure | Grade | Evidence |
|---|---|---|---|
| **Anytype** | Local-first, typed objects, CRDT via `any-sync`, P2P | **shipped-and-adopted (in its niche)** | **29 releases in 2026 alone**; v0.56.7-beta **22 Aug 2026**; whole org pushing daily (anytype-swift, any-sync, docs all pushed 24–26 Aug 2026); **`anytype-mcp` repo exists, 512 stars**. 8.7k stars on anytype-ts. Recent work: in-space + cross-space chat search, chat perf, spaces/invites. GitHub API, 26 Aug 2026. |
| **Capacities** | Object-typed notes ("everything is an object with a type") | **shipped-niche, healthy** | Monthly numbered releases: **Release 68 (Aug 2026)** Mobile App 2.0, Explore AI, weblink analysis, media in API + **MCP**; R67 (Jul 2026) API 2.0; R66 (Jun 2026) AI Chat Connectors 2.0; R64 choose-your-own AI model provider. https://www.capacities.io/whats-new. Blog is candid ("What challenges do we face in growing Capacities?", 5 Nov 2025). Small team, no funding news found. |
| **Craft** | Blocks + documents, design-led | **shipped-and-adopted** | Fortnightly-to-monthly updates all through 2026: 10 Aug, 21 Jul (Tags), 7 Jul (Tasks), 5 Jun (BYO key, **MCP v2**), 4 May, 13 Apr (Kanban), 17 Feb (offline mode), **3 Feb 2026 "Introducing Craft Agents — The Open Source Agent Interface."** https://www.craft.do/blog. Still hiring ("How we hire in 2026", 3 Feb 2026). |
| **Reflect** | Networked notes, E2EE, AI-native | **pivoted — announced/shipped-niche** | **14 Jul 2026: "Reflect Open — a new chapter for Reflect… now open-source, markdown first, and AI native."** https://reflect.app/blog. Preceding: MCP for coding agents (10 Mar 2026), edit notes via coding agents (28 Apr 2026). Changelog dates show a thinning 2025 (last dated entries 2025-09-23, 08-18, 07-08). Homepage still advertises "GPT-4 and Whisper" — stale copy. Read: a small team going open-source rather than scaling. |
| **Mem** | AI-organized notes → **agent** | **pivoted, alive** | mem.ai is live and repositioned: **"Your AI chief of staff"**, "Mem Agent builds a living picture of your tasks, projects, and goals." Products split into **Workspace** and **Agent**; features Push-to-Remember, Voice Mode, Heads Up, Chat. Blog: "Introducing Mem 2.0: The World's First AI Thought Partner", SOC 2 Type II, Claude Connector + calendar integration. https://get.mem.ai/blog (fetched 26 Aug 2026). Not dead — but no longer a note-taking app. |
| **Heptabase** | Whiteboard/canvas + cards, bidirectional links | **shipped-niche, pivoting to learning** | Homepage (26 Aug 2026) leads with **"Heptabase AI Tutor" — an agent that runs structured personalized learning sessions** (demo dated 05/01/2026), plus **"Heptabase CLI works with Claude Code, Codex."** Repositioned "for students, researchers, and lifelong learners." No public changelog URL survives (/changelog, /whats-new both 404). |
| **Dendron** | Hierarchical notes + schemas in VS Code | **DEAD** | Repo not formally archived, but commit history is terminal: last substantive work **Aug 2023** (Kevin Lin, "perf enhancements"); 2024–2025 commits are a license file, a README typo fix, and a GitHub Actions YAML (2025-06-01). Blog children stop at **2022**. Users still filing issues (open issue 2026-05-22) with nobody home. GitHub API, 26 Aug 2026. |
| **RemNote** | Notes + spaced repetition | **pivoted, alive** | Homepage now an **AI study tool** — "Study Faster with AI Flashcards, Quizzes & Summaries", "Trusted by 1,000,000+ students", PDF→flashcards/quiz/mastery-tracking. The PKM framing is gone. Changelog is JS-gated; cadence unverified. |
| **Amplenote** | Notes + tasks + calendar | **shipped-niche, active** | "Q1/Q2 2026 Updates: Proposed Agenda, Real-time Collaboration, **MCP Access**" (6 Jul 2026); "Ample Agent Pro: Frontier LLMs" v1 (24 Apr 2026); Mission Control dashboard (20 Mar 2026). https://www.amplenote.com/blog |
| **Supernotes** | Atomic cards + links | **shipped-niche, slowing** | v3.2.4 **21 Apr 2026** (a11y/sync/Android 12+); v3.2.3 4 Apr 2026 (Maps overhaul). https://supernotes.app/changelog — but **no release in 4 months**, and the blog's last post is **12 Mar 2025** (Supernotes VR for Meta Quest). Watch this one. |
| **Saga** | Docs + tasks + AI | **stalling** | Last update on https://saga.so/updates is **23 Mar 2026** (keyboard-first Saga AI) — 5 months of silence. Claims 60,000+ users. |
| **Scrintal** | Visual board + cards | **pivoted** | Site-wide banner (26 Aug 2026) promotes **"Gobu, your new AI research assistant"** — a separate AI reading product, not Scrintal itself. Suggests the team's energy moved. |
| **Napkin (napkin.one)** | Idea cards + resurfacing | **shipped-niche, quiet** | Live; "NOW AVAILABLE FOR IPHONE"; "your personal AI understands your ideas deeply." **Blog is 404** ("Probably something was once here which is now somewhere else"). Napkin GmbH. Distinct from napkin.ai (AI diagram generation), which is a different, better-funded company. |
| **Fabric (fabric.so)** | "AI workspace / second brain" | **pivoted to B2B** | Now sells a **"context warehouse"** for companies — named AI agents (Sol, Juno, Pip) that act in Linear/Gmail. 50+ integrations, "4.7, 3K+ app ratings." Blog is pure SEO content-farm. https://fabric.so |
| **Muse → ALLUME** | Nested spatial boards, ink + cards | **renamed, alive, small** | **Muse renamed Allume in v4.0, 11 Jun 2026**; 4.0.1 (23 Jun), 4.0.2 (30 Jun 2026). "Liquid Glass, **AI support with MCP**." Mac/iPad/iPhone, on Setapp. https://allume.com/updates. Ownership has moved off the original Muse Group — footer contact is Adam Wulf / Milestone Made, LLC; **Adam Wiggins is no longer visible on the product**. Memo cadence: May 2026, Mar 2026, then May 2025 — roughly annual. |
| **Kosmik** | Spatial canvas, on-device IPFS | **DEAD** | Site banner: *"Kosmik is winding down… Kosmik will sunset on **May 31st 2026**."* 8 years; first app to store data locally via on-device IPFS with multiplayer (2018). Team "exploring several options to continue our work on spatial interfaces." https://www.kosmik.app/ |
| **Ink & Switch** | Research lab (local-first, malleable software, programmable ink, universal version control) | **research-prototype, thriving** | Celebrating **10 years** in 2026 with an interactive "Tenfold" art piece. Four stated research themes unchanged. https://www.inkandswitch.com/ |
| **Ideaverse / Linking Your Thinking** | Obsidian-native methodology + vault | **unverified** | linkingyourthinking.com is live; /blog is 404; ideaverse.io is Cloudflare-gated. No 2025–26 launch evidence found. Treat as low-signal. |

---

## New 2025–2026 entrants (HN-validated, points/comments as adoption proxy)

- **Hubble** — https://www.hubble.md/ — "Open-source notetaking app for you and your agents," HN **29 Jul 2026, 151 pts / 81 comments**. The clearest expression of the new thesis: notes as an agent-writable substrate.
- **OzBrain** — https://ozbrain.com — "a shared brain for knowledge between agents and your team," HN **21 Aug 2026, 92 pts**.
- **Hyprnote** (YC S25) — open-source local AI meeting notetaker, Launch HN **29 Jul 2025, 270 pts / 180 comments** — the best-received launch in the adjacent space.
- **Leaflet.pub** — https://leaflet.pub — web app for creating/sharing rich documents, HN **5 Mar 2025, 170 pts**.
- **Colanode** — https://github.com/colanode/colanode — open-source local-first Notion+Slack alternative, HN **24 Apr 2025, 147 pts**.
- **SilverBullet** — https://silverbullet.md/ — Git-friendly Logseq/Obsidian alternative, HN **8 Feb 2025, 70 pts**.
- **Poincake** — https://uonr.github.io/poincake/ — infinite canvas notes in the non-Euclidean Poincaré disk, HN **2 Jun 2026, 188 pts** (toy, but a genuine structural idea).
- **Rowboat** — local-first open-source Claude Desktop alternative, HN **7 Jul 2026, 219 pts** — adjacent, but where the "personal context" energy is going.

---

## The through-line

Three structural facts as of Aug 2026: (1) **plain files won** — because agents can read them, Obsidian's format is now a moat and Logseq's move *away* from files landed as a strategic error in community sentiment; (2) **MCP/CLI is the universal 2026 feature** — Obsidian, Logseq, Roam, Craft, Capacities, Amplenote, Reflect, Heptabase, Allume, Coda/Superhuman and Notion all shipped one, meaning the AI layer is being *externalized* rather than built in; (3) **the venture-funded middle is evacuating PKM for meetings and agents** — Tana, Mem, Fabric, Notion (Mail killed for "agent-based email workflows"), Grammarly/Superhuman all made the same move. What remains as pure tools-for-thought is bootstrapped and small (Capacities, Craft, Anytype, Supernotes, Allume) or dead (Kosmik, Dendron).
