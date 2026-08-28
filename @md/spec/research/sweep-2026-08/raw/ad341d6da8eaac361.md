I have enough primary material. Writing the report.

---

# SCHEMA EVOLUTION FOR TYPED, VERSIONED, FEDERATED STORES — PHASE-2 DEEP READ

## 1. HEADLINE

- **Cambria's real result is not lenses — it's the write-side pivot.** The team started by translating on write and abandoned it: *"We eventually realized this was a flawed strategy... too much translation work was happening eagerly on write."* They switched to **schema-tagged writes + translate-on-read**, which is structurally identical to Avro's writer/reader resolution. That pivot, not the lens algebra, is the transferable finding.
- **Cambria's own headline operator is not a lens.** The essay concedes: *"The current implementation of Cambria does contain some operators that don't fit the technical definition of a lens. One example is the `convert` operator... `convert` can't guarantee a useful consistency relation."* The demo lens in the essay's first figure uses `convert`.
- **The BX literature's negative results are pragmatic, not exotic.** Foster et al. state that `map`, `flatten`, `merge` and conditionals *"fail to satisfy [PutPut] for reasons that seem pragmatically unavoidable."* PutPut is exactly the law you'd need to make lens composition safe under repeated migration. You cannot have it and have useful lenses.
- **Every production system that survived schema change bought safety by forbidding things, not by translating.** Protobuf forbids field-number reuse and killed `required`. Datomic: *"You can never alter `:db/valueType`."* ATProto: *"Types can not change. Fields can not be renamed."* None of them migrate; they make the breaking change unrepresentable and force a new name.
- **Kafka's compatibility lattice is really an *upgrade-order* decision, not a data decision.** BACKWARD → upgrade consumers first; FORWARD → producers first; FULL → independent. For a federation where you cannot order anyone's upgrade, **FULL_TRANSITIVE is the only honest setting**, and that is precisely what ATProto's Lexicon rule states in prose.
- **Noria answers the eager-vs-lazy index question with "neither."** New views are created *empty* and populated on demand by upqueries; the transition is near-instantaneous, reuse of upstream materialized state is what makes it cheap. Eager full materialization made the same transition take ~60s of degraded service.
- **The seeded-store problem is solved and boring: content-hash-keyed repeatable migrations.** Flyway distinguishes versioned migrations (run once) from **repeatable** ones re-applied whenever *their checksum changes*. "Idempotent-by-marker" is the known-broken variant of this.

## 2. CAMBRIA, ASSESSED

**What it is.** Essay published October 2020 by Geoffrey Litt, Peter van Hardenberg, Orion Henry (Ink & Switch). There is also a peer-reviewed paper, *"Cambria: Schema Evolution in Distributed Systems with Edit Lenses,"* PaPoC@EuroSys 2021, DOI 10.1145/3447865.3457963 — I confirmed its existence via dblp but **could not read its text** (ACM DL returned 403); nothing below rests on it.

**Precise mechanism.** A lens is a YAML/JSON script of primitives — `rename`, `convert`, `wrap`, `head`, `add`, `remove`, `in`, `hoist` — that runs in three interpreters: over **JSON Patch** (runtime data), over **JSON Schema** (build-time types), and reversed. Bidirectionality means one specification yields both directions.

**The guarantee, stated.** Cambria draws on Hofmann/Pierce/Wagner *Edit Lenses*. The essay's two conditions: (1) *"When a valid edit happens on one document, and it's converted through the lens, it should become a valid edit on the other document. Applying the converted edit should never crash with a schema violation."* (2) *"There must be some consistency relation between the documents that still holds after edits are applied on both sides."* Note what this is **not**: it is not a round-trip identity. It is "no crash, plus some relation." `rename` gets a real relation (equality of the two fields). `convert` gets none.

**Where composition stands.** Cambria keeps *"a graph of data schemas, connected by bidirectional lenses,"* and routes data by **shortest path**. No composition law is proven and none is claimed. Shortest-path routing across a lens graph containing lossy edges (`head`, `convert`) means the result of A→C depends on which path the router picks — a silent nondeterminism the essay never addresses.

