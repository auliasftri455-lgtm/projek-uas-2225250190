# 02 — Analisis Kebutuhan & Spesifikasi Fitur

## 1. Latar Belakang

Siswa SMP sering mengalami beban kognitif berlebih saat mengerjakan soal KPK, terutama soal cerita. Akibatnya,
kemampuan *mathematical literacy* (merumuskan, menggunakan, menafsirkan, dan menalar) tidak berkembang optimal.
Aplikasi web ini dirancang dengan prinsip **Cognitive Load Theory (CLT)**:

| Jenis beban | Kode wawancara | Arti | Strategi aplikasi |
|---|---|---|---|
| Intrinsic Load | IL | Kerumitan materi itu sendiri (banyak langkah yang harus dipegang sekaligus) | Segmentasi langkah, diagnostik prasyarat, *worked example* → *faded example* |
| Extraneous Load | EL | Beban akibat cara penyajian yang buruk (rumus abstrak, petunjuk membingungkan) | Visual konkret, informasi penting ditandai, tanpa animasi hiasan |
| Germane Load | GL | Usaha yang membangun skema pemahaman | Cek jawaban mandiri dengan alasan, catatan digital, refleksi |

## 2. Sumber Data

- Wawancara siswa **S01** (kelas VIII SMP, 5 November 2026, durasi 5 menit 50 detik) oleh Aulia Safitri.
- Kisi-kisi instrumen mathematical literacy (4 indikator, skor maksimum 24). Lihat [01-SOAL-LATIHAN.md](01-SOAL-LATIHAN.md).

> **Keterbatasan:** data berasal dari satu siswa, dan sebagian gagasan (visual, game) lebih banyak disampaikan
> pewawancara (DS01). Semua keputusan fitur di bawah bersifat **sementara** dan harus dikonfirmasi lewat uji coba
> (lihat bagian 6).

## 3. Persona Pengguna

**Siswa (pengguna utama).** Kelas VII–VIII SMP, belajar menggunakan smartphone Android dengan layar sekitar 360–414 px
dan kuota terbatas. Siswa merasa "semua" bagian sulit saat salah, bergantung pada rumus, dan memeriksa jawaban dengan
bertanya ke guru.

**Guru (pengguna kedua).** Melihat skor per indikator, menilai jawaban teks (alasan/kesimpulan), dan mengekspor data
untuk analisis penelitian.

**Peneliti (Aulia).** Membutuhkan data skor total dan skor per indikator yang dapat diekspor (CSV) untuk analisis.

## 4. Matriks Temuan → Fitur

| ID | Temuan lapangan | Interpretasi | Fitur | Prioritas |
|---|---|---|---|---|
| F1 | Susah menghitung KPK (K01) | Terlalu banyak langkah dipegang sekaligus (IL) | **Mode Langkah demi Langkah**: satu langkah per layar (daftar kelipatan, pohon faktor, atau tabel pembagian) dengan ringkasan langkah yang sudah selesai di bagian atas | Wajib |
| F2 | Rumus paling sulit, sulit memilih rumus yang benar (IL01, IL02, EL05) | Kesulitan memilih cara (IL), penyajian rumus kurang membantu (EL) | **Pemilih Cara**: tips singkat kapan memakai daftar kelipatan (bilangan kecil) atau faktorisasi prima (bilangan besar/tiga bilangan), serta kartu "KPK atau FPB?" | Wajib |
| F3 | Semua bagian belum dipahami saat salah (IL05) | Prasyarat mungkin belum kuat | **Diagnostik Prasyarat**: 6–9 butir singkat tentang kelipatan, faktor, dan bilangan prima, lalu jalur belajar disesuaikan | Wajib |
| F4 | Guru hanya menjelaskan, petunjuk berupa rumus membingungkan (K02, EL01) | Penyajian kurang konkret (EL) | **Contoh Nyata Visual**: garis waktu/kalender berulang (lampu, jadwal, lintasan) dengan label bilangan | Wajib |
| F5 | Memeriksa jawaban dengan bertanya ke guru (GL02) | Belum ada strategi cek mandiri (GL) | **Cek Jawaban Otomatis** dengan umpan balik singkat dan alasan, serta tombol "Periksa kewajaran" (misalnya: apakah hasil habis dibagi kedua bilangan?) | Wajib |
| F6 | Mencatat di buku sebagai bantuan (GL03) | Catatan berfungsi sebagai rujukan langkah | **Catatan Digital**: ringkasan cara KPK + catatan pribadi siswa, dapat dibuka saat latihan (frekuensi dibuka dicatat) | Wajib |
| F7 | Menyambut aplikasi berbentuk game (DS01) | Preferensi sementara, perlu dikonfirmasi | **Latihan Bertingkat** (level 1–5) dengan bintang dan petunjuk bertahap. Tanpa animasi yang tidak berfungsi | Sebaiknya |
| F8 | Kebutuhan penelitian | Data skor per indikator | **Tes Mathematical Literacy** (4 soal pada 01-SOAL-LATIHAN) dengan skor per tahap, penilaian guru, dan ekspor CSV | Wajib |

