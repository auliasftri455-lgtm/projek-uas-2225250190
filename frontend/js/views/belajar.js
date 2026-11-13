// Materi KPK (fitur F1, F2, F4): contoh lengkap -> contoh rumpang -> cek kewajaran.
// Satu konsep per halaman.

import { isianAngka, isianPangkat, pilihanGanda } from '../components/isian.js';
import { kartuSoal, pitaUmpanBalik, posisiLangkah } from '../components/komponen.js';
import { garisWaktu, pohonFaktor } from '../components/visual.js';
import { atur, pergi } from '../layout.js';
import { periksaFaktorisasi, periksaKpk, periksaPilihan } from '../pemeriksa.js';
import { bacaSaya, tulisSaya } from '../store.js';
import { h, tombol } from '../ui.js';

/** p('teks', ...) atau p({ class: '...' }, 'teks', ...) */
const p = (...isi) =>
  isi[0] && typeof isi[0] === 'object' && !(isi[0] instanceof Node) ? h('p', isi[0], ...isi.slice(1)) : h('p', {}, ...isi);
const b = (teks) => h('strong', {}, teks);

/** Latihan kecil di dalam materi: isian + tombol Periksa + pita umpan balik. */
function cobaKecil(isian, periksa) {
  const pita = pitaUmpanBalik();
  return h('div', { class: 'kartu' }, isian.el, tombol('Periksa', () => pita.tampil(periksa(isian.nilai())), { varian: 'utama' }), pita.el);
}

const HALAMAN = [
  {
    judul: 'Apa itu kelipatan?',
    isi: () => [
      p('Kelipatan suatu bilangan didapat dengan mengalikan bilangan itu dengan 1, 2, 3, dan seterusnya.'),
      h('div', { class: 'kartu' },
        p(b('Kelipatan 4: '), '4 × 1 = 4, 4 × 2 = 8, 4 × 3 = 12, …'),
        p('Jadi kelipatan 4 adalah ', b('4, 8, 12, 16, 20, 24, …')),
        p({}, 'Bayangkan lampu yang menyala setiap 4 detik. Lampu itu menyala pada detik ke-4, 8, 12, dan seterusnya:'),
        garisWaktu([4], 24),
      ),
      p('Perhatikan: setiap titik berjarak sama, yaitu 4.'),
    ],
  },
  {
    judul: 'Kelipatan persekutuan & KPK',
    isi: () => [
      h('div', { class: 'kartu' },
        h('h3', {}, 'Contoh lengkap'),
        p('Lampu merah menyala setiap ', b('4 detik'), ', lampu biru setiap ', b('6 detik'), '. Keduanya menyala bersamaan di detik ke-0. Kapan mereka menyala bersamaan lagi?'),
        garisWaktu([4, 6], 36, { satuan: 'detik' }),
        h('ol', {},
          h('li', {}, 'Kelipatan 4: 4, 8, ', b('12'), ', 16, 20, ', b('24'), ', …'),
          h('li', {}, 'Kelipatan 6: 6, ', b('12'), ', 18, ', b('24'), ', 30, …'),
          h('li', {}, 'Yang ada di kedua daftar (kelipatan persekutuan): 12, 24, 36, …'),
          h('li', {}, 'Yang ', b('paling kecil'), ' adalah 12. Jadi ', b('KPK(4, 6) = 12'), '.'),
        ),
      ),
      p('Titik kuning adalah saat kedua lampu menyala bersamaan. Titik kuning pertama adalah KPK-nya.'),
    ],
  },
  {
    judul: 'Cara faktorisasi prima',
    isi: () => [
      p('Untuk bilangan besar, mendaftar kelipatan terlalu panjang. Gunakan ', b('pohon faktor'), '.'),
      h('div', { class: 'kartu' },
        h('h3', {}, 'Coba: ketuk bilangannya'),
        pohonFaktor(24),
        p({ class: 'kecil muted' }, 'Bilangan prima (lingkaran hijau) tidak bisa dibagi lagi selain oleh 1 dan dirinya sendiri.'),
      ),
      h('div', { class: 'kartu' },
        h('h3', {}, 'Contoh lengkap: KPK(12, 18)'),
        pohonFaktor(12, { interaktif: false }),
        pohonFaktor(18, { interaktif: false }),
        h('ol', {},
          h('li', {}, '12 = 2² × 3 dan 18 = 2 × 3²'),
          h('li', {}, 'Faktor prima yang muncul: 2 dan 3'),
          h('li', {}, 'Ambil pangkat ', b('tertinggi'), ': 2² (dari 12) dan 3² (dari 18)'),
          h('li', {}, 'KPK = 2² × 3² = 4 × 9 = ', b('36')),
        ),
      ),
    ],
  },
  {
    judul: 'Memilih cara yang tepat',
    isi: () => [
      h('div', { class: 'kartu' },
        h('h3', {}, 'Cara mana yang dipakai?'),
        h('ul', {},
          h('li', {}, b('Bilangan kecil'), ' (misalnya 4 dan 6) → daftar kelipatan cukup cepat.'),
          h('li', {}, b('Bilangan besar atau tiga bilangan'), ' (misalnya 18, 24, 30) → faktorisasi prima lebih rapi.'),
        ),
        p({ class: 'kecil muted' }, 'Keduanya selalu menghasilkan jawaban yang sama. Pilih yang paling nyaman untukmu.'),
      ),
      h('div', { class: 'kartu' },
        h('h3', {}, 'KPK atau FPB?'),
        p(b('KPK'), ' → mencari kelipatan: "bersamaan lagi", "serentak", "bertemu lagi", "sama tinggi".'),
        p(b('FPB'), ' → mencari pembagi: "dibagi sama banyak", "sebanyak-banyaknya", "sepanjang mungkin".'),
      ),
      h('div', { class: 'kartu' },
        h('h3', {}, '⚠️ Kesalahan yang sering terjadi'),
        p('Mengalikan dua bilangan ', b('belum tentu'), ' menghasilkan KPK.'),
        p('8 × 12 = 96, padahal KPK(8, 12) = 24. Hasil kali hanya sama dengan KPK jika kedua bilangan tidak punya faktor persekutuan selain 1 (misalnya 4 dan 5).'),
      ),
    ],
  },
  {
    judul: 'Giliranmu (1)',
    isi: () => [
      p('Daftar kelipatan sudah ditulis. Kamu tinggal melengkapi langkah terakhir.'),
      kartuSoal({ judul: 'Contoh rumpang', teks: 'Tentukan KPK dari 10 dan 15.', sorotan: [{ teks: '10', warna: 'a' }, { teks: '15', warna: 'b' }] }),
      h('div', { class: 'kartu' },
        p(h('mark', { class: 'hl hl-a' }, 'Kelipatan 10'), ': 10, 20, 30, 40, 50, 60'),
        p(h('mark', { class: 'hl hl-b' }, 'Kelipatan 15'), ': 15, 30, 45, 60'),
      ),
      cobaKecil(isianAngka({ label: 'Bilangan terkecil yang ada di kedua daftar adalah' }), (v) => periksaKpk([10, 15], v)),
    ],
  },
  {
    judul: 'Giliranmu (2)',
    isi: () => {
      const pangkat = isianPangkat({ bilangan: [30], basis: [2, 3, 5] });
      const kpkInput = isianAngka({ label: 'KPK(20, 30) =' });
      const pita = pitaUmpanBalik();
      return [
        p('Faktorisasi 20 sudah dikerjakan. Lengkapi faktorisasi 30, lalu tentukan KPK-nya.'),
        h('div', { class: 'kartu' },
          h('div', { class: 'baris-faktor' }, '20 = 2² × 5', h('span', { class: 'muted kecil', style: { marginLeft: '8px' } }, '✓ sudah dikerjakan')),
          pangkat.el,
          kpkInput.el,
          tombol('Periksa', () => {
            const f = periksaFaktorisasi(30, pangkat.nilai()[30]);
            pita.tampil(f.benar ? periksaKpk([20, 30], kpkInput.nilai()) : f);
          }, { varian: 'utama' }),
          pita.el,
        ),
      ];
    },
  },
  {
    judul: 'Cek kewajaran jawabanmu',
    isi: () => [
      p('Tidak perlu selalu bertanya ke guru. Kamu bisa memeriksa jawaban KPK sendiri dengan tiga pertanyaan:'),
      h('div', { class: 'kartu' },
        h('ol', {},
          h('li', {}, 'Apakah jawabanku ', b('habis dibagi setiap bilangan'), '?'),
          h('li', {}, 'Apakah jawabanku ', b('tidak lebih kecil'), ' dari bilangan terbesar?'),
          h('li', {}, 'Apakah ada kelipatan bersama yang ', b('lebih kecil'), '? Coba bagi jawabanmu dengan 2 atau 3, lalu cek lagi.'),
        ),
      ),
      kartuSoal({ judul: 'Coba', teks: 'Rudi menjawab KPK(6, 8) = 30. Apakah jawaban Rudi masuk akal?' }),
      cobaKecil(
        pilihanGanda({ opsi: ['Ya, masuk akal', 'Tidak, karena 30 tidak habis dibagi 8', 'Tidak, karena 30 terlalu kecil'] }),
        (v) => periksaPilihan(v, 1, 'Benar! 30 : 8 tidak bulat, jadi 30 bukan kelipatan 8. KPK(6, 8) = 24.', 'Coba bagi 30 dengan 6, lalu dengan 8. Apakah keduanya bulat?'),
      ),
    ],
  },
];

