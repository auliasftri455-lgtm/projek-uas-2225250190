// Komponen tampilan dasar (docs/03-DESAIN.md bagian 4.3).

import { h, tombol } from '../ui.js';

/** Memecah teks menjadi node, menandai potongan `sorotan` dengan <mark> (signaling). */
export function teksBersorot(teks, sorotan = []) {
  const potong = [];
  for (const s of sorotan) {
    const i = teks.indexOf(s.teks);
    if (i >= 0) potong.push({ i, j: i + s.teks.length, warna: s.warna || 'a' });
  }
  potong.sort((a, b) => a.i - b.i);
  const hasil = [];
  let posisi = 0;
  for (const p of potong) {
    if (p.i < posisi) continue; // abaikan sorotan yang bertumpuk
    hasil.push(teks.slice(posisi, p.i));
    hasil.push(h('mark', { class: `hl hl-${p.warna}` }, teks.slice(p.i, p.j)));
    posisi = p.j;
  }
  hasil.push(teks.slice(posisi));
  return hasil;
}

/** Soal cerita yang selalu ada di atas layar langkah dan dapat dilipat (menghindari split-attention). */
export function kartuSoal({ judul = 'Soal', teks, sorotan = [], terbuka = true }) {
  return h(
    'details',
    { class: 'kartu-soal', open: terbuka },
    h('summary', {}, judul),
    h('div', { class: 'isi-soal' }, teksBersorot(teks, sorotan)),
  );
}

/** Daftar langkah yang sudah selesai, agar siswa tidak perlu mengingatnya. */
export function ringkasanLangkah(item, judul = 'Sudah dikerjakan') {
  // Kembalikan node kosong (bukan null): replaceChildren(null) akan menampilkan teks "null".
  if (!item.length) return document.createDocumentFragment();
  return h(
    'ul',
    { class: 'ringkasan', 'aria-label': judul },
    h('li', { class: 'judul-ringkasan' }, judul),
    item.map((it) => h('li', {}, it.ok ? '✓ ' : '• ', it.teks)),
  );
}

export function posisiLangkah(teksKiri, teksKanan, rasio) {
  return [
    h('div', { class: 'posisi' }, h('span', {}, teksKiri), h('span', {}, teksKanan || '')),
    h(
      'div',
      { class: 'bilah', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(rasio * 100) },
      h('span', { style: { width: `${Math.round(rasio * 100)}%` } }),
    ),
  ];
}

/** Wadah umpan balik. Panggil .tampil({benar, pesan}) atau .kosongkan(). */
export function pitaUmpanBalik() {
  const el = h('div', { 'aria-live': 'polite' });
  return {
    el,
    tampil({ benar, pesan }) {
      el.replaceChildren(
        h(
          'div',
          { class: `pita ${benar ? 'benar' : 'salah'}` },
          h('span', { class: 'ikon', 'aria-hidden': 'true' }, benar ? '✓' : '!'),
          h('span', {}, h('span', { class: 'sr-only' }, benar ? 'Benar. ' : 'Belum tepat. '), pesan),
        ),
      );
    },
    kosongkan() {
      el.replaceChildren();
    },
  };
}

/**
 * Petunjuk bertahap: 1 = arah, 2 = langkah, 3 = contoh sejenis. Petunjuk boleh berupa teks
 * atau fungsi yang mengembalikan elemen (misalnya garis waktu).
 */
export function tombolPetunjuk(daftar = [], onPakai = () => {}) {
  let terpakai = 0;
  const ol = h('ol');
  const btn = tombol('💡 Petunjuk', () => {
    if (terpakai >= daftar.length) return;
    const p = daftar[terpakai];
    ol.append(h('li', {}, typeof p === 'function' ? p() : p));
    terpakai += 1;
    onPakai(terpakai);
    btn.textContent = terpakai < daftar.length ? `💡 Petunjuk lagi (${terpakai}/${daftar.length})` : '💡 Semua petunjuk sudah dibuka';
    btn.disabled = terpakai >= daftar.length;
  }, { varian: 'kecil' });
  if (!daftar.length) btn.hidden = true;
  return {
    tombol: btn,
    daftar: h('div', { class: 'petunjuk' }, ol),
    get terpakai() {
      return terpakai;
    },
  };
}

/** Skala usaha mental Paas (1–9), untuk mengukur beban kognitif yang dirasakan. */
export function skalaBeban(onPilih) {
  const tombolTombol = [];
  const wadah = h('div', { class: 'skala', role: 'group', 'aria-label': 'Skala usaha mental 1 sampai 9' });
  for (let i = 1; i <= 9; i++) {
    const b = h('button', {
      type: 'button',
      'aria-pressed': 'false',
      onclick: () => {
        tombolTombol.forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
        onPilih(i);
      },
    }, String(i));
    tombolTombol.push(b);
    wadah.append(b);
  }
  return h(
    'div',
    { class: 'kartu' },
    h('h3', {}, 'Seberapa besar usaha pikiranmu tadi?'),
    h('p', { class: 'kecil muted' }, '1 = sangat ringan, 9 = sangat berat'),
    wadah,
  );
}

export function bilahSkor(label, nilai, maks) {
  return h(
    'div',
    { class: 'bilah-skor' },
    h('span', {}, label),
    h('strong', { class: 'angka' }, `${nilai}/${maks}`),
    h('div', { class: 'bilah' }, h('span', { style: { width: `${maks ? (nilai / maks) * 100 : 0}%` } })),
  );
}
