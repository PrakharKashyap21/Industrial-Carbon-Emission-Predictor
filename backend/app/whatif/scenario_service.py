import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.models.industrial_reading import IndustrialReading
from app.models.scenario import Scenario, ScenarioResult
from app.whatif.scenario_engine import scenario_engine
from app.whatif.scenario_validator import scenario_validator
from app.whatif.scenario_comparator import scenario_comparator
from app.monitoring.reliability import reliability_engine
from app.ml.explainability.explanation_service import explanation_service


class ScenarioService:
    """Master Orchestrator managing What-if Scenario simulations, batch comparisons, sensitivity curves, and DB persistence."""

    def get_baseline_features(self, db: Session, baseline_id: Optional[int] = None, plant_id: Optional[int] = 1) -> Tuple[Dict[str, Any], int]:
        """Fetch baseline features dictionary from PostgreSQL industrial readings table."""
        reading_obj = None
        if baseline_id:
            reading_obj = db.execute(select(IndustrialReading).where(IndustrialReading.id == baseline_id)).scalar_one_or_none()

        if not reading_obj:
            # Fallback to latest reading for plant_id
            reading_obj = db.execute(
                select(IndustrialReading)
                .where(IndustrialReading.plant_id == plant_id)
                .order_by(desc(IndustrialReading.timestamp))
            ).scalars().first()

        if not reading_obj:
            # Synthetic fallback if database has no readings yet
            features = {
                "plant_id": plant_id or 1,
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
            return features, 1

        features = {
            "plant_id": reading_obj.plant_id,
            "electricity_consumption_kwh": reading_obj.electricity_consumption_kwh,
            "diesel_consumption_liters": reading_obj.diesel_consumption_liters,
            "natural_gas_consumption_m3": reading_obj.natural_gas_consumption_m3,
            "production_quantity": reading_obj.production_quantity,
            "raw_material_consumption_kg": reading_obj.raw_material_consumption_kg,
            "machine_runtime_hours": reading_obj.machine_runtime_hours,
            "temperature_c": reading_obj.temperature_c,
            "pressure_bar": reading_obj.pressure_bar,
            "previous_co2_emission_kg": reading_obj.previous_co2_emission_kg,
        }
        return features, reading_obj.id

    def predict_single_scenario(self, db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate single What-if scenario against baseline operating reading."""
        baseline_id = payload.get("baseline_id")
        plant_id = payload.get("plant_id", 1)
        changes = payload.get("changes", {})
        change_type = payload.get("change_type", "percentage")
        scen_name = payload.get("scenario_name", "Custom Scenario")
        constraints = payload.get("constraints")

        baseline_features, reading_id = self.get_baseline_features(db, baseline_id=baseline_id, plant_id=plant_id)

        # 1. Run Simulation
        sim_res = scenario_engine.simulate_scenario(
            baseline_features=baseline_features,
            changes=changes,
            change_type=change_type,
            scenario_name=scen_name,
        )

        # 2. Feasibility Check
        val_res = scenario_validator.validate_feasibility(
            scenario_inputs=sim_res["scenario_inputs"],
            baseline_inputs=baseline_features,
            constraints=constraints,
        )

        # 3. Reliability Check
        rel_res = reliability_engine.evaluate_single_prediction_reliability(sim_res["scenario_inputs"])

        # 4. Optional SHAP explanation
        shap_explanation = None
        try:
            shap_res = explanation_service.explain_prediction(sim_res["scenario_inputs"])
            shap_explanation = shap_res.get("local_explanation")
        except Exception:
            shap_explanation = None

        return {
            "scenario_id": payload.get("scenario_id", "SCN-0001"),
            "scenario_name": scen_name,
            "baseline_id": reading_id,
            "plant_id": plant_id,
            "baseline_prediction": sim_res["baseline_prediction"],
            "rf_prediction": sim_res["rf_prediction"],
            "xgb_prediction": sim_res["xgb_prediction"],
            "ensemble_prediction": sim_res["ensemble_prediction"],
            "co2_change": sim_res["co2_change"],
            "co2_change_percentage": sim_res["co2_change_percentage"],
            "interpretation": sim_res["interpretation"],
            "reliability_status": rel_res["reliability_status"],
            "reliability_reasons": rel_res["reliability_reasons"],
            "feasible": val_res["feasible"],
            "violations": val_res["violations"],
            "scenario_inputs": sim_res["scenario_inputs"],
            "baseline_inputs": baseline_features,
            "shap_explanation": shap_explanation,
        }

    def compare_multiple_scenarios(self, db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Batch simulate, compare, rank, and recommend across multiple scenarios."""
        baseline_id = payload.get("baseline_id")
        plant_id = payload.get("plant_id", 1)
        scenarios_payload = payload.get("scenarios", [])
        constraints = payload.get("constraints")

        baseline_features, reading_id = self.get_baseline_features(db, baseline_id=baseline_id, plant_id=plant_id)

        res = scenario_comparator.compare_batch(
            baseline_features=baseline_features,
            scenarios_payload=scenarios_payload,
            constraints=constraints,
        )

        res["baseline_id"] = reading_id
        res["plant_id"] = plant_id
        return res

    def analyze_sensitivity(self, db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Run single-variable sensitivity analysis across variation steps."""
        baseline_id = payload.get("baseline_id")
        plant_id = payload.get("plant_id", 1)
        feature = payload.get("feature", "electricity_consumption_kwh")
        changes_list = payload.get("changes", [-20.0, -15.0, -10.0, -5.0, 0.0, 5.0, 10.0])

        baseline_features, reading_id = self.get_baseline_features(db, baseline_id=baseline_id, plant_id=plant_id)

        points = []
        for change_pct in sorted(changes_list):
            sim_res = scenario_engine.simulate_scenario(
                baseline_features=baseline_features,
                changes={feature: change_pct},
                change_type="percentage",
                scenario_name=f"{feature} ({change_pct}%)",
            )
            rel_res = reliability_engine.evaluate_single_prediction_reliability(sim_res["scenario_inputs"])

            points.append({
                "change_percentage": change_pct,
                "input_value": sim_res["scenario_inputs"].get(feature),
                "predicted_co2": sim_res["ensemble_prediction"],
                "co2_change": sim_res["co2_change"],
                "co2_change_percentage": sim_res["co2_change_percentage"],
                "reliability_status": rel_res["reliability_status"],
            })

        return {
            "baseline_id": reading_id,
            "feature": feature,
            "baseline_prediction": points[0]["predicted_co2"] if points else 0.0,
            "points": points,
        }

    def save_scenario(self, db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Persist scenario definition and result record to PostgreSQL."""
        scen_dict = self.predict_single_scenario(db, payload)

        scen_obj = Scenario(
            scenario_id=scen_dict["scenario_id"],
            scenario_name=scen_dict["scenario_name"],
            baseline_id=scen_dict["baseline_id"],
            plant_id=scen_dict["plant_id"],
            scenario_type=payload.get("scenario_type", "custom"),
            change_type=payload.get("change_type", "percentage"),
            input_values_json=json.dumps(scen_dict["scenario_inputs"]),
            change_values_json=json.dumps(payload.get("changes", {})),
            is_saved=True,
            created_at=datetime.utcnow(),
        )

        db.add(scen_obj)
        db.commit()
        db.refresh(scen_obj)

        result_obj = ScenarioResult(
            scenario_db_id=scen_obj.id,
            scenario_id=scen_obj.scenario_id,
            rf_prediction=scen_dict["rf_prediction"],
            xgb_prediction=scen_dict["xgb_prediction"],
            ensemble_prediction=scen_dict["ensemble_prediction"],
            baseline_prediction=scen_dict["baseline_prediction"],
            co2_change=scen_dict["co2_change"],
            co2_change_percentage=scen_dict["co2_change_percentage"],
            interpretation=scen_dict["interpretation"],
            reliability_status=scen_dict["reliability_status"],
            feasible=scen_dict["feasible"],
            violations_json=json.dumps(scen_dict["violations"]),
            warnings_json=json.dumps(scen_dict["reliability_reasons"]),
            created_at=datetime.utcnow(),
        )

        db.add(result_obj)
        db.commit()
        db.refresh(result_obj)

        return scen_dict

    def get_saved_scenarios(self, db: Session, plant_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetch list of saved What-if scenarios from database."""
        query = select(Scenario).where(Scenario.is_saved == True)
        if plant_id:
            query = query.where(Scenario.plant_id == plant_id)

        query = query.order_by(desc(Scenario.created_at))
        objs = db.execute(query).scalars().all()

        results = []
        for s in objs:
            res_obj = db.execute(select(ScenarioResult).where(ScenarioResult.scenario_db_id == s.id)).scalar_one_or_none()
            results.append({
                "scenario_id": s.scenario_id,
                "scenario_name": s.scenario_name,
                "plant_id": s.plant_id,
                "scenario_type": s.scenario_type,
                "created_at": s.created_at.isoformat(),
                "ensemble_prediction": res_obj.ensemble_prediction if res_obj else None,
                "co2_change": res_obj.co2_change if res_obj else None,
                "co2_change_percentage": res_obj.co2_change_percentage if res_obj else None,
                "reliability_status": res_obj.reliability_status if res_obj else "HIGH",
                "feasible": res_obj.feasible if res_obj else True,
            })
        return results


scenario_service = ScenarioService()
