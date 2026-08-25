from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PlantMetadata(BaseModel):
    id: int
    name: str
    location: str
    industry_type: str


class KPISummary(BaseModel):
    latest_actual_co2_kg: float
    latest_predicted_co2_kg: float
    period_avg_actual_co2_kg: float
    period_total_actual_co2_kg: float
    period_avg_production: float
    period_total_production: float
    co2_intensity: Optional[float]
    electricity_avg_kwh: float
    diesel_avg_liters: float
    natural_gas_avg_m3: float
    machine_runtime_avg_hours: float
    co2_trend_pct: Optional[float]
    production_trend_pct: Optional[float]
    electricity_trend_pct: Optional[float]


class TrendPoint(BaseModel):
    timestamp: str
    actual_co2_kg: float
    predicted_co2_kg: float
    prediction_error_kg: float
    production_quantity: float
    electricity_kwh: float
    diesel_liters: float
    natural_gas_m3: float
    machine_runtime_hours: float
    co2_intensity: Optional[float]
    moving_avg_7d_co2_kg: Optional[float] = None


class ModelMetadata(BaseModel):
    name: str
    version: str
    weights: str
    test_metrics: Dict[str, float]


class DataQualitySummary(BaseModel):
    total_readings: int
    period_readings: int
    missing_values_pct: float
    latest_timestamp: str
    days_filtered: int


class DashboardOverviewResponse(BaseModel):
    plant: PlantMetadata
    kpis: KPISummary
    trends: List[TrendPoint]
    model: ModelMetadata
    shap_drivers: List[Dict[str, Any]]
    data_quality: DataQualitySummary
