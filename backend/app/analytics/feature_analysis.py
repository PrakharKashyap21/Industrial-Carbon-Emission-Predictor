import math
from typing import List, Dict, Any


class FeatureAnalysisEngine:
    """Analyzes operational factor trends and calculates correlation coefficients against predicted CO₂ emissions."""

    def _pearson_correlation(self, x: List[float], y: List[float]) -> float:
        """Compute Pearson correlation coefficient r between two series."""
        n = len(x)
        if n < 2:
            return 0.0

        mean_x = sum(x) / n
        mean_y = sum(y) / n

        var_x = sum((val - mean_x) ** 2 for val in x)
        var_y = sum((val - mean_y) ** 2 for val in y)

        if var_x <= 1e-9 or var_y <= 1e-9:
            return 0.0

        cov_xy = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
        r = cov_xy / math.sqrt(var_x * var_y)
        return float(round(r, 4))

    def analyze_features(self, readings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute correlation matrix and feature factor trends."""
        if not readings:
            return {"correlations": [], "factor_trends": {}}

        co2_vals = [float(r.get("co2_emission_kg") or r.get("ensemble_prediction") or 0.0) for r in readings]

        feature_keys = [
            ("electricity_consumption_kwh", "Electricity Consumption"),
            ("diesel_consumption_liters", "Diesel Fuel Consumption"),
            ("natural_gas_consumption_m3", "Natural Gas Consumption"),
            ("production_quantity", "Production Output"),
            ("raw_material_consumption_kg", "Raw Material Consumption"),
            ("machine_runtime_hours", "Machine Runtime"),
        ]

        correlations = []
        for key, display_name in feature_keys:
            feat_vals = [float(r.get(key, 0.0)) for r in readings]
            corr_val = self._pearson_correlation(feat_vals, co2_vals)
            correlations.append({
                "feature_key": key,
                "display_name": display_name,
                "correlation_with_co2": corr_val,
            })

        # Sort correlations descending
        correlations.sort(key=lambda c: abs(c["correlation_with_co2"]), reverse=True)

        return {
            "correlations": correlations,
            "feature_count": len(feature_keys),
        }


feature_analysis_engine = FeatureAnalysisEngine()
