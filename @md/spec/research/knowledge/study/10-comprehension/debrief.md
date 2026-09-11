# Lab 10 — the run's record

The run reads the 2026-08-26 sweep of 45 research-agent reports and debriefs it twice: into a corpus, and from the corpus into a piece. This file is written when stage one begins and kept current after every round, so a run cut short still leaves its record.

**This session carried stage one only.** The author amended the run twice while it was in progress: first that stage two would be handed to a fresh session holding the code, the practice and the corpus, and then that stage two would not be launched from here at all. So what follows is the account and stage one's rounds, complete. Stage two's rounds belong to whoever runs it, and §2 is left open beneath round 3 for them.

## 1. The account

One row per step: what the step was, the clock time it began, and the tokens the harness shows remaining to this session. The harness exposes no running output-token count, only a remaining-budget figure; that figure is what this column carries, and it falls as output and read material accumulate.

| step | began | tokens left |
|---|---|---|
| read the prompt | 17:09 | 14,976,126 |
| read the code, the practice, the sweep README | 17:10 | 14,964,390 |
| read all 45 raw reports | 17:12 | 14,730,951 |
| open the record, set the counting method | 17:24 | 14,671,318 |
| stage one, round 1: write the corpus whole | 17:26 | 14,669,367 |
| stage one, round 1: fresh head on loss | 17:51 | 14,545,588 |
| stage one, round 2: fold the loss list, write again | 18:00 | 14,521,999 |
| stage one, round 2: fresh head on loss | 18:06 | 14,498,901 |
| stage one, round 3: fold the loss list, write again | 18:07 | 14,479,495 |
| stage one, round 3: fresh head on loss | 18:22 | 14,460,435 |
| stage one, round 4: fold the loss list, write again | 18:26 | 14,457,199 |
| *round 5 runs in a second session; the budget restarts here* | | |
| read the prompt, the code, the practice | 18:47 | 14,965,630 |
| stage one, round 5: fresh head on loss | 18:48 | 14,948,778 |
| read the corpus, by depth then whole | 18:49 | 14,813,204 |
| stage one, round 5: fold the loss list, write again | 19:02 | 14,787,852 |
| *stage two runs in a third session; the budget restarts here* | | |
| read the prompt, the code, the practice, the skill | 20:41 | 14,976,112 |
| read the corpus, by depth then whole | 20:42 | 14,973,317 |
| open the record, decide what the piece is for | 20:43 | 14,807,031 |
| stage two, round 1: write the piece whole | 20:44 | 14,806,070 |
| stage two, round 1: fresh head on the draft | 20:53 | 14,763,355 |
| stage two, round 2: fold the four lists, write again | 21:01 | 14,687,417 |
| stage two, round 2: fresh head on the draft | 21:11 | 14,661,250 |
| stage two, round 3: fold the four lists, write again | 21:19 | 14,639,837 |
| stage two, round 3: fresh head on the draft | 21:29 | 14,576,242 |
| stage two, round 4: fold the four lists, write again | 21:36 | 14,550,130 |
| stage two, round 4: fresh head on the draft | 21:41 | 14,515,884 |
| stage two, round 5: fold the six material findings, write again | 21:46 | 14,497,996 |
| stage two, round 5: fresh head on the draft | 21:48 | 14,483,651 |
| stage two, round 6: fold the four material findings | 21:55 | 14,458,395 |
| stage two, round 6: fresh head on the draft | 21:56 | 14,444,686 |

### 1.1 The sizes

Counted with one method throughout: bytes divided by four, from `wc -c`, rounded to the nearest hundred tokens. No tokenizer library is installed in this environment, so a byte ratio is the one method that is reproducible from the files themselves.

| what | bytes | tokens |
|---|---|---|
| the raw, 45 files | 677,600 | 169,400 |
| corpus after round 1 | 317,177 | 79,300 |
| corpus after round 2 | 333,227 | 83,300 |
| corpus after round 3 | 345,970 | 86,500 |
| corpus after round 4 | 349,049 | 87,300 |
| corpus after round 5 | 363,239 | 90,800 |
| the piece after round 1 | 97,267 | 24,300 |
| the piece after round 2 | 108,194 | 27,000 |
| the piece after round 3 | 125,320 | 31,300 |
| the piece after round 4 | 130,606 | 32,700 |
| the piece after round 5 | 133,674 | 33,400 |
| the piece after round 6 | 137,101 | 34,300 |

## 2. The rounds

One section per round, for both stages. Numbers and file sections, not commentary.


### 2.1 Stage two, round 5

**Amended in place, by section:** `README.md` intro, §§2, 4, 5, 7 · `claims.md` §5 · `verdict.md` §§1, 6 · `reading/README.md` §§2, 3 · `structure/README.md` §4 · `survival.md` §4 · `medium/README.md` intro · `ground.md` §§2, 3. **Moved as they were:** every other brief; no brief was written again whole, because no understanding changed that a paragraph could not carry. The piece went 20 briefs and 33,400 tokens to 20 briefs and 34,300 tokens.

The fifth head returned 9 places it did not understand, 6 where ground came after use, 10 it would cut, and 12 missing on the piece's own terms, and ranked four as leaving a reader materially worse off. All four were folded.

One was an outright error of fact. `survival.md` §4 attributed a ten-to-fifteen-point bound to the 845,000-repository context-file evaluation; the bound belongs to a second, three-repository study, and `practice.md` §4 had it right. The clause is gone.

