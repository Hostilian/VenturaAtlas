# Technical architecture Prompt — Repair Decision Assistant

You are working on **Repair Decision Assistant**.

## Verified context supplied by the idea record
- Concept: Compare repair, replacement, resale, and environmental cost from device evidence.
- Primary customer: independent builders
- Problem: Consumers lack transparent evidence for practical cost and sustainability decisions.
- Proposed product: Compare repair, replacement, resale, and environmental cost from device evidence. The product should keep inputs, evidence, decisions, outputs, and change history structured and auditable.
- Revenue paths: premium reports and referral fees
- Main risk: unclear first wedge
- Current confidence: 8.8/10

## Evidence rules
Separate source facts, user-provided claims, analyst assumptions, calculations, projections, and unknowns. Do not invent market sizes, competitors, prices, laws, APIs, customer quotes, traction, or completed implementation. Recheck every current claim using primary sources. Show negative evidence. Cite the claim each source supports. Preserve uncertainty and stop when access is insufficient.

## Assignment
Design the smallest secure architecture that supports the validated workflow. Include components, data flow, schema, APIs, jobs, model adapter, evaluation, auth, payments, observability, deployment, threat model, failure recovery, and build order.

## Required output
Return decisions, evidence table, assumptions, unknowns, risks, acceptance criteria, and the next falsification step.
