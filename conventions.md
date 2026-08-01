# Conventions

Principles and working agreements — how we operate together on this project.

## Principles

Universal craft, held short:

- **No mind holds complexity.** Not a person, not a model. Understanding goes outside the mind — written down, taken apart, anchored. Don't trust one pass of any reasoning, your own included.
- **Simple is not easy.** Simple means nothing tangled together; easy means familiar. The costliest complexity is the kind that feels easy. Prefer plain repetition to a clever abstraction you must carry.
- **Prefer data; keep functions pure.** Structured data over branching code; pure functions over it; effects real but at the edges.
- **One source, one direction.** One home per fact; point, don't copy; derive on demand; flat over nested.
- **Take it apart; keep it coherent.** One concern per part; work in the patterns already there — and when a pattern is wrong, change all of it, not one corner.
- **Name what you don't know.** Write the problem down: what you know and, kept separate, plain questions. A page with no questions means understanding was skipped, not finished.
- **Shortest spec that builds.** Far enough that the code could be deleted and rebuilt from the spec in one pass — and no further. Every extra word is weight.

## Hold the bar

The quality standard is yours to hold, not the user's to supply. Judge your own output against the principles; don't make the user your editor or close a turn asking "what's wrong?" — say where it stands, and why, in your own read.

- **Check before you claim.** "Done," "covered," "nothing lost" are claims — verify each against the files before stating it, and show the check.
- **Say it once, terse.** Less is more, in the specs and in replies alike. Cut what doesn't earn its place; don't hedge, don't credential-drop.

## Build on ideas together

Feedback often carries open ideas, not verdicts. Reason them through in conversation *before* folding anything into the specs; fold only what is settled, and record the rest **marked open in place** — *Held open*, *Open*, *direction* — so no later session mistakes an exploration for a decision. The specs must make openness legible; an unmarked statement reads as settled, so the marking is part of the writing, not decoration.

## Code

- **Languages.** Rust is the platform (host, engine, substrate). TypeScript is the *pilot's* language for programs and the first SDK — a pragmatic choice, not a limit: VM programs declare their own runtimes and dependencies (a program may demand Node, Python, anything its shebang and packages name), and SDKs for other languages follow. Nothing below binds programs to TypeScript.
- **Vanilla TypeScript, few abstractions.** Where TypeScript is used: recognizable regardless of a developer's background. No currying, piping, or FP fancies — reach for the plain construct.
- **Declarative helpers.** Prefer `map`/`filter`/`reduce`/`some`/`every` over mutating through `for`-loops; a simple ternary over an `if` that mutates, when it stays readable.
- **Comments for the non-obvious only.** Race semantics, ordering invariants, primitive quirks — a handful per crate; names carry the rest.
- **No builders.** Direct struct construction, with free-function helpers where useful.
- **TDD, explicit.** Every build unit is planned before coded, and driven by tests written from the spec first — the suite is the spec's enforcement arm. If a test can't be written from the spec, the spec is what needs work; code never advances past what the spec carries, so the two cannot diverge silently.

## Subagent grounding

A subagent is an agent without your context. By default, instruct it to bootstrap — read `README.md` and follow its reading order — so it stands on the same ground you do. The exception is a deliberately lobotomised subagent, used where less context is the point (the clean-room passes in `spec/research/cleanroom/` are the precedent).

Even with bootstrap context, verify a subagent's conclusions against the core files before relaying. If a claim doesn't match the files, investigate or spawn another — don't pass it through.

## Commit messages

Subject lines under 72 characters. Use the body for details.

## Commits require approval

Never run `git commit` without the user explicitly saying so. Stage, show what will be committed, wait for the word.
