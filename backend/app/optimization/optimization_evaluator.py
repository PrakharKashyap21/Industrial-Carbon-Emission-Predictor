from typing import Dict, Any, List
from app.ml.prediction_service import prediction_service
from app.monitoring.reliability import reliability_engine
from app.optimization.constraint_engine import constraint_engine


class OptimizationEvaluator:
    """Evaluates candidate input configurations by running ML ensemble inference, constraint checks, and reliability analysis."""

    def evaluate_candidates(
        self,
        candidates: List[Dict[str, Any]],
        baseline_features: Dict[str, Any],
        constraints: Dict[str, Any] = None,
    ) -> List[Dict[str, Any]]:
        """Run ML prediction pipeline and evaluate reliability and constraints for each candidate."""
        # 1. Baseline Ensemble Prediction
        baseline_res = prediction_service.predict(baseline_features)
        baseline_ens = float(baseline_res["ensemble_prediction_kg"])

        evaluated = []

        for cand in candidates:
            cand_id = cand["candidate_id"]
            input_vals = cand["input_values"]
            changes = cand["changes"]
            is_base = cand.get("is_baseline", False)

            # 2. Feasibility Validation
            feasible, rej_reason = constraint_engine.evaluate_constraints(
                candidate_inputs=input_vals,
                baseline_inputs=baseline_features,
                constraints=constraints,
            )

            # 3. ML Ensemble Prediction
            pred_res = prediction_service.predict(input_vals)
            ens_pred = float(pred_res["ensemble_prediction_kg"])
            rf_pred = float(pred_res.get("random_forest_prediction_kg", pred_res.get("rf_prediction_kg", 0.0)))
            xgb_pred = float(pred_res.get("xgboost_prediction_kg", pred_res.get("xgb_prediction_kg", 0.0)))

            # 4. Reliability Evaluation
            rel_res = reliability_engine.evaluate_single_prediction_reliability(input_vals)
            rel_status = rel_res["reliability_status"]

            # Filter out CRITICAL reliability as infeasible if not already rejected
            if rel_status == "CRITICAL" and feasible:
                feasible = False
                rej_reason = "Prediction reliability classified as CRITICAL (out of distribution bounds)"

            # 5. Math Differences against Baseline
            co2_change = float(round(ens_pred - baseline_ens, 2))
            co2_change_pct = float(round(((ens_pred - baseline_ens) / baseline_ens) * 100.0, 2)) if baseline_ens > 0 else 0.0

            evaluated.append({
                "candidate_id": cand_id,
                "is_baseline": is_base,
                "input_values": input_vals,
                "change_values": changes,
                "rf_prediction": rf_pred,
                "xgb_prediction": xgb_pred,
                "ensemble_prediction": ens_pred,
                "baseline_prediction": baseline_ens,
                "co2_change": co2_change,
                "co2_change_percentage": co2_change_pct,
                "reliability_status": rel_status,
                "reliability_reasons": rel_res.get("reliability_reasons", []),
                "feasible": feasible,
                "rejection_reason": rej_reason,
            })

        return evaluated


optimization_evaluator = OptimizationEvaluator()
