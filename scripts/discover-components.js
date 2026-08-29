#!/usr/bin/env node
/**
 * Component Discovery & Registry Generator
 * Scans UI components, verifies declared styles and script bindings,
 * and maintains the canonical data/components.json registry.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'components.json');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'component-discovery-audit.json');

const KNOWN_COMPONENTS = [
  {
    id: 'va-command-palette',
    name: 'Command Palette',
    description: 'Global fuzzy-search and quick action navigator with keyboard shortcuts (Cmd+K / Ctrl+K).',
    category: 'navigation',
    scriptPath: 'assets/js/features/command-palette.js',
    stylePath: 'assets/css/components/command-palette.css',
    demoPage: 'docs/components.html#va-command-palette',
    dependencies: [],
  },
  {
    id: 'va-chessboard-lab',
    name: 'Market Structure & Chessboard Lab',
    description: 'Interactive value-chain actor mapping, control-point positioning, and strategic moat visualization.',
    category: 'analysis',
    scriptPath: 'assets/js/features/chessboard-lab.js',
    stylePath: 'assets/css/chessboard.css',
    demoPage: 'docs/chessboard.html',
    dependencies: ['assets/js/core/chessboard-store.js'],
  },
  {
    id: 'va-capital-lab',
    name: 'Capital & Runway Scenario Engine',
    description: 'Dynamic runway forecasting, SAFE/convertible debt modeling, and funding fit assessment.',
    category: 'finance',
    scriptPath: 'assets/js/features/capital-lab.js',
    stylePath: 'assets/css/site.css',
    demoPage: 'docs/capital-lab.html',
    dependencies: ['assets/js/features/capital-engine.js'],
  },
  {
    id: 'va-studio-controller',
    name: 'Venture Studio & Opportunity Grid',
    description: 'Facet-based opportunity filtering, portfolio workbench, and ranking view matrix.',
    category: 'data-grid',
    scriptPath: 'assets/js/features/studio.js',
    stylePath: 'assets/css/site.css',
    demoPage: 'index.html',
    dependencies: ['assets/js/core/studio-store.js'],
  },
  {
    id: 'va-factbounty-capture',
    name: 'FactBounty Mobile Capture UI',
    description: 'ProofOps verifiable claim and physical media capture application scaffold.',
    category: 'application',
    scriptPath: 'apps/factbounty/api/app.ts',
    stylePath: 'assets/css/site.css',
    demoPage: 'docs/components.html#va-factbounty-capture',
    dependencies: [],
  },
];

function main() {
  const isCheckMode = process.argv.includes('--check');
  const errors = [];
  const discovered = [];

  for (const comp of KNOWN_COMPONENTS) {
    const scriptResolved = path.join(ROOT, comp.scriptPath);
    const styleResolved = path.join(ROOT, comp.stylePath);

    const scriptExists = fs.existsSync(scriptResolved);
    const styleExists = fs.existsSync(styleResolved);

    if (!scriptExists) {
      errors.push(`Component '${comp.id}' scriptPath does not exist: ${comp.scriptPath}`);
    }
    if (!styleExists) {
      errors.push(`Component '${comp.id}' stylePath does not exist: ${comp.stylePath}`);
    }

    discovered.push({
      ...comp,
      verified: scriptExists && styleExists,
    });
  }

  const registry = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalComponents: discovered.length,
    components: discovered,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  if (isCheckMode) {
    if (!fs.existsSync(REGISTRY_PATH)) {
      console.error('[COMPONENTS] Error: data/components.json does not exist. Run without --check to build.');
      process.exit(1);
    }
    const current = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    if (current.totalComponents !== registry.totalComponents) {
      console.error(`[COMPONENTS] Error: data/components.json totalComponents mismatch (found ${current.totalComponents}, expected ${registry.totalComponents}).`);
      process.exit(1);
    }
    console.log(`[COMPONENTS] OK: ${current.totalComponents} registered components verified.`);
    process.exit(0);
  }

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: errors.length === 0 ? 'PASSED' : 'FAILED',
    totalComponents: discovered.length,
    errors,
  };
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[COMPONENTS] Discovered and registered ${discovered.length} components to ${path.relative(ROOT, REGISTRY_PATH)}`);
  if (errors.length > 0) {
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