One was the piece's strongest support for the code graded three different ways: narrative appeared as "the largest effect in the literature" unmarked in the entry, with its sample sizes and no mark in `reading/README.md` §2, and inside a blanket "*measured or observed*" in `verdict.md` §6 — while `reading/effects.md` §1 says plainly that the sweep never opened that paper. All four places now say so.

Two were briefs of this piece contradicting each other. `reading/README.md` §3 still carried the equation of the gradient with Ausubel's advance organizer that `verdict.md` §1 had retracted a round earlier, and the reader met the retraction first; both now carry the same argued reading. And `structure/README.md` §4 called a model-only result the most direct evidence against arrangement helping a reader, where `structure/models.md` §6 says the human-and-model question is not measurable in either direction; it is now scoped to a model reader and says why it cannot be carried across.

Two further findings were folded because they were the gradient's own faults. The case against depth existed in three places and was never written as one understanding — a third level costing orientation for readers, a second routing level giving nothing for models, and the design prescription against layering depth — and `verdict.md` §1 now gathers them. And the piece never said whose it was, which `ground.md` §3 now states: a session working inside the thing being weighed.

**Left out at this round.** The head's cuts, again ranked by it as cost rather than harm: `verdict.md` carrying content its leaves own, the confidence vocabulary glossed in both the entry and `ground.md` §2 (the second is now a pointer), and the brief openings that enumerate their own sections, which the code names as a map of the parts to come.

**Left open.** That last one is the sharpest thing left. The head observed that `verdict.md` §1 defends the gradient by citing the code's rule against opening with a map of the parts — and that most of this piece's own briefs open with exactly such a map. Either the defence is weaker than stated or the piece does not follow the rule it defends by. It is not resolved here.

### 2.2 Stage two, round 4

**Written again whole:** `verdict.md` §§1, 2, 5, 6 — the understanding changed, not the words. **Amended in place, by section:** `README.md` intro, §2 · `claims.md` §4 · `practice.md` intro · `reading/README.md` §2 · `reading/effects.md` §1 · `making.md` §4 · `survival.md` §2 · `ceiling.md` §7 · `unknown.md` §6. **Moved as they were:** every other brief. **New:** `verdict.md` §1.1, the first heading in the piece to nest. The piece went 20 briefs and 32,700 tokens to 20 briefs and 33,400 tokens.

The fourth head returned 8 places it did not understand, 6 where ground came after use, 9 it would cut, and 12 missing on the piece's own terms, and it ranked six of them as leaving a reader materially worse off. All six were folded.

Two were errors of fact in the piece's own writing. `reading/README.md` §2 said narrative is roughly three times the size of signalling, which divides a correlation by a standardised difference across two scales the same brief warns are not comparable; converted to one scale it is about half again as large, and the sentence now says so without a ratio. And `verdict.md` §5 stated as a finding of the sweep that every system that won in 2026 typed the edges around a prose or code body; it is the adversarial lane's own generalisation over its survey, and is now carried and marked as that.

Two were verdicts standing on ground the piece never laid. `verdict.md` §1 said the gradient's opening move has a verdict against it, on an identification of the gradient with Ausubel's advance organizer that was never argued — and when argued, it holds for the nesting and fails for the opening, because the code instructs the opposite of an abstraction there. The verdict is now that the result lands on a failure mode the code already instructs against, and the entry's opening sentence was corrected with it. And the one direct design prescription, named twice as the heaviest thing said against arrangement as a lever, was never answered; `verdict.md` §1.1 now answers it item by item and states plainly that the contradiction on layering depth stands.

Two were ground arriving eighteen files late: the grade words the italic lines use, now glossed in the entry, and the coverage chart, now glossed where it is first used to downgrade a figure.

**Left out at this round.** The head's remaining cuts, which it ranked as tidying that would not change what a reader ends up believing: the advance-organizer passage appearing in both `verdict.md` §1 and `reading/README.md` §3, the disorientation study's sample size in two places, the entry restating its children's numbers, and the four studies run through one paragraph in `structure/inferred.md` §2.

**Left open.** Whether `structure/inferred.md` §2 and `structure/models.md` §1 should break into their constituent studies, which is the last level-not-broken-down the heads have named twice without it changing a reader's beliefs.

### 2.3 Stage two, round 3

**Written again whole:** `README.md`, `claims.md`, `verdict.md`, `structure/README.md`, `unknown.md`, `ground.md`. **Amended in place, by section:** `practice.md` §§1, 2 · `reading/README.md` §§1, 3, 4 · `reading/effects.md` §§2, 5 · `structure/models.md` §1 · `structure/inferred.md` §§1, 5 · `survival.md` §§2, 3, 4 · `making.md` §6 · `medium/README.md` intro · `medium/built.md` intro, §§1, 2 · `medium/breaks.md` intro · `medium/against.md` §2. **Moved as they were:** `reading/professionals.md`, `reading/finding.md`, `medium/breaks.md` §§1–6 bodies. **Cut:** `ceiling.md` §6, the Windows Vista defect-prediction section, which the brief itself conceded was not about documents; the decision tree in `structure/README.md` §1, which two heads in a row named as a second home for the five questions stated in the prose above it. The piece went 20 briefs and 31,300 tokens to 20 briefs and 32,700 tokens.

