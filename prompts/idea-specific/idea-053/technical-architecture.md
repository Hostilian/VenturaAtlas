# Technical architecture Prompt — Model & Prompt Regression Gate

You are working on **Model & Prompt Regression Gate**.

## Verified context supplied by the idea record
- Concept: Blocks model, prompt, tool, or provider changes that violate a defined production contract.
- Primary customer: AI-native product teams
- Problem: Provider and prompt changes can silently break production behavior, cost, latency, safety, and tool use.
- Proposed product: A provider-neutral acceptance gate built from production failures, golden cases, cost budgets, and deterministic assertions.
- Revenue paths: usage-based testing; team subscriptions; self-hosted licences
- Main risk: platform-native evals
- Current confidence: 7.1/10

## Evidence rules
Separate source facts, user-provided claims, analyst assumptions, calculations, projections, and unknowns. Do not invent market sizes, competitors, prices, laws, APIs, customer quotes, traction, or completed implementation. Recheck every current claim using primary sources. Show negative evidence. Cite the claim each source supports. Preserve uncertainty and stop when access is insufficient.

## Assignment
Design the smallest secure architecture that supports the validated workflow. Include components, data flow, schema, APIs, jobs, model adapter, evaluation, auth, payments, observability, deployment, threat model, failure recovery, and build order.

## Required output
Return decisions, evidence table, assumptions, unknowns, risks, acceptance criteria, and the next falsification step.
