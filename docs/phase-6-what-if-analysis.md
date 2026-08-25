# Phase 6 Report: What-if Analysis & Scenario Simulation

## 1. Executive Summary
The **Industrial Carbon Emission Prediction System** now features an interactive **What-if Analysis / Scenario Simulation Engine**.

This feature enables plant managers and sustainability officers to simulate operational strategy changes (e.g., reducing electricity, switching fuel ratios, altering machine runtimes) and immediately observe the predicted carbon reduction impact:

$$\text{Operational Modification } (X \rightarrow X') \implies \text{Predicted Emission Impact } (f(X) \rightarrow f(X'))$$

---

## 2. Core Architectural Principles

### 1. Zero Model Retraining
Scenario simulations execute in milliseconds by passing modified input parameters $X'$ through the canonical Phase 3 feature-engineering pipeline ([`feature_engineering.py`](file:///Users/prakharkashyap/Documents/Minor%20project/backend/app/ml/feature_engineering.py)) and evaluating the trained Phase 4 **Weighted Ensemble Model** (`ensemble_v1`). Model weights are **100% frozen** during simulation.

### 2. Model Version Consistency
Baseline and scenario predictions always evaluate against the identical model version tag (`ensemble_v1`), ensuring that observed differences reflect operational parameter changes rather than model algorithm shifts.

---

## 3. Mathematical Metrics & Intensity Calculations

### 1. Absolute & Percentage CO₂ Change
$$\Delta \text{CO}_2 = \text{Scenario Prediction} - \text{Baseline Prediction} \quad (\text{kg CO}_2)$$

$$\text{Percentage Change } (\%) = \left( \frac{\text{Scenario} - \text{Baseline}}{\text{Baseline}} \right) \times 100$$

### 2. Direction Classification
- **Reduction**: $\Delta \text{CO}_2 < -1.0\text{ kg}$
- **Increase**: $\Delta \text{CO}_2 > 1.0\text{ kg}$
- **No Significant Change**: $|\Delta \text{CO}_2| \le 1.0\text{ kg}$

### 3. CO₂ Emission Intensity
$$\text{Baseline Intensity} = \frac{\text{Baseline Predicted CO}_2}{\text{Baseline Production Quantity}} \quad (\text{kg CO}_2 / \text{Unit})$$

$$\text{Scenario Intensity} = \frac{\text{Scenario Predicted CO}_2}{\text{Scenario Production Quantity}} \quad (\text{kg CO}_2 / \text{Unit})$$

> **Zero Production Safeguard:** If production quantity is zero, emission intensity returns `null` to avoid division-by-zero errors.

---

## 4. Out-of-Distribution Warning Detector

Scenario inputs are validated against historical training min/max bounds saved in `models/feature_ranges.json`. If a user specifies an extreme scenario parameter outside historical training limits (e.g. Electricity = 50,000 kWh when historical max is 25,000 kWh), the backend returns readable warnings highlighting increased prediction uncertainty without halting execution.

---

## 5. SHAP Scenario Attribution Comparison

By evaluating SHAP feature attributions on both baseline and scenario inputs:

$$\Delta \text{SHAP}_i = \text{SHAP}_{i, Scenario} - \text{SHAP}_{i, Baseline}$$

The system explains **how the model's internal reasoning shifted** between baseline and scenario inputs.

---

## 6. Visualizations & API Endpoints
- **Single Scenario API**: `POST /api/what-if/analyze`
- **Batch Multi-Scenario API**: `POST /api/what-if/analyze-batch`
- **React Scenario UI**: Route `/what-if`
