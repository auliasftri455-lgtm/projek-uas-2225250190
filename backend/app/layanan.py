"""Operasi gabungan: menilai sesi tes dan menyusun rekap skor."""

from __future__ import annotations

import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from .core import bank_soal, penilaian
from .models import JawabanTahap, LogAktivitas, SesiTes


def nilai_sesi(db: Session, sesi: SesiTes) -> None:
    """Menilai ulang semua jawaban sesi. Skor guru yang sudah ada tidak diubah."""
    per_soal: dict[int, dict[int, JawabanTahap]] = {}
    for j in sesi.jawaban:
        per_soal.setdefault(j.soal_no, {})[j.tahap_no] = j

    for no, soal in bank_soal.soal_per_nomor().items():
        baris = per_soal.get(no, {})
        isian = {t: json.loads(j.isian_json) for t, j in baris.items()}
        for hasil in penilaian.nilai_soal(soal, isian):
            j = baris.get(hasil.no)
            if j is None:
                continue
            j.skor_otomatis = hasil.skor
            j.perlu_dinilai_guru = hasil.perlu_dinilai_guru
    db.commit()


def rekap_sesi(sesi: SesiTes) -> dict:
    skor = {k: 0 for k in bank_soal.INDIKATOR}
    indikator_soal = {no: s["indikator"] for no, s in bank_soal.soal_per_nomor().items()}
    menunggu_guru = 0
    for j in sesi.jawaban:
        ind = indikator_soal.get(j.soal_no)
        if ind:
            skor[ind] += j.skor_akhir
        if j.perlu_dinilai_guru and j.skor_guru is None:
            menunggu_guru += 1
    durasi = None
    if sesi.selesai:
        durasi = round((sesi.selesai - sesi.mulai).total_seconds() / 60, 1)
    return {
        "sesi_id": sesi.id,
        "jenis": sesi.jenis,
        "selesai": sesi.selesai is not None,
        "skor": skor,
        "total": sum(skor.values()),
        "total_maks": bank_soal.SKOR_TOTAL,
        "menunggu_guru": menunggu_guru,
        "durasi_menit": durasi,
    }


def hitung_log(db: Session, sesi: SesiTes) -> dict[str, int]:
    """Jumlah petunjuk dan buka catatan selama sesi tes berlangsung."""
    q = select(LogAktivitas.jenis).where(
        LogAktivitas.siswa_id == sesi.siswa_id, LogAktivitas.waktu >= sesi.mulai
    )
    if sesi.selesai:
        q = q.where(LogAktivitas.waktu <= sesi.selesai)
    jenis = db.scalars(q).all()
    return {"petunjuk": jenis.count("petunjuk"), "buka_catatan": jenis.count("buka_catatan")}
