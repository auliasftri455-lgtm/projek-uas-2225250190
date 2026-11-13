// Tes mathematical literacy (fitur F8). Soal dari 01-SOAL-LATIHAN disajikan per tahap.
// Tidak ada umpan balik benar/salah selama tes; penilaian hanya di server (Python).

import { ApiError, ambilDenganCadangan, api, catatLog, kirimAntrean, kirimAtauAntre } from '../api.js';
import { bukaPanelCatatan } from '../components/catatan.js';
import { NAMA_BULAN, isianKosong, isianUntukTahap } from '../components/isian.js';
import { bilahSkor, kartuSoal, posisiLangkah, ringkasanLangkah, skalaBeban } from '../components/komponen.js';
import { formatFaktorisasi } from '../kpk.js';
import { atur, pergi } from '../layout.js';
import { parseFaktorisasi } from '../pemeriksa.js';
import { bacaSaya, tulisSaya } from '../store.js';
import { h, pesanGalat, tombol } from '../ui.js';

export const NAMA_INDIKATOR = {
  MR: 'Penalaran (Reasoning)',
  FS: 'Merumuskan (Formulating)',
  EM: 'Menggunakan prosedur (Employing)',
  IE: 'Menafsirkan & menilai (Interpreting)',
};

const JENIS = { pre: 'Tes awal (pretest)', post: 'Tes akhir (posttest)' };

/** Ringkasan isian satu tahap dalam satu baris, untuk RingkasanLangkah. */
export function ringkasTes(tahap, isian) {
  if (isianKosong(isian)) return '(belum diisi)';
  const v = isian;
  switch (tahap.tipe) {
    case 'pilihan':
    case 'hari':
      return tahap.opsi[v.pilih] ?? '(belum diisi)';
    case 'centang':
      return v.pilih.map((i) => tahap.opsi[i]).join('; ');
    case 'faktorisasi_kpk': {
      const cara =
        v.cara === 'kelipatan'
          ? tahap.bilangan.map((n) => `kelipatan ${n}: ${v.kelipatan?.[n] || '…'}`)
          : tahap.bilangan.map((n) => `${n} = ${formatFaktorisasi(parseFaktorisasi(v.faktor?.[n]) || {})}`);
      return `${cara.join('; ')}; ${tahap.label_kpk || 'KPK ='} ${v.kpk || '…'}`;
    }
    case 'urutkan':
      return v.urutan.join(' < ');
    case 'kesimpulan':
      return tahap.opsi_keputusan[v.keputusan] ?? '(keputusan belum dipilih)';
    case 'angka_ganda':
      return tahap.medan.map((m) => `${m.label}: ${v.medan?.[m.id] || '…'}`).join('; ');
    case 'tanggal':
      return `${v.tanggal || '…'} ${NAMA_BULAN[(v.bulan || 0) - 1] || '…'} ${tahap.tahun}`;
    case 'waktu':
      return `Pukul ${v.waktu}`;
    default:
      return '';
  }
}

function rekapSkor(r) {
  return h('div', {},
    h('div', { class: 'kartu tengah' },
      h('p', { class: 'muted', style: { margin: 0 } }, JENIS[r.jenis] || r.jenis),
      h('p', { style: { fontSize: '2.4rem', fontWeight: 700, margin: 0 }, class: 'angka' }, `${r.total} / ${r.total_maks}`),
    ),
    h('div', { class: 'kartu' },
      h('h3', {}, 'Skor per kemampuan'),
      Object.entries(r.skor).map(([k, v]) => bilahSkor(NAMA_INDIKATOR[k] || k, v, 6)),
      r.menunggu_guru ? h('p', { class: 'kecil muted' }, `${r.menunggu_guru} penjelasanmu akan diperiksa guru, jadi skor bisa berubah sedikit.`) : null,
    ),
  );
}

