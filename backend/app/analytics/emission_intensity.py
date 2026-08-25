from typing import List, Dict, Any


class EmissionIntensityEngine:
    """Calculates production-normalized emission intensity (kg CO₂ / unit) and Period-over-Period efficiency metrics."""

    def calculate_emission_intensity(
        self,
        current_readings: List[Dict[str, Any]],
        previous_readings: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Compute production-normalized emission intensity and MoM percentage changes."""
        curr_co2 = sum(float(r.get("co2_emission_kg") or r.get("ensemble_prediction") or 0.0) for r in current_readings)
        curr_prod = sum(float(r.get("production_quantity", 0.0)) for r in current_readings)

        curr_intensity = (curr_co2 / curr_prod) if curr_prod > 0 else 0.0

        prev_co2 = sum(float(r.get("co2_emission_kg") or r.get("ensemble_prediction") or 0.0) for r in (previous_readings or []))
        prev_prod = sum(float(r.get("production_quantity", 0.0)) for r in (previous_readings or []))

        prev_intensity = (prev_co2 / prev_prod) if prev_prod > 0 else 0.0

        co2_change_pct = (((curr_co2 - prev_co2) / prev_co2) * 100.0) if prev_co2 > 0 else 0.0
        prod_change_pct = (((curr_prod - prev_prod) / prev_prod) * 100.0) if prev_prod > 0 else 0.0
        intensity_change_pct = (((curr_intensity - prev_intensity) / prev_intensity) * 100.0) if prev_intensity > 0 else 0.0

        interpretation = "Stable efficiency"
        if intensity_change_pct < -2.0:
            interpretation = "Efficiency improved (lower CO₂ per production unit)"
        elif intensity_change_pct > +2.0:
            interpretation = "Efficiency degraded (higher CO₂ per production unit)"

        return {
            "total_co2": round(curr_co2, 2),
            "total_production": round(curr_prod, 2),
            "emission_intensity": round(curr_intensity, 4),
            "previous_total_co2": round(prev_co2, 2),
            "previous_total_production": round(prev_prod, 2),
            "previous_emission_intensity": round(prev_intensity, 4),
            "co2_change_percentage": round(co2_change_pct, 2),
            "production_change_percentage": round(prod_change_pct, 2),
            "intensity_change_percentage": round(intensity_change_pct, 2),
            "interpretation": interpretation,
        }


emission_intensity_engine = EmissionIntensityEngine()
