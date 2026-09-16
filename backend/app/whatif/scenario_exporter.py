"""
What-If Sensitivity Analysis Exporter Module.

Converts model-calculated sensitivity response structures into normalized tabular
data and standard CSV file streams for executive reporting, data auditing, and exports.
"""

import csv
import io
from typing import Dict, Any, List, Optional, Union

FEATURE_DISPLAY_NAMES: Dict[str, str] = {
    "electricity_consumption_kwh": "Electricity Consumption (kWh)",
    "diesel_consumption_liters": "Diesel Fuel Consumption (Liters)",
    "natural_gas_consumption_m3": "Natural Gas Consumption (m³)",
    "machine_runtime_hours": "Machine Runtime (Hours)",
    "production_quantity": "Production Quantity (Units)",
    "raw_material_consumption_kg": "Raw Material Usage (kg)",
    "temperature_c": "Operating Temperature (°C)",
    "pressure_bar": "Operating Pressure (bar)",
    "previous_co2_emission_kg": "Prior Period Baseline CO₂ (kg)",
}

CSV_FIELD_NAMES: List[str] = [
    "Feature Key",
    "Feature Label",
    "Variation Percentage (%)",
    "Input Value",
    "Predicted CO2 (kg)",
    "Baseline Prediction (kg)",
    "CO2 Change (kg)",
    "CO2 Change (%)",
    "Reliability Status",
]


class SensitivityExportError(ValueError):
    """Custom exception raised when sensitivity data for export is invalid or malformed."""
    pass


class ScenarioExporter:
    """Exporter utility processing What-if sensitivity data structures into CSV streams."""

    @staticmethod
    def get_feature_label(feature_key: str) -> str:
        """Return formatted human-readable display label for a feature key."""
        if not feature_key or not isinstance(feature_key, str):
            return "Unknown Feature"
        return FEATURE_DISPLAY_NAMES.get(feature_key, feature_key.replace("_", " ").title())

    @classmethod
    def validate_sensitivity_data(cls, data: Dict[str, Any]) -> None:
        """
        Validate the structure and presence of required fields in sensitivity result payload.
        
        Raises:
            SensitivityExportError: If data is not a dictionary or missing essential keys.
        """
        if not isinstance(data, dict):
            raise SensitivityExportError(f"Expected sensitivity result dictionary, got {type(data).__name__}.")

        if "points" not in data:
            raise SensitivityExportError("Missing required 'points' list in sensitivity result payload.")

        if not isinstance(data.get("points"), list):
            raise SensitivityExportError(f"Expected 'points' to be a list, got {type(data.get('points')).__name__}.")

    @classmethod
    def normalize_sensitivity_points(cls, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Convert sensitivity payload into a list of normalized tabular row dictionaries.
        
        Args:
            data: Raw sensitivity result payload dictionary.
            
        Returns:
            List of normalized dictionary rows matching CSV_FIELD_NAMES.
        """
        cls.validate_sensitivity_data(data)

        feature_key = str(data.get("feature", "unknown_feature"))
        feature_label = cls.get_feature_label(feature_key)
        
        raw_baseline = data.get("baseline_prediction", 0.0)
        try:
            baseline_pred = float(raw_baseline) if raw_baseline is not None else 0.0
        except (ValueError, TypeError):
            baseline_pred = 0.0

        raw_points = data.get("points", [])
        normalized_rows: List[Dict[str, Any]] = []

        for pt in raw_points:
            if not isinstance(pt, dict):
                continue

            try:
                change_pct = float(pt.get("change_percentage", 0.0))
            except (ValueError, TypeError):
                change_pct = 0.0

            input_val = pt.get("input_value")
            try:
                input_val_num = float(input_val) if input_val is not None else None
            except (ValueError, TypeError):
                input_val_num = None

            try:
                pred_co2 = float(pt.get("predicted_co2", 0.0))
            except (ValueError, TypeError):
                pred_co2 = 0.0

            # Calculate or extract absolute CO2 change
            if "co2_change" in pt and pt["co2_change"] is not None:
                try:
                    co2_change = float(pt["co2_change"])
                except (ValueError, TypeError):
                    co2_change = round(pred_co2 - baseline_pred, 2)
            else:
                co2_change = round(pred_co2 - baseline_pred, 2)

            # Calculate or extract percentage change
            if "co2_change_percentage" in pt and pt["co2_change_percentage"] is not None:
                try:
                    co2_change_pct = float(pt["co2_change_percentage"])
                except (ValueError, TypeError):
                    co2_change_pct = round((co2_change / baseline_pred * 100.0), 2) if baseline_pred > 0 else 0.0
            else:
                co2_change_pct = round((co2_change / baseline_pred * 100.0), 2) if baseline_pred > 0 else 0.0

            rel_status = str(pt.get("reliability_status", "HIGH"))

            row = {
                "Feature Key": feature_key,
                "Feature Label": feature_label,
                "Variation Percentage (%)": round(change_pct, 2),
                "Input Value": round(input_val_num, 2) if input_val_num is not None else "N/A",
                "Predicted CO2 (kg)": round(pred_co2, 2),
                "Baseline Prediction (kg)": round(baseline_pred, 2),
                "CO2 Change (kg)": round(co2_change, 2),
                "CO2 Change (%)": round(co2_change_pct, 2),
                "Reliability Status": rel_status,
            }
            normalized_rows.append(row)

        return normalized_rows

    @classmethod
    def export_to_csv_string(cls, data: Dict[str, Any]) -> str:
        """
        Serialize sensitivity analysis result into a formatted CSV text string.
        
        Args:
            data: Sensitivity result payload.
            
        Returns:
            CSV formatted string with standard header and data rows.
        """
        rows = cls.normalize_sensitivity_points(data)
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=CSV_FIELD_NAMES, lineterminator="\n")
        writer.writeheader()
        
        for row in rows:
            writer.writerow(row)
            
        return output.getvalue()


scenario_exporter = ScenarioExporter()
