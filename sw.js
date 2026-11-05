/* sw.js ── 離線快取：程式網路優先（上傳新版自動生效），圖片快取優先 */
const VERSION = 'kfps-v1';
const CORE = ['./', './index.html', './css/style.css', './manifest.json', './js/vendor/three.min.js', './js/questions.js', './js/school.js', './js/game.js', './assets/sky-taipei.jpg', './assets/icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
  if (/\.(jpg|png|webp|woff2?)$/i.test(url.pathname) || url.hostname.includes('gstatic')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return res; })));
  } else {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return res; }).catch(() => caches.match(req).then(h => h || caches.match('./index.html'))));
  }
});
