# Method: how this directory came about

*Research register. The chain of custody for the sweep that produced [`raw/`](raw/) (2026-08-26→27), recovered forensically from the session transcript on 2026-08-29 (session `7c9850eb-615c-4ccb-9977-a87825ae42e1`, in the local Claude Code project directory; line numbers below refer to it); one recovered brief was verified byte-for-byte against the transcript. The corpus's two readings are labs in the study, and each carries its own record beside its output (moved there 2026-08-30): [`01-categorical/`](../knowledge/study/01-categorical/method.md) (2026-08-28) and [`02-encounters/`](../knowledge/study/02-encounters/prompt.md) (2026-08-29).*

---

## Stage 1 — the sweep (2026-08-26 → 27): how `raw/` came about

### The commission

The session was opened with "Bootstrap yourself, specifically all the way to code.md", and the sweep was commissioned in a single message (line 176, 06:16:57Z), verbatim including typos:

> I'd like you to do severe, multiphase research on where we are on the planet in regards to knowledge structure. This is the absolute center around the technology of ai, first class is what makes solution compund and compete, monoliths dont stand a chance, be it knowlledge structure for a project, between a client and an IT-team, for all parties integration and first class usage of it.
>
> Then it has also been a few months since we last check where openlight stands in the ecosystem, last time there wasnt really anything competing, that is also interesting.
>
> The code.md is a rough proposal, thourgough reserach could really lift it. So use your context sparsly but enough to proprely reasaon about the agents you construct and the returns they have so hat you can contionue to coordinate the charting of the space available on the net.
>
> Good luck

Everything after that is the coordinating session's design, under that one commission: **no user message steered the sweep's content between the commission and its completion.** The only mid-sweep user words were "Limit hit, proceed" and "No limit happened then now it is fresh, proceed" (around the monthly spend limit, below).

### The design

Announced at line 196 before any launch, key wording verbatim:

- Four phases, "and I stay in the loop between each."

- "**Phase 1 — broad multi-modal sweep (11 agents, parallel).** Each agent gets a distinct search angle and is blind to the others, so no one angle's assumptions filter the field. Ten hit the net; one reads the sister study locally so the web sweep is additive. I'm deliberately *not* having the web agents bootstrap on the repo — the cleanroom precedent: they'd come back in our vocabulary and confirm us. They get a written brief and report the world in its own words."

- "**Phase 2** — deep reads on what Phase 1 proves load-bearing. **Phase 3** — adversarial verification of every claim that would change a decision. **Phase 4** — synthesis into an updated landscape record plus a findings set aimed at `code.md`'s named opens."

### The briefing skeleton

Every web brief shared a fixed frame — lane assignment ("You are one of ten parallel research agents… Your angle: **[the lane]** … Stay in your lane."), a recency line ("Today is 2026-08-26. Training data ends ~May 2026 — web-search anything recent."), a strict `EVIDENCE DISCIPLINE` section requiring URL + date and per-claim strength grading, and this report skeleton (verbatim from the documentation-systems brief, line 199; word budgets varied 1500–3000):

> RETURN ONE REPORT, 1500–2500 words, in this skeleton:
> 1. HEADLINE — 4–6 bullets: what a well-informed practitioner would NOT already know after this sweep.
> 2. THE MAP — the real state of this space, organised however the evidence demands.
> 3. LOAD-BEARING FINDINGS — each as: claim · evidence (URL + date) · strength grade · why it matters to someone designing a knowledge structure.
> 4. WHAT MOVED IN 2025–2026.
> 5. WHAT I COULD NOT ESTABLISH — and where the answer would live.
> 6. LEADS — up to 12 URLs worth a deep read, one clause each.
>
> Report the world in its own words. Do not adopt or invent private vocabulary. Do not read any local repository.