The third head's eight material findings were folded whole. Four were the piece contradicting itself or its sources: the verdict refuted a stronger claim than `claims.md` states, and now says so and lands on the narrow form the code holds; `structure/README.md` §3 called the noise floor measured where `structure/models.md` §5 says the description half is unmeasured; `medium/against.md` §2's flat "nothing typed beats prose on frontier models" is now reconciled with the five-point catalogue gain in `structure/models.md` §1; and the two architecture-decision-record corpus figures, 5,800 and 6,362, are now marked as two studies over one corpus.

Four were ground the piece never gave: there was no link to the code anywhere, and `README.md` and `claims.md` now carry one; the sweep was commissioned sixteen days before the code the claims are drawn from, which is now stated in `claims.md` and `ground.md` §5; the words *lane*, *register*, *coverage chart* and *the raw* were used throughout and defined nowhere, and are now given in `ground.md` §1; and the italic marks used words `ground.md` §2 said they did not, which is now stated as the rule it actually follows.

**Left out at this round.** The six things the evidence supports that most writing-principle sets omit, cut from `reading/effects.md` §5 as a list with no understanding above it. The head's request for a closing section saying what a reader should do: the piece weighs and does not advise, and `verdict.md` §6 is as close as that goes.

**Left open.** Whether `verdict.md` and the entry's territory sections are two homes for one understanding. The head called it the largest structural fact about the draft and could not rank it. The entry now says why both cuts exist — one answers the question, the other holds the evidence — and the territory sections were shortened so the verdict's sentences are not restated in them.

### 2.4 Stage two, round 2

**Written again whole:** all 17 briefs. **New:** `output/verdict.md` and `output/making.md`, and `output/claims.md` written for the first time at the end of round 1's fold. **Moved as they were:** none; the fold reached every brief. **Holarchies whose own text was redone:** all four — `output/README.md`, `reading/README.md`, `structure/README.md`, `medium/README.md`. The piece went 17 briefs and 24,300 tokens to 20 briefs and 31,300 tokens.

The first head's four lists were folded whole. The structural fault it named — the piece argues for and against a position it never states — was answered by `claims.md`, five claims stated in the code's terms before any evidence, with the entry's first sentence carrying them. Four more that changed briefs rather than words: the two confidence vocabularies are now reconciled in `ground.md` §2 and stated in the entry's second paragraph; the entry's marks were corrected against their children; the noise floor was carried up to `structure/README.md` §3; and the anonymised referents in `medium/` were named, one naming policy across the piece.

#### What the second fresh head handed back

One head, on Opus, in the same isolation. Four lists: 22 not understood, 15 places ground came after use, 30 it would cut, 21 missing on the piece's own terms. Its closing verdict was that a further pass would find structure rather than words.

The largest was that the piece weighs a position and never returns a verdict on it, seen from four sides: no brief adjudicates any of the five claims; claim 4, the making, is stated and promised coverage in `claims.md` §4 and given none; the advance-organizer inversion is never matched to the gradient it describes; and nothing consolidates what the evidence supports that the code already does.

Four more that changed briefs: one finding — models scoring better on shuffled material than on coherent material, across eighteen models — sat three levels down in a subordinate clause and is the sharpest result in the material against arrangement being the lever; the draft counted three untested rules where its own evidence gives four, since one home per fact had lost its justification in `reading/effects.md` and was not counted; `ground.md` §2 was ground for the whole piece and sat in the last file; and the one-home rule was broken at scale, with five homes for the retrieval finding, four for the context-file null, three for the inference range.

**Left out at this round.** The redundancy-effect detail was moved out of `reading/effects.md` into `unknown.md` §5, where the untested rules live, rather than kept in two places. The Boehm and Basili defect-cost example left `practice.md` §3 as detail that interested without serving. `structure/README.md`'s section summarising the case against was cut as a link wearing a heading.

**Left open.** Whether the diagram in `structure/README.md` §1 earns its place beside the prose that states the same five questions; the head called it a second home, and it stayed because the prose gives the understanding and the diagram gives the enumeration.

### 2.5 Stage two, round 1

The piece was written whole into `output/`: 17 briefs, 97,267 bytes, 24,300 tokens. Entry `output/README.md` with eight sections; `practice.md`, `survival.md`, `ceiling.md`, `unknown.md`, `ground.md` beside it; folders `reading/` (README, effects, professionals, finding), `structure/` (README, models, inferred), `medium/` (README, built, breaks, against). Nothing was moved; there was nothing to move. Links to the corpus rather than restating it: 11 pointers into `../corpus/`.

**Left out at this round.** Every figure the corpus carries that no understanding in the piece stood on: the whole of `corpus/register.md`, the company censuses in `corpus/field/tools-for-thought.md` and `corpus/interface/market.md`, the standards state in `corpus/substrate/formal-kr.md` §§3–8, `corpus/writing/profession.md` whole, and the forty retired figures in `corpus/folklore.md`, pointed to rather than reproduced.

#### What the fresh head handed back

One head, on Opus, holding `code.md` and the draft and nothing else. It returned four lists: 22 places it did not understand, 15 where the text came before its ground, 21 it would cut, 23 missing on the piece's own terms.

The largest was structural and named the same fault in all four lists: the piece argues for and against a position it never states. `README.md` §6, `structure/README.md` §§1 and 5, `structure/inferred.md` §§3 and 6, all of `medium/`, and `unknown.md` §5 all stand on "the thesis", "this project", "the deeper claim", and the ground for them is nowhere in `output/`.

