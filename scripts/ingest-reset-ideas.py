#!/usr/bin/env python3
"""
Venture Atlas OS — Research Reset Integrator
============================================
Ingests the 10 novel ideas from the 12-round research reset (2026-08-07):
1. Vendor Slot Rescue (idea-082)
2. Wedding Lead Spend Forensics (idea-083)
3. Cancellation Revenue Recovery (idea-084)
4. Event Sponsor Proof Pack (idea-085)
5. Booked-Out Referral Exchange (idea-086)
6. Referee Rescue (idea-087)
7. Funeral Quote Normalizer (idea-088)
8. Market Vendor ROI Ledger (idea-089)
9. Pet Care Backup Circle (idea-090)
10. EU Return Evidence Pack (idea-091)

Updates data/ideas.json, generates dossier Markdown files in ideas/, 
updates data/search-index.json, and runs va-ranker.py.
"""

import json
import os
import sys
import datetime
import subprocess

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'ideas.json')
IDEAS_DIR = os.path.join(BASE_DIR, 'ideas')

NEW_IDEAS = [
    {
        "schemaVersion": "2.0.0",
        "id": "idea-082",
        "legacyId": "vendor-slot-rescue",
        "slug": "vendor-slot-rescue-idea-082",
        "name": "Vendor Slot Rescue",
        "oneSentenceConcept": "A performance-fee network filling cancelled vendor booths at markets, fairs, and pop-up events within 24 hours.",
        "elevatorPitch": "When a vendor cancels short-notice, organizers face forfeited booth fees and empty spaces. Vendor Slot Rescue performs urgent outreach to a prequalified local standby list, charging €20 only when an approved replacement confirms.",
        "detailedDescription": "Discovered via 12-round deep research reset. Rather than building another organizer dashboard, Vendor Slot Rescue solves the cross-event standby supply problem via short-notice performance matching.",
        "category": "Event Operations & Marketplaces",
        "subcategory": "local replacement network",
        "tags": ["event-operations", "vendor-management", "pop-up", "marketplace", "performance-fee", "research-reset-2026-08-07"],
        "status": "priority",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #1 overall in 2026-08-07 research reset (Score: 8.00/10)"
        },
        "atAGlance": {
            "targetCustomer": "Craft market, food fair, and pop-up event organizers",
            "problemSolved": "Last-minute vendor cancellations leaving empty spaces and forfeited booth fees",
            "whatToBuild": "Standby vendor intake form + automated WhatsApp/SMS urgent broadcast matching protocol",
            "howItMakesMoney": "€20–€30 performance fee per confirmed replacement vendor",
            "whyCustomersPay": "Saves organizer time and prevents empty event spaces; organizer pays only on success",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 2400, "midpoint": 15000, "maximum": 72000, "basis": "Filled slots scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 20, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 88.0,
            "confidenceScore": 8.5,
            "mainAdvantage": "Zero setup fee, payment on success only, cross-event standby network effect",
            "mainRisk": "Organizers' existing waitlists might fill slots without third-party help",
            "bestNextValidationStep": "Contact 30 local market organizers and offer 24h short-notice fill pilot"
        },
        "scores": {
            "problemSeverity": {"value": 8.2, "confidence": "high"},
            "frequencyOfNeed": {"value": 7.8, "confidence": "high"},
            "willingnessToPay": {"value": 8.5, "confidence": "high"},
            "marketDemand": {"value": 8.0, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 9.5, "confidence": "high"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 9.0, "confidence": "high"},
            "aiAutomationPotential": {"value": 7.5, "confidence": "medium"},
            "regulatoryTailwind": {"value": 6.0, "confidence": "medium"},
            "compoundingAsset": {"value": 8.5, "confidence": "high"}
        },
        "compositeScores": {
            "overallOpportunity": 88.0,
            "bootstrappedPotential": 95.0,
            "soloFounderPotential": 92.0,
            "fastestPathToRevenue": 95.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 82.0,
            "technicalFeasibility": 90.0,
            "marketSize": 78.0,
            "profitPotential": 85.0,
            "confidence": 85.0,
            "distributionScore": 85.0,
            "competitiveMoat": 80.0,
            "ltvcacScore": 85.0,
            "cacScore": 90.0,
            "evidenceQuality": 85.0,
            "compositeHeadline": 88.0
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-083",
        "legacyId": "wedding-lead-spend-forensics",
        "slug": "wedding-lead-spend-forensics-idea-083",
        "name": "Wedding Lead Spend Forensics",
        "oneSentenceConcept": "A €99–€299 productized audit analyzing inquiry logs for wedding vendors to identify unviable lead channels.",
        "elevatorPitch": "Wedding photographers, venues, and planners spend thousands on directory listings and lead platforms. This productized service ingests lead logs to calculate real CAC, qualified conversation rates, and actual ROI by channel.",
        "detailedDescription": "Discovered via 12-round deep research reset. Avoids controversial fake-lead accusations by auditing vendor-owned inquiry data to reveal true channel performance.",
        "category": "Audit & Financial Forensics",
        "subcategory": "productized audit service",
        "tags": ["wedding-industry", "lead-audit", "productized-service", "cac-analysis", "research-reset-2026-08-07"],
        "status": "priority",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #2 overall in 2026-08-07 research reset (Score: 7.96/10)"
        },
        "atAGlance": {
            "targetCustomer": "Wedding photographers, DJs, planners, florists, and venues",
            "problemSolved": "High listing fees spent on unqualified, unresponsive, or low-intent lead channels",
            "whatToBuild": "CSV/export parser + automated P&L & lead attribution report generator",
            "howItMakesMoney": "€99–€299 per audit, or €39/month recurring quarterly monitoring",
            "whyCustomersPay": "Saves hundreds to thousands in wasted advertising and directory subscriptions",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 4700, "midpoint": 19000, "maximum": 76000, "basis": "Audit volume scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 25, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 87.5,
            "confidenceScore": 8.2,
            "mainAdvantage": "High dollar savings for customer, immediate willingness to pay, repeatable template",
            "mainRisk": "Audit execution time per client must be kept under 3 hours",
            "bestNextValidationStep": "Offer 10 wedding vendors a €99 audit with €25 upfront deposit"
        },
        "scores": {
            "problemSeverity": {"value": 8.5, "confidence": "high"},
            "frequencyOfNeed": {"value": 6.5, "confidence": "medium"},
            "willingnessToPay": {"value": 8.8, "confidence": "high"},
            "marketDemand": {"value": 7.8, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 9.2, "confidence": "high"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.5, "confidence": "high"},
            "aiAutomationPotential": {"value": 8.0, "confidence": "medium"},
            "regulatoryTailwind": {"value": 5.5, "confidence": "low"},
            "compoundingAsset": {"value": 7.5, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 87.5,
            "bootstrappedPotential": 92.0,
            "soloFounderPotential": 90.0,
            "fastestPathToRevenue": 92.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 80.0,
            "technicalFeasibility": 88.0,
            "marketSize": 75.0,
            "profitPotential": 88.0,
            "confidence": 82.0,
            "distributionScore": 80.0,
            "competitiveMoat": 75.0,
            "ltvcacScore": 82.0,
            "cacScore": 85.0,
            "evidenceQuality": 82.0,
            "compositeHeadline": 87.5
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-084",
        "legacyId": "cancellation-revenue-recovery",
        "slug": "cancellation-revenue-recovery-idea-084",
        "name": "Cancellation Revenue Recovery",
        "oneSentenceConcept": "A zero-risk 15% performance-fee service activating waitlists for appointment businesses to fill last-minute slots.",
        "elevatorPitch": "Tattoo studios, pet groomers, and instructors lose revenue when appointments cancel late. We operate their existing waitlists via rapid automated outreach, charging 15% only on recovered bookings.",
        "detailedDescription": "Discovered via 12-round deep research reset. Avoids building calendar software by acting as an outcome-based waitlist execution engine.",
        "category": "Appointment & Scheduling Services",
        "subcategory": "performance revenue recovery",
        "tags": ["appointment-recovery", "waitlist-automation", "performance-fee", "local-services", "research-reset-2026-08-07"],
        "status": "priority",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #3 overall in 2026-08-07 research reset (Score: 7.94/10)"
        },
        "atAGlance": {
            "targetCustomer": "Tattoo artists, pet groomers, boutique beauty salons, niche instructors",
            "problemSolved": "Unfilled late cancellations creating empty slots and lost income",
            "whatToBuild": "Waitlist integration webhook + automated SMS responder",
            "howItMakesMoney": "15% performance fee on successfully recovered appointment revenue",
            "whyCustomersPay": "Zero risk; business pays only when previously lost revenue is recovered",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 2250, "midpoint": 18000, "maximum": 108000, "basis": "Recovered revenue fee scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 20, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 87.0,
            "confidenceScore": 8.0,
            "mainAdvantage": "No software subscription to sell, purely outcome-aligned revenue",
            "mainRisk": "Attribution disputes over whether the customer would have booked anyway",
            "bestNextValidationStep": "Offer 5 local service businesses a 15% revenue share pilot for 30 days"
        },
        "scores": {
            "problemSeverity": {"value": 8.0, "confidence": "high"},
            "frequencyOfNeed": {"value": 8.5, "confidence": "high"},
            "willingnessToPay": {"value": 8.5, "confidence": "high"},
            "marketDemand": {"value": 8.0, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 9.0, "confidence": "high"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.8, "confidence": "high"},
            "aiAutomationPotential": {"value": 7.8, "confidence": "medium"},
            "regulatoryTailwind": {"value": 5.5, "confidence": "low"},
            "compoundingAsset": {"value": 7.8, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 87.0,
            "bootstrappedPotential": 94.0,
            "soloFounderPotential": 91.0,
            "fastestPathToRevenue": 90.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 78.0,
            "technicalFeasibility": 88.0,
            "marketSize": 80.0,
            "profitPotential": 85.0,
            "confidence": 80.0,
            "distributionScore": 82.0,
            "competitiveMoat": 75.0,
            "ltvcacScore": 82.0,
            "cacScore": 88.0,
            "evidenceQuality": 80.0,
            "compositeHeadline": 87.0
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-085",
        "legacyId": "event-sponsor-proof-pack",
        "slug": "event-sponsor-proof-pack-idea-085",
        "name": "Event Sponsor Proof Pack",
        "oneSentenceConcept": "A €99–€500 productized post-event reporting service generating verified sponsorship outcome packages.",
        "elevatorPitch": "Event organizers struggle to retain corporate sponsors because they lack professional post-event deliverables. This service compiles placement photos, attendance verification, web analytics, and renewal offers into a polished report.",
        "detailedDescription": "Discovered via 12-round deep research reset. Solves sponsor churn for local festivals, conferences, and sports events.",
        "category": "Event Operations & Sponsorship",
        "subcategory": "productized reporting service",
        "tags": ["event-sponsorship", "proof-pack", "post-event-reporting", "productized-service", "research-reset-2026-08-07"],
        "status": "priority",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #4 overall in 2026-08-07 research reset (Score: 7.77/10)"
        },
        "atAGlance": {
            "targetCustomer": "Community event organizers, festival directors, local sports tournament hosts",
            "problemSolved": "Sponsor churn caused by lack of post-event ROI proof and tangible deliverables",
            "whatToBuild": "Sponsorship proof intake template + PDF report builder",
            "howItMakesMoney": "€99–€500 per event report package",
            "whyCustomersPay": "Helps organizers secure multi-thousand euro sponsor renewals easily",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 3000, "midpoint": 18000, "maximum": 60000, "basis": "Report volume scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 15, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 85.5,
            "confidenceScore": 8.0,
            "mainAdvantage": "High perceived value for sponsors, clear ROI for event organizers",
            "mainRisk": "Seasonality of local community events and festivals",
            "bestNextValidationStep": "Offer 10 local festival organizers a €99 post-event report template"
        },
        "scores": {
            "problemSeverity": {"value": 7.8, "confidence": "high"},
            "frequencyOfNeed": {"value": 6.5, "confidence": "medium"},
            "willingnessToPay": {"value": 8.2, "confidence": "high"},
            "marketDemand": {"value": 7.5, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 9.0, "confidence": "high"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.5, "confidence": "high"},
            "aiAutomationPotential": {"value": 8.0, "confidence": "medium"},
            "regulatoryTailwind": {"value": 5.0, "confidence": "low"},
            "compoundingAsset": {"value": 7.2, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 85.5,
            "bootstrappedPotential": 92.0,
            "soloFounderPotential": 90.0,
            "fastestPathToRevenue": 90.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 78.0,
            "technicalFeasibility": 88.0,
            "marketSize": 72.0,
            "profitPotential": 84.0,
            "confidence": 80.0,
            "distributionScore": 78.0,
            "competitiveMoat": 72.0,
            "ltvcacScore": 80.0,
            "cacScore": 85.0,
            "evidenceQuality": 80.0,
            "compositeHeadline": 85.5
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-086",
        "legacyId": "booked-out-referral-exchange",
        "slug": "booked-out-referral-exchange-idea-086",
        "name": "Booked-Out Referral Exchange",
        "oneSentenceConcept": "An outcome-based referral exchange enabling fully booked service providers to monetise unfulfillable customer inquiries.",
        "elevatorPitch": "High-demand service providers turn away inquiries when booked out. This exchange lets providers seamlessly pass consenting leads to vetted peers, earning a referral commission upon successful booking.",
        "detailedDescription": "Discovered via 12-round deep research reset. Monetises rejected demand while solving lead generation for growing providers.",
        "category": "Marketplaces & Referral Networks",
        "subcategory": "B2B referral network",
        "tags": ["referral-network", "lead-monetisation", "booked-out", "b2b-marketplace", "research-reset-2026-08-07"],
        "status": "priority",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #5 overall in 2026-08-07 research reset (Score: 7.66/10)"
        },
        "atAGlance": {
            "targetCustomer": "Solo service providers, photographers, coaches, specialized contractors",
            "problemSolved": "Wasted unfulfillable customer leads when calendar is 100% full",
            "whatToBuild": "Simple SMS/Web lead routing dispatch form + commission ledger",
            "howItMakesMoney": "10–15% success fee on completed bookings, split with referring provider",
            "whyCustomersPay": "Receiving provider gets high-intent warm leads; referring provider monetises excess demand",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 2000, "midpoint": 15000, "maximum": 60000, "basis": "Referral volume scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 20, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 84.5,
            "confidenceScore": 7.8,
            "mainAdvantage": "Taps into existing unserviced demand stream with zero marketing spend",
            "mainRisk": "Two-sided cold-start problem in local micro-markets",
            "bestNextValidationStep": "Launch a manual pilot with 10 local photographers in one city"
        },
        "scores": {
            "problemSeverity": {"value": 7.5, "confidence": "medium"},
            "frequencyOfNeed": {"value": 7.5, "confidence": "medium"},
            "willingnessToPay": {"value": 8.0, "confidence": "high"},
            "marketDemand": {"value": 7.5, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 8.8, "confidence": "high"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.5, "confidence": "high"},
            "aiAutomationPotential": {"value": 7.5, "confidence": "medium"},
            "regulatoryTailwind": {"value": 5.0, "confidence": "low"},
            "compoundingAsset": {"value": 8.0, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 84.5,
            "bootstrappedPotential": 91.0,
            "soloFounderPotential": 89.0,
            "fastestPathToRevenue": 88.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 76.0,
            "technicalFeasibility": 86.0,
            "marketSize": 75.0,
            "profitPotential": 82.0,
            "confidence": 78.0,
            "distributionScore": 78.0,
            "competitiveMoat": 75.0,
            "ltvcacScore": 80.0,
            "cacScore": 85.0,
            "evidenceQuality": 78.0,
            "compositeHeadline": 84.5
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-087",
        "legacyId": "referee-rescue",
        "slug": "referee-rescue-idea-087",
        "name": "Referee Rescue",
        "oneSentenceConcept": "An emergency replacement network finding certified sports referees and match officials for last-minute cancellations.",
        "elevatorPitch": "Amateur sports leagues face game cancellations when assigned referees drop out short notice. Referee Rescue maintains a standby network of certified officials dispatched via automated SMS alerts.",
        "detailedDescription": "Discovered via 12-round deep research reset. Focuses on supply availability and urgent dispatch for sports associations.",
        "category": "Sports Operations & Networks",
        "subcategory": "emergency official dispatch",
        "tags": ["sports-management", "referees", "emergency-dispatch", "local-network", "research-reset-2026-08-07"],
        "status": "staged",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #6 overall in 2026-08-07 research reset (Score: 7.14/10)"
        },
        "atAGlance": {
            "targetCustomer": "Amateur sports leagues, youth tournament directors, adult rec leagues",
            "problemSolved": "Game forfeits caused by unreplaced last-minute referee cancellations",
            "whatToBuild": "SMS dispatch queue matching game location/time to certified standby officials",
            "howItMakesMoney": "€15–€25 urgent replacement fee per filled game assignment",
            "whyCustomersPay": "Prevents game forfeits, parent complaints, and scheduling chaos",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 1500, "midpoint": 10000, "maximum": 40000, "basis": "Match fill scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 25, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 81.0,
            "confidenceScore": 7.5,
            "mainAdvantage": "High urgency when cancellation occurs; solves genuine operational headache",
            "mainRisk": "Certification & association alignment friction",
            "bestNextValidationStep": "Contact 10 local youth soccer/basketball league directors"
        },
        "scores": {
            "problemSeverity": {"value": 8.0, "confidence": "medium"},
            "frequencyOfNeed": {"value": 7.0, "confidence": "medium"},
            "willingnessToPay": {"value": 7.5, "confidence": "medium"},
            "marketDemand": {"value": 7.0, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 8.5, "confidence": "high"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.0, "confidence": "high"},
            "aiAutomationPotential": {"value": 7.0, "confidence": "medium"},
            "regulatoryTailwind": {"value": 5.0, "confidence": "low"},
            "compoundingAsset": {"value": 7.0, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 81.0,
            "bootstrappedPotential": 88.0,
            "soloFounderPotential": 86.0,
            "fastestPathToRevenue": 85.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 72.0,
            "technicalFeasibility": 84.0,
            "marketSize": 70.0,
            "profitPotential": 78.0,
            "confidence": 75.0,
            "distributionScore": 75.0,
            "competitiveMoat": 70.0,
            "ltvcacScore": 75.0,
            "cacScore": 82.0,
            "evidenceQuality": 75.0,
            "compositeHeadline": 81.0
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-088",
        "legacyId": "funeral-quote-normalizer",
        "slug": "funeral-quote-normalizer-idea-088",
        "name": "Funeral Quote Normalizer",
        "oneSentenceConcept": "A transparent quote comparison service standardising complex funeral provider estimates into itemised breakdown tables.",
        "elevatorPitch": "Grieving families face high pressure and opaque pricing when choosing funeral arrangements. This service obtains multiple written quotes and converts them into a side-by-side comparative breakdown.",
        "detailedDescription": "Discovered via 12-round deep research reset. High customer savings potential during sensitive purchasing decisions.",
        "category": "Consumer Advocacy & Transparency",
        "subcategory": "quote normalization concierge",
        "tags": ["consumer-advocacy", "funeral-services", "transparency", "quote-comparison", "research-reset-2026-08-07"],
        "status": "staged",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #7 overall in 2026-08-07 research reset (Score: 7.10/10)"
        },
        "atAGlance": {
            "targetCustomer": "Families managing end-of-life arrangements under time pressure",
            "problemSolved": "Opaque, uncomparable funeral director quotes and hidden fees",
            "whatToBuild": "Quote parsing OCR template + itemised price comparison report",
            "howItMakesMoney": "€49–€99 fixed concierge analysis fee per comparison report",
            "whyCustomersPay": "Saves hundreds to thousands of euros while removing stress during grief",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 1500, "midpoint": 12000, "maximum": 45000, "basis": "Comparison fee scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 20, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 80.5,
            "confidenceScore": 7.2,
            "mainAdvantage": "Massive financial savings for family; high emotional value",
            "mainRisk": "Sensitive distribution channels and one-time demand per customer",
            "bestNextValidationStep": "Test consumer landing page explaining quote comparison benefits"
        },
        "scores": {
            "problemSeverity": {"value": 8.5, "confidence": "high"},
            "frequencyOfNeed": {"value": 4.0, "confidence": "low"},
            "willingnessToPay": {"value": 8.0, "confidence": "medium"},
            "marketDemand": {"value": 6.5, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 8.0, "confidence": "medium"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.2, "confidence": "high"},
            "aiAutomationPotential": {"value": 8.0, "confidence": "medium"},
            "regulatoryTailwind": {"value": 6.0, "confidence": "medium"},
            "compoundingAsset": {"value": 7.5, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 80.5,
            "bootstrappedPotential": 86.0,
            "soloFounderPotential": 84.0,
            "fastestPathToRevenue": 80.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 82.0,
            "technicalFeasibility": 85.0,
            "marketSize": 72.0,
            "profitPotential": 80.0,
            "confidence": 72.0,
            "distributionScore": 65.0,
            "competitiveMoat": 75.0,
            "ltvcacScore": 70.0,
            "cacScore": 75.0,
            "evidenceQuality": 72.0,
            "compositeHeadline": 80.5
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-089",
        "legacyId": "market-vendor-roi-ledger",
        "slug": "market-vendor-roi-ledger-idea-089",
        "name": "Market Vendor ROI Ledger",
        "oneSentenceConcept": "An anonymous data subscription sharing verified stall sales, foot traffic, and ROI analytics across craft and pop-up markets.",
        "elevatorPitch": "Pop-up vendors waste money on low-converting markets. This community data ledger aggregates anonymous vendor earnings and foot traffic ratings by market, location, and weather.",
        "detailedDescription": "Discovered via 12-round deep research reset. Builds a compounding B2B market intelligence data asset.",
        "category": "Market Intelligence & Data",
        "subcategory": "vendor data network",
        "tags": ["market-intelligence", "pop-up-vendors", "roi-ledger", "data-subscription", "research-reset-2026-08-07"],
        "status": "staged",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #8 overall in 2026-08-07 research reset (Score: 7.04/10)"
        },
        "atAGlance": {
            "targetCustomer": "Full-time craft vendors, food truck owners, pop-up artisans",
            "problemSolved": "Uncertain ROI and unexpected low foot traffic at unvetted market events",
            "whatToBuild": "Anonymous sales submission form + market ROI leaderboard web portal",
            "howItMakesMoney": "€9–€19/month data subscription or €3 unlock fee per market dossier",
            "whyCustomersPay": "Prevents spending €100+ on a dead market slot",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 1200, "midpoint": 9000, "maximum": 35000, "basis": "Subscription scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 20, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 80.0,
            "confidenceScore": 7.2,
            "mainAdvantage": "Compounding proprietary data asset with network effects",
            "mainRisk": "Requires critical mass of vendor entries per region to be valuable",
            "bestNextValidationStep": "Collect 25 market reviews from local vendors in exchange for free early access"
        },
        "scores": {
            "problemSeverity": {"value": 7.5, "confidence": "medium"},
            "frequencyOfNeed": {"value": 7.0, "confidence": "medium"},
            "willingnessToPay": {"value": 7.2, "confidence": "medium"},
            "marketDemand": {"value": 7.0, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 8.0, "confidence": "medium"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.5, "confidence": "high"},
            "aiAutomationPotential": {"value": 7.5, "confidence": "medium"},
            "regulatoryTailwind": {"value": 5.0, "confidence": "low"},
            "compoundingAsset": {"value": 9.0, "confidence": "high"}
        },
        "compositeScores": {
            "overallOpportunity": 80.0,
            "bootstrappedPotential": 87.0,
            "soloFounderPotential": 85.0,
            "fastestPathToRevenue": 80.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 80.0,
            "technicalFeasibility": 86.0,
            "marketSize": 70.0,
            "profitPotential": 80.0,
            "confidence": 72.0,
            "distributionScore": 72.0,
            "competitiveMoat": 82.0,
            "ltvcacScore": 75.0,
            "cacScore": 78.0,
            "evidenceQuality": 72.0,
            "compositeHeadline": 80.0
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-090",
        "legacyId": "pet-care-backup-circle",
        "slug": "pet-care-backup-circle-idea-090",
        "name": "Pet Care Backup Circle",
        "oneSentenceConcept": "A neighborhood micro-membership network pairing verified pet owners for reciprocal short-notice pet sitting.",
        "elevatorPitch": "Commercial pet boarding is expensive and hard to book last-minute. Pet Care Backup Circle organizes neighborhood trust pools where owners earn credits by hosting neighbors' pets.",
        "detailedDescription": "Discovered via 12-round deep research reset. Hyper-local membership model for emergency pet care.",
        "category": "Consumer Networks & Pet Care",
        "subcategory": "neighborhood membership pool",
        "tags": ["pet-care", "membership-network", "neighborhood", "reciprocal-service", "research-reset-2026-08-07"],
        "status": "staged",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #9 overall in 2026-08-07 research reset (Score: 6.48/10)"
        },
        "atAGlance": {
            "targetCustomer": "Dog and cat owners in dense suburban/urban neighborhoods",
            "problemSolved": "High cost and inflexibility of commercial kennels during unexpected travel",
            "whatToBuild": "Verification intake + neighborhood credit ledger web app",
            "howItMakesMoney": "€19/year membership or €5 emergency match fee",
            "whyCustomersPay": "Saves hundreds on boarding fees while ensuring pets stay in a home environment",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 1000, "midpoint": 6000, "maximum": 25000, "basis": "Membership scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 20, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 76.5,
            "confidenceScore": 6.8,
            "mainAdvantage": "Strong community appeal and organic referral loop",
            "mainRisk": "Trust, liability, and pet compatibility verification",
            "bestNextValidationStep": "Launch a pilot group of 15 dog owners in one neighborhood"
        },
        "scores": {
            "problemSeverity": {"value": 7.2, "confidence": "medium"},
            "frequencyOfNeed": {"value": 6.5, "confidence": "medium"},
            "willingnessToPay": {"value": 7.0, "confidence": "medium"},
            "marketDemand": {"value": 6.8, "confidence": "medium"},
            "speedToFirstRevenue": {"value": 8.0, "confidence": "medium"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.0, "confidence": "high"},
            "aiAutomationPotential": {"value": 6.5, "confidence": "low"},
            "regulatoryTailwind": {"value": 5.0, "confidence": "low"},
            "compoundingAsset": {"value": 7.5, "confidence": "medium"}
        },
        "compositeScores": {
            "overallOpportunity": 76.5,
            "bootstrappedPotential": 84.0,
            "soloFounderPotential": 82.0,
            "fastestPathToRevenue": 78.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 72.0,
            "technicalFeasibility": 82.0,
            "marketSize": 68.0,
            "profitPotential": 74.0,
            "confidence": 68.0,
            "distributionScore": 70.0,
            "competitiveMoat": 72.0,
            "ltvcacScore": 72.0,
            "cacScore": 75.0,
            "evidenceQuality": 68.0,
            "compositeHeadline": 76.5
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    },
    {
        "schemaVersion": "2.0.0",
        "id": "idea-091",
        "legacyId": "eu-return-evidence-pack",
        "slug": "eu-return-evidence-pack-idea-091",
        "name": "EU Return Evidence Pack",
        "oneSentenceConcept": "A self-service evidence tool generating legally sound dispute packs for EU e-commerce return refusals.",
        "elevatorPitch": "EU consumers face illegal return refusals or restocking fee deductions from cross-border online stores. This tool formats order proof, communications, and EU Directive citations into a formal dispute dossier.",
        "detailedDescription": "Discovered via 12-round deep research reset. Leverages EU Consumer Rights Directive protection rules.",
        "category": "EU Marketplace & Compliance",
        "subcategory": "consumer rights dispute pack",
        "tags": ["eu-compliance", "consumer-rights", "dispute-pack", "e-commerce-returns", "research-reset-2026-08-07"],
        "status": "staged",
        "provenance": {
            "sourceType": "Deep Research Reset (12-Round Investigation)",
            "provider": "Venture Atlas Research Reset",
            "researchRound": "12-round reset",
            "notes": "Rank #10 overall in 2026-08-07 research reset (Score: 6.20/10)"
        },
        "atAGlance": {
            "targetCustomer": "EU consumers facing unlawful e-commerce return rejections or fee deductions",
            "problemSolved": "Merchant non-compliance with EU 14-day statutory right of withdrawal rules",
            "whatToBuild": "Dispute intake wizard + EU consumer law citation generator",
            "howItMakesMoney": "€9–€19 per generated dispute evidence dossier",
            "whyCustomersPay": "Recovers €50–€500 in wrongfully withheld return refunds",
            "estimatedEarningPotential": {"currency": "EUR", "minimum": 1000, "midpoint": 5000, "maximum": 20000, "basis": "Dossier sales scenario"},
            "startupCost": {"currency": "EUR", "minimum": 0, "midpoint": 15, "maximum": 50},
            "timeToMvp": "3-7 days",
            "overallScore": 75.0,
            "confidenceScore": 6.5,
            "mainAdvantage": "Strong EU regulatory backing and clear consumer financial recovery",
            "mainRisk": "One-off transaction model and legal disclaimer requirements",
            "bestNextValidationStep": "Post in EU consumer advice forums offering free pilot dispute packs"
        },
        "scores": {
            "problemSeverity": {"value": 7.8, "confidence": "high"},
            "frequencyOfNeed": {"value": 5.0, "confidence": "low"},
            "willingnessToPay": {"value": 7.5, "confidence": "medium"},
            "marketDemand": {"value": 6.2, "confidence": "low"},
            "speedToFirstRevenue": {"value": 8.0, "confidence": "medium"},
            "lowStartupCost": {"value": 10.0, "confidence": "high"},
            "easeOfMvp": {"value": 8.5, "confidence": "high"},
            "aiAutomationPotential": {"value": 8.5, "confidence": "high"},
            "regulatoryTailwind": {"value": 8.5, "confidence": "high"},
            "compoundingAsset": {"value": 6.5, "confidence": "low"}
        },
        "compositeScores": {
            "overallOpportunity": 75.0,
            "bootstrappedPotential": 82.0,
            "soloFounderPotential": 80.0,
            "fastestPathToRevenue": 78.0,
            "lowestCostLaunch": 100.0,
            "differentiation": 78.0,
            "technicalFeasibility": 85.0,
            "marketSize": 65.0,
            "profitPotential": 72.0,
            "confidence": 65.0,
            "distributionScore": 65.0,
            "competitiveMoat": 70.0,
            "ltvcacScore": 68.0,
            "cacScore": 72.0,
            "evidenceQuality": 65.0,
            "compositeHeadline": 75.0
        },
        "validationChecklist": {
            "passed": True,
            "passedCount": 8,
            "totalCriteria": 8,
            "scorePercentage": 100.0,
            "details": {"Startup cost $0-$100": True, "Payment before expense": True, "No inventory": True, "Solo MVP <=14d": True, "Gross margin >65%": True, "High severity & WTP": True, "No consulting": True, "Compounding asset": True}
        },
        "killCriteria": {"killFlagged": False, "killCount": 0, "killFlags": []},
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
]

def main():
    print("Ingesting 10 new research reset ideas into data/ideas.json...")
    with open(IDEAS_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    existing = data.get('ideas', [])
    existing_ids = {i['id'] for i in existing}
    
    added_count = 0
    for new_idea in NEW_IDEAS:
        if new_idea['id'] not in existing_ids:
            existing.append(new_idea)
            added_count += 1
            print(f"  + Added {new_idea['id']}: {new_idea['name']}")
        else:
            print(f"  ~ Already present {new_idea['id']}: {new_idea['name']}")
            
    data['ideas'] = existing
    with open(IDEAS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"\nSuccessfully added {added_count} new ideas. Total canonical ideas: {len(existing)}")
    
    # Run dossier generator
    gen_script = os.path.join(BASE_DIR, 'scripts', 'generate-eighth-reset-dossiers.py')
    if os.path.exists(gen_script):
        print("Regenerating dossier Markdown files...")
        subprocess.run([sys.executable, gen_script], cwd=BASE_DIR)
        
    # Update search index
    search_script = os.path.join(BASE_DIR, 'scripts', 'build-search-index.js')
    if os.path.exists(search_script):
        print("Updating search index...")
        subprocess.run(['node', search_script], cwd=BASE_DIR)
        
    # Recompute rankings
    rank_script = os.path.join(BASE_DIR, 'scripts', 'va-ranker.py')
    if os.path.exists(rank_script):
        print("Updating rankings...")
        subprocess.run([sys.executable, rank_script, '--update', '--top', '15'], cwd=BASE_DIR)

if __name__ == '__main__':
    main()
