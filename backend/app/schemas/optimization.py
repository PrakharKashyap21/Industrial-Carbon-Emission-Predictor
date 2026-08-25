from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class OptimizationConstraints(BaseModel):
    minimum_production: Optional[float] = Field(5000.0, example=5000.0)
    max_electricity_reduction: Optional[float] = Field(20.0, example=20.0)
    max_fuel_reduction: Optional[float] = Field(20.0, example=20.0)
    max_runtime_reduction: Optional[float] = Field(15.0, example=15.0)


class OptimizationSearchParameters(BaseModel):
    electricity_step: Optional[float] = Field(5.0, example=5.0)
    fuel_step: Optional[float] = Field(5.0, example=5.0)
    runtime_step: Optional[float] = Field(5.0, example=5.0)


class OptimizationRunRequest(BaseModel):
    baseline_id: Optional[int] = Field(None, example=1)
    plant_id: Optional[int] = Field(1, example=1)
    constraints: Optional[OptimizationConstraints] = Field(default_factory=OptimizationConstraints)
    search: Optional[OptimizationSearchParameters] = Field(default_factory=OptimizationSearchParameters)


class RecommendedScenarioSummary(BaseModel):
    recommended_candidate_id: Optional[str]
    recommended_changes: Dict[str, float]
    recommended_inputs: Dict[str, Any]
    baseline_prediction: float
    predicted_co2: float
    estimated_reduction_kg: float
    estimated_reduction_percentage: float
    co2_change: float
    co2_change_percentage: float
    reliability_status: str
    feasible: bool
    recommendation_reasons: List[str]
    shap_explanation: Optional[Dict[str, Any]] = None


class OptimizationRunResponse(BaseModel):
    optimization_id: str
    plant_id: int
    baseline_id: Optional[int]
    baseline_prediction: float
    candidates_generated: int
    candidates_evaluated: int
    candidates_rejected: int
    recommended_candidate: Optional[RecommendedScenarioSummary] = None
    top_candidates: List[Dict[str, Any]]


class OptimizationHistoryItem(BaseModel):
    optimization_id: str
    plant_id: int
    baseline_id: Optional[int]
    baseline_prediction: float
    candidates_generated: int
    candidates_evaluated: int
    candidates_rejected: int
    recommended_candidate_id: Optional[str]
    model_version: str
    created_at: str


class OptimizationCandidateResponse(BaseModel):
    candidate_id: str
    rf_prediction: float
    xgb_prediction: float
    ensemble_prediction: float
    co2_change: float
    co2_change_percentage: float
    reliability_status: str
    feasible: bool
    rejection_reason: Optional[str] = None
    change_values: Dict[str, float]
    input_values: Dict[str, Any]
