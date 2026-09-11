# The proof of concept

The code run in the simplest medium there is: markdown files in folders, tracked in git, read by people and by sessions bootstrapped against them. This document is the practice, the code made concrete for that medium, and it is where the code's open question is answered by observation: how briefs divide, how deep they go, what an entry looks like. It is a first cut, reasoned from the studies and lived only in the labs so far; each rule says how strongly it holds, and the ones marked open are being found out.

## 1. The medium

A brief is a markdown file or a section in one. A folder is a holon whose brief is its entry file, `README.md`, and a folder without one is a pile. A document nests its headings below its title, and the lean is three levels, h2 to h4, with a folder taking over beyond. The two levels left, h5 and h6, come at a cost in a reader's sense of place, and may still earn their use where the briefs are very light and the structure is natural to the subject, an API reference, an outline of simple sources; this is a lean, not settled, and unmeasured. Take your own agency in terms of what is right for the content. The lean does not excuse a flat file; the breakdown is the code's, at every grain. Git is the history: every change is a commit, and what a record retires into.

## 2. Headings carry numbers

Headings are numbered, and the numbers nest with the headings: 1, then 1.1 and 1.2 inside it, then 1.1.1. The title is unnumbered. The numbers tell a reader where they are while scrolling, and give every brief a short address that can be spoken or written anywhere, and that a script can read and move by. Preferred.

## 3. The surface is declared by position

The heading and the first paragraph after it are the face of a brief, and nothing marks them: no italics, no bold, no blockquote. Position is the mark, so a renderer can style the surface without the author annotating it, and one fact is not written in two homes. The price is that position must be reliable: a brief never opens with a list, a table or a quote. The first thing after a heading is always the prose that carries the understanding, and a bullet list follows the paragraph that needs it. Reasoned.

Bulleted and numbered lists carry a blank line between items, so they read as raw markdown. Whether a long bullet may open in bold is open: bold is the only up-signal markdown has and it fails at scale, and it would put the surface in a second home beside position.

## 4. Links and citations

Links are relative markdown links. A link to a brief not yet written is written empty, `[the name]()`, and stands until the brief exists. A link to an outside source goes to the source's address, and a source known only by a number or a system by its name is cited that way, as a link to its address. A source cited in running text is written as a name and a year in brackets, *[Author year]*, and becomes a link when the source has a brief of its own; until then it stays text. A reference to another section is written by anchor on every use, so no paragraph depends on an earlier one for its pointer; whether the first use alone should carry it is open.

## 5. Files

A file has one root brief. When a brief is central to two regions it lives in one file and the other links to it, never split, by the code's one home. The file is cut around the brief the most stands on in that region. Records are events: a ratification, a review's findings, a feedback note each amends the state, is folded, and retires from the tree; git keeps it.

## 6. Visuals

Prose alone does not show how things connect, and a page of it gives the eye no rest, so the practice uses visuals in two ways, neither yet built. The first is visualization: a drawing of a structure or a flow, generated from what the text says. For now it is drawn in characters inside a code block, the least effort that still shows a shape. The hypothesis for the real thing is one JavaScript file that is itself a skill: it holds a few reusable components in one coherent style, and a session composes an SVG from them, through JSX or through plain functions, which of the two is underexplored. Mermaid is not the answer: its syntax is nodes and edges, and its output is neither broad enough nor pleasing enough to live beside prose. Reasoned, a hypothesis.

The second use is the image in an artful sense, as a blog post uses one: breathing space, an art direction held across a body of writing, a painting placed where the text carries the meaning it shows, so the eye gets a visual aid and the page gets air. Not in the code, which is a manifesto and stays unlittered, but in the knowledge written under it, as projects take it up. Preferred.

## 7. Reading and moving by script

The making wants to read a document by depth and move a brief without retyping it, and no tool for that is built. Scripts over the headings are enough for now; what they do is said in prose in [the skill](skill.md), so a session writes the script it needs when it needs it, and this is the shape of them. To read by depth, a script prints the headings and the first paragraph under each, to the depth asked for, so a session holds the gradient of a file or a folder without reading it whole; a brief is read in full only where the work needs it. To move a brief, a script cuts it by its heading and places it whole where it goes, and to replace one, the script swaps the brief by its address and touches nothing else. What a session wrote a moment ago it does not read again; the fresh read is the fresh head's job. Seen, in the labs, as the cheapest way to keep a rewrite to the brief named.

The tool proper comes later and does the same by address, tracing links as structure rather than as text to open. Open, and not yet needed.

## 8. Reading a paragraph

Two diagnostics for the prose principle, and one convention. A paragraph that reads heavy holds more than one point, or a point before its ground; one that reads as a crumb holds a claim cut from its reason. Both are the paragraph not matching the point, and the fix is the code's: back to the understanding, not to the words. Seen.

Parentheses serve two cases, and they flip. A word that what follows builds on is introduced: it leads, and the plain explanation follows in parentheses, once, where it is first used. A word that only carries is not introduced: the plain word leads, and the exact term follows in parentheses for the reader it grounds. Preferred.

## 9. A file says it is under the code

A repository holds more than knowledge, so a file declares itself: frontmatter at its head stamps it as written under the code, and a reader, a program or a published site digests only what carries the stamp. The writer's intent lives in the file rather than in a tool's guess, and what a repository holds as knowledge becomes countable.

The stamp also says what kind of file it is, because not everything under the code is a brief. A record is an array of entries in time, newest first or oldest first, and reading it by the gradient is reading it wrongly: its order is chronology, not importance, and its sections are occurrences rather than rooms. A reader that knows the kind can show a record as the sequence it is and a brief as the holarchy it is, instead of conflating them.

The stamp's form is not settled. Open, and wanted before anything publishes a tree.

## 10. Open

What this practice has not settled, to be found by observation: how files hang under an entry, and whether the character counts the earlier editions used as red flags, five hundred for a paragraph and three hundred for a bullet, earn a place here.
