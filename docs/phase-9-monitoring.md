# Phase 9 Report: Model Monitoring, Data Drift & Prediction Reliability

## 1. Executive Summary
Phase 9 elevates the **Industrial Carbon Emission Prediction System** from a prediction application to an operational **ML Monitoring System**.

It continuously observes four critical health vectors:
1. **Data Quality**: Checks missing value %, invalid negative inputs, duplicate records, and out-of-training-range bounds.
2. **Data Drift**: Computes feature Population Stability Index (PSI) with zero-bin epsilon smoothing ($\epsilon = 10^{-6}$) and Kolmogorov-Smirnov (KS) statistical tests.
3. **Model Performance**: Evaluates rolling operational error metrics (MAE, RMSE, MAPE, Bias) and measures degradation against Phase 4 test baseline ($\text{MAE} = 226.35\text{ kg CO}_2$).
4. **Prediction Reliability**: Classifies prediction reliability into `HIGH`, `MEDIUM`, or `LOW` with human-readable reason strings.

---

## 2. Statistical Formulas & Thresholds

### Population Stability Index (PSI)
$$\text{PSI} = \sum_{i=1}^{\text{bins}} (A_i - E_i) \times \ln\left(\frac{A_i + \epsilon}{E_i + \epsilon}\right)$$
- $\epsilon = 10^{-6}$ handles zero-count bins safely without log division errors.
- **Rules**:
  - $\text{PSI} < 0.10 \rightarrow \text{LOW}$ (No significant distribution drift)
  - $0.10 \le \text{PSI} \le 0.25 \rightarrow \text{MODERATE}$ (Moderate distribution drift)
  - $\text{PSI} > 0.25 \rightarrow \text{HIGH}$ (Significant distribution drift)

### Kolmogorov-Smirnov (KS) Test
$$\text{KS Statistic} = \sup_x |F_1(x) - F_2(x)|$$
- Significance threshold: $p\text{-value} < 0.05$.

### Performance Degradation
$$\text{Degradation \%} = \frac{\text{Current Operational MAE} - \text{Baseline Test MAE}}{\text{Baseline Test MAE}} \times 100$$
- $\text{Degradation} < 30\% \rightarrow \text{STABLE}$
- $30\% \le \text{Degradation} \le 50\% \rightarrow \text{WARNING}$
- $\text{Degradation} > 50\% \rightarrow \text{DEGRADED}$

---

## 3. Database Schema (`monitoring_snapshots`, `drift_results`, `monitoring_alerts`)
- `monitoring_snapshots`: Overall quality, drift, performance, and reliability statuses with snapshot date.
- `drift_results`: Per-feature PSI, KS statistic, $p$-value, and drift status.
- `monitoring_alerts`: Deduplicated alerts with `alert_type`, `severity`, `message`, and `status`.

---

## 4. API Endpoints
- `POST /api/monitoring/run`: Execute full monitoring cycle and save snapshot
- `GET /api/monitoring/overview`: Get latest snapshot overview summary
- `GET /api/monitoring/data-quality`: Data quality metrics
- `GET /api/monitoring/drift`: Feature-level PSI and KS drift matrix
- `GET /api/monitoring/performance`: Rolling performance & degradation
- `GET /api/monitoring/reliability`: Reliability framework & reasons
- `GET /api/monitoring/alerts`: Active & resolved system alerts
- `PATCH /api/monitoring/alerts/{alert_id}/resolve`: Resolve active alert
