# FactBounty MVP — Implementation & Production Roadmap

FactBounty (`apps/factbounty/`) is the #1 ranked business opportunity (**idea-061**, Composite Headline Score **91.2**) in Venture Atlas OS, built as a full TypeScript application MVP.

---

## Current Status: Local Prototype & Verification Suite (100% Complete)

FactBounty is fully implemented and tested using zero-dependency local simulators:
- **API Server**: Express REST API (`apps/factbounty/api/server.ts`)
- **Database**: SQLite3 / local state persistence (`apps/factbounty/db/`)
- **Payments Engine**: Provider abstraction with test-mode simulator (`apps/factbounty/payments/` & `apps/factbounty/simulators/`)
- **Evidence Capture**: Browser-native capture interface and cryptographic challenge generator (`apps/factbounty/capture/`)

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
