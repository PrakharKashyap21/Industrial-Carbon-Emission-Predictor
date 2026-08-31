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
