// Komponen isian. Setiap komponen mengembalikan { el, nilai(), isi(nilai) }.
// nilai() menghasilkan objek yang sama bentuknya dengan isian di shared/soal/soal_literasi.json.

import { faktorisasi, prima } from '../kpk.js';
import { buatId, h } from '../ui.js';

export function isianAngka({ label = '', satuan = '', placeholder = '', mode = 'numeric', id = buatId('angka') } = {}) {
  const input = h('input', { id, class: 'input', type: 'text', inputmode: mode, autocomplete: 'off', placeholder });
  const el = h(
    'div',
    { class: 'medan' },
    label ? h('label', { for: id }, h('span', {}, label)) : null,
    h('div', { class: 'isian-angka' }, input, satuan ? h('span', { class: 'muted' }, satuan) : null),
  );
  return { el, input, nilai: () => input.value.trim(), isi: (v) => (input.value = v ?? '') };
}

export function isianTeks({ label = '', placeholder = '', baris = 3 } = {}) {
  const id = buatId('teks');
  const ta = h('textarea', { id, class: 'input', rows: baris, placeholder, maxlength: 600 });
  const el = h('label', { class: 'medan', for: id }, label ? h('span', {}, label) : null, ta);
  return { el, nilai: () => ta.value.trim(), isi: (v) => (ta.value = v ?? '') };
}

export function pilihanGanda({ opsi, label = 'Pilihan jawaban' }) {
  const nama = buatId('pilih');
  const input = opsi.map((_, i) => h('input', { type: 'radio', name: nama, value: String(i) }));
  const el = h(
    'div',
    { class: 'opsi', role: 'radiogroup', 'aria-label': label },
    opsi.map((teks, i) => h('label', {}, input[i], h('span', {}, teks))),
  );
  return {
    el,
    nilai: () => {
      const i = input.findIndex((x) => x.checked);
      return i < 0 ? null : i;
    },
    isi: (v) => input.forEach((x, i) => (x.checked = i === v)),
  };
}

export function centang({ opsi }) {
  const input = opsi.map((_, i) => h('input', { type: 'checkbox', value: String(i) }));
  const el = h('div', { class: 'opsi' }, opsi.map((teks, i) => h('label', {}, input[i], h('span', {}, teks))));
  return {
    el,
    nilai: () => input.map((x, i) => (x.checked ? i : -1)).filter((i) => i >= 0),
    isi: (v) => input.forEach((x, i) => (x.checked = Array.isArray(v) && v.includes(i))),
  };
}

/** Bilangan prima yang ditampilkan sebagai basis: 2, 3, 5, 7 + faktor prima lain yang dibutuhkan. */
export function basisPrima(bilangan) {
  const set = new Set([2, 3, 5, 7]);
  for (const n of bilangan) for (const p of Object.keys(faktorisasi(n))) set.add(Number(p));
  return [...set].filter(prima).sort((a, b) => a - b);
}

/** Faktorisasi prima: 18 = 2^[ ] × 3^[ ] × 5^[ ] × 7^[ ]. Kosong = faktor itu tidak dipakai. */
export function isianPangkat({ bilangan, basis = basisPrima(bilangan) }) {
  const input = {};
  const el = h(
    'div',
    {},
    bilangan.map((n) => {
      input[n] = {};
      const bagian = [h('span', { class: 'angka' }, `${n} =`)];
      basis.forEach((p, k) => {
        if (k > 0) bagian.push(h('span', { 'aria-hidden': 'true' }, '×'));
        const inp = h('input', {
          type: 'text',
          inputmode: 'numeric',
          maxlength: 2,
          autocomplete: 'off',
          'aria-label': `Pangkat ${p} pada faktorisasi ${n}`,
        });
        input[n][p] = inp;
        bagian.push(h('span', { class: 'basis' }, h('span', {}, String(p)), inp));
      });
      return h('div', { class: 'baris-faktor' }, bagian);
    }),
    h('p', { class: 'kecil muted' }, 'Isi pangkatnya. Kosongkan jika bilangan prima itu bukan faktornya.'),
  );
  return {
    el,
    nilai: () => {
      const hasil = {};
      for (const n of bilangan) {
        hasil[n] = {};
        for (const [p, inp] of Object.entries(input[n])) if (inp.value.trim()) hasil[n][p] = inp.value.trim();
      }
      return hasil;
    },
    isi: (v) => {
      for (const n of bilangan) for (const [p, inp] of Object.entries(input[n])) inp.value = v?.[n]?.[p] ?? '';
    },
  };
}

