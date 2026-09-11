# What happens when the types are inferred

Microsoft's WinFS, a typed filesystem cancelled in 2006, failed on a bottleneck that has now disappeared: clean typed metadata could not be produced at all. In 2026 a model will fill any field you declare, cheaply, at whatever precision it happens to reach. *Observational; the cheapness is visible in every study below rather than measured as such.* This brief holds why that is a worse problem than the old one, the studies that bound it, and the one operational rule that falls out of them.

## 1. Why a wrong type is worse than incomplete prose

Follow the failure through once and it stays with you.

*The scene that follows is an archetype, not a case: its shape is what the studies in section 2 measure, and no confidence attaches to the numbers in it.*

A field is declared, and a model fills it across ten thousand records. It is right seven times in ten. Nobody checks, because checking ten thousand records is the work the field was meant to save. Later someone asks how many records fall in a category — a question prose could never have answered, which is exactly why the field exists. They get a number. It is wrong — by how much, nobody can say, because that depends on which way each error fell, and nothing about the number shows it: no ragged edge, no hedge, no visible gap where the missing part would be. A paragraph that does not know something reads as a paragraph that does not know something. A field that does not know something answers anyway.

That asymmetry is the whole argument for the gate, and it is why the gate outranks every reason to type a thing.

## 2. The four studies, and what the circulating range actually is

The material summarises this work as inferred types running twenty to eighty-five per cent wrong. That is a summary across four studies with four different measures, so treat it as a shape rather than a rate, and hold the studies separately. This is that figure's one home.

The decisive one destroyed the identifiers on 680 paired database columns across eleven databases and asked a model to recover what each column meant, scored against human documentation. Used directly it is right 22% of the time while answering 94% of the time. The same model inside a harness that checks its answers deterministically is right 48% of the time on the 42% it commits to — and restricted to the columns where both arms answer, the harness is no more accurate than the model alone; what it adds is knowing when to keep quiet. The authors' own line is the one to keep: the deterministic layer is a competence detector, not a competence amplifier.

The other three corroborate from different directions. Across 21 models, schema compliance is near-perfect while accuracy of the values filled in runs 83% on text, 67% on images and 24% on audio — form is free and content is not. Across 12,867 evaluatable fields, frontier models degrade as the schema widens, reaching no valid output at all on a 369-field financial schema. And prompt and model choices shift annotation outcomes by twelve to eighty-five percentage points, with errors correlated with the variables you care about, which biases any estimate built on them regardless of average accuracy. *Measured, four studies, all paper-only.*

## 3. Declared structure wins, and has never been raced against good prose

Three results establish that declaring beats inferring. An ontology builder with no unconstrained generation step, restricting the model to narrow graph-grounded mediation with a provenance chain on every term, answers 85% of its competency questions against 63% and 62% for direct and multi-agent baselines. A memory system with thirteen predefined categories, no entity extraction and no graph schema to maintain, beats hybrid graph and vector systems. A governed semantic layer for enterprise database queries reaches 97% against 55%.

Read them holding what their own authors say. The semantic-layer authors decline the causal claim themselves, because the governed system receives curated artifacts the baseline does not, so the win belongs to the curated layer rather than to the machinery. And all three beat a model-extracted or an unstructured baseline. None was raced against a well-written prose document, which is the comparison the claim actually turns on, and that missing study is the first entry in [the missing studies](../unknown.md). *Measured and adjudicated; the comparisons are not like-for-like and their authors say so.*

The middle case — a model extracting under a declared schema — has been measured once. Constraining extraction to a schema gives an order of magnitude fewer nodes and two orders of magnitude fewer model calls than the unconstrained baseline, while matching entity-relation systems on quality. So schema constraint buys cost, and whether it buys quality is unestablished.

## 4. The rule that falls out: enforce, do not ask

The decisive study's operational finding is the transferable one. A commit gate enforced in code produced zero coverage of cases where there was no evidence, on every model it was tried on, while asking for the same restraint in the prompt did not transfer from one model to the next at all.

That is the general shape of everything in this folder, and it is the writing-side form of what [where structure pays](README.md) §5 states from the reading side: a rule asked for in prose holds for the model you tested it on, and a rule enforced before generation holds because the model never gets the chance.

## 5. Two failures the claim has to answer

Entity resolution — deciding that two names denote the same thing — remains unsolved, and it is what populates every typed field built by extraction. If the thing filling your field is a model, the field inherits the model's distortions and then launders them as structure. This is that argument's one home; [the case against](../medium/against.md) §2 points here. *Practitioner assessment, widely echoed in the sweep; no measurement of the residual error rate at scale.*

And the decay is silent. Across 19,099 of the servers that offer tools to models, watched over 88.6 days, re-auditing the 5% most likely to have drifted catches only about a tenth of the descriptions that actually changed, because half the changes land on entries that did not exist at the last audit. The one control that works is binding content to a hash and revalidating the moment it moves — which is itself a typed field, and no model capability substitutes for it. *Measured, one census.*

The detail is in [the material's adversarial brief](../../corpus/substrate/does-structure-pay.md).

What every figure above inherits — the sweep's conditions, whose marks these are, and what was never checked — is in [what this rests on](../ground.md).
