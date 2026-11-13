# 03 — Desain UI/UX

## 1. Prinsip Desain (Cognitive Load Theory → Aturan Antarmuka)

| Prinsip CLT | Aturan antarmuka yang **wajib** diikuti |
|---|---|
| **Segmentasi** | Satu langkah = satu layar. Satu layar hanya punya satu tugas utama dan satu tombol aksi utama |
| **Worked example → fading** | Materi dimulai dari contoh lengkap, lalu contoh dengan 1–2 langkah kosong, lalu soal mandiri |
| **Signaling** | Bilangan penting dalam soal cerita diberi sorotan warna yang sama dengan tempat bilangan itu dipakai |
| **Hindari split-attention** | Soal cerita selalu terlihat (dapat dilipat) di atas layar langkah, sehingga siswa tidak perlu bolak-balik halaman |
| **Redundansi** | Tidak ada animasi hiasan, maskot yang berbicara, atau suara latar. Animasi hanya untuk menunjukkan proses (misalnya garis waktu yang berjalan) |
| **Ringkasan kerja** | Langkah yang sudah selesai tampil sebagai baris ringkas ("✓ 8 = 2³") agar tidak perlu diingat |
| **Pre-training** | Istilah (kelipatan, faktor, prima, KPK, FPB) dikenalkan dulu lewat diagnostik dan kartu istilah |

## 2. Peta Layar

```
[Masuk: kode kelas + nama]
        │
        ▼
[Diagnostik Prasyarat] ──(pertama kali saja)
        │
        ▼
[Beranda] ── Belajar ── Latihan ── Tes ── Catatan ── Progres
   │            │          │        │        │          │
   │            ▼          ▼        ▼        ▼          ▼
   │      [Materi KPK] [Level 1–5] [Tes ML] [Catatan] [Ringkasan
   │       contoh       petunjuk    4 soal   digital    indikator]
   │       visual       bertahap    per tahap
   │
[Guru] ── Kelas ── Hasil Siswa ── Penilaian Teks ── Ekspor CSV
```

## 3. Rancangan Layar Utama (wireframe, lebar 360 px)

### 3.1 Layar langkah (dipakai di Latihan dan Tes)

```
┌──────────────────────────────┐
│ ← Soal 3 · Tahap 2 dari 4    │  ← indikator posisi
│ ▓▓▓▓▓▓▓░░░░░░░░              │
├──────────────────────────────┤
│ ▾ Soal (ketuk untuk lipat)   │
│ Kardus merah [18 cm], kardus │  ← bilangan disorot
│ biru [24 cm] ...             │
├──────────────────────────────┤
│ Sudah selesai:               │
│ ✓ Yang dicari: KPK(18, 24)   │  ← ringkasan kerja
├──────────────────────────────┤
│ Faktorkan 18 dan 24.         │  ← SATU instruksi
│                              │
│  18 = 2^[ ] × 3^[ ]          │
│  24 = 2^[ ] × 3^[ ]          │
│                              │
│ [💡 Petunjuk]   [📒 Catatan] │
│                              │
│ [        Periksa         ]   │  ← satu tombol utama
└──────────────────────────────┘
```

### 3.2 Umpan balik (fitur F5)

- **Benar:** pita hijau berisi alasan singkat, misalnya "Benar. 72 habis dibagi 18 dan 24, dan tidak ada yang lebih
  kecil."
- **Salah:** pita jingga (bukan merah, agar siswa tidak cemas), satu kalimat yang menunjukkan **di mana** kesalahannya,
  dan tombol "Coba lagi" atau "Lihat petunjuk". Jangan langsung tampilkan kunci jawaban.
- **Periksa kewajaran:** tombol sekunder yang meminta siswa mengecek sendiri ("Apakah 72 : 18 hasilnya bulat?").

### 3.3 Visual konkret (fitur F4)

- **Garis waktu kelipatan:** dua atau tiga baris titik (misalnya setiap 8 dan setiap 12). Titik yang bertemu pertama
  kali menyala. Dipakai untuk soal lampu, jadwal, dan lintasan.
