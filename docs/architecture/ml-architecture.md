# Machine Learning Architecture — Industrial Carbon Emission Predictor

## Executive ML Summary
The Machine Learning architecture utilizes a Weighted Ensemble model combining Random Forest Regression and XGBoost Regression to predict daily industrial facility $CO_2$ emissions ($kg CO_2$) based on operational telemetry, resource consumption, runtime hours, and environmental parameters.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RAW OPERATIONAL TELEMETRY                          │
│ Electricity (kWh) | Diesel (L) | Natural Gas (m³) | Production | Runtime... │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    FEATURE ENGINEERING & PREPROCESSING                      │
│ - Intensity Ratios (kWh/Unit, L/Unit, m³/Unit, kg/Unit)                     │
│ - Machine Utilization (Runtime / 24.0)                                      │
│ - Prior Day Baseline ($CO_2$ Lag-1)                                         │
│ - Standard Scaler Normalization                                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                       │
┌──────────────────▼──────────────────┐ ┌──────────────────▼──────────────────┐
│      RANDOM FOREST REGRESSOR        │ │        XGBOOST REGRESSOR            │
│ - 100 Trees, max_depth=12           │ │ - n_estimators=150, learning_rate=0.05│
│ - Sub-sample feature bagging        │ │ - Gradient boosted decision trees   │
└──────────────────┬──────────────────┘ └──────────────────┬──────────────────┘
                   │                                       │
                   │ $\hat{y}_{\text{RF}}$                 │ $\hat{y}_{\text{XGB}}$
                   └───────────────────┬───────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                         WEIGHTED ENSEMBLE COMBINER                          │
│               $\hat{y} = 0.45 \times \hat{y}_{\text{RF}} + 0.55 \times \hat{y}_{\text{XGB}}$                │
│                         Constraint: $w_{\text{RF}} + w_{\text{XGB}} = 1.0$                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    EXPLAINABILITY & RELIABILITY LAYER                       │
│ - TreeSHAP Global & Local Feature Drivers                                   │
│ - Out-of-Distribution (OOD) Input Range Checks                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Ensemble Formulation & Math
The ensemble prediction is computed as a linear convex combination of individual sub-model predictions:

$$\hat{y}_{\text{Ensemble}} = w_{\text{RF}} \cdot \hat{y}_{\text{RF}} + w_{\text{XGB}} \cdot \hat{y}_{\text{XGB}}$$

### Constraint Verification
$$w_{\text{RF}} + w_{\text{XGB}} = 0.45 + 0.55 = 1.00$$

- **Random Forest Weight ($w_{\text{RF}}$)**: `0.45`
- **XGBoost Weight ($w_{\text{XGB}}$)**: `0.55`

---

## 2. Feature Pipeline & Data Leakage Prevention
To ensure zero target leakage:
1. **Target Isolation**: Target variable (`co2_emissions_kg`) is strictly excluded from feature inputs.
2. **Temporal Split**: Dataset is split chronologically using `chronological_split()` ($70\%$ Train, $15\%$ Validation, $15\%$ Test) based on timestamp. Random shuffling is prohibited to avoid temporal lookahead bias.
3. **Transformer Fit**: Feature scaler (`StandardScaler`) is fitted strictly on `X_train` and applied to validation/testing sets.

---

## 3. Model Explainability (TreeSHAP)
Explainability is powered by `shap.TreeExplainer`:
- **Global Importance**: Calculates mean absolute SHAP values across evaluation datasets.
- **Local Explanations**: Computes additive feature contributions for individual facility predictions:

$$f(x) = E[f(X)] + \sum_{i=1}^{M} \phi_i(x)$$

where $E[f(X)]$ is the baseline expected prediction and $\phi_i(x)$ represents the SHAP contribution of feature $i$.
