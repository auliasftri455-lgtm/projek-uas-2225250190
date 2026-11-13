// Pembuat soal latihan bertingkat (fitur F7). Setiap soal terdiri atas beberapa langkah;
// setiap langkah punya isian, pemeriksa, ringkasan, dan 3 petunjuk bertahap.

import { centang, isianAngka, isianDaftar, isianPangkat, pilihanGanda } from './components/isian.js';
import { garisWaktu, pohonFaktor } from './components/visual.js';
import { faktorisasi, formatFaktorisasi, fpb, kpk, prima } from './kpk.js';
import {
  parseFaktorisasi, periksaCentang, periksaFaktorisasi, periksaFpb, periksaKelipatan, periksaKpk, periksaPilihan,
} from './pemeriksa.js';
import { acak } from './ui.js';

export const LEVEL = {
  1: { judul: 'Daftar kelipatan', keterangan: 'KPK dua bilangan kecil' },
  2: { judul: 'Faktorisasi prima', keterangan: 'KPK dua bilangan dengan pohon faktor' },
  3: { judul: 'Tiga bilangan', keterangan: 'KPK tiga bilangan' },
  4: { judul: 'KPK atau FPB?', keterangan: 'Soal cerita pendek' },
  5: { judul: 'Saring informasi', keterangan: 'Soal cerita dengan informasi tambahan' },
};
export const SOAL_PER_LEVEL = 5;

const acakDari = (arr, rng) => arr[Math.floor(rng() * arr.length)];

function pasangan(syarat, rentang, banyak, rng) {
  const kandidat = [];
  for (const a of rentang) for (const b of rentang) if (a < b && syarat(a, b)) kandidat.push([a, b]);
  return acak(kandidat, rng).slice(0, banyak).map((p) => (rng() < 0.5 ? p : [p[1], p[0]]));
}

const rentang = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// ---------------------------------------------------------------- langkah umum

function langkahKelipatan(n, minimal) {
  return {
    instruksi: `Tulis ${minimal} kelipatan pertama dari ${n}.`,
    buatIsian: () => {
      const d = isianDaftar({ bilangan: [n] });
      return { el: d.el, nilai: () => d.nilai()[n], isi: (v) => d.isi({ [n]: v }) };
    },
    periksa: (v) => periksaKelipatan(n, v, minimal),
    ringkas: (v) => `Kelipatan ${n}: ${v}`,
    petunjuk: [
      `Kelipatan ${n} adalah ${n} × 1, ${n} × 2, ${n} × 3, dan seterusnya.`,
      `Mulai dari ${n}, lalu tambahkan ${n} terus: ${n}, ${2 * n}, …`,
      () => garisWaktu([n], n * minimal),
    ],
  };
}

function langkahFaktorisasi(bilangan) {
  const satu = bilangan.length === 1;
  return {
    instruksi: satu ? `Faktorkan ${bilangan[0]} menjadi faktor prima.` : `Faktorkan ${bilangan.join(', ')} menjadi faktor prima.`,
    buatIsian: () => isianPangkat({ bilangan }),
    periksa: (v) => {
      for (const n of bilangan) {
        const hasil = periksaFaktorisasi(n, v[n]);
        if (!hasil.benar) return satu ? hasil : { ...hasil, pesan: `${n}: ${hasil.pesan}` };
      }
      return { benar: true, pesan: `Benar! ${bilangan.map((n) => `${n} = ${formatFaktorisasi(faktorisasi(n))}`).join('; ')}.` };
    },
    ringkas: (v) => bilangan.map((n) => `${n} = ${formatFaktorisasi(parseFaktorisasi(v[n]) || {})}`).join('; '),
    petunjuk: [
      'Bagi bilangan itu dengan bilangan prima terkecil (2, 3, 5, …) berulang-ulang.',
      'Hitung berapa kali setiap bilangan prima dipakai. Itulah pangkatnya.',
      () => pohonFaktor(bilangan[0]),
    ],
  };
}

