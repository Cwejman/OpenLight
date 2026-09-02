# The ground others hold

*Written 2026-09-01 from the 45 raw reports of [the August sweep](../../../sweep-2026-08/README.md), read whole. Nothing here comes from anywhere else.*

This document puts you in contact with what the world already knows — and has already built — around the work this project cares about: writing knowledge down so it reaches whoever needs it, person or machine.

After reading it you will hold four things. You will know which of the field's common rules are real and which are invented. You will know what the few solid measurements found, in fields that never read each other. You will know what happened to the people who built systems near this territory, in their own words. And you will know where the ground is genuinely empty, so new work can land there.

One insight carries everything below. **The practice of writing and organising knowledge runs mostly on unmeasured belief — yet the measurements that do exist, made independently in medicine, aviation, law, software teams, and the new agent experiments, agree with each other.** They say the hard part is not the prose. Four other things decide. Can the reader *find* the right piece? Does the reader already *hold* enough to absorb it? Does anything downstream *consume* the writing — which is what keeps it alive? And where structure is added, is it *small, declared, and kept at the edges* of the content rather than in its body?

Confidence is written into every claim here, in plain words: "one study", "meta-analysis" (a study that pools many studies), "vendor's own number", "traced to nothing".

Two cautions sit over the whole document, inherited from the sweep itself. Most of its agents lost their web-search budget early and fell back to fetching sources directly, which over-samples open, machine-readable sources. And two agents caught automated summarisers inventing quotes and sample sizes — so every figure below is worth what its report's own verification note says, and each section links the report it stands on.

The parts, by what they give: section 1 clears the ground — which received rules you may no longer lean on. Sections 2 and 3 hand you what is actually established, for human readers and for machine readers. Section 4 introduces the builders and the price they paid. Section 5 crosses the neighbouring territory of typed data, permissions, and interfaces in one pass. Section 6 names what nobody has done, and section 7 says what this document folds away.

Every section is arranged the same way. The findings stand in the section's own opening, so a reader of the openings alone leaves holding them. The studies, numbers, names and sources those findings rest on sit in the briefs below, for whoever wants that far.

## 1. The audit: how much of the common ground is real

The single most useful thing the sweep produced is negative: most of the numbers and rules this field repeats have no source, or say the opposite of what they are cited for. This section changes what you may stand on. Almost every load-bearing figure in the folklore of documentation and team knowledge fails one of three ways: it traces to nothing, it misreads a real study, or it was tested and came up empty.

The ground for this section: the [citation-verification report](../../../sweep-2026-08/raw/a3f4c332843acf946.md), the [organisational-knowledge report](../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md), the [reading-folklore trace](../../../sweep-2026-08/raw/aec803bcd71ce9745.md), and the [DORA primary-source read](../../../sweep-2026-08/raw/abeeefde341d33a2d.md).

### 1.1 Numbers that trace to nothing

Five figures carry a great deal of this field's advice. Each was chased to its origin, and the origin is empty. Do not cite them.

Two of them are the multipliers everyone quotes about developer work: a defect costing 1x in design, 10x in test and 100x in production, and developers reading code ten times more than they write it. One rests on a training school that was never a research body. The other rests on one author's memory of watching screen playbacks.

The third is the claim that good documentation makes teams 2.4x more likely to perform well. It came from a self-reported survey, and its own publisher unpicked it over the four reports that followed.

The last two — the savings quoted for structured content, and the sample sizes quoted for card sorting — have no primary source behind them at all.

#### 1.1.1 The two multipliers about developer work

Both ratios came from recollection rather than instruments, and both already carry a correction from the people nearest to them.

**"A defect costs 1x in design, 10x in test, 100x in production."** The cited "IBM Systems Sciences Institute study" does not exist. The institute was an IBM training school in Los Angeles, not a research body. Bossavit's chase found no study, no data, no sample. Boehm and Basili themselves wrote in 2001 that for small non-critical systems the factor is "more like 5:1 than 100:1".

**"Developers spend 10x more time reading code than writing it."** This originates with Robert C. Martin in *Clean Code* (2008), from his memory of watching editor session playbacks. No instruments, no measurement — and what he watched was scrolling, not reading.

#### 1.1.2 The documentation multiplier its own publisher walked back

This is the one figure here whose own publisher took it apart, in public, across four annual reports.

**"Good documentation makes teams 2.4x more likely to perform well."** DORA published this in 2021 from a self-reported snowball survey. Its own 2022 report then found documentation *negatively* linked to delivery performance. The 2023 report found *no effect*, "the second year we see this behavior". The 2025 report dropped the construct entirely and declined to use the word "effect" at all.

#### 1.1.3 The figures sold with structured content

These are the sales numbers for structured content. None has a primary source, and knowing that is what lets you ask for one.

**"Structured content reuse saves 30–40%"** (the sales figure for DITA, an XML standard for technical writing), **"structured knowledge bases beat unstructured by 29–46 points"** (attributed to a page that does not contain it), and **GitLab's "605,000-word handbook"** — none has a primary source. The [DITA evidence report](../../../sweep-2026-08/raw/a5e68a671a08e519a.md) found DITA's entire scholarly footprint smaller than a mid-tier workshop paper's.

