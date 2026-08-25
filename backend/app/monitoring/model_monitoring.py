from typing import List, Dict, Any
from app.analytics.prediction_analytics import compute_prediction_error_metrics
from app.config.monitoring import (
    TEST_BASELINE_MAE,
    TEST_BASELINE_RMSE,
    TEST_BASELINE_MAPE,
    TEST_BASELINE_R2,
    MODEL_DEGRADATION_WARNING_PERCENT,
    MODEL_DEGRADATION_CRITICAL_PERCENT,
)


class ModelPerformanceMonitor:
    """Model Performance Monitoring service evaluating operational error degradation against test set baseline."""

    def evaluate_performance(self, predictions: List[Any]) -> Dict[str, Any]:
        """Compute operational MAE, RMSE, MAPE, Bias, and evaluate degradation against baseline."""
        evaluated = [p for p in predictions if p.status == "evaluated" and p.actual_co2 is not None]

        baseline = {
            "version": "ensemble_v1",
            "baseline_mae": TEST_BASELINE_MAE,
            "baseline_rmse": TEST_BASELINE_RMSE,
            "baseline_mape": TEST_BASELINE_MAPE,
            "baseline_r2": TEST_BASELINE_R2,
        }

        if not evaluated:
            return {
                "overall_performance_status": "stable",
                "evaluated_count": 0,
                "current_mae": None,
                "current_rmse": None,
                "current_mape": None,
                "current_r2": None,
                "mean_bias": None,
                "degradation_pct": 0.0,
                "baseline": baseline,
            }

        metrics = compute_prediction_error_metrics(evaluated)
        current_mae = metrics["mae"]

        degradation_pct = 0.0
        if current_mae is not None and TEST_BASELINE_MAE > 0:
            degradation_pct = round(((current_mae - TEST_BASELINE_MAE) / TEST_BASELINE_MAE) * 100.0, 2)

        # Performance Status
        status = "stable"
        if degradation_pct >= MODEL_DEGRADATION_WARNING_PERCENT:
            status = "warning"
        if degradation_pct >= MODEL_DEGRADATION_CRITICAL_PERCENT:
            status = "degraded"

        return {
            "overall_performance_status": status,
            "evaluated_count": len(evaluated),
            "current_mae": current_mae,
            "current_rmse": metrics["rmse"],
            "current_mape": metrics["mape"],
            "current_r2": metrics["r2"],
            "mean_bias": metrics["mean_bias"],
            "degradation_pct": degradation_pct,
            "baseline": baseline,
        }


model_performance_monitor = ModelPerformanceMonitor()
