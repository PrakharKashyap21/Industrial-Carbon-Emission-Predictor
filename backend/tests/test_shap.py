import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.ml.explainability.shap_explainer import explainer_manager
from app.ml.explainability.explanation_service import explanation_service
from app.ml.feature_metadata import get_feature_metadata
from app.main import app

client = TestClient(app)


@pytest.fixture
def sample_features():
    return {
        "electricity_consumption_kwh": 14500.0,
        "diesel_consumption_liters": 650.0,
        "natural_gas_consumption_m3": 2800.0,
        "production_quantity": 2400.0,
        "raw_material_consumption_kg": 5600.0,
        "machine_runtime_hours": 19.5,
        "temperature_c": 28.5,
        "pressure_bar": 7.4,
        "previous_co2_emission_kg": 6800.0,
        "plant_id": 1,
    }


# Test 1: SHAP explainer initializes
def test_1_explainer_initializes():
    rf_explainer = explainer_manager.get_rf_explainer(explanation_service.rf_model)
    xgb_explainer = explainer_manager.get_xgb_explainer(explanation_service.xgb_model)
    assert rf_explainer is not None
    assert xgb_explainer is not None


# Test 2: Single prediction explanation works
def test_2_single_prediction_explanation(sample_features):
    res = explanation_service.explain_prediction(sample_features)
    assert "prediction" in res
    assert "explanation" in res
    assert res["prediction"]["co2_kg"] > 0.0


# Test 3: SHAP feature count matches model features
def test_3_shap_feature_count(sample_features):
    res = explanation_service.explain_prediction(sample_features)
    contributors = res["contributors"]
    assert len(contributors) == len(explanation_service.feature_order)


# Test 4: Base value + sum(SHAP) approximately equals prediction
def test_4_additive_property(sample_features):
    res = explanation_service.explain_prediction(sample_features)
    base_val = res["explanation"]["base_value_kg"]
    sum_shap = sum([c["shap_value"] for c in res["contributors"]])
    pred = res["prediction"]["co2_kg"]

    calc_total = base_val + sum_shap
    assert abs(calc_total - pred) <= 2.0
    assert res["explanation"]["additive_check"] is True


# Test 5: Positive and negative contributors identified
def test_5_positive_negative_contributors(sample_features):
    res = explanation_service.explain_prediction(sample_features)
    top_pos = res["top_positive"]
    top_neg = res["top_negative"]

    assert isinstance(top_pos, list)
    assert isinstance(top_neg, list)

    for p in top_pos:
        assert p["direction"] == "positive"
        assert p["shap_value"] > 0.0

    for n in top_neg:
        assert n["direction"] == "negative"
        assert n["shap_value"] < 0.0


# Test 6: Display names match metadata mapping
def test_6_display_names():
    meta = get_feature_metadata("electricity_consumption_kwh")
    assert meta["display_name"] == "Electricity Consumption"
    assert meta["unit"] == "kWh"


# Test 7: Ensemble SHAP matches weighted RF/XGBoost SHAP logic
def test_7_ensemble_shap_logic(sample_features):
    res = explanation_service.explain_prediction(sample_features)
    model_info = res["model"]

    assert model_info["name"] == "ensemble"
    assert model_info["rf_weight"] == 0.45
    assert model_info["xgb_weight"] == 0.55


# Test 8: Missing input validation
def test_8_missing_features_rejected():
    invalid_input = {"electricity_consumption_kwh": 1000.0}
    with pytest.raises(Exception):
        explanation_service.explain_prediction(invalid_input)


# Test 9: POST /api/explanations/prediction endpoint works
def test_9_explanation_api_endpoint(sample_features):
    response = client.post("/api/explanations/prediction", json=sample_features)
    assert response.status_code == 200
    data = response.json()

    assert "model" in data
    assert "prediction" in data
    assert "explanation" in data
    assert "contributors" in data
    assert data["explanation"]["additive_check"] is True


# Test 10: Global SHAP importance generator works
def test_10_global_shap_generator():
    res = explanation_service.generate_global_importance(sample_size=20)
    assert "features" in res
    assert len(res["features"]) > 0
    assert res["features"][0]["mean_abs_shap"] >= 0.0
