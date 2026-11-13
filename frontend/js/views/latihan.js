// Latihan bertingkat (fitur F1, F5, F7): satu langkah per layar, umpan balik langsung,
// petunjuk bertahap, bintang. Tanpa batas waktu dan tanpa "nyawa".

import { ambilDenganCadangan, catatLog } from '../api.js';
import { bukaPanelCatatan } from '../components/catatan.js';
import { kartuSoal, pitaUmpanBalik, posisiLangkah, ringkasanLangkah, skalaBeban, tombolPetunjuk } from '../components/komponen.js';
import { LEVEL, SOAL_PER_LEVEL, buatSoalLevel, hitungBintang } from '../latihan-gen.js';
import { atur, pergi } from '../layout.js';
import { bacaSaya, tulisSaya } from '../store.js';
import { bintangTeks, h, tombol } from '../ui.js';

function levelDisarankan() {
  // Level pertama yang belum diselesaikan.
  const progres = bacaSaya('latihan', {});
  for (let l = 1; l <= 5; l++) if (!progres[l]?.selesai) return l;
  return 5;
}

export function viewLatihan() {
  atur({ judul: 'Latihan', rute: 'latihan', kembali: '#/beranda' });
  const progres = bacaSaya('latihan', {});
  const saran = levelDisarankan();
  return h(
    'div',
    {},
    h('p', { class: 'muted' }, `Setiap level berisi ${SOAL_PER_LEVEL} soal. Bintang: ★★★ tanpa petunjuk, ★★ dengan 1 petunjuk, ★ dengan 2 petunjuk atau lebih. Tidak ada batas waktu.`),
    Object.entries(LEVEL).map(([l, info]) => {
      const p = progres[l];
      const rata = p ? Math.round(p.bintang / SOAL_PER_LEVEL) : 0;
      return h(
        'a',
        { class: 'kartu kartu-menu', href: `#/latihan/${l}`, style: Number(l) === saran ? { borderColor: 'var(--primary)' } : {} },
        h('span', { class: 'ikon angka', 'aria-hidden': 'true' }, l),
        h('div', {},
          h('h3', {}, `Level ${l}: ${info.judul}`),
          h('p', {}, info.keterangan),
          p ? h('p', {}, h('span', { class: 'bintang', 'aria-label': `${rata} dari 3 bintang` }, bintangTeks(rata)), ` · terbaik ${p.bintang}/${SOAL_PER_LEVEL * 3}`) : null,
          Number(l) === saran ? h('p', { style: { color: 'var(--primary)', fontWeight: 700 } }, 'Disarankan untukmu') : null,
        ),
      );
    }),
  );
}

