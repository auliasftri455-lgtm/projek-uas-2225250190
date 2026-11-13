from __future__ import annotations

from fastapi import APIRouter

from ..core import bank_soal

router = APIRouter(prefix="/api/soal", tags=["soal"])


@router.get("/tes")
def soal_tes() -> dict:
    """Soal tes TANPA kunci dan rubrik."""
    return bank_soal.soal_literasi_publik()


@router.get("/diagnostik")
def soal_diagnostik() -> dict:
    return bank_soal.diagnostik()


@router.get("/latihan")
def soal_latihan() -> dict:
    return bank_soal.latihan()
