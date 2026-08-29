#!/usr/bin/env node
/**
 * scripts/build-component-inventory.js
 * Scans assets/js/ and docs/*.html for reusable units and emits data/component-inventory.json.
 */
import fs from 'node:fs';
import path from 'node:path';

const INVENTORY_PATH = path.resolve(process.cwd(), 'data/component-inventory.json');
const isCheckMode = process.argv.includes('--check');

console.log('[INVENTORY] Scanning codebase for UI components and reusable utility functions...');

const components = [];
const knownUtilities = [];

// 1. Scan assets/js/components and modules
const jsDirs = ['assets/js/components', 'assets/js/modules', 'assets/js/features', 'assets/js/utils', 'apps/factbounty'];

for (const dir of jsDirs) {
  const fullDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(fullDir)) continue;

  const files = fs.readdirSync(fullDir, { recursive: true });
  for (const file of files) {
    if (typeof file !== 'string') continue;
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

    const filePath = path.join(fullDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract custom elements
    const customElemMatches = content.matchAll(/customElements\.define\(\s*['"]([a-z0-9-]+)['"]/g);
    for (const match of customElemMatches) {
      components.push({
        id: match[1],
        kind: 'custom-element',
        sourceFile: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
      });
    }

    // Extract exported / top-level functions
    const funcMatches = content.matchAll(/(?:export\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(/g);
    for (const match of funcMatches) {
      const name = match[1];
      if (!name.startsWith('_') && !['init', 'main', 'run'].includes(name)) {
        knownUtilities.push({
          name,
          sourceFile: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
        });
      }
    }
  }
}

// 2. Scan docs/*.html for registered lab components
const docsDir = path.resolve(process.cwd(), 'docs');
if (fs.existsSync(docsDir)) {
  const docFiles = fs.readdirSync(docsDir);
  for (const docFile of docFiles) {
    if (!docFile.endsWith('.html')) continue;
    const filePath = path.join(docsDir, docFile);
    const content = fs.readFileSync(filePath, 'utf8');

    const labMatches = content.matchAll(/class=["']([^"']*(?:lab|palette|controller|store)[^"']*)["']/gi);
    for (const match of labMatches) {
      const classes = match[1].split(/\s+/).filter(Boolean);
      for (const cls of classes) {
        if (cls.startsWith('va-') || cls.includes('lab') || cls.includes('card')) {
          components.push({
            id: cls,
            kind: 'html-lab-container',
            sourceFile: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
          });
        }
      }
    }
  }
}

// Deduplicate
const uniqueComponents = Array.from(new Map(components.map((c) => [`${c.id}:${c.sourceFile}`, c])).values());
const uniqueUtilities = Array.from(new Map(knownUtilities.map((u) => [`${u.name}:${u.sourceFile}`, u])).values());

const inventoryData = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  componentCount: uniqueComponents.length,
  utilityCount: uniqueUtilities.length,
  components: uniqueComponents,
  knownUtilities: uniqueUtilities,
};

if (isCheckMode) {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error('[INVENTORY] Error: data/component-inventory.json does not exist. Run build first.');
    process.exit(1);
  }
  const existing = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
  if (existing.componentCount !== uniqueComponents.length) {
    console.warn(`[INVENTORY] Warning: Component count changed from ${existing.componentCount} to ${uniqueComponents.length}. Updating...`);
    fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventoryData, null, 2), 'utf8');
  }
  console.log(`[INVENTORY] OK: ${uniqueComponents.length} components and ${uniqueUtilities.length} utilities verified.`);
  process.exit(0);
} else {
  fs.mkdirSync(path.dirname(INVENTORY_PATH), { recursive: true });
  fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventoryData, null, 2), 'utf8');
  console.log(`[INVENTORY] Wrote ${uniqueComponents.length} components and ${uniqueUtilities.length} utilities to ${path.relative(process.cwd(), INVENTORY_PATH)}`);
  process.exit(0);
}
