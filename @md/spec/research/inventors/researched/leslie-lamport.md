# Leslie Lamport

## What they built
Authored the foundational distributed-systems papers: "Time, Clocks, and the Ordering of Events" (1978, logical clocks), "The Byzantine Generals Problem" (1982), and "The Part-Time Parliament" (1998, Paxos). Created LaTeX (1984) as a usable front-end to Donald Knuth's TeX. Designed TLA+ (1990s-), a specification language based on temporal logic of actions for rigorously describing concurrent systems.

## In their own words
- "If you're thinking without writing, you only think you're thinking." (Quanta Magazine, May 2022, "Computing Expert Says Programmers Need More Math.")
- "Very few programmers think in terms of algorithms. When trying to write a concurrent system, if you just code it without having algorithms, there's no way that your program is not going to be full of bugs." (Quanta, 2022.)
- "Programmers and many (if not most) computer scientists are terrified by math." (Quanta, 2022.)
- "The importance of thinking and writing before you code needs to be taught in undergraduate computer science courses and it's not." (Quanta, 2022.)
- "With TLA+, I was able to express them mathematically in a completely rigorous fashion. And everything clicked." (Quanta, 2022.)
- "Being beautiful is not something I would say about an algorithm. But simplicity is something that I value highly." (Quanta, 2022.)

## Principles as they articulated them
- A specification is a state machine described in mathematics, and precedes any code (Changelog podcast #552, 2023).
- Distinction between "coders" (who only write code, expecting readers to understand it by reading the code) and "programmers" (who can describe the behavior of a system without reading its code) (Changelog #552, 2023).
- Concurrency cannot be reasoned about informally — the human mind is reliably defeated by interleavings without mathematical tools.
- Simplicity over beauty; elegance is a by-product of getting the abstraction level right.

## What surprised me in research
- Lamport disavows the framing that TLA+ is his main message. In the 2023 Changelog interview he insists the real message is "thinking outside the box of code" — TLA+ is just one way in. He'd rather have people think mathematically without TLA+ than use TLA+ without thinking mathematically.
- "The Part-Time Parliament" (Paxos) was written as a tongue-in-cheek archaeology paper about a fictional Greek island and was rejected for being too whimsical; it sat unpublished for nearly a decade before Butler Lampson revived it. Lamport later wrote "Paxos Made Simple" (2001) largely out of frustration that the original joke had obscured the algorithm.
- He created LaTeX not as a research contribution but because he needed a better way to format his own papers — a pragmatist's side project that became the lingua franca of scientific publishing.

## Recent or later work
Lamport remains a Distinguished Scientist at Microsoft Research (joined 2001). Work in the 2010s-2020s centers on TLA+ adoption in industry (notably at AWS for S3 and DynamoDB verification), his online TLA+ video course, and a sustained polemic — in interviews with Quanta (2022), Changelog (2023), and The New Stack — that mainstream CS education has failed by teaching coding before teaching thinking. His personal site at lamport.azurewebsites.net hosts annotated versions of nearly every paper, often with commentary revising his earlier views.

## Sources
- https://www.quantamagazine.org/computing-expert-says-programmers-need-more-math-20220517/ — Quanta interview — quantamagazine.org
- https://changelog.com/podcast/552 — Changelog Interviews #552 "Thinking outside the box of code" — changelog.com
- https://thenewstack.io/tla-creator-leslie-lamport-programmers-need-abstractions/ — The New Stack interview — thenewstack.io
- https://lamport.azurewebsites.net/ — Leslie Lamport's personal writings page — lamport.azurewebsites.net
