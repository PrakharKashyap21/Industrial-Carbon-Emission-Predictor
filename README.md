# Industrial Carbon Emission Prediction System

![System Status](https://img.shields.io/badge/Phase%2016-Audit%20%26%20Stabilization-blue)
![Python Version](https://img.shields.io/badge/Python-3.14-green)
![FastAPI Version](https://img.shields.io/badge/FastAPI-0.110-emerald)
![React Version](https://img.shields.io/badge/React-18-cyan)

Deployed Production Application: [https://industrial-carbon-emission-predicto.vercel.app/](https://industrial-carbon-emission-predicto.vercel.app/)

---

## 1. Project Overview & Problem Statement
Industrial manufacturing facilities account for a significant portion of global greenhouse gas emissions. Managing and reducing carbon output requires real-time telemetry tracking, precise predictive forecasting, explainable AI drivers, and scenario optimization solvers.

The **Industrial Carbon Emission Prediction System** is a full-stack, enterprise-grade AI platform designed to predict daily facility $CO_2$ emissions ($kg CO_2$), explain feature drivers using TreeSHAP, simulate operational What-if scenarios, optimize resource allocation, monitor data/model drift, and export PDF/XLSX/CSV reports.

---

## 2. Technology Stack

### Presentation Layer (Frontend)
- **Framework**: React 18, Vite
- **Styling**: TailwindCSS, CSS Custom Tokens
- **Visualizations**: Recharts
- **HTTP Client**: Axios with JWT Interceptors

### Backend & API Layer
- **Framework**: FastAPI (Python 3.14)
- **ASGI Server**: Uvicorn
- **ORM & DB**: SQLAlchemy 2.0, PostgreSQL (Production) / SQLite (Local Dev)
- **Data Validation**: Pydantic V2

### Machine Learning & Analytics Pipeline
- **Models**: Scikit-Learn Random Forest Regressor, XGBoost Regressor
- **Ensemble**: Convex Weighted Ensemble ($0.45 \times \text{RF} + 0.55 \times \text{XGB}$)
- **Explainable AI**: SHAP (TreeExplainer)
- **Reporting**: ReportLab (PDF), openpyxl (XLSX)

---

## 3. Machine Learning Methodology & Empirical Results

### Ensemble Formulation
Predictions are generated using a convex weighted average:

$$\hat{y} = 0.45 \times \hat{y}_{\text{RF}} + 0.55 \times \hat{y}_{\text{XGB}}$$

Weights strictly satisfy: $0.45 + 0.55 = 1.00$.

### Empirical Test Set Benchmark (Held-Out Test Data)

| Model | MAE ($kg CO_2$) | RMSE ($kg CO_2$) | $R^2$ Score | MAPE (%) | Inference Latency |
|---|---|---|---|---|---|
| **Random Forest Regressor** | 220.18 | 277.73 | 0.9984 | 2.87% | 1.2807 ms/sample |
| **XGBoost Regressor** | 300.42 | 439.86 | 0.9960 | 3.00% | 0.0726 ms/sample |
| **RF + XGB Weighted Ensemble** | **225.46** | **307.94** | **0.9980** | **2.61%** | **0.0003 ms/sample** |

---

## 4. Key System Features

1. **Industrial Analytics Dashboard**: Real-time KPI summaries, actual vs predicted $CO_2$ emissions, intensity ratios, and data quality metrics.
2. **ML Prediction Engine**: Real-time emission forecasting with model versioning and reliability scoring.
3. **TreeSHAP Explainability**: Global feature ranking and local per-prediction additive driver attribution.
4. **What-If Scenario Simulator**: Simulates operational changes (Electricity, Diesel, Natural Gas, Production) with Out-Of-Distribution (OOD) warnings.
5. **Operational Optimization Engine**: Constrained grid search optimization identifying minimal $CO_2$ operational configurations.
6. **Model Reliability Monitoring**: Data quality tracking, Population Stability Index (PSI) drift detection, and automated alert management.
7. **Report Generator & Exporter**: Instant generation of PDF, XLSX Workbooks, and CSV raw data exports.
8. **Authentication & RBAC**: JWT Bearer token security with strict role permissions (`ADMIN`, `PLANT_MANAGER`, `ANALYST`, `OPERATOR`) and plant-level query authorization.

---

## 5. Local Development Setup

### Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000/api`
- Interactive Swagger Docs: `http://localhost:8000/docs`

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Frontend App: `http://localhost:5173`

---

## 6. Phase 16 — Audit & Stabilization Summary

During Phase 16, a complete end-to-end audit was conducted:
- **Test Suite**: 142 out of 142 backend unit/integration tests passing ($100\%$).
- **Bugs Discovered & Fixed**: Fixed CORS origin parsing (`BUG-001`), resolved `MultipleResultsFound` exception during alert deduplication (`BUG-002`), and sanitized plant filter query params (`BUG-003`).
- **Data Leakage & Math Audit**: Confirmed zero target leakage ($CO_2$ target excluded from features; chronological temporal split used; ensemble weights sum to $1.00$).
- **Documentation Complete**: Complete architecture diagrams, benchmarking, API specifications, and research limitations created under `docs/`.

---

## 7. License
MIT License
