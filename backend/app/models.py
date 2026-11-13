from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def sekarang() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


class Base(DeclarativeBase):
    pass


class Kelas(Base):
    __tablename__ = "kelas"
    id: Mapped[int] = mapped_column(primary_key=True)
    kode: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    nama: Mapped[str] = mapped_column(String(80))
    guru_id: Mapped[int] = mapped_column(ForeignKey("pengguna.id"))
    dibuat: Mapped[datetime] = mapped_column(default=sekarang)


class Pengguna(Base):
    __tablename__ = "pengguna"
    id: Mapped[int] = mapped_column(primary_key=True)
    peran: Mapped[str] = mapped_column(String(10))  # "siswa" | "guru"
    nama: Mapped[str] = mapped_column(String(40))  # nama panggilan siswa / nama pengguna guru
    kelas_id: Mapped[int | None] = mapped_column(ForeignKey("kelas.id", use_alter=True), default=None)
    pin_hash: Mapped[str | None] = mapped_column(String(200), default=None)
    dibuat: Mapped[datetime] = mapped_column(default=sekarang)

    @property
    def kode_siswa(self) -> str:
        return f"S{self.id:03d}"


class Token(Base):
    __tablename__ = "token"
    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    pengguna_id: Mapped[int] = mapped_column(ForeignKey("pengguna.id"), index=True)
    dibuat: Mapped[datetime] = mapped_column(default=sekarang)
    pengguna: Mapped[Pengguna] = relationship()


class SesiTes(Base):
    __tablename__ = "sesi_tes"
    id: Mapped[int] = mapped_column(primary_key=True)
    siswa_id: Mapped[int] = mapped_column(ForeignKey("pengguna.id"), index=True)
    jenis: Mapped[str] = mapped_column(String(10))  # "pre" | "post"
    mulai: Mapped[datetime] = mapped_column(default=sekarang)
    selesai: Mapped[datetime | None] = mapped_column(default=None)
    siswa: Mapped[Pengguna] = relationship()
    jawaban: Mapped[list[JawabanTahap]] = relationship(back_populates="sesi", cascade="all, delete-orphan")


class JawabanTahap(Base):
    __tablename__ = "jawaban_tahap"
    __table_args__ = (UniqueConstraint("sesi_id", "soal_no", "tahap_no"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    sesi_id: Mapped[int] = mapped_column(ForeignKey("sesi_tes.id"), index=True)
    soal_no: Mapped[int]
    tahap_no: Mapped[int]
    isian_json: Mapped[str] = mapped_column(Text, default="{}")
    skor_otomatis: Mapped[int | None] = mapped_column(default=None)
    skor_guru: Mapped[int | None] = mapped_column(default=None)
    komentar_guru: Mapped[str | None] = mapped_column(Text, default=None)
    perlu_dinilai_guru: Mapped[bool] = mapped_column(default=False)
    diperbarui: Mapped[datetime] = mapped_column(default=sekarang, onupdate=sekarang)
    sesi: Mapped[SesiTes] = relationship(back_populates="jawaban")

    @property
    def skor_akhir(self) -> int:
        if self.skor_guru is not None:
            return self.skor_guru
        return self.skor_otomatis or 0


class LogAktivitas(Base):
    __tablename__ = "log_aktivitas"
    id: Mapped[int] = mapped_column(primary_key=True)
    siswa_id: Mapped[int] = mapped_column(ForeignKey("pengguna.id"), index=True)
    jenis: Mapped[str] = mapped_column(String(20))  # petunjuk | buka_catatan | latihan | diagnostik | beban
    data_json: Mapped[str] = mapped_column(Text, default="{}")
    waktu: Mapped[datetime] = mapped_column(default=sekarang)
