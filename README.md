# Industrial Carbon Emission Prediction System

![System Status](https://img.shields.io/badge/System--Status-Production--Ready-emerald)
![Python Version](https://img.shields.io/badge/Python-3.10+-green)
![FastAPI Version](https://img.shields.io/badge/FastAPI-0.110+-emerald)
![React Version](https://img.shields.io/badge/React-18-cyan)
![Tests](https://img.shields.io/badge/Tests-149%2F149%20Passed-brightgreen)

Deployed Production Application: [https://industrial-carbon-emission-predicto.vercel.app/](https://industrial-carbon-emission-predicto.vercel.app/)

Backend API Documentation: [https://industrial-carbon-emission-predictor-3.onrender.com/docs](https://industrial-carbon-emission-predictor-3.onrender.com/docs)

---

## 1. Project Overview & Purpose

Industrial manufacturing facilities account for a significant portion of global greenhouse gas emissions. Managing and reducing carbon output requires real-time telemetry tracking, precise predictive forecasting, explainable AI drivers, operational What-if simulation, and constrained optimization.

The **Industrial Carbon Emission Prediction System** is a full-stack, enterprise-grade AI platform designed to:
- Predict daily facility $\text{CO}_2$ emissions ($\text{kg CO}_2$) using a weighted Random Forest + XGBoost ensemble model.
- Explain feature drivers using TreeSHAP additive attribution.
- Simulate operational What-if scenarios and batch-compare presets.
- Perform single-variable sensitivity curve analysis across key operating parameters.
- Optimize resource allocation under operational constraints.
- Monitor model health, Population Stability Index (PSI) drift, and statistical $z$-score anomalies.
- Generate automated executive reports in PDF, XLSX, and CSV formats.
- Enforce strict server-side Role-Based Access Control (RBAC) and security audit logging.

---

## 2. Technology Stack

### Presentation Layer (Frontend)
- **Framework**: React 18, Vite
- **Styling**: Vanilla CSS with Custom Design Tokens & Tailwind Utility Classes
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT Bearer Interceptors & Cold-Start Readiness Handling

### Backend & API Layer
- **Framework**: FastAPI (Python 3.10+)
- **ASGI Server**: Uvicorn
- **ORM & Database**: SQLAlchemy 2.0, Supabase PostgreSQL (Production) / SQLite (Local Fallback)
- **Data Validation**: Pydantic V2

### Machine Learning & Analytics Pipeline
- **Models**: Scikit-Learn Random Forest Regressor, XGBoost Regressor
- **Ensemble**: Convex Weighted Ensemble ($0.45 \times \text{RF} + 0.55 \times \text{XGB}$)
- **Explainable AI**: SHAP (TreeExplainer)
- **Reporting**: ReportLab (PDF), openpyxl (XLSX Workbook), CSV

### Infrastructure & Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render Free Service
- **Database Hosting**: Supabase PostgreSQL

---

## 3. Machine Learning Methodology & Empirical Results

### Ensemble Formulation
Predictions are generated using a convex weighted average of Random Forest and XGBoost regressors:

$$\hat{y} = 0.45 \times \hat{y}_{\text{RF}} + 0.55 \times \hat{y}_{\text{XGB}}$$

The weights strictly satisfy $0.45 + 0.55 = 1.00$, balancing Random Forest's robustness against extreme variance with XGBoost's precise gradient boosting response.

### Empirical Benchmark (Held-Out Test Set)

| Model | MAE ($\text{kg CO}_2$) | RMSE ($\text{kg CO}_2$) | $R^2$ Score | MAPE (%) | Inference Latency |
|---|---|---|---|---|---|
| **Random Forest Regressor** | 220.18 | 277.73 | 0.9984 | 2.87% | 1.28 ms/sample |
| **XGBoost Regressor** | 300.42 | 439.86 | 0.9960 | 3.00% | 0.07 ms/sample |
| **RF + XGB Weighted Ensemble** | **225.46** | **307.94** | **0.9980** | **2.61%** | **<0.01 ms/sample** |

---

## 4. Key System Features

1. **Industrial Analytics Dashboard**: Real-time KPI summaries, actual vs. predicted $\text{CO}_2$ emissions, production carbon intensity ratios ($\text{kg CO}_2 / \text{unit}$), data quality scores, and cold-start resiliency status.
2. **ML Prediction Engine**: Sub-model prediction breakdown (Random Forest vs. XGBoost), disagreement metrics, reliability scoring, and confidence bounds.
3. **TreeSHAP Explainability**: Global feature importance ranking and per-prediction local additive driver attribution identifying key emission multipliers.
4. **What-If Scenario Simulator**: Simulates operational parameter adjustments (Electricity, Diesel, Natural Gas, Runtime) with prefilled baseline overrides, feasibility checks, and multi-scenario comparison tables.
5. **Single-Variable Sensitivity Curve Analysis**:
   - **Dynamic Feature Selection**: User-selectable parameters (`Electricity Consumption (kWh)`, `Diesel Fuel Consumption (Liters)`, `Natural Gas Consumption (m³)`, `Machine Runtime (Hours)`).
   - **Variation Analysis**: Evaluates parameter variations across a configured percentage range (`-20%`, `-15%`, `-10%`, `-5%`, `0%`, `+5%`, `+10%`).
   - **Single-Parameter Isolation**: Modifies strictly the selected feature while maintaining baseline values for all other operational variables.
   - **Explicit User Triggering**: Curve generation is explicitly user-triggered via the *"Generate Sensitivity Curve"* action or dropdown parameter selection, avoiding unnecessary background execution.
   - **Interactive Visualization**: Rendered with customized Recharts curves featuring clean axis formatting and zero tick-label text overlap (`POST /api/what-if/sensitivity`).
6. **Operational Optimization Engine**: Constrained optimization identifying minimal $\text{CO}_2$ operational configurations subject to minimum production feasibility bounds.
7. **Multi-Plant Facility Ranking**: Comparative plant benchmarking by total emissions and carbon intensity across authorized industrial sites.
8. **Model Health & Anomaly Detection**: Statistical $z$-score anomaly detection, Population Stability Index (PSI) feature drift tracking, and active alert lifecycle management (`OPEN`, `ACKNOWLEDGED`, `RESOLVED`).
9. **Executive Reporting & Export**: On-demand generation of formatted PDF executive summaries, multi-tab XLSX workbooks, and raw CSV exports.
10. **Authentication & RBAC Administration**: Secure JWT Bearer authentication with role permissions (`ADMIN`, `PLANT_MANAGER`, `ANALYST`, `OPERATOR`), plant-level authorization, and security audit logging.

---

## 5. Local Development Setup

### Backend Setup (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000/api`
- Interactive Swagger UI Docs: `http://localhost:8000/docs`

### Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

## 6. Deployment Architecture & Cold-Start Resiliency

- **Frontend**: Hosted on Vercel with automatic continuous integration from the `main` branch.
- **Backend**: Hosted on Render Free Web Service. To handle Render Free container sleep gracefully, the frontend implements a readiness check (`checkBackendReadiness`) with status updates while the container boots.
- **Database**: Primary Supabase PostgreSQL database with automatic fast-track fallback to local SQLite (`industrial_carbon.db`) if primary DB connections are unavailable during development.

---

## 7. System Verification & Quality Summary

- **Automated Backend Tests**: $149 / 149$ tests passing ($100\%$ pass rate across analytics, auth/RBAC, dashboard, ML models, monitoring, optimization, reporting, and What-if sensitivity engine).
- **Frontend Production Build**: `npm run build` compiles cleanly with $0$ errors.
- **Security & Authorization**: Server-side RBAC enforcement and plant context validation across all REST API endpoints.
- **Data Integrity**: Clean separation between actual historical readings, ML predictions, and model-estimated What-if scenario projections.

---

## 8. License
MIT License
