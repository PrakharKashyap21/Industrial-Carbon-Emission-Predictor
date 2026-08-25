from typing import Optional


def calculate_co2_intensity(co2_emission_kg: float, production_quantity: float) -> Optional[float]:
    """Calculate CO₂ emission intensity (kg CO₂ / Production Unit) safely.
    
    Args:
        co2_emission_kg (float): Actual or predicted CO₂ emission in kg.
        production_quantity (float): Finished production output volume.
        
    Returns:
        Optional[float]: Intensity rounded to 2 decimal places, or None if production is zero.
    """
    if production_quantity is None or production_quantity <= 0:
        return None
    return float(round(co2_emission_kg / production_quantity, 2))