#### 1.1.4 The card-sorting sample sizes

The rule that fifteen users are enough is quoted as a settled result. It was read off a picture.

Nielsen's card-sorting sample sizes ("15 users gives r = 0.90") come from a graph in a non-peer-reviewed 2004 conference paper that prints no such numbers. The whole method chain is traced in the [card-sorting report](../../../sweep-2026-08/raw/a5437aa6a38bae10c.md).

### 1.2 Real studies, cited backwards

Five genuine studies are cited for the opposite of what they found. Three of them are the entire received case for keeping structure shallow and narrow, and read at source, all three refute it. Miller disowned his own 7±2 and named the way past it. The menu experiments said to cap breadth had winners far wider than the rules built on them allow. Luhmann's slip-box, the standard exhibit for flat structure, runs several levels deep with no strict hierarchy at all.

The other two are borrowed from outside the field and fare no better. Dunbar's 150 does not survive its own re-analysis. Romer's growth model, cited as proof that knowledge compounds, calls the compounding an assumption rather than a result.

The full corrections are in the [verification report](../../../sweep-2026-08/raw/a3f4c332843acf946.md).

#### 1.2.1 The three sources behind "keep it shallow"

These three are quoted together whenever someone argues for flat, narrow structure. Each fails in a different way, and the differences are what you answer with.

**Miller 1956 ("7±2")** called his own number "a pernicious, Pythagorean coincidence" and gave the escape hatch himself: chunking raises capacity. **Cowan's "4 chunks"** is visible only under lab conditions that deliberately *block* chunking — conditions a re-readable document never meets.

**The menu depth-vs-breadth studies refute the shallow rules built on them.** Larson & Czerwinski's winning level was thirty-two items wide. Kiger's fastest tree was four top items holding sixteen each. Every result is an optimum for one fixed item count; none supports "two levels, three at most".

**Luhmann's slip-box archive (the famous Zettelkasten) is a counter-example to the shallow-structure rule it is cited for.** The archive documents up to four sub-levels, 108 divisions in the first box, and no strict hierarchy at all.

#### 1.2.2 The two numbers borrowed from other fields

Both arrive in knowledge work from another discipline. In both cases the correction is in the original author's own text.

**Dunbar's 150**: the 2021 re-analysis reports confidence intervals of roughly 2 to 520 and concludes that no cognitive group-size limit can be derived this way.

**Romer 1990** is cited as proof that knowledge compounds. His own text calls unbounded growth "more like an assumption than a result of the model", and he states plainly that a large population is not sufficient to generate growth.

### 1.3 Practices tested, and found empty

Six practices do have real outcome evidence — studies or field reports — and the evidence is null, or nearly so. They fall into three pairs, and each pair fails in its own way.

The two written artifacts the field trusts most, architecture decision records and design docs, show at most modest effects and are largely abandoned the moment they are written. The two methods that shape documentation, card sorting and Diátaxis, fail their one direct test and are disclaimed by their own author.

And the two kinds of ceremony placed around writing, heavyweight proposal processes and requirements-quality rules, pile up work that never finishes and rest on evidence their own auditors call folkloric.

#### 1.3.1 The artifacts: decision records and design docs

These are the two documents a team is most often told to write. Both have been measured, and both times the writing happened and the use did not.

**Architecture Decision Records.** The one study that looked for an effect ([ICSA 2026, on 921 repositories](../../../sweep-2026-08/raw/aae121db667d39f2d.md)) found "at most, modest observable effects". Half of all such records in the wild are written once and never touched again; 63% are born already "accepted", skipping the deliberation they exist to record; 4.6% of adopting repositories show sustained team use.

**Design docs.** The canonical text is a 2020 opinion post. The one controlled experiment (Ernst & Robillard, 65 people) found *no effect of document format* on architecture understanding — prior exposure to the code dominated. Google's only published number: 90% of its internal wiki had no views or updates in recent months. Details in the [design-doc report](../../../sweep-2026-08/raw/a63bf2eb6c5d05ba8.md).

#### 1.3.2 The methods: card sorting and Diátaxis

These are the two methods people use to decide a documentation shape. One failed its only direct exam. The other never claimed evidence, and its author now says so plainly.

**Card sorting.** The most direct validity test (Schmettow & Sommer 2016, peer-reviewed) found "the match between mental model and website structure has no effect on browsing performance". The method is universal practice; its evidence base failed its one real exam.

**Diátaxis** cites no research, and its author disclaims the file-per-type reading adopters made of it: "four boxes… is a typical outcome of the good practice, not its end." The best failure report is Google's Pigweed team: applying it as a literal blueprint "resulted in too much fragmentation", and they retreated to sections within a page. In 2026 the author deleted his only page on complex hierarchies, saying it wasn't good enough, and has replaced it with nothing. See the [Diátaxis report](../../../sweep-2026-08/raw/a26ae7e524c53262a.md).

