# Structure vs text, for models

Night's substrate and the code both stand on a bet: that typed structure serves models better than pasted text. The sweep put that bet through an adversarial stress-test and a pile of 2026 experiments, and the result is not a win or a loss but a line — **structure demonstrably pays on the edges of knowledge and demonstrably fails as its body**. This fold states the line, the rule for finding it, and the nulls that bound it.

## The verdict

Every winning 2026 system types the *edges* — identity, permission, provenance, freshness, address, action space — and leaves the *body* as prose or code. Every loser typed the body. The restatement that survives: **type the edges, keep the vocabulary tiny and declared, leave the content as text.**

MCP's own 2026 evolution is the cleanest proof: the July revision deleted the conversational layer (sessions, handshake, server-initiated requests) and simultaneously *hardened* the typed layer beneath — mandatory discovery, typed results, required cache metadata, deterministic ordering for prompt-cache hits. The protocol stopped trying to be the model's conversation and became a typed, addressable capability layer. It moved down a stack level and got more typed on the way.

## Inferred types are poison; declared types win

The sharpest 2026 result: a model reconstructing schema metadata scores 0.22 accuracy when it must answer everything, 0.475 on the 42% a deterministic gate lets it commit to — "the deterministic layer is a competence detector, not a competence amplifier." Frontier models produce **0% valid output on a 369-field schema**; value accuracy hides behind near-perfect *format* compliance (83% text, 24% audio). The consequence is structural: **a typed store with wrong types is worse than prose, because a wrong type returns a confident answer while incomplete prose returns a visibly incomplete one.** Prose degrades gracefully; a type does not.

Declared vocabularies, by contrast, win repeatedly: 13 predefined memory categories beat graph-extraction memory systems; a 15-operation typed DSL beats both free-form SQL and heavy pipelines; a governed semantic layer took enterprise text-to-SQL from 55% to 97% (the authors decline the causal claim — the win is the curated layer, not the compiler). And the open web's own data agrees: schema.org holds 958 types, of which 12 reach mass deployment — a small closed vocabulary is what usage converges on anyway ([`substrate.md`](substrate.md) carries the vocabulary-concentration evidence).

Two operational corollaries, each independently supported: **abstention must be code-enforced** (prompt-requested abstention did not transfer across models; the code-enforced gate produced zero no-evidence answers on every backbone), and **the hard gate overrides everything: if a type would have to be inferred rather than observed or declared, do not type it.**

## The decision rule

Structure wins if any of five is true; prose wins otherwise:

1. **Enforcement before generation** — the rule must hold even when the model is wrong or attacked (authorization, budgets, caps). A checker in the prompt is not a checker.

2. **Set operations** — intersect, count, "all items where". Prose retrieval answers "find me one"; it cannot answer "how many" without reading everything.

3. **Multiple writers, no coordinator** — merge, conflict, and freshness need claim identity.

4. **Answerable later by someone who wasn't there** — provenance, attribution, audit.

5. **Cost proportional to catalog size** — progressive disclosure requires an index.

The asymmetry behind the rule: **scaling dissolves the problems of reading — format preferences, schema compliance, chunking for small windows — and never touches the problems of writing, committing, and being accountable.** Betting structure on model-reading deficits is betting against the trend line; betting it on write-side guarantees is not. The best one-line summary in the literature: "structure buys a faithful, error-localizing channel — not an error-correcting code."

## The nulls that bound it

The docs-for-agents evidence splits exactly along this line:

- **Prose repo context files don't move task success.** Two independent studies agree on the null: AGENTS.md-style files "do not generally improve task success rates, while increasing inference cost by over 20%" (ETH group; agents *followed* the instructions — repository overviews simply didn't help), corroborated by a low-power 288-run ablation. Meanwhile adoption is enormous (~846k files by one count) — the widest adoption and the clearest null in the same object.

- **Machine-facing descriptions do.** Augmenting MCP tool descriptions: +5.85pp median task success (at real cost, with regressions); standard-compliant descriptions raise tool selection from 20% to 72%, experimentally.

- **When guidance helps, the mechanism is localisation, not comprehension.** The one positive repo-guidance result got its gain entirely from agents reaching the right files (+14.5pp coverage) with patch quality flat. And with localisation held fixed by an oracle, natural-language summaries answer 4/45 behavioural questions where source answers 27/45 — a property of the representation, not the summariser (frontier and 3B summaries scored identically).

- **A methodological floor under all of it:** temperature-0 inference flips ~9% of per-instance outcomes between byte-identical SWE-bench runs. Single-run ablations claiming a few points from documentation are unfalsifiable.

- **Skills: adoption is not efficacy.** The one controlled benchmark found target-skill injection *lowering* pass rates 1.3–4.2% at 72–394% more tokens; and across 105 release transitions, every one invalidated part of the skill set — structure rots silently while text rots loudly. Staleness is answerable only by content-binding (revalidate when the hash moves), which is itself a typed field no model capability substitutes for.

## The comprehension objection, relocated

The Dynamicland-shaped objection ([`thesis.md`](thesis.md) states it) applies to structure as *authoring tax* — where the person paying formalization cost is not the one receiving the benefit; that failure is real and thirty years documented ([`rationale.md`](rationale.md) carries it). It does not apply to structure as *inspection surface*: decomposing agent execution into auditable typed actions improved users' comprehension and error detection (N=16, within-subjects); legibility protocols improve safety with gains that grow as monitors strengthen; a code-health metric calibrated for humans predicts semantic preservation under AI refactoring. Structure costs agency at authoring time and buys agency at decision time — night's design should keep the two placements distinct.

## Not established

The crux experiment does not exist: no head-to-head of LLM-assisted, human-*declared* structure against a well-written prose document, same corpus, same frontier reader. Every positive above beats extracted or unstructured baselines, never good prose. Also unestablished: any evidence that typed *input* beats prose on frontier models (the measured format effects shrink with capability — the case for typed context rests on selection, provenance, and enforcement, not on parsing).

---

*Sources: [`aa5f5baaa66cc8bf1`](../../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md) (the stress-test: verdict, decision rule, folklore audit on both sides) · [`ab601f5a0087e7fc8`](../../../../sweep-2026-08/raw/ab601f5a0087e7fc8.md) and [`af750ce80e754223b`](../../../../sweep-2026-08/raw/af750ce80e754223b.md) (the docs-for-agents nulls, the localisation mechanism, the noise floor) · [`a5e1231b95c4c9ac5`](../../../../sweep-2026-08/raw/a5e1231b95c4c9ac5.md) (the schemas-matter/prose-doesn't through-line).*
