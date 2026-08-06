/**
 * Service Worker — Venture Atlas OS PWA
 * Provides offline caching for static assets, JSON data, and pages.
 */

const CACHE_NAME = 'venture-atlas-v2.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/css/site.css',
  './assets/js/site.js',
  './data/ideas.json',
  './data/sources.json',
  './data/categories.json',
  './data/rankings.json',
  './data/prompts.json',
  './data/relationships.json',
  './docs/rankings.html',
  './docs/compare.html',
  './docs/prompts.html',
  './docs/sources.html',
  './docs/categories.html',
  './docs/calculator.html',
  './docs/methodology.html',
  './docs/about.html',
  './docs/completeness.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networked = fetch(event.request).then(response => {
        if (response.status === 200) {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
        }
        return response;
      }).catch(() => cached);

      return cached || networked;
    })
  );
});