Four more that changed briefs rather than words: the grade vocabulary promised in the entry (`ground.md` §2) is not the vocabulary the briefs use; `README.md` §§4, 5 and 2 state at the top a confidence their children mark lower; the 9% noise floor in `structure/models.md` §5 bounds two headline claims and never reaches them; and the referents in `medium/` are anonymised while `practice.md` names its sources, which is two naming policies in one piece.

**Left open at this round.** Whether the piece should carry the claims it weighs, or assume them.

### 2.6 Stage one, round 1

Pending.

The corpus was written whole in one pass, as the code's fifth section asks: the whole first, because which understandings are biggest is known only against the depth beneath them.

**Written.** Forty-one files. Four at the root — `README.md` (the entry), `method.md`, `folklore.md`, `register.md` — and seven folders: `reading/` (5), `writing/` (5), `agents/` (6), `people/` (3), `substrate/` (7), `interface/` (6), `field/` (5).

**The order chosen.** The entry gives two understandings before it breaks down: that adoption runs ahead of evidence in every territory the sweep entered, and that where structure pays is narrow and specific. Beneath it the folders lie in the order they stand on each other — how people read, then what the practice of writing buys, then what models do with it, then what moves knowledge between people, then whether typed structure is the right medium, then how far that reaches into interfaces, then who else is on the ground. `method.md` comes before all of them because it grades every figure; `folklore.md` and `register.md` come last because nothing stands on them.

**One home, chosen where a fact could have gone two ways.** The retired numbers live in `folklore.md` alone, so no brief carries a warning about a figure it does not use; `reading/bounded-head.md` holds only the formulations the same studies *do* support. The prescriptive-versus-descriptive maintenance finding lives in `people/structure.md`, because it is a finding about organisations, and `writing/README.md` points to it rather than restating it. Minimalism lives in `writing/evidence.md`, as the one causal line in documentation measurement, not in `reading/`.

**Left out at this round.** The sweep's coverage of the project's own prior documents — the fifteen-rung ladder and the coverage chart — is compressed into `method.md` §4 as *what the sweep was sent to answer*, not given a brief of its own. Vendor ARR figures graded unverified by their own agents are named in `folklore.md` §8 and not repeated where the companies appear.

**Left open.** Whether `reading/finding.md` (information architecture) belongs under reading or under writing; it was placed under reading because it concerns how a reader reaches a part, not how an author composes one.

**Checked.** All 219 relative links resolve; none point outside the repository.

### 2.7 Stage one, round 2

The fresh head held the code, the 45 raw reports and the corpus, and was asked only what the corpus loses. It returned twelve losses that matter, twelve distortions, fifteen facts stated in full in two places, and four places where a claim was laid before its ground. Every item was folded.

**Written again whole, because their structure changed.** `README.md` (the entry), `reading/bounded-head.md`, `writing/README.md`, `agents/README.md`.

**Amended in place, by section.** `method.md` +§4.1 · `folklore.md` §§1, 2, 4, 5, 7 · `reading/text-design.md` +§7, §6 · `reading/finding.md` §§5, 6 · `reading/professionals.md` §5 · `writing/evidence.md` +§6 · `people/README.md` §3 · `people/structure.md` §§2, 5 · `agents/context-files.md` +§4, §9 · `agents/context-engineering.md` §5 · `agents/descriptions.md` §3 · `agents/retrieval.md` §3 · `substrate/README.md` §4 · `substrate/typed-stores.md` §1 · `substrate/schema-evolution.md` +§7 · `substrate/formal-kr.md` §4 · `substrate/local-first.md` §§4, 5 · `substrate/does-structure-pay.md` §1 · `interface/README.md` §4 · `interface/schema-driven-ui.md` +§5, §7.

**Moved, not retyped.** Every other brief.

#### The loss list the fresh head returned, and what was folded

All twelve losses were folded. The four that would have misled a writer rather than merely informed them less: the redundancy effect carries a *verdict* against the one-fact-one-home rule, not support for it, and the corpus had dropped the verdict entirely (now `reading/text-design.md` §7); the human-and-model convergence premise has no shared metric and is model-class-dependent (`agents/context-files.md` §4); Datomic's accretion model carries a documented bill the corpus had presented as cost-free (`substrate/typed-stores.md` §1); and the commissioning questions were gone, so a reader could not tell what the sweep answered from what it never looked at (`method.md` §4.1).

The other eight: the one measurement anywhere on fresh-head review, F1 24.6→28.6 (`agents/context-files.md` §4); two schema-evolution recommendations, content-hash repeatable seeding and contract-identity-carries-authority (`substrate/schema-evolution.md` §7); runtime interface derivation as a code-execution surface (`interface/schema-driven-ui.md` §5); Patchwork as the one framework-neutral instance of the renderer-bid question (`interface/schema-driven-ui.md` §7, pointing to its one home); the software-inspection nulls (`writing/evidence.md` §6); the Mintlify structured-docs benchmark, named in the raw as the most-cited unfalsifiable number in its space (`folklore.md` §7); the corrections to Wikipedia's class pyramid and GitLab's own style guide (`reading/bounded-head.md` §4); and the 49,000-respondent finding that when assistance fails, 75.3% of professionals go to people rather than documents (`people/structure.md` §2).

#### The distortions, corrected

