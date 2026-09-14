---
under: the code
kind: brief
---

# The generative-interface protocol race, and its winner

Consolidation happened, inside the Model Context Protocol, and the winning unit is opaque. That is the decisive fact for anyone whose interface is already typed data — and it is better news than it sounds.

## 1. What won

**MCP Apps**, specification SEP-1865, "Interactive User Interfaces for MCP," track Extensions, **Status: Stable as of 2026-01-26**, created 2025-11-21, with cross-vendor authorship. The contract: a server predeclares a resource under a `ui://` URI with a profiled HTML media type; a tool links to it through metadata; the host renders it in a **mandatory sandboxed iframe** and talks to it over JSON-RPC across postMessage — initialize, then tool-input, partial-input and tool-result notifications, with view-to-host requests for opening links, sending messages, requesting a display mode and updating model context. Security is declarative, through a content-security-policy object plus a permissions list. Theming ships standardised CSS variables.

The specification's own motivation section names the merger: one prior contender "developed the bi-directional communication model," the other "further validated the demand," and this extension "unifies the approaches pioneered by MCP-UI and the Apps SDK into a single, open standard."

Adoption: **12,177,761 downloads in the month to 2026-08-24**, eleven hosts in the official client matrix including the major assistants, editors and copilots. Both prior contenders are now subordinate — one vendor's own documentation says its product "implements the open MCP Apps standard," retaining its earlier bridge as compatibility aliases; the other's packages now describe themselves as implementing the standard.

A draft revision adds guest-registered tools and a section on its relation to browser-side model interfaces.

## 2. The winning unit is opaque

An HTML and JavaScript blob in a sandboxed iframe, **props-less**, data arriving by notification, security handled by declarative policy rather than by type. That is what every major host implements, and core MCP still has no interface concept at all — the 2026-07-28 revision has none in the base specification, and elicitation was in fact *simplified*.

## 3. Structured trees lost at the protocol layer and thrive one layer up

Typed component trees — where the host renders with its *own* components — are growing quickly in the application layer, where one party owns both model and renderer.

The clearest instance renamed itself "the open standard for generative UI" in March 2026: its core is a compact streaming language parsed into a **typed element tree validated against a JSON schema generated from your component library** — and the same library generates the system prompt. Renderers exist for four frameworks plus email and a browser bundle. Its language package was created 2026-03-25 and already does over 400,000 monthly downloads. Governance is a single vendor's GitHub organisation; "open standard" is a claim, not yet a governance fact.

Note the escape hatch: its browser bundle ships the renderer as script and stylesheet assets for "CDN, iframe, and no-build embeds" — so a structured tree can be smuggled *inside* an MCP Apps iframe.

**The split is stable because the two solve different problems.** Iframes give cross-host portability without design agreement; typed trees give design-system fidelity but require host and server to share a component vocabulary.

## 4. What else is in the picture

The agent-interface event protocol at 15,553 stars and roughly 6 million monthly downloads for its core is a **transport**: its documented event taxonomy is lifecycle, text, tool-call, state snapshot and delta, activity, reasoning, subagent, raw and custom — **no interface-rendering events at all**. Typed-tree languages stream over it.

One major framework's server-component generative interface **retreated**: the documentation carries a warning that it is experimental with a migration guide away from it, and it runs at roughly 0.4% of the parent package's downloads.

## 5. What this means for a typed project

The agent's own reading, and it is the right one: **a project whose interface is already typed data is advantaged, not commoditised.** The opaque standard fixes the transport and says nothing about how you author it. Typed data is exactly what you need to render either into a bundled iframe *or* into a host's own components, without rewriting. The commoditised asset is the hand-written iframe widget; the durable asset is the typed model plus a small renderer per target.

Ship the typed layer, and treat the opaque standard as one adapter.

Reports: [`a6064cc62dbf12499`](../../../sweep-2026-08/raw/a6064cc62dbf12499.md), [`a57740ddd62e39ab6`](../../../sweep-2026-08/raw/a57740ddd62e39ab6.md).