/** Daftar kelipatan untuk beberapa bilangan: "Kelipatan 8: [8, 16, 24]". */
export function isianDaftar({ bilangan }) {
  const input = {};
  const el = h(
    'div',
    {},
    bilangan.map((n) => {
      const id = buatId('daftar');
      input[n] = h('input', { id, class: 'input', type: 'text', inputmode: 'text', autocomplete: 'off', placeholder: `${n}, ${2 * n}, …` });
      return h('label', { class: 'medan', for: id }, h('span', {}, `Kelipatan ${n}`), input[n]);
    }),
    h('p', { class: 'kecil muted' }, 'Pisahkan dengan koma. Tulis sampai kamu menemukan bilangan yang sama.'),
  );
  return {
    el,
    nilai: () => Object.fromEntries(bilangan.map((n) => [n, input[n].value.trim()])),
    isi: (v) => bilangan.forEach((n) => (input[n].value = v?.[n] ?? '')),
  };
}

/** Isian tahap faktorisasi_kpk: pilih cara (bila boleh), isi faktorisasi/daftar, lalu KPK. */
export function isianFaktorisasiKpk({ bilangan, boleh_kelipatan: bolehKelipatan, label_kpk: labelKpk, satuan }) {
  let cara = 'faktor';
  const pangkat = isianPangkat({ bilangan });
  const daftar = bolehKelipatan ? isianDaftar({ bilangan }) : null;
  const wadah = h('div', {}, pangkat.el);
  const kpkInput = isianAngka({ label: labelKpk || `KPK(${bilangan.join(', ')}) =`, satuan });

  const tabTombol = {};
  const pilihCara = (c) => {
    cara = c;
    wadah.replaceChildren(c === 'faktor' ? pangkat.el : daftar.el);
    Object.entries(tabTombol).forEach(([k, b]) => b.setAttribute('aria-selected', String(k === c)));
  };
  let tab = null;
  if (bolehKelipatan) {
    tabTombol.faktor = h('button', { type: 'button', role: 'tab', onclick: () => pilihCara('faktor') }, 'Faktorisasi prima');
    tabTombol.kelipatan = h('button', { type: 'button', role: 'tab', onclick: () => pilihCara('kelipatan') }, 'Daftar kelipatan');
    tab = h('div', { class: 'tab', role: 'tablist', 'aria-label': 'Pilih cara' }, tabTombol.faktor, tabTombol.kelipatan);
    pilihCara('faktor');
  }
  return {
    el: h('div', {}, tab, wadah, kpkInput.el),
    nilai: () => ({
      cara,
      faktor: pangkat.nilai(),
      kelipatan: daftar ? daftar.nilai() : undefined,
      kpk: kpkInput.nilai(),
    }),
    isi: (v) => {
      if (!v) return;
      pangkat.isi(v.faktor);
      daftar?.isi(v.kelipatan);
      kpkInput.isi(v.kpk);
      if (bolehKelipatan) pilihCara(v.cara === 'kelipatan' ? 'kelipatan' : 'faktor');
    },
  };
}

/** Ketuk berurutan untuk mengurutkan nilai. */
export function urutkan({ nilai, satuan = '' }) {
  let urutan = [];
  const atas = h('div', { class: 'chip-wadah', 'aria-label': 'Urutanmu' });
  const bawah = h('div', { class: 'chip-wadah', 'aria-label': 'Pilihan' });
  const label = (v) => `${v}${satuan ? ` ${satuan}` : ''}`;
  const gambar = () => {
    atas.replaceChildren(
      ...(urutan.length
        ? urutan.map((v, i) => h('button', { type: 'button', class: 'chip terpilih', 'aria-label': `Urutan ${i + 1}: ${label(v)}. Ketuk untuk membatalkan`, onclick: () => { urutan = urutan.filter((x) => x !== v); gambar(); } }, `${i + 1}. ${label(v)}`))
        : [h('span', { class: 'muted kecil', style: { padding: '8px' } }, 'Ketuk pilihan di bawah dari yang paling awal.')]),
    );
    bawah.replaceChildren(
      ...nilai.filter((v) => !urutan.includes(v)).map((v) => h('button', { type: 'button', class: 'chip', onclick: () => { urutan.push(v); gambar(); } }, label(v))),
    );
  };
  gambar();
  return {
    el: h('div', {}, h('p', { class: 'kecil muted' }, 'Urutanmu:'), atas, bawah),
    nilai: () => ({ urutan: [...urutan] }),
    isi: (v) => {
      urutan = Array.isArray(v?.urutan) ? v.urutan.filter((x) => nilai.includes(x)) : [];
      gambar();
    },
  };
}

