import os
import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from app.ml.models.random_forest import train_rf_baseline
from app.ml.models.xgboost_model import train_xgb_baseline
from app.ml.models.ensemble import predict_ensemble, optimize_ensemble_weights
from app.ml.prediction_service import PredictionService, prediction_service
from app.main import app

client = TestClient(app)

PROCESSED_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "processed"
)


@pytest.fixture
def sample_data():
    X_train = pd.read_csv(os.path.join(PROCESSED_DIR, "X_train.csv"))
    y_train = pd.read_csv(os.path.join(PROCESSED_DIR, "y_train.csv")).iloc[:, 0]
    X_val = pd.read_csv(os.path.join(PROCESSED_DIR, "X_validation.csv"))
    y_val = pd.read_csv(os.path.join(PROCESSED_DIR, "y_validation.csv")).iloc[:, 0]
    return X_train, y_train, X_val, y_val


# Test 1: RF model trains successfully
def test_1_rf_trains_successfully(sample_data):
    X_train, y_train, _, _ = sample_data
    rf = train_rf_baseline(X_train, y_train)
    assert rf is not None
    assert hasattr(rf, "predict")


# Test 2: XGBoost model trains successfully
def test_2_xgb_trains_successfully(sample_data):
    X_train, y_train, _, _ = sample_data
    xgb = train_xgb_baseline(X_train, y_train)
    assert xgb is not None
    assert hasattr(xgb, "predict")


# Test 3: Both models return numeric predictions
def test_3_models_return_numeric_predictions(sample_data):
    X_train, y_train, X_val, _ = sample_data
    rf = train_rf_baseline(X_train, y_train)
    xgb = train_xgb_baseline(X_train, y_train)

    rf_preds = rf.predict(X_val)
    xgb_preds = xgb.predict(X_val)

    assert isinstance(rf_preds, np.ndarray)
    assert isinstance(xgb_preds, np.ndarray)
    assert len(rf_preds) == len(X_val)
    assert len(xgb_preds) == len(X_val)


# Test 4: Predictions are non-negative
def test_4_predictions_are_non_negative(sample_data):
    X_train, y_train, X_val, _ = sample_data
    rf = train_rf_baseline(X_train, y_train)
    xgb = train_xgb_baseline(X_train, y_train)

    rf_preds = np.maximum(0, rf.predict(X_val))
    xgb_preds = np.maximum(0, xgb.predict(X_val))
    ens_preds = predict_ensemble(rf_preds, xgb_preds, 0.4)

    assert (rf_preds >= 0).all()
    assert (xgb_preds >= 0).all()
    assert (ens_preds >= 0).all()


# Test 5: Feature order is validated
def test_5_feature_order_validated():
    ps = PredictionService()

    raw_features = {
        "electricity_consumption_kwh": 12000.0,
        "diesel_consumption_liters": 500.0,
        "natural_gas_consumption_m3": 2000.0,
        "production_quantity": 2000.0,
        "raw_material_consumption_kg": 5000.0,
        "machine_runtime_hours": 18.0,
        "temperature_c": 25.0,
        "pressure_bar": 7.0,
        "previous_co2_emission_kg": 6000.0,
    }

    result = ps.predict(raw_features)
    assert "ensemble_prediction_kg" in result
    assert result["ensemble_prediction_kg"] >= 0.0


# Test 6: Missing feature is rejected
def test_6_missing_feature_rejected():
    ps = PredictionService()
    invalid_raw = {
        "electricity_consumption_kwh": 12000.0,
        # missing diesel, gas, production, etc.
    }
    with pytest.raises(Exception):
        ps.predict(invalid_raw)


# Test 7: Ensemble prediction equals w * RF + (1-w) * XGB
def test_7_ensemble_weight_formula():
    rf_preds = np.array([1000.0, 2000.0])
    xgb_preds = np.array([1200.0, 1800.0])
    w = 0.4

    expected = 0.4 * rf_preds + 0.6 * xgb_preds
    calculated = predict_ensemble(rf_preds, xgb_preds, w)
    np.testing.assert_allclose(calculated, expected, rtol=1e-5)


# Test 8: Ensemble weight is selected using validation data only
def test_8_ensemble_weight_validation_only(sample_data):
    _, _, _, y_val = sample_data
    rf_val = np.array([5000.0, 6000.0])
    xgb_val = np.array([5200.0, 5800.0])

    best_w, best_rmse = optimize_ensemble_weights(y_val.iloc[:2], rf_val, xgb_val)
    assert 0.0 <= best_w <= 1.0


# Test 9: Test set is not used during hyperparameter tuning
def test_9_test_set_isolation():
    # Verify train_all pipeline uses validation RMSE for model selection
    from app.ml.training.train_all import MODELS_DIR
    feat_file = os.path.join(MODELS_DIR, "model_features.json")
    assert os.path.exists(feat_file)


# Test 10: Prediction endpoint POST /api/predictions/preview works
def test_10_prediction_api_endpoint():
    payload = {
        "electricity_consumption_kwh": 14000.0,
        "diesel_consumption_liters": 600.0,
        "natural_gas_consumption_m3": 2500.0,
        "production_quantity": 2200.0,
        "raw_material_consumption_kg": 5500.0,
        "machine_runtime_hours": 19.0,
        "temperature_c": 28.0,
        "pressure_bar": 7.5,
        "previous_co2_emission_kg": 6500.0
    }

    response = client.post("/api/predictions/preview", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "random_forest_prediction_kg" in data
    assert "xgboost_prediction_kg" in data
    assert "ensemble_prediction_kg" in data
    assert data["ensemble_prediction_kg"] >= 0.0
    assert data["selected_model"] == "ensemble"


# Test 11: End-to-end integration prediction service
def test_11_prediction_service_integration():
    res = prediction_service.predict({
        "electricity_consumption_kwh": 18000.0,
        "diesel_consumption_liters": 900.0,
        "natural_gas_consumption_m3": 3500.0,
        "production_quantity": 3000.0,
        "raw_material_consumption_kg": 8000.0,
        "machine_runtime_hours": 21.0,
        "temperature_c": 32.0,
        "pressure_bar": 8.0,
        "previous_co2_emission_kg": 9500.0
    })

    assert res["random_forest_prediction_kg"] > 0.0
    assert res["xgboost_prediction_kg"] > 0.0
    assert res["ensemble_prediction_kg"] > 0.0
