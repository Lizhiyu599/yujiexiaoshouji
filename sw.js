// 玉界机 · Service Worker
// 版本号 - 更新缓存时修改此值
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `jade-machine-${CACHE_VERSION}`;

// 需要预缓存的核心资源
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// 安装事件 - 预缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 预缓存核心资源');
        return cache.addAll(PRE_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] 安装完成，跳过等待');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] 预缓存失败:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // 删除不属于当前版本的缓存
              return cacheName.startsWith('jade-machine-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] 激活完成，立即接管所有页面');
        return self.clients.claim();
      })
  );
});

// 请求拦截 - Cache First 策略
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;
  
  // 跳过 chrome-extension 等非 http/https 请求
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 命中缓存：直接返回
        if (cachedResponse) {
          return cachedResponse;
        }

        // 未命中缓存：发起网络请求
        return fetch(event.request)
          .then((networkResponse) => {
            // 只缓存成功的响应
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // 动态缓存（仅缓存同源资源或允许跨域的资源）
            const networkUrl = new URL(event.request.url);
            const isSameOrigin = networkUrl.origin === self.location.origin;
            const isAsset = /\.(html|css|js|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|json)$/i.test(networkUrl.pathname);
            
            if (isSameOrigin || isAsset) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  console.warn('[SW] 动态缓存失败:', error);
                });
            }

            return networkResponse;
          })
          .catch((error) => {
            console.warn('[SW] 网络请求失败，尝试返回离线页面:', error);
            
            // 如果是导航请求（HTML页面），返回缓存的 index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // 其他资源返回离线提示
            return new Response('离线状态，请连接网络后重试', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
              })
            });
          });
      })
  );
});

// 消息事件 - 允许页面控制更新
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // 检查更新
    self.registration.update();
  }
});
