# 05 — Rencana Pengerjaan (Roadmap)

Setiap fase diakhiri dengan **kriteria selesai** yang dapat diperiksa. Fase dikerjakan berurutan.

## Fase 0 — Persiapan (selesai di tahap perencanaan)
- [x] Analisis kebutuhan dari wawancara S01 → [02-ANALISIS-KEBUTUHAN.md](02-ANALISIS-KEBUTUHAN.md)
- [x] Instrumen 4 soal mathematical literacy KPK → [01-SOAL-LATIHAN.md](01-SOAL-LATIHAN.md)
- [x] Desain UI/UX → [03-DESAIN.md](03-DESAIN.md)
- [x] Arsitektur Python + JavaScript → [04-ARSITEKTUR.md](04-ARSITEKTUR.md)
- [ ] Validasi instrumen soal oleh dosen pembimbing atau guru matematika (validitas isi)

## Fase 1 — Fondasi & Logika Inti ✅
- [x] Kerangka `backend/` (FastAPI, `pyproject.toml`, ruff, pytest) dan `frontend/` (index.html, tokens.css)
- [x] `shared/test_vectors/kpk.json` (32 kasus, dibuat dengan `math.lcm`/`math.gcd` pustaka standar Python)
- [x] **Python** `core/kpk.py` dan **JavaScript** `js/kpk.js`

**Kriteria selesai:** `pytest` dan `node --test` lulus pada vektor uji yang sama. ✔

## Fase 2 — Bank Soal & Mesin Penilaian (Python) ✅
- [x] `shared/soal/soal_literasi.json` dari 01-SOAL-LATIHAN (dengan rubrik yang dapat dibaca mesin)
- [x] `core/bank_soal.py`: validasi otomatis (skor per tahap sesuai kisi-kisi, 6 per soal, total 24)
- [x] `core/penilaian.py`: 12 jenis `cek`, termasuk *error carried forward*
- [x] Uji: jawaban kunci = 6, kosong = 0, contoh pedoman soal 3, skenario salah hitung di setiap soal

## Fase 3 — API & Basis Data ✅
- [x] Model SQLAlchemy (SQLite), router masuk, soal, tes, log, guru
- [x] Kunci tidak pernah muncul di `/api/soal/tes` (diuji)
- [x] `test_api.py`: alur masuk → tes → kumpul → skor 24 → penilaian guru → CSV

## Fase 4 — Antarmuka Siswa (JavaScript) ✅
- [x] Router hash, layout mobile-first, tema terang/gelap mengikuti HP
- [x] Komponen: KartuSoal (sorotan), RingkasanLangkah, isian angka/pangkat/pilihan/centang/urutkan/tanggal/waktu,
  PitaUmpanBalik, TombolPetunjuk, skala beban Paas
- [x] Diagnostik (F3), Belajar 7 bagian dengan GarisWaktu & PohonFaktor (F1, F2, F4), Latihan level 1–5 (F5, F7),
  Tes per tahap (F8), Catatan digital (F6), Progres

## Fase 5 — Antarmuka Guru & Ekspor ✅
- [x] Dasbor kelas, tabel skor per indikator, antrean penilaian penjelasan teks, ekspor CSV (tanpa nama siswa)

## Fase 6 — PWA & Offline ✅ (sebagian perlu uji di HP sungguhan)
- [x] Manifest, ikon, service worker (jaringan dulu, cache bila offline)
- [x] Antrean jawaban offline + sinkronisasi ulang (diuji otomatis di `api.test.js`)
- [ ] Uji mode pesawat di HP Android sungguhan (memerlukan HTTPS; lihat README)

**Verifikasi yang sudah dilakukan:** seluruh alur diuji di browser Edge headless pada lebar 390 px: masuk,
diagnostik, belajar, latihan (salah → petunjuk → benar), tes lengkap 21 tahap sampai dikumpulkan (skor 23/24
dengan satu kesalahan hitung yang disengaja), dan dasbor guru.

## Fase 7 — Uji Coba & Revisi
- [ ] Uji keterbacaan dengan 1–3 siswa (termasuk S01 jika memungkinkan), dengan metode *think-aloud*
- [ ] Konfirmasi ulang preferensi game (DS01)
- [ ] Angket beban kognitif (Paas, skala 1–9) dan pretest–posttest
- [ ] Revisi berdasarkan temuan, lalu deploy ke hosting HTTPS

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Logika KPK di Python dan JS berbeda | Vektor uji bersama wajib lulus di kedua bahasa |
| Jawaban teks sulit dinilai otomatis | Kombinasi pilihan alasan (otomatis) + teks (guru) |
| Koneksi siswa lemah | PWA offline + antrean sinkronisasi |
| Fitur game justru menambah beban | Game hanya berupa level dan bintang, tanpa animasi hiasan, diuji ulang di Fase 7 |
| Data hanya dari satu siswa | Fase 7 melibatkan lebih banyak siswa sebelum kesimpulan penelitian |
