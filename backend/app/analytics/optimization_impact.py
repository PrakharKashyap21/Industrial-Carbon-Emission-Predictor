from typing import List, Dict, Any


class OptimizationImpactEngine:
    """Calculates cumulative model-estimated carbon reduction impact from historical optimization search runs."""

    def calculate_impact(self, optimization_runs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate cumulative model-estimated CO₂ savings across optimization runs."""
        if not optimization_runs:
            return {
                "total_runs": 0,
                "cumulative_estimated_saving_kg": 0.0,
                "average_reduction_percentage": 0.0,
                "best_run_saving_kg": 0.0,
                "history": [],
            }

        total_runs = len(optimization_runs)
        tot_savings = 0.0
        pct_list = []
        best_saving = 0.0
        history_items = []

        for r in optimization_runs:
            baseline = float(r.get("baseline_prediction", 0.0))
            best_co2 = float(r.get("best_prediction") or r.get("recommended_candidate_co2") or baseline)
            saving = max(0.0, baseline - best_co2)
            pct = ((saving / baseline) * 100.0) if baseline > 0 else 0.0

            tot_savings += saving
            pct_list.append(pct)
            if saving > best_saving:
                best_saving = saving

            history_items.append({
                "optimization_id": r.get("optimization_id"),
                "date": str(r.get("created_at") or "2026-08-15").split("T")[0],
                "baseline_prediction": round(baseline, 2),
                "recommended_co2": round(best_co2, 2),
                "estimated_reduction_kg": round(saving, 2),
                "estimated_reduction_percentage": round(pct, 2),
            })

        avg_pct = (sum(pct_list) / total_runs) if total_runs > 0 else 0.0

        return {
            "total_runs": total_runs,
            "cumulative_estimated_saving_kg": round(tot_savings, 2),
            "average_reduction_percentage": round(avg_pct, 2),
            "best_run_saving_kg": round(best_saving, 2),
            "history": history_items[:10],
        }


optimization_impact_engine = OptimizationImpactEngine()
