# TUI Specification

Interactive terminal interface for navigating an OpenLight knowledge base.

## MVP Requirements (Settled)

### What it is

A read-only terminal UI for scope navigation. The CLI answers one question per invocation (`ol scope culture`); the TUI keeps a session open — you move through the dimensional space interactively.

- Not a dashboard, not a replacement for the CLI, not a web browser
- Agents use the CLI (JSON). Humans use the TUI.
- Read-only. No writes, no branches, no history browsing in MVP.

### Layout

Two toggleable panels: **dimensions** (default on) and **chunks** (default off).

- **Top bar:** Scope dimensions + aggregate counts (total, instance ●, relates ○)
- **Scope summary:** AI-generated summary of where you are (see AI Summaries below).
- **Dimensions panel** (default on): Connected dimensions as a vertical list, sorted by connection strength (most shared chunks first — `ol scope` returns pre-sorted). Each entry shows:
  - Colored dimension name + counts (colors assigned positionally in MVP)
  - AI-generated summary (gray, indented)
  - Sub-connections (other connected dimensions with counts)
  - Outlier/edge dimensions (reachable through a connected dimension) shown as gray items in the same list — visually dimmer, same structure.
- **Chunk panel** (default off, toggle via `s c`): Shows chunks for the current view.
  - Initially shows all in-scope chunks. When focus moves to a dimension in the list, updates to show chunks at scope ∩ that dimension.
  - Chunk text content displayed directly.
  - Key/value pairs rendered as a clean table without lines — key in white, value in gray. No raw JSON.
  - Each chunk shows its text, kv pairs, and membership on other dimensions.
  - Can be shown with or without the dimensions panel.
- **Bottom bar:** Keybind hints in `(letter)word` format. Context-sensitive — changes during drop mode and pull mode.

### Keybindings

Discoverable `(letter)word` scheme. First-time legibility. Later: setting for vim/custom binds. Bottom bar is context-sensitive — shows relevant keybinds for the current navigation level.

