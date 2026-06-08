# Rich Hickey — Talk Transcripts

Raw transcripts of Rich Hickey's design-philosophy talks, gathered as reference depth. The purpose is distillation: boil the transferable wisdom here down into [`../../conventions.md`](../../conventions.md). These files are the source material, not the synthesis — read them for what they argue, then carry the load-bearing parts into conventions in our own words.

Hickey earns a place here for the same reason he has a portrait in [`../inventors/researched/rich-hickey.md`](../inventors/researched/rich-hickey.md): his talks are sustained arguments about *design as a discipline distinct from implementation* — simplicity, values over places, doing the hard thinking before typing, how systems change over time. That is precisely the register `inside.md` works in (uncovered-not-invented, simplicity-is-natural, lossless, transparency of relationships), so the resonance is worth tracing carefully — including where he would push back on us.

## Scope of the gather

Curated to the talks that carry **general design wisdom**. Deliberately skipped: the Clojure/Datomic internals talks (transducers, persistent data structures, core.async, reducers, the database-deconstruction talks) — excellent, but their lessons are implementation-specific rather than transferable to a substrate's conventions. If a distillation pass later needs them, they are in the source repo.

## The talks

| File | Talk | Venue / Year | What it carries |
| --- | --- | --- | --- |
| [`simple-made-easy.md`](simple-made-easy.md) | Simple Made Easy | Strange Loop 2011 | The keystone. Simple (un-braided, one fold) vs easy (near to hand). "Complect" = to braid together wrongly. Develop sensibilities around entanglement. |
| [`value-of-values.md`](value-of-values.md) | The Value of Values | JaxConf 2012 | Values vs places. Immutability as the default. A value is independent of time; place-oriented programming is a historical artifact of scarce memory. |
| [`hammock-driven-development.md`](hammock-driven-development.md) | Hammock Driven Development | Clojure/Conj 2010 | Do the design thinking before typing. Most problems are solved by understanding, not by coding. Feed the background mind; wait for it. |
| [`design-composition-performance.md`](design-composition-performance.md) | Design, Composition and Performance | Clojure/West 2013 | Design *is* taking things apart so they can be composed. Drawing on music — separating into independent things that combine without entangling. |
| [`effective-programs.md`](effective-programs.md) | Effective Programs (10 Years of Clojure) | Clojure/Conj 2017 | Programs are situated in the world; information is plain data; the costs of complecting language with the problem. A retrospective on what mattered. |
| [`are-we-there-yet.md`](are-we-there-yet.md) | Are We There Yet? | JVM Language Summit 2009 | State, identity, value, and time pulled apart. The conflation of identity with its current value is the root confusion. Foundational to the value/place argument. |
| [`language-of-the-system.md`](language-of-the-system.md) | The Language of the System | Clojure/Conj 2012 | Systems (independent components over time) vs programs. Values on the wire; communication over method calls; the system has no single language. |
| [`spec-ulation.md`](spec-ulation.md) | Spec-ulation | Clojure/Conj 2016 | How software changes. Accretion / relaxation / fixation vs breakage. "Don't break things." Growth without breakage — directly relevant to a substrate that must compound losslessly. |
| [`maybe-not.md`](maybe-not.md) | Maybe Not | Clojure/Conj 2018 | Optionality is context-dependent. Schemas describe what an *operation* requires, not a permanent property of a value. A direct self-revision of the spec community's static-typing enthusiasm. |
| [`simplicity-matters.md`](simplicity-matters.md) | Simplicity Matters | RailsConf 2012 | A tighter restatement of the Simple Made Easy thesis for a different audience. Useful for the crispest phrasings. |

## Reading note

Honest weight (per `inside.md`): the resonance with Hickey is real, but he is an outside-in engineer in temperament — values derived *from* hard implementation experience, not asserted ahead of it. Several of his positions (e.g. distrust of bespoke abstraction, insistence on plain data over rich identity-bearing structures) sit in tension with parts of our vision. Distill the wisdom; do not flatten the disagreements. The contrast is as useful as the agreement.

## Source

All transcripts from the community repo [`matthiasn/talk-transcripts`](https://github.com/matthiasn/talk-transcripts/tree/master/Hickey_Rich). The `-mostly-text` variants (slide markers stripped) were preferred where available; `spec-ulation.md` and `maybe-not.md` retain inline `slide:` markers because only the full transcript exists upstream. Each file's header carries the original venue, date, and video link.
