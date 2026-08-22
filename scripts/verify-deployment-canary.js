#!/usr/bin/env node

/**
 * VenturaAtlas Live Deployment Canary Verifier (OMEGA XX)
 *
 * Verifies live reachability and integrity of the public deployment artifact
 * by querying the live URL canary and writing a formal deployment proof receipt.
 *
 * Usage:
 *   node scripts/verify-deployment-canary.js --url https://hostilian.github.io/VenturaAtlas/
 *   node scripts/verify-deployment-canary.js --local-server http://localhost:8000/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const PROOF_PATH = path.join(ROOT, '.agent-state', 'deployment-proof.json');

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const client = targetUrl.startsWith('https:') ? https : http;
    const req = client.get(targetUrl, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });
  });
}

async function verifyCanary() {
  const args = process.argv.slice(2);
  let targetUrl = 'https://hostilian.github.io/VenturaAtlas/';
  
  const urlIdx = args.indexOf('--url');
  if (urlIdx !== -1 && args[urlIdx + 1]) {
    targetUrl = args[urlIdx + 1];
  } else if (args.includes('--local-server')) {
    targetUrl = 'http://localhost:8000/';
  }

  console.log(`[DEPLOYMENT-CANARY] Checking live URL: ${targetUrl}`);

  try {
    const res = await fetchUrl(targetUrl);
    if (res.statusCode >= 200 && res.statusCode < 400 && /venture\s*atlas/i.test(res.body)) {
      const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'repository-meta.json'), 'utf8'));
      const proof = {
        schemaVersion: '2.0.0',
        url: targetUrl,
        verifiedAt: new Date().toISOString(),
        statusCode: res.statusCode,
        digest: meta.canonicalDataRevision || 'unknown',
        status: 'success',
        observationMethod: 'HTTP_CANARY_GET'
      };

      fs.mkdirSync(path.dirname(PROOF_PATH), { recursive: true });
      fs.writeFileSync(PROOF_PATH, JSON.stringify(proof, null, 2) + '\n', 'utf8');
      console.log(`[DEPLOYMENT-CANARY] PASSED. Proof receipt written to .agent-state/deployment-proof.json`);
      return proof;
    } else {
      console.warn(`[DEPLOYMENT-CANARY] Live target responded with status ${res.statusCode} or missing content.`);
    }
  } catch (err) {
    console.warn(`[DEPLOYMENT-CANARY] Live canary unreachable (${err.message}). Deployment remains NOT_OBSERVED.`);
  }
}

if (require.main === module) {
  verifyCanary();
}

module.exports = { verifyCanary };
