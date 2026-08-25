from typing import List, Dict, Any, Optional
import numpy as np


def compute_prediction_error_metrics(predictions: List[Any]) -> Dict[str, Any]:
    """Calculate operational MAE, RMSE, MAPE, R², and Mean Bias across evaluated predictions."""
    evaluated = [p for p in predictions if p.actual_co2 is not None]

    if not evaluated:
        return {
            "total_evaluated": 0,
            "mae": None,
            "rmse": None,
            "mape": None,
            "r2": None,
            "mean_bias": None,
            "model_comparison": [],
        }

    actuals = np.array([p.actual_co2 for p in evaluated], dtype=float)
    ens_preds = np.array([p.ensemble_prediction for p in evaluated], dtype=float)
    rf_preds = np.array([p.rf_prediction for p in evaluated], dtype=float)
    xgb_preds = np.array([p.xgb_prediction for p in evaluated], dtype=float)

    def calc_metrics(act, pred):
        errors = pred - act
        abs_errors = np.abs(errors)
        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))

        # Safe MAPE calculation for non-zero actuals
        nonzero_mask = act != 0
        mape = float(np.mean(abs_errors[nonzero_mask] / np.abs(act[nonzero_mask])) * 100.0) if np.any(nonzero_mask) else None

        # R2 calculation
        ss_res = np.sum((act - pred) ** 2)
        ss_tot = np.sum((act - np.mean(act)) ** 2)
        r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot != 0 else 1.0

        mean_bias = float(np.mean(errors))

        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2) if mape is not None else None,
            "r2": round(r2, 4),
            "mean_bias": round(mean_bias, 2),
        }

    ens_metrics = calc_metrics(actuals, ens_preds)
    rf_metrics = calc_metrics(actuals, rf_preds)
    xgb_metrics = calc_metrics(actuals, xgb_preds)

    model_comparison = [
        {"model": "Random Forest", "version": "rf_v1", **rf_metrics},
        {"model": "XGBoost", "version": "xgb_v1", **xgb_metrics},
        {"model": "Weighted Ensemble", "version": "ensemble_v1", "is_active": True, **ens_metrics},
    ]

    return {
        "total_evaluated": len(evaluated),
        "mae": ens_metrics["mae"],
        "rmse": ens_metrics["rmse"],
        "mape": ens_metrics["mape"],
        "r2": ens_metrics["r2"],
        "mean_bias": ens_metrics["mean_bias"],
        "model_comparison": model_comparison,
    }


def compute_prediction_scatter_points(predictions: List[Any]) -> List[Dict[str, Any]]:
    """Format actual vs predicted scatter points for visual model agreement analysis."""
    points = []
    for p in predictions:
        if p.actual_co2 is not None:
            points.append({
                "id": p.id,
                "timestamp": p.prediction_timestamp.strftime("%Y-%m-%d"),
                "actual_co2": round(p.actual_co2, 2),
                "ensemble_prediction": round(p.ensemble_prediction, 2),
                "absolute_error": round(p.absolute_error, 2) if p.absolute_error is not None else 0.0,
            })
    return points
