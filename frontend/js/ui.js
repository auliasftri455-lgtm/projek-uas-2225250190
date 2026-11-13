// Pembuat elemen DOM kecil. Semua teks dimasukkan lewat textContent (aman dari XSS).

/**
 * h('button', { class: 'tombol', onclick: fn }, 'Teks', anakLain)
 * Atribut yang diawali "on" menjadi event listener; nilai false/null/undefined diabaikan.
 */
export function h(tag, attrs = {}, ...anak) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  tambah(el, anak);
  return el;
}

function tambah(el, anak) {
  for (const a of anak.flat(Infinity)) {
    if (a === null || a === undefined || a === false) continue;
    el.append(a instanceof Node ? a : document.createTextNode(String(a)));
  }
}

export function svg(tag, attrs = {}, ...anak) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) el.setAttribute(k, v);
  tambah(el, anak);
  return el;
}

export function tombol(label, onclick, { varian = '', ...lain } = {}) {
  return h('button', { type: 'button', class: `tombol ${varian}`.trim(), onclick, ...lain }, label);
}

export function tautan(label, href, { varian = '' } = {}) {
  return h('a', { class: `tombol ${varian}`.trim(), href }, label);
}

export function pesanGalat(teks) {
  return h('div', { class: 'pesan-galat', role: 'alert' }, teks);
}

let idUnik = 0;
export function buatId(awalan = 'el') {
  idUnik += 1;
  return `${awalan}-${idUnik}`;
}

export function acak(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function bintangTeks(n, maks = 3) {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, maks - n));
}
