---
under: the code
kind: brief
---

# The practice

## 1. The medium

A brief is a markdown file or a section in one. A folder is a holon whose brief is its entry file, `README.md`, and a folder without one is a pile. A document nests its headings below its title, and the lean is three levels, h2 to h4, with a folder taking over beyond. The two levels left, h5 and h6, come at a cost in a reader's sense of place, and may still earn their use where the briefs are very light and the structure is natural to the subject, an API reference, an outline of simple sources; this is a lean, not settled, and unmeasured. Take your own agency in terms of what is right for the content. The lean does not excuse a flat file; the breakdown is the code's, at every grain. Git is the history: every change is a commit, and what a record retires into.

Everything under the code in a space is mounted by its entry, and a mount is a brief of its own rather than a mention among others. Every such file and folder beside an entry is mounted by one of the entry's briefs and by no more than one, so the order a reader meets the parts in is the order those briefs stand in. The mount itself is the last thing in that brief: a paragraph that is nothing but the link, standing after the prose and after the confidence line, because a reader decides to go down once they have read what is above. A section that gathers the parts into one run of paragraphs mounts a level per paragraph, which is a grain the holarchy does not reach, and it is also the map of the parts to come that [the prose principle](../code.md#41-the-prose-of-a-brief) refuses. A link in running prose is a different thing and may be written anywhere. A brief that mounts a part has no subsections of its own, since the mount already says its level is elsewhere, and a brief with both would have two levels where every brief has one. *Reasoned, the author's, 2026-09-12, from an entry that listed its five parts in five paragraphs and so never had to ask which was biggest, and from mounting on the heading, which asked a reader to descend before reading; a brief with a mount and subsections both was forbidden the same day, so that what the surface is handed stays one kind of level.*

A mounted file is a level and not a brief. Its brief is the one that mounts it, and that is where its prose is read; the file holds that brief's parts and nothing else. Its title repeats the mounting brief's heading, unnumbered, so a reader crossing the boundary knows which brief this level belongs to and a script can check that every mount agrees. This is what a folder already does one grain up, where the level is the directory and the brief is its entry file, and it is why nothing is said twice: there is one brief per purpose and the file is the room beneath it. *Reasoned, the author's, 2026-09-12, from four mounted files whose first paragraphs had become copies of the briefs that mounted them.*

So a mounted part has a level to hold. A file with no sections has nothing beneath its mount, and a door to an empty level is not a door, so its prose is a brief of the entry and stands there as a section rather than as a file. The same holds one grain up, for a folder whose entry mounts nothing. *Reasoned, 2026-09-12, from the rule above applied to the arc, where a note of four paragraphs and the entries of the labs had nothing beneath them to hold.*