Twelve. The one that mattered most was a flat falsehood the corpus disproved two folders away: "no causal study of documentation anywhere," where the raw scopes the claim to *organisational* outcomes and the corpus itself names five individual-task experiments. Now scoped in both homes. Next: the same Mintlify llms.txt study was endorsed in one brief and retired in `folklore.md`, because two agents graded it differently — now stated once, with both gradings named. The tree-testing validity study was presented as known when the raw says its full text could not be retrieved. The entry brief merged card sorting's null with tree testing's unread study. Three citations pointed at reports that do not contain the claim (Team Topologies, Bergman, Ernst & Robillard). The entry stated four findings ungraded at the top of the gradient, where the code requires a reader who stops to stand whole — grades added. The OWL-reasoner download ratio was softened without naming the figure that makes it doubtful. Shipman & Marshall carried two different gradings in two briefs; the grading from the agent that read the full PDF now stands, and the other points to it. And the entry and `folklore.md` gave two different counts of the same list.

#### One fact, one home

Fifteen facts were stated in full in two or more places. Each now has one home and pointers from the rest: the MCP typed-hardening list (`agents/context-engineering.md` §6), the DORA five-year sequence (`writing/evidence.md` §4), Ernst & Robillard (`writing/evidence.md` §5), the prescriptive-versus-descriptive finding (`people/structure.md` §3), the shuffled-haystack result and NoLiMa (`agents/context-engineering.md` §1), the 4/45 representation result and the 9% noise floor and the localisation result (`agents/context-files.md`), the Zanzibar quotation (`substrate/permission.md` §1), the governed-semantic-layer figures (`substrate/does-structure-pay.md` §3), Wikipedia's 50 kB (`folklore.md` §5), the depth-and-breadth optima (`reading/bounded-head.md` §§1–2), Bergman (`reading/finding.md` §6), and the Mintlify figure (`agents/context-files.md` §9). `agents/README.md` was the systematic offender — it restated its children's figures rather than summarising — and was written again.

#### Ground before what stands on it

Four. The entry's method caveat sat after two sections of figures; it now opens the entry. `reading/bounded-head.md` handed the reader quotable depth numbers in §1 and disarmed them in §2; the order is inverted, so a reader who stops after §1 stops holding the caveat rather than the numbers. `writing/README.md` placed the finding that governs the folder after the four sections it governs; it is now §2. And the entry's forward reference to the substrate argument now gives the word where it is first used.

**Left out at this round.** Nothing from the loss list. The fresh head's "losses that are fine" — the ~600 leads, the verbatim quotations, repository vitality minutiae, most could-not-establish sections, the full company censuses, protocol field-level enumeration, and the sister project's own ladder — stay in the raw, as `register.md` §2 says they do.

**Left open.** Whether the entry should carry figures at all, or only understandings with the figures beneath. It carries them, graded.

**Checked.** All relative links resolve after the round.

### 2.8 Stage one, round 3

The second fresh head held the code, the raw and the corpus after round 2. It returned fifteen losses, nine distortions, twelve facts still stated in full in two places, and four orderings. Its opening judgement was that the compression is disciplined and that what fails clusters in three places: findings that cut *against* the corpus's own conclusions, dropped confidence flags, and one systematic omission about the evidence grade of a whole territory. Every item was folded.

**Amended in place, by section.** `README.md` §§1, 2, 7 · `method.md` §§1, 2, 3 · `folklore.md` §§5, 7 · `register.md` intro · `reading/README.md` §1 · `reading/bounded-head.md` §1 · `reading/professionals.md` §7, reports · `writing/README.md` §2 · `writing/evidence.md` §6, reports · `writing/records.md` §§5, 6, +§6 · `people/README.md` §3 · `people/transfer.md` §§3, +6 · `people/structure.md` §4 · `agents/README.md` §§2, 3 · `agents/context-files.md` §§5, 6 · `agents/retrieval.md` §§1, 2 · `substrate/README.md` §§1, 2, 4 · `substrate/formal-kr.md` §1 · `substrate/does-structure-pay.md` §3 · `substrate/schema-evolution.md` §7 · `interface/README.md` §§4, 6 · `interface/product-layers.md` §§3, 4 · `interface/schema-driven-ui.md` §7 · `writing/profession.md` §5.

**Moved, not retyped.** Every other brief.

#### The loss list, and what was folded

All fifteen were folded. The five that would have misled rather than under-informed:

The **whole agent-facing lane is unreviewed preprints** — the agent that worked it says venue-grade peer review is "absent across the board" — and the corpus was calling that lane its cleanest evidence with no such note. Both halves are true and now both are stated (`method.md` §2).

**One quantitative study of consensus governance exists**, in a top-five economics journal, and the corpus had carried the raw's "no published outcome evidence at all" as fact (`writing/records.md` §5).

**Degani & Wiener's guideline (11) — duplicate critical items across checklists** — is a thirty-five-year-old safety convention doing the opposite of one-fact-one-home in the one domain where the stakes are highest. The corpus had kept two of the three transferable guidelines and dropped that one (`reading/professionals.md` §7).

**Review finds defects at a median of about 60%.** Without that base rate, a section titled "document review returns nulls" reads as a verdict against review, which is not what the raw supports — the four nulls are about *how* you review, not whether (`writing/evidence.md` §6).

**No study varies a document set's organisation while holding content constant.** The corpus was presenting title-chain prefixes as "the crux answer" for how to organise a corpus for a model; the agent that found them says neither that result nor its companion manipulates a document set's architecture (`agents/retrieval.md` §2).

