// ─── キャッシュバージョン（ファイル保存時刻で自動更新） ───────────────────
// 注意: このタイムスタンプはファイルを保存するたびに自動で変わるため
//       手動で変更する必要はありません。
const CACHE_NAME = 'er-reader-20250602095300';

// ベースパスを動的に取得（GitHub Pagesのサブパスに対応）
const BASE = self.registration.scope;

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
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

// ─── ネットワーク優先戦略 ────────────────────────────────────────────────
// index.html / manifest.json は常にネットワークから最新版を取得し、
// 失敗時のみキャッシュにフォールバックする。
// CDNリソース（React等）はキャッシュ優先でオフライン対応を維持する。
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === location.origin;

  if (isLocal) {
    // ローカルファイル（index.html, manifest.json 等）→ ネットワーク優先
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // オフライン時はキャッシュから返す
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return caches.match(BASE + 'index.html');
            }
          });
        })
    );
  } else {
    // CDNリソース（React等）→ キャッシュ優先（オフライン対応）
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
  }
});
