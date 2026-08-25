"""Configuration settings for Phase 9 Model Monitoring, Data Drift, and Prediction Reliability."""

# Drift Detection Thresholds (Population Stability Index)
PSI_LOW_THRESHOLD = 0.10
PSI_MODERATE_THRESHOLD = 0.25
PSI_EPSILON = 1e-6  # Zero bin smoothing to prevent log division error

# Kolmogorov-Smirnov Statistical Threshold
KS_PVALUE_THRESHOLD = 0.05

# Model Degradation Thresholds (Percentage increase over baseline MAE)
MODEL_DEGRADATION_WARNING_PERCENT = 30.0
MODEL_DEGRADATION_CRITICAL_PERCENT = 50.0

# Baseline Reference Metadata
BASELINE_VERSION = "training_baseline_v1"
TEST_BASELINE_MAE = 226.35  # Phase 4 Test Set MAE (kg CO2)
TEST_BASELINE_RMSE = 307.94  # Phase 4 Test Set RMSE (kg CO2)
TEST_BASELINE_MAPE = 3.08  # Phase 4 Test Set MAPE (%)
TEST_BASELINE_R2 = 0.998  # Phase 4 Test Set R2
