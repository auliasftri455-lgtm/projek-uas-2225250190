import { catatLog } from '../api.js';
import { catatanPribadi, ringkasanKpk } from '../components/catatan.js';
import { atur } from '../layout.js';
import { h } from '../ui.js';

export function viewCatatan() {
  atur({ judul: 'Catatan', rute: 'catatan', kembali: '#/beranda' });
  catatLog('buka_catatan', { asal: 'menu' });
  return h('div', {}, catatanPribadi(), ringkasanKpk());
}
