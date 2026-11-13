"""Mesin penilaian tes mathematical literacy per tahap.

Prinsip (docs/01-SOAL-LATIHAN.md, Pedoman Umum Penskoran):
- Setiap tahap dinilai dengan rubrik berisi beberapa `cek`, masing-masing bernilai `poin`.
- ERROR CARRIED FORWARD: cek bertipe *_dari_tahap / konsisten_dengan menghitung kunci dari isian siswa
  di tahap sebelumnya, bukan dari kunci global. Siswa yang salah hitung di tahap 2 tetap bisa
  mendapat skor di tahap 3 bila prosedurnya benar terhadap hasilnya sendiri.

Setiap fungsi cek bersifat murni: cek(tahap, rubrik, isian, konteks) -> bool.
`konteks` = {nomor_tahap: isian} untuk tahap-tahap pada soal yang sama.
"""

from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any

from . import kpk as kpk_mod

Isian = dict[str, Any]
Konteks = dict[int, Isian]

TOLERANSI = 1e-6


# ---------------------------------------------------------------- normalisasi isian


def parse_angka(nilai: Any) -> float | None:
    """'72', '72 cm', ' 1,5 ', 1.5 -> angka. Gagal -> None."""
    if nilai is None or isinstance(nilai, bool):
        return None
    if isinstance(nilai, (int, float)):
        return float(nilai)
    teks = str(nilai).strip().replace(",", ".")
    m = re.search(r"-?\d+(?:\.\d+)?", teks)
    if not m:
        return None
    return float(m.group())


def parse_bulat(nilai: Any) -> int | None:
    x = parse_angka(nilai)
    if x is None or abs(x - round(x)) > TOLERANSI:
        return None
    return round(x)


def parse_waktu(nilai: Any) -> int | None:
    """'07.24', '7.24', '07:24', '7:24' -> menit sejak pukul 00.00."""
    if nilai is None:
        return None
    m = re.fullmatch(r"\s*(\d{1,2})\s*[.:]\s*(\d{2})\s*", str(nilai))
    if not m:
        return None
    jam, menit = int(m.group(1)), int(m.group(2))
    if jam > 23 or menit > 59:
        return None
    return jam * 60 + menit


def parse_faktorisasi(nilai: Any) -> dict[int, int] | None:
    """{'2': '3', '3': 1, '5': ''} -> {2: 3, 3: 1}. Pangkat kosong/0 diabaikan."""
    if not isinstance(nilai, dict):
        return None
    hasil: dict[int, int] = {}
    for p, e in nilai.items():
        prima = parse_bulat(p)
        if e in (None, ""):
            continue
        pangkat = parse_bulat(e)
        if prima is None or pangkat is None or pangkat < 0:
            return None
        if pangkat > 0:
            hasil[prima] = pangkat
    return hasil


def parse_daftar(nilai: Any) -> list[int] | None:
    """'8, 16, 24' atau [8, 16, 24] -> [8, 16, 24]."""
    if isinstance(nilai, list):
        bagian = nilai
    elif isinstance(nilai, str):
        bagian = [b for b in re.split(r"[,;\s]+", nilai.strip()) if b]
    else:
        return None
    hasil = [parse_bulat(b) for b in bagian]
    if not hasil or any(x is None for x in hasil):
        return None
    return hasil  # type: ignore[return-value]


def sama(a: float | None, b: float | None) -> bool:
    return a is not None and b is not None and abs(a - b) < TOLERANSI


# ---------------------------------------------------------------- rujukan antar tahap


def ambil_ref(ref: str, konteks: Konteks) -> float | None:
    """'2.kpk' -> isian tahap 2 medan 'kpk'; '3.total' -> isian tahap 3, medan['total']."""
    no_str, _, kunci = ref.partition(".")
    isian = konteks.get(int(no_str))
    if not isian:
        return None
    if kunci in isian:
        return parse_angka(isian[kunci])
    medan = isian.get("medan")
    if isinstance(medan, dict) and kunci in medan:
        return parse_angka(medan[kunci])
    return None


