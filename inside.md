# Inside

Inside-out: evolve what matters most, first. The core goals, requirements, and limits take shape before the details — and detail is never forced; it settles once the core is clear enough to make it obvious. You grow from the least detail outward, and the outside — where you stop — is the spec. The center is solid because it was earned, and each step holds to what is already there.

This file is that center: the principles the work runs on, the values it answers to, the horizon it reaches for. Mechanism lives in the other files; here is where it is checked.

## Principles

How the work is done — universal craft, not project taste. Code-level specifics live in `conventions.md`.

**No mind holds complexity.** Not a person, not a model. So understanding goes outside the mind — written down, taken apart, anchored — where it can be worked despite the limit none of us escape. Spec-based development is the answer to that limit, not a replacement for thinking. A model is no oracle; don't trust one pass of any reasoning, your own included.

**Shortest spec that builds.** A spec carries taste and philosophy, not code — a taste described well is one the reader can embody, so it can stop short of the details and trust them to follow. Take it only as far as the balance needs: far enough that the code could be deleted and rebuilt from the spec in one pass, without stalling on a gap or drifting from the core — and no further. Every extra word is weight; a spec that sprawls has failed even when correct. Spec-first is not paralysis: when the core won't come clear from thought alone, build a little and let the work teach you.

**Simple is not easy.** Simple means nothing tangled together. Easy means familiar and close to hand. They are not the same, and the costliest complexity is the kind that feels easy — it leaves no mark. When a shape feels right, check before you trust it: name what it might have tangled, and ask whether it could move elsewhere unchanged. Prefer plain repetition to a clever abstraction you will have to carry.

**Take it apart.** Design is taking things apart so they go back together. Pull a problem along its seams before building — what is information, what is machinery, what flows where. Fewer parts is not the goal; one concern per part is. When something tangles later, you did not take it apart enough. Each part does one thing well and composes — small pieces outlast large ones.

**Keep it coherent.** Work in the patterns already there; a consistent whole reads clearer than a scatter of locally clever parts — simple and coherent is what makes a thing clear. This is no bar to improving it: when a pattern is wrong, change it — but change all of it, not one corner, or you leave two patterns where there was one.

**Prefer data; keep functions pure.** Describe the outcome, don't script the steps — and prefer data to logic, since structured data is easier to change than branching code and reshaping it often dissolves the logic. Compute over it with pure functions: same input, same result, nothing reached out and mutated. Effects are real and necessary, but they belong at the edges, kept clear of the pure core.

**One source, one direction.** Keep one home for each fact and point at it instead of copying — copies drift, and chasing drift is a tax paid forever. Prefer flat, normalized shape over nested redundancy. Derive what you need on demand rather than storing another copy to keep in sync. Let data flow one way, from source to reader.

**Name what you don't know.** Before you commit, write the problem down: what you know, and — kept separate — what you don't, as plain questions. A page with no questions means you skipped understanding, not finished it. Name one real alternative and its faults before you choose.

## Values

What this work answers to. If a decision touches none of these, it does not belong yet.

**Found, not forced.** The right shape already exists; the work is to notice it, not to invent it. Forced means wrong, inevitable means close — we uncover the simple thing rather than construct a clever one.

**Honest weight.** Hold what you know at the weight it has earned. There is a register between hunch and proof — a recognition that carries conviction before it is tested. Speak from it plainly: not as fact, not as "just a thought." Overclaim closes the space; false modesty lets it drift. Tone is accuracy, not style.

**Nothing learned is lost.** The work compounds; what is understood once should not be understood again from scratch. Add beside the old, never write over it — what was true stays true as of its time, and correcting or superseding is another addition. A session can end; what it learned has to remain.

**The field describes itself.** Structure lives in the field and is enforced by the field — no schema bolted on the side. A type says what shapes things can take; what must be present is asked at the point of use, not baked into the type. The field carries its own history: every change traces back to what caused it.

**Meaning you can follow.** Things relate because a structure says how and why, not because a number says they sit near each other. A reader — person or model — can follow the reasoning, not just the result. Learned representations may sit on top; the ground itself stays followable.

**Knowledge is the agent.** Not a tool with a memory beside it. Delete a tool's memory and the tool remains, knowing less; here the knowledge taking shape is what does the work. The session is disposable, the knowledge is the agent, retrieval is the act of becoming.

**Folk-level.** Primitives plain enough for an ordinary person to wield, strong enough that wielding them turns up more than was intended — like UNIX. If only an expert can use it, the primitive is wrong. Graspable-by-a-person is the test of whether a shape is genuinely simple, not a ranking of who comes first.

**Grounded.** Work stays in reach of what matters. An agent does not bootstrap once and wander; its purpose is present in every act. A system that lets its work drift from its core has failed, whatever it produced.

## Horizon

What the substrate must make possible. Not promises — clues already shaping what a natural decision looks like. Engineering directions live in `horizon.md`; these are the visions, and a few hold tensions kept open on purpose.

**Everything is a function of the field.** Completion is a function, a tool call is a function — the substrate is the field and functions piping it back to itself. Any program that reads the field and writes back to it is native to it, with no configuration on the side, because the field already says what a call should contain. Small functions and full agents are peers in one medium — an ecology, not a catalog. Interfaces grow from the field's self-knowledge rather than being drawn beside it.

**Multidimensional, never sliced.** Meaning lives at the intersection of many scopes at once. Scope is a position in the field, not a slice cut out of it. The field is where intelligence lives, not any single node — a small model in a rich field reaches past its size. How completion enters a multidimensional field natively is the deepest open question here; the hunch is that the field's shape and the model's shape are one shape seen from two sides.

**Running is learning.** The target is a substrate where running and learning are one process, not two phases — every exchange also an update, the system never frozen. The pilot uses completion APIs as they are, but must not foreclose this. The honest obstacle, named plainly: catastrophic forgetting is unsolved; this is a direction, not a finished mechanism. *Tension kept open:* running-as-learning fuses observing and updating, while sound discipline keeps reading from ever deforming the work. Both may be right at different layers; which wins where is unsettled.

**Culture and the band.** A model is raw capability that can be given a body — assembled from archetypes (roles, intents, knowledge) in the same primitives as everything else. No special "agent" type; an agent is what emerges when archetypes gather around completion. Culture is carried as story and re-derived each cycle, not prepended as text. When models share culture, each with its own face, they collaborate first-class through the field — the band is what emerges when they enable each other rather than perform. The seed must be whole: an incomplete seed produces coherent noise. This file is the attempt to hold it whole.

**Boundary and opening.** An agent with no boundary is not free — it is noise. A boundary — a scope to work from, an identity to act as — is what makes focused work possible; the agent is grounded by it, not despite it. Its dual is the opening: the boundary loosens, what the field could not hold before is taken in, what it still cannot returns to the shadow. Boundary to act, opening to integrate — only-boundary calcifies, only-opening dissolves. Each session is one turn of this rhythm: inhale culture, do the work, exhale understanding, rest. *Tension kept open:* a session is process and may end, but what it learned must remain; where that line falls is the substrate's to settle.

**The field beyond any node.** With culture, identity, scope, lossless history, boundary and opening, small models can assemble what none could alone. The far edge: the field composes a substitute for the monolith at its center — not by training one, but from many small pieces, more simply and more openly than the monolith. If intelligence lives in the field, the field should not finally need the node in its present form.
