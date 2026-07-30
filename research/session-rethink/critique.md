# Critique — adversarial UX attack on turns-only

> **Provenance.** Clean-room pass on "what is a session" (2026-07-07). A fully-bootstrapped context (README reading order, session.md/agent.md/programs.md closely) asked to attack `pilot/session.md`'s turns-only model as a hard-nosed product designer — real cracks, plus a steelman. Verbatim output; synthesis in [`synthesis.md`](synthesis.md). Its central spec-contradiction finding (agent.md pause ¶ vs session.md §1) was verified directly against the files.

---

## 0. The frame of the attack

One thing first, because it sharpens everything below: **turns-only is not a substrate constraint. It is an experience-level vow of silence.** The `conversation` archetype's content is deliberately wildcard; session.md §1 itself admits "dropped-in entities." The substrate would happily accept a note chunk placed on a session tomorrow. What the spec removes is the *gesture* — the person's ability to say something into the space where the work lives without invoking a model. Every crack below traces back to that choice, which means most repairs are nearly free. That is good news and an indictment: the model amputated something its own mechanics support.

## 1. Lived-in failures

**Returning after 3 days.** The tail of a turns-only session is the last answer. What a returning person actually needs is *their own last state of mind* — and in every tool I've lived in, people smuggle it into the medium: "TODO tomorrow: migration first, then ask about the index" typed into Claude Code (wasting a completion), a Notion comment, a draft-to-self in email. Turns-only offers no home for that breadcrumb. You either dispatch a fake turn (costs money, pollutes the sequence, and the agent will *answer your note*, which is grotesque) or you keep notes in a separate scope, exiling your working memory from the place you work. The session has defaults-as-relates-chunks for the *agent's* standing state (§7) but nothing for the *person's*. The medium remembers everything except you.

**The input box is a loaded gun.** When the only writable affordance dispatches an invocation, every keystroke carries a price and a consequence. Watch what this does to behavior: people draft prompts in another window (the paste-bridging this project exists to kill), hesitate, batch thoughts into mega-prompts because small utterances feel too expensive to "spend a turn" on. ChatGPT's box is cheap to talk into and that cheapness — for all the transcript pollution it causes — is why thinking happens *there*. A box you must not think into pushes thinking out of the field.

**"Actually, wait —".** The most urgent gesture in the medium is the mid-turn correction. The spec's mechanics here are genuinely superior (pause before next cycle, adjust as distilled correction, context purity) — but the *choreography* is three gestures and a taxonomy: press pause, decide message-vs-adjust-vs-new-turn, compose the adjust, resume. In Claude Code it's one gesture: Esc, type. When the agent is about to delete the wrong file, nobody wants a taxonomy; they want to yell. The spec optimized the audit trail of the correction and taxed the correction itself.

**Two people and one agent** — and the spec trips over its own feet here. agent.md's pause section still says: *"While paused you inspect the trace, read what it read, even discuss the work in the conversation itself. Then `resume`."* That is **impossible under session.md §1** — there are no messages in an agent session to discuss with; agent.md's own discourse section says messages belong to human conversations. The round-thirteen reconciliation missed this; the contradiction is a symptom, not a typo: the pause-and-discuss workflow, which the author clearly wants, *requires a human voice in the agent session*, and turns-only deleted it. Add a second human and it gets worse — their sidebar conversation about turn 14 must live in a *separate related conversation*, splitting one social space into two containers with two scroll positions, exactly the Slack thread-vs-channel fragmentation everyone hates.

**80 turns, and finding THAT session among forty.** A session's identity is unspecced — presumably a name on the scope chunk. First-prompt digests are terrible names (every chat app learned this and grew auto-titling). And note the implementation order in §6: summary folds and narrate land *last*. So the lived v0.1 is an unfolded 80-turn transcript with no standing identity, findable only by FTS over prompts. The mechanics for the fix exist (summary-is-group, narrate); they're just sequenced as dessert when they're load-bearing for daily use past week one.

