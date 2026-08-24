import { loadConfig } from '../config';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { FactBountyStore } from '../db/store';
import { createApp } from './app';

const config = loadConfig();
const engine = new FactBountyEngine(new FactBountyStore(config.FACTBOUNTY_DATA_PATH));
const app = createApp({ engine, config });

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`[FactBounty] Server listening at ${config.FACTBOUNTY_PUBLIC_BASE_URL} (Port ${config.PORT})`);
  });
}

export default app;
