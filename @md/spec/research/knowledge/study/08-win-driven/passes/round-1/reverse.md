# Reverse prompting pass: `08-win-driven/ontology.md`

Clean room. Only the one file was read. Line numbers refer to it.

## 1. The question

**The one question this document is the best possible answer to:**

What are the words, and the dependencies among them, from which both the knowledge practice ("the code") and the platform ("the technical arc") could be rebuilt, ordered so that the most is stood on comes first?

**Five questions it is only a partial answer to:**

1. *How big is a win?* The document says "Its size is never how much was said" (l.53) and that "centrality is measured, not felt" (l.217), but the only measure it gives is trail length, which counts links, not comprehension. Missing: any procedure, even informal, for comparing two wins, without which "The order is centrality, the win each word gives" (l.5) is the author's taste presented as a metric.

2. *What is the platform's layering?* Kernel, substrate, processor, engine and program are placed relative to each other (kernel "Sits below the interface", substrate and processor "Both sit below the kernel"), but nothing says what the kernel's contract contains, what a chunk is beyond "Whole in itself, placed in others" (l.453), or how "one attaching another's store on declared terms" (l.433) works. Missing: the contents of the contracts the layering rests on.

3. *How is a prism cut?* "A selection, never the whole, and recomputed as the work moves" (l.389). Missing: by whom, from what signal, and what "the band the work at hand needs" (l.393) is determined by. The document names the result and not the operation.

4. *What is nesting?* Link says nesting is "one of two ways briefs join" (l.159); Gradient says it is "the one relation nesting carries" (l.207); Space says "Nesting is one dimension among them" (l.285); Holon says nesting "supplies the everyday form" of an address (l.237). Missing: one statement of whether nesting is a join, a relation, a dimension or an addressing scheme, and whether "a part has one whole" (l.161) survives "every holon is placed in some [dimensions]" (l.285).

5. *What is time?* Knower says time is "not as a thing of its own, but as the order acts stand in. If the code ever needs time apart from any act, this was wrong" (l.37). Commit's "address is its place in time" (l.329); Consolidation needs "one addressable state of the field" (l.97); Boundary "Is set before a run" (l.319). Missing: whether a state of the field is an act, and if not, whether the document has already needed the time it forbids.

## 2. The prompt

> Write a file called `ontology.md` for a project that has two halves: a writing practice it calls "the code", whose one value is comprehension, and a platform it calls "the technical arc" (a kernel, a substrate, engines, programs). The file is the current set of words both halves are built from. It is a merge of three sources: an author's §4 of an edition, a steward's recut of it around six kinds, and the steward's draft of five fundamentals. The author rules; the steward drafts; sessions (model runs) contribute. Date every ruling 2026-09-05.
>
> **Form.** Title `# Ontology`. Then two italic paragraphs, no heading. The first states the document's rule: every change is committed and the commit is the ratification; nothing is settled by talk. The second states what the file is, how it is built, the merge and its sources, which words were ruled by the author and when, what is left out on purpose (file, folder, heading, bullet; types and schemas), and ends `Strength: **reasoned**; observed where a relation says so; no cold read.` Link to `evidence-series.md` as the same web cut as a line.
>
> Then one `##` per word, in this order: Comprehension, Knower, Win, Amplify, Consolidation, Brief, Ground, Link, Trail, Gradient, Holon, Word, Medium, Space, Field, Boundary, Commit, Comment, Citizen, Prism, Interface, Kernel, Substrate, Processor, Contract, Program, Engine, Specification, Harness. The order is centrality: the win each word gives. Knowledge words (Comprehension through Prism) must name no technology; arc words (Interface down) are the author's direction and may disagree with the existing spec tree, and where they do, say so.
>
> Each word opens with one or two sentences: its essence, then its role ("The unit of value", "The unit of writing", "Git's word, and kept as git's"). Under it, one `###` per relation. The heading is a prose fragment that completes the word as subject ("Lives in a knower, and nowhere else", "Is stood on by briefs"), and the word it reaches is a markdown link to that word's anchor in the same file. Under each heading, one short paragraph, two to four sentences. Every relation has one home: it lives under the word that depends, never under both. Nothing is said twice.
>
> Words whose name is not settled end with a relation headed "Is named for now, not settled", giving where the name came from, how old it is, what other words were tried, and the instruction to rest on the notion. Words the author entered by name say so ("Is the author's word, 2026-09-05"). Words that are sketches say so and link to `sketches.md`. One word (Harness) is retired and kept so its absence is named.
>
> Number two laws: the first is that the gradient runs one way; the second is that ground must stay true for readers not yet met. Split ground by direction of fit, citing `[Searle 1979]` in brackets. Use everyday English and the plainest exact word; no bullets, no bold except the strength line, no code, no tables, no jargon a person could not look up. Short declarative sentences. Aphorisms are allowed once per entry ("We do not bound, we expand", "Talk settles nothing; the trail does").
>
> Every word must be reached by at least one link from another word; the arc words must each reach at least one knowledge word (kernel to prism, program to trail, contract to brief, engine to citizen). Operating-system, Unix and web analogies are allowed in the arc words only.

