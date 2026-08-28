# Empirical Research Results — Industrial $CO_2$ Prediction

## Overview
This document records the empirical results obtained on the held-out test dataset (`X_test.csv`, `y_test.csv`).

---

## Performance Summary

| Model | MAE ($kg CO_2$) | RMSE ($kg CO_2$) | $R^2$ Score | MAPE (%) |
|---|---|---|---|---|
| **Random Forest** | 220.18 | 277.73 | 0.9984 | 2.87% |
| **XGBoost** | 300.42 | 439.86 | 0.9960 | 3.00% |
| **RF + XGB Weighted Ensemble** | **225.46** | **307.94** | **0.9980** | **2.61%** |

---

## Statistical Analysis
- The ensemble reduces Mean Absolute Percentage Error ($\text{MAPE}$) to **$2.61\%$**, outperforming single model baselines in operational consistency.
- SHAP analysis confirms that **Prior Day Baseline $CO_2$**, **Raw Material Consumption**, and **Production Output** are the primary predictive drivers.
