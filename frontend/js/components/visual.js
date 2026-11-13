// Visual konkret (fitur F4): garis waktu kelipatan dan pohon faktor.

import { daftarKelipatan, formatFaktorisasi, faktorisasi, kpk, prima } from '../kpk.js';
import { h, svg } from '../ui.js';

/**
 * Garis waktu: satu baris titik per bilangan, pada setiap kelipatannya sampai `batas`.
 * Titik yang dimiliki semua baris disorot; yang pertama (KPK) disorot paling kuat.
 */
export function garisWaktu(bilangan, batas = null, { satuan = '' } = {}) {
  const k = kpk(...bilangan);
  batas = batas || Math.min(k * 2, Math.max(...bilangan) * 12);
  // Lebar viewBox ~ lebar layar HP agar teks tidak mengecil.
  const kiri = 40;
  const lebar = 340;
  const tinggiBaris = 40;
  const tinggi = bilangan.length * tinggiBaris + 36;
  const x = (v) => kiri + ((lebar - kiri - 16) * v) / batas;
  const persekutuan = (v) => bilangan.every((b) => v % b === 0);

  const anak = [];
  bilangan.forEach((b, r) => {
    const y = 22 + r * tinggiBaris;
    anak.push(svg('text', { x: 2, y: y + 5, class: 'label', 'font-size': 14 }, `×${b}`));
    anak.push(svg('line', { x1: kiri, y1: y, x2: lebar - 8, y2: y, class: 'sumbu', 'stroke-width': 2 }));
    for (const v of daftarKelipatan(b, Math.floor(batas / b))) {
      const temu = persekutuan(v);
      anak.push(
        svg('circle', {
          cx: x(v),
          cy: y,
          r: temu ? 7 : 4.5,
          class: temu ? (v === k ? 'temu-pertama' : 'temu') : `titik titik-${r % 3}`,
        }),
      );
    }
  });
  // label bilangan pada titik temu
  const yBawah = 22 + bilangan.length * tinggiBaris - 6;
  for (let v = k; v <= batas; v += k) {
    anak.push(svg('text', { x: x(v), y: yBawah, 'text-anchor': 'middle', 'font-size': 13, class: v === k ? 'label' : '' }, String(v)));
  }
  const deskripsi = bilangan.map((b) => `kelipatan ${b}: ${daftarKelipatan(b, Math.min(6, Math.floor(batas / b))).join(', ')}`).join('; ');
  return svg(
    'svg',
    {
      class: 'garis-waktu',
      viewBox: `0 0 ${lebar} ${tinggi}`,
      role: 'img',
      'aria-label': `Garis waktu ${deskripsi}. Pertama kali bertemu di ${k}${satuan ? ` ${satuan}` : ''}.`,
    },
    anak,
  );
}

/**
 * Pohon faktor. interaktif = siswa mengetuk bilangan komposit untuk membaginya dengan
 * faktor prima terkecil. Bilangan prima berubah menjadi lingkaran hijau.
 */
export function pohonFaktor(n, { interaktif = true, onSelesai = () => {} } = {}) {
  // Setiap baris: daftar prima yang sudah lepas + sisa bilangan komposit.
  let prim = [];
  let sisa = n;
  const wadah = h('div', { class: 'pohon', 'aria-live': 'polite' });

  const gambar = () => {
    const baris = [];
    let p = [];
    let s = n;
    baris.push({ prim: [], sisa: n });
    while (p.length < prim.length) {
      const f = prim[p.length];
      p = [...p, f];
      s /= f;
      baris.push({ prim: p, sisa: s });
    }
    wadah.replaceChildren(
      ...baris.map((b, i) => {
        const akhir = i === baris.length - 1;
        const isi = [];
        b.prim.forEach((f) => isi.push(h('span', { class: 'simpul prima' }, String(f)), h('span', { 'aria-hidden': 'true' }, '×')));
        if (b.sisa === 1) isi.pop();
        else if (prima(b.sisa)) isi.push(h('span', { class: 'simpul prima' }, String(b.sisa)));
        else if (akhir && interaktif) {
          isi.push(h('button', { type: 'button', class: 'simpul', 'aria-label': `Faktorkan ${b.sisa}`, onclick: pecah }, String(b.sisa)));
        } else isi.push(h('span', { class: 'simpul' }, String(b.sisa)));
        return h('div', { class: 'pohon-baris' }, isi);
      }),
    );
    if (sisa === 1 || prima(sisa)) {
      wadah.append(h('p', { class: 'tengah' }, h('strong', {}, `${n} = ${formatFaktorisasi(faktorisasi(n))}`)));
      onSelesai();
    } else if (interaktif) {
      wadah.append(h('p', { class: 'kecil muted tengah' }, `Ketuk ${sisa} untuk membaginya dengan bilangan prima terkecil.`));
    }
  };

  function pecah() {
    const f = Number(Object.keys(faktorisasi(sisa))[0]);
    prim = [...prim, f];
    sisa /= f;
    gambar();
  }

  if (!interaktif) {
    while (sisa > 1 && !prima(sisa)) {
      const f = Number(Object.keys(faktorisasi(sisa))[0]);
      prim.push(f);
      sisa /= f;
    }
  }
  gambar();
  return wadah;
}
