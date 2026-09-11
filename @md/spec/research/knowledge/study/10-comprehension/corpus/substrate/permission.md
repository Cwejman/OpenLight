---
under: the code
kind: brief
---

# Permission, and what transitivity costs

One agent read Google's authorization paper and the ecosystem built on it, and found that the hard problem is named by the authors themselves rather than by commentators — and that a retrieval layer turned a latent problem into an actual one.

## 1. The cost is stated in the source

Zanzibar (USENIX ATC '19). §1: "Evaluating whether a user belongs to a group can entail following a long chain of nested group memberships." §3.2.4: "**Recursive pointer chasing during check evaluation has difficulty maintaining low latency with groups that are deeply nested or have a large number of child groups.**" Note that depth *and* breadth both break the walk.

Their answer, Leopard, denormalises the transitive closure into two tuple types — ancestor to any direct-or-indirect subgroup, and user to direct parent group — stored as ordered integer lists in a skip-list structure so unions and intersections cost O(min(|A|,|B|)) seeks. The price is write amplification: "**a single Zanzibar tuple addition or deletion may yield potentially tens of thousands of discrete Leopard tuple events.**" It is applied only to *selected* namespaces. Google did not materialise everything.

Scale, for calibration: over 2 trillion relation tuples, over 10 million client queries per second, check peaks around 4.2 million queries per second, over 1,500 namespaces. Check latency at the 50th, 95th, 99th and 99.9th percentiles peaks at roughly **3, 11, 20 and 93 milliseconds** — a thirty-fold spread between median and tail, and the tail is where the deep walks live.

**The paper states no explicit depth limit.** The clone ecosystem invented those.

## 2. Depth limits were arbitrary and are being abandoned

SpiceDB defaults to a maximum depth of **50 hops**, and its error message says so; critically, "SpiceDB does not have a dedicated cycle detector" — cycles are detected by hitting the depth wall. OpenFGA defaulted to **25**, with a breadth limit and a 1,000-result cap on listing.

And OpenFGA is now removing the depth limit as a bad proxy. From its July 2026 post: "**A shallow recursive graph can be more resource-intensive than a deep linear one**, but the old algorithm used a fixed depth limit of 25 as its only complexity guard." It is replaced by datastore throttling, graph flattening and context cancellation. **Fan-out is the cost driver, not depth** — which retires "keep your hierarchy under N levels" as folklore.

The hardest numbers available are vendor-authored but concrete. A 30-level recursive folder chain: 772 µs to 70 µs in memory after query planning, 715 kB to 120 kB — and against Postgres, **19.55 ms to 10.41 ms**. A document shared with 100 groups and 1,000 users: 43 kB to 4.2 kB. A synthetic depth-30 chain costing roughly 20 milliseconds per check on Postgres is the concrete price of transitivity. The same vendor's diagnosis: customers model "with recursion, very deep nesting, and with relationships that connect thousands and thousands of objects," and arrow operations over thousands of groups mean "we would have done a lot of work for nothing" when the subject is in none.

## 3. Materialising is Leopard, reinvented commercially

The industry has converged on the same conclusion: the walk fails at list time. SpiceDB's own documentation routes list-filtering to a lookup that works for "relatively small" sets, a fetch-then-check loop, or **Materialize** — a denormalised permission table you join against. The marketing states the admission plainly: "search, analytics, entitlement management, and AI retrieval increasingly need continuous access to large, constantly updated sets of denormalized permissions," and "a single relationship write can therefore affect permissions across large portions of the graph, particularly when nested groups are involved."

Uniform filtering including counts is decisively distinctive against this family. It is not distinctive against SQL, where row-level security filters aggregates by construction, nor against Fluree, which already does per-datum policy filtering inside query execution — see [`typed-stores.md`](typed-stores.md).

## 4. The consolidation

Two survivors, two absorbed, one dead. **OpenFGA** reached CNCF Incubating on 2025-11-11 with 37 public production adopters — the community leader. **SpiceDB / AuthZed** is commercially the strongest and actively shipping. **Ory Keto** is maintained and self-describes as the most widely adopted, a claim OpenFGA's numbers contest. **Permify** was acquired by an identity vendor. **Warrant** went into another. **Aserto wound down** in April 2025, its control plane shut down that May, with the open-source project continuing.

## 5. Inheritance models, and the vendors conceding

The best-evidenced part of this territory is the vendors documenting their own oversharing failure.

**Google Drive now forbids narrowing below inheritance.** "Access you apply to a folder is inherited by all files within it," and "You can no longer give someone less access to an individual file if they have higher access to its parent folder." Simplicity chosen over expressiveness.

**Notion "respects the broadest level of access given to a user."** Union semantics mean one broad grant silently widens a whole subtree.

**Microsoft, on the record.** Restricted SharePoint Search: "It's a short-term solution that gives your organization's administrators time to review and audit site and file permissions. **It's not intended or scalable for long-term use**," capped at 100 sites, and "isn't a security boundary and doesn't change any permissions." New enablement was blocked from **2026-07-31**. Its worked example is explicit: a budgeting site where the owner has not set up proper permissions, so when a user asks the assistant for budgeting information, it returns information from that site. The successor, Restricted Content Discovery, "doesn't change existing permissions," is licence-gated, and for sites over 500,000 items an update "could take more than a week to fully process." There is a whole remediate-oversharing pillar in the deployment blueprint.

That is unusually strong evidence, because it is a vendor conceding the problem in its own documentation rather than selling against it.

**The structural point:** latent transitive permissions were harmless while discovery was manual. A retrieval layer performs the closure exhaustively. **The model did not create the leak — it enumerated it.**

## 6. Filtered retrieval is the wrong case for vector search

Post-filtering wrecks recall by construction: filtering after the top-k "can return very few or even zero results, even though there may be relevant records in the dataset"; pre-filtering "disrupts how ANN engines work" because approximate nearest-neighbour search requires the full index. The academic answer is predicate-agnostic traversal (ACORN, arXiv:2403.04871), claiming 2–1,000× higher throughput at fixed recall, with ideas adopted into vector databases.

Combined with §5: a permission filter is a high-cardinality, per-user, constantly churning predicate — the worst case for filtered approximate search. Which is why vendors precompute permission sets instead. Set-intersection over membership *pre*-filters, which is the right side of that trade.

## 7. What is not established

No published argument *advocating* shallow or non-transitive permission on performance grounds could be found. The evidence is behavioural — Google removing the ability to narrow below inheritance, OpenFGA discarding its depth limit — not argued. "Flatten your permissions" has no citable advocate.

Also unestablished: any independent, non-vendor benchmark of any Zanzibar clone; any academic work quantifying bounded-depth against unbounded evaluation complexity; and any **named public breach** attributable to assistant oversharing. Microsoft's own hypothetical is the only case on record. Treat "the assistant leaked X at company Y" as folklore until sourced.

Reports: [`aea19b144c46bfc26`](../../../../../sweep-2026-08/raw/aea19b144c46bfc26.md), [`abffcf492c6f3d77d`](../../../../../sweep-2026-08/raw/abffcf492c6f3d77d.md), [`adc9dab44aefdde97`](../../../../../sweep-2026-08/raw/adc9dab44aefdde97.md).
