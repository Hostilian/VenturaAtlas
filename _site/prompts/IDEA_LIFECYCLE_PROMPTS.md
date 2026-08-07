# Venture Atlas OS — Idea Lifecycle Prompts

> **Complete prompt toolkit for every stage of the venture-building lifecycle.**
> Copy any section below into ChatGPT, Claude, Gemini, or any AI assistant.
> Plain-text version: `prompts/IDEA_LIFECYCLE_PROMPTS.txt`

---

## How to Use This Library

1. Pick the **stage** you're at (Discovery → Validation → Financial → Launch → Iteration)
2. Copy the relevant prompt(s)
3. Replace `[IDEA]` with your idea name or brief description
4. Replace `[CUSTOMER]` with your target customer description
5. Replace `[MARKET]` with your target market/geography
6. Paste into your AI assistant and iterate

---

## Stage 1: Discovery — Finding Ideas

### 1.1 Underserved Market Scan
```
I'm looking for underserved business opportunities in [MARKET] as of 2025–2026.

Please analyze:
1. What regulatory changes in the past 18 months have created new compliance tool needs?
2. What new technology capabilities (AI, LLMs, APIs) are now available that weren't 2 years ago?
3. What previously manual or human-intensive workflows are now ripe for automation?
4. What consumer behavior shifts have created new demand that existing products don't serve?

For each opportunity you identify, provide:
- Problem statement (who suffers, what pain, how often)
- Existing solutions and their gaps
- Rough market size estimate
- Initial startup cost estimate
- Speed to first revenue
```

### 1.2 Adjacent Idea Generator
```
I'm exploring the business idea: [IDEA]

Please generate 10 adjacent business ideas that:
1. Serve the same customer but solve a different problem
2. Solve the same problem for a different customer segment
3. Use the same core technology/capability in a different market
4. Are upstream or downstream in the same value chain
5. Are the B2B version of this B2C idea (or vice versa)

For each adjacent idea, rate:
- Differentiation from original (1–10)
- Market size potential (1–10)
- Ease of validation (1–10)
```

### 1.3 Competitor Gap Analysis
```
For the business idea: [IDEA]
Target customer: [CUSTOMER]

Please identify:
1. The top 5 existing solutions or competitors in this space
2. For each competitor: pricing, key features, key weaknesses, customer complaints (check G2/Capterra/Reddit reviews)
3. The whitespace — what specific use cases or customer segments do ALL competitors fail to serve well?
4. A "wedge" — the narrowest possible version of this idea that could win against all existing solutions

Conclude with: Is this market "good enough to disrupt" or "too crowded"? Why?
```

### 1.4 Trend Alignment Check
```
I'm considering the business idea: [IDEA]

Please assess how well it aligns with these 2025–2026 trends:
1. AI agent adoption (are businesses actively paying for autonomous AI workflows?)
2. EU regulatory expansion (GDPR, DSA, DMA, DAC7, AI Act — does this idea benefit?)
3. Post-pandemic behavior shifts (remote work, e-commerce, health consciousness)
4. Developer-led growth (is this idea capable of a PLG / developer-community motion?)
5. Bootstrap / indie hacker movement (can this work as a solo founder business?)

Rate alignment with each trend: Strong / Moderate / Weak
Overall trend score: X/10
```

---

## Stage 2: Validation — Testing Assumptions

### 2.1 Assumption Mapping
```
Business idea: [IDEA]
Target customer: [CUSTOMER]

Please list ALL assumptions this idea makes that could be wrong:

1. Market assumptions (does the problem exist at scale?)
2. Customer assumptions (will the target customer pay for a solution?)
3. Technical assumptions (can this be built at the assumed cost?)
4. Distribution assumptions (can we reach customers through the assumed channel?)
5. Economic assumptions (will unit economics work at scale?)
6. Regulatory assumptions (is this legally permissible in [MARKET]?)
7. Timing assumptions (is the market ready for this now?)

For each assumption, rate:
- How likely is it to be true? (1–10)
- How easy is it to test? (1–10)
- How critical is it to the business? (1–10)

Prioritize the 3 most important assumptions to test first.
```

