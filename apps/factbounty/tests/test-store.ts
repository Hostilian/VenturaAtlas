import fs from 'fs';
import os from 'os';
import path from 'path';
import { FactBountyEngine } from '../backend/factbounty-engine';
import { FactBountyStore } from '../db/store';

export function createIsolatedTestEngine(prefix: string): {
  engine: FactBountyEngine;
  cleanup: () => void;
} {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `venture-atlas-${prefix}-`));
  const engine = new FactBountyEngine(new FactBountyStore(path.join(directory, 'factbounty.json')));
  return {
    engine,
    cleanup: () => fs.rmSync(directory, { recursive: true, force: true })
  };
}
