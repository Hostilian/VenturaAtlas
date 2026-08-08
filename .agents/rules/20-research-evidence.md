---
trigger: model_decision
description: Rules for evidence classification, source quality, and claims research
---

# Research & Evidence Rules

1. **Distinguish 4 Truth Classes**:
   - Class A: Deterministic Repository Fact (code computed)
   - Class B: Externally Verified Fact (sourced evidence)
   - Class C: Reasoned Inference (labeled analysis)
   - Class D: Hypothesis / Unknown (explicitly marked unknown)
2. **No Model Enthusiasm as Evidence**: Unverified LLM outputs must be stored as `evidenceStatus: "unverified"` and `promotionEligible: false`.
3. **Source Quality Taxonomy**: Classify sources by official regulators, statutes, official pricing, company filings, academic papers, direct customer evidence, or community posts.
