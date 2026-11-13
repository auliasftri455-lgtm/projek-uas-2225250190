"""Titik masuk aplikasi: API di /api, frontend statis di /."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import config
from .core import bank_soal
from .db import buat_sessionmaker
from .routers import guru, masuk, soal, tes


def create_app(database_url: str | None = None) -> FastAPI:
    bank_soal.soal_literasi()  # gagal cepat bila bank soal tidak valid

    app = FastAPI(title="KPK Langkah demi Langkah", docs_url="/api/docs", openapi_url="/api/openapi.json")
    app.state.SessionLocal = buat_sessionmaker(database_url or config.DATABASE_URL)

    for r in (masuk.router, soal.router, tes.router, guru.router):
        app.include_router(r)

    @app.get("/sw.js", include_in_schema=False)
    def service_worker() -> FileResponse:
        # Disajikan dari root agar cakupan service worker = seluruh aplikasi; jangan di-cache browser.
        return FileResponse(
            config.FOLDER_FRONTEND / "sw.js",
            media_type="application/javascript",
            headers={"Cache-Control": "no-cache"},
        )

    app.mount("/", StaticFiles(directory=config.FOLDER_FRONTEND, html=True), name="frontend")
    return app


app = create_app()
