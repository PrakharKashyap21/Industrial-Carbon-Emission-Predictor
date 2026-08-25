import pandas as pd
from typing import Tuple


def chronological_split(
    df: pd.DataFrame,
    X: pd.DataFrame,
    y: pd.Series,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """Perform chronological train / validation / test split based on temporal sequence.
    
    Args:
        df (pd.DataFrame): DataFrame containing 'timestamp' for temporal sorting.
        X (pd.DataFrame): Feature matrix.
        y (pd.Series): Target series.
        train_ratio (float): Fraction of data for training (default 0.70).
        val_ratio (float): Fraction of data for validation (default 0.15).
        test_ratio (float): Fraction of data for testing (default 0.15).
        
    Returns:
        Tuple: (X_train, X_val, X_test, y_train, y_val, y_test)
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-5, "Ratios must sum to 1.0"

    # Sort indices chronologically by timestamp
    if "timestamp" in df.columns:
        sorted_indices = df.sort_values("timestamp").index
    else:
        sorted_indices = df.index

    X_sorted = X.loc[sorted_indices].reset_index(drop=True)
    y_sorted = y.loc[sorted_indices].reset_index(drop=True)

    n_total = len(X_sorted)
    n_train = int(n_total * train_ratio)
    n_val = int(n_total * val_ratio)

    X_train = X_sorted.iloc[:n_train]
    y_train = y_sorted.iloc[:n_train]

    X_val = X_sorted.iloc[n_train: n_train + n_val]
    y_val = y_sorted.iloc[n_train: n_train + n_val]

    X_test = X_sorted.iloc[n_train + n_val:]
    y_test = y_sorted.iloc[n_train + n_val:]

    print("=================================")
    print("Chronological Dataset Split")
    print(f"Total Samples:      {n_total}")
    print(f"Training Set (70%):   {len(X_train)} samples")
    print(f"Validation Set (15%): {len(X_val)} samples")
    print(f"Testing Set (15%):    {len(X_test)} samples")
    print("=================================")

    return X_train, X_val, X_test, y_train, y_val, y_test
