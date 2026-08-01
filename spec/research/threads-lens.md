# Threads — the lens built, the pipe's first source

Handoff from the build-track session (2026-07-31 → 08-01, author dialog), the
same days as [`threads.md`](threads.md)'s dispatch-planning track. The two ran
blind to each other and converged; this file carries what the build track
adds — **findings with running code behind them**, staged on `main`, none
folded into specs. Exploratory beside its sibling: read both, then the specs.

## 1. The convergence, named

The tracks met without contact:

| threads.md (planning) | this track (built) |
|---|---|
| §3 field expressions — "scope is `cd`, pipes are the tools" | author ruling, verbatim: "the scope becomes a DSL where programs are like syntax" |
| §4 lean substrate — pipes for questions, nothing stored for queries | author ruling: "never aggregation in the field — that is multiple sources of truth"; the summary card was built, then struck |
| §5 explode — pipe output is chunks-and-placements | telemetry stores what explode would emit (see §3 below — and the one tension) |
| §6 cross-thread context is a pipe, not a paste | this file is again that paste; the sibling's closing sentence stands |

Two blind derivations of one thesis in one week is the project's own
clean-room evidence grade. The thesis holds.

## 2. Lens-hood is real now — scope is the argument, edited by frame write

Author ruling: *a read whose scope cannot change is not a viewer but a frozen
photograph; the scope is the lens's live argument.* Built, and the build is
the finding: **no mechanism was added anywhere.** The read-tile rewrites the
`target` on its own request chunk (an own-frame write is implicitly within
the write boundary — ops/commit.rs says so in a comment older than the
feature); the frame subscription delivers it back; the tile re-reads.
Grammar as built: the input **adds a dimension** (with completion), each
chip's × **removes one**, at least one remains. Evidence:
`host/programs/read-tile/src/tile.tsx` (`Retarget`), pinned by
`host/tests/tiling.rs::a_lens_retargets_by_rewriting_its_own_request_chunk`.

Still missing from lens grammar, deliberately: `at:` (time travel), `exclude`
as a gesture, and expressions (the sibling's §3) — the editor takes ids and
intersections only. It is field expressions' walking precursor, not their home.

## 3. Telemetry — the first typed pipe source, and one tension to rule

Every surface open now writes its trace (settings-gated, `timings`): **the
process chunk is the trace** — each stage a nameless event chunk, body one
bare number, `instance` on its *category chunk* (`timing-first-paint`, …,
registered under a `timing-event` root), `relates` with seq on its process.
Scope-by-type and intersection work today: `scope([timing-first-paint])` is
every paint the field has seen. Evidence: `host/src/telemetry.rs`,
`host/tests/tiling.rs::telemetry_events_land_typed_…`.

**The tension:** the sibling's §4 rejects enumerator chunks for body values
as index-thinking — and telemetry's category chunks *are* stored dimension
chunks. The build track's reading: these are typed membership, not index —
an event genuinely *is* a first-paint (its whole body is one number; the
category is its only identity), where `status/running` is a *value of* a
chunk that is something else. Under §5's frame: telemetry commits at the
source what explode would manifest — materialized because the writer knows
the shape, not to make a query cheap. Plausible, unruled. **Wants one
ruling:** when is a dimension a chunk's *type* (stored) and when a body key
(exploded on demand)?

## 4. Corrections the build surfaced (verified against code, not opinion)

- **Membership is direct placement; `propagate` carries specs, never
  membership.** `scope([timing-event])` lists categories, not events; the
  session does not contain its turns' events. Every cross-level read is a
  walk — i.e. a pipe. The substrate refuses the flattening; the sibling's
  expressions are the answer, `read_batch` the one-snapshot mechanism.
- **Surfaces as peers keyed by argument *shape*.** Author: a waterfall
  surface declares "a seq of chunks holding one number" and exists wherever
  that shape occurs. The sibling types expressions against interface
  contracts — *named* archetypes. Telemetry events carry no archetype worth
  naming; their shape is the contract. **Open, load-bearing for dispatch:
  is matching nominal (archetype), structural (shape), or both?**
- **Completion is a program** (string in, scopes out) — built as a pure
  module rendering in-tile (`read-tile/src/complete.ts`), because a surface
  raising an overlay above its own tile is the recorded
  overlay-anchor-escalation open. When that settles, the module lifts out as
  the peer program; nothing else changes.
- SDK wire truth: `ChunkItem.body` is typed as an object; telemetry bodies
  are bare numbers and cross fine. The type lies; widen it when a lens
  consumes events.

## 5. What the build track hands the dispatch session

Living precedents where the planning track has blank paper: argument editing
as frame writes (the retarget), an overlay program executing under a
caller's grant (the menu), typed data waiting for its first matched peer
(telemetry), and a latency floor (~50ms warm surface opens — recycling +
prewarm) that makes program-per-gesture UI honest. The straight line to the
center remains: spec-truth pass folding this stretch's recorded gaps →
dispatch dialog (both threads files as ground) → VM ruling → `model`.
