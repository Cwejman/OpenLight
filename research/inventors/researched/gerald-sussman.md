# Gerald Jay Sussman

## What they built
Panasonic Professor of EECS at MIT. Co-designed Scheme with Guy Steele (1975). Co-author with Hal Abelson of *Structure and Interpretation of Computer Programs* (SICP, 1984), the long-running 6.001 textbook that shaped a generation of CS education. Co-author of *Structure and Interpretation of Classical Mechanics* (SICM) and, with Chris Hanson, the 2021 book *Software Design for Flexibility*. Designed digital systems including the MIT Scheme-79 chip and contributed to the early AI lab's robotics work.

## In their own words

- The title of his 2011 Strange Loop keynote is itself the thesis: "We Really Don't Know How to Compute!" The abstract (InfoQ's page) frames it this way: Sussman compares our computational skills with the genome and concludes we are "way behind" in creating complex systems such as living organisms. The core move of the talk is that biology constructs systems whose robustness dwarfs anything we build, and our notation for computation is nowhere near rich enough to express such systems.
- On why 6.001 was replaced (reported by Chas Emerick, paraphrased with Sussman's permission — Sussman said "Sure, as long as you paraphrase me accurately"): in 1980 good engineers produced "spare code that they thought should work, with code running close to the metal." Modern programming, by his account, is "doing basic science on your libraries to see how they work" — a fundamentally different job that needs a different course.
- From the same conversation, when asked whether the shift makes SICP's themes less relevant, his answer was "an emphatic no" — the core ideas matter as much as they ever did, just not as a first exposure.
- From "The Art of the Propagator" (Radul and Sussman, MIT CSAIL, 2009): he argues for a computation model where "basic computational elements are autonomous machines interconnected by shared cells through which they communicate." This is explicitly a departure from the expression-evaluation model that Scheme and SICP use.
- The premise of *Software Design for Flexibility* (MIT Press, 2021, with Chris Hanson): he opens by asking why small changes to requirements force disproportionate rewrites, and argues the answer is that "we" (computer scientists) have not yet learned the design moves biology uses — combinators, independent annotation layers, unification, propagation, domain-independent control.

## Principles as they articulated them
- Build flexible systems, not minimal ones. A system that does one thing cleanly but cannot accommodate a small change in requirements has failed at something important.
- Separate control from domain. Propagator networks do this by having cells hold partial information and propagators supply domain rules — control emerges from the network, not from a driver loop.
- Augment, don't replace. Independent annotation layers (units, provenance, dependency) should attach to values without complicating the basic computation.
- Biology is the benchmark. The human body rearranges itself constantly while continuing to work; our programs cannot add a field without a migration. The gap is instructive, not decorative.
- Teach thinking, not tools. His defense of SICP's ideas even after 6.001 moved to Python: the core ideas are unchanged; they just can't be the *first* thing a modern student meets.

## What surprised me in research
- His account of why 6.001 was dropped is not about Python being better. It's that the nature of programming changed: modern work is more archaeological than constructive. The course switched because the *world* it was teaching no longer exists for most practitioners, not because the textbook was wrong.
- His 2009 propagator work and the 2021 *Software Design for Flexibility* are a sustained public self-revision of the SICP worldview. SICP is about evaluation; propagators are about constraint and information flow, which is a different computational metaphor. He has never disavowed SICP, but his later work quietly moves the center of gravity.
- He's still actively publishing and lecturing in his 70s — not as a historical figure, but proposing that the current way of computing is fundamentally premature.

## Recent or later work
*Software Design for Flexibility* (Hanson & Sussman, MIT Press, 2021), using Scheme throughout. Continued work on propagator networks and the scmutils / SICM computational physics infrastructure. Active lecturing at MIT; ongoing public talks on why current systems are brittle and what "robustness" should actually mean structurally.

## Sources
- https://www.infoq.com/presentations/We-Really-Dont-Know-How-To-Compute/ — "We Really Don't Know How to Compute!" talk page — infoq.com
- https://thestrangeloop.com/2011/we-really-dont-know-how-to-compute.html — Strange Loop 2011 abstract — thestrangeloop.com
- https://cemerick.com/blog/2009/03/24/why-mit-now-uses-python-instead-of-scheme-for-its-undergraduate-cs-program.html — Sussman on 6.001 switch — cemerick.com
- https://mirror.csclub.uwaterloo.ca/csclub/sussman-propagator-slides.pdf — "The Art of the Propagator" slides — uwaterloo.ca
- https://dspace.mit.edu/handle/1721.1/44215 — "The Art of the Propagator" technical report — dspace.mit.edu
- https://www.penguinrandomhouse.com/books/669475/software-design-for-flexibility-by-chris-hanson-and-gerald-jay-sussman/ — Software Design for Flexibility — penguinrandomhouse.com
- https://wozniak.ca/blog/2022/03/01/1/index.html — Software Design for Flexibility review — wozniak.ca
