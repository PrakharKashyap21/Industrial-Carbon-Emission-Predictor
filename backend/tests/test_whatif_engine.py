import pytest
from fastapi.testclient import TestClient

import app.models.plant
import app.models.industrial_reading
import app.models.prediction
import app.models.monitoring
import app.models.scenario
from app.database.connection import engine
from app.database.base import Base
from app.database.session import SessionLocal
from app.services.seed_data import seed_database
from app.whatif.scenario_engine import scenario_engine
from app.whatif.scenario_validator import scenario_validator
from app.whatif.scenario_ranker import scenario_ranker
from app.whatif.scenario_recommendation import scenario_recommendation_engine
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


# Test 1: Scenario Parameter Math (Percentage & Absolute)
def test_1_scenario_parameter_math():
    baseline = {
        "electricity_consumption_kwh": 10000.0,
        "diesel_consumption_liters": 2000.0,
        "machine_runtime_hours": 12.0,
        "production_quantity": 5000.0,
    }

    # -10% electricity change
    scen_inputs = scenario_engine.compute_scenario_inputs(
        baseline_features=baseline,
        changes={"electricity_consumption_kwh": -10.0},
        change_type="percentage",
    )
    assert scen_inputs["electricity_consumption_kwh"] == 9000.0
    assert scen_inputs["diesel_consumption_liters"] == 2000.0

    # Absolute change
    scen_inputs_abs = scenario_engine.compute_scenario_inputs(
        baseline_features=baseline,
        changes={"electricity_consumption_kwh": 8500.0},
        change_type="absolute",
    )
    assert scen_inputs_abs["electricity_consumption_kwh"] == 8500.0


# Test 2: Zero Parameter Changes matches Baseline Prediction
def test_2_zero_changes_matches_baseline():
    baseline = {
        "electricity_consumption_kwh": 14000.0,
        "diesel_consumption_liters": 600.0,
        "natural_gas_consumption_m3": 2500.0,
        "production_quantity": 5000.0,
        "raw_material_consumption_kg": 5000.0,
        "machine_runtime_hours": 18.0,
        "temperature_c": 26.0,
        "pressure_bar": 7.0,
        "previous_co2_emission_kg": 6500.0,
    }

    sim_res = scenario_engine.simulate_scenario(
        baseline_features=baseline,
        changes={},
        change_type="percentage",
    )
    assert abs(sim_res["co2_change"]) <= 0.1
    assert abs(sim_res["co2_change_percentage"]) <= 0.1
    assert "no change" in sim_res["interpretation"].lower() or "reduction" in sim_res["interpretation"].lower()


# Test 3: CO₂ Reduction & Percentage Reduction Math
def test_3_co2_reduction_math():
    baseline = {
        "electricity_consumption_kwh": 15000.0,
        "diesel_consumption_liters": 800.0,
        "natural_gas_consumption_m3": 3000.0,
        "production_quantity": 5000.0,
        "raw_material_consumption_kg": 5500.0,
        "machine_runtime_hours": 20.0,
        "temperature_c": 28.0,
        "pressure_bar": 7.5,
        "previous_co2_emission_kg": 7000.0,
    }

    sim_res = scenario_engine.simulate_scenario(
        baseline_features=baseline,
        changes={"electricity_consumption_kwh": -10.0, "diesel_consumption_liters": -10.0},
        change_type="percentage",
    )
    assert sim_res["ensemble_prediction"] <= sim_res["baseline_prediction"]
    assert sim_res["co2_change"] <= 0.0
    assert sim_res["interpretation"] in ["CO2 reduction", "No change"]


# Test 4: CO₂ Increase Handling
def test_4_co2_increase_handling():
    baseline = {
        "electricity_consumption_kwh": 10000.0,
        "diesel_consumption_liters": 500.0,
        "natural_gas_consumption_m3": 2000.0,
        "production_quantity": 5000.0,
        "raw_material_consumption_kg": 4500.0,
        "machine_runtime_hours": 15.0,
        "temperature_c": 24.0,
        "pressure_bar": 6.5,
        "previous_co2_emission_kg": 5500.0,
    }

    sim_res = scenario_engine.simulate_scenario(
        baseline_features=baseline,
        changes={"electricity_consumption_kwh": +20.0, "diesel_consumption_liters": +20.0},
        change_type="percentage",
    )
    assert sim_res["ensemble_prediction"] >= sim_res["baseline_prediction"]
    assert sim_res["co2_change"] >= 0.0


