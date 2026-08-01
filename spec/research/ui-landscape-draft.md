# UI Landscape — Draft Survey

Raw output of three parallel exploration agents dispatched to widen the aperture on UI tech for OpenLight. Values-first, no convergence. Collected here unedited for reading before we decide how to structure.

Each agent was briefed on OpenLight's values from `inside.md` (folk-like, uncovered-not-invented, simplicity-is-natural, transparency-of-relationships, multidimensional-never-sliced, knowledge-as-identity) and on the view-as-invocable-with-surface framing. All three were instructed NOT to recommend or rank — only to survey.

- **Part I** — Moldable, novel, live, historical-but-still-relevant, fringe UI paradigms.
- **Part II** — Non-mainstream / emerging languages with UI stories.
- **Part III** — Historical folk-like UI systems; what made them folk-level; what recurs.

---

# Part I — Novel, Moldable, Live, and Fringe UI Paradigms

## I. Moldable, Self-Describing Systems

### 1. Smalltalk-80 / Squeak / Pharo
A complete live object world where the IDE, compiler, debugger, and application coexist in one image. Every object can be inspected, every method can be edited at runtime, and the system is bootstrapped from itself. "Doing" and "defining" are the same gesture — you sculpt the running system.
- **Embodies:** Knowledge-as-identity (objects ARE the system), transparency of relationships (inspect anywhere), simplicity-is-natural (uniform object metaphor).
- **Counter-embodies:** Folk-like (image-based worlds are culturally alien to UNIX users); the uniformity can feel totalizing rather than composable.
- **State:** Alive (Pharo is actively developed; Squeak maintained).
- **For OpenLight:** The live-image discipline — no separation between authoring and running. Every chunk should be inspectable *in situ*, and changes should take effect without ceremony.

### 2. Self / Morphic
Prototype-based language whose UI toolkit Morphic treats every visible thing as a directly-grabbable "morph" with an inside. You can pull a button apart, see its sub-morphs, drop one into something else. No separate "design mode."
- **Embodies:** Transparency of relationships, "uncovered not invented" (direct manipulation feels inevitable), multidimensional (halos let you act on anything in many ways).
- **Counter-embodies:** Folk-like is debatable — powerful but the halo gesture language must be learned.
- **State:** Dormant research artifact; Morphic lives on in Squeak/Pharo/Lively.
- **For OpenLight:** The "halo" pattern — a uniform affordance layer over every chunk that exposes structural operations (inspect, wrap, extract, connect) without owning the chunk's rendering.

### 3. Glamorous Toolkit (GToolkit)
Feder Chiș's "moldable development" environment built on Pharo. The premise: inspectors, debuggers, and views should be cheap to make custom per domain. Every object can offer its own set of views; the IDE adapts to the data instead of the reverse.
- **Embodies:** Multidimensional never sliced (same object, many views simultaneously), transparency, knowledge-as-identity.
- **Counter-embodies:** Folk-like — requires Smalltalk literacy.
- **State:** Alive, actively developed (feenk.com).
- **For OpenLight:** The *moldable inspector* idea — a chunk carries (or implicitly acquires) view-affordances; the UI is a composition of domain-specific lenses rather than a single renderer.

### 4. Lively Kernel (Morphic-on-Web)
Dan Ingalls' browser-hosted Morphic successor. A live object world running in JavaScript where you edit the page *with* the page. Recent incarnation: Lively4.
- **Embodies:** Simplicity-is-natural, transparency.
- **Counter-embodies:** Folk-like — still niche in practice.
- **State:** Dormant-ish; research continues at HPI Potsdam (Lively4).
- **For OpenLight:** Proof that self-modifying live UI is feasible in conventional runtimes; a reference for what *not* to over-engineer when staying web-native.

## II. Hypertext & Document-Centric

### 5. HyperCard
Stacks of cards with scriptable fields and buttons in HyperTalk — prose-like code anyone could write. A generation of non-programmers built software with it. Its death is still mourned.
- **Embodies:** Folk-like (the archetype), uncovered-not-invented, simplicity-is-natural.
- **Counter-embodies:** Multidimensional — stacks are fundamentally sliced pages.
- **State:** Archived (1987–2004). Descendants: LiveCode, Decker, HyperNext.
- **For OpenLight:** The tension between *card* (bounded, addressable) and *field* (continuous, relational). Folk-accessible scripting language is a grail.

### 6. Decker
John Ohno / Internet Janitor's modern HyperCard homage — pixelated, deliberately constrained, web-native, with Lil (a small scripting language). A proof that the HyperCard shape is still alive.
- **Embodies:** Folk-like, simplicity, uncovered.
- **Counter-embodies:** Multidimensional (still card-paged).
- **State:** Alive (beyondloom.com/decker).
- **For OpenLight:** Constraint as invitation — Decker's deliberate limitations are what make it folk-usable. A cautionary counter to infinite-field designs.

### 7. LiveCode
Commercial HyperCard successor with a cross-platform target. HyperTalk evolved into LiveCode Script.
- **Embodies:** Folk-like.
- **Counter-embodies:** Transparency (internals are opaque commercial product).
- **State:** Alive but community edition discontinued 2021; uncertain.
- **For OpenLight:** Evidence that the folk-scripting market persists; also a warning about enclosure.

### 8. TiddlyWiki
A single HTML file that is a personal wiki, composed of "tiddlers" (small chunks) that can transclude each other. The whole system fits in one file and edits itself.
- **Embodies:** Knowledge-as-identity, multidimensional (tiddlers in parallel columns), transparency.
- **Counter-embodies:** Folk-like — the markup and macro syntax have steep edges.
- **State:** Alive (jermolene et al., 20+ years).
- **For OpenLight:** The *tiddler* as a model for chunks: small, transcludable, field-resident, with implicit relationships via names. Also a model for zero-install, zero-server editing.

### 9. Roam Research / Logseq / Obsidian
Block-based note-taking where every block has an address, can be transcluded, and can participate in queries. Graph-shaped rather than tree-shaped knowledge.
- **Embodies:** Transparency of relationships (backlinks), knowledge-as-identity, multidimensional.
- **Counter-embodies:** Simplicity — the bullet-outliner form can become a cage; the graph visualization is usually decorative.
- **State:** Alive and commercially relevant.
- **For OpenLight:** Block-addressing at fine granularity is *the* enabling move; but beware the outliner cage — not everything wants to be a nested bullet.

### 10. Xanadu (Ted Nelson)
The unbuilt hypertext. Transclusion (inclusion by reference, preserving provenance), two-way links, parallel visible documents with visible connections. Most of the web's shortcomings are Xanadu's critiques.
- **Embodies:** Multidimensional never sliced (its founding principle), transparency of relationships.
- **Counter-embodies:** Simplicity-is-natural — the design is famously elaborate.
- **State:** Archived; Xanadu Green exists as demo.
- **For OpenLight:** Transclusion-with-provenance is the missing link. The web broke this; you can still pick it up.

## III. Text-Native / Keyboard-Native Environments

### 11. Acme (Plan 9)
Rob Pike's editor where text is uniformly active: any word can be a command; mouse chords execute, acquire, or plumb text across the system. No syntax highlighting, no modes, no menus — the interface *is* text with mouse chords.
- **Embodies:** Uncovered-not-invented, transparency (everything is reachable text), folk-like (the primitives are few).
- **Counter-embodies:** Folk-like is contested — three-button-chord discipline has a learning wall.
- **State:** Alive in 9front and via acme-sac, plan9port; ported everywhere.
- **For OpenLight:** The *plumber* — a system-wide router that interprets selected text based on shape (URL, filename, coordinate) and dispatches. A canonical model for command-palette-as-substrate.

### 12. Oberon / Bluebottle / Active Text
Wirth's Oberon system has text as the universal interface, but any text region can contain embedded objects ("elements") that are live. Commands are written in text and executed by middle-click. Bluebottle (A2) extended this with active objects and a zoomable desktop.
- **Embodies:** Uncovered, transparency, multidimensional (text and objects compose).
- **Counter-embodies:** Folk-like — Oberon's cultural niche is small.
- **State:** Dormant/archival; A2 lives in research corners.
- **For OpenLight:** "Text with live objects embedded" is a powerful substrate shape — the text is addressable and linear, the objects are full renderers. Worth contrasting with Morphic's "all morphs."

### 13. Symbolics Genera (Lisp Machine)
An operating system where every value on screen is a typed object with a "presentation" — right-click anything and get operations valid for its type. Dynamic Windows (CLIM) presents output that can be reused as input. The entire system is inspectable Lisp.
- **Embodies:** Transparency, knowledge-as-identity, multidimensional.
- **Counter-embodies:** Folk-like — Lisp machine was a cathedral.
- **State:** Archived hardware; CLIM survives in Common Lisp ecosystem (McCLIM).
- **For OpenLight:** *Presentation types* — output carries its type so it can be re-input. In a chunk-field, every rendered chunk should remain a handle to the underlying chunk.

