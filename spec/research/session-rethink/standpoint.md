# Standpoint — blind derivation of the exchange

> **Provenance.** Clean-room pass on "what is a session" (2026-07-07). A fresh context given only the ground statement, the four mechanism specs (`substrate.md`, `engine.md`, `host.md`, `sdk.md`), and a scrubbed summary of the settled program-layer ground (call frame, run/launch, read-tile, citizens, streaming-as-commits, model/agent split). Forbidden from reading `session.md`, `agent.md`, `programs.md`, and everything else. Asked to derive the ongoing person↔harness exchange from first principles, without assuming the chat-transcript form. Verbatim output; synthesis in [`synthesis.md`](synthesis.md).

---

## Headline claim

The mechanisms do not favor a conversation. They favor a **standpoint**: a durable chunk whose `relates` placements are a pinned context selection over the field, and whose `instance` placements are the accreted exchange — person notes and turn frames interleaved in one ordered scope. The transcript is exhaust; the standpoint is the join key; the field is where the knowledge ends up. A healthy exchange *thins over time* as its products are placed out into the subject scopes, which is the opposite of what every chat product optimizes for.

## 1. What persists vs. what is derived

**Derived (do not store):** the transcript. Given frames, "the conversation" is a query: harness processes placed on scope X, ordered, each frame carrying its verbatim argument, nested tool-run trace, and answer chunk. Rendering that is exactly what `read` already does with a process (inspector layout) and with an ordered scope (sequence). Also derived: "what's new since I left" (temporal scoping: read the scope now, `exclude` nothing, but diff against `at: <last-seen-commit>` — set difference over two reads), and "recent activity" (`db/commits ∩ scope`).

**But a container earns identity — for one load-bearing job the frames cannot do: continuity.** Turn N+1 must assemble context including turn N. Frames have no join key between them — not time, not program, not person. The shared scope IS the join key. Something must be the scope that (a) the harness reads to assemble context and (b) new turn frames are placed `instance` on at launch. That something is the standpoint.

Concretely, the archetype I would define (namespace `agent/`):

```
agent/standpoint
  spec: { propagate: true, ordered: true, accepts: ['note', 'process'] }
  body: { text: goal statement, name? }

agent/note   (relates on standpoint, for accepts resolution)
  body: { text: "a person's utterance in an exchange" }
'process'    resolves to engine/process, relates-placed —
             exactly the pattern host/session already uses
             (accepts: ['tab','process'])
```

What is IN a standpoint:

- **`relates` placements to subject scopes** — the context selection. This is the standpoint proper: "completion from a point in a field" made literal. These placements are also natural material for the run's read boundary roots (the engine's `BoundarySpec::Existing` even anticipates a reusable, named, inspectable boundary chunk — the standpoint's selection and the turn's read boundary are nearly the same object).
- **`instance`, ordered:** person `note` chunks; harness turn frames (launch-mode processes placed here by the caller-supplied placement mechanism, same as `host/session` today); fold chunks (turn summaries placed on the frames they abstract — the fold IS the compacted turn).
- **Body:** the goal in prose. Consolidation principle: the vantage and the exchange are one identity; a separate "conversation containing one standpoint" chunk would be a container with nothing of its own.

Jobs the identity earns, enumerated: **context anchor** (the harness's read root), **addressability** (nameable, palette-findable, sidebar-pinnable, shareable as a chunk id), **invitation surface** (citizens whose argument types accept a standpoint become resident on every viewed exchange — an open-questions tracker, a decisions extractor), **answer-home default** (where a turn's answer chunk appears until curated outward), **boundary material**. Jobs it does *not* do: it is not the trace (frames are), not the knowledge (the field is), not window state (`host/session` is — a standpoint must survive and outlive any window arrangement, so it is emphatically not a `host/session`).

## 2. What the person sees

**First moment.** You are never in a blank chat box. Three entries, converging on one act:

- *From a view* (primary): you're in `read`, chips selected — say `project ∩ scope-algorithm`. The verbs menu offers **ask** (a program whose argument types accept any scope). Invoking it creates a standpoint capturing the current chips as `relates` (optionally `at:`-pinned), takes your typed instruction as the turn's argument chunk, and launches turn 1 detached on the session.
- *From the palette*: standpoint with an empty selection; the harness's first move is whole-field FTS (`scope([], match_)`) to find footing — the "cold open."
- *From any rendered entity*: the generated context menu on a single chunk — "ask about this" — standpoint of one relate.

**Live moment.** A turn is a `launch`-mode process (detached: survives tile close, sidebar shows it as a live card). Watching it is just `read` on the standpoint: the running frame renders in place at the tail of the sequence. Streaming is commits — the answer chunk updates `partial: true` at ~4/s, `useScope` re-renders. Tool calls appear as child frames nesting live under the turn — a growing tree you can drill into mid-flight, and cancel individually (`cancel` is authorized for descendants). **Mid-turn steering is a commit, not a channel:** commit a `note` onto the standpoint while the turn runs; a cycle-driven harness re-reads its context scope between cycles and sees it. No interrupt button — a placement.

**Resting moment.** Hours later: the sidebar shows the turn flat (done). Opening the standpoint, you see a sequence of *folds* — because the harness's last act each turn is to place a summary chunk on its own frame, and folds render in place of what they abstract. The tail is expanded; history is compact. "What changed since you left" is derived: your last-seen commit is a body property on the standpoint (or just the tile's view state); `read` diffs current against `at:` that commit and badges the additions. No unread counters stored anywhere — unread is a temporal query.

**Long arc.** The goal is an identity chunk in the field (`project/scope-algorithm`), and standpoints `relates` on it. Weeks of work = several standpoints bridging that goal — found by scoping the goal, not by scrolling a conversation inbox. Resumption is placement: open the standpoint, dispatch; the new frame lands `instance` at the next seq; the harness assembles context folds-first (summaries stand in; drill into a full frame only when a fold is insufficient — cheap, reproducible context). And critically, **curation is the arc's real motion**: settled answers get placed `relates`/`instance` onto the goal's scopes as ordinary content chunks. Week 3's turn reads the *field*, which now contains week 1's conclusions as structure — not week 1's transcript. The standpoint decays into trace you rarely reread.

## 3. The human voice

A person's speech is **two different kinds, split by illocution**:

- **Speech that commands** is a call argument. The dispatch lives verbatim as the turn frame's argument chunk — already settled ground, and correct: it's inspectable, reproducible, and part of the frame forever.
- **Speech that asserts** — notes, thinking aloud, annotations, corrections — is **content**, ordinary chunks, same kind as anything authored in the field. Placed `instance` on the standpoint (so it appears in the flow, ordered) and, when it's *about* something, `relates` on that thing. A correction is a chunk relates-placed **on the answer it corrects** — so every future reader of that answer, in any exchange, in any context assembly, sees the correction attached. Chat can only put a correction *later in one list*; here it's anchored to its target.

So no, a person's utterance is **not** the same kind as an agent's turn, and the asymmetry is principled: an agent's turn is a *process* (a frame — status, boundary, trace, cost); a person's note is not a call and forcing it into a frame would be noise. The chat "message" — one symmetric bubble type for both — is precisely the flattening this substrate refuses. What IS symmetric: both land as commits, and commit `process_id` provenance distinguishes machine-run writes from surface-mediated human writes. (Honest flag: human attribution is thin — a person's commit carries the *viewer program's* process id, and v0.1 is single-user. A real identity story is not derivable from these four files.)

## 4. The unit

Candidates dispatched:

- **Message** — doesn't exist here. There are argument chunks, answer chunks, notes. No unified message type is needed, and inventing one would re-import chat.
- **Turn** — the atomic *event*: one frame, durable, complete, re-runnable. But a turn has no continuity; it can't be the unit of *exchange*.
- **Goal/topic** — field identity. It's what standpoints are *about*, not the exchange itself; one goal hosts many standpoints (angles, eras, people).
- **Branch** — provisionality of *writes*, not exchange. When branch-bound runs land, a turn's field-writes go to a work branch and the merge is the acceptance; that composes with any exchange unit rather than being one.
- **`host/session`** — window state; wrong layer entirely.

**The standpoint is the primary durable unit**, because continuity across turns just *is* a persistent, mutable context selection with an accretion surface — and that's a chunk with relates and ordered instances, nothing more. Its lifecycle: **born** from a view (chips captured as relates); **accretes** turns, notes, folds; its **selection is edited live** — adding a scope mid-exchange is adding a relates placement, removing one is logical removal, both are commits, so *every past turn's context remains reproducible via `at:`* even as the standpoint moves; it **forks** (a new standpoint relates-placed on the old one — cheap, no branch machinery needed for exchange-level forking); it **never terminates** — no closed state, it merely stops accreting; and it is **superseded by curation** — its products migrate into the field, a summary fold caps it, and it rests as addressable history.

## 5. Surprises — what falls out here that chat cannot do

1. **Context is edited, not accumulated.** Chat context grows monotonically until compaction destroys it. Here the selection is a set of relates placements you widen and narrow; "forget that" is a placement removal — lossless, auditable, reversible.
2. **Time-travel completion.** Frames are never dismantled ("terminal cleanup never severs the frame"), so any turn re-arms: re-run the same question against the standpoint `at:` an old commit — "what would it have answered before we learned X" is a query, not a thought experiment.
3. **One turn, many exchanges.** A frame can be placed `instance` on a second standpoint. An answer earned in one exchange participates natively in another — no copy-paste, provenance intact. The conversation is a *view over placements*, not a place.
4. **Strict alternation dissolves.** Two launch-mode turns can run concurrently from one standpoint; the ordered scope interleaves them. Nothing enforces your-turn/my-turn — chat's most arbitrary constraint just isn't in the mechanism.
5. **Compaction is visible structure.** Folding makes context summarization a first-class, person-editable chunk placed on what it abstracts — versus every chat product's invisible, unauditable auto-compaction. You can *fix the summary* the model will stand on next turn.
6. **The prompt corpus.** Every request ever sent is an argument chunk on a model-program frame: FTS-searchable, scopeable ("everything I asked about migrations in March"), intersectable with `db/commits` for what each one caused.
7. **Steering as data.** Mid-turn correction is a note committed onto the scope the harness is already subscribed to — no privileged interrupt channel, and the steering itself is durable and inspectable afterward.
8. **The exchange evaporates by design.** Because answers are curated *out* into subject scopes, the measure of a good exchange is how little you ever need to reopen it. Chat's asset is the transcript; here the transcript is the receipt and the field is the asset.

## Honest uncertainties

- **`accepts` on processes:** I'm patterning `accepts: ['note', 'process']` on `host/session`'s `accepts: ['tab', 'process']`, assuming launch-mode placement of a process onto a standpoint validates against `engine/process` the way session placement must. If the trace-nesting exemption is narrower than I read it, the standpoint spec needs a `turn` relates-alias instead.
- **Standpoint vs. read-boundary unification:** I suspect the standpoint's relates-selection and the turn's `BoundarySpec::Existing` boundary chunk want to be the *same chunk*; whether reachability semantics (boundary roots grant transitive instance-chain reach) match context-assembly semantics exactly enough to merge them is unproven.
- **Per-turn selection snapshots:** I rely on commit history + the model frame's verbatim argument for reproducibility rather than snapshotting the selection per turn. If selection edits and turns race within a commit window, an explicit `context` chunk per turn (the session archetype example in substrate.md hints at this) is the fallback.
- **Multi-person exchange** and attribution are underivable from these files; I've designed for one person and flagged the seam (commit provenance) where identity would attach.