#### 1.3.3 The ceremony: proposal processes and requirements rules

Both of these wrap heavy process around writing. Measured, the weight buys nothing, and in one case the only visible improvement came from going around it.

**Heavyweight proposal processes.** Measured across [IETF, Rust, Kubernetes, and Python](../../../sweep-2026-08/raw/ab6fb706729be0f77.md): the heavy process piles up unfinished proposals with no exit (Rust: 215 open, median age 905 days; Kubernetes: 343 live, 14 ever killed), and the only intervention with a visible before-and-after is routing around it with a lighter process.

**Requirements-quality rules.** A systematic audit of 57 publications found 47.5% of claimed impacts merely hypothesised, and calls the field's evidence "anecdotal or folkloric". The claimed 10–100x cost of late defects was tested across 171 projects and not found.

### 1.4 The audit's own limits

The audit is not proof of absence. Absence from the open indexes is not proof a number was invented — trade whitepapers sit outside them, and several agents lost search mid-task. Where a report says "could not establish", that is its exact meaning: unverified, not false. The clean habit the sweep models is worth keeping: quote what a source says, in its own words, with its sample size — or do not cite it.

## 2. What measurement found about human readers

Cleared ground is not empty ground. A modest set of real results exists, and their value is that unrelated fields keep finding the same things. This section gives you the three repeated findings about readers, then the prose-level effects that survive scrutiny — each with its strongest evidence and its honest limits.

### 2.1 The failure is finding, not understanding

The best-evidenced single claim in the sweep: when professionals fail with a long document, they fail to *locate* the right piece, not to comprehend it once found. Three fields report this independently.

In medicine, the one think-aloud study of professionals reading a real guideline ([Kilsdonk 2016, 13 clinicians](../../../sweep-2026-08/raw/a4071d48c3f5d869c.md)) found they could read it fine — they could not find the applicable recommendation. In aviation, NASA's most detailed checklist analysis (Burian 2014) found flow lines that cannot be followed across pages and unexplained jumps, and marks the load-bearing usability questions "Further Research Needed".

In software, the strongest instrumented study ([Xia et al., 78 professionals, 3,148 hours](../../../sweep-2026-08/raw/aec803bcd71ce9745.md)) found 58% of working time spent comprehending. And a famous "35% comprehension" figure turns out, at its source, to measure the *mechanics of navigation* between files — the finding-cost again, mislabeled as understanding.

Two related results sharpen this. Grol watched 61 family doctors make 12,880 real decisions: vague recommendations were followed 36% of the time, clear ones 67%. Specificity correlates with use (observational, confounded, but large and in a real population).

And hypertext research ([DeStefano & LeFevre 2007, and after](../../../sweep-2026-08/raw/adc8fe8e64ae23f70.md)) found three things. Deciding whether to follow links taxes reading. Fewer links beat more. And a *hierarchical*, predictable link structure largely rescues the cost, while a web-like structure does not — with the cost landing hardest on low-knowledge readers.

### 2.2 The reader's ground outweighs the text

The second repeated finding: what the reader already holds decides more than how the text is written. A document is a second-order lever.

Where knowledge transfer fails, it fails at the receiving end. The strongest study of it found the blockers were the recipient's inability to absorb, the unclear causes inside the knowledge itself, and a difficult relationship between the two parties. Motivation ranked low. Absorption in turn depends on prior related knowledge, so a reader who lacks the ground cannot be written around.

That is not an argument that experts are safe. Practising lawyers were slowed by legalese exactly as laypeople were, and the popular advice to strip guidance for experts has no field evidence behind it. And where a document meets a newcomer, people beat it: mentorship outranked documentation in onboarding, because a document has no way to repair a misunderstanding while it is happening.

#### 2.2.1 Why transfer fails at the receiver

These are the two studies underneath the finding. One measures where transfers actually break down. The other says what makes a reader able to absorb anything at all.

**Knowledge transfer fails at the receiver.** Szulanski's study of 122 best-practice transfers in 8 firms — the strongest single study in [organisational knowledge](../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md) — found the dominant barriers were the recipient's lack of absorptive capacity, the causal ambiguity of the knowledge, and an arduous relationship between the parties. Motivation ranked low. One strong study, never independently replicated.

**Absorption depends on prior related knowledge** (Cohen & Levinthal, replicated but heavily moderated). A receiver who lacks the ground cannot be written around — which is a structural claim about readers, not a writing tip.

#### 2.2.2 What expertise does not buy

Two well-designed studies say the same thing from opposite directions. Training lifts a reader, and it does not make bad writing cost them less. This is the direct evidence against writing a stripped-down version for experts.

**Expertise does not shield anyone from bad prose.** The best-designed professional-reader experiment anywhere in the sweep: Martínez, Mollica & Gibson (PNAS 2023) tested 105 practising lawyers against laypeople on legalese. Training raised the whole curve; it did *not* buffer against complexity — no interaction. A second experiment: 102 lawyers rated simplified contracts equally enforceable and higher quality. Sentence-level complexity taxes experts too.

