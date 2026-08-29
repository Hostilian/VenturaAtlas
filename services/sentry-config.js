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

/**
 * Robust PII, Stripe, token, and secret scrubber for telemetry payloads
 */
function scrubSensitiveData(event) {
  if (!event) return event;

  const SENSITIVE_PATTERNS = [
    /sk_(?:live|test)_[0-9a-zA-Z]{24,}/gi,
    /rk_(?:live|test)_[0-9a-zA-Z]{24,}/gi,
    /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/gi, // JWT
    /\b(?:\d[ -]*?){13,16}\b/g, // Credit Card
    /Bearer\s+[A-Za-z0-9\-_.]+/gi,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, // Email
  ];

  function sanitizeValue(val) {
    if (typeof val === 'string') {
      let clean = val;
      for (const pattern of SENSITIVE_PATTERNS) {
        clean = clean.replace(pattern, '[REDACTED_SECRET]');
      }
      return clean;
    }
    if (Array.isArray(val)) {
      return val.map(sanitizeValue);
    }
    if (val && typeof val === 'object') {
      const sanitizedObj = {};
      for (const [k, v] of Object.entries(val)) {
        if (/^(?:authorization|cookie|stripe-signature|card|password|secret|token|api_key|apikey)$/i.test(k)) {
          sanitizedObj[k] = '[REDACTED_HEADER]';
        } else {
          sanitizedObj[k] = sanitizeValue(v);
        }
      }
      return sanitizedObj;
    }
    return val;
  }

  if (event.request) {
    event.request = sanitizeValue(event.request);
  }
  if (event.extra) {
    event.extra = sanitizeValue(event.extra);
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => sanitizeValue(b));
  }
  if (event.user) {
    event.user = { id: event.user.id || 'anonymous' };
  }

  return event;
}

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
      scrubSensitiveData,
    };
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.VA_EXECUTION_SCOPE || 'local-dev',
      release: process.env.VA_BUILD_REVISION || 'v2.7.1',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      beforeSend: (event) => scrubSensitiveData(event),
      ...options,
    });

    return {
      enabled: true,
      captureException: (err, context) => Sentry.captureException(err, context),
      captureMessage: (msg, level) => Sentry.captureMessage(msg, level),
      scrubSensitiveData,
    };
  } catch (initErr) {
    console.warn('[SENTRY] Warning: Failed to initialize Sentry SDK:', initErr.message);
    return {
      enabled: false,
      captureException: (err) => console.error('[TELEMETRY:FALLBACK]', err),
      captureMessage: (msg, level = 'info') => console.log(`[TELEMETRY:FALLBACK:${level.toUpperCase()}]`, msg),
      scrubSensitiveData,
    };
  }
}

module.exports = {
  initSentry,
  isConfigured,
  scrubSensitiveData,
};
