# Deployment Architecture — Industrial Carbon Emission Predictor

## Production Infrastructure Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GLOBAL CDN / DNS                                 │
│                              Vercel Edge                                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                       │
┌──────────────────▼──────────────────┐ ┌──────────────────▼──────────────────┐
│          FRONTEND SPA               │ │           BACKEND API               │
│ Vercel Hosting                      │ │ Render Cloud Services               │
│ Next.js / Vite Static Bundle        │ │ FastAPI Uvicorn Server              │
│ URL: https://...vercel.app          │ │ URL: https://...onrender.com        │
└─────────────────────────────────────┘ └──────────────────┬──────────────────┘
                                                           │
                                        ┌──────────────────▼──────────────────┐
                                        │          POSTGRESQL DATABASE        │
                                        │ Managed PostgreSQL Instance         │
                                        └─────────────────────────────────────┘
```

---

## Deployment Configuration & Environment Variables

### Frontend Environment (Vercel)
- `VITE_API_BASE_URL`: `https://industrial-carbon-emission-predictor-3.onrender.com/api`

### Backend Environment (Render Cloud)
- `DATABASE_URL`: Managed PostgreSQL connection string (`postgresql+psycopg2://...`)
- `CORS_ORIGINS`: Allowed origins array including Vercel frontend domains.
- `JWT_SECRET_KEY`: Cryptographic signing key for authorization tokens.
- `ENVIRONMENT`: `production`

---

## Zero Downtime Deployment & Cold-Start Strategy
- **Health Checks**: `/api/health` endpoint monitored by automated uptime pinging.
- **SQLite Fallback**: Local development environment automatically initializes `industrial_carbon.db` if PostgreSQL connection is absent, enabling offline development capability.
