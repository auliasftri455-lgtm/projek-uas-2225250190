# 04 — Arsitektur Teknis (Python + JavaScript)

## 1. Ringkasan Teknologi

| Lapisan | Bahasa / Teknologi | Peran |
|---|---|---|
| Backend | **Python 3.11+**, FastAPI, Uvicorn | API, mesin penilaian (scoring) otoritatif, bank soal, ekspor CSV |
| Basis data | SQLite melalui SQLAlchemy 2.x | Pengguna, kelas, sesi tes, jawaban per tahap, log aktivitas |
| Validasi | Pydantic v2 | Skema permintaan/respons API |
| Frontend | **JavaScript** (ES Modules, tanpa framework), HTML, CSS | Antarmuka mobile-first, layar langkah, visual SVG, catatan |
| Offline | Service Worker + Web App Manifest (PWA), localStorage | Materi dan latihan tetap jalan offline, antrean sinkronisasi jawaban |
| Uji Python | pytest, httpx (TestClient) | Uji logika KPK, penilaian, dan API |
| Uji JavaScript | `node --test` (Node 20+) | Uji logika KPK di sisi klien dan pemeriksa langkah |
| Kualitas kode | ruff (Python), Prettier (JS) | Format dan lint |

**Alasan pemilihan.** Python menjadi sumber kebenaran untuk penilaian karena skor dipakai untuk penelitian dan harus
konsisten serta mudah diuji. JavaScript dipakai di sisi klien agar umpan balik per langkah **instan dan tetap jalan
offline**, sehingga siswa tidak menunggu jaringan (menunggu juga menambah beban). Tanpa framework dan tanpa *build
step*, proyek tetap ringan dan mudah dipahami mahasiswa.

## 2. Pembagian Tanggung Jawab Python vs JavaScript

| Tugas | JavaScript (klien) | Python (server) |
|---|---|---|
| Menghitung KPK/FPB/faktorisasi | ✔ (umpan balik instan) | ✔ (otoritatif) |
| Memeriksa jawaban latihan | ✔ penuh, offline | Hanya mencatat log |
| Memeriksa jawaban **tes** | Hanya simpan jawaban, **tidak** menampilkan kunci | ✔ Menilai skor tiap tahap + *error carried forward* |
| Menyimpan kunci tes | ✘ (kunci tidak dikirim ke klien) | ✔ |
| Catatan digital | ✔ localStorage (lokal, per pengguna) | — |
| Dasbor guru & ekspor | Tampilan | ✔ Agregasi & CSV |

Agar logika KPK di kedua bahasa tidak berbeda, digunakan **vektor uji bersama** `shared/test_vectors/kpk.json`, yang
dibaca oleh pytest **dan** `node --test`. Kedua implementasi wajib lulus vektor yang sama.

## 3. Struktur Folder

```
projek-uas-aulia/
├── README.md · CLAUDE.md · .gitignore
├── docs/                         # 01–05 dokumen perencanaan
├── backend/                      # Python
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py               # create_app(): API di /api, frontend statis di /
│   │   ├── config.py             # KPK_DATABASE_URL, KPK_COOKIE_SECURE
│   │   ├── db.py · models.py · schemas.py
│   │   ├── auth.py               # cookie token, hash PIN, dependensi siswa/guru
│   │   ├── layanan.py            # menilai sesi, rekap skor, hitung log
│   │   ├── routers/
│   │   │   ├── masuk.py          # masuk siswa/guru, daftar guru, saya, keluar
│   │   │   ├── soal.py           # soal tes (tanpa kunci), diagnostik, latihan
│   │   │   ├── tes.py            # mulai, jawab, selesai, riwayat, log aktivitas
│   │   │   └── guru.py           # kelas, hasil, penilaian teks, ekspor CSV
│   │   └── core/
│   │       ├── kpk.py            # faktorisasi, kpk, fpb, daftar_kelipatan
│   │       ├── penilaian.py      # mesin skor per tahap + error carried forward
│   │       └── bank_soal.py      # memuat & memvalidasi JSON soal
│   └── tests/                    # test_kpk.py, test_penilaian.py, test_api.py
├── frontend/                     # JavaScript (ES Modules, tanpa build)
│   ├── index.html · manifest.webmanifest · sw.js · package.json
│   ├── css/tokens.css · css/app.css
│   ├── js/
│   │   ├── main.js               # router hash
│   │   ├── layout.js             # kepala halaman & menu bawah
│   │   ├── api.js                # fetch + antrean offline + log aktivitas
│   │   ├── store.js              # localStorage per pengguna
│   │   ├── ui.js                 # pembuat elemen DOM (textContent, aman XSS)
│   │   ├── kpk.js                # KEMBARAN core/kpk.py
│   │   ├── pemeriksa.js          # pemeriksa langkah latihan (umpan balik letak kesalahan)
│   │   ├── latihan-gen.js        # pembuat soal level 1–5
│   │   ├── components/           # komponen.js, isian.js, visual.js, catatan.js
│   │   └── views/                # masuk, beranda, diagnostik, belajar, latihan, tes, catatan, progres, guru
│   ├── assets/ikon.svg
│   └── tests/                    # kpk.test.js, pemeriksa.test.js, api.test.js
└── shared/
    ├── soal/soal_literasi.json · diagnostik.json · latihan.json
    └── test_vectors/kpk.json     # dibuat dari math.lcm/math.gcd Python
```

