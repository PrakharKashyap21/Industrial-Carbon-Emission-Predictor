import pytest
from fastapi.testclient import TestClient

import app.models.plant
import app.models.industrial_reading
import app.models.prediction
import app.models.monitoring
import app.models.scenario
import app.models.optimization
from app.database.connection import engine
from app.database.base import Base
from app.database.session import SessionLocal
from app.services.seed_data import seed_database
from app.optimization.candidate_generator import candidate_generator
from app.optimization.constraint_engine import constraint_engine
from app.optimization.optimization_evaluator import optimization_evaluator
from app.optimization.optimization_ranker import optimization_ranker
from app.optimization.recommendation_engine import recommendation_engine
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


# Test 1: Candidate Generation Grid Search & Baseline Candidate Inclusion
def test_1_candidate_generation():
    baseline = {
        "electricity_consumption_kwh": 10000.0,
        "diesel_consumption_liters": 2000.0,
        "natural_gas_consumption_m3": 2500.0,
        "machine_runtime_hours": 12.0,
        "production_quantity": 5000.0,
    }
    search_params = {
        "max_electricity_reduction": 20.0,
        "electricity_step": 5.0,
        "max_fuel_reduction": 20.0,
        "fuel_step": 5.0,
        "max_runtime_reduction": 15.0,
        "runtime_step": 5.0,
    }
    candidates = candidate_generator.generate_candidates(
        baseline_features=baseline,
        search_parameters=search_params,
    )
    # 5 x 5 x 4 = 100 candidates
    assert len(candidates) == 100
    # Candidate 0 must be baseline
    assert candidates[0]["is_baseline"] is True
    assert candidates[0]["changes"]["electricity_change"] == 0.0


# Test 2: Constraint Engine Hard Constraints
def test_2_constraint_engine():
    baseline = {"production_quantity": 5000.0}
    cand_valid = {"production_quantity": 5000.0, "machine_runtime_hours": 12.0}
    cand_invalid = {"production_quantity": 4500.0, "machine_runtime_hours": 12.0}

    f1, r1 = constraint_engine.evaluate_constraints(
        candidate_inputs=cand_valid,
        baseline_inputs=baseline,
        constraints={"minimum_production": 5000.0},
    )
    assert f1 is True
    assert r1 == ""

    f2, r2 = constraint_engine.evaluate_constraints(
        candidate_inputs=cand_invalid,
        baseline_inputs=baseline,
        constraints={"minimum_production": 5000.0},
    )
    assert f2 is False
    assert "below required minimum" in r2


# Test 3: Optimizer Selects Lowest Feasible Predicted CO₂ Candidate
def test_3_optimizer_selection():
    evaluated = [
        {"candidate_id": "CND-0001", "ensemble_prediction": 8500.0, "feasible": True, "reliability_status": "HIGH"},
        {"candidate_id": "CND-0002", "ensemble_prediction": 7000.0, "feasible": False, "reliability_status": "HIGH"},  # Infeasible
        {"candidate_id": "CND-0003", "ensemble_prediction": 7425.0, "feasible": True, "reliability_status": "HIGH"},
        {"candidate_id": "CND-0004", "ensemble_prediction": 7950.0, "feasible": True, "reliability_status": "HIGH"},
    ]
    ranked = optimization_ranker.rank_candidates(evaluated)
    assert ranked[0]["candidate_id"] == "CND-0003"  # Lowest feasible prediction
    assert ranked[0]["ensemble_prediction"] == 7425.0


# Test 4: Prediction Reliability Filtering (Excludes Critical)
def test_4_reliability_filtering():
    evaluated = [
        {"candidate_id": "CND-0001", "ensemble_prediction": 6000.0, "feasible": True, "reliability_status": "CRITICAL"},
        {"candidate_id": "CND-0002", "ensemble_prediction": 7500.0, "feasible": True, "reliability_status": "HIGH"},
    ]
    ranked = optimization_ranker.rank_candidates(evaluated, exclude_unreliable=True)
    assert ranked[0]["candidate_id"] == "CND-0002"  # HIGH selected over CRITICAL


# Test 5: Recommendation Formatting & Decision-Support Terminology
def test_5_recommendation_formatting():
    top_cand = {
        "candidate_id": "CND-0037",
        "input_values": {"electricity_consumption_kwh": 8500.0},
        "change_values": {"electricity_change": -15.0},
        "ensemble_prediction": 7425.0,
        "co2_change": -1075.0,
        "co2_change_percentage": -12.65,
        "reliability_status": "HIGH",
    }
    rec = recommendation_engine.format_recommendation(
        top_candidate=top_cand,
        baseline_prediction=8500.0,
    )
    assert rec["recommended_candidate_id"] == "CND-0037"
    assert rec["estimated_reduction_kg"] == 1075.0
    assert len(rec["recommendation_reasons"]) > 0
    assert "lowest-emission feasible candidate" in rec["recommendation_reasons"][0]


# Test 6: POST /api/optimization/run endpoint
def test_6_api_run_optimization(client):
    payload = {
        "plant_id": 1,
        "constraints": {
            "minimum_production": 3000.0,
            "max_electricity_reduction": 15.0,
            "max_fuel_reduction": 15.0,
            "max_runtime_reduction": 10.0,
        },
        "search": {
            "electricity_step": 5.0,
            "fuel_step": 5.0,
            "runtime_step": 5.0,
        },
    }
    response = client.post("/api/optimization/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "optimization_id" in data
    assert "recommended_candidate" in data
    assert data["candidates_generated"] > 0


# Test 7: GET /api/optimization/history endpoint
def test_7_api_optimization_history(client):
    response = client.get("/api/optimization/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


# Test 8: GET /api/optimization/{id}/candidates endpoint
def test_8_api_optimization_candidates(client):
    hist = client.get("/api/optimization/history").json()
    opt_id = hist[0]["optimization_id"]

    response = client.get(f"/api/optimization/{opt_id}/candidates")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "rf_prediction" in data[0]
