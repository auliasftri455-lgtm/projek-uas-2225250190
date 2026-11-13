# CLAUDE.md

Panduan untuk Claude Code (dan asisten AI lain) saat bekerja di repositori ini.

## Konteks Proyek

Aplikasi web pembelajaran KPK untuk siswa SMP, berbasis Cognitive Load Theory, untuk meningkatkan mathematical
literacy. Proyek UAS mahasiswa S1 Pendidikan Matematika. Baca dokumen `docs/` **sebelum** menulis kode:

1. `docs/01-SOAL-LATIHAN.md` — instrumen tes (sumber kebenaran untuk soal, kunci, dan skor)
2. `docs/02-ANALISIS-KEBUTUHAN.md` — fitur F1–F8 dan alasannya
3. `docs/03-DESAIN.md` — aturan antarmuka
4. `docs/04-ARSITEKTUR.md` — struktur folder, API, dan model data
5. `docs/05-ROADMAP.md` — fase yang sedang dikerjakan

## Bahasa & Teknologi

- **Backend: Python 3.11+** (FastAPI, SQLAlchemy 2.x, Pydantic v2, SQLite). Gunakan type hints di semua fungsi.
- **Frontend: JavaScript murni** (ES Modules), HTML, CSS. **Jangan** menambahkan framework (React, Vue) atau
  *bundler* tanpa persetujuan pengguna.
- Teks yang dilihat siswa/guru ditulis dalam **Bahasa Indonesia** sederhana. Nama variabel dan fungsi boleh dalam
  Bahasa Indonesia (`kpk`, `faktorisasi`, `skor_tahap`) dan dibuat konsisten dengan dokumen.

## Perintah

```bash
cd backend && uvicorn app.main:app --reload   # menjalankan aplikasi
cd backend && pytest                          # uji Python
node --test frontend/tests/                   # uji JavaScript
cd backend && ruff check .                    # lint Python (B008 dikecualikan untuk Depends FastAPI)
```

## Aturan Wajib

1. **Logika KPK kembar.** `backend/app/core/kpk.py` dan `frontend/js/kpk.js` harus memberi hasil sama. Setiap perubahan
   di salah satu file wajib diikuti perubahan file lainnya, dan keduanya diuji dengan `shared/test_vectors/kpk.json`.
2. **Kunci tes tidak boleh sampai ke klien.** Respons `/api/soal/tes` hanya berisi teks, sorotan, instruksi, dan opsi.
   Penilaian tes hanya dilakukan di Python. Latihan (bukan tes) boleh dinilai di JS.
3. **Skor mengikuti kisi-kisi.** Skor per tahap dan total (6 per soal, 24 total) harus sama dengan
   `docs/01-SOAL-LATIHAN.md`. Jika soal berubah, perbarui dokumen, `shared/soal/soal_literasi.json`, dan uji sekaligus.
4. **Error carried forward.** Tahap lanjutan dinilai berdasarkan isian siswa di tahap sebelumnya, sesuai pedoman
   penskoran. Setiap aturan baru wajib disertai uji skenario salah hitung.
5. **Aturan cognitive load pada UI** (lihat 03-DESAIN):
   - satu layar = satu instruksi + satu tombol utama;
   - soal cerita tetap terlihat di atas layar langkah;
   - tanpa animasi hiasan, suara, atau batas waktu;
   - umpan balik salah menunjukkan **letak** kesalahan, bukan langsung kunci jawaban.
6. **Mobile-first.** Uji di lebar 360 px. Target sentuh ≥ 44 px. Input angka memakai `inputmode="numeric"`. Huruf
   input ≥ 16 px.
7. **Privasi siswa.** Hanya simpan nama panggilan dan kode siswa. Jangan menambah field data pribadi lain. Jangan
   mencatat isi data siswa ke log server.
8. **Notasi matematika.** Gunakan "×" untuk perkalian, ":" untuk pembagian, `<sup>` untuk pangkat, dan format
   rupiah/waktu Indonesia (Rp18.000, 07.24).
9. **Service worker.** Naikkan `VERSI` di `frontend/sw.js` dan tambahkan berkas baru ke daftar `CANGKANG` setiap
   kali berkas frontend ditambah atau diubah.
10. **Antrean offline** (`frontend/js/api.js`): jangan mengosongkan `sedangKirim` di dalam fungsi async (bila antrean
    kosong, fungsi selesai sinkron sebelum promise disimpan, dan semua pengiriman berikutnya terlewat). Pertahankan
    pola `.finally()` dan uji regresinya di `tests/api.test.js`.
11. Penyimpanan lokal memakai `store.js` (localStorage per pengguna, aman bila penyimpanan diblokir). Data penelitian
    yang penting harus dikirim ke server.

## Gaya Kode

- Python: fungsi kecil dan murni di `core/`, router tipis. Format dengan ruff.
- JavaScript: satu komponen per file di `js/components/`, berupa fungsi yang mengembalikan elemen DOM. Hindari
  `innerHTML` untuk isian siswa (risiko XSS); gunakan `textContent`.
- CSS: semua warna melalui token di `css/tokens.css`. Jangan menulis warna mentah di komponen.

## Alur Kerja

- Kerjakan sesuai fase di `docs/05-ROADMAP.md`. Centang item yang selesai.
- Tulis uji bersamaan dengan kode di `core/` (Python) dan `kpk.js` / `pemeriksa.js` (JS).
- Sebelum menyatakan selesai: jalankan `pytest` dan `node --test`, lalu laporkan hasilnya apa adanya.
