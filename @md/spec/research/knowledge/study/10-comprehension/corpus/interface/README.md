---
under: the code
kind: brief
---

# Interface as data

The claim that an interface can be data over the same contracts as the data has been tried, at scale, by teams who then wrote down what it cost. Five lanes of the sweep covered it: server-driven interfaces at Airbnb, Uber, Plaid, DoorDash, Lyft and Shopify; the generative-interface protocol race; schema-driven forms and component contracts; the product view layers; and the low-code market around them.

## 1. Everyone converged on the same fix, and it is not the one usually proposed

Five independent teams hit the same wall and invented the same answer: a **capability negotiation** in which the client tells the server which component types it can render and the server refuses to send anything else. Nobody solved shipping a new component to an old client. One specification says it flatly — adding a new pane kind is a *major* version bump "which require[s] a client SDK upgrade."

And everyone's dispatch is a **pinned key, not a query**. A renderer *registry* is universal; a renderer *bid* — "which component can draw this?" — is not shipped anywhere at scale. [`server-driven-ui.md`](server-driven-ui.md) holds the five failure modes, documented by the teams that hit them.

## 2. The escape hatch is a named architectural tier

It is not an edge case. The untyped tier is a named architectural tier at two of the six organisations, and both report its boundary eroding; the quotations are in [`server-driven-ui.md`](server-driven-ui.md) §4.

The recovery is the interesting part: the untyped tier shrank when the design system became a typed vocabulary. That is an endorsement of typed contracts arrived at by attrition.

## 3. The protocol race ended, and the winner is opaque

Interactive interfaces for model contexts consolidated inside MCP: a stable extension as of 2026-01-26, absorbing both prior contenders, with 12.2 million monthly downloads and eleven hosts. The unit is a **sandboxed HTML iframe with no props schema** — the opposite of a typed mount.

Structured, typed component trees lost at the protocol layer and are thriving one layer up, where the application owns both the model and the renderer. [`generative-ui.md`](generative-ui.md) holds both, and the reason the split is stable.

## 4. The query form exists in exactly one mainstream system, and once in research

WordPress's block registry answers "which component can render this?" almost word for word: blocks declare typed attributes plus containment contracts — required parent, permitted ancestor, allowed children — registered into a runtime store, with an API that returns the block types a given set of blocks can be **transformed into**, resolved by highest-priority matching predicate. Structurally the same algorithm as the form-generator registries beneath — a set of predicates with priorities, queried at runtime against a piece of content — and shipped at WordPress scale.

The research instance is Ink & Switch's Patchwork, which is framework-neutral and whose tool plugins declare which datatypes they support — the nearest thing anyone has built to the whole idea, and a prototype with no verified user outside its lab.

Meanwhile the dominant component framework **deleted its only runtime contract** — prop-type checks are silently ignored as of React 19 — during exactly the period when agents started needing introspection. And one warning attaches to the whole approach: a shipped runtime schema-to-interface generator turned out to be an arbitrary-code-execution surface. [`schema-driven-ui.md`](schema-driven-ui.md) holds the candidates, graded.

## 5. The product layers all stop at a closed enum

Notion, Airtable, Tana and Anytype each have an extensible *instance* schema and a **closed set of view kinds**: ten, six or seven, seven, and six plus twenty-eight object layouts. None lets a third party register a renderer that bids.

Two refinements are sharper than the usual claim. The closure is one level deeper than views — **no one lets you define a new property type either**; the format enums are in the protocol, not records in the store. And view *configuration* is everywhere a union discriminated by the view-kind tag, which is precisely the shape a declaration-and-call model replaces. [`product-layers.md`](product-layers.md) holds the protobuf evidence.

## 6. The market bifurcated, and one reversal is the datum

What is dying is the proprietary visual runtime sold to prosumers and agencies. What is fine is governed process automation over regulated enterprise data. And the load-bearing event is Retool's June 2026 reversal, which is a verdict against closed, non-inspectable derivation rather than against derivation itself. [`market.md`](market.md) §4 states it with the quotation and the figures.
