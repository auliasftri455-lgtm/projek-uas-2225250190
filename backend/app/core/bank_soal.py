"""Memuat dan memvalidasi bank soal dari shared/soal/."""

from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path

from .penilaian import CEK, TIPE_TAHAP

FOLDER_SOAL = Path(__file__).resolve().parents[3] / "shared" / "soal"

SKOR_PER_SOAL = 6
SKOR_TOTAL = 24
INDIKATOR = {
    "MR": "Mathematical Reasoning",
    "FS": "Formulating Situations Mathematically",
    "EM": "Employing Mathematical Concepts, Facts, and Procedures",
    "IE": "Interpreting, Applying, and Evaluating Mathematical Outcomes",
}

# Medan yang berisi kunci atau rubrik: tidak boleh dikirim ke klien.
MEDAN_RAHASIA = {"kunci", "kunci_alasan", "kunci_keputusan", "nilai_keputusan", "rubrik"}


class BankSoalTidakValid(ValueError):
    pass


def validasi(data: dict) -> None:
    soal = data.get("soal")
    if not isinstance(soal, list) or not soal:
        raise BankSoalTidakValid("Daftar soal kosong")
    total = 0
    for s in soal:
        if s["indikator"] not in INDIKATOR:
            raise BankSoalTidakValid(f"Soal {s['no']}: indikator tidak dikenal")
        skor_soal = 0
        nomor = [t["no"] for t in s["tahap"]]
        if nomor != list(range(1, len(nomor) + 1)):
            raise BankSoalTidakValid(f"Soal {s['no']}: nomor tahap harus 1..n berurutan")
        for t in s["tahap"]:
            if t["tipe"] not in TIPE_TAHAP:
                raise BankSoalTidakValid(f"Soal {s['no']} tahap {t['no']}: tipe {t['tipe']} tidak dikenal")
            poin = 0
            for r in t["rubrik"]:
                if r["cek"] not in CEK:
                    raise BankSoalTidakValid(f"Soal {s['no']} tahap {t['no']}: cek {r['cek']} tidak dikenal")
                poin += r["poin"]
            if poin != t["skor_maks"]:
                raise BankSoalTidakValid(f"Soal {s['no']} tahap {t['no']}: jumlah poin rubrik != skor_maks")
            skor_soal += t["skor_maks"]
        if skor_soal != SKOR_PER_SOAL:
            raise BankSoalTidakValid(f"Soal {s['no']}: skor maksimum {skor_soal}, seharusnya {SKOR_PER_SOAL}")
        total += skor_soal
    if total != SKOR_TOTAL:
        raise BankSoalTidakValid(f"Skor total {total}, seharusnya {SKOR_TOTAL}")


def _baca(nama: str) -> dict:
    with open(FOLDER_SOAL / nama, encoding="utf-8") as f:
        return json.load(f)


@lru_cache
def soal_literasi() -> dict:
    data = _baca("soal_literasi.json")
    validasi(data)
    return data


def soal_per_nomor() -> dict[int, dict]:
    return {s["no"]: s for s in soal_literasi()["soal"]}


def soal_literasi_publik() -> dict:
    """Salinan soal tanpa kunci dan rubrik, aman dikirim ke klien."""
    data = copy.deepcopy(soal_literasi())
    data.pop("keterangan", None)
    for s in data["soal"]:
        for t in s["tahap"]:
            for k in MEDAN_RAHASIA:
                t.pop(k, None)
    return data


@lru_cache
def diagnostik() -> dict:
    return _baca("diagnostik.json")


@lru_cache
def latihan() -> dict:
    return _baca("latihan.json")
