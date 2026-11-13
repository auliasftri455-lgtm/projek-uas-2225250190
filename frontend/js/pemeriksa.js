// Pemeriksa langkah LATIHAN (fitur F5). Fungsi murni: tidak menyentuh DOM.
// Prinsip umpan balik: tunjukkan LETAK kesalahan, jangan langsung memberi kunci jawaban.

import { faktorisasi, formatFaktorisasi, fpb, kpk, nilaiFaktorisasi, prima } from './kpk.js';

const benar = (pesan) => ({ benar: true, pesan });
const salah = (pesan) => ({ benar: false, pesan });

/** '1,5' -> 1.5; '72 cm' -> 72; '' -> null */
export function parseAngka(teks) {
  if (teks === null || teks === undefined) return null;
  if (typeof teks === 'number') return Number.isFinite(teks) ? teks : null;
  const m = String(teks).replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/** '8, 16 24' -> [8, 16, 24]; isian tidak valid -> null */
export function parseDaftar(teks) {
  const bagian = String(teks ?? '').trim().split(/[,;\s]+/).filter(Boolean);
  if (!bagian.length) return null;
  const angka = bagian.map(Number);
  return angka.every(Number.isInteger) ? angka : null;
}

/** {'2': '3', '3': '', '5': '0'} -> {2: 3} ; isian tidak valid -> null */
export function parseFaktorisasi(isian) {
  const hasil = {};
  for (const [p, e] of Object.entries(isian || {})) {
    if (e === '' || e === null || e === undefined) continue;
    const pangkat = Number(e);
    if (!Number.isInteger(pangkat) || pangkat < 0) return null;
    if (pangkat > 0) hasil[p] = pangkat;
  }
  return hasil;
}

export function periksaKelipatan(n, teks, minimal = 1) {
  const d = parseDaftar(teks);
  if (!d) return salah('Tulis bilangan dipisah koma, contoh: 4, 8, 12.');
  // Tunjukkan bilangan yang keliru lebih dulu, baru kekurangan jumlahnya.
  for (let i = 0; i < d.length; i++) {
    const harus = n * (i + 1);
    if (d[i] === harus) continue;
    if (d[i] % n !== 0) return salah(`Cek bilangan ke-${i + 1}: ${d[i]} tidak habis dibagi ${n}.`);
    return salah(
      `Bilangan ke-${i + 1} (${d[i]}) memang kelipatan ${n}, tetapi urutannya tidak pas. ` +
        `Kelipatan harus berurutan: ${n}×1, ${n}×2, ${n}×3, …`,
    );
  }
  if (d.length < minimal) return salah(`Sejauh ini benar. Tulis paling sedikit ${minimal} bilangan, baru ada ${d.length}.`);
  return benar(`Benar! Setiap bilangan bertambah ${n}.`);
}

export function periksaFaktorisasi(n, isian) {
  const f = parseFaktorisasi(isian);
  if (!f) return salah('Pangkat harus bilangan bulat, misalnya 1, 2, atau 3.');
  if (!Object.keys(f).length) return salah('Isi pangkatnya dulu. Kosong berarti faktor itu tidak dipakai.');
  const bukanPrima = Object.keys(f).map(Number).find((p) => !prima(p));
  if (bukanPrima) return salah(`${bukanPrima} bukan bilangan prima. Faktorkan lagi.`);
  const nilai = nilaiFaktorisasi(f);
  if (nilai !== n) {
    const pembagi = Object.keys(f).map(Number).find((p) => n % p !== 0);
    if (pembagi) return salah(`${n} tidak habis dibagi ${pembagi}, jadi ${pembagi} bukan faktornya.`);
    const lebih = nilai > n ? 'terlalu besar' : 'terlalu kecil';
    return salah(`Hasil kalinya ${formatFaktorisasi(f)} = ${nilai}, ${lebih} dari ${n}. Periksa pangkatnya.`);
  }
  return benar(`Benar! ${n} = ${formatFaktorisasi(f)}.`);
}

export function periksaKpk(bilangan, jawab) {
  const x = parseAngka(jawab);
  if (x === null || !Number.isInteger(x) || x < 1) return salah('Tulis satu bilangan bulat positif.');
  const target = kpk(...bilangan);
  if (x === target) {
    return benar(`Benar! ${x} habis dibagi ${bilangan.join(', ')}, dan tidak ada yang lebih kecil.`);
  }
  if (bilangan.every((b) => b % x === 0)) {
    return salah(`${x} adalah pembagi (faktor), bukan kelipatan. Itu arah FPB. KPK tidak mungkin lebih kecil dari ${Math.max(...bilangan)}.`);
  }
  const tidakHabis = bilangan.find((b) => x % b !== 0);
  if (tidakHabis) return salah(`${x} tidak habis dibagi ${tidakHabis}, jadi bukan kelipatan ${tidakHabis}.`);
  return salah(`${x} memang kelipatan persekutuan, tetapi masih ada yang lebih kecil. Cari yang PALING kecil.`);
}

export function periksaFpb(bilangan, jawab) {
  const x = parseAngka(jawab);
  if (x === null || !Number.isInteger(x) || x < 1) return salah('Tulis satu bilangan bulat positif.');
  const target = fpb(...bilangan);
  if (x === target) return benar(`Benar! ${bilangan.join(' dan ')} sama-sama habis dibagi ${x}, dan tidak ada pembagi bersama yang lebih besar.`);
  if (bilangan.every((b) => x % b === 0)) {
    return salah(`${x} adalah kelipatan, bukan pembagi. Itu arah KPK. Jawaban FPB tidak mungkin lebih besar dari ${Math.min(...bilangan)}.`);
  }
  const tidakHabis = bilangan.find((b) => b % x !== 0);
  if (tidakHabis) return salah(`${tidakHabis} tidak habis dibagi ${x}.`);
  return salah(`${x} memang membagi semuanya, tetapi masih ada pembagi bersama yang lebih besar.`);
}

export function periksaPilihan(pilih, kunci, pesanBenar, pesanSalah) {
  if (pilih === null || pilih === undefined) return salah('Pilih salah satu jawaban dulu.');
  return pilih === kunci ? benar(pesanBenar || 'Benar!') : salah(pesanSalah || 'Belum tepat. Baca lagi soalnya.');
}

export function periksaCentang(pilih, kunci) {
  const a = [...(pilih || [])].sort();
  const b = [...kunci].sort();
  if (!a.length) return salah('Centang informasi yang kamu perlukan.');
  const lebih = a.filter((x) => !b.includes(x)).length;
  const kurang = b.filter((x) => !a.includes(x)).length;
  if (!lebih && !kurang) return benar('Benar! Informasi lain tidak dipakai untuk menghitung.');
  if (lebih && kurang) return salah('Ada informasi yang tidak perlu ikut dicentang, dan ada yang terlewat.');
  if (lebih) return salah(`Ada ${lebih} informasi yang tidak diperlukan. Apakah informasi itu memengaruhi jawaban?`);
  return salah(`Masih ada ${kurang} informasi penting yang belum dicentang.`);
}

export { faktorisasi };
