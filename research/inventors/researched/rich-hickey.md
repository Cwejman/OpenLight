# Rich Hickey

## What they built
Created Clojure in 2007 — a Lisp for the JVM (and later ClojureScript and Clojure CLR) — after a self-funded, multi-year sabbatical. Co-founded Cognitect, which built Datomic, an immutable time-aware database. Cognitect was acquired by Nubank in 2020; he remained as a Distinguished Engineer until his retirement in August 2023.

## In their own words

- On complexity, from "Simple Made Easy" (Strange Loop 2011): "Complect means to interleave, to entwine, to braid. Complect means to braid together. Compose means to place together." He made the word the center of the talk so the audience would have a handle on what they were trying to avoid.
- Also from "Simple Made Easy": "You have to start developing sensibilities around entanglement. You want to start seeing complecting. You want to start seeing interconnections between things that could be independent."
- "Having state in your program is never simple because it has a fundamental complecting that goes on... It complects value and time. You don't have the ability to get a value independent of time." — Simple Made Easy, 2011.
- On his 2023 retirement announcement on clojure.org: "I announce today my (long planned) retirement from commercial software development, and my employment at Nubank." He added: "Retirement returns me to the freedom and independence I had when originally developing Clojure."
- From the same note: "I look forward to continuing to lead ongoing work maintaining and enhancing Clojure with Alex, Stu, Fogus and many others, as an independent developer once again."
- Central argument of "Maybe Not" (Clojure Conj 2018): optionality is context-dependent — for some functions one subset of a record is required, for others a different subset — so baking `Maybe`/nullable into the type of the field itself is "fundamentally misguided." Schemas should describe what a specific operation requires, not permanently attach optionality to a value.

## Principles as they articulated them
- Distinguish simple (un-braided, one fold) from easy (near to hand). The two are often confused.
- Prefer values over places. "Place-oriented programming" — variables, mutable fields — is a historical artifact of limited memory, not a goal.
- Schemas should describe requirements of specific operations, not permanent properties of data. (Maybe Not.)
- Do the hard design work first. "Hammock-driven development" — most problems are better solved by thinking than by typing.
- Libraries over frameworks; data over objects; information over encapsulation.

## What surprised me in research
- His 2023 departure was framed as a *return* to the conditions under which Clojure was originally created — independence, not employment — rather than as stepping down. He continues to lead Clojure language work.
- The "Maybe Not" talk is an unusually direct self-revision: it pushes back on the static-typing enthusiasm in the Clojure spec community and argues that both nominal types and `Maybe` get optionality wrong.
- "Complect" is an archaic English verb that he deliberately reintroduced because he felt the field needed a word specifically for "wrongly braided together" that was distinct from "compose."

## Recent or later work
Retired from commercial software in August 2023 but remained lead of Clojure language development with Alex Miller, Stuart Halloway, Fogus and others. Since then Clojure 1.12 shipped; Hickey remains the design authority, now operating independently. Datomic is under active Nubank stewardship.

## Sources
- https://github.com/matthiasn/talk-transcripts/blob/master/Hickey_Rich/SimpleMadeEasy.md — "Simple Made Easy" transcript — github.com
- https://www.infoq.com/presentations/Simple-Made-Easy/ — "Simple Made Easy" video — infoq.com
- https://clojure.org/news/2023/08/04/next-rich — "(next Rich)" retirement announcement — clojure.org
- https://github.com/matthiasn/talk-transcripts/tree/master/Hickey_Rich — Hickey talk transcripts index — github.com
- https://dev.to/cjthedev/clojure-conj-2018---maybe-not----rich-hickey-1196 — "Maybe Not" talk notes — dev.to
- https://blog.mplanchard.com/posts/thoughts-on-maybe-not.html — "Thoughts on Maybe Not" analysis — blog.mplanchard.com
- https://building.nubank.com/clojures-journey-at-nubank-a-look-into-the-future/ — Clojure at Nubank — nubank.com
