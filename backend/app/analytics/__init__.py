"""Analytics package."""
from app.analytics.intensity_analysis import calculate_co2_intensity
from app.analytics.trend_analysis import calculate_trend_percentage, compute_7day_moving_average
from app.analytics.emission_analytics import aggregate_reading_metrics

__all__ = [
    "calculate_co2_intensity",
    "calculate_trend_percentage",
    "compute_7day_moving_average",
    "aggregate_reading_metrics",
]
