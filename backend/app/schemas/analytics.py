from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class KPIOverviewResponse(BaseModel):
    total_co2: float
    average_co2: float
    min_co2: float
    max_co2: float
    total_production: float
    average_production: float
    emission_intensity: float
    average_electricity_kwh: float
    average_diesel_liters: float
    average_runtime_hours: float
    observation_count: int


class EmissionIntensityResponse(BaseModel):
    total_co2: float
    total_production: float
    emission_intensity: float
    previous_total_co2: float
    previous_total_production: float
    previous_emission_intensity: float
    co2_change_percentage: float
    production_change_percentage: float
    intensity_change_percentage: float
    interpretation: str


class TrendPoint(BaseModel):
    date: str
    co2: float
    production: float
    emission_intensity: float
    observation_count: int


class FeatureCorrelationItem(BaseModel):
    feature_key: str
    display_name: str
    correlation_with_co2: float


class FeatureAnalysisResponse(BaseModel):
    correlations: List[FeatureCorrelationItem]
    feature_count: int


class AnomalyTimelineItem(BaseModel):
    alert_id: Optional[int]
    date: str
    event_type: str
    alert_type: str
    severity: str
    message: str
    feature_name: Optional[str] = None


class AnomalyAnalyticsResponse(BaseModel):
    total_anomalies: int
    warning_count: int
    critical_count: int
    timeline: List[AnomalyTimelineItem]


class OptimizationImpactItem(BaseModel):
    optimization_id: Optional[str]
    date: str
    baseline_prediction: float
    recommended_co2: float
    estimated_reduction_kg: float
    estimated_reduction_percentage: float


class OptimizationImpactResponse(BaseModel):
    total_runs: int
    cumulative_estimated_saving_kg: float
    average_reduction_percentage: float
    best_run_saving_kg: float
    history: List[OptimizationImpactItem]


class IndustrialInsightItem(BaseModel):
    insight_type: str
    severity: str
    title: str
    description: str
    metric_name: Optional[str] = None
    metric_value: Optional[float] = None
    reference_period: Optional[str] = None
