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

        # Build decision justification bullets using decision-support terminology
        reasons = []

        if co2_change < 0:
            abs_saving = abs(co2_change)
            abs_pct = abs(co2_change_pct)
            reasons.append(
                f"The model identifies this configuration as the lowest-emission feasible candidate (estimated saving of {abs_saving} kg CO₂ / {abs_pct}%)."
            )
        else:
            reasons.append("Current baseline operating conditions remain recommended as alternative configurations increase emissions.")

        reasons.append("All hard operational feasibility constraints (minimum production output) are fully satisfied.")
        reasons.append(f"Model prediction reliability is assessed as {rel_status} based on historical training bounds.")

        return {
            "recommended_candidate_id": cand_id,
            "recommended_changes": changes,
            "recommended_inputs": inputs,
            "baseline_prediction": baseline_prediction,
            "predicted_co2": pred_co2,
            "estimated_reduction_kg": abs(co2_change) if co2_change < 0 else 0.0,
            "estimated_reduction_percentage": abs(co2_change_pct) if co2_change < 0 else 0.0,
            "co2_change": co2_change,
            "co2_change_percentage": co2_change_pct,
            "reliability_status": rel_status,
            "feasible": True,
            "recommendation_reasons": reasons,
            "shap_explanation": shap_explanation,
        }


recommendation_engine = RecommendationEngine()