**"Strip guidance for experts" has no field evidence.** The 2025 expertise-reversal meta-analysis (60 studies, 5,924 learners) confirms the effect in students — but it contains *zero* studies of practising professionals, the harm side is non-significant within every education level, and the effect is lopsided: adding help for novices is a larger effect than removing it for experts.

#### 2.2.3 The repair loop a document does not have

This is the one finding in the section that names a mechanism instead of only measuring an effect, and the mechanism is a ceiling no rewriting lifts.

In onboarding, mentorship outranked documentation when 411 Microsoft developers named factors freely — though lack of documentation was still the strongest of the listed factors. Clark & Brennan's grounding theory explains the ceiling: a document has no live repair loop, so misunderstandings compound silently where a conversation would fix them cheaply.

### 2.3 Writing that nothing consumes, decays

The third repeated finding is about survival, not quality: a document stays true only when something downstream stands on it.

The sharpest form comes from six automotive companies ([Wohlrab et al., 53 practitioners](../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md)): artifacts that *generate* something — code, tests, other artifacts — get maintained; artifacts that merely *describe* do not. Their blunt guideline: produce descriptive documentation as late as possible, and only when actually needed.

The same shape recurs everywhere the sweep looked. Section 1.3's abandoned decision records and unread wiki are two instances. Beyond them: llms.txt, a file sites publish for AI crawlers, is served by thousands of domains and fetched by none of the major crawlers ([the server-log evidence](../../../sweep-2026-08/raw/a5e1231b95c4c9ac5.md)); and skill files — packaged instructions agents load for a task — were silently invalidated, in part, by every one of 105 measured repository releases. The decay itself is universal. What varies is whether anything downstream notices.

### 2.4 The writing effects that are real — and their limits

A few prose-level effects survive scrutiny, and each is smaller than its reputation. Minimalism — task-first manuals, error recovery, less filler — is the only documentation tradition with genuine controlled experiments behind it, and its own authors say it never meant cutting words.

Narrative form beats exposition by the largest margin in the whole literature, while interesting-but-irrelevant detail reliably hurts. The variable that pays is relevance, not liveliness. Signal words, segmenting, and structure placed high in a document help modestly, and the same relations placed low barely register.

One bounding fact sits against all three. These effects fade when measured after a delay, shrink when the reader controls their own pace, and are dwarfed by how a document is put to use. The surgical safety checklist is the cleanest demonstration anywhere: the same artifact gave dramatic gains, a null, and a positive trial, depending on how it was introduced.

The letters d, g and r below are the standard effect-size units of these studies. For d and g, roughly 0.2 is small, 0.5 medium, 0.8 large. Ground: the [comprehension-science report](../../../sweep-2026-08/raw/adc8fe8e64ae23f70.md) and the [minimalism reports](../../../sweep-2026-08/raw/a5e1231b95c4c9ac5.md).

#### 2.4.1 Minimalism, and what its authors meant by it

People invoke minimalism when they want permission to cut words. Its own authors say that was never what it meant, so the warning matters as much as the evidence.

Minimalism — task-first manuals, error recovery, less filler — is the only documentation tradition with genuine controlled experiments showing users learn faster (Carroll 1987; meta-analysis d = 1.12). Limits: 288 participants in total, word processors, the 1980s–90s, and the meta-analysis was never peer-reviewed. Its authors' own warning: minimalism does not mean brevity, and "slashing the verbiage" alone is the canonical misreading.

#### 2.4.2 Narrative, and the cost of interesting detail

The size of this effect is what makes it notable. The result beside it is what stops it becoming licence to entertain.

Narrative beats exposition for understanding and recall — the largest margin in the literature (Mar et al. 2021, 33,000+ participants, robust and unmoderated). Meanwhile irrelevant-but-interesting detail reliably hurts. The operative variable is relevance, not liveliness.

#### 2.4.3 Signals, segmenting, and where structure sits

These are the effects that touch how a document is arranged. The numbers are small, and the sharpest of them is about placement rather than presence.

Signal words, segmenting, and structure at the top level help — modestly. Explicit connectives: r ≈ .17, strongest for low-knowledge readers. Meyer's levels effect: relations placed in the top third of a structure shape comprehension; the same relations placed low barely register. Advance organizers help slightly — and the *concrete or graphic* opening beats the abstract one, the one part of Ausubel the data specifically failed to confirm.

#### 2.4.4 What bounds all of them

Read this before leaning on any effect above. These bounds are not caveats belonging to one study each. They apply across the set, and the last one applies to the idea that a document carries an effect at all.

Text-structure effects measured on delay all went non-significant. Design matters less when the reader controls their own pace — which is how documents are read. Stated purpose questions improve learning of exactly what they name (g = 0.54) and nothing else in the same text (g = 0.04). And practitioner *preference* is not comprehension: Brandt's 181 physicians preferred a layered guideline format 72% to 16%, while understanding did not significantly move.

