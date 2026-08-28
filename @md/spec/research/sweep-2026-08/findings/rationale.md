# Recording why: what the capture evidence says

Night bets on recorded rationale — decisions written down, records that amend state and retire into git, a field where every change walks back to its cause. The sweep pulled the design-rationale, ADR, RFC, and design-doc literatures whole, and the news is uncomfortable: **capture fails structurally and the failure is well-theorized; the measured benefit of recorded why is nearly empty; and the one place a positive effect has appeared is brand new — rationale as *machine* context.** The fold ends with the boundary condition that decides whether night's bet escapes the graveyard.

## Capture fails structurally

The canonical account (Shipman & Marshall, an experience-essay, not a measurement — but unrefuted since 1999) gives four mechanisms: cognitive overhead (formal capture demands chunking, naming, linking, labeling at exactly the moment of work), tacit knowledge (experts cannot reliably account for their expertise; introspection interrupts and changes the task), premature structure, and situational structure. The sharpest observation in the literature: design students *cannot produce* IBIS-style argumentation even though videotapes show their natural discussions already follow IBIS structure — **post-hoc analysis is not generation**. The one rich capture case ever documented required two dedicated scribes processing audiotaped meetings. Capture cost has never been quantified; the phenomenon is richly evidenced, the mechanism argued, the cost unmeasured.

## The benefit is nearly unmeasured, and what is measured is thin

- The entire quantitative case that recorded rationale helps a later reader: **one controlled experiment, N = 17, significant on one of two systems, never replicated** — plus an observational N = 6 in which only 41% of readers' why-questions were answerable from a professionally-scribed rationale document.

- ADRs at scale: ~51% of ADR files are committed once and never touched again; ~4.6% of adopting repos show sustained team use; and the first study to look for an impact (921 repos, ICSA 2026) found "at most, modest observable effects" — with **63% of ADRs born with status "accepted," bypassing the deliberation they exist to record**. ThoughtWorks put ADRs at "Adopt" on zero data, five years before anyone counted maintenance.

- Design docs: the canonical text is a 2020 opinion post; Google's only published number is that ~90% of GooWiki documents had no views or updates in recent months; and the one controlled study (N = 65, randomized) found **no effect of document format** on architecture understanding — prior exposure to the code dominated everything.

- Yet developers *do* write why, in the flow of work: 98.9% of Linux kernel OOM-killer commits contain rationale sentences. The failure is not willingness — it is standing records beside the work. That reads as support for night's records-are-events discipline: rationale that rides the change survives; rationale that lives as a separate artifact rots.

## Heavyweight processes silt; the fix that works is shrinking the decision

Measured on the projects' own repositories: Rust has 215 open RFCs at a median age of 905 days with no exit path; Kubernetes has 343 non-terminal KEPs of which only 14 were ever explicitly killed; the IETF's editorial stream produced three RFCs in four years. The only intervention with a visible before/after anywhere in this data is **routing around the heavyweight process with a lighter one that decides less**: Rust's compiler MCPs (585 filed, 17 open, ~70-day merges) and Python's domain councils. The sharpest published diagnosis (opinion, but it fits the numbers): RFC processes lack an explicit *decide* step, so they default to "no". For night's own working process, the implication is direct — keep the unit of decision small, and give every record a terminal state.

## The new exception: rationale as machine context

The first measured positive effect for decision records anywhere is 2026 work using them as **LLM context**: in a single-author, single-project preprint, ADRs served to an agent cut development time ~10% — and the striking detail is qualitative: the *same TDD instruction* carried as a bare rule produced zero end-to-end tests, while carried with its rationale it produced 16–25. One unreplicated n = 1; grade accordingly; but it is exactly night's bet — that a model, like a person, acts differently when it holds the why — and it is the only place in this entire literature where recorded rationale has moved a measured outcome. Related and better-grounded: a 3–5-record recency window matches full decision history for generation purposes, so the *working set* of rationale is small.

## The boundary condition

The finding that decides everything (from the organisational evidence — [`travel.md`](travel.md) carries its context): **prescriptive artifacts — those that generate something downstream — get maintained; descriptive artifacts do not.** Every corpse in this fold's graveyard was descriptive: a record beside the system, consumed by nobody, maintained out of discipline until discipline ran out. Night's answer must be structural, not aspirational: rationale survives *if the field makes it load-bearing* — read by agents as context, walked by traceability, part of what the next run stands on. The evidence does not say recording why is worthless; it says recording why into an artifact nothing consumes is worthless, reliably, everywhere it has been tried.

## Not established

Effect sizes for the one controlled experiment (full text unobtained); the second-oldest candidate experiment (ICSM 1994) entirely unverified; any measurement of capture cost; any replication of the machine-context result; whether Oxide's RFD culture works (zero published metrics — employee assertion only).

---

*Sources: [`a7ea3bc0963c0e185`](../raw/a7ea3bc0963c0e185.md) (design-rationale evidence chain, Shipman & Marshall read in full) · [`aae121db667d39f2d`](../raw/aae121db667d39f2d.md) (ADR/RFC/design-doc numbers, the machine-context exception) · [`ab6fb706729be0f77`](../raw/ab6fb706729be0f77.md) (the process-throughput data computed from primary repos) · [`a63bf2eb6c5d05ba8`](../raw/a63bf2eb6c5d05ba8.md) and [`a7b21ac3d71f8c8f6`](../raw/a7b21ac3d71f8c8f6.md) (the outcome-evidence audits).*
