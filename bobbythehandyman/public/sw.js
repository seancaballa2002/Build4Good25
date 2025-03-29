// This is a minimal service worker file
// It's empty but prevents 404 errors when the browser requests it

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Empty fetch handler to intercept requests
}); 