## 3. The central claim

**Claim, one sentence:** Comprehension exists only inside a bounded knower, so all knowledge is writing that lets it form again in another knower, and everything from brief and link down to kernel and substrate is built to amplify that transfer, measured in wins.

**Weakest link:** the word *measures* in Win, "Measures comprehension gained against reading spent" (l.51), restated in Amplify as "Understanding out against reading in is a gain ratio" (l.69). It is a ratio of two quantities neither of which has a unit anywhere in the document. On this word rests the order of the document itself ("The order is centrality, the win each word gives", l.5), the slope of the gradient ("The slope is the inequality of wins", l.201), and the test of knowledge ("A piece that gives no win is not knowledge yet", l.61). Gradient offers a proxy, "How many stand on a brief is the length of its trail" (l.217), but that measures reach, not gain: a brief many stand on may be the smallest win most widely needed. The document's own strength line concedes the point: "reasoned ... no cold read", and no relation anywhere says "observed".

## 4. Ten questions a skeptic asks

Ordered by how much the claim depends on the answer.

1. **What is the unit of a win?** "Its size is never how much was said" (l.53) says what it is not. If two writers disagree about which of two briefs gives the larger win, what settles it other than the author? Until this is answered, the ordering of this file is unfalsifiable and "measured, not felt" (l.217) is a slogan.

2. **Is a page's knowledge a property of the page or of the reader?** "Information is what is on the page; comprehension is what the page lets form" (l.17) and "A piece that gives no win is not knowledge yet" (l.61). A win is "measured at one reader" (l.69). So the same page is knowledge for one knower and material for another, and "one home per fact" has no fixed subject.

3. **Is the medium typed or not?** Medium: "Is made of briefs and links, nothing typed ... No schemas, no edge types" (l.263-265). Field: "Is the medium given addresses and types" (l.299). Contract: "For the classical program, the contract is types" (l.485). Substrate: "types and boundaries, typed against itself" (l.441). Which is it, and at which layer does "nothing typed" stop being true?

4. **What is nesting?** A join (l.159), the one relation a document line can show (l.207-209), a dimension among many (l.285), the everyday form of an address (l.237). If a holon "is placed in some [dimensions]" (l.285), it has several wholes; then "a part has one whole" (l.161) is false and "only one can be the brief above it" (l.209) is a convention of prose, not a law.

5. **Has the document already needed time apart from any act?** "If the code ever needs time apart from any act, this was wrong" (l.37). Consolidation requires "one addressable state of the field" (l.97) to reproduce an inference. A state is not an act; it is the field between acts. Either the state is derivable from the act order (say so) or the Knower entry is already wrong by its own test.

6. **What does "deterministic" mean for a model?** "can be made again from the same point and asked to give the same answer" (l.97). A model sampled at nonzero temperature gives different answers from an identical context. Does the claim mean *reproducible input*, which is trivial, or *same output*, which is false?

7. **What runs before the kernel reads its own contract?** "Governs itself, because its law is data it rests on" (l.419-421); "The contracts that govern the field are chunks in the same field, so the law is data" (l.449). Something must interpret the chunk format before the chunk holding the format is readable. Where is that bootstrap, and is it not exactly a law the kernel does not rest on?

8. **Matched on what?** "A call is matched, never parsed" (l.501). A program's contract "is types" (l.485); a model's "is prose" (l.485). How does a program match a model's prose contract, or a model a program's types, without the "custom glue" (l.473) the entry forbids? Who writes the translation and where does it live?

