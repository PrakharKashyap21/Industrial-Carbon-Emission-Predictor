from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator


class ScenarioInputs(BaseModel):
    plant_id: int = Field(default=1, gt=0, description="Industrial plant ID")
    electricity_consumption_kwh: float = Field(..., ge=0.0, description="Electrical energy consumed (kWh)")
    diesel_consumption_liters: float = Field(..., ge=0.0, description="Diesel fuel consumed (Liters)")
    natural_gas_consumption_m3: float = Field(..., ge=0.0, description="Natural gas volume combusted (m³)")

    production_quantity: float = Field(..., ge=0.0, description="Finished goods output volume")
    raw_material_consumption_kg: float = Field(..., ge=0.0, description="Mass of raw materials processed (kg)")

    machine_runtime_hours: float = Field(..., ge=0.0, le=24.0, description="Daily machine operating hours (max 24.0)")
    temperature_c: float = Field(..., description="Ambient or process operating temperature (°C)")
    pressure_bar: float = Field(..., ge=0.0, description="System operating pressure (bar)")

    previous_co2_emission_kg: float = Field(..., ge=0.0, description="Prior day CO₂ emission baseline (kg)")

    @field_validator("machine_runtime_hours")
    @classmethod
    def validate_runtime(cls, v: float) -> float:
        if v < 0.0 or v > 24.0:
            raise ValueError("machine_runtime_hours must be between 0.0 and 24.0 hours for daily records")
        return v


class ScenarioAnalysisRequest(BaseModel):
    name: Optional[str] = Field(default="Custom Scenario", description="Scenario descriptive title")
    baseline: ScenarioInputs = Field(..., description="Current baseline operational conditions")
    scenario: ScenarioInputs = Field(..., description="Modified scenario operational conditions")


class ScenarioItem(BaseModel):
    name: str = Field(..., description="Unique scenario descriptive title")
    scenario: ScenarioInputs = Field(..., description="Modified scenario operational conditions")


class BatchScenarioRequest(BaseModel):
    baseline: ScenarioInputs = Field(..., description="Current baseline operational conditions")
    scenarios: List[ScenarioItem] = Field(..., min_length=1, description="List of scenarios to analyze")


class ComparisonDetail(BaseModel):
    difference_kg: float = Field(..., description="Absolute CO₂ difference: Scenario - Baseline (kg CO₂)")
    reduction_kg: float = Field(..., description="Positive CO₂ reduction amount if reduction (kg CO₂)")
    percentage_change: Optional[float] = Field(..., description="Percentage change in predicted CO₂ (%)")
    direction: str = Field(..., description="Direction: 'reduction', 'increase', or 'no_change'")
    baseline_co2_intensity: Optional[float] = Field(..., description="Baseline CO₂ intensity (kg CO₂ / Unit)")
    scenario_co2_intensity: Optional[float] = Field(..., description="Scenario CO₂ intensity (kg CO₂ / Unit)")
    intensity_change: Optional[float] = Field(..., description="Change in emission intensity")


class ValidationSummary(BaseModel):
    out_of_training_range: bool = Field(..., description="True if any scenario input exceeds historical training ranges")
    warnings: List[str] = Field(default=[], description="List of human-readable range warnings")


class SinglePredictionDetail(BaseModel):
    prediction_kg: float = Field(..., description="Predicted CO₂ emission in kg")
    production_units: float = Field(..., description="Finished production output")
    co2_intensity: Optional[float] = Field(..., description="CO₂ emission intensity (kg / Unit)")


class ScenarioAnalysisResponse(BaseModel):
    scenario_name: str = Field(default="Custom Scenario")
    model: Dict[str, Any] = Field(..., description="Model version details")
    baseline: SinglePredictionDetail
    scenario: SinglePredictionDetail
    comparison: ComparisonDetail
    validation: ValidationSummary
    shap_explanation: Optional[Dict[str, Any]] = Field(default=None, description="SHAP contribution changes")


class BatchScenarioResponse(BaseModel):
    model: Dict[str, Any]
    baseline: SinglePredictionDetail
    scenarios: List[ScenarioAnalysisResponse]
    best_scenario_name: Optional[str] = Field(..., description="Scenario achieving lowest predicted CO₂ emissions")
