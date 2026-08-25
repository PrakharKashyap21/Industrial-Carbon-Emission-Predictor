# Industrial Carbon Emission Dataset — Data Dictionary

This document specifies the schema, data types, units, validation constraints, and Machine Learning roles for the **Industrial Carbon Emission Prediction System** dataset.

> **Important ML Safeguard:** `actual_co2_emission_kg` is strictly designated as the **Target Variable ($Y$)**. It must never be included as an input feature ($X$) during machine learning model training to prevent data leakage.

---

## Field Specifications

### 1. `id`
- **Data Type:** `BIGINT` / `INTEGER`
- **Unit:** N/A (Surrogate Key)
- **Description:** Unique identifier for each operational reading record.
- **ML Role:** Identifier / Primary Key
- **Nullable:** No
- **Expected Range:** `> 0`

### 2. `plant_id`
- **Data Type:** `INTEGER`
- **Unit:** N/A (Foreign Key)
- **Description:** References the industrial plant (`plants.id`) where operational measurements were recorded.
- **ML Role:** Grouping / Facility Identifier
- **Nullable:** No
- **Expected Range:** Foreign key constraint to `plants.id`

### 3. `timestamp`
- **Data Type:** `TIMESTAMP` / `DATETIME`
- **Unit:** ISO 8601 (YYYY-MM-DD 00:00:00)
- **Description:** Operational recording date for daily industrial records.
- **ML Role:** Temporal index / Time-series ordering
- **Nullable:** No
- **Expected Range:** Valid calendar timestamp. Unique per `(plant_id, timestamp)`.

### 4. `electricity_consumption_kwh`
- **Data Type:** `FLOAT`
- **Unit:** Kilowatt-hours (kWh)
- **Description:** Total electrical energy consumed by plant machinery and HVAC over 24 hours.
- **ML Role:** Input Feature ($X_1$)
- **Nullable:** No
- **Expected Range:** `≥ 0.0`

### 5. `diesel_consumption_liters`
- **Data Type:** `FLOAT`
- **Unit:** Liters (L)
- **Description:** Diesel fuel consumed by generator sets, boilers, and heavy plant equipment.
- **ML Role:** Input Feature ($X_2$)
- **Nullable:** No
- **Expected Range:** `≥ 0.0`

### 6. `natural_gas_consumption_m3`
- **Data Type:** `FLOAT`
- **Unit:** Cubic meters ($m^3$)
- **Description:** Natural gas volume combusted for high-temperature industrial heating and furnaces.
- **ML Role:** Input Feature ($X_3$)
- **Nullable:** No
- **Expected Range:** `≥ 0.0`

### 7. `production_quantity`
- **Data Type:** `FLOAT`
- **Unit:** Standard Units / Metric Tons
- **Description:** Total volume or mass of finished industrial goods produced during the day.
- **ML Role:** Input Feature ($X_4$)
- **Nullable:** No
- **Expected Range:** `≥ 0.0`

### 8. `raw_material_consumption_kg`
- **Data Type:** `FLOAT`
- **Unit:** Kilograms (kg)
- **Description:** Mass of raw materials processed in production lines.
- **ML Role:** Input Feature ($X_5$)
- **Nullable:** No
- **Expected Range:** `≥ 0.0`

### 9. `machine_runtime_hours`
- **Data Type:** `FLOAT`
- **Unit:** Hours (hrs)
- **Description:** Cumulative active operating hours of major plant machinery.
- **ML Role:** Input Feature ($X_6$)
- **Nullable:** No
- **Expected Range:** `0.0 ≤ x ≤ 24.0` (Enforced daily operation limit)

### 10. `temperature_c`
- **Data Type:** `FLOAT`
- **Unit:** Degrees Celsius (°C)
- **Description:** Average ambient or key process operational temperature.
- **ML Role:** Input Feature ($X_7$)
- **Nullable:** No
- **Expected Range:** Unrestricted numerical (may be negative depending on refrigeration or sub-zero operating environments).

### 11. `pressure_bar`
- **Data Type:** `FLOAT`
- **Unit:** Bar
- **Description:** Average operational pressure in steam systems, reaction vessels, or pneumatic lines.
- **ML Role:** Input Feature ($X_8$)
- **Nullable:** No
- **Expected Range:** `≥ 0.0`

### 12. `previous_co2_emission_kg`
- **Data Type:** `FLOAT`
- **Unit:** Kilograms CO₂ ($kg CO_2$)
- **Description:** Recorded CO₂ emission from the prior operational day, serving as a historical baseline.
- **ML Role:** Input Feature ($X_9$)
- **Nullable:** No
- **Expected Range:** `≥ 0.0`

### 13. `actual_co2_emission_kg`
- **Data Type:** `FLOAT`
- **Unit:** Kilograms CO₂ ($kg CO_2$)
- **Description:** Ground truth actual measured CO₂ emission output for the day.
- **ML Role:** Target Variable ($Y$)
- **Nullable:** No
- **Expected Range:** `≥ 0.0`

---

## Validation Summary Table

| Field Name | Type | Unit | ML Role | Range Constraint | Nullable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | N/A | Identifier | `> 0` | No |
| `plant_id` | INTEGER | N/A | Foreign Key | FK → `plants.id` | No |
| `timestamp` | TIMESTAMP | ISO 8601 | Time Index | Unique `(plant_id, timestamp)` | No |
| `electricity_consumption_kwh` | FLOAT | kWh | Feature | `≥ 0` | No |
| `diesel_consumption_liters` | FLOAT | L | Feature | `≥ 0` | No |
| `natural_gas_consumption_m3` | FLOAT | $m^3$ | Feature | `≥ 0` | No |
| `production_quantity` | FLOAT | Units | Feature | `≥ 0` | No |
| `raw_material_consumption_kg` | FLOAT | kg | Feature | `≥ 0` | No |
| `machine_runtime_hours` | FLOAT | Hours | Feature | `0.0` to `24.0` | No |
| `temperature_c` | FLOAT | °C | Feature | Unrestricted | No |
| `pressure_bar` | FLOAT | bar | Feature | `≥ 0` | No |
| `previous_co2_emission_kg` | FLOAT | kg | Feature | `≥ 0` | No |
| **`actual_co2_emission_kg`** | **FLOAT** | **kg** | **Target ($Y$)** | **`≥ 0`** | **No** |
