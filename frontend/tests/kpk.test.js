import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  daftarKelipatan, faktorisasi, formatFaktorisasi, fpb, kpk, kpkDariFaktorisasi, nilaiFaktorisasi, prima,
} from '../js/kpk.js';

const vektor = JSON.parse(readFileSync(new URL('../../shared/test_vectors/kpk.json', import.meta.url), 'utf8'));

for (const k of vektor.kasus) {
  test(`vektor bersama ${JSON.stringify(k.bilangan)}`, () => {
    assert.equal(kpk(...k.bilangan), k.kpk);
    assert.equal(fpb(...k.bilangan), k.fpb);
    const daftar = k.bilangan.map(faktorisasi);
    k.bilangan.forEach((n, i) => {
      assert.deepEqual(daftar[i], k.faktorisasi[String(n)]);
      assert.equal(nilaiFaktorisasi(daftar[i]), n);
    });
    assert.equal(kpkDariFaktorisasi(daftar), k.kpk);
  });
}

test('daftar kelipatan', () => assert.deepEqual(daftarKelipatan(8, 3), [8, 16, 24]));

test('input tidak valid', () => {
  for (const x of [0, -3, 2.5, true, '8']) assert.throws(() => kpk(4, x), RangeError);
});

test('prima & format', () => {
  assert.deepEqual([1, 2, 9, 13, 15].map(prima), [false, true, false, true, false]);
  assert.equal(formatFaktorisasi({ 3: 1, 2: 3 }), '2³ × 3');
  assert.equal(formatFaktorisasi({}), '1');
});
