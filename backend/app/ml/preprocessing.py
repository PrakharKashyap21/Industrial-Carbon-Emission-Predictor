import pandas as pd
import numpy as np
from app.ml.validation import NON_NEGATIVE_COLUMNS

TARGET_COLUMN = "actual_co2_emission_kg"


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean dataset by handling duplicates, physical constraint violations, and missing values.
    
    Rules:
    1. Remove exact duplicate rows.
    2. Handle composite (plant_id, timestamp) duplicates by keeping the last valid record.
    3. Exclude rows where actual_co2_emission_kg is missing (Target cannot be imputed).
    4. Replace negative physical values and invalid runtime (> 24) with NaN.
    5. Impute missing numerical features using plant-aware median, falling back to global median.
    """
    cleaned_df = df.copy()

    # 1. Drop exact duplicate rows
    cleaned_df = cleaned_df.drop_duplicates()

    # 2. Drop composite duplicates (plant_id, timestamp), keeping last
    if "plant_id" in cleaned_df.columns and "timestamp" in cleaned_df.columns:
        cleaned_df = cleaned_df.drop_duplicates(subset=["plant_id", "timestamp"], keep="last")

    # 3. Exclude missing target rows
    if TARGET_COLUMN in cleaned_df.columns:
        initial_count = len(cleaned_df)
        cleaned_df = cleaned_df.dropna(subset=[TARGET_COLUMN])
        dropped_target_count = initial_count - len(cleaned_df)
        if dropped_target_count > 0:
            print(f"[Preprocessing] Dropped {dropped_target_count} rows with missing target '{TARGET_COLUMN}'.")

    # 4. Correct invalid non-negative & runtime values to NaN for imputation
    for col in NON_NEGATIVE_COLUMNS:
        if col in cleaned_df.columns and col != TARGET_COLUMN:
            cleaned_df.loc[cleaned_df[col] < 0, col] = np.nan

    if "machine_runtime_hours" in cleaned_df.columns:
        cleaned_df.loc[cleaned_df["machine_runtime_hours"] > 24.0, "machine_runtime_hours"] = np.nan

    # 5. Plant-aware median imputation for numerical features
    num_cols = cleaned_df.select_dtypes(include=[np.number]).columns
    feature_cols = [c for c in num_cols if c not in ["id", "plant_id", TARGET_COLUMN]]

    for col in feature_cols:
        if cleaned_df[col].isna().sum() > 0:
            # Try plant-level median first
            cleaned_df[col] = cleaned_df.groupby("plant_id")[col].transform(lambda x: x.fillna(x.median()))
            # Fallback to global median for any remaining NaNs
            if cleaned_df[col].isna().sum() > 0:
                global_median = cleaned_df[col].median()
                cleaned_df[col] = cleaned_df[col].fillna(global_median)

    return cleaned_df