### 14. Emacs
Emacs is not a text editor; it is a Lisp machine wearing text editing as its default costume. Every keystroke is a command; every buffer is inspectable; the system is modifiable from inside itself.
- **Embodies:** Transparency, knowledge-as-identity (your config is the editor), moldable.
- **Counter-embodies:** Folk-like — infamous learning curve; accretion over clarity.
- **State:** Alive, older than most of its users.
- **For OpenLight:** The *buffer* as a universal surface — any source of text/structure becomes a buffer and inherits the toolkit. Also: the danger of infinite customizability without invariants.

## IV. Spatial & Zoomable

### 15. Pad++ / Jazz / ZUIs (Zoomable User Interfaces)
Ken Perlin and Ben Bederson's experiments with infinite zoomable canvases where semantic detail emerges as you zoom in. The UI is a plane, not a stack of windows.
- **Embodies:** Multidimensional never sliced (space, not pages), uncovered.
- **Counter-embodies:** Folk-like — zoom fatigue is real; spatial memory has limits.
- **State:** Dormant; commercial descendants: Prezi, tldraw, Muse, Miro.
- **For OpenLight:** ZUIs as an alternative to window/tab paradigms; but note that pure zoom without structure becomes exhausting. Structure + zoom (semantic zoom) is the interesting middle.

### 16. Dynamicland (Bret Victor / RealTalk)
A room-sized computer: paper pages with printed code and colored dots, cameras overhead, projectors overlay live graphics onto the pages. Multiple people, physical objects, programs that literally sit next to each other on a table.
- **Embodies:** Folk-like (paper!), transparency (you see the code on the thing), multidimensional, knowledge-as-identity.
- **Counter-embodies:** Practical accessibility — requires a literal room.
- **State:** Alive but private (Oakland lab); RealTalk is the runtime.
- **For OpenLight:** The discipline of *objects that declare what they are* — each page broadcasts its claims, other pages react. A substrate pattern that doesn't need a room; it needs claim-subscription.

### 17. Croquet / OpenCroquet / Croquet OS
Alan Kay's distributed 3D collaborative world, with every object a replicated live program. The successor was commercialized by Croquet Labs.
- **Embodies:** Multidimensional, knowledge-as-identity.
- **Counter-embodies:** Simplicity-is-natural — 3D has high incidental cost.
- **State:** Dormant as research; Croquet OS is commercial.
- **For OpenLight:** Replicated-object semantics — chunks that live on many machines but are *the same chunk*.

## V. Data-Flow, Node-Based, Reactive

### 18. Max/MSP & Pure Data
Miller Puckette's node-and-wire programming environments for music/signal. Every box is a live operator; patches run as they are edited; the audio thread never stops.
- **Embodies:** Transparency (wires are literal), live-ness.
- **Counter-embodies:** Multidimensional — wire-spaghetti at scale slices cognition badly.
- **State:** Alive (Max commercial, Pd open-source).
- **For OpenLight:** Live patching over a running system; but node-wire UIs have well-documented scale ceilings. Consider what they teach about *immediate* edit-to-effect with zero deploy.

### 19. TouchDesigner / vvvv / Notch
Visual node-based real-time graphics/media systems. Same family as Max but for pixels.
- **Embodies:** Live-ness, transparency.
- **Counter-embodies:** Folk-like (professional tools), simplicity.
- **State:** Alive, commercial.
- **For OpenLight:** Node graphs reward *visual execution state* — seeing values flow. A lesson about making runtime state a first-class display.

### 20. Observable Notebooks
Mike Bostock's reactive notebook where cells form a DAG: when one changes, dependents recompute automatically. Order of cells is visual, not temporal.
- **Embodies:** Transparency, live-ness, simplicity.
- **Counter-embodies:** Multidimensional — still a single column of cells.
- **State:** Alive; Observable Framework is the current form.
- **For OpenLight:** Reactivity as a *discovered* property of the chunk graph — if chunks declare their inputs, the field computes itself. Notebooks showed you don't need to write the reactive plumbing explicitly.

### 21. Spreadsheets (Improv, Lotus, Quantrix, beyond grids)
Beyond Excel: Lotus Improv (dimensions and named models instead of A1:Z99), Quantrix (multi-dimensional), Airtable (tables as apps). Spreadsheets remain the most-used programming model on Earth.
- **Embodies:** Folk-like (the champion), uncovered, live.
- **Counter-embodies:** Transparency at scale is poor; formulas hide in cells.
- **State:** Alive (Excel); Improv archived but deeply influential.
- **For OpenLight:** The quiet triumph of *data + formula in the same cell*. Also: Improv's lesson — dimensional models beat A1 references when structure matters.

### 22. Red / Rebol / Reactive VID
Carl Sassenrath's Rebol (and Red, its successor) had a dialected approach to UI: a small DSL describing the interface, evaluated to produce a live window. VID (Visual Interface Dialect) was radical in its brevity.
- **Embodies:** Simplicity, uncovered.
- **Counter-embodies:** Community size / longevity.
- **State:** Rebol archived, Red semi-dormant.
- **For OpenLight:** Proof that UI-as-dialect can be stunningly compact. A 20-line window in VID would be a page of React.

## VI. Structural / Projectional Editors

### 23. JetBrains MPS (Meta Programming System)
Projectional editor: you don't edit text, you edit an AST, and the rendering is a *projection* of that tree. Different projections (math notation, tables, diagrams) of the same underlying structure.
- **Embodies:** Multidimensional never sliced (many projections of one structure), transparency.
- **Counter-embodies:** Folk-like — you're editing structure, not text; this alienates many.
- **State:** Alive but niche.
- **For OpenLight:** The projectional discipline — if the chunk's *truth* is its structure, the rendering is a choice, not a source. Multiple projections can co-exist.

### 24. Hazel / Isabelle jEdit / structure editors
Hazel (Cyrus Omar, U. Chicago) is a typed functional language with a structure editor that maintains well-formedness and live type-directed suggestions even in holes. You never have a syntax error because you can't type one.
- **Embodies:** Transparency, uncovered, live-ness.
- **Counter-embodies:** Folk-like — structure editing is culturally foreign.
- **State:** Alive (research).
- **For OpenLight:** Editing chunks in a way that *can't produce invalid states* — the edit surface knows the schema.

## VII. AI-Native / Voice-Native / Post-GUI

### 25. Dynamicland & RealTalk (revisited as AI-substrate)
Already listed, but worth noting: RealTalk's *claims* model (objects publish typed facts, others subscribe) is a natural fit for agent-substrate thinking.

### 26. Conversational / Agent-First UIs (ChatGPT, Claude artifacts, Cursor)
The shift from WIMP to prose-as-interface. The user speaks intent; the system renders appropriate artifacts.
- **Embodies:** Folk-like (language is the oldest interface), simplicity.
- **Counter-embodies:** Transparency of relationships (opaque reasoning), multidimensional (serial by default).
- **State:** Alive and reshaping the field.
- **For OpenLight:** The discipline of *intent-first* dispatch; but the failure mode is serialization — the chat log flattens everything into time. A chunk-field preserves the multidimensionality that chat destroys.

### 27. Genera / Natural-language command layers (historical)
The "describe what you want" interfaces long predate LLMs — Genera's presentation types let you right-click a value for its operations, effectively offering "what can I do with this?" in UI form. See Genera entry above.

## VIII. Fringe / Under-recognized

### 28. Inform 7 (natural-language programming)
Graham Nelson's IF authoring system reads like English: "The kitchen is north of the hall. A red key is in the kitchen." Compiles to a working game.
- **Embodies:** Folk-like, uncovered.
- **Counter-embodies:** Transparency — the rules of what-compiles-to-what are subtle.
- **State:** Alive (Inform 7 open-sourced 2022).
- **For OpenLight:** An existence proof for declarative-prose authoring as a legitimate interface.

### 29. Subtext (Jonathan Edwards)
Research language/environment where the program IS its visual representation, with explicit structural editing, example-driven semantics, and schema-as-UI. Successor projects: Subtext 2, 3, "Live Literate Programming."
- **Embodies:** Uncovered-not-invented, transparency, knowledge-as-identity.
- **Counter-embodies:** Folk — deeply research-bound.
- **State:** Alive as research (subtext-lang.org).
- **For OpenLight:** Jonathan Edwards' writing is a crash course in what's wrong with current PL/UI divide. Subtext's "the program is the representation" maps directly to a chunk-field ethos.

### 30. Eve (archived, still instructive)
Chris Granger's attempt at a "literate + reactive + structural" programming environment for non-programmers. Shut down 2018; retrospectives are widely read.
- **Embodies:** Folk-like, live, transparency.
- **Counter-embodies:** Ambition exceeded resources.
- **State:** Archived; post-mortem is valuable.
- **For OpenLight:** Eve's retrospective ("we made the wrong bets") is required reading for anyone building in this space.

### 31. Luna / Enso (hybrid visual/textual)
Node-based and textual representations of the same program, switchable. Originally Luna, rebranded Enso, pivoted to data workflows.
- **Embodies:** Multidimensional, transparency.
- **Counter-embodies:** Simplicity — dual representations double the surface area.
- **State:** Alive as Enso (commercial data tool).
- **For OpenLight:** Two views of one structure, editable from either side — a concrete implementation of projectional editing outside academia.

