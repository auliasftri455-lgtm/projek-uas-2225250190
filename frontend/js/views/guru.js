// Dasbor guru: kelas, hasil per indikator, penilaian penjelasan teks, ekspor CSV.

import { api } from '../api.js';
import { atur, pergi } from '../layout.js';
import { baca, hapus } from '../store.js';
import { buatId, h, pesanGalat, tombol } from '../ui.js';

const SINGKAT = { MR: 'MR', FS: 'FS', EM: 'EM', IE: 'IE' };

function tombolKeluar() {
  return tombol('Keluar', async () => {
    try {
      await api('/keluar', { method: 'POST' });
    } catch {
      /* tetap keluar */
    }
    hapus('saya');
    pergi('#/masuk');
  }, { varian: 'kecil' });
}

export async function viewGuru() {
  const saya = baca('saya');
  atur({ judul: 'Dasbor guru', nav: false, aksi: tombolKeluar() });
  const daftar = await api('/guru/kelas');
  const id = buatId('kelas');
  const nama = h('input', { id, class: 'input', maxlength: 80, placeholder: 'Contoh: VII A', required: true });
  const galat = h('div');
  const form = h('form', {
    class: 'kartu',
    onsubmit: async (e) => {
      e.preventDefault();
      try {
        const k = await api('/guru/kelas', { method: 'POST', body: { nama: nama.value } });
        pergi(`#/guru/kelas/${k.id}`);
      } catch (err) {
        galat.replaceChildren(pesanGalat(err.message));
      }
    },
  },
  h('h2', {}, 'Buat kelas baru'),
  h('label', { class: 'medan', for: id }, h('span', {}, 'Nama kelas'), nama),
  galat,
  h('button', { type: 'submit', class: 'tombol utama' }, 'Buat kelas'));

  return h('div', {},
    h('p', { class: 'muted' }, `Masuk sebagai ${saya.nama}`),
    daftar.length
      ? daftar.map((k) =>
          h('a', { class: 'kartu kartu-menu', href: `#/guru/kelas/${k.id}` },
            h('span', { class: 'ikon', 'aria-hidden': 'true' }, '🏫'),
            h('div', {}, h('h3', {}, k.nama), h('p', {}, `Kode kelas: ${k.kode} · ${k.jumlah_siswa} siswa`)),
          ))
      : h('p', {}, 'Belum ada kelas. Buat kelas, lalu bagikan kodenya ke siswa.'),
    form,
  );
}

export async function viewGuruKelas(idKelas) {
  atur({ judul: 'Kelas', kembali: '#/guru', nav: false, aksi: tombolKeluar() });
  const data = await api(`/guru/kelas/${idKelas}/hasil`);
  atur({ judul: data.kelas.nama, kembali: '#/guru', nav: false, aksi: tombolKeluar() });

  const isi = h('div');
  const tab = {};
  const pilih = async (nama) => {
    Object.entries(tab).forEach(([k, b]) => b.setAttribute('aria-selected', String(k === nama)));
    isi.replaceChildren(h('p', { class: 'muted' }, 'Memuat…'));
    try {
      isi.replaceChildren(nama === 'hasil' ? tabelHasil(data) : await antreanPenilaian(idKelas));
    } catch (e) {
      isi.replaceChildren(pesanGalat(e.message));
    }
  };
  tab.hasil = h('button', { type: 'button', role: 'tab', onclick: () => pilih('hasil') }, 'Hasil');
  tab.nilai = h('button', { type: 'button', role: 'tab', onclick: () => pilih('nilai') }, 'Penilaian');
  pilih('hasil');

  return h('div', {},
    h('div', { class: 'kartu tengah' },
      h('p', { class: 'muted', style: { margin: 0 } }, 'Kode kelas untuk siswa'),
      h('p', { class: 'kode-kelas', style: { margin: 0 } }, data.kelas.kode),
      h('p', { class: 'kecil muted' }, 'Siswa masuk dengan kode ini dan nama panggilan mereka.'),
    ),
    h('div', { class: 'tab', role: 'tablist' }, tab.hasil, tab.nilai),
    isi,
    h('a', { class: 'tombol penuh', href: `/api/guru/kelas/${idKelas}/ekspor.csv`, download: '' }, '⬇ Unduh CSV untuk penelitian'),
    h('p', { class: 'kecil muted' }, 'CSV berisi kode siswa (tanpa nama), skor per indikator, total, waktu pengerjaan, jumlah petunjuk, dan jumlah membuka catatan.'),
  );
}

