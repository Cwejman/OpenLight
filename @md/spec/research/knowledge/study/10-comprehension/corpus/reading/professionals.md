# How professionals actually read

Two agents were sent to find out whether the student results transfer to people reading documents as part of their work. The answer is that the transfer is narrow, the best professional studies point the opposite way from the folklore, and the dominant failure in long professional documents is finding the right part rather than understanding it.

## 1. Expertise does not shield a reader from bad prose

The single best-designed professional-reader experiment in the sweep is Martínez, Mollica & Gibson, *PNAS* 2023 (PMC10266064). Two preregistered experiments: n = 105 practising lawyers, compared against a reanalysis of n = 108 laypeople on identical materials. There were main effects of register *and* of legal training on recall and comprehension, and **no register × legal-training interaction** — recall p = 0.360, comprehension p = 0.638. In a second experiment, n = 102 lawyers rated simplified contracts equally enforceable and higher on overall quality, style, author hireability and likelihood of client signature. Results were robust to years of practice.

Its companion, *Cognition* 2022, gives the mechanism: a corpus analysis of ≈10 million words showing contracts disproportionately loaded with low-frequency jargon, **centre-embedded clauses**, passives and non-standard capitalisation relative to nine baseline genres; two experiments, N = 184, found these features reduced recall and comprehension "even for experienced readers," with centre-embedding inhibiting recall more than the others.

Expertise is a main effect, not a moderator. It raises the whole curve and buffers nothing. An independent population agrees from the software side: the validation survey behind the API-documentation problem taxonomy found no statistically significant evidence that novices experienced documentation problems differently from experienced developers ([`../writing/evidence.md`](../writing/evidence.md) §1).

## 2. Expertise reversal has no professional evidence at all

The meta-analysis is strong: Tetzlaff, Simonsmeier, Peters & Brod (2025), *Learning and Instruction* 98:102142 — PRISMA, 60 experimental studies, 176 effect sizes, N = 5,924. Low-prior-knowledge learners d = 0.505 [0.260, 0.750] favouring high assistance; high-prior-knowledge learners d = −0.428 [−0.647, −0.209]; difference-of-differences d = 0.971 [0.631, 1.312]. No publication bias detected.

The moderator table is where it breaks for this purpose. Educational status has five levels — Primary, Secondary, **Vocational Training**, Higher Education, Other — and **there is no category for practising professionals, because there were no such studies to code**. The nearest proxy, vocational training, gives a high-prior-knowledge estimate of d = −0.23, 95% CI [−1.41, 0.95], p = 0.702 — a null with an interval spanning 2.4 d units, from three studies. The authors' own illustrative example of a "large expertise difference" compares hairdressers at the end of their vocational training with psychology students. PubMed holds 31 records total for the phrase; a search for worked-example trials with residents versus attendings returns zero.

Two further facts cut against the usual reading. The effect is **asymmetric**: adding assistance for novices is a larger effect than removing it for experts. And within every single education stratum the high-knowledge harm is non-significant — secondary p = .72, higher education p = .75, vocational p = .70 — which suggests much of the "helping experts hurts them" half is a comparison across education levels rather than across expertise within one.

## 3. Retrieval, not comprehension, is the failure mode

This is the one place aviation and medicine converge independently.

Kilsdonk et al., *Int J Med Inform* 2016;86:10-19 — think-aloud with 13 healthcare professionals preparing two consults from a paper guideline. The finding: the guideline **did not support practitioners in finding patient-specific recommendations**; the failure was retrieval and navigation, not comprehension.

Burian, NASA/TM-2014-218382 — a table-top analysis of 11 quick-reference handbooks and 2 electronic checklist systems across five aircraft types. Memory-item-bearing checklists per handbook range 1–22; total memory items 1–87; of 239 memory items coded, 79% challenge-response, 8% sentence-form, 12% not action items at all. Navigation findings: flow lines are hard to follow across pages and when nested; exclusive conditional sets are easier when marked *as a set*; some checklists chain jumps for no evident reason. NASA's most detailed handbook analysis tags the load-bearing usability questions — optimal placement, do-confirm versus read-do, error rates by item type — as "Further Research Needed."

## 4. Specificity correlates with use

