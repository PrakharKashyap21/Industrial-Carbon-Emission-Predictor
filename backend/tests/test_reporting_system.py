import os
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
import app.models.report
from app.database.connection import engine
from app.database.base import Base
from app.database.session import SessionLocal
from app.services.seed_data import seed_database
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


@pytest.fixture
def admin_headers(client):
    login_res = client.post("/api/auth/login", json={"email": "admin@plant.com", "password": "admin123"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def operator_headers(client):
    login_res = client.post("/api/auth/login", json={"email": "operator@plant.com", "password": "operator123"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# Test 1: Report Preview Endpoint
def test_1_preview_report(client, admin_headers):
    req = {
        "report_type": "ANALYTICS",
        "plant_id": 1,
        "period_start": "2026-08-01",
        "period_end": "2026-08-31",
    }
    res = client.post("/api/reports/preview", json=req, headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["report_type"] == "ANALYTICS"
    assert "kpis" in data
    assert "disclaimer" in data


# Test 2: Generate Analytics PDF Report
def test_2_generate_pdf_report(client, admin_headers):
    req = {
        "report_type": "ANALYTICS",
        "file_format": "PDF",
        "plant_id": 1,
    }
    res = client.post("/api/reports/generate", json=req, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["report_type"] == "ANALYTICS"
    assert data["file_format"] == "PDF"
    assert data["status"] == "COMPLETED"
    assert "download_url" in data


# Test 3: Generate Prediction Excel Report
def test_3_generate_excel_report(client, admin_headers):
    req = {
        "report_type": "PREDICTION",
        "file_format": "EXCEL",
        "plant_id": 1,
    }
    res = client.post("/api/reports/generate", json=req, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["file_format"] == "EXCEL"
    assert data["status"] == "COMPLETED"


# Test 4: Generate Executive CSV Report
def test_4_generate_csv_report(client, admin_headers):
    req = {
        "report_type": "EXECUTIVE",
        "file_format": "CSV",
        "plant_id": 1,
    }
    res = client.post("/api/reports/generate", json=req, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["file_format"] == "CSV"


# Test 5: Generate What-if Report
def test_5_generate_whatif_report(client, admin_headers):
    req = {
        "report_type": "WHAT_IF",
        "file_format": "PDF",
        "plant_id": 1,
    }
    res = client.post("/api/reports/generate", json=req, headers=admin_headers)
    assert res.status_code == 201
    assert res.json()["report_type"] == "WHAT_IF"


# Test 6: Generate Optimization Report
def test_6_generate_optimization_report(client, admin_headers):
    req = {
        "report_type": "OPTIMIZATION",
        "file_format": "PDF",
        "plant_id": 1,
    }
    res = client.post("/api/reports/generate", json=req, headers=admin_headers)
    assert res.status_code == 201
    assert res.json()["report_type"] == "OPTIMIZATION"


# Test 7: Generate Monitoring Report
def test_7_generate_monitoring_report(client, admin_headers):
    req = {
        "report_type": "MONITORING",
        "file_format": "PDF",
        "plant_id": 1,
    }
    res = client.post("/api/reports/generate", json=req, headers=admin_headers)
    assert res.status_code == 201
    assert res.json()["report_type"] == "MONITORING"


# Test 8: List Reports History
def test_8_list_reports_history(client, admin_headers):
    res = client.get("/api/reports", headers=admin_headers)
    assert res.status_code == 200
    reports = res.json()
    assert isinstance(reports, list)
    assert len(reports) >= 5


# Test 9: Get Single Report Metadata
def test_9_get_single_report(client, admin_headers):
    list_res = client.get("/api/reports", headers=admin_headers)
    report_id = list_res.json()[0]["id"]

    res = client.get(f"/api/reports/{report_id}", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["id"] == report_id


# Test 10: Download Report File
def test_10_download_report_file(client, admin_headers):
    list_res = client.get("/api/reports", headers=admin_headers)
    report_id = list_res.json()[0]["id"]

    res = client.get(f"/api/reports/{report_id}/download", headers=admin_headers)
    assert res.status_code == 200
    assert len(res.content) > 0


# Test 11: Plant Authorization Isolation check (Operator barred from Plant #99 report)
def test_11_unauthorized_plant_report(client, operator_headers):
    req = {
        "report_type": "ANALYTICS",
        "file_format": "PDF",
        "plant_id": 99,
    }
    res = client.post("/api/reports/generate", json=req, headers=operator_headers)
    assert res.status_code == 403


# Test 12: Invalid Report ID Download Handling
def test_12_invalid_report_download(client, admin_headers):
    res = client.get("/api/reports/99999/download", headers=admin_headers)
    assert res.status_code == 404
