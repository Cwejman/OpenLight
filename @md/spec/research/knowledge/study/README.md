# Study

*Working state of the knowledge search, research register. Opened 2026-08-30, when the code was ratified and its workshop moved here. The law is [`code.md`](../code.md); this file is the lab notebook beside it — what we are testing, what we believe and how strongly, and what evidence stands behind each claim. The house rule: a claim matures here before it enters the code; when one graduates, it folds into `code.md` and its row retires from this file — git keeps it.*

## The finish line

The search exists to crack how knowledge is best structured — for people and AI alike — and to prove it on this project's own tree. Three marks, carried from the arc's opening:

1. The successor of the conventions' knowledge section — **landed**: the code, ratified 2026-08-30.

2. The spec tree rewritten under the code and its first proof — comprehensible, engaging, and still law-grade.

3. The proof is the experience: a senior reader finishes with no unanswerable questions, a fresh session bootstraps and can be trusted, and the author reads without fatigue.

## Focus now

The spec/ rewrite is the finish line, not the next step — it is a big undertaking, dense with engineering, and a poor first test bed. The claims below are tried on easier ground first, and **the sweep is the labs' corpus** (author, 2026-08-30): it is bounded, carries no engineering load, and already holds our one baseline pair — [`findings/`](01-categorical/output/README.md) and [`encounters.md`](02-encounters/output.md) — to judge new readings against. And since the author wants to be brought into contact with what the sweep found, every lab produces a wanted reading; no experiment is throwaway.

The order:

1. **Labs on the sweep** — each lab a new reading of the corpus under one candidate claim, read cold and judged by the author. The engagement row's discriminating test is the first lab; simple language rides every lab as the adopted rule.

2. **The first proof** — the markdown-directory piece the code's empty link points at: how a link is written, how confidence is marked, how files and folders are shaped, how a structure is stewarded day to day. **Deliberately unwritten for now** (author, 2026-08-30): each lab works by common sense under the code, and its free choices are part of what the lab observes — pinning them upfront would collapse the variance the labs exist to generate. It gets written as a harvest of what kept recurring; a single piece earns an earlier pin only on repeated friction, when labs re-decide the same thing and their readings stop being comparable.

3. **The spec/ rewrite** — every file re-shaped under code + proof; this absorbs the register pass. Entered when the claims have matured on the easier ground.

Deliberately later (author, 2026-08-30, to keep effort on the labs): the evidence-grounding pass over the code itself — walking each of its rules against [`findings/`](01-categorical/output/README.md) and citing grounds in place.

## How a lab runs

Each lab is one directory beside this file: `<nn>-<name>/`. Inside it:

- **`prompt.md`** — the full instruction, written before the run: which files the writer reads (the code, the corpus), and the arm under test stated as plain instructions — the writer's extended code for this one run. The prompt file *is* the method record, by construction; nothing is recovered from transcripts later.

- **The output** — `output.md`, or an `output/` directory when the reading is more than one file.

Two rules hold the labs honest:

- **The writer runs pure.** A writer session reads the prompt and only what the prompt names — never this ledger, which holds the verdicts a clean arm must not see (why [`encounters.md`](02-encounters/output.md) was purity-bootstrapped).

- **The prompt length is the gauge.** While a claim is under test it rides the prompt; when it matures it moves into the code and leaves the prompts forever. If a prompt ever needs more than a few lines beyond its arm, the overflow is missing content that belongs in the code — or, later, in the first proof.

The author reads the output cold, judges it against the baselines, and the verdict lands as evidence in the claim rows below; the lab directory stays as the full record.

## Claims under test

### Simple language — adopted, observing (2026-08-30)

The claim: knowledge prose is written in plain, folk, international English — simple words, everyday sentences, and the full explanation still given. Simple is not terse: cutting explanation helps nobody; cutting fancy words costs nothing.

Why we believe it: fancy language can dress a broken structure so that it still reads well; simple words have nothing to lean on except the structure of what is being said, so they force the content itself to be good. And the claim is audience-agnostic — a skilled reader loses nothing when the words are plain.

Evidence so far:

- The code's own rebuild (2026-08-28): the author demanded folk English, and the result held through the ratification read.

- [`encounters.md`](02-encounters/output.md) was written without this rule — the writing session's ground did not carry it — and the author found the value missing (2026-08-30).

