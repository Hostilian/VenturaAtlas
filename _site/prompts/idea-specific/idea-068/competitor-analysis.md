# Competitor analysis Prompt — Product Evidence API for Shopping Agents

You are working on **Product Evidence API for Shopping Agents**.

## Verified context supplied by the idea record
- Concept: AI shopping agents pay per evidence-backed, human-verified product fact rather than relying on unverified merchant specs — a B2B API layer built on top of the FactBounty evidence corpus.
- Primary customer: Shopping AI agent developers, comparison engine operators, and large retailers with Q&A deficits
- Problem: No reliable, machine-readable, evidence-backed product fact API exists; agents must rely on unverified merchant-supplied data.
- Proposed product: A REST API delivering structured verified product facts: {productId, factType, value, confidence, evidenceUrl, responderCount, lastVerified}. Backed by the FactBounty evidence corpus.
- Revenue paths: Per-call pricing (€0.01–€0.10 per fact retrieval). Monthly subscription tiers (€99–€499/month + usage overage). Custom data partnerships with major shopping platforms.
- Main risk: Empty API without corpus is worthless; protocol changes could shift the integration surface; major shopping platforms may build their own
- Current confidence: 6/10

## Evidence rules
Separate source facts, user-provided claims, analyst assumptions, calculations, projections, and unknowns. Do not invent market sizes, competitors, prices, laws, APIs, customer quotes, traction, or completed implementation. Recheck every current claim using primary sources. Show negative evidence. Cite the claim each source supports. Preserve uncertainty and stop when access is insufficient.

## Assignment
Perform a feature-by-feature, pricing-by-pricing, and vulnerability-by-vulnerability teardown of incumbent solutions and direct competitors.

## Required output
Return decisions, evidence table, assumptions, unknowns, risks, acceptance criteria, and the next falsification step.
