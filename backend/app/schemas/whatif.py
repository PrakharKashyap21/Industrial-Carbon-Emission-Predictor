from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ScenarioItem(BaseModel):
    name: str = Field(..., example="Energy Optimization")
    scenario_id: Optional[str] = Field(None, example="SCN-0001")
    changes: Dict[str, float] = Field(..., example={"electricity_consumption_kwh": -10.0})
    change_type: Optional[str] = Field("percentage", example="percentage")


class ScenarioPredictRequest(BaseModel):
    baseline_id: Optional[int] = Field(None, example=1)
    plant_id: Optional[int] = Field(1, example=1)
    scenario_name: Optional[str] = Field("Custom Scenario", example="Energy Optimization -10%")
    scenario_id: Optional[str] = Field("SCN-0001", example="SCN-0001")
    changes: Dict[str, float] = Field(..., example={"electricity_consumption_kwh": -10.0})
    change_type: Optional[str] = Field("percentage", example="percentage")
    constraints: Optional[Dict[str, Any]] = None


class ScenarioCompareRequest(BaseModel):
    baseline_id: Optional[int] = Field(None, example=1)
    plant_id: Optional[int] = Field(1, example=1)
    scenarios: List[ScenarioItem]
    constraints: Optional[Dict[str, Any]] = None


class SensitivityRequest(BaseModel):
    baseline_id: Optional[int] = Field(None, example=1)
    plant_id: Optional[int] = Field(1, example=1)
    feature: str = Field("electricity_consumption_kwh", example="electricity_consumption_kwh")
    changes: Optional[List[float]] = Field([-20.0, -15.0, -10.0, -5.0, 0.0, 5.0, 10.0])


class ScenarioResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    baseline_id: Optional[int]
    plant_id: int
    baseline_prediction: float
    rf_prediction: float
    xgb_prediction: float
    ensemble_prediction: float
    co2_change: float
    co2_change_percentage: float
    interpretation: str
    reliability_status: str
    reliability_reasons: List[str]
    feasible: bool
    violations: List[str]
    scenario_inputs: Dict[str, Any]
    baseline_inputs: Dict[str, Any]
    shap_explanation: Optional[Dict[str, Any]] = None


class RecommendationSummary(BaseModel):
    recommended_scenario_id: Optional[str]
    recommended_scenario_name: Optional[str]
    estimated_co2_kg: Optional[float]
    co2_change_kg: Optional[float]
    co2_change_percentage: Optional[float]
    reliability_status: Optional[str]
    feasible: Optional[bool]
    recommendation_reasons: List[str]


class ScenarioCompareResponse(BaseModel):
    baseline_id: Optional[int]
    plant_id: Optional[int]
    baseline_prediction: float
    total_scenarios: int
    scenarios: List[Dict[str, Any]]
    recommendation: Optional[RecommendationSummary] = None


class SensitivityPoint(BaseModel):
    change_percentage: float
    input_value: Optional[float]
    predicted_co2: float
    co2_change: float
    co2_change_percentage: float
    reliability_status: str


class SensitivityResponse(BaseModel):
    baseline_id: Optional[int]
    feature: str
    baseline_prediction: float
    points: List[SensitivityPoint]
