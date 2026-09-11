# Where structure pays, and the gate

Structure here means anything typed rather than written out: a field with a declared meaning, a schema, a description attached to a tool, a permission rule, a link whose relation is named. One agent was sent to argue against the typed-medium claim at full strength, and the boundary it came back with is sharp enough to design against. This brief holds that boundary, the gate that overrides it, what a model gets from what you write, the one result that cuts hardest against arrangement, and the part of the argument that no increase in capability will move.

## 1. The property that all the uncontested cases share

Every domain where typed structure is uncontested — authorization, financial and medical records, provenance and audit, transactional integrity, federation, formal verification — shares one property. A claim must be evaluated by a party who was not present when it was written, under an asynchronous or adversarial relationship, with a defined consequence for being wrong.

Prose wins on the other side of that line: where the payload is read once, by a reader who will exercise judgment on it there and then.

In between, five questions make the property operational, and a yes to any one of them is enough. Must the rule hold even when the reader is wrong or under attack? Is the question a count, an intersection or an aggregate rather than a search? Do several parties write without a coordinator, so that merging needs claim identity? Will someone who was not there have to judge it later? Does the cost grow with the size of the catalogue being offered? *Distilled by one agent from the studies beneath it. The domains are measured; the five questions are its reasoning.*

## 2. The gate that overrides all five

If the type would have to be inferred rather than observed or declared, do not type it.

The gate outranks the five questions because of an asymmetry in how the two media fail. Incomplete prose fails visibly — you read it and see the gap. A wrong type does not fail at all; it answers. [What happens when the types are inferred](inferred.md) holds that asymmetry, the studies under it, and the one operational rule that falls out of them.

## 3. What a model gets from what you write

The agent-facing lane is the only territory in the sweep producing clean controlled experiments, and its results split along the same line. Typing what a model must choose from or act within — a tool catalogue, an operation set — improves task success and selection under intervention. Writing prose at a model does not, and the content type that fails is the repository overview that every vendor guide recommends most. The one thing prose buys is navigational: agents reach the right file while patch quality stays flat.

One caveat travels with all of it. On the benchmark most of this work uses, identical runs flip about a tenth of individual outcomes, so any result reported from a single run cannot be told from chance. That does not put the measured gains inside the noise — the arithmetic for why is in [what models do with what we write](models.md) §5, which is that figure's home — but it does mean a claim of a few points from one run is not evidence, and several claims in this territory are exactly that.

## 4. The one result that cuts hardest against arrangement

Across eighteen models, material shuffled into a random order was recalled better than the same material in a logically coherent one.

Held at the weight its own authors give it — one study, measured on retrieval from long contexts rather than on reading a document, attributed to structural patterns influencing attention rather than to disorder helping — it is the most direct evidence in this material against arrangement helping a *model* reader. It says nothing about a person, and it cannot be carried across: whether a model finds the same things difficult as a person is not currently measurable in either direction, which is [what models do with what we write](models.md) §6. Its figures and conditions are in the same brief, §7.

## 5. What scaling dissolves, and what it never touches

The case for waiting is real. Schema compliance is already near-perfect, format gains saturate at the frontier, and the spread between formats collapses for strong models. What scaling dissolves is the reading side: format preference, tolerance for messy input, hand-built retrieval machinery, and the need to pre-chunk for a small context window.

What it never touches is the writing side. A rule that must hold even when the model is wrong or attacked cannot live in the prompt, because a model that has read a row has already read it — no increase in capability turns a reader into a gatekeeper. Provenance, because where a claim came from is a fact about the world rather than a property of whoever reads it. Coordination between several writers. Cost that grows with the catalogue. And staleness detection, whose one working control is in [what happens when the types are inferred](inferred.md) §5.

The asymmetry is exact: scaling dissolves the problems of reading, and does not touch the problems of writing, of committing a claim, and of being accountable for it later. *Reasoned by one agent; the individual results on both sides are measured.*

What every figure above inherits — the sweep's conditions, whose marks these are, and what was never checked — is in [what this rests on](../ground.md).
