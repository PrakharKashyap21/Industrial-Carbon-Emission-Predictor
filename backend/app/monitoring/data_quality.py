import os
import json
from typing import List, Dict, Any

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
FEATURE_RANGES_PATH = os.path.join(BASE_DIR, "models", "feature_ranges.json")

# Features that logically cannot be negative
NON_NEGATIVE_FEATURES = [
    "electricity_consumption_kwh",
    "diesel_consumption_liters",
    "natural_gas_consumption_m3",
    "production_quantity",
    "raw_material_consumption_kg",
    "machine_runtime_hours",
    "previous_co2_emission_kg",
]


class DataQualityMonitor:
    """Data Quality Monitoring service checking missing values, invalid values, duplicates, and training range bounds."""

    def __init__(self, ranges_path: str = FEATURE_RANGES_PATH):
        self.ranges_path = ranges_path
        self.feature_bounds = self._load_bounds()

    def _load_bounds(self) -> Dict[str, Any]:
        """Load feature baseline training min/max ranges from models/feature_ranges.json."""
        if os.path.exists(self.ranges_path):
            try:
                with open(self.ranges_path, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def validate_single_record(self, raw_features: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a single incoming prediction request dictionary against training bounds and constraints."""
        missing = []
        invalid = []
        out_of_range = []

        for feature in NON_NEGATIVE_FEATURES:
            val = raw_features.get(feature)
            if val is None:
                missing.append(feature)
            elif isinstance(val, (int, float)) and val < 0:
                invalid.append(f"{feature} cannot be negative ({val})")

        # Range bounds validation
        for feature, bounds in self.feature_bounds.items():
            val = raw_features.get(feature)
            if val is not None and isinstance(val, (int, float)):
                f_min = bounds.get("min")
                f_max = bounds.get("max")
                if f_min is not None and val < f_min:
                    out_of_range.append(f"{feature} ({val}) below training min ({f_min})")
                elif f_max is not None and val > f_max:
                    out_of_range.append(f"{feature} ({val}) exceeds training max ({f_max})")

        is_valid = len(invalid) == 0
        quality_status = "good"
        if missing or out_of_range:
            quality_status = "warning"
        if invalid:
            quality_status = "critical"

        return {
            "is_valid": is_valid,
            "quality_status": quality_status,
            "missing_features": missing,
            "invalid_features": invalid,
            "out_of_range_features": out_of_range,
        }

    def evaluate_readings_batch(self, readings: List[Any]) -> Dict[str, Any]:
        """Evaluate a batch of SQLAlchemy IndustrialReading records for data quality metrics."""
        total_records = len(readings)
        if total_records == 0:
            return {
                "total_records": 0,
                "missing_records": 0,
                "missing_rate_pct": 0.0,
                "invalid_records": 0,
                "duplicate_records": 0,
                "out_of_range_count": 0,
                "quality_status": "good",
                "missing_by_feature": {},
                "invalid_reasons": [],
            }

        missing_count = 0
        invalid_count = 0
        out_of_range_count = 0
        seen_keys = set()
        duplicate_count = 0

        missing_by_feature: Dict[str, int] = {f: 0 for f in NON_NEGATIVE_FEATURES}
        invalid_reasons: List[str] = []

        for r in readings:
            # Check duplicate (plant_id + timestamp + electricity + production)
            ts_str = r.timestamp.isoformat() if r.timestamp else ""
            dup_key = (r.plant_id, ts_str, r.electricity_consumption_kwh, r.production_quantity)
            if dup_key in seen_keys:
                duplicate_count += 1
            else:
                seen_keys.add(dup_key)

            # Check missing & invalid
            has_missing = False
            has_invalid = False
            has_out_of_range = False

            rec_dict = {
                "electricity_consumption_kwh": r.electricity_consumption_kwh,
                "diesel_consumption_liters": r.diesel_consumption_liters,
                "natural_gas_consumption_m3": r.natural_gas_consumption_m3,
                "production_quantity": r.production_quantity,
                "raw_material_consumption_kg": r.raw_material_consumption_kg,
                "machine_runtime_hours": r.machine_runtime_hours,
                "temperature_c": r.temperature_c,
                "pressure_bar": r.pressure_bar,
                "previous_co2_emission_kg": r.previous_co2_emission_kg,
            }

            single_res = self.validate_single_record(rec_dict)

            if single_res["missing_features"]:
                has_missing = True
                for f in single_res["missing_features"]:
                    missing_by_feature[f] += 1

            if single_res["invalid_features"]:
                has_invalid = True
                invalid_reasons.extend(single_res["invalid_features"])

            if single_res["out_of_range_features"]:
                has_out_of_range = True

            if has_missing:
                missing_count += 1
            if has_invalid:
                invalid_count += 1
            if has_out_of_range:
                out_of_range_count += 1

        missing_rate_pct = round((missing_count / total_records) * 100.0, 2)
        invalid_rate_pct = round((invalid_count / total_records) * 100.0, 2)

        # Status logic
        quality_status = "good"
        if missing_rate_pct > 5.0 or duplicate_count > 5 or out_of_range_count > (0.10 * total_records):
            quality_status = "warning"
        if invalid_rate_pct > 1.0:
            quality_status = "critical"

        return {
            "total_records": total_records,
            "missing_records": missing_count,
            "missing_rate_pct": missing_rate_pct,
            "invalid_records": invalid_count,
            "duplicate_records": duplicate_count,
            "out_of_range_count": out_of_range_count,
            "quality_status": quality_status,
            "missing_by_feature": missing_by_feature,
            "invalid_reasons": invalid_reasons[:5],  # top 5 reasons
        }


data_quality_monitor = DataQualityMonitor()