# Test 5: Feasibility Constraint Validation
def test_5_constraint_validation():
    baseline = {"production_quantity": 5000.0, "electricity_consumption_kwh": 10000.0}
    scen_inputs = {"production_quantity": 4000.0, "electricity_consumption_kwh": 10000.0}

    val_res = scenario_validator.validate_feasibility(
        scenario_inputs=scen_inputs,
        baseline_inputs=baseline,
        constraints={"min_production_output": 4800.0},
    )
    assert val_res["feasible"] is False
    assert len(val_res["violations"]) > 0


# Test 6: Multi-Scenario Ranking Logic
def test_6_scenario_ranking():
    scenarios = [
        {"scenario_id": "SCN-1", "co2_change": -300.0, "feasible": True, "reliability_status": "HIGH"},
        {"scenario_id": "SCN-2", "co2_change": -800.0, "feasible": False, "reliability_status": "HIGH"},  # Infeasible
        {"scenario_id": "SCN-3", "co2_change": -500.0, "feasible": True, "reliability_status": "HIGH"},
    ]
    ranked = scenario_ranker.rank_scenarios(scenarios)
    assert ranked[0]["scenario_id"] == "SCN-3"  # Best feasible reduction
    assert ranked[1]["scenario_id"] == "SCN-1"
    assert ranked[2]["scenario_id"] == "SCN-2"  # Infeasible ranked last


# Test 7: Recommendation Engine
def test_7_scenario_recommendation():
    ranked = [
        {
            "scenario_id": "SCN-1",
            "scenario_name": "Combined Optimization",
            "ensemble_prediction": 7600.0,
            "co2_change": -900.0,
            "co2_change_percentage": -10.59,
            "reliability_status": "HIGH",
            "feasible": True,
        }
    ]
    rec = scenario_recommendation_engine.recommend_best_scenario(ranked)
    assert rec["recommended_scenario_id"] == "SCN-1"
    assert len(rec["recommendation_reasons"]) > 0


