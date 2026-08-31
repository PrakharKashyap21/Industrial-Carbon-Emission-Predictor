from typing import List, Dict, Any


class KPIEngine:
    """Calculates core industrial Key Performance Indicators (KPIs) from historical operational data."""

    def calculate_kpis(self, readings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute aggregated operational KPIs."""
        if not readings:
            return {
                "total_co2": 0.0,
                "average_co2": 0.0,
                "min_co2": 0.0,
                "max_co2": 0.0,
                "total_production": 0.0,
                "average_production": 0.0,
                "emission_intensity": 0.0,
                "average_electricity_kwh": 0.0,
                "average_diesel_liters": 0.0,
                "average_runtime_hours": 0.0,
                "observation_count": 0,
            }

        count = len(readings)

        # Extract CO2 values (ensemble prediction or actual)
        co2_vals = [float(r.get("co2_emission_kg") or r.get("ensemble_prediction") or r.get("predicted_co2") or 0.0) for r in readings]
        prod_vals = [float(r.get("production_quantity", 0.0)) for r in readings]
        elec_vals = [float(r.get("electricity_consumption_kwh", 0.0)) for r in readings]
        fuel_vals = [float(r.get("diesel_consumption_liters", 0.0)) for r in readings]
        runtime_vals = [float(r.get("machine_runtime_hours", 0.0)) for r in readings]

        tot_co2 = sum(co2_vals)
        tot_prod = sum(prod_vals)

        avg_co2 = tot_co2 / count if count > 0 else 0.0
        avg_prod = tot_prod / count if count > 0 else 0.0

        intensity = (tot_co2 / tot_prod) if tot_prod > 0 else 0.0

        # Calculate Trend Direction (First half vs Second half)
        trend_direction = "STABLE"
        if count >= 4:
            mid = count // 2
            first_half_avg = sum(co2_vals[:mid]) / mid
            second_half_avg = sum(co2_vals[mid:]) / (count - mid)
            if first_half_avg > 0:
                pct_diff = ((second_half_avg - first_half_avg) / first_half_avg) * 100.0
                if pct_diff > 2.0:
                    trend_direction = "INCREASING"
                elif pct_diff < -2.0:
                    trend_direction = "DECREASING"

        data_coverage = f"Data available for {count} observations"

        return {
            "total_co2": round(tot_co2, 2),
            "average_co2": round(avg_co2, 2),
            "min_co2": round(min(co2_vals), 2) if co2_vals else 0.0,
            "max_co2": round(max(co2_vals), 2) if co2_vals else 0.0,
            "total_production": round(tot_prod, 2),
            "average_production": round(avg_prod, 2),
            "emission_intensity": round(intensity, 4),
            "average_electricity_kwh": round(sum(elec_vals) / count, 2) if count > 0 else 0.0,
            "average_diesel_liters": round(sum(fuel_vals) / count, 2) if count > 0 else 0.0,
            "average_runtime_hours": round(sum(runtime_vals) / count, 2) if count > 0 else 0.0,
            "observation_count": count,
            "trend_direction": trend_direction,
            "data_coverage": data_coverage,
        }


kpi_engine = KPIEngine()
