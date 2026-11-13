import json
from pathlib import Path

import pytest

from app.core import kpk

VEKTOR = json.loads((Path(__file__).resolve().parents[2] / "shared/test_vectors/kpk.json").read_text("utf-8"))


@pytest.mark.parametrize("kasus", VEKTOR["kasus"], ids=lambda k: str(k["bilangan"]))
def test_vektor_bersama(kasus):
    b = kasus["bilangan"]
    assert kpk.kpk(*b) == kasus["kpk"]
    assert kpk.fpb(*b) == kasus["fpb"]
    faktor = [kpk.faktorisasi(n) for n in b]
    for n, f in zip(b, faktor):
        assert {str(p): e for p, e in f.items()} == kasus["faktorisasi"][str(n)]
        assert kpk.nilai_faktorisasi(f) == n
    assert kpk.kpk_dari_faktorisasi(faktor) == kasus["kpk"]


def test_daftar_kelipatan():
    assert kpk.daftar_kelipatan(8, 3) == [8, 16, 24]


@pytest.mark.parametrize("salah", [0, -3, 2.5, True, "8"])
def test_input_tidak_valid(salah):
    with pytest.raises(ValueError):
        kpk.kpk(4, salah)