One more result belongs here because it is the cleanest natural experiment on documents changing outcomes at all. Surgical safety checklists: dramatic gains in the original 8-hospital study, a null across 101 hospitals when mandated by policy, and a positive randomized trial where introduction was an engaged programme. The artifact does not carry the effect; the implementation does.

## 3. The machine reader, measured

2025–26 produced something this field never had before: controlled experiments on how a machine reader actually uses written material. Their results split cleanly, and the split is the most direct outside evidence bearing on how knowledge for agents should be written. Ground: the [context-engineering report](../../../sweep-2026-08/raw/aafbf4f4a32e619af.md), the [agent-documentation null results](../../../sweep-2026-08/raw/af750ce80e754223b.md), and the [adversarial stress-test](../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md).

### 3.1 Long context fails by composition, not length

A model's context does not degrade the way intuition says. Chroma's *Context Rot* study (18 models, echoed by independent work) found that a single irrelevant distractor hurts, and that a focused prompt of ~300 tokens — a token is the model's unit of text — beat the same content inside a ~113,000-token prompt for every model tested. Its under-cited finding: models scored *better on shuffled text than on logically coherent text*. Length is a weak predictor. What sits in front of the model, and how it hangs together, is the variable.

Two consequences are measured. Compaction — summarising a session to continue it — silently deletes governance: one benchmark found policy violations going from 0% with full context to ~30% after summarisation, fixed only by *typing* certain content as non-compressible (one paper, deterministic benchmark). And progressive disclosure has a ceiling: one level of routing files beats raw navigation; a second level adds nothing and sometimes hurts (the only controlled test of the pattern).

### 3.2 Prose guidance is inert; addresses and contracts are not

The sharpest split in the whole sweep. What agents demonstrably use is *navigation and machine-facing contracts*. What they demonstrably do not use is *prose explanation* — the thing vendors recommend most.

The two most widely adopted prose conventions both measured null or worse, while costing more tokens: instruction files placed in repositories for coding agents, and packaged skill files.

What moved the numbers instead was addressing — cleaner tool descriptions, a link map, tools presented as a filesystem to explore. Even the one positive result for prose guidance took its whole gain from agents reaching the right files, while the quality of what they then wrote stayed flat. The mechanism is finding, again.

A harder result sits under both sides. Source code answered behavioural questions that natural-language summaries of that same code could not, whoever wrote the summaries. And outcomes flip between identical runs often enough to put a noise floor under every small documentation effect anyone reports.

#### 3.2.1 The two prose conventions that measured null

These are the most widely adopted conventions in the field, and they carry the clearest negative results in it. Adoption is not evidence here.

**AGENTS.md files — prose instruction files repositories place for coding agents, the widest-adopted convention at 60k+ projects — have the clearest null.** The ETH/LogicStar study found such files "do not generally improve task success rates, while increasing inference cost by over 20% on average". Agents followed the instructions; repository overviews simply did not help. A second, independent experiment (288 runs) agrees.

**Skill files lowered performance in the only controlled benchmark found**: injecting the matching skill reduced pass rates 1.3–4.2% at 72–394% more tokens. Adoption is enormous; benefit is not established.

#### 3.2.2 What agents do use: descriptions, maps, and reachable files

These are the positive results, and they share one mechanism. Every gain here is a gain in reaching the right thing, never in understanding it better once reached.

**Machine-facing descriptions measurably work.** Cleaning up tool descriptions: +5.85 points median task success. Standard-compliant descriptions: tool selection from a 20% baseline to 72%. Both experimental.

**The mechanism, isolated, is finding.** The one positive guidance result got its gain entirely from agents reaching the correct files (+14.5 points coverage) while the quality of the fix they wrote stayed flat.

The same mechanism explains the two big navigation wins. A link map cut agents' invented dead URLs by ~90% with accuracy flat (vendor benchmark, unusually well-designed). And presenting tools as a filesystem to explore — rather than definitions to preload — is the largest claimed token saving in the field (vendor's illustrative number; the mechanism, not the magnitude, is corroborated).

#### 3.2.3 Code as context, and the noise floor under everything

Two results, and both cut deeper than the section holding them. The first says the form knowledge is in matters more than who wrote it up. The second says a share of every agent result is noise — which bounds the small effects in section 2 as well.

Code beats prose as context, and there is a noise floor. With location held fixed, natural-language summaries answered 4 of 45 behavioral questions where the source code answered 27. That is a property of the representation itself, since the largest and the smallest summarisers scored identically.

The same paper — its design registered before the runs — reports that even with randomness turned off, ~9% of outcomes flip between identical runs. That is a noise floor under every small documentation effect anyone reports.

### 3.3 Where typed structure wins, and where it loses

The [stress-test report](../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md) drew the line through dozens of 2026 results, and the line is clean. **Typed structure wins at the edges of content and loses in its body.**

It wins wherever a rule must hold even when the model is wrong (permissions, budgets), wherever the question is a set operation (count, intersect, "all items where"), wherever many writers share no coordinator, wherever someone absent at writing time must later ask what happened (provenance), and wherever cost must not grow with catalog size. No model capability substitutes for any of these — they are facts about writing and accountability, not reading.

