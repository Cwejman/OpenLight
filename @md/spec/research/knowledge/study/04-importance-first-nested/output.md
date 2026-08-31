# Four findings that carry the rest

*Research register — structured, uncommitted. Written from the 45 raw reports of the [2026-08 sweep](../../../sweep-2026-08/README.md) alone; nothing fetched from the web. Links out are offers, not missing pieces: each sentence around one says what opening it gives, and the text reads whole without it.*

*Two cautions travel with every number here, because they travel with the sweep itself. The agents ran out of web-search budget early and fell back on direct fetches, which over-samples open sources. And two agents independently caught automated summarisers inventing quotes and sample sizes — so a figure below is worth exactly what its verification note says, no more. Where a report's agent could not verify a number, this piece says so in the same sentence.*

---

The sweep looked outward in eighteen directions at once: how knowledge is written, how it is read, how it is stored, typed, versioned, permitted, and fed to models. Read whole, the forty-five reports keep returning to four understandings. Everything else in the corpus takes its meaning from these four, so they come first, plainly:

1. **Almost none of what the world believes about writing knowledge was ever measured.** The famous numbers trace back to nothing. This re-prices every other claim before you meet it.

2. **Where real measurement exists, the winner is finding, not explaining.** Readers — human and machine — fail at reaching the right place, not at understanding it once there. Helping them reach it is the one lever with evidence behind it.

3. **Structure pays around the content and fails inside it.** Typing a thing's address, owner, version, and permissions keeps winning. Typing the thing's body keeps losing — with humans at writing time, and now with models at filling-in time.

4. **History is the open frontier.** Branching, merging, replaying, and tracing knowledge over time is unsolved everywhere. Every shipped system forbids change, takes one whole side, or loses information silently. The papers that even name the problem are from 2026.

The rest of this piece unfolds each one, with the people and works of the field placed where they take meaning from what you now hold.

---

## 1. Almost none of it was ever measured

The practices the world runs on for writing knowledge — documentation frameworks, decision records, design docs, card sorting, structured authoring — are almost never tested against any outcome. Not badly tested: *not tested*. Several agents in the sweep, working different fields with different sources, each came back with a version of the same sentence: the field measures what is wrong with documents, never what good documents buy anyone. And the numbers that seem to prove otherwise dissolve when someone follows the citation chain.

Hold this first, because it changes how everything later reads. Wide adoption is not evidence. A confident number is usually the weakest part of a claim. And a project that says "we do not know yet" is being more rigorous than most of the literature it departs from.

### The numbers that trace to nothing

Folklore, here, means a number everyone repeats that leads back to no study. The sweep confirmed a long list. The most load-bearing ones:

