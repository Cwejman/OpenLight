# The ground out there

*One piece, built only from the 45 raw reports of the web sweep dated 2026-08-26. Every claim below carries the confidence the sweep gave it; where an agent could not open a source, that is said. Two cautions from the sweep apply throughout: the agents' search budgets often ran out mid-work, so freely available sources are over-represented; and two agents caught automated summarisers inventing quotations and sample sizes, so every figure here is worth what its agent's own check made it worth — no more.*

Four understandings run through everything below. Each later section is detail hanging from one of them.

**First: most of what this field repeats was never measured.** The numbers everyone quotes about writing, documentation, and knowledge — a late fix costs 100 times an early one; developers read ten times more than they write; the mind holds seven items; good documentation makes teams 2.4 times better — trace back to a training unit's brochure, one man's memory of watching an editor replay, a number its own author called a coincidence, and a survey whose own later editions reported the opposite. This is not old truth gone stale. There never was a study. So in this territory, a repeated number is a lead, not ground.

**Second: the honest evidence comes in two kinds.** There is a small stack of real experiments — old, small, but real. And there is convergence: when many teams that never met hit the same wall and build the same fix, the fix is the finding. The sweep surfaced at least four such convergences, each paid for in production pain. They are the closest thing this territory has to laws.

**Third: everything measured agrees that knowledge travels or fails at the receiver, not in the prose.** What the reader already knows, whether they can find the right piece, and whether anything downstream consumes the writing — these dominate every measured outcome. The style and format of the text itself are second-order everywhere someone actually checked. This holds for firms, for professionals, for students, and — the newest results — for machines.

**Fourth: the reader has changed species.** By mid-2026, machines are the majority reader of documentation. That one change moved the value from content to addresses, made plain files a moat, made large typed bodies a liability and small typed edges essential, emptied a whole product category, and reopened a thirty-year-old fight about whether structure helps a reader or taxes a writer.

The first four sections below take these in order. The fifth maps the people: who holds which piece of these questions, and who stands against. The last names what nobody knows yet.

---

## Check every number

The famous numbers of this field dissolve when someone walks them back to their sources. This section holds those walks, because they change the weight of everything read afterwards. Two things come out of it: the corrected versions are almost always more interesting than the myths; and a small craft of people does this tracing work, and their names are worth knowing.

### The numbers that dissolved

