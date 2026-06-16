// 极其纯净的无脑转发：不做任何拦截，不做任何缓存，全部直接走网络
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// 所有 fetch 请求全都不拦截，原样传给浏览器
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