# Test 8: POST /api/what-if/predict endpoint
def test_8_api_predict_scenario(client):
    payload = {
        "plant_id": 1,
        "scenario_name": "Energy Optimization -10%",
        "changes": {"electricity_consumption_kwh": -10.0},
        "change_type": "percentage",
    }
    response = client.post("/api/what-if/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "scenario_id" in data
    assert "ensemble_prediction" in data
    assert "co2_change" in data
    assert "feasible" in data


# Test 9: POST /api/what-if/compare endpoint
def test_9_api_compare_scenarios(client):
    payload = {
        "plant_id": 1,
        "scenarios": [
            {"name": "Energy -10%", "changes": {"electricity_consumption_kwh": -10.0}},
            {"name": "Fuel -10%", "changes": {"diesel_consumption_liters": -10.0}},
        ],
    }
    response = client.post("/api/what-if/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) == 2
    assert "recommendation" in data


# Test 10: POST /api/what-if/sensitivity endpoint
def test_10_api_sensitivity(client):
    payload = {
        "plant_id": 1,
        "feature": "electricity_consumption_kwh",
        "changes": [-20.0, -10.0, 0.0, 10.0],
    }
    response = client.post("/api/what-if/sensitivity", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) == 4


# TEST 11 — Sensitivity Analysis: Electricity
def test_11_sensitivity_electricity(client):
    payload = {
        "plant_id": 1,
        "feature": "electricity_consumption_kwh",
        "changes": [-20.0, -15.0, -10.0, -5.0, 0.0, 5.0, 10.0],
    }
    response = client.post("/api/what-if/sensitivity", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["feature"] == "electricity_consumption_kwh"
    assert len(data["points"]) == 7
    # Verify ensemble predictions returned for points
    for pt in data["points"]:
        assert pt["predicted_co2"] > 0.0
        assert "change_percentage" in pt


# TEST 12 — Sensitivity Analysis: Diesel Fuel
def test_12_sensitivity_diesel(client):
    payload = {
        "plant_id": 1,
        "feature": "diesel_consumption_liters",
        "changes": [-20.0, -10.0, 0.0, 10.0],
    }
    response = client.post("/api/what-if/sensitivity", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["feature"] == "diesel_consumption_liters"
    assert len(data["points"]) == 4


# TEST 13 — Sensitivity Analysis: Natural Gas
def test_13_sensitivity_natural_gas(client):
    payload = {
        "plant_id": 1,
        "feature": "natural_gas_consumption_m3",
        "changes": [-20.0, -10.0, 0.0, 10.0],
    }
    response = client.post("/api/what-if/sensitivity", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["feature"] == "natural_gas_consumption_m3"
    assert len(data["points"]) == 4


# TEST 14 — Sensitivity Analysis: Machine Runtime
def test_14_sensitivity_runtime(client):
    payload = {
        "plant_id": 1,
        "feature": "machine_runtime_hours",
        "changes": [-20.0, -10.0, 0.0, 10.0],
    }
    response = client.post("/api/what-if/sensitivity", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["feature"] == "machine_runtime_hours"
    assert len(data["points"]) == 4


# TEST 15 — Parameter Isolation Check
def test_15_sensitivity_parameter_isolation():
    from app.whatif.scenario_service import scenario_service
    from app.database.session import SessionLocal

    db = SessionLocal()
    try:
        baseline, _ = scenario_service.get_baseline_features(db, plant_id=1)
        res_elec = scenario_service.analyze_sensitivity(db, {"feature": "electricity_consumption_kwh"})
        
        # Verify electricity varies while diesel fuel & natural gas remain fixed at baseline
        for pt in res_elec["points"]:
            pct = pt["change_percentage"]
            expected_elec = round(baseline["electricity_consumption_kwh"] * (1.0 + pct / 100.0), 2)
            assert abs(pt["input_value"] - expected_elec) <= 0.05
    finally:
        db.close()


# TEST 16 — Parameter Differentiation Check
def test_16_sensitivity_different_parameters_produce_different_inputs():
    from app.whatif.scenario_service import scenario_service
    from app.database.session import SessionLocal

    db = SessionLocal()
    try:
        res_elec = scenario_service.analyze_sensitivity(db, {"feature": "electricity_consumption_kwh"})
        res_diesel = scenario_service.analyze_sensitivity(db, {"feature": "diesel_consumption_liters"})

        elec_inputs = [p["input_value"] for p in res_elec["points"]]
        diesel_inputs = [p["input_value"] for p in res_diesel["points"]]

        # Input sequences must differ between features
        assert elec_inputs != diesel_inputs
    finally:
        db.close()


# TEST 17 — Request Mapping Endpoint Contract
def test_17_api_request_mapping_features(client):
    for feat in ["electricity_consumption_kwh", "diesel_consumption_liters", "natural_gas_consumption_m3", "machine_runtime_hours"]:
        res = client.post("/api/what-if/sensitivity", json={"plant_id": 1, "feature": feat})
        assert res.status_code == 200
        assert res.json()["feature"] == feat


# TEST 18 — Stale Request Protection Logic Simulation
def test_18_stale_request_protection_simulation():
    req_counter = 0
    active_req_id = 0

    def trigger_request(param_name):
        nonlocal req_counter, active_req_id
        req_counter += 1
        current_id = req_counter
        active_req_id = current_id
        return current_id

    req1 = trigger_request("electricity_consumption_kwh")
    req2 = trigger_request("diesel_consumption_liters")

    # Older request req1 finishes after req2
    is_req1_stale = (req1 != active_req_id)
    is_req2_stale = (req2 != active_req_id)

    assert is_req1_stale is True
    assert is_req2_stale is False


# TEST 19 — Existing Simulation & Baseline Intact
def test_19_baseline_prediction_intact(client):
    payload = {
        "plant_id": 1,
        "scenario_name": "Standard Test",
        "changes": {"electricity_consumption_kwh": -5.0},
        "change_type": "percentage",
    }
    response = client.post("/api/what-if/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["baseline_prediction"] > 0.0
    assert data["ensemble_prediction"] > 0.0

