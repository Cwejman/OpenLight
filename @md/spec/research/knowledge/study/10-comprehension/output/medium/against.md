---
under: the code
kind: brief
---

# The case against

Argued at its best the case against a typed medium runs in three layers that reinforce each other. The third is the serious one, and it has an answer that concedes half of itself. The first two do not have answers, and this brief ends with them, because they are what has to be carried rather than won.

## 1. Betting against flexibility has been a losing bet

The first layer is the bitter lesson — that in the history of AI, general methods that scale with computation have repeatedly beaten hand-built structure — applied to representation. Scaffolding built to compensate for a model's limits is fighting a losing battle, because the limit moves.

The domain-specific evidence is three years of extension mechanisms, each superseded by something less structured than the last: plugins, then written instructions, then assistants, then typed tool registries, ending at folders of Markdown. If a model can read your codebase with a search tool and write its own adapter, a typed medium is a cost you pay to solve a problem the model no longer has. And every year the option of pasting it all in gets cheaper: million-token context became generally available on frontier models in March 2026.

## 2. The measured cost of structure

The second layer is empirical, and the sweep's own measurements supply most of it. Typed instructions underperform the same instructions in a system prompt by 11 to 13 percentage points and collapse when the two channels conflict. Forcing output to match a schema degrades reasoning. Format sensitivity shrinks as models improve, and one agent states the finding plainly: no evidence was found that typed or structured *input* beats prose on frontier models. That is narrower than it sounds, and the narrowing matters — it is about prose a model reads, not about a catalogue it must choose from, where typing does still pay a few points on heavy schemas; the measurement and the distinction are in [what models do with what we write](../structure/models.md) §1.

The economics are stated most concretely by a practitioner: a plain vector index costs about a thousandth of a full graph index — three orders of magnitude, paid up front, on content nobody may ever query. And the failure this claim must answer is entity resolution, whose home and evidence are in [what happens when the types are inferred](../structure/inferred.md) §5.

## 3. The philosophical attack, which is the serious one

Dynamicland has been running the counter-experiment for a decade and states its principle outright: to maximise agency, minimise what the computer knows. Its objection to AI is that the smarter the product, the less the user needs to understand — outsourcing understanding in its most virulent form — and its design goal is a system fully visible and understandable top to bottom.

On that view a rich typed substrate that programs consume and people mostly do not read is another opacity, not a cure for one. The same point arrives from the other side in the title of a 2026 post by a malleable-software researcher: understanding is the new bottleneck.

Stated at its strongest: the claim optimises for what programs receive, and the binding constraint is what people can hold in their heads, so every layer of contract added to make composition automatic makes comprehension harder. *Opinion, from the most committed source available, with a decade of practice behind it and no measurement.*

## 4. The answer to it, and what the answer concedes

That objection is real and mislocated, and the measurements say where. Structure costs agency when it is imposed as a tax at authoring time, where the person paying the formalisation cost is not the person receiving the benefit. It buys agency when it is offered as an inspection surface at decision time.

The counter-evidence is specific. Decomposing an agent's execution into auditable typed actions improved outcomes, users' comprehension of the task, error detection and their sense of co-ownership, with the authors concluding that meaningful oversight "requires not improved post-hoc review mechanisms, but active participation in decisions as they are made." Commenting protocols improve safety without sacrificing task performance, and the gains increase as the monitor gets stronger — legibility scales with capability rather than being obsoleted by it. And a metric calibrated for human comprehension predicts how well meaning survives automated refactoring across 5,000 files: human-friendly is machine-friendly, and the two are not in tension. *Measured; three small studies, none replicated.*

The concession is the authoring-burden half, entirely. Shipman and Marshall's twenty-seven-year-old account of formalisation cost — that the cost is paid at capture and the benefit arrives at retrieval, and people discount the future — stands unrefuted, and it yields a design rule rather than a rebuttal: a typed system must let a thing be untyped, half-typed, and retyped later, without ceremony. *An experience-reflection essay rather than a measurement study; the agent that read the full paper settled that grading against two others in the sweep who had called it evidence.*

## 5. The two that stand

Nothing in this material answers either of these, and both are restatements of the first two layers in their sharpest form.

A type rots silently. Text rots loudly — you read it and see it is stale — while a structure decays and keeps answering, and the measured re-audit rates say you will not catch it.

And the reader for whom structure was an affordance is being replaced. If the structure premium is a tax on weak models, betting a substrate on it is betting against the trend line, and the trend line is the one thing in this material that has moved consistently in one direction.

The detail is in [the material's opposition brief](../../corpus/field/opposition.md).

What every figure above inherits — the sweep's conditions, whose marks these are, and what was never checked — is in [what this rests on](../ground.md).
