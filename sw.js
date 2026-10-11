// Offline support is switched off while the home-screen icon problem is investigated.
// This version removes itself and its caches from any phone that still has the old one.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.registration.unregister()));
});
