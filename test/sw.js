// Offline-Speicher der Machbarkeitsprobe. Bei jeder neuen Fassung die Nummer erhöhen.
const FASSUNG = 'probe-v3';
const DATEIEN = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(FASSUNG).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== FASSUNG).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Erst Netz (damit neue Fassungen sofort ankommen), ohne Netz aus dem Speicher.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((antwort) => {
        const kopie = antwort.clone();
        caches.open(FASSUNG).then((c) => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
