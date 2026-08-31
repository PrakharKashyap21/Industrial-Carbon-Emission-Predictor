import os
import json
import math
import numpy as np
import pandas as pd
from app.ml.feature_engineering import engineer_features
from app.ml.models.model_loader import load_model_artifacts

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODELS_DIR = os.path.join(BASE_DIR, "models")


class PredictionService:
    """Production prediction service managing feature engineering, ordering, model inference, and technical reliability scoring."""

    def __init__(self, models_root: str = MODELS_DIR):
        self.models_root = models_root
        self.rf_model = None
        self.xgb_model = None
        self.rf_weight = 0.45
        self.xgb_weight = 0.55
        self.feature_order = []
        self.feature_ranges = {}
        self.validation_metrics = {
            "r2": 0.9985,
            "mae": 214.69,
            "rmse": 291.41,
            "mape": 2.37
        }
        self.model_version = "ensemble_v1"
        self._load_models()
        self._load_metadata()

    def _load_models(self):
        """Lazy load or refresh model artifacts from disk."""
        self.rf_model, self.xgb_model, self.rf_weight, self.feature_order, _ = load_model_artifacts(self.models_root)
        self.xgb_weight = float(round(1.0 - self.rf_weight, 2))

    def _load_metadata(self):
        """Load feature ranges and model validation metrics if available."""
        ranges_path = os.path.join(self.models_root, "feature_ranges.json")
        if os.path.exists(ranges_path):
            try:
                with open(ranges_path, "r") as f:
                    self.feature_ranges = json.load(f)
            except Exception:
                pass

        ens_meta_path = os.path.join(self.models_root, "ensemble", "metadata.json")
        if os.path.exists(ens_meta_path):
            try:
                with open(ens_meta_path, "r") as f:
                    meta = json.load(f)
                    self.rf_weight = float(meta.get("rf_weight", self.rf_weight))
                    self.xgb_weight = float(meta.get("xgb_weight", round(1.0 - self.rf_weight, 2)))
                    self.model_version = meta.get("model_version", self.model_version)
                    if "validation_metrics" in meta:
                        self.validation_metrics = meta["validation_metrics"]
            except Exception:
                pass

    def is_loaded(self) -> bool:
        """Check whether RF and XGBoost model artifacts are loaded."""
        return self.rf_model is not None and self.xgb_model is not None

    def validate_and_sanitize_inputs(self, raw_features: dict) -> dict:
        """Validate input data types, missing values, NaN/Inf, and sensible operational domain bounds."""
        sanitized = {}
        
        required_fields = [
            "electricity_consumption_kwh",
            "diesel_consumption_liters",
            "natural_gas_consumption_m3",
            "production_quantity",
            "raw_material_consumption_kg",
            "machine_runtime_hours",
            "temperature_c",
            "pressure_bar",
            "previous_co2_emission_kg"
        ]

        # Field validation rules: (min_val, max_val, display_name, unit)
        domain_rules = {
            "electricity_consumption_kwh": (0.0, 100000.0, "Electricity Consumption", "kWh"),
            "diesel_consumption_liters": (0.0, 20000.0, "Diesel Consumption", "Liters"),
            "natural_gas_consumption_m3": (0.0, 50000.0, "Natural Gas Consumption", "m³"),
            "production_quantity": (0.0, 50000.0, "Production Quantity", "units"),
            "raw_material_consumption_kg": (0.0, 200000.0, "Raw Material Usage", "kg"),
            "machine_runtime_hours": (0.0, 24.0, "Machine Runtime Hours", "Hours"),
            "temperature_c": (-30.0, 1500.0, "Operating Temperature", "°C"),
            "pressure_bar": (0.0, 200.0, "Operating Pressure", "bar"),
            "previous_co2_emission_kg": (0.0, 200000.0, "Prior Period Baseline CO₂", "kg")
        }

        for field in required_fields:
            if field not in raw_features or raw_features[field] is None:
                display = domain_rules.get(field, (0, 0, field, ""))[2]
                raise ValueError(f"Missing required parameter: '{display}'. Please provide a valid numerical value.")

            val = raw_features[field]
            try:
                num_val = float(val)
            except (ValueError, TypeError):
                display = domain_rules.get(field, (0, 0, field, ""))[2]
                raise ValueError(f"Invalid format for '{display}'. Value must be a valid number.")

            if math.isnan(num_val) or math.isinf(num_val):
                display = domain_rules.get(field, (0, 0, field, ""))[2]
                raise ValueError(f"Numerical error for '{display}'. NaN or Infinite values are not permitted.")

            if field in domain_rules:
                min_v, max_v, display, unit = domain_rules[field]
                if num_val < min_v:
                    raise ValueError(f"'{display}' value ({num_val} {unit}) cannot be less than minimum operating limit of {min_v} {unit}.")
                if num_val > max_v:
                    raise ValueError(f"'{display}' value ({num_val} {unit}) exceeds maximum realistic capacity limit of {max_v} {unit}.")

            sanitized[field] = num_val

        sanitized["plant_id"] = int(raw_features.get("plant_id", 1))
        return sanitized

    def _assess_model_reliability(self, sanitized_features: dict, disagreement_pct: float) -> dict:
        """Calculate technically defensible model reliability and feature range applicability indicator."""
        out_of_bounds = []
        reasons = []
        in_range_count = 0
        total_checked = 0

        # Check submitted inputs against empirical training feature min/max bounds
        for feat_name, raw_val in sanitized_features.items():
            if feat_name in self.feature_ranges:
                bounds = self.feature_ranges[feat_name]
                min_b = bounds.get("min", 0.0)
                max_b = bounds.get("max", 1e9)
                total_checked += 1
                if raw_val < min_b or raw_val > max_b:
                    out_of_bounds.append({
                        "feature": feat_name,
                        "value": raw_val,
                        "training_min": min_b,
                        "training_max": max_b
                    })
                else:
                    in_range_count += 1

        range_coverage_pct = (in_range_count / total_checked * 100.0) if total_checked > 0 else 100.0

        # Scoring matrix: 60% weight on training applicability, 40% on ensemble agreement
        agreement_score = max(0.0, 100.0 - (disagreement_pct * 4.0))
        reliability_score = round(0.6 * range_coverage_pct + 0.4 * agreement_score, 1)

        if len(out_of_bounds) == 0 and disagreement_pct <= 5.0:
            status = "HIGH"
            reasons.append("All submitted inputs fall 100% within historical plant training bounds.")
            reasons.append(f"High model agreement with low ensemble variance (±{disagreement_pct:.1f}%).")
        elif len(out_of_bounds) <= 2 and disagreement_pct <= 10.0:
            status = "MODERATE"
            if out_of_bounds:
                feat_list_str = ", ".join([item["feature"].replace("_", " ").title() for item in out_of_bounds])
                reasons.append(f"Operating parameters ({feat_list_str}) fall outside historical training limits.")
            if disagreement_pct > 5.0:
                reasons.append(f"Moderate RF vs XGBoost prediction disagreement (±{disagreement_pct:.1f}%).")
        else:
            status = "LOW"
            reasons.append("Multiple operating inputs significantly exceed historical model training bounds.")
            reasons.append(f"Elevated ensemble model disagreement (±{disagreement_pct:.1f}%).")

        return {
            "reliability_status": status,
            "reliability_score": reliability_score,
            "reliability_reasons": reasons,
            "out_of_bounds_features": out_of_bounds,
            "range_coverage_pct": round(range_coverage_pct, 1)
        }

    def predict(self, raw_features: dict) -> dict:
        """Process raw parameters, apply feature engineering, enforce feature order, and predict emissions."""
        if not self.rf_model or not self.xgb_model:
            self._load_models()

        # 1. Input Sanitization & Domain Validation
        sanitized = self.validate_and_sanitize_inputs(raw_features)

        # Convert dict to single-row DataFrame
        input_df = pd.DataFrame([sanitized])

        # Fill default timestamp if missing for time features
        if "timestamp" not in input_df.columns:
            input_df["timestamp"] = pd.Timestamp.now()
        else:
            input_df["timestamp"] = pd.to_datetime(input_df["timestamp"])

        if "id" not in input_df.columns:
            input_df["id"] = 1

        # 2. Apply Feature Engineering
        engineered_df = engineer_features(input_df)

        # 3. Enforce Feature Ordering matching model_features.json
        missing_features = [col for col in self.feature_order if col not in engineered_df.columns]
        if missing_features:
            raise ValueError(f"Missing required model input features: {missing_features}")

        X_input = engineered_df[self.feature_order]

        # 4. Model Inference
        rf_pred = float(np.maximum(0.0, self.rf_model.predict(X_input)[0]))
        xgb_pred = float(np.maximum(0.0, self.xgb_model.predict(X_input)[0]))
        
        rf_pred = float(round(rf_pred, 2))
        xgb_pred = float(round(xgb_pred, 2))

        # Weighted Ensemble Calculation
        ens_pred = float(round(self.rf_weight * rf_pred + self.xgb_weight * xgb_pred, 2))

        # 5. Ensemble Disagreement Calculation
        disagreement_kg = float(round(abs(rf_pred - xgb_pred), 2))
        disagreement_pct = float(round((disagreement_kg / max(ens_pred, 1.0)) * 100, 2))

        # 6. Model Reliability Assessment
        reliability_info = self._assess_model_reliability(sanitized, disagreement_pct)

        # 7. Input Summary Record
        input_summary = {
            "electricity_consumption_kwh": sanitized["electricity_consumption_kwh"],
            "diesel_consumption_liters": sanitized["diesel_consumption_liters"],
            "natural_gas_consumption_m3": sanitized["natural_gas_consumption_m3"],
            "production_quantity": sanitized["production_quantity"],
            "raw_material_consumption_kg": sanitized["raw_material_consumption_kg"],
            "machine_runtime_hours": sanitized["machine_runtime_hours"],
            "temperature_c": sanitized["temperature_c"],
            "pressure_bar": sanitized["pressure_bar"],
            "previous_co2_emission_kg": sanitized["previous_co2_emission_kg"]
        }

        return {
            "random_forest_prediction_kg": rf_pred,
            "xgboost_prediction_kg": xgb_pred,
            "ensemble_prediction_kg": ens_pred,
            "selected_model": "ensemble",
            "model_version": self.model_version,
            "rf_weight_used": self.rf_weight,
            "xgb_weight_used": self.xgb_weight,
            "ensemble_disagreement_kg": disagreement_kg,
            "ensemble_disagreement_pct": disagreement_pct,
            "reliability_status": reliability_info["reliability_status"],
            "reliability_score": reliability_info["reliability_score"],
            "reliability_reasons": reliability_info["reliability_reasons"],
            "out_of_bounds_features": reliability_info["out_of_bounds_features"],
            "validation_metrics": self.validation_metrics,
            "input_summary": input_summary
        }


# Singleton PredictionService Instance
prediction_service = PredictionService()

