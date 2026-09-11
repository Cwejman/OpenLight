# Component contracts as data

Is a component's accepted-types contract queryable at runtime? One agent went looking, in form generators, design-token standards, component manifests and component frameworks. The answer is yes in exactly one mainstream system, and the dominant framework moved in the opposite direction during exactly the period when agents started needing it.

## 1. The ranked-predicate registry, and its maintainer's confession

**JSON Forms** is the closest thing in the form world to a real capability-negotiation protocol. A tester is a function from user-interface schema, data schema and context to a boolean; a ranked tester returns a number, or a not-applicable sentinel. Primitives check the node type, resolve the sub-schema a control's scope points at and check its type, match a format, match a scope suffix, or match an option; combinators fold over testers. Resolution takes the **maximum rank across all registered renderers**, falling back to an unknown-renderer component. Any predicate over the schema node, the interface node, the root schema and the configuration can bid, with a numeric priority.

**And its maintainer wrote down the failure modes in 2026.** From an investigation issue opened 2026-05-07: "**Logic leaks into the 'UI' layer.** Required-label handling, visibility rules, enablement, error extraction, i18n key resolution, option computation, label derivation, path composition, etc., live in the mappers"; "**Customization is coarse-grained.** To customize cross-renderer functionality, e.g. change the 'label' computation, you often need to override every renderer"; "**Performance can be improved.** Every form change re-runs all mappers." The proposed direction replaces the mappers with a centralised presentation model where "**Testers work against presentation nodes**," which would let them "abstract over the JSON Schema… enabling an easier integration with JSON Schema less approaches" — **the schema itself is being demoted.**

Note also that ties are resolved by first-maximum-wins, undocumented and fragile.

## 2. The popular alternative is a lookup table

**react-jsonschema-form** is 3.7× more downloaded and selects widgets from a hardcoded two-level table keyed by schema type and widget name. A widget override may be a component directly, or a string looked up first in a registry and then in the table; **unknown combinations throw**. No ranking, no predicates, no negotiation — extension means overriding by *name*, not by *capability*. Its most-requested change, open since 2017 with 86 reactions, is to collapse the two-document split of data schema and interface schema; a layout and wizard model has been requested since 2019.

The honest verdict across the space: "the last 20% requires an escape hatch" is not folklore. One system's answer is "pass a component in"; the other's is "write a tester and outrank us." Both are admissions that the declarative layer ran out.

## 3. The one mainstream system that answers the question

**WordPress's block registry** answers it almost word for word. A block declares typed attributes plus containment contracts: a required **parent**, a permitted **ancestor** anywhere in the subtree, **allowed children**, and a context system for provision and consumption. These are registered into a **runtime store** and read back by name or in full.

And critically: an API returns "an array of block types that the set of blocks received as argument can be transformed into," alongside transform listings and a finder that "returns the **highest-priority** transform where the predicate function returns a truthy value." Arbitrary pasted HTML is run through that ranked predicate set to decide which blocks can render it.

That is structurally the same algorithm as the ranked-tester registry above — a registry of predicates with priorities, queried at runtime against a piece of content — shipped at WordPress scale.

## 4. The other candidates, graded

**Builder.io's component registration** is the most literally queryable: component info carries typed inputs, whether it can have children, which content models may use it, and **child requirements and parent requirements each expressed as a MongoDB-style query** over what the children must match. A component contract expressed as a *query*, evaluated at runtime.

**Plasmic's registration** carries slot props with an explicit list of allowed components — a runtime-registered containment contract. **Puck's** configuration is a plain runtime object with typed fields, enumerable but with no accepted-content typing. **Adaptive Cards** has a runtime type-to-element registry with version gating — type-keyed dispatch, no accepted-content query.

**Vue** is the one major framework where declared prop types survive into the runtime component object — but the "types" are JavaScript constructors carrying no semantics about content. **Angular's component reflection** returns input and output names with **no types**: you can ask what an input is called, not what it accepts. **Custom elements** expose observed attribute *names* only.

**Custom Elements Manifest** is the real machine-readable component contract and **it has stopped moving**: schema version 2.1.0, dated 2024-05-06, two tags ever, last substantive commit 2024-10-02. The format is genuinely good — per-module declarations with tag names, typed members and attributes, typed event payloads, slots, CSS properties and parts, and discovery via a package.json field — and it is a **build-time** generator whose only runtime consumers are documentation viewers, one of which does 2,763 downloads a month.

**Figma's contribution is design-time or agent-time, never application-runtime.** Its code-connect tool reached v2.0.0 in August 2026 with a hard deprecation — "Framework-specific parsers will no longer receive updates or support. Template files are now the only actively maintained way of using Code Connect" — which moves it *away* from statically understanding prop types and toward running a template to produce a string. Its MCP server's design-system search "Searches across all connected design libraries to find components, variables, and styles matching a text query" — a *text* query over a *design* catalogue, answered to an *agent* at authoring time. Neither typed nor runtime.

**Design tokens reached stable and deliberately stopped short.** The Design Tokens Format Module 2025.10 is a stable Community Final Specification, and its full section list covers terminology, file format, tokens, groups, aliases, types and composite types — **there is no notion of a component, a prop, a slot, or a variant anywhere in the document.** It standardised the *values* a design system passes around and deliberately did not touch the *interfaces* that consume them.

## 5. Derived interfaces are a code-execution surface

One finding belongs here because the rest of this folder argues for deriving interfaces from typed contracts, and this is the security consequence the sweep found.

A widely-used framework's inferencer inspects an API **response** rather than a declared schema, infers field types, generates React source, and renders it through a live-evaluation component. On 2026-08-25 an issue was filed against it: **"Arbitrary code execution… via unescaped API field names reaching react-live."** Runtime schema-to-interface generation is not only a fidelity problem; here it is an execution surface.

Its adoption figure is the second half of the lesson: the inferencer runs at about **7.5%** of the core package's downloads — scaffolding people run once and then abandon — and the framework's current documentation no longer lists it as a guide.

## 6. The strongest negative result

**React deleted its only runtime contract.** From the React 19 upgrade guide: "In React 19, we're removing the `propType` checks from the React package, and **using them will be silently ignored**." Prop contracts now exist only in TypeScript types, erased at build, and in documentation JSON, generated at build.

The industry's dominant component model moved *away* from runtime introspectability during exactly the period when agents started needing it.

## 7. The state of the art, stated plainly

Nobody has built a general one *as a shipped product*. The pattern exists and works — WordPress proves it at scale, Builder.io proves the query form, JSON Forms proves the ranked-predicate form — but every commercial instance is welded to a single editor or content system, and the one format that could have become a neutral standard has been frozen since May 2024 and is read only by documentation viewers.

**One research system is the exception, and it is the nearest neighbour to this whole idea.** Ink & Switch's Patchwork is framework-neutral, and its tool plugins declare which datatypes they accept. It is a research prototype, unusually mature, with no verified user outside its lab. The contract is in its one home, [`../substrate/local-first.md`](../substrate/local-first.md) §4.

Watch where the pressure is coming from: the interface extension to MCP has a mode where the host registers a component set the server may address by name — a runtime host-side registry whose contract is a name agreement rather than a typed capability description. That is where the need is now surfacing.

Report: [`a458ace67969949f3`](../../../../../sweep-2026-08/raw/a458ace67969949f3.md).
