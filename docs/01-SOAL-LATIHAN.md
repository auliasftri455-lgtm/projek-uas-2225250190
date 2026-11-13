# 01 — Soal Latihan & Kisi-kisi Jawaban (Instrumen Mathematical Literacy)

> **Materi:** Kelipatan Persekutuan Terkecil (KPK) — Kelas VII SMP (diuji pada siswa kelas VIII)
> **Jumlah soal:** 4 soal uraian, 1 soal per indikator
> **Skor maksimum:** 24
> **Alur konstruk:** Mathematical Reasoning → Formulating → Employing → Interpreting & Evaluating

Berkas ini adalah **Tabel 2** dari dokumen kisi-kisi. Soal ini juga menjadi **sumber data utama** untuk bank soal aplikasi
(`shared/soal/soal_literasi.json`, lihat [04-ARSITEKTUR.md](04-ARSITEKTUR.md)). Jika soal di sini berubah, berkas JSON
dan uji otomatisnya juga harus diperbarui.

Setiap soal sengaja menyasar temuan wawancara S01:

| Soal | Temuan wawancara yang disasar |
|---|---|
| 1 | "Mencari rumus yang bener" (IL02): siswa harus membedakan *kelipatan persekutuan* dan *KPK*, bukan asal mengalikan |
| 2 | Soal cerita panjang (EL05): ada informasi yang **tidak relevan** yang harus disaring |
| 3 | "Susah ngitung-ngitungnya" (K01): prosedur faktorisasi prima dipecah per tahap |
| 4 | Memeriksa jawaban dengan bertanya ke guru (GL02): siswa harus **menilai sendiri** apakah jawaban orang lain masuk akal |

---

## Tabel 2. Soal dan Kisi-kisi Jawaban

### Soal 1 — Mathematical Reasoning

**Indikator:** Siswa mampu mengidentifikasi hubungan matematis, membandingkan alternatif, memberikan alasan, dan
menentukan keputusan yang dapat dipertanggungjawabkan.

**Soal — Lampu Hias Pentas Seni.**
Panggung pentas seni dihiasi dua jenis lampu. Lampu merah menyala setiap **8 detik**, sedangkan lampu biru menyala
setiap **12 detik**. Kedua lampu menyala bersamaan tepat saat acara dimulai (detik ke-0). Tiga siswa berpendapat
tentang kapan kedua lampu **pertama kali** menyala bersamaan lagi:

- Rani: "Detik ke-96, karena 8 × 12 = 96."
- Citra: "Detik ke-48."
- Bima: "Detik ke-24."

**Siapa yang benar? Jelaskan alasan matematis Anda, termasuk mengapa dua jawaban lainnya kurang tepat.**

| Tahap | Kisi-kisi jawaban | Skor |
|---|---|---|
| 1 | Yang ditanyakan adalah waktu **pertama kali** kedua lampu menyala bersamaan lagi. Waktunya harus kelipatan 8 sekaligus kelipatan 12, dan harus yang **terkecil**, jadi yang dicari adalah KPK(8, 12), bukan sembarang kelipatan persekutuan. | 1 |
| 2 | Menghitung KPK. *Cara kelipatan:* 8, 16, **24**, 32, … dan 12, **24**, 36, … → kelipatan persekutuan pertama = 24. *Cara faktorisasi prima:* 8 = 2³, 12 = 2² × 3 → KPK = 2³ × 3 = **24**. (Konsep atau cara tepat = 1, hasil benar = 1) | 2 |
| 3 | Memeriksa jawaban lain: 48 = 24 × 2 dan 96 = 24 × 4. Keduanya juga kelipatan persekutuan, jadi lampu memang menyala bersamaan pada detik itu, tetapi **bukan yang pertama**. | 1 |
| 4 | Membandingkan: 24 < 48 < 96, jadi detik ke-24 adalah saat paling awal. | 1 |
| 5 | Kesimpulan: **Bima benar.** Rani keliru karena 8 × 12 hanya sama dengan KPK jika kedua bilangan tidak memiliki faktor persekutuan selain 1. Di sini 8 dan 12 sama-sama memiliki faktor 4. Citra menemukan kelipatan persekutuan, tetapi bukan yang terkecil. | 1 |
| | **Skor maksimum** | **6** |

---

### Soal 2 — Formulating Situations Mathematically

**Indikator:** Siswa mampu mengidentifikasi informasi relevan, menentukan besaran, dan menerjemahkan situasi nyata
menjadi model matematika.

