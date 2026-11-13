from __future__ import annotations

import csv
import io
import json
import secrets

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import guru_saat_ini
from ..core import bank_soal
from ..db import get_db
from ..layanan import hitung_log, rekap_sesi
from ..models import JawabanTahap, Kelas, Pengguna, SesiTes
from ..schemas import BuatKelas, NilaiGuru

router = APIRouter(prefix="/api/guru", tags=["guru"])

HURUF_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # tanpa O/0/I/1 agar tidak tertukar


def _kelas_milik(db: Session, kelas_id: int, guru: Pengguna) -> Kelas:
    kelas = db.get(Kelas, kelas_id)
    if kelas is None or kelas.guru_id != guru.id:
        raise HTTPException(404, "Kelas tidak ditemukan")
    return kelas


def _sesi_kelas(db: Session, kelas: Kelas) -> list[SesiTes]:
    return list(
        db.scalars(
            select(SesiTes)
            .join(Pengguna, SesiTes.siswa_id == Pengguna.id)
            .where(Pengguna.kelas_id == kelas.id)
            .order_by(Pengguna.id, SesiTes.jenis.desc(), SesiTes.id)
        ).all()
    )


@router.post("/kelas", status_code=201)
def buat_kelas(data: BuatKelas, guru: Pengguna = Depends(guru_saat_ini), db: Session = Depends(get_db)) -> dict:
    while True:
        kode = "".join(secrets.choice(HURUF_KODE) for _ in range(6))
        if not db.scalar(select(Kelas).where(Kelas.kode == kode)):
            break
    kelas = Kelas(kode=kode, nama=data.nama.strip(), guru_id=guru.id)
    db.add(kelas)
    db.commit()
    return {"id": kelas.id, "kode": kelas.kode, "nama": kelas.nama, "jumlah_siswa": 0}


@router.get("/kelas")
def daftar_kelas(guru: Pengguna = Depends(guru_saat_ini), db: Session = Depends(get_db)) -> list[dict]:
    hasil = []
    for k in db.scalars(select(Kelas).where(Kelas.guru_id == guru.id).order_by(Kelas.id)).all():
        jumlah = len(db.scalars(select(Pengguna.id).where(Pengguna.kelas_id == k.id)).all())
        hasil.append({"id": k.id, "kode": k.kode, "nama": k.nama, "jumlah_siswa": jumlah})
    return hasil


@router.get("/kelas/{kelas_id}/hasil")
def hasil_kelas(kelas_id: int, guru: Pengguna = Depends(guru_saat_ini), db: Session = Depends(get_db)) -> dict:
    kelas = _kelas_milik(db, kelas_id, guru)
    siswa = db.scalars(select(Pengguna).where(Pengguna.kelas_id == kelas.id).order_by(Pengguna.id)).all()
    sesi_per_siswa: dict[int, list[dict]] = {}
    for s in _sesi_kelas(db, kelas):
        if s.selesai:
            sesi_per_siswa.setdefault(s.siswa_id, []).append(rekap_sesi(s))
    return {
        "kelas": {"id": kelas.id, "kode": kelas.kode, "nama": kelas.nama},
        "indikator": bank_soal.INDIKATOR,
        "siswa": [
            {"kode_siswa": p.kode_siswa, "nama": p.nama, "sesi": sesi_per_siswa.get(p.id, [])} for p in siswa
        ],
    }


@router.get("/kelas/{kelas_id}/penilaian")
def antrean_penilaian(
    kelas_id: int, guru: Pengguna = Depends(guru_saat_ini), db: Session = Depends(get_db)
) -> list[dict]:
    """Jawaban berisi penjelasan teks yang perlu dikonfirmasi guru."""
    kelas = _kelas_milik(db, kelas_id, guru)
    soal = bank_soal.soal_per_nomor()
    hasil = []
    for s in _sesi_kelas(db, kelas):
        if not s.selesai:
            continue
        for j in s.jawaban:
            if not j.perlu_dinilai_guru:
                continue
            tahap = next(t for t in soal[j.soal_no]["tahap"] if t["no"] == j.tahap_no)
            isian = json.loads(j.isian_json)

            def opsi(daftar: list[str], i: object) -> str | None:
                return daftar[i] if isinstance(i, int) and 0 <= i < len(daftar) else None

            hasil.append({
                "jawaban_id": j.id,
                "kode_siswa": s.siswa.kode_siswa,
                "nama": s.siswa.nama,
                "jenis": s.jenis,
                "soal_no": j.soal_no,
                "judul": soal[j.soal_no]["judul"],
                "tahap_no": j.tahap_no,
                "instruksi": tahap["instruksi"],
                "keputusan": opsi(tahap.get("opsi_keputusan", []), isian.get("keputusan")),
                "alasan": opsi(tahap.get("opsi_alasan", []), isian.get("alasan")),
                "teks": isian.get("teks", ""),
                "skor_maks": tahap["skor_maks"],
                "skor_otomatis": j.skor_otomatis,
                "skor_guru": j.skor_guru,
                "komentar_guru": j.komentar_guru,
            })
    return hasil


@router.patch("/jawaban/{jawaban_id}")
def nilai_jawaban(
    jawaban_id: int, data: NilaiGuru, guru: Pengguna = Depends(guru_saat_ini), db: Session = Depends(get_db)
) -> dict:
    j = db.get(JawabanTahap, jawaban_id)
    if j is None:
        raise HTTPException(404, "Jawaban tidak ditemukan")
    siswa = j.sesi.siswa
    _kelas_milik(db, siswa.kelas_id or 0, guru)
    tahap = next(t for t in bank_soal.soal_per_nomor()[j.soal_no]["tahap"] if t["no"] == j.tahap_no)
    if data.skor_guru is not None and data.skor_guru > tahap["skor_maks"]:
        raise HTTPException(422, f"Skor maksimum tahap ini {tahap['skor_maks']}")
    j.skor_guru = data.skor_guru
    j.komentar_guru = data.komentar
    db.commit()
    return {"jawaban_id": j.id, "skor_guru": j.skor_guru, "skor_akhir": j.skor_akhir}


@router.get("/kelas/{kelas_id}/ekspor.csv")
def ekspor_csv(kelas_id: int, guru: Pengguna = Depends(guru_saat_ini), db: Session = Depends(get_db)):
    """CSV untuk analisis penelitian. Hanya kode siswa, tanpa nama."""
    kelas = _kelas_milik(db, kelas_id, guru)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow([
        "kode_siswa", "sesi", "skor_MR", "skor_FS", "skor_EM", "skor_IE", "total",
        "waktu_pengerjaan_menit", "jumlah_petunjuk", "jumlah_buka_catatan", "menunggu_penilaian_guru",
    ])
    for s in _sesi_kelas(db, kelas):
        if not s.selesai:
            continue
        r = rekap_sesi(s)
        log = hitung_log(db, s)
        w.writerow([
            s.siswa.kode_siswa, s.jenis, r["skor"]["MR"], r["skor"]["FS"], r["skor"]["EM"], r["skor"]["IE"],
            r["total"], r["durasi_menit"], log["petunjuk"], log["buka_catatan"], r["menunggu_guru"],
        ])
    nama_file = f"hasil_{kelas.kode}.csv"
    return StreamingResponse(
        iter(["﻿" + buf.getvalue()]),  # BOM agar Excel membaca UTF-8 dengan benar
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{nama_file}"'},
    )