export function viewBelajar(nomor) {
  const total = HALAMAN.length;
  const i = Math.min(Math.max(Number(nomor || bacaSaya('belajar_terakhir', 1)), 1), total);
  tulisSaya('belajar_terakhir', i);
  const selesai = new Set(bacaSaya('belajar_selesai', []));
  selesai.add(i);
  tulisSaya('belajar_selesai', [...selesai]);
  const hal = HALAMAN[i - 1];
  atur({ judul: 'Belajar KPK', rute: 'belajar', kembali: '#/beranda', nav: true });

  const daftarIsi = h('details', { class: 'kartu-soal' },
    h('summary', {}, 'Daftar isi'),
    h('ol', { class: 'isi-soal' }, HALAMAN.map((x, k) => h('li', {}, h('a', { href: `#/belajar/${k + 1}` }, x.judul, selesai.has(k + 1) ? ' ✓' : '')))),
  );

  return h(
    'div',
    {},
    ...posisiLangkah(`Bagian ${i} dari ${total}`, '', i / total),
    h('h2', {}, hal.judul),
    ...[hal.isi()].flat(),
    h('div', { class: 'baris-tombol' },
      i > 1 ? tombol('← Sebelumnya', () => pergi(`#/belajar/${i - 1}`)) : null,
      i < total
        ? tombol('Lanjut →', () => pergi(`#/belajar/${i + 1}`), { varian: 'utama' })
        : tombol('Mulai latihan →', () => pergi('#/latihan'), { varian: 'utama' }),
    ),
    h('div', { style: { marginTop: '24px' } }, daftarIsi),
  );
}