### 2.2 Customer Discovery Interview Script
```
I'm building: [IDEA]
My target customer is: [CUSTOMER]

Please write a 15-question customer discovery interview script to validate whether this problem is real and worth solving.

The script should:
1. Start with open-ended questions about the customer's current workflow/life
2. NOT lead the witness — never mention our solution
3. Explore frequency, severity, and cost of the problem
4. Understand what they currently do to solve it
5. Discover what would make them switch to a new solution
6. End with a pull-forward question to gauge intent

Include: recommended follow-up probes for each question.
```

### 2.3 Landing Page Validation Brief
```
I want to test market demand for: [IDEA]
Target customer: [CUSTOMER]

Please write:
1. A compelling headline (under 10 words) that captures the core value proposition
2. Three supporting subheadlines that address the top 3 customer pains
3. A "How it works" 3-step description
4. Three social proof angles (even hypothetical) — what would make someone trust this?
5. A call-to-action that gets early sign-ups or waitlist registrations
6. Five objections a visitor might have and how to address them on the page
7. A/B test ideas: 2 alternative headlines to test

Format for a simple landing page brief.
```

### 2.4 Demand Signal Research
```
I'm researching demand for: [IDEA]
The problem it solves: [PROBLEM STATEMENT]

Please help me find demand signals by:
1. Suggesting 10 specific subreddits, Facebook groups, or Slack communities where the target customer would discuss this problem
2. Writing 5 search queries to find complaints about this problem on Reddit, Twitter/X, G2, Capterra, and App Store reviews
3. Identifying 3 relevant job titles that would experience this problem — and what job boards to search for volume
4. Suggesting 3 ways to do a "smoke test" to validate demand before building anything
5. Writing a cold outreach message I could use to get 10 customer discovery calls booked in 48 hours
```

### 2.5 Kill Criteria Checklist
```
Business idea: [IDEA]

Please create a kill criteria checklist — specific, measurable conditions that would tell me this idea is NOT worth pursuing.

Format as:
KILL CONDITION: [specific observable fact]
HOW TO TEST: [specific action to confirm/deny within 72 hours]
KILL IF: [threshold — e.g., "less than 3 of 20 people agree this is their top pain"]

Create 8 kill conditions covering:
1. Problem severity (is it painful enough?)
2. Market size (is it big enough?)
3. Willingness to pay (will they actually open their wallet?)
4. Switching costs (are they too locked in to an alternative?)
5. Technical feasibility (can we build a useful v1 in under 60 days?)
6. Distribution (is there a reachable channel?)
7. Competition (is there a dominant incumbent with deep moat?)
8. Founder fit (do we have an edge?)
```

---

## Stage 3: Financial Modeling

### 3.1 Revenue Model Design
```
Business idea: [IDEA]
Target customer: [CUSTOMER]
Market: [MARKET]

Please design 3 alternative revenue models for this business:

MODEL A: Subscription (SaaS)
- Monthly price point options: [3 tiers]
- Rationale for each tier
- Churn assumptions
- LTV:CAC target

MODEL B: Transaction / Usage-Based
- What is the unit of pricing?
- Price per unit
- Volume assumptions

MODEL C: One-Time or License
- Price point
- Target deal size
- Renewal/expansion path

For each model:
- Year 1 revenue projection (conservative / base / optimistic)
- Minimum customers needed to reach $10k MRR
- Pros and cons of this model for this specific business
```

### 3.2 Startup Cost Breakdown
```
I want to launch: [IDEA]
My technical background: [YOUR SKILLS]
Timeline to launch: [X weeks/months]

Please create a detailed startup cost breakdown:

1. One-time costs (domain, design, legal entity formation)
2. Monthly recurring costs (hosting, SaaS tools, APIs, marketing)
3. Time cost (hours per week required for founder/solo)
4. First 90 days total cost estimate
5. "Zero-dollar" version — what is the minimum viable way to start with $0?
6. "Recommended" version — what $500–$2,000 buys in terms of speed and quality
7. "Proper" version — what $5,000–$10,000 buys

Include specific tool recommendations at each tier.
```

