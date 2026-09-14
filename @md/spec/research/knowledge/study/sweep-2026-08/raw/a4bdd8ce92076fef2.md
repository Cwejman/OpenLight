Research complete. All claims below come from pages I fetched myself in this session.

## 1. Unison — **shipped-niche** (with a funding-stress signal)

`unisonweb/unison`: 6,716 stars, last push **2026-08-19**, not archived. **release/1.0.0 shipped 2025-11-25** — eight years in. Since: 1.1.0 (2026-01-28), 1.2.0 (2026-04-17), 1.3.0 (2026-05-20), **1.4.0 (2026-08-19)**. But cadence halved: ~3 releases/month in late 2024 vs ~1/month in 2026. Unison Cloud is live (unison.cloud), BYOC went GA per blog post dated 2025-10-01.

The important find is the blog's newest post, **https://www.unison-lang.org/blog/consulting/ (Feb 19, 2026)** — verbatim: *"We are spinning up a consulting group, now open to work in a variety of languages, including Scala, Haskell, Rust, Elm, and of course Unison."* and *"Our goal is a self-sustaining model in which a mix of consulting and product revenue funds development of Unison-based tech well into the distant future. We aim to be cash flow positive as a business in the next 12 months and could use your help in getting there."* That is a services pivot, not a wind-down — but it says the product alone doesn't fund the company. No layoff/shutdown evidence found. Third-party: InfoWorld covered the 1.0 debut (HN, 2026-02-26).

## 2. Darklang — **Dark Inc: abandoned. Darklang Inc: shipped-niche, active**

The retrospectives are real. **https://blog.darklang.com/goodbye-dark-inc-welcome-darklang-inc/ (16 Jun 2025)**, Paul Biggar, verbatim:

- *"Dark Inc has officially run out of money."*
- *"Alas, in our dreams of incredible growth, and our promises to investors, we burned cash too quickly between 2017 and 2020. The product wasn't quite good enough back then to raise a Series A..."*
- *"This was somewhat on track until ChatGPT came along and it became very obvious that our product was not the right one for the era of coding agents. Our online structured editor didn't make sense when the LLM is generating the code, and it's a separate place to how people are coding using LLMs and agents: in custom editors like Cursor, or Windsurf, and Copilot in VSCode."*
- *"it was clear that an 8 year old product with no traction was not going to attract new investment."*

Biggar is now founder/CEO of Tech for Palestine; he personally invested in the successor.

The deeper post-mortem is **https://blog.darklang.com/an-overdue-status-update/ (12 Mar 2024)** by Stachu, listing five limiting factors verbatim: *"our custom in-browser editor was bad, and disjointed from our users' 'normal' development flows"*; *"supporting backwards-compatibility was slowing everything down"*; *"we weren't writing much Darklang code, ourselves"*; *"users voiced a feeling of vendor lock-in, due to our license and our-cloud-only runtime"*; *"broadly speaking, everything was incomplete: the language, editor, error-reporting, type-checking, package management. this made it hard to recommend."* On the projectional editor: *"our implementation was pretty rough around the edges, often leading users frustrated that they couldn't just type their code the way they wanted. Too fancy for our own good."* And: *"the editor was ~50% of our codebase."* They forked and deleted over half the repo in Feb 2023.

**Current state verified**: `darklang/dark` pushed **2026-08-22**, 2,169 stars, Apache-2.0 open-sourced Jun 2025, shipping fast — **v0.0.34 on 2026-08-09** (v0.0.28–34 all within Aug 2026). Still pre-1.0. The AI pivot is confirmed and is now the pitch (first-steps post, 16 Jun 2025): *"By controlling all parts of the development flow and making them available to AI at low levels, we enable incredibly tight iteration cycles."* Darklang-Classic is being wound down (signups disabled, dormant canvases shut off).

## 3. Glamorous Toolkit / feenk — **shipped-niche, very active, consultancy-funded**

`feenkcom/gtoolkit` pushed **2026-08-25**; releases are near-daily — **v1.1.564 on 2026-08-24**. feenk.com has repositioned onto legacy modernization + AI: *"Now that AI can generate code ever faster, it becomes impossible to ignore that the real bottleneck is making sense of systems."* Model is hands-on consulting. Same structural answer as Unison: services fund the tool.

