# Database Schema Documentation

## Tables

### 1. `plants`
- `id` (INTEGER, Primary Key, Autoincrement)
- `plant_code` (VARCHAR(50), Unique, Indexed, Not Null)
- `plant_name` (VARCHAR(255), Not Null)
- `industry_type` (VARCHAR(100), Not Null)
- `location` (VARCHAR(255), Nullable)
- `production_unit` (VARCHAR(50), Nullable)
- `created_at` (TIMESTAMP, Default NOW)
- `updated_at` (TIMESTAMP, Default NOW)

### 2. `industrial_readings`
- `id` (BIGINT, Primary Key, Autoincrement)
- `plant_id` (INTEGER, Foreign Key → `plants.id`, Indexed, Not Null)
- `timestamp` (TIMESTAMP, Indexed, Not Null)
- `electricity_consumption_kwh` (FLOAT, Not Null, `>= 0`)
- `diesel_consumption_liters` (FLOAT, Not Null, `>= 0`)
- `natural_gas_consumption_m3` (FLOAT, Not Null, `>= 0`)
- `production_quantity` (FLOAT, Not Null, `>= 0`)
- `raw_material_consumption_kg` (FLOAT, Not Null, `>= 0`)
- `machine_runtime_hours` (FLOAT, Not Null, `0 <= x <= 24`)
- `temperature_c` (FLOAT, Not Null)
- `pressure_bar` (FLOAT, Not Null, `>= 0`)
- `previous_co2_emission_kg` (FLOAT, Not Null, `>= 0`)
- `actual_co2_emission_kg` (FLOAT, Not Null, `>= 0`)
- `created_at` (TIMESTAMP, Default NOW)

### Composite Constraints & Indexes
- Unique Index: `(plant_id, timestamp)`
- Index: `plants.plant_code`
- Index: `industrial_readings.plant_id`
- Index: `industrial_readings.timestamp`
