---
name: va-stripe-payment-idempotency
description: Server-authoritative payment processing, webhook signature verification, and idempotency engine.
---

# Payment Idempotency & Server-Authoritative Billing

This skill governs payment integration, webhook verification, and double-charge prevention for VenturaAtlas commercial modules.

## Key Directives

1. **Idempotency Keys**:
   - Pass unique `Idempotency-Key` headers on all payment creation and charge requests (`idempotency-<userId>-<actionId>`).

2. **Webhook Signature Verification**:
   - Validate raw request payload signatures against secret webhook signing keys before parsing event JSON.

3. **Event Deduplication**:
   - Store processed event IDs in transactional database logs to prevent duplicate fulfillment on webhook retries.
