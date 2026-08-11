# The object model — why remotes need content addressing

Found 2026-08-09, author-driven. **Not ruled, not a v0.1 change.** One finding, what it buys, the cheap move it justifies now, and what it forbids hardening. Narrowed deliberately: the day's wider exploration (containment, storage decomposition, buffers as a motivating case) did not survive its own scrutiny and is not carried here.

---

## The finding

The data model is git's: immutable versions, a commit DAG, branches, merge as union of additions, lossless, distributable. The storage is a mutable page store with that history reimplemented in tables — versioned rows plus materialized current state, resolved by walking HEAD to root.

Locally the mismatch is invisible. At a remote it is fatal, because the one thing content addressing gives and SQLite cannot is **do you have this?** Without hashes there is no delta sync, no dedup, no verification of what a peer claims, and no cheap answer to *did this actually change*. You ship row diffs and reconcile by reading everything.

Supporting evidence that the model is already git-shaped and the storage is not: **links are derived, rebuildable, never in commits** — the correct authority relationship, applied to exactly one table; **merge is already ruled as union-of-additions with hard fail on true collision**; and **branch ops are unbuildable on the protocol**, because branches are a second head beside a model with no general notion of one.

## What it buys, at a remote

Sync stops being a subsystem. A remote replica is another store of the same content, and every part is an existing verb:

- **Fetch** is a read; the remote joins the federated view like a mount.
- **Divergence** is a diff — and the diff surface already exists. One mechanism serves every pair: two commits (time), two branches (merge), two stores (sync).
- **Pull** is the ruled merge law across space instead of across branches.
- **Push** is placement governance across the boundary: who may write into a store is who holds write there.
- **Materializing a remote region locally** is the derived-data pattern — a copy carrying source and commit, staleness a reader concern. Never a second truth.

**Why the mount already works, and why integrations will not.** A mounted peer never pollutes your history because its history stays its own — residence and history fused is exactly where the protection comes from. That holds today only because we mount things that share our shape and our human pace. An integration brings a rate you do not control — a mailbox, a repo, a feed — and inherits none of that protection unless the same boundary applies to foreign stores.

**Ownership is the tree.** A git tree names its entries within itself, names unique within it — the same sentence as *names are unique within their owner*. Our ownership relation already is this structure, which is why a parent recording a child can be one hash.

## The cheap move now

**Content hashes on chunk versions and on commits.** A column and a function; the query path does not change. It buys dedup, verification, *do you have this*, and *did this actually change* — and it makes a future object log a change of which side is trusted rather than a rewrite of the data. Its one real sub-task is **canonical serialization** of bodies (key order, number forms), the same problem expression normalization already has queued.

It also pays inside one machine: a model request need not be stored at all if its hash is kept — re-render from the refs, the commit they resolved at, and the params, then compare. Stronger than keeping the bytes, since stored bytes cannot tell you whether they still agree with the field.

## What not to harden

- **Mounts as the only store boundary** — the boundary is real and currently pinned to the filesystem at depth one.
- **Branch ops** — do not build them before merge-as-sync is understood; they are the same mechanism seen from one machine.

## What does not demand this

Buffers do not: once a completion is a few hundred bytes, no interior is needed to protect history from it. Nothing in v0.1 does either. The justification is remotes, and integrations to the degree they bring foreign rate.

## Open

- Whether the object log lives beside SQLite or replaces its role as authority, and when.
- Where this meets the engine's federation, which is already Rust-side composition — possibly nowhere new.
