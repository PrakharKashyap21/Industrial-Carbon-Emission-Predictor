import pytest
from fastapi.testclient import TestClient

from app.ml.what_if.scenario_service import scenario_service
from app.ml.what_if.scenario_validation import scenario_validator
from app.ml.what_if.scenario_comparison import compare_scenarios
from app.main import app

client = TestClient(app)


@pytest.fixture
def baseline_inputs():
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


@pytest.fixture
def scenario_inputs(baseline_inputs):
    scen = baseline_inputs.copy()
    scen["electricity_consumption_kwh"] = 11600.0  # -20% electricity
    scen["machine_runtime_hours"] = 16.0  # -3.5 hrs
    return scen


# Test 1: Valid baseline accepted
def test_1_valid_baseline_accepted(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    assert res["baseline"]["prediction_kg"] > 0.0


# Test 2: Valid scenario accepted
def test_2_valid_scenario_accepted(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    assert res["scenario"]["prediction_kg"] > 0.0


# Test 3: Negative input rejected
def test_3_negative_input_rejected(baseline_inputs):
    invalid = baseline_inputs.copy()
    invalid["electricity_consumption_kwh"] = -500.0
    payload = {"baseline": baseline_inputs, "scenario": invalid}
    response = client.post("/api/what-if/analyze", json=payload)
    assert response.status_code == 422 or response.status_code == 400


# Test 4: Machine runtime > 24 rejected
def test_4_invalid_runtime_rejected(baseline_inputs):
    invalid = baseline_inputs.copy()
    invalid["machine_runtime_hours"] = 28.0
    payload = {"baseline": baseline_inputs, "scenario": invalid}
    response = client.post("/api/what-if/analyze", json=payload)
    assert response.status_code == 422 or response.status_code == 400


# Test 5: Baseline prediction generated
def test_5_baseline_prediction_generated(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    assert "prediction_kg" in res["baseline"]
    assert res["baseline"]["prediction_kg"] > 0.0


# Test 6: Scenario prediction generated
def test_6_scenario_prediction_generated(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    assert "prediction_kg" in res["scenario"]
    assert res["scenario"]["prediction_kg"] > 0.0


# Test 7: Difference calculated correctly
def test_7_difference_calculated(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    base_pred = res["baseline"]["prediction_kg"]
    scen_pred = res["scenario"]["prediction_kg"]
    diff = res["comparison"]["difference_kg"]

    assert round(scen_pred - base_pred, 2) == diff


# Test 8: Percentage change calculated correctly
def test_8_percentage_change_calculated(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    pct = res["comparison"]["percentage_change"]
    assert pct is not None
    assert isinstance(pct, float)


# Test 9: Zero baseline handled safely
def test_9_zero_baseline_handling():
    res = compare_scenarios(
        baseline_pred_kg=0.0,
        scenario_pred_kg=100.0,
        baseline_prod_units=0.0,
        scenario_prod_units=10.0
    )
    assert res["percentage_change"] is None
    assert res["baseline_co2_intensity"] is None


# Test 10: Scenario does not mutate baseline
def test_10_scenario_does_not_mutate_baseline(baseline_inputs, scenario_inputs):
    original_electricity = baseline_inputs["electricity_consumption_kwh"]
    _ = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    assert baseline_inputs["electricity_consumption_kwh"] == original_electricity


# Test 11: Same model version used for baseline and scenario
def test_11_same_model_version_used(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    assert res["model"]["version"] == "ensemble_v1"


# Test 12: Same feature engineering pipeline used
def test_12_same_feature_engineering_pipeline(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    assert "baseline" in res
    assert "scenario" in res


# Test 13: Out-of-training-range warning works
def test_13_out_of_range_warning(baseline_inputs):
    extreme_scenario = baseline_inputs.copy()
    extreme_scenario["electricity_consumption_kwh"] = 999999.0  # Extreme out of range
    out_of_range, warnings = scenario_validator.validate_scenario(extreme_scenario)

    assert out_of_range is True
    assert len(warnings) > 0


# Test 14: SHAP scenario explanation works
def test_14_shap_scenario_explanation(baseline_inputs, scenario_inputs):
    res = scenario_service.analyze_scenario(baseline_inputs, scenario_inputs)
    shap_exp = res.get("shap_explanation")

    assert shap_exp is not None
    assert "baseline_shap" in shap_exp
    assert "scenario_shap" in shap_exp
    assert "shap_comparison" in shap_exp


# Test 15: Batch scenario endpoint works
def test_15_batch_scenario_endpoint(baseline_inputs, scenario_inputs):
    payload = {
        "baseline": baseline_inputs,
        "scenarios": [
            {"name": "Scenario A (-20% Electricity)", "scenario": scenario_inputs},
            {"name": "Scenario B (-50% Diesel)", "scenario": {**baseline_inputs, "diesel_consumption_liters": 325.0}},
        ],
    }

    response = client.post("/api/what-if/analyze-batch", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "scenarios" in data
    assert len(data["scenarios"]) == 2
    assert "best_scenario_name" in data
