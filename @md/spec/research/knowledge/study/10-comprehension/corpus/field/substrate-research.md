# The research lineage, and its post-mortems

Two agents censused the structure-editor, codebase-as-database and interface-as-data research lineage. The post-mortems are unusually candid, and they are the most useful part — three ventures converged on the same funding answer within a year, and the one explicit commercial post-mortem names the structured editor itself as the thing models invalidated.

## 1. The funding answer is consulting

**Unison** shipped release 1.0.0 on 2025-11-25, eight years in, with four releases since through 2026-08-19 — but cadence halved, from about three releases a month in late 2024 to about one in 2026. The important find is a blog post of 2026-02-19: "We are spinning up a consulting group, now open to work in a variety of languages… Our goal is a self-sustaining model in which a mix of consulting and product revenue funds development of Unison-based tech well into the distant future. We aim to be cash flow positive as a business in the next 12 months and could use your help in getting there." A services pivot, not a wind-down — but it says the product alone does not fund the company.

**Glamorous Toolkit / feenk** is very active — near-daily releases — and repositioned onto legacy modernisation plus AI: "Now that AI can generate code ever faster, it becomes impossible to ignore that the real bottleneck is making sense of systems." The model is hands-on consulting. Same structural answer.

**Dark Inc ran out of money.** The post of 2025-06-16, verbatim: "Dark Inc has officially run out of money"; "we burned cash too quickly between 2017 and 2020. The product wasn't quite good enough back then to raise a Series A"; and the sentence that matters most here:

> "This was somewhat on track until ChatGPT came along and it became very obvious that our product was not the right one for the era of coding agents. Our online structured editor didn't make sense when the LLM is generating the code, and it's a separate place to how people are coding using LLMs and agents."

The deeper post-mortem, from March 2024, lists five limiting factors verbatim: "our custom in-browser editor was bad, and disjointed from our users' 'normal' development flows"; "supporting backwards-compatibility was slowing everything down"; "we weren't writing much Darklang code, ourselves"; "users voiced a feeling of vendor lock-in, due to our license and our-cloud-only runtime"; "broadly speaking, everything was incomplete." On the projectional editor specifically: "our implementation was pretty rough around the edges, often leading users frustrated that they couldn't just type their code the way they wanted. Too fancy for our own good." And: "**the editor was ~50% of our codebase.**" They forked and deleted over half the repository in February 2023.

The successor company is open-source, shipping fast, still pre-1.0, and the AI pivot is now the pitch: "By controlling all parts of the development flow and making them available to AI at low levels, we enable incredibly tight iteration cycles."

## 2. The research-side post-mortem names theory, not engineering

Jonathan Edwards published a Subtext retrospective in late 2025, and it is worth carrying whole:

> "It is fair to say that Subtext was a series of overambitious failed experiments. I was trying to invent too many things at the same time. There was a reason for that: I believe programming is trapped in a local maximum that we can not escape by varying one dimension at a time. But it was just too hard: I kept running into tar pits of interlocking hard problems with high-dimension spaces of solutions."

And the diagnosis:

> "Overall I think what was missing was an underlying theory to map a path through the tar pits, like PLs have lambda calculus and type theory, and DBs have relational algebra. What Subtext needed was a **Theory of Change**."

Two further observations from the same body of work. On one of his systems: "The programming experience was pretty much a failure." On another: "only experts who had experienced these problems took them seriously... But these same experts had no interest in solving the problem with a new PL paradigm, which was seen as almost heretical." His vision statement asks bluntly: "Are we even a field?"

## 3. The interface-as-data line, and its sharpest concept model

**Varv** (Aarhus, CHI 2022) has the sharpest concept model of the four systems examined. Its unit of composition is the **concept** — "an individual named unit of interactive behavior, for instance, a 'todo' in a todo list application" — holding a **schema** defining the shape of its state through named properties, **actions** with an optional condition block and a required effect block, and **triggers** on property changes or view events. Extension is first-class: multiple concept definitions merge, and four operators — inject, join, pick, omit — compose them. The site's claim: "Any Varv program can be extended or modified with new features or capabilities without changing the original source code."

Its status is the lesson. Fourteen stars, last human push 2024-10-23, recent commits are automated build artifacts: **dormant**. The platform beneath it is alive — 273 stars, human commits through 2026, though no release since 2019 — and the successor line is a local-first reimplementation presented at UIST 2024 and built on Automerge in collaboration with Ink & Switch, plus a cross-reality spatial version. The publications page lists nothing after 2022 and is stale relative to the repositories. Third-party traction is negligible.

**Mavo** is the cautionary case: 2,863 stars, **277 open issues**, zero maintainer commits on the main branch since 2024-08-27, last release June 2024, and **no public explanation anywhere**. Its author's blog is very much alive with eleven posts across 2025–26; her Mavo tag page has nothing newer than July 2020; her current-project list does not include it.

**Hazel** is the clear live one: 1,140 stars, pushed the day before the sweep, multiple committers. Its model-adjacent paper is *Statically Contextualizing Large Language Models with Typed Holes* (OOPSLA 2024), combining language servers with models to improve completion. But note the stated strategic direction is **education and proof assistance**, not models — a 2024 grant is about turning it into a classroom proof assistant, and its 2025 output is four papers on typing, structure editing and derivations.

**Alex Obenauer** is still publishing lab notes and at roughly one a year — 2023, 2024, then July 2026 — with visible energy diverted into hand-binding a physical book about computing. His itemised-timeline operating-system experiment is explicitly finished: built 2021–2023, written up in 2024, never released. Nothing of his is downloadable software.

## 4. Dynamicland is publicly dormant

The site is up and its newest linked material is 2024. **Progress reports stop at 2022.** Its archive page states it is complete only through May 2016. Its social account has four posts total, the last in May 2025. Its founder's own page says "I am (now and forever) making Dynamicland. Currently, we are building a dynamic library." Absence of public posts is not proof of inactivity — but its influence in this sweep comes entirely from documents that predate the agent era. The argument itself is in [`opposition.md`](opposition.md).

## 5. The venues are active and small

**LIVE** ran in 2025 and scheduled 2026-10-17. **Onward! / SPLASH 2025** ran in Singapore, with a directly relevant paper — *What You See Is What It Does: A Structural Pattern for Legible Software* — and SPLASH 2026 is scheduled. **ACM Hypertext** continues at roughly 55 papers a year: alive, small, and largely social-media-facing. The future-of-coding community renamed itself and is active with a new wiki. **Ink & Switch** marked ten years in 2026 and is the healthiest research node in the lineage — see [`../substrate/local-first.md`](../substrate/local-first.md).

One personnel note worth carrying: the author of the malleable-software essay now works at a major productivity company, and the field's most prominent tools-for-thought researcher left to build something else.

## 6. The pattern

Three independent structure-editor and codebase-as-database ventures converged on consulting as the funding answer within a year. The one explicit commercial post-mortem names the structured editor itself as what models invalidated. And from the research side, the diagnosis is that the missing piece is **theory rather than engineering** — which is the most transferable warning in the lineage for anyone attempting the same thing again.

Reports: [`a4bdd8ce92076fef2`](../../../../../sweep-2026-08/raw/a4bdd8ce92076fef2.md), [`a5105d288fc90070c`](../../../../../sweep-2026-08/raw/a5105d288fc90070c.md).
