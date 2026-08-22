# Sketches

Mini-projects — small app ideas that live *inside* the compute environment, as programs over the substrate. Everything here is **open**: a sketch is an exploration, not a queued build. Each entry carries its grounding (evidence, prior art) so no later session re-derives it, and its open questions, kept separate. When a sketch graduates it moves to the board; this file keeps only what is still open.

## Cadence reader

**Open — sketch.**

A reading surface with two coupled parts:

1. **Word stream.** Words presented one at a time at a fixed point, each aligned on its optimal recognition point (the letter slightly left of center the eye recognizes words from), Spritz-style. Per-word duration is variable, not metronomic — modulated by length, frequency, predictability (surprisal is computable, even model-computable per chunk).
2. **Grain scrubber.** A persistent horizontal map of the document — position and zoom, like a waveform selector. The reader scrubs at a chosen grain: word, sentence, paragraph, h3 … h1. Jumping back a sentence or replaying a paragraph is the primary regression gesture. At coarse grain the *units of the stream change* — scrubbing at h2 streams headings; skimming becomes reading the same stream at a different altitude, same interaction.

**Grounding.** RSVP is well studied: comprehension matches normal reading up to ~350 wpm, degrades above — inferential comprehension first. The diagnosed cause is not speed but confiscated control: normal readers spend 10–15% of time on regressions, and that fraction is load-bearing ([Schotter, Tran & Rayner 2014](https://www.sciencedirect.com/science/article/abs/pii/S0747563214007663)); the ceiling is cognitive, not oculomotor ([PLOS One](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0153786); [inferential degradation](https://www.academia.edu/56549450/Rapid_serial_visual_presentation_degradation_of_inferential_reading_comprehension_as_a_function_of_speed)). The two additions target RSVP's two documented losses directly: structural scrubbing restores regression at the grain where it is useful (the lost thread, not the missed word), and the map restores spatial memory — RSVP text has no geography; the scrubber gives it one. Related negative result, worth keeping: static per-word salience (Bionic-style bolding, POS coloring) tests null for fluent readers — geometry and *time* are the channels with evidence, not hue ([VSTF trials](http://www.liveink.com/VSTF_ReadingOnline_IRA_2005_Walker.pdf); [Bionic null](https://www.sciencedirect.com/science/article/pii/S0001691824001811)).

**Why here.** Everything hard for a generic reader app — where sentences, paragraphs, and heading levels actually are — is parsing heuristics over flat text. Over the substrate the grain ladder is already structure: chunks in scopes, hierarchy as data. The program queries the waveform; it doesn't infer it. Pacing weights could be a derived layer another program writes.

**Open questions.**

- What is the grain-switch gesture? It must be a continuous axis (scroll, pinch, vertical drag on the scrubber) — a mode toggle kills regression.
- What does the stream show at paragraph grain — first sentence, a derived summary chunk, or the chunk's name?
- Does the pacing layer belong to the reader program or to a separate annotating program whose output any reader consumes?
- Honest ceiling: ~400 wpm with intact comprehension. Is the value speed at all, or navigation — and does the pitch change accordingly?

## Type-mirror integration

**Open — sketch** (author margin note, 2026-08-05: an integration running the *other* way — syncing the field out to the external world).

An integration that, while running, subscribes to the field and **generates TypeScript types over the whole substrate** — every archetype's instance spec as a real TS type, with inference — so a program author (or an agent) writes against the SDK with the field's own contracts checked in the editor.

**Grounding.** The selection arc already leans on this existing: the ol language is TS-expression grammar precisely so that "with generated TS types over the substrate, plans type-check in any editor" ([`spec/research/arc/selection.md`](spec/research/arc/selection.md) §9); sdk.md holds schema-driven TS types as the layer above the tagged encoding. This sketch is that layer realized as an ordinary integration — subscription in, `.d.ts` out — not SDK machinery.

**Open questions.** Regeneration cadence (per commit? debounced?); where the generated module lives (a chunk? a file the VM serves?); naming collisions across attached stores (ownership paths as namespaces is the natural answer); whether the argument-set contracts (`accepts`) also project as call signatures.

## Web-projection integration

**Open — sketch** (author margin note, 2026-08-05).

An integration that scans a website and **projects its pages and URL structure into the field**: the unique-name-within-owner law means one chunk's ownership path *is* the URL — `site.com/docs/api` as a chunk named `api` owned by `docs` owned by the site root. The web's own addressing scheme lands in the field without invention.

**Grounding.** Integrations reference external content rather than store it (substrate.md §Integration); ownership paths give the projection its skeleton for free; staleness is the standing reconcile pattern (source commit vs the live page).

**Open questions.** What the body carries — content snapshot vs pure reference with fetch-on-read; refresh policy and change detection; how deep a crawl goes (a scope-filtered projection?); whether links between pages file as mentions (they are exactly that).

## Rewrite versus edit — an AI-compute sketch

**Open — sketch** (author, 2026-08-07, reflecting on the substrate rewrite).

Rewriting a whole file produces coherent prose; editing paragraph by paragraph produces new claims wearing the old argument's skeleton. But the rewrite has its own failure mode, and it is the more dangerous one: **fact loss and distortion**. Nothing forces the rewriter to carry every settled claim across, and what vanishes vanishes silently — a patch that drops a fact at least shows an empty hunk.

The resolution is a **second cycle whose only job is comparison**: diff old against new, enumerate every claim present before and absent after, and rule each one dropped-on-purpose or lost. Coherence from the rewrite, completeness from the audit — neither pass is asked to do the other's job.

**The interesting part is the economics.** This is two model passes where one is traditionally spent, and the cost difference is unmeasured. If the audit is materially cheaper than the write — a smaller model, a mechanical claim-extraction, a narrower context — then rewrite-then-audit is strictly better than careful editing, and "edit surgically to avoid loss" is a habit inherited from human authoring costs rather than a real constraint. If it is not cheaper, the tradeoff is live.

**Why it belongs here.** It is a sketch about *fashioning AI compute* rather than about the environment — but the environment is where it would be built: passes are programs, the comparison is an expression over two commits, and the dropped-claim list is field content a person rules on. The substrate makes the audit cycle addressable instead of a habit someone has to remember.

**Open questions.** Can "claims present in A, absent in B" be extracted mechanically, or does it need a model? Does the auditor need the rewrite's brief, or is brief-blindness what makes it honest? Is there a grain at which rewrite-scope stops being safe regardless of audit?

## Compounding reflection — revelation as a function of chains

**Open — sketch** (author, 2026-08-07, observed live in the session that produced the substrate rewrite).

A single reasoning chain produces conclusions. A chain that reflects on *another* chain's reasoning produces something neither could reach alone — and when several chains revolve around one steered direction, the capacity for revelation compounds rather than merely accumulating.

**Three instances from one afternoon**, none available to the chain that produced them:

- The steward recommended recomposing from the new file rather than the old, on the grounds that re-absorption was expensive and risky. The author's reflection identified that as an **economic argument wearing quality's clothes** — true only because transcripts evaporate. The steward could not see it because it was reasoning *from inside* the constraint.
- A subagent was briefed to recompose and instead reordered with rewritten seams. Reading the result against the brief showed the **deviation beat the instruction** — the paragraphs' interiors were already coherent, so rewriting them risked loss for no gain.
- Comparing that deviation against the audit requirement produced the actual finding: **near-verbatim preservation is what made the audit conclusive.** Nine line-deltas can be ruled individually; a full recomposition yields an audit nobody can mechanically close. Organic composition and auditable fidelity pull against each other. Neither the brief nor the execution contained this — only their comparison did.

**The condition is the steering.** Chains pointed at different things produce noise. Chains revolving around one direction produce layered scrutiny, each pass seeing the previous pass's blind spot because it stands somewhere else.

**The risk, named so the sketch isn't naive:** reflection compounds error as readily as insight. A chain reflecting on a chain it agrees with produces confident wrongness with a second signature on it. Whether compounding yields revelation or echo probably turns on whether the reflecting pass is **blind to the earlier one's conclusion** — the same question [*Rewrite versus edit*](#rewrite-versus-edit--an-ai-compute-sketch) raises about the auditor.

**Why it belongs to the environment.** Compounding requires the earlier chains to still exist. Today they are transcripts that evaporate, so reflection is bounded by one context window — which is why this afternoon's revelations happened at all only because a human held the thread across them. With turns as substrate ([`horizon.md`](horizon.md), *Turns as substrate*), reflection becomes a read over prior reasoning, and the compounding stops depending on a person remembering.

**Open questions.** Does the sequence converge, saturate, or drift? Is there a chain count past which reflection only re-derives? Does a reflecting pass need the prior pass's *reasoning*, or only its *output*, to stay honest? And can "revolving around the same direction" be made explicit — a steered direction as field content the chains are placed on, rather than an intention held in someone's head?
