---
name: eushop-stripe-payment-idempotency
description: "Server-Authoritative Stripe Connect & Payment Idempotency Engine for EUshop"
---

# EUshop Stripe Payment & Idempotency Skill

## Overview

This skill establishes server-authoritative payment patterns, Stripe Connect webhooks, idempotency keys, and zero-money-loss order state machines.

---

## Key Financial Principles

1. **Server-Authoritative Pricing**: Never trust client-side prices or totals passed from cart. The backend (`PaymentService.java`) recalculates totals directly from DB product entities.
2. **Currency-Aware Decimal Precision**: Use `BigDecimal` with 2 decimal places (`HALF_UP` rounding). Never use binary floating point (`float` / `double`) for money.
3. **Webhook Signature Verification**: Verify `Stripe-Signature` headers using endpoint secret before processing webhook payloads.
4. **Event Idempotency**: Deduplicate webhooks using Stripe event ID (`evt_...`). Never mark an order paid solely based on a frontend browser redirect.