function langkahKpk(bilangan, { instruksi, petunjuk } = {}) {
  return {
    instruksi: instruksi || `Tentukan KPK(${bilangan.join(', ')}).`,
    buatIsian: () => isianAngka({ label: `KPK(${bilangan.join(', ')}) =` }),
    periksa: (v) => periksaKpk(bilangan, v),
    ringkas: (v) => `KPK(${bilangan.join(', ')}) = ${v}`,
    petunjuk: petunjuk || [
      'Ambil SEMUA faktor prima yang muncul.',
      'Untuk setiap faktor prima, pilih pangkat yang PALING TINGGI, lalu kalikan.',
      'Contoh: 12 = 2² × 3 dan 18 = 2 × 3², maka KPK = 2² × 3² = 36.',
    ],
  };
}

// ---------------------------------------------------------------- level 1–3

function soalLevel1([a, b]) {
  const minimal = 6;
  return {
    teks: `Tentukan KPK dari ${a} dan ${b} dengan mendaftar kelipatannya.`,
    sorotan: [],
    langkah: [
      langkahKelipatan(a, minimal),
      langkahKelipatan(b, minimal),
      langkahKpk([a, b], {
        instruksi: 'Bilangan terkecil yang ada di KEDUA daftar adalah …',
        petunjuk: [
          'Lihat ringkasan di atas: cari bilangan yang muncul di kedua daftar.',
          'Mulai bandingkan dari bilangan yang paling kecil.',
          () => garisWaktu([a, b], kpk(a, b) * 2),
        ],
      }),
    ],
  };
}

function soalLevel2([a, b]) {
  return {
    teks: `Tentukan KPK dari ${a} dan ${b} dengan faktorisasi prima.`,
    sorotan: [],
    langkah: [langkahFaktorisasi([a]), langkahFaktorisasi([b]), langkahKpk([a, b])],
  };
}

function soalLevel3(bilangan) {
  return {
    teks: `Tentukan KPK dari ${bilangan.join(', ')}.`,
    sorotan: [],
    langkah: [langkahFaktorisasi(bilangan), langkahKpk(bilangan)],
  };
}

// ---------------------------------------------------------------- level 4–5 (soal cerita)

const OPSI_KONSEP = ['KPK (mencari kelipatan bersama terkecil)', 'FPB (mencari pembagi bersama terbesar)'];

function langkahKonsep(cerita) {
  const kunci = cerita.konsep === 'KPK' ? 0 : 1;
  return {
    instruksi: 'Konsep apa yang dipakai untuk menjawab soal ini?',
    buatIsian: () => {
      const p = pilihanGanda({ opsi: OPSI_KONSEP });
      return p;
    },
    periksa: (v) =>
      periksaPilihan(
        v,
        kunci,
        kunci === 0 ? 'Benar! Soal ini mencari waktu/jumlah yang merupakan kelipatan bersama.' : 'Benar! Soal ini membagi sama banyak, jadi mencari pembagi bersama.',
        'Belum tepat. Apakah jawabannya lebih besar dari bilangan di soal (kelipatan) atau lebih kecil (pembagi)?',
      ),
    ringkas: (v) => `Konsep: ${v === 0 ? 'KPK' : 'FPB'}`,
    petunjuk: [
      'Cari kata kunci di soal: "bersamaan lagi", "serentak" → KPK. "Sebanyak-banyaknya", "sama banyak", "sepanjang mungkin" → FPB.',
      'Apakah jawabannya akan LEBIH BESAR dari bilangan di soal? Jika ya, itu kelipatan (KPK).',
      'Contoh: dua lampu menyala bersamaan lagi → KPK. Membagi 24 kue ke kotak sebanyak-banyaknya → FPB.',
    ],
  };
}

