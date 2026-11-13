// Router hash sederhana: #/beranda, #/latihan/2, #/guru/kelas/5, ...

import { api, kirimAntrean } from './api.js';
import { atur, pergi } from './layout.js';
import { baca, hapus, tulis } from './store.js';
import { h, pesanGalat } from './ui.js';
import { viewBelajar } from './views/belajar.js';
import { viewBeranda } from './views/beranda.js';
import { viewCatatan } from './views/catatan.js';
import { viewDiagnostik } from './views/diagnostik.js';
import { viewGuru, viewGuruKelas } from './views/guru.js';
import { viewLatihan, viewLatihanLevel } from './views/latihan.js';
import { viewMasuk } from './views/masuk.js';
import { viewProgres } from './views/progres.js';
import { viewTes, viewTesKerjakan } from './views/tes.js';

const RUTE = [
  [/^#\/masuk$/, viewMasuk, null],
  [/^#\/beranda$/, viewBeranda, 'siswa'],
  [/^#\/diagnostik$/, viewDiagnostik, 'siswa'],
  [/^#\/belajar(?:\/(\d+))?$/, viewBelajar, 'siswa'],
  [/^#\/latihan$/, viewLatihan, 'siswa'],
  [/^#\/latihan\/([1-5])$/, viewLatihanLevel, 'siswa'],
  [/^#\/tes$/, viewTes, 'siswa'],
  [/^#\/tes\/kerjakan$/, viewTesKerjakan, 'siswa'],
  [/^#\/catatan$/, viewCatatan, 'siswa'],
  [/^#\/progres$/, viewProgres, 'siswa'],
  [/^#\/guru$/, viewGuru, 'guru'],
  [/^#\/guru\/kelas\/(\d+)$/, viewGuruKelas, 'guru'],
];

const app = document.getElementById('app');
let nomorRender = 0;

function ruteAwal() {
  const saya = baca('saya');
  if (!saya) return '#/masuk';
  return saya.peran === 'guru' ? '#/guru' : '#/beranda';
}

async function tampilkan() {
  const nomor = ++nomorRender;
  const hash = location.hash || ruteAwal();
  const saya = baca('saya');
  const cocok = RUTE.map(([re, view, peran]) => [hash.match(re), view, peran]).find(([m]) => m);
  if (!cocok) return pergi(ruteAwal());
  const [m, view, peran] = cocok;
  if (peran && saya?.peran !== peran) return pergi(saya ? ruteAwal() : '#/masuk');
  if (!peran && saya) return pergi(ruteAwal());

  try {
    const el = await view(...m.slice(1));
    if (nomor !== nomorRender) return; // pengguna sudah pindah halaman
    app.replaceChildren(el);
  } catch (e) {
    console.error(e);
    if (nomor !== nomorRender) return;
    if (e.status === 401) {
      hapus('saya');
      return pergi('#/masuk');
    }
    atur({ judul: 'Ada masalah', kembali: ruteAwal(), nav: false });
    app.replaceChildren(h('div', {}, pesanGalat(e.message || 'Terjadi kesalahan.'), h('a', { class: 'tombol', href: ruteAwal() }, 'Kembali ke awal')));
  }
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

async function mulai() {
  // Segarkan status masuk bila online; bila offline, pakai data lokal.
  if (baca('saya')) {
    try {
      tulis('saya', await api('/saya'));
    } catch (e) {
      if (e.status === 401) hapus('saya');
    }
  }
  window.addEventListener('hashchange', tampilkan);
  await tampilkan();
  kirimAntrean();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

mulai();
