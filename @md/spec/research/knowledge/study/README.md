# The study

The study is the search for how knowledge is best structured — for people and AI alike — run as a series of labs on one shared corpus: a bounded set of research reports from an August web sweep. Reading this file gives you where the search stands, what it waits on, and how the next lab runs. The law itself is not here: it lives in the code, whose latest edition is [`07-breakdown/code.md`](07-breakdown/code.md) — each lab ships its own edition, and the ratified ancestor stands at [`../code.md`](../code.md) (2026-08-30). A claim matures in the labs, enters an edition, and its row retires from this file; git keeps everything that leaves.

## 1. The finish line

The search ends when the proof is lived, not argued. Three marks:

1. **The successor of the conventions' knowledge section** — landed: the code, ratified 2026-08-30, alive since through the labs' editions.

2. **The spec tree rewritten under the code** — comprehensible, engaging, and still law-grade.

3. **The proof is the experience**: a senior reader finishes with no unanswerable questions, a fresh session bootstraps and can be trusted, and the author reads without fatigue.

## 2. What the study ships

Three artifacts come out of this search, and it is not finished until all three stand. **The code** is the law. **The markdown practice** is the code worked in files and folders. **The grounds** are the receipts: for every rule the code carries, where it came from and what it rests on. Only the code exists; the other two stand as empty links in the code's closing section, and both are written after the labs settle.

The grounds are the one that cannot wait. The code and the practice can be composed at the end from what the labs settled, but provenance is only available while the work is happening. So the grounds accumulate now, lab by lab, or they are not written at all.

### 2.1 What an entry in the grounds owes

Every rule in the code gets one entry, and the entry answers four questions in this order: what the rule says, where it came from, what it rests on, and how strongly.

The fourth is the one that gets skipped, so it has a fixed vocabulary. **Measured** — a lab or a study produced numbers, and the numbers are in the entry. **Observed** — seen repeatedly in the work, never measured. **Reasoned** — argued from the laws, not yet tested against a reader. **Taste** — held because the author prefers it, and said so plainly. A rule carrying no mark is not settled; it is unexamined.

This is law 2 turned on the code itself. A reader a year from now must be able to ask of any rule — is this proven, is it settled, or is it a preference nobody has challenged — and get the answer from the writing rather than from a feeling. A rule that cannot answer is a rule that will be obeyed for the wrong reason.

### 2.2 The duty is per session

Every session that produces, changes or tests a rule writes its evidence before it ends: in the lab the work belongs to, in a file named for the rule it grounds. [`evidence-unit-of-change.md`](07-breakdown/evidence-unit-of-change.md) and [`evidence-breakdown.md`](07-breakdown/evidence-breakdown.md) are the pattern — one rule each, the numbers in the file, and a closing section on what the evidence does *not* reach.

Provenance recovered late survives only by luck, and the loss is invisible: the rule still stands in the code, now unfalsifiable. That is the failure this section exists to prevent.

**The arrears are real.** Labs 01 to 06 produced the findings the current principles rest on, and none of it was written as grounds — it lives scattered in session narratives, in this file's verdict lines, and inside the outputs themselves. Walking that record and turning it into entries is a cheap pass for a session pointed at this section, and it has to happen before the three artifacts can be generated.

## 3. Where the search stands

Seven labs run, and the reading queue is the bottleneck: the author's cold reads of labs 03–07 are owed, and most open claims wait on them.

- **Labs 01–02 are the baseline pair.** The same corpus cut categorically ([`findings/`](01-categorical/output/README.md)) and as a narrative walk ([`encounters.md`](02-encounters/output.md)). The first informed but did not engage; the second engaged. Every later reading is judged against these two.

- **Labs 03–05 tested structure without narrative.** Importance-first alone (03), nesting added (04), the full spine rules (05). The one verdict so far, partial, on 04: writing from the raw alone caps the depth a writer can give — see *incomplete grounds* below.

- **Lab 06 changed the delivery.** The prompt went bare, and a full edition of the code — grown with principles, the unit renamed brief — became the writer's primary instruction. The output, [`The ground others hold`](06-principles/output.md) (~5,200 words), is the leanest reading yet.

