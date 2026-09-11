# What breaks

Three things break when a typed medium runs, and all three are documented by the people who hit them rather than by their critics. This brief takes them in the order of how badly they bite: schema change, which nobody has solved and the theory says nobody will; transitive permission, whose cost is stated in its own source; and deriving the interface from the data, where six organisations hit the same wall independently. The last two sections hold what that third lane found that generalises past interfaces, and where the shipped products stop.

## 1. Nobody merges structure; they take one whole side

The shipped behaviour is uniform. In Dolt, data conflicts resolve row by row and schema conflicts prevent the merge from completing, resolving only by taking an entire table from one side. Apache Iceberg has branches and tags with independent lifecycles and no branch merge at all — the documented workflow closes by fast-forwarding. TerminusDB is the only system modelling schema change as first-class, classifying changes that cannot possibly invalidate existing data as needing no migration and requiring an explicit, replayable migration for everything else; two of its roughly sixteen operations, including the one that migrates the inheritance hierarchy, are unimplemented.

The lesson in one line: a versioned contract can guarantee exactly one thing, that a decode will not fail, for a bounded set of syntactic changes, in a bounded direction, against a bounded set of prior versions. It cannot guarantee semantics. A field that changes meaning passes every check. *Observational, from shipped behaviour and documentation.*

## 2. The one serious attempt pivoted, and the theory says why

Ink & Switch's Cambria took this on with bidirectional lenses: one specification yielding both directions of a translation between schema versions. Its real result is not the lenses. It is that the team started by translating on write and abandoned it — too much work happened eagerly, and it could not handle new schemas arriving after a write had already been made — and switched to tagging each write with its schema and translating on read. That pivot is the transferable finding, and it lands them where Avro has been for eighteen years: the writer's schema travels with the data, and the reader resolves against it.

The theory underneath says the harder half cannot be bought. The law that would let you apply two migrations one at a time and get the same result as applying them together is explicitly not required of a well-behaved lens, because the combinators you need fail it "for reasons that seem pragmatically unavoidable." For a store that replays a chain of contract changes, that is the whole ballgame. *Proved; the production evidence is that nobody shipped it — the prototype was never productionised and its own team found it too unstable to use as their system of record.*

What does work in production is unglamorous and consistent. Identifiers are immutable and their reuse forbidden. Both shapes are valid during a migration, and the contract phase must actually execute. And for a federation whose members you cannot order to upgrade, the only honest setting is full compatibility in both directions, enforced by prohibitions — new fields optional, non-optional fields never removed, types never changed, fields never renamed, with a new name as the only escape hatch.

## 3. Transitive permission costs what its authors said it would

Google's Zanzibar paper names the problem in its own text: working out whether a user belongs to a group can mean walking a long chain of nested memberships, and that walk has difficulty maintaining low latency when groups are deeply nested or have many children. Both depth and breadth break it. Its answer precomputes the full reachability set at a write-amplification price — a single change may produce tens of thousands of downstream events — and Google applied it only to selected namespaces. Nobody materialised everything.

The clone ecosystem invented depth limits the paper never stated, and is now abandoning them, because a shallow graph that branches widely can be more expensive than a deep one that does not. Fan-out is the cost driver, not depth, which retires "keep your hierarchy under N levels" as folklore. *Measured by vendors on their own systems; no independent benchmark of any Zanzibar clone exists.*

The structural point generalises past permission, and it is the one to carry. Latent reachability was harmless while discovery was manual, and a retrieval layer performs the closure exhaustively. The model did not create the leak; it enumerated it. The strongest evidence is vendors conceding it in their own documentation: Google Drive now forbids giving someone less access to a file than they have to its parent folder, Notion respects the broadest grant a user has, and Microsoft shipped a search restriction it describes itself as "not intended or scalable for long-term use," with a worked example of an assistant returning budget figures from a site whose owner never set up permissions. *Vendor documentation, which is unusually strong evidence precisely because it concedes rather than sells.*

## 4. Interface as data: the wall everyone hit

Six large organisations built server-driven interface systems — where the server sends a description of the screen and the client renders it — between 2021 and 2023, and documented them candidly. Five converged independently on the same fix: a capability negotiation in which the client declares which component types it can render and the server refuses to send anything else.

Nobody solved shipping a new component to an old client. Plaid's specification says it flatly: adding a new kind of pane is a major version bump requiring a client upgrade. So the promised benefit — shipping interface changes without a release — holds only inside the vocabulary already shipped, and new vocabulary costs a release plus indefinite maintenance of a frozen graph for every stranded client generation. Uber went furthest, building a compiler that validated every screen against every previously shipped runtime; that is the correct answer, it costs a compiler, a monorepo and a build matrix, it reached about sixteen flows in production, and the department was shut down.

## 5. Two failures from that lane that generalise

The untyped escape hatch is a named architectural tier at two of the six, and both report its boundary eroding. The instructive part is the recovery: the escape hatch shrank when the design system became a typed vocabulary. A typed vocabulary earns its keep by making the untyped part smaller, not by eliminating it.

And a strict serializer that rejects unknown values, combined with a component vocabulary that keeps growing, is a crash — DoorDash had to migrate off a library that failed whenever a new enum case arrived. A closed-world reader and an open-world writer cannot share a channel.

## 6. Where the product layers stop

Notion, Airtable, Tana and Anytype each let you add types and add properties to them, and each has a closed set of view kinds — ten, six, seven and six. The closure is one level deeper than that, and this is the part usually missed: none of them lets you define a new *property type* either. The list of formats a property may have is an enumeration in the protocol rather than a record in the store, so the vocabulary of kinds is fixed while the vocabulary of instances is open.

Meanwhile React deleted its only runtime contract in version 19, silently ignoring prop-type checks, during exactly the period when agents started needing to introspect components. *Observational; read from protocols and SDK source during the sweep.*

The detail is in [the material's substrate folder](../../corpus/substrate/README.md) and [its interface folder](../../corpus/interface/README.md).

What every figure above inherits — the sweep's conditions, whose marks these are, and what was never checked — is in [what this rests on](../ground.md).
