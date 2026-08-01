# Jim Gray

## What they built
Defined the transaction concept and ACID properties while at IBM San Jose in the 1970s (System R era), formalizing how concurrent database operations could be made reliable. Wrote the canonical textbook "Transaction Processing: Concepts and Techniques" (Gray & Reuter, 1992). Coined the "5-minute rule" for caching, originated TPC-style price/performance benchmarks, and led SkyServer and the TerraServer projects applying databases to scientific data. Turing Award 1998.

## In their own words
- "Don't be fooled by the many books on complexity or by the many complex and arcane algorithms you find in this book or elsewhere. Although there are no textbooks on simplicity, simple systems work and complex don't." ("Transaction Processing: Concepts and Techniques," 1992.)
- "The transaction concept derives from contract law. In making a contract, two or more parties negotiate for a while and then make a deal. The deal is made binding by the joint signature of a document or by some other act." (Tandem Technical Report TR 81.3, "The Transaction Concept: Virtues and Limitations," 1981.)
- Framed the "fourth paradigm": after experiment, theory, and simulation, "data-intensive scientific discovery" was emerging as a fourth mode of science driven by an "exaflood" of observational data. (Talk to the NRC Computer Science and Telecommunications Board, January 11, 2007 — weeks before his disappearance; posthumously published in "The Fourth Paradigm," Microsoft Research, 2009.)

Bill Gates on Gray's impact: "The impact of Jim Gray's thinking is continuing to get people to think in a new way about how data and software are redefining what it means to do science." (Microsoft, 2009.)

## Principles as they articulated them
- Price/performance, not raw performance, is the honest benchmark for database systems (his TPC work).
- The transaction is a metaphor borrowed from contract law, and the database community should preserve that metaphor's clarity — ACID is a commitment to behaving like a trustworthy counterparty.
- Science needs its own data-management infrastructure: scientists should not each reinvent databases, and data-intensive workflows deserve first-class tools (the "fourth paradigm" thesis).
- Simplicity beats sophistication in production systems — a recurring theme in his textbook and benchmarking writing.

## What surprised me in research
- Gray's final intellectual move was away from databases per se and toward arguing that databases were becoming the substrate of science itself. His fourth-paradigm talk was delivered to the NRC on January 11, 2007. He disappeared at sea off the Farallon Islands on January 28, 2007 — 17 days later. The talk became, unintentionally, a manifesto.
- The search for Jim Gray used one of the first large-scale crowdsourced satellite-imagery efforts (via Amazon Mechanical Turk and DigitalGlobe) — essentially an ad-hoc exaflood data problem, which is exactly what his final talk had been about. Friends in the field noted the grim symmetry.
- He was a practitioner-theoretician hybrid unusual for Turing awardees: the TPC benchmarks, the 5-minute rule, and his hands-on work on SkyServer for astronomers put him much closer to industry and working scientists than most of his peers.

## Recent or later work
Gray joined Microsoft Research in 1995 and founded the Bay Area Research Center (BARC). From roughly 2000 onward he turned increasingly toward eScience collaborations — SkyServer/SDSS with astronomers, TerraServer with the USGS, and work with oceanographers and biologists — pioneering what he would later call the fourth paradigm. He was declared lost at sea on January 28, 2007; no wreckage or remains were ever found. His legacy is memorialized by the annual Jim Gray eScience Award (Microsoft Research) and the Jim Gray Systems Lab at UW-Madison (Microsoft-funded). "The Fourth Paradigm" (2009), edited by Tony Hey, Stewart Tansley, and Kristin Tolle, was published posthumously to carry forward his final thesis.

## Sources
- https://www.microsoft.com/en-us/research/publication/fourth-paradigm-data-intensive-scientific-discovery/ — "The Fourth Paradigm" book — microsoft.com
- https://jimgray.azurewebsites.net/papers/thetransactionconcept.pdf — "The Transaction Concept: Virtues and Limitations" (Tandem TR 81.3) — jimgray.azurewebsites.net
- https://wavetrain.net/2009/12/15/the-mystery-of-jim-gray/ — "The Mystery of Jim Gray" — wavetrain.net
- https://www.microsoft.com/en-us/research/people/gray/ — Jim Gray at Microsoft Research — microsoft.com
- https://arxiv.org/pdf/cs/0701162 — "A Measure of Transaction Processing 20 Years Later" — arxiv.org
