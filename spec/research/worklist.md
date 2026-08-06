# Worklist

What still needs attention, one item at a time, worked in the order at the bottom. An item closes on the author's grant; the ruling is recorded compactly in [`conclusions.md`](conclusions.md) — **spec folds are batched mechanical passes run later, never live during the sitting** (author correction). New feedback lands here first. (Margin notes already answered by the selection/one-compositor arc are not listed — they get verified and die inside the absorption pass.)

---

## A. Absorption — make the specs current law again

- **A1 — selection.md §15 into the specs.** Arguments as sets (`accepts` + the four-step gate), argument as a field on the process body, compose-time materialization + the expression archetype, `resolve` op, flat `read`/`write` with argument references, purity derived, `runtime: native` + planner, the form dissolved into seated sets, collation as `list<selection>`, grades, buffer semantics. Until this lands, the staged argument/boundary text stands superseded-on-paper.
- **A2 — one-compositor.md into the specs.** One compositor (the web tree), Rust's visual duty one rect, shell as a view program, tiles as iframes, slot-grade = DOM, no-commit-on-event, the performance budgets. Supersedes host.md's native frame machinery, pilot.md's containment framing, programs.md §1's host-native claim.
- **A3 — block notation everywhere.** selection.md §10's chunk-definition blocks replace ad-hoc shape sketches in every spec (author ask). Small riders folded en route: the substrate example's fake `instances:` field; "renaming is trivial" gains the uniqueness caveat; consolidation softens from rule to discipline (prose may legitimately span several locations).

## B. Vocabulary — RULED, see conclusions.md §B (sweep of remaining files is batched mechanical debt)

- **B1 — scope vs location.** `loc` is the value kind; where does "scope" survive — the identity law, the read op's options, nowhere?
- **B2 — the op family.** Author suggests `read` over `scope` for the read op; name the family whole: read / get / resolve / commit / run.
- **B3 — run vs dispatch.** Author: the verb for creating a process is *run*. The draft model needs two moments named (compose, consume); selection.md kept "dispatch" through two reviews — acceptance or drift?
- **B4 — "invocation"** — drop or define; no loose synonyms.
- **B5 — `scope_id`** on the placement — clearer name wanted.
- **B6 — `spec` / `instance`.** Is the pair right? Author: the name should point at its purpose — "a view into what an instance is to be."
- **B7 — "gate" collides** (steward-raised): the dispatch check and the agent's approval chunk share the word; one moves.

## D. Substrate — short decisions

- **D1 — protected sub-roots.** Can a chunk restrict access below itself under a grant that covers it? Today there is no deny — a new constraint kind if wanted. Good or bad?
- **D2 — is a name necessary for identity?** Law says names optional; author leans required for identities/connections. Touches paths and the face of unnamed chunks.
- **D5 — location-mentions paragraph.** Incomprehensible as written; steward drafts a plain rewrite in the selection vocabulary (mention targeting a `loc` — a place-description whose resolution shifts over time), author reads.
- **D6 — open vs closed instance specs.** Today undeclared keys are always legal. Should a spec be able to declare itself closed (only declared keys)? Changes the contract's meaning; decide inclusion and default.

## E. The agent sitting — steward prepares first

Author instruction: sceptical of the whole plan; steward reasons it through and lays out the best attempt for direct dialog before any feedback.

- **E1 — the agent plan, re-derived** (the centerpiece). What a turn, the cycle, and the answer *are* under current law (context as selection, set arguments, buffers for the token stream, resolve/planner, purity). Position paper as a research file, then the sitting. E2–E8 resolve with it.
- **E2 — gates, defined.** What a gate is (mid-turn reach expansion? per-argument tool approval? both), when it fires, how the person is prompted — without an agent-authored custom surface. Currently underdefined, author-flagged.
- **E3 — pause and controls.** Why a `control` chunk rather than the process owning start/stop; how the process surface offers the pause affordance. Author has an idea, wants the steward's take first.
- **E4 — context purity, made precise.** The idea approved, the current text too vague to evaluate.
- **E5 — context assembly.** "Guidelines → thread → prompt" softens to a default — a context is a selection. Plus: human prose with `ol:` link completion as a context-authoring surface (linked things offerable into context).
- **E6 — "resolved at one commit snapshot," explained.** One plain paragraph: what is recorded (context items with `at`), what is cached (planner memoization), what the program actually receives (refs, resolved via `resolve`).
- **E7 — small folds riding the sitting:** summaries de-specialized (just substrate + a fold expression); model request `kind` as a substrate enum owned by the model archetype.

## F. The spec tree — F1 + F2 RULED, see conclusions.md (batch-fold)

- **F1 — session.md must go.** Sessions were dissolved; the filename asserts what the law denies. Options: rename to `thread.md`; fold into agent.md (mechanics + experience in one file); fold into programs.md. Steward leaning: rename or agent.md-fold. Decide before A1/A2 so folds land in the right file.
- **F2 — pilot.md slims.** Its unique content: v0.1 scope, build order, mounts format, repo layout. The rest retells other specs — multiple sources of truth. Proposal: cut to the unique content, point elsewhere for the rest. Rides A2 (its native-frame/containment text is superseded anyway).

**Conventions, recorded:** the author skips the engine's technical layers — those are steward-owned review territory, and no concept-level change may hide in them. New margin notes get collected here and the specs cleaned, same sitting.

**Parked:** SDK type-mapping elegance (implementation phase).

---

## Working order

1. **B** — the vocabulary sitting; everything after inherits the words.
2. **F1 + F2** — tree decisions, before the big folds write into files.
3. **A** — the absorption pass; ends with nothing superseded-on-paper.
4. **D** — substrate shorts.
5. **E** — the agent sitting, position paper first.
