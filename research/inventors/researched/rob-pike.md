# Rob Pike

## What they built
Co-designer of Plan 9 and Inferno at Bell Labs, co-author of *The Unix Programming Environment* (with Kernighan) and *The Practice of Programming*. Co-invented UTF-8 with Ken Thompson in 1992. Co-designed Go at Google (2007-09) with Thompson and Robert Griesemer. Created earlier window systems (`mux`, `8½`, `rio`) and the Sawzall log-processing DSL.

## In their own words
- "Systems software research is irrelevant." — Utah talk, February 2000. His polemic about the ossification of OS research. When asked in 2004 if he still believed it, he noted: "I was very careful to define my terms in that talk (it was never a paper)… the fundamental design of Unix is older than many of the readers of Slashdot, while lots of different, great ideas about computing and networks have been developed in the last 30 years."
- "Simplicity is better than complexity. Simpler things are easier to understand, easier to build, easier to debug, and easier to maintain. Easier to understand is the most important, because it leads to the others." — *command center* blog, December 2023.
- "Complexity is multiplicative." — same post. And: "Complex systems are NEVER fast — they have more pieces and their interactions are too poorly understood to make them fast."
- "Simplicity has never been on that list [of engineering priorities]. But here's the thing: Simplicity is more important than any of them." — same post.
- "If we don't bring the complexity under control, one day… things will get so complex, so slow, they'll just grind to a halt." — same post.
- On Go's house rule: a feature was only in if all three designers agreed. Pike's framing in many talks: Go was built to replace C++ in Google's server code — not to win language debates.

## Principles as they articulated them
- Simplicity is an active property that has to be defended against entropy; it is not the absence of effort, it is where most of the effort goes.
- Orthogonal primitives over ornamental features; clear composition over "expressive" overloading.
- Performance follows from simplicity, not the other way around.
- Measure before you optimise; and, with Kernighan, "debugging is twice as hard as writing the code in the first place."
- Research matters when it is willing to discard existing systems rather than instrument them.

## What surprised me in research
- The 2023 "Simplicity" post is surprisingly fierce — it reads less like a Go apologia and more like an alarm about industrial software broadly, framed around a "Utilization Code Red" metaphor.
- Pike's November 2023 GopherCon Australia keynote ("What We Got Right, What We Got Wrong") explicitly listed delayed generics as a mistake — a specific, self-critical admission that doesn't match the caricature of Pike as dismissive of features.
- He has been thinking publicly about GenAI as "the collision of simplicity and complexity" — not cheerleading, not refusing; treating it as the latest front in the same fight.

## Recent or later work
Still at Google. Active on his `command center` blog and on Mastodon (@robpike@hachyderm.io). Continues to speak at Go conferences and contributes to the language. Not retired, not fully silent, but his main public work now is essays and talks rather than new systems.

## Sources
- https://commandcenter.blogspot.com/2023/12/simplicity.html — Simplicity — commandcenter.blogspot.com
- http://herpolhode.com/rob/utah2000.pdf — Systems Software Research is Irrelevant (2000) — herpolhode.com
- https://interviews.slashdot.org/story/04/10/18/1153211/rob-pike-responds — Rob Pike Responds — slashdot.org
- https://evrone.com/blog/rob-pike-interview — Rob Pike interview: "Go has become the language of cloud infrastructure" — evrone.com
- https://en.wikipedia.org/wiki/Rob_Pike — Rob Pike — wikipedia.org