9. **What is identity across a move?** "a holon that moves keeps its identity while its path changes" (l.237), but "In prose the address is a heading, a file, or both" (l.237) and "markdown in directories is enough, tracked in version control" (l.265). A markdown link is a path. Which thing survives the move, and what in markdown plus git supplies it?

10. **What has been observed?** "observed where a relation says so" (l.5). No relation says so. The one event reported is a loss: "can be lost by the next purification, which happened once on the first night" (l.333). Interface: "Nobody has had the experience yet; it has to be built to be felt" (l.413). Harness: "Still appears in the code, meaning today's sessions" (l.571). So every session that produced this file ran under the thing the file retires. On what evidence is the retirement made?

## 5. The missing words

1. **Act** — Knower "Acts in two ways" (l.35); time is "the order acts stand in" (l.37); the kernel is "the one thing every act goes through" (l.427); a boundary is "A rule on acts" (l.309); "every act is judged under one rule" (l.321). The document's model of time, permission and the kernel is built on a word that has no entry.

2. **Address** — "has an address" (l.85, l.235, l.269, l.301, l.329); Space is "The addresses" (l.281) but treats address as given. What an address is, whether it is a path or something a path merely spells, is the unanswered half of question 9.

3. **Fact** — "one home per fact" (l.81, l.93, l.141), three times, load-bearing for the second law. Nothing says when two briefs state one fact, so "one home" cannot be checked.

4. **Session** — "a model in a session" (l.25), "many sessions" (l.89), "debrief this session" (l.121), "the record each session leaves" (l.273), "A session commits its ideas" (l.3), "today's sessions" (l.573). It is the actual lifetime of a model-knower and the thing Harness is being retired in favour of, and it is undefined.

5. **Nesting** — "the other is nesting" (l.159), "The two names are the steward's and unsettled; the count is not" (l.161). Every entry that touches structure reaches for it under a different description (join, relation, dimension, path). The document knows this: it says the names are unsettled and then does not give the notion an entry to rest on.

## 6. The words it could lose

1. **Word** — derivable from Holon ("Is the smallest holon", l.247) plus Link ("Is a link when it is precise", l.251). Lost: the code's rule change from "the plainest word" to "the word whose meaning is exact, and the plainest such word" (l.253), which is a writing rule and belongs in the code, not the ontology.

2. **Consolidation** — "one home per fact" is already Ground's duty (l.141); "one addressable state" is already Field's "point" (l.303-305); "debriefing ... at the scale of the medium" is Brief's second relation at scale (l.113). Lost: the author's dated pairing (l.101) and the sentence "resonance is the knower's" (l.97), which is the one place amplification is given two sides.

3. **Processor** — two relations, nothing links to it except Substrate's "beside the processor" (l.455). Foldable into Substrate as "two kinds of circuitry with no ground beneath" (l.465), which is already its own sentence. Lost: the floor, "nothing below it computes" (l.461), and the clean statement "The win begins one layer up" (l.469).

4. **Specification** — "A brief for what is to be built" (l.529) is a kind of brief, as Contract is ("Is a brief of a kind", l.475), and could be a relation under Brief. Lost: the merge claim, "the two merge where both are briefs under one gradient" (l.537), and the one-pass rebuild test (l.529), which is the only operational test of a brief's completeness in the file.

5. **Harness** — retired by its own first line (l.545) and kept "so its absence is named" (l.565). Its content is negations of Medium, Trail, Ground, Citizen and Amplify. Lost: the only place the document says what the code is against, and the note that "Where the code says harness it means the sessions that exist" (l.573), which a reader of the code needs and which would have to move to the code.

## 7. What a hostile reader would say

This is a vocabulary. It has twenty-nine glossed words with cross-references, and it has no fixed set of relations: each `###` is a fresh English sentence, so there are roughly ninety relation kinds for twenty-nine terms and none is reused. "Feeds on", "Resonates through", "Grades", "Fixes the bottom under" are not relations, they are prose. An ontology commits to which things exist, what makes two of them the same, and which few relations hold necessarily. Here identity conditions are absent for brief, fact and holon; the "six kinds" of the steward's recut were dropped in the merge; the one structural relation, nesting, is described four ways and given no entry; and the rule "nothing is said twice" is broken at once, since Comprehension "Lives in a knower" and Knower "Is where comprehension lives" are one relation under two homes. To become an ontology: name the relation kinds (within, upon, is-a, is-shown-by), tag every heading with one, state identity for brief and fact, and mark each word as kind or instance.
