# Schema evolution: the confessed unsolved problem

Two agents worked this, one of them at depth. The finding is that the research which named the problem closed the file, the theory proves the composition law you would need is unattainable, and every system that survived schema change bought safety by forbidding things rather than by translating them.

## 1. Cambria, assessed

Ink & Switch's Cambria (essay October 2020; a peer-reviewed paper at PaPoC 2021 that could not be opened) is bidirectional lenses — a script of primitives (`rename`, `convert`, `wrap`, `head`, `add`, `remove`, `in`, `hoist`) running in three interpreters: over JSON Patch for runtime data, over JSON Schema for build-time types, and reversed. One specification yields both directions.

**Its real result is not lenses — it is the write-side pivot.** The team started by translating on write and abandoned it: "We eventually realized this was a flawed strategy... too much translation work was happening eagerly on write," and it "struggled to handle new schemas getting added later on, after the write had already happened." They switched to **schema-tagged writes with translate-on-read**, which is structurally identical to Avro's writer/reader resolution. That pivot is the transferable finding.

**Its own headline operator is not a lens.** Verbatim: "The current implementation of Cambria does contain some operators that don't fit the technical definition of a lens. One example is the `convert` operator... `convert` can't guarantee a useful consistency relation." The demo lens in the essay's first figure uses `convert`.

**Where else it broke down.** Read-time translation is expensive — "reading a document in one schema can actually require reading it in many different schemas if writes were made from many schemas." Performance was never measured, by their own admission. Scalar-to-array conversion has six enumerated options and the conclusion that "there is no ideal solution," with non-nullable fields impossible to convert at all because array length cannot be guaranteed in a distributed system. Dogfooding failed: "We found it too unstable to be our only system of record during the project." And lenses cannot express intent — running one backward over a field change can imply an edit that is "almost certainly incorrect," with "no simple solution."

**Composition was never claimed.** Cambria keeps a graph of schemas connected by lenses and routes by **shortest path**. With lossy edges in the graph, the result of A to C depends on which path the router picks — a silent nondeterminism the essay never addresses.

**Status: research-prototype with dead code.** The lab lists Cambria as Completed, 2020; the repository was last pushed 2024-06-14 with 698 stars and was never productionised. The Automerge integration was never carried into later versions. Its README still says it "isn't yet ready for production use." There is no separate post-mortem.

**The only shipped descendant** is Jazz v2 (2026-04-18), which states the problem exactly — old clients writing against outdated schemas that sync later into newer server schemas — and answers with two moves: **schema version as an extra branch dimension**, so a row with a stable identity can coexist in different schema branches at once; and, citing Cambria, migrations as "purely functional mappings between schema versions," bidirectional. Treating schema version as another branch axis is the most promising live idea in the field, and it is alpha.

## 2. What the theory proves

From Foster, Greenwald, Moore, Pierce & Schmitt, *TOPLAS* 2007, the definitive lens laws. **GetPut** and **PutGet** together make a lens *well-behaved*. Adding **PutPut** — incremental application equals batch application — makes it *very well behaved*.

Four results matter to a system designer.

**PutPut is unaffordable.** Verbatim: "We will not require PutPut because some of our lens combinators — in particular, `map`, `flatten`, `merge`, and conditionals — fail to satisfy it for reasons that seem pragmatically unavoidable." **Applying two migrations one at a time need not equal applying them together.** For a store that replays a chain of contract changes, that is the whole ballgame.

**The correspondence to database theory is exact.** "The set of all well-behaved lenses is isomorphic to the set of dynamic views… Moreover, the set of very well-behaved lenses is isomorphic to the set of translators under constant complement." So very-well-behaved means constant complement means nothing outside the view may move. **Lenses did not solve the view-update problem; they gave it a type system.**

**Well-behavedness is vacuous without totality**, which does not come free — only recursion-free expressions can be shown total compositionally. A footnote makes the point sharp: for any function from concrete to abstract, you obtain a well-behaved lens by making the other direction undefined everywhere. Any claim that migrations are lawful is meaningless without a totality claim over the actual data domain.

**The field did not converge and has gone quiet.** A 2016 unification notes that "it sometimes seems that every paper with 'lens' in its title defines at least one new type of lens"; a 2019 paper resolves a long-standing open question negatively — two natural symmetric formalisms are genuinely different categories. The workshop series has no proceedings after 2022.

## 3. What works in production, ranked by evidence

**Writer-schema travels with the data, reader resolves (Avro).** Eighteen years in production. Fields matched **by name, not position**; reader field absent from writer uses the reader's default; writer field absent from reader is ignored; **reader field with no default and no writer counterpart is an error**. Promotions are a fixed one-way ladder — int to long, float, double; long to float, double; float to double; string and bytes interchangeable. Aliases handle rename. The constraint it imposes: every field must have a default or you can never remove it, and the exact schema of every write must be retrievable forever.