## 4. Model Data

```
Kelas(id, kode_unik, nama, guru_id)
Pengguna(id, peran[siswa|guru], nama_panggilan, kode_siswa, kelas_id, pin_hash?)
SesiTes(id, siswa_id, jenis[pre|post], mulai, selesai)
JawabanTahap(id, sesi_id, soal_no, tahap_no, isian_json, skor_otomatis?, skor_guru?, komentar_guru?, perlu_dinilai_guru)
LogAktivitas(id, siswa_id, jenis[petunjuk|buka_catatan|latihan|diagnostik], data_json, waktu)
```

Skor akhir per tahap = `skor_guru` jika ada, jika tidak `skor_otomatis`. Skor indikator = jumlah skor tahap soal
tersebut (maks 6). Total = jumlah 4 indikator (maks 24).

## 5. Format Bank Soal (`shared/soal/soal_literasi.json`)

```json
{
  "no": 3,
  "indikator": "EM",
  "judul": "Menumpuk Kardus Perpustakaan",
  "teks": "Petugas perpustakaan menumpuk kardus ...",
  "sorotan": [{"teks": "18 cm", "warna": "a"}, {"teks": "24 cm", "warna": "b"}],
  "tahap": [
    {"no": 1, "skor_maks": 1, "tipe": "pilihan",
     "instruksi": "Konsep apa yang dipakai?",
     "opsi": ["KPK(18, 24)", "FPB(18, 24)", "18 × 24"], "kunci": 0},
    {"no": 2, "skor_maks": 2, "tipe": "faktorisasi_kpk",
     "instruksi": "Faktorkan 18 dan 24, lalu tentukan KPK-nya.",
     "bilangan": [18, 24],
     "rubrik": [{"poin": 1, "cek": "faktorisasi_benar"}, {"poin": 1, "cek": "kpk_benar"}]},
    {"no": 3, "skor_maks": 2, "tipe": "angka_ganda",
     "instruksi": "Berapa kardus merah, biru, dan totalnya?",
     "rubrik": [{"poin": 1, "cek": "bagi_dari_tahap", "ref": "2.kpk", "pembagi": [18, 24]},
                {"poin": 1, "cek": "jumlah_konsisten"}]},
    {"no": 4, "skor_maks": 1, "tipe": "kesimpulan",
     "rubrik": [{"poin": 1, "cek": "konsisten_dengan", "ref": ["2.kpk", "3.total"]}]}
  ]
}
```

Kunci dan rubrik **tidak pernah** dikirim ke klien. Endpoint `GET /api/soal/tes` mengembalikan teks, sorotan, instruksi,
dan opsi saja.

## 6. Mesin Penilaian (`core/penilaian.py`)

