// Catatan digital (fitur F6): ringkasan cara KPK + catatan pribadi siswa.

import { catatLog } from '../api.js';
import { bacaSaya, tulisSaya } from '../store.js';
import { h } from '../ui.js';

export function ringkasanKpk() {
  return h(
    'div',
    {},
    h('div', { class: 'kartu' },
      h('h3', {}, 'KPK itu apa?'),
      h('p', {}, 'KPK = Kelipatan Persekutuan Terkecil: bilangan PALING KECIL yang merupakan kelipatan dari semua bilangan.'),
      h('p', { class: 'muted kecil' }, 'Contoh: KPK(4, 6) = 12, karena 12 adalah bilangan terkecil yang ada di daftar kelipatan 4 dan kelipatan 6.'),
    ),
    h('div', { class: 'kartu' },
      h('h3', {}, 'Cara 1 — Daftar kelipatan'),
      h('p', { class: 'kecil' }, 'Cocok untuk bilangan kecil.'),
      h('ol', {},
        h('li', {}, 'Tulis kelipatan bilangan pertama: 4, 8, 12, 16, …'),
        h('li', {}, 'Tulis kelipatan bilangan kedua: 6, 12, 18, …'),
        h('li', {}, 'Cari bilangan TERKECIL yang muncul di kedua daftar → 12.'),
      ),
    ),
    h('div', { class: 'kartu' },
      h('h3', {}, 'Cara 2 — Faktorisasi prima'),
      h('p', { class: 'kecil' }, 'Cocok untuk bilangan besar atau tiga bilangan.'),
      h('ol', {},
        h('li', {}, 'Faktorkan setiap bilangan: 12 = 2² × 3, 18 = 2 × 3².'),
        h('li', {}, 'Ambil SEMUA faktor prima yang muncul: 2 dan 3.'),
        h('li', {}, 'Pilih pangkat TERTINGGI dari tiap faktor: 2² dan 3².'),
        h('li', {}, 'Kalikan: 2² × 3² = 4 × 9 = 36.'),
      ),
    ),
    h('div', { class: 'kartu' },
      h('h3', {}, 'KPK atau FPB?'),
      h('p', {}, h('strong', {}, 'KPK'), ': "bersamaan lagi", "serentak", "sama tinggi", "bertemu lagi" → mencari kelipatan.'),
      h('p', {}, h('strong', {}, 'FPB'), ': "dibagi sama banyak", "sebanyak-banyaknya", "sepanjang mungkin" → mencari pembagi.'),
    ),
    h('div', { class: 'kartu' },
      h('h3', {}, 'Cek jawabanmu sendiri'),
      h('ul', {},
        h('li', {}, 'KPK harus habis dibagi SETIAP bilangan.'),
        h('li', {}, 'KPK tidak mungkin lebih kecil dari bilangan terbesar.'),
        h('li', {}, 'KPK tidak lebih besar dari hasil kali bilangannya. Hasil kali belum tentu KPK: 8 × 12 = 96, padahal KPK(8, 12) = 24.'),
      ),
    ),
  );
}

export function catatanPribadi() {
  const ta = h('textarea', {
    class: 'input',
    rows: 6,
    placeholder: 'Tulis hal yang ingin kamu ingat, misalnya langkah yang sering terlupa…',
    'aria-label': 'Catatanku',
  });
  ta.value = bacaSaya('catatan', '');
  let timer;
  const status = h('span', { class: 'kecil muted', 'aria-live': 'polite' });
  ta.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      tulisSaya('catatan', ta.value);
      status.textContent = 'Tersimpan di HP ini.';
    }, 400);
  });
  return h('div', { class: 'kartu' }, h('h3', {}, 'Catatanku'), ta, status);
}

/** Panel catatan yang terbuka dari bawah di layar latihan/tes, tanpa meninggalkan soal. */
export function bukaPanelCatatan(asal) {
  catatLog('buka_catatan', { asal });
  const sebelumnya = document.activeElement;
  const tutup = () => {
    panel.remove();
    document.removeEventListener('keydown', esc);
    sebelumnya?.focus?.();
  };
  const esc = (e) => e.key === 'Escape' && tutup();
  const tombolTutup = h('button', { type: 'button', class: 'tombol kecil', onclick: tutup }, 'Tutup');
  const panel = h(
    'div',
    { class: 'panel-catatan', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Catatan', onclick: (e) => e.target === panel && tutup() },
    h('div', { class: 'lembar' }, h('div', { class: 'kepala-lembar' }, h('h2', { style: { margin: 0 } }, '📒 Catatan'), tombolTutup), ringkasanKpk(), catatanPribadi()),
  );
  document.addEventListener('keydown', esc);
  document.body.append(panel);
  tombolTutup.focus();
}