Per-agent variation beyond the skeleton: the lane definition and a list of the other lanes; a *neutral restatement* of the project's relevant claims ("THE FRAME" / "THE SYSTEM TO POSITION" / "THE THESIS TO HUNT FOR") — the claims translated out of project vocabulary so reports could not echo it back; a lane-specific `WHAT TO CHART` list naming concrete systems and literatures; and lane-specific report sections ("NEAREST NEIGHBOURS", "THE FOUR DISTINCTIVENESS CLAIMS, TESTED", "WHAT DIED IN THIS SPACE AND WHY", "THE STRONGEST OPPOSITION"). Phase-3 briefs opened differently: "You are a PHASE-3 ADVERSARIAL agent. Stress-test a strategic claim from BOTH sides and return a VERDICT, not a survey. Default to refuting…" — and the citation verifier: "You are a VERIFICATION agent, not a survey agent. Chase specific citations to primary sources and report what they actually say. Precision beats coverage…"

Four full verbatim briefs are preserved in the transcript at lines 197 (sister-study local read → `a583337921a4f7975`), 209 (comprehension science → `adc8fe8e64ae23f70`), 211/239 (typed-versioned substrate → `abffcf492c6f3d77d`), and 217 (thesis-adjacent hunt → `a09867b88abcb610b`); the briefs of every other spawn are likewise in the transcript at the spawn timestamps below.

### Mechanics

All sweep agents: the `Agent` tool, `subagent_type: "general-purpose"`, `model: "opus"`, background execution. 27 top-level spawns on 2026-08-26:

- Phase 1, 11 agents, launched back-to-back 06:18:57–06:23:35Z; the last three hit a concurrency ceiling and were relaunched as slots freed (06:24–06:29).

- Phase 2/3 deep reads, 06:29:30–06:39:38Z (citation verification, schema evolution, professional-reader evidence, the adversarial stress-test).

- 06:42:59Z: the monthly spend limit killed five agents in flight; the session paused ~4.3 hours.

- Second wave, five agents, 11:03–11:04Z, "each now briefed with what the session already established so they extend rather than redo." Last report landed ~11:35Z.

64 subagent transcripts exist for the session: 27 top-level, the rest depth-2 children the sweep agents spawned themselves (their spawning prompts live in the parent agents' transcripts and were not extracted). Two reports named in the raw README are depth-2 children, not top-level spawns: `a458ace67969949f3` and `af750ce80e754223b`.

### The harvest

`raw/` was produced mechanically on 2026-08-27T19:11Z: a shell loop over every subagent transcript, jq-extracting the **last assistant message's text blocks** into `raw/<id>.md` and deleting any result under 1,500 bytes (failed or trivial runs). Result: "scanned: 57, kept: 45". So each raw file is one agent's final report, unedited, named by its run id — which is why raw holds both the named runs and unnamed depth-2 children. The sweep README, with its named-runs table and the two cautions (exhausted search budgets; summariser fabrications caught twice), was written one minute later.

---

## What the chain teaches (held lightly, for the method to compound)

- **Cleanroom briefs work.** Translating the project's claims into neutral terms and forbidding repo reads produced reports that test the thesis instead of echoing it — including reports that refute named claims outright, which is the point.

- **One head for connective tissue, many heads for coverage.** The fan-out found the world; only a single context holding all 45 reports could cut folds across them. The two are stages, not rivals.

- **The purification is not the meaning.** The same corpus yielded a 7:1 categorical reading and a 16:1 narrative one, serving different outcomes for different readers — the concrete instance of the code's open question on audience and outcome. Neither reading replaces the other or the raw.

- **A link to an unknown is load-bearing.** The staged-doors rule let the narrative reading ship whole without charting everything — coverage became a growth path instead of a precondition.

- **Provenance decays fast.** Stage 1's method was recoverable only because the transcript still existed, two days later, and recovering it took a forensic pass. Recording the method at the moment of the work — as the study's lab records now do — is the cheap version of what stage 1 made expensive.
