// Logika inti KPK, FPB, dan faktorisasi prima.
// KEMBARAN dari backend/app/core/kpk.py — ubah keduanya bersamaan dan uji dengan
// shared/test_vectors/kpk.json.

function cekBilangan(n) {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    throw new RangeError(`Bilangan harus bulat positif, bukan ${n}`);
  }
}

/** faktorisasi(24) -> { 2: 3, 3: 1 };  faktorisasi(1) -> {} */
export function faktorisasi(n) {
  cekBilangan(n);
  const hasil = {};
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      hasil[d] = (hasil[d] || 0) + 1;
      n /= d;
    }
    d += 1;
  }
  if (n > 1) hasil[n] = (hasil[n] || 0) + 1;
  return hasil;
}

/** { 2: 3, 3: 1 } -> 24 */
export function nilaiFaktorisasi(f) {
  let hasil = 1;
  for (const [p, e] of Object.entries(f)) hasil *= Number(p) ** Number(e);
  return hasil;
}

export function fpb(...bilangan) {
  if (bilangan.length === 0) throw new RangeError('Minimal satu bilangan');
  bilangan.forEach(cekBilangan);
  return bilangan.reduce((a, b) => {
    while (b) [a, b] = [b, a % b];
    return a;
  });
}

export function kpk(...bilangan) {
  if (bilangan.length === 0) throw new RangeError('Minimal satu bilangan');
  bilangan.forEach(cekBilangan);
  return bilangan.reduce((a, b) => (a * b) / fpb(a, b));
}

/** Ambil setiap faktor prima dengan pangkat tertinggi, lalu kalikan. */
export function kpkDariFaktorisasi(daftar) {
  const gabungan = {};
  for (const f of daftar) {
    for (const [p, e] of Object.entries(f)) gabungan[p] = Math.max(gabungan[p] || 0, e);
  }
  return nilaiFaktorisasi(gabungan);
}

/** daftarKelipatan(8, 3) -> [8, 16, 24] */
export function daftarKelipatan(n, banyak) {
  cekBilangan(n);
  return Array.from({ length: banyak }, (_, i) => n * (i + 1));
}

export function prima(n) {
  return Number.isInteger(n) && n >= 2 && faktorisasi(n)[n] === 1;
}

const PANGKAT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export function pangkatUnicode(e) {
  return String(e).split('').map((c) => PANGKAT[Number(c)] ?? c).join('');
}

/** { 2: 3, 3: 1 } -> "2³ × 3" */
export function formatFaktorisasi(f) {
  const bagian = Object.entries(f)
    .filter(([, e]) => Number(e) > 0)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([p, e]) => (Number(e) === 1 ? `${p}` : `${p}${pangkatUnicode(e)}`));
  return bagian.length ? bagian.join(' × ') : '1';
}
