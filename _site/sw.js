/**
 * Service Worker — Venture Atlas OS PWA (v2.1.1)
 * Multi-cache architecture with resilient offline support.
 */

const CACHE_VERSION = '2.1.1';
const STATIC_CACHE = `ventura-static-${CACHE_VERSION}`;
const DATA_CACHE = `ventura-data-${CACHE_VERSION}`;
const PAGE_CACHE = `ventura-pages-${CACHE_VERSION}`;

const REQUIRED_SHELL = [
  './index.html',
  './offline.html',
  './assets/css/site.css',
  './assets/css/home.css',
  './assets/js/site.js',
  './manifest.webmanifest'
];

const OPTIONAL_DATA = [
  './data/repository-meta.json',
  './data/search-index.json',
  './data/ideas.json',
  './data/categories.json',
  './data/sources.json',
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
            return networkResponse;
          }
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

  // Data / JSON Requests -> Stale-while-revalidate
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || (await fetchPromise) || new Response('Data unavailable', { status: 503 });
      })()
    );
    return;
  }

  // Static Assets -> Cache-first
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        return new Response('Asset unavailable', { status: 404 });
      }
    })()
  );
});