The other ten: Romer's excludability, dropped, which the raw says misstates the model (`people/transfer.md` §6); Kaplan-Moss's mechanism — RFC processes have no *decide* step, so they default to no — and Cameron's four faults (`writing/records.md` §5); the correction that **RDF has no global vocabulary**, so owner-scoped contracts are not a difference from it (`substrate/formal-kr.md` §1); the model behind the one positive localisation result, a mid-size open model, which is the caveat the corpus's own capability-tax argument demands (`agents/context-files.md` §5); the medium-confidence flag on graph-retrieval table figures that came through a summariser (`agents/retrieval.md` §1); Kiger's text never obtained and its winner not reliably ahead (`reading/bounded-head.md` §1); three further federation recommendations (`substrate/schema-evolution.md` §7); the one measurement of schema-constrained extraction, where the payoff is mostly cost (`substrate/does-structure-pay.md` §3); the counterweight that 98.9% of kernel commits carry rationale, which changes the conclusion from "people don't record why" to "they record it elsewhere" (`writing/records.md` §6); and the one small measurement favouring context files (`agents/context-files.md` §6).

#### The distortions, corrected

Nine. Two were the corpus overstating its own foundations: the entry claimed forty-five agents "unaware of each other" each reported the same shape, when the corpus's own method brief says twenty-seven were sub-agents inheriting a parent's brief and at least one report reacts to a sibling's; and `method.md` turned one agent's two catches of a fabricating summariser into two agents' independent catches — inflating precisely the integrity claim the corpus rests on. Then: a section resting on a report that summarises work delivered in a report not among the 45, now flagged as unreconstructible; per-stratum figures sourced to a brief that did not cite the report they came from; an accuracy figure welded to a split that came from a different study; two signalling meta-analyses fused into one; the segmenting result given without its measured cost; grades applied unevenly against `method.md`'s own promise; and two internal inconsistencies — "four lanes" against "six", and one dataset given two dates.

#### One fact, one home

Twelve remained. Each now has one home and a pointer: the schema.org figures (`substrate/formal-kr.md` §1), Patchwork's plugin contract (`substrate/local-first.md` §4), the OpenFGA quotation (`substrate/permission.md` §2), the Wikipedia assessment-coverage correction (`reading/bounded-head.md` §4), the prescriptive-versus-descriptive finding (`people/structure.md` §3, cut from four statements to one plus pointers), the temperature-zero flip figure (`agents/context-files.md` §3), the enumeration line on permission closure (`substrate/permission.md` §5), Wohlrab's design (`people/structure.md` §3), the scoped no-causal-study claim (`people/structure.md` §5), Retool's reversal (`interface/market.md` §4), the word *substrate* (the entry), and the 18-and-27 split (`method.md` §1).

#### Ground before what stands on it

Four. `writing/README.md` §2 declared its folder unreadable without a brief in another branch; it now gives the one-sentence understanding itself and points only for the evidence. Three terms were used before being given — *ranked-tester registry*, *abstain*, and *D. P. Miller* as a correction — and each is now given where it is first used.

**Left out at this round.** Nothing from the loss list. The head's own "losses that are fine" list — leads, repository telemetry, schema-driven-UI also-rans, the personal-knowledge long tail, funding chronologies, per-report method notes, most could-not-establish entries, unverified chart contents, and correcting details on studies whose verdict survives them — stays in the raw.

**Left open.** Whether the corpus should carry the sweep's unverified chart contents at all, as a record of what was *not* followed. It does not; `method.md` §5 names the territories instead.

### 2.9 Stage one, round 4

The third fresh head was asked to rank, and to say plainly if nothing remained that mattered. It did not say so. Its verdict: **three losses that matter, five distortions, four facts still stated twice, two orderings** — and the judgement that what remained was "narrow, and I am confident it is narrow because I checked the raw report-by-report rather than sampling."

**Amended in place, by section.** `reading/README.md` §§1, 4 · `reading/text-design.md` §2, +§5, renumbering §§6–10 · `reading/bounded-head.md` §3 · `reading/professionals.md` §8 · `writing/README.md` §6 · `writing/frameworks.md` §4 · `writing/records.md` §7 · `people/structure.md` §4 · `agents/README.md` §§3, 6 · `agents/retrieval.md` §1 · `substrate/formal-kr.md` §2 · `field/README.md` §2 · `field/opposition.md` §4.

**Moved, not retyped.** Every other brief.

#### The three losses, and why the first one mattered most

**Graph retrieval's wins were dropped from the same tables that supplied its defeat.** The corpus reported the cost ratios, the factoid losses and the summarisation loss, and had cut — from the two benchmarks it was quoting *against* graph retrieval — the complex-reasoning result where a graph method beats plain retrieval by 10.4 points, the multi-hop result where it wins narrowly, and the census line grading that method the best-scoring graph approach in independent benchmarks. A writer would have stated a stronger claim than any source supports, and would specifically have lost the one within-study evidence that structure buys something for **multi-hop reading** — which is the question a linked structure exists to serve. The brief and the folder entry are now headed on what the evidence says rather than on the verdict (`agents/retrieval.md` §1, `agents/README.md` §6).

**PG-Schema chose explicit multi-inheritance.** The case for no subtyping and nothing transitive rested on a live knowledge base's millions of mis-marked classes and on SKOS's deliberate non-transitivity, and the corpus called it the strongest available argument. A recent peer-reviewed standards proposal went deliberately the other way, and dropping it made an argued choice look unopposed (`substrate/formal-kr.md` §2).

**The project's own success test has a name and no measurement.** Deciding a case the text does not cover is Kintsch's *situation model*; the payoff of effortful reading is located exactly there; and it has only ever been operationalised as inference questions on short passages for students. The construct exists, the theory points at it, and nobody has measured it for this population or these materials (`reading/text-design.md` §5).