**The mobile-glance moment** — turns-only *wins* here, decisively. L0 derived status computed from frame children cannot lie; every Slack bot's "🔄 working…" message that went stale three minutes ago is the counterexample. Credit where due (§4 below).

## 2. The voice problem — real wound, and the open question is mis-aimed

Session.md §1 asks: one archetype or two container types? That's the wrong axis. **The real taxonomy is utterance kinds, not container kinds.** A human speaking into a shared working space has three distinct modes:

1. **Address the agent** → dispatch a turn.
2. **Address other humans, or your future self** → record, never complete.
3. **Steer a running turn** → control.

Chat apps collapse all three into "message" and suffer (the agent answers your aside to a colleague; the transcript pollutes context). Turns-only keeps 1 and 3 and **amputates 2**. But mode 2 is not decoration — it's the cheapest, highest-value context there is (a human-written note about intent beats any summary), it's the re-entry breadcrumb, it's the pause-discussion agent.md promises, and it's the entire two-humans case.

Once you see it as utterance kinds, the container question dissolves: **one archetype**, three placeable kinds (turn, note/message, control), and *what the input becomes is a property of the gesture, not the container*. "Agent session" vs "human conversation" then differs only in which citizens are resident (dispatcher vs human composers) — which is exactly what the citizen mechanics in programs.md §3.5 already want. The spec is fighting its own best idea: it distinguishes at the content level what its citizen model already distinguishes at the view level.

The one thing turns-only correctly feared — notes silently leaking into agent context and reproducing transcript soup — is a *dispatcher policy question*, not a container question. "Include the session" already has projection policy; notes are just another kind with a default (in by default, since a person's note is deliberate; pause-time meta-discussion excluded per the existing purity rule).

## 3. The transcript problem — yes, the spec is quietly rebuilding the chat app

Three separate pieces of evidence:

**§7's own words:** "a session of resting turns *reads as a conversation*." The spec states the chat shape as the success criterion of the resting form. The project's thesis is that the transcript is the monolith's shape; the session spec makes the transcript the default reading and defers the alternative (narration-as-ground, the peer inversion) to *direction* status. Shipping the chat shape first while promising to transcend it later is how every tool ends up a chat app — the transcript is a strange attractor; renderers, habits, and third-party citizens calcify around it, and "narration as default" never gets to be default because by then the transcript *is* the product identity.

**The resting form inverts the system's value hierarchy.** Prompt + answer visible, mechanics folded — but in *this* system the answer is often the least important output of a turn. The mutation strip — what actually landed in the field, the structure the next reader stands on — is the product; the answer is commentary on it. Resting a work-turn as its commentary while folding its deltas is precisely the chat-app disease (Claude Code's final message summarizes; the diff is the truth; everyone scrolls past the message to the diff). The spec built the mutation strip and then hid it at rest.

**The center of gravity is the input box.** The dispatcher docks on the session and only the session (answer-home rule); products live elsewhere in the field. So the person will *live* in the session view — because that's where the box is — while the worked artifacts (the plan scope, the code) sit in other tiles. Gravity pulls toward the dialogue even though the system's own claim is that the standing objects (pinned context, defaults, the artifact under work) are the interesting ones.

Where should the center be? Honestly: **the turn log is the right spine, but the wrong ground.** The session's eventual ground should be the standing picture — the artifact(s) under work plus a maintained narration — with the turn sequence as a dockable citizen you drill into. The spec already contains this exact shape (narrate-as-ground, peer inversion, view recipes); it just doesn't commit to it as the destination, and §7's resting-form convention reads as the identity instead of the staging.

## 4. Steelman — where turns-only is simply correct

Don't repair these; defend them.