It loses as the body's format, in two measured ways. Structure *inferred* by a model is poison: a model asked to reconstruct missing metadata scored 0.22 accuracy, form-perfect output hit 0% valid content on a 369-field schema, and a wrong type is worse than prose — it keeps answering confidently while prose fails visibly. Structure *declared by people and kept tiny* wins its comparisons: thirteen memory categories, fifteen operations, and the open web itself, where of the 958 types in schema.org (the shared vocabulary websites use to label their data), twelve carry essentially all real deployment.

One more line bounds the whole case. Sensitivity to format in *reading* shrinks as models improve — so the durable case for typed context rests on selection, addressing, and provenance, not on models parsing types better. The missing experiment is named in section 6.

## 4. The builders, and what their work cost them

Research is one kind of contact; the other is the people who built systems near this ground and wrote down what it cost. Their record is the most concrete guidance the sweep holds, and almost all of it is in their own words.

### 4.1 Ink & Switch: the closest working neighbour

One lab has spent a decade on exactly this ground — documents, links, versions, local files, malleable software — and publishes its failures. The [tools-for-thought report](../../../sweep-2026-08/raw/a3f6ddd86cf882a6d.md) reads their decade as five expensive lessons.

Formalising costs the writer now and pays the reader later, so typing must be deferrable, or people will not type. Do not take files away. Schema change will be the hardest problem, and no one will help. Do not standardise a contract before it has users. And branching, not merging, is the durable win.

Their live system, **Patchwork**, is the closest shipped neighbour to "documents plus tools over one substrate" — a registry of data types and tools over versioned documents, now taught to coding agents via an installable skill. Their dead project, **Cambria**, is where they met schema change and stopped. It leaves one rule worth following and one thing not to attempt.

#### 4.1.1 Cambria, and the warning against lenses

Cambria is the only place in the sweep where anyone seriously tried to make old data readable under a new schema. It failed, and the failure is more useful than most successes.

Cambria is the definitive word on migrating data between schema versions by "lenses" — two-way translation rules, written once, run in both directions. The team abandoned translating at write time, shipped a flagship rule that broke the very guarantees lenses promise, never measured performance, and stopped in 2020 with no successor.

The [schema-evolution deep read](../../../sweep-2026-08/raw/ad341d6da8eaac361.md) extracts what survives: tag every write with the contract it was written under, and translate lazily at read. And it warns: do not build lenses — the mathematics says the composition law you would need is incompatible with the operations you would actually want.

### 4.2 The cost of typing, learned in the 1990s

The oldest sharp critique in the sweep is Shipman & Marshall, *Formality Considered Harmful* (1999): structured capture imposes cost at writing time — chunking, naming, labeling — that users route around, and experts cannot reliably introspect their own reasoning into forms, even when video shows their natural talk already has the structure. It is an experience essay, not a measurement study, and nothing since refutes it.

The design-rationale tradition it closes is a warning label for any "record the why" ambition. Per the [design-rationale report](../../../sweep-2026-08/raw/a7ea3bc0963c0e185.md): the entire quantitative case that recorded rationale helps a later reader is one 17-subject experiment that worked on one of its two systems; in the one field observation, a professionally-scribed rationale document answered only 41% of readers' actual why-questions; and capture cost, the thing that killed every system, was never measured by anyone.

### 4.3 The graveyard, in the builders' own words

The ventures that tried to replace text-as-substrate with structure left unusually honest post-mortems, gathered in the [structured-editors report](../../../sweep-2026-08/raw/a4bdd8ce92076fef2.md). They say two different things.

Commercially, three structure-first ventures arrived at one funding answer. Darklang ran out of money and deleted the structured editor that was half its codebase, because it stopped making sense once a model was writing the code. Unison shipped after eight years and turned to consulting. Glamorous Toolkit runs on consulting too.

From the research side the diagnosis was different: what was missing was theory, not engineering. And the academic line around it went quiet with almost no public explanation, which is its own data point about how research knowledge decays.

#### 4.3.1 The three ventures, and their one funding answer

The exact words matter here. The cause Darklang names is the same cause this document keeps meeting from every other direction.

**Darklang** (Paul Biggar, 2025): "Dark Inc has officially run out of money." And the cause, named: "Our online structured editor didn't make sense when the LLM is generating the code." The editor was half their codebase; they deleted it.

**Unison** — code stored in a database rather than text — shipped 1.0 after eight years and pivoted to consulting in 2026 to fund itself. **Glamorous Toolkit** ("Objects, not text") runs on consulting too. Three structure-first ventures, one funding answer.

#### 4.3.2 The research line, and its silence

One retrospective names what the research programme lacked, in the author's own words. Nothing else in that line left a statement at all.

**Jonathan Edwards** (Subtext, 2025 retrospective): "a series of overambitious failed experiments… What Subtext needed was a Theory of Change." From the research side, the missing piece was theory, not engineering.

The academic line — Webstrates, Varv, Mavo — is [dormant or build-bot-only](../../../sweep-2026-08/raw/a5105d288fc90070c.md), mostly without any public explanation.