Grol et al., *BMJ* 1998;317(7162):858-61 — 61 general practitioners, 12,880 decisions, 47 recommendations from 10 national guidelines, 12 attributes. Overall compliance 61%. **Vague or non-specific recommendations were followed in 36% of cases (826/2,280) against 67% for clear ones (7,089/10,600).** Also controversial 35% versus non-controversial 68%, requiring a change to routines 44% versus not 67%, evidence-based 71% versus not 57%.

It is observational and confounded — specificity, controversy and required behaviour change are entangled attributes of the same recommendations — but it is large, and it is real professionals making real decisions.

## 5. Preference is not comprehension

Brandt et al., *BMJ Open* 2017;7(2):e011569 is the only randomised format trial in practising clinicians: **181 physicians** across seven hospitals and two primary-care settings in Lebanon, Norway, Spain and the UK, randomised to a multilayered versus a standard narrative guideline format. Preference: **72% [65–79] against 16% [10–22]**. Correct understanding: **72% versus 58%, p = 0.06**. Appropriate clinical action: **98% versus 92%, p = 0.10**. Overwhelming preference, unproven comprehension gain.

Any format claim resting on practitioner preference surveys should be graded down accordingly. There is a second, colder version of the same lesson from the software side — a controlled study finding that document *format* made no difference to architecture understanding — and it lives in [`../writing/evidence.md`](../writing/evidence.md) §5.

## 6. The artifact does not carry the effect

The cleanest natural experiment available on whether a well-designed procedural document changes outcomes at scale is the surgical-checklist sequence, and it deflates.

Haynes, *NEJM* 2009;360(5):491-9 — 8 hospitals, 3,733 patients before and 3,955 after; death 1.5% → 0.8%, p = 0.003; complications 11.0% → 7.0%, p < 0.001. Before-after, no concurrent control.

Urbach, *NEJM* 2014;370(11):1029-38 — 101 hospitals, 109,341 before and 106,370 after. Adjusted mortality OR 0.91 [0.80–1.03], p = 0.13; complications OR 0.97 [0.90–1.03], p = 0.29. **Null.**

Haugen, *Ann Surg* 2015;261(5):821-8 — the only randomised trial, stepped-wedge cluster, 2 hospitals, 2,212 control against 2,263 checklist procedures; complications 19.9% → 11.5%, p < 0.001; mortality fell significantly in one of two hospitals and not overall.

The pattern is coherent: where a checklist is introduced as an engaged programme it works; where it is mandated by policy across a system it does not. Designing the artifact is necessary and radically insufficient.

## 7. Thirty-five years of unvalidated convention

Degani & Wiener, NASA CR-177549 (1990) is the source of almost every checklist design convention in aviation: jumpseat observation of 42 crews over 72 flights and ~140 flight hours, plus 15 interviews, incident reports and manufacturer interviews. **No experiments, no comparative outcome data.** Its 16 guidelines are explicitly "not specifications." Three are directly transferable, and the third cuts against a rule this project holds. **(7)** subdivide a long checklist into chunks associated with systems and functions. **(10)** put the most critical items as close as possible to the beginning, which "should take precedence" when it conflicts with spatial or logical ordering. And **(11) duplicate critical items across task-checklists**, which is the guideline as written and no wider.

That last is a thirty-five-year-old safety convention in the one professional domain where the opposite of one-fact-one-home is standard practice. It is observational, like the rest of the report, and it belongs beside the finding that the redundancy effect does not support the single-home rule either ([`text-design.md`](text-design.md) §8). Three further guidelines are worth knowing: **(4)** a response should portray the desired status or value, not merely "checked"; **(6)** an explicit completion call as the last written item; **(12)** avoid tight coupling, provide buffers.

The report distinguishes challenge-response from the do-list and tabulates practice across 20 airlines, and **presents no evidence that either method performs better** — it quotes the NTSB asking. Thirty-five years on there is still no comparative performance evidence. Any claim here is folklore.

ASD-STE100, Simplified Technical English, is mandated across an industry and cites no studies in its own materials. Its entire empirical base is two small paywalled papers from one lab on an internal-combustion-engine maintenance task, ~30 years old, one of which found Simplified English reduced errors while a hybrid version *increased* them, with no interaction with participant experience.

