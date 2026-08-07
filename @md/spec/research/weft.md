# Weft

Deep read of [WeaveMindAI/weft](https://github.com/WeaveMindAI/weft), open-sourced April 2026 by Quentin Feuillade–Montixi. Two-month build, 845 stars at time of reading. A contemporary peer effort making a different bet on the same problem this project is working on — worth extracting from rather than dismissing or absorbing.

Research conducted April 2026 against the repo README, `DESIGN.md`, `ROADMAP.md`, `CONTRIBUTING.md`, and the author's blog post [The Future of Programming (and Why I'm Building a New Language)](https://weavemind.ai/blog/future-of-programming).

---

## What Weft is

A programming language where LLMs, humans, APIs, and infrastructure are base ingredients. Programs are graphs of typed nodes (LLM, Code, HTTP, Human Query, Gate, Template, Discord, Slack, Postgres, Memory, Web Search, Cron, etc.). The compiler checks the architecture before run. A visual dashboard renders the program as a graph; the text and the graph are two views of the same program, editable from either side.

Stack: Rust compiler and runtime, PostgreSQL for state, Restate for durable execution, SvelteKit dashboard, browser extension for human-in-the-loop. OpenRouter as the default LLM backend. Node catalog is hand-authored; the long-term aspiration is "projects define their own nodes fluently in the language itself."

## The core claim

From the blog post: current software already depends on intelligence in its core — LLMs processing unstructured data, humans reviewing output, API calls — but the languages building it treat everything as "just code and HTTPS calls." The result is brittleness by accumulation: "hundreds of thousands of lines of code, the real logic is buried somewhere in a few thousand lines." Each hallucination fix is another layer of plumbing; eventually "no human understands it, and no AI has enough context to see the whole picture."

Weft's response: coordinate the intelligence-bearing parts natively. Put the compiler above the plumbing. The language is "one level of abstraction above traditional languages."

## Stated principles (DESIGN.md)

1. **Coordination, not replacement** — *"Weft coordinates things, it does not replace them."*
2. **If it compiles, the architecture is sound** — connections, completeness, and node-level self-validation checked before runtime.
3. **No special cases** — *"When a node needs a new capability, the language gets a general feature and the node implements it."*
4. **Recursive composability** — groups nest arbitrarily deep with scoped interfaces and no hidden coupling.
5. **Null propagation** — *"Every required input refuses to run on null. When upstream produces nothing, downstream skips."*
6. **Graph-native** — *"The code describes a graph, so there is a native way to view it, interact with it, and analyze it."*
7. **Durable by default** — programs run on Restate with persisted outputs and crash-resumable suspension points.
8. **Infrastructure as nodes, sidecars as the bridge** — stateful services become graph nodes; sidecars abstract them over HTTP.
9. **Opinionated by design** — *"Neutral tools produce neutral code."*
10. **Dense for AI generation** — constrained grammar optimized for AI builders writing correct systems.
11. **Top-down building** — architecture-first, with native mocking and progressive validation.

## Node shape

A node is a folder under `catalog/<category>/<name>/` with two files:

- `backend.rs` — implements the `Node` trait. Declares ports with `PortDef::new("name", "String", false)` (name, type, required). Exposes `node_type()`, `metadata()`, `execute()`.
- `frontend.ts` — TypeScript template mirroring the backend's ports plus visual metadata (icon, color, category, tags).

A `catalog-link.sh` script symlinks these into both the Rust crate and the dashboard. The catalog is the source of truth; symlinks propagate it. Contributors must keep backend and frontend port names and types in strict sync. The `inventory` crate auto-discovers nodes at startup.

## Humans-in-the-loop philosophy

From the blog: *"I don't think the medium term future is about removing humans from the loop. It's about putting them in the right spots: taste, field experience, judgment calls."* The ideal delegates *"engineering, the plumbing, the testing"* to AI while preserving *"decisions that need domain expertise and review steps that need human judgment"* for humans.

Architecturally this shows up as: a `Human Query` node, a browser extension, Restate-backed durable suspension. A program pauses mid-execution, sends a form, resumes on response — whether that takes three seconds or three days is immaterial to the code.

## Roadmap (author-labeled "not prioritized, not promised")

Near-term: user-defined struct types, function calls / callbacks to enable node sub-execution and LLM tool routing, loops as a simpler primitive, multiple output nodes per project, subgraph execution targeting one output.

Medium-term: centralize parsing in Rust (currently duplicated in the TS frontend), incremental parsing, in-process node execution (removing ~10ms HTTP round-trip per node), compile-to-Rust-binary.

Long-term: multi-file imports, error handling, per-execution container isolation, binary execution modes (run-once, service, infrastructure management), distributed compiled subprograms.

Acknowledged technical debt: built fast solo; a stabilization pass is contingent on financial sustainability.

---

## Mapping to this project

Weft's principles sit close to several values and visions in `inside.md`. The closeness is the kind that reads as shape-recognition across two efforts rather than influence in either direction.

| Weft principle | Near-value in this project |
|---|---|
| If it compiles, the architecture is sound | Self-describing field: structure specified in the field and enforced by the field |
| No special cases (general features, not per-node) | Folk-level: primitives simple and uniform enough that the ceiling is not capped |
| Recursive composability (nested groups with scoped interfaces) | Scope composition — though Weft's is tree-shaped where this project's scope is multidimensional intersection |
| Graph-native (native view from the code structure) | Interfaces grown from the field's self-knowledge, not designed separately |
| Durable by default (Restate) | Commit graph as substrate foundation — same guarantee, different foundation |
| First-class humans | Peer vision — humans and models as peers, not tool-users and tools |
| Opinionated by design ("neutral tools produce neutral code") | `inside.md` reaches toward this but does not say it this plainly |

## The axis of divergence

Language versus field. Outside-in versus inside-out.

Weft is a language. You design a program, the compiler checks it, it runs. The node catalog is hand-authored and two-file per node; the graph is a view of the program; the program is the artifact.

This project treats the field as fundamental. Chunks accumulate, scopes compose, behavior emerges. The `invocable` archetype is the contract; any chunk conforming to it is an invocable — no separate catalog, because the field is the catalog. The interface is not a second representation of the program; it is a projection of the field through its specs.

Weft's long-term aspiration — *"let projects define their own nodes fluently in the language itself"* — is the starting point assumed here. Neither has proven the aspiration. Weft has shipped the language; node-in-language authoring is future work. This project has assumed node-in-field from the beginning and has not shipped the full loop. Two honest positions.

## Concrete ideas worth extracting

Ideas from Weft that could sharpen this project's thinking, not claims they should be adopted:

- **Null propagation as a semantic.** Weft: *"every required input refuses to run on null."* The substrate here enforces presence structurally via `required`, but a clean distinction between "present-and-null" and "absent" would sharpen how partial dispatches fail and recover. Currently unnamed.
- **Compile-time architecture analysis beyond read/write boundaries.** Weft detects patterns like *"user input flows into an AI without a filter."* The spec system here could express flow constraints as structural invariants that fire before dispatch, not only the reachability boundaries currently modelled.
- **Human-as-invocable with durable suspension.** Weft's form-send-wait-days-resume pattern maps directly onto a `human` invocable whose dispatch sits pending until a person responds. The commit log already holds the suspension state; the invocable framing is the expressive step.
- **Foldability as interface, not just as nesting.** A Weft group exposes declared ports — what the outside sees of a nested subgraph. Scopes here have specs for what they accept; they do not currently have a notion of what they *expose*. Whether a scope should have an interface in Weft's sense is open.
- **Graph-native as a test of self-knowledge.** Weft's claim that the graph view falls out of the code is the same claim this project makes about the UI falling out of the field. Reading Weft's code → graph projection closely would be useful the day UI projection is implemented here.
- **Opinionated framing.** *"Neutral tools produce neutral code."* The substrate here is not meant to be neutral either, but `inside.md` does not say so as directly. Worth considering whether to.

## Convergence and divergence at depth

Whether language-shaped and field-shaped approaches converge, diverge, or turn out to be facets of a deeper shape is open. A mature enough Weft-like language could be a dialect for composing invocables on this substrate. A mature enough field could eventually project a Weft-like view alongside others. The value of the reading is not a judgment; it is that the recognition of the same problem from two sides is itself evidence about what the problem's real shape is.

---

## Sources

- [WeaveMindAI/weft](https://github.com/WeaveMindAI/weft) — repo
- [DESIGN.md](https://github.com/WeaveMindAI/weft/blob/main/DESIGN.md) — principles, densest version
- [ROADMAP.md](https://github.com/WeaveMindAI/weft/blob/main/ROADMAP.md) — directions explicitly marked "not prioritized, not promised"
- [CONTRIBUTING.md](https://github.com/WeaveMindAI/weft/blob/main/CONTRIBUTING.md) — node pair structure
- [The Future of Programming (and Why I'm Building a New Language)](https://weavemind.ai/blog/future-of-programming) — author's full prose on the bet
