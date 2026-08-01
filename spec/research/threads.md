# Threads — sessions as graph, views as pipes

Handoff from the dispatch-planning session's parallel track (2026-08-01, author dialog). **Exploratory — no rulings folded into specs.** The board's *Recent* entry "Parallel track — sessions as graph + field expressions" mirrors this; session.md remains unratified and the session-rethink proposals (P1–P7) remain open. This file exists so another session can stand on the findings without replaying the dialog.

> Paired: [`threads-lens.md`](threads-lens.md) — the build track's same-day findings, blind to this one and convergent; it carries the running-code evidence and the tensions to rule.
>
> Continued: [`threads-dialog.md`](threads-dialog.md) — the third session's ruling stretch on both files: accepted rulings (thread/conversation split, structural matching, the grain principle, face-follows-context) and the dissolution breakthroughs (no container entities; N-position lenses; dispatcher/inspector ladder).

## 1. Sessions are a graph, not a tree — and maybe not "sessions"

The GitHub-issues pattern, made substrate-native: **cross-references are dual-placed chunks, visible in both timelines** at their own seq. A fork's first entity is the origin turn itself, dual-placed — "branched from here" in the child and "branched to X" in the parent are *one chunk*. *Talk about this* backlinks onto the source timeline; `[[mention]]`s could commit backlink placements too.

The hierarchy anxiety (subagent-collapse looks like a tree; the substrate isn't one) dissolves into two dimensions that were being conflated:

- the **call tree** — frame mechanics, genuinely hierarchical, stays a trace;
- the **discourse space** — placements, a graph; a turn, summary, or work process sits in N conversations at once; every timeline is a query over shared entities, not a container.

**Proposed rename (author, tentative): thread, not session.** "Session" implies isolation — a closed room. These things share entities, cross-link, branch, and answer each other; the graph earns the word thread.

## 2. Standpoint is a ground swap; views are compositions

Claude Code's subagent selector generalized: an adjacency rail derived from three queryable sources — the call tree (running children), the placement graph (threads sharing entities: branched-from, talked-about, backlinked), and liveness (`engine/process ∩ running`, mission-control as a scope query — session-rethink P6). Switching standpoint re-grounds the tile on another scope; any scope is a valid point of view.

Then the dissolution: **no standpoint entity, no rail mechanism** — considered and rejected as machinery. Dashboard, adjacency rail, sessions-of-relevance are all one shape: **scope → pure transforms → renderer**, every stage an ordinary program with typed arguments and results.

## 3. Field expressions — a written syntax

Scope algebra (∩, relates-of-type, `exclude`/R10) as the nouns; piped pure programs (`prop(key)`, `where`, `average`) as the verbs. **Scope is `cd`; pipes are the tools.** The specs already write in this language ("audit is `db/commits ∩ process`"); the step is making it palette-typeable — one expression line that is simultaneously a query, a view definition, and (when recipes land) a recipe. Because pipe stages are typed programs, expressions type-check against the interface contracts (programs.md §1 already names pipelines as a consumer) — the DSL inherits its semantics instead of inventing them.

## 4. The lean-substrate ruling

**Placements for membership, body for content, pipes for questions.** Enumerator chunks for body values (`status/running` etc.) were considered and rejected as index-thinking — placement churn and bookkeeping vocabulary to make one query cheap. Body keys stay truth; reactivity needs nothing more (a body rewrite is a commit; subscriptions fire). A hot query may *derive* a dimension — a small program maintaining the placement as a materialized index — promotion when proven, never upfront, body never ceasing to be truth.

## 5. `explode` — pipe output is substrate-shaped

A pure program that blows a JSON body into virtual chunks, each with its own instance placement per key. The principle under it is the track's sharpest finding: **pipe results are chunks-and-placements, so scope algebra composes over results, not just stored scopes** — you can intersect downstream of a transform. The dimensional world exists latently and is manifested on demand; materializing is committing the same output (same program, two sinks). Lands on engine.md's virtual-scope open.

## 6. Cross-thread context is a pipe, not a paste

The insight that closes the loop — and the reason this file exists. Including one thread's findings in another is itself a field expression: take the thread, slice the delta between two markers (an ended agent process to the next — turns are the units, the frame boundaries are the cut points), pipe it (project, summarize), and place the result into the next run's context list on the *other* thread:

```
thread-A ∩ turns[from: process-X, to: process-Y] | project(...) → context item on thread-B's next turn
```

That is completion-from-the-field applied to threads themselves — the README's center enacted on the tool that builds it. No export, no paste; the receiving turn's context records exactly what it read (context items on the frame, per agent.md), so the handoff is reproducible and audited like any other read.

This very file is the paste we resort to because the substrate doesn't exist yet. It should be the last generation of its kind.

## What this wants next

Author rulings, not build: the thread rename; the backlink convention (automatic vs explicit gesture — auto matches GitHub, explicit matches the substrate's temperament); where field expressions enter (palette Find mode is the candidate). All downstream of the session.md ratification read, which remains the standing gate.
