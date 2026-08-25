# Phase 7 Report: Industrial Dashboard & Analytics

## 1. Executive Summary
The **Industrial Carbon Emission Prediction System** now features an end-to-end **Industrial Environmental & AI Analytics Dashboard**.

The dashboard connects PostgreSQL operational data (`plant`, `industrial_readings`), ML prediction service (`ensemble_v1`), SHAP explainability insights, and What-if Analysis into a unified data intelligence portal.

---

## 2. System Architecture & Data Flow

```text
               PostgreSQL Database (Plant & Readings)
                               │
                               ↓
                   Dashboard Overview Service
                               │
       ┌───────────────────────┼───────────────────────┐
       ↓                       ↓                       ↓
  Historical               ML Ensemble            Global SHAP
  Aggregations             Prediction             Explainer
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ↓
                   FastAPI GET /api/dashboard/overview
                               │
                               ↓
                   React Industrial Dashboard
```

---

## 3. Key Performance Indicators (KPIs) & Formulas

### 1. Actual vs Predicted CO₂ Emissions
- **Actual CO₂**: Latest recorded real-world emission value from PostgreSQL database.
- **Predicted CO₂**: Latest ML prediction evaluated via `ensemble_v1`.

### 2. CO₂ Emission Intensity
$$\text{CO}_2 \text{ Intensity} = \frac{\text{CO}_2 \text{ Emission}}{\text{Production Quantity}} \quad (\text{kg CO}_2 / \text{Unit})$$

> **Zero Production Safeguard:** If production output is zero or missing, intensity evaluates to `null` to prevent division-by-zero errors.

### 3. Period-over-Period Trend Percentages
$$\% \Delta = \left( \frac{\text{Current Period Avg} - \text{Previous Period Avg}}{\text{Previous Period Avg}} \right) \times 100$$

---

## 4. Visualizations Included
1. **Historical CO₂ Emission Trend**: Actual emissions over time with 7-day moving average overlay.
2. **Actual vs Predicted CO₂ Overlay**: Multi-series chart allowing visual inspection of model alignment and prediction residual errors.
3. **Resource Consumption Trends**: Electrical energy (kWh), diesel fuel (Liters), and natural gas (m³).
4. **CO₂ Intensity Trend**: Efficiency tracking over time.
5. **Top SHAP Feature Drivers**: Global feature attributions from Phase 5.
6. **Model Registry Performance**: Phase 4 test set performance (R², MAE, RMSE, MAPE).
7. **Data Quality Card**: Total database readings, missing value ratio, data freshness timestamp.

---

## 5. API Endpoints
- **Overview API**: `GET /api/dashboard/overview?plant_id=1&days=30`
