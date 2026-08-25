import pytest
from fastapi.testclient import TestClient
import app.models.plant
import app.models.industrial_reading
import app.models.prediction
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


# Test 1: POST /api/predictions creates & saves prediction
def test_1_create_prediction(client):
    payload = {
        "plant_id": 1,
        "electricity_consumption_kwh": 14500.0,
        "diesel_consumption_liters": 650.0,
        "natural_gas_consumption_m3": 2800.0,
        "production_quantity": 2400.0,
        "raw_material_consumption_kg": 5600.0,
        "machine_runtime_hours": 19.5,
        "temperature_c": 28.5,
        "pressure_bar": 7.4,
        "previous_co2_emission_kg": 6800.0,
    }
    response = client.post("/api/predictions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["plant_id"] == 1
    assert data["model_version"] == "ensemble_v1"
    assert data["ensemble_prediction"] > 0
    assert data["rf_prediction"] > 0
    assert data["xgb_prediction"] > 0


# Test 2: GET /api/predictions returns paginated items & metadata
def test_2_get_predictions_pagination(client):
    response = client.get("/api/predictions?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "pagination" in data
    assert len(data["items"]) <= 10
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["limit"] == 10
    assert data["pagination"]["total"] >= len(data["items"])


# Test 3: Filtering predictions by plant_id and status
def test_3_predictions_filtering(client):
    response = client.get("/api/predictions?plant_id=1&status=evaluated")
    assert response.status_code == 200
    items = response.json()["items"]
    for item in items:
        assert item["plant_id"] == 1
        assert item["status"] == "evaluated"


# Test 4: GET /api/predictions/{id} single record detail
def test_4_get_prediction_by_id(client):
    # First fetch list to get a valid ID
    list_res = client.get("/api/predictions?limit=1")
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert len(items) > 0
    target_id = items[0]["id"]

    detail_res = client.get(f"/api/predictions/{target_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == target_id
    assert "input_features" in detail


# Test 5: PATCH /api/predictions/{id}/actual updates actual & computes errors
def test_5_update_actual_co2_math(client):
    # Create new prediction without actual
    payload = {
        "plant_id": 2,
        "electricity_consumption_kwh": 12000.0,
        "diesel_consumption_liters": 500.0,
        "natural_gas_consumption_m3": 2000.0,
        "production_quantity": 2000.0,
        "raw_material_consumption_kg": 5000.0,
        "machine_runtime_hours": 16.0,
        "temperature_c": 25.0,
        "pressure_bar": 6.5,
        "previous_co2_emission_kg": 6000.0,
    }
    create_res = client.post("/api/predictions", json=payload)
    assert create_res.status_code == 201
    pred_data = create_res.json()
    pred_id = pred_data["id"]
    ens_pred = pred_data["ensemble_prediction"]

    actual_val = 8000.0
    patch_res = client.patch(f"/api/predictions/{pred_id}/actual", json={"actual_co2": actual_val})
    assert patch_res.status_code == 200
    updated = patch_res.json()

    expected_signed = round(ens_pred - actual_val, 2)
    expected_abs = round(abs(actual_val - ens_pred), 2)
    expected_pct = round((expected_abs / actual_val) * 100.0, 2)

    assert updated["actual_co2"] == actual_val
    assert updated["status"] == "evaluated"
    assert updated["signed_error"] == expected_signed
    assert updated["absolute_error"] == expected_abs
    assert updated["percentage_error"] == expected_pct


# Test 6: Zero actual CO₂ produces percentage_error = None without crash
def test_6_zero_actual_co2_handling(client):
    payload = {
        "plant_id": 3,
        "electricity_consumption_kwh": 10000.0,
        "diesel_consumption_liters": 400.0,
        "natural_gas_consumption_m3": 1500.0,
        "production_quantity": 0.0,
        "raw_material_consumption_kg": 4000.0,
        "machine_runtime_hours": 12.0,
        "temperature_c": 22.0,
        "pressure_bar": 5.5,
        "previous_co2_emission_kg": 5000.0,
    }
    create_res = client.post("/api/predictions", json=payload)
    pred_id = create_res.json()["id"]

    patch_res = client.patch(f"/api/predictions/{pred_id}/actual", json={"actual_co2": 0.0})
    assert patch_res.status_code == 200
    updated = patch_res.json()

    assert updated["actual_co2"] == 0.0
    assert updated["percentage_error"] is None


# Test 7: Null actual CO₂ maintains pending_actual status
def test_7_null_actual_co2_status(client):
    payload = {
        "plant_id": 4,
        "electricity_consumption_kwh": 11000.0,
        "diesel_consumption_liters": 450.0,
        "natural_gas_consumption_m3": 1800.0,
        "production_quantity": 1800.0,
        "raw_material_consumption_kg": 4500.0,
        "machine_runtime_hours": 14.0,
        "temperature_c": 24.0,
        "pressure_bar": 6.0,
        "previous_co2_emission_kg": 5500.0,
    }
    res = client.post("/api/predictions", json=payload)
    data = res.json()
    assert data["status"] == "pending_actual"
    assert data["actual_co2"] is None
    assert data["absolute_error"] is None


# Test 8: Model version tag ensemble_v1 is preserved
def test_8_model_version_preservation(client):
    res = client.get("/api/predictions?limit=1")
    item = res.json()["items"][0]
    assert item["model_version"] == "ensemble_v1"
    assert item["model_type"] == "rf_xgb_ensemble"


# Test 9: GET /api/predictions/analytics returns error metrics
def test_9_prediction_analytics(client):
    response = client.get("/api/predictions/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "total_predictions" in data
    assert "evaluated_count" in data
    assert "mae" in data
    assert "model_comparison" in data
    assert len(data["model_comparison"]) == 3


# Test 10: Model comparison metrics present for RF, XGB, Ensemble
def test_10_model_comparison_structure(client):
    response = client.get("/api/predictions/analytics")
    assert response.status_code == 200
    comp = response.json()["model_comparison"]
    names = [c["model"] for c in comp]
    assert "Random Forest" in names
    assert "XGBoost" in names
    assert "Weighted Ensemble" in names
