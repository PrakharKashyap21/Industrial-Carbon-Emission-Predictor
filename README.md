# Industrial Carbon Emission Prediction System

## Current Status
**Phase 1 — Project Foundation**

## Objective
The **Industrial Carbon Emission Prediction System** is a full-stack AI/ML platform designed to monitor, predict, and optimize industrial CO₂ emissions. The final system will feature an ensemble machine learning model combining **Random Forest** and **XGBoost** regressors, explainable AI with **SHAP**, interactive **What-if Analysis** for emission-reduction scenario planning, historical analytics, and risk alert notifications.

## Planned Technology Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router
- Axios

### Backend
- Python 3
- FastAPI
- Uvicorn
- Pydantic

### Database & Storage
- PostgreSQL (Phase 2+)

### Machine Learning & Analytics
- Scikit-Learn (Random Forest)
- XGBoost
- SHAP (Explainable AI)

---

## Current Phase (Phase 1)
Phase 1 establishes the core application architecture, standard folder hierarchy, FastAPI backend application, React (Vite) frontend application, CORS middleware configuration, and health check API integration (`GET /api/health`).

> **Note:** Machine Learning models, database schemas, prediction APIs, and analytics dashboards will be introduced in subsequent phases.

---

## Project Structure

```text
industrial-carbon-emission-prediction/
│
├── frontend/             # React + Vite frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Router pages (Home.jsx)
│   │   ├── services/    # API clients (api.js)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/              # FastAPI backend application
│   ├── app/
│   │   ├── api/         # Endpoint routes
│   │   ├── core/        # App configuration & settings
│   │   ├── schemas/     # Pydantic data schemas
│   │   └── main.py      # Uvicorn entry point
│   ├── tests/           # API test suite
│   └── requirements.txt
│
├── database/             # Database architecture & SQL scripts
│   ├── schema/
│   ├── migrations/
│   └── seed/
│
├── data/                 # Dataset directory
│   ├── raw/
│   ├── processed/
│   └── sample/
│
├── notebooks/            # Jupyter notebooks for EDA & experimentation
│   ├── EDA/
│   └── experiments/
│
├── docs/                 # System documentation
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## Getting Started (Local Development)

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Uvicorn server
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000/api`
- Health Check: `http://localhost:8000/api/health`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`

### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
- Frontend App: `http://localhost:5173`

---

## License
MIT License
