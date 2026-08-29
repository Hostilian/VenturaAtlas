import { loadConfig } from '../config';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { FactBountyStore } from '../db/store';
import { createApp } from './app';

const { initSentry } = require('../../../services/sentry-config');

const config = loadConfig();
const sentry = initSentry();

const engine = new FactBountyEngine(new FactBountyStore(config.FACTBOUNTY_DATA_PATH));
const app = createApp({ engine, config });

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`[FactBounty] Server listening at ${config.FACTBOUNTY_PUBLIC_BASE_URL} (Port ${config.PORT})`);
    if (sentry.enabled) {
      console.log('[FactBounty] Sentry error monitoring active with PII scrubbing.');
    }
  });
}

export default app;
