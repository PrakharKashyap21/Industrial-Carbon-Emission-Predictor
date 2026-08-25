import os
import json
import joblib
from typing import Dict, Any, Tuple
import pandas as pd
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
MODELS_ROOT = os.path.join(BASE_DIR, "models")


def save_model_artifacts(
    rf_model: RandomForestRegressor,
    xgb_model: XGBRegressor,
    rf_weight: float,
    feature_list: list,
    rf_metadata: dict,
    xgb_metadata: dict,
    ens_metadata: dict,
    models_dir: str = MODELS_ROOT,
):
    """Save Random Forest, XGBoost, Ensemble metadata, and training feature order."""
    rf_dir = os.path.join(models_dir, "random_forest")
    xgb_dir = os.path.join(models_dir, "xgboost")
    ens_dir = os.path.join(models_dir, "ensemble")

    os.makedirs(rf_dir, exist_ok=True)
    os.makedirs(xgb_dir, exist_ok=True)
    os.makedirs(ens_dir, exist_ok=True)

    # 1. Save Random Forest
    joblib.dump(rf_model, os.path.join(rf_dir, "model.joblib"))
    with open(os.path.join(rf_dir, "metadata.json"), "w") as f:
        json.dump(rf_metadata, f, indent=2)

    # 2. Save XGBoost
    xgb_model.save_model(os.path.join(xgb_dir, "model.json"))
    with open(os.path.join(xgb_dir, "metadata.json"), "w") as f:
        json.dump(xgb_metadata, f, indent=2)

    # 3. Save Ensemble Metadata
    ens_metadata["rf_weight"] = rf_weight
    ens_metadata["xgb_weight"] = round(1.0 - rf_weight, 2)
    with open(os.path.join(ens_dir, "metadata.json"), "w") as f:
        json.dump(ens_metadata, f, indent=2)

    # 4. Save Feature Order List
    with open(os.path.join(models_dir, "model_features.json"), "w") as f:
        json.dump(feature_list, f, indent=2)

    print(f"[Model Serialization] Successfully saved model artifacts and feature list to {models_dir}")


def load_model_artifacts(models_dir: str = MODELS_ROOT) -> Tuple[RandomForestRegressor, XGBRegressor, float, list, dict]:
    """Load Random Forest, XGBoost, Ensemble weight, feature list, and metadata with fallback support."""
    candidate_dirs = [
        models_dir,
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "models")),
        os.path.abspath("models"),
        os.path.abspath("../models"),
    ]

    target_dir = None
    for d in candidate_dirs:
        rf_p = os.path.join(d, "random_forest", "model.joblib")
        xgb_p = os.path.join(d, "xgboost", "model.json")
        if os.path.exists(rf_p) and os.path.exists(xgb_p):
            target_dir = d
            break

    if target_dir:
        rf_path = os.path.join(target_dir, "random_forest", "model.joblib")
        xgb_path = os.path.join(target_dir, "xgboost", "model.json")
        ens_meta_path = os.path.join(target_dir, "ensemble", "metadata.json")
        feat_path = os.path.join(target_dir, "model_features.json")

        rf_model = joblib.load(rf_path)
        xgb_model = XGBRegressor()
        xgb_model.load_model(xgb_path)

        rf_weight = 0.5
        if os.path.exists(ens_meta_path):
            with open(ens_meta_path, "r") as f:
                ens_meta = json.load(f)
                rf_weight = float(ens_meta.get("rf_weight", 0.5))

        feature_list = []
        if os.path.exists(feat_path):
            with open(feat_path, "r") as f:
                feature_list = json.load(f)

        print(f"[Model Loader] Successfully loaded pretrained models from {target_dir}")
        return rf_model, xgb_model, rf_weight, feature_list, {}

    print(f"[Model Loader Warning] Model artifacts missing in {models_dir}. Initializing fallback ML models.")
    # Fallback model initialization
    default_features = [
        "electricity_consumption_kwh", "diesel_consumption_liters", "natural_gas_consumption_m3",
        "machine_runtime_hours", "production_quantity", "raw_material_input_tons", "ambient_temperature_c"
    ]
    import numpy as np
    X_dummy = np.random.rand(20, len(default_features)) * 100
    y_dummy = X_dummy[:, 0] * 0.85 + X_dummy[:, 1] * 2.68 + X_dummy[:, 2] * 1.9

    rf_model = RandomForestRegressor(n_estimators=10, random_state=42)
    rf_model.fit(X_dummy, y_dummy)

    xgb_model = XGBRegressor(n_estimators=10, random_state=42)
    xgb_model.fit(X_dummy, y_dummy)

    return rf_model, xgb_model, 0.5, default_features, {}
