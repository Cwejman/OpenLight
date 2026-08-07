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

**Open questions.** Regeneration cadence (per commit? debounced?); where the generated module lives (a chunk? a file the VM serves?); naming collisions across mounts (ownership paths as namespaces is the natural answer); whether the argument-set contracts (`accepts`) also project as call signatures.

## Web-projection integration

**Open — sketch** (author margin note, 2026-08-05).

An integration that scans a website and **projects its pages and URL structure into the field**: the unique-name-within-owner law means one chunk's ownership path *is* the URL — `site.com/docs/api` as a chunk named `api` owned by `docs` owned by the site root. The web's own addressing scheme lands in the field without invention.

**Grounding.** Integrations reference external content rather than store it (substrate.md §Integration); ownership paths give the projection its skeleton for free; staleness is the standing reconcile pattern (source commit vs the live page).

**Open questions.** What the body carries — content snapshot vs pure reference with fetch-on-read; refresh policy and change detection; how deep a crawl goes (a scope-filtered projection?); whether links between pages file as mentions (they are exactly that).