### 32. Inkle / ink, Twine
Narrative tools that became inadvertent UI paradigms — branching passage graphs with inline scripting. Twine especially is a folk tool.
- **Embodies:** Folk-like, transparency (passage graph is visible).
- **Counter-embodies:** Multidimensional (still linearizable).
- **State:** Alive.
- **For OpenLight:** Passage-as-chunk with visible edge structure; a folk-accessible authoring affordance worth studying.

### 33. Beaker Browser / Hypercore / local-first UIs
A browser and stack built around the premise that each user runs a node, data is local-first, and apps are small static bundles. The UI paradigm: "your device is the substrate."
- **Embodies:** Knowledge-as-identity, transparency.
- **Counter-embodies:** Folk-like — local-first still demands literacy.
- **State:** Beaker archived; Hypercore alive; Ink & Switch continues research.
- **For OpenLight:** Architectural kinship with a substrate-first view of software. Ink & Switch essays (local-first, Peritext, Potluck) are directly relevant.

### 34. Potluck (Ink & Switch)
An experiment in *incremental formalization*: start with prose, gradually annotate parts of it into structured data that gains live behaviors (totals, lookups, graphs) without leaving the text.
- **Embodies:** Folk-like, transparency, uncovered.
- **Counter-embodies:** None obvious within its scope.
- **State:** Alive as research (inkandswitch.com).
- **For OpenLight:** *The* canonical model for "meaning emerges from structure added to prose." Worth treating as a north-star reference.

### 35. Kartik Agaram's Mu / freewheeling apps
Agaram's "freewheeling apps" philosophy: tiny programs you can read in an afternoon and modify the source of, distributed as a single file. A deliberately folk-scale software ethos.
- **Embodies:** Folk-like, transparency, simplicity.
- **Counter-embodies:** Multidimensional — individual apps, not a field.
- **State:** Alive (akkartik.name).
- **For OpenLight:** A scale discipline — chunks should be readable in an afternoon. Agaram's essays on "convivial software" echo Illich and are aligned with folk-like values.

### 36. Webstrates
Research system where any DOM element in a shared webpage is collaboratively editable, persistently stored, and can be "transcluded" (imported live) into other documents. The browser becomes a shared Morphic.
- **Embodies:** Multidimensional, transparency, knowledge-as-identity.
- **Counter-embodies:** Folk-like — research prototype.
- **State:** Dormant-ish (Klokmose et al., Aarhus).
- **For OpenLight:** A concrete architecture for "shared live documents as substrate" in web tech.

## IX. Worth a shorter note

### 37. NewtonScript / Newton OS "soups"
Soups are schemaless typed stores; the OS-level data model was chunks-with-frames long before JSON. An early pass at substrate thinking.

### 38. BeOS Tracker / OpenDoc / Apple's OpenDoc
Component-document architectures where a single document embeds editors from many apps. OpenDoc's failure is instructive — too much ceremony, not folk-enough.

### 39. Engelbart's NLS/Augment
The "mother of all demos" foundation — not just mouse and hypertext, but *view specs*, shared-screen telepresence, structured outlines, and a philosophy of augmenting collective intellect. Still under-mined.

### 40. Boxer (Hal Abelson)
Logo's successor: a programming environment where everything is a "box" — code, data, UI — nested visibly. Boxes are chunks that *look* like what they are.

### 41. Croquet's Squeak predecessor: EToys
Squeak EToys for children: scripting via tiles, live world. The lesson: tiled visual programming works for specific age/context, fails to generalize.

## Cross-cutting threads worth naming (from Part I)

Patterns that recur across many entries above:

- **Live image** (Smalltalk, Emacs, Lively, Genera) — no boundary between authoring and running.
- **Presentation types** (Genera, Morphic halos, GToolkit inspectors) — every rendered thing is a handle.
- **Claims/facts substrate** (RealTalk, datalog-backed systems) — chunks publish typed claims; behavior emerges from subscriptions.
- **Projectional editing** (MPS, Hazel, Subtext, Enso) — the structure is the truth; rendering is a choice.
- **Incremental formalization** (Potluck, Inform 7, spreadsheets) — prose gains structure and behavior progressively.
- **Plumber/dispatch** (Acme, command palettes, intent-first AI UIs) — typed text routes to handlers.
- **Transclusion with provenance** (Xanadu, TiddlyWiki, Roam) — inclusion-by-reference as first-class.
- **Folk-scale source** (Mu, Decker, HyperCard) — the whole thing readable in an afternoon.

## Key references to pull on (from Part I)

- Jonathan Edwards — *Subtext* and the Alarming Development blog
- Ink & Switch essays: Local-First, Peritext, Potluck, Embark, Capstone
- Bret Victor — *Magic Ink*, *Learnable Programming*, *Dynamicland Communications*
- Feder Chiș — *Moldable Development* (book)
- Alan Kay — *The Early History of Smalltalk*, Viewpoints Research Institute
- Ted Nelson — *Literary Machines*, *Computer Lib / Dream Machines*
- Kartik Agaram — akkartik.name essays on convivial software
- Rob Pike — *Acme: A User Interface for Programmers*
- Chris Granger — Eve post-mortem
- Klokmose et al. — *Webstrates*

---

# Part II — Non-mainstream / emerging languages with UI stories

### Gleam
- **UI story**: Lustre — Elm-like architecture (model/update/view) that compiles to JS for browser or runs on BEAM for server-rendered components. Shares stdlib with BEAM languages.
- **Renders to**: DOM (via VDOM); server-side streaming HTML.
- **Folk-likeness**: Very clean, small syntax; friendly compiler errors explicitly modeled on Elm. Type inference with explicit annotations encouraged. Low keyword count.
- **Production readiness**: Gleam 1.0 (2024) is stable; Lustre is pre-1.0 but actively used. Ecosystem small but coherent.
- **Distinctive**: Targets both JS and Erlang VM from the same source; UI components can run on either side of the wire with the same model/update/view.

### Roc
- **UI story**: Roc's "platforms" model — a platform can expose a UI host. Experimental platforms for HTML/DOM and for native (examples with raylib, Breakout). No flagship UI library yet.
- **Renders to**: Platform-defined; examples include raylib (GPU), HTML, terminal.
- **Folk-likeness**: Syntax is deliberately uncluttered; no type-class boilerplate, pure-functional with opaque effects. The "platforms" split gives beginners a prepared runway.
- **Production readiness**: Pre-1.0, no package versioning yet; "not recommended for production." UI story is in-progress examples, not a library.
- **Distinctive**: Platforms — the runtime is authored in a systems language (Rust/Zig) and delivered as an artifact; app code is pure Roc and trivially portable across platforms.

### Mojo
- **UI story**: None intrinsic. Mojo is aimed at AI/systems performance; UI would go through Python interop.
- **Renders to**: N/A directly; any Python UI lib (Tkinter, PyQt, Textual, Gradio) via interop.
- **Folk-likeness**: Python-superset surface, but the parts that matter for performance (`fn`, `struct`, `owned`, `inout`, lifetimes) are closer to Rust in complexity.
- **Production readiness**: Closed-source pieces opening up gradually; not a UI language today.
- **Distinctive**: Value proposition is MLIR-backed compilation speed, not surfaces.

### Grain
- **UI story**: None native. Compiles to WebAssembly so can interop with JS/DOM from the browser side, but no idiomatic UI library exists.
- **Renders to**: N/A; via Wasm host.
- **Folk-likeness**: ML-family syntax, readable, strong inference, pattern matching. Approachable if the reader already knows OCaml/ReasonML.
- **Production readiness**: Early, experimental language. No production UI story.
- **Distinctive**: Designed around Wasm as the native target from day one; a candidate for sandboxed invocable payloads rather than UI.

### Nim
- **UI story**: Several. NimX (pure-Nim, cross-platform OpenGL), Fidget (vector GPU UI by Treeform, same author as Pixie), Genny + wrappers for GTK/Qt/wxWidgets, Karax (SPA via DOM), Owlkettle (GTK4 declarative).
- **Renders to**: OpenGL (Fidget/NimX), DOM (Karax), native GTK/Qt (Owlkettle, wrappers), terminal (illwill).
- **Folk-likeness**: Python-ish indentation-based syntax, macros that can be quite folky or quite hermetic. Learning curve friendly at surface; macro system deep.
- **Production readiness**: Fidget and NimX are usable but small-ecosystem. Karax is stable for SPAs. Owlkettle is actively developed.
- **Distinctive**: Treeform's stack (Pixie, Fidget, Boxy, Vmath) is a one-person vector-GPU UI ecosystem that's unusually coherent; Fidget inspired Figma's internals.

### Crystal
- **UI story**: Very thin. LibUI bindings, crsfml (SFML), some GTK bindings. No flagship UI library.
- **Renders to**: Whatever the binding wraps (SFML, GTK, etc.).
- **Folk-likeness**: Ruby-like syntax, compiled, type-inferred. Friendly to read, fewer UI-specific idioms to learn.
- **Production readiness**: Language is mature; UI story is not.
- **Distinctive**: Crystal ships a type checker with inference good enough to look like Ruby but produce native binaries — interesting for CLI-invocable contracts more than UI.