- From the sweep ([`reading.md`](01-categorical/output/reading.md)): complexity taxes experts as much as laypeople (the lawyers study found no expertise × register interaction), and skilled readers do better with high-cohesion text, not worse. Nothing there licenses plainly-worded gaps — which is why simple is not terse.

- First outside readers under the rule ([issue #1](https://github.com/Cwejman/OpenLight/issues/1), 2026-08-31 — three team readers on the 04 output): "the headers have comprehendable language." Narrow but real — headers only; the body's verdict rides the full reads.

Matures when: the first proof and the first spec rewrites are written under it, the author's reading confirms, and no real downside has shown. Then it enters the code.

### Engagement — open, candidates named

The question: what makes material pull the reader onward, rather than merely inform? The current lead (author, 2026-08-30): engagement is, at its core, the importance-first law — what matters most sits highest in the hierarchy and most central in the web. The evidence cannot yet single that out.

The candidates:

- **Importance-first.** Supported as placement — relations at the top of a text's structure govern what is comprehended (Meyer's levels effect) — but the prequestion data says a stated why *steers attention* rather than lifting the rest. So likely necessary, not yet shown sufficient.

- **Narrative over statements.** The largest, most robust effect in the reading literature (>33,000 participants; [`reading.md`](01-categorical/output/reading.md)).

- **Concrete before abstract.** Openings that are a felt case beat openings that are a higher abstraction.

Our own experiment, honestly read: same corpus, two cuts. [`findings/`](01-categorical/output/README.md) — categorical, why-first within each fold, no global importance ordering, no narrative — failed the author's engagement read ("folded categorically; there isn't meaning"). [`encounters.md`](02-encounters/output.md) — a narrative walk ending on the two things that matter most — engaged. But the two differ on several variables at once (the cut, the narrative, the writer's ground), so no candidate is isolated. The same pair made the audience question concrete: one corpus, two outcomes, and the cut that serves one flattens the other — how structures branch by outcome rides on this open.

The discriminating test — the first lab, [`03-importance-first/`](03-importance-first/prompt.md): the same corpus again, the same outcome request as encounters, importance-first without narrative as the arm — read cold against both baselines. The "no story" rule is not a belief that stories are worse; it is the isolation of the variable, and the prompt deliberately does not explain this to the writer — a writer told its arm is the underdog writes a hedged piece. Either outcome informs: if the piece engages, importance-first is sufficient on its own; if it falls flat at full strength, the narrative effect is doing work structure alone cannot replace, and the next lab tests the two combined. Prompt ratified and run launched 2026-08-30 — a fresh background writer, given the prompt body verbatim plus one line resolving its relative paths; output landed the same day (`output.md`, ~40 KB), awaiting the author's cold read.

First partial verdict on 04 ([issue #1](https://github.com/Cwejman/OpenLight/issues/1), author, 2026-08-31): the output "has a hard time to be engaging and comprehensible because the knowledge is shallow and points to links not yet fully understood" — the write-from-raw-alone constraint capped the depth the writer could give, so **incomplete grounds** enters the matrix as its own variable: the same lab with research allowed, A/B against the raw-alone run.

Lab 05 — [`05-spine/`](05-spine/prompt.md), cut 2026-08-31, one study rather than parallel arms (author): the 04 prompt with the fold rule grown into the full spine rules (folds all the way down, the order law recursive), bullets as folds without an address, and *only what you know* — concise to the raw, with links standing as folds not written. Still raw-alone; the research-allowed A/B stays a later lab. Spine findings ride the prompt for now and graduate to code.md when the author calls it. Ratified after author rounds and run 2026-08-31; the output (`output.md`, ~54 KB) landed the same day — six top folds, nineteen sub-folds, ~83 bold-surface bullets, ~60 doors — awaiting the cold reads.

Matures when: a candidate survives a discriminating test and holds across repeated reading experience.

## Observations toward the first proof

What the labs' free choices show about the shape in practice. These harvest into the first proof; none is a rule yet.

- **Flat is the default topology** (lab 03, 2026-08-31, observed by the author before reading the prose): seven sections, no subheading anywhere — each section one fold, details in-line rather than nested. The code says a fold can be a section inside a file, but nowhere is it legible that *nesting is folding*: the surface of a fold holds only what the fold needs, and detail drops a level down — subheadings, or separate files when the content is large — where the link is proximity and skippability rather than a reference. "Detail folds toward the edges" gets read as later sections, not deeper levels. Ridden in [`04-importance-first-nested/`](04-importance-first-nested/prompt.md) (cut and run 2026-08-31): the same prompt as lab 03 plus a fourth rule — folds have two media, subheadings folding detail downward where the hierarchy fits. The rider took: the output nests fifteen subheadings under six sections, each section's heart at its top. Awaiting the author's cold read beside 03.

- **The candidate depth-law of the single document** — the "spine" (from dialogue 2026-08-31, refined the same day in [issue #1](https://github.com/Cwejman/OpenLight/issues/1) with the team; "spine" is a minted word, held loosely): the text after a heading and before its first subheading is that fold's surface. Top-level folds hold in reading order and are load-bearing — skipping one can break the comprehension of those that follow. Nested folds are the skippable ones; a later nested fold may depend on an earlier skipped one, so links must reach headings, not only files (markdown carries this natively as anchors), and the link states the dependency for whoever skipped. Forward links comply with law 1 only as offers — "elaborated further in [x]", zero algebra — and the fold pointed at must itself link back to the ground it depends on, so the dependency is written at both ends. Recursion ruled adopted-for-now (author, 2026-08-31): the order law holds at every level — leaned into first because if it works it is preferable; relaxing it is a later study, since a non-recursive depth risks the bad reading experience. Still open: whether a load-bearing back-link into a skipped fold really costs nothing in practice. **These spine findings graduate into code.md, not the first proof** (author's ruling in the thread): the hierarchical document is a first-class human medium, not a markdown artifact.

- **Bullets ruled — settled** (author, 2026-08-31): bullets are allowed as a technique beside subheadings; their nature is a fold without an address. Past a sentence or two, a bullet must follow the fold law — bold point as its surface, body after, so the reader decides from the bold alone. The discriminant is linkability: what a link may need to reach gets a heading; what needs no address may be a bullet.

- **Nesting has a floor — deferred** (issue #1; author, 2026-08-31): markdown offers ~6 heading levels and the deep ones stop reading as structure; the candidate rule (headings escalate a level, top folds become files) is markdown-specific and not needed at the depths in play, so it waits. Held open with it: when a fold becomes a directory, what is the directory's preface?

- **Links are multi-modal** (issue #1): a link may point at what does not exist yet — intent, as code.md's own link to the unwritten first proof — or at what is not yet understood, a door to knowledge not ingested. Law 1 is about building on what you have; it does not forbid naming what you know you lack.

- **Team opens, standing** (issue #1 — Eric, Emelie, Sanna): what the second level of a document is — bullets, folds, or both; whether an intro should carry a short guide to how the text is structured and can be read; how running-text source references (studies, not folds) are handled — linked for transparency or unlinked to stay separable from fold links; and whether expand/collapse folding would make a text less frightening at first sight — depth as a visible choice. The collapse question is answered for now (2026-08-31): GitHub documents headings inside `<details>` but nowhere guarantees an anchor link into a collapsed section opens and reaches it, so collapse blocks are not used — plain heading anchors hold, and visual folding stays a tooling question (IDE heading-folding now; possibly a simple wiki generator later).

## Standing method findings

Settled by repetition; they feed the first proof's stewarding rules:

- **The writer's closure is invisible from inside; only a fresh head finds it.** Three times evidenced (the code's cold-open rounds, the essence rebuild, encounters). The cold-open check is part of shipping, not an aspiration.

- **The compression level of a brief sets the writer's freedom.** A tightly compressed proposition inventory *is* prose; blind writers reproduce its sentences (the blind-variant experiment, 2026-08-23).

- **A bootstrapped session becomes what it reads.** What its ground does not carry does not reach the work — encounters wrote without the language rule because `code.md` did not hold it.

- **Record the method at the moment of the work.** Provenance recovered late survives only by luck ([`method.md`](../../sweep-2026-08/method.md)'s own lesson).

## Notes

- The sibling study ground is hjulverkstan (`~/git/hjulverkstan/wiki/drafts/` — the ladder, the study, the chart). The two searches cross-pollinate; neither is the other's authority.

- The sweep's three artifacts ([`findings/`](01-categorical/output/README.md), [`encounters.md`](02-encounters/output.md), [`method.md`](../../sweep-2026-08/method.md)) await the author's read; [`landscape.md`](../../landscape.md) is kept as ore, to be re-read critically rather than trusted.
