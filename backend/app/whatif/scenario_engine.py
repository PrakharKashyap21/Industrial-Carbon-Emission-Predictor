from typing import Dict, Any, Tuple
from app.ml.prediction_service import prediction_service

PARAM_KEYS = [
    "electricity_consumption_kwh",
    "diesel_consumption_liters",
    "natural_gas_consumption_m3",
    "production_quantity",
    "raw_material_consumption_kg",
    "machine_runtime_hours",
    "temperature_c",
    "pressure_bar",
    "previous_co2_emission_kg",
]


class ScenarioEngine:
    """Core What-if Scenario simulation engine computing transformed inputs and ML predictions."""

    def compute_scenario_inputs(
        self,
        baseline_features: Dict[str, Any],
        changes: Dict[str, float],
        change_type: str = "percentage",
    ) -> Dict[str, Any]:
        """Transform baseline operating features based on percentage or absolute parameter changes."""
        scenario_inputs = dict(baseline_features)

        for key, val in changes.items():
            if key in scenario_inputs and val is not None:
                base_val = float(scenario_inputs[key])
                if change_type == "percentage":
                    new_val = base_val * (1.0 + (float(val) / 100.0))
                else:  # absolute
                    new_val = float(val)

                # Runtime hours upper bound check (24h)
                if key == "machine_runtime_hours":
                    new_val = min(24.0, max(0.0, new_val))
                else:
                    new_val = max(0.0, new_val)

                scenario_inputs[key] = float(round(new_val, 2))

        return scenario_inputs

    def simulate_scenario(
        self,
        baseline_features: Dict[str, Any],
        changes: Dict[str, float],
        change_type: str = "percentage",
        scenario_name: str = "Custom Scenario",
    ) -> Dict[str, Any]:
        """Run ML prediction pipeline for scenario input and calculate baseline comparison metrics."""
        # 1. Baseline Prediction
        baseline_res = prediction_service.predict(baseline_features)
        base_ens = baseline_res["ensemble_prediction_kg"]

        # 2. Compute Modified Scenario Inputs
        scenario_inputs = self.compute_scenario_inputs(
            baseline_features=baseline_features,
            changes=changes,
            change_type=change_type,
        )

        # 3. Scenario Prediction
        scenario_res = prediction_service.predict(scenario_inputs)
        scen_ens = scenario_res["ensemble_prediction_kg"]
        scen_rf = scenario_res.get("random_forest_prediction_kg", scenario_res.get("rf_prediction_kg", 0.0))
        scen_xgb = scenario_res.get("xgboost_prediction_kg", scenario_res.get("xgb_prediction_kg", 0.0))

        # 4. Math Differences
        co2_change = float(round(scen_ens - base_ens, 2))
        co2_change_pct = float(round(((scen_ens - base_ens) / base_ens) * 100.0, 2)) if base_ens > 0 else 0.0

        interpretation = "No change"
        if scen_ens < base_ens:
            interpretation = "CO2 reduction"
        elif scen_ens > base_ens:
            interpretation = "CO2 increase"

        return {
            "scenario_name": scenario_name,
            "baseline_prediction": base_ens,
            "rf_prediction": scen_rf,
            "xgb_prediction": scen_xgb,
            "ensemble_prediction": scen_ens,
            "co2_change": co2_change,
            "co2_change_percentage": co2_change_pct,
            "interpretation": interpretation,
            "scenario_inputs": scenario_inputs,
            "baseline_inputs": baseline_features,
        }


scenario_engine = ScenarioEngine()
