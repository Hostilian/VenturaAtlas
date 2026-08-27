# OMEGA-XIX Track B — CHESSBOARD rigor-scale specification

## Step 3 verdict — mixed pass, with a hard ceiling

**Rigor held for eight deliberately bounded market-structure snapshots, but it did not become a validated business corpus.** Every selected idea has a stated boundary, named actors, a checkable source URL, control/dependency analysis, a moat and anti-moat, a falsifier, and a next research action. No competitor was inserted from memory without a live URL. The discipline held through idea 8; the main degradation was not fabricated competition but thinner comparability and weaker empirical buyer evidence in the regulatory and research-lineage ideas. By ideas 7–8, “available competitor” often meant an adjacent compliance platform or standard rather than an exact end-to-end replay/audit substitute. That is a structural warning, not permission to scale this template to 324 ideas.

The eight snapshots therefore prove that CHESSBOARD can preserve epistemic labels and source traceability at small scale. They do **not** prove demand, willingness to pay, legal sufficiency, coverage, or a durable moat. All scores remain corpus scores; Track B proposes review only and changes none.

## Scope and evidence contract

- Selected exactly eight ideas across six categories: Developer tools, AI evaluation, Data infrastructure, Scholarly Research & Lineage, Marketplaces, and Regulatory Handshake & Production-Failure Markets.
- A competitor claim is included only with a live, checkable URL. A product page proves the actor/product capability stated on that page; it does not prove market share, price, customer demand, superiority, or legal compliance.
- Labels used throughout: **OBSERVED** (directly stated by the linked source or repository), **SOURCE_SUPPORTED_INFERENCE** (limited inference from one or more observed capabilities), **MODEL_HYPOTHESIS** (mechanism that needs testing), and **UNKNOWN** (not established).
- “Moat” means a possible compounding advantage, never an achieved fact. Every moat and anti-moat has a falsifier.
- Scores are preserved. No `state.json`, `backlog.json`, ownership table, or `data/sources.json` was edited.
- The CHESSBOARD report remains private/ignored and non-authoritative for publication; this audit is a Track-B proposal and does not promote private payloads.

## Eight market-structure snapshots

### 1. idea-001 — ProofRail — AI Work Acceptance Gate

**Category:** Developer tools. **Boundary:** provider-neutral evidence and approval between an AI coding agent and merge/release; not a code-generation tool and not a generic CI runner.

**Actors and substitutes (all source-backed):**

