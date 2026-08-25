# Industrial Carbon Emission API — Backend

## Overview
FastAPI backend service for the Industrial Carbon Emission Prediction System.

## Architectural Layers
- `app/api/`: Endpoint routers and controller logic.
- `app/core/`: Application settings, environment configuration, and security setup.
- `app/schemas/`: Pydantic data validation and response schemas.
- `app/models/`: Database models (Phase 2).
- `app/services/`: Business logic services (Phase 2).
- `app/database/`: Database connection session managers (Phase 2).
- `app/ml/`: Machine learning model loaders & inference logic (Phase 2).

## Running locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Running tests

```bash
pytest tests/
```
