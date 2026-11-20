/* ============================================================
   İnternetsiz çalışma (service worker)

   İnternet varsa her dosya önce internetten alınır, böylece
   yeni dersler hemen görünür. İnternet yoksa telefona kaydedilmiş
   son hali açılır.
   ============================================================ */

var ONBELLEK = 'risale-v3';
var TEMEL = [
  './', 'index.html', 'css/stil.css', 'js/risale.js', 'js/sekiller.js', 'js/pekistir.js', 'js/ses.js', 'ses/liste.js', 'dersler/liste.js', 'dersler/lugat.js',
  'manifest.webmanifest', 'ikon/ikon-192.png',
  'fonts/literata-latin-wght-normal.woff2', 'fonts/literata-latin-ext-wght-normal.woff2',
  'fonts/figtree-latin-wght-normal.woff2', 'fonts/figtree-latin-ext-wght-normal.woff2',
  'fonts/amiri-arabic-400-normal.woff2',
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(ONBELLEK).then(function (c) { return c.addAll(TEMEL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (adlar) {
    return Promise.all(adlar.filter(function (a) { return a !== ONBELLEK; }).map(function (a) { return caches.delete(a); }));
  }).then(function () { return self.clients.claim(); }));
});

// Sayfa, ders dosyalarının listesini gönderir; onları da kaydet
self.addEventListener('message', function (e) {
  if (e.data && e.data.kaydet) e.waitUntil(caches.open(ONBELLEK).then(function (c) { return c.addAll(e.data.kaydet); }).catch(function () {}));
});

self.addEventListener('fetch', function (e) {
  var istek = e.request;
  if (istek.method !== 'GET' || new URL(istek.url).origin !== location.origin) return;
  // Ses kayıtları büyük ve parça parça (Range) istenir; önbelleğe alınmaz, tarayıcı kendisi getirir
  if (/\.mp3$/i.test(new URL(istek.url).pathname) || istek.headers.has('range')) return;
  e.respondWith(
    fetch(istek).then(function (cevap) {
      if (cevap.ok) { var kopya = cevap.clone(); caches.open(ONBELLEK).then(function (c) { c.put(istek, kopya); }); }
      return cevap;
    }).catch(function () {
      return caches.match(istek, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});
