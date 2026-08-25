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
from app.core.config import settings
from app.ml.prediction_service import prediction_service
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


# Test 1: Liveness Health Probe
def test_1_liveness_probe(client):
    res = client.get("/api/health/live")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "alive"


# Test 2: Readiness Health Probe
def test_2_readiness_probe(client):
    res = client.get("/api/health/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
    assert data["model"] == "loaded"


# Test 3: X-Request-ID Header Middleware Propagation
def test_3_request_id_middleware(client):
    custom_req_id = "test-uuid-12345-67890"
    res = client.get("/api/health/live", headers={"X-Request-ID": custom_req_id})
    assert res.status_code == 200
    assert res.headers.get("X-Request-ID") == custom_req_id

    # Automatic request ID generation
    res_auto = client.get("/api/health/live")
    assert "X-Request-ID" in res_auto.headers


# Test 4: Configuration Settings Loading
def test_4_config_settings_loading():
    assert settings.PROJECT_NAME is not None
    assert settings.JWT_ALGORITHM == "HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0


# Test 5: ML Model Load Integrity
def test_5_ml_model_load_integrity():
    assert prediction_service.is_loaded() is True
    test_input = {
        "plant_id": 1,
        "electricity_consumption_kwh": 10000.0,
        "diesel_consumption_liters": 2000.0,
        "natural_gas_consumption_m3": 1500.0,
        "production_quantity": 5000.0,
        "raw_material_consumption_kg": 12000.0,
        "machine_runtime_hours": 12.0,
        "temperature_c": 25.0,
        "pressure_bar": 1.0,
        "previous_co2_emission_kg": 8500.0,
    }
    pred_res = prediction_service.predict(test_input)
    assert "ensemble_prediction_kg" in pred_res
    assert pred_res["ensemble_prediction_kg"] > 0
