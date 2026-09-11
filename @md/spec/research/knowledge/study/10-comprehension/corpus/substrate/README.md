# Typed structure as a medium

Several lanes of the sweep tested whether a typed, versioned, permission-governed substrate is buildable, whether anyone has built one, and whether typed structure earns its cost for a model reader. The word *substrate* is given in the corpus entry: the common floor that data and programs live on, as prose is the floor knowledge lives on. This folder holds the answers and the graveyard.

## 1. The verdict, stated as the adversarial lane stated it

One agent was sent specifically to stress-test the thesis, and its verdict is the most useful single paragraph in the sweep:

> The claim survives in half, and the half it loses is the half that was stated most confidently. "Typed, self-describing structure is the right substrate" holds — but only for a specific and narrow set of properties (identity, permission, provenance, freshness, address, action space), and only when the types are *declared or deterministically observed*, never *inferred at breadth*. "Text-as-medium must be superseded" is refuted outright: prose is the winning medium for the payload, and every 2026 system that won did so by typing the *edges* around a prose or code body, not by typing the body.

Three corollaries follow, each independently supported: **type the edges, not the content**; **keep the vocabulary tiny and declared**; and **structure is only worth it if the system can decline to answer where it has no evidence — and that refusal has to be enforced in code, because asking for it in a prompt does not carry across models.** [`does-structure-pay.md`](does-structure-pay.md) holds the evidence and the decision rule.

## 2. The vocabulary always outgrows its use

The formal-knowledge-representation lineage answers the vocabulary question empirically, at web scale: the largest shared vocabulary on the open web publishes its own usage statistics, and the overwhelming majority of it is dead weight. Twelve types reach ten million or more domains and about forty-seven account for essentially all high-volume deployment, while roughly 77% of the vocabulary sits below a thousand domains. *Measured, from the vocabulary's own published usage statistics.* **A closed vocabulary of a few dozen types is not a limitation; it is roughly what the open web converged on anyway.** The figures and the registry that corroborates them are in [`formal-kr.md`](formal-kr.md) §1.

The same lineage answers the transitivity question. The subclass hierarchy is the part that rots: a live collaborative knowledge base carries roughly 2.39 million classes simultaneously marked first- and second-order. And the most successful W3C vocabulary made its hierarchy **non-transitive on purpose** in 2009, splitting transitivity into a separate opt-in property. [`formal-kr.md`](formal-kr.md) holds it, along with the state of the standards, which is worse than anyone assumes.

## 3. Everything has been built; the combination has not

Version control combined with knowledge structure is not novel — TerminusDB and Fluree both ship it and both are alive. Permission written in the query language is not novel — Postgres row-level security, Fluree's policy-as-query, Meadowcap's capability-as-area. Membership intersection as the primary navigation is ancient, and every prior attempt died for the same reason: it required clean typed metadata on every item and nobody had it.

What no system holds is the *combination*, and the interaction between owner-scoped contracts and branch-versioned types is where the literature is thinnest and the shipped systems all capitulate. [`typed-stores.md`](typed-stores.md) holds the map and the graveyard.

## 4. Transitive permission is the documented failure

Google's own authorization paper names the cost, and its answer denormalises the transitive closure at a write-amplification price it applies only to selected namespaces. And retrieval turned a latent problem into an actual one: latent transitive permissions were harmless while discovery was manual, and a model retrieval layer performs the closure exhaustively. [`permission.md`](permission.md) holds the quotations, the latency figures, and the vendors documenting the failure in their own product documentation.

## 5. Nobody merges structure; they serialize it

Schema change is the confessed unsolved problem, and the research that named it closed the file. What every production system does instead is forbid the change or take one whole side: schema conflicts block a merge and resolve by accepting an entire table from one side; the dominant lakehouse format has branches and tags but **no branch merge at all**, only fast-forward; the one system that models schema migration as first-class leaves migration of the inheritance hierarchy explicitly unimplemented. [`schema-evolution.md`](schema-evolution.md) holds what works and what the bidirectional-transformation literature proves cannot.

## 6. The local-first field consolidated

Three of the best-known independents exited in twelve months; two of the loudest retrospectives in the field are systems abandoning conflict-free replicated data types. Meanwhile the substrate — one collaborative-editing library, one WebAssembly database — exploded in downloads, pulled by AI tooling rather than by collaborative-app demand. [`local-first.md`](local-first.md) holds it.
