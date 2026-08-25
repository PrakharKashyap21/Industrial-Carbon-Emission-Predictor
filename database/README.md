# Database Architecture — PostgreSQL & SQLAlchemy 2.x

## Overview
This directory contains the database design assets, schema documentation, and seed script specifications for the **Industrial Carbon Emission Prediction System**.

## Database Specifications
- **Engine:** PostgreSQL 15+ (Production/Local) with SQLite in-memory fallback for automated unit testing.
- **ORM:** SQLAlchemy 2.x Declarative Mapping.
- **Migration Manager:** Alembic.
- **Driver:** `psycopg` (v3).

## Directory Layout
- `schema/`: Entity-relationship overview and DDL notes.
- `migrations/`: Alembic versioned migration scripts.
- `seed/`: Documentation for idempotent dataset seeding.

## Core Entities
1. **`plants`**: Industrial facility metadata (Plant code, name, industry type, location, production unit).
2. **`industrial_readings`**: Daily operational readings (Energy/fuel consumption, production, runtime, ambient metrics, and actual CO₂ emissions).
