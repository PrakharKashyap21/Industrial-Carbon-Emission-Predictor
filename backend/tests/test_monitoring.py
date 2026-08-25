import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

import app.models.plant
import app.models.industrial_reading
import app.models.prediction
import app.models.monitoring
from app.database.connection import engine
from app.database.base import Base
from app.database.session import SessionLocal
from app.services.seed_data import seed_database
from app.monitoring.drift_detection import drift_detector
from app.monitoring.reliability import reliability_engine
from app.monitoring.model_monitoring import model_performance_monitor
from app.monitoring.alert_service import alert_service
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


# Test 1: POST /api/monitoring/run executes monitoring cycle & saves snapshot
def test_1_run_monitoring_cycle(client):
    response = client.post("/api/monitoring/run?days=30")
    assert response.status_code == 201
    data = response.json()
    assert "snapshot_id" in data
    assert "overall_data_quality" in data
    assert "overall_drift_status" in data
    assert "overall_performance_status" in data
    assert "overall_reliability" in data


# Test 2: GET /api/monitoring/overview returns latest snapshot
def test_2_monitoring_overview(client):
    response = client.get("/api/monitoring/overview")
    assert response.status_code == 200
    data = response.json()
    assert "snapshot_id" in data
    assert "overall_reliability" in data


# Test 3: PSI calculation zero-bin epsilon smoothing test
def test_3_psi_zero_bin_epsilon_smoothing():
    # Distribution with missing values / zero bins
    expected = np.array([10, 12, 11, 13, 14, 15, 12, 11, 10, 13], dtype=float)
    actual = np.array([10, 12, 11, 13, 100, 105, 110, 115, 120, 125], dtype=float)

    psi_val = drift_detector.calculate_psi(expected, actual)
    assert isinstance(psi_val, float)
    assert psi_val > 0.0
    # Check that high shift returns high status
    status_str = drift_detector.classify_drift(psi_val)
    assert status_str in ["moderate", "high"]


# Test 4: KS statistic & p-value test
def test_4_ks_test():
    expected = np.random.normal(100, 10, 100)
    actual = np.random.normal(100, 10, 100)
    ks_stat, p_val = drift_detector.calculate_ks_test(expected, actual)
    assert ks_stat >= 0.0
    assert 0.0 <= p_val <= 1.0


# Test 5: Feature drift classification thresholds
def test_5_drift_classification():
    assert drift_detector.classify_drift(0.04) == "low"
    assert drift_detector.classify_drift(0.15) == "moderate"
    assert drift_detector.classify_drift(0.35) == "high"


# Test 6: Model performance degradation logic
def test_6_performance_degradation():
    class DummyPred:
        def __init__(self, ensemble, actual):
            self.ensemble_prediction = ensemble
            self.rf_prediction = ensemble
            self.xgb_prediction = ensemble
            self.actual_co2 = actual
            self.status = "evaluated"

    # Preds with high error
    preds = [DummyPred(10000.0, 5000.0) for _ in range(5)]
    res = model_performance_monitor.evaluate_performance(preds)
    assert res["degradation_pct"] > 50.0
    assert res["overall_performance_status"] == "degraded"


# Test 7: Prediction Reliability Engine rules & reasons
def test_7_reliability_classification():
    normal_input = {
        "electricity_consumption_kwh": 14000.0,
        "diesel_consumption_liters": 600.0,
        "natural_gas_consumption_m3": 2500.0,
        "production_quantity": 2200.0,
        "raw_material_consumption_kg": 5000.0,
        "machine_runtime_hours": 18.0,
        "temperature_c": 26.0,
        "pressure_bar": 7.0,
        "previous_co2_emission_kg": 6500.0,
    }
    rel_res = reliability_engine.evaluate_single_prediction_reliability(normal_input)
    assert rel_res["reliability_status"] in ["HIGH", "MEDIUM", "LOW"]
    assert "reliability_reasons" in rel_res


# Test 8: Alert deduplication logic
def test_8_alert_deduplication():
    db = SessionLocal()
    import time
    feat_name = f"dedup_feat_{int(time.time()*1000)}"
    try:
        # First alert
        a1 = alert_service.create_alert_if_not_exists(
            db=db,
            alert_type="DATA_DRIFT",
            severity="WARNING",
            message="Electricity drift warning",
            plant_id=99,
            feature_name=feat_name,
        )
        assert a1 is not None

        # Duplicate alert should return None
        a2 = alert_service.create_alert_if_not_exists(
            db=db,
            alert_type="DATA_DRIFT",
            severity="WARNING",
            message="Electricity drift warning",
            plant_id=99,
            feature_name=feat_name,
        )
        assert a2 is None
    finally:
        db.close()


# Test 9: Alert resolution
def test_9_alert_resolution():
    db = SessionLocal()
    try:
        a = alert_service.create_alert_if_not_exists(
            db=db,
            alert_type="DATA_QUALITY",
            severity="INFO",
            message="Test alert resolution",
            plant_id=2,
            feature_name="diesel_consumption_liters",
        )
        if a:
            res = alert_service.resolve_alert(db=db, alert_id=a.id)
            assert res.status == "resolved"
            assert res.resolved_at is not None
    finally:
        db.close()


# Test 10: GET /api/monitoring/drift endpoint
def test_10_get_monitoring_drift_endpoint(client):
    response = client.get("/api/monitoring/drift")
    assert response.status_code == 200
    data = response.json()
    assert "overall_drift_status" in data
    assert "features" in data
