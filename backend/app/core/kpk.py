"""Logika inti KPK, FPB, dan faktorisasi prima.

Berkas ini adalah KEMBARAN dari frontend/js/kpk.js. Setiap perubahan di sini wajib diikuti
perubahan di sana, dan keduanya diuji dengan shared/test_vectors/kpk.json.
"""

from __future__ import annotations

Faktorisasi = dict[int, int]  # {bilangan_prima: pangkat}


def _cek_bilangan(n: int) -> None:
    if not isinstance(n, int) or isinstance(n, bool) or n < 1:
        raise ValueError(f"Bilangan harus bulat positif, bukan {n!r}")


def faktorisasi(n: int) -> Faktorisasi:
    """Faktorisasi prima. faktorisasi(24) == {2: 3, 3: 1}. faktorisasi(1) == {}."""
    _cek_bilangan(n)
    hasil: Faktorisasi = {}
    d = 2
    while d * d <= n:
        while n % d == 0:
            hasil[d] = hasil.get(d, 0) + 1
            n //= d
        d += 1
    if n > 1:
        hasil[n] = hasil.get(n, 0) + 1
    return hasil


def nilai_faktorisasi(f: Faktorisasi) -> int:
    """Mengalikan kembali faktorisasi: {2: 3, 3: 1} -> 24."""
    hasil = 1
    for p, e in f.items():
        hasil *= p**e
    return hasil


def fpb(*bilangan: int) -> int:
    if not bilangan:
        raise ValueError("Minimal satu bilangan")
    for n in bilangan:
        _cek_bilangan(n)
    hasil = bilangan[0]
    for n in bilangan[1:]:
        a, b = hasil, n
        while b:
            a, b = b, a % b
        hasil = a
    return hasil


def kpk(*bilangan: int) -> int:
    if not bilangan:
        raise ValueError("Minimal satu bilangan")
    for n in bilangan:
        _cek_bilangan(n)
    hasil = bilangan[0]
    for n in bilangan[1:]:
        hasil = hasil * n // fpb(hasil, n)
    return hasil


def kpk_dari_faktorisasi(daftar: list[Faktorisasi]) -> int:
    """Ambil setiap faktor prima dengan pangkat tertinggi, lalu kalikan."""
    gabungan: Faktorisasi = {}
    for f in daftar:
        for p, e in f.items():
            gabungan[p] = max(gabungan.get(p, 0), e)
    return nilai_faktorisasi(gabungan)


def daftar_kelipatan(n: int, banyak: int) -> list[int]:
    """daftar_kelipatan(8, 3) == [8, 16, 24]."""
    _cek_bilangan(n)
    return [n * i for i in range(1, banyak + 1)]
