# Ken Thompson

## What they built
Co-creator of Unix at Bell Labs (with Dennis Ritchie, 1969-), designer of the B language (predecessor to C), the `ed` editor, `grep`, regular-expression matching, and UTF-8 (with Rob Pike, sketched on a New Jersey diner placemat in 1992). At Google from 2006, co-designed Go with Rob Pike and Robert Griesemer. Turing Award 1983.

## In their own words
- "You can't trust code that you did not totally create yourself." — *Reflections on Trusting Trust*, Turing Award lecture, CACM August 1984. The lecture demonstrated a self-reproducing compiler backdoor that leaves no trace in source code — trust has to bottom out somewhere outside the code you can read.
- "[C++] does a lot of things half well and it's just a garbage heap of ideas that are mutually exclusive." — *Coders at Work* (Seibel, 2009). Said in the context of explaining Go's motivation.
- "When the three of us got started, it was pure research. The three of us got together and decided that we hated C++… we started off with the idea that all three of us had to be talked into every feature in the language." — Dr. Dobb's interview (2011).
- "grep was a private command of mine for quite a while before I made it public." — on `grep`'s origin as a one-off utility he kept to himself before realising others needed it.
- On how he identifies strong programmers: "It's just enthusiasm. You ask them what's the most interesting program they worked on. And then you get them to describe it and its algorithms… If they can't withstand my questioning on their program, then they're not good." — *Coders at Work*.

## Principles as they articulated them
- Small, composable interfaces: "the major good idea in Unix was its clean and simple interface: open, close, read, and write" (Computer magazine, May 1999).
- A language is disciplined by unanimity among designers — Go's "all three of us had to be talked into every feature" rule.
- Trust is not a property of source code; it is a property of the chain that produced the binary.
- Build tools for yourself first; release them only once they've proven useful.

## What surprised me in research
- Thompson is described in multiple sources as intensely private and rarely gives interviews; the Computer History Museum's oral history (4.5 hours) is one of the few long-form records.
- He uses version control at Google only because "Google makes us do that!" (Borile interview, 2021). For decades his answer to code reviews was "we were all pretty good coders."
- He has not written much C in his current life — a lot of his recent personal projects are in Go, and his interests run to computer chess, digital audio, and scanning for Google Books.

## Recent or later work
Still at Google as of recent mentions; mostly quiet publicly since the early Go years. Occasional talks (the CHM oral history, short interviews), no sustained writing. He has aged into the role of a founding figure who lets Pike do most of the public speaking.

## Sources
- https://en.wikiquote.org/wiki/Ken_Thompson — Ken Thompson quotes with sources — wikiquote.org
- https://www.paulstephenborile.com/2021/01/interview-with-ken-thompson/ — Interview with Ken Thompson — paulstephenborile.com
- https://computerhistory.org/blog/a-computing-legend-speaks/ — A Computing Legend Speaks (Thompson oral history) — computerhistory.org
- https://www.cs.cmu.edu/~rdriley/487/papers/Thompson_1984_ReflectionsonTrustingTrust.pdf — Reflections on Trusting Trust (1984) — cs.cmu.edu
- https://codersatwork.com/ken-thompson.html — Coders at Work: Ken Thompson — codersatwork.com
