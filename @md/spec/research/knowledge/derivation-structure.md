# Blind derivation — the structure angle

*Arc record, 2026-08-24. A clean-room pass (the cleanroom precedent): an isolated agent given only `README.md` and [`opening.md`](opening.md) — no conventions.md, no ladder, no chart — and asked to derive the code of knowledge structuring from the thesis alone, entering from what must be true of the medium, the unit, and the join. Research register: nothing binding. Its convergence with the independent reader-angle pass ([`derivation-reader.md`](derivation-reader.md)) and with the steward's own pre-draft is the evidence it exists to provide; the synthesis stands in [`code.md`](code.md). Verbatim below.*

---

## 0. The derivation frame

The author's gradient is **values → principles → mechanisms → methods**, distinguished by what can argue with each. Working the derivation forced one refinement, offered as a finding:

**A value alone yields no principle.** A value is terminal and therefore silent about what to do; it becomes checkable only when it meets a fact about the world that constrains it. So:

> **principle = value × fact of the world**

This matters practically: it tells you where a disputed principle can be attacked (deny the value, or deny the fact — nothing else), and it keeps the value set small, because every constraint that *feels* like a value ("keep it short", "keep it engaging") turns out to be a value meeting a fact and belongs one rung down.

The facts are not negotiable and not ours; the values are ours and are few.

---

## 1. The values

Two. Each tested for irreducibility by asking what it reduces *to*; anything that reduced was demoted to a principle.

**V1 — Understanding must reach a head that is not the writer's, now.**
Across people, across roles, across sessions, across time. Nothing sits beneath it: it is the reason anything is written down at all. Compounding is its consequence, not its ground — a result that reaches another head becomes a floor; one that does not is re-derived, and that cost surfaces at the boundary it failed to cross.

**V2 — What is written is what is held, and its grounds are reachable.**
Honesty with warrant. Irreducible and *independent of V1*: a falsehood travels perfectly well. This is the value that makes knowledge questionable, and questionability is what makes it standable-on — you cannot safely stand on what you cannot check.

**Demoted, with the reduction shown** (recorded so the minimality is auditable):

| Candidate | Reduces to |
|---|---|
| Compounding | V1 across time |
| Openness / anyone may build | V1 across a boundary (the monolith complaint) |
| Engagement, non-fatigue | V1 × F1 (a bored reader is a head not reached) |
| Smallness, minimalism | V1 × F1 |
| Stability of the core | V1 × F2 |
| Self-application | V2 (a code that exempts itself is not believed) |
| The reader's goal is sovereign | V1 × F3 |

---

## 2. The facts

Constraints of the world that the values meet. Five; each earns its place by generating a principle no other fact generates.

- **F1 — Every head is bounded.** Human working memory and model context are the same constraint in different currency; attention and appetite are bounded too. *The context-window argument and the comprehension argument are one argument* — which is why one structure serves both readers, and why there is no need to design twice.
- **F2 — Knowledge changes, at uneven rates.** Some of it is settled, most is not.
- **F3 — Readers arrive with different goals and different prior state,** and want different endpoints.
- **F4 — The order of dependency is not the order of motivation.** X may be definable only after Y, while X is the whole reason anyone would care about Y.
- **F5 — What is met first frames what is met after.** First-met material weighs more than later material of equal quality.

---

## 3. The principles

Each is a value × fact, and each carries a check that returns yes/no on a single unit. A unit ships when every check is yes, or the exception is written down in it.

**P1 — Self-standing.** A unit can be read alone; its claim can be understood and disagreed with without opening another unit. `V1 × F1`
*Check:* hand the unit alone to a competent stranger. Can they state its claim and name what they would argue with?

**P2 — Why-first, at every unit.** A unit opens with what is not possible without it, before what it is or how it works. This holds at every unit, not just the entry, because in an addressable graph any unit may be someone's first. `V1 × F1, F5`
*Check:* does the opening let a reader decide to stop, before they have spent?

**P3 — One home per fact.** Every fact is authoritative in exactly one unit. Where it appears elsewhere it is marked as restatement and points home. `V2 × F2`
*Check:* for any claim in the unit, can you name its home? Do the restatements link?

**P4 — Status is legible before arrival, and does not exceed its supports.** A unit's epistemic register is readable from its address and stated again inside it; no unit may claim more standing than the weakest unit it rests on unless it says so in place. `V2 × F2`
*Check:* standing at a reference, do you know what you are about to get? Does the unit's own status survive its dependencies?

