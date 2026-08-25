import pandas as pd
import numpy as np
from typing import Tuple

TARGET_COLUMN = "actual_co2_emission_kg"
FORBIDDEN_LEAKAGE_FEATURES = [
    "actual_co2_emission_kg",
    "co2_change_from_previous",
]


def verify_no_target_leakage(X: pd.DataFrame) -> None:
    """Automated integrity check verifying target variable and target-derived features are NOT in X."""
    for forbidden in FORBIDDEN_LEAKAGE_FEATURES:
        if forbidden in X.columns:
            raise ValueError(
                f"[CRITICAL ML LEAKAGE ALERT] Target leakage detected! Forbidden feature '{forbidden}' present in feature matrix X."
            )


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create domain-specific derived features for industrial carbon emission modeling.
    
    Derived Features:
    - energy_intensity: electricity_consumption_kwh / production_quantity
    - fuel_intensity: diesel_consumption_liters / production_quantity
    - gas_intensity: natural_gas_consumption_m3 / production_quantity
    - raw_material_intensity: raw_material_consumption_kg / production_quantity
    - machine_utilization: machine_runtime_hours / 24.0
    - Temporal features: day, month, quarter, day_of_week
    """
    feat_df = df.copy()

    # Zero-division safe intensity features
    prod = feat_df["production_quantity"].replace(0, np.nan)

    feat_df["energy_intensity"] = feat_df["electricity_consumption_kwh"] / prod
    feat_df["fuel_intensity"] = feat_df["diesel_consumption_liters"] / prod
    feat_df["gas_intensity"] = feat_df["natural_gas_consumption_m3"] / prod
    feat_df["raw_material_intensity"] = feat_df["raw_material_consumption_kg"] / prod

    # Impute NaNs resulting from zero production with median
    intensity_cols = ["energy_intensity", "fuel_intensity", "gas_intensity", "raw_material_intensity"]
    for col in intensity_cols:
        col_median = feat_df[col].median()
        feat_df[col] = feat_df[col].fillna(col_median if pd.notna(col_median) else 0.0)

    # Machine utilization ratio (0 to 1)
    feat_df["machine_utilization"] = feat_df["machine_runtime_hours"] / 24.0

    # Temporal feature extraction
    if "timestamp" in feat_df.columns:
        ts = pd.to_datetime(feat_df["timestamp"])
        feat_df["day"] = ts.dt.day
        feat_df["month"] = ts.dt.month
        feat_df["quarter"] = ts.dt.quarter
        feat_df["day_of_week"] = ts.dt.dayofweek

    return feat_df


def prepare_feature_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Separate input features X from target variable y with strict target leakage validation."""
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' not found in DataFrame.")

    y = df[TARGET_COLUMN].copy()
    if isinstance(y, pd.DataFrame):
        y = y.iloc[:, -1]

    # Drop non-feature identifiers and target-related columns
    drop_cols = ["id", "timestamp", TARGET_COLUMN]
    if "co2_change_from_previous" in df.columns:
        drop_cols.append("co2_change_from_previous")

    X = df.drop(columns=[col for col in drop_cols if col in df.columns]).copy()

    # Strict automated target leakage check
    verify_no_target_leakage(X)

    return X, y
