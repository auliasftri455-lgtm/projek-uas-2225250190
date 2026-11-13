// Akses API + antrean offline. Jawaban tes dan log ditulis ke antrean dulu, lalu dikirim
// berurutan. Urutan dijaga agar jawaban lama tidak menimpa jawaban baru.

import { baca, bacaSaya, tulis, tulisSaya } from './store.js';

export class ApiError extends Error {
  constructor(status, pesan) {
    super(pesan);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Tidak ada koneksi internet.');
  }
  if (res.status === 204) return null;
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respons bukan JSON */
  }
  if (!res.ok) {
    let pesan = data?.detail;
    if (Array.isArray(pesan)) pesan = 'Isian belum lengkap atau tidak sesuai.';
    throw new ApiError(res.status, pesan || `Terjadi kesalahan (${res.status}).`);
  }
  return data;
}

/** Ambil JSON publik dengan cadangan lokal (untuk soal latihan/diagnostik saat offline). */
export async function ambilDenganCadangan(path) {
  try {
    const data = await api(path);
    tulis(`cache:${path}`, data);
    return data;
  } catch (e) {
    const lama = baca(`cache:${path}`);
    if (lama) return lama;
    throw e;
  }
}

// ---------------------------------------------------------------- antrean

const pendengar = new Set();
export function pantauAntrean(fn) {
  pendengar.add(fn);
  return () => pendengar.delete(fn);
}
const kabari = () => pendengar.forEach((fn) => fn(jumlahAntrean()));

export const jumlahAntrean = () => (bacaSaya('antrean', []) || []).length;

let sedangKirim = null;

/** Masukkan ke antrean lalu coba kirim. Hasil: true bila antrean sudah kosong. */
export function kirimAtauAntre(path, body) {
  const antre = bacaSaya('antrean', []);
  antre.push({ path, body });
  tulisSaya('antrean', antre);
  kabari();
  return kirimAntrean();
}

async function prosesAntrean() {
  for (;;) {
    const antre = bacaSaya('antrean', []);
    if (!antre.length) return true;
    const [item] = antre;
    try {
      await api(item.path, { method: 'POST', body: item.body });
    } catch (e) {
      // Galat jaringan/server: berhenti dan coba lagi nanti. Galat 4xx: buang item agar antrean tidak macet.
      if (e.status === 0 || e.status >= 500 || e.status === 401) return false;
      console.warn('Item antrean dibuang:', item.path, e.message);
    }
    tulisSaya('antrean', bacaSaya('antrean', []).slice(1));
    kabari();
  }
}

/** Kirim isi antrean berurutan. Hanya satu proses pengiriman berjalan pada satu waktu. */
export function kirimAntrean() {
  // PENTING: `sedangKirim` dikosongkan lewat .finally() (selalu asinkron). Jangan mengosongkannya di
  // dalam fungsi async: bila antrean kosong, fungsi itu selesai secara sinkron SEBELUM promise-nya
  // disimpan, sehingga promise lama tertinggal selamanya dan semua pengiriman berikutnya terlewat.
  if (!sedangKirim) sedangKirim = prosesAntrean().finally(() => (sedangKirim = null));
  return sedangKirim;
}

window.addEventListener('online', () => kirimAntrean());

// ---------------------------------------------------------------- log aktivitas

let bufferLog = [];
let timerLog = null;

/** Catat aktivitas siswa (petunjuk, buka_catatan, latihan, diagnostik, beban). */
export function catatLog(jenis, data = {}) {
  const saya = baca('saya');
  if (!saya || saya.peran !== 'siswa') return;
  bufferLog.push({ jenis, data });
  clearTimeout(timerLog);
  timerLog = setTimeout(kirimLog, 1500);
}

export function kirimLog() {
  clearTimeout(timerLog);
  if (!bufferLog.length) return Promise.resolve(true);
  const entri = bufferLog;
  bufferLog = [];
  return kirimAtauAntre('/log', { entri });
}

window.addEventListener('pagehide', () => kirimLog());
