# The substrate against the prior art

Night's substrate combines a typed chunk store, contracts as data in the field they govern, commits and branches over everything, and attach between stores. The sweep checked each piece against what has shipped, and the finding is double-edged: **every piece has precedent — some of it refuting night's novelty claims outright — and the combination is genuinely unheld; but the seams between the pieces are exactly where every shipped system capitulated.** This fold carries the prior art, the schema-evolution law the industry independently converged on, and the recommendations the sweep landed for night's own law.

## Prior art: the pairs exist, the conjunction doesn't

"Nobody combines version control with knowledge structure" is false, and has been since 2019:

- **TerminusDB** is the exact idea — git-style commits, branches, diff/patch over a schema-constrained document graph — and its fate is the cautionary datum: a year-long release gap, then resurrection under a third-party maintainer, with 2026 commits essentially one person. Its access control is store-scoped grants with no document filtering — the opposite of night's viewer-side model.

- **Fluree** ships roughly 80% of night's *permission* design: policy transacted as data, its one required field an ordinary query clause, evaluated per-datum inside index scans — so filtered aggregates follow for free ([`permissions.md`](permissions.md) takes this up). Linear ledger, though: no branch DAG.

- **Willow/Meadowcap** formalised "permission written in the query formalism" — a capability's granted area *is* the same expression type the sync protocol uses. The spec is excellent and orphaned: no maintained implementation.

- **Dolt** proved versioning-as-substrate commercially: one prolly-tree engine now under MySQL, Postgres, SQLite, and Mongo wire protocols. No knowledge structure at all — and its lesson is packaging: sell a familiar interface, not a paradigm (Noms, its ancestor, died selling the paradigm).

- **Datomic** proves accretion works at scale (independently verified: ~94M users, 2.3B transactions/day, no safety bugs found) — and its own docs carry the tax: every datom stored ≥3 times, excision proportional to database size, and explicit advice to turn history *off* for most attributes. Sharp edge worth knowing: intra-transaction operations compose with concurrent, not serial, semantics.

What is genuinely uncommon is the four-way conjunction: membership-only typing with no subtype relation, contracts *owned* rather than published, one-hop permission, and branch/commit versioning of the type system itself. Each part has precedent; the sweep found no system holding all four. **The thinnest seam — branching an owner-scoped contract — is precisely where every shipped system gave up.**

Two warnings ride the conjunction. Owner-scoped contracts are **Cyc's microtheories rediscovered**: contexts proliferate rather than consolidate ($200M and ~2,000 person-years didn't resolve it), and RDF's real failure was not its vocabulary design but that per-owner vocabularies never aligned and alignment was never automated — a problem night inherits in full at attach time. And **membership-intersection navigation** (night's read primitive) has an ancient lineage — semantic filesystems, faceted browsing, WinFS, OLAP dimensions — every instance of which died for want of clean typed metadata on every item. The one thing that genuinely changed in 2026 is that models produce metadata — at the measured precision cost [`structure.md`](structure.md) documents. Present the primitive as a revival with a reason, not an invention.

## Nobody merges structure

The single strongest cross-system regularity: **structure merges only where changes form a join-semilattice; outside it, every shipped system serializes.** Dolt blocks the merge on schema conflict and resolves by taking an entire side; Iceberg has no branch merge at all, only tags and fast-forward; TerminusDB — the only system modelling schema change as a first-class, branchable operation ("weakening": provably non-invalidating changes apply in place, everything else is an explicit replayable migration) — has left migrating the inheritance hierarchy unimplemented. Confluent's default compatibility mode is non-transitive, so a chain of pairwise-compatible changes can be globally incompatible; compatibility there is an *upgrade-ordering contract*, not a correctness one.

And the systems that survived schema change at scale did it by **forbidding, not translating**: Protobuf's field-number graveyard and the removal of `required` ("a constraint you can never relax is a liability that compounds"); Datomic's never-alter list — including the concession that time travel does *not* take the schema back in time; ATProto's Lexicon rules (new fields optional, no renames, no type changes, breaking change = new name, no repair, ignore unknown fields) — which is full-transitive compatibility stated in prose, for a federation where nobody can be forced to upgrade. GraphQL's deprecate-never-version position did not hold at scale: the largest public GraphQL API versions quarterly.

