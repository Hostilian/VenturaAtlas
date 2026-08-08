---
name: va-opentelemetry-observability-tracing
description: Distributed tracing, correlation IDs, and OpenTelemetry observability standards.
---

# OpenTelemetry Observability & Distributed Tracing

This skill establishes telemetry instrumentation, correlation IDs, and structured logging standards.

## Observability Directives

1. **Correlation IDs**:
   - Inject `x-correlation-id` headers into every HTTP request and trace context across services.
2. **Structured JSON Logs**:
   - Output logs as single-line JSON objects containing `timestamp`, `level`, `correlation_id`, `component`, and `message`.
3. **Performance Metrics**:
   - Track request latency percentiles (p50, p95, p99) and database query durations.
