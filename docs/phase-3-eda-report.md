# Phase 3: Exploratory Data Analysis & Feature Engineering Report

## Executive Summary
This report documents the Exploratory Data Analysis (EDA), data quality verification, feature engineering, and reproducible preprocessing pipeline implemented in **Phase 3** of the **Industrial Carbon Emission Prediction System**.

---

## 1. Dataset Overview & Data Quality

### Raw Dataset Statistics
- **Total Records:** 125 daily industrial operational observations
- **Raw Features:** 13 columns (11 numerical measurements, 1 timestamp, 1 surrogate ID)
- **Facilities:** 5 distinct industrial plants across 5 industry sectors (Steel, Cement, Chemical, Textile, Food Processing)
- **Time Range:** January 1, 2026 – January 25, 2026 (Daily resolution)

### Data Quality Findings
| Metric | Result | Handling Strategy |
| :--- | :--- | :--- |
| **Missing Values** | 0 missing | Plant-aware median imputation configured for future streaming data |
| **Exact Duplicates** | 0 duplicates | Dropped automatically if detected |
| **Composite Duplicates (`plant_id`, `timestamp`)** | 0 duplicates | Retain last valid observation |
| **Physical Range Violations** | 0 violations | Replace negative values / runtime > 24 with NaN, then impute |
| **Extreme Values / Outliers** | Legitimate industrial peaks | Preserved without truncation to capture peak emission dynamics |

---

## 2. Descriptive Statistics Summary

| Feature Name | Unit | Min | Mean | Median | Max | Std Dev |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `electricity_consumption_kwh` | kWh | 4,203.1 | 13,382.5 | 13,852.1 | 24,195.8 | 6,015.4 |
| `diesel_consumption_liters` | Liters | 189.4 | 693.8 | 711.2 | 1,324.5 | 341.2 |
| `natural_gas_consumption_m3` | $m^3$ | 792.1 | 2,528.4 | 2,752.0 | 4,501.2 | 1,180.5 |
| `production_quantity` | Units | 800.6 | 2,476.1 | 2,125.4 | 4,498.1 | 1,128.9 |
| `raw_material_consumption_kg` | kg | 1,642.1 | 5,521.8 | 5,310.2 | 10,241.0 | 2,684.5 |
| `machine_runtime_hours` | Hours | 14.0 | 18.7 | 18.8 | 23.4 | 2.5 |
| `temperature_c` | °C | 18.1 | 30.2 | 30.1 | 41.9 | 6.8 |
| `pressure_bar` | bar | 4.52 | 7.15 | 7.18 | 9.78 | 1.52 |
| `previous_co2_emission_kg` | kg CO₂ | 2,118.4 | 6,852.1 | 6,420.5 | 13,105.2 | 3,380.1 |
| **`actual_co2_emission_kg` (Target)** | **kg CO₂** | **2,105.2** | **6,864.3** | **6,418.0** | **13,150.0** | **3,392.4** |

---

## 3. Correlation Analysis & Feature Relationships

### Primary Correlations with Target (`actual_co2_emission_kg`)
- **`electricity_consumption_kwh` ($r = 0.94$):** Strongest linear predictor of daily industrial emissions.
- **`natural_gas_consumption_m3` ($r = 0.92$):** High correlation due to direct thermal combustion emissions.
- **`diesel_consumption_liters` ($r = 0.91$):** Direct fuel combustion contributor.
- **`production_quantity` ($r = 0.88$):** Direct relationship with total plant output.
- **`previous_co2_emission_kg` ($r = 0.98$):** Serves as an excellent temporal baseline.

### Plant-Level Emission Profiles
1. **P001 (Apex Steel Works - Steel):** Highest mean emission (~11,800 kg CO₂/day).
2. **P002 (Titan Cement Plant - Cement):** Second highest (~10,200 kg CO₂/day).
3. **P003 (SynthoChem Industries - Chemical):** Moderate emissions (~6,100 kg CO₂/day).
4. **P004 (Vanguard Textile Mill - Textile):** Lower emissions (~4,800 kg CO₂/day).
5. **P005 (NutriFood Processing Ltd - Food):** Lowest emissions (~2,200 kg CO₂/day).

---

## 4. Feature Engineering

Nine new domain-specific features were engineered:

1. **`energy_intensity` ($kWh/unit$):** Electricity consumption per unit production (Division by zero protected via `np.nan` replacement and median fallback).
2. **`fuel_intensity` ($L/unit$):** Diesel consumption per unit production.
3. **`gas_intensity` ($m^3/unit$):** Natural gas consumption per unit production.
4. **`raw_material_intensity` ($kg/unit$):** Raw material consumed per unit production.
5. **`machine_utilization` ($ratio$):** `machine_runtime_hours / 24.0` (Bounded between 0.0 and 1.0).
6. **`day` (1-31):** Day of month extracted from timestamp.
7. **`month` (1-12):** Month extracted from timestamp.
8. **`quarter` (1-4):** Calendar quarter.
9. **`day_of_week` (0-6):** Day of week index.

---

## 5. Data Leakage Prevention Rules

To guarantee strict machine learning integrity:
- `actual_co2_emission_kg` is designated **EXCLUSIVELY as target $y$**.
- `actual_co2_emission_kg` and target-derived features (such as `co2_change_from_previous`) are **STRICTLY EXCLUDED** from input feature matrix $X$.
- An automated runtime assertion `verify_no_target_leakage(X)` raises an unhandled `ValueError` if any target leakage occurs.

---

## 6. Chronological Dataset Split

To prevent temporal leakage in industrial time-series data, datasets were split chronologically without random shuffling:

- **Training Set (70%):** 87 records (Jan 1, 2026 – Jan 18, 2026)
- **Validation Set (15%):** 18 records (Jan 18, 2026 – Jan 21, 2026)
- **Testing Set (15%):** 20 records (Jan 21, 2026 – Jan 25, 2026)

All processed CSV artifacts were exported to `data/processed/`:
- `X_train.csv` (87 rows x 19 features)
- `X_validation.csv` (18 rows x 19 features)
- `X_test.csv` (20 rows x 19 features)
- `y_train.csv`, `y_validation.csv`, `y_test.csv`
- `industrial_emissions_processed.csv` (Full cleaned dataset)
