from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import siswa_saat_ini
from ..core import bank_soal
from ..db import get_db
from ..layanan import nilai_sesi, rekap_sesi
from ..models import JawabanTahap, LogAktivitas, Pengguna, SesiTes, sekarang
from ..schemas import JawabTahap, KirimLog, MulaiTes

router = APIRouter(prefix="/api", tags=["tes"])


def _sesi_milik(db: Session, sesi_id: int, siswa: Pengguna) -> SesiTes:
    sesi = db.get(SesiTes, sesi_id)
    if sesi is None or sesi.siswa_id != siswa.id:
        raise HTTPException(404, "Sesi tes tidak ditemukan")
    return sesi


@router.post("/tes/mulai")
def mulai(data: MulaiTes, siswa: Pengguna = Depends(siswa_saat_ini), db: Session = Depends(get_db)) -> dict:
    """Membuat sesi baru, atau melanjutkan sesi jenis yang sama yang belum selesai."""
    sesi = db.scalar(
        select(SesiTes).where(SesiTes.siswa_id == siswa.id, SesiTes.jenis == data.jenis, SesiTes.selesai.is_(None))
    )
    if sesi is None:
        sesi = SesiTes(siswa_id=siswa.id, jenis=data.jenis)
        db.add(sesi)
        db.commit()
    jawaban: dict[str, dict[str, dict]] = {}
    for j in sesi.jawaban:
        jawaban.setdefault(str(j.soal_no), {})[str(j.tahap_no)] = json.loads(j.isian_json)
    return {"sesi_id": sesi.id, "jenis": sesi.jenis, "jawaban": jawaban}


@router.post("/tes/{sesi_id}/jawab")
def jawab(
    sesi_id: int, data: JawabTahap, siswa: Pengguna = Depends(siswa_saat_ini), db: Session = Depends(get_db)
) -> dict:
    sesi = _sesi_milik(db, sesi_id, siswa)
    if sesi.selesai:
        raise HTTPException(409, "Tes ini sudah selesai")
    soal = bank_soal.soal_per_nomor().get(data.soal_no)
    if soal is None or not any(t["no"] == data.tahap_no for t in soal["tahap"]):
        raise HTTPException(422, "Nomor soal atau tahap tidak dikenal")
    isian_json = json.dumps(data.isian, ensure_ascii=False)
    if len(isian_json) > 4000:
        raise HTTPException(413, "Isian terlalu panjang")
    j = db.scalar(
        select(JawabanTahap).where(
            JawabanTahap.sesi_id == sesi.id,
            JawabanTahap.soal_no == data.soal_no,
            JawabanTahap.tahap_no == data.tahap_no,
        )
    )
    if j is None:
        j = JawabanTahap(sesi_id=sesi.id, soal_no=data.soal_no, tahap_no=data.tahap_no)
        db.add(j)
    j.isian_json = isian_json
    db.commit()
    # Skor sengaja tidak dikirim selama tes berlangsung.
    return {"tersimpan": True}


@router.post("/tes/{sesi_id}/selesai")
def selesai(sesi_id: int, siswa: Pengguna = Depends(siswa_saat_ini), db: Session = Depends(get_db)) -> dict:
    sesi = _sesi_milik(db, sesi_id, siswa)
    if sesi.selesai is None:
        sesi.selesai = sekarang()
        db.commit()
    nilai_sesi(db, sesi)
    return rekap_sesi(sesi)


@router.get("/tes/riwayat")
def riwayat(siswa: Pengguna = Depends(siswa_saat_ini), db: Session = Depends(get_db)) -> list[dict]:
    daftar = db.scalars(
        select(SesiTes).where(SesiTes.siswa_id == siswa.id, SesiTes.selesai.is_not(None)).order_by(SesiTes.id)
    ).all()
    return [rekap_sesi(s) for s in daftar]


@router.post("/log", status_code=204)
def kirim_log(data: KirimLog, siswa: Pengguna = Depends(siswa_saat_ini), db: Session = Depends(get_db)) -> None:
    for e in data.entri:
        db.add(LogAktivitas(siswa_id=siswa.id, jenis=e.jenis, data_json=json.dumps(e.data, ensure_ascii=False)[:2000]))
    db.commit()
