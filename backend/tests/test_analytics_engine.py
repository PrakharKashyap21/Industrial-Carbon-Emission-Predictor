import pytest
from fastapi.testclient import TestClient

import app.models.plant
import app.models.industrial_reading
import app.models.prediction
import app.models.monitoring
import app.models.scenario
import app.models.optimization
import app.models.analytics
from app.database.connection import engine
from app.database.base import Base
from app.database.session import SessionLocal
from app.services.seed_data import seed_database

from app.analytics.kpi_engine import kpi_engine
from app.analytics.emission_intensity import emission_intensity_engine
from app.analytics.trend_analysis import trend_analysis_engine
from app.analytics.feature_analysis import feature_analysis_engine
from app.analytics.anomaly_analysis import anomaly_analysis_engine
from app.analytics.insight_engine import industrial_insight_engine
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


# Test 1: KPI Engine Calculations
def test_1_kpi_calculations():
    readings = [
        {"co2_emission_kg": 8000.0, "production_quantity": 4000.0, "electricity_consumption_kwh": 10000.0, "diesel_consumption_liters": 500.0, "machine_runtime_hours": 12.0},
        {"co2_emission_kg": 9000.0, "production_quantity": 6000.0, "electricity_consumption_kwh": 12000.0, "diesel_consumption_liters": 700.0, "machine_runtime_hours": 14.0},
    ]
    res = kpi_engine.calculate_kpis(readings)
    assert res["total_co2"] == 17000.0
    assert res["average_co2"] == 8500.0
    assert res["total_production"] == 10000.0
    assert res["emission_intensity"] == 1.7  # 17000 / 10000
    assert res["average_electricity_kwh"] == 11000.0


# Test 2: Emission Intensity & MoM Math
def test_2_emission_intensity_math():
    curr = [{"co2_emission_kg": 8500.0, "production_quantity": 6000.0}]  # intensity = 1.4167
    prev = [{"co2_emission_kg": 8000.0, "production_quantity": 4000.0}]  # intensity = 2.0000

    res = emission_intensity_engine.calculate_emission_intensity(curr, prev)
    assert res["emission_intensity"] == 1.4167
    assert res["previous_emission_intensity"] == 2.0
    assert res["intensity_change_percentage"] < 0.0  # Efficiency improved
    assert "improved" in res["interpretation"]


# Test 3: Trend Aggregation Logic
def test_3_trend_aggregation():
    readings = [
        {"timestamp": "2026-08-01T10:00:00", "co2_emission_kg": 8000.0, "production_quantity": 4000.0},
        {"timestamp": "2026-08-01T14:00:00", "co2_emission_kg": 8500.0, "production_quantity": 4500.0},
        {"timestamp": "2026-08-02T10:00:00", "co2_emission_kg": 9000.0, "production_quantity": 5000.0},
    ]
    trends = trend_analysis_engine.aggregate_trends(readings, granularity="daily")
    assert len(trends) == 2
    assert trends[0]["date"] == "2026-08-01"
    assert trends[0]["co2"] == 16500.0


# Test 4: Feature Correlations
def test_4_feature_correlations():
    readings = [
        {"electricity_consumption_kwh": 10000.0, "co2_emission_kg": 8000.0},
        {"electricity_consumption_kwh": 12000.0, "co2_emission_kg": 9000.0},
        {"electricity_consumption_kwh": 14000.0, "co2_emission_kg": 10000.0},
    ]
    res = feature_analysis_engine.analyze_features(readings)
    assert "correlations" in res
    # Electricity correlation with CO2 should be near +1.0
    elec_corr = [c for c in res["correlations"] if c["feature_key"] == "electricity_consumption_kwh"][0]
    assert elec_corr["correlation_with_co2"] == 1.0


# Test 5: Anomaly Aggregation
def test_5_anomaly_aggregation():
    alerts = [{"alert_id": 1, "alert_type": "DATA_DRIFT", "severity": "WARNING", "message": "Drift detected"}]
    res = anomaly_analysis_engine.analyze_anomalies(monitoring_alerts=alerts)
    assert res["total_anomalies"] == 1
    assert len(res["timeline"]) == 1


# Test 6: Deterministic Rule-Based Insight Engine
def test_6_insight_engine():
    kpi_data = {"total_co2": 125400.0}
    intensity_data = {
        "emission_intensity": 1.4167,
        "co2_change_percentage": 5.0,
        "production_change_percentage": 15.0,
        "intensity_change_percentage": -8.0,
    }
    feature_data = {"correlations": [{"feature_key": "electricity_consumption_kwh", "display_name": "Electricity Consumption", "correlation_with_co2": 0.85}]}
    anomaly_data = {"total_anomalies": 1, "critical_count": 0}
    opt_data = {"total_runs": 2, "average_reduction_percentage": 10.5}

    insights = industrial_insight_engine.generate_insights(
        kpi_data=kpi_data,
        intensity_data=intensity_data,
        feature_data=feature_data,
        anomaly_data=anomaly_data,
        optimization_data=opt_data,
    )
    assert len(insights) >= 3
    eff_insight = [i for i in insights if i["insight_type"] == "EFFICIENCY"][0]
    assert "Improved" in eff_insight["title"]


# Test 7: GET /api/analytics/overview endpoint
def test_7_api_overview(client):
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_co2" in data
    assert "emission_intensity" in data


# Test 8: GET /api/analytics/emission-intensity endpoint
def test_8_api_emission_intensity(client):
    response = client.get("/api/analytics/emission-intensity")
    assert response.status_code == 200
    data = response.json()
    assert "emission_intensity" in data
    assert "interpretation" in data


# Test 9: GET /api/analytics/insights endpoint
def test_9_api_insights(client):
    response = client.get("/api/analytics/insights")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "insight_type" in data[0]
