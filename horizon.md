# Horizon

Ideas on the horizon. Recognitions that shape current thinking without yet being committed. Not settled enough for `inside.md`, not concrete enough for `pilot.md`, not edge knowledge for `research/`. This is where live ideas sit — worked on, referenced, allowed to mature or dissolve.

Each entry names a direction, develops what it would mean, and cites what is already real versus what is open. Research files are referenced where the technical ground is worth tracing.

---

## The field as cache substrate

A novel affordance the substrate opens that conventional agents cannot reach: **the field itself as the cache substrate.** The inference provider is not a stateless function we shovel prompts into each turn — it is infrastructure the field can live on. Part of the substrate resides with the model. Scope resolution targets content that is already there.

The conventional shape is: assemble context into a prompt, send it, hope the provider deduplicates. The shape this opens is: name what lives remote, reference it, send only the delta. For scopes that resolve entirely from cache, the content does not need to travel at all.

Three substrate properties make this fit natively, not as an optimization bolted on:

- **Chunk identity is stable.** A chunk's canonical serialization is a function of its content. Hashed today is hashed tomorrow. Cache keys are substrate-native — not artifacts of prompt assembly.
- **Scope resolution is deterministic.** A scope at a given head produces an ordered, stable list of chunks. Cache entries compose the way scopes compose.
- **Cross-session reuse is natural.** Sessions come and go; the substrate persists. A cache primed in one session is warm for the next, because the field it indexes is the same field.

This is a concrete instance of "running is learning" and of "the field is where intelligence lives, not any single node." The substrate already treats invocables as functions native to the field. The cache turns part of the provider into field residency — not metaphorically, literally. A chunk exists at a scope address, and it also exists at a provider cache handle, and both point to the same thing.

**Multi-peer implication.** When peers exist, each peer's cache is an addressable surface on the provider. Cross-peer collaboration could target another peer's cache handle directly, without re-shipping content. The field lives in distributed cache handles. The inference provider becomes shared substrate infrastructure between peers — another sense in which the boundary between model and environment is architectural, not categorical.

**What is real and what is open.** The provider primitives exist today — Anthropic's `cache_control`, OpenAI's prompt caching, and most structurally, Gemini's explicit cached content API where content is uploaded once and referenced by handle on subsequent requests without re-transmission. These are ours to build on. What is open: TTL management under chunk mutation, cache sizing against provider limits, the substrate-native representation of a cache handle (probably a chunk attribute — the field tracking its own residency). The mechanism is a direction, not a validated design.

For the current state of provider cache primitives, see [`research/backend.md`](research/backend.md).

**Implication for backend choice.** Gemini's cache shape is the one most aligned with the substrate's own shape. A first-class cache-handle concept on the invocable contract is worth reaching for early rather than bolting on later.