## 5. Kebutuhan Fungsional

### 5.1 Siswa
1. Masuk dengan **kode kelas + nama panggilan** (tanpa email, agar ramah untuk siswa SMP).
2. Mengerjakan diagnostik prasyarat saat pertama kali masuk.
3. Mempelajari materi melalui urutan: contoh lengkap (*worked example*) → contoh rumpang (*faded example*) → latihan
   mandiri.
4. Mengerjakan latihan bertingkat dengan petunjuk bertahap (petunjuk 1: arah, petunjuk 2: langkah, petunjuk 3: contoh
   sejenis).
5. Mengerjakan **tes mathematical literacy** (pretest/posttest) per tahap, dengan skor tahap yang otomatis tersimpan.
6. Membuka catatan digital kapan saja.
7. Melihat progres sendiri (level, bintang, indikator yang masih lemah).

### 5.2 Guru / Peneliti
1. Membuat kelas dan membagikan kode kelas.
2. Melihat skor siswa per soal, per tahap, per indikator, dan total.
3. Menilai jawaban teks yang tidak bisa dinilai otomatis (skor 0/1 per tahap + komentar).
4. Mengekspor CSV: `kode_siswa, sesi (pre/post), skor_MR, skor_FS, skor_EM, skor_IE, total, waktu_pengerjaan,
   jumlah_petunjuk, jumlah_buka_catatan`.

## 6. Kebutuhan Non-Fungsional

| Aspek | Target |
|---|---|
| Perangkat | Berjalan di Chrome Android ≥ 90 dan browser desktop. Tata letak *mobile-first* mulai lebar 320 px |
| Kinerja | Muat awal < 3 detik di 3G cepat, ukuran halaman awal < 500 KB |
| Offline | Materi, catatan, dan latihan tetap jalan offline (PWA). Jawaban tes disimpan lokal lalu disinkronkan |
| Aksesibilitas | Kontras teks ≥ 4.5:1, target sentuh ≥ 44 px, huruf dasar ≥ 16 px |
| Bahasa | Bahasa Indonesia yang sederhana, kalimat pendek, satu instruksi per kalimat |
| Privasi | Hanya menyimpan nama panggilan dan kode siswa. Tanpa foto atau nomor HP |

## 7. Indikator Keberhasilan & Cara Menguji

| Fitur | Cara menguji (dari laporan wawancara) |
|---|---|
| F1 | Amati apakah siswa dapat menyelesaikan soal KPK sampai akhir dan apakah langkah yang terlewat berkurang |
| F2 | Minta siswa menjelaskan mengapa memilih cara tertentu setelah memakai fitur |
| F3 | Bandingkan hasil diagnostik dengan jawaban wawancara lanjutan |
| F4 | Wawancarai siswa tentang kejelasan tampilan dan pemahaman setelah memakai fitur |
| F5 | Amati apakah siswa mulai memeriksa jawaban sendiri sebelum bertanya |
| F6 | Catat seberapa sering siswa membuka catatan dan apakah siswa tetap dapat menyelesaikan soal sendiri |
| F7 | Konfirmasi ulang ke siswa, lalu uji keterlibatan dan keterbacaan tampilan |
| F8 | Bandingkan skor pretest dan posttest per indikator |

Tambahan: gunakan angket beban kognitif singkat (skala 1–9, Paas) setelah setiap sesi untuk mengukur beban yang
dirasakan siswa.

## 8. Di Luar Cakupan (versi 1)

- Materi selain KPK (FPB hanya muncul sebagai pembeda konsep).
- Aplikasi Android native (cukup PWA yang dapat "dipasang" dari browser).
- Penilaian otomatis jawaban teks bebas dengan AI.
