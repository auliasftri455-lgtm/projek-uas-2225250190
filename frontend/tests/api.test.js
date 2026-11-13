// Uji antrean offline (api.js) dengan fetch & localStorage tiruan.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const simpanan = new Map();
globalThis.localStorage = {
  getItem: (k) => (simpanan.has(k) ? simpanan.get(k) : null),
  setItem: (k, v) => simpanan.set(k, String(v)),
  removeItem: (k) => simpanan.delete(k),
};
globalThis.window = { addEventListener() {} };
let online = true;
const terkirim = [];
globalThis.fetch = async (url, opsi) => {
  if (!online) throw new TypeError('Failed to fetch');
  terkirim.push([url, JSON.parse(opsi.body)]);
  return { ok: true, status: 200, json: async () => ({ tersimpan: true }) };
};

const { kirimAntrean, kirimAtauAntre, jumlahAntrean } = await import('../js/api.js');
localStorage.setItem('kpk:saya', JSON.stringify({ id: 7, peran: 'siswa' }));

test('antrean kosong di awal tidak membuat pengiriman berikutnya macet (regresi)', async () => {
  assert.equal(await kirimAntrean(), true); // antrean kosong: selesai seketika
  assert.equal(await kirimAtauAntre('/tes/1/jawab', { soal_no: 1 }), true);
  assert.deepEqual(terkirim.map(([u]) => u), ['/api/tes/1/jawab']);
});

test('offline: jawaban menunggu di antrean lalu terkirim berurutan saat online', async () => {
  terkirim.length = 0;
  online = false;
  assert.equal(await kirimAtauAntre('/tes/1/jawab', { tahap: 1, isi: 'lama' }), false);
  assert.equal(await kirimAtauAntre('/tes/1/jawab', { tahap: 1, isi: 'baru' }), false);
  assert.equal(jumlahAntrean(), 2);
  online = true;
  assert.equal(await kirimAntrean(), true);
  assert.equal(jumlahAntrean(), 0);
  assert.deepEqual(terkirim.map(([, b]) => b.isi), ['lama', 'baru']); // urutan terjaga: yang baru menang
});
