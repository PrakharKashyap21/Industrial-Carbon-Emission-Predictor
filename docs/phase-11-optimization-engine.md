# Phase 11 Report: Advanced Optimization & Carbon Reduction Recommendation Engine

## 1. Executive Summary
Phase 11 equips the **Industrial Carbon Emission Prediction System** with an **Automated Optimization and Carbon Reduction Recommendation Engine**.

While Phase 10 allowed users to manually test individual what-if scenarios (e.g. *"What if electricity is reduced by 10%?"*), Phase 11 enables the system to automatically explore candidate operating configurations, evaluate predictions using the existing ML ensemble (Random Forest + XGBoost), enforce operational feasibility constraints, filter out prediction reliability risks, rank candidates by lowest predicted CO₂ emissions, and generate explainable decision-support recommendations.

> **Decision-Support Wording Requirement**:
> The optimization engine is a decision-support system, not an automated industrial controller.
> All UI cards, API responses, and reports use decision-support phrasing (*"Model-estimated CO₂ reduction"*, *"Recommended operating scenario"*, *"Predicted CO₂"*).

---

## 2. Optimization Architecture & Problem Formulation

### Primary Objective
$$\min_{x} \text{Predicted CO}_2(x) = w_{\text{rf}} \cdot \hat{y}_{\text{rf}}(x) + w_{\text{xgb}} \cdot \hat{y}_{\text{xgb}}(x)$$

### Operational Hard Constraints
- **Production Output**: $\text{Production}(x) \ge \text{Production}_{\text{min}}$ (default 5,000 units).
- **Electricity Reduction Cap**: $\Delta \text{Electricity} \ge -20\%$.
- **Diesel Fuel Reduction Cap**: $\Delta \text{Fuel} \ge -20\%$.
- **Machine Runtime Reduction Cap**: $\Delta \text{Runtime} \ge -15\%$.
- **Machine Runtime Upper Bound**: $\text{Runtime}(x) \le 24.0 \text{ hours}$.

### Reliability Policy Filter
- **In-Distribution Check**: Candidates falling outside training data distribution boundaries receive a `CRITICAL` or `LOW` prediction reliability status and are excluded from recommendation ranking.

---

## 3. Grid Search Candidate Generation
- **Grid Step Sizes**: Configurable percentage variation steps (e.g., $5\%$ step size).
- **Variation Grids**:
  - Electricity: $[0\%, -5\%, -10\%, -15\%, -20\%]$
  - Fuel: $[0\%, -5\%, -10\%, -15\%, -20\%]$
  - Runtime: $[0\%, -5\%, -10\%, -15\%]$
- **Total Candidates**: $5 \times 5 \times 4 = 100$ candidate configurations per run.
- **Baseline Candidate #0**: Always included at index 0 ($0\%$ changes) to serve as the benchmark reference.

---

## 4. API Endpoints
- `POST /api/optimization/run`: Execute constrained optimization search, rank candidates, save run and audit log to database, and return recommended scenario with SHAP explanation.
- `GET /api/optimization/history`: Fetch saved optimization runs history.
- `GET /api/optimization/{optimization_id}/candidates`: Fetch detailed candidate results audit trail.
