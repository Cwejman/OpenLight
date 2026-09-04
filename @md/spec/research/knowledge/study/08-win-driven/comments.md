# Comments: what lab 08's edition still owes

*Working record, purified 2026-09-04, after §4 was recut around six kinds. Only what is still open. Strength: **reasoned** throughout; these are the steward's reads, not a cold reader's. The author's session ratifies the edition with the context it holds.*

## 1. What §4 now carries, and what it retires

§4 is the ontology as one graded list: the holon, two relations, the knower, the win, amplification, the trail. Each stands on the one before. The 07 edition's compounds fold into it without remainder: law 1 is §4.4 read in the knower's time, law 2 is §4.5's cost, principle 6 is §4.2's last paragraph, principles 1 and 3 are §4.4's shape. So the edition needs no separate laws or principles sections; what §4 does not carry belongs to the markdown practice. This is the steward's read of the author's instruction to discompound, and the first thing the ratifying read should confirm or refuse.

## 2. Author's calls on §4

**The word knower.** New. Chosen as the general word for person-or-model where 07 said reader and the README says citizen. It is folk and it names the role by what it does. Alternatives, if it grates: reader, holder, citizen.

**Where the trail sits.** Commits, comments and spaces are hosted as the sixth kind, on the reading that all three are writes by a knower kept in time, and a comment is a holon standing on another. It is the smallest win of the six and comes last. If the author sees the space as its own kind rather than the trail's container, §4.6 splits in two.

**Knowledge against information (§4.3).** Kept from the first cut, now inside the knower. Reasoned, not observed.

**The citation form.** *[Quine 1948]*, *[Koestler 1967]* appear in §4 as the code's own principle at work: a link to the holon nobody wrote. Plain text, so addressable but not followable until the brief exists.

**§1's forward sentence.** *This is broken down further as the document progresses.* Could now name §4. Left as written because §1 is the author's prose.

## 3. For the markdown practice

**The surface is declared by position, not by markup.** A brief's why needs no italics, bold or blockquote. The heading carries the depth and the first paragraph after it carries the role, so a renderer can style both without the author annotating anything, and marking it would put one fact in two homes. Markdown's three emphasis tools do not help here in any case: italic and blockquote point down in importance, and bold is the only up-signal and fails at scale.

*The rule this buys, and its price:* if position declares the surface, position must be reliable. **A brief may never open with a list, a table or a quote.** The first thing after a heading is always the prose that carries the why. §4 keeps to it: no list anywhere in the section.

**The everyday word leads, the exact term follows in parentheses.** *What knowledge is (its ontology), and what shape it takes (its topology).* Serves the reader who needs plain language and the one who wants the precise name, in one sentence.

**Holarchy, not holonarchy.** Koestler's own word for the nesting is *holarchy* [Koestler 1967]. The 07 edition has the longer form and should give it up when it is next touched.

**Storage sacrifices, and how to make the cut.** A folder tree holds within for free and upon not at all. A file has one root holon, so when a holon is central to two regions it lives in one file and the other gets a link, never a split: two halves quietly become two rules. The file is cut around the holon with the most standing on it in that region. Place follows reach, applied to files.

**Bracket citations as links.** *[Author year]* in running text is the practice's citation form. When the brief exists, the bracket becomes a markdown link to it; until then it stays text.

**Section references in running text.** §4 refers upward with a section sign and a heading anchor on every use, so no paragraph depends on an earlier one for its pointer. Whether every use or only the first should carry the link is a team open ([issue #1](https://github.com/Cwejman/OpenLight/issues/1)).

## 4. Sketch seeded here, not yet a sketch

**The holon-list frontend.** The first holator, read-only: parse the markdown tree into a flat list of holons with address, surface, depth, parent, children and links out; compute the inverse of every link; show each holon with within, upon and stood-upon; show each commit and its changes browsed by the same relations; show comments as holons standing on what they comment, walkable by knower or by space. Centrality becomes measurable as the count of what stands on a holon, and the parked expand-and-collapse open unblocks since the page is ours. The existing `.wiki/` pandoc build knows files and folders only; the smallest step is a pass that emits the holon list as one JSON file. Belongs in [`sketches.md`](../../../../../sketches.md) when the author says so.