- Setiap `cek` adalah fungsi murni `cek(isian, konteks) -> bool`. `konteks` berisi isian tahap-tahap sebelumnya.
- **Error carried forward:** cek bertipe `*_dari_tahap` / `konsisten_dengan` menghitung kunci **berdasarkan isian siswa
  di tahap sebelumnya**, bukan kunci global. Contoh: jika siswa menulis KPK = 36 (salah), lalu 36 : 18 = 2 dan
  36 : 24 = 1,5, cek "bagi_dari_tahap" memeriksa pembagian terhadap 36.
- Tahap bertipe `teks_alasan` mendapat `perlu_dinilai_guru = True`. Jika siswa memilih opsi alasan yang benar, skor
  otomatis diberikan dan guru hanya perlu mengonfirmasi.
- Normalisasi isian: hapus spasi, terima "07.24", "7.24", "07:24"; terima "2 Oktober" tanpa tahun; abaikan huruf besar
  atau kecil.

## 7. API (ringkas)

| Metode & Path | Fungsi |
|---|---|
| `POST /api/masuk/siswa` | `{kode_kelas, nama_panggilan}` → token sesi |
| `POST /api/masuk/guru` · `POST /api/daftar/guru` | `{nama_pengguna, pin}` → token sesi |
| `GET /api/soal/diagnostik` · `/latihan?level=` · `/tes` | Ambil soal (tanpa kunci untuk tes) |
| `POST /api/tes/mulai` | `{jenis: "pre"|"post"}` → `sesi_id` |
| `POST /api/tes/{sesi_id}/jawab` | `{soal_no, tahap_no, isian}` → `{tersimpan: true}` (skor tidak ditampilkan saat tes) |
| `POST /api/tes/{sesi_id}/selesai` | Menutup sesi dan menghitung skor |
| `POST /api/log` | Batch log aktivitas (petunjuk, catatan) |
| `GET /api/guru/kelas/{id}/hasil` | Rekap skor per indikator |
| `PATCH /api/guru/jawaban/{id}` | `{skor_guru, komentar}` |
| `GET /api/guru/kelas/{id}/ekspor.csv` | CSV untuk penelitian |

Autentikasi: token acak di cookie `HttpOnly`. Siswa cukup kode kelas + nama panggilan (nama yang sama di kelas yang sama = siswa yang sama, agar bisa melanjutkan dari HP lain). Guru memakai nama pengguna + PIN (di-hash PBKDF2). Endpoint lain: `GET /api/saya`, `POST /api/keluar`, `GET /api/tes/riwayat`, `GET /api/guru/kelas/{id}/penilaian`.

## 8. Offline & Sinkronisasi

1. `sw.js` melakukan pre-cache untuk HTML, CSS, JS, ikon, dan `/api/soal/*` (soal publik tanpa kunci).
2. Strategi **jaringan dulu**: bila online, siswa selalu mendapat versi terbaru. Bila offline atau jaringan lambat
   (> 3 detik), versi cache dipakai. API lain (data pribadi) tidak pernah di-cache.
3. Naikkan konstanta `VERSI` di `sw.js` setiap kali berkas frontend berubah.
4. Jawaban tes dan log aktivitas ditulis ke antrean (localStorage) lalu dikirim **berurutan**, sehingga jawaban lama
   tidak menimpa jawaban baru. Antrean dikirim ulang saat `online` dan sebelum tes dikumpulkan.
5. Tes **membutuhkan** koneksi saat mulai dan saat mengumpulkan. Di antaranya siswa dapat bekerja offline.
6. Catatan pribadi, progres latihan, dan hasil diagnostik disimpan per perangkat (localStorage); ringkasannya
   juga dikirim ke server sebagai log aktivitas.

## 9. Menjalankan & Deploy

- **Lokal:** `uvicorn app.main:app --reload` dari folder `backend/`. FastAPI menyajikan `frontend/` sebagai file statis,
  sehingga cukup satu server.
- **Uji di HP (satu jaringan Wi-Fi):** `uvicorn app.main:app --host 0.0.0.0`, lalu buka `http://<IP-laptop>:8000`.
- **Deploy:** PythonAnywhere, Render, atau Railway (paket gratis). Service worker dan PWA memerlukan **HTTPS**,
  yang sudah disediakan oleh layanan tersebut.
