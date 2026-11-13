from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import config
from ..auth import buat_token, cocok_pin, hash_pin, pengguna_saat_ini
from ..db import get_db
from ..models import Kelas, Pengguna, Token
from ..schemas import MasukGuru, MasukSiswa, Saya

router = APIRouter(prefix="/api", tags=["masuk"])


def _saya(db: Session, p: Pengguna) -> Saya:
    kelas = db.get(Kelas, p.kelas_id) if p.kelas_id else None
    return Saya(
        id=p.id,
        peran=p.peran,
        nama=p.nama,
        kode_siswa=p.kode_siswa if p.peran == "siswa" else None,
        kelas=kelas.nama if kelas else None,
    )


@router.post("/masuk/siswa", response_model=Saya)
def masuk_siswa(data: MasukSiswa, response: Response, db: Session = Depends(get_db)) -> Saya:
    kelas = db.scalar(select(Kelas).where(Kelas.kode == data.kode_kelas.strip().upper()))
    if kelas is None:
        raise HTTPException(404, "Kode kelas tidak ditemukan. Tanyakan kode kelas ke gurumu.")
    nama = " ".join(data.nama_panggilan.split())
    # Nama panggilan yang sama di kelas yang sama dianggap siswa yang sama (agar bisa melanjutkan dari HP lain).
    siswa = db.scalar(
        select(Pengguna).where(Pengguna.peran == "siswa", Pengguna.kelas_id == kelas.id, Pengguna.nama.ilike(nama))
    )
    if siswa is None:
        siswa = Pengguna(peran="siswa", nama=nama, kelas_id=kelas.id)
        db.add(siswa)
        db.commit()
    buat_token(db, siswa, response)
    return _saya(db, siswa)


@router.post("/masuk/guru", response_model=Saya)
def masuk_guru(data: MasukGuru, response: Response, db: Session = Depends(get_db)) -> Saya:
    guru = db.scalar(select(Pengguna).where(Pengguna.peran == "guru", Pengguna.nama == data.nama_pengguna.strip()))
    if guru is None or not cocok_pin(data.pin, guru.pin_hash):
        raise HTTPException(401, "Nama pengguna atau PIN salah")
    buat_token(db, guru, response)
    return _saya(db, guru)


@router.post("/daftar/guru", response_model=Saya, status_code=201)
def daftar_guru(data: MasukGuru, response: Response, db: Session = Depends(get_db)) -> Saya:
    nama = data.nama_pengguna.strip()
    if db.scalar(select(Pengguna).where(Pengguna.peran == "guru", Pengguna.nama == nama)):
        raise HTTPException(409, "Nama pengguna sudah dipakai")
    guru = Pengguna(peran="guru", nama=nama, pin_hash=hash_pin(data.pin))
    db.add(guru)
    db.commit()
    buat_token(db, guru, response)
    return _saya(db, guru)


@router.get("/saya", response_model=Saya)
def saya(p: Pengguna = Depends(pengguna_saat_ini), db: Session = Depends(get_db)) -> Saya:
    return _saya(db, p)


@router.post("/keluar", status_code=204)
def keluar(request: Request, response: Response, db: Session = Depends(get_db)) -> None:
    token = request.cookies.get(config.NAMA_COOKIE)
    if token and (t := db.get(Token, token)):
        db.delete(t)
        db.commit()
    response.delete_cookie(config.NAMA_COOKIE)
