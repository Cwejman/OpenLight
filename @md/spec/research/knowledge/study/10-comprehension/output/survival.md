---
under: the code
kind: brief
---

# What keeps a document alive

The most actionable finding in this material is not about how to write. It is about what happens to a document after it is written: what is consumed downstream is kept current, and what merely describes is not. That accounts for every decay figure in the sweep, it explains why discipline never fixes the problem, and it lands squarely on prose knowledge, which is descriptive by construction.

## 1. Prescriptive survives, descriptive does not

A study across 53 practitioners in six automotive companies, using design science — building and evaluating an artefact with practitioners rather than observing them — produced the sentence: "Stakeholders' motivation to manage prescriptive models is higher than dealing with descriptive artifacts." Artifacts that generate something — code, tests, configuration, other artifacts — get kept current. Artifacts that only describe do not.

The same study's guidelines follow from it and are blunt: produce locally relevant artifacts, especially documentation, as late as possible and only when actually needed, and re-evaluate the shared ones frequently, because they can lose their common identity. *Measured in one industry, self-reported; the mechanism in section 3 is reasoned from it and is not itself measured.*

## 2. What it accounts for

Half of all architecture decision records — 3,255 of the 6,362 files found across 921 repositories — were committed exactly once and never modified again. (The impact study in [the catalogue](practice.md) §2 works a subset of about 5,800 of those same files; the two totals are two studies over one corpus.) When one large company's internal wiki was deprecated, around 90% of its pages had had no views or updates in the previous few months. Nearly a third of a curated, governed biomedical ontology registry is inactive or orphaned. And every one of 105 software releases invalidated part of the agent skills built against the previous version — folders of instructions a coding agent loads on demand — with frontier agents able to repair only between a third and two-thirds of what broke.

In each case the artifact described, and nothing downstream consumed it. One mechanism, four graveyards. *Four measured corpus studies, all observational.*

## 3. How a description dies

The shape is always the same, and it is worth following once, because it explains why more discipline never fixes it. *The scene that follows is an archetype reasoned from section 1, not a case; no confidence attaches to it beyond that.*

Someone writes a document because writing it clarifies their own thinking, which it does. It is accurate on the day it is written. Then the thing it describes moves. Nothing breaks, because nothing reads the document except people, and the people who already know the answer do not consult it. The first person who does consult it is the one in no position to notice it is wrong — a newcomer. They act on it, hit the discrepancy, and work around it privately, because correcting a document is somebody else's job and they have just learned they cannot trust it anyway. The document is now worse than absent, and nothing in the system has registered any of this.

Compare a document that generates something. It goes stale and the build fails, or the test fails, or the generated artifact is visibly wrong. The staleness is not a matter of anyone's diligence; it is an event.

## 4. What it costs the claim this piece is weighing

Prose knowledge is descriptive by construction. It exists to be read and understood, and nothing downstream consumes it, so on this finding it should rot — and the rules for writing it well do not change that, because the mechanism is not about quality.

Two things soften it and neither dissolves it. Knowledge read by a session that then acts on it is closer to being consumed than a wiki page is, and a body of knowledge that fails should fail in someone's work rather than silently. But nothing in this material measures either, and the one large evaluation of files written for agents to read found no improvement in task success, which is the nearest evidence there is and it is unfavourable — its home is [what models do with what we write](structure/models.md) §2.

So the honest position is that the rot is the default, that the design question is what consumes the knowledge rather than how to keep it current, and that if the answer is nothing, the decay should be budgeted rather than deplored. *Reasoned from section 1; the application to prose knowledge is this piece's own and is untested.*

## 5. The one measured intervention points the same way

The only case in the sweep of an organisation restructuring its content and measuring the result used matching rather than a trial, across roughly a thousand customers: improving the knowledge base raised the rate at which an assistant resolved a conversation without a human by a little over one percentage point on average in the first month, with the best customers up to ten points. The number of pieces of content improved barely predicted the gain at all, and eight well-chosen improvements sat on the path of 76% of conversations.

The shape of the finding is the useful part: the gain is concentrated, not diffuse. Which content is consumed matters, and how much content is improved does not. *Measured by matching rather than by trial, vendor-run, one product.*

## 6. Where people do record why

One large-corpus finding cuts against the reading above and changes its shape rather than its direction. Labelling Linux kernel commit messages found 98.9% of commits containing sentences that carry rationale, and experienced developers reporting rationale in roughly 60% of their sentences. A separate sample of about 1,600 messages across five active projects judged roughly 44% to be improvable, which is not the same as judging the rest good.

So it is not that people do not record why. They record it in the commit — the artifact something downstream consumes — and the decision record, the artifact the practice names, is the one that goes unmaintained. *Measured, observational; neither study ties recording to a maintenance outcome.*

The detail is in [the material's writing folder](../corpus/writing/README.md) and [its people folder](../corpus/people/README.md).

What every figure above inherits — the sweep's conditions, whose marks these are, and what was never checked — is in [what this rests on](ground.md).
