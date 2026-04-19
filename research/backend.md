# Backend Research — 2026

What model-call backend the `claude` (agent) invocable should actually use. The invocable runs in the VM and communicates with the host engine via stdin/stdout JSON-lines. The pilot's default assumption is the Anthropic API at per-token rates. The question: can we swap that for a cheaper path — subscription-backed CLIs, fixed-cost unlimited buckets, free tiers, or local models — without touching the invocable contract.

Research conducted April 2026. All dated claims are verified against official docs where possible; flagged where not.

---

## The shape the substrate wants

The invocable protocol is already "spawn a subprocess, talk JSON-lines over pipes." This maps cleanly onto:

- **Native CLIs with headless mode** — `claude -p`, `codex exec --json`, `gemini -p --output-format stream-json`. Drop-in fit.
- **OpenAI-compatible HTTP endpoints** — any provider (Groq, Cerebras, OpenRouter, Ollama) behind a ~40-line stdin→HTTP→stdout wrapper.
- **Proxies** — third-party bridges that wrap a subscription CLI as an OpenAI-compatible endpoint. Same wrapper.

Any of these is a valid invocable — the contract doesn't care. The question is cost, ToS, and reliability, not fit.

---

## Paid API (baseline)

Per-token billing against Anthropic or OpenAI API accounts. Works, predictable, expensive.

**Reference rates (April 2026):**
- Claude Opus 4.7: $5/$25 per Mtok in/out
- Claude Sonnet 4.5 (Azure Foundry): ~$3/$15 per Mtok
- GPT-5.3-Codex: ~$1.25/$10 per Mtok

A typical agent turn (50k in / 3k out on Sonnet) costs ~$0.19 through Azure Foundry or Anthropic direct.

---

## Subscription-backed CLIs

### Claude Code under Anthropic Max — essentially closed

Claude Code's headless mode is excellent: `-p` for one-shot, `--output-format stream-json`, tool use with `--allowedTools`, stdin piping. Maps 1:1 onto our invocable pattern.

**But:** on April 4 2026, Anthropic explicitly prohibited third-party harnesses from consuming subscription quota. The Agent SDK requires `ANTHROPIC_API_KEY`; OAuth/subscription tokens do not authenticate against it. External automation now bills at full pay-as-you-go rates even under a Max plan.

*Flag: exact policy date and wording from third-party summaries; direction (Anthropic tightening) well-attested, but verify before committing.*

**Verdict:** dead path for our invocable. Don't route through Claude Code subscription.

