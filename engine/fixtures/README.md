# Engine conformance fixtures

Ground truth for the program ↔ engine contract, written from [`spec/engine.md`](../../spec/engine.md) before implementation. Same case format as [`db/fixtures/`](../../db/fixtures/README.md) — given/when/then, semantics only — extended with the engine's two axes: **mounts** (federation) and **process** (boundary identity). The engine crate's tests and the SDK's tests both consume these files through thin adapters.

## Format deltas from db/fixtures

A case gains three optional fields:

```json
{
  "case": "section/short-name",
  "spec": "engine.md anchor the claim is written from",
  "mounts": { "peer": [ /* declarations seeding a read-only mount */ ] },
  "given": [ /* declarations applied to the ACTIVE project, in order */ ],
  "process": { "read": ["root-ids"], "write": ["root-ids"] },
  "when": { /* a declaration (= commit op) OR { "op": "scope" | "get", ... } */ },
  "then": { /* expectation */ }
}
```

- `"mounts"` — each key becomes a read-only mount whose db is seeded with the listed declarations before mounting. The active project always exists; `given` seeds it. Omitted → active project only.
- `"process"` — the acting identity: the adapter creates a process (via the engine's `run`, trivial program, fake runtime) whose run-level read/write boundaries are built from these roots, and issues `when` under that process's context. Omitted → host context (unrestricted).
- `"when"` as a declaration is the `commit` op, exactly as in db fixtures. `"when"` as `{ "op": "scope", "scopes": [...], "exclude"?, "limit"?, "offset"?, "include"?, "fts"? }` or `{ "op": "get", "chunk": id }` is a read issued under the process context.

**Expectations:**

- `{ "rejected": true, "code"?: "BOUNDARY_VIOLATION" | "READ_ONLY_MOUNT" | "VALIDATION_ERROR" | "NOT_FOUND" | "INVALID_REQUEST" }` — the op must fail with the named wire code (code omitted = any rejection); a rejected commit must be atomic (nothing from it readable afterward, host-view).
- `{ "result": { ...expect... } }` — the op's own result, asserted with the db vocabulary: `contains`, `excludes`, `ids`, `ordered_ids`, `counts` (`{ "in_scope": n }`), `has_body`; for `get`: `null: true` or `{ "id": ..., "body_status"?: ... }`.
- `{ "reads": [ ... ] }` — after a successful commit, host-context scope reads verifying post-state (same shape as db fixtures).

Run/await/cancel/subscribe lifecycle cases are async and runtime-provider-shaped; they live in the engine crate's Rust tests, not here — fixtures carry only the protocol-shaped read/write/boundary/federation claims.