**Soal — Kiriman Bahan Kantin.**
Kantin sekolah memiliki 3 petugas dan menjual roti seharga Rp3.000 per buah. Kantin menerima kiriman roti setiap
**4 hari**, kiriman susu setiap **6 hari**, dan kiriman buah setiap **10 hari**. Pada hari **Senin, 3 Agustus 2026**,
ketiga kiriman datang bersamaan. Kepala kantin ingin menyiapkan petugas tambahan pada hari ketiga kiriman datang
bersamaan lagi. **Ubahlah situasi ini menjadi model matematika, lalu tentukan hari dan tanggal ketiga kiriman pertama
kali datang bersamaan lagi.**

| Tahap | Kisi-kisi jawaban | Skor |
|---|---|---|
| 1 | Diketahui: roti setiap 4 hari, susu setiap 6 hari, buah setiap 10 hari, datang bersamaan pada Senin, 3 Agustus 2026. Ditanya: hari dan tanggal ketiganya datang bersamaan lagi. Informasi **tidak relevan**: jumlah petugas (3 orang) dan harga roti (Rp3.000). | 1 |
| 2 | Menentukan besaran: misalkan *t* = banyak hari sampai ketiga kiriman datang bersamaan lagi. *t* harus kelipatan 4, 6, dan 10 sekaligus, dan merupakan yang terkecil. | 1 |
| 3 | Model matematika: **t = KPK(4, 6, 10)**. | 1 |
| 4 | Menyelesaikan model: 4 = 2², 6 = 2 × 3, 10 = 2 × 5 → KPK = 2² × 3 × 5 = **60 hari**. | 1 |
| 5 | Menerjemahkan ke tanggal: dari 3 Agustus, sisa bulan Agustus 28 hari (sampai 31 Agustus), ditambah September 30 hari, total 58 hari (30 September). 60 − 58 = 2, jadi tanggalnya **2 Oktober 2026**. | 1 |
| 6 | Menentukan hari: 60 = 8 × 7 + 4, jadi 4 hari setelah Senin adalah **Jumat**. Kesimpulan: ketiga kiriman datang bersamaan lagi pada **Jumat, 2 Oktober 2026**. | 1 |
| | **Skor maksimum** | **6** |

---

### Soal 3 — Employing Mathematical Concepts, Facts, and Procedures

**Indikator:** Siswa mampu memilih serta menggunakan konsep, operasi, prosedur, dan strategi matematika untuk
memperoleh solusi.

**Soal — Menumpuk Kardus Perpustakaan.**
Petugas perpustakaan menumpuk kardus buku menjadi dua tumpukan bersebelahan. Tumpukan pertama hanya berisi kardus merah
setinggi **18 cm**. Tumpukan kedua hanya berisi kardus biru setinggi **24 cm**. Petugas ingin kedua tumpukan memiliki
tinggi yang **sama** dengan tinggi **serendah mungkin**. **Berapa tinggi tumpukan tersebut, dan berapa banyak seluruh
kardus yang dibutuhkan? Tunjukkan langkah perhitungan Anda.**

| Tahap | Kisi-kisi jawaban | Skor |
|---|---|---|
| 1 | Memilih konsep: tinggi tumpukan merah selalu kelipatan 18, dan tinggi tumpukan biru selalu kelipatan 24. Tinggi yang sama dan serendah mungkin adalah **KPK(18, 24)**. | 1 |
| 2 | Menghitung KPK dengan faktorisasi prima: 18 = 2 × 3², 24 = 2³ × 3 → KPK = 2³ × 3² = 8 × 9 = **72 cm**. (Faktorisasi benar = 1, KPK benar = 1) | 2 |
| 3 | Banyak kardus: merah = 72 : 18 = **4 kardus**, biru = 72 : 24 = **3 kardus**, total 4 + 3 = **7 kardus**. (Banyak kardus tiap warna benar = 1, total benar = 1) | 2 |
| 4 | Kesimpulan: tinggi tumpukan **72 cm**, dengan **7 kardus** (4 merah dan 3 biru). | 1 |
| | **Skor maksimum** | **6** |

---

### Soal 4 — Interpreting, Applying, and Evaluating Mathematical Outcomes

**Indikator:** Siswa mampu menafsirkan hasil matematika dalam konteks, menilai kewajaran hasil, dan mengambil keputusan
berdasarkan hasil perhitungan.

