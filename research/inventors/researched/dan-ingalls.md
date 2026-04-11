# Dan Ingalls

## What they built
Ingalls is the principal architect of five generations of Smalltalk at Xerox PARC, including the BitBlt graphics primitive still underlying most 2D raster graphics, and the implementations of Smalltalk-72, -76, -78, -80, and Squeak (1996, co-authored with Alan Kay). He later built the Lively Kernel, a browser-native live programming environment, and continued that lineage through SqueakJS and work at Sun Labs, SAP, Y Combinator Research, and the Hasso Plattner Institute.

## In their own words

From *Design Principles Behind Smalltalk* (Byte Magazine, August 1981):

- **Personal Mastery:** "If a system is to serve the creative spirit, it must be entirely comprehensible to a single individual."

- **Factoring:** "Each independent component in a system would appear in only one place."

- **Reactive Principle:** "Every component accessible to the user should be able to present itself in a meaningful way for observation and manipulation."

- **Operating System:** "An operating system is a collection of things that don't fit into a language. There shouldn't be one."

- **Purpose of Language:** "To provide a framework for communication."

- **Natural Selection:** "Languages and systems that are of sound design will persist, to be supplanted only by better ones."

(All six quotations are from the same 1981 essay, which remains remarkably compact — the whole document is a bulleted list of principles, each one a paragraph long.)

## Principles as they articulated them

- **Comprehensibility by one person.** The central Smalltalk ethic. A system too large for a single person to hold in their head has failed the creative user, regardless of its other virtues.
- **Uniformity as leverage.** Everything is an object; every object responds to messages; there are no primitive cases. The uniformity is what makes the system masterable.
- **No operating system.** The language *is* the environment. The split between "application" and "OS" is an accident of implementation, not a necessity.
- **Liveness and reactivity.** Any object should be able to show and explain itself on demand. This principle is the ancestor of the inspector, the debugger-as-normal-UI, and later Lively Kernel's web-page-as-IDE stance.
- **Factoring.** Duplicated knowledge is the enemy; a concept should live in exactly one place.

## What surprised me in research

- Ingalls is much quieter publicly than Kay. The 1981 *Design Principles* paper is his signature document, and he has largely let it stand — there is no equivalent "late manifesto." The principles he published at 37 are the principles he still cites.
- BitBlt is his, not Kay's. The "bit block transfer" operation in every GPU and window system today traces directly to his 1975 implementation for the Alto. This is underappreciated relative to his Smalltalk fame.
- His later work is all about porting the Smalltalk philosophy out of Smalltalk: Lively Kernel (JavaScript in the browser, live), SqueakJS (Squeak VM in JavaScript, written in a weekend at a hackathon in 2013–14). The medium changes; the principles don't.

## Recent or later work

After Sun Microsystems Labs, Ingalls moved to SAP's Palo Alto Research Center as a fellow, then to Y Combinator Research. Lively Kernel continued as a research project at the Hasso Plattner Institute in Potsdam, which still hosts it. SqueakJS (c. 2014) is a full Squeak VM implemented in JavaScript, letting decades of Smalltalk images run unmodified in a browser tab. He is now a consultant living in Manhattan Beach, California. His arc is unusual among PARC alumni: rather than writing retrospectives, he has kept reimplementing the same core idea — a live, malleable, object-uniform environment — in whatever substrate is currently available.

## Sources

- https://www.cs.virginia.edu/~evans/cs655/readings/smalltalk.html — Design Principles Behind Smalltalk (1981) — cs.virginia.edu
- https://www.infoq.com/interviews/ingalls-smalltalk/ — Dan Ingalls on the History of Smalltalk and the Lively Kernel — infoq.com
- https://en.wikipedia.org/wiki/Dan_Ingalls — Dan Ingalls — wikipedia.org
- https://computerhistory.org/profile/dan-ingalls/ — Dan Ingalls profile — computerhistory.org
