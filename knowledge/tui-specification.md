# TUI Specification — Unsettled

Interactive terminal interface for navigating and manipulating an OpenLight knowledge base. Subcommand of `ol` or sibling binary — not yet decided.

## What this is

A terminal UI for exploring the dimensional space interactively. Where the CLI answers one question per invocation (`ol scope culture`), the TUI keeps a session open — you navigate between dimensions, inspect chunks, see connections unfold as you move through the graph.

## What it is not

- Not a dashboard. Not a static display of stats.
- Not a replacement for the CLI. Agents use the CLI (JSON). Humans may prefer the TUI.
- Not a web browser. No HTML, no HTTP. Pure terminal.

## Open questions

### What does a session look like?

The core interaction: you're "standing on" a set of dimensions (your scope). The TUI shows you what's connected, what's nearby, what you'd see if you stepped in a direction. You move by adding/removing dimensions from your scope. The display updates.

Is this a single-pane view? Split panes (dimensions left, chunks right)? Tabs? The answer depends on what information needs to be visible simultaneously.

### What operations?

**Read operations (clear):**
- Navigate scope: add/remove dimensions interactively
- View connected dimensions with counts
- View edges (second-order connections)
- Inspect individual chunks (text, kv, memberships)
- Browse commit history
- Diff between commits

**Write operations (unclear):**
- Apply mutations through the TUI? Or is that CLI/agent territory?
- Create/switch/delete branches?
- If writes are supported, what does the UX look like? Inline editing? A form? A JSON editor?

### What should be visible at once?

The scope response contains: scope dimensions, chunk summary, connected dimensions with connections and edges, and optionally chunk items. That's a lot of information. What's the hierarchy?

Possible layout:
```
┌─ scope: culture ──────────────────────────────────┐
│ 12 chunks (7 in scope: 5 instance, 2 relates)     │
│                                                    │
│ dimensions:                                        │
│   projects      5 shared  -> people (3), edu (1)   │
│   people        4 shared  -> projects (3)          │
│   education     2 shared                           │
│                                                    │
│ [enter] scope into   [/] search   [b] branches     │
└────────────────────────────────────────────────────┘
```

Or is it more like a graph explorer where you see nodes and edges?

### Is Zig the right language?

**For:** Single binary. No runtime dependency. Direct access to the domain layer (db.zig, commands/) — no IPC, no serialization. Same build system.

**Against:** Zig's TUI ecosystem is immature. Manual memory management is tedious for UI code where objects have complex lifetimes (widgets, layouts, event handlers). Languages with garbage collection or ownership systems (Go/bubbletea, Rust/ratatui) have more mature TUI frameworks.

**Factors to evaluate:**
- Complexity of the UI. A simple list-and-detail view is fine in Zig. A rich interactive layout with scrolling, search, modals — the framework matters more.
- Whether the TUI needs to be part of the same binary (Zig required) or can be a separate binary that calls the CLI (any language).
- If separate binary: the overhead of shelling out to `ol` for every operation vs. the ergonomics of a higher-level language for UI code.

### Naming

Options:
- `ol browse` — subcommand of the existing binary
- `ol tui` — explicit about what it is
- `olt` — sibling binary, short
- `olb` — sibling binary, "browse"

The CLI abbreviation pattern (`ol` = OpenLight) suggests siblings would be `ol-*` or single short names. Not settled.

## What needs to happen before implementation

1. Define the core interaction model — what does navigation feel like?
2. Decide on layout — what information is visible simultaneously?
3. Evaluate language/framework options against the interaction model
4. Prototype the simplest useful view (scope navigation) to test assumptions
5. Decide subcommand vs sibling binary based on build/dependency implications
