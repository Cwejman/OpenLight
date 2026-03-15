# Agentic Integration

How the knowledge system relates to agents and other consumers. What's settled vs. what's being explored.

## Settled — The Metaphors and Identity

These emerged across sessions and have been consistent:

**The breathing metaphor.** The system and its consumers are in cyclical exchange. Inhale: knowledge flows into context. Exhale: understanding flows back. Not retrieval-on-demand — a continuous rhythm. You don't decide to breathe. Breathing adapts to activity.

**The night metaphor.** Sessions are daylight — active, bounded, visible. Knowledge persists through the night — quiet, continuous. Night is not absence. Seeds germinate in darkness. The system's natural state is the persistence between sessions.

**The identity equation.** The knowledge system IS the agent — not a tool it uses. The LLM is the reasoning engine; the knowledge system provides identity. Delete the knowledge and nothing exists. (The genome metaphor: knowledge is the genome, the LLM is the cellular machinery that expresses it.)

**The three-beat sentence:**
> The session is disposable. The knowledge is the agent. Retrieval is the act of becoming.

**The architectural test.** Delete memory from Mem0 → you still have ChatGPT. Delete knowledge from this system → nothing exists. Instrumental vs. constitutive memory.

## Settled — Values

- The system is not agent-specific. An agent is one consumer. A website, a TUI, a human browsing — all valid.
- Nothing knowledge-worthy should be lost to session boundaries or compaction.
- The chat-output antipattern: knowledge-worthy content that exists only in chat and never reaches the system IS loss.

## Settled — Initial Approach to the Cycle

**The low-level completion-model cycle is deferred.** Integrating at the completion level (every generation step tied to the knowledge system) is the deeper vision but not the immediate step.

**Initially: deliberate writes, Claude's existing capability.** Just like this session — talk, explore, deliberately write to the knowledge system. Claude's existing tooling suffices. No systemic routine cycles needed to start.

## Hypothesis — Session Bubbles (Later, With Full Integration)

When full integration exists, each session could be its own peer knowledge base — a bubble. Culture and routines define what flows in. The session produces understanding and writes back. Some content (like raw prompts, tool call logs) stays in the session's peer, separate from the main system. The peer model gives this natural isolation without polluting the core.

## Hypothesis — The Deeper Cycle (Deferred)

The low-level idea: completion-model integration directly with the knowledge system. Every turn writes. The model's cycle is natively tied to the knowledge system.

**Remains a direction, not an immediate goal.** Open questions preserved:

- Granularity — every tool call? every turn? agent decides?
- What gets written — everything? just the delta? just extracted understanding?
- Who decides — system pulls or agent pushes?
- Cost and noise

## Hypothesis — The Session as Compute Surface

Partially proven. Bootstrap shows a session CAN start with full context. The exhale side is manual — initially that's fine. Automation comes when the model is proven.

## Background — Integration Requirements (Further Out)

Not the current focus but important context:

- **Collaboration.** Will be required. Filesystem alone won't work — server needed (local or not).
- **Code integration.** Code is a means of the system. The PoC explored code tied directly to the knowledge base. Filesystem is the world's interface; truth resides in the system.
- **Git integration.** Possibly required. Atomic history has parallels with git. Whether the system uses, parallels, or replaces git is open.
- **File projection.** Files may be generated artifacts — views of knowledge at a point in time. The filesystem as interface, not source of truth.
