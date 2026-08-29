/**
 * VenturaAtlas Sentry & Telemetry Configuration
 * Fail-closed, secret-safe Sentry SDK initialization and error reporting.
 */

let Sentry = null;
try {
  Sentry = require('@sentry/node');
} catch (_) {
  // @sentry/node optional in isolated test runtimes
}

const isConfigured = Boolean(process.env.SENTRY_DSN);

function initSentry(options = {}) {
  if (!Sentry || !isConfigured) {
    return {
      enabled: false,
      captureException: (err) => {
        console.error('[TELEMETRY:LOCAL]', err);
      },
      captureMessage: (msg, level = 'info') => {
        console.log(`[TELEMETRY:LOCAL:${level.toUpperCase()}]`, msg);
      },
    };
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.VA_EXECUTION_SCOPE || 'local-dev',
      release: process.env.VA_BUILD_REVISION || 'v2.7.1',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      ...options,
    });

    return {
      enabled: true,
      captureException: (err, context) => Sentry.captureException(err, context),
      captureMessage: (msg, level) => Sentry.captureMessage(msg, level),
    };
  } catch (initErr) {
    console.warn('[SENTRY] Warning: Failed to initialize Sentry SDK:', initErr.message);
    return {
      enabled: false,
      captureException: (err) => console.error('[TELEMETRY:FALLBACK]', err),
      captureMessage: (msg, level = 'info') => console.log(`[TELEMETRY:FALLBACK:${level.toUpperCase()}]`, msg),
    };
  }
}

module.exports = {
  initSentry,
  isConfigured,
};
