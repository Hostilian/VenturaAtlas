const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Computes deterministic sha256 of JSON-serializable object.
 */
function computeObjectDigest(obj) {
  const normalized = JSON.stringify(obj, Object.keys(obj || {}).sort());
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Reads durable state record and computes current digest.
 */
function readDurableState(relPath) {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    return {
      exists: false,
      revision: 0,
      digest: null,
      state: null
    };
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const state = JSON.parse(content);
  const revision = Number(state.stateRevision || state.iteration || 0);
  const digest = computeObjectDigest(state);
  return {
    exists: true,
    revision,
    digest,
    state
  };
}

/**
 * Writes state using Optimistic Concurrency Control (CAS).
 * Throws STATE_CONFLICT error if current revision on disk differs from expectedRevision.
 */
function writeDurableStateCas(relPath, expectedRevision, nextStatePayload, runId = 'local-run') {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
  const current = readDurableState(relPath);

  if (current.exists && current.revision !== expectedRevision) {
    const error = new Error(`STATE_CONFLICT: Expected revision ${expectedRevision}, found ${current.revision}`);
    error.code = 'STATE_CONFLICT';
    error.currentRevision = current.revision;
    error.expectedRevision = expectedRevision;
    throw error;
  }

  const nextRevision = expectedRevision + 1;
  const nextState = {
    ...nextStatePayload,
    stateRevision: nextRevision,
    previousRevision: expectedRevision,
    previousDigest: current.digest,
    runId: runId,
    updatedAt: new Date().toISOString()
  };

  const nextDigest = computeObjectDigest(nextState);
  nextState.currentDigest = nextDigest;

  const tempPath = `${fullPath}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(nextState, null, 2) + '\n', 'utf8');
  fs.renameSync(tempPath, fullPath);

  return {
    success: true,
    revision: nextRevision,
    digest: nextDigest,
    state: nextState
  };
}

module.exports = {
  computeObjectDigest,
  readDurableState,
  writeDurableStateCas
};