- **No event soup.** OpenAI's thread API interleaves messages, tool calls, and run steps in one list; reconstructing "what happened" is a three-type join, and the transcript *is* the context — append-only pollution forever. LangChain memory mutates a lossy summarized transcript that can never be replayed. Here: mechanics live on frames (one source), context is per-invocation, pinned, byte-reproducible, and provider history is *reconstructed from frames as serializer policy*. That last move quietly kills the entire class of bugs where the stored transcript drifts from what actually happened — a disease every current harness has and none can cure.
- **Status that cannot lie.** L0 is derived from frame children and commits, not reported by the agent. Every progress-message pattern in Slack/Linear bots is self-reported and goes stale; this one structurally can't.
- **Steering out-of-band.** Controls as chunks, not in-band "please stop" messages the model may ignore. `adjust` with context purity — the intervening discussion does *not* auto-enter context — is better than Claude Code, Cursor, and ChatGPT, all of which swallow the whole interruption transcript.
- **The turn as durable object.** Re-run pre-filled, failure as a first-class resting form with its mutation strip intact, per-turn cost as a read. A failed ChatGPT message just evaporates; a failed turn here is an autopsy.
- **Summary-is-group** beats both Slack threads (fragmentation) and range-based folding (a mechanism that had to be invented); one active turn as *policy* not mechanism is the right humility.

The critique must not touch the frame/session split, context-vs-discourse, or reconstruction-over-storage. Those are the best decisions in the file.

## 5. Verdict and repairs, ranked

**1. The amputated voice — severe, and the model needs the (small) change.**
Admit a quiet utterance kind into agent sessions: a `note` (or simply `message`) placeable with seq, rendered flat and unobtrusive, *never* triggering completion. Dispatch becomes a property of the gesture (the dispatcher's Enter vs a note gesture), not of the container. This resolves §1's open toward **one archetype**, containers differentiated by resident citizens — consistent with citizen mechanics, zero new substrate. Context inclusion of notes is a dispatcher-policy knob riding the existing "include the session" convention. **And fix agent.md's pause paragraph**, which currently promises discussion-in-conversation that the model forbids.

**2. The correction gesture — moderate-severe; rendering + dispatcher policy only.**
While a turn runs, the input row *is* the adjust channel: typing implies pause, Enter sends the distilled correction as `adjust`, resume follows — one gesture, the existing taxonomy underneath, all current control mechanics unchanged. Escape hatch to full pause-and-inspect stays. This costs nothing architecturally and removes the tax on the medium's most urgent act.

**3. Resting form — moderate; a §7 convention change, one line.**
A completed work-turn rests as **prompt + mutation digest + answer**, with the answer folding when it's long commentary and the digest ("wrote 3 chunks to plan/retry") always visible. Turns with empty mutation strips (Q&A) rest as prompt + answer, as now. The mutation strip already exists; this is a rendering priority, and it realigns the resting form with the system's own thesis about where value lands.

**4. Session identity and re-entry — moderate; composes from existing pieces.**
A standing session summary chunk, `relates` on the session, maintained by `narrate`/`summarize`: it is simultaneously the session's *name* in lists (auto-titling done right — derived, current, cannot go stale silently), the *re-entry card* pinned at the top when you return, and the *projection* used for old turns in "include the session." One chunk, three consumers, all mechanics already specced. Also: pull summary folds and narrate earlier in §6's order, or accept that weeks 2–8 of real use happen in an unfolded scroll.

**5. Transcript calcification — structural risk, needs a sentence now, a build later.**
Mark §7's "reads as a conversation" explicitly as *v0.1 staging*, and name the destination in session.md: the session's target ground is the standing picture (artifact + narration), turn log as citizen. No mechanism changes — the peer inversion already carries it — but if the destination isn't written down, the resting-form convention becomes the identity by default, and this project will have built a very well-audited chat app.

**6. Gate placement (the standing open) —** lean *both*: gates onto the session while pending, like controls; an obligation is a discourse-visible fact, and penetrate-the-fold already concedes the principle. Removing-past-turns stays rightly deferred.

**Bottom line.** Turns-only gets the *machine's* side of the session right — better than anything shipping today — and gets the *person's* side wrong in one specific, repairable way: it left the human no voice below the cost of a model call, and the specs already contradict themselves over it (agent.md's pause-and-discuss vs session.md §1). Repair 1 is the load-bearing one; with it, repairs 2–4 are policy and rendering; without it, the model forces every soft human behavior — notes, asides, hesitation, co-presence — out of the field, which is exactly the exile this project was built to end.
