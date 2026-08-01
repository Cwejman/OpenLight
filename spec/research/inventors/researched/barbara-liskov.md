# Barbara Liskov

## What they built
Designed CLU (1974-1975), the first language to fully support data abstraction via "clusters," and articulated the behavioral subtyping principle now called the Liskov Substitution Principle. Also contributed the Venus operating system, Argus (distributed computing with guardians/actions), and practical Byzantine fault tolerance (PBFT, with Castro, 1999).

## In their own words
- "There were no GOTOs because I believed Dijkstra." (Turing Lecture, "The Power of Abstraction," 2009 — explaining why CLU had no goto, crediting her choice to Dijkstra's letter rather than her own conviction.)
- "One of the things I deplore or I wish were different is I wish that languages enforced encapsulation." (The Register interview, Sept 2021 — criticizing modern languages for leaving modularity optional.)
- "Encapsulation is the one that makes modularity work." (The Register, 2021.)
- "As soon as you have abstract data types, it becomes absolutely clear that you need generics." (The Register, 2021 — on the historical logic that led CLU to parametric polymorphism years before mainstream languages.)
- "What happened to Java in the '90s with parametric polymorphism was... people really have never quite got their act together." (The Register, 2021.)
- "You never need optimal performance, you need good-enough performance. Programmers are far too hung up with performance." (Turing Lecture, 2009.)

## Principles as they articulated them
- Modularity is managed by dividing programs into pieces with hidden internals and narrow interfaces so each can be reasoned about and replaced independently (Turing Lecture).
- Exception handling must separate error flow from main flow, "otherwise errors show up far from the source" (The Register, 2021).
- Data abstraction — not inheritance — is the core of OOP: "The main thing that CLU had in it was the support for abstract data type. Data abstraction is the most important part of object-oriented programming" (Turing Lecture).
- Subtypes must preserve the behavioral expectations of supertypes (Liskov & Wing, "A Behavioral Notion of Subtyping," 1994).

## What surprised me in research
- Liskov does not claim inheritance as a virtue — she is openly skeptical of implementation inheritance and frames her Turing talk as an argument that OOP's substance is data abstraction, not class hierarchies.
- She explicitly attributes CLU's no-goto design to deference to Dijkstra rather than independent conviction — a rare moment of public intellectual humility from a Turing awardee.
- Her later career (PBFT, 1999, with Castro) is arguably as consequential as CLU for modern systems — it underlies blockchain consensus algorithms — yet is rarely mentioned in capsule bios.

## Recent or later work
Liskov remains an MIT Institute Professor. Her 2010s-2020s work continues on distributed systems and Byzantine fault tolerance derivatives. In 2020 she gave an NSF talk "Reflections on Programming Methodology," and in 2021 gave a long retrospective interview to The Register. She has consistently used these late appearances to argue that modern languages squandered CLU's lessons on encapsulation and generics — a quiet but persistent corrective voice.

## Sources
- https://www.theregister.com/2021/09/16/barbara_liskov_interview/ — "Turing Award winner Barbara Liskov on CLU and why programming is still cool" — theregister.com
- http://www.pmg.csail.mit.edu/~liskov/turing-09-5.pdf — "The Power of Abstraction" (Turing Lecture slides) — pmg.csail.mit.edu
- https://www.infoq.com/presentations/liskov-power-of-abstraction/ — OOPSLA keynote "The Power of Abstraction" — infoq.com
- https://www.nsf.gov/events/barbara-liskov-reflections-programming-methodology/2020-12-17 — NSF event page — nsf.gov
- https://amturing.acm.org/pdf/LiskovTuringTranscript.pdf — ACM Turing Award oral history — amturing.acm.org
