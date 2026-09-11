# The sweep, read

On 2026-08-26 a fleet of research agents swept the ground this project stands on and returned 45 reports. They were often sent over the same territory, so the raw says many things many times. This corpus says each thing once, in one place, with the confidence its report gave it and that report one link away. It is not a piece for a reader; it is the material, made small enough to hold by whoever writes from it next. Before quoting any figure below, read [`method.md`](method.md): the sweep has two systematic biases and one caught fabrication, and every number in this corpus inherits them.

## 1. The shape that repeats

One finding recurs in every territory, and it is the largest thing the sweep has to give: **the practices are adopted far ahead of their evidence, and where the evidence exists it is usually null.** This is not a claim about any one field. It is what agents briefed on different subjects, across most of the territories the sweep entered, reported back independently of each other's conclusions — with the qualification, which [`method.md`](method.md) §1 states, that twenty-seven of the forty-five were sub-agents inheriting a parent's brief, so this is convergence across a partly shared lineage rather than forty-five separate confirmations.

Diátaxis is followed by hundreds of projects and cites no research; its author disclaims the file-per-type reading everyone took from it. ADRs reached "Adopt" on ThoughtWorks' radar in fourteen months on zero data, and the first study to look for an effect found "at most, modest observable effects." AGENTS.md sits in tens of thousands of repositories and the one rigorous evaluation finds no gain in task success at over 20% more cost. Card sorting is universal in information architecture and its one direct validity test returned a null — while tree testing's one validity study exists and could not be read. DORA published a 2.4× multiplier for documentation quality, found the opposite the next year, then no effect, then removed the construct. Graph retrieval's own authors put the reference implementation into maintenance mode while independent benchmarks report it losing to plain vector RAG at 200× the tokens.

The corollary matters more than the catalogue. Anyone building on this ground cannot borrow authority from the existing practice, because the practice has none to lend. What it can borrow is the small set of results that did survive checking, and those are narrow, specific, and mostly not where the practice points.

## 2. Where structure actually pays

The second-largest finding is a boundary. Structure demonstrably pays in four places and demonstrably does not in a fifth, and the line between them is sharp enough to design against.

It pays for **machine-facing descriptions** — tool and API schemas, where augmenting descriptions lifts task success and selection probability. *Measured, under intervention, in two independent controlled experiments.* It pays for **navigation** — carrying a document's heading hierarchy into its chunks lifts retrieval, and guidance helps coding agents by getting them to the right file rather than by explaining anything. *Measured; the heading-chain result is paper-only, single-author and not peer-reviewed, and the localisation result is a four-trial benchmark study on a mid-size open model rather than a frontier one — which is the condition under which format gains are largest and shrinking.* It pays for **enforcement before generation** — authorization, budgets, abstention gates, which cannot live in a prompt because a model that reads a row has read it. *Measured, and reasoned from the mechanism.* And it pays for **provenance** — where a claim came from is a fact about the world, not a property of the reader. *Reasoned; no measurement is possible or needed.*

It does not pay for **prose explanation aimed at a model**. Natural-language summaries answer almost none of the behavioural questions the source answers, and this is a property of the representation, not of the summariser. Repository overviews, the most-recommended content in every vendor guide, are the specific thing measured not to help. *Measured, pre-registered, and independently corroborated by a second null.*

Underneath both lies a hard gate found by the sweep's adversarial lane: if a type would have to be *inferred* rather than observed or declared, do not type it. Inferred types run 20–85% wrong and degrade with schema breadth to total failure. *Measured across four studies.* A typed store with wrong types is worse than prose, because a wrong type answers confidently where incomplete prose visibly fails.

## 3. How people take in written knowledge

The cognitive science under document design is real, small, old, and studied almost entirely on students reading short passages once. Its strongest effects are signalling, segmenting and narrative; its most-cited principle, the abstract opening, is the part its own meta-analyses failed to confirm.

Two of its verdicts land directly on rules this project holds. The redundancy effect does **not** support saying a fact in one place only — that is a finding about identical content in two channels at the same moment, and the nearest evidence runs the other way. And where professionals have been studied — pilots, physicians, lawyers, engineers — expertise turns out to raise the whole curve without buffering against bad prose, with the dominant failure being retrieval rather than comprehension.

The same lane produced the sweep's only direct design verdict, and it is the one finding here that argues against this corpus's own shape: invest in correctness, completeness, currency, findability and worked examples, and do not invest in format or in layering depth. *Reasoned by one agent from the studies beneath it; not measured.* [`reading/`](reading/README.md) holds all of it.

## 4. What the practice of writing buys

Documentation frameworks, decision records and review processes form a second body, and it is where the adoption–evidence gap is widest. Diátaxis, DITA, ADRs, RFCs and design docs each have a canonical text that is an experience report and a measurement literature that either does not exist or returns nulls. The structural finding that does hold, repeated independently, is that descriptive documents rot and prescriptive ones — those that generate something downstream — are maintained. [`writing/`](writing/README.md) holds it.

## 5. What models do with what we write

The agent-facing layer is the only territory in the sweep producing clean controlled experiments, and its results split precisely along the line in section 2. Beside it sits context engineering — where degradation is measured and reproduced but nearly every prescription is a vendor blog post — and agent memory, where the labs commoditised the layer from above in four months. [`agents/`](agents/README.md) holds it.

## 6. What moves knowledge between people

The organisational literature is older and better-designed than anything in the documentation lane, and it bounds what a document can do. The dominant barriers to knowledge moving are the receiver's capacity to absorb it, the ambiguity of the knowledge itself, and the arduousness of the relationship — not motivation, and not prose quality. Organisational structure predicts software defects better than any property of the code. Mentorship outranks documentation in the one large onboarding study. [`people/`](people/README.md) holds it.

## 7. Whether typed structure is the right medium

Several lanes of the sweep tested whether a typed, versioned, permission-governed *substrate* — the common floor that data and programs live on, as prose is the floor knowledge lives on — is buildable, and whether anyone has built one. The answer is that every part has been built, several parts repeatedly, and the combination nowhere — and that the graveyard is instructive about why. [`substrate/`](substrate/README.md) holds it.

## 8. How far that reaches, into interfaces

The claim that an interface can be data over the same contracts as the data has been attempted at Airbnb, Uber, Plaid, DoorDash, Lyft and Shopify, and the failure modes are documented in unusual detail by the teams that hit them. One layer up, the generative-interface protocol race ended in an opaque standard, and the product view layers all stop at a closed enum. [`interface/`](interface/README.md) holds it.

## 9. Who else is on this ground

Nobody found is arguing the whole thesis; every neighbour holds two or three claims and rejects the rest. The strongest opposition is not "structure is hard" but Dynamicland's inverse principle, that to maximise agency you minimise what the computer knows. [`field/`](field/README.md) holds the neighbours, the opposition, the tools-for-thought products and the research substrate lineage.

## 10. The numbers that did not survive

Roughly forty figures in wide circulation were traced to nothing, or to something that says the opposite. They have one home here rather than a warning in each brief that might otherwise repeat them: [`folklore.md`](folklore.md).

## 11. Which report said what

Every brief links the reports it rests on. The reverse index — report id, subject, and where its findings landed — is [`register.md`](register.md).
