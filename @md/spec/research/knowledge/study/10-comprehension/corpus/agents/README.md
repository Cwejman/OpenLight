---
under: the code
kind: brief
---

# What models do with what we write

Five lanes of the sweep covered the agent-facing layer: context files, tool descriptions, context engineering, agent memory, and retrieval. This is the only territory in the whole sweep producing clean controlled experiments, and its results are the sharpest thing the raw has to give — because they split cleanly along a line that is useful to design against.

## 1. The line

**Machine-facing descriptions pay. Human-facing prose, aimed at a model, does not.**

On the positive side, augmenting tool and API descriptions lifts task success and selection probability under intervention, and restating a tool catalogue as structured code rescues a weak model outright. [`descriptions.md`](descriptions.md) holds those results and the two places where typing backfires.

On the negative side, and it lands on the most-adopted convention in the field, repository context files do not improve task success while raising inference cost — measured twice, independently — and a pre-registered representation study explains why prose loses mechanically. [`context-files.md`](context-files.md) holds the nulls and the conventions.

One qualification travels with the whole line, and it is easy to overstate without. Whether a model's difficulty tracks a human's **depends on the model class**: reasoning-tuned models align significantly with human difficulty patterns, while instruction- and coder-tuned models show near-zero correlation. And **no shared readability metric exists** — token perplexity does not reliably correlate with human understandability judgments across multiple human-grounded datasets. "What is good for a person is good for a model" is not currently a measurable claim in either direction.

## 2. The one thing prose does buy

Guidance helps by **localisation**, not by explanation — the measured gain comes from agents reaching the correct files while patch quality stays flat, and the one study that shows it ran on a mid-size open model rather than a frontier one, which is exactly the caveat this folder's own capability-tax argument demands. The same mechanism appears in retrieval, where carrying a document's heading hierarchy into its chunks lifts results and linking a site's index file stops agents inventing dead URLs. The win is *finding the file*, not the prose, and both results are in [`context-files.md`](context-files.md) and [`retrieval.md`](retrieval.md).

## 3. Hold the noise floor against everything above

Temperature-zero inference flips a measurable share of per-instance outcomes between byte-identical runs, and that share is within striking distance of the single-digit gains reported in §1. So any single-run ablation claiming a few points from documentation is not falsifiable, and a good deal of what the field reports as reasoning change is format repair at the answer-extraction boundary. The figure and its source are in [`context-files.md`](context-files.md) §3.

The figure was measured on SWE-bench Verified, so it bounds the context-file nulls and the localisation result directly; whether the tool-description interventions in §1 sit on a comparable floor is unmeasured, and nobody has looked. *Measured on one benchmark; the extension to others is reasoned, not shown.*

## 4. Context degrades by composition, not by length

The diagnosis is measured, reproduced and benchmarked; the prescriptions are almost all vendor blog posts. Degradation begins far below the context limit, a single distractor hurts, and — the least-cited and most useful finding — models do better on shuffled material than on logically coherent material. Compaction is a documented safety failure rather than merely a fidelity one, and progressive disclosure has a measured ceiling at one routing level. [`context-engineering.md`](context-engineering.md) holds it.

## 5. The memory layer was commoditised from above

Between April and August 2026 the model vendors shipped the whole agent-memory layer as product — versioned memory stores attributed to sessions, background consolidation, access enforced at the filesystem level — and the flagship of the independent "memory OS" thesis retired its own server. Meanwhile three papers showed the benchmark leaderboards were uninterpretable, and one measured that a 1.2% poisoning rate collapses accuracy with shipped defences statistically indistinguishable from no defence. [`memory.md`](memory.md) holds it.

## 6. Graph retrieval loses on cost, and wins only where the question joins things

Independent benchmarks report graph retrieval frequently underperforming plain vector RAG, and its *global* search mode costing 57× the time and 210× the tokens of a vanilla baseline on one summarisation dataset. *Measured, paper-only; the cost figure is mode- and dataset-specific, and the per-question figures live in [`retrieval.md`](retrieval.md) §1.* Its own authors put the reference implementation in maintenance mode, and the method that wins the independent benchmark overall contains no knowledge graph at all. But the same benchmarks show it winning on complex, multi-hop reasoning — by ten points in one — and that is the half most easily lost when the verdict is stated flatly. Chunking sophistication has been debunked repeatedly; *structural* signal, as opposed to semantic chunk boundaries, is the thing that helps. [`retrieval.md`](retrieval.md) holds it.