**Immutable identity and forbidden reuse (Protobuf).** Field numbers "should never be reused"; deleting a field requires reserving it; the consequences of reuse are listed as "A parse/merge error (best case scenario), Leaked PII/SPII, Data corruption." `required` was "considered harmful by so many they were removed from proto3 completely" — the canonical lesson that **a constraint you can never relax is a liability that compounds**.

**Expand, migrate, contract.** Both shapes valid during migration. The failure mode is stated: "If the contract phase is not executed you might end up in a worse state than you started."

**Accretion with a hard frozen list (Datomic).** Identifiers renameable, cardinality and uniqueness changeable — but "You can never alter `:db/valueType`" and four siblings. And, critically for any time-travelling store: "**traveling back in time does not take the working schema back in time**, as the infrastructure to support the past schema may no longer exist." Datomic explicitly gives up historical schema fidelity.

**Read-time upcasting chains.** Event-sourcing frameworks map revision *x* to *x+1*, chained, with the revision tag stored beside the payload. The admission: "event upcasting cannot be done in full automation because the structure of the new event is unknown to the old event."

**Deprecation instead of versioning did not hold at scale.** GraphQL still teaches evolving a type system "without versions." The largest public GraphQL API versions quarterly, guarantees each stable version for a minimum of twelve months with at least nine months of overlap, falls forward when a version retires, and **delists applications** that keep calling removed resources. Deprecation-only survives while you can nag every consumer; it does not survive a population you cannot reach.

**Punning without subtyping (OWL 2)** validates the no-subtyping design directly: one identifier may name both a class and an individual, but the direct semantics "treats the different uses of the same name as completely separate" — and that separation is exactly what buys decidability.

## 4. The federation case, and the compatibility lattice

**Kafka's compatibility modes are really an upgrade-order decision.** BACKWARD means upgrade all consumers first; FORWARD means upgrade all producers first *and* ensure old-schema data is no longer visible; only FULL and FULL_TRANSITIVE let producers and consumers upgrade independently; NONE means create a brand-new topic. The default is BACKWARD and it is **non-transitive** — new schemas are checked only against the latest, so a chain of pairwise-compatible changes can be globally incompatible.

Change classes: add-optional and remove-optional are compatible in all modes; **add-required is backward-only, remove-required is forward-only**; widen is backward, narrow is forward.

**For a federation where you cannot order anyone's upgrade, FULL_TRANSITIVE is the only honest setting** — and that is exactly what ATProto's Lexicon rule states in prose: "all old data must still be valid under the updated Lexicon, and new data must be valid under the old Lexicon." Enforced by four prohibitions: new fields must be optional, non-optional fields cannot be removed, **types cannot change, fields cannot be renamed**. The escape hatch is a new name. Authority is rooted in DNS control, and "the primary mechanism for resolving protocol disputes is to fork Lexicons into a new namespace."

Two further ATProto rules transfer directly. On failure: "implementations should generally consider data which fails to validate against the Lexicon to be **entirely invalid**, and should not try to repair or do partial processing." On openness: unexpected fields "should be ignored… treated at worst as warnings" — with the spec naming its own hazard, that a later revision may add a field with the same name and a different type, making existing data invalid.

**Other shapes.** Matrix room versions are immutable with **no ordering or hierarchy**, and a room changes version only by *upgrading* — a new room plus a tombstone in the old one. Migration by replacement, not translation. Nostr negotiates nothing: integer ranges statically partition semantics and unsupported filters produce a machine-readable refusal.

