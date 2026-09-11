---
under: the code
kind: brief
---

# Machine-facing descriptions: where the gains are

The one place in the whole sweep where writing something better produced a measured improvement, repeatedly and under intervention, is the description attached to a tool or an API. This brief holds those results and the reason they are not transferable to prose.

## 1. The interventions

**Hasan, Li, Rajbahadur, Adams & Hassan** (Queen's University / Huawei), arXiv:2602.14878, February 2026. A survey of **856 tools across 103 servers** found 97.1% carry at least one defect and **56% do not state their purpose**. Augmenting the descriptions gave **+5.85 percentage points median task success and +15.12% partial goal completion** — at **+67.46% execution steps**, with regressions in 16.67% of cases. Causal, modest, and not free.

**Wang, Li, Sun, Liu, Liu & Tian**, arXiv:2602.18914, February 2026. A survey of 10,831 servers into 18 defect classes, then a **mutation-based controlled experiment**: standard-compliant descriptions reach **72% selection probability against a 20% baseline**. Real and experimental — and it measures tool *selection among competitors*, not task success. The circulating "260% more often" is that same result restated as relative lift.

**The older baseline.** ToolTalk (arXiv:2311.10775) ablated tool and parameter descriptions down to names and types only and saw across-the-board degradation — the crude version of the same effect.

## 2. Representation, not compression

TSCG (arXiv:2605.04107), ~19,000 calls across 12 models, is the sharpest result on why format helps. Restating a tool catalogue restores **Phi-4 14B from 0% to 84.4% accuracy at twenty tools** (90.3% at fifty), with 52–57% token savings. The decomposition is the important part: a format-versus-compression analysis moves **R² from 0.88 to 0.03**, establishing that the mechanism is the representation change, not the token reduction.

The scaling arm is the honest half. Gains **saturate on light synthetic catalogues** and persist only as **+5.0 percentage points at ~10,500 input tokens** on heavy production schemas. The payoff scales roughly as catalogue size divided by model capability — which means this is, in part, a capability-deficit tax, and the tax is falling.

## 3. Typed action spaces

ReAct-SQL (arXiv:2608.22651): a **typed domain-specific language of 15 relational operations** instead of free-form SQL, zero-shot, with no schema-linking module — **84.5% on corrected BIRD mini-dev, 73.9% on EHR-SQL, up to 8× faster** than elaborate pipelines. The ablation separates the causes: iteration improves grounding, the typed language improves **compositional reliability**. A narrow typed action space beats both free-form generation and heavy structural machinery.

The same shape appears in a governed semantic layer for enterprise text-to-SQL, where the win turns out to belong to the curated layer rather than to the compiler; the figures are in [`../substrate/does-structure-pay.md`](../substrate/does-structure-pay.md) §3.

## 4. Where typing backfires

Two results bound the enthusiasm.

**Typed instructions underperform.** arXiv:2608.08254: placing label definitions in schema descriptions **underperformed system prompts by 11–13 percentage points** for two frontier models; when prompt and schema conflicted, accuracy dropped **5–45 points** — one model going 52.5% to 7%, another 100% to 73%. Typing your instructions creates a second channel that silently overrides the first.

**Constrained decoding costs reasoning.** "Let Me Speak Freely" (arXiv:2408.02442) finds significant reasoning decline under format restriction, worsening with strictness; "The Parser Already Knows" (arXiv:2608.10137) explains it — masking distorts the distribution toward "valid but suboptimal" outputs, repairable via logit correction from parser state, but a real cost by default. On the other hand, compliance itself is essentially solved: JSONSchemaBench across 10,000 real schemas and six frameworks shows near-universal conformance, with efficiency and coverage varying by framework.

## 5. The summary of the whole lane

One sentence from arXiv:2607.09678, which measured message-format effects across six relay hops, states it better than any synthesis: **"Structure buys a faithful, error-localizing channel — not an error-correcting code."** Its numbers support it: a strong relay is nearly lossless in every format, a 1.5-billion-parameter relay's cross-format spread grows **8.7×**, and in a paired-fork injection an injected wrong value persists to the final hop in **83–100% of chains in every format**.

Reports: [`ab601f5a0087e7fc8`](../../../../../sweep-2026-08/raw/ab601f5a0087e7fc8.md), [`aa5f5baaa66cc8bf1`](../../../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md), [`a1c816c1f7cbcfdf9`](../../../../../sweep-2026-08/raw/a1c816c1f7cbcfdf9.md).