def _ref_bulat_positif(ref: str, konteks: Konteks) -> int | None:
    x = ambil_ref(ref, konteks)
    if x is None or x <= 0 or abs(x - round(x)) > TOLERANSI:
        return None
    return round(x)


# ---------------------------------------------------------------- fungsi cek


def cek_pilihan_benar(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    return parse_bulat(isian.get("pilih")) == tahap["kunci"]


def cek_centang_tepat(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    pilih = isian.get("pilih")
    if not isinstance(pilih, list):
        return False
    return {parse_bulat(x) for x in pilih} == set(tahap["kunci"])


def _faktorisasi_semua_benar(tahap: dict, isian: Isian) -> bool:
    faktor = isian.get("faktor")
    if not isinstance(faktor, dict):
        return False
    for n in tahap["bilangan"]:
        f = parse_faktorisasi(faktor.get(str(n)))
        if f is None or f != kpk_mod.faktorisasi(n):
            return False
    return True


def _kelipatan_semua_benar(tahap: dict, isian: Isian) -> bool:
    """Setiap daftar berisi kelipatan berurutan n, 2n, 3n, ... dan memuat KPK yang benar."""
    daftar = isian.get("kelipatan")
    if not isinstance(daftar, dict):
        return False
    target = kpk_mod.kpk(*tahap["bilangan"])
    for n in tahap["bilangan"]:
        d = parse_daftar(daftar.get(str(n)))
        if d is None or d != kpk_mod.daftar_kelipatan(n, len(d)) or target not in d:
            return False
    return True


def cek_cara_benar(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    if isian.get("cara") == "kelipatan" and tahap.get("boleh_kelipatan"):
        return _kelipatan_semua_benar(tahap, isian)
    return _faktorisasi_semua_benar(tahap, isian)


def cek_kpk_benar(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    return parse_bulat(isian.get("kpk")) == kpk_mod.kpk(*tahap["bilangan"])


def cek_urutan_naik(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    urutan = isian.get("urutan")
    if not isinstance(urutan, list):
        return False
    nilai = [parse_bulat(x) for x in urutan]
    return nilai == sorted(tahap["nilai"])


def cek_bagi_dari_tahap(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    """Setiap medan == nilai rujukan (dari isian siswa) : pembagi."""
    acuan = ambil_ref(rubrik["ref"], konteks)
    medan = isian.get("medan") or {}
    if acuan is None or not isinstance(medan, dict):
        return False
    return all(
        sama(parse_angka(medan.get(k)), acuan / p) for k, p in zip(rubrik["medan"], rubrik["pembagi"])
    )


def cek_jumlah_konsisten(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    medan = isian.get("medan") or {}
    if not isinstance(medan, dict):
        return False
    bagian = [parse_angka(medan.get(k)) for k in rubrik["bagian"]]
    if any(b is None for b in bagian):
        return False
    return sama(parse_angka(medan.get(rubrik["hasil"])), sum(bagian))  # type: ignore[arg-type]


def cek_konsisten_dengan(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    medan = isian.get("medan") or {}
    if not isinstance(medan, dict):
        return False
    return all(
        sama(parse_angka(medan.get(p["medan"])), ambil_ref(p["ref"], konteks)) for p in rubrik["pasangan"]
    )


def _tanggal_target(tahap: dict, konteks: Konteks) -> date | None:
    t = _ref_bulat_positif(tahap["ref"], konteks)
    if t is None:
        return None
    return date.fromisoformat(tahap["mulai"]) + timedelta(days=t)


def cek_tanggal_dari_tahap(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    target = _tanggal_target(tahap, konteks)
    if target is None:
        return False
    tgl, bln = parse_bulat(isian.get("tanggal")), parse_bulat(isian.get("bulan"))
    thn = parse_bulat(isian.get("tahun")) or target.year
    return (tgl, bln, thn) == (target.day, target.month, target.year)


def cek_hari_dari_tahap(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    target = _tanggal_target(tahap, konteks)
    if target is None:
        return False
    return parse_bulat(isian.get("pilih")) == target.weekday()  # 0 = Senin, sama dengan urutan opsi


def cek_waktu_dari_tahap(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    t = _ref_bulat_positif(tahap["ref"], konteks)
    mulai = parse_waktu(tahap["mulai"])
    jawab = parse_waktu(isian.get("waktu"))
    if t is None or mulai is None or jawab is None:
        return False
    return jawab == (mulai + t) % (24 * 60)


def cek_kesimpulan_benar(tahap: dict, rubrik: dict, isian: Isian, konteks: Konteks) -> bool:
    """Keputusan benar (atau konsisten dengan hasil siswa sendiri) DAN alasan yang dipilih benar."""
    if parse_bulat(isian.get("alasan")) != tahap["kunci_alasan"]:
        return False
    keputusan = parse_bulat(isian.get("keputusan"))
    if keputusan == tahap["kunci_keputusan"]:
        return True
    nilai = tahap.get("nilai_keputusan")
    if nilai and tahap.get("ref") and keputusan is not None and 0 <= keputusan < len(nilai):
        return sama(ambil_ref(tahap["ref"], konteks), nilai[keputusan])
    return False


CEK: dict[str, Callable[[dict, dict, Isian, Konteks], bool]] = {
    "pilihan_benar": cek_pilihan_benar,
    "centang_tepat": cek_centang_tepat,
    "cara_benar": cek_cara_benar,
    "kpk_benar": cek_kpk_benar,
    "urutan_naik": cek_urutan_naik,
    "bagi_dari_tahap": cek_bagi_dari_tahap,
    "jumlah_konsisten": cek_jumlah_konsisten,
    "konsisten_dengan": cek_konsisten_dengan,
    "tanggal_dari_tahap": cek_tanggal_dari_tahap,
    "hari_dari_tahap": cek_hari_dari_tahap,
    "waktu_dari_tahap": cek_waktu_dari_tahap,
    "kesimpulan_benar": cek_kesimpulan_benar,
}

TIPE_TAHAP = {
    "pilihan", "centang", "faktorisasi_kpk", "urutkan", "kesimpulan", "angka_ganda", "tanggal", "hari", "waktu",
}


# ---------------------------------------------------------------- penilaian soal


@dataclass
class HasilTahap:
    no: int
    skor: int
    skor_maks: int
    rincian: list[tuple[str, bool]] = field(default_factory=list)
    perlu_dinilai_guru: bool = False


def nilai_tahap(tahap: dict, isian: Isian | None, konteks: Konteks) -> HasilTahap:
    isian = isian or {}
    rincian: list[tuple[str, bool]] = []
    skor = 0
    for r in tahap["rubrik"]:
        try:
            lulus = bool(CEK[r["cek"]](tahap, r, isian, konteks))
        except (TypeError, ValueError, KeyError, ZeroDivisionError):
            lulus = False
        rincian.append((r["cek"], lulus))
        if lulus:
            skor += r["poin"]
    # Penjelasan teks bebas tidak dapat dinilai mesin: guru mengonfirmasi atau mengubah skornya.
    perlu_guru = tahap["tipe"] == "kesimpulan" and bool(str(isian.get("teks") or "").strip())
    return HasilTahap(tahap["no"], skor, tahap["skor_maks"], rincian, perlu_guru)


def nilai_soal(soal: dict, isian_per_tahap: dict[int, Isian]) -> list[HasilTahap]:
    """Menilai semua tahap satu soal. Tahap dinilai berurutan; konteks = isian tahap mana pun pada soal ini."""
    konteks: Konteks = {int(k): v for k, v in isian_per_tahap.items() if v}
    return [nilai_tahap(t, konteks.get(t["no"]), konteks) for t in soal["tahap"]]