Two kinds of file stand beside an entry without a mount. A file under the code that nothing mounts is an orphan: the root of a body of its own, so it keeps its own opening. Orphans are allowed for now, since a part can be worked on alone and connected when it is ready. A file not under the code, one without [the stamp](#9-a-file-says-it-is-under-the-code), is not governed by it at all: a brief reaches it by a link and never by a mount, and it stays as it was written. *Preferred, the author's, 2026-09-12; whether orphans stay allowed is open.*

## 2. Headings carry numbers

Headings are numbered, and the numbers nest with the headings: 1, then 1.1 and 1.2 inside it, then 1.1.1. The title is unnumbered. The numbers tell a reader where they are while scrolling, and give every brief a short address that can be spoken or written anywhere, and that a script can read and move by. Preferred.

## 3. The surface is declared by position

The heading and the first paragraph after it are the face of a brief, and nothing marks them: no italics, no bold, no blockquote. Position is the mark, so a renderer can style the surface without the author annotating it, and one fact is not written in two homes. The price is that position must be reliable: a brief never opens with a list, a table or a quote. The first thing after a heading is always the prose that carries the understanding, and a bullet list follows the paragraph that needs it. Reasoned.

Bulleted and numbered lists carry a blank line between items, so they read as raw markdown. Whether a long bullet may open in bold is open: bold is the only up-signal markdown has and it fails at scale, and it would put the surface in a second home beside position.

## 4. Links and citations

Links are relative markdown links. A link to a brief not yet written is written empty, `[the name]()`, and stands until the brief exists. A link to an outside source goes to the source's address, and a source known only by a number or a system by its name is cited that way, as a link to its address. A source cited in running text is written as a name and a year in brackets, *[Author year]*, and becomes a link when the source has a brief of its own; until then it stays text. A reference to another section is written by anchor on every use, so no paragraph depends on an earlier one for its pointer; whether the first use alone should carry it is open.

A link points at a state, not only at a path. In a versioned substrate the honest reading of a link is the target as it stood when the linking brief was last written, which git can resolve exactly, since every file carries the commit it came in on. A reader may then show both: the ground the brief was written against, and the ground as it stands now, with the difference between them being what staleness actually is. Without this a brief can be made wrong by an edit elsewhere that nobody made to it, and no one can see that it happened.

This binds whoever edits a brief that others stand on. Changing it is allowed, and is the point of a living substrate; changing it silently is not, and the mark of a moved ground is the least a reader is owed.

How a link should hold its state is not settled, and three models stand against each other. The tree may anchor a link by itself: every link resolves against the tree as it stood at the commit its own file was last written, so a record stays traceable with nothing written down and the anchor is the file's own history. Its weakness is that any edit to a file, a typo included, re-anchors every link in it to the present.

The other two are deliberate. A link may be pinned to a commit, which keeps one home for the fact and trusts git to serve the old state on request. Or a brief may keep its own copy of the ground it stands on, stamped as a copy at a commit, which gives up one home and gains a brief that travels whole.

None of the three is decidable yet, and they fail together in one place: each needs something that resolves a link against history, and the surface this tree is read on does not. So the practice writes living links only, and a record that means a past state says so in its prose, where a person can read it and no program has to. *Open, raised 2026-09-11 and widened 2026-09-12; it waits on a reader that resolves links, and is wanted before a tree is published.*

## 5. Files

A file has one root brief, unless it is mounted, in which case it is a level and its brief is the one that mounts it. When a brief is central to two regions it lives in one file and the other links to it, never split, by the code's one home. The file is cut around the brief the most stands on in that region. Records are events: a ratification, a review's findings, a feedback note each amends the state, is folded, and retires from the tree; git keeps it.

What may be removed is what nothing living stands on, and the test reads from the tree as it is, since a link inside a file that no longer exists is not a link but a fossil. A brief one other brief stands on moves into that brief's holon; a brief many stand on moves to the level that covers them all, and never above it, since a ground held above its own readers is a ground they cannot keep. Removal is for what no link reaches, and git keeps it. This is one home read from the other side: a tree that moves its ground silently breaks briefs nobody edited. Reasoned, the author's, 2026-09-12.

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

The stamped region is also the boundary of the substrate, and knowledge does not leave it. A piece of the knowledge moved into an unstamped file is moved out of what any reader digests, so it stops being substrate whatever its content. Where the code has not yet reached, the knowledge waits for it rather than being filed there. Reasoned, from moving a brief out of the stamped tree and back, 2026-09-12.

The stamp's form is not settled. Open, and wanted before anything publishes a tree.

## 10. Open

What this practice has not settled, to be found by observation: how files hang under an entry, and whether the character counts the earlier editions used as red flags, five hundred for a paragraph and three hundred for a bullet, earn a place here.

And the labs' own files. Their outputs, prompts and editions carry the stamp from when they were written, under editions that are not the law now, and they are frozen, so they are reached by links rather than mounts and nothing here is applied to them. Whether they keep the stamp, and so whether the substrate holds them at all, is open, and a first reader need not open them.