export async function viewLatihanLevel(levelStr) {
  const level = Number(levelStr);
  atur({ judul: `Latihan Level ${level}`, kembali: '#/latihan', nav: false });
  const bank = level >= 4 ? await ambilDenganCadangan('/soal/latihan') : null;
  const daftarSoal = buatSoalLevel(level, bank);
  const bintang = [];
  const wadah = h('div');
  let s = 0;

  function mainkanSoal() {
    const soal = daftarSoal[s];
    const selesai = []; // { langkah, nilai }
    let petunjukSoal = 0;
    let salahSoal = 0;
    let l = 0;

    function layarLangkah() {
      const langkah = soal.langkah[l];
      const isian = langkah.buatIsian();
      const pita = pitaUmpanBalik();
      const petunjuk = tombolPetunjuk(langkah.petunjuk, (ke) => {
        petunjukSoal += 1;
        catatLog('petunjuk', { asal: 'latihan', level, soal: s + 1, langkah: l + 1, ke });
      });
      let sudahBenar = false;
      const aksi = tombol('Periksa', () => {
        if (sudahBenar) {
          selesai.push({ langkah, nilai: isian.nilai() });
          l += 1;
          return l < soal.langkah.length ? layarLangkah() : soalSelesai();
        }
        const hasil = langkah.periksa(isian.nilai());
        pita.tampil(hasil);
        if (hasil.benar) {
          sudahBenar = true;
          aksi.textContent = 'Lanjut →';
          isian.el.querySelectorAll('input, select, textarea, button').forEach((x) => (x.disabled = true));
        } else salahSoal += 1;
      }, { varian: 'utama penuh' });

      wadah.replaceChildren(
        ...posisiLangkah(`Soal ${s + 1} dari ${daftarSoal.length}`, `Langkah ${l + 1} dari ${soal.langkah.length}`, (s + l / soal.langkah.length) / daftarSoal.length),
        kartuSoal({ teks: soal.teks, sorotan: soal.sorotan }),
        ringkasanLangkah(selesai.map((x) => ({ ok: true, teks: x.langkah.ringkas(x.nilai) }))),
        h('p', { class: 'instruksi' }, langkah.instruksi),
        isian.el,
        petunjuk.daftar,
        pita.el,
        h('div', { class: 'baris-tombol' }, petunjuk.tombol, tombol('📒 Catatan', () => bukaPanelCatatan('latihan'), { varian: 'kecil' })),
        h('div', { style: { marginTop: '16px' } }, aksi),
      );
      window.scrollTo(0, 0);
      isian.el.querySelector('input, select')?.focus({ preventScroll: true });
    }

    function soalSelesai() {
      const b = hitungBintang(petunjukSoal);
      bintang.push(b);
      catatLog('latihan', { level, soal: s + 1, bintang: b, petunjuk: petunjukSoal, salah: salahSoal });
      s += 1;
      wadah.replaceChildren(
        h('div', { class: 'kartu tengah' },
          h('p', { style: { fontSize: '2.2rem', margin: 0 }, class: 'bintang', 'aria-label': `${b} bintang` }, bintangTeks(b)),
          h('h2', {}, b === 3 ? 'Hebat, tanpa petunjuk!' : 'Soal selesai!'),
          b < 3 ? h('p', { class: 'muted' }, 'Petunjuk membantumu menyelesaikannya. Coba soal berikutnya dengan lebih sedikit petunjuk.') : null,
        ),
        ringkasanLangkah(selesai.map((x) => ({ ok: true, teks: x.langkah.ringkas(x.nilai) })), 'Langkahmu'),
        s < daftarSoal.length ? tombol('Soal berikutnya →', mainkanSoal, { varian: 'utama penuh' }) : tombol('Lihat hasil level →', levelSelesai, { varian: 'utama penuh' }),
      );
      window.scrollTo(0, 0);
    }

    layarLangkah();
  }

  function levelSelesai() {
    const total = bintang.reduce((a, b) => a + b, 0);
    const progres = bacaSaya('latihan', {});
    if (!progres[level] || total > progres[level].bintang) progres[level] = { bintang: total, selesai: true };
    tulisSaya('latihan', progres);
    const lanjut = level < 5 ? tombol(`Level ${level + 1} →`, () => pergi(`#/latihan/${level + 1}`), { varian: 'utama' }) : tombol('Coba tes →', () => pergi('#/tes'), { varian: 'utama' });
    const terima = h('p', { class: 'kecil muted', 'aria-live': 'polite' });
    wadah.replaceChildren(
      h('div', { class: 'kartu tengah' },
        h('h2', {}, `Level ${level} selesai!`),
        h('p', { class: 'bintang', style: { fontSize: '1.6rem' } }, `★ ${total} / ${daftarSoal.length * 3}`),
      ),
      skalaBeban((nilai) => {
        catatLog('beban', { asal: 'latihan', level, nilai });
        terima.textContent = 'Terima kasih!';
      }),
      terima,
      h('div', { class: 'baris-tombol' }, tombol('Ulangi level', () => pergi(`#/latihan/${level}`)), lanjut),
    );
    window.scrollTo(0, 0);
  }

  if (!daftarSoal.length) return h('p', {}, 'Soal untuk level ini belum tersedia. Periksa koneksi internet lalu coba lagi.');
  mainkanSoal();
  return wadah;
}
