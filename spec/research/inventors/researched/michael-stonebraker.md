# Michael Stonebraker

## What they built
Co-designed **Ingres** (UC Berkeley, 1970s) and **Postgres** (Berkeley, 1980s) — the academic lineages behind nearly every modern relational database. Later founded or co-founded **Illustra, Cohera, StreamBase, Vertica, VoltDB, SciDB, Tamr, and DBOS**. 2014 ACM A.M. Turing Award laureate. Famous for periodically writing papers arguing his own prior architecture is obsolete.

## In their own words

- "The last 25 years of commercial DBMS development can be summed up in a single phrase: 'One size fits all'." — *"One Size Fits All": An Idea Whose Time Has Come and Gone*, ICDE 2005
- "Ingres was always technically better and Postgres was practically better. It's more flexible, and it's open source... closed source databases are not the wave of the future and I think Oracle is highly priced and not very flexible." — The Register, Dec 2023
- "When MySQL was bought by Oracle, developers got suspicious in droves, and defected to PostgreSQL. It was another happy accident." — The Register, 2023
- On DBOS: "Basically, the operating system is an application to the database, rather than the other way around." — The Register, 2023
- "I would have a hard time picking one of these four systems as the most satisfying; it's like asking which of my children I love the most." — on his major systems
- "I can't imagine playing golf three days a week. I like what I do, and I will do it as long as I can be intellectually competitive." — The Register, 2023 (he was ~80)

## Principles as they articulated them

- **No single DBMS architecture can win.** The market will (and should) fracture into specialized engines — column stores for analytics, main-memory for OLTP, array stores for science, stream processors for events — possibly sharing a front-end parser but not a storage engine.
- **Row stores are the wrong default for analytics.** His C-Store / Vertica work argued column orientation is 10–100× faster for read-mostly workloads; the industry eventually agreed.
- **Main memory changes everything.** H-Store / VoltDB: if your working set fits in RAM, the legacy OLTP architecture (buffer pools, locking, WAL) is mostly overhead. Strip it.
- **Open source wins the long game.** He has consistently argued closed-source databases are structurally doomed and repeatedly released his research systems under permissive licenses.
- **Kill your own darlings.** He has publicly argued each of his own systems is obsolete once the next one is ready — a posture more typical of a researcher than a founder.

## What surprised me in research

- Stonebraker is arguably **the only founder who has systematically argued against his own previous products in print**. The "One Size Fits All" papers (2005, 2007) directly attack the universal-DBMS premise that his own Postgres helped establish. This self-revision is the pattern of his career, not an exception.
- Postgres's survival is, by his telling, a **happy accident**: he treats the MySQL/Oracle acquisition as the real cause of Postgres dominance — a developer flight, not an architectural victory. He is unsentimental about it.
- His current project **DBOS** inverts a 50-year assumption: instead of the database being an application running on the OS, the OS runs on top of the database. Application state, scheduler state, file metadata — all become tables in a distributed DBMS. It is a genuine architectural provocation from someone who could easily be retired.
- In the 2023 Register interview he was still working full-time at ~80, explicitly because he cannot stomach the idea of not being "intellectually competitive." This is the dominant note in his recent public appearances.
- The famous metaphor is children, not killing — "it's like asking which of my children I love the most" — but the pattern looks like serial obsolescence from the outside.

## Recent or later work

- **DBOS (2022–present):** co-founded with Matei Zaharia and others. Commercialized as DBOS Inc. The underlying research paper ("DBOS: A DBMS-oriented Operating System," VLDB 2022) argues for a full OS-as-database rearchitecture.
- **Tamr (2013–present):** data integration/unification at scale; one of his few non-engine companies, attacking the "dirty data" problem.
- Continues to co-teach and publish at MIT CSAIL. Received the ACM SIGMOD Systems Award and the 2014 Turing Award for "fundamental contributions to the concepts and practices underlying modern database systems."
- ACM published *Making Databases Work: The Pragmatic Wisdom of Michael Stonebraker* (2018) — a Festschrift collecting his key papers and commentary.

## Sources

- https://amturing.acm.org/award_winners/stonebraker_1172121.cfm — Michael Stonebraker, A.M. Turing Award Laureate — amturing.acm.org
- https://cs.brown.edu/~ugur/fits_all.pdf — "One Size Fits All": An Idea Whose Time Has Come and Gone — cs.brown.edu
- https://www.theregister.com/2023/12/26/michael_stonebraker_feature — Postgres pioneer promises to upend the database once more — theregister.com
- https://thenewstack.io/dr-michael-stonebraker-a-short-history-of-database-systems/ — A Short History of Database Systems — thenewstack.io
- https://dl.acm.org/doi/book/10.1145/3226595 — Making Databases Work (ACM Books, 2018) — dl.acm.org
- https://www.dbos.dev/ — DBOS — dbos.dev
