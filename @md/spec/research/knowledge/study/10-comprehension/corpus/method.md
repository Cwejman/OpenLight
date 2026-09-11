---
under: the code
kind: brief
---

# How the sweep was made, and what it can bear

Every figure in this corpus inherits the conditions of the sweep that produced it. Those conditions are unusual enough to change how the numbers should be read, and they are stated here once rather than repeated in every brief.

## 1. What was gathered

Forty-five agents worked one pass on 2026-08-26, each briefed on a territory and told to hunt contradictions rather than confirmations. Eighteen runs are named in the sweep's own register and twenty-seven are sub-agents those spawned, whose briefs were not recorded — a fact recorded by that register, not by any report.

**So the reports are not forty-five independent observations.** Most of the twenty-seven inherit a parent's brief and framing. At least two are revisions of or reactions to a sibling's output: one opens "The card-sorting sweep landed. It **changes the verdict** on section 4." Where this corpus says a finding recurs across the sweep, read that as convergence across a partly shared lineage, not as forty-five independent confirmations. Reports were written to a fixed skeleton — headline, map, load-bearing findings with URL and date, what moved, what could not be established, leads — so the parts most often lost in compression are present in the raw: the negative findings, the precise N values, and the leads.

Each agent graded its own claims. The vocabulary recurs across reports and is used throughout this corpus: **shipped-and-adopted**, **shipped-niche**, **announced**, **paper-only**, **opinion**. A claim graded *paper-only* is a real published result with no deployment behind it; a claim graded *opinion* is an assertion, whoever made it.

## 2. The two biases

**Search budgets were exhausted.** Most reports open by saying the session's 200 web searches were spent before work began, so the agent fell back on direct fetches — GitHub, npm, PyPI, arXiv, Crossref, OpenAlex, SEC EDGAR, W3C, HN Algolia. This over-samples anything with a public repository, a changelog or a machine-readable endpoint, and under-samples blog posts, conference talks, trade press, vendor whitepapers, non-English material and academic venues behind paywalls. Several agents say plainly that their absences in those areas are unproven rather than established.

**Almost nothing in the agent-facing lane is peer-reviewed.** The agent that worked it says so outright: "I found no ICSE/FSE/ASE/MSR *proceedings* version of any of the above — all are arXiv preprints, so **venue-grade peer review is absent across the board**." That covers the whole of [`agents/`](agents/README.md) — the context-file nulls, the representation study, the localisation result, the tool-description interventions — which is to say it covers this corpus's most load-bearing conclusion. Those are the cleanest experiments in the sweep *and* the least reviewed, and both halves are true at once.

**Paywalls shaped the evidence.** ACM, IEEE, Elsevier and SAGE returned 403 to most fetches. The consequence is systematic: effect sizes and sample sizes for older, better-designed studies are often the thing that could not be verified, while repository star counts and release dates are verified to the day. The corpus is therefore sharper about the health of software than about the strength of science.

## 3. The fabrication that was caught

One agent caught an automated summariser inventing verbatim quotations and sample sizes, in two separate places, and it names one: the summariser produced "N=22, 10 companies" for Szulanski 1996, whose real figures are 271 observations across 122 transfers in 8 companies, and invented verbatim quotes for a requirements-quality review. That agent re-verified roughly half its findings by extracting text directly from primary PDFs. A second agent, in the graph-retrieval lane, flagged one table of its own numbers as having come through a page summariser rather than its own read of the source — a precaution rather than a catch, and this corpus carries that flag where those numbers appear.

The lesson governs the whole corpus. A figure here is worth what its agent's own verification note says it is worth, and no more. Where an agent marked something unverified, this corpus marks it too.

## 4. What the sweep was sent to answer

The sweep was commissioned against two documents the project already held: a fifteen-rung ladder of knowledge-structure rules, and a coverage chart surveying eleven territories in one pass. The chart's own status line governed it — every source was as a fleet returned it, "not yet followed by a human head," a lead rather than ground. The chart flagged two claims as actively not to cite and three sources as unfetched; everything else was a URL nobody had opened.

That is what this sweep was for: to follow those leads and see which held. The answer, territory by territory, is what this corpus carries. The chart's own closing caveat still applies to it and to this: every territory was tasted by one head in one pass, briefed by us, which means the framing travelled into the findings.

Report: [`a583337921a4f7975`](../../../../sweep-2026-08/raw/a583337921a4f7975.md).

### 4.1 The questions it was sent to settle

The commission named the questions a literature sweep could plausibly answer, and keeping the list is what lets a reader tell "the sweep answered this" from "the sweep never looked."

**Does the redundancy effect apply to models?** — whether people and models want incompatible documents, and whether a one-artifact design needs a derived twin for the machine reader. *Answered, partly and unexpectedly*: the redundancy effect does not support the rule it is cited for even in people ([`reading/text-design.md`](reading/text-design.md) §8), and the human-model convergence question turns out to have no shared metric ([`agents/context-files.md`](agents/context-files.md) §4).

**Does a model chunk at all**, or are headings its only chunking mechanism rather than a convenience? — *Not answered.* The sweep found that carrying headings into chunks helps retrieval, which is not the same question.

**Is there a size ceiling on writing a thing whole** — does rewrite-whole survive a corpus past what one rewrite holds? — *Not answered. Nothing in the sweep addresses it.*

**The Diátaxis challenge** — must a document blending explanation, how-to and reference split into typed files behind one entry? Named in the commission as the strongest outside challenge. *Answered*, in [`writing/frameworks.md`](writing/frameworks.md) §§1–2.

**Which facts are derivable from the code** rather than retyped — *not entered*; the API-documentation territory was left out.

**Does compounding hold for a model reader** — is absorptive capacity bounded by prior shared context, or does retrieval flatten it? — *Not answered as posed.* What the sweep returned is that absorptive capacity is a property of the human receiver ([`people/transfer.md`](people/transfer.md) §2) and that context degrades by composition ([`agents/context-engineering.md`](agents/context-engineering.md) §1).

**What is the test for "this cannot be written"** — the codify-versus-personalize boundary. *Not answered*; the nearest evidence is that when assistance fails, professionals go to people ([`people/structure.md`](people/structure.md) §2).

**The depth and breadth numbers** — *answered, negatively* ([`reading/bounded-head.md`](reading/bounded-head.md)).

**Onboarding, and the fact that a human reader is not blank** — *answered* ([`people/structure.md`](people/structure.md) §2).

## 5. What the sweep did not enter

Named by the coverage chart as left out, and not entered by the sweep either: design systems and Figma as source of truth; localisation, and what a reader in another language does to an English corpus; API documentation standards as the derived-documentation case; teaching materials for the mechanics in their own register; the economics of who pays for documentation; and the vehicle question — whether markdown in a repository is the end form.
