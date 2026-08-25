import os
import json
from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from scipy import stats

from app.config.monitoring import (
    PSI_LOW_THRESHOLD,
    PSI_MODERATE_THRESHOLD,
    PSI_EPSILON,
    KS_PVALUE_THRESHOLD,
    BASELINE_VERSION,
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "industrial_emissions_processed.csv")


class DriftDetector:
    """Statistical Data Drift detection engine implementing Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) test."""

    def __init__(self, baseline_csv_path: str = PROCESSED_DATA_PATH):
        self.baseline_csv_path = baseline_csv_path
        self.baseline_df = self._load_baseline()

    def _load_baseline(self) -> pd.DataFrame:
        """Load training baseline processed dataset."""
        if os.path.exists(self.baseline_csv_path):
            try:
                df = pd.read_csv(self.baseline_csv_path)
                return df
            except Exception:
                pass
        return pd.DataFrame()

    def calculate_psi(self, expected: np.ndarray, actual: np.ndarray, num_bins: int = 10) -> float:
        """Calculate Population Stability Index (PSI) with epsilon smoothing to handle zero bins safely.

        PSI = sum((Actual% - Expected%) * ln((Actual% + eps) / (Expected% + eps)))
        """
        expected = expected[~np.isnan(expected)]
        actual = actual[~np.isnan(actual)]

        if len(expected) == 0 or len(actual) == 0:
            return 0.0

        # Define quantile bins based on expected baseline
        quantiles = np.linspace(0, 100, num_bins + 1)
        bins = np.percentile(expected, quantiles)
        # Ensure unique bin edges
        bins = np.unique(bins)
        if len(bins) < 2:
            return 0.0

        # Adjust outer bounds to capture min/max
        bins[0] = min(bins[0], np.min(actual), np.min(expected)) - 1e-5
        bins[-1] = max(bins[-1], np.max(actual), np.max(expected)) + 1e-5

        expected_counts, _ = np.histogram(expected, bins=bins)
        actual_counts, _ = np.histogram(actual, bins=bins)

        expected_pct = expected_counts / len(expected)
        actual_pct = actual_counts / len(actual)

        # Apply Epsilon smoothing (1e-6) to prevent log division by zero
        eps = PSI_EPSILON
        expected_pct_smoothed = np.where(expected_pct == 0, eps, expected_pct)
        actual_pct_smoothed = np.where(actual_pct == 0, eps, actual_pct)

        psi_val = np.sum((actual_pct_smoothed - expected_pct_smoothed) * np.log(actual_pct_smoothed / expected_pct_smoothed))
        return float(round(max(0.0, psi_val), 4))

    def calculate_ks_test(self, expected: np.ndarray, actual: np.ndarray) -> Tuple[float, float]:
        """Perform Kolmogorov-Smirnov 2-sample test returning ks_statistic and p_value."""
        expected = expected[~np.isnan(expected)]
        actual = actual[~np.isnan(actual)]

        if len(expected) == 0 or len(actual) == 0:
            return 0.0, 1.0

        ks_res = stats.ks_2samp(expected, actual)
        return float(round(ks_res.statistic, 4)), float(round(ks_res.pvalue, 6))

    def classify_drift(self, psi: float) -> str:
        """Classify feature drift status using PSI primary threshold rules."""
        if psi < PSI_LOW_THRESHOLD:
            return "low"
        elif psi <= PSI_MODERATE_THRESHOLD:
            return "moderate"
        else:
            return "high"

    def evaluate_feature_drift(self, current_df: pd.DataFrame) -> Dict[str, Any]:
        """Evaluate feature-level data drift across all operational features comparing current dataset vs training baseline."""
        features_to_check = [
            "electricity_consumption_kwh",
            "diesel_consumption_liters",
            "natural_gas_consumption_m3",
            "production_quantity",
            "raw_material_consumption_kg",
            "machine_runtime_hours",
            "temperature_c",
            "pressure_bar",
            "previous_co2_emission_kg",
        ]

        if self.baseline_df.empty or current_df.empty:
            return {
                "overall_drift_status": "low",
                "baseline_version": BASELINE_VERSION,
                "features": [],
            }

        drift_results = []
        status_counts = {"low": 0, "moderate": 0, "high": 0}

        for feat in features_to_check:
            if feat in self.baseline_df.columns and feat in current_df.columns:
                exp_vals = self.baseline_df[feat].dropna().values
                act_vals = current_df[feat].dropna().values

                if len(exp_vals) > 0 and len(act_vals) > 0:
                    psi_val = self.calculate_psi(exp_vals, act_vals)
                    ks_stat, p_val = self.calculate_ks_test(exp_vals, act_vals)
                    status_str = self.classify_drift(psi_val)
                    status_counts[status_str] += 1

                    drift_results.append({
                        "feature": feat,
                        "psi": psi_val,
                        "ks_statistic": ks_stat,
                        "p_value": p_val,
                        "drift_status": status_str,
                        "statistically_significant": p_val < KS_PVALUE_THRESHOLD,
                    })

        # Overall Drift Status
        overall_status = "low"
        if status_counts["moderate"] > 0 or status_counts["high"] > 0:
            overall_status = "moderate"
        if status_counts["high"] >= 2 or (status_counts["high"] >= 1 and status_counts["moderate"] >= 3):
            overall_status = "high"

        return {
            "overall_drift_status": overall_status,
            "baseline_version": BASELINE_VERSION,
            "counts": status_counts,
            "features": drift_results,
        }


drift_detector = DriftDetector()