- **"A defect found late costs 100 times more."** Laurent Bossavit chased the usual citation — a study by the "IBM Systems Sciences Institute" — and found that the institute was an IBM training unit in Los Angeles, active roughly 1967–1982. It ran courses. It published no study. The chase itself is a pleasure to read at [his research gist](https://gist.github.com/Morendil/ebfa32d10528af04e2ccb8995e3cb4a7). Barry Boehm, the man behind the cost curve, wrote with Victor Basili in 2001 that the factor is "often" 100:1 and "more like 5:1" for small, non-critical systems — [the concession is in their own words](https://www.cs.umd.edu/projects/SoftEng/ESEG/papers/82.78.pdf). And the largest test of the idea, 171 projects from 2006–2014, [found no evidence for the delayed-issue effect at all](https://arxiv.org/abs/1609.04886).

- **"Developers read ten times more code than they write."** The source is chapter 1 of *Clean Code* (2008). Robert Martin's stated evidence is his memory of playing back Emacs editing sessions from the 80s and 90s and seeing mostly scrolling. No instrument, no count, no earlier source — the ratio appears to begin with him. What has been measured is different and better: Xia and colleagues instrumented 78 professional developers for 3,148 working hours ([the paper](https://xin-xia.github.io/publication/TSE17.pdf)). Comprehension took about 58% of working time, editing 5% — and a large share of the "reading" was browsers and documents, not source code. Comprehension time also fell steeply with experience: 66% for juniors, 44% for seniors. That is the best-powered expertise finding in the whole sweep.

- **"The mind holds seven items" — or four.** George Miller himself, in 1956, called his seven "only a pernicious, Pythagorean coincidence" and pointed at chunking as the escape. Cowan's famous four is a limit that only appears when experiments deliberately block chunking — the opposite of reading a document you can re-read. Chase and Simon's chess study, often cited for the chunk limit, tested three people and *assumed* Miller's span rather than finding it. And Dunbar's 150: a 2021 reanalysis found the real 95% confidence intervals run from 2 to 520, concluding that "specifying any one number is futile."

- **Rules about menu width and depth.** Every real result here is tied to a fixed item count. Miller (a different Miller — Dwight, 1981) found two levels of eight best — for exactly 64 items. Kiger's fastest tree was four wide at the top, sixteen below. Larson and Czerwinski (19 people, 512 items) found both two-level trees beat the three-level one — and the winning level was thirty-two wide. None of this supports "two levels, small numbers" for a corpus of any other size. The verification agent's summary: the winning widths (8, 16, 32) all exceed the working-memory numbers the rules are supposedly derived from.

- **Nielsen's card-sorting sample sizes.** The correlation numbers quoted by hundreds of blogs (0.90 at 15 users, and so on) were read off a graph in a non-peer-reviewed 2004 conference paper; they appear nowhere in its text. Worse, the one direct validity test of card sorting (Schmettow & Sommer 2016, DOI 10.1080/0144929X.2016.1157207) found that the match between the card-sorted mental model and the site structure has **no effect** on how well people browse. The method the whole information-architecture trade runs on failed its only real test.

- **DORA's documentation multipliers.** The 2021 report said teams with quality documentation are 2.4 times more likely to perform better. The 2022 report, under "Surprises": documentation "negatively impacted software delivery performance." The 2023 report: "no effect... the second year we see this behavior." The 2025 report removed the construct and retreated from the word "effects" entirely. [The capability page](https://dora.dev/capabilities/documentation-quality/) is still up; cite it only with that whole arc attached.

- **The AI-era vendor numbers.** Anthropic's widely quoted "150,000 tokens down to 2,000 — a 98.7% saving" is, on a careful read of the post, an illustrative example with no methodology; the mechanism is real, but the papers that measured it found effects one to two orders of magnitude smaller. Microsoft's "LazyGraphRAG at 0.1% of the cost" describes code that never shipped. "Knowledge graphs make LLMs 3× more accurate" is one vendor's 43 questions against a deliberately weak baseline.

- **Luhmann as proof of shallow note structure.** The archive of his Zettelkasten (about 90,000 slips over about 45 years) documents branches up to four levels deep, one collection with 108 top divisions, and — in the archive's own words — no strictly hierarchical order at all. He is a counter-example to the shallow-structure rule he is usually quoted for.

### Practices that spread without evidence

Adoption and evidence do not move together in this field. The clearest cases:

- **AGENTS.md.** Sixty thousand-plus repositories and Linux Foundation stewardship — and the most rigorous evaluation, [from the ETH Zürich group](https://arxiv.org/abs/2602.11988), found repository context files "do not generally improve task success rates, while increasing inference cost by over 20% on average." The widest adoption and the clearest null result live in the same object.

- **Architecture Decision Records.** ThoughtWorks moved them to "Adopt" in 2017 on zero data. The first real count (2023, DOI 10.1109/ACCESS.2023.3287654, from 26 million GitHub users down to 921 adopting repos) found half of all ADR files written once and never touched again, and sustained team use in 4.6% of adopting repos. The first study to look for an effect (ICSA 2026, DOI 10.1109/ICSA66085.2026.00040) found "at most, modest observable effects" — and that 63% of ADRs are opened already marked "accepted," skipping the deliberation they exist to record.

- **RFC-style processes.** The only throughput measurement anywhere is a 20-RFC sample from 2018. The pattern that does show in the data, across Rust, Kubernetes, and the IETF, is that the heavyweight process has no exit path: Rust has 215 open RFCs with a median age of 905 days; Kubernetes has 343 live enhancement proposals of which only 14 were ever explicitly killed. The one intervention with a visible before/after is routing around: Rust's lightweight compiler proposals clear (585 filed, 17 open), and Python stood up four domain councils so that a PEP has less to decide.

- **Card sorting and tree testing.** An industry's core methods, resting on one non-peer-reviewed 2004 dataset, a blog post that invented its numbers, one vendor anecdote (31% to 67% success on one New Zealand site, no control) — and the null validity result above.

- **DITA and the structured-authoring industry.** The 2.0 specification is six years past its promised date, written in practice by one committer; there is no peer-reviewed study of its reuse savings; the circulating "30–40% saving" figures trace to vendor calculators citing each other; and the professional society that carried the field in North America, the STC, went bankrupt in January 2025 with membership down from ~25,000 to ~4,500.

The lesson is not cynicism. It is a sorting rule: adoption tracks stories, defaults, and ease of starting — so what spread tells you what is cheap to begin, and only convergence under pain tells you what holds. That second kind of evidence is [the third section](#the-shapes-the-world-converged-on).

### What real measurement looks like here

A few things in this territory were actually measured, and they set the standard for what "known" means.

- **The Minimal Manual.** John Carroll, 1987: real randomized experiments on manual design — the minimal manual cut learning time about 40% ([the original paper](https://davis68.github.io/2016-12-12-ttt-uiuc/files/papers/carroll-minimal-manual-1987.pdf)). It was replicated in the 1990s by its own sharpest critic, Hans van der Meij. A pooled analysis of 13 effects put the gain around one standard deviation — but that pooling was never peer-reviewed, the total sample is 288 people, the tasks are 1980s word processors, and the analysts themselves suspect the active ingredient is simply cutting redundant text. Carroll's own first misconception to correct: "Minimalism means brevity" — it does not; it means task-orientation and error recovery. This remains the *only* credible causal evidence that document design changes user outcomes, and it is almost forty years old.

- **The instrumented time studies.** Xia's 78 developers (above) and Meyer's whole-day study (20 professionals, ~11 workdays each): reading-editing-navigating code is 21% of a developer's whole day once email, meetings, and browsing are counted. The two numbers are compatible — different denominators — and together they replace the 10:1 folklore with something usable.

- **A noise floor for the AI era.** One pre-registered study found that temperature-zero inference flips about 9% of per-task outcomes between byte-identical runs on the standard coding benchmark ([the paper](https://arxiv.org/abs/2607.09691)). Every single-run claim of a few points' improvement — on either side of any argument — is under that waterline.

- **The audit craft is alive.** Besides Bossavit: Eveleens and Verhoef dismantled the Standish CHAOS figures (DOI 10.1109/MS.2009.154), and Frattini and colleagues [audited 57 requirements-quality papers](https://arxiv.org/pdf/2309.10355) and found the claimed impacts "dominantly hypothesized" — 47.5% of them never tested at all. The sweep's own agents joined this craft: one caught an automated summariser inventing "N=22, 10 companies" for a study whose real figures are 271 observations, 122 transfers, 8 companies. The rule that falls out: read the primary source, or mark the claim as unread.

---

## The receiver decides

Four separate literatures — organisational research, studies of professionals at work, learning science, and the new machine-reader evaluations — were swept by different agents who did not read each other's reports. They agree on one law: knowledge moves or fails at the receiving end. The receiver's prior knowledge, the receiver's ability to *find* the right piece, and whether anything downstream *consumes* the artifact decide the outcome. Prose quality and format are second-order everywhere they were measured. This section holds the four bodies of evidence; each subsection stands alone.

### Inside organisations

- **Szulanski, 1996 — the founding measurement.** 122 transfers of best practice across 8 firms ([the primary paper](https://josephmahoney.web.illinois.edu/BADM%20545_Spring%202008/Paper/Szulanski%20(1996).pdf); read the robustness paragraph, not just the abstract — only the top three ranks are stable). The barriers that dominated were knowledge-side, not will-side: the receiver's limited capacity to absorb (weight 0.54), the inherent ambiguity of the knowledge (0.34), and a painful relationship between sender and receiver (0.33). Motivation ranked low. Insight fails to travel mainly because the receiver cannot absorb it, the sender cannot fully explain it, and the channel between them hurts.

- **Cohen and Levinthal — absorption is a property of the receiver.** Their "absorptive capacity" is the ability to use new knowledge, and it is a function of prior related knowledge. It replicated, with heavy variation by context. The sharp consequence: an organisation that has outsourced away its own technical people has, by construction, destroyed its ability to absorb what its vendor writes for it. No document quality fixes that.

- **Carlile — three kinds of boundary.** Different words (a glossary fixes it), different meanings (explanation fixes it), different *interests* (nothing written fixes it — both sides must change what they know and want). Client-vendor boundaries are the third kind. Documentation improvements underperform exactly there, and predictably so.

- **Clark and Brennan — why "go ask someone" keeps winning.** People minimise *joint* effort. Conversation repairs misunderstanding in the moment, cheaply. A document is maximal in re-readability and zero in in-the-moment repair, so its failures compound silently — which makes asking a person the rational move, not a cultural failure. [The chapter is freely available](https://web.stanford.edu/~clark/1990s/Clark,%20H.H.%20_%20Brennan,%20S.E.%20_Grounding%20in%20communication_%201991.pdf).

- **Conway's law has real teeth.** On Windows Vista (3,404 binaries, over 50 million lines), organisational-structure metrics predicted which components would fail at 86.2% precision — beating every code metric: churn, complexity, dependencies, coverage ([the Microsoft Research paper](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-2008-11.pdf)). The strongest single piece of hard evidence in this whole lane says: structure of the *organisation* out-predicts every property of the artifact.

- **Onboarding: mentors first, documents second.** Microsoft surveyed 411 developers plus their version-control data ([the paper](https://thomas-zimmermann.com/publications/files/rastogi-esem-2015.pdf)). In the rated factors, missing documentation was the strongest drag on time-to-first-checkin. But when developers answered freely, mentorship came first, documentation second. Developers without assigned mentors reported significant lost time.

- **Only load-bearing writing survives.** Across six automotive companies, Wohlrab and colleagues found that artifacts which *generate* something downstream (code, tests, other artifacts) get maintained, and artifacts that merely describe do not ([the study](https://arxiv.org/pdf/1904.12131)). Their blunt guideline: produce descriptive documentation as late as possible and only when actually needed. Google's one published number about its own wiki says the same thing from the other side: when GooWiki was deprecated, about 90% of its documents had had no views or updates in the previous few months.

### Professionals reading

- **Expertise is a main effect, not a shield.** The best-designed professional-reader experiments in the sweep: Martínez, Mollica and Gibson tested 105 practising lawyers against laypeople on legalese versus plain versions of the same contracts (DOI 10.1073/pnas.2302672120, free full text). Lawyers scored higher on everything — and bad prose (especially clauses nested inside clauses) hurt them just as much as everyone else. There was no interaction between training and register. A second experiment: 102 lawyers rated the *simplified* contracts equally enforceable and of higher quality. Domain expertise does not neutralise bad writing; it just starts from a higher floor.

- **Specific beats vague, measured in real decisions.** Grol tracked 61 GPs across 12,880 real clinical decisions (DOI 10.1136/bmj.317.7162.858, free): clear guideline recommendations were followed 67% of the time, vague ones 36%. Observational and confounded — but large, and in professionals doing their actual work.

- **Preference is not comprehension.** The only randomized guideline-format trial in practising physicians (Brandt 2017, DOI 10.1136/bmjopen-2016-011569, free): 181 physicians overwhelmingly preferred the layered format (72% vs 16%) — while correct understanding moved only from 58% to 72%, just missing significance, and clinical action didn't move. Any format claim resting on reader preference surveys should be discounted accordingly.

- **The failure mode is retrieval, not comprehension.** When 13 clinicians worked from a real paper guideline, they could read it fine; they could not *find* the recommendation that applied to their patient (Kilsdonk 2016). NASA's deepest analysis of airline emergency handbooks found the same: flow lines that die across page breaks, jump chains with no evident reason — and tagged the core usability questions "Further Research Needed." For long documents used repeatedly by professionals, navigation is the dominant variable. Aviation and medicine converged on this independently.

- **The artifact does not carry the effect; the implementation does.** The surgical checklist arc: Haynes 2009, eight hospitals, deaths nearly halved — no control group. Urbach 2014, 101 hospitals after a government mandate: no effect. Haugen 2015, the only randomized trial: strong effect where the checklist came with an engaged rollout. A well-designed procedural document changes outcomes only when the people around it do the work. Designing the artifact is necessary and radically insufficient.

- **"Strip the guidance, your readers are experts" has no field evidence.** The expertise-reversal effect — assistance that helps novices harming experts — is real in students (a 2025 pooled analysis of 60 studies, [open access](https://www.pedocs.de/volltexte/2026/34113/pdf/Learn_and_Instr_2025_Tetzlaff_u.a._A_cornerstone_of_adaptivity.pdf)). But its moderator table contains not one study of practising professionals, the effect is asymmetric (helping novices is a much bigger effect than the harm to experts, which is non-significant within every education level), and the only professional-population data — the lawyers above — shows expertise raising the whole curve without buffering anything.

### The lab floor

What learning science actually gives to anyone designing text, in one honest paragraph: the effects are real, small, measured on students reading short passages once, and they shrink precisely where working documents live — self-paced, high-prior-knowledge, goal-directed readers (that moderator is measured across 1,189 studies in Noetel 2021). Within that frame: putting the governing idea at the top level is supported (top-of-structure relations carry comprehension; low ones barely register — Meyer's "levels effect"). Signal words — "in contrast," "as a result" — are the cheapest supported intervention. Cutting a text into bounded, self-contained sections is supported, mainly because it gives the reader control of pace. A story outperforms an essay by the largest margin in the whole literature (a pooled result over 33,000 participants, DOI 10.3758/s13423-020-01853-1). Against that: opening with something deliberately *more abstract* is the one part of the classic "advance organizer" theory the evidence specifically failed to confirm — concrete beats abstract openers, and the overall organizer effect is small (d ≈ 0.21). Effects at a delayed test mostly vanish. Extra links in hypertext measurably hurt reading, and hierarchical link structure largely rescues it — networks do not. And deliberately under-explaining does not help skilled readers; the celebrated "coherence reversal" applies only to knowledgeable readers who are *poor* comprehenders.

### Machines: the same law, measured again

The newest evidence re-derives the receiver law on a new species of reader.

- **Prose context files do not move machine success.** The ETH result above, corroborated by an independent 288-run ablation ([Khatri](https://arxiv.org/abs/2607.27250)): agents fail on implementation skill — design, pattern choice, exact wiring — not on missing repository knowledge a file could supply. The real AGENTS.md "never converts a near-miss to a pass."

- **What does help is navigational.** The one positive controlled result ([probe-and-refine tuning](https://arxiv.org/abs/2606.20512)): tuned guidance lifted resolution from 25.5% to 33.0% — and the entire gain came from agents reaching the right files (+14.5 points of coverage) while patch quality stayed flat. Guidance works as a map, not as a teacher.

- **Summaries carry almost nothing an agent can act on.** With retrieval held fixed and only the representation varied ([the pre-registered study](https://arxiv.org/abs/2607.09691)): natural-language summaries answered 4 of 45 behavioural questions the source itself answers — 27 of 45 — and a frontier model's summaries scored exactly as poorly as a tiny model's. The gap belongs to the representation, not the summariser.

- **Carrying the heading path into every chunk pays.** On a production Markdown knowledge base, prefixing each chunk with its chain of headings lifted retrieval quality 23.8% with zero extra model calls ([the paper](https://arxiv.org/abs/2608.00824)). Hierarchy is retrieval signal — carried *into* the piece, not used to split it apart.

- **llms.txt works only as a map.** As a crawler channel it is empirically dead: a 900-domain server-log study logged zero requests from any frontier AI crawler, and Google said flatly it has no effect. But in a 2,400-trial benchmark, linking it cut agents' invented dead URLs by ~90%. Same mechanism again: finding, not content.

- **The one organisation that restructured content and measured.** Intercom used causal-inference matching across ~1,000 customers ([the write-up](https://fin.ai/research/a-causal-inference-approach-to-measuring-the-impact-of-improved-rag-content/)): improving knowledge-base content raised automated-resolution rates by 1.23 points on average — and the correlation between the *number* of improvements and the impact was only 0.22. Targeting the right piece beat volume. Eight targeted fixes could touch 76% of conversations.

The section's single conclusion, for both species of reader: the highest-value writing is the kind that says where things are and what can be stood on. The map and the ground. Explanation at length is the part every measurement keeps discounting.

---

## The shapes the world converged on

Since the numbers are folklore and the experiments are scarce, the strongest evidence about *systems* in this sweep is convergent evolution: independent teams, different decades, same wall, same fix. Four shapes recur. Each was paid for by someone, and the payments are documented.

### Hierarchy without the chain rule

The chain rule — if A is inside B and B is inside C, then A counts as inside C — feels natural and breaks everywhere at scale.

- **The most successful W3C vocabulary refused it on purpose.** SKOS (2009) defines "broader" as a *direct* link only; A-broader-B and B-broader-C does not give A-broader-C. The chained version exists as a separate, opt-in property. [The rationale is in the spec](https://www.w3.org/TR/skos-reference/), and it survived where richer schemes rotted.

- **The rot, measured.** In Wikidata, about 2.39 million classes are simultaneously marked as both a thing and a kind of thing, with nearly two million contradictory pairs — root cause: ordinary editors mixing up "is one of" and "is a kind of" ([the measurement](https://arxiv.org/html/2411.15550v1)). Chained typing degrades under many-owner editing.

- **Google paid the cost in its permission system and wrote it down.** The Zanzibar paper says chasing nested group memberships "has difficulty maintaining low latency" ([the paper](https://www.usenix.org/system/files/atc19-pang.pdf), section 3.2.4). The fix, Leopard, pre-computes the full chain — at the price that one membership write can trigger "tens of thousands" of index events, so Google applies it only to selected namespaces. The open-source descendants first added depth limits (25, 50 — with no cycle detector; a cycle is found by hitting the wall) and are now [removing them as the wrong measure](https://openfga.dev/blog/weighted-graph-upcoming-changes): fan-out, not depth, is the real cost.

- **The AI layer turned the leak from latent to actual.** Inherited permissions were harmless while discovery was manual; a retrieval layer walks the whole chain exhaustively. Microsoft now documents the failure in its own product docs — its stopgap "isn't a security boundary" and is being retired ([the page](https://learn.microsoft.com/en-us/sharepoint/restricted-sharepoint-search)). Google Drive removed the ability to grant *less* access than a parent folder. The sweep's line for it: the AI didn't create the leak — it enumerated it.

### Change by forbidding, not translating

Every production system that survived schema change bought safety the same way: by making the breaking change impossible to express, and forcing a new name instead. And the one serious attempt at the beautiful alternative — automatic two-way translation between schema versions — documented exactly why it stopped.

- **Cambria, honestly.** Ink & Switch's lens system (Litt, van Hardenberg, Henry, 2020 — [the essay](https://www.inkandswitch.com/cambria/)) is the most instructive failure in the sweep because its authors wrote down everything. They started by translating data on write and abandoned it ("too much translation work was happening eagerly on write"), pivoting to tag-each-write-with-its-schema and translate on read. Their flagship operator, `convert`, is by their own admission not actually a lens — it guarantees nothing. Their appendix on converting a single value to a list ends: "there is no ideal solution." The lab lists the project as Completed, 2020; the code is dead; there is no successor.

- **The mathematics says the wall is real.** The foundational lens paper (Foster and colleagues, [TOPLAS 2007](https://www.cis.upenn.edu/~bcpierce/papers/lenses-toplas-final.pdf)) drops the one law — PutPut — that would make chained migrations safe, because the operators you actually want "fail to satisfy it for reasons that seem pragmatically unavoidable." Applying two changes one at a time need not equal applying them together. The research field itself went quiet after 2022.

- **What shipped instead, everywhere, independently.** Avro sends the writer's schema with the data and resolves at read — eighteen years in production ([the rules](https://avro.apache.org/docs/1.12.0/specification/)). Protobuf forbids reusing field numbers forever and deleted `required` from the language because a constraint you can never relax compounds into a liability. Datomic: "You can never alter :db/valueType" — and, notably, time-travel does not take the schema back in time. ATProto states the whole discipline in one sentence — all old data must be valid under the new schema, and new data valid under the old; types cannot change; fields cannot be renamed; bigger changes take a new name ([the spec](https://atproto.com/specs/lexicon)). Kafka's registry offers the same as a dial, where the only setting honest about peers you cannot force to upgrade is full compatibility in both directions, checked against all versions ([the modes](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html)) — and its default is not that, which is a known trap. Fowler's expand-migrate-contract is the same shape as process ([ParallelChange](https://martinfowler.com/bliki/ParallelChange.html)). GraphQL's "never version, only deprecate" failed at the one place big enough to test it: Shopify versions quarterly and delists apps that call removed fields.

- **And nobody merges structure.** Dolt — the "git for data" that actually works — blocks the merge on a schema conflict and resolves by taking one entire side ([the docs](https://www.dolthub.com/docs/sql-reference/version-control/merges)). Iceberg has no branch merge at all, only fast-forward. TerminusDB, the one system that models schema change as a first-class replayable operation, has left `ChangeParents` — migrating the inheritance hierarchy — unimplemented ([its migration guide](https://terminusdb.org/docs/schema-migration-reference-guide/)). The sweep's verdict, worth keeping verbatim: nobody merges structure; they serialize it.

### Type the edges, keep the body prose

The 2026 stress-test of "structure everything" ended in the sharpest decision rule the sweep produced. The evidence splits clean.

- **Structure lost the body.** Every extraction benchmark is brutal: a model reconstructing column meanings scores 0.223 when forced to answer everything, 0.475 when a code-enforced gate lets it decline — the authors' line is that the gate is "a competence detector, not a competence amplifier" ([Rosetta](https://arxiv.org/abs/2608.07946)). On a 369-field schema, every frontier model produced 0% valid output ([ExtractBench](https://arxiv.org/abs/2602.12247)). A typed store filled by inference is worse than prose, because a wrong type answers confidently while incomplete prose fails visibly. Even the curated skill files everyone adopted: the only controlled benchmark found them *lowering* pass rates 1.3–4.2% at 72–394% more tokens ([WebDev-Skills-Bench](https://arxiv.org/abs/2608.23067)).

- **Structure won the edges.** Identity, permission, freshness, address, action space. MCP's July 2026 revision is the cleanest illustration: in one release it deleted its conversational layer (sessions, handshake, server-initiated requests) and *hardened* its typed layer (mandatory discovery, required result types, required cache fields — [the changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)). It became less of a conversation and more of a typed, addressable capability index.

- **Small declared vocabularies win; induced ones lose.** A memory system with thirteen fixed categories beats elaborate graph memories. A query agent with a typed vocabulary of fifteen relational operations beats both free-form generation and heavy pipelines. And the open web itself: schema.org offers 958 types, of which 12 reach ten million domains and about 77% sit below a thousand ([schema.org's own data](https://blog.schema.org/2026/06/04/announcing-the-schema-org-usage-statistics-dataset/)). A closed vocabulary of a dozen types is not a limitation; it is what the world converges on anyway. The cautionary giant on the other side is Cyc: roughly $200M and 2,000 person-years, and its owner-scoped contexts multiplied rather than consolidated ([a good account](https://yuxi.ml/essays/posts/cyc/)).

- **The one-line law.** From a study of what format does across chains of models: "Structure buys a faithful, error-localizing channel — not an error-correcting code" ([the paper](https://arxiv.org/abs/2607.09678)). Structure tells you *where* it broke. It does not stop it breaking.

### The renderer stays closed

Wherever software renders typed data, the set of renderers is a closed list a vendor owns — and five independent teams that tried server-driven UI at scale hit the same wall and invented the same fix.

- **The wall: a new component kind costs a client release.** Plaid says it flatly — adding a new pane kind is a major version bump requiring an SDK upgrade ([their write-up](https://plaid.com/blog/a-new-architecture-for-plaid-link-server-driven-ui-with-directed-graphs)). Airbnb ([Ghost Platform](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)), [DoorDash](https://doordash.engineering/2021/08/24/improving-development-velocity-with-generic-server-driven-ui-components/), [Lyft](https://eng.lyft.com/the-journey-to-server-driven-ui-at-lyft-bikes-and-scooters-c19264a0378e), and Shopify all converged on the same fix: capability negotiation — the client declares what it can render, the server refuses to send anything else. Uber's Screenflow went furthest — its CI recompiled every screen against every previously shipped runtime — and was shut down with the department ([the post-mortem](https://artem-tyurin.medium.com/screenflow-an-unfinished-attempt-at-a-cross-platform-server-driven-ui-at-uber-749c1bc1d89)). Two smaller findings from the same wall: DoorDash built generic fallback components out of fear and found them "not useful at all"; and every team's untyped escape hatch eroded until they re-typed it against the design system.

- **The knowledge tools hit the same closure one level down.** Notion, Airtable, Tana, and Anytype all let you extend the *instances* — new types, new fields — and all hold the *view kinds* as a closed list (ten, six, seven, six). None lets you define a new property type either; those are enums in the protocol, not records in the store. Nobody lets a third party register a renderer that bids to draw a type.

- **The counter-examples worth studying.** WordPress Gutenberg is the one mainstream system where a component's contract is queryable at runtime — a registry you can ask "what can render this content?" ([the API](https://raw.githubusercontent.com/WordPress/gutenberg/trunk/packages/blocks/README.md)). JSON Forms does it with ranked predicate testers — and its own maintainer wrote down in 2026 that the abstraction leaks and customisation means overriding every renderer. React, meanwhile, deleted its only runtime prop contracts in v19 — the dominant component model moved *away* from runtime inspectability exactly when agents began to need it.

- **The market's verdict on closed derivation.** Retool rebuilt itself on plain React and TypeScript in June 2026, saying its own visual abstraction "prevented LLMs from working fluently" ([the announcement](https://retool.com/blog/retool-launches-react-ai-app-builder)). Read precisely, that is not a verdict against deriving UI from typed data. It is a verdict against derivation whose output nothing else can inspect. Every survivor's remaining moat is the same three things: schema, permissions, governance.

---

## The reader changed species

The 2025–26 shift is not a forecast; it is measured traffic, shipped platform features, and a visible market rearrangement. A machine reader amplifies everything in [the receiver section](#the-receiver-decides): it needs addresses more than content, it cannot repair misunderstanding in the moment at all, and its physical limits are now benchmarked.

### The traffic, and the file moat

- **Machines became the majority reader.** On Mintlify's fleet, agents were 66% of documentation traffic by July 2026, up from 15% in January — 213 million agent requests against 105 million human page loads, with 83.7% of agent requests using explicit machine routes ([the report](https://www.mintlify.com/blog/state-of-docs-traffic); one vendor's fleet, self-classified — a floor, not a census).

- **Plain files won, for a reason nobody predicted.** Markdown became a moat because agents read it. The clearest natural experiment: Logseq spent four years moving off plain files into a typed database and shipped in July 2026 — into a community whose top response was "too little, too late," with users leaving for Obsidian precisely because agents could no longer read their notes. Obsidian's answer — typed database *views* over plain Markdown files, both at once — is the market's compromise, and it is winning.

- **The venture-funded middle evacuated.** Tana split itself into a maintained outliner and a new agentic meeting product. Notion killed Notion Mail for "agent-based email workflows." Mem became "your AI chief of staff." Coda became a document layer inside an AI suite. What remains as pure tools-for-thought is bootstrapped and small — or dead. The new entrants state the new thesis in their taglines: "notetaking for you and your agents."

### The machine reader's measured limits

- **Long context degrades by composition, not just length.** Chroma's Context Rot study across 18 models ([the report](https://www.trychroma.com/research/context-rot)): a single distractor hurts; and — the under-cited result — models scored *better* on shuffled haystacks than on logically coherent ones. That cuts directly against "give it one well-organised long document." A ~300-token focused prompt beat the same content inside ~113k tokens for every model tested.

- **Compression silently deletes rules.** With full context, agents violated stated policies 0% of the time; after summarisation-based compaction, ~30% on average, 59% in the worst family ([ConstraintRot](https://arxiv.org/abs/2606.22528)). The fix that restored 0% was typing the constraints as non-compressible — pinning them outside the lossy channel. Compression by inference over text is structurally unsafe for anything that must hold.

- **Pointing pays once.** The only controlled test of progressive disclosure found one routing level beats raw navigation, and a second level gives no benefit and sometimes hurts ([the ablation](https://arxiv.org/abs/2607.17598)). Deep pointer hierarchies are not free.

- **Branching shipped; reproducibility did not.** Both leading coding harnesses now fork and rewind sessions. But nothing shipped can say "this completion came from exactly this context, re-derivable" — and server-side compaction and background memory consolidation actively trade that away for context economy. The formal statement of what safe forking would even require appeared in August 2026 ([execution edits](https://arxiv.org/abs/2608.22928)); nobody implements it.

### The platform floor

The model vendors absorbed the memory layer, and what they shipped is instructive: Anthropic's agent memory is path-addressed *files* whose every change creates an immutable version attributed to the session that wrote it, with access enforced at the filesystem level ([the docs](https://platform.claude.com/docs/en/managed-agents/memory)); Google shipped the same shape. Versioned files with attribution are now the free floor — anyone building here must beat it, and the vendors' own gap is known: their memory is per-vendor, file-grained, with no fact-level history. Meanwhile the unsolved hole is poisoning: seeding 1.2% of a memory store with bad entries dropped accuracy from 0.85 to 0.30, a screening pipeline rejected 0 of 360 poisoned memories, and the shipped defence is statistically indistinguishable from none ([the measurement](https://arxiv.org/abs/2608.21230)). A writable memory is a durable injection surface.

### The deflations

- **Graph-extraction RAG deflated on independent testing.** Microsoft put GraphRAG in maintenance mode ([the repo notice](https://github.com/microsoft/graphrag)). The independent benchmark ([PVLDB 2025](https://arxiv.org/pdf/2503.04338)): graph methods don't consistently beat plain retrieval; the global mode costs 57× the time and 210× the tokens per query; and the method that wins most datasets, RAPTOR, contains no entity graph at all. Deeper: only ~65% of answer-bearing entities even appear in the constructed graphs, and entity resolution — is "Acme" the same as "ACME Holdings"? — remains unsolved, which is the mechanism by which extracted structure becomes confidently wrong types.

- **Low-code bifurcated, with one real casualty class.** What died is the proprietary visual runtime for general app-building: Airtable fell from an $11.7B valuation to a $1.28B sale; Wix cut ~1,000 people; Pegasystems told the SEC that AI made clients delay purchases. What is fine is governed process automation over regulated data (Appian +19%). And the money relocated rather than vanished: the AI app-builders claim hundreds of millions in (self-reported, unaudited) revenue built in 24 months. The consistent moat on both sides is the typed contract layer — data access rules, permissions, schema — never the renderer.

---

## The people

No one found in the sweep argues the whole picture; the dedicated search concluded that every neighbour holds two or three pieces and rejects or ignores the rest. So the useful map is by person and lab: who holds which piece, who paid for their knowledge, and who stands against. Read this section with [the folklore section](#check-every-number) in mind — part of what distinguishes these people is which of them do their own tracing.

### Ink & Switch and its diaspora

The lab (ten years old in 2026) is the densest single source of paid-for knowledge in this territory, because it publishes its failures with the same care as its successes.

- **Patchwork** is its centre of gravity: a runtime where user data and tool code live in the same versioned documents, tools declare which data types they can render, and composition happens by embedding. The reported result: "Patchwork made it relatively easy to compose tools in ways their authors didn't expect." It ships an installable skill that teaches coding agents to write Patchwork tools ([the repo](https://github.com/inkandswitch/patchwork-skills)) — AI as the on-ramp to end-user programming.

- **Cambria** is its most valuable failure — covered in [the schema section](#change-by-forbidding-not-translating). Marked Completed 2020, code dead, no successor anywhere. Schema evolution of typed, versioned, linked structure is *unsolved*, not merely unbuilt; the one shipped descendant idea is Jazz's "schema version as another branch dimension" ([their write-up](https://jazz.tools/blog/four-fresh-ideas-behind-jazz)).

- **Automerge** is technically excellent (3.0 cut one document's memory from 700MB to 1.3MB and load time from 17 hours to 9 seconds) and roughly 250× smaller in adoption than Yjs — whose entire collaborative-editing ecosystem rests on a single maintainer funded partly by European public money. Bus-factor risk sits under most of the collaborative web.

- **The manifesto** is the [malleable software essay](https://www.inkandswitch.com/essay/malleable-software/) (Litt, Horowitz, van Hardenberg, Matthews, 2025): apps as single-purpose "avocado slicers," shared data as the escape; on AI alone: "like bringing a talented sous chef to a food court." Geoffrey Litt now works at Notion; his 2026 title says where he landed: "Understanding is the new bottleneck."

- **Around the lab:** Martin Kleppmann keynoted the sold-out Local-First Conf 2026 ("local-first in an unstable world") while the field's own retrospectives got blunt — ElectricSQL dropped client CRDTs and was acquired; Jazz v2 walked back crypto-enforced permissions and CRDTs both. The durable win across the whole lineage is branching, not merging. And Andy Matuschak — the field's most prominent tools-for-thought researcher — named the trap ("Coding agents without a composable architecture give you zero-to-one silo apps" — [two accidental tyrannies](https://andymatuschak.org/tat)) and then left note tools entirely to build Pico, "a conservatory for human attention."

### The opposition worth the most respect

The case against structured knowledge substrates comes in three layers that reinforce each other. Anyone building one should be able to state all three.

- **The bitter-lesson layer.** Sawyer Hood's ["The Bitter Lesson of LLM Extensions"](https://www.sawyerhood.com/blog/llm-extension) traces three years of extension mechanisms — plugins, custom instructions, GPTs, MCP, Skills — each less structured than the last, ending at folders of markdown: "we will go back to extending our agents with the most accessible programming language: natural language." If a model reads your codebase with grep, a typed medium is a cost paid to solve a problem the model no longer has. The trend line runs with him: context got cheap, and the pendulum has swung away from hand-authored schemas twice.

- **The measured-cost layer.** A more machine-friendly data format performed *worse* because models were unfamiliar with it — familiarity beats formal fitness (the widely cited "grep tax"; note the sweep could not verify the big version of this study, and the format's own benchmark shows a null). A plain vector index costs a fraction of a percent of a graph index, paid up front, on content nobody may query. And the extraction results in [the edges section](#type-the-edges-keep-the-body-prose) are this layer's heavy artillery: structure produced by inference is confidently wrong.

- **The philosophical layer — the one to take most seriously.** Bret Victor's Dynamicland states the inverse principle outright: "to maximize agency, minimize what the computer knows" — and calls smart products "outsourcing understanding in its most virulent form" ([their FAQ](https://dynamicland.org/2024/FAQ/)). Beneath it stands the 27-year-old paper nothing has refuted: Shipman and Marshall, [*Formality Considered Harmful*](https://doi.org/10.1023/a:1008716330212) — formal structure imposes costs at capture time (chunking, naming, labeling), experts cannot introspect their own structure even when videotape shows they follow it, and the person paying the formalisation cost is rarely the one who benefits. The sweep's one honest resolution of this objection: structure imposed at *authoring* time costs agency; structure offered as an *inspection surface* at decision time buys it — small studies of decomposed, auditable agent actions found users' comprehension and sense of ownership went up, not down.

### Holders of single pieces

- **Kendall Clark (Pentad Labs)** is the sharpest champion of facts-with-history: every fact as five slots — subject, predicate, object, *context*, *lineage* — "nothing an agent has seen, said, or done is lost" ([the design essay](https://pentad.ai/PLRN/020/)). An essay series and a pre-release product, not a shipped system.

- **Letta (MemGPT)** argued "memory cannot be bolted on" — then retired its own memory server and pivoted to a coding harness whose memory is markdown files tracked in git ([the archived repo](https://github.com/letta-ai/letta)). The thesis survived; the product form that survived with it is files-in-version-control.

- **The structured-code ventures converged on one ending.** Unison opened a consulting arm to reach cash-flow positive ([their post](https://www.unison-lang.org/blog/consulting/)); Glamorous Toolkit is consultancy-funded; Dark Inc went insolvent, with founder Paul Biggar's plain post-mortem: "it became very obvious that our product was not the right one for the era of coding agents. Our online structured editor didn't make sense when the LLM is generating the code" ([the whole post](https://blog.darklang.com/goodbye-dark-inc-welcome-darklang-inc/)). And Jonathan Edwards, after twenty years on Subtext: "a series of overambitious failed experiments... What Subtext needed was a Theory of Change" ([his retrospective](https://www.subtext-lang.org/retrospective.html)); his current vision statement asks, of the whole research area, "Are we even a field?" The live counter-current is Hazel, whose typed holes now feed language-server context to LLMs ([the OOPSLA paper](https://hazel.org/papers/chatlsp-oopsla2024.pdf)).

- **The shipped ancestors of typed, versioned, permissioned stores** are worth knowing by name: Fluree, where a permission policy *is* a query evaluated per-datum inside execution ([the syntax](https://github.com/fluree/developers-site/blob/main/docs/reference/policy-syntax.mdx)); TerminusDB, git-for-typed-documents since 2019, alive but fragile under new maintainers; and Willow/Meadowcap, where a read capability and a sync query are literally the same expression ([the spec](https://willowprotocol.org/specs/meadowcap/index.html)) — an excellent specification with orphaned implementations. The graveyard around them repeats one epitaph: a paradigm sold without a familiar interface dies (Noms), and at this layer distribution beats design (Gel, Electric, Triplit, InstantDB — all absorbed or sunset in twelve months).

### The keepers of the writing craft

- **Daniele Procida (Diátaxis)** is subtler than his adopters. The framework's own text disclaims the file-per-type reading: a clean four-way split is "a typical outcome of the good practice, not its end." The best documented failure report agrees — Google's Pigweed team adopted it literally, got fragmentation ("users found it annoying to have to jump back-and-forth so much"), and retreated to sections within a page ([the first-hand account](https://news.ycombinator.com/item?id=42340740)). In August 2026 Procida *deleted* his only page on documentation with more than one organising axis — "There is a real problem there, and that page doesn't do a good enough job of dealing with it. I have something cooking that is much, much better" ([the deleted page, archived](https://web.archive.org/web/20260625055713/https://diataxis.fr/complex-hierarchies/)). The live edge of documentation theory is, by its leading author's own admission, unwritten.

- **Hans van der Meij** is the model of how to relate to a doctrine: minimalism's sharpest critic in 1992 ("critical experiments have hardly been conducted"), then the person who ran them, replicated the effect, co-wrote the principles — and then moved on to instructional video when the questions were as answered as his methods could make them. The experimental line on document design effectively stops with him, around 2003.

- **GitLab's handbook** is the one at-scale existence proof for radical written-first operation — over 2,000 printed pages, "handbook-first" — with no outcome measure of any kind, and an internal style guide that warns the biggest problem new employees report is "the vast amount of information to take in." It proves the practice survivable, not effective.

---

## What nobody knows yet

The gaps below are not the sweep failing to find things. They are the sweep confirming, with effort, that the things do not exist. Each is a door someone could be first through.

- **There is no causal study of documentation.** Anywhere. No experiment with documentation as the manipulated variable and an organisational outcome measured. The entire modern field catalogues defects in docs and never measures what good docs buy.

- **The crux experiment for structured knowledge has not been run:** human-declared structure versus a well-written prose document, same corpus, same frontier-model reader. Every study that flatters declared structure beat *extracted* or *unstructured* baselines — never a good prose baseline. The whole structure-versus-text argument turns on a comparison nobody has made.

- **Nobody has studied professionals re-reading a long document over months.** The learning-science base is single 15–30-minute sessions on passages of a few thousand words, mostly with students. The professional literatures (aviation, medicine, law) confirm the gap rather than filling it.

- **Whether skippable depth substitutes for separately written novice and expert versions** — the design choice between layering and forking — is untested in any population.

- **No empirical study shows that linked note-taking improves any outcome.** The sweep looked and found none — only the best-read critique ("I deleted my second brain") and a counter-argument that concedes the structural point.

- **Ted Nelson's current status is genuinely unknown.** His site's front page is dated 2007, and the sweep found no statement from 2024–26.

- **The live bet nobody can settle:** whether model scaling will dissolve the value of structure. The sweep's most careful formulation of the asymmetry — scaling keeps dissolving the problems of *reading* (format sensitivity, messy input, retrieval machinery) and has never touched the problems of *writing, committing, and being accountable* (enforcement before generation, where a claim came from, set operations, many writers with no coordinator). Which side of that line a given piece of structure sits on is the question to ask of every design, and no benchmark yet asks it.