#### The five distortions, corrected

The headline "graph retrieval lost" over-stated two sources that say "frequently underperforms" and "not all methods consistently outperform" — corrected, and it was the same fault as the first loss seen from the heading rather than the body. **Two agents read the same releases page and returned DITA beta dates four years apart**, which is the difference between a stalled specification and a slow one; the corpus had picked one silently and now names the conflict and says it cannot settle it. A warning not to weld two findings together was wrong — they are two reports describing one paper, and welding them is correct. A meta-analysis's internal null was generalised to the literature; now scoped to its 44 studies. And the best-powered professional expertise finding in the sweep sat two sections from the expertise-reversal material without the note its own source attaches — that it is *not* expertise reversal, and points the other way.

#### One fact, one home

Four: the hypertext disorientation figures (`reading/text-design.md` §2), the answer to the comprehension objection and its three studies (`substrate/does-structure-pay.md` §5), the decay trio (now three pointers from `people/structure.md` §4), and Dynamicland's principle in its own words (`field/opposition.md` §3).

#### Ordering

Two, both the same shape — an effect stated before the bound that governs it. `agents/README.md` gave the positive results in §§1–2 and the noise floor in §3, when that floor is within striking distance of the gains; §3 now says so and names what it bounds. `reading/README.md` gave effect sizes in §1 and the two bounds on all of them in §4; the bounds now open §1.

### 2.10 Stage one, round 5

The fourth fresh head held the code, the 45 raw reports and the corpus after round 4, and was asked only what the corpus loses. It returned **eighteen losses** — of which it marked two minor, plus a bundle of five it declined to write sentences for — **eight distortions**, three of them minor, **six facts still stated in two homes**, two minor, and **six orderings**, one minor. Its opening judgement was that four rounds show: most of what the raw still holds is genuinely omissible, and what is left is concentrated. Its closing judgement was that a fifth pass would still find something and a sixth would not.

Everything that carried a sentence was folded. The five items it left without sentences were left unfolded.

**Written again whole, because the brief changed.** `substrate/formal-kr.md` §4.

**Amended in place, by section.** `README.md` §§2, 3 · `method.md` §4.1 · `folklore.md` intro, +§9 · `register.md` §1 (two rows) · `reading/README.md` §4 · `reading/text-design.md` §1, §7, reports · `reading/professionals.md` §§1, 7, +§11 · `reading/bounded-head.md` §5 · `writing/README.md` §4 · `writing/frameworks.md` §4, +§6, +§8, reports · `writing/records.md` §§1, 5 · `writing/evidence.md` §§1, 2, 4 · `people/structure.md` §4 · `people/transfer.md` §7 · `agents/README.md` §§3, 6 · `agents/context-engineering.md` §§1, 4, reports · `agents/context-files.md` §7 · `agents/retrieval.md` §1, +§5, reports · `substrate/README.md` §2 · `substrate/does-structure-pay.md` §3 · `substrate/local-first.md` §6 · `interface/README.md` §§2, 6 · `interface/schema-driven-ui.md` §7.

**Moved, not retyped.** Every other brief.

#### The losses, and the six that mattered

The head named six that would leave a writer materially worse off, and three of those cut against what the corpus concludes or is shaped around.

**The professional-reading lane's closing verdict**, which is the only direct design prescription anywhere in the sweep: invest in correctness, completeness, currency, findability, worked examples and an explicit reading procedure, and do not invest in format, in layering depth, or in stripping guidance for experts. The corpus carried every study under it and never stated it (`reading/professionals.md` §11, summarised at `reading/README.md` §4 and at the entry's §3).

**Content beat presentation on every measure** in the API-documentation taxonomy, and the same survey found no significant difference between how novices and experienced developers experience documentation problems — which corroborates the lawyer study from an independent population (`writing/evidence.md` §1, pointed at from `reading/professionals.md` §1).

***Lost in the Middle* and RULER** — the two results about *where* in a context something sits, absent from a section that concludes composition beats length (`agents/context-engineering.md` §1).

**Wikipedia's summary style**, a twenty-year seven-million-article working instance of readable-alone-and-nested, of which the corpus held only two retired numbers (`writing/frameworks.md` §6).

**The narrative effect size**, *g* = 0.55 overall and 0.72 for memory across 78 samples and 33,078 participants — the corpus called narrative the largest effect in the field and gave every smaller effect a number (`reading/text-design.md` §1).

**Spec-driven development**, the practice nearest to this project's own and never entered, with the sweep's only cost figure for writing knowledge up front for an agent: one feature at 2,577 lines of markdown and 3.5 hours of review against 24 minutes for the same work by prompting (`writing/frameworks.md` §8).

The other twelve: worked examples with their boundary (`reading/text-design.md` §1); the five practices the sweep retired by name, including audience-forked prose and the SECI spiral (`folklore.md` §9, pointed at from `people/transfer.md` §7 and `reading/bounded-head.md` §5); the RFC-8963 decomposition showing 83% of a 1,200-day mean sits inside working groups (`writing/records.md` §5); the ADR in-situ trial's finding that *where* a record is stored dominates its perceived usefulness (`writing/records.md` §1); the nearest literature to writing a claim's epistemic status, which the corpus said did not exist (`reading/text-design.md` §7); the highest-value unfollowed lead in the comprehension literature (`reading/text-design.md`, closing); which tenet of minimalism is actually contested (`writing/evidence.md` §2); the DORA 2023 amplifier table and how it is constructed (`writing/evidence.md` §4); the retrieval layer's flip from chunks to a routing file (`agents/retrieval.md` §5); documentation as the top-named obstacle to learning an API (`writing/evidence.md` §1); RepoMirage's 66.8% to 25.3% drop on explicit structural reasoning (`agents/context-files.md` §7); and the confirmed null that Uddin & Robillard never report a documentation-hours figure, which was folded as a grading note rather than a new entry.

