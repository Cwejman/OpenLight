---
under: the code
kind: brief
---

# What is known about the making

The claim that work proceeds in whole steps — written whole, read again under the code, with a fresh session reading the draft cold and a debrief at the end — is the one the sweep engages least. This brief holds the four partial answers it does give and the one clean absence, because a claim nobody looked at should be distinguishable from a claim that failed.

## 1. Review works; how you review does not

The base rate is solid and worth holding first: peer review catches somewhere between a third and nearly all defects, with a median around sixty per cent. That a second reader finds things the first missed is not in doubt.

What is in doubt is every refinement of it. Checklists are no better than reading ad hoc, measured twice in two populations. Inspection meetings produce no net gain in defects found over the same people reading alone, measured twice. The belief that developers skip the prose traces to a hedge rather than to a measurement. And the meta-analysis of the technique that supplies the field's most-quoted improvement figure reports strong indicators of researcher bias in that very literature.

*Carried at one remove and unreconstructible: the agent that returned these says it verified them in an earlier report, and that report is not among the forty-five. The verdicts are in the sweep; the study names, sample sizes and populations behind them are not.*

## 2. The fresh head is measured once, and the measurement is small

A session with no history of the work, reading a technical document and reporting errors, raises error-detection accuracy from 24.6% to 28.6% on the standard combined measure. That is the only measurement anywhere in the sweep touching the practice of having a second, context-free reader review a draft.

Read it as the agent that found it read it: the gain is real and the absolute level is what should worry you. Under thirty per cent means the reviewer misses most of what is there. *Measured, one study, paper-only.*

## 3. Writing whole has no known size limit, and nobody has looked

The sweep was commissioned with this question among its list — whether rewriting a thing whole survives a corpus larger than one rewrite can hold — and returned nothing. Not a weak answer, not a contested one: nothing in the forty-five reports addresses it.

That matters more than most absences here, because it is the practical limit on the whole method. Every other cost in this brief is a cost per round; this is the point at which rounds stop being possible.

## 4. The nearest practice has one cost measurement and it is bad

Spec-driven development is the closest thing in industry to writing knowledge up front for an agent to work from, with three tools and a small practitioner literature behind it. Its only cost figure: one feature produced 2,577 lines of specification and 689 lines of code in 33 minutes, followed by three and a half hours of review — against 8 minutes of work and 24 minutes of review for the same feature by iterative prompting.

And the practice has no size dial. One practitioner reports a bug fix expanding into four user stories and sixteen acceptance criteria. *Practitioner reports with figures, named in the coverage chart of leads the project held before the sweep and not independently verified; treat them as leads rather than ground.*

The same shape appears in the one other place writing cost was measured. Minimal manuals, the strongest measured document-design result there is, take about thirty per cent longer to produce than the manuals they beat.

## 5. The debrief is subject to the finding that governs every record

A debrief is a record: it describes, and nothing downstream consumes it. On the finding in [what keeps a document alive](survival.md), that predicts it will be written once and not maintained — which is exactly what happened to half of all architecture decision records.

The difference the code asserts is that a debrief is written to be read once, by whoever runs the next stretch, rather than maintained. Nothing in this material tests that distinction, and the one large-corpus finding nearby points at where rationale actually survives: in the commit, which something downstream does consume, rather than in the record the practice names.

## 6. What this adds up to

Of the code's making, one part is supported at a low level and once, one part is unmeasured, one part is unmeasurable from this material, and one part inherits a finding that predicts its decay. Nothing here refutes any of it, and the sweep is the wrong instrument: it was sent to read a literature, and the making is a practice. What would settle it is running it and measuring, which is what this piece is a product of and not evidence about.

The detail is in [the material's writing folder](../corpus/writing/README.md), for the review findings and the cost of writing up front, and [its agents folder](../corpus/agents/README.md) for the fresh-reader measurement.

What every figure above inherits — the sweep's conditions, whose marks these are, and what was never checked — is in [what this rests on](ground.md).
