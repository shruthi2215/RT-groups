"""
Tests for new endpoints: POST /api/upload/image and GET /api/files/{path}
Run: pytest /app/backend/tests/test_upload.py -v --tb=short
"""
import os
import io
import uuid
import struct
import zlib
import pytest
import requests
from dotenv import load_dotenv

load_dotenv('/app/frontend/.env')
BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@rtgroups.info"
ADMIN_PASSWORD = "RTGroups@2026"


def _make_png_bytes(width: int = 2, height: int = 2) -> bytes:
    """Build a minimal valid PNG in-memory."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)  # 8-bit RGB
    raw = b""
    for _ in range(height):
        raw += b"\x00" + b"\xff\x00\x00" * width  # filter byte + red pixels
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                     headers={"Content-Type": "application/json"}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def user_token(session):
    suffix = uuid.uuid4().hex[:8]
    payload = {
        "name": "TEST_UploadUser",
        "email": f"TEST_upload_{suffix}@example.com",
        "phone": "+911234567890",
        "password": "TestPass@123"
    }
    r = session.post(f"{API}/auth/register", json=payload,
                     headers={"Content-Type": "application/json"}, timeout=15)
    assert r.status_code == 200, f"Register failed: {r.text}"
    return r.json()["token"]


class TestUploadImage:
    """POST /api/upload/image"""

    def test_upload_as_admin_returns_id_url_size(self, session, admin_token):
        png = _make_png_bytes()
        files = {"file": ("test.png", png, "image/png")}
        r = session.post(f"{API}/upload/image", files=files,
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=60)
        assert r.status_code == 200, f"Upload failed: {r.status_code} {r.text}"
        d = r.json()
        assert "id" in d and "url" in d and "size" in d
        assert d["url"].startswith("/api/files/rtgroups/properties/")
        assert d["url"].endswith(".png")
        assert isinstance(d["size"], int) and d["size"] == len(png)
        # stash for download test
        TestUploadImage.uploaded_url = d["url"]
        TestUploadImage.uploaded_id = d["id"]

    def test_upload_non_admin_forbidden(self, session, user_token):
        png = _make_png_bytes()
        files = {"file": ("hacker.png", png, "image/png")}
        r = session.post(f"{API}/upload/image", files=files,
                         headers={"Authorization": f"Bearer {user_token}"}, timeout=30)
        assert r.status_code == 403, f"expected 403, got {r.status_code} {r.text}"

    def test_upload_without_token_unauthorized(self, session):
        png = _make_png_bytes()
        files = {"file": ("anon.png", png, "image/png")}
        r = session.post(f"{API}/upload/image", files=files, timeout=30)
        assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}"

    def test_upload_invalid_file_type_txt(self, session, admin_token):
        files = {"file": ("notes.txt", b"hello world", "text/plain")}
        r = session.post(f"{API}/upload/image", files=files,
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 400, f"expected 400, got {r.status_code} {r.text}"

    def test_upload_invalid_extension_bmp(self, session, admin_token):
        # content_type image/* but bad extension should 400
        files = {"file": ("image.bmp", b"BM" + b"\x00" * 100, "image/bmp")}
        r = session.post(f"{API}/upload/image", files=files,
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 400

    def test_upload_too_large_rejected(self, session, admin_token):
        # 10MB + 1 byte
        big = b"\x00" * (10 * 1024 * 1024 + 1)
        files = {"file": ("big.png", big, "image/png")}
        r = session.post(f"{API}/upload/image", files=files,
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=120)
        assert r.status_code == 400, f"expected 400, got {r.status_code} {r.text}"


class TestFileDownload:
    """GET /api/files/{path}"""

    def test_download_uploaded_file_public(self, session):
        url = getattr(TestUploadImage, "uploaded_url", None)
        assert url, "upload test did not run - no url to download"
        r = session.get(f"{BASE_URL}{url}", timeout=60)
        assert r.status_code == 200, f"download failed: {r.status_code} {r.text[:200]}"
        ct = r.headers.get("Content-Type", "")
        assert ct.startswith("image/"), f"expected image/*, got {ct}"
        assert len(r.content) > 0

    def test_download_nonexistent_returns_404(self, session):
        fake = f"rtgroups/properties/{uuid.uuid4()}.png"
        r = session.get(f"{API}/files/{fake}", timeout=30)
        assert r.status_code == 404, f"expected 404, got {r.status_code} {r.text[:200]}"


class TestPropertyWithUploadedImages:
    """Integration: admin uploads image then creates property with the URL."""

    def test_create_property_with_uploaded_image(self, session, admin_token):
        # upload
        png = _make_png_bytes()
        files = {"file": ("prop.png", png, "image/png")}
        up = session.post(f"{API}/upload/image", files=files,
                          headers={"Authorization": f"Bearer {admin_token}"}, timeout=60)
        assert up.status_code == 200, up.text
        image_url = up.json()["url"]

        # create property using that url
        payload = {
            "title": "TEST_PropWithImg",
            "description": "prop with real uploaded image",
            "price": 9999999,
            "location": "TestTown",
            "type": "Villa",
            "bedrooms": 3,
            "bathrooms": 2,
            "area": 1800,
            "images": [image_url]
        }
        r = session.post(f"{API}/properties", json=payload,
                         headers={"Authorization": f"Bearer {admin_token}",
                                  "Content-Type": "application/json"}, timeout=30)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        assert r.json()["images"] == [image_url]

        # GET verify persisted
        g = session.get(f"{API}/properties/{pid}", timeout=15)
        assert g.status_code == 200
        assert image_url in g.json()["images"]

        # fetch the image through the stored URL
        img = session.get(f"{BASE_URL}{image_url}", timeout=30)
        assert img.status_code == 200
        assert img.headers.get("Content-Type", "").startswith("image/")