## 8. What developers actually spend time on

Three instrumented studies, and they do not conflict once the denominators are checked.

**Xia, Bao, Lo, Xing, Hassan & Li, *IEEE TSE* 44(10), 2018** — the strongest. 78 professional developers across 7 real projects at two companies, 10 working days each, **3,148 effective working hours**, monitored across *all applications* rather than only the IDE, with a tool-versus-manual validation discrepancy under 0.23%. Comprehension **57.62%**, navigation 23.96%, other 13.40%, **editing 5.02%**. Where the reading happens: web browsers 27.26%, IDEs 19.95%, document editors 10.38% (ANOVA F = 32.4, p < 0.001) — a large share of "reading code" is reading documentation and forums. Comprehension time falls monotonically with experience: low / medium / high = **66.37% / 55.97% / 44.43%** (F = 79.4, p < 2.2e-16, pairwise Cohen's d "large").

Read that carefully against §2, because it sits two sections from the expertise-reversal material and is not it. This is the best-powered expertise finding in the sweep, and what it says is that experts spend proportionally *less* time comprehending — which is what expertise is supposed to buy. It sits alongside, not against, the finding that experience does not moderate documentation difficulty: experts read faster, and are blocked by the same content defects as everyone else.

**Minelli, Mocci & Lanza, ICPC 2015** — the 70% figure is real (69.85% unweighted, 68.5% time-weighted) but fragile: N = 18 "professionals and academics," over 85% of the data from three PhD students, Pharo IDE only, and "comprehension" is *defined* as every inter-action gap longer than one second, which the authors themselves flag may be the programmer checking a phone.

**Meyer, Barton, Fritz, Murphy & Zimmermann, *IEEE TSE* 2017** — 20 professionals at four companies, ~11 full workdays each, whole-day denominator: coding (read, edit, navigate) **21.0%**, email 14.5%, work-related browsing 11.4%, documents 6.6%, meetings 9.9%. Developers averaged 8.4h spans with 4.3h active input; 24.4% of the day is collaborative.

## 9. Reading is non-linear, and less linear with expertise

Busjahn, Bednarik, Begel, Crosby, Paterson, Schulte, Sharif & Tamm, ICPC 2015, "Eye Movements in Code Reading: Relaxing the Linear Order." 14 novices — non-computer-science university students — followed linear story order ~80% on natural-language text against ~70% on source code. **6 professional engineers with 5–28 years' experience showed only ~60% linearity on code**, with more saccades skipping intermediate lines. Directionally solid; six experts is very small.

The field's base rate: Sharafi, Soh & Guéhéneuc's systematic review of eye-tracking in software engineering, 1990–2014, 36 publications, is roughly 28 student-based studies to 6 professional, with typical N between 10 and 30.

## 10. What could not be established, and it matters

No study anywhere in this sweep measures how a professional's use of a document changes over months of repeated exposure. The generalisation gap flagged in the education literature is not closed by the professional literature; it is simply unaddressed. Nor is there any eye-tracking study of physicians reading clinical guidelines (PubMed returns zero), any empirical study of lawyers' reading process or contract-review workflow, or any instrumented measure of time spent reading *documentation* as a separate category beyond the application-level splits above.

## 11. The one design verdict the lane produced

The agent that read this literature end to end closed with a design verdict, and it is the only direct prescription anywhere in the sweep. Invest in correctness, completeness, currency, findability, normative worked examples and an explicit purpose-specific reading procedure — and do not invest in format, in layering depth, or in stripping guidance for expert readers. *Reasoned by one agent from the studies in §§1–9 above; not itself measured, and it cuts against the presumption that arrangement is the lever.*

Reports: [`a4071d48c3f5d869c`](../../../../../sweep-2026-08/raw/a4071d48c3f5d869c.md), [`aec803bcd71ce9745`](../../../../../sweep-2026-08/raw/aec803bcd71ce9745.md), [`af3e6b7e48703f0a0`](../../../../../sweep-2026-08/raw/af3e6b7e48703f0a0.md). The per-stratum figures in §2 are from [`adc8fe8e64ae23f70`](../../../../../sweep-2026-08/raw/adc8fe8e64ae23f70.md), which re-read the same meta-analysis.
