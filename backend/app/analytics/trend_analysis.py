from typing import List, Dict, Any, Optional
from collections import defaultdict


def calculate_trend_percentage(current_val: float, previous_val: float) -> Optional[float]:
    """Calculate percentage change between current and previous values."""
    if previous_val is None or previous_val <= 0:
        return None
    return float(round(((current_val - previous_val) / previous_val) * 100.0, 2))


def compute_7day_moving_average(values: List[float], window: int = 7) -> List[float]:
    """Compute N-day rolling moving average for a series of values."""
    if not values:
        return []
    result = []
    win_list = []
    for val in values:
        win_list.append(val)
        if len(win_list) > window:
            win_list.pop(0)
        result.append(float(round(sum(win_list) / len(win_list), 2)))
    return result


class TrendAnalysisEngine:
    """Aggregates time-series operational data into daily, weekly, or monthly trend data points."""

    def aggregate_trends(
        self,
        readings: List[Dict[str, Any]],
        granularity: str = "daily",
    ) -> List[Dict[str, Any]]:
        """Aggregate emissions and production by date string key."""
        if not readings:
            return []

        buckets = defaultdict(lambda: {"co2": 0.0, "production": 0.0, "count": 0, "intensity": 0.0})

        for r in readings:
            ts_str = str(r.get("timestamp") or r.get("reading_timestamp") or "2026-08-01")
            date_key = ts_str.split("T")[0] if "T" in ts_str else ts_str.split(" ")[0]

            co2 = float(r.get("co2_emission_kg") or r.get("ensemble_prediction") or 0.0)
            prod = float(r.get("production_quantity", 0.0))

            buckets[date_key]["co2"] += co2
            buckets[date_key]["production"] += prod
            buckets[date_key]["count"] += 1

        trend_points = []
        for date_key in sorted(buckets.keys()):
            b = buckets[date_key]
            tot_co2 = round(b["co2"], 2)
            tot_prod = round(b["production"], 2)
            intensity = round(tot_co2 / tot_prod, 4) if tot_prod > 0 else 0.0

            trend_points.append({
                "date": date_key,
                "co2": tot_co2,
                "production": tot_prod,
                "emission_intensity": intensity,
                "observation_count": b["count"],
            })

        return trend_points


trend_analysis_engine = TrendAnalysisEngine()
