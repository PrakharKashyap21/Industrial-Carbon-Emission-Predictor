# Industrial Carbon Emission Prediction System — System Architecture

## Architecture Overview
The Industrial Carbon Emission Prediction System is a multi-tier, enterprise-grade industrial AI platform engineered for real-time CO₂ tracking, predictive modeling, What-if scenario simulation, operational optimization, model reliability monitoring, and reporting.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                │
│        Vite + React 18 SPA | TailwindCSS | Recharts | Lucide Icons          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / REST (JSON)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                           API GATEWAY / FASTAPI                             │
│     FastAPI Gateway | CORS Middleware | Request Logging | Pydantic V2      │
└──────────────┬───────────────────────┬───────────────────────┬──────────────┘
               │                       │                       │
┌──────────────▼────────┐   ┌──────────▼──────────┐   ┌────────▼─────────────┐
│  CORE BUSINESS LOGIC  │   │  ML PREDICTION &    │   │  SYSTEM SERVICES     │
│  - Analytics Engine   │   │  EXPLAINABILITY     │   │  - Auth & JWT        │
│  - What-If Simulator  │   │  - RF + XGB Ensemble│   │  - RBAC Permissions  │
│  - Optimization Engine│   │  - SHAP Explainer   │   │  - Report Generator  │
│  - Model Monitoring   │   │  - Feature Scaler   │   │  - Audit Logger      │
└──────────────┬────────┘   └──────────┬──────────┘   └────────┬─────────────┘
               │                       │                       │
┌──────────────▼───────────────────────▼───────────────────────▼──────────────┐
│                           PERSISTENCE LAYER                                 │
│     PostgreSQL Database (Production) / SQLite (Local Dev) | SQLAlchemy ORM  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Topology

### 1. Presentation Layer (Frontend)
- **Framework**: React 18 with Vite build system.
- **Styling**: TailwindCSS with CSS custom properties.
- **Visualizations**: Recharts for interactive trendlines, intensity charts, SHAP bar charts, and feature contribution plots.
- **Services Module**: Centralized Axios HTTP client (`src/services/api.js`) with request interceptors.

### 2. Application Layer (Backend Gateway)
- **Framework**: FastAPI (Python 3.14).
- **ORMs & Drivers**: SQLAlchemy 2.0 with Alembic migration engine.
- **Middleware**:
  - `CORSMiddleware`: Cross-Origin Resource Sharing for Vercel and local origins.
  - `RequestLoggingMiddleware`: Audit logging of API requests, latencies, and status codes.

### 3. Data & Storage Layer
- **Relational Schema**:
  - `users`, `roles`, `user_plants` (Authentication & RBAC)
  - `plants`, `industrial_readings` (Operational telemetry)
  - `predictions`, `prediction_audit_logs` (ML history & actual vs predicted comparisons)
  - `scenarios`, `optimization_runs` (What-if & Solver audit trail)
  - `reports`, `monitoring_snapshots`, `monitoring_alerts` (System health & compliance logs)

---

## Security & Authorization Architecture
- **Authentication**: Stateless Bearer JWT tokens with SHA-256 password hashing.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Global administration, user management, full system access.
  - `PLANT_MANAGER`: Facility management, operational control, plant analytics.
  - `ANALYST`: What-If simulation, model optimization, reporting.
  - `OPERATOR`: Telemetry viewing and daily operational data entry.
- **Plant-Level Data Isolation**: Enforced at backend database query level via `authorization_service.can_access_plant()`.
