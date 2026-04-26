# Conventions

Working principles that shape how the work happens on this project.

## Subagent grounding

A subagent is an agent without your context. By default, instruct it to bootstrap — read `README.md` and follow its reading order — so it stands on the same ground you do. The exception is a deliberately lobotomised subagent, used for a narrow scoped task where less context is the point.

Without bootstrap context, subagents hallucinate on load-bearing design questions: they produce plausible-sounding answers that contradict the specs because they never saw them.

Even with bootstrap context, verify a subagent's conclusions against the core files before relaying. If a claim doesn't match what's in the files, investigate further or spawn another — don't pass it through.

## Commit messages

Subject lines under 72 characters. Use the body for details.

## Commits require approval

Never run `git commit` without the user explicitly saying so. Stage, show what will be committed, wait for the word.
