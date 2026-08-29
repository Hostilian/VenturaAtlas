#!/usr/bin/env node
/**
 * Spotlight Local Sidecar Telemetry Adapter
 * Streams local traces and diagnostic logs to the Spotlight sidecar daemon (port 8969)
 * when running locally, or falls back to local logging without crashing.
 */

const http = require('http');

const SPOTLIGHT_HOST = process.env.SPOTLIGHT_HOST || 'localhost';
const SPOTLIGHT_PORT = parseInt(process.env.SPOTLIGHT_PORT || '8969', 10);

async function sendSpotlightEvent(event) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(event);
    const req = http.request({
      hostname: SPOTLIGHT_HOST,
      port: SPOTLIGHT_PORT,
      path: '/stream',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 1000,
    }, (res) => {
      resolve({ sent: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
    });

    req.on('error', () => {
      // Spotlight sidecar not running locally; degrade cleanly
      resolve({ sent: false, error: 'Sidecar offline' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ sent: false, error: 'Sidecar timeout' });
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  const isProbe = process.argv.includes('--probe');
  const result = await sendSpotlightEvent({
    timestamp: new Date().toISOString(),
    service: 'ventura-atlas-os',
    type: 'diagnostic_probe',
    message: 'Spotlight Sidecar Connection Test',
  });

  if (isProbe) {
    console.log(`[SPOTLIGHT] Probe result: ${result.sent ? 'CONNECTED' : 'OFFLINE (Graceful Fallback Active)'}`);
  } else {
    console.log(`[SPOTLIGHT] Telemetry sidecar status: ${result.sent ? 'active' : 'offline (local mode)'}`);
  }
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { sendSpotlightEvent };
