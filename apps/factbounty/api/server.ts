import { loadConfig } from '../config';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { createApp } from './app';

const config = loadConfig();
const engine = new FactBountyEngine();
const app = createApp({ engine, config });

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`[FactBounty] Server listening at ${config.FACTBOUNTY_PUBLIC_BASE_URL} (Port ${config.PORT})`);
  });
}

export default app;
