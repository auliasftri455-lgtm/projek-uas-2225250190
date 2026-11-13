from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FOLDER_FRONTEND = ROOT / "frontend"

DATABASE_URL = os.environ.get("KPK_DATABASE_URL", f"sqlite:///{(ROOT / 'backend' / 'data.db').as_posix()}")

# Di hosting HTTPS, set KPK_COOKIE_SECURE=1 agar cookie hanya dikirim lewat HTTPS.
COOKIE_SECURE = os.environ.get("KPK_COOKIE_SECURE", "0") == "1"
NAMA_COOKIE = "kpk_token"
