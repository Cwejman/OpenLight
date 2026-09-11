# What is known about finding

Finding the right part is where professional readers fail, so the practice that exists to solve it matters more than its size suggests. Information architecture is that practice, and its evidence base is the thinnest in this material: a citation chain nobody walked back, a null where the validity test should be, and a method that is unstable in ways its users do not report. What it does have evidence for is narrower and more useful than what it claims.

## 1. The chain, and the null at the end of it

The chain is short enough to follow in one paragraph. It starts with a conference paper from 2004, not peer-reviewed, reporting one card-sorting dataset and printing no correlation coefficients anywhere in its text. Later that year Jakob Nielsen read values off that paper's graph and published them in a blog post, and those are the numbers everyone now quotes for how many participants a card sort needs. Two more posts joined the chain, one practitioner and one vendor, each resting on a single anecdote. Then in 2016 a peer-reviewed study tried to validate the method and failed, and in 2022 an extended abstract validated it only against a legacy structure that had been chosen for its known problems.

The paper at the head of it sorted 46 cards with 168 participants and recommended, verbatim, that "it may not be cost effective to spend resources to gather information from more than 20-30 participants." Its second table is almost never cited and is the more useful one: at forty participants, a third of the groupings the full sample produced come apart.

The 2016 study is the one that matters. A card sort with 27 participants on municipal websites, then 50 more measuring task performance across structures of varying fit to the elicited mental model, returned: "the match between mental model and website structure has no effect on browsing performance." The authors themselves discuss "the failure to validate card sorting." *Measured, peer-reviewed, and the most important paper in the territory.*

Tree testing, the companion method, rests on a 2009 post whose author discloses working with the tool vendor and whose entire empirical content is one government site going from 31% to 67% success, with no control and no replication. The one real validity study exists and could not be read: the publisher blocked access, so the field's single attempt to link tree-test scores to task performance has not been read by anyone in this sweep.

## 2. The method is unstable in ways its users do not report

Run the same kind of sort six times across 140 participants and the resulting similarity between cards agrees well in some pairs of studies and barely in others — the correlations run from 0.42 to 0.93, in a paper whose abstract calls them "highly similar." The step that turns those similarities into a tree is sensitive to its own starting conditions, so the architecture you get is partly an artefact of the algorithm chosen, and the height at which the tree is cut into groups is acknowledged to be a judgement call. Take 60% of the cards at random and you get comparable similarities but different themes.

None of that appears in how the method is taught or sold. *Measured, across four studies, all recent and several vendor-adjacent.*

## 3. What the field does have evidence for

Three things, each narrower than the practice claims and each usable.

Information scent — that people forage by following cues that predict what lies ahead — is the strongest empirical thread, with genuine predictive models behind it. The tool built on it never shipped, and the field's canonical textbook mentions it once, in a footnote.

Faceted browsing, where a reader narrows by attributes rather than by path, beat keyword search convincingly in a study of 32 students over 35,000 images: complete recall rose from 21% to 77% on one collection. But it was ten times slower per step, the condition got three extra minutes, and a later review found transfer to real catalogues inconclusive. *Measured once, with a favourable baseline.*

And people prefer navigating to searching. Hierarchy is a retrieval affordance people actively want, not merely a filing artefact — though this is a preference finding, and the rule stated in [how professionals actually read](professionals.md) §4 applies to it as much as to anyone else's. *Measured as a preference; carried from the tools-for-thought lane rather than from the information-architecture reports.*

## 4. Putting one thing in two places is blessed and unmeasured

Polyhierarchy — the same item appearing in several places — is normatively endorsed by the relevant standards, which note that it arises naturally. No user study exists on whether it helps or hurts findability, and the widely repeated warning that too much cross-listing destroys a hierarchy's value has no threshold and no study behind it.

Costs have been measured only on the machine side, where following every path a graph permits is expensive; that is in [what breaks](../medium/breaks.md) §3. For a human reader, nothing is known.

The detail is in [the material's finding file](../../corpus/reading/finding.md).
