"""
Tests for 3-tier role system: super_admin, admin, user.
Covers:
- Super admin login returns role=super_admin
- POST /api/admin/create-admin (super_admin only)
- PATCH /api/admin/users/{id}/role (super_admin only)
- DELETE /api/admin/users/{id} (super_admin only)
- PUT /api/properties/{id} (admin+super_admin)
- DELETE /api/properties/{id} (admin+super_admin, removes from favorites)
- Super_admin can access all prior admin-only endpoints

Run: pytest /app/backend/tests/test_roles.py -v --tb=short
"""
import os
import uuid
import pytest
import requests
from dotenv import load_dotenv

load_dotenv('/app/frontend/.env')
BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

SUPERADMIN_EMAIL = "superadmin@rtgroups.info"
SUPERADMIN_PASSWORD = "SuperAdmin@2026"
ADMIN_EMAIL = "admin@rtgroups.info"
ADMIN_PASSWORD = "RTGroups@2026"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(session, email, password):
    r = session.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login failed {email}: {r.status_code} {r.text}"
    return r.json()


@pytest.fixture(scope="session")
def super_login(session):
    return _login(session, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD)


@pytest.fixture(scope="session")
def admin_login(session):
    return _login(session, ADMIN_EMAIL, ADMIN_PASSWORD)