### Elixir
- **UI story**: Phoenix LiveView (server-rendered stateful HTML over WebSocket), LiveView Native (same model for iOS/Android/SwiftUI/Jetpack surfaces), Scenic (native GPU UI on OpenGL, runs on Nerves embedded too).
- **Renders to**: DOM (LiveView), SwiftUI/Jetpack Compose (LiveView Native), OpenGL (Scenic), terminal.
- **Folk-likeness**: Dynamic, friendly syntax with pattern matching; pipe operator is famously folk-ergonomic. No types but very readable.
- **Production readiness**: LiveView is heavily production-proven. Scenic is mature for embedded/kiosk. LiveView Native is newer but shipping.
- **Distinctive**: LiveView treats the server as the single source of truth and diffs HTML over the wire — architecturally the same UI model drives web and native targets. BEAM gives per-user process isolation for free, which is architecturally similar to per-chunk agents.

### Clojure / ClojureScript
- **UI story**: ClojureScript + Reagent / Re-frame / Helix / UIx over React; Electric Clojure (reactive DSL that spans client/server). Native: cljfx (JavaFX), seesaw (Swing), Humble UI (Skia-based, desktop-first, by Tonsky).
- **Renders to**: DOM (via React), JavaFX/Swing (native desktop), Skia (Humble UI).
- **Folk-likeness**: Lisp syntax is a learning barrier for some, but the resulting code is very regular. Data-first philosophy is folky once you're past the parens — UI is just a function from data to hiccup.
- **Production readiness**: Re-frame is heavily production-proven. Humble UI is pre-1.0 but Tonsky ships it.
- **Distinctive**: Hiccup (`[:div {:class "x"} "hi"]`) makes UI indistinguishable from data; views and the data that produced them are literally the same form. Very aligned with "views as chunks in a typed field."

### ClojureDart
- **UI story**: Clojure compiled to Dart; uses Flutter directly.
- **Renders to**: Skia via Flutter.
- **Folk-likeness**: All the benefits of Clojure with Flutter's batteries.
- **Production readiness**: Experimental but functional; Roman Liutikov and Tensegritics ship demos.
- **Distinctive**: A way to get Flutter's rendering without Dart's syntax; still niche.

### Common Lisp
- **UI story**: McCLIM (Common Lisp Interface Manager — presentation-based UI, genuinely unusual), LispWorks CAPI, Ltk (Tk binding), Clog (web via Websockets like LiveView).
- **Renders to**: X11 (McCLIM), native (CAPI commercial), Tk, DOM (Clog).
- **Folk-likeness**: S-expressions; powerful REPL and image-based development are very folk-friendly once the syntax clicks.
- **Production readiness**: McCLIM runs but is niche; CAPI is commercial and mature; Clog is active.
- **Distinctive**: McCLIM's **presentation types** — every rendered object carries its type, and the UI dispatches commands based on what you click. Essentially "typed field + interface" as a 1980s UI paradigm. Directly relevant.

### Racket
- **UI story**: Built-in `racket/gui` (native widgets on all platforms), `pict` for compositional graphics, `2htdp/universe` for beginner interactive programs. DrRacket itself is built in it.
- **Renders to**: Native widgets (GTK/Cocoa/Win32), Cairo for custom drawing.
- **Folk-likeness**: "Language-oriented programming" — Racket invites you to build a little language for your problem. 2htdp is explicitly designed for teaching programming to beginners.
- **Production readiness**: `racket/gui` is stable and cross-platform.
- **Distinctive**: Bootstrapping teaching languages (Beginner Student Language, etc.) within the same runtime shows what folk-like scaffolding can look like. Pict-as-values (graphics are data you can combine) is very OpenLight-shaped.

### Scheme
- **UI story**: Scattered. Gambit + LambdaNative (cross-platform mobile), Chicken eggs for GTK, Guile-GTK, Gerbil. Chez Scheme has nothing native.
- **Renders to**: GTK mostly; LambdaNative compiles to mobile native.
- **Folk-likeness**: Smallest Lisp dialect; minimal syntax, lots of implementations with differing quality.
- **Production readiness**: Fragmented.
- **Distinctive**: LambdaNative produces real iOS/Android apps from Gambit Scheme — niche but proven for medical devices.

### Red
- **UI story**: VID (Visual Interface Dialect) — a domain-specific language embedded in Red for UI, descendant of Rebol's Visual Interface.
- **Renders to**: Native widgets per platform (Win32, GTK, macOS target incomplete).
- **Folk-likeness**: Possibly the most folk-targeted language on this list. One-binary toolchain (~1 MB), no dependencies, literal English-like syntax: `view [text "Hello" button "Click" [print "hi"]]`.
- **Production readiness**: Red's macOS/64-bit compiler has been stalled for years; project has struggled. Linux/Windows UI works but compiler story is shaky.
- **Distinctive**: Entire "dialect" concept — the language is built from embedded DSLs — is exactly the OpenLight invocable-typed-field shape, but predates it by a decade. Worth reading even if not adopting.

### OCaml
- **UI story**: Revery (Native, React-model, by Outrun Labs — powered Onivim 2), Brisk (discontinued React-native-for-OCaml), Bonsai (by Jane Street, Incremental-based web framework), Tyxml, Ocsigen/Eliom (full-stack web). Historical: Labltk, LablGtk.
- **Renders to**: Skia (Revery), DOM (Bonsai, Ocsigen), GTK, Tk.
- **Folk-likeness**: ML syntax is clean but not mainstream-familiar; strong inference. Bonsai requires understanding functors. Revery reads like React + OCaml types.
- **Production readiness**: Revery powered Onivim but Outrun Labs is quiet now. Bonsai is production inside Jane Street, open-source but Jane-Street-shaped.
- **Distinctive**: Bonsai is incremental-computation-first — components are `Value.t` and `Computation.t`, and the framework only recomputes what changed. Algebraically clean.

### ReasonML / ReScript
- **UI story**: Same as OCaml via the ReScript (ex-BuckleScript) compiler; React bindings are first-class. ReScript is currently the living branch.
- **Renders to**: DOM via React.
- **Folk-likeness**: JS-ish syntax on an ML core; arguably the friendliest typed-functional surface.
- **Production readiness**: ReScript + React is shipped at Facebook/Messenger-scale historically; still active.
- **Distinctive**: ReScript diverged from OCaml syntactically to feel like JS; the compiler emits very readable JS.

### F#
- **UI story**: Fabulous (Elmish model for .NET MAUI/Xamarin/Avalonia), Avalonia.FuncUI (Elmish for Avalonia), Elmish.WPF, Bolero (Elmish + Blazor for WebAssembly), Feliz (React bindings for Fable).
- **Renders to**: Native via MAUI/Avalonia (Skia), DOM (Fable + React), WebAssembly (Blazor).
- **Folk-likeness**: F# syntax is approachable ML with light indentation; pipe operator is the daily driver. Type providers make external data folk-like.
- **Production readiness**: Avalonia.FuncUI and Fabulous are shipping; Bolero is stable.
- **Distinctive**: Avalonia itself is a Skia-based cross-platform framework that runs anywhere .NET runs, including browser (via Blazor) — a single widget tree across web + desktop + mobile.

### Haskell
- **UI story**: GI-Gtk (auto-generated GObject bindings, declarative via gi-gtk-declarative), Reflex / Reflex-DOM (functional reactive programming for web), Monomer (SDL-based, Elm-ish, desktop-native), Threepenny-GUI, Miso (Elm-like, Haskell-to-JS via GHCJS).
- **Renders to**: GTK (GI-Gtk), DOM (Reflex, Miso), SDL (Monomer), browser-via-WebSocket (Threepenny).
- **Folk-likeness**: Haskell syntax is terse but the type errors and monad transformer stacks are a real wall. Monomer's API is the friendliest entry.
- **Production readiness**: Reflex is battle-tested by Obsidian Systems; Monomer is usable; GI-Gtk is stable.
- **Distinctive**: Reflex is the canonical **functional reactive programming** implementation — `Event t a` and `Behavior t a` give a denotational model of UI state over time that predates and cleanly generalizes signals/hooks.

### Elm
- **UI story**: Elm's own. The language IS a UI language for the browser — model/update/view is the one blessed architecture.
- **Renders to**: DOM (via its own VDOM).
- **Folk-likeness**: Famously the friendliest compiler errors in computing; syntax minimal; explicit tradeoff against power (no typeclasses, no higher-kinded types) for beginner-friendliness.
- **Production readiness**: Language essentially frozen since 2019 (0.19.1). Works well for what it does; community split about stewardship.
- **Distinctive**: "The Elm Architecture" is the most transferable idea in UI of the last decade — Redux, Fabulous, FuncUI, Lustre, Iced, and more are all Elm. Transferable absolutely yes; writing actual Elm is another question.

