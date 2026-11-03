/* Open Map Surface service worker.
   Caches the app shell (page, vendored libraries, icons) so the installed app opens offline.
   Map tiles and place search are never cached: they stay live and follow each provider's usage policy. */
const VERSION = 'oms-v11';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './vendor/leaflet/leaflet.min.js', './vendor/leaflet/leaflet.min.css',
  './vendor/leaflet/images/marker-icon.png', './vendor/leaflet/images/marker-icon-2x.png', './vendor/leaflet/images/marker-shadow.png',
  './vendor/leaflet/images/layers.png', './vendor/leaflet/images/layers-2x.png',
  './vendor/geoman/leaflet-geoman.min.js', './vendor/geoman/leaflet-geoman.css',
  './vendor/markercluster/leaflet.markercluster.js', './vendor/markercluster/MarkerCluster.css',
  './vendor/turf/turf.min.js', './vendor/lz-string/lz-string.min.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // tiles, search: straight to the network, never cached
  if (req.mode === 'navigate'){                               // the page itself: network first, cached shell when offline
    // cache:'no-cache' revalidates with the server (ETag) instead of trusting the host's max-age, so a new deploy shows on the next open
    e.respondWith(fetch(req, { cache:'no-cache' }).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch:true }).then(hit => hit || fetch(req).then(r => {  // shell assets: cache first
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  })));
});
