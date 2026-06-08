# Conventions

Working agreements — how we operate together on this project. The principles that shape *how the work happens* (no mind holds complexity, simple is not easy, prefer data, name what you don't know) live in [`inside.md`](inside.md) under **Principles**, and the values beside them. This file holds the operating rules and code-level expressions that aren't themselves principles or values.

## Code

The architecture — prefer data, pure functions, one source, decompose, coherence — lives in [`inside.md`](inside.md) under **Principles**. These are its code-level expressions.

- **Vanilla TypeScript, few abstractions.** Keep the abstractions few, so the code is recognizable regardless of a developer's background. JavaScript can be bent fully functional, but we avoid currying, piping, and other FP fancies — reach for the plain construct.
- **Declarative helpers.** Prefer chainable methods — `map`, `filter`, `reduce`, `some`, `every` — over manually mutating variables through `for`-loops. Prefer a simple ternary over an `if` that mutates, when it doesn't get too complex.

## Subagent grounding

A subagent is an agent without your context. By default, instruct it to bootstrap — read `README.md` and follow its reading order — so it stands on the same ground you do. The exception is a deliberately lobotomised subagent, used for a narrow scoped task where less context is the point.

Without bootstrap context, subagents hallucinate on load-bearing design questions: they produce plausible-sounding answers that contradict the specs because they never saw them.

Even with bootstrap context, verify a subagent's conclusions against the core files before relaying. If a claim doesn't match what's in the files, investigate further or spawn another — don't pass it through.

## Commit messages

Subject lines under 72 characters. Use the body for details.

## Commits require approval

Never run `git commit` without the user explicitly saying so. Stage, show what will be committed, wait for the word.
