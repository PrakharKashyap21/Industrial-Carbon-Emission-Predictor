import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def safe_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Absolute Percentage Error safely handling zero target values."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    non_zero_mask = y_true != 0
    if not np.any(non_zero_mask):
        return 0.0

    mape = np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100.0
    return float(round(mape, 2))


def evaluate_regression_metrics(y_true: pd.Series | np.ndarray, y_pred: pd.Series | np.ndarray) -> Dict[str, float]:
    """Calculate standard regression evaluation metrics: MAE, RMSE, R², MAPE."""
    y_t = np.array(y_true).ravel()
    y_p = np.array(y_pred).ravel()

    mae = float(round(mean_absolute_error(y_t, y_p), 2))
    mse = float(mean_squared_error(y_t, y_p))
    rmse = float(round(np.sqrt(mse), 2))
    r2 = float(round(r2_score(y_t, y_p), 4))
    mape = safe_mape(y_t, y_p)

    return {
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "mape": mape,
    }
