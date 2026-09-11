---
under: the code
kind: brief
---

# The market around derived interfaces

Three agents covered the commercial layer: low-code platforms, open-source internal-tool builders, and the vibe-coding companies. The verdict is bifurcation with one real casualty class, and one reversal that is the load-bearing datum for anyone betting on derived interfaces.

## 1. The casualty class is the proprietary visual runtime

**Airtable** was sold to Bending Spoons for **$1.285 billion cash**, announced 2026-08-04, on approximately **$480 million of annual recurring revenue growing over 20% year on year** — about 2.7× revenue, after a 2021 peak valuation above $11.7 billion and a secondary-market mark near $4 billion by January 2026. It had cut 20% of staff in December 2022 and 27% in September 2023.

**Wix** cut about **20% of staff, roughly 1,000 people**, communicated 2026-05-28 and filed in June, with a $30–35 million restructuring charge and guidance reduced. The cause named in the filing is the realignment plus "a more pronounced slowdown… in the growth of our **Partners** business" — the agencies and freelancers who build sites for others.

**Pegasystems** told the SEC on 2026-07-21: "**Unprecedented changes in the AI market caused clients to delay their purchasing decisions. As a result, our ACV growth rate significantly slowed.**" First-half revenue **down 1%** year on year, first-half GAAP net income down 60%. This is the hardest evidence that AI is denting low-code demand — and note the mechanism is **purchase-decision paralysis, not substitution**. Buyers are waiting, not leaving.

## 2. Governed enterprise automation is fine

**Appian** Q2 2026: total revenue **$203.3 million, up 19%**; cloud subscriptions up 23%; cloud net ARR expansion 115%; adjusted EBITDA doubled. Accelerating. Tellingly, its own boilerplate now reads "process automation technology" — the words "low-code" are gone. Pega Cloud ACV still grew 22% even as total ACV grew 7%.

## 3. The market relocated rather than vanished

**Lovable**: $100M annualised revenue in July 2025, $200M in November, $400M in February 2026, **$500M by June 2026** with 146 employees and a million new projects a week; **$400M raised at $13.3 billion on 2026-08-12**. **Replit**: $150M annualised at a $3 billion valuation in September 2025, then a **$9 billion valuation in March 2026**. **Base44**, acquired by Wix for $80 million at six months old, reached about $100 million annualised, with gross margin going from near-zero to about 60% after Wix shipped its own model.

Lovable and Replit alone are roughly $650 million of annual revenue that did not exist in 2024 — approximately Airtable's entire revenue, created in twenty-four months.

Two caveats travel with all of these. Every ARR figure is a company claim based on annualising current monthly revenue, not confirmed by filings; one report notes the data is self-reported and "inherently skews toward enthusiasts." And the acknowledged weakness is maintenance — "You think you're 80% done because the thing works on your machine. In reality, you're about 20% done."

## 4. The reversal that matters

**Retool relaunched on React and TypeScript on 2026-06-17**, stating that generating code "is now the fastest way to build custom software" and that its own abstractions were a liability that "**prevented LLMs from working fluently**." It now *imports* applications built in the vibe-coding tools and wraps them in permissions and audit, repositioning as the governance and deployment layer rather than the builder. Its own survey of 307 senior technology executives found **93% concerned about vibe-coded tools in production** and only **8%** with strong centralised internal-tool governance.

**Read precisely, that is not a verdict against derivation. It is a verdict against closed, non-inspectable derivation.** Every survivor's remaining moat is typed contracts — data access rules, permission inheritance, schema, governance. The implication is a constraint, not a refutation: the contracts are the asset, the artefact the derivation emits must be inspectable, and the renderer must not be a walled garden. Betting on a closed declarative runtime is betting on the one thing Retool just spent a platform rewrite escaping.

## 5. The open-source builders are alive and pivoting to agents

All shipping, all repositioning. **NocoDB** 64.7k stars, releases current, company quiet. **ToolJet** 40.8k stars with the hardest pivot — its repository description now reads "the open-source foundation of ToolJet AI — the enterprise app generation platform." **Appsmith** 40.7k stars, flat commercially after a 25% layoff in 2023, with an agents product. **Budibase** 28.2k stars, very high release cadence, description repositioned to "AI agents, automations and apps."

**Directus is the discontinuity.** 37.5k stars and genuinely maintained, but: GPL to Business Source License in 2023; then in April 2026 "Evolving Our License for Long-Term Sustainability," and with Directus 12 (2026-06-10) a **new license plus active license-key enforcement**. Self-hosted now defaults to a capped core tier — **3 seats, 25 collections, 5 flows** — with single sign-on, custom permission rules and custom models **ceasing to work** without a key after a 30-day grace period. Free commercial use only via a grant for entities under $5 million revenue and 50 employees. No acquisition, no funding round, no layoffs found — the license tightening reads as a monetisation squeeze in lieu of new capital.

Two security notes worth carrying, because they are what happens when generated applications meet production: an actively exploited account-takeover vulnerability in one platform in January 2026, and an unauthenticated remote-code-execution disclosure in another in April 2026.

Reports: [`ace1709b4a562f194`](../../../../../sweep-2026-08/raw/ace1709b4a562f194.md), [`a6a6eb69ff6791915`](../../../../../sweep-2026-08/raw/a6a6eb69ff6791915.md), [`ae0322198c23f4ec2`](../../../../../sweep-2026-08/raw/ae0322198c23f4ec2.md), [`a57740ddd62e39ab6`](../../../../../sweep-2026-08/raw/a57740ddd62e39ab6.md).
