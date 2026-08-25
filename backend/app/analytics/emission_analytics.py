from typing import List, Dict, Any
import numpy as np
from app.analytics.intensity_analysis import calculate_co2_intensity
from app.analytics.trend_analysis import calculate_trend_percentage


def aggregate_reading_metrics(readings: List[Any]) -> Dict[str, Any]:
    """Calculate summary statistics across a list of IndustrialReading model instances."""
    if not readings:
        return {
            "total_readings": 0,
            "actual_co2_total": 0.0,
            "actual_co2_avg": 0.0,
            "production_total": 0.0,
            "production_avg": 0.0,
            "electricity_total": 0.0,
            "electricity_avg": 0.0,
            "diesel_total": 0.0,
            "diesel_avg": 0.0,
            "gas_total": 0.0,
            "gas_avg": 0.0,
            "runtime_avg": 0.0,
            "co2_intensity": None,
        }

    co2_vals = [r.actual_co2_emission_kg for r in readings if r.actual_co2_emission_kg is not None]
    prod_vals = [r.production_quantity for r in readings if r.production_quantity is not None]
    elec_vals = [r.electricity_consumption_kwh for r in readings if r.electricity_consumption_kwh is not None]
    diesel_vals = [r.diesel_consumption_liters for r in readings if r.diesel_consumption_liters is not None]
    gas_vals = [r.natural_gas_consumption_m3 for r in readings if r.natural_gas_consumption_m3 is not None]
    runtime_vals = [r.machine_runtime_hours for r in readings if r.machine_runtime_hours is not None]

    co2_avg = float(np.mean(co2_vals)) if co2_vals else 0.0
    prod_avg = float(np.mean(prod_vals)) if prod_vals else 0.0
    elec_avg = float(np.mean(elec_vals)) if elec_vals else 0.0
    diesel_avg = float(np.mean(diesel_vals)) if diesel_vals else 0.0
    gas_avg = float(np.mean(gas_vals)) if gas_vals else 0.0
    runtime_avg = float(np.mean(runtime_vals)) if runtime_vals else 0.0

    co2_total = float(np.sum(co2_vals)) if co2_vals else 0.0
    prod_total = float(np.sum(prod_vals)) if prod_vals else 0.0

    intensity = calculate_co2_intensity(co2_avg, prod_avg)

    return {
        "total_readings": len(readings),
        "actual_co2_total": round(co2_total, 2),
        "actual_co2_avg": round(co2_avg, 2),
        "production_total": round(prod_total, 2),
        "production_avg": round(prod_avg, 2),
        "electricity_total": round(float(np.sum(elec_vals)), 2) if elec_vals else 0.0,
        "electricity_avg": round(elec_avg, 2),
        "diesel_total": round(float(np.sum(diesel_vals)), 2) if diesel_vals else 0.0,
        "diesel_avg": round(diesel_avg, 2),
        "gas_total": round(float(np.sum(gas_vals)), 2) if gas_vals else 0.0,
        "gas_avg": round(gas_avg, 2),
        "runtime_avg": round(runtime_avg, 2),
        "co2_intensity": intensity,
    }