### Lua
- **UI story**: Love2D for games (immediate-mode + draw callbacks), LÖVE's SLAB/LoveUI libraries, Nuklear bindings, Dear ImGui bindings (cimgui-love), OpenResty/Kong for server-side but no UI. AwesomeWM is Lua-scripted.
- **Renders to**: OpenGL (Love2D), immediate-mode (ImGui/Nuklear).
- **Folk-likeness**: Tiny language, 8 types, learnable in an afternoon. Tables-as-everything is maybe the most folk-like data model on this list.
- **Production readiness**: Love2D for small games is solid; for "apps," immediate-mode is the mode.
- **Distinctive**: Lua is the embedded-scripting default precisely because it's tiny and unopinionated; good candidate for invocable-script language regardless of rendering.

### Fennel
- **UI story**: Fennel compiles 1:1 to Lua, so inherits all of Lua's UI ecosystem, with Lisp syntax.
- **Renders to**: Whatever Lua renders to.
- **Folk-likeness**: Lisp syntax over a folk-like runtime.
- **Production readiness**: Mature, shipped in games (TIC-80).
- **Distinctive**: Exists because someone wanted Clojure-style macros over Love2D.

### Pharo Smalltalk
- **UI story**: Morphic (direct-manipulation UI — every pixel is a live object you can inspect and modify), Bloc (next-gen morphic with Skia backend), Spec 2 (application framework on top of Morphic/Bloc). GT (Glamorous Toolkit) is the flagship: moldable development environment where views are composed per object per use case.
- **Renders to**: Morphic canvas (native), Skia (Bloc/GT).
- **Folk-likeness**: Smalltalk syntax is genuinely tiny (~5 keywords). Image-based development — everything live, everything inspectable, no separation between editor and program.
- **Production readiness**: GT ships as a usable IDE; Pharo's own tooling is written in itself. Production for "apps shipped to users" is rare.
- **Distinctive**: Deepest alignment with OpenLight on this list. **Moldable development** (Glamorous Toolkit) — every domain object declares its own views (`gtViewFor: aView`), so inspecting a chunk shows a view *native to that chunk's type*. This is "views as invocables on typed chunks," already shipped, with 50 years of runway. Read Andrei Chiș and Tudor Girba.

### Julia
- **UI story**: Makie.jl (high-quality plotting + scenes, GPU-accelerated), Pluto.jl (reactive notebooks — cells form a DAG and auto-rerun), Genie.jl (web framework + Stipple for reactive UIs), GLMakie/WGLMakie/CairoMakie backends, QML.jl, Gtk.jl.
- **Renders to**: OpenGL (GLMakie), WebGL (WGLMakie), Cairo, Qt, GTK, DOM via Stipple.
- **Folk-likeness**: Julia syntax is math-like and dynamic; multiple dispatch is the one big idea. Readable for scientists; the performance edge cases (type stability) leak out.
- **Production readiness**: Makie is production-quality scientific viz. Pluto is the standard reactive notebook. UI-as-apps story is thinner.
- **Distinctive**: Pluto's reactive DAG model for notebooks is conceptually the same as typed-field-with-dependencies — cells/chunks that update each other via dataflow. Worth studying.

### Dart beyond Flutter
- **UI story**: Outside Flutter, Dart has almost no UI story. AngularDart is discontinued. Dart web (dart2js) exists but nobody uses it without Flutter Web.
- **Renders to**: N/A outside Flutter.
- **Folk-likeness**: Syntax is Java/JS-like; unremarkable.
- **Production readiness**: Non-Flutter Dart UI is a desert.
- **Distinctive**: Dart's value is entirely tied to Flutter's Skia pipeline; separating them removes the reason to pick Dart.

### Kotlin Multiplatform
- **UI story**: Compose Multiplatform — JetBrains's port of Jetpack Compose to desktop (Skia), iOS (Skia/UIKit interop), web (Wasm/Skiko), Android (native). Same `@Composable` functions across all targets.
- **Renders to**: Skia (desktop, web, iOS), native Android on Android.
- **Folk-likeness**: Compose's declarative composable-function model is quite folk-ergonomic once you accept the `@Composable` magic. Kotlin itself is approachable.
- **Production readiness**: Desktop is 1.x stable. iOS went stable in 2024. Web is beta.
- **Distinctive**: The same function is your UI on five platforms; this is Flutter's pitch but with Skia all the way down and no Dart. Closest mainstream-adjacent competitor to Flutter.

### Raku
- **UI story**: Very thin. GTK::Simple, some Qt bindings, Cro for web (API-focused, not UI-focused).
- **Renders to**: GTK.
- **Folk-likeness**: Raku has rich, sometimes baroque syntax; grammars are a unique feature. "Folk-like" is subjective — powerful but not minimal.
- **Production readiness**: Low for UI.
- **Distinctive**: Grammars (first-class PEG parsers) make Raku extraordinary for *parsing* folk input — relevant for invocable argument surfaces, not rendering.

### Io
- **UI story**: Historical Io had a canvas/UI via bindings; nothing current.
- **Renders to**: N/A today.
- **Folk-likeness**: Pure prototype-based, tiny syntax — every expression is a message send. Conceptually adjacent to Smalltalk.
- **Production readiness**: Essentially dormant since ~2010.
- **Distinctive**: Historical interest only. The prototype-everything model and message-passing-as-sole-primitive is close to OpenLight's "everything is a chunk" ethos.

### Pony
- **UI story**: None significant. Pony is an actor-model systems language with capabilities-based references; no UI library exists.
- **Renders to**: N/A.
- **Folk-likeness**: Reference capabilities (`iso`, `val`, `ref`, `box`, `trn`, `tag`) are a genuine new concept to learn — not folk-like.
- **Production readiness**: Niche; UI story absent.
- **Distinctive**: Per-actor heaps, no data races by construction. Interesting for concurrent agent runtimes, not UI.

### Vale
- **UI story**: None; language is a research/design-stage systems language around "generational references" for memory safety without a borrow checker.
- **Renders to**: N/A.
- **Folk-likeness**: Aims to be more approachable than Rust while being memory-safe; still pre-alpha.
- **Production readiness**: Not yet.
- **Distinctive**: Worth watching; no UI relevance today.

### Zig (revisit via Mach)
- **UI story**: Mach engine (Stephen Gutekanst) — modular game/graphics engine in Zig. Mach Core provides a window + wgpu surface; `mach-gfx`, `mach-ui` (sketched), sysaudio, freetype, sysjs. Capy is a cross-platform native widget lib. Dear ImGui bindings exist.
- **Renders to**: wgpu (Mach → Vulkan/Metal/DX12/WebGPU), native widgets (Capy), immediate-mode (ImGui).
- **Folk-likeness**: Zig syntax is explicit and simple; no hidden control flow. But manual memory management and comptime are real cognitive load.
- **Production readiness**: Mach is pre-1.0 but Hexops ships against a fixed Zig version. Capy is alpha. Ecosystem in flux as Zig itself hasn't hit 1.0.
- **Distinctive**: Mach is one of the few projects building a full creative-computing stack (engine, UI, audio, text) in a modern systems language rather than wrapping an old one. `mach-sysjs` lets Zig call into JS idiomatically — interesting for web targets from a systems language.

### Additional ones worth noting given the framing

### Unison
- **UI story**: None yet. But Unison's content-addressed code model — every function identified by its AST hash, stored in a code database rather than files — is unusually aligned with "invocables as chunks in a field."
- **Renders to**: N/A.
- **Distinctive**: If OpenLight's chunks are content-addressed, Unison is the closest existing language ontology.

### Hazel
- **UI story**: Hazel is itself an IDE written in ReasonML that renders edit states for incomplete programs in the browser; not a UI framework you'd use, but a UI you'd learn from.
- **Renders to**: DOM.
- **Distinctive**: **Every program state, including syntactically incomplete ones, has a meaning.** Typed holes propagate. This is directly relevant to projecting a view from a partial typed field.

### Inko
- **UI story**: None; concurrent systems language with capability-typed references, similar territory to Pony.
- **Distinctive**: Not UI-relevant, but an interesting "approachable Pony" if agent concurrency matters.

### Idris / Lean 4
- **UI story**: Lean 4 has `ProofWidgets` — widgets rendered in VS Code that can be interactive and dependently typed. Idris has almost nothing.
- **Renders to**: VS Code webview (Lean).
- **Distinctive**: Lean's widget system is literally "typed invocables with rendering surfaces in an editor," with dependent types as the field. Worth a look if dependent typing enters the picture.

### Notes on confidence (from Part II)

Pharo/GT, Elm, Reflex, Clojure/Hiccup, McCLIM, and Red are the ones where the architecture directly mirrors OpenLight concepts. Mojo, Dart-beyond-Flutter, Raku, Io, Pony, Vale, and Grain have effectively no UI story today. Lean 4 ProofWidgets and Hazel were added beyond the original list because they seemed load-bearing for "typed-field-projects-a-surface."

---

# Part III — Folk-Like UI Systems: Historical Grounding

A survey of historical UI layers that ordinary people genuinely wielded — not just used, but composed and extended. For each: primitives, audience, why it did or didn't take hold at folk level, and what OpenLight might absorb structurally. Synthesis at the end.

