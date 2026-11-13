// Diagnostik prasyarat (fitur F3): satu butir per layar, tanpa umpan balik benar/salah
// per butir (agar tidak menegangkan). Hasil per kategori dipakai untuk menyarankan jalur belajar.

import { ambilDenganCadangan, catatLog } from '../api.js';
import { pilihanGanda, isianAngka } from '../components/isian.js';
import { bilahSkor, posisiLangkah } from '../components/komponen.js';
import { atur, pergi } from '../layout.js';
import { parseAngka } from '../pemeriksa.js';
import { tulisSaya } from '../store.js';
import { h, tombol } from '../ui.js';

const SARAN = {
  kelipatan: { teks: 'Pemahaman kelipatan perlu dikuatkan dulu. Mulai dari bagian "Apa itu kelipatan?".', href: '#/belajar/1', label: 'Belajar kelipatan' },
  faktor: { teks: 'Faktor dan pembagi perlu dikuatkan. Pelajari bagian faktorisasi prima dengan pohon faktor.', href: '#/belajar/3', label: 'Belajar faktorisasi' },
  prima: { teks: 'Bilangan prima perlu dikuatkan. Pelajari bagian pohon faktor: bilangan prima adalah ujung pohonnya.', href: '#/belajar/3', label: 'Belajar bilangan prima' },
};

export async function viewDiagnostik() {
  atur({ judul: 'Cek kesiapan', kembali: '#/beranda', nav: false });
  const data = await ambilDenganCadangan('/soal/diagnostik');
  const butir = data.butir;
  const jawaban = {};
  const wadah = h('div');
  let i = 0;

  const tampilButir = () => {
    const b = butir[i];
    const isian = b.tipe === 'pilihan' ? pilihanGanda({ opsi: b.opsi }) : isianAngka({ label: 'Jawaban' });
    if (jawaban[b.id] !== undefined) isian.isi(jawaban[b.id]);
    const simpan = () => (jawaban[b.id] = isian.nilai());
    wadah.replaceChildren(
      ...posisiLangkah(`Pertanyaan ${i + 1} dari ${butir.length}`, data.kategori[b.kategori], i / butir.length),
      h('p', { class: 'instruksi' }, b.teks),
      isian.el,
      h('p', { class: 'kecil muted' }, 'Tidak apa-apa jika belum yakin. Pilih jawaban terbaikmu.'),
      h('div', { class: 'baris-tombol' },
        i > 0 ? tombol('Sebelumnya', () => { simpan(); i -= 1; tampilButir(); }) : null,
        tombol(i < butir.length - 1 ? 'Lanjut' : 'Lihat hasil', () => { simpan(); i += 1; i < butir.length ? tampilButir() : tampilHasil(); }, { varian: 'utama' }),
      ),
    );
    window.scrollTo(0, 0);
  };

  const tampilHasil = () => {
    const skor = Object.fromEntries(Object.keys(data.kategori).map((k) => [k, { benar: 0, total: 0 }]));
    for (const b of butir) {
      const j = jawaban[b.id];
      const ok = b.tipe === 'pilihan' ? j === b.kunci : parseAngka(j) === b.kunci;
      skor[b.kategori].total += 1;
      if (ok) skor[b.kategori].benar += 1;
    }
    const lemah = Object.entries(skor).filter(([, s]) => s.benar < Math.ceil(s.total * 0.67)).map(([k]) => k);
    const saran = lemah.length ? SARAN[lemah[0]] : { teks: 'Prasyaratmu sudah kuat. Kamu bisa langsung belajar cara mencari KPK.', href: '#/belajar/2', label: 'Mulai belajar KPK' };
    const hasil = { skor, lemah, saran, waktu: new Date().toISOString() };
    tulisSaya('diagnostik', hasil);
    catatLog('diagnostik', { skor, lemah });

    atur({ judul: 'Hasil cek kesiapan', kembali: '#/beranda', nav: false });
    wadah.replaceChildren(
      h('div', { class: 'kartu' },
        h('h2', {}, 'Hasilmu'),
        Object.entries(skor).map(([k, s]) => bilahSkor(data.kategori[k], s.benar, s.total)),
      ),
      h('div', { class: 'kartu' }, h('h3', {}, 'Saran'), h('p', {}, saran.teks), h('a', { class: 'tombol utama penuh', href: saran.href }, saran.label)),
      tombol('Ke beranda', () => pergi('#/beranda'), { varian: 'penuh' }),
    );
  };

  wadah.append(
    h('div', { class: 'kartu' },
      h('h2', {}, 'Sebelum mulai'),
      h('p', {}, 'Ada 9 pertanyaan singkat tentang kelipatan, faktor, dan bilangan prima. Ini bukan ujian. Hasilnya dipakai untuk menyarankan dari mana kamu sebaiknya mulai belajar.'),
      tombol('Mulai', tampilButir, { varian: 'utama penuh' }),
    ),
  );
  return wadah;
}
