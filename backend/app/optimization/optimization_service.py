import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.models.industrial_reading import IndustrialReading
from app.models.optimization import OptimizationRun, OptimizationResult
from app.optimization.candidate_generator import candidate_generator
from app.optimization.optimization_evaluator import optimization_evaluator
from app.optimization.optimization_ranker import optimization_ranker
from app.optimization.recommendation_engine import recommendation_engine


class OptimizationService:
    """Master Orchestrator managing optimization search runs, candidate evaluation, DB persistence, and history auditing."""

    def get_baseline_features(self, db: Session, baseline_id: Optional[int] = None, plant_id: Optional[int] = 1, custom_baseline: Optional[Dict[str, Any]] = None) -> Tuple[Dict[str, Any], int]:
        """Fetch baseline features dictionary from custom override, PostgreSQL industrial readings table, or fallback."""
        if custom_baseline and isinstance(custom_baseline, dict) and len(custom_baseline) > 0:
            features = {
                "plant_id": custom_baseline.get("plant_id", plant_id or 1),
                "electricity_consumption_kwh": float(custom_baseline.get("electricity_consumption_kwh", 14000.0)),
                "diesel_consumption_liters": float(custom_baseline.get("diesel_consumption_liters", 600.0)),
                "natural_gas_consumption_m3": float(custom_baseline.get("natural_gas_consumption_m3", 2500.0)),
                "production_quantity": float(custom_baseline.get("production_quantity", 5000.0)),
                "raw_material_consumption_kg": float(custom_baseline.get("raw_material_consumption_kg", 5000.0)),
                "machine_runtime_hours": float(custom_baseline.get("machine_runtime_hours", 18.0)),
                "temperature_c": float(custom_baseline.get("temperature_c", 26.0)),
                "pressure_bar": float(custom_baseline.get("pressure_bar", 7.0)),
                "previous_co2_emission_kg": float(custom_baseline.get("previous_co2_emission_kg", 6500.0)),
            }
            return features, baseline_id or 1

        reading_obj = None
        if baseline_id:
            reading_obj = db.execute(select(IndustrialReading).where(IndustrialReading.id == baseline_id)).scalar_one_or_none()

        if not reading_obj:
            reading_obj = db.execute(
                select(IndustrialReading)
                .where(IndustrialReading.plant_id == plant_id)
                .order_by(desc(IndustrialReading.timestamp))
            ).scalars().first()

        if not reading_obj:
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

    def run_optimization(self, db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute full optimization run search, evaluate candidates, rank options, save to DB, and return recommendation."""
        baseline_id = payload.get("baseline_id")
        plant_id = payload.get("plant_id", 1)
        constraints = payload.get("constraints", {})
        search_params = payload.get("search", {})
        custom_base = payload.get("baseline_features") or payload.get("current_inputs")

        baseline_features, reading_id = self.get_baseline_features(db, baseline_id=baseline_id, plant_id=plant_id, custom_baseline=custom_base)

        # 1. Candidate Generation
        candidates = candidate_generator.generate_candidates(
            baseline_features=baseline_features,
            search_parameters=search_params,
        )

        # 2. Candidate Evaluation
        evaluated = optimization_evaluator.evaluate_candidates(
            candidates=candidates,
            baseline_features=baseline_features,
            constraints=constraints,
        )

        # 3. Candidate Ranking
        ranked = optimization_ranker.rank_candidates(evaluated_candidates=evaluated)

        # 4. Recommendation
        top_cand = ranked[0] if ranked else None
        baseline_pred = evaluated[0]["baseline_prediction"] if evaluated else 0.0
        recommendation = recommendation_engine.format_recommendation(
            top_candidate=top_cand,
            baseline_prediction=baseline_pred,
            constraints=constraints,
        )

        # Count metrics
        tot_gen = len(candidates)
        tot_eval = len(evaluated)
        tot_rej = len([c for c in evaluated if not c.get("feasible", True)])

        # Generate unique optimization ID
        opt_count = db.query(OptimizationRun).count() + 1
        opt_id = f"OPT-{opt_count:04d}"

        # 5. DB Persistence (OptimizationRun)
        run_obj = OptimizationRun(
            optimization_id=opt_id,
            plant_id=plant_id,
            baseline_id=reading_id,
            baseline_prediction=baseline_pred,
            constraints_json=json.dumps(constraints),
            search_parameters_json=json.dumps(search_params),
            candidates_generated=tot_gen,
            candidates_evaluated=tot_eval,
            candidates_rejected=tot_rej,
            recommended_candidate_id=top_cand.get("candidate_id") if top_cand else None,
            model_version="ensemble_v1",
            created_at=datetime.utcnow(),
        )

        db.add(run_obj)
        db.commit()
        db.refresh(run_obj)

        # Save individual candidate audit log results
        for item in evaluated:
            res_obj = OptimizationResult(
                optimization_db_id=run_obj.id,
                optimization_id=opt_id,
                candidate_id=item["candidate_id"],
                input_values_json=json.dumps(item["input_values"]),
                change_values_json=json.dumps(item["change_values"]),
                rf_prediction=item["rf_prediction"],
                xgb_prediction=item["xgb_prediction"],
                ensemble_prediction=item["ensemble_prediction"],
                co2_change=item["co2_change"],
                co2_change_percentage=item["co2_change_percentage"],
                reliability_status=item["reliability_status"],
                feasible=item["feasible"],
                rejection_reason=item["rejection_reason"],
                created_at=datetime.utcnow(),
            )
            db.add(res_obj)

        db.commit()

        return {
            "optimization_id": opt_id,
            "plant_id": plant_id,
            "baseline_id": reading_id,
            "baseline_prediction": baseline_pred,
            "candidates_generated": tot_gen,
            "candidates_evaluated": tot_eval,
            "candidates_rejected": tot_rej,
            "recommended_candidate": recommendation,
            "top_candidates": ranked[:5],  # top 5 ranked feasible candidates
        }

    def get_optimization_history(self, db: Session, plant_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetch list of saved optimization runs from PostgreSQL database."""
        query = select(OptimizationRun)
        if plant_id:
            query = query.where(OptimizationRun.plant_id == plant_id)

        query = query.order_by(desc(OptimizationRun.created_at))
        objs = db.execute(query).scalars().all()

        results = []
        for r in objs:
            results.append({
                "optimization_id": r.optimization_id,
                "plant_id": r.plant_id,
                "baseline_id": r.baseline_id,
                "baseline_prediction": r.baseline_prediction,
                "candidates_generated": r.candidates_generated,
                "candidates_evaluated": r.candidates_evaluated,
                "candidates_rejected": r.candidates_rejected,
                "recommended_candidate_id": r.recommended_candidate_id,
                "model_version": r.model_version,
                "created_at": r.created_at.isoformat(),
            })
        return results

    def get_optimization_candidates(self, db: Session, optimization_id: str) -> List[Dict[str, Any]]:
        """Fetch full candidate results audit trail for an optimization run."""
        query = select(OptimizationResult).where(OptimizationResult.optimization_id == optimization_id)
        objs = db.execute(query).scalars().all()

        results = []
        for c in objs:
            results.append({
                "candidate_id": c.candidate_id,
                "rf_prediction": c.rf_prediction,
                "xgb_prediction": c.xgb_prediction,
                "ensemble_prediction": c.ensemble_prediction,
                "co2_change": c.co2_change,
                "co2_change_percentage": c.co2_change_percentage,
                "reliability_status": c.reliability_status,
                "feasible": c.feasible,
                "rejection_reason": c.rejection_reason,
                "change_values": json.loads(c.change_values_json) if c.change_values_json else {},
                "input_values": json.loads(c.input_values_json) if c.input_values_json else {},
            })
        return results


optimization_service = OptimizationService()
