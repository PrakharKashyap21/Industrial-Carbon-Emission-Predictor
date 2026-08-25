# 🚀 Industrial Carbon Emission Intelligence System - Getting Started Guide

Welcome to the **Industrial Carbon Emission Intelligence System**! This comprehensive guide walks you through setting up, seeding, running, and testing the system manually from scratch.

---

## 📌 Prerequisites & Prerequisites Verification

Ensure you have the following installed on your machine:
* **Python 3.10+** (Python 3.11/3.12/3.14 supported)
* **Node.js 18+** & **npm**
* **uv** (Fast Python package manager)

---

## 🛠️ Step 1: Backend Setup & Dependency Installation

1. Navigate to the project root:
   ```bash
   cd "/Users/prakharkashyap/Documents/Minor project"
   ```

2. Activate the backend virtual environment or create one using `uv`:
   ```bash
   cd backend
   uv sync
   # Or create standard virtual environment if needed:
   # python3 -m venv .venv
   # source .venv/bin/activate
   # pip install -r requirements.txt
   ```

---

## 🗄️ Step 2: Database Initialization & Seeding Real Sensor Telemetry

The system uses SQLite database (`industrial_carbon.db`) with 5 industrial plants (*Apex Steel Works*, *Titan Cement Plant*, *SynthoChem Industries*, *Vanguard Textile Mill*, *NutriFood Processing Ltd*) and 125 sensor telemetry readings.

To seed/reset the database with real sensor data & pretrained ML models:
```bash
cd "/Users/prakharkashyap/Documents/Minor project"
PYTHONPATH=backend backend/.venv/bin/python backend/app/services/seed_data.py
```
*(You will see output confirming 5 plants, 125 readings, and 137 predictions seeded successfully).*

---

## ⚙️ Step 3: Start the Backend FastAPI Server

Start the Uvicorn server on port `8000`:
```bash
cd "/Users/prakharkashyap/Documents/Minor project/backend"
./.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
* **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 💻 Step 4: Frontend Setup & Dev Server Launch

Open a **new terminal tab/window**:

1. Install frontend dependencies (if not already installed):
   ```bash
   cd "/Users/prakharkashyap/Documents/Minor project/frontend"
   npm install
   ```

2. Start the Vite React development server:
   ```bash
   # From root directory:
   cd "/Users/prakharkashyap/Documents/Minor project"
   npm run dev

   # Or directly inside frontend folder:
   # cd frontend && npm run dev
   ```
* **Web Application URL**: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Step 5: Verification & Testing Workflow

1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Authentication is pre-configured to bypass login for the **Demo Administrator**.
3. **KPI Cards Interaction**: Click on any of the 8 KPI cards at the top of the Dashboard to view the expanded Summary Drawer with real-time insights & action recommendations.
4. **What-if Scenario Simulation**: Go to **What-if** tab ([http://localhost:5173/what-if](http://localhost:5173/what-if)), drag sliders (e.g. -10% Electricity), and click **Run Single Simulation**.
5. **AI Optimization Search**: Go to **Optimization** tab ([http://localhost:5173/optimization](http://localhost:5173/optimization)) and click **Run Automated Optimization Search**.

---

## 📁 Key File Locations

| File / Folder | Purpose |
| :--- | :--- |
| `industrial_carbon.db` | SQLite Database containing telemetry, plants, and predictions |
| `backend/app/main.py` | FastAPI server entry point |
| `backend/app/services/seed_data.py` | Database seeding script |
| `frontend/src/components/dashboard/KPIGrid.jsx` | Interactive KPI cards & click summary drawer |
| `frontend/src/pages/Dashboard.jsx` | Main dashboard overview page |
| `frontend/src/pages/WhatIfAnalysis.jsx` | What-if scenario simulation engine |
| `frontend/src/pages/Optimization.jsx` | Constrained grid search optimization engine |