Sources: [headless docs](https://code.claude.com/docs/en/headless), [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing), [Agent SDK auth issue #559](https://github.com/anthropics/claude-agent-sdk-python/issues/559), [fusion94 writeup](https://fusion94.org/blog/2026-04-04-anthropic-kills-claude-subscriptions-for-third-party-tools/).

### OpenAI Codex CLI under ChatGPT Pro — first-party blessed

`codex exec --json --output-last-message <path>` is the sanctioned non-interactive mode. Stdin accepts prompts, stdout emits JSONL (`thread.started`, `turn.started`, `item.*`, `turn.completed`). Tool use, sandbox, approval policy all work headless. This is the cleanest match for our invocable architecture.

**Auth.** `codex` supports "Sign in with ChatGPT" via browser OAuth on Plus ($20) / Pro ($100 & $200) / Business / Edu / Enterprise. This consumes plan credits rather than API billing. OpenAI's own docs contrast the two modes and document scripted usage.

**Limits (measured in messages/turns, not tokens):**

| Plan | GPT-5.4 / 5h | GPT-5.3-Codex / 5h | GPT-5.4-mini / 5h |
|---|---|---|---|
| Plus ($20) | 20–100 | 30–150 | 60–350 |
| Pro ($100, 5x + 2x promo until May 31 2026) | 100–500 | 150–750 | 300–1,750 |
| Pro ($200, 20x) | 400–2,000 | 600–3,000 | 1,200–7,000 |

At cap: buy credits, drop to `-mini`, switch to API key, or wait.

**Effective cost.** A turn is 20k–200k tokens including tool I/O. At Pro $200 with ~600–3,000 GPT-5.3-Codex turns per 5h and 34 windows/week, that's ~20k–100k turns/month. ~$0.04–$0.20 per Mtok effective vs. ~$1.25/$10 API — **~10–100× cheaper for chunky agentic turns**.

**ToS.** First-party `codex exec` under ChatGPT auth is explicitly sanctioned. Third-party proxies that re-export this as an endpoint are the arbitrage lane Anthropic shut down — higher ban risk. Stay inside the tool.

Sources: [Codex README](https://github.com/openai/codex), [non-interactive docs](https://developers.openai.com/codex/noninteractive), [auth docs](https://developers.openai.com/codex/auth), [pricing & limits](https://developers.openai.com/codex/pricing), [April 9 2026 limit update](https://community.openai.com/t/understanding-the-new-codex-limit-system-after-the-april-9-update/1378768).

### GitHub Copilot via the official SDK

The Copilot SDK went public preview April 2 2026 (Python/TS/Go/.NET/Java). First-party, in-policy, speaks JSON-RPC to the `copilot` binary server mode. Models available across tiers: Claude Sonnet 4.5/4.6, Opus 4.6/4.7, Haiku 4.5, GPT-5.2/5.3-Codex/5.4/5.4-mini, GPT-4.1, GPT-4o, Gemini.

**Billing is per "premium request" (one turn), not per token.** Multiplier by model: Sonnet 1x, Opus 4.7 7.5x (promo), o3-class 3–10x. GPT-5 mini, GPT-4.1, GPT-4o are 0x — nominally "included."

**Plans:** Pro $10 (300 premium/mo), Pro+ $39 (1500), Business $19/user (~300), Enterprise $39/user (1000). Overage $0.04/premium-request.

**Cost differential.** A Sonnet turn via Pro+ is ~$0.026 vs. ~$0.19 through Azure Foundry — **~7× cheaper typical, 50× plausible for huge-context turns, 500× only on the "included" bucket edge cases.** The "50–500×" figure the user encountered is real but context-dependent, not a general claim.

Sources: [Copilot CLI GA](https://github.blog/changelog/2026-02-25-github-copilot-cli-is-now-generally-available/), [Copilot SDK public preview](https://github.blog/changelog/2026-04-02-copilot-sdk-in-public-preview/), [premium requests docs](https://docs.github.com/en/copilot/concepts/billing/copilot-requests), [plans page](https://github.com/features/copilot/plans), [supported models](https://docs.github.com/en/copilot/reference/ai-models/supported-models).

---

## The 0x multiplier bucket — looks unlimited, isn't

GitHub's docs describe GPT-5 mini / GPT-4.1 / GPT-4o as 0x — "included" with no published cap. On paper this is the arbitrage: hammer a coding-capable model for $10/mo flat.

In practice, **three gates pierce it:**

1. **Premium counter still gates 0x.** When paid premium quota is exhausted, selecting a 0x model returns *"you have exceeded your premium request allowance. We have automatically switched you to GPT-4.1"* — despite the 0x multiplier. Confirmed: community #170137, #163550, VS Code bug microsoft/vscode#257125.

2. **Undisclosed weekly global rate limits.** `user_weekly_rate_limited` errors lock out all models including 0x, triggered by upstream provider capacity rather than quota. Reported lockout durations: 5h 52m, 67h, **463h (~19 days)** — on accounts with 500+ premium requests still available. Discussions #192485, #192419, #192927. Documented in The Register's April 15 2026 coverage of GitHub's March rate-limit tightening.

3. **Abuse detection bans sustained scripted use.** GitHub's AUP prohibits "excessive automated bulk activity." Real warning emails, feature disablement, and outright bans reported for patterns as light as long agent to-do lists (discussion #186764). No published numeric threshold. Proxies (`ericc-ch/copilot-api`) make this *worse* — non-IDE user-agent and long sessions correlate with flagging.

**The SDK bills identically to the IDE.** No hidden cheaper lane. Copilot SDK changelog confirms each prompt counts against premium quota and global rate limits apply equally.

**Verdict:** 0x arbitrage is real on paper, unreliable in practice. Not a foundation for a programmatic agent loop.

Sources: [docs: requests](https://docs.github.com/en/copilot/concepts/billing/copilot-requests), [community #170137](https://github.com/orgs/community/discussions/170137), [community #192485](https://github.com/orgs/community/discussions/192485), [community #186764](https://github.com/orgs/community/discussions/186764), [The Register, 2026-04-15](https://www.theregister.com/2026/04/15/github_copilot_rate_limiting_bug/).

---

## The one real fixed-cost-unlimited bucket

**Cursor Pro $20 / Ultra $200 — Auto mode.** Auto is the only tier bucket in the market today that is genuinely not credit-metered. Cursor picks the model (Composer 1.5, GPT and Claude variants in rotation) and the pool is bounded only by soft per-minute burst limits, not message or token caps.

**Programmatic access.** ToS-gray but working. Several actively maintained proxies expose Cursor's gRPC/Connect protocol as a local OpenAI-compatible endpoint, reusing the IDE's OAuth token:

- [`Nomadcxx/opencode-cursor`](https://github.com/Nomadcxx/opencode-cursor)
- [`ephraimduncan/opencode-cursor`](https://github.com/ephraimduncan/opencode-cursor)
- [`anyrobert/cursor-api-proxy`](https://github.com/anyrobert/cursor-api-proxy) (tested against Cursor agent 2026.02.27)
- [`R44VC0RP/cursor-opencode-auth`](https://github.com/R44VC0RP/cursor-opencode-auth)

**Honorable mentions (fixed-cost, less useful for us):**

- **Windsurf Pro $15** — SWE-1.5/SWE-grep at 0 credits. Genuinely unmetered but no programmatic API.
- **JetBrains AI Ultimate** — unlimited only for *local* Ollama/LM Studio, not cloud.
- **Google AI Ultra** — generous Flash, Pro still daily-capped.

Sources: [Cursor rate limits](https://docs.cursor.com/account/rate-limits), [Cursor models & pricing](https://cursor.com/docs/models-and-pricing), [Cursor agent usage blog](https://cursor.com/blog/increased-agent-usage), [Windsurf plans](https://docs.windsurf.com/windsurf/accounts/usage).

---

## Free tiers — what's actually usable

### Gemini CLI under personal Google OAuth — the standout free path

Google's official `gemini` CLI authenticates against a personal Google account. Free-tier quota: **60 RPM, 1,000 RPD on Gemini 2.5 Flash.** Headless mode (`gemini -p --output-format stream-json`) is first-party blessed for scripts/CI and JSON-lines native — drops directly into our invocable pattern.

*Flag: Gemini 2.5 Pro free-tier access via CLI was effectively pulled April 2026; treat Pro as paid. Flash quotas current as of April 2026.*

Sources: [Gemini CLI quotas](https://github.com/google-gemini/gemini-cli/blob/main/docs/resources/quota-and-pricing.md), [headless mode](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/headless.md), [Code Assist quotas](https://developers.google.com/gemini-code-assist/resources/quotas).

### Inference-as-a-service free tiers (OpenAI-compatible HTTP)

| Provider | Free ceiling | Models |
|---|---|---|
| **Cerebras** | **1M tokens/day** | Llama 3.3 70B, Qwen3 32B/235B, GPT-OSS 120B |
| **Groq** | 14,400 RPD (Llama 3.1 8B Instant) / 1,000 RPD on larger | Llama 3.3 70B, Llama 4 Scout, DeepSeek R1 Distill 70B, Qwen QwQ, Mistral Saba |
| **SambaNova** | 10–30 RPM persistent | Llama 3.1 405B, Llama 3.3 70B, Qwen 2.5 72B |
| **Mistral "Experiment"** | 1 RPS, **1B tokens/month** | open-mistral, mixtral variants |
| **OpenRouter `:free`** | 20 RPM, 200 RPD (combined) | Qwen3 Coder 480B, DeepSeek R1, Llama 3.3 70B, GPT-OSS 120B, Devstral 2 |

All are OpenAI-compatible HTTP. Cerebras and Groq are the two with headroom for a real agent loop; OpenRouter is more variety than throughput.

*Flag: Cerebras scheduled Llama 3.3 70B and Qwen3 32B deprecation for Feb 16 2026 — verify catalog before depending.*

Sources: [Cerebras models](https://inference-docs.cerebras.ai/models/overview), [Groq rate limits](https://console.groq.com/docs/rate-limits), [SambaNova limits](https://docs.sambanova.ai/cloud/docs/get-started/rate-limits), [Mistral tiers](https://docs.mistral.ai/deployment/ai-studio/tier), [OpenRouter free models](https://openrouter.ai/collections/free-models).

### GitHub Copilot Free — not usable

50 premium requests/month + 2,000 completions/month. Copilot SDK public preview now reaches Free accounts, but 50 turns/month burns in one agent session. Not a foundation.

---

## Local models (zero marginal)

Ollama exposes OpenAI-compatible `/v1/chat/completions` + native `/api/chat` with tool calling. On an M3/M4 Max 64–128GB, the plausibly-good-enough options in April 2026:

- **Qwen3-Coder-Next** (80B MoE, ~3B active, 256k ctx) — Sonnet-4.5-level coding on 64GB. Best tool-use-ready local option.
- **GLM-4.7** (355B / 32B active) — needs 128GB+.
- **Kimi K2.5** (1T / 32B active) — runs on 128GB M4 Max at ~1.7 tok/s; too slow for interactive loops.
- **DeepSeek-V3.1-Nex-N1** — strong tool use, tight on 64GB.

Zero quota anxiety, offline, no ToS surface. A fallback that's always available.

---

## Proxies and routers

If the invocable speaks OpenAI chat-completions and the backend is swappable, two layers matter:

**CLIProxyAPI** ([`router-for-me/CLIProxyAPI`](https://github.com/router-for-me/CLIProxyAPI)) — wraps Gemini CLI, Antigravity, ChatGPT Codex, and Claude Code behind one OpenAI/Gemini/Claude/Codex-compatible endpoint, reusing each tool's OAuth. Most comprehensive. 26.8k stars, actively maintained (v6.9.28 on 2026-04-17). This is the one to watch.

**LiteLLM** ([`BerriAI/litellm`](https://github.com/BerriAI/litellm)) — the router in front of everything. 43.7k stars, normalizes tool-call schemas, streams reasoning blocks correctly, supports fallback chains. Security advisory March 2026 — pin versions.

**What breaks across all proxies:**
- Auth refresh on OAuth-based wraps (most common failure mode)
- Rate limit bleed-through — upstream quota exhaustion surfaces as odd errors
- Reasoning/thinking blocks round-trip poorly
- Parallel tool calls and Anthropic↔OpenAI tool schema translation are the usual fidelity gaps

**Stale/dead:** reverse-engineered ChatGPT-UI proxies (`acheong08/ChatGPT`, `PawanOsman/ChatGPT`) die to Cloudflare/Turnstile updates. Don't build on them.

---

## Recommended pilot shape

Keep the invocable contract model-agnostic (accepts session/context/prompt, emits tool-calls), and treat the backend as a ranked fallback chain:

1. **Default free — Gemini CLI under personal OAuth.** 1,000 RPD Flash, first-party blessed, native stdin/stdout JSON. Zero cost, zero ToS risk. Start here.
2. **Free bulk — Cerebras** via thin HTTP wrapper. 1M tok/day when the pilot wants volume.
3. **First-party paid — Codex CLI under ChatGPT Pro.** When you want OpenAI-grade reasoning. `codex exec --json` matches the invocable pattern exactly. Within ToS.
4. **Fixed-cost "unlimited" lane — Cursor Pro $20 via `opencode-cursor` proxy.** ToS-gray, accept the risk. The one real hammer-it-flat-fee bucket.
5. **Always-on fallback — Local Ollama + Qwen3-Coder-Next.** Offline, no quota.
6. **Escape hatch — Raw Anthropic / OpenAI API.** When nothing else works and correctness matters.

All six fit the same invocable contract. The backend becomes a config choice, not an architectural coupling.

---

## Uncertainty register

- Anthropic's April 4 2026 third-party-harness ban: direction attested across multiple sources, exact date and wording from third-party summaries.
- Copilot Business premium-request allowance: dropped from public plans page; current number is contact-sales.
- Copilot SDK per-turn metering: documented as identical to IDE, not independently verified for SDK-specific discounts.
- Codex Pro $100 "2x bonus until May 31 2026": promo, verify before committing.
- Exact 2026 model naming (GPT-5.4, 5.3-Codex, -Spark, Opus 4.7) accurate at time of writing; churns quarterly.
- Cerebras model deprecation schedule (Feb 16 2026 on Llama 3.3 70B and Qwen3 32B): verify catalog.
- Cost ratios (10–100× Codex vs. API, 7–50× Copilot vs. Azure) are order-of-magnitude, not quotes.
