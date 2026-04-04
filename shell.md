# Shell Exploration

An OS shell where the substrate is the foundation. Scope replaces the working directory. Programs take typed interfaces. The file system and knowledge system are unified.

This is an active exploration. Concepts range from settled to speculative.

## What It Is

A shell with two filesystems: the substrate (presented via FUSE as a relational filesystem) and a normal filesystem for code and binaries. The shell unifies both — you navigate, scope, and invoke across both worlds transparently. A VM enforces containment.

## Why It Matters

Context is the portal to the raw power of LLMs. Existing agent tools are monolithic — you don't control what fills the context. The shell opens that by controlling scope, knowledge, and invocation declaratively.

Unix's revolution: small programs, one job each, compose through pipes and files. Today's agent tools are the new monoliths. Claude Code bundles session management, context assembly, tool execution, invocation — all in one system. You can't swap parts.

The shell breaks that apart. Session is a module. The LLM CLI is a module. Context assembly is scope. Culture is a module. Swap any piece — change one module. Compose at the shell level, not inside a program. Because the shell is an OS shell, Claude running inside it can invoke shell commands naturally. And the shell can orchestrate Claude. Open-ended in both directions.

The difference from traditional Unix: composition isn't just piping bytes — it's **scope-based composition**. Modules compose by being in scope together. Type contracts (via the substrate's spec system) let modules declare what they need. The shell resolves it.

### Context is Power — Concrete

Context assembly is fully declarative and composable:

```
culture (always in context)
+ session history (chunks with placements — scopeable, filterable)
+ knowledge scope (whatever you've scoped to in ())
+ prompt
= the full context sent to the model
```

You control all of it. Session history isn't a black box — it's chunks with placements. You can scope, filter, derive, exclude:

- Exclude tool calls from session context
- Derive a filtered scope from a session (strip sensitive info, extract only decisions)
- Merge two sessions into one context
- Take a 200-turn session and create a scope of just the architectural decisions
- Send different scopes of the same knowledge to different models

The underlying CLI (Claude, Codex, etc.) is invoked in `--bare` mode — it sees exactly what the shell assembles, nothing more. The CLI is a completion engine. The shell controls the context.

## Two Scope Channels — Emerging

Like PATH and PWD, but for scope. The shell prompt shows both:

```
[agents/core agents/claude] (my-org board people) :: tell . "who takes most decisions?"
 ^^^^^^^^^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 invocable scope              knowledge scope           invocation
```

**`[]` — Invocable scope (like PATH).** What's available to call. Modules with programs and capabilities. Their packages are installed, their invocables are findable. Changing `[]` adds/removes capabilities without polluting your knowledge context.

**`()` — Knowledge scope (like PWD).** Where you are, what you're looking at. Substrate scopes AND real filesystem paths. This is what `.` passes as context, what `sum` summarizes. Changing `()` moves your focus without changing what tools are available.

An invocable in `[]` reads its own database for internal knowledge (interface, config, how to invoke). The user's `()` is what gets passed as context. Invocables don't see each other's internal knowledge unless explicitly passed.

## Shell Interaction — Emerging

```
[invocable scope] (knowledge scope) :: command args
```

- The prompt shows both scopes
- `::` separates L1 (standard shell) from L2 (scoped invocation)
- `.` means "current knowledge scope content"
- Invocables receive scope specification and query the database themselves — they decide what to read and how much
- L1 and L2 can mix in pipes — invocables are just commands

### L1 / L2 — emerging concept

- **L1 — standard shell.** Everything without `::`. `ls`, `cat`, `git`, `vim` — normal operation. FUSE makes substrate chunks look like files.
- **L2 — scoped invocation.** After `::`. Scope-based resolution, type contracts, context assembly. Invocables are still just commands — they participate in pipes with L1.

The L1/L2 boundary depends on how type contracts work, which depends on the substrate's spec system. The concept (two layers of invocation) is clear; the exact mechanics are open.

## `sum` as Primary Navigation — Emerging

`sum` (summary) is more natural than `ls` for navigating scope. It summarizes ALL chunks in scope — the summary cannot lose insight. Shows both substrate chunks and real files:

```
[...] (plugin/src/hooks) :: sum

chunks: 12
related: (implementation, lifecycle)
outliers: (...)

A summary of ALL content in this scope

files:
- post-prompt.cljs
```

Knowledge scope unifies substrate scopes AND real filesystem paths. Scoping to a real directory like `plugin/src/hooks` shows both the files there and the substrate chunks that relate to it via integration. `sum` orients you — `ls` is the low-level fallback.

Cached summaries (keyed to scope + commit_id + model) support this — the substrate's commit model gives perfect cache invalidation.

## Two Filesystems, One Shell

### The substrate filesystem (FUSE-mounted)

The substrate's database presented as a filesystem via FUSE.

- **Not a tree — dimensional.** `cd values` scopes to a chunk named `values`. You see everything placed on it. `cd values/engineering` narrows further. Teleportation, not hierarchy.
- **Atomic.** Every mutation is a database transaction.
- **Versioned.** Every state is in the commit log.
- **Branchable.** Fork the database.
- **Lossless.** Nothing deleted, only retracted.

### The real filesystem

Normal Linux filesystem for source code, binaries, installed packages, media, the FUSE binary itself. Git-tracked normally. Tree-structured, POSIX.

### The bridge: integration chunks

A chunk in the substrate with body fields containing resolution parameters (path, repo, etc.) points to a real file. The substrate doesn't know what "git" means — it holds chunks with fields. The shell or an agent resolves the reference.

Git and the substrate don't conflict — they serve different things:
- Git tracks source code (real files, real filesystem)
- The substrate tracks knowledge structure (chunks, placements, versions, branches)
- Integration chunks in the substrate reference git-tracked files

### In the shell, they coexist

| Substrate (FUSE) | Real filesystem |
|---|---|
| Knowledge, culture, identity, sessions, agent state | Source code, binaries, media |
| Relational, dimensional | Hierarchical, tree |
| Substrate versioning (commits, branches) | Git versioning |
| Atomic (transactions) | Non-atomic (POSIX) |
| Scope-navigable | Path-navigable |
| Chunks with placements | Files in directories |

## Invocables and Type Contracts — Emerging

The substrate's spec system enables typed invocation. An invocable declares what it needs:

```sh
# agents/claude/invoke.cv
@type adapter
@needs instance-of:session
@package claude-code

context=$(scope . --format md)
claude -p "$@" --bare --system-prompt-file <(echo "$context") --output-format json
```

The shell parses `@` declarations and resolves them before running the body. `@needs instance-of:session` means: the current knowledge scope must contain a chunk that is an instance of the `session` archetype. The substrate's spec enforcement validates conformance.

### The agents example — emerging

`agents/core` defines archetypes:
- **session** — spec: `{ ordered: true, accepts: ["prompt", "answer", "tool-call", "knowledge-update"] }`. A sequence of agent interaction events.
- **adapter** — an archetype for invocables that map a general agent interface to a specific CLI.

`agents/claude` is a concrete adapter:
- Declares `@type adapter` and `@needs instance-of:session`
- Declares `@package claude-code` with config
- Assembles context from knowledge scope into a system prompt
- Invokes `claude -p --bare --system-prompt-file <context>` — bare mode means Claude CLI is just a completion engine, the shell controls all context
- Stores prompt and response as chunks placed on the session with seq ordering

`agents/codex` would be the same adapter type with different CLI mapping. The archetype is the abstraction; the CLI mapping is the implementation.

**What's NOT yet specified:** How session creation works as a shell command. How the adapter concretely receives and returns data. These operational mechanics need grounding through implementation.

### Contract resolution

The contract is split across three places:
- **The invocable** (source code / definition) declares what it needs: "I need an instance-of session in scope"
- **The substrate** holds what exists, what's placed where, and validates spec conformance
- **The shell** matches demand against supply at invocation time

### Invocable scripts — thought, not settled

Invocables could be shell scripts (`.cv` files) declaring their typed interface inline. The shell parses `@` declarations and resolves them before running the body. Each language may have its own SDK for querying the substrate, or invocables can work directly in the shell language. The `scope` command would be the primary interface for invocables to read their context.

## Peers and Spawn — Settled Concepts

A peer is any directory with a `.db` file — at any depth. The filesystem hierarchy is just organization on the host. A monorepo can contain multiple peers as subdirectories.

```
culture/
  culture.db
agents/                 # just a directory — a monorepo grouping
  core/
    core.db             # session archetype, adapter archetype
    src/
  claude/
    claude.db           # claude interface, peers: [core]
    packages.edn        # declares: needs claude-code + config
    src/
my-project/
  project.db
  code/
  peers.edn             # declares: I depend on culture, agents/core, agents/claude
```

Package declarations (`packages.edn`) and peer declarations (`peers.edn`) are files in the directory, not in the database.

### VM mounting

**The entry point is the containment boundary.** The directory you start from is read-write. Everything peered in from outside is read-only. Nesting can only reduce access.

```
shell my-project                     # project is rw, peers are ro
shell culture --mount my-project     # culture is rw, project is ro (ad-hoc)
shell parent-dir/                    # everything inside is rw
```

Two ways peers enter the VM:
1. **Declared** — in the directory's `peers.edn`. Always mounted.
2. **Ad-hoc** — specified at launch. Temporary, not persisted.

The spawner (on the host) resolves peer names to paths. Inside the VM, peers are flat mounted directories.

**Without a VM:** The `.db` is still usable via `ol` directly on the host. Data is never locked in.

### Packages — emerging

Each directory can declare packages it needs (`packages.edn`) with configuration. An invocable carries its own dependencies — adding `agents/claude` to your invocable scope makes claude-code available with its default config. You can override per-invocation.

## FUSE Layer — Emerging

Path segments are scopes. The path IS the query.

- `/cv/culture/values/` → chunks placed on `values`
- `/cv/culture/values/engineering/` → chunks placed on both (intersection)
- Path order doesn't matter: same chunks regardless of segment order
- Same chunk through different paths = same inode
- Chunks have optional names — these become filenames in FUSE. Unnamed chunks use their ID.

### Filesystem scope vs substrate scope

Both are scope but behave differently:
- **Filesystem scope** is hierarchical. `/code/my/package` is narrower than `/code`.
- **Substrate scope** is set intersection. `values ∩ engineering` — no inherent hierarchy (though the placement graph can encode hierarchy).
- The shell unifies both in `()`. `(code/my/package values)` — the intersection crosses both worlds.

### POSIX operations map to substrate operations

| FUSE operation | Substrate meaning |
|---|---|
| `readdir` on a chunk | List chunks placed on it |
| `read` on a chunk | Return chunk body content |
| `create` + `release` | Create chunk with placement inferred from path scope (atomic commit) |
| `unlink` at scoped path | Remove placement from that scope |
| `link` | Add placement in destination scope |
| `rename` | Move placement from source to destination scope |

## Declarative Model — Research Findings

### Trivially declarative (established fact)

Package lists, config files, users/groups/permissions, env vars, kernel params, locale/timezone, service enablement, firewall rules.

### Irreducibly imperative (established fact)

Database initialization, package dependency resolution, SSH host key generation, migrations. Solved by: declare + idempotent imperative steps.

### Other findings

- Package configuration is part of the declaration.
- Secrets mount from host at spawn. Host is trust boundary.
- Image-from-declaration viable: 0.5-1.5s warm starts with cached overlays.

## Research That Led Here

### Why atomic filesystems failed (established fact)

Every attempt failed: NTFS TxF (deprecated — broke existing apps), btrfs transactions (removed — DoS vector), academic systems (Valor, TxFS — never merged). The fundamental tension: POSIX visibility requires immediate visibility to all processes; transactions require isolation. These conflict. Industry converged on: layer transactional systems on top. SQLite succeeds by controlling all access to its data.

**The shell's answer: make the database the filesystem via FUSE.** The boundary dissolves.

### High-frequency agent collaboration — stress test confirmed

The "jazz band" scenario: 5 completion model agents on 200ms cycles, scoping each other's state, coordinating without a central controller. Findings:
- Filesystem handles concurrent agents trivially at this speed
- inotify delivers events in 7 microseconds
- With the substrate: agent state is chunks, lookback is temporal scope with seq ordering, conflict detection is a transaction
- Agents coordinate organically by reading each other's state, like musicians watching each other

### Piping across boundaries — stress test confirmed

FUSE makes substrate chunks readable by all Unix tools. Pipes are kernel buffers between processes — boundary-agnostic. `cat substrate-chunk | binary | ol apply` works. Each pipe segment is independent. Unix composition crosses the substrate/filesystem boundary without friction. Scope propagates through environment variables.

### Biology mapping — structural, not metaphorical

| Substrate | Biology |
|---|---|
| Chunk | Gene |
| Placement / membership | Epigenetic marks |
| Scope | Gene expression |
| Branching | Cell division |
| No central controller | Cells in a tissue |

Key insight: don't maintain global consistency. Local consistency, global coherence emerges. Each agent maintains its own scope.

## What Is Forming — Thoughts, Not Settled

- `[]` as PATH (invocable findability), `()` as PWD (knowledge context) — the Unix analogy
- `.` as "current knowledge scope content" — implicit context passing
- `sum` as primary navigation — summarizes ALL chunks in scope, not just listing
- `.cv` shell scripts as invocable entry points with typed declarations
- Scope as boundary (restricting what invocable sees) vs pointer (directing attention) — abstract, may matter
- Scope modifiers (`:fuzzy` for neighbouring scopes, `. - scope-name` for exclusion, session filtering)
- Whether invocables are greedy (take all scope) or require explicit `.`
- Per-invocation config override (invocable carries defaults, you override)
- CLI/TUI/UI merge — navigable/clickable output, live views. Traditional shell call-and-response may be too archaic for what this explores. The tension: richer interaction vs real shell where Unix tools work.
- Whether the shell can be used without a VM (just shell + FUSE on host, or just `ol`)
- Multiple scope targets showing merged views
- Services (daemons) — side-effect/purity implications
- Shell language — bridges to any language, or has a preferred one
- SDK for languages that want native substrate access vs shell command interop
- Scope-dependent package installation (scoping a sub-module installs only its packages)

## What Is Open — Genuinely Unknown

- How FUSE coexists with real files in the same peer directory (overlay vs subdirectory mount)
- How `cd` works — scope change, filesystem navigation, or both depending on target
- Exact scope query syntax (characters, modifiers, composition)
- How temporal depth (lookback) is presented to the user
- How external tool edits (vim on a FUSE file) propagate back to the database
- The naming of the shell and the overall project
- Whether scope-dependent package installation is on-demand or at VM start
- Export/import format for git-tracking substrate databases

## Culture

- **Discovery over invention** — the system already exists. We uncover it.
- **Ground before building** — hold unknowns open. Say "don't know yet."
- **Simplicity and naturalness** — if it feels forced, it's wrong.
- **Culture first** — identity and values ground everything.
- **Easy to use, beginner friendly, no lock-in** — open for all folk.
- **Context is power** — control over what fills the context window. Everything serves this.
