---
under: the code
kind: brief
---

# What the practice of writing things down buys

Four lanes of the sweep examined the practices organisations use to write knowledge down — documentation frameworks, decision records, review processes, and the profession that carries them. This is where the gap between adoption and evidence is widest, and it is wide enough to be the finding rather than a caveat on it.

## 1. The canonical texts are experience reports

Every practice in this territory has one document everybody cites, and in every case that document is one person's account of what worked for them. Diátaxis cites no research and its own site says the argument is self-contained. Nygard's 2011 post on architecture decision records offers, as its entire evidence, that the format had been used "on a few of our projects since early August." Malte Ubl's "Design Docs at Google" has zero citations and zero data. RFC 2026's stated warrant is "the result of a number of years of evolution, driven… by experience." Oxide's RFD 1 justifies itself with "writing down ideas is important."

None of this makes the practices wrong. It means they carry no authority to lend, and anyone building on them is building on preference, not on findings.

## 2. What predicts whether a document survives

A document's half-life is set by whether something downstream consumes it: artifacts that *generate* something — code, tests, other artifacts — get kept current, and artifacts that merely describe do not. That single sentence predicts most of the decay reported below, which is why it is given here rather than left to be discovered.

It is a finding about organisations, and its evidence — a design-science study across practitioners in six companies — lives in its one home, [`people/structure.md`](../people/structure.md) §3.

## 3. Where measurement was attempted, it went badly

DORA is the only large-N effort to link documentation to outcomes, and it reversed on itself in public across five annual reports, ending with the construct removed. The first study ever to look for an effect of ADRs on code quality or productivity found "at most, modest observable effects at scale." A controlled study of documentation *format* on architecture understanding, N = 65, found no significant effect and identified prior exposure to the code as the dominant factor. And on document *review* — the practice of a second reader catching what the first missed — two findings replicate and both are nulls.

[`evidence.md`](evidence.md) holds the measurement attempts, including the one genuinely causal line — Carroll's minimal manual — and the one organisation that restructured content and measured the result.

## 4. The frameworks, read at full strength

Diátaxis is weaker than its adopters think and stronger than its critics allow; DITA is not dying but calcifying; docs-as-code won the tooling and lost the measurement. The most useful single fact is that Diátaxis's author explicitly disclaims the file-per-type reading everyone took from it, and that the best-documented adoption failure — Google's Pigweed — retreated from page-per-type to sections within a page because users would not follow the links. Two more belong beside the three: Wikipedia's summary style, a twenty-year working instance of readable-alone-and-nested that nobody in this territory cites, and spec-driven development, the practice nearest to writing knowledge up front for an agent, whose one cost measurement is bad. [`frameworks.md`](frameworks.md) holds them.

## 5. Records of decisions, and processes for making them

Architecture decision records, RFCs, PEPs, KEPs and design docs form one body with a consistent shape: the practice spreads, nobody measures it, and the heavyweight version accumulates a backlog with no exit path. The one intervention with a visible before-and-after in any of the data is not process reform but scope reduction — Python's domain councils, Rust's major change proposals — routing around the heavyweight process with a lighter one. [`records.md`](records.md) holds it.

## 6. The profession that carried it

The Society for Technical Communication ceased operations on 29 January 2025 and filed Chapter 7. DITA 2.0 is years into beta with no Committee Specification, and its specification has, empirically, one committer. The conference taxonomy that used to name structured authoring now names AI. [`profession.md`](profession.md) holds the state of the field that produced these practices.
