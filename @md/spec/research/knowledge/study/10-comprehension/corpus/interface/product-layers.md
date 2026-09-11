# The product view layers stop at a closed enum

Four products are built on the idea that structure is data: Notion, Airtable, Tana and Anytype. One agent read their protocols and SDK source directly to find where the extensibility ends. It ends in the same place in all four, and one level deeper than usually claimed.

## 1. Notion

Two separate systems: page content is a uniform typed tree of *blocks*, database rows carry *properties*. API version `2025-09-03` split the old database object into a **database** (container) and **data sources** (tables), with properties moving onto the data source — a real schema-layer improvement, and a forced migration, so: shipped and adopted.

**A Views API shipped 2026-03-19** — eight endpoints letting integrations manage database views programmatically. The view object exposes a parent, a data source, a name, a type, filters, sorts, and a configuration documented as "View-specific layout configuration, **discriminated by `type`**." That clause is the wall: type is a closed list of exactly ten — table, board, calendar, timeline, gallery, list, form, chart, map, dashboard. **A view is a preset selected from an enum, and its configuration is a union branch keyed by that enum.**

Page layout *is* addressable — column lists with width ratios — but block type is likewise closed at 32, and the documentation states plainly that unsupported types degrade to `"unsupported"`. No plugin or component API, no user-defined property types. The nearest escape hatch is interactive HTML blocks (Notion 3.6, 2026-07-01), which are a sandboxed iframe the user places, not a renderer that declares what it accepts.

## 2. Airtable

`FieldType` is a TypeScript enum in the SDK source with **33 members**, closed; field-type extensibility was never shipped, and no trace of it exists in the SDK or its issue tracker.

The Blocks/Extensions SDK is the most serious component API of the four and deserves the credit: genuine React over live typed data, with hooks for the base, records and loading state, persisted extension settings, and field, table and view models. But note what an extension *declares*: **nothing about types.** It is not a declaration of "I accept records of shape X" — it is a mounted application that discovers a field's type at runtime and branches. **The match is imperative, not a query.**

View types are closed at six in the SDK. The `BLOCK` view type is the closest anyone gets to a third-party renderer occupying a view slot — and the user places it; it does not bid. Interface Designer is opaque: listing views returns only identifier, type, name, personal-user and visible field identifiers — **no filters, grouping or layout** — and Interfaces appear nowhere in the web API. Layouts are not data.

Status: shipped-niche and effectively frozen. The blocks repository has 272 stars and every 2026 commit visible is an automated dependency bump.

## 3. Tana

"Nodes are the only primitive" largely holds. A **supertag** carries **fields** plus a **content template** — "Every time you apply the supertag to a node, this template gets applied" — which may itself contain default values, plain nodes, *and* search nodes. Display configuration lives on the supertag: pinned fields, "Build title from fields" (a title expression over field values), show-as-checkbox.

That title-expression mechanism is the closest shipped thing to a template with expressions over the mounting call's arguments — **but it computes a *string*, not a subtree.**

Grade: shipped-niche; the agent could not verify current adoption or funding and asserts none. Search nodes are live queries that are themselves nodes in the graph, capped at 2,500 results, and views attach to all nodes that have children, including search nodes — so a view is roughly node-attached configuration. But the view vocabulary is again fixed: outline, table, cards, list, calendar, side menu, tabs. No user-defined view type, no renderer registry.

## 4. Anytype

This is the crux, and the protobuf answers it flatly. From the model definitions on the development branch, fetched 2026-08-26:

- `RelationFormat` — **closed, 15 values**: long text, short text, number, status, tag, date, file, checkbox, URL, email, phone, emoji, object, relations, map.

- `ObjectType.Layout` — **closed, 28 values**.

- `Block.Content.Dataview.View.Type` — **closed, 6 values**: table, list, gallery, kanban, calendar, graph.

Grade: shipped-niche, open source, actively pushed. So **layout is a fixed enum**, and this is the sharpest disconfirmation available. What *is* object-like is impressive: the smart-block type enumeration includes templates, object types and relations, so templates, types and relations are all genuinely objects in the same store, and each view carries a default template and default object type. **Anytype got furthest on "schema and template are data" and zero distance on "renderer is data."**

## 5. The two refinements that matter

All four have an extensible **instance** schema — you may add types, supertags or tables and add properties to them — and all four have a **closed set of view kinds**. None lets a third party register a renderer that *bids* to render a type.

**First, the closure is one level deeper than views: no one lets you define a new property type either.** The format enumerations are enums in the protocol, not records in the store. Extensibility stops at instances of a fixed vocabulary in both dimensions.

**Second, view configuration is everywhere a union discriminated by the view-kind enum** — a configuration object "discriminated by type," a view message whose cover, card-size and grouping fields are meaningful only for particular type values. Configuration keyed by a closed tag is precisely what a declaration-and-call model replaces.

The two partial counterexamples — Airtable's block view type and Notion's interactive HTML blocks — are both **user-placed sandboxes, not type-matched mounts**, which is the distinction the whole question turns on.

Reports: [`a2252e73e0215b641`](../../../../../sweep-2026-08/raw/a2252e73e0215b641.md), [`a57740ddd62e39ab6`](../../../../../sweep-2026-08/raw/a57740ddd62e39ab6.md).
