# Tree survey — how the specs open today

*Arc record, 2026-08-24. An evidence sweep over the spec tree: for each file, how it opens (why-first or definition-first), where motivation lives, the section order. The failure the code must answer, measured rather than felt. Research register; a snapshot — it goes stale as the register pass lands. Condensed from the sweep's return; verdicts per file, then the patterns.*

## Per-file verdicts

| File | Verdict | The evidence |
|---|---|---|
| `README.md` | **why-first — the exemplar** | Opens "Knowledge compounds by interconnection…"; ~8 paragraphs of motivation before the claim; names its own rule ("the why before the how"). |
| `spec/design.md` | **why-first** | Built deliberately as the *why* companion to components.md; first section literally titled "Why flat". |
| `horizon.md` | mixed / **why-first per entry** | Top framing is meta-descriptive, but all 11 entries run a disciplined rationale → *Real today* → *Open* triplet. |
| `spec/pilot.md` | mixed, leaning why-first | Purpose by sentence 3 ("exists to prove that the substrate's self-description is sufficient"); bulk is enumeration. |
| `spec/agent.md` | mixed | Reaches a thesis by sentence 3 ("completion from a point in the field") and — alone in the tree — lists its prerequisites in paragraph 2; rest is mechanism. |
| `spec/substrate.md` | **definition-first** | Opens definitional; jumps to `One Primitive: Chunk` at line 5; its framing (`What This System Is`) sits at line 369 of 411 — a closing footnote. |
| `spec/engine.md` | **definition-first** | "The engine is the authority on…" straight into mechanism; motivation absent throughout. |
| `spec/db.md` | definition-first | Functional label; the near-top rationale explains the document's own organization, not why db exists. |
| `spec/chassis.md` | definition-first | Rename note, then "A chassis is a platform binding…"; no motivation. |
| `spec/sdk.md` | definition-first | "Two packages, layered along…"; states authority precedence, never purpose. |
| `spec/view.md` | definition-first | Enumerative opening, then straight to schema at line 11. |
| `spec/components.md` | definition-first | Enumerative; rules arrive before any stated problem. |
| `spec/bootstrap.md` | definition-first | Mechanism from sentence one; no closing Open section either. |
| `spec/desktop.md` | **definition-first — worst case** | 17 lines; opens with a store/dependency statement and drops into an unframed bullet enumeration; no motivation anywhere. |

## Patterns

- **The mechanism tier opens uniformly "X is a Y that…"** — a structural tic separating it from the two why-first outliers, which open with a problem or a stated reasoning goal before naming the thing at all.
- **Everything open is swept to the end.** `What Is Open` / `Open — gathered` closes nearly every file, never frames it; unresolved material is treated as an appendix rather than as the question the file exists to answer.
- **Files rarely state what they assume you've read.** The dependency map lives only in README's reading order; agent.md (explicit prerequisite list), db.md and sdk.md (precedence lines) are the exceptions. Most files simply start defining.
- **The tree already contains its own remedies**: README's why-first entry, design.md's why-companion pattern, horizon.md's per-entry triplet, agent.md's prerequisite paragraph. The register pass is generalization, not invention.
