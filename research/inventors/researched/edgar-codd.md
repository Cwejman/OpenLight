# Edgar Codd

## What they built
Invented the relational model of data ("A Relational Model of Data for Large Shared Data Banks," CACM 1970), founding the theoretical basis for nearly all modern database systems. Defined normalization (1NF, 2NF, 3NF, then Boyce-Codd Normal Form). Later proposed twelve rules for relational databases (1985) and twelve rules for OLAP (1993). Designed a relational query language, Alpha, based on tuple relational calculus — which IBM declined to implement in favor of SEQUEL/SQL.

## In their own words
Codd left relatively few interview-style quotes; his positions come through in papers. Representative published positions:
- The 1970 paper's opening thesis: "Future users of large data banks must be protected from having to know how the data is organized in the machine." (CACM, June 1970.)
- On SQL's failures: Codd titled his critique "Fatal Flaws in SQL" (Datamation, August and September 1988), arguing SQL violated his relational model — specifically citing the lack of enforced uniqueness and unclean handling of nulls.
- On vendor misuse of the term "relational": Codd published his "12 Rules" (ComputerWorld, October 1985) precisely to give customers a checklist to "prevent the term from being misused by database vendors who had merely added a relational veneer to older technology."
- He coined the term OLAP in 1993 in "Providing OLAP to User-Analysts: An IT Mandate" (with S.B. Codd and C.T. Salley).

I couldn't locate a rich body of direct Codd interview quotes comparable to Liskov or Lamport; this is itself a finding. His voice survives mainly through dense technical papers.

## Principles as they articulated them
- Physical and logical data independence: users and applications should never depend on storage layout.
- A database language should be based on a formal calculus (relational calculus or algebra), not on ad hoc syntactic constructs — his persistent objection to SQL.
- "Relational" is a technical term with a precise meaning and should not be diluted (the 12 Rules, 1985).
- Analytical querying (OLAP) is a categorically different workload from transactional querying and deserves its own architecture and rules (1993).

## What surprised me in research
- IBM institutionally sidelined Codd from its own System R project in the 1970s — the very implementation of his model. The System R team was encouraged to build SEQUEL without him, partly because his insistence on Alpha was seen as impractical. Larry Ellison then read the SEQUEL papers and built Oracle on them, which is how SQL won.
- The 1993 OLAP "12 Rules" paper was withdrawn by ComputerWorld after it emerged that Arbor Software (later Hyperion, then Oracle) had sponsored Codd's paper without disclosure — a conflict-of-interest scandal that badly damaged his credibility in his final productive decade.
- Codd effectively lost the political battle for his own invention twice: first at IBM (SQL vs. Alpha), then in the 1990s (the OLAP sponsorship controversy). The relational model triumphed; its author did not.

## Recent or later work
Codd's health declined in the 1990s and he ceased active work. He left IBM in 1984, founded a consulting firm with Chris Date and Sharon Weinberg, and spent his final decade campaigning — largely unsuccessfully — for stricter fidelity to his model and against SQL's dominance. He died of heart failure in 2003 at age 79. His legacy is paradoxical: the technology he created powers trillions of dollars of infrastructure while the specific language he wanted (Alpha) was never adopted, and the critique he wrote ("Fatal Flaws in SQL") is read today mostly as historical curiosity rather than as guidance.

## Sources
- https://en.wikipedia.org/wiki/Edgar_F._Codd — biography with the Arbor/OLAP controversy details — wikipedia.org
- https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf — original 1970 CACM paper — seas.upenn.edu
- https://olap.com/learn-bi-olap/codds-paper/ — 12 Rules for RDBMS — olap.com
- https://twobithistory.org/2017/12/29/codd-relational-model.html — "Important Papers: Codd and the Relational Model" — twobithistory.org
