// Penyimpanan lokal (per perangkat). Dibungkus try/catch: mode privat atau penyimpanan penuh
// tidak boleh membuat aplikasi berhenti. Data penting penelitian tetap dikirim ke server.

const AWALAN = 'kpk:';
const cadangan = new Map();

export function baca(kunci, bawaan = null) {
  try {
    const teks = localStorage.getItem(AWALAN + kunci);
    return teks === null ? bawaan : JSON.parse(teks);
  } catch {
    return cadangan.has(kunci) ? cadangan.get(kunci) : bawaan;
  }
}

export function tulis(kunci, nilai) {
  cadangan.set(kunci, nilai);
  try {
    localStorage.setItem(AWALAN + kunci, JSON.stringify(nilai));
  } catch {
    /* tetap tersimpan di memori selama halaman terbuka */
  }
}

export function hapus(kunci) {
  cadangan.delete(kunci);
  try {
    localStorage.removeItem(AWALAN + kunci);
  } catch {
    /* abaikan */
  }
}

/** Data milik pengguna yang sedang masuk, agar dua siswa di satu HP tidak bercampur. */
export function kunciPengguna(kunci) {
  const saya = baca('saya');
  return saya ? `u${saya.id}:${kunci}` : `tamu:${kunci}`;
}
export const bacaSaya = (kunci, bawaan = null) => baca(kunciPengguna(kunci), bawaan);
export const tulisSaya = (kunci, nilai) => tulis(kunciPengguna(kunci), nilai);
