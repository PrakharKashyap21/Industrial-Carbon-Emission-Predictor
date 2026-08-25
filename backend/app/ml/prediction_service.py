import os
import json
import numpy as np
import pandas as pd
from app.ml.feature_engineering import engineer_features
from app.ml.models.model_loader import load_model_artifacts

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODELS_DIR = os.path.join(BASE_DIR, "models")


class PredictionService:
    """Production prediction service managing feature engineering, ordering, and model inference."""

    def __init__(self, models_root: str = MODELS_DIR):
        self.models_root = models_root
        self.rf_model = None
        self.xgb_model = None
        self.rf_weight = 0.5
        self.feature_order = []
        self._load_models()

    def _load_models(self):
        """Lazy load or refresh model artifacts from disk."""
        self.rf_model, self.xgb_model, self.rf_weight, self.feature_order, _ = load_model_artifacts(self.models_root)

    def is_loaded(self) -> bool:
        """Check whether RF and XGBoost model artifacts are loaded."""
        return self.rf_model is not None and self.xgb_model is not None

    def predict(self, raw_features: dict) -> dict:
        """Process raw parameters, apply feature engineering, enforce feature order, and predict emissions.
        
        Args:
            raw_features (dict): Dictionary of raw operational parameters.
            
        Returns:
            dict: Model predictions for RF, XGBoost, and Ensemble.
        """
        if not self.rf_model or not self.xgb_model:
            self._load_models()

        # Convert dict to single-row DataFrame
        input_df = pd.DataFrame([raw_features])

        # Fill default timestamp if missing for time features
        if "timestamp" not in input_df.columns:
            input_df["timestamp"] = pd.Timestamp.now()
        else:
            input_df["timestamp"] = pd.to_datetime(input_df["timestamp"])

        if "id" not in input_df.columns:
            input_df["id"] = 1

        if "plant_id" not in input_df.columns:
            input_df["plant_id"] = 1

        # 1. Apply Phase 3 Feature Engineering
        engineered_df = engineer_features(input_df)

        # 2. Enforce Feature Ordering matching model_features.json
        missing_features = [col for col in self.feature_order if col not in engineered_df.columns]
        if missing_features:
            raise ValueError(f"Missing required model input features: {missing_features}")

        X_input = engineered_df[self.feature_order]

        # 3. Model Inference
        rf_pred = float(np.maximum(0.0, self.rf_model.predict(X_input)[0]))
        xgb_pred = float(np.maximum(0.0, self.xgb_model.predict(X_input)[0]))
        ens_pred = float(round(self.rf_weight * rf_pred + (1.0 - self.rf_weight) * xgb_pred, 2))

        rf_pred = float(round(rf_pred, 2))
        xgb_pred = float(round(xgb_pred, 2))

        return {
            "random_forest_prediction_kg": rf_pred,
            "xgboost_prediction_kg": xgb_pred,
            "ensemble_prediction_kg": ens_pred,
            "selected_model": "ensemble",
            "model_version": "ensemble_v1",
            "rf_weight_used": self.rf_weight,
        }


# Singleton PredictionService Instance
prediction_service = PredictionService()
