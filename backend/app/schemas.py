from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class MasukSiswa(BaseModel):
    kode_kelas: str = Field(min_length=3, max_length=12)
    nama_panggilan: str = Field(min_length=1, max_length=40)


class MasukGuru(BaseModel):
    nama_pengguna: str = Field(min_length=3, max_length=40)
    pin: str = Field(min_length=4, max_length=12)


class Saya(BaseModel):
    id: int
    peran: str
    nama: str
    kode_siswa: str | None = None
    kelas: str | None = None


class MulaiTes(BaseModel):
    jenis: Literal["pre", "post"]


class JawabTahap(BaseModel):
    soal_no: int = Field(ge=1, le=4)
    tahap_no: int = Field(ge=1, le=10)
    isian: dict[str, Any]


class EntriLog(BaseModel):
    jenis: Literal["petunjuk", "buka_catatan", "latihan", "diagnostik", "beban"]
    data: dict[str, Any] = {}


class KirimLog(BaseModel):
    entri: list[EntriLog] = Field(max_length=200)


class BuatKelas(BaseModel):
    nama: str = Field(min_length=1, max_length=80)


class NilaiGuru(BaseModel):
    skor_guru: int | None = Field(default=None, ge=0, le=2)
    komentar: str | None = Field(default=None, max_length=500)
