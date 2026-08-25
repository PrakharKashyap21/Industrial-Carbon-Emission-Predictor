from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator


class ExplanationRequest(BaseModel):
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


class ContributorDetail(BaseModel):
    feature: str = Field(..., description="Raw feature key name")
    display_name: str = Field(..., description="Human-readable title")
    unit: str = Field(..., description="Measurement unit")
    description: str = Field(..., description="Feature description")
    input_value: Any = Field(..., description="Provided input value")
    shap_value: float = Field(..., description="SHAP feature contribution value in kg CO₂")
    direction: str = Field(..., description="Contribution direction: 'positive', 'negative', or 'neutral'")


class ModelInfo(BaseModel):
    name: str = Field(..., description="Selected production model algorithm")
    version: str = Field(..., description="Model artifact version tag")
    rf_weight: float = Field(..., description="Random Forest weight in ensemble")
    xgb_weight: float = Field(..., description="XGBoost weight in ensemble")


class PredictionInfo(BaseModel):
    co2_kg: float = Field(..., description="Final predicted CO₂ emission in kg")
    random_forest_kg: float = Field(..., description="Random Forest component prediction in kg")
    xgboost_kg: float = Field(..., description="XGBoost component prediction in kg")


class ExplanationInfo(BaseModel):
    base_value_kg: float = Field(..., description="Model baseline expected value in kg CO₂")
    additive_check: bool = Field(..., description="True if base_value + sum(shap) ≈ prediction within tolerance")
    difference: float = Field(..., description="Absolute numerical difference between base+sum(shap) and prediction")
    summary_text: str = Field(..., description="Natural language explanation summary")


class ExplanationResponse(BaseModel):
    model: ModelInfo
    prediction: PredictionInfo
    explanation: ExplanationInfo
    contributors: List[ContributorDetail]
    top_positive: List[ContributorDetail]
    top_negative: List[ContributorDetail]
