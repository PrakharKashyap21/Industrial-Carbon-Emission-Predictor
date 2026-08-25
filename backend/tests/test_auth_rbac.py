import pytest
from fastapi.testclient import TestClient

import app.models.plant
import app.models.industrial_reading
import app.models.prediction
import app.models.monitoring
import app.models.scenario
import app.models.optimization
import app.models.analytics
import app.models.auth
from app.database.connection import engine
from app.database.base import Base
from app.database.session import SessionLocal
from app.services.seed_data import seed_database

from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token, decode_access_token
from app.auth.authorization import authorization_service
from app.auth.permissions import has_permission, MANAGE_USERS
from app.main import app


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=db.get_bind())
        seed_database(db)
    except Exception as e:
        print("SEED ERROR:", e)
    finally:
        db.close()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


# Test 1: Password Hashing & Verification
def test_1_password_hashing():
    pw = "secret123"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongpw", hashed) is False


# Test 2: JWT Generation & Decoding
def test_2_jwt_generation():
    payload = {"sub": "123", "role": "ADMIN"}
    token = create_access_token(payload)
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "123"
    assert decoded["role"] == "ADMIN"


# Test 3: Successful Login API
def test_3_successful_login(client):
    res = client.post("/api/auth/login", json={"email": "admin@plant.com", "password": "admin123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@plant.com"
    assert data["user"]["role"] == "ADMIN"


# Test 4: Invalid Login Credentials
def test_4_invalid_login(client):
    res = client.post("/api/auth/login", json={"email": "admin@plant.com", "password": "wrongpassword"})
    assert res.status_code == 401


# Test 5: /api/auth/me Profile Endpoint
def test_5_auth_me_endpoint(client):
    login_res = client.post("/api/auth/login", json={"email": "admin@plant.com", "password": "admin123"})
    token = login_res.json()["access_token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "admin@plant.com"
    assert data["role"] == "ADMIN"


# Test 6: 401 Unauthorized for Missing Token
def test_6_unauthorized_missing_token(client):
    res = client.get("/api/users")
    assert res.status_code == 401


# Test 7: 403 Forbidden for Non-Admin Role accessing /api/users
def test_7_forbidden_non_admin_role(client):
    login_res = client.post("/api/auth/login", json={"email": "operator@plant.com", "password": "operator123"})
    token = login_res.json()["access_token"]

    res = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403


# Test 8: Plant Access Authorization
def test_8_plant_access_authorization():
    db = SessionLocal()
    try:
        admin_user = authorization_service.is_admin
        # Admin can access all plants
        from app.models.auth import User
        admin_obj = db.query(User).filter(User.email == "admin@plant.com").first()
        op_obj = db.query(User).filter(User.email == "operator@plant.com").first()

        assert authorization_service.can_access_plant(db, admin_obj, plant_id=99) is True
        assert authorization_service.can_access_plant(db, op_obj, plant_id=1) is True
        assert authorization_service.can_access_plant(db, op_obj, plant_id=99) is False
    finally:
        db.close()


# Test 9: Admin User Creation
import uuid

def test_9_admin_create_user(client):
    login_res = client.post("/api/auth/login", json={"email": "admin@plant.com", "password": "admin123"})
    token = login_res.json()["access_token"]

    unique_email = f"user_{uuid.uuid4().hex[:6]}@plant.com"
    new_u = {
        "name": "New Test User",
        "email": unique_email,
        "password": "newuser123",
        "role": "ANALYST",
        "plant_ids": [1],
    }

    res = client.post("/api/users", json=new_u, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == unique_email
    assert data["role"] == "ANALYST"


# Test 10: Audit Log Endpoint
def test_10_audit_log_endpoint(client):
    login_res = client.post("/api/auth/login", json={"email": "admin@plant.com", "password": "admin123"})
    token = login_res.json()["access_token"]

    res = client.get("/api/audit/logs", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
