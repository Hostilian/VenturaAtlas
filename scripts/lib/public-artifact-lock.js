const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_ARTIFACT_LOCK = path.join(ROOT, '.agent-state', 'locks', 'public-artifact.lock');
const lockSleepArray = new Int32Array(new SharedArrayBuffer(4));

function withPublicArtifactLock(callback, options = {}) {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const deadline = Date.now() + timeoutMs;
  fs.mkdirSync(path.dirname(PUBLIC_ARTIFACT_LOCK), { recursive: true });

  while (true) {
    try {
      fs.mkdirSync(PUBLIC_ARTIFACT_LOCK);
      break;
    } catch (error) {
      if (error.code !== 'EEXIST' || Date.now() >= deadline) {
        throw new Error(`Could not acquire public-artifact writer lock: ${error.message}`);
      }
      Atomics.wait(lockSleepArray, 0, 0, 100);
    }
  }

  try {
    return callback();
  } finally {
    fs.rmSync(PUBLIC_ARTIFACT_LOCK, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 50,
    });
  }
}

module.exports = { PUBLIC_ARTIFACT_LOCK, withPublicArtifactLock };
