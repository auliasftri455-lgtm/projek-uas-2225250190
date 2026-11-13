import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAngka, parseDaftar, periksaCentang, periksaFaktorisasi, periksaFpb, periksaKelipatan, periksaKpk,
} from '../js/pemeriksa.js';

test('parse', () => {
  assert.equal(parseAngka('1,5'), 1.5);
  assert.equal(parseAngka('72 cm'), 72);
  assert.equal(parseAngka(''), null);
  assert.deepEqual(parseDaftar('8, 16 24'), [8, 16, 24]);
  assert.equal(parseDaftar('8, a'), null);
});

test('kelipatan: menunjuk letak kesalahan', () => {
  assert.ok(periksaKelipatan(8, '8, 16, 24', 3).benar);
  assert.match(periksaKelipatan(8, '8, 16, 25').pesan, /ke-3: 25 tidak habis dibagi 8/);
  assert.match(periksaKelipatan(8, '8, 24').pesan, /urutannya tidak pas/);
  assert.match(periksaKelipatan(8, '8, 16', 6).pesan, /paling sedikit 6/);
  assert.match(periksaKelipatan(4, '4, 8, 13', 6).pesan, /ke-3: 13/); // letak kesalahan didahulukan
});

test('faktorisasi', () => {
  assert.ok(periksaFaktorisasi(18, { 2: '1', 3: '2' }).benar);
  assert.match(periksaFaktorisasi(18, { 2: '1', 3: '1' }).pesan, /terlalu kecil/);
  assert.match(periksaFaktorisasi(18, { 2: '1', 5: '1' }).pesan, /tidak habis dibagi 5/);
  assert.match(periksaFaktorisasi(18, { 4: '1' }).pesan, /bukan bilangan prima/);
  assert.match(periksaFaktorisasi(18, {}).pesan, /Isi pangkatnya/);
});

test('kpk: membedakan FPB, bukan kelipatan, dan bukan terkecil', () => {
  assert.ok(periksaKpk([8, 12], '24').benar);
  assert.match(periksaKpk([8, 12], '4').pesan, /arah FPB/);
  assert.match(periksaKpk([8, 12], '36').pesan, /tidak habis dibagi 8/);
  assert.match(periksaKpk([8, 12], '96').pesan, /PALING kecil/);
  assert.match(periksaKpk([8, 12], 'x').pesan, /bilangan bulat/);
});

test('fpb', () => {
  assert.ok(periksaFpb([24, 36], '12').benar);
  assert.match(periksaFpb([24, 36], '72').pesan, /arah KPK/);
  assert.match(periksaFpb([24, 36], '6').pesan, /lebih besar/);
  assert.match(periksaFpb([24, 36], '8').pesan, /36 tidak habis dibagi 8/);
});

test('centang', () => {
  assert.ok(periksaCentang([1, 0], [0, 1]).benar);
  assert.match(periksaCentang([0, 1, 2], [0, 1]).pesan, /tidak diperlukan/);
  assert.match(periksaCentang([0], [0, 1]).pesan, /belum dicentang/);
});