- **Pohon faktor:** siswa mengetuk bilangan untuk membaginya. Bilangan prima berubah menjadi lingkaran berwarna.
- **Tabel pembagian (cara sengkedan):** baris demi baris, satu baris per ketukan.

### 3.4 Latihan bertingkat (fitur F7)

| Level | Isi | Bantuan |
|---|---|---|
| 1 | KPK dua bilangan kecil (≤ 12) dengan daftar kelipatan | Garis waktu tampil |
| 2 | KPK dua bilangan dengan faktorisasi prima | Pohon faktor terbimbing |
| 3 | KPK tiga bilangan | Petunjuk bertahap |
| 4 | Soal cerita pendek (pilih KPK atau FPB) | Penyorotan informasi |
| 5 | Soal cerita dengan informasi tidak relevan | Tanpa sorotan, petunjuk tetap ada |

Bintang: ★★★ tanpa petunjuk, ★★ dengan 1 petunjuk, ★ dengan ≥ 2 petunjuk. **Tidak ada** batas waktu atau nyawa, karena
tekanan waktu menambah beban kognitif.

## 4. Sistem Visual

### 4.1 Warna (token CSS)

| Token | Terang | Gelap | Fungsi |
|---|---|---|---|
| `--bg` | `#FAFAF7` | `#16181D` | Latar |
| `--surface` | `#FFFFFF` | `#20232A` | Kartu |
| `--text` | `#1F2328` | `#E8E6E1` | Teks utama |
| `--muted` | `#5B616B` | `#A3A8B0` | Teks sekunder |
| `--primary` | `#2457C5` | `#7DA2FF` | Tombol utama, tautan |
| `--ok` | `#1F7A4D` | `#5BC08A` | Benar |
| `--warn` | `#B85C00` | `#F0A04B` | Perlu dicoba lagi |
| `--hl-a` | `#FFE08A` | `#6B5A1E` | Sorotan bilangan pertama |
| `--hl-b` | `#BFE3FF` | `#1E4A6B` | Sorotan bilangan kedua |
| `--hl-c` | `#D9F2C7` | `#2C5220` | Sorotan bilangan ketiga |

Warna sorotan tidak menjadi satu-satunya penanda. Bilangan juga diberi garis bawah dan label (a, b, c) untuk siswa
dengan buta warna.

### 4.2 Tipografi

- Huruf: **Atkinson Hyperlegible** (mudah dibaca, angka jelas), cadangan `system-ui`.
- Ukuran dasar 16 px; soal 17 px; bilangan pada langkah 20 px tebal.
- Angka memakai `font-variant-numeric: tabular-nums` agar kolom pembagian rapi.
- Pangkat ditulis dengan `<sup>`, perkalian dengan "×" (bukan "x" atau "*"), pembagian dengan ":".

### 4.3 Komponen

| Komponen | Keterangan |
|---|---|
| `KartuSoal` | Soal cerita yang dapat dilipat, dengan sorotan bilangan |
| `RingkasanLangkah` | Daftar langkah yang sudah selesai |
| `IsianAngka` | Input `inputmode="numeric"` agar keyboard angka muncul di HP |
| `IsianPangkat` | Basis dan pangkat untuk faktorisasi prima |
| `PilihanAlasan` | Pilihan ganda alasan + kotak teks opsional |
| `GarisWaktu` | SVG titik kelipatan |
| `PohonFaktor` | SVG interaktif |
| `PitaUmpanBalik` | Benar/salah + alasan |
| `TombolPetunjuk` | Membuka petunjuk 1 → 2 → 3 berurutan |

## 5. Aksesibilitas & Perangkat

- Target sentuh minimal 44 × 44 px, dengan jarak antartombol ≥ 8 px.
- Semua visual SVG memiliki `aria-label` yang menjelaskan isi (misalnya "Kelipatan 8: 8, 16, 24").
- Mendukung `prefers-reduced-motion`: garis waktu langsung tampil tanpa animasi.
- Mendukung tema gelap mengikuti pengaturan HP.
- Input tidak memicu zoom di iOS (ukuran huruf input ≥ 16 px).
