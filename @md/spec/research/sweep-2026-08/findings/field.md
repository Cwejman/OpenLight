# The state of the field

Timing ground: what the surrounding ecosystem did in 2025–26, for the pilot's bets about where to build and what to build on. Five movements matter.

## Files won — because agents read them

Plain markdown became a moat the moment coding agents became the dominant reader. Logseq moved *off* files (SQLite canonical) four years late and the community read it as a strategic error; Obsidian's answer — typed views *over* files (Bases), plus a CLI as the agent surface — is the market's settlement: **both, with files as substrate**. The venture-funded middle evacuated pure PKM for meetings and agents (Tana split itself in two; Mem became "an AI chief of staff"; Notion killed Mail for agent workflows; Coda was absorbed into an AI suite); what remains as pure tools-for-thought is bootstrapped and small, or dead. The new entrants state the new thesis outright: notes as an agent-writable substrate. And MCP/CLI became the universal 2026 feature across every surviving product — **the AI layer is being externalized, not built in**, which is night's harness-dissolution claim showing up as product behaviour without the argument.

## Local-first consolidated; branching is the durable win

Three of the best-known independents exited in twelve months (Electric→Databricks, Triplit→Supabase — not integrated, InstantDB→OpenAI — sunsetting). The substrate libraries exploded in downloads, pulled by AI tooling rather than collaborative apps. The technical convergence across the survivors: **branching, not merging, is what ships** (Automerge branches, Patchwork, Jazz's per-row git-like history, Yjs's versioning work) — while the engines that bought adoption did it by *giving up* exactly that. The CRDT thesis itself was walked back from inside (Jazz v2 dropped crypto-enforced permissions and CRDTs; Electric dropped client CRDTs in 2024). Operational cautions for night: don't build on a sync startup's proprietary cloud, and note the bus factors — the dominant CRDT library is a single maintainer funded by an open collective.

## Agent memory commoditised from above

The labs shipped versioned, path-addressed, session-attributed memory stores as platform features; file-plus-version is now the free floor ([`context.md`](context.md) carries the capability detail). The vendor field converged within weeks on the three gaps labs won't fill — cross-harness memory, fact-level temporality, provenance over changed data — which triangulates night's opening. The tooling tier between model and user is being squeezed hardest: visual agent-builders killed, undifferentiated middleware given ~18 months by its own market behaviour.

## The economics of structured-anything

Three structure-editor/codebase-as-database ventures converged on the same funding answer within a year: consulting funds the tool (Unison, feenk/Glamorous Toolkit), or insolvency (Dark — whose founder's post-mortem names the structured editor as what LLMs invalidated). Jonathan Edwards' retrospective names the research-side gap: not engineering but "a Theory of Change." Meanwhile low-code bifurcated: the proprietary visual runtime for prosumers is the casualty class (Airtable sold at 2.7× ARR off an $11B peak; Pega told the SEC that AI is delaying purchase decisions); governed enterprise automation is fine (Appian +19%); and the market relocated rather than shrank — two vibe-coding companies created roughly Airtable's entire ARR in 24 months, explicitly hunting the knowledge-worker market. The C-suite's stated problem with the winners is governance (93% concerned about vibe-coded tools in production; 8% have governance) — typed contracts and permission layers are what buyers now say they lack, which is the commercial echo of [`interface.md`](interface.md)'s Retool verdict.

## The research frontier is adjacent and friendly

Ink & Switch is the nearest living research neighbour (Patchwork as malleable-software runtime; version control, access control, and sync as active projects) and its ten-year lesson list reads as night's checklist: formalisation must be deferrable; don't take files away; schema change is the hardest problem and nobody will help; don't standardise contracts before users; branching over merging. Dynamicland remains the standing philosophical opposition ([`thesis.md`](thesis.md)). The venues are alive but small; the field's most prominent tools-for-thought researcher left note tools entirely.

## Not established

Funding/revenue for most private companies named (search budgets died early across the sweep; treat commercial-health claims as engineering evidence only); Ted Nelson's current status; whether any "context layer" startup differs structurally from transcript summarisation.

---

*Sources: [`a3f6ddd86cf882a6d`](../raw/a3f6ddd86cf882a6d.md) and [`add822cc12cefe954`](../raw/add822cc12cefe954.md) (tools-for-thought, the files verdict, Ink & Switch) · [`a498dd38f2322a083`](../raw/a498dd38f2322a083.md) (local-first and sync) · [`a187277ed3a006fbc`](../raw/a187277ed3a006fbc.md) (memory commoditisation) · [`a4bdd8ce92076fef2`](../raw/a4bdd8ce92076fef2.md) (structured-editor economics) · [`ace1709b4a562f194`](../raw/ace1709b4a562f194.md), [`a6a6eb69ff6791915`](../raw/a6a6eb69ff6791915.md), [`ae0322198c23f4ec2`](../raw/ae0322198c23f4ec2.md) (the low-code/vibe-coding ledger).*