export async function viewTes() {
  atur({ judul: 'Tes kemampuan', rute: 'tes', kembali: '#/beranda' });
  const aktif = bacaSaya('tes_aktif');
  const galat = h('div');
  const mulai = async (jenis) => {
    galat.replaceChildren();
    try {
      const r = await api('/tes/mulai', { method: 'POST', body: { jenis } });
      const lokal = bacaSaya('tes_aktif');
      const jawaban = r.jawaban || {};
      // Jawaban lokal yang belum terkirim lebih baru daripada salinan server.
      if (lokal?.sesi_id === r.sesi_id) {
        for (const [no, t] of Object.entries(lokal.jawaban || {})) jawaban[no] = { ...(jawaban[no] || {}), ...t };
      }
      tulisSaya('tes_aktif', { sesi_id: r.sesi_id, jenis, jawaban, posisi: lokal?.sesi_id === r.sesi_id ? lokal.posisi : 0 });
      pergi('#/tes/kerjakan');
    } catch (e) {
      galat.replaceChildren(pesanGalat(e.status === 0 ? 'Untuk memulai tes, HP harus tersambung ke internet. Setelah mulai, kamu bisa melanjutkan walau sinyal hilang.' : e.message));
    }
  };

  const riwayat = h('div');
  api('/tes/riwayat')
    .then((daftar) => {
      if (!daftar?.length) return;
      riwayat.replaceChildren(h('h2', { style: { marginTop: '24px' } }, 'Hasil tesmu'), ...daftar.map(rekapSkor));
    })
    .catch(() => {});

  return h('div', {},
    h('div', { class: 'kartu' },
      h('h2', {}, 'Tentang tes ini'),
      h('ul', {},
        h('li', {}, '4 soal cerita tentang KPK. Setiap soal dikerjakan per tahap, satu tahap per layar.'),
        h('li', {}, 'Tidak ada batas waktu. Kerjakan dengan tenang.'),
        h('li', {}, 'Selama tes, tidak ada tanda benar/salah. Hasil muncul setelah kamu mengumpulkan.'),
        h('li', {}, 'Jawaban tersimpan otomatis setiap kamu menekan "Simpan & lanjut".'),
        h('li', {}, 'Kamu boleh membuka Catatan.'),
      ),
    ),
    galat,
    aktif
      ? h('div', { class: 'kartu' }, h('p', {}, `Kamu punya ${JENIS[aktif.jenis]} yang belum selesai.`), tombol('Lanjutkan tes →', () => mulai(aktif.jenis), { varian: 'utama penuh' }))
      : h('div', { class: 'baris-tombol' }, tombol('Mulai tes awal', () => mulai('pre'), { varian: 'utama' }), tombol('Mulai tes akhir', () => mulai('post'))),
    riwayat,
  );
}

