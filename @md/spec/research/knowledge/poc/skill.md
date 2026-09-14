---
under: the code
kind: brief
---

# The skill

## 1. Read by depth

A file or a folder is read the way [the gradient](../code.md#31-the-gradient) is laid: the brief that mounts it, or the title and the first paragraph where nothing does, then each heading with its first paragraph, then one level deeper, and so on to the depth the work needs. A script that prints headings with the paragraph under each, to a chosen depth, gives a session the shape of a piece for a fraction of reading it whole.

The whole is held that way, by depth, and a brief is read in full only where the work will touch it. The session that just wrote a brief does not read it again; the fresh read belongs to [a fresh head](../code.md#54-the-fresh-head).

*Seen, in [the study's labs](../study/README.md).*

## 2. Address by number

A brief is named by [its number](practice.md#4-headings-carry-numbers) and its file: `reading/professionals.md` §7. A script finds a brief by that address, prints it, cuts it, places it whole elsewhere, or swaps it for a new whole. That is how a brief that held is [moved and never retyped](../code.md#53-the-rounds), and how a rewrite touches only the brief named.

*Seen, in the labs.*

## 3. Check after every round

Inserting or moving a brief renumbers every heading after it, and every pointer written by number goes stale without any link breaking. So after every [round](../code.md#53-the-rounds) the tree is checked for what a move breaks, and a round is not done until every list beneath is empty, the orphans and the faces kept with a reason aside.

[The surface's](surface/README.md) own check prints the links, the images, the mounts and the faces for a tree it traces, run from [the arc's](../README.md) folder:

```
bun poc/surface/surface.ts . --check
```

The pointers written by number it does not print; those are a few lines of script over the files.

*Seen, in the labs and in this arc; the check as built on 2026-09-14.*

### 3.1 Pointers written by number

A script lists every `§` reference in the tree and checks that the number it names still heads the brief it meant, by the heading's words and not only its number.

*Seen, in the labs.*

### 3.2 Links and images

Links are checked so that each resolves to a file and an anchor that exist, and images against [the practice's rules for images](practice.md#8-visuals): where the file stands, where the image opens, and how its text follows.

*As built, 2026-09-14.*

### 3.3 Mounts

Every mount is checked against [the practice's rules for mounts](practice.md#3-every-part-is-mounted-by-one-brief-of-its-entry), and every mounted file against what a level holds. The files nothing mounts are listed too, not as faults, since [orphans are allowed](practice.md#35-what-stands-beside-an-entry-without-a-mount), but so that a part left unconnected is seen.

*As built, 2026-09-14.*

### 3.4 Faces past the flag

Every face past [the practice's flag](practice.md#53-the-check-flags-a-face-past-four-hundred-characters) is listed apart from the faults, and each is read: broken where the break was never taken, or left with the reason it holds.

*As built, 2026-09-14.*

## 4. Read the stamp before writing

Before a file is written, its stamp is read. A file stamped `ratified` is changed only as [the practice says](practice.md#24-a-ratified-file-is-edited-only-in-review), proposed to whoever ratified it and written once they have agreed.

*Preferred, the author's, 2026-09-14.*

## 5. Keep the record as you go

A session whose cost is counted, as every lab run was, keeps a debrief, `debrief.md`: one file, the record of its run, with an entry per round. It is opened when the work begins and appended after every round, never written at the end, so a session that is cut short still leaves its record whole up to the last round. That is [the code's debrief](../code.md#55-the-debrief), written as the work goes rather than at its close.

The account is a table inside the debrief of what the run cost, with the clock time each step began and whatever the harness shows of spend; what the harness does not show, the transcript does, and a script over it counts each API message once.

The debrief is [a record](practice.md#21-the-stamp-says-the-kind), kept newest first so the top is always the latest state. It holds as long as it stays a size a reader can take in; beyond that the oldest entries retire into git, and the file stays whole and short.

*Seen, in the labs, where every run was measured.*

## 6. Count one way

Sizes, what a piece costs a model to read, are counted with one method named in the record, and the method is chosen for being reproducible from the files themselves. Bytes divided by four is the one used so far, since no tokenizer is at hand; a session with a tokenizer says so and counts with it, and gives the bytes as well so the two can be set beside each other.

*Preferred.*

## 7. Leave a note with every step

A session's thinking is not in the record; what it leaves is what it wrote. So beside the record it keeps `steps.md`, newest first, one line per step: the clock time, what it is about to do, and why, in the words it would say to someone watching. The note is written before the step, not after, so a step that fails still has its intent on record.

A line, not a paragraph. The paragraph is the round's entry in the debrief, and the piece the session made stands above both. Whoever watches, a person or a program drawing the work as it runs, reads the making at the grain of a line.

*Reasoned, from the first runs watched as they ran; the transcripts showed the words a session says are the only narrative it leaves.*

### 7.1 One record serves the harness's view and the reader's

Every session leaves the same three grains, the note per step, the entry per round and the piece above, so one record serves both outlooks, the harness's while the run is live and a web reader's after. Locally the record and the transcripts give the introspection the harness does not show.

When the work is committed, the raw the run produced, its transcripts and snapshots, is tucked away out of the tree, under an ignored folder or in git's own objects, not lost and not in the reader's way, so the tree a reader opens on GitHub is prose and the record, and the raw is one step beneath for whoever counts.

*Reasoned; lived in the labs.*

## 8. Amending in place is not drawn

[The code draws the line](../code.md#53-the-rounds) at a word: every brief a change reaches is written whole, unless the fix is a word. Where the line falls between a word and the whole, when a change is smaller than the brief and larger than a word, is not drawn; the rounds so far wrote whole where the understanding changed and amended where it did not.

*Open; seen in five rounds of one run.*
