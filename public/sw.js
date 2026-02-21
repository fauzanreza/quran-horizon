// Service Worker for Quran Horizon PWA
const CACHE_NAME = 'quran-horizon-v5';
const RUNTIME_CACHE = 'quran-runtime-v5';

// Core assets to cache immediately (app shell)
const CORE_ASSETS = [
  '/manifest.json',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v5');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v5');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // ─────────────────────────────────────────────────────
  // 1. Next.js JS/CSS chunks — ALWAYS network-first
  //    These change on every build; serving stale chunks
  //    causes React hydration mismatches.
  // ─────────────────────────────────────────────────────
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Only cache immutable hashed chunks (_next/static/chunks/*)
          // Skip hot-reload websocket and dev-only paths
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            url.pathname.includes('/_next/static/') &&
            !url.pathname.includes('/_next/static/webpack') &&
            !url.pathname.includes('hmr')
          ) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback: serve from cache if available
          return caches.match(request);
        })
    );
    return;
  }

  // ─────────────────────────────────────────────────────
  // 2. HTML navigation requests — ALWAYS network-first
  //    Stale HTML + new JS = hydration mismatch.
  // ─────────────────────────────────────────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // Update cached HTML in background
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline: try cached page, then cached home
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            if (url.pathname.startsWith('/surah/')) {
              return caches.match('/') || new Response('Offline', { status: 503 });
            }
            return caches.match('/') || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // ─────────────────────────────────────────────────────
  // 3. Quran API requests — stale-while-revalidate
  // ─────────────────────────────────────────────────────
  if (url.hostname === 'equran.id' || url.hostname === 'api.quran.com') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Serve from cache, update in background
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(request, networkResponse.clone());
                }
              })
              .catch(() => {});
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // ─────────────────────────────────────────────────────
  // 4. Mushaf page images (android.quran.com) — cache-first
  // ─────────────────────────────────────────────────────
  if (url.hostname === 'android.quran.com') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // ─────────────────────────────────────────────────────
  // 5. Google Fonts — cache-first (immutable)
  // ─────────────────────────────────────────────────────
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          return cachedResponse || fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // ─────────────────────────────────────────────────────
  // 6. Everything else (fonts, images, manifests) — network-first
  // ─────────────────────────────────────────────────────
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Allow manual cache clear from the app
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});