**Do not build lenses.** The bidirectional-transformation literature's own results close the door: the composition law needed for chained migration (PutPut) fails "for reasons that seem pragmatically unavoidable" on exactly the operators you'd want; Cambria's flagship operator wasn't a lens by its own admission, and its transferable finding is the write-side pivot it made under duress — **tag every write with the schema it validated against, translate at read**, which is Avro's eighteen-year-proven shape.

## What the sweep recommends for night's law

Research-grade, for the spec to weigh, not rulings — but each is the intersection of several independent systems:

- **Stamp every write with the contract commit it validated against.** Highest value, lowest cost, and the missing piece that turns write-time-only validation from defensible into correct: without it, a body legal under contract-v1 is indistinguishable in 2028 from one that would fail v3. It is also what makes time-travel reads honest — resolve a body against the contract *as of that commit*, or history lies.

- **Split contract edits into widening and narrowing, as a hard refusal.** Widening (add optional key, add union variant, widen a scalar, alias a rename) applies in place. Narrowing mints a *new* contract record; instances migrate by re-linking. This is where Protobuf, Datomic, ATProto, and Kafka independently landed.

- **Alias is the one blessed rename** — rename is a large share of real churn and the one narrowing-shaped change that is genuinely lossless.

- **Attach succeeds always; compatibility grades per contract** (identical / compatible-by-widening / foreign), with foreign contracts rendered exactly as dead references are — reuse the one failure aesthetic. Contract identity carries authority (the minting store), so a peer that narrows your contract has by construction minted its own — the federation problem mostly dissolves into naming. Tolerance discipline per RFC 9413: be permissive about data already accepted (that is just immutability), refuse loudly and machine-readably what a peer hands you now.

- **Indexes: invalidate eagerly at O(1), re-derive lazily on read, backfill in background** (the measured answer from Noria — empty views populated by upqueries transition instantly; eager materialization degraded service for a minute). Eager fan-out is worse in night than anywhere: re-deriving N instances writes N intent-free commits into a permanent DAG.

- **Seeding: content-hash-keyed repeatable migrations** (Flyway's model), reconciling only records still at their bootstrap commit and reporting drift on the rest — never silently overwriting a human edit.

Adjacent, from the query-language graveyard: **Datalog wins as an internal IR and loses as a user surface, every time** — XTDB dropped it and stopped mentioning it; Rust's Polonius shipped a non-Datalog reformulation because the Datalog one was "a non-starter" on performance. And night's no-subtyping types are OWL *punning* in disguise; the discipline that makes punning safe is refusing to let the two readings interact.

## The one choice with evidence against it

**No vector similarity.** Independent retrieval benchmarks have vanilla vector RAG beating both graph traversal and full-text on factoid recall ([`context.md`](context.md) carries them). Set-intersection plus full-text is a strictly weaker recall surface; the choice is defensible only insofar as retrieval runs over *authored* structure rather than extracted content — and it should stay marked as the substrate decision most exposed to evidence.

## Not established

Whether Foundry's row-level permissions filter aggregates uniformly; Fluree's documented count-under-policy behaviour (inferred from per-datum filtering, not stated); why XTDB dropped Datalog (no post-mortem exists); the Cambria paper's formal content (paywalled); any practitioner post-mortem of event-sourcing upcasting at scale.

---

*Sources: [`abffcf492c6f3d77d`](../raw/abffcf492c6f3d77d.md) (the landscape, nearest neighbours, graveyard causes) · [`ad341d6da8eaac361`](../raw/ad341d6da8eaac361.md) (Cambria, the BX results, production patterns, and the recommendations in full — the deepest single report in the sweep) · [`a96d8d0c3161e997c`](../raw/a96d8d0c3161e997c.md) (Datalog's fate, Dolt/Iceberg/TerminusDB merge behaviour, Datomic's tax) · [`adc9dab44aefdde97`](../raw/adc9dab44aefdde97.md) (vocabulary concentration, Cyc, the novelty assessment) · [`a498dd38f2322a083`](../raw/a498dd38f2322a083.md) (sync-engine schema evolution: everyone forces the client to upgrade).*
