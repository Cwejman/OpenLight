---
under: the code
kind: brief
---

# Structure beats artifacts

The hardest evidence in the organisational lane is not about documents at all. It is about how an organisation is shaped, and it out-predicts everything measurable about the code. This brief holds that finding, the two results that bound what a document can add, and the one distinction that predicts whether a document survives.

## 1. Conway's Law, measured at Vista scale

Nagappan, Murphy & Basili, ICSE 2008. Windows Vista: **3,404 binaries, over 50 million lines of code**, eight organisational metrics in a logistic regression, 50 random splits. Precision and recall for predicting failure-proneness:

| predictor | precision | recall |
|---|---|---|
| organisational structure | **86.2** | **84.0** |
| code coverage | 83.8 | 54.4 |
| code complexity | 79.3 | 66.0 |
| code churn | 78.6 | 79.9 |
| dependencies | 74.4 | 69.9 |
| pre-release bugs | 73.8 | 62.9 |

The engineers did not know they were being studied, which limits reverse-causal behaviour. All the data comes from one system, and it has not been replicated at this scale.

**The mirroring hypothesis** is directionally supported and badly underpowered: MacCormack, Baldwin & Rusnak (*Research Policy* 2012), five matched product pairs measuring "propagation cost" — 47.1% against 7.7% in one pair, over 41% against 8.25% in another. The loosely-coupled organisation produced the more modular product in all five pairs; the significance claim is a sign test, p = 0.03125. The *inverse* manoeuvre — deliberately restructuring teams to obtain an architecture — has **no empirical support at all**; it is an inference from a correlational result.

Note the corollary for any project spanning an organisational boundary: if mirroring holds, a contractual seam becomes an architectural seam, with propagation costs differing by a factor of five or six between loosely and tightly coupled organisational forms.

## 2. Documentation is second behind mentorship

Rastogi, Thummalapenta, Zimmermann, Nagappan & Czerwonka (ESEM 2015): **411 professional developers at Microsoft** plus version-control data across eight product groups, outcome measured as time to first check-in.

On the closed question, documentation is the strongest of twelve listed factors: "lack of proper documentation" *strongly* increased time to first check-in in five of seven product groups and moderately in the other two, ahead of access and permissions, dependencies, and legacy code.

On the open question, where developers named factors freely, the ranking is: **(1) Mentorship, (2) Documentation, (3) Process, (4) Access and permissions, (5) System setup.** Developers "who were not assigned mentors experienced that absence of mentor resulted in significant loss of time."

**Corroborated, at far larger N, from an independent direction.** The Stack Overflow 2025 Developer Survey, 49,000 respondents: 84% using or planning AI tools and 51% of professionals using them daily, but **46% actively distrust accuracy against 33% trusting**, with 66% naming "almost right, but not quite" as the top complaint — and **when AI fails, 75.3% seek humans, not documentation.** That is the largest single datum in the sweep on the document-versus-person question, and it points the same way as the onboarding ranking. *(From [`a1c816c1f7cbcfdf9`](../../../sweep-2026-08/raw/a1c816c1f7cbcfdf9.md).)*

Two hard caveats: the paper obscures its time units for confidentiality, so there is no absolute effect size, and the factor rankings are opinion data rather than measured causal effects. Their measured correlations for ramp-up time were "negligible to weak," +0.10 to −0.39.

## 3. The distinction that predicts survival

Wohlrab et al., *Journal of Software: Evolution and Process* 2019 — design science across **53 practitioners in six automotive companies**. Two findings.

Practitioners robustly distinguish *boundary objects* from *locally relevant artifacts*, with about 90% questionnaire agreement (n = 31; 94.12% among those with a year or more of agile experience). The artifacts most often named as boundary objects were requirements (17 of 31), architecture models (6) and interface descriptions (6).

And the one that governs everything: **"Stakeholders' motivation to manage prescriptive models is higher than dealing with descriptive artifacts."** Artifacts that *generate* code, tests or other artifacts get kept current. Artifacts that only describe do not.

Their guidelines follow from it and are blunt. Produce locally relevant artifacts, especially documentation, **as late as possible and only when actually needed**. Re-evaluate boundary objects at frequent intervals, because "it can happen that boundary objects lose their common identity."

## 4. What this predicts, and does

The finding in §3 explains the decay numbers elsewhere in this corpus without needing any further mechanism: half of all architecture decision records written once and abandoned ([`../writing/records.md`](../writing/records.md) §1), nine in ten documents of one large internal wiki having had no views or updates in the months before it was deprecated ([`../writing/records.md`](../writing/records.md) §4), and nearly a third of a curated, governed ontology registry inactive or orphaned ([`../substrate/formal-kr.md`](../substrate/formal-kr.md) §1). In each case the artifact described, and nothing downstream consumed it.

That is the most actionable finding in the whole sweep for anyone designing a body of written knowledge.

## 5. What could not be established

No causal study of documentation against an *organisational* outcome exists — no randomised trial, no quasi-experiment, no interrupted time series with documentation as the manipulated variable and an organisational outcome measured. Individual-task experiments do exist; see [`../writing/evidence.md`](../writing/evidence.md) §7. No true replication of Szulanski. No verified effect sizes from the most relevant meta-analysis of inter- and intra-organisational knowledge transfer, which was paywalled. And no credible primary source for the outsourcing-trust findings or for the productivity numbers attached to team-topology frameworks.

Report: [`abdf5bfa14a7ddd82`](../../../sweep-2026-08/raw/abdf5bfa14a7ddd82.md).
