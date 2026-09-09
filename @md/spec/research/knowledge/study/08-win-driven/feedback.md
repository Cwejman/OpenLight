# Feedback on the run

*The writer's own report on lab 08's run, 2026-09-09, as the fresh session gave it after writing [`output.md`](output.md). Recorded verbatim in substance; the verdicts are the writer's, not a cold reader's, and not yet the author's. A record, not law: what is folded from it retires with it.*

## 1. The why it chose, and for whom

Written for whoever is about to commit to the code, to write a team's knowledge under it or to build the medium its fifth part describes. The why of the whole is that such a person should know what the code stands on before they stand on it: which of its claims the world's evidence holds up, which it corrects, and what nobody has shown, so that what they write or build rests on ground rather than habit. That framing let the whole corpus land in one gradient: the biggest shared win first (the shape holds, the numbers fall, the artifact alone is not the lever), then what the writing rests on (comprehension science), what an artifact can do (organisational and documentation evidence), what a model reads (context engineering and the coding-agent nulls), and only then, for the engineer, what the medium of the code's fifth part would meet (substrate, schema evolution, interface-as-data, low-code). The code's own structure, writer first, engineer last, "the rest does not depend on it", gave the order. One deliberate move: the piece treats the code's central bet, that a fresh session reading the debrief is the downstream consumer that keeps it load-bearing, as a hypothesis the sweep bounds but does not test, and says so in three places rather than letting the reader infer it.

## 2. Where narrative was used

- §1, archetypal: the team that writes everything down and a year later the new colleague still walks over to ask. Setting, goal, attempt, outcome, no particular person; it grounds the three organisational findings (absorptive capacity, no repair loop, descriptive decay) before the reader has the terms.

- §2.5, real: Pigweed adopting Diátaxis as a literal blueprint and retreating to sections within a page. Marked seen, one organisation, no metrics.

- §3.2, real: the surgical-checklist chain, Haynes' eight hospitals, Ontario's 101-hospital null, Haugen's randomised trial, told as a chain of causes because the point is precisely causal: implementation carries the effect, not the artifact. Marked measured.

- §5.1, real: Dark Inc's post-mortem in the founder's words, with Unison and feenk's turn to consulting beside it.

- §5.2, real: Logseq shipping its database rewrite four years late into a market that had just re-valued files. Marked seen.

- §5.5, real: Cambria's write-side pivot, told as what happened rather than as a lens algebra.

- §5.6, real: Uber Screenflow, the design, the compile-against-every-runtime answer, sixteen flows, the shutdown.

- §5.7, real, short: Retool's reversal.

- §6, real, one sentence: the agent that caught a summariser inventing "N=22, 10 companies".

Considered and left out: Szulanski's study itself as a story (the numbers were the win, the narrative would have been decoration); Bossavit's chase of the IBM Systems Sciences Institute (reduced to one clause in the folklore list, because the reader needs the verdict, not the hunt); the Wikidata query-service split and Neo4j's consolidation (interesting, not serving any win the piece makes); Letta's pivot (kept as one clause of fact); Bezos's six-pager. In every case the test was the code's: the essence read shorter without the story.

## 3. Doors deliberately left unopened

- The folklore list (§3.4) gives one line per number and points at the reports; no chase reproduced.

- §5.5 gives the spine of the schema-evolution report and tells the engineer to read it whole; the option space for federation, the four recommendation groups, and the Noria measurements are summarised in a sentence each, not unpacked.

- §5.3 and §5.4 name each precedent in one bullet; the standards-track status of RDF, SPARQL and SHACL, the Zanzibar clone landscape, Datomic's accretion limits, and the faceted-navigation lineage stay behind links.

- §7 lists, with a link each, everything the piece does not carry: company-by-company low-code and PKM states, the sync-engine consolidation, DITA, iiRDS and STC, the proposal-process numbers, the design-rationale lineage, IA card sorting, the substrate-research strands, the generative-UI protocol race, the product view layers, the typed data-layer landscape, and the reading-order studies.

