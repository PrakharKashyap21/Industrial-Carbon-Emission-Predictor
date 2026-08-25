import os
import pandas as pd

from app.ml.data_loader import load_raw_data
from app.ml.validation import generate_quality_report, check_value_constraints, check_duplicates
from app.ml.preprocessing import clean_data
from app.ml.feature_engineering import engineer_features, prepare_feature_target
from app.ml.split import chronological_split

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RAW_DATA_PATH = os.path.join(BASE_DIR, "data", "raw", "industrial_emissions_raw.csv")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")


def run_pipeline(raw_path: str = RAW_DATA_PATH, output_dir: str = PROCESSED_DIR) -> dict:
    """Execute complete end-to-end data preprocessing pipeline."""
    os.makedirs(output_dir, exist_ok=True)

    # 1. Load Raw Data
    df_raw = load_raw_data(raw_path)
    orig_rows = len(df_raw)

    # 2. Validation & Diagnostic Report
    dups_info = check_duplicates(df_raw)
    constraints_info = check_value_constraints(df_raw)
    quality_report = generate_quality_report(df_raw)

    # 3. Data Cleaning
    df_cleaned = clean_data(df_raw)
    cleaned_rows = len(df_cleaned)

    # 4. Feature Engineering
    df_engineered = engineer_features(df_cleaned)

    # 5. Feature/Target Separation & Target Leakage Assertion Check
    X, y = prepare_feature_target(df_engineered)

    # 6. Chronological Train/Val/Test Split (70/15/15)
    X_train, X_val, X_test, y_train, y_val, y_test = chronological_split(df_engineered, X, y)

    # 7. Export Processed Datasets
    df_engineered.to_csv(os.path.join(output_dir, "industrial_emissions_processed.csv"), index=False)
    X_train.to_csv(os.path.join(output_dir, "X_train.csv"), index=False)
    X_val.to_csv(os.path.join(output_dir, "X_validation.csv"), index=False)
    X_test.to_csv(os.path.join(output_dir, "X_test.csv"), index=False)

    pd.DataFrame(y_train).to_csv(os.path.join(output_dir, "y_train.csv"), index=False)
    pd.DataFrame(y_val).to_csv(os.path.join(output_dir, "y_validation.csv"), index=False)
    pd.DataFrame(y_test).to_csv(os.path.join(output_dir, "y_test.csv"), index=False)

    summary = {
        "original_rows": orig_rows,
        "cleaned_rows": cleaned_rows,
        "train_rows": len(X_train),
        "val_rows": len(X_val),
        "test_rows": len(X_test),
        "feature_count": X.shape[1],
        "feature_names": list(X.columns),
        "exact_duplicates_removed": dups_info["exact_duplicates"],
        "composite_duplicates_removed": dups_info["composite_duplicates"],
        "output_dir": output_dir,
    }

    print("\n=================================")
    print("DATA PREPROCESSING SUMMARY")
    print("=================================")
    print(f"Original rows:       {orig_rows}")
    print(f"Cleaned rows:        {cleaned_rows}")
    print(f"Training rows:       {len(X_train)}")
    print(f"Validation rows:     {len(X_val)}")
    print(f"Test rows:           {len(X_test)}")
    print(f"Features count:      {X.shape[1]}")
    print(f"Target variable:     actual_co2_emission_kg")
    print(f"Duplicates removed:  {dups_info['exact_duplicates'] + dups_info['composite_duplicates']}")
    print("Leakage Status:      PASS (Target isolated)")
    print(f"Export directory:    {output_dir}")
    print("Processing complete.")
    print("=================================\n")

    return summary


if __name__ == "__main__":
    run_pipeline()
