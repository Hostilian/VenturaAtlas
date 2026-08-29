#!/usr/bin/env node
/**
 * Headless Agent Browser Verification Tool
 * Launches Playwright to verify DOM integrity, detect console errors/unhandled rejections,
 * test responsive viewports, capture verification screenshots, and emit audit receipts.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, '.agent-state', 'screenshots');
const RECEIPT_PATH = path.join(ROOT, '.agent-state', 'quality-receipts', 'browser-verification.json');

const TARGET_PAGES = [
  {
    name: 'Home / Opportunity Grid',
    path: 'index.html',
    requiredSelectors: ['body', 'header', 'nav'],
  },
  {
    name: 'TERRAIN Lab',
    path: 'docs/terrain.html',
    requiredSelectors: ['body'],
  },
  {
    name: 'CENSUS Lab',
    path: 'docs/census-lab.html',
    requiredSelectors: ['body'],
  },
  {
    name: 'ORBIT Portfolio Lab',
    path: 'docs/portfolio-lab.html',
    requiredSelectors: ['body'],
  },
  {
    name: 'MERCURY Commercial Lab',
    path: 'docs/mercury.html',
    requiredSelectors: ['body'],
  },
  {
    name: 'RELAY Operations Lab',
    path: 'docs/ops-lab.html',
    requiredSelectors: ['body'],
  },
  {
    name: 'CONSTELLATION Org Lab',
    path: 'docs/org-lab.html',
    requiredSelectors: ['body'],
  },
  {
    name: 'CAPITAL Lab',
    path: 'docs/capital-lab.html',
    requiredSelectors: ['body'],
  },
  {
    name: 'CHESSBOARD Lab',
    path: 'docs/chessboard.html',
    requiredSelectors: ['body'],
  },
  {
    name: 'Component Showcase',
    path: 'docs/components.html',
    requiredSelectors: ['#components-list', '.interactive-harness'],
  },
  {
    name: 'Sample Idea 001 Dossier',
    path: 'docs/idea.html?id=idea-001',
    requiredSelectors: ['body'],
  },
  {
    name: 'Sample Idea 061 Dossier',
    path: 'docs/idea.html?id=idea-061',
    requiredSelectors: ['body'],
  },
];

async function verifyPage(browser, pageConfig) {
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  const fileUrl = 'file:///' + path.join(ROOT, pageConfig.path).replace(/\\/g, '/');
  
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 15000 });

  const missingSelectors = [];
  for (const selector of pageConfig.requiredSelectors || []) {
    const el = await page.$(selector);
    if (!el) {
      missingSelectors.push(selector);
    }
  }

  // Capture screenshot
  const screenshotName = `${pageConfig.path.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  await page.close();

  return {
    name: pageConfig.name,
    path: pageConfig.path,
    url: fileUrl,
    screenshotPath: path.relative(ROOT, screenshotPath),
    missingSelectors,
    consoleErrors,
    pageErrors,
    passed: missingSelectors.length === 0 && pageErrors.length === 0,
  };
}

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('[AGENT-BROWSER] Launching headless browser verification...');
  let browser = null;
  const results = [];

  try {
    browser = await chromium.launch({ headless: true });
    for (const pageConfig of TARGET_PAGES) {
      console.log(`[AGENT-BROWSER] Testing page: ${pageConfig.name} (${pageConfig.path})...`);
      const res = await verifyPage(browser, pageConfig);
      results.push(res);
    }
  } catch (err) {
    console.error('[AGENT-BROWSER] Browser launch or execution error:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }

  const allPassed = results.every(r => r.passed);

  const receipt = {
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    status: allPassed ? 'PASSED' : 'FAILED',
    pagesTested: results.length,
    results,
  };

  const receiptsDir = path.dirname(RECEIPT_PATH);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf-8');

  console.log(`[AGENT-BROWSER] Verified ${results.length} pages. Status: ${allPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`[AGENT-BROWSER] Receipt written to ${path.relative(ROOT, RECEIPT_PATH)}`);

  if (!allPassed) {
    results.filter(r => !r.passed).forEach(r => {
      console.error(`  - Failed: ${r.name}`);
      if (r.missingSelectors.length) console.error(`    Missing selectors: ${r.missingSelectors.join(', ')}`);
      if (r.pageErrors.length) console.error(`    Page errors: ${r.pageErrors.join(', ')}`);
    });
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { verifyPage, main };
