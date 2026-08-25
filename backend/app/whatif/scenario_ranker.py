from typing import List, Dict, Any


class ScenarioRanker:
    """Ranks scenarios based on operational feasibility, prediction reliability, and CO₂ emission reduction."""

    def rank_scenarios(self, scenarios: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank scenarios prioritizing feasibility -> non-critical reliability -> highest CO₂ reduction."""
        def sorting_key(item):
            feasible_score = 1 if item.get("feasible", True) else 0

            rel_str = item.get("reliability_status", "HIGH")
            rel_score = 2 if rel_str == "HIGH" else (1 if rel_str == "MEDIUM" else 0)

            # CO2 Reduction (positive number = reduction)
            co2_red = -float(item.get("co2_change", 0.0))  # negative of change so larger reduction comes first

            return (feasible_score, rel_score, co2_red)

        ranked = sorted(scenarios, key=sorting_key, reverse=True)

        # Assign rank 1-indexed
        for idx, item in enumerate(ranked):
            item["rank"] = idx + 1

        return ranked


scenario_ranker = ScenarioRanker()
