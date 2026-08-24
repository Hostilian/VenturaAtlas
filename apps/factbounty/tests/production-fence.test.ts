import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadConfig } from '../config';

test('FactBounty fails closed in production until payment and persistence gates exist', () => {
  assert.throws(
    () => loadConfig({
      NODE_ENV: 'production',
      FACTBOUNTY_DEMO_MODE: 'false',
      FACTBOUNTY_JWT_SECRET: 'production-shaped-but-not-real-secret',
      FACTBOUNTY_PUBLIC_BASE_URL: 'https://factbounty.example',
      PAYMENT_PROVIDER: 'stripe',
      STRIPE_SECRET_KEY: 'configured-but-not-used',
      STRIPE_WEBHOOK_SECRET: 'configured-but-not-used'
    }),
    /production startup is intentionally blocked/
  );
});
