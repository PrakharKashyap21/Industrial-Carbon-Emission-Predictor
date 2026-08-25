import os
import numpy as np
import pandas as pd
from typing import Dict, Any

from app.ml.feature_engineering import engineer_features
from app.ml.models.model_loader import load_model_artifacts
from app.ml.explainability.shap_explainer import explainer_manager
from app.ml.explainability.local_explanation import generate_local_explanation
from app.ml.explainability.global_explanation import calculate_global_shap_importance

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
MODELS_DIR = os.path.join(BASE_DIR, "models")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")


class ExplanationService:
    """Production SHAP Explanation Service supporting Random Forest, XGBoost, and Weighted Ensemble SHAP."""

    def __init__(self, models_root: str = MODELS_DIR):
        self.models_root = models_root
        self.rf_model = None
        self.xgb_model = None
        self.rf_weight = 0.45
        self.feature_order = []
        self._load_models()

    def _load_models(self):
        """Load model artifacts and feature order from disk."""
        self.rf_model, self.xgb_model, self.rf_weight, self.feature_order, _ = load_model_artifacts(self.models_root)

    def explain_prediction(self, raw_features: dict) -> dict:
        """Process raw parameters, run feature engineering, generate prediction, compute SHAP, and validate additive property.
        
        Args:
            raw_features (dict): Dictionary of raw operational parameters.
            
        Returns:
            dict: Comprehensive prediction and SHAP explanation payload.
        """
        if not self.rf_model or not self.xgb_model:
            self._load_models()

        input_df = pd.DataFrame([raw_features])
        if "timestamp" not in input_df.columns:
            input_df["timestamp"] = pd.Timestamp.now()
        else:
            input_df["timestamp"] = pd.to_datetime(input_df["timestamp"])

        if "id" not in input_df.columns:
            input_df["id"] = 1
        if "plant_id" not in input_df.columns:
            input_df["plant_id"] = 1

        # 1. Apply Phase 3 Feature Engineering (Reused)
        engineered_df = engineer_features(input_df)

        missing_features = [col for col in self.feature_order if col not in engineered_df.columns]
        if missing_features:
            raise ValueError(f"Missing required model input features: {missing_features}")

        X_input = engineered_df[self.feature_order]

        # 2. Model Predictions
        rf_pred = float(np.maximum(0.0, self.rf_model.predict(X_input)[0]))
        xgb_pred = float(np.maximum(0.0, self.xgb_model.predict(X_input)[0]))
        ens_pred = float(round(self.rf_weight * rf_pred + (1.0 - self.rf_weight) * xgb_pred, 2))

        # 3. SHAP Calculation
        rf_explainer = explainer_manager.get_rf_explainer(self.rf_model)
        xgb_explainer = explainer_manager.get_xgb_explainer(self.xgb_model)

        rf_shap_obj = rf_explainer(X_input)
        xgb_shap_obj = xgb_explainer(X_input)

        # Extract Base Values (Expected Values)
        rf_base = float(rf_shap_obj.base_values[0]) if hasattr(rf_shap_obj.base_values, "__len__") else float(rf_shap_obj.base_values)
        xgb_base = float(xgb_shap_obj.base_values[0]) if hasattr(xgb_shap_obj.base_values, "__len__") else float(xgb_shap_obj.base_values)

        rf_shap_vals = np.array(rf_shap_obj.values[0])
        xgb_shap_vals = np.array(xgb_shap_obj.values[0])

        # 4. Ensemble SHAP Combination: w * RF_SHAP + (1-w) * XGB_SHAP
        ens_base = float(round(self.rf_weight * rf_base + (1.0 - self.rf_weight) * xgb_base, 2))
        ens_shap_vals = self.rf_weight * rf_shap_vals + (1.0 - self.rf_weight) * xgb_shap_vals

        # 5. Generate Local Explanation Payload
        local_exp = generate_local_explanation(
            prediction_kg=ens_pred,
            base_value_kg=ens_base,
            shap_values=ens_shap_vals,
            feature_names=self.feature_order,
            input_row=X_input.iloc[0],
            tolerance=2.0
        )

        return {
            "model": {
                "name": "ensemble",
                "version": "ensemble_v1",
                "rf_weight": self.rf_weight,
                "xgb_weight": round(1.0 - self.rf_weight, 2),
            },
            "prediction": {
                "co2_kg": ens_pred,
                "random_forest_kg": round(rf_pred, 2),
                "xgboost_kg": round(xgb_pred, 2),
            },
            "explanation": {
                "base_value_kg": local_exp["base_value_kg"],
                "additive_check": local_exp["additive_check"],
                "difference": local_exp["difference"],
                "summary_text": local_exp["summary_text"],
            },
            "contributors": local_exp["contributors"],
            "top_positive": local_exp["top_positive"],
            "top_negative": local_exp["top_negative"],
        }

    def generate_global_importance(self, sample_size: int = 100) -> dict:
        """Compute global feature importances across training data sample."""
        if not self.rf_model or not self.xgb_model:
            self._load_models()

        X_train_path = os.path.join(PROCESSED_DIR, "X_train.csv")
        if not os.path.exists(X_train_path):
            raise FileNotFoundError(f"Training dataset not found at {X_train_path}")

        X_train = pd.read_csv(X_train_path)[self.feature_order].head(sample_size)

        rf_explainer = explainer_manager.get_rf_explainer(self.rf_model)
        xgb_explainer = explainer_manager.get_xgb_explainer(self.xgb_model)

        rf_shap_vals = np.asarray(rf_explainer(X_train).values)
        xgb_shap_vals = np.asarray(xgb_explainer(X_train).values)

        ens_shap_vals = self.rf_weight * rf_shap_vals + (1.0 - self.rf_weight) * xgb_shap_vals

        importance_list = calculate_global_shap_importance(
            shap_matrix=ens_shap_vals,
            feature_names=self.feature_order,
            save_plot=True
        )

        return {
            "model_version": "ensemble_v1",
            "sample_size": len(X_train),
            "features": importance_list
        }


# Singleton ExplanationService Instance
explanation_service = ExplanationService()
