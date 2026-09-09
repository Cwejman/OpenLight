# The proof of concept

The code run in the simplest medium there is: markdown files in folders, tracked in git, read by people and by sessions bootstrapped against them. This document is the practice, the code's rules made concrete for that medium, and it is where the code's open question is answered by observation: how briefs divide, how deep they go, what an entry looks like. It is a first cut, reasoned from the studies and not yet lived; each rule says how strongly it holds, and the ones marked open are being found out.

## 1. The medium

A brief is a markdown file or a section in one. A folder is a holon whose brief is its entry file, `README.md`, and a folder without one is a pile. A document nests its headings below its title, and the lean is three levels, h2 to h4, with a folder taking over beyond. The two levels left, h5 and h6, come at a cost in a reader's sense of place, and may still earn their use where the briefs are very light and the structure is natural to the subject, an API reference, an outline of simple sources; this is a lean, not settled, and unmeasured. How files hang under an entry, named from a brief at any depth of it and linked there, is open and will be observed, and the order is always the entry's prose, never the listing. Git is the history: every change is a commit, and what a record retires into.

## 2. Headings carry numbers

Headings are numbered, and the numbers nest with the headings: 1, then 1.1 and 1.2 inside it, then 1.1.1. The title is unnumbered. The numbers tell a reader where they are while scrolling, and give every brief a short address that can be spoken or written anywhere. Preferred.

## 3. The surface is declared by position

The heading and the first paragraph after it are the contract, and nothing marks them: no italics, no bold, no blockquote. Position is the mark, so a renderer can style the surface without the author annotating it, and one fact is not written in two homes. The price is that position must be reliable: a brief never opens with a list, a table or a quote. The first thing after a heading is always the prose that carries the win, and a bullet list follows the paragraph that needs it. Reasoned; kept throughout the ontology.

A bullet is one sentence or two. Past that it is a brief and takes a heading, as the code's first principle says. Bulleted and numbered lists carry a blank line between items, so they read as raw markdown. Whether a long bullet may open in bold is open: bold is the only up-signal markdown has and it fails at scale, and it would put the surface in a second home beside position.

## 4. Links and citations

Links are relative markdown links, and the sentence around each says what following it gives. A link to a brief not yet written is written empty, `[the name]()`, and stands until the brief exists. A link to an outside source goes to the source's address. A source cited in running text is written as a name and a year in brackets, *[Author year]*, and becomes a link when the source has a brief of its own; until then it stays text. A reference to another section is written by anchor on every use, so no paragraph depends on an earlier one for its pointer; whether the first use alone should carry it is open.

## 5. Files

A file has one root brief. When a brief is central to two regions it lives in one file and the other links to it, never split, because two halves quietly become two rules. The file is cut around the brief the most stands on in that region. Records are events: a ratification, a review's findings, a feedback note each amends the state, is folded, and retires from the tree; git keeps it.

## 6. Visuals

Prose alone does not show how things connect, and a page of it gives the eye no rest, so the practice uses visuals in two ways, neither yet built. The first is visualization: a drawing of a structure or a flow, generated from what the text says. For now it is drawn in characters inside a code block, the least effort that still shows a shape. The hypothesis for the real thing is one JavaScript file that is itself a skill: it holds a few reusable components in one coherent style, and a session composes an SVG from them, through JSX or through plain functions, which of the two is underexplored. Mermaid is not the answer: its syntax is nodes and edges, and its output is neither broad enough nor pleasing enough to live beside prose. Reasoned, a hypothesis.

The second use is the image in an artful sense, as a blog post uses one: breathing space, an art direction held across a body of writing, a painting placed where the text carries the meaning it shows, so the eye gets a visual aid and the page gets air. Not in the code, which is a manifesto and stays unlittered, but in the knowledge written under it, as projects take it up. Preferred.

## 7. The tool

The cycle wants a tool that is not built. It reads a document by depth: the title and the first paragraphs, then one level down, then the next, so a session holds the gradient without reading the files whole. It traces links as structure, not as text to open. And it moves a brief by its address or replaces one whole, so a rewrite touches only the brief named. Until it exists, headings do the reading and scripts do the moving. Open, and needed soon.

## 8. Open

What this practice has not settled, to be found by observation: how files hang under an entry; whether an intro carries a short guide to how the text is read; and whether the character counts the earlier editions used as red flags, five hundred for a paragraph and three hundred for a bullet, earn a place here.
