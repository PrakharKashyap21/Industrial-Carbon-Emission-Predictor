# Phase 5 Report: Explainable AI with SHAP (SHapley Additive exPlanations)

## 1. Executive Summary
The **Industrial Carbon Emission Prediction System** now includes a mathematical explainability layer using **SHAP (SHapley Additive exPlanations)**.

This layer answers the critical operational question:

> **"Why did the model predict this specific amount of CO₂?"**

By decomposing predictions into exact additive feature attributions, plant operators can inspect how each operational variable (electricity, fuel, gas, runtime, pressure, etc.) drove predicted emissions above or below the baseline expected value.

---

## 2. Mathematical Foundation & Additive Property

SHAP decomposes a model's prediction $\hat{y}$ into an expected baseline value $\phi_0$ plus feature-specific contributions $\phi_i$:

$$\hat{y} = \phi_0 + \sum_{i=1}^{M} \phi_i$$

Where:
- $\hat{y}$: Model predicted CO₂ emission (in **kg CO₂**).
- $\phi_0$ (**Base Value**): Expected model prediction across representative training data prior to observing specific feature inputs.
- $\phi_i$ (**SHAP Value**): Contribution of feature $i$ expressed in target units (**kg CO₂**).

### Additive Validation Integrity
For every prediction, the backend validates numerical consistency:

$$\left| \phi_0 + \sum_{i=1}^{M} \phi_i - \hat{y} \right| \le \epsilon \quad (\text{Tolerance } \epsilon = 2.0\text{ kg CO}_2)$$

---

## 3. Weighted Ensemble SHAP Combination

Phase 4 selected a **Weighted Ensemble** combining Random Forest and XGBoost:

$$\hat{y}_{ensemble} = 0.45 \cdot \hat{y}_{RF} + 0.55 \cdot \hat{y}_{XGB}$$

To maintain mathematical consistency, SHAP values and base values are linearly combined using the **exact Phase 4 validation weight ($w = 0.45$)**:

$$\phi_{0, ensemble} = 0.45 \cdot \phi_{0, RF} + 0.55 \cdot \phi_{0, XGB}$$

$$\phi_{i, ensemble} = 0.45 \cdot \phi_{i, RF} + 0.55 \cdot \phi_{i, XGB}$$

---

## 4. Directional Feature Interpretation

| Contribution Direction | SHAP Value ($\phi_i$) | Operational Meaning |
| :--- | :--- | :--- |
| **Positive Contribution** | $\phi_i > 0$ | Pushes predicted emissions **HIGHER** than baseline. |
| **Negative Contribution** | $\phi_i < 0$ | Pushes predicted emissions **LOWER** than baseline. |
| **Neutral / Minimal** | $\phi_i \approx 0$ | Has little effect on this specific prediction. |

---

## 5. Important Causal & Correlation Limitations

> [!WARNING]
> **Model Behavior vs. Causal Intervention**
> SHAP explains the internal decision mechanics of the trained model ($\hat{y} = f(X)$). It does **NOT** establish direct physical causality. For example, a positive SHAP value for electricity means higher electricity consumption increased the model's prediction—it is not a causal guarantee that reducing electricity will linearly reduce real-world emissions by that exact amount.

> [!NOTE]
> **Correlated Features:**
> Features like `electricity_consumption_kwh`, `energy_intensity`, and `production_quantity` carry related information. When features are correlated, SHAP values are shared across them according to cooperative game theory.

---

## 6. Visualizations & Artifacts
- **Global SHAP Feature Importance**: Exported to [`docs/visualizations/shap/global_shap_importance.png`](file:///Users/prakharkashyap/Documents/Minor%20project/docs/visualizations/shap/global_shap_importance.png).
- **FastAPI Endpoint**: `POST /api/explanations/prediction`
- **React Explanation UI**: Route `/explain-prediction`