**P5 — Goal order governs reading; dependency order lives in the references.** The walked path is ordered by what the reader came for. Prerequisites are reached by reference, or carried as bounded restatement. The reference absorbs the conflict between the two orders. `V1 × F3, F4`
*Check:* can a reader with goal G read a prefix of the path and stop served?

**P6 — Required depth is one; permitted depth is unlimited.** No unit's comprehension requires following its references. Every reference is an offer. `V1 × F1`
*Check:* delete every referenced unit. Is this one still complete about its own claim, and does its prose still read?

**P7 — The core is the smallest and the stillest.** What most depends on changes least, is written first, and is shortest; volume grows as stability falls. `V1 × F2`
*Check:* is anything in the core going to be rewritten this month? Is anything voluminous being leaned on as a floor?

**P8 — The code is a unit of the field it governs.** Same medium, same grain, its own rules applied to itself, revised the same way. `V1 × V2`
*Check:* does this document pass its own eight checks?

---

## 4. The composition

### 4.1 What must be true of the medium

Derived, not chosen:

1. **Singular.** One medium, because a join is only general when both ends are the same kind of thing. Two media need a translator at every crossing; translators multiply with the count of pairs and lose on each pass.
2. **Addressable at unit grain.** "Findable" is a precondition of compounding; the grain at which the medium can be addressed *is* the grain of the unit — nothing finer can be stood on.
3. **Legible to both head kinds without translation.** Follows from F1 being one constraint, not two.
4. **Versioned.** Warrant requires knowing what was believed when; standing-on requires that the floor's movement be visible rather than silent. Unversioned knowledge cannot be honestly questioned after the fact. `V2 × F2`
5. **Able to hold its own governing code.** From P8; also from V2 — a rule expressed outside the material it governs cannot be checked against it.

Markdown satisfies 1–3 and, in git, 4; it satisfies 5 by convention only. It fails at derived backlinks (§4.3). That is the honest ceiling of the study vehicle.

### 4.2 The unit

**A unit is one why with its whole body.** Formally: the smallest span that (a) asserts something a reader could disagree with, (b) states why before what, (c) survives being read alone.

**The split test — split on why, not on length.** A unit is too big when its why no longer covers all of its body: when some part serves a different reason for existing, that part is a different unit. Length is a symptom of a why that has drifted, never the criterion. `[open]` — no numeric size bound is derivable; only the test is.

**The floor.** A unit smaller than one disputable claim is not a unit; it is a fragment of one, and fragments cannot be questioned, so they cannot be stood on.

**The bound above** is one head-load, set by the *smaller* of the two heads that must read it. For prose the human is typically the tighter bound.

### 4.3 The join

**One join: the reference.** One, for the same reason as one medium — a second join kind partitions the graph, and a unit reachable only by kind *k* is invisible to a reader traversing kind *j*. Every added kind buys expressiveness with composability. `[open]` — whether the join at knowledge grain should carry a *type* is undetermined. The web's untyped link compounded enormously; Night's substrate types the join at execution grain. The burden of proof sits on typing.

Four properties, each derived:

- **It addresses whole units, never their interiors.** If you can reference into the middle of a unit, the middle was the real unit — contradiction with the unit's grain. The addressing grain and the unit grain are the same thing seen twice.
- **It sits in place**, at the point in the prose where it becomes relevant — not collected at the end. A thread is pulled where it is felt.
- **It carries three things at the point of reference: what is there, why you would go, and its status.** The decision to descend is taken *at* the reference, before arriving; a reference that makes the reader travel to find out whether the travel was worth it charges them for the question. `V1 × F1`
- **It is removable.** The sentence containing it must complete without it (P6). This is what makes every descent returnable: the reader leaves from a finished place and loses nothing by coming back.

**Direction.** The forward reference is *written*; the backward reference must exist but is *derived*. Both directions are needed — to stand on a unit you need to know it is stood on; to question it you need to know who falls if it moves — but authoring only ever writes forward. Where the medium cannot compute the reverse (plain markdown), the reverse index is absent, and that is a named cost, not a solved problem. `[open]`

### 4.4 How units form a whole

**The whole is a graph with one distinguished entry, plus one ordered path per goal.**

