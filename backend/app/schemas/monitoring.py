from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: int
    plant_id: Optional[int]
    alert_type: str
    severity: str
    feature_name: Optional[str]
    message: str
    status: str
    created_at: str
    resolved_at: Optional[str]


class FeatureDriftItem(BaseModel):
    feature: str
    psi: float
    ks_statistic: float
    p_value: float
    drift_status: str
    statistically_significant: Optional[bool] = None


class MonitoringOverviewResponse(BaseModel):
    snapshot_id: int
    monitoring_date: str
    overall_data_quality: str
    overall_drift_status: str
    overall_performance_status: str
    overall_reliability: str
    active_alerts_count: int
    total_records: Optional[int] = 0
    missing_records: Optional[int] = 0
    invalid_records: Optional[int] = 0
    duplicate_records: Optional[int] = 0
    drift_features: List[FeatureDriftItem] = []
    active_alerts: List[AlertResponse] = []


class DataQualityResponse(BaseModel):
    total_records: int
    missing_records: int
    missing_rate_pct: float
    invalid_records: int
    duplicate_records: int
    out_of_range_count: int
    quality_status: str
    missing_by_feature: Dict[str, int]
    invalid_reasons: List[str]


class DriftResponse(BaseModel):
    overall_drift_status: str
    baseline_version: str
    counts: Optional[Dict[str, int]] = {}
    features: List[FeatureDriftItem]


class PerformanceBaseline(BaseModel):
    version: str
    baseline_mae: float
    baseline_rmse: float
    baseline_mape: float
    baseline_r2: float


class PerformanceResponse(BaseModel):
    overall_performance_status: str
    evaluated_count: int
    current_mae: Optional[float]
    current_rmse: Optional[float]
    current_mape: Optional[float]
    current_r2: Optional[float]
    mean_bias: Optional[float]
    degradation_pct: float
    baseline: PerformanceBaseline


class ReliabilityResponse(BaseModel):
    overall_reliability: str
    reasons: List[str]