export async function viewTesKerjakan() {
  const aktif = bacaSaya('tes_aktif');
  if (!aktif) {
    pergi('#/tes');
    return h('div');
  }
  atur({ judul: JENIS[aktif.jenis], kembali: '#/tes', nav: false });
  const data = await ambilDenganCadangan('/soal/tes');
  const urutan = data.soal.flatMap((soal) => soal.tahap.map((tahap) => ({ soal, tahap })));
  const wadah = h('div');
  const ambil = (no, t) => aktif.jawaban?.[no]?.[t];

  const simpan = (soal, tahap, nilai) => {
    if (isianKosong(nilai) && isianKosong(ambil(soal.no, tahap.no))) return;
    aktif.jawaban[soal.no] = { ...(aktif.jawaban[soal.no] || {}), [tahap.no]: nilai };
    tulisSaya('tes_aktif', aktif);
    kirimAtauAntre(`/tes/${aktif.sesi_id}/jawab`, { soal_no: soal.no, tahap_no: tahap.no, isian: nilai });
  };
  const pindah = (i) => {
    aktif.posisi = i;
    tulisSaya('tes_aktif', aktif);
    i < urutan.length ? layar(i) : tinjau();
  };

  function layar(i) {
    const { soal, tahap } = urutan[i];
    const isian = isianUntukTahap(tahap);
    isian.isi(ambil(soal.no, tahap.no));
    const sebelumnya = soal.tahap.filter((t) => t.no < tahap.no).map((t) => ({ teks: `Tahap ${t.no}: ${ringkasTes(t, ambil(soal.no, t.no))}` }));

    wadah.replaceChildren(
      ...posisiLangkah(`Soal ${soal.no} dari ${data.soal.length}`, `Tahap ${tahap.no} dari ${soal.tahap.length}`, i / urutan.length),
      kartuSoal({ judul: `Soal ${soal.no}: ${soal.judul}`, teks: soal.teks, sorotan: soal.sorotan }),
      ringkasanLangkah(sebelumnya, 'Jawabanmu sebelumnya'),
      h('p', { class: 'instruksi' }, tahap.instruksi),
      isian.el,
      h('div', { class: 'baris-tombol' }, tombol('📒 Catatan', () => bukaPanelCatatan('tes'), { varian: 'kecil' })),
      h('div', { class: 'baris-tombol' },
        i > 0 ? tombol('← Sebelumnya', () => { simpan(soal, tahap, isian.nilai()); pindah(i - 1); }) : null,
        tombol('Simpan & lanjut →', () => { simpan(soal, tahap, isian.nilai()); pindah(i + 1); }, { varian: 'utama' }),
      ),
    );
    window.scrollTo(0, 0);
  }

  function tinjau() {
    const galat = h('div');
    let kosong = 0;
    const baris = data.soal.map((soal) => {
      const terisi = soal.tahap.filter((t) => !isianKosong(ambil(soal.no, t.no))).length;
      kosong += soal.tahap.length - terisi;
      const iPertama = urutan.findIndex((u) => u.soal.no === soal.no && isianKosong(ambil(soal.no, u.tahap.no)));
      return h('li', { style: { marginBottom: '8px' } },
        `Soal ${soal.no}: ${terisi} dari ${soal.tahap.length} tahap terisi `,
        iPertama >= 0 ? h('button', { type: 'button', class: 'tombol kecil', onclick: () => pindah(iPertama) }, 'Isi') : '✓',
      );
    });
    const kumpul = tombol('Kumpulkan tes', async () => {
      if (kosong && !confirm(`Masih ada ${kosong} tahap kosong. Tetap kumpulkan?`)) return;
      kumpul.disabled = true;
      galat.replaceChildren();
      try {
        const terkirim = await kirimAntrean();
        if (!terkirim) throw new ApiError(0, 'Masih ada jawaban yang belum terkirim.');
        const rekap = await api(`/tes/${aktif.sesi_id}/selesai`, { method: 'POST' });
        tulisSaya('tes_aktif', null);
        hasil(rekap);
      } catch (e) {
        kumpul.disabled = false;
        galat.replaceChildren(pesanGalat(e.status === 0 ? 'Tidak ada internet. Jawabanmu aman tersimpan di HP. Sambungkan internet lalu tekan "Kumpulkan tes" lagi.' : e.message));
      }
    }, { varian: 'utama penuh' });

    wadah.replaceChildren(
      ...posisiLangkah('Periksa sebelum mengumpulkan', '', 1),
      h('div', { class: 'kartu' }, h('h2', {}, 'Ringkasan jawaban'), h('ul', { style: { paddingLeft: '20px' } }, baris)),
      galat,
      h('div', { class: 'baris-tombol' }, tombol('← Kembali ke soal terakhir', () => pindah(urutan.length - 1))),
      h('div', { style: { marginTop: '12px' } }, kumpul),
    );
    window.scrollTo(0, 0);
  }

  function hasil(rekap) {
    atur({ judul: 'Hasil tes', kembali: '#/beranda', nav: false });
    const terima = h('p', { class: 'kecil muted', 'aria-live': 'polite' });
    wadah.replaceChildren(
      h('h2', {}, 'Tes selesai! 🎉'),
      rekapSkor(rekap),
      skalaBeban((nilai) => {
        catatLog('beban', { asal: 'tes', jenis: rekap.jenis, nilai });
        terima.textContent = 'Terima kasih!';
      }),
      terima,
      h('a', { class: 'tombol utama penuh', href: '#/beranda' }, 'Ke beranda'),
    );
    window.scrollTo(0, 0);
  }

  pindah(Math.min(aktif.posisi || 0, urutan.length));
  return wadah;
}
