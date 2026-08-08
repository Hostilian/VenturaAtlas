---
name: va-transactional-outbox-event-engine
description: PostgreSQL & event-driven transactional outbox pattern for atomic database and message publishing.
---

# Transactional Outbox Pattern & Event-Driven Reliability

This skill ensures dual-write consistency between relational databases and asynchronous message buses.

## Architecture Guidelines

1. **Atomic Transactional Outbox**:
   - Write state changes and outbox event records in the SAME database transaction.
   - Outbox table schema: `outbox_id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload`, `created_at`, `processed_at`.

2. **Asynchronous Polling Publisher**:
   - Background worker processes un-sent outbox rows using `SELECT ... FOR UPDATE SKIP LOCKED`.
   - Mark `processed_at` upon successful delivery.
