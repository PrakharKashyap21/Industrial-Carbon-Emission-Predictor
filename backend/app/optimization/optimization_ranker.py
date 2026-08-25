from typing import List, Dict, Any


class OptimizationRanker:
    """Ranks evaluated candidate configurations prioritizing feasibility, high/medium reliability, and lowest predicted CO₂ emissions."""

    def rank_candidates(
        self,
        evaluated_candidates: List[Dict[str, Any]],
        exclude_unreliable: bool = True,
    ) -> List[Dict[str, Any]]:
        """Filter out infeasible/critically unreliable candidates and rank remainder by lowest predicted CO₂."""
        feasible_candidates = [c for c in evaluated_candidates if c.get("feasible", True)]

        if exclude_unreliable:
            # Exclude LOW or CRITICAL if feasible candidates exist with HIGH/MEDIUM reliability
            high_med = [c for c in feasible_candidates if c.get("reliability_status") in ["HIGH", "MEDIUM"]]
            if high_med:
                feasible_candidates = high_med

        # Sort by ensemble_prediction ascending (lowest CO2 emission first)
        ranked = sorted(feasible_candidates, key=lambda c: float(c["ensemble_prediction"]))

        # Assign rank 1-indexed
        for idx, item in enumerate(ranked):
            item["rank"] = idx + 1

        return ranked


optimization_ranker = OptimizationRanker()
