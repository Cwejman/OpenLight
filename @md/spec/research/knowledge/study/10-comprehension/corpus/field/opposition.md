---
under: the code
kind: brief
---

# The case against, at full strength

Argued at its best, the case against a typed medium runs in three layers, and the layers reinforce each other. The third is the one to take most seriously, and it is not the one usually anticipated.

## 1. The bitter lesson, applied to representation

The argument is that betting against flexibility has historically been a losing strategy, and that scaffolding built to compensate for model limits "seems like fighting a losing battle."

The domain-specific evidence is three years of increasingly structured extension mechanisms — plugins, then custom instructions, then assistants, then typed tool registries — each superseded by something *less* structured, ending at markdown folders. If a model can read your codebase with `grep` and write its own adapter, a typed medium is a cost you pay to solve a problem the model no longer has. The popular form of this is the claim that the hottest new programming language is English; the talk that stated it drew 1,481 forum points and 783 comments.

The trend line runs the same way: million-token context became generally available on frontier models on 2026-03-13. Every year the "just paste it in" option gets cheaper.

## 2. The empirical cost of structure

The sharpest single data point is the format study in which a format *designed to be better structured for machines performed worse*, because familiarity beats formal fitness. The sweep could not verify that study's scale, and a related benchmark's own numbers show a null — see [`../folklore.md`](../folklore.md) — but the direction is corroborated elsewhere: typed instructions underperforming system prompts by 11–13 points, constrained decoding degrading reasoning, and format sensitivity shrinking as models improve.

The economics are stated most concretely by a practitioner: "A plain vector index costs about 0.1% of a full GraphRAG index. Three orders of magnitude, paid up front, on content nobody may ever query." He also names the failure the thesis must answer: **entity resolution** — Acme against ACME Holdings — remains unsolved, which means a typed medium built by extraction degrades into a typed medium of confidently wrong types. And a commenter named the mechanism: models are bad at summarising non-trivial batches of text, getting things wrong and distorting meaning. **If the thing that populates your typed field is a model, the field inherits the model's distortions and then launders them as structure.**

The measured version of that argument is in [`../substrate/does-structure-pay.md`](../substrate/does-structure-pay.md) — inferred types running 20–85% wrong, degrading with schema breadth to total failure at 369 fields.

## 3. The philosophical attack

Dynamicland has been running the counter-experiment for a decade and reports the inverse principle outright: **"to maximize agency, minimize what the computer knows."** Their objection to AI is that "the 'smarter' the product, the less the user needs to understand" — which they call outsourcing understanding in its most virulent form — and their design goal is a system "fully visible and understandable top-to-bottom."

A rich typed substrate that programs consume and humans mostly do not read is, on this view, another opacity, not a cure for one. And the same point arrives from the other side, in the title of a 2026 post by a malleable-software researcher: **"Understanding is the new bottleneck."**

The strongest form of the objection, stated by the agent that found it: **your thesis optimises for what programs receive; the binding constraint is what people can hold in their heads, and every layer of contract you add to make composition automatic makes comprehension harder.**

## 4. The answer the evidence supports

The objection is real and mislocated, and the sweep's own measurements say where: structure costs agency when imposed as a tax at authoring time, and buys it when offered as an inspection surface at decision time. That answer concedes the authoring-burden half entirely — Shipman & Marshall's twenty-seven-year-old account of formalisation cost stands unrefuted. The three studies behind the other half are in [`../substrate/does-structure-pay.md`](../substrate/does-structure-pay.md) §5.

## 5. The three arguments to keep answering

Restated from the adversarial lane, because these are the ones that survive every rebuttal attempted in the sweep.

**The type-production bottleneck changed shape into something worse.** A typed store with wrong types is worse than prose, because a wrong type returns a confident answer while incomplete prose returns a visibly incomplete one. Prose degrades gracefully; a type does not.

**Structure is a maintenance liability that decays silently.** Text rots loudly — you read it and see it is stale. A type rots silently and keeps answering. The decay figures are in [`../people/structure.md`](../people/structure.md) and [`../writing/records.md`](../writing/records.md).

**The reader for whom structure was an affordance is being replaced.** If the structure premium is a capability-deficit tax, betting the substrate on it is betting against the trend line.

Reports: [`a09867b88abcb610b`](../../../../../sweep-2026-08/raw/a09867b88abcb610b.md), [`aa5f5baaa66cc8bf1`](../../../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md), [`a3f6ddd86cf882a6d`](../../../../../sweep-2026-08/raw/a3f6ddd86cf882a6d.md).
