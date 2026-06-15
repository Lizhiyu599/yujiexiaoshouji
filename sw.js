// 玉界机 · Service Worker
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `jade-machine-${CACHE_VERSION}`;

const PRE_CACHE_URLS = [
  '/yujiexiaoshouji/',
  '/yujiexiaoshouji/index.html',
  '/yujiexiaoshouji/manifest.json',
  '/yujiexiaoshouji/assets/icons/icon-192.png',
  '/yujiexiaoshouji/assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRE_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('jade-machine-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/yujiexiaoshouji/index.html');
            }
            return new Response('离线');
          });
      })
  );
});
