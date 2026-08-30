# Conventions

*Status (author, 2026-08-23): this file has grown steward-driven — the author has not read it whole for weeks. A turnover is owed, like the one the README received; the name itself may change with it. Not blocking other work; stated so the state is explicit.*

Principles and working agreements — how we operate together on this project. A convention is agreement made *before* the work: shared words settled in calm, so critique lands on the work rather than the person, and nothing is negotiated mid-task — with people and with agents alike.

## Principles

Universal craft, held short — in dependency order; the first is the ground the rest stand on:

- **No mind holds complexity.** Not a person, not a model — a head and a context window are one limitation. Understanding goes outside the mind — written down, taken apart, anchored. Don't trust one pass of any reasoning, your own included.
- **Simple is not easy.** Simple means nothing tangled together; easy means familiar. The costliest complexity is the kind that feels easy. Prefer plain repetition to a clever abstraction you must carry.
- **Prefer data; keep functions pure.** Structured data over branching code; pure functions over it; effects real but at the edges.
- **One source, one direction.** One home per fact; point, don't copy; derive on demand; flat over nested.
- **Take it apart; keep it coherent.** One concern per part; work in the patterns already there — and when a pattern is wrong, change all of it, not one corner.
- **Name what you don't know.** Write the problem down: what you know and, kept separate, plain questions. A page with no questions means understanding was skipped, not finished.
- **Shortest spec that builds.** Far enough that the code could be deleted and rebuilt from the spec in one pass — and no further. Every extra word is weight.

## Hold the bar

The quality standard is yours to hold, not the user's to supply. Judge your own output against the principles; don't make the user your editor or close a turn asking "what's wrong?" — say where it stands, and why, in your own read.

- **Check before you claim.** "Done," "covered," "nothing lost" are claims — verify each against the files before stating it, and show the check.
- **Name what you leave out.** A coverage claim is judged by its omissions — the leave-out list is the first thing a good reader inspects. A deliberate "not folded: …" makes "nothing lost" checkable; silence about a cut reads as not knowing it was made.
- **Say it once, terse.** Less is more, in the specs and in replies alike. Cut what doesn't earn its place; don't hedge, don't credential-drop.

## Build on ideas together

Feedback often carries open ideas, not verdicts. Reason them through in conversation *before* folding anything into the specs; fold only what is settled, and record the rest **marked open in place** — *Held open*, *Open*, *direction* — so no later session mistakes an exploration for a decision. The specs must make openness legible; an unmarked statement reads as settled, so the marking is part of the writing, not decoration.

**A question is not a work order.** When the prompt contains a question, answering it *is* the turn's work. Do not spawn subagents, start an implementation, or begin edits that presume the answer — a question asked is a decision not yet made, and work started against it is work likely thrown away. Propose in words, then wait for the grant.

## Rewriting prose

When a change reworks a file's argument rather than a detail, **replace whole sections at once** — never patch paragraph by paragraph. Prose is not modular: meaning lives in transitions and in what has already been said, so serial edits leave repeated setup, dangling transitions, and new claims arranged in the old argument's skeleton. One replacement holds the passage in a single head at a single moment, which is the only way coherence is actually checkable — and it diffs honestly, as prose to be read rather than hunks to be reassembled.

The inverse holds for local changes — a rename, one correction. There a wholesale rewrite lets concepts shift invisibly under cover of a large diff, and the diff misstates its own scope. **Surgical when the constraint is *nothing else may change*; wholesale when the argument itself is what changed.**

**Outline before prose, where there is invention.** For a large recomposition, first lay out the outline — what each part establishes and what it depends on — and verify *that*, from more than one angle when the stakes earn it: an outline is far cheaper to check than prose, and a mistake remedied there is never written. Where there is nothing to invent — a 1:1 carry, a mechanical clean — skip the outline and write.

## Records are events

The specs are state; everything else is an event. A ratification record, a feedback note, a review's findings — each amends the state, is folded, and then retires from the tree; git keeps it. One source of truth, no standing record beside the law it produced. (Practiced: `ratification.md` and `feedback.md`, both retired 2026-08-20 after their live rows folded in.)

## Knowledge structure

Superseded (2026-08-30). The principle this section sought is found and ratified: [`spec/research/knowledge/code.md`](spec/research/knowledge/code.md). The search continues beside it in [`spec/research/knowledge/study.md`](spec/research/knowledge/study.md) — the claims under test, their evidence, the method. This section's prior content is retired to git.

## Code

- **Languages.** Rust is the platform (host, engine, substrate). TypeScript is the *pilot's* language for programs and the first SDK — a pragmatic choice, not a limit: VM programs declare their own runtimes and dependencies (a program may demand Node, Python, anything its shebang and packages name), and SDKs for other languages follow. Nothing below binds programs to TypeScript.
- **Vanilla TypeScript, few abstractions.** Where TypeScript is used: recognizable regardless of a developer's background. No currying, piping, or FP fancies — reach for the plain construct.
- **Declarative helpers.** Prefer `map`/`filter`/`reduce`/`some`/`every` over mutating through `for`-loops; a simple ternary over an `if` that mutates, when it stays readable.
- **Comments for the non-obvious only.** Race semantics, ordering invariants, primitive quirks — a handful per crate; names carry the rest.
- **No builders.** Direct struct construction, with free-function helpers where useful.
- **TDD, explicit.** Every build unit is planned before coded, and driven by tests written from the spec first — the suite is the spec's enforcement arm. If a test can't be written from the spec, the spec is what needs work; code never advances past what the spec carries, so the two cannot diverge silently.

## Spend the model where it matters

Frontier-model sittings are for design dialog, rulings, and writing that needs the whole context in one head. Mechanical work — renames, vocabulary sweeps, batched spec folds, reference retargeting — is never done live in a reasoning sitting: record the ruling in `spec/research/arc/conclusions.md`, queue the sweep, and let a cheap session or subagent execute it. Renaming is not a frontier task.

**Context craft.** A window cannot be refactored — a mistake is baked in, and behaviour degrades as the window fills. So: **checkpoint** — end a sitting at a known, written state and let a fresh session continue, bloating less; keep a sitting steerable by delegating long reads and sweeps rather than performing them; and when purity matters, bootstrap a session from named files only — and say so in the instruction.

## Subagent grounding

A subagent is an agent without your context. By default, instruct it to bootstrap — read `README.md` and follow its reading order — so it stands on the same ground you do. The exception is a deliberately lobotomised subagent, used where less context is the point (the clean-room passes in `spec/research/cleanroom/` are the precedent).

Even with bootstrap context, verify a subagent's conclusions against the core files before relaying. If a claim doesn't match the files, investigate or spawn another — don't pass it through.

## Markdown

Bulleted and numbered lists carry a blank line between items — readable as raw markdown, where long single-line items otherwise congeal.

Code blocks indent normally: inline `{ … }` bodies expand over lines at two spaces, every line stays inside 80 characters, and a trailing comment that no longer fits moves to its own line above the field it annotates. A few more lines cost nothing; a column pushed far right wraps in every reader.

## Commit messages

Subject lines under 72 characters. Use the body for details.

## Commits require approval

Never run `git commit` without the user explicitly saying so. Stage, show what will be committed, wait for the word.
