from typing import List, Dict, Any
from app.whatif.scenario_engine import scenario_engine
from app.whatif.scenario_validator import scenario_validator
from app.monitoring.reliability import reliability_engine
from app.whatif.scenario_ranker import scenario_ranker
from app.whatif.scenario_recommendation import scenario_recommendation_engine


class ScenarioComparator:
    """Executes multi-scenario batch simulation, evaluates reliability & constraints, ranks scenarios, and identifies recommended option."""

    def compare_batch(
        self,
        baseline_features: Dict[str, Any],
        scenarios_payload: List[Dict[str, Any]],
        constraints: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Simulate, evaluate, compare, rank, and recommend across multiple scenarios."""
        max_batch = 20
        scenarios_payload = scenarios_payload[:max_batch]

        evaluated_scenarios = []

        for idx, item in enumerate(scenarios_payload):
            scen_name = item.get("name", f"Scenario {idx + 1}")
            scen_id = item.get("scenario_id", f"SCN-{idx + 1:04d}")
            changes = item.get("changes", {})
            change_type = item.get("change_type", "percentage")

            # 1. Run Simulation
            sim_res = scenario_engine.simulate_scenario(
                baseline_features=baseline_features,
                changes=changes,
                change_type=change_type,
                scenario_name=scen_name,
            )

            # 2. Feasibility Validation
            val_res = scenario_validator.validate_feasibility(
                scenario_inputs=sim_res["scenario_inputs"],
                baseline_inputs=baseline_features,
                constraints=constraints,
            )

            # 3. Reliability Assessment
            rel_res = reliability_engine.evaluate_single_prediction_reliability(sim_res["scenario_inputs"])

            scen_dict = {
                "scenario_id": scen_id,
                "scenario_name": scen_name,
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
                "changes": changes,
                "change_type": change_type,
            }

            evaluated_scenarios.append(scen_dict)

        # 4. Rank Scenarios
        ranked = scenario_ranker.rank_scenarios(evaluated_scenarios)

        # 5. Recommendation
        recommendation = scenario_recommendation_engine.recommend_best_scenario(ranked)

        return {
            "baseline_prediction": evaluated_scenarios[0]["baseline_prediction"] if evaluated_scenarios else 0.0,
            "total_scenarios": len(evaluated_scenarios),
            "scenarios": ranked,
            "recommendation": recommendation,
        }


scenario_comparator = ScenarioComparator()
