from typing import List, Dict, Any


class ScenarioRecommendationEngine:
    """Recommends the best feasible scenario and generates explainable human-readable justification bullets."""

    def recommend_best_scenario(self, ranked_scenarios: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Identify top recommended scenario from ranked scenarios and generate reasoning."""
        if not ranked_scenarios:
            return None

        # Filter feasible first
        feasible_list = [s for s in ranked_scenarios if s.get("feasible", True)]
        target_list = feasible_list if feasible_list else ranked_scenarios

        best = target_list[0]
        reasons = []

        co2_change = best.get("co2_change", 0.0)
        co2_change_pct = best.get("co2_change_percentage", 0.0)

        if co2_change < 0:
            abs_red = abs(co2_change)
            abs_pct = abs(co2_change_pct)
            reasons.append(f"Achieves highest estimated CO₂ reduction ({abs_red} kg CO₂ / {abs_pct}%) among feasible scenarios.")
        else:
            reasons.append("Baseline current operation remains recommended as alternative scenarios increase emissions.")

        if best.get("feasible", True):
            reasons.append("Satisfies all operational constraints (minimum production output preserved).")

        rel = best.get("reliability_status", "HIGH")
        reasons.append(f"Prediction reliability is assessed as {rel} based on training range bounds.")

        return {
            "recommended_scenario_id": best.get("scenario_id"),
            "recommended_scenario_name": best.get("scenario_name"),
            "estimated_co2_kg": best.get("ensemble_prediction"),
            "co2_change_kg": co2_change,
            "co2_change_percentage": co2_change_pct,
            "reliability_status": rel,
            "feasible": best.get("feasible", True),
            "recommendation_reasons": reasons,
        }


scenario_recommendation_engine = ScenarioRecommendationEngine()
