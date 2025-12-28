/**
 * Service Worker for Colour Me Brazil
 * Provides offline functionality and caching for PWA
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `colour-me-brazil-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/legal/privacy-policy.md',
  '/legal/terms-of-service.md',
  '/legal/cookie-policy.md',
  '/legal/coppa-compliance.md',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[SW] Failed to cache some assets:', err);
        // Don't fail installation if some assets can't be cached
        return Promise.resolve();
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Determine cache strategy based on request type
  const strategy = getStrategyForRequest(request);

  event.respondWith(
    handleRequest(request, strategy)
  );
});

/**
 * Determine appropriate cache strategy for request
 */
function getStrategyForRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // API calls - Network First (with fallback)
  if (path.includes('/api/') || path.includes('/functions/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Static assets (JS, CSS, images) - Cache First
  if (
    path.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // HTML pages - Network First
  if (request.mode === 'navigate' || path.endsWith('.html')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Legal documents - Cache First (they don't change often)
  if (path.includes('/legal/')) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // Default - Stale While Revalidate
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
}

/**
 * Handle request with specified strategy
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    default:
      return fetch(request);
  }
}

/**
 * Cache First Strategy
 * Try cache first, fall back to network
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok && shouldCacheResponse(networkResponse)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return createOfflineResponse();
  }
}

/**
 * Network First Strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok && shouldCacheResponse(networkResponse)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflineResponse();
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok && shouldCacheResponse(networkResponse)) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.error('[SW] Background fetch failed:', error);
  });

  return cachedResponse || fetchPromise;
}

/**
 * Validate responses before caching.
 */
function shouldCacheResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const contentLength = response.headers.get('content-length');
  const sizeLimit = 10 * 1024 * 1024;

  if (
    !contentType.includes('text/html') &&
    !contentType.includes('application/json') &&
    !contentType.includes('text/css') &&
    !contentType.includes('application/javascript') &&
    !contentType.includes('image/') &&
    !contentType.includes('font/')
  ) {
    return false;
  }

  if (contentLength && Number(contentLength) > sizeLimit) {
    return false;
  }

  return true;
}

/**
 * Create offline fallback response
 */
function createOfflineResponse() {
  return caches.match('/offline.html').then((cached) => {
    if (cached) {
      return cached;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  });
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

/**
 * Sync offline data when connection is restored
 */
async function syncOfflineData() {
  try {
    // TODO: Implement actual offline data sync logic
    console.log('[SW] Syncing offline data...');
    
    // Get pending offline actions from IndexedDB
    // Send to server
    // Clear local queue on success
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error;
  }
}

// Push notification handling (for future implementation)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Service worker loaded, version:', CACHE_VERSION);