@pytest.fixture(scope="session")
def super_headers(super_login):
    return {"Authorization": f"Bearer {super_login['token']}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def admin_headers(admin_login):
    return {"Authorization": f"Bearer {admin_login['token']}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def user_login(session):
    suffix = uuid.uuid4().hex[:8]
    payload = {
        "name": "TEST_RoleUser",
        "email": f"TEST_role_user_{suffix}@example.com",
        "phone": "+911234567890",
        "password": "TestPass@123"
    }
    r = session.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    data["creds"] = payload
    return data


@pytest.fixture(scope="session")
def user_headers(user_login):
    return {"Authorization": f"Bearer {user_login['token']}", "Content-Type": "application/json"}


# ---------- Auth role verification ----------
class TestAuthRoles:
    def test_super_admin_login_returns_super_admin_role(self, super_login):
        assert super_login["user"]["role"] == "super_admin"
        assert super_login["user"]["email"] == SUPERADMIN_EMAIL
        assert "token" in super_login

    def test_admin_login_returns_admin_role(self, admin_login):
        assert admin_login["user"]["role"] == "admin"
        assert admin_login["user"]["email"] == ADMIN_EMAIL

    def test_token_contains_super_admin_role(self, session, super_login):
        import jwt as _jwt
        # decode without verify (we just check claim)
        payload = _jwt.decode(super_login["token"], options={"verify_signature": False})
        assert payload["role"] == "super_admin"


# ---------- POST /api/admin/create-admin ----------
class TestCreateAdmin:
    _created_admin_id = None
    _created_admin_email = None

    def test_super_admin_creates_admin_200(self, session, super_headers):
        suffix = uuid.uuid4().hex[:8]
        email = f"TEST_new_admin_{suffix}@example.com"
        payload = {
            "name": "TEST_NewAdmin",
            "email": email,
            "phone": "+911234567890",
            "password": "AdminPass@123"
        }
        r = session.post(f"{API}/admin/create-admin", json=payload, headers=super_headers, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["role"] == "admin"
        assert d["user"]["email"] == email
        assert "id" in d["user"]
        TestCreateAdmin._created_admin_id = d["user"]["id"]
        TestCreateAdmin._created_admin_email = email

        # verify login works with new admin
        lr = session.post(f"{API}/auth/login", json={"email": email, "password": "AdminPass@123"}, timeout=10)
        assert lr.status_code == 200
        assert lr.json()["user"]["role"] == "admin"

    def test_admin_cannot_create_admin_403(self, session, admin_headers):
        payload = {
            "name": "TEST_NoPerm", "email": f"TEST_x_{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+911234567890", "password": "x"
        }
        r = session.post(f"{API}/admin/create-admin", json=payload, headers=admin_headers, timeout=10)
        assert r.status_code == 403

    def test_user_cannot_create_admin_403(self, session, user_headers):
        payload = {
            "name": "TEST_NoPerm", "email": f"TEST_y_{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+911234567890", "password": "x"
        }
        r = session.post(f"{API}/admin/create-admin", json=payload, headers=user_headers, timeout=10)
        assert r.status_code == 403

    def test_duplicate_email_returns_400(self, session, super_headers):
        assert TestCreateAdmin._created_admin_email, "prior test must have created an admin"
        payload = {
            "name": "TEST_Dup",
            "email": TestCreateAdmin._created_admin_email,
            "phone": "+911234567890",
            "password": "x"
        }
        r = session.post(f"{API}/admin/create-admin", json=payload, headers=super_headers, timeout=10)
        assert r.status_code == 400


# ---------- PATCH /api/admin/users/{id}/role ----------
class TestUpdateRole:
    def test_super_admin_promotes_user_to_admin(self, session, super_headers, user_login):
        uid = user_login["user"]["id"]
        r = session.patch(f"{API}/admin/users/{uid}/role", json={"role": "admin"}, headers=super_headers, timeout=10)
        assert r.status_code == 200, r.text

        # verify persisted: user list
        lr = session.get(f"{API}/users", headers=super_headers, timeout=10)
        assert lr.status_code == 200
        u = next((x for x in lr.json() if x["id"] == uid), None)
        assert u and u["role"] == "admin"

    def test_super_admin_demotes_admin_to_user(self, session, super_headers, user_login):
        uid = user_login["user"]["id"]
        r = session.patch(f"{API}/admin/users/{uid}/role", json={"role": "user"}, headers=super_headers, timeout=10)
        assert r.status_code == 200

        lr = session.get(f"{API}/users", headers=super_headers, timeout=10)
        u = next((x for x in lr.json() if x["id"] == uid), None)
        assert u and u["role"] == "user"

    def test_super_admin_cannot_change_own_role_400(self, session, super_headers, super_login):
        sid = super_login["user"]["id"]
        r = session.patch(f"{API}/admin/users/{sid}/role", json={"role": "user"}, headers=super_headers, timeout=10)
        assert r.status_code == 400

    def test_admin_cannot_update_role_403(self, session, admin_headers, user_login):
        uid = user_login["user"]["id"]
        r = session.patch(f"{API}/admin/users/{uid}/role", json={"role": "admin"}, headers=admin_headers, timeout=10)
        assert r.status_code == 403

    def test_invalid_role_value_400(self, session, super_headers, user_login):
        uid = user_login["user"]["id"]
        r = session.patch(f"{API}/admin/users/{uid}/role", json={"role": "godmode"}, headers=super_headers, timeout=10)
        assert r.status_code == 400


# ---------- DELETE /api/admin/users/{id} ----------
class TestDeleteUser:
    def test_super_admin_deletes_user_200(self, session, super_headers):
        # create a throwaway user
        suffix = uuid.uuid4().hex[:8]
        reg = session.post(f"{API}/auth/register", json={
            "name": "TEST_DelUser", "email": f"TEST_del_{suffix}@example.com",
            "phone": "+911234567890", "password": "x@123456"
        }, timeout=10)
        assert reg.status_code == 200
        uid = reg.json()["user"]["id"]

        r = session.delete(f"{API}/admin/users/{uid}", headers=super_headers, timeout=10)
        assert r.status_code == 200, r.text

        # verify gone
        lr = session.get(f"{API}/users", headers=super_headers, timeout=10)
        assert all(u["id"] != uid for u in lr.json())

    def test_super_admin_cannot_delete_self_400(self, session, super_headers, super_login):
        sid = super_login["user"]["id"]
        r = session.delete(f"{API}/admin/users/{sid}", headers=super_headers, timeout=10)
        assert r.status_code == 400

    def test_super_admin_cannot_delete_another_super_admin_400(self, session, super_headers):
        # create another super_admin via direct promote
        suffix = uuid.uuid4().hex[:8]
        reg = session.post(f"{API}/auth/register", json={
            "name": "TEST_Sup2", "email": f"TEST_sup2_{suffix}@example.com",
            "phone": "+911234567890", "password": "x@123456"
        }, timeout=10)
        uid = reg.json()["user"]["id"]
        pr = session.patch(f"{API}/admin/users/{uid}/role", json={"role": "super_admin"}, headers=super_headers, timeout=10)
        assert pr.status_code == 200

        r = session.delete(f"{API}/admin/users/{uid}", headers=super_headers, timeout=10)
        assert r.status_code == 400

        # cleanup: demote and delete
        session.patch(f"{API}/admin/users/{uid}/role", json={"role": "user"}, headers=super_headers, timeout=10)
        session.delete(f"{API}/admin/users/{uid}", headers=super_headers, timeout=10)

    def test_admin_cannot_delete_user_403(self, session, admin_headers, user_login):
        uid = user_login["user"]["id"]
        r = session.delete(f"{API}/admin/users/{uid}", headers=admin_headers, timeout=10)
        assert r.status_code == 403

    def test_nonexistent_user_404(self, session, super_headers):
        r = session.delete(f"{API}/admin/users/nonexistent-id-xyz", headers=super_headers, timeout=10)
        assert r.status_code == 404


# ---------- PUT /api/properties/{id} ----------
class TestUpdateProperty:
    @pytest.fixture(scope="class")
    def property_id(self, session, admin_headers):
        r = session.post(f"{API}/properties", json={
            "title": "TEST_UpdProp", "description": "d", "price": 1000000,
            "location": "X", "type": "Villa", "bedrooms": 1, "bathrooms": 1, "area": 500, "images": []
        }, headers=admin_headers, timeout=10)
        assert r.status_code == 200, r.text
        return r.json()["id"]

    def test_admin_updates_property(self, session, admin_headers, property_id):
        payload = {
            "title": "TEST_UpdProp_v2", "description": "updated", "price": 2000000,
            "location": "Y", "type": "Villa", "bedrooms": 2, "bathrooms": 2, "area": 1000, "images": []
        }
        r = session.put(f"{API}/properties/{property_id}", json=payload, headers=admin_headers, timeout=10)
        assert r.status_code == 200, r.text
        assert r.json()["title"] == "TEST_UpdProp_v2"
        assert r.json()["price"] == 2000000

        # verify persisted via GET
        g = session.get(f"{API}/properties/{property_id}", timeout=10)
        assert g.json()["title"] == "TEST_UpdProp_v2"

    def test_super_admin_updates_property(self, session, super_headers, property_id):
        payload = {
            "title": "TEST_UpdProp_v3", "description": "super updated", "price": 3000000,
            "location": "Z", "type": "Villa"
        }
        r = session.put(f"{API}/properties/{property_id}", json=payload, headers=super_headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_UpdProp_v3"

    def test_regular_user_forbidden_403(self, session, user_headers, property_id):
        payload = {"title": "x", "description": "x", "price": 1, "location": "x", "type": "x"}
        r = session.put(f"{API}/properties/{property_id}", json=payload, headers=user_headers, timeout=10)
        assert r.status_code == 403

    def test_nonexistent_id_404(self, session, admin_headers):
        payload = {"title": "x", "description": "x", "price": 1, "location": "x", "type": "x"}
        r = session.put(f"{API}/properties/nonexistent-xyz", json=payload, headers=admin_headers, timeout=10)
        assert r.status_code == 404


# ---------- DELETE /api/properties/{id} ----------
class TestDeleteProperty:
    def test_admin_deletes_and_get_returns_404(self, session, admin_headers):
        # create property first
        cr = session.post(f"{API}/properties", json={
            "title": "TEST_DelProp", "description": "d", "price": 1, "location": "x", "type": "Villa"
        }, headers=admin_headers, timeout=10)
        pid = cr.json()["id"]

        dr = session.delete(f"{API}/properties/{pid}", headers=admin_headers, timeout=10)
        assert dr.status_code == 200, dr.text

        gr = session.get(f"{API}/properties/{pid}", timeout=10)
        assert gr.status_code == 404

    def test_delete_removes_from_favorites(self, session, admin_headers, user_headers, user_login):
        # create property
        cr = session.post(f"{API}/properties", json={
            "title": "TEST_FavProp", "description": "d", "price": 1, "location": "x", "type": "Villa"
        }, headers=admin_headers, timeout=10)
        pid = cr.json()["id"]

        # user adds to favorites
        fr = session.post(f"{API}/users/favorites/{pid}", headers=user_headers, timeout=10)
        assert fr.status_code == 200
        assert pid in fr.json()["favorites"]

        # admin deletes property
        dr = session.delete(f"{API}/properties/{pid}", headers=admin_headers, timeout=10)
        assert dr.status_code == 200

        # verify pid gone from user's favorites
        me = session.get(f"{API}/users/me", headers=user_headers, timeout=10)
        assert me.status_code == 200
        assert pid not in me.json().get("favorites", [])

    def test_user_cannot_delete_403(self, session, user_headers, admin_headers):
        cr = session.post(f"{API}/properties", json={
            "title": "TEST_Del3", "description": "d", "price": 1, "location": "x", "type": "Villa"
        }, headers=admin_headers, timeout=10)
        pid = cr.json()["id"]

        r = session.delete(f"{API}/properties/{pid}", headers=user_headers, timeout=10)
        assert r.status_code == 403

        # cleanup
        session.delete(f"{API}/properties/{pid}", headers=admin_headers, timeout=10)


# ---------- Super admin should access all admin-only endpoints ----------
class TestSuperAdminAccess:
    def test_super_admin_get_bookings(self, session, super_headers):
        r = session.get(f"{API}/bookings", headers=super_headers, timeout=10)
        assert r.status_code == 200

    def test_super_admin_get_inquiries(self, session, super_headers):
        r = session.get(f"{API}/inquiries", headers=super_headers, timeout=10)
        assert r.status_code == 200

    def test_super_admin_analytics_stats(self, session, super_headers):
        r = session.get(f"{API}/analytics/stats", headers=super_headers, timeout=10)
        assert r.status_code == 200

    def test_super_admin_analytics_traffic(self, session, super_headers):
        r = session.get(f"{API}/analytics/traffic", headers=super_headers, timeout=10)
        assert r.status_code == 200

    def test_super_admin_list_users(self, session, super_headers):
        r = session.get(f"{API}/users", headers=super_headers, timeout=10)
        assert r.status_code == 200

    def test_super_admin_create_property(self, session, super_headers):
        r = session.post(f"{API}/properties", json={
            "title": "TEST_SuperProp", "description": "d", "price": 1, "location": "x", "type": "Villa"
        }, headers=super_headers, timeout=10)
        assert r.status_code == 200
        pid = r.json()["id"]
        # cleanup
        session.delete(f"{API}/properties/{pid}", headers=super_headers, timeout=10)
