# Venture Atlas OS — Master Search Prompt

> **A comprehensive prompt for AI assistants to find, evaluate, and prioritize business opportunities using the Venture Atlas framework.**
>
> Plain-text version (copy-paste ready): `prompts/MASTER_SEARCH_PROMPT.txt`

---

## How to Use

1. Open the `.txt` version at `prompts/MASTER_SEARCH_PROMPT.txt` — it's formatted for direct copy-paste into any AI assistant
2. Choose one of the **7 task options** (A–G) and delete the others
3. Fill in the bracketed fields with your specific context
4. For best results, also download `data/ideas.json` or `data/ideas.csv` and paste relevant sections into the AI context

Works best with: **Claude 3.5+**, **GPT-4o**, **Gemini 1.5 Pro**

---

## The 7 Task Options

| Option | Use Case |
|--------|----------|
| **A** | Find new ideas in a specific domain |
| **B** | Evaluate a specific idea against the full scoring framework |
| **C** | Compare two or more ideas and get a recommendation |
| **D** | Find 8 adjacent ideas to one you're already exploring |
| **E** | Research a specific market for opportunities |
| **F** | Validate a business model (pricing, unit economics, alternatives) |
| **G** | Design a 7-day validation sprint with zero budget |

---

## Venture Atlas Scoring System (Reference)

| Dimension | What It Measures |
|-----------|-----------------|
| Overall | Composite of all dimensions |
| Market Size | Total addressable market (TAM) potential |
| Profit Potential | Gross margins, LTV:CAC, scalability |
| Confidence | Evidence quality for claims made |
| Speed to Revenue | Weeks/months to first paying customer |
| Founder Accessibility | Buildable by a solo/small team |
| Differentiation | Uniqueness vs. existing alternatives |
| Technical Feasibility | Buildable with current technology |

**Score legend:**
- 90–100 = Exceptional. Rare combination of strong signals.
- 80–89 = Strong. Worth serious investigation.
- 70–79 = Good. Needs more validation but promising.
- 60–69 = Moderate. Specific conditions required to succeed.
- 50–59 = Weak. Significant risks or gaps.
- <50 = Not recommended. Major structural problems.

---

## Evidence Labels

| Label | Meaning |
|-------|---------|
| `[VERIFIED]` | Confirmed by primary source |
| `[CITED]` | Supported by secondary source |
| `[ESTIMATED]` | Calculated with stated assumptions |
| `[CLAIMED]` | Stated without external verification |
| `[ASSUMED]` | Logical inference, not tested |

---

## Follow-Up Questions

After running the main prompt, use these in the same conversation:

- *"For [IDEA], write me a customer discovery script."*
- *"What's the most important experiment to run in 48 hours to test [IDEA]?"*
- *"Play devil's advocate — what are the 5 strongest arguments that [IDEA] will fail?"*
- *"What would the ideal founding team look like for [IDEA]?"*
- *"Give me a 3-minute elevator pitch for [IDEA] for: a) a customer b) an investor c) a co-founder"*
- *"If you had to bet $10,000 on [IDEA 1] vs [IDEA 2], which and why?"*

---

## Related Resources

| Resource | Description |
|----------|-------------|
| [`prompts/IDEA_LIFECYCLE_PROMPTS.md`](./IDEA_LIFECYCLE_PROMPTS.md) | Prompts for all 5 lifecycle stages |
| [`prompts/research-prompts.md`](./research-prompts.md) | Deep research and market analysis |
| [`prompts/validation-prompts.md`](./validation-prompts.md) | Customer discovery and assumption testing |
| [`prompts/financial-modeling-prompts.md`](./financial-modeling-prompts.md) | Revenue and cost modeling |
| [`docs/methodology.html`](../docs/methodology.html) | Full scoring methodology |
| [`docs/matcher.html`](../docs/matcher.html) | Interactive idea matcher |
| [`data/ideas.json`](../data/ideas.json) | Full dataset for AI analysis |
| [`SEARCH_AND_DISCOVERY_GUIDE.md`](../SEARCH_AND_DISCOVERY_GUIDE.md) | How to browse the repository |

---

*Venture Atlas OS — open research repository. All scores are decision-support tools.*
