# Database Seeding Documentation

## Overview
Seed data for local development is ingested from `data/sample/industrial_emissions_sample.csv`.

## Execution
Run the seed script service from the backend virtual environment:

```bash
cd backend
.venv/bin/python -m app.services.seed_data
```

## Idempotency Rules
The seed script checks for existing records matching `(plant_id, timestamp)` and `plant_code` before insertion to prevent duplicate record errors upon multiple executions.
