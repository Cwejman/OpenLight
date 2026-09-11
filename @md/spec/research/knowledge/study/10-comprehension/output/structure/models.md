# What models do with what we write

This is the only territory in the sweep with clean controlled experiments, and its results fall on both sides of one line: descriptions a model chooses or acts from pay, and prose aimed at a model does not. Read all of it against the noise floor in section 5, and against one caveat that covers the lane — none of this work is peer-reviewed, so the sharpest evidence in this material is also the least reviewed.

## 1. Descriptions pay, under intervention, repeatedly

A survey of 856 tools across 103 servers offering tools to models found almost all of them carrying at least one defect and more than half not stating their purpose. Rewriting the descriptions produced a median gain of about six percentage points in task success and fifteen per cent in partial goal completion, at two-thirds more execution steps and with regressions in one case in six. Causal, modest, and not free.

A second experiment, over a survey of 10,831 such servers, found that descriptions meeting the published convention were selected 72% of the time against a 20% baseline. Note what it measures: selection among competing tools, not task success. The figure circulating as "260% more often" is that same result restated as a relative lift.

Restating a tool catalogue as structured code is sharper still, and it is the one result that keeps the frontier open. A 14-billion-parameter model goes from 0% to 84.4% accuracy at twenty tools, using about half the tokens. The authors separate the two candidate causes by asking how much of the variance each explains, and the token saving explains almost none of it once format is accounted for — so the mechanism is the representation, not the compression. The honest half is the scaling arm: the gains saturate on light catalogues and persist only as about five points on heavy production schemas, which means part of what is measured is a tax on weak models, and the tax is falling. Those five points are also the answer to the flat claim, carried in [the case against](../medium/against.md) §2, that nothing typed beats prose on frontier models: that claim is about prose a model reads, and this is about a catalogue it must choose from, which is the distinction the whole lane turns on. *Measured, paper-only.*

## 2. Prose aimed at a model is inert, and the mechanism is known

The evaluation of repository context files — `AGENTS.md` and its kin, in roughly 845,000 repositories — reports that providing them "does not generally improve task success rates, while increasing inference cost by over 20% on average," across several models and agents, in both a synthetic setting and a corpus of repositories whose developers had written the files themselves. The detail that matters is that the agents did follow the instructions. What failed was the content, and specifically the repository overview.

A second study of a different design agrees and bounds itself honestly: 288 evaluated runs across 17 tasks and 3 repositories, finding no measurable movement in correctness and saying explicitly that this bounds the effect to within ten to fifteen percentage points rather than excluding it. Its failure-mode triage is the load-bearing part — agents fail on implementation skill rather than on missing repository knowledge, and a manipulation probe confirmed the real context file never converted a near-miss into a pass.

A third, preregistered, explains why. Holding the file-finding step fixed with an oracle and varying only how the code was represented, natural-language summaries answered almost none of the behavioural questions the source answers — 4 of 45 against 27 of 45 — and "the gap belongs to the representation, not the summarizer," since a frontier model's summaries scored exactly as poorly as a small model's. The study's registered hypothesis failed too: rendering a file as typed skeletons and signatures resolved no more issues than deleting that part of the file outright. *Measured; this is the home of the context-file null, and everywhere else in the piece points here.*

## 3. What does work is getting the reader to the right place

Tuning repository guidance raised issue resolution from 25.5% unguided to 33.0%, and the gain came from agents reaching the correct files — about fifteen percentage points more coverage — while patch quality stayed flat. The same mechanism appears in retrieval, where prepending a document's heading hierarchy to each chunk lifted retrieval rank by a quarter with no additional model calls, and where linking a site's index file cut invented dead URLs by roughly ninety per cent.

Prose explanation is inert; navigational pointers are not. That is also what a good orientation section does for a new human contributor: where things live, how to run the tests, which conventions are not inferable. *Measured; the resolution result ran on a mid-size open model, which is exactly the condition under which format gains are largest and shrinking.*

## 4. Two ways typing backfires

Putting label definitions in schema descriptions underperformed the same definitions in the system prompt by 11 to 13 percentage points for two frontier models, and where prompt and schema conflicted, accuracy dropped between 5 and 45 points — one model going from 52.5% to 7%. Typing your instructions creates a second channel that silently overrides the first.

Forcing output to match a schema during generation costs reasoning, worsening with strictness, because the masking distorts the model's distribution toward valid but suboptimal answers. Compliance itself is essentially solved; the cost is in what compliance does to the thinking that produces the content. *Measured across several studies; one of them offers a repair, so the cost is a default rather than a law.*

## 5. The noise floor under all of it

Temperature-zero inference flips about 9% of per-instance outcomes between byte-identical runs on the benchmark most of these results use. That is a floor within striking distance of the single-digit gains in section 1 and of the nulls in section 2 alike, which means a single-run ablation claiming a few points from documentation cannot be distinguished from run-to-run variation.

It was measured on one benchmark and bounds the context-file nulls and the file-finding result directly. Whether the description results in section 1 sit on a comparable floor is unmeasured, and nobody has looked. *Measured, on one benchmark; the extension to others is reasoned. This is this figure's one home.*

## 6. Whether a model reads like a person is not currently a measurable question

Two results bound the premise that one artifact can serve both readers, which is a premise any single-medium claim has to make. Whether a model finds the same things difficult as a person depends on the model class: reasoning-tuned models align significantly with human difficulty patterns, while instruction- and coder-tuned models show near-zero correlation. And there is no shared readability metric — the standard machine measure does not reliably track human understandability judgments across multiple human-labelled datasets.

So "what is good for a person is good for a model" is not currently measurable in either direction. It is a design preference and should be held as one. *Measured, in the sense that both negative results are measured; the conclusion is the reading.*

## 7. A well-organised long document is not recalled better

Degradation of a long context begins far below the model's stated limit, a single irrelevant passage hurts, and — the least-cited and most useful result — models score better on shuffled material than on logically coherent material, across all eighteen models tested.

That is the sharpest single caution in this material against assuming arrangement is what helps, and it is carried up to [where structure pays](README.md) §4 because of it. *Measured, one study, paper-only.*

## 8. Compression is a safety failure, and routing has a one-level ceiling

Two further results bear on any structured medium. Compressing a conversation to fit is not merely lossy: policy violations go from 0% with the full policy in context to about 30% after compression, and the fix that restores zero is pinning the rules out of the lossy path. So a rule that must survive belongs in a channel that is not summarised.

And progressive disclosure — routing a reader through an index to the content — has a measured ceiling. One level degrades gracefully and eventually beats raw navigation; a second gives no benefit and sometimes reduces accuracy. That shallow ceiling is roughly where the human depth experiments land too, in [what a reader is measured to get](../reading/README.md) §4. *Measured, paper-only; one controlled ablation each.*

The detail is in [the material's agents folder](../../corpus/agents/README.md).
