from typing import Dict, Any, List
from app.ml.prediction_service import prediction_service
from app.ml.explainability.explanation_service import explanation_service
from app.ml.what_if.scenario_validation import scenario_validator
from app.ml.what_if.scenario_comparison import compare_scenarios


class ScenarioService:
    """Production What-if Analysis service evaluating baseline vs scenario predictions and SHAP attributions."""

    def analyze_scenario(self, baseline_input: dict, scenario_input: dict, scenario_name: str = "Custom Scenario") -> dict:
        """Run single scenario analysis comparing baseline vs scenario predictions.
        
        Args:
            baseline_input (dict): Current operational parameters.
            scenario_input (dict): Modified operational parameters.
            scenario_name (str): Scenario title.
            
        Returns:
            dict: Scenario analysis response payload.
        """
        # 1. Baseline & Scenario Predictions (Reusing PredictionService)
        base_pred_res = prediction_service.predict(baseline_input)
        scen_pred_res = prediction_service.predict(scenario_input)

        base_pred_kg = base_pred_res["ensemble_prediction_kg"]
        scen_pred_kg = scen_pred_res["ensemble_prediction_kg"]

        base_prod = float(baseline_input.get("production_quantity", 0.0))
        scen_prod = float(scenario_input.get("production_quantity", 0.0))

        base_intensity = round(base_pred_kg / base_prod, 2) if base_prod > 0 else None
        scen_intensity = round(scen_pred_kg / scen_prod, 2) if scen_prod > 0 else None

        # 2. SHAP Explanations (Reusing ExplanationService)
        base_shap = explanation_service.explain_prediction(baseline_input)
        scen_shap = explanation_service.explain_prediction(scenario_input)

        # 3. Out-of-Training-Range Validation
        out_of_range, warnings = scenario_validator.validate_scenario(scenario_input)

        # 4. Scenario Comparison Calculation
        comparison = compare_scenarios(
            baseline_pred_kg=base_pred_kg,
            scenario_pred_kg=scen_pred_kg,
            baseline_prod_units=base_prod,
            scenario_prod_units=scen_prod,
            baseline_shap=base_shap,
            scenario_shap=scen_shap,
        )

        return {
            "scenario_name": scenario_name,
            "model": {
                "name": base_pred_res["selected_model"],
                "version": base_pred_res["model_version"],
            },
            "baseline": {
                "prediction_kg": base_pred_kg,
                "production_units": base_prod,
                "co2_intensity": base_intensity,
            },
            "scenario": {
                "prediction_kg": scen_pred_kg,
                "production_units": scen_prod,
                "co2_intensity": scen_intensity,
            },
            "comparison": comparison,
            "validation": {
                "out_of_training_range": out_of_range,
                "warnings": warnings,
            },
            "shap_explanation": {
                "baseline_shap": base_shap,
                "scenario_shap": scen_shap,
                "shap_comparison": comparison.get("shap_comparison"),
            },
        }

    def analyze_batch_scenarios(self, baseline_input: dict, scenarios: List[dict]) -> dict:
        """Run batch scenario analysis comparing multiple scenarios against baseline.
        
        Args:
            baseline_input (dict): Baseline operational parameters.
            scenarios (List[dict]): List of scenario items [{'name': '...', 'scenario': {...}}].
            
        Returns:
            dict: Batch scenario analysis response.
        """
        # Run baseline prediction once
        base_pred_res = prediction_service.predict(baseline_input)
        base_pred_kg = base_pred_res["ensemble_prediction_kg"]
        base_prod = float(baseline_input.get("production_quantity", 0.0))
        base_intensity = round(base_pred_kg / base_prod, 2) if base_prod > 0 else None

        results = []
        lowest_co2 = float("inf")
        best_name = None

        for item in scenarios:
            name = item.get("name", "Scenario")
            scen_input = item.get("scenario", item)
            res = self.analyze_scenario(baseline_input, scen_input, scenario_name=name)
            results.append(res)

            scen_co2 = res["scenario"]["prediction_kg"]
            if scen_co2 < lowest_co2:
                lowest_co2 = scen_co2
                best_name = name

        return {
            "model": {
                "name": base_pred_res["selected_model"],
                "version": base_pred_res["model_version"],
            },
            "baseline": {
                "prediction_kg": base_pred_kg,
                "production_units": base_prod,
                "co2_intensity": base_intensity,
            },
            "scenarios": results,
            "best_scenario_name": best_name,
        }


# Singleton ScenarioService Instance
scenario_service = ScenarioService()