### 4.4 The survivors' one move: keep the files

The [note-taking market](../../../sweep-2026-08/raw/add822cc12cefe954.md) ran the same experiment commercially, and the verdict landed in 2026: plain files won, for a reason nobody predicted — agents can read them. Obsidian's plain Markdown on disk became its strongest asset. Logseq moved its data *out* of files into a database, four years late, and its own community's top response was "too little, too late" — users left precisely because agents could no longer read their notes.

The rest of that market tells the same story from other angles. The venture-funded middle (Tana, Mem, Notion Mail, Coda) left note-taking for meetings and agents. And the best-read critique of the linked-notes movement concedes the deeper point: no empirical study anywhere establishes that linked note-taking improves outcomes.

The lesson generalises beyond notes. [Retool](../../../sweep-2026-08/raw/ace1709b4a562f194.md) abandoned its own visual app format for plain React and TypeScript in June 2026, saying the format "prevented LLMs from working fluently" — and kept the typed contracts (schema, permissions) as the durable asset. Structure a model cannot read is now a liability. That is the builders arriving, the hard way, at the same line section 3.3 drew.

### 4.5 The current neighbours

Nobody found in the sweep argues the whole "structured knowledge substrate" thesis. Every neighbour holds a piece and rejects the rest ([the who-else report](../../../sweep-2026-08/raw/a09867b88abcb610b.md)). The nearest is **Pentad Labs**: facts carrying context and lineage as first-class slots — essays plus a pre-release product, no shipped substrate.

The [agent-memory vendors](../../../sweep-2026-08/raw/a187277ed3a006fbc.md) — Letta, Zep, Mem0 — all converged, within six weeks of each other, on the one gap the platform vendors cannot fill: memory that travels *across* agent harnesses (the software shells agents run in). Anthropic's own shipped agent memory is markdown files at paths, where every change becomes a permanent version attributed to the session that wrote it. Files plus versions is the free floor any alternative must now beat.

The deepest standing opposition is Dynamicland's, and it deserves respect rather than rebuttal: "to maximize agency, minimize what the computer knows." Their decade-long counter-experiment holds that every machine-readable contract added to make composition automatic makes human comprehension harder.

The strongest reply the sweep found is a measurement, not an argument — though a small one (one user study, 16 people). Structure imposed as a writing tax does reduce agency. But structure offered as an inspection surface at decision time *increased* users' comprehension and error detection. The same word, "structure", covers two opposite designs.

## 5. The substrate lane

The sweep also crossed the engineering territory underneath: typed stores, permissions, schema change, interfaces built from data. Five lanes, and they arrive at the same conclusion. What survives is structure that people declare, keep small, and do not let chain. What fails, everywhere it is tried, is structure that composes by itself.

Every piece of a versioned, typed knowledge store already ships somewhere, and the products holding those pieces are fragile. The unclaimed part is only the combination. Inside them, nobody merges structure: a schema conflict blocks the merge and someone takes one whole side, and the systems that survived schema change did it by forbidding breaking changes rather than translating.

Permission that flows through chains of groups is the documented failure at the largest scale anyone runs. AI retrieval did not create that leak. It enumerated one that was already there.

The two lanes about shape agree with each other. The most successful shared vocabulary on the web deliberately made its hierarchy link non-transitive, while the one that let hierarchy chain accumulated millions of confusions. And nothing general ships for "which component can render this?" — every product's view layer is a closed list.

The last lane is the sharpest for this project. Graph-shaped retrieval lost its benchmarks, at many times the token cost of plain retrieval. What lost was structure a machine extracted. Structure a person declared was never the thing tested.

### 5.1 Versioned typed stores, and what happens at a schema conflict

Two findings sit together here, because the second is the wall the first runs into.

**Versioned, typed knowledge stores exist and are fragile.** TerminusDB is the closest shipped product to "git for a typed knowledge graph"; it survived a year-long gap only by handoff to new maintainers. The [competitive-landscape report](../../../sweep-2026-08/raw/abffcf492c6f3d77d.md) found every piece of that idea has precedent — the unclaimed part is only the combination.

**Nobody merges structure — they pick a side.** Across Dolt, Iceberg, Confluent, and TerminusDB ([the versioning report](../../../sweep-2026-08/raw/a96d8d0c3161e997c.md)): a schema conflict blocks the merge, and resolution means taking one whole side. The systems that survived schema change did it by *forbidding* breaking changes and forcing a new name, not by translating.

### 5.2 Permission that flows through chains

Three of the largest systems in the world document this failure, each from a different angle. The last of them is why AI retrieval keeps being blamed for leaks it did not cause.

Permission that flows through chains of groups is the documented failure. Google's Zanzibar paper names deep group nesting as its latency problem; Google Drive removed the ability to narrow access below a parent folder; Microsoft documents, in its own words, that AI retrieval surfaces every forgotten over-broad grant. The AI did not create the leak — [it enumerated it](../../../sweep-2026-08/raw/aea19b144c46bfc26.md).

### 5.3 Hierarchy that deliberately does not chain