This is exploration, not recommendation. The bias throughout is toward systems that actually escaped their original users.

## HyperCard (1987, Bill Atkinson, Apple)

**Primitives.** *Stack* (a document), *card* (a page in the stack), *background* (shared across cards), *field* (editable text), *button* (clickable area), and *HyperTalk* scripts attached to any of the above. Every object answered messages (`on mouseUp`, `on openCard`, etc.). One scripting model, one object hierarchy, one inspector.

**Audience.** Explicitly "programming for the rest of us." Atkinson wanted anyone who could use a Mac to be able to build with it. Bundled free with every Mac for years.

**Folk adoption.** Probably the most successful end-user authoring medium ever shipped on general-purpose hardware. Teachers made curricula, kids built adventure games (Myst shipped as a HyperCard stack), librarians built catalogs, doctors built clinical reference tools. Ran on millions of machines; spawned a cottage economy of stacks traded on BBSes and floppies.

**Why it worked.** Three factors that recur everywhere below:
- *Visible objects with uniform inspection.* A card was a thing you could see, select, and script. "What is this?" and "how does it work?" had the same answer.
- *HyperTalk read like English* but was a real programming language. The syntax forgave: `put "hello" into field "greeting"` worked.
- *Flat distribution.* A stack was a single file. You could share it. No installer, no build step.

**Why it faded.** Color arrived late; the web ate it; Apple lost interest; no sanctioned path to the internet. It died of neglect, not of user rejection.

**For OpenLight.** The *uniform inspector* is the lesson. Every object — card, field, button — answered the same question structurally. OpenLight's field is a better version of that premise: every chunk carries its own type. The HyperCard-scale risk is that if OpenLight wants folk composition, *there must be a single, obvious way to say "show me what this is and how to change it."* HyperCard's right-click-to-inspect was that handle.

## VisiCalc (1979) and early spreadsheets

**Primitives.** *Cell* (identified by column/row), *value*, *formula referencing other cells*, *recalc*. That is the whole model. Three primitives, one update rule.

**Audience.** Accountants and managers who had pencils and ledger paper. Bricklin watched a professor manually recompute a projection and recognized the tedium as a computable shape.

**Folk adoption.** The first killer app. Millions of non-programmers became, functionally, programmers — writing declarative dataflow, debugging dependency chains, composing sheets. Excel today is, by count of users writing formulas, the largest programming language community on Earth.

**Why it worked.**
- *The primitive matches the mental model people already had.* Ledger paper was already a grid of cells; the spreadsheet just made the grid reactive.
- *Dataflow is hidden from the author.* You write `=A1+B1`; the engine figures out when to recompute. No event loop to learn.
- *Incrementalism.* You can build a working sheet with one formula, then two, then twenty. Never a moment where "now you must learn programming."
- *Visibility.* Every intermediate value is shown. Debugging is looking.

**Costs paid.** No abstraction over sheets (Excel adds it crudely, sometimes). No versioning native to the medium. Enormous error rates in production spreadsheets (Reinhart-Rogoff, countless financial disasters). The primitive's simplicity caps the ceiling in certain dimensions — structural refactoring especially.

**For OpenLight.** *Incrementalism and reactive visibility.* The spreadsheet never forces you to commit to a program; you commit to one cell at a time, and the consequences are visible. The field-with-derived-interfaces model could take this: a user types a value, a dispatch surface lights up because the type matched, no ceremony. Also: the spreadsheet's failure mode (untraceable relationships, no provenance) is exactly what OpenLight's *transparency of relationships* value forbids. OpenLight gets to keep the reactivity and refuse the opacity.

## Smalltalk (1972–, Kay, Ingalls, Goldberg et al., Xerox PARC)

**Primitives.** *Object* (with state and behavior), *message* (how you ask an object to do anything), *class* (an object that makes objects), *block* (first-class code). The image itself — the entire running system — is inspectable and editable live.

**Audience.** Kay's stated target was *children*. The Dynabook vision (1972) was a computer for learners. The reality was that Smalltalk mostly reached professional programmers who recognized its power.

**Folk adoption.** Mixed. Etoys (see below) and Scratch descendants did reach children; Smalltalk itself did not, at scale. The image was too much machinery; the medium of distribution (the whole image) was too heavy; the platform was commercially locked for years.

**Why the children-first vision underperformed.** The system was philosophically folk-like (uniform, live, inspectable) but the *surface area* to learn before productive work was large. HyperCard's English scripts were easier to start; the spreadsheet's grid was easier to start; Smalltalk asked you to understand objects, messages, and an IDE before you saw results.

**What it got structurally right.**
- *Live system, no distinction between authoring and running.* This is the highest-water mark. You could halt, change a method, resume. The field in OpenLight has the same ambition at the data/contract layer.
- *Uniformity.* Everything was an object answering messages. One concept, many uses.
- *Self-hosted.* The IDE was written in Smalltalk, visible, modifiable.

**For OpenLight.** *Self-description as the load-bearing property.* Smalltalk's image described itself to itself; OpenLight's field does the same at the substrate layer. The cautionary tale is the onboarding cliff — self-description alone does not deliver folk-level unless the first thing a newcomer sees is *small enough to wield*.

## Squeak Etoys (1996–, Kay, Ingalls, Kim Rose, Scott Wallace)

**Primitives.** *Sketch* (a drawing), *script tile* (a colored block representing one operation), *viewer* (the pane of everything an object can do), *phrase* (a row of tiles that together make a statement). Drag tiles from the viewer to compose.

**Audience.** 8–12 year olds. Deployed at scale via the OLPC project.

**Folk adoption.** Real within its target: hundreds of thousands of children used Etoys to make interactive simulations, often without adult help. Not folk-universal; it assumed a certain kind of classroom or curious child.

**What it got right.**
- *The viewer.* Kay's formulation: if you can see an object, you can see everything it can do, laid out in rows. No hunting in menus.
- *Drag-to-script.* The act of programming was the same motor action as moving a thing on screen.
- *Physics-first, then generalization.* Kids animated turtles before they thought of themselves as programmers.

**For OpenLight.** The viewer pattern is strong. A chunk with a type has a known contract — the interface can render "everything you can do with this chunk" as tiles. OpenLight's *interface derived from types* is structurally the same move.

## Scratch (2007–, Resnick, Maloney, MIT Media Lab)

**Primitives.** *Sprite* (an object with costumes and scripts), *stage* (the shared world), *block* (a shape-coded statement), *hat block* (event trigger), *category* (motion, looks, sound, control, sensing, operators, variables). Blocks *fit together only in valid shapes* — syntax errors are physically impossible.

**Audience.** Kids and newcomers broadly. Explicit "low floor, wide walls, high ceiling" goal (from Papert, via Resnick).

**Folk adoption.** Over 100 million registered users. The block-based idiom has spread to Snap!, Blockly, App Inventor, code.org — effectively the default lingua franca for teaching programming.

**Why it worked.**
- *Syntactic impossibility of invalid programs.* The jigsaw-piece shape of blocks means you can't make a grammatical error. Novice friction drops enormously.
- *Social substrate.* Projects are remixable by default. Every project is a source-visible, forkable unit. The folk ecology formed because sharing was structural, not bolted on.
- *Concrete objects.* A sprite you can see is a better teaching handle than a variable you can't.

**Costs paid.** Blocks hit a ceiling for any serious program. The social platform itself is what gave it scale — much of Scratch's folk-ness is *community architecture*, not just the language.

**For OpenLight.** *Remixability as the unit of distribution.* If a chunk is self-describing and traceable, sharing a scope is analogous to sharing a Scratch project — a forkable, readable unit. The folk dimension of "I saw what someone else built, I tweaked it, I published mine" is something OpenLight could have cheaply given the substrate's shape, and Scratch is the proof that this mechanism alone drives adoption.

## Logo (1967, Papert, Feurzeig, Solomon)

**Primitives.** *Turtle* (an agent with position and heading), *command* (`forward 50`, `right 90`), *procedure* (named sequence with parameters), *recursion*. That is functionally it.

**Audience.** Children. Papert's constructionism was the frame: learners build their understanding by building artifacts.

**Folk adoption.** Enormous educational reach from the late 70s to the 90s; direct ancestor of Scratch, Etoys, Logo-like turtles everywhere. Never captured adults beyond education.

**What it got right.**
- *An agent body.* The turtle is something you can empathize with. "Where would I go next?" is a question a child can answer.
- *Direct manipulation as first step, programming as second step.* You type `forward 50`, the turtle moves. Feedback is immediate and physical-feeling.
- *Procedures as storable verbs.* Once you have `square`, you can ask the turtle to `square` like any other primitive. Abstraction is seamless with primitives.

**For OpenLight.** The *agent-with-a-body* pattern maps onto OpenLight's vision of archetypes. An agent in the field with a scope, a purpose, a visible face is closer to Logo's turtle than to a conventional command-line tool. Making that body *visible and directly addressable* is a folk-level move.

## Excel Formulas

**Primitives.** *Cell reference*, *function*, *range*, *named range*, more recently *dynamic arrays*, *LAMBDA*, *LET*.

