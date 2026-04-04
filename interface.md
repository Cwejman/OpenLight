# Interface Layer

The visual and interaction layer for the system. A scope-based window manager and first-class UI for working with the shell, the substrate, and any program that exposes structure.

## Why

The shell engine is TTY-able — it works in a terminal. But the interaction model it enables (scope navigation, type-resolved invocation, multidimensional knowledge) deserves a richer interface. A terminal flattens what is inherently spatial and structured.

Today's programs are monolithic at the UI level. Safari owns your tabs. IDEA owns its tool windows. AWS console owns its navigation. You're locked into each program's frame to navigate its content. The scope model dissolves this — if programs expose their structure as scope, a single window manager navigates everything uniformly.

## Scope-Based Window Manager

OS-agnostic. Manages all windows — substrate views, shell UI, files, programs, browser pages. The organizing principle is scope, not application.

**Windows are scopes.** Each open view is a deterministic scope — a set of chunks (or files, or URL-derived content) at an intersection. Open another scope, get another window. Narrow a scope, get a filtered view. You don't lose context by narrowing — you open another view alongside.

**Tiling.** Windows tile. Multiple scopes visible simultaneously. A session conversation beside its tool calls beside the knowledge scope the agent is reading. Or: source code beside the substrate chunks that reference it beside a browser view of the deployed service.

**Spatial navigation.** Open windows are positioned in scope space. As you traverse, you see what's structurally nearby — windows that share scope dimensions with your current position. The layout reflects structural proximity, not opening order or manual arrangement.

**Programs expose structure as scope.** URLs decompose into scope segments — `(safari aws ec2 instances)` narrows the same way substrate scopes do. Browser history as chunks enables completion from frequency, recency, relevance to current knowledge scope. IDE tool windows, file trees, console pages — anything with navigable structure can participate.

**History and completion.** Navigation history is chunks with placements. Scoping `(safari aws)` surfaces completion from what you've visited, what's related to your current knowledge scope, what's frequent. The substrate's FTS and placement structure power this.

## Shell UI

The shell's own interface is not a custom-built application. It is windows in the OS, managed by the window manager, integrated through scope — the same way any other program integrates.

The shell engine resolves typed inputs to UI modules:

- **Scope** — a multi-select navigator with completion, expansion, history
- **Session** — a scope (it's a chunk, selected the same way as any scope)
- **Adapter** — a scope (same mechanism)
- **Prompt** — a text input with undo, redo, history, multi-line

An invocable doesn't build UI. It declares typed inputs. The system resolves each type to its UI module. A different invocable needing different types gets different modules — automatically. The UI is derived from the type contract, not built per invocable.

This means the agent interaction experience isn't a purpose-built agent GUI. It's generic UI modules composed: a prompt bar (text input), a session view (ordered scope), a context viewer (scope), a response stream (scope). Each is a window. Each is managed by the WM. Each uses the same scope navigation every other window uses.

## Agent Sessions — Visual

A session scoped ordered by seq — the conversation. Filter to prompt + answer — just the dialog. Filter to tool-call — what the agent did. Filter to knowledge-update — what changed in the substrate. Each filter is a window, each window is a scope.

**Agent scope vs visual scope.** What you see is your visual layout — your windows, your lenses. What the agent receives as context is separate — assembled by the shell engine. You might be viewing tool calls while the agent's context includes the full session plus knowledge scope.

**Scope pinning.** You control what the agent can and can't modify in its context. Pinned scopes are fixed — culture, core knowledge. The agent reads them but can't remove them. Unpinned scopes the agent manages — dropping what's irrelevant, adding what it discovers. Changing a pinned scope requires approval, like a tool call.

## Beyond Lists — What's Forming

Initially, ordered lists of chunks take you far. But the structure is multidimensional, and visual traversal of that space is on the horizon — chunks as nodes, placements as connections, your current scope highlighted. Navigate visually through the graph of knowledge. This is a rendering of what the substrate already holds, not a separate feature.

## What's Open

- How programs concretely expose their innards as scope (protocol, adapters, levels of integration)
- The exact tiling/layout model
- How scope-based spatial positioning works in practice
- Whether this is built as a standalone window manager, an extension to existing ones, or a layer inside an existing environment
- How deep the visual graph navigation goes vs staying with list/tree views
- Interaction with existing window managers and desktop environments
