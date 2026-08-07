# generate-eighth-reset-dossiers.ps1
# Generates full Markdown dossiers for ideas 061-070 from ideas.json
# Run from repo root: powershell -ExecutionPolicy Bypass -File scripts\generate-eighth-reset-dossiers.ps1

param()

$ideas = Get-Content "data\ideas.json" -Raw | ConvertFrom-Json
$eighth = $ideas | Where-Object { $_.id -match "idea-06[1-9]|idea-070" } | Sort-Object id

function Safe($v) {
    if ($null -eq $v -or "$v" -eq '') { return 'Not yet specified' }
    return "$v"
}
function BulletList($arr) {
    if ($null -eq $arr -or $arr.Count -eq 0) { return "- Not yet specified" }
    return ($arr | ForEach-Object { "- $_" }) -join "`n"
}
function InlineList($arr) {
    if ($null -eq $arr -or $arr.Count -eq 0) { return "Not yet specified" }
    return ($arr -join ", ")
}

foreach ($i in $eighth) {
    $slug = $i.slug
    $name = $i.name
    $id   = $i.id

    Write-Host "Generating: $id - $name"

    $ag   = $i.atAGlance
    $cust = $i.customer
    $prod = $i.product
    $prof = $i.profitability
    $mkt  = $i.market
    $val  = $i.validation
    $gtm  = $i.goToMarket
    $ops  = $i.operations
    $risk = $i.risks
    $ap   = $i.actionPlan
    $sc   = $i.scores
    $cs   = $i.compositeScores
    $prov = $i.provenance
    $fab  = $i.futureAiBuild
    $ep   = if ($prof -and $prof.earningPotential) { $prof.earningPotential } else { $null }

    # Build scores table
    $scoreLines = [System.Collections.Generic.List[string]]::new()
    if ($sc) {
        $sc.PSObject.Properties | ForEach-Object {
            $dim = $_.Name
            $entry = $_.Value
            if ($entry -and $null -ne $entry.value) {
                $v = $entry.value
                $c = if ($entry.confidence) { $entry.confidence } else { "medium" }
                $j = if ($entry.justification) { ($entry.justification -replace "\|", "/") } else { "See ideas.json" }
                $scoreLines.Add("| $dim | $v | $c | $j |")
            }
        }
    }
    $scoreSec = $scoreLines -join "`n"

    # Related ideas
    $relLines = [System.Collections.Generic.List[string]]::new()
    if ($i.relatedIdeaIds -and $i.relatedIdeaIds.Count -gt 0) {
        foreach ($rid in $i.relatedIdeaIds) {
            $rel = $ideas | Where-Object { $_.id -eq $rid }
            if ($rel) {
                $rslug = $rel.slug
                $rname = $rel.name
                $relLines.Add("- [$rid — $rname]($rslug.md)")
            } else {
                $relLines.Add("- $rid")
            }
        }
    } else {
        $relLines.Add("- No explicit related ideas recorded yet. See other Product verification and evidence ideas (idea-061 through idea-070).")
    }
    $relatedSec = $relLines -join "`n"

    # Source references
    $srcLines = [System.Collections.Generic.List[string]]::new()
    if ($i.sourceReferences -and $i.sourceReferences.Count -gt 0) {
        foreach ($s in $i.sourceReferences) {
            $srcLines.Add("- **$($s.id)**: $($s.title) ($($s.author), $($s.year)) - $($s.url)")
        }
    } else {
        $srcLines.Add("- Source references pending full annotation. See data/sources.json for all 62 sources.")
    }
    $sourceSec = $srcLines -join "`n"

    # Composite scores block
    $csLines = [System.Collections.Generic.List[string]]::new()
    if ($cs) {
        $cs.PSObject.Properties | ForEach-Object {
            $csLines.Add("- **$($_.Name):** $($_.Value)/100")
        }
    }
    $compositeSec = $csLines -join "`n"

    # Profitability scenarios
    $scenLines = [System.Collections.Generic.List[string]]::new()
    $scenLines.Add("| Scenario | Customers | Monthly ARPC | Monthly revenue | Annual revenue | Gross margin | Monthly operating costs | Monthly operating profit |")
    $scenLines.Add("|---|---:|---:|---:|---:|---:|---:|---:|")
    if ($prof -and $prof.scenarios -and $prof.scenarios.Count -gt 0) {
        foreach ($s in $prof.scenarios) {
            $gm = if ($s.grossMargin) { "$([math]::Round($s.grossMargin * 100, 0))%" } else { "~70%" }
            $mr = [math]::Round($s.customers * $s.monthlyARPC)
            $ar = [math]::Round($s.customers * $s.monthlyARPC * 12)
            $gv = if ($s.grossMargin) { $s.grossMargin } else { 0.70 }
            $op = [math]::Round($s.customers * $s.monthlyARPC * $gv - $s.monthlyOperatingCosts)
            $scenLines.Add("| $($s.label) | $($s.customers) | `$$($s.monthlyARPC) | `$$mr | `$$ar | $gm | `$$($s.monthlyOperatingCosts) | `$$op |")
        }
    } else {
        $scenLines.Add("| Conservative | 5 | `$25 | `$125 | `$1,500 | 70% | `$500 | -`$413 |")
        $scenLines.Add("| Base | 20 | `$40 | `$800 | `$9,600 | 72% | `$800 | -`$224 |")
        $scenLines.Add("| Aggressive | 80 | `$60 | `$4,800 | `$57,600 | 80% | `$3,500 | `$340 |")
    }
    $scenarioSec = $scenLines -join "`n"

    # Evidence/assumptions/unknowns from provenance
    $evidLines = [System.Collections.Generic.List[string]]::new()
    if ($prov -and $prov.evidence -and $prov.evidence.Count -gt 0) {
        foreach ($e in $prov.evidence) {
            $evidLines.Add("- $($e.type) - $($e.claim) ($($e.confidence); $($e.sourceId))")
        }
    } else {
        $evidLines.Add("- source_record - The concept appears in the Deep Research Eighth Full Reset corpus. (medium)")
        $evidLines.Add("- analyst_interpretation - The enriched analysis was generated from the concept and methodology. (low-medium)")
    }
    $evidSec = $evidLines -join "`n"

    $assumpLines = [System.Collections.Generic.List[string]]::new()
    if ($prov -and $prov.assumptions -and $prov.assumptions.Count -gt 0) {
        foreach ($a in $prov.assumptions) { $assumpLines.Add("- $a") }
    } else {
        $assumpLines.Add("- All financial numbers are editable analyst scenarios, not promises.")
        $assumpLines.Add("- Market size is intentionally left unknown without source-backed bottom-up research.")
        $assumpLines.Add("- Direct competitor and current price facts require fresh verification.")
    }
    $assumpSec = $assumpLines -join "`n"

    $unknLines = [System.Collections.Generic.List[string]]::new()
    if ($prov -and $prov.unknowns -and $prov.unknowns.Count -gt 0) {
        foreach ($u in $prov.unknowns) { $unknLines.Add("- $u") }
    } else {
        $unknLines.Add("- Actual accessible market size")
        $unknLines.Add("- Buyer prepayment rate and willingness to pay")
        $unknLines.Add("- Channel conversion rates")
        $unknLines.Add("- Repeat purchase frequency")
        $unknLines.Add("- Support and review burden per transaction")
    }
    $unknSec = $unknLines -join "`n"

    # Action plan 7/30/90 day lists
    function PlanList($arr, $default) {
        if ($arr -and $arr.Count -gt 0) { return ($arr | ForEach-Object { "- $_" }) -join "`n" }
        return $default
    }
    $ap7Default = "- Create one realistic example output`n- Build prospect list of 25`n- Conduct 15 interviews/outreach attempts`n- Make a paid offer`n- First delivery plan"
    $ap30Default = "- Serve 3-10 pilots`n- Measure costs and corrections`n- Publish one consented case study`n- Automate repeated steps`n- Re-score idea"
    $ap90Default = "- Choose narrow ICP`n- Ship self-serve vertical slice`n- Build repeat channel`n- Track cohort economics`n- Stop or expand based on evidence"
    $checkDefault = "- Define trigger`n- Name payer`n- Show deliverable`n- Ask for payment`n- Measure labor`n- Record objections`n- Protect data`n- Set kill date"

    $ap7Sec  = if ($ap -and $ap.plan7Days) { PlanList $ap.plan7Days $ap7Default } else { $ap7Default }
    $ap30Sec = if ($ap -and $ap.plan30Days) { PlanList $ap.plan30Days $ap30Default } else { $ap30Default }
    $ap90Sec = if ($ap -and $ap.plan90Days) { PlanList $ap.plan90Days $ap90Default } else { $ap90Default }
    $checkSec= if ($ap -and $ap.checklist) { PlanList $ap.checklist $checkDefault } else { $checkDefault }

    # 48h plan
    $plan48Sec = if ($val -and $val.plan48Hours) { 
        if ($val.plan48Hours -is [Array]) { ($val.plan48Hours | ForEach-Object { "- $_" }) -join "`n" }
        else { $val.plan48Hours }
    } else { "- Create one example deliverable`n- Build prospect list of 25`n- Conduct five conversations`n- Make a paid offer" }

    # Moats
    $moatLines = [System.Collections.Generic.List[string]]::new()
    if ($mkt -and $mkt.moats) {
        if ($mkt.moats -is [Array]) {
            foreach ($m in $mkt.moats) { $moatLines.Add("- $m") }
        } elseif ($mkt.moats.PSObject.Properties) {
            $mkt.moats.PSObject.Properties | ForEach-Object {
                $moatLines.Add("- **$($_.Name):** $($_.Value)")
            }
        } else { $moatLines.Add("- $($mkt.moats)") }
    } else {
        $moatLines.Add("- Proprietary verified product-evidence graph")
        $moatLines.Add("- Two-sided buyer/responder network")
        $moatLines.Add("- Data moat from verified facts that compound over time")
    }
    $moatSec = $moatLines -join "`n"

    # Fields with fallback
    $oneSentence  = Safe $i.oneSentenceConcept
    $detailed     = if ($i.detailedDescription) { $i.detailedDescription } else { $i.elevatorPitch }
    $tagStr       = InlineList $i.tags
    $altStr       = if ($i.alternativeNames -and $i.alternativeNames.Count -gt 0) { InlineList $i.alternativeNames } else { $name }
    $srcRefStr    = if ($i.sourceReferences -and $i.sourceReferences.Count -gt 0) { InlineList ($i.sourceReferences | ForEach-Object { $_.id }) } else { "See data/sources.json" }
    $provenanceSt = if ($prov -and $prov.provenanceStatus) { $prov.provenanceStatus } else { "Direct from Deep Research Eighth Full Reset (2026-08-06)" }

    # atAGlance fields
    $agCustomer   = if ($ag -and $ag.targetCustomer) { Safe $ag.targetCustomer } else { Safe $cust.primaryCustomer }
    $agProblem    = if ($ag -and $ag.problem) { Safe $ag.problem } else { Safe $cust.specificProblem }
    $agWhatBuild  = if ($ag -and $ag.whatToBuild) { Safe $ag.whatToBuild } else { Safe $prod.mvpDefinition }
    $agMoney      = if ($ag -and $ag.howItMakesMoney) { Safe $ag.howItMakesMoney } else { Safe $prof.revenueStreams }
    $agWhyPay     = if ($ag -and $ag.whyCustomersPay) { Safe $ag.whyCustomersPay } else { "The customer pays because the product produces a faster, safer, more verifiable outcome than existing alternatives." }
    $agEarning    = if ($ag -and $ag.earningPotential) { Safe $ag.earningPotential } else { "USD scenario range; not a forecast" }
    $agCost       = if ($ag -and $ag.startupCost) { Safe $ag.startupCost } else { "USD 0-100 scenario range" }
    $agMvp        = if ($ag -and $ag.timeToMvp) { Safe $ag.timeToMvp } else { "5-14 days" }
    $agRevTime    = if ($ag -and $ag.timeToFirstRevenue) { Safe $ag.timeToFirstRevenue } else { "1-14 days" }
    $agProfit     = if ($ag -and $ag.profitabilityCondition) { Safe $ag.profitabilityCondition } else { "Contribution margin per request must exceed acquisition, infrastructure, and support costs." }
    $agScore      = if ($cs -and $cs.overallOpportunity) { $cs.overallOpportunity } else { "N/A" }
    $agConf       = if ($sc -and $sc.overallConfidence -and $sc.overallConfidence.value) { $sc.overallConfidence.value } else { "N/A" }
    $agAdvantage  = if ($ag -and $ag.mainAdvantage) { Safe $ag.mainAdvantage } else { Safe $i.elevatorPitch }
    $agRisk       = if ($ag -and $ag.mainRisk) { Safe $ag.mainRisk } else { "Market validation required before significant investment." }
    $agValidation = if ($ag -and $ag.bestNextValidation) { Safe $ag.bestNextValidation } else { "Interview 15 target buyers about the last occurrence and ask for a paid pilot." }

    $content = @"
# $name

> $oneSentence

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | ``$id`` |
| Target customer | $agCustomer |
| Problem | $agProblem |
| What to build | $agWhatBuild |
| How it makes money | $agMoney |
| Why customers pay | $agWhyPay |
| Earning potential | $agEarning |
| Startup cost | $agCost |
| Time to MVP | $agMvp |
| Time to first revenue | $agRevTime |
| Profitability condition | $agProfit |
| Overall opportunity score | $agScore/100 |
| Confidence | $agConf/10 |
| Main advantage | $agAdvantage |
| Main risk | $agRisk |
| Best next validation | $agValidation |

## Identity and Provenance

- **Canonical ID:** ``$id``
- **Legacy ID:** ``$($i.legacyId)``
- **Slug:** ``$slug``
- **Category:** $($i.category)
- **Status:** $($i.status)
- **Tags:** $tagStr
- **Alternative names:** $altStr
- **Source references:** $srcRefStr
- **Provenance status:** $provenanceSt

$detailed


## Customer Perspective

- **Primary Customer:** $(Safe $cust.primaryCustomer)

- **Economic Buyer:** $(Safe $cust.economicBuyer)

- **Daily User:** $(Safe $cust.dailyUser)

- **Customer Type:** $(Safe $cust.customerType)

- **Current Situation:** $(Safe $cust.currentSituation)

- **Specific Problem:** $(Safe $cust.specificProblem)

- **Frequency:** $(Safe $cust.frequency)

- **Pain And Cost:** $(Safe $cust.painAndCost)

### Current Alternatives
$(BulletList $cust.currentAlternatives)

- **Alternative Gaps:** Alternatives may be fragmented, generic, difficult to verify, or disconnected from the customer's exact workflow.

### Jobs To Be Done

- **Functional:** $(if ($cust -and $cust.jtbd -and $cust.jtbd.functional) { Safe $cust.jtbd.functional } else { "Get verified, objective, physical evidence for a specific product before purchase." })

- **Emotional:** $(if ($cust -and $cust.jtbd -and $cust.jtbd.emotional) { Safe $cust.jtbd.emotional } else { "Feel confident that the purchase decision is right, not based on unverified claims." })

- **Social:** $(if ($cust -and $cust.jtbd -and $cust.jtbd.social) { Safe $cust.jtbd.social } else { "Demonstrate evidence-backed decision-making to peers, partners, or colleagues." })

- **Desired Outcome:** $(if ($cust -and $cust.jtbd -and $cust.jtbd.desiredOutcome) { Safe $cust.jtbd.desiredOutcome } else { "A reliable result with less time, lower risk, and clear evidence of what happened." })

### Trust Requirements
$(BulletList $cust.trustRequirements)

### Rejection Reasons
$(BulletList $cust.rejectionReasons)

### Switch Reasons
$(BulletList $cust.switchReasons)

### Continuing Payment Reasons
$(BulletList $cust.continuingPaymentReasons)

### Measurable Value
$(BulletList $cust.measurableValue)

### Acquisition Channels
$(BulletList $cust.acquisitionChannels)

### Objections
$(BulletList $cust.objections)

### Retention Drivers
$(BulletList $cust.retentionDrivers)

### Churn Risks
$(BulletList $cust.churnRisks)

- **Customer Pays Because:** $(Safe $cust.customerPays)

- **Idea Satisfies Customer By:** $(Safe $cust.ideaSatisfiesCustomer)

## Product Definition

- **Product Type:** $(Safe $prod.productType)

- **User Experience:** $(Safe $prod.userExperience)

### Main Workflow
$(BulletList $prod.mainWorkflow)

### Core Features
$(BulletList $prod.coreFeatures)

### Supporting Features
$(BulletList $prod.supportingFeatures)

### Admin Features
$(BulletList $prod.adminFeatures)

### Integrations
$(BulletList $prod.integrations)

### Ai Capabilities
$(BulletList $prod.aiCapabilities)

### Non Ai Capabilities
$(BulletList $prod.nonAiCapabilities)

### Security Requirements
- least privilege access for all roles
- encrypted transport (HTTPS/TLS everywhere)
- secret management (environment variables, not hardcoded)
- input validation and output schema enforcement
- dependency audits and security update cadence
- audit logs for consequential actions

### Privacy Requirements
- data minimization (collect only what is needed for the transaction)
- purpose limitation (no repurposing of buyer or responder data)
- retention controls with documented deletion schedules
- export and deletion mechanisms for user data
- no AI training on customer data without explicit consent

### Compliance Considerations
- Map jurisdictions and product role before launch (DSA, GDPR, Czech Trade Law apply)
- Do not claim legal certification without obtaining it
- Obtain legal review for regulated or marketplace flows, particularly DSA intermediary status
- Small firm exemptions may reduce DSA obligations initially; verify thresholds

### Accessibility Considerations
- WCAG-oriented semantics on all interactive elements
- keyboard navigation throughout
- visible focus indicators
- non-color status cues (do not rely on color alone)
- clear, plain-language error text

- **Automation Level:** $(Safe $prod.automationLevel)

- **Human Involvement:** $(Safe $prod.humanInvolvement)

- **Mvp Definition:** $(Safe $prod.mvpDefinition)

### Version Two
$(BulletList $prod.versionTwo)

- **Long Term Vision:** $(Safe $prod.longTermVision)

### Do Not Build Initially
$(BulletList $prod.doNotBuildInitially)

### User Journey
$(BulletList $prod.userJourney)

## What Future AI Should Build

- **Exact System:** $(Safe $fab.exactSystem)

### Automatic Work
$(BulletList $fab.automaticWork)

### Human Approval
$(BulletList $fab.humanApproval)

### Model Capabilities
$(BulletList $fab.modelCapabilities)

### Tools And Integrations
$(BulletList $fab.toolsAndIntegrations)

### Knowledge Sources
$(BulletList $fab.knowledgeSources)

### Suggested Stack
$(BulletList $fab.suggestedStack)

### Components
$(BulletList $fab.components)

### Data Flow
$(Safe $fab.dataFlow)

### Api Endpoints
$(BulletList $fab.apiEndpoints)

### Database Entities
$(BulletList $fab.databaseEntities)

- **Authentication:** Passkeys or OAuth/OIDC with organization roles; avoid custom password handling where possible.

- **Payments:** Stripe Connect hosted checkout and webhooks; keep the provider authoritative for payment state.

- **Mvp Complexity:** $(Safe $prod.mvpComplexity)

### Build Sequence
$(BulletList $prod.buildSequence)

### Safety Guardrails
$(BulletList $fab.safetyGuardrails)

### Failure Handling
$(BulletList $fab.failureHandling)

### Analytics Events
$(BulletList $fab.analyticsEvents)

### Logging Monitoring
$(BulletList $fab.loggingAndMonitoring)

### Evaluation Criteria
$(BulletList $fab.evaluationCriteria)

- **First Prototype:** $(Safe $prod.firstPrototype)

## Profitability Analysis

- **Revenue model:** $(Safe $prof.revenueModel)
- **Pricing model:** $(Safe $prof.pricingModel)
- **Expected ARPC scenario:** $(Safe $prof.expectedARPC)
- **Gross-margin scenario:** $(Safe $prof.grossMarginScenario)
- **CAC scenario:** $(Safe $prof.cacScenario)
- **LTV scenario:** $(Safe $prof.ltvScenario)
- **Target LTV:CAC:** $(Safe $prof.targetLtvCac)
- **Payback:** $(Safe $prof.payback)
- **Break-even model:** Monthly fixed costs / (average monthly revenue per customer minus average monthly variable cost per customer).

### Three Editable Scenarios

$scenarioSec

All values above are analyst assumptions for decision support. They are not promises, valuations, or market facts.

### Known Facts
$(BulletList $prof.knownFacts)

### Research-Supported Estimates
$(BulletList $prof.researchSupportedEstimates)

### Analyst Assumptions
$(BulletList $prof.analystAssumptions)

### Unknowns Requiring Validation
$(BulletList $prof.unknownsRequiringValidation)

## What Must Be True for This Idea to Be Profitable

- **Required Customer Volume:** $(Safe $prof.whatMustBeTrue.requiredCustomerVolume)
- **Minimum Viable Price:** $(Safe $prof.whatMustBeTrue.minimumViablePrice)
- **Maximum Cac:** $(Safe $prof.whatMustBeTrue.maximumCac)
- **Retention Or Frequency:** $(Safe $prof.whatMustBeTrue.retentionOrFrequency)
- **Required Gross Margin:** $(Safe $prof.whatMustBeTrue.requiredGrossMargin)
- **Maximum Service Cost:** $(Safe $prof.whatMustBeTrue.maximumServiceCost)
- **Conversion Rate:** $(Safe $prof.whatMustBeTrue.conversionRate)
- **Automation Level:** $(Safe $prof.whatMustBeTrue.automationLevel)
- **Sales Cycle:** $(Safe $prof.whatMustBeTrue.salesCycle)
- **Critical Partnerships:** $(Safe $prof.whatMustBeTrue.criticalPartnerships)
- **Regulatory Dependencies:** $(Safe $prof.whatMustBeTrue.regulatoryDependencies)
- **Technical Dependencies:** $(Safe $prof.whatMustBeTrue.technicalDependencies)
- **Market Timing:** $(Safe $prof.whatMustBeTrue.marketTiming)
- **Team Capabilities:** $(Safe $prof.whatMustBeTrue.teamCapabilities)
- **Unprofitable Conditions:** $(Safe $prof.whatMustBeTrue.unprofitableConditions)


## Earning Potential

- **Most Realistic Outcome:** bootstrapped software, productized service, data business, or marketplace depending on validation

- **First Paying Customer:** A paid pilot in the range of the stated bounty or fee is the practical first milestone.

- **Side Business:** $(if ($ep -and $ep.sideBusiness) { Safe $ep.sideBusiness } else { "`$5k-`$50k annual revenue scenario if founder-led and narrow." })

- **Small Company:** $(if ($ep -and $ep.smallCompany) { Safe $ep.smallCompany } else { "`$100k-`$1m annual revenue requires repeatable acquisition and standardized delivery." })

- **Seven Figure:** $(if ($ep -and $ep.sevenFigure) { Safe $ep.sevenFigure } else { "Possible only with recurring or transaction revenue, strong retention, and reduced founder labor." })

- **Venture Scale:** $(if ($ep -and $ep.ventureScale) { Safe $ep.ventureScale } else { "Not assumed; possible if the workflow expands into infrastructure, a network, or a proprietary data layer." })

### Annual Revenue Range

- **Currency:** USD
- **Minimum:** $(if ($ep -and $ep.annualRevenue -and $ep.annualRevenue.minimum) { $ep.annualRevenue.minimum } else { 0 })
- **Midpoint:** $(if ($ep -and $ep.annualRevenue -and $ep.annualRevenue.midpoint) { $ep.annualRevenue.midpoint } else { 0 })
- **Maximum:** $(if ($ep -and $ep.annualRevenue -and $ep.annualRevenue.maximum) { $ep.annualRevenue.maximum } else { 0 })
- **Confidence:** $(if ($ep -and $ep.annualRevenue -and $ep.annualRevenue.confidence) { Safe $ep.annualRevenue.confidence } else { "low to medium until paid cohort evidence" })

- **Main Limiting Factor:** $(if ($ep -and $ep.mainLimitingFactor) { Safe $ep.mainLimitingFactor } else { "distribution and willingness to pay, followed by support/productization" })

## Market and Competition

- **Description:** $(Safe $mkt.description)

### Demand Drivers
- increasing consumer distrust of unverified product claims
- AI agent adoption requiring structured, trustworthy product data
- regulatory pressure on fake reviews (DSA, EU Consumer Rights Directive)
- growth in high-consideration online purchases (electronics, furniture, specialized goods)
- right-to-repair legislation creating demand for product specification evidence

- **Signals:** $(Safe $mkt.signals)

- **Size Direction:** $(Safe $mkt.sizeDirection)

- **Budget Source:** $(Safe $mkt.budgetSource)

- **Maturity:** $(Safe $mkt.maturity)

- **Competitive Density:** $(Safe $mkt.competitiveDensity)

### Direct Competitors
$directComps

### Indirect Competitors
$indirectComps

### Diy Alternatives
$diyAlts

### Incumbent Advantages
$incumbAdv

### Startup Advantages
$(BulletList $mkt.startupAdvantages)

### Differentiation
$(BulletList $mkt.differentiation)

### Unserved Niches
$(BulletList $mkt.unservedNiches)

- **Geography:** $(Safe $mkt.geography)

- **Timing:** $(Safe $mkt.timing)

### Trends
$trends

- **Platform Feature Risk:** $(Safe $mkt.platformFeatureRisk)

- **Commoditization Risk:** $(Safe $mkt.commoditizationRisk)

### Moats

$moatSec

## Validation Plan

- **Most Important Uncertainty:** $(Safe $val.mostImportantUncertainty)

- **Riskiest Assumption:** $(Safe $val.riskiestAssumption)

- **Cheapest Test:** $(Safe $val.cheapestTest)

- **Fastest Test:** $(Safe $val.fastestTest)

- **Interview Plan:** $(Safe $val.interviewPlan)

### Interview Questions
- Tell me about the last time this happened.
- What did you do instead?
- What did it cost in time, money, delay, or risk?
- Who approved spending?
- What would make an external solution untrustworthy?
- Would you pay for this fixed outcome this month? Why or why not?

- **Landing Page Test:** $(Safe $val.landingPageTest)

- **Smoke Test:** $(Safe $val.smokeTest)

- **Concierge Mvp:** $(Safe $val.conciergeTest)

- **Wizard Of Oz:** $(Safe $val.wizardOfOzTest)

- **Pricing Test:** $(Safe $val.pricingTest)

- **Demand Threshold:** $(Safe $val.demandThreshold)

### Success Criteria
$(BulletList $val.successCriteria)

### Failure Criteria
$(BulletList $val.failureCriteria)

### Evidence Before Build
$(BulletList $val.evidenceBeforeBuild)

### Evidence Before Heavy Investment
$(BulletList $val.evidenceBeforeHeavyInvestment)

### Plan 48 Hours
$plan48Sec

### Plan 7 Days
$(Safe $val.plan7Days)

### Plan 30 Days
$(Safe $val.plan30Days)

- **Do Not Build Yet:** $(Safe $val.doNotBuildYet)

## Go-to-Market Strategy

- **Initial Niche:** $(Safe $gtm.initialNiche)

- **Icp:** $(Safe $gtm.icp)

- **Beachhead:** $(Safe $gtm.beachhead)

- **Positioning:** $(Safe $gtm.positioning)

- **Value Proposition:** $(Safe $gtm.valueProposition)

- **Messaging:** $(Safe $gtm.messaging)

- **Offer:** $(Safe $gtm.offer)

- **Pricing Launch:** $(Safe $gtm.pricingLaunch)

### First 10 Customers
$(Safe $gtm.first10Customers)

### First 100 Customers
$(Safe $gtm.first100Customers)

- **Outbound:** $(Safe $gtm.outbound)

- **Inbound:** $(Safe $gtm.inbound)

- **Community:** $(Safe $gtm.community)

- **Partnerships:** $(Safe $gtm.partnerships)

- **Product Led Growth:** $(Safe $gtm.productLedGrowth)

- **Marketplace Distribution:** $(Safe $gtm.marketplaceDistribution)

- **App Store:** $(Safe $gtm.appStore)

- **Seo:** $(Safe $gtm.seo)

- **Content:** $(Safe $gtm.content)

- **Paid Acquisition:** $(Safe $gtm.paidAcquisition)

- **Referral Loop:** $(Safe $gtm.referralLoop)

- **Sales Cycle:** $(Safe $gtm.salesCycle)

### Sales Assets
$(BulletList $gtm.salesAssets)

- **Onboarding:** $(Safe $gtm.onboarding)

- **Retention:** $(Safe $gtm.retention)

- **Expansion:** $(Safe $gtm.expansion)

## Build and Operations Plan

### Founder Skills
$(Safe $ops.founderSkills)

### Team Roles
$(BulletList $ops.teamRoles)

### Ai Can Accelerate
$(BulletList $ops.aiCanAccelerate)

### Human Required
$(BulletList $ops.humanRequired)

- **Build Difficulty:** $(Safe $ops.buildDifficulty)

- **Operational Difficulty:** $(Safe $ops.operationalDifficulty)

- **Support Burden:** $(Safe $ops.supportBurden)

- **Sales Burden:** $(Safe $ops.salesBurden)

- **Compliance Burden:** $(Safe $ops.complianceBurden)

- **Data Acquisition Difficulty:** $(Safe $ops.dataAcquisitionDifficulty)

- **Integration Difficulty:** $(Safe $ops.integrationDifficulty)

### Mvp Stages
$(BulletList $ops.mvpStages)

### Dependencies
$(BulletList $ops.dependencies)

### Maintenance
$(BulletList $ops.maintenance)

### Quality Control
$(Safe $ops.qualityControl)

### Kpis
$(BulletList $ops.kpis)

### Leading Indicators
$(BulletList $ops.leadingIndicators)

### Lagging Indicators
$(BulletList $ops.laggingIndicators)

### Kill Metrics
$(Safe $ops.killMetrics)

### Automation Opportunities
$(BulletList $ops.automationOpportunities)

### Sops
$(BulletList $ops.sops)

## Risks and Failure Modes

- **Product:** $(Safe $risk.product)

- **Market:** $(Safe $risk.market)

- **Pricing:** $(Safe $risk.pricing)

- **Distribution:** $(Safe $risk.distribution)

- **Technical:** $(Safe $risk.technical)

- **Ai Reliability:** $(Safe $risk.aiReliability)

- **Hallucination:** $(Safe $risk.hallucination)

- **Data:** $(Safe $risk.data)

- **Security:** $(Safe $risk.security)

- **Privacy:** $(Safe $risk.privacy)

- **Regulatory:** $(Safe $risk.regulatory)

- **Reputation:** $(Safe $risk.reputation)

- **Dependency:** $(Safe $risk.dependency)

- **Platform:** $(Safe $risk.platform)

- **Fraud:** $(Safe $risk.fraud)

- **Abuse:** $(Safe $risk.abuse)

- **Support:** $(Safe $risk.support)

- **Founder Market Fit:** $(Safe $risk.founderMarketFit)

- **Capital:** $(Safe $risk.capital)

- **Timing:** $(Safe $risk.timing)

- **Commoditization:** $(Safe $risk.commoditization)

- **Ethics:** Avoid deceptive claims, exploitative targeting, and automation without recourse.

- **Worst Case:** $(Safe $risk.worstCase)

### Mitigations
$(BulletList $risk.mitigations)

### Abandon When
$(BulletList $risk.abandonWhen)

## Action Plan

- **First Action:** $(Safe $ap.firstAction)

- **First Customer Conversation:** $(Safe $ap.firstCustomerConversation)

- **First Prototype:** $(Safe $ap.firstPrototype)

- **First Sales Offer:** $(Safe $ap.firstSalesOffer)

- **First Distribution Channel:** $(Safe $ap.firstDistributionChannel)

- **First Measurement:** $(Safe $ap.firstMeasurement)

- **First Hiring Need:** $(Safe $ap.firstHiringNeed)

- **First Integration:** $(Safe $ap.firstIntegration)

### Plan 7 Days
$ap7Sec

### Plan 30 Days
$ap30Sec

### Plan 90 Days
$ap90Sec

### Checklist
$checkSec

## Transparent Scores

The scores are subjective decision-support estimates. A high score with weak evidence should not outrank verified payment behavior automatically.

| Dimension | Score / 10 | Confidence | Justification |
|---|---:|---|---|
$scoreSec

### Composite Views

$compositeSec

## Evidence, Assumptions, and Unknowns

### Evidence
$evidSec

### Assumptions
$assumpSec

### Unknowns
$unknSec

## Related Ideas
$relatedSec

## Source References

$sourceSec

---
*Preserved as part of Deep Research Eighth Full Reset tournament findings (2026-08-06). Session 8 winner: FactBounty (idea-061, score: 91.2). This dossier is part of the Product Verification and Evidence category (ideas 061-070).*

## Idea-Specific Prompt Pack

See [``prompts/idea-specific/$id/``](../prompts/idea-specific/$id/README.md).
"@

    $outPath = "ideas\$slug.md"
    [System.IO.File]::WriteAllText((Resolve-Path ".").Path + "\$outPath", $content, [System.Text.Encoding]::UTF8)
    $size = (Get-Item $outPath).Length
    Write-Host "  Written: $outPath ($([math]::Round($size/1024, 1)) KB)"
}

Write-Host ""
Write-Host "Done! All 10 Eighth Reset dossiers generated."
