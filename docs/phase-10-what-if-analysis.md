# Phase 10 Report: Advanced What-if Analysis & Scenario Simulation Engine

## 1. Executive Summary
Phase 10 equips the **Industrial Carbon Emission Prediction System** with an **Advanced Decision-Support Simulation Engine**.

Users can simulate operational changes (e.g. $-10\%$ electricity, $-15\%$ fuel, $-5\%$ runtime), compare multiple scenarios side-by-side against a baseline reading, evaluate operational feasibility constraints (minimum production output), assess prediction reliability, conduct single-variable sensitivity analyses, and receive explainable scenario recommendations.

> **Simulation Safety Rule**: What-if scenarios are purely simulations. The engine **never modifies actual industrial reading records** in PostgreSQL. Baseline operating conditions remain preserved.

---

## 2. Core Simulation & Difference Math

### Parameter Transformation Formula
- **Percentage Change**:
  $$\text{new\_value} = \max\left(0, \text{baseline\_value} \times \left(1 + \frac{\Delta\%}{100}\right)\right)$$
- **Absolute Change**:
  $$\text{new\_value} = \max(0, \text{user\_specified\_value})$$

### Emission Change Math
$$\text{CO}_2 \text{ Change (kg)} = \text{Scenario Ensemble Prediction} - \text{Baseline Ensemble Prediction}$$

$$\text{Reduction \%} = \frac{\text{Baseline Prediction} - \text{Scenario Prediction}}{\text{Baseline Prediction}} \times 100$$
- If $\text{Scenario} < \text{Baseline} \rightarrow \text{Interpretation: "CO2 reduction"}$
- If $\text{Scenario} > \text{Baseline} \rightarrow \text{Interpretation: "CO2 increase"}$

---

## 3. Operational Feasibility Constraints
- **Minimum Production Output**: Production quantity must not fall below configured constraint threshold (default 4,800 units).
- **Maximum Reduction Limits**: Electricity $\le 35\%$, Diesel Fuel $\le 35\%$, Machine Runtime $\le 30\%$.
- **Machine Runtime Upper Bound**: Machine runtime cannot exceed physical 24-hour limit ($\le 24.0\text{ hours}$).

---

## 4. Ranking & Recommendation Hierarchy
1. **Feasibility Filter**: Feasible scenarios ($\text{feasible} = \text{True}$) prioritized over infeasible options.
2. **Reliability Filter**: Non-critically low reliability (`HIGH` and `MEDIUM`) prioritized over `LOW`.
3. **Reduction Maximization**: Ranked by highest estimated CO₂ reduction.
4. **Explainable Justification**: Returns human-readable bullets explaining why the top scenario was recommended.

---

## 5. API Endpoints
- `POST /api/what-if/predict`: Simulate single scenario against baseline reading
- `POST /api/what-if/compare`: Batch compare, rank, and recommend multiple scenarios (max 20)
- `POST /api/what-if/sensitivity`: Run single-variable sensitivity analysis ($[-20\%, \dots, +10\%]$)
- `POST /api/what-if/save`: Save scenario definition and result record to database
- `GET /api/what-if/scenarios`: Fetch list of saved What-if scenarios
