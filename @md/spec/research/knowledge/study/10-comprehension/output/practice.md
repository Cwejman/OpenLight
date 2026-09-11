# The catalogue, and how the numbers came to exist

The entry says the practice has no authority to lend. This brief is the evidence for that: the five canonical texts, the four places measurement was attempted, the mechanism by which this field's circulating numbers came to exist — which is the part worth carrying, because it repeats — and what all of it does and does not license.

## 1. The canonical texts are experience reports

Diátaxis, the dominant framework for arranging technical documentation, cites no research, no empirical study and no other theory; its own site says the argument is self-contained. Michael Nygard's 2011 post that started architecture decision records offers as its entire evidence that the format had been used "on a few of our projects since early August." Malte Ubl's "Design Docs at Google" has zero citations and zero data. The document that defines how internet standards are made states its own warrant as "the result of a number of years of evolution, driven… by experience." The hardware company Oxide justifies its written-decision practice with "writing down ideas is important."

None of that makes the practices wrong. It means they are preference, and anything built on them inherits preference rather than findings. *Carried from the sweep, which read each at source and graded them opinion.*

## 2. Where measurement was attempted, it went null or small

Take the four that land hardest.

The most-adopted convention in the field is `AGENTS.md`, a file of instructions for coding agents, in roughly 845,000 repositories. The one rigorous evaluation found it does not generally improve task success while raising inference cost by over a fifth, and the content type that failed is the repository overview that every vendor guide recommends most. Its figures, its corroboration and the run-to-run variation any single-run result in this territory has to be read against are in [what models do with what we write](structure/models.md) §§2 and 5.

Architecture decision records reached "Adopt" on ThoughtWorks' technology radar fourteen months after Nygard's post, on no data. Fifteen years later, the first study to look for an effect — reusing the same 921 repositories and about 5,800 of those records — found the variables "exhibit predominantly small correlations with code quality and productivity metrics, suggesting that ADR adoption is associated with, at most, modest observable effects at scale." *Measured, observational, paper-only.*

DORA, the only large effort to link documentation quality to delivery outcomes, reversed on itself across five annual reports: a 2.4× multiplier in 2021, then "documentation practices negatively impacted software delivery performance" in 2022, then "no effect" in 2023 with a footnote saying the authors continued to be surprised, then the construct removed entirely by 2025. *Cross-sectional self-report throughout, with no confidence intervals published in the year that produced the famous figure.*

And the format question has been put directly. A controlled study with 65 participants, randomised between a narrative-essay and a structured architecture document, found no significant association between format and architecture understanding; the dominant factor was prior exposure to the source code. *Measured; the best-controlled result in the decision-document area.*

The information-architecture methods fail the same way, and their evidence is thin enough to be worth its own brief: [what is known about finding](reading/finding.md).

## 3. How the numbers you would cite came to exist

The pattern is worth more than any single case, so take it as a shape you will recognise.

Somebody needs a number. A conference paper exists that almost has one: it ran the study, it graphs the result, and it prints no values. A practitioner reads the values off the graph and publishes them in a short post. The post is easier to find, easier to read and easier to cite than the paper, so it is what gets cited — and once a number has been cited a few times, citing it again feels like citing the field rather than the post. Twenty years on the figures are quoted as published data, and the paper's own second table, the one that would qualify them, is never mentioned, because nobody in the chain after the first reader has opened it.

That is the actual provenance of the participant-count numbers everyone quotes for card sorting, traced with its dates in [what is known about finding](reading/finding.md) §1.

Three mechanisms produce nearly all of this field's folklore: a figure read off a graph and requoted as data, a citation chain long enough that nobody in it opened the original, and an author's honest hedge stripped by the first person to repeat it. Roughly forty such figures were traced and retired by the sweep, and they have one home, in [the material's folklore file](../corpus/folklore.md), so that no brief has to carry a warning about a number it does not use. *The audit is the sweep's own, and each entry names the primary source it checked.*

## 4. What this licenses

It does not license dismissing the practices. A null on documentation format is not evidence that documentation does not matter, and two of the four nulls above are underpowered enough that "no difference found" is not "no effect" — the format study at 65 participants, and the corroborating agent-file study, which bounds its own result to within ten to fifteen percentage points.

What it licenses is refusing to treat adoption as evidence. If a rule is worth holding, it is worth holding as a preference you have reasoned about and can state as one.

What every figure above inherits — the sweep's conditions, whose marks these are, and what was never checked — is in [what this rests on](ground.md).
