import os
import pytest
import pandas as pd
import numpy as np

from app.ml.data_loader import load_raw_data, REQUIRED_COLUMNS
from app.ml.validation import check_value_constraints, check_duplicates
from app.ml.preprocessing import clean_data
from app.ml.feature_engineering import engineer_features, prepare_feature_target
from app.ml.split import chronological_split

RAW_DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "raw", "industrial_emissions_raw.csv"
)


# Test 1: Required columns exist
def test_1_required_columns_exist():
    """Test 1: Verify all 13 required schema columns exist in raw dataset."""
    df = load_raw_data(RAW_DATA_PATH)
    for col in REQUIRED_COLUMNS:
        assert col in df.columns, f"Missing required column: {col}"


# Test 2: Numerical fields are valid
def test_2_numerical_fields_valid():
    """Test 2: Verify numerical fields parse as numeric types."""
    df = load_raw_data(RAW_DATA_PATH)
    num_cols = [
        "electricity_consumption_kwh", "diesel_consumption_liters",
        "natural_gas_consumption_m3", "production_quantity",
        "raw_material_consumption_kg", "machine_runtime_hours",
        "temperature_c", "pressure_bar", "previous_co2_emission_kg",
        "actual_co2_emission_kg"
    ]
    for col in num_cols:
        assert np.issubdtype(df[col].dtype, np.number), f"Column {col} is not numeric."


# Test 3: Negative physical values are detected
def test_3_negative_physical_values_detected():
    """Test 3: Verify check_value_constraints detects negative physical values."""
    df = load_raw_data(RAW_DATA_PATH).copy()
    df.loc[0, "electricity_consumption_kwh"] = -150.0
    violations = check_value_constraints(df)
    assert "electricity_consumption_kwh" in violations["negative_values"]
    assert violations["negative_values"]["electricity_consumption_kwh"] == 1


# Test 4: Machine runtime > 24 is detected
def test_4_machine_runtime_over_24_detected():
    """Test 4: Verify check_value_constraints detects machine runtime > 24 hours."""
    df = load_raw_data(RAW_DATA_PATH).copy()
    df.loc[0, "machine_runtime_hours"] = 28.5
    violations = check_value_constraints(df)
    assert violations["invalid_runtime_count"] == 1


# Test 5: Duplicate records are detected
def test_5_duplicate_records_detected():
    """Test 5: Verify check_duplicates identifies duplicate records."""
    df = load_raw_data(RAW_DATA_PATH).copy()
    # Duplicate row 0
    df = pd.concat([df, df.iloc[[0]]], ignore_index=True)
    dups = check_duplicates(df)
    assert dups["exact_duplicates"] >= 1
    assert dups["composite_duplicates"] >= 1


# Test 6: Missing target values are handled correctly (dropped)
def test_6_missing_target_handled_correctly():
    """Test 6: Verify rows with missing target actual_co2_emission_kg are dropped, not imputed."""
    df = load_raw_data(RAW_DATA_PATH).copy()
    df.loc[0, "actual_co2_emission_kg"] = np.nan
    cleaned = clean_data(df)
    assert len(cleaned) == len(df) - 1
    assert cleaned["actual_co2_emission_kg"].isna().sum() == 0


# Test 7: Intensity calculations do not divide by zero
def test_7_intensity_zero_division_safety():
    """Test 7: Verify zero production quantity does not produce Inf or division errors."""
    df = load_raw_data(RAW_DATA_PATH).copy()
    df.loc[0, "production_quantity"] = 0.0
    feat_df = engineer_features(df)
    assert not np.isinf(feat_df["energy_intensity"]).any()
    assert not np.isinf(feat_df["fuel_intensity"]).any()
    assert not feat_df["energy_intensity"].isna().any()


# Test 8: Target actual_co2_emission_kg is NOT present in X
def test_8_target_not_in_features():
    """Test 8: Verify actual_co2_emission_kg is strictly excluded from feature matrix X."""
    df = load_raw_data(RAW_DATA_PATH)
    feat_df = engineer_features(clean_data(df))
    X, y = prepare_feature_target(feat_df)
    assert "actual_co2_emission_kg" not in X.columns
    assert "actual_co2_emission_kg" == y.name


# Test 9: Target-derived features are NOT present in X
def test_9_target_derived_features_not_in_features():
    """Test 9: Verify target-derived features (co2_change_from_previous) are excluded from X."""
    df = load_raw_data(RAW_DATA_PATH).copy()
    df["co2_change_from_previous"] = df["actual_co2_emission_kg"] - df["previous_co2_emission_kg"]
    feat_df = engineer_features(df)
    X, y = prepare_feature_target(feat_df)
    assert "co2_change_from_previous" not in X.columns
    assert "actual_co2_emission_kg" not in X.columns

    # Test automated leakage exception assertion
    from app.ml.feature_engineering import verify_no_target_leakage
    X_leaked = X.copy()
    X_leaked["co2_change_from_previous"] = 15.0
    with pytest.raises(ValueError, match="Target leakage"):
        verify_no_target_leakage(X_leaked)



# Test 10: Train / Validation / Test sets do not overlap
def test_10_train_val_test_no_overlap():
    """Test 10: Verify train, validation, and test subsets do not overlap."""
    df = load_raw_data(RAW_DATA_PATH)
    feat_df = engineer_features(clean_data(df))
    X, y = prepare_feature_target(feat_df)
    X_train, X_val, X_test, y_train, y_val, y_test = chronological_split(feat_df, X, y)

    assert len(X_train) + len(X_val) + len(X_test) == len(X)
    assert len(y_train) + len(y_val) + len(y_test) == len(y)


# Test 11: Chronological ordering is preserved
def test_11_chronological_ordering_preserved():
    """Test 11: Verify chronological ordering sequence is preserved in train/val/test splits."""
    df = load_raw_data(RAW_DATA_PATH)
    feat_df = engineer_features(clean_data(df))
    X, y = prepare_feature_target(feat_df)
    X_train, X_val, X_test, y_train, y_val, y_test = chronological_split(feat_df, X, y)

    # Check timestamps sequence
    sorted_df = feat_df.sort_values("timestamp").reset_index(drop=True)
    n_train = len(X_train)
    n_val = len(X_val)

    train_max_ts = sorted_df.iloc[:n_train]["timestamp"].max()
    val_min_ts = sorted_df.iloc[n_train: n_train + n_val]["timestamp"].min()
    val_max_ts = sorted_df.iloc[n_train: n_train + n_val]["timestamp"].max()
    test_min_ts = sorted_df.iloc[n_train + n_val:]["timestamp"].min()

    assert train_max_ts <= val_min_ts, "Train set max timestamp exceeds Validation set min timestamp."
    assert val_max_ts <= test_min_ts, "Validation set max timestamp exceeds Test set min timestamp."
