# Who else argues this, claim by claim

One agent's brief was to find whoever else holds the thesis. Its method note matters for how the absences read: the session's web-search budget was exhausted before a single query, and every general search engine reachable by direct fetch returned captchas or rate limits, so the work rests on a forum's full-corpus API, an accelerator company dataset, and direct page fetches. That is strong on essays with traction, funded startups and named sites; weak on venture-capital writing, academic venues and non-English material. **Absences in those three areas are unproven.**

## 1. The headline

**Nobody found is arguing the whole thesis.** Every neighbour holds two or three claims and explicitly rejects or ignores the rest. The combination — typed medium, context as address, harness dissolution, and the historical enclosure argument — appears nowhere as a single position.

## 2. "Text is not data" — the loneliest claim, and it is losing in public

**Who holds it.** In the shell lineage, Nushell ("a shell where all data is structured," shipped since 2019) and PowerShell, without the AI argument. In the code lineage, Unison states it precisely — "Other tools try to recover structure from text; Unison stores code in a database" — and its site carries **zero** agent positioning. Glamorous Toolkit is the closest live statement of the aesthetic: "Objects, not text"; "You cannot perceive anything in a software system except through a tool" — and in 2026 it added a built-in agent harness while arguing that deterministic moldable views beat AI summaries.

**Nobody found argues that the model era is what makes text-as-substrate finally untenable.**

**Who says the opposite, loudly.** The most-read 2025–26 writing traces plugins to custom instructions to assistants to typed tool protocols to markdown skill folders and concludes that "giving an agent general purpose tools and trusting it… might very well be the winning strategy" and that "we will go back to extending our agents with the most accessible programming language: natural language." A study of 9,649 experiments across 11 models and 4 formats found a "grep tax": a *more* compact structured format cost more tokens because models were unfamiliar with it — a claim the adversarial lane could not verify, and which is bounded in [`../folklore.md`](../folklore.md).

## 3. "Completion from a point in a field, not a pasted transcript"

**Closest:** Pentad Labs, whose design essays define a fact as a five-slot structure — subject, predicate, object, **context**, **lineage** — explicitly "rather than burying context within narrative transcripts," with "provable provenance" and "nothing an agent has seen, said, or done is lost." That is two claims stated almost word for word, and it is a design essay plus a pre-release product, not a shipped substrate.

**Most shipped version of half of it:** Letta — "Memory cannot be bolted onto an agent as a plugin. Context and state management are core responsibilities of the agent harness itself," with structured memory blocks and an agent-file format. Note the tension: it locates this in **the harness**, precisely where the harness-dissolution claim says it must not live.

**Supporting evidence others generated:** context-rot research showing models do not use context uniformly and that focused prompts beat full-transcript prompts; vendor guidance arguing for lightweight identifiers and just-in-time retrieval over pre-loading.

**Not found:** anyone proposing *reproducibility* or *branching* of a context as a location. Branching interfaces exist as chat-tree GUIs, at one and two points of attention, not as addressing.

## 4. "The harness dissolves" — nobody argues this

The 2025–26 movement runs the *opposite direction with the same evidence*. Two influential pieces both say tool registries are the wrong abstraction — and then both build a *better harness*, with sandboxes and filesystem tool discovery. "Agent harness" became a common noun in 2026, with 41 forum stories over 80 points. The closest to dissolution-by-simplification are minimalist rebellions: a 12MB binary replacing a framework, a full coding-agent harness in 400 lines of shell. These shrink the harness; they do not argue the medium removes the need for one.

## 5. "Knowledge compounds by interconnection; monoliths break it"

**Half of it is well-argued and widely read.** Ink & Switch's *Malleable Software* essay makes the app-as-enclosure case explicitly — applications as single-purpose gadgets, and "When data is instead shared among applications, it empowers end-users to compose tools in more flexible ways" — citing OpenDoc, Smalltalk and the filesystem as the pre-enclosure alternatives. One accelerator company makes the compounding case for AI specifically: "none of that thinking compounds. Every session starts from zero… Science has journals, law has case law, software has git; AI-native knowledge work has had nothing."

