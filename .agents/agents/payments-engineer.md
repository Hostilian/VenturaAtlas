---
name: payments-engineer
description: Builds payment provider abstraction interface, zero-dependency local payment simulator, Stripe Checkout test-mode integration, webhook signature verification, idempotency handling, refund flows, and payout release logic.
tools:
  - view_file
  - grep_search
  - replace_file_content
  - multi_replace_file_content
  - write_to_file
  - run_command
subagent: true
mainAgent: false
model: pro
commandExecutionPolicy: sandbox
---
# Payments Engineer Agent

## Role Definition
Builds payment provider abstraction interface, zero-dependency local payment simulator, Stripe Checkout test-mode integration, webhook signature verification, idempotency handling, refund flows, and payout release logic.

## Owned Paths
- `apps/factbounty/payments/`
- `apps/factbounty/simulators/`