- **LangSmith** — [evaluation docs](https://docs.langchain.com/langsmith/evaluation) describe offline datasets/evaluators and online production evaluation; [observability docs](https://docs.langchain.com/langsmith/observability) describe traces, dashboards, alerts, and feedback. **OBSERVED.** Its adjacency to ProofRail’s proposed acceptance layer is a **SOURCE_SUPPORTED_INFERENCE**, not proof of repository-policy acceptance.
- **Braintrust** — [evaluation docs](https://www.braintrust.dev/docs/evaluate) describe evaluation across development and production monitoring. **OBSERVED.** Its adjacency to a regression-evidence wedge is a **SOURCE_SUPPORTED_INFERENCE**.
- **DeepEval** — [introduction](https://deepeval.com/docs/introduction) describes an open-source framework with unit-test-style assertions, agent/tool-use metrics, and local-first execution. **OBSERVED.** Calling it a strong OSS substitute is a **SOURCE_SUPPORTED_INFERENCE**.
- **GitHub branch protection** — [official ruleset documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) is the control-plane substitute for required checks and merge gates. **OBSERVED.** Exact acceptance semantics and evidence lineage remain **UNKNOWN**.

**Control points and dependencies:** merge permissions and required checks are controlled by the repository host (**OBSERVED**, GitHub ruleset URL); model/provider traces depend on the chosen evaluator and telemetry vendor (**SOURCE_SUPPORTED_INFERENCE**, LangSmith/Braintrust URLs); acceptance requires customer policy, test suites, credentials, and a human owner (**MODEL_HYPOTHESIS**). A provider-neutral ledger is useful only if it can ingest these systems without becoming the new gatekeeper (**UNKNOWN**).

**Moat candidate:** a portable, signed history of agent inputs, changed files, policy checks, test evidence, approvals, and release outcomes could compound across providers (**MODEL_HYPOTHESIS**). **Falsifier:** five target teams can reproduce equivalent acceptance evidence with GitHub rulesets plus existing eval/CI tools in under one day and refuse a paid pilot.

**Anti-moat:** platform-native vendors can bundle acceptance into source control, CI, or agent products (**SOURCE_SUPPORTED_INFERENCE** from the control locations above). **Falsifier:** buyers require cross-provider evidence export and pay for a neutral ledger despite a native equivalent.

**Next research action:** sell one fixed-scope “release-proof packet” to five teams using their real agent run; measure setup hours, missing evidence, false blocks, reviewer time, and payment. Do not build a broad platform first.

**Score audit:** corpus values `competitiveAdvantage=9.1`, `defensibility=9.6`, `dataAdvantagePotential=8.8` are high analyst scores, not observed proof. Put all three in Track A’s proposed rescoring queue.

### 2. idea-051 — AgentLingo — Multilingual AI Agent Launch Gate

**Category:** AI evaluation. **Boundary:** native-language regression and release testing for voice/chat agents, including locale-specific policy and escalation behavior; not translation software.

**Actors and substitutes:**

- **LangSmith** — [evaluation lifecycle](https://docs.langchain.com/langsmith/evaluation) supports curated datasets, evaluators, offline regression, and online production monitoring. **OBSERVED.** Multilingual coverage is not established on this page; treat localization depth as **UNKNOWN**.
- **Braintrust** — [systematic evaluation](https://www.braintrust.dev/docs/evaluate) supports experiments and continuous production monitoring. **OBSERVED.** Native-language quality and locale-specific human review are **UNKNOWN**.
- **DeepEval** — [framework overview](https://deepeval.com/docs/introduction) lists conversational, agent, safety, RAG, and multimodal metrics and local execution. **OBSERVED.** Its role as a direct technical substitute for test execution is a **SOURCE_SUPPORTED_INFERENCE**; language-specific benchmark quality is **UNKNOWN**.
- **Humanloop** — [evaluation overview](https://humanloop.com/docs/v4/guides/evaluation/overview) describes code and LLM evaluators over datasets; [UI evaluation](https://humanloop.com/docs/v5/guides/evals/run-evaluation-ui) describes comparing prompts with datasets/evaluators. **OBSERVED**, with current service continuity requiring verification because the docs include a sunset notice.

**Control points and dependencies:** locale test-set ownership, native-speaker adjudication, speech-to-text/text-to-speech providers, model routing, and customer release policy (**MODEL_HYPOTHESIS**); evaluator platform APIs and stored traces are external dependencies (**SOURCE_SUPPORTED_INFERENCE**, URLs above). A test pack cannot establish accent fairness or cultural appropriateness without representative human review (**UNKNOWN**).

**Moat candidate:** permissioned, failure-labeled multilingual conversation packs tied to production incidents could improve regression sensitivity (**MODEL_HYPOTHESIS**). **Falsifier:** target teams prefer generic eval tools plus ad-hoc native-speaker review and will not pay for a reusable pack.

**Anti-moat:** general evaluation platforms already support datasets, custom evaluators, and online monitoring (**OBSERVED**, LangSmith/Braintrust/DeepEval). **Falsifier:** a narrow language/vertical pack cuts escaped failures or review time enough to command repeat payment.

**Next research action:** run 30 paired prompts in one language/vertical with three systems; have two native reviewers label correctness, politeness, refusal, and escalation; pre-sell a €199 release report.

**Score audit:** `competitiveAdvantage=6.8`, `defensibility=7.0`, and `dataAdvantagePotential=7.0` are medium analyst scores. Queue for evidence review, not automatic downward revision.

### 3. idea-060 — Policy-Journey Adherence Pack

**Category:** AI evaluation. **Boundary:** multi-step customer-support journeys—tool calls, escalation, refusal boundaries, and policy sequence—not single-turn answer scoring.

**Actors and substitutes:**

- **LangSmith** — [evaluation concepts](https://docs.langchain.com/langsmith/evaluation-concepts) explicitly discuss evaluating agent components, retrieval, tool invocations, and output formatting; [evaluation docs](https://docs.langchain.com/langsmith/evaluation) describe offline and online workflows. **OBSERVED.**
- **DeepEval** — [introduction](https://deepeval.com/docs/introduction) lists end-to-end, trajectory-based, agent, tool-use, conversational, and safety metrics. **OBSERVED.**
- **Braintrust** — [evaluation workflow](https://www.braintrust.dev/docs/evaluate) covers systematic experiments and continuous production monitoring. **OBSERVED.**
- **OpenAI Guardrails** — [official guardrails site](https://guardrails.openai.com/) describes prompt-injection, hallucination, custom prompt checks, and agentic guardrails. **OBSERVED.** It is a safety/control substitute, not proof of business-policy journey completion.

**Control points and dependencies:** policy owner and escalation matrix, tool/API permissions, conversation trace, evaluator rubric, and human adjudication (**MODEL_HYPOTHESIS**); guardrails/eval vendors control instrumentation and rule execution (**SOURCE_SUPPORTED_INFERENCE**, URLs above). Customer policy changes can invalidate a static pack (**UNKNOWN**).

**Moat candidate:** a versioned journey graph connecting policy clauses to expected tool trajectories and observed incidents could create switching cost (**MODEL_HYPOTHESIS**). **Falsifier:** a customer writes equivalent pytest/DeepEval/guardrail tests in a week and reports no incremental value.

**Anti-moat:** the core primitives—datasets, custom evaluators, trajectory inspection, and guardrails—are available from existing tools (**OBSERVED**). **Falsifier:** an industry-specific journey pack materially reduces policy escapes across two independent deployments.

**Next research action:** choose one support policy, collect ten real anonymized journeys, and measure journey-level false-pass/false-fail against two expert reviewers before offering a paid remediation report.

**Score audit:** `competitiveAdvantage=6.8`, `defensibility=7.1`, `dataAdvantagePotential=7.1`; queue for evidence review with explicit journey-level outcome data required.

### 4. idea-027 — Commerce Knowledge Graph Platform

**Category:** Data infrastructure. **Boundary:** governed links among catalog, content, inventory, policies, users, and transactions for AI commerce; not a generic graph database or PIM replacement by assertion.

**Actors and substitutes:**

- **Akeneo** — [Product Cloud](https://www.akeneo.com/akeneo-product-cloud/) describes centralizing, enriching, activating, and optimizing product information; [home page](https://www.akeneo.com/) describes PIM, DAM, syndication, and governance. **OBSERVED.**
- **Syndigo** — [Product Experience Cloud](https://syndigo.com/) describes PIM/MDM, syndication, retailer requirements, and product-data network workflows. **OBSERVED.**
- **Productsup** — [platform](https://www.productsup.com/) describes connecting product data to AI channels, enriching it, and delivering feeds to channels; [retail docs](https://help.productsup.com/retail) describe catalog onboarding and syndication. **OBSERVED.**
- **Google Merchant Center** — [official product-data help](https://support.google.com/merchants/answer/16488801?hl=en-uk) documents the platform’s product-data control surface. **OBSERVED.**

**Control points and dependencies:** product identifiers, PIM/MDM source of truth, inventory/price APIs, retailer/channel schemas, consented customer data, and LLM/agent retrieval surfaces (**SOURCE_SUPPORTED_INFERENCE** from the actor pages; exact customer architecture is **UNKNOWN**). Channel policies and identifiers can override graph semantics (**MODEL_HYPOTHESIS**).

**Moat candidate:** a permission-safe cross-system identity graph with proven joins and outcome feedback could compound (**MODEL_HYPOTHESIS**). **Falsifier:** two merchants achieve the same joins using Akeneo/Syndigo/Productsup exports plus a graph database and decline a paid pilot.

**Anti-moat:** incumbents already centralize, validate, enrich, and syndicate product data (**OBSERVED**, linked pages). **Falsifier:** a narrowly scoped graph delivers measurable reduction in unmatched products, feed errors, or agent hallucinations.

**Next research action:** take one merchant’s 1,000-SKU slice, define five join/error metrics, run a manual reconciliation against the incumbent PIM/feed, and obtain a paid data-quality engagement before building a platform.

**Score audit:** `competitiveAdvantage=8.4`, `defensibility=9.9`, `dataAdvantagePotential=9.4` appear unsupported by direct customer outcomes; highest-priority numeric rescoring candidate after idea-001.

### 5. idea-240 — Result Lineage Release Gate

**Category:** Scholarly Research & Lineage. **Boundary:** map every figure, table, numeric result, and empirical claim to data, scripts, environment, repository object, and release version; not merely a DOI repository.

**Actors and substitutes:**

- **Code Ocean** — [verification process](https://docs.codeocean.com/osl-guide/publishing-on-code-ocean/the-verification-process/code-oceans-verification-process-for-computational-reproducibility-and-quality) describes staff checks and reproducible run behavior; [Open Science Library](https://nature.codeocean.com/) describes a reproducibility tool. **OBSERVED.**
- **Whole Tale** — [documentation](https://wholetale.readthedocs.io/en/stable/) describes capturing code, data, environments, recorded runs, and publication artifacts. **OBSERVED.**
- **Renku** — [how it works](https://docs.renkulab.io/en/latest/docs/users/knowledge-base/about) describes collaborative reproducible projects and public sessions; [introduction](https://renku-docs.readthedocs.io/en/latest/introduction/what-is-renku.html) describes provenance across data, code, workflows, and environments. **OBSERVED.**
- **Zenodo** — [get started](https://help.zenodo.org/docs/get-started/) describes sharing and preserving research objects; [site](https://zenodo.org/) describes DOI, versioning, and GitHub preservation. **OBSERVED.**

**Control points and dependencies:** manuscript repository, data license, workflow environment, DOI/versioning system, publisher or funder policy, and human author sign-off (**SOURCE_SUPPORTED_INFERENCE** from the linked platforms; exact institutional policy is **UNKNOWN**). Closed or restricted data may block re-execution (**MODEL_HYPOTHESIS**).

**Moat candidate:** claim-level lineage templates and failure corpus across journals could lower audit cost and improve trust (**MODEL_HYPOTHESIS**). **Falsifier:** labs use Code Ocean/Whole Tale/Renku plus a checklist and show no paid need for claim-level gating.

**Anti-moat:** multiple mature open/reproducibility systems already capture executable artifacts and provenance (**OBSERVED**). **Falsifier:** editors or funders require a claim-to-artifact release gate and pay for it repeatedly.

**Next research action:** manually audit one accepted paper with 20 claims, time each link, record unavailable artifacts, and ask the lab/library to prepay a second audit. Treat no prepayment as a kill signal.

**Score audit:** alternate score `defensibility=75` (with `existingSpendingEvidence=85`, `painAndUrgency=85`, `speedToPaidTest=90`); no canonical competitiveAdvantage field. Evidence review only; do not numerically map it without Track A’s schema decision.

### 6. idea-043 — Regional Commerce Launchpad

**Category:** Marketplaces. **Boundary:** launch one-region specialty marketplaces using reusable commerce/trust modules; not a claim that local liquidity exists.

**Actors and substitutes:**

- **Sharetribe** — [marketplace software](https://www.sharetribe.com/) offers no-code marketplace creation, transactions, and custom extensions. **OBSERVED.**
- **Mirakl** — [Marketplace Platform](https://www.mirakl.com/products/marketplace-platform/) describes seller onboarding, catalog quality, operations, and marketplace scaling. **OBSERVED.**
- **Arcadier** — [platform](https://www.arcadier.com/) describes API-first B2C/B2B/P2P/services marketplace workflows and integration with existing stacks. **OBSERVED.**
- **Shopify App Store** — [official store](https://apps.shopify.com/) is a distribution/control surface for merchant apps and states a review process. **OBSERVED.** It is a substitute channel, not proof of marketplace liquidity.

**Control points and dependencies:** local supply acquisition, buyer demand, payments/payouts, identity, trust and safety, dispute resolution, logistics, and a platform host (**MODEL_HYPOTHESIS**); the cited platforms control core software primitives and policies (**OBSERVED**). Liquidity and repeat transactions are **UNKNOWN**.

**Moat candidate:** a dense, trusted regional supply/demand graph plus local operational playbooks could compound (**MODEL_HYPOTHESIS**). **Falsifier:** suppliers and buyers multi-home on Sharetribe/Mirakl/Arcadier or incumbent channels and no region reaches repeat liquidity after a paid concierge pilot.

**Anti-moat:** launch technology is available as configurable SaaS/API infrastructure (**OBSERVED**). **Falsifier:** one narrowly defined region/category achieves repeat transactions with lower acquisition cost because of local trust or supply exclusivity.

**Next research action:** interview 20 identifiable local suppliers and buyers, secure five signed supply commitments and three paid transactions manually, and measure dispute/support labor before software build.

**Score audit:** `competitiveAdvantage=7.6`, `defensibility=8.1`, `dataAdvantagePotential=7.2`; queue for rescoring because local-network claims are hypotheses.

### 7. idea-421 — Invoice Replay Cloud

**Category:** Regulatory Handshake & Production-Failure Markets. **Boundary:** replay a complete e-invoice path—ERP, tax logic, country schema, routing, authority/network response, buyer receipt, accounting import, correction, reconciliation—not a schema validator.

**Actors and substitutes:**

- **Avalara** — [E-Invoicing and Live Reporting](https://www.avalara.com/us/en/products/e-invoicing.html/) describes mandate-compliant creation/transmission, ERP connectors, validation, audit trails, and global API. **OBSERVED.**
- **Sovos** — [Compliance Network documentation](https://docs.sovos.com/en/indirect-tax/indirect-tax-products/einvoicing/compliance-network/about-sovos-compliance-network) describes mapping, proactive validation, authority transmission, archives, status, and audit trails. **OBSERVED.**
- **Pagero** — [ERP connectivity](https://www.pagero.com/uk/pagero-network/erp-connectivity) describes exchange, enrichment, compliance verification, and ERP integration. **OBSERVED.**
- **European Commission** — [eInvoicing building blocks](https://single-market-economy.ec.europa.eu/single-market/public-procurement/digital-procurement/einvoicing_en) describes official validator/conformance tools and eDelivery infrastructure. **OBSERVED.** This is a public substitute/control point, not a commercial competitor.

**Control points and dependencies:** ERP test client, tax rules, country schemas, Peppol/approved network or authority, buyer ingestion mapping, and mandate timing (**SOURCE_SUPPORTED_INFERENCE** from the linked pages and EU source). End-to-end buyer-system behavior is **UNKNOWN**; vendor sandbox coverage must be tested, not assumed.

**Moat candidate:** a permissioned corpus of production-like failure traces across countries and ERPs could reveal cross-system defects before go-live (**MODEL_HYPOTHESIS**). **Falsifier:** three e-invoicing vendors demonstrate their existing sandboxes cover lifecycle, routing, and buyer-SAP import failures and no target pays for an independent replay.

**Anti-moat:** incumbent tax networks already provide validation, routing, compliance, connectors, and audit trails (**OBSERVED**). **Falsifier:** a buyer pays for a replay that catches a failure their incumbent sandbox misses and repeats the test for a second country.

**Next research action:** obtain one authorized France or Poland test invoice, replay it through the customer’s real ERP and buyer import path, and charge €199–€499 for a signed failure report. Capture latency, labor, defect severity, and whether the customer changes a purchase.

**Score audit:** `overallScore=88` and green gate labels are provisional/inferred in the corpus; no canonical competitiveAdvantage field. Evidence review only; do not treat urgency or regulation as demand proof.

### 8. idea-426 — EAA Web Accessibility Evidence Audit

**Category:** Regulatory Handshake & Production-Failure Markets. **Boundary:** hybrid automated plus guided manual WCAG 2.1 AA audit with an evidence pack for EU businesses; not an overlay widget and not a legal opinion.

**Actors and substitutes:**

- **Deque axe** — [Axe Platform](https://www.deque.com/axe/) describes automated testing, monitoring, reports, and human expertise; [ruleset documentation](https://docs.deque.com/devtools-for-web/4/en/rulesets/) explicitly warns automated systems cannot test 100% of a standard. **OBSERVED.**
- **AudioEye** — [platform](https://www.audioeye.com/) describes AI automation, expert audits, fixes, and risk insights. **OBSERVED.**
- **W3C** — [WCAG 2.1](https://www.w3.org/TR/WCAG21/) is the stable technical reference standard for web accessibility. **OBSERVED.** It is a standards/control point, not a paid competitor.
- **European Commission EAA** — [official EAA page](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en) identifies covered products/services, including e-commerce, and explains the EU implementation framework. **OBSERVED.** National applicability, exemptions, and enforcement detail remain **UNKNOWN** until jurisdiction-specific review.

**Control points and dependencies:** WCAG success criteria, browser/device/assistive-technology matrix, manual tester competence, customer remediation ownership, and national enforcement interpretation (**SOURCE_SUPPORTED_INFERENCE** for WCAG; national legal interpretation **UNKNOWN**). Automated scan coverage is not equivalent to conformance (**OBSERVED**, Deque ruleset URL).

**Moat candidate:** a repeatable, human-reviewed evidence pack tied to customer workflows and remediation history could create trust and recurring monitoring (**MODEL_HYPOTHESIS**). **Falsifier:** small businesses accept low-cost automated/overlay alternatives and reject a €299 manual audit after seeing the evidence boundary.

**Anti-moat:** Deque and AudioEye already combine automation, reporting, and expert services (**OBSERVED**). **Falsifier:** a narrow EU-SME package delivers faster, cheaper, auditable evidence and converts three independent paid audits.

**Next research action:** audit one consented e-commerce site against a fixed WCAG 2.1 AA subset, record automated/manual split, hours, findings, and remediation acceptance; ask for payment before expanding scope. Do not promise legal defensibility until counsel validates wording.

**Score audit:** `overallScore=87`, legal urgency, and “government acknowledged” labels are provisional corpus metadata; no canonical competitiveAdvantage field. Evidence review only; verify EAA applicability and local enforcement with a qualified specialist.

## Step 4 — reconcile MERCURY and CHESSBOARD’s FactBounty asks

They describe **one shared first real-world experiment with two roles**, not two unrelated experiments.

- **MERCURY’s ask:** find one lawfully reachable, consented shopper; present the bounded €5 offer; record accept or reject; stop on refusal. This establishes whether a real buyer will pay at all.
- **CHESSBOARD’s ask:** run that paid narrow-vertical request after showing free alternatives and capture the structural fields: exact variant, latency, payout, labor, cost, refund/dispute, purchase effect, data/rights, and later reuse. If it clears, repeat to a 20-request cohort; if not, kill the marketplace wedge.

Therefore both reports need to be acted on, but the first payment can be the same transaction. MERCURY owns commercial/customer evidence; CHESSBOARD owns substitute comparison, control-point mapping, and the repeat/kill interpretation. A refusal ends the experiment; it does not justify a 20-request cohort.

## Step 5 — Track A proposals (not applied)

### Proposed ownership rows

| Area | Proposed Track A row | Boundary / handoff |
|---|---|---|
| CHESSBOARD schema | `schemas/chessboard-workspace.schema.json` | Schema and epistemic contract; Track B proposes, Track A applies. |
| CHESSBOARD core | `assets/js/core/chessboard-store.js` | State normalization/parity; no ownership-table edit here. |
| CHESSBOARD engine | `assets/js/features/chessboard-engine.js` | Strategic brief, event, contradiction, stress, and structural-tension logic. |
| CHESSBOARD lab | `assets/js/features/chessboard-lab.js` | UI wiring and evidence display. |
| CHESSBOARD validator | `scripts/validate-chessboard.js` | Strict/private validation and publication-gate warnings. |
| CHESSBOARD tests | `tests/chessboard-engine.test.js`, `tests/chessboard-contract.test.js` | Contract, parity, static-marker, and gate tests. |
| CHESSBOARD docs | `docs/chessboard.html` | Public UI shell; private payloads remain excluded. |
| CHESSBOARD private data | `.agent-state/chessboard/**` | Private/non-authoritative evidence boundary; never publish by default. |
| TERRAIN | `TBD after Track A identifies TERRAIN paths` | Track B proposes a placeholder only; no assignment or file change. |
| OMEGA-XIX audit | `research/audits/OMEGA-XIX-20260827T135453Z/**` | Track-B proposal artifacts; does not own Track A authority files. |

### Proposed rescoring queue

1. **idea-001:** review `competitiveAdvantage=9.1`, `defensibility=9.6`, `dataAdvantagePotential=8.8`; high scores rely on a mechanism not yet observed in customer deployments.
2. **idea-027:** review `competitiveAdvantage=8.4`, `defensibility=9.9`, `dataAdvantagePotential=9.4`; incumbent PIM/MDM/feed controls make the moat claim especially falsifiable.
3. **idea-043:** review `competitiveAdvantage=7.6`, `defensibility=8.1`, `dataAdvantagePotential=7.2`; network density and local trust are hypotheses until transactions repeat.
4. **idea-051 and idea-060:** evidence-review queue for `defensibility`/`dataAdvantagePotential` in the 7-range; do not auto-zero, but require paid outcome and human-agreement evidence.
5. **idea-240, idea-421, idea-426:** evidence-review only. Their alternate/provisional score systems do not map cleanly to the canonical fields; Track A should decide mapping before any numeric change.

No score has been changed by Track B.

## Source index

The live sources used in the eight snapshots are the linked official pages embedded above: LangSmith, Braintrust, DeepEval, Humanloop, OpenAI Guardrails, Akeneo, Syndigo, Productsup, Google Merchant Center, Code Ocean, Whole Tale, Renku, Zenodo, Sharetribe, Mirakl, Arcadier, Shopify App Store, Avalara, Sovos, Pagero, European Commission eInvoicing, Deque axe, AudioEye, and W3C WCAG 2.1. URL presence is part of the acceptance contract; page contents and availability must be rechecked before a public product or legal claim.
