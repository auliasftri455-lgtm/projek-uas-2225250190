"""Uji mesin penilaian terhadap kisi-kisi di docs/01-SOAL-LATIHAN.md."""

import copy

import pytest

from app.core import bank_soal
from app.core.penilaian import nilai_soal, parse_angka, parse_waktu

SOAL = bank_soal.soal_per_nomor()

KUNCI = {
    1: {
        1: {"pilih": 0},
        2: {"cara": "faktor", "faktor": {"8": {"2": 3}, "12": {"2": 2, "3": 1}}, "kpk": "24"},
        3: {"pilih": 0},
        4: {"urutan": [24, 48, 96]},
        5: {"keputusan": 2, "alasan": 0, "teks": ""},
    },
    2: {
        1: {"pilih": [0, 1, 2, 3]},
        2: {"pilih": 0},
        3: {"pilih": 0},
        4: {"faktor": {"4": {"2": 2}, "6": {"2": 1, "3": 1}, "10": {"2": 1, "5": 1}}, "kpk": "60"},
        5: {"tanggal": 2, "bulan": 10},
        6: {"pilih": 4},
    },
    3: {
        1: {"pilih": 0},
        2: {"faktor": {"18": {"2": 1, "3": 2}, "24": {"2": 3, "3": 1}}, "kpk": "72"},
        3: {"medan": {"merah": "4", "biru": "3", "total": "7"}},
        4: {"medan": {"tinggi": "72", "kardus": "7"}},
    },
    4: {
        1: {"pilih": 0},
        2: {"pilih": 0},
        3: {"cara": "kelipatan", "kelipatan": {"6": "6, 12, 18, 24", "8": "8 16 24"}, "kpk": "24"},
        4: {"waktu": "07.24"},
        5: {"medan": {"ani": "4", "budi": "3"}},
        6: {"keputusan": 1, "alasan": 0, "teks": "Tidak setuju, bertemu pukul 07.24"},
    },
}


def skor(no, isian):
    return [h.skor for h in nilai_soal(SOAL[no], isian)]


def test_bank_soal_valid_dan_total_24():
    assert sum(t["skor_maks"] for s in SOAL.values() for t in s["tahap"]) == 24
    assert [[t["skor_maks"] for t in SOAL[n]["tahap"]] for n in (1, 2, 3, 4)] == [
        [1, 2, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 2, 2, 1],
        [1, 1, 1, 1, 1, 1],
    ]


@pytest.mark.parametrize("no", [1, 2, 3, 4])
def test_jawaban_kunci_skor_penuh(no):
    assert sum(skor(no, KUNCI[no])) == 6


@pytest.mark.parametrize("no", [1, 2, 3, 4])
def test_jawaban_kosong_skor_nol(no):
    assert sum(skor(no, {})) == 0


def test_soal3_contoh_pedoman_salah_bagi_tetap_dapat_skor_sebelumnya():
    """Pedoman: KPK benar (72) tetapi salah membagi -> tahap 1 & 2 tetap penuh."""
    isian = copy.deepcopy(KUNCI[3])
    isian[3] = {"medan": {"merah": "3", "biru": "3", "total": "6"}}  # 72:18 keliru ditulis 3
    isian[4] = {"medan": {"tinggi": "72", "kardus": "6"}}  # kesimpulan konsisten dengan hasilnya
    assert skor(3, isian) == [1, 2, 1, 1]  # tahap 3: total konsisten dapat 1; tahap 4 konsisten dapat 1


def test_soal3_error_carried_forward_dari_kpk_salah():
    isian = copy.deepcopy(KUNCI[3])
    isian[2] = {"faktor": {"18": {"2": 1, "3": 2}, "24": {"2": 3, "3": 1}}, "kpk": "144"}  # KPK salah
    isian[3] = {"medan": {"merah": "8", "biru": "6", "total": "14"}}  # benar terhadap 144
    isian[4] = {"medan": {"tinggi": "144", "kardus": "14"}}
    assert skor(3, isian) == [1, 1, 2, 1]


def test_soal2_tanggal_dan_hari_mengikuti_t_siswa():
    isian = copy.deepcopy(KUNCI[2])
    isian[4] = {"faktor": {}, "kpk": "120"}  # siswa memakai 4×6×10 / 2 = 120 (salah)
    isian[5] = {"tanggal": 1, "bulan": 12}  # 3 Agustus + 120 hari = 1 Desember 2026
    isian[6] = {"pilih": 1}  # Selasa
    assert skor(2, isian) == [1, 1, 1, 0, 1, 1]


def test_soal2_centang_harus_tepat():
    isian = copy.deepcopy(KUNCI[2])
    isian[1] = {"pilih": [0, 1, 2, 3, 4]}  # ikut mencentang jumlah petugas
    assert skor(2, isian)[0] == 0


def test_soal1_rani_salah_kesimpulan_tetapi_konsisten():
    isian = copy.deepcopy(KUNCI[1])
    isian[2] = {"cara": "faktor", "faktor": {"8": {"2": 3}, "12": {"2": 2, "3": 1}}, "kpk": "48"}
    isian[5] = {"keputusan": 1, "alasan": 0}  # memilih Citra, konsisten dengan KPK = 48
    assert skor(1, isian) == [1, 1, 1, 1, 1]


def test_soal1_mengalikan_tanpa_alasan_benar():
    isian = copy.deepcopy(KUNCI[1])
    isian[5] = {"keputusan": 0, "alasan": 1}
    assert skor(1, isian)[4] == 0


def test_soal1_cara_kelipatan_diterima():
    isian = copy.deepcopy(KUNCI[1])
    isian[2] = {"cara": "kelipatan", "kelipatan": {"8": "8, 16, 24", "12": "12, 24"}, "kpk": "24"}
    assert skor(1, isian)[1] == 2


def test_soal1_kelipatan_salah_urut():
    isian = copy.deepcopy(KUNCI[1])
    isian[2] = {"cara": "kelipatan", "kelipatan": {"8": "8, 18, 24", "12": "12, 24"}, "kpk": "24"}
    assert skor(1, isian)[1] == 1


def test_soal4_fpb_dipakai_tetap_konsisten():
    isian = copy.deepcopy(KUNCI[4])
    isian[3] = {"cara": "faktor", "faktor": {}, "kpk": "48"}  # 6×8, bukan KPK
    isian[4] = {"waktu": "7:48"}
    isian[5] = {"medan": {"ani": "8", "budi": "6"}}
    assert skor(4, isian) == [1, 1, 0, 1, 1, 1]


def test_kesimpulan_dengan_teks_perlu_guru():
    hasil = nilai_soal(SOAL[4], KUNCI[4])
    assert hasil[5].perlu_dinilai_guru is True
    assert all(not h.perlu_dinilai_guru for h in nilai_soal(SOAL[1], KUNCI[1]))


def test_isian_aneh_tidak_membuat_error():
    aneh = {t: {"pilih": "x", "kpk": None, "medan": "bukan dict", "faktor": [1, 2]} for t in range(1, 7)}
    for no in SOAL:
        assert sum(skor(no, aneh)) == 0


def test_parse():
    assert parse_angka("72 cm") == 72
    assert parse_angka("1,5") == 1.5
    assert parse_angka("") is None
    assert parse_waktu("07.24") == parse_waktu("7:24") == 444
    assert parse_waktu("25.00") is None


def test_soal_publik_tanpa_kunci():
    teks = str(bank_soal.soal_literasi_publik())
    for rahasia in ("kunci", "rubrik", "nilai_keputusan"):
        assert rahasia not in teks