- **Not a tree.** Containment makes the contained thing unaddressable at its own grain, which contradicts §4.3. Files may nest for filing; the *knowledge* relation is reference.
- **Sequences are views, not structure.** Each goal induces an ordered walk over the graph (F3). Many walks, one graph.
- **There is no "complete read."** Therefore no unit may be written assuming the reader has read the others — which is P1 again, arriving from the other side.
- **Wholeness test: reachability.** The whole is complete not when coverage is exhaustive but when every live unit is reachable from the entry along some published goal path. An unreachable unit is either dead or the map is wrong; both are findable defects.

### 4.5 Depth

**Permitted: unlimited. Required: one.** The distinction is the entire cost argument. If understanding a unit requires following *k* references, each of which requires *k* more, the cost of standing on a result grows exponentially with depth and re-derivation becomes rational — the failure the thesis is trying to prevent. Fixing required depth at one makes depth free for the pursuer and zero for the satisfied. This is what "shallow" means precisely: not a small graph, but a required depth of one at every unit.

**The entry's published path is separately bounded:** short enough that a reader holds it as a list (F1). Single digits of steps. `[open]` — the exact bound, and what happens when goals multiply past it.

### 4.6 How epistemic status is carried

Three carriers, each derived from a different need:

1. **By address (register).** Status is the *location*, so it costs no annotation and is visible at the join for free (P4's first half). The partition is derived from **what argument would change the unit's content** — which is the only honest ground for a status label:

   | Register | Binding | Argued by |
   |---|---|---|
   | Law / spec | yes | ratification |
   | Research | no, structured | evidence |
   | Draft | no, in motion | anyone |
   | Record / log | not a claim | fact of what happened |

   `[open]` — whether four is the right cut, and the reorganisation hazard: moving a unit silently changes its status.

2. **In the unit,** restating the register and marking any claim inside it that is weaker than its register. Registers are coarse; a law-grade file containing one unproven step must say so in place.

3. **Inheritance rule.** A unit inherits the doubt of the weakest unit it stands on, unless it states why not. Without this, status is a label rather than a fact, and V2 is violated at exactly the point where it matters most — the load-bearing citation.

---

## 5. The entry point

**There is exactly one.** Two entries force the reader to choose before they know anything — a choice they are structurally unequipped to make. Per-audience entries exist, but as sub-entries reached *from* the one. `V1 × F3`

**It must do four things, and no more:**

1. **State the why of the whole in its strongest true form.** F5 gives this its weight: first-met material frames everything after, so the entry is where the most care per word is spent — and where rhetoric is most tempting and most damaging (V2).
2. **Say what the thing is, minimally, including what is not settled.** The unsettled part is not a weakness disclosed at the end; it is content, and omitting it makes every later claim uncheckable.
3. **Publish the paths and their stopping points, per goal.** Not "here is everything" — "for the idea, these; to build, these; to continue, these."
4. **Be a unit itself** — self-standing, why-first, one head-load. Entering must cost one read, not a syllabus.

**What it must be:** the only unit permitted to assume nothing about its reader, and therefore the only one whose audience is all audiences. Consequence: **the entry cannot be complete about the whole.** It is complete about two things only — the why, and the map.

**The two forces, resolved.** The entry is read by the newcomer for orientation and by the returner as an index. These conflict on length: the newcomer needs prose, the returner needs a list. The resolution is structural, not a compromise — **the why is prose, the map is a list**, in that order, in one unit. The newcomer reads to the list and starts walking; the returner skips to the list. Neither pays for the other. (This is the derived form of "inviting from above, everything in place from below.")

---

## 6. The emanation

How reading proceeds from the entry.

**The governing order is the reader's goal, not the subject's dependency** (P5). Dependency order delivers value only at the end — you understand once all prerequisites are laid — and a bounded reader who stops early gets nothing. Goal order delivers a whole thing at every step. Since stopping early is the normal case (F1, F3), goal order governs.

**Along a goal path, each step stands on the ones before it.** Goal order is made dependency-sound *where it can be*; where it cannot, the reference absorbs the conflict — either by pointing forward ("defined at X") or by carrying a bounded restatement, marked and linked home (P3).

**Breadth before depth, on a first reading.** The frame is set at the top (F5); a reader who dives deep before the frame is set mis-frames everything after. So the entry's path is walked at its level, and folds are opened after. Returners jump; the norm governs first contact only.

**A reader with a goal moves in one of three ways at every unit**, and the structure must make all three cheap:
- **stop** — the goal is served;
- **continue** — take the next step on the path;
- **descend and return** — open a reference, come back with nothing lost (guaranteed by P6's removability).

**Engagement is a structural obligation, not a style.** The reader is pulled onward not by the writer's plan but by the questions the last unit raised in them. Therefore **a unit must leave visible the questions it does not answer, each with its reference where one exists.** A question raised and left invisible ends the reading or invites a guess; both are V1 failures. This is what makes a reference "a thread to pull rather than a failure" — the pull is the named unanswered question.

**A reading stops at whichever comes first:**
1. the stopping point the entry published for that goal — the writer's declared exit;
2. the point where the reader's own question is answered — the reader's exit;
3. the point where the next reference no longer answers a question the reader now has — the natural exhaustion.

The entry must publish (1) because without a declared exit readers either over-read (cost) or under-read (error), and neither is detectable by the reader themselves.

---

## 7. The method

How one unit is actually written, such that another head produces one reliably. Eight steps; the order is load-bearing.

**1. Write the why, in one sentence.** What is not possible, or what breaks, without this unit. If the sentence will not come, the unit does not exist yet — do not write it. This is the cheapest possible failure and it must be available first.

**2. Name the reader and the exit.** Who arrives here, and what they can do after. **If there is more than one exit, there is more than one unit** — split now, before any prose exists.

**3. Inventory the propositions, loosely.** Every claim the unit must carry, as claims and not as sentences, unordered. Mark each: *held* / *believed* / *open*.
> The looseness is not stylistic. In-session evidence: prose regenerated from a *tightly* compressed proposition inventory converges on the inventory's own wording — a tightly compressed proposition already *is* prose, and it forecloses the telling. The brief's compression level sets the writer's freedom. Compress tight only when fidelity, not telling, is what you want. `[open]` — evidence is one session, four variants.

**4. Cut to what only this unit can hold.** Any proposition whose home is elsewhere becomes a reference (P3). Any proposition serving a different why becomes a different unit (§4.2 split test). What survives is the body.

**5. Order for the reader.** Why → what must hold → how → what to do. Anything demanded by dependency but arriving too early for motivation becomes a bounded restatement plus a reference home (P5).

**6. Write it once, whole, with the inventory out of view.** The inventory fixes the content; the writing fixes the telling. Held in view, the telling collapses into the inventory's wording. This step is where the unit becomes readable rather than assembled.

**7. Place the references and then delete them.** Each at its point of relevance, each carrying what/why/status. Then read the unit as if every reference were gone: the prose must survive intact and the claim must still be complete (P6, P1). Anything that does not survive was a dependency masquerading as an offer — return to step 5.

**8. Stamp status, leave the opens visible, run the checks.** The register in place; any claim weaker than the register marked; the questions this unit does not answer listed with their references. Then the eight checks of §3, each yes/no. Ships when all are yes, or when the exception is written into the unit.

---

## 8. Open

Marked rather than asserted; each is a place where the derivation stopped short of a warrant.

1. **Fractality of the ring.** Derived: *why-first* is fractal, and it is fractal *because addressability is* — any unit may be someone's entry. Not derived: that the full ring (why → what must hold → how → practice) is fractal. A unit that is legitimately the "how" leaf of another unit's ring appears to need only the why. Open at every scale but the first ring element.
2. **Unit size.** Only the split test is derivable; no numeric bound is.
3. **Typed joins.** Whether the reference should carry a kind at knowledge grain. Adding kinds costs composability; the burden sits on typing.
4. **Backlinks** in a medium that cannot derive them. Currently a named cost with no resolution inside markdown.
5. **Branching by audience.** How many goal paths an entry may publish before the map itself exceeds a head; whether paths share a common core with branches, or run separately; where each branch ends.
6. **Restatement economics.** Bounded restatement trades maintenance cost for reader cost. One-home-plus-link mitigates but does not settle whether the trade stays positive at scale.
7. **The register partition.** Whether four is the right cut, and the reorganisation hazard of address-carried status — moving a unit changes its status silently.
8. **Evidence base of step 6.** One session, four blind variants, yield reported as sentence-grade. Treat as the method's one empirically grounded step and its weakest.
9. **Whether every unit can carry every ring.** The author's own recorded caution; this derivation asserts only P1–P8 as universal, and P2 as the only universal *ordering* obligation.
