from typing import Dict, Any

FEATURE_METADATA: Dict[str, Dict[str, str]] = {
    "electricity_consumption_kwh": {
        "display_name": "Electricity Consumption",
        "unit": "kWh",
        "description": "Total electrical energy consumed by plant equipment over 24 hours.",
    },
    "diesel_consumption_liters": {
        "display_name": "Diesel Fuel Consumption",
        "unit": "Liters",
        "description": "Diesel fuel consumed by generators, boilers, and heavy machinery.",
    },
    "natural_gas_consumption_m3": {
        "display_name": "Natural Gas Consumption",
        "unit": "m³",
        "description": "Natural gas combusted for industrial thermal heating and furnaces.",
    },
    "production_quantity": {
        "display_name": "Production Output",
        "unit": "Units",
        "description": "Volume of finished goods output produced during the day.",
    },
    "raw_material_consumption_kg": {
        "display_name": "Raw Material Consumption",
        "unit": "kg",
        "description": "Mass of raw materials processed in production lines.",
    },
    "machine_runtime_hours": {
        "display_name": "Machine Operating Runtime",
        "unit": "Hours",
        "description": "Cumulative active operating hours of major plant equipment.",
    },
    "temperature_c": {
        "display_name": "Operating Temperature",
        "unit": "°C",
        "description": "Average ambient or process operating temperature.",
    },
    "pressure_bar": {
        "display_name": "Operating Pressure",
        "unit": "bar",
        "description": "Average operational pressure in boilers and pneumatic lines.",
    },
    "previous_co2_emission_kg": {
        "display_name": "Prior Day Baseline CO₂",
        "unit": "kg CO₂",
        "description": "CO₂ emission baseline recorded from the prior operational day.",
    },
    "energy_intensity": {
        "display_name": "Energy Intensity",
        "unit": "kWh / Unit",
        "description": "Electrical energy consumed per unit of finished production output.",
    },
    "fuel_intensity": {
        "display_name": "Fuel Intensity",
        "unit": "L / Unit",
        "description": "Diesel fuel consumed per unit of finished production output.",
    },
    "gas_intensity": {
        "display_name": "Natural Gas Intensity",
        "unit": "m³ / Unit",
        "description": "Natural gas consumed per unit of finished production output.",
    },
    "raw_material_intensity": {
        "display_name": "Raw Material Intensity",
        "unit": "kg / Unit",
        "description": "Raw material mass processed per unit of finished production output.",
    },
    "machine_utilization": {
        "display_name": "Machine Utilization Ratio",
        "unit": "Ratio",
        "description": "Fraction of day active machine operation (machine_runtime / 24.0).",
    },
    "day": {
        "display_name": "Day of Month",
        "unit": "Day",
        "description": "Day of calendar month (1-31).",
    },
    "month": {
        "display_name": "Month of Year",
        "unit": "Month",
        "description": "Calendar month index (1-12).",
    },
    "quarter": {
        "display_name": "Calendar Quarter",
        "unit": "Quarter",
        "description": "Fiscal calendar quarter (1-4).",
    },
    "day_of_week": {
        "display_name": "Day of Week",
        "unit": "Weekday",
        "description": "Index representing day of the week (0 = Monday, 6 = Sunday).",
    },
    "plant_id": {
        "display_name": "Plant Facility Code",
        "unit": "ID",
        "description": "Unique industrial facility identifier.",
    },
}


def get_feature_metadata(feature_name: str) -> Dict[str, str]:
    """Retrieve display metadata for a given feature name with fallback defaults."""
    return FEATURE_METADATA.get(
        feature_name,
        {
            "display_name": feature_name.replace("_", " ").title(),
            "unit": "Value",
            "description": f"Feature {feature_name}",
        },
    )
