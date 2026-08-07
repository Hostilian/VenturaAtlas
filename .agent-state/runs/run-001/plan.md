# Implementation Plan: FactBounty MVP (Run 001)

## Goal
Build a working, testable MVP for **FactBounty — Buyer-Funded Product Proof Exchange (Idea ID: idea-061)**.

## Architecture
- **Framework**: Express + TypeScript / Vite full-stack isolated app in `apps/factbounty`
- **Domain State Machines**: Typed Zod & TypeScript state machines for Bounty & Evidence
- **Storage**: Local JSON/SQLite database + S3/Local Blob storage for media capture
- **Payments**: PaymentProvider abstraction with Zero-Dependency Local Simulator + Stripe Test-Mode Adapter
- **Capture**: Browser-native camera/screen capture + cryptographic challenge code binding
- **Testing**: Vitest unit/integration tests + Playwright E2E journey
