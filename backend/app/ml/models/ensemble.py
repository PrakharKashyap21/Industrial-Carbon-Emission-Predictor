import numpy as np
import pandas as pd
from typing import Tuple
from sklearn.metrics import mean_squared_error


def predict_ensemble(rf_preds: np.ndarray, xgb_preds: np.ndarray, rf_weight: float) -> np.ndarray:
    """Calculate weighted ensemble prediction: w * RF + (1-w) * XGB."""
    rf_preds = np.array(rf_preds)
    xgb_preds = np.array(xgb_preds)
    return rf_weight * rf_preds + (1.0 - rf_weight) * xgb_preds


def optimize_ensemble_weights(
    y_val: pd.Series | np.ndarray,
    rf_val_preds: np.ndarray,
    xgb_val_preds: np.ndarray,
) -> Tuple[float, float]:
    """Optimize ensemble weight w on Validation data to minimize RMSE.
    
    Returns:
        Tuple[float, float]: (best_rf_weight, best_val_rmse)
    """
    y_v = np.array(y_val).ravel()
    best_weight = 0.5
    best_rmse = float("inf")

    # Grid search over weights w in [0.0, 1.0] with step 0.05
    for w in np.linspace(0.0, 1.0, 21):
        ens_preds = predict_ensemble(rf_val_preds, xgb_val_preds, w)
        rmse = np.sqrt(mean_squared_error(y_v, ens_preds))
        if rmse < best_rmse:
            best_rmse = rmse
            best_weight = float(round(w, 2))

    print(f"[Ensemble Optimization] Best RF Weight w: {best_weight:.2f} (Val RMSE: {best_rmse:.2f})")
    return best_weight, float(round(best_rmse, 2))
