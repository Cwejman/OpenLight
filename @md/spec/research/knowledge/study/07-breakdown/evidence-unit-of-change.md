# Evidence: the brief as the unit of change

*Recorded 2026-09-01, from the Lab 06 writer session's own accounting of its edit log, queried right after its run. The candidate rule under test — small fixes in place, meaning-changing edits regenerate the brief whole — was added to this study's `code.md` (How AI applies the code) the same day. The writer was asked for an honest accounting, violations as valuable as compliance.*

## The numbers

One whole-document generation, then two revision passes of ~28 Edit calls: roughly 5–6 whole-unit regenerations, ~22 in-place patches at sentence or bullet level.

- **Regenerated whole** (by judgment, once by accident of tool mechanics): the opening block, sections 4.4, 4.5 (pass two), 7, one paragraph of 4.1, one paragraph of 2.3. In each, the change altered what the unit said.

- **Accumulated piecewise, never regenerated**: 1.3 (five patches, surface touched twice), 3.2 (five patches); 2.1, 2.4, 3.1, 5 (two to four each). Notable pattern in 4.5: whole rewrite in pass two, then further in-place patches in pass three.

## Drift found

1. **Section 2's surface** promised four things its body did not deliver. Original-generation mismatch, caught only on the third pass, fixed by patching the surface sentence alone — a violation of the candidate rule that happened to work out (body verified from memory, not by regeneration).

2. **Section 1.3's surface** said "studies" where a bullet was a field report. Fixed by patching one word, piecewise, on a section that had already absorbed four other patches.

3. **Surviving drift in 4.5, caused by piecewise editing**: a confidence bound ("one user study, 16 people") was added in place, but the paragraph's frame ("the strongest reply the sweep found") and closing line still carry the weight written when the claim stood unqualified. The writer did not notice until asked.

## The writer's verdict

Complied by judgment about half the time meaning changed, once by accident, violated three times — and "the violations correlate exactly with where surface-body mismatch appeared or survived." Where units were regenerated whole, no drift appeared afterward.

**Addendum the run adds to the rule**: what actually protected coherence was the full-document re-read between passes — it caught two of the three drifts. A whole-unit re-read after any batch of in-place patches catches most of what piecewise editing breaks; the one drift that escaped was a confidence downgrade whose surrounding framing was not regenerated with it.