function tabelHasil(data) {
  const baris = [];
  for (const s of data.siswa) {
    if (!s.sesi.length) {
      baris.push(h('tr', {}, h('td', {}, s.kode_siswa), h('td', {}, s.nama), h('td', { colspan: 7, class: 'muted' }, 'belum ada tes')));
      continue;
    }
    for (const r of s.sesi) {
      baris.push(h('tr', {},
        h('td', {}, s.kode_siswa),
        h('td', {}, s.nama),
        h('td', {}, r.jenis === 'pre' ? 'Pre' : 'Post'),
        Object.keys(SINGKAT).map((k) => h('td', { class: 'angka' }, String(r.skor[k]))),
        h('td', { class: 'angka' }, h('strong', {}, String(r.total))),
        h('td', { class: 'angka' }, r.menunggu_guru ? `⏳ ${r.menunggu_guru}` : '✓'),
      ));
    }
  }
  return h('div', {},
    h('div', { class: 'kartu tabel-wadah' },
      h('table', {},
        h('thead', {}, h('tr', {},
          h('th', {}, 'Kode'), h('th', {}, 'Nama'), h('th', {}, 'Tes'),
          Object.keys(SINGKAT).map((k) => h('th', { class: 'angka', title: data.indikator[k] }, k)),
          h('th', { class: 'angka' }, 'Total'), h('th', { class: 'angka' }, 'Dinilai'),
        )),
        h('tbody', {}, baris.length ? baris : h('tr', {}, h('td', { colspan: 9, class: 'muted' }, 'Belum ada siswa.'))),
      ),
    ),
    h('p', { class: 'kecil muted' }, Object.entries(data.indikator).map(([k, v]) => `${k} = ${v}`).join(' · ') + '. Skor maksimum tiap indikator 6, total 24.'),
  );
}

async function antreanPenilaian(idKelas) {
  const daftar = await api(`/guru/kelas/${idKelas}/penilaian`);
  if (!daftar.length) return h('p', { class: 'muted' }, 'Tidak ada penjelasan teks yang perlu dinilai.');
  return h('div', {},
    h('p', { class: 'muted kecil' }, 'Skor otomatis dihitung dari pilihan keputusan dan alasan. Baca penjelasan siswa, lalu konfirmasi atau ubah skornya.'),
    daftar.map(kartuPenilaian),
  );
}

function kartuPenilaian(j) {
  const status = h('span', { class: 'kecil muted', 'aria-live': 'polite' });
  const idKom = buatId('komentar');
  const komentar = h('input', { id: idKom, class: 'input', maxlength: 500, value: j.komentar_guru || '', placeholder: 'Komentar (opsional)' });
  const tombolSkor = [];
  const simpan = async (skor) => {
    status.textContent = 'Menyimpan…';
    try {
      await api(`/guru/jawaban/${j.jawaban_id}`, { method: 'PATCH', body: { skor_guru: skor, komentar: komentar.value || null } });
      j.skor_guru = skor;
      tombolSkor.forEach((b, i) => b.setAttribute('aria-pressed', String(i === skor)));
      status.textContent = 'Tersimpan ✓';
    } catch (e) {
      status.textContent = e.message;
    }
  };
  for (let s = 0; s <= j.skor_maks; s++) {
    tombolSkor.push(h('button', { type: 'button', class: 'tombol kecil', 'aria-pressed': String(j.skor_guru !== null && s === j.skor_guru), onclick: () => simpan(s) }, `Skor ${s}`));
  }
  return h('div', { class: 'kartu' },
    h('p', { class: 'kecil muted', style: { margin: 0 } }, `${j.kode_siswa} · ${j.nama} · ${j.jenis === 'pre' ? 'Pretest' : 'Posttest'}`),
    h('h3', {}, `Soal ${j.soal_no} (${j.judul}), tahap ${j.tahap_no}`),
    h('p', { class: 'kecil' }, j.instruksi),
    h('ul', { class: 'ringkasan' },
      h('li', {}, h('strong', {}, 'Keputusan: '), j.keputusan || '—'),
      h('li', {}, h('strong', {}, 'Alasan: '), j.alasan || '—'),
      h('li', {}, h('strong', {}, 'Penjelasan: '), j.teks || '—'),
    ),
    h('p', { class: 'kecil' }, `Skor otomatis: ${j.skor_otomatis}/${j.skor_maks}`, j.skor_guru !== null ? ` · Skor guru: ${j.skor_guru}` : ''),
    h('label', { class: 'medan', for: idKom }, h('span', {}, 'Komentar'), komentar),
    h('div', { class: 'baris-tombol', style: { marginTop: 0 } }, tombolSkor),
    status,
  );
}
