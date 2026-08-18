# EU AI Act Compliance Evidence Gate — Deep Dive
*Depth pass on the Winner pick from the gap-fill reset. Authoritative over the initial summary.*

---

## The Correction, Up Front

The initial gap-fill pass stated enforcement "began August 2, 2026". That timeline is now updated: **Regulation (EU) 2026/1744, the Digital Omnibus on AI, was published in the Official Journal on July 24, 2026 and entered into force on July 27, 2026**.

It is enacted law, not a pending proposal. It pushed the standalone high-risk (Annex III: hiring tools, credit scoring, biometric ID, education/vocational access, migration, law enforcement, justice) compliance deadline from August 2, 2026 to **December 2, 2027** — a 16-month deferral, confirmed by Council on June 29, 2026. Annex I (high-risk AI embedded in regulated products, e.g. medical devices) moved to August 2, 2028.

---

## What's Live as of Today (August 18, 2026)

| Obligation | Status | Applies to |
|---|---|---|
| Article 5 — prohibited practices | In force since Feb 2, 2025 | Everyone |
| Article 4 — AI literacy | In force since Feb 2, 2025; wording softened by Omnibus (July 27, 2026) to "support the development of" | Every provider and deployer, no size floor |
| GPAI model rules + AI Office | In force since Aug 2, 2025 | Mainly model providers, not typical SME deployers |
| Article 50 — transparency (chatbot disclosure, AI-generated content marking) | **Unaffected by the Omnibus — applies from Aug 2, 2026** | Businesses using AI chatbots or generating synthetic content |
| Annex III — high-risk standalone | Deferred to Dec 2, 2027 | Hiring/credit/biometric/education/justice-adjacent AI specifically |
| Annex I — high-risk embedded | Deferred to Aug 2, 2028 | AI as a safety component of regulated products |

The genuinely current obligation for most AI-using small businesses is **Article 4** (broad but soft) and **Article 50** (transparency — chatbots & synthetic content — live since August 2, 2026). High-risk Annex III penalties (€15M / 3% global turnover cap) are deferred to December 2027.

---

## Competitive Landscape

### Enterprise Tier ($8k–$75k+/yr)
- **Platforms:** Vanta (~$15K–$60K/yr), Drata (~$15K–$75K/yr), Secureframe (~$15K–$50K/yr), Sprinto (~$8K–$30K/yr), OneTrust, Credo AI, Holistic AI, Monitaur.
- **Positioning:** Priced far above solo/micro businesses and small SMEs.

### Self-Serve / Cheap Tier (Direct Competitors)
- **ComplianceAgent:** $49 one-time "EU AI Act Compliance Scanner" — 12-section report with risk classification, obligation mapping, and deadline calendar.
- **Legalithm:** Free tool suite for EU startups/SMEs (applicability checker & documentation guide).
- **EuroComply:** Free-to-start, Frankfurt-hosted workspace covering AI Act + GDPR + NIS2 + DORA + Pay Transparency with regulatory-change alerts.

### Czech-Specific Landscape
- **PwC Czech Republic:** AI Compliance Tool delivered via Big 4 consulting engagements.
- **hmara.digital:** Prague digital agency providing AI integration with Czech-language handling and GDPR/AI Act compliance via custom dev services.
- **No Direct Competitor:** No direct, cheap, self-serve, **Czech-language** compliance tool turned up in the research.

---

## Czech Regulatory Landscape: 5 Enforcement Bodies

Under the Czech Republic's draft Adaptation Act, enforcement is split across five distinct bodies:

1. **ÚNMZ (Úřad pro technickou normalizaci, metrologii a státní zkušebnictví):** Conformity-assessment notifying authority.
2. **ČTÚ (Český telekomunikační úřad):** Primary market surveillance authority and public contact point for general AI Act inquiries.
3. **ÚOOÚ (Úřad pro ochranu osobních údajů):** Surveillance authority for privacy-related AI aspects and Article 50 biometric/GDPR overlap.
4. **ČNB (Česká národní banka):** Market surveillance for financial-sector AI systems (credit scoring, risk evaluation).
5. **ČAS (Česká agentura pro standardizaci):** National regulatory sandbox coordinator.

---

## Revised Strategic Idea: Czech/CEE Localization Wedge

The generic, English-language "cheap AI Act scanner for any EU SME" market is already occupied by shipping products (ComplianceAgent, Legalithm, EuroComply).

**Winning Pivot:** A **Czech-language (extendable to Polish/Slovak/Hungarian) AI Act + Article 50 compliance simplifier**.
- Explains which of the 5 Czech enforcement bodies applies to a given SME business.
- Translates "support the development of AI literacy" (Art. 4) and "mark synthetic content" (Art. 50) into concrete, localized tasks.
- Fits existing portfolio patterns (AgentLingo, PSTN Accent & Noise Regression Suite, Indie Game Launch-Language Preflight) using localization as a defensible moat.

---

## 10-Dimension Custom Evaluation Matrix

| Dimension | Score /5 | Rationale |
|---|---|---|
| Regulatory urgency (real, current) | 3 | Article 50 live; Annex III deferred 16 months |
| Market size (Czech/CEE-only) | 2 | Deliberately narrowed; trades size for defensibility |
| Competitive intensity | 4 | Low for Czech-language angle; high for generic English |
| Fit with $0–$100 build | 4 | Intake form + LLM classification + PDF generator |
| Time to first revenue | 4 | One-time report model ($49 precedent) ships fast |
| Defensibility / moat | 3 | Language + local-authority specificity |
| Founder-fit with existing skills | 4 | Direct extension of RAG & Model Regression Gates |
| Monetization clarity | 3 | One-time fee easy; recurring monitoring subscription harder at small scale |
| Regulatory risk (moving law) | 2 | Omnibus saga proves ongoing legal tracking burden |
| Customer acquisition (Czech market) | 3 | Targeted reach via Czech founder & SME networks |

**Unweighted Average Score:** 3.2 / 5.

---

## $0–$100 Build Plan (Czech-Localized Version)

1. **Obligation Decision Tree:** Translate and structure Article 4, Article 50, and the Czech Adaptation Act's 5-authority split into a Czech-language decision engine.
2. **Short Intake Form:** Collect company size, AI tools used (ChatGPT, Copilot, Midjourney, custom models), and use cases.
3. **Automated Report Generation:** Output a timestamped, versioned Czech-language PDF compliance report mapping local authority, live obligations, and concrete action items.
4. **Targeted GTM:** Distribute through Czech startup/SME communities, LinkedIn founder groups, and Prague tech hubs.
5. **Recurring Monitoring:** Send regulatory alert updates whenever Czech transposition law or EU guidance shifts (recurring subscription trigger).