**Where it broke down.**
1. *Write-time translation failed.* Verbatim: it *"struggled to handle new schemas getting added later on, after the write had already happened... a write happening concurrently with a new schema being registered in the document."* Replaced by writer-schema-tagged ops in the Automerge log, translated at read.
2. *Read-time translation is expensive.* *"Reading a document in one schema can actually require reading it in many different schemas if writes were made from many schemas. This could be a source of performance problems."*
3. *Performance was never measured.* Listed under open questions: *"We have not yet measured Cambria's performance in any formal way."*
4. *Scalar↔array has no right answer.* Appendix III enumerates six options and concludes *"there is no ideal solution."* Also: *"Not-nullable fields cannot be converted into arrays. This is because we can't guarantee a minimum (or maximum) array length in a distributed system."*
5. *Dogfooding failed.* *"We found it too unstable to be our only system of record during the project"* — though they attribute this to churning Cambria's own storage format, not to lenses.
6. *Lenses can't express intent.* Their GitHub-issue example: running a lens backward over an assignee change *"would imply that we are editing the username of a GitHub user, which is almost certainly incorrect... There is no simple solution to this problem. Some application logic outside of the lens system will be required."*

**Post-mortem.** There is no separate post-mortem document. The essay's "Findings" and "Open questions" sections are the closest thing, and they are honest. `cambria-project` README still carries *"⚠ Cambria is still immature software, and isn't yet ready for production use."*

**What survives.** Three things, all decoupled from lenses: (a) tag every write with the schema it was written under; (b) translate at read, lazily, per-reader; (c) ship the translation logic *inside the data* so an old client can obtain a rule that postdates it. (a) and (b) are Avro. (c) is genuinely novel and genuinely dangerous — it is executable code distributed by peers.

