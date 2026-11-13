import { api } from '../api.js';
import { atur, pergi } from '../layout.js';
import { bacaSaya, tulis } from '../store.js';
import { buatId, h, pesanGalat } from '../ui.js';

function medan(label, attrs) {
  const id = buatId('masuk');
  const input = h('input', { id, class: 'input', ...attrs });
  return { input, el: h('label', { class: 'medan', for: id }, h('span', {}, label), input) };
}

export function viewMasuk() {
  atur({ judul: 'Masuk', nav: false });
  const isi = h('div');
  const tabSiswa = h('button', { type: 'button', role: 'tab', 'aria-selected': 'true' }, 'Siswa');
  const tabGuru = h('button', { type: 'button', role: 'tab', 'aria-selected': 'false' }, 'Guru');
  const pilih = (peran) => {
    tabSiswa.setAttribute('aria-selected', String(peran === 'siswa'));
    tabGuru.setAttribute('aria-selected', String(peran === 'guru'));
    isi.replaceChildren(peran === 'siswa' ? formSiswa() : formGuru());
  };
  tabSiswa.onclick = () => pilih('siswa');
  tabGuru.onclick = () => pilih('guru');
  pilih('siswa');

  return h(
    'div',
    {},
    h('div', { class: 'tengah', style: { margin: '16px 0 24px' } },
      h('div', { style: { fontSize: '3rem' }, 'aria-hidden': 'true' }, '🧮'),
      h('h1', {}, 'KPK Langkah demi Langkah'),
      h('p', { class: 'muted' }, 'Belajar KPK satu langkah dalam satu waktu.'),
    ),
    h('div', { class: 'tab', role: 'tablist', 'aria-label': 'Masuk sebagai' }, tabSiswa, tabGuru),
    isi,
  );
}

function formSiswa() {
  const kode = medan('Kode kelas', { autocomplete: 'off', autocapitalize: 'characters', maxlength: 12, placeholder: 'Contoh: K7AB3D', required: true });
  const nama = medan('Nama panggilan', { autocomplete: 'nickname', maxlength: 40, placeholder: 'Contoh: Indah', required: true });
  const galat = h('div');
  const kirim = h('button', { type: 'submit', class: 'tombol utama penuh' }, 'Masuk');
  return h(
    'form',
    {
      class: 'kartu',
      onsubmit: async (e) => {
        e.preventDefault();
        galat.replaceChildren();
        kirim.disabled = true;
        try {
          const saya = await api('/masuk/siswa', { method: 'POST', body: { kode_kelas: kode.input.value.trim().toUpperCase(), nama_panggilan: nama.input.value } });
          tulis('saya', saya);
          pergi(bacaSaya('diagnostik') ? '#/beranda' : '#/diagnostik');
        } catch (err) {
          galat.replaceChildren(pesanGalat(err.message));
        } finally {
          kirim.disabled = false;
        }
      },
    },
    kode.el,
    nama.el,
    h('p', { class: 'kecil muted' }, 'Kode kelas diberikan oleh gurumu. Pakai nama panggilan yang sama setiap kali masuk.'),
    galat,
    kirim,
  );
}

function formGuru() {
  let daftar = false;
  const nama = medan('Nama pengguna', { autocomplete: 'username', minlength: 3, maxlength: 40, required: true });
  const pin = medan('PIN (4–12 angka)', { type: 'password', inputmode: 'numeric', autocomplete: 'current-password', minlength: 4, maxlength: 12, required: true });
  const galat = h('div');
  const kirim = h('button', { type: 'submit', class: 'tombol utama penuh' }, 'Masuk');
  const ganti = h('button', { type: 'button', class: 'tombol kecil penuh', style: { marginTop: '8px' } }, 'Belum punya akun? Daftar');
  ganti.onclick = () => {
    daftar = !daftar;
    kirim.textContent = daftar ? 'Daftar akun guru' : 'Masuk';
    ganti.textContent = daftar ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar';
    pin.input.autocomplete = daftar ? 'new-password' : 'current-password';
  };
  return h(
    'form',
    {
      class: 'kartu',
      onsubmit: async (e) => {
        e.preventDefault();
        galat.replaceChildren();
        kirim.disabled = true;
        try {
          const saya = await api(daftar ? '/daftar/guru' : '/masuk/guru', { method: 'POST', body: { nama_pengguna: nama.input.value.trim(), pin: pin.input.value } });
          tulis('saya', saya);
          pergi('#/guru');
        } catch (err) {
          galat.replaceChildren(pesanGalat(err.message));
        } finally {
          kirim.disabled = false;
        }
      },
    },
    nama.el,
    pin.el,
    galat,
    kirim,
    ganti,
  );
}