- **"A defect found late costs 10× or 100× more."** Laurent Bossavit chased the usual source — an "IBM Systems Sciences Institute study" — and found the institute was an IBM training school in Los Angeles, not a research body; no study, no data, no N. [His chase is short and worth reading in full](https://gist.github.com/Morendil/ebfa32d10528af04e2ccb8995e3cb4a7). Barry Boehm himself, with Basili in 2001, wrote that for small non-critical systems the factor is ["more like 5:1 than 100:1"](https://www.cs.umd.edu/projects/SoftEng/ESEG/papers/82.78.pdf) — the concession is in the authors' own words. And the largest test of the delayed-cost idea (Menzies et al., 171 projects, 2006–2014, verified by the agent from the paper) found *no evidence for it at all*.

- **"Good documentation makes teams 2.4× more likely to perform well."** That is DORA 2021 — a self-reported survey, snowball sample, no confidence intervals published. DORA's own later reports walk it back: 2022 found documentation *negatively* associated with delivery performance ("this is at odds with previous reports"), 2023 found "no effect… the second year we see this behavior," and 2025 dropped the documentation construct entirely and published no numbers, only ordinal bands. Anyone citing 2.4× in 2026 is citing a finding its own authors have three times declined to repeat. (All verified by an agent against the primary PDFs.)

- **"Fifteen users give you a 0.90 correlation in card sorting."** Nielsen's 2004 numbers do not appear in the paper he summarised — the paper prints a graph with no values, and the figures were read off it. Hundreds of tools and blogs now cite them as published data. Worse: the one peer-reviewed direct test of card sorting's validity (Schmettow & Sommer 2016, verified) found the match between users' mental model and a site's structure had *no effect on browsing performance*. The method the whole field uses to design navigation has one validity test, and it is a null.

- **"Developers spend 10× more time reading code than writing it."** Traced verbatim to *Clean Code* (2008): Robert Martin's memory of watching Emacs session playbacks in the eighties — which he himself says showed mostly *scrolling*. No study before it; the number originates with him. What is actually measured (Xia et al. 2018, 78 professional developers, 3,148 instrumented hours, verified from the paper): about 58% of working time goes to comprehension and 5% to editing — and a large share of that "reading" happens in web browsers and document editors, not in code.

- **The head-size numbers.** Miller called his own 7±2 "a pernicious, Pythagorean coincidence" in the 1956 paper. Cowan's "about four" holds only under lab conditions that deliberately *block* chunking — conditions no readable document meets. Dunbar's 150: the 2021 re-analysis puts the honest confidence bands at roughly 2 to 520 and concludes no number can be derived at all. (All three verified from primary texts by the sweep's citation-audit agent — the same audit that corrected several of the sister study's own citations.)

- **The structured-authoring savings.** "DITA reuse saves 30–40%": the agent could trace it to no primary study anywhere it could reach — only vendor calculators citing each other. "Structured content is 29–46 points better for AI": the page cited for that figure *does not contain it* (verified by fetching the page).

### What real evidence exists, and how small it is

The sweep did find genuine measurements. Knowing their size is what makes them useful.

- **Minimalism is the one replicated experimental result that document design changes outcomes** — John Carroll's "Minimal Manual" (1987): 40% less learning time, 2.7× more tasks completed. But the N was 19 and then 32, the subjects were office typists learning 1980s word processors, and the pooled estimate (d ≈ 1.12) comes from a conference paper that was never peer-reviewed, over 288 people total, with the theory's own authors helping pick the studies. Its main critic, Hans van der Meij, replicated it favourably in 1993 — and then the whole research line went quiet by about 2004. Real, old, narrow.

- **One company measured a content change causally.** Intercom's Fin team used a matched-comparison design across ~1,000 customers: improving knowledge-base content raised resolution rate by +1.23 percentage points on average in the first month, with targeting mattering far more than volume. The rare case of restructuring *and* measuring — [their write-up is the method as much as the number](https://fin.ai/research/a-causal-inference-approach-to-measuring-the-impact-of-improved-rag-content/).

- **The best professional-reader experiment in the sweep is about lawyers.** Martínez, Mollica & Gibson (PNAS 2023, full text read by the agent): 105 practising lawyers, preregistered. Bad legal prose hurt lawyers' recall and comprehension as much as laypeople's — expertise raised the whole curve but did not shield against complexity — and 102 lawyers rated the simplified contracts *equally enforceable* and better in quality. Expertise is a main effect, not a shield. [Free full text via PubMed Central](https://doi.org/10.1073/pnas.2302672120).

- **Specificity correlates with use.** Grol et al. (BMJ 1998, verified): 61 GPs, 12,880 real decisions — clear guideline recommendations followed 67% of the time, vague ones 36%. Observational, and the factors are tangled together, but it is a real professional population making real decisions.

- **Decision records: measured at last, and modest.** The one mining study (Buchgeher et al. 2023, 921 repositories, verified): 51% of all architecture decision records were written once and never touched again; under 5% of adopting repositories show sustained team use. The one impact study (ICSA 2026, verified from the abstract): "at most, modest observable effects at scale," and 63% of records are born already marked "accepted" — skipping the deliberation they exist to capture. Design docs: one controlled study (N=65, 2023): document *format* made no difference; prior exposure to the code dominated.

- **And the cleanest natural experiment on documents changing outcomes at scale is a warning.** Surgical checklists: an 8-hospital study found deaths nearly halved (2009); a 101-hospital rollout found nothing (2014); the one randomised trial found a real effect in an engaged programme (2015). All three verified from the medical abstracts. The document does not carry the effect. The practice around it does.

### The reader in the studies is not your reader

The comprehension science that document advice leans on was built almost entirely on schoolchildren and undergraduates, reading short passages once, tested minutes later. The sweep's education agent checked the strongest recent source directly: the 2025 meta-analysis of the expertise-reversal effect (Tetzlaff et al., 60 studies, 5,924 participants, no publication bias detected — the best of its kind) contains **zero studies of practising professionals**. Its own moderator table proves it: the closest category is "vocational training," three studies, with a confidence interval spanning 2.4 standard deviations — a shrug. So "strip the guidance, your readers are experts" rests on a literature that has never met an expert at work. And the little professional data that exists (the lawyers above; aircraft maintenance) shows experience as a main effect that does not interact with document quality: experts read faster, and are blocked by the same defects as everyone else.

One more twist runs the same direction: the meta-meta-analysis of design principles (Noetel et al. 2021, 1,189 studies) found design matters most in *system-paced* settings like lectures — and least in *self-paced* ones like reading a document. The reader who controls their own pace recovers much of what bad design costs. Document-design effects shrink exactly where documents live.

### Why the field looks solid anyway

Adoption substitutes for evidence, and frameworks do not cite. AGENTS.md files number in the hundreds of thousands on GitHub (the counts are approximate — the API caps them) while the only rigorous evaluation of such files is a null (more in section 2). ThoughtWorks moved decision records to "Adopt" in 2017, on zero data, five years before anyone counted whether they get maintained. Diátaxis — the most influential documentation framework of the decade — cites no research, no study, no other theory; its argument is entirely self-contained, and its author, Daniele Procida, deleted the site's only page on documentation with more than one organising axis in August 2026 ("I don't like that page… I have something cooking that is much, much better" — nothing has replaced it; [the deleted page survives in the archive](https://web.archive.org/web/20260625055713/https://diataxis.fr/complex-hierarchies/)). The best documented Diátaxis field report is a failure with a named mechanism: Kayce Basques at Google's Pigweed tried it as a literal blueprint, found "too much fragmentation" — users would not follow the links between the split pages — and retreated to sections within one page. [His account is first-hand and generous](https://news.ycombinator.com/item?id=42340740). Notably, Procida himself disclaims the file-per-type reading: the splitting was the adopters' invention.

---

## 2. Where measurement exists, the winner is finding, not explaining

Here is the one positive pattern that recurs across the sweep's most distant fields — hospital wards, cockpits, retrieval benchmarks, coding agents. When someone actually measures, the failures are failures of *reaching the right place*, and the wins come from helping the reader reach it. Explaining better, once they are there, mostly measures nothing.

This matters because nearly all effort in writing goes into the explaining.

### Professionals reading long documents

The professional-reading agent found the convergence independently in two industries. In medicine: the one think-aloud study of practitioners using a real clinical guideline (Kilsdonk et al. 2016, 13 professionals, verified) found they could *read* it fine — they could not *find* the recommendation that applied. In aviation: NASA's most detailed analysis of cockpit emergency handbooks (Burian 2014, read from the primary PDF) found flow lines that are hard to follow across pages, jumps chained for no evident reason — navigation defects — and marks the questions that would settle checklist design as "Further Research Needed." Thirty-five years after Degani & Wiener catalogued checklist methods across twenty airlines, there is still no comparative performance evidence between them; their surviving guidance, from 140 hours of watching crews, is structural: chunk by function, put the most critical items first, and let criticality beat logical order when the two conflict.

### Machines reading repositories

The agent-documentation lane produced the sharpest version of the pattern, because coding agents allow controlled experiments that human readers never did.

- **Prose overviews are inert.** The strongest study (Gloaguen et al., ETH Zürich, verified verbatim): repository context files "do not generally improve task success rates, while increasing inference cost by over 20% on average." The agents *followed* the instructions; the overviews — the content vendors recommend most — simply did not help. [The paper](https://arxiv.org/abs/2602.11988) is the single most important citation in this space, and it points the opposite way from all vendor guidance. A second, smaller study (288 runs, verified) bounds any effect at 10–15 points and adds the diagnosis: agents fail on implementation skill, "not missing repository knowledge that a context file could supply."

- **Navigation pointers are not inert.** The one positive result ([Shepard & Albrecht, verified](https://arxiv.org/abs/2606.20512)): empirically tuned repository guidance lifted resolve rates from 25.5% to 33.0% — and the entire gain came from agents *reaching the correct files* (+14.5 points coverage) while patch quality stayed flat. Same artifact, opposite content, opposite result. The mechanism is the message.

- **The meaning lives in the source.** A preregistered ablation ([verified verbatim](https://arxiv.org/abs/2607.09691)): natural-language summaries of code answered 4 of 45 behavioural questions where the source itself answered 27 — and a frontier model's summaries scored exactly as poorly as a tiny model's. The gap belongs to the *representation*, not the summariser. The same paper contributes a caution that hangs over this whole literature: temperature-zero runs flip ~9% of outcomes between identical executions, a noise floor under every small effect anyone reports.

- **llms.txt is dead as a broadcast and alive as a map.** No AI crawler fetches it (a 900-domain server-log study logged zero requests from any frontier crawler; Google says it has no effect — both carried second-hand in the reports, primary sources not opened). But when an *agent* is pointed at it as a navigation index, Mintlify's 2,400-trial benchmark found ~90% fewer dead URLs with accuracy flat — vendor-run, but openly designed, and the headline metric is 404s, not a flattering accuracy claim. Same object, two channels: as publishing, nothing; as wayfinding, real.

- **One level of pointing pays; two do not.** The only controlled test of progressive disclosure ([verified](https://arxiv.org/abs/2607.17598)): one routing level beats raw navigation; a second level adds nothing and sometimes hurts. Deep hierarchies of pointers are not free.

The biggest circulating number in this space belongs here with its note attached: Anthropic's "150,000 tokens to 2,000" for making tools navigable rather than present. The stress-test agent read the post: it is an *illustrative hypothetical*, not a measurement. The direction is separately supported at one to two orders of magnitude smaller effect. [The post itself](https://www.anthropic.com/engineering/code-execution-with-mcp) is still worth opening for the mechanism.

### What this does to document structure

Two findings turn the pattern into advice about shape.

First: carry the hierarchy *into* the piece rather than splitting the piece up. The cleanest retrieval result in the sweep (Yang Yang 2026, verified against the arXiv abstract; single author, one production knowledge base, not yet peer-reviewed): prepending each chunk's chain of headings lifted retrieval precision 23.8% — with no extra model calls, just the document's own structure travelling with its parts. The paper's sting is better than its headline: remove the heading chains and the human annotators' agreement on relevance collapsed from κ=0.45 to κ=0.04. *People* need the hierarchy to know what a passage means, too. This is the empirical case against the file-per-type splitting that undid Pigweed: structure should ride inside the text, not fragment it.

Second: coherence is not what retrieval rewards. Chroma's Context Rot study (18 models, verified; independently echoed by NoLiMa) found models scored *better* on shuffled text than on logically coherent text — and that degradation starts far below the context limit and is driven by composition, not length. [The report](https://www.trychroma.com/research/context-rot) is the most under-cited document in the whole context-engineering discourse; the shuffled-haystack result cuts against every "just give it a well-written document" instinct, and nobody yet knows the mechanism.

---

## 3. Structure pays around the content and fails inside it

The sweep's adversarial agent — briefed to attack a structure thesis as hard as it could — landed on a line that organises half the corpus: *type the edges, keep the body as text*. Every winning 2026 system types identity, permission, address, version, and freshness, and leaves the payload as prose or code. Every loser typed the body. The evidence for this comes from two eras, with two different failure mechanisms, agreeing.

### The cost was named in 1999 and never answered

Shipman & Marshall, *Formality Considered Harmful* (1999): typed structure imposes its cost at capture time — chunking, naming, linking, labelling are extra decisions — while the benefit arrives at reading time, and people discount the future, so they route around the structure. It is an experience essay, not a measurement study (the sweep's design-rationale agent read all ten pages and graded it honestly), but nothing in twenty-seven years has refuted it, and the whole design-rationale literature is its illustration: the benefit of recorded "why" rests on one 17-subject experiment that worked on one of two systems, and one observation of six designers finding only 41% of their questions answered by a professionally-scribed rationale document. [The essay is archived in full](https://doi.org/10.1023/A:1008716330212) and its sharpest example deserves quoting: design students *could not produce* formal argument structures even though videotapes showed their natural discussions already followed the structure — "post hoc analysis is very different from generation."

### The graveyard of typed bodies

The failures line up across three decades, each with its own testimony:

- **Darklang**, the structured-editor language, in its founder's own post-mortem (2025, verbatim): "Our online structured editor didn't make sense when the LLM is generating the code." The company ran out of money; the successor pivoted to plain text plus AI. [The goodbye post is unusually honest](https://blog.darklang.com/goodbye-dark-inc-welcome-darklang-inc/) — the editor was half the codebase.

- **Logseq** moved off plain files to a typed database — shipping four years late, in July 2026, into a market that had just re-valued files because agents read them. The community verdict on the top of the launch thread: "too little, too late." Meanwhile Obsidian, which kept files and layered typed *views* over them, is the category's default winner. The market's answer to "typed structure versus files" was both — with files as the substrate.

- **The faceted lineage** — WinFS, semantic filesystems, Placeless Documents — died a generation earlier for one repeated cause the competitive-landscape agent names plainly: intersection navigation requires clean typed metadata on every item, and nobody ever had it.

- **The product world's quiet ceiling**: Notion, Airtable, Tana, and Anytype all let you extend the *instances* — add types, add fields — and all keep the view vocabulary and the property-type vocabulary as closed lists in the protocol (verified down to the protobuf enums). Extensibility everywhere stops one level below where it would matter.

### What the winners typed instead

- **MCP**, in its July 2026 revision (verified against the changelog), deleted its conversational surface — sessions, handshakes, server-initiated requests — and simultaneously *hardened* its typed layer: mandatory discovery, required result types, required cache lifetimes, full JSON-Schema tool contracts. The stress-test agent's reading: that is not a protocol losing; it is a protocol that stopped trying to be the conversation and became a typed capability-description layer underneath one. It moved down a layer and got more typed on the way.

- **The frontier labs' memory is files at paths.** Anthropic's memory stores are markdown documents, addressed by path, where every change creates an immutable version attributed to the session that wrote it. Typed edges — address, version, attribution, access — around prose bodies. Agent Skills are the same shape: folders of markdown with a small typed header.

- **The web's own vocabulary collapsed to its edge types.** Schema.org's own 2026 usage data: 958 types exist; 12 reach large-scale use; ~77% of the vocabulary sits below a thousand domains. And the most successful W3C vocabulary, SKOS, made its hierarchy *non-transitive on purpose* in 2009 — the design that Wikidata's 2.4 million tangled class assignments (measured, 2024) vindicate by counter-example.

- **Permission is going one-hop.** Google's Zanzibar paper names recursive group-chasing as its hard problem; Google Drive now forbids granting *less* access than a parent folder; and Microsoft's own docs concede that AI retrieval turned latent inherited permissions into actual leaks — "the AI didn't create the leak, it enumerated it," as the sweep's agent put it. The vendors' behaviour, not any published argument, is the evidence here; no citable advocate for flat permissions was found.

### The new failure: types filled in by models

The old failure was that humans would not pay the typing cost. The 2026 failure is that models will pay it — wrongly, and silently. The stress-test agent's strongest evidence (all arXiv preprints, verified against abstracts): a model reconstructing database documentation scores 0.223 accuracy when it must answer everything, 0.475 when a code-enforced gate lets it abstain — "a competence detector, not a competence amplifier." Frontier models produced 0% valid output on a 369-field extraction schema. Schema *compliance* is near-perfect while the values inside are wrong a quarter to three-quarters of the time depending on modality. The conclusion is the sharpest sentence the sweep produced:

> A typed store with wrong types is worse than prose, because a wrong type returns a confident answer while incomplete prose returns a visibly incomplete one. Prose degrades gracefully; a type does not.

The same evidence shows the honest boundary: *small, declared* vocabularies win consistently — thirteen declared memory categories beating graph memory, a fifteen-operation typed query language beating both free-form generation and heavy pipelines, a governed semantic layer taking text-to-SQL from 55% to 97% (the authors themselves decline the causal framing; the win is the curated layer, not the compiler). Declared beats induced, everywhere it was tested. If a type would have to be inferred rather than declared or observed — do not type it.

---

## 4. History is the open frontier

Version the knowledge, branch it, merge it, trace every change to its cause, replay any past state: this cluster is where the sweep found the least solved and the most newly named. Whoever holds sections 1–3 can now see why this one matters most: it is the part of the structure thesis that scaling models does *not* dissolve. The stress-test agent's asymmetry line: scaling dissolves the problems of *reading*; it does not touch the problems of *writing, committing, and being accountable*.

### Nobody merges structure

The pattern, verified across every shipped system the agents could reach: when the *shape* of data changes on two sides, no system merges the shapes. Dolt — the healthiest "git for data" product — blocks the merge on a schema conflict and resolves by taking one entire side. Iceberg has no branch merge at all, only fast-forward. Confluent's default compatibility mode is non-transitive, so a chain of individually-safe changes can be globally incompatible. TerminusDB, the one system that models schema change as a first-class operation, leaves `ChangeParents` — migrating the inheritance hierarchy, the most structural change there is — explicitly unimplemented. The schema-evolution agent's summary: **nobody merges structure; they serialize it** — forbid, take a side, or start a new container.

The production systems that survived schema change all bought safety the same way: by *forbidding* things, not translating them. Protobuf forbids reusing field numbers and killed `required`. Datomic: "you can never alter `:db/valueType`." ATProto states the full-compatibility rule in prose — all old data valid under the new schema, all new data valid under the old — and routes anything bigger to a new name. Independent teams, same landing spot.

### Translation was tried once, seriously, and stopped

Ink & Switch's Cambria was the one serious attempt to translate between schema versions with bidirectional lenses. The essay is honest to a rare degree (the agent read it whole): write-time translation failed and was replaced by tagging every write with its schema and translating on read; performance was never measured; scalar-to-array has "no ideal solution"; the flagship demo operator is not technically a lens. The project is marked Completed, 2020; the code last moved in 2024; no successor exists. And the underlying mathematics says why: the lens literature's own foundational paper concedes that the composition law you would need for chained migrations (PutPut) "fails for reasons that seem pragmatically unavoidable" for exactly the operators you would want. [The Cambria essay](https://www.inkandswitch.com/cambria/) is the best single document on this problem — the findings and open-questions sections are the transferable part. What survives it is three moves, none of them lenses: tag every write with the schema it was written under; translate lazily at read; treat everything outside a small widening class as a *new* schema with a new name.

### Compression loses the wrong things, and nobody can replay

On the working-memory side of history, three 2026 results (each a single paper, each verified against its abstract) mark the frontier:

- Compaction is a safety failure, not just a fidelity one: with full context, 0% policy violations; after summarisation-based compaction, ~30% on average — and pinning the constraints outside the lossy layer restores 0%. The fix is *typing certain content as non-compressible* — [the ConstraintRot paper](https://arxiv.org/abs/2606.22528) has both the attack and the mitigation.

- Persistent memory is a durable attack surface: poisoning 1.2% of a memory corpus dropped accuracy from 0.85 to 0.30, and the shipped defenses caught nothing — a screening pipeline rejected 0 of 360 poisoned memories.

- Branching shipped in the leading coding agents (fork, rewind, checkpoints — real, verified against product docs), but *safe* branching exists nowhere: the paper that finally formalises checkpoint/fork/restore/merge as "execution edits" notes that every existing system forks without deriving what the edit must preserve. And exact replay is being traded away on purpose — server-side compaction and background memory consolidation make the recorded context non-reconstructible from the transcript.

The through-line, from the stress-test report, pairs with the type-rot line from section 3: skills and schemas go stale *in silence* — one benchmark found every one of 105 repository releases invalidated part of its agent-skill set, with frontier models managing 30–70% at repair. Text rots loudly; you read it and see it is stale. A type rots silently and keeps answering.

### What gets maintained

One field finding belongs here because it predicts which knowledge survives at all. Wohlrab et al. (53 practitioners, six automotive companies, verified from the arXiv text): artifacts that *generate* something downstream get maintained; artifacts that merely describe do not. The organisational-knowledge agent called it the single most actionable finding for a documentation project, and it compounds with everything above: a knowledge structure keeps its history honest only if something downstream consumes the structure — which is also the only condition under which anyone pays the typing cost of section 3.

---

## The kin and the opposition

With the four findings in hand, the people of this field sort themselves. Three are worth holding by name, because each one *is* a position.

**Ink & Switch is the nearest kin, and the most honest.** Ten years old in 2026. They shipped the closest thing to interface-as-typed-declaration that exists — Patchwork, where a tool declares which document types it can draw and composition is a lookup over those declarations, running in the open, with [an installable skill that teaches coding agents to write new tools](https://github.com/inkandswitch/patchwork-skills). They also *named and then closed* the schema-evolution file (Cambria, above) — the lab most sympathetic to typed, versioned substrates is the one that documented why the hardest part is unsolved. Their [Malleable Software essay](https://www.inkandswitch.com/essay/malleable-software/) (2025) makes the app-enclosure argument at full strength — apps as single-purpose "avocado slicers," data sharing as what returns composition to users — and is the best statement of the half of the enclosure thesis that anyone has published. Its caution about AI is one line worth carrying: code generation alone "is like bringing a talented sous chef to a food court." Geoffrey Litt, the essay's lead author, now works at Notion; his 2026 post title is a summary of the whole field's turn: "Understanding is the new bottleneck."

**Dynamicland is the deepest opposition, and section 3 is what makes it legible.** Bret Victor's group states the inverse principle outright: "to maximize agency, minimize what the computer knows." Their objection to AI — "the 'smarter' the product, the less the user needs to understand" — is the edge-typing argument taken past its limit: do not even let the computer hold the model of the world; keep the system "fully visible and understandable top-to-bottom." Read after section 3, this is not a rejection of structure but a claim about *where comprehension must live* — and the stress-test agent's answer (structure costs agency as an authoring tax, buys agency as an inspection surface) is the live reply, with small-N evidence on its side. The group is publicly dormant — the newest linked material is from 2024 — but [the FAQ](https://dynamicland.org/2024/FAQ/) remains the strongest first-principles attack on the idea that a richer machine-readable model of the world is emancipatory, and deserves reading in its own voice.

**Kendall Clark's Pentad Labs is the closest single ally on history.** His design essays define a fact as five slots — subject, predicate, object, *context*, *lineage* — "rather than burying context within narrative transcripts," with the aim that "nothing an agent has seen, said, or done is lost." That is section 4 stated as a first principle, by the former Stardog founder. It is an essay series plus a pre-release product, not a shipped substrate — but [the key essay](https://pentad.ai/PLRN/020/) is the nearest thing to a manifesto for provenance-first knowledge.

Around these three, the field's sociology in one paragraph, because it re-frames every product name in the reports: in 2025–2026, nearly everyone converged on the coding agent. Every serious memory vendor pivoted from "be the memory database" to "be the memory of the coding agent"; the venture-funded tools-for-thought middle left for meetings and agents; Retool abandoned its own visual abstraction because it "prevented LLMs from working fluently"; plain markdown became a commercial moat because agents read it. And the who-else agent's census: nobody found anywhere argues the whole compounding-knowledge position — every neighbour holds two or three pieces and rejects or ignores the rest. The clearest published counter-position to typed media is Sawyer Hood's ["The Bitter Lesson of LLM Extensions"](https://www.sawyerhood.com/blog/llm-extension) — three years of extension mechanisms, each less structured than the last — and sections 2 and 3 are, in effect, the evidence sorting out which half of his argument holds (the payload) and which half does not (the edges).

---

## Doors most worth opening first

Everything above stands without these. Each door gives one thing the summary cannot.

- [Formality Considered Harmful](https://doi.org/10.1023/A:1008716330212) — the 1999 essay under section 3; ten pages, and the capture-cost mechanism in its original examples.

- [Context Rot](https://www.trychroma.com/research/context-rot) — the shuffled-haystack result under section 2, with the per-model curves the summary flattens.

- [The Cambria essay](https://www.inkandswitch.com/cambria/) — section 4's one serious attempt at translating schema change, written by the people who stopped.

- [The Malleable Software essay](https://www.inkandswitch.com/essay/malleable-software/) — the enclosure argument at full strength, in the kin's own voice.

- [Dynamicland's FAQ](https://dynamicland.org/2024/FAQ/) — the opposition unmediated; the piece above compresses it to two quotes.

- [Bossavit's trace of the 1:10:100 curve](https://gist.github.com/Morendil/ebfa32d10528af04e2ccb8995e3cb4a7) — twenty minutes that will permanently change how you read a cited number.

- [The lawyers study](https://doi.org/10.1073/pnas.2302672120) — the best professional-reader experiment in the sweep, free full text; the enforceability result is in experiment 2.

And one absence, named so it is not forgotten: the experiment this whole corpus most needs does not exist. No one has run LLM-assisted, human-*declared* structure against a well-written prose document, on the same material, with the same frontier reader. Every measured win for structure beats an extracted or unstructured baseline — never a good prose one. The stress-test agent flagged it as the missing study; it is exactly the one the compounding-knowledge question turns on.
