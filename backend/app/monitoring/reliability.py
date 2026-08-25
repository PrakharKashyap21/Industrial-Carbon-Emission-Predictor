from typing import Dict, Any, List
from app.monitoring.data_quality import data_quality_monitor


class PredictionReliabilityEngine:
    """Explainable Prediction Reliability Assessment Engine classifying predictions into HIGH, MEDIUM, or LOW with explicit human-readable reason strings."""

    def evaluate_single_prediction_reliability(
        self,
        raw_features: Dict[str, Any],
        drift_summary: Dict[str, Any] = None,
        performance_summary: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Assess reliability for an individual prediction request based on range bounds, quality, drift, and performance."""
        reasons = []

        # 1. Single Record Data Quality & Range Check
        dq_res = data_quality_monitor.validate_single_record(raw_features)

        if dq_res["invalid_features"]:
            for inv in dq_res["invalid_features"]:
                reasons.append(f"Invalid input parameter: {inv}")

        if dq_res["out_of_range_features"]:
            for oor in dq_res["out_of_range_features"]:
                reasons.append(f"Out-of-training-range input: {oor}")

        # 2. Data Drift Evaluation
        if drift_summary and drift_summary.get("features"):
            for f_drift in drift_summary["features"]:
                f_name = f_drift["feature"]
                if f_name in raw_features:
                    status = f_drift.get("drift_status")
                    if status == "high":
                        reasons.append(f"Feature '{f_name}' shows significant distribution drift (PSI = {f_drift['psi']})")
                    elif status == "moderate":
                        reasons.append(f"Feature '{f_name}' shows moderate distribution drift (PSI = {f_drift['psi']})")

        # 3. Model Performance Degradation Evaluation
        if performance_summary and performance_summary.get("overall_performance_status") == "degraded":
            deg_pct = performance_summary.get("degradation_pct", 0.0)
            reasons.append(f"Operational model performance degraded (+{deg_pct}% MAE above baseline)")

        # 4. Determine Reliability Status
        reliability = "HIGH"

        if dq_res["out_of_range_features"] or any("moderate" in r for r in reasons) or any("warning" in r for r in reasons):
            reliability = "MEDIUM"

        if dq_res["invalid_features"] or any("significant" in r for r in reasons) or any("degraded" in r for r in reasons) or len(reasons) >= 3:
            reliability = "LOW"

        if not reasons:
            reasons.append("Inputs are within historical training distribution; operational performance is stable.")

        return {
            "reliability_status": reliability,
            "reliability_reasons": reasons,
            "out_of_range_count": len(dq_res["out_of_range_features"]),
        }

    def evaluate_overall_system_reliability(
        self,
        dq_summary: Dict[str, Any],
        drift_summary: Dict[str, Any],
        perf_summary: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Assess overall system prediction reliability across recent records."""
        reasons = []

        # Data Quality check
        dq_status = dq_summary.get("quality_status", "good")
        if dq_status == "warning":
            reasons.append(f"Data quality warning: {dq_summary.get('missing_rate_pct', 0)}% missing values detected")
        elif dq_status == "critical":
            reasons.append(f"Critical data quality issues: {dq_summary.get('invalid_records', 0)} invalid records detected")

        # Data Drift check
        drift_status = drift_summary.get("overall_drift_status", "low")
        if drift_status == "moderate":
            reasons.append("Moderate distribution drift detected across input features")
        elif drift_status == "high":
            reasons.append("Significant feature drift detected; production data distribution has shifted")

        # Performance check
        perf_status = perf_summary.get("overall_performance_status", "stable")
        if perf_status == "warning":
            reasons.append(f"Model performance warning (+{perf_summary.get('degradation_pct', 0)}% MAE increase)")
        elif perf_status == "degraded":
            reasons.append(f"Model performance degraded (+{perf_summary.get('degradation_pct', 0)}% MAE increase)")

        reliability = "HIGH"
        if dq_status == "warning" or drift_status == "moderate" or perf_status == "warning":
            reliability = "MEDIUM"
        if dq_status == "critical" or drift_status == "high" or perf_status == "degraded":
            reliability = "LOW"

        if not reasons:
            reasons.append("All monitoring metrics are within normal operational bounds.")

        return {
            "overall_reliability": reliability,
            "reasons": reasons,
        }


reliability_engine = PredictionReliabilityEngine()