If you build a hierarchy, this is the decision to copy. The most successful vocabulary of its kind made it in 2009, and the numbers from the one that decided otherwise show what it saved them.

Hierarchy without automatic chaining is proven design. SKOS — the most successful W3C vocabulary — made its "broader" link deliberately non-transitive in 2009: A above B and B above C does not put A above C. Wikidata's chained class hierarchy, edited by many owners, accumulated ~2.4 million class-level confusions. The [semantic-web report](../../../sweep-2026-08/raw/adc9dab44aefdde97.md) reads the whole lineage: the vision failed; the small vocabularies and the validation layer won.

### 5.4 Interfaces built from typed data

Anyone imagining data that carries its own display should know that three separate lines of attempt each ended in the same place.

"Which component can render this?" is not shipped anywhere general. Every product's view layer is a [closed, fixed list](../../../sweep-2026-08/raw/a2252e73e0215b641.md); every [server-driven UI team](../../../sweep-2026-08/raw/a57740ddd62e39ab6.md) independently invented capability negotiation and an escape hatch; the [generative-UI standard](../../../sweep-2026-08/raw/a6064cc62dbf12499.md) that won is an opaque embedded web page.

Typed component trees live one layer up, where one party owns both sides.

### 5.5 Graph-shaped retrieval, and what its failure does not cover

This is the result people cite to say that structured knowledge does not work for machines. What it actually tested is narrower, and the difference is the one this project lives in.

Graph-shaped retrieval lost its benchmarks. Independent evaluations found [GraphRAG](../../../sweep-2026-08/raw/a7bfd40b8a7c7a61c.md) frequently underperforming plain retrieval at up to 210x the token cost; Microsoft put the reference implementation in maintenance mode. The evaluations kill machine-*extracted* graphs; human-*declared* structure was never the thing tested.

## 6. The open ground

The most valuable output of a sweep is the map of what nobody has done. These absences were each verified by at least one report searching for the thing and not finding it — which is evidence of absence from the reachable indexes, not proof of absence.

One of them is the crux, and it is why this project has no outside answer to point at. Nobody has ever put human-declared structure up against well-written prose on the same body of knowledge.

The others fall into two groups. Documentation itself has never been studied causally, nobody has watched professionals re-read a long document over months, and no study gives a document unit a size. So the reader this project imagines has never been observed, and any number used to size a section is borrowed from somewhere it does not fit.

The second group is closer to home. The specific devices this project relies on are unstudied or unshipped: marking claims by how settled they are, offering depth a reader may skip, and being able to say that an answer came from exactly this context and can be re-derived.

### 6.1 The crux experiment

Naming this one precisely is what lets you recognise the study that would settle the question, and reject the many that look like it and are not.

The crux experiment does not exist. No study compares model-assisted, *human-declared* structure against a well-written prose document, on the same body of knowledge, read by the same top-tier model. Every structure win in section 3.3 beat extracted or unstructured baselines — never good prose. This is the single experiment the whole territory turns on.

### 6.2 What was never measured about documents at all

Three absences, and together they explain why section 2 is as thin as it is. The evidence base for documents does not contain the study anyone would actually want.

- **No causal study of documentation exists at all.** No randomized trial, no natural experiment anywhere in which documentation was the changed variable and a team outcome was measured. The field measures what is wrong with docs, never what good docs buy.

- **Nobody has studied professionals re-reading a long document over months.** Every comprehension result rests on short passages read once, mostly by students. The reader this project imagines — returning repeatedly to a living corpus — has never been observed under measurement.

- **Section size has no number.** No study identifies an optimal length for a document unit. The working-memory figures used to justify one are misapplied lab results (see 1.2).

### 6.3 The three gaps under this project's own devices

These absences bear directly on how this project intends to work. Two are unstudied and one is unshipped, and none of the three is contradicted — they are simply empty.

- **Marking claims by how settled they are is unevaluated.** No literature tests author-assigned status marks on claims — not supported, not contradicted, simply never studied.

- **Whether skippability substitutes for audience-forked prose** — the adaptivity question — is untested in either direction.

- **Reproducible, addressable context is unsolved in shipped products.** Branching and checkpoints shipped in the major coding agents, but nothing lets anyone say "this answer came from exactly this context, re-derivable" — the work exists [only as papers](../../../sweep-2026-08/raw/aafbf4f4a32e619af.md).

## 7. What this document folds away

One file, so the folding stops one level above the evidence. Each section here compresses two to six full reports. The per-study sample sizes, the verbatim quotes, the vendor timelines, and every report's own "could not establish" list live in the linked raw files, which are the ground this document stands on.

Three territories were compressed hardest, and each rewards a direct reading: the market histories (low-code, vibe-coding, sync engines); the protocol detail (the evolution of MCP, the standard connecting agents to tools, and the vendors' memory interfaces); and the full recommendation sets of the [schema-evolution](../../../sweep-2026-08/raw/ad341d6da8eaac361.md) and [stress-test](../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md) reports — both end in concrete design guidance this document only names.
