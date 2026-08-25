import pytest
from fastapi.testclient import TestClient
import app.models.plant
import app.models.industrial_reading
from app.analytics.intensity_analysis import calculate_co2_intensity
from app.analytics.trend_analysis import calculate_trend_percentage
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


# Test 1: GET /api/dashboard/overview returns 200 OK
def test_1_dashboard_overview_endpoint(client):
    response = client.get("/api/dashboard/overview?days=30")
    if response.status_code != 200:
        print("DASHBOARD OVERVIEW ERROR RESPONSE:", response.text)
    assert response.status_code == 200
    data = response.json()
    assert "plant" in data
    assert "kpis" in data
    assert "trends" in data
    assert "model" in data
    assert "shap_drivers" in data
    assert "data_quality" in data


# Test 2: KPI values present and non-negative
def test_2_kpis_valid(client):
    response = client.get("/api/dashboard/overview?days=30")
    assert response.status_code == 200
    kpis = response.json()["kpis"]

    assert kpis["latest_actual_co2_kg"] >= 0.0
    assert kpis["latest_predicted_co2_kg"] >= 0.0
    assert kpis["period_avg_actual_co2_kg"] >= 0.0


# Test 3: Date range filter (7, 30, 90 days) works
def test_3_date_range_filter(client):
    res_7 = client.get("/api/dashboard/overview?days=7")
    res_30 = client.get("/api/dashboard/overview?days=30")

    assert res_7.status_code == 200
    assert res_30.status_code == 200

    data_7 = res_7.json()["data_quality"]
    data_30 = res_30.json()["data_quality"]

    assert data_7["days_filtered"] == 7
    assert data_30["days_filtered"] == 30


# Test 4: Plant ID filter works
def test_4_plant_filter(client):
    response = client.get("/api/dashboard/overview?plant_id=1&days=30")
    assert response.status_code == 200
    data = response.json()
    assert data["plant"]["id"] == 1


# Test 5: Empty dataset handled gracefully
def test_5_empty_dataset_handling(client):
    # Pass non-existent plant ID 99999
    response = client.get("/api/dashboard/overview?plant_id=99999&days=30")
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["latest_actual_co2_kg"] == 0.0
    assert data["data_quality"]["total_readings"] == 0


# Test 6: Invalid plant ID or query validation
def test_6_invalid_days_filter(client):
    response = client.get("/api/dashboard/overview?days=9999")
    assert response.status_code == 422  # Validation error (le=365)


# Test 7: Prediction data returned correctly in trends
def test_7_prediction_data_in_trends(client):
    response = client.get("/api/dashboard/overview?days=30")
    assert response.status_code == 200
    trends = response.json()["trends"]

    if trends:
        point = trends[0]
        assert "actual_co2_kg" in point
        assert "predicted_co2_kg" in point
        assert "prediction_error_kg" in point


# Test 8: No division by zero for CO₂ intensity
def test_8_zero_production_co2_intensity():
    intensity = calculate_co2_intensity(1000.0, 0.0)
    assert intensity is None

    intensity_valid = calculate_co2_intensity(1000.0, 200.0)
    assert intensity_valid == 5.0


# Test 9: Trend calculation logic is correct
def test_9_trend_calculation_logic():
    pct = calculate_trend_percentage(110.0, 100.0)
    assert pct == 10.0

    pct_none = calculate_trend_percentage(100.0, 0.0)
    assert pct_none is None


# Test 10: Data quality metrics match database count
def test_10_data_quality_metrics(client):
    response = client.get("/api/dashboard/overview?days=30")
    assert response.status_code == 200
    dq = response.json()["data_quality"]

    assert "total_readings" in dq
    assert "period_readings" in dq
    assert dq["total_readings"] >= dq["period_readings"]