**The full historical arc — Unix, then the web, then AI, each arriving with a whole and being enclosed — could not be found.** A full-corpus search for enclosure and hypertext framings above 60 points returned nothing making this argument. That is the agent's most confident absence, with the caveat that its index is a poor one for long-form media theory.

## 6. "The interface is data over the same contracts as the data"

**Closest shipped:** Jazz — a local-first relational database where schema, permissions and reactive interface state are the same object, with git-like branching histories explicitly motivated by users collaborating with agents to modify data at a much higher rate. **Ink & Switch's Patchwork** stores "both user data and software code" in the same document format — the strongest research statement of the claim — and its 2026 notes report the concrete result: "Patchwork made it relatively easy to compose tools in ways their authors didn't expect." A companion note gets nearest to the framing: "the closer we can make the loop, the less the distinction between what is written and what runs, the better it gets."

## 7. Provenance as first-class

Pentad is the sharpest. **Palantir is the only one at scale** — its ontology is nouns (objects, properties, links) plus verbs (actions, functions), and a community reading takes the strategy to be "branching and review" as what lets AI act at "overwhelming speed and governance simultaneously." Notably, Palantir's own public documentation does **not** foreground provenance; that is the community's reading, not the vendor's pitch. **Zero of 1,271 accelerator companies from the 2025–26 cohorts use the word "provenance" in their descriptions.**

## 8. The nearest neighbours, ranked

| effort | holds | rejects or ignores | grade |
|---|---|---|---|
| Palantir Ontology | typed medium, interface-as-data partly, provenance | context-as-address, harness dissolution, interconnection — it is itself a monolith, composing only inside its own platform | shipped, the only one at national scale |
| Ink & Switch (Patchwork, universal version control, malleable software) | typed medium, the app half of interconnection, interface-as-data, provenance | context-as-address and harness dissolution almost entirely — AI appears as a collaborator to version-control, never as the reason the substrate is needed | working prototype, publishing through 2026-05 |
| Pentad Labs | context-as-address, provenance, part of typed medium | the rest | essay series plus pre-release product |
| Letta | context-as-address | harness dissolution, explicitly — memory *is* the harness's job | shipped, with SDK, evaluations and a file format |
| Microsoft's enterprise ontology products | typed medium in enterprise flavour, compounding | the rest | shipped; announced November 2025, public preview by April 2026 |
| Glamorous Toolkit | typed medium, interface-as-data | the rest | shipped, small but real |
| Jazz | interface-as-data, part of provenance | the rest | shipped local-first database with branching |

Worth a line: one accelerator company sells "an ecosystem of open-source, local-first apps that share a memory… a single folder of plain text and SQLite" — holding the interconnection and interface claims while explicitly choosing *plain text*, which makes it the typed-medium claim's counter-example living inside the interconnection claim's argument.

## 9. The timing

**Heating up commercially, flat foundationally, and the two are not connected.** "Context layer" as a category did not exist before spring 2025 and now names at least four accelerator companies across four cohorts, one reporting zero to $33k monthly recurring revenue in four weeks. "Agent harness" produced 41 forum stories over 80 points, all after December 2025. Microsoft entered in November 2025. Palantir's ontology went from a defence-procurement term to a widely-read deep-dive and a category label competitors position against.

Against that: the underlying claims are 30–60 years old and their current custodians move at research pace. Ink & Switch published six notes in 2026 and **none of them is about AI substrates**; Dynamicland is publishing pages that predate the agent era; the leading future-of-programming community renamed itself and its most recent episode is about live programming feedback.

Report: [`a09867b88abcb610b`](../../../../../sweep-2026-08/raw/a09867b88abcb610b.md).
