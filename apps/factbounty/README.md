# FactBounty MVP — Implementation & Production Roadmap

FactBounty (`apps/factbounty/`) is the #1 ranked business opportunity (**idea-061**, Composite Headline Score **91.2**) in Venture Atlas OS, built as a full TypeScript application MVP.

---

## Current Status: Local Prototype & Verification Suite (production blocked)

FactBounty is a locally implemented and tested prototype using zero-dependency simulators. Passing local tests prove the state-machine and adapter contracts only; they do not prove live customers, revenue, payment settlement, payout, identity, privacy, or production readiness:
- **API Server**: Express REST API (`apps/factbounty/api/server.ts`)
- **Database**: SQLite3 / local state persistence (`apps/factbounty/db/`)
- **Payments Engine**: Provider abstraction with test-mode simulator (`apps/factbounty/payments/` & `apps/factbounty/simulators/`)
- **Evidence Capture**: Browser-native capture interface and cryptographic challenge generator (`apps/factbounty/capture/`)

Production startup is intentionally fail-closed. The current Stripe adapter is test-shaped, object-storage verification is fixture-shaped, and persistence is a local JSON store. Do not configure a public production deployment from this README. The exact closure gates, pilot scope, kill rules, and 30/60/90-day plan are documented in [`research/audits/OMEGA-XIX-20260827T135453Z/PRODUCT_READINESS.md`](../../research/audits/OMEGA-XIX-20260827T135453Z/PRODUCT_READINESS.md).

Run the full FactBounty test suite:
```bash
npm run test:factbounty
```

---

## Production Deployment Checklist

To graduate FactBounty from local test mode to live production, configure the following environment variables:

1. **Stripe Connect & Payments**:
   - `STRIPE_SECRET_KEY`: Live secret API key (`sk_live_...`)
   - `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (`whsec_...`)
2. **Object Storage (Evidence Media)**:
   - `AWS_S3_BUCKET` / `R2_BUCKET`: Storage bucket name for raw & scrubbed media assets.
   - `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: Storage credentials.
3. **Database**:
   - `DATABASE_URL`: Production PostgreSQL or Cloud SQL connection string.