export function isianKesimpulan({ opsi_keputusan: opsiKeputusan, opsi_alasan: opsiAlasan, label_teks: labelTeks }) {
  const keputusan = pilihanGanda({ opsi: opsiKeputusan, label: 'Keputusan' });
  const alasan = pilihanGanda({ opsi: opsiAlasan, label: 'Alasan' });
  const teks = isianTeks({ label: labelTeks || 'Penjelasanmu (boleh dikosongkan)' });
  return {
    el: h('div', {}, h('h3', {}, 'Keputusan'), keputusan.el, h('h3', { style: { marginTop: '16px' } }, 'Alasan'), alasan.el, h('div', { style: { marginTop: '16px' } }, teks.el)),
    nilai: () => ({ keputusan: keputusan.nilai(), alasan: alasan.nilai(), teks: teks.nilai() }),
    isi: (v) => {
      keputusan.isi(v?.keputusan);
      alasan.isi(v?.alasan);
      teks.isi(v?.teks);
    },
  };
}

export const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function isianTanggal({ tahun }) {
  const idT = buatId('tgl');
  const idB = buatId('bln');
  const tgl = h('select', { id: idT, class: 'input' }, h('option', { value: '' }, '—'), Array.from({ length: 31 }, (_, i) => h('option', { value: String(i + 1) }, String(i + 1))));
  const bln = h('select', { id: idB, class: 'input' }, h('option', { value: '' }, '—'), NAMA_BULAN.map((b, i) => h('option', { value: String(i + 1) }, b)));
  return {
    el: h(
      'div',
      { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' } },
      h('label', { class: 'medan', for: idT }, h('span', {}, 'Tanggal'), tgl),
      h('label', { class: 'medan', for: idB }, h('span', {}, `Bulan (${tahun})`), bln),
    ),
    nilai: () => ({ tanggal: tgl.value ? Number(tgl.value) : null, bulan: bln.value ? Number(bln.value) : null }),
    isi: (v) => {
      tgl.value = v?.tanggal ? String(v.tanggal) : '';
      bln.value = v?.bulan ? String(v.bulan) : '';
    },
  };
}

export function isianWaktu() {
  const a = isianAngka({ label: 'Pukul', placeholder: '07.30', mode: 'decimal' });
  return { el: a.el, nilai: () => ({ waktu: a.nilai() }), isi: (v) => a.isi(v?.waktu) };
}

export function angkaGanda({ medan }) {
  const isian = medan.map((m) => [m.id, isianAngka({ label: m.label, satuan: m.satuan, mode: 'decimal' })]);
  return {
    el: h('div', {}, isian.map(([, x]) => x.el)),
    nilai: () => ({ medan: Object.fromEntries(isian.map(([k, x]) => [k, x.nilai()])) }),
    isi: (v) => isian.forEach(([k, x]) => x.isi(v?.medan?.[k])),
  };
}

/** Membuat komponen isian untuk satu tahap tes berdasarkan tipenya. */
export function isianUntukTahap(tahap) {
  switch (tahap.tipe) {
    case 'pilihan':
    case 'hari': {
      const p = pilihanGanda({ opsi: tahap.opsi });
      return { el: p.el, nilai: () => ({ pilih: p.nilai() }), isi: (v) => p.isi(v?.pilih) };
    }
    case 'centang': {
      const c = centang({ opsi: tahap.opsi });
      return { el: c.el, nilai: () => ({ pilih: c.nilai() }), isi: (v) => c.isi(v?.pilih) };
    }
    case 'faktorisasi_kpk':
      return isianFaktorisasiKpk(tahap);
    case 'urutkan':
      return urutkan(tahap);
    case 'kesimpulan':
      return isianKesimpulan(tahap);
    case 'angka_ganda':
      return angkaGanda(tahap);
    case 'tanggal':
      return isianTanggal(tahap);
    case 'waktu':
      return isianWaktu();
    default:
      throw new Error(`Tipe tahap tidak dikenal: ${tahap.tipe}`);
  }
}

/** Apakah isian tahap masih kosong (untuk peringatan sebelum mengumpulkan). */
export function isianKosong(isian) {
  if (!isian) return true;
  const ada = (v) => {
    if (v === null || v === undefined || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.values(v).some(ada);
    return true;
  };
  return !Object.entries(isian).some(([k, v]) => k !== 'cara' && ada(v));
}
