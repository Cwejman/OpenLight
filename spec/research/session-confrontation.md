# Session — the confrontation

> Companion for the fresh read of [`spec/session.md`](../session.md) — agent-written, not yet author-ratified; the board's round-twelve test. The rethink ([`session-rethink/`](session-rethink/)) attacked its turns-only model from four independent directions; proposals P1–P7 all await rulings. This page sets the table with no lean. Read session.md cold first; then this.

## The question

Is an agent session the machine's sequence of work, with the person standing outside it — or a shared place the person also inhabits — and either way, what exactly must not move?

## Turns-only, at full strength

Turns-only is not minimalism; it is four guarantees, each the cure for a disease every shipping harness has:

- **One source of mechanics.** Tool runs, context items, verbatim requests live solely on frames — no event soup. OpenAI's thread API needs a three-type join to answer "what happened," and its transcript *is* the context: append-only pollution forever. Here the session is only the sequence of work; everything else is reached by drilling.
- **Context purity.** Context is per-invocation, pinned, byte-reproducible — assembled from scope each cycle, never accumulated. Steering the next cycle and polluting it are separate acts (`adjust` carries the distilled correction; the meta-discussion stays out). Every current harness swallows the whole interruption transcript.
- **Derived status cannot lie.** L0 is computed from frame children and commits, never reported. Every Slack bot's stale "working…" is the counterexample; this one structurally can't go stale.
- **Reconstruction over storage.** Provider history is rebuilt from frames as serializer policy, not stored as a transcript that can drift from what actually happened. LangChain mutates a lossy summary it can never replay; this kills that class of bugs outright.

Even the adversarial critique conceded the frame/session split, context-vs-discourse, and reconstruction-over-storage as the best decisions in the file (critique §4), and named the one fear behind the vow of silence as real: notes leaking silently into context is exactly how transcript soup reproduces. The vow's value is that there is *nothing to govern* — no second content stream, no policy to get wrong, the session's meaning fully derivable from frames.

## The counter-case, at full strength

Four independent passes — an uncontaminated own pass, a blind derivation from the mechanism specs alone, an adversarial attack, a generative sweep — converged on the same three findings. By the project's own evidence standard, that convergence is load-bearing.

- **The amputated voice.** Turns-only is machinery discipline misread as content law. The container's content is deliberately wildcard; only the *gesture* is missing. A person cannot say anything into the place where the work lives below the cost of a completion — no note to self, no re-entry breadcrumb, no aside to a colleague, no pause-time discussion. The input box is a loaded gun; a box you must not think into pushes thinking out of the field. The medium remembers everything except you. And the specs already contradict themselves over it: agent.md's pause section promises "discuss the work in the conversation itself" — impossible under session.md §1 (verified; round thirteen missed it). P1's repair: one archetype, three utterance kinds — turn (dispatches), note (records, never completes), control (steers) — what the input becomes a property of the gesture, not the container.
- **Stance / trail / face conflated.** The blind pass, given only the mechanisms, derived the *stance* — the standing selection, the point in the field — as the session's essence, with the trail as accretion and the face as folds. The current spec identifies the session with the trail. Same chunks, same placements; the centering drives every UX default. The transcript is the receipt; the field is the asset; a healthy session thins as its products are curated outward.
- **The face rebuilds the chat app.** §7's resting rule states the chat shape as its success criterion ("reads as a conversation") — but in this system the answer is often commentary and the mutation strip is the product; the spec built the strip and hid it at rest. The transcript is a strange attractor: renderers and habits calcify around the default, and the deferred alternative never gets to be default. Digest-first resting (P3), the standing brief (P4), artifact-as-ground (P5) are the composable fixes — and the brief sits last in the build order while being load-bearing for any use past week one.

## Where they genuinely collide — and where they don't

**The machine half of turns-only survives P1 intact.** A note is content, not a frame; nothing about it touches: mechanics-on-frames, per-invocation pinned context, verbatim-request reproducibility, L0 derivation, typed out-of-band controls, `adjust` purity, the turn as durable re-runnable object, summary-is-group, the answer-home rule, dispatcher matching, one-active-turn-as-policy. Context assembly is unchanged either way — notes-in-context is a dispatcher knob riding "include the session," not a mechanism. P4 is sequencing; P5 is a sentence; P6 is scope queries; P7 rides the existing control taxonomy. None of these collide with anything turns-only protects.

**What genuinely collides:**

- Session.md §1's "nothing else accumulates" and agent.md's "`message` chunks belong to human conversations" are content law. Under P1 both sentences are false. This is not a rendering choice.
- Agent.md's pause-and-discuss paragraph vs session.md §1: one of the two must yield, and no ruling can leave both standing. Ruling against P1 means deleting a workflow agent.md explicitly promises.
- §7's resting form vs P3's digest-first: one renderer, one default — they cannot both be it.
- Trail-centering vs stance-centering in §1: mutually exclusive framings of the same structure.
- And the honest residue on P1's "nearly free": admitting the note trades the vow's *nothing-to-govern* guarantee for a policy that must be governed forever — inclusion defaults, purity boundaries, rendering weight. The mechanism cost is near zero; the standing-discipline cost is not.

## What the read must decide

1. Does a person get to write into the session below the cost of a completion — does the note land? (P1)
2. If it lands: one archetype with utterance kinds, or two container types? And which spec sentence yields — agent.md's pause-discussion, or session.md's turns-only?
3. If notes exist: in the next turn's context by default, or out?
4. Is the session's essence the trail (what happened) or the stance (where you stand)? (P2)
5. What does a completed work-turn rest as — prompt + answer, or digest first? Is §7's "reads as a conversation" identity, or v0.1 staging? (P3, P5)
6. Do the standing brief and summary folds move earlier in §6's order, or is the unfolded scroll accepted consciously? (P4)
7. While a turn runs, is typing itself the adjust gesture? (P7)
8. Are pending gates also placed onto the session, or frame-only? (the standing open; the Tower is new evidence, not a verdict)
