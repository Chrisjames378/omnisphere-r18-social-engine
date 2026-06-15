const CACHE_NAME = "omnisphere-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/manifest.json"
];

// Install event: cache initial shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline shell assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing outdated cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: zero-telemetry local cache interceptor
self.addEventListener("fetch", (event) => {
  // Only handle GET requests and exclude Supabase PostgREST API requests
  if (event.request.method !== "GET" || event.request.url.includes("/rest/v1/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache, fetch network in background to update (Stale While Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            /* Ignore offline network failures */
          });
        return cachedResponse;
      }

      // Serve from network, caching files dynamically for assets
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If offline and request is HTML, return cached index
          if (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }
        });
    })
  );
});
