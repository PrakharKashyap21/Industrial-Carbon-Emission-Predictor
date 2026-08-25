# Phase 15 Report: Production Deployment, Dockerization & DevOps

## 1. Executive Summary
Phase 15 equips the **Industrial Carbon Emission Prediction System** with a deployable production architecture:
- Multi-container Docker deployment (FastAPI backend, multi-stage Nginx React frontend, PostgreSQL database).
- Nginx reverse proxy routing (`/` to frontend, `/api/` to backend).
- Alembic database migration setup.
- Production environment separation (`.env.example`).
- Container health monitoring (`/health/live`, `/health/ready`).
- Structured logging with `X-Request-ID` tracing.
- GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`).

---

## 2. Docker Architecture & Container Ports

```text
                    HTTPS / HTTP (Port 80)
                              │
                              ↓
                      ┌──────────────┐
                      │    NGINX     │
                      │ Reverse Proxy│
                      └──────┬───────┘
                             │
            ┌────────────────┴────────────────┐
            ↓                                 ↓
      React Frontend                    FastAPI Backend
    (Static Port 80)                   (ASGI Port 8000)
                                              │
                                              ↓
                                         PostgreSQL
                                   (Internal Port 5432)
```

- **Frontend Container**: Multi-stage Docker build (Stage 1: Node 20 `npm run build` $\rightarrow$ Stage 2: Nginx alpine serving `/usr/share/nginx/html`).
- **Backend Container**: Python 3.11/3.14 slim image running production ASGI Uvicorn worker.
- **PostgreSQL Container**: Alpine image with persistent Docker volume `postgres_data` and internal network `app_network`.

---

## 3. Local Production Run Instructions

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and start containers with Docker Compose
docker compose up -d --build

# 3. Check health status
curl http://localhost/health/ready
```

---

## 4. Health Check Probes
- `GET /health/live`: Returns `{"status": "alive"}`
- `GET /health/ready`: Verifies PostgreSQL connection and ML model load status:
```json
{
  "status": "ready",
  "database": "connected",
  "model": "loaded",
  "phase": "Phase 15 — Production Deployment"
}
```