**Audience.** Everyone with a job. Finance, operations, research, logistics, wedding planning.

**Folk adoption.** Total. The most-used programming language by volume of practitioners. Most of the world's critical business logic runs here.

**Why it is folk-like in a way almost nothing else is.**
- *The program and its data are indistinguishable.* A cell is both input and output; the "program" is a view on the sheet.
- *Radical tolerance of wrong.* A malformed formula shows `#REF!` in one cell and everything else keeps working. No total-system failure.
- *Discovery through autocomplete and fill-down.* You learn `VLOOKUP` because the function picker suggested it and the yellow tooltip walked you through argument order.

**Costs paid.** No modularity at the right scale. No source control. Tight coupling between layout and logic. The same features that enable folk composition limit refactoring.

**For OpenLight.** *Tolerance of partial correctness* may be under-weighted in systems with strong types. OpenLight commits to the field enforcing its own integrity — good — but if that enforcement is rigid, the first mistake costs more than the first success, and folk adoption collapses. Excel's genius is that `#REF!` is a local, recoverable, visible state. The field's contract-validation needs an analogous local-failure mode.

## UNIX Shell

**Primitives.** *Process*, *file*, *stream (stdin/stdout/stderr)*, *pipe*, *exit code*. Commands are small programs reading streams and writing streams.

**Audience.** Originally Bell Labs researchers; ended up everyone who runs a server, writes a build script, or lives in a terminal.

**Folk adoption.** Within the technically curious: total. Outside that tier: low. Shell is folk-like for a specific folk — programmers and sysadmins — and gatekept from general users by the terminal surface itself.

**What it got right structurally.**
- *One composition operator: `|`.* Learn it once; it works forever.
- *Text as lingua franca.* Every tool emits text; every tool reads text. This is the "substrate" all UNIX tools reach.
- *Small tools, sharp edges.* `grep`, `sort`, `uniq`, `awk` — each does one thing, each composes with everything else.

