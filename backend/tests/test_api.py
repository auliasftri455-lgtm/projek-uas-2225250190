import pytest
from fastapi.testclient import TestClient

from app.main import create_app

from .test_penilaian import KUNCI


@pytest.fixture
def app(tmp_path):
    return create_app(f"sqlite:///{(tmp_path / 'uji.db').as_posix()}")


@pytest.fixture
def guru(app):
    c = TestClient(app)
    r = c.post("/api/daftar/guru", json={"nama_pengguna": "bu_guru", "pin": "1234"})
    assert r.status_code == 201
    return c


@pytest.fixture
def kelas(guru):
    r = guru.post("/api/guru/kelas", json={"nama": "VII A"})
    assert r.status_code == 201
    return r.json()


def siswa_masuk(app, kode, nama="Indah"):
    c = TestClient(app)
    r = c.post("/api/masuk/siswa", json={"kode_kelas": kode, "nama_panggilan": nama})
    assert r.status_code == 200, r.text
    return c


def kerjakan_semua(c, jenis="pre"):
    sesi = c.post("/api/tes/mulai", json={"jenis": jenis}).json()["sesi_id"]
    for no, tahap in KUNCI.items():
        for t, isian in tahap.items():
            r = c.post(f"/api/tes/{sesi}/jawab", json={"soal_no": no, "tahap_no": t, "isian": isian})
            assert r.json() == {"tersimpan": True}
    return sesi


def test_alur_lengkap_skor_24(app, guru, kelas):
    c = siswa_masuk(app, kelas["kode"])
    sesi = kerjakan_semua(c)
    rekap = c.post(f"/api/tes/{sesi}/selesai").json()
    assert rekap["total"] == 24
    assert rekap["skor"] == {"MR": 6, "FS": 6, "EM": 6, "IE": 6}
    assert rekap["menunggu_guru"] == 1  # soal 4 tahap 6 berisi teks

    hasil = guru.get(f"/api/guru/kelas/{kelas['id']}/hasil").json()
    assert hasil["siswa"][0]["sesi"][0]["total"] == 24

    antre = guru.get(f"/api/guru/kelas/{kelas['id']}/penilaian").json()
    assert len(antre) == 1 and antre[0]["teks"].startswith("Tidak setuju")
    r = guru.patch(f"/api/guru/jawaban/{antre[0]['jawaban_id']}", json={"skor_guru": 0, "komentar": "Kurang"})
    assert r.json()["skor_akhir"] == 0
    assert c.get("/api/tes/riwayat").json()[0]["total"] == 23

    csv = guru.get(f"/api/guru/kelas/{kelas['id']}/ekspor.csv").text
    kode = c.get("/api/saya").json()["kode_siswa"]
    assert f"{kode},pre,6,6,6,5,23," in csv
    assert "Indah" not in csv  # ekspor tanpa nama


def test_soal_tes_tanpa_kunci(app):
    teks = TestClient(app).get("/api/soal/tes").text
    assert "kunci" not in teks and "rubrik" not in teks


def test_siswa_melanjutkan_sesi(app, kelas):
    c = siswa_masuk(app, kelas["kode"])
    s1 = c.post("/api/tes/mulai", json={"jenis": "pre"}).json()
    c.post(f"/api/tes/{s1['sesi_id']}/jawab", json={"soal_no": 1, "tahap_no": 1, "isian": {"pilih": 0}})
    c2 = siswa_masuk(app, kelas["kode"], nama="  indah ")  # HP lain, nama sama
    s2 = c2.post("/api/tes/mulai", json={"jenis": "pre"}).json()
    assert s2["sesi_id"] == s1["sesi_id"]
    assert s2["jawaban"] == {"1": {"1": {"pilih": 0}}}


def test_hak_akses(app, guru, kelas):
    c = siswa_masuk(app, kelas["kode"])
    assert c.get(f"/api/guru/kelas/{kelas['id']}/hasil").status_code == 403
    assert TestClient(app).post("/api/tes/mulai", json={"jenis": "pre"}).status_code == 401
    lain = siswa_masuk(app, kelas["kode"], nama="Budi")
    sesi = kerjakan_semua(c)
    assert lain.post(f"/api/tes/{sesi}/selesai").status_code == 404
    # guru lain tidak bisa melihat kelas ini
    g2 = TestClient(app)
    g2.post("/api/daftar/guru", json={"nama_pengguna": "pak_guru", "pin": "9999"})
    assert g2.get(f"/api/guru/kelas/{kelas['id']}/hasil").status_code == 404


def test_masuk_salah(app, guru):
    c = TestClient(app)
    assert c.post("/api/masuk/siswa", json={"kode_kelas": "ZZZZZZ", "nama_panggilan": "A"}).status_code == 404
    assert c.post("/api/masuk/guru", json={"nama_pengguna": "bu_guru", "pin": "0000"}).status_code == 401


def test_tes_selesai_tidak_bisa_diubah(app, kelas):
    c = siswa_masuk(app, kelas["kode"])
    sesi = kerjakan_semua(c)
    c.post(f"/api/tes/{sesi}/selesai")
    r = c.post(f"/api/tes/{sesi}/jawab", json={"soal_no": 1, "tahap_no": 1, "isian": {"pilih": 1}})
    assert r.status_code == 409


def test_log(app, kelas):
    c = siswa_masuk(app, kelas["kode"])
    r = c.post("/api/log", json={"entri": [{"jenis": "petunjuk", "data": {"level": 1}}]})
    assert r.status_code == 204