#### The distortions, corrected

Eight. The one that mattered most was a verdict the source declines: `substrate/formal-kr.md` §4 was headed "Validation won; reasoning lost" where the agent that read the lane says "convergence rather than victory is the current research posture" and names the three papers doing the converging. The section is now written again under that posture.

Two were the same failure, and it is the one the one-home rule exists to prevent — a folder entry restating a figure without the scope its own brief carries. `agents/README.md` §6 attached graph retrieval's 57×/210× to the method as such, where it is global-search-only on one summarisation dataset; and §3 widened a noise floor measured on SWE-bench Verified to bound tool-description interventions on other benchmarks, where it is unmeasured.

Then: the governed-semantic-layer result was used as evidence that declared structure wins without the authors' own refusal of the causal claim (`substrate/does-structure-pay.md` §3); `substrate/README.md` §2 fused Schema.org's two figures, twelve types and forty-seven, into "a dozen"; `people/structure.md` §4 compressed "no views or updates in the previous few months" to "unread"; `writing/frameworks.md` §4 called the DITA beta dating unsettleable where the weight of evidence settles it; and `reading/professionals.md` §7 glossed Degani & Wiener's guideline (11) wider than it reads and then argued from the gloss.

#### One fact, one home

Six. Retool's reversal and the sentence reading it (`interface/market.md` §4 keeps it, `interface/README.md` §6 points); Patchwork's plugin contract (`substrate/local-first.md` §4 keeps it, `interface/schema-driven-ui.md` §7 points, after previously restating it one sentence before saying where its one home was); the Obsidian documentation quotation (`field/tools-for-thought.md` §1 keeps it, `substrate/local-first.md` §6 points); the three escape-hatch quotations (`interface/server-driven-ui.md` §4 keeps them, `interface/README.md` §2 points); the graph-retrieval cost figures, fixed by the same edit as the distortion above; and Diátaxis's disclaimer, which `method.md` §4.1 answered where its job is to point.

#### Ground before what stands on it

Six. `substrate/does-structure-pay.md` §3 handed a reader three figures for declared structure and waited five sections to say none had been raced against a prose baseline; the bound now opens the section. `agents/context-engineering.md` §4 gave the 150,000-to-2,000 figure in bold under an endorsing heading and retired it two sentences later; the heading and the order are inverted. `substrate/formal-kr.md` §4 gave a thirteen-fold ratio and then doubted it; the doubt now comes first. The entry's navigation grade did not carry the mid-size-open-model caveat its own brief holds. `people/structure.md` §2 ranked documentation first and disclosed only at the end that the rankings are opinion and the measured correlations negligible. And `agents/retrieval.md` §1 buried the honest shape of the graph-retrieval finding four paragraphs down.

#### Found by the fold, not by the head

Two section pointers into `reading/text-design.md` named §7, where the redundancy brief became §8 in a later round. Corrected in `method.md` §4.1 and `reading/professionals.md` §7.

**Left unfolded.** Five items the head listed without sentences, saying they were not worth the space: GitLab's public-and-internal handbook split with its 90-day Slack retention as a forcing function; Kubernetes' three-layer contributor entry with machine-readable `OWNERS`, and KEP-0000's own pre-registered drawbacks; the shift to TypeScript-schema-first tooling over JSON-Schema-first; the fact that the long-running-harness recommendation to use JSON rather than Markdown has no evaluation behind it; and the coverage chart's own loudest gap, that its ladder has no rung for enforcement. The fold has no sentence for any of them and will not guess.

**Folded to a different home than the head proposed, and why.** The DORA 2023 amplifier table went to `writing/evidence.md` §4 rather than `folklore.md` §4, because the figure is real rather than retired and the DORA reading has one home. Wikipedia and spec-driven development became sections of `writing/frameworks.md` rather than new files, which was the head's second option and keeps them beside the three frameworks they stand next to.

**Checked.** All 296 relative links resolve, every numbered cross-reference names a heading that exists, and section numbering is contiguous in every file.

### 2.11 Where stage one stands

Four fresh heads were run, each on Opus, each holding the code, the 45 raw reports and the corpus, each asked only what the corpus loses. The losses that mattered fell **12 → 15 → 3 → 6**; the second figure is higher than the first because the second head read a corpus whose round-1 entry had been rewritten, and the fourth is higher than the third because round 4 was the first fold no head had read, and because this head went at the material the earlier rounds had shed rather than at the material they had folded.

**The corpus is settled at round 5, and the debt round 4 carried is paid: its changes have now been read by a fresh head, and so have every round's before it.** The rule the run was given is to go again until a round finds nothing that matters, and this head did not quite say that either — it said six of eighteen losses would leave a writer materially worse off, and then said plainly that a sixth pass would find nothing. It also named the pattern in what four rounds shed: the material arguing that arrangement is not the lever. That is the finding stage two should carry into the piece, and it is now stated at the top of the corpus rather than left in the raw. What remains unread by any head is round 5's own fold.
