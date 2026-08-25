from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PredictionCreate(BaseModel):
    plant_id: int = Field(..., example=1)
    reading_id: Optional[int] = Field(None, example=10)
    electricity_consumption_kwh: float = Field(..., ge=0)
    diesel_consumption_liters: float = Field(..., ge=0)
    natural_gas_consumption_m3: float = Field(..., ge=0)
    production_quantity: float = Field(..., ge=0)
    raw_material_consumption_kg: float = Field(..., ge=0)
    machine_runtime_hours: float = Field(..., ge=0, le=24)
    temperature_c: float = Field(..., example=25.0)
    pressure_bar: float = Field(..., example=5.0)
    previous_co2_emission_kg: float = Field(..., ge=0)
    reading_timestamp: Optional[str] = Field(None, example="2026-08-15T00:00:00")


class PredictionResponse(BaseModel):
    id: int
    plant_id: int
    reading_id: Optional[int]
    prediction_timestamp: str
    reading_timestamp: Optional[str]
    rf_prediction: float
    xgb_prediction: float
    ensemble_prediction: float
    actual_co2: Optional[float]
    signed_error: Optional[float]
    absolute_error: Optional[float]
    percentage_error: Optional[float]
    model_version: str
    model_type: str
    feature_pipeline_version: str
    prediction_horizon: str
    status: str
    created_at: str


class PaginationMetadata(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class PredictionPaginationResponse(BaseModel):
    items: List[PredictionResponse]
    pagination: PaginationMetadata


class ActualUpdateRequest(BaseModel):
    actual_co2: float = Field(..., ge=0, description="Actual recorded CO₂ emission in kg")


class PredictionAnalyticsResponse(BaseModel):
    total_predictions: int
    evaluated_count: int
    pending_count: int
    mae: Optional[float]
    rmse: Optional[float]
    mape: Optional[float]
    r2: Optional[float]
    mean_bias: Optional[float]
    model_comparison: List[Dict[str, Any]]
    scatter_points: List[Dict[str, Any]]