## 4. Jonathan Edwards — **research-prototype, self-declared failure**

alarmingdevelopment.org is active. Posts: "Major revisions" (2025-12-11), "Subtext Retrospective" (2025-09-29), "Substrates vision statement" (2025-05-12), "Podcast interview" (2025-02-12), "DB usability: as if" (2025-03-01).

The retrospective is at **https://www.subtext-lang.org/retrospective.html** ("Reflections, Sep/Oct 2025"), verbatim: *"It is fair to say that Subtext was a series of overambitious failed experiments. I was trying to invent too many things at the same time. There was a reason for that: I believe programming is trapped in a local maximum that we can not escape by varying one dimension at a time. But it was just too hard: I kept running into tar pits of interlocking hard problems with high-dimension spaces of solutions."* And: *"Overall I think what was missing was an underlying theory to map a path through the tar pits, like PLs have lambda calculus and type theory, and DBs have relational algebra. What Subtext needed was a Theory of Change."*

On Chorus (Subtext 6): *"The programming experience was pretty much a failure."* On Coherent Reaction: *"only experts who had experienced these problems took them seriously... But these same experts had no interest in solving the problem with a new PL paradigm, which was seen as almost heretical."* His "Substrates vision statement" asks bluntly: *"Are we even a field?"* Current work is **Baseline** (with Tomas Petricek) — and the Dec 2025 post shows the Programming Journal asked for major revisions.

## 5. Sandblocks & Lamdu — **dormant / maintenance-only**

`tom95/Sandblocks` (mirrored at hpi-swa/sandblocks): last commit **2025-11-19**, 45 stars. Beckmann's active repo is now `mark-the-map` (2026-07-11) — moved on. `lamdu/lamdu`: 1,899 stars, pushed 2026-08-21, but the last three commits are *"Update deps"* and two Dependabot GitHub-Action bumps — **maintenance-only, no feature work**.

## 6. Dynamicland — **research-prototype, publicly dormant**

dynamicland.org is up but its newest linked material is 2024 (Intro, FAQ, Roots, communal science lab booklet). **Progress reports stop at 2022.** The archive page states: *"The archive is a work in progress. This is only complete through May 2016."* Their Mastodon (posts.dynamic.land/@dynamicland) has **4 total posts, last on 2025-05-16**. worrydream.com: *"I am (now and forever) making Dynamicland. Currently, we are building a dynamic library."* No evidence it reopened to the public.

## 7. Venues — **active and growing**

- **LIVE**: liveprog.org shows **LIVE'26, workshop 2026-10-17, online**, submissions due 2026-07-28. LIVE'25 happened (highlighted: Martin Eklund, *Spine*).
- **Onward!/SPLASH 2025** (Singapore, Oct 12–18) ran. Most relevant paper: **"What You See Is What It Does: A Structural Pattern for Legible Software"** — Eagon Meng, Daniel Jackson. Essays include Joel Jakubovic's "The Unix Executable as a Smalltalk Method". **SPLASH 2026: Oct 4–9, Oakland**, Onward! Papers + Essays tracks live.
- **Substrates-25 workshop** existed (Edwards submitted to it); I could not reach its site — UNVERIFIED whether it recurred in 2026.
- **futureofcoding.org has rebranded to "Feeling of Computing"** — active, hosts Ivan Reese/Jimmy Miller/Lu Wilson, latest episode #80, new wiki "just launched".
- Ink & Switch is celebrating 10 years; **Geoffrey Litt (malleable software) now works at Notion**, previously Ink & Switch.

## The pattern

Three independent structure-editor/codebase-as-database ventures converged on the same funding answer within a year: **Unison → consulting (Feb 2026), feenk → consulting, Dark Inc → insolvency and sale to employees (Jun 2025)**. The one explicit commercial post-mortem (Biggar) names the structured editor itself as the thing LLMs invalidated. Edwards, from the research side, names the missing piece as theory rather than engineering.

**Could not verify**: the Substrates workshop's 2026 status; whether Unison Computing has had layoffs (no evidence either way); Dynamicland's internal activity (absence of public posts is not proof of inactivity); PLATEAU's 2025/2026 status — I did not reach a PLATEAU page.
