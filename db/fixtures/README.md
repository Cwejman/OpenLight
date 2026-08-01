# Substrate conformance fixtures

Ground truth for the consumer ↔ db contract, written from [`spec/substrate.md`](../../spec/substrate.md) before any implementation. Every case is a claim the spec makes; the db crate's tests and the SDK's tests both consume these files through thin adapters, so the two implementations cannot drift apart silently.

## Format

Each file holds an array of cases grouped by spec section. A case:

```json
{
  "case": "section/short-name",
  "spec": "substrate.md anchor the claim is written from",
  "given": [ /* declarations applied in order; each must succeed */ ],
  "when": { /* one declaration */ },
  "then": { /* expectation */ }
}
```

A **declaration** is `{ "chunks": [...], "placements": [...] }` — atomic, as the spec defines. Chunks are `{ "id", "name"?, "spec"?, "body"? }`; placements are `{ "chunk": id, "scope": id, "type": "instance" | "relates", "seq"? }`. Fixture ids are readable strings (tracked debt: the substrate generates ids; adapters may map).

Declarations grow four optional fields the history and branch claims need:

- `"remove": { "chunks": [ids] }` — logical removal (substrate.md *Lossless*), a mutation like any other; may stand alone or beside `chunks`/`placements`.
- `"as": "label"` — names the commit this declaration produces, for later `at` reads.
- `"branch": "name"` — the branch this declaration commits to; omitted means the adapter's default branch.
- `{ "fork": { "branch": "name", "at": "label" } }` — a given-step that forks a new branch from a labeled commit; not a declaration.

**Expectations** are one of:

- `{ "rejected": true, "reason"? }` — the declaration must fail atomically: no chunk or placement from it is readable afterward. `reason` is non-normative prose until the error taxonomy is pinned in db.md's implementation pass.
- `{ "reads": [ { "scope": [ids], "expect": ... } ] }` — scope queries against the post-write state and what they must contain.

A read carries the query surface substrate.md defines: `scope` (intersection roots), `exclude`? (negation roots), `limit`?/`offset`? (tail-first pagination), `include`? (`{ "body": false }` projection), `at`? (a commit label, temporal read), `branch`? (default branch when omitted). A read of `{ "fts": "term" }` instead of `scope` is a whole-field full-text search.

`expect` asserts any of: `contains` (ids that must appear), `excludes` (ids that must not), `ids` (the exact result set, order-insensitive), `ordered_ids` (the exact result sequence — windows of ordered scopes read in ascending seq), `counts` (`{ "total": n }`, describing the full set regardless of pagination), `has_body` (false asserts no read chunk carries a body), `unresolved` (the exact set of named scope roots that resolve to nothing — `[]` asserts every root resolved; a dead root is metadata on the result, never an error, so an empty result from a real scope stays distinguishable from one from a dead reference).

Adapters bind `given`/`when` to their transport's real ops and map expectations to real error types. The fixtures carry semantics only, never protocol shape — the recorded claim is format-independent.
