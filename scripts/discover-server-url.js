#!/usr/bin/env node
/**
 * Local Server URL Discovery Helper
 * Identifies if a local development server is running on standard ports (3000, 5000, 8000, 8080)
 * or provides the local file base URL for offline testing.
 */

const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CANDIDATE_PORTS = [3000, 5000, 8000, 8080, 5173];

async function probePort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, { timeout: 300 }, (res) => {
      resolve(res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  for (const port of CANDIDATE_PORTS) {
    const active = await probePort(port);
    if (active) {
      const url = `http://localhost:${port}`;
      if (process.argv.includes('--json')) {
        console.log(JSON.stringify({ active: true, mode: 'http', url }));
      } else {
        console.log(url);
      }
      process.exit(0);
    }
  }

  const fileUrl = 'file:///' + ROOT.replace(/\\/g, '/');
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ active: false, mode: 'file', url: fileUrl }));
  } else {
    console.log(fileUrl);
  }
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { probePort, main };
