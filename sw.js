const CACHE_NAME = 'er-reader-20260610120000';

// ベースパスを動的に取得（GitHub Pagesのサブパスに対応）
const BASE = self.registration.scope;

const CDN_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

// インストール時にCDNリソースのみキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CDN_ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ローカルファイル: network-first（常に最新を取得、失敗時のみキャッシュ）
// CDNリソース: cache-first（高速・オフライン対応）
self.addEventListener('fetch', event => {
  const url = event.request.url;
  const isCDN = url.startsWith('https://unpkg.com');

  if (isCDN) {
    // CDN: キャッシュ優先
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  } else {
    // ローカルファイル: ネットワーク優先（localStorageを守る）
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // オフライン時のみキャッシュから返す
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match(BASE + 'index.html');
          }
        });
      })
    );
  }
});
