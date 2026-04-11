# Guy L. Steele Jr.

## What they built
Co-designed Scheme with Gerald Sussman (1975) and wrote the "Lambda papers." Lead author of Common Lisp the Language, the R*RS Scheme reports, the Java Language Specification (with Gosling and Joy), the High Performance Fortran spec, and ECMAScript. Led the Fortress language team at Sun/Oracle Labs (2005–2012). Still at Oracle Labs as a software architect working on programming-language research.

## In their own words

- The opening constraint of "Growing a Language" (OOPSLA 1998 keynote): he set himself the rule that he could use any word of one syllable freely, but any word of more syllables had to be defined first — using only words of one syllable. The talk enacts its own thesis: a language starts small, and the speaker grows it as they go.
- From that talk: "If I want to help other persons to write all sorts of programs, should I design a small programming language or a large one?"
- From the same: "If you want to get far at all with a small language, you must first add to the small language to make a language that is more large." He argues that this growing cannot be the designer's job alone — it has to be the users'.
- On Lisp as the template he keeps coming back to in the talk: in Lisp, "new words defined by the user look like primitives and, what is more, all primitives look like words defined by the user." The seamlessness is what he wants in every language.
- From "How to Think about Parallel Programming: Not!" (Strange Loop 2010, YOW! 2010): accumulators are "bad" because they "encourage sequential dependence and tempt programmers to use non-associative updates." His preferred idiom is divide-and-conquer over associative combiners.
- Same talk, his thesis in one sentence: "It should not be the programmer's job to think about parallelism" — languages should make assignment of tasks to processors as rare a concern as assignment of data to memory.

## Principles as they articulated them
- Design a language so it can be grown by its users, not one that tries to anticipate every need at design time.
- Erase the seam between primitives and user definitions. User-defined words should feel primitive; primitives should feel user-defined.
- Parallelism should be a compiler concern, not a programmer concern. The programmer writes associative combiners; the compiler decides the task graph.
- "Not!" — Steele has a pattern of titles where the punchline is the negation of the premise. Parallel programming: not. The goal of design: not more features, but more growability.
- For specs and standards, exhaustive precision matters. His style in CLtL, R5RS, and JLS is the opposite of his "Growing a Language" style — and he has said the point of growing is to let the exhaustive work be done by users.

## What surprised me in research
- The one-syllable constraint in "Growing a Language" is not a rhetorical flourish — the entire keynote literally holds to it for nearly an hour, and each word he later wants to use (like "define" or "computer") has to be formally introduced first. The form of the talk is the argument.
- Fortress was shut down in 2012 after ~7 years. Steele stayed at Oracle Labs and redirected to foundational work on parallel collections and data-parallel primitives rather than trying to launch another flagship language. A rare example of a language designer willingly walking away from their own language.
- His stance on accumulators directly contradicts common functional-programming pedagogy (fold is usually taught as the universal iterator). Steele's argument: fold looks associative but its sequential shape leaks through whenever the combining operation isn't actually associative.

## Recent or later work
Still at Oracle Labs in Burlington, MA. Since Fortress wound down (2012) his published work has been on parallel execution of functional code, data structures that permit efficient split-and-combine, and the semantics of numeric formats. He serves on ECMA TC39 and continues to contribute to language-standards work. Ongoing conference appearances, including at SPLASH.

## Sources
- https://www.cs.virginia.edu/~evans/cs655/readings/steele.pdf — "Growing a Language" PDF — cs.virginia.edu
- https://homepages.inf.ed.ac.uk/wadler/gj/Documents/steele-oopsla98.pdf — "Growing a Language" alt PDF — ed.ac.uk
- https://catonmat.net/growing-a-language-by-guy-steele — Notes on "Growing a Language" with quotes — catonmat.net
- https://www.infoq.com/presentations/Thinking-Parallel-Programming/ — "How to Think about Parallel Programming: Not!" — infoq.com
- https://github.com/matthiasn/talk-transcripts/blob/master/Steele_Guy/ParallelProg.md — Parallel talk transcript — github.com
- https://www.theregister.com/2012/07/23/oracle_fortress_project_halted/ — "Oracle lowers the flag on Fortress" — theregister.com
- https://en.wikipedia.org/wiki/Guy_L._Steele_Jr. — Wikipedia — wikipedia.org
