# Phase 12 Report: Advanced Industrial Analytics & Insights Dashboard

## 1. Executive Summary
Phase 12 transforms the **Industrial Carbon Emission Prediction System** into a full-scale **Industrial Carbon Intelligence Platform**.

Rather than solely providing one-off predictions or scenario simulations, Phase 12 provides a unified analytics layer that tracks historical emission trends, production-normalized emission intensity ($\text{kg CO}_2 / \text{unit}$), operational factor correlations, anomaly timelines, model insights, optimization savings impact, and deterministic rule-based industrial insights.

> **Data Integrity & Non-Duplication Rule**:
> Analytics reads directly from normalized existing PostgreSQL tables (`industrial_readings`, `predictions`, `monitoring_snapshots`, `scenarios`, `optimization_runs`). Data is aggregated dynamically without duplicating operational records.

---

## 2. Analytics Engine Core Formulations

### Production-Normalized Emission Intensity
$$\text{Emission Intensity} = \frac{\text{Total Predicted CO}_2 \text{ (kg)}}{\text{Total Production Output (units)}}$$

### Period-over-Period (Month-over-Month) Changes
$$\Delta \text{Intensity \%} = \frac{\text{Intensity}_{\text{current}} - \text{Intensity}_{\text{previous}}}{\text{Intensity}_{\text{previous}}} \times 100$$

### Pearson Correlation Coefficient
$$r_{x,y} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}$$

---

## 3. Deterministic Rule-Based Industrial Insight Engine
The insight engine evaluates structured operational conditions using transparent, reproducible rules:
1. **Efficiency Rule**: Evaluates if production increases while emission intensity decreases.
2. **Emission Trend Rule**: Evaluates period-over-period predicted emission shifts.
3. **Operational Driver Rule**: Identifies primary correlated factor ($r > 0.70$).
4. **Anomaly Rule**: Flags logged operational anomaly counts.
5. **Optimization Rule**: Summarizes model-estimated reduction potential across optimization search runs.

---

## 4. API Endpoints
- `GET /api/analytics/overview`: Aggregated major KPIs
- `GET /api/analytics/emission-trend`: Historical CO₂ emission trend points
- `GET /api/analytics/production-trend`: Production output trend points
- `GET /api/analytics/emission-intensity`: Production-normalized emission intensity ($\text{kg CO}_2 / \text{unit}$)
- `GET /api/analytics/features`: Operational factor trends & correlation matrix
- `GET /api/analytics/anomalies`: Operational anomaly timeline & frequency
- `GET /api/analytics/insights`: Deterministic rule-based industrial insights
- `GET /api/analytics/optimization-impact`: Historical optimization savings tracking
