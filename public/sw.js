// Service Worker for Pulse App
const CACHE_VERSION = 'v1';
const BASE_CACHE_NAME = 'pulse-app-cache';

// Get the workspace name from the hostname
function getWorkspaceFromHostname() {
  const hostname = self.location.hostname;
  const subdomain = hostname.split('.')[0];

  // If it's a workspace subdomain (not localhost, www, or main domain)
  if (hostname !== 'localhost' && subdomain !== 'www' && subdomain !== 'pulse-app') {
    return subdomain;
  }

  return 'main';
}

// Generate a workspace-specific cache name
function getCacheName() {
  const workspace = getWorkspaceFromHostname();
  return `${BASE_CACHE_NAME}-${workspace}-${CACHE_VERSION}`;
}

// Resources to cache on install
const PRECACHE_RESOURCES = [
  '/',
  '/offline',
  '/favicon.ico',
  '/manifest.json',
  '/icons/manifest-icon-192.maskable.png',
  '/icons/manifest-icon-512.maskable.png',
];

// Add workspace-specific resources if we're on a workspace subdomain
function getResourcesForWorkspace() {
  const workspace = getWorkspaceFromHostname();
  const resources = [...PRECACHE_RESOURCES];

  // If we're on a specific workspace, add workspace-specific routes
  if (workspace !== 'main') {
    resources.push(`/${workspace}`);
    resources.push(`/${workspace}/projects`);
    resources.push(`/${workspace}/leads`);
    resources.push(`/${workspace}/invoices`);
    resources.push(`/api/manifest/${workspace}`);
  }

  return resources;
}

// Install event - precache resources
self.addEventListener('install', (event) => {
  const CACHE_NAME = getCacheName();
  const resources = getResourcesForWorkspace();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(resources);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const CACHE_NAME = getCacheName();

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Keep the current workspace cache and delete others
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const CACHE_NAME = getCacheName();

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request, CACHE_NAME));
    return;
  }

  // For all other requests
  event.respondWith(cacheFirst(event.request, CACHE_NAME));
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // If offline and resource not cached, return offline page
    return caches.match('/offline');
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cached response, return offline response
    return new Response(
      JSON.stringify({
        error: 'You are offline and there is no cached data available.',
        workspace: getWorkspaceFromHostname(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
