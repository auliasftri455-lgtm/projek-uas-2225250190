import { api, jumlahAntrean, kirimAntrean } from '../api.js';
import { atur, pergi } from '../layout.js';
import { baca, bacaSaya, hapus } from '../store.js';
import { h } from '../ui.js';

const menu = (href, ikon, judul, keterangan) =>
  h('a', { class: 'kartu kartu-menu', href }, h('span', { class: 'ikon', 'aria-hidden': 'true' }, ikon), h('div', {}, h('h3', {}, judul), h('p', {}, keterangan)));

export function viewBeranda() {
  const saya = baca('saya');
  const keluar = h('button', {
    type: 'button',
    class: 'tombol kecil',
    onclick: async () => {
      await kirimAntrean();
      try {
        await api('/keluar', { method: 'POST' });
      } catch {
        /* tetap keluar di perangkat ini */
      }
      hapus('saya');
      pergi('#/masuk');
    },
  }, 'Keluar');
  atur({ judul: 'Beranda', rute: 'beranda', aksi: keluar });

  const diag = bacaSaya('diagnostik');
  const antre = jumlahAntrean();

  let saran = null;
  if (!diag) {
    saran = h('a', { class: 'kartu kartu-menu', href: '#/diagnostik', style: { borderColor: 'var(--primary)' } },
      h('span', { class: 'ikon', 'aria-hidden': 'true' }, '🧭'),
      h('div', {}, h('h3', {}, 'Mulai dari sini: cek kesiapan'), h('p', {}, '9 pertanyaan singkat tentang kelipatan, faktor, dan bilangan prima.')));
  } else if (diag.saran) {
    saran = h('div', { class: 'kartu' }, h('h3', {}, 'Saran untukmu'), h('p', {}, diag.saran.teks), h('a', { class: 'tombol utama', href: diag.saran.href }, diag.saran.label));
  }

  return h(
    'div',
    {},
    h('h2', {}, `Halo, ${saya.nama}! 👋`),
    h('p', { class: 'muted' }, saya.kelas ? `Kelas ${saya.kelas} · Kode ${saya.kode_siswa}` : ''),
    antre ? h('p', { class: 'status-sinkron' }, `⏳ ${antre} data belum terkirim. Akan dikirim otomatis saat ada internet.`) : null,
    saran,
    menu('#/belajar', '📖', 'Belajar KPK', 'Contoh bertahap dengan gambar.'),
    menu('#/latihan', '🎯', 'Latihan bertingkat', 'Level 1–5, ada petunjuk bila perlu.'),
    menu('#/tes', '📝', 'Tes kemampuan', '4 soal cerita, dikerjakan per langkah.'),
    menu('#/catatan', '📒', 'Catatan', 'Ringkasan cara KPK dan catatanmu.'),
    menu('#/progres', '📊', 'Progresku', 'Bintang latihan dan hasil tes.'),
  );
}
