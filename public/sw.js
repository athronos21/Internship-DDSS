// Kaziniya Pharmacy POS & Inventory - Service Worker
// Provides resilient offline operation for POS barcode scanning, medicine lookup, and asset caching

const CACHE_STATIC_VERSION = 'kaziniya-static-v1.2';
const CACHE_DATA_VERSION = 'kaziniya-data-v1.2';

const STATIC_ASSETS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// CRITICAL API ROUTES TO CACHE FOR OFFLINE PHARMACY POS
const CACHEABLE_API_PREFIXES = [
  '/api/medicines',
  '/api/categories',
  '/api/dashboard',
  '/api/branches',
];

// Install Event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS_TO_PRECACHE).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache initial warning:', err);
      });
    }).then(() => {
      // Force activation without waiting
      return self.skipWaiting();
    })
  );
});

// Activate Event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_STATIC_VERSION && key !== CACHE_DATA_VERSION) {
            console.log('[ServiceWorker] Removing stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Helper to determine if a request is for an API endpoint
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Helper to check if URL matches critical inventory data
function isCriticalDataRequest(url) {
  return CACHEABLE_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

// Fetch Handler
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests for cache lookup (POSTs are handled with offline fallback in client or sync)
  if (request.method !== 'GET') {
    return;
  }

  // 1. NAVIGATION REQUESTS (SPA fallback to index.html if offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache latest index.html on successful load
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_STATIC_VERSION).then((cache) => cache.put('/', copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_STATIC_VERSION);
          const cachedIndex = await cache.match('/') || await cache.match('/index.html');
          if (cachedIndex) return cachedIndex;
          return new Response('<h1>Kaziniya Pharmacy Offline</h1><p>Application is offline. Please reconnect to network.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 2. CRITICAL PHARMACY INVENTORY & POS API REQUESTS (Network First with Stale Cache Fallback)
  if (isApiRequest(url) && isCriticalDataRequest(url)) {
    event.respondWith(
      // Fetch from network with 3-second timeout for responsive offline fallback
      Promise.race([
        fetch(request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 3000))
      ])
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_DATA_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async (error) => {
          console.log(`[ServiceWorker] Network unavailable for ${url.pathname}. Using offline cached inventory.`, error);

          const dataCache = await caches.open(CACHE_DATA_VERSION);
          
          // A. Direct exact match in cache
          const exactCached = await dataCache.match(request);
          if (exactCached) {
            return exactCached;
          }

          // B. Special Barcode Search Offline Fallback: `/api/medicines/barcode/:barcode`
          // If individual barcode URL wasn't cached, parse cached `/api/medicines` list to find the item offline!
          if (url.pathname.startsWith('/api/medicines/barcode/')) {
            const barcode = url.pathname.replace('/api/medicines/barcode/', '').trim();
            const medicinesCachedResponse = await dataCache.match('/api/medicines');
            
            if (medicinesCachedResponse) {
              try {
                const medicinesData = await medicinesCachedResponse.json();
                if (medicinesData && Array.isArray(medicinesData.data)) {
                  const matchedMed = medicinesData.data.find(
                    (m) => m.barcode === barcode || m.id === barcode || m.sku === barcode
                  );
                  if (matchedMed) {
                    return new Response(
                      JSON.stringify({
                        success: true,
                        source: 'service-worker-offline-cache',
                        data: {
                          medicine: matchedMed,
                          batches: (matchedMed.batches || []),
                        },
                      }),
                      {
                        status: 200,
                        headers: {
                          'Content-Type': 'application/json',
                          'X-Offline-Cached': 'true',
                        },
                      }
                    );
                  }
                }
              } catch (e) {
                console.error('[ServiceWorker] Failed to parse cached medicines for barcode lookup', e);
              }
            }
          }

          // C. Return standard offline JSON fallback response
          return new Response(
            JSON.stringify({
              success: false,
              offline: true,
              message: 'Network offline. Using local cached pharmacy data.',
              data: [],
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json', 'X-Offline-Fallback': 'true' },
            }
          );
        })
    );
    return;
  }

  // 3. STATIC ASSETS (JS, CSS, Images, Fonts, Icons) - Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_STATIC_VERSION).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, we either used cached or will return 404
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for messages from client windows
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'PRECACHE_INVENTORY') {
    // Explicitly cache medicines and categories
    caches.open(CACHE_DATA_VERSION).then(async (cache) => {
      try {
        const [medsRes, catsRes, dashRes] = await Promise.all([
          fetch('/api/medicines'),
          fetch('/api/categories'),
          fetch('/api/dashboard'),
        ]);
        if (medsRes.ok) await cache.put('/api/medicines', medsRes.clone());
        if (catsRes.ok) await cache.put('/api/categories', catsRes.clone());
        if (dashRes.ok) await cache.put('/api/dashboard', dashRes.clone());
        
        event.ports[0]?.postMessage({ success: true, timestamp: Date.now() });
      } catch (err) {
        event.ports[0]?.postMessage({ success: false, error: err.message });
      }
    });
  }
});
