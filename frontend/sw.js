// Service worker: aplikasi tetap bisa dibuka tanpa internet (docs/04-ARSITEKTUR.md bagian 8).
// Naikkan VERSI setiap kali berkas frontend berubah agar HP siswa mengambil versi baru.

const VERSI = 'kpk-v3';
const CANGKANG = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/ikon.svg',
  '/css/tokens.css',
  '/css/app.css',
  '/js/main.js',
  '/js/api.js',
  '/js/kpk.js',
  '/js/latihan-gen.js',
  '/js/layout.js',
  '/js/pemeriksa.js',
  '/js/store.js',
  '/js/ui.js',
  '/js/components/catatan.js',
  '/js/components/isian.js',
  '/js/components/komponen.js',
  '/js/components/visual.js',
  '/js/views/belajar.js',
  '/js/views/beranda.js',
  '/js/views/catatan.js',
  '/js/views/diagnostik.js',
  '/js/views/guru.js',
  '/js/views/latihan.js',
  '/js/views/masuk.js',
  '/js/views/progres.js',
  '/js/views/tes.js',
  '/api/soal/diagnostik',
  '/api/soal/latihan',
  '/api/soal/tes',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSI).then((c) => c.addAll(CANGKANG)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((kunci) => Promise.all(kunci.filter((k) => k !== VERSI).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Jaringan dulu (agar siswa selalu mendapat versi terbaru), cache bila offline atau
// jaringan terlalu lambat (> 3 detik). Hasil jaringan yang terlambat tetap memperbarui cache.
async function jaringanDulu(req, batasMs = 3000) {
  const cache = await caches.open(VERSI);
  const dariJaringan = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  });
  const habisWaktu = new Promise((r) => setTimeout(r, batasMs, null));
  try {
    const res = await Promise.race([dariJaringan, habisWaktu]);
    if (res) return res;
  } catch {
    /* offline */
  }
  const lama = await cache.match(req, { ignoreSearch: true });
  return lama || dariJaringan.catch(() => Response.error());
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/soal/')) return e.respondWith(jaringanDulu(e.request));
  if (url.pathname.startsWith('/api/')) return; // data pribadi: selalu lewat jaringan
  if (e.request.mode === 'navigate') {
    return e.respondWith(fetch(e.request).catch(() => caches.match('/index.html')));
  }
  e.respondWith(jaringanDulu(e.request));
});