### 3.3 Unit Economics Model
```
Business idea: [IDEA]
Revenue model: [SUBSCRIPTION / TRANSACTION / OTHER]
Pricing: $[X] per [month/unit/project]

Please calculate unit economics:

1. Gross margin estimate (what % of revenue is gross profit?)
2. Customer Acquisition Cost estimate
   - Organic channel (SEO/content): $X CAC
   - Paid channel: $X CAC
   - Outbound sales: $X CAC
3. Customer Lifetime Value estimate
   - Assumed monthly churn rate: X%
   - Average LTV = price / churn rate
4. Payback period: months to recover CAC
5. LTV:CAC ratio for each channel
6. Break-even point: number of customers to cover fixed monthly costs of $[Y]

Flag: what unit economics look like in a healthy vs unhealthy scenario.
```

### 3.4 Financial Scenario Planning
```
Business idea: [IDEA]
Revenue model: [SUBSCRIPTION]
Target price: $[X]/month
Target customer: [CUSTOMER]

Please create 3 financial scenarios for Year 1:

CONSERVATIVE SCENARIO:
- Growth assumption: X customers per month
- Churn assumption: X% per month
- Total Year 1 revenue: $X
- End of Year 1 MRR: $X

BASE SCENARIO:
- Growth assumption: X customers per month
- Churn assumption: X% per month
- Total Year 1 revenue: $X
- End of Year 1 MRR: $X

OPTIMISTIC SCENARIO:
- Growth assumption: X customers per month
- Churn assumption: X% per month
- Total Year 1 revenue: $X
- End of Year 1 MRR: $X

For the BASE scenario:
- Monthly P&L for months 1–12 (revenue, COGS, operating expenses, net)
- Cash flow chart (cumulative cash position)
- When does the business become cash flow positive?
```

---

## Stage 4: Launch Planning

### 4.1 First Customer Acquisition Plan
```
Business idea: [IDEA]
Target customer: [CUSTOMER]
Market: [MARKET]

I need my first 10 paying customers. Please create a detailed plan:

DAY 1–7 (First week):
- Exactly where will I find these customers? (3 specific channels)
- What will I say in outreach? (write a DM/email template)
- What is my goal for the first conversation? (not to sell — to learn)
- How many outreach attempts will I make per day?

DAY 8–14 (Second week):
- How do I convert interested prospects to paying customers?
- What do I offer first customers (pricing, guarantee, white-glove service)?
- What does the sales conversation look like? (5 key questions to ask)

BY DAY 30:
- Milestone: X paying customers
- Revenue milestone: $X MRR
- Learning milestone: 3 specific things I will know that I don't know today

What is the single highest-leverage action I should take in the next 24 hours?
```

### 4.2 Go-To-Market Strategy
```
Business idea: [IDEA]
Target customer: [CUSTOMER]
Budget for launch: $[X]

Please design a 90-day GTM strategy:

PHASE 1 (Days 1–30): Foundation
- Brand and positioning: tagline, value proposition
- Minimum viable product scope (what must be live for first customers)
- Initial channel: pick ONE and go deep
- Content strategy: what type of content will attract target customers?

PHASE 2 (Days 31–60): Validation
- Expand to a second channel
- Referral / word-of-mouth mechanics
- Customer success rituals (onboarding, check-ins, expansion)

PHASE 3 (Days 61–90): Scale
- Paid acquisition test (if applicable)
- Partnership or integration opportunities
- Case study / social proof development

Metrics to track at 30/60/90 days:
- Revenue: $X / $X / $X
- Customers: X / X / X
- NPS or satisfaction: X+
```

### 4.3 Launch Announcement Pack
```
I'm launching: [IDEA]
Target customer: [CUSTOMER]
Launch date: [DATE]

Please write my complete launch announcement pack:

1. Product Hunt launch description (260 characters tagline + body)
2. Twitter/X launch thread (5 tweets)
3. LinkedIn launch post (professional tone, 200 words)
4. Reddit launch post for [SUBREDDIT] (community-first tone, no hard sell)
5. Hacker News "Show HN" post (technical tone, honest and transparent)
6. Email to my existing network (100 words, personal tone)
7. Subject lines for the email (3 options to A/B test)
```

### 4.4 Partnership & Integration Strategy
```
Business idea: [IDEA]
My target customer uses these tools: [LIST TOOLS]

Please identify:
1. The top 5 integration partners that would make my product dramatically more valuable
2. For each: what is the integration, who would benefit, and how to approach them
3. The top 3 channel partners who already have my target customer's attention
4. What I can offer a partner (revenue share, co-marketing, lead gen)
5. An outreach email template to propose a partnership
6. Which partnership type would have the highest ROI for a bootstrapped founder in the first 90 days?
```

