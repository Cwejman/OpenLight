# The sweep's findings

*Research register: structured, uncommitted. Derived 2026-08-28 from all 45 raw reports, read whole in one session, written under [the code](../../knowledge/code.md) — and the first structure built under it, so its shape is itself an experiment the code's *Open* section is waiting on.*

The sweep of 2026-08-26 sent agents across every territory night's claims touch. What came back is ~150k tokens of raw reports — checkable, but not readable as ground. This directory is that reading: the findings folded by subject, so that a decision in the specs or in the code can stand on what the world actually established, at the confidence it actually established it.

Each file is a fold: it opens with what it settles, reads complete on its own, and ends with what could not be established. Confidence is carried in the sentences — "one study, N=17" and "vendor-claimed" mean exactly that — and every fold closes with a sources line into [`../raw/`](../raw/), where the unedited reports keep the leads, the negative findings, and the precise numbers.

## The map

**Where the thesis stands** — for anyone weighing night's claim against the world:

- [`thesis.md`](thesis.md) — nobody argues the whole thesis; who holds which pieces, the strongest opposition, and the defensible restatement the evidence supports.

**The mechanism** — for spec decisions in the substrate, engine, and view:

- [`structure.md`](structure.md) — typed structure vs text for models: where structure demonstrably pays, where prose wins, and the decision rule that separates them.

- [`context.md`](context.md) — the monolith claim fact-checked: which half shipped products have overtaken, which half remains night's ground; the science of context degradation and retrieval.

- [`substrate.md`](substrate.md) — what shipped systems teach about versioned typed stores: the prior art, the schema-evolution law everyone independently landed on, and where night's combination is genuinely unoccupied.

- [`permissions.md`](permissions.md) — the strongest one-directional evidence in the sweep: transitive permission is a documented failure, and what "uniform filtering" can defensibly claim.

- [`interface.md`](interface.md) — the component-bid vacancy, what server-driven UI at scale learned the expensive way, and the market's verdict on derived interfaces.

**The knowledge angle** — for the code and its proof:

- [`reading.md`](reading.md) — the cognitive-science floor under the code's laws: what holds, what is corrected, what has no evidence either way.

- [`rationale.md`](rationale.md) — recording *why*: capture fails structurally, measured benefit is thin, and the one new exception is rationale as machine context.

- [`travel.md`](travel.md) — does insight travel: the grounded core of the code's opening claim, and the ceiling every documentation project must sit with.

- [`practice.md`](practice.md) — the documentation field's own methods graded: Diátaxis, minimalism, structured authoring, and the agent turn in serving docs.

**Hygiene** — for anyone writing or citing:

- [`folklore.md`](folklore.md) — the kill-list: numbers that circulate as fact and must not be cited, each with its correction.

- [`field.md`](field.md) — the state of the surrounding ecosystem: consolidations, pivots, and the timing ground under the pilot's bets.

## Cautions carried from the sweep

Most agents exhausted their web-search budgets and fell back to direct fetches, which over-samples sources with machine-readable endpoints (arXiv, GitHub, W3C, vendor APIs) and under-samples blogs, paywalled venues, and everything non-English. **An absence claimed in these folds is weaker than a presence.** And two agents independently caught automated summarisers fabricating verbatim quotations and sample sizes — one invented "N=22, 10 companies" for a study whose real figures are 271 observations across 8 firms — so a figure here is worth what its report's own verification note says, no more. Where a fold repeats a number, the raw report's verification status travels with it.

## Coverage

All 45 files in `raw/` are folded. One discrepancy: the sweep README's named-runs table lists `a26e3386afa704453` ("information architecture, first run") and no such file exists in `raw/` — either lost or a mistyped id; its subject is covered by the revised run ([`ae8fc467393dd0407`](../raw/ae8fc467393dd0407.md)), so the loss is likely small, but the coverage claim is qualified by it.

Not folded, deliberately: the per-report leads lists (they live in raw, and are leads, not findings); run-level method notes beyond the two cautions above; market financial detail beyond what grounds a decision (raw keeps it); and the sister-study coverage map ([`a583337921a4f7975`](../raw/a583337921a4f7975.md)), which describes the pre-rebuild code and the hjulverkstan chart — superseded as framing by the current [`code.md`](../../knowledge/code.md), consult it only for the chart's open-question list.
