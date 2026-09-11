# The monitor

A page that shows a lab's sessions as a story while they run, read from what they leave behind and nothing else: the transcripts the harness writes for every subagent, and the lab's own record, `debrief.md`. It passes nothing through the directing session, so watching costs no context. Built 2026-09-11 during lab 10; a first cut, kept because it worked.

## 1. What it shows

The record leads: where stage one stands, from the debrief, then the rounds with the current one lit. Beneath, one story per session, newest and working first: what the session says in its own words, the brief it hands a fresh head, the report that comes back, and the first paragraph of what it writes, on a timeline, with plain actions collapsed to a muted line between the words. Numbers are one footnote line per session: turns, output, cache, and an input-equivalent cost weighted as the study's accounts weigh it.

Thinking is not shown. The transcripts hold only its signature.

## 2. Running it

```
python3 monitor.py <tasks dir> <lab dir> [port]
```

The tasks directory is where the harness writes subagent transcripts for the directing session, `<scratchpad>/tasks/`; the lab directory is the one holding `debrief.md`. It serves on `http://127.0.0.1:8765` by default and re-reads incrementally every three seconds. Reported spend matches a per-message count of the transcripts; the harness itself shows a session only its remaining budget.

## 3. The making, seen

Open, held 2026-09-11. The split that grades this: what has to be told, and what can be shown. The code is told, and by lab 10 it is nearly told; from there the gains move to what is shown, the surface the substrate is read through and the interface it is worked in. In that pair the human's role is the art direction, which is what a person does for a session in a sentence and cannot be computed, and the tools are what carry it.

The substrate drawn, not the sessions logged. A corpus under the code is a holarchy with links across it, and that is geometry: depth as rings, a brief's size as its area, links as chords. Git holds every state of that shape, so the difference a session made is two drawings laid over each other, and a piece's whole history is a stack of them; the record names the rounds, so the grouping is in the substrate, not inferred. The timeline is one projection and the poorest. Others: the tree with change coloured onto it, a focus view centred on the brief being worked with its neighbours fading by distance, the links alone, cost or attention laid over the shape, and two of these side by side. The drawing obeys the code, whole at a glance, a level down on approach, the text only on arrival, so the picture has a gradient of its own.

Small local models fit here on one condition. The geometry is computed, never generated: a model that may invent a node will. The model chooses and says: which projection, centred where, at what depth; a one-sentence caption for a group of events; the name of a change. Its output is a declaration over a fixed vocabulary of drawing components, the practice's own visuals hypothesis, so coherence is the components' and not asked of the model. The task is regular on both sides, records and headings in, declarations and captions out, and the labs already produce the pairs to tune on.

What grounds it: this monitor, which showed that the transcripts hold a session's words, the briefs it hands out, the reports that return and what it writes, but not its thinking; the practice's visuals section; and the code's fifth section, the making as steps under the gradient, which is what the drawing would show moving. Open: which projection first; whether the radial tree of the corpus with one round's changes coloured in, the cheapest cut, says enough to be worth the components; and what a local model of a few billion parameters can hold of the vocabulary without tuning.