**What a 2026 rebuild should do differently.** Drop bidirectionality as a guarantee and keep it as an *ergonomic default*: a declared change generates a forward function and, where the change is in the widening class, a mechanically-derived backward one; anything else is one-directional and the system says so. Replace shortest-path graph routing with an explicit total order (Axon's chained upcasters, revision *n* → *n+1*, is the right shape). And do not put executable transforms in the document.

## 3. WHAT THE BX LITERATURE ACTUALLY PROVES

From Foster, Greenwald, Moore, Pierce, Schmitt, TOPLAS 2007 (verbatim):

- **GetPut:** `l↗(l↖ c, c) = c` — get a view, put it back unmodified, recover the source exactly.
- **PutGet:** `l↖(l↗(a, c)) = a` — the putback *"must capture all of the information contained in the abstract view."*
- **Well-behaved** = GetPut + PutGet. **Very well behaved** = + **PutPut**: `l↗(a', l↗(a, c)) = l↗(a', c)` — incremental application equals batch application.
- **Totality** is separate and does not come free: *"only recursion-free expressions can be shown total by completely compositional reasoning with types; for recursive lenses, more global arguments are required."*

The results that matter to a system designer:

1. **PutPut is unaffordable.** *"We will not require PutPut because some of our lens combinators — in particular, `map`, `flatten`, `merge`, and conditionals — fail to satisfy it for reasons that seem pragmatically unavoidable."* Consequence: **applying two migrations one at a time need not equal applying them together.** For a store that replays a chain of contract changes, that is the whole ballgame.
2. **The exact correspondence to database theory.** *"The set of all well-behaved lenses is isomorphic to the set of dynamic views in the sense of Gottlob, Paolini, and Zicari. Moreover, the set of very well-behaved lenses is isomorphic to the set of translators under constant complement in the sense of Bancilhon and Spyratos."* So: very-well-behaved ⇔ constant complement ⇔ nothing outside the view may move. Well-behaved ⇔ the permissive "open view" position. **Lenses did not solve the view-update problem; they gave it a type system.**
3. **Well-behavedness is vacuous without totality.** Footnote 3: *"for any function l↖ from C to A, we can obtain a well-behaved lens by taking l↗ to be undefined on all inputs."* Any claim of "our migrations are lawful" is meaningless unless totality over the actual data domain is also claimed.
4. **The taxonomy did not converge.** Johnson & Rosebrugh (Bx 2016) unify set-based/delta-based/edit-based lenses, but note *"it sometimes seems that every paper with 'lens' in its title defines at least one new type of lens."* Johnson & Renaud (Bx 2019) resolve *"a long standing open question"* negatively: **symmetric c-lenses and symmetric d-lenses are not coextensive** — two natural symmetric formalisms are genuinely different categories.
5. **The field has gone quiet.** Per dblp, the Bx workshop series ran 2012–2019, 2021, 2022, with no proceedings after 2022. Mature, well-understood, and no longer producing the practical breakthrough Cambria was waiting for.

**Bottom line:** BX proves that a *single specification generating both directions* is achievable for a restricted operator set; it proves that the composability law you'd need for chained schema migration is incompatible with the operators you'd actually want; and it proves nothing that makes lossy transformations safe.

## 4. THE PATTERNS THAT WORK IN PRODUCTION (ranked by evidence)

**1. Writer-schema-travels-with-data + reader-side resolution (Avro).** Strongest evidence; ~18 years in production. Matching rules: fields matched **by name, not position**; reader field absent from writer → *"the reader should use the default value from its field"*; writer field absent from reader → *"the writer's value for that field is ignored"*; reader field with **no default** absent from writer → *"an error is signalled."* Promotions are a fixed, one-way ladder: `int→long,float,double`; `long→float,double`; `float→double`; `string↔bytes`. Aliases handle rename. **Constraint imposed:** every field must have a default, or you can never remove it; and the exact schema of every write must be retrievable forever.

**2. Immutable identity + forbidden reuse (Protobuf).** Field numbers *"should never be reused"*; deleting a field requires `reserved`; consequences of reuse are listed as *"A parse/merge error (best case scenario), Leaked PII/SPII, Data corruption."* `required` was *"considered harmful by so many they were removed from proto3 completely"* — the canonical lesson that **a constraint you can never relax is a liability that compounds**. **Constraint:** schema elements need stable machine identity independent of their name, and a graveyard.

**3. Expand / migrate / contract (Fowler, *ParallelChange*).** Three phases; both shapes valid during migrate. The failure mode is stated: *"If the contract phase is not executed you might end up in a worse state than you started, therefore you need discipline to finish the transition successfully."* **Constraint:** you must be able to write both shapes simultaneously, and you must track who still reads the old one.

**4. Accretion-only with a hard list of frozen properties (Datomic).** Renameable idents, changeable cardinality/uniqueness/component-ness — but *"You can never alter `:db/valueType`, `:db/fulltext`, `:db/tupleAttrs`, `:db/tupleTypes`, `:db/tupleType`."* Critically for a time-travel store: *"traveling back in time does not take the working schema back in time, as the infrastructure to support the past schema may no longer exist"* — Datomic explicitly gives up historical schema fidelity. **Constraint:** enumerate the frozen set up front and never grow it.

**5. Read-time upcasting chains (event sourcing).** Axon: *"the Event Store is considered a read and append-only data source"*; upcasters map revision *x* → *x+1*, chained, revision tag stored beside the payload. The admission: *"event upcasting cannot be done in full automation because the structure of the new event is unknown to the old event. Manually written upcasters have to be provided."* **Constraint:** every stored item carries a revision number, and the chain is linear.

**6. Deprecation-instead-of-versioning (GraphQL) — did *not* hold at scale.** graphql.org still teaches *"Design and evolve a type system over time without versions."* But Shopify — the largest public GraphQL API — versions quarterly (`2026-04`), guarantees each stable version *"for a minimum of 12 months, with at least nine months of overlap,"* falls forward when a version retires, and **delists apps** that keep calling removed resources. Deprecation-only survives while you can nag every consumer. It does not survive a population you cannot reach.

**7. Punning without subtyping (OWL 2).** OWL 2 lets one IRI name both a class and an individual, but *"The OWL 2 Direct Semantics treats the different uses of the same name as completely separate."* That separation is exactly what buys decidability (OWL 2 Full is undecidable; there are no complete reasoners for it). Direct validation of the target system's "a type is just a record carrying a contract, with no subtyping and nothing transitive": **that is punning, and the discipline that makes punning safe is refusing to let the two readings interact.**

## 5. THE FEDERATION CASE

**Reference design A — Kafka Schema Registry (get these exact).** Verbatim from Confluent:
- `BACKWARD`: consumer on X reads data from X or X-1. **Upgrade all consumers first.**
- `BACKWARD_TRANSITIVE`: consumer on X reads X, X-1, X-2, … (all registered).
- `FORWARD`: data from X readable by consumers on X or X-1. **Upgrade all producers first**, and ensure old-schema data is no longer reachable.
- `FORWARD_TRANSITIVE`: same, against all registered versions.
- `FULL` / `FULL_TRANSITIVE`: both. **Producers and consumers may upgrade independently.**
- `NONE`: checks off; *"upgrade all producers and consumers to the new schema version at the same time, or more likely — create a brand-new topic."*
- Default is `BACKWARD` (non-transitive), chosen *"so that you can rewind consumers to the beginning of the topic."*

The change-classes, Avro/Protobuf: add-optional and remove-optional are compatible in all three modes; **add-required is BACKWARD-only; remove-required is FORWARD-only**; widen-scalar is backward; narrow-scalar is forward. Confluent also documents that for **JSON Schema, openness changes the answer**: compatibility behaviour depends on both `compatibilityPolicy` (lenient/strict) and `additionalProperties` (open/closed), with the open content model permitting strictly more changes than the closed one. *(I could not reliably recover the per-column checkmarks for the JSON-Schema strict/open table from the rendered HTML — treat the direction assignments there as unverified; the structural point that openness alters compatibility is explicit in the text.)*

**Reference design B — ATProto Lexicons.** The rule, verbatim: *"The basic principle is that all old data must still be valid under the updated Lexicon, and new data must be valid under the old Lexicon."* That is `FULL_TRANSITIVE`, expressed in prose, in a system where nobody can be forced to upgrade. Enforced by four prohibitions: *"Any new fields must be optional. Non-optional fields can not be removed... Types can not change. Fields can not be renamed."* Escape hatch: *"If larger breaking changes are necessary, a new Lexicon name must be used."* Authority is *"rooted in DNS control of the domain authority"*, and *"The primary mechanism for resolving protocol disputes is to fork Lexicons in to a new namespace."*

Two further ATProto rules are directly on point for the target system. On failure: *"Protocol implementations should generally consider data which fails to validate against the Lexicon to be entirely invalid, and should not try to repair or do partial processing"* — **no repair, exactly the target system's stance.** On openness: *"Unexpected fields in data which otherwise conforms to the Lexicon should be ignored... treated at worst as warnings."* And the corresponding hazard, which the spec names itself: *"the Lexicon may be updated to include fields with the same field names but different types, which would make existing data invalid."* Unions default **open** (`closed: false`) precisely so *"future revisions of the schema could add more types to the list of refs (though can not remove types)."*

**Other prior art, briefly.** *Matrix room versions:* immutable once specified, **no ordering or hierarchy**, and a room changes version only by *upgrading* — a new room plus an `m.room.tombstone` in the old one, with the tombstone's power level explicitly raised in v12+. Migration is replacement, not translation. *Nostr:* no negotiation at all; event `kind` integer ranges statically partition semantics (regular / replaceable / ephemeral / addressable), and unsupported filters produce `["CLOSED", …, "unsupported: …"]` — refusal with a machine-readable reason, not degraded service. *ActivityStreams 2.0:* extensibility via JSON-LD, which in practice means extensions are ignorable strings; AS2 also had to declare AS1 terms (`verb`, `objectType`, `displayName`) permanently reserved.

**The option space for two attached stores whose contracts diverge**, ranked by how well it survives peers who never upgrade:
1. **Namespace the divergence away** (ATProto, Nostr): a changed contract is a *different* contract with a different id. No negotiation needed; cost is proliferation.
2. **Freeze the compatible core, negotiate nothing** (Matrix): the format version is immutable; change means a new container plus a pointer.
3. **Full-compatibility discipline** (Kafka FULL_TRANSITIVE): allowed changes are restricted to the intersection of backward and forward.
4. **Refuse** (the target system today, and Zero's `onUpdateNeeded` page-reload): correct, honest, and useless at scale.
5. **Translate** (Cambria): the only option that preserves both sides' semantics, and the only one with no production evidence behind it.

## 6. VERDICT ON WRITE-TIME-ONLY VALIDATION WITH OPEN CONTRACTS

**Defensible — with one missing piece that turns it from defensible into correct.**

The company is good: Avro validates at write and resolves at read; ATProto validates at write and *"should not try to repair"*; Datomic never re-validates history; Protobuf's whole wire format assumes unknown fields are simply skipped. Clojure's `spec` open maps and the tolerant-reader tradition are the same instinct. The position is not a fringe one.

**The missing piece:** Avro's write-time-only validation is safe *because the writer's schema travels with the datum*. Reader-side resolution is only well-defined when both schemas are in hand. The target system tags nothing: a body validated in 2026 against contract-v1 is indistinguishable, at read time in 2028, from a body that would fail contract-v3. **Store the contract version at validation time on the write.** Everything else in this report is secondary to that.

**Concrete failure modes.**
1. **Silent semantic drift.** A contract narrows `priority` from string to enum. Old bodies keep string values. Nothing re-validates, so no query, index, or UI can tell "legal under the old contract" from "corrupt." Dead *references* are rendered as dead; dead *values* are rendered as live.
2. **Name collision on undeclared keys.** ATProto names this exactly: a third party writes an undeclared `status: "open"`; the contract owner later declares `status` as an integer. Two populations of `status` now coexist, both legal-when-written, neither distinguishable. Protobuf's answer — `reserved` names and numbers — has no analogue here.
3. **Entrenchment (RFC 9413, Thomson & Schinazi, June 2023).** *"Errors in implementations or confusion about semantics are permitted or ignored. These errors can become entrenched, forcing other implementations to be tolerant of those errors."* In an open-contract federated store, undeclared keys that peers start reading become de facto schema that the contract owner can never reclaim. **The Postel critique applies to the attach/negotiation layer, not to the write-validation layer.** Being permissive about *data you already accepted* is fine — that's just immutability. Being permissive about *what a peer may hand you now* is the harm RFC 9413 describes. Keep the first; refuse the second loudly, with a machine-readable reason (Nostr's `CLOSED` prefixes are the pattern).
4. **The time-travel trap Datomic conceded.** *"Traveling back in time does not take the working schema back in time."* The target system is actually **better positioned than Datomic here**, because contracts are records and therefore already versioned on the branch DAG — but only if reads resolve a body against *the contract as of that commit*, not the contract as of now. If they don't, time-travel reads are lying.

## 7. RECOMMENDATIONS

**(a) Contract change within one store.**

**A1. Stamp every write with the contract commit it validated against.** (Highest value, lowest cost.) *Cost:* one reference per instance write. *Forecloses:* "a contract means whatever it currently means" — which is a thing you want foreclosed.

**A2. Split contract edits into two classes, and make the boundary a hard refusal, not a warning.**
- *Widening* (add optional key, add union variant, widen scalar per Avro's promotion ladder, add an alias for a rename): applied in place, existing instances remain valid by construction.
- *Narrowing* (remove a declared key, add a required key, narrow or change a type, rename without alias): **cannot be applied to the existing contract.** It mints a new contract record with a new id. Instances migrate by being re-linked, one `instance` link at a time, by whoever owns them.

*Cost:* contract proliferation, and a UI obligation to show "this archetype has a successor." *Forecloses:* one-shot rewrites of a live archetype. *Why:* this is the intersection of Protobuf, Datomic, ATProto and Kafka FULL. Every one of them independently landed here.

**A3. Support `alias` as the single blessed rename mechanism** (Avro aliases; Datomic's ident rename, where *"Both the new ident and the old ident will refer to the entity"*). Rename is ~40% of real schema churn and is the one narrowing change that is genuinely lossless.

**A4. Do not build lenses.** The field's own results say the composition law you'd need is unattainable with useful operators; the one serious attempt shipped a non-lens as its flagship operator and stopped in 2020. Spend the budget on A1–A3.

**(b) Attaching a peer at a different schema version.**

**B1. Stop refusing at store granularity. Attach always succeeds; compatibility is resolved per contract.** A version mismatch on one archetype should not cost you the other 400. *Cost:* the attach result becomes a report, not a boolean. *Forecloses:* the simple "one store, one version" mental model.

**B2. Grade each shared contract into three buckets and render the grade:** *identical* (same contract id and commit — full interop); *compatible* (peer's contract is a widening of mine, or vice versa — read normally, note the direction); *foreign* (divergent narrowing, or unknown id — **render as a foreign type, exactly as dead references are rendered**). You already have the "permanently visible as broken, never repaired" idiom. Reuse it; do not invent a second failure aesthetic.

**B3. Make contract identity carry authority.** ATProto roots it in DNS; here, the minting store's id is the natural root. A peer that narrows a contract you own has, by A2, minted a *new* contract — so B2's "foreign" case is rare by construction, and the federation problem mostly dissolves into the naming problem. *Cost:* peers cannot extend your archetypes in place; they must mint their own and multi-type. *Given that multi-typing is already normal in this system, that cost is near zero — this is the recommendation with the best cost/benefit ratio in the whole report.*

**B4. Version the *store format* separately, Matrix-style:** immutable, unordered, no implicit hierarchy, upgrade = new container + tombstone pointer. Do not conflate "my store format is v3" with "my contracts are v3." Refusing attach on *format* mismatch is correct; refusing on *contract* mismatch is not.

**(c) Eager vs lazy index re-derivation.**

**C1. Neither. Invalidate eagerly at O(1); re-derive lazily on read; backfill in the background.** Concretely: index rows carry the contract commit they were derived under. A contract edit bumps one epoch value — no fan-out, no commits. A read compares the row's stamp to the current epoch and re-derives on mismatch (Noria's upquery). A background sweep backfills at a rate you control.

This is Noria's measured result, not a guess: with partial state, *"Noria creates the new operators and view as empty, and populates them on demand in response to reads"* and *"the transition completes immediately"*; with full materialization disabled, the same transition degraded throughput for roughly a minute.

*Cost:* one version stamp per index row (bytes), one branch on the read path, and a warm-up window where some reads are slow and write throughput dips from upquery contention (Noria measured exactly this). *Forecloses:* treating index rows as pure derived data with no provenance.

**C2. Reject eager fan-out specifically because of the DAG.** In a store where every write is a commit and nothing is destroyed, re-deriving N instances on a contract edit writes N commits carrying no user intent — permanent history pollution that every future time-travel read must scroll past. This is a stronger argument against eager here than in any conventional database.

**C3. Reject naive lazy for the same reason as §6.1:** "stale until next write" is only unacceptable because stale rows are *indistinguishable* from fresh ones. The stamp in C1 is what makes lazy honest, and it costs almost nothing.

**(d) Seeded-store migration.**

**D1. Replace idempotent-by-marker with content-hash-keyed repeatable seeding.** Flyway's model exactly: versioned migrations run once; **repeatable migrations re-run whenever their checksum changes**. Your bootstrap declarations are repeatable migrations that were mislabelled as versioned ones. *Cost:* a canonical serialization + stable hash per declaration, and a `seeded-from` stamp on seeded records. *Forecloses:* nothing you currently have.

**D2. Reconcile only unmodified records; report drift on the rest.** If a seeded record's head commit is still the bootstrap commit, re-seed it. If a human has since edited it, do not touch it — surface it as drift. (Terraform/Kubernetes reconciliation semantics.) *Cost:* a drift report nobody wants to read. *Forecloses:* silent overwrite of user edits, which is the correct thing to foreclose.

**D3. Seeded contract *changes* are not special.** Once D1 lands, a changed seeded declaration is a contract edit and routes through A2: widening re-seeds in place, narrowing mints a new contract. Do not build a second migration mechanism for bootstrap.

## 8. WHAT I COULD NOT ESTABLISH

- **The Cambria PaPoC@EuroSys 2021 paper text.** dblp confirms it exists (DOI 10.1145/3447865.3457963); ACM DL returned HTTP 403. There may be formal results or a retrospective in it that I have not seen.
- **Any explicit Ink & Switch post-mortem on why Cambria stopped.** None found. The essay's "Findings"/"Open questions" are the only self-assessment; everything in §2 about *why it stopped* is inference from those plus the 2024 repo state established by the earlier sweep.
- **Column assignments in Confluent's JSON-Schema strict-policy compatibility tables.** The rendered HTML lost table structure; each row showed one checkmark whose column I could not determine. The surrounding prose confirming that `additionalProperties` open/closed changes compatibility is verified.
- **Whether the Bx workshop has genuinely ended** or merely changed venue/name. dblp shows no proceedings after 2022; I could not confirm a formal wind-down.
- **The Symmetric Lenses (POPL 2011) paper text** — only the dblp record and secondary characterizations from Johnson & Rosebrugh 2016 / Johnson & Renaud 2019.
- **Practitioner post-mortems on event-sourcing upcasting going wrong.** I have the mechanism (Axon, primary) but no verified war-story source; web search budget was exhausted at the start of this session, so I could only reach URLs I could address directly. Anything I might have said about Greg Young's *Versioning in an Event Sourced System* would have been from memory — I have said nothing.
- **Solid's approach to shape/schema evolution** — not reached.

## 9. LEADS

1. `https://www.inkandswitch.com/cambria/` — the essay; Appendix I (lens laws as they define them), Appendix III (six ways to convert scalar↔array, none good).
2. `https://doi.org/10.1145/3447865.3457963` — Cambria, PaPoC@EuroSys 2021; the one primary source I could not open.
3. `https://www.cis.upenn.edu/~bcpierce/papers/lenses-toplas-final.pdf` — Foster et al. TOPLAS 2007; §3 is the lens laws, §10 the exact map onto Bancilhon-Spyratos and Gottlob.
4. `https://ceur-ws.org/Vol-2355/paper7.pdf` — Johnson & Renaud, symmetric c-lenses and d-lenses are *not* coextensive.
5. `https://ceur-ws.org/Vol-1571/paper_13.pdf` — Johnson & Rosebrugh, unifying set/delta/edit lenses; the best map of the taxonomy.
6. `https://avro.apache.org/docs/1.12.0/specification/` — Schema Resolution: the canonical writer/reader rules and promotion ladder.
7. `https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html` — the seven compatibility modes plus the upgrade-order consequences.
8. `https://atproto.com/specs/lexicon` — Lexicon Evolution, Authority and Control; the closest structural analogue to attached peer stores.
9. `https://protobuf.dev/best-practices/dos-donts/` — "Don't Add a Required Field", "Don't Change the Type of a Field".
10. `https://protobuf.dev/programming-guides/proto3/` — Consequences of Reusing Field Numbers; reserved numbers and names.
11. `https://docs.datomic.com/schema/schema-change.html` — what may change, the never-alter list, and the time-travel caveat.
12. `https://www.rfc-editor.org/rfc/rfc9413.html` — Thomson & Schinazi on why tolerance entrenches errors.
13. `https://www.usenix.org/system/files/osdi18-gjengset.pdf` — Noria; §8.5 is the measured eager-vs-lazy answer.
14. `https://martinfowler.com/bliki/ParallelChange.html` — expand/migrate/contract and the discipline it demands.
15. `https://shopify.dev/docs/api/usage/versioning` — the largest public GraphQL API abandoning deprecation-only for quarterly versions.