| Key | Action |
|-----|--------|
| `h`/`j`/`k`/`l` | Navigate: `j`/`k` up/down, `l` go into element, `h` go back out. Inside an element, `h`/`l` switches between instance and relates. |
| `tab` | Switch focus between dims panel and chunks panel |
| `t` | **toggle** — toggle visibility of the inactive panel (dims or chunks) |
| `a` | **add** — add focused item to scope (works on dim entries, sub-dims, outliers, or chunk membership dims) |
| `d` | **drop** — enters drop mode: bottom bar shows each scope dimension with a number, `0` = last added (easy pop). Press digit to drop that dimension. Any non-digit key cancels. |
| `p` | **pull** — enters pull mode: bottom bar becomes text input. Type any dimension name, enter adds to scope. ESC cancels. No validation — nonexistent dimensions produce empty scope (that's information, not an error). Completion deferred post-MVP. |
| `u` | **undo** — go back in navigation history stack |
| `r` | **redo** — go forward in navigation history stack |
| `q` | **quit** |
| `?` | **help** |

### Navigation Model

Three levels of depth:

**Entry level** — `j`/`k` navigates between dim entries (or chunks in the chunk panel). `tab` switches panel focus (only when both panels visible, no-op otherwise). `h` is a no-op at entry level. This is the default level.

**Inside a dim entry** — press `l` to enter. The element's instance/relates and sub-connections become navigable:
- `h`/`l` switches between instance (left) and relates (right)
- `j`/`k` moves down to sub-dims and outliers
- `a` on a sub-dim or outlier adds it to scope
- `h` at instance (leftmost) goes back to entry level

**Inside a chunk** — press `l` to enter. The chunk's membership dims become navigable:
- `h`/`l` switches between instance and relates
- `j`/`k` moves between membership dims
- `a` on a membership dim adds it to scope
- `h` at instance (leftmost) goes back to chunk list

**Bottom bar is context-sensitive.** Shows only keybinds relevant to the current level and state. No `tab` when only one panel visible. Different keybinds when inside an element vs at entry level.

**Chunk panel updates on cursor movement.** Moving the cursor over a dim entry (`j`/`k`) automatically updates the chunk panel to show chunks at scope ∩ that dimension. No need to press `l`. When focus moves to the chunk panel via `tab`, the chunk filter stays on the last highlighted dim.

**Scope rules:**
- Scope is a set of dimensions. Add narrows, drop widens.
- Only scope mutations (add/drop/pull) push to the history stack. Cursor movements do not.
- Empty scope `{}` shows all dimensions with connections (calls `ol scope` with no args). No edges at empty scope — nothing is "beyond" when everything is visible.

### AI Summaries

All summaries are the same operation: summarize the chunks at a given scope. The scope summary at the top uses the current scope. A per-dimension summary uses scope + that dimension. Same generation, same caching, same pipeline — just different scopes.

**Generation:** Spawn parallel `claude -p` processes. Each gets:
- Culture as system prompt via `--system-prompt-file` (replaces Claude Code's default prompt — no tool use needed, just summarization)
- Chunks at that scope as prompt content (via `ol scope <dims> --chunks --limit N`)
- `--model sonnet` (or configurable), `--max-turns 1`, `--output-format text`

**No hardcoded prompt wording.** The TUI's job is: pass chunks + culture, get text back. Culture shapes the summaries. Later the browser may have its own peered knowledge system with a browser-specific bootstrap dimension for contextualizing descriptions.

**Culture from the system itself:** The TUI runs `ol scope bootstrap --chunks` and passes whatever comes back as the system prompt. If the system has a `bootstrap` dimension, summaries are cultured. If not, summaries run uncultured — still functional. As culture is added, summaries improve without changing the TUI code. Same entry point the Claude plugin would use later.

**Caching:** Summaries cached in `.openlight/tui-cache` (JSON). Cache key: scope (sorted dimensions) + branch HEAD commit. All summaries use this same key structure. On-demand flow:
1. Navigate to a scope
2. Check cache for each summary needed at this view
3. Display cached entries immediately, show loading indicator for misses
4. Spawn `claude -p` processes in parallel for misses
5. Fill in as they complete, write to cache

### System Discovery

On startup, the TUI walks upward from the current working directory until it finds `.openlight/`. The TUI then:
- Calls `ol` with `--db` pointing to that `.openlight/system.db`
- Reads/writes cache at `.openlight/tui-cache`
- Cache is 1:1 with the system — tied to the `.openlight/` directory, not the invocation directory

Works from nested directories — `cd projects/alpha && olb` finds `../../.openlight/`.

### Data Source

The TUI is a separate binary that calls `ol` commands and consumes JSON output. No shared library, no direct DB access. This decouples language choice and provides feedback on the CLI's output design.

### Empty States

- **Empty scope `{}`:** Functions the same as any scope. Same JSON structure from `ol scope`.
- **Nonexistent or empty dimension:** Empty space. No error. Use undo or drop to go back.
- **No panels visible** (both toggled off via `t`): Centered gray text: "N dimensions, N chunks here. Press `t` to toggle a panel."
- **Chunks panel only** (dims toggled off): Full-width chunk list. Scope summary + chunks.
- **Loading summaries:** Loading indicator per entry. Cached entries display immediately, generated entries fill in as they complete.

### Implementation

- **Language:** Go with bubbletea
- **Repo location:** `browser/` directory (separate Go module)
- **Binary name:** `olb`
- **Install:** `make install` from `browser/` → `/usr/local/bin/olb`

### CLI prerequisites

Before TUI implementation, `ol scope` needs two changes:
1. **Sort dimensions by connection strength** (`shared` count, descending) — this should be the default.
2. **Include branch HEAD commit ID** in scope JSON output — needed for cache keys.

### Open (post-MVP)

- Pull completion (fuzzy search with tab/shift-tab cycling, zsh-style)
- Per-dimension last-affected commit for finer cache invalidation
- Write operations
- Branch/history browsing
- Stable color assignment strategy (per-dimension across views)
- Browser-specific peered knowledge system for description context

---

## Prior Exploration

Earlier design thinking. The MVP section above supersedes all conflicting points — keybindings, layout, language, and scope of operations are settled.

### Early session concepts

The core interaction metaphor: you're "standing on" a set of dimensions. The TUI shows what's connected, what's nearby, what you'd see if you stepped in a direction. Navigation is free.

### Operations deferred

- Commit history, diffing — post-MVP
- Write operations — may remain CLI/agent territory
- Graph explorer visualization — decided against in favor of list-based navigation

### Early layout concept

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

Superseded. Keybindings from before the `(letter)word` scheme.