function langkahJawabCerita(cerita) {
  const { bilangan, satuan, konsep } = cerita;
  return {
    instruksi: `Hitung jawabannya.`,
    buatIsian: () => isianAngka({ label: 'Jawaban', satuan }),
    periksa: (v) => (konsep === 'KPK' ? periksaKpk(bilangan, v) : periksaFpb(bilangan, v)),
    ringkas: (v) => `Jawaban: ${v} ${satuan}`,
    petunjuk: [
      `Bilangan yang dipakai: ${bilangan.join(', ')}.`,
      `Hitung ${konsep}(${bilangan.join(', ')}) dengan cara yang kamu sukai.`,
      konsep === 'KPK' ? () => garisWaktu(bilangan, null, { satuan }) : `Faktorkan setiap bilangan, lalu ambil faktor yang SAMA dengan pangkat TERKECIL.`,
    ],
  };
}

function langkahSaring(cerita) {
  return {
    instruksi: 'Centang informasi yang DIPERLUKAN untuk menjawab.',
    buatIsian: () => centang({ opsi: cerita.info }),
    periksa: (v) => periksaCentang(v, cerita.info_relevan),
    ringkas: (v) => `Informasi penting: ${v.map((i) => cerita.info[i]).join('; ')}`,
    petunjuk: [
      'Baca pertanyaannya dulu (kalimat terakhir). Apa yang ditanyakan?',
      'Untuk setiap informasi, tanyakan: jika angka ini diubah, apakah jawabannya ikut berubah?',
      'Harga, jumlah orang, atau jam buka biasanya tidak dipakai untuk soal KPK/FPB.',
    ],
  };
}

function soalCerita(cerita, level) {
  return {
    teks: cerita.teks,
    sorotan: level === 4 ? cerita.sorotan || [] : [], // level 5 tanpa sorotan: siswa menyaring sendiri
    langkah: level === 5 ? [langkahSaring(cerita), langkahKonsep(cerita), langkahJawabCerita(cerita)] : [langkahKonsep(cerita), langkahJawabCerita(cerita)],
  };
}

// ---------------------------------------------------------------- titik masuk

export function buatSoalLevel(level, bankCerita, rng = Math.random) {
  level = Number(level);
  if (level === 1) {
    const ps = pasangan((a, b) => a !== b && kpk(a, b) / a <= 6 && kpk(a, b) / b <= 6 && kpk(a, b) !== b, rentang(2, 12), SOAL_PER_LEVEL, rng);
    return ps.map(soalLevel1);
  }
  if (level === 2) {
    const komposit = rentang(12, 60).filter((n) => !prima(n));
    const ps = pasangan((a, b) => kpk(a, b) <= 360 && kpk(a, b) !== b && fpb(a, b) > 1, komposit, SOAL_PER_LEVEL, rng);
    return ps.map(soalLevel2);
  }
  if (level === 3) {
    const hasil = [];
    let coba = 0;
    while (hasil.length < SOAL_PER_LEVEL && coba < 1000) {
      coba += 1;
      const t = [acakDari(rentang(2, 20), rng), acakDari(rentang(2, 20), rng), acakDari(rentang(2, 20), rng)];
      const unik = new Set(t).size === 3;
      const k = unik ? kpk(...t) : 0;
      if (unik && k <= 180 && t.filter((n) => !prima(n)).length >= 2 && !t.includes(k)) {
        if (!hasil.some((x) => x.join() === t.join())) hasil.push(t);
      }
    }
    return hasil.map(soalLevel3);
  }
  const cerita = bankCerita?.level?.[level] || [];
  return acak(cerita, rng).slice(0, SOAL_PER_LEVEL).map((c) => soalCerita(c, level));
}

/** Bintang per soal: 3 tanpa petunjuk, 2 dengan 1 petunjuk, 1 dengan 2 petunjuk atau lebih. */
export function hitungBintang(petunjukTerpakai) {
  if (petunjukTerpakai === 0) return 3;
  if (petunjukTerpakai === 1) return 2;
  return 1;
}
