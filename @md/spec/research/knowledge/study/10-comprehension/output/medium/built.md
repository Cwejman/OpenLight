# What is built, and what happened to the rest

One agent was sent to map the competitive landscape for a typed, versioned, permission-governed data layer and opened with a correction: the claim that nobody combines version control with knowledge structure is false, and has been false since 2019. This brief holds what that map shows, and then the part that transfers — why the dead ones died, including one killed by the very thing that makes this claim look timely.

## 1. The map, and the one framing nobody occupies

Sorted by what the primitive actually is, five kinds appear and each has working systems behind it: an immutable fact with time built in (Datomic, Fluree, XTDB); a content-addressed tree of rows versioned and merged like a repository (Dolt); a typed document in a schema'd graph with commits, branches and diff (TerminusDB); a strongly-typed object with declared links (TypeDB, and Palantir's Foundry Ontology, the commercial incumbent nobody in this discourse names); and a namespace, path and time coordinate replicated peer to peer (Willow, ATProto).

No system holds what the claim wants at once — in particular, contracts owned by whoever mints them combined with a type system that is itself branched and versioned. One framing is genuinely unoccupied, and it is worth stating carefully because it is the most interesting thing on the map. In every one of those systems you read by naming a thing and then following its links. Nobody ships a store where the normal way to read is to name several properties at once and take what has all of them — where following a link is the exception you ask for explicitly rather than the default motion.

That should be presented as a revival with a reason rather than an invention. The lineage is long — MIT's Semantic File System in 1991, Xerox PARC's Placeless Documents in 1999, WinFS cancelled in 2006, faceted browsing, tag filesystems — and every attempt died of one cause: it needed clean typed metadata on every item, and nobody had it. What changed in 2026 is exactly that, which is where [the gate against inferred types](../structure/README.md) §2 bites hardest. *Observational census, verified against repositories and release histories during the sweep.*

## 2. The bill each one states about itself

The candid parts of the documentation are worth more than the feature lists, and one system's is the sharpest. Datomic's own documentation says to expect every fact to be stored at least three times, that erasing something costs an indexing job proportional to the size of the whole database, and that "a common modeling mistake is to assume that everything temporal belongs in" it — recommending history be turned off for most attributes. The immutable database recommends turning immutability off for most of your data.

And the closest existing product to a versioned typed knowledge store is in a state that should be read as part of the evidence: a twelve-month release gap, a release "now with new maintainers," and a commit history that is essentially one person. *Observational; repository and release evidence.*

## 3. The graveyard, and the causes

The causes repeat, and they are about distribution rather than design. A general-purpose versioned, forkable store was archived with no familiar query interface and no wedge; its ideas survived only because someone else reimplemented its tree behind a MySQL wire protocol — a paradigm sold without an interface. A well-engineered embedded graph database was archived because the company stopped: embedded graph databases have users, not buyers. An authorization engine was deprecated because a library that is not in the data path cannot filter data. And several typed stores were acquired and fell silent within months, the buyers having wanted teams and developer experience rather than the data model.

The research lineage tells the same story in another register. Three independent structure-editor and codebase-as-database ventures converged on consulting as the funding answer within a single year.

## 4. The one post-mortem worth reading whole

Darklang spent seven years building a hosted language with a structured editor, and when Dark Inc ran out of money its founder wrote down why. The money had gone too fast between 2017 and 2020 and the product was not good enough to raise on. Then the sentence that matters here:

"This was somewhat on track until ChatGPT came along and it became very obvious that our product was not the right one for the era of coding agents. Our online structured editor didn't make sense when the LLM is generating the code, and it's a separate place to how people are coding using LLMs and agents."

The deeper post-mortem lists five limiting factors, and two are about the editor rather than the idea: it was disjointed from users' normal development flow, and it was about half of the entire codebase. They forked and deleted over half the repository before the end. *A single venture's own account; opinion, from the party best placed to know and worst placed to be neutral.*

## 5. The warning from the research side

Jonathan Edwards, closing two decades of his own structure-editor experiments, diagnosed the failure as theory rather than engineering. He had been trying to invent too many things at once, he wrote, and kept running into tar pits of interlocking hard problems; what was missing was an underlying theory to map a path through them — what programming languages have in lambda calculus and databases have in relational algebra. What Subtext needed, he concluded, was a theory of change.

That is the most transferable warning in the lineage, and it is aimed precisely at anyone assembling a combination nobody has assembled before. *Opinion, from a practitioner reflecting on his own failures.*

The detail is in [the material's substrate folder](../../corpus/substrate/README.md) and [its field folder](../../corpus/field/README.md).
