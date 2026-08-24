/**
 * Venture Atlas OS — truthful autonomous-runtime status resolver.
 *
 * A same-origin `/progress` response is treated as live only when its heartbeat
 * is structurally valid and fresh. Static deployments fall back to the public
 * GitHub Actions run API. Repository metadata is deliberately never converted
 * into a worker-health claim.
 */
(function exposeRuntimeStatus(scope) {
  'use strict';

  const DEFAULT_REPOSITORY = 'Hostilian/VenturaAtlas';
  const DEFAULT_WORKFLOW = 'research-cycle.yml';
  const CONTROL_PLANE_FRESH_MS = 20 * 60 * 1000;
  const CLOUD_RUN_FRESH_MS = 150 * 60 * 1000;
  const CLOCK_SKEW_MS = 5 * 60 * 1000;
  const LIVE_POLL_MS = 15 * 1000;
  const CLOUD_POLL_MS = 5 * 60 * 1000;
  const REQUEST_TIMEOUT_MS = 6 * 1000;

  let cachedSnapshot = null;
  let cachedAt = 0;
  let inFlight = null;
  let watchTimer = null;
  let watchOptions = null;
  const listeners = new Set();

  function clampProgress(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
  }

  function timestampMs(value) {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : null;
  }

  function ageMs(value, nowMs) {
    const parsed = timestampMs(value);
    return parsed === null ? null : nowMs - parsed;
  }

  function safeText(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 500) || fallback;
  }

  function unknownSnapshot(reason = 'No fresh automation receipt is reachable from this page.') {
    return {
      state: 'unknown',
      status: 'unknown',
      statusLabel: 'STATUS UNKNOWN',
      badgeValue: '?',
      progress: 0,
      runId: 'unavailable',
      task: 'automation status',
      updatedAt: null,
      message: reason,
      outputTail: '',
      source: 'none',
      sourceLabel: 'No verified status source',
      sourceUrl: null,
      isLive: false,
      isVerified: false,
      isFresh: false,
      nextPollMs: CLOUD_POLL_MS
    };
  }

  function classifyControlPlane(payload, options = {}) {
    if (!payload || typeof payload !== 'object') return null;
    const nowMs = options.nowMs ?? Date.now();
    const freshMs = options.freshMs ?? CONTROL_PLANE_FRESH_MS;
    const updatedAt = safeText(payload.updatedAt);
    const heartbeatAge = ageMs(updatedAt, nowMs);
    const rawStatus = safeText(payload.status, 'unknown').toLowerCase();
    const runId = safeText(payload.runId, 'unavailable');
    const task = safeText(payload.task, 'autonomous pipeline');
    if (heartbeatAge === null || runId === 'unavailable') return null;

    const base = {
      progress: clampProgress(payload.progress),
      runId,
      task,
      updatedAt,
      message: safeText(payload.message, 'Fresh control-plane heartbeat received.'),
      outputTail: safeText(payload.outputTail),
      source: 'control-plane',
      sourceLabel: 'Live control-plane heartbeat',
      sourceUrl: null,
      isLive: false,
      isVerified: false,
      isFresh: false,
      nextPollMs: LIVE_POLL_MS
    };

    if (heartbeatAge < -CLOCK_SKEW_MS) {
      return {
        ...base,
        state: 'unknown',
        status: 'clock-error',
        statusLabel: 'CLOCK ERROR',
        badgeValue: '?',
        message: 'The worker heartbeat is dated in the future, so its health cannot be trusted.'
      };
    }
    if (heartbeatAge > freshMs) {
      return {
        ...base,
        state: 'stale',
        status: 'stale',
        statusLabel: 'STALE HEARTBEAT',
        badgeValue: 'stale',
        message: `The last control-plane heartbeat is older than ${Math.round(freshMs / 60000)} minutes.`
      };
    }

    const failed = ['failed', 'error', 'cancelled', 'timed_out'].includes(rawStatus);
    if (failed) {
      return {
        ...base,
        state: 'degraded',
        status: rawStatus,
        statusLabel: 'ACTION NEEDED',
        badgeValue: '!',
        isFresh: true
      };
    }

    const active = ['queued', 'running', 'in_progress', 'starting'].includes(rawStatus);
    const healthyIdle = ['sleeping', 'succeeded', 'success', 'idle', 'ready'].includes(rawStatus);
    if (!active && !healthyIdle) {
      return {
        ...base,
        state: 'unknown',
        status: rawStatus,
        statusLabel: 'UNKNOWN STATE',
        badgeValue: '?',
        isFresh: true,
        message: `A fresh heartbeat reported an unrecognized state: ${rawStatus}.`
      };
    }

    return {
      ...base,
      state: active ? 'live' : 'verified',
      status: rawStatus,
      statusLabel: active ? 'LIVE NOW' : 'FRESH HEARTBEAT',
      badgeValue: active ? `${base.progress}%` : 'fresh',
      isLive: true,
      isVerified: true,
      isFresh: true
    };
  }

  function classifyGithubRun(run, options = {}) {
    if (!run || typeof run !== 'object') return null;
    const nowMs = options.nowMs ?? Date.now();
    const freshMs = options.freshMs ?? CLOUD_RUN_FRESH_MS;
    const updatedAt = safeText(run.updated_at || run.run_started_at || run.created_at);
    const runAge = ageMs(updatedAt, nowMs);
    const status = safeText(run.status, 'unknown').toLowerCase();
    const conclusion = safeText(run.conclusion, '').toLowerCase();
    const sourceUrl = safeText(run.html_url) || null;
    const runId = run.id === undefined || run.id === null ? 'unavailable' : `github-${run.id}`;
    if (runAge === null || runId === 'unavailable') return null;

    const base = {
      progress: status === 'completed' ? 100 : 35,
      runId,
      task: 'hourly cloud research and review',
      updatedAt,
      outputTail: '',
      source: 'github-actions',
      sourceLabel: 'Public GitHub Actions receipt',
      sourceUrl,
      isLive: false,
      isVerified: false,
      isFresh: false,
      nextPollMs: CLOUD_POLL_MS
    };

    if (runAge < -CLOCK_SKEW_MS) {
      return {
        ...base,
        state: 'unknown',
        status: 'clock-error',
        statusLabel: 'CLOCK ERROR',
        badgeValue: '?',
        message: 'The latest workflow receipt is dated in the future, so it cannot prove continuity.'
      };
    }
    if (runAge > freshMs) {
      return {
        ...base,
        state: 'stale',
        status: 'stale',
        statusLabel: 'CLOUD RUN STALE',
        badgeValue: 'stale',
        message: `No scheduled cloud run has completed within ${Math.round(freshMs / 60000)} minutes.`
      };
    }
    if (['queued', 'in_progress', 'waiting', 'pending', 'requested'].includes(status)) {
      return {
        ...base,
        state: 'live',
        status,
        statusLabel: 'CLOUD RUNNING',
        badgeValue: 'running',
        isLive: true,
        isVerified: true,
        isFresh: true,
        message: 'The scheduled cloud research workflow is currently running.'
      };
    }
    if (status === 'completed' && conclusion === 'success') {
      return {
        ...base,
        state: 'verified',
        status: 'success',
        statusLabel: 'CLOUD VERIFIED',
        badgeValue: 'verified',
        isVerified: true,
        isFresh: true,
        message: 'The most recent scheduled cloud research workflow completed successfully.'
      };
    }
    if (status === 'completed') {
      return {
        ...base,
        state: 'degraded',
        status: conclusion || 'failed',
        statusLabel: 'CLOUD DEGRADED',
        badgeValue: '!',
        isVerified: true,
        isFresh: true,
        message: `The most recent scheduled cloud workflow completed with: ${conclusion || 'unknown conclusion'}.`
      };
    }
    return {
      ...base,
      state: 'unknown',
      status,
      statusLabel: 'UNKNOWN STATE',
      badgeValue: '?',
      isFresh: true,
      message: `GitHub reported an unrecognized workflow state: ${status}.`
    };
  }

  async function fetchJson(fetchImpl, url, timeoutMs) {
    if (typeof fetchImpl !== 'function') throw new Error('fetch is unavailable');
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetchImpl(url, {
        cache: 'no-store',
        signal: controller?.signal
      });
      if (!response || !response.ok) throw new Error(`HTTP ${response?.status ?? 'unknown'}`);
      return await response.json();
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  function githubRunsUrl(repository, workflow) {
    const safeRepository = String(repository || DEFAULT_REPOSITORY)
      .split('/')
      .map(encodeURIComponent)
      .join('/');
    return `https://api.github.com/repos/${safeRepository}/actions/workflows/${encodeURIComponent(workflow || DEFAULT_WORKFLOW)}/runs?event=schedule&per_page=3`;
  }

  async function resolveStatus(options = {}) {
    const fetchImpl = options.fetchImpl || scope.fetch?.bind(scope);
    const nowMs = options.nowMs ?? Date.now();
    const root = String(options.root || '.').replace(/\/$/, '');
    const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
    let controlPlaneSnapshot = null;
    let controlPlaneError = null;

    try {
      const payload = await fetchJson(fetchImpl, `${root}/progress`, timeoutMs);
      controlPlaneSnapshot = classifyControlPlane(payload, {
        nowMs,
        freshMs: options.controlPlaneFreshMs
      });
      if (controlPlaneSnapshot?.isFresh) return controlPlaneSnapshot;
    } catch (error) {
      controlPlaneError = error;
    }

    try {
      const payload = await fetchJson(
        fetchImpl,
        githubRunsUrl(options.repository, options.workflow),
        timeoutMs
      );
      const runs = Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : [];
      const latest = runs
        .filter(run => run && (run.event === undefined || run.event === 'schedule'))
        .sort((a, b) => timestampMs(b.updated_at || b.created_at) - timestampMs(a.updated_at || a.created_at))[0];
      const githubSnapshot = classifyGithubRun(latest, {
        nowMs,
        freshMs: options.cloudRunFreshMs
      });
      if (githubSnapshot) return githubSnapshot;
    } catch (_) {
      // The final state below intentionally stays unknown unless a valid receipt exists.
    }

    if (controlPlaneSnapshot) return controlPlaneSnapshot;
    const reason = controlPlaneError
      ? 'No fresh control-plane heartbeat or public cloud-run receipt is reachable.'
      : 'The available automation receipts were invalid or incomplete.';
    return unknownSnapshot(reason);
  }

  async function getStatus(options = {}) {
    const maxCacheMs = options.maxCacheMs ?? 10 * 1000;
    const nowMs = options.nowMs ?? Date.now();
    if (cachedSnapshot && nowMs - cachedAt < maxCacheMs) return cachedSnapshot;
    if (inFlight) return inFlight;
    inFlight = resolveStatus(options)
      .then(snapshot => {
        cachedSnapshot = snapshot;
        cachedAt = Date.now();
        return snapshot;
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  }

  function notify(snapshot) {
    listeners.forEach(listener => {
      try {
        listener(snapshot);
      } catch (error) {
        scope.console?.warn?.('[VentureAtlasRuntimeStatus] listener failed', error);
      }
    });
  }

  async function refreshWatch() {
    const snapshot = await getStatus({ ...watchOptions, maxCacheMs: 0 });
    notify(snapshot);
    if (listeners.size > 0) {
      watchTimer = setTimeout(refreshWatch, snapshot.nextPollMs || CLOUD_POLL_MS);
    }
    return snapshot;
  }

  function subscribe(listener, options = {}) {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    if (!watchOptions) watchOptions = options;
    if (cachedSnapshot) listener(cachedSnapshot);
    if (!watchTimer && !inFlight) refreshWatch();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && watchTimer) {
        clearTimeout(watchTimer);
        watchTimer = null;
      }
    };
  }

  const api = {
    constants: {
      CONTROL_PLANE_FRESH_MS,
      CLOUD_RUN_FRESH_MS,
      LIVE_POLL_MS,
      CLOUD_POLL_MS
    },
    classifyControlPlane,
    classifyGithubRun,
    getStatus,
    githubRunsUrl,
    resolveStatus,
    subscribe,
    unknownSnapshot
  };

  scope.VentureAtlasRuntimeStatus = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
}(typeof globalThis !== 'undefined' ? globalThis : this));