**Soal — Berlari di Lintasan Sekolah.**
Ani dan Budi berlari mengelilingi lintasan sekolah. Ani menyelesaikan satu putaran dalam **6 menit**, sedangkan Budi
dalam **8 menit**. Mereka mulai bersamaan dari garis start pada pukul **07.00**. Seorang siswa menghitung FPB(6, 8) = 2,
lalu menyimpulkan bahwa Ani dan Budi akan bertemu lagi di garis start pada pukul **07.02**. **Apakah Anda setuju dengan
kesimpulan tersebut? Tentukan waktu yang tepat dan jelaskan alasan Anda.**

| Tahap | Kisi-kisi jawaban | Skor |
|---|---|---|
| 1 | Menafsirkan hasil: pada menit ke-2, Ani baru berlari 2 dari 6 menit dan Budi baru 2 dari 8 menit. Keduanya belum menyelesaikan satu putaran, jadi **tidak mungkin** berada di garis start. Hasil 07.02 tidak masuk akal. | 1 |
| 2 | Mengenali konsep yang tepat: Ani berada di garis start setiap kelipatan 6 menit, Budi setiap kelipatan 8 menit. Waktu bertemu adalah kelipatan persekutuan terkecil, yaitu **KPK**, bukan FPB. | 1 |
| 3 | Menghitung: 6 = 2 × 3, 8 = 2³ → KPK(6, 8) = 2³ × 3 = **24 menit**. | 1 |
| 4 | Menerapkan ke konteks: 07.00 + 24 menit = **pukul 07.24**. | 1 |
| 5 | Menilai kewajaran: dalam 24 menit, Ani berlari 24 : 6 = 4 putaran dan Budi 24 : 8 = 3 putaran. Keduanya bilangan bulat, jadi mereka memang berada di garis start. | 1 |
| 6 | Keputusan: **tidak setuju**. Siswa tersebut tertukar antara FPB dan KPK. Ani dan Budi bertemu lagi di garis start pada **pukul 07.24**. | 1 |
| | **Skor maksimum** | **6** |

---

## Rekap Skor

| Indikator | Skor maksimum |
|---|---|
| Mathematical Reasoning | 6 |
| Formulating Situations Mathematically | 6 |
| Employing Mathematical Concepts, Facts, and Procedures | 6 |
| Interpreting, Applying, and Evaluating Mathematical Outcomes | 6 |
| **Total** | **24** |

## Pedoman Umum Penskoran

- **Skor penuh** diberikan apabila siswa menunjukkan tahapan penyelesaian yang benar, menggunakan prosedur matematika
  yang tepat, dan memberikan kesimpulan sesuai konteks.
- **Skor parsial** tetap diberikan apabila siswa menunjukkan tahapan berpikir yang benar tetapi melakukan kesalahan
  hitung pada tahap berikutnya (*error carried forward*).
  *Contoh soal 3:* jika siswa benar menghitung KPK = 72 cm tetapi keliru membagi (misalnya 72 : 18 = 3), siswa tetap
  memperoleh skor tahap 1 dan 2. Pada tahap 4, kesimpulan yang konsisten dengan hasil kelirunya tetap mendapat skor.
- Instrumen mengukur **proses** mathematical literacy, bukan hanya ketepatan jawaban akhir.

## Cara Soal Ini Disajikan di Aplikasi

Aplikasi tidak menampilkan soal sebagai satu kotak jawaban besar. Setiap **tahap** pada kisi-kisi menjadi satu layar
dengan satu jenis isian. Dengan begitu, siswa memegang satu langkah dalam satu waktu (mengurangi *intrinsic load*), dan
setiap tahap dapat diberi skor terpisah:

| Jenis tahap | Bentuk isian di aplikasi | Penilaian |
|---|---|---|
| Hasil hitung (KPK, tanggal, jumlah kardus) | Isian angka/teks pendek | Otomatis oleh Python, dengan *error carried forward* |
| Memilih konsep (KPK vs FPB, informasi relevan) | Pilihan ganda atau centang | Otomatis |
| Faktorisasi prima | Pohon faktor interaktif atau isian pangkat | Otomatis |
| Alasan/kesimpulan (tahap 5 soal 1, tahap 6 soal 4) | Pilih alasan + isian teks singkat | Pilihan dinilai otomatis, teks masuk antrean **penilaian guru** |

Rincian kunci, alternatif jawaban yang diterima, dan aturan *error carried forward* per tahap ditulis dalam
`shared/soal/soal_literasi.json` saat fase implementasi (lihat [05-ROADMAP.md](05-ROADMAP.md)).
