# Views and External World Integration

How the knowledge system connects with things outside itself — code, files, designs, multimedia, websites. And how "views" serve as the bridge.

## The Knowledge System as Source of Truth

Code is not the source of truth. The knowledge system is. Requirements come first; code is material molded against the knowledge. This applies broadly:

- Source code for the browser → built against requirements that live in the knowledge system
- A website for an organization → built from understanding of the organization, which lives in the knowledge system
- A CLI tool → its behavior defined by knowledge, implemented in code

The filesystem is the world's interface. Code, images, configs — these are external artifacts. The system's truth is in its chunks and dimensions.

## External Content as Chunks

The system will need to handle content from the outer world:

- **Meeting transcriptions** — a 30-minute meeting transcript, translated into chunks with dimensional weights
- **Source code** — structural, changes over time, has its own inherent structure (files, functions, modules)
- **Designs** — PNGs, SVGs, Figma files. Multimedia embedding (not just text)
- **Documents, data, anything**

Some external content is isolated (an image). But some is inherently structural (a filesystem, a codebase). The structural external content can change just like the knowledge system can change. How to handle this relationship is an open question.

The type of chunk or representation for external content is not decided. It may need something beyond text chunks — references, embeddings of non-text media, structural metadata.

## Views

A **view** is a specific perspective through the multi-dimensional system — a scope plus settings that produces a result. Think of it as a saved query that resolves to specific content.

### Views Are Projections

Every interface is a view. The browser at scope `{culture}` is a view. A website page is a view. An agent's bootstrap context is a view. A CLI query result is a view.

Views can be:
- **Ephemeral** — a browser session, a one-time query. Not saved.
- **Saved** — a named view with specific scope + settings. Reusable.
- **Approved** — a human has reviewed the output and confirmed it's correct. This creates a dependency.

### Views as Dependency Tracking

When the system connects to the external world, views become critical.

**The website example:** An organization's knowledge lives in the system. A website is projected from it. A specific page has phrasing that a human tweaked and approved. That approval is now a frozen dependency — an external asset (React code, static HTML, whatever) that depends on a specific view of the knowledge.

If the knowledge changes in a way that would alter what that view produces, the system needs to flag it. "This view's output has changed since it was last approved." Otherwise the system evolves but its external projections silently drift.

### Views with Reverse Testing

An approved view comes with an implicit assertion: "this view should produce this result." That's reverse testing — the view tests the system. If the system evolves and the view's output changes, something needs attention.

This gives the human a way to maintain safety in an evolving system. Not by preventing change, but by detecting when change affects committed external dependencies.

### The Website as Browser

The ideal: a website IS a browser. Not a traditional site with static pages, but a view into the knowledge system with specific scope and display settings per "page."

- A "projects page" is scope `{projects}` with specific grouping/sorting
- An "about page" is scope `{organization, identity}` with a specific display template
- The scope + display settings = the view definition

Earlier iterations would probably generate a static website from the knowledge base. Later iterations could be a live browser wrapper — a thin shell around the core browser with view parameters baked in.

## The Build Sequence (Software)

Three pieces of software, naturally git-based:

1. **CLI** — the primary interface for interacting with the knowledge system. Preferred over MCP. Claude uses this. Read, write, query, manage chunks and dimensions.
2. **Browser** — TUI first, then web. Navigating the dimensional space. May start with static terminal views showing how it looks before building interactive software.
3. **Claude plugin** — later priority. Initially use Claude's existing session capability with deliberate interactions through the CLI. The plugin (systemic routine cycles) comes when the model is proven.

## Open Questions

- How does structural external content (a codebase, a filesystem) map into the dimensional model? Is it mirrored? Referenced? Both?
- What does "approved view" look like mechanically? A snapshot of the view's output? A hash? A test assertion?
- How does multimedia embedding work in the dimensional model? Same chunks with different content types? Separate chunk types?
- How do views compose? Can a view reference other views?
- The website-as-browser vs generated-website spectrum — where to start?
- How does a view "know" it has drifted? Recompute on schedule? On knowledge change? On access?
