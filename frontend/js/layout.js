// Kepala halaman, tombol kembali, dan menu bawah.

const elJudul = () => document.getElementById('judul');
const elKembali = () => document.getElementById('tombol-kembali');
const elAksi = () => document.getElementById('aksi-kepala');

let tujuanKembali = null;

export function atur({ judul = 'KPK Langkah demi Langkah', kembali = null, nav = true, aksi = null, rute = '' } = {}) {
  elJudul().textContent = judul;
  document.title = judul === 'KPK Langkah demi Langkah' ? judul : `${judul} · KPK Langkah demi Langkah`;
  tujuanKembali = kembali;
  elKembali().hidden = !kembali;
  elAksi().replaceChildren(...(aksi ? [aksi] : []));
  document.body.classList.toggle('tanpa-nav', !nav);
  document.querySelectorAll('.nav-bawah a').forEach((a) => {
    if (a.dataset.rute === rute) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

export function pergi(hash) {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}

// Skrip modul berjalan setelah HTML selesai diurai, jadi elemen sudah ada.
elKembali().addEventListener('click', () => tujuanKembali && pergi(tujuanKembali));