**What it gave up.** Typed data. Structured pipelines (PowerShell fixes this; most shells don't). A graphical folk surface. Discoverability for newcomers (`man` pages assume the vocabulary they explain).

**For OpenLight.** The single-operator composition lesson is the strongest. If OpenLight has *many* ways to compose, it is not folk-like. The field's dispatch — an invocable reading the field and writing back — is already shaped like a pipe. Making that *feel* like `|` to an end user (one gesture, one mental model) is the move.

## Plan 9 (1980s–90s, Bell Labs) — acme, rio

**Primitives.** *File* as universal interface (to processes, network, windows, devices — everything). *9P* as the one protocol that reached everything. *acme* as an editor where any text is executable: mouse-chording with text performs operations.

**Audience.** Systems researchers, a narrow cult.

**Folk adoption.** Did not achieve folk reach; too austere, too uncommercial, too willing to break with convention. But the *idea* has outsized influence on system designers.

**What it got right.**
- *One abstraction, everywhere.* If everything is a file, you can use file tools on it. Pike and Thompson pushed UNIX's "everything is a file" further than UNIX itself did.
- *acme's executable-text.* Any word in the editor can be a command; the editor has no fixed command palette. You extend by typing.
- *Composability of windows (rio).* Windows are first-class, programmable, tileable.

**For OpenLight.** *Text as directly executable at the surface* is a folk-like pattern if the surface is consistent. OpenLight's scope bar or command surface can absorb this: what I type *is* what the system does; there is no separate "command mode." Plan 9's cult status is a warning — pure structural elegance without a gradient of onboarding does not deliver folk-level.

## REBOL / Red

**Primitives.** *Dialect* (a small, domain-specific language expressed as data), *block* (code-as-data, Lisp-style), *word* (a value that can be a symbol, a binding, or a function), an all-in-one visual dialect (VID) for UIs.

**Audience.** Scripters and integrators. Sassenrath's pitch: every problem deserves its own dialect; REBOL lets you build one.

**Folk adoption.** Low. Beloved by its users, never broke out. Red continues the project.

**What it got right.**
- *Dialects as a folk-scale tool.* You don't write a parser; you lean on the substrate's parser and get a domain language for a few lines of code.
- *UI as a dialect.* A GUI is a block. Reading a UI spec is reading data.

**What held it back.** Ecosystem isolation; small community; closed-source legacy. Good ideas, wrong historical moment.

**For OpenLight.** *The UI spec is data in the same substrate as everything else.* This is exactly OpenLight's "interface derived from types" premise, arrived at from a different direction. REBOL is a data point that says: when UI is data, folk can modify it — not always, but often enough to matter.

## AppleScript / Shortcuts

**Primitives.** *Tell* (address a named application), *command* (verbs the app exposes), *dictionary* (the app's API, visible via Script Editor). In Shortcuts: *action* (a block), *variable* (flow between actions), *trigger*, the whole thing as a flowchart of drag-and-drop steps.

**Audience.** Mac/iOS users who want to automate without writing code.

**Folk adoption.** Moderate. AppleScript reached power users and IT admins but not general users; Shortcuts is reaching closer to folk, especially on iOS where no alternative exists.

**What it got right.**
- *App-as-object with a discoverable vocabulary.* Scriptable apps expose dictionaries; the user can read what's possible.
- *Natural-language leaning.* `tell application "Finder" to empty trash`.
- *Shortcuts removed the typing.* The drag-drop surface crossed the folk threshold AppleScript never quite did.

**What held AppleScript back.** Every app spoke its own dictionary poorly; cross-app composition was fragile; the language was weirder than it looked.

**For OpenLight.** *Dictionaries — the app's self-description — are the interface.* The app's shape is readable. OpenLight's invocables declaring typed inputs that the interface reads is the same pattern; the difference is OpenLight's substrate *enforces* the contract instead of AppleScript's "hope the dictionary matches reality."

## IFTTT / Zapier

**Primitives.** *Trigger* (a service emits an event), *action* (another service does something), *connection* (OAuth into a service), *variables flowing between steps*. Zapier adds multi-step, filters, paths.

**Audience.** SaaS users with no programming background.

**Folk adoption.** High at the primitive level (millions of zaps, applets). Hits a ceiling at multi-step orchestration where the interface gets overwhelmed.

**What it got right.**
- *Two-primitive composition (if this, then that) is graspable in thirty seconds.*
- *The web of services is the substrate,* and the folk tool just plumbs between them.
- *Templates (published zaps).* Social discovery does most of the heavy lifting — folk users browse, not compose.

**What held it back.** The underlying services don't share contracts, so every connector is hand-built; composition beyond trivial is brittle.

**For OpenLight.** The *template / browseable-scope* pattern is a folk-multiplier. If a scope is shareable and browseable, most folk users remix rather than compose from scratch. OpenLight's substrate has the shape for this; the ecosystem design decides whether it happens.

## Notion / Airtable

**Primitives (Notion).** *Block* (paragraph, heading, toggle, image, database, page), *page* as nested blocks, *database* as a typed collection of pages, *view* as a filter/sort/render over a database, *relation* and *rollup* for cross-database references.

**Primitives (Airtable).** *Base*, *table*, *field with type*, *view*, *linked record*, *formula field*.

**Audience.** Knowledge workers, small teams, side-project builders.

**Folk adoption.** Large and genuine. People who never touched a database run companies on Airtable. Notion templates are a folk economy.

**What they got right.**
- *Typed fields the user declares.* The user says "this column is a date," and the database enforces it. Light type system, folk-level.
- *Views as first-class objects.* Same data, different lens. This is structurally what OpenLight's "views are scopes" is after.
- *Everything remains visible.* The database is a table you can see and edit directly, not a schema you configure and then query.

**Costs paid.** Performance falls off a cliff at scale. Versioning is weak. Migration between types is painful.

**For OpenLight.** These are the closest living analogues to *interface derived from types* at folk-level. The lesson: when the user declares a type, the interface must update *live* and *locally*. A schema edit that requires a migration is not folk-like. OpenLight's type-in-the-field should be editable in place with the interface reconfiguring around it.

## Max/MSP, Pure Data

**Primitives.** *Object* (a box with inlets and outlets), *patch cord* (a connection), *message* (typed data flowing along cords), *patch* (the whole graph).

**Audience.** Musicians, media artists, installation builders.

**Folk adoption.** Total within the media-art community; zero outside. The community is a specific folk — not "general public," but also not professional software developers.

**What it got right.**
- *The graph is the program.* What you see is what runs. No hidden state, no background code.
- *Audio-rate vs. control-rate is visible in the primitive.* Cords are colored or styled to show what kind of signal.
- *Incremental patching.* Start with one oscillator and speaker; grow outward.

**What held it back (outside its niche).** Large patches become unreadable. Abstraction (subpatches) exists but is fiddly. The graph surface is dense.

**For OpenLight.** *The dataflow graph is a UI idiom that thrives when the domain is inherently about signal flow.* Not every OpenLight invocation needs a graph view, but *some* do — dispatch chains, multi-agent sessions, cross-scope derivations. Having the graph as *one* derived view (not the only view) is the structural right answer.

## LabVIEW

**Primitives.** *VI (virtual instrument)* — a function with a front panel (the UI) and a block diagram (the dataflow). *Wire* (typed connection), *terminal* (input/output), *subVI* (a VI used inside another VI).

**Audience.** Engineers and scientists, especially those with instruments to control.

**Folk adoption.** Substantial within its domain. Engineers who don't consider themselves programmers ship production test systems in LabVIEW.

**What it got right.**
- *Front panel and diagram as two views of the same thing.* The panel is the user-facing UI; the diagram is the program. One object, two lenses.
- *Typed wires.* You physically cannot connect a string output to a numeric input; the wire won't form.
- *Folk folk programming in a professional context.* Mechanical and electrical engineers who program in LabVIEW often don't identify as programmers, yet produce significant software.

**Costs paid.** Diagrams get huge fast. Source control is painful (binary format). The tooling is expensive and proprietary.

**For OpenLight.** *Two views of the same object — the user-facing surface and the internal structure — visible simultaneously.* OpenLight's interface-derived-from-types wants this. The "front panel vs. block diagram" split maps onto "what the operator sees vs. what the invocable contract declares."

## Glamorous Toolkit / Moldable Development (Tudor Gîrba et al.)

**Primitives.** *Object* with multiple *inspector views* (textual, tree, table, graph, custom), *Pharo Smalltalk image* as the live substrate, *GtDocument* (live, executable documentation), *example* (a runnable, testable sample for any method).

**Audience.** Developers working with unfamiliar systems. Aimed at professional use, not folk, but with folk-adjacent virtues.

**Folk adoption.** Small; professional niche. Belongs in this list because it is the most articulate modern expression of "every object teaches you how to inspect it."

**What it got right.**
- *Inspectors are authored with the thing.* When you add a new type, you add a view for it. The inspector is not one-size-fits-all.
- *Documentation is live and runnable.* Prose and code share the surface.
- *Moldable premise.* The tool changes shape to fit the problem, not the other way around.

**For OpenLight.** *Inspector views as part of the type.* If a type lives in the field, views of that type live in the field too. When the interface asks "how do I render this?", the field answers. This is the pattern OpenLight already aims at; Glamorous Toolkit is the closest operational proof that it works.

## Synthesis: What Recurs

Principles that repeat across the systems that genuinely reached folk:

**1. The primitive matches a mental model people already have.** Ledger (Excel). Card (HyperCard). Sprite (Scratch). Turtle (Logo). Room (Dynamicland). Block (Notion). The primitive does not introduce a new concept; it computerizes an old one. OpenLight's *chunk* and *scope* need to land on an equally pre-existing intuition — the closest are *note* and *filter*, and the work is to make them feel as inevitable as *cell*.

**2. Uniform inspection — one gesture reveals what anything is.** HyperCard's inspector, Smalltalk's browser, Etoys' viewer, Glamorous Toolkit's inspectors. The user can always ask "what is this?" and get a structural answer. This is the load-bearing folk property — without it, the system is magic, and magic trains learned helplessness.

**3. Visibility of effect.** Spreadsheet recalc, Scratch sprite motion, Logo turtle, LabVIEW front panel updating live. The distance between cause and effect is zero, or close. Bret Victor's "immediate connection" is the same thing articulated as a principle.

**4. Syntactic or structural impossibility of gross errors.** Scratch blocks that don't fit, LabVIEW wires that won't connect, typed fields that reject bad data. Folk users don't recover from syntax errors gracefully; the medium has to prevent them.

**5. Tolerance of local failure.** Excel's `#REF!`. A shell pipeline that fails one stage. A HyperCard script error dialog that lets you keep working. Folk systems accept partial correctness; formal systems often don't. OpenLight's contracts need a local-failure mode that doesn't tear down the session.

**6. Sharing is structural, not bolted on.** Scratch's remix, HyperCard's single-file stacks, Zapier templates, Notion templates. The act of publishing and the act of authoring are one gesture. OpenLight's scope shape has the right atomic granularity for this; what's needed is the social primitive that makes a scope shareable with one move.

**7. Incremental depth — low floor, wide walls, high ceiling.** Coined in the Scratch literature but describes every successful system above. You can start small, grow, and never hit a wall where "now you must learn something qualitatively different." This is the hardest property to design for; it is earned by the primitives being simple and composable, not by tiered onboarding.

**8. Self-description loops back to user power.** Smalltalk's image, acme's executable text, AppleScript dictionaries, Glamorous Toolkit's moldable views. When the system describes itself to itself, the user gets to read and modify that description. OpenLight's *self-describing field* is exactly this value at the substrate level; the question is whether the UI makes the self-description *legible at folk level* rather than only to agents.

## Synthesis: What Was Traded Away

Every folk-like system paid for its folk-likeness. The trades clustered:

**Expressiveness traded for legibility.** Scratch cannot do what Python can. HyperCard could not scale. Max/MSP patches become unreadable. The question for OpenLight: is there a primitive simple enough to teach in a sitting *and* rich enough to carry the substrate's ambition? The best candidates historically (cell, card, block) suggest the answer is yes but only if the primitive is chosen well.

**Performance traded for directness.** Spreadsheets recompute eagerly. Smalltalk's late binding costs cycles. Notion's block-per-paragraph model is not what a performance-tuned editor would choose. OpenLight's self-describing field is going to cost something; the trade is likely worth it if the cost is predictable.

**Professional tooling traded for directness.** Excel has no source control. HyperCard had no diff. LabVIEW's binary format fights git. Folk-like tools historically sacrifice the professional development loop — and the consequence, at scale, is a population of practitioners who never encounter version control, testing, or refactoring. OpenLight's history-built-in value refuses this trade and *should be able to have both*; the engineering work is to make history and provenance feel folk-level (undo, view-history, fork) rather than professional-tooling-level (git, blame, rebase).

**Closed ecosystems traded for coherence.** REBOL was closed. AppleScript per-app. HyperCard Apple-only. Coherence is cheaper inside a walled garden. OpenLight's self-describing substrate has a native advantage here: if contracts live in the field and tools reach the field, coherence comes from the structure, not from the vendor.

**General audience traded for a specific folk.** Max/MSP serves a specific folk (media artists); LabVIEW another (engineers); shell another (programmers). The honest observation is that "folk-like" usually means folk-like for a definable community, not literal universal accessibility. OpenLight's audience question — whose folk? — is worth naming. The first answer might be *people who work with knowledge professionally*: researchers, writers, engineers, designers. That is a definable folk, not "everyone."

## The shape OpenLight can take from this (from Part III)

Distilled, for the interface layer specifically:

- One composition operator at the user-visible level. Whatever OpenLight's `|` equivalent is — dispatch, scope narrowing, placement — it should be *one* move, learned once.
- An inspector that works on every chunk the same way. If I point at something in the interface, I should see its type, its contract, its relationships, its history, in one consistent panel.
- Interface elements that come from the type contract, not hand-built per invocable (already the plan — this is the Notion/Airtable/LabVIEW pattern done right).
- Local failure mode. An invalid value in a scope doesn't destroy the scope; it marks the chunk and lets the rest proceed.
- Shareable scope as a one-gesture act. The Scratch remix button is the reference; a scope is the equivalent unit.
- A viewer — in the Etoys sense — that shows everything you can do with the current selection. If I have a chunk selected, I see every invocable whose input type matches, ready to dispatch.
- Resist the impulse to layer tiers. "Novice mode / expert mode" is a tell that the primitive is wrong. A folk-like system has one mode and grows inside the user.

The folk-level value in `inside.md` is not a concession to usability. It is a correctness check on the primitive. If only experts can wield the primitive, the primitive is wrong. Every system above that reached folk did so because its primitive was right; every one that didn't, didn't.

---

# Cross-survey overlaps (observed, not synthesized)

Systems named in more than one of the three reports:

- **Pharo / Smalltalk / Glamorous Toolkit** — appears in Part I (moldable systems), Part II (languages), and Part III (historical folk-like). The deepest architectural alignment with OpenLight on every axis.
- **HyperCard / Decker / LiveCode** — appears in Part I (hypertext) and Part III (folk-like). The folk-authoring archetype.
- **Red / REBOL** — Part I (data-flow/fringe), Part II (languages), Part III (historical folk). UI-as-dialect-as-data.
- **Morphic / Self** — Part I (moldable) and Part III (Smalltalk lineage). Presentation-halos pattern.
- **McCLIM / Symbolics Genera** — Part I (text-native) and Part II (Common Lisp). Presentation types.
- **Scratch / Etoys / Logo** — Part III only but referenced implicitly in Part I via "block-based" thinking. Remixability and visible agents.
- **Ink & Switch research (Potluck, Capstone)** — Part I. Incremental formalization.
- **Observable / Pluto / reactive notebooks** — Part I and Part II (Julia). DAG-shaped reactivity.

These are the gravitational centers — when a system appears in multiple surveys started from different framings, that's a signal of architectural mass relevant to OpenLight.

---

End of raw draft. Structure decisions, editorializing, and horizon-vs-interface placement pending.
