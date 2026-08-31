from typing import List, Dict, Any, Optional
from app.ml.explainability.explanation_service import explanation_service


class RecommendationEngine:
    """Selects best candidate operating configuration, generates SHAP explanations, and formats decision-support justifications."""

    def format_recommendation(
        self,
        top_candidate: Optional[Dict[str, Any]],
        baseline_prediction: float,
        constraints: Dict[str, Any] = None,
    ) -> Optional[Dict[str, Any]]:
        """Format decision-support recommendation response object."""
        if not top_candidate:
            return None

        cand_id = top_candidate["candidate_id"]
        inputs = top_candidate["input_values"]
        changes = top_candidate["change_values"]
        pred_co2 = top_candidate["ensemble_prediction"]
        co2_change = top_candidate["co2_change"]
        co2_change_pct = top_candidate["co2_change_percentage"]
        rel_status = top_candidate["reliability_status"]

        # Generate SHAP explanation for top candidate
        shap_explanation = None
        try:
            shap_res = explanation_service.explain_prediction(inputs)
            shap_explanation = shap_res.get("local_explanation")
        except Exception:
            shap_explanation = None

        rf_pred = top_candidate.get("rf_prediction", 0.0)
        xgb_pred = top_candidate.get("xgb_prediction", 0.0)

        # Build natural-language change summary list
        change_summary = []
        elec_chg = changes.get("electricity_change", 0.0)
        fuel_chg = changes.get("fuel_change", 0.0)
        runtime_chg = changes.get("runtime_change", 0.0)

        if elec_chg < 0:
            change_summary.append(f"Reduce electricity consumption by {abs(elec_chg)}%")
        else:
            change_summary.append("Maintain electricity consumption")

        if fuel_chg < 0:
            change_summary.append(f"Reduce fuel & natural gas consumption by {abs(fuel_chg)}%")
        else:
            change_summary.append("Maintain fuel consumption")

        if runtime_chg < 0:
            change_summary.append(f"Reduce machine runtime by {abs(runtime_chg)}%")
        else:
            change_summary.append("Maintain machine runtime")

        change_summary.append("Maintain production output (production constraint preserved)")

        # Build decision justification bullets using decision-support terminology
        reasons = []

        if co2_change < 0:
            abs_saving = abs(co2_change)
            abs_pct = abs(co2_change_pct)
            reasons.append(
                f"Model identifies this configuration as the lowest-emission feasible candidate (estimated saving of {abs_saving} kg CO₂ / {abs_pct}%)."
            )
        else:
            reasons.append("Current operating conditions remain recommended as alternative search candidates do not yield further savings.")

        reasons.append("All hard operational feasibility constraints (minimum production output) are fully satisfied.")
        reasons.append(f"Model prediction reliability is assessed as {rel_status} based on historical training bounds.")

        return {
            "recommended_candidate_id": cand_id,
            "recommended_changes": changes,
            "recommended_inputs": inputs,
            "baseline_prediction": baseline_prediction,
            "predicted_co2": pred_co2,
            "rf_prediction": rf_pred,
            "xgb_prediction": xgb_pred,
            "estimated_reduction_kg": abs(co2_change) if co2_change < 0 else 0.0,
            "estimated_reduction_percentage": abs(co2_change_pct) if co2_change < 0 else 0.0,
            "co2_change": co2_change,
            "co2_change_percentage": co2_change_pct,
            "reliability_status": rel_status,
            "feasible": True,
            "recommendation_reasons": reasons,
            "change_summary": change_summary,
            "shap_explanation": shap_explanation,
        }


recommendation_engine = RecommendationEngine()
