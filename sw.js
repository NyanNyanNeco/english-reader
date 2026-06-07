const CACHE_NAME = 'er-reader-20250608120000';

// ベースパスを動的に取得（GitHub Pagesのサブパスに対応）
const BASE = self.registration.scope;

const LOCAL_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
];

const CDN_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all([
        // ローカルはネットワークから取得してキャッシュ
        Promise.all(LOCAL_ASSETS.map(url =>
          fetch(url, { cache: 'no-cache' })
            .then(res => cache.put(url, res))
            .catch(() => {})
        )),
        // CDNはキャッシュに追加
        cache.addAll(CDN_ASSETS).catch(() => {}),
      ])
    )
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

// フェッチ戦略：
//   ローカルファイル → ネットワーク優先（最新を取得、失敗時はキャッシュ）
//   CDNファイル     → キャッシュ優先（オフライン対応）
self.addEventListener('fetch', event => {
  const url = event.request.url;
  const isLocal = url.startsWith(BASE) || url.includes('index.html') || url.includes('manifest.json');
  const isCDN = url.includes('unpkg.com') || url.includes('cdnjs.cloudflare.com');

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
  } else if (isLocal) {
    // ローカル: ネットワーク優先（常に最新を取得）
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return caches.match(BASE + 'index.html');
            }
          });
        })
    );
  } else {
    // その他: キャッシュ優先
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).catch(() => {});
      })
    );
  }
});