**The option space for two attached stores whose contracts diverge**, ranked by how well each survives peers who never upgrade: namespace the divergence away (ATProto, Nostr); freeze the compatible core (Matrix); full-compatibility discipline (Kafka FULL_TRANSITIVE); refuse (correct, honest, useless at scale); translate (Cambria — the only option that preserves both sides' semantics, and the only one with no production evidence behind it).

## 5. Nobody merges structure

The shipped behaviour is uniform. **Dolt** separates data conflicts, resolvable row by row, from **schema conflicts**, which "prevent the merge from completing" and resolve by taking "the *entire* table from the chosen side"; it also surfaces constraint violations where both sides are individually valid and the union is not. **Iceberg** has branches and tags as named references with independent lifecycles, and the documented workflow closes not by a merge but by fast-forwarding — **Iceberg has no branch merge**. **TerminusDB** is the only system modelling schema change as first-class, via *weakening* — a change that cannot possibly invalidate existing data needs no migration, and everything else needs an explicit, replayable migration drawn from about sixteen operations, which can target another branch's schema so migrations are re-performed to reach a common schema. Two operations, including **the one that migrates the inheritance hierarchy, are unimplemented**.

**The lesson, in one line: a versioned contract can guarantee exactly one thing — that a decode will not fail, for a bounded set of syntactic changes, in a bounded direction, against a bounded set of prior versions.** It cannot guarantee semantics; a field that changes meaning passes every check. Structure merges only where the change lattice is a join-semilattice, and everywhere outside it the shipped answer is: stop, take one whole side, fast-forward, or make a new thing and migrate.

## 6. The one missing piece, if write-time-only validation is the design

Validating at write and never re-validating is defensible and in good company — Avro, ATProto, Datomic, Protobuf's skip-unknown-fields, the tolerant-reader tradition. But Avro's write-time-only validation is safe **because the writer's schema travels with the datum**. Reader-side resolution is only well-defined when both schemas are in hand.

So: **store the contract version at validation time, on the write.** Without it, a body validated in 2026 is indistinguishable at read time in 2028 from one that would fail today's contract, and three failure modes follow. Silent semantic drift, where old values remain legal-when-written and no query can tell them from corrupt ones. Name collision on undeclared keys, which ATProto names precisely and Protobuf answers with reserved names. And the trap Datomic conceded — time-travel reads lie unless a body is resolved against the contract *as of that commit*, not as of now.

One more caution, from RFC 9413: "Errors in implementations or confusion about semantics are permitted or ignored. These errors can become entrenched, forcing other implementations to be tolerant of those errors." Being permissive about data you already accepted is fine — that is just immutability. Being permissive about what a peer may hand you *now* is the harm. Keep the first; refuse the second loudly, with a machine-readable reason.

## 7. Two further recommendations worth carrying

Both come from the same deep read, and neither is reconstructible from the mechanisms above.

**Seeded data belongs to a content hash, not to a marker.** The shipped model that works is Flyway's distinction between *versioned* migrations, which run once, and **repeatable** migrations, which are re-applied whenever **their own checksum changes**. Bootstrap declarations are repeatable migrations that are usually mislabelled as versioned ones, and "idempotent-by-marker" — did-I-run-this-before, keyed by a name — is the known-broken variant. The cost is a canonical serialisation and a stable hash per declaration, plus a stamp recording what a record was seeded from. Pair it with the reconciliation rule: re-seed a record whose head is still the bootstrap commit, and where a person has since edited it, do not touch it — report the drift.

**Contract identity should carry authority.** ATProto roots it in DNS control of the domain; in a store, the minting store's identity is the natural root. The consequence is that a peer who narrows a contract you own has, by the widening-versus-narrowing split above, minted a *new* contract — so divergence mostly dissolves into the naming problem. The cost is that peers cannot extend your types in place and must mint their own; where multi-typing is already normal, that cost is near zero. The agent who worked this lane called it the recommendation with the best cost-to-benefit ratio in its whole report.

Three further recommendations govern what happens when two stores that hold the same contract have drifted, and they are of a piece.

**Stop refusing at store granularity; resolve compatibility per contract.** A version mismatch on one type should not cost you the other four hundred. The consequence is that attaching becomes a report rather than a boolean, and the simple one-store-one-version mental model goes.

**Grade each shared contract into three buckets and render the grade:** *identical* (same contract, same commit — full interoperability), *compatible* (one side's contract is a widening of the other's — read normally, note the direction), and *foreign* (divergent narrowing, or an unknown identity — render it as a foreign type, exactly the way a dead reference is rendered). The reason to reuse that idiom rather than invent a second one is stated by the agent as a design rule: if a system already has a "permanently visible as broken, never repaired" aesthetic, a second failure aesthetic costs the reader.

**Version the store *format* separately, Matrix-style** — immutable, unordered, no implicit hierarchy, upgrade by new container plus tombstone pointer. Refusing to attach on a *format* mismatch is correct; refusing on a *contract* mismatch is not, and conflating the two is the error.

## 8. Eager or lazy re-derivation: neither

The measured answer comes from Noria (OSDI 2018). With partial state, new views are created **empty** and populated on demand by upqueries, and "the transition completes immediately"; with full materialisation, the same transition degraded throughput for roughly a minute.

So: invalidate eagerly at constant cost, re-derive lazily on read, backfill in the background — with index rows carrying the contract commit they were derived under, so a read can compare and re-derive on mismatch. The stamp is what makes lazy honest, and it costs almost nothing. In a store where every write is a commit, eager fan-out is worse than in a conventional database, because re-deriving N instances writes N commits carrying no intent — permanent history pollution every future time-travel read must scroll past.

Reports: [`ad341d6da8eaac361`](../../../../../sweep-2026-08/raw/ad341d6da8eaac361.md), [`a498dd38f2322a083`](../../../../../sweep-2026-08/raw/a498dd38f2322a083.md), [`a96d8d0c3161e997c`](../../../../../sweep-2026-08/raw/a96d8d0c3161e997c.md).