- The mapping from the sweep's earlier six-principle edition of the code to the current two-law, five-principle one is stated where it matters (§2.1 on "abstract", §2.4 on the redundancy justification, §4.4 on the fifth part's "no branch") but not tabulated.

- The grounds the code's §6 says are not yet written: the piece is raw material for them, and the writer did not try to write them.

## 4. Where the code or the proof of concept fought the writer

- The anchor rule (poc §4, a reference to another section carries its anchor on every use) produced clunky link text, "[the sizing brief](#22-…)", because the heading names are long sentences; the poc's own open question about whether first use alone should carry the anchor is the one the writer would settle first.

- The "bullet is one or two sentences" rule (poc §3) pushed several one-idea items into long semicolon chains (§2.2 the menu studies, §5.3 permission) rather than a third sentence. A bullet of three short sentences would have read better than two long ones.

- Every-link-says-what-it-gives (code 3.1.2) is right but costs a clause per citation when the same report is cited for a finding; the writer ended up appending "which has the counts" style tails that a footnote would carry more lightly.

- Confidence marks (code 3.2) were easy to write at the end of each brief but hard inside sentences that mix a report's grade ("paper-only") with the writer's ("reasoned"); the writer kept the reports' words and put its own at the brief's close, which means a reader has to reach the end of a brief to know how much to trust its middle.

- The code's "no schemas, only prose" is right for the writing and made the tables in the raw (delta tables, grade tables) impossible to carry; each was turned into a bullet or dropped, and the loss is visible in §4.4 and §5.4, where a table would have been the honest form.

- Nothing in the code or poc fought the choice of reader or the order of wins; those came out of the material and the code's own structure without strain.

# Feedback on the second run

*The second writer's own report, 2026-09-09, after writing `output-2/` under [`prompt-2.md`](prompt-2.md), which restored the author's request as the angle. Verdicts the writer's.*

## 1. Why a folder, and the centre

The material runs three levels deep everywhere, lineage, sub-lineage, work, and in one document the works would have landed at h4 or h5. The entry holds a paragraph or two per lineage and links to a file; each file holds h2 per sub-lineage and h3 per work. The centre: the three bodies of work the project sits between, comprehension science, the builders of media meant to carry understanding in their structure, and the world where models read the same files, seldom read each other and each arrived separately at one finding: what helps a reader is reaching the right piece at the right level, and what fails is asking the writer to put meaning into the structure. It tells the author which law has science under it, the first, thinly and with a fault line, and which stands on the systems record, the second.

## 2. Narrative

One archetypal, in the entry: a group builds a typed medium, the writing slows, the newcomer asks a colleague. Six real: the surgical checklist chain, Logseq, Cambria, Darklang, Uber Screenflow, Retool. Left out: the story of the sweep itself, Bezos's six-pager, Luhmann's life beyond the archive's counts, Ink and Switch as biography.

## 3. Where the code or the proof of concept fought the writer

- Every confidence mark is a third party's that the writer read but did not check; the code has no word for that, and the writer made one.

- Bullets of one or two sentences and a brief opening with prose: folklore wanted to be a list, three sections grew lead paragraphs, and items were joined by semicolons to obey.

- "Say little about a source inside a brief": sources are the subject here, so each got its own brief, which pushed paragraphs long.

- About 150 bracket citations link nowhere, because the practice says they stay text until a brief exists; the reports are linked at each file's end instead.

- One factual conflict between reports, DITA 2.0's first beta, had no home under the code; both readings were written in the sentence.

# What both runs did with the cycle

*The steward's finding from the two transcripts, 2026-09-09. Seen.*

Neither writer ran the cycle the fifth principle asked for. The first wrote once, made twenty in-place edits that each added a link tail, checked that links resolved, and reported. The second wrote once through the shell, ran scripts that measured paragraph lengths and split the long ones, checked links, and reported; it called the script its cold read. Neither re-read its own output from the top, neither asked of any brief whether it broke a law or a principle, and neither started a fresh session to read it. The principle as then written had no actor, no act, no list, no moment and no definition of a fresh head, and both duties fell due when the context was fullest. The principle was rewritten as the cycle before the second round: write, read against the code, write again at the grain of what broke.
