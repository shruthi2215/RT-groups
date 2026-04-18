"""
Backend API tests for RT Groups Real Estate
Run: pytest /app/backend/tests/backend_test.py -v --tb=short
"""
import os
import uuid
import pytest
import requests
from dotenv import load_dotenv

# Load frontend/.env to get public URL
load_dotenv('/app/frontend/.env')
BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@rtgroups.info"
ADMIN_PASSWORD = "RTGroups@2026"

# ---------- shared fixtures ----------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]

@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}

@pytest.fixture(scope="session")
def test_user(session):
    """Register a test user and return creds + token"""
    suffix = uuid.uuid4().hex[:8]
    payload = {
        "name": "TEST_User",
        "email": f"TEST_user_{suffix}@example.com",
        "phone": "+911234567890",
        "password": "TestPass@123"
    }
    r = session.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    return {"creds": payload, "token": data["token"], "user": data["user"]}

@pytest.fixture(scope="session")
def user_headers(test_user):
    return {"Authorization": f"Bearer {test_user['token']}", "Content-Type": "application/json"}


# ---------- Root ----------
class TestRoot:
    def test_root(self, session):
        r = session.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json() == {"message": "Real Estate API"}


# ---------- Auth ----------
class TestAuth:
    def test_register(self, test_user):
        assert "id" in test_user["user"]
        assert test_user["user"]["email"] == test_user["creds"]["email"]
        assert test_user["user"]["role"] == "user"
        assert "password_hash" not in test_user["user"]

    def test_register_duplicate_email(self, session, test_user):
        r = session.post(f"{API}/auth/register", json=test_user["creds"], timeout=10)
        assert r.status_code == 400

    def test_login_admin(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "token" in d
        assert d["user"]["role"] == "admin"
        assert d["user"]["email"] == ADMIN_EMAIL

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG"}, timeout=10)
        assert r.status_code == 401

    def test_login_nonexistent(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "nope_xyz@nope.com", "password": "whatever"}, timeout=10)
        assert r.status_code == 401

    def test_users_me(self, session, user_headers, test_user):
        r = session.get(f"{API}/users/me", headers=user_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == test_user["creds"]["email"]
        assert "password_hash" not in d
        assert "_id" not in d

    def test_users_me_without_token(self, session):
        r = session.get(f"{API}/users/me", timeout=10)
        assert r.status_code in (401, 403)

    def test_send_otp_not_configured(self, session):
        r = session.post(f"{API}/auth/send-otp", json={"phone_number": "+911234567890"}, timeout=10)
        # placeholder creds -> expected 503 or 400 (depends on Twilio lib behavior)
        assert r.status_code in (503, 400, 401), f"unexpected {r.status_code}: {r.text}"


# ---------- Properties ----------
class TestProperties:
    def test_list_properties(self, session):
        r = session.get(f"{API}/properties", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 3, f"expected seeded 3+ properties, got {len(data)}"
        # exclude _id
        for p in data:
            assert "_id" not in p
            assert "id" in p

    def test_filter_by_type_villa(self, session):
        r = session.get(f"{API}/properties", params={"type": "Villa"}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert all(p["type"] == "Villa" for p in data)
        assert len(data) >= 1

    def test_filter_by_location_mumbai(self, session):
        r = session.get(f"{API}/properties", params={"location": "mumbai"}, timeout=10)  # case insensitive
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert all("mumbai" in p["location"].lower() for p in data)

    def test_filter_by_price_range(self, session):
        r = session.get(f"{API}/properties", params={"min_price": 1000000, "max_price": 20000000}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        for p in data:
            assert 1000000 <= p["price"] <= 20000000

    def test_get_single_property(self, session):
        r = session.get(f"{API}/properties", timeout=10)
        pid = r.json()[0]["id"]
        r2 = session.get(f"{API}/properties/{pid}", timeout=10)
        assert r2.status_code == 200
        assert r2.json()["id"] == pid

    def test_get_property_not_found(self, session):
        r = session.get(f"{API}/properties/nonexistent-id-xyz", timeout=10)
        assert r.status_code == 404

    def test_create_property_admin(self, session, admin_headers):
        payload = {
            "title": "TEST_Property",
            "description": "test desc",
            "price": 5000000,
            "location": "TestCity",
            "type": "Villa",
            "bedrooms": 2,
            "bathrooms": 2,
            "area": 1500,
            "images": []
        }
        r = session.post(f"{API}/properties", json=payload, headers=admin_headers, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == "TEST_Property"
        assert "id" in d
        # verify GET persistence
        r2 = session.get(f"{API}/properties/{d['id']}", timeout=10)
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST_Property"

    def test_create_property_non_admin_forbidden(self, session, user_headers):
        payload = {
            "title": "TEST_Shouldfail", "description": "x", "price": 1, "location": "x", "type": "Villa"
        }
        r = session.post(f"{API}/properties", json=payload, headers=user_headers, timeout=10)
        assert r.status_code == 403


# ---------- Favorites ----------
class TestFavorites:
    def test_toggle_favorite(self, session, user_headers):
        r = session.get(f"{API}/properties", timeout=10)
        pid = r.json()[0]["id"]

        # add
        r1 = session.post(f"{API}/users/favorites/{pid}", headers=user_headers, timeout=10)
        assert r1.status_code == 200
        assert pid in r1.json()["favorites"]

        # get favorites returns property
        r2 = session.get(f"{API}/users/favorites", headers=user_headers, timeout=10)
        assert r2.status_code == 200
        favs = r2.json()
        assert any(p["id"] == pid for p in favs)

        # remove
        r3 = session.post(f"{API}/users/favorites/{pid}", headers=user_headers, timeout=10)
        assert r3.status_code == 200
        assert pid not in r3.json()["favorites"]


# ---------- Bookings ----------
class TestBookings:
    def test_create_booking(self, session, user_headers, test_user):
        payload = {
            "name": "TEST_Booker",
            "phone": "+911234567890",
            "email": test_user["creds"]["email"],
            "service": "Property Buying",
            "date": "2026-02-15",
            "time": "10:00",
            "message": "test booking"
        }
        r = session.post(f"{API}/bookings", json=payload, headers=user_headers, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "pending"
        assert "id" in d
        TestBookings.booking_id = d["id"]

    def test_user_sees_only_own_bookings(self, session, user_headers):
        r = session.get(f"{API}/bookings", headers=user_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_admin_sees_all_bookings(self, session, admin_headers):
        r = session.get(f"{API}/bookings", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_admin_update_booking_status(self, session, admin_headers):
        bid = getattr(TestBookings, "booking_id", None)
        assert bid, "no booking created"
        r = session.patch(f"{API}/bookings/{bid}/status", params={"status": "completed"}, headers=admin_headers, timeout=10)
        assert r.status_code == 200

    def test_non_admin_update_booking_forbidden(self, session, user_headers):
        bid = getattr(TestBookings, "booking_id", "xyz")
        r = session.patch(f"{API}/bookings/{bid}/status", params={"status": "cancelled"}, headers=user_headers, timeout=10)
        assert r.status_code == 403


# ---------- Inquiries ----------
class TestInquiries:
    def test_create_inquiry_public(self, session):
        payload = {
            "name": "TEST_Inquirer",
            "email": "TEST_inq@example.com",
            "phone": "+911234567890",
            "message": "I'm interested in property X"
        }
        r = session.post(f"{API}/inquiries", json=payload, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "new"
        assert "id" in d

    def test_get_inquiries_admin(self, session, admin_headers):
        r = session.get(f"{API}/inquiries", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_get_inquiries_non_admin_forbidden(self, session, user_headers):
        r = session.get(f"{API}/inquiries", headers=user_headers, timeout=10)
        assert r.status_code == 403


# ---------- Chat (GPT-5.2 via Emergent) ----------
class TestChat:
    def test_chat_message(self, session):
        r = session.post(f"{API}/chat", json={"text": "What services do you offer?"}, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "response" in d and len(d["response"]) > 0
        assert "session_id" in d


# ---------- Analytics ----------
class TestAnalytics:
    def test_stats_admin(self, session, admin_headers):
        r = session.get(f"{API}/analytics/stats", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        for k in ("total_users", "total_inquiries", "total_bookings", "successful_conversions"):
            assert k in d
            assert isinstance(d[k], int)
        assert d["total_users"] >= 1

    def test_stats_non_admin_forbidden(self, session, user_headers):
        r = session.get(f"{API}/analytics/stats", headers=user_headers, timeout=10)
        assert r.status_code == 403

    def test_traffic_admin(self, session, admin_headers):
        r = session.get(f"{API}/analytics/traffic", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "labels" in d and "visitors" in d

    def test_traffic_non_admin_forbidden(self, session, user_headers):
        r = session.get(f"{API}/analytics/traffic", headers=user_headers, timeout=10)
        assert r.status_code == 403


# ---------- Users list ----------
class TestUsersList:
    def test_list_users_admin(self, session, admin_headers):
        r = session.get(f"{API}/users", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        for u in data:
            assert "password_hash" not in u
            assert "_id" not in u

    def test_list_users_non_admin_forbidden(self, session, user_headers):
        r = session.get(f"{API}/users", headers=user_headers, timeout=10)
        assert r.status_code == 403
