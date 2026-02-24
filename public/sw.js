self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener('fetch', (event) => {
  // No caching - pass-through mode only
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Network error', { status: 500 });
    })
  );
});
