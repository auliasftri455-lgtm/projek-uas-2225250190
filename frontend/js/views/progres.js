import { api } from '../api.js';
import { bilahSkor } from '../components/komponen.js';
import { LEVEL, SOAL_PER_LEVEL } from '../latihan-gen.js';
import { atur } from '../layout.js';
import { bacaSaya } from '../store.js';
import { h } from '../ui.js';
import { NAMA_INDIKATOR } from './tes.js';

export function viewProgres() {
  atur({ judul: 'Progresku', kembali: '#/beranda' });
  const diag = bacaSaya('diagnostik');
  const latihan = bacaSaya('latihan', {});
  const KATEGORI = { kelipatan: 'Kelipatan', faktor: 'Faktor', prima: 'Bilangan prima' };

  const tes = h('div', {}, h('p', { class: 'muted' }, 'Memuat hasil tes…'));
  api('/tes/riwayat')
    .then((daftar) => {
      if (!daftar?.length) return tes.replaceChildren(h('p', { class: 'muted' }, 'Belum ada tes yang dikumpulkan.'));
      tes.replaceChildren(
        ...daftar.map((r) =>
          h('div', { style: { marginBottom: '16px' } },
            h('h3', {}, `${r.jenis === 'pre' ? 'Tes awal' : 'Tes akhir'}: ${r.total}/${r.total_maks}`),
            Object.entries(r.skor).map(([k, v]) => bilahSkor(NAMA_INDIKATOR[k], v, 6)),
          ),
        ),
      );
    })
    .catch(() => tes.replaceChildren(h('p', { class: 'muted' }, 'Hasil tes hanya bisa dilihat saat ada internet.')));

  return h('div', {},
    h('div', { class: 'kartu' },
      h('h2', {}, 'Cek kesiapan'),
      diag ? Object.entries(diag.skor).map(([k, s]) => bilahSkor(KATEGORI[k] || k, s.benar, s.total)) : h('p', {}, h('a', { href: '#/diagnostik' }, 'Belum dikerjakan. Kerjakan sekarang →')),
    ),
    h('div', { class: 'kartu' },
      h('h2', {}, 'Latihan'),
      Object.entries(LEVEL).map(([l, info]) => bilahSkor(`Level ${l}: ${info.judul}`, latihan[l]?.bintang || 0, SOAL_PER_LEVEL * 3)),
      h('p', { class: 'kecil muted' }, 'Angka = bintang terbaik. Data latihan tersimpan di HP ini.'),
    ),
    h('div', { class: 'kartu' }, h('h2', {}, 'Tes'), tes),
  );
}
