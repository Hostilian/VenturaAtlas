---
name: eushop-opentelemetry-observability-tracing
description: "Distributed Tracing, Correlation IDs & Observability Standards for EUshop"
---

# EUshop OpenTelemetry & Observability Skill

## Overview

This skill establishes distributed tracing, correlation ID propagation, Prometheus metrics, and structured JSON logging across Next.js, Spring Boot, and PostgreSQL.

---

## 1. Required Correlation IDs

Every log entry and trace MUST include:
- `request_id`: Unique HTTP request identifier.
- `trace_id`: OpenTelemetry W3C trace parent.
- `user_id` / `seller_id`: Pseudonymous actor ID.
- `order_id` / `payment_intent_id`: Transaction entity reference.
- `stripe_event_id`: Webhook payload reference.

---

## 2. Log Redaction Standard

NEVER log raw sensitive fields:
- Passwords, JWT secrets, Stripe secret keys, full credit card numbers, or tax IDs must be redacted with `[REDACTED]`.
