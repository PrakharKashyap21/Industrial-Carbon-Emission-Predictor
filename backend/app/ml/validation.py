import pandas as pd
import numpy as np
from typing import Dict, Any

NON_NEGATIVE_COLUMNS = [
    "electricity_consumption_kwh",
    "diesel_consumption_liters",
    "natural_gas_consumption_m3",
    "production_quantity",
    "raw_material_consumption_kg",
    "machine_runtime_hours",
    "pressure_bar",
    "previous_co2_emission_kg",
    "actual_co2_emission_kg",
]


def generate_quality_report(df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    """Generate summary data quality metrics for numerical features."""
    report = {}
    numerical_cols = df.select_dtypes(include=[np.number]).columns

    for col in numerical_cols:
        col_data = df[col].dropna()
        report[col] = {
            "dtype": str(df[col].dtype),
            "missing_count": int(df[col].isna().sum()),
            "missing_pct": float(round((df[col].isna().sum() / len(df)) * 100, 2)),
            "unique_values": int(df[col].nunique()),
            "min": float(col_data.min()) if len(col_data) > 0 else None,
            "max": float(col_data.max()) if len(col_data) > 0 else None,
            "mean": float(round(col_data.mean(), 2)) if len(col_data) > 0 else None,
            "median": float(round(col_data.median(), 2)) if len(col_data) > 0 else None,
        }
    return report


def check_value_constraints(df: pd.DataFrame) -> Dict[str, Any]:
    """Validate physical constraints (non-negative values and runtime limits)."""
    violations = {
        "negative_values": {},
        "invalid_runtime_count": 0,
    }

    for col in NON_NEGATIVE_COLUMNS:
        if col in df.columns:
            neg_count = int((df[col] < 0).sum())
            if neg_count > 0:
                violations["negative_values"][col] = neg_count

    if "machine_runtime_hours" in df.columns:
        invalid_runtime = ((df["machine_runtime_hours"] < 0) | (df["machine_runtime_hours"] > 24)).sum()
        violations["invalid_runtime_count"] = int(invalid_runtime)

    return violations


def check_duplicates(df: pd.DataFrame) -> Dict[str, int]:
    """Detect exact row duplicates and composite (plant_id, timestamp) duplicates."""
    exact_dups = int(df.duplicated().sum())

    composite_dups = 0
    if "plant_id" in df.columns and "timestamp" in df.columns:
        composite_dups = int(df.duplicated(subset=["plant_id", "timestamp"]).sum())

    return {
        "exact_duplicates": exact_dups,
        "composite_duplicates": composite_dups,
    }


def detect_outliers_iqr(df: pd.DataFrame, column: str) -> Dict[str, Any]:
    """Analyze outliers for a column using the Interquartile Range (IQR) method."""
    if column not in df.columns or not np.issubdtype(df[column].dtype, np.number):
        return {}

    q1 = float(df[column].quantile(0.25))
    q3 = float(df[column].quantile(0.75))
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]

    return {
        "column": column,
        "q1": q1,
        "q3": q3,
        "iqr": iqr,
        "lower_bound": lower_bound,
        "upper_bound": upper_bound,
        "outlier_count": len(outliers),
        "outlier_pct": float(round((len(outliers) / len(df)) * 100, 2)),
    }
