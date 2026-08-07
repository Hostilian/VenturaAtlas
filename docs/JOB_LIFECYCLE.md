# Venture Atlas OS — Job Lifecycle Specification

```text
DISCOVERY (Candidate UUID) ──> DEDUP ──> EVIDENCE ──> SCORING ──> RED-TEAM ──> SERIALIZED PUBLICATION (idea-XXX)
```

## State Transitions
`queued` ──> `leased` ──> `running` ──> `completed` | `rejected` | `dead_letter`
