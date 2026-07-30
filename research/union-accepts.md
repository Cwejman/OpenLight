# Union semantics for composed propagating specs — derivation

Full-field derivation (all mechanism specs, program layer, bootstrap, session research, db validate.rs). Status: **recommendation awaiting author adoption**; confirms the db crate as built.

## Recommendation (adoptable verbatim into substrate.md §Spec Language)

> **Composition of propagating specs.** The effective contract for chunks placed `instance` on a scope is one merged spec, folded **field-wise** from the scope's own non-propagating spec and the propagating spec of every archetype the scope is transitively `instance` of. A field absent from every contributing spec is unconstrained. `accepts` composes as the union of the contributing specs' resolved type sets — a chunk passes if it is an instance of at least one type in the union; a spec that omits `accepts` contributes no restriction, and `accepts` is enforced only when at least one contributing spec declares it. Type ambiguity is judged per contributing spec's list, not across the merged union. `required` and `unique` compose as the union of key sets — every key binds. `ordered` composes as logical OR. The asymmetry is by design: `accepts` is a license (∃ over types), the others are obligations (∀ over keys); a scope carrying several archetypes plays several roles, and children need only be legitimate content of *some* role while honoring every role's obligations.

## Why (compressed)

- Dual-propagation is the **normal** condition, not a corner: membership is transitive, so session→tab→tile and program∪engine/process stack archetypes on nearly every frame.
- **Conjunctive reading (B) is unbuildable**: tiles rejected from every tab (`tile ∉ session's ['tab','process']`); no agent turn can carry its prompt. Traps deepen monotonically with nesting. Union widens instead — bounded to roles the chunk explicitly carries.
- The wildcard idiom (`engine/process`, `conversation` — no accepts) only works if **absent field contributes nothing** (not universal set, not empty set). db's `accepts_declared` already implements this.
- Third shapes considered and rejected: per-archetype full-spec satisfaction (unreadable partial ordering, non-attributable errors); conflict-rejection at second archetype (outlaws the core topology); conjunction-as-refinement (the field narrows by *not* dual-typing, supertypes are deliberately wildcard).

## Consequences for code

Confirms `db/src/validate.rs` as built. Deltas: (1) ambiguity check should become per-contributing-list (`Contract.accepts` → one set per contributing spec; ambiguity = ≥2 memberships within a single list). (2) **Federation gap**: composed archetypes live in peer dbs; `load_spec`/`resolve_name` read one connection — commit-time validation silently skips peer specs today; engine must pre-validate federated or db needs a spec-resolver seam. Under (A), enforcement arriving later is safe (permissive); under (B) it would have rejected the first-party topology retroactively. (3) R7 trace exemption needs a mechanical seam — engine marks trace placements, or `engine/process` is implicitly unioned into every composed accepts (cleanroom D6); exemption must be from *every* composed accepts, not just the program's.

## Adjacent spec fixes required with the pin

1. substrate.md propagate paragraph → the recommendation; §Spec validation "every field of that union" gains "a field absent from every contributing spec is unconstrained."
2. substrate.md ambiguity sentence → "in the same contributing spec's list."
3. **Latent total trap, either reading**: bootstrap places `tab`/`tile`/`process` on project roots, but accepts names resolve within the archetype's own scope → `host/session`/`host/tab` accepts resolve **empty** → everything rejected. Fix: relates-place the type-defining chunks on the archetypes (as agents bootstrap already does).
4. bootstrap.md `host/tile` → `{propagate: true, ordered: true}` (host.md already pinned).
5. `conversation`/agents `session` spec needs `propagate: true` alongside `ordered` or turns aren't actually seq-required.
6. Bootstrap accepts lists lack result/answer types (model, agent) — result placements reject once federated enforcement lands.
7. engine.md R7 restated per above.
