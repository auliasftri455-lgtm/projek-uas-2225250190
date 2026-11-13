# KPK Langkah demi Langkah

Aplikasi web pembelajaran **Kelipatan Persekutuan Terkecil (KPK)** untuk siswa SMP. Aplikasi ini dapat dibuka dari
browser smartphone maupun komputer. Tujuannya adalah **mengurangi beban kognitif** siswa agar kemampuan
**mathematical literacy** (penalaran, merumuskan, menggunakan prosedur, menafsirkan hasil) berkembang.

Dikembangkan oleh Aulia Safitri (S1 Pendidikan Matematika) berdasarkan analisis kebutuhan melalui wawancara siswa.

## Fitur Utama

- **Langkah demi langkah:** satu langkah per layar, dengan ringkasan langkah yang sudah selesai.
- **Diagnostik prasyarat:** kelipatan, faktor, dan bilangan prima.
- **Visual konkret:** garis waktu kelipatan, pohon faktor, dan tabel pembagian.
- **Cek jawaban mandiri:** umpan balik singkat beserta alasannya.
- **Catatan digital:** ringkasan cara KPK yang dapat dibuka saat latihan.
- **Latihan bertingkat:** level 1–5 dengan petunjuk bertahap.
- **Tes mathematical literacy:** 4 soal, skor per tahap dan per indikator (maks 24), dengan ekspor CSV untuk guru
  dan peneliti.

## Teknologi

- **Python 3.11+** — FastAPI, SQLAlchemy (SQLite), pytest: API dan mesin penilaian.
- **JavaScript** (ES Modules, tanpa framework) — antarmuka, visual SVG, dan PWA offline.

## Dokumen Perencanaan

| No | Dokumen | Isi |
|---|---|---|
| 01 | [Soal Latihan & Kisi-kisi](docs/01-SOAL-LATIHAN.md) | 4 soal mathematical literacy KPK, kisi-kisi per tahap, pedoman skor |
| 02 | [Analisis Kebutuhan](docs/02-ANALISIS-KEBUTUHAN.md) | Temuan wawancara → fitur, persona, kebutuhan fungsional |
| 03 | [Desain UI/UX](docs/03-DESAIN.md) | Prinsip cognitive load, wireframe, warna, komponen |
| 04 | [Arsitektur](docs/04-ARSITEKTUR.md) | Pembagian Python/JS, struktur folder, model data, API |
| 05 | [Roadmap](docs/05-ROADMAP.md) | Fase pengerjaan dan kriteria selesai |
| — | [CLAUDE.md](CLAUDE.md) | Aturan untuk asisten AI saat menulis kode |

## Menjalankan

Butuh **Python 3.11+**. Node 20+ hanya diperlukan untuk menjalankan uji JavaScript.

```bash
cd backend
python -m venv .venv
.venv\Scriptsctivate           # Windows  (Linux/Mac: source .venv/bin/activate)
pip install -e ".[dev]"
uvicorn app.main:app --reload    # buka http://localhost:8000
```

Langkah pertama di aplikasi:
1. Buka tab **Guru** → "Belum punya akun? Daftar" → buat akun (nama pengguna + PIN).
2. Buat kelas. Aplikasi memberi **kode kelas** 6 huruf.
3. Siswa membuka aplikasi, memilih tab **Siswa**, lalu memasukkan kode kelas dan nama panggilan.

Mencoba di HP (satu Wi-Fi dengan laptop): `uvicorn app.main:app --host 0.0.0.0`, lalu buka
`http://<IP-laptop>:8000` di browser HP. Catatan: fitur offline/PWA di HP baru aktif lewat **HTTPS**
(misalnya setelah deploy ke Render/Railway/PythonAnywhere); lewat `http://IP` aplikasi tetap berjalan normal.

Saat deploy ke HTTPS, set variabel lingkungan `KPK_COOKIE_SECURE=1`. Lokasi basis data dapat diatur dengan
`KPK_DATABASE_URL` (bawaan: `backend/data.db`).

## Uji

```bash
cd backend && pytest                 # 67 uji: logika KPK, mesin penilaian, API
cd frontend && node --test tests/    # 43 uji: logika KPK, pemeriksa langkah, antrean offline
cd backend && ruff check .
```

## Status

Fase 1–6 selesai (lihat [Roadmap](docs/05-ROADMAP.md)). Berikutnya: validasi instrumen oleh dosen/guru, uji di HP
Android sungguhan, uji coba dengan siswa, lalu deploy.