---

## Stage 5: Iteration — Learning and Pivoting

### 5.1 Customer Feedback Analysis
```
I've collected [X] customer conversations/reviews/support tickets for [IDEA].

Here is the raw feedback:
[PASTE FEEDBACK HERE]

Please analyze this feedback and:
1. Group into themes (what pain points come up most often?)
2. Identify what customers LOVE (never touch these)
3. Identify what customers STRUGGLE with (fix these urgently)
4. Identify what customers ASK FOR (prioritized feature requests)
5. Identify signal vs. noise (what feedback comes from your best customers vs. bad-fit customers?)
6. Recommend the top 3 product changes to make in the next 30 days
7. Identify any signals that suggest a pivot opportunity
```

### 5.2 Pivot Trigger Analysis
```
My business [IDEA] has been running for [X months].

Current metrics:
- MRR: $[X]
- Customer count: [X]
- Churn: [X]% per month
- CAC: $[X]
- NPS: [X]

I'm wondering whether to pivot. Please help me think through this:

1. Is this a "growth problem" (right idea, wrong execution) or a "thesis problem" (wrong idea)?
2. What would the data look like at [6 months] if the business is on a good trajectory?
3. What specific metric is most concerning? What does that signal?
4. What are the top 3 pivot options? For each: what changes (customer / problem / solution / revenue model)?
5. What is the minimum experiment to test each pivot direction in 2 weeks?
6. How do I decide: stick, pivot, or kill?
```

### 5.3 Growth Experiment Design
```
Business: [IDEA]
Current MRR: $[X]
I want to grow from $[X] to $[Y] MRR in [X] months.

Please design a growth experiment framework:

1. Identify the biggest constraint to growth right now:
   - Awareness (not enough people know we exist)
   - Conversion (people see us but don't sign up)
   - Activation (people sign up but don't get value)
   - Retention (people get value but churn)
   - Revenue (people stay but don't expand)

2. For the biggest constraint, propose 5 experiments:
   - Hypothesis: "We believe that [CHANGE] will result in [OUTCOME]"
   - Effort (Low/Medium/High)
   - Expected impact (Low/Medium/High)
   - How to measure (specific metric)
   - Test duration (days)

3. Rank experiments by effort-to-impact ratio. Which one should I run first?
```

---

## Bonus: Research Quality Control

### 6.1 Fact-Check an Idea's Claims
```
I found this business idea in a database: [IDEA]

The following claims are made about it:
[LIST CLAIMS: market size, customer pain, revenue potential, etc.]

Please fact-check each claim:
1. What is the evidence for this claim?
2. Is the evidence primary (directly measured) or secondary (estimated)?
3. Are there counter-data points that contradict this claim?
4. What is the confidence level in this claim: High / Medium / Low / Speculative?
5. What additional research would make you more confident?

Overall: is this idea built on solid evidence or on weak assumptions?
```

### 6.2 Score an Idea Using Venture Atlas Methodology
```
Please score the following idea using the Venture Atlas scoring methodology:

IDEA: [IDEA NAME]
DESCRIPTION: [BRIEF DESCRIPTION]
TARGET CUSTOMER: [CUSTOMER]
PROBLEM: [PROBLEM STATEMENT]
PROPOSED SOLUTION: [SOLUTION]
REVENUE MODEL: [REVENUE MODEL]
STARTUP COST ESTIMATE: $[X]
MARKET SIZE ESTIMATE: $[X]B

Score on each dimension (0–100):
1. Overall Opportunity Score
2. Market Size Score (total addressable market)
3. Profit Potential Score (margins, LTV:CAC, scalability)
4. Confidence Score (quality of evidence supporting claims)
5. Speed to Revenue Score (weeks/months to first $)
6. Founder Fit Score (how accessible to a solo/small team)
7. Differentiation Score (uniqueness vs. alternatives)
8. Technical Feasibility Score (buildability with current tech)

For each score, provide:
- Rationale (2–3 sentences)
- Key risks that could lower this score
- What would need to be true for this score to be 10 points higher
```

---

*Venture Atlas OS — open research repository. All scores are decision-support tools. Revenue ranges are illustrative scenarios, not forecasts.*