- **Lab 07 tested the breakdown**, and the structure paid. The team's read of 06 found one shape recurring: a slim surface followed by bold-led bullets, the only place bullets appear at all, at every heading level. That shape is a brief whose nested briefs never got their headings, so every win arrives at one depth in one serving. The lab reworked the 06 output one level deeper with the content held fixed, and [the result](07-breakdown/output.md) reads 46% shorter at the level a reader stops while holding more — the full measurement, and the four things it does not reach, are in [`evidence-breakdown.md`](07-breakdown/evidence-breakdown.md). The instruction lived in [its prompt](07-breakdown/prompt.md), not in the edition, because a rule a lab may reject must not enter the law first. Awaiting the author's cold read; whether it becomes a principle is the open question.

After the labs come the two unwritten artifacts of [§2](#2-what-the-study-ships) — the markdown practice first, since the labs' recurring choices are what it harvests, then the grounds — and then mark 2: the spec tree itself.

## 4. How a lab runs

A lab is one directory beside this file, `<nn>-<name>/`, and since lab 06 it ships three things:

- **Its code edition** (`code.md`) — the full law the writer follows, extended as if the lab's claims were always its own. The code carries everything; the prompt carries nothing but mechanics. The exception is a lab that *tests* a candidate rule rather than adopting one: there the candidate stays in the prompt, so a rule the lab may reject never enters the law (lab 07).

- **Its prompt** (`prompt.md`) — bootstrap, the author's request, constraints. Both files are written before the run, so together they are the method record by construction.

- **The output** — the writer's piece.

Three rules keep a lab honest:

- **Ratify before launch.** The author reads the edition and the prompt whole; the run starts on their word.

- **The writer runs pure.** A fresh session reads the prompt and only what it names — never this notebook, which holds the verdicts a clean arm must not see.

- **The author reads cold**, against the baseline pair, and the verdict lands here.

## 5. The queue

What the search believes lives in the latest edition, nowhere else. What it waits on lives here:

- **The cold reads of 03–06** — the deciding evidence for the editions' engagement and language principles. Each verdict lands as a refinement in the next edition, with its evidence recorded beside it, as [07's first](07-breakdown/evidence-unit-of-change.md) was.

- **Labs to cut**: the research-allowed A/B — does lifting the raw-alone wall restore the depth the 04 verdict found missing ([issue #1](https://github.com/Cwejman/OpenLight/issues/1)); the relaxation of the order law's recursion, a later study; and, should structure alone fall flat in the reads, the combined arm — structure plus narrative.

- **Team opens** ([issue #1](https://github.com/Cwejman/OpenLight/issues/1) — Eric, Emelie, Sanna): what the second level of a document is; whether an intro carries a short guide to how the text is read; how running-text source references are handled; expand/collapse folding — blocked for now, since GitHub does not guarantee an anchor reaches into a collapsed section.

## 6. Method findings that hold

Settled by repetition; they feed the markdown practice and the grounds:

- **A fresh head finds what the writer cannot.** The writer's closure is invisible from inside — three times evidenced. The cold read is part of shipping, not an aspiration.

- **The compression of a brief sets the writer's freedom.** A tightly compressed inventory *is* prose; blind writers reproduce its sentences (the blind-variant experiment, 2026-08-23).

- **A bootstrapped session becomes what it reads.** What its ground does not carry does not reach the work.

- **Record the method at the moment of the work.** Three times now the evidence for a rule existed only in a session that was about to end. This is the finding that [§2.2](#22-the-duty-is-per-session) makes a standing duty.

## 7. Notes

- **The unit is named brief in the lab editions** (2026-09-01). The handing register won — to brief, to debrief — and brevity became the unit's duty rather than its flaw. Project-wide graduation (the ratified [`../code.md`](../code.md), [`naming.md`](../naming.md)) rides the study's maturation; those files still say fold.

- **The corpus** is the August sweep ([`sweep-2026-08/`](../../sweep-2026-08/)) — bounded, free of engineering load, holding the baseline pair. Its artifacts still await the author's read; [`landscape.md`](../../landscape.md) is kept as ore, to be re-read critically rather than trusted.

- **The sister ground** is hjulverkstan (`~/git/hjulverkstan/wiki/drafts/` — the ladder, the study, the chart). The two searches cross-pollinate; neither is the other's authority.
