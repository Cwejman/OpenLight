# Tony Hoare

## What they built
Invented Quicksort (1960) at age 26 while learning Russian in Moscow. Formulated Hoare logic (1969), the axiomatic basis for program verification using preconditions and postconditions. Designed Communicating Sequential Processes (CSP, 1978), the process calculus that influenced Go, Erlang, and Occam. Introduced the null reference in ALGOL W (1965), a decision he later publicly disavowed.

## In their own words
- "I call it my billion-dollar mistake. It was the invention of the null reference in 1965... I couldn't resist the temptation to put in a null reference, simply because it was so easy to implement." (QCon London, "Null References: The Billion Dollar Mistake," 2009.)
- "My goal was to ensure that all use of references should be absolutely safe, with checking performed automatically by the compiler." (QCon 2009 — the original 1965 goal he failed.)
- On the verifying compiler: "The primary purpose of formulating a grand challenge is the advancement of science or engineering... agreed to be valuable and achievable by a team effort within a predicted timescale." (JACM, "The Verifying Compiler: A Grand Challenge for Computing Research," 2003.)
- "The construction and application of a compiler that guarantees correctness of a program before running it" — his framing of the grand challenge (JACM 2003).

## Principles as they articulated them
- "There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies, and the other way is to make it so complicated that there are no obvious deficiencies." (1980 ACM Turing Award Lecture, "The Emperor's Old Clothes.")
- Program correctness is a theorem to be proved, not a property to be tested (Hoare logic, 1969).
- Concurrent computation is best modeled as communication between independent processes, not shared mutable state (CSP, 1978).
- A mature engineering discipline needs long-term "grand challenges" defined by the research community rather than incremental paper-producing goals (2003).

## What surprised me in research
- Hoare's null apology is more specific than usually remembered: he had *designed* a type system intended to make null references impossible, then added null anyway "because it was easy." The billion-dollar mistake was a momentary convenience overriding his own safer design.
- His 2003 Verifying Compiler paper was not a theoretical abstract — he proposed it as a 15-year community project with explicit milestones, at a time when most of the field had abandoned verification as impractical. It helped re-seed interest that eventually produced tools like Dafny, F*, and the current Rust ecosystem.
- Quicksort was invented to solve a practical machine-translation problem (sorting Russian words to look up in a dictionary) on a machine that had to store everything on a drum.

## Recent or later work
Joined Microsoft Research Cambridge in 1999 after retiring from Oxford, remaining active there into his 90s. At MSR he championed the verifying compiler grand challenge and contributed to work on separation logic, Dafny, and unified theories of programming (UTP, with He Jifeng). He continued giving retrospective talks well into the 2010s on CSP, Hoare logic, and null safety. Hoare died in 2024 at age 92; tributes highlighted his unusual trajectory of publicly revising his own decades-old positions.

## Sources
- https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/ — QCon London 2009 talk — infoq.com
- https://www.csl.sri.com/users/shankar/GC04/hoare-compiler.pdf — "The Verifying Compiler: A Grand Challenge" — csl.sri.com
- https://dl.acm.org/doi/10.1145/602382.602403 — JACM 50(1) 2003 paper — dl.acm.org
- https://en.wikipedia.org/wiki/Tony_Hoare — biography — wikipedia.org
