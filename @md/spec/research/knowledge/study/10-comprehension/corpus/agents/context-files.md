---
under: the code
kind: brief
---

# Context files: the widest adoption and the clearest null

`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `llms.txt` and `SKILL.md` are the conventions by which people write prose for models. Three agents covered them independently. The adoption is enormous, the vendor guidance is confident, and the controlled evidence says the most-recommended content does not work.

## 1. The scale of adoption

GitHub code-search counts on 2026-08-26, approximate and including forks: `AGENTS.md` **845,824**; `CLAUDE.md` **763,904**; `llms.txt` **167,936**; `.vale.ini` **3,832**. The magnitudes are ordinal rather than exact — restricting to repository root returns inconsistent double-digit counts — but the ordering is the finding: agent-instruction files now outnumber documentation-linting configs by roughly 200 to 1.

`AGENTS.md` is stewarded by the Agentic AI Foundation under the Linux Foundation, originating from Codex, Amp, Jules, Cursor and Factory, self-reporting "used by over 60k open-source projects" with ~22 supporting tools. That 60,000 figure comes from a December 2025 press release and has been repeated unchanged since.

## 2. The null result

Gloaguen, Mündler, Müller, Raychev & Vechev (ETH Zürich / LogicStar), *Evaluating AGENTS.md*, arXiv:2602.11988, February 2026, revised June 2026. Two settings: SWE-bench tasks with model-generated context files written to vendor guidance, and a fresh corpus of issues from repositories with **developer-committed** context files. Across multiple models and agents, verbatim: "providing context files **does not generally improve task success rates, while increasing inference cost by over 20% on average**."

The detail that matters: agents *did* follow the instructions. The thing that failed is the content type every vendor guide recommends most — the repository overview.

Corroborating, from a different design: Khatri, arXiv:2607.27250, July 2026 — Claude Code and Codex, 17 tasks across 3 repositories, **288 evaluated runs**, gold-test evaluation. "Context strategy does not measurably move correctness on either agent (bounded to ≤10–15pp via equivalence testing)." Underpowered on its own, so "no difference" here is not "no effect" — but the failure-mode triage is load-bearing: agents fail on "implementation skill — feature design, pattern selection, exact wiring — not missing repository knowledge that a context file could supply," and a manipulation probe confirmed the real context file "never converts a near-miss to a pass."

## 3. Why prose loses, mechanically

Sam-Bodden, arXiv:2607.09691, June 2026 — pre-registered, holding localisation fixed with an oracle and varying only representation, scored on SWE-bench Verified.

Natural-language summaries "answer almost none of the behavioral questions that the source answers (**4/45 vs. 27/45**, held-out repositories, independent judge), and **the gap belongs to the representation, not the summarizer** — a frontier model's summaries score exactly as poorly as a 3B model's."

The registered hypothesis *failed*: rendering a file's remainder as UML skeletons and signatures "resolves no more issues than deleting that remainder outright" (N = 70, exact McNemar p = 0.75). Compressed context matched whole files at a third of the tokens — 19K against 94K per resolved issue.

And the methodological fact that governs the whole lane: "temperature-0 API inference flips ~**9% of per-instance outcomes** between byte-identical runs. That is a noise floor under every small effect reported on this benchmark, including ours."

## 4. Where a model's difficulty does and does not track a person's

Two results bound the "one artifact for both readers" premise, and neither is reconstructible from the rest of this folder.

**Convergence is model-class-dependent.** Le, Nguyen & Nguyen (arXiv:2606.31725, June 2026) rebuild a prior human obfuscation study across five obfuscation tiers: "reasoning-tuned models demonstrate significant alignment with human difficulty patterns across experience levels, whereas instruction and coder-tuned models show **near-zero correlation**." Convergence is a property of the model class, not of models in general.

**No shared readability metric exists.** Rong, Sefidi Esfahani, Yadavally, Rigby & Nguyen (arXiv:2608.00624, August 2026): token perplexity does not reliably correlate with human understandability judgments across multiple human-grounded datasets — distributions are skewed by non-semantic tokens, human labels show low consensus, and results swing by model and tokenizer.

A third result bears on the practice of having a second session read a draft. A fresh session **with no production history** reviewing technical documents raises error-detection F1 from **24.6% to 28.6%** (arXiv:2603.12123, 2026-03-12). Small — and, as the agent that found it noted, it exposes how weak model review of documents is in absolute terms. It is the only measurement in the sweep touching that practice.

## 5. What does work: localisation

Shepard & Albrecht, arXiv:2606.20512, June 2026 — probe-and-refine tuning of repository guidance, SWE-bench Verified, **Qwen3.5-35B-A3B**, four trials: **33.0% mean resolve (refined) against 28.3% (static knowledge base) and 25.5% (unguided)**. Note the model: this is the corpus's one positive structure-for-agents result and it was measured on a mid-size open model, not a frontier one — which is precisely the condition under which [`context-engineering.md`](context-engineering.md) §5 says format gains are largest and shrinking. Critically, the gain came from agents reaching the correct files — **+14.5 percentage points coverage** — while patch quality stayed flat at ~59%.

This reconciles the whole lane. Prose *explanation* is inert; navigational *pointers* are not. It is also exactly what a good README's orientation section does for a new human contributor: where things live, how to run the tests, which conventions are not inferable. Only humans benefit from what the code means.

## 6. A contradiction on cost, unreconciled

arXiv:2602.11988 reports context files *raise* inference cost by over 20%. Lulla, Mohsenimofidi, Galster, Zhang, Baltes & Treude, arXiv:2601.20404, January 2026 — 10 repositories, 124 pull requests — report `AGENTS.md` "associated with a lower median runtime (Δ 28.64%) and reduced output token consumption (Δ 16.58%)." Plausibly reconcilable (input tokens up, output flailing down) and nobody has done it. The second is a five-page paper using associational language.

**And there is one small measurement pointing the other way on the convention itself.** A five-runs-per-condition comparison on one repository with one agent and a twelve-line context file: on an ambiguous task, −27% wall time, −24% credits, −26% diff size; on a multi-file task, 9–10%; and two of five runs *without* the file wasted effort re-orienting or ran an unrequested build. The author states outright that it is "one data point, gathered on one repo with one agent." It measures efficiency rather than correctness, so it does not contradict the nulls above — but it is the only measurement in the sweep that favours the convention, and the most-adopted file in the field rests on roughly this much public evidence.

## 7. The descriptive literature dwarfs the effects literature

Corpus studies vastly outnumber outcome studies and none measure whether the files work. *Agent READMEs* (arXiv:2511.12884) — 2,303 context files from 1,925 repositories: testing 75.9%, implementation 70.8%, architecture 68.1%, security 14.8%, performance 14.5%. A study of 12,110 `.cursorrules` files from 11,427 repositories finds adoption "concentrated in small-scale, low-activity, single-maintainer repositories, suggesting toy projects rather than professional development."

Normative "smell" catalogues exist — lint leakage 62%, context bloat 42%, skill leakage 35%; stale references in 23.0% of repositories — and none ties a smell to a measured success delta.

One evaluation does measure the underlying capability, and it is deflating. RepoMirage (arXiv:2605.26177) applies semantics-preserving perturbations to repositories and reports agent performance dropping from 66.8% to 25.3% when the agent must explicitly identify structural information. *Paper-only, and the agent that carried it marked the figure unverified against the primary text.*

## 8. Agent Skills: a real structured-authoring spec with testimonial evidence

Anthropic's Agent Skills / `SKILL.md`, shipped 2025-10-16 and published as an open standard in December 2025, is the more interesting development because it *is* a structured-authoring specification: a named folder, YAML frontmatter, and explicit **progressive disclosure** — load the name and description first, the body on demand, bundled files last. Adopted by Codex CLI, Cursor, Copilot, VS Code, Gemini CLI, goose, Kiro and around 45 clients; documentation platforms now emit it as an output target.

Adoption claims are testimonial only — "a day → an hour," "saving hours." The controlled evidence is worse than the adoption:

- **WebDev-Skills-Bench** (arXiv:2608.23067): 31 public skills × 50 projects × 1,000 tasks × 4 models, with length-matched irrelevant controls. Target skill injection **reduces mean Pass@2 by 1.3–4.2%**, raises token cost **72–394%**, and helps in only 17–36% of skill-project pairs. Two failure modes: length-distracted, and content-misled.

- **Repo2Skill-Evo** (arXiv:2608.21964): 57 repositories, 105 release transitions. **Every** transition invalidated part of the skill set; six frontier agents reach only 29.9–69.7% macro F1 at maintaining them. Skills go stale in silence.

A security audit of 3,984 public skills found 534 with a critical issue.

## 9. llms.txt publishes to nobody

Two independent measurements agree. A server-log study across ~900 monitored domains from 2025-09-04 to 2026-04-13 logged 1,227 total requests, the top requester a commercial crawler at 64.7%, and **zero** from GPTBot, ClaudeBot, PerplexityBot or Google-Extended. SE Ranking, ~300,000 domains, November 2025: 10.13% adoption, evenly spread across traffic tiers, and **no correlation with AI citation — dropping the variable improved their model**. Google stated on 2026-06-15 that it has no effect on Search or AI Overviews; its search advocates have compared it to the keywords meta tag, with the structural argument that a self-reported manifest cannot differentiate because every site claims to be best.

**But the distinction is now empirically load-bearing**, because it works in a different channel than the one it was sold for. Mintlify's benchmark, 2026-07-17, ran 2,400 trials — 20 sites × 5 questions × 3 repeats × 2 models — across HTML, plain Markdown, Markdown with an llms.txt link, and Markdown with llms.txt inlined. **Plain Markdown was *worse* than HTML, because agents invented `.md` paths**; adding a link to llms.txt produced roughly **90% fewer dead URLs** and a large token cut, with accuracy flat in the mid-to-high 90s across all formats, replicated on three model families. The metric is 404s, not a flattering accuracy claim — but the methodology is vendor-run and the underlying data is unreleased.

**Two agents in this sweep graded that same study differently, and the disagreement is the honest state of it.** One graded it shipped-niche with a positive design note — pre-registered in style, open-sourced, and reporting an unflattering metric. Two others treated the "almost 90% fewer errors" figure as vendor marketing with undisclosed methodology, and noted that it measures navigation errors rather than task success. Both readings are of the same twenty-site benchmark. Treat the direction as credible and the magnitude as unverified, and do not cite the percentage without saying which errors it counts.

llms.txt is dead as a crawler channel and alive as an agent navigation map. A convention with no consumer is not a standard; contrast `AGENTS.md`, which has consumers and a null.

## 10. The documentation platforms rebuilt around serving agents

The axis of change across 2026 is serving documentation to agents rather than authoring it for humans. Mintlify shipped agent config files, a visibility component that **separates human from agent content**, content-signal robots directives, an "agent score," and a CLI signup so an agent can create an account without a browser. GitBook shipped adaptive content branching on visitor type — **serving agents a different page version**. Documentation MCP servers shipped broadly: Context7 at 61.2k stars is the widest-used third-party one; Mintlify Index aggregates 9,000 documentation sites. Docusaurus is the outlier, shipping none of it.

Traffic data is abundant and one-sided. Mintlify reports agents at **66% of measured traffic** in July 2026 — 213M agent requests against 105M human page loads, up from 15.2% in January; 83.7% of agent requests used explicit machine routes; direct Markdown requests went 25.1% to 54.4% between February and July. One platform's fleet, self-reported, with unaudited user-agent classification, and conceding that one major agent sends no identifiable user agent, so it is a floor. GitBook reports the same direction.

Reports: [`af750ce80e754223b`](../../../sweep-2026-08/raw/af750ce80e754223b.md), [`ab601f5a0087e7fc8`](../../../sweep-2026-08/raw/ab601f5a0087e7fc8.md), [`a1c816c1f7cbcfdf9`](../../../sweep-2026-08/raw/a1c816c1f7cbcfdf9.md), [`a5e1231b95c4c9ac5`](../../../sweep-2026-08/raw/a5e1231b95c4c9ac5.md), [`aa5f5baaa66cc8bf1`](../../../sweep-2026-08/raw/aa5f5baaa66cc8bf1.md).
