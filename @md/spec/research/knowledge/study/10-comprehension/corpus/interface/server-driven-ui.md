---
under: the code
kind: brief
---

# Server-driven interfaces: what it cost the people who shipped it

Six large engineering organisations built and documented server-driven interface systems between 2021 and 2023. The write-ups are unusually candid, and together they are the best available record of what happens when the interface becomes data.

## 1. The canonical design maps almost term for term

Airbnb's Ghost Platform (June 2021) is shipped and adopted — "a majority of Airbnb's most used features (e.g. search, listing pages, checkout) are built on GP." Its shape: sections are "a union of all possible section types. Each section type specifies the fields they provide" — a declaration of what it accepts. A section component type "controls how a section's data model is rendered... enables one data model to be rendered in many different ways." A layout is an interface whose implementations specify placements, each with "a unique renderer in each client's GP framework," and the framework "finds the proper section component to render that section."

Two things it does **not** do, and both are the crux. Dispatch is by an explicit pinned discriminator, not a query over the data — the server names the renderer. And layouts are a closed set with native renderers per client; a layout cannot be authored as data.

Its stated 2021 roadmap was nested sections, "improving discoverability of elements... through our design tools, such as Figma, and WYSIWYG editing of sections and placements, enabling no-code feature changes." No evidence it shipped, and no post-2021 source on the platform's current state.

## 2. Failure mode one: versioning across clients you cannot force to upgrade

This is where the record is richest and least flattering.

**Plaid** states it most sharply. Workflows are versioned, and: "**major**: ...incremented for breaking and incompatible changes which require a client SDK upgrade. e.g. Adding a new kind of pane." Explicitly: "The system supports a pre-defined number of pane nodes that all SDKs know how to render... New panes can be added as needed over time, but require an SDK update to render them with native platform UI." Their mitigation is pinning legacy SDK versions to specific graph versions. **So the promised benefit — ship interface changes without a release — holds only within the vocabulary already shipped.** New vocabulary costs a release, plus indefinite maintenance of a frozen graph per stranded SDK generation.

**DoorDash** documents the sharp edges. "If we created a new version of an instrumental component, such as the store row in the homepage, and it was different enough that it warranted a new Facet ID, older versions of the app would omit those views as soon as the backend starts sending the newly versioned ones." A subtler one: "clients might understand the component, but a new action type might be unsupported, in which case the component will cause an error on action, but might still be rendered." Their fix was semantic-versioning capability declaration plus client-side validation — "these two simple checks reduced our need to version our libraries by about 50%."

**Uber's Screenflow** is the closest anyone came to a compiled, typed model, and it is a shutdown. A restricted subset of TypeScript; only components as top-level definitions; restricted expressions in render; compiled to an intermediate representation; definition files carrying types *and default values* so native clients could generate matching protocols. Its versioning answer is the most rigorous anyone attempted: "All definitions were versioned and every screen had to specify a version. When pushing screen changes to the monorepo, the CI invoked the compiler on all previous versions to ensure that the screen would run on all existing runtimes." That is validating every call site against every shipped signature set — the correct answer, and it costs a compiler, a monorepo and a build matrix. After about two years: "at least 16 flows" in production. The department was shut down in July 2020.

**Lyft** independently landed on the same word: cross-team alignment "started small with aligning on solutions to common problems like 'Capabilities' (which components are supported in which client versions)."

## 3. Two shipped systems reached opposite conclusions on fallbacks

DoorDash built prototypical fallback views per component category out of fear, and reports: "**Fallback components were unnecessary**... we have not found this to be useful at all, as when we version components, we typically have a very specific, new design in mind." Shopify's Shop app went the other way — "the client would define a default layout for each section, and this default layout would be rendered if the client receives a new layout type it does not understand."

The reconciling read: a generic fallback is useful only when the new component is a *variation*. When it is genuinely new, degradation is worse than omission, and capability negotiation dominates.

## 4. Failure mode two: the escape hatch

Lyft names it outright. Semantic Components "can act as an escape hatch from server-driven land," introduced because "Declarative Components are powerful but come with a lot of limitations. It's hard to model complex animations and view hierarchies from the server... don't support highly responsive (i.e. fully client-side) interactions." And then: "**Sometimes the dividing line between semantic and declarative can be hazy.**"

DoorDash's version is an untyped `custom` field: "having a dynamic object is great for flexibility, [but] there are downsides caused by the lack of type-safety and the potential for deserialization errors."

Their recovery is the instructive part: "we started matching styling types with our design language system library, which has helped mitigate our usage of `custom`." **The escape hatch shrinks when the design system becomes a typed vocabulary.**

## 5. Failure mode three: recursion against field-selection queries

DoorDash on the web: "The Facet data model was designed to be recursive... there was no clear way to understand how many nodes were presented in the data or if nodes had any children prior to requesting the data. This structure makes the process of requesting Facet data via GraphQL close to impossible or at the best case scenario inefficient." They flatten server-side and reconstruct client-side.

Recursive component trees and field-selection query languages are structurally opposed. Airbnb sidestepped it by keeping sections **flat** — placements point at a top-level array by identifier — and listing nesting as future work. If templates are trees of mounts, this is the constraint to design against early.

Two deserialization traps are worth flagging because they are silent. A heterogeneous array of different component types is "prone to deserialization errors." And a strict protobuf library "would fail if a new enum case is returned in the response," forcing a migration off it. **A closed-world serializer plus an open-world component vocabulary is a crash.**

## 6. Failure mode four: organisational coupling

From the practitioner critique: "we prefer decoupled systems with clear interfaces and boundaries. SDUI is the opposite of that, it's tight coupling between all the clients and the backend, changes to your UI are split across a bunch of teams."

Shopify's own write-up shows the mechanism: faced with reusing another team's components, "we made the decision to create our own Shop Store components when needed, since this would allow us to control the data types in each section." **A shared registry a team cannot evolve gets forked.** Lyft admits the endpoint: "We don't have a single framework to build SDUI at Lyft yet. Instead, feature teams have had a lot of freedom to experiment on their own."

## 7. Failure mode five: designer workflow, mostly unsolved

Airbnb's Figma and WYSIWYG ambition was roadmap. Uber got furthest — a browser-based IDE with live previews on all platforms, an intern-built time-travelling debugger enabled by immutable state, preview components supplying mock data, and a tool producing the interface language directly from Figma designs. That is the wall falling, and it died with the org.

## 8. The strongest objection was in the first comment thread

From the 2021 discussion of Airbnb's post: "Wow! You created a stripped down version of HTML" — and the top technical reply named coupling, caching, animation, platform-specific features, and "doing UI in gql schemas is awful." Also: "difficulty caching resulting in bad performance"; "you end up unnecessarily reloading entire screens just in case one small piece of UI changed"; "sdui+gql are opposite goals, sdui wants dumber clients gql wants smarter clients."

## 9. What is alive

Spotify's framework is archived and deprecated. Nubank's two frameworks are *gone* — the organisation's GitHub now contains three unrelated repositories, with only third-party forks surviving. Against that, Yandex's DivKit had commits on the day of the sweep.

The strongest surviving implementation of "a mount is a call the host resolves" is Shopify's **Remote DOM** — a controller that maps remote components to their native implementations over a message channel, with hosts in JavaScript, Kotlin *and* Swift — at 627,451 monthly downloads and active development.

Report: [`a57740ddd62e39ab6`](../../../sweep-2026-08/raw/a57740ddd62e39ab6.md).
