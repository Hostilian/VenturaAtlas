---
name: eushop-transactional-outbox-event-engine
description: "PostgreSQL Transactional Outbox & Event-Driven Message Engine for EUshop"
---

# EUshop Transactional Outbox Event Engine Skill

## Overview

This skill establishes the PostgreSQL transactional outbox pattern for reliable event publishing without distributed broker complexity.

---

## 1. Outbox Table Schema & Pattern

- **Table**: `outbox_events` (columns: `id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload`, `created_at`, `processed_at`).
- **Atomic Commit**: Domain mutations and outbox records MUST be inserted within the same database transaction block.
- **Idempotent Consumers**: Subscribers must track `processed_at` timestamp and event UUID to guarantee at-least-once processing safety.
