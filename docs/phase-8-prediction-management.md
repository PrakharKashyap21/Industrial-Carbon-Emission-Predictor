# Phase 8 Report: Prediction Management & Historical Analytics

## 1. Executive Summary
Phase 8 transitions the **Industrial Carbon Emission Prediction System** from one-off predictions to complete **Prediction Lifecycle Management**.

All generated predictions are saved to PostgreSQL with model version tags (`ensemble_v1`), input reading references, individual Random Forest and XGBoost outputs, and status tracking (`pending_actual` vs `evaluated`). When actual emissions are recorded, official signed error, absolute error (MAE), RMSE, and MAPE metrics are computed.

---

## 2. Prediction Lifecycle Workflow

```text
Industrial Input
       ↓
Feature Engineering Pipeline (features_v1)
       ↓
Random Forest + XGBoost Regressors
       ↓
Weighted Ensemble Prediction (ensemble_v1)
       ↓
Save to PostgreSQL predictions table (status: pending_actual)
       ↓
Actual Recorded CO₂ Emissions Available Later
       ↓
PATCH /api/predictions/{id}/actual
       ↓
Calculate Error Metrics (Signed Error, MAE, RMSE, MAPE)
       ↓
Status Transitivity → evaluated
       ↓
Historical Operational Analytics
```

---

## 3. Database Schema (`predictions`)

| Column Name | PostgreSQL Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Unique prediction record ID |
| `plant_id` | INTEGER FK | Foreign key pointing to `plants.id` |
| `reading_id` | INTEGER FK | Foreign key pointing to `industrial_readings.id` |
| `prediction_timestamp` | TIMESTAMP | Timestamp when prediction was generated |
| `reading_timestamp` | TIMESTAMP | Operational reading timestamp |
| `rf_prediction` | FLOAT | Random Forest Regressor prediction (kg CO₂) |
| `xgb_prediction` | FLOAT | XGBoost Regressor prediction (kg CO₂) |
| `ensemble_prediction` | FLOAT | Final weighted ensemble prediction (kg CO₂) |
| `actual_co2` | FLOAT | Actual recorded CO₂ emission (kg) |
| `signed_error` | FLOAT | $\text{prediction} - \text{actual}$ ($+ = \text{Overpredicted}$, $- = \text{Underpredicted}$) |
| `absolute_error` | FLOAT | $|\text{actual} - \text{prediction}|$ (kg CO₂) |
| `percentage_error` | FLOAT | $\frac{|\text{actual} - \text{prediction}|}{\text{actual}} \times 100$ |
| `model_version` | VARCHAR(50) | Active model tag (`ensemble_v1`) |
| `model_type` | VARCHAR(50) | Candidate model architecture (`rf_xgb_ensemble`) |
| `feature_pipeline_version` | VARCHAR(50) | Pipeline version tag (`features_v1`) |
| `prediction_horizon` | VARCHAR(20) | Horizon (`current`) |
| `status` | VARCHAR(20) | `pending_actual` or `evaluated` |

---

## 4. Operational Error Metrics & Distinction
- **Test Set Metrics (Phase 4)**: Fixed benchmark evaluated on static 15% test split ($R^2 = 0.998$, $\text{MAE} = 226.35\text{ kg}$).
- **Historical Prediction Metrics (Phase 8)**: Dynamic operational metrics calculated over live evaluated database records.

---

## 5. API Endpoints
- `POST /api/predictions`: Generate and store new prediction record.
- `GET /api/predictions`: Paginated prediction history list (`page`, `limit` $\le 100$, filters: `plant_id`, `status`, `model_version`, `sort_by`).
- `GET /api/predictions/analytics`: Operational metrics (MAE, RMSE, MAPE, Mean Bias, RF vs XGB vs Ensemble comparison).
- `GET /api/predictions/{id}`: Single prediction detail with SHAP explanation.
- `PATCH /api/predictions/{id}/actual`: Update actual CO₂ and compute errors.
