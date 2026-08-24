/**
 * Service Worker — Venture Atlas OS PWA (v2.7.1)
 * Multi-cache dual-clock architecture:
 * - CACHE_VERSION (Repository clock): static-v2.7.1
 * - DATA_REVISION (Projection clock): data-c1e9860655f01c32
 */

const CACHE_VERSION = '2.7.1';
const DATA_REVISION = '5b109b0ac5a08168';

const STATIC_CACHE = `ventura-static-v${CACHE_VERSION}-${DATA_REVISION}`;
const DATA_CACHE = `ventura-data-${DATA_REVISION}`;
const PAGE_CACHE = `ventura-pages-v${CACHE_VERSION}`;

const REQUIRED_SHELL = [
  './index.html',
  './offline.html',
  './docs/live-progress.html',
  './docs/room.html',
  './docs/room-compare.html',
  './assets/css/site.css',
  './assets/css/home.css',
  './assets/js/site.js',
  './assets/js/runtime-status.js',
  './assets/js/config.js',
  './assets/js/core/studio-store.js',
  './assets/js/core/firebase-adapter.js',
  './assets/js/features/studio.js',
  './assets/js/features/collaboration.js',
  './assets/js/features/room-compare.js',
  './manifest.webmanifest'
];

const OPTIONAL_DATA = [
  './data/repository-meta.json',
  './data/search-index.json',
  './data/ideas.json',
  './data/idea-taxonomy.json',
  './data/categories.json',
  './data/public-sources.json',
  './data/rankings.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await staticCache.addAll(REQUIRED_SHELL);

      const dataCache = await caches.open(DATA_CACHE);
      await Promise.allSettled(
        OPTIONAL_DATA.map(url => dataCache.add(url).catch(() => null))
      );

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const allowedCaches = new Set([STATIC_CACHE, DATA_CACHE, PAGE_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => !allowedCaches.has(key)).map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Exclude API paths or external non-same-origin requests
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // HTML Navigation Requests -> Network-first with offline.html fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(PAGE_CACHE);
            cache.put(request, networkResponse.clone());
          }
          // An online 404/500 is still a real server response. Returning it keeps
          // missing routes distinct from genuine network loss.
          return networkResponse;
        } catch (_) {
          // Network failed
        }
        const cached = await caches.match(request);
        if (cached) return cached;
        const offlinePage = await caches.match('./offline.html');
        return offlinePage || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      })()
    );
    return;
  }

  // Data / JSON Requests -> Network-first with cache fallback
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (_) {
          // Network failed
        }
        const cachedResponse = await cache.match(request);
        return cachedResponse || new Response('Data unavailable', { status: 503 });
      })()
    );
    return;
  }

  // Static Assets -> Network-first with offline cache fallback. This avoids
  // pinning users to an older JavaScript/CSS bundle when application code
  // changes without a package-version or data-revision bump.
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // Asset URLs are cache-busted in HTML, while the required shell is
        // precached without query strings. Ignore only the query component so
        // an offline load can reuse the exact same-path shell asset.
        const cachedResponse = await caches.match(request, { ignoreSearch: true });
        return cachedResponse || new Response('Asset unavailable', { status: 404 });
      }
    })()
  );
});
